"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import BatchCard from "@/components/batches/BatchCard";
import ViewBatchRequestModal from "@/components/batches/ViewBatchRequestModal";
import { useStudent, type StudentBatchRequest } from "@/contexts/StudentContext";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function normalizeMode(mode: string | null): "Online" | "Offline" | "Hybrid" {
    const value = (mode ?? "").trim().toLowerCase();
    if (value === "offline") return "Offline";
    if (value === "hybrid") return "Hybrid";
    return "Online";
}

function formatDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return `${date.getUTCDate()} ${MONTH_LABELS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function normalizeStatus(status: StudentBatchRequest["requestStatus"]): "Pending" | "Approved" | "Rejected" {
    if (status === "approved") return "Approved";
    if (status === "rejected") return "Rejected";
    return "Pending";
}

export default function UpcomingBatchesPage() {
    const { batchRequests, loadingBatchRequests, getBatchRequests } = useStudent();
    const [selectedRequest, setSelectedRequest] = useState<StudentBatchRequest | null>(null);

    useEffect(() => {
        getBatchRequests();
    }, [getBatchRequests]);

    if (loadingBatchRequests) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress size={24} sx={{ color: "#7c3aed" }} />
            </Box>
        );
    }

    if (batchRequests.length === 0) {
        return (
            <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", textAlign: "center", py: 4 }}>
                You have not requested any batch yet.
            </Typography>
        );
    }

    return (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 2 }}>
            {batchRequests.map((request) => (
                <BatchCard
                    key={request.batchRequestId}
                    variant="upcoming"
                    title={request.batch.course?.courseName ?? request.batch.batchName}
                    mode={normalizeMode(request.modeRequested ?? request.batch.mode)}
                    trainers={request.batch.batchTrainers.map((item) => ({ name: item.trainer.trainerName }))}
                    requestedOn={formatDate(request.createdAt)}
                    batchStartDate={formatDate(request.batch.batchStartDate)}
                    requestStatus={normalizeStatus(request.requestStatus)}
                    onViewRequest={() => setSelectedRequest(request)}
                />
            ))}

            {selectedRequest && (
                <ViewBatchRequestModal
                    open
                    onClose={() => setSelectedRequest(null)}
                    batchTitle={selectedRequest.batch.course?.courseName ?? selectedRequest.batch.batchName}
                    modeRequested={normalizeMode(selectedRequest.modeRequested ?? selectedRequest.batch.mode)}
                    requestStatus={selectedRequest.requestStatus}
                    requestReason={selectedRequest.requestReason}
                    requestedOn={formatDate(selectedRequest.createdAt)}
                    batchStartDate={formatDate(selectedRequest.batch.batchStartDate)}
                    lastUpdatedOn={formatDate(selectedRequest.updatedAt)}
                />
            )}
        </Box>
    );
}
