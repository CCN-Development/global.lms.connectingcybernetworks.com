"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    Check, X, AlertTriangle, IndianRupee, CalendarClock, Phone, ExternalLink, Inbox,
} from "lucide-react";
import { Button, CircularProgress, Paper, Skeleton, Tooltip } from "@mui/material";
import { useBatch, type BatchRequestListItem, type BatchRequestStatus } from "@/contexts/BatchContext";
import {
    AppSelect, AppTextField, BRAND, EmptyState, StatusChip, Surface,
    formatDate, formatMoney, requestStatusColor,
} from "@/components/batches/batch-ui";

const STATUS_OPTIONS: { label: string; value: BatchRequestStatus }[] = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
];

export default function RequestsTab({ batchId, onChanged }: { batchId: string; onChanged: () => void }) {
    const {
        batchRequests, loadingBatchRequests, getBatchRequests,
        approveBatchRequest, rejectBatchRequest,
    } = useBatch();

    const [status, setStatus] = useState<string>("pending");
    const [busyId, setBusyId] = useState<string | null>(null);

    const refresh = useCallback(() => {
        getBatchRequests(batchId, status ? (status as BatchRequestStatus) : undefined);
    }, [getBatchRequests, batchId, status]);

    useEffect(() => { refresh(); }, [refresh]);

    const act = async (request: BatchRequestListItem, action: "approve" | "reject", reason: string) => {
        if (action === "reject" && !reason.trim()) {
            toast.error("Add a reason before rejecting");
            return;
        }
        setBusyId(request.batchRequestId);
        const res = action === "approve"
            ? await approveBatchRequest(batchId, request.batchRequestId, reason.trim() || undefined)
            : await rejectBatchRequest(batchId, request.batchRequestId, reason.trim());
        setBusyId(null);

        if (!res.success) {
            toast.error(res.message ?? `Failed to ${action} request`);
            return;
        }
        toast.success(action === "approve" ? "Request approved and student enrolled" : "Request rejected");
        refresh();
        onChanged();
    };

    return (
        <div className="flex flex-col gap-2 sm:gap-3">
            <Paper elevation={0} sx={{ borderRadius: "8px", border: `1px solid ${BRAND.orange}`, p: 1.25 }}>
                <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-2 items-center">
                    <AppSelect label="Request status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <Inbox size={12} style={{ color: BRAND.orange }} />
                        <span>Pending dues are shown per student so seats are never approved against overdue payments.</span>
                    </div>
                </div>
            </Paper>

            {loadingBatchRequests ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={190} sx={{ borderRadius: "8px" }} />
                    ))}
                </div>
            ) : batchRequests.length === 0 ? (
                <EmptyState label="No seat requests for this filter." color={BRAND.orange} />
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                    {batchRequests.map((request) => (
                        <RequestCard
                            key={request.batchRequestId}
                            request={request}
                            busy={busyId === request.batchRequestId}
                            onAct={(action, reason) => act(request, action, reason)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function RequestCard({
    request,
    busy,
    onAct,
}: {
    request: BatchRequestListItem;
    busy: boolean;
    onAct: (action: "approve" | "reject", reason: string) => void;
}) {
    const [reason, setReason] = useState("");
    const tone = requestStatusColor(request.requestStatus);
    const dues = request.duePayments;
    const isPending = request.requestStatus === "pending";

    return (
        <Surface accent={tone.color} className="p-3 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <span
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                        style={{ backgroundColor: BRAND.violetBg, color: BRAND.violet }}
                    >
                        {request.student.studentName.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase()).join("")}
                    </span>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{request.student.studentName}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                            <Phone size={10} />
                            <span className="font-mono">+{request.student.callingCode} {request.student.phoneNumber}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <StatusChip label={request.requestStatus} color={tone.color} bg={tone.bg} />
                    <Tooltip title="Open student profile">
                        <Link
                            href={`/dashboard/rm/student-profiles/${request.studentId}`}
                            className="p-1 rounded hover:bg-gray-100"
                            style={{ color: BRAND.primary }}
                        >
                            <ExternalLink size={13} />
                        </Link>
                    </Tooltip>
                </div>
            </div>

            <div className="flex flex-wrap gap-1">
                <StatusChip label={`Mode: ${request.modeRequested}`} color={BRAND.sky} bg={BRAND.skyBg} />
                <StatusChip label={`Raised ${formatDate(request.createdAt)}`} color={BRAND.slate} bg={BRAND.slateBg} />
            </div>

            {request.requestReason && (
                <p className="text-[11px] text-gray-600 bg-gray-50 rounded p-1.5 border border-gray-100">
                    {request.requestReason}
                </p>
            )}

            {/* Dues */}
            <div
                className="rounded-lg p-2"
                style={{
                    backgroundColor: dues.hasDues ? BRAND.roseBg : BRAND.emeraldBg,
                    border: `1px solid ${dues.hasDues ? BRAND.rose : BRAND.emerald}`,
                }}
            >
                <div className="flex items-center gap-1.5 mb-1">
                    {dues.hasDues
                        ? <AlertTriangle size={12} style={{ color: BRAND.rose }} />
                        : <Check size={12} style={{ color: BRAND.emerald }} />}
                    <span
                        className="text-[11px] font-bold uppercase tracking-wide"
                        style={{ color: dues.hasDues ? BRAND.rose : BRAND.emerald }}
                    >
                        {dues.hasDues ? "Payment dues pending" : "No pending dues"}
                    </span>
                </div>

                {dues.hasDues && (
                    <>
                        <div className="grid grid-cols-3 gap-1.5">
                            <DueCell label="Pending" value={formatMoney(dues.totalPendingAmount)} icon={<IndianRupee size={10} />} color={BRAND.rose} />
                            <DueCell label="Overdue" value={formatMoney(dues.overdueAmount)} icon={<AlertTriangle size={10} />} color={BRAND.orange} />
                            <DueCell label="Next due" value={formatDate(dues.nextDueDate)} icon={<CalendarClock size={10} />} color={BRAND.violet} />
                        </div>
                        {dues.schedules.length > 0 && (
                            <div className="mt-1.5 flex flex-col gap-0.5 max-h-24 overflow-y-auto">
                                {dues.schedules.slice(0, 5).map((schedule) => (
                                    <div key={schedule.scheduleId} className="flex items-center justify-between text-[10px]">
                                        <span className={schedule.isOverdue ? "font-semibold" : "text-gray-500"} style={schedule.isOverdue ? { color: BRAND.rose } : undefined}>
                                            {formatDate(schedule.dueDate)}{schedule.isOverdue ? " · overdue" : ""}
                                        </span>
                                        <span className="font-semibold text-gray-700">{formatMoney(schedule.remainingAmount)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {isPending && (
                <div className="flex flex-col gap-1.5 pt-1.5 border-t border-gray-100">
                    <AppTextField
                        label="Reason (required to reject)"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <div className="flex items-center justify-end gap-1.5">
                        <Button
                            onClick={() => onAct("reject", reason)}
                            disabled={busy}
                            size="small"
                            variant="outlined"
                            startIcon={<X size={12} />}
                            sx={{
                                textTransform: "none", borderRadius: "8px", fontSize: "0.72rem",
                                borderColor: BRAND.rose, color: BRAND.rose,
                                "&:hover": { borderColor: BRAND.rose, bgcolor: BRAND.roseBg },
                            }}
                        >
                            Reject
                        </Button>
                        <Button
                            onClick={() => onAct("approve", reason)}
                            disabled={busy}
                            size="small"
                            variant="contained"
                            startIcon={busy ? <CircularProgress size={12} color="inherit" /> : <Check size={12} />}
                            sx={{
                                textTransform: "none", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 600,
                                bgcolor: BRAND.emerald, "&:hover": { bgcolor: "#059669" },
                            }}
                        >
                            Approve &amp; enroll
                        </Button>
                    </div>
                </div>
            )}
        </Surface>
    );
}

function DueCell({
    label, value, icon, color,
}: { label: string; value: string; icon: React.ReactNode; color: string }) {
    return (
        <div className="rounded p-1.5 bg-white" style={{ border: `1px solid ${color}` }}>
            <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide" style={{ color }}>
                {icon}{label}
            </div>
            <p className="text-[11px] font-bold text-gray-800 truncate">{value}</p>
        </div>
    );
}
