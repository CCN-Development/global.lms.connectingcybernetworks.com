"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    LayoutDashboard, CalendarDays, Users, GraduationCap, Inbox, MessageSquareWarning,
    Clock, MapPin, Link2, Armchair, Edit2, Loader2, XCircle, ArrowLeft, BookOpen,
} from "lucide-react";
import { Box, Button, Paper, Tab, Tabs } from "@mui/material";
import { useBatch, type BatchDetail, type SessionStatus } from "@/contexts/BatchContext";
import BatchFormDialog from "@/components/batches/BatchFormDialog";
import {
    BRAND, InfoChip, StatCard, StatusChip, formatDate, formatTime, shortDay,
} from "@/components/batches/batch-ui";
import OverviewTab from "./OverviewTab";
import SessionsTab from "./SessionsTab";
import StudentsTab from "./StudentsTab";
import TrainersTab from "./TrainersTab";
import RequestsTab from "./RequestsTab";
import QueriesTab from "./QueriesTab";

type TabKey = "overview" | "sessions" | "students" | "trainers" | "requests" | "queries";

const TABS: { id: TabKey; label: string; icon: React.ComponentType<{ size?: number }>; color: string }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, color: BRAND.primary },
    { id: "sessions", label: "Sessions", icon: CalendarDays, color: BRAND.sky },
    { id: "students", label: "Students", icon: Users, color: BRAND.violet },
    { id: "trainers", label: "Trainers", icon: GraduationCap, color: BRAND.emerald },
    { id: "requests", label: "Seat Requests", icon: Inbox, color: BRAND.orange },
    { id: "queries", label: "Queries", icon: MessageSquareWarning, color: BRAND.rose },
];

export default function BatchDetailClient({ batchId }: { batchId: string }) {
    const { getBatchById } = useBatch();

    const [batch, setBatch] = useState<BatchDetail | null>(null);
    const [sessionStats, setSessionStats] = useState<Partial<Record<SessionStatus, number>>>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>("overview");
    const [editOpen, setEditOpen] = useState(false);

    const refresh = useCallback(async () => {
        const res = await getBatchById(batchId);
        if (res.success && res.data) {
            setBatch(res.data.batch);
            setSessionStats(res.data.sessionStats ?? {});
        } else {
            toast.error(res.message ?? "Failed to load batch");
        }
    }, [getBatchById, batchId]);

    useEffect(() => {
        setLoading(true);
        refresh().finally(() => setLoading(false));
    }, [refresh]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full p-6">
                <Loader2 size={20} className="animate-spin" style={{ color: BRAND.primary }} />
            </div>
        );
    }

    if (!batch) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-gray-500">
                <XCircle size={28} className="mb-2" style={{ color: BRAND.rose }} />
                <p className="text-sm">Batch not found.</p>
                <Link href="/dashboard/rm/batches" className="text-xs hover:underline mt-2" style={{ color: BRAND.primary }}>
                    Back to batches
                </Link>
            </div>
        );
    }

    const completed = sessionStats.completed ?? 0;
    const totalSessions = batch._count.batchSessions;
    const filledSeats = (batch.totalSeats ?? 0) - (batch.availableSeats ?? 0);

    return (
        <div className="flex flex-col gap-2 sm:gap-3 h-full overflow-y-auto">

            <BatchHeader batch={batch} onEditClick={() => setEditOpen(true)} />

            <Box className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <StatCard
                    label="Sessions"
                    value={`${completed}/${totalSessions}`}
                    hint={`${sessionStats.scheduled ?? 0} upcoming`}
                    color={BRAND.sky}
                    icon={<CalendarDays size={16} />}
                />
                <StatCard
                    label="Students"
                    value={batch._count.batchStudents}
                    hint={batch.totalSeats === null ? "Unlimited seats" : `${filledSeats}/${batch.totalSeats} seats used`}
                    color={BRAND.violet}
                    icon={<Users size={16} />}
                />
                <StatCard
                    label="Seat requests"
                    value={batch._count.batchRequests}
                    hint="all time"
                    color={BRAND.orange}
                    icon={<Inbox size={16} />}
                />
                <StatCard
                    label="Queries"
                    value={batch._count.batchQueries}
                    hint="raised by students"
                    color={BRAND.rose}
                    icon={<MessageSquareWarning size={16} />}
                />
            </Box>

            {/* Tabs */}
            <Paper elevation={0} sx={{ p: 0.5, borderRadius: "10px", border: "1px solid #e5e7eb", bgcolor: "#f9fafb", width: "fit-content", maxWidth: "100%" }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v as TabKey)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    slotProps={{ indicator: { style: { display: "none" } } }}
                    sx={{ minHeight: 36 }}
                >
                    {TABS.map((t) => (
                        <Tab
                            key={t.id}
                            value={t.id}
                            icon={<t.icon size={14} />}
                            iconPosition="start"
                            label={t.label}
                            sx={{
                                minHeight: 36, textTransform: "none", fontSize: "0.75rem", fontWeight: 600,
                                gap: 0.5, minWidth: "auto", px: 1.75, py: 0.75, mx: 0.25, borderRadius: "9px",
                                color: "#6b7280", transition: "background-color .15s ease, color .15s ease",
                                "&:hover": { backgroundColor: "#f1f5f9" },
                                "&.Mui-selected": { color: "#fff", backgroundColor: t.color },
                            }}
                        />
                    ))}
                </Tabs>
            </Paper>

            {activeTab === "overview" && (
                <OverviewTab batch={batch} sessionStats={sessionStats} onEdit={() => setEditOpen(true)} />
            )}
            {activeTab === "sessions" && <SessionsTab batchId={batchId} onChanged={refresh} />}
            {activeTab === "students" && <StudentsTab batch={batch} onChanged={refresh} />}
            {activeTab === "trainers" && <TrainersTab batch={batch} onChanged={refresh} />}
            {activeTab === "requests" && <RequestsTab batchId={batchId} onChanged={refresh} />}
            {activeTab === "queries" && <QueriesTab batchId={batchId} onChanged={refresh} />}

            <BatchFormDialog open={editOpen} onClose={() => setEditOpen(false)} batch={batch} onSaved={refresh} />
        </div>
    );
}

function BatchHeader({ batch, onEditClick }: { batch: BatchDetail; onEditClick: () => void }) {
    const filled = (batch.totalSeats ?? 0) - (batch.availableSeats ?? 0);

    return (
        <Paper
            elevation={5}
            sx={{ borderRadius: "10px", border: `1px solid ${BRAND.primary}`, transition: "box-shadow .2s", "&:hover": { boxShadow: 6 } }}
        >
            <Box
                sx={{
                    background: `linear-gradient(90deg, ${BRAND.primary} 0%, ${BRAND.violet} 100%)`,
                    borderRadius: "10px 10px 0 0",
                    px: { xs: 1.5, sm: 2.5 }, py: 1.5,
                    display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5,
                }}
            >
                <div className="min-w-0">
                    <Button
                        component={Link}
                        href="/dashboard/rm/batches"
                        size="small"
                        startIcon={<ArrowLeft size={12} />}
                        sx={{ textTransform: "none", fontSize: "0.68rem", color: "#fff", p: 0, minWidth: 0, mb: 0.5, "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}
                    >
                        All batches
                    </Button>
                    <h2 className="text-base sm:text-lg font-bold text-white leading-tight truncate">{batch.batchName}</h2>
                    <div className="flex items-center gap-1.5 mt-1 min-w-0">
                        <BookOpen size={12} color="#ffffff" className="shrink-0" />
                        <span className="text-[11px] text-white truncate">{batch.course?.courseName ?? "—"}</span>
                    </div>
                </div>
                <Button
                    onClick={onEditClick}
                    size="small"
                    variant="contained"
                    startIcon={<Edit2 size={12} />}
                    sx={{
                        textTransform: "none", borderRadius: "8px", fontSize: "0.7rem", fontWeight: 600, flexShrink: 0,
                        bgcolor: "#fff", color: BRAND.primary, boxShadow: "0 2px 8px rgba(15,23,42,0.25)",
                        "&:hover": { bgcolor: "#f8fafc" },
                    }}
                >
                    Edit
                </Button>
            </Box>

            <div className="px-3 sm:px-4 py-2.5 flex flex-col gap-2">
                <div className="flex flex-wrap gap-1">
                    <StatusChip label={batch.isActive ? "Active" : "Inactive"} color={batch.isActive ? BRAND.emerald : BRAND.slate} />
                    {batch.mode && <StatusChip label={batch.mode} color={BRAND.violet} bg={BRAND.violetBg} />}
                    {(batch.batchDays ?? []).map((day) => (
                        <StatusChip key={day} label={shortDay(day)} color={BRAND.sky} bg={BRAND.skyBg} />
                    ))}
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
                    {batch.classRoomNumber && (
                        <InfoChip icon={<MapPin size={11} />} label={`Room ${batch.classRoomNumber}`} color={BRAND.emerald} bg={BRAND.emeraldBg} />
                    )}
                    <InfoChip
                        icon={<Armchair size={11} />}
                        label={batch.totalSeats === null ? "Unlimited seats" : `${filled}/${batch.totalSeats} seats`}
                        color={BRAND.violet}
                        bg={BRAND.violetBg}
                    />
                    {batch.batchLink && (
                        <InfoChip icon={<Link2 size={11} />} label="Class link" color={BRAND.rose} bg={BRAND.roseBg} />
                    )}
                </div>
            </div>
        </Paper>
    );
}
