"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { MdOutlineChecklist, MdOutlineRecordVoiceOver, MdOutlineScience, MdOutlineSupportAgent } from "react-icons/md";
import type {
    AiEvaluationStatus,
    CandidateStatus,
    DeliveryMode,
    ExamEvaluationMode,
    ExamQuestionType,
    ExamRevealMode,
    ExamRoundType,
    ExamUnlockRule,
    MsqScoring,
    ProctoringMode,
    RoundStatus,
    SubmitReason,
} from "@/contexts/ExamContext";
import { GlassCard } from "@/components/course-admin/ui";

export const EXAM_ADMIN_BASE = "/dashboard/admin/exam-management";
export const examWorkspacePath = (courseId: string) => `${EXAM_ADMIN_BASE}/${courseId}`;

/* ───────────────────────────── labels ───────────────────────────── */

export const ROUND_META: Record<ExamRoundType, { label: string; short: string; color: string; icon: React.ReactNode; description: string }> = {
    viva: {
        label: "Technical Viva",
        short: "Viva",
        color: "#A855F7",
        icon: <MdOutlineRecordVoiceOver />,
        description: "Spoken / written answers judged against an expected answer (AI or trainer).",
    },
    mcq: {
        label: "MCQ Exam",
        short: "MCQ",
        color: "#38BDF8",
        icon: <MdOutlineChecklist />,
        description: "Single, multiple-choice (MSQ) and true / false questions, auto-scored.",
    },
    lab: {
        label: "Practical Lab",
        short: "Lab",
        color: "#F472B6",
        icon: <MdOutlineScience />,
        description: "Hands-on lab tasks verified by flags, AI or an evaluator.",
    },
    hr: {
        label: "HR Round",
        short: "HR",
        color: "#F59E0B",
        icon: <MdOutlineSupportAgent />,
        description: "Communication & readiness questions judged by AI or HR.",
    },
};

export const QUESTION_TYPE_LABELS: Record<ExamQuestionType, string> = {
    single_choice: "Single choice",
    multiple_choice: "Multiple choice (MSQ)",
    true_false: "True / False",
    viva: "Viva question",
    hr: "HR question",
    lab_task: "Lab task",
};

export const EVALUATION_LABELS: Record<ExamEvaluationMode, { label: string; hint: string }> = {
    auto: { label: "Automatic", hint: "Choice questions and flag-verified labs are scored instantly." },
    ai: { label: "AI (final)", hint: "AI scores every answer and the result is published automatically." },
    ai_assisted: { label: "AI-assisted", hint: "AI suggests marks; an evaluator reviews and finalises." },
    manual: { label: "Manual", hint: "An evaluator marks every answered question." },
};

export const REVEAL_LABELS: Record<ExamRevealMode, { label: string; hint: string }> = {
    score_only: { label: "Score & feedback only", hint: "Recommended — sets are shared, so the answer key never leaves the server." },
    after_evaluation: { label: "Show answer key", hint: "Correct options / expected answers appear in the report after evaluation." },
    never: { label: "Pass / fail only", hint: "Students only learn whether they cleared the round." },
};

export const UNLOCK_LABELS: Record<ExamUnlockRule, { label: string; hint: string }> = {
    course_completed: { label: "When the course is completed", hint: "Every mandatory lesson finished." },
    progress_pct: { label: "At a course progress %", hint: "Opens once the student reaches the percentage." },
    always: { label: "Always open", hint: "Any student with course access can start." },
    manual: { label: "Manually per student", hint: "Coordinators unlock each candidate." },
};

export const PROCTORING_LABELS: Record<ProctoringMode, string> = { none: "None", basic: "Basic (count violations)", strict: "Strict (exam portal)" };
export const DELIVERY_LABELS: Record<DeliveryMode, string> = { online: "Online", offline: "Offline (in-centre)" };
export const MSQ_LABELS: Record<MsqScoring, string> = { all_or_nothing: "All or nothing", partial: "Partial marks" };

export const CANDIDATE_STATUS_LABELS: Record<CandidateStatus, string> = {
    locked: "Locked",
    ongoing: "Ongoing",
    re_exam: "Re-exam",
    blocked: "Blocked (no attempts)",
    completed: "Certified",
};

export const ROUND_STATUS_LABELS: Record<RoundStatus, string> = {
    locked: "Locked",
    eligible: "Eligible",
    in_progress: "In progress",
    under_review: "Under review",
    failed: "Not cleared",
    exhausted: "Attempts exhausted",
    passed: "Cleared",
};

export const SUBMIT_REASON_LABELS: Record<SubmitReason, string> = {
    student: "Submitted by student",
    timeout: "Time ran out",
    violations: "Too many violations",
    admin: "Submitted by admin",
};

export const AI_STATUS_LABELS: Record<AiEvaluationStatus, string> = {
    not_required: "No AI",
    pending: "AI queued",
    processing: "AI running",
    completed: "AI done",
    failed: "AI failed",
};

/* ───────────────────────────── chips ───────────────────────────── */

type ChipColor = "default" | "success" | "warning" | "error" | "info" | "primary" | "secondary";

const CHIP_COLORS: Record<string, ChipColor> = {
    // exam / set
    draft: "warning",
    published: "success",
    archived: "default",
    retired: "default",
    // candidate
    locked: "default",
    ongoing: "info",
    re_exam: "warning",
    blocked: "error",
    completed: "success",
    // round
    eligible: "primary",
    in_progress: "info",
    under_review: "secondary",
    failed: "warning",
    exhausted: "error",
    passed: "success",
    // attempt / result
    submitted: "secondary",
    evaluated: "success",
    voided: "default",
    pending: "warning",
    // certificate
    issued: "success",
    revoked: "error",
    // ai
    not_required: "default",
    processing: "info",
};

const CHIP_LABELS: Record<string, string> = {
    ...CANDIDATE_STATUS_LABELS,
    ...ROUND_STATUS_LABELS,
    ...AI_STATUS_LABELS,
    passed: "Passed",
    failed: "Failed",
    pending: "Pending",
};

/** Status chip for every exam status family (exam, set, candidate, round, attempt, result, certificate, AI). */
export function ExamChip({ status, label, size = "small", color }: { status: string; label?: string; size?: "small" | "medium"; color?: ChipColor }) {
    return (
        <Chip
            size={size}
            label={label ?? CHIP_LABELS[status] ?? status.replace(/_/g, " ")}
            color={color ?? CHIP_COLORS[status] ?? "default"}
            variant="outlined"
            sx={{ textTransform: "capitalize", height: size === "small" ? 22 : undefined }}
        />
    );
}

export function RoundIcon({ type, size = 20 }: { type: ExamRoundType; size?: number }) {
    const meta = ROUND_META[type];
    return (
        <Box
            component="span"
            sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: size + 14,
                height: size + 14,
                borderRadius: "11px",
                fontSize: size,
                color: meta.color,
                background: `${meta.color}1f`,
                flexShrink: 0,
            }}
        >
            {meta.icon}
        </Box>
    );
}

/* ───────────────────────────── formatting ───────────────────────────── */

export function formatMinutes(sec: number | null | undefined) {
    if (!sec) return "Untimed";
    const min = Math.round(sec / 60);
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    return min % 60 ? `${h}h ${min % 60}m` : `${h}h`;
}

export function formatCooldown(min: number) {
    if (!min) return "No cooldown";
    const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;
    if (min < 60) return plural(min, "min");
    if (min < 24 * 60) return plural(Math.round((min / 60) * 10) / 10, "hour");
    return plural(Math.round((min / 1440) * 10) / 10, "day");
}

export function formatDateTime(value: string | null | undefined) {
    if (!value) return "—";
    return new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatClock(totalSec: number | null | undefined) {
    if (totalSec === null || totalSec === undefined) return "—";
    const s = Math.max(0, Math.round(totalSec));
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

export const formatPct = (value: number | null | undefined) => (value === null || value === undefined ? "—" : `${Math.round(value * 10) / 10}%`);
export const formatMarks = (value: number | null | undefined) => (value === null || value === undefined ? "—" : String(Math.round(value * 100) / 100));

/** "", "12" → null / 12 (for optional numeric inputs). */
export const optionalNumber = (value: string) => (value.trim() === "" ? null : Number(value));

/** Current time that refreshes every `intervalMs` (keeps render pure for cooldown / deadline checks). */
export function useNow(intervalMs = 30_000) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), intervalMs);
        return () => clearInterval(timer);
    }, [intervalMs]);
    return now;
}

export const isFuture = (iso: string | null | undefined, now: number) => Boolean(iso && new Date(iso).getTime() > now);

/* ───────────────────────────── layout ───────────────────────────── */

export function SectionCard({
    title,
    subtitle,
    actions,
    children,
    sx,
}: {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    actions?: React.ReactNode;
    children?: React.ReactNode;
    sx?: object;
}) {
    return (
        <GlassCard sx={{ p: { xs: 2, md: 2.5 }, ...sx }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { sm: "center" }, mb: children ? 2 : 0 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1">{title}</Typography>
                    {subtitle && (
                        <Typography variant="caption" color="text.secondary" component="div">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {actions && (
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }} useFlexGap>
                        {actions}
                    </Stack>
                )}
            </Stack>
            {children}
        </GlassCard>
    );
}

export function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", py: 0.75, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="body2" component="div" sx={{ textAlign: "right", fontWeight: 600 }}>
                {value}
            </Typography>
        </Stack>
    );
}

/* ───────────────────────────── reason prompt ───────────────────────────── */

interface ReasonOptions {
    title: string;
    description?: React.ReactNode;
    label?: string;
    confirmLabel?: string;
    danger?: boolean;
    warning?: React.ReactNode;
}

/** Every override is audited, so admin actions ask for a reason: `const reason = await ask({...})` → string | null. */
export function useReasonPrompt() {
    const [state, setState] = useState<(ReasonOptions & { resolve: (reason: string | null) => void }) | null>(null);
    const [reason, setReason] = useState("");

    const ask = useCallback((options: ReasonOptions) => {
        setReason("");
        return new Promise<string | null>((resolve) => setState({ ...options, resolve }));
    }, []);

    const close = (value: string | null) => {
        state?.resolve(value);
        setState(null);
    };

    const trimmed = reason.trim();
    const dialog = (
        <Dialog open={Boolean(state)} onClose={() => close(null)} maxWidth="xs" fullWidth>
            <DialogTitle>{state?.title}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    {state?.description && (
                        <Typography variant="body2" color="text.secondary" component="div">
                            {state.description}
                        </Typography>
                    )}
                    {state?.warning && <Alert severity="warning">{state.warning}</Alert>}
                    <TextField
                        autoFocus
                        label={state?.label ?? "Reason (saved in the audit log)"}
                        multiline
                        minRows={2}
                        value={reason}
                        onChange={(e) => setReason(e.target.value.slice(0, 500))}
                        helperText={`${trimmed.length}/500`}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button color="inherit" onClick={() => close(null)}>
                    Cancel
                </Button>
                <Button variant="contained" color={state?.danger ? "error" : "primary"} disabled={!trimmed} onClick={() => close(trimmed)}>
                    {state?.confirmLabel ?? "Confirm"}
                </Button>
            </DialogActions>
        </Dialog>
    );

    return { ask, dialog };
}
