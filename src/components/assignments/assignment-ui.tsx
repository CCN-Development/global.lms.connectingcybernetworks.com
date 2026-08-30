"use client";

import { Box, Chip, Paper, Typography } from "@mui/material";
import type { ReactNode } from "react";
import type {
    AssignmentProgressStatus,
    FeedbackGrade,
    TaskSubmissionStatus,
} from "@/contexts/AssignmentContext";

export const A_BRAND = {
    primary: "#009DFF",
    primaryHover: "#007fd4",
    primaryBg: "#e0f2fe",
    violet: "#7c3aed",
    violetHover: "#6d28d9",
    violetBg: "#ede9fe",
    sky: "#0284c7",
    skyBg: "#e0f2fe",
    cyan: "#06b6d4",
    cyanBg: "#cffafe",
    emerald: "#059669",
    emeraldBg: "#d1fae5",
    orange: "#ea6e0b",
    orangeBg: "#ffedd5",
    amber: "#d97706",
    amberBg: "#fef3c7",
    rose: "#f43f5e",
    roseBg: "#ffe4e6",
    slate: "#64748b",
    slateBg: "#f1f5f9",
    text: "#1e293b",
    muted: "#64748b",
    border: "#e2e8f0",
} as const;

type Tone = { label: string; color: string; bg: string };

export const PROGRESS_STATUS_TONE: Record<AssignmentProgressStatus, Tone> = {
    recently_added: { label: "Not Started", color: A_BRAND.slate, bg: A_BRAND.slateBg },
    in_progress: { label: "In Progress", color: A_BRAND.sky, bg: A_BRAND.skyBg },
    under_review: { label: "Under Review", color: A_BRAND.orange, bg: A_BRAND.orangeBg },
    needs_rework: { label: "Needs Rework", color: A_BRAND.amber, bg: A_BRAND.amberBg },
    overdue: { label: "Overdue", color: A_BRAND.rose, bg: A_BRAND.roseBg },
    completed: { label: "Completed", color: A_BRAND.emerald, bg: A_BRAND.emeraldBg },
};

export const SUBMISSION_STATUS_TONE: Record<TaskSubmissionStatus, Tone> = {
    submitted: { label: "Submitted", color: A_BRAND.sky, bg: A_BRAND.skyBg },
    under_review: { label: "Under Review", color: A_BRAND.orange, bg: A_BRAND.orangeBg },
    approved: { label: "Approved", color: A_BRAND.emerald, bg: A_BRAND.emeraldBg },
    rejected: { label: "Rejected", color: A_BRAND.rose, bg: A_BRAND.roseBg },
    resubmit: { label: "Resubmit", color: A_BRAND.amber, bg: A_BRAND.amberBg },
};

export const NOT_SUBMITTED_TONE: Tone = {
    label: "Not Submitted",
    color: A_BRAND.slate,
    bg: A_BRAND.slateBg,
};

export const GRADE_TONE: Record<FeedbackGrade, Tone> = {
    excellent: { label: "Excellent", color: A_BRAND.emerald, bg: A_BRAND.emeraldBg },
    good: { label: "Good", color: A_BRAND.sky, bg: A_BRAND.skyBg },
    average: { label: "Average", color: A_BRAND.amber, bg: A_BRAND.amberBg },
    poor: { label: "Poor", color: A_BRAND.rose, bg: A_BRAND.roseBg },
};

export const GRADE_OPTIONS: { value: FeedbackGrade; label: string }[] = [
    { value: "excellent", label: "Excellent" },
    { value: "good", label: "Good" },
    { value: "average", label: "Average" },
    { value: "poor", label: "Poor" },
];

export const REVIEW_STATUS_OPTIONS: { value: Exclude<TaskSubmissionStatus, "submitted">; label: string }[] = [
    { value: "under_review", label: "Under Review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "resubmit", label: "Ask to Resubmit" },
];

export function formatDate(value: string | null | undefined): string {
    if (!value) return "--";
    return new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export function formatDateTime(value: string | null | undefined): string {
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

export function formatDuration(minutes: number | null | undefined): string {
    if (!minutes || minutes <= 0) return "--";
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (hours === 0) return `${rest} min`;
    if (rest === 0) return `${hours} hr`;
    return `${hours} hr ${rest} min`;
}

export function formatFileSize(bytes: number | null | undefined): string {
    if (!bytes || bytes <= 0) return "--";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Converts a datetime-local input value to an ISO string. */
export function toISO(localValue: string): string {
    return new Date(localValue).toISOString();
}

/** Converts an ISO string to a value usable by <input type="datetime-local">. */
export function toLocalInput(value: string | null | undefined): string {
    if (!value) return "";
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function ToneChip({ tone, size = "small" }: { tone: Tone; size?: "small" | "medium" }) {
    return (
        <Chip
            size={size}
            label={tone.label}
            sx={{
                backgroundColor: tone.bg,
                color: tone.color,
                border: `1px solid ${tone.color}`,
                fontWeight: 700,
                fontSize: 11,
                height: 22,
                borderRadius: "6px",
            }}
        />
    );
}

export function StatTile({
    label,
    value,
    color,
    bg,
    icon,
}: {
    label: string;
    value: ReactNode;
    color: string;
    bg: string;
    icon: ReactNode;
}) {
    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 2,
                border: `1px solid ${color}`,
                backgroundColor: "#ffffff",
                p: 1.25,
                display: "flex",
                alignItems: "center",
                gap: 1,
                transition: "box-shadow .2s",
                "&:hover": { boxShadow: 3 },
            }}
        >
            <Box
                sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 1.5,
                    backgroundColor: bg,
                    color,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 17,
                    flexShrink: 0,
                }}
            >
                {icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 800, color: A_BRAND.text, lineHeight: 1.1 }}>
                    {value}
                </Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: A_BRAND.muted }} noWrap>
                    {label}
                </Typography>
            </Box>
        </Paper>
    );
}

export function EmptyState({
    label,
    color = A_BRAND.violet,
    icon,
    action,
}: {
    label: string;
    color?: string;
    icon: ReactNode;
    action?: ReactNode;
}) {
    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 2,
                border: `1px dashed ${color}`,
                backgroundColor: "#ffffff",
                py: 4,
                px: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
            }}
        >
            <Box sx={{ color, fontSize: 32, display: "grid", placeItems: "center" }}>{icon}</Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: A_BRAND.muted, textAlign: "center" }}>
                {label}
            </Typography>
            {action}
        </Paper>
    );
}
