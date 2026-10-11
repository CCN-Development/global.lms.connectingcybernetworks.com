"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    MenuItem,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { MdAdd, MdDeleteOutline, MdEdit, MdEmojiEvents, MdSave } from "react-icons/md";
import {
    useCourse,
    type AdminBadgeListItem,
    type BadgeCriteria,
    type BadgeInput,
    type BadgeScope,
    type CourseLevelRecord,
    type RankTierInput,
} from "@/contexts/CourseContext";
import { CourseAdminNav, EmptyState, GlassCard, ImageUploadField, LoadingState, PageHeader, notify, useConfirm } from "./ui";

/* ───────────────────────────── rank tiers ───────────────────────────── */

interface TierRow {
    title: string;
    minXp: string;
    iconUrl: string | null;
    isMilestone: boolean;
    milestoneDescription: string;
}

const STARTER_TIERS: TierRow[] = [
    { title: "Cyber Explorer", minXp: "0", iconUrl: null, isMilestone: false, milestoneDescription: "" },
    { title: "Packet Tracer", minXp: "150", iconUrl: null, isMilestone: false, milestoneDescription: "" },
    { title: "Net Defender", minXp: "400", iconUrl: null, isMilestone: false, milestoneDescription: "" },
    { title: "Threat Hunter", minXp: "800", iconUrl: null, isMilestone: false, milestoneDescription: "" },
    { title: "Cyber Sentinel", minXp: "1500", iconUrl: null, isMilestone: true, milestoneDescription: "Unlock exciting badges and earn bonus points." },
    { title: "Security Architect", minXp: "3000", iconUrl: null, isMilestone: false, milestoneDescription: "" },
    { title: "Cyber Legend", minXp: "6000", iconUrl: null, isMilestone: true, milestoneDescription: "Join the hall of fame." },
];

function validateTiers(rows: TierRow[]): string | null {
    if (!rows.length) return "Add at least one level";
    for (const [i, row] of rows.entries()) {
        if (!row.title.trim()) return `Level ${i + 1} needs a title`;
        const xp = Number(row.minXp);
        if (!Number.isFinite(xp) || xp < 0) return `Level ${i + 1} needs a valid XP threshold`;
        if (i === 0 && xp !== 0) return "Level 1 must start at 0 XP";
        if (i > 0 && xp <= Number(rows[i - 1].minXp)) return `Level ${i + 1} must need more XP than level ${i}`;
    }
    return null;
}

function RankTiersEditor() {
    const { rankTiers, getRankTiers, saveRankTiers, saving } = useCourse();
    const [rows, setRows] = useState<TierRow[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getRankTiers().then((res) => {
            if (res.success) {
                setRows(
                    (res.data ?? []).map((t) => ({
                        title: t.title,
                        minXp: String(t.minXp),
                        iconUrl: t.iconUrl,
                        isMilestone: t.isMilestone,
                        milestoneDescription: t.milestoneDescription ?? "",
                    }))
                );
            }
        });
    }, [getRankTiers]);

    const update = (index: number, patch: Partial<TierRow>) => setRows((prev) => prev?.map((r, i) => (i === index ? { ...r, ...patch } : r)) ?? prev);

    const save = async () => {
        if (!rows) return;
        const problem = validateTiers(rows);
        setError(problem);
        if (problem) return;
        const tiers: RankTierInput[] = rows.map((r, i) => ({
            levelNo: i + 1,
            title: r.title.trim(),
            minXp: Number(r.minXp),
            iconUrl: r.iconUrl,
            isMilestone: r.isMilestone,
            milestoneDescription: r.milestoneDescription.trim() || null,
        }));
        notify(await saveRankTiers(tiers), "Rank levels saved — every learner was re-ranked");
    };

    if (!rows) return <LoadingState label="Loading rank levels…" />;

    return (
        <GlassCard sx={{ p: 2.5 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { sm: "center" }, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1">Learner rank levels</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {'"Level 1 — Cyber Explorer". Students level up as total XP crosses each threshold. Milestones feed the "Next milestone" card.'}
                    </Typography>
                </Box>
                {!rows.length && !rankTiers.length && (
                    <Button variant="outlined" onClick={() => setRows(STARTER_TIERS.map((t) => ({ ...t })))}>
                        Use starter levels
                    </Button>
                )}
            </Stack>

            <Stack spacing={1}>
                {rows.map((row, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: "grid",
                            gap: 1.5,
                            alignItems: "center",
                            gridTemplateColumns: { xs: "1fr", md: "70px 1.3fr 130px 120px 1.6fr 40px" },
                            p: 1.25,
                            borderRadius: "12px",
                            bgcolor: "rgba(255,255,255,0.02)",
                        }}
                    >
                        <Chip label={`Level ${index + 1}`} size="small" color="primary" variant="outlined" />
                        <TextField size="small" label="Title" value={row.title} onChange={(e) => update(index, { title: e.target.value })} />
                        <TextField size="small" label="Min XP" type="number" value={row.minXp} disabled={index === 0} onChange={(e) => update(index, { minXp: e.target.value })} />
                        <FormControlLabel control={<Switch size="small" checked={row.isMilestone} onChange={(e) => update(index, { isMilestone: e.target.checked })} />} label="Milestone" />
                        <TextField
                            size="small"
                            label="Milestone text"
                            value={row.milestoneDescription}
                            disabled={!row.isMilestone}
                            onChange={(e) => update(index, { milestoneDescription: e.target.value })}
                        />
                        <IconButton aria-label="Remove level" disabled={rows.length === 1} onClick={() => setRows(rows.filter((_, i) => i !== index))}>
                            <MdDeleteOutline />
                        </IconButton>
                    </Box>
                ))}
            </Stack>

            <Stack direction="row" spacing={1.5} sx={{ mt: 2, alignItems: "center", flexWrap: "wrap" }} useFlexGap>
                <Button
                    startIcon={<MdAdd />}
                    onClick={() => {
                        const last = rows[rows.length - 1];
                        setRows([...rows, { title: "", minXp: last ? String(Number(last.minXp) + 500) : "0", iconUrl: null, isMilestone: false, milestoneDescription: "" }]);
                    }}
                >
                    Add level
                </Button>
                <Button variant="contained" startIcon={<MdSave />} onClick={save} disabled={saving}>
                    Save levels
                </Button>
                {error && (
                    <Typography color="error" variant="body2">
                        {error}
                    </Typography>
                )}
            </Stack>
        </GlassCard>
    );
}

/* ───────────────────────────── badges ───────────────────────────── */

const CRITERIA: { value: BadgeCriteria; label: string; valueLabel: string | null }[] = [
    { value: "level_completed", label: "Completes a level", valueLabel: "Levels completed (when no specific level)" },
    { value: "course_completed", label: "Completes a course", valueLabel: "Courses completed (global badges)" },
    { value: "xp_total", label: "Reaches total XP", valueLabel: "XP" },
    { value: "streak_days", label: "Learning streak", valueLabel: "Days in a row" },
    { value: "labs_completed", label: "Labs completed", valueLabel: "Labs" },
    { value: "quizzes_passed", label: "Quizzes passed", valueLabel: "Quizzes" },
    { value: "quiz_perfect", label: "Perfect quiz score", valueLabel: null },
    { value: "no_solution_labs", label: "Labs solved without the solution", valueLabel: "Labs" },
];

interface BadgeForm {
    code: string;
    name: string;
    description: string;
    iconUrl: string | null;
    scope: BadgeScope;
    courseId: string;
    levelId: string;
    criteriaType: BadgeCriteria;
    criteriaValue: string;
    xpReward: string;
    isActive: boolean;
    sortOrder: string;
}

function toBadgeForm(badge: AdminBadgeListItem | null): BadgeForm {
    return {
        code: badge?.code ?? "",
        name: badge?.name ?? "",
        description: badge?.description ?? "",
        iconUrl: badge?.iconUrl ?? null,
        scope: badge?.scope ?? "global",
        courseId: badge?.courseId ?? "",
        levelId: badge?.levelId ?? "",
        criteriaType: badge?.criteriaType ?? "xp_total",
        criteriaValue: badge?.criteriaValue !== null && badge?.criteriaValue !== undefined ? String(badge.criteriaValue) : "",
        xpReward: String(badge?.xpReward ?? 0),
        isActive: badge?.isActive ?? true,
        sortOrder: String(badge?.sortOrder ?? 0),
    };
}

function BadgeDialog({ badge, onClose }: { badge: AdminBadgeListItem | null; onClose: () => void }) {
    const { adminCourses, getAdminCourses, getAdminCourse, createBadge, updateBadge, saving } = useCourse();
    const [form, setForm] = useState<BadgeForm>(() => toBadgeForm(badge));
    const [levels, setLevels] = useState<CourseLevelRecord[]>([]);
    const set = <K extends keyof BadgeForm>(key: K, v: BadgeForm[K]) => setForm((f) => ({ ...f, [key]: v }));
    const criteria = CRITERIA.find((c) => c.value === form.criteriaType)!;

    useEffect(() => {
        if (!adminCourses.length) getAdminCourses({});
    }, [adminCourses.length, getAdminCourses]);

    useEffect(() => {
        if (form.scope !== "level" || !form.courseId) return;
        let cancelled = false;
        getAdminCourse(form.courseId).then((res) => {
            if (!cancelled && res.success && res.data) setLevels(res.data.levels);
        });
        return () => {
            cancelled = true;
        };
    }, [form.scope, form.courseId, getAdminCourse]);

    const submit = async () => {
        if (!/^[a-z0-9_-]+$/.test(form.code.trim().toLowerCase())) return notify({ success: false, message: "Code: lowercase letters, numbers, - and _ only", data: null });
        if (!form.name.trim()) return notify({ success: false, message: "Name is required", data: null });
        if (form.scope !== "global" && !form.courseId) return notify({ success: false, message: "Choose a course", data: null });
        if (form.scope === "level" && !form.levelId) return notify({ success: false, message: "Choose a level", data: null });
        const input: BadgeInput = {
            code: form.code.trim().toLowerCase(),
            name: form.name.trim(),
            description: form.description.trim() || null,
            iconUrl: form.iconUrl,
            scope: form.scope,
            courseId: form.scope === "global" ? null : form.courseId,
            levelId: form.scope === "level" ? form.levelId : null,
            criteriaType: form.criteriaType,
            criteriaValue: criteria.valueLabel && form.criteriaValue.trim() ? Number(form.criteriaValue) : null,
            xpReward: Math.max(0, Number(form.xpReward) || 0),
            isActive: form.isActive,
            sortOrder: Number(form.sortOrder) || 0,
        };
        const res = badge ? await updateBadge(badge.badgeId, input) : await createBadge(input);
        if (notify(res)) onClose();
    };

    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{badge ? "Edit badge" : "New badge"}</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", md: "180px 1fr" } }}>
                    <ImageUploadField label="Icon" value={form.iconUrl} onChange={(v) => set("iconUrl", v)} folder="badges" aspect="1 / 1" />
                    <Stack spacing={2}>
                        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                            <TextField label="Name" value={form.name} onChange={(e) => set("name", e.target.value)} />
                            <TextField label="Code" value={form.code} onChange={(e) => set("code", e.target.value)} helperText="Unique, e.g. first_lab" disabled={Boolean(badge?._count.studentBadges)} />
                        </Box>
                        <TextField label="Description" multiline minRows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
                        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" } }}>
                            <TextField select label="Scope" value={form.scope} onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value as BadgeScope, levelId: "" }))}>
                                <MenuItem value="global">Global</MenuItem>
                                <MenuItem value="course">Course</MenuItem>
                                <MenuItem value="level">Level</MenuItem>
                            </TextField>
                            {form.scope !== "global" && (
                                <TextField select label="Course" value={form.courseId} onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value, levelId: "" }))}>
                                    {adminCourses.map((c) => (
                                        <MenuItem key={c.courseId} value={c.courseId}>
                                            {c.courseName}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                            {form.scope === "level" && (
                                <TextField select label="Level" value={form.levelId} onChange={(e) => set("levelId", e.target.value)} disabled={!form.courseId}>
                                    {levels.map((l) => (
                                        <MenuItem key={l.levelId} value={l.levelId}>
                                            Level {l.levelNo} – {l.title}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        </Box>
                        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr" } }}>
                            <TextField select label="Awarded when" value={form.criteriaType} onChange={(e) => set("criteriaType", e.target.value as BadgeCriteria)}>
                                {CRITERIA.map((c) => (
                                    <MenuItem key={c.value} value={c.value}>
                                        {c.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            {criteria.valueLabel && !(form.scope === "level" && form.criteriaType === "level_completed") && (
                                <TextField label={criteria.valueLabel} type="number" value={form.criteriaValue} onChange={(e) => set("criteriaValue", e.target.value)} helperText="Defaults to 1" />
                            )}
                        </Box>
                        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" } }}>
                            <TextField label="XP reward" type="number" value={form.xpReward} onChange={(e) => set("xpReward", e.target.value)} />
                            <TextField label="Sort order" type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} />
                            <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />} label="Active" />
                        </Box>
                    </Stack>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={submit} disabled={saving}>
                    {badge ? "Save" : "Create badge"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function BadgesManager() {
    const { adminBadges, getAdminBadges, updateBadge, deleteBadge } = useCourse();
    const { confirm, dialog } = useConfirm();
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<{ badge: AdminBadgeListItem | null } | null>(null);

    useEffect(() => {
        getAdminBadges().then(() => setLoading(false));
    }, [getAdminBadges]);

    const criteriaLabel = useMemo(() => new Map(CRITERIA.map((c) => [c.value, c.label])), []);

    const remove = async (badge: AdminBadgeListItem) => {
        if (badge._count.studentBadges) {
            const ok = await confirm({
                title: `${badge._count.studentBadges} student(s) already earned "${badge.name}"`,
                description: "Earned badges can't be deleted. Deactivate it so nobody else earns it?",
                confirmLabel: "Deactivate",
            });
            if (ok) notify(await updateBadge(badge.badgeId, { isActive: false }), "Badge deactivated");
            return;
        }
        if (await confirm({ title: `Delete "${badge.name}"?`, confirmLabel: "Delete", danger: true })) notify(await deleteBadge(badge.badgeId));
    };

    return (
        <GlassCard sx={{ p: 2.5 }}>
            <Stack direction="row" sx={{ alignItems: "center", mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1">Badges</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {'Awarded automatically when a learner meets the rule. Course and level badges count towards that course\'s "Total Badges".'}
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<MdAdd />} onClick={() => setEditing({ badge: null })}>
                    New badge
                </Button>
            </Stack>

            {loading ? (
                <LoadingState />
            ) : !adminBadges.length ? (
                <EmptyState icon={<MdEmojiEvents />} title="No badges yet" description="Reward first labs, perfect quizzes, streaks, finished levels and courses." />
            ) : (
                <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" } }}>
                    {adminBadges.map((badge) => (
                        <Stack
                            key={badge.badgeId}
                            direction="row"
                            spacing={1.5}
                            sx={{ alignItems: "center", p: 1.5, borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", opacity: badge.isActive ? 1 : 0.55 }}
                        >
                            <Avatar src={badge.iconUrl ?? undefined} variant="rounded" sx={{ width: 44, height: 44, bgcolor: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
                                <MdEmojiEvents />
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 700 }} noWrap>
                                    {badge.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" component="div" noWrap>
                                    {criteriaLabel.get(badge.criteriaType)}
                                    {badge.criteriaValue ? ` · ${badge.criteriaValue}` : ""}
                                    {badge.level ? ` · L${badge.level.levelNo} ${badge.level.title}` : badge.course ? ` · ${badge.course.courseName}` : " · all courses"}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {badge.xpReward ? `+${badge.xpReward} XP · ` : ""}
                                    {badge._count.studentBadges} earned
                                </Typography>
                            </Box>
                            <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => setEditing({ badge })}>
                                    <MdEdit />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={badge._count.studentBadges ? "Deactivate" : "Delete"}>
                                <IconButton size="small" color="error" onClick={() => remove(badge)}>
                                    <MdDeleteOutline />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    ))}
                </Box>
            )}
            {editing && <BadgeDialog key={editing.badge?.badgeId ?? "new"} badge={editing.badge} onClose={() => setEditing(null)} />}
            {dialog}
        </GlassCard>
    );
}

export default function GamificationManager() {
    return (
        <Box>
            <PageHeader title="Ranks & Badges" subtitle="How learners level up and what they earn along the way." />
            <CourseAdminNav />
            <Stack spacing={2.5}>
                <RankTiersEditor />
                <BadgesManager />
            </Stack>
        </Box>
    );
}
