"use client";

import React, { useState } from "react";
import { Box, Button, Chip, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { MdAdd, MdDeleteOutline, MdFlag, MdSave } from "react-icons/md";
import {
    useCourse,
    type AdminLessonDetail,
    type ContentBlock,
    type LabInput,
    type LabProvider,
    type LabRecord,
    type LabVerificationMode,
} from "@/contexts/CourseContext";
import { GlassCard, StringListField, notify, useConfirm } from "../ui";
import ContentBlocksEditor, { cleanBlocks, validateBlocks } from "./ContentBlocksEditor";

interface LabForm {
    title: string;
    introLines: string[];
    overview: string;
    taskBlocks: ContentBlock[];
    solutionBlocks: ContentBlock[];
    taskCount: string;
    tools: string[];
    solutionPenaltyXp: string;
    provider: LabProvider;
    launchUrl: string;
    environmentTemplateId: string;
    buildSeconds: string;
    sessionTimeoutMin: string;
    verificationMode: LabVerificationMode;
}

function toLabForm(lab: LabRecord | null): LabForm {
    return {
        title: lab?.title ?? "Lab Challenge",
        introLines: lab?.introLines ?? ["Put your knowledge into practice.", "Complete the hands-on task, solve the challenge, and prove your skills."],
        overview: lab?.overview ?? "",
        taskBlocks: lab?.taskBlocks ?? [],
        solutionBlocks: lab?.solutionBlocks ?? [],
        taskCount: String(lab?.taskCount ?? 1),
        tools: lab?.tools ?? [],
        solutionPenaltyXp: String(lab?.solutionPenaltyXp ?? 0),
        provider: lab?.provider ?? "external_url",
        launchUrl: lab?.launchUrl ?? "",
        environmentTemplateId: lab?.environmentTemplateId ?? "",
        buildSeconds: String(lab?.buildSeconds ?? 0),
        sessionTimeoutMin: lab?.sessionTimeoutMin ? String(lab.sessionTimeoutMin) : "",
        verificationMode: lab?.verificationMode ?? "self_report",
    };
}

function toLabInput(form: LabForm): LabInput {
    return {
        title: form.title.trim() || null,
        introLines: form.introLines.map((l) => l.trim()).filter(Boolean),
        overview: form.overview.trim(),
        taskBlocks: cleanBlocks(form.taskBlocks),
        solutionBlocks: cleanBlocks(form.solutionBlocks),
        taskCount: Math.max(1, Number(form.taskCount) || 1),
        tools: form.tools.map((t) => t.trim()).filter(Boolean),
        solutionPenaltyXp: Math.max(0, Number(form.solutionPenaltyXp) || 0),
        provider: form.provider,
        launchUrl: form.launchUrl.trim() || null,
        environmentTemplateId: form.environmentTemplateId.trim() || null,
        buildSeconds: Math.max(0, Number(form.buildSeconds) || 0),
        sessionTimeoutMin: form.sessionTimeoutMin.trim() ? Number(form.sessionTimeoutMin) : null,
        verificationMode: form.verificationMode,
    };
}

export default function LabEditor({ lesson }: { lesson: AdminLessonDetail }) {
    const { upsertLab, createLabFlag, deleteLabFlag, saving } = useCourse();
    const { confirm, dialog } = useConfirm();
    const lab = lesson.lab;
    const [form, setForm] = useState<LabForm>(() => toLabForm(lab));
    const [error, setError] = useState<string | null>(null);
    const [flag, setFlag] = useState({ label: "", value: "" });
    const set = <K extends keyof LabForm>(key: K, v: LabForm[K]) => setForm((f) => ({ ...f, [key]: v }));

    const penalty = Math.max(0, Number(form.solutionPenaltyXp) || 0);

    const save = async () => {
        const problem = !form.overview.trim()
            ? "Write an overview"
            : form.provider === "external_url" && !/^https?:\/\//.test(form.launchUrl.trim())
                ? "External labs need a launch URL (https://…)"
                : validateBlocks(form.taskBlocks) ?? validateBlocks(form.solutionBlocks);
        setError(problem);
        if (problem) return;
        notify(await upsertLab(lesson.lessonId, toLabInput(form)));
    };

    const addFlag = async () => {
        if (!lab || !flag.label.trim() || !flag.value.trim()) return;
        if (notify(await createLabFlag(lab.labId, { label: flag.label.trim(), flag: flag.value }))) setFlag({ label: "", value: "" });
    };

    const removeFlag = async (flagId: string, label: string) => {
        if (await confirm({ title: `Remove flag "${label}"?`, confirmLabel: "Remove", danger: true })) notify(await deleteLabFlag(flagId));
    };

    return (
        <Stack spacing={2.5}>
            <GlassCard sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Lab brief
                </Typography>
                <Stack spacing={2}>
                    <TextField label="Title" value={form.title} onChange={(e) => set("title", e.target.value)} />
                    <StringListField label="Intro lines (lab start card)" value={form.introLines} onChange={(v) => set("introLines", v)} addLabel="Add line" />
                    <TextField label="Overview" required multiline minRows={3} value={form.overview} onChange={(e) => set("overview", e.target.value)} />
                    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" } }}>
                        <TextField label="Tasks" type="number" value={form.taskCount} onChange={(e) => set("taskCount", e.target.value)} />
                        <TextField
                            label="Solution penalty (XP)"
                            type="number"
                            value={form.solutionPenaltyXp}
                            onChange={(e) => set("solutionPenaltyXp", e.target.value)}
                            helperText={`Earns ${Math.max(0, lesson.xp - penalty)} / ${lesson.xp} XP after viewing the solution`}
                        />
                        <TextField select label="Completion check" value={form.verificationMode} onChange={(e) => set("verificationMode", e.target.value as LabVerificationMode)}>
                            <MenuItem value="self_report">Student clicks Finish</MenuItem>
                            <MenuItem value="flag">Capture all flags</MenuItem>
                        </TextField>
                    </Box>
                    <StringListField label="Tools" value={form.tools} onChange={(v) => set("tools", v)} placeholder="e.g. Nmap" addLabel="Add tool" />
                </Stack>
            </GlassCard>

            <GlassCard sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Environment
                </Typography>
                <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" } }}>
                    <TextField select label="Provider" value={form.provider} onChange={(e) => set("provider", e.target.value as LabProvider)}>
                        <MenuItem value="external_url">External URL</MenuItem>
                        <MenuItem value="managed_vm">Managed VM (coming soon)</MenuItem>
                        <MenuItem value="none">No environment (offline)</MenuItem>
                    </TextField>
                    {form.provider === "external_url" && (
                        <TextField label="Launch URL" value={form.launchUrl} onChange={(e) => set("launchUrl", e.target.value)} placeholder="https://labs.example.com/…" />
                    )}
                    {form.provider === "managed_vm" && (
                        <TextField label="Environment template ID" value={form.environmentTemplateId} onChange={(e) => set("environmentTemplateId", e.target.value)} />
                    )}
                    <TextField
                        label="Build time (seconds)"
                        type="number"
                        value={form.buildSeconds}
                        onChange={(e) => set("buildSeconds", e.target.value)}
                        helperText="Countdown shown while the environment starts"
                    />
                    <TextField
                        label="Session timeout (minutes)"
                        type="number"
                        value={form.sessionTimeoutMin}
                        onChange={(e) => set("sessionTimeoutMin", e.target.value)}
                        helperText="Empty = no timeout"
                    />
                </Box>
            </GlassCard>

            <GlassCard sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                    Task tab
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                    Instructions, objective, dictionaries, tools…
                </Typography>
                <ContentBlocksEditor value={form.taskBlocks} onChange={(v) => set("taskBlocks", v)} />
            </GlassCard>

            <GlassCard sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                    Solution tab
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                    Hidden until the student unlocks it (and accepts the XP penalty).
                </Typography>
                <ContentBlocksEditor value={form.solutionBlocks} onChange={(v) => set("solutionBlocks", v)} emptyHint="Add step-by-step solution content." />
            </GlassCard>

            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Button variant="contained" startIcon={<MdSave />} onClick={save} disabled={saving}>
                    {lab ? "Save lab" : "Create lab"}
                </Button>
                {error && (
                    <Typography color="error" variant="body2">
                        {error}
                    </Typography>
                )}
            </Stack>

            <GlassCard sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
                    <MdFlag />
                    <Typography variant="subtitle1">Flags ({lab?.flags.length ?? 0})</Typography>
                    {form.verificationMode === "flag" && !lab?.flags.length && <Chip size="small" color="warning" label="Required for flag mode" />}
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                    Flags are stored as SHA-256 hashes and compared after trimming spaces — the value can&apos;t be viewed again.
                </Typography>
                {!lab ? (
                    <Typography variant="body2" color="text.secondary">
                        Save the lab first to add flags.
                    </Typography>
                ) : (
                    <>
                        <Stack spacing={1} sx={{ mb: 2 }}>
                            {lab.flags.map((f) => (
                                <Stack key={f.flagId} direction="row" spacing={1} sx={{ alignItems: "center", p: 1, px: 1.5, borderRadius: "12px", bgcolor: "rgba(255,255,255,0.03)" }}>
                                    <Typography variant="body2" sx={{ flex: 1 }}>
                                        {f.label}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        ••••••••
                                    </Typography>
                                    <Tooltip title="Remove flag">
                                        <IconButton size="small" color="error" onClick={() => removeFlag(f.flagId, f.label)}>
                                            <MdDeleteOutline />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            ))}
                        </Stack>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                            <TextField size="small" label="Label" placeholder="Root flag" value={flag.label} onChange={(e) => setFlag({ ...flag, label: e.target.value })} />
                            <TextField
                                size="small"
                                label="Flag value"
                                placeholder="FLAG{...}"
                                value={flag.value}
                                onChange={(e) => setFlag({ ...flag, value: e.target.value })}
                                sx={{ flex: 1 }}
                            />
                            <Button variant="outlined" startIcon={<MdAdd />} onClick={addFlag} disabled={saving || !flag.label.trim() || !flag.value.trim()}>
                                Add flag
                            </Button>
                        </Stack>
                    </>
                )}
            </GlassCard>
            {dialog}
        </Stack>
    );
}
