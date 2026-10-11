"use client";

import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Dialog, IconButton, Typography } from "@mui/material";
import { MdClose } from "react-icons/md";
import type { PlaybackInfo } from "@/contexts/CourseContext";
import type { StandardResponse } from "@/contexts/AuthContext";
import { COLORS, TYPE } from "./my-courses-theme";
import StreamPlayer from "./StreamPlayer";

/** Modal Stream player for the course trailer; `load` fetches a fresh signed playback token on open. */
export default function VideoDialog({
    open,
    title,
    load,
    onClose,
}: {
    open: boolean;
    title: string;
    load: () => Promise<StandardResponse<PlaybackInfo>>;
    onClose: () => void;
}) {
    const [playback, setPlayback] = useState<PlaybackInfo | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        load().then((res) => {
            if (cancelled) return;
            if (res.success && res.data) setPlayback(res.data);
            else setError(res.message ?? "Video is not available");
        });
        return () => {
            cancelled = true;
        };
    }, [open, load]);

    const close = () => {
        onClose();
        setPlayback(null);
        setError(null);
    };

    return (
        <Dialog
            open={open}
            onClose={close}
            maxWidth={false}
            aria-label={title}
            slotProps={{
                backdrop: { sx: { bgcolor: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" } },
                paper: {
                    sx: {
                        width: 960,
                        maxWidth: "calc(100% - 32px)",
                        m: "16px",
                        overflow: "hidden",
                        borderRadius: "20px",
                        border: "1px solid rgba(255,255,255,0.88)",
                        bgcolor: "#000",
                        backgroundImage: "none",
                        color: COLORS.white,
                    },
                },
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", px: "20px", py: "12px" }}>
                <Typography noWrap sx={{ ...TYPE.mediumMed16, color: COLORS.white }}>
                    {title}
                </Typography>
                <IconButton aria-label="Close video" onClick={close} sx={{ color: COLORS.neutral200 }}>
                    <MdClose size={20} />
                </IconButton>
            </Box>
            <Box sx={{ position: "relative", width: "100%", aspectRatio: "16 / 9", bgcolor: "#000" }}>
                {playback ? (
                    <StreamPlayer playback={playback} title={title} />
                ) : (
                    <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", px: "24px", textAlign: "center" }}>
                        {error ? (
                            <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral200 }}>{error}</Typography>
                        ) : (
                            <CircularProgress size={28} sx={{ color: COLORS.purple }} />
                        )}
                    </Box>
                )}
            </Box>
        </Dialog>
    );
}
