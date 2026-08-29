"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { UserPlus, UserMinus, X, Save, ExternalLink } from "lucide-react";
import {
    Button, CircularProgress, IconButton, LinearProgress, Paper, Skeleton, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Tooltip,
    Dialog, DialogActions, DialogContent, DialogTitle,
} from "@mui/material";
import { useBatch, type BatchDetail, type BatchStudentStatus, type BatchStudentListItem } from "@/contexts/BatchContext";
import { useRM } from "@/contexts/RMContext";
import {
    AppOptionSelect, AppSelect, BRAND, EmptyState, StatusChip, Surface,
    enrollmentStatusColor, formatDate,
} from "@/components/batches/batch-ui";

const STATUS_OPTIONS: { label: string; value: BatchStudentStatus }[] = [
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
    { label: "Dropped", value: "dropped" },
    { label: "Failed", value: "failed" },
];

const REMOVE_OPTIONS = STATUS_OPTIONS.filter((o) => o.value !== "active");

const HEAD_SX = {
    fontSize: "0.68rem", fontWeight: 700, color: "#ffffff", textTransform: "uppercase" as const,
    letterSpacing: "0.03em", py: 1, borderBottom: "none",
    background: `linear-gradient(90deg, ${BRAND.violet} 0%, ${BRAND.primary} 100%)`,
};

const CELL_SX = { fontSize: "0.75rem", py: 0.9, borderBottom: "1px solid #f1f5f9" };

export default function StudentsTab({ batch, onChanged }: { batch: BatchDetail; onChanged: () => void }) {
    const { batchStudents, loadingBatchStudents, getBatchStudents, addBatchStudent, removeBatchStudent } = useBatch();
    const { students, getAllStudentsForBranch } = useRM();

    const [status, setStatus] = useState("");
    const [adding, setAdding] = useState(false);
    const [studentId, setStudentId] = useState("");
    const [busy, setBusy] = useState(false);
    const [pendingRemove, setPendingRemove] = useState<BatchStudentListItem | null>(null);
    const [removeStatus, setRemoveStatus] = useState<BatchStudentStatus>("dropped");

    const refresh = useCallback(() => {
        getBatchStudents(batch.batchId, status ? (status as BatchStudentStatus) : undefined);
    }, [getBatchStudents, batch.batchId, status]);

    useEffect(() => { refresh(); }, [refresh]);

    useEffect(() => {
        if (adding && students.length === 0) getAllStudentsForBranch({ limit: 200 });
    }, [adding, students.length, getAllStudentsForBranch]);

    const enrolledIds = useMemo(
        () => new Set(batchStudents.filter((s) => s.isAccessActive && s.status === "active").map((s) => s.studentId)),
        [batchStudents],
    );

    const studentOptions = useMemo(
        () => students
            .filter((s) => !enrolledIds.has(s.studentId))
            .map((s) => ({ id: s.studentId, label: s.studentName, hint: s.phoneNumber })),
        [students, enrolledIds],
    );

    const submitAdd = async () => {
        if (!studentId) {
            toast.error("Select a student");
            return;
        }
        setBusy(true);
        const res = await addBatchStudent(batch.batchId, studentId);
        setBusy(false);
        if (!res.success) {
            toast.error(res.message ?? "Failed to add student");
            return;
        }
        toast.success("Student enrolled");
        setStudentId("");
        setAdding(false);
        refresh();
        onChanged();
    };

    const confirmRemove = async () => {
        if (!pendingRemove) return;
        setBusy(true);
        const res = await removeBatchStudent(batch.batchId, pendingRemove.studentId, removeStatus as Exclude<BatchStudentStatus, "active">);
        setBusy(false);
        if (!res.success) {
            toast.error(res.message ?? "Failed to remove student");
            return;
        }
        toast.success("Student removed from batch");
        setPendingRemove(null);
        refresh();
        onChanged();
    };

    const seatsFull = batch.availableSeats !== null && batch.availableSeats <= 0;

    return (
        <div className="flex flex-col gap-2 sm:gap-3">
            <Paper elevation={0} sx={{ borderRadius: "8px", border: `1px solid ${BRAND.violet}`, p: 1.25 }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
                    <AppSelect label="Enrollment status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
                    <div className="hidden sm:block" />
                    <div className="hidden sm:block" />
                    <Tooltip title={seatsFull ? "No seats available in this batch" : ""}>
                        <span>
                            <Button
                                onClick={() => setAdding((prev) => !prev)}
                                disabled={!adding && seatsFull}
                                size="small"
                                fullWidth
                                variant="contained"
                                startIcon={adding ? <X size={13} /> : <UserPlus size={13} />}
                                sx={{
                                    textTransform: "none", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 600,
                                    bgcolor: adding ? BRAND.slate : BRAND.violet,
                                    "&:hover": { bgcolor: adding ? "#475569" : "#6d28d9" },
                                }}
                            >
                                {adding ? "Cancel" : "Add student"}
                            </Button>
                        </span>
                    </Tooltip>
                </div>

                {adding && (
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 pt-2 mt-2 border-t border-gray-100">
                        <AppOptionSelect label="Student" value={studentId} onChange={setStudentId} options={studentOptions} />
                        <Button
                            onClick={submitAdd}
                            disabled={busy}
                            size="small"
                            variant="contained"
                            startIcon={busy ? <CircularProgress size={12} color="inherit" /> : <Save size={12} />}
                            sx={{
                                textTransform: "none", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 600,
                                bgcolor: BRAND.emerald, "&:hover": { bgcolor: "#059669" },
                            }}
                        >
                            Enroll
                        </Button>
                    </div>
                )}
            </Paper>

            {loadingBatchStudents ? (
                <Skeleton variant="rounded" height={260} sx={{ borderRadius: "8px" }} />
            ) : batchStudents.length === 0 ? (
                <EmptyState label="No students enrolled in this batch yet." color={BRAND.violet} />
            ) : (
                <Surface accent={BRAND.violet} className="overflow-hidden">
                    <TableContainer sx={{ maxHeight: 520 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={HEAD_SX}>Student</TableCell>
                                    <TableCell sx={{ ...HEAD_SX, display: { xs: "none", md: "table-cell" } }}>Phone</TableCell>
                                    <TableCell sx={HEAD_SX}>Status</TableCell>
                                    <TableCell sx={{ ...HEAD_SX, minWidth: 150 }}>Attendance</TableCell>
                                    <TableCell sx={{ ...HEAD_SX, display: { xs: "none", lg: "table-cell" } }}>Joined</TableCell>
                                    <TableCell sx={{ ...HEAD_SX, width: 92 }} align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {batchStudents.map((row) => {
                                    const tone = enrollmentStatusColor(row.status);
                                    const percent = row.attendance.attendancePercentage;
                                    const barColor = percent >= 75 ? BRAND.emerald : percent >= 50 ? BRAND.amber : BRAND.rose;
                                    return (
                                        <TableRow key={row.batchStudentId} hover sx={{ "&:hover": { backgroundColor: "#f5f3ff" } }}>
                                            <TableCell sx={{ ...CELL_SX, fontWeight: 600 }}>
                                                <div className="flex flex-col">
                                                    <span className="truncate">{row.student.studentName}</span>
                                                    {row.student.studentRegistrationNumber && (
                                                        <span className="text-[10px] font-mono text-gray-400">
                                                            {row.student.studentRegistrationNumber}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell sx={{ ...CELL_SX, display: { xs: "none", md: "table-cell" }, fontFamily: "monospace", fontSize: "0.7rem" }}>
                                                +{row.student.callingCode} {row.student.phoneNumber}
                                            </TableCell>
                                            <TableCell sx={CELL_SX}>
                                                <StatusChip label={row.status} color={tone.color} bg={tone.bg} />
                                            </TableCell>
                                            <TableCell sx={CELL_SX}>
                                                <div className="flex flex-col gap-0.5 min-w-30">
                                                    <span className="text-[11px] font-semibold" style={{ color: barColor }}>
                                                        {percent}% · {row.attendance.attendedSessions}/{row.attendance.totalSessionsHeld}
                                                    </span>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={Math.min(percent, 100)}
                                                        sx={{
                                                            height: 5, borderRadius: 3, backgroundColor: "#e5e7eb",
                                                            "& .MuiLinearProgress-bar": { backgroundColor: barColor, borderRadius: 3 },
                                                        }}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell sx={{ ...CELL_SX, display: { xs: "none", lg: "table-cell" } }}>
                                                {formatDate(row.createdAt)}
                                            </TableCell>
                                            <TableCell sx={CELL_SX} align="right">
                                                <div className="flex items-center justify-end gap-0.5">
                                                    <Tooltip title="Open student profile">
                                                        <IconButton
                                                            component={Link}
                                                            href={`/dashboard/rm/student-profiles/${row.studentId}`}
                                                            size="small"
                                                            sx={{ color: "#9ca3af", "&:hover": { color: BRAND.primary } }}
                                                        >
                                                            <ExternalLink size={13} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Remove from batch">
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                disabled={!row.isAccessActive}
                                                                onClick={() => { setPendingRemove(row); setRemoveStatus("dropped"); }}
                                                                sx={{ color: "#9ca3af", "&:hover": { color: BRAND.rose } }}
                                                            >
                                                                <UserMinus size={13} />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <div className="px-2.5 py-1.5 border-t border-gray-100">
                        <span className="text-[11px] font-semibold text-gray-500">{batchStudents.length} students</span>
                    </div>
                </Surface>
            )}

            <Dialog
                open={Boolean(pendingRemove)}
                onClose={busy ? undefined : () => setPendingRemove(null)}
                fullWidth
                maxWidth="xs"
                slotProps={{ paper: { sx: { borderRadius: "12px", border: `1px solid ${BRAND.rose}` } } }}
            >
                <DialogTitle sx={{ fontSize: "0.9rem", fontWeight: 700, color: BRAND.rose }}>Remove from batch</DialogTitle>
                <DialogContent>
                    <p className="text-xs text-gray-600 mb-2">
                        Set the final enrollment status for{" "}
                        <span className="font-semibold text-gray-800">{pendingRemove?.student.studentName}</span>. The seat is
                        released back to the batch.
                    </p>
                    <AppSelect
                        label="Final status"
                        value={removeStatus}
                        onChange={(v) => setRemoveStatus(v as BatchStudentStatus)}
                        options={REMOVE_OPTIONS}
                        allowEmpty={false}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 2.5, pb: 1.5 }}>
                    <Button
                        onClick={() => setPendingRemove(null)}
                        disabled={busy}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: "none", borderRadius: "8px", fontSize: "0.75rem", borderColor: "#e5e7eb", color: "#374151" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmRemove}
                        disabled={busy}
                        size="small"
                        variant="contained"
                        startIcon={busy ? <CircularProgress size={12} color="inherit" /> : <UserMinus size={12} />}
                        sx={{ textTransform: "none", borderRadius: "8px", fontSize: "0.75rem", bgcolor: BRAND.rose, "&:hover": { bgcolor: "#e11d48" } }}
                    >
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
