"use client";

import React, { useEffect, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    LinearProgress,
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
import { MdExpandMore, MdOutlineInsights, MdOutlinePeople, MdRestartAlt, MdSearch, MdStars } from "react-icons/md";
import { useCourse, type CourseAnalytics, type CourseStudentRow, type StudentCourseProgressResult } from "@/contexts/CourseContext";
import { EmptyState, GlassCard, KindIcon, LoadingState, StatTile, StatusChip, formatDate, notify, useConfirm } from "../ui";

/* ───────────────────────────── students ───────────────────────────── */

export function StudentsTab({ courseId }: { courseId: string }) {
    const { courseStudents, getCourseStudents, resetStudentProgress } = useCourse();
    const { confirm, dialog } = useConfirm();
    const [q, setQ] = useState("");
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [loading, setLoading] = useState(true);
    const [viewing, setViewing] = useState<CourseStudentRow | null>(null);
    const [adjusting, setAdjusting] = useState<CourseStudentRow | null>(null);

    useEffect(() => {
        const timer = setTimeout(async () => {
            setLoading(true);
            await getCourseStudents(courseId, { q: q.trim() || undefined, page: page + 1, pageSize });
            setLoading(false);
        }, 250);
        return () => clearTimeout(timer);
    }, [courseId, q, page, pageSize, getCourseStudents]);

    const reload = () => getCourseStudents(courseId, { q: q.trim() || undefined, page: page + 1, pageSize });

    const resetCourse = async (row: CourseStudentRow) => {
        const ok = await confirm({
            title: `Reset ${row.student.studentName}'s progress?`,
            description: "All lesson progress in this course is cleared and the XP it earned is removed. Quiz and lab attempts are kept for audit.",
            confirmLabel: "Reset progress",
            danger: true,
        });
        if (ok && notify(await resetStudentProgress(courseId, row.studentId))) reload();
    };

    const rows = courseStudents?.students ?? [];

    return (
        <Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2, alignItems: { sm: "center" } }}>
                <TextField
                    size="small"
                    placeholder="Search by name, email or phone"
                    value={q}
                    onChange={(e) => {
                        setQ(e.target.value);
                        setPage(0);
                    }}
                    sx={{ flex: 1, maxWidth: { sm: 420 } }}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><MdSearch /></InputAdornment> } }}
                />
                <Typography variant="body2" color="text.secondary">
                    {courseStudents?.total ?? 0} enrolled
                </Typography>
            </Stack>

            {loading && !courseStudents ? (
                <LoadingState label="Loading students…" />
            ) : !rows.length ? (
                <EmptyState
                    icon={<MdOutlinePeople />}
                    title="No students yet"
                    description="Students appear here after they open My Courses with access through a course, package or batch."
                />
            ) : (
                <GlassCard>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student</TableCell>
                                    <TableCell>Batch</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell sx={{ minWidth: 160 }}>Progress</TableCell>
                                    <TableCell>XP</TableCell>
                                    <TableCell>Levels</TableCell>
                                    <TableCell>Last active</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.enrollmentId} hover>
                                        <TableCell>
                                            <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                                                <Avatar src={row.student.studentPhoto ?? undefined} sx={{ width: 30, height: 30 }}>
                                                    {row.student.studentName[0]}
                                                </Avatar>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                                                        {row.student.studentName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" noWrap component="div">
                                                        {row.student.email ?? row.student.phoneNumber}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{row.batch?.batchName ?? <Typography variant="caption" color="text.secondary">{row.accessSource ?? "—"}</Typography>}</TableCell>
                                        <TableCell>
                                            <StatusChip status={row.enrollmentStatus} />
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                                <LinearProgress variant="determinate" value={row.progressPct} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                                                <Typography variant="caption">{Math.round(row.progressPct)}%</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{row.earnedXp}</TableCell>
                                        <TableCell>{row.completedLevels}</TableCell>
                                        <TableCell>{formatDate(row.lastActivityAt)}</TableCell>
                                        <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                                            <Tooltip title="View progress">
                                                <IconButton size="small" onClick={() => setViewing(row)}>
                                                    <MdOutlineInsights />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Adjust XP">
                                                <IconButton size="small" onClick={() => setAdjusting(row)}>
                                                    <MdStars />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Reset course progress">
                                                <IconButton size="small" color="error" onClick={() => resetCourse(row)}>
                                                    <MdRestartAlt />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={courseStudents?.total ?? 0}
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

            {viewing && <StudentProgressDialog courseId={courseId} row={viewing} onClose={() => setViewing(null)} onChanged={reload} />}
            {adjusting && <AdjustXpDialog courseId={courseId} row={adjusting} onClose={() => setAdjusting(null)} />}
            {dialog}
        </Box>
    );
}

function StudentProgressDialog({ courseId, row, onClose, onChanged }: { courseId: string; row: CourseStudentRow; onClose: () => void; onChanged: () => void }) {
    const { getStudentCourseProgress, resetStudentProgress } = useCourse();
    const { confirm, dialog } = useConfirm();
    const [data, setData] = useState<StudentCourseProgressResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        const res = await getStudentCourseProgress(courseId, row.studentId);
        if (res.success && res.data) setData(res.data);
        else setError(res.message ?? "Failed to load progress");
    };

    useEffect(() => {
        let cancelled = false;
        getStudentCourseProgress(courseId, row.studentId).then((res) => {
            if (cancelled) return;
            if (res.success && res.data) setData(res.data);
            else setError(res.message ?? "Failed to load progress");
        });
        return () => {
            cancelled = true;
        };
    }, [courseId, row.studentId, getStudentCourseProgress]);

    const resetLesson = async (lessonId: string, title: string) => {
        if (!(await confirm({ title: `Reset "${title}"?`, description: "The lesson's progress and XP are removed for this student.", confirmLabel: "Reset", danger: true }))) return;
        if (notify(await resetStudentProgress(courseId, row.studentId, lessonId))) {
            await load();
            onChanged();
        }
    };

    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{row.student.studentName} — progress</DialogTitle>
            <DialogContent dividers>
                {error ? (
                    <Typography color="error">{error}</Typography>
                ) : !data ? (
                    <LoadingState />
                ) : (
                    <Stack spacing={2}>
                        <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: "repeat(4, 1fr)" }}>
                            <StatTile label="Progress" value={`${Math.round(data.enrollment.progressPct)}%`} />
                            <StatTile label="XP" value={data.enrollment.earnedXp} />
                            <StatTile label="Lessons done" value={data.enrollment.completedLessons} />
                            <StatTile label="Levels done" value={data.enrollment.completedLevels} />
                        </Box>
                        {data.levels.map((level) => (
                            <Accordion key={level.levelId} disableGutters>
                                <AccordionSummary expandIcon={<MdExpandMore />}>
                                    <Typography sx={{ fontWeight: 600 }}>
                                        Level {level.levelNo} — {level.title}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack spacing={1.5}>
                                        {level.modules.map((module) => (
                                            <Box key={module.moduleId}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                                    {module.title}
                                                </Typography>
                                                <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                                    {module.lessons.map((lesson) => (
                                                        <Stack key={lesson.lessonId} direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                                            <KindIcon kind={lesson.kind} size={14} />
                                                            <Typography variant="body2" sx={{ flex: 1 }} noWrap>
                                                                {lesson.title}
                                                            </Typography>
                                                            {lesson.progress?.kind === "video" && lesson.progress.progressStatus !== "completed" && (
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {Math.round(lesson.progress.progressPct)}% watched
                                                                </Typography>
                                                            )}
                                                            {lesson.progress?.bestScorePct !== null && lesson.progress?.bestScorePct !== undefined && (
                                                                <Typography variant="caption" color="text.secondary">
                                                                    best {lesson.progress.bestScorePct}%
                                                                </Typography>
                                                            )}
                                                            <Typography variant="caption" sx={{ minWidth: 60, textAlign: "right" }}>
                                                                {lesson.progress?.xpEarned ?? 0}/{lesson.xp} XP
                                                            </Typography>
                                                            <StatusChip status={lesson.progress?.progressStatus ?? "not_started"} />
                                                            <Tooltip title="Reset this lesson">
                                                                <span>
                                                                    <IconButton size="small" disabled={!lesson.progress} onClick={() => resetLesson(lesson.lessonId, lesson.title)}>
                                                                        <MdRestartAlt />
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>
                                                        </Stack>
                                                    ))}
                                                </Stack>
                                            </Box>
                                        ))}
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                        {(data.quizAttempts.length > 0 || data.labAttempts.length > 0) && (
                            <GlassCard sx={{ p: 2 }}>
                                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                    Attempts
                                </Typography>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Type</TableCell>
                                            <TableCell>#</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Result</TableCell>
                                            <TableCell>XP</TableCell>
                                            <TableCell>Started</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.quizAttempts.map((a) => (
                                            <TableRow key={a.attemptId}>
                                                <TableCell>Quiz</TableCell>
                                                <TableCell>{a.attemptNumber}</TableCell>
                                                <TableCell><StatusChip status={a.attemptStatus} /></TableCell>
                                                <TableCell>{a.scorePct}% {a.passed ? "· passed" : ""}</TableCell>
                                                <TableCell>+{a.xpAwarded}</TableCell>
                                                <TableCell>{formatDate(a.startedAt)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {data.labAttempts.map((a) => (
                                            <TableRow key={a.attemptId}>
                                                <TableCell>Lab</TableCell>
                                                <TableCell>{a.attemptNumber}</TableCell>
                                                <TableCell><StatusChip status={a.attemptStatus} /></TableCell>
                                                <TableCell>{a.accuracyPct !== null ? `${a.accuracyPct}%` : "—"} {a.solutionUsed ? "· solution used" : ""}</TableCell>
                                                <TableCell>+{a.xpAwarded}</TableCell>
                                                <TableCell>{formatDate(a.startedAt)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </GlassCard>
                        )}
                    </Stack>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
            {dialog}
        </Dialog>
    );
}

function AdjustXpDialog({ courseId, row, onClose }: { courseId: string; row: CourseStudentRow; onClose: () => void }) {
    const { adjustStudentXp, saving } = useCourse();
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");

    const submit = async () => {
        const value = Math.trunc(Number(amount));
        if (!value || !note.trim()) return notify({ success: false, message: "Enter a non-zero amount and a reason", data: null });
        const res = await adjustStudentXp(row.studentId, { amount: value, note: note.trim(), courseId });
        if (notify(res, res.data ? `XP adjusted — total ${res.data.totalXp} XP (level ${res.data.rankLevel})` : undefined)) onClose();
    };

    return (
        <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Adjust XP — {row.student.studentName}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField label="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} helperText="Use a negative number to deduct" />
                    <TextField label="Reason" value={note} onChange={(e) => setNote(e.target.value)} multiline minRows={2} />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={submit} disabled={saving}>
                    Apply
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ───────────────────────────── analytics ───────────────────────────── */

export function AnalyticsTab({ courseId }: { courseId: string }) {
    const { getCourseAnalytics } = useCourse();
    const [data, setData] = useState<CourseAnalytics | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        getCourseAnalytics(courseId).then((res) => {
            if (cancelled) return;
            if (res.success && res.data) setData(res.data);
            else setError(res.message ?? "Failed to load analytics");
        });
        return () => {
            cancelled = true;
        };
    }, [courseId, getCourseAnalytics]);

    if (error) return <Typography color="error">{error}</Typography>;
    if (!data) return <LoadingState label="Crunching numbers…" />;

    const enrolled = Object.values(data.enrollments).reduce((sum, n) => sum + (n ?? 0), 0);
    const maxCompletions = Math.max(1, ...data.lessonCompletionsByLevel.map((l) => l.lessonCompletions));

    return (
        <Stack spacing={2.5}>
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(5, 1fr)" } }}>
                <StatTile label="Enrolled" value={enrolled} />
                <StatTile label="In progress" value={data.enrollments.in_progress ?? 0} />
                <StatTile label="Completed" value={data.enrollments.completed ?? 0} />
                <StatTile label="Avg. progress" value={`${Math.round(data.averageProgressPct)}%`} />
                <StatTile label="Avg. XP" value={Math.round(data.averageEarnedXp)} />
            </Box>

            <GlassCard sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Lesson completions by level
                </Typography>
                <Stack spacing={1.25}>
                    {data.lessonCompletionsByLevel.map((level) => (
                        <Stack key={level.levelId} direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                            <Typography variant="body2" sx={{ width: { xs: 120, md: 260 } }} noWrap>
                                L{level.levelNo} · {level.title}
                            </Typography>
                            <LinearProgress variant="determinate" value={(level.lessonCompletions / maxCompletions) * 100} sx={{ flex: 1, height: 8, borderRadius: 4 }} />
                            <Typography variant="caption" sx={{ width: 40, textAlign: "right" }}>
                                {level.lessonCompletions}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
            </GlassCard>

            <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" } }}>
                <GlassCard sx={{ p: 2.5 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Quizzes
                    </Typography>
                    {data.quizzes.length ? (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Quiz</TableCell>
                                    <TableCell align="right">Attempts</TableCell>
                                    <TableCell align="right">Avg. score</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.quizzes.map((q) => (
                                    <TableRow key={q.lessonId}>
                                        <TableCell>{q.title}</TableCell>
                                        <TableCell align="right">{q.attempts}</TableCell>
                                        <TableCell align="right">{Math.round(q.averageScorePct)}%</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            No quiz attempts yet.
                        </Typography>
                    )}
                </GlassCard>
                <GlassCard sx={{ p: 2.5 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Labs
                    </Typography>
                    {data.labs.length ? (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Lab</TableCell>
                                    <TableCell align="right">Completed</TableCell>
                                    <TableCell align="right">Used solution</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.labs.map((l) => (
                                    <TableRow key={l.lessonId}>
                                        <TableCell>{l.title}</TableCell>
                                        <TableCell align="right">{l.completed}</TableCell>
                                        <TableCell align="right">{l.solutionUnlockRatePct}%</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            No completed labs yet.
                        </Typography>
                    )}
                </GlassCard>
            </Box>

            <GlassCard sx={{ p: 2.5 }}>
                <Typography variant="subtitle1">Hardest questions</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                    Lowest correct rate (questions with at least 5 answers).
                </Typography>
                {data.hardestQuestions.length ? (
                    <Stack spacing={1}>
                        {data.hardestQuestions.map((q) => (
                            <Stack key={q.questionId} direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                                <Typography variant="body2" sx={{ flex: 1 }} noWrap>
                                    {q.prompt}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {q.answers} answers
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: q.correctRatePct < 50 ? "error.main" : "warning.main", width: 48, textAlign: "right" }}>
                                    {q.correctRatePct}%
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        Not enough answers yet.
                    </Typography>
                )}
            </GlassCard>
        </Stack>
    );
}
