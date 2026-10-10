"use client";

import React, { useMemo, useState } from "react";
import { Box, InputBase, Menu, MenuItem } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import {
    MdBolt, MdGroupAdd, MdNotificationsActive, MdNotificationsNone, MdNotificationsOff, MdPersonAddAlt1,
    MdPushPin, MdShield, MdStarBorder, MdVolumeOff, MdVolumeUp, MdFavoriteBorder, MdMic, MdImage,
    MdInsertDriveFile,
} from "react-icons/md";
import { C, FONT_LATO, menuPaperSx, scrollbarSx, t } from "./theme";
import type { Chat, MessageMap, User } from "./types";
import type { PermissionState } from "./notifications";
import { lastMessageOf, previewOf, stripHtml } from "./helpers";
import ChatAvatar from "./ChatAvatar";
import ChatIcon, { StatusTicks } from "./ChatIcon";

const TABS = ["All", "Unread", "Communities"] as const;
type Tab = (typeof TABS)[number];

type Props = {
    chats: Chat[];
    users: Record<string, User>;
    messages: MessageMap;
    activeChatId: string | null;
    onSelect: (chatId: string) => void;
    onTogglePin: (chatId: string) => void;
    onToggleMute: (chatId: string) => void;
    onToggleRead: (chatId: string) => void;
    onToggleArchive: (chatId: string) => void;
    onToggleBlock: (chatId: string) => void;
    onReport: (chatId: string) => void;
    onDeleteChat: (chatId: string) => void;
    onMarkAllRead: () => void;
    onOpenProfile: () => void;
    onNewChat: (type: "personal" | "group" | "community") => void;
    onOpenStarred: () => void;
    permission: PermissionState;
    soundOn: boolean;
    liveOn: boolean;
    onEnableNotifications: () => void;
    onToggleSound: () => void;
    onToggleLive: () => void;
};

type RowMenu = { chatId: string; el?: HTMLElement; pos?: { top: number; left: number } };

const menuIcon = { color: C.textMuted, display: "flex", flexShrink: 0 } as const;
const menuHint = { ...t("lato", 12, 18, 500, C.textMuted), ml: "auto", pl: "16px" } as const;

export default function ChatListPanel({
    chats, users, messages, activeChatId, onSelect,
    onTogglePin, onToggleMute, onToggleRead, onToggleArchive, onToggleBlock, onReport, onDeleteChat,
    onMarkAllRead, onOpenProfile, onNewChat, onOpenStarred,
    permission, soundOn, liveOn, onEnableNotifications, onToggleSound, onToggleLive,
}: Props) {
    const [tab, setTab] = useState<Tab>("All");
    const [query, setQuery] = useState("");
    const [showArchived, setShowArchived] = useState(false);
    const [favouritesOnly, setFavouritesOnly] = useState(false);
    const [menuEl, setMenuEl] = useState<null | HTMLElement>(null);
    const [rowMenu, setRowMenu] = useState<RowMenu | null>(null);

    const archivedCount = chats.filter((c) => c.archived).length;

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        const byTab = chats.filter((c) => {
            if (showArchived ? !c.archived : c.archived) return false;
            if (favouritesOnly && !c.favorite) return false;
            if (tab === "Unread") return c.unreadCount > 0;
            if (tab === "Communities") return c.type !== "personal";
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
    }, [chats, tab, query, messages, showArchived, favouritesOnly]);

    const rowChat = rowMenu ? chats.find((c) => c.id === rowMenu.chatId) : null;
    const closeRowMenu = () => setRowMenu(null);
    const runRow = (fn: (id: string) => void) => () => {
        if (rowMenu) fn(rowMenu.chatId);
        closeRowMenu();
    };
    const runHeader = (fn: () => void) => () => {
        setMenuEl(null);
        fn();
    };

    const notificationHint =
        permission === "granted" ? "On" : permission === "denied" ? "Blocked" : permission === "unsupported" ? "N/A" : "Off";

    return (
        <Box
            sx={{
                display: "flex", flexDirection: "column", gap: "32px", height: "100%", minHeight: 0,
                py: "32px", pr: "32px", overflow: "hidden",
            }}
        >
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <Box component="h2" sx={{ m: 0, ...t("poppins", 20, 30, 500, C.text) }}>
                    {showArchived ? "Archived" : "Chats"}
                </Box>
                <Box
                    component="button"
                    type="button"
                    aria-label="Chat list options"
                    onClick={(e: React.MouseEvent<HTMLElement>) => setMenuEl(e.currentTarget)}
                    sx={{ display: "flex", p: 0, border: "none", background: "transparent", cursor: "pointer", borderRadius: "8px" }}
                >
                    <ChatIcon name="more-vertical" size={28} />
                </Box>
            </Box>

            {/* Search + filters */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", flexShrink: 0 }}>
                <Box
                    sx={{
                        display: "flex", alignItems: "center", gap: "8px", height: 48, px: "16px", py: "8px",
                        borderRadius: "99px", border: `1px solid ${C.chipBorder}`,
                        backdropFilter: "blur(2px)",
                        background: "linear-gradient(180deg, rgba(187,201,237,0.1) 0%, rgba(106,114,135,0.06) 100%)",
                    }}
                >
                    <ChatIcon name="search-24" size={24} />
                    <InputBase
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search or start a new chat"
                        sx={{
                            flex: 1, minWidth: 0, ...t("inter", 16, 25, 400, C.text),
                            "& input": { p: 0, height: 25 },
                            "& input::placeholder": { color: C.textMuted, opacity: 1 },
                        }}
                    />
                    {query && (
                        <Box
                            component="button"
                            type="button"
                            aria-label="Clear search"
                            onClick={() => setQuery("")}
                            sx={{ display: "flex", p: 0, border: "none", background: "transparent", cursor: "pointer" }}
                        >
                            <ChatIcon name="x" size={20} />
                        </Box>
                    )}
                </Box>

                <Box sx={{ display: "flex", gap: "12px" }}>
                    {TABS.map((tabName) => {
                        const active = tab === tabName;
                        return (
                            <Box
                                key={tabName}
                                component="button"
                                type="button"
                                onClick={() => setTab(tabName)}
                                sx={{
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    px: "12px", py: "4px", borderRadius: "8px", cursor: "pointer",
                                    backdropFilter: "blur(12px)",
                                    border: active ? "1px solid transparent" : `1px solid ${C.chipBorder}`,
                                    background: active ? C.chipActive : "transparent",
                                    ...t("lato", 14, 21, 500, active ? C.text : C.textSoft),
                                    whiteSpace: "nowrap",
                                    transition: "background 0.15s ease, color 0.15s ease",
                                    "&:hover": { color: C.text },
                                }}
                            >
                                {tabName}
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            {/* Rows */}
            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", ...scrollbarSx }}>
                <AnimatePresence initial={false}>
                    {visible.map((chat) => {
                        const last = lastMessageOf(messages[chat.id]);
                        const active = chat.id === activeChatId;
                        const typingUser = chat.typingUserId ? users[chat.typingUserId] : undefined;
                        const att = last?.attachments?.[0];

                        return (
                            <motion.div
                                key={chat.id}
                                layout="position"
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -8 }}
                                transition={{ duration: 0.16 }}
                                style={{ flexShrink: 0 }}
                            >
                                <Box
                                    onClick={() => onSelect(chat.id)}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        setRowMenu({ chatId: chat.id, pos: { top: e.clientY, left: e.clientX } });
                                    }}
                                    sx={{
                                        display: "flex", alignItems: "center", gap: "12px", p: "16px", borderRadius: "12px",
                                        cursor: "pointer", background: active ? C.selected : "transparent",
                                        transition: "background 0.15s ease",
                                        "&:hover": { background: active ? C.selected : C.hover },
                                        "&:hover .row-chevron, & .row-chevron[data-open='true']": { opacity: 1 },
                                    }}
                                >
                                    <ChatAvatar name={chat.name} avatar={chat.avatar} type={chat.type} size={44} />

                                    <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                            <Box sx={{ flex: 1, minWidth: 0, ...t("lato", 16, 24, 500, C.text), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {chat.name}
                                            </Box>
                                            <Box sx={{ flexShrink: 0, ...t("lato", 12, 18, 500, C.textStrong), whiteSpace: "nowrap" }}>
                                                {last?.time ?? chat.timeLabel ?? ""}
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: "flex", alignItems: "center", gap: "4px", minWidth: 0 }}>
                                            <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "4px", ...t("lato", 12, 18, 500, C.textMuted) }}>
                                                {typingUser ? (
                                                    <Box component="span" sx={{ color: C.accentSoft, whiteSpace: "nowrap" }}>
                                                        {chat.type === "personal" ? "typing…" : `${typingUser.name.split(" ")[0]} is typing…`}
                                                    </Box>
                                                ) : (
                                                    <>
                                                        {last?.senderId === "me" && !last.system && (
                                                            <StatusTicks double={last.status === "delivered" || last.status === "read"} color={last.status === "read" ? C.tick : C.textMuted} />
                                                        )}
                                                        {att?.kind === "image" && <MdImage size={13} style={{ flexShrink: 0 }} />}
                                                        {att?.kind === "audio" && <MdMic size={13} style={{ flexShrink: 0 }} />}
                                                        {att?.kind === "file" && <MdInsertDriveFile size={13} style={{ flexShrink: 0 }} />}
                                                        <Box component="span" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                            {previewOf(last, users, chat.type !== "personal")}
                                                        </Box>
                                                    </>
                                                )}
                                            </Box>

                                            {chat.muted && <MdVolumeOff size={14} color={C.textMuted} style={{ flexShrink: 0 }} />}
                                            {chat.pinned && <MdPushPin size={14} color={C.textMuted} style={{ flexShrink: 0 }} />}
                                            {chat.unreadCount > 0 && (
                                                <Box
                                                    sx={{
                                                        flexShrink: 0, minWidth: 20, height: 20, px: chat.unreadCount > 9 ? "4px" : 0, borderRadius: "6px",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        background: chat.muted ? C.textFaint : C.badge,
                                                        ...t("lato", 12, 18, 500, C.text),
                                                    }}
                                                >
                                                    {chat.unreadCount}
                                                </Box>
                                            )}
                                            <Box
                                                className="row-chevron"
                                                component="button"
                                                type="button"
                                                aria-label="Chat options"
                                                data-open={rowMenu?.chatId === chat.id && Boolean(rowMenu?.el)}
                                                onClick={(e: React.MouseEvent<HTMLElement>) => {
                                                    e.stopPropagation();
                                                    setRowMenu({ chatId: chat.id, el: e.currentTarget });
                                                }}
                                                sx={{ display: "flex", p: 0, border: "none", background: "transparent", cursor: "pointer", opacity: 0, transition: "opacity 0.15s ease", flexShrink: 0 }}
                                            >
                                                <ChatIcon name="chevron-16" size={16} color={C.textMuted} />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {visible.length === 0 && (
                    <Box sx={{ textAlign: "center", pt: 5, ...t("lato", 14, 21, 500, C.textMuted) }}>
                        {showArchived ? "No archived chats" : "No chats found"}
                    </Box>
                )}
            </Box>

            {/* Header menu */}
            <Menu
                anchorEl={menuEl}
                open={Boolean(menuEl)}
                onClose={() => setMenuEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: { ...menuPaperSx, mt: "4px", minWidth: 230 } } }}
            >
                <MenuItem onClick={runHeader(onMarkAllRead)}>
                    <ChatIcon name="grid" size={20} color={C.textMuted} />
                    Mark all as read
                </MenuItem>
                <MenuItem onClick={runHeader(onOpenProfile)}>
                    <Box sx={{ width: 24, height: 24, borderRadius: "49.5px", bgcolor: C.chipBorder, overflow: "hidden", flexShrink: 0 }}>
                        <Box component="img" src="/chats/av-me.png" alt="" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </Box>
                    My Profile
                </MenuItem>
                <Box sx={{ height: "1px", bgcolor: C.borderSoft, my: "4px" }} />
                <MenuItem onClick={runHeader(() => onNewChat("personal"))}>
                    <Box sx={menuIcon}><MdPersonAddAlt1 size={20} /></Box>New chat
                </MenuItem>
                <MenuItem onClick={runHeader(() => onNewChat("group"))}>
                    <Box sx={menuIcon}><MdGroupAdd size={20} /></Box>New group
                </MenuItem>
                <MenuItem onClick={runHeader(() => onNewChat("community"))}>
                    <Box sx={menuIcon}><MdShield size={20} /></Box>New community
                </MenuItem>
                <MenuItem onClick={runHeader(onOpenStarred)}>
                    <Box sx={menuIcon}><MdStarBorder size={20} /></Box>Starred messages
                </MenuItem>
                <MenuItem onClick={runHeader(() => setFavouritesOnly((v) => !v))}>
                    <Box sx={menuIcon}><MdFavoriteBorder size={20} /></Box>Favourite chats
                    <Box component="span" sx={menuHint}>{favouritesOnly ? "On" : "Off"}</Box>
                </MenuItem>
                <MenuItem onClick={runHeader(() => setShowArchived((v) => !v))}>
                    <ChatIcon name="archive" size={20} color={C.textMuted} />
                    {showArchived ? "Back to chats" : "Archived chats"}
                    {!showArchived && archivedCount > 0 && <Box component="span" sx={menuHint}>{archivedCount}</Box>}
                </MenuItem>
                <Box sx={{ height: "1px", bgcolor: C.borderSoft, my: "4px" }} />
                <MenuItem onClick={runHeader(onEnableNotifications)} disabled={permission === "unsupported"}>
                    <Box sx={menuIcon}>
                        {permission === "granted" ? <MdNotificationsActive size={20} />
                            : permission === "denied" ? <MdNotificationsOff size={20} />
                                : <MdNotificationsNone size={20} />}
                    </Box>
                    Desktop notifications
                    <Box component="span" sx={menuHint}>{notificationHint}</Box>
                </MenuItem>
                <MenuItem onClick={runHeader(onToggleSound)}>
                    <Box sx={menuIcon}>{soundOn ? <MdVolumeUp size={20} /> : <MdVolumeOff size={20} />}</Box>
                    Message sound
                    <Box component="span" sx={menuHint}>{soundOn ? "On" : "Off"}</Box>
                </MenuItem>
                <MenuItem onClick={runHeader(onToggleLive)}>
                    <Box sx={menuIcon}><MdBolt size={20} /></Box>
                    Simulate incoming
                    <Box component="span" sx={menuHint}>{liveOn ? "On" : "Off"}</Box>
                </MenuItem>
            </Menu>

            {/* Row menu */}
            <Menu
                open={Boolean(rowMenu)}
                onClose={closeRowMenu}
                anchorEl={rowMenu?.el ?? null}
                anchorReference={rowMenu?.el ? "anchorEl" : "anchorPosition"}
                anchorPosition={rowMenu?.pos}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: { ...menuPaperSx, mt: "4px" } } }}
            >
                <MenuItem onClick={runRow(onToggleArchive)}>
                    <ChatIcon name="archive" size={20} color={C.textMuted} />
                    {rowChat?.archived ? "Unarchive Chat" : "Archive Chat"}
                </MenuItem>
                <MenuItem onClick={runRow(onToggleRead)}>
                    <ChatIcon name="grid" size={20} color={C.textMuted} />
                    {rowChat && rowChat.unreadCount > 0 ? "Mark as read" : "Mark as unread"}
                </MenuItem>
                <MenuItem onClick={runRow(onTogglePin)}>
                    <ChatIcon name="grid" size={20} color={C.textMuted} />
                    {rowChat?.pinned ? "Unpin chat" : "Pin chat"}
                </MenuItem>
                <MenuItem onClick={runRow(onToggleMute)}>
                    <ChatIcon name="grid" size={20} color={C.textMuted} />
                    {rowChat?.muted ? "Unmute notification" : "Mute notification"}
                </MenuItem>
                <MenuItem onClick={runRow(onToggleBlock)}>
                    <ChatIcon name="grid" size={20} color={C.textMuted} />
                    {rowChat?.blocked ? "Unblock" : "Block"}
                </MenuItem>
                <MenuItem onClick={runRow(onReport)}>
                    <ChatIcon name="thumbs-down" size={20} color={C.textMuted} />
                    Report
                </MenuItem>
                <MenuItem onClick={runRow(onDeleteChat)} sx={{ fontFamily: `${FONT_LATO} !important`, fontWeight: "400 !important", color: `${C.danger} !important` }}>
                    <ChatIcon name="trash" size={20} color={C.danger} />
                    Delete
                </MenuItem>
            </Menu>
        </Box>
    );
}
