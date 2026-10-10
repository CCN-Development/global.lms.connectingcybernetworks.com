"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import { MdOutlineSearchOff } from "react-icons/md";
import StudentLayout from "@/layouts/StudentLayout";
import { MY_COURSES_PATH } from "@/components/courses/CourseDetailShell";
import { findCourse } from "@/components/courses/course-data";
import { BackButton } from "@/components/courses/my-courses-ui";
import ModuleScreen from "@/components/courses/module/ModuleScreen";
import { findModule } from "@/components/courses/module/module-data";

export default function CourseModulePage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params?.course_id as string;
    const moduleId = params?.module_id as string;
    const course = findCourse(courseId);
    const courseModule = findModule(moduleId);

    if (!course || !courseModule) {
        return (
            <StudentLayout hideSidebar fullBleed>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <Box>
                        <BackButton label="Back to My Courses" onClick={() => router.push(MY_COURSES_PATH)} />
                    </Box>
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
                        <Typography sx={{ color: "#8a8a9a", fontSize: "0.82rem" }}>This module could not be found.</Typography>
                    </Box>
                </Box>
            </StudentLayout>
        );
    }

    return <ModuleScreen key={courseModule.moduleId} course={course} module={courseModule} />;
}