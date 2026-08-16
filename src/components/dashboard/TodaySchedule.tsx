"use client";

import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { MdOutlineWatchLater } from "react-icons/md";
import CCNButton from "@/components/buttons/CCNButton";
import { CardBackground2 } from "../backgrounds";

// ─── Types ────────────────────────────────────────────────────────────────
interface TodayScheduleProps {
    title?: string;
    startTime?: string;
    endTime?: string;
    mode?: string;         // e.g. "Offline" | "Online"
    classLabel?: string;   // e.g. "Class 3"
    isLive?: boolean;
    onJoin?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────
export default function TodaySchedule({
    title = "Cisco Certified Network Associate (CCNA)",
    startTime = "12:00 PM",
    endTime = "2:00 PM",
    mode = "Offline",
    classLabel,
    isLive = true,
    onJoin,
}: TodayScheduleProps) {
    return (
        <CardBackground2 className="p-4 sm:p-5 w-full">

            <Box
                sx={{
                    // bgcolor: "#0e1118",
                    borderRadius: "16px",
                    p: { xs: 1.75, sm: 2.25 },
                    width: "100%",
                    // boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
                }}
            >
                {/* ── Top row: label + LIVE badge ── */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25 }}>
                    <Typography
                        sx={{
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            letterSpacing: "0.1em",
                            color: "rgba(255,255,255,0.45)",
                            textTransform: "uppercase",
                        }}
                    >
                        Today's Schedule
                    </Typography>

                    {isLive && (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                bgcolor: "rgb(255, 182, 182)",
                                border: "1px solid rgba(239,68,68,0.4)",
                                borderRadius: "999px",
                                px: 1,
                                py: 0.3,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    bgcolor: "#ef4444",
                                    boxShadow: "0 0 6px #ef4444",
                                    animation: "pulse 1.5s ease-in-out infinite",
                                    "@keyframes pulse": {
                                        "0%, 100%": { opacity: 1 },
                                        "50%": { opacity: 0.35 },
                                    },
                                }}
                            />
                            <Typography
                                sx={{
                                    fontSize: "0.6rem",
                                    fontWeight: 700,
                                    color: "#F50000",
                                    letterSpacing: "0.08em",
                                    textTransform: "uppercase",
                                }}
                            >
                                Live
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* ── Title ── */}
                <Typography
                    sx={{
                        fontSize: { xs: "0.95rem", sm: "1.05rem" },
                        fontWeight: 700,
                        color: "#fff",
                        lineHeight: 1.35,
                        mb: 1.25,
                    }}
                >
                    {title}
                </Typography>

                {/* ── Time + mode row ── */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.75, flexWrap: "wrap" }}>
                    <MdOutlineWatchLater size={15} color="rgba(255,255,255,0.45)" />
                    <Typography
                        sx={{
                            fontSize: "0.775rem",
                            color: "rgba(255,255,255,0.6)",
                            fontWeight: 400,
                        }}
                    >
                        {startTime} - {endTime}
                    </Typography>

                    <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.3)" }} />

                    <Typography
                        sx={{
                            fontSize: "0.775rem",
                            color: "rgba(255,255,255,0.6)",
                            fontWeight: 400,
                        }}
                    >
                        {mode}
                    </Typography>

                    {classLabel && (
                        <>
                            <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "#F1C40E" }} />
                            <Typography
                                sx={{
                                    fontSize: "0.775rem",
                                    color: "rgba(255,255,255,0.6)",
                                    fontWeight: 400,
                                }}
                            >
                                {classLabel}
                            </Typography>
                        </>
                    )}
                </Box>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.07)", mb: 1.75 }} />

                {/* ── Join Now button ── */}
                <CCNButton
                    onClick={onJoin}
                    className="w-full normal-case! text-sm! font-semibold!"
                >
                    Join Now
                </CCNButton>
            </Box>
        </CardBackground2>
    );
}
