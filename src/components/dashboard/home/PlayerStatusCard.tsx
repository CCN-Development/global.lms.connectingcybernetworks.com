"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { asset, Decor, GlassCard, lato, poppins } from "./shared";
import { PLAYER_STATS, type PlayerStat } from "./data";

interface PlayerStatusCardProps {
    stats?: PlayerStat[];
}

export default function PlayerStatusCard({ stats = PLAYER_STATS }: PlayerStatusCardProps) {
    return (
        <GlassCard angle={174.89}>
            <Typography component="h2" sx={poppins(20, 30)}>
                Player Status
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns:"1fr 1fr", gap: "16px", width: "100%" }}>
                {stats.map((stat) => (
                    <Box
                        key={stat.id}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            width: "100%",
                            minWidth: 0,
                            height: 63,
                            p: "12px",
                            borderRadius: "12px",
                            bgcolor: "rgba(255,255,255,0.01)",
                            border: "1px solid rgba(64,64,64,0.5)",
                        }}
                    >
                        <Box sx={{ position: "relative", width: 32, height: 32, flexShrink: 0 }}>
                            <Decor src={asset(stat.icon)} sx={{ inset: 0 }} bleed="-15.91% -95.45% -175% -95.45%" />
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0, whiteSpace: "nowrap" }}>
                            <Typography sx={lato(16, 24, 500, "#FFFFFF")}>
                                {stat.value}
                            </Typography>
                            <Typography sx={lato(12, 18, 400, "#BFBFBF")}>
                                {stat.label}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </GlassCard>
    );
}
