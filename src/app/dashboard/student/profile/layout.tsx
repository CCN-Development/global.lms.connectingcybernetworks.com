"use client";

import React from "react";
import { Box } from "@mui/material";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { RequestProvider } from "@/contexts/RequestContext";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return (
        <RequestProvider>
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                    p: { xs: "16px", md: "24px" },
                    overflowX: "clip",
                }}
            >
                <ProfileHeader />
                {children}
            </Box>
        </RequestProvider>
    );
}
