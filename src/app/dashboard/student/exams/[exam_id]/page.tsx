"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Box, Typography } from "@mui/material";
import ExamDetailShell from "@/components/exams/ExamDetailShell";
import ExamStageTimeline, { CertifiedHero, type StageHandlers } from "@/components/exams/ExamStageTimeline";
import { EXAMS_PATH, EXAM_STATE_PRESETS, examCertificatePath, findExam, isCertified, isExamStateKey } from "@/components/exams/exam-data";
import { ExamNotice } from "@/components/exams/exam-ui";
import { COLORS, TYPE } from "@/components/courses/my-courses-theme";

function ExamDetail() {
    const router = useRouter();
    const params = useParams();
    const preview = useSearchParams().get("state");
    const exam = findExam(params?.exam_id as string | undefined);
    const [notice, setNotice] = useState<string | null>(null);

    // `?state=` previews any progression snapshot (one per Figma frame) without a backend.
    const stages = useMemo(() => {
        if (!exam) return [];
        return isExamStateKey(preview) ? EXAM_STATE_PRESETS[preview]() : exam.stages;
    }, [exam, preview]);

    const back = () => router.push(EXAMS_PATH);

    if (!exam) {
        return (
            <ExamDetailShell title="Exam" onBack={back}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", py: 8 }}>
                    <Typography sx={{ ...TYPE.headingSemibold20, color: COLORS.white }}>Exam not found</Typography>
                    <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral300 }}>It may have been removed or the link is incorrect.</Typography>
                </Box>
            </ExamDetailShell>
        );
    }

    const viewCertificate = () => router.push(examCertificatePath(exam.examId));

    const handlers: StageHandlers = {
        onStart: (stage) => setNotice(`${stage.title} will open here once your exam window starts.`),
        onDownloadResult: (stage) => setNotice(`Your ${stage.title} result will be available to download soon.`),
        onViewReport: (stage, attempt) => setNotice(`Detailed report for ${stage.title} (attempt ${attempt.attemptNo}) will be available soon.`),
        onViewCertificate: viewCertificate,
    };

    return (
        <ExamDetailShell title={exam.courseName} onBack={back}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                {isCertified(stages) && <CertifiedHero courseShort={exam.courseShort} onViewCertificate={viewCertificate} />}
                <ExamStageTimeline stages={stages} handlers={handlers} />
            </Box>
            <ExamNotice message={notice} onClose={() => setNotice(null)} />
        </ExamDetailShell>
    );
}

export default function ExamDetailPage() {
    return (
        <Suspense fallback={null}>
            <ExamDetail />
        </Suspense>
    );
}
