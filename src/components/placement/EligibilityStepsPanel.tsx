"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { gradientBorder } from "@/components/aish/tokens";
import { ELIGIBILITY_STEPS, StepStatus, WHY_THESE_STEPS, stepStatus } from "./placement-data";
import { Asset, PL, PTEXT } from "./placement-ui";

const STEP_TEXT: Record<StepStatus, { title: string; summary: string }> = {
    active: { title: PL.n75, summary: PL.n300 },
    completed: { title: PL.n200, summary: PL.n500 },
    pending: { title: PL.n200, summary: PL.n500 },
};

/** Blurred purple orbs bleeding into the panel's top-left and bottom-right corners. */
const PANEL_GLOWS = [
    { top: -873.17, left: -419.17 },
    { bottom: -569.32, left: 14.82 },
];

function StepIndicator({ status }: { status: StepStatus }) {
    if (status === "completed") return <Asset name="step-completed.svg" width={40} height={40} />;
    if (status === "pending") return <Asset name="step-pending.svg" width={40} height={40} />;
    return (
        <Box sx={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
            <Asset name="step-active-glow.svg" width={55.4} height={55.4} sx={{ position: "absolute", top: -7.7, left: -7.7 }} />
            <Asset name="step-active.svg" width={40} height={40} sx={{ position: "relative" }} />
        </Box>
    );
}

/** Vertical connector between steps — solid once the step above is cleared. */
function StepConnector({ solid }: { solid: boolean }) {
    return (
        <Box aria-hidden sx={{ position: "relative", height: "64.5px", flexShrink: 0 }}>
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: "35px",
                    width: "64.5px",
                    height: "1px",
                    transformOrigin: "0 0",
                    transform: "rotate(90deg)",
                    overflow: "hidden",
                    lineHeight: 0,
                }}
            >
                <Asset name={solid ? "step-line-solid.svg" : "step-line-dashed.svg"} width={65} height={1} />
            </Box>
        </Box>
    );
}

export default function EligibilityStepsPanel({ currentIndex }: { currentIndex: number }) {
    return (
        <Box
            component="aside"
            aria-label="Placement eligibility steps"
            sx={{
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                gap: "32px",
                width: { xs: "100%", lg: 445 },
                flexShrink: 0,
                p: { xs: "24px", sm: "32px" },
                borderRadius: "32px",
                bgcolor: PL.panelBg,
                backdropFilter: "blur(4px)",
                "&::before": gradientBorder(),
            }}
        >
            {PANEL_GLOWS.map((pos, i) => (
                <Asset key={i} name="panel-glow.svg" width={1199.49} height={1199.49} sx={{ position: "absolute", ...pos }} />
            ))}

            <Box component="ol" sx={{ position: "relative", display: "flex", flexDirection: "column", m: 0, p: 0, listStyle: "none", flex: { lg: 1 } }}>
                {ELIGIBILITY_STEPS.map((step, index) => {
                    const status = stepStatus(index, currentIndex);
                    return (
                        <React.Fragment key={step.id}>
                            {index > 0 && <StepConnector solid={index <= currentIndex} />}
                            <Box
                                component="li"
                                aria-current={status === "active" ? "step" : undefined}
                                sx={{ display: "flex", alignItems: "center", gap: "16px", px: "16px", py: "12px", borderRadius: "16px" }}
                            >
                                <StepIndicator status={status} />
                                <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ ...PTEXT.reg12, color: PL.n500, textTransform: "uppercase" }}>
                                        Step {index + 1}
                                    </Typography>
                                    <Typography sx={{ ...PTEXT.med18, color: STEP_TEXT[status].title }}>{step.title}</Typography>
                                    <Typography sx={{ ...PTEXT.med14, color: STEP_TEXT[status].summary }}>{step.summary}</Typography>
                                </Box>
                            </Box>
                        </React.Fragment>
                    );
                })}
            </Box>

            <Box
                sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    p: "23px",
                    borderRadius: "16px",
                    border: `1px solid ${PL.whyCardBorder}`,
                    backgroundImage: PL.whyCardBg,
                }}
            >
                <Asset name="why-shield.svg" width={58} height={71} sx={{ mx: "-1px" }} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 }}>
                    <Typography sx={{ ...PTEXT.semi18, color: PL.n200 }}>{WHY_THESE_STEPS.title}</Typography>
                    <Typography sx={{ ...PTEXT.med14, color: PL.n400 }}>{WHY_THESE_STEPS.body}</Typography>
                </Box>
            </Box>
        </Box>
    );
}
