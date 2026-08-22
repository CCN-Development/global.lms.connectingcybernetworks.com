"use client";
import React from "react";
import { Box } from "@mui/material";
import BatchCard from "@/components/batches/BatchCard";

const T_ASHISH = [{ name: "Ashish Saini", avatar: "https://cdn-icons-png.flaticon.com/512/1754/1754623.png" }];
const T_KUSHAL = [{ name: "Kushal Korde", avatar: "https://cdn-icons-png.flaticon.com/512/1754/1754623.png" }];
const T_OMKAR = [{ name: "Omkar", avatar: "https://cdn-icons-png.flaticon.com/512/1754/1754623.png" }];
const T_SHIV = [{ name: "Shivkumar Chauhan", avatar: "https://cdn-icons-png.flaticon.com/512/1754/1754623.png" }];

const BATCHES = [
    {
        id: 1,
        title: "CompTIA Security+",
        mode: "Online" as const,
        requestedOn: "25 Jul 2026",
        batchStartDate: "15 Aug 2026",
        requestStatus: "Approved" as const,
        trainers: T_ASHISH,
    },
    {
        id: 2,
        title: "Cisco Certified Network Professional",
        mode: "Offline" as const,
        requestedOn: "27 Jul 2026",
        batchStartDate: "1 Sep 2026",
        requestStatus: "Pending" as const,
        trainers: T_KUSHAL,
    },
    {
        id: 3,
        title: "Malware Analysis & Reverse Engineering",
        mode: "Online" as const,
        requestedOn: "26 Jul 2026",
        batchStartDate: "5 Aug 2026",
        requestStatus: "Approved" as const,
        trainers: T_OMKAR,
    },
    {
        id: 4,
        title: "Cloud Security (GCP Associate)",
        mode: "Online" as const,
        requestedOn: "28 Jul 2026",
        batchStartDate: "20 Aug 2026",
        requestStatus: "Pending" as const,
        trainers: T_SHIV,
    },
    {
        id: 5,
        title: "CompTIA Network+",
        mode: "Hybrid" as const,
        requestedOn: "22 Jul 2026",
        batchStartDate: "10 Sep 2026",
        requestStatus: "Pending" as const,
        trainers: T_KUSHAL,
    },
    {
        id: 6,
        title: "Wireless Network Security",
        mode: "Offline" as const,
        requestedOn: "20 Jul 2026",
        batchStartDate: "25 Aug 2026",
        requestStatus: "Pending" as const,
        trainers: T_ASHISH,
    },
    {
        id: 7,
        title: "DevSecOps Fundamentals",
        mode: "Online" as const,
        requestedOn: "29 Jul 2026",
        batchStartDate: "3 Sep 2026",
        requestStatus: "Approved" as const,
        trainers: T_OMKAR,
    },
    {
        id: 8,
        title: "Bug Bounty Hunting (Intermediate)",
        mode: "Online" as const,
        requestedOn: "28 Jul 2026",
        batchStartDate: "15 Sep 2026",
        requestStatus: "Pending" as const,
        trainers: T_OMKAR,
    },
    {
        id: 9,
        title: "Cyber Threat Intelligence",
        mode: "Online" as const,
        requestedOn: "29 Jul 2026",
        batchStartDate: "1 Oct 2026",
        requestStatus: "Pending" as const,
        trainers: T_SHIV,
    },
    {
        id: 10,
        title: "Red Team Operations",
        mode: "Hybrid" as const,
        requestedOn: "29 Jul 2026",
        batchStartDate: "15 Oct 2026",
        requestStatus: "Pending" as const,
        trainers: T_KUSHAL,
    },
];

export default function UpcomingBatchesPage() {
    return (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 2 }}>
            {BATCHES.map((batch) => (
                <BatchCard
                    key={batch.id}
                    variant="upcoming"
                    {...batch}
                />
            ))}
        </Box>
    );
}
