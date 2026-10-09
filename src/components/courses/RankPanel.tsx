"use client";

import React from "react";
import Image from "next/image";
import { Box, Typography } from "@mui/material";
import type { LearnerRank } from "./course-data";
import { COLORS, MY_COURSES_ASSETS, STAT_ROW_FILL, TYPE, glassFill } from "./my-courses-theme";
import { FadeDivider, ProgressTrack } from "./my-courses-ui";
import { RankCrest, RankStarField } from "./RankCrest";

const RANK = `${MY_COURSES_ASSETS}/rank`;

const PERFORMANCE: { key: string; icon: string; label: string; value: (r: LearnerRank) => string }[] = [
    { key: "points", icon: `${RANK}/stat-points.svg`, label: "Total Points Earned", value: (r) => String(r.totalPoints) },
    { key: "badges", icon: `${RANK}/stat-badges.svg`, label: "Total Badges Earned", value: (r) => String(r.totalBadges) },
    { key: "streak", icon: `${RANK}/stat-streak.svg`, label: "Highest Streak", value: (r) => String(r.highestStreak) },
    { key: "rank", icon: `${RANK}/stat-rank.svg`, label: "Batch Rank", value: (r) => `#${r.batchRank}` },
];

const PROGRESS: { key: string; label: string; done: (r: LearnerRank) => number; total: (r: LearnerRank) => number }[] = [
    { key: "courses", label: "Course Completed", done: (r) => r.coursesCompleted, total: (r) => r.coursesTotal },
    { key: "levels", label: "Levels Completed", done: (r) => r.levelsCompleted, total: (r) => r.levelsTotal },
    { key: "labs", label: "Labs Completed", done: (r) => r.labsCompleted, total: (r) => r.labsTotal },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <Typography noWrap sx={{ ...TYPE.xsMed12, color: COLORS.neutral500, textTransform: "uppercase" }}>
            {children}
        </Typography>
    );
}

function PerformanceTile({ icon, value, label }: { icon: string; value: string; label: string }) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                height: 63,
                minWidth: 0,
                p: "12px",
                borderRadius: "12px",
                border: `1px solid ${COLORS.tileBorder}`,
                bgcolor: COLORS.tileFill,
            }}
        >
            <Box sx={{ position: "relative", width: 32, height: 32, flexShrink: 0 }}>
                <Box sx={{ position: "absolute", left: "-30.55px", top: "-5.09px", lineHeight: 0, pointerEvents: "none" }}>
                    <Image src={icon} alt="" width={93.0909} height={93.0909} style={{ maxWidth: "none" }} />
                </Box>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                <Typography noWrap sx={{ ...TYPE.mediumMed16, color: COLORS.white }}>
                    {value}
                </Typography>
                <Typography noWrap sx={{ ...TYPE.xsReg12, color: COLORS.neutral200 }}>
                    {label}
                </Typography>
            </Box>
        </Box>
    );
}

function ProgressRow({ label, done, total }: { label: string; done: number; total: number }) {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                pt: "8px",
                pb: "12px",
                px: "12px",
                borderRadius: "8px",
                backgroundImage: STAT_ROW_FILL,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <Typography noWrap sx={{ ...TYPE.xsReg12, color: COLORS.neutral300 }}>
                    {label}
                </Typography>
                <Typography sx={{ ...TYPE.smallSemibold14, color: COLORS.white, flexShrink: 0 }}>
                    {done}/{total}
                </Typography>
            </Box>
            <ProgressTrack value={total > 0 ? (done / total) * 100 : 0} fill={COLORS.purple} minFill={1} />
        </Box>
    );
}

export default function RankPanel({ rank }: { rank: LearnerRank }) {
    return (
        <Box
            component="aside"
            sx={{
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                pt: "16px",
                px: { xs: "16px", sm: "24px" },
                pb: "24px",
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.88)",
                // Glass lives on ::before so the panel itself isn't an isolated group — the star field's
                // color-dodge must blend with the dark page behind it, as in Figma.
                "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    borderRadius: "inherit",
                    backgroundImage: glassFill("163.41deg"),
                    backdropFilter: "blur(12px)",
                    pointerEvents: "none",
                },
                "&::after": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    borderRadius: "inherit",
                    boxShadow: "inset 0px 0px 6px 0px rgba(255,255,255,0.16)",
                    pointerEvents: "none",
                },
            }}
        >
            {/* Backdrop hood behind the crest */}
            <Box
                aria-hidden
                sx={{
                    position: "absolute",
                    top: "-1px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 360,
                    height: 111,
                    overflow: "hidden",
                    opacity: 0.44,
                    pointerEvents: "none",
                }}
            >
                <Image
                    src={`${RANK}/hood.png`}
                    alt=""
                    width={1264}
                    height={563}
                    sizes="360px"
                    style={{ position: "absolute", left: 0, top: "-38.63%", width: "100%", height: "144.46%", maxWidth: "none" }}
                />
            </Box>
            <RankStarField />

            <RankCrest />

            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", textAlign: "center" }}>
                    <Typography sx={{ ...TYPE.xsReg12, color: COLORS.neutral500 }}>YOU&rsquo;RE AT</Typography>
                    <Typography sx={{ ...TYPE.headingSemibold24, color: COLORS.white }}>Level {rank.level}</Typography>
                    <Typography sx={{ ...TYPE.mediumMed16, color: COLORS.neutral200 }}>{rank.title}</Typography>
                </Box>

                <FadeDivider variant="rank" />

                <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <SectionLabel>Your Overall Performance</SectionLabel>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px" }}>
                        {PERFORMANCE.map((stat) => (
                            <PerformanceTile key={stat.key} icon={stat.icon} label={stat.label} value={stat.value(rank)} />
                        ))}
                    </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <SectionLabel>Your Stats</SectionLabel>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {PROGRESS.map((row) => (
                            <ProgressRow key={row.key} label={row.label} done={row.done(rank)} total={row.total(rank)} />
                        ))}
                    </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <SectionLabel>Next Milestone</SectionLabel>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "24px",
                            p: "16px",
                            borderRadius: "12px",
                            borderStyle: "solid",
                            borderColor: COLORS.milestoneBorder,
                            borderWidth: "0.6px 0.6px 2px 0.6px",
                            bgcolor: COLORS.milestoneFill,
                            overflow: "hidden",
                        }}
                    >
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0, maxWidth: 248 }}>
                            <Typography sx={{ ...TYPE.largeSemibold18, color: COLORS.white }}>{rank.nextMilestone.title}</Typography>
                            <Typography sx={{ ...TYPE.xsMed12, color: COLORS.neutral200 }}>{rank.nextMilestone.description}</Typography>
                        </Box>
                        <Box sx={{ position: "relative", width: 69, height: 69, flexShrink: 0, ml: "auto" }}>
                            <Image src={rank.nextMilestone.icon} alt="" fill sizes="69px" style={{ objectFit: "cover" }} />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
