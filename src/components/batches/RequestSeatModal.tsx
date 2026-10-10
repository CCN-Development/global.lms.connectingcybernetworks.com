"use client";
import React, { useEffect, useState } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { FONT_INTER, GradientButton } from "@/components/batches/batch-card-ui";
import { BatchModalShell, ModalHeading, ModalSection, ModalTextButton } from "@/components/batches/BatchModalShell";

export type BatchMode = "Online" | "Offline" | "Hybrid";

export interface RequestSeatModalProps {
    open: boolean;
    onClose: () => void;
    batchTitle: string;
    seatsLeft?: number;
    /** Mode pre-selected when the modal opens */
    defaultMode?: BatchMode;
    onSubmit?: (mode: BatchMode) => void;
}

const MODES: { value: BatchMode; description: string }[] = [
    { value: "Offline", description: "Attend classes at our institute campus" },
    { value: "Hybrid", description: "Join live instructor-led sessions from home or campus" },
    { value: "Online", description: "Join live instructor-led sessions from home" },
];

export default function RequestSeatModal({
    open, onClose, batchTitle, seatsLeft, defaultMode = "Offline", onSubmit,
}: RequestSeatModalProps) {
    const [selectedMode, setSelectedMode] = useState<BatchMode>(defaultMode);

    useEffect(() => {
        if (open) setSelectedMode(defaultMode);
    }, [open, defaultMode]);

    const handleSubmit = () => {
        onSubmit?.(selectedMode);
        onClose();
    };

    return (
        <BatchModalShell open={open} onClose={onClose} gap={44} glowLeft={-169.88}>
            <ModalSection gap={32}>
                <ModalHeading
                    title={`Request a seat for ${batchTitle} Batch`}
                    subtitle="Secure your seat by completing the details below."
                />

                <Box role="radiogroup" sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {MODES.map((mode) => {
                        const selected = mode.value === selectedMode;
                        return (
                            <ButtonBase
                                key={mode.value}
                                role="radio"
                                aria-checked={selected}
                                onClick={() => setSelectedMode(mode.value)}
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    gap: "16px",
                                    px: "19px",
                                    py: "15px",
                                    borderRadius: "8px",
                                    border: "1px solid rgba(217,217,217,0.12)",
                                    textAlign: "left",
                                    backgroundImage: selected
                                        ? "linear-gradient(159.83deg, rgba(140,36,255,0.24) 9.0161%, rgba(14,25,52,0.24) 89.867%)"
                                        : "none",
                                    boxShadow: selected ? "0 2px 25px rgba(255,255,255,0.12)" : "none",
                                    transition: "background-image 0.2s ease, box-shadow 0.2s ease",
                                    "&:hover": { borderColor: "rgba(217,217,217,0.24)" },
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: "12px", height: 24 }}>
                                    <Box
                                        component="img"
                                        src={selected ? "/batches/explore/radio-checked.svg" : "/batches/explore/radio-unchecked.svg"}
                                        alt=""
                                        sx={{ width: 24, height: 24, flexShrink: 0 }}
                                    />
                                    <Typography sx={{ fontFamily: FONT_INTER, fontWeight: 500, fontSize: "16px", lineHeight: "24px", color: "#f2f2f2" }}>
                                        {mode.value}
                                    </Typography>
                                    {selected && seatsLeft !== undefined && (
                                        <Box
                                            component="span"
                                            sx={{
                                                px: "8px",
                                                py: "2px",
                                                borderRadius: "99px",
                                                bgcolor: "#ffefdc",
                                                color: "#fb8600",
                                                fontFamily: FONT_INTER,
                                                fontWeight: 500,
                                                fontSize: "12px",
                                                lineHeight: "18px",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {seatsLeft} seats available
                                        </Box>
                                    )}
                                </Box>
                                <Typography sx={{ fontFamily: FONT_INTER, fontWeight: 500, fontSize: "14px", lineHeight: "21px", color: "#bfbfbf" }}>
                                    {mode.description}
                                </Typography>
                            </ButtonBase>
                        );
                    })}
                </Box>
            </ModalSection>

            <ModalSection gap={24}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", py: "8px" }}>
                    <GradientButton fullWidth onClick={handleSubmit}>Send Request</GradientButton>
                    <ModalTextButton onClick={onClose}>Cancel</ModalTextButton>
                </Box>
                <Typography sx={{ fontFamily: FONT_INTER, fontSize: "12px", lineHeight: "18px", color: "#ffad4f", textAlign: "center" }}>
                    Note : Your seat will be confirmed after the first installment payment.
                </Typography>
            </ModalSection>
        </BatchModalShell>
    );
}
