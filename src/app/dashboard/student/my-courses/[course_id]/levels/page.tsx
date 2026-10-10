"use client";

import React from "react";
import { useRouter } from "next/navigation";
import CourseDetailShell, { modulePath } from "@/components/courses/CourseDetailShell";
import CourseLevelsTab from "@/components/courses/CourseLevelsTab";

export default function CourseLevelsPage() {
    const router = useRouter();

    return (
        <CourseDetailShell tab="levels">
            {(course) => (
                <CourseLevelsTab
                    course={course}
                    onOpenLesson={(lesson) => {
                        if (lesson.kind === "module" && lesson.moduleId) router.push(modulePath(course.courseId, lesson.moduleId));
                    }}
                />
            )}
        </CourseDetailShell>
    );
}
