"use client";

import React, { useEffect } from "react";
import { Alert, Box, Button, LinearProgress, Stack, Tooltip, Typography } from "@mui/material";
import { MdRefresh } from "react-icons/md";
import { useExam, type AdminExamTree, type CandidateStatus } from "@/contexts/ExamContext";
import { GlassCard, StatTile } from "@/components/course-admin/ui";
import { CANDIDATE_STATUS_LABELS, EVALUATION_LABELS, ExamChip, ROUND_META, RoundIcon, SectionCard, formatCooldown, formatMinutes } from "./exam-ui";
import { ReadinessList, type WorkspaceTab } from "./ExamWorkspace";

const FUNNEL: CandidateStatus[] = ["locked", "ongoing", "re_exam", "blocked", "completed"];

export default function OverviewTab({ exam, onNavigate }: { exam: AdminExamTree; onNavigate: (tab: WorkspaceTab) => void }) {
    const { publishCheck, getExamPublishCheck } = useExam();
    const signature = exam.rounds.map((r) => `${r.roundId}:${r.updatedAt}:${r.sets.map((s) => `${s.setStatus}${s.questionCount}`).join(",")}`).join("|") + exam.updatedAt;

    useEffect(() => {
        getExamPublishCheck(exam.examId);
    }, [exam.examId, signature, getExamPublishCheck]);

    const byStatus = exam.stats.candidatesByStatus;
    const totalCandidates = FUNNEL.reduce((sum, s) => sum + (byStatus[s] ?? 0), 0);
    const pendingReview = exam.rounds.reduce((sum, r) => sum + r.stats.pendingReview, 0);
    const inProgress = exam.rounds.reduce((sum, r) => sum + r.stats.inProgress, 0);
    const awaiting = exam.rounds.reduce((sum, r) => sum + r.stats.studentsAwaitingNewSet, 0);

    return (
        <Stack spacing={2.5}>
            <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)", xl: "repeat(6, 1fr)" } }}>
                <StatTile label="Candidates" value={totalCandidates} />
                <StatTile label="Certified" value={byStatus.completed ?? 0} />
                <StatTile label="Attempts in progress" value={inProgress} />
                <StatTile label="Awaiting evaluation" value={pendingReview} hint={pendingReview ? "Open Evaluations" : undefined} />
                <StatTile label="Waiting for a new set" value={awaiting} hint={awaiting ? "Publish more sets" : "None"} />
                <StatTile label="Rounds" value={exam.rounds.length} hint={`${exam.rounds.filter((r) => r.isMandatory).length} mandatory`} />
            </Box>

            {awaiting > 0 && (
                <Alert
                    severity="warning"
                    action={
                        <Button color="inherit" size="small" onClick={() => onNavigate("rounds")}>
                            Add sets
                        </Button>
                    }
                >
                    {awaiting} student{awaiting > 1 ? "s have" : " has"} attempts left but already saw every published set of a round. They can&apos;t retake until you publish a new set.
                </Alert>
            )}

            <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, alignItems: "start" }}>
                <SectionCard
                    title="Readiness"
                    subtitle={exam.examStatus === "published" ? "Live — students can sit this exam." : "Fix errors before publishing; warnings are advisory."}
                    actions={
                        <Button size="small" startIcon={<MdRefresh />} onClick={() => getExamPublishCheck(exam.examId)}>
                            Re-check
                        </Button>
                    }
                >
                    {publishCheck ? <ReadinessList check={publishCheck} /> : <LinearProgress />}
                </SectionCard>

                <SectionCard
                    title="Candidate funnel"
                    subtitle="Every student who opened the exam (or was managed by an admin)."
                    actions={
                        <Button size="small" onClick={() => onNavigate("candidates")}>
                            Manage candidates
                        </Button>
                    }
                >
                    <Stack spacing={1.25}>
                        {FUNNEL.map((status) => {
                            const count = byStatus[status] ?? 0;
                            return (
                                <Box key={status}>
                                    <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
                                        <ExamChip status={status} label={CANDIDATE_STATUS_LABELS[status]} />
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {count}
                                        </Typography>
                                    </Stack>
                                    <LinearProgress variant="determinate" value={totalCandidates ? (count / totalCandidates) * 100 : 0} sx={{ height: 6, borderRadius: 3 }} />
                                </Box>
                            );
                        })}
                    </Stack>
                </SectionCard>
            </Box>

            <SectionCard
                title="Round pipeline"
                subtitle={exam.roundProgression === "sequential" ? "Students go through the rounds in this order." : "Rounds can be taken in any order."}
                actions={
                    <Button size="small" onClick={() => onNavigate("rounds")}>
                        Edit rounds & sets
                    </Button>
                }
            >
                {!exam.rounds.length ? (
                    <Typography variant="body2" color="text.secondary">
                        No rounds yet — add one in Rounds & sets.
                    </Typography>
                ) : (
                    <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", xl: `repeat(${Math.min(exam.rounds.length, 4)}, 1fr)` } }}>
                        {exam.rounds.map((round, index) => {
                            const drafts = round.sets.filter((s) => s.setStatus === "draft").length;
                            const meta = ROUND_META[round.roundType];
                            return (
                                <GlassCard key={round.roundId} sx={{ p: 1.75, borderColor: `${meta.color}44` }}>
                                    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 1 }}>
                                        <RoundIcon type={round.roundType} />
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Round {index + 1}
                                                {round.isMandatory ? "" : " · optional"}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                                                {round.title}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 1 }}>
                                        {formatMinutes(round.durationSec)} · {round.maxAttempts ?? "∞"} attempts · {formatCooldown(round.retakeCooldownMin)} · pass {round.passingPct}% ·{" "}
                                        {EVALUATION_LABELS[round.evaluationMode].label}
                                    </Typography>
                                    <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }} useFlexGap>
                                        <Tooltip title="Published sets students can be served">
                                            <span>
                                                <ExamChip status={round.stats.publishedSets ? "published" : "exhausted"} label={`${round.stats.publishedSets} published set${round.stats.publishedSets === 1 ? "" : "s"}`} />
                                            </span>
                                        </Tooltip>
                                        {drafts > 0 && <ExamChip status="draft" label={`${drafts} draft`} />}
                                        {round.stats.inProgress > 0 && <ExamChip status="in_progress" label={`${round.stats.inProgress} in progress`} />}
                                        {round.stats.pendingReview > 0 && <ExamChip status="under_review" label={`${round.stats.pendingReview} to review`} />}
                                        {round.stats.studentsAwaitingNewSet > 0 && <ExamChip status="blocked" label={`${round.stats.studentsAwaitingNewSet} need a new set`} />}
                                    </Stack>
                                </GlassCard>
                            );
                        })}
                    </Box>
                )}
            </SectionCard>
        </Stack>
    );
}
