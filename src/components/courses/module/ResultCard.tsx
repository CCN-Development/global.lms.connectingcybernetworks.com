"use client";

import React from "react";
import Image from "next/image";
import { Box, Typography } from "@mui/material";
import { ACTIVITY_ASSETS, COLORS, TYPE } from "../my-courses-theme";
import { ActivityButton, ActivityCard, CardDivider, CardGlows, GhostButton, StatTiles, ACTIVITY_TYPE, type StatTile } from "./activity-ui";

export interface ResultBadge {
    src: string;
    glow: string;
    width: number;
    height: number;
    /** Offset from the card's top edge. */
    top: number;
}

export const QUIZ_BADGE: ResultBadge = {
    src: `${ACTIVITY_ASSETS}/result-badge.svg`,
    glow: `${ACTIVITY_ASSETS}/result-badge-glow.svg`,
    width: 151.78,
    height: 74.0146,
    top: -49,
};

export const LAB_BADGE: ResultBadge = {
    src: `${ACTIVITY_ASSETS}/lab-badge.svg`,
    glow: `${ACTIVITY_ASSETS}/lab-badge-glow.svg`,
    width: 151.78,
    height: 61.5926,
    top: -56,
};

/** "Knowledge Check Complete" / "Lab Completed" card with the shield badge sitting on its top edge. */
export default function ResultCard({
    badge,
    title,
    subtitle,
    tiles,
    bonus,
    nextStep,
    primary,
    secondary,
    leftGlow = `${ACTIVITY_ASSETS}/result-glow-left.svg`,
}: {
    badge: ResultBadge;
    title: string;
    subtitle: string;
    tiles: StatTile[];
    bonus?: { label: string; xp: number };
    nextStep?: string;
    primary: { label: string; onClick: () => void };
    secondary: { label: string; onClick: () => void };
    leftGlow?: string;
}) {
    return (
        <Box sx={{ display: "flex", justifyContent: "center", pt: { xs: "72px", md: "44px" }, pb: "32px" }}>
            <Box sx={{ position: "relative", width: 669, maxWidth: "100%" }}>
                {/* Violet haze spilling out past the card's left edge. */}
                <Box
                    aria-hidden
                    component="img"
                    src={`${ACTIVITY_ASSETS}/result-ellipse.svg`}
                    alt=""
                    sx={{ position: "absolute", left: -744.55, top: -134.08, width: 1140.09, height: 1140.09, maxWidth: "none", pointerEvents: "none" }}
                />

                <ActivityCard
                    angle="161.23deg"
                    sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "32px", pt: "88px", pb: "32px", px: { xs: "16px", sm: "24px" } }}
                >
                    <CardGlows
                        left={leftGlow}
                        right={`${ACTIVITY_ASSETS}/result-glow-right.svg`}
                        leftAt={{ left: -557.01, top: -33 }}
                        rightAt={{ left: 649, top: -235 }}
                    />

                    <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%", maxWidth: 580, textAlign: "center" }}>
                        <Typography component="h2" sx={{ ...TYPE.headingSemibold28, fontSize: { xs: "22px", sm: "28px" }, color: COLORS.neutral100 }}>
                            {title}
                        </Typography>
                        <Typography sx={{ ...ACTIVITY_TYPE.latoReg16, color: COLORS.neutral200 }}>{subtitle}</Typography>
                    </Box>

                    <StatTiles caption="RESULT" tiles={tiles}>
                        {bonus && (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "24px",
                                    width: "100%",
                                    px: "16px",
                                    py: "12px",
                                    borderRadius: "12px",
                                    border: "0.6px solid rgba(46,196,182,0.24)",
                                    borderBottomWidth: "2px",
                                    backgroundImage:
                                        "linear-gradient(180deg, rgba(46,196,182,0.08) 0%, rgba(34,145,135,0.08) 50%, rgba(22,94,87,0.08) 100%)",
                                }}
                            >
                                <Typography sx={{ ...TYPE.xsMed12, color: COLORS.neutral200, flex: 1, minWidth: 0 }}>{bonus.label}</Typography>
                                <Typography sx={{ ...TYPE.mediumMed16, color: COLORS.white, whiteSpace: "nowrap" }}>+{bonus.xp} XP</Typography>
                            </Box>
                        )}
                    </StatTiles>

                    {nextStep && (
                        <Typography sx={{ position: "relative", ...ACTIVITY_TYPE.latoReg16, color: COLORS.neutral200, textAlign: "center" }}>{nextStep}</Typography>
                    )}

                    <CardDivider />

                    <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: 200, maxWidth: "100%" }}>
                        <ActivityButton onClick={primary.onClick} width="100%">
                            {primary.label}
                        </ActivityButton>
                        <GhostButton onClick={secondary.onClick}>{secondary.label}</GhostButton>
                    </Box>
                </ActivityCard>

                <Box
                    aria-hidden
                    sx={{
                        position: "absolute",
                        top: badge.top,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: badge.width,
                        height: badge.height,
                        pointerEvents: "none",
                    }}
                >
                    <Box component="img" src={badge.glow} alt="" sx={{ position: "absolute", left: -8, top: -8, maxWidth: "none" }} />
                    <Image src={badge.src} alt="" width={badge.width} height={badge.height} style={{ position: "absolute", inset: 0 }} />
                </Box>
            </Box>
        </Box>
    );
}
