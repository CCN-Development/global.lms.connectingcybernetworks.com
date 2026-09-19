"use client";

import React, { useMemo, useState } from "react";
import {
    Box, Divider, IconButton, InputBase, ListItemIcon, Menu, MenuItem,
    Switch, Tab, Tabs, Tooltip, Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import {
    MdClose, MdContentCopy, MdPhone, MdVideoCall, MdSearch, MdMoreVert,
    MdNotificationsNone, MdStar, MdFavorite, MdFavoriteBorder, MdBlock, MdFlag,
    MdDeleteOutline, MdLogout, MdPersonAddAlt1, MdAdminPanelSettings, MdChat,
    MdPersonRemove, MdGroups, MdShield, MdCampaign, MdLink, MdInsertDriveFile,
    MdImage, MdCalendarMonth,
} from "react-icons/md";
import { C, scrollbarSx } from "./theme";
import type { Attachment, Chat, MediaItem, Message, User } from "./types";
import { counterpartOf, fileAccent, isAdmin, roleOf } from "./helpers";
import ChatAvatar from "./ChatAvatar";

type Props = {
    chat: Chat;
    chats: Chat[];
    users: Record<string, User>;
    messages: Message[];
    media: string[];
    onClose: () => void;
    onToggleMute: (chatId: string) => void;
    onToggleFavorite: (chatId: string) => void;
    onDeleteChat: (chatId: string) => void;
    onOpenChat: (chatId: string) => void;
    onOpenMedia: (items: MediaItem[], index: number) => void;
    onOpenDocument: (att: Attachment) => void;
    onPromoteMember: (chatId: string, userId: string) => void;
    onRemoveMember: (chatId: string, userId: string) => void;
    onMessageMember: (userId: string) => void;
    onAddMembers: (chatId: string) => void;
    onExitChat: (chatId: string) => void;
};

const RoleChip = ({ role }: { role: "owner" | "admin" | "member" }) => {
    if (role === "member") return null;
    const isOwner = role === "owner";
    return (
        <Box
            sx={{
                px: 0.6, py: 0.05, borderRadius: "6px",
                background: isOwner ? "#3b2a05" : "#182039",
                border: `1px solid ${isOwner ? C.star : C.accent}`,
            }}
        >
            <Typography sx={{ fontSize: "0.55rem", fontWeight: 700, color: isOwner ? C.star : C.accentSoft, letterSpacing: "0.03em" }}>
                {isOwner ? "OWNER" : "ADMIN"}
            </Typography>
        </Box>
    );
};

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, px: 1.6, pt: 1.4, pb: 0.6 }}>
            <Box sx={{ color: C.accentSoft, display: "flex" }}>{icon}</Box>
            <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: C.textSoft, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {children}
            </Typography>
        </Box>
    );
}

function ActionRow({
    icon, label, danger, trailing, onClick,
}: { icon: React.ReactNode; label: string; danger?: boolean; trailing?: React.ReactNode; onClick?: () => void }) {
    return (
        <Box
            onClick={onClick}
            sx={{
                display: "flex", alignItems: "center", gap: 1.2, px: 1.6, py: 0.9, cursor: "pointer",
                "&:hover": { background: danger ? "#2a1220" : C.hover },
                transition: "background 0.15s",
            }}
        >
            <Box sx={{ color: danger ? C.danger : C.textSoft, display: "flex" }}>{icon}</Box>
            <Typography sx={{ flex: 1, fontSize: "0.74rem", color: danger ? C.danger : C.text }}>{label}</Typography>
            {trailing}
        </Box>
    );
}

export default function InfoPanel({
    chat, chats, users, messages, media, onClose, onToggleMute, onToggleFavorite,
    onDeleteChat, onOpenChat, onOpenMedia, onOpenDocument, onPromoteMember, onRemoveMember,
    onMessageMember, onAddMembers, onExitChat,
}: Props) {
    const [tab, setTab] = useState(0);
    const [memberQuery, setMemberQuery] = useState("");
    const [memberMenu, setMemberMenu] = useState<{ el: HTMLElement; userId: string } | null>(null);

    const isPersonal = chat.type === "personal";
    const other = isPersonal ? counterpartOf(chat, users) : undefined;
    const meIsAdmin = isAdmin(chat, "me");

    const docs = useMemo(
        () => messages.flatMap((m) => (m.attachments ?? []).filter((a) => a.kind === "file")),
        [messages],
    );
    const links = useMemo(() => {
        const found: string[] = [];
        messages.forEach((m) => {
            const matches = m.html.match(/https?:\/\/[^\s"'<]+/g);
            if (matches) found.push(...matches);
        });
        return Array.from(new Set(found));
    }, [messages]);

    const members = useMemo(() => {
        const q = memberQuery.trim().toLowerCase();
        const order = { owner: 0, admin: 1, member: 2 } as const;
        return [...chat.members]
            .filter((m) => (q ? (users[m.userId]?.name ?? "").toLowerCase().includes(q) : true))
            .sort((a, b) => order[a.role] - order[b.role] || (users[a.userId]?.name ?? "").localeCompare(users[b.userId]?.name ?? ""));
    }, [chat.members, memberQuery, users]);

    const linkedGroups = (chat.linkedGroupIds ?? [])
        .map((id) => chats.find((c) => c.id === id))
        .filter(Boolean) as Chat[];

    const tabLabels = isPersonal ? ["Overview", "Media"] : ["Overview", "Media", `Members ${chat.members.length}`];

    return (
        <Box
            sx={{
                width: "100%", height: "100%", display: "flex", flexDirection: "column",
                borderLeft: `1px solid ${C.border}`, background: C.panel, backdropFilter: "blur(14px)",
            }}
        >
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.6, py: 1.2, borderBottom: `1px solid ${C.border}` }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: C.text }}>
                    {isPersonal ? "Contact info" : chat.type === "group" ? "Group info" : "Community info"}
                </Typography>
                <IconButton size="small" onClick={onClose} sx={{ color: C.textSoft, "&:hover": { color: C.text } }}>
                    <MdClose size={16} />
                </IconButton>
            </Box>

            {/* Identity */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 2.2, pb: 1.4, gap: 0.7 }}>
                <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }}>
                    <ChatAvatar
                        name={chat.name}
                        avatar={chat.avatar}
                        type={chat.type}
                        size={86}
                        online={other?.isOnline}
                        ring
                    />
                </motion.div>
                <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", color: C.text, textAlign: "center", px: 2 }}>
                    {chat.name}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {chat.type === "community" && <MdShield size={12} color={C.star} />}
                    {chat.type === "group" && <MdGroups size={12} color="#38bdf8" />}
                    <Typography sx={{ fontSize: "0.68rem", color: C.textSoft }}>
                        {isPersonal
                            ? other?.designation ?? "Contact"
                            : `${chat.type === "group" ? "Group" : "Community"} · ${chat.members.length} members`}
                    </Typography>
                </Box>
                {chat.announcementOnly && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.25, borderRadius: "8px", background: "#3b2a05", border: `1px solid ${C.star}` }}>
                        <MdCampaign size={12} color={C.star} />
                        <Typography sx={{ fontSize: "0.6rem", color: C.star, fontWeight: 700 }}>Announcements only</Typography>
                    </Box>
                )}
            </Box>

            <Tabs
                value={tab}
                onChange={(_e, v) => setTab(v)}
                variant="fullWidth"
                sx={{
                    minHeight: 34, borderBottom: `1px solid ${C.border}`,
                    "& .MuiTab-root": { minHeight: 34, fontSize: "0.68rem", fontWeight: 600, color: C.textMuted, textTransform: "none", px: 0.5 },
                    "& .Mui-selected": { color: `${C.accentSoft} !important` },
                    "& .MuiTabs-indicator": { background: C.accent, height: 2 },
                }}
            >
                {tabLabels.map((l) => <Tab key={l} label={l} />)}
            </Tabs>

            <Box sx={{ flex: 1, overflowY: "auto", ...scrollbarSx }}>
                {/* ── Overview ── */}
                {tab === 0 && (
                    <>
                        {isPersonal ? (
                            <>
                                <Box sx={{ px: 1.6, pt: 1.4 }}>
                                    <Typography sx={{ fontSize: "0.6rem", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                                        About
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.74rem", color: C.text, mt: 0.3 }}>
                                        {other?.about ?? "Hey there! I am using CCN Chat."}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: "flex", gap: 1, px: 1.6, py: 1.4 }}>
                                    {[
                                        { icon: <MdVideoCall size={16} />, label: "Video" },
                                        { icon: <MdPhone size={15} />, label: "Voice" },
                                        { icon: <MdSearch size={15} />, label: "Search" },
                                    ].map((b) => (
                                        <Box
                                            key={b.label}
                                            sx={{
                                                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.2,
                                                py: 0.8, borderRadius: "8px", cursor: "pointer",
                                                border: `1px solid ${C.border}`, background: C.panelAlt, color: C.textSoft,
                                                "&:hover": { background: C.raised, color: C.text, borderColor: C.accent },
                                                transition: "all 0.15s",
                                            }}
                                        >
                                            {b.icon}
                                            <Typography sx={{ fontSize: "0.62rem" }}>{b.label}</Typography>
                                        </Box>
                                    ))}
                                </Box>

                                <Divider sx={{ borderColor: C.borderSoft }} />

                                {[
                                    { label: other?.phone, icon: <MdPhone size={14} />, caption: "Mobile" },
                                    { label: other?.email, icon: <MdLink size={14} />, caption: "Email" },
                                ]
                                    .filter((r) => r.label)
                                    .map((r) => (
                                        <Box key={r.caption} sx={{ display: "flex", alignItems: "center", gap: 1.2, px: 1.6, py: 0.9 }}>
                                            <Box sx={{ color: C.textSoft, display: "flex" }}>{r.icon}</Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography sx={{ fontSize: "0.58rem", color: C.textMuted }}>{r.caption}</Typography>
                                                <Typography sx={{ fontSize: "0.72rem", color: C.text, wordBreak: "break-all" }}>{r.label}</Typography>
                                            </Box>
                                            <Tooltip title="Copy" arrow>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => navigator.clipboard?.writeText(r.label ?? "")}
                                                    sx={{ color: C.textMuted, "&:hover": { color: C.text } }}
                                                >
                                                    <MdContentCopy size={13} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    ))}
                            </>
                        ) : (
                            <>
                                <Box sx={{ px: 1.6, pt: 1.4 }}>
                                    <Typography sx={{ fontSize: "0.6rem", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                                        Description
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.74rem", color: C.text, mt: 0.3, lineHeight: 1.6 }}>
                                        {chat.description ?? "No description added."}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.6, pt: 1.2 }}>
                                    <MdCalendarMonth size={14} color={C.textSoft} />
                                    <Typography sx={{ fontSize: "0.68rem", color: C.textSoft }}>
                                        Created by {users[chat.createdBy]?.name ?? "—"} on {chat.createdOn}
                                    </Typography>
                                </Box>

                                {linkedGroups.length > 0 && (
                                    <>
                                        <SectionTitle icon={<MdGroups size={13} />}>Groups in this community</SectionTitle>
                                        {linkedGroups.map((g) => (
                                            <Box
                                                key={g.id}
                                                onClick={() => onOpenChat(g.id)}
                                                sx={{
                                                    display: "flex", alignItems: "center", gap: 1, px: 1.6, py: 0.8, cursor: "pointer",
                                                    "&:hover": { background: C.hover },
                                                }}
                                            >
                                                <ChatAvatar name={g.name} type={g.type} size={30} />
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography sx={{ fontSize: "0.73rem", color: C.text, fontWeight: 600 }}>{g.name}</Typography>
                                                    <Typography sx={{ fontSize: "0.62rem", color: C.textMuted }}>{g.members.length} members</Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </>
                                )}

                                <SectionTitle icon={<MdAdminPanelSettings size={13} />}>Admins</SectionTitle>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6, px: 1.6, pb: 0.6 }}>
                                    {chat.members
                                        .filter((m) => m.role !== "member")
                                        .map((m) => (
                                            <Box
                                                key={m.userId}
                                                sx={{
                                                    display: "flex", alignItems: "center", gap: 0.5, px: 0.7, py: 0.3,
                                                    borderRadius: "14px", background: C.panelAlt, border: `1px solid ${C.border}`,
                                                }}
                                            >
                                                <ChatAvatar name={users[m.userId]?.name ?? "?"} avatar={users[m.userId]?.avatar} size={18} />
                                                <Typography sx={{ fontSize: "0.65rem", color: C.text }}>
                                                    {m.userId === "me" ? "You" : users[m.userId]?.name}
                                                </Typography>
                                            </Box>
                                        ))}
                                </Box>
                            </>
                        )}

                        <Divider sx={{ borderColor: C.borderSoft, mt: 1 }} />

                        <ActionRow
                            icon={<MdNotificationsNone size={16} />}
                            label="Mute notifications"
                            trailing={
                                <Switch
                                    checked={chat.muted}
                                    onChange={() => onToggleMute(chat.id)}
                                    size="small"
                                    sx={{ "& .MuiSwitch-thumb": { width: 12, height: 12 } }}
                                />
                            }
                        />
                        <ActionRow
                            icon={chat.favorite ? <MdFavorite size={16} color={C.danger} /> : <MdFavoriteBorder size={16} />}
                            label={chat.favorite ? "Remove from favourites" : "Add to favourites"}
                            onClick={() => onToggleFavorite(chat.id)}
                        />
                        <ActionRow icon={<MdStar size={16} />} label="Starred messages" />

                        <Divider sx={{ borderColor: C.borderSoft }} />

                        {isPersonal ? (
                            <>
                                <ActionRow icon={<MdBlock size={16} />} label={`Block ${chat.name}`} danger />
                                <ActionRow icon={<MdFlag size={16} />} label={`Report ${chat.name}`} danger />
                            </>
                        ) : (
                            <ActionRow
                                icon={<MdLogout size={16} />}
                                label={chat.type === "group" ? "Exit group" : "Exit community"}
                                danger
                                onClick={() => onExitChat(chat.id)}
                            />
                        )}
                        {/* <ActionRow icon={<MdDeleteOutline size={16} />} label="Delete chat" danger onClick={() => onDeleteChat(chat.id)} />
                        <Box sx={{ height: 12 }} /> */}
                    </>
                )}

                {/* ── Media ── */}
                {tab === 1 && (
                    <>
                        <SectionTitle icon={<MdImage size={13} />}>Media ({media.length})</SectionTitle>
                        {media.length === 0 ? (
                            <Typography sx={{ fontSize: "0.72rem", color: C.textMuted, px: 1.6 }}>No media shared yet</Typography>
                        ) : (
                            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0.5, px: 1.6 }}>
                                {media.map((src, i) => (
                                    <motion.div key={src + i} whileHover={{ scale: 1.05 }} transition={{ duration: 0.15 }}>
                                        <Box
                                            component="img"
                                            src={src}
                                            onClick={() => onOpenMedia(media.map((url) => ({ url, kind: "image" as const })), i)}
                                            sx={{
                                                width: "100%", aspectRatio: "1/1", objectFit: "cover", cursor: "pointer",
                                                borderRadius: "6px", border: `1px solid ${C.border}`, display: "block",
                                            }}
                                        />
                                    </motion.div>
                                ))}
                            </Box>
                        )}

                        <SectionTitle icon={<MdInsertDriveFile size={13} />}>Documents ({docs.length})</SectionTitle>
                        {docs.length === 0 ? (
                            <Typography sx={{ fontSize: "0.72rem", color: C.textMuted, px: 1.6 }}>No documents shared yet</Typography>
                        ) : (
                            docs.map((d) => (
                                <Box
                                    key={d.id}
                                    onClick={() => onOpenDocument(d)}
                                    sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.6, py: 0.7, cursor: "pointer", "&:hover": { background: C.hover } }}
                                >
                                    <Box
                                        sx={{
                                            width: 26, height: 26, borderRadius: "5px", flexShrink: 0,
                                            background: fileAccent(d.ext), color: "#ffffff",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}
                                    >
                                        <MdInsertDriveFile size={14} />
                                    </Box>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontSize: "0.72rem", color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {d.name}
                                        </Typography>
                                        <Typography sx={{ fontSize: "0.6rem", color: C.textMuted }}>{[d.ext, d.size].filter(Boolean).join(" · ")}</Typography>
                                    </Box>
                                </Box>
                            ))
                        )}

                        <SectionTitle icon={<MdLink size={13} />}>Links ({links.length})</SectionTitle>
                        {links.length === 0 ? (
                            <Typography sx={{ fontSize: "0.72rem", color: C.textMuted, px: 1.6, pb: 2 }}>No links shared yet</Typography>
                        ) : (
                            links.map((l) => (
                                <Box key={l} sx={{ px: 1.6, py: 0.6, "&:hover": { background: C.hover } }}>
                                    <Typography
                                        component="a"
                                        href={l}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ fontSize: "0.7rem", color: "#93c5fd", wordBreak: "break-all", textDecoration: "underline" }}
                                    >
                                        {l}
                                    </Typography>
                                </Box>
                            ))
                        )}
                        <Box sx={{ height: 12 }} />
                    </>
                )}

                {/* ── Members ── */}
                {tab === 2 && !isPersonal && (
                    <>
                        <Box sx={{ px: 1.6, pt: 1.2, pb: 0.8 }}>
                            <Box
                                sx={{
                                    display: "flex", alignItems: "center", gap: 0.8, px: 1, py: 0.4,
                                    background: C.panelAlt, border: `1px solid ${C.border}`, borderRadius: "8px",
                                    "&:focus-within": { borderColor: C.accent },
                                }}
                            >
                                <MdSearch size={15} color={C.textMuted} />
                                <InputBase
                                    value={memberQuery}
                                    onChange={(e) => setMemberQuery(e.target.value)}
                                    placeholder="Search members"
                                    sx={{ fontSize: "0.72rem", color: C.text, flex: 1 }}
                                />
                            </Box>
                        </Box>

                        {meIsAdmin && (
                            <Box
                                onClick={() => onAddMembers(chat.id)}
                                sx={{ display: "flex", alignItems: "center", gap: 1.2, px: 1.6, py: 0.9, cursor: "pointer", "&:hover": { background: C.hover } }}
                            >
                                <Box sx={{ width: 30, height: 30, borderRadius: "50%", background: C.accentGrad, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <MdPersonAddAlt1 size={16} color="#ffffff" />
                                </Box>
                                <Typography sx={{ fontSize: "0.74rem", color: C.accentSoft, fontWeight: 600 }}>Add members</Typography>
                            </Box>
                        )}

                        {members.map((m) => {
                            const u = users[m.userId];
                            return (
                                <Box
                                    key={m.userId}
                                    sx={{
                                        display: "flex", alignItems: "center", gap: 1.1, px: 1.6, py: 0.8,
                                        "&:hover": { background: C.hover }, "&:hover .member-more": { opacity: 1 },
                                    }}
                                >
                                    <ChatAvatar name={u?.name ?? "?"} avatar={u?.avatar} size={32} online={u?.isOnline} />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                                            <Typography sx={{ fontSize: "0.74rem", color: C.text, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {m.userId === "me" ? "You" : u?.name}
                                            </Typography>
                                            <RoleChip role={m.role} />
                                        </Box>
                                        <Typography sx={{ fontSize: "0.62rem", color: C.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {u?.about ?? u?.designation ?? "—"}
                                        </Typography>
                                    </Box>
                                    {m.userId !== "me" && (
                                        <IconButton
                                            className="member-more"
                                            size="small"
                                            onClick={(e) => setMemberMenu({ el: e.currentTarget, userId: m.userId })}
                                            sx={{ opacity: 0, color: C.textMuted, transition: "opacity 0.15s", "&:hover": { color: C.text } }}
                                        >
                                            <MdMoreVert size={15} />
                                        </IconButton>
                                    )}
                                </Box>
                            );
                        })}
                        <Box sx={{ height: 12 }} />
                    </>
                )}
            </Box>

            <Menu
                anchorEl={memberMenu?.el ?? null}
                open={Boolean(memberMenu)}
                onClose={() => setMemberMenu(null)}
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
                <MenuItem onClick={() => { if (memberMenu) onMessageMember(memberMenu.userId); setMemberMenu(null); }}>
                    <ListItemIcon><MdChat size={15} color={C.textSoft} /></ListItemIcon>Message
                </MenuItem>
                {meIsAdmin && memberMenu && (
                    <MenuItem onClick={() => { onPromoteMember(chat.id, memberMenu.userId); setMemberMenu(null); }}>
                        <ListItemIcon><MdAdminPanelSettings size={15} color={C.textSoft} /></ListItemIcon>
                        {roleOf(chat, memberMenu.userId) === "member" ? "Make admin" : "Dismiss as admin"}
                    </MenuItem>
                )}
                {meIsAdmin && (
                    <MenuItem
                        onClick={() => { if (memberMenu) onRemoveMember(chat.id, memberMenu.userId); setMemberMenu(null); }}
                        sx={{ color: C.danger }}
                    >
                        <ListItemIcon><MdPersonRemove size={15} color={C.danger} /></ListItemIcon>Remove
                    </MenuItem>
                )}
            </Menu>
        </Box>
    );
}
