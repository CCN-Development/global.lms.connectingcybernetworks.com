"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TrainerDashboardLayout from "@/layouts/TrainerDashboardLayout";
import { useTrainer, type SessionStatus, type TrainerSessionStudent } from "@/contexts/TrainerContext";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    LinearProgress,
    Paper,
    Skeleton,
    Snackbar,
    TextField,
    Typography,
} from "@mui/material";
import {
    MdArrowBack,
    MdOutlineCalendarMonth,
    MdOutlineCheckCircle,
    MdOutlineErrorOutline,
    MdOutlineGroups,
    MdOutlineHighlightOff,
    MdOutlineLocationOn,
    MdOutlineOpenInNew,
    MdOutlinePlayCircle,
    MdOutlineSearch,
    MdOutlineStopCircle,
    MdOutlineWatchLater,
} from "react-icons/md";

const STATUS_STYLES: Record<SessionStatus, { label: string; color: string; bg: string }> = {
    scheduled: { label: "Scheduled", color: "#0284c7", bg: "#e0f2fe" },
    ongoing: { label: "Live now", color: "#059669", bg: "#d1fae5" },
    completed: { label: "Completed", color: "#7c3aed", bg: "#ede9fe" },
    cancelled: { label: "Cancelled", color: "#f43f5e", bg: "#ffe4e6" },
    rescheduled: { label: "Rescheduled", color: "#d97706", bg: "#fef3c7" },
};

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatTime(value: string | null) {
    if (!value) return "--";
    return new Date(value).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function TrainerSessionPage() {
    const router = useRouter();
    const params = useParams<{ session_id: string }>();
    const sessionId = params?.session_id as string;

    const {
        sessionDetail,
        loadingSessionDetail,
        updatingSession,
        markingAttendance,
        getSessionDetails,
        startSession,
        endSession,
        markAttendance,
        clearSessionDetail,
    } = useTrainer();

    const [search, setSearch] = useState("");
    const [busyStudentId, setBusyStudentId] = useState<string | null>(null);
    const [confirmEnd, setConfirmEnd] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

    useEffect(() => {
        if (sessionId) getSessionDetails(sessionId);
        return () => clearSessionDetail();
    }, [sessionId, getSessionDetails, clearSessionDetail]);

    const isOngoing = sessionDetail?.sessionStatus === "ongoing";
    const canStart = sessionDetail?.sessionStatus === "scheduled" || sessionDetail?.sessionStatus === "rescheduled";

    const students = useMemo(() => sessionDetail?.students ?? [], [sessionDetail]);

    const filteredStudents = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return students;
        return students.filter(
            (student) =>
                student.studentName.toLowerCase().includes(term) ||
                student.phoneNumber.includes(term) ||
                (student.email ?? "").toLowerCase().includes(term)
        );
    }, [students, search]);

    const unmarkedCount = students.filter((student) => !student.isAttendanceMarked).length;
    const markedPercent = students.length
        ? Math.round(((students.length - unmarkedCount) / students.length) * 100)
        : 0;

    const handleStart = useCallback(async () => {
        const res = await startSession(sessionId);
        setFeedback({ type: res.success ? "success" : "error", message: res.message ?? "Something went wrong" });
        if (res.success) getSessionDetails(sessionId);
    }, [startSession, sessionId, getSessionDetails]);

    const handleEnd = useCallback(async () => {
        setConfirmEnd(false);
        const res = await endSession(sessionId);
        if (res.success) {
            const auto = res.data?.autoMarkedAbsent ?? 0;
            setFeedback({
                type: "success",
                message: auto > 0
                    ? `Session ended · ${auto} unmarked student${auto === 1 ? "" : "s"} marked absent`
                    : "Session ended successfully",
            });
            getSessionDetails(sessionId);
        } else {
            setFeedback({ type: "error", message: res.message ?? "Failed to end session" });
        }
    }, [endSession, sessionId, getSessionDetails]);

    const handleAttendance = useCallback(
        async (studentId: string, isPresent: boolean) => {
            setBusyStudentId(studentId);
            const res = await markAttendance(sessionId, studentId, isPresent);
            setBusyStudentId(null);
            if (!res.success) setFeedback({ type: "error", message: res.message ?? "Failed to mark attendance" });
        },
        [markAttendance, sessionId]
    );

    if (loadingSessionDetail && !sessionDetail) {
        return (
            <TrainerDashboardLayout title="Session">
                <Box sx={{ p: { xs: 1.5, sm: 2.5 }, display: "flex", flexDirection: "column", gap: 2 }}>
                    <Skeleton variant="rounded" height={140} />
                    <Skeleton variant="rounded" height={80} />
                    <Skeleton variant="rounded" height={320} />
                </Box>
            </TrainerDashboardLayout>
        );
    }

    if (!sessionDetail) {
        return (
            <TrainerDashboardLayout title="Session">
                <Box sx={{ p: 2.5 }}>
                    <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #f43f5e", py: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        <MdOutlineErrorOutline size={38} color="#f43f5e" />
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#475569" }}>Session not found</Typography>
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

    const style = STATUS_STYLES[sessionDetail.sessionStatus];
    const joinLink = sessionDetail.sessionLink ?? sessionDetail.batch.batchLink;
    const time = sessionDetail.isRescheduled && sessionDetail.rescheduledTime
        ? sessionDetail.rescheduledTime
        : sessionDetail.sessionTime;
    const date = sessionDetail.isRescheduled && sessionDetail.rescheduledDate
        ? sessionDetail.rescheduledDate
        : sessionDetail.sessionDate;

    return (
        <TrainerDashboardLayout title="Session">
            <Box sx={{ p: { xs: 1.5, sm: 2.5 }, display: "flex", flexDirection: "column", gap: { xs: 1.5, sm: 2.5 } }}>

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
                            onClick={() => router.push(`/dashboard/trainer/my-batches/${sessionDetail.batchId}`)}
                            sx={{ color: "#ffffff", border: "1px solid #ffffff", borderRadius: 1.5 }}
                        >
                            <MdArrowBack />
                        </IconButton>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontSize: { xs: 17, sm: 22 }, fontWeight: 800, lineHeight: 1.2 }} noWrap>
                                {sessionDetail.batch.batchName}
                            </Typography>
                            <Typography sx={{ fontSize: 12, fontWeight: 500 }} noWrap>
                                {sessionDetail.batch.course.courseName}
                            </Typography>
                        </Box>
                        <Chip
                            size="small"
                            label={style.label}
                            sx={{ backgroundColor: style.color, color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }}
                        />
                    </Box>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: .75 }}>
                        <Chip size="small" icon={<MdOutlineCalendarMonth size={15} color="#ffffff" />} label={formatDate(date)} sx={{ backgroundColor: "#0369a1", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }} />
                        <Chip size="small" icon={<MdOutlineWatchLater size={15} color="#ffffff" />} label={formatTime(time)} sx={{ backgroundColor: "#6d28d9", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }} />
                        <Chip size="small" icon={<MdOutlineGroups size={15} color="#ffffff" />} label={`${sessionDetail.totalStudents} students`} sx={{ backgroundColor: "#0e7490", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }} />
                        {sessionDetail.batch.mode && (
                            <Chip size="small" label={sessionDetail.batch.mode} sx={{ backgroundColor: "#1e293b", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }} />
                        )}
                        {sessionDetail.batch.classRoomNumber && (
                            <Chip size="small" icon={<MdOutlineLocationOn size={15} color="#ffffff" />} label={sessionDetail.batch.classRoomNumber} sx={{ backgroundColor: "#ea6e0b", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }} />
                        )}
                        {sessionDetail.sessionStartedAt && (
                            <Chip size="small" label={`Started ${formatTime(sessionDetail.sessionStartedAt)}`} sx={{ backgroundColor: "#059669", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }} />
                        )}
                        {sessionDetail.sessionEndedAt && (
                            <Chip size="small" label={`Ended ${formatTime(sessionDetail.sessionEndedAt)}`} sx={{ backgroundColor: "#f43f5e", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }} />
                        )}
                    </Box>
                </Paper>

                {/* Actions + attendance summary */}
                <Paper
                    elevation={0}
                    sx={{ borderRadius: 2, border: `1px solid ${style.color}`, backgroundColor: "#ffffff", p: { xs: 1.5, sm: 2 }, display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
                        {canStart && (
                            <Button
                                variant="contained"
                                disableElevation
                                disabled={updatingSession}
                                onClick={handleStart}
                                startIcon={updatingSession ? <CircularProgress size={16} color="inherit" /> : <MdOutlinePlayCircle />}
                                sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, backgroundColor: "#009DFF", "&:hover": { backgroundColor: "#007fd4" } }}
                            >
                                Start Session
                            </Button>
                        )}
                        {isOngoing && (
                            <Button
                                variant="contained"
                                disableElevation
                                disabled={updatingSession}
                                onClick={() => setConfirmEnd(true)}
                                startIcon={updatingSession ? <CircularProgress size={16} color="inherit" /> : <MdOutlineStopCircle />}
                                sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, backgroundColor: "#f43f5e", "&:hover": { backgroundColor: "#e11d48" } }}
                            >
                                End Session
                            </Button>
                        )}
                        {joinLink && (
                            <Button
                                variant="outlined"
                                href={joinLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                startIcon={<MdOutlineOpenInNew />}
                                sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, borderColor: "#7c3aed", color: "#7c3aed", "&:hover": { borderColor: "#6d28d9", backgroundColor: "#ede9fe" } }}
                            >
                                Join Class
                            </Button>
                        )}

                        <Box sx={{ flex: 1 }} />

                        <Chip size="small" icon={<MdOutlineCheckCircle size={15} color="#059669" />} label={`${sessionDetail.presentCount} present`} sx={{ fontWeight: 700, backgroundColor: "#d1fae5", color: "#059669", border: "1px solid #10b981" }} />
                        <Chip size="small" icon={<MdOutlineHighlightOff size={15} color="#f43f5e" />} label={`${sessionDetail.absentCount} absent`} sx={{ fontWeight: 700, backgroundColor: "#ffe4e6", color: "#f43f5e", border: "1px solid #f43f5e" }} />
                        <Chip size="small" label={`${unmarkedCount} unmarked`} sx={{ fontWeight: 700, backgroundColor: "#ffedd5", color: "#ea6e0b", border: "1px solid #f97316" }} />
                    </Box>

                    <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: .5 }}>
                            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Attendance marked</Typography>
                            <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#059669" }}>{markedPercent}%</Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={markedPercent}
                            sx={{ height: 6, borderRadius: 3, backgroundColor: "#e2e8f0", "& .MuiLinearProgress-bar": { backgroundColor: "#10b981", borderRadius: 3 } }}
                        />
                    </Box>

                    {!isOngoing && (
                        <Alert
                            severity={sessionDetail.sessionStatus === "completed" ? "info" : "warning"}
                            icon={<MdOutlineErrorOutline />}
                            sx={{ borderRadius: 1.5, border: "1px solid #f59e0b", backgroundColor: "#fef3c7", color: "#92400e", fontWeight: 600, fontSize: 12.5 }}
                        >
                            {sessionDetail.sessionStatus === "completed"
                                ? "This session is completed. Attendance is locked."
                                : "Start the session to begin marking attendance."}
                        </Alert>
                    )}
                </Paper>

                {/* Students */}
                <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #10b981", backgroundColor: "#ffffff", p: { xs: 1.5, sm: 2 } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
                        <Box sx={{ width: 30, height: 30, borderRadius: 1.5, backgroundColor: "#d1fae5", color: "#059669", display: "grid", placeItems: "center", fontSize: 18 }}>
                            <MdOutlineGroups />
                        </Box>
                        <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#1e293b", flex: 1 }}>
                            Students ({students.length})
                        </Typography>
                        <TextField
                            size="small"
                            placeholder="Search student"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
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
                                <StudentAttendanceRow
                                    key={student.studentId}
                                    student={student}
                                    canMark={isOngoing}
                                    busy={busyStudentId === student.studentId}
                                    disabled={markingAttendance}
                                    onMark={(isPresent) => handleAttendance(student.studentId, isPresent)}
                                />
                            ))}
                        </div>
                    )}
                </Paper>
            </Box>

            <Dialog
                open={confirmEnd}
                onClose={() => setConfirmEnd(false)}
                fullWidth
                maxWidth="xs"
                slotProps={{ paper: { sx: { borderRadius: 2, border: "1px solid #f43f5e" } } }}
            >
                <DialogTitle sx={{ backgroundColor: "#ffe4e6", color: "#f43f5e", fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", gap: 1 }}>
                    <MdOutlineStopCircle />
                    End this session?
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Typography sx={{ fontSize: 13, color: "#475569", mt: 1 }}>
                        {unmarkedCount > 0
                            ? `${unmarkedCount} student${unmarkedCount === 1 ? " is" : "s are"} still unmarked and will be recorded as absent. Attendance cannot be changed after ending.`
                            : "Attendance cannot be changed after the session is ended."}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 2 }}>
                    <Button
                        onClick={() => setConfirmEnd(false)}
                        sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, color: "#64748b" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        disableElevation
                        onClick={handleEnd}
                        sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, backgroundColor: "#f43f5e", "&:hover": { backgroundColor: "#e11d48" } }}
                    >
                        End Session
                    </Button>
                </DialogActions>
            </Dialog>

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

type StudentAttendanceRowProps = {
    student: TrainerSessionStudent;
    canMark: boolean;
    busy: boolean;
    disabled: boolean;
    onMark: (isPresent: boolean) => void;
};

function StudentAttendanceRow({ student, canMark, busy, disabled, onMark }: StudentAttendanceRowProps) {
    const isPresent = student.isAttendanceMarked && student.isPresent;
    const isAbsent = student.isAttendanceMarked && !student.isPresent;
    const accent = isPresent ? "#10b981" : isAbsent ? "#f43f5e" : "#cbd5e1";
    const accentBg = isPresent ? "#d1fae5" : isAbsent ? "#ffe4e6" : "#f1f5f9";

    return (
        <Paper
            elevation={0}
            sx={{
                p: 1.25,
                borderRadius: 1.5,
                border: `1px solid ${accent}`,
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                transition: "box-shadow .2s ease",
                "&:hover": { boxShadow: `0 6px 16px ${accentBg}` },
            }}
        >
            <Box
                sx={{
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                    borderRadius: 1.5,
                    backgroundColor: accentBg,
                    color: isPresent ? "#059669" : isAbsent ? "#f43f5e" : "#64748b",
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
                <Typography sx={{ fontSize: 11, color: "#64748b" }} noWrap>
                    +{student.callingCode} {student.phoneNumber}
                </Typography>
            </Box>

            {busy ? (
                <CircularProgress size={18} />
            ) : canMark ? (
                <Box sx={{ display: "flex", gap: .5, flexShrink: 0 }}>
                    <Button
                        size="small"
                        variant={isPresent ? "contained" : "outlined"}
                        disableElevation
                        disabled={disabled}
                        onClick={() => onMark(true)}
                        sx={{
                            minWidth: 0,
                            px: 1.25,
                            textTransform: "none",
                            fontWeight: 700,
                            borderRadius: 1.5,
                            borderColor: "#10b981",
                            color: isPresent ? "#ffffff" : "#059669",
                            backgroundColor: isPresent ? "#10b981" : "transparent",
                            "&:hover": { backgroundColor: "#059669", borderColor: "#059669", color: "#ffffff" },
                        }}
                    >
                        Present
                    </Button>
                    <Button
                        size="small"
                        variant={isAbsent ? "contained" : "outlined"}
                        disableElevation
                        disabled={disabled}
                        onClick={() => onMark(false)}
                        sx={{
                            minWidth: 0,
                            px: 1.25,
                            textTransform: "none",
                            fontWeight: 700,
                            borderRadius: 1.5,
                            borderColor: "#f43f5e",
                            color: isAbsent ? "#ffffff" : "#f43f5e",
                            backgroundColor: isAbsent ? "#f43f5e" : "transparent",
                            "&:hover": { backgroundColor: "#e11d48", borderColor: "#e11d48", color: "#ffffff" },
                        }}
                    >
                        Absent
                    </Button>
                </Box>
            ) : (
                <Chip
                    size="small"
                    label={isPresent ? "Present" : isAbsent ? "Absent" : "Not marked"}
                    sx={{
                        fontWeight: 700,
                        backgroundColor: accentBg,
                        color: isPresent ? "#059669" : isAbsent ? "#f43f5e" : "#64748b",
                        border: `1px solid ${accent}`,
                    }}
                />
            )}
        </Paper>
    );
}
