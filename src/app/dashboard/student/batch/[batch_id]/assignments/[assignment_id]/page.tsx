"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box,
    Typography,
    LinearProgress,
    Chip,
    Skeleton,
    TextField,
} from "@mui/material";
import {
    MdArrowBack,
    MdPictureAsPdf,
    MdCheckCircle,
    MdArrowBackIos,
    MdArrowForwardIos,
    MdOpenInNew,
    MdFiberManualRecord,
} from "react-icons/md";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CCNButton from "@/components/buttons/CCNButton";
import FileDropzone from "@/components/assignments/FileDropzone";
import {
    useAssignment,
    type AssignmentTaskWithSubmission,
    type StudentAssignmentDetailResult,
    type TaskDocumentInput,
    type TaskSubmissionStatus,
} from "@/contexts/AssignmentContext";

const STATUS_LABEL: Record<TaskSubmissionStatus, string> = {
    submitted: "Submitted",
    under_review: "Under Review",
    approved: "Approved",
    rejected: "Rejected",
    resubmit: "Resubmission Requested",
};

const GRADE_LABEL: Record<string, string> = {
    excellent: "Excellent",
    good: "Good",
    average: "Average",
    poor: "Poor",
};

function formatDate(value: string | null | undefined): string {
    if (!value) return "--";
    return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(value: string | null | undefined): string {
    if (!value) return "--";
    return new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

function formatDuration(minutes: number | null | undefined): string {
    if (!minutes || minutes <= 0) return "--";
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (hours === 0) return `${rest} min`;
    if (rest === 0) return `${hours} hr`;
    return `${hours} hr ${rest} min`;
}

// ── Colors ─────────────────────────────────────────────────────────────────
const C = {
    bg: "transparent",
    card: "rgba(255,255,255,0.03)",
    cardBorder: "rgba(255,255,255,0.07)",
    text: "#fff",
    muted: "rgba(255,255,255,0.5)",
    dim: "rgba(255,255,255,0.3)",
    orange: "#f97316",
    teal: "#2dd4bf",
    tealBg: "#052e2b",
    green: "#22c55e",
    greenBg: "#052e11",
    purple: "#7c3aed",
    purpleBg: "#1e1040",
    red: "#ef4444",
    redBg: "#2d0a0a",
};

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <Typography
            sx={{
                fontSize: "0.65rem",
                fontWeight: 700,
                color: C.muted,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                mb: 0.75,
                mt: 2,
            }}
        >
            {children}
        </Typography>
    );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <Typography
            sx={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: C.text,
                mb: 1,
                mt: 2,
            }}
        >
            {children}
        </Typography>
    );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                py: 0.75,
                borderBottom: `1px solid ${C.cardBorder}`,
                "&:last-child": { borderBottom: "none" },
            }}
        >
            <Typography sx={{ fontSize: "0.78rem", color: C.muted, minWidth: 110, flexShrink: 0 }}>
                {label}
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: C.dim, mr: 0.5 }}>:</Typography>
            <Box sx={{ flex: 1 }}>{children}</Box>
        </Box>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AssignmentDetailPage() {
    const router = useRouter();
    const params = useParams<{ batch_id: string; assignment_id: string }>();
    const assignmentId = params?.assignment_id as string;

    const { getStudentAssignmentDetail, submitTask, saving } = useAssignment();

    const [detail, setDetail] = useState<StudentAssignmentDetailResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTaskIdx, setActiveTaskIdx] = useState(0);
    const [files, setFiles] = useState<TaskDocumentInput[]>([]);
    const [note, setNote] = useState("");

    const load = useCallback(async () => {
        if (!assignmentId) return;
        const res = await getStudentAssignmentDetail(assignmentId);
        setLoading(false);
        if (!res.success || !res.data) {
            toast.error(res.message ?? "Failed to load assignment");
            return;
        }
        setDetail(res.data);
    }, [assignmentId, getStudentAssignmentDetail]);

    useEffect(() => {
        load();
    }, [load]);

    const assignment = detail?.assignment ?? null;
    const tasks: AssignmentTaskWithSubmission[] = useMemo(() => assignment?.tasks ?? [], [assignment]);
    const task = tasks[activeTaskIdx] ?? null;
    const submission = task?.submission ?? null;
    const totalTasks = detail?.progress.totalTasks ?? 0;
    const completedCount = detail?.progress.completedTasks ?? 0;
    const progress = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
    const isLocked = submission?.submissionStatus === "approved";

    useEffect(() => {
        setFiles([]);
        setNote(submission?.submissionNote ?? "");
    }, [task?.taskId, submission?.submissionNote]);

    const handleSubmit = async () => {
        if (!task) return;
        if (files.length === 0) {
            toast.error("Upload at least one file before submitting");
            return;
        }
        const res = await submitTask(task.taskId, {
            documents: files,
            submissionNote: note.trim() || null,
        });
        if (!res.success) {
            toast.error(res.message ?? "Failed to submit task");
            return;
        }
        toast.success("Task submitted successfully");
        setFiles([]);
        await load();
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Skeleton variant="rounded" height={40} sx={{ bgcolor: "rgba(255,255,255,0.05)" }} />
                <Skeleton variant="rounded" height={420} sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: "14px" }} />
            </Box>
        );
    }

    if (!assignment || !task) {
        return (
            <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography sx={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.45)", mb: 1.5 }}>
                    This assignment is not available.
                </Typography>
                <CCNButton onClick={() => router.back()}>Go back</CCNButton>
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
            {/* ── Page Header ── */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, flexShrink: 0 }}>
                <Box
                    onClick={() => router.back()}
                    sx={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        color: C.muted,
                        "&:hover": { color: C.text },
                        transition: "color 0.15s",
                    }}
                >
                    <MdArrowBack size={18} />
                </Box>
                <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: C.text, letterSpacing: "-0.01em" }}>
                    {assignment.assignmentTitle}
                </Typography>
            </Box>

            {/* ── Content + Bottom Nav wrapper ── */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                {/* ── Two-column layout ── */}
                <Box
                    sx={{
                        flex: 1,
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 320px" },
                        gap: 2,
                        overflow: "auto",
                        pb: 1,
                        minHeight: 0,
                    }}
                >
                    {/* ── LEFT: Task Overview ── */}
                    <Box
                        sx={{
                            bgcolor: C.card,
                            border: `1px solid ${C.cardBorder}`,
                            borderRadius: "14px",
                            p: { xs: 2, md: 2.5 },
                            overflow: "auto",
                        }}
                    >
                        <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: C.text, mb: 1.5 }}>
                            {task.taskTitle} Overview
                        </Typography>

                        {task.taskObjective && (
                            <>
                                <SectionLabel>Task Objective</SectionLabel>
                                <Typography sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                                    {task.taskObjective}
                                </Typography>
                            </>
                        )}

                        {task.taskDescription && (
                            <>
                                <SectionLabel>Instructions</SectionLabel>
                                <Typography sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                                    {task.taskDescription}
                                </Typography>
                            </>
                        )}

                        {task.deliverables && (
                            <>
                                <SectionLabel>Deliverables</SectionLabel>
                                <Typography sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                                    {task.deliverables}
                                </Typography>
                            </>
                        )}

                        {/* Tools */}
                        {task.tools.length > 0 && (
                            <>
                                <SectionHeading>Tools</SectionHeading>
                                <Box component="ul" sx={{ pl: 2.5, mt: 0.5, mb: 0 }}>
                                    {task.tools.map((tool) => (
                                        <Box
                                            component="li"
                                            key={tool}
                                            sx={{
                                                fontSize: "0.82rem",
                                                color: "rgba(255,255,255,0.7)",
                                                lineHeight: 1.9,
                                                "&::marker": { color: C.muted },
                                            }}
                                        >
                                            {tool}
                                        </Box>
                                    ))}
                                </Box>
                            </>
                        )}

                        {/* Documents */}
                        {task.referenceDocumentsInTasks.length > 0 && (
                            <>
                                <SectionHeading>Document</SectionHeading>
                                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                                    {task.referenceDocumentsInTasks.map((doc) => (
                                        <Box
                                            key={doc.referenceDocumentId}
                                            component="a"
                                            href={doc.documentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1.25,
                                                bgcolor: "rgba(255,255,255,0.05)",
                                                border: `1px solid ${C.cardBorder}`,
                                                borderRadius: "10px",
                                                px: 1.5,
                                                py: 1,
                                                cursor: "pointer",
                                                textDecoration: "none",
                                                "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                                                transition: "background 0.15s",
                                                minWidth: 150,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    bgcolor: C.redBg,
                                                    borderRadius: "8px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <MdPictureAsPdf size={18} color={C.red} />
                                            </Box>
                                            <Box>
                                                <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: C.text, lineHeight: 1.3 }}>
                                                    {doc.documentName}
                                                </Typography>
                                                <Typography sx={{ fontSize: "0.68rem", color: C.muted, textTransform: "uppercase" }}>
                                                    {doc.documentType}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </>
                        )}

                        {/* Source Links */}
                        {task.referenceLinks.length > 0 && (
                            <>
                                <SectionHeading>Source Links</SectionHeading>
                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                    {task.referenceLinks.map((link) => (
                                        <Box
                                            key={link}
                                            component="a"
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                                bgcolor: "rgba(255,255,255,0.05)",
                                                border: `1px solid ${C.cardBorder}`,
                                                borderRadius: "20px",
                                                px: 1.5,
                                                py: 0.5,
                                                fontSize: "0.75rem",
                                                color: "rgba(255,255,255,0.7)",
                                                textDecoration: "none",
                                                cursor: "pointer",
                                                maxWidth: 300,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                "&:hover": { bgcolor: "rgba(255,255,255,0.09)", color: C.text },
                                                transition: "all 0.15s",
                                            }}
                                        >
                                            {link}
                                            <MdOpenInNew size={11} />
                                        </Box>
                                    ))}
                                </Box>
                            </>
                        )}

                        {/* Trainer feedback */}
                        {submission?.feedback && (
                            <>
                                <SectionHeading>Trainer&apos;s Feedback</SectionHeading>
                                <Box sx={{ border: `1px solid ${C.cardBorder}`, borderRadius: "10px", p: 1.5 }}>
                                    {submission.feedbackGrade && (
                                        <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: C.green, textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.5 }}>
                                            {GRADE_LABEL[submission.feedbackGrade] ?? submission.feedbackGrade}
                                        </Typography>
                                    )}
                                    <Typography sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                                        {submission.feedback}
                                    </Typography>
                                </Box>
                            </>
                        )}

                        {/* Status history */}
                        {submission && submission.statusHistory.length > 0 && (
                            <>
                                <SectionHeading>Status History</SectionHeading>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                    {submission.statusHistory.map((entry) => (
                                        <Box key={entry.statusHistoryId} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                                            <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: C.purple, mt: 0.7, flexShrink: 0 }} />
                                            <Box>
                                                <Typography sx={{ fontSize: "0.76rem", fontWeight: 600, color: C.text }}>
                                                    {STATUS_LABEL[entry.status as TaskSubmissionStatus] ?? entry.status}
                                                    {entry.actorName ? ` by ${entry.actorName}` : ""}
                                                </Typography>
                                                <Typography sx={{ fontSize: "0.68rem", color: C.muted }}>
                                                    {formatDateTime(entry.createdAt)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </>
                        )}
                    </Box>

                    {/* ── RIGHT column ── */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {/* Basic Details card */}
                        <Box
                            sx={{
                                bgcolor: C.card,
                                border: `1px solid ${C.cardBorder}`,
                                borderRadius: "14px",
                                p: 2,
                            }}
                        >
                            <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: C.text, mb: 1.5 }}>
                                Basic Details
                            </Typography>

                            <DetailRow label="Assigned on">
                                <Typography sx={{ fontSize: "0.78rem", color: C.text }}>{formatDate(assignment.assignedOn)}</Typography>
                            </DetailRow>

                            <DetailRow label="Due date">
                                <Typography sx={{ fontSize: "0.78rem", color: C.text }}>{formatDate(task.taskDueDate)}</Typography>
                            </DetailRow>

                            <DetailRow label="Task Progress">
                                <Box>
                                    <Typography sx={{ fontSize: "0.75rem", color: C.text, mb: 0.5 }}>
                                        {completedCount} / {totalTasks} Completed
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={progress}
                                            sx={{
                                                flex: 1,
                                                height: 5,
                                                borderRadius: 3,
                                                bgcolor: "rgba(255,255,255,0.1)",
                                                "& .MuiLinearProgress-bar": {
                                                    bgcolor: C.orange,
                                                    borderRadius: 3,
                                                },
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </DetailRow>

                            <DetailRow label="Trainer">
                                <Typography sx={{ fontSize: "0.78rem", color: C.text }}>{assignment.trainer.trainerName}</Typography>
                            </DetailRow>

                            <DetailRow label="Estimated Time">
                                <Typography sx={{ fontSize: "0.78rem", color: C.text }}>{formatDuration(task.estimatedTimeToComplete)}</Typography>
                            </DetailRow>

                            {task.maximumMarks != null && (
                                <DetailRow label="Marks">
                                    <Typography sx={{ fontSize: "0.78rem", color: C.text }}>
                                        {submission?.marks ?? "--"} / {task.maximumMarks}
                                    </Typography>
                                </DetailRow>
                            )}

                            <DetailRow label="Status">
                                <Chip
                                    label={submission ? STATUS_LABEL[submission.submissionStatus] : "Not Submitted"}
                                    size="small"
                                    sx={{
                                        fontSize: "0.68rem",
                                        fontWeight: 600,
                                        height: 20,
                                        bgcolor: submission?.submissionStatus === "approved" ? C.greenBg : C.tealBg,
                                        color: submission?.submissionStatus === "approved" ? C.green : C.teal,
                                        border: `1px solid ${submission?.submissionStatus === "approved" ? C.green : C.teal}40`,
                                        "& .MuiChip-label": { px: 1 },
                                    }}
                                />
                            </DetailRow>
                        </Box>

                        {/* Upload card */}
                        <Box
                            sx={{
                                bgcolor: C.card,
                                border: `1px solid ${C.cardBorder}`,
                                borderRadius: "14px",
                                p: 2,
                            }}
                        >
                            <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: C.text, mb: 1.5 }}>
                                Upload {task.taskTitle}
                            </Typography>

                            {submission && submission.submissionDocuments.length > 0 && (
                                <Box sx={{ mb: 1.5 }}>
                                    <Typography sx={{ fontSize: "0.7rem", color: C.muted, mb: 0.5 }}>
                                        Submitted on {formatDateTime(submission.submissionDate)}
                                        {submission.isLate ? " · Late" : ""}
                                    </Typography>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                        {submission.submissionDocuments.map((doc) => (
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
                                                    bgcolor: "rgba(255,255,255,0.04)",
                                                    borderRadius: "7px",
                                                    px: 1,
                                                    py: 0.5,
                                                    textDecoration: "none",
                                                }}
                                            >
                                                <MdPictureAsPdf size={14} color={C.red} />
                                                <Typography sx={{ fontSize: "0.72rem", color: C.muted, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {doc.documentName}
                                                </Typography>
                                                <MdOpenInNew size={12} color={C.muted} />
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {isLocked ? (
                                <Typography sx={{ fontSize: "0.75rem", color: C.green, textAlign: "center", py: 1 }}>
                                    This task has been approved. No further submissions needed.
                                </Typography>
                            ) : (
                                <>
                                    <FileDropzone
                                        variant="dark"
                                        files={files}
                                        onChange={setFiles}
                                        accept=".pdf,.doc,.docx,.zip,.txt,.png,.jpg,.jpeg"
                                        dirName="lms-assignments/submissions"
                                        hint="PDF, ZIP, DOCX · Max 10 MB files are allowed"
                                    />

                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={2}
                                        placeholder="Add a note for your trainer (optional)"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        sx={{
                                            my: 1.5,
                                            "& .MuiOutlinedInput-root": {
                                                bgcolor: "rgba(255,255,255,0.04)",
                                                borderRadius: "10px",
                                                color: "#fff",
                                                fontSize: "0.76rem",
                                                "& fieldset": { borderColor: C.cardBorder },
                                                "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                                                "&.Mui-focused fieldset": { borderColor: C.purple },
                                            },
                                            "& textarea::placeholder": { color: "rgba(255,255,255,0.3)", opacity: 1 },
                                        }}
                                    />

                                    <CCNButton className="w-full" onClick={handleSubmit} disabled={saving}>
                                        {saving ? "Submitting..." : submission ? "Resubmit your Work" : "Submit your Work"}
                                    </CCNButton>
                                </>
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* ── Bottom Task Navigator ── */}
                <Box
                    sx={{
                        flexShrink: 0,
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: `1px solid ${C.cardBorder}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                    }}
                >
                    {/* Task Steps */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto" }}>
                        {tasks.map((t, idx) => {
                            const isCompleted = t.submission?.submissionStatus === "approved";
                            const isActive = idx === activeTaskIdx;
                            const isLast = idx === tasks.length - 1;
                            return (
                                <Box key={t.taskId} sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                                    {/* Step indicator */}
                                    <Box
                                        onClick={() => setActiveTaskIdx(idx)}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.75,
                                            cursor: "pointer",
                                        }}
                                    >
                                        {isCompleted ? (
                                            <MdCheckCircle size={22} color={C.green} />
                                        ) : isActive ? (
                                            <Box
                                                sx={{
                                                    width: 22,
                                                    height: 22,
                                                    borderRadius: "50%",
                                                    border: `2px solid ${C.purple}`,
                                                    bgcolor: C.purpleBg,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <MdFiberManualRecord size={8} color={C.purple} />
                                            </Box>
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: 22,
                                                    height: 22,
                                                    borderRadius: "50%",
                                                    border: `2px solid rgba(255,255,255,0.2)`,
                                                    bgcolor: "rgba(255,255,255,0.04)",
                                                }}
                                            />
                                        )}
                                        <Typography
                                            sx={{
                                                fontSize: "0.78rem",
                                                fontWeight: isActive ? 700 : 500,
                                                color: isActive ? C.text : C.muted,
                                            }}
                                        >
                                            {t.taskTitle}
                                        </Typography>
                                    </Box>

                                    {/* Connector line */}
                                    {!isLast && (
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 1.5,
                                                mx: 1,
                                                backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.25) 0px, rgba(255,255,255,0.25) 4px, transparent 4px, transparent 8px)",
                                            }}
                                        />
                                    )}
                                </Box>
                            );
                        })}
                    </Box>

                    {/* Prev / Next buttons */}
                    <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
                        <Box
                            onClick={() => setActiveTaskIdx((p) => Math.max(0, p - 1))}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                px: 1.5,
                                py: 0.75,
                                border: `1px solid ${C.cardBorder}`,
                                borderRadius: "8px",
                                cursor: activeTaskIdx === 0 ? "not-allowed" : "pointer",
                                opacity: activeTaskIdx === 0 ? 0.35 : 1,
                                bgcolor: "rgba(255,255,255,0.03)",
                                "&:hover": { bgcolor: "rgba(255,255,255,0.07)" },
                                transition: "all 0.15s",
                            }}
                        >
                            <MdArrowBackIos size={12} color={C.text} />
                            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: C.text }}>
                                Previous Task
                            </Typography>
                        </Box>
                        <Box
                            onClick={() => setActiveTaskIdx((p) => Math.min(tasks.length - 1, p + 1))}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                px: 1.5,
                                py: 0.75,
                                border: `1px solid ${C.cardBorder}`,
                                borderRadius: "8px",
                                cursor: activeTaskIdx === tasks.length - 1 ? "not-allowed" : "pointer",
                                opacity: activeTaskIdx === tasks.length - 1 ? 0.35 : 1,
                                bgcolor: "rgba(255,255,255,0.03)",
                                "&:hover": { bgcolor: "rgba(255,255,255,0.07)" },
                                transition: "all 0.15s",
                            }}
                        >
                            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: C.text }}>
                                Next Task
                            </Typography>
                            <MdArrowForwardIos size={12} color={C.text} />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
