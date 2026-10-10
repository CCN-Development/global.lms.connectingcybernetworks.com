"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Box } from "@mui/material";
import DetailLayout from "@/components/placement/DetailLayout";
import { EmptyState } from "@/components/placement/Filters";
import { QuickActionColumn } from "@/components/placement/JobCards";
import { JobDetailColumn } from "@/components/placement/JobDetail";
import { usePlacement } from "@/components/placement/PlacementContext";
import { PLACEMENT_ROUTES, findJob } from "@/components/placement/jobs-data";
import { OutlineButton } from "@/components/placement/placement-ui";

export default function JobDetailsPage() {
    const router = useRouter();
    const { job_id } = useParams<{ job_id: string }>();
    const { applicationForJob, startApply } = usePlacement();
    const job = findJob(job_id);

    if (!job) {
        return (
            <Box>
                <EmptyState title="Job not found" body="This opening may have closed." />
                <OutlineButton onClick={() => router.push(PLACEMENT_ROUTES.jobs)} sx={{ mt: "16px" }}>
                    Explore Jobs
                </OutlineButton>
            </Box>
        );
    }

    const application = applicationForJob(job.id);
    return (
        <DetailLayout
            main={
                <JobDetailColumn
                    job={job}
                    applyLabel={application ? "View Application" : "Easy Apply"}
                    onApply={() => (application ? router.push(PLACEMENT_ROUTES.application(application.id)) : startApply(job.id))}
                />
            }
            aside={<QuickActionColumn ids={["resume", "request", "interview"]} />}
        />
    );
}
