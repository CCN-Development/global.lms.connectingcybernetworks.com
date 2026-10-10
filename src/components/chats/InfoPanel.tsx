"use client";

import React, { useMemo, useState } from "react";
import { Box, InputBase, Menu, MenuItem } from "@mui/material";
import toast from "react-hot-toast";
import {
    MdAdminPanelSettings, MdCalendarMonth, MdChat, MdGroups, MdLogout, MdPersonAddAlt1, MdPersonRemove,
    MdShield, MdCampaign,
} from "react-icons/md";
import { C, menuPaperSx, scrollbarSx, t } from "./theme";
import type { Attachment, Chat, MediaItem, Message, User } from "./types";
import { counterpartOf, extractLinks, isAdmin, linkHost, roleOf } from "./helpers";
import ChatAvatar from "./ChatAvatar";
import ChatIcon, { type ChatIconName } from "./ChatIcon";
import { CheckBox, ToggleSwitch } from "./ChatControls";
import { DocCard } from "./MessageAttachments";

type SharedTab = "media" | "docs" | "links";

export type ForwardPayload = { text?: string; attachments?: Attachment[] };
export type DeletePayload = { messageIds: string[]; mediaUrls: string[] };

type Props = {
    chat: Chat;
    chats: Chat[];
    users: Record<string, User>;
    messages: Message[];
    media: string[];
    sharedDocs: Attachment[];
    sharedLinks: string[];
    onClose: () => void;
    onToggleMute: (chatId: string) => void;
    onToggleFavorite: (chatId: string) => void;
    onToggleBlock: (chatId: string) => void;
    onReport: (chatId: string) => void;
    onDeleteChat: (chatId: string) => void;
    onOpenChat: (chatId: string) => void;
    onOpenMedia: (items: MediaItem[], index: number) => void;
    onOpenDocument: (att: Attachment) => void;
    onOpenStarred: () => void;
    onPromoteMember: (chatId: string, userId: string) => void;
    onRemoveMember: (chatId: string, userId: string) => void;
    onMessageMember: (userId: string) => void;
    onAddMembers: (chatId: string) => void;
    onExitChat: (chatId: string) => void;
    onStartCall: (chatId: string) => void;
    onStartMeeting: (chatId: string) => void;
    onForwardItems: (payload: ForwardPayload) => void;
    onStarItems: (messageIds: string[]) => void;
    onDeleteItems: (payload: DeletePayload) => void;
};

type MediaEntry = { id: string; url: string; messageId?: string };
type DocEntry = { id: string; att: Attachment; messageId?: string };
type LinkEntry = { id: string; url: string; messageId?: string };

const plainBtn = { display: "flex", p: 0, border: "none", background: "transparent", cursor: "pointer", flexShrink: 0 } as const;
const divider = { height: "1px", width: "100%", bgcolor: C.border, flexShrink: 0 } as const;

const RoleChip = ({ role }: { role: "owner" | "admin" | "member" }) => {
    if (role === "member") return null;
    const isOwner = role === "owner";
    return (
        <Box
            sx={{
                px: "8px", borderRadius: "6px", border: `1px solid ${isOwner ? C.star : C.accentSoft}`,
                ...t("lato", 10, 16, 700, isOwner ? C.star : C.accentSoft), letterSpacing: "0.04em",
            }}
        >
            {isOwner ? "OWNER" : "ADMIN"}
        </Box>
    );
};

function ActionRow({
    icon, label, danger, trailing, onClick,
}: { icon: ChatIconName | React.ReactNode; label: string; danger?: boolean; trailing?: React.ReactNode; onClick?: () => void }) {
    const color = danger ? C.danger : C.textBody;
    return (
        <Box
            onClick={onClick}
            sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", flexShrink: 0,
                cursor: onClick ? "pointer" : "default", "&:hover .row-label": onClick ? { opacity: 0.8 } : {},
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                {typeof icon === "string"
                    ? <ChatIcon name={icon as ChatIconName} size={20} color={danger ? C.danger : C.textSoft} />
                    : <Box sx={{ display: "flex", color: danger ? C.danger : C.textSoft }}>{icon}</Box>}
                <Box className="row-label" sx={{ ...t("lato", 14, 21, 500, color), whiteSpace: "nowrap", transition: "opacity 0.15s" }}>{label}</Box>
            </Box>
            {trailing}
        </Box>
    );
}

function SectionLabel({ icon, children, trailing }: { icon?: React.ReactNode; children: React.ReactNode; trailing?: React.ReactNode }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", flexShrink: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px", ...t("lato", 14, 21, 400, C.textMuted) }}>
                {icon}
                {children}
            </Box>
            {trailing}
        </Box>
    );
}

function LinkPreview({ url, onOpen }: { url: string; onOpen?: boolean }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "6px", px: "8px", py: "6px", borderRadius: "4px", background: C.linkCard }}>
                <Box sx={{ ...t("inter", 11, 16, 600, C.textBody), wordBreak: "break-all" }}>{linkHost(url)}</Box>
                <Box sx={{ ...t("inter", 11, 16, 400, C.textBody), wordBreak: "break-all" }}>{url}</Box>
            </Box>
            <Box
                component="a"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e: React.MouseEvent) => { if (!onOpen) e.preventDefault(); }}
                sx={{ ...t("inter", 11, 16, 400, C.accentSoft), textDecoration: "none", wordBreak: "break-all", "&:hover": { textDecoration: "underline" } }}
            >
                {url}
            </Box>
        </Box>
    );
}

export default function InfoPanel({
    chat, chats, users, messages, media, sharedDocs, sharedLinks, onClose, onToggleMute, onToggleFavorite, onToggleBlock, onReport,
    onDeleteChat, onOpenChat, onOpenMedia, onOpenDocument, onOpenStarred, onPromoteMember, onRemoveMember,
    onMessageMember, onAddMembers, onExitChat, onStartCall, onStartMeeting, onForwardItems, onStarItems, onDeleteItems,
}: Props) {
    const [view, setView] = useState<"overview" | "shared">("overview");
    const [tab, setTab] = useState<SharedTab>("media");
    const [selecting, setSelecting] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [memberQuery, setMemberQuery] = useState("");
    const [memberMenu, setMemberMenu] = useState<{ el: HTMLElement; userId: string } | null>(null);

    const isPersonal = chat.type === "personal";
    const other = isPersonal ? counterpartOf(chat, users) : undefined;
    const meIsAdmin = isAdmin(chat, "me");

    const mediaEntries = useMemo<MediaEntry[]>(
        () => media.map((url, i) => ({
            id: `media-${i}`,
            url,
            messageId: messages.find((m) => m.attachments?.some((a) => a.url === url))?.id,
        })),
        [media, messages],
    );

    const docEntries = useMemo<DocEntry[]>(() => {
        const fromMessages = messages.flatMap((m) =>
            (m.attachments ?? []).filter((a) => a.kind === "file").map((att) => ({ id: att.id, att, messageId: m.id })),
        );
        const known = new Set(fromMessages.map((d) => d.id));
        return [...sharedDocs.filter((a) => !known.has(a.id)).map((att) => ({ id: att.id, att })), ...fromMessages];
    }, [messages, sharedDocs]);

    const linkEntries = useMemo<LinkEntry[]>(() => {
        const fromMessages = messages.flatMap((m) => extractLinks(m.html).map((url, i) => ({ id: `${m.id}:${i}`, url, messageId: m.id })));
        return [...fromMessages, ...sharedLinks.map((url, i) => ({ id: `seed:${i}`, url }))];
    }, [messages, sharedLinks]);

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

    const counts = { media: mediaEntries.length, docs: docEntries.length, links: linkEntries.length };

    /* ── selection ──────────────────────────────────────────────── */
    const clearSelection = () => { setSelecting(false); setSelected([]); };
    const toggleSelected = (id: string) =>
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    const switchTab = (next: SharedTab) => { setTab(next); clearSelection(); };
    const openShared = (next: SharedTab) => { setTab(next); clearSelection(); setView("shared"); };
    const leaveShared = () => { clearSelection(); setView("overview"); };

    const pickedMedia = mediaEntries.filter((e) => selected.includes(e.id));
    const pickedDocs = docEntries.filter((e) => selected.includes(e.id));
    const pickedLinks = linkEntries.filter((e) => selected.includes(e.id));
    const pickedCount = selected.length;

    const handleStar = () => {
        const ids = [...pickedMedia, ...pickedDocs, ...pickedLinks].map((e) => e.messageId).filter(Boolean) as string[];
        if (ids.length === 0) {
            toast("These items are not linked to a message");
            return;
        }
        onStarItems(Array.from(new Set(ids)));
        clearSelection();
    };

    const handleDelete = () => {
        const ids = [...pickedMedia, ...pickedDocs, ...pickedLinks].map((e) => e.messageId).filter(Boolean) as string[];
        onDeleteItems({
            messageIds: Array.from(new Set(ids)),
            mediaUrls: pickedMedia.map((e) => e.url),
        });
        clearSelection();
    };

    const handleForward = () => {
        const attachments: Attachment[] = [
            ...pickedMedia.map((e, i) => ({ id: `fw-${e.id}-${i}`, kind: "image" as const, name: `image-${i + 1}`, url: e.url })),
            ...pickedDocs.map((e) => e.att),
        ];
        const text = pickedLinks.map((e) => e.url).join("\n");
        onForwardItems({ attachments: attachments.length ? attachments : undefined, text: text || undefined });
        clearSelection();
    };

    const handleDownload = () => {
        const files = [
            ...pickedMedia.map((e, i) => ({ url: e.url, name: `image-${i + 1}` })),
            ...pickedDocs.map((e) => ({ url: e.att.url, name: e.att.name })),
        ].filter((f) => f.url && f.url !== "#");
        if (files.length === 0) {
            toast("Nothing to download in the selection");
            return;
        }
        files.forEach((file) => {
            const a = document.createElement("a");
            a.href = file.url;
            a.download = file.name;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            document.body.appendChild(a);
            a.click();
            a.remove();
        });
        clearSelection();
    };

    const copy = (text?: string) => {
        if (!text) return;
        void navigator.clipboard?.writeText(text).then(() => toast.success("Copied"), () => toast.error("Could not copy"));
    };

    const frame = {
        width: "100%", height: "100%", display: "flex", flexDirection: "column", gap: "32px", p: "32px",
        borderLeft: `1px solid ${C.border}`, overflowY: "auto", overflowX: "hidden", ...scrollbarSx,
    } as const;

    /* ── shared media / docs / links ────────────────────────────── */
    if (view === "shared") {
        const tabs: { key: SharedTab; label: string }[] = [
            { key: "media", label: `Media (${counts.media})` },
            { key: "docs", label: `Docs (${counts.docs})` },
            { key: "links", label: `Links (${counts.links})` },
        ];
        const toolbar: { icon: ChatIconName; label: string; run: () => void }[] = [
            { icon: "star", label: "Star", run: handleStar },
            { icon: "trash", label: "Delete", run: handleDelete },
            { icon: "forward", label: "Forward", run: handleForward },
            { icon: "download", label: "Download", run: handleDownload },
        ];

        return (
            <Box sx={frame}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                    <Box component="button" type="button" aria-label={selecting ? "Cancel selection" : "Back"} onClick={selecting ? clearSelection : leaveShared} sx={plainBtn}>
                        <ChatIcon name="arrow-left" size={28} color="#fff" />
                    </Box>
                    {selecting ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <Box component="span" sx={{ ...t("lato", 12, 18, 500, C.textMuted), mr: "4px" }}>{pickedCount} selected</Box>
                            {toolbar.map((b) => (
                                <Box
                                    key={b.label}
                                    component="button"
                                    type="button"
                                    aria-label={b.label}
                                    disabled={pickedCount === 0}
                                    onClick={b.run}
                                    sx={{ ...plainBtn, opacity: pickedCount === 0 ? 0.4 : 1, "&:hover": { opacity: pickedCount === 0 ? 0.4 : 0.75 } }}
                                >
                                    <ChatIcon name={b.icon} size={20} />
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Box
                            component="button"
                            type="button"
                            onClick={() => setSelecting(true)}
                            disabled={counts[tab] === 0}
                            sx={{ ...plainBtn, ...t("lato", 14, 21, 500, C.textSoft), opacity: counts[tab] === 0 ? 0.4 : 1, "&:hover": { color: C.text } }}
                        >
                            Select
                        </Box>
                    )}
                </Box>

                <Box sx={{ display: "flex", gap: "32px", flexShrink: 0 }}>
                    {tabs.map((tabItem) => {
                        const active = tab === tabItem.key;
                        return (
                            <Box
                                key={tabItem.key}
                                component="button"
                                type="button"
                                onClick={() => switchTab(tabItem.key)}
                                sx={{
                                    flex: 1, minWidth: 0, p: 0, pb: active ? "8px" : "10px", background: "transparent", cursor: "pointer",
                                    border: "none", borderBottom: active ? `2px solid ${C.accent}` : "none",
                                    ...t("lato", 14, 21, 400, active ? C.text : C.textMuted),
                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", "&:hover": { color: C.text },
                                }}
                            >
                                {tabItem.label}
                            </Box>
                        );
                    })}
                </Box>

                {tab === "media" && (
                    counts.media === 0 ? (
                        <Box sx={{ ...t("lato", 14, 21, 500, C.textMuted), textAlign: "center" }}>No media shared yet</Box>
                    ) : (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px", alignContent: "flex-start" }}>
                            {mediaEntries.map((entry, i) => {
                                const checked = selected.includes(entry.id);
                                return (
                                    <Box
                                        key={entry.id}
                                        onClick={() => (selecting ? toggleSelected(entry.id) : onOpenMedia(mediaEntries.map((m) => ({ url: m.url, kind: "image" as const })), i))}
                                        sx={{ position: "relative", width: 82, height: 82, borderRadius: "8px", overflow: "hidden", cursor: "pointer", flexShrink: 0, outline: checked ? `2px solid ${C.accentSoft}` : "none", outlineOffset: -2 }}
                                    >
                                        <Box component="img" src={entry.url} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", background: "#fff" }} />
                                        {selecting && (
                                            <>
                                                <Box sx={{ position: "absolute", inset: 0, borderRadius: "8px", background: "linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(51,51,51,0.88) 33.97%, rgba(102,102,102,0) 100%)" }} />
                                                <Box sx={{ position: "absolute", left: 5, top: 6 }}>
                                                    <CheckBox checked={checked} onChange={() => toggleSelected(entry.id)} label="Select media" />
                                                </Box>
                                            </>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                    )
                )}

                {tab === "docs" && (
                    counts.docs === 0 ? (
                        <Box sx={{ ...t("lato", 14, 21, 500, C.textMuted), textAlign: "center" }}>No documents shared yet</Box>
                    ) : (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {docEntries.map((entry) => (
                                <Box key={entry.id} sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                    {selecting && <CheckBox checked={selected.includes(entry.id)} onChange={() => toggleSelected(entry.id)} label={`Select ${entry.att.name}`} />}
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <DocCard att={entry.att} minWidth={0} onOpen={() => (selecting ? toggleSelected(entry.id) : onOpenDocument(entry.att))} />
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )
                )}

                {tab === "links" && (
                    counts.links === 0 ? (
                        <Box sx={{ ...t("lato", 14, 21, 500, C.textMuted), textAlign: "center" }}>No links shared yet</Box>
                    ) : (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {linkEntries.map((entry) => (
                                <Box
                                    key={entry.id}
                                    onClick={() => { if (selecting) toggleSelected(entry.id); }}
                                    sx={{ display: "flex", alignItems: "center", gap: "16px", cursor: selecting ? "pointer" : "default" }}
                                >
                                    {selecting && <CheckBox checked={selected.includes(entry.id)} onChange={() => toggleSelected(entry.id)} label="Select link" />}
                                    <LinkPreview url={entry.url} onOpen={!selecting} />
                                </Box>
                            ))}
                        </Box>
                    )
                )}
            </Box>
        );
    }

    /* ── contact / group info ───────────────────────────────────── */
    const title = isPersonal ? "Contact Info" : chat.type === "group" ? "Group Info" : "Community Info";

    return (
        <Box sx={{ ...frame, alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", flexShrink: 0 }}>
                <Box component="h2" sx={{ m: 0, ...t("poppins", 20, 30, 500, C.text) }}>{title}</Box>
                <Box component="button" type="button" aria-label="Close info" onClick={onClose} sx={plainBtn}>
                    <ChatIcon name="x" size={28} color="#fff" />
                </Box>
            </Box>

            <ChatAvatar name={chat.name} avatar={chat.avatar} type={chat.type} size={120} />

            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", maxWidth: "100%", flexShrink: 0 }}>
                <Box sx={{ ...t("lato", 18, 27, 700, C.text), textAlign: "center", wordBreak: "break-word" }}>{chat.name}</Box>
                {isPersonal ? (
                    <>
                        {other?.phone && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: "12px", ...t("lato", 16, 24, 500, C.textSoft) }}>
                                {other.phone}
                                <Box component="button" type="button" aria-label="Copy phone number" onClick={() => copy(other.phone)} sx={plainBtn}>
                                    <ChatIcon name="copy" size={16} color={C.textSoft} />
                                </Box>
                            </Box>
                        )}
                        {other?.email && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: "12px", ...t("lato", 16, 24, 500, C.textSoft) }}>
                                {other.email}
                                <Box component="button" type="button" aria-label="Copy email" onClick={() => copy(other.email)} sx={plainBtn}>
                                    <ChatIcon name="copy" size={16} color={C.textSoft} />
                                </Box>
                            </Box>
                        )}
                    </>
                ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "6px", ...t("lato", 16, 24, 500, C.textSoft) }}>
                        {chat.type === "community" ? <MdShield size={16} color={C.star} /> : <MdGroups size={16} color={C.accentSoft} />}
                        {chat.type === "group" ? "Group" : "Community"} · {chat.members.length} members
                    </Box>
                )}
                {chat.announcementOnly && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mt: "4px", px: "12px", borderRadius: "8px", border: `1px solid ${C.star}`, ...t("lato", 12, 20, 500, C.star) }}>
                        <MdCampaign size={14} />Announcement only
                    </Box>
                )}
            </Box>

            {/* Call actions */}
            <Box sx={{ display: "flex", gap: "12px", width: "100%", flexShrink: 0 }}>
                {[
                    { label: isPersonal ? "Video Call" : "Start CCN Meet", icon: <ChatIcon name="video" size={20} color={C.textSoft} />, run: () => onStartMeeting(chat.id) },
                    ...(isPersonal ? [{ label: "Phone Call", icon: <ChatIcon name="phone" size={16} color={C.textSoft} />, run: () => onStartCall(chat.id) }] : []),
                ].map((b) => (
                    <Box
                        key={b.label}
                        component="button"
                        type="button"
                        onClick={b.run}
                        sx={{
                            flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", p: "8px",
                            borderRadius: "12px", border: `1px solid ${C.textSoft}`, background: "rgba(255,255,255,0.04)",
                            backdropFilter: "blur(15px)", cursor: "pointer", ...t("lato", 12, 18, 400, C.textSoft),
                            whiteSpace: "nowrap", transition: "background 0.15s ease",
                            "&:hover": { background: "rgba(255,255,255,0.1)" },
                        }}
                    >
                        {b.icon}
                        {b.label}
                    </Box>
                ))}
            </Box>

            {!isPersonal && (
                <>
                    <Box sx={divider} />
                    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px", flexShrink: 0 }}>
                        <SectionLabel>DESCRIPTION</SectionLabel>
                        <Box sx={{ ...t("lato", 14, 21, 500, C.textStrong), wordBreak: "break-word" }}>{chat.description ?? "No description added."}</Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", ...t("lato", 12, 18, 500, C.textMuted) }}>
                            <MdCalendarMonth size={14} />
                            Created by {users[chat.createdBy]?.name ?? "—"} on {chat.createdOn}
                        </Box>
                    </Box>
                </>
            )}

            <Box sx={divider} />

            {/* Media */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", flexShrink: 0 }}>
                <Box
                    onClick={() => openShared("media")}
                    sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", ...t("lato", 14, 21, 400, C.textMuted), "&:hover": { color: C.textSoft } }}
                >
                    <span>MEDIA</span>
                    <Box component="span" sx={{ color: C.textStrong }}>{counts.media}</Box>
                </Box>
                {mediaEntries.length > 0 ? (
                    <Box sx={{ borderRadius: "12px", p: "12px", background: "rgba(147,169,226,0.08)", overflow: "hidden" }}>
                        <Box sx={{ display: "flex", gap: "8px", overflowX: "auto", ...scrollbarSx, "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}>
                            {mediaEntries.map((entry, i) => (
                                <Box
                                    key={entry.id}
                                    component="img"
                                    src={entry.url}
                                    alt=""
                                    onClick={() => onOpenMedia(mediaEntries.map((m) => ({ url: m.url, kind: "image" as const })), i)}
                                    sx={{ width: 100, height: 100, flexShrink: 0, borderRadius: "8px", objectFit: "cover", cursor: "pointer", background: "#fff", display: "block" }}
                                />
                            ))}
                        </Box>
                    </Box>
                ) : (
                    <Box
                        onClick={() => openShared(counts.docs > 0 ? "docs" : "links")}
                        sx={{ borderRadius: "12px", p: "12px", background: "rgba(147,169,226,0.08)", ...t("lato", 12, 18, 500, C.textMuted), cursor: "pointer" }}
                    >
                        No media yet · {counts.docs} docs · {counts.links} links
                    </Box>
                )}
            </Box>

            <Box sx={divider} />

            {/* Settings */}
            <ActionRow
                icon="bell"
                label="Mute Notification"
                trailing={<ToggleSwitch checked={chat.muted} onChange={() => onToggleMute(chat.id)} label="Mute notifications" />}
            />
            <ActionRow icon="star" label="Starred Messages" onClick={onOpenStarred} />
            <ActionRow
                icon="heart"
                label={chat.favorite ? "Remove from Favorites" : "Add to Favorites"}
                onClick={() => onToggleFavorite(chat.id)}
            />

            {!isPersonal && (
                <>
                    {linkedGroups.length > 0 && (
                        <>
                            <Box sx={divider} />
                            <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px", flexShrink: 0 }}>
                                <SectionLabel icon={<MdGroups size={16} />}>GROUPS IN THIS COMMUNITY</SectionLabel>
                                {linkedGroups.map((g) => (
                                    <Box key={g.id} onClick={() => onOpenChat(g.id)} sx={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", "&:hover": { opacity: 0.85 } }}>
                                        <ChatAvatar name={g.name} type={g.type} size={36} />
                                        <Box sx={{ minWidth: 0 }}>
                                            <Box sx={{ ...t("lato", 14, 21, 500, C.text), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.name}</Box>
                                            <Box sx={t("lato", 12, 18, 500, C.textMuted)}>{g.members.length} members</Box>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </>
                    )}

                    <Box sx={divider} />
                    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px", flexShrink: 0 }}>
                        <SectionLabel
                            icon={<MdAdminPanelSettings size={16} />}
                            trailing={<Box component="span" sx={{ color: C.textStrong, ...t("lato", 14, 21, 400) }}>{chat.members.length}</Box>}
                        >
                            MEMBERS
                        </SectionLabel>

                        <Box
                            sx={{
                                display: "flex", alignItems: "center", gap: "8px", height: 40, px: "12px", borderRadius: "99px",
                                border: `1px solid ${C.chipBorder}`, background: "linear-gradient(180deg, rgba(187,201,237,0.1) 0%, rgba(106,114,135,0.06) 100%)",
                            }}
                        >
                            <ChatIcon name="search-24" size={20} />
                            <InputBase
                                value={memberQuery}
                                onChange={(e) => setMemberQuery(e.target.value)}
                                placeholder="Search members"
                                sx={{ flex: 1, ...t("inter", 14, 21, 400, C.text), "& input": { p: 0 }, "& input::placeholder": { color: C.textMuted, opacity: 1 } }}
                            />
                        </Box>

                        {meIsAdmin && (
                            <Box onClick={() => onAddMembers(chat.id)} sx={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", "&:hover": { opacity: 0.85 } }}>
                                <Box sx={{ width: 36, height: 36, borderRadius: "50%", background: C.accentGrad, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <MdPersonAddAlt1 size={18} color="#fff" />
                                </Box>
                                <Box sx={t("lato", 14, 21, 500, C.accentSoft)}>Add members</Box>
                            </Box>
                        )}

                        {members.map((m) => {
                            const user = users[m.userId];
                            const isMe = m.userId === "me";
                            return (
                                <Box key={m.userId} sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <ChatAvatar name={user?.name ?? "?"} avatar={user?.avatar} size={36} />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Box sx={{ ...t("lato", 14, 21, 500, C.text), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {isMe ? "You" : user?.name}
                                        </Box>
                                        <Box sx={{ ...t("lato", 12, 18, 500, C.textMuted), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {user?.designation ?? user?.about ?? ""}
                                        </Box>
                                    </Box>
                                    <RoleChip role={roleOf(chat, m.userId)} />
                                    {!isMe && (
                                        <Box
                                            component="button"
                                            type="button"
                                            aria-label={`Options for ${user?.name}`}
                                            onClick={(e: React.MouseEvent<HTMLElement>) => setMemberMenu({ el: e.currentTarget, userId: m.userId })}
                                            sx={plainBtn}
                                        >
                                            <ChatIcon name="more-vertical" size={20} />
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                </>
            )}

            {!isPersonal && <Box sx={divider} />}

            {isPersonal ? (
                <>
                    <ActionRow icon="minus-circle" label={chat.blocked ? `Unblock ${chat.name}` : `Block ${chat.name}`} danger onClick={() => onToggleBlock(chat.id)} />
                    <ActionRow icon="thumbs-down" label={`Report ${chat.name}`} danger onClick={() => onReport(chat.id)} />
                </>
            ) : (
                <ActionRow
                    icon={<MdLogout size={20} />}
                    label={chat.type === "group" ? "Exit group" : "Exit community"}
                    danger
                    onClick={() => onExitChat(chat.id)}
                />
            )}
            <ActionRow icon="trash" label="Delete Chats" danger onClick={() => onDeleteChat(chat.id)} />

            {/* Member menu */}
            <Menu
                anchorEl={memberMenu?.el ?? null}
                open={Boolean(memberMenu)}
                onClose={() => setMemberMenu(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: { ...menuPaperSx, mt: "4px", minWidth: 200 } } }}
            >
                {memberMenu && (() => {
                    const target = memberMenu.userId;
                    const role = roleOf(chat, target);
                    const canManage = meIsAdmin && role !== "owner";
                    const close = () => setMemberMenu(null);
                    return [
                        <MenuItem key="msg" onClick={() => { close(); onMessageMember(target); }}>
                            <Box sx={{ display: "flex", color: C.textMuted }}><MdChat size={20} /></Box>Message
                        </MenuItem>,
                        canManage && (
                            <MenuItem key="role" onClick={() => { close(); onPromoteMember(chat.id, target); }}>
                                <Box sx={{ display: "flex", color: C.textMuted }}><MdAdminPanelSettings size={20} /></Box>
                                {role === "admin" ? "Dismiss as admin" : "Make admin"}
                            </MenuItem>
                        ),
                        canManage && (
                            <MenuItem key="remove" onClick={() => { close(); onRemoveMember(chat.id, target); }} sx={{ color: `${C.danger} !important` }}>
                                <Box sx={{ display: "flex", color: C.danger }}><MdPersonRemove size={20} /></Box>Remove
                            </MenuItem>
                        ),
                    ];
                })()}
            </Menu>
        </Box>
    );
}
