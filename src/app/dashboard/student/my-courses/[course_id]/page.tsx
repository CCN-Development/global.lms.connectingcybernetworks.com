"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import CourseDetailShell, { MY_COURSES_PATH, courseDetailPath } from "@/components/courses/CourseDetailShell";
import CourseOverviewTab from "@/components/courses/CourseOverviewTab";
import CourseSidePanel from "@/components/courses/CourseSidePanel";
import { LEARNER_RANK } from "@/components/courses/course-data";

export default function CourseOverviewPage() {
    const router = useRouter();

    return (
        <CourseDetailShell tab="overview">
            {(course) => (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 374px" },
                        gap: "24px",
                        alignItems: "flex-start",
                    }}
                >
                    <CourseOverviewTab
                        course={course}
                        onStart={() => router.push(courseDetailPath(course.courseId, "levels"))}
                        onTrailer={() => router.push(courseDetailPath(course.courseId, "levels"))}
                    />

                    {/* The tab switch above is 8px taller than the back button, so the rail starts 8px lower than the title. */}
                    <Box sx={{ position: { lg: "sticky" }, top: 0, mt: { lg: "8px" }, minWidth: 0 }}>
                        <CourseSidePanel course={course} rank={LEARNER_RANK} onSetGoal={() => router.push(`${MY_COURSES_PATH}/set-goal`)} />
                    </Box>
                </Box>
            )}
        </CourseDetailShell>
    );
}
