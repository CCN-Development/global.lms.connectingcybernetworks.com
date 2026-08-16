"use client";
import React from "react";
import { Box } from "@mui/material";
import RequestCard from "@/components/requests/RequestCard";

const ACTIVE_REQUESTS = [
    { id: 1, title: "Batch Change", statusLabel: "Under review by RM", statusDate: "12 April, 2026 • 2:30 PM", createdOn: "July 10, 2026", repliesIn: "24h", status: "active" },
    { id: 2, title: "Leave Request", statusLabel: "Under review by RM", statusDate: "12 April, 2026 • 2:30 PM", createdOn: "July 10, 2026", repliesIn: "24h", status: "resolved" },
    { id: 3, title: "Fee Query", statusLabel: "Under review by RM", statusDate: "12 April, 2026 • 2:30 PM", createdOn: "July 10, 2026", repliesIn: "24h", status: "active" },
    { id: 4, title: "Assignment", status: "rejected", statusLabel: "Under review by RM", statusDate: "12 April, 2026 • 2:30 PM", createdOn: "July 10, 2026", repliesIn: "24h" },
    { id: 5, title: "Lab Access", status: "active", statusLabel: "Under review by RM", statusDate: "12 April, 2026 • 2:30 PM", createdOn: "July 10, 2026", repliesIn: "24h" },
];

export default function ActiveRequestsPage() {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 2,
            }}
        >
            {ACTIVE_REQUESTS.map((req) => (
                <RequestCard
                    key={req.id}
                    status={req.status as any}
                    title={req.title}
                    statusLabel={req.statusLabel}
                    statusDate={req.statusDate}
                    createdOn={req.createdOn}
                    repliesIn={req.repliesIn}
                />
            ))}
        </Box>
    );
}