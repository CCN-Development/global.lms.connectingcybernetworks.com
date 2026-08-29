"use client";
import React, { Suspense, useEffect, useMemo } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useSearchParams } from "next/navigation";
import BatchCard from "@/components/batches/BatchCard";
import { useStudent, type CompletedBatch } from "@/contexts/StudentContext";

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function normalizeMode(mode: string | null): "Online" | "Offline" | "Hybrid" {
    const value = (mode ?? "").trim().toLowerCase();
    if (value === "offline") return "Offline";
    if (value === "hybrid") return "Hybrid";
    return "Online";
}

/** The batch end date is when the batch actually finished, so it drives grouping and display. */
function completionDate(item: CompletedBatch): Date {
    return new Date(item.batch.batchEndDate);
}

function formatDate(date: Date): string {
    return `${date.getUTCDate()} ${MONTH_SHORT[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function CompletedContent() {
    const params = useSearchParams();
    const year = parseInt(params.get("year") ?? String(new Date().getFullYear()), 10);
    const { completedBatches, loadingCompletedBatches, getCompletedBatches } = useStudent();

    useEffect(() => {
        getCompletedBatches();
    }, [getCompletedBatches]);

    const months = useMemo(() => {
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
                month: `${MONTH_NAMES[month]} ${year}`,
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

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {months.map((group, idx) => (
                <Box key={group.month} sx={{ display: "flex", gap: 2, pb: 2.5 }}>
                    {/* Timeline spine */}
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 24, pt: "2px" }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#10b981", border: "2px solid rgba(16,185,129,0.3)", flexShrink: 0 }} />
                        {idx < months.length - 1 && (
                            <Box sx={{
                                width: "1.5px",
                                flex: 1,
                                minHeight: 20,
                                background: "repeating-linear-gradient(to bottom, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 4px, transparent 4px, transparent 8px)",
                                mt: 0.5,
                            }} />
                        )}
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{
                            bgcolor: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: "14px",
                            p: 1.5,
                        }}>
                            <Typography sx={{ fontStyle: "italic", fontSize: "0.95rem", fontWeight: 600, color: "#fff", mb: 1.5 }}>
                                {group.month}
                            </Typography>
                            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 1.5 }}>
                                {group.batches.map((item) => (
                                    <BatchCard
                                        key={item.batchStudentId}
                                        variant="completed"
                                        title={item.batch.course?.courseName ?? item.batch.batchName}
                                        mode={normalizeMode(item.batch.mode)}
                                        trainers={item.batch.batchTrainers.map((t) => ({ name: t.trainer.trainerName }))}
                                        batchCompletedOn={formatDate(completionDate(item))}
                                        attendance={item.attendance.attendancePercentage}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            ))}
            {months.length === 0 && (
                <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", textAlign: "center", py: 5 }}>
                    No completed batches for {year}
                </Typography>
            )}
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