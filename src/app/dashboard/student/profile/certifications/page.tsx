"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useStudent } from "@/contexts/StudentContext";
import { AchievementStats, BadgesSection, CertificationsCard, XpHistoryCard } from "@/components/profile/AchievementsSections";
import { ProfileError, ProfileLoading } from "@/components/profile/ProfileStates";

export default function CertificationsAchievementsPage() {
    const { achievements, loadingAchievements, getAchievements } = useStudent();
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setError(null);
        const res = await getAchievements();
        if (!res.success) setError(res.message ?? "Failed to load your achievements");
    }, [getAchievements]);

    useEffect(() => {
        void load();
    }, [load]);

    if (!achievements) {
        if (error && !loadingAchievements) return <ProfileError message={error} onRetry={load} />;
        return <ProfileLoading columns="minmax(0, 683fr) minmax(0, 699fr)" cards={[2, 2]} />;
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <AchievementStats achievements={achievements} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: "32px", md: "76px" } }}>
                <BadgesSection badges={achievements.badges} />
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 683fr) minmax(0, 699fr)" },
                        alignItems: "start",
                        gap: { xs: "24px", md: "10px" },
                    }}
                >
                    <XpHistoryCard entries={achievements.xpHistory} />
                    <CertificationsCard certifications={achievements.certifications} />
                </Box>
            </Box>
        </Box>
    );
}
