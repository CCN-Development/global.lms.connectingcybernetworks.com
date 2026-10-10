"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PLACEMENT_ELIGIBILITY } from "./placement-data";
import { useResumeBuilder } from "@/components/resume-builder/ResumeBuilderContext";
import {
    APPLICATIONS,
    ActivityEvent,
    Application,
    Resume,
    findJob,
    isClosed,
    nowStamp,
} from "./jobs-data";

interface PlacementState {
    /** Student cleared all eligibility steps and can use the Placement Hub. */
    placementReady: boolean;
    markPlacementReady: () => void;

    favourites: Set<string>;
    toggleFavourite: (jobId: string) => void;

    applications: Application[];
    applicationForJob: (jobId: string) => Application | undefined;
    submitApplication: (jobId: string) => Application;
    appendActivity: (applicationId: string, event: Omit<ActivityEvent, "at">) => void;

    resumes: Resume[];
    hasApprovedResume: boolean;

    /** Global flows rendered by <PlacementFlows /> */
    applyJobId: string | null;
    startApply: (jobId: string) => void;
    closeApply: () => void;
    requestOpen: boolean;
    setRequestOpen: (open: boolean) => void;
    notice: string | null;
    notify: (message: string | null) => void;
}

const PlacementContext = createContext<PlacementState | null>(null);

export function usePlacement() {
    const ctx = useContext(PlacementContext);
    if (!ctx) throw new Error("usePlacement must be used inside <PlacementProvider>");
    return ctx;
}

/**
 * Holds the student's placement data for every page under /placement so favourites,
 * new applications and offer decisions survive navigation. Approved Resume Builder
 * resumes (primary first) are the ones offered in the apply flow. Preview switches:
 * `?applications=none` (first-time hub) and `?resume=none` (no approved resume).
 */
export function PlacementProvider({ children }: { children: React.ReactNode }) {
    const params = useSearchParams();
    const { resumes: builderResumes } = useResumeBuilder();
    const [placementReady, setPlacementReady] = useState(PLACEMENT_ELIGIBILITY.placementReady);
    const [favourites, setFavourites] = useState<Set<string>>(() => new Set());
    const [applications, setApplications] = useState<Application[]>(() =>
        params.get("applications") === "none" ? [] : APPLICATIONS,
    );
    const noResume = params.get("resume") === "none";
    const resumes = useMemo<Resume[]>(
        () =>
            noResume
                ? []
                : builderResumes
                      .filter((r) => r.status === "approved")
                      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
                      .map((r) => ({ id: r.id, name: r.title, size: "1.2 MB", approved: true })),
        [builderResumes, noResume],
    );
    const [applyJobId, setApplyJobId] = useState<string | null>(null);
    const [requestOpen, setRequestOpen] = useState(false);
    const [notice, notify] = useState<string | null>(null);

    const toggleFavourite = useCallback((jobId: string) => {
        setFavourites((prev) => {
            const next = new Set(prev);
            if (next.has(jobId)) next.delete(jobId);
            else next.add(jobId);
            return next;
        });
    }, []);

    const applicationForJob = useCallback(
        (jobId: string) => applications.find((a) => a.jobId === jobId && !isClosed(a)),
        [applications],
    );

    const submitApplication = useCallback((jobId: string) => {
        const { stamp, short, iso } = nowStamp();
        const application: Application = {
            id: `app-${jobId}-${Date.now()}`,
            jobId,
            appliedOn: short,
            appliedAt: iso,
            matchScore: findJob(jobId)?.skillMatch ?? 0,
            activity: [{ type: "submitted", at: stamp }],
        };
        setApplications((prev) => [application, ...prev]);
        return application;
    }, []);

    const appendActivity = useCallback((applicationId: string, event: Omit<ActivityEvent, "at">) => {
        const { stamp } = nowStamp();
        setApplications((prev) =>
            prev.map((a) => (a.id === applicationId ? { ...a, activity: [...a.activity, { ...event, at: stamp }] } : a)),
        );
    }, []);

    const value = useMemo<PlacementState>(
        () => ({
            placementReady,
            markPlacementReady: () => setPlacementReady(true),
            favourites,
            toggleFavourite,
            applications,
            applicationForJob,
            submitApplication,
            appendActivity,
            resumes,
            hasApprovedResume: resumes.some((r) => r.approved),
            applyJobId,
            startApply: setApplyJobId,
            closeApply: () => setApplyJobId(null),
            requestOpen,
            setRequestOpen,
            notice,
            notify,
        }),
        [placementReady, favourites, toggleFavourite, applications, applicationForJob, submitApplication, appendActivity, resumes, applyJobId, requestOpen, notice],
    );

    return <PlacementContext.Provider value={value}>{children}</PlacementContext.Provider>;
}
