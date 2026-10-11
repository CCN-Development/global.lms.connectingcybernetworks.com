"use client";

import React, { useState } from "react";
import { Alert, Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { MdSave, MdSync } from "react-icons/md";
import { useExam, type AdminExamTree, type ExamUnlockRule, type RoundProgression, type UpdateExamInput } from "@/contexts/ExamContext";
import { ImageUploadField, StringListField, notify } from "@/components/course-admin/ui";
import { InfoRow, SectionCard, UNLOCK_LABELS } from "./exam-ui";

interface SettingsForm {
    title: string;
    description: string;
    instructions: string[];
    unlockRule: ExamUnlockRule;
    unlockProgressPct: string;
    roundProgression: RoundProgression;
    certificateTitle: string;
    certificatePrefix: string;
    certificateValidityMonths: string;
    signatoryName: string;
    signatoryTitle: string;
    signatoryOrganisation: string;
    signatureUrl: string | null;
}

function toForm(exam: AdminExamTree): SettingsForm {
    return {
        title: exam.title,
        description: exam.description ?? "",
        instructions: exam.instructions,
        unlockRule: exam.unlockRule,
        unlockProgressPct: exam.unlockProgressPct !== null ? String(exam.unlockProgressPct) : "80",
        roundProgression: exam.roundProgression,
        certificateTitle: exam.certificateTitle,
        certificatePrefix: exam.certificatePrefix,
        certificateValidityMonths: exam.certificateValidityMonths ? String(exam.certificateValidityMonths) : "",
        signatoryName: exam.signatoryName ?? "",
        signatoryTitle: exam.signatoryTitle ?? "",
        signatoryOrganisation: exam.signatoryOrganisation ?? "",
        signatureUrl: exam.signatureUrl,
    };
}

const PREFIX_RE = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/;

function toInput(form: SettingsForm): UpdateExamInput | string {
    if (!form.title.trim()) return "Title is required";
    const pct = Number(form.unlockProgressPct);
    if (form.unlockRule === "progress_pct" && (!Number.isInteger(pct) || pct < 0 || pct > 100)) return "Unlock percentage must be a whole number 0–100";
    if (!form.certificateTitle.trim()) return "Certificate title is required";
    const prefix = form.certificatePrefix.trim().toUpperCase();
    if (!PREFIX_RE.test(prefix) || prefix.length > 20) return "Certificate prefix: letters, numbers and single dashes (max 20)";
    const months = form.certificateValidityMonths.trim();
    if (months && (!Number.isInteger(Number(months)) || Number(months) < 1 || Number(months) > 600)) return "Validity must be 1–600 months (or empty for lifetime)";
    const t = (v: string) => (v.trim() ? v.trim() : null);
    return {
        title: form.title.trim(),
        description: t(form.description),
        instructions: form.instructions.map((l) => l.trim()).filter(Boolean),
        unlockRule: form.unlockRule,
        unlockProgressPct: form.unlockRule === "progress_pct" ? pct : null,
        roundProgression: form.roundProgression,
        certificateTitle: form.certificateTitle.trim(),
        certificatePrefix: prefix,
        certificateValidityMonths: months ? Number(months) : null,
        signatoryName: t(form.signatoryName),
        signatoryTitle: t(form.signatoryTitle),
        signatoryOrganisation: t(form.signatoryOrganisation),
        signatureUrl: form.signatureUrl,
    };
}

export default function ExamSettingsTab({ exam }: { exam: AdminExamTree }) {
    const { updateExam, resyncExam, saving } = useExam();
    const [form, setForm] = useState<SettingsForm>(() => toForm(exam));
    const [error, setError] = useState<string | null>(null);
    const [needsResync, setNeedsResync] = useState(false);
    const set = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) => setForm((f) => ({ ...f, [key]: value }));

    const accessChanged =
        form.unlockRule !== exam.unlockRule ||
        form.roundProgression !== exam.roundProgression ||
        (form.unlockRule === "progress_pct" && String(exam.unlockProgressPct ?? "") !== form.unlockProgressPct);

    const save = async () => {
        const input = toInput(form);
        if (typeof input === "string") return setError(input);
        setError(null);
        const res = await updateExam(exam.examId, input);
        if (notify(res) && accessChanged) setNeedsResync(true);
    };

    return (
        <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", lg: "1.2fr 1fr" }, alignItems: "start" }}>
            <Stack spacing={2.5}>
                <SectionCard title="Exam details" subtitle="Shown to students on the exam page.">
                    <Stack spacing={2}>
                        <TextField label="Title" value={form.title} onChange={(e) => set("title", e.target.value)} slotProps={{ htmlInput: { maxLength: 200 } }} />
                        <TextField label="Description" multiline minRows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
                        <StringListField label="General instructions" value={form.instructions} onChange={(v) => set("instructions", v)} addLabel="Add instruction" />
                    </Stack>
                </SectionCard>

                <SectionCard title="Access & progression" subtitle="Who can start the exam, and in which order rounds open.">
                    <Stack spacing={2}>
                        {exam.examStatus === "published" && accessChanged && (
                            <Alert severity="warning">
                                The exam is live. Students who already unlocked it stay unlocked; changing the order only affects what opens next. Recompute candidate statuses after saving.
                            </Alert>
                        )}
                        <TextField select label="Unlock rule" value={form.unlockRule} onChange={(e) => set("unlockRule", e.target.value as ExamUnlockRule)} helperText={UNLOCK_LABELS[form.unlockRule].hint}>
                            {(Object.keys(UNLOCK_LABELS) as ExamUnlockRule[]).map((rule) => (
                                <MenuItem key={rule} value={rule}>
                                    {UNLOCK_LABELS[rule].label}
                                </MenuItem>
                            ))}
                        </TextField>
                        {form.unlockRule === "progress_pct" && (
                            <TextField label="Required course progress (%)" type="number" value={form.unlockProgressPct} onChange={(e) => set("unlockProgressPct", e.target.value)} />
                        )}
                        <TextField select label="Round order" value={form.roundProgression} onChange={(e) => set("roundProgression", e.target.value as RoundProgression)}>
                            <MenuItem value="sequential">Sequential — next round opens after the earlier mandatory ones are cleared</MenuItem>
                            <MenuItem value="free">Any order</MenuItem>
                        </TextField>
                    </Stack>
                </SectionCard>

                {error && <Alert severity="error">{error}</Alert>}
                {needsResync && (
                    <Alert
                        severity="info"
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                startIcon={<MdSync />}
                                disabled={saving}
                                onClick={async () => {
                                    if (notify(await resyncExam(exam.examId))) setNeedsResync(false);
                                }}
                            >
                                Recompute now
                            </Button>
                        }
                    >
                        Access rules changed — recompute candidate statuses so lists and dashboards reflect them right away.
                    </Alert>
                )}
                <Box>
                    <Button variant="contained" size="large" startIcon={<MdSave />} disabled={saving} onClick={save}>
                        Save settings
                    </Button>
                </Box>
            </Stack>

            <Stack spacing={2.5}>
                <SectionCard title="Certificate" subtitle="Applied to certificates issued from now on — issued ones keep what was printed.">
                    <Stack spacing={2}>
                        <TextField label="Certificate title" value={form.certificateTitle} onChange={(e) => set("certificateTitle", e.target.value)} slotProps={{ htmlInput: { maxLength: 120 } }} />
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="ID prefix"
                                value={form.certificatePrefix}
                                onChange={(e) => set("certificatePrefix", e.target.value.toUpperCase())}
                                helperText={`e.g. ${form.certificatePrefix || "CCN-CERT"}-26482913`}
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                label="Valid for (months)"
                                type="number"
                                value={form.certificateValidityMonths}
                                onChange={(e) => set("certificateValidityMonths", e.target.value)}
                                helperText="Empty = lifetime"
                                sx={{ width: 170 }}
                            />
                        </Stack>
                        <TextField label="Signatory name" value={form.signatoryName} onChange={(e) => set("signatoryName", e.target.value)} />
                        <TextField label="Signatory title" value={form.signatoryTitle} onChange={(e) => set("signatoryTitle", e.target.value)} placeholder="Chief Executive Officer" />
                        <TextField label="Organisation" value={form.signatoryOrganisation} onChange={(e) => set("signatoryOrganisation", e.target.value)} placeholder="Connecting Cyber Networks" />
                        <ImageUploadField label="Signature image" value={form.signatureUrl} onChange={(url) => set("signatureUrl", url)} folder="content-images" aspect="3 / 1" />
                    </Stack>
                </SectionCard>

                <SectionCard title="Record">
                    <InfoRow label="Status" value={exam.examStatus} />
                    <InfoRow label="Course" value={exam.course.courseName} />
                    <InfoRow label="Created" value={new Date(exam.createdAt).toLocaleString("en-GB")} />
                    <InfoRow label="Last updated" value={new Date(exam.updatedAt).toLocaleString("en-GB")} />
                    <InfoRow label="First published" value={exam.publishedAt ? new Date(exam.publishedAt).toLocaleString("en-GB") : "Never"} />
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
                        Publish, archive and delete live in the page header. An exam with attempts can be archived but not deleted.
                    </Typography>
                </SectionCard>
            </Stack>
        </Box>
    );
}
