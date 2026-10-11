"use client";

import React, { useEffect, useState } from "react";
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
    InputAdornment,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { MdAdd, MdDeleteOutline, MdEdit, MdOutlinePersonOutline, MdSearch } from "react-icons/md";
import { useCourse, type InstructorListItem } from "@/contexts/CourseContext";
import { CourseAdminNav, EmptyState, GlassCard, ImageUploadField, LoadingState, PageHeader, notify, useConfirm } from "./ui";

function InstructorDialog({ instructor, onClose }: { instructor: InstructorListItem | null; onClose: () => void }) {
    const { createInstructor, updateInstructor, saving } = useCourse();
    const [form, setForm] = useState({
        name: instructor?.name ?? "",
        designation: instructor?.designation ?? "",
        avatarUrl: instructor?.avatarUrl ?? null,
        bio: instructor?.bio ?? "",
        isActive: instructor?.isActive ?? true,
    });

    const submit = async () => {
        if (!form.name.trim()) return notify({ success: false, message: "Name is required", data: null });
        const input = {
            name: form.name.trim(),
            designation: form.designation.trim() || null,
            avatarUrl: form.avatarUrl,
            bio: form.bio.trim() || null,
            isActive: form.isActive,
        };
        const res = instructor ? await updateInstructor(instructor.instructorId, input) : await createInstructor(input);
        if (notify(res)) onClose();
    };

    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{instructor ? "Edit instructor" : "New instructor"}</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", sm: "160px 1fr" } }}>
                    <ImageUploadField label="Photo" value={form.avatarUrl} onChange={(v) => setForm({ ...form, avatarUrl: v })} folder="instructors" aspect="1 / 1" />
                    <Stack spacing={2}>
                        <TextField autoFocus label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        <TextField label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="Senior Security Manager" />
                        <TextField label="Bio" multiline minRows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                        <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />} label="Active" />
                    </Stack>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={submit} disabled={saving}>
                    {instructor ? "Save" : "Create"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default function InstructorsManager() {
    const { instructors, getInstructors, deleteInstructor } = useCourse();
    const { confirm, dialog } = useConfirm();
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<{ instructor: InstructorListItem | null } | null>(null);

    useEffect(() => {
        const timer = setTimeout(async () => {
            await getInstructors(q.trim());
            setLoading(false);
        }, 250);
        return () => clearTimeout(timer);
    }, [q, getInstructors]);

    const remove = async (instructor: InstructorListItem) => {
        const used = instructor._count.courseInstructors + instructor._count.moduleInstructors;
        const ok = await confirm({
            title: `Delete ${instructor.name}?`,
            description: used ? `They are linked to ${used} course/module${used > 1 ? "s" : ""}; those links are removed too. Consider deactivating instead.` : undefined,
            confirmLabel: "Delete",
            danger: true,
        });
        if (ok) notify(await deleteInstructor(instructor.instructorId));
    };

    return (
        <Box>
            <PageHeader
                title="Instructors"
                subtitle="Public profiles shown on course overviews and module pages."
                actions={
                    <Button variant="contained" startIcon={<MdAdd />} onClick={() => setEditing({ instructor: null })}>
                        New instructor
                    </Button>
                }
            />
            <CourseAdminNav />

            <TextField
                size="small"
                placeholder="Search instructors"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                sx={{ mb: 2.5, width: { xs: "100%", sm: 420 } }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><MdSearch /></InputAdornment> } }}
            />

            {loading ? (
                <LoadingState />
            ) : !instructors.length ? (
                <EmptyState
                    icon={<MdOutlinePersonOutline />}
                    title="No instructors yet"
                    description="Create instructor profiles, then assign them to courses (Trailer, instructors & access tab) and to modules."
                    action={
                        <Button variant="contained" startIcon={<MdAdd />} onClick={() => setEditing({ instructor: null })}>
                            New instructor
                        </Button>
                    }
                />
            ) : (
                <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" } }}>
                    {instructors.map((instructor) => (
                        <GlassCard key={instructor.instructorId} sx={{ p: 2, opacity: instructor.isActive ? 1 : 0.6 }}>
                            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                                <Avatar src={instructor.avatarUrl ?? undefined} sx={{ width: 52, height: 52 }}>
                                    {instructor.name[0]}
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontWeight: 700 }} noWrap>
                                        {instructor.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                        {instructor.designation ?? "—"}
                                    </Typography>
                                </Box>
                                <Tooltip title="Edit">
                                    <IconButton size="small" onClick={() => setEditing({ instructor })}>
                                        <MdEdit />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                    <IconButton size="small" color="error" onClick={() => remove(instructor)}>
                                        <MdDeleteOutline />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                            {instructor.bio && (
                                <Typography variant="body2" sx={{ mt: 1.5, color: "rgba(245,246,250,0.8)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                    {instructor.bio}
                                </Typography>
                            )}
                            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap" }} useFlexGap>
                                <Chip size="small" variant="outlined" label={`${instructor._count.courseInstructors} course${instructor._count.courseInstructors === 1 ? "" : "s"}`} />
                                <Chip size="small" variant="outlined" label={`${instructor._count.moduleInstructors} module${instructor._count.moduleInstructors === 1 ? "" : "s"}`} />
                                {instructor.trainer && <Chip size="small" color="info" variant="outlined" label={`Trainer: ${instructor.trainer.trainerName}`} />}
                                {!instructor.isActive && <Chip size="small" label="Inactive" />}
                            </Stack>
                        </GlassCard>
                    ))}
                </Box>
            )}

            {editing && <InstructorDialog key={editing.instructor?.instructorId ?? "new"} instructor={editing.instructor} onClose={() => setEditing(null)} />}
            {dialog}
        </Box>
    );
}
