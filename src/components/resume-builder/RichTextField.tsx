"use client";

import React, { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import { Box, ButtonBase, CircularProgress, Typography } from "@mui/material";
import { AI_ACTIONS, AiAction, isBlankHtml, htmlToText, rbAsset, textToHtml, wordCount } from "./resume-data";
import { AiContext, aiAssist } from "./resume-service";
import { GhostButton, RB, RTEXT, RbIcon, gradientText } from "./rb-ui";

// ─── Toolbar ───────────────────────────────────────────────────────────────
type ToolId = "bold" | "italic" | "underline" | "center" | "left" | "right" | "justify" | "bulletList" | "orderedList";

const TOOL_GROUPS: { id: ToolId; title: string; icon: string }[][] = [
    [
        { id: "bold", title: "Bold", icon: "fmt-bold.svg" },
        { id: "italic", title: "Italic", icon: "fmt-italic.svg" },
        { id: "underline", title: "Underline", icon: "fmt-underline.svg" },
    ],
    [
        { id: "center", title: "Align center", icon: "fmt-align-center.svg" },
        { id: "left", title: "Align left", icon: "fmt-align-left.svg" },
        { id: "right", title: "Align right", icon: "fmt-align-right.svg" },
        { id: "justify", title: "Justify", icon: "fmt-align-justify.svg" },
    ],
    [
        { id: "bulletList", title: "Bulleted list", icon: "fmt-list-bulleted.svg" },
        { id: "orderedList", title: "Numbered list", icon: "fmt-list-numbered.svg" },
    ],
];

function runTool(editor: Editor, id: ToolId) {
    const chain = editor.chain().focus();
    switch (id) {
        case "bold":
            return chain.toggleBold().run();
        case "italic":
            return chain.toggleItalic().run();
        case "underline":
            return chain.toggleUnderline().run();
        case "bulletList":
            return chain.toggleBulletList().run();
        case "orderedList":
            return chain.toggleOrderedList().run();
        default:
            return chain.setTextAlign(id).run();
    }
}

const isToolActive = (editor: Editor, id: ToolId) =>
    id === "center" || id === "left" || id === "right" || id === "justify" ? editor.isActive({ textAlign: id }) : editor.isActive(id);

function Toolbar({ editor }: { editor: Editor | null }) {
    const active = useEditorState({
        editor,
        selector: ({ editor: e }) =>
            e ? Object.fromEntries(TOOL_GROUPS.flat().map((t) => [t.id, isToolActive(e, t.id)])) : ({} as Record<string, boolean>),
    });

    return (
        <Box role="toolbar" aria-label="Formatting" sx={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {TOOL_GROUPS.map((group, gi) => (
                <React.Fragment key={gi}>
                    {gi > 0 && (
                        <Box aria-hidden sx={{ width: "1px", height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Box component="img" src={rbAsset("fmt-separator.svg")} alt="" sx={{ width: 16, height: "1px", maxWidth: "none", transform: "rotate(90deg)", flexShrink: 0 }} />
                        </Box>
                    )}
                    {group.map((tool) => (
                        <ButtonBase
                            key={tool.id}
                            title={tool.title}
                            aria-label={tool.title}
                            aria-pressed={!!active?.[tool.id]}
                            disabled={!editor}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => editor && runTool(editor, tool.id)}
                            sx={{
                                width: 16,
                                height: 16,
                                borderRadius: "2px",
                                outline: active?.[tool.id] ? "3px solid rgba(255,255,255,0.16)" : "none",
                                bgcolor: active?.[tool.id] ? "rgba(255,255,255,0.16)" : "transparent",
                                "&:hover": { bgcolor: "rgba(255,255,255,0.12)", outline: "3px solid rgba(255,255,255,0.12)" },
                            }}
                        >
                            <RbIcon name={tool.icon} size={16} />
                        </ButtonBase>
                    ))}
                </React.Fragment>
            ))}
        </Box>
    );
}

function AiAssistButton({ onClick }: { onClick: () => void }) {
    return (
        <ButtonBase
            onClick={onClick}
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                height: 32,
                pl: "8px",
                pr: "12px",
                flexShrink: 0,
                borderRadius: "6px",
                border: "1px solid rgba(253,196,26,0.5)",
                boxShadow: "0 0 8px 0 rgba(255,255,255,0.12)",
                "&:hover": { borderColor: "rgba(253,196,26,0.8)" },
            }}
        >
            <RbIcon name="icon-ai-spark-16.svg" size={16} />
            <Box component="span" sx={{ ...RTEXT.med12, ...gradientText(RB.aiText), whiteSpace: "nowrap" }}>
                AI Assist
            </Box>
        </ButtonBase>
    );
}

// ─── AI assistant panel ────────────────────────────────────────────────────
type AiView = { kind: "menu" } | { kind: "result"; action: AiAction; attempt: number; loading: boolean; text: string };

function PanelHeader({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", width: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>{children}</Box>
            <ButtonBase aria-label="Close AI assistant" onClick={onClose} sx={{ borderRadius: "4px", "&:hover": { opacity: 0.75 } }}>
                <RbIcon name="icon-x-20.svg" size={20} />
            </ButtonBase>
        </Box>
    );
}

const insideBox = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    p: "16px",
    borderRadius: "10px",
    border: `2px solid ${RB.editorBorder}`,
    boxShadow: "0 0 8px 0 rgba(255,255,255,0.12)",
    width: "100%",
} as const;

export function AiAssistPanel({ html, context, onAccept, onClose }: { html: string; context: AiContext; onAccept: (html: string) => void; onClose: () => void }) {
    const [view, setView] = useState<AiView>({ kind: "menu" });
    const original = isBlankHtml(html) ? "" : htmlToText(html);

    const run = async (action: AiAction, attempt: number) => {
        setView({ kind: "result", action, attempt, loading: true, text: "" });
        const text = await aiAssist(action, html, context, attempt);
        setView((current) => (current.kind === "result" && current.action === action && current.attempt === attempt ? { ...current, loading: false, text } : current));
    };

    return (
        <Box role="region" aria-label="AI Assistant" sx={{ display: "flex", flexDirection: "column", gap: "16px", p: "16px", borderRadius: "12px", bgcolor: RB.aiPanelBg, width: "100%" }}>
            {view.kind === "menu" ? (
                <>
                    <PanelHeader onClose={onClose}>
                        <RbIcon name="icon-ai-spark-gold-16.svg" size={16} />
                        <Typography component="span" sx={{ ...RTEXT.med14, ...gradientText(RB.warmText), whiteSpace: "nowrap" }}>
                            AI Assistant
                        </Typography>
                    </PanelHeader>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: "16px" }}>
                        {AI_ACTIONS.map((action) => (
                            <ButtonBase
                                key={action.id}
                                onClick={() => run(action.id, 0)}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-start",
                                    gap: "12px",
                                    height: 63,
                                    p: "12px",
                                    borderRadius: "12px",
                                    bgcolor: RB.fieldBg,
                                    border: `1px solid ${RB.fieldBorder}`,
                                    textAlign: "left",
                                    minWidth: 0,
                                    "&:hover": { borderColor: RB.n600 },
                                }}
                            >
                                <RbIcon name="icon-chevron-down-28.svg" size={28} />
                                <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                                    <Typography component="span" sx={{ ...RTEXT.med16, color: RB.white, whiteSpace: "nowrap" }}>
                                        {action.title}
                                    </Typography>
                                    <Typography component="span" sx={{ ...RTEXT.reg12, color: RB.n300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {action.hint}
                                    </Typography>
                                </Box>
                            </ButtonBase>
                        ))}
                    </Box>
                </>
            ) : (
                <>
                    <PanelHeader onClose={onClose}>
                        <RbIcon name="icon-ai-spark-white-16.svg" size={16} />
                        <Typography component="span" sx={{ ...RTEXT.med14, color: RB.white, whiteSpace: "nowrap" }}>
                            {AI_ACTIONS.find((a) => a.id === view.action)?.title}
                        </Typography>
                    </PanelHeader>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <Box sx={{ ...insideBox, minHeight: 116 }} aria-live="polite" aria-busy={view.loading}>
                            {view.loading ? (
                                <Box sx={{ display: "flex", alignItems: "center", gap: "8px", ...RTEXT.med12, color: RB.n300 }}>
                                    <CircularProgress size={14} thickness={5} sx={{ color: RB.success400 }} />
                                    Generating improved version…
                                </Box>
                            ) : (
                                <>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <RbIcon name="icon-check-green-16.svg" size={16} />
                                        <Typography component="span" sx={{ ...RTEXT.med12, color: RB.success400 }}>
                                            Improved Version
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ ...RTEXT.med14, color: RB.n100 }}>{view.text}</Typography>
                                </>
                            )}
                        </Box>
                        {original && (
                            <Box sx={insideBox}>
                                <Typography component="span" sx={{ ...RTEXT.semi12, color: RB.n500 }}>
                                    Original
                                </Typography>
                                <Typography sx={{ ...RTEXT.med14, color: RB.n400, textDecoration: "line-through" }}>{original}</Typography>
                            </Box>
                        )}
                        <Box sx={{ display: "flex", gap: "16px" }}>
                            <GhostButton borderWidth={1} disabled={view.loading} onClick={() => run(view.action, view.attempt + 1)} sx={{ flex: 1, minWidth: 0 }}>
                                Retry
                            </GhostButton>
                            <ButtonBase
                                disabled={view.loading || !view.text}
                                onClick={() => {
                                    onAccept(textToHtml(view.text));
                                    onClose();
                                }}
                                sx={{
                                    flex: 1,
                                    minWidth: 0,
                                    height: 44,
                                    px: "16px",
                                    borderRadius: "10px",
                                    backgroundImage: RB.acceptBg,
                                    filter: "drop-shadow(0 0 4px rgba(255,255,255,0.12))",
                                    ...RTEXT.interMed14,
                                    color: RB.white,
                                    "&:hover": { filter: "drop-shadow(0 0 4px rgba(255,255,255,0.12)) brightness(1.12)" },
                                    "&.Mui-disabled": { opacity: 0.5, color: RB.white },
                                }}
                            >
                                Accept
                            </ButtonBase>
                        </Box>
                    </Box>
                </>
            )}
        </Box>
    );
}

// ─── Field ─────────────────────────────────────────────────────────────────
/**
 * Rich text input with the Figma toolbar and AI Assist.
 * `summary` is the large standalone editor (with word counter); `entry` is the compact
 * editor inside education / experience cards.
 */
export function RichTextField({
    label,
    value,
    onChange,
    placeholder,
    variant = "entry",
    wordLimit,
    aiContext,
}: {
    label?: string;
    value: string;
    onChange: (html: string) => void;
    placeholder: string;
    variant?: "summary" | "entry";
    wordLimit?: number;
    aiContext: AiContext;
}) {
    const [aiOpen, setAiOpen] = useState(false);
    const labelId = React.useId();
    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);
    const editor = useEditor({
        immediatelyRender: false,
        content: value || "",
        extensions: [
            StarterKit.configure({ heading: false, codeBlock: false, blockquote: false, code: false, horizontalRule: false, strike: false, link: false }),
            TextAlign.configure({ types: ["paragraph"] }),
            Placeholder.configure({ placeholder }),
        ],
        editorProps: { attributes: { "aria-multiline": "true", role: "textbox", ...(label ? { "aria-labelledby": labelId } : { "aria-label": placeholder }) } },
        onUpdate: ({ editor: e }) => onChangeRef.current(e.isEmpty ? "" : e.getHTML()),
    });

    // Keep the editor in sync when the value changes from outside (AI accept, reset).
    useEffect(() => {
        if (!editor) return;
        const current = editor.isEmpty ? "" : editor.getHTML();
        if (current !== value) editor.commands.setContent(value || "", { emitUpdate: false });
    }, [editor, value]);

    const words = wordLimit ? wordCount(value) : 0;
    const summary = variant === "summary";

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: summary ? "8px" : "12px", width: "100%" }}>
            {label && (
                <Typography id={labelId} sx={{ ...RTEXT.reg12, color: RB.n300 }}>
                    {label}
                </Typography>
            )}
            <Box
                onClick={() => editor?.commands.focus()}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    height: summary ? 231 : 158,
                    p: summary ? "16px" : "12px",
                    cursor: "text",
                    transition: "border-color .15s ease",
                    ...(summary
                        ? { borderRadius: "10px", border: `2px solid ${RB.editorBorder}`, boxShadow: "0 0 8px 0 rgba(255,255,255,0.12)", "&:focus-within": { borderColor: "rgba(147,169,226,0.5)" } }
                        : { borderRadius: "12px", bgcolor: RB.fieldBg, border: `1px solid ${RB.fieldBorder}`, "&:focus-within": { borderColor: RB.primary } }),
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", minHeight: aiOpen ? 16 : 32 }} onClick={(event) => event.stopPropagation()}>
                    <Toolbar editor={editor} />
                    {!aiOpen && <AiAssistButton onClick={() => setAiOpen(true)} />}
                </Box>
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: "auto",
                        scrollbarWidth: "thin",
                        scrollbarColor: "rgba(255,255,255,0.12) transparent",
                        "& .ProseMirror": { outline: "none", minHeight: "100%", ...RTEXT.med14, color: RB.n100 },
                        "& .ProseMirror p": { m: 0 },
                        "& .ProseMirror ul, & .ProseMirror ol": { m: 0, pl: "20px" },
                        "& .ProseMirror p.is-editor-empty:first-of-type::before": {
                            content: "attr(data-placeholder)",
                            float: "left",
                            height: 0,
                            color: RB.n600,
                            pointerEvents: "none",
                        },
                    }}
                >
                    <EditorContent editor={editor} />
                </Box>
            </Box>
            {wordLimit && (
                <Typography sx={{ ...RTEXT.med14, color: words > wordLimit ? RB.error : RB.n500, textAlign: "right" }} aria-live="polite">
                    {words}/{wordLimit} words
                </Typography>
            )}
            {aiOpen && (
                <Box sx={{ mt: summary ? "16px" : 0 }}>
                    <AiAssistPanel html={value} context={aiContext} onAccept={onChange} onClose={() => setAiOpen(false)} />
                </Box>
            )}
        </Box>
    );
}
