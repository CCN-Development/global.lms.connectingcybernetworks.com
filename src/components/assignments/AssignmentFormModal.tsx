"use client";

import { useEffect, useState } from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    Switch,
    TextField,
} from "@mui/material";
import { MdClose } from "react-icons/md";
import toast from "react-hot-toast";
import {
    useAssignment,
    type AssignmentDetail,
    type AssignmentListItem,
} from "@/contexts/AssignmentContext";
import { A_BRAND, toISO, toLocalInput } from "./assignment-ui";

type EditableAssignment = Pick<
    AssignmentListItem,
    "batchAssignmentId" | "assignmentTitle" | "assignmentDesc" | "assignmentDueDate" | "maximumMarks" | "isPublished"
>;

export default function AssignmentFormModal({
    open,
    onClose,
    batchId,
    assignment,
    onSaved,
}: {
    open: boolean;
    onClose: () => void;
    batchId: string;
    assignment?: EditableAssignment | null;
    onSaved: (created?: AssignmentDetail) => void;
}) {
    const { createAssignment, updateAssignment, saving } = useAssignment();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [maximumMarks, setMaximumMarks] = useState("");
    const [isPublished, setIsPublished] = useState(true);

    useEffect(() => {
        if (!open) return;
        setTitle(assignment?.assignmentTitle ?? "");
        setDescription(assignment?.assignmentDesc ?? "");
        setDueDate(toLocalInput(assignment?.assignmentDueDate));
        setMaximumMarks(assignment?.maximumMarks != null ? String(assignment.maximumMarks) : "");
        setIsPublished(assignment?.isPublished ?? true);
    }, [open, assignment]);

    const submit = async () => {
        if (!title.trim()) {
            toast.error("Assignment title is required");
            return;
        }
        if (!dueDate) {
            toast.error("Due date is required");
            return;
        }

        const payload = {
            assignmentTitle: title.trim(),
            assignmentDesc: description.trim() || null,
            assignmentDueDate: toISO(dueDate),
            maximumMarks: maximumMarks === "" ? null : Number(maximumMarks),
            isPublished,
        };

        const res = assignment
            ? await updateAssignment(assignment.batchAssignmentId, payload)
            : await createAssignment(batchId, payload);

        if (!res.success) {
            toast.error(res.message ?? "Failed to save assignment");
            return;
        }
        toast.success(assignment ? "Assignment updated" : "Assignment created");
        onSaved(assignment ? undefined : (res.data as AssignmentDetail));
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            slotProps={{ paper: { sx: { borderRadius: 2, border: `1px solid ${A_BRAND.violet}` } } }}
        >
            <DialogTitle
                sx={{
                    background: `linear-gradient(90deg, ${A_BRAND.primary} 0%, ${A_BRAND.violet} 100%)`,
                    color: "#ffffff",
                    fontSize: 16,
                    fontWeight: 800,
                    py: 1.25,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                }}
            >
                <span className="flex-1">{assignment ? "Edit Assignment" : "New Assignment"}</span>
                <IconButton size="small" onClick={onClose} sx={{ color: "#ffffff" }}>
                    <MdClose />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: "16px !important" }}>
                <TextField
                    size="small"
                    fullWidth
                    label="Assignment title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <TextField
                    size="small"
                    fullWidth
                    multiline
                    minRows={3}
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <TextField
                        size="small"
                        fullWidth
                        type="datetime-local"
                        label="Due date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        required
                    />
                    <TextField
                        size="small"
                        fullWidth
                        type="number"
                        label="Maximum marks"
                        value={maximumMarks}
                        onChange={(e) => setMaximumMarks(e.target.value)}
                        helperText="Leave blank to auto-total from tasks"
                    />
                </div>
                <FormControlLabel
                    control={
                        <Switch
                            checked={isPublished}
                            onChange={(e) => setIsPublished(e.target.checked)}
                            sx={{ "& .Mui-checked": { color: A_BRAND.violet } }}
                        />
                    }
                    label={
                        <span className="text-xs font-semibold text-gray-700">
                            {isPublished ? "Visible to students" : "Draft — hidden from students"}
                        </span>
                    }
                />
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} size="small" sx={{ textTransform: "none", color: A_BRAND.muted }}>
                    Cancel
                </Button>
                <Button
                    onClick={submit}
                    disabled={saving}
                    size="small"
                    variant="contained"
                    disableElevation
                    startIcon={saving ? <CircularProgress size={13} color="inherit" /> : undefined}
                    sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: 1.5,
                        backgroundColor: A_BRAND.primary,
                        "&:hover": { backgroundColor: A_BRAND.primaryHover },
                    }}
                >
                    {assignment ? "Save changes" : "Create assignment"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
