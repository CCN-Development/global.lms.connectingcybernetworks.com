"use client";

import React, { useEffect, useRef, useState } from "react";
import { Box, Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import { MdInsertDriveFile, MdPause, MdPlayArrow, MdPlayCircleFilled } from "react-icons/md";
import { C, t } from "./theme";
import type { Attachment, MediaItem } from "./types";
import { fileAccent, formatDuration } from "./helpers";
import ChatIcon from "./ChatIcon";

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
    const idleColor = "rgba(255,255,255,0.28)";

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 240 }}>
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

            <Box
                component="button"
                type="button"
                aria-label={playing ? "Pause voice message" : "Play voice message"}
                onClick={toggle}
                sx={{
                    width: 36, height: 36, flexShrink: 0, borderRadius: "50%", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: mine ? "#ffffff" : C.accentGrad, color: mine ? "#001B79" : "#ffffff",
                    filter: "drop-shadow(0 0 4px rgba(255,255,255,0.12))",
                    "&:hover": { filter: "brightness(1.1) drop-shadow(0 0 4px rgba(255,255,255,0.12))" },
                }}
            >
                {playing ? <MdPause size={20} /> : <MdPlayArrow size={20} />}
            </Box>

            <Box
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    seek((e.clientX - rect.left) / rect.width);
                }}
                sx={{ display: "flex", alignItems: "center", gap: "2px", height: 28, flex: 1, cursor: playable ? "pointer" : "default" }}
            >
                {bars.map((h, i) => (
                    <Box
                        key={i}
                        sx={{
                            width: 2, height: `${h}%`, borderRadius: "2px",
                            background: i / bars.length <= progress ? activeColor : idleColor, transition: "background 0.15s",
                        }}
                    />
                ))}
            </Box>

            <Box sx={{ ...t("lato", 12, 18, 500, C.textMuted), minWidth: 32 }}>
                {formatDuration(playing || elapsed > 0 ? elapsed : total)}
            </Box>
        </Box>
    );
}

/** Document card: optional page preview on top, name + meta + download underneath (Figma "Docs" cards). */
export function DocCard({
    att, onOpen, onDownload, minWidth = 240,
}: { att: Attachment; onOpen?: (att: Attachment) => void; onDownload?: () => void; minWidth?: number }) {
    const downloadable = Boolean(att.url) && att.url !== "#";
    const meta = [att.pages ? `${att.pages} ${att.pages === 1 ? "page" : "pages"}` : null, att.ext, att.size].filter(Boolean) as string[];

    return (
        <Box
            onClick={() => onOpen?.(att)}
            sx={{ display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: "4px", cursor: onOpen ? "pointer" : "default", minWidth }}
        >
            {att.preview && (
                <Box sx={{ height: 89, position: "relative", overflow: "hidden", background: "#fff" }}>
                    <Box
                        component="img"
                        src={att.preview}
                        alt=""
                        sx={{ position: "absolute", left: "-0.36%", top: "-0.56%", width: "100.69%", height: "131.22%", maxWidth: "none", display: "block" }}
                    />
                </Box>
            )}
            <Box sx={{ display: "flex", alignItems: "center", gap: "6px", px: "8px", py: "6px", background: C.linkCard }}>
                {!att.preview && (
                    <Box
                        sx={{
                            width: 32, height: 32, borderRadius: "6px", flexShrink: 0, background: fileAccent(att.ext), color: "#fff",
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        <MdInsertDriveFile size={15} />
                        <Box component="span" sx={{ fontFamily: "var(--font-sans)", fontSize: "7px", fontWeight: 800, mt: "-2px" }}>
                            {(att.ext ?? "FILE").slice(0, 4)}
                        </Box>
                    </Box>
                )}
                <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Box sx={{ ...t("inter", 11, 16, 400, C.textBody), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {att.name}
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "4px", ...t("inter", 10, 15, 400, C.textPlaceholder), whiteSpace: "nowrap" }}>
                        {meta.map((part, i) => (
                            <React.Fragment key={`${part}-${i}`}>
                                {i > 0 && <Box component="span" sx={{ fontSize: "8px", lineHeight: "12px" }}>•</Box>}
                                <span>{part}</span>
                            </React.Fragment>
                        ))}
                    </Box>
                </Box>
                <Tooltip title={downloadable ? "Download" : "Not available"} arrow>
                    <Box
                        component="a"
                        href={att.url}
                        download={att.name}
                        aria-label={`Download ${att.name}`}
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDownload?.(); }}
                        sx={{ display: "flex", flexShrink: 0, pointerEvents: downloadable ? "auto" : "none", opacity: downloadable ? 1 : 0.4 }}
                    >
                        <ChatIcon name="download-24" size={24} color={C.textSoft} />
                    </Box>
                </Tooltip>
            </Box>
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {shown.length > 0 && (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: shown.length === 1 ? "1fr" : "1fr 1fr",
                        gap: "4px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        maxWidth: 320,
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
                                    height: shown.length === 1 ? "auto" : 116,
                                    maxHeight: shown.length === 1 ? 260 : undefined,
                                    objectFit: "cover",
                                    display: "block",
                                    background: "rgba(3,6,12,0.44)",
                                }}
                            />
                            {att.kind === "video" && (
                                <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <MdPlayCircleFilled size={36} color="#ffffff" />
                                </Box>
                            )}
                            {i === shown.length - 1 && hidden > 0 && (
                                <Box
                                    sx={{
                                        position: "absolute", inset: 0, background: "rgba(9,9,21,0.7)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        ...t("lato", 20, 30, 700, "#ffffff"),
                                    }}
                                >
                                    +{hidden}
                                </Box>
                            )}
                        </motion.div>
                    ))}
                </Box>
            )}

            {others.map((att) =>
                att.kind === "audio"
                    ? <AudioBubble key={att.id} att={att} mine={mine} />
                    : <DocCard key={att.id} att={att} onOpen={onOpenDocument} />,
            )}
        </Box>
    );
}
