"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import ExamDetailShell from "@/components/exams/ExamDetailShell";
import ExamStageTimeline, { CertifiedHero, type StageHandlers } from "@/components/exams/ExamStageTimeline";
import DesktopAppDialog, { type DesktopAppPrompt } from "@/components/exams/DesktopAppDialog";
import { EXAMS_PATH, examCertificatePath, examReportPath, isCertified, isRoundStage, passedAttempt } from "@/components/exams/exam-data";
import { ExamNotice } from "@/components/exams/exam-ui";
import { NoticePanel, SkeletonBlock } from "@/components/courses/my-courses-ui";
import { COLORS, TYPE } from "@/components/courses/my-courses-theme";
import { useExam } from "@/contexts/ExamContext";

/** While an attempt is running in the desktop app or being evaluated, re-check every minute. */
const LIVE_REFRESH_MS = 60_000;

export default function ExamDetailPage() {
    const router = useRouter();
    const params = useParams<{ exam_id: string }>();
    const examKey = params?.exam_id ?? "";
    const { examDetail, getStudentExam } = useExam();
    const [error, setError] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<DesktopAppPrompt | null>(null);

    const load = useCallback(async () => {
        if (!examKey) return;
        const res = await getStudentExam(examKey);
        setError(res.success ? null : (res.message ?? "Failed to load the exam"));
        setLoaded(true);
    }, [examKey, getStudentExam]);

    useEffect(() => {
        load();
    }, [load]);

    const exam = examDetail && [examDetail.examId, examDetail.courseId, examDetail.slug].includes(examKey) ? examDetail : null;
    const live = Boolean(exam?.stages.some((s) => isRoundStage(s) && (s.action === "resume" || s.action === "under-review")));

    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === "visible") getStudentExam(examKey);
        };
        document.addEventListener("visibilitychange", onVisible);
        const timer = live ? setInterval(() => getStudentExam(examKey), LIVE_REFRESH_MS) : null;
        return () => {
            document.removeEventListener("visibilitychange", onVisible);
            if (timer) clearInterval(timer);
        };
    }, [examKey, live, getStudentExam]);

    const back = () => router.push(EXAMS_PATH);

    if (!exam) {
        return (
            <ExamDetailShell title="Exam" onBack={back}>
                {!loaded || !error ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                        {[0, 1, 2, 3].map((i) => (
                            <SkeletonBlock key={i} height={i === 0 ? 220 : 96} radius={24} />
                        ))}
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", py: 8 }}>
                        <Typography sx={{ ...TYPE.headingSemibold20, color: COLORS.white }}>Exam not available</Typography>
                        <NoticePanel title={error} message="It may not be published yet, or the link is incorrect." action={{ label: "Back to exams", onClick: back }} />
                    </Box>
                )}
            </ExamDetailShell>
        );
    }

    const routeKey = exam.slug ?? exam.examId;
    const viewCertificate = () => router.push(examCertificatePath(routeKey));

    const handlers: StageHandlers = {
        onStart: (stage) => setPrompt({ examTitle: exam.title, stage }),
        onDownloadResult: (stage) => {
            const attempt = passedAttempt(stage);
            if (attempt) router.push(`${examReportPath(routeKey, attempt.attemptId)}?download=1`);
            else setNotice("Your result report isn't available yet.");
        },
        onViewReport: (_stage, attempt) => router.push(examReportPath(routeKey, attempt.attemptId)),
        onViewCertificate: viewCertificate,
    };

    return (
        <ExamDetailShell title={exam.courseName} onBack={back}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                {isCertified(exam.stages) && <CertifiedHero courseShort={exam.courseShort} onViewCertificate={viewCertificate} />}
                {!exam.unlock.unlocked && exam.status === "locked" && (
                    <NoticePanel
                        title="This exam is locked"
                        message={`${exam.unlock.reason ?? "It opens once you're eligible."}${exam.unlock.courseProgressPct ? ` · Course progress ${exam.unlock.courseProgressPct}%` : ""}`}
                    />
                )}
                <ExamStageTimeline stages={exam.stages} handlers={handlers} />
            </Box>
            <DesktopAppDialog prompt={prompt} onClose={() => setPrompt(null)} />
            <ExamNotice message={notice} onClose={() => setNotice(null)} />
        </ExamDetailShell>
    );
}
