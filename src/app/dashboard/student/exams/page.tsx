"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import { MdOutlineAssignment, MdOutlineWifiOff } from "react-icons/md";
import StudentLayout from "@/layouts/StudentLayout";
import CCNTabs from "@/components/CCNTabs";
import ExamCard from "@/components/exams/ExamCard";
import DesktopAppDialog, { type DesktopAppPrompt } from "@/components/exams/DesktopAppDialog";
import { EXAM_FILTERS, examDetailPath, type ExamFilter } from "@/components/exams/exam-data";
import { NoticePanel, SkeletonBlock } from "@/components/courses/my-courses-ui";
import { COLORS, TYPE } from "@/components/courses/my-courses-theme";
import { useExam } from "@/contexts/ExamContext";

export default function ExamsPage() {
    const router = useRouter();
    const { studentExams, loadingExams, getStudentExams } = useExam();
    const [filter, setFilter] = useState<ExamFilter>("all");
    const [error, setError] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [prompt, setPrompt] = useState<DesktopAppPrompt | null>(null);

    const load = useCallback(async () => {
        const res = await getStudentExams();
        setError(res.success ? null : (res.message ?? "Failed to load your exams"));
        setLoaded(true);
    }, [getStudentExams]);

    useEffect(() => {
        load();
    }, [load]);

    // Attempts happen in the desktop app — refresh statuses when the student comes back to this tab.
    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === "visible") getStudentExams();
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => document.removeEventListener("visibilitychange", onVisible);
    }, [getStudentExams]);

    const exams = useMemo(() => (filter === "all" ? studentExams : studentExams.filter((exam) => exam.status === filter)), [filter, studentExams]);
    const showSkeleton = !loaded || (loadingExams && !studentExams.length && !error);

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

                {showSkeleton ? (
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: "24px" }}>
                        {[0, 1, 2].map((i) => (
                            <SkeletonBlock key={i} height={320} radius={24} />
                        ))}
                    </Box>
                ) : error && !studentExams.length ? (
                    <NoticePanel
                        icon={<MdOutlineWifiOff size={26} color="#4b4b58" />}
                        title="We couldn't load your exams"
                        message={error}
                        action={{ label: "Try again", onClick: load }}
                    />
                ) : exams.length === 0 ? (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            py: 6,
                            px: 2,
                            textAlign: "center",
                            borderRadius: "24px",
                            border: "1px solid rgba(255,255,255,0.1)",
                            bgcolor: "rgba(9,9,21,0.44)",
                        }}
                    >
                        <MdOutlineAssignment size={26} color={COLORS.neutral500} />
                        <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral300 }}>
                            {studentExams.length ? "No exams in this category yet." : "Certification exams for your courses will appear here."}
                        </Typography>
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
                            <ExamCard
                                key={exam.examId}
                                exam={exam}
                                onOpen={() => router.push(examDetailPath(exam.slug ?? exam.examId))}
                                onStart={() => setPrompt({ examTitle: exam.title, stage: null })}
                            />
                        ))}
                    </Box>
                )}
            </Box>
            <DesktopAppDialog prompt={prompt} onClose={() => setPrompt(null)} />
        </StudentLayout>
    );
}
