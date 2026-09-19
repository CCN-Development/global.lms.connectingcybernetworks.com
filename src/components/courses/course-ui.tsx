"use client";

import React from "react";
import { Box, Typography } from "@mui/material";

/** Small translucent pill used for mission stats ("44 Levels", "5000 XP"). */
export function MissionChip({
    icon,
    label,
    border = "rgba(255,255,255,0.22)",
}: {
    icon: React.ReactNode;
    label: string;
    border?: string;
}) {
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 0.9,
                py: 0.4,
                borderRadius: "8px",
                border: `1px solid ${border}`,
                bgcolor: "#0d0d18",
                color: "#e4e4ec",
                whiteSpace: "nowrap",
            }}
        >
            {icon}
            <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, lineHeight: 1.4 }}>{label}</Typography>
        </Box>
    );
}

/** Icon + value + caption tile used in the performance and "what's inside" grids. */
export function StatTile({
    icon,
    value,
    label,
    accent = "#7c3aed",
}: {
    icon: React.ReactNode;
    value: string;
    label: string;
    accent?: string;
}) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.1,
                py: 1,
                borderRadius: "10px",
                border: "1px solid #1c1c26",
                bgcolor: "#0b0b12",
                transition: "border-color .18s ease, box-shadow .18s ease",
                "&:hover": { borderColor: accent, boxShadow: `0 8px 22px -14px ${accent}` },
            }}
        >
            <Box
                sx={{
                    width: 26,
                    height: 26,
                    flexShrink: 0,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `linear-gradient(145deg, ${accent} 0%, #1e1b3a 100%)`,
                    color: "#fff",
                }}
            >
                {icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography noWrap sx={{ color: "#fff", fontSize: "0.85rem", fontWeight: 700, lineHeight: 1.2 }}>
                    {value}
                </Typography>
                <Typography noWrap sx={{ color: "#8a8a9a", fontSize: "0.65rem", lineHeight: 1.4 }}>
                    {label}
                </Typography>
            </Box>
        </Box>
    );
}

/** Thin gradient progress bar. */
export function ProgressBar({
    value,
    from = "#009DFF",
    to = "#7c3aed",
    height = 5,
}: {
    value: number;
    from?: string;
    to?: string;
    height?: number;
}) {
    return (
        <Box sx={{ width: "100%", height, borderRadius: "999px", bgcolor: "#1c1c26", overflow: "hidden" }}>
            <Box
                sx={{
                    width: `${Math.min(100, Math.max(0, value))}%`,
                    height: "100%",
                    borderRadius: "999px",
                    background: `linear-gradient(90deg, ${from} 0%, ${to} 100%)`,
                    transition: "width .35s ease",
                }}
            />
        </Box>
    );
}

/** Label + counter + bar, used by "Your Stats" and the content breakdown. */
export function ProgressRow({
    label,
    counter,
    value,
    from,
    to,
    icon,
}: {
    label: string;
    counter: string;
    value: number;
    from?: string;
    to?: string;
    icon?: React.ReactNode;
}) {
    return (
        <Box
            sx={{
                px: 1.1,
                py: 0.9,
                borderRadius: "10px",
                border: "1px solid #1c1c26",
                bgcolor: "#0b0b12",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
                {icon}
                <Typography noWrap sx={{ color: "#c9c9d4", fontSize: "0.7rem", fontWeight: 600, flex: 1, minWidth: 0 }}>
                    {label}
                </Typography>
                <Typography sx={{ color: "#8a8a9a", fontSize: "0.68rem", fontWeight: 700, flexShrink: 0 }}>
                    {counter}
                </Typography>
            </Box>
            <ProgressBar value={value} from={from} to={to} />
        </Box>
    );
}

/** Uppercase spaced section caption. */
export function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <Typography sx={{ color: "#6f6f80", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", mb: 0.75 }}>
            {children}
        </Typography>
    );
}

export const Dot = () => (
    <Box component="span" sx={{ color: "#4b4b58", fontSize: "0.7rem", lineHeight: 1 }}>
        •
    </Box>
);
