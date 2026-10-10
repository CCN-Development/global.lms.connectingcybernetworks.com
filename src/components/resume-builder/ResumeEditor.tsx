"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Typography } from "@mui/material";
import { BackHeader } from "@/components/placement/placement-ui";
import { BuilderStep, DETAILS_TABS, DetailsTab, RESUME_ROUTES, TIPS, isBuilderStep, isDetailsTab } from "./resume-data";
import { useResumeBuilder } from "./ResumeBuilderContext";
import { DetailsTabContent } from "./DetailsStep";
import { PreviewPanel } from "./PreviewPanel";
import { SubmittedModal, TipsModal } from "./ResumeModals";
import { ReviewStep, ThemeStep } from "./StepPanels";
import { BuilderStepper, DetailsTabBar, GhostButton, GlassPanel, PanelTitle, PrimaryButton, RB, RTEXT, TipsButton } from "./rb-ui";

const STEP_TITLE: Record<BuilderStep, string> = { theme: "", details: "Enter your Details", review: "Review & Optimize" };

/** Desktop: both panels fill the viewport and scroll internally (Figma 1440×1080 frame). */
const panelHeight = { lg: "100%" } as const;

export function NotFound() {
    return (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", textAlign: "center" }}>
            <Typography sx={{ ...RTEXT.poppinsMed20, color: RB.white }}>Resume not found</Typography>
            <Typography sx={{ ...RTEXT.med14, color: RB.n300 }}>It may have been deleted.</Typography>
            <Box component={Link} href={RESUME_ROUTES.list} sx={{ ...RTEXT.med16, color: RB.primary200 }}>
                Back to Resume Builder
            </Box>
        </Box>
    );
}

export default function ResumeEditor({ resumeId }: { resumeId: string }) {
    const router = useRouter();
    const params = useSearchParams();
    const { getResume, updateResume, updateContent, submitResume, notify } = useResumeBuilder();
    const resume = getResume(resumeId);
    const step: BuilderStep = isBuilderStep(params.get("step")) ? (params.get("step") as BuilderStep) : "theme";
    const tab: DetailsTab = isDetailsTab(params.get("tab")) ? (params.get("tab") as DetailsTab) : "personal";
    const [tipsOpen, setTipsOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const bodyRef = useRef<HTMLDivElement | null>(null);

    // Resumes under review are locked; only redirect for the status the page was opened with.
    const [lockedOnOpen] = useState(() => resume?.status === "under_review");
    useEffect(() => {
        if (lockedOnOpen) router.replace(RESUME_ROUTES.view(resumeId));
    }, [lockedOnOpen, router, resumeId]);

    useEffect(() => {
        bodyRef.current?.scrollTo({ top: 0 });
    }, [step, tab]);

    if (!resume) return <NotFound />;
    if (lockedOnOpen) return null;

    const go = (nextStep: BuilderStep, nextTab?: DetailsTab) => router.replace(RESUME_ROUTES.edit(resumeId, nextStep, nextStep === "details" ? nextTab ?? tab : undefined), { scroll: false });
    const tabIndex = DETAILS_TABS.findIndex((t) => t.id === tab);
    const lastTab = tabIndex === DETAILS_TABS.length - 1;

    const submit = async () => {
        const { personal } = resume.content;
        if (!personal.fullName.trim() || !personal.email.trim()) {
            notify("Add your full name and email before submitting");
            go("details", "personal");
            return;
        }
        setSubmitting(true);
        await submitResume(resumeId);
        setSubmitting(false);
        setSubmitted(true);
    };

    let footer: React.ReactNode;
    if (step === "theme") {
        footer = <PrimaryButton onClick={() => go("details", "personal")}>Next</PrimaryButton>;
    } else if (step === "details") {
        footer = (
            <>
                {tabIndex > 0 && <GhostButton onClick={() => go("details", DETAILS_TABS[tabIndex - 1].id)}>Previous</GhostButton>}
                <PrimaryButton onClick={() => (lastTab ? go("review") : go("details", DETAILS_TABS[tabIndex + 1].id))}>
                    {lastTab ? "Next Step : Review & Optimize" : "Next"}
                </PrimaryButton>
            </>
        );
    } else {
        footer = (
            <>
                <GhostButton onClick={() => go("details", DETAILS_TABS[DETAILS_TABS.length - 1].id)}>Previous</GhostButton>
                <PrimaryButton onClick={submit} disabled={submitting}>
                    {submitting ? "Submitting…" : "Submit for Review"}
                </PrimaryButton>
            </>
        );
    }

    return (
        <>
            <BackHeader title="CCN Resume Builder" href={RESUME_ROUTES.list} actions={<BuilderStepper current={step} onSelect={(s) => go(s)} />} />
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    display: "grid",
                    gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "repeat(2, minmax(0, 1fr))" },
                    gridTemplateRows: { lg: "minmax(0, 1fr)" },
                    gap: "24px",
                }}
            >
                <GlassPanel sx={{ height: panelHeight, minHeight: { xs: 560, lg: 0 }, p: { xs: "20px", sm: "32px" }, gap: "24px" }}>
                    {step !== "theme" && (
                        <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: step === "details" ? "24px" : 0, flexShrink: 0 }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                                <PanelTitle>{STEP_TITLE[step]}</PanelTitle>
                                <TipsButton onClick={() => setTipsOpen(true)} />
                            </Box>
                            {step === "details" && <DetailsTabBar current={tab} onSelect={(t) => go("details", t)} />}
                        </Box>
                    )}
                    <Box
                        ref={bodyRef}
                        sx={{
                            position: "relative",
                            flex: 1,
                            minHeight: 0,
                            display: "flex",
                            flexDirection: "column",
                            gap: "24px",
                            overflowY: { lg: "auto" },
                            mx: "-8px",
                            px: "8px",
                            scrollbarWidth: "thin",
                            scrollbarColor: "rgba(255,255,255,0.12) transparent",
                        }}
                    >
                        {step === "theme" && (
                            <ThemeStep
                                resume={resume}
                                onTitle={(title) => updateResume(resumeId, { title })}
                                onTheme={(theme) => updateResume(resumeId, { theme })}
                                onTemplate={(file) => {
                                    updateResume(resumeId, { theme: "custom", customTemplate: { fileName: file.name, sizeBytes: file.size } });
                                    notify("Template uploaded");
                                }}
                                notify={notify}
                            />
                        )}
                        {step === "details" && <DetailsTabContent key={tab} tab={tab} content={resume.content} update={(updater) => updateContent(resumeId, updater)} notify={notify} />}
                        {step === "review" && <ReviewStep resume={resume} />}
                    </Box>
                    <Box sx={{ position: "relative", display: "flex", justifyContent: "flex-end", gap: "10px", flexShrink: 0, flexWrap: "wrap" }}>{footer}</Box>
                </GlassPanel>

                <PreviewPanel resume={resume} sx={{ height: { xs: 720, lg: "100%" } }} />
            </Box>

            <TipsModal open={tipsOpen} tips={TIPS[step === "details" ? tab : step]} onClose={() => setTipsOpen(false)} />
            <SubmittedModal open={submitted} onClose={() => router.push(RESUME_ROUTES.list)} onAcknowledge={() => router.push(RESUME_ROUTES.view(resumeId))} />
        </>
    );
}
