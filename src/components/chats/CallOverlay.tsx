"use client";

import React, { useEffect, useRef, useState } from "react";
import { Box, Dialog, IconButton, Tooltip, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import {
    MdCallEnd, MdMic, MdMicOff, MdVolumeUp, MdVolumeOff, MdDialpad,
    MdPersonAddAlt1, MdVideocam, MdInfoOutline,
} from "react-icons/md";
import { C } from "./theme";
import ChatAvatar from "./ChatAvatar";
import type { ChatType } from "./types";

export type CallTarget = {
    chatId: string;
    name: string;
    avatar?: string;
    type: ChatType;
    subtitle?: string;
};

export type CallSummary = {
    chatId: string;
    seconds: number;
    outcome: "completed" | "no-answer" | "cancelled";
};

type Phase = "requesting" | "calling" | "ringing" | "connected" | "ended";

const PHASE_LABEL: Record<Phase, string> = {
    requesting: "Preparing microphone…",
    calling: "Calling…",
    ringing: "Ringing…",
    connected: "Connected",
    ended: "Call ended",
};

type Props = {
    target: CallTarget | null;
    onClose: (summary: CallSummary) => void;
    onSwitchToVideo: (chatId: string) => void;
};

export default function CallOverlay({ target, onClose, onSwitchToVideo }: Props) {
    const [phase, setPhase] = useState<Phase>("requesting");
    const [seconds, setSeconds] = useState(0);
    const [micOn, setMicOn] = useState(true);
    const [speakerOn, setSpeakerOn] = useState(true);
    const [notice, setNotice] = useState<string | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    const open = Boolean(target);

    /* Ask for the microphone, then walk through the dial → ring → connect states. */
    useEffect(() => {
        if (!target) return;

        setPhase("requesting");
        setSeconds(0);
        setMicOn(true);
        setNotice(null);

        let cancelled = false;

        const begin = async () => {
            if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    if (cancelled) {
                        stream.getTracks().forEach((t) => t.stop());
                        return;
                    }
                    streamRef.current = stream;
                } catch {
                    if (!cancelled) setNotice("Microphone is blocked — the other person will not hear you.");
                }
            } else if (!cancelled) {
                setNotice("This browser cannot access the microphone.");
            }

            if (cancelled) return;
            setPhase("calling");
            timersRef.current.push(setTimeout(() => setPhase("ringing"), 1600));
            timersRef.current.push(setTimeout(() => setPhase("connected"), 4600));
        };

        void begin();

        return () => {
            cancelled = true;
            timersRef.current.forEach(clearTimeout);
            timersRef.current = [];
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        };
    }, [target]);

    useEffect(() => {
        if (phase !== "connected") return;
        const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(timer);
    }, [phase]);

    if (!target) return null;

    const duration = `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

    const hangUp = () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setPhase("ended");
        setTimeout(() => {
            onClose({
                chatId: target.chatId,
                seconds,
                outcome: seconds > 0 ? "completed" : phase === "connected" ? "completed" : "cancelled",
            });
        }, 700);
    };

    const toggleMic = () => {
        const next = !micOn;
        streamRef.current?.getAudioTracks().forEach((track) => { track.enabled = next; });
        setMicOn(next);
    };

    const connecting = phase !== "connected" && phase !== "ended";

    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth="xs"
            onClose={hangUp}
            slotProps={{
                paper: {
                    sx: {
                        background: C.panelSolid,
                        border: `1px solid ${C.border}`,
                        borderRadius: "16px",
                        backgroundImage: "none",
                        overflow: "hidden",
                    },
                },
            }}
        >
            <Box sx={{ px: 3, pt: 4, pb: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                {/* Pulsing avatar */}
                <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", mb: 0.5 }}>
                    <AnimatePresence>
                        {connecting && [0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 1, opacity: 0.5 }}
                                animate={{ scale: 1.85, opacity: 0 }}
                                transition={{ duration: 2.1, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
                                style={{
                                    position: "absolute", width: 96, height: 96, borderRadius: "50%",
                                    border: `2px solid ${C.accentSoft}`,
                                }}
                            />
                        ))}
                    </AnimatePresence>
                    <ChatAvatar name={target.name} avatar={target.avatar} type={target.type} size={96} ring />
                </Box>

                <Typography sx={{ fontSize: "1.05rem", fontWeight: 700, color: C.text }}>{target.name}</Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                    <Box
                        sx={{
                            width: 7, height: 7, borderRadius: "50%",
                            background: phase === "connected" ? C.online : phase === "ended" ? C.danger : C.accentSoft,
                            animation: connecting ? "chat-rec-pulse 1.4s infinite" : "none",
                        }}
                    />
                    <Typography sx={{ fontSize: "0.76rem", color: C.textSoft }}>
                        {phase === "connected" ? duration : PHASE_LABEL[phase]}
                    </Typography>
                </Box>

                <Typography sx={{ fontSize: "0.68rem", color: C.textMuted }}>
                    {phase === "connected" ? "CCN voice call · end-to-end encrypted" : target.subtitle ?? "CCN voice call"}
                </Typography>

                {/* Live audio bars */}
                {phase === "connected" && (
                    <Box sx={{ display: "flex", alignItems: "flex-end", gap: "3px", height: 22, mt: 1 }}>
                        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                            <motion.div
                                key={i}
                                animate={{ height: micOn ? [6, 18, 9, 22, 8] : [4, 4] }}
                                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.1 }}
                                style={{ width: 3, borderRadius: 2, background: micOn ? C.accentSoft : C.textMuted }}
                            />
                        ))}
                    </Box>
                )}

                {notice && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 1, px: 1.2, py: 0.6, borderRadius: "8px", background: C.panelAlt, border: `1px solid ${C.star}` }}>
                        <MdInfoOutline size={14} color={C.star} />
                        <Typography sx={{ fontSize: "0.68rem", color: C.textSoft }}>{notice}</Typography>
                    </Box>
                )}

                {/* Controls */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mt: 3 }}>
                    <Tooltip title={micOn ? "Mute" : "Unmute"} arrow>
                        <IconButton
                            onClick={toggleMic}
                            sx={{
                                width: 46, height: 46, color: C.text,
                                background: micOn ? C.panelAlt : C.danger,
                                border: `1px solid ${micOn ? C.border : C.danger}`,
                                "&:hover": { background: micOn ? C.raised : "#e11d48" },
                            }}
                        >
                            {micOn ? <MdMic size={20} /> : <MdMicOff size={20} />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={speakerOn ? "Speaker on" : "Speaker off"} arrow>
                        <IconButton
                            onClick={() => setSpeakerOn((v) => !v)}
                            sx={{
                                width: 46, height: 46, color: C.text,
                                background: speakerOn ? C.accentDark : C.panelAlt,
                                border: `1px solid ${speakerOn ? C.accent : C.border}`,
                                "&:hover": { background: speakerOn ? C.accent : C.raised },
                            }}
                        >
                            {speakerOn ? <MdVolumeUp size={20} /> : <MdVolumeOff size={20} />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Keypad" arrow>
                        <IconButton sx={{ width: 46, height: 46, color: C.textSoft, background: C.panelAlt, border: `1px solid ${C.border}`, "&:hover": { background: C.raised } }}>
                            <MdDialpad size={19} />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Add participant" arrow>
                        <IconButton sx={{ width: 46, height: 46, color: C.textSoft, background: C.panelAlt, border: `1px solid ${C.border}`, "&:hover": { background: C.raised } }}>
                            <MdPersonAddAlt1 size={19} />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Switch to CCN Meet" arrow>
                        <IconButton
                            onClick={() => { hangUp(); onSwitchToVideo(target.chatId); }}
                            sx={{ width: 46, height: 46, color: C.textSoft, background: C.panelAlt, border: `1px solid ${C.border}`, "&:hover": { background: C.raised, color: C.text } }}
                        >
                            <MdVideocam size={20} />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Tooltip title="End call" arrow>
                    <IconButton
                        onClick={hangUp}
                        sx={{
                            width: 64, height: 46, borderRadius: "23px", mt: 2,
                            background: C.danger, color: C.text, "&:hover": { background: "#e11d48" },
                        }}
                    >
                        <MdCallEnd size={22} />
                    </IconButton>
                </Tooltip>
            </Box>
        </Dialog>
    );
}
