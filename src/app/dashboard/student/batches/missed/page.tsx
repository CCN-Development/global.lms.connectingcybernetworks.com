"use client";
import React, { useEffect, useMemo } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import BatchCard from "@/components/batches/BatchCard";
import { CARD_GRID_SX, EmptyBatches } from "@/components/batches/batch-card-ui";
import { formatUTCDayMonth, MONTH_SHORT, normalizeMode } from "@/components/batches/batch-format";
import { useStudent, type EnrolledBatch } from "@/contexts/StudentContext";

function localDayMonth(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return `${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`;
}

function missedNote(enrollment: EnrolledBatch): string {
    // The enrollment's last update is when the student was marked as dropped.
    if (enrollment.attendance.attendedSessions === 0) {
        return `Never joined · seat released ${localDayMonth(enrollment.updatedAt)}`;
    }
    // TODO(backend): expose the student's last attended session date; the drop date is used until then.
    return `Stopped attending after ${localDayMonth(enrollment.updatedAt)}`;
}

export default function MissedBatchesPage() {
    const router = useRouter();
    const { enrolledBatches, loadingEnrolledBatches, getEnrolledBatches } = useStudent();

    useEffect(() => {
        getEnrolledBatches();
    }, [getEnrolledBatches]);

    const missed = useMemo(
        () => enrolledBatches.filter((enrollment) => enrollment.status === "dropped"),
        [enrolledBatches],
    );

    if (loadingEnrolledBatches) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress size={24} sx={{ color: "#7c3aed" }} />
            </Box>
        );
    }

    if (missed.length === 0) {
        return <EmptyBatches message="You haven’t missed any batches." />;
    }

    return (
        <Box sx={CARD_GRID_SX}>
            {missed.map((enrollment) => {
                const { batch } = enrollment;
                return (
                    <BatchCard
                        key={enrollment.batchStudentId}
                        variant="missed"
                        title={batch.course?.courseName ?? batch.batchName}
                        mode={normalizeMode(batch.mode)}
                        batchDuration={`${formatUTCDayMonth(batch.batchStartDate)} – ${formatUTCDayMonth(batch.batchEndDate)}`}
                        attendedSessions={enrollment.attendance.attendedSessions}
                        totalSessions={enrollment.progress.totalSessions}
                        note={missedNote(enrollment)}
                        onViewAttendance={() => router.push(`/dashboard/student/batch/${batch.batchId}/attendance`)}
                        onRejoin={() => router.push("/dashboard/student/batches/explore-batches")}
                    />
                );
            })}
        </Box>
    );
}
