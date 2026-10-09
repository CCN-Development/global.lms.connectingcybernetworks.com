"use client";

import React from "react";
import Image from "next/image";
import { Avatar, Box, ButtonBase, Typography } from "@mui/material";
import type { Course } from "./course-data";
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
    course: Course;
    onStart: () => void;
    onTrailer: () => void;
}

const INSIDE: { key: string; icon: string; label: string; value: (c: Course) => string }[] = [
    { key: "xp", icon: `${MY_COURSES_ASSETS}/rank/stat-points.svg`, label: "Total Points", value: (c) => `${c.earnedXp} XP` },
    { key: "levels", icon: `${COURSE_ASSETS}/stat-levels.svg`, label: "Total Levels", value: (c) => String(c.totalLevels) },
    { key: "labs", icon: `${COURSE_ASSETS}/stat-labs.svg`, label: "Total Labs", value: (c) => String(c.totalLabs) },
    { key: "checks", icon: `${COURSE_ASSETS}/stat-knowledge.svg`, label: "Total Knowledge Checks", value: (c) => String(c.totalKnowledgeChecks) },
    { key: "badges", icon: `${COURSE_ASSETS}/stat-badges.svg`, label: "Total Badges", value: (c) => String(c.totalBadges) },
    { key: "rank", icon: `${COURSE_ASSETS}/stat-rank.svg`, label: "Batch Rank", value: (c) => `#${c.batchRank}` },
    { key: "video", icon: `${COURSE_ASSETS}/stat-video.svg`, label: "Video Duration", value: (c) => c.videoDuration },
    { key: "activity", icon: `${COURSE_ASSETS}/stat-knowledge.svg`, label: "Activity Duration", value: (c) => c.activityDuration },
];

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

export default function CourseOverviewTab({ course, onStart, onTrailer }: Props) {
    const prefix = course.title.endsWith(course.titleAccent)
        ? course.title.slice(0, course.title.length - course.titleAccent.length)
        : `${course.title} `;

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
                        <Box component="span" sx={{ color: COLORS.purple }}>
                            {course.titleAccent}
                        </Box>
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: "27px" }}>
                        {course.description.map((paragraph) => (
                            <Typography key={paragraph} sx={{ ...TYPE.largeMed18, color: COLORS.neutral100 }}>
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
                            {course.progress}% completed
                        </Typography>
                    </Box>
                    <ProgressTrack value={course.progress} fill={COLORS.white} minFill={3} />
                </Box>

                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "stretch", gap: "24px" }}>
                    <PrimaryButton icon={UI_ICONS.play18} onClick={onStart}>
                        Start Level 1
                    </PrimaryButton>

                    <ButtonBase
                        onClick={onTrailer}
                        sx={{
                            gap: "12px",
                            pl: "16px",
                            pr: "32px",
                            py: "8px",
                            borderRadius: "12px",
                            border: `1px solid ${COLORS.tileBorder}`,
                            backgroundImage: TRAILER_BUTTON_FILL,
                            transition: "border-color .18s ease",
                            "&:hover": { borderColor: "rgba(140,36,255,0.6)" },
                            "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" },
                        }}
                    >
                        <Image src={`${COURSE_ASSETS}/icon-trailer.svg`} alt="" width={18} height={18} />
                        <Typography component="span" sx={{ ...TYPE.smallMed14, color: COLORS.white, whiteSpace: "pre" }}>
                            {`Watch the trailer  - ${course.trailerDuration}`}
                        </Typography>
                    </ButtonBase>
                </Box>
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
                                {course.instructors.map((instructor) => (
                                    <Box key={instructor.instructorId} sx={tileSx}>
                                        <Avatar
                                            src={instructor.avatar}
                                            alt={instructor.name}
                                            sx={{ width: 40, height: 40, bgcolor: "#93A9E2", border: "0.8px solid #404040" }}
                                        />
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                                            <Typography noWrap sx={{ ...TYPE.mediumMed16, color: COLORS.neutral100 }}>
                                                {instructor.name}
                                            </Typography>
                                            <Typography noWrap sx={{ ...TYPE.xsMed12, color: COLORS.neutral300 }}>
                                                {instructor.designation}
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
