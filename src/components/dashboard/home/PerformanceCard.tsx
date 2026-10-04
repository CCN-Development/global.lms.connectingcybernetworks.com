"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
import { FONT_LATO } from "@/components/aish/tokens";
import { asset, Decor, GlassCard, lato, Line, poppins } from "./shared";
import { OVERALL_PERFORMANCE, PERFORMANCE_METRICS, type PerformanceMetric } from "./data";

interface PerformanceCardProps {
    overall?: number;
    metrics?: PerformanceMetric[];
}

/** Three concentric rings (outer → inner), each a track + gradient arc + end indicator. */
function PerformanceRings({ value }: { value: number }) {
    return (
        <Box sx={{ position: "relative", width: 144, height: 144, flexShrink: 0 }}>
            {/* Outer ring */}
            <Decor src={asset("perf-ring-outer-track.svg")} sx={{ inset: 0 }} />
            <Decor src={asset("perf-ring-outer-arc.png")} sx={{ top: 0, right: 0, bottom: 0, left: "17.33%" }} />
            <Decor
                src={asset("perf-indicator-outer.svg")}
                sx={{ left: 24.39, top: 121.65, width: 7.025, height: 7.025 }}
                bleed="-43.06% -55.37% -67.67% -55.37%"
            />

            {/* Middle ring */}
            <Box sx={{ position: "absolute", left: 14.1, top: 14.1, width: 116.811, height: 116.811 }}>
                <Decor src={asset("perf-ring-mid-track.svg")} sx={{ inset: 0 }} />
                <Decor src={asset("perf-ring-mid-arc.png")} sx={{ top: 0, right: 0, bottom: 0, left: "0.82%" }} />
            </Box>
            <Decor
                src={asset("perf-indicator-mid.svg")}
                sx={{ left: 14.52, top: 79.84, width: 6.968, height: 6.968 }}
                bleed="-43.42% -55.82% -68.23% -55.82%"
            />

            {/* Inner ring */}
            <Box sx={{ position: "absolute", left: 28.2, top: 28.2, width: 88.615, height: 88.615 }}>
                <Decor src={asset("perf-ring-inner-track.svg")} sx={{ inset: 0 }} />
                <Decor src={asset("perf-ring-inner-arc.png")} sx={{ top: 0, right: 0, bottom: "4.97%", left: "50%" }} />
                <Decor
                    src={asset("perf-indicator-inner.svg")}
                    sx={{ left: 60.06, top: 77.77, width: 7.025, height: 7.025 }}
                    bleed="-41.58% -53.45% -65.33% -53.45%"
                />
            </Box>

            <Typography
                sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: FONT_LATO,
                    fontWeight: 800,
                    fontSize: "21.264px",
                    color: "#FFFFFF",
                }}
            >
                {value}%
            </Typography>
        </Box>
    );
}

export default function PerformanceCard({
    overall = OVERALL_PERFORMANCE,
    metrics = PERFORMANCE_METRICS,
}: PerformanceCardProps) {
    return (
        <GlassCard angle={168}>
            <Typography component="h2" sx={poppins(20, 30)}>
                My Overall Performance
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: "center",
                    gap: "24px",
                    width: "100%",
                }}
            >
                <PerformanceRings value={overall} />

                <Box sx={{ flex: 1, minWidth: 0, width: { xs: "100%", sm: "auto" }, display: "flex", flexDirection: "column", gap: "16px" }}>
                    {metrics.map((metric, index) => (
                        <React.Fragment key={metric.label}>
                            {index > 0 && <Line src={asset("perf-divider.svg")} />}
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                                    <Image src={asset(metric.dot)} alt="" width={12} height={12} />
                                    <Typography noWrap sx={lato(14, 21, 500, "#D9D9D9")}>
                                        {metric.label}
                                    </Typography>
                                </Box>
                                <Typography sx={{ ...lato(16, 24, 500, "#F2F2F2"), whiteSpace: "nowrap" }}>{metric.value}</Typography>
                            </Box>
                        </React.Fragment>
                    ))}
                </Box>
            </Box>
        </GlassCard>
    );
}
