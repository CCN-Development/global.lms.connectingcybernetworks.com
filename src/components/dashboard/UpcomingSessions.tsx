"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { MdArrowForward } from "react-icons/md";

// ─── Types ────────────────────────────────────────────────────────────────
export interface SessionItem {
    title: string;
    type: string;   // e.g. "LECTURE" | "SEMINAR"
    date: string;   // e.g. "2nd July"
    time: string;   // e.g. "12:00 PM"
}

interface UpcomingSessionsProps {
    sessions?: SessionItem[];
    onSeeAll?: () => void;
}

// ─── Default data ─────────────────────────────────────────────────────────
const DEFAULT_SESSIONS: SessionItem[] = [
    { title: "Subnetting & VLSM", type: "LECTURE", date: "30th July", time: "11:00 AM" },
    { title: "Firewall & ACL Configuration", type: "LAB SESSION", date: "1st Aug", time: "10:00 AM" },
    { title: "Resume & LinkedIn Workshop", type: "SEMINAR", date: "3rd Aug", time: "3:00 PM" },
];

// ─── Component ────────────────────────────────────────────────────────────
export default function UpcomingSessions({
    sessions = DEFAULT_SESSIONS,
    onSeeAll,
}: UpcomingSessionsProps) {
    return (
        <Box sx={{ width: "100%" }}>
            {/* ── Header row ── */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1.25,
                }}
            >
                <Typography
                    sx={{
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: "#fff",
                    }}
                >
                    Upcoming Sessions
                </Typography>

                <Box
                    onClick={onSeeAll}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.4,
                        cursor: "pointer",
                        color: "#93A9E2",
                        "&:hover": { color: "#fff" },
                        transition: "color 0.15s",
                    }}
                >
                    <Typography sx={{ color: "#93A9E2", fontSize: "0.725rem", fontWeight: 500 }}>
                        See All
                    </Typography>
                    <MdArrowForward size={13} />
                </Box>
            </Box>

            {/* ── Session list ── */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {sessions.map((session, i) => (
                    <div className="corner-gradient-card">

                        <Box
                            key={i}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                // bgcolor: "#000000",
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderRadius: "12px",
                                px: 1.75,
                                py: 1.25,
                                gap: 1,
                                cursor: "pointer",
                                transition: "background 0.15s",
                            }}
                        >
                            {/* Left: title + type */}
                            <Box sx={{ minWidth: 0 }}>
                                <Typography
                                    sx={{
                                        fontSize: "0.825rem",
                                        fontWeight: 700,
                                        color: "#fff",
                                        lineHeight: 1.3,
                                    }}
                                >
                                    {session.title}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: "0.65rem",
                                        fontWeight: 500,
                                        color: "rgba(255,255,255,0.38)",
                                        letterSpacing: "0.06em",
                                        textTransform: "uppercase",
                                        mt: 0.3,
                                    }}
                                >
                                    {session.type}
                                </Typography>
                            </Box>

                            {/* Right: date + time */}
                            <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                                <Typography
                                    sx={{
                                        fontSize: "0.75rem",
                                        fontWeight: 500,
                                        color: "rgba(255,255,255,0.7)",
                                        lineHeight: 1.3,
                                    }}
                                >
                                    {session.date}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: "0.75rem",
                                        fontWeight: 400,
                                        color: "rgba(255,255,255,0.45)",
                                        mt: 0.3,
                                    }}
                                >
                                    {session.time}
                                </Typography>
                            </Box>
                        </Box>
                    </div>
                ))}
            </Box>
        </Box>
    );
}
