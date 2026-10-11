"use client";

import React, { useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    MenuItem,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { useCourse, type CourseInput, type CourseRecord, type CourseTheme, type ProgressionMode } from "@/contexts/CourseContext";
import { ImageUploadField, StringListField, notify } from "./ui";

export const THEME_OPTIONS: { value: CourseTheme; label: string; swatch: string }[] = [
    { value: "violet", label: "Violet", swatch: "#7c3aed" },
    { value: "crimson", label: "Crimson", swatch: "#f43f5e" },
    { value: "amber", label: "Amber", swatch: "#f59e0b" },
    { value: "indigo", label: "Indigo", swatch: "#6366f1" },
    { value: "teal", label: "Teal", swatch: "#06b6d4" },
];

export function slugify(value: string): string {
    return value
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 120);
}

/** Editable copy of the course fields; numbers kept as strings while typing. */
export interface CourseFormState {
    courseName: string;
    slug: string;
    shortTitle: string;
    titleAccent: string;
    tagline: string;
    description: string;
    overview: string[];
    theme: CourseTheme;
    progressionMode: ProgressionMode;
    estimatedWeeksMin: string;
    estimatedWeeksMax: string;
    price: string;
    durationInMonths: string;
    isCertified: boolean;
    emblemUrl: string | null;
    coverUrl: string | null;
    sortOrder: string;
}

export function courseToForm(course?: Partial<CourseRecord> | null): CourseFormState {
    const num = (v: number | null | undefined) => (v === null || v === undefined ? "" : String(v));
    return {
        courseName: course?.courseName ?? "",
        slug: course?.slug ?? "",
        shortTitle: course?.shortTitle ?? "",
        titleAccent: course?.titleAccent ?? "",
        tagline: course?.tagline ?? "",
        description: course?.description ?? "",
        overview: course?.overview ?? [],
        theme: course?.theme ?? "violet",
        progressionMode: course?.progressionMode ?? "sequential",
        estimatedWeeksMin: num(course?.estimatedWeeksMin),
        estimatedWeeksMax: num(course?.estimatedWeeksMax),
        price: num(course?.price),
        durationInMonths: num(course?.durationInMonths),
        isCertified: course?.isCertified ?? false,
        emblemUrl: course?.emblemUrl ?? null,
        coverUrl: course?.coverUrl ?? null,
        sortOrder: num(course?.sortOrder ?? 0),
    };
}

export function formToCourseInput(form: CourseFormState): CourseInput {
    const num = (v: string) => (v.trim() === "" ? null : Number(v));
    const text = (v: string) => (v.trim() === "" ? null : v.trim());
    return {
        courseName: form.courseName.trim(),
        slug: text(form.slug) ? slugify(form.slug) : null,
        shortTitle: text(form.shortTitle),
        titleAccent: text(form.titleAccent),
        tagline: text(form.tagline),
        description: text(form.description),
        overview: form.overview.map((p) => p.trim()).filter(Boolean),
        theme: form.theme,
        progressionMode: form.progressionMode,
        estimatedWeeksMin: num(form.estimatedWeeksMin),
        estimatedWeeksMax: num(form.estimatedWeeksMax),
        price: num(form.price),
        durationInMonths: num(form.durationInMonths),
        isCertified: form.isCertified,
        emblemUrl: form.emblemUrl,
        coverUrl: form.coverUrl,
        sortOrder: Number(form.sortOrder) || 0,
    };
}

export function validateCourseForm(form: CourseFormState): string | null {
    if (!form.courseName.trim()) return "Course name is required";
    const min = form.estimatedWeeksMin ? Number(form.estimatedWeeksMin) : null;
    const max = form.estimatedWeeksMax ? Number(form.estimatedWeeksMax) : null;
    if (min !== null && max !== null && min > max) return "Minimum weeks can't be more than maximum weeks";
    return null;
}

const grid2 = { display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } } as const;

/** All course catalogue fields (used by the create dialog and the Details tab). */
export function CourseDetailsForm({
    value,
    onChange,
    compact = false,
}: {
    value: CourseFormState;
    onChange: (next: CourseFormState) => void;
    compact?: boolean;
}) {
    const set = <K extends keyof CourseFormState>(key: K, v: CourseFormState[K]) => onChange({ ...value, [key]: v });

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box sx={grid2}>
                <TextField
                    label="Course name"
                    required
                    value={value.courseName}
                    onChange={(e) => {
                        const courseName = e.target.value;
                        const autoSlug = !value.slug || value.slug === slugify(value.courseName);
                        onChange({ ...value, courseName, slug: autoSlug ? slugify(courseName) : value.slug });
                    }}
                />
                <TextField
                    label="URL slug"
                    value={value.slug}
                    onChange={(e) => set("slug", e.target.value)}
                    helperText={value.slug ? `/my-courses/${slugify(value.slug)}` : "Used in the student URL"}
                />
                <TextField label="Short title" value={value.shortTitle} onChange={(e) => set("shortTitle", e.target.value)} helperText='e.g. "CCNA"' />
                <TextField
                    label="Title accent"
                    value={value.titleAccent}
                    onChange={(e) => set("titleAccent", e.target.value)}
                    helperText="Trailing words shown in the accent colour"
                />
            </Box>
            <TextField label="Tagline" value={value.tagline} onChange={(e) => set("tagline", e.target.value)} />
            {!compact && (
                <>
                    <TextField
                        label="Short description"
                        value={value.description}
                        multiline
                        minRows={2}
                        onChange={(e) => set("description", e.target.value)}
                        slotProps={{ htmlInput: { maxLength: 1000 } }}
                        helperText={`${value.description.length}/1000 — used in catalogues and packages`}
                    />
                    <StringListField
                        label="Overview paragraphs (course detail page)"
                        value={value.overview}
                        onChange={(v) => set("overview", v)}
                        multiline
                        addLabel="Add paragraph"
                    />
                </>
            )}
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" } }}>
                <TextField select label="Theme" value={value.theme} onChange={(e) => set("theme", e.target.value as CourseTheme)}>
                    {THEME_OPTIONS.map((t) => (
                        <MenuItem key={t.value} value={t.value}>
                            <Box component="span" sx={{ display: "inline-block", width: 12, height: 12, borderRadius: "4px", bgcolor: t.swatch, mr: 1 }} />
                            {t.label}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    label="Progression"
                    value={value.progressionMode}
                    onChange={(e) => set("progressionMode", e.target.value as ProgressionMode)}
                >
                    <MenuItem value="sequential">Sequential levels</MenuItem>
                    <MenuItem value="free">Free navigation</MenuItem>
                </TextField>
                <TextField label="Weeks (min)" type="number" value={value.estimatedWeeksMin} onChange={(e) => set("estimatedWeeksMin", e.target.value)} />
                <TextField label="Weeks (max)" type="number" value={value.estimatedWeeksMax} onChange={(e) => set("estimatedWeeksMax", e.target.value)} />
                <TextField label="Price (₹)" type="number" value={value.price} onChange={(e) => set("price", e.target.value)} />
                <TextField label="Duration (months)" type="number" value={value.durationInMonths} onChange={(e) => set("durationInMonths", e.target.value)} />
                <TextField label="Sort order" type="number" value={value.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} />
                <FormControlLabel
                    control={<Switch checked={value.isCertified} onChange={(e) => set("isCertified", e.target.checked)} />}
                    label="Certified"
                />
            </Box>
            {!compact && (
                <Box sx={grid2}>
                    <ImageUploadField label="Emblem (hexagon badge)" value={value.emblemUrl} onChange={(v) => set("emblemUrl", v)} folder="course-emblems" aspect="1 / 1" />
                    <ImageUploadField label="Cover art" value={value.coverUrl} onChange={(v) => set("coverUrl", v)} folder="course-covers" />
                </Box>
            )}
        </Box>
    );
}

/** "New course" dialog — creates a draft and hands back the record. */
export function CreateCourseDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (course: CourseRecord) => void }) {
    const { createCourse, saving } = useCourse();
    const [form, setForm] = useState<CourseFormState>(() => courseToForm());
    const [error, setError] = useState<string | null>(null);

    const submit = async () => {
        const problem = validateCourseForm(form);
        setError(problem);
        if (problem) return;
        const res = await createCourse(formToCourseInput(form));
        if (notify(res) && res.data) {
            setForm(courseToForm());
            onCreated(res.data);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>New course</DialogTitle>
            <DialogContent dividers>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Courses start as drafts. Add levels, modules and lessons in the builder, then publish.
                </Typography>
                <CourseDetailsForm value={form} onChange={setForm} compact />
                {error && (
                    <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={submit} disabled={saving}>
                    Create course
                </Button>
            </DialogActions>
        </Dialog>
    );
}
