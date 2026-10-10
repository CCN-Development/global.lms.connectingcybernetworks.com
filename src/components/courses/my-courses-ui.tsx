"use client";

import React from "react";
import Image from "next/image";
import { Box, ButtonBase, Typography, type SxProps, type Theme } from "@mui/material";
import {
    ACTIVE_PILL_FILL,
    ACTIVE_TAB_FILL,
    BACK_BUTTON_FILL,
    COLORS,
    MY_COURSES_ASSETS,
    PRIMARY_BUTTON_FILL,
    TYPE,
    UI_ICONS,
    glassFill,
} from "./my-courses-theme";
import type { Course } from "./course-data";

const focusRing = { "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" } } as const;

/**
 * Frosted "Detail Card" frame: 0.88 white stroke, dark glass and an inner top highlight.
 * Glass and highlight live on pseudo-elements so children (e.g. color-dodge stars) blend with the page;
 * in-flow children therefore need `position: relative` to paint above the glass.
 */
export function framedPanelSx({
    angle,
    radius = 24,
    highlight = "inset 0px 3px 6px 0px rgba(255,255,255,0.16)",
    fill,
}: {
    angle: string;
    radius?: number;
    highlight?: string;
    /** Overrides the default dark glass (`angle` is then ignored). */
    fill?: string;
}) {
    return {
        position: "relative",
        borderRadius: `${radius}px`,
        border: "1px solid rgba(255,255,255,0.88)",
        "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            backgroundImage: fill ?? glassFill(angle),
            backdropFilter: "blur(12px)",
            pointerEvents: "none",
        },
        "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            boxShadow: highlight,
            pointerEvents: "none",
        },
    } as const;
}

/** Segmented pill switch ("Overview / Levels", "Batch / Global"). */
export function PillTabs<K extends string>({
    options,
    value,
    onChange,
    ariaLabel,
}: {
    options: readonly { key: K; label: string }[];
    value: K;
    onChange: (key: K) => void;
    ariaLabel: string;
}) {
    return (
        <Box
            role="tablist"
            aria-label={ariaLabel}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                p: "4px",
                borderRadius: "99px",
                border: "1px solid rgba(191,191,191,0.25)",
                bgcolor: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(4px)",
                opacity: 0.8,
                flexShrink: 0,
            }}
        >
            {options.map((option) => {
                const active = option.key === value;
                return (
                    <ButtonBase
                        key={option.key}
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(option.key)}
                        sx={{
                            height: 44,
                            px: active ? "16px" : "20px",
                            py: "8px",
                            borderRadius: active ? "99px" : "8px",
                            border: active ? `1px solid ${COLORS.primary75}` : "1px solid transparent",
                            backgroundImage: active ? ACTIVE_TAB_FILL : "none",
                            backdropFilter: active ? "blur(12px)" : "none",
                            "&:hover p": active ? {} : { color: COLORS.neutral100 },
                            ...focusRing,
                        }}
                    >
                        <Typography
                            sx={{
                                ...TYPE.mediumMed16,
                                color: active ? COLORS.white : COLORS.neutral400,
                                whiteSpace: "nowrap",
                                transition: "color .18s ease",
                            }}
                        >
                            {option.label}
                        </Typography>
                    </ButtonBase>
                );
            })}
        </Box>
    );
}

/** 44px frosted circular back button. */
export function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
    return (
        <ButtonBase
            aria-label={label}
            onClick={onClick}
            sx={{
                width: 44,
                height: 44,
                flexShrink: 0,
                borderRadius: "50px",
                border: "1px solid rgba(255,255,255,0.08)",
                backgroundImage: BACK_BUTTON_FILL,
                backdropFilter: "blur(25px)",
                "&:hover": { borderColor: "rgba(255,255,255,0.24)" },
                ...focusRing,
            }}
        >
            <Image src={UI_ICONS.arrowBack24} alt="" width={24} height={24} />
        </ButtonBase>
    );
}

/** White-outlined frosted capsule ("Active Mission"). */
export function StatusPill({ label, size = "sm", color = COLORS.white }: { label: string; size?: "sm" | "md"; color?: string }) {
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                flexShrink: 0,
                overflow: "hidden",
                px: "12px",
                py: "4px",
                borderRadius: "32px",
                border: `1px solid ${COLORS.white}`,
                backgroundImage: ACTIVE_PILL_FILL,
                backdropFilter: "blur(4px)",
            }}
        >
            <Typography sx={{ ...(size === "md" ? TYPE.smallMed14 : TYPE.xsMed12), color, whiteSpace: "nowrap" }}>
                {label}
            </Typography>
        </Box>
    );
}

/** Figma "LMS Button" (primary): blue → violet fill with a soft white glare along the top edge. */
export function PrimaryButton({
    children,
    onClick,
    icon,
    height = 44,
    sx,
}: {
    children: React.ReactNode;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    icon?: string;
    height?: number;
    sx?: SxProps<Theme>;
}) {
    return (
        <ButtonBase
            onClick={onClick}
            sx={[
                {
                    position: "relative",
                    flexShrink: 0,
                    height,
                    gap: "12px",
                    p: "16px",
                    borderRadius: "10px",
                    backgroundImage: PRIMARY_BUTTON_FILL,
                    filter: "drop-shadow(0px 0px 4px rgba(255,255,255,0.12))",
                    transition: "filter .18s ease",
                    "&:hover": { filter: "drop-shadow(0px 0px 10px rgba(140,36,255,0.55))" },
                    ...focusRing,
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            {icon && <Image src={icon} alt="" width={18} height={18} />}
            <Typography component="span" sx={{ ...TYPE.buttonMed14, color: COLORS.white, whiteSpace: "nowrap" }}>
                {children}
            </Typography>
            <Box
                sx={{
                    position: "absolute",
                    top: "-3px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    lineHeight: 0,
                    pointerEvents: "none",
                }}
            >
                <Image src={UI_ICONS.buttonHighlight} alt="" width={158} height={23} style={{ maxWidth: "none" }} />
            </Box>
        </ButtonBase>
    );
}

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
