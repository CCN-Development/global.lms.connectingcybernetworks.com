"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, InputBase, Menu, MenuItem } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import {
    MdArrowBack, MdCampaign, MdClose, MdCloudUpload, MdInfoOutline, MdKeyboardArrowDown,
    MdKeyboardArrowUp, MdLock, MdPushPin, MdVolumeOff,
} from "react-icons/md";
import { C, menuPaperSx, scrollbarSx, t } from "./theme";
import type { Attachment, Chat, Message, User } from "./types";
import { counterpartOf, stripHtml } from "./helpers";
import ChatAvatar from "./ChatAvatar";
import ChatIcon from "./ChatIcon";
import MessageBubble, { type BubbleActions } from "./MessageBubble";
import MessageComposer from "./MessageComposer";

type Props = {
    chat: Chat;
    users: Record<string, User>;
    messages: Message[];
    canSend: boolean;
    lockReason: "announcement" | "blocked" | null;
    infoOpen: boolean;
    unreadAnchorId: string | null;
    replyTo: Message | null;
    editing: Message | null;
    attachments: Attachment[];
    actions: BubbleActions;
    onBack: () => void;
    onToggleInfo: () => void;
    onToggleMute: (chatId: string) => void;
    onClearChat: (chatId: string) => void;
    onOpenStarred: () => void;
    onCancelReply: () => void;
    onCancelEdit: () => void;
    onUnblock: (chatId: string) => void;
    onAddFiles: (files: FileList | File[]) => void;
    onAddVoiceNote: (seconds: number, url: string) => void;
    onRemoveAttachment: (id: string) => void;
    onSend: (html: string) => void;
    onStartCall: (chatId: string) => void;
    onStartMeeting: (chatId: string) => void;
};

function TypingBubble({ name }: { name?: string }) {
    return (
        <Box sx={{ display: "flex", mt: "16px" }}>
            <Box
                sx={{
                    display: "flex", alignItems: "center", gap: "6px", px: "20px", py: "14px",
                    borderRadius: "0 12px 12px 12px", background: C.bubbleIn,
                }}
            >
                {[0, 1, 2].map((i) => (
                    <Box
                        key={i}
                        sx={{
                            width: 6, height: 6, borderRadius: "50%", background: C.accentSoft,
                            animation: `chat-typing-dot 1.2s ${i * 0.15}s infinite ease-in-out`,
                        }}
                    />
                ))}
                {name && <Box component="span" sx={{ ml: "6px", ...t("lato", 12, 18, 500, C.textMuted) }}>{name} is typing</Box>}
            </Box>
        </Box>
    );
}

const iconBtn = {
    display: "flex", p: 0, border: "none", background: "transparent", cursor: "pointer", flexShrink: 0,
    borderRadius: "8px",
} as const;

export default function ChatWindow({
    chat, users, messages, canSend, lockReason, infoOpen, unreadAnchorId, replyTo, editing, attachments, actions,
    onBack, onToggleInfo, onToggleMute, onClearChat, onOpenStarred,
    onCancelReply, onCancelEdit, onUnblock, onAddFiles, onAddVoiceNote, onRemoveAttachment, onSend,
    onStartCall, onStartMeeting,
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

    const closeMenu = () => setMenuEl(null);

    return (
        <Box
            sx={{ flex: 1, minWidth: 0, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}
            onDragEnter={(e) => { e.preventDefault(); dragDepth.current += 1; if (e.dataTransfer.types.includes("Files")) setDragging(true); }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => { dragDepth.current -= 1; if (dragDepth.current <= 0) { dragDepth.current = 0; setDragging(false); } }}
            onDrop={handleDrop}
        >
            {/* Header */}
            <Box
                sx={{
                    flexShrink: 0, display: "flex", alignItems: "center", gap: "20px", p: "24px",
                    background: C.headerGrad, borderBottom: `1px solid ${C.borderSoft}`, zIndex: 5,
                }}
            >
                <Box component="button" type="button" aria-label="Back to chats" onClick={onBack} sx={{ ...iconBtn, display: { md: "none" } }}>
                    <MdArrowBack size={26} color={C.textSoft} />
                </Box>

                <Box
                    onClick={onToggleInfo}
                    sx={{ display: "flex", alignItems: "center", gap: "20px", flex: 1, minWidth: 0, cursor: "pointer" }}
                >
                    <ChatAvatar name={chat.name} avatar={chat.avatar} type={chat.type} size={44} />
                    <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Box component="h1" sx={{ m: 0, ...t("poppins", 20, 30, 600, C.text), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {chat.name}
                            </Box>
                            {chat.muted && <MdVolumeOff size={16} color={C.textMuted} style={{ flexShrink: 0 }} />}
                            {chat.announcementOnly && <MdCampaign size={18} color={C.star} style={{ flexShrink: 0 }} />}
                        </Box>
                        {typingUser && (
                            <Box sx={{ ...t("lato", 12, 14, 500, C.accentSoft), mt: "-4px", mb: "-4px" }}>
                                {isGroup ? `${typingUser.name.split(" ")[0]} is typing…` : "typing…"}
                            </Box>
                        )}
                    </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: "24px", flexShrink: 0 }}>
                    <Box
                        component="button" type="button" aria-label="Search in chat"
                        onClick={() => { setSearchOpen((v) => !v); setTerm(""); }}
                        sx={iconBtn}
                    >
                        <ChatIcon name="search" size={28} color={searchOpen ? C.accentSoft : C.textSoft} />
                    </Box>
                    <Box
                        component="button" type="button" aria-label="Chat options"
                        onClick={(e: React.MouseEvent<HTMLElement>) => setMenuEl(e.currentTarget)}
                        sx={iconBtn}
                    >
                        <ChatIcon name="more-vertical" size={28} />
                    </Box>
                </Box>
            </Box>

            {/* In-chat search */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.16 }}
                        style={{ overflow: "hidden", zIndex: 4, flexShrink: 0 }}
                    >
                        <Box sx={{ px: "32px", pt: "16px" }}>
                            <Box
                                sx={{
                                    display: "flex", alignItems: "center", gap: "8px", height: 48, px: "16px",
                                    borderRadius: "99px", border: `1px solid ${C.chipBorder}`, backdropFilter: "blur(2px)",
                                    background: "linear-gradient(180deg, rgba(187,201,237,0.1) 0%, rgba(106,114,135,0.06) 100%)",
                                }}
                            >
                                <ChatIcon name="search-24" size={24} />
                                <InputBase
                                    autoFocus
                                    value={term}
                                    onChange={(e) => { setTerm(e.target.value); setHitIndex(0); }}
                                    placeholder="Search in this chat"
                                    sx={{
                                        flex: 1, ...t("inter", 16, 25, 400, C.text),
                                        "& input": { p: 0, height: 25 },
                                        "& input::placeholder": { color: C.textMuted, opacity: 1 },
                                    }}
                                />
                                <Box component="span" sx={t("lato", 12, 18, 500, C.textMuted)}>
                                    {hits.length > 0 ? `${Math.min(hitIndex + 1, hits.length)}/${hits.length}` : term ? "0/0" : ""}
                                </Box>
                                <Box component="button" type="button" aria-label="Previous match" disabled={hits.length === 0} onClick={() => setHitIndex((i) => (i - 1 + hits.length) % hits.length)} sx={{ ...iconBtn, opacity: hits.length === 0 ? 0.4 : 1 }}>
                                    <MdKeyboardArrowUp size={22} color={C.textSoft} />
                                </Box>
                                <Box component="button" type="button" aria-label="Next match" disabled={hits.length === 0} onClick={() => setHitIndex((i) => (i + 1) % hits.length)} sx={{ ...iconBtn, opacity: hits.length === 0 ? 0.4 : 1 }}>
                                    <MdKeyboardArrowDown size={22} color={C.textSoft} />
                                </Box>
                                <Box component="button" type="button" aria-label="Close search" onClick={() => { setSearchOpen(false); setTerm(""); }} sx={iconBtn}>
                                    <MdClose size={20} color={C.textSoft} />
                                </Box>
                            </Box>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pinned bar */}
            {pinned.length > 0 && (
                <Box
                    onClick={() => { scrollToMessage(pinned[pinIndex % pinned.length].id); setPinIndex((i) => i + 1); }}
                    sx={{
                        flexShrink: 0, display: "flex", alignItems: "center", gap: "12px", px: "32px", py: "10px", cursor: "pointer",
                        background: C.active, borderBottom: `1px solid ${C.borderSoft}`,
                        "&:hover": { background: "rgba(147,169,226,0.18)" },
                    }}
                >
                    <MdPushPin size={16} color={C.accentSoft} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box sx={t("lato", 12, 18, 700, C.accentSoft)}>
                            Pinned message {pinned.length > 1 ? `${(pinIndex % pinned.length) + 1}/${pinned.length}` : ""}
                        </Box>
                        <Box sx={{ ...t("lato", 12, 18, 500, C.textSoft), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {stripHtml(pinned[pinIndex % pinned.length].html) || "Attachment"}
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Messages */}
            <Box
                ref={scrollRef}
                onScroll={handleScroll}
                sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: { xs: "16px", md: "32px" }, pt: "24px", pb: "24px", ...scrollbarSx }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {messages.map((msg, i) => {
                        const prev = messages[i - 1];
                        const newDay = !prev || prev.dayKey !== msg.dayKey;
                        const grouped = Boolean(prev) && prev.senderId === msg.senderId && !newDay && !prev.system && !msg.system;

                        return (
                            <React.Fragment key={msg.id}>
                                {newDay && (
                                    <Box sx={{ textAlign: "center", ...t("lato", 12, 18, 500, C.textFaint) }}>{msg.dayKey}</Box>
                                )}

                                {unreadAnchorId === msg.id && (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <Box sx={{ flex: 1, height: "1px", background: C.accent }} />
                                        <Box sx={{ ...t("lato", 12, 18, 700, C.accentSoft), letterSpacing: "0.06em" }}>UNREAD MESSAGES</Box>
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
                    })}

                    {typingUser && <TypingBubble name={isGroup ? typingUser.name.split(" ")[0] : undefined} />}
                </Box>
                <div ref={bottomRef} />
            </Box>

            {/* Scroll to bottom */}
            <AnimatePresence>
                {!atBottom && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{ position: "absolute", right: 32, bottom: 120, zIndex: 6 }}
                    >
                        <Box
                            component="button" type="button" aria-label="Scroll to latest message"
                            onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
                            sx={{
                                width: 40, height: 40, borderRadius: "50%", border: `1px solid ${C.border}`, cursor: "pointer",
                                background: C.menuBg, backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center",
                                "&:hover": { background: C.active },
                            }}
                        >
                            <MdKeyboardArrowDown size={24} color={C.text} />
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Composer */}
            <MessageComposer
                chat={chat}
                users={users}
                canSend={canSend}
                lockReason={lockReason}
                replyTo={replyTo}
                editing={editing}
                attachments={attachments}
                onCancelReply={onCancelReply}
                onCancelEdit={onCancelEdit}
                onUnblock={() => onUnblock(chat.id)}
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
                            background: "rgba(9,9,21,0.86)", backdropFilter: "blur(4px)", display: "flex",
                            alignItems: "center", justifyContent: "center", pointerEvents: "none",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                                px: "40px", py: "32px", borderRadius: "16px",
                                border: `2px dashed ${canSend ? C.accentSoft : C.danger}`, background: C.panelSolid,
                            }}
                        >
                            {canSend ? <MdCloudUpload size={36} color={C.accentSoft} /> : <MdLock size={32} color={C.danger} />}
                            <Box sx={t("lato", 16, 24, 700, C.text)}>{canSend ? "Drop files to attach" : "You cannot send here"}</Box>
                            {canSend && <Box sx={t("lato", 12, 18, 500, C.textMuted)}>Photos, videos and documents supported</Box>}
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header menu */}
            <Menu
                anchorEl={menuEl}
                open={Boolean(menuEl)}
                onClose={closeMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: { ...menuPaperSx, mt: "4px", minWidth: 200 } } }}
            >
                <MenuItem onClick={() => { closeMenu(); onToggleInfo(); }}>
                    <Box sx={{ display: "flex", color: C.textMuted }}><MdInfoOutline size={20} /></Box>
                    {infoOpen ? "Hide info" : chat.type === "personal" ? "Contact info" : `${chat.type === "group" ? "Group" : "Community"} info`}
                </MenuItem>
                <MenuItem onClick={() => { closeMenu(); onStartMeeting(chat.id); }}>
                    <ChatIcon name="video-24" size={24} color={C.textMuted} style={{ margin: "0 -2px" }} />
                    Video Call
                </MenuItem>
                {other && !isGroup && (
                    <MenuItem onClick={() => { closeMenu(); onStartCall(chat.id); }}>
                        <ChatIcon name="phone" size={20} color={C.textMuted} />
                        Voice Call
                    </MenuItem>
                )}
                <MenuItem onClick={() => { closeMenu(); onToggleMute(chat.id); }}>
                    <ChatIcon name="bell" size={20} color={C.textMuted} />
                    {chat.muted ? "Unmute notification" : "Mute notification"}
                </MenuItem>
                <MenuItem onClick={() => { closeMenu(); onOpenStarred(); }}>
                    <ChatIcon name="star" size={20} color={C.textMuted} />
                    Starred messages
                </MenuItem>
                <MenuItem onClick={() => { closeMenu(); onClearChat(chat.id); }} sx={{ color: `${C.danger} !important` }}>
                    <ChatIcon name="trash" size={20} color={C.danger} />
                    Clear chat
                </MenuItem>
            </Menu>
        </Box>
    );
}
