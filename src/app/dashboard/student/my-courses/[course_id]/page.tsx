"use client";

import React, { useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box } from "@mui/material";
import toast from "react-hot-toast";
import CourseDetailShell from "@/components/courses/CourseDetailShell";
import CourseOverviewTab from "@/components/courses/CourseOverviewTab";
import CourseSidePanel from "@/components/courses/CourseSidePanel";
import VideoDialog from "@/components/courses/VideoDialog";
import { MY_GOALS_PATH, courseDetailPath, modulePath, setGoalPath } from "@/components/courses/course-format";
import { useCourse, type CourseOverview } from "@/contexts/CourseContext";

export default function CourseOverviewPage() {
    const router = useRouter();
    const params = useParams();
    const courseParam = params?.course_id as string;
    const { getContinueLearning, getTrailerPlayback, setActiveMission } = useCourse();
    const [starting, setStarting] = useState(false);
    const [activating, setActivating] = useState(false);
    const [trailerOpen, setTrailerOpen] = useState(false);

    const loadTrailer = useCallback(() => getTrailerPlayback(courseParam), [courseParam, getTrailerPlayback]);

    /** Opens the next unfinished lesson (or the level map once everything is done). */
    const start = async (course: CourseOverview) => {
        if (course.status === "Completed") return router.push(courseDetailPath(courseParam, "levels"));
        setStarting(true);
        try {
            const res = await getContinueLearning(course.courseId);
            if (!res.success || !res.data) {
                toast.error(res.message ?? "Couldn't find your next lesson");
                return;
            }
            const next = res.data.next;
            router.push(next ? modulePath(courseParam, next.moduleId, next.lessonId) : courseDetailPath(courseParam, "levels"));
        } finally {
            setStarting(false);
        }
    };

    const makeActive = async (course: CourseOverview, reload: () => Promise<void>) => {
        setActivating(true);
        try {
            const res = await setActiveMission(course.courseId);
            if (!res.success) {
                toast.error(res.message ?? "Failed to change the active mission");
                return;
            }
            toast.success(`${course.shortTitle ?? course.title} is now your active mission`);
            await reload();
        } finally {
            setActivating(false);
        }
    };

    return (
        <CourseDetailShell tab="overview">
            {({ course, reload }) => (
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
                        starting={starting}
                        onStart={() => start(course)}
                        onTrailer={() => setTrailerOpen(true)}
                        onSetActive={course.status === "Unlocked" ? () => makeActive(course, reload) : undefined}
                        activating={activating}
                    />

                    {/* The tab switch above is 8px taller than the back button, so the rail starts 8px lower than the title. */}
                    <Box sx={{ position: { lg: "sticky" }, top: 0, mt: { lg: "8px" }, minWidth: 0 }}>
                        <CourseSidePanel
                            course={course}
                            onSetGoal={() => router.push(setGoalPath(course.courseId))}
                            onViewGoal={() => router.push(MY_GOALS_PATH)}
                        />
                    </Box>

                    <VideoDialog open={trailerOpen} title={`${course.title} — Trailer`} load={loadTrailer} onClose={() => setTrailerOpen(false)} />
                </Box>
            )}
        </CourseDetailShell>
    );
}
