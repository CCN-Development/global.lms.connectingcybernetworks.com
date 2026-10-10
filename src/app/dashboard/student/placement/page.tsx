"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EligibilityVerification from "@/components/placement/EligibilityVerification";
import PlacementHub from "@/components/placement/PlacementHub";
import { usePlacement } from "@/components/placement/PlacementContext";
import { PLACEMENT_ROUTES } from "@/components/placement/jobs-data";
import { isPreviewStage } from "@/components/placement/placement-data";

/**
 * Placement landing: the eligibility verification flow until the student is placement
 * ready, then the Placement Hub. `?stage=<key>` previews any verification screen.
 */
export default function PlacementPage() {
    const router = useRouter();
    const stage = useSearchParams().get("stage");
    const { placementReady, markPlacementReady } = usePlacement();
    const preview = isPreviewStage(stage) ? stage : undefined;

    if (preview || !placementReady) {
        return (
            <EligibilityVerification
                key={stage ?? "live"}
                stage={preview}
                onShortlisted={() => {
                    markPlacementReady();
                    router.replace(PLACEMENT_ROUTES.hub);
                }}
            />
        );
    }
    return <PlacementHub />;
}
