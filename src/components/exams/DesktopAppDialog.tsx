"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { MdOutlineDesktopWindows } from "react-icons/md";
import CCNModal from "@/components/modals/CCNModal";
import { PrimaryButton } from "@/components/courses/my-courses-ui";
import { COLORS, TYPE } from "@/components/courses/my-courses-theme";
import { DESKTOP_APP, examAsset, type RoundStage } from "./exam-data";
import { EXAM_COLORS, MetaChip, OutlineButton, chipSurfaceSx } from "./exam-ui";

export interface DesktopAppPrompt {
    examTitle: string;
    /** null when opened from the exam card (no specific round yet). */
    stage: RoundStage | null;
}

const STEPS = [
    `Install the ${DESKTOP_APP.name} app from the Microsoft Store (Windows).`,
    "Sign in with the same account you use on this portal.",
    "Open this exam and start the round — the app runs it in a secure, proctored window.",
];

/** Exams are only taken in the proctored desktop app; this explains how and links to the Store. */
export default function DesktopAppDialog({ prompt, onClose }: { prompt: DesktopAppPrompt | null; onClose: () => void }) {
    const stage = prompt?.stage ?? null;
    const resuming = Boolean(stage?.inProgressAttemptId);
    const title = resuming ? "Continue your attempt in the desktop app" : `Take this exam in ${DESKTOP_APP.name}`;

    return (
        <CCNModal open={Boolean(prompt)} onClose={onClose} maxWidth={520} showCloseButton>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "20px", p: { xs: "24px 20px", sm: "28px" } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "14px", pr: "24px" }}>
                    <Box
                        sx={{
                            ...chipSurfaceSx,
                            width: 48,
                            height: 48,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: COLORS.white,
                        }}
                    >
                        <MdOutlineDesktopWindows size={24} style={{ position: "relative" }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography component="h2" sx={{ ...TYPE.headingSemibold20, color: COLORS.white }}>
                            {title}
                        </Typography>
                        <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral300 }} noWrap>
                            {stage ? `${prompt?.examTitle} · ${stage.title}` : prompt?.examTitle}
                        </Typography>
                    </Box>
                </Box>

                {stage && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                        {stage.questions > 0 && <MetaChip icon="icon-help-circle.svg" value={stage.questions} unit={stage.questions === 1 ? stage.questionUnit.slice(0, -1) : stage.questionUnit} />}
                        {stage.durationMins !== null && <MetaChip icon="icon-clock.svg" value={stage.durationMins} unit="mins" />}
                        {stage.attemptsLeft !== null && !resuming && (
                            <MetaChip icon="icon-hash.svg" value={stage.attemptsLeft} unit={stage.attemptsLeft === 1 ? "attempt left" : "attempts left"} unitWeight={400} />
                        )}
                    </Box>
                )}

                {resuming && (
                    <Typography sx={{ ...TYPE.smallMed14, color: "#FB8600" }}>
                        You have an attempt in progress. Its timer keeps running — reopen it in the app to continue where you left off.
                    </Typography>
                )}

                <Box component="ol" sx={{ m: 0, p: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
                    {STEPS.map((step, index) => (
                        <Box component="li" key={step} sx={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                            <Box
                                sx={{
                                    width: 24,
                                    height: 24,
                                    flexShrink: 0,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: "rgba(80,138,242,0.18)",
                                    border: `1px solid ${EXAM_COLORS.panelStroke}`,
                                    ...TYPE.xsMed12,
                                    color: COLORS.white,
                                }}
                            >
                                {index + 1}
                            </Box>
                            <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral100 }}>{step}</Typography>
                        </Box>
                    ))}
                </Box>

                <Typography sx={{ ...TYPE.xsReg12, color: COLORS.neutral300 }}>
                    Your attempts, results and certificate appear here on the portal automatically once you finish in the app.
                </Typography>

                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: "12px" }}>
                    <PrimaryButton
                        icon={examAsset("icon-download-alt.svg")}
                        onClick={() => window.open(DESKTOP_APP.storeUrl, "_blank", "noopener,noreferrer")}
                        sx={{ flex: 1 }}
                    >
                        Get it from Microsoft Store
                    </PrimaryButton>
                    <OutlineButton onClick={onClose} sx={{ flex: { sm: "0 0 auto" } }}>
                        Close
                    </OutlineButton>
                </Box>
            </Box>
        </CCNModal>
    );
}
