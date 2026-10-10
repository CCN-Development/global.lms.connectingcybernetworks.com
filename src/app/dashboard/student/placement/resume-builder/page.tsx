"use client";

import { BackHeader } from "@/components/placement/placement-ui";
import { PLACEMENT_ROUTES } from "@/components/placement/jobs-data";
import ResumeList from "@/components/resume-builder/ResumeList";

export default function ResumeBuilderPage() {
    return (
        <>
            <BackHeader title="CCN Resume Builder" href={PLACEMENT_ROUTES.hub} />
            <ResumeList />
        </>
    );
}
