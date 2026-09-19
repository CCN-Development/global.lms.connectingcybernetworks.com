"use client";

import React, { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Box, IconButton, ListItemIcon, Menu, MenuItem, Popover, Tooltip, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
    MdAdd, MdSentimentSatisfiedAlt, MdSend, MdMic, MdClose, MdDeleteOutline,
    MdImage, MdInsertDriveFile, MdFormatBold, MdFormatItalic, MdStrikethroughS,
    MdCode, MdFormatListBulleted, MdFormatListNumbered, MdFormatQuote, MdTextFields,
    MdLock, MdInsertPhoto, MdMicNone, MdStop, MdAudiotrack,
} from "react-icons/md";
import { C, senderColor } from "./theme";
import type { Attachment, Chat, Message, User } from "./types";
import { formatDuration, isHtmlEmpty, stripHtml } from "./helpers";
import EmojiPicker from "./EmojiPicker";

type Props = {
    chat: Chat;
    users: Record<string, User>;
    canSend: boolean;
    replyTo: Message | null;
    attachments: Attachment[];
    onCancelReply: () => void;
    onAddFiles: (files: FileList | File[]) => void;
    onAddVoiceNote: (seconds: number, url: string) => void;
    onRemoveAttachment: (id: string) => void;
    onSend: (html: string) => void;
};

export default function MessageComposer({
    chat, users, canSend, replyTo, attachments,
    onCancelReply, onAddFiles, onAddVoiceNote, onRemoveAttachment, onSend,
}: Props) {
    const [emojiEl, setEmojiEl] = useState<null | HTMLElement>(null);
    const [attachEl, setAttachEl] = useState<null | HTMLElement>(null);
    const [showFormatBar, setShowFormatBar] = useState(false);
    const [recording, setRecording] = useState(false);
    const [recSeconds, setRecSeconds] = useState(0);
    const imageInput = useRef<HTMLInputElement>(null);
    const fileInput = useRef<HTMLInputElement>(null);
    const sendRef = useRef<() => void>(() => { });
    const recorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const keepRecordingRef = useRef(true);
    const secondsRef = useRef(0);

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
        if (!recording) return;
        const t = setInterval(() => setRecSeconds((s) => s + 1), 1000);
        return () => clearInterval(t);
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

    const hasContent = !state?.empty || attachments.length > 0;

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
        return (
            <Box
                sx={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 0.8,
                    px: 2, py: 1.4, borderTop: `1px solid ${C.border}`, background: C.panelAlt,
                }}
            >
                <MdLock size={14} color={C.textMuted} />
                <Typography sx={{ fontSize: "0.72rem", color: C.textMuted }}>
                    Only admins can send messages in {chat.type === "community" ? "this community" : "this group"}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ borderTop: `1px solid ${C.border}`, background: C.panel, backdropFilter: "blur(12px)" }}>
            {/* Reply preview */}
            <AnimatePresence>
                {replyTo && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.16 }}
                        style={{ overflow: "hidden" }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 0.9, background: C.panelAlt }}>
                            <Box
                                sx={{
                                    flex: 1, minWidth: 0, borderLeft: `3px solid ${senderColor(replyTo.senderId)}`,
                                    pl: 1, py: 0.2,
                                }}
                            >
                                <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: senderColor(replyTo.senderId) }}>
                                    {replyTo.senderId === "me" ? "You" : users[replyTo.senderId]?.name}
                                </Typography>
                                <Typography sx={{ fontSize: "0.68rem", color: C.textSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {stripHtml(replyTo.html) || "Attachment"}
                                </Typography>
                            </Box>
                            <IconButton size="small" onClick={onCancelReply} sx={{ color: C.textMuted }}>
                                <MdClose size={16} />
                            </IconButton>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Attachment tray */}
            <AnimatePresence>
                {attachments.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.16 }}
                        style={{ overflow: "hidden" }}
                    >
                        <Box sx={{ display: "flex", gap: 1, px: 1.5, py: 1, overflowX: "auto", background: C.panelAlt }}>
                            {attachments.map((att) => (
                                <Box
                                    key={att.id}
                                    sx={{
                                        position: "relative", width: 66, height: 66, flexShrink: 0,
                                        borderRadius: "8px", overflow: "hidden", border: `1px solid ${C.border}`,
                                        background: C.raised, display: "flex", flexDirection: "column",
                                        alignItems: "center", justifyContent: "center", gap: 0.3, px: 0.5,
                                    }}
                                >
                                    {att.kind === "image" ? (
                                        <Box component="img" src={att.url} alt={att.name} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : att.kind === "video" ? (
                                        <Box
                                            component="video"
                                            src={att.url}
                                            muted
                                            playsInline
                                            preload="metadata"
                                            sx={{ width: "100%", height: "100%", objectFit: "cover", background: "#0b1020" }}
                                        />
                                    ) : att.kind === "audio" ? (
                                        <>
                                            <MdAudiotrack size={20} color={C.accentSoft} />
                                            <Typography sx={{ fontSize: "0.58rem", color: C.textSoft }}>
                                                {formatDuration(att.duration ?? 0)}
                                            </Typography>
                                        </>
                                    ) : (
                                        <>
                                            <MdInsertDriveFile size={20} color={C.accentSoft} />
                                            <Typography sx={{ fontSize: "0.55rem", color: C.textSoft, textAlign: "center", lineHeight: 1.1, wordBreak: "break-all" }}>
                                                {att.name.slice(0, 14)}
                                            </Typography>
                                        </>
                                    )}
                                    <IconButton
                                        size="small"
                                        onClick={() => onRemoveAttachment(att.id)}
                                        sx={{
                                            position: "absolute", top: 1, right: 1, width: 18, height: 18,
                                            background: "#0b1020", color: C.text, "&:hover": { background: C.danger },
                                        }}
                                    >
                                        <MdClose size={11} />
                                    </IconButton>
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
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.16 }}
                        style={{ overflow: "hidden" }}
                    >
                        <Box sx={{ display: "flex", gap: 0.3, px: 1.5, py: 0.6, borderTop: `1px solid ${C.borderSoft}` }}>
                            {[
                                { key: "bold", icon: <MdFormatBold size={15} />, title: "Bold", active: state?.bold, run: () => editor.chain().focus().toggleBold().run() },
                                { key: "italic", icon: <MdFormatItalic size={15} />, title: "Italic", active: state?.italic, run: () => editor.chain().focus().toggleItalic().run() },
                                { key: "strike", icon: <MdStrikethroughS size={15} />, title: "Strikethrough", active: state?.strike, run: () => editor.chain().focus().toggleStrike().run() },
                                { key: "code", icon: <MdCode size={15} />, title: "Monospace", active: state?.code, run: () => editor.chain().focus().toggleCode().run() },
                                { key: "bullet", icon: <MdFormatListBulleted size={15} />, title: "Bullet list", active: state?.bullet, run: () => editor.chain().focus().toggleBulletList().run() },
                                { key: "ordered", icon: <MdFormatListNumbered size={15} />, title: "Numbered list", active: state?.ordered, run: () => editor.chain().focus().toggleOrderedList().run() },
                                { key: "quote", icon: <MdFormatQuote size={15} />, title: "Quote", active: state?.quote, run: () => editor.chain().focus().toggleBlockquote().run() },
                            ].map((b) => (
                                <Tooltip key={b.key} title={b.title} arrow>
                                    <IconButton
                                        size="small"
                                        onClick={b.run}
                                        sx={{
                                            width: 26, height: 26, borderRadius: "6px",
                                            color: b.active ? "#ffffff" : C.textSoft,
                                            background: b.active ? C.accentDark : "transparent",
                                            "&:hover": { background: b.active ? C.accentDark : C.raised },
                                        }}
                                    >
                                        {b.icon}
                                    </IconButton>
                                </Tooltip>
                            ))}
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input row */}
            <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.5, px: 1.2, py: 1 }}>
                {recording ? (
                    <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1.2, px: 1.5, py: 1, borderRadius: "22px", background: C.panelAlt, border: `1px solid ${C.danger}` }}>
                        <Box sx={{ width: 9, height: 9, borderRadius: "50%", background: C.danger, animation: "chat-rec-pulse 1.1s infinite" }} />
                        <Typography sx={{ fontSize: "0.75rem", color: C.text, fontWeight: 600 }}>
                            Recording {formatDuration(recSeconds)}
                        </Typography>
                        <Box sx={{ flex: 1 }} />
                        <Tooltip title="Cancel" arrow>
                            <IconButton size="small" onClick={() => stopRecording(false)} sx={{ color: C.danger }}>
                                <MdDeleteOutline size={18} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Stop & attach" arrow>
                            <IconButton size="small" onClick={() => stopRecording(true)} sx={{ color: C.accentSoft }}>
                                <MdStop size={18} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                ) : (
                    <>
                        <Tooltip title="Attach" arrow>
                            <IconButton size="small" onClick={(e) => setAttachEl(e.currentTarget)} sx={{ color: C.textSoft, "&:hover": { color: C.text } }}>
                                <MdAdd size={20} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Emoji" arrow>
                            <IconButton size="small" onClick={(e) => setEmojiEl(e.currentTarget)} sx={{ color: emojiEl ? C.accentSoft : C.textSoft, "&:hover": { color: C.text } }}>
                                <MdSentimentSatisfiedAlt size={20} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Formatting" arrow>
                            <IconButton
                                size="small"
                                onClick={() => setShowFormatBar((v) => !v)}
                                sx={{ color: showFormatBar ? C.accentSoft : C.textSoft, "&:hover": { color: C.text } }}
                            >
                                <MdTextFields size={19} />
                            </IconButton>
                        </Tooltip>

                        <Box
                            className="chat-composer"
                            onClick={() => editor?.commands.focus()}
                            sx={{
                                flex: 1, px: 1.6, py: 0.9, borderRadius: "18px", cursor: "text",
                                background: C.panelAlt, border: `1px solid ${C.border}`,
                                "&:focus-within": { borderColor: C.accent },
                                transition: "border-color 0.15s",
                            }}
                        >
                            <EditorContent editor={editor} />
                        </Box>

                        <Tooltip title={hasContent ? "Send" : "Voice message"} arrow>
                            <IconButton
                                onClick={() => (hasContent ? handleSend() : void startRecording())}
                                sx={{
                                    width: 38, height: 38, flexShrink: 0, color: "#ffffff",
                                    background: C.accentGrad,
                                    "&:hover": { filter: "brightness(1.15)", transform: "scale(1.05)" },
                                    transition: "all 0.15s",
                                }}
                            >
                                {hasContent ? <MdSend size={17} /> : <MdMic size={18} />}
                            </IconButton>
                        </Tooltip>
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
                slotProps={{
                    paper: {
                        sx: {
                            background: C.panelSolid, border: `1px solid ${C.border}`, borderRadius: "10px",
                            color: C.text, minWidth: 190,
                            "& .MuiMenuItem-root": { fontSize: "0.74rem", py: 0.8 },
                            "& .MuiListItemIcon-root": { minWidth: 28 },
                        },
                    },
                }}
            >
                <MenuItem onClick={() => { setAttachEl(null); imageInput.current?.click(); }}>
                    <ListItemIcon><MdInsertPhoto size={16} color="#38bdf8" /></ListItemIcon>Photos &amp; videos
                </MenuItem>
                <MenuItem onClick={() => { setAttachEl(null); fileInput.current?.click(); }}>
                    <ListItemIcon><MdInsertDriveFile size={16} color="#a78bfa" /></ListItemIcon>Document
                </MenuItem>
                <MenuItem onClick={() => { setAttachEl(null); void startRecording(); }}>
                    <ListItemIcon><MdMicNone size={16} color="#f43f5e" /></ListItemIcon>Voice message
                </MenuItem>
                <MenuItem onClick={() => { setAttachEl(null); imageInput.current?.click(); }}>
                    <ListItemIcon><MdImage size={16} color="#22c55e" /></ListItemIcon>Gallery
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
