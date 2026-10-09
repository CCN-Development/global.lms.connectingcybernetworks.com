"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import LeaderboardPodium, { PODIUM_STAGE } from "@/components/courses/leaderboard/LeaderboardPodium";
import LeaderboardTable from "@/components/courses/leaderboard/LeaderboardTable";
import {
    LEADERBOARDS,
    LEADERBOARD_SCOPES,
    splitLeaderboard,
    type LeaderboardScope,
} from "@/components/courses/leaderboard/leaderboard-data";
import { COLORS, TYPE } from "@/components/courses/my-courses-theme";
import { BackButton, PillTabs } from "@/components/courses/my-courses-ui";

const ASSETS = "/my-courses/leaderboard";
const MY_COURSES_PATH = "/dashboard/student/my-courses";

export default function LeaderboardPage() {
    const router = useRouter();
    const [scope, setScope] = useState<LeaderboardScope>("batch");

    const board = LEADERBOARDS[scope];
    const { podium, rows, pinned } = useMemo(() => splitLeaderboard(board), [board]);

    const goBack = () => {
        if (window.history.length > 1) router.back();
        else router.push(MY_COURSES_PATH);
    };

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
                    <Typography component="h1" noWrap sx={{ ...TYPE.headingMed20, color: COLORS.white }}>
                        My Leaderboard
                    </Typography>
                </Box>

                <PillTabs options={LEADERBOARD_SCOPES} value={scope} onChange={setScope} ariaLabel="Leaderboard scope" />
            </Box>

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
                }}
            >
                <LeaderboardPodium podium={podium} currentLearnerId={board.currentLearnerId} />
            </Box>

            <Box sx={{ position: "relative", mt: "24px", display: "flex", justifyContent: "center", width: "100%", minHeight: 0, flex: "0 1 auto" }}>
                <LeaderboardTable rows={rows} pinned={pinned} currentLearnerId={board.currentLearnerId} />
            </Box>
        </Box>
    );
}
