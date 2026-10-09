"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Typography } from "@mui/material";
import StudentLayout from "@/layouts/StudentLayout";
import EligibilityStepsPanel from "@/components/placement/EligibilityStepsPanel";
import EligibilityStepContent from "@/components/placement/EligibilityStepContent";
import { PlacementFlowModal } from "@/components/placement/PlacementModals";
import { PLACEMENT_ELIGIBILITY, PREVIEW_STAGES, TOTAL_STEPS, isPreviewStage } from "@/components/placement/placement-data";
import { PL, PTEXT } from "@/components/placement/placement-ui";

const header = (
    <Box sx={{ display: "flex", alignItems: "center", minHeight: 48 }}>
        <Typography component="h1" sx={{ ...PTEXT.poppinsMed20, color: PL.white, whiteSpace: "nowrap" }}>
            Placement Hub
        </Typography>
    </Box>
);

function PlacementHub({ stage }: { stage: string | null }) {
    const data = isPreviewStage(stage) ? { ...PLACEMENT_ELIGIBILITY, ...PREVIEW_STAGES[stage] } : PLACEMENT_ELIGIBILITY;

    // Completion modals are shown once per step; dismissing one moves the stepper forward.
    const [acknowledged, setAcknowledged] = useState(data.acknowledgedSteps);
    const completed = data.completedSteps;

    const currentIndex = Math.min(acknowledged, TOTAL_STEPS - 1);
    const modalView = acknowledged >= TOTAL_STEPS ? "loader" : completed > acknowledged ? acknowledged : null;

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", lg: "row" },
                alignItems: { lg: "stretch" },
                gap: "24px",
                minHeight: "100%",
                pb: { xs: "16px", lg: 0 },
            }}
        >
            <EligibilityStepsPanel currentIndex={currentIndex} />
            <EligibilityStepContent stepIndex={currentIndex} data={data} />
            <PlacementFlowModal view={modalView} onAcknowledge={(index) => setAcknowledged(index + 1)} />
        </Box>
    );
}

/** Remount on `?stage=` changes so the acknowledged-steps state restarts from that preview. */
function PlacementHubRoute() {
    const stage = useSearchParams().get("stage");
    return <PlacementHub key={stage ?? "live"} stage={stage} />;
}

export default function PlacementPage() {
    return (
        <StudentLayout header={header}>
            <Suspense fallback={null}>
                <PlacementHubRoute />
            </Suspense>
        </StudentLayout>
    );
}
