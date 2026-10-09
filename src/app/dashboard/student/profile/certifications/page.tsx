"use client";

import React from "react";
import { Box } from "@mui/material";
import { AchievementStats, BadgesSection, CertificationsCard, XpHistoryCard } from "@/components/profile/AchievementsSections";

export default function CertificationsAchievementsPage() {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <AchievementStats />
            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: "32px", md: "76px" } }}>
                <BadgesSection />
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 683fr) minmax(0, 699fr)" },
                        alignItems: "start",
                        gap: { xs: "24px", md: "10px" },
                    }}
                >
                    <XpHistoryCard />
                    <CertificationsCard />
                </Box>
            </Box>
        </Box>
    );
}
