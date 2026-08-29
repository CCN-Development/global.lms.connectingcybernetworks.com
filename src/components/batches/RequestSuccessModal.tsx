"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import { FaCheck } from "react-icons/fa6";
import CCNModal from "@/components/modals/CCNModal";
import CCNButton from "@/components/buttons/CCNButton";

export interface RequestSuccessModalProps {
    open: boolean;
    onClose: () => void;
    batchTitle?: string;
    onGoToBatches?: () => void;
}

const Sparkle = ({ top, left, size }: { top: number | string; left: number | string; size: number }) => (
    <Box sx={{ position: "absolute", top, left, color: "#3BC9DB", fontSize: size, fontWeight: 300, lineHeight: 1 }}>+</Box>
);

export default function RequestSuccessModal({
    open,
    onClose,
    batchTitle,
    onGoToBatches,
}: RequestSuccessModalProps) {
    return (
        <CCNModal open={open} onClose={onClose} maxWidth={400}>
            <Box sx={{ p: "26px 22px 20px", textAlign: "center" }}>
                {/* Illustration */}
                <Box sx={{ position: "relative", width: 200, height: 150, mx: "auto", mb: 2 }}>
                    <Box sx={{
                        position: "absolute",
                        top: 6,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 140,
                        height: 140,
                        borderRadius: "50%",
                        border: "1px dashed #2E2E38",
                    }} />
                    <Sparkle top={16} left={166} size={14} />
                    <Sparkle top={112} left={30} size={16} />

                    <Box sx={{ position: "absolute", top: 44, left: "50%", transform: "translateX(-50%)", width: 108, height: 74 }}>
                        {/* Back panel */}
                        <Box sx={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, #C4A5FF 0%, #9F7AEA 100%)",
                        }} />
                        {/* Letter */}
                        <Box sx={{
                            position: "absolute",
                            top: -20,
                            left: 13,
                            width: 82,
                            height: 60,
                            bgcolor: "#F5F2FF",
                            borderRadius: "5px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                            <FaCheck size={26} color="#3DBE5B" />
                        </Box>
                        {/* Front flap */}
                        <Box sx={{
                            position: "absolute",
                            inset: 0,
                            background: "linear-gradient(135deg, #B392F0 0%, #8B5CF6 100%)",
                            clipPath: "polygon(0 0, 50% 58%, 100% 0, 100% 100%, 0 100%)",
                            borderRadius: "8px",
                        }} />
                    </Box>
                </Box>

                <Typography sx={{ fontSize: "1.15rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.01em", mb: 1 }}>
                    Request Sent Successfully
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "#9B9BA6", lineHeight: 1.65, mb: 1.5 }}>
                    {batchTitle
                        ? `We've shared your request for "${batchTitle}" with the coordinator.`
                        : "We've shared your batch request with the coordinator."}
                    <br />
                    Your seat will be confirmed after fee verification.
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "#9B9BA6", mb: 2.5 }}>
                    You&apos;ll be notified once it&apos;s approved.
                </Typography>

                <CCNButton onClick={onGoToBatches ?? onClose} className="w-full">
                    Go to My Batches
                </CCNButton>
            </Box>
        </CCNModal>
    );
}
