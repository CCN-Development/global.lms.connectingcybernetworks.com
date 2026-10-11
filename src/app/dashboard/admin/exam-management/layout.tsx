"use client";

import React from "react";
import CourseAdminThemeProvider from "@/components/course-admin/theme";

/** Exam management shares the course-admin dark MUI theme + toast host. */
export default function ExamManagementLayout({ children }: { children: React.ReactNode }) {
    return <CourseAdminThemeProvider>{children}</CourseAdminThemeProvider>;
}
