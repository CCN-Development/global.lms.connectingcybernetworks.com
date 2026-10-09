"use client";

import React from "react";
import Image from "next/image";
import { Box, Typography } from "@mui/material";
import type { Course, LearnerRank } from "../course-data";
import { COLORS, TYPE } from "../my-courses-theme";
import { GhostButton, GoalDivider, GoalNote, GoalPanel, OptionCard, PrimaryButton, SELECTED_CARD_SX, SET_GOAL_ASSETS } from "./GoalUI";
import {
    GOAL_TYPES,
    PACE_OPTIONS,
    WEEK_DAYS,
    courseLabel,
    formatGoalDate,
    goalTargetText,
    projectGoal,
    selectedDaysText,
    type GoalDraft,
    type WeekDayKey,
} from "./set-goal-data";

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

// ─── Step 1 · Goal ─────────────────────────────────────────────────────────

export function GoalTypeStep({ draft, update, onNext }: { draft: GoalDraft; update: Update; onNext: () => void }) {
    return (
        <GoalPanel title="What do you want to achieve?" subtitle="Choose a learning goal that matches what you want to accomplish next." width={520}>
            <Box role="radiogroup" aria-label="Goal type" sx={{ position: "relative", display: "flex", gap: { xs: "12px", sm: "24px" } }}>
                {GOAL_TYPES.map((option) => {
                    const selected = draft.type === option.key;
                    return (
                        <OptionCard
                            key={option.key}
                            selected={selected}
                            onClick={() => update({ type: option.key })}
                            sx={{ flex: 1, minWidth: 0, gap: "16px", justifyContent: "space-between" }}
                        >
                            <Image
                                src={option.icon.src}
                                alt=""
                                width={option.icon.width}
                                height={option.icon.height}
                                style={{ objectFit: "cover", opacity: selected ? 1 : 0.24, transition: "opacity .18s ease" }}
                            />
                            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                                <CardTitle>{option.title}</CardTitle>
                                <CardHint>{option.description}</CardHint>
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

/** "8-10 Weeks" → "8 - 10 weeks", as written on the target card. */
const formatWeeks = (weeks: string) => weeks.replace(/(\d+)\s*-\s*(\d+)/, "$1 - $2").toLowerCase();

export function TargetStep({
    draft,
    update,
    courses,
    rank,
    onNext,
}: {
    draft: GoalDraft;
    update: Update;
    courses: Course[];
    rank: LearnerRank;
    onNext: () => void;
}) {
    const selected = courses.find((c) => c.courseId === draft.courseId);
    return (
        <GoalPanel title="Set Your Target" subtitle="Choose the mission you want to complete and make your next milestone clear." width={772}>
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
                {courses.map((course) => {
                    const locked = course.status === "Locked";
                    const isSelected = course.courseId === draft.courseId;
                    return (
                        <OptionCard
                            key={course.courseId}
                            selected={isSelected}
                            disabled={locked}
                            onClick={() => update({ courseId: course.courseId })}
                            sx={{ minHeight: 140, gap: "24px", justifyContent: locked ? "flex-end" : "flex-start" }}
                        >
                            {locked ? (
                                <Box sx={{ display: "flex", flexDirection: "column", maxWidth: "100%" }}>
                                    <CardTitle>{courseLabel(course)}</CardTitle>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                        <Image src={`${SET_GOAL_ASSETS}/icon-lock-14.svg`} alt="" width={14} height={14} />
                                        <Typography sx={{ ...TYPE.xsMed12, color: COLORS.neutral200 }}>Locked</Typography>
                                    </Box>
                                </Box>
                            ) : (
                                <>
                                    <CardTitle>{courseLabel(course)}</CardTitle>
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                        <Chip icon={`${SET_GOAL_ASSETS}/icon-clock-12.svg`} size={12} label={formatWeeks(course.weeks)} />
                                        <Chip icon={`${SET_GOAL_ASSETS}/icon-layers-14.svg`} size={14} label={`${course.totalLevels} Levels`} />
                                        <Chip icon={`${SET_GOAL_ASSETS}/icon-star-12.svg`} size={12} label={`${course.totalBadges} Badges`} />
                                    </Box>
                                </>
                            )}
                        </OptionCard>
                    );
                })}
            </Box>
            {selected && <GoalNote>Your Target : {goalTargetText(draft, selected, rank)}</GoalNote>}
            <GoalDivider />
            <PrimaryButton onClick={onNext} disabled={!selected}>
                Next
            </PrimaryButton>
        </GoalPanel>
    );
}

// ─── Step 3 · Pace ─────────────────────────────────────────────────────────

export function PaceStep({ draft, update, onNext }: { draft: GoalDraft; update: Update; onNext: () => void }) {
    return (
        <GoalPanel
            title="Build Your Learning Schedule"
            subtitle="Pick the days you want to learn and create a routine you can consistently follow."
            width={622}
        >
            <Box
                role="radiogroup"
                aria-label="Daily pace"
                sx={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}
            >
                {PACE_OPTIONS.map((option) => (
                    <OptionCard key={option.key} selected={draft.pace === option.key} onClick={() => update({ pace: option.key })} sx={{ gap: "8px" }}>
                        <CardTitle>{option.label}</CardTitle>
                        <CardHint>{option.hint}</CardHint>
                    </OptionCard>
                ))}
            </Box>
            <GoalDivider />
            <PrimaryButton onClick={onNext}>Next</PrimaryButton>
        </GoalPanel>
    );
}

// ─── Step 4 · Schedule ─────────────────────────────────────────────────────

export function ScheduleStep({ draft, update, onNext }: { draft: GoalDraft; update: Update; onNext: () => void }) {
    const toggle = (key: WeekDayKey) =>
        update({ days: draft.days.includes(key) ? draft.days.filter((d) => d !== key) : [...draft.days, key] });

    return (
        <GoalPanel
            title="Build Your Learning Schedule"
            subtitle="Pick the days you want to learn and create a routine you can consistently follow."
            subtitleNoWrap
            width={626}
        >
            <Box role="group" aria-label="Learning days" sx={{ position: "relative", display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {WEEK_DAYS.map((day) => (
                    <OptionCard
                        key={day.key}
                        role="checkbox"
                        selected={draft.days.includes(day.key)}
                        onClick={() => toggle(day.key)}
                        sx={{ width: 70, alignItems: "center", justifyContent: "center" }}
                    >
                        <Typography sx={{ ...TYPE.mediumMed16, color: COLORS.white }}>{day.label}</Typography>
                    </OptionCard>
                ))}
            </Box>
            <GoalNote>{draft.days.length ? `Selected : ${selectedDaysText(draft.days)}` : "Select at least one learning day"}</GoalNote>
            <GoalDivider />
            <PrimaryButton onClick={onNext} disabled={!draft.days.length}>
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
    draft,
    course,
    onConfirm,
    onCancel,
}: {
    draft: GoalDraft;
    course: Course;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const pace = PACE_OPTIONS.find((p) => p.key === draft.pace) ?? PACE_OPTIONS[1];
    const projection = projectGoal(draft, course);
    const tiles = [
        { label: "Daily Commitment", value: pace.commitment },
        { label: "Learning Days", value: `${draft.days.length} days/week` },
        { label: "Projected Completion", value: formatGoalDate(projection.completion) },
        { label: "Status", value: projection.onTrack ? "On Track" : "Needs More Time" },
    ];

    return (
        <GoalPanel title="Your Goal Is Ready" subtitle="Review your target, pace, and projected completion date before locking in your goal." width={496}>
            <Box sx={{ ...SELECTED_CARD_SX, display: "flex", flexDirection: "column", gap: "16px", width: 432, maxWidth: "100%" }}>
                <CardTitle>{courseLabel(course)}</CardTitle>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
                    {tiles.map((tile) => (
                        <SummaryTile key={tile.label} {...tile} />
                    ))}
                </Box>
            </Box>
            <GoalNote>
                {projection.daysRemaining} days remaining.{" "}
                {projection.onTrack
                    ? "At this pace, you're on track to complete your goal."
                    : `Add more learning time to finish within ${course.weeks.toLowerCase()}.`}
            </GoalNote>
            <GoalDivider />
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                <PrimaryButton onClick={onConfirm}>Set My Goal</PrimaryButton>
                <GhostButton onClick={onCancel}>Cancel</GhostButton>
            </Box>
        </GoalPanel>
    );
}
