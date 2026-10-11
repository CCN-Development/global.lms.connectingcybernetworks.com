"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import LeaderboardPodium, { PODIUM_STAGE } from "@/components/courses/leaderboard/LeaderboardPodium";
import LeaderboardTable from "@/components/courses/leaderboard/LeaderboardTable";
import { LEADERBOARD_SCOPES, splitLeaderboard, type LeaderboardScope } from "@/components/courses/leaderboard/leaderboard-utils";
import { MY_COURSES_PATH } from "@/components/courses/course-format";
import { COLORS, TYPE } from "@/components/courses/my-courses-theme";
import { BackButton, NoticePanel, PillTabs } from "@/components/courses/my-courses-ui";
import { useCourse } from "@/contexts/CourseContext";

const ASSETS = "/my-courses/leaderboard";

export default function LeaderboardPage() {
    const router = useRouter();
    const { leaderboard, loadingLeaderboard, getLeaderboard } = useCourse();
    const [scope, setScope] = useState<LeaderboardScope>("batch");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getLeaderboard({ scope }).then((res) => setError(res.success ? null : (res.message ?? "Failed to fetch the leaderboard")));
    }, [scope, getLeaderboard]);

    const board = leaderboard?.scope === scope ? leaderboard : null;
    const split = board ? splitLeaderboard(board) : null;
    const batchName = scope === "batch" ? (board?.batch?.batchName ?? null) : null;

    const goBack = () => {
        if (window.history.length > 1) router.back();
        else router.push(MY_COURSES_PATH);
    };

    let body: React.ReactNode;
    if (!board) {
        body = error ? (
            <Box sx={{ width: "100%", maxWidth: 728, mt: "48px" }}>
                <NoticePanel title="We couldn't load the leaderboard" message={error} action={{ label: "Try again", onClick: () => getLeaderboard({ scope }) }} />
            </Box>
        ) : (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 360 }}>
                <CircularProgress size={32} sx={{ color: COLORS.purple }} />
            </Box>
        );
    } else if (!split || board.entries.length === 0) {
        body = (
            <Box sx={{ width: "100%", maxWidth: 728, mt: "48px" }}>
                <NoticePanel
                    title={scope === "batch" && !board.batch ? "You're not part of a batch yet" : "No rankings yet"}
                    message={
                        scope === "batch" && !board.batch
                            ? "Join a batch to compete with your classmates, or check the Global board."
                            : "Complete lessons, quizzes and labs to earn XP and claim the top spot."
                    }
                    action={scope === "batch" ? { label: "View Global board", onClick: () => setScope("global") } : undefined}
                />
            </Box>
        );
    } else {
        body = (
            <>
                {/* The #1 crest rises 2px into the header row, as in the design. */}
                <Box
                    sx={{
                        position: "relative",
                        mt: "-2px",
                        flexShrink: 0,
                        display: "flex",
                        justifyContent: "center",
                        width: "100%",
                        minWidth: PODIUM_STAGE.width,
                        opacity: loadingLeaderboard ? 0.6 : 1,
                        transition: "opacity .18s ease",
                    }}
                >
                    <LeaderboardPodium podium={split.podium} currentLearnerId={board.currentLearnerId} />
                </Box>

                <Box sx={{ position: "relative", mt: "24px", display: "flex", justifyContent: "center", width: "100%", minHeight: 0, flex: "0 1 auto" }}>
                    <LeaderboardTable rows={split.rows} pinned={split.pinned} currentLearnerId={board.currentLearnerId} />
                </Box>
            </>
        );
    }

    return (
        <Box
            sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "100dvh",
                overflowX: "hidden",
                overflowY: "auto",
                p: { xs: "16px", md: "24px" },
                background: `#000 url(${ASSETS}/background.webp) top center / cover no-repeat`,
                color: COLORS.white,
            }}
        >
            {/* Star dust drifting in from above the podium */}
            <Box aria-hidden sx={{ position: "absolute", left: "calc(50% - 417px)", top: "-532px", lineHeight: 0, pointerEvents: "none" }}>
                <Image src={`${ASSETS}/star-dust.svg`} alt="" width={901} height={831} loading="eager" style={{ maxWidth: "none" }} />
            </Box>

            <Box
                component="header"
                sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    width: "100%",
                    minHeight: 48,
                    flexShrink: 0,
                    zIndex: 1,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
                    <BackButton label="Back to My Courses" onClick={goBack} />
                    <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <Typography component="h1" noWrap sx={{ ...TYPE.headingMed20, color: COLORS.white }}>
                            My Leaderboard
                        </Typography>
                        {batchName && (
                            <Typography noWrap sx={{ ...TYPE.xsMed12, color: COLORS.neutral300 }}>
                                {batchName}
                            </Typography>
                        )}
                    </Box>
                </Box>

                <PillTabs options={LEADERBOARD_SCOPES} value={scope} onChange={setScope} ariaLabel="Leaderboard scope" />
            </Box>

            {body}
        </Box>
    );
}
