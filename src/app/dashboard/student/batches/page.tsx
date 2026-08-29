"use client";
import { useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import BatchCard from "@/components/batches/BatchCard";
import { useRouter } from "next/navigation";
import { useStudent, type EnrolledBatch } from "@/contexts/StudentContext";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function normalizeMode(mode: string | null): "Online" | "Offline" | "Hybrid" {
    const value = (mode ?? "").trim().toLowerCase();
    if (value === "offline") return "Offline";
    if (value === "hybrid") return "Hybrid";
    return "Online";
}

/** Session dates/times are persisted in UTC, so they must be read in UTC. */
function formatClockTime(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

function daysFromToday(iso: string): number | null {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    const now = new Date();
    const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const target = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return Math.round((target - today) / 86400000);
}

function formatSessionTiming(session: EnrolledBatch["nextSession"]): string {
    if (!session) return "No upcoming session";
    const offset = daysFromToday(session.sessionDate);
    const date = new Date(session.sessionDate);
    const day = offset === 0
        ? "Today"
        : offset === 1
            ? "Tomorrow"
            : `${date.getUTCDate()} ${MONTH_LABELS[date.getUTCMonth()]}`;
    return `${day} • ${formatClockTime(session.sessionTime)}`;
}

export default function OngoingBatchesPage() {
    const router = useRouter();
    const { enrolledBatches, loadingEnrolledBatches, getEnrolledBatches } = useStudent();

    useEffect(() => {
        getEnrolledBatches();
    }, [getEnrolledBatches]);

    if (loadingEnrolledBatches) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress size={24} sx={{ color: "#7c3aed" }} />
            </Box>
        );
    }

    if (enrolledBatches.length === 0) {
        return (
            <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", textAlign: "center", py: 4 }}>
                You are not enrolled in any batch yet.
            </Typography>
        );
    }

    return (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 2 }}>
            {enrolledBatches.map((enrollment) => {
                const { batch, nextSession } = enrollment;
                const joinLink = nextSession?.sessionLink ?? batch.batchLink;
                const isToday = nextSession ? daysFromToday(nextSession.sessionDate) === 0 : false;
                return (
                    <BatchCard
                        key={enrollment.batchStudentId}
                        variant="ongoing"
                        title={batch.course?.courseName ?? batch.batchName}
                        mode={normalizeMode(batch.mode)}
                        trainers={batch.batchTrainers.map((item) => ({ name: item.trainer.trainerName }))}
                        batchProgress={enrollment.progress.progressPercentage}
                        attendance={enrollment.attendance.attendancePercentage}
                        nextSession={nextSession && {
                            label: isToday ? "Today's Class" : "Next Session",
                            title: `Session ${nextSession.sessionNumber} of ${enrollment.progress.totalSessions}`,
                            timing: formatSessionTiming(nextSession),
                        }}
                        hasJoinClass={Boolean(isToday && joinLink)}
                        onViewDetails={() => router.push(`/dashboard/student/batch/${batch.batchId}`)}
                        onJoinClass={() => { if (joinLink) window.open(joinLink, "_blank", "noopener,noreferrer"); }}
                    />
                );
            })}
        </Box>
    );
}