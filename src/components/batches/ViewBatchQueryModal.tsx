"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import { FONT_INTER } from "@/components/batches/batch-card-ui";
import {
    BatchModalShell, ModalBadge, ModalGlowButton, ModalHeading, ModalSection, ModalTextButton,
} from "@/components/batches/BatchModalShell";
import { formatEventDayTime, formatTimeAgo } from "@/components/batches/batch-format";

export type QueryStatus = "pending" | "resolved" | "closed";

export interface ViewBatchQueryModalProps {
    open: boolean;
    onClose: () => void;
    queryType: string;
    queryText: string;
    queryStatus: QueryStatus;
    queryResponse: string | null;
    /** ISO timestamp the query was sent */
    askedAt: string;
    /** ISO timestamp of the latest update (used as the reply time) */
    updatedAt: string;
    studentName?: string;
    onWithdraw?: () => void;
    onFollowUp?: () => void;
}

const STATUS_BADGE: Record<QueryStatus, { label: string; bg: string; color: string }> = {
    pending: { label: "Awaiting reply", bg: "#ffefdc", color: "#fb8600" },
    resolved: { label: "Answered", bg: "#bbedbb", color: "#195c19" },
    closed: { label: "Closed", bg: "#e3e3e3", color: "#404040" },
};

const MESSAGE_SX = {
    fontFamily: FONT_INTER,
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "21px",
    color: "#a6a6a6",
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
};

function initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    return (parts.length === 1 ? parts[0].slice(0, 2) : `${parts[0][0]}${parts[parts.length - 1][0]}`).toUpperCase();
}

/** Profile photos aren't part of the batch-query API yet, so initials stand in for them. */
function Avatar({ name }: { name: string }) {
    return (
        <Box
            sx={{
                width: 20,
                height: 20,
                flexShrink: 0,
                borderRadius: "99px",
                bgcolor: "#93a9e2",
                border: "0.4px solid #404040",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT_INTER,
                fontSize: "8px",
                fontWeight: 700,
                color: "#0d0d0d",
            }}
        >
            {initials(name)}
        </Box>
    );
}

function Message({ author, meta, text, withAvatar }: { author: string; meta: string; text: string; withAvatar: boolean }) {
    return (
        <Box sx={{ position: "relative", width: "100%", borderLeft: "1px solid rgba(255,255,255,0.24)", pl: "12px", display: "flex", flexDirection: "column", gap: withAvatar ? "10px" : "21px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {withAvatar && <Avatar name={author} />}
                <Typography sx={MESSAGE_SX}>{meta}</Typography>
            </Box>
            <Typography sx={MESSAGE_SX}>{text}</Typography>
        </Box>
    );
}

export default function ViewBatchQueryModal({
    open, onClose, queryType, queryText, queryStatus, queryResponse, askedAt, updatedAt,
    studentName = "You", onWithdraw, onFollowUp,
}: ViewBatchQueryModalProps) {
    const badge = STATUS_BADGE[queryStatus] ?? STATUS_BADGE.pending;
    const answered = Boolean(queryResponse);

    return (
        <BatchModalShell open={open} onClose={onClose} gap={32}>
            <ModalHeading title="Your Query" badge={<ModalBadge {...badge} />} />

            <Message
                author={studentName}
                meta={`You · ${formatEventDayTime(askedAt)} · ${queryType}`}
                text={queryText}
                withAvatar={answered}
            />

            {answered ? (
                <Message
                    author="Batch Coordinator"
                    // TODO(backend): expose the responding coordinator's name; the role is shown until then.
                    meta={`Batch coordinator · ${formatEventDayTime(updatedAt)}`}
                    text={queryResponse ?? ""}
                    withAvatar
                />
            ) : (
                <Box sx={{ position: "relative", width: "100%", border: "1.2px solid #404040", borderRadius: "12px", p: "14.8px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Box component="img" src="/batches/explore/icon-clock-query.svg" alt="" aria-hidden sx={{ width: 16, height: 16 }} />
                    <Typography sx={{ fontFamily: FONT_INTER, fontSize: "12px", lineHeight: "18px", color: "#fb8600" }}>
                        No reply yet. Sent {formatTimeAgo(askedAt)}.
                    </Typography>
                </Box>
            )}

            <ModalSection gap={10} sx={{ py: "8px", alignItems: "center" }}>
                {answered || queryStatus === "closed"
                    ? <ModalGlowButton onClick={onFollowUp}>Ask a follow up</ModalGlowButton>
                    : <ModalGlowButton onClick={onWithdraw}>Withdraw Query</ModalGlowButton>}
                <ModalTextButton onClick={onClose}>Cancel</ModalTextButton>
            </ModalSection>
        </BatchModalShell>
    );
}
