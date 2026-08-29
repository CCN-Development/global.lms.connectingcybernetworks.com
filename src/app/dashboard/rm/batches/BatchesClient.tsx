"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    Layers, Users, CalendarDays, Armchair, Plus, Search, SlidersHorizontal,
    ArrowRight, Trash2, Clock, GraduationCap, MessageSquareWarning, Inbox, Loader2,
} from "lucide-react";
import {
    Box, Button, Collapse, IconButton, InputAdornment, Paper, Skeleton, Tooltip,
    Dialog, DialogActions, DialogContent, DialogTitle,
} from "@mui/material";
import { useBatch, type BatchListItem } from "@/contexts/BatchContext";
import { useContent } from "@/contexts/ContentContext";
import BatchFormDialog from "@/components/batches/BatchFormDialog";
import {
    AppSelect, AppTextField, BRAND, EmptyState, InfoChip, MODE_OPTIONS,
    StatCard, StatusChip, Surface, formatDate, formatTime, shortDay,
} from "@/components/batches/batch-ui";

const BASE_PATH = "/dashboard/rm/batches";

function useDebounced<T>(value: T, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

export default function BatchesClient() {
    const { batches, loadingBatches, getBatches, deleteBatch } = useBatch();
    const { courses, getCourses } = useContent();

    const [search, setSearch] = useState("");
    const [courseId, setCourseId] = useState("");
    const [mode, setMode] = useState("");
    const [activeFilter, setActiveFilter] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<BatchListItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    const debouncedSearch = useDebounced(search);

    const refresh = useMemo(() => () => getBatches({
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(courseId ? { courseId } : {}),
        ...(mode ? { mode } : {}),
        ...(activeFilter ? { isActive: activeFilter === "active" } : {}),
    }), [getBatches, debouncedSearch, courseId, mode, activeFilter]);

    useEffect(() => { refresh(); }, [refresh]);
    useEffect(() => { if (courses.length === 0) getCourses(); }, [courses.length, getCourses]);

    const stats = useMemo(() => {
        const activeBatches = batches.filter((b) => b.isActive).length;
        const students = batches.reduce((sum, b) => sum + b._count.batchStudents, 0);
        const openSeats = batches.reduce((sum, b) => sum + (b.availableSeats ?? 0), 0);
        const pendingRequests = batches.reduce((sum, b) => sum + b._count.batchRequests, 0);
        return { activeBatches, students, openSeats, pendingRequests };
    }, [batches]);

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        setDeleting(true);
        const res = await deleteBatch(pendingDelete.batchId);
        setDeleting(false);
        if (res.success) {
            toast.success("Batch deactivated");
            setPendingDelete(null);
            refresh();
        } else {
            toast.error(res.message ?? "Failed to deactivate batch");
        }
    };

    return (
        <Box className="flex flex-col gap-2 sm:gap-3 h-full overflow-y-auto">

            {/* Stats */}
            <Box className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <StatCard label="Batches" value={batches.length} hint={`${stats.activeBatches} active`} color={BRAND.primary} icon={<Layers size={16} />} />
                <StatCard label="Enrolled" value={stats.students} hint="across listed batches" color={BRAND.violet} icon={<Users size={16} />} />
                <StatCard label="Open seats" value={stats.openSeats} hint="available now" color={BRAND.emerald} icon={<Armchair size={16} />} />
                <StatCard label="Seat requests" value={stats.pendingRequests} hint="total raised" color={BRAND.orange} icon={<Inbox size={16} />} />
            </Box>

            {/* Toolbar */}
            <Paper elevation={0} sx={{ borderRadius: "8px", border: `1px solid ${BRAND.primary}`, p: 1.25 }}>
                <div className="flex items-center gap-2">
                    <AppTextField
                        placeholder="Search batches by name"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={14} color="#9ca3af" />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                    <Button
                        onClick={() => setShowFilters((prev) => !prev)}
                        size="small"
                        variant="outlined"
                        startIcon={<SlidersHorizontal size={13} />}
                        sx={{
                            textTransform: "none", borderRadius: "8px", fontSize: "0.75rem", whiteSpace: "nowrap",
                            borderColor: BRAND.violet, color: BRAND.violet,
                            "&:hover": { borderColor: BRAND.violet, bgcolor: BRAND.violetBg },
                        }}
                    >
                        <span className="hidden sm:inline">Filters</span>
                    </Button>
                    <Button
                        onClick={() => setFormOpen(true)}
                        size="small"
                        variant="contained"
                        startIcon={<Plus size={14} />}
                        sx={{
                            textTransform: "none", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 600, whiteSpace: "nowrap",
                            bgcolor: BRAND.primary, "&:hover": { bgcolor: BRAND.primaryHover },
                        }}
                    >
                        <span className="hidden sm:inline">New batch</span>
                        <span className="sm:hidden">New</span>
                    </Button>
                </div>

                <Collapse in={showFilters}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 mt-2 border-t border-gray-100">
                        <AppSelect
                            label="Course"
                            value={courseId}
                            onChange={setCourseId}
                            options={courses.map((c) => ({ label: c.courseName, value: c.courseId }))}
                        />
                        <AppSelect
                            label="Mode"
                            value={mode}
                            onChange={setMode}
                            options={MODE_OPTIONS.map((m) => ({ label: m, value: m }))}
                        />
                        <AppSelect
                            label="Status"
                            value={activeFilter}
                            onChange={setActiveFilter}
                            options={[{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }]}
                        />
                    </div>
                </Collapse>
            </Paper>

            {/* Grid */}
            {loadingBatches ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={196} sx={{ borderRadius: "8px" }} />
                    ))}
                </div>
            ) : batches.length === 0 ? (
                <EmptyState label="No batches match the current filters." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                    {batches.map((batch) => (
                        <BatchCard key={batch.batchId} batch={batch} onDelete={() => setPendingDelete(batch)} />
                    ))}
                </div>
            )}

            <BatchFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSaved={refresh} />

            <Dialog
                open={Boolean(pendingDelete)}
                onClose={deleting ? undefined : () => setPendingDelete(null)}
                slotProps={{ paper: { sx: { borderRadius: "12px", border: `1px solid ${BRAND.rose}` } } }}
            >
                <DialogTitle sx={{ fontSize: "0.9rem", fontWeight: 700, color: BRAND.rose }}>Deactivate batch</DialogTitle>
                <DialogContent>
                    <p className="text-xs text-gray-600">
                        <span className="font-semibold text-gray-800">{pendingDelete?.batchName}</span> will be deactivated.
                        Upcoming sessions get cancelled, student access is revoked and pending seat requests are rejected.
                    </p>
                </DialogContent>
                <DialogActions sx={{ px: 2.5, pb: 1.5 }}>
                    <Button
                        onClick={() => setPendingDelete(null)}
                        disabled={deleting}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: "none", borderRadius: "8px", fontSize: "0.75rem", borderColor: "#e5e7eb", color: "#374151" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDelete}
                        disabled={deleting}
                        size="small"
                        variant="contained"
                        startIcon={deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        sx={{ textTransform: "none", borderRadius: "8px", fontSize: "0.75rem", bgcolor: BRAND.rose, "&:hover": { bgcolor: "#e11d48" } }}
                    >
                        Deactivate
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

function BatchCard({ batch, onDelete }: { batch: BatchListItem; onDelete: () => void }) {
    const filled = (batch.totalSeats ?? 0) - (batch.availableSeats ?? 0);
    const fillPercent = batch.totalSeats ? Math.min(Math.round((filled / batch.totalSeats) * 100), 100) : 0;
    const seatColor = fillPercent >= 100 ? BRAND.rose : fillPercent >= 75 ? BRAND.orange : BRAND.emerald;

    return (
        <Surface accent={batch.isActive ? BRAND.primary : BRAND.slate} className="flex flex-col">
            <div
                className="px-3 py-2 flex items-start justify-between gap-2 rounded-t-lg"
                style={{
                    background: batch.isActive
                        ? `linear-gradient(90deg, ${BRAND.primary} 0%, ${BRAND.violet} 100%)`
                        : `linear-gradient(90deg, ${BRAND.slate} 0%, #475569 100%)`,
                }}
            >
                <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{batch.batchName}</p>
                    <p className="text-[11px] text-white truncate opacity-90">{batch.course?.courseName ?? "—"}</p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                    <Tooltip title="Deactivate batch">
                        <IconButton
                            size="small"
                            onClick={onDelete}
                            sx={{ color: "#ffffff", "&:hover": { bgcolor: "#ffffff", color: BRAND.rose } }}
                        >
                            <Trash2 size={13} />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>

            <div className="p-3 flex flex-col gap-2 flex-1">
                <div className="flex flex-wrap gap-1">
                    <StatusChip label={batch.isActive ? "Active" : "Inactive"} color={batch.isActive ? BRAND.emerald : BRAND.slate} />
                    {batch.mode && <StatusChip label={batch.mode} color={BRAND.violet} bg={BRAND.violetBg} />}
                    {batch.classRoomNumber && <StatusChip label={`Room ${batch.classRoomNumber}`} color={BRAND.sky} bg={BRAND.skyBg} />}
                </div>

                <div className="flex flex-wrap gap-1">
                    <InfoChip
                        icon={<CalendarDays size={11} />}
                        label={`${formatDate(batch.batchStartDate)} → ${formatDate(batch.batchEndDate)}`}
                        color={BRAND.sky}
                        bg={BRAND.skyBg}
                    />
                    {batch.classStartTime && (
                        <InfoChip
                            icon={<Clock size={11} />}
                            label={`${formatTime(batch.classStartTime)}${batch.classEndTime ? ` – ${formatTime(batch.classEndTime)}` : ""}`}
                            color={BRAND.amber}
                            bg={BRAND.amberBg}
                        />
                    )}
                </div>

                <div className="flex flex-wrap gap-1">
                    {(batch.batchDays ?? []).map((day) => (
                        <span
                            key={day}
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                            style={{ backgroundColor: BRAND.violetBg, color: BRAND.violet, border: `1px solid ${BRAND.violet}` }}
                        >
                            {shortDay(day)}
                        </span>
                    ))}
                </div>

                {/* Seats */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-400">Seats</span>
                        <span className="font-semibold" style={{ color: seatColor }}>
                            {batch.totalSeats === null ? "Unlimited" : `${filled} / ${batch.totalSeats} filled`}
                        </span>
                    </div>
                    <div className="h-1.5 w-full rounded" style={{ backgroundColor: "#e5e7eb" }}>
                        <div className="h-1.5 rounded" style={{ width: `${fillPercent}%`, backgroundColor: seatColor }} />
                    </div>
                </div>

                {/* Counts */}
                <div className="grid grid-cols-4 gap-1 pt-1 border-t border-gray-100">
                    <CountCell icon={<Users size={12} />} label="Students" value={batch._count.batchStudents} color={BRAND.violet} />
                    <CountCell icon={<CalendarDays size={12} />} label="Sessions" value={batch._count.batchSessions} color={BRAND.sky} />
                    <CountCell icon={<Inbox size={12} />} label="Requests" value={batch._count.batchRequests} color={BRAND.orange} />
                    <CountCell icon={<MessageSquareWarning size={12} />} label="Queries" value={batch._count.batchQueries} color={BRAND.rose} />
                </div>

                {/* Trainers */}
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 min-w-0">
                    <GraduationCap size={12} className="shrink-0" style={{ color: BRAND.emerald }} />
                    <span className="truncate">
                        {batch.batchTrainers.length > 0
                            ? batch.batchTrainers.map((row) => row.trainer.trainerName).join(", ")
                            : "No trainer assigned"}
                    </span>
                </div>

                <Button
                    component={Link}
                    href={`${BASE_PATH}/${batch.batchId}`}
                    size="small"
                    variant="contained"
                    endIcon={<ArrowRight size={13} />}
                    sx={{
                        mt: "auto", textTransform: "none", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 600,
                        bgcolor: BRAND.primary, "&:hover": { bgcolor: BRAND.primaryHover },
                    }}
                >
                    Open batch
                </Button>
            </div>
        </Surface>
    );
}

function CountCell({
    icon, label, value, color,
}: { icon: React.ReactNode; label: string; value: number; color: string }) {
    return (
        <div className="flex flex-col items-center gap-0.5">
            <span style={{ color }}>{icon}</span>
            <span className="text-xs font-bold text-gray-800">{value}</span>
            <span className="text-[9px] uppercase tracking-wide text-gray-400">{label}</span>
        </div>
    );
}
