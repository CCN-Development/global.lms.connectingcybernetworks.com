"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    InputAdornment,
    MenuItem,
    Stack,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";
import { MdOutlineRateReview, MdSearch } from "react-icons/md";
import { useExam, type AdminAttemptStatusFilter, type AdminExamTree } from "@/contexts/ExamContext";
import { EmptyState, GlassCard, LoadingState } from "@/components/course-admin/ui";
import { AI_STATUS_LABELS, ExamChip, RoundIcon, SUBMIT_REASON_LABELS, formatClock, formatDateTime, formatPct } from "./exam-ui";
import AttemptReviewDrawer from "./AttemptReviewDrawer";

const QUEUES: { value: AdminAttemptStatusFilter | "all"; label: string; hint: string }[] = [
    { value: "needs_review", label: "Needs review", hint: "Submitted attempts waiting for marks (AI-assisted, manual or AI pending)." },
    { value: "ai_failed", label: "AI failed", hint: "AI couldn't score them — mark manually or re-run AI." },
    { value: "in_progress", label: "In progress", hint: "Students currently sitting a round." },
    { value: "evaluated", label: "Evaluated", hint: "Final results (re-evaluation possible)." },
    { value: "voided", label: "Voided", hint: "Cancelled by an admin." },
    { value: "all", label: "All", hint: "Every attempt of this exam." },
];

export default function EvaluationsTab({ exam }: { exam: AdminExamTree }) {
    const { examAttempts, loadingAttempts, getAdminAttempts } = useExam();
    const [queue, setQueue] = useState<AdminAttemptStatusFilter | "all">("needs_review");
    const [roundId, setRoundId] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [reviewId, setReviewId] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            getAdminAttempts({
                examId: exam.examId,
                roundId: roundId || undefined,
                status: queue === "all" ? undefined : queue,
                search: search.trim() || undefined,
                page: page + 1,
                pageSize,
            });
        }, 250);
        return () => clearTimeout(timer);
    }, [exam.examId, queue, roundId, search, page, pageSize, getAdminAttempts]);

    const rows = examAttempts?.items.filter((a) => a.examId === exam.examId) ?? [];
    const queueMeta = QUEUES.find((q) => q.value === queue)!;

    return (
        <Box>
            <Tabs
                value={queue}
                onChange={(_, v) => {
                    setQueue(v);
                    setPage(0);
                }}
                variant="scrollable"
                sx={{ mb: 1.5 }}
            >
                {QUEUES.map((q) => (
                    <Tab key={q.value} value={q.value} label={q.label} />
                ))}
            </Tabs>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                {queueMeta.hint}
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
                <TextField
                    size="small"
                    placeholder="Search student"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(0);
                    }}
                    sx={{ flex: 1, maxWidth: { sm: 360 } }}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><MdSearch /></InputAdornment> } }}
                />
                <TextField
                    select
                    size="small"
                    value={roundId}
                    onChange={(e) => {
                        setRoundId(e.target.value);
                        setPage(0);
                    }}
                    sx={{ minWidth: 220 }}
                    slotProps={{ select: { displayEmpty: true } }}
                >
                    <MenuItem value="">All rounds</MenuItem>
                    {exam.rounds.map((r) => (
                        <MenuItem key={r.roundId} value={r.roundId}>
                            {r.title}
                        </MenuItem>
                    ))}
                </TextField>
            </Stack>

            {loadingAttempts && !examAttempts ? (
                <LoadingState label="Loading attempts…" />
            ) : !rows.length ? (
                <EmptyState icon={<MdOutlineRateReview />} title={queue === "needs_review" ? "Nothing to review" : "No attempts here"} description={queue === "needs_review" ? "All submitted attempts are evaluated." : undefined} />
            ) : (
                <GlassCard>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student</TableCell>
                                    <TableCell>Round</TableCell>
                                    <TableCell>Set · #</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Submitted</TableCell>
                                    <TableCell align="right">Time</TableCell>
                                    <TableCell align="right">Score</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((a) => (
                                    <TableRow key={a.attemptId} hover sx={{ cursor: "pointer" }} onClick={() => setReviewId(a.attemptId)}>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {a.student.studentName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {a.student.studentRegistrationNumber ?? ""}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                                <RoundIcon type={a.round.roundType} size={14} />
                                                <Typography variant="body2">{a.round.title}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            {a.set.code} · {a.attemptNumber}
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }} useFlexGap>
                                                <ExamChip status={a.attemptStatus} />
                                                {a.attemptStatus === "evaluated" && <ExamChip status={a.resultStatus} />}
                                                {a.attemptStatus === "submitted" && a.aiEvaluationStatus !== "not_required" && (
                                                    <ExamChip status={a.aiEvaluationStatus} label={AI_STATUS_LABELS[a.aiEvaluationStatus]} />
                                                )}
                                                {a.violationCount > 0 && <ExamChip status="blocked" label={`${a.violationCount} violation${a.violationCount > 1 ? "s" : ""}`} />}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{formatDateTime(a.submittedAt ?? a.startedAt)}</Typography>
                                            {a.submitReason && a.submitReason !== "student" && (
                                                <Typography variant="caption" color="warning.main">
                                                    {SUBMIT_REASON_LABELS[a.submitReason]}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="right">{formatClock(a.timeTakenSec)}</TableCell>
                                        <TableCell align="right">{formatPct(a.scorePct)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={examAttempts?.total ?? 0}
                        page={page}
                        rowsPerPage={pageSize}
                        rowsPerPageOptions={[10, 25, 50, 100]}
                        onPageChange={(_, p) => setPage(p)}
                        onRowsPerPageChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPage(0);
                        }}
                    />
                </GlassCard>
            )}

            <AttemptReviewDrawer attemptId={reviewId} onClose={() => setReviewId(null)} />
        </Box>
    );
}
