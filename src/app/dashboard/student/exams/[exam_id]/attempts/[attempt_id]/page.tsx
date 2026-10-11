"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Box } from "@mui/material";
import ExamDetailShell from "@/components/exams/ExamDetailShell";
import ExamReport from "@/components/exams/ExamReport";
import { examDetailPath } from "@/components/exams/exam-data";
import { NoticePanel, SkeletonBlock } from "@/components/courses/my-courses-ui";
import { useExam } from "@/contexts/ExamContext";

function printReport(fileName: string) {
    const previous = document.title;
    // Browsers use the document title as the default PDF file name.
    document.title = fileName;
    window.print();
    document.title = previous;
}

function AttemptReportView() {
    const router = useRouter();
    const params = useParams<{ exam_id: string; attempt_id: string }>();
    const autoDownload = useSearchParams().get("download") === "1";
    const examKey = params?.exam_id ?? "";
    const attemptId = params?.attempt_id ?? "";
    const { attemptReport, examDetail, getAttemptReport, getStudentExam } = useExam();
    const [error, setError] = useState<string | null>(null);
    const printed = useRef(false);

    useEffect(() => {
        if (!attemptId) return;
        getAttemptReport(attemptId).then((res) => setError(res.success ? null : (res.message ?? "Failed to load the report")));
    }, [attemptId, getAttemptReport]);

    const exam = examDetail && [examDetail.examId, examDetail.courseId, examDetail.slug].includes(examKey) ? examDetail : null;
    useEffect(() => {
        if (!exam && examKey) getStudentExam(examKey);
    }, [exam, examKey, getStudentExam]);

    const report = attemptReport?.attemptId === attemptId ? attemptReport : null;
    const fileName = report ? `${exam?.courseShort ?? "Exam"} - ${report.roundTitle} - Attempt ${report.attemptNumber}` : "Exam result";

    useEffect(() => {
        if (!report || !autoDownload || printed.current || report.attemptStatus !== "evaluated") return;
        printed.current = true;
        // Let fonts and layout settle before opening the print dialog.
        const timer = setTimeout(() => printReport(fileName), 400);
        return () => clearTimeout(timer);
    }, [report, autoDownload, fileName]);

    const back = () => router.push(examDetailPath(examKey));

    return (
        <ExamDetailShell title={exam?.courseName ?? "Exam result"} onBack={back}>
            {report ? (
                <ExamReport report={report} examTitle={exam?.title ?? report.roundTitle} onDownload={() => printReport(fileName)} />
            ) : error ? (
                <NoticePanel title="Report not available" message={error} action={{ label: "Back to exam", onClick: back }} />
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <SkeletonBlock height={220} radius={24} />
                    {[0, 1, 2].map((i) => (
                        <SkeletonBlock key={i} height={160} radius={24} />
                    ))}
                </Box>
            )}
        </ExamDetailShell>
    );
}

export default function AttemptReportPage() {
    return (
        <Suspense fallback={null}>
            <AttemptReportView />
        </Suspense>
    );
}
