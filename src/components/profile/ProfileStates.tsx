"use client";

import React from "react";
import { Box, ButtonBase, Skeleton, Typography } from "@mui/material";
import { PC } from "./profile-data";
import { GlassCard, PT } from "./profile-ui";

/** Placeholder cards while profile data loads (mirrors the two-column layouts). */
export function ProfileLoading({ columns = "minmax(0, 576fr) minmax(0, 792fr)", cards = [2, 2] }: { columns?: string; cards?: [number, number] }) {
    const card = (key: string, height: number) => (
        <GlassCard key={key} decor={false}>
            <Skeleton variant="text" width="40%" height={32} sx={{ bgcolor: "rgba(255,255,255,0.08)" }} />
            <Skeleton variant="rounded" height={height} sx={{ bgcolor: "rgba(255,255,255,0.06)", borderRadius: "12px" }} />
        </GlassCard>
    );
    return (
        <Box
            aria-busy
            aria-label="Loading"
            sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: columns }, alignItems: "start", gap: "24px" }}
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
                {Array.from({ length: cards[0] }, (_, i) => card(`l${i}`, i === 0 ? 260 : 140))}
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
                {Array.from({ length: cards[1] }, (_, i) => card(`r${i}`, i === 0 ? 200 : 160))}
            </Box>
        </Box>
    );
}

export function ProfileError({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <GlassCard sx={{ alignItems: "center", textAlign: "center", py: "48px" }}>
            <Typography sx={{ ...PT.poppinsSemi20, color: PC.white }}>Something went wrong</Typography>
            <Typography sx={{ ...PT.med14, color: PC.n300 }}>{message}</Typography>
            <ButtonBase
                onClick={onRetry}
                sx={{ px: "16px", py: "8px", borderRadius: "99px", border: `1px solid ${PC.n600}`, ...PT.med14, color: PC.white, "&:hover": { bgcolor: "rgba(255,255,255,0.06)" } }}
            >
                Try again
            </ButtonBase>
        </GlassCard>
    );
}

/** Muted single-line message inside a card ("No documents yet" …). */
export function EmptyNote({ children }: { children: React.ReactNode }) {
    return <Typography sx={{ ...PT.med14, color: PC.n400, py: "8px" }}>{children}</Typography>;
}
