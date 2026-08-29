"use client";

import { CalendarDays, Clock, MapPin, Users, BookOpen, Link2, FileText, Edit2, Armchair } from "lucide-react";
import { Button } from "@mui/material";
import type { BatchDetail, SessionStatus } from "@/contexts/BatchContext";
import {
    BRAND, EmptyState, Panel, PanelRow, Surface, formatDate, formatTime,
} from "@/components/batches/batch-ui";

const SESSION_BREAKDOWN: { key: SessionStatus; label: string; color: string; bg: string }[] = [
    { key: "scheduled", label: "Scheduled", color: BRAND.violet, bg: BRAND.violetBg },
    { key: "completed", label: "Completed", color: BRAND.emerald, bg: BRAND.emeraldBg },
    { key: "ongoing", label: "Ongoing", color: BRAND.primary, bg: BRAND.skyBg },
    { key: "rescheduled", label: "Rescheduled", color: BRAND.amber, bg: BRAND.amberBg },
    { key: "cancelled", label: "Cancelled", color: BRAND.rose, bg: BRAND.roseBg },
];

export default function OverviewTab({
    batch,
    sessionStats,
    onEdit,
}: {
    batch: BatchDetail;
    sessionStats: Partial<Record<SessionStatus, number>>;
    onEdit: () => void;
}) {
    const filled = (batch.totalSeats ?? 0) - (batch.availableSeats ?? 0);

    return (
        <div className="flex flex-col gap-2 sm:gap-3">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-700">Batch details</h3>
                <Button
                    onClick={onEdit}
                    size="small"
                    variant="outlined"
                    startIcon={<Edit2 size={12} />}
                    sx={{
                        textTransform: "none", borderRadius: "8px", fontSize: "0.72rem",
                        borderColor: BRAND.primary, color: BRAND.primary,
                        "&:hover": { borderColor: BRAND.primary, bgcolor: BRAND.skyBg },
                    }}
                >
                    Edit batch
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                <Panel title="Schedule" icon={<CalendarDays size={12} />} color={BRAND.sky} bg={BRAND.skyBg}>
                    <PanelRow label="Start date" value={formatDate(batch.batchStartDate)} />
                    <PanelRow label="End date" value={formatDate(batch.batchEndDate)} />
                    <PanelRow label="Class days" value={(batch.batchDays ?? []).join(", ")} />
                    <PanelRow label="Total sessions" value={batch._count.batchSessions} />
                </Panel>

                <Panel title="Class timing" icon={<Clock size={12} />} color={BRAND.amber} bg={BRAND.amberBg}>
                    <PanelRow label="Starts at" value={formatTime(batch.classStartTime)} />
                    <PanelRow label="Ends at" value={formatTime(batch.classEndTime)} />
                    <PanelRow label="Hours / class" value={batch.numberOfHoursPerClass} />
                    <PanelRow label="Timing label" value={batch.classTiming} />
                </Panel>

                <Panel title="Delivery" icon={<MapPin size={12} />} color={BRAND.emerald} bg={BRAND.emeraldBg}>
                    <PanelRow label="Mode" value={batch.mode} />
                    <PanelRow label="Class room" value={batch.classRoomNumber} />
                    <PanelRow label="Status" value={batch.isActive ? "Active" : "Inactive"} />
                    <PanelRow
                        label="Class link"
                        value={batch.batchLink ? (
                            <a
                                href={batch.batchLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 hover:underline"
                                style={{ color: BRAND.primary }}
                            >
                                <Link2 size={11} /> Open
                            </a>
                        ) : null}
                    />
                </Panel>

                <Panel title="Seats" icon={<Armchair size={12} />} color={BRAND.violet} bg={BRAND.violetBg}>
                    <PanelRow label="Total seats" value={batch.totalSeats ?? "Unlimited"} />
                    <PanelRow label="Filled" value={batch.totalSeats === null ? batch._count.batchStudents : filled} />
                    <PanelRow label="Available" value={batch.availableSeats ?? "Unlimited"} />
                    <PanelRow label="Enrolled students" value={batch._count.batchStudents} />
                </Panel>

                <Panel title="Course" icon={<BookOpen size={12} />} color={BRAND.primary} bg={BRAND.skyBg}>
                    <PanelRow label="Name" value={batch.course?.courseName} />
                    <PanelRow label="Duration" value={batch.course?.durationInMonths ? `${batch.course.durationInMonths} months` : null} />
                    <PanelRow label="Modules" value={batch.course?.noOfModules ?? null} />
                    <PanelRow label="Created" value={formatDate(batch.createdAt)} />
                </Panel>

                <Panel title="Trainers" icon={<Users size={12} />} color={BRAND.rose} bg={BRAND.roseBg}>
                    {batch.batchTrainers.length === 0 ? (
                        <span className="text-[11px] text-gray-400">No trainer assigned</span>
                    ) : (
                        batch.batchTrainers.map((row) => (
                            <PanelRow
                                key={row.trainer.trainerId}
                                label={row.trainer.trainerName}
                                value={`+${row.trainer.callingCode} ${row.trainer.phoneNumber}`}
                                mono
                            />
                        ))
                    )}
                </Panel>
            </div>

            <h3 className="text-sm font-semibold text-gray-700 mt-1">Session breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {SESSION_BREAKDOWN.map((item) => (
                    <Surface key={item.key} accent={item.color} className="p-2.5 text-center">
                        <p className="text-lg font-bold leading-tight" style={{ color: item.color }}>
                            {sessionStats[item.key] ?? 0}
                        </p>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{item.label}</p>
                    </Surface>
                ))}
            </div>

            <h3 className="text-sm font-semibold text-gray-700 mt-1">Description</h3>
            {batch.batchDescription ? (
                <Surface accent={BRAND.slate} className="p-3">
                    <div className="flex items-start gap-2">
                        <FileText size={13} className="mt-0.5 shrink-0" style={{ color: BRAND.slate }} />
                        <p className="text-xs text-gray-700 whitespace-pre-wrap">{batch.batchDescription}</p>
                    </div>
                </Surface>
            ) : (
                <EmptyState label="No description added for this batch." color={BRAND.slate} />
            )}
        </div>
    );
}
