"use client";

import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { MdLayers, MdStarBorder, MdBolt, MdPlayArrow } from "react-icons/md";
import MissionHex from "./MissionHex";
import { MissionChip, ProgressBar } from "./course-ui";
import type { Course } from "./course-data";

interface Props {
    course: Course;
    onStart: () => void;
    onOpen: () => void;
}

export default function ActiveMissionBanner({ course, onStart, onOpen }: Props) {
    return (
        <Box
            sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: "14px",
                border: `1px solid ${course.accent}`,
                bgcolor: "#07070d",
                cursor: "pointer",
                transition: "transform .18s ease, box-shadow .18s ease",
                "&:hover": { transform: "translateY(-2px)", boxShadow: `0 18px 40px -20px ${course.accent}` },
            }}
            onClick={onOpen}
        >
            {/* Key art */}
            <Box sx={{ position: "relative", background: course.art, p: { xs: 1.5, sm: 2 }, pb: { xs: 2, sm: 2.5 } }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 1.5,
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Box
                            component="span"
                            sx={{
                                display: "inline-block",
                                px: 1.1,
                                py: 0.3,
                                mb: 1.25,
                                borderRadius: "999px",
                                bgcolor: "#0d0d18",
                                color: "#e4e4ec",
                                fontSize: "0.65rem",
                                fontWeight: 700,
                            }}
                        >
                            Active Mission
                        </Box>

                        <Typography
                            sx={{
                                color: "#fff",
                                fontSize: { xs: "1.05rem", sm: "1.35rem" },
                                fontWeight: 800,
                                fontStyle: "italic",
                                lineHeight: 1.2,
                                letterSpacing: "-0.01em",
                            }}
                        >
                            {course.title}
                        </Typography>
                        <Typography sx={{ mt: 0.4, color: "#d8d8e4", fontSize: "0.72rem" }}>{course.tagline}</Typography>

                        <Typography sx={{ mt: 1.5, mb: 0.6, color: "#d8d8e4", fontSize: "0.65rem", fontWeight: 600 }}>
                            Quick Insights :
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                            <MissionChip icon={<MdLayers size={13} color="#c4b5fd" />} label={`${course.totalLevels} levels`} />
                            <MissionChip icon={<MdStarBorder size={13} color="#fbbf24" />} label={`${course.totalBadges} badges`} />
                            <MissionChip icon={<MdBolt size={13} color="#38bdf8" />} label={`${course.totalXp} XP`} />
                        </Box>
                    </Box>

                    <Box sx={{ display: { xs: "none", sm: "block" } }}>
                        <MissionHex accent="#c4b5fd" accentDark={course.accentDark} size={124} />
                    </Box>
                </Box>
            </Box>

            {/* Continue strip */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    p: 1.25,
                    bgcolor: "#0a0a12",
                    borderTop: "1px solid #1c1c26",
                    flexWrap: { xs: "wrap", sm: "nowrap" },
                }}
            >
                <Box
                    sx={{
                        width: 30,
                        height: 30,
                        flexShrink: 0,
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "#16162a",
                        border: "1px solid #2b2b38",
                        color: "#c4b5fd",
                    }}
                >
                    <MdLayers size={15} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 140 }}>
                    <Typography noWrap sx={{ color: "#e4e4ec", fontSize: "0.72rem", fontWeight: 600, mb: 0.6 }}>
                        {course.currentLevelLabel}
                    </Typography>
                    <ProgressBar value={course.progress} from="#009DFF" to={course.accent} />
                </Box>

                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        onStart();
                    }}
                    startIcon={<MdPlayArrow size={16} />}
                    sx={{
                        flexShrink: 0,
                        px: 1.5,
                        py: 0.6,
                        borderRadius: "8px",
                        bgcolor: "#009DFF",
                        color: "#fff",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        textTransform: "none",
                        "&:hover": { bgcolor: "#007fd4" },
                    }}
                >
                    Start Learning
                </Button>
            </Box>
        </Box>
    );
}
