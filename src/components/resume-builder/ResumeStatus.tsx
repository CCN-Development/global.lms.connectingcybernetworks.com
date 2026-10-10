"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import { BackHeader } from "@/components/placement/placement-ui";
import { PLACEMENT_ROUTES } from "@/components/placement/jobs-data";
import { RESUME_ROUTES, STATUS_PAGE_COPY, rbAsset } from "./resume-data";
import { useResumeBuilder } from "./ResumeBuilderContext";
import { FullscreenPreview, ScaledDocument } from "./PreviewPanel";
import { DOC_WIDTH } from "./ResumeDocument";
import { FeedbackModal, ShareModal } from "./ResumeModals";
import { NotFound } from "./ResumeEditor";
import { GlassPill, PrimaryButton, RB, RTEXT, gradientText } from "./rb-ui";

/** Width of the content area in the 1440px Figma frame; keeps the background arcs centred. */
const FRAME_CONTENT_WIDTH = 1392;

function useDocScale() {
    const [scale, setScale] = useState(1);
    useEffect(() => {
        const update = () => setScale(Math.min(1, (window.innerWidth - 32) / DOC_WIDTH));
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);
    return scale;
}

/** View page for a submitted resume: under review, needs improvement or approved. */
export default function ResumeStatus({ resumeId }: { resumeId: string }) {
    const router = useRouter();
    const { getResume, setPrimary, downloadPdf, notify } = useResumeBuilder();
    const resume = getResume(resumeId);
    const scale = useDocScale();
    const [dialog, setDialog] = useState<"feedback" | "share" | "preview" | null>(null);

    const isDraft = resume?.status === "draft";
    useEffect(() => {
        if (isDraft) router.replace(RESUME_ROUTES.edit(resumeId, "theme"));
    }, [isDraft, router, resumeId]);

    if (!resume) return <NotFound />;
    if (resume.status === "draft") return null;

    const copy = STATUS_PAGE_COPY[resume.status];
    const editHref = RESUME_ROUTES.edit(resume.id, "details", "personal");

    let actions: React.ReactNode;
    if (resume.status === "under_review") {
        actions = (
            <GlassPill filled height={52} icon="action-download.svg" onClick={() => downloadPdf(resume.id)}>
                Download PDF
            </GlassPill>
        );
    } else if (resume.status === "needs_improvement") {
        actions = (
            <GlassPill filled height={52} icon="action-eye.svg" onClick={() => setDialog("feedback")}>
                View Feedback
            </GlassPill>
        );
    } else {
        actions = (
            <>
                <GlassPill
                    filled
                    height={52}
                    icon="action-star.svg"
                    aria-pressed={resume.isPrimary}
                    onClick={() => {
                        if (resume.isPrimary) return;
                        setPrimary(resume.id);
                        notify(`“${resume.title}” is now your primary resume`);
                    }}
                >
                    {resume.isPrimary ? "Primary Resume" : "Use as Primary"}
                </GlassPill>
                <GlassPill filled height={52} icon="action-edit.svg" href={editHref}>
                    Edit Details
                </GlassPill>
                <GlassPill filled height={52} icon="action-eye.svg" onClick={() => setDialog("preview")}>
                    Preview
                </GlassPill>
                <GlassPill filled height={52} icon="action-download.svg" onClick={() => downloadPdf(resume.id)}>
                    Download PDF
                </GlassPill>
                <GlassPill filled height={52} icon="action-share.svg" onClick={() => setDialog("share")}>
                    Share Link
                </GlassPill>
            </>
        );
    }

    return (
        <>
            <BackHeader
                title={resume.title}
                href={RESUME_ROUTES.list}
                actions={
                    resume.status === "approved" && (
                        <PrimaryButton glowLine onClick={() => router.push(PLACEMENT_ROUTES.jobs)} sx={{ gap: "12px" }}>
                            Start Applying
                        </PrimaryButton>
                    )
                }
            />
            <Box sx={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "50px", pt: "24px", pb: "248px", mx: { xs: "-16px", sm: "-24px" }, px: { xs: "16px", sm: "24px" }, overflowX: "clip" }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center", maxWidth: 800 }}>
                    <Typography component="h2" sx={{ ...RTEXT.poppinsMed32, fontSize: { xs: "24px", sm: "32px" }, lineHeight: { xs: "36px", sm: "48px" }, ...gradientText(RB.warmText) }}>
                        {copy.title}
                    </Typography>
                    <Typography sx={{ ...RTEXT.med16, color: RB.n200 }}>{copy.body}</Typography>
                </Box>
                <ScaledDocument resume={resume} scale={scale} />
                <Box
                    aria-hidden
                    sx={{ position: "absolute", left: `calc(50% - ${FRAME_CONTENT_WIDTH / 2}px)`, top: 0, width: 1619, height: 1619, opacity: 0.12, pointerEvents: "none" }}
                >
                    <Box component="img" src={rbAsset("status-bg-circles.svg")} alt="" sx={{ display: "block", width: "100%", height: "100%" }} />
                </Box>
            </Box>

            <Box
                sx={{
                    position: "fixed",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 5,
                    minHeight: 248,
                    display: "flex",
                    alignItems: "center",
                    alignContent: "center",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: { xs: "12px", sm: "24px" },
                    px: "24px",
                    pt: "80px",
                    pb: "24px",
                    backgroundImage: "linear-gradient(180deg, rgba(12,15,23,0) 0%, #020014 50.1%, #020014 100%)",
                    pointerEvents: "none",
                    "& > *": { pointerEvents: "auto" },
                }}
            >
                {actions}
            </Box>

            <FeedbackModal open={dialog === "feedback"} feedback={resume.feedback} onClose={() => setDialog(null)} onEdit={() => router.push(editHref)} />
            <ShareModal
                open={dialog === "share"}
                url={resume.shareUrl}
                onClose={() => setDialog(null)}
                onCopied={() => {
                    setDialog(null);
                    notify("Link copied to clipboard");
                }}
            />
            <FullscreenPreview open={dialog === "preview"} resume={resume} onClose={() => setDialog(null)} />
        </>
    );
}
