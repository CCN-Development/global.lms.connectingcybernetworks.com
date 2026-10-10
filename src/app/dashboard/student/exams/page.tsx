"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import { MdOutlineAssignment } from "react-icons/md";
import StudentLayout from "@/layouts/StudentLayout";
import CCNTabs from "@/components/CCNTabs";
import ExamCard from "@/components/exams/ExamCard";
import { EXAMS, EXAM_FILTERS, examDetailPath, type ExamFilter } from "@/components/exams/exam-data";
import { COLORS, TYPE } from "@/components/courses/my-courses-theme";

export default function ExamsPage() {
    const router = useRouter();
    const [filter, setFilter] = useState<ExamFilter>("all");

    const exams = useMemo(() => (filter === "all" ? EXAMS : EXAMS.filter((exam) => exam.status === filter)), [filter]);

    return (
        <StudentLayout
            fullBleed
            headerMobileOnly
            header={
                <Typography component="h1" noWrap sx={{ ...TYPE.headingMed20, color: COLORS.white }}>
                    Exam
                </Typography>
            }
        >
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    overflowX: "hidden",
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                    pt: { xs: "8px", md: 0 },
                }}
            >
                <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", height: 48, flexShrink: 0 }}>
                    <Typography component="h1" sx={{ ...TYPE.headingMed20, color: COLORS.white }}>
                        Exam
                    </Typography>
                </Box>

                <Box sx={{ flexShrink: 0, maxWidth: "100%" }}>
                    <CCNTabs
                        size="lg"
                        tabs={EXAM_FILTERS.map(({ value, label }) => ({ value, label }))}
                        value={filter}
                        onChange={(tab) => setFilter(tab.value as ExamFilter)}
                    />
                </Box>

                {exams.length === 0 ? (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            py: 6,
                            borderRadius: "24px",
                            border: "1px solid rgba(255,255,255,0.1)",
                            bgcolor: "rgba(9,9,21,0.44)",
                        }}
                    >
                        <MdOutlineAssignment size={26} color={COLORS.neutral500} />
                        <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral300 }}>No exams in this category yet.</Typography>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
                            gap: "24px",
                        }}
                    >
                        {exams.map((exam) => (
                            <ExamCard key={exam.examId} exam={exam} onOpen={() => router.push(examDetailPath(exam.examId))} />
                        ))}
                    </Box>
                )}
            </Box>
        </StudentLayout>
    );
}
