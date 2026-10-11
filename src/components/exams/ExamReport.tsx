"use client";

import React from "react";
import Image from "next/image";
import { Box, GlobalStyles, Link, Typography } from "@mui/material";
import { COLORS, FONTS, TYPE } from "@/components/courses/my-courses-theme";
import { PrimaryButton } from "@/components/courses/my-courses-ui";
import type { ExamAttemptReport, ExamReportQuestion } from "@/contexts/ExamContext";
import { examAsset, formatClock, formatLongDate, formatMarks, formatScore, ordinal } from "./exam-data";
import { EXAM_COLORS, IncludeChip, MetaChip, RequestStatusPill, TealPill, glassCardSx } from "./exam-ui";

export const REPORT_ELEMENT_ID = "exam-attempt-report";

const QUESTION_TYPE_LABEL: Record<ExamReportQuestion["questionType"], string> = {
    single_choice: "Single choice",
    multiple_choice: "Multiple choice",
    true_false: "True / False",
    viva: "Viva",
    hr: "HR",
    lab_task: "Lab task",
};

const SUBMIT_REASON: Record<string, string> = {
    timeout: "Auto-submitted when the time ran out",
    violations: "Auto-submitted after proctoring violations",
    admin: "Submitted by the examiner",
};

/** Prints only the report (light colours, no glass), so "Save as PDF" gives a clean result sheet. */
export const reportPrintStyles = (
    <GlobalStyles
        styles={{
            "@media print": {
                "@page": { size: "portrait", margin: "14mm" },
                "body *": { visibility: "hidden" },
                [`#${REPORT_ELEMENT_ID}, #${REPORT_ELEMENT_ID} *`]: {
                    visibility: "visible",
                    color: "#111 !important",
                    background: "transparent !important",
                    backgroundImage: "none !important",
                    boxShadow: "none !important",
                    backdropFilter: "none !important",
                },
                [`#${REPORT_ELEMENT_ID}`]: { position: "absolute", left: 0, top: 0, width: "100%" },
                [`#${REPORT_ELEMENT_ID} [data-print-hide]`]: { display: "none !important" },
                [`#${REPORT_ELEMENT_ID} [data-print-card]`]: { border: "1px solid #ccc", breakInside: "avoid" },
            },
        }}
    />
);

const cardSx = (angle = "171.908deg") => ({
    ...glassCardSx({ angle, radius: 24, innerShadow: "inset 0px 3px 6px 0px rgba(255,255,255,0.16)" }),
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
    p: { xs: "16px", sm: "24px" },
});

const labelSx = { ...TYPE.mediumMed16, color: COLORS.neutral300 };

function ResultPill({ report }: { report: ExamAttemptReport }) {
    if (report.attemptStatus === "voided") return <RequestStatusPill tone="locked" label="Cancelled" size="md" />;
    if (report.awaitingEvaluation) return <RequestStatusPill tone="ongoing" label="Under Evaluation" size="md" />;
    if (report.passed) return <TealPill label="Cleared" angle="94.308deg" />;
    return <RequestStatusPill tone="not-cleared" label="Not Cleared" size="md" />;
}

function SplitBar({ correct, incorrect, unanswered }: { correct: number; incorrect: number; unanswered: number }) {
    const total = Math.max(1, correct + incorrect + unanswered);
    const segments = [
        { value: correct, color: EXAM_COLORS.correct, label: "Correct" },
        { value: incorrect, color: EXAM_COLORS.incorrect, label: "Incorrect" },
        { value: unanswered, color: "rgba(166,166,166,0.6)", label: "Unanswered" },
    ];
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                {segments.map((s) => (
                    <Typography key={s.label} sx={{ ...TYPE.xsReg12, color: s.color }}>
                        {s.value} {s.label}
                    </Typography>
                ))}
            </Box>
            <Box sx={{ display: "flex", gap: "2px", height: 10, borderRadius: "99px", overflow: "hidden", bgcolor: EXAM_COLORS.trackFill }}>
                {segments
                    .filter((s) => s.value > 0)
                    .map((s) => (
                        <Box key={s.label} sx={{ flex: `${s.value / total} 0 0`, bgcolor: s.color, borderRadius: "50px" }} />
                    ))}
            </Box>
        </Box>
    );
}

function QuestionCard({ question }: { question: ExamReportQuestion }) {
    const scored = question.marksAwarded !== undefined;
    const answer = question.answer;
    const tone =
        question.isCorrect === true ? EXAM_COLORS.correct : question.isCorrect === false ? EXAM_COLORS.incorrect : !answer.answered ? COLORS.neutral500 : EXAM_COLORS.panelStroke;

    return (
        <Box data-print-card sx={{ ...cardSx("167.248deg"), gap: "12px" }}>
            <Box aria-hidden sx={{ position: "absolute", left: 0, top: 24, bottom: 24, width: 3, borderRadius: "0 3px 3px 0", bgcolor: tone }} />
            <Box sx={{ position: "relative", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <Typography sx={{ ...TYPE.mediumSemibold16, color: COLORS.white }}>Q{question.position}</Typography>
                <IncludeChip label={QUESTION_TYPE_LABEL[question.questionType]} />
                {question.section && <IncludeChip label={question.section} />}
                <Box sx={{ flex: 1 }} />
                {scored && (
                    <Typography sx={{ ...TYPE.smallSemibold14, color: tone }}>
                        {formatMarks(question.marksAwarded)} / {formatMarks(question.maxMarks)} marks
                    </Typography>
                )}
            </Box>

            <Typography sx={{ position: "relative", ...TYPE.mediumMed16, color: COLORS.neutral75, whiteSpace: "pre-wrap" }}>{question.prompt}</Typography>
            {question.scenario && (
                <Typography sx={{ position: "relative", ...TYPE.smallMed14, color: COLORS.neutral200, whiteSpace: "pre-wrap" }}>{question.scenario}</Typography>
            )}
            {question.code && (
                <Box
                    component="pre"
                    sx={{ position: "relative", m: 0, p: "12px", borderRadius: "12px", bgcolor: "rgba(0,0,0,0.45)", color: COLORS.neutral100, fontSize: 13, overflowX: "auto", fontFamily: "ui-monospace, monospace" }}
                >
                    {question.code}
                </Box>
            )}
            {question.imageUrl && <Box component="img" src={question.imageUrl} alt="" sx={{ position: "relative", maxWidth: "100%", maxHeight: 260, borderRadius: "12px", alignSelf: "flex-start" }} />}

            {question.options.length > 0 ? (
                <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {question.options.map((option, index) => {
                        const correct = option.isCorrect === true;
                        const wrongPick = option.selected && option.isCorrect === false;
                        return (
                            <Box
                                key={option.optionId}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    px: "12px",
                                    py: "8px",
                                    borderRadius: "10px",
                                    border: "1px solid",
                                    borderColor: correct ? "rgba(66,204,66,0.6)" : wrongPick ? "rgba(209,41,61,0.6)" : option.selected ? EXAM_COLORS.panelStroke : EXAM_COLORS.softStroke,
                                    bgcolor: option.selected ? "rgba(80,138,242,0.08)" : "transparent",
                                }}
                            >
                                <Typography sx={{ ...TYPE.smallSemibold14, color: COLORS.neutral300, width: 18 }}>{String.fromCharCode(65 + index)}</Typography>
                                <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral75, flex: 1 }}>{option.optionText}</Typography>
                                {option.selected && <Typography sx={{ ...TYPE.xsMed12, color: COLORS.neutral200 }}>Your answer</Typography>}
                                {correct && <Typography sx={{ ...TYPE.xsMed12, color: EXAM_COLORS.correct }}>Correct</Typography>}
                            </Box>
                        );
                    })}
                    {!answer.answered && <Typography sx={{ ...TYPE.xsReg12, color: COLORS.neutral400 }}>Not answered</Typography>}
                </Box>
            ) : (
                <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Typography sx={labelSx}>Your answer</Typography>
                    {answer.answerText ? (
                        <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral75, whiteSpace: "pre-wrap" }}>{answer.answerText}</Typography>
                    ) : (
                        !answer.answerAudioUrl &&
                        !answer.attachmentUrls.length &&
                        !answer.capturedFlags.length && <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral400 }}>Not answered</Typography>
                    )}
                    {answer.answerAudioUrl && <Box data-print-hide component="audio" controls src={answer.answerAudioUrl} sx={{ width: "100%", maxWidth: 420 }} />}
                    {answer.attachmentUrls.map((url, i) => (
                        <Link key={url} href={url} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ ...TYPE.smallMed14, color: EXAM_COLORS.link }}>
                            Attachment {i + 1}
                        </Link>
                    ))}
                    {answer.capturedFlags.length > 0 && (
                        <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral200 }}>Flags captured: {answer.capturedFlags.join(", ")}</Typography>
                    )}
                </Box>
            )}

            {(question.feedback || question.evaluatorRemarks) && (
                <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "6px", p: "12px", borderRadius: "12px", bgcolor: "rgba(140,36,255,0.08)" }}>
                    <Typography sx={labelSx}>Feedback</Typography>
                    {question.feedback && <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral75, whiteSpace: "pre-wrap" }}>{question.feedback}</Typography>}
                    {question.evaluatorRemarks && (
                        <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral100, whiteSpace: "pre-wrap" }}>Examiner: {question.evaluatorRemarks}</Typography>
                    )}
                </Box>
            )}

            {Boolean(question.explanation || question.expectedAnswer || question.keyPointsMissed?.length || question.keyPointsCovered?.length) && (
                <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "6px", p: "12px", borderRadius: "12px", bgcolor: EXAM_COLORS.successFill }}>
                    {question.explanation && <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral75, whiteSpace: "pre-wrap" }}>{question.explanation}</Typography>}
                    {question.expectedAnswer && (
                        <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral75, whiteSpace: "pre-wrap" }}>Expected answer: {question.expectedAnswer}</Typography>
                    )}
                    {question.keyPointsCovered && question.keyPointsCovered.length > 0 && (
                        <Typography sx={{ ...TYPE.xsReg12, color: EXAM_COLORS.correct }}>Covered: {question.keyPointsCovered.join(" · ")}</Typography>
                    )}
                    {question.keyPointsMissed && question.keyPointsMissed.length > 0 && (
                        <Typography sx={{ ...TYPE.xsReg12, color: "#FB8600" }}>Missed: {question.keyPointsMissed.join(" · ")}</Typography>
                    )}
                </Box>
            )}
        </Box>
    );
}

/** Detailed result of one attempt (what the round's revealMode allows the student to see). */
export default function ExamReport({ report, examTitle, onDownload }: { report: ExamAttemptReport; examTitle: string; onDownload: () => void }) {
    const summary = report.summary;
    const submittedOn = report.submittedAt ?? report.startedAt;

    return (
        <Box id={REPORT_ELEMENT_ID} sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {reportPrintStyles}

            <Box data-print-card sx={{ ...cardSx(), gap: "20px" }}>
                <Box sx={{ position: "relative", display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "center" }, justifyContent: "space-between", gap: "16px" }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
                        <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral300 }}>{examTitle}</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                            <Typography component="h2" sx={{ ...TYPE.headingSemibold24, color: COLORS.white }}>
                                {report.roundTitle} · {ordinal(report.attemptNumber)} Attempt
                            </Typography>
                            <ResultPill report={report} />
                        </Box>
                        <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral200 }}>
                            {formatLongDate(submittedOn)}
                            {report.submitReason && SUBMIT_REASON[report.submitReason] ? ` · ${SUBMIT_REASON[report.submitReason]}` : ""}
                        </Typography>
                    </Box>
                    {report.attemptStatus === "evaluated" && (
                        <Box data-print-hide>
                            <PrimaryButton icon={examAsset("icon-download-alt.svg")} onClick={onDownload}>
                                Download Result
                            </PrimaryButton>
                        </Box>
                    )}
                </Box>

                <Box sx={{ position: "relative", display: "flex", flexWrap: "wrap", gap: "12px" }}>
                    <MetaChip icon="icon-clock.svg" value={formatClock(report.timeTakenSec)} unit="time taken" />
                    {summary && <MetaChip icon="icon-hash.svg" value={formatScore(summary.scorePct)} unit={`score · pass ${summary.passingPct}%`} unitWeight={400} />}
                    {summary && <MetaChip icon="icon-help-circle.svg" value={`${formatMarks(summary.obtainedMarks)} / ${formatMarks(summary.maxMarks)}`} unit="marks" />}
                    {summary && <MetaChip icon="icon-help-circle.svg" value={`${summary.answeredCount} / ${summary.totalQuestions}`} unit="answered" />}
                </Box>

                {summary && report.roundType === "mcq" && (
                    <Box sx={{ position: "relative" }}>
                        <SplitBar correct={summary.correctCount} incorrect={summary.incorrectCount} unanswered={summary.unansweredCount} />
                    </Box>
                )}

                {report.awaitingEvaluation && (
                    <Typography sx={{ position: "relative", ...TYPE.smallMed14, color: COLORS.neutral200 }}>
                        Your answers are being evaluated. Marks and feedback appear here as soon as the result is published.
                    </Typography>
                )}
                {report.attemptStatus === "evaluated" && !summary && (
                    <Typography sx={{ position: "relative", ...TYPE.smallMed14, color: COLORS.neutral200 }}>
                        Detailed results aren&apos;t shared for this round — only whether you cleared it.
                    </Typography>
                )}
                {report.attemptStatus === "voided" && (
                    <Typography sx={{ position: "relative", ...TYPE.smallMed14, color: COLORS.neutral200 }}>
                        The examiner cancelled this attempt. If it was refunded it doesn&apos;t count towards your attempts.
                    </Typography>
                )}
                {report.evaluatorRemarks && (
                    <Box sx={{ position: "relative", p: "12px", borderRadius: "12px", bgcolor: "rgba(80,138,242,0.08)" }}>
                        <Typography sx={labelSx}>Examiner remarks</Typography>
                        <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral75, whiteSpace: "pre-wrap" }}>{report.evaluatorRemarks}</Typography>
                    </Box>
                )}
            </Box>

            {report.sections.length > 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <Typography component="h3" sx={labelSx}>
                        SECTION SUMMARY
                    </Typography>
                    <Box sx={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))" }}>
                        {report.sections.map((section) => (
                            <Box key={section.section} data-print-card sx={{ ...cardSx("167.248deg"), gap: "8px" }}>
                                <Typography sx={{ position: "relative", ...TYPE.mediumSemibold16, color: COLORS.white }} noWrap>
                                    {section.section}
                                </Typography>
                                <Typography sx={{ position: "relative", ...TYPE.smallMed14, color: COLORS.neutral200 }}>
                                    {section.attempted}/{section.total} attempted
                                    {report.roundType === "mcq" ? ` · ${section.correct} correct` : ""}
                                </Typography>
                                <Typography sx={{ position: "relative", fontFamily: FONTS.poppins, fontWeight: 600, fontSize: 20, color: COLORS.white }}>
                                    {formatMarks(section.marks)}
                                    <Typography component="span" sx={{ ...TYPE.smallMed14, color: COLORS.neutral300 }}>
                                        {" "}
                                        / {formatMarks(section.maxMarks)} marks
                                    </Typography>
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {report.questions.length > 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Typography component="h3" sx={labelSx}>
                            {report.roundType === "lab" ? "LAB TASKS" : "QUESTIONS"}
                        </Typography>
                        {report.revealMode === "score_only" && report.attemptStatus === "evaluated" && (
                            <Typography sx={{ ...TYPE.xsReg12, color: COLORS.neutral400 }}>· correct answers aren&apos;t revealed for this round</Typography>
                        )}
                    </Box>
                    {report.questions.map((question) => (
                        <QuestionCard key={question.questionId} question={question} />
                    ))}
                </Box>
            )}

            <Box data-print-hide sx={{ display: "flex", alignItems: "center", gap: "8px", color: COLORS.neutral400 }}>
                <Image src={examAsset("icon-info.svg")} alt="" width={16} height={16} />
                <Typography sx={{ ...TYPE.xsReg12, color: COLORS.neutral400 }}>Results are final once published. Contact your coordinator if something looks wrong.</Typography>
            </Box>
        </Box>
    );
}
