"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Avatar,
    Box,
    Button,
    Chip,
    IconButton,
    InputAdornment,
    LinearProgress,
    Paper,
    Skeleton,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    MdAdd,
    MdArrowBack,
    MdOutlineAssignment,
    MdOutlineAssignmentTurnedIn,
    MdOutlineDeleteOutline,
    MdOutlineDescription,
    MdOutlineEdit,
    MdOutlineGroups,
    MdOutlineLink,
    MdOutlineSchedule,
    MdOutlineSearch,
    MdOutlineTaskAlt,
    MdOutlineVisibility,
} from "react-icons/md";
import toast from "react-hot-toast";
import TrainerDashboardLayout from "@/layouts/TrainerDashboardLayout";
import {
    useAssignment,
    type AssignmentTask,
    type AssignmentTaskWithCounts,
} from "@/contexts/AssignmentContext";
import AssignmentFormModal from "@/components/assignments/AssignmentFormModal";
import TaskFormModal from "@/components/assignments/TaskFormModal";
import ReviewSubmissionModal from "@/components/assignments/ReviewSubmissionModal";
import {
    A_BRAND,
    EmptyState,
    PROGRESS_STATUS_TONE,
    StatTile,
    ToneChip,
    formatDate,
    formatDuration,
    GRADE_TONE,
} from "@/components/assignments/assignment-ui";

function initials(name: string): string {
    return name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");
}

export default function TrainerAssignmentDetailPage() {
    const router = useRouter();
    const params = useParams<{ batch_id: string; assignment_id: string }>();
    const batchId = params?.batch_id as string;
    const assignmentId = params?.assignment_id as string;

    const {
        assignmentDetail,
        assignmentSubmissions,
        loadingAssignmentDetail,
        loadingSubmissions,
        getAssignmentById,
        getAssignmentSubmissions,
        removeTask,
    } = useAssignment();

    const [tab, setTab] = useState(0);
    const [editAssignmentOpen, setEditAssignmentOpen] = useState(false);
    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<AssignmentTask | null>(null);
    const [reviewStudentId, setReviewStudentId] = useState<string | null>(null);
    const [studentSearch, setStudentSearch] = useState("");
    const [now] = useState(() => Date.now());

    const refreshDetail = useCallback(() => {
        if (assignmentId) getAssignmentById(assignmentId);
    }, [assignmentId, getAssignmentById]);

    const refreshSubmissions = useCallback(() => {
        if (assignmentId) getAssignmentSubmissions(assignmentId);
    }, [assignmentId, getAssignmentSubmissions]);

    useEffect(() => {
        refreshDetail();
        refreshSubmissions();
    }, [refreshDetail, refreshSubmissions]);

    const assignment = assignmentDetail?.assignment ?? null;
    const stats = assignmentDetail?.stats ?? null;
    const tasks = assignment?.tasks ?? [];

    const filteredStudents = useMemo(() => {
        const list = assignmentSubmissions?.students ?? [];
        const term = studentSearch.trim().toLowerCase();
        if (!term) return list;
        return list.filter(
            (row) =>
                row.student.studentName.toLowerCase().includes(term) ||
                row.student.phoneNumber.includes(term) ||
                (row.student.email ?? "").toLowerCase().includes(term)
        );
    }, [assignmentSubmissions, studentSearch]);

    const deleteTask = async (task: AssignmentTaskWithCounts) => {
        const res = await removeTask(task.taskId);
        if (!res.success) {
            toast.error(res.message ?? "Failed to remove task");
            return;
        }
        toast.success("Task removed");
        refreshDetail();
        refreshSubmissions();
    };

    if (loadingAssignmentDetail && !assignment) {
        return (
            <TrainerDashboardLayout title="Assignment">
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Skeleton variant="rounded" height={120} />
                    <Skeleton variant="rounded" height={56} />
                    <Skeleton variant="rounded" height={320} />
                </Box>
            </TrainerDashboardLayout>
        );
    }

    if (!assignment) {
        return (
            <TrainerDashboardLayout title="Assignment">
                <EmptyState
                    label="Assignment not found."
                    color={A_BRAND.rose}
                    icon={<MdOutlineAssignment />}
                    action={
                        <Button
                            onClick={() => router.push(`/dashboard/trainer/my-batches/${batchId}`)}
                            size="small"
                            variant="contained"
                            disableElevation
                            sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                borderRadius: 1.5,
                                backgroundColor: A_BRAND.primary,
                                "&:hover": { backgroundColor: A_BRAND.primaryHover },
                            }}
                        >
                            Back to batch
                        </Button>
                    }
                />
            </TrainerDashboardLayout>
        );
    }

    const isOverdue = new Date(assignment.assignmentDueDate).getTime() < now;

    return (
        <TrainerDashboardLayout title="Assignment">
            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.5, sm: 2.5 } }}>
                {/* Header */}
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 2,
                        border: `1px solid ${A_BRAND.violet}`,
                        background: `linear-gradient(120deg, ${A_BRAND.primary} 0%, ${A_BRAND.sky} 50%, ${A_BRAND.violet} 100%)`,
                        color: "#ffffff",
                        p: { xs: 1.5, sm: 2.25 },
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.25,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton
                            size="small"
                            onClick={() => router.push(`/dashboard/trainer/my-batches/${batchId}`)}
                            sx={{ color: "#ffffff", border: "1px solid #ffffff", borderRadius: 1.5 }}
                        >
                            <MdArrowBack />
                        </IconButton>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontSize: { xs: 16, sm: 21 }, fontWeight: 800, lineHeight: 1.2 }} noWrap>
                                {assignment.assignmentTitle}
                            </Typography>
                            <Typography sx={{ fontSize: 12, fontWeight: 500 }} noWrap>
                                {assignment.batch.batchName} · {assignment.batch.course.courseName}
                            </Typography>
                        </Box>
                        <Button
                            onClick={() => setEditAssignmentOpen(true)}
                            size="small"
                            variant="contained"
                            disableElevation
                            startIcon={<MdOutlineEdit size={14} />}
                            sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                borderRadius: 1.5,
                                backgroundColor: "#ffffff",
                                color: A_BRAND.violet,
                                whiteSpace: "nowrap",
                                "&:hover": { backgroundColor: "#f8fafc" },
                            }}
                        >
                            Edit
                        </Button>
                    </Box>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                        <Chip size="small" label={`Assigned ${formatDate(assignment.assignedOn)}`} sx={{ backgroundColor: "#0369a1", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }} />
                        <Chip
                            size="small"
                            label={`Due ${formatDate(assignment.assignmentDueDate)}`}
                            sx={{ backgroundColor: isOverdue ? A_BRAND.rose : "#6d28d9", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }}
                        />
                        <Chip
                            size="small"
                            label={`${stats?.totalTaskMarks ?? 0} / ${assignment.maximumMarks ?? stats?.totalTaskMarks ?? 0} marks`}
                            sx={{ backgroundColor: "#0e7490", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }}
                        />
                        {!assignment.isPublished && (
                            <Chip size="small" label="Draft" sx={{ backgroundColor: "#1e293b", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }} />
                        )}
                    </Box>

                    {assignment.assignmentDesc && (
                        <Typography sx={{ fontSize: 12.5, opacity: 0.95, whiteSpace: "pre-wrap" }}>
                            {assignment.assignmentDesc}
                        </Typography>
                    )}
                </Paper>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                    <StatTile label="Tasks" value={stats?.totalTasks ?? 0} color={A_BRAND.sky} bg={A_BRAND.skyBg} icon={<MdOutlineTaskAlt />} />
                    <StatTile label="Students" value={stats?.totalStudents ?? 0} color={A_BRAND.violet} bg={A_BRAND.violetBg} icon={<MdOutlineGroups />} />
                    <StatTile label="Pending review" value={stats?.pendingReviewCount ?? 0} color={A_BRAND.orange} bg={A_BRAND.orangeBg} icon={<MdOutlineVisibility />} />
                    <StatTile label="Completed" value={stats?.completedStudents ?? 0} color={A_BRAND.emerald} bg={A_BRAND.emeraldBg} icon={<MdOutlineAssignmentTurnedIn />} />
                </div>

                {/* Tabs */}
                <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${A_BRAND.violet}`, backgroundColor: "#ffffff" }}>
                    <Tabs
                        value={tab}
                        onChange={(_, next) => setTab(next)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            minHeight: 44,
                            "& .MuiTab-root": { minHeight: 44, textTransform: "none", fontWeight: 700, fontSize: 13 },
                            "& .Mui-selected": { color: `${A_BRAND.violet} !important` },
                            "& .MuiTabs-indicator": { backgroundColor: A_BRAND.violet, height: 3 },
                        }}
                    >
                        <Tab icon={<MdOutlineTaskAlt size={16} />} iconPosition="start" label={`Tasks (${tasks.length})`} />
                        <Tab
                            icon={<MdOutlineGroups size={16} />}
                            iconPosition="start"
                            label={`Submissions (${assignmentSubmissions?.totalStudents ?? 0})`}
                        />
                    </Tabs>
                </Paper>

                {/* Tasks tab */}
                {tab === 0 && (
                    <div className="flex flex-col gap-2 sm:gap-3">
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: 2,
                                border: `1px solid ${A_BRAND.cyan}`,
                                backgroundColor: "#ffffff",
                                p: { xs: 1.25, sm: 1.5 },
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                flexWrap: "wrap",
                            }}
                        >
                            <Box
                                sx={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 1.5,
                                    backgroundColor: A_BRAND.cyanBg,
                                    color: A_BRAND.sky,
                                    display: "grid",
                                    placeItems: "center",
                                    fontSize: 17,
                                }}
                            >
                                <MdOutlineTaskAlt />
                            </Box>
                            <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: A_BRAND.text, flex: 1 }}>
                                {tasks.length} task{tasks.length === 1 ? "" : "s"} in this assignment
                            </Typography>
                            <Button
                                onClick={() => {
                                    setEditingTask(null);
                                    setTaskModalOpen(true);
                                }}
                                size="small"
                                variant="contained"
                                disableElevation
                                startIcon={<MdAdd size={16} />}
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 700,
                                    borderRadius: 1.5,
                                    backgroundColor: A_BRAND.primary,
                                    whiteSpace: "nowrap",
                                    "&:hover": { backgroundColor: A_BRAND.primaryHover },
                                }}
                            >
                                Add task
                            </Button>
                        </Paper>

                        {tasks.length === 0 ? (
                            <EmptyState label="No tasks added yet. Add the first task to this assignment." icon={<MdOutlineTaskAlt />} />
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-3">
                                {tasks.map((task) => {
                                    const total = stats?.totalStudents ?? 0;
                                    const rate = total > 0 ? Math.round((task.approvedCount / total) * 100) : 0;
                                    return (
                                        <Paper
                                            key={task.taskId}
                                            elevation={0}
                                            sx={{
                                                borderRadius: 2,
                                                border: `1px solid ${A_BRAND.sky}`,
                                                backgroundColor: "#ffffff",
                                                p: { xs: 1.25, sm: 1.5 },
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 1,
                                                transition: "box-shadow .2s",
                                                "&:hover": { boxShadow: 4 },
                                            }}
                                        >
                                            <div className="flex items-start gap-1.5">
                                                <Box
                                                    sx={{
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: 1.5,
                                                        backgroundColor: A_BRAND.skyBg,
                                                        color: A_BRAND.sky,
                                                        display: "grid",
                                                        placeItems: "center",
                                                        fontSize: 12,
                                                        fontWeight: 800,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {task.taskOrder}
                                                </Box>
                                                <div className="min-w-0 flex-1">
                                                    <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: A_BRAND.text, lineHeight: 1.3 }}>
                                                        {task.taskTitle}
                                                    </Typography>
                                                    {task.taskObjective && (
                                                        <Typography
                                                            sx={{
                                                                fontSize: 11.5,
                                                                color: A_BRAND.muted,
                                                                display: "-webkit-box",
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: "vertical",
                                                                overflow: "hidden",
                                                            }}
                                                        >
                                                            {task.taskObjective}
                                                        </Typography>
                                                    )}
                                                </div>
                                                <Tooltip title="Edit task">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setEditingTask(task);
                                                            setTaskModalOpen(true);
                                                        }}
                                                        sx={{ color: A_BRAND.violet }}
                                                    >
                                                        <MdOutlineEdit size={16} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Remove task">
                                                    <IconButton size="small" onClick={() => deleteTask(task)} sx={{ color: A_BRAND.rose }}>
                                                        <MdOutlineDeleteOutline size={16} />
                                                    </IconButton>
                                                </Tooltip>
                                            </div>

                                            <div className="flex flex-wrap gap-1">
                                                <Chip
                                                    size="small"
                                                    icon={<MdOutlineSchedule size={13} />}
                                                    label={`Due ${formatDate(task.taskDueDate)}`}
                                                    sx={{ backgroundColor: A_BRAND.violetBg, color: A_BRAND.violet, fontWeight: 700, fontSize: 11, height: 22 }}
                                                />
                                                {task.estimatedTimeToComplete != null && (
                                                    <Chip
                                                        size="small"
                                                        label={formatDuration(task.estimatedTimeToComplete)}
                                                        sx={{ backgroundColor: A_BRAND.amberBg, color: A_BRAND.amber, fontWeight: 700, fontSize: 11, height: 22 }}
                                                    />
                                                )}
                                                {task.maximumMarks != null && (
                                                    <Chip
                                                        size="small"
                                                        label={`${task.maximumMarks} marks`}
                                                        sx={{ backgroundColor: A_BRAND.emeraldBg, color: A_BRAND.emerald, fontWeight: 700, fontSize: 11, height: 22 }}
                                                    />
                                                )}
                                                {task.referenceDocumentsInTasks.length > 0 && (
                                                    <Chip
                                                        size="small"
                                                        icon={<MdOutlineDescription size={13} />}
                                                        label={`${task.referenceDocumentsInTasks.length} docs`}
                                                        sx={{ backgroundColor: A_BRAND.slateBg, color: A_BRAND.slate, fontWeight: 700, fontSize: 11, height: 22 }}
                                                    />
                                                )}
                                                {task.referenceLinks.length > 0 && (
                                                    <Chip
                                                        size="small"
                                                        icon={<MdOutlineLink size={13} />}
                                                        label={`${task.referenceLinks.length} links`}
                                                        sx={{ backgroundColor: A_BRAND.slateBg, color: A_BRAND.slate, fontWeight: 700, fontSize: 11, height: 22 }}
                                                    />
                                                )}
                                            </div>

                                            <div className="grid grid-cols-3 gap-1.5">
                                                <Count label="Submitted" value={task.submissionCount} color={A_BRAND.sky} bg={A_BRAND.skyBg} />
                                                <Count label="To review" value={task.pendingReviewCount} color={A_BRAND.orange} bg={A_BRAND.orangeBg} />
                                                <Count label="Approved" value={task.approvedCount} color={A_BRAND.emerald} bg={A_BRAND.emeraldBg} />
                                            </div>

                                            <Box>
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <Typography sx={{ fontSize: 11, color: A_BRAND.muted, fontWeight: 600 }}>
                                                        Approved of {stats?.totalStudents ?? 0} students
                                                    </Typography>
                                                    <Typography sx={{ fontSize: 11, color: A_BRAND.text, fontWeight: 800 }}>{rate}%</Typography>
                                                </div>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={rate}
                                                    sx={{
                                                        height: 6,
                                                        borderRadius: 4,
                                                        backgroundColor: A_BRAND.slateBg,
                                                        "& .MuiLinearProgress-bar": { backgroundColor: A_BRAND.emerald, borderRadius: 4 },
                                                    }}
                                                />
                                            </Box>
                                        </Paper>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Submissions tab */}
                {tab === 1 && (
                    <div className="flex flex-col gap-2 sm:gap-3">
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: 2,
                                border: `1px solid ${A_BRAND.orange}`,
                                backgroundColor: "#ffffff",
                                p: { xs: 1.25, sm: 1.5 },
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                flexWrap: "wrap",
                            }}
                        >
                            <Chip
                                size="small"
                                label={`Not started ${assignmentSubmissions?.summary.notStarted ?? 0}`}
                                sx={{ backgroundColor: A_BRAND.slateBg, color: A_BRAND.slate, fontWeight: 700, height: 22 }}
                            />
                            <Chip
                                size="small"
                                label={`In progress ${assignmentSubmissions?.summary.inProgress ?? 0}`}
                                sx={{ backgroundColor: A_BRAND.orangeBg, color: A_BRAND.orange, fontWeight: 700, height: 22 }}
                            />
                            <Chip
                                size="small"
                                label={`Completed ${assignmentSubmissions?.summary.completed ?? 0}`}
                                sx={{ backgroundColor: A_BRAND.emeraldBg, color: A_BRAND.emerald, fontWeight: 700, height: 22 }}
                            />
                            <Box sx={{ flex: 1 }} />
                            <TextField
                                size="small"
                                placeholder="Search students"
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                                sx={{ minWidth: { xs: "100%", sm: 240 } }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <MdOutlineSearch color={A_BRAND.muted} />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Paper>

                        {loadingSubmissions && !assignmentSubmissions ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <Skeleton key={index} variant="rounded" height={116} sx={{ borderRadius: 2 }} />
                                ))}
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <EmptyState label="No students match this search." color={A_BRAND.orange} icon={<MdOutlineGroups />} />
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
                                {filteredStudents.map((row) => {
                                    const total = row.totalTasks || 1;
                                    const rate = Math.round((row.approvedTasks / total) * 100);
                                    const tone = PROGRESS_STATUS_TONE[row.progressStatus];
                                    return (
                                        <Paper
                                            key={row.batchStudentId}
                                            elevation={0}
                                            sx={{
                                                borderRadius: 2,
                                                border: `1px solid ${tone.color}`,
                                                backgroundColor: "#ffffff",
                                                p: { xs: 1.25, sm: 1.5 },
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 1,
                                                transition: "box-shadow .2s",
                                                "&:hover": { boxShadow: 4 },
                                            }}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <Avatar
                                                    src={row.student.studentPhoto ?? undefined}
                                                    sx={{ width: 34, height: 34, fontSize: 12, fontWeight: 800, backgroundColor: A_BRAND.violetBg, color: A_BRAND.violet }}
                                                >
                                                    {initials(row.student.studentName)}
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: A_BRAND.text }} noWrap>
                                                        {row.student.studentName}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: 11, color: A_BRAND.muted }} noWrap>
                                                        {row.student.studentRegistrationNumber ?? `+${row.student.callingCode} ${row.student.phoneNumber}`}
                                                    </Typography>
                                                </div>
                                                <ToneChip tone={tone} />
                                            </div>

                                            <div className="flex flex-wrap gap-1">
                                                <Chip
                                                    size="small"
                                                    label={`${row.approvedTasks}/${row.totalTasks} approved`}
                                                    sx={{ backgroundColor: A_BRAND.emeraldBg, color: A_BRAND.emerald, fontWeight: 700, fontSize: 11, height: 22 }}
                                                />
                                                <Chip
                                                    size="small"
                                                    label={`${row.submittedTasks} submitted`}
                                                    sx={{ backgroundColor: A_BRAND.skyBg, color: A_BRAND.sky, fontWeight: 700, fontSize: 11, height: 22 }}
                                                />
                                                {row.pendingReviewCount > 0 && (
                                                    <Chip
                                                        size="small"
                                                        label={`${row.pendingReviewCount} to review`}
                                                        sx={{ backgroundColor: A_BRAND.orangeBg, color: A_BRAND.orange, fontWeight: 700, fontSize: 11, height: 22 }}
                                                    />
                                                )}
                                                <Chip
                                                    size="small"
                                                    label={`${row.obtainedMarks}/${row.totalMarks} marks`}
                                                    sx={{ backgroundColor: A_BRAND.violetBg, color: A_BRAND.violet, fontWeight: 700, fontSize: 11, height: 22 }}
                                                />
                                                {row.feedbackGrade && <ToneChip tone={GRADE_TONE[row.feedbackGrade]} />}
                                            </div>

                                            <LinearProgress
                                                variant="determinate"
                                                value={rate}
                                                sx={{
                                                    height: 6,
                                                    borderRadius: 4,
                                                    backgroundColor: A_BRAND.slateBg,
                                                    "& .MuiLinearProgress-bar": { backgroundColor: tone.color, borderRadius: 4 },
                                                }}
                                            />

                                            <Button
                                                onClick={() => setReviewStudentId(row.student.studentId)}
                                                size="small"
                                                variant="contained"
                                                disableElevation
                                                startIcon={<MdOutlineVisibility size={15} />}
                                                sx={{
                                                    textTransform: "none",
                                                    fontWeight: 700,
                                                    borderRadius: 1.5,
                                                    backgroundColor: A_BRAND.violet,
                                                    "&:hover": { backgroundColor: A_BRAND.violetHover },
                                                }}
                                            >
                                                View submission
                                            </Button>
                                        </Paper>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </Box>

            <AssignmentFormModal
                open={editAssignmentOpen}
                onClose={() => setEditAssignmentOpen(false)}
                batchId={batchId}
                assignment={{
                    batchAssignmentId: assignment.batchAssignmentId,
                    assignmentTitle: assignment.assignmentTitle,
                    assignmentDesc: assignment.assignmentDesc,
                    assignmentDueDate: assignment.assignmentDueDate,
                    maximumMarks: assignment.maximumMarks,
                    isPublished: assignment.isPublished,
                }}
                onSaved={refreshDetail}
            />

            <TaskFormModal
                open={taskModalOpen}
                onClose={() => setTaskModalOpen(false)}
                assignmentId={assignmentId}
                task={editingTask}
                nextOrder={tasks.length + 1}
                onSaved={() => {
                    refreshDetail();
                    refreshSubmissions();
                }}
            />

            <ReviewSubmissionModal
                open={reviewStudentId !== null}
                onClose={() => setReviewStudentId(null)}
                assignmentId={assignmentId}
                studentId={reviewStudentId}
                onReviewed={() => {
                    refreshDetail();
                    refreshSubmissions();
                }}
            />
        </TrainerDashboardLayout>
    );
}

function Count({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
    return (
        <Box sx={{ borderRadius: 1.5, backgroundColor: bg, border: `1px solid ${color}`, px: 1, py: 0.6, textAlign: "center" }}>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color, lineHeight: 1.1 }}>{value}</Typography>
            <Typography sx={{ fontSize: 10, fontWeight: 700, color }} noWrap>
                {label}
            </Typography>
        </Box>
    );
}
