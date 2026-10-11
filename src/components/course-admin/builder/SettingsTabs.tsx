"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Autocomplete,
    Avatar,
    Box,
    Button,
    Chip,
    IconButton,
    Radio,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { MdCloudUpload, MdDeleteOutline, MdPlayArrow, MdSave, MdVideoLibrary } from "react-icons/md";
import { useCourse, type AdminCourseListItem, type AdminCourseTree, type InstructorListItem } from "@/contexts/CourseContext";
import { CourseDetailsForm, courseToForm, formToCourseInput, validateCourseForm, type CourseFormState } from "../CourseForm";
import { COURSE_ADMIN_BASE, GlassCard, MoveButtons, StatusChip, formatDuration, moveId, notify } from "../ui";
import { VideoPickerDialog, VideoPlayerDialog, VideoUploadDialog } from "../videos/VideoDialogs";

/* ───────────────────────────── details ───────────────────────────── */

export function DetailsTab({ course }: { course: AdminCourseTree }) {
    const { updateCourse, saving } = useCourse();
    const [form, setForm] = useState<CourseFormState>(() => courseToForm(course));
    const [error, setError] = useState<string | null>(null);

    const save = async () => {
        const problem = validateCourseForm(form);
        setError(problem);
        if (!problem) notify(await updateCourse(course.courseId, formToCourseInput(form)));
    };

    return (
        <GlassCard sx={{ p: { xs: 2, md: 3 } }}>
            <CourseDetailsForm value={form} onChange={setForm} />
            <Stack direction="row" spacing={2} sx={{ alignItems: "center", mt: 3 }}>
                <Button variant="contained" startIcon={<MdSave />} onClick={save} disabled={saving}>
                    Save details
                </Button>
                <Button color="inherit" onClick={() => setForm(courseToForm(course))} disabled={saving}>
                    Reset
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

/* ───────────────────────────── setup ───────────────────────────── */

interface InstructorLink {
    instructorId: string;
    isLead: boolean;
}

export function SetupTab({
    course,
    instructors,
    allCourses,
}: {
    course: AdminCourseTree;
    instructors: InstructorListItem[];
    allCourses: AdminCourseListItem[];
}) {
    const { setCourseTrailer, setCourseInstructors, setCoursePrerequisites, saving } = useCourse();
    const [picking, setPicking] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [links, setLinks] = useState<InstructorLink[]>(() =>
        course.courseInstructors.map((ci) => ({ instructorId: ci.instructorId, isLead: ci.isLead }))
    );
    const [prereqs, setPrereqs] = useState<string[]>(() => course.prerequisites.map((p) => p.requiredCourseId));

    const trailer = course.trailerVideo;
    const byId = new Map(instructors.map((i) => [i.instructorId, i]));
    const otherCourses = allCourses.filter((c) => c.courseId !== course.courseId);

    const saveInstructors = async () => {
        const ordered = links.some((l) => l.isLead) ? links : links.map((l, i) => ({ ...l, isLead: i === 0 }));
        notify(await setCourseInstructors(course.courseId, ordered.map((l, i) => ({ ...l, sortOrder: i }))));
    };

    return (
        <Stack spacing={2.5}>
            <GlassCard sx={{ p: 2.5 }}>
                <Typography variant="subtitle1">Course trailer</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                    Shown as &quot;Watch the trailer&quot; on the course overview.
                </Typography>
                {trailer ? (
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ alignItems: { sm: "center" } }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                                {trailer.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {formatDuration(trailer.durationSec)}
                            </Typography>
                        </Box>
                        <StatusChip status={trailer.videoStatus} />
                        <Button size="small" variant="outlined" startIcon={<MdPlayArrow />} disabled={trailer.videoStatus !== "ready"} onClick={() => setPreviewing(true)}>
                            Preview
                        </Button>
                        <Button size="small" variant="outlined" startIcon={<MdVideoLibrary />} onClick={() => setPicking(true)}>
                            Replace
                        </Button>
                        <Button size="small" color="error" onClick={async () => notify(await setCourseTrailer(course.courseId, null), "Trailer removed")}>
                            Remove
                        </Button>
                    </Stack>
                ) : (
                    <Stack direction="row" spacing={1}>
                        <Button variant="contained" startIcon={<MdCloudUpload />} onClick={() => setUploading(true)}>
                            Upload trailer
                        </Button>
                        <Button variant="outlined" startIcon={<MdVideoLibrary />} onClick={() => setPicking(true)}>
                            Choose from library
                        </Button>
                    </Stack>
                )}
            </GlassCard>

            <GlassCard sx={{ p: 2.5 }}>
                <Stack direction="row" sx={{ alignItems: "center", mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1">Instructors</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Shown on the course overview. Pick the lead instructor with the radio button.
                        </Typography>
                    </Box>
                    <Button size="small" component={Link} href={`${COURSE_ADMIN_BASE}/instructors`}>
                        Manage instructors
                    </Button>
                </Stack>
                <Stack spacing={1} sx={{ mb: 2 }}>
                    {links.map((link, index) => {
                        const instructor = byId.get(link.instructorId);
                        return (
                            <Stack key={link.instructorId} direction="row" spacing={1.5} sx={{ alignItems: "center", p: 1, borderRadius: "12px", bgcolor: "rgba(255,255,255,0.03)" }}>
                                <Tooltip title="Lead instructor">
                                    <Radio
                                        size="small"
                                        checked={link.isLead}
                                        onChange={() => setLinks(links.map((l) => ({ ...l, isLead: l.instructorId === link.instructorId })))}
                                    />
                                </Tooltip>
                                <Avatar src={instructor?.avatarUrl ?? undefined} sx={{ width: 32, height: 32 }}>
                                    {instructor?.name?.[0]}
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                                        {instructor?.name ?? "Unknown instructor"}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" noWrap component="div">
                                        {instructor?.designation ?? ""}
                                    </Typography>
                                </Box>
                                {link.isLead && <Chip size="small" label="Lead" color="primary" variant="outlined" />}
                                <MoveButtons
                                    onUp={() => setLinks(moveId(links.map((l) => l.instructorId), index, -1).map((id) => links.find((l) => l.instructorId === id)!))}
                                    onDown={() => setLinks(moveId(links.map((l) => l.instructorId), index, 1).map((id) => links.find((l) => l.instructorId === id)!))}
                                    disableUp={index === 0}
                                    disableDown={index === links.length - 1}
                                />
                                <IconButton size="small" color="error" onClick={() => setLinks(links.filter((l) => l.instructorId !== link.instructorId))}>
                                    <MdDeleteOutline />
                                </IconButton>
                            </Stack>
                        );
                    })}
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <Autocomplete
                        sx={{ flex: 1 }}
                        options={instructors.filter((i) => i.isActive && !links.some((l) => l.instructorId === i.instructorId))}
                        getOptionLabel={(i) => `${i.name}${i.designation ? ` — ${i.designation}` : ""}`}
                        value={null}
                        onChange={(_, picked) => picked && setLinks([...links, { instructorId: picked.instructorId, isLead: links.length === 0 }])}
                        renderInput={(params) => <TextField {...params} size="small" label="Add instructor" />}
                    />
                    <Button variant="contained" startIcon={<MdSave />} onClick={saveInstructors} disabled={saving}>
                        Save instructors
                    </Button>
                </Stack>
            </GlassCard>

            <GlassCard sx={{ p: 2.5 }}>
                <Typography variant="subtitle1">Prerequisites</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                    Students see this course as &quot;Mission Locked&quot; until they complete every course listed here.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <Autocomplete
                        multiple
                        sx={{ flex: 1 }}
                        options={otherCourses.map((c) => c.courseId)}
                        value={prereqs}
                        onChange={(_, value) => setPrereqs(value)}
                        getOptionLabel={(id) => otherCourses.find((c) => c.courseId === id)?.courseName ?? course.prerequisites.find((p) => p.requiredCourseId === id)?.requiredCourse.courseName ?? id}
                        renderInput={(params) => <TextField {...params} size="small" label="Required courses" />}
                    />
                    <Button variant="contained" startIcon={<MdSave />} disabled={saving} onClick={async () => notify(await setCoursePrerequisites(course.courseId, prereqs))}>
                        Save
                    </Button>
                </Stack>
            </GlassCard>

            <VideoPickerDialog
                open={picking}
                selectedId={trailer?.videoId}
                onClose={() => setPicking(false)}
                onSelect={async (video) => {
                    setPicking(false);
                    notify(await setCourseTrailer(course.courseId, video.videoId));
                }}
            />
            <VideoUploadDialog
                open={uploading}
                onClose={() => setUploading(false)}
                onUploaded={async (video) => notify(await setCourseTrailer(course.courseId, video.videoId), "Trailer attached")}
            />
            <VideoPlayerDialog videoId={previewing && trailer ? trailer.videoId : null} title={trailer?.title} onClose={() => setPreviewing(false)} />
        </Stack>
    );
}
