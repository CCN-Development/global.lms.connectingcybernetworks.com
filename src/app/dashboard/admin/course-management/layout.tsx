"use client";

import React from "react";
import CourseAdminThemeProvider from "@/components/course-admin/theme";

/** Every course-management page gets the dark MUI theme + toast host. */
export default function CourseManagementLayout({ children }: { children: React.ReactNode }) {
    return <CourseAdminThemeProvider>{children}</CourseAdminThemeProvider>;
}
