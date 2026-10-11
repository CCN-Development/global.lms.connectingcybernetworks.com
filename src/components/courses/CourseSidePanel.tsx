"use client";

import React from "react";
import Image from "next/image";
import { Box, ButtonBase, Typography } from "@mui/material";
import type { ActiveGoal, ContentBreakdownItem, CourseOverview } from "@/contexts/CourseContext";
import { formatDate } from "./course-format";
import { COLORS, CONTENT_ICON_FILL, COURSE_ASSETS, GOLD_GRADIENT, TYPE, gradientText } from "./my-courses-theme";
import { FadeDivider, ProgressTrack, framedPanelSx } from "./my-courses-ui";
import { COURSE_PANEL_STARS, RankCrest, RankHood, RankLevelHeading, RankStarField } from "./RankCrest";

const CONTENT_ICONS: Record<ContentBreakdownItem["kind"], string> = {
    video: `${COURSE_ASSETS}/content-video.svg`,
    test: `${COURSE_ASSETS}/content-test.svg`,
    lab: `${COURSE_ASSETS}/content-lab.svg`,
};

/** Flame layers relative to a 37.7 × 51 box (Figma group 40002340:166370); two copies offset by 1px. */
const FLAME_LAYERS: { src: string; left: number; top: number; width: number; height: number }[] = [
    { src: "streak-shadow", left: -6, top: 41.43, width: 49.684, height: 15.5618 },
    { src: "streak-flame", left: 0.73, top: 1, width: 36.2115, height: 48.208 },
    { src: "streak-flame-inner", left: 5.14, top: 22.62, width: 26.8125, height: 26.0093 },
    { src: "streak-flame-core", left: 10.71, top: 38.61, width: 15.6714, height: 9.20368 },
    { src: "streak-shadow", left: -6, top: 40.43, width: 49.684, height: 15.5618 },
    { src: "streak-flame", left: 0.73, top: 0, width: 36.2115, height: 48.208 },
    { src: "streak-flame-inner", left: 5.14, top: 21.62, width: 26.8125, height: 26.0093 },
    { src: "streak-flame-core", left: 10.71, top: 37.61, width: 15.6714, height: 9.20368 },
];

function StreakFlame() {
    return (
        <Box aria-hidden sx={{ position: "relative", width: 37.684, height: 51, flexShrink: 0 }}>
            {FLAME_LAYERS.map((layer, i) => (
                <Box key={`${layer.src}-${i}`} sx={{ position: "absolute", left: layer.left, top: layer.top, lineHeight: 0 }}>
                    <Image
                        src={`${COURSE_ASSETS}/${layer.src}.svg`}
                        alt=""
                        width={layer.width}
                        height={layer.height}
                        style={{ maxWidth: "none" }}
                    />
                </Box>
            ))}
        </Box>
    );
}

function ContentRow({ item }: { item: ContentBreakdownItem }) {
    return (
        <Box
            sx={{
                ...framedPanelSx({ angle: "175.93deg", radius: 12, highlight: "none" }),
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                p: "12px",
            }}
        >
            <Box
                sx={{
                    position: "relative",
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    borderRadius: "4px",
                    border: `1px solid ${COLORS.white}`,
                    backgroundImage: CONTENT_ICON_FILL,
                    boxShadow: "0px 14px 30.545px -16.545px #8A50E6",
                }}
            >
                <Image src={CONTENT_ICONS[item.kind]} alt="" width={20} height={20} />
            </Box>
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", gap: "8px", flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <Typography noWrap sx={{ ...TYPE.smallMed14, color: COLORS.neutral75 }}>
                        {item.label}
                        <Box component="span" sx={{ color: COLORS.neutral300, ml: "8px" }}>
                            {item.completed}/{item.total}
                        </Box>
                    </Typography>
                    <Typography sx={{ ...TYPE.smallMed14, ...gradientText(GOLD_GRADIENT), flexShrink: 0 }}>
                        +{item.totalXp}XP
                    </Typography>
                </Box>
                <ProgressTrack value={item.progress} fill={COLORS.purple} minFill={3} />
            </Box>
        </Box>
    );
}

interface Props {
    course: CourseOverview;
    onSetGoal: () => void;
    onViewGoal: () => void;
}

function goalTarget(goal: ActiveGoal): string {
    return goal.goalType === "complete_course" ? `Complete ${goal.courseLabel}` : `Reach Level ${goal.targetValue}`;
}

function GoalSummary({ goal }: { goal: ActiveGoal }) {
    return (
        <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "12px" }}>
            <Typography noWrap sx={{ ...TYPE.xsMed12, color: COLORS.neutral300, textTransform: "uppercase" }}>
                Your learning goal
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <Typography noWrap sx={{ ...TYPE.smallMed14, color: COLORS.white }}>
                    {goalTarget(goal)}
                </Typography>
                <Typography sx={{ ...TYPE.smallMed14, color: goal.onTrack ? COLORS.lessonDone : "#F59E0B", flexShrink: 0 }}>
                    {goal.onTrack ? "On track" : "Behind"}
                </Typography>
            </Box>
            <ProgressTrack value={goal.progressPct} fill={COLORS.purple} minFill={3} />
            <Typography sx={{ ...TYPE.xsMed12, color: COLORS.neutral200 }}>
                {goal.today.isLearningDay
                    ? `Today: ${goal.today.minutesLearned}/${goal.today.minutesPlanned} min`
                    : "Rest day today"}
                {` · Projected ${formatDate(goal.projectedDate)}`}
            </Typography>
        </Box>
    );
}

export default function CourseSidePanel({ course, onSetGoal, onViewGoal }: Props) {
    const { rank, activeGoal } = course;
    const streak = rank.currentStreak;
    const canSetGoal = course.status !== "Locked";
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <Box
                component="aside"
                sx={{
                    ...framedPanelSx({ angle: "150.01deg", highlight: "inset 0px 0px 6px 0px rgba(255,255,255,0.16)" }),
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px",
                    pt: "16px",
                    px: { xs: "16px", sm: "24px" },
                    pb: "24px",
                }}
            >
                <RankHood />
                <RankStarField layout={COURSE_PANEL_STARS} />

                <RankCrest />

                <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
                    <RankLevelHeading level={rank.level} title={rank.title} />

                    <FadeDivider variant="rank" />

                    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <Typography noWrap sx={{ ...TYPE.xsMed12, color: COLORS.neutral300, textTransform: "uppercase" }}>
                            Content
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {course.content.map((item) => (
                                <ContentRow key={item.kind} item={item} />
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Box
                sx={{
                    ...framedPanelSx({ angle: "164.5deg" }),
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                    p: "24px",
                }}
            >
                <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                    <StreakFlame />
                    <Typography sx={{ ...TYPE.largeSemibold18, color: COLORS.white, textAlign: "center" }}>
                        {streak > 0 ? `${streak} Day Streak` : "Start your Streak"}
                    </Typography>
                    <Typography sx={{ ...TYPE.xsMed12, color: COLORS.neutral75, textAlign: "center", width: "100%" }}>
                        {streak > 0
                            ? `Learn something today to keep it going. Your best streak is ${Math.max(rank.highestStreak, streak)} days.`
                            : "Complete your first learning activity today and start building your streak."}
                    </Typography>
                </Box>

                <Box sx={{ position: "relative" }}>
                    <FadeDivider variant="rank" />
                </Box>

                {activeGoal && <GoalSummary goal={activeGoal} />}

                <ButtonBase
                    onClick={activeGoal ? onViewGoal : onSetGoal}
                    disabled={!activeGoal && !canSetGoal}
                    sx={{
                        position: "relative",
                        width: "100%",
                        height: 44,
                        p: "16px",
                        borderRadius: "10px",
                        border: "2px solid #161DAC",
                        boxShadow: "0px 0px 8px 0px rgba(255,255,255,0.12)",
                        transition: "border-color .18s ease, box-shadow .18s ease",
                        "&:hover": { borderColor: "#4608AC", boxShadow: "0px 0px 12px 0px rgba(140,36,255,0.35)" },
                        "&.Mui-disabled": { opacity: 0.45 },
                        "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" },
                    }}
                >
                    <Typography component="span" sx={{ ...TYPE.buttonMed14, color: COLORS.white, whiteSpace: "nowrap" }}>
                        {activeGoal ? "View My Goal" : "Set Learning Goal"}
                    </Typography>
                </ButtonBase>
            </Box>
        </Box>
    );
}
