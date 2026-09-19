"use client";

import React, { useMemo, useState } from "react";
import { Box, IconButton, InputBase, ListItemIcon, Menu, MenuItem, Switch, Tooltip, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import {
    MdSearch, MdMoreVert, MdClose, MdPushPin, MdOutlinePushPin, MdVolumeOff,
    MdVolumeUp, MdMarkChatUnread, MdDeleteOutline, MdDoneAll, MdDone,
    MdGroupAdd, MdShield, MdPersonAddAlt1, MdStar, MdImage, MdInsertDriveFile, MdMic,
    MdNotificationsActive, MdNotificationsOff, MdNotificationsNone, MdBolt,
} from "react-icons/md";
import { C, scrollbarSx } from "./theme";
import type { Chat, MessageMap, User } from "./types";
import type { PermissionState } from "./notifications";
import { lastMessageOf, previewOf, stripHtml } from "./helpers";
import ChatAvatar from "./ChatAvatar";

const TABS = ["All", "Unread", "Groups", "Communities", "Favourites"] as const;
type Tab = (typeof TABS)[number];

type Props = {
    chats: Chat[];
    users: Record<string, User>;
    messages: MessageMap;
    activeChatId: string | null;
    onSelect: (chatId: string) => void;
    onTogglePin: (chatId: string) => void;
    onToggleMute: (chatId: string) => void;
    onMarkUnread: (chatId: string) => void;
    onDeleteChat: (chatId: string) => void;
    onNewChat: (type: "personal" | "group" | "community") => void;
    onOpenStarred: () => void;
    permission: PermissionState;
    soundOn: boolean;
    liveOn: boolean;
    onEnableNotifications: () => void;
    onToggleSound: () => void;
    onToggleLive: () => void;
};

export default function ChatListPanel({
    chats, users, messages, activeChatId, onSelect,
    onTogglePin, onToggleMute, onMarkUnread, onDeleteChat, onNewChat, onOpenStarred,
    permission, soundOn, liveOn, onEnableNotifications, onToggleSound, onToggleLive,
}: Props) {
    const [tab, setTab] = useState<Tab>("All");
    const [query, setQuery] = useState("");
    const [menuEl, setMenuEl] = useState<null | HTMLElement>(null);
    const [rowMenu, setRowMenu] = useState<{ el: HTMLElement; chatId: string } | null>(null);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        const byTab = chats.filter((c) => {
            if (tab === "Unread") return c.unreadCount > 0;
            if (tab === "Groups") return c.type === "group";
            if (tab === "Communities") return c.type === "community";
            if (tab === "Favourites") return Boolean(c.favorite);
            return true;
        });
        const byQuery = q
            ? byTab.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    (messages[c.id] ?? []).some((m) => stripHtml(m.html).toLowerCase().includes(q)),
            )
            : byTab;
        return [...byQuery].sort((a, b) => Number(b.pinned) - Number(a.pinned));
    }, [chats, tab, query, messages]);

    const unreadTotal = chats.reduce((n, c) => n + c.unreadCount, 0);
    const rowChat = rowMenu ? chats.find((c) => c.id === rowMenu.chatId) : null;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: C.panel, backdropFilter: "blur(14px)" }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.6, pt: 1.6, pb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: C.text }}>Chats</Typography>
                    {unreadTotal > 0 && (
                        <Box sx={{ px: 0.7, py: 0.1, borderRadius: "8px", background: C.accentDark }}>
                            <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: C.text }}>{unreadTotal}</Typography>
                        </Box>
                    )}
                </Box>
                <Box sx={{ display: "flex", gap: 0.2 }}>
                    <Tooltip
                        arrow
                        title={
                            permission === "granted" ? "Desktop notifications on"
                                : permission === "denied" ? "Blocked in browser settings"
                                    : permission === "unsupported" ? "Not supported in this browser"
                                        : "Enable desktop notifications"
                        }
                    >
                        <span>
                            <IconButton
                                size="small"
                                onClick={onEnableNotifications}
                                disabled={permission === "unsupported"}
                                sx={{
                                    color: permission === "granted" ? C.online : permission === "denied" ? C.danger : C.textSoft,
                                    "&:hover": { color: C.text },
                                }}
                            >
                                {permission === "granted" ? <MdNotificationsActive size={17} />
                                    : permission === "denied" ? <MdNotificationsOff size={17} />
                                        : <MdNotificationsNone size={17} />}
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title={soundOn ? "Mute message sound" : "Unmute message sound"} arrow>
                        <IconButton
                            size="small"
                            onClick={onToggleSound}
                            sx={{ color: soundOn ? C.accentSoft : C.textMuted, "&:hover": { color: C.text } }}
                        >
                            {soundOn ? <MdVolumeUp size={17} /> : <MdVolumeOff size={17} />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="New chat" arrow>
                        <IconButton size="small" onClick={() => onNewChat("personal")} sx={{ color: C.textSoft, "&:hover": { color: C.text } }}>
                            <MdPersonAddAlt1 size={17} />
                        </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={(e) => setMenuEl(e.currentTarget)} sx={{ color: C.textSoft, "&:hover": { color: C.text } }}>
                        <MdMoreVert size={18} />
                    </IconButton>
                </Box>
            </Box>

            {/* Search */}
            <Box sx={{ px: 1.4, pb: 1 }}>
                <Box
                    sx={{
                        display: "flex", alignItems: "center", gap: 1,
                        background: C.panelAlt, borderRadius: "9px",
                        px: 1.2, py: 0.5, border: `1px solid ${C.border}`,
                        "&:focus-within": { borderColor: C.accent },
                    }}
                >
                    <MdSearch size={16} color={C.textMuted} />
                    <InputBase
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search chats and messages"
                        sx={{ fontSize: "0.74rem", color: C.text, flex: 1 }}
                    />
                    {query && (
                        <IconButton size="small" onClick={() => setQuery("")} sx={{ color: C.textMuted, p: 0.2 }}>
                            <MdClose size={14} />
                        </IconButton>
                    )}
                </Box>
            </Box>

            {/* Filter tabs */}
            <Box sx={{ display: "flex", gap: 0.5, px: 1.4, pb: 1, overflowX: "auto", ...scrollbarSx }}>
                {TABS.map((t) => (
                    <Box
                        key={t}
                        onClick={() => setTab(t)}
                        sx={{
                            px: 1.1, py: 0.35, borderRadius: "14px", cursor: "pointer", whiteSpace: "nowrap",
                            fontSize: "0.68rem", fontWeight: 600,
                            background: tab === t ? C.accentDark : C.panelAlt,
                            color: tab === t ? C.text : C.textSoft,
                            border: `1px solid ${tab === t ? C.accentSoft : C.border}`,
                            "&:hover": { color: C.text },
                            transition: "all 0.15s",
                        }}
                    >
                        {t}
                    </Box>
                ))}
            </Box>

            {/* Rows */}
            <Box sx={{ flex: 1, overflowY: "auto", ...scrollbarSx }}>
                <AnimatePresence initial={false}>
                    {visible.map((chat) => {
                        const last = lastMessageOf(messages[chat.id]);
                        const active = chat.id === activeChatId;
                        const typingUser = chat.typingUserId ? users[chat.typingUserId] : undefined;
                        const att = last?.attachments?.[0];

                        return (
                            <motion.div
                                key={chat.id}
                                layout
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -8 }}
                                transition={{ duration: 0.16 }}
                            >
                                <Box
                                    onClick={() => onSelect(chat.id)}
                                    onContextMenu={(e) => { e.preventDefault(); setRowMenu({ el: e.currentTarget as HTMLElement, chatId: chat.id }); }}
                                    sx={{
                                        display: "flex", alignItems: "center", gap: 1.1, px: 1.4, py: 1,
                                        cursor: "pointer", position: "relative",
                                        background: active ? C.selected : "transparent",
                                        borderLeft: `3px solid ${active ? C.accentSoft : "transparent"}`,
                                        "&:hover": { background: active ? C.selected : C.hover },
                                        "&:hover .row-more": { opacity: 1 },
                                        transition: "background 0.15s",
                                    }}
                                >
                                    <ChatAvatar
                                        name={chat.name}
                                        avatar={chat.avatar}
                                        type={chat.type}
                                        size={40}
                                        online={chat.type === "personal" && users[chat.members.find((m) => m.userId !== "me")?.userId ?? ""]?.isOnline}
                                    />

                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 0.5 }}>
                                            <Typography sx={{ fontWeight: 600, fontSize: "0.78rem", color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {chat.name}
                                            </Typography>
                                            <Typography sx={{ fontSize: "0.62rem", color: chat.unreadCount > 0 ? C.accentSoft : C.textMuted, flexShrink: 0 }}>
                                                {last?.time ?? ""}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 0.5, mt: 0.15 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, minWidth: 0 }}>
                                                {typingUser ? (
                                                    <Typography sx={{ fontSize: "0.7rem", color: C.online, fontWeight: 600 }}>
                                                        {chat.type === "personal" ? "typing…" : `${typingUser.name.split(" ")[0]} is typing…`}
                                                    </Typography>
                                                ) : (
                                                    <>
                                                        {last?.senderId === "me" && !last.system && (
                                                            last.status === "read"
                                                                ? <MdDoneAll size={13} color={C.tick} />
                                                                : last.status === "delivered"
                                                                    ? <MdDoneAll size={13} color={C.textMuted} />
                                                                    : <MdDone size={13} color={C.textMuted} />
                                                        )}
                                                        {att?.kind === "image" && <MdImage size={12} color={C.textMuted} />}
                                                        {att?.kind === "audio" && <MdMic size={12} color={C.textMuted} />}
                                                        {att?.kind === "file" && <MdInsertDriveFile size={12} color={C.textMuted} />}
                                                        <Typography sx={{ fontSize: "0.7rem", color: C.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                            {previewOf(last, users, chat.type !== "personal")}
                                                        </Typography>
                                                    </>
                                                )}
                                            </Box>

                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, flexShrink: 0 }}>
                                                {chat.muted && <MdVolumeOff size={12} color={C.textMuted} />}
                                                {chat.pinned && <MdPushPin size={12} color={C.textMuted} />}
                                                {chat.unreadCount > 0 && (
                                                    <Box
                                                        sx={{
                                                            minWidth: 17, height: 17, px: 0.5, borderRadius: "9px",
                                                            background: chat.muted ? C.textMuted : C.accentDark,
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                        }}
                                                    >
                                                        <Typography sx={{ fontSize: "0.58rem", fontWeight: 700, color: C.text }}>
                                                            {chat.unreadCount}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>

                                    <IconButton
                                        className="row-more"
                                        size="small"
                                        onClick={(e) => { e.stopPropagation(); setRowMenu({ el: e.currentTarget, chatId: chat.id }); }}
                                        sx={{ opacity: 0, color: C.textMuted, p: 0.3, transition: "opacity 0.15s", "&:hover": { color: C.text } }}
                                    >
                                        <MdMoreVert size={15} />
                                    </IconButton>
                                </Box>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {visible.length === 0 && (
                    <Box sx={{ textAlign: "center", pt: 5, px: 2 }}>
                        <Typography sx={{ fontSize: "0.74rem", color: C.textMuted }}>No chats found</Typography>
                    </Box>
                )}
            </Box>

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
                            "& .MuiMenuItem-root": { fontSize: "0.74rem", py: 0.8 },
                            "& .MuiListItemIcon-root": { minWidth: 28 },
                        },
                    },
                }}
            >
                <MenuItem onClick={() => { setMenuEl(null); onNewChat("group"); }}>
                    <ListItemIcon><MdGroupAdd size={16} color="#38bdf8" /></ListItemIcon>New group
                </MenuItem>
                <MenuItem onClick={() => { setMenuEl(null); onNewChat("community"); }}>
                    <ListItemIcon><MdShield size={16} color="#f59e0b" /></ListItemIcon>New community
                </MenuItem>
                <MenuItem onClick={() => { setMenuEl(null); onOpenStarred(); }}>
                    <ListItemIcon><MdStar size={16} color={C.star} /></ListItemIcon>Starred messages
                </MenuItem>
                <MenuItem onClick={onToggleLive} sx={{ gap: 1 }}>
                    <ListItemIcon><MdBolt size={16} color={liveOn ? C.online : C.textMuted} /></ListItemIcon>
                    Simulate incoming
                    <Switch checked={liveOn} size="small" sx={{ ml: "auto", "& .MuiSwitch-thumb": { width: 12, height: 12 } }} />
                </MenuItem>
            </Menu>

            {/* Row menu */}
            <Menu
                anchorEl={rowMenu?.el ?? null}
                open={Boolean(rowMenu)}
                onClose={() => setRowMenu(null)}
                slotProps={{
                    paper: {
                        sx: {
                            background: C.panelSolid, border: `1px solid ${C.border}`, borderRadius: "10px",
                            color: C.text, minWidth: 180,
                            "& .MuiMenuItem-root": { fontSize: "0.74rem", py: 0.7 },
                            "& .MuiListItemIcon-root": { minWidth: 28 },
                        },
                    },
                }}
            >
                <MenuItem onClick={() => { if (rowMenu) onTogglePin(rowMenu.chatId); setRowMenu(null); }}>
                    <ListItemIcon>{rowChat?.pinned ? <MdPushPin size={15} color={C.accentSoft} /> : <MdOutlinePushPin size={15} color={C.textSoft} />}</ListItemIcon>
                    {rowChat?.pinned ? "Unpin chat" : "Pin chat"}
                </MenuItem>
                <MenuItem onClick={() => { if (rowMenu) onToggleMute(rowMenu.chatId); setRowMenu(null); }}>
                    <ListItemIcon>{rowChat?.muted ? <MdVolumeUp size={15} color={C.textSoft} /> : <MdVolumeOff size={15} color={C.textSoft} />}</ListItemIcon>
                    {rowChat?.muted ? "Unmute" : "Mute"}
                </MenuItem>
                <MenuItem onClick={() => { if (rowMenu) onMarkUnread(rowMenu.chatId); setRowMenu(null); }}>
                    <ListItemIcon><MdMarkChatUnread size={15} color={C.textSoft} /></ListItemIcon>Mark as unread
                </MenuItem>
                {/* <MenuItem
                    onClick={() => { if (rowMenu) onDeleteChat(rowMenu.chatId); setRowMenu(null); }}
                    sx={{ color: C.danger }}
                >
                    <ListItemIcon><MdDeleteOutline size={15} color={C.danger} /></ListItemIcon>Delete chat
                </MenuItem> */}
            </Menu>
        </Box>
    );
}
