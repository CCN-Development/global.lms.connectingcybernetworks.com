"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    LinearProgress,
    MenuItem,
    Paper,
    Skeleton,
    TextField,
    Typography,
} from "@mui/material";
import {
    MdClose,
    MdInsertDriveFile,
    MdOutlineAssignmentTurnedIn,
    MdOutlineDescription,
    MdOutlineHistory,
    MdOutlineLink,
    MdOutlineOpenInNew,
    MdOutlineSchedule,
    MdOutlineTaskAlt,
} from "react-icons/md";
import toast from "react-hot-toast";
import {
    useAssignment,
    type AssignmentTaskWithSubmission,
    type FeedbackGrade,
    type StudentSubmissionReviewResult,
    type TaskSubmissionStatus,
} from "@/contexts/AssignmentContext";
import {
    A_BRAND,
    EmptyState,
    GRADE_OPTIONS,
    GRADE_TONE,
    NOT_SUBMITTED_TONE,
    PROGRESS_STATUS_TONE,
    REVIEW_STATUS_OPTIONS,
    SUBMISSION_STATUS_TONE,
    ToneChip,
    formatDate,
    formatDateTime,
    formatDuration,
    formatFileSize,
} from "./assignment-ui";

type ReviewStatus = Exclude<TaskSubmissionStatus, "submitted">;

function initials(name: string): string {
    return name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <Typography
            sx={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: A_BRAND.muted,
                mb: 0.5,
            }}
        >
            {children}
        </Typography>
    );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.6, borderBottom: `1px solid ${A_BRAND.border}` }}>
            <Typography sx={{ fontSize: 12, color: A_BRAND.muted, minWidth: 108, flexShrink: 0 }}>{label}</Typography>
            <Box sx={{ flex: 1, minWidth: 0 }}>{value}</Box>
        </Box>
    );
}

export default function ReviewSubmissionModal({
    open,
    onClose,
    assignmentId,
    studentId,
    onReviewed,
}: {
    open: boolean;
    onClose: () => void;
    assignmentId: string;
    studentId: string | null;
    onReviewed: () => void;
}) {
    const { getStudentSubmission, reviewTaskSubmission, reviewAssignmentSubmission, saving } = useAssignment();

    const [data, setData] = useState<StudentSubmissionReviewResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

    const [status, setStatus] = useState<ReviewStatus>("approved");
    const [marks, setMarks] = useState("");
    const [grade, setGrade] = useState<FeedbackGrade | "">("");
    const [feedback, setFeedback] = useState("");

    const [overallGrade, setOverallGrade] = useState<FeedbackGrade | "">("");
    const [overallFeedback, setOverallFeedback] = useState("");

    const load = useCallback(async () => {
        if (!studentId) return;
        setLoading(true);
        const res = await getStudentSubmission(assignmentId, studentId);
        setLoading(false);
        if (!res.success || !res.data) {
            toast.error(res.message ?? "Failed to load submission");
            return;
        }
        const result = res.data;
        setData(result);
        setOverallGrade(result.overall.feedbackGrade ?? "");
        setOverallFeedback(result.overall.feedback ?? "");
        setActiveTaskId((prev) => prev ?? result.tasks[0]?.taskId ?? null);
    }, [assignmentId, studentId, getStudentSubmission]);

    useEffect(() => {
        if (!open || !studentId) return;
        setActiveTaskId(null);
        load();
    }, [open, studentId, load]);

    const activeTask: AssignmentTaskWithSubmission | null = useMemo(() => {
        if (!data) return null;
        return data.tasks.find((task) => task.taskId === activeTaskId) ?? data.tasks[0] ?? null;
    }, [data, activeTaskId]);

    useEffect(() => {
        const submission = activeTask?.submission;
        setStatus((submission?.submissionStatus === "submitted" ? "under_review" : submission?.submissionStatus) ?? "approved");
        setMarks(submission?.marks != null ? String(submission.marks) : "");
        setGrade(submission?.feedbackGrade ?? "");
        setFeedback(submission?.feedback ?? "");
    }, [activeTask]);

    const submitReview = async () => {
        if (!activeTask?.submission) return;
        const maxMarks = activeTask.maximumMarks;
        if (marks !== "" && maxMarks != null && Number(marks) > maxMarks) {
            toast.error(`Marks cannot exceed ${maxMarks}`);
            return;
        }
        const res = await reviewTaskSubmission(activeTask.submission.taskSubmissionId, {
            submissionStatus: status,
            marks: marks === "" ? null : Number(marks),
            feedbackGrade: grade === "" ? null : grade,
            feedback: feedback.trim() || null,
        });
        if (!res.success) {
            toast.error(res.message ?? "Failed to save review");
            return;
        }
        toast.success("Review saved");
        await load();
        onReviewed();
    };

    const submitOverall = async () => {
        if (!studentId) return;
        const res = await reviewAssignmentSubmission(assignmentId, studentId, {
            feedbackGrade: overallGrade === "" ? null : overallGrade,
            feedback: overallFeedback.trim() || null,
        });
        if (!res.success) {
            toast.error(res.message ?? "Failed to save feedback");
            return;
        }
        toast.success("Assignment feedback saved");
        await load();
        onReviewed();
    };

    const progress =
        data && data.overall.totalTasks > 0
            ? Math.round((data.overall.approvedTasks / data.overall.totalTasks) * 100)
            : 0;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="lg"
            slotProps={{ paper: { sx: { borderRadius: 2, border: `1px solid ${A_BRAND.violet}` } } }}
        >
            <DialogTitle
                sx={{
                    background: `linear-gradient(90deg, ${A_BRAND.primary} 0%, ${A_BRAND.violet} 100%)`,
                    color: "#ffffff",
                    py: 1.25,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                }}
            >
                <Avatar sx={{ width: 34, height: 34, fontSize: 13, fontWeight: 800, backgroundColor: "#ffffff", color: A_BRAND.violet }}>
                    {data ? initials(data.student.studentName) : "--"}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }} noWrap>
                        {data?.student.studentName ?? "Review submission"}
                    </Typography>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 500 }} noWrap>
                        {data?.assignment.assignmentTitle ?? "--"}
                    </Typography>
                </Box>
                <IconButton size="small" onClick={onClose} sx={{ color: "#ffffff" }}>
                    <MdClose />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: { xs: 1.5, sm: 2 }, backgroundColor: "#f8fafc" }}>
                {loading && !data ? (
                    <div className="flex flex-col gap-2">
                        <Skeleton variant="rounded" height={72} />
                        <Skeleton variant="rounded" height={320} />
                    </div>
                ) : !data ? (
                    <EmptyState label="Submission could not be loaded." icon={<MdOutlineAssignmentTurnedIn />} />
                ) : (
                    <div className="flex flex-col gap-2 sm:gap-3">
                        {/* Overall progress bar */}
                        <Paper
                            elevation={0}
                            sx={{ borderRadius: 2, border: `1px solid ${A_BRAND.primary}`, backgroundColor: "#ffffff", p: 1.5 }}
                        >
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <ToneChip tone={PROGRESS_STATUS_TONE[data.overall.progressStatus]} />
                                <Chip
                                    size="small"
                                    label={`${data.overall.approvedTasks}/${data.overall.totalTasks} tasks approved`}
                                    sx={{ backgroundColor: A_BRAND.violetBg, color: A_BRAND.violet, fontWeight: 700, fontSize: 11, height: 22 }}
                                />
                                <Chip
                                    size="small"
                                    label={`${data.overall.obtainedMarks} / ${data.overall.totalMarks} marks`}
                                    sx={{ backgroundColor: A_BRAND.emeraldBg, color: A_BRAND.emerald, fontWeight: 700, fontSize: 11, height: 22 }}
                                />
                                {data.overall.feedbackGrade && <ToneChip tone={GRADE_TONE[data.overall.feedbackGrade]} />}
                                <Box sx={{ flex: 1 }} />
                                <Typography sx={{ fontSize: 11.5, color: A_BRAND.muted, fontWeight: 600 }}>
                                    Due {formatDate(data.assignment.assignmentDueDate)}
                                </Typography>
                            </div>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{
                                    height: 7,
                                    borderRadius: 4,
                                    backgroundColor: A_BRAND.slateBg,
                                    "& .MuiLinearProgress-bar": { backgroundColor: A_BRAND.emerald, borderRadius: 4 },
                                }}
                            />
                        </Paper>

                        <div className="grid grid-cols-1 lg:grid-cols-[210px_1fr_320px] gap-2 sm:gap-3">
                            {/* Task list */}
                            <Paper
                                elevation={0}
                                sx={{ borderRadius: 2, border: `1px solid ${A_BRAND.cyan}`, backgroundColor: "#ffffff", p: 1 }}
                            >
                                <SectionLabel>Tasks</SectionLabel>
                                <div className="flex lg:flex-col gap-1 overflow-x-auto">
                                    {data.tasks.map((task) => {
                                        const tone = task.submission
                                            ? SUBMISSION_STATUS_TONE[task.submission.submissionStatus]
                                            : NOT_SUBMITTED_TONE;
                                        const isActive = task.taskId === activeTask?.taskId;
                                        return (
                                            <Box
                                                key={task.taskId}
                                                onClick={() => setActiveTaskId(task.taskId)}
                                                sx={{
                                                    cursor: "pointer",
                                                    borderRadius: 1.5,
                                                    border: `1px solid ${isActive ? A_BRAND.violet : A_BRAND.border}`,
                                                    backgroundColor: isActive ? A_BRAND.violetBg : "#ffffff",
                                                    px: 1,
                                                    py: 0.75,
                                                    minWidth: 150,
                                                    transition: "background-color .15s, border-color .15s",
                                                    "&:hover": { backgroundColor: A_BRAND.violetBg },
                                                }}
                                            >
                                                <Typography sx={{ fontSize: 12, fontWeight: 700, color: A_BRAND.text }} noWrap>
                                                    {task.taskOrder}. {task.taskTitle}
                                                </Typography>
                                                <Box sx={{ mt: 0.5 }}>
                                                    <ToneChip tone={tone} />
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </div>
                            </Paper>

                            {/* Task overview */}
                            <Paper
                                elevation={0}
                                sx={{ borderRadius: 2, border: `1px solid ${A_BRAND.primary}`, backgroundColor: "#ffffff", p: { xs: 1.25, sm: 1.75 } }}
                            >
                                {!activeTask ? (
                                    <EmptyState label="No tasks in this assignment yet." icon={<MdOutlineTaskAlt />} />
                                ) : (
                                    <>
                                        <Typography sx={{ fontSize: 15, fontWeight: 800, color: A_BRAND.text, mb: 1 }}>
                                            {activeTask.taskTitle} Overview
                                        </Typography>

                                        {activeTask.taskObjective && (
                                            <Box sx={{ mb: 1.25 }}>
                                                <SectionLabel>Task Objective</SectionLabel>
                                                <Typography sx={{ fontSize: 12.5, color: A_BRAND.text, whiteSpace: "pre-wrap" }}>
                                                    {activeTask.taskObjective}
                                                </Typography>
                                            </Box>
                                        )}
                                        {activeTask.taskDescription && (
                                            <Box sx={{ mb: 1.25 }}>
                                                <SectionLabel>Instructions</SectionLabel>
                                                <Typography sx={{ fontSize: 12.5, color: A_BRAND.text, whiteSpace: "pre-wrap" }}>
                                                    {activeTask.taskDescription}
                                                </Typography>
                                            </Box>
                                        )}
                                        {activeTask.deliverables && (
                                            <Box sx={{ mb: 1.25 }}>
                                                <SectionLabel>Deliverables</SectionLabel>
                                                <Typography sx={{ fontSize: 12.5, color: A_BRAND.text, whiteSpace: "pre-wrap" }}>
                                                    {activeTask.deliverables}
                                                </Typography>
                                            </Box>
                                        )}

                                        {activeTask.tools.length > 0 && (
                                            <Box sx={{ mb: 1.25 }}>
                                                <SectionLabel>Tools</SectionLabel>
                                                <div className="flex flex-wrap gap-1">
                                                    {activeTask.tools.map((tool) => (
                                                        <Chip
                                                            key={tool}
                                                            size="small"
                                                            label={tool}
                                                            sx={{ backgroundColor: A_BRAND.cyanBg, color: A_BRAND.sky, fontWeight: 600, fontSize: 11, height: 22 }}
                                                        />
                                                    ))}
                                                </div>
                                            </Box>
                                        )}

                                        {activeTask.referenceDocumentsInTasks.length > 0 && (
                                            <Box sx={{ mb: 1.25 }}>
                                                <SectionLabel>Reference documents</SectionLabel>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                    {activeTask.referenceDocumentsInTasks.map((doc) => (
                                                        <Box
                                                            key={doc.referenceDocumentId}
                                                            component="a"
                                                            href={doc.documentUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            sx={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 1,
                                                                borderRadius: 1.5,
                                                                border: `1px solid ${A_BRAND.border}`,
                                                                p: 0.9,
                                                                textDecoration: "none",
                                                                "&:hover": { borderColor: A_BRAND.primary },
                                                            }}
                                                        >
                                                            <MdOutlineDescription size={18} color={A_BRAND.rose} />
                                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                                <Typography sx={{ fontSize: 12, fontWeight: 700, color: A_BRAND.text }} noWrap>
                                                                    {doc.documentName}
                                                                </Typography>
                                                                <Typography sx={{ fontSize: 10.5, color: A_BRAND.muted, textTransform: "uppercase" }}>
                                                                    {doc.documentType}
                                                                </Typography>
                                                            </Box>
                                                            <MdOutlineOpenInNew size={14} color={A_BRAND.muted} />
                                                        </Box>
                                                    ))}
                                                </div>
                                            </Box>
                                        )}

                                        {activeTask.referenceLinks.length > 0 && (
                                            <Box>
                                                <SectionLabel>Reference links</SectionLabel>
                                                <div className="flex flex-wrap gap-1">
                                                    {activeTask.referenceLinks.map((link) => (
                                                        <Chip
                                                            key={link}
                                                            size="small"
                                                            icon={<MdOutlineLink size={13} />}
                                                            label={link}
                                                            component="a"
                                                            href={link}
                                                            target="_blank"
                                                            clickable
                                                            sx={{ backgroundColor: A_BRAND.violetBg, color: A_BRAND.violet, fontWeight: 600, fontSize: 11, height: 22, maxWidth: 260 }}
                                                        />
                                                    ))}
                                                </div>
                                            </Box>
                                        )}
                                    </>
                                )}
                            </Paper>

                            {/* Right rail */}
                            <div className="flex flex-col gap-2 sm:gap-3">
                                <Paper
                                    elevation={0}
                                    sx={{ borderRadius: 2, border: `1px solid ${A_BRAND.sky}`, backgroundColor: "#ffffff", p: 1.5 }}
                                >
                                    <Typography sx={{ fontSize: 14, fontWeight: 800, color: A_BRAND.text, mb: 0.75 }}>
                                        Basic Details
                                    </Typography>
                                    <DetailRow label="Assignment due" value={<span className="text-xs font-semibold">{formatDate(data.assignment.assignmentDueDate)}</span>} />
                                    <DetailRow label="Task due date" value={<span className="text-xs font-semibold">{formatDate(activeTask?.taskDueDate ?? null)}</span>} />
                                    <DetailRow
                                        label="Estimated time"
                                        value={<span className="text-xs font-semibold">{formatDuration(activeTask?.estimatedTimeToComplete)}</span>}
                                    />
                                    <DetailRow
                                        label="Max marks"
                                        value={<span className="text-xs font-semibold">{activeTask?.maximumMarks ?? "--"}</span>}
                                    />
                                    <DetailRow
                                        label="Status"
                                        value={
                                            <ToneChip
                                                tone={
                                                    activeTask?.submission
                                                        ? SUBMISSION_STATUS_TONE[activeTask.submission.submissionStatus]
                                                        : NOT_SUBMITTED_TONE
                                                }
                                            />
                                        }
                                    />
                                    {activeTask?.submission && (
                                        <DetailRow
                                            label="Submitted on"
                                            value={
                                                <span className="text-xs font-semibold">
                                                    {formatDateTime(activeTask.submission.submissionDate)}
                                                    {activeTask.submission.isLate && (
                                                        <Chip
                                                            size="small"
                                                            label="Late"
                                                            sx={{ ml: 0.75, height: 18, fontSize: 10, fontWeight: 700, backgroundColor: A_BRAND.roseBg, color: A_BRAND.rose }}
                                                        />
                                                    )}
                                                </span>
                                            }
                                        />
                                    )}
                                </Paper>

                                {/* Student submission */}
                                <Paper
                                    elevation={0}
                                    sx={{ borderRadius: 2, border: `1px solid ${A_BRAND.violet}`, backgroundColor: "#ffffff", p: 1.5 }}
                                >
                                    <Typography sx={{ fontSize: 14, fontWeight: 800, color: A_BRAND.text, mb: 0.75 }}>
                                        Student Submission
                                    </Typography>

                                    {!activeTask?.submission ? (
                                        <Typography sx={{ fontSize: 12, color: A_BRAND.muted }}>
                                            This student has not submitted this task yet.
                                        </Typography>
                                    ) : (
                                        <div className="flex flex-col gap-1.5">
                                            {activeTask.submission.submissionDocuments.map((doc) => (
                                                <Box
                                                    key={doc.submissionDocumentId}
                                                    component="a"
                                                    href={doc.documentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                        borderRadius: 1.5,
                                                        border: `1px solid ${A_BRAND.border}`,
                                                        p: 0.9,
                                                        textDecoration: "none",
                                                        "&:hover": { borderColor: A_BRAND.violet },
                                                    }}
                                                >
                                                    <MdInsertDriveFile size={18} color={A_BRAND.violet} />
                                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: A_BRAND.text }} noWrap>
                                                            {doc.documentName}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: 10.5, color: A_BRAND.muted }}>
                                                            {formatFileSize(doc.fileSizeInBytes)}
                                                        </Typography>
                                                    </Box>
                                                    <MdOutlineOpenInNew size={14} color={A_BRAND.muted} />
                                                </Box>
                                            ))}

                                            {activeTask.submission.submissionLink && (
                                                <Chip
                                                    size="small"
                                                    icon={<MdOutlineLink size={13} />}
                                                    label={activeTask.submission.submissionLink}
                                                    component="a"
                                                    href={activeTask.submission.submissionLink}
                                                    target="_blank"
                                                    clickable
                                                    sx={{ backgroundColor: A_BRAND.skyBg, color: A_BRAND.sky, fontWeight: 600, fontSize: 11, height: 24, justifyContent: "flex-start" }}
                                                />
                                            )}

                                            {activeTask.submission.submissionNote && (
                                                <Box sx={{ borderRadius: 1.5, border: `1px solid ${A_BRAND.border}`, p: 1 }}>
                                                    <SectionLabel>Student note</SectionLabel>
                                                    <Typography sx={{ fontSize: 12, color: A_BRAND.text, whiteSpace: "pre-wrap" }}>
                                                        {activeTask.submission.submissionNote}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </div>
                                    )}
                                </Paper>

                                {/* Review form */}
                                {activeTask?.submission && (
                                    <Paper
                                        elevation={0}
                                        sx={{ borderRadius: 2, border: `1px solid ${A_BRAND.emerald}`, backgroundColor: "#ffffff", p: 1.5 }}
                                    >
                                        <Typography sx={{ fontSize: 14, fontWeight: 800, color: A_BRAND.text, mb: 1 }}>
                                            Review Task
                                        </Typography>
                                        <div className="flex flex-col gap-1.5">
                                            <TextField
                                                select
                                                size="small"
                                                fullWidth
                                                label="Status"
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value as ReviewStatus)}
                                            >
                                                {REVIEW_STATUS_OPTIONS.map((option) => (
                                                    <MenuItem key={option.value} value={option.value} sx={{ fontSize: 13 }}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </TextField>

                                            <div className="grid grid-cols-2 gap-1.5">
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    label={`Marks${activeTask.maximumMarks != null ? ` / ${activeTask.maximumMarks}` : ""}`}
                                                    value={marks}
                                                    onChange={(e) => setMarks(e.target.value)}
                                                />
                                                <TextField
                                                    select
                                                    size="small"
                                                    label="Grade"
                                                    value={grade}
                                                    onChange={(e) => setGrade(e.target.value as FeedbackGrade | "")}
                                                >
                                                    <MenuItem value="" sx={{ fontSize: 13 }}>None</MenuItem>
                                                    {GRADE_OPTIONS.map((option) => (
                                                        <MenuItem key={option.value} value={option.value} sx={{ fontSize: 13 }}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </div>

                                            <TextField
                                                size="small"
                                                fullWidth
                                                multiline
                                                minRows={3}
                                                label="Feedback"
                                                value={feedback}
                                                onChange={(e) => setFeedback(e.target.value)}
                                            />

                                            <Button
                                                onClick={submitReview}
                                                disabled={saving}
                                                size="small"
                                                variant="contained"
                                                disableElevation
                                                startIcon={saving ? <CircularProgress size={13} color="inherit" /> : <MdOutlineAssignmentTurnedIn size={15} />}
                                                sx={{
                                                    textTransform: "none",
                                                    fontWeight: 700,
                                                    borderRadius: 1.5,
                                                    backgroundColor: A_BRAND.emerald,
                                                    "&:hover": { backgroundColor: "#047857" },
                                                }}
                                            >
                                                Save task review
                                            </Button>
                                        </div>

                                        {activeTask.submission.statusHistory.length > 0 && (
                                            <>
                                                <Divider sx={{ my: 1.25 }} />
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
                                                    <MdOutlineHistory size={15} color={A_BRAND.violet} />
                                                    <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: A_BRAND.text }}>
                                                        Status History
                                                    </Typography>
                                                </Box>
                                                <div className="flex flex-col gap-1">
                                                    {activeTask.submission.statusHistory.map((entry) => (
                                                        <Box key={entry.statusHistoryId} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                                                            <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: A_BRAND.violet, mt: 0.6, flexShrink: 0 }} />
                                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: A_BRAND.text }}>
                                                                    {SUBMISSION_STATUS_TONE[entry.status as TaskSubmissionStatus]?.label ?? entry.status}
                                                                    {entry.actorName ? ` by ${entry.actorName}` : ""}
                                                                </Typography>
                                                                <Typography sx={{ fontSize: 10.5, color: A_BRAND.muted }}>
                                                                    {formatDateTime(entry.createdAt)}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </Paper>
                                )}

                                {/* Overall assignment feedback */}
                                <Paper
                                    elevation={0}
                                    sx={{ borderRadius: 2, border: `1px solid ${A_BRAND.amber}`, backgroundColor: "#ffffff", p: 1.5 }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
                                        <MdOutlineSchedule size={15} color={A_BRAND.amber} />
                                        <Typography sx={{ fontSize: 14, fontWeight: 800, color: A_BRAND.text }}>
                                            Overall Assignment Feedback
                                        </Typography>
                                    </Box>
                                    <div className="flex flex-col gap-1.5">
                                        <TextField
                                            select
                                            size="small"
                                            fullWidth
                                            label="Grade"
                                            value={overallGrade}
                                            onChange={(e) => setOverallGrade(e.target.value as FeedbackGrade | "")}
                                        >
                                            <MenuItem value="" sx={{ fontSize: 13 }}>None</MenuItem>
                                            {GRADE_OPTIONS.map((option) => (
                                                <MenuItem key={option.value} value={option.value} sx={{ fontSize: 13 }}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            multiline
                                            minRows={2}
                                            label="Feedback to student"
                                            value={overallFeedback}
                                            onChange={(e) => setOverallFeedback(e.target.value)}
                                        />
                                        <Button
                                            onClick={submitOverall}
                                            disabled={saving}
                                            size="small"
                                            variant="contained"
                                            disableElevation
                                            sx={{
                                                textTransform: "none",
                                                fontWeight: 700,
                                                borderRadius: 1.5,
                                                backgroundColor: A_BRAND.amber,
                                                "&:hover": { backgroundColor: "#b45309" },
                                            }}
                                        >
                                            Save assignment feedback
                                        </Button>
                                    </div>
                                </Paper>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
