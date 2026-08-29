"use client";

import type { RequestStatus, StudentRequest } from "@/contexts/RequestContext";

/** Tone palette for the dark student theme. */
export const REQUEST_TONE: Record<
    "active" | "resolved" | "rejected",
    { dot: string; bg: string; text: string; label: string }
> = {
    active: { dot: "#003347", bg: "rgb(168, 232, 255)", text: "#00538B", label: "Active" },
    resolved: { dot: "#00461A", bg: "rgb(171, 255, 202)", text: "#008932", label: "Resolved" },
    rejected: { dot: "#5F0000", bg: "rgb(255, 174, 174)", text: "#7B0000", label: "Rejected" },
};

export const STATUS_TONE: Record<RequestStatus, { bg: string; text: string }> = {
    pending: { bg: "#3a2a08", text: "#fbbf24" },
    in_review: { bg: "#0b2f45", text: "#38bdf8" },
    approved: { bg: "#06301b", text: "#34d399" },
    resolved: { bg: "#06301b", text: "#34d399" },
    rejected: { bg: "#3d0d15", text: "#fb7185" },
    withdrawn: { bg: "#26262b", text: "#a1a1aa" },
};

export function formatDateTime(value?: string | null): string {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    const day = date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const time = date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${day} • ${time}`;
}

export function formatDate(value?: string | null): string {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function formatFileSize(bytes?: number | null): string {
    if (!bytes || bytes <= 0) return "";
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/** Hours left before the promised SLA elapses, or null once it has passed. */
export function hoursRemaining(request: StudentRequest): number | null {
    const deadline = new Date(request.createdAt).getTime() + request.expectedResponseHours * 3600_000;
    const diff = deadline - Date.now();
    if (diff <= 0) return null;
    return Math.max(1, Math.ceil(diff / 3600_000));
}

/** The label + timestamp shown in the card's highlighted status row. */
export function statusRow(request: StudentRequest): { label: string; date: string } {
    switch (request.requestStatus) {
        case "pending":
            return { label: "Awaiting RM pickup", date: formatDateTime(request.createdAt) };
        case "in_review":
            return { label: "Under review by RM", date: formatDateTime(request.updatedAt) };
        case "approved":
            return { label: "Accepted on", date: formatDateTime(request.requestResolutionDate) };
        case "resolved":
            return { label: "Resolved on", date: formatDateTime(request.requestResolutionDate) };
        case "rejected":
            return { label: "Feedback Added", date: formatDateTime(request.requestResolutionDate) };
        case "withdrawn":
            return { label: "Withdrawn on", date: formatDateTime(request.withdrawnAt) };
    }
}
