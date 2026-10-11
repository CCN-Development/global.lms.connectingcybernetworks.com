"use client";

import React from "react";
import Image from "next/image";
import { Box, ButtonBase, Typography } from "@mui/material";
import { PrimaryButton } from "@/components/courses/my-courses-ui";
import { COLORS, TYPE, UI_ICONS } from "@/components/courses/my-courses-theme";
import {
    STAGE_INFO,
    examAsset,
    formatDateTime,
    formatLongDate,
    isRoundStage,
    ordinal,
    type CertificateStage,
    type ExamAttempt,
    type ExamStage,
    type RoundStage,
} from "./exam-data";
import {
    EXAM_COLORS,
    IncludeChip,
    InfoTooltip,
    MetaChip,
    OutlineButton,
    StageBadgePill,
    focusRing,
    glassCardSx,
    tealGradient,
} from "./exam-ui";

export interface StageHandlers {
    /** start / retake / resume — exams run in the desktop app. */
    onStart: (stage: RoundStage) => void;
    onDownloadResult: (stage: RoundStage) => void;
    onViewReport: (stage: RoundStage, attempt: ExamAttempt) => void;
    onViewCertificate: () => void;
}

const START_LABEL: Record<RoundStage["kind"], string> = {
    viva: "Start Viva",
    mcq: "Start Exam",
    lab: "Start Lab",
    hr: "Start HR Round",
};

// ─── Attempts ──────────────────────────────────────────────────────────────

/** Full-width "View Detailed Report" strip pinned to the bottom of an attempt card. */
function ReportFooter({ onClick, label = "View Detailed Report" }: { onClick: () => void; label?: string }) {
    return (
        <ButtonBase
            onClick={onClick}
            sx={{
                position: "absolute",
                left: "-1px",
                right: "-1px",
                bottom: "-1px",
                height: 44,
                zIndex: 3,
                bgcolor: EXAM_COLORS.footerFill,
                filter: "drop-shadow(0px 0px 4px rgba(255,255,255,0.12))",
                transition: "background-color .18s ease",
                "&:hover": { bgcolor: "rgba(227,233,248,0.08)" },
                ...focusRing,
            }}
        >
            <Typography component="span" sx={{ ...TYPE.xsMed12, color: COLORS.neutral100, whiteSpace: "nowrap" }}>
                {label}
            </Typography>
        </ButtonBase>
    );
}

function AttemptHeading({ attempt }: { attempt: ExamAttempt }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Typography sx={{ ...TYPE.mediumMed16, color: COLORS.white, whiteSpace: "nowrap" }}>
                {ordinal(attempt.attemptNo)} Attempt at {formatLongDate(attempt.date)}
            </Typography>
            <Typography sx={{ ...TYPE.xsReg12, color: COLORS.neutral200, whiteSpace: "nowrap" }}>
                {attempt.attemptStatus === "in_progress" ? `Started ${formatDateTime(attempt.startedAt)}` : `Time taken - ${attempt.timeTaken ?? "—"}`}
            </Typography>
        </Box>
    );
}

/** Correct vs incorrect split: green and red capsules inside a 10px track. */
function ScoreBar({ correctPct }: { correctPct: number }) {
    const correct = Math.min(100, Math.max(0, Math.round(correctPct)));
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", ...TYPE.xsReg12, whiteSpace: "nowrap" }}>
                <Typography component="span" sx={{ ...TYPE.xsReg12, color: EXAM_COLORS.correct }}>
                    {correct}% Correct
                </Typography>
                <Typography component="span" sx={{ ...TYPE.xsReg12, color: EXAM_COLORS.incorrect }}>
                    {100 - correct}% Incorrect
                </Typography>
            </Box>
            <Box
                role="progressbar"
                aria-label="Correct answers"
                aria-valuenow={correct}
                aria-valuemin={0}
                aria-valuemax={100}
                sx={{ display: "flex", alignItems: "center", gap: "1px", height: 10, px: "1px", borderRadius: "99px", overflow: "hidden", bgcolor: EXAM_COLORS.trackFill }}
            >
                {correct > 0 && <Box sx={{ flex: `0 0 calc(${correct}% - 1px)`, height: 8, borderRadius: "50px", bgcolor: EXAM_COLORS.correct }} />}
                {correct < 100 && <Box sx={{ flex: "1 1 0", minWidth: "1px", height: 8, borderRadius: "50px", bgcolor: EXAM_COLORS.incorrect }} />}
            </Box>
        </Box>
    );
}

/** Message tones for the attempt-card callout (the passed card uses the Figma teal one). */
const CALLOUT: Record<"success" | "failed" | "review" | "progress" | "voided", { fill: string; bar: string }> = {
    success: { fill: EXAM_COLORS.successFill, bar: tealGradient("90.077deg", "4.5235%", "104.18%") },
    failed: { fill: "rgba(209,41,61,0.1)", bar: "linear-gradient(90deg, #D1293D 0%, #6E1420 100%)" },
    review: { fill: "rgba(140,36,255,0.1)", bar: "linear-gradient(90deg, #8C24FF 0%, #3B1A6E 100%)" },
    progress: { fill: "rgba(251,134,0,0.1)", bar: "linear-gradient(90deg, #FB8600 0%, #6E3B00 100%)" },
    voided: { fill: "rgba(166,166,166,0.1)", bar: "linear-gradient(90deg, #A6A6A6 0%, #404040 100%)" },
};

function Callout({ tone, children }: { tone: keyof typeof CALLOUT; children: React.ReactNode }) {
    const palette = CALLOUT[tone];
    return (
        <Box sx={{ position: "relative", overflow: "hidden", alignSelf: "flex-start", maxWidth: 240, px: "12px", py: "6px", borderRadius: "4px", bgcolor: palette.fill }}>
            <Box aria-hidden sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, backgroundImage: palette.bar }} />
            <Typography sx={{ ...TYPE.xsReg12, color: COLORS.white }}>{children}</Typography>
        </Box>
    );
}

function AttemptCard({
    stage,
    attempt,
    onViewReport,
    onResume,
}: {
    stage: RoundStage;
    attempt: ExamAttempt;
    onViewReport: () => void;
    onResume: () => void;
}) {
    const hasReport = attempt.attemptStatus === "evaluated" || attempt.attemptStatus === "submitted";

    // Figma "failed attempt" card: heading + correct/incorrect split.
    if (attempt.passed === false && attempt.correctPct !== null) {
        return (
            <Box sx={{ ...glassCardSx({ angle: "167.01deg", radius: 12 }), flexShrink: 0, width: 272, height: 173 }}>
                <Box sx={{ position: "absolute", left: 15, right: 15, top: 15, display: "flex", flexDirection: "column", gap: "16px" }}>
                    <AttemptHeading attempt={attempt} />
                    <ScoreBar correctPct={attempt.correctPct} />
                </Box>
                <ReportFooter onClick={onViewReport} />
            </Box>
        );
    }

    let callout: React.ReactNode;
    let tone: keyof typeof CALLOUT;
    if (attempt.passed) {
        tone = "success";
        callout = `Great News! You have cleared the ${stage.title}${attempt.scorePct !== null ? ` · ${Math.round(attempt.scorePct)}%` : ""}`;
    } else if (attempt.passed === false) {
        tone = "failed";
        callout = `You didn't clear the ${stage.title} this time`;
    } else if (attempt.attemptStatus === "in_progress") {
        tone = "progress";
        callout = "In progress in the desktop app";
    } else if (attempt.attemptStatus === "voided") {
        tone = "voided";
        callout = "Cancelled by the examiner";
    } else {
        tone = "review";
        callout = "Submitted — your answers are being evaluated";
    }

    return (
        <Box
            sx={{
                ...glassCardSx({ angle: "168.272deg", radius: 12 }),
                flexShrink: 0,
                minWidth: 272,
                maxWidth: 320,
                height: 170,
                display: "flex",
                flexDirection: "column",
                pt: "16px",
                px: "16px",
                pb: "48px",
            }}
        >
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "16px" }}>
                <AttemptHeading attempt={attempt} />
                <Callout tone={tone}>{callout}</Callout>
            </Box>
            {hasReport && <ReportFooter onClick={onViewReport} />}
            {attempt.attemptStatus === "in_progress" && <ReportFooter onClick={onResume} label="Continue in desktop app" />}
        </Box>
    );
}

/** "Preference Card" tray listing every attempt of a round. */
function AttemptsTray({ stage, handlers }: { stage: RoundStage; handlers: StageHandlers }) {
    return (
        <Box
            sx={{
                width: "100%",
                p: { xs: "16px", sm: "24px" },
                borderRadius: "24px",
                bgcolor: EXAM_COLORS.preferenceFill,
                overflowX: "auto",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: "16px", width: "max-content" }}>
                {stage.attempts.map((attempt) => (
                    <AttemptCard
                        key={attempt.attemptId}
                        stage={stage}
                        attempt={attempt}
                        onViewReport={() => handlers.onViewReport(stage, attempt)}
                        onResume={() => handlers.onStart(stage)}
                    />
                ))}
            </Box>
        </Box>
    );
}

// ─── Stage row ─────────────────────────────────────────────────────────────

function DisabledAction({ icon, label }: { icon: string; label: string }) {
    return (
        <OutlineButton icon={icon} disabled ariaLabel={label}>
            {label}
        </OutlineButton>
    );
}

function RoundAction({ stage, handlers }: { stage: RoundStage; handlers: StageHandlers }) {
    switch (stage.action) {
        case "start":
        case "retake":
        case "resume":
            return (
                <PrimaryButton icon={UI_ICONS.play18} onClick={() => handlers.onStart(stage)}>
                    {stage.action === "retake" ? "Re-take Exam" : stage.action === "resume" ? "Resume Exam" : START_LABEL[stage.kind]}
                </PrimaryButton>
            );
        case "download":
            return (
                <OutlineButton icon="icon-download.svg" onClick={() => handlers.onDownloadResult(stage)}>
                    Download Result
                </OutlineButton>
            );
        case "under-review":
            return <DisabledAction icon="icon-clock.svg" label="Under Evaluation" />;
        case "cooldown":
            return <DisabledAction icon="icon-clock.svg" label="Retake Locked" />;
        case "awaiting-set":
            return <DisabledAction icon="icon-clock.svg" label="New Paper Pending" />;
        case "centre":
            return <DisabledAction icon="icon-info.svg" label="At Exam Centre" />;
        case "exhausted":
            return <DisabledAction icon="icon-lock.svg" label="No Attempts Left" />;
        default:
            return (
                <OutlineButton icon="icon-lock.svg" disabled ariaLabel={`${stage.title} is locked`} sx={{ width: 136 }}>
                    Locked
                </OutlineButton>
            );
    }
}

/** One line under the chips explaining the state behind the action. */
function stageNote(stage: RoundStage): string | null {
    const left = stage.attemptsLeft !== null && stage.attemptsAllowed !== null ? `${stage.attemptsLeft} of ${stage.attemptsAllowed} attempts left` : null;
    switch (stage.action) {
        case "start":
            return [left, `pass mark ${stage.passingPct}%`].filter(Boolean).join(" · ");
        case "retake":
            return [left, `pass mark ${stage.passingPct}%`].filter(Boolean).join(" · ");
        case "resume":
            return "You have an attempt in progress — continue it in the CCN Certified desktop app before the timer runs out.";
        case "under-review":
            return "Your latest attempt is being evaluated. The result will appear here.";
        case "cooldown":
            return stage.cooldownUntil ? `You can retake this round after ${formatDateTime(stage.cooldownUntil)}.` : null;
        case "awaiting-set":
            return "You've seen every question paper available for this round. A new one will be published soon.";
        case "centre":
            return "Conducted at the exam centre — your evaluator will start it for you.";
        case "exhausted":
            return `You've used all ${stage.attemptsAllowed ?? ""} attempts. Contact your coordinator for another chance.`;
        default:
            return null;
    }
}

function TimelineRail({ isLast }: { isLast: boolean }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "stretch", flexShrink: 0, pt: "14px" }}>
            <Image src={examAsset("timeline-dot.svg")} alt="" width={28} height={28} />
            {!isLast && (
                <Box
                    aria-hidden
                    sx={{ flex: "1 0 0", minHeight: "1px", width: "1px", backgroundImage: "linear-gradient(180deg, rgba(242,242,242,0.44) 0%, rgba(140,140,140,0.22) 100%)" }}
                />
            )}
        </Box>
    );
}

function StageHeader({ title, after, chips, action, note }: { title: string; after: React.ReactNode; chips?: React.ReactNode; action: React.ReactNode; note?: string | null }) {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "flex-start", md: "center" },
                justifyContent: "space-between",
                gap: "16px",
            }}
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <Typography component="h2" sx={{ ...TYPE.headingSemibold20, color: COLORS.white, whiteSpace: "nowrap" }}>
                        {title}
                    </Typography>
                    {after}
                </Box>
                {chips}
                {note && <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral300, maxWidth: 640 }}>{note}</Typography>}
            </Box>
            {action}
        </Box>
    );
}

function RoundRow({ stage, isLast, handlers }: { stage: RoundStage; isLast: boolean; handlers: StageHandlers }) {
    const hasMeta = stage.questions > 0 || stage.durationMins !== null || stage.attemptsUsed > 0 || Boolean(stage.mode);

    return (
        <Box component="li" sx={{ display: "flex", alignItems: "flex-start", gap: { xs: "8px", sm: "12px" }, listStyle: "none" }}>
            <TimelineRail isLast={isLast} />
            <Box sx={{ flex: "1 0 0", minWidth: 0, display: "flex", flexDirection: "column", gap: "24px", px: { xs: "4px", sm: "16px" }, py: "12px" }}>
                <StageHeader
                    title={stage.title}
                    after={
                        <>
                            {stage.badge ? <StageBadgePill badge={stage.badge} /> : stage.action !== "download" && <InfoTooltip title={stage.info || STAGE_INFO[stage.kind]} />}
                            {!stage.isMandatory && <IncludeChip label="Optional" />}
                        </>
                    }
                    chips={
                        hasMeta && (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                                {stage.questions > 0 && <MetaChip icon="icon-help-circle.svg" value={stage.questions} unit={stage.questions === 1 ? stage.questionUnit.slice(0, -1) : stage.questionUnit} />}
                                {stage.durationMins !== null && <MetaChip icon="icon-clock.svg" value={stage.durationMins} unit="mins" />}
                                {stage.attemptsUsed > 0 && (
                                    <MetaChip icon="icon-hash.svg" value={stage.attemptsUsed} unit={stage.attemptsUsed === 1 ? "Attempt" : "Attempts"} unitWeight={400} />
                                )}
                                <MetaChip icon="icon-clock.svg" value={stage.mode} />
                            </Box>
                        )
                    }
                    note={stageNote(stage)}
                    action={<RoundAction stage={stage} handlers={handlers} />}
                />
                {stage.attempts.length > 0 && <AttemptsTray stage={stage} handlers={handlers} />}
            </Box>
        </Box>
    );
}

function CertificateRow({ stage, handlers }: { stage: CertificateStage; handlers: StageHandlers }) {
    return (
        <Box component="li" sx={{ display: "flex", alignItems: "flex-start", gap: { xs: "8px", sm: "12px" }, listStyle: "none" }}>
            <TimelineRail isLast />
            <Box sx={{ flex: "1 0 0", minWidth: 0, display: "flex", flexDirection: "column", gap: "24px", px: { xs: "4px", sm: "16px" }, py: "12px" }}>
                <StageHeader
                    title={stage.title}
                    after={stage.action !== "view-certificate" && <InfoTooltip title={stage.info} />}
                    action={
                        stage.action === "view-certificate" ? (
                            <OutlineButton icon="icon-download-alt.svg" onClick={handlers.onViewCertificate}>
                                View Certificate
                            </OutlineButton>
                        ) : (
                            <OutlineButton icon="icon-lock.svg" disabled ariaLabel="Certificate is locked" sx={{ width: 136 }}>
                                Locked
                            </OutlineButton>
                        )
                    }
                />
            </Box>
        </Box>
    );
}

/** Vertical timeline of exam rounds (Technical Viva → MCQ → Practical Lab → … → Certificate). */
export default function ExamStageTimeline({ stages, handlers }: { stages: ExamStage[]; handlers: StageHandlers }) {
    return (
        <Box component="ol" sx={{ display: "flex", flexDirection: "column", gap: "32px", m: 0, p: 0 }}>
            {stages.map((stage, index) =>
                isRoundStage(stage) ? (
                    <RoundRow key={stage.stageId} stage={stage} isLast={index === stages.length - 1} handlers={handlers} />
                ) : (
                    <CertificateRow key={stage.stageId} stage={stage} handlers={handlers} />
                )
            )}
        </Box>
    );
}

// ─── Certified hero ────────────────────────────────────────────────────────

/** "Congratulations, You're CCNA Certified!" banner shown above the timeline once every round is cleared. */
export function CertifiedHero({ courseShort, onViewCertificate }: { courseShort: string; onViewCertificate: () => void }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "32px", textAlign: "center" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
                    <Typography
                        component="h2"
                        sx={{ fontFamily: TYPE.headingSemibold20.fontFamily, fontWeight: 600, fontSize: { xs: "24px", sm: "32px" }, lineHeight: { xs: "36px", sm: "48px" }, color: COLORS.white }}
                    >
                        Congratulations, You’re {courseShort} Certified!
                    </Typography>
                    <Typography sx={{ ...TYPE.largeMed18, fontSize: { xs: "16px", sm: "18px" }, color: COLORS.neutral300 }}>
                        Your determination has brought you to this achievement.
                        <br />
                        Keep up the fantastic work! You&apos;ve completed the {courseShort} Course.
                    </Typography>
                </Box>
                <PrimaryButton icon={examAsset("icon-download-alt.svg")} onClick={onViewCertificate}>
                    View Certificate
                </PrimaryButton>
            </Box>
            <Box
                component="img"
                src={examAsset("congrats-divider.svg")}
                alt=""
                aria-hidden
                sx={{ display: "block", width: "100%", height: "1px", maxWidth: "none" }}
            />
        </Box>
    );
}
