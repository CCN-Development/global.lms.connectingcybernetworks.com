"use client";
import React from "react";
import { Box } from "@mui/material";
import RequestCard from "@/components/requests/RequestCard";

const RESOLVED_REQUESTS = [
    { id: 1, title: "Attendance", statusLabel: "Resolved on", statusDate: "12 April, 2026 • 2:30 PM", createdOn: "July 10, 2026" },
    { id: 2, title: "Placement", statusLabel: "Resolved on", statusDate: "12 April, 2026 • 2:30 PM", createdOn: "July 10, 2026" },
    { id: 3, title: "Technical Support", statusLabel: "Resolved on", statusDate: "12 April, 2026 • 2:30 PM", createdOn: "July 10, 2026" },
];

export default function ResolvedRequestsPage() {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 2,
            }}
        >
            {RESOLVED_REQUESTS.map((req) => (
                <RequestCard
                    key={req.id}
                    status="resolved"
                    title={req.title}
                    statusLabel={req.statusLabel}
                    statusDate={req.statusDate}
                    createdOn={req.createdOn}
                />
            ))}
        </Box>
    );
}