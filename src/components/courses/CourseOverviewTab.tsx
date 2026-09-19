"use client";

import React from "react";
import { Box, Button, Typography, Avatar } from "@mui/material";
import {
    MdBolt,
    MdLayers,
    MdOutlineScience,
    MdOutlineQuiz,
    MdWorkspacePremium,
    MdLeaderboard,
    MdOutlineSchedule,
    MdOutlineTimer,
    MdPlayArrow,
    MdPlayCircleOutline,
} from "react-icons/md";
import { ProgressBar, SectionLabel, StatTile } from "./course-ui";
import type { Course } from "./course-data";

interface Props {
    course: Course;
    onStart: () => void;
    onTrailer: () => void;
}

export default function CourseOverviewTab({ course, onStart, onTrailer }: Props) {
    const prefix = course.title.endsWith(course.titleAccent)
        ? course.title.slice(0, course.title.length - course.titleAccent.length)
        : `${course.title} `;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0 }}>
            <Box>
                <Typography
                    sx={{
                        color: "#fff",
                        fontSize: { xs: "1.5rem", sm: "2rem", lg: "2.35rem" },
                        fontWeight: 800,
                        lineHeight: 1.15,
                        letterSpacing: "-0.02em",
                    }}
                >
                    {prefix}
                    <Box component="span" sx={{ color: course.accent }}>
                        {course.titleAccent}
                    </Box>
                </Typography>
            </Box>

            {course.description.map((paragraph) => (
                <Typography key={paragraph} sx={{ color: "#c9c9d4", fontSize: "0.82rem", lineHeight: 1.65 }}>
                    {paragraph}
                </Typography>
            ))}

            <Box sx={{ p: 1.25, borderRadius: "12px", border: "1px solid #1c1c26", bgcolor: "#0b0b12" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 0.9 }}>
                    <Typography sx={{ color: "#e4e4ec", fontSize: "0.75rem", fontWeight: 600 }}>Course Progress</Typography>
                    <Typography sx={{ color: "#8a8a9a", fontSize: "0.72rem", fontWeight: 600 }}>
                        {course.progress}% completed
                    </Typography>
                </Box>
                <ProgressBar value={Math.max(course.progress, 1)} from="#ffffff" to={course.accent} height={6} />
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                <Button
                    onClick={onStart}
                    startIcon={<MdPlayArrow size={17} />}
                    sx={{
                        px: 2,
                        py: 0.8,
                        borderRadius: "8px",
                        background: `linear-gradient(95deg, ${course.accent} 0%, #009DFF 100%)`,
                        color: "#fff",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        textTransform: "none",
                        "&:hover": { filter: "brightness(1.1)" },
                    }}
                >
                    Start Level 1
                </Button>
                <Button
                    onClick={onTrailer}
                    startIcon={<MdPlayCircleOutline size={17} />}
                    sx={{
                        px: 2,
                        py: 0.8,
                        borderRadius: "8px",
                        border: "1px solid #2b2b38",
                        bgcolor: "#0b0b12",
                        color: "#e4e4ec",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        textTransform: "none",
                        "&:hover": { borderColor: course.accent, bgcolor: "#15151d" },
                    }}
                >
                    Watch the trailer&nbsp;&nbsp;-&nbsp;{course.trailerDuration}
                </Button>
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "1.35fr 1fr" },
                    gap: 1.25,
                    alignItems: "flex-start",
                }}
            >
                <Box sx={{ p: 1.25, borderRadius: "14px", border: "1px solid #1c1c26", bgcolor: "#07070d" }}>
                    <SectionLabel>WHAT&apos;S INSIDE</SectionLabel>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1 }}>
                        <StatTile icon={<MdBolt size={14} />} value={`${course.earnedXp} XP`} label="Total Points" accent="#7c3aed" />
                        <StatTile icon={<MdLayers size={14} />} value={String(course.totalLevels)} label="Total Levels" accent="#0284c7" />
                        <StatTile icon={<MdOutlineScience size={14} />} value={String(course.totalLabs)} label="Total Labs" accent="#10b981" />
                        <StatTile icon={<MdOutlineQuiz size={14} />} value={String(course.totalKnowledgeChecks)} label="Total Knowledge Checks" accent="#06b6d4" />
                        <StatTile icon={<MdWorkspacePremium size={14} />} value={String(course.totalBadges)} label="Total Badges" accent="#f59e0b" />
                        <StatTile icon={<MdLeaderboard size={14} />} value={`#${course.batchRank}`} label="Batch Rank" accent="#f43f5e" />
                        <StatTile icon={<MdOutlineSchedule size={14} />} value={course.videoDuration} label="Video Duration" accent="#8b5cf6" />
                        <StatTile icon={<MdOutlineTimer size={14} />} value={course.activityDuration} label="Activity Duration" accent="#f97316" />
                    </Box>
                </Box>

                <Box sx={{ p: 1.25, borderRadius: "14px", border: "1px solid #1c1c26", bgcolor: "#07070d" }}>
                    <SectionLabel>INSTRUCTORS ({course.instructors.length})</SectionLabel>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                        {course.instructors.map((instructor) => (
                            <Box
                                key={instructor.instructorId}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    px: 1,
                                    py: 0.85,
                                    borderRadius: "10px",
                                    border: "1px solid #1c1c26",
                                    bgcolor: "#0b0b12",
                                    transition: "border-color .18s ease",
                                    "&:hover": { borderColor: course.accent },
                                }}
                            >
                                <Avatar src={instructor.avatar} alt={instructor.name} sx={{ width: 30, height: 30 }} />
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography noWrap sx={{ color: "#fff", fontSize: "0.78rem", fontWeight: 600, lineHeight: 1.3 }}>
                                        {instructor.name}
                                    </Typography>
                                    <Typography noWrap sx={{ color: "#8a8a9a", fontSize: "0.65rem" }}>
                                        {instructor.designation}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
