"use client";
import React from "react";
import { Box, Typography, Divider, Chip } from "@mui/material";
import CCNModal from "@/components/modals/CCNModal";
import CCNButton from "@/components/buttons/CCNButton";

export type QueryStatus = "pending" | "resolved" | "closed";

export interface ViewBatchQueryModalProps {
    open: boolean;
    onClose: () => void;
    batchTitle?: string;
    queryType: string;
    queryText: string;
    queryStatus: QueryStatus;
    queryResponse: string | null;
    askedOn: string;
}

const STATUS_STYLES: Record<QueryStatus, { label: string; bg: string; color: string }> = {
    pending: { label: "Awaiting reply", bg: "rgb(255, 239, 198)", color: "#FC9700" },
    resolved: { label: "Answered", bg: "rgb(205, 255, 238)", color: "#00A870" },
    closed: { label: "Closed", bg: "rgb(226, 226, 226)", color: "#4B5563" },
};

const SECTION_LABEL_SX = {
    fontSize: "0.6rem",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    fontWeight: 600,
    mb: 0.6,
};

export default function ViewBatchQueryModal({
    open,
    onClose,
    batchTitle,
    queryType,
    queryText,
    queryStatus,
    queryResponse,
    askedOn,
}: ViewBatchQueryModalProps) {
    const status = STATUS_STYLES[queryStatus] ?? STATUS_STYLES.pending;

    return (
        <CCNModal open={open} onClose={onClose} maxWidth={460}>
            <Box sx={{ p: "22px 20px 18px" }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5, mb: 0.6 }}>
                    <Typography sx={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
                        Your Query
                    </Typography>
                    <Chip
                        label={status.label}
                        size="small"
                        sx={{ bgcolor: status.bg, color: status.color, fontSize: "0.65rem", fontWeight: 700, height: 20, borderRadius: "5px" }}
                    />
                </Box>
                <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", mb: 2 }}>
                    {batchTitle ? `${batchTitle} · asked on ${askedOn}` : `Asked on ${askedOn}`}
                </Typography>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 2 }} />

                <Box sx={{ bgcolor: "#0D0D0D", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", p: 1.5, mb: 1.5 }}>
                    <Typography sx={SECTION_LABEL_SX}>{queryType}</Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: "#fff", lineHeight: 1.55 }}>
                        {queryText}
                    </Typography>
                </Box>

                <Box sx={{
                    bgcolor: "#0D0D0D",
                    border: `1px solid ${queryResponse ? "#7c3aed" : "rgba(255,255,255,0.12)"}`,
                    borderRadius: "10px",
                    p: 1.5,
                    mb: 2.5,
                }}>
                    <Typography sx={SECTION_LABEL_SX}>Response</Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: queryResponse ? "#fff" : "rgba(255,255,255,0.35)", lineHeight: 1.55 }}>
                        {queryResponse ?? "No response yet. Our team will get back to you shortly."}
                    </Typography>
                </Box>

                <CCNButton onClick={onClose} className="w-full">Close</CCNButton>
            </Box>
        </CCNModal>
    );
}
