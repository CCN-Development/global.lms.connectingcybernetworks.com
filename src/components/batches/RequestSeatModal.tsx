"use client";
import React, { useState } from "react";
import { Box, Typography, Divider } from "@mui/material";
import CCNModal from "@/components/modals/CCNModal";
import CCNButton from "@/components/buttons/CCNButton";

// ── Types ─────────────────────────────────────────────────────────────────────

export type BatchMode = "Online" | "Offline" | "Hybrid";

export interface RequestSeatModalProps {
    open: boolean;
    onClose: () => void;
    batchTitle: string;
    /** Seats left for the primary available mode */
    seatsLeft?: number;
    /** Called with the selected mode when the user submits */
    onSubmit?: (mode: BatchMode) => void;
}

// ── Mode options ──────────────────────────────────────────────────────────────

const MODES: { value: BatchMode; label: string; description: string }[] = [
    { value: "Offline", label: "Offline", description: "Attend classes at our institute campus" },
    { value: "Hybrid", label: "Hybrid", description: "Join live instructor-led sessions from home or campus" },
    { value: "Online", label: "Online", description: "Join live instructor-led sessions from home" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function RequestSeatModal({
    open,
    onClose,
    batchTitle,
    seatsLeft,
    onSubmit,
}: RequestSeatModalProps) {
    const [selectedMode, setSelectedMode] = useState<BatchMode>("Offline");

    const handleSubmit = () => {
        onSubmit?.(selectedMode);
        onClose();
    };

    return (
        <CCNModal open={open} onClose={onClose} maxWidth={460}>
            <Box sx={{ p: "22px 20px 18px" }}>
                {/* Header */}
                <Typography
                    sx={{
                        fontSize: "1.05rem",
                        fontWeight: 800,
                        color: "#fff",
                        lineHeight: 1.3,
                        letterSpacing: "-0.01em",
                        mb: 0.6,
                    }}
                >
                    Request a seat for{" "}
                    <Box component="span" sx={{ color: "#fff" }}>
                        {batchTitle}
                    </Box>
                </Typography>
                <Typography
                    sx={{
                        fontSize: "0.75rem",
                        color: "rgba(255,255,255,0.45)",
                        fontWeight: 400,
                        mb: 2,
                    }}
                >
                    Secure your seat by completing the details below.
                </Typography>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 2 }} />

                {/* Mode selector */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2.5 }}>
                    {MODES.map((m) => {
                        const isSelected = selectedMode === m.value;
                        return (
                            <Box
                                key={m.value}
                                onClick={() => setSelectedMode(m.value)}
                                sx={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 1.25,
                                    p: "10px 12px",
                                    borderRadius: "10px",
                                    border: isSelected
                                        ? "1px solid rgba(124,58,237,0.45)"
                                        : "1px solid rgba(255,255,255,0.08)",
                                    background: isSelected
                                        ? "linear-gradient(135deg, rgba(67,32,122,0.55) 0%, rgba(30,40,100,0.45) 100%)"
                                        : "transparent",
                                    cursor: "pointer",
                                    transition: "all 0.18s ease",
                                    "&:hover": {
                                        border: "1px solid rgba(124,58,237,0.3)",
                                        background: "rgba(255,255,255,0.03)",
                                    },
                                }}
                            >
                                {/* Custom radio circle */}
                                <Box
                                    sx={{
                                        width: 18,
                                        height: 18,
                                        borderRadius: "50%",
                                        border: isSelected
                                            ? "2px solid #7c3aed"
                                            : "2px solid rgba(255,255,255,0.25)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                        mt: "1px",
                                        transition: "border-color 0.18s ease",
                                    }}
                                >
                                    {isSelected && (
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: "50%",
                                                bgcolor: "#7c3aed",
                                            }}
                                        />
                                    )}
                                </Box>

                                {/* Label + description */}
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.3 }}>
                                        <Typography
                                            sx={{
                                                fontSize: "0.82rem",
                                                fontWeight: 700,
                                                color: isSelected ? "#fff" : "rgba(255,255,255,0.7)",
                                                lineHeight: 1,
                                            }}
                                        >
                                            {m.label}
                                        </Typography>

                                        {/* Seats chip — only on first available mode when seats provided */}
                                        {m.value === "Offline" && seatsLeft !== undefined && (
                                            <Box
                                                sx={{
                                                    px: 0.75,
                                                    py: "2px",
                                                    borderRadius: "5px",
                                                    bgcolor: "rgba(249,115,22,0.15)",
                                                    border: "1px solid rgba(249,115,22,0.3)",
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontSize: "0.6rem",
                                                        fontWeight: 600,
                                                        color: "#f97316",
                                                        lineHeight: 1,
                                                    }}
                                                >
                                                    {seatsLeft} seats available
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                    <Typography
                                        sx={{
                                            fontSize: "0.72rem",
                                            color: "rgba(255,255,255,0.38)",
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {m.description}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>

                {/* Actions */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <CCNButton onClick={handleSubmit} className="w-full">
                        Send Request
                    </CCNButton>

                    <Typography
                        onClick={onClose}
                        sx={{
                            fontSize: "0.78rem",
                            color: "rgba(255,255,255,0.45)",
                            textAlign: "center",
                            cursor: "pointer",
                            py: 0.5,
                            "&:hover": { color: "rgba(255,255,255,0.75)" },
                        }}
                    >
                        Cancel
                    </Typography>
                </Box>

                {/* Note */}
                <Typography
                    sx={{
                        fontSize: "0.68rem",
                        color: "#f97316",
                        textAlign: "center",
                        mt: 1.5,
                        lineHeight: 1.5,
                    }}
                >
                    Note : Your seat will be confirmed after the first installment payment.
                </Typography>
            </Box>
        </CCNModal>
    );
}
