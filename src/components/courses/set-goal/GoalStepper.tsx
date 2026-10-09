"use client";

import React from "react";
import Image from "next/image";
import { Box, ButtonBase, Typography } from "@mui/material";
import { COLORS, TYPE } from "../my-courses-theme";
import { SET_GOAL_ASSETS } from "./GoalUI";

type StepState = "done" | "active" | "upcoming";

const CONNECTOR_HALF = 56;
const DONE_FILL = "linear-gradient(0.71deg, #2EC4B6 4.5235%, #1B4C33 104.18%)";

function StepMarker({ state }: { state: StepState }) {
    if (state === "done") {
        return (
            <Box
                sx={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "99px",
                    border: "1.2px solid #2EC4B6",
                    backgroundImage: DONE_FILL,
                }}
            >
                <Image src={`${SET_GOAL_ASSETS}/icon-check-24.svg`} alt="" width={24} height={24} />
            </Box>
        );
    }
    if (state === "active") {
        // The active ring ships with its glow, so the 44px artwork overhangs the 32px slot by 6px each side.
        return (
            <Box sx={{ position: "relative", width: 32, height: 32 }}>
                <Box sx={{ position: "absolute", left: -6, top: -6, lineHeight: 0 }}>
                    <Image src={`${SET_GOAL_ASSETS}/step-active.svg`} alt="" width={44} height={44} style={{ maxWidth: "none" }} />
                </Box>
            </Box>
        );
    }
    return <Image src={`${SET_GOAL_ASSETS}/step-upcoming.svg`} alt="" width={32} height={32} />;
}

function Connector() {
    return (
        <Box aria-hidden sx={{ display: "flex", alignItems: "flex-start", width: CONNECTOR_HALF * 2, height: 32, flexShrink: 0, pt: "12px", lineHeight: 0 }}>
            <Image src={`${SET_GOAL_ASSETS}/step-connector.svg`} alt="" width={CONNECTOR_HALF} height={2} style={{ width: CONNECTOR_HALF, height: 2 }} />
            <Image
                src={`${SET_GOAL_ASSETS}/step-connector.svg`}
                alt=""
                width={CONNECTOR_HALF}
                height={2}
                style={{ width: CONNECTOR_HALF, height: 2, transform: "scaleX(-1)" }}
            />
        </Box>
    );
}

/** Horizontal wizard progress: completed steps are clickable so learners can revisit earlier choices. */
export default function GoalStepper({
    steps,
    current,
    onSelect,
}: {
    steps: { key: string; label: string }[];
    current: number;
    onSelect: (index: number) => void;
}) {
    return (
        <Box sx={{ width: "100%", overflowX: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
            <Box component="ol" aria-label="Goal setup progress" sx={{ display: "flex", alignItems: "flex-start", justifyContent: "center", m: 0, p: 0, listStyle: "none", minWidth: "max-content", mx: "auto" }}>
                {steps.map((step, index) => {
                    const state: StepState = index < current ? "done" : index === current ? "active" : "upcoming";
                    return (
                        <React.Fragment key={step.key}>
                            {index > 0 && <Connector />}
                            <Box component="li" aria-current={state === "active" ? "step" : undefined}>
                                <ButtonBase
                                    disabled={state !== "done"}
                                    onClick={() => onSelect(index)}
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "24px",
                                        borderRadius: "8px",
                                        "&.Mui-disabled": { color: "inherit" },
                                        "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "4px" },
                                    }}
                                >
                                    <StepMarker state={state} />
                                    <Typography
                                        component="span"
                                        sx={{
                                            ...(state === "active" ? TYPE.mediumSemibold16 : TYPE.mediumReg16),
                                            color: state === "active" ? COLORS.neutral75 : COLORS.neutral400,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        STEP {index + 1} : {step.label}
                                    </Typography>
                                </ButtonBase>
                            </Box>
                        </React.Fragment>
                    );
                })}
            </Box>
        </Box>
    );
}
