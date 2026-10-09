"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Box, Dialog, Typography } from "@mui/material";
import { LmsButton } from "@/components/community/community-ui";
import { ELIGIBILITY_STEPS, EligibilityStep, LOADER_COPY, placementAsset } from "./placement-data";
import { Asset, PL, PTEXT } from "./placement-ui";

// ─── Shell ─────────────────────────────────────────────────────────────────
function PlacementModal({
    open,
    labelledBy,
    describedBy,
    padding = "32px",
    children,
}: {
    open: boolean;
    labelledBy: string;
    describedBy?: string;
    padding?: string;
    children: React.ReactNode;
}) {
    return (
        <Dialog
            open={open}
            aria-labelledby={labelledBy}
            aria-describedby={describedBy}
            slotProps={{
                backdrop: { sx: { bgcolor: PL.modalBackdrop, backdropFilter: "blur(12px)" } },
                paper: {
                    sx: {
                        position: "relative",
                        width: 604,
                        maxWidth: "calc(100% - 32px)",
                        m: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: "44px",
                        p: { xs: "24px", sm: padding },
                        overflow: "hidden",
                        bgcolor: "#000",
                        backgroundImage: "none",
                        backdropFilter: "blur(50px)",
                        borderRadius: "24px",
                        borderTop: `1.5px solid ${PL.modalBorder}`,
                        borderRight: `1.5px solid ${PL.modalBorder}`,
                        boxShadow: "none",
                        color: PL.white,
                    },
                },
            }}
        >
            {/* Diagonal blue light beam from the top-left corner */}
            <Box
                aria-hidden
                sx={{
                    position: "absolute",
                    left: -139.88,
                    top: -282.5,
                    width: 977.882,
                    height: 1140.277,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                }}
            >
                <Box sx={{ position: "relative", flexShrink: 0, width: 69.794, height: 1433.31, transform: "rotate(-40.17deg)" }}>
                    <Asset name="modal-beam.svg" width={269.794} height={1633.31} sx={{ position: "absolute", left: -100, top: -100 }} />
                </Box>
            </Box>
            {children}
        </Dialog>
    );
}

// ─── Step completed / placement ready ──────────────────────────────────────
function StepCompletedContent({
    step,
    nextStep,
    onAction,
}: {
    step: EligibilityStep;
    nextStep?: EligibilityStep;
    onAction: () => void;
}) {
    const { completion } = step;
    return (
        <>
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", width: "100%" }}>
                <Image
                    src={placementAsset("envelope-check.png")}
                    alt=""
                    width={200}
                    height={200}
                    sizes="200px"
                    priority
                    style={{ flexShrink: 0 }}
                />
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: "100%", textAlign: "center" }}>
                    <Typography
                        id="placement-modal-title"
                        component="h2"
                        sx={{ ...PTEXT.poppinsBold28, fontSize: { xs: "24px", sm: "28px" }, color: PL.white, width: "100%" }}
                    >
                        {completion.title}
                    </Typography>
                    <Box id="placement-modal-body" sx={{ ...PTEXT.interReg16, color: PL.n100, width: "100%" }}>
                        {completion.lines.map((line, i) => (
                            <Box component="p" key={i} sx={{ m: 0, minHeight: "24px" }}>
                                {line}
                            </Box>
                        ))}
                    </Box>
                    {nextStep && completion.nextStepHint && (
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                                width: "100%",
                                // Figma strokes sit inside the frame; trim padding so the 1px/3px border keeps its 79px height.
                                p: "15px 15px 13px",
                                textAlign: "left",
                                opacity: 0.8,
                                borderRadius: "12px",
                                bgcolor: PL.nextStepBg,
                                border: `1px solid ${PL.nextStepBorder}`,
                                borderBottomWidth: "3px",
                            }}
                        >
                            <Typography sx={{ ...PTEXT.med12, color: PL.n300, textTransform: "uppercase" }}>
                                Next Step : {nextStep.title}
                            </Typography>
                            <Typography sx={{ ...PTEXT.med14, color: PL.white }}>{completion.nextStepHint}</Typography>
                        </Box>
                    )}
                </Box>
            </Box>
            <LmsButton onClick={onAction} sx={{ width: "100%" }}>
                {completion.actionLabel}
            </LmsButton>
        </>
    );
}

// ─── Loader ────────────────────────────────────────────────────────────────
function ShortlistingLoaderContent() {
    return (
        <Box
            role="status"
            aria-live="polite"
            sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", width: "100%" }}
        >
            <Image
                src={placementAsset("scanning-document.png")}
                alt=""
                width={225}
                height={225}
                sizes="225px"
                priority
                style={{ objectFit: "cover", flexShrink: 0 }}
            />
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "100%", textAlign: "center" }}>
                <Typography
                    id="placement-modal-title"
                    component="h2"
                    sx={{ ...PTEXT.poppinsBold28, fontSize: { xs: "24px", sm: "28px" }, color: PL.white }}
                >
                    {LOADER_COPY.title}
                </Typography>
                <Typography id="placement-modal-body" sx={{ ...PTEXT.interReg16, color: PL.n100 }}>
                    {LOADER_COPY.subtitle}
                </Typography>
            </Box>
        </Box>
    );
}

// ─── Flow modal ────────────────────────────────────────────────────────────
/** Step index whose completion is being celebrated, `"loader"` while shortlisting, or `null` when closed. */
export type PlacementModalView = number | "loader" | null;

/**
 * One dialog for the whole flow so the backdrop stays put when moving from
 * "placement ready" to the loader; the last view is kept during the exit fade.
 */
export function PlacementFlowModal({ view, onAcknowledge }: { view: PlacementModalView; onAcknowledge: (stepIndex: number) => void }) {
    const [shown, setShown] = useState<PlacementModalView>(view);
    if (view !== null && view !== shown) setShown(view);

    return (
        <PlacementModal
            open={view !== null}
            labelledBy="placement-modal-title"
            describedBy="placement-modal-body"
            padding={shown === "loader" ? "32px 32px 44px" : "32px"}
        >
            {shown === "loader" ? (
                <ShortlistingLoaderContent />
            ) : shown !== null ? (
                <StepCompletedContent
                    step={ELIGIBILITY_STEPS[shown]}
                    nextStep={ELIGIBILITY_STEPS[shown + 1]}
                    onAction={() => onAcknowledge(shown)}
                />
            ) : null}
        </PlacementModal>
    );
}
