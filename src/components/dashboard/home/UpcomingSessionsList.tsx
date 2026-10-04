"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { lato, poppins, rowSurface, RowGlows, SectionHeader, SeeAllButton } from "./shared";
import { UPCOMING_SESSIONS, type SessionItem } from "./data";

interface UpcomingSessionsListProps {
    sessions?: SessionItem[];
    onSeeAll?: () => void;
}

export default function UpcomingSessionsList({ sessions = UPCOMING_SESSIONS, onSeeAll }: UpcomingSessionsListProps) {
    return (
        <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
            <SectionHeader title="Upcoming Sessions">
                <SeeAllButton onClick={onSeeAll} />
            </SectionHeader>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {sessions.map((session) => (
                    <Box
                        key={session.id}
                        sx={{
                            ...rowSurface,
                            display: "flex",
                            alignItems: "flex-start",
                            gap: { xs: "12px", sm: "24px" },
                            px: { xs: "16px", sm: "24px" },
                            py: "16px",
                            borderRadius: "24px",
                        }}
                    >
                        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                            <Typography noWrap sx={poppins(20, 30)}>
                                {session.title}
                            </Typography>
                            <Typography sx={{ ...lato(14, 21, 400, "#A6A6A6"), letterSpacing: "0.28px" }}>{session.type}</Typography>
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "8px",
                                flexShrink: 0,
                                ...lato(16, 24, 500, "#D9D9D9"),
                            }}
                        >
                            <Typography sx={{ font: "inherit", color: "inherit", whiteSpace: "nowrap" }}>{session.date}</Typography>
                            <Typography sx={{ font: "inherit", color: "inherit", whiteSpace: "nowrap" }}>{session.time}</Typography>
                        </Box>
                        <RowGlows />
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
