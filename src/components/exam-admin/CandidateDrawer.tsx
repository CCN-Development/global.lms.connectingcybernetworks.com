"use client";

import React, { useEffect, useState } from "react";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Drawer,
    FormControlLabel,
    IconButton,
    LinearProgress,
    MenuItem,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { MdAddCircleOutline, MdClose, MdExpandLess, MdExpandMore, MdLockOpen, MdPlayArrow, MdTimerOff } from "react-icons/md";
import { useExam, type AdminExamTree, type ExamRoundRecord, type ExamRoundState, type UnlockOverride } from "@/contexts/ExamContext";
import { LoadingState, notify, useConfirm } from "@/components/course-admin/ui";
import {
    CANDIDATE_STATUS_LABELS,
    ExamChip,
    InfoRow,
    ROUND_STATUS_LABELS,
    RoundIcon,
    SectionCard,
    formatDateTime,
    formatPct,
    isFuture,
    useNow,
    useReasonPrompt,
} from "./exam-ui";
import AttemptReviewDrawer from "./AttemptReviewDrawer";

type OverrideChoice = "rule" | UnlockOverride;

export default function CandidateDrawer({ exam, studentId, onClose }: { exam: AdminExamTree; studentId: string | null; onClose: () => void }) {
    const {
        candidateDetail,
        loadingCandidate,
        getExamCandidate,
        setCandidateUnlock,
        grantExtraAttempts,
        waiveCooldown,
        startAttemptForStudent,
        revokeCertificate,
        reinstateCertificate,
        saving,
    } = useExam();
    const { ask, dialog: reasonDialog } = useReasonPrompt();
    const { confirm, dialog: confirmDialog } = useConfirm();
    const now = useNow();
    const [granting, setGranting] = useState<ExamRoundRecord | null>(null);
    const [reviewAttemptId, setReviewAttemptId] = useState<string | null>(null);
    const [showLog, setShowLog] = useState(false);

    useEffect(() => {
        if (studentId) getExamCandidate(exam.examId, studentId);
    }, [exam.examId, studentId, getExamCandidate]);

    const detail = studentId && candidateDetail?.candidate.studentId === studentId && candidateDetail.candidate.examId === exam.examId ? candidateDetail : null;
    const currentOverride: OverrideChoice = detail?.candidate.unlockOverride ?? "rule";

    const changeOverride = async (choice: OverrideChoice) => {
        if (!detail || choice === currentOverride) return;
        const reason = await ask({
            title: choice === "unlocked" ? "Unlock the exam for this student?" : choice === "locked" ? "Lock the exam for this student?" : "Follow the exam's unlock rule again?",
            description:
                choice === "locked"
                    ? "They can't start new attempts. Results and certificates stay visible."
                    : choice === "unlocked"
                        ? "They can start the exam regardless of course progress."
                        : "Their access is decided by the unlock rule (once unlocked, it stays unlocked).",
            confirmLabel: "Apply",
            danger: choice === "locked",
        });
        if (reason) notify(await setCandidateUnlock(exam.examId, detail.candidate.studentId, { override: choice === "rule" ? null : choice, reason }));
    };

    const waive = async (round: ExamRoundRecord) => {
        if (!detail) return;
        const reason = await ask({ title: `Waive the ${round.title} cooldown?`, description: "The student can retake immediately (if attempts and unseen sets remain).", confirmLabel: "Waive cooldown" });
        if (reason) notify(await waiveCooldown(exam.examId, detail.candidate.studentId, round.roundId, reason));
    };

    const start = async (round: ExamRoundRecord, state: ExamRoundState) => {
        if (!detail) return;
        const resuming = Boolean(state.inProgressAttemptId);
        const ok = await confirm({
            title: resuming ? `Resume ${round.title}?` : `Start ${round.title} for ${detail.student.studentName}?`,
            description: resuming
                ? "Opens the attempt that is already in progress."
                : "A random set the student has never seen is assigned now and the timer starts. Use this for in-centre / offline rounds conducted by an evaluator.",
            confirmLabel: resuming ? "Open attempt" : "Start attempt",
        });
        if (!ok) return;
        const res = await startAttemptForStudent(exam.examId, detail.candidate.studentId, round.roundId);
        if (notify(res) && res.data) setReviewAttemptId(res.data.attemptId);
    };

    const certificateAction = async () => {
        const cert = detail?.certificate;
        if (!cert) return;
        const revoke = cert.certificateStatus === "issued";
        const reason = await ask({
            title: revoke ? `Revoke ${cert.certificateNo}?` : `Reinstate ${cert.certificateNo}?`,
            description: revoke ? "Public verification will show it as revoked." : "It verifies as valid again.",
            confirmLabel: revoke ? "Revoke" : "Reinstate",
            danger: revoke,
        });
        if (reason) notify(revoke ? await revokeCertificate(cert.certificateId, reason) : await reinstateCertificate(cert.certificateId, reason));
    };

    return (
        <Drawer anchor="right" open={Boolean(studentId)} onClose={onClose} slotProps={{ paper: { sx: { width: { xs: "100%", md: 820 } } } }}>
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", p: 2.5, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <Avatar src={detail?.student.studentPhoto ?? undefined}>{detail?.student.studentName[0]}</Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                            <Typography variant="h6" noWrap sx={{ fontSize: 18 }}>
                                {detail?.student.studentName ?? "Candidate"}
                            </Typography>
                            {detail && <ExamChip status={detail.candidate.candidateStatus} label={CANDIDATE_STATUS_LABELS[detail.candidate.candidateStatus]} />}
                        </Stack>
                        {detail && (
                            <Typography variant="caption" color="text.secondary" noWrap component="div">
                                {[detail.student.studentRegistrationNumber, detail.student.email, detail.student.phoneNumber].filter(Boolean).join(" · ")}
                            </Typography>
                        )}
                    </Box>
                    <IconButton onClick={onClose} aria-label="Close">
                        <MdClose />
                    </IconButton>
                </Stack>

                <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
                    {loadingCandidate && !detail ? (
                        <LoadingState label="Loading candidate…" />
                    ) : !detail ? null : (
                        <Stack spacing={2}>
                            {(!detail.student.isActive || detail.student.isDropped) && (
                                <Alert severity="warning">This student account is {detail.student.isDropped ? "dropped" : "inactive"} — they can&apos;t start attempts.</Alert>
                            )}

                            <SectionCard title="Access" subtitle={detail.unlock.unlocked ? "The exam is open for this student." : (detail.unlock.reason ?? "Locked")}>
                                <Stack spacing={1.5}>
                                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                                            Course progress
                                        </Typography>
                                        <LinearProgress variant="determinate" value={detail.unlock.courseProgressPct} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                                        <Typography variant="body2">{detail.unlock.courseProgressPct}%</Typography>
                                        {detail.unlock.courseCompleted && <ExamChip status="completed" label="Course completed" />}
                                    </Stack>
                                    <TextField select size="small" label="Unlock" value={currentOverride} disabled={saving} onChange={(e) => changeOverride(e.target.value as OverrideChoice)} sx={{ maxWidth: 360 }}>
                                        <MenuItem value="rule">Follow the exam&apos;s unlock rule</MenuItem>
                                        <MenuItem value="unlocked">Force unlocked</MenuItem>
                                        <MenuItem value="locked">Force locked</MenuItem>
                                    </TextField>
                                    <Typography variant="caption" color="text.secondary">
                                        Unlocked {formatDateTime(detail.candidate.unlockedAt)} · first attempt {formatDateTime(detail.candidate.startedAt)} · certified {formatDateTime(detail.candidate.completedAt)}
                                    </Typography>
                                </Stack>
                            </SectionCard>

                            <SectionCard title="Rounds" subtitle="State is recomputed from the attempts on every change.">
                                <Stack spacing={1.25}>
                                    {detail.rounds.map(({ round, state }) => {
                                        const coolingDown = isFuture(state.cooldownUntil, now);
                                        const canStart = ["eligible", "failed", "in_progress"].includes(state.roundStatus) && !coolingDown && exam.examStatus === "published";
                                        return (
                                            <Box key={round.roundId} sx={{ p: 1.5, borderRadius: "12px", bgcolor: "rgba(255,255,255,0.03)" }}>
                                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ alignItems: { sm: "center" } }}>
                                                    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", flex: 1, minWidth: 0 }}>
                                                        <RoundIcon type={round.roundType} size={16} />
                                                        <Box sx={{ minWidth: 0 }}>
                                                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                                                <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                                                                    {round.title}
                                                                </Typography>
                                                                <ExamChip status={state.roundStatus} label={ROUND_STATUS_LABELS[state.roundStatus]} />
                                                            </Stack>
                                                            <Typography variant="caption" color="text.secondary" component="div">
                                                                {state.attemptsUsed} / {state.attemptsAllowed ?? "∞"} attempts
                                                                {state.extraAttempts ? ` (incl. +${state.extraAttempts} granted)` : ""} · best {formatPct(state.bestScorePct)}
                                                                {coolingDown ? ` · cooldown until ${formatDateTime(state.cooldownUntil)}` : ""}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                    <Stack direction="row" spacing={0.5}>
                                                        <Tooltip title="Grant extra attempts">
                                                            <span>
                                                                <IconButton size="small" disabled={saving || state.roundStatus === "passed"} onClick={() => setGranting(round)}>
                                                                    <MdAddCircleOutline />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                        <Tooltip title="Waive cooldown">
                                                            <span>
                                                                <IconButton size="small" disabled={saving || !coolingDown} onClick={() => waive(round)}>
                                                                    <MdTimerOff />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                        <Tooltip title={state.inProgressAttemptId ? "Open the attempt in progress" : round.selfStart ? "Start on the student's behalf" : "Start the in-centre attempt"}>
                                                            <span>
                                                                <IconButton size="small" color="primary" disabled={saving || !canStart} onClick={() => start(round, state)}>
                                                                    <MdPlayArrow />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </Stack>
                                                </Stack>
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            </SectionCard>

                            <SectionCard title={`Attempts (${detail.attempts.length})`}>
                                {!detail.attempts.length ? (
                                    <Typography variant="body2" color="text.secondary">
                                        No attempts yet.
                                    </Typography>
                                ) : (
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Round</TableCell>
                                                    <TableCell>#</TableCell>
                                                    <TableCell>Set</TableCell>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell align="right">Score</TableCell>
                                                    <TableCell>Started</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {detail.attempts.map((a) => (
                                                    <TableRow key={a.attemptId} hover sx={{ cursor: "pointer", opacity: a.attemptStatus === "voided" ? 0.55 : 1 }} onClick={() => setReviewAttemptId(a.attemptId)}>
                                                        <TableCell>{detail.rounds.find((r) => r.round.roundId === a.roundId)?.round.title ?? a.roundType}</TableCell>
                                                        <TableCell>{a.attemptNumber}</TableCell>
                                                        <TableCell>{a.set.code}</TableCell>
                                                        <TableCell>
                                                            <Stack direction="row" spacing={0.5}>
                                                                <ExamChip status={a.attemptStatus} />
                                                                {a.attemptStatus === "evaluated" && <ExamChip status={a.resultStatus} />}
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell align="right">{formatPct(a.scorePct)}</TableCell>
                                                        <TableCell>{formatDateTime(a.startedAt)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </SectionCard>

                            <SectionCard
                                title="Certificate"
                                actions={
                                    detail.certificate && (
                                        <Button size="small" color={detail.certificate.certificateStatus === "issued" ? "error" : "primary"} disabled={saving} onClick={certificateAction}>
                                            {detail.certificate.certificateStatus === "issued" ? "Revoke" : "Reinstate"}
                                        </Button>
                                    )
                                }
                            >
                                {detail.certificate ? (
                                    <>
                                        <InfoRow label="Certificate ID" value={detail.certificate.certificateNo} />
                                        <InfoRow label="Status" value={<ExamChip status={detail.certificate.certificateStatus} />} />
                                        <InfoRow label="Issued" value={formatDateTime(detail.certificate.issuedAt)} />
                                        <InfoRow label="Valid until" value={detail.certificate.validUntil ? formatDateTime(detail.certificate.validUntil) : "Lifetime"} />
                                        {detail.certificate.revokedReason && <InfoRow label="Revoked because" value={detail.certificate.revokedReason} />}
                                    </>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        Issued automatically when every required round is cleared.
                                    </Typography>
                                )}
                            </SectionCard>

                            <Box>
                                <Button size="small" color="inherit" startIcon={showLog ? <MdExpandLess /> : <MdExpandMore />} onClick={() => setShowLog((v) => !v)}>
                                    Audit log ({detail.auditLog.length})
                                </Button>
                                <Collapse in={showLog}>
                                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                                        {detail.auditLog.map((log) => (
                                            <Stack key={log.logId} direction="row" spacing={1.5} sx={{ px: 1.25, py: 0.75, borderRadius: "8px", bgcolor: "rgba(255,255,255,0.02)" }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 150 }}>
                                                    {formatDateTime(log.createdAt)}
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 140 }}>
                                                    {log.eventType.replace(/_/g, " ")}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ flex: 1, wordBreak: "break-word" }}>
                                                    {log.actorRole}
                                                    {log.detail ? ` · ${JSON.stringify(log.detail)}` : ""}
                                                </Typography>
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Collapse>
                            </Box>
                        </Stack>
                    )}
                </Box>
            </Box>

            {detail && granting && (
                <GrantAttemptsDialog
                    round={granting}
                    onClose={() => setGranting(null)}
                    onSubmit={async (input) => notify(await grantExtraAttempts(exam.examId, detail.candidate.studentId, granting.roundId, input))}
                />
            )}
            <AttemptReviewDrawer attemptId={reviewAttemptId} onClose={() => setReviewAttemptId(null)} />
            {reasonDialog}
            {confirmDialog}
        </Drawer>
    );
}

function GrantAttemptsDialog({
    round,
    onClose,
    onSubmit,
}: {
    round: ExamRoundRecord;
    onClose: () => void;
    onSubmit: (input: { extraAttempts: number; waiveCooldown: boolean; reason: string }) => Promise<boolean>;
}) {
    const [count, setCount] = useState("1");
    const [waiveCooldown, setWaiveCooldown] = useState(true);
    const [reason, setReason] = useState("");
    const [busy, setBusy] = useState(false);
    const n = Number(count);
    const valid = Number.isInteger(n) && n >= 1 && n <= 50 && reason.trim().length > 0;

    return (
        <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <MdLockOpen />
                    <span>Grant attempts · {round.title}</span>
                </Stack>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                        Added on top of the round limit ({round.maxAttempts ?? "unlimited"}). The student still gets a set they haven&apos;t seen — make sure enough sets are published.
                    </Typography>
                    <TextField label="Extra attempts" type="number" value={count} onChange={(e) => setCount(e.target.value)} slotProps={{ htmlInput: { min: 1, max: 50 } }} />
                    <FormControlLabel control={<Switch checked={waiveCooldown} onChange={(e) => setWaiveCooldown(e.target.checked)} />} label="Also waive the current cooldown" />
                    <TextField label="Reason (audit log)" multiline minRows={2} value={reason} onChange={(e) => setReason(e.target.value.slice(0, 500))} />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    disabled={!valid || busy}
                    onClick={async () => {
                        setBusy(true);
                        const ok = await onSubmit({ extraAttempts: n, waiveCooldown, reason: reason.trim() });
                        setBusy(false);
                        if (ok) onClose();
                    }}
                >
                    Grant
                </Button>
            </DialogActions>
        </Dialog>
    );
}
