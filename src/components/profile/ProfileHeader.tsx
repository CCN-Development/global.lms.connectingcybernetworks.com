"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Box, ButtonBase, Typography } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import { PC, profileAsset } from "./profile-data";
import { GlassIconButton, PIcon, PT, SegmentedTabs, strokeLayer } from "./profile-ui";

const BASE = "/dashboard/student/profile";

export const PROFILE_TABS = [
    { id: "personal", label: "Personal Details", href: BASE },
    { id: "fees", label: "Fees Details", href: `${BASE}/fee-details` },
    { id: "achievements", label: "Certifications & Achievements", href: `${BASE}/certifications` },
] as const;

function activeTab(pathname: string) {
    if (pathname.startsWith(`${BASE}/fee-details`)) return "fees";
    if (pathname.startsWith(`${BASE}/certifications`)) return "achievements";
    return "personal";
}

export default function ProfileHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    return (
        <Box
            component="header"
            sx={{
                position: "relative",
                display: "flex",
                flexWrap: { xs: "wrap", lg: "nowrap" },
                alignItems: "center",
                justifyContent: "space-between",
                gap: { xs: "16px", md: "24px" },
                minHeight: 52,
                width: "100%",
            }}
        >
            {/* Starfield decoration above the header (Figma "Vector", 24% opacity baked in). */}
            <Box
                aria-hidden
                component="img"
                src={profileAsset("header-vector.svg")}
                alt=""
                sx={{ position: "absolute", left: 158, top: -756, width: 901, height: 831, maxWidth: "none", pointerEvents: "none", zIndex: 0 }}
            />

            <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
                <GlassIconButton icon="icon-arrow-back.svg" label="Go back" onClick={() => router.back()} />
                <Typography component="h1" sx={{ ...PT.poppinsMed20, color: PC.white, whiteSpace: "nowrap" }}>
                    My Profile
                </Typography>
            </Box>

            <Box
                sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: "12px", md: "24px" },
                    minWidth: 0,
                    maxWidth: "100%",
                    order: { xs: 3, lg: 0 },
                    width: { xs: "100%", lg: "auto" },
                    justifyContent: { xs: "space-between", lg: "flex-end" },
                }}
            >
                <SegmentedTabs
                    options={PROFILE_TABS}
                    value={activeTab(pathname)}
                    onChange={(id) => {
                        const tab = PROFILE_TABS.find((t) => t.id === id);
                        if (tab) router.push(tab.href);
                    }}
                />
                <ButtonBase
                    onClick={handleLogout}
                    sx={{
                        position: "relative",
                        display: { xs: "none", lg: "flex" },
                        alignItems: "center",
                        gap: "12px",
                        height: 44,
                        pl: "12px",
                        pr: "16px",
                        borderRadius: "8px",
                        flexShrink: 0,
                        boxShadow: "0 4px 24px rgba(0,0,0,0.16)",
                        "&::before": strokeLayer("linear-gradient(180deg, rgba(140,140,140,0.5) 0%, #262626 100%)"),
                        "&:hover": { bgcolor: "rgba(209,41,61,0.08)" },
                    }}
                >
                    <PIcon name="icon-log-out.svg" size={20} />
                    <Typography component="span" sx={{ ...PT.med14, color: PC.error500, whiteSpace: "nowrap" }}>
                        Log out
                    </Typography>
                </ButtonBase>
            </Box>

            {/* Compact log out for small screens, kept next to the title row. */}
            <ButtonBase
                onClick={handleLogout}
                aria-label="Log out"
                sx={{
                    position: "relative",
                    display: { xs: "flex", lg: "none" },
                    alignItems: "center",
                    justifyContent: "center",
                    width: 44,
                    height: 44,
                    borderRadius: "8px",
                    "&::before": strokeLayer("linear-gradient(180deg, rgba(140,140,140,0.5) 0%, #262626 100%)"),
                }}
            >
                <PIcon name="icon-log-out.svg" size={20} />
            </ButtonBase>
        </Box>
    );
}
