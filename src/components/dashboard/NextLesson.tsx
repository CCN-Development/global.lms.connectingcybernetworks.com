"use client";

import React from "react";
import { Box, Typography, Divider, Button } from "@mui/material";
import { CardBackground3 } from "@/components/backgrounds";
import CCNButton from "@/components/buttons/CCNButton";

// ─── Types ────────────────────────────────────────────────────────────────
interface NextLessonProps {
    subtitle?: string;
    title?: string;
    completionPercent?: number;
    nextUpType?: string;    // e.g. "video"
    nextUpTitle?: string;
    onContinue?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────
export default function NextLesson({
    subtitle = "Continue where you left off",
    title = "Introduction to the SOC",
    completionPercent = 12,
    nextUpType = "video",
    nextUpTitle = "Introduction to the SOC Overview",
    onContinue,
}: NextLessonProps) {
    return (
        <div className="w-full">
            <CardBackground3>
                <Box
                    sx={{
                        p: { xs: 2, sm: 2.5 },
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        minHeight: 300,
                    }}
                >
                    {/* ── Subtitle ── */}
                    <Typography
                        sx={{
                            fontSize: "0.775rem",
                            color: "rgba(255,255,255,0.55)",
                            fontWeight: 400,
                            mb: 1,
                        }}
                    >
                        {subtitle}
                    </Typography>

                    {/* ── Title ── */}
                    <Typography
                        sx={{
                            fontSize: { xs: "1.3rem", sm: "1.5rem" },
                            fontWeight: 800,
                            color: "#fff",
                            lineHeight: 1.2,
                            mb: 2,
                            letterSpacing: "-0.01em",
                        }}
                    >
                        {title}
                    </Typography>

                    <Divider sx={{ borderColor: "rgba(255,255,255,0.15)", mb: 2 }} />

                    {/* ── % complete ── */}
                    <Typography
                        sx={{
                            fontSize: "0.825rem",
                            fontWeight: 600,
                            color: "#4ade80",
                            mb: 1.25,
                        }}
                    >
                        {completionPercent}% complete
                    </Typography>

                    {/* ── Next up ── */}
                    <Typography
                        sx={{
                            fontSize: "0.775rem",
                            color: "rgba(255,255,255,0.7)",
                            fontWeight: 400,
                            lineHeight: 1.55,
                            flex: 1,
                        }}
                    >
                        NEXT UP - {nextUpType} - {nextUpTitle}
                    </Typography>

                    {/* ── Continue Learning button ── */}
                    <Box sx={{ mt: 2.5 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={onContinue}
                            className="w-full! py-2!"
                            sx={{
                                background: "white",
                                borderRadius: "10px",
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                color: "#000",
                                py: 1.25,
                                px: 2.5,
                            }}
                        >
                            Continue Learning
                        </Button>
                    </Box>
                </Box>
            </CardBackground3>
        </div>
    );
}
