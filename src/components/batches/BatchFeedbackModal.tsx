"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import {
    DateTimeMeta, FONT_INTER, FONT_LATO, FONT_POPPINS, GradientButton, TIMELINE_LINE_GRADIENT,
} from "@/components/batches/batch-card-ui";
import { BatchModalShell, ModalDivider, ModalSection } from "@/components/batches/BatchModalShell";
import { formatTimestamp } from "@/components/batches/batch-format";

export interface FeedbackHistoryItem {
    label: string;
    date: string;
    time: string;
    /** Marks the final, failed step (red ✕ instead of the purple dot). */
    rejected?: boolean;
}

export interface BatchFeedbackModalProps {
    open: boolean;
    onClose: () => void;
    history: FeedbackHistoryItem[];
    rejectionReason: string;
}

function HistoryRow({ item, isLast }: { item: FeedbackHistoryItem; isLast: boolean }) {
    return (
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: "12px", height: 47 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", pt: "2px", flexShrink: 0 }}>
                {item.rejected ? (
                    <Box
                        sx={{
                            width: 20,
                            height: 20,
                            borderRadius: "50px",
                            bgcolor: "#c02638",
                            border: "1px solid rgba(255,255,255,0.08)",
                            backdropFilter: "blur(25px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <Box component="img" src="/batches/icon-x-white.svg" alt="" aria-hidden sx={{ width: 12, height: 12 }} />
                    </Box>
                ) : (
                    <Box component="img" src="/batches/timeline-dot.svg" alt="" aria-hidden sx={{ width: 20, height: 20, flexShrink: 0 }} />
                )}
                {!isLast && <Box sx={{ flex: 1, width: "1px", minHeight: "1px", backgroundImage: TIMELINE_LINE_GRADIENT }} />}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
                <Typography sx={{ fontFamily: FONT_LATO, fontWeight: 500, fontSize: "16px", lineHeight: "24px", color: "#fff" }}>
                    {item.label}
                </Typography>
                <DateTimeMeta date={item.date} time={item.time} size="md" />
            </Box>
        </Box>
    );
}

/** Status history for a rejected batch request. */
export function buildRejectionHistory(request: { createdAt: string; updatedAt: string }): FeedbackHistoryItem[] {
    const submitted = formatTimestamp(request.createdAt);
    return [
        { label: "Request Submitted", ...submitted },
        // TODO(backend): batch requests don't record when the RM picked them up for review;
        // the submission time is used as a placeholder until a review timestamp is exposed.
        { label: "Under review by RM", ...submitted },
        { label: "Request Rejected", ...formatTimestamp(request.updatedAt), rejected: true },
    ];
}

// TODO(backend): replace with the RM's real message once every rejection stores one.
export const FALLBACK_REJECTION_REASON =
    "Your requested batch is currently full. We’re unable to move you to this slot at the moment.\nYou can choose another available batch or submit a new request later.";

export default function BatchFeedbackModal({ open, onClose, history, rejectionReason }: BatchFeedbackModalProps) {
    return (
        <BatchModalShell open={open} onClose={onClose} gap={44} align="center">
            <ModalSection gap={24}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Typography sx={{ fontFamily: FONT_POPPINS, fontWeight: 600, fontSize: "24px", lineHeight: "36px", color: "#fff" }}>
                        Feedback
                    </Typography>
                    <Typography sx={{ fontFamily: FONT_INTER, fontWeight: 500, fontSize: "14px", lineHeight: "21px", color: "#a6a6a6", letterSpacing: { sm: "-0.01px" } }}>
                        Have questions about the schedule, timing, or batch details? We’re here to help.
                    </Typography>
                </Box>
                <ModalDivider src="/batches/modal-divider-top.svg" />
            </ModalSection>

            <ModalSection gap={16}>
                <Typography sx={{ fontFamily: FONT_LATO, fontSize: "14px", lineHeight: "21px", color: "#a6a6a6" }}>
                    STATUS HISTORY
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {history.map((item, index) => (
                        <HistoryRow key={`${item.label}-${index}`} item={item} isLast={index === history.length - 1} />
                    ))}
                    <Box
                        sx={{
                            p: "15.4px",
                            pb: "14px",
                            borderRadius: "24px",
                            border: "0.6px solid #7a1824",
                            borderBottomWidth: "2px",
                            backgroundImage: "linear-gradient(180deg, rgba(224,44,66,0.08) 0%, rgba(173,34,51,0.08) 50%, rgba(122,24,36,0.08) 100%)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                        }}
                    >
                        <Typography sx={{ fontFamily: FONT_LATO, fontSize: "14px", lineHeight: "21px", color: "#a6a6a6" }}>
                            REASON FOR REJECTION
                        </Typography>
                        <Typography sx={{ fontFamily: FONT_LATO, fontWeight: 500, fontSize: "16px", lineHeight: "24px", color: "#fff", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                            {rejectionReason}
                        </Typography>
                    </Box>
                </Box>
            </ModalSection>

            <ModalDivider src="/batches/modal-divider-bottom.svg" />

            <ModalSection sx={{ flexDirection: "row" }}>
                <GradientButton fullWidth onClick={onClose}>Okay, I understood</GradientButton>
            </ModalSection>
        </BatchModalShell>
    );
}