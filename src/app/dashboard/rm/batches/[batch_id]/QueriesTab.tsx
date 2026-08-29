"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { MessageSquareWarning, Send, Lock, ExternalLink, Phone, CheckCircle2 } from "lucide-react";
import {
    Button, CircularProgress, Paper, Skeleton, Tooltip,
    Dialog, DialogActions, DialogContent, DialogTitle,
} from "@mui/material";
import { useBatch, type BatchQueryListItem, type BatchQueryStatus } from "@/contexts/BatchContext";
import {
    AppSelect, AppTextField, BRAND, EmptyState, StatusChip, Surface,
    formatDate, queryStatusColor,
} from "@/components/batches/batch-ui";

const STATUS_OPTIONS: { label: string; value: BatchQueryStatus }[] = [
    { label: "Pending", value: "pending" },
    { label: "Resolved", value: "resolved" },
    { label: "Closed", value: "closed" },
];

export default function QueriesTab({ batchId, onChanged }: { batchId: string; onChanged: () => void }) {
    const { batchQueries, loadingBatchQueries, getBatchQueries, resolveBatchQuery } = useBatch();

    const [status, setStatus] = useState<string>("pending");
    const [queryType, setQueryType] = useState("");
    const [target, setTarget] = useState<BatchQueryListItem | null>(null);
    const [response, setResponse] = useState("");
    const [nextStatus, setNextStatus] = useState<BatchQueryStatus>("resolved");
    const [busy, setBusy] = useState(false);

    const refresh = useCallback(() => {
        getBatchQueries(batchId, {
            ...(status ? { status: status as BatchQueryStatus } : {}),
            ...(queryType ? { queryType } : {}),
        });
    }, [getBatchQueries, batchId, status, queryType]);

    useEffect(() => { refresh(); }, [refresh]);

    const typeOptions = useMemo(() => {
        const types = [...new Set(batchQueries.map((q) => q.queryType))];
        return types.map((t) => ({ label: t, value: t }));
    }, [batchQueries]);

    const submit = async () => {
        if (!target) return;
        if (nextStatus === "resolved" && !response.trim()) {
            toast.error("A response is required to resolve a query");
            return;
        }
        setBusy(true);
        const res = await resolveBatchQuery(batchId, target.batchQueryId, {
            queryStatus: nextStatus,
            queryResponse: response.trim() || undefined,
        });
        setBusy(false);
        if (!res.success) {
            toast.error(res.message ?? "Failed to update query");
            return;
        }
        toast.success("Query updated");
        setTarget(null);
        setResponse("");
        refresh();
        onChanged();
    };

    return (
        <div className="flex flex-col gap-2 sm:gap-3">
            <Paper elevation={0} sx={{ borderRadius: "8px", border: `1px solid ${BRAND.rose}`, p: 1.25 }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                    <AppSelect label="Query status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
                    <AppSelect label="Query type" value={queryType} onChange={setQueryType} options={typeOptions} />
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <MessageSquareWarning size={12} style={{ color: BRAND.rose }} />
                        <span>{batchQueries.length} quer{batchQueries.length === 1 ? "y" : "ies"} in view</span>
                    </div>
                </div>
            </Paper>

            {loadingBatchQueries ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={150} sx={{ borderRadius: "8px" }} />
                    ))}
                </div>
            ) : batchQueries.length === 0 ? (
                <EmptyState label="No queries for this filter." color={BRAND.rose} />
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                    {batchQueries.map((query) => {
                        const tone = queryStatusColor(query.queryStatus);
                        const locked = query.queryStatus === "closed";
                        return (
                            <Surface key={query.batchQueryId} accent={tone.color} className="p-3 flex flex-col gap-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{query.student.studentName}</p>
                                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                            <Phone size={10} />
                                            <span className="font-mono">+{query.student.callingCode} {query.student.phoneNumber}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <StatusChip label={query.queryStatus} color={tone.color} bg={tone.bg} />
                                        <Tooltip title="Open student profile">
                                            <Link
                                                href={`/dashboard/rm/student-profiles/${query.studentId}`}
                                                className="p-1 rounded hover:bg-gray-100"
                                                style={{ color: BRAND.primary }}
                                            >
                                                <ExternalLink size={13} />
                                            </Link>
                                        </Tooltip>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                    <StatusChip label={query.queryType} color={BRAND.violet} bg={BRAND.violetBg} />
                                    <StatusChip label={formatDate(query.createdAt)} color={BRAND.slate} bg={BRAND.slateBg} />
                                </div>

                                <p className="text-xs text-gray-700 bg-gray-50 rounded p-2 border border-gray-100 whitespace-pre-wrap">
                                    {query.queryText}
                                </p>

                                {query.queryResponse && (
                                    <div
                                        className="rounded p-2 text-xs whitespace-pre-wrap"
                                        style={{ backgroundColor: BRAND.emeraldBg, border: `1px solid ${BRAND.emerald}`, color: "#065f46" }}
                                    >
                                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: BRAND.emerald }}>
                                            <CheckCircle2 size={10} /> Response
                                        </span>
                                        {query.queryResponse}
                                    </div>
                                )}

                                <div className="flex justify-end pt-1 border-t border-gray-100">
                                    <Tooltip title={locked ? "Closed queries cannot be updated" : "Respond to this query"}>
                                        <span>
                                            <Button
                                                onClick={() => {
                                                    setTarget(query);
                                                    setResponse(query.queryResponse ?? "");
                                                    setNextStatus("resolved");
                                                }}
                                                disabled={locked}
                                                size="small"
                                                variant="contained"
                                                startIcon={locked ? <Lock size={12} /> : <Send size={12} />}
                                                sx={{
                                                    textTransform: "none", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 600,
                                                    bgcolor: BRAND.rose, "&:hover": { bgcolor: "#e11d48" },
                                                }}
                                            >
                                                Respond
                                            </Button>
                                        </span>
                                    </Tooltip>
                                </div>
                            </Surface>
                        );
                    })}
                </div>
            )}

            <Dialog
                open={Boolean(target)}
                onClose={busy ? undefined : () => setTarget(null)}
                fullWidth
                maxWidth="sm"
                slotProps={{ paper: { sx: { borderRadius: "12px", border: `1px solid ${BRAND.rose}` } } }}
            >
                <DialogTitle sx={{ fontSize: "0.9rem", fontWeight: 700, color: BRAND.rose }}>Respond to query</DialogTitle>
                <DialogContent>
                    <p className="text-xs text-gray-600 mb-2 whitespace-pre-wrap bg-gray-50 rounded p-2 border border-gray-100">
                        {target?.queryText}
                    </p>
                    <div className="flex flex-col gap-2">
                        <AppSelect
                            label="Set status"
                            value={nextStatus}
                            onChange={(v) => setNextStatus(v as BatchQueryStatus)}
                            options={STATUS_OPTIONS}
                            allowEmpty={false}
                        />
                        <AppTextField
                            label="Response"
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            multiline
                            minRows={3}
                        />
                    </div>
                </DialogContent>
                <DialogActions sx={{ px: 2.5, pb: 1.5 }}>
                    <Button
                        onClick={() => setTarget(null)}
                        disabled={busy}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: "none", borderRadius: "8px", fontSize: "0.75rem", borderColor: "#e5e7eb", color: "#374151" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={submit}
                        disabled={busy}
                        size="small"
                        variant="contained"
                        startIcon={busy ? <CircularProgress size={12} color="inherit" /> : <Send size={12} />}
                        sx={{ textTransform: "none", borderRadius: "8px", fontSize: "0.75rem", bgcolor: BRAND.emerald, "&:hover": { bgcolor: "#059669" } }}
                    >
                        Save response
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
