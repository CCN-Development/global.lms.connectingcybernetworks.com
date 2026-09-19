"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, MenuItem, Select, Typography } from "@mui/material";
import { MdOutlineFlag, MdLeaderboard } from "react-icons/md";
import StudentLayout from "@/layouts/StudentLayout";
import StudentHeader from "@/layouts/StudentHeader";
import ActiveMissionBanner from "@/components/courses/ActiveMissionBanner";
import CourseCard from "@/components/courses/CourseCard";
import RankPanel from "@/components/courses/RankPanel";
import { COURSES, LEARNER_RANK, activeCourse, type Course } from "@/components/courses/course-data";

type SortKey = "default" | "levels" | "xp" | "title";

const SORTERS: Record<SortKey, (a: Course, b: Course) => number> = {
    default: () => 0,
    levels: (a, b) => b.totalLevels - a.totalLevels,
    xp: (a, b) => b.totalXp - a.totalXp,
    title: (a, b) => a.title.localeCompare(b.title),
};

const SORT_LABELS: Record<SortKey, string> = {
    default: "Sort By",
    levels: "Most Levels",
    xp: "Highest XP",
    title: "Name (A-Z)",
};

const selectSx = {
    minWidth: 118,
    height: 32,
    borderRadius: "8px",
    bgcolor: "#0b0b12",
    color: "#c9c9d4",
    fontSize: "0.72rem",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#2b2b38" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#7c3aed" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#009DFF" },
    "& .MuiSelect-icon": { color: "#8a8a9a" },
};

const menuSlotProps = {
    paper: {
        sx: {
            bgcolor: "#0b0b12",
            border: "1px solid #2b2b38",
            borderRadius: "10px",
            "& .MuiMenuItem-root": { fontSize: "0.72rem", color: "#c9c9d4" },
            "& .MuiMenuItem-root.Mui-selected": { bgcolor: "#1d1d28", color: "#fff" },
        },
    },
};

const actionBtnSx = {
    px: 1.5,
    py: 0.55,
    borderRadius: "8px",
    border: "1px solid #2b2b38",
    bgcolor: "#0b0b12",
    color: "#e4e4ec",
    fontSize: "0.72rem",
    fontWeight: 600,
    textTransform: "none" as const,
    whiteSpace: "nowrap" as const,
};

export default function MyCoursesPage() {
    const router = useRouter();
    const [sort, setSort] = useState<SortKey>("default");

    const active = activeCourse();
    const allCourses = useMemo(() => [...COURSES].sort(SORTERS[sort]), [sort]);

    const openCourse = (courseId: string) => router.push(`/dashboard/student/my-courses/${courseId}`);

    return (
        <StudentLayout header={<StudentHeader title="My Courses" />}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mb: 1.25 }}>
                <Button
                    startIcon={<MdOutlineFlag size={14} />}
                    sx={{ ...actionBtnSx, "&:hover": { borderColor: "#10b981", bgcolor: "#15151d" } }}
                >
                    Set Goal
                </Button>
                <Button
                    onClick={() => router.push("/dashboard/student/community")}
                    startIcon={<MdLeaderboard size={14} />}
                    sx={{ ...actionBtnSx, "&:hover": { borderColor: "#7c3aed", bgcolor: "#15151d" } }}
                >
                    My Leaderboard
                </Button>
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 320px" },
                    gap: 1.5,
                    alignItems: "flex-start",
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0 }}>
                    <ActiveMissionBanner
                        course={active}
                        onStart={() => openCourse(active.courseId)}
                        onOpen={() => openCourse(active.courseId)}
                    />

                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                        <Typography sx={{ color: "#fff", fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
                            All Courses
                        </Typography>

                        <Select
                            size="small"
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortKey)}
                            renderValue={(value) => SORT_LABELS[value as SortKey]}
                            sx={selectSx}
                            MenuProps={{ slotProps: menuSlotProps }}
                        >
                            <MenuItem value="default">Default</MenuItem>
                            <MenuItem value="levels">Most Levels</MenuItem>
                            <MenuItem value="xp">Highest XP</MenuItem>
                            <MenuItem value="title">Name (A-Z)</MenuItem>
                        </Select>
                    </Box>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                            gap: 1.5,
                        }}
                    >
                        {allCourses.map((course) => (
                            <CourseCard key={course.courseId} course={course} onClick={() => openCourse(course.courseId)} />
                        ))}
                    </Box>
                </Box>

                <Box sx={{ position: { lg: "sticky" }, top: 0, minWidth: 0 }}>
                    <RankPanel rank={LEARNER_RANK} />
                </Box>
            </Box>
        </StudentLayout>
    );
}