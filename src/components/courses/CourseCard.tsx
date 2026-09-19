"use client";

import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { MdLayers, MdStarBorder, MdSchedule, MdBolt, MdLock, MdPlayArrow } from "react-icons/md";
import MissionHex from "./MissionHex";
import { MissionChip } from "./course-ui";
import type { Course } from "./course-data";

interface Props {
    course: Course;
    onClick: () => void;
}

export default function CourseCard({ course, onClick }: Props) {
    const locked = course.status === "Locked";

    return (
        <Box
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onClick();
            }}
            sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                borderRadius: "14px",
                border: `1px solid ${course.accent}`,
                bgcolor: "#07070d",
                cursor: "pointer",
                transition: "transform .18s ease, box-shadow .18s ease",
                "&:hover": { transform: "translateY(-3px)", boxShadow: `0 16px 36px -18px ${course.accent}` },
                "&:focus-visible": { outline: "2px solid #009DFF", outlineOffset: "2px" },
            }}
        >
            <Box sx={{ position: "relative", background: course.art, p: 1.5, pb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                            noWrap
                            sx={{
                                color: "#fff",
                                fontSize: "1.05rem",
                                fontWeight: 800,
                                fontStyle: "italic",
                                lineHeight: 1.2,
                                letterSpacing: "-0.01em",
                            }}
                        >
                            {course.title}
                        </Typography>
                        <Typography noWrap sx={{ mt: 0.3, color: "#d8d8e4", fontSize: "0.68rem" }}>
                            {course.tagline}
                        </Typography>
                    </Box>

                    <MissionHex accent={course.accent} accentDark={course.accentDark} size={74} locked={locked} />
                </Box>

                <Typography sx={{ mt: 1.4, mb: 0.6, color: "#d8d8e4", fontSize: "0.62rem", fontWeight: 600 }}>
                    Mission Includes :
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
                    <MissionChip icon={<MdLayers size={12} color="#c4b5fd" />} label={`${course.totalLevels} Levels`} />
                    <MissionChip icon={<MdStarBorder size={12} color="#fbbf24" />} label={`${course.totalBadges} Badges`} />
                    <MissionChip icon={<MdSchedule size={12} color="#34d399" />} label={course.weeks} />
                    <MissionChip icon={<MdBolt size={12} color="#38bdf8" />} label={`${course.totalXp} XP`} />
                </Box>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 1.1,
                    bgcolor: "#0a0a12",
                    borderTop: "1px solid #1c1c26",
                }}
            >
                <Button
                    disableRipple={locked}
                    startIcon={locked ? <MdLock size={14} /> : <MdPlayArrow size={16} />}
                    sx={{
                        px: 1.75,
                        py: 0.5,
                        borderRadius: "8px",
                        border: "1px solid #2b2b38",
                        bgcolor: locked ? "#15151d" : "#009DFF",
                        color: locked ? "#9a9aab" : "#fff",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        textTransform: "none",
                        "&:hover": locked
                            ? { borderColor: course.accent, bgcolor: "#1d1d28" }
                            : { bgcolor: "#007fd4" },
                    }}
                >
                    {locked ? "Mission Locked" : "Continue Mission"}
                </Button>
            </Box>
        </Box>
    );
}
