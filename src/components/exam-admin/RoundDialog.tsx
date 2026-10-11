"use client";

import React, { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    MenuItem,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import {
    ROUND_EVALUATION_MODES,
    type DeliveryMode,
    type ExamEvaluationMode,
    type ExamRevealMode,
    type ExamRoundInput,
    type ExamRoundRecord,
    type ExamRoundType,
    type MsqScoring,
    type ProctoringMode,
} from "@/contexts/ExamContext";
import { StringListField } from "@/components/course-admin/ui";
import { DELIVERY_LABELS, EVALUATION_LABELS, MSQ_LABELS, PROCTORING_LABELS, REVEAL_LABELS, ROUND_META, RoundIcon } from "./exam-ui";
import { ROUND_DEFAULTS } from "./ExamSetupPanel";

type CooldownUnit = "min" | "hours" | "days";
const UNIT_MIN: Record<CooldownUnit, number> = { min: 1, hours: 60, days: 1440 };

interface RoundForm {
    roundType: ExamRoundType;
    title: string;
    info: string;
    instructions: string[];
    isMandatory: boolean;
    deliveryMode: DeliveryMode;
    selfStart: boolean;
    durationMin: string;
    maxAttempts: string;
    cooldownValue: string;
    cooldownUnit: CooldownUnit;
    allowResume: boolean;
    passingPct: string;
    defaultMarks: string;
    defaultNegativeMarks: string;
    msqScoring: MsqScoring;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    evaluationMode: ExamEvaluationMode;
    revealMode: ExamRevealMode;
    proctoringMode: ProctoringMode;
    maxViolations: string;
}

function cooldownParts(min: number): { cooldownValue: string; cooldownUnit: CooldownUnit } {
    if (min && min % 1440 === 0) return { cooldownValue: String(min / 1440), cooldownUnit: "days" };
    if (min && min % 60 === 0) return { cooldownValue: String(min / 60), cooldownUnit: "hours" };
    return { cooldownValue: String(min), cooldownUnit: "min" };
}

function toForm(round: ExamRoundRecord | null, roundType: ExamRoundType): RoundForm {
    const d = { ...ROUND_DEFAULTS[roundType], ...(round ?? {}) } as Partial<ExamRoundRecord> & Omit<ExamRoundInput, "roundType">;
    return {
        roundType: round?.roundType ?? roundType,
        title: round?.title ?? ROUND_META[roundType].label,
        info: round?.info ?? "",
        instructions: round?.instructions ?? [],
        isMandatory: d.isMandatory ?? true,
        deliveryMode: d.deliveryMode ?? "online",
        selfStart: d.selfStart ?? true,
        durationMin: d.durationSec ? String(Math.round(d.durationSec / 60)) : "",
        maxAttempts: d.maxAttempts ? String(d.maxAttempts) : "",
        ...cooldownParts(d.retakeCooldownMin ?? 0),
        allowResume: d.allowResume ?? true,
        passingPct: String(d.passingPct ?? 50),
        defaultMarks: String(d.defaultMarks ?? 1),
        defaultNegativeMarks: String(d.defaultNegativeMarks ?? 0),
        msqScoring: d.msqScoring ?? "all_or_nothing",
        shuffleQuestions: d.shuffleQuestions ?? false,
        shuffleOptions: d.shuffleOptions ?? false,
        evaluationMode: d.evaluationMode ?? ROUND_EVALUATION_MODES[roundType][0],
        revealMode: d.revealMode ?? "score_only",
        proctoringMode: d.proctoringMode ?? "none",
        maxViolations: d.maxViolations ? String(d.maxViolations) : "",
    };
}

function inRange(raw: string, min: number, max: number, integer = true) {
    const n = Number(raw);
    return raw.trim() !== "" && Number.isFinite(n) && n >= min && n <= max && (!integer || Number.isInteger(n));
}

/** Mirrors the API validators; returns the payload or an error message. */
function toInput(form: RoundForm): ExamRoundInput | string {
    if (!form.title.trim()) return "Give the round a title";
    if (form.durationMin.trim() && !inRange(form.durationMin, 1, 1440)) return "Duration must be 1–1440 minutes (or empty for untimed)";
    if (form.maxAttempts.trim() && !inRange(form.maxAttempts, 1, 100)) return "Max attempts must be 1–100 (or empty for unlimited)";
    if (!inRange(form.cooldownValue || "0", 0, 525600, false)) return "Cooldown must be a positive number";
    const cooldownMin = Math.round(Number(form.cooldownValue || 0) * UNIT_MIN[form.cooldownUnit]);
    if (cooldownMin > 525600) return "Cooldown can be at most 365 days";
    if (!inRange(form.passingPct, 0, 100, false)) return "Pass mark must be 0–100%";
    if (!inRange(form.defaultMarks, 0, 1000, false)) return "Default marks must be 0–1000";
    if (form.roundType === "mcq" && !inRange(form.defaultNegativeMarks || "0", 0, 1000, false)) return "Negative marks must be 0–1000";
    if (form.proctoringMode !== "none" && form.maxViolations.trim() && !inRange(form.maxViolations, 1, 1000)) return "Max violations must be 1–1000 (or empty to only log)";
    if (!ROUND_EVALUATION_MODES[form.roundType].includes(form.evaluationMode)) return "That evaluation mode isn't available for this round type";

    const isMcq = form.roundType === "mcq";
    return {
        roundType: form.roundType,
        title: form.title.trim(),
        info: form.info.trim() || null,
        instructions: form.instructions.map((l) => l.trim()).filter(Boolean),
        isMandatory: form.isMandatory,
        deliveryMode: form.deliveryMode,
        selfStart: form.selfStart,
        durationSec: form.durationMin.trim() ? Math.round(Number(form.durationMin) * 60) : null,
        maxAttempts: form.maxAttempts.trim() ? Number(form.maxAttempts) : null,
        retakeCooldownMin: cooldownMin,
        allowResume: form.allowResume,
        passingPct: Number(form.passingPct),
        defaultMarks: Number(form.defaultMarks),
        defaultNegativeMarks: isMcq ? Number(form.defaultNegativeMarks || 0) : 0,
        msqScoring: form.msqScoring,
        shuffleQuestions: form.shuffleQuestions,
        shuffleOptions: isMcq ? form.shuffleOptions : false,
        evaluationMode: form.evaluationMode,
        revealMode: form.revealMode,
        proctoringMode: form.proctoringMode,
        maxViolations: form.proctoringMode !== "none" && form.maxViolations.trim() ? Number(form.maxViolations) : null,
    };
}

export default function RoundDialog({
    open,
    round,
    hasAttempts,
    onClose,
    onSubmit,
}: {
    open: boolean;
    /** null = create */
    round: ExamRoundRecord | null;
    hasAttempts: boolean;
    onClose: () => void;
    onSubmit: (input: ExamRoundInput) => Promise<boolean>;
}) {
    const isCreate = !round;
    const [form, setForm] = useState<RoundForm>(() => toForm(round, round?.roundType ?? "mcq"));
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const set = <K extends keyof RoundForm>(key: K, value: RoundForm[K]) => setForm((f) => ({ ...f, [key]: value }));
    const isMcq = form.roundType === "mcq";

    const changeType = (roundType: ExamRoundType) => setForm({ ...toForm(null, roundType), isMandatory: form.isMandatory });

    const submit = async () => {
        const result = toInput(form);
        if (typeof result === "string") return setError(result);
        setError(null);
        setBusy(true);
        const ok = await onSubmit(result);
        setBusy(false);
        if (ok) onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <RoundIcon type={form.roundType} />
                    <span>{isCreate ? "Add a round" : `Edit ${round.title}`}</span>
                </Stack>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5}>
                    {!isCreate && hasAttempts && (
                        <Alert severity="info">
                            Students have already attempted this round. Changes apply to <b>new attempts only</b> — ongoing and finished attempts keep the rules they started with. The round type can&apos;t change.
                        </Alert>
                    )}

                    <Box>
                        <Typography variant="overline" color="text.secondary">
                            Basics
                        </Typography>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <TextField
                                    select
                                    label="Round type"
                                    value={form.roundType}
                                    disabled={!isCreate}
                                    onChange={(e) => changeType(e.target.value as ExamRoundType)}
                                    helperText={isCreate ? ROUND_META[form.roundType].description : "Fixed once created"}
                                    sx={{ minWidth: 240 }}
                                >
                                    {(Object.keys(ROUND_META) as ExamRoundType[]).map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {ROUND_META[type].label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField fullWidth label="Title" value={form.title} onChange={(e) => set("title", e.target.value)} slotProps={{ htmlInput: { maxLength: 200 } }} />
                            </Stack>
                            <TextField label="Tooltip / short info for students" value={form.info} onChange={(e) => set("info", e.target.value)} slotProps={{ htmlInput: { maxLength: 500 } }} />
                            <StringListField label="Instructions shown before starting" value={form.instructions} onChange={(v) => set("instructions", v)} addLabel="Add instruction" />
                            <Stack direction="row" spacing={3} sx={{ flexWrap: "wrap" }}>
                                <FormControlLabel control={<Switch checked={form.isMandatory} onChange={(e) => set("isMandatory", e.target.checked)} />} label="Required for the certificate" />
                                <FormControlLabel
                                    control={<Switch checked={form.selfStart} onChange={(e) => set("selfStart", e.target.checked)} />}
                                    label="Students can start it themselves"
                                />
                            </Stack>
                            <TextField
                                select
                                label="Delivery"
                                value={form.deliveryMode}
                                onChange={(e) => set("deliveryMode", e.target.value as DeliveryMode)}
                                helperText={!form.selfStart ? "An evaluator starts each attempt from Candidates (e.g. an in-centre viva)." : " "}
                                sx={{ maxWidth: 280 }}
                            >
                                {(Object.keys(DELIVERY_LABELS) as DeliveryMode[]).map((m) => (
                                    <MenuItem key={m} value={m}>
                                        {DELIVERY_LABELS[m]}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    </Box>

                    <Divider />
                    <Box>
                        <Typography variant="overline" color="text.secondary">
                            Timing & retakes
                        </Typography>
                        <Box sx={{ display: "grid", gap: 2, mt: 1, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" } }}>
                            <TextField label="Duration (minutes)" type="number" value={form.durationMin} onChange={(e) => set("durationMin", e.target.value)} helperText="Empty = untimed. The clock keeps running if the student leaves." />
                            <TextField label="Max attempts" type="number" value={form.maxAttempts} onChange={(e) => set("maxAttempts", e.target.value)} helperText="Empty = unlimited (still limited by unseen sets)" />
                            <Stack direction="row" spacing={1}>
                                <TextField label="Cooldown after a fail" type="number" value={form.cooldownValue} onChange={(e) => set("cooldownValue", e.target.value)} sx={{ flex: 1 }} />
                                <TextField select value={form.cooldownUnit} onChange={(e) => set("cooldownUnit", e.target.value as CooldownUnit)} sx={{ width: 110 }}>
                                    <MenuItem value="min">min</MenuItem>
                                    <MenuItem value="hours">hours</MenuItem>
                                    <MenuItem value="days">days</MenuItem>
                                </TextField>
                            </Stack>
                        </Box>
                        <FormControlLabel
                            sx={{ mt: 1 }}
                            control={<Switch checked={form.allowResume} onChange={(e) => set("allowResume", e.target.checked)} />}
                            label="Allow resuming a half-finished attempt (off = leaving for 2+ minutes submits it)"
                        />
                    </Box>

                    <Divider />
                    <Box>
                        <Typography variant="overline" color="text.secondary">
                            Scoring
                        </Typography>
                        <Box sx={{ display: "grid", gap: 2, mt: 1, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" } }}>
                            <TextField label="Pass mark (%)" type="number" value={form.passingPct} onChange={(e) => set("passingPct", e.target.value)} />
                            <TextField label="Default marks per question" type="number" value={form.defaultMarks} onChange={(e) => set("defaultMarks", e.target.value)} helperText="Questions can override it" />
                            {isMcq && (
                                <TextField
                                    label="Negative marks per wrong answer"
                                    type="number"
                                    value={form.defaultNegativeMarks}
                                    onChange={(e) => set("defaultNegativeMarks", e.target.value)}
                                    helperText="e.g. +4 / −1 → 4 and 1"
                                />
                            )}
                            {isMcq && (
                                <TextField select label="Multiple-choice (MSQ) scoring" value={form.msqScoring} onChange={(e) => set("msqScoring", e.target.value as MsqScoring)}>
                                    {(Object.keys(MSQ_LABELS) as MsqScoring[]).map((m) => (
                                        <MenuItem key={m} value={m}>
                                            {MSQ_LABELS[m]}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        </Box>
                        <Stack direction="row" spacing={3} sx={{ flexWrap: "wrap", mt: 1 }}>
                            <FormControlLabel control={<Switch checked={form.shuffleQuestions} onChange={(e) => set("shuffleQuestions", e.target.checked)} />} label="Shuffle question order" />
                            {isMcq && <FormControlLabel control={<Switch checked={form.shuffleOptions} onChange={(e) => set("shuffleOptions", e.target.checked)} />} label="Shuffle options" />}
                        </Stack>
                    </Box>

                    <Divider />
                    <Box>
                        <Typography variant="overline" color="text.secondary">
                            Evaluation & results
                        </Typography>
                        <Box sx={{ display: "grid", gap: 2, mt: 1, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                            <TextField
                                select
                                label="Evaluation"
                                value={form.evaluationMode}
                                onChange={(e) => set("evaluationMode", e.target.value as ExamEvaluationMode)}
                                helperText={EVALUATION_LABELS[form.evaluationMode].hint}
                            >
                                {ROUND_EVALUATION_MODES[form.roundType].map((mode) => (
                                    <MenuItem key={mode} value={mode}>
                                        {EVALUATION_LABELS[mode].label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField select label="What students see after evaluation" value={form.revealMode} onChange={(e) => set("revealMode", e.target.value as ExamRevealMode)} helperText={REVEAL_LABELS[form.revealMode].hint}>
                                {(Object.keys(REVEAL_LABELS) as ExamRevealMode[]).map((mode) => (
                                    <MenuItem key={mode} value={mode}>
                                        {REVEAL_LABELS[mode].label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                        {form.revealMode === "after_evaluation" && (
                            <Alert severity="warning" sx={{ mt: 1.5 }}>
                                Other students may later receive the same set — revealing the answer key lets it leak.
                            </Alert>
                        )}
                    </Box>

                    <Divider />
                    <Box>
                        <Typography variant="overline" color="text.secondary">
                            Proctoring
                        </Typography>
                        <Box sx={{ display: "grid", gap: 2, mt: 1, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                            <TextField select label="Proctoring" value={form.proctoringMode} onChange={(e) => set("proctoringMode", e.target.value as ProctoringMode)}>
                                {(Object.keys(PROCTORING_LABELS) as ProctoringMode[]).map((m) => (
                                    <MenuItem key={m} value={m}>
                                        {PROCTORING_LABELS[m]}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                label="Auto-submit after violations"
                                type="number"
                                value={form.maxViolations}
                                disabled={form.proctoringMode === "none"}
                                onChange={(e) => set("maxViolations", e.target.value)}
                                helperText="Tab switches, fullscreen exits… Empty = only log them"
                            />
                        </Box>
                    </Box>

                    {error && <Alert severity="error">{error}</Alert>}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={submit} disabled={busy}>
                    {isCreate ? "Add round" : "Save round"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
