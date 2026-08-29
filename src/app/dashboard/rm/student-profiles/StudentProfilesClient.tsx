"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRM, GetStudentsParams } from "@/contexts/RMContext";
import type { LMSStudentData } from "@/contexts/StudentContext";
import {
    Avatar,
    Box,
    Button,
    Chip,
    Collapse,
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
    Typography,
} from "@mui/material";
import {
    Search, X, Filter, User, Phone, Mail, CheckCircle, XCircle, Calendar,
    Users, UserCheck, UserX, Cpu, ArrowRight,
} from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const PRIMARY = "#009DFF";
const PRIMARY_DARK = "#007fd4";
const VIOLET = "#7c3aed";
const SKY = "#0284c7";
const CYAN = "#06b6d4";
const EMERALD = "#10b981";
const AMBER = "#f59e0b";
const ROSE = "#f43f5e";
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

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

function fmtDate(value?: string | null) {
    if (!value) return null;
    return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function initialsOf(name: string) {
    return name.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase()).join("");
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

export default function StudentProfilesClient({ path }: { path: string }) {
    const { getAllStudentsForBranch, students, studentsMeta, loadingStudents } = useRM();

    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    const debouncedSearch = useDebounce(search, 400);

    const fetchStudents = useCallback(
        (params: GetStudentsParams) => { getAllStudentsForBranch(params); },
        [getAllStudentsForBranch],
    );

    useEffect(() => {
        const params: GetStudentsParams = { page, limit: LIMIT };
        if (debouncedSearch) params.search = debouncedSearch;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        fetchStudents(params);
    }, [page, debouncedSearch, startDate, endDate, fetchStudents]);

    useEffect(() => { setPage(1); }, [debouncedSearch, startDate, endDate]);

    const clearFilters = () => {
        setSearch("");
        setStartDate("");
        setEndDate("");
        setPage(1);
    };

    const hasFilters = Boolean(search || startDate || endDate);

    const { activeCount, inactiveCount } = useMemo(() => ({
        activeCount: students.filter((s) => s.isActive).length,
        inactiveCount: students.filter((s) => !s.isActive).length,
    }), [students]);

    return (
        <Box className="flex flex-col gap-2 sm:gap-3 h-full">

            {/* Stats */}
            <Box className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <StatCard label="Total students" value={studentsMeta?.total ?? "—"} color={PRIMARY} icon={<Users size={16} />} />
                <StatCard label="Active (page)" value={activeCount} color={EMERALD} icon={<UserCheck size={16} />} />
                <StatCard label="Inactive (page)" value={inactiveCount} color={ROSE} icon={<UserX size={16} />} />
                <StatCard
                    label="Page"
                    value={studentsMeta ? `${studentsMeta.page} / ${studentsMeta.totalPages}` : "—"}
                    color={VIOLET}
                    icon={<Filter size={16} />}
                />
            </Box>

            {/* Toolbar */}
            <Paper elevation={0} className="rounded-lg" sx={{ border: "1px solid #e5e7eb" }}>
                <Box className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 sm:p-2.5">
                    <TextField
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, phone, email or reg. no."
                        className="flex-1"
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={15} color="#9ca3af" />
                                    </InputAdornment>
                                ),
                                endAdornment: search ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearch("")}>
                                            <X size={14} />
                                        </IconButton>
                                    </InputAdornment>
                                ) : undefined,
                                sx: { borderRadius: "8px" },
                            },
                        }}
                    />

                    <Button
                        size="small"
                        variant={showFilters || hasFilters ? "contained" : "outlined"}
                        startIcon={<Filter size={14} />}
                        onClick={() => setShowFilters((v) => !v)}
                        sx={{
                            borderRadius: "8px",
                            textTransform: "none",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            ...(showFilters || hasFilters
                                ? { backgroundColor: PRIMARY, "&:hover": { backgroundColor: PRIMARY_DARK } }
                                : { borderColor: PRIMARY, color: PRIMARY }),
                        }}
                    >
                        Filters{hasFilters ? " · on" : ""}
                    </Button>
                </Box>

                <Collapse in={showFilters}>
                    <Box className="flex flex-col sm:flex-row sm:items-end gap-2 px-2 pb-2 sm:px-2.5 sm:pb-2.5">
                        <TextField
                            size="small"
                            type="date"
                            label="From"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="flex-1"
                            slotProps={{ inputLabel: { shrink: true }, input: { sx: { borderRadius: "8px" } } }}
                        />
                        <TextField
                            size="small"
                            type="date"
                            label="To"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="flex-1"
                            slotProps={{ inputLabel: { shrink: true }, input: { sx: { borderRadius: "8px" } } }}
                        />
                        {hasFilters && (
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<X size={14} />}
                                onClick={clearFilters}
                                sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, whiteSpace: "nowrap", borderColor: ROSE, color: ROSE }}
                            >
                                Clear all
                            </Button>
                        )}
                    </Box>
                </Collapse>
            </Paper>

            {/* Table */}
            <Paper elevation={0} className="rounded-lg overflow-hidden flex-1 min-h-0 flex flex-col" sx={{ border: `1px solid ${PRIMARY}` }}>
                <TableContainer className="flex-1 min-h-0">
                    <Table stickyHeader size="small" sx={{ minWidth: 640 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ ...HEAD_CELL_SX, background: `linear-gradient(90deg, ${PRIMARY} 0%, ${SKY} 100%)` }}>Student</TableCell>
                                <TableCell sx={{ ...HEAD_CELL_SX, backgroundColor: SKY }}>Contact</TableCell>
                                <TableCell sx={{ ...HEAD_CELL_SX, backgroundColor: SKY, display: { xs: "none", md: "table-cell" } }}>DOB</TableCell>
                                <TableCell sx={{ ...HEAD_CELL_SX, backgroundColor: SKY, display: { xs: "none", lg: "table-cell" } }}>Machine code</TableCell>
                                <TableCell sx={{ ...HEAD_CELL_SX, background: `linear-gradient(90deg, ${SKY} 0%, ${VIOLET} 100%)` }}>Status</TableCell>
                                <TableCell sx={{ ...HEAD_CELL_SX, backgroundColor: VIOLET }} align="right" />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loadingStudents ? (
                                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : students.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} sx={{ py: 8, textAlign: "center", border: "none" }}>
                                        <Typography className="text-sm text-gray-400">
                                            {hasFilters ? "No students match your filters." : "No students found."}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.map((s) => <StudentRow key={s.studentId} student={s} path={path} />)
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {studentsMeta && (
                    <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2.5 py-2" sx={{ borderTop: "1px solid #e5e7eb", backgroundColor: "#f8fafc" }}>
                        <Typography className="text-[11px] font-semibold text-gray-500">
                            {studentsMeta.total} student{studentsMeta.total !== 1 ? "s" : ""}
                            {hasFilters ? " matching filters" : ""}
                        </Typography>
                        {studentsMeta.totalPages > 1 && (
                            <Pagination
                                size="small"
                                shape="rounded"
                                count={studentsMeta.totalPages}
                                page={page}
                                onChange={(_, value) => setPage(value)}
                                sx={{
                                    "& .MuiPaginationItem-root": { fontWeight: 700, borderRadius: "8px" },
                                    "& .Mui-selected": { backgroundColor: `${PRIMARY} !important`, color: "#ffffff" },
                                }}
                            />
                        )}
                    </Box>
                )}
            </Paper>
        </Box>
    );
}

function StudentRow({ student, path }: { student: LMSStudentData, path: string }) {
    const dob = fmtDate(student.dateOfBirth);

    return (
        <TableRow hover sx={{ "&:hover": { backgroundColor: ROW_HOVER }, transition: "background-color .15s" }}>
            <TableCell sx={{ px: 1.5, py: 1.25 }}>
                <Box className="flex items-center gap-2.5 min-w-0">
                    <Avatar
                        src={student.studentPhoto || undefined}
                        sx={{ width: 34, height: 34, border: `1px solid ${VIOLET}`, backgroundColor: "#ede9fe", color: VIOLET, fontSize: 12, fontWeight: 700 }}
                    >
                        {initialsOf(student.studentName) || <User size={14} />}
                    </Avatar>
                    <Box className="min-w-0">
                        <Typography className="text-[13px] font-semibold text-gray-900 truncate max-w-100">{student.studentName}</Typography>
                        <Typography className="text-[11px] text-gray-400 font-mono truncate">
                            {student.studentRegistrationNumber ?? "—"}
                        </Typography>
                    </Box>
                </Box>
            </TableCell>

            <TableCell sx={{ px: 1.5, py: 1.25 }}>
                <Box className="flex flex-col gap-0.5 min-w-0">
                    <Typography className="flex items-center gap-1 text-xs text-gray-700 whitespace-nowrap">
                        <Phone size={11} style={{ color: SKY }} className="shrink-0" />
                        +{student.callingCode} {student.phoneNumber}
                    </Typography>
                    {student.email && (
                        <Typography className="flex items-center gap-1 text-[11px] text-gray-400 truncate max-w-44">
                            <Mail size={11} style={{ color: CYAN }} className="shrink-0" />
                            {student.email}
                        </Typography>
                    )}
                </Box>
            </TableCell>

            <TableCell sx={{ px: 1.5, py: 1.25, display: { xs: "none", md: "table-cell" } }}>
                {dob ? (
                    <Typography className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
                        <Calendar size={11} style={{ color: AMBER }} className="shrink-0" />
                        {dob}
                    </Typography>
                ) : (
                    <Typography className="text-xs text-gray-300">—</Typography>
                )}
            </TableCell>

            <TableCell sx={{ px: 1.5, py: 1.25, display: { xs: "none", lg: "table-cell" } }}>
                {student.machineCode ? (
                    <Chip
                        size="small"
                        icon={<Cpu size={11} style={{ color: "#ffffff" }} />}
                        label={student.machineCode}
                        sx={{ height: 22, fontWeight: 600, fontFamily: "monospace", backgroundColor: CYAN, color: "#ffffff", maxWidth: 150 }}
                    />
                ) : (
                    <Typography className="text-xs text-gray-300">—</Typography>
                )}
            </TableCell>

            <TableCell sx={{ px: 1.5, py: 1.25 }}>
                <Chip
                    size="small"
                    icon={student.isActive ? <CheckCircle size={11} style={{ color: "#ffffff" }} /> : <XCircle size={11} style={{ color: "#ffffff" }} />}
                    label={student.isActive ? "Active" : "Inactive"}
                    sx={{ height: 22, fontWeight: 700, backgroundColor: student.isActive ? EMERALD : ROSE, color: "#ffffff" }}
                />
            </TableCell>

            <TableCell sx={{ px: 1.5, py: 1.25 }} align="right">
                <Button
                    component={Link}
                    href={`${path}/${student.studentId}`}
                    size="small"
                    variant="contained"
                    endIcon={<ArrowRight size={13} />}
                    sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, fontSize: 12, py: 0.25, backgroundColor: PRIMARY, "&:hover": { backgroundColor: PRIMARY_DARK } }}
                >
                    View
                </Button>
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
            <TableCell sx={{ px: 1.5, py: 1.25, display: { xs: "none", md: "table-cell" } }}><Skeleton variant="text" width={90} height={16} /></TableCell>
            <TableCell sx={{ px: 1.5, py: 1.25, display: { xs: "none", lg: "table-cell" } }}><Skeleton variant="rounded" width={100} height={22} /></TableCell>
            <TableCell sx={{ px: 1.5, py: 1.25 }}><Skeleton variant="rounded" width={70} height={22} /></TableCell>
            <TableCell sx={{ px: 1.5, py: 1.25 }} align="right"><Skeleton variant="rounded" width={64} height={26} /></TableCell>
        </TableRow>
    );
}


