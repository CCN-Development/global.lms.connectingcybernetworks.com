"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box } from "@mui/material";
import { MdOutlineLayers } from "react-icons/md";
import CourseDetailShell from "@/components/courses/CourseDetailShell";
import CourseLevelsTab from "@/components/courses/CourseLevelsTab";
import { modulePath } from "@/components/courses/course-format";
import { NoticePanel, SkeletonBlock } from "@/components/courses/my-courses-ui";
import { useCourse, type CourseOverview } from "@/contexts/CourseContext";

function LevelsContent({ course, courseParam }: { course: CourseOverview; courseParam: string }) {
    const router = useRouter();
    const { courseLevels, getCourseLevels } = useCourse();
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        const res = await getCourseLevels(courseParam);
        setError(res.success ? null : (res.message ?? "Failed to fetch levels"));
    }, [courseParam, getCourseLevels]);

    useEffect(() => {
        load();
    }, [load]);

    const levels = courseLevels?.courseId === course.courseId ? courseLevels.levels : null;

    // "Continue to Level N" links land on #level-N; scroll there once the cards exist.
    useEffect(() => {
        if (!levels?.length || typeof window === "undefined" || !window.location.hash) return;
        const target = document.getElementById(window.location.hash.slice(1));
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [levels]);

    if (!levels) {
        return error ? (
            <NoticePanel title="We couldn't load the levels" message={error} action={{ label: "Try again", onClick: load }} />
        ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {[0, 1, 2].map((i) => (
                    <SkeletonBlock key={i} height={280} radius={24} />
                ))}
            </Box>
        );
    }

    if (!levels.length) {
        return (
            <NoticePanel
                icon={<MdOutlineLayers size={28} color="#4b4b58" />}
                title="Levels are on their way"
                message="Your instructors are still preparing this mission. Check back soon."
            />
        );
    }

    return (
        <CourseLevelsTab
            levels={levels}
            // Single-lesson cards (video / reading / quiz / lab) open their lesson straight away.
            onOpen={(card) => router.push(modulePath(courseParam, card.moduleId, card.lessonId))}
        />
    );
}

export default function CourseLevelsPage() {
    const params = useParams();
    const courseParam = params?.course_id as string;

    return <CourseDetailShell tab="levels">{({ course }) => <LevelsContent course={course} courseParam={courseParam} />}</CourseDetailShell>;
}
