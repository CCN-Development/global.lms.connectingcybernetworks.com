"use client";

import React from "react";
import {
    Autocomplete, Box, Chip, FormControl, InputLabel,
    MenuItem, Paper, Select, TextField,
} from "@mui/material";

/* Brand palette (solid fills only — see design-preferences.md) */
export const BRAND = {
    primary: "#009DFF", primaryHover: "#007fd4",
    violet: "#7c3aed", violetBg: "#ede9fe",
    sky: "#0284c7", skyBg: "#e0f2fe",
    cyan: "#06b6d4", cyanBg: "#cffafe",
    emerald: "#10b981", emeraldBg: "#d1fae5",
    orange: "#f97316", orangeBg: "#ffedd5",
    amber: "#f59e0b", amberBg: "#fef3c7",
    rose: "#f43f5e", roseBg: "#ffe4e6",
    slate: "#64748b", slateBg: "#f1f5f9",
};

export const DAY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const MODE_OPTIONS = ["Offline", "Online", "Hybrid"];
export const CLASS_TIMING_OPTIONS = ["Morning", "Afternoon", "Evening"];

/* ============================================================== */
/* Formatters                                                      */
/* ============================================================== */

export function formatDate(value: string | null | undefined) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/** Batch class times are stored as UTC wall-clock, so read them back in UTC. */
export function formatTime(value: string | null | undefined) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const suffix = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function formatMoney(value: number | null | undefined) {
    if (value === null || value === undefined) return "—";
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function toDateInput(value: string | null | undefined) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
}

export function toTimeInput(value: string | null | undefined) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

export function shortDay(day: string) {
    return day.slice(0, 3);
}

/* ============================================================== */
/* Status colouring                                                */
/* ============================================================== */

export function sessionStatusColor(status: string): { color: string; bg: string } {
    switch (status) {
        case "completed": return { color: BRAND.emerald, bg: BRAND.emeraldBg };
        case "ongoing": return { color: BRAND.primary, bg: BRAND.skyBg };
        case "cancelled": return { color: BRAND.rose, bg: BRAND.roseBg };
        case "rescheduled": return { color: BRAND.amber, bg: BRAND.amberBg };
        default: return { color: BRAND.violet, bg: BRAND.violetBg };
    }
}

export function requestStatusColor(status: string): { color: string; bg: string } {
    switch (status) {
        case "approved": return { color: BRAND.emerald, bg: BRAND.emeraldBg };
        case "rejected": return { color: BRAND.rose, bg: BRAND.roseBg };
        default: return { color: BRAND.amber, bg: BRAND.amberBg };
    }
}

export function queryStatusColor(status: string): { color: string; bg: string } {
    switch (status) {
        case "resolved": return { color: BRAND.emerald, bg: BRAND.emeraldBg };
        case "closed": return { color: BRAND.slate, bg: BRAND.slateBg };
        default: return { color: BRAND.amber, bg: BRAND.amberBg };
    }
}

export function enrollmentStatusColor(status: string): { color: string; bg: string } {
    switch (status) {
        case "active": return { color: BRAND.emerald, bg: BRAND.emeraldBg };
        case "completed": return { color: BRAND.primary, bg: BRAND.skyBg };
        case "failed": return { color: BRAND.rose, bg: BRAND.roseBg };
        default: return { color: BRAND.slate, bg: BRAND.slateBg };
    }
}

/* ============================================================== */
/* Layout primitives                                               */
/* ============================================================== */

export function Surface({
    accent, className, children,
}: { accent?: string; className?: string; children: React.ReactNode }) {
    return (
        <Paper
            elevation={0}
            className={className}
            sx={{
                border: `1px solid ${accent ?? "#e5e7eb"}`,
                borderRadius: "8px",
                transition: "box-shadow .15s ease, transform .15s ease",
                "&:hover": { boxShadow: "0 6px 16px rgba(15,23,42,0.1)", transform: "translateY(-1px)" },
            }}
        >
            {children}
        </Paper>
    );
}

export function SectionShell({
    title, action, children,
}: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
                {action}
            </div>
            {children}
        </div>
    );
}

export function Panel({
    title, icon, color, bg, action, children,
}: {
    title: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <Surface accent={color} className="p-3">
            <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-gray-100">
                <span className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: bg, color }}>
                    {icon}
                </span>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-700">{title}</h4>
                {action && <span className="ml-auto">{action}</span>}
            </div>
            <div className="flex flex-col gap-1.5">{children}</div>
        </Surface>
    );
}

export function PanelRow({
    label, value, mono,
}: { label: string; value: React.ReactNode; mono?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-gray-400 shrink-0">{label}</span>
            <span className={`text-gray-800 truncate text-right ${mono ? "font-mono text-[11px]" : ""}`}>
                {value === null || value === undefined || value === "" ? <span className="text-gray-300">—</span> : value}
            </span>
        </div>
    );
}

export function StatCard({
    label, value, hint, color, icon,
}: { label: string; value: React.ReactNode; hint?: string; color: string; icon: React.ReactNode }) {
    return (
        <Surface accent={color} className="p-2.5 sm:p-3">
            <div className="flex items-center gap-2">
                <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: color, color: "#ffffff" }}
                >
                    {icon}
                </span>
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 truncate">{label}</p>
                    <p className="text-base sm:text-lg font-bold leading-tight" style={{ color }}>{value}</p>
                    {hint && <p className="text-[10px] text-gray-400 truncate">{hint}</p>}
                </div>
            </div>
        </Surface>
    );
}

export function StatusChip({ label, color, bg }: { label: string; color: string; bg?: string }) {
    return (
        <Chip
            size="small"
            label={label}
            sx={{
                height: 20, fontSize: "0.65rem", fontWeight: 700, borderRadius: "6px", textTransform: "capitalize",
                backgroundColor: bg ?? color,
                color: bg ? color : "#ffffff",
                border: bg ? `1px solid ${color}` : "none",
            }}
        />
    );
}

export function InfoChip({
    icon, label, color, bg,
}: { icon: React.ReactNode; label: string; color: string; bg: string }) {
    return (
        <Chip
            size="small"
            icon={<Box component="span" sx={{ display: "flex", color: `${color} !important`, ml: "6px" }}>{icon}</Box>}
            label={label}
            sx={{
                height: 24, fontSize: "0.7rem", fontWeight: 600, borderRadius: "8px",
                backgroundColor: bg, color, border: `1px solid ${color}`,
                "& .MuiChip-label": { px: 0.75 },
            }}
        />
    );
}

export function EmptyState({ label, color = BRAND.sky }: { label: string; color?: string }) {
    return (
        <Paper elevation={0} sx={{ borderRadius: "8px", border: `1px solid ${color}`, py: 4, textAlign: "center" }}>
            <span className="text-xs text-gray-400">{label}</span>
        </Paper>
    );
}

/* ============================================================== */
/* MUI form controls                                               */
/* ============================================================== */

export const inputSx = {
    "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.8125rem", backgroundColor: "#fff" },
    "& .MuiInputLabel-root": { fontSize: "0.75rem" },
};

export function AppTextField(props: React.ComponentProps<typeof TextField>) {
    return <TextField size="small" fullWidth sx={inputSx} {...props} />;
}

export function AppNumberField({
    label, value, onChange, min = 0,
}: { label: string; value: number | ""; onChange: (v: number | "") => void; min?: number }) {
    return (
        <TextField
            size="small"
            fullWidth
            type="number"
            label={label}
            value={value}
            onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
            slotProps={{ htmlInput: { min } }}
            sx={inputSx}
        />
    );
}

// Chrome only opens the picker from the tiny glyph, so open it on any click in the field.
function openPicker(e: React.SyntheticEvent<HTMLDivElement>) {
    const input = e.currentTarget.querySelector("input") as HTMLInputElement | null;
    try { input?.showPicker?.(); } catch { /* already open */ }
}

export function AppDateField({
    label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <TextField
            size="small"
            fullWidth
            type="date"
            label={label}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onClick={openPicker}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ ...inputSx, "& input": { cursor: "pointer" } }}
        />
    );
}

export function AppTimeField({
    label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <TextField
            size="small"
            fullWidth
            type="time"
            label={label}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onClick={openPicker}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ ...inputSx, "& input": { cursor: "pointer" } }}
        />
    );
}

export function AppSelect({
    label, value, onChange, options, allowEmpty = true,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { label: string; value: string }[];
    allowEmpty?: boolean;
}) {
    return (
        <FormControl size="small" fullWidth sx={inputSx}>
            <InputLabel>{label}</InputLabel>
            <Select label={label} value={value} onChange={(e) => onChange(e.target.value as string)}>
                {allowEmpty && <MenuItem value="">All</MenuItem>}
                {options.map((o) => (
                    <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.8125rem" }}>{o.label}</MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export type Option = { id: string; label: string; hint?: string };

export function AppOptionSelect({
    label, value, onChange, options, disabled,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: Option[];
    disabled?: boolean;
}) {
    const selected = options.find((o) => o.id === value) ?? null;
    return (
        <Autocomplete
            size="small"
            disabled={disabled}
            options={options}
            value={selected}
            onChange={(_, val) => onChange(val?.id ?? "")}
            getOptionLabel={(o) => o.label}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id} sx={{ display: "flex", gap: 1, fontSize: "0.8125rem" }}>
                    <span className="truncate">{option.label}</span>
                    {option.hint && <span className="ml-auto text-gray-400 text-[11px]">{option.hint}</span>}
                </Box>
            )}
            renderInput={(params) => <TextField {...params} label={label} sx={inputSx} />}
        />
    );
}

export function AppMultiSelect({
    label, values, onChange, options, color = BRAND.primary,
}: {
    label: string;
    values: string[];
    onChange: (v: string[]) => void;
    options: Option[];
    color?: string;
}) {
    const selected = options.filter((o) => values.includes(o.id));
    return (
        <Autocomplete
            multiple
            size="small"
            options={options}
            value={selected}
            onChange={(_, val) => onChange(val.map((v) => v.id))}
            getOptionLabel={(o) => o.label}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            renderValue={(value, getItemProps) =>
                value.map((option, index) => (
                    <Chip
                        size="small"
                        label={option.label}
                        {...getItemProps({ index })}
                        key={option.id}
                        sx={{ height: 22, fontSize: "0.68rem", fontWeight: 600, bgcolor: "#fff", color, border: `1px solid ${color}` }}
                    />
                ))
            }
            renderInput={(params) => <TextField {...params} label={label} sx={inputSx} />}
        />
    );
}

/** Weekday picker rendered as colour-coded toggle pills. */
export function DayPicker({
    values, onChange, color = BRAND.violet,
}: { values: string[]; onChange: (v: string[]) => void; color?: string }) {
    const toggle = (day: string) => {
        onChange(values.includes(day) ? values.filter((d) => d !== day) : [...values, day]);
    };
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-gray-500">Class days</span>
            <div className="flex flex-wrap gap-1">
                {DAY_OPTIONS.map((day) => {
                    const active = values.includes(day);
                    return (
                        <button
                            key={day}
                            type="button"
                            onClick={() => toggle(day)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors"
                            style={{
                                backgroundColor: active ? color : "#ffffff",
                                color: active ? "#ffffff" : "#6b7280",
                                border: `1px solid ${active ? color : "#e5e7eb"}`,
                            }}
                        >
                            {shortDay(day)}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
