"use client";

import React, { useEffect, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    MenuItem,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { MdOutlinePeople, MdPersonSearch, MdSearch } from "react-icons/md";
import { useCourse } from "@/contexts/CourseContext";
import { useExam, type AdminExamTree, type CandidateStatus } from "@/contexts/ExamContext";
import { EmptyState, GlassCard, LoadingState } from "@/components/course-admin/ui";
import { CANDIDATE_STATUS_LABELS, ExamChip, ROUND_META, ROUND_STATUS_LABELS, formatDateTime } from "./exam-ui";
import CandidateDrawer from "./CandidateDrawer";

const ROUND_DOT: Record<string, string> = {
    passed: "#22C55E",
    failed: "#F59E0B",
    exhausted: "#F87171",
    in_progress: "#38BDF8",
    under_review: "#A855F7",
    eligible: "#5B7CFF",
    locked: "rgba(255,255,255,0.18)",
};

export default function CandidatesTab({ exam }: { exam: AdminExamTree }) {
    const { examCandidates, loadingCandidates, getExamCandidates } = useExam();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<"" | CandidateStatus>("");
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [openStudentId, setOpenStudentId] = useState<string | null>(null);
    const [finding, setFinding] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            getExamCandidates(exam.examId, { search: search.trim() || undefined, status: status || undefined, page: page + 1, pageSize });
        }, 250);
        return () => clearTimeout(timer);
    }, [exam.examId, search, status, page, pageSize, getExamCandidates]);

    const data = examCandidates;
    const rows = data?.items.filter((c) => c.examId === exam.examId) ?? [];

    return (
        <Box>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2, alignItems: { md: "center" } }}>
                <TextField
                    size="small"
                    placeholder="Search name, email, phone or registration no."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(0);
                    }}
                    sx={{ flex: 1, maxWidth: { md: 420 } }}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><MdSearch /></InputAdornment> } }}
                />
                <TextField
                    select
                    size="small"
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value as "" | CandidateStatus);
                        setPage(0);
                    }}
                    sx={{ minWidth: 200 }}
                    slotProps={{ select: { displayEmpty: true } }}
                >
                    <MenuItem value="">All statuses</MenuItem>
                    {(Object.keys(CANDIDATE_STATUS_LABELS) as CandidateStatus[]).map((s) => (
                        <MenuItem key={s} value={s}>
                            {CANDIDATE_STATUS_LABELS[s]}
                        </MenuItem>
                    ))}
                </TextField>
                <Box sx={{ flex: 1 }} />
                <Button variant="outlined" startIcon={<MdPersonSearch />} onClick={() => setFinding(true)}>
                    Find enrolled student
                </Button>
            </Stack>

            {loadingCandidates && !data ? (
                <LoadingState label="Loading candidates…" />
            ) : !rows.length ? (
                <EmptyState
                    icon={<MdOutlinePeople />}
                    title={search || status ? "No candidates match" : "No candidates yet"}
                    description="Students appear here once they open the exam. Use “Find enrolled student” to pre-unlock it or start an in-centre round for anyone in the course."
                />
            ) : (
                <GlassCard>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Rounds</TableCell>
                                    <TableCell>Certificate</TableCell>
                                    <TableCell>Last attempt</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((c) => (
                                    <TableRow key={c.candidateId} hover sx={{ cursor: "pointer" }} onClick={() => setOpenStudentId(c.studentId)}>
                                        <TableCell>
                                            <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                                                <Avatar src={c.student.studentPhoto ?? undefined} sx={{ width: 30, height: 30 }}>
                                                    {c.student.studentName[0]}
                                                </Avatar>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                                                        {c.student.studentName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" noWrap component="div">
                                                        {c.student.studentRegistrationNumber ?? c.student.email ?? c.student.phoneNumber}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                                                <ExamChip status={c.candidateStatus} label={CANDIDATE_STATUS_LABELS[c.candidateStatus]} />
                                                {c.unlockOverride && <ExamChip status={c.unlockOverride === "locked" ? "blocked" : "eligible"} label={`Forced ${c.unlockOverride}`} />}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={0.75}>
                                                {exam.rounds.map((round) => {
                                                    const progress = c.roundProgresses.find((p) => p.roundId === round.roundId);
                                                    const s = progress?.roundStatus ?? "locked";
                                                    return (
                                                        <Tooltip key={round.roundId} title={`${round.title}: ${ROUND_STATUS_LABELS[s]}${progress ? ` · ${progress.attemptsUsed} attempt${progress.attemptsUsed === 1 ? "" : "s"}` : ""}`}>
                                                            <Box
                                                                sx={{
                                                                    px: 0.75,
                                                                    py: 0.25,
                                                                    borderRadius: "6px",
                                                                    fontSize: 11,
                                                                    fontWeight: 700,
                                                                    border: `1px solid ${ROUND_DOT[s]}`,
                                                                    color: s === "locked" ? "text.secondary" : ROUND_DOT[s],
                                                                }}
                                                            >
                                                                {ROUND_META[round.roundType].short}
                                                            </Box>
                                                        </Tooltip>
                                                    );
                                                })}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            {c.certificate ? (
                                                <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                                                    <Typography variant="caption">{c.certificate.certificateNo}</Typography>
                                                    {c.certificate.certificateStatus === "revoked" && <ExamChip status="revoked" />}
                                                </Stack>
                                            ) : (
                                                <Typography variant="caption" color="text.secondary">
                                                    —
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>{formatDateTime(c.lastAttemptAt)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={data?.total ?? 0}
                        page={page}
                        rowsPerPage={pageSize}
                        rowsPerPageOptions={[10, 25, 50, 100]}
                        onPageChange={(_, p) => setPage(p)}
                        onRowsPerPageChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPage(0);
                        }}
                    />
                </GlassCard>
            )}

            <CandidateDrawer exam={exam} studentId={openStudentId} onClose={() => setOpenStudentId(null)} />
            <FindStudentDialog
                open={finding}
                courseId={exam.courseId}
                onClose={() => setFinding(false)}
                onPick={(studentId) => {
                    setFinding(false);
                    setOpenStudentId(studentId);
                }}
            />
        </Box>
    );
}

/** Searches students enrolled in the course (even ones who never opened the exam). */
function FindStudentDialog({ open, courseId, onClose, onPick }: { open: boolean; courseId: string; onClose: () => void; onPick: (studentId: string) => void }) {
    const { courseStudents, getCourseStudents } = useCourse();
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;
        const timer = setTimeout(async () => {
            setLoading(true);
            await getCourseStudents(courseId, { q: q.trim() || undefined, page: 1, pageSize: 15 });
            setLoading(false);
        }, 250);
        return () => clearTimeout(timer);
    }, [open, q, courseId, getCourseStudents]);

    const students = courseStudents?.students.filter((s) => s.courseId === courseId) ?? [];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Find an enrolled student</DialogTitle>
            <DialogContent dividers>
                <TextField
                    autoFocus
                    fullWidth
                    size="small"
                    placeholder="Name, email or phone"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><MdSearch /></InputAdornment> } }}
                />
                {loading && !students.length ? (
                    <LoadingState label="Searching…" />
                ) : !students.length ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                        No enrolled students found.
                    </Typography>
                ) : (
                    <List dense sx={{ mt: 1 }}>
                        {students.map((s) => (
                            <ListItemButton key={s.enrollmentId} onClick={() => onPick(s.studentId)} sx={{ borderRadius: "10px" }}>
                                <ListItemAvatar>
                                    <Avatar src={s.student.studentPhoto ?? undefined}>{s.student.studentName[0]}</Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={s.student.studentName}
                                    secondary={`${s.student.email ?? s.student.phoneNumber} · ${Math.round(s.progressPct)}% · ${s.enrollmentStatus.replace(/_/g, " ")}`}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button color="inherit" onClick={onClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
