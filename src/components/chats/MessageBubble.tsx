"use client";

import React, { useState } from "react";
import { Box, Menu, MenuItem, Tooltip } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { MdAccessTime, MdInfoOutline, MdMic, MdPushPin, MdStar } from "react-icons/md";
import { C, menuPaperSx, senderColor, t } from "./theme";
import type { Attachment, MediaItem, Message, User } from "./types";
import { extractLinks, linkHost, stripHtml } from "./helpers";
import ChatAvatar from "./ChatAvatar";
import ChatIcon, { StatusTicks } from "./ChatIcon";
import ChatRichText from "./ChatRichText";
import MessageAttachments from "./MessageAttachments";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export type BubbleActions = {
    onReact: (messageId: string, emoji: string) => void;
    onReply: (message: Message) => void;
    onEdit: (message: Message) => void;
    onForward: (message: Message) => void;
    onStar: (messageId: string) => void;
    onPin: (messageId: string) => void;
    onCopy: (message: Message) => void;
    onReport: (message: Message) => void;
    onInfo: (message: Message) => void;
    onDelete: (messageId: string) => void;
    onJumpTo: (messageId: string) => void;
    onOpenMedia: (items: MediaItem[], index: number) => void;
    onOpenDocument: (att: Attachment) => void;
};

type Props = BubbleActions & {
    message: Message;
    users: Record<string, User>;
    isGroup: boolean;
    showAvatar: boolean;
    showName: boolean;
    searchTerm?: string;
    highlighted?: boolean;
};

const menuIcon = { display: "flex", color: C.textMuted, flexShrink: 0 } as const;

function Ticks({ status }: { status: Message["status"] }) {
    if (status === "sending") return <MdAccessTime size={16} color={C.textMuted} style={{ margin: "2px" }} />;
    return <StatusTicks double={status !== "sent"} color={status === "read" ? C.tick : C.textMuted} />;
}

/** Bubble tail from the Figma: a 9x7 wedge hanging off the top corner. */
function Tail({ mine }: { mine: boolean }) {
    return (
        <Box
            aria-hidden
            sx={{
                position: "absolute", top: 0, width: 9, height: 7, pointerEvents: "none",
                ...(mine ? { right: -9, transform: "rotate(180deg)" } : { left: -9, transform: "scaleY(-1)" }),
            }}
        >
            <Box
                component="img"
                src={mine ? "/chats/tail-right.svg" : "/chats/tail-left.svg"}
                alt=""
                sx={{ position: "absolute", left: "6.37%", top: 0, width: "93.63%", height: "100%", display: "block", maxWidth: "none" }}
            />
        </Box>
    );
}

function LinkCard({ url }: { url: string }) {
    return (
        <Box
            component="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
                display: "flex", flexDirection: "column", gap: "6px", px: "8px", py: "6px", borderRadius: "4px",
                background: C.bubbleCard, color: C.textBody, textDecoration: "none", minWidth: 0,
                "&:hover": { background: "rgba(3,6,12,0.6)" },
            }}
        >
            <Box sx={{ ...t("inter", 11, 16, 600, C.textBody), wordBreak: "break-all" }}>{linkHost(url)}</Box>
            <Box sx={{ ...t("inter", 11, 16, 400, C.textBody), wordBreak: "break-all" }}>{url}</Box>
        </Box>
    );
}

export default function MessageBubble({
    message, users, isGroup, showAvatar, showName, searchTerm = "", highlighted,
    onReact, onReply, onEdit, onForward, onStar, onPin, onCopy, onReport, onInfo, onDelete, onJumpTo, onOpenMedia, onOpenDocument,
}: Props) {
    const [menuEl, setMenuEl] = useState<null | HTMLElement>(null);
    const [reactBarOpen, setReactBarOpen] = useState(false);
    const mine = message.senderId === "me";
    const sender = users[message.senderId];

    if (message.system) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Box
                    sx={{
                        px: "12px", py: "4px", borderRadius: "8px", background: C.chipBg, border: `1px solid ${C.borderSoft}`,
                        maxWidth: "80%", textAlign: "center",
                        "& .rich-text": { ...t("lato", 12, 18, 500, C.textMuted), color: C.textMuted },
                    }}
                >
                    <ChatRichText html={message.html} />
                </Box>
            </Box>
        );
    }

    const text = stripHtml(message.html);
    const hasText = text.length > 0;
    const links = hasText ? extractLinks(message.html) : [];
    const linkOnly = links.length === 1 && text === links[0];
    const hasAttachments = Boolean(message.attachments && message.attachments.length > 0);
    const reactions = message.reactions ?? [];
    const totalReactions = reactions.reduce((n, r) => n + r.userIds.length, 0);
    const showFooter = mine || message.starred || message.pinned || message.edited;
    const canEdit = mine && !message.deleted && hasText && !hasAttachments;

    const act = (fn: () => void) => () => { setMenuEl(null); fn(); };

    return (
        <Box
            id={`msg-${message.id}`}
            sx={{
                position: "relative", display: "flex", justifyContent: mine ? "flex-end" : "flex-start", gap: "12px",
                mb: totalReactions > 0 ? "12px" : 0, borderRadius: "12px",
                background: highlighted ? C.active : "transparent", transition: "background 0.4s",
            }}
            onMouseLeave={() => setReactBarOpen(false)}
        >
            {!mine && isGroup && (
                <Box sx={{ width: 32, flexShrink: 0, alignSelf: "flex-end" }}>
                    {showAvatar && <ChatAvatar name={sender?.name ?? "?"} avatar={sender?.avatar} size={32} />}
                </Box>
            )}

            <Box
                sx={{
                    display: "flex", alignItems: "center", gap: "12px", minWidth: 0,
                    flexDirection: mine ? "row" : "row-reverse", maxWidth: { xs: "92%", md: "100%" },
                    "&:hover .msg-hover, &:focus-within .msg-hover": { opacity: 1, pointerEvents: "auto" },
                }}
            >
                {/* Quick actions beside the bubble */}
                <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, flexDirection: mine ? "row" : "row-reverse" }}>
                    <AnimatePresence>
                        {reactBarOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 6, scale: 0.9 }}
                                transition={{ duration: 0.15 }}
                                style={{
                                    position: "absolute", bottom: "calc(100% + 8px)", ...(mine ? { right: 0 } : { left: 0 }),
                                    display: "flex", gap: 2, padding: "4px 8px", background: C.menuBg,
                                    backdropFilter: "blur(6px)", borderRadius: 999, zIndex: 20, boxShadow: C.menuShadow,
                                }}
                            >
                                {QUICK_REACTIONS.map((emoji) => (
                                    <motion.button
                                        key={emoji}
                                        type="button"
                                        whileHover={{ scale: 1.3 }}
                                        whileTap={{ scale: 0.85 }}
                                        onClick={() => { onReact(message.id, emoji); setReactBarOpen(false); }}
                                        style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 18, lineHeight: "24px", padding: "0 3px" }}
                                    >
                                        {emoji}
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Box className="msg-hover" sx={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0, pointerEvents: "none", transition: "opacity 0.15s", flexDirection: mine ? "row" : "row-reverse" }}>
                        <Tooltip title="React" arrow>
                            <Box component="button" type="button" aria-label="React" onClick={() => setReactBarOpen((v) => !v)} sx={{ display: "flex", p: 0, border: "none", background: "transparent", cursor: "pointer" }}>
                                <ChatIcon name="smile" size={24} color={C.textMuted} />
                            </Box>
                        </Tooltip>
                        {!mine && <Box component="span" sx={{ ...t("lato", 12, 18, 500, C.textMuted), whiteSpace: "nowrap" }}>{message.time}</Box>}
                    </Box>

                    {(links.length > 0 || hasAttachments) && !message.deleted && (
                        <Tooltip title="Forward" arrow>
                            <Box component="button" type="button" aria-label="Forward" onClick={() => onForward(message)} sx={{ display: "flex", p: 0, border: "none", background: "transparent", cursor: "pointer" }}>
                                <ChatIcon name="forward" size={24} color={C.textMuted} />
                            </Box>
                        </Tooltip>
                    )}
                </Box>

                {/* Bubble */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    style={{ position: "relative", minWidth: 0, maxWidth: 640, flex: "0 1 auto" }}
                >
                    <Box
                        sx={{
                            position: "relative", display: "flex", flexDirection: "column", gap: "2px",
                            px: "20px", py: "16px", minWidth: 96,
                            borderRadius: mine ? "12px 0 12px 12px" : "0 12px 12px 12px",
                            background: message.deleted ? C.panelAlt : mine ? C.bubbleOut : C.bubbleIn,
                        }}
                    >
                        <Tail mine={mine} />

                        {/* Hover chevron opens the message menu */}
                        {!message.deleted && (
                            <Box
                                className="msg-hover"
                                component="button"
                                type="button"
                                aria-label="Message options"
                                onClick={(e: React.MouseEvent<HTMLElement>) => setMenuEl(e.currentTarget)}
                                sx={{
                                    position: "absolute", top: 0, right: 0, width: 43, height: 38, p: "10px", border: "none", cursor: "pointer",
                                    borderRadius: "4px", backdropFilter: "blur(2px)", opacity: 0, pointerEvents: "none", transition: "opacity 0.15s",
                                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
                                    background: "linear-gradient(58.7deg, rgba(7,7,7,0.24) 6.32%, rgba(109,105,105,0) 64.32%)",
                                }}
                            >
                                <ChatIcon name="chevron-16" size={16} color={C.textStrong} />
                            </Box>
                        )}

                        {showName && !mine && isGroup && (
                            <Box sx={{ ...t("lato", 14, 21, 700, senderColor(message.senderId)), mb: "2px" }}>{sender?.name ?? "Unknown"}</Box>
                        )}

                        {message.forwarded && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: "4px", mb: "2px" }}>
                                <ChatIcon name="forward" size={14} color={C.textMuted} />
                                <Box sx={{ ...t("lato", 12, 18, 500, C.textMuted), fontStyle: "italic" }}>Forwarded</Box>
                            </Box>
                        )}

                        {message.replyTo && (
                            <Box
                                onClick={() => onJumpTo(message.replyTo!.messageId)}
                                sx={{
                                    mb: "6px", px: "8px", py: "6px", cursor: "pointer", background: C.bubbleCard,
                                    borderLeft: `3px solid ${senderColor(message.replyTo.senderId)}`, borderRadius: "4px",
                                    "&:hover": { filter: "brightness(1.2)" }, minWidth: 0,
                                }}
                            >
                                <Box sx={t("lato", 12, 18, 700, senderColor(message.replyTo.senderId))}>
                                    {message.replyTo.senderId === "me" ? "You" : users[message.replyTo.senderId]?.name}
                                </Box>
                                <Box sx={{ ...t("lato", 12, 18, 500, C.textSoft), display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 320 }}>
                                    {message.replyTo.kind === "audio" && <MdMic size={13} />}
                                    {message.replyTo.preview}
                                </Box>
                            </Box>
                        )}

                        {message.deleted ? (
                            <Box sx={{ ...t("lato", 16, 24, 500, C.textMuted), fontStyle: "italic" }}>This message was deleted</Box>
                        ) : (
                            <>
                                {hasAttachments && (
                                    <Box sx={{ mb: hasText ? "6px" : 0 }}>
                                        <MessageAttachments
                                            attachments={message.attachments!}
                                            mine={mine}
                                            onOpenMedia={onOpenMedia}
                                            onOpenDocument={onOpenDocument}
                                        />
                                    </Box>
                                )}
                                {links.length > 0 && (
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", mb: linkOnly ? 0 : "6px" }}>
                                        <LinkCard url={links[0]} />
                                        {linkOnly && (
                                            <Box
                                                component="a"
                                                href={links[0]}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                sx={{ ...t("inter", 11, 16, 400, C.textBody), textDecoration: "none", wordBreak: "break-all" }}
                                            >
                                                {links[0]}
                                            </Box>
                                        )}
                                    </Box>
                                )}
                                {hasText && !linkOnly && <ChatRichText html={message.html} searchTerm={searchTerm} />}
                            </>
                        )}

                        {showFooter && (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", minHeight: 20 }}>
                                {message.starred && <MdStar size={14} color={C.star} />}
                                {message.pinned && <MdPushPin size={14} color={C.textMuted} />}
                                {message.edited && <Box sx={t("lato", 12, 18, 500, C.textMuted)}>Edited</Box>}
                                {mine && (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                        <Box sx={{ ...t("lato", 12, 18, 500, C.textMuted), whiteSpace: "nowrap" }}>{message.time}</Box>
                                        {!message.deleted && <Ticks status={message.status} />}
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>

                    {/* Reactions */}
                    {totalReactions > 0 && (
                        <Box sx={{ position: "absolute", bottom: -14, [mine ? "right" : "left"]: 12, display: "flex", gap: "4px", zIndex: 2 }}>
                            {reactions.map((r) => (
                                <motion.div
                                    key={r.emoji}
                                    initial={{ scale: 0.4, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                                >
                                    <Tooltip arrow title={r.userIds.map((id) => (id === "me" ? "You" : users[id]?.name ?? id)).join(", ")}>
                                        <Box
                                            onClick={() => onReact(message.id, r.emoji)}
                                            sx={{
                                                display: "flex", alignItems: "center", gap: "4px", px: "8px", py: "1px",
                                                borderRadius: "10px", cursor: "pointer", backdropFilter: "blur(6px)",
                                                background: r.userIds.includes("me") ? "rgba(47,83,173,0.9)" : C.menuBg,
                                                border: `1px solid ${r.userIds.includes("me") ? C.accentSoft : C.border}`,
                                                fontSize: "13px", lineHeight: "20px",
                                            }}
                                        >
                                            <span>{r.emoji}</span>
                                            {r.userIds.length > 1 && <Box component="span" sx={t("lato", 12, 18, 500, C.text)}>{r.userIds.length}</Box>}
                                        </Box>
                                    </Tooltip>
                                </motion.div>
                            ))}
                        </Box>
                    )}
                </motion.div>
            </Box>

            <Menu
                anchorEl={menuEl}
                open={Boolean(menuEl)}
                onClose={() => setMenuEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: { ...menuPaperSx, mt: "2px", width: 158 } } }}
            >
                <MenuItem onClick={act(() => onReply(message))}>
                    <ChatIcon name="reply" size={20} color={C.textMuted} />Reply
                </MenuItem>
                <MenuItem onClick={act(() => onCopy(message))}>
                    <ChatIcon name="copy" size={20} color={C.textMuted} />Copy
                </MenuItem>
                {canEdit && (
                    <MenuItem onClick={act(() => onEdit(message))}>
                        <ChatIcon name="edit" size={20} color={C.textMuted} />Edit
                    </MenuItem>
                )}
                <MenuItem onClick={act(() => setReactBarOpen(true))}>
                    <ChatIcon name="smile-20" size={20} color={C.textMuted} />React
                </MenuItem>
                <MenuItem onClick={act(() => onForward(message))}>
                    <ChatIcon name="forward" size={20} color={C.textMuted} />Forward
                </MenuItem>
                <MenuItem onClick={act(() => onPin(message.id))}>
                    <ChatIcon name="grid" size={20} color={C.textMuted} />{message.pinned ? "Unpin" : "Pin"}
                </MenuItem>
                <MenuItem onClick={act(() => onStar(message.id))}>
                    <ChatIcon name="star" size={20} color={C.textMuted} />{message.starred ? "Unstar" : "Star"}
                </MenuItem>
                {mine && (
                    <MenuItem onClick={act(() => onInfo(message))}>
                        <Box sx={menuIcon}><MdInfoOutline size={20} /></Box>Info
                    </MenuItem>
                )}
                <MenuItem onClick={act(() => onReport(message))}>
                    <ChatIcon name="thumbs-down" size={20} color={C.textMuted} />Report
                </MenuItem>
                <MenuItem onClick={act(() => onDelete(message.id))}>
                    <ChatIcon name="trash" size={20} color={C.textMuted} />Delete
                </MenuItem>
            </Menu>
        </Box>
    );
}
