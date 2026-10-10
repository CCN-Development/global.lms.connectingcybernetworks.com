"use client";
import { useEffect, useMemo } from "react";
import { Box, CircularProgress } from "@mui/material";
import BatchCard from "@/components/batches/BatchCard";
import { CARD_GRID_SX, EmptyBatches } from "@/components/batches/batch-card-ui";
import { daysFromToday, formatUTCClock, MONTH_SHORT, normalizeMode } from "@/components/batches/batch-format";
import { useRouter } from "next/navigation";
import { useStudent, type EnrolledBatch } from "@/contexts/StudentContext";

function formatSessionTiming(session: NonNullable<EnrolledBatch["nextSession"]>): string {
    const offset = daysFromToday(session.sessionDate);
    const date = new Date(session.sessionDate);
    const day = offset === 0
        ? "Today"
        : offset === 1
            ? "Tomorrow"
            : `${date.getUTCDate()} ${MONTH_SHORT[date.getUTCMonth()]}`;
    return `${day} • ${formatUTCClock(session.sessionTime)}`;
}

export default function OngoingBatchesPage() {
    const router = useRouter();
    const { enrolledBatches, loadingEnrolledBatches, getEnrolledBatches } = useStudent();

    useEffect(() => {
        getEnrolledBatches();
    }, [getEnrolledBatches]);

    // Completed enrollments live in the Completed tab and dropped ones in the Missed tab.
    const ongoing = useMemo(
        () => enrolledBatches.filter((enrollment) => enrollment.status !== "completed" && enrollment.status !== "dropped"),
        [enrolledBatches],
    );

    if (loadingEnrolledBatches) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress size={24} sx={{ color: "#7c3aed" }} />
            </Box>
        );
    }

    if (ongoing.length === 0) {
        return <EmptyBatches message="You are not enrolled in any batch yet." />;
    }

    return (
        <Box sx={CARD_GRID_SX}>
            {ongoing.map((enrollment) => {
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
                            label: isToday ? "Today’s Topic" : "Next Topic",
                            // TODO(backend): expose the session topic name on `nextSession` (Figma shows e.g. "Network Fundamentals");
                            // until then the session number is shown in its place.
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
