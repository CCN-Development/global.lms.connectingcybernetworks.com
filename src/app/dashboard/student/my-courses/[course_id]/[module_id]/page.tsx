"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Box } from "@mui/material";
import { MdOutlineSearchOff } from "react-icons/md";
import StudentLayout from "@/layouts/StudentLayout";
import { courseDetailPath } from "@/components/courses/course-format";
import { BackButton, NoticePanel, SkeletonBlock } from "@/components/courses/my-courses-ui";
import ModuleScreen from "@/components/courses/module/ModuleScreen";
import { useCourse } from "@/contexts/CourseContext";

function CourseModuleContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const courseParam = params?.course_id as string;
    const moduleId = params?.module_id as string;
    const lessonParam = searchParams?.get("lesson") ?? null;
    const { moduleDetail, getModule } = useCourse();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!courseParam || !moduleId) return;
        getModule(courseParam, moduleId).then((res) => setError(res.success ? null : (res.message ?? "This module could not be found.")));
    }, [courseParam, moduleId, getModule]);

    const courseModule = moduleDetail?.moduleId === moduleId ? moduleDetail : null;
    const levelsPath = courseDetailPath(courseParam, "levels");

    if (!courseModule) {
        return (
            <StudentLayout hideSidebar fullBleed>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <Box>
                        <BackButton label="Back to Levels" onClick={() => router.push(levelsPath)} />
                    </Box>
                    {error ? (
                        <NoticePanel
                            icon={<MdOutlineSearchOff size={26} color="#4b4b58" />}
                            title="This module isn't available"
                            message={error}
                            action={{ label: "Back to Levels", onClick: () => router.push(levelsPath) }}
                        />
                    ) : (
                        <>
                            <SkeletonBlock height={380} radius={24} />
                            <SkeletonBlock height={80} radius={12} />
                            <SkeletonBlock height={320} radius={24} />
                        </>
                    )}
                </Box>
            </StudentLayout>
        );
    }

    return (
        <ModuleScreen
            key={`${courseModule.moduleId}:${lessonParam ?? ""}`}
            courseParam={courseParam}
            module={courseModule}
            initialLessonId={lessonParam}
        />
    );
}

export default function CourseModulePage() {
    return (
        <Suspense fallback={null}>
            <CourseModuleContent />
        </Suspense>
    );
}
