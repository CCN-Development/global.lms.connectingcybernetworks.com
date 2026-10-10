"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import StudentLayout from "@/layouts/StudentLayout";
import { BackButton } from "@/components/courses/my-courses-ui";
import { COLORS, TYPE } from "@/components/courses/my-courses-theme";
import { examAsset } from "./exam-data";
import { EXAM_COLORS, GlowLayer, strokeLayer } from "./exam-ui";

type Decor = { left: number; top: number };
type DecorVariant = "timeline" | "certificate";

/** Blue streak positions per frame, split by whether Figma stacks them under or over the panel content. */
const STREAKS: Record<DecorVariant, { under: Decor[]; over: Decor[] }> = {
    timeline: {
        under: [
            { left: -32.88, top: -259.5 },
            { left: -52.88, top: -476.5 },
        ],
        over: [],
    },
    certificate: {
        under: [{ left: 438.12, top: -508.5 }],
        over: [{ left: 575.12, top: -357.5 }],
    },
};

function Streak({ at }: { at: Decor }) {
    return (
        <GlowLayer
            src={examAsset("panel-streak.svg")}
            {...at}
            width={977.882}
            height={1140.277}
            innerWidth={69.794}
            innerHeight={1433.31}
            transform="rotate(-139.83deg) scaleY(-1)"
            inset="-6.98% -143.28%"
        />
    );
}

function PurpleGlows() {
    return (
        <>
            <GlowLayer
                src={examAsset("panel-glow-lg.svg")}
                left={-14}
                top={737.5}
                width={357}
                height={357}
                innerWidth={357}
                innerHeight={357}
                transform="rotate(180deg) scaleY(-1)"
                inset="-224.09%"
            />
            <GlowLayer
                src={examAsset("panel-glow-sm.svg")}
                left={-53}
                top={-1.5}
                width={242}
                height={242}
                innerWidth={242}
                innerHeight={242}
                transform="rotate(180deg) scaleY(-1)"
                inset="-330.58%"
            />
        </>
    );
}

/**
 * Figma lays the panel out mirrored (rotate 180° + flip Y), so its glows are positioned in a horizontally
 * flipped space. Reproducing that flip keeps every layer exactly where the design puts it.
 * On the certificate frame one streak and the purple glows sit above the content, tinting the certificate.
 */
function PanelDecor({ variant, layer }: { variant: DecorVariant; layer: "under" | "over" }) {
    const streaks = STREAKS[variant][layer];
    const glows = (variant === "certificate") === (layer === "over");
    if (!streaks.length && !glows) return null;

    return (
        <Box
            aria-hidden
            sx={{ position: "absolute", inset: 0, zIndex: layer === "over" ? 1 : 0, overflow: "hidden", pointerEvents: "none", transform: "scaleX(-1)" }}
        >
            {streaks.map((at) => (
                <Streak key={`${at.left}:${at.top}`} at={at} />
            ))}
            {glows && <PurpleGlows />}
        </Box>
    );
}

/**
 * Collapsed-rail page with a back button + course title, above the black content panel
 * (Figma "Frame 1707478734": 24px top corners, 1.5px #508AF2 stroke fading out from the top-right).
 */
export default function ExamDetailShell({
    title,
    onBack,
    decor = "timeline",
    children,
}: {
    title: string;
    onBack: () => void;
    decor?: DecorVariant;
    children: React.ReactNode;
}) {
    return (
        <StudentLayout
            fullBleed
            lockCollapsed
            header={
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: "12px", sm: "16px" }, minWidth: 0 }}>
                    <BackButton label="Back to exams" onClick={onBack} />
                    <Typography component="h1" noWrap sx={{ ...TYPE.headingMed20, fontSize: { xs: "18px", sm: "20px" }, color: COLORS.white, minWidth: 0 }}>
                        {title}
                    </Typography>
                </Box>
            }
        >
            <Box
                sx={{
                    position: "relative",
                    flex: 1,
                    minHeight: 0,
                    mt: { xs: "8px", md: "24px" },
                    overflow: "hidden",
                    bgcolor: "#000",
                    borderRadius: { xs: "16px 16px 0 0", md: "24px 24px 0 0" },
                    // Stroke drawn on the visible top + left edges, bright along the top and fading towards the top-left.
                    "&::after": strokeLayer(
                        `linear-gradient(205.3deg, ${EXAM_COLORS.panelStroke} 388px, rgba(80,138,242,0) 641px)`,
                        "1.5px 0 0 1.5px",
                    ),
                }}
            >
                <PanelDecor variant={decor} layer="under" />
                <Box
                    sx={{
                        position: "relative",
                        height: "100%",
                        overflowY: "auto",
                        overflowX: "hidden",
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": { display: "none" },
                        p: { xs: "16px", sm: "24px", md: "32px" },
                    }}
                >
                    {children}
                </Box>
                <PanelDecor variant={decor} layer="over" />
            </Box>
        </StudentLayout>
    );
}
