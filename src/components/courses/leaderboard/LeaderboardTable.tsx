"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { COLORS, TYPE, glassFill } from "../my-courses-theme";
import { AVATAR_PLACEHOLDER, displayName, type LeaderboardEntry } from "./leaderboard-utils";

const COLUMNS = {
    rank: 31,
    level: 32,
    points: 86,
    badges: 45,
} as const;

const ROW_GAP = { xs: "12px", md: "47px" };
const ROW_HEIGHT = 62;
const PINNED_FILL = "linear-gradient(90deg, rgba(140,36,255,0.44) 0%, rgba(84,22,153,0.22) 100%)";

function Avatar({ entry }: { entry: LeaderboardEntry }) {
    return (
        <Box
            sx={{
                position: "relative",
                width: 40,
                height: 40,
                flexShrink: 0,
                overflow: "hidden",
                borderRadius: "82.5px",
                border: `0.833px solid ${COLORS.primary75}`,
                bgcolor: COLORS.primary75,
            }}
        >
            <Box
                component="img"
                src={entry.avatar ?? AVATAR_PLACEHOLDER}
                alt=""
                sx={entry.avatar ? { width: "100%", height: "100%", objectFit: "cover" } : { position: "absolute", left: -15, top: 2.5, width: 67.5, height: 67.5, maxWidth: "none" }}
            />
        </Box>
    );
}

function Row({ entry, currentLearnerId, pinned = false }: { entry: LeaderboardEntry; currentLearnerId: string; pinned?: boolean }) {
    const stat = { ...TYPE.largeMed18, color: COLORS.white, textAlign: "center" as const, flexShrink: 0 };
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: ROW_GAP,
                px: { xs: "12px", md: "24px" },
                py: "8px",
                minHeight: ROW_HEIGHT,
                ...(pinned && {
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: PINNED_FILL,
                    backdropFilter: "blur(44px)",
                }),
            }}
        >
            <Typography sx={{ ...TYPE.mediumMed16, width: COLUMNS.rank, flexShrink: 0, textAlign: "center", color: pinned ? COLORS.neutral100 : COLORS.neutral300 }}>
                {entry.rank}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: 0 }}>
                <Avatar entry={entry} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                    <Typography noWrap sx={{ ...TYPE.mediumMed16, color: COLORS.neutral75 }}>
                        {displayName(entry, currentLearnerId)}
                    </Typography>
                    <Typography noWrap sx={{ ...TYPE.xsMed12, color: COLORS.neutral200 }}>
                        {entry.batchName ?? "Independent learner"}
                    </Typography>
                </Box>
            </Box>
            <Typography sx={{ ...stat, width: COLUMNS.level }}>{entry.level}</Typography>
            <Typography sx={{ ...stat, width: COLUMNS.points }}>{entry.points}</Typography>
            <Typography sx={{ ...stat, width: COLUMNS.badges }}>{entry.badges}</Typography>
        </Box>
    );
}

const HEADERS = ["Rank", "Name", "Level", "Points Earned", "Badges"];

export default function LeaderboardTable({
    rows,
    pinned,
    currentLearnerId,
}: {
    rows: LeaderboardEntry[];
    pinned: LeaderboardEntry | null;
    currentLearnerId: string;
}) {
    return (
        <Box
            component="section"
            aria-label="Leaderboard"
            sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: "22px",
                width: 768,
                maxWidth: "100%",
                minHeight: 240,
                flex: "0 1 auto",
                p: { xs: "16px", md: "24px" },
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.88)",
                backgroundImage: glassFill("166.99deg"),
                backdropFilter: "blur(12px)",
                boxShadow: "inset 0px 3px 6px 0px rgba(255,255,255,0.16)",
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: "16px", md: "50px" },
                    px: "20px",
                    py: "12px",
                    borderRadius: "99px",
                    bgcolor: "rgba(115,115,115,0.12)",
                    flexShrink: 0,
                }}
            >
                {HEADERS.map((label) => (
                    <Typography
                        key={label}
                        sx={{ ...TYPE.smallMed14, color: COLORS.neutral200, whiteSpace: "nowrap", ...(label === "Name" && { flex: 1, minWidth: 0 }) }}
                    >
                        {label}
                    </Typography>
                ))}
            </Box>

            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                    pb: pinned ? `${ROW_HEIGHT}px` : 0,
                }}
            >
                {rows.map((entry) => (
                    <Row key={entry.learnerId} entry={entry} currentLearnerId={currentLearnerId} />
                ))}
            </Box>

            {pinned && <Row entry={pinned} currentLearnerId={currentLearnerId} pinned />}
        </Box>
    );
}
