"use client";

import React, { useState } from "react";
import {
    Autocomplete,
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
    Typography,
} from "@mui/material";
import { MdClose, MdVideoLibrary } from "react-icons/md";
import {
    useCourse,
    type AdminTreeLevel,
    type AdminTreeModule,
    type AdminTreeSection,
    type CardType,
    type CreatedLesson,
    type CreatedModule,
    type InstructorListItem,
    type LessonKind,
} from "@/contexts/CourseContext";
import { ImageUploadField, KindIcon, StringListField, kindLabel, notify } from "../ui";
import { VideoPickerDialog } from "../videos/VideoDialogs";

export const CARD_LESSON_KIND: Record<Exclude<CardType, "module">, LessonKind> = { video: "video", reading: "theory", quiz: "quiz", lab: "lab" };
export const DEFAULT_XP: Record<LessonKind, number> = { video: 12, theory: 8, quiz: 100, lab: 150 };
const DEFAULT_MINUTES: Record<LessonKind, number> = { video: 0, theory: 5, quiz: 10, lab: 30 };

const CARD_TYPES: { value: CardType; label: string; hint: string }[] = [
    { value: "module", label: "Module", hint: "Sections with videos, reading, quizzes and labs" },
    { value: "video", label: "Video card", hint: "A single video lesson" },
    { value: "reading", label: "Reading card", hint: "A single theory lesson" },
    { value: "quiz", label: "Knowledge check", hint: "A single quiz" },
    { value: "lab", label: "Lab card", hint: "A single hands-on lab" },
];

/* ───────────────────────────── level ───────────────────────────── */

export function LevelDialog({ courseId, level, onClose }: { courseId: string; level: AdminTreeLevel | null; onClose: () => void }) {
    const { createLevel, updateLevel, saving } = useCourse();
    const [form, setForm] = useState({ title: level?.title ?? "", description: level?.description ?? "", isPublished: level?.isPublished ?? false });

    const submit = async () => {
        if (!form.title.trim()) return notify({ success: false, message: "Title is required", data: null });
        const input = { title: form.title.trim(), description: form.description.trim() || null, isPublished: form.isPublished };
        const res = level ? await updateLevel(level.levelId, input) : await createLevel(courseId, input);
        if (notify(res)) onClose();
    };

    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{level ? `Edit level ${level.levelNo}` : "New level"}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField autoFocus label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Networking Fundamentals" />
                    <TextField label="Description" multiline minRows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    <FormControlLabel
                        control={<Switch checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />}
                        label="Visible to students"
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={submit} disabled={saving}>
                    {level ? "Save" : "Create level"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ───────────────────────────── module / card ───────────────────────────── */

export function ModuleDialog({
    levelId,
    module,
    instructors,
    onClose,
}: {
    levelId: string;
    module: AdminTreeModule | null;
    instructors: InstructorListItem[];
    onClose: () => void;
}) {
    const { createModule, updateModule, setModuleInstructors, createLesson, saving } = useCourse();
    const [form, setForm] = useState({
        cardType: (module?.cardType ?? "module") as CardType,
        title: module?.title ?? "",
        titleAccent: module?.titleAccent ?? "",
        overview: module?.overview ?? [],
        thumbnailUrl: module?.thumbnailUrl ?? null,
        introVideo: module?.introVideo ? { videoId: module.introVideo.videoId, title: module.introVideo.title } : null,
        isPublished: module?.isPublished ?? false,
        xp: String(DEFAULT_XP.video),
        instructorIds: module?.moduleInstructors.map((mi) => mi.instructorId) ?? [],
    });
    const [picking, setPicking] = useState(false);
    const set = <K extends keyof typeof form>(key: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: v }));
    const single = form.cardType !== "module";

    const submit = async () => {
        if (!form.title.trim()) return notify({ success: false, message: "Title is required", data: null });
        const input = {
            title: form.title.trim(),
            titleAccent: form.titleAccent.trim() || null,
            overview: form.overview.map((p) => p.trim()).filter(Boolean),
            thumbnailUrl: form.thumbnailUrl,
            introVideoId: form.introVideo?.videoId ?? null,
            isPublished: form.isPublished,
        };
        const res = module ? await updateModule(module.moduleId, input) : await createModule(levelId, { ...input, cardType: form.cardType });
        if (!notify(res) || !res.data) return;

        const moduleId = res.data.moduleId;
        const before = module?.moduleInstructors.map((mi) => mi.instructorId) ?? [];
        if (form.instructorIds.join() !== before.join()) {
            notify(await setModuleInstructors(moduleId, form.instructorIds.map((instructorId, i) => ({ instructorId, isLead: i === 0, sortOrder: i }))));
        }
        // A single-lesson card is only useful with its lesson, so create it right away.
        const firstSection = !module && single ? (res.data as CreatedModule).sections?.[0] : undefined;
        if (firstSection) {
            const kind = CARD_LESSON_KIND[form.cardType as Exclude<CardType, "module">];
            notify(
                await createLesson(firstSection.sectionId, {
                    kind,
                    title: form.title.trim(),
                    xp: Math.max(0, Number(form.xp) || 0),
                    durationSec: DEFAULT_MINUTES[kind] * 60,
                    publish: form.isPublished,
                })
            );
        }
        onClose();
    };

    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{module ? "Edit card" : "New card"}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5}>
                    {!module ? (
                        <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", sm: "repeat(5, 1fr)" } }}>
                            {CARD_TYPES.map((t) => (
                                <Box
                                    key={t.value}
                                    onClick={() => set("cardType", t.value)}
                                    sx={{
                                        p: 1.5,
                                        borderRadius: "14px",
                                        cursor: "pointer",
                                        border: `1px solid ${form.cardType === t.value ? "#5B7CFF" : "rgba(255,255,255,0.08)"}`,
                                        bgcolor: form.cardType === t.value ? "rgba(91,124,255,0.1)" : "rgba(255,255,255,0.02)",
                                    }}
                                >
                                    <KindIcon kind={t.value} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
                                        {t.label}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {t.hint}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                            <KindIcon kind={module.cardType} />
                            <Typography variant="body2" color="text.secondary">
                                {kindLabel(module.cardType)} — the card type can&apos;t be changed after creation.
                            </Typography>
                        </Stack>
                    )}

                    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" } }}>
                        <TextField autoFocus label="Title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Explain Computer" />
                        <TextField label="Title accent" value={form.titleAccent} onChange={(e) => set("titleAccent", e.target.value)} placeholder="Hardware" />
                    </Box>
                    {!module && single && (
                        <TextField
                            label="Lesson XP"
                            type="number"
                            value={form.xp}
                            onChange={(e) => set("xp", e.target.value)}
                            sx={{ maxWidth: 200 }}
                            helperText="The card's lesson is created with this XP"
                        />
                    )}
                    {form.cardType === "module" && (
                        <StringListField label="Overview paragraphs (module page)" value={form.overview} onChange={(v) => set("overview", v)} multiline addLabel="Add paragraph" />
                    )}

                    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
                        <ImageUploadField label="Card thumbnail" value={form.thumbnailUrl} onChange={(v) => set("thumbnailUrl", v)} folder="module-thumbnails" />
                        <Stack spacing={2}>
                            {form.cardType === "module" && (
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Intro video (module hero)
                                    </Typography>
                                    {form.introVideo ? (
                                        <Chip label={form.introVideo.title} onDelete={() => set("introVideo", null)} icon={<MdVideoLibrary />} />
                                    ) : (
                                        <Button variant="outlined" size="small" startIcon={<MdVideoLibrary />} onClick={() => setPicking(true)}>
                                            Choose video
                                        </Button>
                                    )}
                                </Box>
                            )}
                            <Autocomplete
                                multiple
                                options={instructors.map((i) => i.instructorId)}
                                value={form.instructorIds}
                                onChange={(_, value) => set("instructorIds", value)}
                                getOptionLabel={(id) => instructors.find((i) => i.instructorId === id)?.name ?? "Unknown"}
                                renderInput={(params) => <TextField {...params} label="Instructors" helperText="First one is shown as the lead" />}
                            />
                            <FormControlLabel
                                control={<Switch checked={form.isPublished} onChange={(e) => set("isPublished", e.target.checked)} />}
                                label="Visible to students"
                            />
                        </Stack>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={submit} disabled={saving}>
                    {module ? "Save" : "Create card"}
                </Button>
            </DialogActions>
            <VideoPickerDialog
                open={picking}
                selectedId={form.introVideo?.videoId}
                onClose={() => setPicking(false)}
                onSelect={(video) => {
                    set("introVideo", { videoId: video.videoId, title: video.title });
                    setPicking(false);
                }}
            />
        </Dialog>
    );
}

/* ───────────────────────────── section ───────────────────────────── */

export function SectionDialog({ moduleId, section, onClose }: { moduleId: string; section: AdminTreeSection | null; onClose: () => void }) {
    const { createSection, updateSection, saving } = useCourse();
    const [form, setForm] = useState({ eyebrow: section?.eyebrow ?? "", title: section?.title ?? "" });

    const submit = async () => {
        if (!form.title.trim()) return notify({ success: false, message: "Title is required", data: null });
        const input = { eyebrow: form.eyebrow.trim() || null, title: form.title.trim() };
        const res = section ? await updateSection(section.sectionId, input) : await createSection(moduleId, input);
        if (notify(res)) onClose();
    };

    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{section ? "Edit section" : "New section"}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField label="Eyebrow" value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} placeholder="TASK 1" helperText="Small caps label above the title (optional)" />
                    <TextField autoFocus label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Computer Hardware" />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={submit} disabled={saving}>
                    {section ? "Save" : "Create section"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ───────────────────────────── lesson ───────────────────────────── */

export function LessonCreateDialog({
    sectionId,
    allowedKinds,
    onClose,
    onCreated,
}: {
    sectionId: string;
    allowedKinds: LessonKind[];
    onClose: () => void;
    onCreated: (lesson: CreatedLesson) => void;
}) {
    const { createLesson, saving } = useCourse();
    const [form, setForm] = useState(() => {
        const kind = allowedKinds[0];
        return { kind, title: "", xp: String(DEFAULT_XP[kind]), minutes: String(DEFAULT_MINUTES[kind]), isMandatory: true, isFreePreview: false, publish: true };
    });
    const set = <K extends keyof typeof form>(key: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: v }));

    const submit = async () => {
        if (!form.title.trim()) return notify({ success: false, message: "Title is required", data: null });
        const res = await createLesson(sectionId, {
            kind: form.kind,
            title: form.title.trim(),
            xp: Math.max(0, Number(form.xp) || 0),
            durationSec: Math.max(0, Math.round((Number(form.minutes) || 0) * 60)),
            isMandatory: form.isMandatory,
            isFreePreview: form.isFreePreview,
            publish: form.publish,
        });
        if (notify(res) && res.data) onCreated(res.data);
    };

    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>New lesson</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        select
                        label="Type"
                        value={form.kind}
                        disabled={allowedKinds.length === 1}
                        onChange={(e) => {
                            const kind = e.target.value as LessonKind;
                            setForm((f) => ({ ...f, kind, xp: String(DEFAULT_XP[kind]), minutes: String(DEFAULT_MINUTES[kind]) }));
                        }}
                    >
                        {allowedKinds.map((k) => (
                            <MenuItem key={k} value={k}>
                                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                    <KindIcon kind={k} size={16} />
                                    <span>{kindLabel(k)}</span>
                                </Stack>
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField autoFocus label="Title" value={form.title} onChange={(e) => set("title", e.target.value)} />
                    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr" }}>
                        <TextField label={form.kind === "quiz" ? "XP at 100%" : "XP"} type="number" value={form.xp} onChange={(e) => set("xp", e.target.value)} />
                        <TextField
                            label="Estimated minutes"
                            type="number"
                            value={form.minutes}
                            disabled={form.kind === "video"}
                            helperText={form.kind === "video" ? "Taken from the uploaded video" : "Used for goal projections"}
                            onChange={(e) => set("minutes", e.target.value)}
                        />
                    </Box>
                    <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
                        <FormControlLabel control={<Switch checked={form.publish} onChange={(e) => set("publish", e.target.checked)} />} label="Published" />
                        <FormControlLabel control={<Switch checked={form.isMandatory} onChange={(e) => set("isMandatory", e.target.checked)} />} label="Counts towards progress" />
                        <FormControlLabel control={<Switch checked={form.isFreePreview} onChange={(e) => set("isFreePreview", e.target.checked)} />} label="Free preview" />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                        After creating, add the {kindLabel(form.kind).toLowerCase()} content in the lesson editor.
                    </Typography>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={submit} disabled={saving}>
                    Create & edit content
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ───────────────────────────── move ───────────────────────────── */

export interface MoveOption {
    value: string;
    label: string;
    group?: string;
}

export function MoveDialog({ title, options, onClose, onMove }: { title: string; options: MoveOption[]; onClose: () => void; onMove: (value: string) => Promise<void> }) {
    const [value, setValue] = useState<string>("");
    const [busy, setBusy] = useState(false);

    return (
        <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
            <Stack direction="row" sx={{ alignItems: "center", pr: 1 }}>
                <DialogTitle sx={{ flex: 1 }}>{title}</DialogTitle>
                <IconButton onClick={onClose} aria-label="Close">
                    <MdClose />
                </IconButton>
            </Stack>
            <DialogContent>
                {options.length ? (
                    <TextField select fullWidth label="Destination" value={value} onChange={(e) => setValue(e.target.value)} sx={{ mt: 1 }}>
                        {options.map((o) => (
                            <MenuItem key={o.value} value={o.value}>
                                {o.group ? `${o.group} › ${o.label}` : o.label}
                            </MenuItem>
                        ))}
                    </TextField>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        There is nowhere else to move this to yet.
                    </Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    disabled={!value || busy}
                    onClick={async () => {
                        setBusy(true);
                        await onMove(value);
                        setBusy(false);
                    }}
                >
                    Move
                </Button>
            </DialogActions>
        </Dialog>
    );
}
