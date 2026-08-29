"use client";

import toast from "react-hot-toast";
import { Copy, Edit2, ExternalLink, Plus, Save, Trash2, Upload, X } from "lucide-react";
import {
    Autocomplete, Box, Button, Chip, CircularProgress, FormControl,
    IconButton, InputLabel, MenuItem, Paper, Select, TextField,
} from "@mui/material";
import { CountriesData } from "@/utils/countries";

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
};

export function formatMoney(value: number | null | undefined) {
    if (value === null || value === undefined) return "—";
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function formatDate(value: string | null | undefined) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/* ============================================================== */
/* Layout primitives                                               */
/* ============================================================== */

export function SectionShell({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
                {action}
            </div>
            {children}
        </div>
    );
}

export function Surface({
    accent, className, children,
}: { accent?: string; className?: string; children: React.ReactNode }) {
    return (
        <Paper
            elevation={0}
            className={className}
            sx={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                transition: "box-shadow .15s ease, transform .15s ease",
                "&:hover": { boxShadow: "0 6px 16px rgba(15,23,42,0.1)", transform: "translateY(-1px)" },
                ...(accent ? { border: `1px solid ${accent}` } : {}),
            }}
        >
            {children}
        </Paper>
    );
}

export function Panel({ title, icon, color, bg, children }: { title: string; icon: React.ReactNode; color: string; bg: string; children: React.ReactNode }) {
    return (
        <Surface accent={color} className="p-3">
            <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-gray-100">
                <span className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: bg, color }}>
                    {icon}
                </span>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-700">{title}</h4>
            </div>
            <div className="flex flex-col gap-1.5">{children}</div>
        </Surface>
    );
}

export function PanelRow({ label, value, mono, copy }: { label: string; value: string | null | undefined; mono?: boolean; copy?: boolean }) {
    const shown = value ?? "";
    const canCopy = copy && shown;
    return (
        <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-gray-400 shrink-0">{label}</span>
            <div className="flex items-center gap-1.5 min-w-0">
                <span className={`text-gray-800 truncate ${mono ? "font-mono text-[11px]" : ""}`}>
                    {shown || <span className="text-gray-300">—</span>}
                </span>
                {canCopy && (
                    <IconButton
                        size="small"
                        onClick={() => { navigator.clipboard.writeText(shown); toast.success("Copied"); }}
                        sx={{ p: 0.25, color: "#9ca3af", "&:hover": { color: BRAND.primary } }}
                    >
                        <Copy size={10} />
                    </IconButton>
                )}
            </div>
        </div>
    );
}

export function InfoRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex items-center gap-1.5 text-gray-600 min-w-0">
            <span className="text-gray-300 shrink-0">{icon}</span>
            <span className="text-gray-400 text-[11px] shrink-0">{label}:</span>
            <span className={`truncate text-gray-700 ${mono ? "font-mono text-[11px]" : ""}`}>{value}</span>
        </div>
    );
}

export function ItemCard({
    title, subtitle, color = BRAND.primary, onEdit, onDelete, children,
}: {
    title: string;
    subtitle?: string;
    color?: string;
    onEdit?: () => void;
    onDelete?: () => void;
    children?: React.ReactNode;
}) {
    return (
        <Surface accent={color} className="p-3">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
                    {subtitle && <p className="text-[11px] text-gray-500 mt-0.5 truncate">{subtitle}</p>}
                </div>
                <div className="flex items-center gap-0.5">
                    {onEdit && (
                        <IconButton size="small" onClick={onEdit} sx={{ color: "#9ca3af", "&:hover": { color: BRAND.primary } }}>
                            <Edit2 size={13} />
                        </IconButton>
                    )}
                    {onDelete && (
                        <IconButton size="small" onClick={onDelete} sx={{ color: "#9ca3af", "&:hover": { color: BRAND.rose } }}>
                            <Trash2 size={14} />
                        </IconButton>
                    )}
                </div>
            </div>
            {children && <div className="mt-2 flex flex-col gap-1">{children}</div>}
        </Surface>
    );
}

export function EmptyState({ label }: { label: string }) {
    return (
        <Paper elevation={0} sx={{ borderRadius: "8px", border: `1px solid ${BRAND.sky}`, py: 4, textAlign: "center" }}>
            <span className="text-xs text-gray-400">{label}</span>
        </Paper>
    );
}

export function FormCard({
    children, onCancel, onSubmit, busy, color = BRAND.primary,
}: {
    children: React.ReactNode;
    onCancel: () => void;
    onSubmit: () => void;
    busy: boolean;
    color?: string;
}) {
    return (
        <Surface accent={color} className="p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">{children}</div>
            <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                <Button
                    onClick={onCancel}
                    disabled={busy}
                    size="small"
                    variant="outlined"
                    startIcon={<X size={12} />}
                    sx={{ textTransform: "none", borderRadius: "8px", fontSize: "0.75rem", borderColor: "#e5e7eb", color: "#374151" }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onSubmit}
                    disabled={busy}
                    size="small"
                    variant="contained"
                    startIcon={busy ? <CircularProgress size={12} color="inherit" /> : <Save size={12} />}
                    sx={{ textTransform: "none", borderRadius: "8px", fontSize: "0.75rem", bgcolor: color, "&:hover": { bgcolor: color, filter: "brightness(0.9)" } }}
                >
                    Save
                </Button>
            </div>
        </Surface>
    );
}

export function InfoChip({ icon, label, color, bg }: { icon: React.ReactNode; label: string; color: string; bg: string }) {
    return (
        <Chip
            size="small"
            icon={<Box component="span" sx={{ display: "flex", color: `${color} !important`, ml: "6px" }}>{icon}</Box>}
            label={label}
            sx={{ height: 24, fontSize: "0.7rem", fontWeight: 600, backgroundColor: bg, color, border: `1px solid ${color}`, borderRadius: "8px" }}
        />
    );
}

export function StatusChip({ label, color, bg }: { label: string; color: string; bg?: string }) {
    return (
        <Chip
            size="small"
            label={label}
            sx={{
                height: 20, fontSize: "0.65rem", fontWeight: 700, borderRadius: "6px",
                backgroundColor: bg ?? color,
                color: bg ? color : "#ffffff",
                border: bg ? `1px solid ${color}` : "none",
            }}
        />
    );
}

/* ============================================================== */
/* MUI-based form controls                                         */
/* ============================================================== */

export const inputSx = {
    "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.8125rem", backgroundColor: "#fff" },
    "& .MuiInputLabel-root": { fontSize: "0.75rem" },
};

type CountryEntry = (typeof CountriesData)[number];
export const COUNTRY_CODE_OPTIONS = CountriesData.filter(
    (c): c is CountryEntry & { code: string } => !!c.code,
);
export const COUNTRY_NAME_OPTIONS = CountriesData.map((c) => c.country_name);

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

// Chrome only opens the date picker from the tiny calendar glyph, so open it on any click in the field.
export function AppDateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    const openPicker = (e: React.SyntheticEvent<HTMLDivElement>) => {
        const input = e.currentTarget.querySelector("input") as HTMLInputElement | null;
        try { input?.showPicker?.(); } catch { /* picker already open */ }
    };
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

export function AppSelect({
    label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
    return (
        <FormControl size="small" fullWidth sx={inputSx}>
            <InputLabel>{label}</InputLabel>
            <Select label={label} value={value} onChange={(e) => onChange(e.target.value as string)}>
                <MenuItem value="">—</MenuItem>
                {options.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export function AppAutocomplete({
    label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
    return (
        <Autocomplete
            size="small"
            freeSolo
            options={options}
            inputValue={value}
            onInputChange={(_, val) => onChange(val)}
            renderInput={(params) => <TextField {...params} label={label} sx={inputSx} />}
        />
    );
}

/** Single-pick autocomplete over id/label pairs. */
export function AppOptionSelect({
    label, value, onChange, options,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { id: string; label: string; hint?: string }[];
}) {
    const selected = options.find((o) => o.id === value) ?? null;
    return (
        <Autocomplete
            size="small"
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

/** Multi-pick autocomplete over id/label pairs. */
export function AppMultiSelect({
    label, values, onChange, options, color = BRAND.primary,
}: {
    label: string;
    values: string[];
    onChange: (v: string[]) => void;
    options: { id: string; label: string; hint?: string }[];
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

function CountryCodeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const selected = COUNTRY_CODE_OPTIONS.find((c) => c.code.replace("+", "") === value) ?? null;
    return (
        <Autocomplete
            size="small"
            options={COUNTRY_CODE_OPTIONS}
            value={selected}
            onChange={(_, val) => onChange(val ? val.code.replace("+", "") : "")}
            getOptionLabel={(o) => o.code}
            isOptionEqualToValue={(o, v) => o.country_code === v.country_code}
            renderOption={(props, option) => (
                <Box component="li" {...props} key={option.country_code} sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: "0.8125rem" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- tiny flag icon inside a dropdown option, next/image is unnecessary here */}
                    <img src={option.flag} alt="" width={18} height={13} style={{ objectFit: "cover", borderRadius: 2, flexShrink: 0 }} />
                    <span className="truncate">{option.country_name}</span>
                    <span className="ml-auto text-gray-400">{option.code}</span>
                </Box>
            )}
            renderInput={(params) => <TextField {...params} label="Code" sx={inputSx} />}
            sx={{ width: 118, flexShrink: 0 }}
        />
    );
}

export function PhoneField({
    label, codeValue, numberValue, onCodeChange, onNumberChange,
}: {
    label?: string; codeValue: string; numberValue: string;
    onCodeChange: (v: string) => void; onNumberChange: (v: string) => void;
}) {
    return (
        <div className="flex flex-col gap-1">
            {label && <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">{label}</span>}
            <div className="flex gap-1.5">
                <CountryCodeSelect value={codeValue} onChange={onCodeChange} />
                <TextField
                    size="small"
                    fullWidth
                    placeholder="Phone number"
                    value={numberValue}
                    onChange={(e) => onNumberChange(e.target.value)}
                    sx={inputSx}
                />
            </div>
        </div>
    );
}

export function AddButton({ color, onClick, label = "Add" }: { color: string; onClick: () => void; label?: string }) {
    return (
        <Button
            onClick={onClick}
            size="small"
            variant="contained"
            startIcon={<Plus size={13} />}
            sx={{ textTransform: "none", borderRadius: "8px", fontSize: "0.75rem", bgcolor: color, "&:hover": { bgcolor: color, filter: "brightness(0.9)" } }}
        >
            {label}
        </Button>
    );
}

export function FileField({
    label, value, uploading, onPick, accept,
}: {
    label: string;
    value: string;
    uploading: boolean;
    onPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
    accept?: string;
}) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">{label}</span>
            <div className="flex items-center gap-2 flex-wrap">
                <Button
                    component="label"
                    size="small"
                    variant="outlined"
                    startIcon={uploading ? <CircularProgress size={13} /> : <Upload size={14} />}
                    disabled={uploading}
                    sx={{ textTransform: "none", borderRadius: "8px", fontSize: "0.75rem", borderColor: "#e5e7eb", color: "#374151" }}
                >
                    {uploading ? "Uploading..." : "Choose file"}
                    <input type="file" hidden accept={accept} onChange={onPick} />
                </Button>
                {value && (
                    <a
                        href={value}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] hover:underline inline-flex items-center gap-1 truncate max-w-40"
                        style={{ color: BRAND.primary }}
                    >
                        <ExternalLink size={10} /> View file
                    </a>
                )}
            </div>
        </div>
    );
}
