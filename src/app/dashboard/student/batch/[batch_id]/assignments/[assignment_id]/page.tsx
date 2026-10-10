"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Box, Skeleton, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { LmsButton } from "@/components/community/community-ui";
import { PlacementModal, ModalHero } from "@/components/placement/PlacementModals";
import { useBatchHeaderTitle } from "@/components/batches/batch-header-context";
import { uploadDocuments } from "@/components/assignments/FileDropzone";
import {
    AssignmentIcon,
    CardHeading,
    DateTimeText,
    FileIconAction,
    FileRow,
    GhostButton,
    SA,
    ST,
    StatusPill,
    TaskNavButton,
    ViewFileButton,
    assignmentAsset,
    detailCardSx,
    formatDuration,
    formatShortDate,
    formatTime,
    type PillTone,
} from "@/components/assignments/student-assignment-ui";
import {
    useAssignment,
    type AssignmentTaskWithSubmission,
    type StudentAssignmentDetailResult,
    type SubmissionStatusHistoryItem,
    type TaskDocumentInput,
} from "@/contexts/AssignmentContext";

const ACCEPT = ".pdf,.zip,.doc,.docx";
const MAX_SIZE_MB = 10;
const UPLOAD_DIR = "lms-assignments/submissions";

const GRADE_LABEL: Record<string, string> = {
    excellent: "Excellent",
    good: "Good",
    average: "Average",
    poor: "Poor",
};

/** A task counts as done once it has a submission the trainer hasn't sent back. */
const isTaskDone = (task: AssignmentTaskWithSubmission) =>
    Boolean(task.submission) && !["rejected", "resubmit"].includes(task.submission!.submissionStatus);

function taskPill(task: AssignmentTaskWithSubmission): { label: string; tone: PillTone } {
    switch (task.submission?.submissionStatus) {
        case "approved":
            return { label: "Completed", tone: "success" };
        case "submitted":
        case "under_review":
            return { label: "Under Review", tone: "warning" };
        case "rejected":
            return { label: "Rejected", tone: "error" };
        case "resubmit":
            return { label: "Needs Rework", tone: "error" };
        default:
            return new Date(task.taskDueDate) < new Date()
                ? { label: "Overdue", tone: "error" }
                : { label: "Recently Added", tone: "primary" };
    }
}

function historyCopy(entry: SubmissionStatusHistoryItem, isLatest: boolean): { title: string; subtitle: string | null } {
    switch (entry.status) {
        case "submitted":
            return { title: "Assignment Submitted", subtitle: isLatest ? "Reply within 24 hours" : entry.note };
        case "under_review":
            return { title: "Under Review", subtitle: entry.note ?? (entry.actorName ? `Reviewed by ${entry.actorName}` : null) };
        case "approved":
            return { title: "Approved", subtitle: entry.note ?? (entry.actorName ? `Approved by ${entry.actorName}` : null) };
        case "rejected":
            return { title: "Rejected", subtitle: entry.note ?? entry.actorName };
        case "resubmit":
            return { title: "Rework Requested", subtitle: entry.note ?? entry.actorName };
        default:
            return { title: entry.status, subtitle: entry.note };
    }
}

// ── Left column ──────────────────────────────────────────────────────────────

function OverviewSection({ label, text }: { label: string; text: string | null }) {
    if (!text?.trim()) return null;
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Typography sx={{ ...ST.latoReg14, letterSpacing: "0.28px", color: SA.n400, textTransform: "uppercase" }}>
                {label}
            </Typography>
            <Typography sx={{ ...ST.interReg16, color: SA.white, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{text}</Typography>
        </Box>
    );
}

function TaskOverviewCard({ task }: { task: AssignmentTaskWithSubmission }) {
    const docs = task.referenceDocumentsInTasks;
    return (
        <Box component="section" sx={detailCardSx("151.49deg")}>
            <CardHeading>{task.taskTitle} Overview</CardHeading>

            <OverviewSection label="Task Objective" text={task.taskObjective} />
            <OverviewSection label="Instructions" text={task.taskDescription} />
            <OverviewSection label="Deliverables" text={task.deliverables} />

            {task.tools.length > 0 && (
                <>
                    <CardHeading>Tools</CardHeading>
                    <Box sx={{ ...ST.interReg16, color: SA.white }}>
                        <Box component="p" sx={{ m: 0, mb: "24px" }}>
                            The best tools for this lab are:
                        </Box>
                        <Box component="ul" sx={{ m: 0, pl: "24px", listStyle: "disc" }}>
                            {task.tools.map((tool) => (
                                <Box component="li" key={tool}>
                                    {tool}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </>
            )}

            {docs.length > 0 && (
                <>
                    <CardHeading>Document</CardHeading>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: "12px" }}>
                        {docs.map((doc) => {
                            const isPdf = doc.documentType.toLowerCase().includes("pdf");
                            return (
                                <Box
                                    key={doc.referenceDocumentId}
                                    component="a"
                                    href={doc.documentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        height: 66,
                                        p: "16px",
                                        minWidth: 0,
                                        borderRadius: "12px",
                                        border: `1px solid ${SA.n700}`,
                                        textDecoration: "none",
                                        transition: "border-color .15s ease, background-color .15s ease",
                                        "&:hover": { borderColor: SA.n600, bgcolor: "rgba(255,255,255,0.03)" },
                                    }}
                                >
                                    <Box sx={{ width: 32, height: 32, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        {isPdf ? (
                                            <AssignmentIcon name="icon-pdf.svg" size={23.932} height={32} />
                                        ) : (
                                            <AssignmentIcon name="file-icon.png" size={30} height={32} />
                                        )}
                                    </Box>
                                    <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                                        <Typography
                                            title={doc.documentName}
                                            sx={{ ...ST.latoMed16, color: SA.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                                        >
                                            {doc.documentName}
                                        </Typography>
                                        <Typography sx={{ ...ST.latoReg12, color: SA.n300, textTransform: "uppercase" }}>
                                            {doc.documentType}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </>
            )}

            {task.referenceLinks.length > 0 && (
                <>
                    <CardHeading>Reference Links</CardHeading>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                        {task.referenceLinks.map((link) => (
                            <Box
                                key={link}
                                component="a"
                                href={/^https?:\/\//i.test(link) ? link : `https://${link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={link}
                                sx={{
                                    maxWidth: "100%",
                                    px: "8px",
                                    py: "4px",
                                    borderRadius: "6px",
                                    bgcolor: "rgba(227,233,248,0.12)",
                                    ...ST.interReg16,
                                    color: SA.primary100,
                                    textDecoration: "none",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    "&:hover": { bgcolor: "rgba(227,233,248,0.2)" },
                                }}
                            >
                                {link}
                            </Box>
                        ))}
                    </Box>
                </>
            )}
        </Box>
    );
}

// ── Right column ─────────────────────────────────────────────────────────────

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: "12px", sm: "24px" }, width: "100%" }}>
            <Typography sx={{ ...ST.latoMed14, color: SA.n300, width: 100, flexShrink: 0 }}>{label}</Typography>
            <Typography sx={{ ...ST.latoMed14, color: SA.n300 }}>:</Typography>
            <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>{children}</Box>
        </Box>
    );
}

const VALUE_SX = { ...ST.latoMed16, color: SA.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } as const;

function BasicDetailsCard({
    detail,
    task,
}: {
    detail: StudentAssignmentDetailResult;
    task: AssignmentTaskWithSubmission;
}) {
    const tasks = detail.assignment.tasks;
    const done = tasks.filter(isTaskDone).length;
    const pct = tasks.length > 0 ? (done / tasks.length) * 100 : 0;
    const pill = taskPill(task);

    return (
        <Box component="section" sx={detailCardSx("163.61deg")}>
            <CardHeading>Basic Details</CardHeading>
            <DetailRow label="Assigned on">
                <Typography sx={VALUE_SX}>{formatShortDate(detail.assignment.assignedOn)}</Typography>
            </DetailRow>
            <DetailRow label="Due date">
                <Typography sx={VALUE_SX}>{formatShortDate(task.taskDueDate)}</Typography>
            </DetailRow>
            <DetailRow label="Task Progress">
                <Box sx={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
                    <Typography sx={{ ...VALUE_SX, flexShrink: 0 }}>
                        {done} / {tasks.length} Completed
                    </Typography>
                    <Box
                        role="progressbar"
                        aria-valuenow={Math.round(pct)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        sx={{
                            flex: 1,
                            minWidth: 40,
                            height: 16,
                            px: "1px",
                            display: "flex",
                            alignItems: "center",
                            borderRadius: "9px",
                            bgcolor: "rgba(90,90,90,0.32)",
                            overflow: "hidden",
                        }}
                    >
                        <Box
                            sx={{
                                height: 14,
                                width: `max(1px, ${pct}%)`,
                                borderRadius: "50px",
                                backgroundImage: SA.goldGradient,
                                transition: "width .35s ease",
                            }}
                        />
                    </Box>
                </Box>
            </DetailRow>
            <DetailRow label="Trainer">
                <Typography sx={VALUE_SX}>{detail.assignment.trainer.trainerName}</Typography>
            </DetailRow>
            <DetailRow label="Estimated Time">
                <Typography sx={VALUE_SX}>{formatDuration(task.estimatedTimeToComplete)}</Typography>
            </DetailRow>
            <DetailRow label="Status">
                <StatusPill label={pill.label} tone={pill.tone} size="md" />
            </DetailRow>
        </Box>
    );
}

function TaskDropzone({ disabled, onFiles }: { disabled?: boolean; onFiles: (files: File[]) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    return (
        <Box
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            onClick={() => !disabled && inputRef.current?.click()}
            onKeyDown={(e) => {
                if (!disabled && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    inputRef.current?.click();
                }
            }}
            onDragOver={(e) => {
                e.preventDefault();
                if (!disabled) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                if (!disabled) onFiles(Array.from(e.dataTransfer.files));
            }}
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                width: "100%",
                p: "24px",
                borderRadius: "8px",
                border: `1px dashed ${dragging ? SA.link : SA.n400}`,
                bgcolor: dragging ? "rgba(106,138,215,0.06)" : "transparent",
                cursor: disabled ? "progress" : "pointer",
                transition: "border-color .15s ease, background-color .15s ease",
                "&:hover": disabled ? {} : { borderColor: SA.n300 },
                "&:focus-visible": { outline: `2px solid ${SA.white}`, outlineOffset: "2px" },
            }}
        >
            <input
                ref={inputRef}
                type="file"
                multiple
                accept={ACCEPT}
                hidden
                onChange={(e) => {
                    if (e.target.files) onFiles(Array.from(e.target.files));
                    e.target.value = "";
                }}
            />
            <AssignmentIcon name="icon-upload.svg" size={44} />
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "100%", textAlign: "center" }}>
                <Typography sx={{ ...ST.latoMed18, color: SA.white }}>
                    Drag your file(s) or{" "}
                    <Box component="span" sx={{ color: SA.link }}>
                        browse
                    </Box>
                </Typography>
                <Typography sx={{ ...ST.latoMed16, color: SA.n300 }}>
                    {disabled ? "Uploading…" : `PDF, ZIP, DOCX Max ${MAX_SIZE_MB} MB files are allowed`}
                </Typography>
            </Box>
        </Box>
    );
}

function replaceDeadlineText(due: Date): string {
    const now = new Date();
    const sameDay = due.toDateString() === now.toDateString();
    return sameDay ? formatTime(due) : `${formatShortDate(due)}, ${formatTime(due)}`;
}

function UploadCard({
    task,
    busy,
    pendingFiles,
    onAddFiles,
    onRemovePending,
    onSubmit,
    onReplace,
    onDelete,
}: {
    task: AssignmentTaskWithSubmission;
    busy: boolean;
    pendingFiles: TaskDocumentInput[];
    onAddFiles: (files: File[]) => void;
    onRemovePending: (index: number) => void;
    onSubmit: () => void;
    onReplace: (index: number, file: File) => void;
    onDelete: (index: number) => void;
}) {
    const replaceInputRef = useRef<HTMLInputElement>(null);
    const replaceIndex = useRef(0);
    const submission = task.submission;
    const status = submission?.submissionStatus;
    const canSubmit = !submission || status === "rejected" || status === "resubmit";
    const due = new Date(task.taskDueDate);
    const canModify = status === "submitted" && new Date() <= due;
    const docs = submission?.submissionDocuments ?? [];

    return (
        <Box component="section" sx={detailCardSx("165.26deg")}>
            <CardHeading>Upload {task.taskTitle}</CardHeading>

            {canSubmit ? (
                <>
                    <TaskDropzone disabled={busy} onFiles={onAddFiles} />
                    {pendingFiles.length > 0 && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                            {pendingFiles.map((file, index) => (
                                <FileRow
                                    key={`${file.documentUrl}-${index}`}
                                    document={file}
                                    actions={
                                        <>
                                            <FileIconAction icon="icon-eye.svg" label="View file" href={file.documentUrl} />
                                            <FileIconAction icon="icon-trash.svg" label="Remove file" onClick={() => onRemovePending(index)} disabled={busy} />
                                        </>
                                    }
                                />
                            ))}
                        </Box>
                    )}
                    <LmsButton onClick={onSubmit} disabled={busy || pendingFiles.length === 0} sx={{ width: "100%" }}>
                        {busy ? "Please wait…" : submission ? "Resubmit your Work" : "Submit your Work"}
                    </LmsButton>
                </>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                    <input
                        ref={replaceInputRef}
                        type="file"
                        accept={ACCEPT}
                        hidden
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onReplace(replaceIndex.current, file);
                            e.target.value = "";
                        }}
                    />
                    {docs.map((doc, index) => (
                        <FileRow
                            key={doc.submissionDocumentId}
                            document={doc}
                            actions={
                                canModify ? (
                                    <>
                                        <FileIconAction
                                            icon="icon-refresh.svg"
                                            label="Replace file"
                                            disabled={busy}
                                            onClick={() => {
                                                replaceIndex.current = index;
                                                replaceInputRef.current?.click();
                                            }}
                                        />
                                        <FileIconAction icon="icon-eye.svg" label="View file" href={doc.documentUrl} />
                                        <FileIconAction icon="icon-trash.svg" label="Delete file" disabled={busy} onClick={() => onDelete(index)} />
                                    </>
                                ) : (
                                    <ViewFileButton href={doc.documentUrl} />
                                )
                            }
                        />
                    ))}
                    {canModify ? (
                        <Typography
                            sx={{
                                ...ST.latoReg12,
                                backgroundImage: SA.goldGradient,
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                color: "transparent",
                                alignSelf: "flex-start",
                            }}
                        >
                            {busy ? "Updating your submission…" : `You can only replace the file until ${replaceDeadlineText(due)}`}
                        </Typography>
                    ) : (
                        submission && (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                                <Typography sx={{ ...ST.latoReg12, color: SA.white }}>Uploaded on</Typography>
                                <DateTimeText value={submission.submissionDate} />
                            </Box>
                        )
                    )}
                </Box>
            )}
        </Box>
    );
}

function StatusHistoryCard({ history }: { history: SubmissionStatusHistoryItem[] }) {
    const entries = [...history].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return (
        <Box component="section" sx={detailCardSx("172.99deg")}>
            <CardHeading>Status History</CardHeading>
            <Box sx={{ display: "flex", flexDirection: "column", width: "100%", maxHeight: 260, overflowY: "auto", scrollbarWidth: "none" }}>
                {entries.map((entry, index) => {
                    const { title, subtitle } = historyCopy(entry, index === 0);
                    return (
                        <Box key={entry.statusHistoryId} sx={{ display: "flex", gap: "12px", minHeight: 45 }}>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: "2px", flexShrink: 0 }}>
                                <AssignmentIcon name="timeline-dot.svg" size={20} />
                                <Box sx={{ flex: 1, width: "1px", minHeight: 12, backgroundImage: SA.timelineLine }} />
                            </Box>
                            <Box
                                sx={{
                                    flex: 1,
                                    minWidth: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "12px",
                                    flexWrap: "wrap",
                                    pb: index === entries.length - 1 ? 0 : "16px",
                                }}
                            >
                                <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                                    <Typography sx={{ ...ST.latoMed16, color: SA.white }}>{title}</Typography>
                                    {subtitle && <Typography sx={{ ...ST.interReg12, color: SA.n300 }}>{subtitle}</Typography>}
                                </Box>
                                <DateTimeText value={entry.createdAt} />
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}

function FeedbackCard({ grade, feedback }: { grade: string | null; feedback: string }) {
    return (
        <Box
            component="section"
            sx={{
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                gap: "32px",
                p: { xs: "20px", sm: "32px" },
                borderRadius: "30px",
                border: "1px solid rgba(255,255,255,0.29)",
                bgcolor: "#07051B",
            }}
        >
            {/* Purple glow + noise from the Figma "Mask" group */}
            <Box
                aria-hidden
                sx={{
                    position: "absolute",
                    left: -19,
                    top: -252,
                    width: 658.307,
                    height: 416.478,
                    transform: "rotate(180deg)",
                    opacity: 0.44,
                    pointerEvents: "none",
                }}
            >
                <Image
                    src={assignmentAsset("feedback-glow.svg")}
                    alt=""
                    width={870.562}
                    height={608.954}
                    style={{ position: "absolute", left: "-19.87%", top: "-27.16%", maxWidth: "none" }}
                />
            </Box>
            <Box
                aria-hidden
                sx={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.044,
                    backgroundImage: "url('/profile/summary-noise.png')",
                    backgroundSize: "568px 568px",
                    backgroundPosition: "top left",
                    pointerEvents: "none",
                }}
            />
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "12px" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                    <Typography sx={{ ...ST.latoMed18, color: SA.white }}>Trainers Feedback :</Typography>
                    {grade && <Typography sx={{ ...ST.poppinsSemi20, color: SA.white, textTransform: "uppercase" }}>{grade}</Typography>}
                </Box>
                <Typography sx={{ ...ST.interReg16, color: SA.n75, whiteSpace: "pre-wrap" }}>{feedback}</Typography>
            </Box>
        </Box>
    );
}

// ── Bottom task bar ──────────────────────────────────────────────────────────

function StepIcon({ done, active }: { done: boolean; active: boolean }) {
    if (done) {
        return (
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "999px",
                    border: "1.5px solid #2EC4B6",
                    backgroundImage: "linear-gradient(90.71deg, #2EC4B6 4.5235%, #1B4C33 104.18%)",
                }}
            >
                <AssignmentIcon name="icon-check-20.svg" size={20} />
            </Box>
        );
    }
    if (active) return <AssignmentIcon name="step-active.svg" size={40} />;
    return <Box sx={{ width: 40, height: 40, flexShrink: 0, borderRadius: "999px", border: `1px solid ${SA.n600}` }} />;
}

function TaskBar({
    tasks,
    activeIdx,
    onSelect,
}: {
    tasks: AssignmentTaskWithSubmission[];
    activeIdx: number;
    onSelect: (idx: number) => void;
}) {
    return (
        <Box
            sx={{
                position: "sticky",
                bottom: "-8px",
                zIndex: 3,
                mt: "24px",
                mb: "-8px",
                minHeight: 81,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                px: { xs: "12px", sm: "24px" },
                py: "12px",
                borderRadius: "12px 0 0 0",
                bgcolor: "rgba(0,0,0,0.24)",
                backdropFilter: "blur(12px)",
            }}
        >
            <Box
                role="tablist"
                aria-label="Tasks"
                sx={{ display: "flex", alignItems: "center", gap: "12px", overflowX: "auto", scrollbarWidth: "none", minWidth: 0 }}
            >
                {tasks.map((task, idx) => (
                    <React.Fragment key={task.taskId}>
                        {idx > 0 && <AssignmentIcon name="step-connector.svg" size={28} height={2} />}
                        <Box
                            component="button"
                            role="tab"
                            aria-selected={idx === activeIdx}
                            onClick={() => onSelect(idx)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                flexShrink: 0,
                                p: 0,
                                border: "none",
                                bgcolor: "transparent",
                                cursor: "pointer",
                                "&:focus-visible": { outline: `2px solid ${SA.white}`, outlineOffset: "2px", borderRadius: "999px" },
                            }}
                        >
                            <StepIcon done={isTaskDone(task)} active={idx === activeIdx} />
                            <Typography component="span" sx={{ ...ST.latoMed16, color: idx === activeIdx ? SA.n75 : SA.n300, whiteSpace: "nowrap" }}>
                                {task.taskTitle}
                            </Typography>
                        </Box>
                    </React.Fragment>
                ))}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "12px", ml: "auto" }}>
                {activeIdx > 0 && <TaskNavButton direction="prev" onClick={() => onSelect(activeIdx - 1)} />}
                {activeIdx < tasks.length - 1 && <TaskNavButton direction="next" onClick={() => onSelect(activeIdx + 1)} />}
            </Box>
        </Box>
    );
}

// ── Modals ───────────────────────────────────────────────────────────────────

type ModalState =
    | { kind: "submitted"; taskIdx: number; nextIdx: number | null }
    | { kind: "confirm-delete"; docIndex: number }
    | null;

function ButtonRow({ children }: { children: React.ReactNode }) {
    return <Box sx={{ position: "relative", display: "flex", gap: "12px", width: "100%" }}>{children}</Box>;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AssignmentDetailPage() {
    const router = useRouter();
    const params = useParams<{ batch_id: string; assignment_id: string }>();
    const batchId = params?.batch_id as string;
    const assignmentId = params?.assignment_id as string;

    const { getStudentAssignmentDetail, submitTask, withdrawTaskSubmission, saving } = useAssignment();

    const [detail, setDetail] = useState<StudentAssignmentDetailResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeIdx, setActiveIdx] = useState(0);
    const [pendingFiles, setPendingFiles] = useState<TaskDocumentInput[]>([]);
    const [uploading, setUploading] = useState(false);
    const [modal, setModal] = useState<ModalState>(null);
    const initialised = useRef(false);

    useBatchHeaderTitle(detail?.assignment.assignmentTitle ?? null);

    const load = useCallback(async () => {
        if (!assignmentId) return null;
        const res = await getStudentAssignmentDetail(assignmentId);
        setLoading(false);
        if (!res.success || !res.data) {
            toast.error(res.message ?? "Failed to load assignment");
            return null;
        }
        setDetail(res.data);
        if (!initialised.current) {
            initialised.current = true;
            const firstOpen = res.data.assignment.tasks.findIndex((t) => !isTaskDone(t));
            setActiveIdx(firstOpen === -1 ? 0 : firstOpen);
        }
        return res.data;
    }, [assignmentId, getStudentAssignmentDetail]);

    useEffect(() => {
        load();
    }, [load]);

    const tasks = useMemo(() => detail?.assignment.tasks ?? [], [detail]);
    const task = tasks[activeIdx] ?? null;
    const busy = saving || uploading;

    useEffect(() => {
        setPendingFiles([]);
    }, [task?.taskId]);

    const selectTask = (idx: number) => {
        setActiveIdx(idx);
        document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
    };

    const upload = async (files: File[]) => {
        setUploading(true);
        try {
            return await uploadDocuments(files, { maxSizeMB: MAX_SIZE_MB, dirName: UPLOAD_DIR });
        } finally {
            setUploading(false);
        }
    };

    const addFiles = async (files: File[]) => {
        const uploaded = await upload(files);
        if (uploaded.length > 0) setPendingFiles((prev) => [...prev, ...uploaded]);
    };

    const resubmitDocuments = async (documents: TaskDocumentInput[], successMessage: string) => {
        if (!task) return;
        const res = await submitTask(task.taskId, { documents, submissionNote: task.submission?.submissionNote ?? null });
        if (!res.success) {
            toast.error(res.message ?? "Failed to update submission");
            return;
        }
        toast.success(successMessage);
        await load();
    };

    const existingDocs = (): TaskDocumentInput[] =>
        (task?.submission?.submissionDocuments ?? []).map(({ documentName, documentType, documentUrl, fileSizeInBytes }) => ({
            documentName,
            documentType,
            documentUrl,
            fileSizeInBytes,
        }));

    const handleSubmit = async () => {
        if (!task || pendingFiles.length === 0) return;
        const res = await submitTask(task.taskId, { documents: pendingFiles });
        if (!res.success) {
            toast.error(res.message ?? "Failed to submit task");
            return;
        }
        setPendingFiles([]);
        const fresh = await load();
        const freshTasks = fresh?.assignment.tasks ?? tasks;
        const remaining = freshTasks.map((t, idx) => ({ t, idx })).filter(({ t }) => !isTaskDone(t));
        const next = remaining.find(({ idx }) => idx > activeIdx) ?? remaining[0] ?? null;
        setModal({ kind: "submitted", taskIdx: activeIdx, nextIdx: next ? next.idx : null });
    };

    const handleReplace = async (index: number, file: File) => {
        const [uploaded] = await upload([file]);
        if (!uploaded) return;
        const docs = existingDocs();
        docs[index] = uploaded;
        await resubmitDocuments(docs, "File replaced successfully");
    };

    const handleDelete = async (index: number) => {
        setModal(null);
        if (!task) return;
        const docs = existingDocs();
        if (docs.length > 1) {
            await resubmitDocuments(docs.filter((_, i) => i !== index), "File removed");
            return;
        }
        const res = await withdrawTaskSubmission(task.taskId);
        if (!res.success) {
            toast.error(res.message ?? "Failed to delete submission");
            return;
        }
        toast.success("Submission deleted. You can upload a new file.");
        await load();
    };

    if (loading) {
        return (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 583fr) minmax(0, 457fr)" }, gap: "24px" }}>
                <Skeleton variant="rounded" height={620} sx={{ borderRadius: "24px", bgcolor: "rgba(255,255,255,0.05)" }} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <Skeleton variant="rounded" height={340} sx={{ borderRadius: "24px", bgcolor: "rgba(255,255,255,0.05)" }} />
                    <Skeleton variant="rounded" height={250} sx={{ borderRadius: "24px", bgcolor: "rgba(255,255,255,0.05)" }} />
                </Box>
            </Box>
        );
    }

    if (!detail || !task) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", py: 8 }}>
                <Typography sx={{ ...ST.latoMed16, color: SA.n400 }}>This assignment is not available.</Typography>
                <LmsButton onClick={() => router.push(`/dashboard/student/batch/${batchId}/assignments`)}>Back to My Tasks</LmsButton>
            </Box>
        );
    }

    const submission = task.submission;
    const feedback =
        submission?.feedback ?? (submission?.submissionStatus === "approved" ? detail.progress.feedback : null);
    const gradeKey = submission?.feedbackGrade ?? (submission?.feedback ? null : detail.progress.feedbackGrade);
    const grade = gradeKey ? GRADE_LABEL[gradeKey] ?? gradeKey : null;

    const submittedTask = modal?.kind === "submitted" ? tasks[modal.taskIdx] : null;
    const nextTask = modal?.kind === "submitted" && modal.nextIdx !== null ? tasks[modal.nextIdx] : null;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
            <Box
                sx={{
                    flex: 1,
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 583fr) minmax(0, 457fr)" },
                    gap: "24px",
                    alignItems: "start",
                }}
            >
                <TaskOverviewCard task={task} />

                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
                    <BasicDetailsCard detail={detail} task={task} />
                    <UploadCard
                        task={task}
                        busy={busy}
                        pendingFiles={pendingFiles}
                        onAddFiles={addFiles}
                        onRemovePending={(index) => setPendingFiles((prev) => prev.filter((_, i) => i !== index))}
                        onSubmit={handleSubmit}
                        onReplace={handleReplace}
                        onDelete={(docIndex) => setModal({ kind: "confirm-delete", docIndex })}
                    />
                    {feedback ? (
                        <FeedbackCard grade={grade} feedback={feedback} />
                    ) : (
                        submission &&
                        submission.statusHistory.length > 0 && <StatusHistoryCard history={submission.statusHistory} />
                    )}
                </Box>
            </Box>

            {tasks.length > 0 && <TaskBar tasks={tasks} activeIdx={activeIdx} onSelect={selectTask} />}

            <PlacementModal open={modal?.kind === "submitted"} labelledBy="placement-modal-title" describedBy="placement-modal-body" onClose={() => setModal(null)}>
                {submittedTask && (
                    <>
                        <ModalHero
                            title={`${submittedTask.taskTitle} Submitted Successfully! 🎉`}
                            lines={
                                nextTask
                                    ? [
                                          `Great work! Your ${submittedTask.taskTitle} has been uploaded successfully.`,
                                          "",
                                          `Continue with ${nextTask.taskTitle} to complete your assignment.`,
                                      ]
                                    : [
                                          `Great work! Your ${submittedTask.taskTitle} has been uploaded successfully. You've completed all the required tasks.`,
                                          "Your submission is now under review by your trainer. We'll notify you once feedback is available.",
                                      ]
                            }
                        />
                        <ButtonRow>
                            {nextTask && modal?.kind === "submitted" && modal.nextIdx !== null ? (
                                <>
                                    <GhostButton onClick={() => setModal(null)}>Back to {submittedTask.taskTitle}</GhostButton>
                                    <LmsButton
                                        sx={{ flex: "1 1 0", minWidth: 0 }}
                                        onClick={() => {
                                            const idx = modal.nextIdx!;
                                            setModal(null);
                                            selectTask(idx);
                                        }}
                                    >
                                        Continue to {nextTask.taskTitle}
                                    </LmsButton>
                                </>
                            ) : (
                                <>
                                    <GhostButton onClick={() => router.push(`/dashboard/student/batch/${batchId}/assignments`)}>
                                        Go to My Tasks
                                    </GhostButton>
                                    <LmsButton sx={{ flex: "1 1 0", minWidth: 0 }} onClick={() => setModal(null)}>
                                        Okay, I Understood
                                    </LmsButton>
                                </>
                            )}
                        </ButtonRow>
                    </>
                )}
            </PlacementModal>

            <PlacementModal
                open={modal?.kind === "confirm-delete"}
                labelledBy="assignment-delete-title"
                gap="32px"
                onClose={() => setModal(null)}
            >
                <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "12px", width: "100%", textAlign: "center" }}>
                    <Typography id="assignment-delete-title" component="h2" sx={{ ...ST.poppinsBold28, fontSize: { xs: "24px", sm: "28px" }, color: SA.white }}>
                        Delete uploaded file?
                    </Typography>
                    <Typography sx={{ ...ST.interReg16, color: SA.n100 }}>
                        {(task.submission?.submissionDocuments.length ?? 0) > 1
                            ? "This file will be removed from your submission."
                            : "Your submission for this task will be withdrawn so you can upload a new file."}
                    </Typography>
                </Box>
                <ButtonRow>
                    <GhostButton onClick={() => setModal(null)}>Cancel</GhostButton>
                    <LmsButton
                        sx={{ flex: "1 1 0", minWidth: 0 }}
                        disabled={busy}
                        onClick={() => modal?.kind === "confirm-delete" && handleDelete(modal.docIndex)}
                    >
                        Delete
                    </LmsButton>
                </ButtonRow>
            </PlacementModal>
        </Box>
    );
}
