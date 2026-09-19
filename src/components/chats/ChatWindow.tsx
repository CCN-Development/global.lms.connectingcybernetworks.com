"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, IconButton, InputBase, ListItemIcon, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import {
    MdArrowBack, MdSearch, MdMoreVert, MdClose, MdPushPin, MdVideoCall, MdPhone,
    MdKeyboardArrowDown, MdKeyboardArrowUp, MdInfoOutline, MdVolumeOff, MdVolumeUp,
    MdDeleteOutline, MdStar, MdCampaign, MdCloudUpload, MdLock,
} from "react-icons/md";
import { C, scrollbarSx } from "./theme";
import type { Attachment, Chat, Message, User } from "./types";
import { chatSubtitle, counterpartOf, stripHtml } from "./helpers";
import ChatAvatar from "./ChatAvatar";
import MessageBubble, { type BubbleActions } from "./MessageBubble";
import MessageComposer from "./MessageComposer";

type Props = {
    chat: Chat;
    users: Record<string, User>;
    messages: Message[];
    canSend: boolean;
    infoOpen: boolean;
    unreadAnchorId: string | null;
    replyTo: Message | null;
    attachments: Attachment[];
    actions: BubbleActions;
    onBack: () => void;
    onToggleInfo: () => void;
    onToggleMute: (chatId: string) => void;
    onDeleteChat: (chatId: string) => void;
    onOpenStarred: () => void;
    onCancelReply: () => void;
    onAddFiles: (files: FileList | File[]) => void;
    onAddVoiceNote: (seconds: number, url: string) => void;
    onRemoveAttachment: (id: string) => void;
    onSend: (html: string) => void;
};

function TypingBubble({ name }: { name?: string }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, pl: 0.4, pb: 0.8 }}>
            <Box
                sx={{
                    display: "flex", alignItems: "center", gap: 0.5, px: 1.2, py: 0.8,
                    borderRadius: "3px 12px 12px 12px", background: C.bubbleIn, border: `1px solid ${C.border}`,
                }}
            >
                {[0, 1, 2].map((i) => (
                    <Box
                        key={i}
                        sx={{
                            width: 5, height: 5, borderRadius: "50%", background: C.accentSoft,
                            animation: `chat-typing-dot 1.2s ${i * 0.15}s infinite ease-in-out`,
                        }}
                    />
                ))}
                {name && <Typography sx={{ fontSize: "0.64rem", color: C.textMuted, ml: 0.5 }}>{name} is typing</Typography>}
            </Box>
        </Box>
    );
}

export default function ChatWindow({
    chat, users, messages, canSend, infoOpen, unreadAnchorId, replyTo, attachments, actions,
    onBack, onToggleInfo, onToggleMute, onDeleteChat, onOpenStarred,
    onCancelReply, onAddFiles, onAddVoiceNote, onRemoveAttachment, onSend,
}: Props) {
    const [menuEl, setMenuEl] = useState<null | HTMLElement>(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [term, setTerm] = useState("");
    const [hitIndex, setHitIndex] = useState(0);
    const [pinIndex, setPinIndex] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [atBottom, setAtBottom] = useState(true);
    const [highlightId, setHighlightId] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const dragDepth = useRef(0);

    const isGroup = chat.type !== "personal";
    const other = counterpartOf(chat, users);
    const typingUser = chat.typingUserId ? users[chat.typingUserId] : undefined;
    const pinned = useMemo(() => messages.filter((m) => m.pinned), [messages]);
    const hits = useMemo(
        () => (term.trim() ? messages.filter((m) => stripHtml(m.html).toLowerCase().includes(term.trim().toLowerCase())) : []),
        [messages, term],
    );

    const scrollToMessage = (messageId: string) => {
        const el = document.getElementById(`msg-${messageId}`);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightId(messageId);
        setTimeout(() => setHighlightId((id) => (id === messageId ? null : id)), 1600);
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }, [chat.id]);

    useEffect(() => {
        if (atBottom) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length, atBottom]);

    useEffect(() => {
        if (hits.length > 0) scrollToMessage(hits[Math.min(hitIndex, hits.length - 1)].id);
    }, [hitIndex, hits]);

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 90);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        dragDepth.current = 0;
        setDragging(false);
        if (!canSend) return;
        if (e.dataTransfer.files?.length) onAddFiles(e.dataTransfer.files);
    };

    return (
        <Box
            sx={{
                flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative",
                backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
            }}
            onDragEnter={(e) => { e.preventDefault(); dragDepth.current += 1; if (e.dataTransfer.types.includes("Files")) setDragging(true); }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => { dragDepth.current -= 1; if (dragDepth.current <= 0) { dragDepth.current = 0; setDragging(false); } }}
            onDrop={handleDrop}
        >
            {/* Header */}
            <Box
                sx={{
                    display: "flex", alignItems: "center", gap: 1, px: 1.4, py: 1,
                    borderBottom: `1px solid ${C.border}`, background: C.panel, backdropFilter: "blur(14px)", zIndex: 5,
                }}
            >
                <IconButton size="small" onClick={onBack} sx={{ display: { md: "none" }, color: C.textSoft }}>
                    <MdArrowBack size={18} />
                </IconButton>

                <Box
                    onClick={onToggleInfo}
                    sx={{
                        display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0, cursor: "pointer",
                        px: 0.5, py: 0.3, borderRadius: "8px", "&:hover": { background: C.hover },
                    }}
                >
                    <ChatAvatar name={chat.name} avatar={chat.avatar} type={chat.type} size={36} online={other?.isOnline} />
                    <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {chat.name}
                            </Typography>
                            {chat.muted && <MdVolumeOff size={12} color={C.textMuted} />}
                            {chat.announcementOnly && <MdCampaign size={13} color={C.star} />}
                        </Box>
                        <Typography
                            sx={{
                                fontSize: "0.65rem",
                                color: typingUser ? C.online : other?.isOnline ? C.online : C.textMuted,
                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: { xs: 160, sm: 320 },
                            }}
                        >
                            {typingUser ? `${typingUser.name.split(" ")[0]} is typing…` : chatSubtitle(chat, users)}
                        </Typography>
                    </Box>
                </Box>

                {chat.type === "personal" && (
                    <>
                        <Tooltip title="Video call" arrow>
                            <IconButton size="small" sx={{ color: C.textSoft, "&:hover": { color: C.text } }}><MdVideoCall size={19} /></IconButton>
                        </Tooltip>
                        <Tooltip title="Voice call" arrow>
                            <IconButton size="small" sx={{ color: C.textSoft, "&:hover": { color: C.text } }}><MdPhone size={17} /></IconButton>
                        </Tooltip>
                    </>
                )}
                <Tooltip title="Search in chat" arrow>
                    <IconButton
                        size="small"
                        onClick={() => { setSearchOpen((v) => !v); setTerm(""); }}
                        sx={{ color: searchOpen ? C.accentSoft : C.textSoft, "&:hover": { color: C.text } }}
                    >
                        <MdSearch size={18} />
                    </IconButton>
                </Tooltip>
                <IconButton size="small" onClick={(e) => setMenuEl(e.currentTarget)} sx={{ color: C.textSoft, "&:hover": { color: C.text } }}>
                    <MdMoreVert size={18} />
                </IconButton>
            </Box>

            {/* In-chat search */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.16 }}
                        style={{ overflow: "hidden", zIndex: 4 }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.6, py: 0.8, background: C.panelAlt, borderBottom: `1px solid ${C.border}` }}>
                            <MdSearch size={16} color={C.textMuted} />
                            <InputBase
                                autoFocus
                                value={term}
                                onChange={(e) => { setTerm(e.target.value); setHitIndex(0); }}
                                placeholder="Search in this chat"
                                sx={{ flex: 1, fontSize: "0.74rem", color: C.text }}
                            />
                            <Typography sx={{ fontSize: "0.65rem", color: C.textMuted }}>
                                {hits.length > 0 ? `${Math.min(hitIndex + 1, hits.length)}/${hits.length}` : term ? "0/0" : ""}
                            </Typography>
                            <IconButton size="small" disabled={hits.length === 0} onClick={() => setHitIndex((i) => (i - 1 + hits.length) % hits.length)} sx={{ color: C.textSoft }}>
                                <MdKeyboardArrowUp size={16} />
                            </IconButton>
                            <IconButton size="small" disabled={hits.length === 0} onClick={() => setHitIndex((i) => (i + 1) % hits.length)} sx={{ color: C.textSoft }}>
                                <MdKeyboardArrowDown size={16} />
                            </IconButton>
                            <IconButton size="small" onClick={() => { setSearchOpen(false); setTerm(""); }} sx={{ color: C.textSoft }}>
                                <MdClose size={15} />
                            </IconButton>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pinned bar */}
            {pinned.length > 0 && (
                <Box
                    onClick={() => { scrollToMessage(pinned[pinIndex % pinned.length].id); setPinIndex((i) => i + 1); }}
                    sx={{
                        display: "flex", alignItems: "center", gap: 1, px: 1.6, py: 0.7, cursor: "pointer",
                        background: C.panelAlt, borderBottom: `1px solid ${C.border}`,
                        borderLeft: `3px solid ${C.accent}`, "&:hover": { background: C.raised },
                    }}
                >
                    <MdPushPin size={14} color={C.accentSoft} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontSize: "0.6rem", color: C.accentSoft, fontWeight: 700 }}>
                            Pinned message {pinned.length > 1 ? `${(pinIndex % pinned.length) + 1}/${pinned.length}` : ""}
                        </Typography>
                        <Typography sx={{ fontSize: "0.7rem", color: C.textSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {stripHtml(pinned[pinIndex % pinned.length].html) || "Attachment"}
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* Messages */}
            <Box
                ref={scrollRef}
                onScroll={handleScroll}
                sx={{ flex: 1, overflowY: "auto", px: { xs: 1, md: 2.5 }, py: 1.5, ...scrollbarSx }}
            >
                {messages.length === 0 ? (
                    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
                        <ChatAvatar name={chat.name} avatar={chat.avatar} type={chat.type} size={64} />
                        <Typography sx={{ fontSize: "0.8rem", color: C.text, fontWeight: 600 }}>{chat.name}</Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: C.textMuted }}>
                            No messages yet — say hello to start the conversation
                        </Typography>
                    </Box>
                ) : (
                    messages.map((msg, i) => {
                        const prev = messages[i - 1];
                        const newDay = !prev || prev.dayKey !== msg.dayKey;
                        const grouped = Boolean(prev) && prev.senderId === msg.senderId && !newDay && !prev.system && !msg.system;

                        return (
                            <React.Fragment key={msg.id}>
                                {newDay && (
                                    <Box sx={{ display: "flex", justifyContent: "center", my: 1.2, position: "sticky", top: 0, zIndex: 2 }}>
                                        <Box sx={{ px: 1.4, py: 0.3, borderRadius: "10px", background: C.chipBg, border: `1px solid ${C.border}` }}>
                                            <Typography sx={{ fontSize: "0.62rem", color: C.textSoft, fontWeight: 600 }}>{msg.dayKey}</Typography>
                                        </Box>
                                    </Box>
                                )}

                                {unreadAnchorId === msg.id && (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, my: 1.2 }}>
                                        <Box sx={{ flex: 1, height: "1px", background: C.accent }} />
                                        <Typography sx={{ fontSize: "0.6rem", color: C.accentSoft, fontWeight: 700, letterSpacing: "0.06em" }}>
                                            UNREAD MESSAGES
                                        </Typography>
                                        <Box sx={{ flex: 1, height: "1px", background: C.accent }} />
                                    </Box>
                                )}

                                <MessageBubble
                                    message={msg}
                                    users={users}
                                    isGroup={isGroup}
                                    showAvatar={!grouped}
                                    showName={!grouped}
                                    searchTerm={term}
                                    highlighted={highlightId === msg.id}
                                    {...actions}
                                    onJumpTo={scrollToMessage}
                                />
                            </React.Fragment>
                        );
                    })
                )}

                {typingUser && <TypingBubble name={isGroup ? typingUser.name.split(" ")[0] : undefined} />}
                <div ref={bottomRef} />
            </Box>

            {/* Scroll to bottom */}
            <AnimatePresence>
                {!atBottom && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{ position: "absolute", right: 18, bottom: 92, zIndex: 6 }}
                    >
                        <IconButton
                            onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
                            sx={{
                                width: 34, height: 34, background: C.raised, color: C.text,
                                border: `1px solid ${C.border}`, "&:hover": { background: C.accentDark },
                            }}
                        >
                            <MdKeyboardArrowDown size={20} />
                        </IconButton>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Composer */}
            <MessageComposer
                chat={chat}
                users={users}
                canSend={canSend}
                replyTo={replyTo}
                attachments={attachments}
                onCancelReply={onCancelReply}
                onAddFiles={onAddFiles}
                onAddVoiceNote={onAddVoiceNote}
                onRemoveAttachment={onRemoveAttachment}
                onSend={onSend}
            />

            {/* Drag & drop overlay */}
            <AnimatePresence>
                {dragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: "absolute", inset: 0, zIndex: 20,
                            background: "rgba(8,12,24,0.88)", display: "flex",
                            alignItems: "center", justifyContent: "center", pointerEvents: "none",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                                px: 5, py: 4, borderRadius: "14px", border: `2px dashed ${canSend ? C.accent : C.danger}`,
                                background: C.panelSolid,
                            }}
                        >
                            {canSend ? <MdCloudUpload size={36} color={C.accentSoft} /> : <MdLock size={32} color={C.danger} />}
                            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: C.text }}>
                                {canSend ? "Drop files to attach" : "You cannot send here"}
                            </Typography>
                            {canSend && (
                                <Typography sx={{ fontSize: "0.7rem", color: C.textMuted }}>
                                    Photos, videos and documents supported
                                </Typography>
                            )}
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header menu */}
            <Menu
                anchorEl={menuEl}
                open={Boolean(menuEl)}
                onClose={() => setMenuEl(null)}
                slotProps={{
                    paper: {
                        sx: {
                            background: C.panelSolid, border: `1px solid ${C.border}`, borderRadius: "10px",
                            color: C.text, minWidth: 190,
                            "& .MuiMenuItem-root": { fontSize: "0.74rem", py: 0.7 },
                            "& .MuiListItemIcon-root": { minWidth: 28 },
                        },
                    },
                }}
            >
                <MenuItem onClick={() => { setMenuEl(null); onToggleInfo(); }}>
                    <ListItemIcon><MdInfoOutline size={15} color={C.textSoft} /></ListItemIcon>
                    {infoOpen ? "Hide info" : chat.type === "personal" ? "Contact info" : `${chat.type === "group" ? "Group" : "Community"} info`}
                </MenuItem>
                <MenuItem onClick={() => { setMenuEl(null); onToggleMute(chat.id); }}>
                    <ListItemIcon>{chat.muted ? <MdVolumeUp size={15} color={C.textSoft} /> : <MdVolumeOff size={15} color={C.textSoft} />}</ListItemIcon>
                    {chat.muted ? "Unmute notifications" : "Mute notifications"}
                </MenuItem>
                <MenuItem onClick={() => { setMenuEl(null); onOpenStarred(); }}>
                    <ListItemIcon><MdStar size={15} color={C.star} /></ListItemIcon>Starred messages
                </MenuItem>
                <MenuItem onClick={() => { setMenuEl(null); onDeleteChat(chat.id); }} sx={{ color: C.danger }}>
                    <ListItemIcon><MdDeleteOutline size={15} color={C.danger} /></ListItemIcon>Clear chat
                </MenuItem>
            </Menu>
        </Box>
    );
}
