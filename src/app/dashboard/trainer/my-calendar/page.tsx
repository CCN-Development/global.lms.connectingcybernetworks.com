"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TrainerDashboardLayout from "@/layouts/TrainerDashboardLayout";
import {
    useTrainer,
    type SessionStatus,
    type TrainerSessionListItem,
} from "@/contexts/TrainerContext";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    LinearProgress,
    MenuItem,
    Paper,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    MdChevronLeft,
    MdChevronRight,
    MdClose,
    MdOutlineCalendarMonth,
    MdOutlineEventBusy,
    MdOutlineGroups,
    MdOutlineLocationOn,
    MdOutlineOpenInNew,
    MdOutlineToday,
} from "react-icons/md";

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

function formatTime(value: string | null) {
    if (!value) return "--";
    return new Date(value).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

function effectiveTime(session: { isRescheduled: boolean; rescheduledTime: string | null; sessionTime: string }) {
    return session.isRescheduled && session.rescheduledTime ? session.rescheduledTime : session.sessionTime;
}

export default function TrainerCalendarPage() {
    const router = useRouter();
    const { sessions, batches, loadingSessions, getSessions, getBatches } = useTrainer();

    const today = useMemo(() => new Date(), []);
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());
    const [batchId, setBatchId] = useState<string>("");
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const years = useMemo(() => {
        const current = today.getFullYear();
        return [current - 2, current - 1, current, current + 1];
    }, [today]);

    useEffect(() => {
        getBatches();
    }, [getBatches]);

    useEffect(() => {
        getSessions({ month, year, batchId: batchId || undefined });
    }, [getSessions, month, year, batchId]);

    /** Sessions grouped by the day-of-month of their scheduled date. */
    const sessionsByDay = useMemo(() => {
        const map = new Map<number, TrainerSessionListItem[]>();
        (sessions?.sessions ?? []).forEach((session) => {
            const day = new Date(session.sessionDate).getDate();
            const bucket = map.get(day);
            if (bucket) bucket.push(session);
            else map.set(day, [session]);
        });
        map.forEach((list) =>
            list.sort(
                (a, b) =>
                    new Date(effectiveTime(a)).getTime() - new Date(effectiveTime(b)).getTime()
            )
        );
        return map;
    }, [sessions]);

    const daysInMonth = new Date(year, month, 0).getDate();
    const leadingBlanks = new Date(year, month - 1, 1).getDay();
    const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year;

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

    const goToToday = useCallback(() => {
        setMonth(today.getMonth() + 1);
        setYear(today.getFullYear());
    }, [today]);

    const closeDialog = useCallback(() => {
        setSelectedDay(null);
    }, []);

    const openSession = useCallback(
        (sessionId: string) => {
            router.push(`/dashboard/trainer/my-batches/session/${sessionId}`);
        },
        [router]
    );

    const daySessions = selectedDay ? sessionsByDay.get(selectedDay) ?? [] : [];

    return (
        <TrainerDashboardLayout title="My Calendar">
            <Box sx={{display: "flex", flexDirection: "column", gap: { xs: 1.5, sm: 2.5 } }}>

                {/* Filter bar */}
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 2,
                        border: "1px solid #0284c7",
                        background: "linear-gradient(120deg, #009DFF 0%, #0284c7 50%, #7c3aed 100%)",
                        color: "#ffffff",
                        p: { xs: 1.5, sm: 2 },
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.5,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton size="small" onClick={() => shiftMonth(-1)} sx={{ color: "#ffffff", border: "1px solid #ffffff", borderRadius: 1.5 }}>
                            <MdChevronLeft />
                        </IconButton>
                        <Box>
                            <Typography sx={{ fontSize: { xs: 16, sm: 20 }, fontWeight: 800, lineHeight: 1.2 }}>
                                {MONTHS[month - 1]} {year}
                            </Typography>
                            <Typography sx={{ fontSize: 11, fontWeight: 600 }}>
                                {sessions?.totalSessions ?? 0} sessions this month
                            </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => shiftMonth(1)} sx={{ color: "#ffffff", border: "1px solid #ffffff", borderRadius: 1.5 }}>
                            <MdChevronRight />
                        </IconButton>
                        <Tooltip title="Jump to current month">
                            <IconButton size="small" onClick={goToToday} sx={{ color: "#ffffff", border: "1px solid #ffffff", borderRadius: 1.5 }}>
                                <MdOutlineToday />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <TextField
                            select
                            size="small"
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            sx={{ minWidth: 130, backgroundColor: "#ffffff", borderRadius: 1.5 }}
                        >
                            {MONTHS.map((name, index) => (
                                <MenuItem key={name} value={index + 1}>{name}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            size="small"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            sx={{ minWidth: 100, backgroundColor: "#ffffff", borderRadius: 1.5 }}
                        >
                            {years.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            size="small"
                            value={batchId}
                            onChange={(e) => setBatchId(e.target.value)}
                            sx={{ minWidth: 170, backgroundColor: "#ffffff", borderRadius: 1.5 }}
                        >
                            <MenuItem value="">All batches</MenuItem>
                            {batches.map((batch) => (
                                <MenuItem key={batch.batchId} value={batch.batchId}>{batch.batchName}</MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </Paper>

                {/* Legend */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {(Object.keys(STATUS_STYLES) as SessionStatus[]).map((key) => (
                        <Chip
                            key={key}
                            size="small"
                            label={STATUS_STYLES[key].label}
                            sx={{
                                height: 24,
                                fontSize: 11,
                                fontWeight: 700,
                                backgroundColor: STATUS_STYLES[key].bg,
                                color: STATUS_STYLES[key].color,
                                border: `1px solid ${STATUS_STYLES[key].color}`,
                            }}
                        />
                    ))}
                </Box>

                {/* Calendar */}
                <Paper
                    elevation={0}
                    sx={{ borderRadius: 2, border: "1px solid #009DFF", backgroundColor: "#ffffff", p: { xs: 1, sm: 1.5 }, position: "relative" }}
                >
                    {loadingSessions && (
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
                            <Box key={`blank-${index}`} sx={{ minHeight: { xs: 68, sm: 104 }, borderRadius: 1, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }} />
                        ))}

                        {Array.from({ length: daysInMonth }).map((_, index) => {
                            const day = index + 1;
                            const items = sessionsByDay.get(day) ?? [];
                            const isToday = isCurrentMonth && today.getDate() === day;
                            const accent = items.length
                                ? STATUS_STYLES[items[0].sessionStatus].color
                                : "#e2e8f0";

                            return (
                                <Box
                                    key={day}
                                    onClick={() => items.length && setSelectedDay(day)}
                                    sx={{
                                        minHeight: { xs: 68, sm: 104 },
                                        p: { xs: .75, sm: 1 },
                                        borderRadius: 1,
                                        border: `1px solid ${isToday ? "#009DFF" : accent}`,
                                        backgroundColor: isToday ? "#e0f2fe" : "#ffffff",
                                        cursor: items.length ? "pointer" : "default",
                                        transition: "box-shadow .2s ease, transform .2s ease",
                                        "&:hover": items.length
                                            ? { boxShadow: "0 6px 16px #dbeafe", transform: "translateY(-2px)" }
                                            : undefined,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: .5,
                                        overflow: "hidden",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <Typography
                                            sx={{
                                                fontSize: { xs: 11, sm: 13 },
                                                fontWeight: 800,
                                                color: isToday ? "#0369a1" : "#1e293b",
                                            }}
                                        >
                                            {day}
                                        </Typography>
                                        {items.length > 0 && (
                                            <Box
                                                sx={{
                                                    minWidth: 18,
                                                    height: 18,
                                                    px: .5,
                                                    borderRadius: 1,
                                                    backgroundColor: "#009DFF",
                                                    color: "#ffffff",
                                                    fontSize: 10,
                                                    fontWeight: 800,
                                                    display: "grid",
                                                    placeItems: "center",
                                                }}
                                            >
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
                                                <span className="hidden sm:inline"> · {session.batch.batchName}</span>
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
                        {daySessions.length === 0 ? (
                            <Box sx={{ py: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1, color: "#64748b" }}>
                                <MdOutlineEventBusy size={34} color="#94a3b8" />
                                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>No sessions on this day</Typography>
                            </Box>
                        ) : (
                            daySessions.map((session) => {
                                const style = STATUS_STYLES[session.sessionStatus];
                                return (
                                    <Paper
                                        key={session.batchSessionId}
                                        elevation={0}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 1.5,
                                            border: `1px solid ${style.color}`,
                                            transition: "box-shadow .2s ease",
                                            "&:hover": { boxShadow: `0 6px 16px ${style.bg}` },
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: .75 }}>
                                            <Chip
                                                size="small"
                                                label={formatTime(effectiveTime(session))}
                                                sx={{ height: 22, fontSize: 11, fontWeight: 800, backgroundColor: style.bg, color: style.color, border: `1px solid ${style.color}` }}
                                            />
                                            <Chip
                                                size="small"
                                                label={style.label}
                                                sx={{ height: 22, fontSize: 11, fontWeight: 700, backgroundColor: style.bg, color: style.color, border: `1px solid ${style.color}` }}
                                            />
                                            <Box sx={{ flex: 1 }} />
                                            <Chip
                                                size="small"
                                                icon={<MdOutlineGroups size={14} color="#0369a1" />}
                                                label={session.attendanceMarkedCount}
                                                sx={{ height: 22, fontSize: 11, fontWeight: 700, backgroundColor: "#e0f2fe", color: "#0369a1", border: "1px solid #0284c7" }}
                                            />
                                        </Box>

                                        <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#1e293b" }} noWrap>
                                            {session.batch.batchName}
                                        </Typography>
                                        <Typography sx={{ fontSize: 12, color: "#64748b" }} noWrap>
                                            {session.batch.course.courseName}
                                        </Typography>

                                        <Box sx={{ display: "flex", alignItems: "center", gap: .75, mt: 1, flexWrap: "wrap" }}>
                                            {session.batch.mode && (
                                                <Chip size="small" label={session.batch.mode} sx={{ height: 22, fontSize: 11, fontWeight: 600, backgroundColor: "#ede9fe", color: "#6d28d9", border: "1px solid #7c3aed" }} />
                                            )}
                                            {session.batch.classRoomNumber && (
                                                <Chip size="small" icon={<MdOutlineLocationOn size={14} color="#ea6e0b" />} label={session.batch.classRoomNumber} sx={{ height: 22, fontSize: 11, fontWeight: 600, backgroundColor: "#ffedd5", color: "#ea6e0b", border: "1px solid #f97316" }} />
                                            )}
                                            <Box sx={{ flex: 1 }} />
                                            <Button
                                                size="small"
                                                variant="contained"
                                                disableElevation
                                                onClick={() => openSession(session.batchSessionId)}
                                                startIcon={<MdOutlineOpenInNew />}
                                                sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, backgroundColor: "#009DFF", "&:hover": { backgroundColor: "#007fd4" } }}
                                            >
                                                Open Session
                                            </Button>
                                        </Box>
                                    </Paper>
                                );
                            })
                        )}
                    </Box>
                </DialogContent>
            </Dialog>
        </TrainerDashboardLayout>
    );
}
