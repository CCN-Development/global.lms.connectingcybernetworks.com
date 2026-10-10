"use client";
import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Snackbar } from "@mui/material";
import BatchCard from "@/components/batches/BatchCard";
import ViewBatchRequestModal from "@/components/batches/ViewBatchRequestModal";
import { CARD_GRID_SX, EmptyBatches } from "@/components/batches/batch-card-ui";
import { formatUTCDate, normalizeMode } from "@/components/batches/batch-format";
import { useStudent, type StudentBatchRequest } from "@/contexts/StudentContext";

function normalizeStatus(status: StudentBatchRequest["requestStatus"]): "Pending" | "Approved" | "Rejected" {
    if (status === "approved") return "Approved";
    if (status === "rejected") return "Rejected";
    return "Pending";
}

/** Request timestamps are real instants — format them as dates, not UTC wall-clock. */
function formatRequestedOn(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function UpcomingBatchesPage() {
    const { batchRequests, loadingBatchRequests, getBatchRequests } = useStudent();
    const [selectedRequest, setSelectedRequest] = useState<StudentBatchRequest | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        getBatchRequests();
    }, [getBatchRequests]);

    // TODO(backend): there is no student "cancel batch request" endpoint yet — wire this to it once available.
    const cancelRequest = () => {
        setNotice("Cancelling a request isn’t available yet — please contact your coordinator.");
    };

    if (loadingBatchRequests) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress size={24} sx={{ color: "#7c3aed" }} />
            </Box>
        );
    }

    if (batchRequests.length === 0) {
        return <EmptyBatches message="You have not requested any batch yet." />;
    }

    return (
        <Box sx={CARD_GRID_SX}>
            {batchRequests.map((request) => (
                <BatchCard
                    key={request.batchRequestId}
                    variant="upcoming"
                    title={request.batch.course?.courseName ?? request.batch.batchName}
                    mode={normalizeMode(request.modeRequested ?? request.batch.mode)}
                    requestedOn={formatRequestedOn(request.createdAt)}
                    batchStartDate={formatUTCDate(request.batch.batchStartDate)}
                    requestStatus={normalizeStatus(request.requestStatus)}
                    onCancelRequest={cancelRequest}
                    onViewRequest={() => setSelectedRequest(request)}
                />
            ))}

            <Snackbar
                open={Boolean(notice)}
                autoHideDuration={4000}
                onClose={() => setNotice(null)}
                message={notice}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            />

            {selectedRequest && (
                <ViewBatchRequestModal
                    open
                    onClose={() => setSelectedRequest(null)}
                    batchTitle={selectedRequest.batch.course?.courseName ?? selectedRequest.batch.batchName}
                    modeRequested={normalizeMode(selectedRequest.modeRequested ?? selectedRequest.batch.mode)}
                    requestStatus={selectedRequest.requestStatus}
                    requestReason={selectedRequest.requestReason}
                    requestedOn={formatUTCDate(selectedRequest.createdAt)}
                    batchStartDate={formatUTCDate(selectedRequest.batch.batchStartDate)}
                    lastUpdatedOn={formatUTCDate(selectedRequest.updatedAt)}
                />
            )}
        </Box>
    );
}
