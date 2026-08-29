"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AccountantDashboardLayout from "@/layouts/AccountantDashboardLayout";
import {
    useERP,
    type CompleteExpenseInput,
    type CreateExpenseInput,
    type Expense,
    type ExpenseDetail,
    type ExpenseStatus,
    type ExpensesQuery,
} from "@/contexts/ERPContext";
import { fileUploaderToS3 } from "@/services/s3";
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
    LinearProgress,
    MenuItem,
    Pagination,
    Paper,
    Snackbar,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    LuBanknote,
    LuBuilding2,
    LuCalendar,
    LuCheck,
    LuCircleCheckBig,
    LuCreditCard,
    LuExternalLink,
    LuFileText,
    LuHourglass,
    LuImage,
    LuPlus,
    LuReceipt,
    LuRefreshCw,
    LuSearch,
    LuTrash2,
    LuTriangleAlert,
    LuUpload,
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
const AMBER_DARK = "#d97706";
const EMERALD = "#10b981";
const EMERALD_DARK = "#059669";
const ORANGE = "#f97316";
const ROSE = "#f43f5e";
const ROSE_DARK = "#e11d48";

const PAGE_SIZE = 10;

const STATUS_TABS: { value: "all" | ExpenseStatus; label: string; color: string }[] = [
    { value: "all", label: "All", color: PRIMARY },
    { value: "pending", label: "Pending", color: AMBER },
    { value: "approved", label: "Approved", color: SKY },
    { value: "completed", label: "Completed", color: EMERALD },
    { value: "rejected", label: "Rejected", color: ROSE },
];

const STATUS_META: Record<ExpenseStatus, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: "Pending", color: AMBER, icon: <LuHourglass className="w-3 h-3" /> },
    approved: { label: "Approved", color: SKY, icon: <LuCheck className="w-3 h-3" /> },
    completed: { label: "Completed", color: EMERALD, icon: <LuCircleCheckBig className="w-3 h-3" /> },
    rejected: { label: "Rejected", color: ROSE, icon: <LuX className="w-3 h-3" /> },
};

const PAYMENT_MODES = ["Cash", "UPI", "NEFT", "IMPS", "RTGS", "Cheque", "Card"];

const PROOF_ACCEPT = "application/pdf,image/png,image/jpeg,image/jpg,image/webp";
const PROOF_MAX_BYTES = 10 * 1024 * 1024;

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

function StatusChip({ status }: { status: ExpenseStatus }) {
    const meta = STATUS_META[status] ?? STATUS_META.pending;
    return (
        <Chip
            size="small"
            icon={<Box className="flex items-center" sx={{ color: "#ffffff", ml: "6px" }}>{meta.icon}</Box>}
            label={meta.label}
            sx={{ backgroundColor: meta.color, color: "#ffffff", fontWeight: 700, height: 22, fontSize: 11 }}
        />
    );
}

/* ------------------------------------------------------------------ */
/* Create expense dialog                                               */
/* ------------------------------------------------------------------ */

const EMPTY_FORM = { bankAccountDetailsId: "", amount: "", description: "", modeOfPayment: "" };

function CreateExpenseDialog({
    open,
    onClose,
    onSubmit,
}: {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateExpenseInput) => Promise<boolean>;
}) {
    const { bankAccounts, getBankAccounts } = useERP();
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        setForm(EMPTY_FORM);
        getBankAccounts();
    }, [open, getBankAccounts]);

    const selectedAccount = bankAccounts.find((account) => account.bankAccountDetailsId === form.bankAccountDetailsId);
    const amountValue = Number(form.amount);
    const amountValid = form.amount.trim() !== "" && !Number.isNaN(amountValue) && amountValue > 0;
    const exceedsBalance = amountValid && selectedAccount ? amountValue > (selectedAccount.currentBalance ?? 0) : false;
    const canSave = amountValid && form.bankAccountDetailsId !== "";

    const handleSave = async () => {
        setSaving(true);
        const ok = await onSubmit({
            bankAccountDetailsId: form.bankAccountDetailsId,
            amount: amountValue,
            description: form.description.trim() || undefined,
            modeOfPayment: form.modeOfPayment || undefined,
        });
        setSaving(false);
        if (ok) onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: "10px", border: `1px solid ${VIOLET}` } } }}>
            <DialogTitle sx={{ background: `linear-gradient(90deg, ${VIOLET} 0%, ${PRIMARY} 100%)`, color: "#ffffff", py: 1.5, px: 2 }}>
                <Box className="flex items-center justify-between gap-2">
                    <Box className="flex items-center gap-2">
                        <LuReceipt className="w-4 h-4" />
                        <Typography className="text-sm font-bold">New Expense</Typography>
                    </Box>
                    <IconButton size="small" onClick={onClose} sx={{ color: "#ffffff" }}>
                        <LuX className="w-4 h-4" />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 2, pt: "16px !important" }}>
                <Box className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <TextField
                        select
                        required
                        label="Pay from account"
                        size="small"
                        className="sm:col-span-2"
                        value={form.bankAccountDetailsId}
                        onChange={(e) => setForm({ ...form, bankAccountDetailsId: e.target.value })}
                    >
                        {bankAccounts.length === 0 && <MenuItem value="" disabled>No bank accounts available</MenuItem>}
                        {bankAccounts.map((account) => (
                            <MenuItem key={account.bankAccountDetailsId} value={account.bankAccountDetailsId}>
                                {account.commonCallingName || account.bankHolderName || "Unnamed account"} — {money(account.currentBalance)}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Amount"
                        size="small"
                        type="number"
                        required
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        error={exceedsBalance}
                        helperText={exceedsBalance ? "Amount is more than the account balance" : " "}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                    />

                    <TextField
                        select
                        label="Mode of payment"
                        size="small"
                        value={form.modeOfPayment}
                        onChange={(e) => setForm({ ...form, modeOfPayment: e.target.value })}
                        helperText=" "
                    >
                        {PAYMENT_MODES.map((mode) => (
                            <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Description"
                        size="small"
                        className="sm:col-span-2"
                        multiline
                        minRows={2}
                        placeholder="What is this expense for?"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                </Box>

                {selectedAccount && (
                    <Paper elevation={0} className="rounded-lg mt-2.5 p-2.5 flex items-center gap-2" sx={{ border: `1px solid ${SKY}` }}>
                        <Box className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: SKY, color: "#ffffff" }}>
                            <LuBuilding2 className="w-4 h-4" />
                        </Box>
                        <Box className="min-w-0">
                            <Typography className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Available balance</Typography>
                            <Typography className="text-base font-black" sx={{ color: EMERALD_DARK }}>{money(selectedAccount.currentBalance)}</Typography>
                        </Box>
                    </Paper>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 2, pb: 2, pt: 0 }}>
                <Button onClick={onClose} size="small" sx={{ textTransform: "none", color: "#6b7280" }}>Cancel</Button>
                <Button
                    onClick={handleSave}
                    size="small"
                    variant="contained"
                    disabled={saving || !canSave}
                    startIcon={saving ? <CircularProgress size={14} sx={{ color: "#ffffff" }} /> : <LuPlus className="w-3.5 h-3.5" />}
                    sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: VIOLET, "&:hover": { backgroundColor: "#6d28d9" } }}
                >
                    Create expense
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ------------------------------------------------------------------ */
/* Reject dialog                                                       */
/* ------------------------------------------------------------------ */

function RejectExpenseDialog({
    expense,
    onClose,
    onConfirm,
}: {
    expense: Expense | null;
    onClose: () => void;
    onConfirm: (reason: string) => Promise<boolean>;
}) {
    const [reason, setReason] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => { if (expense) setReason(""); }, [expense]);

    const handleConfirm = async () => {
        setBusy(true);
        const ok = await onConfirm(reason.trim());
        setBusy(false);
        if (ok) onClose();
    };

    return (
        <Dialog open={Boolean(expense)} onClose={onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: "10px", border: `1px solid ${ROSE}` } } }}>
            <DialogTitle sx={{ backgroundColor: ROSE, color: "#ffffff", py: 1.5, px: 2 }}>
                <Box className="flex items-center gap-2">
                    <LuTriangleAlert className="w-4 h-4" />
                    <Typography className="text-sm font-bold">Reject expense</Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 2, pt: "16px !important" }}>
                <Typography className="text-sm text-gray-700 mb-2">
                    {money(expense?.amount)} — {expense?.description || "No description"}
                </Typography>
                <TextField
                    label="Reason for rejection"
                    size="small"
                    fullWidth
                    multiline
                    minRows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
            </DialogContent>
            <DialogActions sx={{ px: 2, pb: 2, pt: 0 }}>
                <Button onClick={onClose} size="small" sx={{ textTransform: "none", color: "#6b7280" }}>Cancel</Button>
                <Button
                    onClick={handleConfirm}
                    size="small"
                    variant="contained"
                    disabled={busy}
                    startIcon={busy ? <CircularProgress size={14} sx={{ color: "#ffffff" }} /> : <LuX className="w-3.5 h-3.5" />}
                    sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: ROSE, "&:hover": { backgroundColor: ROSE_DARK } }}
                >
                    Reject
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ------------------------------------------------------------------ */
/* Complete dialog                                                     */
/* ------------------------------------------------------------------ */

function CompleteExpenseDialog({
    expense,
    onClose,
    onConfirm,
}: {
    expense: Expense | null;
    onClose: () => void;
    onConfirm: (data: CompleteExpenseInput) => Promise<boolean>;
}) {
    const [proofOfPayment, setProofOfPayment] = useState("");
    const [modeOfPayment, setModeOfPayment] = useState("");
    const [busy, setBusy] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState("");
    const [fileIsPdf, setFileIsPdf] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!expense) return;
        setProofOfPayment("");
        setModeOfPayment(expense.modeOfPayment ?? "");
        setUploading(false);
        setProgress(0);
        setFileName("");
        setFileIsPdf(false);
        setUploadError("");
    }, [expense]);

    const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        const isPdf = file.type === "application/pdf";
        if (!isPdf && !file.type.startsWith("image/")) {
            setUploadError("Only PDF or image files are allowed");
            return;
        }
        if (file.size > PROOF_MAX_BYTES) {
            setUploadError("File must be smaller than 10 MB");
            return;
        }

        setUploadError("");
        setProofOfPayment("");
        setFileName(file.name);
        setFileIsPdf(isPdf);
        setProgress(0);
        setUploading(true);

        // fileUploaderToS3 swallows failures, so capture the URL to detect them.
        let uploadedUrl = "";
        await fileUploaderToS3(file, setProgress, (fileUrl) => { uploadedUrl = fileUrl; });
        setUploading(false);

        if (uploadedUrl) setProofOfPayment(uploadedUrl);
        else {
            setFileName("");
            setUploadError("Upload failed, please try again");
        }
    };

    const clearProof = () => {
        setProofOfPayment("");
        setFileName("");
        setProgress(0);
        setUploadError("");
    };

    const handleConfirm = async () => {
        setBusy(true);
        const ok = await onConfirm({ proofOfPayment: proofOfPayment.trim(), modeOfPayment: modeOfPayment || undefined });
        setBusy(false);
        if (ok) onClose();
    };

    return (
        <Dialog open={Boolean(expense)} onClose={onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: "10px", border: `1px solid ${EMERALD}` } } }}>
            <DialogTitle sx={{ background: `linear-gradient(90deg, ${EMERALD} 0%, ${CYAN} 100%)`, color: "#ffffff", py: 1.5, px: 2 }}>
                <Box className="flex items-center gap-2">
                    <LuCircleCheckBig className="w-4 h-4" />
                    <Typography className="text-sm font-bold">Complete payment</Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 2, pt: "16px !important" }}>
                <Paper elevation={0} className="rounded-lg p-2.5 mb-2.5" sx={{ border: `1px solid ${AMBER}` }}>
                    <Typography className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Amount to debit</Typography>
                    <Typography className="text-lg font-black" sx={{ color: AMBER_DARK }}>{money(expense?.amount)}</Typography>
                    <Typography className="text-[11px] text-gray-500">
                        From {expense?.bankAccountDetails?.commonCallingName || expense?.bankAccountDetails?.bankHolderName || "linked account"}
                    </Typography>
                </Paper>

                <Box className="flex flex-col gap-2.5">
                    <Paper elevation={0} className="rounded-lg p-2.5" sx={{ border: `1px solid ${ORANGE}` }}>
                        <Box className="flex items-center gap-2 mb-2">
                            <Box className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: ORANGE, color: "#ffffff" }}>
                                <LuFileText className="w-3.5 h-3.5" />
                            </Box>
                            <Box className="min-w-0">
                                <Typography className="text-xs font-bold text-gray-900 leading-tight">Proof of payment</Typography>
                                <Typography className="text-[10px] text-gray-500 leading-tight">PDF or image, up to 10 MB</Typography>
                            </Box>
                        </Box>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={PROOF_ACCEPT}
                            hidden
                            onChange={handleFileSelected}
                        />

                        {proofOfPayment ? (
                            <Box className="flex items-center justify-between gap-2 rounded-lg p-2" sx={{ border: `1px solid ${EMERALD}` }}>
                                <Box className="flex items-center gap-2 min-w-0">
                                    <Box className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: EMERALD, color: "#ffffff" }}>
                                        {fileIsPdf ? <LuFileText className="w-3.5 h-3.5" /> : <LuImage className="w-3.5 h-3.5" />}
                                    </Box>
                                    <Box className="min-w-0">
                                        <Typography className="text-xs font-bold text-gray-900 truncate">{fileName || "Uploaded file"}</Typography>
                                        <Typography className="text-[10px] font-semibold" sx={{ color: EMERALD_DARK }}>Uploaded</Typography>
                                    </Box>
                                </Box>
                                <Box className="flex items-center gap-0.5 shrink-0">
                                    <Tooltip title="Preview">
                                        <IconButton size="small" component="a" href={proofOfPayment} target="_blank" rel="noopener noreferrer" sx={{ color: PRIMARY }}>
                                            <LuExternalLink className="w-4 h-4" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Remove">
                                        <IconButton size="small" onClick={clearProof} sx={{ color: ROSE }}>
                                            <LuTrash2 className="w-4 h-4" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                        ) : uploading ? (
                            <Box className="flex flex-col gap-1.5">
                                <Typography className="text-xs font-semibold text-gray-700 truncate">{fileName}</Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={progress}
                                    sx={{ height: 6, borderRadius: "4px", backgroundColor: "#e0f2fe", "& .MuiLinearProgress-bar": { backgroundColor: ORANGE } }}
                                />
                                <Typography className="text-[10px] font-bold" sx={{ color: ORANGE }}>Uploading… {progress}%</Typography>
                            </Box>
                        ) : (
                            <Button
                                fullWidth
                                size="small"
                                variant="contained"
                                startIcon={<LuUpload className="w-3.5 h-3.5" />}
                                onClick={() => fileInputRef.current?.click()}
                                sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: ORANGE, "&:hover": { backgroundColor: "#ea6e0b" } }}
                            >
                                Upload receipt
                            </Button>
                        )}

                        {uploadError && (
                            <Typography className="text-[11px] font-semibold mt-1.5" sx={{ color: ROSE }}>{uploadError}</Typography>
                        )}
                    </Paper>

                    <TextField
                        select
                        label="Mode of payment"
                        size="small"
                        fullWidth
                        value={modeOfPayment}
                        onChange={(e) => setModeOfPayment(e.target.value)}
                    >
                        {PAYMENT_MODES.map((mode) => (
                            <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                        ))}
                    </TextField>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 2, pb: 2, pt: 0 }}>
                <Button onClick={onClose} size="small" sx={{ textTransform: "none", color: "#6b7280" }}>Cancel</Button>
                <Button
                    onClick={handleConfirm}
                    size="small"
                    variant="contained"
                    disabled={busy || uploading || proofOfPayment.trim() === ""}
                    startIcon={busy ? <CircularProgress size={14} sx={{ color: "#ffffff" }} /> : <LuCircleCheckBig className="w-3.5 h-3.5" />}
                    sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: EMERALD, "&:hover": { backgroundColor: EMERALD_DARK } }}
                >
                    Mark completed
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ------------------------------------------------------------------ */
/* Detail dialog                                                       */
/* ------------------------------------------------------------------ */

function DetailRow({ label, value, color }: { label: string; value: React.ReactNode; color: string }) {
    return (
        <Box className="flex items-start justify-between gap-2 py-1.5">
            <Typography className="text-[11px] font-bold uppercase tracking-wider text-gray-500 shrink-0">{label}</Typography>
            <Typography className="text-xs font-semibold text-right wrap-break-word" sx={{ color }}>{value}</Typography>
        </Box>
    );
}

function ExpenseDetailDialog({
    open,
    loading,
    detail,
    onClose,
}: {
    open: boolean;
    loading: boolean;
    detail: ExpenseDetail | null;
    onClose: () => void;
}) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: "10px", border: `1px solid ${PRIMARY}` } } }}>
            <DialogTitle sx={{ background: `linear-gradient(90deg, ${PRIMARY} 0%, ${VIOLET} 100%)`, color: "#ffffff", py: 1.5, px: 2 }}>
                <Box className="flex items-center justify-between gap-2">
                    <Box className="flex items-center gap-2">
                        <LuReceipt className="w-4 h-4" />
                        <Typography className="text-sm font-bold">Expense Details</Typography>
                    </Box>
                    <IconButton size="small" onClick={onClose} sx={{ color: "#ffffff" }}>
                        <LuX className="w-4 h-4" />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 2, pt: "16px !important" }}>
                {loading || !detail ? (
                    <Box className="py-10 flex flex-col items-center gap-2">
                        <CircularProgress size={26} sx={{ color: PRIMARY }} />
                        <Typography className="text-sm text-gray-400">Loading expense…</Typography>
                    </Box>
                ) : (
                    <Box className="flex flex-col">
                        <Box className="flex items-center justify-between gap-2 mb-2">
                            <Typography className="text-2xl font-black" sx={{ color: VIOLET }}>{money(detail.amount)}</Typography>
                            <StatusChip status={detail.expenseStatus} />
                        </Box>
                        <Divider />
                        <DetailRow label="Description" value={detail.description || "—"} color="#111827" />
                        <DetailRow label="Mode" value={detail.modeOfPayment || "—"} color={SKY_DARK} />
                        <DetailRow label="Bank account" value={detail.bankAccountDetails?.commonCallingName || detail.bankAccountDetails?.bankHolderName || "—"} color={SKY_DARK} />
                        <DetailRow label="Account balance" value={money(detail.bankAccountDetails?.currentBalance)} color={EMERALD_DARK} />
                        <DetailRow
                            label="Proof of payment"
                            value={detail.proofOfPayment
                                ? (
                                    <Button
                                        size="small"
                                        variant="contained"
                                        component="a"
                                        href={detail.proofOfPayment}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        startIcon={<LuExternalLink className="w-3.5 h-3.5" />}
                                        sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: ORANGE, "&:hover": { backgroundColor: "#ea6e0b" } }}
                                    >
                                        View receipt
                                    </Button>
                                )
                                : "—"}
                            color={ORANGE}
                        />
                        <DetailRow label="Created" value={formatDate(detail.createdAt)} color="#111827" />
                        <DetailRow label="Last updated" value={formatDate(detail.updatedAt)} color="#111827" />
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}

/* ------------------------------------------------------------------ */
/* Main content                                                        */
/* ------------------------------------------------------------------ */

function ExpensesManagementContent() {
    const {
        expenses,
        expensesMeta,
        expensesTotalAmount,
        loadingExpenses,
        getExpenses,
        getExpenseById,
        createExpense,
        approveExpense,
        rejectExpense,
        completeExpense,
    } = useERP();

    const [status, setStatus] = useState<"all" | ExpenseStatus>("all");
    const [page, setPage] = useState(1);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [modeOfPayment, setModeOfPayment] = useState("");
    const [search, setSearch] = useState("");

    const [feedback, setFeedback] = useState<Feedback>({ open: false, severity: "success", message: "" });
    const [createOpen, setCreateOpen] = useState(false);
    const [rejecting, setRejecting] = useState<Expense | null>(null);
    const [completing, setCompleting] = useState<Expense | null>(null);
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detail, setDetail] = useState<ExpenseDetail | null>(null);

    const notify = useCallback((severity: "success" | "error", message: string) => {
        setFeedback({ open: true, severity, message });
    }, []);

    const query = useMemo<ExpensesQuery>(() => ({
        page,
        limit: PAGE_SIZE,
        expenseStatus: status === "all" ? undefined : status,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        modeOfPayment: modeOfPayment || undefined,
    }), [page, status, startDate, endDate, modeOfPayment]);

    const reload = useCallback(() => { getExpenses(query); }, [getExpenses, query]);

    useEffect(() => { reload(); }, [reload]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return expenses;
        return expenses.filter((item) =>
            (item.description ?? "").toLowerCase().includes(term) ||
            (item.modeOfPayment ?? "").toLowerCase().includes(term) ||
            (item.proofOfPayment ?? "").toLowerCase().includes(term) ||
            (item.bankAccountDetails?.commonCallingName ?? "").toLowerCase().includes(term) ||
            (item.bankAccountDetails?.bankHolderName ?? "").toLowerCase().includes(term) ||
            String(item.amount).includes(term),
        );
    }, [expenses, search]);

    const pendingCount = expenses.filter((item) => item.expenseStatus === "pending").length;
    const approvedAmount = expenses
        .filter((item) => item.expenseStatus === "approved")
        .reduce((sum, item) => sum + item.amount, 0);

    const handleCreate = async (data: CreateExpenseInput) => {
        const res = await createExpense(data);
        notify(res.success ? "success" : "error", res.message ?? "Failed to create expense");
        if (res.success) reload();
        return res.success;
    };

    const handleApprove = async (expense: Expense) => {
        setApprovingId(expense.expenseId);
        const res = await approveExpense(expense.expenseId);
        setApprovingId(null);
        notify(res.success ? "success" : "error", res.message ?? "Failed to approve expense");
        if (res.success) reload();
    };

    const handleReject = async (reason: string) => {
        if (!rejecting) return false;
        const res = await rejectExpense(rejecting.expenseId, reason || undefined);
        notify(res.success ? "success" : "error", res.message ?? "Failed to reject expense");
        if (res.success) reload();
        return res.success;
    };

    const handleComplete = async (data: CompleteExpenseInput) => {
        if (!completing) return false;
        const res = await completeExpense(completing.expenseId, data);
        notify(res.success ? "success" : "error", res.message ?? "Failed to complete expense");
        if (res.success) reload();
        return res.success;
    };

    const handleOpenDetail = async (expenseId: string) => {
        setDetail(null);
        setDetailOpen(true);
        setDetailLoading(true);
        const res = await getExpenseById(expenseId);
        setDetailLoading(false);
        if (res.success && res.data) setDetail(res.data);
        else notify("error", res.message ?? "Failed to fetch expense");
    };

    const clearFilters = () => {
        setStartDate("");
        setEndDate("");
        setModeOfPayment("");
        setSearch("");
        setPage(1);
    };

    const hasFilters = Boolean(startDate || endDate || modeOfPayment || search);

    return (
        <Box className="flex flex-col gap-2 sm:gap-3 h-full">

            {/* Stats */}
            <Box className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <StatCard label="Expenses" value={expensesMeta?.total ?? expenses.length} color={VIOLET} icon={<LuReceipt className="w-4 h-4" />} />
                <StatCard label="Total amount" value={money(expensesTotalAmount)} color={ORANGE} icon={<LuBanknote className="w-4 h-4" />} />
                <StatCard label="Pending (page)" value={pendingCount} color={AMBER} icon={<LuHourglass className="w-4 h-4" />} />
                <StatCard label="Approved (page)" value={money(approvedAmount)} color={SKY} icon={<LuWallet className="w-4 h-4" />} />
            </Box>

            {/* Status tabs */}
            <Paper elevation={0} className="rounded-lg" sx={{ border: `1px solid ${VIOLET}` }}>
                <Tabs
                    value={status}
                    onChange={(_, value) => { setStatus(value); setPage(1); }}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        minHeight: 40,
                        "& .MuiTab-root": { minHeight: 40, textTransform: "none", fontWeight: 700, fontSize: 13 },
                        "& .MuiTabs-indicator": { backgroundColor: VIOLET, height: 3 },
                        "& .Mui-selected": { color: `${VIOLET} !important` },
                    }}
                >
                    {STATUS_TABS.map((tab) => (
                        <Tab
                            key={tab.value}
                            value={tab.value}
                            label={
                                <Box className="flex items-center gap-1.5">
                                    <Box className="w-2 h-2 rounded-full" sx={{ backgroundColor: tab.color }} />
                                    {tab.label}
                                </Box>
                            }
                        />
                    ))}
                </Tabs>
            </Paper>

            {/* Toolbar */}
            <Paper elevation={0} className="rounded-lg" sx={{ border: `1px solid ${SKY}` }}>
                <Box className="flex flex-col lg:flex-row lg:items-center gap-2 p-2 sm:p-2.5">
                    <TextField
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search description, mode, account…"
                        className="flex-1 min-w-0"
                        slotProps={{
                            input: {
                                startAdornment: <InputAdornment position="start"><LuSearch className="w-4 h-4 text-gray-400" /></InputAdornment>,
                                sx: { borderRadius: "8px" },
                            },
                        }}
                    />

                    <Box className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <TextField
                            size="small"
                            type="date"
                            label="From"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                            slotProps={{ inputLabel: { shrink: true }, input: { sx: { borderRadius: "8px" } } }}
                        />
                        <TextField
                            size="small"
                            type="date"
                            label="To"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                            slotProps={{ inputLabel: { shrink: true }, input: { sx: { borderRadius: "8px" } } }}
                        />
                        <TextField
                            select
                            size="small"
                            label="Mode"
                            value={modeOfPayment}
                            onChange={(e) => { setModeOfPayment(e.target.value); setPage(1); }}
                            slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                        >
                            <MenuItem value="">All modes</MenuItem>
                            {PAYMENT_MODES.map((mode) => (
                                <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    <Box className="flex items-center gap-2">
                        {hasFilters && (
                            <Tooltip title="Clear filters">
                                <IconButton size="small" onClick={clearFilters} sx={{ border: `1px solid ${ROSE}`, borderRadius: "8px", color: ROSE }}>
                                    <LuX className="w-4 h-4" />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Tooltip title="Refresh">
                            <IconButton size="small" onClick={reload} sx={{ border: `1px solid ${SKY}`, borderRadius: "8px", color: SKY }}>
                                <LuRefreshCw className={`w-4 h-4 ${loadingExpenses ? "animate-spin" : ""}`} />
                            </IconButton>
                        </Tooltip>
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<LuPlus className="w-3.5 h-3.5" />}
                            onClick={() => setCreateOpen(true)}
                            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, whiteSpace: "nowrap", backgroundColor: PRIMARY, "&:hover": { backgroundColor: PRIMARY_DARK } }}
                        >
                            New Expense
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Table */}
            <Box className="flex-1 min-h-0">
                {loadingExpenses && expenses.length === 0 ? (
                    <Box className="py-20 flex flex-col items-center gap-2">
                        <CircularProgress size={28} sx={{ color: VIOLET }} />
                        <Typography className="text-sm text-gray-400">Loading expenses…</Typography>
                    </Box>
                ) : filtered.length === 0 ? (
                    <Paper elevation={0} className="rounded-lg py-16 flex flex-col items-center gap-2" sx={{ border: `1px solid ${VIOLET}` }}>
                        <Box className="w-12 h-12 rounded-lg flex items-center justify-center" sx={{ backgroundColor: VIOLET, color: "#ffffff" }}>
                            <LuReceipt className="w-6 h-6" />
                        </Box>
                        <Typography className="text-sm text-gray-500">
                            {hasFilters || status !== "all" ? "No expenses match the current filters." : "No expenses recorded yet."}
                        </Typography>
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<LuPlus className="w-3.5 h-3.5" />}
                            onClick={() => setCreateOpen(true)}
                            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: PRIMARY, "&:hover": { backgroundColor: PRIMARY_DARK } }}
                        >
                            Add expense
                        </Button>
                    </Paper>
                ) : (
                    <Paper elevation={0} className="rounded-lg overflow-hidden" sx={{ border: `1px solid ${VIOLET}` }}>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ background: `linear-gradient(90deg, ${VIOLET} 0%, ${PRIMARY} 100%)` }}>
                                        <TableCell sx={{ color: "#ffffff", fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: .5 }}>Expense</TableCell>
                                        <TableCell sx={{ color: "#ffffff", fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: .5 }}>Amount</TableCell>
                                        <TableCell className="hidden md:table-cell" sx={{ color: "#ffffff", fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: .5 }}>Account</TableCell>
                                        <TableCell className="hidden sm:table-cell" sx={{ color: "#ffffff", fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: .5 }}>Mode</TableCell>
                                        <TableCell className="hidden lg:table-cell" sx={{ color: "#ffffff", fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: .5 }}>Created</TableCell>
                                        <TableCell sx={{ color: "#ffffff", fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: .5 }}>Status</TableCell>
                                        <TableCell align="right" sx={{ color: "#ffffff", fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: .5 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filtered.map((item) => (
                                        <TableRow key={item.expenseId} hover sx={{ "&:hover": { backgroundColor: "#f5f3ff" } }}>
                                            <TableCell sx={{ maxWidth: 220 }}>
                                                <Box className="flex items-center gap-2 min-w-0">
                                                    <Box className="w-7 h-7 rounded-lg items-center justify-center shrink-0 hidden sm:flex" sx={{ backgroundColor: VIOLET, color: "#ffffff" }}>
                                                        <LuReceipt className="w-3.5 h-3.5" />
                                                    </Box>
                                                    <Box className="min-w-0">
                                                        <Typography className="text-xs font-bold text-gray-900 truncate">
                                                            {item.description || "No description"}
                                                        </Typography>
                                                        <Typography className="text-[10px] text-gray-500 lg:hidden">{formatDate(item.createdAt)}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography className="text-sm font-black whitespace-nowrap" sx={{ color: ORANGE }}>{money(item.amount)}</Typography>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Typography className="text-xs font-semibold text-gray-700 truncate">
                                                    {item.bankAccountDetails?.commonCallingName || item.bankAccountDetails?.bankHolderName || "—"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                {item.modeOfPayment ? (
                                                    <Chip
                                                        size="small"
                                                        icon={<LuCreditCard className="w-3 h-3" style={{ color: "#ffffff" }} />}
                                                        label={item.modeOfPayment}
                                                        sx={{ backgroundColor: SKY, color: "#ffffff", fontWeight: 600, height: 22, fontSize: 11 }}
                                                    />
                                                ) : (
                                                    <Typography className="text-xs text-gray-400">—</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <Box className="flex items-center gap-1.5">
                                                    <LuCalendar className="w-3.5 h-3.5 shrink-0" style={{ color: CYAN }} />
                                                    <Typography className="text-xs font-semibold text-gray-700 whitespace-nowrap">{formatDate(item.createdAt)}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell><StatusChip status={item.expenseStatus} /></TableCell>
                                            <TableCell align="right">
                                                <Box className="flex items-center justify-end gap-0.5">
                                                    {item.expenseStatus === "pending" && (
                                                        <>
                                                            <Tooltip title="Approve">
                                                                <span>
                                                                    <IconButton
                                                                        size="small"
                                                                        disabled={approvingId === item.expenseId}
                                                                        onClick={() => handleApprove(item)}
                                                                        sx={{ color: EMERALD_DARK }}
                                                                    >
                                                                        {approvingId === item.expenseId
                                                                            ? <CircularProgress size={14} sx={{ color: EMERALD_DARK }} />
                                                                            : <LuCheck className="w-4 h-4" />}
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>
                                                            <Tooltip title="Reject">
                                                                <IconButton size="small" onClick={() => setRejecting(item)} sx={{ color: ROSE }}>
                                                                    <LuX className="w-4 h-4" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                    {item.expenseStatus === "approved" && (
                                                        <>
                                                            <Tooltip title="Complete payment">
                                                                <IconButton size="small" onClick={() => setCompleting(item)} sx={{ color: EMERALD_DARK }}>
                                                                    <LuCircleCheckBig className="w-4 h-4" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Reject">
                                                                <IconButton size="small" onClick={() => setRejecting(item)} sx={{ color: ROSE }}>
                                                                    <LuX className="w-4 h-4" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                    <Tooltip title="View details">
                                                        <IconButton size="small" onClick={() => handleOpenDetail(item.expenseId)} sx={{ color: PRIMARY }}>
                                                            <LuExternalLink className="w-4 h-4" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {expensesMeta && expensesMeta.totalPages > 1 && (
                            <Box className="flex items-center justify-between gap-2 p-2 flex-wrap" sx={{ borderTop: "1px solid #e5e7eb" }}>
                                <Typography className="text-[11px] font-semibold text-gray-500">
                                    Page {expensesMeta.page} of {expensesMeta.totalPages} · {expensesMeta.total} expenses
                                </Typography>
                                <Pagination
                                    size="small"
                                    count={expensesMeta.totalPages}
                                    page={page}
                                    onChange={(_, value) => setPage(value)}
                                    sx={{ "& .Mui-selected": { backgroundColor: `${VIOLET} !important`, color: "#ffffff" } }}
                                />
                            </Box>
                        )}
                    </Paper>
                )}
            </Box>

            {/* Dialogs */}
            <CreateExpenseDialog open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} />
            <RejectExpenseDialog expense={rejecting} onClose={() => setRejecting(null)} onConfirm={handleReject} />
            <CompleteExpenseDialog expense={completing} onClose={() => setCompleting(null)} onConfirm={handleComplete} />
            <ExpenseDetailDialog open={detailOpen} loading={detailLoading} detail={detail} onClose={() => setDetailOpen(false)} />

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

export default function ExpensesManagementPage() {
    return (
        <AccountantDashboardLayout title="Expenses Management">
            <ExpensesManagementContent />
        </AccountantDashboardLayout>
    );
}