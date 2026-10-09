"use client";

import React from "react";
import Image from "next/image";
import { Box, Typography } from "@mui/material";
import { COLORS, MY_COURSES_ASSETS, TYPE, UI_ICONS } from "./my-courses-theme";
import type { Course } from "./course-data";

export interface MissionStat {
    key: "levels" | "badges" | "duration" | "xp";
    icon: string;
    iconSize: number;
    value: string;
    unit: string;
}

/** Splits "8-10 Weeks" into its bold value and regular unit. */
function splitDuration(label: string): { value: string; unit: string } {
    const [value, ...rest] = label.trim().split(/\s+/);
    return { value, unit: rest.join(" ") };
}

/** Banner ("Quick Insights") and card ("Mission Includes") stat chips derived from a course. */
export function missionStats(course: Course, variant: "banner" | "card"): MissionStat[] {
    if (variant === "banner") {
        return [
            { key: "levels", icon: UI_ICONS.layers16, iconSize: 16, value: String(course.totalLevels), unit: "levels" },
            { key: "badges", icon: UI_ICONS.star16, iconSize: 16, value: String(course.totalBadges), unit: "badges" },
            { key: "xp", icon: UI_ICONS.zap16, iconSize: 16, value: String(course.totalXp), unit: "XP" },
        ];
    }
    const duration = splitDuration(course.weeks);
    return [
        { key: "levels", icon: UI_ICONS.layers14, iconSize: 14, value: String(course.totalLevels), unit: "Levels" },
        { key: "badges", icon: UI_ICONS.star12, iconSize: 12, value: String(course.totalBadges), unit: "Badges" },
        { key: "duration", icon: UI_ICONS.clock14, iconSize: 14, ...duration },
        { key: "xp", icon: UI_ICONS.zap12, iconSize: 12, value: String(course.totalXp), unit: "XP" },
    ];
}

/** Frosted pill with an icon, a bold value and a muted unit ("24 Badges"). */
export function StatChip({ stat, size }: { stat: MissionStat; size: "md" | "sm" }) {
    const text = size === "md" ? TYPE.smallMed14 : TYPE.xsMed12;
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                px: size === "md" ? "12px" : "8px",
                py: size === "md" ? "8px" : "4px",
                borderRadius: "6px",
                border: `1px solid ${COLORS.neutral200}`,
                bgcolor: "rgba(0,0,0,0.24)",
                backdropFilter: "blur(15px)",
                overflow: "hidden",
                flexShrink: 0,
            }}
        >
            <Image src={stat.icon} alt="" width={stat.iconSize} height={stat.iconSize} />
            <Typography component="span" noWrap sx={{ ...text, color: COLORS.neutral75 }}>
                <Box component="span" sx={{ fontWeight: 700 }}>
                    {stat.value}
                </Box>{" "}
                <Box component="span" sx={{ color: COLORS.neutral100 }}>
                    {stat.unit}
                </Box>
            </Typography>
        </Box>
    );
}

const DIVIDERS = {
    banner: { src: `${MY_COURSES_ASSETS}/ui/divider-banner.svg`, width: 743 },
    card: { src: `${MY_COURSES_ASSETS}/ui/divider-card.svg`, width: 334 },
    rank: { src: `${MY_COURSES_ASSETS}/ui/divider-rank.svg`, width: 1208 },
} as const;

/** 1px gradient rule that fades out to the right (the Figma line is flipped 180°). */
export function FadeDivider({ variant }: { variant: keyof typeof DIVIDERS }) {
    const { src, width } = DIVIDERS[variant];
    return (
        <Box sx={{ width: "100%", height: "1px", lineHeight: 0, transform: "rotate(180deg)", flexShrink: 0 }}>
            <Box component="img" src={src} alt="" width={width} height={1} sx={{ display: "block", width: "100%", height: "1px", maxWidth: "none" }} />
        </Box>
    );
}

/** Outlined capsule progress bar from the design system ("base-bar"). */
export function ProgressTrack({
    value,
    fill,
    minFill,
    width = "100%",
}: {
    /** 0 - 100 */
    value: number;
    fill: string;
    minFill: number;
    width?: number | string;
}) {
    const pct = Math.min(100, Math.max(0, value));
    return (
        <Box
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
            sx={{
                display: "flex",
                alignItems: "center",
                width,
                maxWidth: "100%",
                p: "1px",
                borderRadius: "32px",
                border: `1px solid ${COLORS.white}`,
                bgcolor: "rgba(255,255,255,0.02)",
                backdropFilter: "blur(4px)",
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    height: 8,
                    width: `max(${minFill}px, ${pct}%)`,
                    borderRadius: "16px",
                    bgcolor: fill,
                    transition: "width .35s ease",
                }}
            />
        </Box>
    );
}
