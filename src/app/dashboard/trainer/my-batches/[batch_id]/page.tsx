"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TrainerDashboardLayout from "@/layouts/TrainerDashboardLayout";
import {
    useTrainer,
    type SessionStatus,
    type TrainerBatchSession,
    type TrainerBatchStudent,
} from "@/contexts/TrainerContext";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    LinearProgress,
    MenuItem,
    Paper,
    Skeleton,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    MdArrowBack,
    MdChevronLeft,
    MdChevronRight,
    MdClose,
    MdOutlineCalendarMonth,
    MdOutlineCheckCircle,
    MdOutlineDoNotDisturbOn,
    MdOutlineEventAvailable,
    MdOutlineEventBusy,
    MdOutlineGroups,
    MdOutlineLocationOn,
    MdOutlineMail,
    MdOutlineOpenInNew,
    MdOutlinePendingActions,
    MdOutlinePhone,
    MdOutlinePlayCircle,
    MdOutlineSearch,
    MdOutlineToday,
    MdOutlineUpdate,
    MdOutlineWatchLater,
} from "react-icons/md";
import { MdOutlineAssignment } from "react-icons/md";
import AssignmentsTab from "./AssignmentsTab";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_STYLES: Record<SessionStatus, { label: string; color: string; bg: string }> = {
    scheduled: { label: "Scheduled", color: "#0284c7", bg: "#e0f2fe" },
    ongoing: { label: "Live now", color: "#059669", bg: "#d1fae5" },
    completed: { label: "Completed", color: "#7c3aed", bg: "#ede9fe" },
    cancelled: { label: "Cancelled", color: "#f43f5e", bg: "#ffe4e6" },
    rescheduled: { label: "Rescheduled", color: "#d97706", bg: "#fef3c7" },
};

const STUDENT_STATUS_STYLES: Record<string, { color: string; bg: string }> = {
    active: { color: "#059669", bg: "#d1fae5" },
    completed: { color: "#7c3aed", bg: "#ede9fe" },
    dropped: { color: "#f43f5e", bg: "#ffe4e6" },
    failed: { color: "#ea6e0b", bg: "#ffedd5" },
};

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(value: string | null) {
    if (!value) return "--";
    return new Date(value).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function effectiveTime(session: TrainerBatchSession) {
    return session.isRescheduled && session.rescheduledTime ? session.rescheduledTime : session.sessionTime;
}

export default function TrainerBatchDetailPage() {
    const router = useRouter();
    const params = useParams<{ batch_id: string }>();
    const batchId = params?.batch_id as string;

    const {
        batchDetail,
        sessionStats,
        loadingBatchDetail,
        loadingSessionStats,
        getBatchDetails,
        getSessionStats,
        clearBatchDetail,
    } = useTrainer();

    const today = useMemo(() => new Date(), []);
    const [tab, setTab] = useState(0);
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());
    const [studentSearch, setStudentSearch] = useState("");
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const years = useMemo(() => {
        const current = today.getFullYear();
        return [current - 2, current - 1, current, current + 1];
    }, [today]);

    useEffect(() => {
        if (batchId) getBatchDetails(batchId);
        return () => clearBatchDetail();
    }, [batchId, getBatchDetails, clearBatchDetail]);

    useEffect(() => {
        if (batchId) getSessionStats({ month, year, batchId });
    }, [batchId, getSessionStats, month, year]);

    const sessions = useMemo(() => batchDetail?.sessions ?? [], [batchDetail]);

    const monthSessions = useMemo(
        () =>
            sessions.filter((session) => {
                const date = new Date(session.sessionDate);
                return date.getMonth() + 1 === month && date.getFullYear() === year;
            }),
        [sessions, month, year]
    );

    const sessionsByDay = useMemo(() => {
        const map = new Map<number, TrainerBatchSession[]>();
        monthSessions.forEach((session) => {
            const day = new Date(session.sessionDate).getDate();
            const bucket = map.get(day);
            if (bucket) bucket.push(session);
            else map.set(day, [session]);
        });
        map.forEach((list) =>
            list.sort((a, b) => new Date(effectiveTime(a)).getTime() - new Date(effectiveTime(b)).getTime())
        );
        return map;
    }, [monthSessions]);

    const upcomingSessions = useMemo(() => {
        const cutoff = today.getTime() - 86400000;
        return sessions
            .filter((session) => new Date(session.sessionDate).getTime() >= cutoff)
            .sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime())
            .slice(0, 6);
    }, [sessions, today]);

    const filteredStudents = useMemo(() => {
        const term = studentSearch.trim().toLowerCase();
        const list = batchDetail?.students ?? [];
        if (!term) return list;
        return list.filter(
            (student) =>
                student.studentName.toLowerCase().includes(term) ||
                student.phoneNumber.includes(term) ||
                (student.email ?? "").toLowerCase().includes(term)
        );
    }, [batchDetail, studentSearch]);

    const shiftMonth = useCallback((step: number) => {
        setMonth((prevMonth) => {
            const next = prevMonth + step;
            if (next < 1) {
                setYear((prevYear) => prevYear - 1);
                return 12;
            }
            if (next > 12) {
                setYear((prevYear) => prevYear + 1);
                return 1;
            }
            return next;
        });
    }, []);

    const closeDialog = useCallback(() => {
        setSelectedDay(null);
    }, []);

    const openSession = useCallback(
        (sessionId: string) => {
            router.push(`/dashboard/trainer/my-batches/session/${sessionId}`);
        },
        [router]
    );

    const daysInMonth = new Date(year, month, 0).getDate();
    const leadingBlanks = new Date(year, month - 1, 1).getDay();
    const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year;
    const daySessions = selectedDay ? sessionsByDay.get(selectedDay) ?? [] : [];

    if (loadingBatchDetail && !batchDetail) {
        return (
            <TrainerDashboardLayout title="Batch">
                <Box sx={{ p: { xs: 1.5, sm: 2.5 }, display: "flex", flexDirection: "column", gap: 2 }}>
                    <Skeleton variant="rounded" height={120} />
                    <Skeleton variant="rounded" height={56} />
                    <Skeleton variant="rounded" height={320} />
                </Box>
            </TrainerDashboardLayout>
        );
    }

    if (!batchDetail) {
        return (
            <TrainerDashboardLayout title="Batch">
                <Box >
                    <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #f43f5e", py: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        <MdOutlineEventBusy size={38} color="#f43f5e" />
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#475569" }}>Batch not found</Typography>
                        <Button
                            variant="contained"
                            disableElevation
                            onClick={() => router.push("/dashboard/trainer/my-batches")}
                            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, backgroundColor: "#009DFF", "&:hover": { backgroundColor: "#007fd4" } }}
                        >
                            Back to my batches
                        </Button>
                    </Paper>
                </Box>
            </TrainerDashboardLayout>
        );
    }

    const timing = batchDetail.classTiming
        ?? [formatTime(batchDetail.classStartTime), formatTime(batchDetail.classEndTime)].filter((v) => v !== "--").join(" - ");

    return (
        <TrainerDashboardLayout title="Batch Details">
            <Box sx={{  display: "flex", flexDirection: "column", gap: { xs: 1.5, sm: 2.5 } }}>

                {/* Header */}
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 2,
                        border: "1px solid #0284c7",
                        background: "linear-gradient(120deg, #009DFF 0%, #0284c7 50%, #7c3aed 100%)",
                        color: "#ffffff",
                        p: { xs: 1.75, sm: 2.5 },
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.25,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton
                            size="small"
                            onClick={() => router.push("/dashboard/trainer/my-batches")}
                            sx={{ color: "#ffffff", border: "1px solid #ffffff", borderRadius: 1.5 }}
                        >
                            <MdArrowBack />
                        </IconButton>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontSize: { xs: 17, sm: 22 }, fontWeight: 800, lineHeight: 1.2 }} noWrap>
                                {batchDetail.batchName}
                            </Typography>
                            <Typography sx={{ fontSize: 12, fontWeight: 500 }} noWrap>
                                {batchDetail.course.courseName} · {batchDetail.branch.branchName}
                            </Typography>
                        </Box>
                        <Chip
                            size="small"
                            label={batchDetail.isActive ? "Active" : "Inactive"}
                            sx={{ backgroundColor: batchDetail.isActive ? "#10b981" : "#f43f5e", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }}
                        />
                    </Box>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: .75 }}>
                        <Chip size="small" icon={<MdOutlineGroups size={15} color="#ffffff" />} label={`${batchDetail.students.length} students`} sx={{ backgroundColor: "#0369a1", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }} />
                        <Chip size="small" icon={<MdOutlineCalendarMonth size={15} color="#ffffff" />} label={`${sessions.length} sessions`} sx={{ backgroundColor: "#6d28d9", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }} />
                        {batchDetail.mode && (
                            <Chip size="small" label={batchDetail.mode} sx={{ backgroundColor: "#0e7490", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }} />
                        )}
                        {batchDetail.classRoomNumber && (
                            <Chip size="small" icon={<MdOutlineLocationOn size={15} color="#ffffff" />} label={batchDetail.classRoomNumber} sx={{ backgroundColor: "#ea6e0b", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }} />
                        )}
                        {timing && (
                            <Chip size="small" icon={<MdOutlineWatchLater size={15} color="#ffffff" />} label={timing} sx={{ backgroundColor: "#d97706", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }} />
                        )}
                        <Chip size="small" label={`${formatDate(batchDetail.batchStartDate)} - ${formatDate(batchDetail.batchEndDate)}`} sx={{ backgroundColor: "#1e293b", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }} />
                        {batchDetail.batchLink && (
                            <Chip
                                size="small"
                                icon={<MdOutlineOpenInNew size={15} color="#ffffff" />}
                                label="Class link"
                                component="a"
                                href={batchDetail.batchLink}
                                target="_blank"
                                clickable
                                sx={{ backgroundColor: "#7c3aed", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }}
                            />
                        )}
                    </Box>
                </Paper>

                {/* Tabs */}
                <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #7c3aed", backgroundColor: "#ffffff" }}>
                    <Tabs
                        value={tab}
                        onChange={(_, next) => setTab(next)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            minHeight: 44,
                            "& .MuiTab-root": { minHeight: 44, textTransform: "none", fontWeight: 700, fontSize: 13 },
                            "& .Mui-selected": { color: "#7c3aed !important" },
                            "& .MuiTabs-indicator": { backgroundColor: "#7c3aed", height: 3 },
                        }}
                    >
                        <Tab icon={<MdOutlineEventAvailable size={16} />} iconPosition="start" label="Overview" />
                        <Tab icon={<MdOutlineCalendarMonth size={16} />} iconPosition="start" label="Calendar" />
                        <Tab icon={<MdOutlineGroups size={16} />} iconPosition="start" label={`Students (${batchDetail.students.length})`} />
                        <Tab icon={<MdOutlineAssignment size={16} />} iconPosition="start" label="Assignments" />
                    </Tabs>
                </Paper>

                {/* Month filter shared by overview + calendar */}
                {(tab === 0 || tab === 1) && (
                    <Paper
                        elevation={0}
                        sx={{ borderRadius: 2, border: "1px solid #0284c7", backgroundColor: "#ffffff", p: { xs: 1.25, sm: 1.5 }, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
                    >
                        <IconButton size="small" onClick={() => shiftMonth(-1)} sx={{ color: "#0284c7", border: "1px solid #0284c7", borderRadius: 1.5 }}>
                            <MdChevronLeft />
                        </IconButton>
                        <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#1e293b", minWidth: 130 }}>
                            {MONTHS[month - 1]} {year}
                        </Typography>
                        <IconButton size="small" onClick={() => shiftMonth(1)} sx={{ color: "#0284c7", border: "1px solid #0284c7", borderRadius: 1.5 }}>
                            <MdChevronRight />
                        </IconButton>
                        <Tooltip title="Jump to current month">
                            <IconButton
                                size="small"
                                onClick={() => { setMonth(today.getMonth() + 1); setYear(today.getFullYear()); }}
                                sx={{ color: "#7c3aed", border: "1px solid #7c3aed", borderRadius: 1.5 }}
                            >
                                <MdOutlineToday />
                            </IconButton>
                        </Tooltip>
                        <Box sx={{ flex: 1 }} />
                        <TextField select size="small" value={month} onChange={(e) => setMonth(Number(e.target.value))} sx={{ minWidth: 130 }}>
                            {MONTHS.map((name, index) => (
                                <MenuItem key={name} value={index + 1}>{name}</MenuItem>
                            ))}
                        </TextField>
                        <TextField select size="small" value={year} onChange={(e) => setYear(Number(e.target.value))} sx={{ minWidth: 100 }}>
                            {years.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </TextField>
                    </Paper>
                )}

                {/* Overview */}
                {tab === 0 && (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 sm:gap-3">
                            <StatTile label="Total" value={sessionStats?.totalSessions ?? 0} color="#009DFF" bg="#e0f2fe" icon={<MdOutlineCalendarMonth />} loading={loadingSessionStats} />
                            <StatTile label="Completed" value={sessionStats?.completed ?? 0} color="#059669" bg="#d1fae5" icon={<MdOutlineCheckCircle />} loading={loadingSessionStats} />
                            <StatTile label="Ongoing" value={sessionStats?.ongoing ?? 0} color="#06b6d4" bg="#cffafe" icon={<MdOutlinePlayCircle />} loading={loadingSessionStats} />
                            <StatTile label="Scheduled" value={sessionStats?.scheduled ?? 0} color="#0284c7" bg="#e0f2fe" icon={<MdOutlineEventAvailable />} loading={loadingSessionStats} />
                            <StatTile label="Pending" value={sessionStats?.notCompleted ?? 0} color="#ea6e0b" bg="#ffedd5" icon={<MdOutlinePendingActions />} loading={loadingSessionStats} />
                            <StatTile label="Rescheduled" value={sessionStats?.rescheduled ?? 0} color="#d97706" bg="#fef3c7" icon={<MdOutlineUpdate />} loading={loadingSessionStats} />
                            <StatTile label="Cancelled" value={sessionStats?.cancelled ?? 0} color="#f43f5e" bg="#ffe4e6" icon={<MdOutlineDoNotDisturbOn />} loading={loadingSessionStats} />
                        </div>

                        <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #009DFF", backgroundColor: "#ffffff", p: { xs: 1.5, sm: 2 } }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                                <Box sx={{ width: 30, height: 30, borderRadius: 1.5, backgroundColor: "#e0f2fe", color: "#009DFF", display: "grid", placeItems: "center", fontSize: 18 }}>
                                    <MdOutlineEventAvailable />
                                </Box>
                                <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#1e293b", flex: 1 }}>
                                    Upcoming Sessions
                                </Typography>
                                <Chip size="small" label={`${upcomingSessions.length}`} sx={{ backgroundColor: "#e0f2fe", color: "#0369a1", fontWeight: 700, border: "1px solid #0284c7" }} />
                            </Box>
                            <Divider sx={{ mb: 1.5 }} />

                            {upcomingSessions.length === 0 ? (
                                <Box sx={{ py: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1, color: "#64748b" }}>
                                    <MdOutlineEventBusy size={34} color="#94a3b8" />
                                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>No upcoming sessions</Typography>
                                </Box>
                            ) : (
                                <div className="grid gap-2">
                                    {upcomingSessions.map((session) => (
                                        <SessionRow
                                            key={session.batchSessionId}
                                            session={session}
                                            onOpen={() => openSession(session.batchSessionId)}
                                        />
                                    ))}
                                </div>
                            )}
                        </Paper>
                    </>
                )}

                {/* Calendar */}
                {tab === 1 && (
                    <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #009DFF", backgroundColor: "#ffffff", p: { xs: 1, sm: 1.5 }, position: "relative" }}>
                        {loadingBatchDetail && (
                            <LinearProgress sx={{ position: "absolute", top: 0, left: 0, right: 0, borderTopLeftRadius: 8, borderTopRightRadius: 8 }} />
                        )}

                        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
                            {WEEKDAYS.map((day) => (
                                <Box
                                    key={day}
                                    sx={{
                                        textAlign: "center",
                                        py: .5,
                                        borderRadius: 1,
                                        backgroundColor: "#f5f3ff",
                                        color: "#6d28d9",
                                        fontSize: { xs: 10, sm: 12 },
                                        fontWeight: 800,
                                        border: "1px solid #7c3aed",
                                    }}
                                >
                                    <span className="sm:hidden">{day.charAt(0)}</span>
                                    <span className="hidden sm:inline">{day}</span>
                                </Box>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                            {Array.from({ length: leadingBlanks }).map((_, index) => (
                                <Box key={`blank-${index}`} sx={{ minHeight: { xs: 68, sm: 100 }, borderRadius: 1, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }} />
                            ))}

                            {Array.from({ length: daysInMonth }).map((_, index) => {
                                const day = index + 1;
                                const items = sessionsByDay.get(day) ?? [];
                                const isToday = isCurrentMonth && today.getDate() === day;
                                const accent = items.length ? STATUS_STYLES[items[0].sessionStatus].color : "#e2e8f0";

                                return (
                                    <Box
                                        key={day}
                                        onClick={() => items.length && setSelectedDay(day)}
                                        sx={{
                                            minHeight: { xs: 68, sm: 100 },
                                            p: { xs: .75, sm: 1 },
                                            borderRadius: 1,
                                            border: `1px solid ${isToday ? "#009DFF" : accent}`,
                                            backgroundColor: isToday ? "#e0f2fe" : "#ffffff",
                                            cursor: items.length ? "pointer" : "default",
                                            transition: "box-shadow .2s ease, transform .2s ease",
                                            "&:hover": items.length ? { boxShadow: "0 6px 16px #dbeafe", transform: "translateY(-2px)" } : undefined,
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: .5,
                                            overflow: "hidden",
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <Typography sx={{ fontSize: { xs: 11, sm: 13 }, fontWeight: 800, color: isToday ? "#0369a1" : "#1e293b" }}>
                                                {day}
                                            </Typography>
                                            {items.length > 0 && (
                                                <Box sx={{ minWidth: 18, height: 18, px: .5, borderRadius: 1, backgroundColor: "#009DFF", color: "#ffffff", fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center" }}>
                                                    {items.length}
                                                </Box>
                                            )}
                                        </Box>

                                        {items.slice(0, 2).map((session) => {
                                            const style = STATUS_STYLES[session.sessionStatus];
                                            return (
                                                <Box
                                                    key={session.batchSessionId}
                                                    sx={{
                                                        px: .5,
                                                        py: .25,
                                                        borderRadius: .75,
                                                        backgroundColor: style.bg,
                                                        color: style.color,
                                                        border: `1px solid ${style.color}`,
                                                        fontSize: { xs: 9, sm: 10.5 },
                                                        fontWeight: 700,
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }}
                                                >
                                                    {formatTime(effectiveTime(session))}
                                                </Box>
                                            );
                                        })}

                                        {items.length > 2 && (
                                            <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#7c3aed" }}>
                                                +{items.length - 2} more
                                            </Typography>
                                        )}
                                    </Box>
                                );
                            })}
                        </div>
                    </Paper>
                )}

                {/* Students */}
                {tab === 2 && (
                    <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #10b981", backgroundColor: "#ffffff", p: { xs: 1.5, sm: 2 } }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
                            <Box sx={{ width: 30, height: 30, borderRadius: 1.5, backgroundColor: "#d1fae5", color: "#059669", display: "grid", placeItems: "center", fontSize: 18 }}>
                                <MdOutlineGroups />
                            </Box>
                            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#1e293b", flex: 1 }}>
                                Enrolled Students
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="Search student"
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                                sx={{ minWidth: { xs: "100%", sm: 220 } }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <MdOutlineSearch color="#059669" />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Box>
                        <Divider sx={{ mb: 1.5 }} />

                        {filteredStudents.length === 0 ? (
                            <Box sx={{ py: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1, color: "#64748b" }}>
                                <MdOutlineGroups size={34} color="#94a3b8" />
                                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>No students found</Typography>
                            </Box>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                {filteredStudents.map((student) => (
                                    <StudentRow key={student.batchStudentId} student={student} />
                                ))}
                            </div>
                        )}
                    </Paper>
                )}

                {/* Assignments */}
                {tab === 3 && <AssignmentsTab batchId={batchId} />}
            </Box>

            {/* Day / session dialog */}
            <Dialog
                open={selectedDay !== null}
                onClose={closeDialog}
                fullWidth
                maxWidth="sm"
                slotProps={{ paper: { sx: { borderRadius: 2, border: "1px solid #009DFF" } } }}
            >
                <DialogTitle
                    sx={{
                        background: "linear-gradient(120deg, #009DFF 0%, #7c3aed 100%)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        py: 1.25,
                        px: 2,
                    }}
                >
                    <MdOutlineCalendarMonth />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>
                            {selectedDay} {MONTHS[month - 1]} {year}
                        </Typography>
                        <Typography sx={{ fontSize: 11, fontWeight: 600 }}>
                            {`${daySessions.length} session${daySessions.length === 1 ? "" : "s"}`}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={closeDialog} sx={{ color: "#ffffff" }}>
                        <MdClose />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, pt: 1 }}>
                        {daySessions.map((session) => (
                            <SessionRow
                                key={session.batchSessionId}
                                session={session}
                                onOpen={() => openSession(session.batchSessionId)}
                            />
                        ))}
                    </Box>
                </DialogContent>
            </Dialog>
        </TrainerDashboardLayout>
    );
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
                <Box sx={{ width: 34, height: 34, flexShrink: 0, borderRadius: 1.5, backgroundColor: bg, color, display: "grid", placeItems: "center", fontSize: 20 }}>
                    {icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    {loading ? (
                        <Skeleton width={38} height={30} />
                    ) : (
                        <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.1, color }}>{value}</Typography>
                    )}
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: .3 }}>
                        {label}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
}

type SessionRowProps = {
    session: TrainerBatchSession;
    onOpen: () => void;
};

function SessionRow({ session, onOpen }: SessionRowProps) {
    const style = STATUS_STYLES[session.sessionStatus];

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 1.25, sm: 1.5 },
                borderRadius: 1.5,
                border: `1px solid ${style.color}`,
                transition: "box-shadow .2s ease",
                "&:hover": { boxShadow: `0 6px 16px ${style.bg}` },
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" },
                gap: 1.25,
            }}
        >
            <Box
                sx={{
                    minWidth: { sm: 92 },
                    borderRadius: 1.25,
                    backgroundColor: style.bg,
                    color: style.color,
                    px: 1,
                    py: .5,
                    display: "flex",
                    flexDirection: { xs: "row", sm: "column" },
                    alignItems: "center",
                    justifyContent: "center",
                    gap: .5,
                }}
            >
                <Typography sx={{ fontSize: 13, fontWeight: 800 }}>{formatDate(session.sessionDate)}</Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 700 }}>{formatTime(effectiveTime(session))}</Typography>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Chip
                    size="small"
                    label={style.label}
                    sx={{ height: 22, fontSize: 11, fontWeight: 700, backgroundColor: style.bg, color: style.color, border: `1px solid ${style.color}` }}
                />
                {session.sessionStartedAt && (
                    <Typography sx={{ fontSize: 11, color: "#64748b", mt: .5 }}>
                        Started {formatTime(session.sessionStartedAt)}
                        {session.sessionEndedAt ? ` · Ended ${formatTime(session.sessionEndedAt)}` : ""}
                    </Typography>
                )}
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
                <Button
                    size="small"
                    variant="contained"
                    disableElevation
                    onClick={onOpen}
                    startIcon={<MdOutlineOpenInNew />}
                    sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, backgroundColor: "#009DFF", "&:hover": { backgroundColor: "#007fd4" } }}
                >
                    Open Session
                </Button>
            </Box>
        </Paper>
    );
}

function StudentRow({ student }: { student: TrainerBatchStudent }) {
    const style = STUDENT_STATUS_STYLES[student.status] ?? STUDENT_STATUS_STYLES.active;

    return (
        <Paper
            elevation={0}
            sx={{
                p: 1.25,
                borderRadius: 1.5,
                border: `1px solid ${style.color}`,
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                transition: "box-shadow .2s ease",
                "&:hover": { boxShadow: `0 6px 16px ${style.bg}` },
            }}
        >
            <Box
                sx={{
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                    borderRadius: 1.5,
                    backgroundColor: style.bg,
                    color: style.color,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 14,
                    fontWeight: 800,
                }}
            >
                {student.studentName.charAt(0).toUpperCase()}
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b" }} noWrap>
                    {student.studentName}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap", color: "#64748B" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: .35 }}>
                        <MdOutlinePhone size={13} />
                        <Typography sx={{ fontSize: 11 }}>+{student.callingCode} {student.phoneNumber}</Typography>
                    </Box>
                    {student.email && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: .35, minWidth: 0 }}>
                            <MdOutlineMail size={13} />
                            <Typography sx={{ fontSize: 11 }} noWrap>{student.email}</Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: .5 }}>
                <Chip
                    size="small"
                    label={student.status}
                    sx={{ height: 22, fontSize: 11, fontWeight: 700, textTransform: "capitalize", backgroundColor: style.bg, color: style.color, border: `1px solid ${style.color}` }}
                />
                <Typography sx={{ fontSize: 10, color: "#94a3b8" }} className="hidden sm:block">
                    Joined {formatDate(student.enrolledAt)}
                </Typography>
            </Box>
        </Paper>
    );
}
