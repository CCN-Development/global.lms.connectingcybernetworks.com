"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Save, X } from "lucide-react";
import {
    Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Box,
} from "@mui/material";
import { useBatch, type Batch, type CreateBatchInput, type UpdateBatchInput } from "@/contexts/BatchContext";
import { useContent } from "@/contexts/ContentContext";
import {
    AppDateField, AppNumberField, AppOptionSelect, AppMultiSelect, AppSelect, AppTextField, AppTimeField,
    BRAND, CLASS_TIMING_OPTIONS, DayPicker, MODE_OPTIONS, toDateInput, toTimeInput,
} from "@/components/batches/batch-ui";

/** Accepts both the list and detail batch shapes. */
export type BatchFormSource = Batch & { batchTrainers: { trainer: { trainerId: string } }[] };

type FormState = {
    batchName: string;
    courseId: string;
    trainerIds: string[];
    batchStartDate: string;
    batchEndDate: string;
    batchDays: string[];
    mode: string;
    classStartTime: string;
    classEndTime: string;
    numberOfHoursPerClass: number | "";
    totalSeats: number | "";
    classRoomNumber: string;
    classTiming: string;
    batchLink: string;
    batchDescription: string;
};

const EMPTY_FORM: FormState = {
    batchName: "",
    courseId: "",
    trainerIds: [],
    batchStartDate: "",
    batchEndDate: "",
    batchDays: [],
    mode: "",
    classStartTime: "",
    classEndTime: "",
    numberOfHoursPerClass: "",
    totalSeats: "",
    classRoomNumber: "",
    classTiming: "",
    batchLink: "",
    batchDescription: "",
};

function fromBatch(batch: BatchFormSource): FormState {
    return {
        batchName: batch.batchName,
        courseId: batch.courseId,
        trainerIds: batch.batchTrainers.map((row) => row.trainer.trainerId),
        batchStartDate: toDateInput(batch.batchStartDate),
        batchEndDate: toDateInput(batch.batchEndDate),
        batchDays: batch.batchDays ?? [],
        mode: batch.mode ?? "",
        classStartTime: toTimeInput(batch.classStartTime),
        classEndTime: toTimeInput(batch.classEndTime),
        numberOfHoursPerClass: batch.numberOfHoursPerClass ?? "",
        totalSeats: batch.totalSeats ?? "",
        classRoomNumber: batch.classRoomNumber ?? "",
        classTiming: batch.classTiming ?? "",
        batchLink: batch.batchLink ?? "",
        batchDescription: batch.batchDescription ?? "",
    };
}

export default function BatchFormDialog({
    open,
    onClose,
    batch,
    onSaved,
}: {
    open: boolean;
    onClose: () => void;
    /** Present when editing; omitted when creating. */
    batch?: BatchFormSource | null;
    onSaved: () => void;
}) {
    const { createBatch, updateBatch, branchTrainers, getBranchTrainers } = useBatch();
    const { courses, getCourses } = useContent();

    const isEdit = Boolean(batch);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!open) return;
        setForm(batch ? fromBatch(batch) : EMPTY_FORM);
        if (courses.length === 0) getCourses();
        if (branchTrainers.length === 0) getBranchTrainers();
    }, [open, batch, courses.length, branchTrainers.length, getCourses, getBranchTrainers]);

    const courseOptions = useMemo(
        () => courses.map((c) => ({ id: c.courseId, label: c.courseName, hint: c.durationInMonths ? `${c.durationInMonths} mo` : undefined })),
        [courses],
    );
    const trainerOptions = useMemo(
        () => branchTrainers.filter((t) => t.isActive).map((t) => ({ id: t.trainerId, label: t.trainerName, hint: t.phoneNumber })),
        [branchTrainers],
    );

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const validate = (): string | null => {
        if (!form.batchName.trim()) return "Batch name is required";
        if (!form.courseId) return "Course is required";
        if (!form.batchStartDate) return "Start date is required";
        if (!form.batchEndDate) return "End date is required";
        if (form.batchStartDate > form.batchEndDate) return "Start date must be before end date";
        if (form.batchDays.length === 0) return "Select at least one class day";
        if (!isEdit && form.trainerIds.length === 0) return "Select at least one trainer";
        if (form.classStartTime && form.classEndTime && form.classEndTime <= form.classStartTime) {
            return "Class end time must be after class start time";
        }
        return null;
    };

    const buildPayload = () => ({
        batchName: form.batchName.trim(),
        courseId: form.courseId,
        batchStartDate: form.batchStartDate,
        batchEndDate: form.batchEndDate,
        batchDays: form.batchDays,
        mode: form.mode || undefined,
        classStartTime: form.classStartTime || undefined,
        classEndTime: form.classEndTime || undefined,
        numberOfHoursPerClass: form.numberOfHoursPerClass === "" ? undefined : form.numberOfHoursPerClass,
        totalSeats: form.totalSeats === "" ? null : form.totalSeats,
        classRoomNumber: form.classRoomNumber || undefined,
        classTiming: form.classTiming || undefined,
        batchLink: form.batchLink || undefined,
        batchDescription: form.batchDescription || undefined,
    });

    const submit = async () => {
        const error = validate();
        if (error) {
            toast.error(error);
            return;
        }
        setBusy(true);
        const res = isEdit && batch
            ? await updateBatch(batch.batchId, buildPayload() as UpdateBatchInput)
            : await createBatch({ ...buildPayload(), trainerIds: form.trainerIds } as CreateBatchInput);
        setBusy(false);

        if (!res.success) {
            toast.error(res.message ?? "Failed to save batch");
            return;
        }
        const created = res.data && "totalSessionsCreated" in res.data ? res.data.totalSessionsCreated : null;
        const regenerated = res.data && "sessionsRegenerated" in res.data ? res.data.sessionsRegenerated : null;
        toast.success(
            isEdit
                ? `Batch updated${regenerated ? ` · ${regenerated} sessions rescheduled` : ""}`
                : `Batch created with ${created ?? 0} sessions`,
        );
        onSaved();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={busy ? undefined : onClose}
            fullWidth
            maxWidth="md"
            slotProps={{ paper: { sx: { borderRadius: "12px", border: `1px solid ${BRAND.primary}` } } }}
        >
            <DialogTitle
                sx={{
                    background: `linear-gradient(90deg, ${BRAND.primary} 0%, ${BRAND.violet} 100%)`,
                    color: "#fff", fontSize: "0.95rem", fontWeight: 700, py: 1.5,
                }}
            >
                {isEdit ? "Edit batch" : "Create batch"}
            </DialogTitle>

            <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 }, bgcolor: "#f9fafb" }}>
                <Box className="flex flex-col gap-3 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <AppTextField
                            label="Batch name"
                            value={form.batchName}
                            onChange={(e) => set("batchName", e.target.value)}
                            required
                        />
                        <AppOptionSelect
                            label="Course"
                            value={form.courseId}
                            onChange={(v) => set("courseId", v)}
                            options={courseOptions}
                        />
                    </div>

                    {!isEdit && (
                        <AppMultiSelect
                            label="Trainers"
                            values={form.trainerIds}
                            onChange={(v) => set("trainerIds", v)}
                            options={trainerOptions}
                            color={BRAND.violet}
                        />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <AppDateField label="Start date" value={form.batchStartDate} onChange={(v) => set("batchStartDate", v)} />
                        <AppDateField label="End date" value={form.batchEndDate} onChange={(v) => set("batchEndDate", v)} />
                    </div>

                    <DayPicker values={form.batchDays} onChange={(v) => set("batchDays", v)} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        <AppTimeField label="Class start" value={form.classStartTime} onChange={(v) => set("classStartTime", v)} />
                        <AppTimeField label="Class end" value={form.classEndTime} onChange={(v) => set("classEndTime", v)} />
                        <AppNumberField label="Hours / class" value={form.numberOfHoursPerClass} onChange={(v) => set("numberOfHoursPerClass", v)} min={1} />
                        <AppNumberField label="Total seats" value={form.totalSeats} onChange={(v) => set("totalSeats", v)} min={0} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <AppSelect
                            label="Mode"
                            value={form.mode}
                            onChange={(v) => set("mode", v)}
                            options={MODE_OPTIONS.map((m) => ({ label: m, value: m }))}
                        />
                        <AppTextField label="Class room" value={form.classRoomNumber} onChange={(e) => set("classRoomNumber", e.target.value)} />
                        <AppSelect
                            label="Class timing"
                            value={form.classTiming}
                            onChange={(v) => set("classTiming", v)}
                            options={CLASS_TIMING_OPTIONS.map((t) => ({ label: t, value: t }))}
                        />
                    </div>

                    <AppTextField label="Batch link" value={form.batchLink} onChange={(e) => set("batchLink", e.target.value)} />
                    <AppTextField
                        label="Description"
                        value={form.batchDescription}
                        onChange={(e) => set("batchDescription", e.target.value)}
                        multiline
                        minRows={2}
                    />

                    {isEdit && (
                        <p className="text-[11px] text-gray-500">
                            Changing dates, class days or start time reschedules upcoming sessions. Completed sessions are kept.
                        </p>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: "1px solid #e5e7eb" }}>
                <Button
                    onClick={onClose}
                    disabled={busy}
                    size="small"
                    variant="outlined"
                    startIcon={<X size={12} />}
                    sx={{ textTransform: "none", borderRadius: "8px", fontSize: "0.75rem", borderColor: "#e5e7eb", color: "#374151" }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={submit}
                    disabled={busy}
                    size="small"
                    variant="contained"
                    startIcon={busy ? <CircularProgress size={12} color="inherit" /> : <Save size={12} />}
                    sx={{
                        textTransform: "none", borderRadius: "8px", fontSize: "0.75rem",
                        bgcolor: BRAND.primary, "&:hover": { bgcolor: BRAND.primaryHover },
                    }}
                >
                    {isEdit ? "Save changes" : "Create batch"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
