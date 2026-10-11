"use client";

import React, { useState } from "react";
import { Alert, Box, Button, FormControlLabel, MenuItem, Stack, Switch, TextField, Typography } from "@mui/material";
import { MdRocketLaunch } from "react-icons/md";
import { useExam, type ExamRoundInput, type ExamRoundType, type ExamUnlockRule, type RoundProgression } from "@/contexts/ExamContext";
import { GlassCard, MoveButtons, notify } from "@/components/course-admin/ui";
import { EVALUATION_LABELS, ROUND_META, RoundIcon, SectionCard, UNLOCK_LABELS, formatCooldown, formatMinutes } from "./exam-ui";

/** Sensible starting rules per round type — all editable later in Rounds & sets. */
export const ROUND_DEFAULTS: Record<ExamRoundType, Omit<ExamRoundInput, "roundType">> = {
    viva: { durationSec: 30 * 60, maxAttempts: 3, retakeCooldownMin: 24 * 60, passingPct: 60, evaluationMode: "ai_assisted", deliveryMode: "online" },
    mcq: {
        durationSec: 90 * 60,
        maxAttempts: 3,
        retakeCooldownMin: 24 * 60,
        passingPct: 70,
        defaultMarks: 4,
        defaultNegativeMarks: 1,
        shuffleQuestions: true,
        shuffleOptions: true,
        evaluationMode: "auto",
        proctoringMode: "basic",
        maxViolations: 5,
    },
    lab: { durationSec: 120 * 60, maxAttempts: 3, retakeCooldownMin: 24 * 60, passingPct: 60, evaluationMode: "auto", deliveryMode: "online" },
    hr: { durationSec: 20 * 60, maxAttempts: 2, retakeCooldownMin: 3 * 24 * 60, passingPct: 50, evaluationMode: "ai_assisted" },
};

interface DraftRound {
    roundType: ExamRoundType;
    include: boolean;
    isMandatory: boolean;
}

const INITIAL_ROUNDS: DraftRound[] = [
    { roundType: "viva", include: true, isMandatory: true },
    { roundType: "mcq", include: true, isMandatory: true },
    { roundType: "lab", include: true, isMandatory: true },
    { roundType: "hr", include: false, isMandatory: false },
];

export default function ExamSetupPanel({ courseId, courseName, onCreated }: { courseId: string; courseName: string; onCreated: () => void }) {
    const { createExam, saving } = useExam();
    const [title, setTitle] = useState(`${courseName} Certification`);
    const [unlockRule, setUnlockRule] = useState<ExamUnlockRule>("course_completed");
    const [unlockPct, setUnlockPct] = useState("80");
    const [progression, setProgression] = useState<RoundProgression>("sequential");
    const [rounds, setRounds] = useState<DraftRound[]>(INITIAL_ROUNDS);
    const [error, setError] = useState<string | null>(null);

    const included = rounds.filter((r) => r.include);

    const submit = async () => {
        if (!title.trim()) return setError("Give the exam a title");
        const pct = Number(unlockPct);
        if (unlockRule === "progress_pct" && (!Number.isFinite(pct) || pct < 0 || pct > 100)) return setError("Unlock percentage must be between 0 and 100");
        if (included.length && !included.some((r) => r.isMandatory)) return setError("At least one round must be mandatory for the certificate");
        setError(null);
        const res = await createExam({
            courseId,
            title: title.trim(),
            unlockRule,
            unlockProgressPct: unlockRule === "progress_pct" ? Math.round(pct) : null,
            roundProgression: progression,
            rounds: included.map((r) => ({ roundType: r.roundType, isMandatory: r.isMandatory, ...ROUND_DEFAULTS[r.roundType] })),
        });
        if (notify(res, "Exam created — now add question sets to each round")) onCreated();
    };

    const move = (index: number, dir: -1 | 1) =>
        setRounds((list) => {
            const target = index + dir;
            if (target < 0 || target >= list.length) return list;
            const next = [...list];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });

    return (
        <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", lg: "1.1fr 1fr" }, alignItems: "start" }}>
            <SectionCard title="Create the certification exam" subtitle="Students earn the course certificate by clearing every mandatory round.">
                <Stack spacing={2}>
                    <TextField label="Exam title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <TextField select label="When does the exam open?" value={unlockRule} onChange={(e) => setUnlockRule(e.target.value as ExamUnlockRule)} helperText={UNLOCK_LABELS[unlockRule].hint}>
                        {(Object.keys(UNLOCK_LABELS) as ExamUnlockRule[]).map((rule) => (
                            <MenuItem key={rule} value={rule}>
                                {UNLOCK_LABELS[rule].label}
                            </MenuItem>
                        ))}
                    </TextField>
                    {unlockRule === "progress_pct" && (
                        <TextField label="Required course progress (%)" type="number" value={unlockPct} onChange={(e) => setUnlockPct(e.target.value)} slotProps={{ htmlInput: { min: 0, max: 100 } }} />
                    )}
                    <TextField
                        select
                        label="Round order"
                        value={progression}
                        onChange={(e) => setProgression(e.target.value as RoundProgression)}
                        helperText={progression === "sequential" ? "A round opens once every earlier mandatory round is cleared." : "Students may attempt rounds in any order."}
                    >
                        <MenuItem value="sequential">Sequential (recommended)</MenuItem>
                        <MenuItem value="free">Any order</MenuItem>
                    </TextField>
                    {error && <Alert severity="error">{error}</Alert>}
                    <Box>
                        <Button variant="contained" size="large" startIcon={<MdRocketLaunch />} disabled={saving} onClick={submit}>
                            Create exam {included.length ? `with ${included.length} round${included.length > 1 ? "s" : ""}` : ""}
                        </Button>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        The exam starts as a draft. Publish it after each mandatory round has at least one published question set.
                    </Typography>
                </Stack>
            </SectionCard>

            <SectionCard title="Rounds" subtitle="Pick the rounds and their order. Timing, attempts, marking and evaluation can be tuned afterwards.">
                <Stack spacing={1.25}>
                    {rounds.map((round, index) => {
                        const meta = ROUND_META[round.roundType];
                        const defaults = ROUND_DEFAULTS[round.roundType];
                        return (
                            <GlassCard key={round.roundType} sx={{ p: 1.5, opacity: round.include ? 1 : 0.55, borderColor: round.include ? `${meta.color}55` : undefined }}>
                                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                                    <RoundIcon type={round.roundType} />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {meta.label}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" component="div">
                                            {formatMinutes(defaults.durationSec)} · {defaults.maxAttempts} attempts · {formatCooldown(defaults.retakeCooldownMin ?? 0)} cooldown · pass{" "}
                                            {defaults.passingPct}% · {EVALUATION_LABELS[defaults.evaluationMode ?? "auto"].label}
                                        </Typography>
                                    </Box>
                                    <MoveButtons onUp={() => move(index, -1)} onDown={() => move(index, 1)} disableUp={index === 0} disableDown={index === rounds.length - 1} />
                                </Stack>
                                <Stack direction="row" spacing={2} sx={{ mt: 1, pl: 6, flexWrap: "wrap" }}>
                                    <FormControlLabel
                                        control={<Switch size="small" checked={round.include} onChange={(e) => setRounds((list) => list.map((r) => (r.roundType === round.roundType ? { ...r, include: e.target.checked } : r)))} />}
                                        label={<Typography variant="body2">Include</Typography>}
                                    />
                                    <FormControlLabel
                                        disabled={!round.include}
                                        control={
                                            <Switch
                                                size="small"
                                                checked={round.isMandatory}
                                                onChange={(e) => setRounds((list) => list.map((r) => (r.roundType === round.roundType ? { ...r, isMandatory: e.target.checked } : r)))}
                                            />
                                        }
                                        label={<Typography variant="body2">Required for certificate</Typography>}
                                    />
                                </Stack>
                            </GlassCard>
                        );
                    })}
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
                    Need two lab rounds? Add more rounds of any type from Rounds & sets after creating the exam.
                </Typography>
            </SectionCard>
        </Box>
    );
}
