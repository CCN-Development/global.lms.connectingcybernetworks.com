"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import AccountantDashboardLayout from "@/layouts/AccountantDashboardLayout";
import {
    useERP,
    type CreateStudentPaymentInput,
    type PaymentStatus,
    type StudentPayment,
    type StudentPaymentsQuery,
    type UpdateStudentPaymentInput,
} from "@/contexts/ERPContext";
import { useRM } from "@/contexts/RMContext";
import type { LMSStudentData, StudentPurchaseDetail, StudentPaymentSchedule } from "@/contexts/StudentContext";
import {
    Alert,
    Autocomplete,
    Avatar,
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
    LuBadgeCheck,
    LuBanknote,
    LuBuilding2,
    LuCalendarClock,
    LuCircleCheckBig,
    LuCirclePlus,
    LuHourglass,
    LuPencil,
    LuReceipt,
    LuRefreshCw,
    LuSearch,
    LuShieldOff,
    LuTrash2,
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
const ORANGE = "#f97316";
const ROSE = "#f43f5e";
const ROSE_DARK = "#e11d48";

const PAGE_SIZE = 10;

/** Late-payment penalty charged for every day an installment stays overdue. */
const FINE_PER_DAY = 250;

const PAYMENT_MODES = ["Cash", "UPI", "NEFT", "IMPS", "RTGS", "Cheque", "Card"];

/** Cheque clearance is not instant, so those collections stay unverified. */
const UNVERIFIED_MODES = ["Cheque"];

const STATUS_TABS: { value: "all" | PaymentStatus; label: string; color: string }[] = [
    { value: "all", label: "All", color: PRIMARY },
    { value: "completed", label: "Completed", color: EMERALD },
    { value: "pending", label: "Pending", color: AMBER },
    { value: "failed", label: "Failed", color: ROSE },
];

const STATUS_META: Record<PaymentStatus, { label: string; color: string; icon: React.ReactNode }> = {
    completed: { label: "Completed", color: EMERALD, icon: <LuCircleCheckBig className="w-3 h-3" /> },
    pending: { label: "Pending", color: AMBER, icon: <LuHourglass className="w-3 h-3" /> },
    failed: { label: "Failed", color: ROSE, icon: <LuX className="w-3 h-3" /> },
};

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

function toDateInput(value: string | null | undefined) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
}

function round2(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function daysOverdue(dueDate: string) {
    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime())) return 0;
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const diff = startOfToday().getTime() - dueDay.getTime();
    return diff <= 0 ? 0 : Math.floor(diff / 86400000);
}

/** Amount still owed on a schedule after any partial allocation. */
function scheduleOutstanding(schedule: StudentPaymentSchedule | null) {
    if (!schedule || schedule.isPaid) return 0;
    const already = schedule.isPartialPayment ? schedule.partialPaymentAmount ?? 0 : 0;
    return round2(Math.max(schedule.amount - already, 0));
}

interface PurchaseBreakdown {
    overdue: StudentPaymentSchedule[];
    nextEmi: StudentPaymentSchedule | null;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    overdueAmount: number;
    fineAmount: number;
    suggestedAmount: number;
}

function buildBreakdown(purchase: StudentPurchaseDetail | null): PurchaseBreakdown | null {
    if (!purchase) return null;

    const schedules = [...(purchase.studentPaymentSchedules ?? [])].sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );
    const unpaid = schedules.filter((item) => !item.isPaid);
    const overdue = unpaid.filter((item) => daysOverdue(item.dueDate) > 0);
    const nextEmi = unpaid.find((item) => daysOverdue(item.dueDate) === 0) ?? null;

    const totalAmount = purchase.amount ?? 0;
    const paidAmount = purchase.currentPaidAmount ?? 0;
    const remainingAmount = round2(Math.max(totalAmount - paidAmount, 0));

    const overdueAmount = round2(overdue.reduce((sum, item) => sum + scheduleOutstanding(item), 0));
    const fineAmount = round2(overdue.reduce((sum, item) => sum + daysOverdue(item.dueDate) * FINE_PER_DAY, 0));

    const rawSuggested = overdueAmount > 0 ? overdueAmount : scheduleOutstanding(nextEmi);
    const suggestedAmount = round2(Math.min(rawSuggested || remainingAmount, remainingAmount));

    return { overdue, nextEmi, totalAmount, paidAmount, remainingAmount, overdueAmount, fineAmount, suggestedAmount };
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

function StatusChip({ status }: { status: PaymentStatus | null }) {
    const meta = STATUS_META[status ?? "completed"] ?? STATUS_META.completed;
    return (
        <Chip
            size="small"
            icon={<Box className="flex items-center" sx={{ color: "#ffffff", ml: "6px" }}>{meta.icon}</Box>}
            label={meta.label}
            sx={{ backgroundColor: meta.color, color: "#ffffff", fontWeight: 700, height: 22, fontSize: 11 }}
        />
    );
}

function VerifiedChip({ isVerified }: { isVerified: boolean }) {
    return (
        <Chip
            size="small"
            icon={
                <Box className="flex items-center" sx={{ color: "#ffffff", ml: "6px" }}>
                    {isVerified ? <LuBadgeCheck className="w-3 h-3" /> : <LuShieldOff className="w-3 h-3" />}
                </Box>
            }
            label={isVerified ? "Verified" : "Unverified"}
            sx={{ backgroundColor: isVerified ? SKY : ORANGE, color: "#ffffff", fontWeight: 700, height: 22, fontSize: 11 }}
        />
    );
}

function DetailRow({ label, value, color }: { label: string; value: React.ReactNode; color: string }) {
    return (
        <Box className="flex items-start justify-between gap-3 py-1.5 border-b border-gray-100 last:border-b-0">
            <Typography className="text-[11px] font-bold uppercase tracking-wider text-gray-500 shrink-0">{label}</Typography>
            <Box className="text-right min-w-0">
                {typeof value === "string" || typeof value === "number"
                    ? <Typography className="text-xs font-bold truncate" sx={{ color }}>{value}</Typography>
                    : value}
            </Box>
        </Box>
    );
}

function SummaryTile({ label, value, color, hint }: { label: string; value: string; color: string; hint?: string }) {
    return (
        <Paper elevation={0} className="rounded-lg p-2" sx={{ border: `1px solid ${color}` }}>
            <Typography className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</Typography>
            <Typography className="text-sm font-black leading-tight" sx={{ color }}>{value}</Typography>
            {hint && <Typography className="text-[10px] text-gray-500 leading-tight">{hint}</Typography>}
        </Paper>
    );
}

/* ------------------------------------------------------------------ */
/* Create collection dialog                                            */
/* ------------------------------------------------------------------ */

function CreateCollectionDialog({
    open,
    onClose,
    onSubmit,
}: {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateStudentPaymentInput) => Promise<boolean>;
}) {
    const { bankAccounts, getBankAccounts } = useERP();
    const { getAllStudentsForBranch, getStudentPurchases } = useRM();

    const [studentQuery, setStudentQuery] = useState("");
    const [studentOptions, setStudentOptions] = useState<LMSStudentData[]>([]);
    const [searchingStudents, setSearchingStudents] = useState(false);
    const [student, setStudent] = useState<LMSStudentData | null>(null);

    const [purchases, setPurchases] = useState<StudentPurchaseDetail[]>([]);
    const [loadingPurchases, setLoadingPurchases] = useState(false);
    const [purchaseId, setPurchaseId] = useState("");

    const [bankAccountDetailsId, setBankAccountDetailsId] = useState("");
    const [amount, setAmount] = useState("");
    const [amountTouched, setAmountTouched] = useState(false);
    const [waiveFine, setWaiveFine] = useState(false);
    const [paymentMode, setPaymentMode] = useState("");
    const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [paymentReference, setPaymentReference] = useState("");
    const [comments, setComments] = useState("");
    const [saving, setSaving] = useState(false);

    const resetAll = useCallback(() => {
        setStudentQuery("");
        setStudentOptions([]);
        setStudent(null);
        setPurchases([]);
        setPurchaseId("");
        setBankAccountDetailsId("");
        setAmount("");
        setAmountTouched(false);
        setWaiveFine(false);
        setPaymentMode("");
        setPaymentDate(new Date().toISOString().slice(0, 10));
        setPaymentReference("");
        setComments("");
    }, []);

    useEffect(() => {
        if (!open) return;
        resetAll();
        getBankAccounts();
    }, [open, resetAll, getBankAccounts]);

    // Debounced student lookup against the RM branch directory.
    useEffect(() => {
        if (!open) return;
        const term = studentQuery.trim();
        if (term.length < 2) {
            setStudentOptions([]);
            return;
        }
        let cancelled = false;
        setSearchingStudents(true);
        const timer = setTimeout(async () => {
            const res = await getAllStudentsForBranch({ search: term, limit: 20, page: 1 });
            if (cancelled) return;
            setSearchingStudents(false);
            setStudentOptions(res.success && res.data ? res.data.data : []);
        }, 350);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [open, studentQuery, getAllStudentsForBranch]);

    const handleStudentChange = async (value: LMSStudentData | null) => {
        setStudent(value);
        setPurchases([]);
        setPurchaseId("");
        setAmount("");
        setAmountTouched(false);
        setWaiveFine(false);
        if (!value) return;

        setLoadingPurchases(true);
        const res = await getStudentPurchases(value.studentId);
        setLoadingPurchases(false);
        if (res.success && res.data) {
            setPurchases(res.data);
            const openPurchase = res.data.find((item) => !item.isAllPaymentsDone) ?? res.data[0];
            if (openPurchase) setPurchaseId(openPurchase.purchaseId);
        }
    };

    const selectedPurchase = purchases.find((item) => item.purchaseId === purchaseId) ?? null;
    const breakdown = useMemo(() => buildBreakdown(selectedPurchase), [selectedPurchase]);

    // Prefill the amount from the suggestion until the accountant edits it.
    useEffect(() => {
        if (!breakdown || amountTouched) return;
        setAmount(breakdown.suggestedAmount > 0 ? String(breakdown.suggestedAmount) : "");
    }, [breakdown, amountTouched]);

    const fineAmount = waiveFine ? 0 : breakdown?.fineAmount ?? 0;
    const amountValue = Number(amount);
    const amountValid = amount.trim() !== "" && !Number.isNaN(amountValue) && amountValue > 0;
    const isVerified = paymentMode !== "" && !UNVERIFIED_MODES.includes(paymentMode);
    const exceedsRemaining = Boolean(breakdown && amountValid && amountValue > breakdown.remainingAmount);
    const canSave = Boolean(student) && bankAccountDetailsId !== "" && amountValid && paymentMode !== "";

    const handleSave = async () => {
        if (!student) return;
        setSaving(true);
        const ok = await onSubmit({
            studentId: student.studentId,
            bankAccountDetailsId,
            purchaseId: purchaseId || undefined,
            amount: round2(amountValue),
            anyFineAmount: fineAmount > 0 ? fineAmount : undefined,
            paymentMode,
            paymentDate: paymentDate || undefined,
            paymentReference: paymentReference.trim() || undefined,
            comments: comments.trim() || undefined,
            isVerified,
        });
        setSaving(false);
        if (ok) onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" slotProps={{ paper: { sx: { borderRadius: "10px", border: `1px solid ${PRIMARY}` } } }}>
            <DialogTitle sx={{ background: `linear-gradient(90deg, ${PRIMARY} 0%, ${VIOLET} 100%)`, color: "#ffffff", py: 1.5, px: 2 }}>
                <Box className="flex items-center justify-between gap-2">
                    <Box className="flex items-center gap-2">
                        <LuCirclePlus className="w-4 h-4" />
                        <Typography className="text-sm font-bold">New Collection</Typography>
                    </Box>
                    <IconButton size="small" onClick={onClose} sx={{ color: "#ffffff" }}>
                        <LuX className="w-4 h-4" />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 2, pt: "16px !important" }}>
                <Box className="flex flex-col gap-2.5">

                    {/* Student + bank account */}
                    <Paper elevation={0} className="rounded-lg p-2.5" sx={{ border: `1px solid ${VIOLET}` }}>
                        <Box className="flex items-center gap-2 mb-2">
                            <Box className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: VIOLET, color: "#ffffff" }}>
                                <LuUser className="w-3.5 h-3.5" />
                            </Box>
                            <Typography className="text-xs font-bold text-gray-900">Student &amp; account</Typography>
                        </Box>

                        <Box className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Autocomplete
                                size="small"
                                options={studentOptions}
                                value={student}
                                loading={searchingStudents}
                                onChange={(_, value) => handleStudentChange(value)}
                                onInputChange={(_, value) => setStudentQuery(value)}
                                isOptionEqualToValue={(option, value) => option.studentId === value.studentId}
                                getOptionLabel={(option) => option.studentName}
                                noOptionsText={studentQuery.trim().length < 2 ? "Type at least 2 characters" : "No students found"}
                                renderOption={(props, option) => {
                                    const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & { key: string };
                                    return (
                                        <li key={key} {...rest}>
                                            <Box className="flex items-center gap-2 min-w-0">
                                                <Avatar src={option.studentPhoto ?? undefined} sx={{ width: 26, height: 26, backgroundColor: VIOLET, fontSize: 11 }}>
                                                    {option.studentName.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box className="min-w-0">
                                                    <Typography className="text-xs font-bold text-gray-900 truncate">{option.studentName}</Typography>
                                                    <Typography className="text-[10px] text-gray-500 truncate">
                                                        {option.studentRegistrationNumber || "No reg. no"} · {option.phoneNumber}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </li>
                                    );
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Search student"
                                        placeholder="Name, phone or registration no."
                                        slotProps={{
                                            ...params.slotProps,
                                            input: {
                                                ...params.slotProps.input,
                                                startAdornment: (
                                                    <>
                                                        <InputAdornment position="start"><LuSearch className="w-4 h-4 text-gray-400" /></InputAdornment>
                                                        {params.slotProps.input.startAdornment}
                                                    </>
                                                ),
                                                endAdornment: (
                                                    <>
                                                        {searchingStudents ? <CircularProgress size={14} sx={{ color: VIOLET }} /> : null}
                                                        {params.slotProps.input.endAdornment}
                                                    </>
                                                ),
                                            },
                                        }}
                                    />
                                )}
                            />

                            <TextField
                                select
                                size="small"
                                label="Deposit to bank account"
                                value={bankAccountDetailsId}
                                onChange={(e) => setBankAccountDetailsId(e.target.value)}
                                slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                            >
                                {bankAccounts.length === 0 && <MenuItem value="" disabled>No active bank accounts</MenuItem>}
                                {bankAccounts.map((account) => (
                                    <MenuItem key={account.bankAccountDetailsId} value={account.bankAccountDetailsId}>
                                        {account.commonCallingName || account.bankHolderName || account.accountNumber} · {money(account.currentBalance)}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </Paper>

                    {/* Purchase selection */}
                    {student && (
                        <Paper elevation={0} className="rounded-lg p-2.5" sx={{ border: `1px solid ${SKY}` }}>
                            <Box className="flex items-center gap-2 mb-2">
                                <Box className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: SKY, color: "#ffffff" }}>
                                    <LuReceipt className="w-3.5 h-3.5" />
                                </Box>
                                <Typography className="text-xs font-bold text-gray-900">Purchase</Typography>
                            </Box>

                            {loadingPurchases ? (
                                <Box className="py-4 flex items-center justify-center gap-2">
                                    <CircularProgress size={18} sx={{ color: SKY }} />
                                    <Typography className="text-xs text-gray-400">Loading purchases…</Typography>
                                </Box>
                            ) : purchases.length === 0 ? (
                                <Typography className="text-xs text-gray-500">
                                    This student has no purchases yet. The collection will be recorded without a purchase link.
                                </Typography>
                            ) : (
                                <TextField
                                    select
                                    size="small"
                                    fullWidth
                                    label="Select purchase"
                                    value={purchaseId}
                                    onChange={(e) => { setPurchaseId(e.target.value); setAmountTouched(false); setWaiveFine(false); }}
                                    slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                                >
                                    {purchases.map((item) => (
                                        <MenuItem key={item.purchaseId} value={item.purchaseId}>
                                            {formatDate(item.purchasedAt)} · {money(item.amount)}
                                            {item.isAllPaymentsDone ? " · Settled" : ` · Paid ${money(item.currentPaidAmount)}`}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        </Paper>
                    )}

                    {/* Dues, fine and next EMI */}
                    {breakdown && (
                        <Paper elevation={0} className="rounded-lg p-2.5" sx={{ border: `1px solid ${AMBER}` }}>
                            <Box className="flex items-center gap-2 mb-2">
                                <Box className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: AMBER, color: "#ffffff" }}>
                                    <LuCalendarClock className="w-3.5 h-3.5" />
                                </Box>
                                <Typography className="text-xs font-bold text-gray-900">Outstanding summary</Typography>
                            </Box>

                            <Box className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
                                <SummaryTile label="Total" value={money(breakdown.totalAmount)} color={SKY_DARK} />
                                <SummaryTile label="Paid" value={money(breakdown.paidAmount)} color={EMERALD_DARK} />
                                <SummaryTile label="Remaining" value={money(breakdown.remainingAmount)} color={ROSE_DARK} />
                                <SummaryTile
                                    label="Overdue EMIs"
                                    value={String(breakdown.overdue.length)}
                                    color={ORANGE}
                                    hint={breakdown.overdue.length > 0 ? money(breakdown.overdueAmount) : "None"}
                                />
                            </Box>

                            {breakdown.overdue.length > 0 && (
                                <Paper elevation={0} className="rounded-lg p-2 mb-2" sx={{ border: `1px solid ${ROSE}` }}>
                                    <Box className="flex items-center gap-1.5 mb-1.5">
                                        <LuTriangleAlert className="w-3.5 h-3.5" style={{ color: ROSE }} />
                                        <Typography className="text-[11px] font-bold uppercase tracking-wider" sx={{ color: ROSE_DARK }}>
                                            Overdue installments
                                        </Typography>
                                    </Box>
                                    <Box className="flex flex-col gap-1">
                                        {breakdown.overdue.map((item) => (
                                            <Box key={item.scheduleId} className="flex items-center justify-between gap-2">
                                                <Typography className="text-[11px] font-semibold text-gray-700">Due {formatDate(item.dueDate)}</Typography>
                                                <Box className="flex items-center gap-2 shrink-0">
                                                    <Typography className="text-[11px] font-bold" sx={{ color: ROSE_DARK }}>
                                                        {money(scheduleOutstanding(item))}
                                                    </Typography>
                                                    <Chip
                                                        size="small"
                                                        label={`${daysOverdue(item.dueDate)}d · ${money(daysOverdue(item.dueDate) * FINE_PER_DAY)}`}
                                                        sx={{ backgroundColor: ORANGE, color: "#ffffff", fontWeight: 700, height: 18, fontSize: 10 }}
                                                    />
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Paper>
                            )}

                            {breakdown.nextEmi && (
                                <Paper elevation={0} className="rounded-lg p-2 mb-2" sx={{ border: `1px solid ${CYAN}` }}>
                                    <Box className="flex items-center justify-between gap-2">
                                        <Box className="min-w-0">
                                            <Typography className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Next EMI</Typography>
                                            <Typography className="text-xs font-bold text-gray-900">
                                                {money(scheduleOutstanding(breakdown.nextEmi))} on {formatDate(breakdown.nextEmi.dueDate)}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            size="small"
                                            label={breakdown.nextEmi.isPartialPayment ? "Partially paid" : "Upcoming"}
                                            sx={{ backgroundColor: CYAN, color: "#ffffff", fontWeight: 700, height: 20, fontSize: 10 }}
                                        />
                                    </Box>
                                </Paper>
                            )}

                            {/* Fine control */}
                            <Paper
                                elevation={0}
                                className="rounded-lg p-2 flex items-center justify-between gap-2"
                                sx={{ border: `1px solid ${waiveFine ? EMERALD : ORANGE}` }}
                            >
                                <Box className="min-w-0">
                                    <Typography className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                        Late fine · {money(FINE_PER_DAY)}/day
                                    </Typography>
                                    <Typography className="text-sm font-black" sx={{ color: waiveFine ? EMERALD_DARK : ORANGE }}>
                                        {waiveFine ? "Waived" : money(breakdown.fineAmount)}
                                    </Typography>
                                </Box>
                                {breakdown.fineAmount > 0 && (
                                    <Button
                                        size="small"
                                        variant="contained"
                                        startIcon={waiveFine ? <LuRefreshCw className="w-3.5 h-3.5" /> : <LuTrash2 className="w-3.5 h-3.5" />}
                                        onClick={() => setWaiveFine((prev) => !prev)}
                                        sx={{
                                            borderRadius: "8px", textTransform: "none", fontWeight: 700, whiteSpace: "nowrap",
                                            backgroundColor: waiveFine ? EMERALD : ROSE,
                                            "&:hover": { backgroundColor: waiveFine ? EMERALD_DARK : ROSE_DARK },
                                        }}
                                    >
                                        {waiveFine ? "Re-apply fine" : "Remove fine"}
                                    </Button>
                                )}
                            </Paper>
                        </Paper>
                    )}

                    {/* Payment entry */}
                    <Paper elevation={0} className="rounded-lg p-2.5" sx={{ border: `1px solid ${EMERALD}` }}>
                        <Box className="flex items-center gap-2 mb-2">
                            <Box className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: EMERALD, color: "#ffffff" }}>
                                <LuBanknote className="w-3.5 h-3.5" />
                            </Box>
                            <Typography className="text-xs font-bold text-gray-900">Collection details</Typography>
                        </Box>

                        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                            <TextField
                                size="small"
                                label="Amount collected"
                                type="number"
                                value={amount}
                                onChange={(e) => { setAmount(e.target.value); setAmountTouched(true); }}
                                error={amount.trim() !== "" && !amountValid}
                                helperText={
                                    breakdown && !amountTouched && breakdown.suggestedAmount > 0
                                        ? `Suggested ${money(breakdown.suggestedAmount)}`
                                        : exceedsRemaining
                                            ? "Above the remaining balance"
                                            : " "
                                }
                                slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment>, sx: { borderRadius: "8px" } } }}
                            />
                            <TextField
                                select
                                size="small"
                                label="Payment mode"
                                value={paymentMode}
                                onChange={(e) => setPaymentMode(e.target.value)}
                                helperText={paymentMode === "" ? "Required" : isVerified ? "Auto-verified" : "Stays unverified until cleared"}
                                slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                            >
                                {PAYMENT_MODES.map((mode) => (
                                    <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                size="small"
                                type="date"
                                label="Payment date"
                                value={paymentDate}
                                onChange={(e) => setPaymentDate(e.target.value)}
                                slotProps={{ inputLabel: { shrink: true }, input: { sx: { borderRadius: "8px" } } }}
                            />
                            <TextField
                                size="small"
                                label="Reference / txn no."
                                value={paymentReference}
                                onChange={(e) => setPaymentReference(e.target.value)}
                                slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                            />
                        </Box>

                        <TextField
                            size="small"
                            fullWidth
                            multiline
                            minRows={2}
                            label="Comments"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            className="mt-2"
                            slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                        />

                        <Box className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                            <SummaryTile label="Fee amount" value={money(amountValid ? round2(amountValue) : 0)} color={EMERALD_DARK} />
                            <SummaryTile label="Fine" value={money(fineAmount)} color={fineAmount > 0 ? ORANGE : EMERALD_DARK} />
                            <SummaryTile
                                label="Bank credit"
                                value={money(round2((amountValid ? amountValue : 0) + fineAmount))}
                                color={VIOLET}
                                hint={paymentMode === "" ? undefined : isVerified ? "Verified on save" : "Unverified"}
                            />
                        </Box>
                    </Paper>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 2, pb: 2, pt: 0 }}>
                <Button onClick={onClose} size="small" sx={{ textTransform: "none", color: "#6b7280" }}>Cancel</Button>
                <Button
                    onClick={handleSave}
                    size="small"
                    variant="contained"
                    disabled={!canSave || saving}
                    startIcon={saving ? <CircularProgress size={14} sx={{ color: "#ffffff" }} /> : <LuCircleCheckBig className="w-3.5 h-3.5" />}
                    sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: PRIMARY, "&:hover": { backgroundColor: PRIMARY_DARK } }}
                >
                    Record collection
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ------------------------------------------------------------------ */
/* Edit collection dialog                                              */
/* ------------------------------------------------------------------ */

function EditCollectionDialog({
    payment,
    onClose,
    onSubmit,
}: {
    payment: StudentPayment | null;
    onClose: () => void;
    onSubmit: (data: UpdateStudentPaymentInput) => Promise<boolean>;
}) {
    const [amount, setAmount] = useState("");
    const [fine, setFine] = useState("");
    const [paymentMode, setPaymentMode] = useState("");
    const [paymentDate, setPaymentDate] = useState("");
    const [paymentReference, setPaymentReference] = useState("");
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("completed");
    const [comments, setComments] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!payment) return;
        setAmount(String(payment.amount));
        setFine(payment.anyFineAmount ? String(payment.anyFineAmount) : "");
        setPaymentMode(payment.paymentMode ?? "");
        setPaymentDate(toDateInput(payment.paymentDate));
        setPaymentReference(payment.paymentReference ?? "");
        setPaymentStatus(payment.paymentStatus ?? "completed");
        setComments(payment.comments ?? "");
    }, [payment]);

    const amountValue = Number(amount);
    const amountValid = amount.trim() !== "" && !Number.isNaN(amountValue) && amountValue > 0;
    const fineValue = fine.trim() === "" ? 0 : Number(fine);
    const fineValid = !Number.isNaN(fineValue) && fineValue >= 0;
    const isVerified = paymentMode !== "" && !UNVERIFIED_MODES.includes(paymentMode);

    const handleSave = async () => {
        setSaving(true);
        const ok = await onSubmit({
            amount: round2(amountValue),
            anyFineAmount: round2(fineValue),
            paymentMode: paymentMode || undefined,
            paymentDate: paymentDate || undefined,
            paymentReference: paymentReference.trim() || undefined,
            paymentStatus,
            comments: comments.trim() || undefined,
            isVerified,
        });
        setSaving(false);
        if (ok) onClose();
    };

    return (
        <Dialog open={Boolean(payment)} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: "10px", border: `1px solid ${SKY}` } } }}>
            <DialogTitle sx={{ background: `linear-gradient(90deg, ${SKY} 0%, ${CYAN} 100%)`, color: "#ffffff", py: 1.5, px: 2 }}>
                <Box className="flex items-center gap-2">
                    <LuPencil className="w-4 h-4" />
                    <Typography className="text-sm font-bold">Edit Collection</Typography>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 2, pt: "16px !important" }}>
                <Paper elevation={0} className="rounded-lg p-2.5 mb-2.5" sx={{ border: `1px solid ${VIOLET}` }}>
                    <Box className="flex items-center gap-2 min-w-0">
                        <Avatar src={payment?.student.studentPhoto ?? undefined} sx={{ width: 32, height: 32, backgroundColor: VIOLET, fontSize: 13 }}>
                            {payment?.student.studentName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box className="min-w-0">
                            <Typography className="text-sm font-bold text-gray-900 truncate">{payment?.student.studentName}</Typography>
                            <Typography className="text-[11px] text-gray-500 truncate">
                                {payment?.student.studentRegistrationNumber || "No reg. no"} · {payment?.student.phoneNumber}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                <Box className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <TextField
                        size="small"
                        label="Amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        error={amount.trim() !== "" && !amountValid}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment>, sx: { borderRadius: "8px" } } }}
                    />
                    <TextField
                        size="small"
                        label="Fine amount"
                        type="number"
                        value={fine}
                        onChange={(e) => setFine(e.target.value)}
                        error={!fineValid}
                        helperText="Set 0 to waive the fine"
                        slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment>, sx: { borderRadius: "8px" } } }}
                    />
                    <TextField
                        select
                        size="small"
                        label="Payment mode"
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        helperText={paymentMode === "" ? " " : isVerified ? "Auto-verified" : "Stays unverified until cleared"}
                        slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                    >
                        {PAYMENT_MODES.map((mode) => (
                            <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        size="small"
                        label="Status"
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                        helperText="Only completed collections credit the bank"
                        slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                    >
                        {(["completed", "pending", "failed"] as PaymentStatus[]).map((value) => (
                            <MenuItem key={value} value={value}>{STATUS_META[value].label}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        size="small"
                        type="date"
                        label="Payment date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true }, input: { sx: { borderRadius: "8px" } } }}
                    />
                    <TextField
                        size="small"
                        label="Reference / txn no."
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                    />
                </Box>

                <TextField
                    size="small"
                    fullWidth
                    multiline
                    minRows={2}
                    label="Comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="mt-2"
                    slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                />
            </DialogContent>

            <DialogActions sx={{ px: 2, pb: 2, pt: 0 }}>
                <Button onClick={onClose} size="small" sx={{ textTransform: "none", color: "#6b7280" }}>Cancel</Button>
                <Button
                    onClick={handleSave}
                    size="small"
                    variant="contained"
                    disabled={!amountValid || !fineValid || saving}
                    startIcon={saving ? <CircularProgress size={14} sx={{ color: "#ffffff" }} /> : <LuCircleCheckBig className="w-3.5 h-3.5" />}
                    sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: SKY, "&:hover": { backgroundColor: SKY_DARK } }}
                >
                    Save changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ------------------------------------------------------------------ */
/* Delete confirmation                                                 */
/* ------------------------------------------------------------------ */

function DeleteCollectionDialog({
    payment,
    onClose,
    onConfirm,
}: {
    payment: StudentPayment | null;
    onClose: () => void;
    onConfirm: () => Promise<boolean>;
}) {
    const [busy, setBusy] = useState(false);

    const handleConfirm = async () => {
        setBusy(true);
        const ok = await onConfirm();
        setBusy(false);
        if (ok) onClose();
    };

    return (
        <Dialog open={Boolean(payment)} onClose={onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: "10px", border: `1px solid ${ROSE}` } } }}>
            <DialogTitle sx={{ background: `linear-gradient(90deg, ${ROSE} 0%, ${ORANGE} 100%)`, color: "#ffffff", py: 1.5, px: 2 }}>
                <Box className="flex items-center gap-2">
                    <LuTriangleAlert className="w-4 h-4" />
                    <Typography className="text-sm font-bold">Remove Collection</Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 2, pt: "16px !important" }}>
                <Typography className="text-sm text-gray-700">
                    This reverses the bank credit and re-opens the linked installments. This cannot be undone.
                </Typography>
                <Paper elevation={0} className="rounded-lg p-2.5 mt-2.5" sx={{ border: `1px solid ${ROSE}` }}>
                    <DetailRow label="Student" value={payment?.student.studentName ?? "—"} color="#111827" />
                    <DetailRow label="Amount" value={money(payment?.amount)} color={ROSE_DARK} />
                    <DetailRow label="Fine" value={money(payment?.anyFineAmount ?? 0)} color={ORANGE} />
                    <DetailRow label="Date" value={formatDate(payment?.paymentDate)} color="#111827" />
                </Paper>
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
                    Remove
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ------------------------------------------------------------------ */
/* Main content                                                        */
/* ------------------------------------------------------------------ */

function LMSCollectionsContent() {
    const {
        studentPayments,
        studentPaymentsMeta,
        studentPaymentsTotalAmount,
        studentPaymentsTotalFineAmount,
        loadingStudentPayments,
        getStudentPayments,
        createStudentPayment,
        updateStudentPayment,
        deleteStudentPayment,
    } = useERP();

    const [status, setStatus] = useState<"all" | PaymentStatus>("all");
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [paymentMode, setPaymentMode] = useState("");
    const [verification, setVerification] = useState<"" | "verified" | "unverified">("");

    const [feedback, setFeedback] = useState<Feedback>({ open: false, severity: "success", message: "" });
    const [createOpen, setCreateOpen] = useState(false);
    const [editing, setEditing] = useState<StudentPayment | null>(null);
    const [deleting, setDeleting] = useState<StudentPayment | null>(null);

    const notify = useCallback((severity: "success" | "error", message: string) => {
        setFeedback({ open: true, severity, message });
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => { setDebouncedSearch(search.trim()); setPage(1); }, 350);
        return () => clearTimeout(timer);
    }, [search]);

    const query = useMemo<StudentPaymentsQuery>(() => ({
        page,
        limit: PAGE_SIZE,
        paymentStatus: status === "all" ? undefined : status,
        search: debouncedSearch || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        paymentMode: paymentMode || undefined,
        isVerified: verification === "" ? undefined : verification === "verified",
    }), [page, status, debouncedSearch, startDate, endDate, paymentMode, verification]);

    const reload = useCallback(() => { getStudentPayments(query); }, [getStudentPayments, query]);

    useEffect(() => { reload(); }, [reload]);

    const unverifiedCount = studentPayments.filter((item) => !item.isVerified).length;

    const handleCreate = async (data: CreateStudentPaymentInput) => {
        const res = await createStudentPayment(data);
        notify(res.success ? "success" : "error", res.message ?? "Failed to record collection");
        if (res.success) reload();
        return res.success;
    };

    const handleUpdate = async (data: UpdateStudentPaymentInput) => {
        if (!editing) return false;
        const res = await updateStudentPayment(editing.paymentId, data);
        notify(res.success ? "success" : "error", res.message ?? "Failed to update collection");
        if (res.success) reload();
        return res.success;
    };

    const handleDelete = async () => {
        if (!deleting) return false;
        const res = await deleteStudentPayment(deleting.paymentId);
        notify(res.success ? "success" : "error", res.message ?? "Failed to remove collection");
        if (res.success) reload();
        return res.success;
    };

    const clearFilters = () => {
        setSearch("");
        setStartDate("");
        setEndDate("");
        setPaymentMode("");
        setVerification("");
        setPage(1);
    };

    const hasFilters = Boolean(search || startDate || endDate || paymentMode || verification);

    return (
        <Box className="flex flex-col gap-2 sm:gap-3 h-full">

            {/* Stats */}
            <Box className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <StatCard label="Collections" value={studentPaymentsMeta?.total ?? studentPayments.length} color={VIOLET} icon={<LuReceipt className="w-4 h-4" />} />
                <StatCard label="Total collected" value={money(studentPaymentsTotalAmount)} color={EMERALD} icon={<LuBanknote className="w-4 h-4" />} />
                <StatCard label="Fines collected" value={money(studentPaymentsTotalFineAmount)} color={ORANGE} icon={<LuTriangleAlert className="w-4 h-4" />} />
                <StatCard label="Unverified (page)" value={unverifiedCount} color={AMBER} icon={<LuShieldOff className="w-4 h-4" />} />
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
                        placeholder="Search student, phone, reg. no or reference…"
                        className="flex-1 min-w-0"
                        slotProps={{
                            input: {
                                startAdornment: <InputAdornment position="start"><LuSearch className="w-4 h-4 text-gray-400" /></InputAdornment>,
                                sx: { borderRadius: "8px" },
                            },
                        }}
                    />

                    <Box className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                            value={paymentMode}
                            onChange={(e) => { setPaymentMode(e.target.value); setPage(1); }}
                            slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                        >
                            <MenuItem value="">All modes</MenuItem>
                            {PAYMENT_MODES.map((mode) => (
                                <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            size="small"
                            label="Verification"
                            value={verification}
                            onChange={(e) => { setVerification(e.target.value as "" | "verified" | "unverified"); setPage(1); }}
                            slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="verified">Verified</MenuItem>
                            <MenuItem value="unverified">Unverified</MenuItem>
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
                                <LuRefreshCw className={`w-4 h-4 ${loadingStudentPayments ? "animate-spin" : ""}`} />
                            </IconButton>
                        </Tooltip>
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<LuCirclePlus className="w-3.5 h-3.5" />}
                            onClick={() => setCreateOpen(true)}
                            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, whiteSpace: "nowrap", backgroundColor: PRIMARY, "&:hover": { backgroundColor: PRIMARY_DARK } }}
                        >
                            New Collection
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Table */}
            <Box className="flex-1 min-h-0">
                {loadingStudentPayments && studentPayments.length === 0 ? (
                    <Box className="py-20 flex flex-col items-center gap-2">
                        <CircularProgress size={28} sx={{ color: VIOLET }} />
                        <Typography className="text-sm text-gray-400">Loading collections…</Typography>
                    </Box>
                ) : studentPayments.length === 0 ? (
                    <Paper elevation={0} className="rounded-lg py-16 flex flex-col items-center gap-2" sx={{ border: `1px solid ${VIOLET}` }}>
                        <Box className="w-12 h-12 rounded-lg flex items-center justify-center" sx={{ backgroundColor: VIOLET, color: "#ffffff" }}>
                            <LuWallet className="w-6 h-6" />
                        </Box>
                        <Typography className="text-sm text-gray-500">
                            {hasFilters || status !== "all" ? "No collections match the current filters." : "No collections recorded yet."}
                        </Typography>
                    </Paper>
                ) : (
                    <Paper elevation={0} className="rounded-lg overflow-hidden" sx={{ border: `1px solid ${VIOLET}` }}>
                        <TableContainer>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        {["Student", "Amount", "Mode", "Date", "Bank", "Status", ""].map((heading, index) => (
                                            <TableCell
                                                key={heading || index}
                                                align={index === 6 ? "right" : "left"}
                                                className={index === 2 || index === 4 ? "hidden md:table-cell" : index === 3 ? "hidden sm:table-cell" : ""}
                                                sx={{ backgroundColor: "#ede9fe", color: VIOLET_DARK, fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", py: 1 }}
                                            >
                                                {heading}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {studentPayments.map((item) => (
                                        <TableRow key={item.paymentId} hover sx={{ "&:hover": { backgroundColor: "#f5f3ff" } }}>
                                            <TableCell sx={{ py: 1 }}>
                                                <Box className="flex items-center gap-2 min-w-0">
                                                    <Avatar src={item.student.studentPhoto ?? undefined} sx={{ width: 28, height: 28, backgroundColor: VIOLET, fontSize: 12 }}>
                                                        {item.student.studentName.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Box className="min-w-0">
                                                        <Typography className="text-xs font-bold text-gray-900 truncate">{item.student.studentName}</Typography>
                                                        <Typography className="text-[10px] text-gray-500 truncate">
                                                            {item.student.studentRegistrationNumber || item.student.phoneNumber}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ py: 1 }}>
                                                <Typography className="text-xs font-black" sx={{ color: EMERALD_DARK }}>{money(item.amount)}</Typography>
                                                {Boolean(item.anyFineAmount) && (
                                                    <Typography className="text-[10px] font-bold" sx={{ color: ORANGE }}>+ {money(item.anyFineAmount)} fine</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell" sx={{ py: 1 }}>
                                                <Typography className="text-xs font-semibold text-gray-700">{item.paymentMode || "—"}</Typography>
                                                {item.paymentReference && (
                                                    <Typography className="text-[10px] text-gray-500 truncate max-w-35">{item.paymentReference}</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell" sx={{ py: 1 }}>
                                                <Typography className="text-xs text-gray-700">{formatDate(item.paymentDate)}</Typography>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell" sx={{ py: 1 }}>
                                                <Box className="flex items-center gap-1.5 min-w-0">
                                                    <LuBuilding2 className="w-3.5 h-3.5 shrink-0" style={{ color: SKY }} />
                                                    <Typography className="text-xs text-gray-700 truncate max-w-35">
                                                        {item.bankAccountDetails?.commonCallingName || item.bankAccountDetails?.bankHolderName || "—"}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ py: 1 }}>
                                                <Box className="flex flex-wrap items-center gap-1">
                                                    <StatusChip status={item.paymentStatus} />
                                                    <VerifiedChip isVerified={item.isVerified} />
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right" sx={{ py: 1 }}>
                                                <Box className="flex items-center justify-end gap-0.5">
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" onClick={() => setEditing(item)} sx={{ color: SKY }}>
                                                            <LuPencil className="w-4 h-4" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Remove">
                                                        <IconButton size="small" onClick={() => setDeleting(item)} sx={{ color: ROSE }}>
                                                            <LuTrash2 className="w-4 h-4" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {(studentPaymentsMeta?.totalPages ?? 1) > 1 && (
                            <>
                                <Divider />
                                <Box className="flex items-center justify-between gap-2 p-2">
                                    <Typography className="text-[11px] text-gray-500 hidden sm:block">
                                        Page {studentPaymentsMeta?.page} of {studentPaymentsMeta?.totalPages} · {studentPaymentsMeta?.total} collections
                                    </Typography>
                                    <Pagination
                                        size="small"
                                        count={studentPaymentsMeta?.totalPages ?? 1}
                                        page={page}
                                        onChange={(_, value) => setPage(value)}
                                        sx={{ "& .Mui-selected": { backgroundColor: `${VIOLET} !important`, color: "#ffffff" } }}
                                    />
                                </Box>
                            </>
                        )}
                    </Paper>
                )}
            </Box>

            <CreateCollectionDialog open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} />
            <EditCollectionDialog payment={editing} onClose={() => setEditing(null)} onSubmit={handleUpdate} />
            <DeleteCollectionDialog payment={deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} />

            <Snackbar
                open={feedback.open}
                autoHideDuration={4000}
                onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    severity={feedback.severity}
                    variant="filled"
                    onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
                    sx={{ borderRadius: "8px" }}
                >
                    {feedback.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default function LMSCollectionsPage() {
    return (
        <AccountantDashboardLayout>
            <LMSCollectionsContent />
        </AccountantDashboardLayout>
    );
}