"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TrainerDashboardLayout from "@/layouts/TrainerDashboardLayout";
import { useTrainer, type SessionStatus, type TrainerTodaySession } from "@/contexts/TrainerContext";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    MenuItem,
    Paper,
    Skeleton,
    Snackbar,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    MdOutlineCalendarMonth,
    MdOutlineCheckCircle,
    MdOutlineClass,
    MdOutlineDoNotDisturbOn,
    MdOutlineEventAvailable,
    MdOutlineEventBusy,
    MdOutlineGroups,
    MdOutlineLocationOn,
    MdOutlineOpenInNew,
    MdOutlinePendingActions,
    MdOutlinePlayCircle,
    MdOutlineRefresh,
    MdOutlineSchedule,
    MdOutlineStopCircle,
    MdOutlineUpdate,
    MdOutlineWatchLater,
} from "react-icons/md";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const STATUS_STYLES: Record<SessionStatus, { label: string; color: string; bg: string }> = {
    scheduled: { label: "Scheduled", color: "#0284c7", bg: "#e0f2fe" },
    ongoing: { label: "Live now", color: "#059669", bg: "#d1fae5" },
    completed: { label: "Completed", color: "#7c3aed", bg: "#ede9fe" },
    cancelled: { label: "Cancelled", color: "#f43f5e", bg: "#ffe4e6" },
    rescheduled: { label: "Rescheduled", color: "#d97706", bg: "#fef3c7" },
};

function formatTime(value: string | null) {
    if (!value) return "--";
    return new Date(value).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

function formatLongDate(value: string | Date) {
    return new Date(value).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

type StatTileProps = {
    label: string;
    value: number;
    color: string;
    bg: string;
    icon: React.ReactNode;
    loading: boolean;
};

function StatTile({ label, value, color, bg, icon, loading }: StatTileProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                border: `1px solid ${color}`,
                backgroundColor: "#ffffff",
                transition: "box-shadow .2s ease, transform .2s ease",
                "&:hover": { boxShadow: `0 8px 20px ${bg}`, transform: "translateY(-2px)" },
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <Box
                    sx={{
                        width: 34,
                        height: 34,
                        flexShrink: 0,
                        borderRadius: 1.5,
                        backgroundColor: bg,
                        color,
                        display: "grid",
                        placeItems: "center",
                        fontSize: 20,
                    }}
                >
                    {icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    {loading ? (
                        <Skeleton width={38} height={30} />
                    ) : (
                        <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.1, color }}>
                            {value}
                        </Typography>
                    )}
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: .3 }}>
                        {label}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
}

export default function TrainerDashboardPage() {
    const router = useRouter();
    const {
        profile,
        todaySchedule,
        sessionStats,
        loadingProfile,
        loadingTodaySchedule,
        loadingSessionStats,
        updatingSession,
        getProfile,
        getTodaySchedule,
        getSessionStats,
        startSession,
    } = useTrainer();

    const now = useMemo(() => new Date(), []);
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const years = useMemo(() => {
        const current = now.getFullYear();
        return [current - 2, current - 1, current, current + 1];
    }, [now]);

    useEffect(() => {
        getProfile();
        getTodaySchedule();
    }, [getProfile, getTodaySchedule]);

    useEffect(() => {
        getSessionStats({ month, year });
    }, [getSessionStats, month, year]);

    const refresh = useCallback(() => {
        getTodaySchedule();
        getSessionStats({ month, year });
    }, [getTodaySchedule, getSessionStats, month, year]);

    const handleStart = useCallback(
        async (sessionId: string) => {
            setActiveSessionId(sessionId);
            const res = await startSession(sessionId);
            setActiveSessionId(null);
            setFeedback({
                type: res.success ? "success" : "error",
                message: res.message ?? "Something went wrong",
            });
            if (res.success) getSessionStats({ month, year });
        },
        [startSession, getSessionStats, month, year]
    );

    const handleEnd = useCallback(
        (sessionId: string) => {
            router.push(`/dashboard/trainer/my-batches/session/${sessionId}`);
        },
        [router]
    );

    const sessions = todaySchedule?.sessions ?? [];
    const liveCount = sessions.filter((s) => s.sessionStatus === "ongoing").length;
    const stats = sessionStats;

    return (
        <TrainerDashboardLayout title="My Day">
            <Box sx={{  display: "flex", flexDirection: "column", gap: { xs: 1.5, sm: 2.5 } }}>

                {/* Greeting banner */}
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 2,
                        border: "1px solid #0284c7",
                        background: "linear-gradient(120deg, #009DFF 0%, #0284c7 45%, #7c3aed 100%)",
                        color: "#ffffff",
                        p: { xs: 2, sm: 2.5 },
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.5,
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        {loadingProfile && !profile ? (
                            <Skeleton width={220} height={34} sx={{ bgcolor: "#38bdf8" }} />
                        ) : (
                            <Typography sx={{ fontSize: { xs: 18, sm: 22 }, fontWeight: 800, lineHeight: 1.2 }}>
                                Hi, {profile?.trainerName ?? "Trainer"}
                            </Typography>
                        )}
                        <Typography sx={{ fontSize: { xs: 12, sm: 13 }, fontWeight: 500, mt: .25 }}>
                            {formatLongDate(todaySchedule?.date ?? now)}
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Chip
                            size="small"
                            icon={<MdOutlineSchedule size={15} color="#ffffff" />}
                            label={`${todaySchedule?.totalSessions ?? 0} today`}
                            sx={{ backgroundColor: "#0369a1", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }}
                        />
                        {liveCount > 0 && (
                            <Chip
                                size="small"
                                label={`${liveCount} live`}
                                sx={{ backgroundColor: "#10b981", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }}
                            />
                        )}
                        <Chip
                            size="small"
                            icon={<MdOutlineClass size={15} color="#ffffff" />}
                            label={`${profile?.totalBatches ?? 0} batches`}
                            sx={{ backgroundColor: "#6d28d9", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }}
                        />
                        <Tooltip title="Refresh">
                            <IconButton
                                size="small"
                                onClick={refresh}
                                sx={{ color: "#ffffff", border: "1px solid #ffffff", borderRadius: 1.5 }}
                            >
                                <MdOutlineRefresh />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Paper>

                {/* Stats */}
                <Paper
                    elevation={0}
                    sx={{ borderRadius: 2, border: "1px solid #7c3aed", backgroundColor: "#ffffff", p: { xs: 1.5, sm: 2 } }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, flexWrap: "wrap", mb: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ width: 30, height: 30, borderRadius: 1.5, backgroundColor: "#ede9fe", color: "#7c3aed", display: "grid", placeItems: "center", fontSize: 18 }}>
                                <MdOutlineCalendarMonth />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#1e293b" }}>
                                    Session Stats
                                </Typography>
                                <Typography sx={{ fontSize: 11, color: "#64748b" }}>
                                    {MONTHS[month - 1]} {year}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: "flex", gap: 1 }}>
                            <TextField
                                select
                                size="small"
                                label="Month"
                                value={month}
                                onChange={(e) => setMonth(Number(e.target.value))}
                                sx={{ minWidth: 130 }}
                            >
                                {MONTHS.map((name, index) => (
                                    <MenuItem key={name} value={index + 1}>{name}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                size="small"
                                label="Year"
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                sx={{ minWidth: 100 }}
                            >
                                {years.map((option) => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </Box>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 sm:gap-3">
                        <StatTile label="Total" value={stats?.totalSessions ?? 0} color="#009DFF" bg="#e0f2fe" icon={<MdOutlineCalendarMonth />} loading={loadingSessionStats} />
                        <StatTile label="Completed" value={stats?.completed ?? 0} color="#059669" bg="#d1fae5" icon={<MdOutlineCheckCircle />} loading={loadingSessionStats} />
                        <StatTile label="Ongoing" value={stats?.ongoing ?? 0} color="#06b6d4" bg="#cffafe" icon={<MdOutlinePlayCircle />} loading={loadingSessionStats} />
                        <StatTile label="Scheduled" value={stats?.scheduled ?? 0} color="#0284c7" bg="#e0f2fe" icon={<MdOutlineEventAvailable />} loading={loadingSessionStats} />
                        <StatTile label="Pending" value={stats?.notCompleted ?? 0} color="#ea6e0b" bg="#ffedd5" icon={<MdOutlinePendingActions />} loading={loadingSessionStats} />
                        <StatTile label="Rescheduled" value={stats?.rescheduled ?? 0} color="#d97706" bg="#fef3c7" icon={<MdOutlineUpdate />} loading={loadingSessionStats} />
                        <StatTile label="Cancelled" value={stats?.cancelled ?? 0} color="#f43f5e" bg="#ffe4e6" icon={<MdOutlineDoNotDisturbOn />} loading={loadingSessionStats} />
                    </div>
                </Paper>

                {/* Today's schedule */}
                <Paper
                    elevation={0}
                    sx={{ borderRadius: 2, border: "1px solid #009DFF", backgroundColor: "#ffffff", p: { xs: 1.5, sm: 2 } }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                        <Box sx={{ width: 30, height: 30, borderRadius: 1.5, backgroundColor: "#e0f2fe", color: "#009DFF", display: "grid", placeItems: "center", fontSize: 18 }}>
                            <MdOutlineWatchLater />
                        </Box>
                        <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#1e293b", flex: 1 }}>
                            Today&apos;s Schedule
                        </Typography>
                        <Chip
                            size="small"
                            label={`${sessions.length} session${sessions.length === 1 ? "" : "s"}`}
                            sx={{ backgroundColor: "#e0f2fe", color: "#0369a1", fontWeight: 700, border: "1px solid #0284c7" }}
                        />
                    </Box>

                    <Divider sx={{ mb: 1.5 }} />

                    {loadingTodaySchedule && sessions.length === 0 ? (
                        <div className="grid gap-2">
                            {[0, 1, 2].map((key) => (
                                <Skeleton key={key} variant="rounded" height={96} />
                            ))}
                        </div>
                    ) : sessions.length === 0 ? (
                        <Box sx={{ py: 5, display: "flex", flexDirection: "column", alignItems: "center", gap: 1, color: "#64748b" }}>
                            <MdOutlineEventBusy size={38} color="#94a3b8" />
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#475569" }}>
                                No sessions scheduled today
                            </Typography>
                            <Typography sx={{ fontSize: 12 }}>Enjoy your day, or check your calendar for upcoming classes.</Typography>
                        </Box>
                    ) : (
                        <div className="grid gap-2 sm:gap-3">
                            {sessions.map((session) => (
                                <SessionRow
                                    key={session.batchSessionId}
                                    session={session}
                                    busy={updatingSession && activeSessionId === session.batchSessionId}
                                    disabled={updatingSession}
                                    onStart={() => handleStart(session.batchSessionId)}
                                    onEnd={() => handleEnd(session.batchSessionId)}
                                    onOpen={() => router.push(`/dashboard/trainer/my-batches/session/${session.batchSessionId}`)}
                                />
                            ))}
                        </div>
                    )}
                </Paper>
            </Box>

            <Snackbar
                open={!!feedback}
                autoHideDuration={3500}
                onClose={() => setFeedback(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity={feedback?.type ?? "success"} variant="filled" onClose={() => setFeedback(null)}>
                    {feedback?.message}
                </Alert>
            </Snackbar>
        </TrainerDashboardLayout>
    );
}

type SessionRowProps = {
    session: TrainerTodaySession;
    busy: boolean;
    disabled: boolean;
    onStart: () => void;
    onEnd: () => void;
    onOpen: () => void;
};

function SessionRow({ session, busy, disabled, onStart, onEnd, onOpen }: SessionRowProps) {
    const status = STATUS_STYLES[session.sessionStatus] ?? STATUS_STYLES.scheduled;
    const canStart = session.sessionStatus === "scheduled" || session.sessionStatus === "rescheduled";
    const isLive = session.sessionStatus === "ongoing";
    const joinLink = session.sessionLink ?? session.batch.batchLink;
    const time = session.isRescheduled && session.rescheduledTime
        ? session.rescheduledTime
        : session.sessionTime;

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                border: `1px solid ${status.color}`,
                backgroundColor: "#ffffff",
                transition: "box-shadow .2s ease",
                "&:hover": { boxShadow: `0 8px 20px ${status.bg}` },
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "stretch", md: "center" },
                gap: { xs: 1.25, md: 2 },
            }}
        >
            <Box
                sx={{
                    minWidth: { md: 96 },
                    borderRadius: 1.5,
                    backgroundColor: status.bg,
                    color: status.color,
                    px: 1.25,
                    py: .75,
                    display: "flex",
                    flexDirection: { xs: "row", md: "column" },
                    alignItems: "center",
                    justifyContent: "center",
                    gap: .5,
                }}
            >
                <Typography sx={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>
                    {formatTime(time)}
                </Typography>
                <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: .3 }}>
                    {status.label}
                </Typography>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#1e293b" }} noWrap>
                    {session.batch.batchName}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#64748b" }} noWrap>
                    {session.batch.course.courseName}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: .75, mt: .75 }}>
                    <Chip
                        size="small"
                        icon={<MdOutlineGroups size={14} color="#0369a1" />}
                        label={`${session.batch.totalStudents} students`}
                        sx={{ height: 22, fontSize: 11, fontWeight: 600, backgroundColor: "#e0f2fe", color: "#0369a1", border: "1px solid #0284c7" }}
                    />
                    {session.batch.mode && (
                        <Chip
                            size="small"
                            label={session.batch.mode}
                            sx={{ height: 22, fontSize: 11, fontWeight: 600, backgroundColor: "#ede9fe", color: "#6d28d9", border: "1px solid #7c3aed" }}
                        />
                    )}
                    {session.batch.classRoomNumber && (
                        <Chip
                            size="small"
                            icon={<MdOutlineLocationOn size={14} color="#ea6e0b" />}
                            label={session.batch.classRoomNumber}
                            sx={{ height: 22, fontSize: 11, fontWeight: 600, backgroundColor: "#ffedd5", color: "#ea6e0b", border: "1px solid #f97316" }}
                        />
                    )}
                </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                {joinLink && (
                    <Button
                        size="small"
                        variant="outlined"
                        href={joinLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<MdOutlineOpenInNew />}
                        sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, borderColor: "#7c3aed", color: "#7c3aed", "&:hover": { borderColor: "#6d28d9", backgroundColor: "#ede9fe" } }}
                    >
                        Join
                    </Button>
                )}

                {canStart && (
                    <Button
                        size="small"
                        variant="contained"
                        disableElevation
                        disabled={disabled}
                        onClick={onStart}
                        startIcon={busy ? <CircularProgress size={14} color="inherit" /> : <MdOutlinePlayCircle />}
                        sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, backgroundColor: "#009DFF", "&:hover": { backgroundColor: "#007fd4" } }}
                    >
                        Start
                    </Button>
                )}

                {isLive && (
                    <Button
                        size="small"
                        variant="contained"
                        disableElevation
                        onClick={onEnd}
                        startIcon={<MdOutlineStopCircle />}
                        sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, backgroundColor: "#f43f5e", "&:hover": { backgroundColor: "#e11d48" } }}
                    >
                        End
                    </Button>
                )}

                <Button
                    size="small"
                    variant="outlined"
                    onClick={onOpen}
                    sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, borderColor: "#0284c7", color: "#0284c7", "&:hover": { borderColor: "#0369a1", backgroundColor: "#e0f2fe" } }}
                >
                    Open
                </Button>

                {session.sessionStatus === "completed" && (
                    <Chip
                        size="small"
                        icon={<MdOutlineCheckCircle size={15} color="#6d28d9" />}
                        label="Done"
                        sx={{ fontWeight: 700, backgroundColor: "#ede9fe", color: "#6d28d9", border: "1px solid #7c3aed" }}
                    />
                )}
            </Box>
        </Paper>
    );
}