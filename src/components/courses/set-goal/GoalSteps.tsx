"use client";

import React from "react";
import Image from "next/image";
import { Box, ButtonBase, CircularProgress, InputBase, Switch, Typography } from "@mui/material";
import type { GoalOptions, GoalProjection, MyCourseCard } from "@/contexts/CourseContext";
import { WEEK_DAY_LABELS, formatDate, minutesLabel, selectedDaysText } from "../course-format";
import { COLORS, TYPE } from "../my-courses-theme";
import { GhostButton, GoalDivider, GoalNote, GoalPanel, OptionCard, PrimaryButton, SELECTED_CARD_SX, SET_GOAL_ASSETS } from "./GoalUI";
import { CUSTOM_MINUTES, GOAL_TYPE_ICONS, formatWeeks, type GoalDraft } from "./set-goal-utils";

type Update = (patch: Partial<GoalDraft>) => void;

function CardTitle({ children }: { children: React.ReactNode }) {
    return (
        <Typography noWrap sx={{ ...TYPE.mediumBold16, color: COLORS.white, maxWidth: "100%" }}>
            {children}
        </Typography>
    );
}

function CardHint({ children }: { children: React.ReactNode }) {
    return <Typography sx={{ ...TYPE.xsMed12, color: COLORS.neutral200 }}>{children}</Typography>;
}

const fieldSx = {
    height: 44,
    px: "14px",
    borderRadius: "10px",
    border: "1px solid rgba(140,140,140,0.32)",
    bgcolor: "rgba(0,0,0,0.32)",
    color: COLORS.white,
    fontSize: 14,
    "& input": { colorScheme: "dark" },
} as const;

function Stepper({ value, min, max, step = 1, onChange, label }: { value: number; min: number; max: number; step?: number; onChange: (v: number) => void; label: string }) {
    const btnSx = {
        width: 44,
        height: 44,
        borderRadius: "10px",
        border: "1px solid rgba(140,140,140,0.32)",
        color: COLORS.white,
        fontSize: 20,
        "&.Mui-disabled": { opacity: 0.35 },
        "&:hover": { borderColor: "rgba(255,255,255,0.4)" },
    } as const;
    return (
        <Box role="group" aria-label={label} sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ButtonBase aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))} sx={btnSx}>
                −
            </ButtonBase>
            <Typography sx={{ ...TYPE.largeSemibold18, color: COLORS.white, minWidth: 64, textAlign: "center" }}>{value}</Typography>
            <ButtonBase aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + step))} sx={btnSx}>
                +
            </ButtonBase>
        </Box>
    );
}

// ─── Step 1 · Goal ─────────────────────────────────────────────────────────

export function GoalTypeStep({ options, draft, update, onNext }: { options: GoalOptions; draft: GoalDraft; update: Update; onNext: () => void }) {
    const levelGoalsReady = options.rank.maxLevel !== null && options.rank.level < options.rank.maxLevel;
    return (
        <GoalPanel title="What do you want to achieve?" subtitle="Choose a learning goal that matches what you want to accomplish next." width={520}>
            <Box role="radiogroup" aria-label="Goal type" sx={{ position: "relative", display: "flex", gap: { xs: "12px", sm: "24px" } }}>
                {options.goalTypes.map((option) => {
                    const selected = draft.goalType === option.key;
                    const disabled = option.key === "reach_level" && !levelGoalsReady;
                    const icon = GOAL_TYPE_ICONS[option.key];
                    return (
                        <OptionCard
                            key={option.key}
                            selected={selected}
                            disabled={disabled}
                            onClick={() => update({ goalType: option.key })}
                            sx={{ flex: 1, minWidth: 0, gap: "16px", justifyContent: "space-between", opacity: disabled ? 0.5 : 1 }}
                        >
                            <Image
                                src={icon.src}
                                alt=""
                                width={icon.width}
                                height={icon.height}
                                style={{ objectFit: "cover", opacity: selected ? 1 : 0.24, transition: "opacity .18s ease" }}
                            />
                            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                                <CardTitle>{option.title}</CardTitle>
                                <CardHint>{disabled ? "You're already at the top rank." : option.description}</CardHint>
                            </Box>
                        </OptionCard>
                    );
                })}
            </Box>
            <GoalDivider />
            <PrimaryButton onClick={onNext}>Next</PrimaryButton>
        </GoalPanel>
    );
}

// ─── Step 2 · Target ───────────────────────────────────────────────────────

function Chip({ icon, size, label }: { icon: string; size: number; label: string }) {
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                px: "8px",
                py: "4px",
                borderRadius: "6px",
                border: `1px solid ${COLORS.neutral200}`,
                bgcolor: "rgba(0,0,0,0.24)",
                backdropFilter: "blur(15px)",
                overflow: "hidden",
            }}
        >
            <Image src={icon} alt="" width={size} height={size} />
            <Typography noWrap sx={{ ...TYPE.xsReg12, color: COLORS.neutral100 }}>
                {label}
            </Typography>
        </Box>
    );
}

export function goalTargetText(draft: GoalDraft, options: GoalOptions): string {
    const course = options.courses.find((c) => c.courseId === draft.courseId);
    if (draft.goalType === "reach_level") return `Reach Level ${draft.targetLevel ?? options.rank.suggestedTargetLevel ?? options.rank.level + 1}`;
    if (!course) return "";
    const left = Math.max(0, course.totalLevels - course.completedLevels);
    return course.completedLevels > 0 ? `Complete the remaining ${left} of ${course.totalLevels} Levels` : `Complete all ${course.totalLevels} Levels`;
}

export function TargetStep({
    options,
    lockedCourses,
    draft,
    update,
    onNext,
}: {
    options: GoalOptions;
    /** Locked missions are listed (disabled) so learners see what comes next. */
    lockedCourses: MyCourseCard[];
    draft: GoalDraft;
    update: Update;
    onNext: () => void;
}) {
    const selected = options.courses.find((c) => c.courseId === draft.courseId);
    const levelGoal = draft.goalType === "reach_level";
    const minLevel = options.rank.level + 1;
    const maxLevel = options.rank.maxLevel ?? minLevel;

    return (
        <GoalPanel title="Set Your Target" subtitle="Choose the mission you want to complete and make your next milestone clear." width={772}>
            {options.courses.length === 0 ? (
                <Typography sx={{ position: "relative", ...TYPE.smallMed14, color: COLORS.neutral200, textAlign: "center" }}>
                    You don&rsquo;t have an unlocked mission yet. Goals can be set once a course is available to you.
                </Typography>
            ) : (
                <Box
                    role="radiogroup"
                    aria-label="Mission"
                    sx={{
                        position: "relative",
                        display: "grid",
                        gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" },
                        columnGap: "12px",
                        rowGap: { xs: "12px", md: "32px" },
                    }}
                >
                    {options.courses.map((course) => (
                        <OptionCard
                            key={course.courseId}
                            selected={course.courseId === draft.courseId}
                            onClick={() => update({ courseId: course.courseId })}
                            sx={{ minHeight: 140, gap: "24px", justifyContent: "flex-start" }}
                        >
                            <CardTitle>{course.label}</CardTitle>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                <Chip icon={`${SET_GOAL_ASSETS}/icon-clock-12.svg`} size={12} label={formatWeeks(course.weeks)} />
                                <Chip icon={`${SET_GOAL_ASSETS}/icon-layers-14.svg`} size={14} label={`${course.totalLevels} Levels`} />
                                <Chip icon={`${SET_GOAL_ASSETS}/icon-star-12.svg`} size={12} label={`${Math.round(course.progress)}% done`} />
                            </Box>
                        </OptionCard>
                    ))}
                    {lockedCourses.map((course) => (
                        <OptionCard key={course.courseId} selected={false} disabled sx={{ minHeight: 140, gap: "24px", justifyContent: "flex-end" }}>
                            <Box sx={{ display: "flex", flexDirection: "column", maxWidth: "100%" }}>
                                <CardTitle>{course.shortTitle ?? course.title}</CardTitle>
                                <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <Image src={`${SET_GOAL_ASSETS}/icon-lock-14.svg`} alt="" width={14} height={14} />
                                    <Typography sx={{ ...TYPE.xsMed12, color: COLORS.neutral200 }}>{course.status === "Upcoming" ? "Coming soon" : "Locked"}</Typography>
                                </Box>
                            </Box>
                        </OptionCard>
                    ))}
                </Box>
            )}
            {levelGoal && (
                <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                    <Box>
                        <CardTitle>Target rank level</CardTitle>
                        <CardHint>
                            You&rsquo;re Level {options.rank.level} · {options.rank.title}
                        </CardHint>
                    </Box>
                    <Stepper
                        label="target level"
                        value={draft.targetLevel ?? minLevel}
                        min={minLevel}
                        max={maxLevel}
                        onChange={(targetLevel) => update({ targetLevel })}
                    />
                </Box>
            )}
            {selected && <GoalNote>Your Target : {goalTargetText(draft, options)}</GoalNote>}
            <GoalDivider />
            <PrimaryButton onClick={onNext} disabled={!selected}>
                Next
            </PrimaryButton>
        </GoalPanel>
    );
}

// ─── Step 3 · Pace ─────────────────────────────────────────────────────────

export function PaceStep({ options, draft, update, onNext }: { options: GoalOptions; draft: GoalDraft; update: Update; onNext: () => void }) {
    const custom = draft.paceKey === "custom";
    return (
        <GoalPanel title="Choose Your Daily Pace" subtitle="Decide how much time you can give on each learning day." width={622}>
            <Box role="radiogroup" aria-label="Daily pace" sx={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
                {options.paces.map((option) => (
                    <OptionCard key={option.key} selected={draft.paceKey === option.key} onClick={() => update({ paceKey: option.key })} sx={{ gap: "8px" }}>
                        <CardTitle>{option.label}</CardTitle>
                        <CardHint>{option.hint}</CardHint>
                    </OptionCard>
                ))}
            </Box>
            {custom && (
                <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                    <Box>
                        <CardTitle>Minutes per learning day</CardTitle>
                        <CardHint>{minutesLabel(draft.customMinutes)} on each day you pick</CardHint>
                    </Box>
                    <Stepper
                        label="minutes per day"
                        value={draft.customMinutes}
                        min={CUSTOM_MINUTES.min}
                        max={CUSTOM_MINUTES.max}
                        step={CUSTOM_MINUTES.step}
                        onChange={(customMinutes) => update({ customMinutes })}
                    />
                </Box>
            )}
            <GoalDivider />
            <PrimaryButton onClick={onNext}>Next</PrimaryButton>
        </GoalPanel>
    );
}

// ─── Step 4 · Schedule ─────────────────────────────────────────────────────

export function ScheduleStep({ options, draft, update, onNext }: { options: GoalOptions; draft: GoalDraft; update: Update; onNext: () => void }) {
    const toggle = (key: GoalDraft["learningDays"][number]) =>
        update({ learningDays: draft.learningDays.includes(key) ? draft.learningDays.filter((d) => d !== key) : [...draft.learningDays, key] });

    return (
        <GoalPanel
            title="Build Your Learning Schedule"
            subtitle="Pick the days you want to learn and create a routine you can consistently follow."
            subtitleNoWrap
            width={626}
        >
            <Box role="group" aria-label="Learning days" sx={{ position: "relative", display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {options.weekDays.map((day) => (
                    <OptionCard
                        key={day}
                        role="checkbox"
                        selected={draft.learningDays.includes(day)}
                        onClick={() => toggle(day)}
                        sx={{ width: 70, alignItems: "center", justifyContent: "center" }}
                    >
                        <Typography sx={{ ...TYPE.mediumMed16, color: COLORS.white }}>{WEEK_DAY_LABELS[day]}</Typography>
                    </OptionCard>
                ))}
            </Box>
            <GoalNote>{draft.learningDays.length ? `Selected : ${selectedDaysText(draft.learningDays)}` : "Select at least one learning day"}</GoalNote>
            <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                <Box>
                    <CardTitle>Daily reminder</CardTitle>
                    <CardHint>Get a nudge on your learning days.</CardHint>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {draft.reminderEnabled && (
                        <InputBase
                            type="time"
                            value={draft.reminderTime}
                            onChange={(e) => update({ reminderTime: e.target.value })}
                            inputProps={{ "aria-label": "Reminder time" }}
                            sx={fieldSx}
                        />
                    )}
                    <Switch
                        checked={draft.reminderEnabled}
                        onChange={(e) => update({ reminderEnabled: e.target.checked })}
                        slotProps={{ input: { "aria-label": "Daily reminder" } }}
                        sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": { color: COLORS.white },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: COLORS.purple, opacity: 1 },
                            "& .MuiSwitch-track": { bgcolor: "rgba(255,255,255,0.3)" },
                        }}
                    />
                </Box>
            </Box>
            <GoalDivider />
            <PrimaryButton onClick={onNext} disabled={!draft.learningDays.length || (draft.reminderEnabled && !draft.reminderTime)}>
                Next
            </PrimaryButton>
        </GoalPanel>
    );
}

// ─── Step 5 · Review ───────────────────────────────────────────────────────

function SummaryTile({ label, value }: { label: string; value: string }) {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                minWidth: 0,
                px: "12px",
                py: "8px",
                borderRadius: "8px",
                border: `1px solid ${COLORS.neutral200}`,
                bgcolor: "rgba(0,0,0,0.24)",
                backdropFilter: "blur(15px)",
            }}
        >
            <Typography noWrap sx={{ ...TYPE.xsReg12, color: COLORS.neutral300 }}>
                {label}
            </Typography>
            <Typography noWrap sx={{ ...TYPE.buttonMed14, color: COLORS.neutral100 }}>
                {value}
            </Typography>
        </Box>
    );
}

export function ReviewStep({
    projection,
    error,
    weeks,
    saving,
    onConfirm,
    onCancel,
}: {
    projection: GoalProjection | null;
    error: string | null;
    weeks: string | null;
    saving: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <GoalPanel title="Your Goal Is Ready" subtitle="Review your target, pace, and projected completion date before locking in your goal." width={496}>
            {!projection ? (
                <Box sx={{ position: "relative", display: "flex", justifyContent: "center", py: "24px" }}>
                    {error ? (
                        <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral100, textAlign: "center" }}>{error}</Typography>
                    ) : (
                        <CircularProgress size={28} sx={{ color: COLORS.purple }} />
                    )}
                </Box>
            ) : (
                <>
                    <Box sx={{ ...SELECTED_CARD_SX, display: "flex", flexDirection: "column", gap: "16px", width: 432, maxWidth: "100%" }}>
                        <CardTitle>{projection.courseLabel}</CardTitle>
                        <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral100, mt: "-8px" }}>{projection.targetText}</Typography>
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
                            <SummaryTile label="Daily Commitment" value={minutesLabel(projection.minutesPerDay)} />
                            <SummaryTile label="Learning Days" value={`${projection.learningDays.length} days/week`} />
                            <SummaryTile label="Projected Completion" value={formatDate(projection.projectedDate)} />
                            <SummaryTile label="Status" value={projection.onTrack ? "On Track" : "Needs More Time"} />
                        </Box>
                    </Box>
                    <GoalNote>
                        {projection.daysRemaining} days remaining.{" "}
                        {projection.onTrack
                            ? "At this pace, you're on track to complete your goal."
                            : `Add more learning time to finish${weeks ? ` within ${weeks.toLowerCase()}` : " sooner"}.`}
                    </GoalNote>
                </>
            )}
            <GoalDivider />
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                <PrimaryButton onClick={onConfirm} disabled={!projection || saving}>
                    {saving ? "Saving…" : "Set My Goal"}
                </PrimaryButton>
                <GhostButton onClick={onCancel}>Cancel</GhostButton>
            </Box>
        </GoalPanel>
    );
}
