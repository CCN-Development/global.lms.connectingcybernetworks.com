"use client";

import React, { useEffect, useRef, useState } from "react";
import { Box, IconButton, InputBase, Tooltip, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import {
    MdClose, MdSend, MdPersonAddAlt1, MdMicOff, MdMic, MdPushPin, MdBackHand,
    MdContentCopy, MdLock, MdInfoOutline, MdPresentToAll,
} from "react-icons/md";
import { M, meetScrollbarSx } from "./theme";
import type { MeetChatMessage, PanelTab, Participant } from "./types";
import { clockLabel, meetUrl } from "./meetHelpers";

type Props = {
    tab: PanelTab;
    roomId: string;
    participants: Participant[];
    messages: MeetChatMessage[];
    onClose: () => void;
    onSendMessage: (text: string) => void;
    onInvite: () => void;
    onPin: (id: string) => void;
    onMuteParticipant: (id: string) => void;
};

const TITLES: Record<Exclude<PanelTab, null>, string> = {
    people: "People",
    chat: "In-call messages",
    info: "Meeting details",
    activities: "Activities",
};

export default function SidePanel({
    tab, roomId, participants, messages, onClose, onSendMessage, onInvite, onPin, onMuteParticipant,
}: Props) {
    const [draft, setDraft] = useState("");
    const [copied, setCopied] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    if (!tab) return null;

    const send = () => {
        const text = draft.trim();
        if (!text) return;
        onSendMessage(text);
        setDraft("");
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(meetUrl(roomId));
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            setCopied(false);
        }
    };

    return (
        <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ height: "100%" }}
        >
            <Box
                sx={{
                    width: { xs: "100vw", sm: 320 }, height: "100%", display: "flex", flexDirection: "column",
                    background: M.surface, border: `1px solid ${M.border}`, borderRadius: "12px", overflow: "hidden",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.6, py: 1.2, borderBottom: `1px solid ${M.borderSoft}` }}>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: M.text }}>{TITLES[tab]}</Typography>
                    <IconButton size="small" onClick={onClose} sx={{ color: M.textSoft }}><MdClose size={17} /></IconButton>
                </Box>

                {/* People */}
                {tab === "people" && (
                    <Box sx={{ flex: 1, overflowY: "auto", ...meetScrollbarSx }}>
                        <Box
                            onClick={onInvite}
                            sx={{
                                display: "flex", alignItems: "center", gap: 1, m: 1.2, px: 1.2, py: 0.9,
                                borderRadius: "22px", cursor: "pointer", border: `1px solid ${M.border}`,
                                color: M.accentSoft, "&:hover": { background: M.raised },
                            }}
                        >
                            <MdPersonAddAlt1 size={17} />
                            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600 }}>Add people</Typography>
                        </Box>

                        <Typography sx={{ px: 1.6, py: 0.6, fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.06em", color: M.textMuted }}>
                            IN CALL ({participants.length})
                        </Typography>

                        {participants.map((p) => (
                            <Box
                                key={p.id}
                                sx={{
                                    display: "flex", alignItems: "center", gap: 1, px: 1.6, py: 0.8,
                                    "&:hover": { background: M.raised }, "&:hover .p-actions": { opacity: 1 },
                                }}
                            >
                                {p.avatar ? (
                                    <Box
                                        component="img"
                                        src={p.avatar}
                                        alt={p.name}
                                        sx={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: M.surfaceAlt }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                                            background: M.accentGrad, display: "flex", alignItems: "center", justifyContent: "center",
                                            color: M.text, fontSize: "0.8rem", fontWeight: 700,
                                        }}
                                    >
                                        {p.name.slice(0, 1).toUpperCase()}
                                    </Box>
                                )}

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: "0.76rem", color: M.text, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {p.isYou ? `${p.name} (You)` : p.name}
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        {p.host && <Typography sx={{ fontSize: "0.6rem", color: M.accentSoft, fontWeight: 700 }}>Host</Typography>}
                                        {p.presenting && (
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.2 }}>
                                                <MdPresentToAll size={11} color={M.online} />
                                                <Typography sx={{ fontSize: "0.6rem", color: M.online }}>Presenting</Typography>
                                            </Box>
                                        )}
                                        {p.handRaised && (
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.2 }}>
                                                <MdBackHand size={11} color={M.warn} />
                                                <Typography sx={{ fontSize: "0.6rem", color: M.warn }}>Raised hand</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>

                                <Box className="p-actions" sx={{ display: "flex", gap: 0.2, opacity: 0, transition: "opacity 0.15s" }}>
                                    <Tooltip title="Pin" arrow>
                                        <IconButton size="small" onClick={() => onPin(p.id)} sx={{ color: p.pinned ? M.accentSoft : M.textMuted }}>
                                            <MdPushPin size={14} />
                                        </IconButton>
                                    </Tooltip>
                                    {!p.isYou && (
                                        <Tooltip title={p.micOn ? "Mute for everyone" : "Muted"} arrow>
                                            <IconButton size="small" onClick={() => onMuteParticipant(p.id)} sx={{ color: p.micOn ? M.textMuted : M.danger }}>
                                                {p.micOn ? <MdMic size={14} /> : <MdMicOff size={14} />}
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}

                {/* Chat */}
                {tab === "chat" && (
                    <>
                        <Box sx={{ px: 1.6, py: 1, borderBottom: `1px solid ${M.borderSoft}` }}>
                            <Typography sx={{ fontSize: "0.66rem", color: M.textMuted }}>
                                Messages can only be seen by people in the call and are deleted when the call ends.
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1, overflowY: "auto", px: 1.6, py: 1.2, ...meetScrollbarSx }}>
                            <AnimatePresence initial={false}>
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.18 }}
                                    >
                                        <Box sx={{ mb: 1.4 }}>
                                            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.8 }}>
                                                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: M.text }}>
                                                    {msg.senderName}
                                                </Typography>
                                                <Typography sx={{ fontSize: "0.6rem", color: M.textMuted }}>{msg.time}</Typography>
                                            </Box>
                                            <Typography sx={{ fontSize: "0.75rem", color: M.textSoft, mt: 0.2, wordBreak: "break-word" }}>
                                                {msg.text}
                                            </Typography>
                                        </Box>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <div ref={endRef} />
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, px: 1.2, py: 1, borderTop: `1px solid ${M.borderSoft}` }}>
                            <InputBase
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                                placeholder="Send a message"
                                sx={{
                                    flex: 1, fontSize: "0.78rem", color: M.text, px: 1.2, py: 0.6,
                                    borderRadius: "18px", background: M.surfaceAlt, border: `1px solid ${M.border}`,
                                }}
                            />
                            <IconButton size="small" onClick={send} sx={{ color: draft.trim() ? M.accentSoft : M.textMuted }}>
                                <MdSend size={18} />
                            </IconButton>
                        </Box>
                    </>
                )}

                {/* Info */}
                {tab === "info" && (
                    <Box sx={{ flex: 1, overflowY: "auto", p: 1.6, ...meetScrollbarSx }}>
                        <Typography sx={{ fontSize: "0.72rem", color: M.textSoft }}>
                            Share this with people you want in the meeting
                        </Typography>
                        <Box sx={{ mt: 1, p: 1.2, borderRadius: "8px", background: M.surfaceAlt, border: `1px solid ${M.border}` }}>
                            <Typography sx={{ fontSize: "0.72rem", color: M.text, wordBreak: "break-all" }}>{meetUrl(roomId)}</Typography>
                            <Typography sx={{ fontSize: "0.66rem", color: M.textMuted, mt: 0.4, fontFamily: "monospace" }}>
                                Code: {roomId}
                            </Typography>
                        </Box>
                        <Box
                            onClick={copyLink}
                            sx={{
                                display: "inline-flex", alignItems: "center", gap: 0.6, mt: 1.2, px: 1.2, py: 0.6,
                                borderRadius: "18px", cursor: "pointer", color: M.accentSoft, border: `1px solid ${M.border}`,
                                "&:hover": { background: M.raised },
                            }}
                        >
                            <MdContentCopy size={14} />
                            <Typography sx={{ fontSize: "0.74rem", fontWeight: 600 }}>{copied ? "Copied" : "Copy joining info"}</Typography>
                        </Box>

                        <Box sx={{ display: "flex", gap: 0.8, mt: 2.4 }}>
                            <MdLock size={14} color={M.textMuted} />
                            <Typography sx={{ fontSize: "0.68rem", color: M.textMuted }}>
                                Joining is restricted to signed-in CCN accounts. The host can admit external guests.
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 0.8, mt: 1 }}>
                            <MdInfoOutline size={14} color={M.textMuted} />
                            <Typography sx={{ fontSize: "0.68rem", color: M.textMuted }}>
                                Recording, transcripts and breakout rooms activate once the media backend is connected.
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* Activities */}
                {tab === "activities" && (
                    <Box sx={{ flex: 1, overflowY: "auto", p: 1.6, ...meetScrollbarSx }}>
                        {[
                            { label: "Whiteboard", desc: "Sketch network topologies with the batch" },
                            { label: "Polls", desc: "Run a quick quiz during the session" },
                            { label: "Q&A", desc: "Collect questions without interrupting" },
                            { label: "Breakout rooms", desc: "Split the batch into lab teams" },
                            { label: "Recording", desc: "Save the session to the batch library" },
                        ].map((item) => (
                            <Box
                                key={item.label}
                                sx={{
                                    p: 1.2, mb: 1, borderRadius: "10px", background: M.surfaceAlt,
                                    border: `1px solid ${M.border}`, cursor: "not-allowed", opacity: 0.85,
                                }}
                            >
                                <Typography sx={{ fontSize: "0.76rem", color: M.text, fontWeight: 600 }}>{item.label}</Typography>
                                <Typography sx={{ fontSize: "0.66rem", color: M.textMuted }}>{item.desc}</Typography>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </motion.div>
    );
}
