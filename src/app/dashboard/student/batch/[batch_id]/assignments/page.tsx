"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box,
    Typography,
    Button,
    TextField,
    InputAdornment,
    Select,
    MenuItem,
    FormControl,
    LinearProgress,
    Skeleton,
} from "@mui/material";
import { MdSearch, MdKeyboardArrowDown } from "react-icons/md";
import CCNButton from "@/components/buttons/CCNButton";
import { useParams, useRouter } from "next/navigation";
import {
    useAssignment,
    type AssignmentProgressStatus,
    type StudentAssignmentListItem,
} from "@/contexts/AssignmentContext";

// ── Badge config ───────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<
    AssignmentProgressStatus,
    { label: string; color: string; bg: string; border: string }
> = {
    recently_added: {
        label: "Not Started",
        color: "#94a3b8",
        bg: "#111a26",
        border: "rgba(148,163,184,0.35)",
    },
    in_progress: {
        label: "In Progress",
        color: "#38bdf8",
        bg: "#072030",
        border: "rgba(56,189,248,0.35)",
    },
    under_review: {
        label: "Under Review",
        color: "#fb923c",
        bg: "#2a1500",
        border: "rgba(251,146,60,0.35)",
    },
    needs_rework: {
        label: "Needs Rework",
        color: "#fbbf24",
        bg: "#2a1e00",
        border: "rgba(251,191,36,0.35)",
    },
    overdue: {
        label: "Overdue",
        color: "#f87171",
        bg: "#2d0808",
        border: "rgba(248,113,113,0.35)",
    },
    completed: {
        label: "Completed",
        color: "#4ade80",
        bg: "#0b2618",
        border: "rgba(74,222,128,0.35)",
    },
};

const COMPLETED_BADGE = {
    color: "#4ade80",
    bg: "#0b2618",
    border: "rgba(74,222,128,0.35)",
};

const GRADE_LABEL: Record<string, string> = {
    excellent: "Excellent",
    good: "Good",
    average: "Average",
    poor: "Poor",
};

const STATUS_FILTERS: { value: string; label: string }[] = [
    { value: "all", label: "All" },
    { value: "recently_added", label: "Not Started" },
    { value: "in_progress", label: "In Progress" },
    { value: "under_review", label: "Under Review" },
    { value: "needs_rework", label: "Needs Rework" },
    { value: "overdue", label: "Overdue" },
    { value: "completed", label: "Completed" },
];

function formatDate(value: string | null | undefined): string {
    if (!value) return "--";
    return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusBadge({ label, color, bg, border }: { label: string; color: string; bg: string; border: string }) {
    return (
        <Box sx={{
            display: "inline-flex",
            alignItems: "center",
            px: 1,
            py: 0.3,
            borderRadius: "20px",
            bgcolor: bg,
            border: `1px solid ${border}`,
        }}>
            <Typography sx={{ fontSize: "0.65rem", fontWeight: 600, color, lineHeight: 1 }}>
                {label}
            </Typography>
        </Box>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <Box>
            <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.38)", mb: 0.2 }}>
                {label}
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#fff" }}>
                {value}
            </Typography>
        </Box>
    );
}

const CARD = {
    bgcolor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    p: 1.75,
    display: "flex",
    flexDirection: "column" as const,
    gap: 1.25,
};

const OUTLINED_BTN_SX = {
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#fff",
    borderRadius: "9px",
    py: 0.65,
    fontSize: "0.75rem",
    textTransform: "none" as const,
    fontWeight: 600,
    "&:hover": { bgcolor: "rgba(255,255,255,0.07)" },
};

function AssignmentCard({
    assignment,
    onOpen,
}: {
    assignment: StudentAssignmentListItem;
    onOpen: () => void;
}) {
    const isFeedbackCard = assignment.progressStatus === "completed" && Boolean(assignment.feedback);

    if (isFeedbackCard) {
        return (
            <Box sx={CARD}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                    {assignment.assignmentTitle}
                </Typography>

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                    <InfoRow
                        label="Feedback"
                        value={assignment.feedbackGrade ? GRADE_LABEL[assignment.feedbackGrade] ?? "--" : "--"}
                    />
                    <InfoRow label="Completed on" value={formatDate(assignment.completedOn)} />
                    <InfoRow label="No. of Tasks" value={`${assignment.completedTasks}/${assignment.totalTasks}`} />
                    <InfoRow label="Marks" value={`${assignment.obtainedMarks}/${assignment.totalMarks}`} />
                </Box>

                {/* Green feedback note */}
                <Box sx={{
                    borderRadius: "2px",
                    p: 1,
                    position: "relative",
                }}>
                    <Box sx={{ position: "absolute", top: 0, left: 0, width: `5px`, height: "100%", background: "linear-gradient(180deg, #2431B3, #BE6E5D, #BDA045, #BAB31F)", borderRadius: "8px 0 0 8px", zIndex: 1 }} />
                    <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#4ade80", mb: 0.3 }}>
                        Great Job! Task Completed
                    </Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                        {assignment.feedback}
                    </Typography>
                </Box>

                <Button fullWidth sx={OUTLINED_BTN_SX} onClick={onOpen}>
                    View Feedback
                </Button>
            </Box>
        );
    }

    const badge = STATUS_BADGE[assignment.progressStatus];
    const badgeLabel =
        assignment.progressStatus === "overdue" && assignment.daysOverdue > 0
            ? `Overdue by ${assignment.daysOverdue} day${assignment.daysOverdue > 1 ? "s" : ""}`
            : badge.label;
    const allSubmitted = assignment.totalTasks > 0 && assignment.submittedTasks === assignment.totalTasks;
    const progress = assignment.totalTasks > 0 ? (assignment.submittedTasks / assignment.totalTasks) * 100 : 0;
    const canSubmitMore =
        assignment.progressStatus !== "completed" &&
        (!allSubmitted || assignment.progressStatus === "needs_rework");

    return (
        <Box sx={CARD}>
            {/* Badges row */}
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                <StatusBadge {...badge} label={badgeLabel} />
                {assignment.progressStatus === "under_review" && allSubmitted && (
                    <StatusBadge label="All tasks submitted" {...COMPLETED_BADGE} />
                )}
            </Box>

            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                {assignment.assignmentTitle}
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                <InfoRow label="Assigned on" value={formatDate(assignment.assignedOn)} />
                <InfoRow label="Due Date" value={formatDate(assignment.assignmentDueDate)} />
                <InfoRow label="No. of Tasks" value={`${assignment.submittedTasks}/${assignment.totalTasks}`} />
                <InfoRow label="Trainer" value={assignment.trainer.trainerName} />
            </Box>

            <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                    height: 5,
                    borderRadius: 3,
                    bgcolor: "rgba(255,255,255,0.08)",
                    "& .MuiLinearProgress-bar": { bgcolor: badge.color, borderRadius: 3 },
                }}
            />

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {!canSubmitMore ? (
                    <Button fullWidth onClick={onOpen} sx={OUTLINED_BTN_SX}>
                        View Submission
                    </Button>
                ) : (
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, width: "100%" }}>
                        <Button fullWidth sx={OUTLINED_BTN_SX} onClick={onOpen}>
                            View Details
                        </Button>
                        <CCNButton className="flex-1 text-sm! py-1.5!" onClick={onOpen}>
                            Submit your Work
                        </CCNButton>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

// ── Dropdown ───────────────────────────────────────────────────────────────────

const DROPDOWN_SX = {
    height: 34,
    fontSize: "0.75rem",
    color: "#fff",
    bgcolor: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "9px",
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    "& .MuiSelect-icon": { color: "rgba(255,255,255,0.5)", right: 6 },
    pr: 0,
} as const;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AssignmentsPage() {
    const router = useRouter();
    const params = useParams<{ batch_id: string }>();
    const batchId = params?.batch_id as string;

    const { studentAssignments, loadingAssignments, getStudentBatchAssignments } = useAssignment();

    const [status, setStatus] = useState("all");
    const [sortBy, setSortBy] = useState("date");
    const [search, setSearch] = useState("");

    const refresh = useCallback(() => {
        if (!batchId) return;
        getStudentBatchAssignments(batchId, {
            status: status === "all" ? undefined : status,
            search: search.trim() || undefined,
        });
    }, [batchId, getStudentBatchAssignments, status, search]);

    useEffect(() => {
        const timer = setTimeout(refresh, search ? 300 : 0);
        return () => clearTimeout(timer);
    }, [refresh, search]);

    const filtered = useMemo(() => {
        const list = [...studentAssignments];
        if (sortBy === "title") {
            list.sort((a, b) => a.assignmentTitle.localeCompare(b.assignmentTitle));
        } else if (sortBy === "due") {
            list.sort((a, b) => new Date(a.assignmentDueDate).getTime() - new Date(b.assignmentDueDate).getTime());
        } else {
            list.sort((a, b) => new Date(b.assignedOn).getTime() - new Date(a.assignedOn).getTime());
        }
        return list;
    }, [studentAssignments, sortBy]);

    const open = (assignmentId: string) =>
        router.push(`/dashboard/student/batch/${batchId}/assignments/${assignmentId}`);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>

            {/* Filter bar */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", fontWeight: 500, flexShrink: 0 }}>
                    Total {filtered.length} Assignment{filtered.length === 1 ? "" : "s"}
                </Typography>

                <Box sx={{ flex: 1 }} />

                {/* Sort By Status */}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        displayEmpty
                        IconComponent={MdKeyboardArrowDown}
                        sx={DROPDOWN_SX}
                        renderValue={(v) => `Sort By ${STATUS_FILTERS.find((f) => f.value === v)?.label ?? "All"}`}
                        MenuProps={{
                            slotProps: {
                                paper: {
                                    sx: {
                                        bgcolor: "#0f0a1e",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "10px",
                                        color: "#fff",
                                        fontSize: "0.75rem",
                                    },
                                },
                            },
                        }}
                    >
                        {STATUS_FILTERS.map((filter) => (
                            <MenuItem key={filter.value} value={filter.value} sx={{ fontSize: "0.75rem" }}>
                                {filter.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Date Range */}
                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        displayEmpty
                        IconComponent={MdKeyboardArrowDown}
                        sx={DROPDOWN_SX}
                        renderValue={(v) => `Sort: ${v === "date" ? "Assigned" : v === "due" ? "Due Date" : "Title"}`}
                        MenuProps={{
                            slotProps: {
                                paper: {
                                    sx: {
                                        bgcolor: "#0f0a1e",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "10px",
                                        color: "#fff",
                                        fontSize: "0.75rem",
                                    },
                                },
                            },
                        }}
                    >
                        <MenuItem value="date" sx={{ fontSize: "0.75rem" }}>Assigned Date</MenuItem>
                        <MenuItem value="due" sx={{ fontSize: "0.75rem" }}>Due Date</MenuItem>
                        <MenuItem value="title" sx={{ fontSize: "0.75rem" }}>Title</MenuItem>
                    </Select>
                </FormControl>

                {/* Search */}
                <TextField
                    size="small"
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MdSearch size={15} color="rgba(255,255,255,0.4)" />
                                </InputAdornment>
                            ),
                        },
                    }}
                    sx={{
                        width: 190,
                        "& .MuiOutlinedInput-root": {
                            height: 34,
                            fontSize: "0.75rem",
                            color: "#fff",
                            bgcolor: "rgba(255,255,255,0.05)",
                            borderRadius: "9px",
                            "& fieldset": { border: "1px solid rgba(255,255,255,0.1)" },
                            "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                            "&.Mui-focused fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                        },
                        "& input::placeholder": { color: "rgba(255,255,255,0.35)", opacity: 1 },
                    }}
                />
            </Box>

            {/* Cards grid */}
            {loadingAssignments && filtered.length === 0 ? (
                <Box sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                    gap: 1.5,
                }}>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton
                            key={index}
                            variant="rounded"
                            height={215}
                            sx={{ borderRadius: "14px", bgcolor: "rgba(255,255,255,0.05)" }}
                        />
                    ))}
                </Box>
            ) : filtered.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 6 }}>
                    <Typography sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>
                        No assignments found.
                    </Typography>
                </Box>
            ) : (
                <Box sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                    gap: 1.5,
                }}>
                    {filtered.map((assignment) => (
                        <AssignmentCard
                            key={assignment.batchAssignmentId}
                            assignment={assignment}
                            onOpen={() => open(assignment.batchAssignmentId)}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
}
