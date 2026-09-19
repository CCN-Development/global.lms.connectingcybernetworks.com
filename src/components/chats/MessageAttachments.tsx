"use client";

import React, { useEffect, useRef, useState } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { motion } from "framer-motion";
import {
    MdInsertDriveFile, MdDownload, MdPlayArrow, MdPause, MdPlayCircleFilled,
} from "react-icons/md";
import { C } from "./theme";
import type { Attachment, MediaItem } from "./types";
import { canPreviewInline, fileAccent, formatDuration } from "./helpers";

/** Deterministic pseudo-waveform so SSR and client render the same bars. */
function waveform(seed: string, bars = 34) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) >>> 0;
    return Array.from({ length: bars }, (_, i) => {
        h = (h * 1103515245 + 12345) >>> 0;
        return 25 + ((h >>> (i % 7)) % 75);
    });
}

function AudioBubble({ att, mine }: { att: Attachment; mine: boolean }) {
    const [playing, setPlaying] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [total, setTotal] = useState(att.duration ?? 0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timer = useRef<ReturnType<typeof setInterval> | null>(null);
    const playable = Boolean(att.url) && att.url !== "#";
    const bars = waveform(att.id);
    const progress = total > 0 ? Math.min(1, elapsed / total) : 0;

    /* Placeholder clips (seeded demo data) have no real audio, so animate a fake head. */
    useEffect(() => {
        if (playable || !playing) {
            if (timer.current) clearInterval(timer.current);
            return;
        }
        timer.current = setInterval(() => {
            setElapsed((e) => {
                if (e + 0.1 >= total) {
                    setPlaying(false);
                    return 0;
                }
                return e + 0.1;
            });
        }, 100);
        return () => {
            if (timer.current) clearInterval(timer.current);
        };
    }, [playable, playing, total]);

    const toggle = () => {
        if (!playable) {
            setPlaying((p) => !p);
            return;
        }
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) {
            void audio.play().catch(() => setPlaying(false));
        } else {
            audio.pause();
        }
    };

    const seek = (fraction: number) => {
        if (!playable || total <= 0) return;
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = fraction * total;
        setElapsed(fraction * total);
    };

    const activeColor = mine ? "#ffffff" : C.accentSoft;
    const idleColor = mine ? "#a5b4fc" : "#3c4667";

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 210 }}>
            {playable && (
                <audio
                    ref={audioRef}
                    src={att.url}
                    preload="metadata"
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime)}
                    onLoadedMetadata={(e) => {
                        const d = e.currentTarget.duration;
                        if (Number.isFinite(d) && d > 0) setTotal(d);
                    }}
                    onEnded={() => { setPlaying(false); setElapsed(0); }}
                />
            )}

            <IconButton
                size="small"
                onClick={toggle}
                sx={{
                    width: 30, height: 30, background: mine ? "#ffffff" : C.accent,
                    color: mine ? C.accentDark : "#ffffff",
                    "&:hover": { background: mine ? "#e0e7ff" : C.accentDark },
                }}
            >
                {playing ? <MdPause size={17} /> : <MdPlayArrow size={17} />}
            </IconButton>

            <Box
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    seek((e.clientX - rect.left) / rect.width);
                }}
                sx={{ display: "flex", alignItems: "center", gap: "2px", height: 26, flex: 1, cursor: playable ? "pointer" : "default" }}
            >
                {bars.map((h, i) => (
                    <Box
                        key={i}
                        sx={{
                            width: 2,
                            height: `${h}%`,
                            borderRadius: "2px",
                            background: i / bars.length <= progress ? activeColor : idleColor,
                            transition: "background 0.15s",
                        }}
                    />
                ))}
            </Box>

            <Typography sx={{ fontSize: "0.62rem", color: mine ? "#dbeafe" : C.textSoft, minWidth: 30 }}>
                {formatDuration(playing || elapsed > 0 ? elapsed : total)}
            </Typography>
        </Box>
    );
}

function FileCard({ att, mine, onOpen }: { att: Attachment; mine: boolean; onOpen: (att: Attachment) => void }) {
    const downloadable = Boolean(att.url) && att.url !== "#";
    const accent = fileAccent(att.ext);

    return (
        <Box
            onClick={() => onOpen(att)}
            sx={{
                display: "flex", alignItems: "center", gap: 1, cursor: "pointer",
                background: mine ? "#3c31b8" : C.panelAlt,
                border: `1px solid ${mine ? "#5b4fd6" : C.border}`,
                borderRadius: "8px", p: 1, minWidth: 210,
                "&:hover": { background: mine ? "#453ac9" : C.raised },
                transition: "background 0.15s",
            }}
        >
            <Box
                sx={{
                    width: 32, height: 32, borderRadius: "6px", flexShrink: 0,
                    background: accent, color: "#ffffff",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}
            >
                <MdInsertDriveFile size={15} />
                <Typography sx={{ fontSize: "0.42rem", fontWeight: 800, letterSpacing: "0.04em", mt: "-2px" }}>
                    {(att.ext ?? "FILE").slice(0, 4)}
                </Typography>
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: "0.72rem", color: C.text, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {att.name}
                </Typography>
                <Typography sx={{ fontSize: "0.62rem", color: mine ? "#c7d2fe" : C.textMuted }}>
                    {[att.ext, att.size, canPreviewInline(att) ? "Tap to preview" : null].filter(Boolean).join(" · ")}
                </Typography>
            </Box>

            <Tooltip title={downloadable ? "Download" : "Not available"} arrow>
                <Box
                    component="a"
                    href={att.url}
                    download={att.name}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    sx={{
                        display: "flex", p: 0.4, borderRadius: "6px",
                        color: mine ? "#e0e7ff" : C.textSoft,
                        pointerEvents: downloadable ? "auto" : "none",
                        opacity: downloadable ? 1 : 0.4,
                        "&:hover": { background: mine ? "#2f2596" : C.border, color: C.text },
                    }}
                >
                    <MdDownload size={15} />
                </Box>
            </Tooltip>
        </Box>
    );
}

type Props = {
    attachments: Attachment[];
    mine: boolean;
    onOpenMedia: (items: MediaItem[], index: number) => void;
    onOpenDocument: (att: Attachment) => void;
};

export default function MessageAttachments({ attachments, mine, onOpenMedia, onOpenDocument }: Props) {
    const visuals = attachments.filter((a) => a.kind === "image" || a.kind === "video");
    const others = attachments.filter((a) => a.kind !== "image" && a.kind !== "video");
    const items: MediaItem[] = visuals.map((a) => ({ url: a.url, kind: a.kind as "image" | "video", name: a.name }));
    const shown = visuals.slice(0, 4);
    const hidden = visuals.length - shown.length;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6 }}>
            {shown.length > 0 && (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: shown.length === 1 ? "1fr" : "1fr 1fr",
                        gap: "3px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        maxWidth: 280,
                    }}
                >
                    {shown.map((att, i) => (
                        <motion.div
                            key={att.id}
                            whileHover={{ scale: 1.015 }}
                            transition={{ duration: 0.15 }}
                            style={{ position: "relative", cursor: "pointer", overflow: "hidden" }}
                            onClick={() => onOpenMedia(items, i)}
                        >
                            <Box
                                component={att.kind === "video" ? "video" : "img"}
                                src={att.url}
                                alt={att.name}
                                muted
                                playsInline
                                preload="metadata"
                                sx={{
                                    width: "100%",
                                    height: shown.length === 1 ? "auto" : 104,
                                    maxHeight: shown.length === 1 ? 240 : undefined,
                                    objectFit: "cover",
                                    display: "block",
                                    background: "#0b1020",
                                }}
                            />
                            {att.kind === "video" && (
                                <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <MdPlayCircleFilled size={34} color="#ffffff" />
                                </Box>
                            )}
                            {i === shown.length - 1 && hidden > 0 && (
                                <Box
                                    sx={{
                                        position: "absolute", inset: 0, background: "rgba(8,12,24,0.68)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}
                                >
                                    <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff" }}>+{hidden}</Typography>
                                </Box>
                            )}
                        </motion.div>
                    ))}
                </Box>
            )}

            {others.map((att) =>
                att.kind === "audio"
                    ? <AudioBubble key={att.id} att={att} mine={mine} />
                    : <FileCard key={att.id} att={att} mine={mine} onOpen={onOpenDocument} />,
            )}
        </Box>
    );
}
