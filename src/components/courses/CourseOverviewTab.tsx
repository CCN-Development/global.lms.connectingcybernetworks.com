"use client";

import React from "react";
import Image from "next/image";
import { Avatar, Box, ButtonBase, Typography } from "@mui/material";
import type { CourseOverview } from "@/contexts/CourseContext";
import { formatHoursMinutes, formatShortMinutes } from "./course-format";
import {
    COLORS,
    COURSE_ASSETS,
    MY_COURSES_ASSETS,
    SHEEN_TILE_FILL,
    TRAILER_BUTTON_FILL,
    TYPE,
    UI_ICONS,
} from "./my-courses-theme";
import { PrimaryButton, ProgressTrack, framedPanelSx } from "./my-courses-ui";

interface Props {
    course: CourseOverview;
    onStart: () => void;
    starting?: boolean;
    onTrailer: () => void;
    /** Shown for unlocked courses that aren't the active mission yet. */
    onSetActive?: () => void;
    activating?: boolean;
}

const INSIDE: { key: string; icon: string; label: string; value: (c: CourseOverview) => string }[] = [
    { key: "xp", icon: `${MY_COURSES_ASSETS}/rank/stat-points.svg`, label: "Total Points", value: (c) => `${c.stats.earnedXp} XP` },
    { key: "levels", icon: `${COURSE_ASSETS}/stat-levels.svg`, label: "Total Levels", value: (c) => String(c.stats.totalLevels) },
    { key: "labs", icon: `${COURSE_ASSETS}/stat-labs.svg`, label: "Total Labs", value: (c) => String(c.stats.totalLabs) },
    {
        key: "checks",
        icon: `${COURSE_ASSETS}/stat-knowledge.svg`,
        label: "Total Knowledge Checks",
        value: (c) => String(c.stats.totalKnowledgeChecks),
    },
    { key: "badges", icon: `${COURSE_ASSETS}/stat-badges.svg`, label: "Total Badges", value: (c) => String(c.stats.totalBadges) },
    { key: "rank", icon: `${COURSE_ASSETS}/stat-rank.svg`, label: "Batch Rank", value: (c) => (c.stats.batchRank ? `#${c.stats.batchRank}` : "—") },
    { key: "video", icon: `${COURSE_ASSETS}/stat-video.svg`, label: "Video Duration", value: (c) => formatHoursMinutes(c.stats.videoDurationSec) },
    {
        key: "activity",
        icon: `${COURSE_ASSETS}/stat-knowledge.svg`,
        label: "Activity Duration",
        value: (c) => formatHoursMinutes(c.stats.activityDurationSec),
    },
];

function startLabel(course: CourseOverview): string {
    if (course.status === "Locked") return "Mission Locked";
    if (course.status === "Completed") return "Review Course";
    const levelNo = course.currentLevel?.levelNo ?? 1;
    return course.progress > 0 ? `Continue Level ${levelNo}` : `Start Level ${levelNo}`;
}

const tileSx = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
    px: "16px",
    py: "12px",
    borderRadius: "12px",
    border: `1px solid ${COLORS.tileBorder}`,
    backgroundImage: SHEEN_TILE_FILL,
} as const;

function CardLabel({ children }: { children: React.ReactNode }) {
    return (
        <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral200, textTransform: "uppercase", width: "100%" }}>
            {children}
        </Typography>
    );
}

function InsideTile({ icon, value, label }: { icon: string; value: string; label: string }) {
    return (
        <Box sx={tileSx}>
            {/* The icon artwork carries a drop shadow, so it overflows its 32px slot. */}
            <Box sx={{ position: "relative", width: 32, height: 32, flexShrink: 0 }}>
                <Box sx={{ position: "absolute", left: "-30.55px", top: "-5.09px", lineHeight: 0, pointerEvents: "none" }}>
                    <Image src={icon} alt="" width={93.0909} height={93.0909} style={{ maxWidth: "none" }} />
                </Box>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                <Typography noWrap sx={{ ...TYPE.mediumMed16, color: COLORS.white }}>
                    {value}
                </Typography>
                <Typography noWrap sx={{ ...TYPE.xsReg12, color: COLORS.neutral200 }}>
                    {label}
                </Typography>
            </Box>
        </Box>
    );
}

const secondaryButtonSx = {
    gap: "12px",
    pl: "16px",
    pr: "32px",
    py: "8px",
    borderRadius: "12px",
    border: `1px solid ${COLORS.tileBorder}`,
    backgroundImage: TRAILER_BUTTON_FILL,
    transition: "border-color .18s ease, opacity .18s ease",
    "&:hover": { borderColor: "rgba(140,36,255,0.6)" },
    "&.Mui-disabled": { opacity: 0.5 },
    "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" },
} as const;

export default function CourseOverviewTab({ course, onStart, starting = false, onTrailer, onSetActive, activating = false }: Props) {
    const accent = course.titleAccent?.trim() ?? "";
    const hasAccent = Boolean(accent) && course.title.endsWith(accent);
    const prefix = hasAccent ? course.title.slice(0, course.title.length - accent.length) : course.title;
    const locked = course.status === "Locked";
    const trailerLength = formatShortMinutes(course.trailer.durationSec);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "44px", minWidth: 0 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "44px" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <Typography
                        component="h1"
                        sx={{
                            ...TYPE.displayReg44,
                            fontSize: { xs: "32px", sm: "44px" },
                            lineHeight: { xs: "48px", sm: "66px" },
                            color: COLORS.white,
                        }}
                    >
                        {prefix}
                        {hasAccent && (
                            <Box component="span" sx={{ color: COLORS.purple }}>
                                {accent}
                            </Box>
                        )}
                    </Typography>

                    {course.tagline && (
                        <Typography sx={{ ...TYPE.mediumMed16, color: COLORS.neutral300, mt: "-12px" }}>{course.tagline}</Typography>
                    )}

                    <Box sx={{ display: "flex", flexDirection: "column", gap: "27px" }}>
                        {course.description.map((paragraph, i) => (
                            <Typography key={i} sx={{ ...TYPE.largeMed18, color: COLORS.neutral100 }}>
                                {paragraph}
                            </Typography>
                        ))}
                    </Box>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        pt: "16px",
                        pb: "20px",
                        px: "24px",
                        borderRadius: "12px",
                        bgcolor: "rgba(255,255,255,0.04)",
                        overflow: "hidden",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                        <Typography noWrap sx={{ ...TYPE.smallMed14, color: COLORS.neutral75 }}>
                            Course Progress
                        </Typography>
                        <Typography noWrap sx={{ ...TYPE.smallMed14, color: COLORS.neutral75, flexShrink: 0 }}>
                            {Math.round(course.progress)}% completed
                        </Typography>
                    </Box>
                    <ProgressTrack value={course.progress} fill={COLORS.white} minFill={3} />
                </Box>

                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "stretch", gap: "24px" }}>
                    <PrimaryButton icon={locked ? UI_ICONS.lock16 : UI_ICONS.play18} onClick={onStart} disabled={locked || starting}>
                        {starting ? "Opening…" : startLabel(course)}
                    </PrimaryButton>

                    {course.trailer.available && (
                        <ButtonBase onClick={onTrailer} sx={secondaryButtonSx}>
                            <Image src={`${COURSE_ASSETS}/icon-trailer.svg`} alt="" width={18} height={18} />
                            <Typography component="span" sx={{ ...TYPE.smallMed14, color: COLORS.white, whiteSpace: "pre" }}>
                                {trailerLength ? `Watch the trailer  - ${trailerLength}` : "Watch the trailer"}
                            </Typography>
                        </ButtonBase>
                    )}

                    {onSetActive && (
                        <ButtonBase onClick={onSetActive} disabled={activating} sx={{ ...secondaryButtonSx, pr: "16px" }}>
                            <Image src={UI_ICONS.zap16} alt="" width={16} height={16} />
                            <Typography component="span" sx={{ ...TYPE.smallMed14, color: COLORS.white, whiteSpace: "nowrap" }}>
                                {activating ? "Updating…" : "Make Active Mission"}
                            </Typography>
                        </ButtonBase>
                    )}
                </Box>

                {locked && (
                    <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral300, mt: "-20px" }}>
                        This mission unlocks once you complete the courses it builds on. You can still explore what&rsquo;s inside.
                    </Typography>
                )}
            </Box>

            <Box sx={{ containerType: "inline-size" }}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1fr)",
                        gap: "24px",
                        alignItems: "flex-start",
                        // Side by side (514 : 320, as in Figma) only once the stat labels fit without truncating.
                        "@container (min-width: 800px)": { gridTemplateColumns: "minmax(0, 514fr) minmax(0, 320fr)" },
                    }}
                >
                    <Box sx={{ ...framedPanelSx({ angle: "163.45deg" }), overflow: "hidden", p: { xs: "16px", sm: "24px" }, containerType: "inline-size" }}>
                        <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "24px" }}>
                            <CardLabel>What&rsquo;s inside</CardLabel>
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "minmax(0, 1fr)",
                                    gap: "16px",
                                    "@container (min-width: 420px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
                                }}
                            >
                                {INSIDE.map((stat) => (
                                    <InsideTile key={stat.key} icon={stat.icon} label={stat.label} value={stat.value(course)} />
                                ))}
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ ...framedPanelSx({ angle: "154.92deg" }), overflow: "hidden", p: { xs: "16px", sm: "24px" } }}>
                        <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "24px" }}>
                            <CardLabel>Instructors ({course.instructors.length})</CardLabel>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {course.instructors.length === 0 && (
                                    <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral300 }}>Instructors will be announced soon.</Typography>
                                )}
                                {course.instructors.map((instructor) => (
                                    <Box key={instructor.instructorId} sx={tileSx}>
                                        <Avatar
                                            src={instructor.avatar ?? undefined}
                                            alt={instructor.name}
                                            sx={{ width: 40, height: 40, bgcolor: "#93A9E2", border: "0.8px solid #404040" }}
                                        >
                                            {instructor.name.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                                            <Typography noWrap sx={{ ...TYPE.mediumMed16, color: COLORS.neutral100 }}>
                                                {instructor.name}
                                            </Typography>
                                            <Typography noWrap sx={{ ...TYPE.xsMed12, color: COLORS.neutral300 }}>
                                                {instructor.designation ?? (instructor.isLead ? "Lead Instructor" : "Instructor")}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
