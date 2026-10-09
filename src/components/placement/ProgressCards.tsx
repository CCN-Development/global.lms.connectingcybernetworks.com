"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { gradientBorder } from "@/components/aish/tokens";
import {
    FeeProgress,
    Milestone,
    MilestoneStatus,
    TrackProgress,
    formatAmount,
    placementAsset,
    remainingMilestones,
} from "./placement-data";
import { Asset, PL, PTEXT } from "./placement-ui";

// ─── "xx% completed" tab ───────────────────────────────────────────────────
function ProgressTab({ percent }: { percent: number }) {
    return (
        <Box
            sx={{
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
                px: "12px",
                py: "8px",
                borderRadius: "16px 16px 0 0",
                backgroundImage: PL.tabBg,
            }}
        >
            {/* noise texture */}
            <Box
                aria-hidden
                sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url("${placementAsset("tab-noise-dots.png")}")`,
                    backgroundSize: "834px 834px",
                    mixBlendMode: "overlay",
                    opacity: 0.8,
                    pointerEvents: "none",
                }}
            />
            {/* light streaks catching the top-right corner */}
            {[
                { left: 115, top: -12, from: "#2388FF", blur: 2.6, opacity: 0.26 },
                { left: 120, top: -12, from: "#8C24FF", blur: 4.6, opacity: 0.7 },
            ].map((s) => (
                <Box
                    key={s.left}
                    aria-hidden
                    sx={{
                        position: "absolute",
                        left: s.left,
                        top: s.top,
                        width: 8.19,
                        height: 58,
                        transform: "rotate(45deg)",
                        transformOrigin: "0 0",
                        backgroundImage: `linear-gradient(180deg, ${s.from} 0%, transparent 85%)`,
                        filter: `blur(${s.blur}px)`,
                        opacity: s.opacity,
                        mixBlendMode: "plus-lighter",
                        pointerEvents: "none",
                    }}
                />
            ))}
            <Typography sx={{ position: "relative", ...PTEXT.med14, color: PL.n75, whiteSpace: "nowrap" }}>
                {percent}% completed
            </Typography>
        </Box>
    );
}

/** Glassy card body that hangs under the tab (square top-left corner). */
function CardBody({ children, sx }: { children: React.ReactNode; sx?: object }) {
    return (
        <Box
            sx={{
                position: "relative",
                display: "flex",
                p: "16px",
                borderRadius: "0 16px 16px 16px",
                backgroundImage: PL.cardBg,
                backdropFilter: "blur(12px)",
                boxShadow: PL.cardInnerGlow,
                "&::before": gradientBorder(),
                ...sx,
            }}
        >
            {children}
        </Box>
    );
}

function CardShell({ percent, hint, children }: { percent: number; hint?: React.ReactNode; children: React.ReactNode }) {
    return (
        <Box component="article" sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <ProgressTab percent={percent} />
                {hint}
            </Box>
            {children}
        </Box>
    );
}

// ─── Milestones (Batch → Technical Viva / HR Round → Exam) ─────────────────
const MILESTONE_ICON: Record<MilestoneStatus, string> = {
    completed: "milestone-completed.svg",
    active: "milestone-active.svg",
    locked: "milestone-locked.svg",
};

function MilestoneNode({ milestone }: { milestone: Milestone }) {
    const active = milestone.status === "active";
    return (
        <Box
            sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5.36px", p: "5.36px", width: 86, flexShrink: 0 }}
            aria-label={`${milestone.label}: ${milestone.status}`}
        >
            <Box sx={{ position: "relative", width: 40, height: 40 }}>
                {active && (
                    <Asset name="milestone-active-glow.svg" width={54.13} height={57.99} sx={{ position: "absolute", left: -7.07, top: -8.99 }} />
                )}
                <Asset name={MILESTONE_ICON[milestone.status]} width={40} height={40} sx={{ position: "relative" }} />
            </Box>
            <Typography sx={{ ...PTEXT.med12, color: active ? PL.white : PL.n500, textAlign: "center", whiteSpace: "nowrap" }}>
                {milestone.label}
            </Typography>
        </Box>
    );
}

function MilestoneTrack({ milestones }: { milestones: Milestone[] }) {
    return (
        <Box sx={{ display: "flex", alignItems: "flex-start", width: { xs: "100%", md: 337 }, flexShrink: 0 }}>
            {milestones.map((milestone, index) => (
                <React.Fragment key={milestone.label}>
                    {index > 0 && (
                        <Box aria-hidden sx={{ flex: 1, minWidth: 16, pt: "24px" }}>
                            <Box
                                sx={{
                                    height: "1px",
                                    backgroundImage: `url("${placementAsset("milestone-connector.svg")}")`,
                                    backgroundSize: "100% 100%",
                                }}
                            />
                        </Box>
                    )}
                    <MilestoneNode milestone={milestone} />
                </React.Fragment>
            ))}
        </Box>
    );
}

// ─── Course / Soft Skill progress card ─────────────────────────────────────
export function TrackProgressCard({ track }: { track: TrackProgress }) {
    const remaining = remainingMilestones(track);
    return (
        <CardShell
            percent={track.progress}
            hint={
                remaining > 0 && (
                    <Typography
                        sx={{
                            ...PTEXT.med14,
                            backgroundImage: PL.warmText,
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            color: "transparent",
                            textAlign: "right",
                        }}
                    >
                        {remaining} more steps to complete this course
                    </Typography>
                )
            }
        >
            <CardBody sx={{ flexDirection: { xs: "column", md: "row" }, alignItems: { xs: "stretch", md: "center" }, gap: { xs: "20px", md: "32px" } }}>
                <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: 0 }}>
                    <Typography component="h3" sx={{ ...PTEXT.semi18, color: PL.white }}>
                        {track.title}
                    </Typography>
                    <Typography sx={{ ...PTEXT.med12, color: PL.n400 }}>Latest Update : {track.latestUpdate}</Typography>
                </Box>
                <MilestoneTrack milestones={track.milestones} />
            </CardBody>
        </CardShell>
    );
}

// ─── Fee progress card ─────────────────────────────────────────────────────
export function FeeProgressCard({ fees }: { fees: FeeProgress }) {
    const paid = Math.min(100, Math.max(0, fees.paidPercent));
    return (
        <CardShell percent={paid}>
            <CardBody sx={{ flexDirection: "column", gap: "8px" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <Typography component="h3" sx={{ ...PTEXT.semi18, color: PL.white }}>
                        {fees.title}
                    </Typography>
                    <Typography sx={{ ...PTEXT.med14, color: PL.n75, whiteSpace: "nowrap" }}>
                        {formatAmount(fees.pendingAmount)} pending
                    </Typography>
                </Box>
                <Box
                    role="progressbar"
                    aria-label="Course fees paid"
                    aria-valuenow={paid}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    sx={{
                        position: "relative",
                        display: "flex",
                        height: 14,
                        overflow: "hidden",
                        borderRadius: "32px",
                        border: `1px solid ${PL.n600}`,
                        bgcolor: "rgba(255,255,255,0.02)",
                        backdropFilter: "blur(4px)",
                    }}
                >
                    <Box sx={{ width: `${paid}%`, height: "100%", borderRadius: "16px", backgroundImage: PL.feeFill }} />
                </Box>
                <Typography sx={{ ...PTEXT.med12, color: PL.n400 }}>Latest Update : {fees.latestUpdate}</Typography>
            </CardBody>
        </CardShell>
    );
}
