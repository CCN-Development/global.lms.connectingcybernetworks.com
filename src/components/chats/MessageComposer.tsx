"use client";

import React, { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Box, Menu, MenuItem, Popover, Tooltip } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
    MdAudiotrack, MdClose, MdCode, MdDeleteOutline, MdFormatBold, MdFormatItalic, MdFormatListBulleted,
    MdFormatListNumbered, MdFormatQuote, MdInsertDriveFile, MdInsertPhoto, MdLock, MdMicNone, MdStop,
    MdStrikethroughS, MdTextFields,
} from "react-icons/md";
import { C, gradientBorder, menuPaperSx, senderColor, t } from "./theme";
import type { Attachment, Chat, Message, User } from "./types";
import { formatDuration, isHtmlEmpty, stripHtml } from "./helpers";
import EmojiPicker from "./EmojiPicker";
import ChatIcon from "./ChatIcon";

type Props = {
    chat: Chat;
    users: Record<string, User>;
    canSend: boolean;
    lockReason: "announcement" | "blocked" | null;
    replyTo: Message | null;
    editing: Message | null;
    attachments: Attachment[];
    onCancelReply: () => void;
    onCancelEdit: () => void;
    onUnblock: () => void;
    onAddFiles: (files: FileList | File[]) => void;
    onAddVoiceNote: (seconds: number, url: string) => void;
    onRemoveAttachment: (id: string) => void;
    onSend: (html: string) => void;
};

const glass = {
    position: "relative",
    background: C.panel,
    backdropFilter: "blur(4px)",
    "&::before": gradientBorder(),
} as const;

const plainBtn = { display: "flex", p: 0, border: "none", background: "transparent", cursor: "pointer", flexShrink: 0 } as const;

export default function MessageComposer({
    chat, users, canSend, lockReason, replyTo, editing, attachments,
    onCancelReply, onCancelEdit, onUnblock, onAddFiles, onAddVoiceNote, onRemoveAttachment, onSend,
}: Props) {
    const [emojiEl, setEmojiEl] = useState<null | HTMLElement>(null);
    const [attachEl, setAttachEl] = useState<null | HTMLElement>(null);
    const [showFormatBar, setShowFormatBar] = useState(false);
    const [recording, setRecording] = useState(false);
    const [recSeconds, setRecSeconds] = useState(0);
    const imageInput = useRef<HTMLInputElement>(null);
    const fileInput = useRef<HTMLInputElement>(null);
    const sendRef = useRef<() => void>(() => { });
    const cancelRef = useRef<() => void>(() => { });
    const recorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const keepRecordingRef = useRef(true);
    const secondsRef = useRef(0);
    const wasEditingRef = useRef(false);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: false,
                horizontalRule: false,
                link: {
                    openOnClick: false,
                    autolink: true,
                    protocols: ["http", "https", "mailto"],
                    HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
                },
            }),
            Placeholder.configure({ placeholder: "Type a message" }),
        ],
        editorProps: {
            attributes: { class: "rich-text chat-rich" },
            handleKeyDown: (_view, event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendRef.current();
                    return true;
                }
                if (event.key === "Escape") {
                    cancelRef.current();
                    return true;
                }
                return false;
            },
            handlePaste: (_view, event) => {
                const files = Array.from(event.clipboardData?.files ?? []);
                if (files.length > 0) {
                    event.preventDefault();
                    onAddFiles(files);
                    return true;
                }
                return false;
            },
        },
    });

    const state = useEditorState({
        editor,
        selector: ({ editor }) =>
            editor
                ? {
                    empty: isHtmlEmpty(editor.getHTML()),
                    bold: editor.isActive("bold"),
                    italic: editor.isActive("italic"),
                    strike: editor.isActive("strike"),
                    code: editor.isActive("code"),
                    bullet: editor.isActive("bulletList"),
                    ordered: editor.isActive("orderedList"),
                    quote: editor.isActive("blockquote"),
                }
                : null,
    });

    useEffect(() => {
        cancelRef.current = () => {
            if (editing) onCancelEdit();
            else if (replyTo) onCancelReply();
        };
    });

    useEffect(() => {
        if (!recording) return;
        const timer = setInterval(() => setRecSeconds((s) => s + 1), 1000);
        return () => clearInterval(timer);
    }, [recording]);

    useEffect(() => {
        secondsRef.current = recSeconds;
    }, [recSeconds]);

    useEffect(() => () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
    }, []);

    useEffect(() => {
        if (replyTo) editor?.commands.focus();
    }, [replyTo, editor]);

    /* Editing loads the original text into the editor; leaving edit mode empties it again. */
    useEffect(() => {
        if (!editor) return;
        if (editing) {
            editor.commands.setContent(editing.html);
            editor.commands.focus("end");
            wasEditingRef.current = true;
        } else if (wasEditingRef.current) {
            editor.commands.clearContent();
            wasEditingRef.current = false;
        }
    }, [editing, editor]);

    const hasContent = (state ? !state.empty : false) || attachments.length > 0;

    const handleSend = () => {
        if (!canSend) return;
        const html = editor?.getHTML() ?? "";
        const clean = isHtmlEmpty(html) ? "" : html;
        if (!clean && attachments.length === 0) return;
        onSend(clean);
        editor?.commands.clearContent();
        editor?.commands.focus();
    };

    /* Enter-to-send runs through a ref so the handler is never stale. */
    useEffect(() => {
        sendRef.current = handleSend;
    });

    const startRecording = async () => {
        if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
            toast.error("Voice recording is not supported in this browser");
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"]
                .find((type) => MediaRecorder.isTypeSupported?.(type));
            const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

            streamRef.current = stream;
            chunksRef.current = [];
            keepRecordingRef.current = true;

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) chunksRef.current.push(event.data);
            };
            recorder.onstop = () => {
                stream.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
                const seconds = Math.max(1, secondsRef.current);
                setRecSeconds(0);
                if (keepRecordingRef.current && chunksRef.current.length > 0) {
                    const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
                    onAddVoiceNote(seconds, URL.createObjectURL(blob));
                }
                chunksRef.current = [];
            };

            recorderRef.current = recorder;
            recorder.start();
            setRecSeconds(0);
            setRecording(true);
        } catch {
            toast.error("Microphone access was blocked");
        }
    };

    const stopRecording = (send: boolean) => {
        keepRecordingRef.current = send;
        setRecording(false);
        const recorder = recorderRef.current;
        recorderRef.current = null;
        if (recorder && recorder.state !== "inactive") {
            recorder.stop();
        } else {
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            setRecSeconds(0);
        }
    };

    if (!canSend) {
        const kind = chat.type === "community" ? "this community" : "this group";
        return (
            <Box sx={{ flexShrink: 0, px: "24px" }}>
                <Box
                    sx={{
                        ...glass, display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
                        minHeight: 72, px: "24px", py: "12px", borderRadius: "99px",
                    }}
                >
                    <MdLock size={18} color={C.textMuted} />
                    <Box sx={t("inter", 14, 21, 400, C.textMuted)}>
                        {lockReason === "blocked"
                            ? `You blocked ${chat.name}. Unblock to send messages.`
                            : `Only admins can send messages in ${kind}`}
                    </Box>
                    {lockReason === "blocked" && (
                        <Box component="button" type="button" onClick={onUnblock} sx={{ ...plainBtn, ...t("lato", 14, 21, 700, C.accentSoft), "&:hover": { color: C.text } }}>
                            Unblock
                        </Box>
                    )}
                </Box>
            </Box>
        );
    }

    const banner = editing
        ? { title: "Editing message", color: C.accentSoft, preview: stripHtml(editing.html), onClose: onCancelEdit }
        : replyTo
            ? {
                title: replyTo.senderId === "me" ? "You" : users[replyTo.senderId]?.name ?? "",
                color: senderColor(replyTo.senderId),
                preview: stripHtml(replyTo.html) || "Attachment",
                onClose: onCancelReply,
            }
            : null;

    return (
        <Box sx={{ flexShrink: 0, px: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Reply / edit banner */}
            <AnimatePresence>
                {banner && (
                    <motion.div
                        key="banner"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.16 }}
                        style={{ overflow: "hidden" }}
                    >
                        <Box sx={{ ...glass, display: "flex", alignItems: "center", gap: "12px", px: "20px", py: "12px", borderRadius: "16px" }}>
                            <Box sx={{ flex: 1, minWidth: 0, borderLeft: `3px solid ${banner.color}`, pl: "12px" }}>
                                <Box sx={t("lato", 12, 18, 700, banner.color)}>{banner.title}</Box>
                                <Box sx={{ ...t("lato", 12, 18, 500, C.textSoft), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {banner.preview}
                                </Box>
                            </Box>
                            <Box component="button" type="button" aria-label="Cancel" onClick={banner.onClose} sx={plainBtn}>
                                <ChatIcon name="x" size={20} />
                            </Box>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Attachment tray */}
            <AnimatePresence>
                {attachments.length > 0 && (
                    <motion.div
                        key="tray"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.16 }}
                        style={{ overflow: "hidden" }}
                    >
                        <Box sx={{ ...glass, display: "flex", gap: "12px", px: "20px", py: "12px", overflowX: "auto", borderRadius: "16px" }}>
                            {attachments.map((att) => (
                                <Box
                                    key={att.id}
                                    sx={{
                                        position: "relative", width: 72, height: 72, flexShrink: 0, borderRadius: "8px", overflow: "hidden",
                                        background: C.chipBg, border: `1px solid ${C.borderSoft}`, display: "flex", flexDirection: "column",
                                        alignItems: "center", justifyContent: "center", gap: "2px", px: "4px",
                                    }}
                                >
                                    {att.kind === "image" ? (
                                        <Box component="img" src={att.url} alt={att.name} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : att.kind === "video" ? (
                                        <Box component="video" src={att.url} muted playsInline preload="metadata" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : att.kind === "audio" ? (
                                        <>
                                            <MdAudiotrack size={22} color={C.accentSoft} />
                                            <Box sx={t("lato", 12, 18, 500, C.textSoft)}>{formatDuration(att.duration ?? 0)}</Box>
                                        </>
                                    ) : (
                                        <>
                                            <MdInsertDriveFile size={22} color={C.accentSoft} />
                                            <Box sx={{ ...t("lato", 10, 12, 500, C.textSoft), textAlign: "center", wordBreak: "break-all" }}>{att.name.slice(0, 14)}</Box>
                                        </>
                                    )}
                                    <Box
                                        component="button"
                                        type="button"
                                        aria-label={`Remove ${att.name}`}
                                        onClick={() => onRemoveAttachment(att.id)}
                                        sx={{
                                            position: "absolute", top: 3, right: 3, width: 20, height: 20, borderRadius: "50%", border: "none", cursor: "pointer",
                                            background: "rgba(9,9,21,0.8)", color: C.text, display: "flex", alignItems: "center", justifyContent: "center",
                                            "&:hover": { background: C.danger },
                                        }}
                                    >
                                        <MdClose size={12} />
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Formatting bar */}
            <AnimatePresence>
                {showFormatBar && editor && (
                    <motion.div
                        key="format"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.16 }}
                        style={{ overflow: "hidden" }}
                    >
                        <Box sx={{ ...glass, display: "flex", gap: "4px", px: "16px", py: "8px", borderRadius: "99px", width: "fit-content" }}>
                            {[
                                { key: "bold", icon: <MdFormatBold size={18} />, title: "Bold", active: state?.bold, run: () => editor.chain().focus().toggleBold().run() },
                                { key: "italic", icon: <MdFormatItalic size={18} />, title: "Italic", active: state?.italic, run: () => editor.chain().focus().toggleItalic().run() },
                                { key: "strike", icon: <MdStrikethroughS size={18} />, title: "Strikethrough", active: state?.strike, run: () => editor.chain().focus().toggleStrike().run() },
                                { key: "code", icon: <MdCode size={18} />, title: "Monospace", active: state?.code, run: () => editor.chain().focus().toggleCode().run() },
                                { key: "bullet", icon: <MdFormatListBulleted size={18} />, title: "Bullet list", active: state?.bullet, run: () => editor.chain().focus().toggleBulletList().run() },
                                { key: "ordered", icon: <MdFormatListNumbered size={18} />, title: "Numbered list", active: state?.ordered, run: () => editor.chain().focus().toggleOrderedList().run() },
                                { key: "quote", icon: <MdFormatQuote size={18} />, title: "Quote", active: state?.quote, run: () => editor.chain().focus().toggleBlockquote().run() },
                            ].map((b) => (
                                <Tooltip key={b.key} title={b.title} arrow>
                                    <Box
                                        component="button"
                                        type="button"
                                        aria-label={b.title}
                                        onClick={b.run}
                                        sx={{
                                            width: 30, height: 30, borderRadius: "8px", border: "none", cursor: "pointer",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            color: b.active ? C.text : C.textSoft, background: b.active ? C.accent : "transparent",
                                            "&:hover": { background: b.active ? C.accent : C.hover },
                                        }}
                                    >
                                        {b.icon}
                                    </Box>
                                </Tooltip>
                            ))}
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input pill */}
            <Box
                sx={{
                    ...glass, display: "flex", alignItems: "center", gap: "24px", minHeight: 72, px: "24px", py: "12px",
                    borderRadius: "99px",
                }}
            >
                {recording ? (
                    <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: "50%", background: C.danger, animation: "chat-rec-pulse 1.1s infinite" }} />
                        <Box sx={t("inter", 16, 24, 400, C.text)}>Recording {formatDuration(recSeconds)}</Box>
                        <Box sx={{ flex: 1 }} />
                        <Tooltip title="Cancel" arrow>
                            <Box component="button" type="button" aria-label="Cancel recording" onClick={() => stopRecording(false)} sx={{ ...plainBtn, color: C.danger }}>
                                <MdDeleteOutline size={24} />
                            </Box>
                        </Tooltip>
                        <Tooltip title="Stop & attach" arrow>
                            <Box component="button" type="button" aria-label="Stop and attach recording" onClick={() => stopRecording(true)} sx={{ ...plainBtn, color: C.accentSoft }}>
                                <MdStop size={24} />
                            </Box>
                        </Tooltip>
                    </Box>
                ) : (
                    <>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                            <Tooltip title="Attach" arrow>
                                <Box component="button" type="button" aria-label="Attach" onClick={(e: React.MouseEvent<HTMLElement>) => setAttachEl(e.currentTarget)} sx={plainBtn}>
                                    <ChatIcon name="plus" size={24} />
                                </Box>
                            </Tooltip>
                            <Tooltip title="Emoji" arrow>
                                <Box component="button" type="button" aria-label="Emoji" onClick={(e: React.MouseEvent<HTMLElement>) => setEmojiEl(e.currentTarget)} sx={plainBtn}>
                                    <ChatIcon name="smile" size={24} color={emojiEl ? C.accentSoft : C.textSoft} />
                                </Box>
                            </Tooltip>
                        </Box>

                        <Box
                            className="chat-composer"
                            onClick={() => editor?.commands.focus()}
                            sx={{ flex: 1, minWidth: 0, cursor: "text" }}
                        >
                            <EditorContent editor={editor} />
                        </Box>

                        {hasContent ? (
                            <Tooltip title={editing ? "Save" : "Send"} arrow>
                                <Box
                                    component="button"
                                    type="button"
                                    aria-label={editing ? "Save edit" : "Send message"}
                                    onClick={handleSend}
                                    sx={{
                                        width: 40, height: 40, flexShrink: 0, borderRadius: "99px", border: "none", cursor: "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        backgroundImage: C.accentGrad, filter: "drop-shadow(0 0 4px rgba(255,255,255,0.12))",
                                        transition: "transform 0.15s ease",
                                        "&:hover": { transform: "scale(1.05)" },
                                    }}
                                >
                                    <Box sx={{ display: "flex", transform: "rotate(43.81deg)" }}>
                                        <ChatIcon name="send" size={16} color="#fff" />
                                    </Box>
                                </Box>
                            </Tooltip>
                        ) : (
                            <Tooltip title="Voice message" arrow>
                                <Box component="button" type="button" aria-label="Record voice message" onClick={() => void startRecording()} sx={plainBtn}>
                                    <ChatIcon name="mic" size={24} />
                                </Box>
                            </Tooltip>
                        )}
                    </>
                )}
            </Box>

            {/* Attach menu */}
            <Menu
                anchorEl={attachEl}
                open={Boolean(attachEl)}
                onClose={() => setAttachEl(null)}
                anchorOrigin={{ vertical: "top", horizontal: "left" }}
                transformOrigin={{ vertical: "bottom", horizontal: "left" }}
                slotProps={{ paper: { sx: { ...menuPaperSx, mb: "8px", minWidth: 210 } } }}
            >
                <MenuItem onClick={() => { setAttachEl(null); imageInput.current?.click(); }}>
                    <Box sx={{ display: "flex", color: C.textMuted }}><MdInsertPhoto size={20} /></Box>Photos &amp; videos
                </MenuItem>
                <MenuItem onClick={() => { setAttachEl(null); fileInput.current?.click(); }}>
                    <Box sx={{ display: "flex", color: C.textMuted }}><MdInsertDriveFile size={20} /></Box>Document
                </MenuItem>
                <MenuItem onClick={() => { setAttachEl(null); void startRecording(); }}>
                    <Box sx={{ display: "flex", color: C.textMuted }}><MdMicNone size={20} /></Box>Voice message
                </MenuItem>
                <MenuItem onClick={() => { setAttachEl(null); setShowFormatBar((v) => !v); }}>
                    <Box sx={{ display: "flex", color: C.textMuted }}><MdTextFields size={20} /></Box>
                    {showFormatBar ? "Hide formatting" : "Text formatting"}
                </MenuItem>
            </Menu>

            {/* Emoji popover */}
            <Popover
                open={Boolean(emojiEl)}
                anchorEl={emojiEl}
                onClose={() => setEmojiEl(null)}
                anchorOrigin={{ vertical: "top", horizontal: "left" }}
                transformOrigin={{ vertical: "bottom", horizontal: "left" }}
                slotProps={{ paper: { sx: { background: "transparent", boxShadow: "0 16px 40px rgba(0,0,0,0.55)", mb: 1 } } }}
            >
                <EmojiPicker onPick={(emoji) => editor?.chain().focus().insertContent(emoji).run()} />
            </Popover>

            <input
                ref={imageInput}
                type="file"
                accept="image/*,video/*"
                multiple
                hidden
                onChange={(e) => { if (e.target.files) onAddFiles(e.target.files); e.target.value = ""; }}
            />
            <input
                ref={fileInput}
                type="file"
                multiple
                hidden
                onChange={(e) => { if (e.target.files) onAddFiles(e.target.files); e.target.value = ""; }}
            />
        </Box>
    );
}
