"use client";

import { useEffect, useState } from "react";
import {
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Typography,
} from "@mui/material";
import { MdClose } from "react-icons/md";
import toast from "react-hot-toast";
import {
    useAssignment,
    type AssignmentTask,
    type TaskDocumentInput,
} from "@/contexts/AssignmentContext";
import FileDropzone from "./FileDropzone";
import { A_BRAND, toISO, toLocalInput } from "./assignment-ui";

export default function TaskFormModal({
    open,
    onClose,
    assignmentId,
    task,
    nextOrder,
    onSaved,
}: {
    open: boolean;
    onClose: () => void;
    assignmentId: string;
    task?: AssignmentTask | null;
    nextOrder: number;
    onSaved: () => void;
}) {
    const { addTask, updateTask, saving } = useAssignment();

    const [title, setTitle] = useState("");
    const [objective, setObjective] = useState("");
    const [instructions, setInstructions] = useState("");
    const [deliverables, setDeliverables] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [estimatedMinutes, setEstimatedMinutes] = useState("");
    const [maximumMarks, setMaximumMarks] = useState("");
    const [tools, setTools] = useState<string[]>([]);
    const [links, setLinks] = useState<string[]>([]);
    const [documents, setDocuments] = useState<TaskDocumentInput[]>([]);

    useEffect(() => {
        if (!open) return;
        setTitle(task?.taskTitle ?? `Task ${nextOrder}`);
        setObjective(task?.taskObjective ?? "");
        setInstructions(task?.taskDescription ?? "");
        setDeliverables(task?.deliverables ?? "");
        setDueDate(toLocalInput(task?.taskDueDate));
        setEstimatedMinutes(task?.estimatedTimeToComplete != null ? String(task.estimatedTimeToComplete) : "");
        setMaximumMarks(task?.maximumMarks != null ? String(task.maximumMarks) : "");
        setTools(task?.tools ?? []);
        setLinks(task?.referenceLinks ?? []);
        setDocuments(
            (task?.referenceDocumentsInTasks ?? []).map((doc) => ({
                documentName: doc.documentName,
                documentType: doc.documentType,
                documentUrl: doc.documentUrl,
            }))
        );
    }, [open, task, nextOrder]);

    const submit = async () => {
        if (!title.trim()) {
            toast.error("Task title is required");
            return;
        }
        if (!dueDate) {
            toast.error("Task due date is required");
            return;
        }

        const payload = {
            taskTitle: title.trim(),
            taskObjective: objective.trim() || null,
            taskDescription: instructions.trim() || null,
            deliverables: deliverables.trim() || null,
            taskDueDate: toISO(dueDate),
            estimatedTimeToComplete: estimatedMinutes === "" ? null : Number(estimatedMinutes),
            maximumMarks: maximumMarks === "" ? null : Number(maximumMarks),
            tools,
            referenceLinks: links,
            referenceDocuments: documents,
            ...(task ? {} : { taskOrder: nextOrder }),
        };

        const res = task ? await updateTask(task.taskId, payload) : await addTask(assignmentId, payload);

        if (!res.success) {
            toast.error(res.message ?? "Failed to save task");
            return;
        }
        toast.success(task ? "Task updated" : "Task added");
        onSaved();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            slotProps={{ paper: { sx: { borderRadius: 2, border: `1px solid ${A_BRAND.cyan}` } } }}
        >
            <DialogTitle
                sx={{
                    background: `linear-gradient(90deg, ${A_BRAND.cyan} 0%, ${A_BRAND.violet} 100%)`,
                    color: "#ffffff",
                    fontSize: 16,
                    fontWeight: 800,
                    py: 1.25,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                }}
            >
                <span className="flex-1">{task ? "Edit Task" : "Add Task"}</span>
                <IconButton size="small" onClick={onClose} sx={{ color: "#ffffff" }}>
                    <MdClose />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: "16px !important" }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <TextField
                        size="small"
                        fullWidth
                        label="Task title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        sx={{ gridColumn: { sm: "span 2" } }}
                    />
                    <TextField
                        size="small"
                        fullWidth
                        type="datetime-local"
                        label="Task due date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        required
                    />
                </div>

                <TextField
                    size="small"
                    fullWidth
                    multiline
                    minRows={2}
                    label="Task objective"
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                />
                <TextField
                    size="small"
                    fullWidth
                    multiline
                    minRows={3}
                    label="Instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                />
                <TextField
                    size="small"
                    fullWidth
                    multiline
                    minRows={2}
                    label="Deliverables"
                    value={deliverables}
                    onChange={(e) => setDeliverables(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <TextField
                        size="small"
                        fullWidth
                        type="number"
                        label="Estimated time (minutes)"
                        value={estimatedMinutes}
                        onChange={(e) => setEstimatedMinutes(e.target.value)}
                    />
                    <TextField
                        size="small"
                        fullWidth
                        type="number"
                        label="Maximum marks"
                        value={maximumMarks}
                        onChange={(e) => setMaximumMarks(e.target.value)}
                    />
                </div>

                <Autocomplete
                    multiple
                    freeSolo
                    size="small"
                    options={[] as string[]}
                    value={tools}
                    onChange={(_, value) => setTools(value as string[])}
                    slotProps={{
                        chip: {
                            size: "small",
                            sx: { backgroundColor: A_BRAND.cyanBg, color: A_BRAND.sky, fontWeight: 600 },
                        },
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Tools" placeholder="Type and press Enter" />
                    )}
                />

                <Autocomplete
                    multiple
                    freeSolo
                    size="small"
                    options={[] as string[]}
                    value={links}
                    onChange={(_, value) => setLinks(value as string[])}
                    slotProps={{
                        chip: {
                            size: "small",
                            sx: { backgroundColor: A_BRAND.violetBg, color: A_BRAND.violet, fontWeight: 600 },
                        },
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Reference links" placeholder="Paste a URL and press Enter" />
                    )}
                />

                <Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 800, color: A_BRAND.text, mb: 0.75 }}>
                        Reference documents
                    </Typography>
                    <FileDropzone
                        files={documents}
                        onChange={setDocuments}
                        dirName="lms-assignments/task-references"
                        hint="PDF, DOCX, PPTX, XLSX, ZIP · Max 10 MB per file"
                    />
                </Box>
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
                    {task ? "Save task" : "Add task"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
