"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import {
    MdOutlineArticle,
    MdOutlineNewspaper,
    MdOutlineSchool,
    MdOutlineCampaign,
    MdArrowForward,
} from "react-icons/md";

// ─── Types ────────────────────────────────────────────────────────────────
type AnnouncementCategory = "Blog" | "Latest News" | "Classes Update" | "General";

export interface AnnouncementItem {
    category: AnnouncementCategory | string;
    title: string;
    date: string;
}

interface AnnouncementsProps {
    announcements?: AnnouncementItem[];
    onSeeAll?: () => void;
}

// ─── Category config ──────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
    "Blog": { icon: MdOutlineArticle, color: "rgba(255,255,255,0.55)" },
    "Latest News": { icon: MdOutlineNewspaper, color: "rgba(255,255,255,0.55)" },
    "Classes Update": { icon: MdOutlineSchool, color: "rgba(255,255,255,0.55)" },
    "General": { icon: MdOutlineCampaign, color: "rgba(255,255,255,0.55)" },
};

const FALLBACK = { icon: MdOutlineCampaign, color: "rgba(255,255,255,0.55)" };

// ─── Default data ─────────────────────────────────────────────────────────
const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
    { category: "Blog", title: "How to become Career Ready!", date: "4th July 2026" },
    { category: "Latest News", title: "How to become Career Ready!", date: "4th July 2026" },
    { category: "Classes Update", title: "How to become Career Ready!", date: "4th July 2026" },
];

// ─── Component ────────────────────────────────────────────────────────────
export default function Announcements({
    announcements = DEFAULT_ANNOUNCEMENTS,
    onSeeAll,
}: AnnouncementsProps) {
    return (
        <Box sx={{ width: "100%" }}>
            {/* ── Heading ── */}
            <Typography
                sx={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "#fff",
                    mb: 1.25,
                }}
            >
                Announcements
            </Typography>

            {/* ── Cards ── */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {announcements.map((item, i) => {
                    const cfg = CATEGORY_CONFIG[item.category] ?? FALLBACK;
                    const Icon = cfg.icon;

                    return (
                        <Box
                            key={i}
                            sx={{
                                bgcolor: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderRadius: "12px",
                                px: 1.75,
                                py: 1.5,
                                cursor: "pointer",
                                "&:hover": { bgcolor: "rgba(255,255,255,0.07)" },
                                transition: "background 0.15s",
                            }}
                        >
                            {/* Category pill */}
                            <Box
                                sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    bgcolor: "rgba(255,255,255,0.08)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "999px",
                                    px: 1,
                                    py: 0.3,
                                    mb: 1,
                                }}
                            >
                                <Icon size={12} color={cfg.color} />
                                <Typography
                                    sx={{
                                        fontSize: "0.65rem",
                                        fontWeight: 500,
                                        color: "rgba(255,255,255,0.65)",
                                        lineHeight: 1,
                                    }}
                                >
                                    {item.category}
                                </Typography>
                            </Box>

                            {/* Title */}
                            <Typography
                                sx={{
                                    fontSize: "0.825rem",
                                    fontWeight: 700,
                                    color: "#fff",
                                    lineHeight: 1.35,
                                    mb: 0.4,
                                }}
                            >
                                {item.title}
                            </Typography>

                            {/* Date */}
                            <Typography
                                sx={{
                                    fontSize: "0.7rem",
                                    color: "rgba(255,255,255,0.38)",
                                    fontWeight: 400,
                                }}
                            >
                                {item.date}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            {/* ── See All ── */}
            <Box
                onClick={onSeeAll}
                sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.4,
                    mt: 1.5,
                    cursor: "pointer",
                    color: "#5b8df6",
                    "&:hover": { color: "#93b4fc" },
                    transition: "color 0.15s",
                }}
            >
                <Typography sx={{ fontSize: "0.775rem", fontWeight: 600 }}>
                    See All
                </Typography>
                <MdArrowForward size={14} />
            </Box>
        </Box>
    );
}
