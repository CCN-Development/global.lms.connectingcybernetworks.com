"use client";
import React from "react";
import { Box, Typography, Divider, Chip } from "@mui/material";
import CCNModal from "@/components/modals/CCNModal";
import CCNButton from "@/components/buttons/CCNButton";

export type RequestStatus = "pending" | "approved" | "rejected";

export interface ViewBatchRequestModalProps {
    open: boolean;
    onClose: () => void;
    batchTitle: string;
    modeRequested: string;
    requestStatus: RequestStatus;
    requestReason: string | null;
    requestedOn: string;
    batchStartDate: string;
    lastUpdatedOn: string;
}

const STATUS_STYLES: Record<RequestStatus, { label: string; bg: string; color: string; help: string }> = {
    pending: {
        label: "Pending approval",
        bg: "rgb(255, 239, 198)",
        color: "#FC9700",
        help: "Your request is with the coordinator. Your seat is confirmed after fee verification.",
    },
    approved: {
        label: "Approved",
        bg: "rgb(205, 255, 238)",
        color: "#00A870",
        help: "You have been added to this batch. It now appears under your ongoing batches.",
    },
    rejected: {
        label: "Rejected",
        bg: "rgb(255, 207, 207)",
        color: "#FD0000",
        help: "This request was not approved. Reach out to your coordinator for more details.",
    },
};

const ROW_LABEL_SX = { fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" };
const ROW_VALUE_SX = { fontSize: "0.78rem", color: "#fff", fontWeight: 600, textAlign: "right" as const };

const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, py: 0.7 }}>
        <Typography sx={ROW_LABEL_SX}>{label}</Typography>
        <Typography sx={ROW_VALUE_SX}>{value}</Typography>
    </Box>
);

export default function ViewBatchRequestModal({
    open,
    onClose,
    batchTitle,
    modeRequested,
    requestStatus,
    requestReason,
    requestedOn,
    batchStartDate,
    lastUpdatedOn,
}: ViewBatchRequestModalProps) {
    const status = STATUS_STYLES[requestStatus] ?? STATUS_STYLES.pending;

    return (
        <CCNModal open={open} onClose={onClose} maxWidth={440}>
            <Box sx={{ p: "22px 20px 18px" }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5, mb: 0.6 }}>
                    <Typography sx={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
                        Your Batch Request
                    </Typography>
                    <Chip
                        label={status.label}
                        size="small"
                        sx={{ bgcolor: status.bg, color: status.color, fontSize: "0.65rem", fontWeight: 700, height: 20, borderRadius: "5px" }}
                    />
                </Box>
                <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", mb: 2 }}>
                    {batchTitle}
                </Typography>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 1 }} />

                <Box sx={{ bgcolor: "#0D0D0D", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", p: "6px 12px", mb: 1.5 }}>
                    <DetailRow label="Mode requested" value={modeRequested} />
                    <DetailRow label="Requested on" value={requestedOn} />
                    <DetailRow label="Batch starts on" value={batchStartDate} />
                    <DetailRow label="Last updated" value={lastUpdatedOn} />
                </Box>

                {requestReason && (
                    <Box sx={{ bgcolor: "#0D0D0D", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", p: 1.5, mb: 1.5 }}>
                        <Typography sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, mb: 0.6 }}>
                            Reason
                        </Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: "#fff", lineHeight: 1.55 }}>
                            {requestReason}
                        </Typography>
                    </Box>
                )}

                <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6, mb: 2.5 }}>
                    {status.help}
                </Typography>

                <CCNButton onClick={onClose} className="w-full">Close</CCNButton>
            </Box>
        </CCNModal>
    );
}
