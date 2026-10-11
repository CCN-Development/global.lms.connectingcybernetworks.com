"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Drawer,
    FormControlLabel,
    IconButton,
    MenuItem,
    Stack,
    Switch,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";
import { MdClose, MdCloudUpload, MdLinkOff, MdPlayArrow, MdRefresh, MdSave, MdVideoLibrary } from "react-icons/md";
import { useCourse, type AdminLessonDetail, type ContentBlock, type ContentStatus } from "@/contexts/CourseContext";
import { GlassCard, KindIcon, LoadingState, StatusChip, formatDuration, kindLabel, notify, useConfirm } from "../ui";
import { VideoPickerDialog, VideoPlayerDialog, VideoUploadDialog } from "../videos/VideoDialogs";
import ContentBlocksEditor, { cleanBlocks, validateBlocks } from "./ContentBlocksEditor";
import QuizEditor from "./QuizEditor";
import LabEditor from "./LabEditor";

/* ───────────────────────────── details ───────────────────────────── */

function LessonDetailsForm({ lesson }: { lesson: AdminLessonDetail }) {
    const { updateLesson, saving } = useCourse();
    const [form, setForm] = useState(() => ({
        title: lesson.title,
        xp: String(lesson.xp),
        minutes: String(Math.floor(lesson.durationSec / 60)),
        seconds: String(lesson.durationSec % 60),
        isMandatory: lesson.isMandatory,
        isFreePreview: lesson.isFreePreview,
        lessonStatus: lesson.lessonStatus,
    }));
    const set = <K extends keyof typeof form>(key: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: v }));
    const isVideo = lesson.kind === "video";

    const save = async () => {
        if (!form.title.trim()) return notify({ success: false, message: "Title is required", data: null });
        notify(
            await updateLesson(lesson.lessonId, {
                title: form.title.trim(),
                xp: Math.max(0, Number(form.xp) || 0),
                durationSec: Math.max(0, (Number(form.minutes) || 0) * 60 + (Number(form.seconds) || 0)),
                isMandatory: form.isMandatory,
                isFreePreview: form.isFreePreview,
                lessonStatus: form.lessonStatus,
            })
        );
    };

    return (
        <GlassCard sx={{ p: 2.5 }}>
            <Stack spacing={2}>
                <TextField label="Title" value={form.title} onChange={(e) => set("title", e.target.value)} />
                <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" } }}>
                    <TextField
                        label={lesson.kind === "quiz" ? "XP at 100%" : lesson.kind === "lab" ? "XP (before penalty)" : "XP"}
                        type="number"
                        value={form.xp}
                        onChange={(e) => set("xp", e.target.value)}
                    />
                    <TextField label="Minutes" type="number" value={form.minutes} disabled={isVideo} onChange={(e) => set("minutes", e.target.value)} />
                    <TextField label="Seconds" type="number" value={form.seconds} disabled={isVideo} onChange={(e) => set("seconds", e.target.value)} />
                    <TextField select label="Status" value={form.lessonStatus} onChange={(e) => set("lessonStatus", e.target.value as ContentStatus)}>
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                        <MenuItem value="archived">Archived</MenuItem>
                    </TextField>
                </Box>
                {isVideo && (
                    <Typography variant="caption" color="text.secondary">
                        Video duration is taken from Cloudflare automatically once the video is ready.
                    </Typography>
                )}
                <Stack direction="row" spacing={3} sx={{ flexWrap: "wrap" }}>
                    <FormControlLabel
                        control={<Switch checked={form.isMandatory} onChange={(e) => set("isMandatory", e.target.checked)} />}
                        label="Counts towards progress"
                    />
                    <FormControlLabel
                        control={<Switch checked={form.isFreePreview} onChange={(e) => set("isFreePreview", e.target.checked)} />}
                        label="Free preview (ignores level locks)"
                    />
                </Stack>
                <Box>
                    <Button variant="contained" startIcon={<MdSave />} onClick={save} disabled={saving}>
                        Save details
                    </Button>
                </Box>
            </Stack>
        </GlassCard>
    );
}

/* ───────────────────────────── video ───────────────────────────── */

function VideoLessonPanel({ lesson }: { lesson: AdminLessonDetail }) {
    const { setLessonVideo, syncVideo, saving } = useCourse();
    const { confirm, dialog } = useConfirm();
    const [picking, setPicking] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [threshold, setThreshold] = useState(String(lesson.completionThresholdPct));
    const video = lesson.video;

    const detach = async () => {
        if (await confirm({ title: "Detach this video?", description: "The video stays in the library.", confirmLabel: "Detach" })) {
            notify(await setLessonVideo(lesson.lessonId, { videoId: null }), "Video detached");
        }
    };

    return (
        <Stack spacing={2.5}>
            <GlassCard sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Lesson video
                </Typography>
                {video ? (
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", p: 1.5, borderRadius: "14px", bgcolor: "rgba(255,255,255,0.03)" }}>
                            <KindIcon kind="video" />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                                    {video.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {formatDuration(video.durationSec)} · {video.requireSignedUrls ? "signed playback" : "public playback"}
                                    {video.errorReasonCode ? ` · ${video.errorReasonCode}` : ""}
                                </Typography>
                            </Box>
                            <StatusChip status={video.videoStatus} />
                        </Stack>
                        {video.videoStatus !== "ready" && (
                            <Typography variant="caption" color="warning.main">
                                Students can play this lesson once Cloudflare finishes processing. The course can&apos;t be published until the video is ready.
                            </Typography>
                        )}
                        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }} useFlexGap>
                            <Button variant="outlined" startIcon={<MdPlayArrow />} disabled={video.videoStatus !== "ready"} onClick={() => setPreviewing(true)}>
                                Preview
                            </Button>
                            <Button variant="outlined" startIcon={<MdRefresh />} disabled={saving} onClick={async () => notify(await syncVideo(video.videoId))}>
                                Sync status
                            </Button>
                            <Button variant="outlined" startIcon={<MdVideoLibrary />} onClick={() => setPicking(true)}>
                                Replace from library
                            </Button>
                            <Button variant="outlined" startIcon={<MdCloudUpload />} onClick={() => setUploading(true)}>
                                Upload new
                            </Button>
                            <Button color="error" startIcon={<MdLinkOff />} onClick={detach}>
                                Detach
                            </Button>
                        </Stack>
                    </Stack>
                ) : (
                    <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
                        <Typography variant="body2" color="text.secondary">
                            No video attached yet.
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Button variant="contained" startIcon={<MdCloudUpload />} onClick={() => setUploading(true)}>
                                Upload video
                            </Button>
                            <Button variant="outlined" startIcon={<MdVideoLibrary />} onClick={() => setPicking(true)}>
                                Choose from library
                            </Button>
                        </Stack>
                    </Stack>
                )}
            </GlassCard>

            <GlassCard sx={{ p: 2.5 }}>
                <Typography variant="subtitle1">Completion rule</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                    The lesson completes when this share of the video has actually been watched (seeking ahead doesn&apos;t count).
                </Typography>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <TextField
                        size="small"
                        type="number"
                        label="Watch threshold (%)"
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.value)}
                        slotProps={{ htmlInput: { min: 10, max: 100 } }}
                        sx={{ width: 200 }}
                    />
                    <Button
                        variant="outlined"
                        disabled={saving || !video}
                        onClick={async () =>
                            notify(
                                await setLessonVideo(lesson.lessonId, {
                                    videoId: video?.videoId ?? null,
                                    completionThresholdPct: Math.min(100, Math.max(10, Number(threshold) || 90)),
                                }),
                                "Completion rule saved"
                            )
                        }
                    >
                        Save
                    </Button>
                </Stack>
            </GlassCard>

            <VideoPickerDialog
                open={picking}
                selectedId={video?.videoId}
                onClose={() => setPicking(false)}
                onSelect={async (picked) => {
                    setPicking(false);
                    notify(await setLessonVideo(lesson.lessonId, { videoId: picked.videoId }));
                }}
            />
            <VideoUploadDialog open={uploading} lessonId={lesson.lessonId} onClose={() => setUploading(false)} />
            <VideoPlayerDialog videoId={previewing && video ? video.videoId : null} title={video?.title} onClose={() => setPreviewing(false)} />
            {dialog}
        </Stack>
    );
}

/* ───────────────────────────── theory ───────────────────────────── */

function TheoryPanel({ lesson }: { lesson: AdminLessonDetail }) {
    const { setLessonTheory, saving } = useCourse();
    const [blocks, setBlocks] = useState<ContentBlock[]>(() => lesson.theoryBlocks ?? []);
    const [error, setError] = useState<string | null>(null);

    const save = async () => {
        const problem = blocks.length ? validateBlocks(blocks) : "Add at least one block";
        setError(problem);
        if (!problem) notify(await setLessonTheory(lesson.lessonId, cleanBlocks(blocks)));
    };

    return (
        <GlassCard sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Reading content
            </Typography>
            <ContentBlocksEditor value={blocks} onChange={setBlocks} />
            <Stack direction="row" spacing={2} sx={{ alignItems: "center", mt: 2 }}>
                <Button variant="contained" startIcon={<MdSave />} onClick={save} disabled={saving}>
                    Save content
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

/* ───────────────────────────── drawer ───────────────────────────── */

const CONTENT_TAB_LABEL = { video: "Video", theory: "Reading", quiz: "Quiz", lab: "Lab" } as const;

/** Right-hand editor for one lesson: details + kind-specific content. */
export default function LessonEditorDrawer({ lessonId, onClose }: { lessonId: string | null; onClose: () => void }) {
    const { adminLesson, getAdminLesson } = useCourse();
    const [tab, setTab] = useState<"content" | "details">("content");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!lessonId) return;
        let cancelled = false;
        getAdminLesson(lessonId).then((res) => {
            if (!cancelled) setError(res.success ? null : (res.message ?? "Failed to load the lesson"));
        });
        return () => {
            cancelled = true;
        };
    }, [lessonId, getAdminLesson]);

    const lesson = adminLesson && adminLesson.lessonId === lessonId ? adminLesson : null;

    return (
        <Drawer anchor="right" open={Boolean(lessonId)} onClose={onClose} slotProps={{ paper: { sx: { width: { xs: "100%", md: 820 } } } }}>
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", p: 2.5, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {lesson && <KindIcon kind={lesson.kind} />}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" noWrap sx={{ fontSize: 18 }}>
                            {lesson?.title ?? "Lesson"}
                        </Typography>
                        {lesson && (
                            <Typography variant="caption" color="text.secondary">
                                {kindLabel(lesson.kind)} · {lesson.xp} XP · {formatDuration(lesson.durationSec)} · {lesson._count.lessonProgresses} learner
                                {lesson._count.lessonProgresses === 1 ? "" : "s"} started
                            </Typography>
                        )}
                    </Box>
                    {lesson && <StatusChip status={lesson.lessonStatus} />}
                    <IconButton onClick={onClose} aria-label="Close">
                        <MdClose />
                    </IconButton>
                </Stack>

                {lesson && (
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2.5, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        <Tab value="content" label={CONTENT_TAB_LABEL[lesson.kind]} />
                        <Tab value="details" label="Details" />
                    </Tabs>
                )}

                <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
                    {error ? (
                        <Typography color="error">{error}</Typography>
                    ) : !lesson ? (
                        <LoadingState label="Loading lesson…" />
                    ) : tab === "details" ? (
                        <LessonDetailsForm key={lesson.lessonId} lesson={lesson} />
                    ) : lesson.kind === "video" ? (
                        <VideoLessonPanel key={lesson.lessonId} lesson={lesson} />
                    ) : lesson.kind === "theory" ? (
                        <TheoryPanel key={lesson.lessonId} lesson={lesson} />
                    ) : lesson.kind === "quiz" ? (
                        <QuizEditor key={lesson.lessonId} lesson={lesson} />
                    ) : (
                        <LabEditor key={lesson.lessonId} lesson={lesson} />
                    )}
                </Box>
            </Box>
        </Drawer>
    );
}
