"use client";

import React from "react";
import Image from "next/image";
import { Box, SxProps, Theme, Typography } from "@mui/material";
import { RQ, TEXT, formatDay, formatTime, requestAsset, type RequestTab } from "./request-data";

export function Icon({ name, size, height, sx }: { name: string; size: number; height?: number; sx?: SxProps<Theme> }) {
    return (
        <Box aria-hidden sx={[{ display: "flex", flexShrink: 0, lineHeight: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
            <Image src={requestAsset(name)} alt="" width={size} height={height ?? size} />
        </Box>
    );
}

// ─── Status pills ──────────────────────────────────────────────────────────
type PillTone = "active" | "pending" | "resolved" | "rejected";

const PILL_TONE: Record<PillTone, { bg: string; color: string; dot: string; label: string }> = {
    active: { bg: "#BBC9ED", color: "#0E1934", dot: "dot-active.svg", label: "Active" },
    pending: { bg: "#FFEFDC", color: "#FB8600", dot: "dot-pending.svg", label: "Pending" },
    resolved: { bg: "#E3F7E3", color: "#195C19", dot: "dot-resolved.svg", label: "Resolved" },
    rejected: { bg: "#F6D4D8", color: "#9D1F2E", dot: "dot-rejected.svg", label: "Rejected" },
};

/** Card pill ("Active" / "Resolved" / "Rejected") — 12px, compact. */
export function CardStatusPill({ tab }: { tab: RequestTab }) {
    const tone = PILL_TONE[tab];
    return (
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: "6px", px: "8px", py: "2px", borderRadius: "999px", bgcolor: tone.bg, flexShrink: 0 }}>
            <Icon name={tone.dot} size={5} />
            <Typography component="span" sx={{ ...TEXT.reg12, color: tone.color, whiteSpace: "nowrap" }}>
                {tone.label}
            </Typography>
        </Box>
    );
}

export function RepliesPill({ label }: { label: string }) {
    return (
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: "6px", px: "8px", py: "2px", borderRadius: "999px", bgcolor: "#FFEFDC", flexShrink: 0 }}>
            <Icon name="icon-clock.svg" size={14} />
            <Typography component="span" sx={{ ...TEXT.reg12, color: "#FB8600", whiteSpace: "nowrap" }}>
                Replies in {label}
            </Typography>
        </Box>
    );
}

/** Drawer pills — 32px tall, 14px text. Open requests read "Pending". */
export function DrawerStatusPill({ tab }: { tab: RequestTab }) {
    const tone = PILL_TONE[tab === "active" ? "pending" : tab];
    return (
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: "6px", height: 32, px: "12px", borderRadius: "999px", bgcolor: tone.bg, flexShrink: 0 }}>
            <Icon name={tab === "rejected" ? "dot-rejected-lg.svg" : tone.dot} size={5} />
            <Typography component="span" sx={{ ...TEXT.med14, color: tone.color, whiteSpace: "nowrap" }}>
                {tone.label}
            </Typography>
        </Box>
    );
}

export function TagPill({ label }: { label: string }) {
    return (
        <Box sx={{ display: "inline-flex", alignItems: "center", height: 32, px: "12px", borderRadius: "999px", bgcolor: RQ.n200, flexShrink: 0 }}>
            <Typography component="span" sx={{ ...TEXT.med14, color: RQ.n800, whiteSpace: "nowrap" }}>
                {label}
            </Typography>
        </Box>
    );
}

// ─── Date stamp ("12 April, 2026 • 2:30 PM") ───────────────────────────────
export function DateStamp({ iso, size }: { iso: string; size: "card" | "drawer" }) {
    const text = size === "card" ? { ...TEXT.med10, color: RQ.n400 } : { ...TEXT.interReg12, color: RQ.n500 };
    const bullet = size === "card" ? RQ.n700 : RQ.n600;
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
            <Typography component="span" sx={{ ...text, whiteSpace: "nowrap" }}>{formatDay(iso)}</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 7, height: size === "card" ? 16 : 22, pb: "4px" }}>
                <Typography component="span" sx={{ ...TEXT.reg12, color: bullet }}>•</Typography>
            </Box>
            <Typography component="span" sx={{ ...text, whiteSpace: "nowrap" }}>{formatTime(iso)}</Typography>
        </Box>
    );
}

// ─── Dropdown menu styling (shared by filters & category select) ─────────
export const dropdownPaperSx = {
    mt: "6px",
    bgcolor: RQ.dropdownBg,
    backgroundImage: "none",
    backdropFilter: "blur(12px)",
    borderRadius: "9px",
    boxShadow: RQ.dropdownShadow,
    color: RQ.n200,
    overflow: "hidden",
    "& .MuiList-root": { py: 0 },
} as const;

export const dropdownItemSx = {
    minHeight: 44,
    px: "16px",
    py: "10px",
    ...TEXT.med16,
    color: RQ.n200,
    "&:hover, &.Mui-focusVisible, &.Mui-selected, &.Mui-selected:hover": { bgcolor: RQ.dropdownActive },
} as const;
