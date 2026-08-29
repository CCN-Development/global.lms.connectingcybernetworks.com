"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarPlus, Trash2, Link2, Users, Loader2, X, Save } from "lucide-react";
import {
    Button, CircularProgress, IconButton, Paper, Skeleton, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Tooltip,
} from "@mui/material";
import { useBatch, type SessionStatus } from "@/contexts/BatchContext";
import {
    AppDateField, AppSelect, AppTextField, AppTimeField, BRAND, EmptyState,
    StatusChip, Surface, formatDate, formatTime, sessionStatusColor,
} from "@/components/batches/batch-ui";

const STATUS_OPTIONS: { label: string; value: SessionStatus }[] = [
    { label: "Scheduled", value: "scheduled" },
    { label: "Ongoing", value: "ongoing" },
    { label: "Completed", value: "completed" },
    { label: "Rescheduled", value: "rescheduled" },
    { label: "Cancelled", value: "cancelled" },
];

const HEAD_SX = {
    fontSize: "0.68rem", fontWeight: 700, color: "#ffffff", textTransform: "uppercase" as const,
    letterSpacing: "0.03em", py: 1, borderBottom: "none",
    background: `linear-gradient(90deg, ${BRAND.sky} 0%, ${BRAND.primary} 100%)`,
};

const CELL_SX = { fontSize: "0.75rem", py: 0.9, borderBottom: "1px solid #f1f5f9" };

export default function SessionsTab({ batchId, onChanged }: { batchId: string; onChanged: () => void }) {
    const { batchSessions, loadingBatchSessions, getBatchSessions, addBatchSession, removeBatchSession } = useBatch();

    const [status, setStatus] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [adding, setAdding] = useState(false);
    const [busy, setBusy] = useState(false);
    const [newSession, setNewSession] = useState({ sessionDate: "", sessionTime: "", sessionLink: "" });

    const refresh = useCallback(() => {
        getBatchSessions(batchId, {
            ...(status ? { status: status as SessionStatus } : {}),
            ...(from ? { from } : {}),
            ...(to ? { to } : {}),
        });
    }, [getBatchSessions, batchId, status, from, to]);

    useEffect(() => { refresh(); }, [refresh]);

    const submitSession = async () => {
        if (!newSession.sessionDate) {
            toast.error("Session date is required");
            return;
        }
        setBusy(true);
        const res = await addBatchSession(batchId, {
            sessionDate: newSession.sessionDate,
            sessionTime: newSession.sessionTime || undefined,
            sessionLink: newSession.sessionLink || undefined,
        });
        setBusy(false);
        if (!res.success) {
            toast.error(res.message ?? "Failed to add session");
            return;
        }
        toast.success("Session added");
        setNewSession({ sessionDate: "", sessionTime: "", sessionLink: "" });
        setAdding(false);
        refresh();
        onChanged();
    };

    const remove = async (sessionId: string) => {
        const res = await removeBatchSession(batchId, sessionId);
        if (res.success) {
            toast.success("Session removed");
            refresh();
            onChanged();
        } else {
            toast.error(res.message ?? "Failed to remove session");
        }
    };

    return (
        <div className="flex flex-col gap-2 sm:gap-3">
            {/* Filters + add */}
            <Paper elevation={0} sx={{ borderRadius: "8px", border: `1px solid ${BRAND.sky}`, p: 1.25 }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
                    <AppSelect label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
                    <AppDateField label="From" value={from} onChange={setFrom} />
                    <AppDateField label="To" value={to} onChange={setTo} />
                    <Button
                        onClick={() => setAdding((prev) => !prev)}
                        size="small"
                        variant="contained"
                        startIcon={adding ? <X size={13} /> : <CalendarPlus size={13} />}
                        sx={{
                            textTransform: "none", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 600,
                            bgcolor: adding ? BRAND.slate : BRAND.sky, "&:hover": { bgcolor: adding ? "#475569" : "#0369a1" },
                        }}
                    >
                        {adding ? "Cancel" : "Add session"}
                    </Button>
                </div>

                {adding && (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 mt-2 border-t border-gray-100">
                        <AppDateField
                            label="Session date"
                            value={newSession.sessionDate}
                            onChange={(v) => setNewSession((p) => ({ ...p, sessionDate: v }))}
                        />
                        <AppTimeField
                            label="Session time"
                            value={newSession.sessionTime}
                            onChange={(v) => setNewSession((p) => ({ ...p, sessionTime: v }))}
                        />
                        <AppTextField
                            label="Session link"
                            value={newSession.sessionLink}
                            onChange={(e) => setNewSession((p) => ({ ...p, sessionLink: e.target.value }))}
                        />
                        <Button
                            onClick={submitSession}
                            disabled={busy}
                            size="small"
                            variant="contained"
                            startIcon={busy ? <CircularProgress size={12} color="inherit" /> : <Save size={12} />}
                            sx={{
                                textTransform: "none", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 600,
                                bgcolor: BRAND.emerald, "&:hover": { bgcolor: "#059669" },
                            }}
                        >
                            Save session
                        </Button>
                    </div>
                )}
            </Paper>

            {loadingBatchSessions ? (
                <Skeleton variant="rounded" height={260} sx={{ borderRadius: "8px" }} />
            ) : batchSessions.length === 0 ? (
                <EmptyState label="No sessions match the current filters." color={BRAND.sky} />
            ) : (
                <Surface accent={BRAND.sky} className="overflow-hidden">
                    <TableContainer sx={{ maxHeight: 520 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ ...HEAD_SX, width: 56 }}>#</TableCell>
                                    <TableCell sx={HEAD_SX}>Date</TableCell>
                                    <TableCell sx={{ ...HEAD_SX, display: { xs: "none", sm: "table-cell" } }}>Time</TableCell>
                                    <TableCell sx={HEAD_SX}>Status</TableCell>
                                    <TableCell sx={{ ...HEAD_SX, display: { xs: "none", md: "table-cell" } }}>Attendance</TableCell>
                                    <TableCell sx={{ ...HEAD_SX, display: { xs: "none", lg: "table-cell" } }}>Link</TableCell>
                                    <TableCell sx={{ ...HEAD_SX, width: 56 }} align="right">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {batchSessions.map((session) => {
                                    const tone = sessionStatusColor(session.sessionStatus);
                                    const locked = session.sessionStatus === "completed" || session.sessionStatus === "ongoing";
                                    return (
                                        <TableRow key={session.batchSessionId} hover sx={{ "&:hover": { backgroundColor: "#f5f3ff" } }}>
                                            <TableCell sx={{ ...CELL_SX, fontWeight: 700, color: BRAND.slate }}>{session.sessionNumber}</TableCell>
                                            <TableCell sx={{ ...CELL_SX, fontWeight: 600 }}>{formatDate(session.sessionDate)}</TableCell>
                                            <TableCell sx={{ ...CELL_SX, display: { xs: "none", sm: "table-cell" } }}>
                                                {formatTime(session.sessionTime)}
                                            </TableCell>
                                            <TableCell sx={CELL_SX}>
                                                <StatusChip label={session.sessionStatus} color={tone.color} bg={tone.bg} />
                                            </TableCell>
                                            <TableCell sx={{ ...CELL_SX, display: { xs: "none", md: "table-cell" } }}>
                                                <span className="inline-flex items-center gap-1 text-gray-600">
                                                    <Users size={11} style={{ color: BRAND.violet }} />
                                                    {session._count.sessionAttendances}
                                                </span>
                                            </TableCell>
                                            <TableCell sx={{ ...CELL_SX, display: { xs: "none", lg: "table-cell" } }}>
                                                {session.sessionLink ? (
                                                    <a
                                                        href={session.sessionLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 hover:underline"
                                                        style={{ color: BRAND.primary }}
                                                    >
                                                        <Link2 size={11} /> Join
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-300">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell sx={CELL_SX} align="right">
                                                <Tooltip title={locked ? "Completed or ongoing sessions cannot be removed" : "Remove session"}>
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            disabled={locked}
                                                            onClick={() => remove(session.batchSessionId)}
                                                            sx={{ color: "#9ca3af", "&:hover": { color: BRAND.rose } }}
                                                        >
                                                            <Trash2 size={13} />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <div className="px-2.5 py-1.5 border-t border-gray-100 flex items-center gap-1.5">
                        {loadingBatchSessions && <Loader2 size={11} className="animate-spin" style={{ color: BRAND.sky }} />}
                        <span className="text-[11px] font-semibold text-gray-500">{batchSessions.length} sessions</span>
                    </div>
                </Surface>
            )}
        </div>
    );
}
