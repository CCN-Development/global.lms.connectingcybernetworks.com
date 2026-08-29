"use client";

import { Box, Chip, Paper } from "@mui/material";
import { BRAND } from "../../student-profiles/[student_id]/ui";

export { BRAND };

/* ============================================================== */
/* Value coercion — many onboarding fields are typed `unknown`     */
/* ============================================================== */

export function asText(value: unknown): string {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value.trim();
    if (typeof value === "number") return String(value);
    if (typeof value === "boolean") return value ? "Yes" : "No";
    try {
        return JSON.stringify(value);
    } catch {
        return "";
    }
}

/** Picks a human label out of an unknown reference object, falling back to raw text. */
export function labelOf(value: unknown): string {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        const record = value as Record<string, unknown>;
        const key = ["packageName", "courseName", "benefitName", "name", "title", "label"]
            .find((k) => typeof record[k] === "string" && record[k]);
        if (key) return record[key] as string;
    }
    return asText(value);
}

/** Prefers a populated reference array, else the raw id array. */
export function labelList(reference: unknown, fallback: unknown): string[] {
    const source = Array.isArray(reference) && reference.length ? reference : fallback;
    if (!Array.isArray(source)) return [];
    return source.map(labelOf).filter(Boolean);
}

export function formatMoney(value: number | null | undefined) {
    if (value === null || value === undefined) return "—";
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function formatDate(value: string | null | undefined) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(value: string | null | undefined) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

export function formatFileSize(bytes: number | null | undefined) {
    if (!bytes || bytes <= 0) return "—";
    const units = ["B", "KB", "MB", "GB"];
    const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / 1024 ** power).toFixed(power === 0 ? 0 : 1)} ${units[power]}`;
}

export function titleCase(value: string) {
    return value
        .replace(/[_-]+/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ============================================================== */
/* Presentational primitives                                       */
/* ============================================================== */

export function StatCard({
    label, value, hint, color, bg, icon,
}: {
    label: string;
    value: React.ReactNode;
    hint?: string;
    color: string;
    bg: string;
    icon: React.ReactNode;
}) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 1.5,
                borderRadius: "8px",
                border: `1px solid ${color}`,
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                transition: "box-shadow .15s ease, transform .15s ease",
                "&:hover": { boxShadow: "0 6px 16px rgba(15,23,42,0.1)", transform: "translateY(-1px)" },
            }}
        >
            <Box
                sx={{
                    width: 32, height: 32, borderRadius: "8px", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backgroundColor: bg, color,
                }}
            >
                {icon}
            </Box>
            <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 truncate">{label}</p>
                <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
                {hint && <p className="text-[10px] text-gray-400 truncate">{hint}</p>}
            </div>
        </Paper>
    );
}

export function CheckPill({ label, done, doneLabel, pendingLabel }: {
    label: string;
    done: boolean;
    doneLabel?: string;
    pendingLabel?: string;
}) {
    const color = done ? BRAND.emerald : BRAND.rose;
    const bg = done ? BRAND.emeraldBg : BRAND.roseBg;
    return (
        <div
            className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5"
            style={{ border: `1px solid ${color}`, backgroundColor: bg }}
        >
            <span className="text-[11px] font-semibold truncate" style={{ color: "#374151" }}>{label}</span>
            <span className="text-[10px] font-bold shrink-0" style={{ color }}>
                {done ? (doneLabel ?? "Verified") : (pendingLabel ?? "Pending")}
            </span>
        </div>
    );
}

export function TagList({ items, color, bg, empty = "None selected" }: {
    items: string[];
    color: string;
    bg: string;
    empty?: string;
}) {
    if (!items.length) return <span className="text-xs text-gray-300">{empty}</span>;
    return (
        <div className="flex flex-wrap gap-1">
            {items.map((item, index) => (
                <Chip
                    key={`${item}-${index}`}
                    size="small"
                    label={item}
                    sx={{
                        height: 22, fontSize: "0.68rem", fontWeight: 600, borderRadius: "6px",
                        backgroundColor: bg, color, border: `1px solid ${color}`,
                        maxWidth: 260,
                    }}
                />
            ))}
        </div>
    );
}

export function EmptyBlock({ label, color = BRAND.sky }: { label: string; color?: string }) {
    return (
        <Paper elevation={0} sx={{ borderRadius: "8px", border: `1px solid ${color}`, py: 4, textAlign: "center" }}>
            <span className="text-xs text-gray-400">{label}</span>
        </Paper>
    );
}
