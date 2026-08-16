"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { MdArrowForward, MdKeyboardArrowDown } from "react-icons/md";

// ─── Types ────────────────────────────────────────────────────────────────
type TaskStatus = "Overdue" | "Pending" | "Completed" | string;

export interface TaskItem {
    category: string;      // e.g. "LAB ASSIGNMENT"
    title: string;
    batchName: string;
    dueDate: string;
    assignedBy: string;
    status: TaskStatus;
    badgeLabel: string;
    badgeType?: "danger" | "warning" | "success";
}

interface QuickTaskDataProps {
    tasks?: TaskItem[];
    onSort?: () => void;
    onSeeAll?: () => void;
    onViewDetails?: (task: TaskItem) => void;
}

// ─── Badge palette ────────────────────────────────────────────────────────
const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
    danger: { bg: "rgb(255, 183, 183)", text: "#FF0000" },
    warning: { bg: "rgb(255, 211, 175)", text: "#FC7100" },
    success: { bg: "rgb(188, 255, 213)", text: "#006D28" },
};

// ─── Default data ─────────────────────────────────────────────────────────
const DEFAULT_TASKS: TaskItem[] = [
    {
        category: "LAB ASSIGNMENT",
        title: "Network Fundamentals Lab",
        batchName: "CCNA",
        dueDate: "25 Feb • 4:00 PM",
        assignedBy: "Kushal Korde",
        status: "Overdue",
        badgeLabel: "Overdue by 2 days",
        badgeType: "danger",
    },
    {
        category: "MCQ QUIZ",
        title: "OSI Model Assessment",
        batchName: "CCNA",
        dueDate: "27 Feb • 6:00 PM",
        assignedBy: "Harshit Sharma",
        status: "Pending",
        badgeLabel: "3 days left",
        badgeType: "warning",
    },
    {
        category: "ASSIGNMENT SUBMISSION",
        title: "Ethical Hacking Assignment",
        batchName: "Ethical Hacking",
        dueDate: "28 Feb • 11:59 PM",
        assignedBy: "Kushal Korde",
        status: "Pending",
        badgeLabel: "3 days left",
        badgeType: "warning",
    },
];

// ─── Detail cell ──────────────────────────────────────────────────────────
function DetailCell({ label, value }: { label: string; value: string }) {
    return (
        <Box sx={{ minWidth: 0 }}>
            <Typography
                sx={{
                    fontSize: "0.65rem",
                    color: "rgba(255,255,255,0.4)",
                    fontWeight: 400,
                    mb: 0.3,
                }}
            >
                {label}
            </Typography>
            <Typography
                sx={{
                    fontSize: "0.775rem",
                    color: "#fff",
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

// ─── Component ────────────────────────────────────────────────────────────
export default function QuickTaskData({
    tasks = DEFAULT_TASKS,
    onSort,
    onSeeAll,
    onViewDetails,
}: QuickTaskDataProps) {
    return (
        <Box sx={{ width: "100%" }}>
            {/* ── Header ── */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1.5,
                    gap: 1,
                }}
            >
                <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
                    Your Tasks
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {/* Sort By */}
                    <Box
                        onClick={onSort}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.4,
                            bgcolor: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "8px",
                            px: 1.25,
                            py: 0.6,
                            cursor: "pointer",
                            color: "rgba(255,255,255,0.75)",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                            transition: "background 0.15s",
                        }}
                    >
                        <Typography sx={{ fontSize: "0.725rem", fontWeight: 500 }}>
                            Sort By
                        </Typography>
                        <MdKeyboardArrowDown size={15} />
                    </Box>

                    {/* See All */}
                    <Box
                        onClick={onSeeAll}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.4,
                            cursor: "pointer",
                            color: "#5b8df6",
                            "&:hover": { color: "#93b4fc" },
                            transition: "color 0.15s",
                        }}
                    >
                        <Typography sx={{ fontSize: "0.775rem", fontWeight: 600 }}>
                            See All
                        </Typography>
                        <MdArrowForward size={14} />
                    </Box>
                </Box>
            </Box>

            {/* ── Task cards (horizontal scroll) ── */}
            <Box
                sx={{
                    display: "flex",
                    gap: 1.5,
                    overflowX: "auto",
                    pb: 1,
                    scrollSnapType: "x mandatory",
                    "&::-webkit-scrollbar": { height: 1 },
                    "&::-webkit-scrollbar-thumb": {
                        bgcolor: "rgba(91, 140, 246, 0.02)",
                        borderRadius: 4,
                    },
                }}
            >
                {tasks.map((task, i) => {
                    const badge = BADGE_COLORS[task.badgeType ?? "warning"] ?? BADGE_COLORS.warning;

                    return (
                        <Box
                            key={i}
                            sx={{
                                flex: "0 0 auto",
                                width: { xs: 260, sm: 300 },
                                scrollSnapAlign: "start",
                                background: "linear-gradient( #391156 0%, #020514 60%)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: "16px",
                                p: 2,
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            {/* Category */}
                            <Typography
                                sx={{
                                    fontSize: "0.65rem",
                                    fontWeight: 500,
                                    color: "rgba(255,255,255,0.4)",
                                    letterSpacing: "0.06em",
                                    textTransform: "uppercase",
                                    mb: 0.5,
                                }}
                            >
                                {task.category}
                            </Typography>

                            {/* Title */}
                            <Typography
                                sx={{
                                    fontSize: "0.95rem",
                                    fontWeight: 700,
                                    color: "#fff",
                                    lineHeight: 1.3,
                                    mb: 1.5,
                                }}
                            >
                                {task.title}
                            </Typography>

                            {/* Details box (dashed border) */}
                            <Box
                                sx={{
                                    border: "1px dashed rgba(255,255,255,0.15)",
                                    borderRadius: "12px",
                                    p: 1.5,
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    rowGap: 1.5,
                                    columnGap: 1,
                                    mb: 1.75,
                                }}
                            >
                                <DetailCell label="Batch Name" value={task.batchName} />
                                <DetailCell label="Due Date" value={task.dueDate} />
                                <DetailCell label="Assigned By" value={task.assignedBy} />
                                <DetailCell label="Status" value={task.status} />
                            </Box>

                            {/* Footer: badge + view details */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 1,
                                    mt: "auto",
                                }}
                            >
                                <Box
                                    sx={{
                                        bgcolor: badge.bg,
                                        borderRadius: "2px",
                                        px: 1.25,
                                        py: 0.4,
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: "0.65rem",
                                            fontWeight: 600,
                                            color: badge.text,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {task.badgeLabel}
                                    </Typography>
                                </Box>

                                <Box
                                    onClick={() => onViewDetails?.(task)}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        bgcolor: "rgba(0, 0, 0, 0.04)",
                                        borderRadius: "8px",
                                        px: 1.25,
                                        py: 0.55,
                                        cursor: "pointer",
                                        color: "#fff",
                                        "&:hover": { bgcolor: "rgba(255,255,255,0.09)" },
                                        transition: "background 0.15s",
                                        flexShrink: 0,
                                    }}
                                >
                                    <Typography sx={{ fontSize: "0.7rem", fontWeight: 500 }}>
                                        View Details
                                    </Typography>
                                    <MdArrowForward size={13} />
                                </Box>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}
