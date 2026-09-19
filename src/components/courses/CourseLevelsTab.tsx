"use client";

import React from "react";
import { Box, Button, Typography } from "@mui/material";
import {
    MdCheckCircle,
    MdHexagon,
    MdPlayArrow,
    MdArrowForward,
    MdAssignmentTurnedIn,
    MdSchedule,
    MdBolt,
    MdPersonOutline,
    MdOutlineCheckCircle,
} from "react-icons/md";
import { Dot } from "./course-ui";
import { THUMB_ART, type Course, type CourseLesson, type CourseLevel } from "./course-data";

function LessonThumb({ lesson }: { lesson: CourseLesson }) {
    return (
        <Box
            sx={{
                position: "relative",
                width: { xs: 64, sm: 78 },
                height: { xs: 40, sm: 48 },
                flexShrink: 0,
                borderRadius: "8px",
                overflow: "hidden",
                background: THUMB_ART[lesson.art % THUMB_ART.length],
                border: "1px solid #1c1c26",
            }}
        >
            {lesson.kind === "video" && (
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Box
                        sx={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "#ffffff",
                            color: "#0b0b12",
                        }}
                    >
                        <MdPlayArrow size={13} />
                    </Box>
                </Box>
            )}
        </Box>
    );
}

function LessonRow({ lesson, accent, onOpen }: { lesson: CourseLesson; accent: string; onOpen: () => void }) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                p: 1,
                borderRadius: "10px",
                border: "1px solid #1c1c26",
                bgcolor: "#0b0b12",
                transition: "border-color .18s ease, background .18s ease",
                "&:hover": { borderColor: accent, bgcolor: "#10101a" },
            }}
        >
            <LessonThumb lesson={lesson} />

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    sx={{
                        color: "#fff",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        lineHeight: 1.35,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {lesson.title}
                </Typography>

                <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 0.6, flexWrap: "wrap" }}>
                    {lesson.tasks > 0 && (
                        <>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                                <MdAssignmentTurnedIn size={12} color="#8a8a9a" />
                                <Typography sx={{ color: "#9a9aab", fontSize: "0.66rem" }}>{lesson.tasks} Tasks</Typography>
                            </Box>
                            <Dot />
                        </>
                    )}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                        <MdSchedule size={12} color="#8a8a9a" />
                        <Typography sx={{ color: "#9a9aab", fontSize: "0.66rem" }}>{lesson.duration}</Typography>
                    </Box>
                    <Dot />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                        <MdBolt size={12} color="#f59e0b" />
                        <Typography sx={{ color: "#9a9aab", fontSize: "0.66rem" }}>{lesson.xp} XP</Typography>
                    </Box>
                    <Dot />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                        <MdPersonOutline size={12} color="#8a8a9a" />
                        <Typography sx={{ color: "#9a9aab", fontSize: "0.66rem" }}>
                            {lesson.instructor}
                            {lesson.extraInstructors > 0 ? ` +${lesson.extraInstructors}` : ""}
                        </Typography>
                    </Box>
                    {lesson.completed && lesson.extraInstructors === 0 && (
                        <>
                            <Dot />
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                                <MdOutlineCheckCircle size={12} color="#10b981" />
                                <Typography sx={{ color: "#10b981", fontSize: "0.66rem", fontWeight: 600 }}>Completed</Typography>
                            </Box>
                        </>
                    )}
                </Box>
            </Box>

            <Button
                onClick={onOpen}
                startIcon={lesson.completed ? <MdPlayArrow size={15} /> : undefined}
                endIcon={lesson.completed ? undefined : <MdArrowForward size={14} />}
                sx={{
                    flexShrink: 0,
                    px: 1.25,
                    py: 0.5,
                    borderRadius: "8px",
                    border: "1px solid #2b2b38",
                    bgcolor: "#12121c",
                    color: "#e4e4ec",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    "&:hover": { borderColor: accent, bgcolor: "#1d1d28" },
                }}
            >
                {lesson.completed ? "Restart Video" : "View Details"}
            </Button>
        </Box>
    );
}

function LevelBlock({ level, accent, onOpenLesson }: { level: CourseLevel; accent: string; onOpenLesson: (lesson: CourseLesson) => void }) {
    const done = level.progress >= 100;

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "220px 1fr", lg: "260px 1fr" },
                gap: 1.25,
                p: 1.25,
                borderRadius: "14px",
                border: "1px solid #1c1c26",
                bgcolor: "#07070d",
                alignItems: "flex-start",
            }}
        >
            <Box sx={{ position: { md: "sticky" }, top: 0 }}>
                <Typography sx={{ color: "#6f6f80", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em" }}>
                    LEVEL {level.levelNo}
                </Typography>
                <Typography sx={{ mt: 0.4, color: "#fff", fontSize: "1rem", fontWeight: 700, lineHeight: 1.3 }}>
                    {level.title}
                </Typography>

                <Box sx={{ mt: 1, display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                    {done ? (
                        <>
                            <MdCheckCircle size={17} color="#10b981" />
                            <Typography sx={{ color: "#34d399", fontSize: "0.72rem", fontWeight: 600 }}>Completed</Typography>
                        </>
                    ) : (
                        <>
                            <MdHexagon size={17} color={level.progress > 0 ? accent : "#3a3a48"} />
                            <Typography sx={{ color: level.progress > 0 ? "#c4b5fd" : "#8a8a9a", fontSize: "0.72rem", fontWeight: 600 }}>
                                {level.progress > 0 ? `${level.progress} % Completed` : "Not Started"}
                            </Typography>
                        </>
                    )}
                </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, minWidth: 0 }}>
                {level.lessons.map((lesson) => (
                    <LessonRow key={lesson.lessonId} lesson={lesson} accent={accent} onOpen={() => onOpenLesson(lesson)} />
                ))}
            </Box>
        </Box>
    );
}

export default function CourseLevelsTab({ course, onOpenLesson }: { course: Course; onOpenLesson: (lesson: CourseLesson) => void }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {course.levels.map((level) => (
                <LevelBlock key={level.levelId} level={level} accent={course.accent} onOpenLesson={onOpenLesson} />
            ))}
        </Box>
    );
}
