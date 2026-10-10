"use client";
import React, { useState } from "react";
import { Box, InputBase, MenuItem, Select, type SelectChangeEvent } from "@mui/material";
import { FONT_INTER, GradientButton } from "@/components/batches/batch-card-ui";
import { BatchModalShell, ModalHeading, ModalSection, ModalTextButton } from "@/components/batches/BatchModalShell";

export interface AskAboutBatchModalProps {
    open: boolean;
    onClose: () => void;
    batchTitle?: string;
    /** e.g. "14 Feb – 16 Apr" */
    dateRange?: string;
    onSubmit?: (queryType: string, message: string) => void;
}

const QUERY_TYPES = [
    "Schedule conflict",
    "Seat availability",
    "Batch details",
    "Fee & payment",
    "Trainer info",
    "Other",
];

const FIELD_TEXT_SX = {
    fontFamily: FONT_INTER,
    fontSize: "16px",
    lineHeight: "24px",
    color: "#fff",
};

const ChevronIcon = (props: { className?: string }) => (
    <Box
        component="img"
        src="/batches/explore/icon-chevron-down-24.svg"
        alt=""
        className={props.className}
        sx={{ width: 24, height: 24, right: "16px !important", top: "calc(50% - 12px) !important", pointerEvents: "none" }}
    />
);

export default function AskAboutBatchModal({ open, onClose, batchTitle, dateRange, onSubmit }: AskAboutBatchModalProps) {
    const [queryType, setQueryType] = useState("");
    const [message, setMessage] = useState("");

    const reset = () => {
        setQueryType("");
        setMessage("");
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = () => {
        if (!queryType || !message.trim()) return;
        onSubmit?.(queryType, message.trim());
        handleClose();
    };

    const context = [batchTitle, dateRange].filter(Boolean).join(" · ");

    return (
        <BatchModalShell open={open} onClose={handleClose} gap={32}>
            <ModalHeading
                title="Ask About This Batch"
                subtitle={
                    <>
                        {context && <Box component="span" sx={{ display: "block" }}>{context}.</Box>}
                        <Box component="span" sx={{ display: "block" }}>
                            Have questions about the schedule, timing, or batch details? We’re here to help.
                        </Box>
                    </>
                }
            />

            <ModalSection gap={16}>
                <Select
                    value={queryType}
                    onChange={(e: SelectChangeEvent) => setQueryType(e.target.value)}
                    displayEmpty
                    fullWidth
                    IconComponent={ChevronIcon}
                    renderValue={(value) =>
                        value ? value : (
                            <>
                                Choose query type{" "}
                                <Box component="span" sx={{ color: "#d1293d", fontWeight: 500 }}>*</Box>
                            </>
                        )
                    }
                    sx={{
                        ...FIELD_TEXT_SX,
                        height: 52,
                        borderRadius: "12px",
                        bgcolor: "transparent",
                        "& .MuiSelect-select": { pl: "24px", pr: "56px !important", py: "14px", display: "flex", alignItems: "center", gap: "4px" },
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#404040" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#5a5a5a" },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2F53AD", borderWidth: "1px" },
                    }}
                    MenuProps={{
                        slotProps: {
                            paper: {
                                sx: {
                                    mt: "4px",
                                    bgcolor: "#0d0d0d",
                                    backgroundImage: "none",
                                    border: "1px solid #404040",
                                    borderRadius: "12px",
                                    "& .MuiMenuItem-root": {
                                        fontFamily: FONT_INTER,
                                        fontSize: "14px",
                                        color: "#d9d9d9",
                                        "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                                        "&.Mui-selected": { bgcolor: "rgba(47,83,173,0.32)", color: "#fff" },
                                    },
                                },
                            },
                        },
                    }}
                >
                    {QUERY_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                </Select>

                <InputBase
                    multiline
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your concern (e.g., schedule change, availability, batch details)…"
                    sx={{
                        ...FIELD_TEXT_SX,
                        height: 208,
                        alignItems: "flex-start",
                        p: "14.8px",
                        border: "1.2px solid #404040",
                        borderRadius: "12px",
                        overflow: "auto",
                        "&.Mui-focused": { borderColor: "#2F53AD" },
                        "& textarea": { height: "100% !important", overflow: "auto !important" },
                        "& textarea::placeholder": { color: "#a6a6a6", opacity: 1 },
                    }}
                />
            </ModalSection>

            <ModalSection gap={10} sx={{ py: "8px", alignItems: "center" }}>
                <GradientButton fullWidth onClick={handleSubmit}>
                    Send Query
                </GradientButton>
                <ModalTextButton onClick={handleClose}>Cancel</ModalTextButton>
            </ModalSection>
        </BatchModalShell>
    );
}
