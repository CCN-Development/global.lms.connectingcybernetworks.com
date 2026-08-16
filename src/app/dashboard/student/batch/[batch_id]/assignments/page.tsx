"use client";
import React, { useState } from "react";
import {
    Box,
    Typography,
    Button,
    TextField,
    InputAdornment,
    Select,
    MenuItem,
    FormControl,
} from "@mui/material";
import { MdSearch, MdKeyboardArrowDown } from "react-icons/md";
import CCNButton from "@/components/buttons/CCNButton";
import { useRouter } from "next/navigation";
// ── Types ─────────────────────────────────────────────────────────────────────

type AssignmentStatus =
    | "recently_added"
    | "under_review"
    | "under_review_completed"
    | "overdue"
    | "feedback_received";

interface BaseAssignment {
    id: number;
    title: string;
    status: AssignmentStatus;
}

interface ActiveAssignment extends BaseAssignment {
    status: "recently_added" | "under_review" | "under_review_completed" | "overdue";
    assignedOn: string;
    dueDate: string;
    tasksCompleted: number;
    totalTasks: number;
    trainer: string;
    completedBadge?: string; // for "under_review_completed"
}

interface FeedbackAssignment extends BaseAssignment {
    status: "feedback_received";
    feedback: string;
    completedOn: string;
    feedbackNote: string;
}

type Assignment = ActiveAssignment | FeedbackAssignment;

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_ASSIGNMENTS: Assignment[] = [
    {
        id: 1,
        title: "Subnetting Practice Lab",
        status: "recently_added",
        assignedOn: "Jul 27, 2026",
        dueDate: "Aug 3, 2026",
        tasksCompleted: 0,
        totalTasks: 3,
        trainer: "Rahul Sharma",
    },
    {
        id: 2,
        title: "OSI Model Documentation",
        status: "under_review_completed",
        assignedOn: "Jul 20, 2026",
        dueDate: "Jul 26, 2026",
        tasksCompleted: 5,
        totalTasks: 5,
        trainer: "Kushal Korde",
        completedBadge: "Submitted 3 days early!",
    },
    {
        id: 3,
        title: "Packet Tracer: VLAN Setup",
        status: "under_review",
        assignedOn: "Jul 18, 2026",
        dueDate: "Jul 24, 2026",
        tasksCompleted: 4,
        totalTasks: 4,
        trainer: "Kushal Korde",
    },
    {
        id: 4,
        title: "Firewall Rules Analysis",
        status: "overdue",
        assignedOn: "Jul 10, 2026",
        dueDate: "Jul 17, 2026",
        tasksCompleted: 2,
        totalTasks: 5,
        trainer: "Rahul Sharma",
    },
    {
        id: 5,
        title: "Network Protocol Report",
        status: "feedback_received",
        feedback: "Excellent",
        completedOn: "Jul 15, 2026",
        feedbackNote: "Thorough analysis with accurate diagrams. Submitted well before the deadline. Keep up the excellent work!",
    },
    {
        id: 6,
        title: "IP Addressing Worksheet",
        status: "feedback_received",
        feedback: "Good",
        completedOn: "Jul 8, 2026",
        feedbackNote: "All answers correct with minor formatting issues. Good understanding of CIDR notation demonstrated.",
    },
];

// ── Badge config ───────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<
    string,
    { label: string; color: string; bg: string; border: string }
> = {
    recently_added: {
        label: "Recently Added",
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
    under_review_completed: {
        label: "Under Review",
        color: "#fb923c",
        bg: "#2a1500",
        border: "rgba(251,146,60,0.35)",
    },
    overdue: {
        label: "Overdue by 12 days",
        color: "#f87171",
        bg: "#2d0808",
        border: "rgba(248,113,113,0.35)",
    },
};

const COMPLETED_BADGE = {
    color: "#4ade80",
    bg: "#0b2618",
    border: "rgba(74,222,128,0.35)",
};

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

function AssignmentCard({ assignment }: { assignment: Assignment }) {
    const router = useRouter();
    const CARD = {
        bgcolor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "14px",
        p: 1.75,
        display: "flex",
        flexDirection: "column" as const,
        gap: 1.25,
    };

    if (assignment.status === "feedback_received") {
        const a = assignment as FeedbackAssignment;
        return (
            <Box sx={CARD}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                    {a.title}
                </Typography>

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                    <InfoRow label="Feedback" value={a.feedback} />
                    <InfoRow label="Completed on" value={a.completedOn} />
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
                        {a.feedbackNote}
                    </Typography>
                </Box>

                <Button
                    fullWidth
                    sx={{
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#fff",
                        borderRadius: "9px",
                        py: 0.65,
                        fontSize: "0.75rem",
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": { bgcolor: "rgba(255,255,255,0.07)" },
                    }}
                    onClick={() => {
                        router.push(`/dashboard/student/batch/1/assignments/${a.id}`);
                    }}
                >
                    View Feedback
                </Button>
            </Box>
        );
    }

    const a = assignment as ActiveAssignment;
    const badge = STATUS_BADGE[a.status];

    return (
        <Box sx={CARD}>
            {/* Badges row */}
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                <StatusBadge {...badge} />
                {a.status === "under_review_completed" && a.completedBadge && (
                    <StatusBadge
                        label={a.completedBadge}
                        {...COMPLETED_BADGE}
                    />
                )}
            </Box>

            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                {a.title}
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                <InfoRow label="Assigned on" value={a.assignedOn} />
                <InfoRow label="Due Date" value={a.dueDate} />
                <InfoRow label="No. of Tasks" value={`${a.tasksCompleted}/${a.totalTasks}`} />
                <InfoRow label="Trainer" value={a.trainer} />
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>

                {/* Buttons */}
                {(a.status === "recently_added" || a.status === "overdue") && (
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, width: "100%", }}>
                        <Button
                            fullWidth
                            sx={{
                                border: "1px solid rgba(255,255,255,0.15)",
                                color: "#fff",
                                borderRadius: "9px",
                                py: 0.65,
                                fontSize: "0.75rem",
                                textTransform: "none",
                                fontWeight: 600,
                                "&:hover": { bgcolor: "rgba(255,255,255,0.07)" },
                            }}
                            onClick={() => {
                                router.push(`/dashboard/student/batch/1/assignments/${a.id}`);
                            }}
                        >
                            View Details
                        </Button>
                        <CCNButton className="flex-1 text-sm! py-1.5!" onClick={() => {
                            router.push(`/dashboard/student/batch/1/assignments/${a.id}`);
                        }}>
                            Submit your Work
                        </CCNButton>
                    </Box>
                )}

                {(a.status === "under_review" || a.status === "under_review_completed") && (
                    <Button
                        fullWidth
                        onClick={() => {
                            router.push(`/dashboard/student/batch/1/assignments/${a.id}`);
                        }}
                        sx={{
                            border: "1px solid rgba(255,255,255,0.15)",
                            color: "#fff",
                            borderRadius: "9px",
                            py: 0.65,
                            fontSize: "0.75rem",
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": { bgcolor: "rgba(255,255,255,0.07)" },
                        }}
                    >
                        View Submission
                    </Button>
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
    const [sortBy, setSortBy] = useState("status");
    const [dateRange, setDateRange] = useState("all");
    const [search, setSearch] = useState("");

    const filtered = MOCK_ASSIGNMENTS.filter((a) =>
        a.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>

            {/* Filter bar */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", fontWeight: 500, flexShrink: 0 }}>
                    Total {filtered.length} Tasks in All
                </Typography>

                <Box sx={{ flex: 1 }} />

                {/* Sort By Status */}
                <FormControl size="small" sx={{ minWidth: 130 }}>
                    <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        displayEmpty
                        IconComponent={MdKeyboardArrowDown}
                        sx={DROPDOWN_SX}
                        renderValue={(v) => `Sort By ${v === "status" ? "Status" : v}`}
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
                        <MenuItem value="status" sx={{ fontSize: "0.75rem" }}>Status</MenuItem>
                        <MenuItem value="date" sx={{ fontSize: "0.75rem" }}>Date</MenuItem>
                        <MenuItem value="title" sx={{ fontSize: "0.75rem" }}>Title</MenuItem>
                    </Select>
                </FormControl>

                {/* Date Range */}
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        displayEmpty
                        IconComponent={MdKeyboardArrowDown}
                        sx={DROPDOWN_SX}
                        renderValue={(v) => `Date Range${v !== "all" ? `: ${v}` : ""}`}
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
                        <MenuItem value="all" sx={{ fontSize: "0.75rem" }}>All Time</MenuItem>
                        <MenuItem value="week" sx={{ fontSize: "0.75rem" }}>This Week</MenuItem>
                        <MenuItem value="month" sx={{ fontSize: "0.75rem" }}>This Month</MenuItem>
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
            <Box sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                gap: 1.5,
            }}>
                {filtered.map((assignment) => (
                    <AssignmentCard key={assignment.id} assignment={assignment} />
                ))}
            </Box>

            {filtered.length === 0 && (
                <Box sx={{ textAlign: "center", py: 6 }}>
                    <Typography sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>
                        No tasks found.
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
