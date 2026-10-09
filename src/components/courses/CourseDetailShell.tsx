"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import { MdOutlineSearchOff } from "react-icons/md";
import StudentLayout from "@/layouts/StudentLayout";
import { courseStatusBadge, findCourse, type Course } from "./course-data";
import { COLORS, TYPE } from "./my-courses-theme";
import { BackButton, PillTabs, StatusPill } from "./my-courses-ui";

export type CourseDetailTab = "overview" | "levels";

const TABS: { key: CourseDetailTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "levels", label: "Levels" },
];

export const MY_COURSES_PATH = "/dashboard/student/my-courses";

export function courseDetailPath(courseId: string, tab: CourseDetailTab = "overview"): string {
    const base = `${MY_COURSES_PATH}/${courseId}`;
    return tab === "overview" ? base : `${base}/${tab}`;
}

/** Shared frame for the course detail routes: course lookup, header row and the Overview / Levels switch. */
export default function CourseDetailShell({
    tab,
    children,
}: {
    tab: CourseDetailTab;
    children: (course: Course) => React.ReactNode;
}) {
    const router = useRouter();
    const params = useParams();
    const courseId = params?.course_id as string;
    const course = findCourse(courseId);

    if (!course) {
        return (
            <StudentLayout header={<Typography sx={{ ...TYPE.headingMed20, color: COLORS.white }}>Course</Typography>}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
                        py: 6,
                        borderRadius: "14px",
                        border: "1px solid #1c1c26",
                        bgcolor: "#07070d",
                    }}
                >
                    <MdOutlineSearchOff size={26} color="#4b4b58" />
                    <Typography sx={{ color: "#8a8a9a", fontSize: "0.82rem" }}>This course could not be found.</Typography>
                </Box>
            </StudentLayout>
        );
    }

    const levels = tab === "levels";

    const header = (
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: "12px", sm: levels ? "16px" : "24px" }, minWidth: 0 }}>
            <BackButton label="Back to My Courses" onClick={() => router.push(MY_COURSES_PATH)} />

            {levels && (
                <Typography component="h1" noWrap sx={{ ...TYPE.headingSemibold24, fontSize: { xs: "18px", sm: "24px" }, color: COLORS.white, minWidth: 0 }}>
                    {course.title}
                </Typography>
            )}

            <Box sx={{ display: { xs: levels ? "none" : "flex", sm: "flex" } }}>
                <StatusPill label={courseStatusBadge(course.status).label} size={levels ? "sm" : "md"} />
            </Box>

            <Box sx={{ ml: "auto" }}>
                <PillTabs
                    options={TABS}
                    value={tab}
                    onChange={(next) => router.push(courseDetailPath(course.courseId, next))}
                    ariaLabel="Course sections"
                />
            </Box>
        </Box>
    );

    return <StudentLayout header={header}>{children(course)}</StudentLayout>;
}
