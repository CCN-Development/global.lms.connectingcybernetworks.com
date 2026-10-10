"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ActivityTimeline } from "@/components/placement/Applications";
import DetailLayout from "@/components/placement/DetailLayout";
import { EmptyState } from "@/components/placement/Filters";
import { JobDetailColumn } from "@/components/placement/JobDetail";
import { ConfirmModal } from "@/components/placement/JobModals";
import { usePlacement } from "@/components/placement/PlacementContext";
import { ACTIVITY, PLACEMENT_ROUTES, findJob, lastEvent } from "@/components/placement/jobs-data";
import { OutlineButton } from "@/components/placement/placement-ui";

export default function TrackApplicationPage() {
    const router = useRouter();
    const { application_id } = useParams<{ application_id: string }>();
    const { applications, appendActivity, startApply, notify } = usePlacement();
    const [declining, setDeclining] = useState(false);

    const application = applications.find((a) => a.id === application_id);
    const job = application && findJob(application.jobId);

    if (!application || !job) {
        return (
            <>
                <EmptyState title="Application not found" body="It may have been removed. Head back to your applications." />
                <OutlineButton onClick={() => router.push(PLACEMENT_ROUTES.applications)} sx={{ mt: "16px" }}>
                    Back to My Applications
                </OutlineButton>
            </>
        );
    }

    return (
        <>
            <DetailLayout
                main={
                    ACTIVITY[lastEvent(application).type].negative ? (
                        <JobDetailColumn job={job} applyLabel="Apply Again" onApply={() => startApply(job.id)} />
                    ) : (
                        <JobDetailColumn job={job} applyLabel="Applied" />
                    )
                }
                aside={
                    <ActivityTimeline
                        application={application}
                        onOfferDecision={(accept) => {
                            if (!accept) return setDeclining(true);
                            appendActivity(application.id, {
                                type: "offer-accepted",
                                note: { detail: "Congratulations! You will receive a call from recruiter for further notice." },
                            });
                            notify("Offer accepted — congratulations!");
                        }}
                    />
                }
            />
            <ConfirmModal
                open={declining}
                title="Reject this offer?"
                body="The recruiter will be informed that you have declined this offer. This can’t be undone."
                confirmLabel="Reject Offer"
                onClose={() => setDeclining(false)}
                onConfirm={() => {
                    appendActivity(application.id, {
                        type: "offer-declined",
                        note: { title: "Declined by candidate", detail: "You chose not to accept this offer." },
                    });
                    setDeclining(false);
                }}
            />
        </>
    );
}
