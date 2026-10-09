"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Box, ButtonBase, Menu, MenuItem, Typography } from "@mui/material";
import StudentLayout from "@/layouts/StudentLayout";
import ActiveMissionBanner from "@/components/courses/ActiveMissionBanner";
import CourseCard from "@/components/courses/CourseCard";
import MyCoursesHeader from "@/components/courses/MyCoursesHeader";
import RankPanel from "@/components/courses/RankPanel";
import { COURSES, LEARNER_RANK, activeCourse, type Course } from "@/components/courses/course-data";
import { COLORS, FONTS, SORT_BUTTON_FILL, TYPE, UI_ICONS } from "@/components/courses/my-courses-theme";

type SortKey = "default" | "levels" | "xp" | "title";

const SORTERS: Record<SortKey, (a: Course, b: Course) => number> = {
    default: () => 0,
    levels: (a, b) => b.totalLevels - a.totalLevels,
    xp: (a, b) => b.totalXp - a.totalXp,
    title: (a, b) => a.title.localeCompare(b.title),
};

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "default", label: "Default" },
    { key: "levels", label: "Most Levels" },
    { key: "xp", label: "Highest XP" },
    { key: "title", label: "Name (A-Z)" },
];

export default function MyCoursesPage() {
    const router = useRouter();
    const [sort, setSort] = useState<SortKey>("default");
    const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null);

    const active = activeCourse();
    const missions = useMemo(
        () => COURSES.filter((course) => course.courseId !== active.courseId).sort(SORTERS[sort]),
        [active.courseId, sort],
    );

    const openCourse = (courseId: string) => router.push(`/dashboard/student/my-courses/${courseId}`);
    const sortLabel = sort === "default" ? "Sort By" : SORT_OPTIONS.find((o) => o.key === sort)?.label;

    return (
        <StudentLayout
            header={
                <MyCoursesHeader
                    title="My Courses"
                    actions={[
                        { label: "Set Goal", onClick: () => router.push("/dashboard/student/my-courses/set-goal") },
                        { label: "My Leaderboard", onClick: () => router.push("/dashboard/student/my-courses/leaderboard") },
                    ]}
                />
            }
        >
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 423px" },
                    gap: "24px",
                    alignItems: "flex-start",
                    pt: { lg: "8px" },
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
                    <ActiveMissionBanner
                        course={active}
                        onStart={() => openCourse(active.courseId)}
                        onOpen={() => openCourse(active.courseId)}
                    />

                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", minHeight: 32 }}>
                        <Typography component="h2" sx={{ ...TYPE.headingMed20, color: COLORS.white }}>
                            All Courses
                        </Typography>

                        <ButtonBase
                            aria-haspopup="listbox"
                            aria-expanded={Boolean(sortAnchor)}
                            onClick={(e) => setSortAnchor(e.currentTarget)}
                            sx={{
                                height: 32,
                                gap: "8px",
                                pl: "16px",
                                pr: "12px",
                                py: "8px",
                                borderRadius: "6px",
                                backgroundImage: SORT_BUTTON_FILL,
                                backdropFilter: "blur(12px)",
                                "&:hover": { backgroundImage: "linear-gradient(180deg, rgba(187,201,237,0.16) 0%, rgba(106,114,135,0.1) 100%)" },
                                "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" },
                            }}
                        >
                            <Typography component="span" sx={{ ...TYPE.smallMed14, color: COLORS.white, whiteSpace: "nowrap" }}>
                                {sortLabel}
                            </Typography>
                            <Image
                                src={UI_ICONS.chevronDown16}
                                alt=""
                                width={16}
                                height={16}
                                style={{ transform: sortAnchor ? "rotate(180deg)" : "none", transition: "transform .18s ease" }}
                            />
                        </ButtonBase>
                        <Menu
                            anchorEl={sortAnchor}
                            open={Boolean(sortAnchor)}
                            onClose={() => setSortAnchor(null)}
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                            slotProps={{
                                paper: {
                                    sx: {
                                        mt: "6px",
                                        minWidth: 150,
                                        borderRadius: "10px",
                                        border: `1px solid ${COLORS.buttonBorder}`,
                                        bgcolor: "rgba(10,10,16,0.92)",
                                        backdropFilter: "blur(12px)",
                                        "& .MuiMenuItem-root": { fontFamily: FONTS.lato, fontSize: "14px", color: COLORS.neutral100 },
                                        "& .MuiMenuItem-root.Mui-selected": { bgcolor: "rgba(140,36,255,0.18)", color: COLORS.white },
                                    },
                                },
                            }}
                        >
                            {SORT_OPTIONS.map((option) => (
                                <MenuItem
                                    key={option.key}
                                    selected={option.key === sort}
                                    onClick={() => {
                                        setSort(option.key);
                                        setSortAnchor(null);
                                    }}
                                >
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" },
                            gap: "24px",
                        }}
                    >
                        {missions.map((course) => (
                            <CourseCard key={course.courseId} course={course} onClick={() => openCourse(course.courseId)} />
                        ))}
                    </Box>
                </Box>

                <Box sx={{ minWidth: 0 }}>
                    <RankPanel rank={LEARNER_RANK} />
                </Box>
            </Box>
        </StudentLayout>
    );
}
