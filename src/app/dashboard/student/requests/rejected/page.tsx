"use client";
import React from "react";
import { Box } from "@mui/material";
import RequestCard from "@/components/requests/RequestCard";

const REJECTED_REQUESTS = [
    { id: 1, title: "General", statusLabel: "Feedback Added", statusDate: "12 April, 2026 • 2:30 PM", createdOn: "July 10, 2026" },
    { id: 2, title: "Placement", statusLabel: "Feedback Added", statusDate: "12 April, 2026 • 2:30 PM", createdOn: "July 10, 2026" },
    { id: 3, title: "Certificate", statusLabel: "Feedback Added", statusDate: "12 April, 2026 • 2:30 PM", createdOn: "July 10, 2026" },
];

export default function RejectedRequestsPage() {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 2,
            }}
        >
            {REJECTED_REQUESTS.map((req) => (
                <RequestCard
                    key={req.id}
                    status="rejected"
                    title={req.title}
                    statusLabel={req.statusLabel}
                    statusDate={req.statusDate}
                    createdOn={req.createdOn}
                />
            ))}
        </Box>
    );
}