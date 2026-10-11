"use client";

import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import type { StudentRequest } from "@/contexts/RequestContext";
import RequestCard from "./RequestCard";
import { RQ, TEXT } from "./request-data";

export interface RequestGridProps {
    requests: StudentRequest[];
    loading?: boolean;
    emptyLabel: string;
    onView: (request: StudentRequest) => void;
    onWithdraw?: (request: StudentRequest) => void;
}

export default function RequestGrid({ requests, loading = false, emptyLabel, onView, onWithdraw }: RequestGridProps) {
    if (requests.length === 0) {
        return (
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    py: "48px",
                    px: "16px",
                    borderRadius: "24px",
                    backgroundImage: RQ.cardFrame,
                }}
            >
                {loading ? (
                    <CircularProgress size={28} sx={{ color: RQ.n300 }} aria-label="Loading requests" />
                ) : (
                    <Typography sx={{ ...TEXT.med16, color: RQ.n300, textAlign: "center" }}>{emptyLabel}</Typography>
                )}
            </Box>
        );
    }

    return (
        <Box
            aria-busy={loading}
            sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
                gap: "24px",
                alignItems: "start",
                opacity: loading ? 0.6 : 1,
                transition: "opacity .15s ease",
            }}
        >
            {requests.map((request) => (
                <RequestCard
                    key={request.requestId}
                    request={request}
                    onView={() => onView(request)}
                    onWithdraw={onWithdraw ? () => onWithdraw(request) : undefined}
                />
            ))}
        </Box>
    );
}
