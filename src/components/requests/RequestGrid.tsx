"use client";

import React from "react";
import { Box, Skeleton, Typography } from "@mui/material";
import { MdInbox } from "react-icons/md";
import { tabForStatus, type StudentRequest } from "@/contexts/RequestContext";
import RequestCard from "./RequestCard";
import { formatDate, hoursRemaining, statusRow } from "./request-ui";

const GRID_SX = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 2,
} as const;

export interface RequestGridProps {
    requests: StudentRequest[];
    loading: boolean;
    emptyLabel: string;
    onView: (request: StudentRequest) => void;
}

export default function RequestGrid({ requests, loading, emptyLabel, onView }: RequestGridProps) {
    if (loading) {
        return (
            <Box sx={GRID_SX}>
                {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton
                        key={index}
                        variant="rounded"
                        height={210}
                        sx={{ borderRadius: "14px", bgcolor: "rgba(255,255,255,0.05)" }}
                    />
                ))}
            </Box>
        );
    }

    if (requests.length === 0) {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    py: 6,
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    bgcolor: "rgba(255,255,255,0.02)",
                }}
            >
                <MdInbox size={26} style={{ color: "rgba(255,255,255,0.35)" }} />
                <Typography sx={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.45)" }}>
                    {emptyLabel}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={GRID_SX}>
            {requests.map((request) => {
                const row = statusRow(request);
                const sla = hoursRemaining(request);
                return (
                    <RequestCard
                        key={request.requestId}
                        status={tabForStatus(request.requestStatus)}
                        title={request.requestTitle}
                        statusLabel={row.label}
                        statusDate={row.date}
                        createdOn={formatDate(request.createdAt)}
                        repliesIn={sla === null ? undefined : `${sla}h`}
                        onView={() => onView(request)}
                        onMore={() => onView(request)}
                    />
                );
            })}
        </Box>
    );
}
