"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Box, ButtonBase, Menu, MenuItem, Typography } from "@mui/material";
import { MdOutlineSchool, MdOutlineWifiOff } from "react-icons/md";
import toast from "react-hot-toast";
import StudentLayout from "@/layouts/StudentLayout";
import ActiveMissionBanner from "@/components/courses/ActiveMissionBanner";
import CourseCard from "@/components/courses/CourseCard";
import MyCoursesHeader from "@/components/courses/MyCoursesHeader";
import RankPanel from "@/components/courses/RankPanel";
import { LEADERBOARD_PATH, SET_GOAL_PATH, courseDetailPath, modulePath } from "@/components/courses/course-format";
import { COLORS, FONTS, SORT_BUTTON_FILL, TYPE, UI_ICONS } from "@/components/courses/my-courses-theme";
import { NoticePanel, SkeletonBlock } from "@/components/courses/my-courses-ui";
import { useCourse, type MyCourseCard, type MyCoursesSort } from "@/contexts/CourseContext";

const SORT_OPTIONS: { key: MyCoursesSort; label: string }[] = [
    { key: "default", label: "Default" },
    { key: "recent", label: "Recently Active" },
    { key: "levels", label: "Most Levels" },
    { key: "xp", label: "Highest XP" },
    { key: "title", label: "Name (A-Z)" },
];

function MyCoursesSkeleton() {
    return (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 423px" }, gap: "24px", pt: { lg: "8px" } }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
                <SkeletonBlock height={340} />
                <SkeletonBlock height={32} radius={8} sx={{ width: 160 }} />
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }, gap: "24px" }}>
                    {[0, 1, 2, 3].map((i) => (
                        <SkeletonBlock key={i} height={250} />
                    ))}
                </Box>
            </Box>
            <SkeletonBlock height={820} radius={24} />
        </Box>
    );
}

export default function MyCoursesPage() {
    const router = useRouter();
    const { myCourses, loadingMyCourses, getMyCourses, getContinueLearning } = useCourse();
    const [sort, setSort] = useState<MyCoursesSort>("default");
    const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [starting, setStarting] = useState(false);

    const load = useCallback(
        async (next: MyCoursesSort) => {
            const res = await getMyCourses(next);
            setError(res.success ? null : (res.message ?? "Failed to fetch your courses"));
        },
        [getMyCourses],
    );

    useEffect(() => {
        load(sort);
    }, [load, sort]);

    const active = myCourses?.activeCourse ?? null;
    const missions = (myCourses?.courses ?? []).filter((course) => course.courseId !== active?.courseId);
    const openCourse = (course: MyCourseCard) => {
        if (course.status === "Upcoming") {
            toast(`${course.shortTitle ?? course.title} is being prepared. You'll be able to start once its content is published.`);
            return;
        }
        router.push(courseDetailPath(course.courseId));
    };
    const sortLabel = sort === "default" ? "Sort By" : SORT_OPTIONS.find((o) => o.key === sort)?.label;

    /** Jumps straight into the next unfinished lesson of the active mission. */
    const continueLearning = async (courseId: string) => {
        if (starting) return;
        setStarting(true);
        try {
            const res = await getContinueLearning(courseId);
            if (!res.success || !res.data) {
                toast.error(res.message ?? "Couldn't find your next lesson");
                return;
            }
            const next = res.data.next;
            router.push(next ? modulePath(courseId, next.moduleId, next.lessonId) : courseDetailPath(courseId, "levels"));
        } finally {
            setStarting(false);
        }
    };

    const showSkeleton = !myCourses && (loadingMyCourses || !error);

    return (
        <StudentLayout
            header={
                <MyCoursesHeader
                    title="My Courses"
                    actions={[
                        { label: "Set Goal", onClick: () => router.push(SET_GOAL_PATH) },
                        { label: "My Leaderboard", onClick: () => router.push(LEADERBOARD_PATH) },
                    ]}
                />
            }
        >
            {showSkeleton ? (
                <MyCoursesSkeleton />
            ) : !myCourses ? (
                <NoticePanel
                    icon={<MdOutlineWifiOff size={26} color="#4b4b58" />}
                    title="We couldn't load your courses"
                    message={error ?? undefined}
                    action={{ label: "Try again", onClick: () => load(sort) }}
                />
            ) : (
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
                        {active && (
                            <ActiveMissionBanner
                                course={active}
                                starting={starting}
                                onStart={() => continueLearning(active.courseId)}
                                onOpen={() => openCourse(active)}
                            />
                        )}

                        {myCourses.courses.length === 0 ? (
                            <NoticePanel
                                icon={<MdOutlineSchool size={28} color="#4b4b58" />}
                                title="No missions yet"
                                message="Courses appear here once you join a batch or purchase a course or package."
                            />
                        ) : (
                            <>
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
                                                    minWidth: 170,
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

                                {missions.length === 0 ? (
                                    <NoticePanel title="This is your only mission for now" message="New missions show up here as you unlock them." />
                                ) : (
                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" },
                                            gap: "24px",
                                            opacity: loadingMyCourses ? 0.6 : 1,
                                            transition: "opacity .18s ease",
                                        }}
                                    >
                                        {missions.map((course) => (
                                            <CourseCard key={course.courseId} course={course} onClick={() => openCourse(course)} />
                                        ))}
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                        <RankPanel rank={myCourses.rank} />
                    </Box>
                </Box>
            )}
        </StudentLayout>
    );
}
