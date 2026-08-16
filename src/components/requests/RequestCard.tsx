"use client";
import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { MdMoreHoriz, MdAccessTime, MdEast } from "react-icons/md";

// ── Types ──────────────────────────────────────────────────────────────────────

export type RequestStatus = "active" | "resolved" | "rejected";

export interface RequestCardProps {
    status: RequestStatus;
    title: string;
    /** e.g. "Under review by RM" | "Resolved on" | "Feedback Added" */
    statusLabel: string;
    /** e.g. "12 April, 2026 • 2:30 PM" */
    statusDate: string;
    /** e.g. "July 10, 2026" */
    createdOn: string;
    /** Active-only: SLA label, e.g. "24h" */
    repliesIn?: string;
    onView?: () => void;
    onMore?: () => void;
}

// ── Config ─────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    active: {
        dotColor: "#003347",
        badgeBg: "rgb(168, 232, 255)",
        badgeBorder: "#005868",
        badgeColor: "#00538B",
        label: "Active",
    },
    resolved: {
        dotColor: "#00461A",
        badgeBg: "rgb(171, 255, 202)",
        badgeBorder: "rgb(0, 82, 30)",
        badgeColor: "#008932",
        label: "Resolved",
    },
    rejected: {
        dotColor: "#5F0000",
        badgeBg: "rgb(255, 174, 174)",
        badgeBorder: "rgb(102, 0, 0)",
        badgeColor: "#7B0000",
        label: "Rejected",
    },
} as const;

// ── Component ──────────────────────────────────────────────────────────────────

export default function RequestCard({
    status,
    title,
    statusLabel,
    statusDate,
    createdOn,
    repliesIn,
    onView,
    onMore,
}: RequestCardProps) {
    const cfg = STATUS_CONFIG[status];

    return (
        <Box
            sx={{
                background: "linear-gradient(180deg, #040714, #1C083C)",
                borderRadius: "14px",
                display: "flex",
                flexDirection: "column",
                gap: 1.25,
                p: 1,
            }}
        >
            <Box sx={{
                p: 1.5,
                display: "flex",
                flexDirection: "column",
                gap: 1.25,
                background: "#0D0C0F",
                borderRadius: "12px",
            }}>

                {/* ── Top row: status badge + optional SLA badge + menu ── */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    {/* Status badge */}
                    <Box
                        sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            px: 0.9,
                            py: 0.3,
                            borderRadius: "5px",
                            bgcolor: cfg.badgeBg,
                        }}
                    >
                        <Box
                            sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                bgcolor: cfg.dotColor,
                                flexShrink: 0,
                            }}
                        />
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, color: cfg.badgeColor, lineHeight: 1 }}>
                            {cfg.label}
                        </Typography>
                    </Box>

                    {/* SLA badge — active only */}
                    {status === "active" && repliesIn && (
                        <Box
                            sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.4,
                                px: 0.9,
                                py: 0.3,
                                borderRadius: "20px",
                                bgcolor: "rgba(251,146,60,0.12)",
                                border: "1px solid rgba(251,146,60,0.28)",
                            }}
                        >
                            <MdAccessTime size={10} style={{ color: "#fb923c", flexShrink: 0 }} />
                            <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, color: "#fb923c", lineHeight: 1 }}>
                                Replies in {repliesIn}
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{ flex: 1 }} />

                    {/* Three-dot menu — active only */}
                    {status === "active" && (
                        <IconButton
                            size="small"
                            onClick={onMore}
                            sx={{
                                color: "rgba(255,255,255,0.38)",
                                p: 0.25,
                                "&:hover": { color: "rgba(255,255,255,0.75)" },
                            }}
                        >
                            <MdMoreHoriz size={18} />
                        </IconButton>
                    )}
                </Box>

                {/* ── Title ── */}
                <Typography
                    sx={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#fff",
                        lineHeight: 1.25,
                    }}
                >
                    {title}
                </Typography>

                {/* ── Status row ── */}
                <Box
                    sx={{
                        bgcolor: "rgba(0,0,0,0.35)",
                        borderRadius: "8px",
                        p: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        position: "relative",
                    }}
                >
                    {/* Gradient accent bar */}
                    <Box sx={{ position: "absolute", top: 0, left: 0, width: `5px`, height: "100%", background: "linear-gradient(180deg, #2431B3, #BE6E5D, #BDA045, #BAB31F)", borderRadius: "8px 0 0 8px", zIndex: 1 }} />

                    <Box>
                        <Typography sx={{ fontSize: "0.73rem", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                            {statusLabel}
                        </Typography>
                        <Typography sx={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.4)", mt: 0.25 }}>
                            {statusDate}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* ── Footer ── */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2 }}>
                <Typography sx={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.32)" }}>
                    Created on {createdOn}
                </Typography>
                <IconButton
                    size="small"
                    onClick={onView}
                    sx={{
                        color: "rgba(255,255,255,0.45)",
                        border: "1px solid rgba(255,255,255,0.18)",
                        borderRadius: "50%",
                        p: 0.4,
                        "&:hover": {
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.45)",
                            bgcolor: "rgba(255,255,255,0.06)",
                        },
                    }}
                >
                    <MdEast size={13} />
                </IconButton>
            </Box>
        </Box>
    );
}
