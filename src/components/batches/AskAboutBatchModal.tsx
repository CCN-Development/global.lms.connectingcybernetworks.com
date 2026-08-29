"use client";
import React, { useState } from "react";
import {
    Box,
    Typography,
    Divider,
    Select,
    MenuItem,
    TextField,
    SelectChangeEvent,
} from "@mui/material";
import { MdExpandMore } from "react-icons/md";
import CCNModal from "@/components/modals/CCNModal";
import CCNButton from "@/components/buttons/CCNButton";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AskAboutBatchModalProps {
    open: boolean;
    onClose: () => void;
    batchTitle?: string;
    onSubmit?: (queryType: string, message: string) => void;
}

const QUERY_TYPES = [
    "Schedule / Timing",
    "Seat Availability",
    "Batch Details",
    "Fee & Payment",
    "Trainer Info",
    "Other",
];

// ── Shared input styles ───────────────────────────────────────────────────────

const INPUT_SX = {
    "& .MuiOutlinedInput-root": {
        bgcolor: "#0D0D0D",
        borderRadius: "10px",
        fontSize: "0.8rem",
        color: "#fff",
        "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
        "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
        "&.Mui-focused fieldset": { borderColor: "#7c3aed", borderWidth: "1px" },
    },
    "& .MuiSelect-icon": { color: "rgba(255,255,255,0.45)" },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AskAboutBatchModal({
    open,
    onClose,
    batchTitle,
    onSubmit,
}: AskAboutBatchModalProps) {
    const [queryType, setQueryType] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = () => {
        if (!queryType || !message.trim()) return;
        onSubmit?.(queryType, message.trim());
        setQueryType("");
        setMessage("");
        onClose();
    };

    const handleClose = () => {
        setQueryType("");
        setMessage("");
        onClose();
    };

    return (
        <CCNModal open={open} onClose={handleClose} maxWidth={460}>
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
                    Ask About This Batch
                </Typography>
                <Typography
                    sx={{
                        fontSize: "0.75rem",
                        color: "rgba(255,255,255,0.45)",
                        fontWeight: 400,
                        mb: 2,
                    }}
                >
                    {batchTitle
                        ? `Have a question about "${batchTitle}"? We're here to help.`
                        : "Have questions about the schedule, timing, or batch details? We're here to help."}
                </Typography>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 2 }} />

                {/* Query type select */}
                <Select
                    value={queryType}
                    onChange={(e: SelectChangeEvent) => setQueryType(e.target.value)}
                    displayEmpty
                    fullWidth
                    IconComponent={MdExpandMore}
                    renderValue={(val) =>
                        val ? (
                            <Typography sx={{ fontSize: "0.8rem", color: "#fff" }}>{val}</Typography>
                        ) : (
                            <Typography sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>
                                Choose query type{" "}
                                <Box component="span" sx={{ color: "#f97316" }}>*</Box>
                            </Typography>
                        )
                    }
                    sx={{
                        ...INPUT_SX,
                        mb: 1.5,
                        "& .MuiOutlinedInput-root": INPUT_SX["& .MuiOutlinedInput-root"],
                        bgcolor: "#0D0D0D",
                        borderRadius: "10px",
                        color: "#fff",
                        fontSize: "0.8rem",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
                        "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                        "&.Mui-focused fieldset": { borderColor: "#7c3aed", borderWidth: "1px" },
                        "& .MuiSelect-icon": { color: "rgba(255,255,255,0.45)" },
                    }}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                bgcolor: "#1a1a1e",
                                backgroundImage: "none",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "10px",
                                mt: 0.5,
                                "& .MuiMenuItem-root": {
                                    fontSize: "0.8rem",
                                    color: "rgba(255,255,255,0.75)",
                                    py: 0.75,
                                    "&:hover": { bgcolor: "rgba(124,58,237,0.15)", color: "#fff" },
                                    "&.Mui-selected": {
                                        bgcolor: "rgba(124,58,237,0.2)",
                                        color: "#fff",
                                        "&:hover": { bgcolor: "rgba(124,58,237,0.3)" },
                                    },
                                },
                            },
                        },
                    }}
                >
                    {QUERY_TYPES.map((qt) => (
                        <MenuItem key={qt} value={qt}>{qt}</MenuItem>
                    ))}
                </Select>

                {/* Message textarea */}
                <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    maxRows={7}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your concern (e.g., schedule change, availability, batch details)..."
                    sx={{
                        ...INPUT_SX,
                        mb: 2.5,
                        "& .MuiOutlinedInput-root": {
                            ...INPUT_SX["& .MuiOutlinedInput-root"],
                            alignItems: "flex-start",
                        },
                        "& textarea": {
                            fontSize: "0.78rem",
                            color: "#fff",
                            lineHeight: 1.55,
                            "&::placeholder": { color: "rgba(255,255,255,0.25)", opacity: 1 },
                        },
                    }}
                />

                {/* Actions */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <CCNButton
                        onClick={handleSubmit}
                        className="w-full"
                    >
                        Send Query
                    </CCNButton>

                    <Typography
                        onClick={handleClose}
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
            </Box>
        </CCNModal>
    );
}
