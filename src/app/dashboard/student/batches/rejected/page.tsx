"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import BatchCard from "@/components/batches/BatchCard";
import BatchFeedbackModal, { buildRejectionHistory, FALLBACK_REJECTION_REASON } from "@/components/batches/BatchFeedbackModal";
import { CARD_GRID_SX, EmptyBatches } from "@/components/batches/batch-card-ui";
import { formatTimestamp } from "@/components/batches/batch-format";
import { useStudent, type AvailableBatch, type MyBatchRequest } from "@/contexts/StudentContext";

type RejectedRequest = { batch: AvailableBatch; request: MyBatchRequest };

export default function RejectedBatchesPage() {
    const { availableBatches, loadingAvailableBatches, getAvailableBatches } = useStudent();
    const [selected, setSelected] = useState<RejectedRequest | null>(null);

    useEffect(() => {
        getAvailableBatches();
    }, [getAvailableBatches]);

    // TODO(backend): `GET /batch-requests` only returns pending requests, so rejected ones are read from the
    // student's latest request on each available batch. A `GET /batch-requests?status=rejected` endpoint would
    // also cover batches that have already started.
    const rejected = useMemo<RejectedRequest[]>(
        () => availableBatches
            .filter((batch) => batch.myRequest?.requestStatus === "rejected")
            .map((batch) => ({ batch, request: batch.myRequest as MyBatchRequest }))
            .sort((a, b) => new Date(b.request.updatedAt).getTime() - new Date(a.request.updatedAt).getTime()),
        [availableBatches],
    );

    if (loadingAvailableBatches) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress size={24} sx={{ color: "#7c3aed" }} />
            </Box>
        );
    }

    if (rejected.length === 0) {
        return <EmptyBatches message="You have no rejected batch requests." />;
    }

    return (
        <Box sx={CARD_GRID_SX}>
            {rejected.map((item) => {
                const feedback = formatTimestamp(item.request.updatedAt);
                return (
                    <BatchCard
                        key={item.request.batchRequestId}
                        variant="rejected"
                        title={item.batch.course?.courseName ?? item.batch.batchName}
                        feedbackDate={feedback.date}
                        feedbackTime={feedback.time}
                        onViewFeedback={() => setSelected(item)}
                    />
                );
            })}

            {selected && (
                <BatchFeedbackModal
                    open
                    onClose={() => setSelected(null)}
                    history={buildRejectionHistory(selected.request)}
                    rejectionReason={selected.request.requestReason?.trim() || FALLBACK_REJECTION_REASON}
                />
            )}
        </Box>
    );
}
