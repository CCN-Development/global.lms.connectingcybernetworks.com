"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import {
    Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote,
    Heading1, Heading2, Link2, Link2Off, Undo2, Redo2, RemoveFormatting, Code,
} from "lucide-react";
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, TextField, ToggleButton, Tooltip,
} from "@mui/material";

const PRIMARY = "#009DFF";
const VIOLET = "#7c3aed";
const VIOLET_BG = "#ede9fe";

/** TipTap renders an empty doc as "<p></p>" — treat that as no value. */
export function isRichTextEmpty(html: string | null | undefined) {
    if (!html) return true;
    return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length === 0;
}

type Props = {
    label?: string;
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    disabled?: boolean;
    minHeight?: number;
};

export default function RichTextEditor({
    label,
    value,
    onChange,
    placeholder = "Write here…",
    disabled = false,
    minHeight = 140,
}: Props) {
    const [linkOpen, setLinkOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");

    const editor = useEditor({
        immediatelyRender: false,
        editable: !disabled,
        content: value || "",
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                codeBlock: false,
                link: {
                    openOnClick: false,
                    autolink: true,
                    protocols: ["http", "https", "mailto"],
                    HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
                },
            }),
            Placeholder.configure({ placeholder }),
        ],
        editorProps: {
            attributes: { class: "rich-text rte-input", style: `min-height:${minHeight}px` },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(isRichTextEmpty(html) ? "" : html);
        },
    });

    const state = useEditorState({
        editor,
        selector: ({ editor }) =>
            editor
                ? {
                    bold: editor.isActive("bold"),
                    italic: editor.isActive("italic"),
                    underline: editor.isActive("underline"),
                    strike: editor.isActive("strike"),
                    code: editor.isActive("code"),
                    h1: editor.isActive("heading", { level: 1 }),
                    h2: editor.isActive("heading", { level: 2 }),
                    bulletList: editor.isActive("bulletList"),
                    orderedList: editor.isActive("orderedList"),
                    blockquote: editor.isActive("blockquote"),
                    link: editor.isActive("link"),
                    canUndo: editor.can().undo(),
                    canRedo: editor.can().redo(),
                }
                : null,
    });

    /* Keep the editor in sync when the form resets or loads existing content. */
    useEffect(() => {
        if (!editor) return;
        const incoming = value || "";
        const current = isRichTextEmpty(editor.getHTML()) ? "" : editor.getHTML();
        if (incoming !== current) editor.commands.setContent(incoming, { emitUpdate: false });
    }, [editor, value]);

    useEffect(() => {
        editor?.setEditable(!disabled);
    }, [editor, disabled]);

    if (!editor) {
        return (
            <Box sx={{ border: "1px solid #e5e7eb", borderRadius: "8px", minHeight: minHeight + 44, bgcolor: "#ffffff" }} />
        );
    }

    const openLinkDialog = () => {
        setLinkUrl(editor.getAttributes("link").href ?? "");
        setLinkOpen(true);
    };

    const applyLink = () => {
        const url = linkUrl.trim();
        if (!url) {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
        } else {
            const href = /^(https?:|mailto:)/i.test(url) ? url : `https://${url}`;
            editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
        }
        setLinkOpen(false);
    };

    return (
        <Box className="flex flex-col gap-1">
            {label && <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</span>}

            <Box
                sx={{
                    border: `1px solid ${PRIMARY}`,
                    borderRadius: "8px",
                    bgcolor: "#ffffff",
                    overflow: "hidden",
                    opacity: disabled ? 0.7 : 1,
                }}
            >
                <Box
                    className="flex flex-wrap items-center gap-0.5 px-1.5 py-1"
                    sx={{ borderBottom: "1px solid #e5e7eb", bgcolor: "#f9fafb" }}
                >
                    <ToolButton title="Bold" active={state?.bold} disabled={disabled} onClick={() => editor.chain().focus().toggleBold().run()}>
                        <Bold size={13} />
                    </ToolButton>
                    <ToolButton title="Italic" active={state?.italic} disabled={disabled} onClick={() => editor.chain().focus().toggleItalic().run()}>
                        <Italic size={13} />
                    </ToolButton>
                    <ToolButton title="Underline" active={state?.underline} disabled={disabled} onClick={() => editor.chain().focus().toggleUnderline().run()}>
                        <Underline size={13} />
                    </ToolButton>
                    <ToolButton title="Strikethrough" active={state?.strike} disabled={disabled} onClick={() => editor.chain().focus().toggleStrike().run()}>
                        <Strikethrough size={13} />
                    </ToolButton>
                    <ToolButton title="Inline code" active={state?.code} disabled={disabled} onClick={() => editor.chain().focus().toggleCode().run()}>
                        <Code size={13} />
                    </ToolButton>

                    <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 0.5 }} />

                    <ToolButton title="Heading 1" active={state?.h1} disabled={disabled} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                        <Heading1 size={13} />
                    </ToolButton>
                    <ToolButton title="Heading 2" active={state?.h2} disabled={disabled} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                        <Heading2 size={13} />
                    </ToolButton>
                    <ToolButton title="Bullet list" active={state?.bulletList} disabled={disabled} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                        <List size={13} />
                    </ToolButton>
                    <ToolButton title="Numbered list" active={state?.orderedList} disabled={disabled} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                        <ListOrdered size={13} />
                    </ToolButton>
                    <ToolButton title="Quote" active={state?.blockquote} disabled={disabled} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                        <Quote size={13} />
                    </ToolButton>

                    <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 0.5 }} />

                    <ToolButton title="Add link" active={state?.link} disabled={disabled} onClick={openLinkDialog}>
                        <Link2 size={13} />
                    </ToolButton>
                    <ToolButton
                        title="Remove link"
                        disabled={disabled || !state?.link}
                        onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}
                    >
                        <Link2Off size={13} />
                    </ToolButton>
                    <ToolButton
                        title="Clear formatting"
                        disabled={disabled}
                        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                    >
                        <RemoveFormatting size={13} />
                    </ToolButton>

                    <Box sx={{ flexGrow: 1 }} />

                    <ToolButton title="Undo" disabled={disabled || !state?.canUndo} onClick={() => editor.chain().focus().undo().run()}>
                        <Undo2 size={13} />
                    </ToolButton>
                    <ToolButton title="Redo" disabled={disabled || !state?.canRedo} onClick={() => editor.chain().focus().redo().run()}>
                        <Redo2 size={13} />
                    </ToolButton>
                </Box>

                <EditorContent editor={editor} />
            </Box>

            <Dialog
                open={linkOpen}
                onClose={() => setLinkOpen(false)}
                fullWidth
                maxWidth="xs"
                slotProps={{ paper: { sx: { borderRadius: "12px", border: `1px solid ${VIOLET}` } } }}
            >
                <DialogTitle sx={{ fontSize: "0.85rem", fontWeight: 700, color: VIOLET, py: 1.5 }}>Link</DialogTitle>
                <DialogContent sx={{ pt: "8px !important" }}>
                    <TextField
                        autoFocus
                        fullWidth
                        size="small"
                        placeholder="https://example.com"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                applyLink();
                            }
                        }}
                        slotProps={{ input: { sx: { fontSize: "0.8rem", borderRadius: "8px" } } }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 1.5 }}>
                    <Button
                        onClick={() => setLinkOpen(false)}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: "none", borderRadius: "8px", fontSize: "0.75rem", borderColor: "#e5e7eb", color: "#374151" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={applyLink}
                        size="small"
                        variant="contained"
                        sx={{ textTransform: "none", borderRadius: "8px", fontSize: "0.75rem", bgcolor: VIOLET, "&:hover": { bgcolor: "#6d28d9" } }}
                    >
                        Apply
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

function ToolButton({
    title, active, disabled, onClick, children,
}: {
    title: string;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <Tooltip title={title}>
            <span>
                <ToggleButton
                    value={title}
                    selected={Boolean(active)}
                    disabled={disabled}
                    onMouseDown={(e) => e.preventDefault()}
                    onChange={onClick}
                    sx={{
                        p: 0.5,
                        border: "none",
                        borderRadius: "6px",
                        color: "#475569",
                        "&.Mui-selected": { bgcolor: VIOLET_BG, color: VIOLET, "&:hover": { bgcolor: VIOLET_BG } },
                        "&:hover": { bgcolor: "#e5e7eb" },
                    }}
                >
                    {children}
                </ToggleButton>
            </span>
        </Tooltip>
    );
}
