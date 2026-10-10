"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, ButtonBase, InputBase, Popover, Skeleton, Typography } from "@mui/material";
import { framedPanelSx } from "@/components/courses/my-courses-ui";
import { LmsButton } from "@/components/community/community-ui";
import {
    AssignmentIcon,
    Checkbox16,
    OutlineButton,
    Radio16,
    SA,
    ST,
    StatusPill,
    daysTaken,
    formatShortDate,
    plural,
    type PillTone,
} from "@/components/assignments/student-assignment-ui";
import {
    useAssignment,
    type AssignmentProgressStatus,
    type StudentAssignmentListItem,
} from "@/contexts/AssignmentContext";

// ── Config ────────────────────────────────────────────────────────────────────

const GRADE_LABEL: Record<string, string> = {
    excellent: "Excellent",
    good: "Good",
    average: "Average",
    poor: "Poor",
};

const STATUS_PILL: Record<Exclude<AssignmentProgressStatus, "completed">, { label: string; tone: PillTone }> = {
    recently_added: { label: "Recently Added", tone: "primary" },
    in_progress: { label: "In Progress", tone: "primary" },
    under_review: { label: "Under Review", tone: "warning" },
    needs_rework: { label: "Needs Rework", tone: "error" },
    overdue: { label: "Overdue", tone: "error" },
};

type StatusFilterKey = "recently_added" | "under_review" | "overdue" | "completed";

/** The design lists four filters; the in-between API states are folded into the closest one. */
const STATUS_FILTERS: { key: StatusFilterKey; label: string; statuses: AssignmentProgressStatus[] }[] = [
    { key: "recently_added", label: "Recently Added", statuses: ["recently_added", "in_progress"] },
    { key: "under_review", label: "Under Review", statuses: ["under_review", "needs_rework"] },
    { key: "overdue", label: "Overdue", statuses: ["overdue"] },
    { key: "completed", label: "Completed", statuses: ["completed"] },
];

type DateMode = "today" | "custom" | null;

const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Parses a `yyyy-mm-dd` input value as a local date. */
function parseInputDate(value: string, endOfDay = false): Date | null {
    if (!value) return null;
    const [y, m, d] = value.split("-").map(Number);
    return endOfDay ? new Date(y, m - 1, d, 23, 59, 59, 999) : new Date(y, m - 1, d);
}

// ── Filter controls ───────────────────────────────────────────────────────────

const OPTION_ROW_SX = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    px: "12px",
    pt: "8px",
    pb: "8.8px",
    justifyContent: "flex-start",
    borderBottom: `0.8px solid ${SA.n900}`,
    "&:last-of-type": { borderBottom: "none", pb: "8px" },
    "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
} as const;

function FilterDropdown({
    label,
    width,
    children,
}: {
    label: string;
    width: number;
    children: React.ReactNode;
}) {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    return (
        <>
            <ButtonBase
                aria-haspopup="true"
                aria-expanded={Boolean(anchor)}
                onClick={(e) => setAnchor(e.currentTarget)}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    pl: "16px",
                    pr: "12px",
                    py: "8px",
                    borderRadius: "8px",
                    bgcolor: SA.filterButtonBg,
                    backdropFilter: "blur(12px)",
                    flexShrink: 0,
                    "&:hover": { bgcolor: "rgba(64,64,64,0.6)" },
                }}
            >
                <Typography component="span" sx={{ ...ST.latoMed16, color: SA.white, whiteSpace: "nowrap" }}>
                    {label}
                </Typography>
                <AssignmentIcon
                    name="icon-chevron-down.svg"
                    size={24}
                    sx={{ transform: anchor ? "rotate(180deg)" : "none", transition: "transform .15s ease" }}
                />
            </ButtonBase>
            <Popover
                open={Boolean(anchor)}
                anchorEl={anchor}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                slotProps={{
                    paper: {
                        sx: {
                            mt: "8px",
                            width,
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            borderRadius: "9px",
                            bgcolor: SA.dropdownBg,
                            backgroundImage: "none",
                            backdropFilter: "blur(6px)",
                            boxShadow: "0px 8px 24px 0px rgba(255,255,255,0.12)",
                            color: SA.white,
                        },
                    },
                }}
            >
                {children}
            </Popover>
        </>
    );
}

function StatusFilter({
    selected,
    onChange,
}: {
    selected: StatusFilterKey[];
    onChange: (next: StatusFilterKey[]) => void;
}) {
    const toggle = (key: StatusFilterKey) =>
        onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);

    const rows: { key: "all" | StatusFilterKey; label: string; checked: boolean; onClick: () => void }[] = [
        { key: "all", label: "All", checked: selected.length === 0, onClick: () => onChange([]) },
        ...STATUS_FILTERS.map((f) => ({
            key: f.key,
            label: f.label,
            checked: selected.includes(f.key),
            onClick: () => toggle(f.key),
        })),
    ];

    return (
        <FilterDropdown label="Sort By Status" width={160}>
            {rows.map((row) => (
                <ButtonBase key={row.key} role="menuitemcheckbox" aria-checked={row.checked} onClick={row.onClick} sx={OPTION_ROW_SX}>
                    <Checkbox16 checked={row.checked} />
                    <Typography component="span" sx={{ ...ST.latoMed14, color: SA.white, whiteSpace: "nowrap" }}>
                        {row.label}
                    </Typography>
                </ButtonBase>
            ))}
        </FilterDropdown>
    );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
            <Typography component="label" sx={{ ...ST.latoReg12, color: SA.n75 }}>
                {label}
            </Typography>
            <InputBase
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                inputProps={{ "aria-label": label }}
                sx={{
                    width: "100%",
                    px: "12px",
                    py: "8px",
                    borderRadius: "8px",
                    border: "1px solid rgba(64,64,64,0.12)",
                    backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(153,153,153,0.04) 100%)",
                    ...ST.interMed14,
                    color: SA.white,
                    colorScheme: "dark",
                    "& input": { p: 0, height: "21px", cursor: "pointer" },
                    "& input::-webkit-calendar-picker-indicator": { display: "none" },
                }}
            />
        </Box>
    );
}

function DateRangeFilter({
    mode,
    start,
    end,
    onModeChange,
    onStartChange,
    onEndChange,
}: {
    mode: DateMode;
    start: string;
    end: string;
    onModeChange: (mode: DateMode) => void;
    onStartChange: (value: string) => void;
    onEndChange: (value: string) => void;
}) {
    // Clicking the active option again clears the date filter.
    const pick = (next: Exclude<DateMode, null>) => onModeChange(mode === next ? null : next);
    return (
        <FilterDropdown label="Date Range" width={142}>
            <ButtonBase role="menuitemradio" aria-checked={mode === "today"} onClick={() => pick("today")} sx={OPTION_ROW_SX}>
                <Radio16 checked={mode === "today"} />
                <Typography component="span" sx={{ ...ST.latoMed14, color: SA.white, whiteSpace: "nowrap" }}>
                    Today&rsquo;s Date
                </Typography>
            </ButtonBase>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", px: "12px", py: "8px" }}>
                <ButtonBase
                    role="menuitemradio"
                    aria-checked={mode === "custom"}
                    onClick={() => pick("custom")}
                    sx={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-start", alignSelf: "flex-start" }}
                >
                    <Radio16 checked={mode === "custom"} />
                    <Typography component="span" sx={{ ...ST.latoMed14, color: SA.white, whiteSpace: "nowrap" }}>
                        Custom
                    </Typography>
                </ButtonBase>
                {mode === "custom" && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <DateField label="Start Date" value={start} onChange={onStartChange} />
                        <DateField label="End Date" value={end} onChange={onEndChange} />
                    </Box>
                )}
            </Box>
        </FilterDropdown>
    );
}

function SearchBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                height: 48,
                width: { xs: "100%", sm: 279 },
                px: "12px",
                py: "8px",
                borderRadius: "12px",
                border: "1px solid #E3E9F8",
                flexShrink: 0,
            }}
        >
            <AssignmentIcon name="icon-search.svg" size={24} />
            <InputBase
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search tasks..."
                inputProps={{ "aria-label": "Search tasks" }}
                sx={{
                    flex: 1,
                    fontFamily: ST.interReg16.fontFamily,
                    fontSize: "16px",
                    lineHeight: "25px",
                    color: SA.white,
                    "& input": { p: 0, height: "25px" },
                    "& input::placeholder": { color: SA.n300, opacity: 1 },
                }}
            />
        </Box>
    );
}

// ── Card ──────────────────────────────────────────────────────────────────────

function InfoCell({ label, value }: { label: string; value: string }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0, flex: "1 1 0" }}>
            <Typography sx={{ ...ST.latoReg12, color: SA.n300, whiteSpace: "nowrap" }}>{label}</Typography>
            <Typography sx={{ ...ST.latoMed16, color: SA.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {value}
            </Typography>
        </Box>
    );
}

const SECTION_DARK = { position: "relative", bgcolor: "rgba(0,0,0,0.32)", px: "24px", width: "100%" } as const;

function AssignmentCard({
    assignment,
    onOpen,
}: {
    assignment: StudentAssignmentListItem;
    onOpen: () => void;
}) {
    const { progressStatus, totalTasks, submittedTasks, lastSubmittedOn } = assignment;
    const isCompleted = progressStatus === "completed";
    const allSubmitted = totalTasks > 0 && submittedTasks >= totalTasks;
    const submittedOnTime =
        allSubmitted && lastSubmittedOn !== null && new Date(lastSubmittedOn) <= new Date(assignment.assignmentDueDate);
    const daysToComplete = lastSubmittedOn ? daysTaken(assignment.assignedOn, lastSubmittedOn) : 0;
    const showSubmissionOnly = !isCompleted && allSubmitted && progressStatus !== "needs_rework";

    const pills: { label: string; tone: PillTone }[] = [];
    if (!isCompleted) {
        const pill = STATUS_PILL[progressStatus];
        pills.push({
            label:
                progressStatus === "overdue" && assignment.daysOverdue > 0
                    ? `Overdue by ${plural(assignment.daysOverdue, "day")}`
                    : pill.label,
            tone: pill.tone,
        });
        if (progressStatus === "under_review" && submittedOnTime) {
            pills.push({ label: `Great! Completed in ${plural(daysToComplete, "day")}`, tone: "teal" });
        }
    }

    return (
        <Box
            component="article"
            sx={{
                ...framedPanelSx({ angle: "161.49deg" }),
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                minWidth: 0,
            }}
        >
            {/* Soft top-edge glow */}
            <Box
                aria-hidden
                component="img"
                src="/assignments/card-top-glow.png"
                alt=""
                sx={{ position: "absolute", left: "-1px", top: "-6.5px", width: "calc(100% + 2px)", height: 5, filter: "blur(50px)", pointerEvents: "none" }}
            />

            <Box sx={{ ...SECTION_DARK, pt: "24px", pb: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {pills.length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {pills.map((pill) => (
                            <StatusPill key={pill.label} {...pill} />
                        ))}
                    </Box>
                )}
                <Typography component="h3" sx={{ ...ST.latoSemi18, color: SA.white }}>
                    {assignment.assignmentTitle}
                </Typography>
            </Box>

            <Box sx={{ ...SECTION_DARK, pt: "12px", pb: "16px", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                {isCompleted ? (
                    <>
                        <Box sx={{ display: "flex", gap: "12px" }}>
                            <InfoCell
                                label="Feedback"
                                value={assignment.feedbackGrade ? GRADE_LABEL[assignment.feedbackGrade] ?? "--" : "--"}
                            />
                            <InfoCell label="Completed on" value={formatShortDate(assignment.completedOn ?? lastSubmittedOn)} />
                        </Box>
                        <Box
                            sx={{
                                position: "relative",
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                                gap: "6px",
                                pl: "16px",
                                pr: "12px",
                                py: "8px",
                                borderRadius: "12px",
                                bgcolor: "rgba(38,38,38,0.5)",
                            }}
                        >
                            <Box aria-hidden sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 7, backgroundImage: SA.accentBar }} />
                            <Typography sx={{ ...ST.latoMed14, color: "#93E293" }}>Great Job! Task Completed</Typography>
                            <Typography sx={{ ...ST.latoMed12, color: SA.n100 }}>
                                {submittedOnTime
                                    ? `Completed in just ${plural(daysToComplete, "day")}, well before the deadline. Keep up the consistency!`
                                    : "All tasks have been reviewed and approved. Keep up the consistency!"}
                            </Typography>
                        </Box>
                    </>
                ) : (
                    <>
                        <Box sx={{ display: "flex", gap: "12px" }}>
                            {showSubmissionOnly ? (
                                <InfoCell label="Completed on" value={formatShortDate(lastSubmittedOn)} />
                            ) : (
                                <InfoCell label="Assigned on" value={formatShortDate(assignment.assignedOn)} />
                            )}
                            <InfoCell label="Due Date" value={formatShortDate(assignment.assignmentDueDate)} />
                        </Box>
                        <Box sx={{ display: "flex", gap: "12px" }}>
                            <InfoCell label="No. of Tasks" value={`${submittedTasks}/${totalTasks}`} />
                            <InfoCell label="Trainer" value={assignment.trainer.trainerName} />
                        </Box>
                    </>
                )}
            </Box>

            <Box sx={{ position: "relative", display: "flex", gap: "12px", p: "24px", bgcolor: "rgba(227,233,248,0.03)" }}>
                {isCompleted ? (
                    <OutlineButton onClick={onOpen}>View Feedback</OutlineButton>
                ) : showSubmissionOnly ? (
                    <OutlineButton onClick={onOpen}>View Submission</OutlineButton>
                ) : (
                    <>
                        <OutlineButton onClick={onOpen}>View Details</OutlineButton>
                        <LmsButton onClick={onOpen} sx={{ flex: "1 1 0", minWidth: 0 }}>
                            Submit your Work
                        </LmsButton>
                    </>
                )}
            </Box>
        </Box>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const GRID_SX = {
    display: "grid",
    gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" },
    gap: "24px",
    alignItems: "start",
} as const;

export default function AssignmentsPage() {
    const router = useRouter();
    const params = useParams<{ batch_id: string }>();
    const batchId = params?.batch_id as string;

    const { studentAssignments, loadingAssignments, getStudentBatchAssignments } = useAssignment();

    const [statuses, setStatuses] = useState<StatusFilterKey[]>([]);
    const [dateMode, setDateMode] = useState<DateMode>(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [search, setSearch] = useState("");

    const refresh = useCallback(() => {
        if (!batchId) return;
        getStudentBatchAssignments(batchId, { search: search.trim() || undefined });
    }, [batchId, getStudentBatchAssignments, search]);

    useEffect(() => {
        const timer = setTimeout(refresh, search ? 300 : 0);
        return () => clearTimeout(timer);
    }, [refresh, search]);

    const filtered = useMemo(() => {
        const allowed = new Set(
            STATUS_FILTERS.filter((f) => statuses.includes(f.key)).flatMap((f) => f.statuses)
        );
        const today = new Date();
        const from = dateMode === "custom" ? parseInputDate(startDate) : null;
        const to = dateMode === "custom" ? parseInputDate(endDate, true) : null;

        return studentAssignments.filter((a) => {
            if (allowed.size > 0 && !allowed.has(a.progressStatus)) return false;
            const assigned = new Date(a.assignedOn);
            if (dateMode === "today" && !sameDay(assigned, today)) return false;
            if (from && assigned < from) return false;
            if (to && assigned > to) return false;
            return true;
        });
    }, [studentAssignments, statuses, dateMode, startDate, endDate]);

    const open = (assignmentId: string) =>
        router.push(`/dashboard/student/batch/${batchId}/assignments/${assignmentId}`);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", pb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <Typography sx={{ ...ST.latoReg16, color: SA.n300, flex: "1 1 160px" }}>
                    Total {filtered.length} {filtered.length === 1 ? "Task" : "Tasks"} in All
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <StatusFilter selected={statuses} onChange={setStatuses} />
                    <DateRangeFilter
                        mode={dateMode}
                        start={startDate}
                        end={endDate}
                        onModeChange={setDateMode}
                        onStartChange={setStartDate}
                        onEndChange={setEndDate}
                    />
                </Box>
                <SearchBar value={search} onChange={setSearch} />
            </Box>

            {loadingAssignments && studentAssignments.length === 0 ? (
                <Box sx={GRID_SX}>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} variant="rounded" height={320} sx={{ borderRadius: "24px", bgcolor: "rgba(255,255,255,0.05)" }} />
                    ))}
                </Box>
            ) : filtered.length === 0 ? (
                <Typography sx={{ ...ST.latoMed16, color: SA.n400, textAlign: "center", py: 6 }}>
                    No assignments found.
                </Typography>
            ) : (
                <Box sx={GRID_SX}>
                    {filtered.map((assignment) => (
                        <AssignmentCard
                            key={assignment.batchAssignmentId}
                            assignment={assignment}
                            onOpen={() => open(assignment.batchAssignmentId)}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
}
