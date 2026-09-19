"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import { MdArrowBack, MdOutlineSearchOff } from "react-icons/md";
import StudentLayout from "@/layouts/StudentLayout";
import CourseOverviewTab from "@/components/courses/CourseOverviewTab";
import CourseLevelsTab from "@/components/courses/CourseLevelsTab";
import CourseSidePanel from "@/components/courses/CourseSidePanel";
import { LEARNER_RANK, courseStatusBadge, findCourse } from "@/components/courses/course-data";

type Tab = "overview" | "levels";

function TabToggle({ tab, onChange }: { tab: Tab; onChange: (next: Tab) => void }) {
    return (
        <Box
            sx={{
                display: "flex",
                gap: 0.4,
                p: 0.4,
                flexShrink: 0,
                borderRadius: "999px",
                border: "1px solid #2b2b38",
                bgcolor: "#0b0b12",
            }}
        >
            {(["overview", "levels"] as Tab[]).map((key) => (
                <Box
                    key={key}
                    role="button"
                    tabIndex={0}
                    onClick={() => onChange(key)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") onChange(key);
                    }}
                    sx={{
                        px: 1.75,
                        py: 0.5,
                        borderRadius: "999px",
                        cursor: "pointer",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        textTransform: "capitalize",
                        color: tab === key ? "#fff" : "#8a8a9a",
                        bgcolor: tab === key ? "#23233a" : "transparent",
                        transition: "background .18s ease, color .18s ease",
                        "&:hover": { color: "#fff" },
                    }}
                >
                    {key}
                </Box>
            ))}
        </Box>
    );
}

export default function CourseDetailPage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params?.course_id as string;
    const course = findCourse(courseId);
    const [tab, setTab] = useState<Tab>("overview");

    const backToList = () => router.push("/dashboard/student/my-courses");

    if (!course) {
        return (
            <StudentLayout header={<Typography sx={{ color: "#fff", fontSize: "1rem", fontWeight: 700 }}>Course</Typography>}>
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

    const badge = courseStatusBadge(course.status);

    const header = (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
            <Box
                role="button"
                tabIndex={0}
                onClick={backToList}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") backToList();
                }}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 30,
                    height: 30,
                    flexShrink: 0,
                    borderRadius: "50%",
                    cursor: "pointer",
                    border: "1px solid #2b2b38",
                    color: "#b4b4c2",
                    "&:hover": { color: "#fff", borderColor: course.accent },
                }}
            >
                <MdArrowBack size={16} />
            </Box>

            {tab === "levels" && (
                <Typography noWrap sx={{ color: "#fff", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.01em", minWidth: 0 }}>
                    {course.title}
                </Typography>
            )}

            <Box
                component="span"
                sx={{
                    flexShrink: 0,
                    px: 1.1,
                    py: 0.3,
                    borderRadius: "999px",
                    bgcolor: badge.bg,
                    color: badge.fg,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                }}
            >
                {badge.label}
            </Box>

            <Box sx={{ ml: "auto" }}>
                <TabToggle tab={tab} onChange={setTab} />
            </Box>
        </Box>
    );

    return (
        <StudentLayout header={header}>
            {tab === "overview" ? (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 300px" },
                        gap: 1.5,
                        alignItems: "flex-start",
                    }}
                >
                    <CourseOverviewTab course={course} onStart={() => setTab("levels")} onTrailer={() => setTab("levels")} />

                    <Box sx={{ position: { lg: "sticky" }, top: 0, minWidth: 0 }}>
                        <CourseSidePanel course={course} rank={LEARNER_RANK} onSetGoal={() => setTab("levels")} />
                    </Box>
                </Box>
            ) : (
                <CourseLevelsTab course={course} onOpenLesson={() => { }} />
            )}
        </StudentLayout>
    );
}