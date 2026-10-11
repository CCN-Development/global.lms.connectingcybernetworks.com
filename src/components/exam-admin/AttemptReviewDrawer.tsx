"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Drawer,
    FormControlLabel,
    IconButton,
    Link as MuiLink,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { MdBlock, MdCheck, MdClose, MdDoneAll, MdExpandLess, MdExpandMore, MdOutlineAutoAwesome, MdSave, MdSend } from "react-icons/md";
import { CHOICE_QUESTION_TYPES, useExam, type AdminAttemptDetail, type AdminAttemptResponse } from "@/contexts/ExamContext";
import { LoadingState, notify } from "@/components/course-admin/ui";
import {
    AI_STATUS_LABELS,
    EVALUATION_LABELS,
    ExamChip,
    InfoRow,
    QUESTION_TYPE_LABELS,
    RoundIcon,
    SUBMIT_REASON_LABELS,
    formatClock,
    formatDateTime,
    formatMarks,
    formatPct,
    useReasonPrompt,
} from "./exam-ui";

interface MarkDraft {
    marks: string;
    remarks: string;
}

const PATH_LABEL = { auto: "Auto-scored", ai: "AI-evaluated", manual: "Evaluator" } as const;

function draftsFrom(attempt: AdminAttemptDetail): Record<string, MarkDraft> {
    return Object.fromEntries(
        attempt.responses.map((r) => [r.questionId, { marks: r.evaluatorMarks !== null ? String(r.evaluatorMarks) : "", remarks: r.evaluatorRemarks ?? "" }])
    );
}

export default function AttemptReviewDrawer({ attemptId, onClose }: { attemptId: string | null; onClose: () => void }) {
    const { attemptDetail, loadingAttemptDetail, getAdminAttempt, evaluateAttempt, rerunAiEvaluation, forceSubmitAttempt, voidAttempt, saving } = useExam();
    const { ask, dialog: reasonDialog } = useReasonPrompt();
    const [drafts, setDrafts] = useState<Record<string, MarkDraft>>({});
    const [remarks, setRemarks] = useState("");
    const [voiding, setVoiding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (attemptId) getAdminAttempt(attemptId);
    }, [attemptId, getAdminAttempt]);

    const attempt = attemptId && attemptDetail?.attemptId === attemptId ? attemptDetail : null;

    // Re-seed the form whenever a fresh copy of the attempt arrives (after saving / AI finishing).
    useEffect(() => {
        if (!attempt) return;
        setDrafts(draftsFrom(attempt));
        setRemarks(attempt.evaluatorRemarks ?? "");
        setError(null);
    }, [attempt]);

    const editable = attempt?.attemptStatus === "submitted" || attempt?.attemptStatus === "evaluated";
    const changed = useMemo(() => {
        if (!attempt) return [];
        return attempt.responses.filter((r) => {
            const d = drafts[r.questionId];
            if (!d) return false;
            const original = r.evaluatorMarks !== null ? String(r.evaluatorMarks) : "";
            return d.marks.trim() !== original || d.remarks !== (r.evaluatorRemarks ?? "");
        });
    }, [attempt, drafts]);
    const pending = useMemo(
        () => attempt?.responses.filter((r) => r.resolvedMarks === null && !(drafts[r.questionId]?.marks.trim() ?? "")).length ?? 0,
        [attempt, drafts]
    );
    const projected = useMemo(() => {
        if (!attempt) return null;
        let total = 0;
        for (const r of attempt.responses) {
            const draft = drafts[r.questionId]?.marks.trim();
            const value = draft ? Number(draft) : r.resolvedMarks;
            if (value === null || value === undefined || Number.isNaN(value)) return null;
            total += value;
        }
        return attempt.maxMarks ? Math.max(0, Math.min(100, (total / attempt.maxMarks) * 100)) : 0;
    }, [attempt, drafts]);

    const submitMarks = async (finalize: boolean) => {
        if (!attempt) return;
        for (const r of changed) {
            const raw = drafts[r.questionId].marks.trim();
            if (raw && (!Number.isFinite(Number(raw)) || Number(raw) < 0 || Number(raw) > r.maxMarks)) {
                return setError(`Q${r.position}: marks must be between 0 and ${r.maxMarks}`);
            }
        }
        if (finalize && pending) return setError(`${pending} answer${pending > 1 ? "s" : ""} still need marks`);
        setError(null);
        const res = await evaluateAttempt(attempt.attemptId, {
            responses: changed.map((r) => {
                const d = drafts[r.questionId];
                return { questionId: r.questionId, marks: d.marks.trim() ? Number(d.marks) : null, remarks: d.remarks.trim() || null };
            }),
            remarks: remarks.trim() || null,
            finalize,
        });
        notify(res);
    };

    const forceSubmit = async () => {
        if (!attempt) return;
        const reason = await ask({
            title: "Force-submit this attempt?",
            description: "The student's saved answers are submitted now and scored like a normal submission.",
            confirmLabel: "Submit attempt",
        });
        if (reason) notify(await forceSubmitAttempt(attempt.attemptId, reason));
    };

    return (
        <Drawer anchor="right" open={Boolean(attemptId)} onClose={onClose} slotProps={{ paper: { sx: { width: { xs: "100%", md: 900 } } } }}>
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", p: 2.5, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {attempt && <RoundIcon type={attempt.roundType} />}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" noWrap sx={{ fontSize: 18 }}>
                            {attempt ? `${attempt.student.studentName} · ${attempt.round.title}` : "Attempt"}
                        </Typography>
                        {attempt && (
                            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexWrap: "wrap", mt: 0.25 }} useFlexGap>
                                <Typography variant="caption" color="text.secondary">
                                    Attempt #{attempt.attemptNumber} · {attempt.set.code}
                                </Typography>
                                <ExamChip status={attempt.attemptStatus} />
                                {attempt.attemptStatus === "evaluated" && <ExamChip status={attempt.resultStatus} />}
                                {attempt.aiEvaluationStatus !== "not_required" && <ExamChip status={attempt.aiEvaluationStatus} label={AI_STATUS_LABELS[attempt.aiEvaluationStatus]} />}
                                {!attempt.countsTowardsLimit && <ExamChip status="locked" label="Not counted" />}
                            </Stack>
                        )}
                    </Box>
                    <IconButton onClick={onClose} aria-label="Close">
                        <MdClose />
                    </IconButton>
                </Stack>

                <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
                    {loadingAttemptDetail && !attempt ? (
                        <LoadingState label="Loading attempt…" />
                    ) : !attempt ? null : (
                        <Stack spacing={2}>
                            <AttemptSummary attempt={attempt} />

                            {attempt.attemptStatus === "voided" && (
                                <Alert severity="info">
                                    Voided {formatDateTime(attempt.voidedAt)} by {attempt.voidedByRole ?? "admin"}: {attempt.voidReason}
                                    {attempt.countsTowardsLimit ? " (still counts as an attempt)" : " (refunded — not counted)"}
                                </Alert>
                            )}
                            {attempt.aiEvaluationStatus === "failed" && (
                                <Alert severity="warning">AI evaluation failed{attempt.aiEvaluationError ? `: ${attempt.aiEvaluationError}` : ""}. Mark the answers manually or re-run AI.</Alert>
                            )}
                            {attempt.attemptStatus === "evaluated" && (
                                <Alert severity="info">Already evaluated. Changing marks and finalising again re-computes the result (re-evaluation is audited).</Alert>
                            )}

                            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }} useFlexGap>
                                {attempt.attemptStatus === "in_progress" && (
                                    <Button variant="outlined" color="warning" startIcon={<MdSend />} disabled={saving} onClick={forceSubmit}>
                                        Force submit
                                    </Button>
                                )}
                                {attempt.attemptStatus === "submitted" && attempt.responses.some((r) => r.evaluationPath === "ai") && (
                                    <Button
                                        variant="outlined"
                                        startIcon={<MdOutlineAutoAwesome />}
                                        disabled={saving || attempt.aiEvaluationStatus === "processing" || attempt.aiEvaluationStatus === "pending"}
                                        onClick={async () => notify(await rerunAiEvaluation(attempt.attemptId))}
                                    >
                                        {attempt.aiEvaluationStatus === "pending" || attempt.aiEvaluationStatus === "processing" ? "AI running…" : "Re-run AI evaluation"}
                                    </Button>
                                )}
                                <Box sx={{ flex: 1 }} />
                                {attempt.attemptStatus !== "voided" && (
                                    <Button color="error" startIcon={<MdBlock />} disabled={saving} onClick={() => setVoiding(true)}>
                                        Void attempt
                                    </Button>
                                )}
                            </Stack>

                            {attempt.responses.map((response) => (
                                <ResponseCard
                                    key={response.questionId}
                                    response={response}
                                    editable={editable}
                                    draft={drafts[response.questionId] ?? { marks: "", remarks: "" }}
                                    onChange={(draft) => setDrafts((d) => ({ ...d, [response.questionId]: draft }))}
                                />
                            ))}

                            <AuditTrail attempt={attempt} />
                        </Stack>
                    )}
                </Box>

                {attempt && editable && (
                    <Box sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.08)", bgcolor: "rgba(10,11,24,0.98)" }}>
                        <Stack spacing={1.25}>
                            {error && <Alert severity="error">{error}</Alert>}
                            <TextField size="small" label="Overall remarks (visible in the student's report)" value={remarks} onChange={(e) => setRemarks(e.target.value)} multiline maxRows={3} />
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { sm: "center" } }}>
                                <Typography variant="body2" color={pending ? "warning.main" : "text.secondary"} sx={{ flex: 1 }}>
                                    {pending ? `${pending} answer${pending > 1 ? "s" : ""} still need marks` : "Every answer has marks"}
                                    {projected !== null ? ` · projected ${formatPct(projected)} (pass ${attempt.passingPct}%)` : ""}
                                    {changed.length ? ` · ${changed.length} unsaved change${changed.length > 1 ? "s" : ""}` : ""}
                                </Typography>
                                <Button variant="outlined" startIcon={<MdSave />} disabled={saving || (!changed.length && remarks === (attempt.evaluatorRemarks ?? ""))} onClick={() => submitMarks(false)}>
                                    Save marks
                                </Button>
                                <Button variant="contained" startIcon={<MdDoneAll />} disabled={saving || pending > 0} onClick={() => submitMarks(true)}>
                                    {attempt.attemptStatus === "evaluated" ? "Re-evaluate & publish result" : "Finalise & publish result"}
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                )}
            </Box>

            {attempt && (
                <VoidDialog
                    open={voiding}
                    onClose={() => setVoiding(false)}
                    wasPassed={attempt.attemptStatus === "evaluated" && attempt.resultStatus === "passed"}
                    onSubmit={async (reason, refundAttempt) => {
                        const res = await voidAttempt(attempt.attemptId, { reason, refundAttempt });
                        if (notify(res) && res.data?.certificateStillIssued) {
                            toast("The certificate this attempt earned is still issued — revoke it from Certificates if needed.", { icon: "⚠️", duration: 7000 });
                        }
                        return res.success;
                    }}
                />
            )}
            {reasonDialog}
        </Drawer>
    );
}

function AttemptSummary({ attempt }: { attempt: AdminAttemptDetail }) {
    return (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
            <Box sx={{ p: 1.75, borderRadius: "14px", bgcolor: "rgba(255,255,255,0.03)" }}>
                <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 1 }}>
                    <Avatar src={attempt.student.studentPhoto ?? undefined} sx={{ width: 34, height: 34 }}>
                        {attempt.student.studentName[0]}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                            {attempt.student.studentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap component="div">
                            {attempt.student.studentRegistrationNumber ?? attempt.student.email ?? attempt.student.phoneNumber}
                        </Typography>
                    </Box>
                </Stack>
                <InfoRow label="Started" value={`${formatDateTime(attempt.startedAt)}${attempt.startedByRole !== "Student" ? ` (by ${attempt.startedByRole})` : ""}`} />
                <InfoRow label="Deadline" value={formatDateTime(attempt.deadlineAt)} />
                <InfoRow label="Submitted" value={attempt.submittedAt ? `${formatDateTime(attempt.submittedAt)} · ${SUBMIT_REASON_LABELS[attempt.submitReason ?? "student"]}` : "—"} />
                <InfoRow label="Time taken" value={formatClock(attempt.timeTakenSec)} />
                <InfoRow label="Resumed / violations" value={`${attempt.resumeCount} / ${attempt.violationCount}${attempt.maxViolations ? ` of ${attempt.maxViolations}` : ""}`} />
                <InfoRow label="Client" value={[attempt.clientIp, attempt.machineCode].filter(Boolean).join(" · ") || "—"} />
            </Box>
            <Box sx={{ p: 1.75, borderRadius: "14px", bgcolor: "rgba(255,255,255,0.03)" }}>
                <InfoRow label="Score" value={attempt.scorePct !== null ? `${formatPct(attempt.scorePct)} (${formatMarks(attempt.obtainedMarks)} / ${formatMarks(attempt.maxMarks)})` : `— / ${formatMarks(attempt.maxMarks)}`} />
                <InfoRow label="Pass mark" value={`${attempt.passingPct}%`} />
                <InfoRow label="Answered" value={`${attempt.answeredCount} / ${attempt.totalQuestions}`} />
                {attempt.roundType === "mcq" && <InfoRow label="Correct / wrong" value={`${attempt.correctCount} / ${attempt.incorrectCount}`} />}
                <InfoRow label="Evaluation" value={EVALUATION_LABELS[attempt.evaluationMode].label} />
                <InfoRow label="Evaluated" value={attempt.evaluatedAt ? `${formatDateTime(attempt.evaluatedAt)} · ${attempt.evaluatedByRole ?? ""}` : "—"} />
                <InfoRow label="Pending marks" value={attempt.pendingMarks} />
            </Box>
        </Box>
    );
}

function ResponseCard({ response, editable, draft, onChange }: { response: AdminAttemptResponse; editable: boolean; draft: MarkDraft; onChange: (d: MarkDraft) => void }) {
    const [showRef, setShowRef] = useState(false);
    const q = response.question;
    const isChoice = CHOICE_QUESTION_TYPES.includes(q.questionType);
    const answered = Boolean(response.answeredAt);
    const aiSuggested = response.aiScorePct !== null ? Math.round((response.aiScorePct / 100) * response.maxMarks * 100) / 100 : null;
    const optionsById = new Map(q.options.map((o) => [o.optionId, o]));
    const ordered = response.optionOrder.map((id) => optionsById.get(id)).filter((o): o is NonNullable<typeof o> => Boolean(o));
    const capturedFlags = q.flags.filter((f) => response.capturedFlagIds.includes(f.flagId));
    const hint =
        response.evaluatorMarks !== null
            ? "Manual override"
            : response.evaluationPath === "auto"
                ? `Auto: ${formatMarks(response.marksAwarded)}`
                : aiSuggested !== null
                    ? `AI suggests ${formatMarks(aiSuggested)}`
                    : !answered
                        ? "Unanswered → 0"
                        : "Needs your marks";

    return (
        <Box
            sx={{
                p: 1.75,
                borderRadius: "14px",
                border: "1px solid",
                borderColor: response.resolvedMarks === null && !draft.marks.trim() ? "rgba(245,158,11,0.45)" : "rgba(255,255,255,0.08)",
                bgcolor: "rgba(255,255,255,0.02)",
            }}
        >
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexWrap: "wrap", mb: 0.75 }} useFlexGap>
                        <Typography sx={{ fontWeight: 700, color: "text.secondary" }}>Q{response.position}</Typography>
                        <Chip size="small" variant="outlined" label={QUESTION_TYPE_LABELS[q.questionType]} sx={{ height: 22 }} />
                        {q.section && <Chip size="small" label={q.section} sx={{ height: 22 }} />}
                        <Chip size="small" variant="outlined" label={PATH_LABEL[response.evaluationPath]} sx={{ height: 22 }} />
                        <Typography variant="caption" color="text.secondary">
                            max {formatMarks(response.maxMarks)}
                            {response.negativeMarks ? ` / −${formatMarks(response.negativeMarks)}` : ""} · {formatClock(response.timeSpentSec)} spent
                            {response.isMarkedForReview ? " · marked for review" : ""}
                        </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: "pre-wrap" }}>
                        {q.prompt}
                    </Typography>

                    <Box sx={{ mt: 1.25 }}>
                        {isChoice ? (
                            <Stack spacing={0.5}>
                                {ordered.map((o, i) => {
                                    const selected = response.selectedOptionIds.includes(o.optionId);
                                    return (
                                        <Stack
                                            key={o.optionId}
                                            direction="row"
                                            spacing={1}
                                            sx={{
                                                alignItems: "center",
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: "8px",
                                                bgcolor: selected ? (o.isCorrect ? "rgba(34,197,94,0.12)" : "rgba(248,113,113,0.12)") : o.isCorrect ? "rgba(34,197,94,0.05)" : "transparent",
                                            }}
                                        >
                                            <Typography variant="caption" sx={{ width: 18, fontWeight: 700 }}>
                                                {String.fromCharCode(65 + i)}
                                            </Typography>
                                            <Typography variant="body2" sx={{ flex: 1 }}>
                                                {o.optionText}
                                            </Typography>
                                            {selected && <Chip size="small" label="Picked" sx={{ height: 20 }} color={o.isCorrect ? "success" : "error"} />}
                                            {o.isCorrect && <MdCheck color="#22C55E" />}
                                        </Stack>
                                    );
                                })}
                                {!response.selectedOptionIds.length && (
                                    <Typography variant="caption" color="text.secondary">
                                        Not answered
                                    </Typography>
                                )}
                            </Stack>
                        ) : (
                            <Stack spacing={1}>
                                {response.answerText ? (
                                    <Box sx={{ p: 1.25, borderRadius: "10px", bgcolor: "rgba(56,189,248,0.06)", whiteSpace: "pre-wrap" }}>
                                        <Typography variant="body2">{response.answerText}</Typography>
                                    </Box>
                                ) : (
                                    !response.answerAudioUrl &&
                                    !response.attachmentUrls.length &&
                                    !capturedFlags.length && (
                                        <Typography variant="caption" color="text.secondary">
                                            Not answered
                                        </Typography>
                                    )
                                )}
                                {response.answerAudioUrl && <Box component="audio" controls src={response.answerAudioUrl} sx={{ width: "100%" }} />}
                                {response.attachmentUrls.map((url, i) => (
                                    <MuiLink key={url} href={url} target="_blank" rel="noreferrer" variant="body2">
                                        Attachment {i + 1}
                                    </MuiLink>
                                ))}
                                {q.questionType === "lab_task" && q.flags.length > 0 && (
                                    <Typography variant="caption" color="text.secondary">
                                        Flags {capturedFlags.length}/{q.flags.length}
                                        {capturedFlags.length ? `: ${capturedFlags.map((f) => f.label).join(", ")}` : ""} · {response.wrongFlagSubmits} wrong submission
                                        {response.wrongFlagSubmits === 1 ? "" : "s"}
                                    </Typography>
                                )}
                            </Stack>
                        )}
                    </Box>

                    {(response.aiScorePct !== null || response.aiFeedback) && (
                        <Box sx={{ mt: 1.25, p: 1.25, borderRadius: "10px", bgcolor: "rgba(168,85,247,0.08)" }}>
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
                                <MdOutlineAutoAwesome color="#A855F7" />
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                    AI {response.aiScorePct !== null ? `${formatPct(response.aiScorePct)} → ${formatMarks(aiSuggested)} marks` : ""}
                                    {response.aiModel ? ` · ${response.aiModel}` : ""}
                                </Typography>
                            </Stack>
                            {response.aiFeedback && (
                                <Typography variant="caption" component="div" sx={{ whiteSpace: "pre-wrap" }}>
                                    {response.aiFeedback}
                                </Typography>
                            )}
                            {response.aiKeyPointsCovered.length > 0 && (
                                <Typography variant="caption" component="div" color="success.main">
                                    Covered: {response.aiKeyPointsCovered.join(" · ")}
                                </Typography>
                            )}
                            {response.aiKeyPointsMissed.length > 0 && (
                                <Typography variant="caption" component="div" color="warning.main">
                                    Missed: {response.aiKeyPointsMissed.join(" · ")}
                                </Typography>
                            )}
                        </Box>
                    )}

                    {(q.expectedAnswer || q.keyPoints.length > 0 || q.evaluationGuide) && (
                        <>
                            <Button size="small" color="inherit" sx={{ mt: 0.75, px: 0.5 }} startIcon={showRef ? <MdExpandLess /> : <MdExpandMore />} onClick={() => setShowRef((v) => !v)}>
                                Reference answer
                            </Button>
                            <Collapse in={showRef}>
                                <Stack spacing={0.5} sx={{ p: 1.25, borderRadius: "10px", bgcolor: "rgba(255,255,255,0.03)" }}>
                                    {q.expectedAnswer && (
                                        <Typography variant="caption" sx={{ whiteSpace: "pre-wrap" }}>
                                            <b>Expected:</b> {q.expectedAnswer}
                                        </Typography>
                                    )}
                                    {q.keyPoints.length > 0 && (
                                        <Typography variant="caption">
                                            <b>Key points:</b> {q.keyPoints.join(" · ")}
                                        </Typography>
                                    )}
                                    {q.evaluationGuide && (
                                        <Typography variant="caption" sx={{ whiteSpace: "pre-wrap" }}>
                                            <b>Guide:</b> {q.evaluationGuide}
                                        </Typography>
                                    )}
                                </Stack>
                            </Collapse>
                        </>
                    )}
                </Box>

                <Stack spacing={1} sx={{ width: { md: 220 }, flexShrink: 0 }}>
                    <TextField
                        size="small"
                        label={`Marks (0–${formatMarks(response.maxMarks)})`}
                        type="number"
                        value={draft.marks}
                        disabled={!editable}
                        placeholder={response.resolvedMarks !== null ? formatMarks(response.resolvedMarks) : ""}
                        onChange={(e) => onChange({ ...draft, marks: e.target.value })}
                        helperText={hint}
                        slotProps={{ htmlInput: { min: 0, max: response.maxMarks, step: 0.25 } }}
                    />
                    {editable && aiSuggested !== null && !draft.marks.trim() && response.evaluationPath === "ai" && (
                        <Button size="small" onClick={() => onChange({ ...draft, marks: String(aiSuggested) })}>
                            Accept AI marks
                        </Button>
                    )}
                    {editable && draft.marks.trim() && (
                        <Button size="small" color="inherit" onClick={() => onChange({ ...draft, marks: "" })}>
                            Clear override
                        </Button>
                    )}
                    <TextField size="small" label="Remarks" value={draft.remarks} disabled={!editable} multiline maxRows={4} onChange={(e) => onChange({ ...draft, remarks: e.target.value })} />
                    <Typography variant="caption" color="text.secondary">
                        Final: {response.marksAwarded !== null ? formatMarks(response.marksAwarded) : "—"}
                        {response.isCorrect === true ? " · correct" : response.isCorrect === false ? " · wrong" : ""}
                    </Typography>
                </Stack>
            </Stack>
        </Box>
    );
}

function AuditTrail({ attempt }: { attempt: AdminAttemptDetail }) {
    const [open, setOpen] = useState(false);
    if (!attempt.auditLogs.length) return null;
    return (
        <Box>
            <Button size="small" color="inherit" startIcon={open ? <MdExpandLess /> : <MdExpandMore />} onClick={() => setOpen((v) => !v)}>
                Audit trail ({attempt.auditLogs.length})
            </Button>
            <Collapse in={open}>
                <Stack spacing={0.5} sx={{ mt: 1 }}>
                    {attempt.auditLogs.map((log) => (
                        <Stack key={log.logId} direction="row" spacing={1.5} sx={{ px: 1.25, py: 0.75, borderRadius: "8px", bgcolor: "rgba(255,255,255,0.02)" }}>
                            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 150 }}>
                                {formatDateTime(log.createdAt)}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 150 }}>
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
    );
}

function VoidDialog({
    open,
    wasPassed,
    onClose,
    onSubmit,
}: {
    open: boolean;
    wasPassed: boolean;
    onClose: () => void;
    onSubmit: (reason: string, refund: boolean) => Promise<boolean>;
}) {
    const [reason, setReason] = useState("");
    const [refund, setRefund] = useState(true);
    const [busy, setBusy] = useState(false);

    const submit = async () => {
        setBusy(true);
        const ok = await onSubmit(reason.trim(), refund);
        setBusy(false);
        if (ok) {
            setReason("");
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Void this attempt?</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                        For malpractice or a technical failure. The set stays &quot;seen&quot;, so the student gets a different one next time.
                    </Typography>
                    {wasPassed && <Alert severity="warning">This attempt passed the round. The student will need to clear it again; an issued certificate is not revoked automatically.</Alert>}
                    <FormControlLabel
                        control={<Switch checked={refund} onChange={(e) => setRefund(e.target.checked)} />}
                        label={refund ? "Refund — doesn't count as an attempt, no cooldown" : "Counts as a used attempt (cooldown applies)"}
                    />
                    <TextField autoFocus label="Reason (audit log)" multiline minRows={2} value={reason} onChange={(e) => setReason(e.target.value.slice(0, 500))} />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" color="error" disabled={busy || !reason.trim()} onClick={submit}>
                    Void attempt
                </Button>
            </DialogActions>
        </Dialog>
    );
}
