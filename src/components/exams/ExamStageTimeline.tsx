"use client";

import React from "react";
import Image from "next/image";
import { Box, ButtonBase, Typography } from "@mui/material";
import { PrimaryButton } from "@/components/courses/my-courses-ui";
import { COLORS, TYPE, UI_ICONS } from "@/components/courses/my-courses-theme";
import { examAsset, formatLongDate, ordinal, type ExamAttempt, type ExamStage } from "./exam-data";
import {
    EXAM_COLORS,
    InfoTooltip,
    MetaChip,
    OutlineButton,
    StageBadgePill,
    focusRing,
    glassCardSx,
    tealGradient,
} from "./exam-ui";

export interface StageHandlers {
    onStart: (stage: ExamStage) => void;
    onDownloadResult: (stage: ExamStage) => void;
    onViewReport: (stage: ExamStage, attempt: ExamAttempt) => void;
    onViewCertificate: () => void;
}

// ─── Attempts ──────────────────────────────────────────────────────────────

/** Full-width "View Detailed Report" strip pinned to the bottom of an attempt card. */
function ReportFooter({ onClick }: { onClick: () => void }) {
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
                View Detailed Report
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
            <Typography sx={{ ...TYPE.xsReg12, color: COLORS.neutral200, whiteSpace: "nowrap" }}>Time taken - {attempt.timeTaken}</Typography>
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

function AttemptCard({ stage, attempt, onViewReport }: { stage: ExamStage; attempt: ExamAttempt; onViewReport: () => void }) {
    if (!attempt.passed) {
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

    return (
        <Box
            sx={{
                ...glassCardSx({ angle: "168.272deg", radius: 12 }),
                flexShrink: 0,
                minWidth: 272,
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
                <Box sx={{ position: "relative", overflow: "hidden", alignSelf: "flex-start", px: "12px", py: "6px", borderRadius: "4px", bgcolor: EXAM_COLORS.successFill }}>
                    <Box aria-hidden sx={{ position: "absolute", left: 0, top: 0, width: 4, height: 37, backgroundImage: tealGradient("90.077deg", "4.5235%", "104.18%") }} />
                    <Typography sx={{ ...TYPE.xsReg12, color: COLORS.white, whiteSpace: "nowrap" }}>Great News! You have cleared the {stage.title}</Typography>
                </Box>
            </Box>
            <ReportFooter onClick={onViewReport} />
        </Box>
    );
}

/** "Preference Card" tray listing every attempt of a round. */
function AttemptsTray({ stage, onViewReport }: { stage: ExamStage; onViewReport: StageHandlers["onViewReport"] }) {
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
                    <AttemptCard key={attempt.attemptNo} stage={stage} attempt={attempt} onViewReport={() => onViewReport(stage, attempt)} />
                ))}
            </Box>
        </Box>
    );
}

// ─── Stage row ─────────────────────────────────────────────────────────────

function StageAction({ stage, handlers }: { stage: ExamStage; handlers: StageHandlers }) {
    switch (stage.action) {
        case "start":
        case "retake":
            return (
                <PrimaryButton icon={UI_ICONS.play18} onClick={() => handlers.onStart(stage)}>
                    {stage.action === "retake" ? "Re-take Exam" : stage.startLabel ?? "Start Exam"}
                </PrimaryButton>
            );
        case "download":
            return (
                <OutlineButton icon="icon-download.svg" onClick={() => handlers.onDownloadResult(stage)}>
                    Download Result
                </OutlineButton>
            );
        case "view-certificate":
            return (
                <OutlineButton icon="icon-download-alt.svg" onClick={handlers.onViewCertificate}>
                    View Certificate
                </OutlineButton>
            );
        default:
            return (
                <OutlineButton icon="icon-lock.svg" disabled ariaLabel={`${stage.title} is locked`} sx={{ width: 136 }}>
                    Locked
                </OutlineButton>
            );
    }
}

function StageRow({ stage, isLast, handlers }: { stage: ExamStage; isLast: boolean; handlers: StageHandlers }) {
    const hasMeta = stage.questions !== undefined || stage.durationMins !== undefined || stage.mode !== undefined;

    return (
        <Box component="li" sx={{ display: "flex", alignItems: "flex-start", gap: { xs: "8px", sm: "12px" }, listStyle: "none" }}>
            {/* Timeline rail */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "stretch", flexShrink: 0, pt: "14px" }}>
                <Image src={examAsset("timeline-dot.svg")} alt="" width={28} height={28} />
                {!isLast && (
                    <Box
                        aria-hidden
                        sx={{ flex: "1 0 0", minHeight: "1px", width: "1px", backgroundImage: "linear-gradient(180deg, rgba(242,242,242,0.44) 0%, rgba(140,140,140,0.22) 100%)" }}
                    />
                )}
            </Box>

            <Box sx={{ flex: "1 0 0", minWidth: 0, display: "flex", flexDirection: "column", gap: "24px", px: { xs: "4px", sm: "16px" }, py: "12px" }}>
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
                        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: stage.badge && stage.kind === "viva" ? "24px" : "12px" }}>
                            <Typography component="h2" sx={{ ...TYPE.headingSemibold20, color: COLORS.white, whiteSpace: "nowrap" }}>
                                {stage.title}
                            </Typography>
                            {stage.badge ? <StageBadgePill badge={stage.badge} /> : stage.action !== "download" && <InfoTooltip title={stage.info} />}
                        </Box>

                        {hasMeta && (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                                {stage.questions !== undefined && <MetaChip icon="icon-help-circle.svg" value={stage.questions} unit="questions" />}
                                {stage.durationMins !== undefined && <MetaChip icon="icon-clock.svg" value={stage.durationMins} unit="mins" />}
                                {stage.attemptsUsed !== undefined && (
                                    <MetaChip icon="icon-hash.svg" value={stage.attemptsUsed} unit={stage.attemptsUsed === 1 ? "Attempt" : "Attempts"} unitWeight={400} />
                                )}
                                {stage.mode && <MetaChip icon="icon-clock.svg" value={stage.mode} />}
                            </Box>
                        )}
                    </Box>

                    <StageAction stage={stage} handlers={handlers} />
                </Box>

                {stage.attempts.length > 0 && <AttemptsTray stage={stage} onViewReport={handlers.onViewReport} />}
            </Box>
        </Box>
    );
}

/** Vertical timeline of exam rounds (Technical Viva → MCQ → Practical Lab → Certificate). */
export default function ExamStageTimeline({ stages, handlers }: { stages: ExamStage[]; handlers: StageHandlers }) {
    return (
        <Box component="ol" sx={{ display: "flex", flexDirection: "column", gap: "32px", m: 0, p: 0 }}>
            {stages.map((stage, index) => (
                <StageRow key={stage.stageId} stage={stage} isLast={index === stages.length - 1} handlers={handlers} />
            ))}
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
