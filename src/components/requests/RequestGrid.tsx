"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import RequestCard from "./RequestCard";
import { RQ, TEXT, type SampleRequest } from "./request-data";

export interface RequestGridProps {
    requests: SampleRequest[];
    emptyLabel: string;
    onView: (request: SampleRequest) => void;
    onWithdraw?: (request: SampleRequest) => void;
}

export default function RequestGrid({ requests, emptyLabel, onView, onWithdraw }: RequestGridProps) {
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
                <Typography sx={{ ...TEXT.med16, color: RQ.n300, textAlign: "center" }}>{emptyLabel}</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
                gap: "24px",
                alignItems: "start",
            }}
        >
            {requests.map((request) => (
                <RequestCard
                    key={request.id}
                    request={request}
                    onView={() => onView(request)}
                    onWithdraw={onWithdraw ? () => onWithdraw(request) : undefined}
                />
            ))}
        </Box>
    );
}
