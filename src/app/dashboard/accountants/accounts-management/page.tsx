"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AccountantDashboardLayout from "@/layouts/AccountantDashboardLayout";
import {
    useERP,
    type BankAccount,
    type CreateBankAccountInput,
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
    Paper,
    Snackbar,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    LuBanknote,
    LuBuilding2,
    LuCopy,
    LuCreditCard,
    LuExternalLink,
    LuHash,
    LuPencil,
    LuPhone,
    LuPlus,
    LuQrCode,
    LuRefreshCw,
    LuSearch,
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
const SKY = "#0284c7";
const SKY_DARK = "#0369a1";
const CYAN = "#06b6d4";
const AMBER = "#f59e0b";
const EMERALD = "#10b981";
const EMERALD_DARK = "#059669";
const ROSE = "#f43f5e";
const ROSE_DARK = "#e11d48";

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

function BankAccountCard({
    item,
    onOpen,
    onEdit,
    onDelete,
    onCopy,
}: {
    item: BankAccount;
    onOpen: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onCopy: (label: string, value: string | null) => void;
}) {
    return (
        <Paper
            elevation={0}
            className="rounded-lg overflow-hidden flex flex-col"
            sx={{ border: `1px solid ${SKY}`, transition: "box-shadow .2s, transform .2s", "&:hover": { boxShadow: 6, transform: "translateY(-2px)" } }}
        >
            <Box
                className="px-3 py-2.5 flex items-start justify-between gap-2"
                sx={{ background: `linear-gradient(90deg, ${SKY} 0%, ${CYAN} 100%)`, color: "#ffffff" }}
            >
                <Box className="flex items-center gap-2 min-w-0">
                    <Box className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: "#ffffff", color: SKY }}>
                        <LuBuilding2 className="w-4 h-4" />
                    </Box>
                    <Box className="min-w-0">
                        <Typography className="text-sm font-bold truncate">
                            {item.commonCallingName || item.bankHolderName || "Unnamed account"}
                        </Typography>
                        <Typography className="text-[11px] font-medium opacity-90 truncate">
                            {item.bankHolderName || "No holder name"}
                        </Typography>
                    </Box>
                </Box>
                <Box className="flex items-center gap-0.5 shrink-0">
                    <Tooltip title="Open account">
                        <IconButton size="small" onClick={onOpen} sx={{ color: "#ffffff" }}>
                            <LuExternalLink className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit account">
                        <IconButton size="small" onClick={onEdit} sx={{ color: "#ffffff" }}>
                            <LuPencil className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete account">
                        <IconButton size="small" onClick={onDelete} sx={{ color: "#ffffff" }}>
                            <LuTrash2 className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Box className="p-3 flex flex-col gap-2.5 flex-1">
                <Box className="flex items-end justify-between gap-2 flex-wrap">
                    <Box>
                        <Typography className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Current balance</Typography>
                        <Typography className="text-xl font-black" sx={{ color: EMERALD_DARK }}>{money(item.currentBalance)}</Typography>
                    </Box>
                    <Chip
                        size="small"
                        label={`Added ${formatDate(item.createdAt)}`}
                        sx={{ backgroundColor: VIOLET, color: "#ffffff", fontWeight: 600, height: 22 }}
                    />
                </Box>

                <Divider />

                <Box className="flex flex-col gap-1.5">
                    <Box className="flex items-center justify-between gap-2">
                        <Box className="flex items-center gap-1.5 min-w-0">
                            <LuCreditCard className="w-3.5 h-3.5 shrink-0" style={{ color: SKY }} />
                            <Typography className="text-xs font-semibold text-gray-700 truncate">
                                {maskAccountNumber(item.accountNumber)}
                            </Typography>
                        </Box>
                        <Tooltip title="Copy account number">
                            <IconButton size="small" onClick={() => onCopy("Account number", item.accountNumber)} sx={{ color: SKY }}>
                                <LuCopy className="w-3.5 h-3.5" />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Box className="flex items-center justify-between gap-2">
                        <Box className="flex items-center gap-1.5 min-w-0">
                            <LuHash className="w-3.5 h-3.5 shrink-0" style={{ color: VIOLET }} />
                            <Typography className="text-xs font-semibold text-gray-700 truncate">{item.ifscCode || "No IFSC"}</Typography>
                        </Box>
                        {item.ifscCode && (
                            <Tooltip title="Copy IFSC">
                                <IconButton size="small" onClick={() => onCopy("IFSC code", item.ifscCode)} sx={{ color: VIOLET }}>
                                    <LuCopy className="w-3.5 h-3.5" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                </Box>

                <Box className="flex flex-wrap gap-1.5">
                    {item.UPIId && (
                        <Chip
                            size="small"
                            icon={<LuQrCode className="w-3 h-3" style={{ color: "#ffffff" }} />}
                            label={item.UPIId}
                            sx={{ backgroundColor: AMBER, color: "#ffffff", fontWeight: 600, height: 22, maxWidth: "100%" }}
                        />
                    )}
                    {item.mobileNumber && (
                        <Chip
                            size="small"
                            icon={<LuPhone className="w-3 h-3" style={{ color: "#ffffff" }} />}
                            label={item.mobileNumber}
                            sx={{ backgroundColor: PRIMARY, color: "#ffffff", fontWeight: 600, height: 22 }}
                        />
                    )}
                </Box>

                <Button
                    size="small"
                    variant="contained"
                    onClick={onOpen}
                    startIcon={<LuWallet className="w-3.5 h-3.5" />}
                    sx={{ mt: "auto", borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: SKY, "&:hover": { backgroundColor: SKY_DARK } }}
                >
                    Open account
                </Button>
            </Box>
        </Paper>
    );
}

/* ------------------------------------------------------------------ */
/* Bank account create / edit dialog                                   */
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

function BankAccountFormDialog({
    open,
    editing,
    onClose,
    onSubmit,
}: {
    open: boolean;
    editing: BankAccount | null;
    onClose: () => void;
    onSubmit: (data: CreateBankAccountInput, isEdit: boolean) => Promise<boolean>;
}) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        setForm({
            commonCallingName: editing?.commonCallingName ?? "",
            bankHolderName: editing?.bankHolderName ?? "",
            accountNumber: editing?.accountNumber ?? "",
            ifscCode: editing?.ifscCode ?? "",
            mobileNumber: editing?.mobileNumber ?? "",
            UPIId: editing?.UPIId ?? "",
            currentBalance: editing?.currentBalance?.toString() ?? "",
        });
    }, [open, editing]);

    const canSave = form.bankHolderName.trim().length > 0 && form.accountNumber.trim().length > 0;

    const handleSave = async () => {
        setSaving(true);
        const ok = await onSubmit(
            {
                bankHolderName: form.bankHolderName.trim(),
                accountNumber: form.accountNumber.trim(),
                ifscCode: form.ifscCode.trim() || undefined,
                mobileNumber: form.mobileNumber.trim() || undefined,
                UPIId: form.UPIId.trim() || undefined,
                commonCallingName: form.commonCallingName.trim() || undefined,
                currentBalance: toNumberOrUndefined(form.currentBalance),
            },
            Boolean(editing),
        );
        setSaving(false);
        if (ok) onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: "10px", border: `1px solid ${SKY}` } } }}>
            <DialogTitle sx={{ background: `linear-gradient(90deg, ${SKY} 0%, ${CYAN} 100%)`, color: "#ffffff", py: 1.5, px: 2 }}>
                <Box className="flex items-center justify-between gap-2">
                    <Box className="flex items-center gap-2">
                        <LuBuilding2 className="w-4 h-4" />
                        <Typography className="text-sm font-bold">{editing ? "Edit Bank Account" : "New Bank Account"}</Typography>
                    </Box>
                    <IconButton size="small" onClick={onClose} sx={{ color: "#ffffff" }}>
                        <LuX className="w-4 h-4" />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 2, pt: "16px !important" }}>
                <Box className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <TextField
                        label="Display name"
                        size="small"
                        className="sm:col-span-2"
                        placeholder="e.g. HDFC Main Collection"
                        value={form.commonCallingName}
                        onChange={(e) => setForm({ ...form, commonCallingName: e.target.value })}
                        helperText="Short name used across the ERP"
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
                    <TextField
                        label="IFSC code"
                        size="small"
                        value={form.ifscCode}
                        onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
                    />
                    <TextField
                        label="Linked mobile number"
                        size="small"
                        value={form.mobileNumber}
                        onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                    />
                    <TextField
                        label="UPI ID"
                        size="small"
                        value={form.UPIId}
                        onChange={(e) => setForm({ ...form, UPIId: e.target.value })}
                    />
                    <TextField
                        label="Current balance"
                        size="small"
                        type="number"
                        value={form.currentBalance}
                        onChange={(e) => setForm({ ...form, currentBalance: e.target.value })}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 2, pb: 2, pt: 0 }}>
                <Button onClick={onClose} size="small" sx={{ textTransform: "none", color: "#6b7280" }}>Cancel</Button>
                <Button
                    onClick={handleSave}
                    size="small"
                    variant="contained"
                    disabled={saving || !canSave}
                    startIcon={saving ? <CircularProgress size={14} sx={{ color: "#ffffff" }} /> : undefined}
                    sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: SKY, "&:hover": { backgroundColor: SKY_DARK } }}
                >
                    {editing ? "Save changes" : "Create account"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ------------------------------------------------------------------ */
/* Delete confirmation                                                 */
/* ------------------------------------------------------------------ */

function ConfirmDeleteDialog({
    open,
    title,
    description,
    onClose,
    onConfirm,
}: {
    open: boolean;
    title: string;
    description: string;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}) {
    const [busy, setBusy] = useState(false);

    const handleConfirm = async () => {
        setBusy(true);
        await onConfirm();
        setBusy(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: "10px", border: `1px solid ${ROSE}` } } }}>
            <DialogTitle sx={{ backgroundColor: ROSE, color: "#ffffff", py: 1.5, px: 2 }}>
                <Box className="flex items-center gap-2">
                    <LuTriangleAlert className="w-4 h-4" />
                    <Typography className="text-sm font-bold">{title}</Typography>
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

function AccountsManagementContent() {
    const router = useRouter();
    const { bankAccounts, loadingBankAccounts, getBankAccounts, createBankAccount, updateBankAccount, deleteBankAccount } = useERP();

    const [search, setSearch] = useState("");
    const [feedback, setFeedback] = useState<Feedback>({ open: false, severity: "success", message: "" });
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<BankAccount | null>(null);
    const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null);

    const notify = useCallback((severity: "success" | "error", message: string) => {
        setFeedback({ open: true, severity, message });
    }, []);

    useEffect(() => {
        getBankAccounts();
    }, [getBankAccounts]);

    const handleCopy = useCallback(async (label: string, value: string | null) => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            notify("success", `${label} copied`);
        } catch {
            notify("error", `Could not copy ${label.toLowerCase()}`);
        }
    }, [notify]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return bankAccounts;
        return bankAccounts.filter((account) =>
            (account.commonCallingName ?? "").toLowerCase().includes(term) ||
            (account.bankHolderName ?? "").toLowerCase().includes(term) ||
            (account.accountNumber ?? "").toLowerCase().includes(term) ||
            (account.ifscCode ?? "").toLowerCase().includes(term) ||
            (account.UPIId ?? "").toLowerCase().includes(term) ||
            (account.mobileNumber ?? "").toLowerCase().includes(term),
        );
    }, [bankAccounts, search]);

    const totalBalance = bankAccounts.reduce((sum, account) => sum + (account.currentBalance ?? 0), 0);
    const upiEnabled = bankAccounts.filter((account) => Boolean(account.UPIId)).length;
    const highestBalance = bankAccounts.reduce((max, account) => Math.max(max, account.currentBalance ?? 0), 0);

    const handleSubmit = async (data: CreateBankAccountInput, isEdit: boolean) => {
        const res = isEdit && editing
            ? await updateBankAccount(editing.bankAccountDetailsId, data)
            : await createBankAccount(data);
        notify(res.success ? "success" : "error", res.message ?? (res.success ? "Saved" : "Failed to save bank account"));
        if (res.success) await getBankAccounts();
        return res.success;
    };

    const handleDelete = async () => {
        if (!accountToDelete) return;
        const res = await deleteBankAccount(accountToDelete.bankAccountDetailsId);
        notify(res.success ? "success" : "error", res.message ?? "Failed to delete bank account");
    };

    return (
        <Box className="flex flex-col gap-2 sm:gap-3 h-full">

            {/* Stats */}
            <Box className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <StatCard label="Bank accounts" value={bankAccounts.length} color={SKY} icon={<LuBuilding2 className="w-4 h-4" />} />
                <StatCard label="Total balance" value={money(totalBalance)} color={EMERALD} icon={<LuWallet className="w-4 h-4" />} />
                <StatCard label="Highest balance" value={money(highestBalance)} color={VIOLET} icon={<LuTrendingUp className="w-4 h-4" />} />
                <StatCard label="UPI enabled" value={upiEnabled} color={AMBER} icon={<LuQrCode className="w-4 h-4" />} />
            </Box>

            {/* Toolbar */}
            <Paper elevation={0} className="rounded-lg" sx={{ border: `1px solid ${SKY}` }}>
                <Box className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 sm:p-2.5">
                    <Box className="flex items-center gap-2 min-w-0">
                        <Box className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: SKY, color: "#ffffff" }}>
                            <LuBanknote className="w-4 h-4" />
                        </Box>
                        <Box className="min-w-0">
                            <Typography className="text-sm font-bold text-gray-900 leading-tight">Bank Accounts</Typography>
                            <Typography className="text-[11px] text-gray-500 leading-tight">Manage branch collection & payout accounts</Typography>
                        </Box>
                    </Box>

                    <Divider flexItem orientation="vertical" className="hidden sm:block" />

                    <TextField
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, account no, IFSC or UPI…"
                        className="flex-1"
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LuSearch className="w-4 h-4 text-gray-400" />
                                    </InputAdornment>
                                ),
                                endAdornment: search ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearch("")}>
                                            <LuX className="w-3.5 h-3.5" />
                                        </IconButton>
                                    </InputAdornment>
                                ) : undefined,
                                sx: { borderRadius: "8px" },
                            },
                        }}
                    />

                    <Box className="flex items-center gap-2">
                        <Tooltip title="Refresh">
                            <IconButton size="small" onClick={() => getBankAccounts()} sx={{ border: `1px solid ${SKY}`, borderRadius: "8px", color: SKY }}>
                                <LuRefreshCw className={`w-4 h-4 ${loadingBankAccounts ? "animate-spin" : ""}`} />
                            </IconButton>
                        </Tooltip>
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<LuPlus className="w-3.5 h-3.5" />}
                            onClick={() => { setEditing(null); setFormOpen(true); }}
                            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, whiteSpace: "nowrap", backgroundColor: PRIMARY, "&:hover": { backgroundColor: PRIMARY_DARK } }}
                        >
                            New Account
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Content */}
            <Box className="flex-1 min-h-0 overflow-auto">
                {loadingBankAccounts && bankAccounts.length === 0 ? (
                    <Box className="py-20 flex flex-col items-center gap-2">
                        <CircularProgress size={28} sx={{ color: SKY }} />
                        <Typography className="text-sm text-gray-400">Loading bank accounts…</Typography>
                    </Box>
                ) : filtered.length === 0 ? (
                    <Paper elevation={0} className="rounded-lg py-16 flex flex-col items-center gap-2" sx={{ border: `1px solid ${SKY}` }}>
                        <Box className="w-12 h-12 rounded-lg flex items-center justify-center" sx={{ backgroundColor: SKY, color: "#ffffff" }}>
                            <LuBuilding2 className="w-6 h-6" />
                        </Box>
                        <Typography className="text-sm text-gray-500">
                            {search ? "No accounts match your search." : "No bank accounts added yet."}
                        </Typography>
                        {!search && (
                            <Button
                                size="small"
                                variant="contained"
                                startIcon={<LuPlus className="w-3.5 h-3.5" />}
                                onClick={() => { setEditing(null); setFormOpen(true); }}
                                sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: PRIMARY, "&:hover": { backgroundColor: PRIMARY_DARK } }}
                            >
                                Add first account
                            </Button>
                        )}
                    </Paper>
                ) : (
                    <Box className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                        {filtered.map((item) => (
                            <BankAccountCard
                                key={item.bankAccountDetailsId}
                                item={item}
                                onOpen={() => router.push(`/dashboard/accountants/accounts-management/${item.bankAccountDetailsId}`)}
                                onEdit={() => { setEditing(item); setFormOpen(true); }}
                                onDelete={() => setAccountToDelete(item)}
                                onCopy={handleCopy}
                            />
                        ))}
                    </Box>
                )}
            </Box>

            {/* Dialogs */}
            <BankAccountFormDialog
                open={formOpen}
                editing={editing}
                onClose={() => { setFormOpen(false); setEditing(null); }}
                onSubmit={handleSubmit}
            />

            <ConfirmDeleteDialog
                open={Boolean(accountToDelete)}
                title="Delete bank account"
                description={`"${accountToDelete?.commonCallingName || accountToDelete?.bankHolderName || "This account"}" will be deactivated and hidden from the ERP.`}
                onClose={() => setAccountToDelete(null)}
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

export default function AccountsManagementPage() {
    return (
        <AccountantDashboardLayout title="Accounts Management">
            <AccountsManagementContent />
        </AccountantDashboardLayout>
    );
}