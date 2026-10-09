"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Box } from "@mui/material";
import { FEE_SCENARIOS } from "@/components/profile/profile-data";
import {
    AcademicDocumentsCard,
    FeeHelpCard,
    FeeSummaryCard,
    InstallmentTimelineCard,
    ProgramsCard,
    SingleProgramCard,
} from "@/components/profile/FeesSections";

function FeesDetails() {
    // Backend data is not wired yet; `?view=` switches between the Figma states
    // (multi | due-today | overdue | multi-overdue).
    const view = useSearchParams().get("view") ?? "multi";
    const scenario = FEE_SCENARIOS[view] ?? FEE_SCENARIOS.multi;
    const [primary] = scenario.programs;

    return (
        <Box
            sx={{
                mt: { md: "8px" },
                display: "grid",
                gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 709fr) minmax(0, 659fr)" },
                alignItems: "start",
                gap: "24px",
            }}
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
                {scenario.layout === "multi" ? <ProgramsCard programs={scenario.programs} /> : <SingleProgramCard program={primary} />}
                <AcademicDocumentsCard />
                <FeeHelpCard rm={primary.rm} />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
                <FeeSummaryCard summary={scenario.summary} />
                <InstallmentTimelineCard key={view} defaultTab={scenario.defaultTab} />
            </Box>
        </Box>
    );
}

export default function FeeDetailsPage() {
    return (
        <Suspense fallback={null}>
            <FeesDetails />
        </Suspense>
    );
}
