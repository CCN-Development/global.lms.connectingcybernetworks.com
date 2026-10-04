"use client";

import React from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import Image from "next/image";
import { asset, Decor, GlassCard, lato, Line, poppins, RotatedDecor } from "./shared";
import { TODAY_SCHEDULE, type ScheduleItem } from "./data";

const JOIN_GRADIENT =
    "linear-gradient(90deg, #0027AC 0%, #0B22AC 12.5%, #161DAC 25%, #2C14AC 43.572%, #4608AC 65.007%, #4F04AC 82.544%, #5900AC 100%)";

interface TodayScheduleCardProps {
    schedule?: ScheduleItem;
    onJoin?: () => void;
}

const metaText = lato(16, 24, 500, "#D9D9D9");

function MetaDot() {
    return <Image src={asset("sched-dot.svg")} alt="" width={6} height={6} style={{ flexShrink: 0 }} />;
}

export default function TodayScheduleCard({ schedule = TODAY_SCHEDULE, onJoin }: TodayScheduleCardProps) {
    return (
        <GlassCard angle={174.35} sx={{ alignItems: "center" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                        <Typography sx={lato(14, 21, 400, "#D9D9D9")}>TODAY&apos;S SCHEDULE</Typography>
                        {schedule.isLive && (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    px: "8px",
                                    py: "2px",
                                    borderRadius: "6px",
                                    bgcolor: "#F6D4D8",
                                    flexShrink: 0,
                                }}
                            >
                                <Image src={asset("sched-live-dot.svg")} alt="" width={6} height={6} />
                                <Typography sx={lato(14, 21, 600, "#D1293D")}>LIVE</Typography>
                            </Box>
                        )}
                    </Box>
                    <Typography component="h2" sx={{ ...poppins(24, 36), fontSize: { xs: "20px", sm: "24px" }, lineHeight: { xs: "30px", sm: "36px" } }}>
                        {schedule.course}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", columnGap: "12px", rowGap: "4px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Image src={asset("icon-clock.svg")} alt="" width={20} height={20} />
                        <Typography sx={{ ...metaText, whiteSpace: "nowrap" }}>{schedule.time}</Typography>
                    </Box>
                    <MetaDot />
                    <Typography sx={metaText}>{schedule.mode}</Typography>
                    <MetaDot />
                    <Typography sx={metaText}>{schedule.classLabel}</Typography>
                </Box>
            </Box>

            <Line src={asset("sched-divider.svg")} />

            <ButtonBase
                onClick={onJoin}
                sx={{
                    position: "relative",
                    overflow: "hidden",
                    width: "100%",
                    height: 52,
                    p: "16px",
                    borderRadius: "12px",
                    backgroundImage: JOIN_GRADIENT,
                    boxShadow: "0 0 8px rgba(255,255,255,0.12)",
                    transition: "filter 0.2s ease",
                    "&:hover": { filter: "brightness(1.15)" },
                }}
            >
                <Decor src={asset("join-glow-2055.svg")} sx={{ left: 121, top: 27, width: 121, height: 9 }} bleed="-266.67% -19.83%" />
                <Typography sx={{ position: "relative", ...lato(16, 24, 600, "#FFFFFF") }}>Join Now</Typography>
                <Decor src={asset("join-glow-2052.svg")} sx={{ left: 156, top: 53, width: 204, height: 12 }} bleed="-416.67% -24.51%" />
                <Decor src={asset("join-glow-2053.svg")} sx={{ left: -182, top: 51.5, width: 380, height: 12 }} bleed="-200% -6.32%" />
                <Decor src={asset("join-glow-2054.svg")} sx={{ left: 242, top: -5, width: 137, height: 9 }} bleed="-266.67% -17.52%" />
            </ButtonBase>

            <RotatedDecor
                src={asset("sched-side-glow-right.svg")}
                sx={{ right: 54, top: 156, width: 6, height: 248 }}
                length={248}
                thickness={6}
                rotate={90}
                bleed="-400% -9.68%"
            />
            <RotatedDecor
                src={asset("sched-side-glow-left.svg")}
                sx={{ left: 19, top: 90, width: 12, height: 380 }}
                length={380}
                thickness={12}
                rotate={90}
                bleed="-200% -6.32%"
            />
        </GlassCard>
    );
}
