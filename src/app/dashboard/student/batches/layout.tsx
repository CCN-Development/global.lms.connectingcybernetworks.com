"use client";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import StudentLayout from "@/layouts/StudentLayout";
import StudentHeader from "@/layouts/StudentHeader";
import { Box, Typography, Button, ButtonBase } from "@mui/material";
import CCNTabs from "@/components/CCNTabs";
import { FONT_INTER, FONT_LATO } from "@/components/batches/batch-card-ui";

const BASE = "/dashboard/student/batches";

const TABS = [
    { label: "Ongoing", href: BASE },
    { label: "Upcoming", href: `${BASE}/upcoming` },
    { label: "Completed", href: `${BASE}/completed` },
    { label: "Rejected", href: `${BASE}/rejected` },
    { label: "Missed", href: `${BASE}/missed` },
];

const yearStepSx = {
    width: 20,
    height: 20,
    minWidth: 0,
    borderRadius: "6px",
    bgcolor: "rgba(242,242,242,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": { bgcolor: "rgba(242,242,242,0.22)" },
};

export default function BatchesLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const isExplore = pathname.includes("explore-batches");
    const isCompleted = pathname === `${BASE}/completed`;
    const [year, setYear] = useState(new Date().getFullYear());

    const activeHref =
        TABS.find(({ href }) => (href === BASE ? pathname === href : pathname.startsWith(href)))?.href ?? BASE;

    const changeYear = (delta: number) => {
        const next = year + delta;
        setYear(next);
        router.replace(`${BASE}/completed?year=${next}`, { scroll: false });
    };

    const header = isExplore ? (
        <StudentHeader
            title={
                <Box sx={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
                    <ButtonBase
                        aria-label="Back"
                        onClick={() => router.push(BASE)}
                        sx={{
                            width: 44,
                            height: 44,
                            flexShrink: 0,
                            borderRadius: "50px",
                            border: "1px solid rgba(255,255,255,0.08)",
                            backgroundImage: "linear-gradient(180deg, rgba(227,233,248,0.08) 0%, rgba(134,137,146,0.04) 100%)",
                            backdropFilter: "blur(25px)",
                            "&:hover": { borderColor: "rgba(255,255,255,0.2)" },
                        }}
                    >
                        <Box component="img" src="/batches/explore/icon-arrow-back.svg" alt="" sx={{ width: 24, height: 24 }} />
                    </ButtonBase>
                    <Typography sx={{ minWidth: 0, fontFamily: "var(--font-poppins), Poppins, sans-serif", fontWeight: 500, fontSize: "20px", lineHeight: "30px", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        Explore Batches
                    </Typography>
                </Box>
            }
        />
    ) : (
        <StudentHeader title="My Batches" />
    );

    return (
        <StudentLayout header={header} fullBleed>
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    overflowX: "hidden",
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                    pt: { xs: "12px", md: "32px" },
                    pb: "24px",
                }}
            >
                {!isExplore && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: { xs: "20px", md: "32px" }, flexWrap: "wrap" }}>
                        <CCNTabs
                            size="lg"
                            tabs={TABS}
                            value={activeHref}
                            onChange={({ href }) => href && router.push(href)}
                        />
    
                        <Box sx={{ flex: 1 }} />
    
                        <Box sx={{ display: "flex", alignItems: "center", gap: "24px" }}>
                            {/* Year selector — only on Completed tab */}
                            {isCompleted && (
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        height: 44,
                                        px: "23px",
                                        borderRadius: "12px",
                                        border: "1px solid rgba(140,140,140,0.44)",
                                    }}
                                >
                                    <Typography sx={{ fontFamily: FONT_INTER, fontWeight: 500, fontSize: "16px", lineHeight: "24px", color: "#fff" }}>
                                        {year}
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <ButtonBase aria-label="Next year" onClick={() => changeYear(1)} sx={yearStepSx}>
                                            <Box component="img" src="/batches/chevron-up.svg" alt="" sx={{ width: 16, height: 16 }} />
                                        </ButtonBase>
                                        <ButtonBase aria-label="Previous year" onClick={() => changeYear(-1)} sx={yearStepSx}>
                                            <Box component="img" src="/batches/chevron-down.svg" alt="" sx={{ width: 16, height: 16 }} />
                                        </ButtonBase>
                                    </Box>
                                </Box>
                            )}
    
                            <Button
                                onClick={() => router.push(`${BASE}/explore-batches`)}
                                sx={{
                                    bgcolor: "#f2f2f2",
                                    color: "#0d0d0d",
                                    borderRadius: "8px",
                                    fontFamily: FONT_LATO,
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    lineHeight: "21px",
                                    px: "12px",
                                    py: "8px",
                                    minWidth: 0,
                                    textTransform: "none",
                                    whiteSpace: "nowrap",
                                    filter: "drop-shadow(0 2px 4px rgba(255,255,255,0.04))",
                                    "&:hover": { bgcolor: "#ffffff" },
                                }}
                            >
                                Explore Batches
                            </Button>
                        </Box>
                    </Box>
                )}
                {children}
            </Box>
        </StudentLayout>
    );
}
