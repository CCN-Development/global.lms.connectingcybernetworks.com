"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Button,
    Chip,
    IconButton,
    InputAdornment,
    LinearProgress,
    Paper,
    Skeleton,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    MdAdd,
    MdOutlineAssignment,
    MdOutlineDeleteOutline,
    MdOutlineEdit,
    MdOutlineSearch,
    MdOutlineVisibility,
} from "react-icons/md";
import toast from "react-hot-toast";
import { useAssignment, type AssignmentListItem } from "@/contexts/AssignmentContext";
import AssignmentFormModal from "@/components/assignments/AssignmentFormModal";
import { A_BRAND, EmptyState, StatTile, ToneChip, formatDate } from "@/components/assignments/assignment-ui";

export default function AssignmentsTab({ batchId }: { batchId: string }) {
    const router = useRouter();
    const { assignments, loadingAssignments, getBatchAssignments, deleteAssignment } = useAssignment();

    const [search, setSearch] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<AssignmentListItem | null>(null);

    const refresh = useCallback(() => {
        getBatchAssignments(batchId, search.trim() || undefined);
    }, [getBatchAssignments, batchId, search]);

    useEffect(() => {
        const timer = setTimeout(refresh, search ? 300 : 0);
        return () => clearTimeout(timer);
    }, [refresh, search]);

    const remove = async (assignment: AssignmentListItem) => {
        const res = await deleteAssignment(assignment.batchAssignmentId);
        if (res.success) {
            toast.success("Assignment removed");
            refresh();
        } else {
            toast.error(res.message ?? "Failed to remove assignment");
        }
    };

    const totals = assignments.reduce(
        (acc, item) => ({
            tasks: acc.tasks + item.totalTasks,
            pending: acc.pending + item.pendingReviewCount,
            completed: acc.completed + item.completedStudents,
        }),
        { tasks: 0, pending: 0, completed: 0 }
    );

    return (
        <div className="flex flex-col gap-2 sm:gap-3">
            {/* Toolbar */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 2,
                    border: `1px solid ${A_BRAND.violet}`,
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
                        backgroundColor: A_BRAND.violetBg,
                        color: A_BRAND.violet,
                        display: "grid",
                        placeItems: "center",
                        fontSize: 17,
                    }}
                >
                    <MdOutlineAssignment />
                </Box>
                <Typography sx={{ fontSize: 14, fontWeight: 800, color: A_BRAND.text }}>
                    Assignments
                </Typography>
                <Chip
                    size="small"
                    label={assignments.length}
                    sx={{ backgroundColor: A_BRAND.violetBg, color: A_BRAND.violet, fontWeight: 700, height: 22 }}
                />
                <Box sx={{ flex: 1 }} />
                <TextField
                    size="small"
                    placeholder="Search assignments"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ minWidth: { xs: "100%", sm: 220 } }}
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
                <Button
                    onClick={() => {
                        setEditing(null);
                        setFormOpen(true);
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
                    New assignment
                </Button>
            </Paper>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <StatTile label="Assignments" value={assignments.length} color={A_BRAND.violet} bg={A_BRAND.violetBg} icon={<MdOutlineAssignment />} />
                <StatTile label="Total tasks" value={totals.tasks} color={A_BRAND.sky} bg={A_BRAND.skyBg} icon={<MdOutlineAssignment />} />
                <StatTile label="Pending review" value={totals.pending} color={A_BRAND.orange} bg={A_BRAND.orangeBg} icon={<MdOutlineVisibility />} />
                <StatTile label="Completions" value={totals.completed} color={A_BRAND.emerald} bg={A_BRAND.emeraldBg} icon={<MdOutlineAssignment />} />
            </div>

            {loadingAssignments && assignments.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} variant="rounded" height={168} sx={{ borderRadius: 2 }} />
                    ))}
                </div>
            ) : assignments.length === 0 ? (
                <EmptyState
                    label="No assignments created for this batch yet."
                    icon={<MdOutlineAssignment />}
                    action={
                        <Button
                            onClick={() => {
                                setEditing(null);
                                setFormOpen(true);
                            }}
                            size="small"
                            variant="contained"
                            disableElevation
                            startIcon={<MdAdd size={15} />}
                            sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                borderRadius: 1.5,
                                backgroundColor: A_BRAND.violet,
                                "&:hover": { backgroundColor: A_BRAND.violetHover },
                            }}
                        >
                            Create the first assignment
                        </Button>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                    {assignments.map((assignment) => {
                        const completionRate =
                            assignment.totalStudents > 0
                                ? Math.round((assignment.completedStudents / assignment.totalStudents) * 100)
                                : 0;
                        const accent = assignment.isOverdue ? A_BRAND.rose : A_BRAND.primary;

                        return (
                            <Paper
                                key={assignment.batchAssignmentId}
                                elevation={0}
                                sx={{
                                    borderRadius: 2,
                                    border: `1px solid ${accent}`,
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
                                    <div className="min-w-0 flex-1">
                                        <Typography sx={{ fontSize: 14, fontWeight: 800, color: A_BRAND.text, lineHeight: 1.3 }}>
                                            {assignment.assignmentTitle}
                                        </Typography>
                                        <Typography sx={{ fontSize: 11.5, color: A_BRAND.muted }} noWrap>
                                            by {assignment.trainer.trainerName}
                                        </Typography>
                                    </div>
                                    <Tooltip title="Edit assignment">
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setEditing(assignment);
                                                setFormOpen(true);
                                            }}
                                            sx={{ color: A_BRAND.violet }}
                                        >
                                            <MdOutlineEdit size={16} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Remove assignment">
                                        <IconButton size="small" onClick={() => remove(assignment)} sx={{ color: A_BRAND.rose }}>
                                            <MdOutlineDeleteOutline size={16} />
                                        </IconButton>
                                    </Tooltip>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                    {assignment.isOverdue ? (
                                        <ToneChip
                                            tone={{
                                                label:
                                                    assignment.daysOverdue > 0
                                                        ? `Overdue by ${assignment.daysOverdue} day${assignment.daysOverdue > 1 ? "s" : ""}`
                                                        : "Overdue",
                                                color: A_BRAND.rose,
                                                bg: A_BRAND.roseBg,
                                            }}
                                        />
                                    ) : (
                                        <ToneChip tone={{ label: "Active", color: A_BRAND.emerald, bg: A_BRAND.emeraldBg }} />
                                    )}
                                    {!assignment.isPublished && (
                                        <ToneChip tone={{ label: "Draft", color: A_BRAND.slate, bg: A_BRAND.slateBg }} />
                                    )}
                                    {assignment.pendingReviewCount > 0 && (
                                        <ToneChip
                                            tone={{
                                                label: `${assignment.pendingReviewCount} to review`,
                                                color: A_BRAND.orange,
                                                bg: A_BRAND.orangeBg,
                                            }}
                                        />
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 border border-dashed rounded-lg p-1.5" style={{ borderColor: A_BRAND.border }}>
                                    <Cell label="Assigned on" value={formatDate(assignment.assignedOn)} />
                                    <Cell label="Due date" value={formatDate(assignment.assignmentDueDate)} />
                                    <Cell label="No. of tasks" value={String(assignment.totalTasks)} />
                                    <Cell
                                        label="Marks"
                                        value={
                                            assignment.maximumMarks != null
                                                ? String(assignment.maximumMarks)
                                                : assignment.totalTaskMarks
                                                ? String(assignment.totalTaskMarks)
                                                : "--"
                                        }
                                    />
                                </div>

                                <Box>
                                    <div className="flex items-center justify-between mb-0.5">
                                        <Typography sx={{ fontSize: 11, color: A_BRAND.muted, fontWeight: 600 }}>
                                            Completed by students
                                        </Typography>
                                        <Typography sx={{ fontSize: 11, color: A_BRAND.text, fontWeight: 800 }}>
                                            {assignment.completedStudents}/{assignment.totalStudents}
                                        </Typography>
                                    </div>
                                    <LinearProgress
                                        variant="determinate"
                                        value={completionRate}
                                        sx={{
                                            height: 6,
                                            borderRadius: 4,
                                            backgroundColor: A_BRAND.slateBg,
                                            "& .MuiLinearProgress-bar": { backgroundColor: A_BRAND.emerald, borderRadius: 4 },
                                        }}
                                    />
                                </Box>

                                <Button
                                    onClick={() =>
                                        router.push(
                                            `/dashboard/trainer/my-batches/${batchId}/assignments/${assignment.batchAssignmentId}`
                                        )
                                    }
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
                                    View tasks &amp; submissions
                                </Button>
                            </Paper>
                        );
                    })}
                </div>
            )}

            <AssignmentFormModal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                batchId={batchId}
                assignment={editing}
                onSaved={(created) => {
                    refresh();
                    if (created) {
                        router.push(
                            `/dashboard/trainer/my-batches/${batchId}/assignments/${created.batchAssignmentId}`
                        );
                    }
                }}
            />
        </div>
    );
}

function Cell({ label, value }: { label: string; value: string }) {
    return (
        <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 10.5, color: A_BRAND.muted }}>{label}</Typography>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: A_BRAND.text }} noWrap>
                {value}
            </Typography>
        </Box>
    );
}
