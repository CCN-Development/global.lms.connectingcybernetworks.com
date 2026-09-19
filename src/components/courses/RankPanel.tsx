"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { MdBolt, MdWorkspacePremium, MdLocalFireDepartment, MdLeaderboard, MdInsertChart } from "react-icons/md";
import LevelShield from "./LevelShield";
import { ProgressRow, SectionLabel, StatTile } from "./course-ui";
import type { LearnerRank } from "./course-data";

export default function RankPanel({ rank }: { rank: LearnerRank }) {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.25,
                p: 1.25,
                borderRadius: "14px",
                border: "1px solid #1c1c26",
                bgcolor: "#07070d",
            }}
        >
            <LevelShield level={rank.level} title={rank.title} />

            <Box>
                <SectionLabel>YOUR OVERALL PERFORMANCE</SectionLabel>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1 }}>
                    <StatTile icon={<MdBolt size={14} />} value={String(rank.totalPoints)} label="Total Points Earned" accent="#7c3aed" />
                    <StatTile icon={<MdWorkspacePremium size={14} />} value={String(rank.totalBadges)} label="Total Badges Earned" accent="#f59e0b" />
                    <StatTile icon={<MdLocalFireDepartment size={14} />} value={String(rank.highestStreak)} label="Highest Streak" accent="#f43f5e" />
                    <StatTile icon={<MdLeaderboard size={14} />} value={`#${rank.batchRank}`} label="Batch Rank" accent="#06b6d4" />
                </Box>
            </Box>

            <Box>
                <SectionLabel>YOUR STATS</SectionLabel>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                    <ProgressRow
                        label="Course Completed"
                        counter={`${rank.coursesCompleted}/${rank.coursesTotal}`}
                        value={(rank.coursesCompleted / rank.coursesTotal) * 100}
                        from="#009DFF"
                        to="#7c3aed"
                    />
                    <ProgressRow
                        label="Levels Completed"
                        counter={`${rank.levelsCompleted}/${rank.levelsTotal}`}
                        value={(rank.levelsCompleted / rank.levelsTotal) * 100}
                        from="#06b6d4"
                        to="#10b981"
                    />
                    <ProgressRow
                        label="Labs Completed"
                        counter={`${rank.labsCompleted}/${rank.labsTotal}`}
                        value={(rank.labsCompleted / rank.labsTotal) * 100}
                        from="#f59e0b"
                        to="#f43f5e"
                    />
                </Box>
            </Box>

            <Box>
                <SectionLabel>NEXT MILESTONE</SectionLabel>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                        p: 1.25,
                        borderRadius: "10px",
                        border: "1px solid #312e81",
                        background: "linear-gradient(120deg, #141433 0%, #0a0a16 100%)",
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ color: "#fff", fontSize: "0.85rem", fontWeight: 700, lineHeight: 1.25 }}>
                            {rank.nextMilestone.title}
                        </Typography>
                        <Typography sx={{ mt: 0.4, color: "#9a9aab", fontSize: "0.65rem", lineHeight: 1.5 }}>
                            {rank.nextMilestone.description}
                        </Typography>
                    </Box>
                    <MdInsertChart size={44} color="#a78bfa" style={{ flexShrink: 0 }} />
                </Box>
            </Box>
        </Box>
    );
}
