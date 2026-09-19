"use client";

import React, { useMemo, useState } from "react";
import {
    Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton, InputBase, TextField, Tooltip, Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import {
    MdClose, MdDoneAll, MdDone, MdChevronLeft, MdChevronRight, MdSearch,
    MdStar, MdForward, MdDownload, MdInsertDriveFile, MdOpenInNew,
} from "react-icons/md";
import { C, scrollbarSx } from "./theme";
import type { Attachment, Chat, MediaItem, Message, MessageMap, User } from "./types";
import { canPreviewInline, fileAccent, stripHtml } from "./helpers";
import ChatAvatar from "./ChatAvatar";

const dialogPaperSx = {
    background: C.panelSolid,
    border: `1px solid ${C.border}`,
    borderRadius: "12px",
    color: C.text,
    backgroundImage: "none",
};

const fieldSx = {
    "& .MuiInputBase-root": { color: C.text, fontSize: "0.78rem", background: C.panelAlt },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: C.border },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: C.accent },
    "& .MuiInputLabel-root": { color: C.textMuted, fontSize: "0.78rem" },
    "& .MuiInputLabel-root.Mui-focused": { color: C.accentSoft },
};

/* ───────────────────────── Media viewer ───────────────────────── */
export function MediaLightbox({
    items, index, onClose, onNavigate,
}: { items: MediaItem[]; index: number; onClose: () => void; onNavigate: (i: number) => void }) {
    const open = items.length > 0 && index >= 0 && index < items.length;
    if (!open) return null;
    const current = items[index];

    return (
        <Dialog open fullScreen onClose={onClose} slotProps={{ paper: { sx: { background: "rgba(5,8,16,0.96)" } } }}>
            <Box sx={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 1, zIndex: 3 }}>
                <IconButton component="a" href={current.url} download={current.name ?? true} sx={{ color: C.text }}>
                    <MdDownload size={20} />
                </IconButton>
                <IconButton onClick={onClose} sx={{ color: C.text }}>
                    <MdClose size={22} />
                </IconButton>
            </Box>

            <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", px: { xs: 1, md: 7 } }}>
                {items.length > 1 && (
                    <IconButton
                        onClick={() => onNavigate((index - 1 + items.length) % items.length)}
                        sx={{ position: "absolute", left: 10, color: C.text, background: C.panelAlt, "&:hover": { background: C.raised } }}
                    >
                        <MdChevronLeft size={24} />
                    </IconButton>
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={current.url}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                        {current.kind === "video" ? (
                            <video
                                src={current.url}
                                controls
                                autoPlay
                                playsInline
                                style={{ maxHeight: "86vh", maxWidth: "92vw", borderRadius: 10, background: "#000000" }}
                            />
                        ) : (
                            <Box
                                component="img"
                                src={current.url}
                                alt={current.name ?? "attachment"}
                                sx={{ maxHeight: "86vh", maxWidth: "92vw", objectFit: "contain", borderRadius: "10px" }}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                {items.length > 1 && (
                    <IconButton
                        onClick={() => onNavigate((index + 1) % items.length)}
                        sx={{ position: "absolute", right: 10, color: C.text, background: C.panelAlt, "&:hover": { background: C.raised } }}
                    >
                        <MdChevronRight size={24} />
                    </IconButton>
                )}
            </Box>

            {items.length > 1 && (
                <Typography sx={{ position: "absolute", bottom: 16, width: "100%", textAlign: "center", fontSize: "0.72rem", color: C.textSoft }}>
                    {index + 1} / {items.length}
                </Typography>
            )}
        </Dialog>
    );
}

/* ───────────────────────── Document viewer ───────────────────────── */
export function DocumentPreviewDialog({
    attachment, onClose,
}: { attachment: Attachment | null; onClose: () => void }) {
    if (!attachment) return null;

    const accent = fileAccent(attachment.ext);
    const downloadable = Boolean(attachment.url) && attachment.url !== "#";
    const inline = canPreviewInline(attachment);
    const type = attachment.mime || (attachment.ext === "PDF" ? "application/pdf" : "text/plain");

    return (
        <Dialog
            open
            onClose={onClose}
            maxWidth="md"
            fullWidth
            slotProps={{ paper: { sx: { ...dialogPaperSx, height: inline ? "86vh" : "auto" } } }}
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, py: 1.2 }}>
                <Box
                    sx={{
                        width: 32, height: 32, borderRadius: "6px", background: accent, color: "#ffffff",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}
                >
                    <MdInsertDriveFile size={15} />
                    <Typography sx={{ fontSize: "0.42rem", fontWeight: 800, mt: "-2px" }}>
                        {(attachment.ext ?? "FILE").slice(0, 4)}
                    </Typography>
                </Box>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {attachment.name}
                    </Typography>
                    <Typography sx={{ fontSize: "0.64rem", color: C.textMuted }}>
                        {[attachment.ext, attachment.size].filter(Boolean).join(" · ")}
                    </Typography>
                </Box>

                {downloadable && (
                    <>
                        <Tooltip title="Open in new tab" arrow>
                            <IconButton size="small" component="a" href={attachment.url} target="_blank" rel="noopener noreferrer" sx={{ color: C.textSoft }}>
                                <MdOpenInNew size={16} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Download" arrow>
                            <IconButton size="small" component="a" href={attachment.url} download={attachment.name} sx={{ color: C.textSoft }}>
                                <MdDownload size={17} />
                            </IconButton>
                        </Tooltip>
                    </>
                )}
                <IconButton size="small" onClick={onClose} sx={{ color: C.textSoft }}><MdClose size={17} /></IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: inline ? 0 : 3, pb: 2 }}>
                {inline ? (
                    <Box
                        component="object"
                        data={attachment.url}
                        type={type}
                        sx={{ width: "100%", height: "100%", minHeight: "60vh", border: 0, background: "#ffffff" }}
                    >
                        <Box sx={{ p: 3, textAlign: "center" }}>
                            <Typography sx={{ fontSize: "0.76rem", color: C.textSoft }}>Preview is not supported here.</Typography>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ textAlign: "center", py: 3 }}>
                        <MdInsertDriveFile size={44} color={accent} />
                        <Typography sx={{ fontSize: "0.8rem", color: C.text, fontWeight: 600, mt: 1 }}>No preview available</Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: C.textMuted, mt: 0.4 }}>
                            {downloadable
                                ? "Download the file to open it in your desktop application."
                                : "This sample file has no content attached yet."}
                        </Typography>
                        {downloadable && (
                            <Button
                                component="a"
                                href={attachment.url}
                                download={attachment.name}
                                variant="contained"
                                startIcon={<MdDownload size={16} />}
                                sx={{ mt: 2, background: C.accentDark, fontSize: "0.74rem", textTransform: "none", "&:hover": { background: C.accent } }}
                            >
                                Download
                            </Button>
                        )}
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}

/* ───────────────────────── Message info ───────────────────────── */
export function MessageInfoDialog({
    message, users, onClose,
}: { message: Message | null; users: Record<string, User>; onClose: () => void }) {
    if (!message) return null;
    const read = message.readBy ?? [];
    const delivered = (message.deliveredTo ?? []).filter((d) => !read.some((r) => r.userId === d.userId));

    const Row = ({ userId, at }: { userId: string; at: string }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.6 }}>
            <ChatAvatar name={users[userId]?.name ?? "?"} avatar={users[userId]?.avatar} size={28} />
            <Typography sx={{ flex: 1, fontSize: "0.74rem", color: C.text }}>{users[userId]?.name ?? userId}</Typography>
            <Typography sx={{ fontSize: "0.65rem", color: C.textMuted }}>{at}</Typography>
        </Box>
    );

    return (
        <Dialog open onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: dialogPaperSx } }}>
            <DialogTitle sx={{ fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.4 }}>
                Message info
                <IconButton size="small" onClick={onClose} sx={{ color: C.textSoft }}><MdClose size={17} /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ pb: 2 }}>
                <Box sx={{ p: 1.2, borderRadius: "8px", background: C.bubbleOutSolid, mb: 1.5 }}>
                    <Typography sx={{ fontSize: "0.74rem", color: C.text }}>
                        {stripHtml(message.html) || message.attachments?.[0]?.name || "Attachment"}
                    </Typography>
                    <Typography sx={{ fontSize: "0.6rem", color: "#dbeafe", textAlign: "right", mt: 0.4 }}>{message.time}</Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 0.4 }}>
                    <MdDoneAll size={15} color={C.tick} />
                    <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: C.tick, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Read by {read.length}
                    </Typography>
                </Box>
                {read.length === 0
                    ? <Typography sx={{ fontSize: "0.7rem", color: C.textMuted, pb: 1 }}>No one has read this yet</Typography>
                    : read.map((r) => <Row key={r.userId} userId={r.userId} at={r.at} />)}

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 1.5, mb: 0.4 }}>
                    <MdDone size={15} color={C.textSoft} />
                    <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: C.textSoft, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Delivered to {delivered.length}
                    </Typography>
                </Box>
                {delivered.length === 0
                    ? <Typography sx={{ fontSize: "0.7rem", color: C.textMuted }}>No pending deliveries</Typography>
                    : delivered.map((d) => <Row key={d.userId} userId={d.userId} at={d.at} />)}
            </DialogContent>
        </Dialog>
    );
}

/* ───────────────────────── Forward ───────────────────────── */
export function ForwardDialog({
    open, chats, users, onClose, onForward,
}: {
    open: boolean;
    chats: Chat[];
    users: Record<string, User>;
    onClose: () => void;
    onForward: (chatIds: string[]) => void;
}) {
    const [selected, setSelected] = useState<string[]>([]);
    const [query, setQuery] = useState("");

    const list = chats.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));
    const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

    const close = () => { setSelected([]); setQuery(""); onClose(); };

    return (
        <Dialog open={open} onClose={close} maxWidth="xs" fullWidth slotProps={{ paper: { sx: dialogPaperSx } }}>
            <DialogTitle sx={{ fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 1, py: 1.4 }}>
                <MdForward size={18} color={C.accentSoft} /> Forward to
            </DialogTitle>
            <DialogContent sx={{ px: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, px: 1, py: 0.5, mb: 1, background: C.panelAlt, border: `1px solid ${C.border}`, borderRadius: "8px" }}>
                    <MdSearch size={15} color={C.textMuted} />
                    <InputBase value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" sx={{ fontSize: "0.74rem", color: C.text, flex: 1 }} />
                </Box>
                <Box sx={{ maxHeight: 300, overflowY: "auto", ...scrollbarSx }}>
                    {list.map((c) => (
                        <Box
                            key={c.id}
                            onClick={() => toggle(c.id)}
                            sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.6, px: 0.5, cursor: "pointer", borderRadius: "8px", "&:hover": { background: C.hover } }}
                        >
                            <Checkbox
                                checked={selected.includes(c.id)}
                                size="small"
                                sx={{ color: C.textMuted, "&.Mui-checked": { color: C.accentSoft }, p: 0.4 }}
                            />
                            <ChatAvatar name={c.name} avatar={c.avatar} type={c.type} size={30} />
                            <Typography sx={{ fontSize: "0.75rem", color: C.text }}>{c.name}</Typography>
                        </Box>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 2, pb: 1.6 }}>
                <Button onClick={close} sx={{ color: C.textSoft, fontSize: "0.74rem", textTransform: "none" }}>Cancel</Button>
                <Button
                    variant="contained"
                    disabled={selected.length === 0}
                    onClick={() => { onForward(selected); close(); }}
                    sx={{ background: C.accentDark, fontSize: "0.74rem", textTransform: "none", "&:hover": { background: C.accent } }}
                >
                    Send{selected.length > 0 ? ` (${selected.length})` : ""}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ───────────────────────── New chat / group / community ───────────────────────── */
export function NewChatDialog({
    type, users, existingChats, onClose, onCreate,
}: {
    type: "personal" | "group" | "community" | null;
    users: Record<string, User>;
    existingChats: Chat[];
    onClose: () => void;
    onCreate: (payload: { type: "personal" | "group" | "community"; name: string; description: string; memberIds: string[] }) => void;
}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selected, setSelected] = useState<string[]>([]);
    const [query, setQuery] = useState("");

    const contacts = useMemo(
        () => Object.values(users).filter((u) => u.id !== "me" && u.name.toLowerCase().includes(query.trim().toLowerCase())),
        [users, query],
    );

    if (!type) return null;
    const isPersonal = type === "personal";

    const close = () => { setName(""); setDescription(""); setSelected([]); setQuery(""); onClose(); };

    const submit = (memberIds: string[]) => {
        onCreate({ type, name: isPersonal ? users[memberIds[0]]?.name ?? "New chat" : name.trim(), description: description.trim(), memberIds });
        close();
    };

    const existingPersonal = (userId: string) =>
        existingChats.some((c) => c.type === "personal" && c.members.some((m) => m.userId === userId));

    return (
        <Dialog open onClose={close} maxWidth="xs" fullWidth slotProps={{ paper: { sx: dialogPaperSx } }}>
            <DialogTitle sx={{ fontSize: "0.85rem", fontWeight: 700, py: 1.4 }}>
                {isPersonal ? "New chat" : type === "group" ? "New group" : "New community"}
            </DialogTitle>
            <DialogContent sx={{ px: 2, display: "flex", flexDirection: "column", gap: 1.2 }}>
                {!isPersonal && (
                    <>
                        <TextField
                            size="small"
                            label={type === "group" ? "Group name" : "Community name"}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            sx={fieldSx}
                        />
                        <TextField
                            size="small"
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            minRows={2}
                            sx={fieldSx}
                        />
                    </>
                )}

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, px: 1, py: 0.5, background: C.panelAlt, border: `1px solid ${C.border}`, borderRadius: "8px" }}>
                    <MdSearch size={15} color={C.textMuted} />
                    <InputBase value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search contacts" sx={{ fontSize: "0.74rem", color: C.text, flex: 1 }} />
                </Box>

                <Box sx={{ maxHeight: 260, overflowY: "auto", ...scrollbarSx }}>
                    {contacts.map((u) => (
                        <Box
                            key={u.id}
                            onClick={() => (isPersonal ? submit([u.id]) : setSelected((s) => (s.includes(u.id) ? s.filter((x) => x !== u.id) : [...s, u.id])))}
                            sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.6, px: 0.5, cursor: "pointer", borderRadius: "8px", "&:hover": { background: C.hover } }}
                        >
                            {!isPersonal && (
                                <Checkbox
                                    checked={selected.includes(u.id)}
                                    size="small"
                                    sx={{ color: C.textMuted, "&.Mui-checked": { color: C.accentSoft }, p: 0.4 }}
                                />
                            )}
                            <ChatAvatar name={u.name} avatar={u.avatar} size={30} online={u.isOnline} />
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontSize: "0.75rem", color: C.text }}>{u.name}</Typography>
                                <Typography sx={{ fontSize: "0.62rem", color: C.textMuted }}>
                                    {isPersonal && existingPersonal(u.id) ? "Existing chat" : u.designation ?? u.about}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </DialogContent>
            {!isPersonal && (
                <DialogActions sx={{ px: 2, pb: 1.6 }}>
                    <Button onClick={close} sx={{ color: C.textSoft, fontSize: "0.74rem", textTransform: "none" }}>Cancel</Button>
                    <Button
                        variant="contained"
                        disabled={!name.trim() || selected.length === 0}
                        onClick={() => submit(selected)}
                        sx={{ background: C.accentDark, fontSize: "0.74rem", textTransform: "none", "&:hover": { background: C.accent } }}
                    >
                        Create
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
}

/* ───────────────────────── Add members ───────────────────────── */
export function AddMembersDialog({
    chat, users, onClose, onAdd,
}: {
    chat: Chat | null;
    users: Record<string, User>;
    onClose: () => void;
    onAdd: (chatId: string, userIds: string[]) => void;
}) {
    const [selected, setSelected] = useState<string[]>([]);
    const [query, setQuery] = useState("");

    const candidates = useMemo(() => {
        if (!chat) return [];
        return Object.values(users).filter(
            (u) =>
                u.id !== "me" &&
                !chat.members.some((m) => m.userId === u.id) &&
                u.name.toLowerCase().includes(query.trim().toLowerCase()),
        );
    }, [chat, users, query]);

    if (!chat) return null;
    const close = () => { setSelected([]); setQuery(""); onClose(); };

    return (
        <Dialog open onClose={close} maxWidth="xs" fullWidth slotProps={{ paper: { sx: dialogPaperSx } }}>
            <DialogTitle sx={{ fontSize: "0.85rem", fontWeight: 700, py: 1.4 }}>Add members to {chat.name}</DialogTitle>
            <DialogContent sx={{ px: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, px: 1, py: 0.5, mb: 1, background: C.panelAlt, border: `1px solid ${C.border}`, borderRadius: "8px" }}>
                    <MdSearch size={15} color={C.textMuted} />
                    <InputBase value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search contacts" sx={{ fontSize: "0.74rem", color: C.text, flex: 1 }} />
                </Box>
                <Box sx={{ maxHeight: 280, overflowY: "auto", ...scrollbarSx }}>
                    {candidates.length === 0 && (
                        <Typography sx={{ fontSize: "0.73rem", color: C.textMuted, py: 1 }}>Everyone is already a member</Typography>
                    )}
                    {candidates.map((u) => (
                        <Box
                            key={u.id}
                            onClick={() => setSelected((s) => (s.includes(u.id) ? s.filter((x) => x !== u.id) : [...s, u.id]))}
                            sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.6, px: 0.5, cursor: "pointer", borderRadius: "8px", "&:hover": { background: C.hover } }}
                        >
                            <Checkbox checked={selected.includes(u.id)} size="small" sx={{ color: C.textMuted, "&.Mui-checked": { color: C.accentSoft }, p: 0.4 }} />
                            <ChatAvatar name={u.name} avatar={u.avatar} size={30} online={u.isOnline} />
                            <Box>
                                <Typography sx={{ fontSize: "0.75rem", color: C.text }}>{u.name}</Typography>
                                <Typography sx={{ fontSize: "0.62rem", color: C.textMuted }}>{u.designation ?? u.about}</Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 2, pb: 1.6 }}>
                <Button onClick={close} sx={{ color: C.textSoft, fontSize: "0.74rem", textTransform: "none" }}>Cancel</Button>
                <Button
                    variant="contained"
                    disabled={selected.length === 0}
                    onClick={() => { onAdd(chat.id, selected); close(); }}
                    sx={{ background: C.accentDark, fontSize: "0.74rem", textTransform: "none", "&:hover": { background: C.accent } }}
                >
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ───────────────────────── Starred messages ───────────────────────── */
export function StarredDialog({
    open, chats, messages, users, onClose, onJump,
}: {
    open: boolean;
    chats: Chat[];
    messages: MessageMap;
    users: Record<string, User>;
    onClose: () => void;
    onJump: (chatId: string, messageId: string) => void;
}) {
    const starred = useMemo(
        () =>
            Object.entries(messages).flatMap(([chatId, list]) =>
                list.filter((m) => m.starred).map((m) => ({ chat: chats.find((c) => c.id === chatId), message: m })),
            ),
        [messages, chats],
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: dialogPaperSx } }}>
            <DialogTitle sx={{ fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 1, py: 1.4 }}>
                <MdStar size={18} color={C.star} /> Starred messages
            </DialogTitle>
            <DialogContent sx={{ px: 2, pb: 2 }}>
                {starred.length === 0 ? (
                    <Typography sx={{ fontSize: "0.74rem", color: C.textMuted }}>No starred messages yet</Typography>
                ) : (
                    starred.map(({ chat, message }) => (
                        <Box
                            key={message.id}
                            onClick={() => { if (chat) onJump(chat.id, message.id); onClose(); }}
                            sx={{
                                p: 1, mb: 0.8, cursor: "pointer", borderRadius: "8px",
                                background: C.panelAlt, border: `1px solid ${C.border}`,
                                "&:hover": { borderColor: C.accent },
                            }}
                        >
                            <Typography sx={{ fontSize: "0.65rem", color: C.accentSoft, fontWeight: 700 }}>{chat?.name}</Typography>
                            <Typography sx={{ fontSize: "0.73rem", color: C.text, mt: 0.2 }}>
                                {stripHtml(message.html) || message.attachments?.[0]?.name}
                            </Typography>
                            <Typography sx={{ fontSize: "0.6rem", color: C.textMuted, mt: 0.2 }}>
                                {message.senderId === "me" ? "You" : users[message.senderId]?.name} · {message.time}
                            </Typography>
                        </Box>
                    ))
                )}
            </DialogContent>
        </Dialog>
    );
}
