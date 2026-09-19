"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { MdMicOff, MdPushPin, MdPresentToAll, MdBackHand, MdSignalCellularAlt } from "react-icons/md";
import { M } from "./theme";
import type { Participant } from "./types";
import { useVideoStream } from "./useLocalMedia";

type Props = {
    participant: Participant;
    stream?: MediaStream | null;
    compact?: boolean;
    onPin?: () => void;
};

export default function ParticipantTile({ participant, stream, compact, onPin }: Props) {
    const videoRef = useVideoStream(stream ?? null);
    const showVideo = participant.camOn && (stream?.getVideoTracks().length ?? 0) > 0;
    const initial = participant.name.slice(0, 1).toUpperCase();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            style={{ width: "100%", height: "100%", minHeight: 0 }}
        >
            <Box
                onDoubleClick={onPin}
                sx={{
                    position: "relative", width: "100%", height: "100%", minHeight: compact ? 96 : 140,
                    borderRadius: "12px", overflow: "hidden", background: M.tileBg,
                    border: `2px solid ${participant.speaking ? M.speaking : M.borderSoft}`,
                    transition: "border-color 0.2s",
                }}
            >
                {showVideo ? (
                    <Box
                        component="video"
                        ref={videoRef}
                        autoPlay
                        muted={participant.isYou}
                        playsInline
                        sx={{ width: "100%", height: "100%", objectFit: "cover", transform: participant.isYou ? "scaleX(-1)" : "none" }}
                    />
                ) : (
                    <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {participant.avatar ? (
                            <Box
                                component="img"
                                src={participant.avatar}
                                alt={participant.name}
                                sx={{
                                    width: compact ? 44 : 72, height: compact ? 44 : 72, borderRadius: "50%",
                                    border: `2px solid ${participant.speaking ? M.speaking : M.border}`,
                                    background: M.surface,
                                }}
                            />
                        ) : (
                            <Box
                                sx={{
                                    width: compact ? 44 : 72, height: compact ? 44 : 72, borderRadius: "50%",
                                    background: M.accentGrad, display: "flex", alignItems: "center", justifyContent: "center",
                                }}
                            >
                                <Typography sx={{ fontSize: compact ? "1rem" : "1.5rem", fontWeight: 700, color: M.text }}>{initial}</Typography>
                            </Box>
                        )}
                    </Box>
                )}

                {/* Name plate */}
                <Box
                    sx={{
                        position: "absolute", left: 8, bottom: 8, display: "flex", alignItems: "center", gap: 0.5,
                        px: 0.8, py: 0.25, borderRadius: "6px", background: "rgba(8,12,24,0.7)",
                    }}
                >
                    {!participant.micOn && <MdMicOff size={12} color={M.danger} />}
                    <Typography sx={{ fontSize: compact ? "0.6rem" : "0.7rem", color: M.text, fontWeight: 600 }}>
                        {participant.isYou ? `${participant.name} (You)` : participant.name}
                    </Typography>
                    {participant.host && (
                        <Typography sx={{ fontSize: "0.55rem", color: M.accentSoft, fontWeight: 700 }}>HOST</Typography>
                    )}
                </Box>

                {/* Status chips */}
                <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 0.5 }}>
                    {participant.presenting && (
                        <Box sx={{ px: 0.6, py: 0.25, borderRadius: "6px", background: M.accentDark, display: "flex", alignItems: "center", gap: 0.3 }}>
                            <MdPresentToAll size={12} color={M.text} />
                            <Typography sx={{ fontSize: "0.55rem", color: M.text, fontWeight: 700 }}>Presenting</Typography>
                        </Box>
                    )}
                    {participant.handRaised && (
                        <Box sx={{ width: 22, height: 22, borderRadius: "6px", background: M.warn, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <MdBackHand size={12} color="#111827" />
                        </Box>
                    )}
                    {participant.pinned && (
                        <Box sx={{ width: 22, height: 22, borderRadius: "6px", background: "rgba(8,12,24,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <MdPushPin size={12} color={M.text} />
                        </Box>
                    )}
                </Box>

                {!compact && (
                    <Box sx={{ position: "absolute", top: 8, left: 8, display: "flex", alignItems: "center", gap: 0.3, opacity: 0.75 }}>
                        <MdSignalCellularAlt size={13} color={(participant.signal ?? 3) > 1 ? M.online : M.warn} />
                    </Box>
                )}

                {participant.speaking && (
                    <Box
                        sx={{
                            position: "absolute", inset: 0, borderRadius: "10px", pointerEvents: "none",
                            boxShadow: `inset 0 0 0 2px ${M.speaking}`,
                        }}
                    />
                )}
            </Box>
        </motion.div>
    );
}
