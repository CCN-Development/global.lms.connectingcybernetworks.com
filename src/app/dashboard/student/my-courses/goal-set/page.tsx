"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Box, ButtonBase, CircularProgress, Dialog, InputBase, Switch, Typography } from "@mui/material";
import { MdOutlineFlag } from "react-icons/md";
import toast from "react-hot-toast";
import StudentLayout from "@/layouts/StudentLayout";
import { MY_COURSES_PATH, SET_GOAL_PATH, WEEK_DAY_LABELS, courseDetailPath, formatDate, minutesLabel, selectedDaysText } from "@/components/courses/course-format";
import { COLORS, MY_COURSES_ASSETS, TYPE } from "@/components/courses/my-courses-theme";
import { BackButton, NoticePanel, PrimaryButton, ProgressTrack, framedPanelSx } from "@/components/courses/my-courses-ui";
import { OptionCard } from "@/components/courses/set-goal/GoalUI";
import { CUSTOM_MINUTES, learnerTimezone } from "@/components/courses/set-goal/set-goal-utils";
import { useCourse, type ActiveGoal, type GoalUpdateInput, type PaceKey, type WeekDayKey } from "@/contexts/CourseContext";

function goalTarget(goal: ActiveGoal): string {
    return goal.goalType === "complete_course" ? `Complete ${goal.courseLabel}` : `Reach Level ${goal.targetValue}`;
}

function goalProgressText(goal: ActiveGoal): string {
    return goal.goalType === "complete_course"
        ? `${goal.currentValue - goal.baselineValue}/${goal.targetValue - goal.baselineValue} levels since you started`
        : `Level ${goal.currentValue} of ${goal.targetValue}`;
}

const outlineButtonSx = {
    height: 40,
    px: "16px",
    borderRadius: "10px",
    border: `1px solid ${COLORS.buttonBorder}`,
    transition: "border-color .18s ease",
    "&:hover": { borderColor: "rgba(227,233,248,0.64)" },
    "&.Mui-disabled": { opacity: 0.5 },
} as const;

function OutlineButton({ children, onClick, danger, disabled }: { children: React.ReactNode; onClick: () => void; danger?: boolean; disabled?: boolean }) {
    return (
        <ButtonBase onClick={onClick} disabled={disabled} sx={{ ...outlineButtonSx, ...(danger ? { borderColor: "rgba(248,113,113,0.5)" } : {}) }}>
            <Typography component="span" sx={{ ...TYPE.buttonMed14, color: danger ? "#FCA5A5" : COLORS.white, whiteSpace: "nowrap" }}>
                {children}
            </Typography>
        </ButtonBase>
    );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0, px: "12px", py: "8px", borderRadius: "8px", border: "1px solid rgba(140,140,140,0.24)", bgcolor: "rgba(0,0,0,0.24)" }}>
            <Typography noWrap sx={{ ...TYPE.xsReg12, color: COLORS.neutral300 }}>
                {label}
            </Typography>
            <Typography noWrap sx={{ ...TYPE.buttonMed14, color: tone ?? COLORS.neutral100 }}>
                {value}
            </Typography>
        </Box>
    );
}

function GoalCard({ goal, onEdit, onRemove, onOpenCourse }: { goal: ActiveGoal; onEdit: () => void; onRemove: () => void; onOpenCourse: () => void }) {
    const todayPct = goal.today.minutesPlanned ? (goal.today.minutesLearned / goal.today.minutesPlanned) * 100 : 0;
    return (
        <Box sx={{ ...framedPanelSx({ angle: "163deg" }), overflow: "hidden", p: { xs: "16px", sm: "24px" }, display: "flex", flexDirection: "column", gap: "20px" }}>
            <Box sx={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ ...TYPE.xsMed12, color: COLORS.neutral300, textTransform: "uppercase" }}>{goal.courseLabel}</Typography>
                    <Typography sx={{ ...TYPE.headingSemibold20, color: COLORS.white }}>{goalTarget(goal)}</Typography>
                </Box>
                <Box
                    sx={{
                        px: "12px",
                        py: "4px",
                        borderRadius: "32px",
                        border: `1px solid ${goal.onTrack ? COLORS.lessonDone : "#F59E0B"}`,
                        color: goal.onTrack ? COLORS.lessonDone : "#F59E0B",
                        ...TYPE.xsMed12,
                    }}
                >
                    {goal.onTrack ? "On track" : "Needs more time"}
                </Box>
            </Box>

            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "8px" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                    <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral200 }}>{goalProgressText(goal)}</Typography>
                    <Typography sx={{ ...TYPE.smallMed14, color: COLORS.white }}>{Math.round(goal.progressPct)}%</Typography>
                </Box>
                <ProgressTrack value={goal.progressPct} fill={COLORS.purple} minFill={3} />
            </Box>

            <Box sx={{ position: "relative", display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" }, gap: "12px" }}>
                <Stat
                    label="Today"
                    value={goal.today.isLearningDay ? `${goal.today.minutesLearned}/${goal.today.minutesPlanned} min` : "Rest day"}
                    tone={goal.today.isLearningDay && todayPct >= 100 ? COLORS.lessonDone : undefined}
                />
                <Stat label="This week" value={`${goal.thisWeek.minutesLearned}/${goal.thisWeek.minutesPlanned} min`} />
                <Stat label="Daily commitment" value={minutesLabel(goal.minutesPerDay)} />
                <Stat label="Projected completion" value={formatDate(goal.projectedDate)} />
            </Box>

            <Typography sx={{ position: "relative", ...TYPE.xsMed12, color: COLORS.neutral300 }}>
                Learning days: {selectedDaysText(goal.learningDays)} · Started {formatDate(goal.startDate)}
                {goal.reminderEnabled && goal.reminderTime ? ` · Reminder at ${goal.reminderTime}` : ""}
            </Typography>

            <Box sx={{ position: "relative", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <PrimaryButton onClick={onOpenCourse} height={40}>
                    Continue Learning
                </PrimaryButton>
                <OutlineButton onClick={onEdit}>Edit Schedule</OutlineButton>
                <OutlineButton onClick={onRemove} danger>
                    Remove Goal
                </OutlineButton>
            </Box>
        </Box>
    );
}

const dialogPaperSx = {
    width: 560,
    maxWidth: "calc(100% - 32px)",
    m: "16px",
    p: { xs: "20px", sm: "28px" },
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,0.64)",
    bgcolor: "#05050c",
    backgroundImage: "none",
    color: COLORS.white,
} as const;

function EditGoalDialog({ goal, onClose }: { goal: ActiveGoal; onClose: () => void }) {
    const { goalOptions, getGoalOptions, updateGoal, saving } = useCourse();
    const [paceKey, setPaceKey] = useState<PaceKey>(goal.paceKey);
    const [minutes, setMinutes] = useState(goal.minutesPerDay);
    const [days, setDays] = useState<WeekDayKey[]>(goal.learningDays);
    const [reminderEnabled, setReminderEnabled] = useState(goal.reminderEnabled);
    const [reminderTime, setReminderTime] = useState(goal.reminderTime ?? "19:00");

    useEffect(() => {
        if (!goalOptions) getGoalOptions();
    }, [goalOptions, getGoalOptions]);

    const toggleDay = (day: WeekDayKey) => setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));

    const save = async () => {
        const input: GoalUpdateInput = {
            paceKey,
            ...(paceKey === "custom" ? { minutesPerDay: minutes } : {}),
            learningDays: days,
            timezone: learnerTimezone(),
            reminderEnabled,
            reminderTime: reminderEnabled ? reminderTime : null,
        };
        const res = await updateGoal(goal.goalId, input);
        if (!res.success) {
            toast.error(res.message ?? "Failed to update the goal");
            return;
        }
        toast.success(res.data ? `Goal updated · projected ${formatDate(res.data.projection.projectedDate)}` : "Goal updated");
        onClose();
    };

    return (
        <Dialog open onClose={onClose} slotProps={{ paper: { sx: dialogPaperSx }, backdrop: { sx: { bgcolor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" } } }}>
            <Typography sx={{ ...TYPE.headingSemibold20 }}>Edit learning schedule</Typography>
            {!goalOptions ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: "24px" }}>
                    <CircularProgress size={28} sx={{ color: COLORS.purple }} />
                </Box>
            ) : (
                <>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
                        {goalOptions.paces.map((pace) => (
                            <OptionCard key={pace.key} selected={paceKey === pace.key} onClick={() => setPaceKey(pace.key)} sx={{ gap: "4px", p: "12px" }}>
                                <Typography sx={{ ...TYPE.mediumBold16, color: COLORS.white }}>{pace.label}</Typography>
                                <Typography sx={{ ...TYPE.xsMed12, color: COLORS.neutral200 }}>{pace.hint}</Typography>
                            </OptionCard>
                        ))}
                    </Box>
                    {paceKey === "custom" && (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                            <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral200 }}>Minutes per learning day</Typography>
                            <InputBase
                                type="number"
                                value={minutes}
                                onChange={(e) => setMinutes(Math.min(CUSTOM_MINUTES.max, Math.max(CUSTOM_MINUTES.min, Number(e.target.value) || CUSTOM_MINUTES.min)))}
                                inputProps={{ min: CUSTOM_MINUTES.min, max: CUSTOM_MINUTES.max, step: CUSTOM_MINUTES.step, "aria-label": "Minutes per day" }}
                                sx={{ width: 110, height: 40, px: "12px", borderRadius: "10px", border: "1px solid rgba(140,140,140,0.32)", color: COLORS.white }}
                            />
                        </Box>
                    )}
                    <Box role="group" aria-label="Learning days" sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {goalOptions.weekDays.map((day) => (
                            <OptionCard key={day} role="checkbox" selected={days.includes(day)} onClick={() => toggleDay(day)} sx={{ width: 62, p: "10px", alignItems: "center" }}>
                                <Typography sx={{ ...TYPE.smallMed14, color: COLORS.white }}>{WEEK_DAY_LABELS[day]}</Typography>
                            </OptionCard>
                        ))}
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                        <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral200 }}>Daily reminder</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {reminderEnabled && (
                                <InputBase
                                    type="time"
                                    value={reminderTime}
                                    onChange={(e) => setReminderTime(e.target.value)}
                                    inputProps={{ "aria-label": "Reminder time" }}
                                    sx={{ height: 40, px: "12px", borderRadius: "10px", border: "1px solid rgba(140,140,140,0.32)", color: COLORS.white, "& input": { colorScheme: "dark" } }}
                                />
                            )}
                            <Switch
                                checked={reminderEnabled}
                                onChange={(e) => setReminderEnabled(e.target.checked)}
                                slotProps={{ input: { "aria-label": "Daily reminder" } }}
                                sx={{ "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: COLORS.purple, opacity: 1 } }}
                            />
                        </Box>
                    </Box>
                </>
            )}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <OutlineButton onClick={onClose}>Cancel</OutlineButton>
                <PrimaryButton onClick={save} height={40} disabled={!goalOptions || !days.length || saving || (reminderEnabled && !reminderTime)}>
                    {saving ? "Saving…" : "Save changes"}
                </PrimaryButton>
            </Box>
        </Dialog>
    );
}

function RemoveGoalDialog({ goal, onClose }: { goal: ActiveGoal; onClose: () => void }) {
    const { abandonGoal, saving } = useCourse();
    const remove = async () => {
        const res = await abandonGoal(goal.goalId);
        if (!res.success) {
            toast.error(res.message ?? "Failed to remove the goal");
            return;
        }
        toast.success("Goal removed");
        onClose();
    };
    return (
        <Dialog open onClose={onClose} slotProps={{ paper: { sx: { ...dialogPaperSx, width: 440 } }, backdrop: { sx: { bgcolor: "rgba(0,0,0,0.6)" } } }}>
            <Typography sx={{ ...TYPE.headingSemibold20 }}>Remove this goal?</Typography>
            <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral200 }}>
                &ldquo;{goalTarget(goal)}&rdquo; will stop tracking. Your course progress and XP are not affected.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <OutlineButton onClick={onClose}>Keep goal</OutlineButton>
                <OutlineButton onClick={remove} danger disabled={saving}>
                    {saving ? "Removing…" : "Remove goal"}
                </OutlineButton>
            </Box>
        </Dialog>
    );
}

/** "My Goals": active learning goals with today's / this week's minutes, projection and schedule controls. */
export default function MyGoalsPage() {
    const router = useRouter();
    const { activeGoals, loadingGoals, getActiveGoals } = useCourse();
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<ActiveGoal | null>(null);
    const [removing, setRemoving] = useState<ActiveGoal | null>(null);

    useEffect(() => {
        getActiveGoals().then((res) => {
            setLoaded(true);
            setError(res.success ? null : (res.message ?? "Failed to fetch goals"));
        });
    }, [getActiveGoals]);

    return (
        <StudentLayout>
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "24px", pb: "24px" }}>
                <Box aria-hidden sx={{ position: "absolute", left: -1, top: -779, lineHeight: 0, pointerEvents: "none", display: { xs: "none", md: "block" } }}>
                    <Image src={`${MY_COURSES_ASSETS}/ui/header-vector.svg`} alt="" width={901} height={831} style={{ maxWidth: "none" }} />
                </Box>

                <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <BackButton label="Back to My Courses" onClick={() => router.push(MY_COURSES_PATH)} />
                        <Typography component="h1" sx={{ ...TYPE.headingMed20, color: COLORS.white }}>
                            My Goals
                        </Typography>
                    </Box>
                    <PrimaryButton onClick={() => router.push(SET_GOAL_PATH)}>Set a New Goal</PrimaryButton>
                </Box>

                {!loaded && loadingGoals ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: "64px" }}>
                        <CircularProgress size={32} sx={{ color: COLORS.purple }} />
                    </Box>
                ) : error ? (
                    <NoticePanel title="We couldn't load your goals" message={error} action={{ label: "Try again", onClick: () => getActiveGoals() }} />
                ) : activeGoals.length === 0 ? (
                    <NoticePanel
                        icon={<MdOutlineFlag size={28} color="#4b4b58" />}
                        title="No active goals"
                        message="Set a goal to plan your learning days, track daily minutes and see when you'll finish."
                        action={{ label: "Set your first goal", onClick: () => router.push(SET_GOAL_PATH) }}
                    />
                ) : (
                    <Box sx={{ position: "relative", display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", xl: "repeat(2, minmax(0, 1fr))" }, gap: "24px" }}>
                        {activeGoals.map((goal) => (
                            <GoalCard
                                key={goal.goalId}
                                goal={goal}
                                onEdit={() => setEditing(goal)}
                                onRemove={() => setRemoving(goal)}
                                onOpenCourse={() => router.push(courseDetailPath(goal.courseId))}
                            />
                        ))}
                    </Box>
                )}
            </Box>

            {editing && <EditGoalDialog key={editing.goalId} goal={editing} onClose={() => setEditing(null)} />}
            {removing && <RemoveGoalDialog goal={removing} onClose={() => setRemoving(null)} />}
        </StudentLayout>
    );
}
