"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { CardBackground1 } from "../backgrounds";

// ─── Types ────────────────────────────────────────────────────────────────
export interface PerformanceItem {
    label: string;
    value: number; // 0 – 100
    color: string;
}

interface AttendanceCardProps {
    overallProgress?: number;
    items?: PerformanceItem[];
}

// ─── Defaults ─────────────────────────────────────────────────────────────
const DEFAULT_ITEMS: PerformanceItem[] = [
    { label: "Attendance", color: "#e8c547", value: 64 },
    { label: "Course Progress", color: "#06d6a0", value: 64 },
    { label: "Assignments Submissions", color: "#0013BC", value: 64 },
];

// ─── Ring radii / stroke (inner → outer) ──────────────────────────────────
const RINGS = [
    { r: 50, sw: 7 },
    { r: 70, sw: 7 },
    { r: 90, sw: 7 },
];

// ─── SVG Ring ─────────────────────────────────────────────────────────────
function Ring({
    cx, cy, r, sw, value, color,
}: {
    cx: number; cy: number; r: number; sw: number; value: number; color: string;
}) {
    const circumference = 2 * Math.PI * r;
    const clamped = Math.min(Math.max(value, 0), 100);
    const dashOffset = circumference * (1 - clamped / 100);

    // end-point dot position
    const endAngle = -Math.PI / 2 + (clamped / 100) * 2 * Math.PI;
    const dotX = cx + r * Math.cos(endAngle);
    const dotY = cy + r * Math.sin(endAngle);

    return (
        <g>
            {/* Track */}
            <circle cx={cx} cy={cy} r={r} fill="none"
                stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
            {/* Arc */}
            <circle
                cx={cx} cy={cy} r={r} fill="none"
                stroke={color} strokeWidth={sw}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${cx} ${cy})`}
            // style={{ filter: `drop-shadow(0 0 6px ${color}aa)` }}
            />
            {/* Glow dot at arc end */}
            <circle cx={dotX} cy={dotY} r={sw * 0.7} fill={color}
                style={{ filter: `drop-shadow(0 0 5px ${color})`, border: `1px solid white` }} />
        </g>
    );
}

// ─── Component ────────────────────────────────────────────────────────────
export default function AttendanceCard({
    overallProgress = 44,
    items = DEFAULT_ITEMS,
}: AttendanceCardProps) {
    const SIZE = 200;
    const CX = SIZE / 2;
    const CY = SIZE / 2;

    return (
        <Box sx={{
            width: "100%",
            maxWidth: {
                xs: "100%",
                md: 300
            },
        }}>
            <CardBackground1>
                <Box sx={{
                    p: 2.5,
                }}>

                    {/* ── Radial chart ── */}
                    <Box sx={{ position: "relative", width: "100%", aspectRatio: "1 / 1", mx: "auto" }}>
                        <svg
                            width="100%"
                            height="100%"
                            viewBox={`0 0 ${SIZE} ${SIZE}`}
                            style={{ display: "block" }}
                        >
                            {RINGS.map((ring, i) => (
                                <Ring
                                    key={i}
                                    cx={CX} cy={CY}
                                    r={ring.r} sw={ring.sw}
                                    value={items[i]?.value ?? 0}
                                    color={items[i]?.color ?? "#555"}
                                />
                            ))}
                        </svg>

                        {/* Center label */}
                        <Box
                            sx={{
                                position: "absolute",
                                top: "50%", left: "50%",
                                transform: "translate(-50%, -50%)",
                                textAlign: "center",
                                pointerEvents: "none",
                                width: "36%", // ≈ inner ring diameter (r=38/100*2 = 76% → leave margin)
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: "clamp(1rem, 5vw, 1.875rem)",
                                    fontWeight: 800,
                                    color: "#fff",
                                    lineHeight: 1,
                                    letterSpacing: "-0.02em",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {overallProgress}%
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: "clamp(0.5rem, 1.5vw, 0.65rem)",
                                    color: "rgba(255, 255, 255, 0.84)",
                                    mt: 0.4,
                                    fontWeight: 500,
                                    lineHeight: 1.3,
                                    wordBreak: "break-word",
                                }}
                            >
                                Overall Progress
                            </Typography>
                        </Box>
                    </Box>

                    {/* ── My Performance ── */}
                    <Box sx={{ mt: 1.5 }}>
                        <Typography
                            sx={{
                                fontSize: "0.9rem",
                                fontWeight: 700,
                                color: "#fff",
                                mb: 1,
                            }}
                        >
                            My Performance
                        </Typography>

                        {items.map((item, i) => (
                            <React.Fragment key={i}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        py: 0.85,
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 9,
                                                height: 9,
                                                borderRadius: "50%",
                                                bgcolor: item.color,
                                                flexShrink: 0,
                                                boxShadow: `0 0 7px ${item.color}`,
                                            }}
                                        />
                                        <Typography
                                            sx={{
                                                fontSize: "0.775rem",
                                                color: "rgba(255,255,255,0.7)",
                                                fontWeight: 400,
                                            }}
                                        >
                                            {item.label}
                                        </Typography>
                                    </Box>
                                    <Typography
                                        sx={{
                                            fontSize: "0.775rem",
                                            fontWeight: 600,
                                            color: "#fff",
                                        }}
                                    >
                                        {item.value}%
                                    </Typography>
                                </Box>

                                {i < items.length - 1 && (
                                    <Box
                                        sx={{
                                            borderTop: "1px dashed rgba(255,255,255,0.1)",
                                        }}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </Box>
                </Box>

            </CardBackground1>
        </Box>
    );
}
