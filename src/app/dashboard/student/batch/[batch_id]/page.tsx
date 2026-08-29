"use client";
import React, { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { Box, Typography, Button, LinearProgress, Avatar, CircularProgress } from "@mui/material";
import {
    MdAccessTime,
    MdCalendarToday,
    MdLocationOn,
    MdPerson,
    MdClass,
    MdRemoveRedEye,
    MdDownload,
    MdOutlineAssignmentTurnedIn,
    MdOutlineQuestionAnswer,
} from "react-icons/md";
import RichTextView from "@/components/editor/RichTextView";
import { useStudent, type MyBatchQuery, type MyBatchRequest, type StudentBatchDetail } from "@/contexts/StudentContext";

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS: Record<string, string> = {
    sun: "Sunday", mon: "Monday", tue: "Tuesday", wed: "Wednesday",
    thu: "Thursday", fri: "Friday", sat: "Saturday",
};

const CARD_SX = {
    bgcolor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    p: 2,
} as const;

const STATUS_COLORS: Record<string, { fg: string; bg: string }> = {
    pending: { fg: "#f59e0b", bg: "#3a2c10" },
    approved: { fg: "#10b981", bg: "#0d2f26" },
    rejected: { fg: "#f43f5e", bg: "#3a1620" },
    resolved: { fg: "#10b981", bg: "#0d2f26" },
    closed: { fg: "#94a3b8", bg: "#1e2733" },
};

function StatusChip({ status }: { status: string }) {
    const tone = STATUS_COLORS[status] ?? { fg: "#94a3b8", bg: "#1e2733" };
    return (
        <Box
            component="span"
            sx={{
                bgcolor: tone.bg,
                color: tone.fg,
                border: `1px solid ${tone.fg}`,
                borderRadius: "999px",
                px: 1,
                py: 0.2,
                fontSize: "0.65rem",
                fontWeight: 700,
                textTransform: "capitalize",
                lineHeight: 1.6,
                flexShrink: 0,
            }}
        >
            {status}
        </Box>
    );
}

function ordinal(day: number): string {
    if (day > 3 && day < 21) return `${day}th`;
    switch (day % 10) {
        case 1: return `${day}st`;
        case 2: return `${day}nd`;
        case 3: return `${day}rd`;
        default: return `${day}th`;
    }
}

function formatLongDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return `${ordinal(date.getUTCDate())} ${MONTH_NAMES[date.getUTCMonth()]}, ${date.getUTCFullYear()}`;
}

/** Clock times are persisted as 1970-01-01T{HH:mm}Z, so they must be read in UTC. */
function formatClockTime(iso: string | null): string | null {
    const date = iso ? new Date(iso) : null;
    if (!date || Number.isNaN(date.getTime())) return null;
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

function formatMode(mode: string | null): string {
    const value = (mode ?? "").trim();
    return value ? value[0].toUpperCase() + value.slice(1).toLowerCase() : "Not specified";
}

function formatTimestamp(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return `${formatLongDate(iso)} • ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function buildBatchInfo(batch: StudentBatchDetail) {
    const start = formatClockTime(batch.classStartTime);
    const end = formatClockTime(batch.classEndTime);
    const timing = start && end ? `${start} - ${end}` : start ?? batch.classTiming;

    const days = batch.batchDays?.length
        ? batch.batchDays.map((d) => DAY_LABELS[d.trim().toLowerCase().slice(0, 3)] ?? d).join(" - ")
        : null;

    const trainerNames = batch.batchTrainers.map((item) => item.trainer.trainerName).join(", ");

    return [
        { icon: <MdAccessTime size={14} />, value: timing },
        { icon: <MdCalendarToday size={14} />, value: days },
        { icon: <MdLocationOn size={14} />, value: formatMode(batch.mode) },
        { icon: <MdPerson size={14} />, value: trainerNames || null },
        { icon: <MdClass size={14} />, value: batch.classRoomNumber },
    ].filter((row) => Boolean(row.value));
}

export default function BatchDetailPage() {
    const params = useParams();
    const batchId = params?.batch_id as string;
    const { batchDetail, loadingBatchDetail, getBatchDetails } = useStudent();

    useEffect(() => {
        if (batchId) getBatchDetails(batchId);
    }, [batchId, getBatchDetails]);

    const batch = batchDetail?.batchId === batchId ? batchDetail : null;
    const infoRows = useMemo(() => (batch ? buildBatchInfo(batch) : []), [batch]);

    if (loadingBatchDetail && !batch) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={24} sx={{ color: "#7c3aed" }} />
            </Box>
        );
    }

    if (!batch) {
        return (
            <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", textAlign: "center", py: 6 }}>
                Batch not found.
            </Typography>
        );
    }

    const { attendance } = batch;
    const trainers = batch.batchTrainers.map((item) => item.trainer);
    const requests: MyBatchRequest[] = batch.batchRequests ?? [];
    const queries: MyBatchQuery[] = batch.batchQueries ?? [];

    return (
        <Box sx={{
            display: "grid", gridTemplateColumns: {
                xs: "1fr", md: "3fr 2fr"
            }, gap: 1.5, alignItems: "flex-start", flexWrap: { xs: "wrap", lg: "nowrap" }
        }}>

            {/* ── Left Column ── */}
            <Box sx={{ flex: "1 1 55%", display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0 }}>

                {/* About Course */}
                <Box sx={CARD_SX}>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", mb: 1.5 }}>
                        About Batch
                    </Typography>
                    {batch.batchDescription ? (
                        <Box sx={{
                            fontSize: "0.78rem",
                            color: "rgba(255,255,255,0.68)",
                            lineHeight: 1.75,
                            "& p": { m: 0, mb: 1.25 },
                            "& p:last-child": { mb: 0 },
                            "& ul, & ol": { pl: 2.5, m: 0, mb: 1.25 },
                            "& li": { mb: 0.5 },
                            "& strong": { color: "#fff" },
                            "& a": { color: "#8b5cf6" },
                        }}>
                            <RichTextView html={batch.batchDescription} />
                        </Box>
                    ) : (
                        <Typography sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>
                            No description has been added for this batch yet.
                        </Typography>
                    )}
                </Box>

                {/* Course Syllabus */}
                <Box sx={{
                    background: "url('/batch-1.webp') no-repeat center center / cover",
                    borderRadius: "16px",
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    overflow: "hidden",
                    position: "relative",
                    minHeight: 160,
                }}>
                    {/* Soft glow */}
                    <Box sx={{
                        position: "absolute",
                        top: -30,
                        right: 60,
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }} />

                    <Box sx={{ zIndex: 1 }}>
                        <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", mb: 0.4 }}>
                            Course Syllabus
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.72)", mb: 1.5, maxWidth: 260 }}>
                            Get a complete overview of the course structure, topics, and timeline.
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            <Button
                                startIcon={<MdRemoveRedEye size={13} />}
                                sx={{
                                    bgcolor: "rgba(255, 255, 255, 0.99)",
                                    border: "1px solid rgba(255,255,255,0.22)",
                                    color: "#000",
                                    borderRadius: "4px",
                                    px: 1.5,
                                    py: 0.45,
                                    fontSize: "0.72rem",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                                }}
                            >
                                View Syllabus
                            </Button>
                            <Button
                                startIcon={<MdDownload size={13} />}
                                sx={{
                                    border: "1px solid rgba(255,255,255,0.22)",
                                    color: "#fff",
                                    borderRadius: "4px",
                                    px: 1.5,
                                    py: 0.45,
                                    fontSize: "0.72rem",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                                }}
                            >
                                Download Syllabus
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* My Enrollment Requests */}
                <Box sx={CARD_SX}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.25 }}>
                        <MdOutlineAssignmentTurnedIn size={16} color="#8b5cf6" />
                        <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>
                            Your Enrollment Requests
                        </Typography>
                    </Box>

                    {requests.length === 0 ? (
                        <Typography sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>
                            You have not raised any enrollment request for this batch.
                        </Typography>
                    ) : (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            {requests.map((req) => (
                                <Box
                                    key={req.batchRequestId}
                                    sx={{
                                        border: "1px solid rgba(255,255,255,0.08)",
                                        borderRadius: "10px",
                                        p: 1.25,
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                                        <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#fff" }}>
                                            {formatMode(req.modeRequested)} mode requested
                                        </Typography>
                                        <StatusChip status={req.requestStatus} />
                                    </Box>
                                    {req.requestReason && (
                                        <Typography sx={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.6, mb: 0.5 }}>
                                            {req.requestReason}
                                        </Typography>
                                    )}
                                    <Typography sx={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.38)" }}>
                                        Raised on {formatTimestamp(req.createdAt)}
                                        {req.updatedAt !== req.createdAt && ` • Updated ${formatTimestamp(req.updatedAt)}`}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>

                {/* My Queries */}
                <Box sx={CARD_SX}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.25 }}>
                        <MdOutlineQuestionAnswer size={16} color="#06b6d4" />
                        <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>
                            My Queries
                        </Typography>
                    </Box>

                    {queries.length === 0 ? (
                        <Typography sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>
                            You have not raised any query for this batch.
                        </Typography>
                    ) : (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            {queries.map((query) => (
                                <Box
                                    key={query.batchQueryId}
                                    sx={{
                                        border: "1px solid rgba(255,255,255,0.08)",
                                        borderRadius: "10px",
                                        p: 1.25,
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                                        <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#fff", textTransform: "capitalize" }}>
                                            {query.queryType}
                                        </Typography>
                                        <StatusChip status={query.queryStatus} />
                                    </Box>
                                    <Typography sx={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>
                                        {query.queryText}
                                    </Typography>

                                    {query.queryResponse ? (
                                        <Box sx={{ mt: 1, bgcolor: "rgba(6,182,212,0.08)", border: "1px solid #164e63", borderRadius: "8px", p: 1 }}>
                                            <Typography sx={{ fontSize: "0.66rem", fontWeight: 700, color: "#22d3ee", mb: 0.3 }}>
                                                Response
                                            </Typography>
                                            <Typography sx={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.78)", lineHeight: 1.6 }}>
                                                {query.queryResponse}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Typography sx={{ mt: 0.75, fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
                                            Awaiting a response from the team.
                                        </Typography>
                                    )}

                                    <Typography sx={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.38)", mt: 0.75 }}>
                                        Asked on {formatTimestamp(query.createdAt)}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>

            {/* ── Right Column ── */}
            <Box sx={{ flex: "1 1 40%", display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0 }}>

                {/* Batch Info */}
                <Box sx={CARD_SX}>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", mb: 1.5 }}>
                        Batch Info
                    </Typography>

                    {/* Start / End dates */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.5 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", mb: 0.3 }}>Starting at</Typography>
                            <Box sx={{ borderRadius: "18px", px: 1, py: 0.6, textAlign: "center" }} className="chip-bg">
                                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#fff" }}>
                                    {formatLongDate(batch.batchStartDate)}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: "flex", gap: "3px", alignItems: "center", pt: 1, flexShrink: 0 }}>
                            {[0, 1, 2].map((i) => (
                                <Box key={i} sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.25)" }} />
                            ))}
                        </Box>

                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", mb: 0.3 }}>Ending at</Typography>
                            <Box sx={{ borderRadius: "18px", px: 1, py: 0.6, textAlign: "center" }} className="chip-bg">
                                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#fff" }}>
                                    {formatLongDate(batch.batchEndDate)}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Detail rows */}
                    <Box sx={{ display: "grid", gridTemplateColumns:"1fr 1fr", gap: 0, border: "1px dashed rgba(255, 255, 255, 0.3)", padding: 1, borderRadius: "8px" }}>
                        {infoRows.map(({ icon, value }, i) => (
                            <Box
                                key={i}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    py: 0.7,
                                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                                }}
                            >
                                <Box sx={{ color: "rgba(255,255,255,0.38)", display: "flex", flexShrink: 0 }}>
                                    {icon}
                                </Box>
                                <Typography sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.78)" }}>
                                    {value}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Instructors */}
                <Box sx={CARD_SX}>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", mb: 1.25 }}>
                        Instructors
                    </Typography>
                    {trainers.length === 0 ? (
                        <Typography sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>
                            No trainer has been assigned yet.
                        </Typography>
                    ) : (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            {trainers.map((trainer) => (
                                <Box
                                    key={trainer.trainerId}
                                    sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "space-between" }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                                        <Avatar sx={{ width: 30, height: 30, fontSize: "0.7rem", fontWeight: 700, bgcolor: "#1e40af", flexShrink: 0 }}>
                                            {getInitials(trainer.trainerName)}
                                        </Avatar>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography noWrap sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#fff", lineHeight: 1.3 }}>
                                                {trainer.trainerName}
                                            </Typography>
                                            <Typography noWrap sx={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.42)" }}>
                                                {trainer.email ?? `+${trainer.callingCode} ${trainer.phoneNumber}`}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Button
                                        size="small"
                                        startIcon={<MdRemoveRedEye size={11} />}
                                        sx={{
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            color: "rgba(255,255,255,0.7)",
                                            borderRadius: "4px",
                                            px: 1.1,
                                            py: 0.35,
                                            fontSize: "0.68rem",
                                            textTransform: "none",
                                            flexShrink: 0,
                                            whiteSpace: "nowrap",
                                            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                                        }}
                                    >
                                        View Full Profile
                                    </Button>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>

                {/* Attendance */}
                <Box sx={CARD_SX}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25 }}>
                        <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>
                            Attendance
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: "0.7rem",
                                color: "#6b8fff",
                                cursor: "pointer",
                                "&:hover": { textDecoration: "underline" },
                            }}
                        >
                            View Full Attendance
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, mb: 1 }}>
                        <Typography sx={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                            {attendance.attendancePercentage}%
                        </Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }}>
                            {attendance.attendedSessions}/{attendance.totalSessionsHeld} Classes Attended
                        </Typography>
                    </Box>

                    <LinearProgress
                        variant="determinate"
                        value={attendance.attendancePercentage}
                        sx={{
                            height: 7,
                            borderRadius: 4,
                            bgcolor: "rgba(255,255,255,0.08)",
                            "& .MuiLinearProgress-bar": {
                                borderRadius: 4,
                                background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                            },
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
}
