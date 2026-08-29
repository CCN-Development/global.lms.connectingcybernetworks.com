"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AccountantDashboardLayout from "@/layouts/AccountantDashboardLayout";
import {
    useERP,
    type BankAccountDetail,
    type BankAccountTransaction,
    type PaginationMeta,
    type UpdateBankAccountInput,
} from "@/contexts/ERPContext";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Snackbar,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    LuArrowDownLeft,
    LuArrowLeft,
    LuArrowUpRight,
    LuBanknote,
    LuBuilding2,
    LuCalendarDays,
    LuCopy,
    LuCreditCard,
    LuFilterX,
    LuHash,
    LuPencil,
    LuPhone,
    LuQrCode,
    LuRefreshCw,
    LuTrash2,
    LuTrendingUp,
    LuTriangleAlert,
    LuUser,
    LuWallet,
    LuX,
} from "react-icons/lu";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const PRIMARY = "#009DFF";
const PRIMARY_DARK = "#007fd4";
const VIOLET = "#7c3aed";
const VIOLET_DARK = "#6d28d9";
const SKY = "#0284c7";
const SKY_DARK = "#0369a1";
const CYAN = "#06b6d4";
const AMBER = "#f59e0b";
const EMERALD = "#10b981";
const EMERALD_DARK = "#059669";
const ROSE = "#f43f5e";
const ROSE_DARK = "#e11d48";

const TRANSACTION_TYPES = ["Credit", "Debit"];
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function money(value: number | null | undefined) {
    if (value === null || value === undefined) return "—";
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function formatDate(value: string | null | undefined) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function maskAccountNumber(value: string | null | undefined) {
    if (!value) return "—";
    if (value.length <= 4) return value;
    return `${"•".repeat(Math.min(value.length - 4, 8))}${value.slice(-4)}`;
}

function toNumberOrUndefined(value: string): number | undefined {
    if (value.trim() === "") return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}

function isCredit(transactionType: string) {
    return transactionType.toLowerCase().startsWith("cr");
}

type Feedback = { open: boolean; severity: "success" | "error"; message: string };

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                         */
/* ------------------------------------------------------------------ */

function StatCard({ label, value, color, icon }: { label: string; value: React.ReactNode; color: string; icon: React.ReactNode }) {
    return (
        <Paper
            elevation={0}
            className="rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2.5"
            sx={{ border: `1px solid ${color}`, backgroundColor: color, color: "#ffffff", transition: "box-shadow .2s", "&:hover": { boxShadow: 4 } }}
        >
            <Box className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: "#ffffff", color }}>
                {icon}
            </Box>
            <Box className="min-w-0">
                <Typography className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">{label}</Typography>
                <Typography className="text-lg sm:text-xl font-black leading-tight truncate">{value}</Typography>
            </Box>
        </Paper>
    );
}

function InfoRow({
    label,
    value,
    color,
    icon,
    onCopy,
}: {
    label: string;
    value: string;
    color: string;
    icon: React.ReactNode;
    onCopy?: () => void;
}) {
    return (
        <Paper
            elevation={0}
            className="rounded-lg p-2.5 flex items-center gap-2"
            sx={{ border: `1px solid ${color}`, transition: "box-shadow .2s", "&:hover": { boxShadow: 3 } }}
        >
            <Box className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: color, color: "#ffffff" }}>
                {icon}
            </Box>
            <Box className="min-w-0 flex-1">
                <Typography className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</Typography>
                <Typography className="text-sm font-semibold text-gray-900 truncate">{value}</Typography>
            </Box>
            {onCopy && value !== "—" && (
                <Tooltip title={`Copy ${label.toLowerCase()}`}>
                    <IconButton size="small" onClick={onCopy} sx={{ color }}>
                        <LuCopy className="w-3.5 h-3.5" />
                    </IconButton>
                </Tooltip>
            )}
        </Paper>
    );
}

/* ------------------------------------------------------------------ */
/* Details tab (read view + inline edit form)                          */
/* ------------------------------------------------------------------ */

const EMPTY_FORM = {
    commonCallingName: "",
    bankHolderName: "",
    accountNumber: "",
    ifscCode: "",
    mobileNumber: "",
    UPIId: "",
    currentBalance: "",
};

function DetailsTab({
    detail,
    editing,
    onStartEdit,
    onCancelEdit,
    onSave,
    onCopy,
}: {
    detail: BankAccountDetail;
    editing: boolean;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    onSave: (data: UpdateBankAccountInput) => Promise<boolean>;
    onCopy: (label: string, value: string | null) => void;
}) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!editing) return;
        setForm({
            commonCallingName: detail.commonCallingName ?? "",
            bankHolderName: detail.bankHolderName ?? "",
            accountNumber: detail.accountNumber ?? "",
            ifscCode: detail.ifscCode ?? "",
            mobileNumber: detail.mobileNumber ?? "",
            UPIId: detail.UPIId ?? "",
            currentBalance: detail.currentBalance?.toString() ?? "",
        });
    }, [editing, detail]);

    const canSave = form.bankHolderName.trim().length > 0 && form.accountNumber.trim().length > 0;

    const handleSave = async () => {
        setSaving(true);
        const ok = await onSave({
            bankHolderName: form.bankHolderName.trim(),
            accountNumber: form.accountNumber.trim(),
            ifscCode: form.ifscCode.trim() || undefined,
            mobileNumber: form.mobileNumber.trim() || undefined,
            UPIId: form.UPIId.trim() || undefined,
            commonCallingName: form.commonCallingName.trim() || undefined,
            currentBalance: toNumberOrUndefined(form.currentBalance),
        });
        setSaving(false);
        if (ok) onCancelEdit();
    };

    if (editing) {
        return (
            <Paper elevation={0} className="rounded-lg overflow-hidden" sx={{ border: `1px solid ${VIOLET}` }}>
                <Box className="px-3 py-2.5 flex items-center justify-between gap-2" sx={{ background: `linear-gradient(90deg, ${VIOLET} 0%, ${SKY} 100%)`, color: "#ffffff" }}>
                    <Box className="flex items-center gap-2">
                        <LuPencil className="w-4 h-4" />
                        <Typography className="text-sm font-bold">Edit account details</Typography>
                    </Box>
                    <IconButton size="small" onClick={onCancelEdit} sx={{ color: "#ffffff" }}>
                        <LuX className="w-4 h-4" />
                    </IconButton>
                </Box>

                <Box className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <TextField
                        label="Display name"
                        size="small"
                        className="sm:col-span-2"
                        value={form.commonCallingName}
                        onChange={(e) => setForm({ ...form, commonCallingName: e.target.value })}
                    />
                    <TextField
                        label="Bank holder name"
                        size="small"
                        required
                        value={form.bankHolderName}
                        onChange={(e) => setForm({ ...form, bankHolderName: e.target.value })}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><LuUser className="w-4 h-4 text-gray-400" /></InputAdornment> } }}
                    />
                    <TextField
                        label="Account number"
                        size="small"
                        required
                        value={form.accountNumber}
                        onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><LuCreditCard className="w-4 h-4 text-gray-400" /></InputAdornment> } }}
                    />
                    <TextField label="IFSC code" size="small" value={form.ifscCode} onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })} />
                    <TextField label="Linked mobile number" size="small" value={form.mobileNumber} onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })} />
                    <TextField label="UPI ID" size="small" value={form.UPIId} onChange={(e) => setForm({ ...form, UPIId: e.target.value })} />
                    <TextField
                        label="Current balance"
                        size="small"
                        type="number"
                        value={form.currentBalance}
                        onChange={(e) => setForm({ ...form, currentBalance: e.target.value })}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                    />
                </Box>

                <Divider />

                <Box className="p-2.5 flex items-center justify-end gap-2">
                    <Button onClick={onCancelEdit} size="small" sx={{ textTransform: "none", color: "#6b7280" }}>Cancel</Button>
                    <Button
                        onClick={handleSave}
                        size="small"
                        variant="contained"
                        disabled={saving || !canSave}
                        startIcon={saving ? <CircularProgress size={14} sx={{ color: "#ffffff" }} /> : undefined}
                        sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: VIOLET, "&:hover": { backgroundColor: VIOLET_DARK } }}
                    >
                        Save changes
                    </Button>
                </Box>
            </Paper>
        );
    }

    return (
        <Box className="flex flex-col gap-2 sm:gap-3">
            <Box className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                <InfoRow label="Bank holder" value={detail.bankHolderName || "—"} color={SKY} icon={<LuUser className="w-4 h-4" />} />
                <InfoRow
                    label="Account number"
                    value={detail.accountNumber || "—"}
                    color={VIOLET}
                    icon={<LuCreditCard className="w-4 h-4" />}
                    onCopy={() => onCopy("Account number", detail.accountNumber)}
                />
                <InfoRow
                    label="IFSC code"
                    value={detail.ifscCode || "—"}
                    color={PRIMARY}
                    icon={<LuHash className="w-4 h-4" />}
                    onCopy={() => onCopy("IFSC code", detail.ifscCode)}
                />
                <InfoRow
                    label="UPI ID"
                    value={detail.UPIId || "—"}
                    color={AMBER}
                    icon={<LuQrCode className="w-4 h-4" />}
                    onCopy={() => onCopy("UPI ID", detail.UPIId)}
                />
                <InfoRow label="Linked mobile" value={detail.mobileNumber || "—"} color={CYAN} icon={<LuPhone className="w-4 h-4" />} />
                <InfoRow label="Created on" value={formatDate(detail.createdAt)} color={EMERALD} icon={<LuCalendarDays className="w-4 h-4" />} />
            </Box>

            <Paper
                elevation={0}
                className="rounded-lg p-3 flex items-center justify-between gap-2 flex-wrap"
                sx={{ border: `1px solid ${VIOLET}`, transition: "box-shadow .2s", "&:hover": { boxShadow: 4 } }}
            >
                <Box className="flex items-center gap-2 min-w-0">
                    <Box className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: VIOLET, color: "#ffffff" }}>
                        <LuPencil className="w-4 h-4" />
                    </Box>
                    <Box className="min-w-0">
                        <Typography className="text-sm font-bold text-gray-900 leading-tight">Need to correct something?</Typography>
                        <Typography className="text-[11px] text-gray-500 leading-tight">Update holder name, account number, IFSC, UPI or balance.</Typography>
                    </Box>
                </Box>
                <Button
                    size="small"
                    variant="contained"
                    startIcon={<LuPencil className="w-3.5 h-3.5" />}
                    onClick={onStartEdit}
                    sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: VIOLET, "&:hover": { backgroundColor: VIOLET_DARK } }}
                >
                    Edit details
                </Button>
            </Paper>
        </Box>
    );
}

/* ------------------------------------------------------------------ */
/* Transactions tab                                                    */
/* ------------------------------------------------------------------ */

function TransactionsTab({
    bankAccountId,
    notify,
}: {
    bankAccountId: string;
    notify: (severity: "success" | "error", message: string) => void;
}) {
    const { getBankAccountTransactions } = useERP();

    const [rows, setRows] = useState<BankAccountTransaction[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(false);
    const [typeFilter, setTypeFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const load = useCallback(async () => {
        setLoading(true);
        const res = await getBankAccountTransactions(bankAccountId, {
            transactionType: typeFilter || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            page,
            limit,
        });
        if (res.success && res.data) {
            setRows(res.data.transactions);
            setMeta(res.data.pagination);
        } else {
            notify("error", res.message ?? "Failed to load transactions");
        }
        setLoading(false);
    }, [bankAccountId, getBankAccountTransactions, typeFilter, startDate, endDate, page, limit, notify]);

    useEffect(() => {
        load();
    }, [load]);

    const totals = useMemo(() => {
        const credit = rows.filter((r) => isCredit(r.transactionType)).reduce((sum, r) => sum + r.amount, 0);
        const debit = rows.filter((r) => !isCredit(r.transactionType)).reduce((sum, r) => sum + r.amount, 0);
        return { credit, debit, net: credit - debit };
    }, [rows]);

    const hasFilters = Boolean(typeFilter || startDate || endDate);

    const clearFilters = () => {
        setTypeFilter("");
        setStartDate("");
        setEndDate("");
        setPage(1);
    };

    return (
        <Box className="flex flex-col gap-2 sm:gap-3">
            {/* Filters */}
            <Paper elevation={0} className="rounded-lg p-2 sm:p-2.5 flex flex-col sm:flex-row gap-2 sm:items-center" sx={{ border: `1px solid ${VIOLET}` }}>
                <TextField
                    select
                    size="small"
                    label="Type"
                    value={typeFilter}
                    onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                    className="w-full sm:w-36"
                >
                    <MenuItem value="">All types</MenuItem>
                    {TRANSACTION_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    size="small"
                    type="date"
                    label="From"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                    slotProps={{ inputLabel: { shrink: true } }}
                    className="w-full sm:w-40"
                />
                <TextField
                    size="small"
                    type="date"
                    label="To"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                    slotProps={{ inputLabel: { shrink: true } }}
                    className="w-full sm:w-40"
                />
                <TextField
                    select
                    size="small"
                    label="Rows"
                    value={limit}
                    onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                    className="w-full sm:w-24"
                >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                        <MenuItem key={size} value={size}>{size}</MenuItem>
                    ))}
                </TextField>

                <Box className="sm:flex-1" />

                <Box className="flex items-center gap-2">
                    {hasFilters && (
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<LuFilterX className="w-3.5 h-3.5" />}
                            onClick={clearFilters}
                            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, borderColor: ROSE, color: ROSE }}
                        >
                            Clear
                        </Button>
                    )}
                    <Tooltip title="Refresh transactions">
                        <IconButton size="small" onClick={load} sx={{ border: `1px solid ${VIOLET}`, borderRadius: "8px", color: VIOLET }}>
                            <LuRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Paper>

            {/* Page totals */}
            <Box className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <StatCard label="Credit (page)" value={money(totals.credit)} color={EMERALD} icon={<LuArrowDownLeft className="w-4 h-4" />} />
                <StatCard label="Debit (page)" value={money(totals.debit)} color={ROSE} icon={<LuArrowUpRight className="w-4 h-4" />} />
                <StatCard label="Net (page)" value={money(totals.net)} color={VIOLET} icon={<LuTrendingUp className="w-4 h-4" />} />
                <StatCard label="Total records" value={meta?.total ?? 0} color={SKY} icon={<LuBanknote className="w-4 h-4" />} />
            </Box>

            {/* Table */}
            {loading && rows.length === 0 ? (
                <Box className="py-16 flex flex-col items-center gap-2">
                    <CircularProgress size={28} sx={{ color: VIOLET }} />
                    <Typography className="text-sm text-gray-400">Loading transactions…</Typography>
                </Box>
            ) : rows.length === 0 ? (
                <Paper elevation={0} className="rounded-lg py-16 flex flex-col items-center gap-2" sx={{ border: `1px solid ${VIOLET}` }}>
                    <Box className="w-12 h-12 rounded-lg flex items-center justify-center" sx={{ backgroundColor: VIOLET, color: "#ffffff" }}>
                        <LuTrendingUp className="w-6 h-6" />
                    </Box>
                    <Typography className="text-sm text-gray-500">
                        {hasFilters ? "No transactions match the selected filters." : "No transactions recorded for this account yet."}
                    </Typography>
                </Paper>
            ) : (
                <Paper elevation={0} className="rounded-lg overflow-hidden" sx={{ border: `1px solid ${VIOLET}` }}>
                    <Box className="overflow-x-auto">
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#f5f3ff" }}>
                                    <TableCell sx={{ fontWeight: 800, fontSize: 12, whiteSpace: "nowrap" }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 800, fontSize: 12 }}>Type</TableCell>
                                    <TableCell sx={{ fontWeight: 800, fontSize: 12 }} className="hidden md:table-cell">Description</TableCell>
                                    <TableCell sx={{ fontWeight: 800, fontSize: 12, whiteSpace: "nowrap" }} className="hidden lg:table-cell">Recorded on</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800, fontSize: 12 }}>Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row) => {
                                    const credit = isCredit(row.transactionType);
                                    return (
                                        <TableRow key={row.bankAccountTransactionId} sx={{ "&:hover": { backgroundColor: "#f5f3ff" } }}>
                                            <TableCell sx={{ fontSize: 12, whiteSpace: "nowrap" }}>{formatDate(row.transactionDate)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    icon={credit
                                                        ? <LuArrowDownLeft className="w-3 h-3" style={{ color: "#ffffff" }} />
                                                        : <LuArrowUpRight className="w-3 h-3" style={{ color: "#ffffff" }} />}
                                                    label={row.transactionType}
                                                    sx={{ backgroundColor: credit ? EMERALD : ROSE, color: "#ffffff", fontWeight: 700, height: 22 }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontSize: 12, color: "#4b5563" }} className="hidden md:table-cell">
                                                {row.description || "—"}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }} className="hidden lg:table-cell">
                                                {formatDate(row.createdAt)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", color: credit ? EMERALD_DARK : ROSE_DARK }}>
                                                {credit ? "+" : "-"}{money(row.amount)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Box>

                    {meta && (
                        <>
                            <Divider />
                            <Box className="p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <Typography className="text-[11px] font-semibold text-gray-500">
                                    Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
                                </Typography>
                                <Box className="flex items-center gap-1.5">
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        disabled={meta.page <= 1 || loading}
                                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                        sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, borderColor: VIOLET, color: VIOLET }}
                                    >
                                        Previous
                                    </Button>
                                    <Chip
                                        size="small"
                                        label={`Page ${meta.page} of ${meta.totalPages || 1}`}
                                        sx={{ backgroundColor: VIOLET, color: "#ffffff", fontWeight: 700, height: 24 }}
                                    />
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        disabled={meta.page >= meta.totalPages || loading}
                                        onClick={() => setPage((prev) => prev + 1)}
                                        sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, borderColor: VIOLET, color: VIOLET }}
                                    >
                                        Next
                                    </Button>
                                </Box>
                            </Box>
                        </>
                    )}
                </Paper>
            )}
        </Box>
    );
}

/* ------------------------------------------------------------------ */
/* Delete confirmation                                                 */
/* ------------------------------------------------------------------ */

function ConfirmDeleteDialog({
    open,
    description,
    onClose,
    onConfirm,
}: {
    open: boolean;
    description: string;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}) {
    const [busy, setBusy] = useState(false);

    const handleConfirm = async () => {
        setBusy(true);
        await onConfirm();
        setBusy(false);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: "10px", border: `1px solid ${ROSE}` } } }}>
            <DialogTitle sx={{ backgroundColor: ROSE, color: "#ffffff", py: 1.5, px: 2 }}>
                <Box className="flex items-center gap-2">
                    <LuTriangleAlert className="w-4 h-4" />
                    <Typography className="text-sm font-bold">Delete bank account</Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 2, pt: "16px !important" }}>
                <Typography className="text-sm text-gray-700">{description}</Typography>
            </DialogContent>
            <DialogActions sx={{ px: 2, pb: 2, pt: 0 }}>
                <Button onClick={onClose} size="small" sx={{ textTransform: "none", color: "#6b7280" }}>Cancel</Button>
                <Button
                    onClick={handleConfirm}
                    size="small"
                    variant="contained"
                    disabled={busy}
                    startIcon={busy ? <CircularProgress size={14} sx={{ color: "#ffffff" }} /> : <LuTrash2 className="w-3.5 h-3.5" />}
                    sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: ROSE, "&:hover": { backgroundColor: ROSE_DARK } }}
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ------------------------------------------------------------------ */
/* Main content                                                        */
/* ------------------------------------------------------------------ */

function BankAccountDetailContent({ bankAccountId }: { bankAccountId: string }) {
    const router = useRouter();
    const { getBankAccountById, updateBankAccount, deleteBankAccount } = useERP();

    const [detail, setDetail] = useState<BankAccountDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(0);
    const [editing, setEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [feedback, setFeedback] = useState<Feedback>({ open: false, severity: "success", message: "" });

    const notify = useCallback((severity: "success" | "error", message: string) => {
        setFeedback({ open: true, severity, message });
    }, []);

    const loadDetail = useCallback(async () => {
        setLoading(true);
        const res = await getBankAccountById(bankAccountId);
        if (res.success && res.data) setDetail(res.data);
        else notify("error", res.message ?? "Failed to load bank account");
        setLoading(false);
    }, [bankAccountId, getBankAccountById, notify]);

    useEffect(() => {
        loadDetail();
    }, [loadDetail]);

    const handleCopy = useCallback(async (label: string, value: string | null) => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            notify("success", `${label} copied`);
        } catch {
            notify("error", `Could not copy ${label.toLowerCase()}`);
        }
    }, [notify]);

    const handleSave = async (data: UpdateBankAccountInput) => {
        const res = await updateBankAccount(bankAccountId, data);
        notify(res.success ? "success" : "error", res.message ?? "Failed to update bank account");
        if (res.success) await loadDetail();
        return res.success;
    };

    const handleDelete = async () => {
        const res = await deleteBankAccount(bankAccountId);
        if (res.success) {
            router.push("/dashboard/accountants/accounts-management");
            return;
        }
        notify("error", res.message ?? "Failed to delete bank account");
        setConfirmDelete(false);
    };

    if (loading && !detail) {
        return (
            <Box className="py-24 flex flex-col items-center gap-2">
                <CircularProgress size={30} sx={{ color: SKY }} />
                <Typography className="text-sm text-gray-400">Loading bank account…</Typography>
            </Box>
        );
    }

    if (!detail) {
        return (
            <Paper elevation={0} className="rounded-lg py-16 flex flex-col items-center gap-2" sx={{ border: `1px solid ${ROSE}` }}>
                <Box className="w-12 h-12 rounded-lg flex items-center justify-center" sx={{ backgroundColor: ROSE, color: "#ffffff" }}>
                    <LuTriangleAlert className="w-6 h-6" />
                </Box>
                <Typography className="text-sm text-gray-500">This bank account could not be found.</Typography>
                <Button
                    size="small"
                    variant="contained"
                    startIcon={<LuArrowLeft className="w-3.5 h-3.5" />}
                    onClick={() => router.push("/dashboard/accountants/accounts-management")}
                    sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: PRIMARY, "&:hover": { backgroundColor: PRIMARY_DARK } }}
                >
                    Back to accounts
                </Button>
            </Paper>
        );
    }

    return (
        <Box className="flex flex-col gap-2 sm:gap-3">

            {/* Back */}
            <Button
                size="small"
                startIcon={<LuArrowLeft className="w-3.5 h-3.5" />}
                onClick={() => router.push("/dashboard/accountants/accounts-management")}
                sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 700, color: SKY }}
            >
                All bank accounts
            </Button>

            {/* Read-only header bar */}
            <Paper elevation={0} className="rounded-lg overflow-hidden" sx={{ border: `1px solid ${SKY}` }}>
                <Box
                    className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                    sx={{ background: `linear-gradient(90deg, ${SKY} 0%, ${VIOLET} 100%)`, color: "#ffffff" }}
                >
                    <Box className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: "#ffffff", color: SKY }}>
                        <LuBuilding2 className="w-6 h-6" />
                    </Box>

                    <Box className="min-w-0 flex-1">
                        <Box className="flex items-center gap-2 flex-wrap">
                            <Typography className="text-base sm:text-lg font-black leading-tight truncate">
                                {detail.commonCallingName || detail.bankHolderName || "Unnamed account"}
                            </Typography>
                            <Chip
                                size="small"
                                label={detail.isActive ? "Active" : "Inactive"}
                                sx={{ backgroundColor: "#ffffff", color: detail.isActive ? EMERALD_DARK : ROSE, fontWeight: 700, height: 22 }}
                            />
                        </Box>
                        <Typography className="text-xs font-medium opacity-90 truncate">
                            {detail.bankHolderName || "No holder name"} · {maskAccountNumber(detail.accountNumber)}
                        </Typography>

                        <Box className="flex flex-wrap gap-1.5 mt-2">
                            <Chip
                                size="small"
                                icon={<LuHash className="w-3 h-3" style={{ color: SKY_DARK }} />}
                                label={detail.ifscCode || "No IFSC"}
                                sx={{ backgroundColor: "#ffffff", color: SKY_DARK, fontWeight: 700, height: 22 }}
                            />
                            {detail.UPIId && (
                                <Chip
                                    size="small"
                                    icon={<LuQrCode className="w-3 h-3" style={{ color: "#ffffff" }} />}
                                    label={detail.UPIId}
                                    sx={{ backgroundColor: AMBER, color: "#ffffff", fontWeight: 700, height: 22, maxWidth: "100%" }}
                                />
                            )}
                            {detail.mobileNumber && (
                                <Chip
                                    size="small"
                                    icon={<LuPhone className="w-3 h-3" style={{ color: "#ffffff" }} />}
                                    label={detail.mobileNumber}
                                    sx={{ backgroundColor: PRIMARY, color: "#ffffff", fontWeight: 700, height: 22 }}
                                />
                            )}
                        </Box>
                    </Box>

                    <Box className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                        <Box>
                            <Typography className="text-[10px] font-bold uppercase tracking-wider">Current balance</Typography>
                            <Typography className="text-2xl font-black leading-tight">{money(detail.currentBalance)}</Typography>
                        </Box>
                        <Box className="flex items-center gap-1.5">
                            <Button
                                size="small"
                                variant="contained"
                                startIcon={<LuPencil className="w-3.5 h-3.5" />}
                                onClick={() => { setTab(0); setEditing(true); }}
                                sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: "#ffffff", color: SKY_DARK, "&:hover": { backgroundColor: "#e0f2fe" } }}
                            >
                                Edit
                            </Button>
                            <Tooltip title="Refresh">
                                <IconButton size="small" onClick={loadDetail} sx={{ backgroundColor: "#ffffff", color: SKY_DARK, borderRadius: "8px", "&:hover": { backgroundColor: "#e0f2fe" } }}>
                                    <LuRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete account">
                                <IconButton size="small" onClick={() => setConfirmDelete(true)} sx={{ backgroundColor: "#ffffff", color: ROSE, borderRadius: "8px", "&:hover": { backgroundColor: "#ffe4e6" } }}>
                                    <LuTrash2 className="w-4 h-4" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            {/* Tabs */}
            <Paper elevation={0} className="rounded-lg" sx={{ border: `1px solid ${tab === 0 ? SKY : VIOLET}` }}>
                <Tabs
                    value={tab}
                    onChange={(_, v) => { setTab(v); setEditing(false); }}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        minHeight: 40,
                        px: 1,
                        "& .MuiTab-root": { minHeight: 40, textTransform: "none", fontWeight: 700, fontSize: 13, px: 2 },
                        "& .Mui-selected": { color: `${tab === 0 ? SKY : VIOLET} !important` },
                        "& .MuiTabs-indicator": { backgroundColor: tab === 0 ? SKY : VIOLET, height: 3 },
                    }}
                >
                    <Tab icon={<LuWallet className="w-4 h-4" />} iconPosition="start" label="Account details" />
                    <Tab icon={<LuTrendingUp className="w-4 h-4" />} iconPosition="start" label="Transactions" />
                </Tabs>
            </Paper>

            {tab === 0 ? (
                <DetailsTab
                    detail={detail}
                    editing={editing}
                    onStartEdit={() => setEditing(true)}
                    onCancelEdit={() => setEditing(false)}
                    onSave={handleSave}
                    onCopy={handleCopy}
                />
            ) : (
                <TransactionsTab bankAccountId={bankAccountId} notify={notify} />
            )}

            <ConfirmDeleteDialog
                open={confirmDelete}
                description={`"${detail.commonCallingName || detail.bankHolderName || "This account"}" will be deactivated and hidden from the ERP.`}
                onClose={() => setConfirmDelete(false)}
                onConfirm={handleDelete}
            />

            <Snackbar
                open={feedback.open}
                autoHideDuration={3500}
                onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert severity={feedback.severity} variant="filled" onClose={() => setFeedback((prev) => ({ ...prev, open: false }))} sx={{ borderRadius: "8px" }}>
                    {feedback.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function BankAccountDetailPage() {
    const params = useParams<{ bank_account_id: string }>();
    const bankAccountId = params.bank_account_id;

    return (
        <AccountantDashboardLayout title="Bank Account">
            {bankAccountId ? <BankAccountDetailContent bankAccountId={bankAccountId} /> : null}
        </AccountantDashboardLayout>
    );
}