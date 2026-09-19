"use client";

import React, { useState } from "react";
import { Avatar, Box, Divider, ListItemIcon, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import {
    MdDone, MdDoneAll, MdAccessTime, MdPushPin, MdStar, MdReply, MdForward,
    MdContentCopy, MdInfoOutline, MdDeleteOutline, MdMoreHoriz, MdStarOutline,
    MdOutlinePushPin, MdAddReaction, MdMic,
} from "react-icons/md";
import { C, senderColor } from "./theme";
import type { Attachment, MediaItem, Message, MsgStatus, User } from "./types";
import { stripHtml } from "./helpers";
import ChatRichText from "./ChatRichText";
import MessageAttachments from "./MessageAttachments";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

function Ticks({ status }: { status: MsgStatus }) {
    if (status === "sending") return <MdAccessTime size={13} color="#c7d2fe" />;
    if (status === "read") return <MdDoneAll size={14} color={C.tick} />;
    if (status === "delivered") return <MdDoneAll size={14} color="#c7d2fe" />;
    return <MdDone size={14} color="#c7d2fe" />;
}

export type BubbleActions = {
    onReact: (messageId: string, emoji: string) => void;
    onReply: (message: Message) => void;
    onForward: (message: Message) => void;
    onStar: (messageId: string) => void;
    onPin: (messageId: string) => void;
    onCopy: (message: Message) => void;
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

export default function MessageBubble({
    message, users, isGroup, showAvatar, showName, searchTerm = "", highlighted,
    onReact, onReply, onForward, onStar, onPin, onCopy, onInfo, onDelete, onJumpTo, onOpenMedia, onOpenDocument,
}: Props) {
    const [menuEl, setMenuEl] = useState<null | HTMLElement>(null);
    const [reactBarOpen, setReactBarOpen] = useState(false);
    const mine = message.senderId === "me";
    const sender = users[message.senderId];

    if (message.system) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", my: 0.8 }}>
                <Box
                    sx={{
                        px: 1.4, py: 0.4, borderRadius: "8px", background: C.chipBg,
                        border: `1px solid ${C.border}`, maxWidth: "80%",
                        "& .rich-text": { fontSize: "0.66rem", textAlign: "center", color: C.textSoft },
                    }}
                >
                    <ChatRichText html={message.html} />
                </Box>
            </Box>
        );
    }

    const hasText = stripHtml(message.html).length > 0;
    const reactions = message.reactions ?? [];
    const totalReactions = reactions.reduce((n, r) => n + r.userIds.length, 0);

    const act = (fn: () => void) => () => { setMenuEl(null); fn(); };

    return (
        <Box
            id={`msg-${message.id}`}
            sx={{
                display: "flex",
                justifyContent: mine ? "flex-end" : "flex-start",
                gap: 0.8,
                mb: totalReactions > 0 ? 1.4 : 0.35,
                px: 0.4,
                borderRadius: "10px",
                background: highlighted ? C.selected : "transparent",
                transition: "background 0.4s",
                "&:hover .msg-tools": { opacity: 1, pointerEvents: "auto" },
            }}
            onMouseLeave={() => setReactBarOpen(false)}
        >
            {!mine && isGroup && (
                <Box sx={{ width: 26, flexShrink: 0, alignSelf: "flex-end" }}>
                    {showAvatar && (
                        <Avatar src={sender?.avatar} sx={{ width: 26, height: 26, fontSize: "0.6rem" }}>
                            {sender?.name?.[0]}
                        </Avatar>
                    )}
                </Box>
            )}

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexDirection: mine ? "row" : "row-reverse", maxWidth: { xs: "88%", md: "68%" } }}>
                {/* Hover tools */}
                <Box
                    className="msg-tools"
                    sx={{ display: "flex", alignItems: "center", gap: 0.3, opacity: 0, pointerEvents: "none", transition: "opacity 0.15s", position: "relative" }}
                >
                    <AnimatePresence>
                        {reactBarOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 6, scale: 0.9 }}
                                transition={{ duration: 0.15 }}
                                style={{
                                    position: "absolute", bottom: "calc(100% + 6px)",
                                    ...(mine ? { right: 0 } : { left: 0 }),
                                    display: "flex", gap: 2, padding: "4px 6px",
                                    background: C.panelSolid, border: `1px solid ${C.border}`,
                                    borderRadius: 999, zIndex: 20, boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
                                }}
                            >
                                {QUICK_REACTIONS.map((emoji) => (
                                    <motion.button
                                        key={emoji}
                                        type="button"
                                        whileHover={{ scale: 1.3 }}
                                        whileTap={{ scale: 0.85 }}
                                        onClick={() => { onReact(message.id, emoji); setReactBarOpen(false); }}
                                        style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 17, lineHeight: "22px", padding: "0 2px" }}
                                    >
                                        {emoji}
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Tooltip title="React" arrow>
                        <Box
                            onClick={() => setReactBarOpen((v) => !v)}
                            sx={{ cursor: "pointer", color: C.textMuted, display: "flex", "&:hover": { color: C.text } }}
                        >
                            <MdAddReaction size={15} />
                        </Box>
                    </Tooltip>
                    <Tooltip title="Reply" arrow>
                        <Box onClick={() => onReply(message)} sx={{ cursor: "pointer", color: C.textMuted, display: "flex", "&:hover": { color: C.text } }}>
                            <MdReply size={16} />
                        </Box>
                    </Tooltip>
                    <Tooltip title="More" arrow>
                        <Box onClick={(e) => setMenuEl(e.currentTarget)} sx={{ cursor: "pointer", color: C.textMuted, display: "flex", "&:hover": { color: C.text } }}>
                            <MdMoreHoriz size={16} />
                        </Box>
                    </Tooltip>
                </Box>

                {/* Bubble */}
                <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    style={{ position: "relative", minWidth: 0 }}
                >
                    <Box
                        sx={{
                            px: 1.3, py: 0.9,
                            borderRadius: mine ? "12px 3px 12px 12px" : "3px 12px 12px 12px",
                            background: message.deleted ? C.panelAlt : mine ? C.bubbleOut : C.bubbleIn,
                            border: message.deleted ? `1px dashed ${C.border}` : `1px solid ${mine ? "#5b4fd6" : C.border}`,
                            boxShadow: "0 2px 10px rgba(0,0,0,0.28)",
                            minWidth: 96,
                        }}
                    >
                        {showName && !mine && isGroup && (
                            <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: senderColor(message.senderId), mb: 0.3 }}>
                                {sender?.name ?? "Unknown"}
                            </Typography>
                        )}

                        {message.forwarded && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, mb: 0.3 }}>
                                <MdForward size={12} color={mine ? "#c7d2fe" : C.textMuted} />
                                <Typography sx={{ fontSize: "0.62rem", fontStyle: "italic", color: mine ? "#c7d2fe" : C.textMuted }}>
                                    Forwarded
                                </Typography>
                            </Box>
                        )}

                        {message.replyTo && (
                            <Box
                                onClick={() => onJumpTo(message.replyTo!.messageId)}
                                sx={{
                                    display: "flex", gap: 0.8, mb: 0.6, p: 0.7, cursor: "pointer",
                                    background: mine ? "#3c31b8" : C.panelAlt,
                                    borderLeft: `3px solid ${senderColor(message.replyTo.senderId)}`,
                                    borderRadius: "6px",
                                    "&:hover": { filter: "brightness(1.12)" },
                                }}
                            >
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: senderColor(message.replyTo.senderId) }}>
                                        {message.replyTo.senderId === "me" ? "You" : users[message.replyTo.senderId]?.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.66rem", color: mine ? "#dbeafe" : C.textSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220, display: "flex", alignItems: "center", gap: 0.3 }}>
                                        {message.replyTo.kind === "audio" && <MdMic size={11} />}
                                        {message.replyTo.preview}
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {message.deleted ? (
                            <Typography sx={{ fontSize: "0.74rem", fontStyle: "italic", color: C.textMuted }}>
                                This message was deleted
                            </Typography>
                        ) : (
                            <>
                                {message.attachments && message.attachments.length > 0 && (
                                    <Box sx={{ mb: hasText ? 0.6 : 0 }}>
                                        <MessageAttachments
                                            attachments={message.attachments}
                                            mine={mine}
                                            onOpenMedia={onOpenMedia}
                                            onOpenDocument={onOpenDocument}
                                        />
                                    </Box>
                                )}
                                {hasText && <ChatRichText html={message.html} searchTerm={searchTerm} />}
                            </>
                        )}

                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.4, mt: 0.3 }}>
                            {message.starred && <MdStar size={11} color={C.star} />}
                            {message.pinned && <MdPushPin size={11} color={mine ? "#c7d2fe" : C.textMuted} />}
                            {message.edited && (
                                <Typography sx={{ fontSize: "0.58rem", color: mine ? "#c7d2fe" : C.textMuted }}>edited</Typography>
                            )}
                            <Typography sx={{ fontSize: "0.6rem", color: mine ? "#dbeafe" : C.textMuted }}>{message.time}</Typography>
                            {mine && !message.deleted && <Ticks status={message.status} />}
                        </Box>
                    </Box>

                    {/* Reactions */}
                    {totalReactions > 0 && (
                        <Box
                            sx={{
                                position: "absolute", bottom: -12, [mine ? "right" : "left"]: 8,
                                display: "flex", gap: 0.3, zIndex: 2,
                            }}
                        >
                            {reactions.map((r) => (
                                <motion.div
                                    key={r.emoji}
                                    initial={{ scale: 0.4, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                                >
                                    <Tooltip
                                        arrow
                                        title={r.userIds.map((id) => (id === "me" ? "You" : users[id]?.name ?? id)).join(", ")}
                                    >
                                        <Box
                                            onClick={() => onReact(message.id, r.emoji)}
                                            sx={{
                                                display: "flex", alignItems: "center", gap: 0.3,
                                                px: 0.6, py: 0.1, borderRadius: "10px", cursor: "pointer",
                                                background: r.userIds.includes("me") ? C.accentDark : C.raised,
                                                border: `1px solid ${r.userIds.includes("me") ? C.accentSoft : C.border}`,
                                                fontSize: "0.7rem", lineHeight: 1.5,
                                            }}
                                        >
                                            <span>{r.emoji}</span>
                                            {r.userIds.length > 1 && (
                                                <Typography sx={{ fontSize: "0.6rem", color: C.text, fontWeight: 600 }}>
                                                    {r.userIds.length}
                                                </Typography>
                                            )}
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
                slotProps={{
                    paper: {
                        sx: {
                            background: C.panelSolid, border: `1px solid ${C.border}`, borderRadius: "10px",
                            minWidth: 190, color: C.text,
                            "& .MuiMenuItem-root": { fontSize: "0.74rem", py: 0.7 },
                            "& .MuiListItemIcon-root": { minWidth: 28, color: C.textSoft },
                        },
                    },
                }}
            >
                <MenuItem onClick={act(() => onReply(message))}>
                    <ListItemIcon><MdReply size={15} /></ListItemIcon>Reply
                </MenuItem>
                <MenuItem onClick={act(() => onForward(message))}>
                    <ListItemIcon><MdForward size={15} /></ListItemIcon>Forward
                </MenuItem>
                <MenuItem onClick={act(() => onStar(message.id))}>
                    <ListItemIcon>{message.starred ? <MdStar size={15} color={C.star} /> : <MdStarOutline size={15} />}</ListItemIcon>
                    {message.starred ? "Unstar" : "Star"}
                </MenuItem>
                <MenuItem onClick={act(() => onPin(message.id))}>
                    <ListItemIcon>{message.pinned ? <MdPushPin size={15} color={C.accentSoft} /> : <MdOutlinePushPin size={15} />}</ListItemIcon>
                    {message.pinned ? "Unpin" : "Pin"}
                </MenuItem>
                <MenuItem onClick={act(() => onCopy(message))}>
                    <ListItemIcon><MdContentCopy size={15} /></ListItemIcon>Copy text
                </MenuItem>
                {mine && (
                    <MenuItem onClick={act(() => onInfo(message))}>
                        <ListItemIcon><MdInfoOutline size={15} /></ListItemIcon>Message info
                    </MenuItem>
                )}
                <Divider sx={{ borderColor: C.border, my: 0.4 }} />
                <MenuItem onClick={act(() => onDelete(message.id))} sx={{ color: C.danger }}>
                    <ListItemIcon><MdDeleteOutline size={15} color={C.danger} /></ListItemIcon>Delete
                </MenuItem>
            </Menu>
        </Box>
    );
}
