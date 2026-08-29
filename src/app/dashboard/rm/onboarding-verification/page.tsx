"use client";

import React, { useCallback, useEffect, useState } from "react";
import RMDashboardLayout from "@/layouts/RMDashboardLayout";
import { RMProvider, useRM, type OnboardingListItem, type GetOnboardingsParams } from "@/contexts/RMContext";
import { useRouter } from "next/navigation";
import {
    Avatar,
    Box,
    Button,
    Chip,
    IconButton,
    InputAdornment,
    Pagination,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    LuSearch,
    LuCircleCheck,
    LuClock,
    LuUser,
    LuPhone,
    LuMail,
    LuX,
    LuFilter,
    LuRefreshCw,
    LuBuilding2,
    LuGraduationCap,
    LuIndianRupee,
    LuLayers,
} from "react-icons/lu";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const VIOLET = "#7c3aed";
const VIOLET_DARK = "#6d28d9";
const SKY = "#0284c7";
const CYAN = "#06b6d4";
const EMERALD = "#10b981";
const ORANGE = "#f97316";
const AMBER = "#f59e0b";
const AMBER_DARK = "#d97706";
const ROW_HOVER = "#f5f3ff";

const LIMIT = 15;

const HEAD_CELL_SX = {
    py: 1.25,
    px: 1.5,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: ".06em",
    textTransform: "uppercase" as const,
    color: "#ffffff",
    borderBottom: "none",
    whiteSpace: "nowrap" as const,
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function fmt(d?: string) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function StatCard({ label, value, color, icon }: { label: string; value: React.ReactNode; color: string; icon: React.ReactNode }) {
    return (
        <Paper
            elevation={0}
            className="rounded-lg px-3 py-2.5 flex items-center gap-2.5"
            sx={{ border: `1px solid ${color}`, backgroundColor: color, color: "#ffffff", transition: "box-shadow .2s", "&:hover": { boxShadow: 4 } }}
        >
            <Box className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: "#ffffff", color }}>
                {icon}
            </Box>
            <Box className="min-w-0">
                <Typography className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">{label}</Typography>
                <Typography className="text-lg sm:text-xl font-black leading-tight">{value}</Typography>
            </Box>
        </Paper>
    );
}

function StatusBadge({ approved }: { approved: boolean }) {
    return (
        <Chip
            size="small"
            icon={approved
                ? <LuCircleCheck className="w-3 h-3" style={{ color: "#ffffff" }} />
                : <LuClock className="w-3 h-3" style={{ color: "#ffffff" }} />}
            label={approved ? "Approved" : "Pending"}
            sx={{ height: 22, fontWeight: 700, backgroundColor: approved ? EMERALD : AMBER, color: "#ffffff" }}
        />
    );
}

function OnboardingRow({ item, onClick }: { item: OnboardingListItem; onClick: () => void }) {
    // sum actual cash collected from collection entries
    const collected = item.onboardingCollectionsDatas.reduce((sum, c) => sum + c.paidAmount, 0);
    const remaining = item.finalPayableAmount - collected;

    return (
        <TableRow
            hover
            onClick={onClick}
            sx={{ cursor: "pointer", "&:hover": { backgroundColor: ROW_HOVER }, transition: "background-color .15s" }}
        >
            <TableCell sx={{ px: 1.5, py: 1.25 }}>
                <Box className="flex items-center gap-2.5 min-w-0">
                    <Avatar
                        src={item.photoURL || undefined}
                        sx={{ width: 34, height: 34, border: `1px solid ${VIOLET}`, backgroundColor: "#ede9fe", color: VIOLET }}
                    >
                        <LuUser className="w-4 h-4" />
                    </Avatar>
                    <Box className="min-w-0">
                        <Typography className="text-[13px] font-semibold text-gray-900 truncate max-w-40">{item.fullName || "—"}</Typography>
                        <Typography className="text-[11px] text-gray-400 font-mono truncate">{item.formNumber}</Typography>
                    </Box>
                </Box>
            </TableCell>

            <TableCell sx={{ px: 1.5, py: 1.25 }}>
                <Box className="flex flex-col gap-0.5 min-w-0">
                    <Typography className="flex items-center gap-1 text-xs text-gray-700 whitespace-nowrap">
                        <LuPhone className="w-3 h-3 shrink-0" style={{ color: SKY }} />
                        {item.countryCode} {item.phoneNumber}
                    </Typography>
                    {item.email && (
                        <Typography className="hidden sm:flex items-center gap-1 text-[11px] text-gray-400 truncate max-w-44">
                            <LuMail className="w-3 h-3 shrink-0" style={{ color: CYAN }} />
                            {item.email}
                        </Typography>
                    )}
                </Box>
            </TableCell>

            <TableCell sx={{ px: 1.5, py: 1.25, display: { xs: "none", md: "table-cell" } }}>
                {item.selectedBranch ? (
                    <Chip
                        size="small"
                        icon={<LuBuilding2 className="w-3 h-3" style={{ color: "#ffffff" }} />}
                        label={item.selectedBranch}
                        sx={{ height: 22, fontWeight: 600, backgroundColor: SKY, color: "#ffffff", maxWidth: 150 }}
                    />
                ) : (
                    <Typography className="text-xs text-gray-300">—</Typography>
                )}
            </TableCell>

            <TableCell sx={{ px: 1.5, py: 1.25, display: { xs: "none", lg: "table-cell" } }}>
                {item.trainingOptionSelected ? (
                    <Chip
                        size="small"
                        icon={<LuGraduationCap className="w-3 h-3" style={{ color: "#ffffff" }} />}
                        label={item.trainingOptionSelected}
                        sx={{ height: 22, fontWeight: 600, backgroundColor: CYAN, color: "#ffffff", maxWidth: 160 }}
                    />
                ) : (
                    <Typography className="text-xs text-gray-300">—</Typography>
                )}
            </TableCell>

            <TableCell sx={{ px: 1.5, py: 1.25 }}>
                <Box className="flex flex-col gap-0.5">
                    <Typography className="text-xs font-bold text-gray-900 whitespace-nowrap">
                        ₹{item.finalPayableAmount.toLocaleString("en-IN")}
                    </Typography>
                    <Typography className="text-[11px] font-semibold whitespace-nowrap" sx={{ color: remaining <= 0 ? EMERALD : ORANGE }}>
                        {remaining <= 0 ? "Fully paid" : `₹${collected.toLocaleString("en-IN")} paid`}
                    </Typography>
                </Box>
            </TableCell>

            <TableCell sx={{ px: 1.5, py: 1.25 }}>
                <StatusBadge approved={item.isApproved} />
            </TableCell>

            <TableCell sx={{ px: 1.5, py: 1.25, display: { xs: "none", sm: "table-cell" } }}>
                <Typography className="text-xs text-gray-500 whitespace-nowrap">{fmt(item.createdAt)}</Typography>
            </TableCell>
        </TableRow>
    );
}

function SkeletonRow() {
    return (
        <TableRow>
            <TableCell sx={{ px: 1.5, py: 1.25 }}>
                <Box className="flex items-center gap-2.5">
                    <Skeleton variant="circular" width={34} height={34} />
                    <Box className="flex flex-col gap-0.5">
                        <Skeleton variant="text" width={110} height={16} />
                        <Skeleton variant="text" width={64} height={12} />
                    </Box>
                </Box>
            </TableCell>
            <TableCell sx={{ px: 1.5, py: 1.25 }}><Skeleton variant="text" width={120} height={16} /></TableCell>
            <TableCell sx={{ px: 1.5, py: 1.25, display: { xs: "none", md: "table-cell" } }}><Skeleton variant="rounded" width={100} height={22} /></TableCell>
            <TableCell sx={{ px: 1.5, py: 1.25, display: { xs: "none", lg: "table-cell" } }}><Skeleton variant="rounded" width={110} height={22} /></TableCell>
            <TableCell sx={{ px: 1.5, py: 1.25 }}><Skeleton variant="text" width={80} height={16} /></TableCell>
            <TableCell sx={{ px: 1.5, py: 1.25 }}><Skeleton variant="rounded" width={80} height={22} /></TableCell>
            <TableCell sx={{ px: 1.5, py: 1.25, display: { xs: "none", sm: "table-cell" } }}><Skeleton variant="text" width={80} height={16} /></TableCell>
        </TableRow>
    );
}

/* ------------------------------------------------------------------ */
/* Inner page — uses useRM inside RMProvider                           */
/* ------------------------------------------------------------------ */

function OnboardingVerificationContent() {
    const router = useRouter();
    const { onboardings, meta, loadingList, getOnboardings } = useRM();

    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(1);
    const limit = LIMIT;

    const fetch = useCallback((overrides: Partial<GetOnboardingsParams> = {}) => {
        getOnboardings({
            page,
            limit,
            search: search || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            ...overrides,
        });
    }, [getOnboardings, page, search, startDate, endDate, limit]);

    // initial load — intentionally runs once, not tracking fetch identity
    useEffect(() => { fetch(); }, [fetch]);

    const handleSearch = () => {
        setPage(1);
        fetch({ page: 1 });
    };

    const handleClearFilters = () => {
        setSearch("");
        setStartDate("");
        setEndDate("");
        setPage(1);
        getOnboardings({ page: 1, limit });
    };

    const handlePageChange = (next: number) => {
        setPage(next);
        fetch({ page: next });
    };

    const hasFilters = Boolean(search || startDate || endDate);

    return (
        <Box className="flex flex-col gap-2 sm:gap-3 h-full">

            {/* Stats strip */}
            <Box className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <StatCard label="Total" value={meta?.total ?? "—"} color={SKY} icon={<LuLayers className="w-4 h-4" />} />
                <StatCard label="Approved" value={onboardings.filter(o => o.isApproved).length} color={EMERALD} icon={<LuCircleCheck className="w-4 h-4" />} />
                <StatCard label="Pending" value={onboardings.filter(o => !o.isApproved).length} color={ORANGE} icon={<LuClock className="w-4 h-4" />} />
                <StatCard label="Page" value={meta ? `${meta.page} / ${meta.totalPages}` : "—"} color={VIOLET} icon={<LuIndianRupee className="w-4 h-4" />} />
            </Box>

            {/* Filters */}
            <Paper elevation={0} className="rounded-lg" sx={{ border: "1px solid #e5e7eb" }}>
                <Box className="flex flex-col lg:flex-row lg:items-center gap-2 p-2 sm:p-2.5">
                    <TextField
                        size="small"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSearch()}
                        placeholder="Name, phone, email…"
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

                    <Box className="flex gap-2">
                        <TextField
                            size="small"
                            type="date"
                            label="From"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="flex-1 lg:w-40"
                            slotProps={{ inputLabel: { shrink: true }, input: { sx: { borderRadius: "8px" } } }}
                        />
                        <TextField
                            size="small"
                            type="date"
                            label="To"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="flex-1 lg:w-40"
                            slotProps={{ inputLabel: { shrink: true }, input: { sx: { borderRadius: "8px" } } }}
                        />
                    </Box>

                    <Box className="flex items-center gap-2">
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<LuFilter className="w-3.5 h-3.5" />}
                            onClick={handleSearch}
                            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, whiteSpace: "nowrap", backgroundColor: VIOLET, "&:hover": { backgroundColor: VIOLET_DARK } }}
                        >
                            Apply
                        </Button>
                        <Tooltip title="Refresh">
                            <span>
                                <IconButton
                                    size="small"
                                    disabled={loadingList}
                                    onClick={() => fetch()}
                                    sx={{ border: "1px solid #e5e7eb", borderRadius: "8px" }}
                                >
                                    <LuRefreshCw className={`w-4 h-4 ${loadingList ? "animate-spin" : ""}`} />
                                </IconButton>
                            </span>
                        </Tooltip>
                        {hasFilters && (
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<LuX className="w-3.5 h-3.5" />}
                                onClick={handleClearFilters}
                                sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, whiteSpace: "nowrap", borderColor: AMBER_DARK, color: AMBER_DARK }}
                            >
                                Clear
                            </Button>
                        )}
                    </Box>
                </Box>
            </Paper>

            {/* Table */}
            <Paper elevation={0} className="rounded-lg overflow-hidden flex-1 min-h-0 flex flex-col" sx={{ border: `1px solid ${VIOLET}` }}>
                <TableContainer className="flex-1 min-h-0">
                    <Table stickyHeader size="small" sx={{ minWidth: 720 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ ...HEAD_CELL_SX, background: `linear-gradient(90deg, ${VIOLET} 0%, ${SKY} 100%)` }}>Student</TableCell>
                                <TableCell sx={{ ...HEAD_CELL_SX, backgroundColor: SKY }}>Contact</TableCell>
                                <TableCell sx={{ ...HEAD_CELL_SX, backgroundColor: SKY, display: { xs: "none", md: "table-cell" } }}>Branch</TableCell>
                                <TableCell sx={{ ...HEAD_CELL_SX, backgroundColor: SKY, display: { xs: "none", lg: "table-cell" } }}>Training</TableCell>
                                <TableCell sx={{ ...HEAD_CELL_SX, backgroundColor: SKY }}>Payment</TableCell>
                                <TableCell sx={{ ...HEAD_CELL_SX, background: `linear-gradient(90deg, ${SKY} 0%, ${VIOLET} 100%)` }}>Status</TableCell>
                                <TableCell sx={{ ...HEAD_CELL_SX, backgroundColor: VIOLET, display: { xs: "none", sm: "table-cell" } }}>Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loadingList ? (
                                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : onboardings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} sx={{ py: 8, textAlign: "center", border: "none" }}>
                                        <Typography className="text-sm text-gray-400">No onboardings found.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                onboardings.map(item => (
                                    <OnboardingRow
                                        key={item.onboardingId}
                                        item={item}
                                        onClick={() => router.push(`/dashboard/rm/onboarding-verification/${item.onboardingId}`)}
                                    />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                {meta && (
                    <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2.5 py-2" sx={{ borderTop: "1px solid #e5e7eb", backgroundColor: "#f8fafc" }}>
                        <Typography className="text-[11px] font-semibold text-gray-500">
                            Showing {meta.total === 0 ? 0 : ((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
                        </Typography>
                        {meta.totalPages > 1 && (
                            <Pagination
                                size="small"
                                shape="rounded"
                                count={meta.totalPages}
                                page={meta.page}
                                onChange={(_, value) => handlePageChange(value)}
                                sx={{
                                    "& .MuiPaginationItem-root": { fontWeight: 700, borderRadius: "8px" },
                                    "& .Mui-selected": { backgroundColor: `${VIOLET} !important`, color: "#ffffff" },
                                }}
                            />
                        )}
                    </Box>
                )}
            </Paper>
        </Box>
    );
}

/* ------------------------------------------------------------------ */
/* Page — wraps with RMProvider                                        */
/* ------------------------------------------------------------------ */

export default function OnboardingVerificationPage() {
    return (
        <RMDashboardLayout title="Onboarding Verification">
            <RMProvider>
                <OnboardingVerificationContent />
            </RMProvider>
        </RMDashboardLayout>
    );
}
