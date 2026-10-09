"use client";

import React from "react";
import CourseDetailShell from "@/components/courses/CourseDetailShell";
import CourseLevelsTab from "@/components/courses/CourseLevelsTab";

export default function CourseLevelsPage() {
    return (
        <CourseDetailShell tab="levels">
            {(course) => <CourseLevelsTab course={course} onOpenLesson={() => { }} />}
        </CourseDetailShell>
    );
}
