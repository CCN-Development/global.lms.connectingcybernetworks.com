"use client";

import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    MdAdd,
    MdArrowBack,
    MdArrowDownward,
    MdArrowUpward,
    MdCloudUpload,
    MdDelete,
    MdOutlineArticle,
    MdOutlineDashboardCustomize,
    MdOutlineQuiz,
    MdOutlineScience,
    MdOutlineSmartDisplay,
    MdOutlineViewModule,
} from "react-icons/md";
import type { StandardResponse } from "@/contexts/AuthContext";
import { useCourse, type AssetFolder, type CardType, type LessonKind } from "@/contexts/CourseContext";

export const COURSE_ADMIN_BASE = "/dashboard/admin/course-management";

/* ───────────────────────────── formatting ───────────────────────────── */

export function formatDuration(totalSec: number | null | undefined): string {
    if (!totalSec || totalSec <= 0) return "0m";
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = Math.round(totalSec % 60);
    if (h) return `${h}h ${m}m`;
    if (m) return s && m < 10 ? `${m}m ${s}s` : `${m}m`;
    return `${s}s`;
}

export function formatDate(value: string | null | undefined): string {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatBytes(bytes: number | null | undefined): string {
    if (!bytes) return "—";
    const units = ["B", "KB", "MB", "GB"];
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit += 1;
    }
    return `${value.toFixed(unit ? 1 : 0)} ${units[unit]}`;
}

/** Toasts a StandardResponse and returns whether it succeeded. */
export function notify<T>(res: StandardResponse<T>, success?: string): res is StandardResponse<T> & { data: T } {
    if (res.success) {
        const message = success ?? res.message;
        if (message) toast.success(message);
        return true;
    }
    toast.error(res.message || "Something went wrong");
    return false;
}

/** Returns a new id order with item `index` moved one step up (-1) or down (+1). */
export function moveId(ids: string[], index: number, direction: -1 | 1): string[] {
    const target = index + direction;
    if (target < 0 || target >= ids.length) return ids;
    const next = [...ids];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
}

/* ───────────────────────────── layout pieces ───────────────────────────── */

export function GlassCard({ children, sx, ...rest }: React.ComponentProps<typeof Box>) {
    return (
        <Box
            {...rest}
            sx={{
                position: "relative",
                background: "rgba(9,9,21,0.44)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "20px",
                backdropFilter: "blur(6px)",
                ...sx,
            }}
        >
            {children}
        </Box>
    );
}

export function PageHeader({
    title,
    subtitle,
    actions,
    backHref,
    badge,
}: {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    actions?: React.ReactNode;
    backHref?: string;
    badge?: React.ReactNode;
}) {
    return (
        <Box sx={{ display: "flex", alignItems: { xs: "flex-start", md: "center" }, gap: 2, flexWrap: "wrap", mb: 2.5 }}>
            {backHref && (
                <IconButton component={Link} href={backHref} aria-label="Back" sx={{ border: "1px solid rgba(255,255,255,0.12)" }}>
                    <MdArrowBack />
                </IconButton>
            )}
            <Box sx={{ flex: 1, minWidth: 220 }}>
                <Stack sx={{ alignItems: "center", flexWrap: "wrap" }} direction="row" spacing={1.5} useFlexGap>
                    <Typography variant="h5" sx={{ fontSize: { xs: 20, md: 24 } }}>
                        {title}
                    </Typography>
                    {badge}
                </Stack>
                {subtitle && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
            {actions && (
                <Stack sx={{ flexWrap: "wrap" }} direction="row" spacing={1} useFlexGap>
                    {actions}
                </Stack>
            )}
        </Box>
    );
}

const SUB_NAV = [
    { label: "Courses", href: COURSE_ADMIN_BASE, exact: true },
    { label: "Video Library", href: `${COURSE_ADMIN_BASE}/videos` },
    { label: "Instructors", href: `${COURSE_ADMIN_BASE}/instructors` },
    { label: "Ranks & Badges", href: `${COURSE_ADMIN_BASE}/gamification` },
];

/** Section switcher shared by every course-management page. */
export function CourseAdminNav() {
    const pathname = usePathname() ?? "";
    return (
        <Stack direction="row" spacing={1} sx={{ mb: 2.5, overflowX: "auto", pb: 0.5 }}>
            {SUB_NAV.map((item) => {
                const active = item.exact
                    ? pathname === item.href || (pathname.startsWith(`${item.href}/`) && !SUB_NAV.some((o) => !o.exact && pathname.startsWith(o.href)))
                    : pathname.startsWith(item.href);
                return (
                    <Button
                        key={item.href}
                        component={Link}
                        href={item.href}
                        size="small"
                        variant={active ? "contained" : "outlined"}
                        color={active ? "primary" : "inherit"}
                        sx={{ whiteSpace: "nowrap", px: 2, borderRadius: "999px", flexShrink: 0 }}
                    >
                        {item.label}
                    </Button>
                );
            })}
        </Stack>
    );
}

export function StatTile({ label, value, hint }: { label: string; value: React.ReactNode; hint?: React.ReactNode }) {
    return (
        <GlassCard sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.6 }}>
                {label}
            </Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 700, mt: 0.5, fontFamily: "var(--font-poppins), sans-serif" }}>{value}</Typography>
            {hint && (
                <Typography variant="caption" color="text.secondary">
                    {hint}
                </Typography>
            )}
        </GlassCard>
    );
}

export function EmptyState({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
    return (
        <GlassCard sx={{ p: { xs: 3, md: 5 }, textAlign: "center" }}>
            {icon && <Box sx={{ fontSize: 40, color: "text.secondary", mb: 1, display: "flex", justifyContent: "center" }}>{icon}</Box>}
            <Typography variant="subtitle1">{title}</Typography>
            {description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 460, mx: "auto" }}>
                    {description}
                </Typography>
            )}
            {action && <Box sx={{ mt: 2 }}>{action}</Box>}
        </GlassCard>
    );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, py: 8, color: "text.secondary" }}>
            <CircularProgress size={22} />
            <Typography variant="body2">{label}</Typography>
        </Box>
    );
}

/* ───────────────────────────── chips & icons ───────────────────────────── */

const STATUS_COLORS: Record<string, "default" | "success" | "warning" | "error" | "info" | "primary" | "secondary"> = {
    published: "success",
    draft: "warning",
    archived: "default",
    ready: "success",
    processing: "info",
    pending_upload: "warning",
    error: "error",
    deleted: "default",
    completed: "success",
    in_progress: "info",
    unlocked: "primary",
    locked: "default",
    not_started: "default",
};

export function StatusChip({ status, size = "small" }: { status: string; size?: "small" | "medium" }) {
    return (
        <Chip
            size={size}
            label={status.replace(/_/g, " ")}
            color={STATUS_COLORS[status] ?? "default"}
            variant="outlined"
            sx={{ textTransform: "capitalize", height: size === "small" ? 22 : undefined }}
        />
    );
}

const KIND_META: Record<LessonKind | CardType, { label: string; icon: React.ReactNode; color: string }> = {
    module: { label: "Module", icon: <MdOutlineViewModule />, color: "#A855F7" },
    video: { label: "Video", icon: <MdOutlineSmartDisplay />, color: "#38BDF8" },
    theory: { label: "Theory", icon: <MdOutlineArticle />, color: "#22C55E" },
    reading: { label: "Reading", icon: <MdOutlineArticle />, color: "#22C55E" },
    quiz: { label: "Quiz", icon: <MdOutlineQuiz />, color: "#F59E0B" },
    lab: { label: "Lab", icon: <MdOutlineScience />, color: "#F472B6" },
};

export function KindIcon({ kind, size = 20 }: { kind: LessonKind | CardType; size?: number }) {
    const meta = KIND_META[kind] ?? { icon: <MdOutlineDashboardCustomize />, color: "#A3A8BD" };
    return (
        <Box
            component="span"
            sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: size + 12,
                height: size + 12,
                borderRadius: "10px",
                fontSize: size,
                color: meta.color,
                background: `${meta.color}1f`,
                flexShrink: 0,
            }}
        >
            {meta.icon}
        </Box>
    );
}

export function kindLabel(kind: LessonKind | CardType) {
    return KIND_META[kind]?.label ?? kind;
}

/* ───────────────────────────── controls ───────────────────────────── */

export function MoveButtons({ onUp, onDown, disableUp, disableDown }: { onUp: () => void; onDown: () => void; disableUp?: boolean; disableDown?: boolean }) {
    return (
        <Stack direction="row" spacing={0}>
            <Tooltip title="Move up">
                <span>
                    <IconButton size="small" onClick={onUp} disabled={disableUp} aria-label="Move up">
                        <MdArrowUpward />
                    </IconButton>
                </span>
            </Tooltip>
            <Tooltip title="Move down">
                <span>
                    <IconButton size="small" onClick={onDown} disabled={disableDown} aria-label="Move down">
                        <MdArrowDownward />
                    </IconButton>
                </span>
            </Tooltip>
        </Stack>
    );
}

/** Editable list of short strings (overview paragraphs, intro lines, tools…). */
export function StringListField({
    label,
    value,
    onChange,
    placeholder,
    multiline = false,
    addLabel = "Add",
}: {
    label: string;
    value: string[];
    onChange: (next: string[]) => void;
    placeholder?: string;
    multiline?: boolean;
    addLabel?: string;
}) {
    return (
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {label}
            </Typography>
            <Stack spacing={1}>
                {value.map((item, index) => (
                    <Stack sx={{ alignItems: "flex-start" }} key={index} direction="row" spacing={1}>
                        <TextField
                            fullWidth
                            size="small"
                            value={item}
                            placeholder={placeholder}
                            multiline={multiline}
                            minRows={multiline ? 2 : undefined}
                            onChange={(e) => onChange(value.map((v, i) => (i === index ? e.target.value : v)))}
                        />
                        <IconButton size="small" aria-label="Remove" onClick={() => onChange(value.filter((_, i) => i !== index))} sx={{ mt: 0.5 }}>
                            <MdDelete />
                        </IconButton>
                    </Stack>
                ))}
                <Box>
                    <Button size="small" startIcon={<MdAdd />} onClick={() => onChange([...value, ""])}>
                        {addLabel}
                    </Button>
                </Box>
            </Stack>
        </Box>
    );
}

/** Image picker that uploads to R2 and stores the CDN URL. */
export function ImageUploadField({
    label,
    value,
    onChange,
    folder,
    aspect = "16 / 9",
}: {
    label: string;
    value: string | null | undefined;
    onChange: (url: string | null) => void;
    folder: AssetFolder;
    aspect?: string;
}) {
    const { uploadImage } = useCourse();
    const [busy, setBusy] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const pick = async (file: File | undefined) => {
        if (!file) return;
        setBusy(true);
        const res = await uploadImage(file, folder);
        setBusy(false);
        if (notify(res, "Image uploaded") && res.data) onChange(res.data.publicUrl);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {label}
            </Typography>
            <Box
                sx={{
                    position: "relative",
                    aspectRatio: aspect,
                    maxWidth: 320,
                    borderRadius: "14px",
                    border: "1px dashed rgba(255,255,255,0.18)",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: value ? `center / cover no-repeat url("${value}")` : "rgba(255,255,255,0.02)",
                }}
            >
                {!value && !busy && (
                    <Typography variant="caption" color="text.secondary">
                        No image
                    </Typography>
                )}
                {busy && <CircularProgress size={24} />}
            </Box>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button size="small" variant="outlined" startIcon={<MdCloudUpload />} disabled={busy} onClick={() => inputRef.current?.click()}>
                    {value ? "Replace" : "Upload"}
                </Button>
                {value && (
                    <Button size="small" color="error" onClick={() => onChange(null)}>
                        Remove
                    </Button>
                )}
            </Stack>
            <input ref={inputRef} hidden type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" onChange={(e) => pick(e.target.files?.[0])} />
        </Box>
    );
}

/* ───────────────────────────── confirm dialog ───────────────────────────── */

interface ConfirmOptions {
    title: string;
    description?: React.ReactNode;
    confirmLabel?: string;
    danger?: boolean;
}

/** `const { confirm, dialog } = useConfirm()` → render `{dialog}` once, `await confirm({...})` anywhere. */
export function useConfirm() {
    const [state, setState] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);

    const confirm = useCallback((options: ConfirmOptions) => new Promise<boolean>((resolve) => setState({ ...options, resolve })), []);

    const close = (ok: boolean) => {
        state?.resolve(ok);
        setState(null);
    };

    const dialog = (
        <Dialog open={Boolean(state)} onClose={() => close(false)} maxWidth="xs" fullWidth>
            <DialogTitle>{state?.title}</DialogTitle>
            {state?.description && (
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" component="div">
                        {state.description}
                    </Typography>
                </DialogContent>
            )}
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button color="inherit" onClick={() => close(false)}>
                    Cancel
                </Button>
                <Button variant="contained" color={state?.danger ? "error" : "primary"} onClick={() => close(true)}>
                    {state?.confirmLabel ?? "Confirm"}
                </Button>
            </DialogActions>
        </Dialog>
    );

    return { confirm, dialog };
}
