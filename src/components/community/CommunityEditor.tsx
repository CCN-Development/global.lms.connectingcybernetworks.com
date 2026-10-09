"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { EditorContent, Mark, mergeAttributes, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Box, ButtonBase, Paper, Popover, Popper, Tooltip, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { isRichTextEmpty } from "@/components/editor/RichTextEditor";
import { Attachment, Author, CC, MENTIONABLE, uid } from "./community-data";
import { darkScroll, dropdownPaperSx, Icon, LmsButton, TEXT, UserAvatar } from "./community-ui";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type ToolId = "bold" | "italic" | "underline" | "orderedList" | "bulletList" | "image" | "link";

const TOOLS: { id: ToolId; title: string; icon: string }[] = [
    { id: "bold", title: "Bold", icon: "tb-bold.svg" },
    { id: "italic", title: "Italic", icon: "tb-italic.svg" },
    { id: "underline", title: "Underline", icon: "tb-underline.svg" },
    { id: "orderedList", title: "Numbered list", icon: "tb-ordered-list.svg" },
    { id: "bulletList", title: "Bullet list", icon: "tb-bullet-list.svg" },
    { id: "image", title: "Attach image", icon: "tb-image.svg" },
    { id: "link", title: "Link", icon: "tb-link.svg" },
];

/** Mentions are stored as `<span class="mention">@name</span>`. */
const MentionMark = Mark.create({
    name: "mention",
    inclusive: false,
    excludes: "_",
    parseHTML() {
        return [{ tag: "span.mention" }];
    },
    renderHTML({ HTMLAttributes }) {
        return ["span", mergeAttributes(HTMLAttributes, { class: "mention" }), 0];
    },
});

interface MentionState {
    from: number;
    to: number;
    query: string;
    rect: DOMRect;
}

function findMention(editor: Editor): MentionState | null {
    const { selection } = editor.state;
    if (!selection.empty) return null;
    const { $from } = selection;
    if (editor.isActive("mention")) return null;
    const before = $from.parent.textBetween(Math.max(0, $from.parentOffset - 40), $from.parentOffset, undefined, "\ufffc");
    const match = /(?:^|\s)@([a-zA-Z]{0,20})$/.exec(before);
    if (!match) return null;
    const from = $from.pos - match[1].length - 1;
    const start = editor.view.coordsAtPos(from);
    return {
        from,
        to: $from.pos,
        query: match[1],
        rect: new DOMRect(start.left, start.top, 1, start.bottom - start.top),
    };
}

interface CommunityEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder: string;
    attachments: Attachment[];
    setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
    height?: number;
    autoFocus?: boolean;
}

export default function CommunityEditor({
    value,
    onChange,
    placeholder,
    attachments,
    setAttachments,
    height = 298,
    autoFocus,
}: CommunityEditorProps) {
    const fileRef = useRef<HTMLInputElement>(null);
    const timers = useRef<number[]>([]);
    const [linkAnchor, setLinkAnchor] = useState<HTMLElement | null>(null);
    const [linkUrl, setLinkUrl] = useState("");
    const [mention, setMention] = useState<MentionState | null>(null);
    const [mentionIndex, setMentionIndex] = useState(0);

    const suggestions: Author[] = mention
        ? MENTIONABLE.filter((p) => p.name.toLowerCase().includes(mention.query.toLowerCase())).slice(0, 5)
        : [];

    // Refs give the ProseMirror key handler access to the latest mention state.
    const mentionRef = useRef<{ mention: MentionState | null; suggestions: Author[]; mentionIndex: number }>({
        mention: null,
        suggestions: [],
        mentionIndex: 0,
    });
    useLayoutEffect(() => {
        mentionRef.current = { mention, suggestions, mentionIndex };
    });

    const editorRef = useRef<Editor | null>(null);

    const insertMention = (person: Author) => {
        const editor = editorRef.current;
        const current = mentionRef.current.mention;
        if (!editor || !current) return;
        editor
            .chain()
            .focus()
            .insertContentAt({ from: current.from, to: current.to }, [
                { type: "text", text: `@${person.name.toLowerCase()}`, marks: [{ type: "mention" }] },
                { type: "text", text: " " },
            ])
            .run();
        setMention(null);
    };

    const syncMention = (editor: Editor) => {
        const next = findMention(editor);
        if (next && next.query !== mentionRef.current.mention?.query) setMentionIndex(0);
        setMention(next);
    };

    const editor = useEditor({
        immediatelyRender: false,
        autofocus: autoFocus ? "end" : false,
        content: value || "",
        extensions: [
            StarterKit.configure({
                heading: false,
                codeBlock: false,
                link: {
                    openOnClick: false,
                    autolink: true,
                    protocols: ["http", "https", "mailto"],
                    HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
                },
            }),
            Placeholder.configure({ placeholder }),
            MentionMark,
        ],
        editorProps: {
            attributes: { class: "rich-text community-rich community-editor", "aria-label": placeholder, role: "textbox", "aria-multiline": "true" },
            handleKeyDown: (_view, event) => {
                const { mention: active, suggestions: list, mentionIndex: index } = mentionRef.current;
                if (!active || list.length === 0) return false;
                if (event.key === "ArrowDown") {
                    setMentionIndex((index + 1) % list.length);
                    return true;
                }
                if (event.key === "ArrowUp") {
                    setMentionIndex((index - 1 + list.length) % list.length);
                    return true;
                }
                if (event.key === "Enter" || event.key === "Tab") {
                    insertMention(list[index]);
                    return true;
                }
                if (event.key === "Escape") {
                    setMention(null);
                    return true;
                }
                return false;
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(isRichTextEmpty(html) ? "" : html);
            syncMention(editor);
        },
        onSelectionUpdate: ({ editor }) => syncMention(editor),
        onBlur: () => window.setTimeout(() => setMention(null), 150),
    });
    useLayoutEffect(() => {
        editorRef.current = editor;
    }, [editor]);

    const state = useEditorState({
        editor,
        selector: ({ editor }) =>
            editor
                ? {
                    bold: editor.isActive("bold"),
                    italic: editor.isActive("italic"),
                    underline: editor.isActive("underline"),
                    orderedList: editor.isActive("orderedList"),
                    bulletList: editor.isActive("bulletList"),
                    link: editor.isActive("link"),
                }
                : null,
    });

    useEffect(() => {
        if (!editor) return;
        const current = isRichTextEmpty(editor.getHTML()) ? "" : editor.getHTML();
        if ((value || "") !== current) editor.commands.setContent(value || "", { emitUpdate: false });
    }, [editor, value]);

    useEffect(() => () => timers.current.forEach((t) => window.clearInterval(t)), []);

    const simulateUpload = (id: string) => {
        const timer = window.setInterval(() => {
            setAttachments((prev) => {
                const target = prev.find((a) => a.id === id);
                if (!target || target.progress >= 100) {
                    window.clearInterval(timer);
                    return prev;
                }
                const progress = Math.min(100, target.progress + 15 + Math.round(Math.random() * 20));
                return prev.map((a) => (a.id === id ? { ...a, progress } : a));
            });
        }, 350);
        timers.current.push(timer);
    };

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        Array.from(files).forEach((file) => {
            if (!file.type.startsWith("image/")) return void toast.error(`${file.name} is not an image`);
            if (file.size > MAX_IMAGE_BYTES) return void toast.error(`${file.name} is larger than 5 MB`);
            const attachment: Attachment = { id: uid("att"), name: file.name, progress: 0, url: URL.createObjectURL(file) };
            setAttachments((prev) => [...prev, attachment]);
            simulateUpload(attachment.id);
        });
        if (fileRef.current) fileRef.current.value = "";
    };

    const removeAttachment = (id: string) =>
        setAttachments((prev) => {
            const target = prev.find((a) => a.id === id);
            if (target?.url?.startsWith("blob:")) URL.revokeObjectURL(target.url);
            return prev.filter((a) => a.id !== id);
        });

    const openLink = (anchor: HTMLElement) => {
        setLinkUrl(editor?.getAttributes("link").href ?? "");
        setLinkAnchor(anchor);
    };

    const applyLink = () => {
        if (!editor) return;
        const url = linkUrl.trim();
        const chain = editor.chain().focus().extendMarkRange("link");
        if (!url) chain.unsetLink().run();
        else {
            const href = /^(https?:|mailto:)/i.test(url) ? url : `https://${url}`;
            if (editor.state.selection.empty && !editor.isActive("link")) {
                editor.chain().focus().insertContent({ type: "text", text: url, marks: [{ type: "link", attrs: { href } }] }).insertContent(" ").run();
            } else chain.setLink({ href }).run();
        }
        setLinkAnchor(null);
    };

    const runTool = (id: ToolId, e: React.MouseEvent<HTMLElement>) => {
        const chain = editor?.chain().focus();
        if (id === "bold") chain?.toggleBold().run();
        else if (id === "italic") chain?.toggleItalic().run();
        else if (id === "underline") chain?.toggleUnderline().run();
        else if (id === "orderedList") chain?.toggleOrderedList().run();
        else if (id === "bulletList") chain?.toggleBulletList().run();
        else if (id === "image") fileRef.current?.click();
        else openLink(e.currentTarget);
    };

    return (
        <Box
            onClick={(e) => {
                if (e.target === e.currentTarget) editor?.commands.focus("end");
            }}
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                height,
                p: { xs: "16px", sm: "24px" },
                border: `1.2px solid ${CC.n700}`,
                borderRadius: "12px",
                transition: "border-color .15s ease",
                "&:focus-within": { borderColor: CC.n500 },
            }}
        >
            <Box role="toolbar" aria-label="Formatting" sx={{ display: "flex", flexWrap: "wrap", gap: { xs: "10px", sm: "19.2px" }, flexShrink: 0 }}>
                {TOOLS.map((tool) => {
                    const active = tool.id === "image" ? undefined : Boolean(state?.[tool.id]);
                    return (
                        <Tooltip key={tool.id} title={tool.title}>
                            <ButtonBase
                                aria-label={tool.title}
                                aria-pressed={active}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={(e) => runTool(tool.id, e)}
                                sx={{
                                    borderRadius: "4px",
                                    bgcolor: active ? "rgba(255,255,255,0.14)" : "transparent",
                                    "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                                }}
                            >
                                <Icon name={tool.icon} size={24} />
                            </ButtonBase>
                        </Tooltip>
                    );
                })}
                <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", cursor: "text", ...darkScroll }} onClick={(e) => {
                if (e.target === e.currentTarget) editor?.commands.focus("end");
            }}>
                <EditorContent editor={editor} />
                {attachments.length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {attachments.map((a) => (
                            <AttachmentChip key={a.id} attachment={a} onRemove={() => removeAttachment(a.id)} />
                        ))}
                    </Box>
                )}
            </Box>

            {/* @mention suggestions */}
            <Popper
                open={Boolean(mention && suggestions.length)}
                anchorEl={mention ? { getBoundingClientRect: () => mention.rect } : null}
                placement="bottom-start"
                style={{ zIndex: 1500 }}
            >
                <Paper elevation={0} sx={{ ...dropdownPaperSx, minWidth: 220 }} role="listbox" aria-label="Mention someone">
                    {suggestions.map((person, i) => (
                        <Box
                            key={person.id}
                            role="option"
                            aria-selected={i === mentionIndex}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                insertMention(person);
                            }}
                            onMouseEnter={() => setMentionIndex(i)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                px: "12px",
                                py: "8px",
                                cursor: "pointer",
                                bgcolor: i === mentionIndex ? CC.dropdownActive : "transparent",
                            }}
                        >
                            <UserAvatar author={person} size={24} />
                            <Typography sx={{ ...TEXT.med14, color: CC.n100 }}>{person.name}</Typography>
                        </Box>
                    ))}
                </Paper>
            </Popper>

            {/* Link editor */}
            <Popover
                open={Boolean(linkAnchor)}
                anchorEl={linkAnchor}
                onClose={() => setLinkAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                slotProps={{ paper: { sx: { ...dropdownPaperSx, p: "12px", width: 300 } } }}
            >
                    <Box
                        component="form"
                        onSubmit={(e: React.FormEvent) => {
                            e.preventDefault();
                            applyLink();
                        }}
                        sx={{ display: "flex", flexDirection: "column", gap: "10px" }}
                    >
                        <Typography sx={{ ...TEXT.reg12, color: CC.n500 }}>Paste or type a link</Typography>
                        <Box
                            component="input"
                            autoFocus
                            value={linkUrl}
                            placeholder="https://example.com"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLinkUrl(e.target.value)}
                            sx={{
                                height: 40,
                                px: "12px",
                                borderRadius: "8px",
                                border: `1px solid ${CC.n700}`,
                                bgcolor: "transparent",
                                color: CC.white,
                                ...TEXT.med14,
                                outline: "none",
                                "&:focus": { borderColor: CC.primary200 },
                                "&::placeholder": { color: CC.n500 },
                            }}
                        />
                        <LmsButton type="submit" sx={{ height: 36 }}>
                            {linkUrl.trim() ? "Apply link" : "Remove link"}
                        </LmsButton>
                    </Box>
            </Popover>
        </Box>
    );
}

export function AttachmentChip({ attachment, onRemove }: { attachment: Attachment; onRemove?: () => void }) {
    const done = attachment.progress >= 100;
    const content = (
        <>
            <Typography sx={{ ...TEXT.med14, color: CC.n100, whiteSpace: "nowrap" }}>{attachment.name}</Typography>
            <Typography sx={{ ...TEXT.med14, color: CC.n100, whiteSpace: "nowrap" }}>
                {done ? "Uploaded" : `Uploading (${attachment.progress}%)`}
            </Typography>
        </>
    );
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                px: "8px",
                py: "4px",
                borderRadius: "4px",
                bgcolor: "rgba(237,239,244,0.12)",
                maxWidth: "100%",
            }}
        >
            {attachment.url && done ? (
                <Box
                    component="a"
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: "flex", gap: "6px", textDecoration: "none", "&:hover p:first-of-type": { textDecoration: "underline" } }}
                >
                    {content}
                </Box>
            ) : (
                content
            )}
            {onRemove && (
                <ButtonBase
                    aria-label={`Remove ${attachment.name}`}
                    onClick={onRemove}
                    sx={{ borderRadius: "4px", "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } }}
                >
                    <Icon name="icon-chip-x.svg" size={20} />
                </ButtonBase>
            )}
        </Box>
    );
}
