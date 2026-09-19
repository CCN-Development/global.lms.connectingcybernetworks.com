"use client";

import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { MdOutlineVideoLibrary, MdOutlineDescription, MdOutlineScience, MdLocalFireDepartment } from "react-icons/md";
import LevelShield from "./LevelShield";
import { ProgressBar, SectionLabel } from "./course-ui";
import type { Course, CourseContentBreakdown, LearnerRank } from "./course-data";

const CONTENT_META: Record<CourseContentBreakdown["kind"], { icon: React.ReactNode; accent: string }> = {
    video: { icon: <MdOutlineVideoLibrary size={14} />, accent: "#7c3aed" },
    test: { icon: <MdOutlineDescription size={14} />, accent: "#0284c7" },
    lab: { icon: <MdOutlineScience size={14} />, accent: "#10b981" },
};

interface Props {
    course: Course;
    rank: LearnerRank;
    onSetGoal: () => void;
}

export default function CourseSidePanel({ course, rank, onSetGoal }: Props) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            <Box sx={{ p: 1.25, borderRadius: "14px", border: "1px solid #1c1c26", bgcolor: "#07070d" }}>
                <LevelShield level={rank.level} title={rank.title} />

                <Box sx={{ mt: 1.25 }}>
                    <SectionLabel>CONTENT</SectionLabel>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                        {course.content.map((item) => {
                            const meta = CONTENT_META[item.kind];
                            return (
                                <Box
                                    key={item.label}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        px: 1,
                                        py: 0.9,
                                        borderRadius: "10px",
                                        border: "1px solid #1c1c26",
                                        bgcolor: "#0b0b12",
                                        transition: "border-color .18s ease",
                                        "&:hover": { borderColor: meta.accent },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 28,
                                            height: 28,
                                            flexShrink: 0,
                                            borderRadius: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            background: `linear-gradient(145deg, ${meta.accent} 0%, #1e1b3a 100%)`,
                                            color: "#fff",
                                        }}
                                    >
                                        {meta.icon}
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.6 }}>
                                            <Typography noWrap sx={{ flex: 1, color: "#e4e4ec", fontSize: "0.72rem", fontWeight: 600 }}>
                                                {item.label}
                                            </Typography>
                                            <Typography sx={{ flexShrink: 0, color: "#fbbf24", fontSize: "0.68rem", fontWeight: 700 }}>
                                                +{item.xp}XP
                                            </Typography>
                                        </Box>
                                        <ProgressBar value={item.progress} from={meta.accent} to="#009DFF" height={4} />
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Box>

            <Box
                sx={{
                    p: 1.5,
                    borderRadius: "14px",
                    border: "1px solid #78350f",
                    background: "linear-gradient(160deg, #1d1206 0%, #0a0a12 65%)",
                    textAlign: "center",
                }}
            >
                <MdLocalFireDepartment size={34} color="#f97316" />
                <Typography sx={{ mt: 0.4, color: "#fff", fontSize: "0.95rem", fontWeight: 700 }}>
                    Start your Streak
                </Typography>
                <Typography sx={{ mt: 0.5, color: "#9a9aab", fontSize: "0.68rem", lineHeight: 1.5 }}>
                    Complete your first learning activity today and start building your streak.
                </Typography>
                <Button
                    fullWidth
                    onClick={onSetGoal}
                    sx={{
                        mt: 1.25,
                        py: 0.7,
                        borderRadius: "8px",
                        border: "1px solid #2b2b38",
                        bgcolor: "#12121c",
                        color: "#e4e4ec",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "none",
                        "&:hover": { borderColor: "#f97316", bgcolor: "#1d1d28" },
                    }}
                >
                    Set Learning Goal
                </Button>
            </Box>
        </Box>
    );
}
