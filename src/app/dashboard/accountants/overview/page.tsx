"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AccountantDashboardLayout from "@/layouts/AccountantDashboardLayout";
import { useERP, type ERPStats } from "@/contexts/ERPContext";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    LinearProgress,
    MenuItem,
    Paper,
    Snackbar,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    LuArrowRight,
    LuBanknote,
    LuBuilding2,
    LuCalendarClock,
    LuCircleCheck,
    LuCircleX,
    LuClock,
    LuHourglass,
    LuReceipt,
    LuRefreshCw,
    LuTrendingDown,
    LuTrendingUp,
    LuTriangleAlert,
    LuUserMinus,
    LuUsers,
    LuWallet,
} from "react-icons/lu";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const PRIMARY = "#009DFF";
const VIOLET = "#7c3aed";
const SKY = "#0284c7";
const CYAN = "#06b6d4";
const AMBER = "#f59e0b";
const ORANGE = "#f97316";
const EMERALD = "#10b981";
const EMERALD_DARK = "#059669";
const ROSE = "#f43f5e";
const SLATE = "#64748b";

type RangeKey = "today" | "this-month" | "last-month" | "this-year" | "all" | "custom";

const RANGE_OPTIONS: { value: RangeKey; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "this-month", label: "This month" },
    { value: "last-month", label: "Last month" },
    { value: "this-year", label: "This year" },
    { value: "all", label: "All time" },
    { value: "custom", label: "Custom" },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function money(value: number | null | undefined) {
    if (value === null || value === undefined) return "—";
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function toInputDate(date: Date) {
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function resolveRange(range: RangeKey): { startDate?: string; endDate?: string } {
    const now = new Date();
    switch (range) {
        case "today": {
            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            return { startDate: toInputDate(start), endDate: toInputDate(now) };
        }
        case "this-month": {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            return { startDate: toInputDate(start), endDate: toInputDate(now) };
        }
        case "last-month": {
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const end = new Date(now.getFullYear(), now.getMonth(), 0);
            return { startDate: toInputDate(start), endDate: toInputDate(end) };
        }
        case "this-year": {
            const start = new Date(now.getFullYear(), 0, 1);
            return { startDate: toInputDate(start), endDate: toInputDate(now) };
        }
        default:
            return {};
    }
}

function percent(part: number, whole: number) {
    if (!whole) return 0;
    return Math.min(100, Math.max(0, Math.round((part / whole) * 100)));
}

/* ------------------------------------------------------------------ */
/* Presentational pieces                                               */
/* ------------------------------------------------------------------ */

function KpiCard({
    label,
    value,
    caption,
    color,
    icon,
    onClick,
}: {
    label: string;
    value: React.ReactNode;
    caption?: string;
    color: string;
    icon: React.ReactNode;
    onClick?: () => void;
}) {
    return (
        <Paper
            elevation={0}
            onClick={onClick}
            className="rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2.5"
            sx={{
                border: `1px solid ${color}`,
                backgroundColor: color,
                color: "#ffffff",
                cursor: onClick ? "pointer" : "default",
                transition: "box-shadow .2s, transform .2s",
                "&:hover": { boxShadow: 6, transform: onClick ? "translateY(-2px)" : "none" },
            }}
        >
            <Box className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: "#ffffff", color }}>
                {icon}
            </Box>
            <Box className="min-w-0">
                <Typography className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">{label}</Typography>
                <Typography className="text-lg sm:text-xl font-black leading-tight truncate">{value}</Typography>
                {caption ? <Typography className="text-[10px] sm:text-[11px] font-medium truncate">{caption}</Typography> : null}
            </Box>
        </Paper>
    );
}

function SectionCard({
    title,
    color,
    icon,
    action,
    children,
}: {
    title: string;
    color: string;
    icon: React.ReactNode;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <Paper
            elevation={0}
            className="rounded-lg overflow-hidden flex flex-col h-full"
            sx={{ border: `1px solid ${color}`, transition: "box-shadow .2s", "&:hover": { boxShadow: 4 } }}
        >
            <Box className="px-3 py-2 flex items-center justify-between gap-2" sx={{ backgroundColor: color, color: "#ffffff" }}>
                <Box className="flex items-center gap-2 min-w-0">
                    <Box className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: "#ffffff", color }}>
                        {icon}
                    </Box>
                    <Typography className="text-sm font-bold truncate">{title}</Typography>
                </Box>
                {action}
            </Box>
            <Box className="p-3 flex-1">{children}</Box>
        </Paper>
    );
}

function StatRow({ label, value, color }: { label: string; value: React.ReactNode; color?: string }) {
    return (
        <Box className="flex items-center justify-between gap-2 py-1.5">
            <Typography className="text-xs font-medium" sx={{ color: SLATE }}>
                {label}
            </Typography>
            <Typography className="text-sm font-bold" sx={{ color: color || "#0f172a" }}>
                {value}
            </Typography>
        </Box>
    );
}

function ExpenseStatusTile({
    label,
    count,
    amount,
    color,
    icon,
}: {
    label: string;
    count: number;
    amount: number;
    color: string;
    icon: React.ReactNode;
}) {
    return (
        <Paper elevation={0} className="rounded-lg px-2.5 py-2" sx={{ border: `1px solid ${color}` }}>
            <Box className="flex items-center gap-1.5">
                <Box className="w-6 h-6 rounded flex items-center justify-center shrink-0" sx={{ backgroundColor: color, color: "#ffffff" }}>
                    {icon}
                </Box>
                <Typography className="text-[11px] font-bold uppercase tracking-wide truncate" sx={{ color }}>
                    {label}
                </Typography>
            </Box>
            <Typography className="text-base font-black mt-1 leading-tight" sx={{ color: "#0f172a" }}>
                {money(amount)}
            </Typography>
            <Typography className="text-[11px] font-medium" sx={{ color: SLATE }}>
                {count} {count === 1 ? "entry" : "entries"}
            </Typography>
        </Paper>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AccountantOverviewPage() {
    const router = useRouter();
    const { getERPStats, loadingStats } = useERP();

    const [stats, setStats] = useState<ERPStats | null>(null);
    const [range, setRange] = useState<RangeKey>("this-month");
    const [customStart, setCustomStart] = useState("");
    const [customEnd, setCustomEnd] = useState("");
    const [error, setError] = useState<string | null>(null);

    const query = useMemo(() => {
        if (range !== "custom") return resolveRange(range);
        return {
            ...(customStart && { startDate: customStart }),
            ...(customEnd && { endDate: customEnd }),
        };
    }, [range, customStart, customEnd]);

    const load = useCallback(async () => {
        const res = await getERPStats(query);
        if (res.success && res.data) setStats(res.data);
        else setError(res.message || "Failed to load dashboard stats");
    }, [getERPStats, query]);

    useEffect(() => {
        void load();
    }, [load]);

    const collectionRate = stats ? percent(stats.purchases.collectedAmount, stats.purchases.totalAmount) : 0;
    const isProfit = (stats?.summary.netProfitLoss || 0) >= 0;

    return (
        <AccountantDashboardLayout title="Overview">
            <Box className="p-3 sm:p-5 flex flex-col gap-3 sm:gap-4">
                <Paper
                    elevation={0}
                    className="rounded-lg px-3 py-3 sm:px-4 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    sx={{ background: `linear-gradient(90deg, ${PRIMARY} 0%, ${VIOLET} 100%)`, color: "#ffffff", border: `1px solid ${VIOLET}` }}
                >
                    <Box className="min-w-0">
                        <Typography className="text-lg sm:text-xl font-black leading-tight">Accounts Overview</Typography>
                        <Typography className="text-[11px] sm:text-xs font-medium">
                            Collections, expenses and bank balances at a glance
                        </Typography>
                    </Box>

                    <Box className="flex flex-wrap items-center gap-2">
                        <TextField
                            select
                            size="small"
                            value={range}
                            onChange={(e) => setRange(e.target.value as RangeKey)}
                            sx={{
                                minWidth: 140,
                                backgroundColor: "#ffffff",
                                borderRadius: 1,
                                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                            }}
                        >
                            {RANGE_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        {range === "custom" ? (
                            <>
                                <TextField
                                    size="small"
                                    type="date"
                                    label="From"
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    value={customStart}
                                    onChange={(e) => setCustomStart(e.target.value)}
                                    sx={{ backgroundColor: "#ffffff", borderRadius: 1, "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
                                />
                                <TextField
                                    size="small"
                                    type="date"
                                    label="To"
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    value={customEnd}
                                    onChange={(e) => setCustomEnd(e.target.value)}
                                    sx={{ backgroundColor: "#ffffff", borderRadius: 1, "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
                                />
                            </>
                        ) : null}

                        <Tooltip title="Refresh">
                            <span>
                                <Button
                                    size="small"
                                    variant="contained"
                                    disabled={loadingStats}
                                    onClick={() => void load()}
                                    startIcon={loadingStats ? <CircularProgress size={14} sx={{ color: PRIMARY }} /> : <LuRefreshCw className="w-4 h-4" />}
                                    sx={{ backgroundColor: "#ffffff", color: PRIMARY, "&:hover": { backgroundColor: "#e0f2fe" } }}
                                >
                                    Refresh
                                </Button>
                            </span>
                        </Tooltip>
                    </Box>
                </Paper>

                {loadingStats && !stats ? (
                    <Box className="flex items-center justify-center py-16">
                        <CircularProgress sx={{ color: PRIMARY }} />
                    </Box>
                ) : null}

                {stats ? (
                    <>
                        <Box className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                            <KpiCard
                                label="Total Income"
                                value={money(stats.summary.totalIncome)}
                                caption={`${stats.payments.completedCount} settled payments`}
                                color={EMERALD}
                                icon={<LuTrendingUp className="w-4 h-4" />}
                                onClick={() => router.push("/dashboard/accountants/lms-collections")}
                            />
                            <KpiCard
                                label="Total Expense"
                                value={money(stats.summary.totalExpense)}
                                caption={`${stats.expenses.completed.count} completed`}
                                color={ROSE}
                                icon={<LuTrendingDown className="w-4 h-4" />}
                                onClick={() => router.push("/dashboard/accountants/expenses-management")}
                            />
                            <KpiCard
                                label={isProfit ? "Net Profit" : "Net Loss"}
                                value={money(Math.abs(stats.summary.netProfitLoss))}
                                caption="Income minus expense"
                                color={isProfit ? EMERALD_DARK : ORANGE}
                                icon={<LuBanknote className="w-4 h-4" />}
                            />
                            <KpiCard
                                label="Bank Balance"
                                value={money(stats.bankAccounts.totalBalance)}
                                caption={`${stats.bankAccounts.count} active accounts`}
                                color={SKY}
                                icon={<LuWallet className="w-4 h-4" />}
                                onClick={() => router.push("/dashboard/accountants/accounts-management")}
                            />
                        </Box>

                        <Box className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                            <KpiCard
                                label="Students"
                                value={stats.students.total}
                                caption={`${stats.students.active} active`}
                                color={VIOLET}
                                icon={<LuUsers className="w-4 h-4" />}
                                onClick={() => router.push("/dashboard/accountants/student-profiles")}
                            />
                            <KpiCard
                                label="Dropped"
                                value={stats.students.dropped}
                                caption="Students marked dropped"
                                color={SLATE}
                                icon={<LuUserMinus className="w-4 h-4" />}
                            />
                            <KpiCard
                                label="Overdue"
                                value={money(stats.schedules.overdueAmount)}
                                caption={`${stats.schedules.overdueCount} installments`}
                                color={ROSE}
                                icon={<LuTriangleAlert className="w-4 h-4" />}
                                onClick={() => router.push("/dashboard/accountants/due-upcoming-payments")}
                            />
                            <KpiCard
                                label="Upcoming"
                                value={money(stats.schedules.upcomingAmount)}
                                caption={`${stats.schedules.upcomingCount} due this month`}
                                color={AMBER}
                                icon={<LuCalendarClock className="w-4 h-4" />}
                                onClick={() => router.push("/dashboard/accountants/due-upcoming-payments")}
                            />
                        </Box>

                        <Box className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3">
                            <SectionCard title="Collection Progress" color={PRIMARY} icon={<LuTrendingUp className="w-4 h-4" />}>
                                <Box className="flex items-baseline justify-between gap-2">
                                    <Typography className="text-2xl font-black" sx={{ color: PRIMARY }}>
                                        {collectionRate}%
                                    </Typography>
                                    <Typography className="text-[11px] font-semibold" sx={{ color: SLATE }}>
                                        {stats.purchases.fullyPaid}/{stats.purchases.total} purchases cleared
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={collectionRate}
                                    className="mt-2"
                                    sx={{
                                        height: 8,
                                        borderRadius: 1,
                                        backgroundColor: "#e0f2fe",
                                        "& .MuiLinearProgress-bar": { backgroundColor: PRIMARY },
                                    }}
                                />
                                <Box className="mt-2 divide-y" sx={{ borderColor: "#e2e8f0" }}>
                                    <StatRow label="Total billed" value={money(stats.purchases.totalAmount)} />
                                    <StatRow label="Collected" value={money(stats.purchases.collectedAmount)} color={EMERALD_DARK} />
                                    <StatRow label="Outstanding" value={money(stats.purchases.outstandingAmount)} color={ROSE} />
                                </Box>
                            </SectionCard>

                            <SectionCard
                                title="Payments"
                                color={CYAN}
                                icon={<LuReceipt className="w-4 h-4" />}
                                action={
                                    <Button
                                        size="small"
                                        endIcon={<LuArrowRight className="w-3.5 h-3.5" />}
                                        onClick={() => router.push("/dashboard/accountants/lms-collections")}
                                        sx={{ color: "#ffffff", fontSize: 11 }}
                                    >
                                        View
                                    </Button>
                                }
                            >
                                <Box className="divide-y" sx={{ borderColor: "#e2e8f0" }}>
                                    <StatRow label="Completed payments" value={stats.payments.completedCount} color={EMERALD_DARK} />
                                    <StatRow label="Completed amount" value={money(stats.payments.completedAmount)} />
                                    <StatRow label="Fines collected" value={money(stats.payments.fineAmount)} color={AMBER} />
                                    <StatRow label="Pending payments" value={stats.payments.pendingCount} color={ORANGE} />
                                    <StatRow label="Pending amount" value={money(stats.payments.pendingAmount)} color={ORANGE} />
                                </Box>
                            </SectionCard>

                            <SectionCard
                                title="Expenses"
                                color={ROSE}
                                icon={<LuReceipt className="w-4 h-4" />}
                                action={
                                    <Button
                                        size="small"
                                        endIcon={<LuArrowRight className="w-3.5 h-3.5" />}
                                        onClick={() => router.push("/dashboard/accountants/expenses-management")}
                                        sx={{ color: "#ffffff", fontSize: 11 }}
                                    >
                                        View
                                    </Button>
                                }
                            >
                                <Box className="grid grid-cols-2 gap-2">
                                    <ExpenseStatusTile
                                        label="Pending"
                                        count={stats.expenses.pending.count}
                                        amount={stats.expenses.pending.amount}
                                        color={AMBER}
                                        icon={<LuHourglass className="w-3.5 h-3.5" />}
                                    />
                                    <ExpenseStatusTile
                                        label="Approved"
                                        count={stats.expenses.approved.count}
                                        amount={stats.expenses.approved.amount}
                                        color={SKY}
                                        icon={<LuClock className="w-3.5 h-3.5" />}
                                    />
                                    <ExpenseStatusTile
                                        label="Completed"
                                        count={stats.expenses.completed.count}
                                        amount={stats.expenses.completed.amount}
                                        color={EMERALD}
                                        icon={<LuCircleCheck className="w-3.5 h-3.5" />}
                                    />
                                    <ExpenseStatusTile
                                        label="Rejected"
                                        count={stats.expenses.rejected.count}
                                        amount={stats.expenses.rejected.amount}
                                        color={ROSE}
                                        icon={<LuCircleX className="w-3.5 h-3.5" />}
                                    />
                                </Box>
                                <Box className="mt-2 pt-2 border-t" sx={{ borderColor: "#e2e8f0" }}>
                                    <StatRow label={`All expenses (${stats.expenses.totalCount})`} value={money(stats.expenses.totalAmount)} />
                                </Box>
                            </SectionCard>
                        </Box>

                        <SectionCard
                            title="Bank Accounts"
                            color={SKY}
                            icon={<LuBuilding2 className="w-4 h-4" />}
                            action={
                                <Button
                                    size="small"
                                    endIcon={<LuArrowRight className="w-3.5 h-3.5" />}
                                    onClick={() => router.push("/dashboard/accountants/accounts-management")}
                                    sx={{ color: "#ffffff", fontSize: 11 }}
                                >
                                    Manage
                                </Button>
                            }
                        >
                            {stats.bankAccounts.accounts.length === 0 ? (
                                <Typography className="text-xs font-medium py-4 text-center" sx={{ color: SLATE }}>
                                    No active bank accounts yet.
                                </Typography>
                            ) : (
                                <Box className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                                    {stats.bankAccounts.accounts.map((account) => (
                                        <Paper
                                            key={account.bankAccountDetailsId}
                                            elevation={0}
                                            className="rounded-lg px-3 py-2.5 flex items-center justify-between gap-2 cursor-pointer"
                                            onClick={() => router.push(`/dashboard/accountants/accounts-management/${account.bankAccountDetailsId}`)}
                                            sx={{
                                                border: `1px solid ${CYAN}`,
                                                transition: "box-shadow .2s, transform .2s",
                                                "&:hover": { boxShadow: 4, transform: "translateY(-2px)" },
                                            }}
                                        >
                                            <Box className="flex items-center gap-2 min-w-0">
                                                <Box
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                                    sx={{ backgroundColor: CYAN, color: "#ffffff" }}
                                                >
                                                    <LuBuilding2 className="w-4 h-4" />
                                                </Box>
                                                <Box className="min-w-0">
                                                    <Typography className="text-sm font-bold truncate" sx={{ color: "#0f172a" }}>
                                                        {account.commonCallingName || account.bankHolderName || "Unnamed account"}
                                                    </Typography>
                                                    <Typography className="text-[11px] font-medium truncate" sx={{ color: SLATE }}>
                                                        {account.accountNumber ? `••••${account.accountNumber.slice(-4)}` : "No account number"}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Chip
                                                size="small"
                                                label={money(account.currentBalance)}
                                                sx={{ backgroundColor: EMERALD, color: "#ffffff", fontWeight: 700 }}
                                            />
                                        </Paper>
                                    ))}
                                </Box>
                            )}
                        </SectionCard>
                    </>
                ) : null}
            </Box>

            <Snackbar
                open={Boolean(error)}
                autoHideDuration={4000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert severity="error" variant="filled" onClose={() => setError(null)}>
                    {error}
                </Alert>
            </Snackbar>
        </AccountantDashboardLayout>
    );
}