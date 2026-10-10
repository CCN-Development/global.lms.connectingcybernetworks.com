"use client";

import React, { Suspense } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { Box, Typography } from "@mui/material";
import StudentLayout from "@/layouts/StudentLayout";
import { PlacementProvider, usePlacement } from "@/components/placement/PlacementContext";
import { PlacementFlows } from "@/components/placement/JobModals";
import { MatchScorePill } from "@/components/placement/JobDetail";
import { TrackHeaderActions } from "@/components/placement/TrackHeaderActions";
import { PLACEMENT_ROUTES, findJob } from "@/components/placement/jobs-data";
import { isPreviewStage } from "@/components/placement/placement-data";
import { BackHeader, PL, PTEXT } from "@/components/placement/placement-ui";
import { ResumeBuilderProvider } from "@/components/resume-builder/ResumeBuilderContext";
import ResumeBuilderShell from "@/components/resume-builder/ResumeBuilderShell";
import { RESUME_ROUTES } from "@/components/resume-builder/resume-data";

const TITLE_HEADER = (
    <Box sx={{ display: "flex", alignItems: "center", minHeight: 48 }}>
        <Typography component="h1" sx={{ ...PTEXT.poppinsMed20, color: PL.white, whiteSpace: "nowrap" }}>
            Placement Hub
        </Typography>
    </Box>
);

function usePlacementHeader(): { header: React.ReactNode; mobileOnly: boolean } {
    const pathname = usePathname();
    const params = useParams<{ job_id?: string; application_id?: string }>();
    const stage = useSearchParams().get("stage");
    const { placementReady, applications } = usePlacement();
    const sub = pathname.replace(PLACEMENT_ROUTES.hub, "");

    if (params.application_id) {
        const application = applications.find((a) => a.id === params.application_id);
        return {
            header: (
                <BackHeader
                    title="Track Application"
                    href={PLACEMENT_ROUTES.applications}
                    actions={application && <TrackHeaderActions application={application} />}
                />
            ),
            mobileOnly: false,
        };
    }
    if (params.job_id) {
        const job = findJob(params.job_id);
        return { header: <BackHeader title="Job Details" href={PLACEMENT_ROUTES.jobs} actions={job && <MatchScorePill score={job.skillMatch} />} />, mobileOnly: false };
    }

    const titled: Record<string, string> = {
        "/jobs": "Explore Job Opportunities",
        "/recommended": "Jobs recommended for you!",
        "/applications": "My Application",
        "/interview-preparation": "Interview Preparations",
    };
    if (titled[sub]) return { header: <BackHeader title={titled[sub]} href={PLACEMENT_ROUTES.hub} />, mobileOnly: false };

    // The hub hero carries its own heading, so the bar only shows on mobile (for the menu button).
    const showingHub = placementReady && !isPreviewStage(stage);
    return { header: TITLE_HEADER, mobileOnly: showingHub };
}

function PlacementShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { header, mobileOnly } = usePlacementHeader();
    if (pathname.startsWith(RESUME_ROUTES.list)) return <ResumeBuilderShell>{children}</ResumeBuilderShell>;
    return (
        <StudentLayout header={header} headerMobileOnly={mobileOnly}>
            {children}
            <PlacementFlows />
        </StudentLayout>
    );
}

export default function PlacementLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={null}>
            <ResumeBuilderProvider>
                <PlacementProvider>
                    <PlacementShell>{children}</PlacementShell>
                </PlacementProvider>
            </ResumeBuilderProvider>
        </Suspense>
    );
}
