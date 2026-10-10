"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import { FONT_INTER, FONT_POPPINS, GradientButton } from "@/components/batches/batch-card-ui";
import { BatchModalShell, ModalSection } from "@/components/batches/BatchModalShell";

export interface RequestSuccessModalProps {
    open: boolean;
    onClose: () => void;
    onGoToBatches?: () => void;
}

/** Decorations positioned relative to the 200px envelope, as laid out in Figma. */
const DECORATIONS = [
    { src: "/batches/explore/success-ring-sm.svg", left: 0, top: 12.5, width: 97, height: 97 },
    { src: "/batches/explore/success-ring-lg.svg", left: 68, top: 61.5, width: 144, height: 144 },
    { src: "/batches/explore/success-plus-sm.svg", left: 193, top: 40.5, width: 6.748, height: 8.513 },
    { src: "/batches/explore/success-plus-lg.svg", left: 31, top: 177.5, width: 10.128, height: 12.778 },
];

export default function RequestSuccessModal({ open, onClose, onGoToBatches }: RequestSuccessModalProps) {
    return (
        <BatchModalShell open={open} onClose={onClose} gap={44} align="center">
            <Box sx={{ position: "relative", width: 200, height: 200, flexShrink: 0 }}>
                {DECORATIONS.map((item) => (
                    <Box
                        key={item.src}
                        component="img"
                        src={item.src}
                        alt=""
                        aria-hidden
                        sx={{ position: "absolute", left: item.left, top: item.top, width: item.width, height: item.height, maxWidth: "none" }}
                    />
                ))}
                <Box
                    component="img"
                    src="/batches/explore/success-envelope.png"
                    alt=""
                    aria-hidden
                    sx={{ position: "absolute", inset: 0, width: 200, height: 200, objectFit: "cover" }}
                />
            </Box>

            <ModalSection gap={16} sx={{ alignItems: "center", textAlign: "center" }}>
                <Typography sx={{ fontFamily: FONT_POPPINS, fontWeight: 700, fontSize: "28px", lineHeight: "42px", color: "#fff" }}>
                    Request Sent Successfully
                </Typography>
                <Typography component="div" sx={{ fontFamily: FONT_INTER, fontSize: "16px", lineHeight: "24px", color: "#d9d9d9" }}>
                    We’ve shared your batch request with the coordinator.
                    <br />
                    Your seat will be confirmed after fee verification.
                    <br />
                    <br />
                    You’ll be notified once it’s approved.
                </Typography>
            </ModalSection>

            <ModalSection sx={{ flexDirection: "row" }}>
                <GradientButton fullWidth onClick={onGoToBatches ?? onClose}>Go to My Batches</GradientButton>
            </ModalSection>
        </BatchModalShell>
    );
}
