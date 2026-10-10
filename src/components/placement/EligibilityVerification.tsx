"use client";

import React, { useState } from "react";
import { Box } from "@mui/material";
import EligibilityStepsPanel from "./EligibilityStepsPanel";
import EligibilityStepContent from "./EligibilityStepContent";
import { PlacementFlowModal } from "./PlacementModals";
import { PLACEMENT_ELIGIBILITY, PREVIEW_STAGES, PreviewStage, TOTAL_STEPS } from "./placement-data";

/** Eligibility verification (course → HR round → fees) shown before the Placement Hub unlocks. */
export default function EligibilityVerification({ stage, onShortlisted }: { stage?: PreviewStage; onShortlisted: () => void }) {
    const data = stage ? { ...PLACEMENT_ELIGIBILITY, ...PREVIEW_STAGES[stage] } : PLACEMENT_ELIGIBILITY;

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
            <PlacementFlowModal view={modalView} onAcknowledge={(index) => setAcknowledged(index + 1)} onShortlisted={onShortlisted} />
        </Box>
    );
}
