"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    Avatar,
    Box,
    Button,
    Chip,
    InputAdornment,
    MenuItem,
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
    Typography,
} from "@mui/material";
import {
    LuCircleCheck,
    LuCircleX,
    LuClock,
    LuInbox,
    LuPhone,
    LuRefreshCw,
    LuSearch,
    LuUser,
} from "react-icons/lu";
import RMDashboardLayout from "@/layouts/RMDashboardLayout";
import {
    REQUEST_TYPES,
    RequestProvider,
    STATUS_LABELS,
    useRequests,
    type BranchRequest,
    type RequestStatus,
    type RequestTab,
} from "@/contexts/RequestContext";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const PRIMARY = "#009DFF";
const VIOLET = "#7c3aed";
const SKY = "#0284c7";
const EMERALD = "#10b981";
const ORANGE = "#f97316";
const AMBER = "#f59e0b";
const ROSE = "#f43f5e";
const SLATE = "#64748b";
const ROW_HOVER = "#f5f3ff";

const LIMIT = 15;

const STATUS_COLOR: Record<RequestStatus, string> = {
    pending: AMBER,
    in_review: SKY,
    approved: EMERALD,
    resolved: EMERALD,
    rejected: ROSE,
    withdrawn: SLATE,
};

const TABS: { label: string; value: RequestTab }[] = [
    { label: "Active", value: "active" },
    { label: "Resolved", value: "resolved" },
    { label: "Rejected", value: "rejected" },
];

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

const FIELD_SX = { "& .MuiOutlinedInput-root": { borderRadius: "8px" } };

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatDate(value?: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/** Hours past the promised SLA, or 0 when still inside it. */
function hoursOverdue(request: BranchRequest) {
    const deadline = new Date(request.createdAt).getTime() + request.expectedResponseHours * 3600_000;
    const diff = Date.now() - deadline;
    return diff <= 0 ? 0 : Math.floor(diff / 3600_000);
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

function RequestRow({ request, onClick }: { request: BranchRequest; onClick: () => void }) {
    const overdue = hoursOverdue(request);
    const isOpen = request.requestStatus === "pending" || request.requestStatus === "in_review";

    return (
        <TableRow
            hover
            onClick={onClick}
            sx={{ cursor: "pointer", "&:hover": { backgroundColor: ROW_HOVER }, transition: "background-color .15s" }}
        >
            <TableCell sx={{ px: 1.5, py: 1.25 }}>
                <Box className="flex items-center gap-2.5 min-w-0">
                    <Avatar
                        src={request.student.studentPhoto || undefined}
                        sx={{ width: 34, height: 34, border: `1px solid ${VIOLET}`, backgroundColor: "#ede9fe", color: VIOLET }}
                    >
                        <LuUser className="w-4 h-4" />
                    </Avatar>
                    <Box className="min-w-0">
                        <Typography className="text-[13px] font-semibold text-gray-900 truncate max-w-40">
                            {request.student.studentName}
                        </Typography>
                        <Typography className="flex items-center gap-1 text-[11px] text-gray-400 font-mono truncate">
                            <LuPhone className="w-3 h-3 shrink-0" style={{ color: SKY }} />
                            {request.student.callingCode} {request.student.phoneNumber}
                        </Typography>
                    </Box>
                </Box>
            </TableCell>

            <TableCell sx={{ px: 1.5, py: 1.25 }}>
                <Typography className="text-[13px] font-semibold text-gray-900 truncate max-w-56">
                    {request.requestTitle}
                </Typography>
                <Typography className="text-[11px] text-gray-400 truncate max-w-56">
                    {request.requestDescription}
                </Typography>
            </TableCell>

            <TableCell sx={{ px: 1.5, py: 1.25, display: { xs: "none", md: "table-cell" } }}>
                <Chip
                    size="small"
                    label={request.requestType}
                    sx={{ height: 22, fontWeight: 600, backgroundColor: SKY, color: "#ffffff", maxWidth: 150 }}
                />
            </TableCell>

            <TableCell sx={{ px: 1.5, py: 1.25 }}>
                <Chip
                    size="small"
                    label={STATUS_LABELS[request.requestStatus]}
                    sx={{ height: 22, fontWeight: 700, backgroundColor: STATUS_COLOR[request.requestStatus], color: "#ffffff" }}
                />
            </TableCell>

            <TableCell sx={{ px: 1.5, py: 1.25, display: { xs: "none", lg: "table-cell" } }}>
                {isOpen && overdue > 0 ? (
                    <Typography className="text-[11px] font-bold whitespace-nowrap" sx={{ color: ROSE }}>
                        {overdue}h overdue
                    </Typography>
                ) : (
                    <Typography className="text-[11px] font-semibold whitespace-nowrap" sx={{ color: isOpen ? EMERALD : SLATE }}>
                        {isOpen ? "Within SLA" : STATUS_LABELS[request.requestStatus]}
                    </Typography>
                )}
            </TableCell>

            <TableCell sx={{ px: 1.5, py: 1.25, display: { xs: "none", sm: "table-cell" } }}>
                <Typography className="text-xs text-gray-500 whitespace-nowrap">{formatDate(request.createdAt)}</Typography>
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
            <TableCell sx={{ px: 1.5, py: 1.25 }}><Skeleton variant="text" width={170} height={16} /></TableCell>
            <TableCell sx={{ px: 1.5, py: 1.25, display: { xs: "none", md: "table-cell" } }}><Skeleton variant="rounded" width={100} height={22} /></TableCell>
            <TableCell sx={{ px: 1.5, py: 1.25 }}><Skeleton variant="rounded" width={80} height={22} /></TableCell>
            <TableCell sx={{ px: 1.5, py: 1.25, display: { xs: "none", lg: "table-cell" } }}><Skeleton variant="text" width={70} height={16} /></TableCell>
            <TableCell sx={{ px: 1.5, py: 1.25, display: { xs: "none", sm: "table-cell" } }}><Skeleton variant="text" width={80} height={16} /></TableCell>
        </TableRow>
    );
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

function StudentRequestsContent() {
    const router = useRouter();
    const {
        branchRequests, branchMeta, branchSummary,
        loadingBranchRequests, getBranchRequests, getBranchRequestSummary,
    } = useRequests();

    const [tab, setTab] = useState<RequestTab>("active");
    const [requestType, setRequestType] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const load = useCallback((overrides: { page?: number } = {}) => {
        void getBranchRequests({
            tab,
            page: overrides.page ?? page,
            limit: LIMIT,
            search: search.trim() || undefined,
            requestType: requestType || undefined,
        }).then((res) => {
            if (!res.success) toast.error(res.message ?? "Failed to load requests");
        });
        // `search` is applied on Enter/Refresh, so it is deliberately not a dependency.
    }, [getBranchRequests, tab, page, requestType]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { void getBranchRequestSummary(); }, [getBranchRequestSummary]);

    const changeTab = (next: RequestTab) => {
        setTab(next);
        setPage(1);
    };

    return (
        <div className="flex flex-col gap-2 sm:gap-3 h-full overflow-y-auto">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <StatCard label="Total" value={branchSummary?.total ?? "—"} color={PRIMARY} icon={<LuInbox className="w-4 h-4" />} />
                <StatCard label="Open" value={branchSummary?.active ?? "—"} color={AMBER} icon={<LuClock className="w-4 h-4" />} />
                <StatCard label="Resolved" value={branchSummary?.resolved ?? "—"} color={EMERALD} icon={<LuCircleCheck className="w-4 h-4" />} />
                <StatCard label="Rejected" value={branchSummary?.rejected ?? "—"} color={ROSE} icon={<LuCircleX className="w-4 h-4" />} />
            </div>

            {/* Filters */}
            <Paper elevation={0} sx={{ borderRadius: "8px", border: `1px solid ${ORANGE}`, p: 1.25 }}>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex gap-1">
                        {TABS.map((option) => {
                            const active = option.value === tab;
                            return (
                                <Button
                                    key={option.value}
                                    onClick={() => changeTab(option.value)}
                                    size="small"
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: "8px",
                                        fontSize: "0.75rem",
                                        fontWeight: 700,
                                        px: 1.5,
                                        color: active ? "#fff" : "#6b7280",
                                        backgroundColor: active ? VIOLET : "#f3f4f6",
                                        "&:hover": { backgroundColor: active ? "#6d28d9" : "#e5e7eb" },
                                    }}
                                >
                                    {option.label}
                                </Button>
                            );
                        })}
                    </div>

                    <TextField
                        select
                        size="small"
                        label="Category"
                        value={requestType}
                        onChange={(event) => { setRequestType(event.target.value); setPage(1); }}
                        sx={{ ...FIELD_SX, minWidth: 160 }}
                    >
                        <MenuItem value="">All categories</MenuItem>
                        {REQUEST_TYPES.map((type) => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        size="small"
                        placeholder="Search student, title or description"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        onKeyDown={(event) => { if (event.key === "Enter") { setPage(1); load({ page: 1 }); } }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LuSearch className="w-4 h-4" style={{ color: SLATE }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{ ...FIELD_SX, flex: 1, minWidth: 220 }}
                    />

                    <Button
                        onClick={() => { setPage(1); load({ page: 1 }); }}
                        size="small"
                        variant="contained"
                        startIcon={<LuRefreshCw className="w-3.5 h-3.5" />}
                        sx={{
                            textTransform: "none", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 600,
                            backgroundColor: PRIMARY, "&:hover": { backgroundColor: "#007fd4" },
                        }}
                    >
                        Refresh
                    </Button>
                </div>
            </Paper>

            {/* Table */}
            <Paper elevation={0} sx={{ borderRadius: "8px", border: `1px solid ${VIOLET}`, overflow: "hidden" }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: VIOLET }}>
                                <TableCell sx={HEAD_CELL_SX}>Student</TableCell>
                                <TableCell sx={HEAD_CELL_SX}>Request</TableCell>
                                <TableCell sx={{ ...HEAD_CELL_SX, display: { xs: "none", md: "table-cell" } }}>Category</TableCell>
                                <TableCell sx={HEAD_CELL_SX}>Status</TableCell>
                                <TableCell sx={{ ...HEAD_CELL_SX, display: { xs: "none", lg: "table-cell" } }}>SLA</TableCell>
                                <TableCell sx={{ ...HEAD_CELL_SX, display: { xs: "none", sm: "table-cell" } }}>Raised</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loadingBranchRequests && branchRequests.length === 0
                                ? Array.from({ length: 6 }).map((_, index) => <SkeletonRow key={index} />)
                                : branchRequests.length === 0
                                    ? (
                                        <TableRow>
                                            <TableCell colSpan={6} sx={{ px: 1.5, py: 4, textAlign: "center" }}>
                                                <Typography className="text-sm text-gray-400">
                                                    No requests for this filter.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )
                                    : branchRequests.map((request) => (
                                        <RequestRow
                                            key={request.requestId}
                                            request={request}
                                            onClick={() => router.push(`/dashboard/rm/student-requests/${request.requestId}`)}
                                        />
                                    ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {branchMeta && branchMeta.totalPages > 1 && (
                <div className="flex justify-center py-1">
                    <Pagination
                        count={branchMeta.totalPages}
                        page={page}
                        onChange={(_, value) => { setPage(value); load({ page: value }); }}
                        size="small"
                        shape="rounded"
                    />
                </div>
            )}
        </div>
    );
}

export default function StudentRequestsPage() {
    return (
        <RMDashboardLayout title="Student Requests">
            <RequestProvider>
                <StudentRequestsContent />
            </RequestProvider>
        </RMDashboardLayout>
    );
}
