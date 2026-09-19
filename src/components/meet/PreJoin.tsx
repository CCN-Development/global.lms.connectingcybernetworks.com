"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import { motion } from "framer-motion";
import {
    MdMic, MdMicOff, MdVideocam, MdVideocamOff, MdContentCopy, MdInfoOutline,
    MdLock, MdPeople, MdArrowBack,
} from "react-icons/md";
import { M } from "./theme";
import { useLocalMedia, useVideoStream } from "./useLocalMedia";
import { meetUrl } from "./meetHelpers";
import type { JoinPrefs } from "./types";

type Props = {
    roomId: string;
    defaultName: string;
    expectedParticipants: string[];
    onJoin: (prefs: JoinPrefs, stream: MediaStream | null) => void;
    onCancel: () => void;
};

export default function PreJoin({ roomId, defaultName, expectedParticipants, onJoin, onCancel }: Props) {
    const media = useLocalMedia();
    const videoRef = useVideoStream(media.stream);
    const [name, setName] = useState(defaultName);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        void media.request({ audio: true, video: true });
    }, []);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(meetUrl(roomId));
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            setCopied(false);
        }
    };

    const showVideo = media.camOn && media.hasVideoTrack;

    return (
        <Box sx={{ minHeight: "100vh", background: M.bg, px: { xs: 2, md: 5 }, py: { xs: 2, md: 4 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: { xs: 2, md: 3 } }}>
                <IconButton size="small" onClick={onCancel} sx={{ color: M.textSoft }}>
                    <MdArrowBack size={18} />
                </IconButton>
                <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: M.text }}>CCN Meet</Typography>
                <Box sx={{ px: 0.8, py: 0.2, borderRadius: "6px", border: `1px solid ${M.border}`, background: M.surface }}>
                    <Typography sx={{ fontSize: "0.65rem", color: M.textSoft, fontFamily: "monospace" }}>{roomId}</Typography>
                </Box>
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "minmax(0,1.35fr) minmax(0,1fr)" },
                    gap: { xs: 2, md: 5 },
                    alignItems: "center",
                    maxWidth: 1180,
                    mx: "auto",
                }}
            >
                {/* Preview */}
                <Box>
                    <Box
                        sx={{
                            position: "relative", width: "100%", aspectRatio: "16/9",
                            borderRadius: "14px", overflow: "hidden",
                            background: M.tileBg, border: `1px solid ${M.border}`,
                        }}
                    >
                        <Box
                            component="video"
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            sx={{
                                width: "100%", height: "100%", objectFit: "cover",
                                transform: "scaleX(-1)",
                                display: showVideo ? "block" : "none",
                            }}
                        />

                        {!showVideo && (
                            <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                <Box
                                    sx={{
                                        width: 84, height: 84, borderRadius: "50%", background: M.accentGrad,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}
                                >
                                    <Typography sx={{ fontSize: "1.6rem", fontWeight: 700, color: M.text }}>
                                        {(name || "You").slice(0, 1).toUpperCase()}
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: "0.8rem", color: M.textSoft }}>
                                    {media.permission === "prompting" ? "Waiting for camera permission…" : "Camera is off"}
                                </Typography>
                            </Box>
                        )}

                        <Box sx={{ position: "absolute", bottom: 12, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 1.2 }}>
                            <Tooltip title={media.micOn ? "Turn off microphone" : "Turn on microphone"} arrow>
                                <IconButton
                                    onClick={media.toggleMic}
                                    sx={{
                                        width: 44, height: 44,
                                        background: media.micOn ? M.raised : M.danger,
                                        color: M.text, border: `1px solid ${media.micOn ? M.border : M.danger}`,
                                        "&:hover": { background: media.micOn ? M.border : M.dangerDark },
                                    }}
                                >
                                    {media.micOn ? <MdMic size={20} /> : <MdMicOff size={20} />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={media.camOn ? "Turn off camera" : "Turn on camera"} arrow>
                                <IconButton
                                    onClick={() => void media.toggleCam()}
                                    sx={{
                                        width: 44, height: 44,
                                        background: media.camOn ? M.raised : M.danger,
                                        color: M.text, border: `1px solid ${media.camOn ? M.border : M.danger}`,
                                        "&:hover": { background: media.camOn ? M.border : M.dangerDark },
                                    }}
                                >
                                    {media.camOn ? <MdVideocam size={20} /> : <MdVideocamOff size={20} />}
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    {media.error && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 1.2, px: 1.2, py: 0.8, borderRadius: "8px", background: M.surface, border: `1px solid ${M.warn}` }}>
                            <MdInfoOutline size={15} color={M.warn} />
                            <Typography sx={{ fontSize: "0.72rem", color: M.textSoft }}>{media.error}</Typography>
                        </Box>
                    )}
                </Box>

                {/* Join card */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                    <Box sx={{ textAlign: "center", px: { xs: 0, md: 2 } }}>
                        <Typography sx={{ fontSize: "1.3rem", fontWeight: 700, color: M.text }}>Ready to join?</Typography>
                        <Typography sx={{ fontSize: "0.78rem", color: M.textSoft, mt: 0.5 }}>
                            {expectedParticipants.length > 0
                                ? `${expectedParticipants.slice(0, 2).join(", ")}${expectedParticipants.length > 2 ? ` and ${expectedParticipants.length - 2} others` : ""} are invited`
                                : "No one else is here yet"}
                        </Typography>

                        <TextField
                            size="small"
                            fullWidth
                            label="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            sx={{
                                mt: 2.4,
                                "& .MuiInputBase-root": { color: M.text, fontSize: "0.82rem", background: M.surface },
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: M.border },
                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: M.accent },
                                "& .MuiInputLabel-root": { color: M.textMuted, fontSize: "0.8rem" },
                                "& .MuiInputLabel-root.Mui-focused": { color: M.accentSoft },
                            }}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => onJoin(
                                { displayName: name.trim() || "You", micOn: media.micOn, camOn: media.camOn },
                                media.handOff(),
                            )}
                            sx={{
                                mt: 1.6, py: 1.1, borderRadius: "22px", fontSize: "0.85rem", fontWeight: 700,
                                textTransform: "none", background: M.accentGrad,
                                "&:hover": { filter: "brightness(1.12)" },
                            }}
                        >
                            Join now
                        </Button>

                        <Button
                            fullWidth
                            onClick={copyLink}
                            startIcon={<MdContentCopy size={15} />}
                            sx={{ mt: 1, py: 0.9, borderRadius: "22px", fontSize: "0.78rem", textTransform: "none", color: M.accentSoft, border: `1px solid ${M.border}` }}
                        >
                            {copied ? "Link copied" : "Copy joining info"}
                        </Button>

                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.6, mt: 2 }}>
                            <MdLock size={13} color={M.textMuted} />
                            <Typography sx={{ fontSize: "0.68rem", color: M.textMuted }}>
                                Only people from Connecting Cyber Networks can join with this code
                            </Typography>
                        </Box>

                        {expectedParticipants.length > 0 && (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.6, mt: 0.6 }}>
                                <MdPeople size={13} color={M.textMuted} />
                                <Typography sx={{ fontSize: "0.68rem", color: M.textMuted }}>
                                    {expectedParticipants.length} invited
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </motion.div>
            </Box>
        </Box>
    );
}
