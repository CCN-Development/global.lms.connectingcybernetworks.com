"use client";

import React, { useEffect, useMemo, useState } from "react";
import AccountantDashboardLayout from "@/layouts/AccountantDashboardLayout";
import { useERP, type StudentPaymentSchedule } from "@/contexts/ERPContext";
import {
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    InputAdornment,
    Paper,
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
    LuCalendarClock,
    LuCalendarDays,
    LuCircleCheckBig,
    LuHourglass,
    LuIdCard,
    LuInfo,
    LuPhone,
    LuRefreshCw,
    LuSearch,
    LuTriangleAlert,
    LuUsers,
    LuWallet,
    LuX,
} from "react-icons/lu";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const PRIMARY = "#009DFF";
const VIOLET = "#7c3aed";
const SKY = "#0284c7";
const CYAN = "#06b6d4";
const AMBER = "#f59e0b";
const EMERALD = "#10b981";
const EMERALD_DARK = "#059669";
const ORANGE = "#f97316";
const ROSE = "#f43f5e";

// Indicative late fee quoted to students; not persisted on the schedule.
const FINE_PER_DAY = 250;

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

function daysBetween(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 0;
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    return Math.round((startOfDay(date) - startOfDay(new Date())) / 86400000);
}

function initials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");
}

function outstanding(item: StudentPaymentSchedule) {
    const paid = item.isPartialPayment ? item.partialPaymentAmount ?? 0 : 0;
    return Math.max(item.amount + (item.fineAmount ?? 0) - paid, 0);
}

function overdueDays(dueDate: string) {
    return Math.max(-daysBetween(dueDate), 0);
}

function referenceFine(dueDate: string) {
    return overdueDays(dueDate) * FINE_PER_DAY;
}

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

function DueChip({ dueDate, overdue }: { dueDate: string; overdue: boolean }) {
    const diff = daysBetween(dueDate);
    if (overdue) {
        const late = Math.abs(diff);
        return (
            <Chip
                size="small"
                label={late === 0 ? "Due today" : `${late}d overdue`}
                sx={{ backgroundColor: late === 0 ? AMBER : ROSE, color: "#ffffff", fontWeight: 700, height: 22, fontSize: 11 }}
            />
        );
    }
    return (
        <Chip
            size="small"
            label={diff <= 0 ? "Due today" : `In ${diff}d`}
            sx={{ backgroundColor: diff <= 3 ? ORANGE : EMERALD, color: "#ffffff", fontWeight: 700, height: 22, fontSize: 11 }}
        />
    );
}

function StatusChip({ item }: { item: StudentPaymentSchedule }) {
    if (item.isPaid) {
        return <Chip size="small" label="Paid" sx={{ backgroundColor: EMERALD, color: "#ffffff", fontWeight: 700, height: 22, fontSize: 11 }} />;
    }
    if (item.isPartialPayment) {
        return <Chip size="small" label={`Partial ${money(item.partialPaymentAmount)}`} sx={{ backgroundColor: AMBER, color: "#ffffff", fontWeight: 700, height: 22, fontSize: 11 }} />;
    }
    return <Chip size="small" label="Unpaid" sx={{ backgroundColor: ROSE, color: "#ffffff", fontWeight: 700, height: 22, fontSize: 11 }} />;
}

/* ------------------------------------------------------------------ */
/* Table                                                               */
/* ------------------------------------------------------------------ */

function PaymentsTable({ rows, accent, overdue }: { rows: StudentPaymentSchedule[]; accent: string; overdue: boolean }) {
    const headCell = { color: "#ffffff", fontWeight: 800, fontSize: 11, textTransform: "uppercase" as const, letterSpacing: .5 };

    return (
        <Paper elevation={0} className="rounded-lg " sx={{ border: `1px solid ${accent}` }}>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ background: `linear-gradient(90deg, ${accent} 0%, ${VIOLET} 100%)` }}>
                            <TableCell sx={headCell}>Student</TableCell>
                            <TableCell className="hidden md:table-cell" sx={headCell}>Contact</TableCell>
                            <TableCell sx={headCell}>Instalment</TableCell>
                            <TableCell className="hidden lg:table-cell" sx={headCell}>Fine</TableCell>
                            {overdue && <TableCell sx={headCell}>Late fine (ref)</TableCell>}
                            <TableCell sx={headCell}>Due date</TableCell>
                            <TableCell className="hidden sm:table-cell" sx={headCell}>Purchase</TableCell>
                            <TableCell align="right" sx={headCell}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((item) => {
                            const student = item.StudentPurchases.Student;
                            const purchase = item.StudentPurchases;
                            return (
                                <TableRow key={item.scheduleId} hover sx={{ "&:hover": { backgroundColor: "#f5f3ff" } }}>
                                    <TableCell sx={{ maxWidth: 240 }}>
                                        <Box className="flex items-center gap-2 min-w-0">
                                            <Avatar
                                                src={student.studentPhoto ?? undefined}
                                                sx={{ width: 30, height: 30, backgroundColor: accent, color: "#ffffff", fontSize: 12, fontWeight: 800 }}
                                            >
                                                {initials(student.studentName)}
                                            </Avatar>
                                            <Box className="min-w-0">
                                                <Typography className="text-xs font-bold text-gray-900 truncate">{student.studentName}</Typography>
                                                <Box className="flex items-center gap-1 min-w-0">
                                                    <LuIdCard className="w-3 h-3 shrink-0" style={{ color: VIOLET }} />
                                                    <Typography className="text-[10px] font-semibold text-gray-500 truncate">
                                                        {student.studentRegistrationNumber || "No reg. no"}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </TableCell>

                                    <TableCell className="hidden md:table-cell">
                                        <Box className="flex items-center gap-1.5">
                                            <LuPhone className="w-3.5 h-3.5 shrink-0" style={{ color: SKY }} />
                                            <Typography className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                                                +{student.callingCode} {student.phoneNumber}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    <TableCell>
                                        <Typography className="text-sm font-black whitespace-nowrap" sx={{ color: ORANGE }}>{money(item.amount)}</Typography>
                                        {(item.isPartialPayment || (item.fineAmount ?? 0) > 0) && (
                                            <Typography className="text-[10px] font-bold whitespace-nowrap" sx={{ color: ROSE }}>
                                                Balance {money(outstanding(item))}
                                            </Typography>
                                        )}
                                    </TableCell>

                                    <TableCell className="hidden lg:table-cell">
                                        {(item.fineAmount ?? 0) > 0 ? (
                                            <Chip size="small" label={money(item.fineAmount)} sx={{ backgroundColor: ROSE, color: "#ffffff", fontWeight: 700, height: 22, fontSize: 11 }} />
                                        ) : (
                                            <Typography className="text-xs text-gray-400">—</Typography>
                                        )}
                                    </TableCell>

                                    {overdue && (
                                        <TableCell>
                                            <Typography className="text-sm font-black whitespace-nowrap" sx={{ color: ROSE }}>
                                                {money(referenceFine(item.dueDate))}
                                            </Typography>
                                            <Typography className="text-[10px] font-bold whitespace-nowrap text-gray-500">
                                                {FINE_PER_DAY} × {overdueDays(item.dueDate)} day{overdueDays(item.dueDate) === 1 ? "" : "s"}
                                            </Typography>
                                        </TableCell>
                                    )}

                                    <TableCell>
                                        <Box className="flex flex-col gap-1">
                                            <Box className="flex items-center gap-1.5">
                                                <LuCalendarDays className="w-3.5 h-3.5 shrink-0" style={{ color: CYAN }} />
                                                <Typography className="text-xs font-semibold text-gray-700 whitespace-nowrap">{formatDate(item.dueDate)}</Typography>
                                            </Box>
                                            <DueChip dueDate={item.dueDate} overdue={overdue} />
                                        </Box>
                                    </TableCell>

                                    <TableCell className="hidden sm:table-cell">
                                        <Typography className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                                            {money(purchase.currentPaidAmount)} / {money(purchase.amount)}
                                        </Typography>
                                        <Typography className="text-[10px] font-semibold text-gray-500 whitespace-nowrap">
                                            {purchase.isEMIEnabled ? `${purchase.numberOfInstallments ?? 0} instalments` : "One-time"}
                                        </Typography>
                                    </TableCell>

                                    <TableCell align="right"><StatusChip item={item} /></TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}

/* ------------------------------------------------------------------ */
/* Main content                                                        */
/* ------------------------------------------------------------------ */

function DueUpcomingPaymentsContent() {
    const { duePayments, upcomingPayments, loadingPayments, getDueAndUpcomingPayments } = useERP();

    const [tab, setTab] = useState<"due" | "upcoming">("due");
    const [search, setSearch] = useState("");

    useEffect(() => { getDueAndUpcomingPayments(); }, [getDueAndUpcomingPayments]);

    const rows = tab === "due" ? duePayments : upcomingPayments;
    const accent = tab === "due" ? ROSE : SKY;

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return rows;
        return rows.filter((item) => {
            const student = item.StudentPurchases.Student;
            return (
                student.studentName.toLowerCase().includes(term) ||
                student.phoneNumber.includes(term) ||
                (student.studentRegistrationNumber ?? "").toLowerCase().includes(term) ||
                (student.email ?? "").toLowerCase().includes(term) ||
                String(item.amount).includes(term)
            );
        });
    }, [rows, search]);

    const sum = (list: StudentPaymentSchedule[]) => list.reduce((total, item) => total + outstanding(item), 0);
    const dueAmount = sum(duePayments);
    const upcomingAmount = sum(upcomingPayments);
    const uniqueStudents = new Set([...duePayments, ...upcomingPayments].map((item) => item.StudentPurchases.studentId)).size;

    return (
        <Box className="flex flex-col gap-2 sm:gap-3 h-full">

            {/* Stats */}
            <Box className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <StatCard label="Overdue" value={duePayments.length} color={ROSE} icon={<LuTriangleAlert className="w-4 h-4" />} />
                <StatCard label="Overdue amount" value={money(dueAmount)} color={ORANGE} icon={<LuBanknote className="w-4 h-4" />} />
                <StatCard label="Upcoming this month" value={upcomingPayments.length} color={SKY} icon={<LuCalendarClock className="w-4 h-4" />} />
                <StatCard label="Upcoming amount" value={money(upcomingAmount)} color={VIOLET} icon={<LuWallet className="w-4 h-4" />} />
            </Box>

            {/* Tabs */}
            <Paper elevation={0} className="rounded-lg" sx={{ border: `1px solid ${accent}` }}>
                <Tabs
                    value={tab}
                    onChange={(_, value) => setTab(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        minHeight: 40,
                        "& .MuiTab-root": { minHeight: 40, textTransform: "none", fontWeight: 700, fontSize: 13 },
                        "& .MuiTabs-indicator": { backgroundColor: accent, height: 3 },
                        "& .Mui-selected": { color: `${accent} !important` },
                    }}
                >
                    <Tab
                        value="due"
                        label={
                            <Box className="flex items-center gap-1.5">
                                <LuHourglass className="w-3.5 h-3.5" style={{ color: ROSE }} />
                                Due &amp; Overdue
                                <Chip size="small" label={duePayments.length} sx={{ backgroundColor: ROSE, color: "#ffffff", fontWeight: 700, height: 18, fontSize: 10 }} />
                            </Box>
                        }
                    />
                    <Tab
                        value="upcoming"
                        label={
                            <Box className="flex items-center gap-1.5">
                                <LuCalendarClock className="w-3.5 h-3.5" style={{ color: SKY }} />
                                Upcoming
                                <Chip size="small" label={upcomingPayments.length} sx={{ backgroundColor: SKY, color: "#ffffff", fontWeight: 700, height: 18, fontSize: 10 }} />
                            </Box>
                        }
                    />
                </Tabs>
            </Paper>

            {/* Toolbar */}
            <Paper elevation={0} className="rounded-lg" sx={{ border: `1px solid ${PRIMARY}` }}>
                <Box className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 sm:p-2.5">
                    <Box className="flex items-center gap-2 min-w-0">
                        <Box className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: PRIMARY, color: "#ffffff" }}>
                            <LuUsers className="w-4 h-4" />
                        </Box>
                        <Box className="min-w-0">
                            <Typography className="text-sm font-bold text-gray-900 leading-tight">
                                {tab === "due" ? "Due & Overdue Payments" : "Upcoming Payments"}
                            </Typography>
                            <Typography className="text-[11px] text-gray-500 leading-tight">{uniqueStudents} students in the pipeline</Typography>
                        </Box>
                    </Box>

                    <Divider flexItem orientation="vertical" className="hidden sm:block" />

                    <TextField
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search student, phone or reg. no…"
                        className="flex-1"
                        slotProps={{
                            input: {
                                startAdornment: <InputAdornment position="start"><LuSearch className="w-4 h-4 text-gray-400" /></InputAdornment>,
                                endAdornment: search ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearch("")}><LuX className="w-3.5 h-3.5" /></IconButton>
                                    </InputAdornment>
                                ) : undefined,
                                sx: { borderRadius: "8px" },
                            },
                        }}
                    />

                    <Tooltip title="Refresh">
                        <IconButton
                            size="small"
                            onClick={() => getDueAndUpcomingPayments()}
                            sx={{ border: `1px solid ${PRIMARY}`, borderRadius: "8px", color: PRIMARY, alignSelf: "flex-start" }}
                        >
                            <LuRefreshCw className={`w-4 h-4 ${loadingPayments ? "animate-spin" : ""}`} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Paper>

            {/* Content */}
            <Box className="flex-1 min-h-0 overflow-auto flex flex-col gap-2 sm:gap-3">
                {tab === "due" && (
                    <Paper elevation={0} className="rounded-lg p-2 flex items-center gap-2" sx={{ border: `1px solid ${AMBER}` }}>
                        <Box className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: AMBER, color: "#ffffff" }}>
                            <LuInfo className="w-3.5 h-3.5" />
                        </Box>
                        <Typography className="text-[11px] font-semibold text-gray-700">
                            Late fine is shown for reference only at {money(FINE_PER_DAY)} per overdue day and is not charged automatically.
                        </Typography>
                    </Paper>
                )}

                {loadingPayments && rows.length === 0 ? (
                    <Box className="py-20 flex flex-col items-center gap-2">
                        <CircularProgress size={28} sx={{ color: accent }} />
                        <Typography className="text-sm text-gray-400">Loading payments…</Typography>
                    </Box>
                ) : filtered.length === 0 ? (
                    <Paper elevation={0} className="rounded-lg py-16 flex flex-col items-center gap-2" sx={{ border: `1px solid ${accent}` }}>
                        <Box className="w-12 h-12 rounded-lg flex items-center justify-center" sx={{ backgroundColor: tab === "due" ? EMERALD : accent, color: "#ffffff" }}>
                            {tab === "due" ? <LuCircleCheckBig className="w-6 h-6" /> : <LuCalendarClock className="w-6 h-6" />}
                        </Box>
                        <Typography className="text-sm text-gray-500">
                            {search
                                ? "No payments match your search."
                                : tab === "due"
                                    ? "No overdue payments. All collections are on track."
                                    : "No payments scheduled for the rest of this month."}
                        </Typography>
                        {search && (
                            <Button size="small" onClick={() => setSearch("")} sx={{ textTransform: "none", fontWeight: 700, color: accent }}>
                                Clear search
                            </Button>
                        )}
                    </Paper>
                ) : (
                    <PaymentsTable rows={filtered} accent={accent} overdue={tab === "due"} />
                )}
            </Box>

            {/* Footer summary */}
            {filtered.length > 0 && (
                <Paper elevation={0} className="rounded-lg p-2 flex items-center justify-between gap-2 flex-wrap" sx={{ border: `1px solid ${EMERALD}` }}>
                    <Typography className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        {filtered.length} schedule{filtered.length === 1 ? "" : "s"} shown
                    </Typography>
                    <Box className="flex items-center gap-3 flex-wrap">
                        {tab === "due" && (
                            <Typography className="text-sm font-black" sx={{ color: AMBER }}>
                                Ref. late fine {money(filtered.reduce((total, item) => total + referenceFine(item.dueDate), 0))}
                            </Typography>
                        )}
                        <Typography className="text-sm font-black" sx={{ color: tab === "due" ? ROSE : EMERALD_DARK }}>
                            Outstanding {money(sum(filtered))}
                        </Typography>
                    </Box>
                </Paper>
            )}
        </Box>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function DueUpcomingPaymentsPage() {
    return (
        <AccountantDashboardLayout title="Due & Upcoming Payments">
            <DueUpcomingPaymentsContent />
        </AccountantDashboardLayout>
    );
}