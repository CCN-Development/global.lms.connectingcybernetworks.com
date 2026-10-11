"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import { MdOutlineSearchOff } from "react-icons/md";
import StudentLayout from "@/layouts/StudentLayout";
import { useCourse, type CourseOverview } from "@/contexts/CourseContext";
import { MY_COURSES_PATH, courseDetailPath, courseStatusLabel, type CourseDetailTab } from "./course-format";
import { COLORS, TYPE } from "./my-courses-theme";
import { BackButton, NoticePanel, PillTabs, SkeletonBlock, StatusPill } from "./my-courses-ui";

const TABS: { key: CourseDetailTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "levels", label: "Levels" },
];

export interface CourseDetailContext {
    course: CourseOverview;
    /** Re-fetches the overview (after setting the active mission, finishing a goal, …). */
    reload: () => Promise<void>;
}

/** Shared frame for the course detail routes: course lookup, header row and the Overview / Levels switch. */
export default function CourseDetailShell({
    tab,
    children,
}: {
    tab: CourseDetailTab;
    children: (ctx: CourseDetailContext) => React.ReactNode;
}) {
    const router = useRouter();
    const params = useParams();
    const courseParam = params?.course_id as string;
    const { courseOverview, getCourseOverview } = useCourse();
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        if (!courseParam) return;
        const res = await getCourseOverview(courseParam);
        setError(res.success ? null : (res.message ?? "This course could not be found."));
    }, [courseParam, getCourseOverview]);

    useEffect(() => {
        reload();
    }, [reload]);

    // The context keeps one overview; only use it when it belongs to this route (UUID or slug).
    const course = courseOverview && (courseOverview.courseId === courseParam || courseOverview.slug === courseParam) ? courseOverview : null;
    const levels = tab === "levels";
    const back = <BackButton label="Back to My Courses" onClick={() => router.push(MY_COURSES_PATH)} />;

    if (!course) {
        return (
            <StudentLayout header={<Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>{back}</Box>}>
                {error ? (
                    <NoticePanel
                        icon={<MdOutlineSearchOff size={26} color="#4b4b58" />}
                        title="This course isn't available"
                        message={error}
                        action={{ label: "Back to My Courses", onClick: () => router.push(MY_COURSES_PATH) }}
                    />
                ) : (
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 374px" }, gap: "24px" }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            <SkeletonBlock height={66} radius={12} sx={{ width: "70%" }} />
                            <SkeletonBlock height={120} radius={12} />
                            <SkeletonBlock height={360} radius={24} />
                        </Box>
                        <SkeletonBlock height={560} radius={24} />
                    </Box>
                )}
            </StudentLayout>
        );
    }

    const header = (
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: "12px", sm: levels ? "16px" : "24px" }, minWidth: 0 }}>
            {back}

            {levels && (
                <Typography component="h1" noWrap sx={{ ...TYPE.headingSemibold24, fontSize: { xs: "18px", sm: "24px" }, color: COLORS.white, minWidth: 0 }}>
                    {course.title}
                </Typography>
            )}

            <Box sx={{ display: { xs: levels ? "none" : "flex", sm: "flex" } }}>
                <StatusPill label={courseStatusLabel(course.status)} size={levels ? "sm" : "md"} />
            </Box>

            <Box sx={{ ml: "auto" }}>
                <PillTabs
                    options={TABS}
                    value={tab}
                    onChange={(next) => router.push(courseDetailPath(courseParam, next))}
                    ariaLabel="Course sections"
                />
            </Box>
        </Box>
    );

    return <StudentLayout header={header}>{children({ course, reload })}</StudentLayout>;
}
