"use client";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import BatchCard from "@/components/batches/BatchCard";
import CompletedMonthSection from "@/components/batches/CompletedMonthSection";
import { EmptyBatches } from "@/components/batches/batch-card-ui";
import { formatUTCDate, MONTH_LONG, normalizeMode } from "@/components/batches/batch-format";
import { useStudent, type CompletedBatch } from "@/contexts/StudentContext";

/** The batch end date is when the batch actually finished, so it drives grouping and display. */
function completionDate(item: CompletedBatch): Date {
    return new Date(item.batch.batchEndDate);
}

type MonthGroup = { key: number; label: string; batches: CompletedBatch[] };

function CompletedContent() {
    const router = useRouter();
    const params = useSearchParams();
    const year = parseInt(params.get("year") ?? String(new Date().getFullYear()), 10);
    const { completedBatches, loadingCompletedBatches, getCompletedBatches } = useStudent();
    // Latest month opens by default; the student can expand/collapse any month.
    const [toggled, setToggled] = useState<Record<string, boolean>>({});

    useEffect(() => {
        getCompletedBatches();
    }, [getCompletedBatches]);

    const months = useMemo<MonthGroup[]>(() => {
        const byMonth = new Map<number, CompletedBatch[]>();
        for (const item of completedBatches) {
            const date = completionDate(item);
            if (Number.isNaN(date.getTime()) || date.getUTCFullYear() !== year) continue;
            const bucket = byMonth.get(date.getUTCMonth());
            if (bucket) bucket.push(item);
            else byMonth.set(date.getUTCMonth(), [item]);
        }
        return [...byMonth.entries()]
            .sort(([a], [b]) => b - a)
            .map(([month, batches]) => ({
                key: month,
                label: `${MONTH_LONG[month]} ${year}`,
                batches: batches.sort((a, b) => completionDate(b).getTime() - completionDate(a).getTime()),
            }));
    }, [completedBatches, year]);

    if (loadingCompletedBatches) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress size={24} sx={{ color: "#7c3aed" }} />
            </Box>
        );
    }

    if (months.length === 0) {
        return <EmptyBatches message={`No completed batches for ${year}`} />;
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {months.map((group, index) => {
                const id = `${year}-${group.key}`;
                const expanded = toggled[id] ?? index === 0;
                return (
                    <CompletedMonthSection
                        key={id}
                        label={group.label}
                        expanded={expanded}
                        onToggle={() => setToggled((prev) => ({ ...prev, [id]: !expanded }))}
                    >
                        {group.batches.map((item) => (
                            <BatchCard
                                key={item.batchStudentId}
                                variant="completed"
                                title={item.batch.course?.courseName ?? item.batch.batchName}
                                mode={normalizeMode(item.batch.mode)}
                                trainers={item.batch.batchTrainers.map((t) => ({ name: t.trainer.trainerName }))}
                                batchCompletedOn={formatUTCDate(item.batch.batchEndDate, "ordinal")}
                                attendance={item.attendance.attendancePercentage}
                                onViewDetails={() => router.push(`/dashboard/student/batch/${item.batch.batchId}`)}
                            />
                        ))}
                    </CompletedMonthSection>
                );
            })}
        </Box>
    );
}

export default function CompletedPage() {
    return (
        <Suspense>
            <CompletedContent />
        </Suspense>
    );
}
