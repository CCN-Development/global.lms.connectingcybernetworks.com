"use client";

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from "react";
import axiosHandler from "@/lib/enhanced-axios";
import type { StandardResponse } from "./AuthContext";
import type { AssetUploadTicket, ContentBlock, ContentStatus, CourseTheme, LabProvider, ProgressionMode } from "./CourseContext";

/* ================================================================ enums */
// Mirror the VarChar values documented in prisma/schema/exams.prisma (validated by src/constants/exam.constants.ts).

/** Exam lifecycle — same values as course `ContentStatus`. */
export type ExamPublishStatus = ContentStatus;
export type ExamUnlockRule = "course_completed" | "progress_pct" | "always" | "manual";
/** sequential: round N opens once every earlier mandatory round is passed. */
export type RoundProgression = ProgressionMode;
export type ExamRoundType = "viva" | "mcq" | "lab" | "hr";
export type DeliveryMode = "online" | "offline";
export type MsqScoring = "all_or_nothing" | "partial";
export type ExamEvaluationMode = "auto" | "ai" | "ai_assisted" | "manual";
/** score_only (default): marks + feedback, never the answer key. */
export type ExamRevealMode = "score_only" | "after_evaluation" | "never";
export type ProctoringMode = "none" | "basic" | "strict";
export type ExamSetStatus = "draft" | "published" | "retired";
export type ExamQuestionType = "single_choice" | "multiple_choice" | "true_false" | "viva" | "hr" | "lab_task";
export type ExamLabProvider = LabProvider;
export type ExamLabVerificationMode = "flag" | "ai" | "manual";
export type CandidateStatus = "locked" | "ongoing" | "re_exam" | "blocked" | "completed";
export type UnlockOverride = "unlocked" | "locked";
export type RoundStatus = "locked" | "eligible" | "in_progress" | "under_review" | "failed" | "exhausted" | "passed";
export type ExamAttemptStatus = "in_progress" | "submitted" | "evaluated" | "voided";
export type ExamResultStatus = "pending" | "passed" | "failed";
export type SubmitReason = "student" | "timeout" | "violations" | "admin";
export type AiEvaluationStatus = "not_required" | "pending" | "processing" | "completed" | "failed";
/** How one answer gets its marks: auto (choice / lab flags), ai, or an evaluator. */
export type EvaluationPath = "auto" | "ai" | "manual";
export type CertificateStatus = "issued" | "revoked";
export type ExamAuditEvent =
    | "attempt_started"
    | "attempt_resumed"
    | "attempt_submitted"
    | "attempt_auto_submitted"
    | "attempt_evaluated"
    | "attempt_voided"
    | "violation"
    | "proctor_event"
    | "ai_evaluated"
    | "ai_failed"
    | "ai_requeued"
    | "response_evaluated"
    | "attempts_granted"
    | "cooldown_waived"
    | "unlock_override"
    | "certificate_issued"
    | "certificate_revoked"
    | "certificate_reinstated";
export type ProctorEventType =
    | "tab_switch"
    | "window_blur"
    | "fullscreen_exit"
    | "copy_paste"
    | "multiple_faces"
    | "no_face"
    | "camera_off"
    | "network_lost"
    | "app_switch"
    | "other";
export type AnswerUploadKind = "audio" | "attachment";

/** Student exam card / header status — same values as the UI's `ExamStatus` (components/exams/exam-data.ts). */
export type ExamUiStatus = "ongoing" | "locked" | "completed" | "re-exam";
export type StageKind = ExamRoundType | "certificate";
export type StageBadge = "eligible" | "not-cleared";
/** Call-to-action of a round on the student timeline. */
export type StageAction =
    | "start"
    | "retake"
    | "resume"
    | "under-review"
    | "cooldown"
    | "awaiting-set"
    | "centre"
    | "exhausted"
    | "locked"
    | "download";
export type CertificateStageAction = "view-certificate" | "locked";
export type AdminAttemptStatusFilter = ExamAttemptStatus | "needs_review" | "ai_failed";

/** Question types each round type accepts (mirrors ROUND_QUESTION_TYPES on the API). */
export const ROUND_QUESTION_TYPES: Record<ExamRoundType, readonly ExamQuestionType[]> = {
    mcq: ["single_choice", "multiple_choice", "true_false"],
    viva: ["viva"],
    hr: ["hr"],
    lab: ["lab_task"],
};
/** Evaluation modes each round type accepts (mirrors ROUND_EVALUATION_MODES on the API). */
export const ROUND_EVALUATION_MODES: Record<ExamRoundType, readonly ExamEvaluationMode[]> = {
    mcq: ["auto"],
    viva: ["ai", "ai_assisted", "manual"],
    hr: ["ai", "ai_assisted", "manual"],
    lab: ["auto", "ai", "ai_assisted", "manual"],
};
export const CHOICE_QUESTION_TYPES: readonly ExamQuestionType[] = ["single_choice", "multiple_choice", "true_false"];

/* ======================================================= schema records */
// Raw Prisma rows as returned by the admin API (dates are ISO strings).

export interface ExamRecord {
    examId: string;
    courseId: string;
    title: string;
    description: string | null;
    instructions: string[];
    examStatus: ExamPublishStatus;
    unlockRule: ExamUnlockRule;
    unlockProgressPct: number | null;
    roundProgression: RoundProgression;
    certificateTitle: string;
    certificatePrefix: string;
    certificateValidityMonths: number | null;
    signatoryName: string | null;
    signatoryTitle: string | null;
    signatoryOrganisation: string | null;
    signatureUrl: string | null;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ExamRoundRecord {
    roundId: string;
    examId: string;
    roundType: ExamRoundType;
    title: string;
    info: string | null;
    instructions: string[];
    sortOrder: number;
    isMandatory: boolean;
    deliveryMode: DeliveryMode;
    /** false = only an admin / evaluator can start the attempt (offline, in-centre). */
    selfStart: boolean;
    durationSec: number | null;
    maxAttempts: number | null;
    retakeCooldownMin: number;
    allowResume: boolean;
    passingPct: number;
    defaultMarks: number;
    defaultNegativeMarks: number;
    msqScoring: MsqScoring;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    evaluationMode: ExamEvaluationMode;
    revealMode: ExamRevealMode;
    proctoringMode: ProctoringMode;
    maxViolations: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface ExamSetRecord {
    setId: string;
    roundId: string;
    examId: string;
    code: string;
    title: string | null;
    setStatus: ExamSetStatus;
    clonedFromSetId: string | null;
    questionCount: number;
    totalMarks: number;
    servedCount: number;
    publishedAt: string | null;
    retiredAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ExamQuestionOptionRecord {
    optionId: string;
    questionId: string;
    optionText: string;
    imageUrl: string | null;
    isCorrect: boolean;
    sortOrder: number;
}

/** Flags are stored hashed; the API only returns label + marks. */
export interface ExamLabFlagSummary {
    flagId: string;
    label: string;
    marks: number;
    sortOrder?: number;
}

export interface ExamQuestionRecord {
    questionId: string;
    setId: string;
    questionType: ExamQuestionType;
    section: string | null;
    prompt: string;
    scenario: string | null;
    code: string | null;
    codeLanguage: string | null;
    imageUrl: string | null;
    /** null = round.defaultMarks */
    marks: number | null;
    /** null = round.defaultNegativeMarks (choice questions only) */
    negativeMarks: number | null;
    sortOrder: number;
    explanation: string | null;
    expectedAnswer: string | null;
    keyPoints: string[];
    evaluationGuide: string | null;
    answerTimeLimitSec: number | null;
    taskBlocks: ContentBlock[] | null;
    solutionBlocks: ContentBlock[] | null;
    labProvider: ExamLabProvider | null;
    launchUrl: string | null;
    environmentTemplateId: string | null;
    tools: string[];
    verificationMode: ExamLabVerificationMode | null;
    createdAt: string;
    updatedAt: string;
}

export interface ExamQuestionWithOptions extends ExamQuestionRecord {
    options: ExamQuestionOptionRecord[];
}

export interface ExamCandidateRecord {
    candidateId: string;
    examId: string;
    studentId: string;
    courseId: string;
    candidateStatus: CandidateStatus;
    unlockOverride: UnlockOverride | null;
    activeAttemptId: string | null;
    unlockedAt: string | null;
    startedAt: string | null;
    lastAttemptAt: string | null;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ExamRoundProgressRecord {
    progressId: string;
    candidateId: string;
    roundId: string;
    studentId: string;
    examId: string;
    roundStatus: RoundStatus;
    attemptsUsed: number;
    extraAttempts: number;
    bestScorePct: number | null;
    lastScorePct: number | null;
    lastAttemptId: string | null;
    passedAttemptId: string | null;
    cooldownUntil: string | null;
    cooldownWaivedAt: string | null;
    lastAttemptAt: string | null;
    passedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ExamAttemptRecord {
    attemptId: string;
    examId: string;
    roundId: string;
    setId: string;
    candidateId: string;
    studentId: string;
    roundType: ExamRoundType;
    attemptNumber: number;
    attemptStatus: ExamAttemptStatus;
    submitReason: SubmitReason | null;
    resultStatus: ExamResultStatus;
    countsTowardsLimit: boolean;
    startedByRole: string;
    startedById: string | null;
    durationSec: number | null;
    passingPct: number;
    msqScoring: MsqScoring;
    evaluationMode: ExamEvaluationMode;
    revealMode: ExamRevealMode;
    maxViolations: number | null;
    startedAt: string;
    deadlineAt: string | null;
    lastSeenAt: string;
    submittedAt: string | null;
    evaluatedAt: string | null;
    timeTakenSec: number | null;
    resumeCount: number;
    totalQuestions: number;
    answeredCount: number;
    correctCount: number;
    incorrectCount: number;
    maxMarks: number;
    obtainedMarks: number | null;
    scorePct: number | null;
    aiEvaluationStatus: AiEvaluationStatus;
    aiEvaluationTries: number;
    aiEvaluationError: string | null;
    aiClaimedAt: string | null;
    evaluatedByRole: string | null;
    evaluatedById: string | null;
    evaluatorRemarks: string | null;
    violationCount: number;
    clientIp: string | null;
    userAgent: string | null;
    machineCode: string | null;
    voidedAt: string | null;
    voidedById: string | null;
    voidedByRole: string | null;
    voidReason: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ExamAttemptResponseRecord {
    attemptId: string;
    questionId: string;
    position: number;
    optionOrder: string[];
    maxMarks: number;
    negativeMarks: number;
    selectedOptionIds: string[];
    answerText: string | null;
    answerAudioUrl: string | null;
    attachmentUrls: string[];
    capturedFlagIds: string[];
    wrongFlagSubmits: number;
    isMarkedForReview: boolean;
    firstVisitedAt: string | null;
    answeredAt: string | null;
    timeSpentSec: number;
    isCorrect: boolean | null;
    aiScorePct: number | null;
    aiFeedback: string | null;
    aiKeyPointsCovered: string[];
    aiKeyPointsMissed: string[];
    aiModel: string | null;
    aiEvaluatedAt: string | null;
    evaluatorMarks: number | null;
    evaluatorRemarks: string | null;
    evaluatedById: string | null;
    evaluatedByRole: string | null;
    evaluatedAt: string | null;
    marksAwarded: number | null;
    updatedAt: string;
}

export interface ExamAuditLogRecord {
    logId: string;
    candidateId: string;
    attemptId: string | null;
    roundId: string | null;
    eventType: ExamAuditEvent;
    detail: Record<string, unknown> | null;
    actorRole: string;
    actorId: string | null;
    createdAt: string;
}

export interface CertificateSignatory {
    name: string | null;
    title: string | null;
    organisation: string | null;
    signatureUrl: string | null;
}

export interface CertificateRoundScore {
    roundId: string;
    title: string;
    roundType: ExamRoundType;
    scorePct: number | null;
    attemptNumber: number;
}

export interface ExamCertificateRecord {
    certificateId: string;
    /** Public verification id printed on the certificate ("CCN-CERT-26xxxxxx"). */
    certificateNo: string;
    examId: string;
    candidateId: string;
    studentId: string;
    courseId: string;
    candidateName: string;
    courseName: string;
    courseShort: string;
    title: string;
    signatory: Partial<CertificateSignatory> | null;
    roundScores: CertificateRoundScore[] | null;
    issuedAt: string;
    validUntil: string | null;
    certificateStatus: CertificateStatus;
    revokedAt: string | null;
    revokedReason: string | null;
    revokedById: string | null;
    createdAt: string;
    updatedAt: string;
}

/* ======================================================== shared shapes */

export interface PaginatedResult<T> {
    total: number;
    page: number;
    pageSize: number;
    items: T[];
}

export interface ExamUnlockState {
    unlocked: boolean;
    /** Why the exam is still locked ("Complete the course to unlock this exam"). */
    reason: string | null;
    courseProgressPct: number;
    courseCompleted: boolean;
}

/** Derived per-round state (ExamRoundProgress recomputed from attempts). */
export interface ExamRoundState {
    roundId: string;
    roundStatus: RoundStatus;
    attemptsUsed: number;
    extraAttempts: number;
    /** null = unlimited */
    attemptsAllowed: number | null;
    attemptsLeft: number | null;
    bestScorePct: number | null;
    lastScorePct: number | null;
    lastAttemptId: string | null;
    passedAttemptId: string | null;
    passedAt: string | null;
    cooldownUntil: string | null;
    cooldownWaivedAt: string | null;
    lastAttemptAt: string | null;
    inProgressAttemptId: string | null;
    underReviewAttemptId: string | null;
}

/* =================================================== student responses */

/** Card on the Exam list (GET /student-exam/exams). */
export interface StudentExamCard {
    examId: string;
    courseId: string;
    slug: string | null;
    title: string;
    courseName: string;
    courseShort: string;
    emblemUrl: string | null;
    theme: CourseTheme;
    status: ExamUiStatus;
    candidateStatus: CandidateStatus;
    /** Round titles ("Technical Viva", "MCQ Exam", …). */
    includes: string[];
    roundsPassed: number;
    totalRounds: number;
    activeAttemptId: string | null;
    certificateNo: string | null;
}

/** One past attempt card on the timeline. */
export interface StudentStageAttempt {
    attemptId: string;
    attemptNo: number;
    /** yyyy-mm-dd */
    date: string;
    startedAt: string;
    submittedAt: string | null;
    timeTakenSec: number | null;
    /** hh:mm:ss */
    timeTaken: string | null;
    attemptStatus: ExamAttemptStatus;
    resultStatus: ExamResultStatus;
    passed: boolean | null;
    awaitingEvaluation: boolean;
    /** null while pending or when the round's revealMode is "never". */
    scorePct: number | null;
    correctPct: number | null;
}

export interface StudentRoundStage {
    stageId: string;
    roundId: string;
    kind: ExamRoundType;
    title: string;
    info: string | null;
    instructions: string[];
    isMandatory: boolean;
    questions: number;
    questionUnit: "questions" | "labs";
    durationMins: number | null;
    mode: "Online" | "Offline";
    selfStart: boolean;
    passingPct: number;
    roundStatus: RoundStatus;
    action: StageAction;
    badge: StageBadge | null;
    attemptsUsed: number;
    attemptsAllowed: number | null;
    attemptsLeft: number | null;
    /** Only set while the cooldown is still running. */
    cooldownUntil: string | null;
    inProgressAttemptId: string | null;
    bestScorePct: number | null;
    attempts: StudentStageAttempt[];
}

export interface StudentCertificateStage {
    stageId: "certificate";
    kind: "certificate";
    title: string;
    info: string;
    action: CertificateStageAction;
    attempts: [];
}

export type StudentExamStage = StudentRoundStage | StudentCertificateStage;

/** Certificate as printed (same fields as the UI's `ExamCertificate`). */
export interface ExamCertificateView {
    /** Same as certificateNo (kept for the existing UI shape). */
    certificateId: string;
    certificateNo: string;
    status: CertificateStatus;
    title: string;
    candidate: string;
    courseName: string;
    courseShort: string;
    /** yyyy-mm-dd */
    issueDate: string;
    validThrough: string | null;
    signatory: CertificateSignatory;
    roundScores: CertificateRoundScore[] | null;
    verifyHost: string;
}

/** Exam timeline (GET /student-exam/exams/:examId). */
export interface StudentExamDetail {
    examId: string;
    courseId: string;
    slug: string | null;
    title: string;
    courseName: string;
    courseShort: string;
    description: string | null;
    instructions: string[];
    status: ExamUiStatus;
    candidateStatus: CandidateStatus;
    unlock: ExamUnlockState;
    roundProgression: RoundProgression;
    activeAttemptId: string | null;
    stages: StudentExamStage[];
    certificate: ExamCertificateView | null;
}

export interface ExamAttemptOption {
    optionId: string;
    optionText: string;
    imageUrl: string | null;
}

export interface ExamAttemptLabFlag {
    flagId: string;
    label: string;
    marks: number;
    captured: boolean;
}

export interface ExamAttemptLab {
    taskBlocks: ContentBlock[] | null;
    labProvider: ExamLabProvider | null;
    launchUrl: string | null;
    tools: string[];
    verificationMode: ExamLabVerificationMode | null;
    flags: ExamAttemptLabFlag[];
}

export interface ExamAttemptQuestionResponse {
    selectedOptionIds: string[];
    answerText: string | null;
    answerAudioUrl: string | null;
    attachmentUrls: string[];
    isMarkedForReview: boolean;
    visited: boolean;
    answered: boolean;
    timeSpentSec: number;
}

/** A served question — never contains the answer key. */
export interface ExamAttemptQuestion {
    questionId: string;
    position: number;
    questionType: ExamQuestionType;
    section: string | null;
    prompt: string;
    scenario: string | null;
    code: string | null;
    codeLanguage: string | null;
    imageUrl: string | null;
    marks: number;
    negativeMarks: number;
    answerTimeLimitSec: number | null;
    /** Served (possibly shuffled) order. */
    options: ExamAttemptOption[];
    lab: ExamAttemptLab | null;
    response: ExamAttemptQuestionResponse;
}

/** Question-palette counters (same buckets as the exam portal). */
export interface ExamAttemptPaletteSummary {
    total: number;
    answered: number;
    answeredAndMarked: number;
    markedForReview: number;
    notAnswered: number;
    notVisited: number;
}

/** In-progress attempt (start / resume / GET while in_progress). */
export interface ExamAttemptView {
    attemptId: string;
    examId: string;
    roundId: string;
    roundType: ExamRoundType;
    roundTitle: string;
    instructions: string[];
    attemptNumber: number;
    attemptStatus: "in_progress";
    startedAt: string;
    deadlineAt: string | null;
    /** Server clock at response time — use it (not the device clock) for the countdown. */
    serverTime: string;
    durationSec: number | null;
    remainingSec: number | null;
    allowResume: boolean;
    proctoring: { mode: ProctoringMode; maxViolations: number | null; violationCount: number };
    marking: { maxMarks: number; passingPct: number; msqScoring: MsqScoring };
    sections: string[];
    summary: ExamAttemptPaletteSummary;
    questions: ExamAttemptQuestion[];
}

export interface ExamAttemptResult {
    status: ExamResultStatus | "voided";
    passed: boolean | null;
    awaitingEvaluation: boolean;
    aiEvaluationStatus: AiEvaluationStatus;
    totalQuestions: number;
    answeredCount: number;
    // Present once evaluated (and revealMode ≠ "never").
    scorePct?: number | null;
    obtainedMarks?: number | null;
    maxMarks?: number;
    correctCount?: number;
    incorrectCount?: number;
}

/** Finished attempt (submit / GET once submitted). */
export interface ExamAttemptResultSummary {
    attemptId: string;
    examId: string;
    roundId: string;
    roundType: ExamRoundType;
    attemptNumber: number;
    attemptStatus: Exclude<ExamAttemptStatus, "in_progress">;
    submitReason: SubmitReason | null;
    startedAt: string;
    submittedAt: string | null;
    evaluatedAt: string | null;
    timeTakenSec: number | null;
    result: ExamAttemptResult;
}

/** GET /attempts/:attemptId and start/resume return either shape. */
export type ExamAttemptPayload = ExamAttemptView | ExamAttemptResultSummary;

export function isAttemptInProgress(payload: ExamAttemptPayload | null | undefined): payload is ExamAttemptView {
    return Boolean(payload && payload.attemptStatus === "in_progress" && "questions" in payload);
}

export interface SaveResponsesResult {
    saved: number;
    answeredCount: number;
    totalQuestions: number;
    serverTime: string;
    remainingSec: number | null;
}

export interface ExamHeartbeatResult {
    attemptStatus: ExamAttemptStatus;
    remainingSec: number | null;
    serverTime: string;
    autoSubmitted: boolean;
}

export type ProctorEventResult =
    | { recorded: false; attemptStatus: ExamAttemptStatus }
    | {
        recorded: true;
        isViolation: boolean;
        violationCount: number;
        maxViolations: number | null;
        warningsLeft: number | null;
        autoSubmitted: boolean;
    };

export type LabFlagSubmitResult =
    | { correct: false; capturedCount: number; totalFlags: number }
    | { correct: true; alreadyCaptured: boolean; flagId: string; label: string; capturedCount: number; totalFlags: number };

export interface ExamReportOption extends ExamAttemptOption {
    selected: boolean;
    /** Only with revealMode "after_evaluation". */
    isCorrect?: boolean;
}

export interface ExamReportQuestion {
    questionId: string;
    position: number;
    questionType: ExamQuestionType;
    section: string | null;
    prompt: string;
    scenario: string | null;
    code: string | null;
    codeLanguage: string | null;
    imageUrl: string | null;
    options: ExamReportOption[];
    answer: {
        selectedOptionIds: string[];
        answerText: string | null;
        answerAudioUrl: string | null;
        attachmentUrls: string[];
        /** Labels of captured lab flags. */
        capturedFlags: string[];
        answered: boolean;
        timeSpentSec: number;
    };
    // Once evaluated (revealMode ≠ "never")
    marksAwarded?: number | null;
    maxMarks?: number;
    isCorrect?: boolean | null;
    feedback?: string | null;
    evaluatorRemarks?: string | null;
    // revealMode "after_evaluation" only
    explanation?: string | null;
    expectedAnswer?: string | null;
    keyPoints?: string[];
    keyPointsCovered?: string[];
    keyPointsMissed?: string[];
}

export interface ExamReportSection {
    section: string;
    total: number;
    attempted: number;
    correct: number;
    marks: number;
    maxMarks: number;
}

/** "View Detailed Report" (GET /attempts/:attemptId/report). */
export interface ExamAttemptReport {
    attemptId: string;
    roundId: string;
    roundTitle: string;
    roundType: ExamRoundType;
    attemptNumber: number;
    attemptStatus: Exclude<ExamAttemptStatus, "in_progress">;
    submitReason: SubmitReason | null;
    startedAt: string;
    submittedAt: string | null;
    evaluatedAt: string | null;
    timeTakenSec: number | null;
    timeTaken: string | null;
    revealMode: ExamRevealMode;
    passed: boolean | null;
    awaitingEvaluation: boolean;
    evaluatorRemarks: string | null;
    summary: {
        scorePct: number | null;
        obtainedMarks: number | null;
        maxMarks: number;
        passingPct: number;
        totalQuestions: number;
        answeredCount: number;
        correctCount: number;
        incorrectCount: number;
        unansweredCount: number;
    } | null;
    sections: ExamReportSection[];
    questions: ExamReportQuestion[];
}

/** Public verification (GET /certificates/verify/:certificateNo). */
export interface CertificateVerification {
    certificateNo: string;
    valid: boolean;
    status: "verified" | "expired" | "revoked";
    candidateName: string;
    courseName: string;
    title: string;
    issueDate: string;
    validThrough: string | null;
}

/* ===================================================== admin responses */

export interface ExamCourseRef {
    courseId: string;
    courseName: string;
    shortTitle: string | null;
    slug: string | null;
}

export interface AdminExamListItem extends ExamRecord {
    course: ExamCourseRef;
    rounds: Pick<ExamRoundRecord, "roundId" | "roundType" | "title">[];
    _count: { candidates: number; certificates: number };
}

export interface ExamWithRounds extends ExamRecord {
    rounds: ExamRoundRecord[];
}

export interface AdminRoundStats {
    publishedSets: number;
    pendingReview: number;
    inProgress: number;
    /** Students with attempts left who have already seen every published set. */
    studentsAwaitingNewSet: number;
}

export interface AdminExamTreeRound extends ExamRoundRecord {
    sets: ExamSetRecord[];
    stats: AdminRoundStats;
}

/** GET /exam-admin/exams/:examId — everything the exam builder + dashboard needs. */
export interface AdminExamTree extends ExamRecord {
    course: ExamCourseRef & { contentStatus: ContentStatus };
    aiConfigured: boolean;
    stats: { candidatesByStatus: Partial<Record<CandidateStatus, number>> };
    rounds: AdminExamTreeRound[];
}

export interface ExamPublishCheck {
    canPublish: boolean;
    errors: string[];
    warnings: string[];
}

export interface AdminExamQuestion extends ExamQuestionWithOptions {
    flags: ExamLabFlagSummary[];
}

/** GET /exam-admin/sets/:setId — full set incl. answer keys (never flag hashes). */
export interface AdminExamSetDetail extends ExamSetRecord {
    round: ExamRoundRecord;
    questions: AdminExamQuestion[];
}

export interface ExamStudentRef {
    studentId: string;
    studentName: string;
    email: string | null;
    phoneNumber: string;
    studentRegistrationNumber: string | null;
    studentPhoto: string | null;
}

export interface AdminCandidateListItem extends ExamCandidateRecord {
    student: ExamStudentRef;
    roundProgresses: ExamRoundProgressRecord[];
    certificate: Pick<ExamCertificateRecord, "certificateNo" | "certificateStatus" | "issuedAt"> | null;
}

export interface AdminCandidateDetail {
    student: ExamStudentRef & { isActive: boolean; isDropped: boolean };
    candidate: ExamCandidateRecord;
    unlock: ExamUnlockState;
    rounds: { round: ExamRoundRecord; state: ExamRoundState }[];
    certificate: ExamCertificateRecord | null;
    attempts: (ExamAttemptRecord & { set: { code: string } })[];
    auditLog: ExamAuditLogRecord[];
}

export interface AdminAttemptListItem extends ExamAttemptRecord {
    student: Pick<ExamStudentRef, "studentId" | "studentName" | "studentRegistrationNumber">;
    round: Pick<ExamRoundRecord, "title" | "roundType">;
    set: { code: string };
    exam: { title: string };
}

export interface AdminAttemptResponse extends ExamAttemptResponseRecord {
    question: ExamQuestionWithOptions & { flags: ExamLabFlagSummary[] };
    evaluationPath: EvaluationPath;
    /** Final marks if decidable now, null = still needs an evaluator / the AI. */
    resolvedMarks: number | null;
}

/** GET /exam-admin/attempts/:attemptId — evaluator view. */
export interface AdminAttemptDetail extends ExamAttemptRecord {
    student: ExamStudentRef;
    round: ExamRoundRecord;
    set: { setId: string; code: string; title: string | null };
    exam: { examId: string; title: string };
    responses: AdminAttemptResponse[];
    auditLogs: ExamAuditLogRecord[];
    pendingMarks: number;
}

export interface EvaluateAttemptResult {
    attemptId: string;
    attemptStatus: ExamAttemptStatus;
    resultStatus: ExamResultStatus;
    scorePct: number | null;
    obtainedMarks: number | null;
}

export interface VoidAttemptResult {
    attemptId: string;
    roundState: ExamRoundState | null;
    /** true when the voided attempt had earned a certificate that is still issued (revoke it explicitly). */
    certificateStillIssued: boolean;
}

/* ========================================================== inputs */

export interface ExamRoundInput {
    roundType: ExamRoundType;
    /** Defaults to "Technical Viva" / "MCQ Exam" / "Practical Lab" / "HR Round". */
    title?: string;
    info?: string | null;
    instructions?: string[];
    isMandatory?: boolean;
    deliveryMode?: DeliveryMode;
    selfStart?: boolean;
    /** 60 … 86400; null = untimed */
    durationSec?: number | null;
    /** null = unlimited */
    maxAttempts?: number | null;
    retakeCooldownMin?: number;
    allowResume?: boolean;
    passingPct?: number;
    defaultMarks?: number;
    defaultNegativeMarks?: number;
    msqScoring?: MsqScoring;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    /** Must be one of ROUND_EVALUATION_MODES[roundType]. */
    evaluationMode?: ExamEvaluationMode;
    revealMode?: ExamRevealMode;
    proctoringMode?: ProctoringMode;
    maxViolations?: number | null;
}

export type UpdateExamRoundInput = Partial<Omit<ExamRoundInput, "roundType">>;

export interface ExamSettingsInput {
    title?: string;
    description?: string | null;
    instructions?: string[];
    unlockRule?: ExamUnlockRule;
    /** Required with unlockRule "progress_pct". */
    unlockProgressPct?: number | null;
    roundProgression?: RoundProgression;
    certificateTitle?: string;
    /** Letters, numbers and dashes ("CCN-CERT"). */
    certificatePrefix?: string;
    /** null = never expires */
    certificateValidityMonths?: number | null;
    signatoryName?: string | null;
    signatoryTitle?: string | null;
    signatoryOrganisation?: string | null;
    signatureUrl?: string | null;
}

export interface CreateExamInput extends ExamSettingsInput {
    courseId: string;
    /** Optional shortcut: create the rounds in the same call. */
    rounds?: ExamRoundInput[];
}

export type UpdateExamInput = ExamSettingsInput;

export interface ExamSetInput {
    /** Auto "SET-A", "SET-B"… when omitted. */
    code?: string;
    title?: string | null;
}

export interface ExamOptionInput {
    optionText: string;
    imageUrl?: string | null;
    isCorrect?: boolean;
}

export interface ExamLabFlagInput {
    label: string;
    /** Plain flag (hashed by the API). Omit it and pass `flagId` to keep an existing flag. */
    flag?: string;
    flagId?: string;
    marks?: number;
}

/** Full question payload (PUT replaces options and flags too). */
export interface ExamQuestionInput {
    questionType: ExamQuestionType;
    section?: string | null;
    prompt: string;
    scenario?: string | null;
    code?: string | null;
    codeLanguage?: string | null;
    imageUrl?: string | null;
    marks?: number | null;
    negativeMarks?: number | null;
    explanation?: string | null;
    /** Choice questions only. */
    options?: ExamOptionInput[];
    // viva / hr (reference for the AI + evaluator)
    expectedAnswer?: string | null;
    keyPoints?: string[];
    evaluationGuide?: string | null;
    answerTimeLimitSec?: number | null;
    // lab_task
    taskBlocks?: ContentBlock[] | null;
    solutionBlocks?: ContentBlock[] | null;
    labProvider?: ExamLabProvider | null;
    launchUrl?: string | null;
    environmentTemplateId?: string | null;
    tools?: string[];
    verificationMode?: ExamLabVerificationMode | null;
    flags?: ExamLabFlagInput[];
}

export interface GrantAttemptsInput {
    extraAttempts: number;
    waiveCooldown?: boolean;
    reason: string;
}

export interface UnlockOverrideInput {
    /** null = follow the exam's unlock rule again. */
    override: UnlockOverride | null;
    reason: string;
}

export interface EvaluateResponseInput {
    questionId: string;
    /** Absolute marks (0 … question marks); null clears the manual override. */
    marks: number | null;
    remarks?: string | null;
}

export interface EvaluateAttemptInput {
    responses?: EvaluateResponseInput[];
    remarks?: string | null;
    /** true = compute the result and close the attempt (every answer must have marks). */
    finalize?: boolean;
}

export interface VoidAttemptInput {
    reason: string;
    /** true (default) = doesn't count towards maxAttempts and starts no cooldown. */
    refundAttempt?: boolean;
}

export interface PageFilters {
    page?: number;
    pageSize?: number;
    search?: string;
}

export interface AdminExamFilters extends PageFilters {
    status?: ExamPublishStatus;
    courseId?: string;
}

export interface CandidateFilters extends PageFilters {
    status?: CandidateStatus;
}

export interface AdminAttemptFilters extends PageFilters {
    /** "needs_review" = review queue, "ai_failed" = AI gave up. */
    status?: AdminAttemptStatusFilter;
    examId?: string;
    roundId?: string;
}

export interface CertificateFilters extends PageFilters {
    status?: CertificateStatus;
    examId?: string;
}

export interface StartExamAttemptInput {
    /** Exam-portal machine id (kiosk), stored on the attempt for audits. */
    machineCode?: string | null;
}

export interface SaveResponseInput {
    questionId: string;
    selectedOptionIds?: string[];
    answerText?: string | null;
    /** Must come from uploadAnswerFile / createAnswerUploadUrl for this attempt. */
    answerAudioUrl?: string | null;
    attachmentUrls?: string[];
    isMarkedForReview?: boolean;
    visited?: boolean;
    /** Seconds spent on this question since the previous save. */
    timeSpentDeltaSec?: number;
}

export interface ProctorEventInput {
    eventType: ProctorEventType;
    message?: string | null;
    /** ISO date */
    occurredAt?: string;
}

export interface AnswerUploadInput {
    questionId: string;
    kind: AnswerUploadKind;
    fileName: string;
    contentType: string;
}

export interface UploadAnswerOptions {
    onProgress?: (pct: number) => void;
    signal?: AbortSignal;
    /** Default true: saves the URL on the response (audio → answerAudioUrl, attachment → appended). */
    attach?: boolean;
}

/* ======================================================= context type */

interface ExamContextValue {
    // ── student state
    studentExams: StudentExamCard[];
    examDetail: StudentExamDetail | null;
    examCertificate: ExamCertificateView | null;
    /** The attempt being taken (in_progress only). */
    activeAttempt: ExamAttemptView | null;
    /** Result of the last finished attempt (after submit / auto-submit). */
    attemptResult: ExamAttemptResultSummary | null;
    attemptReport: ExamAttemptReport | null;

    loadingExams: boolean;
    loadingExamDetail: boolean;
    loadingAttempt: boolean;
    loadingReport: boolean;
    savingResponses: boolean;
    submittingAttempt: boolean;

    // ── admin state
    adminExams: PaginatedResult<AdminExamListItem> | null;
    adminExam: AdminExamTree | null;
    publishCheck: ExamPublishCheck | null;
    adminSet: AdminExamSetDetail | null;
    examCandidates: PaginatedResult<AdminCandidateListItem> | null;
    candidateDetail: AdminCandidateDetail | null;
    examAttempts: PaginatedResult<AdminAttemptListItem> | null;
    attemptDetail: AdminAttemptDetail | null;
    examCertificates: PaginatedResult<ExamCertificateRecord> | null;

    loadingAdminExams: boolean;
    loadingAdminExam: boolean;
    loadingAdminSet: boolean;
    loadingCandidates: boolean;
    loadingCandidate: boolean;
    loadingAttempts: boolean;
    loadingAttemptDetail: boolean;
    loadingCertificates: boolean;
    saving: boolean;

    // ── student: exams
    getStudentExams: () => Promise<StandardResponse<StudentExamCard[]>>;
    /** `examIdOrSlug` accepts the exam id, the course id or the course slug ("ccna"). */
    getStudentExam: (examIdOrSlug: string) => Promise<StandardResponse<StudentExamDetail>>;
    getExamCertificate: (examIdOrSlug: string) => Promise<StandardResponse<ExamCertificateView>>;
    verifyCertificate: (certificateNo: string) => Promise<StandardResponse<CertificateVerification>>;

    // ── student: attempt runtime
    /** Starts a new attempt (random never-seen set) or resumes the ongoing one of this round. */
    startExamAttempt: (
        examIdOrSlug: string,
        roundId: string,
        input?: StartExamAttemptInput
    ) => Promise<StandardResponse<ExamAttemptPayload>>;
    getExamAttempt: (attemptId: string) => Promise<StandardResponse<ExamAttemptPayload>>;
    /** Autosave (optimistic, serialised per attempt so older saves never overwrite newer ones). */
    saveExamResponses: (attemptId: string, responses: SaveResponseInput[]) => Promise<StandardResponse<SaveResponsesResult>>;
    sendExamHeartbeat: (attemptId: string) => Promise<StandardResponse<ExamHeartbeatResult>>;
    reportProctorEvent: (attemptId: string, input: ProctorEventInput) => Promise<StandardResponse<ProctorEventResult>>;
    submitExamLabFlag: (attemptId: string, questionId: string, flag: string) => Promise<StandardResponse<LabFlagSubmitResult>>;
    createAnswerUploadUrl: (attemptId: string, input: AnswerUploadInput) => Promise<StandardResponse<AssetUploadTicket>>;
    /** Presign + PUT to R2 (+ optionally save it on the response). Returns the CDN URL. */
    uploadAnswerFile: (
        attemptId: string,
        questionId: string,
        file: File,
        kind: AnswerUploadKind,
        options?: UploadAnswerOptions
    ) => Promise<StandardResponse<{ publicUrl: string; key: string }>>;
    submitExamAttempt: (attemptId: string) => Promise<StandardResponse<ExamAttemptResultSummary>>;
    getAttemptReport: (attemptId: string) => Promise<StandardResponse<ExamAttemptReport>>;
    clearActiveAttempt: () => void;

    // ── admin: exams
    getAdminExams: (filters?: AdminExamFilters) => Promise<StandardResponse<PaginatedResult<AdminExamListItem>>>;
    createExam: (input: CreateExamInput) => Promise<StandardResponse<ExamWithRounds>>;
    getAdminExam: (examId: string) => Promise<StandardResponse<AdminExamTree>>;
    updateExam: (examId: string, input: UpdateExamInput) => Promise<StandardResponse<ExamRecord>>;
    deleteExam: (examId: string) => Promise<StandardResponse<null>>;
    getExamPublishCheck: (examId: string) => Promise<StandardResponse<ExamPublishCheck>>;
    publishExam: (examId: string) => Promise<StandardResponse<ExamRecord>>;
    unpublishExam: (examId: string) => Promise<StandardResponse<ExamRecord>>;
    archiveExam: (examId: string) => Promise<StandardResponse<ExamRecord>>;
    resyncExam: (examId: string) => Promise<StandardResponse<{ synced: number }>>;

    // ── admin: rounds
    createRound: (examId: string, input: ExamRoundInput) => Promise<StandardResponse<ExamRoundRecord>>;
    updateRound: (roundId: string, input: UpdateExamRoundInput) => Promise<StandardResponse<ExamRoundRecord>>;
    deleteRound: (roundId: string) => Promise<StandardResponse<null>>;
    reorderRounds: (examId: string, roundIds: string[]) => Promise<StandardResponse<ExamWithRounds>>;

    // ── admin: sets
    getRoundSets: (roundId: string) => Promise<StandardResponse<ExamSetRecord[]>>;
    createSet: (roundId: string, input?: ExamSetInput) => Promise<StandardResponse<ExamSetRecord>>;
    getAdminSet: (setId: string) => Promise<StandardResponse<AdminExamSetDetail>>;
    updateSet: (setId: string, input: ExamSetInput) => Promise<StandardResponse<ExamSetRecord>>;
    deleteSet: (setId: string) => Promise<StandardResponse<null>>;
    publishSet: (setId: string) => Promise<StandardResponse<ExamSetRecord>>;
    unpublishSet: (setId: string) => Promise<StandardResponse<ExamSetRecord>>;
    retireSet: (setId: string) => Promise<StandardResponse<ExamSetRecord>>;
    /** The way to "edit" a published / retired set: copy into a new draft. */
    cloneSet: (setId: string, input?: ExamSetInput) => Promise<StandardResponse<ExamSetRecord>>;

    // ── admin: questions (draft sets only)
    createQuestion: (setId: string, input: ExamQuestionInput) => Promise<StandardResponse<ExamQuestionWithOptions>>;
    importQuestions: (setId: string, questions: ExamQuestionInput[]) => Promise<StandardResponse<{ imported: number }>>;
    reorderQuestions: (setId: string, questionIds: string[]) => Promise<StandardResponse<{ reordered: number }>>;
    updateQuestion: (questionId: string, input: ExamQuestionInput) => Promise<StandardResponse<ExamQuestionWithOptions>>;
    deleteQuestion: (questionId: string) => Promise<StandardResponse<null>>;

    // ── admin: candidates
    getExamCandidates: (examId: string, filters?: CandidateFilters) => Promise<StandardResponse<PaginatedResult<AdminCandidateListItem>>>;
    getExamCandidate: (examId: string, studentId: string) => Promise<StandardResponse<AdminCandidateDetail>>;
    setCandidateUnlock: (
        examId: string,
        studentId: string,
        input: UnlockOverrideInput
    ) => Promise<StandardResponse<{ candidate: ExamCandidateRecord; unlock: ExamUnlockState }>>;
    grantExtraAttempts: (
        examId: string,
        studentId: string,
        roundId: string,
        input: GrantAttemptsInput
    ) => Promise<StandardResponse<ExamRoundState>>;
    waiveCooldown: (examId: string, studentId: string, roundId: string, reason: string) => Promise<StandardResponse<ExamRoundState>>;
    /** Offline / in-centre rounds: start (or resume) the attempt on the student's behalf. */
    startAttemptForStudent: (examId: string, studentId: string, roundId: string) => Promise<StandardResponse<ExamAttemptPayload>>;

    // ── admin: attempts & evaluation
    getAdminAttempts: (filters?: AdminAttemptFilters) => Promise<StandardResponse<PaginatedResult<AdminAttemptListItem>>>;
    getAdminAttempt: (attemptId: string) => Promise<StandardResponse<AdminAttemptDetail>>;
    evaluateAttempt: (attemptId: string, input: EvaluateAttemptInput) => Promise<StandardResponse<EvaluateAttemptResult>>;
    rerunAiEvaluation: (attemptId: string) => Promise<StandardResponse<null>>;
    forceSubmitAttempt: (attemptId: string, reason: string) => Promise<StandardResponse<ExamAttemptResultSummary>>;
    voidAttempt: (attemptId: string, input: VoidAttemptInput) => Promise<StandardResponse<VoidAttemptResult>>;

    // ── admin: certificates
    getExamCertificates: (filters?: CertificateFilters) => Promise<StandardResponse<PaginatedResult<ExamCertificateRecord>>>;
    revokeCertificate: (certificateId: string, reason: string) => Promise<StandardResponse<ExamCertificateRecord>>;
    reinstateCertificate: (certificateId: string, reason: string) => Promise<StandardResponse<ExamCertificateRecord>>;
}

/* ============================================================ helpers */

const ExamContext = createContext<ExamContextValue | null>(null);

const STUDENT = "/api/v1/student-exam";
const ADMIN = "/api/v1/exam-admin";
const PUBLIC_CERTIFICATES = "/api/v1/certificates";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
    path: string;
    method?: HttpMethod;
    body?: object;
    params?: object;
}

function toMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
}

/** Wraps axiosHandler into the StandardResponse shape used by every context. */
async function request<T>(options: RequestOptions, fallback: string, successMessage: string | null = null): Promise<StandardResponse<T>> {
    try {
        const data = (await axiosHandler({ method: "GET", ...options })) as T;
        return { success: true, message: successMessage, data: data ?? null };
    } catch (error: unknown) {
        return { success: false, message: toMessage(error, fallback), data: null };
    }
}

/** Drops empty filters so they aren't sent as `?search=`. */
function cleanParams(params?: object): Record<string, string | number> | undefined {
    if (!params) return undefined;
    const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
    return entries.length ? (Object.fromEntries(entries) as Record<string, string | number>) : undefined;
}

const enc = encodeURIComponent;
const clampPct = (value: number) => Math.max(0, Math.min(100, Math.round(value * 10) / 10));

/** Direct PUT to the presigned R2 URL — deliberately without our auth header. */
function putFile(url: string, file: File, headers: Record<string, string>, onProgress?: (pct: number) => void, signal?: AbortSignal) {
    return new Promise<void>((resolve, reject) => {
        if (signal?.aborted) return reject(new Error("Upload cancelled"));
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        Object.entries(headers).forEach(([key, value]) => xhr.setRequestHeader(key, value));
        if (onProgress) xhr.upload.onprogress = (event) => onProgress(clampPct((event.loaded / (file.size || 1)) * 100));
        const onAbort = () => xhr.abort();
        signal?.addEventListener("abort", onAbort, { once: true });
        const done = () => signal?.removeEventListener("abort", onAbort);
        xhr.onload = () => {
            done();
            if (xhr.status >= 200 && xhr.status < 300) {
                onProgress?.(100);
                resolve();
            } else reject(new Error(`Upload failed (HTTP ${xhr.status})`));
        };
        xhr.onerror = () => {
            done();
            reject(new Error("Network error during upload"));
        };
        xhr.onabort = () => {
            done();
            reject(new Error("Upload cancelled"));
        };
        xhr.send(file);
    });
}

/* ---------------------------------------------------- local state patches */

const isChoice = (type: ExamQuestionType) => CHOICE_QUESTION_TYPES.includes(type);

function responseHasAnswer(question: ExamAttemptQuestion, response: ExamAttemptQuestionResponse) {
    return Boolean(
        response.selectedOptionIds.length ||
            response.answerText?.trim() ||
            response.answerAudioUrl ||
            response.attachmentUrls.length ||
            question.lab?.flags.some((f) => f.captured)
    );
}

function paletteSummary(questions: ExamAttemptQuestion[]): ExamAttemptPaletteSummary {
    const count = (fn: (r: ExamAttemptQuestionResponse) => boolean) => questions.filter((q) => fn(q.response)).length;
    return {
        total: questions.length,
        answered: count((r) => r.answered && !r.isMarkedForReview),
        answeredAndMarked: count((r) => r.answered && r.isMarkedForReview),
        markedForReview: count((r) => !r.answered && r.isMarkedForReview),
        notAnswered: count((r) => !r.answered && r.visited && !r.isMarkedForReview),
        notVisited: count((r) => !r.visited && !r.isMarkedForReview),
    };
}

/** Optimistically applies autosave patches to the in-progress attempt (same rules as the API). */
function applyResponsePatches(attempt: ExamAttemptView, patches: SaveResponseInput[]): ExamAttemptView {
    const byId = new Map(patches.map((p) => [p.questionId, p]));
    const questions = attempt.questions.map((question) => {
        const patch = byId.get(question.questionId);
        if (!patch) return question;
        const next: ExamAttemptQuestionResponse = { ...question.response };
        if (patch.selectedOptionIds !== undefined && isChoice(question.questionType)) {
            const unique = [...new Set(patch.selectedOptionIds)];
            next.selectedOptionIds = question.questionType === "multiple_choice" ? unique : unique.slice(0, 1);
        }
        if (patch.answerText !== undefined) next.answerText = patch.answerText?.trim() ? patch.answerText : null;
        if (patch.answerAudioUrl !== undefined) next.answerAudioUrl = patch.answerAudioUrl || null;
        if (patch.attachmentUrls !== undefined) next.attachmentUrls = patch.attachmentUrls;
        if (patch.isMarkedForReview !== undefined) next.isMarkedForReview = patch.isMarkedForReview;
        if (patch.timeSpentDeltaSec) next.timeSpentSec += patch.timeSpentDeltaSec;
        next.visited = next.visited || Boolean(patch.visited) || Object.keys(patch).length > 1;
        next.answered = responseHasAnswer(question, next);
        return { ...question, response: next };
    });
    return { ...attempt, questions, summary: paletteSummary(questions) };
}

function markFlagCaptured(attempt: ExamAttemptView, questionId: string, flagId: string): ExamAttemptView {
    const questions = attempt.questions.map((question) => {
        if (question.questionId !== questionId || !question.lab) return question;
        const lab = { ...question.lab, flags: question.lab.flags.map((f) => (f.flagId === flagId ? { ...f, captured: true } : f)) };
        const updated = { ...question, lab };
        return { ...updated, response: { ...question.response, visited: true, answered: responseHasAnswer(updated, question.response) } };
    });
    return { ...attempt, questions, summary: paletteSummary(questions) };
}

/* =========================================================== provider */

export function ExamProvider({ children }: { children: ReactNode }) {
    // ── student state
    const [studentExams, setStudentExams] = useState<StudentExamCard[]>([]);
    const [examDetail, setExamDetail] = useState<StudentExamDetail | null>(null);
    const [examCertificate, setExamCertificate] = useState<ExamCertificateView | null>(null);
    const [activeAttempt, setActiveAttempt] = useState<ExamAttemptView | null>(null);
    const [attemptResult, setAttemptResult] = useState<ExamAttemptResultSummary | null>(null);
    const [attemptReport, setAttemptReport] = useState<ExamAttemptReport | null>(null);

    const [loadingExams, setLoadingExams] = useState(false);
    const [loadingExamDetail, setLoadingExamDetail] = useState(false);
    const [loadingAttempt, setLoadingAttempt] = useState(false);
    const [loadingReport, setLoadingReport] = useState(false);
    const [savingResponses, setSavingResponses] = useState(false);
    const [submittingAttempt, setSubmittingAttempt] = useState(false);

    // ── admin state
    const [adminExams, setAdminExams] = useState<PaginatedResult<AdminExamListItem> | null>(null);
    const [adminExam, setAdminExam] = useState<AdminExamTree | null>(null);
    const [publishCheck, setPublishCheck] = useState<ExamPublishCheck | null>(null);
    const [adminSet, setAdminSet] = useState<AdminExamSetDetail | null>(null);
    const [examCandidates, setExamCandidates] = useState<PaginatedResult<AdminCandidateListItem> | null>(null);
    const [candidateDetail, setCandidateDetail] = useState<AdminCandidateDetail | null>(null);
    const [examAttempts, setExamAttempts] = useState<PaginatedResult<AdminAttemptListItem> | null>(null);
    const [attemptDetail, setAttemptDetail] = useState<AdminAttemptDetail | null>(null);
    const [examCertificates, setExamCertificates] = useState<PaginatedResult<ExamCertificateRecord> | null>(null);

    const [loadingAdminExams, setLoadingAdminExams] = useState(false);
    const [loadingAdminExam, setLoadingAdminExam] = useState(false);
    const [loadingAdminSet, setLoadingAdminSet] = useState(false);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [loadingCandidate, setLoadingCandidate] = useState(false);
    const [loadingAttempts, setLoadingAttempts] = useState(false);
    const [loadingAttemptDetail, setLoadingAttemptDetail] = useState(false);
    const [loadingCertificates, setLoadingCertificates] = useState(false);
    const [saving, setSaving] = useState(false);

    // What is currently on screen, so mutations can silently refresh it.
    const studentExamsLoadedRef = useRef(false);
    const examDetailKeyRef = useRef<string | null>(null);
    const activeAttemptRef = useRef<ExamAttemptView | null>(null);
    /** Per-attempt promise chain: autosaves run strictly in order. */
    const saveChainRef = useRef(new Map<string, Promise<unknown>>());
    const pendingSavesRef = useRef(0);
    const adminExamsFiltersRef = useRef<AdminExamFilters | null>(null);
    const adminExamIdRef = useRef<string | null>(null);
    const adminSetIdRef = useRef<string | null>(null);
    const adminSetRoundIdRef = useRef<string | null>(null);
    const candidatesKeyRef = useRef<{ examId: string; filters: CandidateFilters } | null>(null);
    const candidateKeyRef = useRef<{ examId: string; studentId: string } | null>(null);
    const attemptsFiltersRef = useRef<AdminAttemptFilters | null>(null);
    const attemptDetailIdRef = useRef<string | null>(null);
    const certificatesFiltersRef = useRef<CertificateFilters | null>(null);

    const setActive = useCallback((attempt: ExamAttemptView | null) => {
        activeAttemptRef.current = attempt;
        setActiveAttempt(attempt);
    }, []);

    const patchActive = useCallback((attemptId: string, patch: (attempt: ExamAttemptView) => ExamAttemptView) => {
        const current = activeAttemptRef.current;
        if (!current || current.attemptId !== attemptId) return;
        const next = patch(current);
        activeAttemptRef.current = next;
        setActiveAttempt(next);
    }, []);

    /** Routes a start / resume / GET payload into activeAttempt (in progress) or attemptResult (finished). */
    const applyAttemptPayload = useCallback(
        (payload: ExamAttemptPayload) => {
            if (isAttemptInProgress(payload)) {
                setActive(payload);
                setAttemptResult(null);
                return;
            }
            if (activeAttemptRef.current?.attemptId === payload.attemptId) setActive(null);
            setAttemptResult(payload);
        },
        [setActive]
    );

    /* --------------------------------------------------- silent refreshers */

    const refreshStudentViews = useCallback(async () => {
        const tasks: Promise<void>[] = [];
        const detailKey = examDetailKeyRef.current;
        if (detailKey) {
            tasks.push(
                request<StudentExamDetail>({ path: `${STUDENT}/exams/${enc(detailKey)}` }, "").then((res) => {
                    if (res.success && res.data && examDetailKeyRef.current === detailKey) setExamDetail(res.data);
                })
            );
        }
        if (studentExamsLoadedRef.current) {
            tasks.push(
                request<StudentExamCard[]>({ path: `${STUDENT}/exams` }, "").then((res) => {
                    if (res.success) setStudentExams(res.data ?? []);
                })
            );
        }
        await Promise.all(tasks);
    }, []);

    /** After a runtime call fails (time up, auto-submitted, already submitted…) re-read the attempt from the server. */
    const resyncAttempt = useCallback(
        async (attemptId: string) => {
            const res = await request<ExamAttemptPayload>({ path: `${STUDENT}/attempts/${attemptId}` }, "");
            if (!res.success || !res.data) return;
            applyAttemptPayload(res.data);
            if (!isAttemptInProgress(res.data)) await refreshStudentViews();
        },
        [applyAttemptPayload, refreshStudentViews]
    );

    const refreshAdminExams = useCallback(async () => {
        const filters = adminExamsFiltersRef.current;
        if (!filters) return;
        const res = await request<PaginatedResult<AdminExamListItem>>({ path: `${ADMIN}/exams`, params: cleanParams(filters) }, "");
        if (res.success && res.data) setAdminExams(res.data);
    }, []);

    const refreshAdminExam = useCallback(async () => {
        const examId = adminExamIdRef.current;
        if (!examId) return;
        const res = await request<AdminExamTree>({ path: `${ADMIN}/exams/${examId}` }, "");
        if (res.success && res.data && adminExamIdRef.current === examId) setAdminExam(res.data);
    }, []);

    const refreshAdminSet = useCallback(async () => {
        const setId = adminSetIdRef.current;
        if (!setId) return;
        const res = await request<AdminExamSetDetail>({ path: `${ADMIN}/sets/${setId}` }, "");
        if (res.success && res.data && adminSetIdRef.current === setId) setAdminSet(res.data);
    }, []);

    const refreshCandidates = useCallback(async () => {
        const key = candidatesKeyRef.current;
        if (!key) return;
        const res = await request<PaginatedResult<AdminCandidateListItem>>(
            { path: `${ADMIN}/exams/${key.examId}/candidates`, params: cleanParams(key.filters) },
            ""
        );
        if (res.success && res.data && candidatesKeyRef.current === key) setExamCandidates(res.data);
    }, []);

    const refreshCandidate = useCallback(async () => {
        const key = candidateKeyRef.current;
        if (!key) return;
        const res = await request<AdminCandidateDetail>({ path: `${ADMIN}/exams/${key.examId}/students/${key.studentId}` }, "");
        if (res.success && res.data && candidateKeyRef.current === key) setCandidateDetail(res.data);
    }, []);

    const refreshAttempts = useCallback(async () => {
        const filters = attemptsFiltersRef.current;
        if (!filters) return;
        const res = await request<PaginatedResult<AdminAttemptListItem>>({ path: `${ADMIN}/attempts`, params: cleanParams(filters) }, "");
        if (res.success && res.data && attemptsFiltersRef.current === filters) setExamAttempts(res.data);
    }, []);

    const refreshAttemptDetail = useCallback(async () => {
        const attemptId = attemptDetailIdRef.current;
        if (!attemptId) return;
        const res = await request<AdminAttemptDetail>({ path: `${ADMIN}/attempts/${attemptId}` }, "");
        if (res.success && res.data && attemptDetailIdRef.current === attemptId) setAttemptDetail(res.data);
    }, []);

    const refreshCertificates = useCallback(async () => {
        const filters = certificatesFiltersRef.current;
        if (!filters) return;
        const res = await request<PaginatedResult<ExamCertificateRecord>>({ path: `${ADMIN}/certificates`, params: cleanParams(filters) }, "");
        if (res.success && res.data && certificatesFiltersRef.current === filters) setExamCertificates(res.data);
    }, []);

    /** Everything an evaluation / void / force-submit can change. */
    const refreshEvaluationViews = useCallback(
        () => Promise.all([refreshAttemptDetail(), refreshAttempts(), refreshCandidate(), refreshCandidates(), refreshAdminExam()]),
        [refreshAttemptDetail, refreshAttempts, refreshCandidate, refreshCandidates, refreshAdminExam]
    );

    /* ================================================ student: exams */

    const getStudentExams = useCallback(async (): Promise<StandardResponse<StudentExamCard[]>> => {
        setLoadingExams(true);
        try {
            const res = await request<StudentExamCard[]>({ path: `${STUDENT}/exams` }, "Failed to fetch your exams");
            if (res.success) {
                studentExamsLoadedRef.current = true;
                setStudentExams(res.data ?? []);
            }
            return res;
        } finally {
            setLoadingExams(false);
        }
    }, []);

    const getStudentExam = useCallback(async (examIdOrSlug: string): Promise<StandardResponse<StudentExamDetail>> => {
        setLoadingExamDetail(true);
        try {
            const res = await request<StudentExamDetail>({ path: `${STUDENT}/exams/${enc(examIdOrSlug)}` }, "Failed to fetch the exam");
            if (res.success && res.data) {
                examDetailKeyRef.current = examIdOrSlug;
                setExamDetail(res.data);
            }
            return res;
        } finally {
            setLoadingExamDetail(false);
        }
    }, []);

    const getExamCertificate = useCallback(async (examIdOrSlug: string): Promise<StandardResponse<ExamCertificateView>> => {
        const res = await request<ExamCertificateView>(
            { path: `${STUDENT}/exams/${enc(examIdOrSlug)}/certificate` },
            "Failed to fetch the certificate"
        );
        setExamCertificate(res.success ? res.data : null);
        return res;
    }, []);

    const verifyCertificate = useCallback(
        (certificateNo: string) =>
            request<CertificateVerification>(
                { path: `${PUBLIC_CERTIFICATES}/verify/${enc(certificateNo.trim())}` },
                "Failed to verify the certificate"
            ),
        []
    );

    /* ======================================== student: attempt runtime */

    const startExamAttempt = useCallback(
        async (examIdOrSlug: string, roundId: string, input: StartExamAttemptInput = {}): Promise<StandardResponse<ExamAttemptPayload>> => {
            setLoadingAttempt(true);
            try {
                const res = await request<ExamAttemptPayload>(
                    { path: `${STUDENT}/exams/${enc(examIdOrSlug)}/rounds/${roundId}/attempts`, method: "POST", body: input },
                    "Failed to start the exam"
                );
                if (res.success && res.data) {
                    applyAttemptPayload(res.data);
                    setAttemptReport(null);
                    await refreshStudentViews();
                }
                return res;
            } finally {
                setLoadingAttempt(false);
            }
        },
        [applyAttemptPayload, refreshStudentViews]
    );

    const getExamAttempt = useCallback(
        async (attemptId: string): Promise<StandardResponse<ExamAttemptPayload>> => {
            setLoadingAttempt(true);
            try {
                const res = await request<ExamAttemptPayload>({ path: `${STUDENT}/attempts/${attemptId}` }, "Failed to load the attempt");
                if (res.success && res.data) applyAttemptPayload(res.data);
                return res;
            } finally {
                setLoadingAttempt(false);
            }
        },
        [applyAttemptPayload]
    );

    const saveExamResponses = useCallback(
        async (attemptId: string, responses: SaveResponseInput[]): Promise<StandardResponse<SaveResponsesResult>> => {
            if (!responses.length) return { success: true, message: null, data: null };
            patchActive(attemptId, (attempt) => applyResponsePatches(attempt, responses));

            const previous = saveChainRef.current.get(attemptId) ?? Promise.resolve();
            const run = previous
                .catch(() => undefined)
                .then(() =>
                    request<SaveResponsesResult>(
                        { path: `${STUDENT}/attempts/${attemptId}/responses`, method: "PUT", body: { responses } },
                        "Failed to save your answers"
                    )
                );
            saveChainRef.current.set(attemptId, run);
            pendingSavesRef.current += 1;
            setSavingResponses(true);
            try {
                const res = await run;
                if (res.success && res.data) {
                    const { remainingSec, serverTime } = res.data;
                    patchActive(attemptId, (attempt) => ({ ...attempt, remainingSec, serverTime }));
                } else {
                    // Rejected (time up, already submitted, invalid answer): fall back to the server's truth.
                    await resyncAttempt(attemptId);
                }
                return res;
            } finally {
                if (saveChainRef.current.get(attemptId) === run) saveChainRef.current.delete(attemptId);
                pendingSavesRef.current -= 1;
                if (pendingSavesRef.current === 0) setSavingResponses(false);
            }
        },
        [patchActive, resyncAttempt]
    );

    const sendExamHeartbeat = useCallback(
        async (attemptId: string): Promise<StandardResponse<ExamHeartbeatResult>> => {
            const res = await request<ExamHeartbeatResult>(
                { path: `${STUDENT}/attempts/${attemptId}/heartbeat`, method: "POST" },
                "Connection to the exam server lost"
            );
            if (res.success && res.data) {
                if (res.data.autoSubmitted || res.data.attemptStatus !== "in_progress") await resyncAttempt(attemptId);
                else {
                    const { remainingSec, serverTime } = res.data;
                    patchActive(attemptId, (attempt) => ({ ...attempt, remainingSec, serverTime }));
                }
            }
            return res;
        },
        [patchActive, resyncAttempt]
    );

    const reportProctorEvent = useCallback(
        async (attemptId: string, input: ProctorEventInput): Promise<StandardResponse<ProctorEventResult>> => {
            const res = await request<ProctorEventResult>(
                { path: `${STUDENT}/attempts/${attemptId}/events`, method: "POST", body: input },
                "Failed to record the event"
            );
            const data = res.data;
            if (res.success && data?.recorded) {
                patchActive(attemptId, (attempt) => ({ ...attempt, proctoring: { ...attempt.proctoring, violationCount: data.violationCount } }));
                if (data.autoSubmitted) await resyncAttempt(attemptId);
            } else if (res.success && data && !data.recorded) {
                await resyncAttempt(attemptId);
            }
            return res;
        },
        [patchActive, resyncAttempt]
    );

    const submitExamLabFlag = useCallback(
        async (attemptId: string, questionId: string, flag: string): Promise<StandardResponse<LabFlagSubmitResult>> => {
            const res = await request<LabFlagSubmitResult>(
                { path: `${STUDENT}/attempts/${attemptId}/questions/${questionId}/flags`, method: "POST", body: { flag } },
                "Failed to submit the flag"
            );
            const data = res.data;
            if (res.success && data?.correct) {
                patchActive(attemptId, (attempt) => markFlagCaptured(attempt, questionId, data.flagId));
                return { ...res, message: data.alreadyCaptured ? "Flag already captured" : `Flag captured: ${data.label}` };
            }
            if (res.success) return { ...res, message: "Incorrect flag" };
            await resyncAttempt(attemptId);
            return res;
        },
        [patchActive, resyncAttempt]
    );

    const createAnswerUploadUrl = useCallback(
        (attemptId: string, input: AnswerUploadInput) =>
            request<AssetUploadTicket>(
                { path: `${STUDENT}/attempts/${attemptId}/upload-url`, method: "POST", body: input },
                "Failed to prepare the upload"
            ),
        []
    );

    const uploadAnswerFile = useCallback(
        async (
            attemptId: string,
            questionId: string,
            file: File,
            kind: AnswerUploadKind,
            options: UploadAnswerOptions = {}
        ): Promise<StandardResponse<{ publicUrl: string; key: string }>> => {
            try {
                const ticket = await createAnswerUploadUrl(attemptId, {
                    questionId,
                    kind,
                    fileName: file.name || (kind === "audio" ? "answer.webm" : "attachment"),
                    contentType: file.type || (kind === "audio" ? "audio/webm" : "application/octet-stream"),
                });
                if (!ticket.success || !ticket.data) return { success: false, message: ticket.message, data: null };
                await putFile(ticket.data.uploadUrl, file, ticket.data.headers, options.onProgress, options.signal);
                const uploaded = { publicUrl: ticket.data.publicUrl, key: ticket.data.key };

                if (options.attach !== false) {
                    const current = activeAttemptRef.current?.questions.find((q) => q.questionId === questionId)?.response;
                    const save =
                        kind === "audio"
                            ? await saveExamResponses(attemptId, [{ questionId, answerAudioUrl: uploaded.publicUrl }])
                            : await saveExamResponses(attemptId, [
                                { questionId, attachmentUrls: [...(current?.attachmentUrls ?? []), uploaded.publicUrl] },
                            ]);
                    if (!save.success) return { success: false, message: save.message, data: uploaded };
                }
                return { success: true, message: "File uploaded", data: uploaded };
            } catch (error: unknown) {
                return { success: false, message: toMessage(error, "Upload failed"), data: null };
            }
        },
        [createAnswerUploadUrl, saveExamResponses]
    );

    const submitExamAttempt = useCallback(
        async (attemptId: string): Promise<StandardResponse<ExamAttemptResultSummary>> => {
            setSubmittingAttempt(true);
            try {
                // Let queued autosaves land first so the last answers are scored.
                await saveChainRef.current.get(attemptId)?.catch(() => undefined);
                const res = await request<ExamAttemptResultSummary>(
                    { path: `${STUDENT}/attempts/${attemptId}/submit`, method: "POST" },
                    "Failed to submit the exam",
                    "Exam submitted"
                );
                if (res.success && res.data) {
                    applyAttemptPayload(res.data);
                    await refreshStudentViews();
                } else {
                    await resyncAttempt(attemptId);
                }
                return res;
            } finally {
                setSubmittingAttempt(false);
            }
        },
        [applyAttemptPayload, refreshStudentViews, resyncAttempt]
    );

    const getAttemptReport = useCallback(async (attemptId: string): Promise<StandardResponse<ExamAttemptReport>> => {
        setLoadingReport(true);
        try {
            const res = await request<ExamAttemptReport>({ path: `${STUDENT}/attempts/${attemptId}/report` }, "Failed to fetch the report");
            setAttemptReport(res.success ? res.data : null);
            return res;
        } finally {
            setLoadingReport(false);
        }
    }, []);

    const clearActiveAttempt = useCallback(() => {
        setActive(null);
        setAttemptResult(null);
        setAttemptReport(null);
    }, [setActive]);

    /* ================================================== admin: helpers */

    const savingCountRef = useRef(0);

    /** Admin mutation: toggles `saving` (counted, so overlapping calls don't clear it early) and refreshes on success. */
    const mutate = useCallback(
        async <T,>(
            options: RequestOptions,
            fallback: string,
            successMessage: string,
            after?: (data: T) => unknown | Promise<unknown>
        ): Promise<StandardResponse<T>> => {
            savingCountRef.current += 1;
            setSaving(true);
            try {
                const res = await request<T>(options, fallback, successMessage);
                if (res.success && after) await after(res.data as T);
                return res;
            } finally {
                savingCountRef.current -= 1;
                if (savingCountRef.current === 0) setSaving(false);
            }
        },
        []
    );

    const refreshExamViews = useCallback(() => Promise.all([refreshAdminExam(), refreshAdminExams()]), [refreshAdminExam, refreshAdminExams]);
    const refreshSetViews = useCallback(() => Promise.all([refreshAdminSet(), refreshAdminExam()]), [refreshAdminSet, refreshAdminExam]);

    /* ==================================================== admin: exams */

    const getAdminExams = useCallback(
        async (filters: AdminExamFilters = {}): Promise<StandardResponse<PaginatedResult<AdminExamListItem>>> => {
            setLoadingAdminExams(true);
            try {
                const res = await request<PaginatedResult<AdminExamListItem>>(
                    { path: `${ADMIN}/exams`, params: cleanParams(filters) },
                    "Failed to fetch exams"
                );
                if (res.success && res.data) {
                    adminExamsFiltersRef.current = filters;
                    setAdminExams(res.data);
                }
                return res;
            } finally {
                setLoadingAdminExams(false);
            }
        },
        []
    );

    const createExam = useCallback(
        (input: CreateExamInput) =>
            mutate<ExamWithRounds>({ path: `${ADMIN}/exams`, method: "POST", body: input }, "Failed to create the exam", "Exam created", refreshAdminExams),
        [mutate, refreshAdminExams]
    );

    const getAdminExam = useCallback(async (examId: string): Promise<StandardResponse<AdminExamTree>> => {
        setLoadingAdminExam(true);
        try {
            const res = await request<AdminExamTree>({ path: `${ADMIN}/exams/${examId}` }, "Failed to fetch the exam");
            if (res.success && res.data) {
                if (adminExamIdRef.current !== examId) setPublishCheck(null);
                adminExamIdRef.current = examId;
                setAdminExam(res.data);
            }
            return res;
        } finally {
            setLoadingAdminExam(false);
        }
    }, []);

    const updateExam = useCallback(
        (examId: string, input: UpdateExamInput) =>
            mutate<ExamRecord>({ path: `${ADMIN}/exams/${examId}`, method: "PUT", body: input }, "Failed to update the exam", "Exam updated", refreshExamViews),
        [mutate, refreshExamViews]
    );

    const deleteExam = useCallback(
        (examId: string) =>
            mutate<null>({ path: `${ADMIN}/exams/${examId}`, method: "DELETE" }, "Failed to delete the exam", "Exam deleted", async () => {
                if (adminExamIdRef.current === examId) {
                    adminExamIdRef.current = null;
                    setAdminExam(null);
                    setPublishCheck(null);
                }
                await refreshAdminExams();
            }),
        [mutate, refreshAdminExams]
    );

    const getExamPublishCheck = useCallback(async (examId: string): Promise<StandardResponse<ExamPublishCheck>> => {
        const res = await request<ExamPublishCheck>({ path: `${ADMIN}/exams/${examId}/publish-check` }, "Failed to run the publish check");
        if (res.success && res.data) setPublishCheck(res.data);
        return res;
    }, []);

    const setExamStatus = useCallback(
        (examId: string, action: "publish" | "unpublish" | "archive", successMessage: string) =>
            mutate<ExamRecord>(
                { path: `${ADMIN}/exams/${examId}/${action}`, method: "POST" },
                `Failed to ${action} the exam`,
                successMessage,
                async () => {
                    await refreshExamViews();
                    if (action === "publish") setPublishCheck(null);
                }
            ),
        [mutate, refreshExamViews]
    );

    const publishExam = useCallback((examId: string) => setExamStatus(examId, "publish", "Exam published"), [setExamStatus]);
    const unpublishExam = useCallback((examId: string) => setExamStatus(examId, "unpublish", "Exam moved back to draft"), [setExamStatus]);
    const archiveExam = useCallback((examId: string) => setExamStatus(examId, "archive", "Exam archived"), [setExamStatus]);

    const resyncExam = useCallback(
        (examId: string) =>
            mutate<{ synced: number }>(
                { path: `${ADMIN}/exams/${examId}/resync`, method: "POST" },
                "Failed to recompute candidates",
                "Candidates recomputed",
                () => Promise.all([refreshCandidates(), refreshCandidate(), refreshAdminExam()])
            ),
        [mutate, refreshCandidates, refreshCandidate, refreshAdminExam]
    );

    /* =================================================== admin: rounds */

    const createRound = useCallback(
        (examId: string, input: ExamRoundInput) =>
            mutate<ExamRoundRecord>(
                { path: `${ADMIN}/exams/${examId}/rounds`, method: "POST", body: input },
                "Failed to add the round",
                "Round added",
                refreshExamViews
            ),
        [mutate, refreshExamViews]
    );

    const updateRound = useCallback(
        (roundId: string, input: UpdateExamRoundInput) =>
            mutate<ExamRoundRecord>(
                { path: `${ADMIN}/rounds/${roundId}`, method: "PUT", body: input },
                "Failed to update the round",
                "Round updated",
                refreshSetViews
            ),
        [mutate, refreshSetViews]
    );

    const deleteRound = useCallback(
        (roundId: string) =>
            mutate<null>({ path: `${ADMIN}/rounds/${roundId}`, method: "DELETE" }, "Failed to delete the round", "Round deleted", async () => {
                if (adminSetRoundIdRef.current === roundId) {
                    adminSetIdRef.current = null;
                    adminSetRoundIdRef.current = null;
                    setAdminSet(null);
                }
                await refreshExamViews();
            }),
        [mutate, refreshExamViews]
    );

    const reorderRounds = useCallback(
        (examId: string, roundIds: string[]) =>
            mutate<ExamWithRounds>(
                { path: `${ADMIN}/exams/${examId}/rounds/reorder`, method: "PUT", body: { roundIds } },
                "Failed to reorder rounds",
                "Rounds reordered",
                refreshAdminExam
            ),
        [mutate, refreshAdminExam]
    );

    /* ===================================================== admin: sets */

    const getRoundSets = useCallback(
        (roundId: string) => request<ExamSetRecord[]>({ path: `${ADMIN}/rounds/${roundId}/sets` }, "Failed to fetch sets"),
        []
    );

    const createSet = useCallback(
        (roundId: string, input: ExamSetInput = {}) =>
            mutate<ExamSetRecord>(
                { path: `${ADMIN}/rounds/${roundId}/sets`, method: "POST", body: input },
                "Failed to create the set",
                "Set created",
                refreshAdminExam
            ),
        [mutate, refreshAdminExam]
    );

    const getAdminSet = useCallback(async (setId: string): Promise<StandardResponse<AdminExamSetDetail>> => {
        setLoadingAdminSet(true);
        try {
            const res = await request<AdminExamSetDetail>({ path: `${ADMIN}/sets/${setId}` }, "Failed to fetch the set");
            if (res.success && res.data) {
                adminSetIdRef.current = setId;
                adminSetRoundIdRef.current = res.data.roundId;
                setAdminSet(res.data);
            }
            return res;
        } finally {
            setLoadingAdminSet(false);
        }
    }, []);

    const updateSet = useCallback(
        (setId: string, input: ExamSetInput) =>
            mutate<ExamSetRecord>({ path: `${ADMIN}/sets/${setId}`, method: "PUT", body: input }, "Failed to update the set", "Set updated", refreshSetViews),
        [mutate, refreshSetViews]
    );

    const deleteSet = useCallback(
        (setId: string) =>
            mutate<null>({ path: `${ADMIN}/sets/${setId}`, method: "DELETE" }, "Failed to delete the set", "Set deleted", async () => {
                if (adminSetIdRef.current === setId) {
                    adminSetIdRef.current = null;
                    adminSetRoundIdRef.current = null;
                    setAdminSet(null);
                }
                await refreshAdminExam();
            }),
        [mutate, refreshAdminExam]
    );

    const changeSetStatus = useCallback(
        (setId: string, action: "publish" | "unpublish" | "retire", successMessage: string) =>
            mutate<ExamSetRecord>(
                { path: `${ADMIN}/sets/${setId}/${action}`, method: "POST" },
                `Failed to ${action} the set`,
                successMessage,
                refreshSetViews
            ),
        [mutate, refreshSetViews]
    );

    const publishSet = useCallback((setId: string) => changeSetStatus(setId, "publish", "Set published"), [changeSetStatus]);
    const unpublishSet = useCallback((setId: string) => changeSetStatus(setId, "unpublish", "Set moved back to draft"), [changeSetStatus]);
    const retireSet = useCallback((setId: string) => changeSetStatus(setId, "retire", "Set retired"), [changeSetStatus]);

    const cloneSet = useCallback(
        (setId: string, input: ExamSetInput = {}) =>
            mutate<ExamSetRecord>(
                { path: `${ADMIN}/sets/${setId}/clone`, method: "POST", body: input },
                "Failed to clone the set",
                "Set cloned as a new draft",
                refreshAdminExam
            ),
        [mutate, refreshAdminExam]
    );

    /* ================================================ admin: questions */

    const createQuestion = useCallback(
        (setId: string, input: ExamQuestionInput) =>
            mutate<ExamQuestionWithOptions>(
                { path: `${ADMIN}/sets/${setId}/questions`, method: "POST", body: input },
                "Failed to add the question",
                "Question added",
                refreshSetViews
            ),
        [mutate, refreshSetViews]
    );

    const importQuestions = useCallback(
        (setId: string, questions: ExamQuestionInput[]) =>
            mutate<{ imported: number }>(
                { path: `${ADMIN}/sets/${setId}/questions/import`, method: "POST", body: { questions } },
                "Failed to import questions",
                "Questions imported",
                refreshSetViews
            ),
        [mutate, refreshSetViews]
    );

    const reorderQuestions = useCallback(
        (setId: string, questionIds: string[]) =>
            mutate<{ reordered: number }>(
                { path: `${ADMIN}/sets/${setId}/questions/reorder`, method: "PUT", body: { questionIds } },
                "Failed to reorder questions",
                "Questions reordered",
                refreshAdminSet
            ),
        [mutate, refreshAdminSet]
    );

    const updateQuestion = useCallback(
        (questionId: string, input: ExamQuestionInput) =>
            mutate<ExamQuestionWithOptions>(
                { path: `${ADMIN}/questions/${questionId}`, method: "PUT", body: input },
                "Failed to update the question",
                "Question updated",
                refreshSetViews
            ),
        [mutate, refreshSetViews]
    );

    const deleteQuestion = useCallback(
        (questionId: string) =>
            mutate<null>({ path: `${ADMIN}/questions/${questionId}`, method: "DELETE" }, "Failed to delete the question", "Question deleted", refreshSetViews),
        [mutate, refreshSetViews]
    );

    /* =============================================== admin: candidates */

    const getExamCandidates = useCallback(
        async (examId: string, filters: CandidateFilters = {}): Promise<StandardResponse<PaginatedResult<AdminCandidateListItem>>> => {
            setLoadingCandidates(true);
            try {
                const res = await request<PaginatedResult<AdminCandidateListItem>>(
                    { path: `${ADMIN}/exams/${examId}/candidates`, params: cleanParams(filters) },
                    "Failed to fetch candidates"
                );
                if (res.success && res.data) {
                    candidatesKeyRef.current = { examId, filters };
                    setExamCandidates(res.data);
                }
                return res;
            } finally {
                setLoadingCandidates(false);
            }
        },
        []
    );

    const getExamCandidate = useCallback(async (examId: string, studentId: string): Promise<StandardResponse<AdminCandidateDetail>> => {
        setLoadingCandidate(true);
        try {
            const res = await request<AdminCandidateDetail>(
                { path: `${ADMIN}/exams/${examId}/students/${studentId}` },
                "Failed to fetch the candidate"
            );
            if (res.success && res.data) {
                candidateKeyRef.current = { examId, studentId };
                setCandidateDetail(res.data);
            }
            return res;
        } finally {
            setLoadingCandidate(false);
        }
    }, []);

    const refreshCandidateViews = useCallback(() => Promise.all([refreshCandidate(), refreshCandidates()]), [refreshCandidate, refreshCandidates]);

    const setCandidateUnlock = useCallback(
        (examId: string, studentId: string, input: UnlockOverrideInput) =>
            mutate<{ candidate: ExamCandidateRecord; unlock: ExamUnlockState }>(
                { path: `${ADMIN}/exams/${examId}/students/${studentId}/unlock`, method: "PUT", body: input },
                "Failed to update the unlock",
                input.override === "locked" ? "Exam locked for the student" : input.override === "unlocked" ? "Exam unlocked for the student" : "Unlock rule restored",
                refreshCandidateViews
            ),
        [mutate, refreshCandidateViews]
    );

    const grantExtraAttempts = useCallback(
        (examId: string, studentId: string, roundId: string, input: GrantAttemptsInput) =>
            mutate<ExamRoundState>(
                { path: `${ADMIN}/exams/${examId}/students/${studentId}/rounds/${roundId}/grant-attempts`, method: "POST", body: input },
                "Failed to grant attempts",
                `${input.extraAttempts} extra attempt${input.extraAttempts === 1 ? "" : "s"} granted`,
                refreshCandidateViews
            ),
        [mutate, refreshCandidateViews]
    );

    const waiveCooldown = useCallback(
        (examId: string, studentId: string, roundId: string, reason: string) =>
            mutate<ExamRoundState>(
                { path: `${ADMIN}/exams/${examId}/students/${studentId}/rounds/${roundId}/waive-cooldown`, method: "POST", body: { reason } },
                "Failed to waive the cooldown",
                "Cooldown waived",
                refreshCandidateViews
            ),
        [mutate, refreshCandidateViews]
    );

    const startAttemptForStudent = useCallback(
        (examId: string, studentId: string, roundId: string) =>
            mutate<ExamAttemptPayload>(
                { path: `${ADMIN}/exams/${examId}/students/${studentId}/attempts`, method: "POST", body: { roundId } },
                "Failed to start the attempt",
                "Attempt started",
                () => Promise.all([refreshCandidateViews(), refreshAttempts(), refreshAdminExam()])
            ),
        [mutate, refreshCandidateViews, refreshAttempts, refreshAdminExam]
    );

    /* ======================================= admin: attempts & evaluation */

    const getAdminAttempts = useCallback(
        async (filters: AdminAttemptFilters = {}): Promise<StandardResponse<PaginatedResult<AdminAttemptListItem>>> => {
            setLoadingAttempts(true);
            try {
                const res = await request<PaginatedResult<AdminAttemptListItem>>(
                    { path: `${ADMIN}/attempts`, params: cleanParams(filters) },
                    "Failed to fetch attempts"
                );
                if (res.success && res.data) {
                    attemptsFiltersRef.current = filters;
                    setExamAttempts(res.data);
                }
                return res;
            } finally {
                setLoadingAttempts(false);
            }
        },
        []
    );

    const getAdminAttempt = useCallback(async (attemptId: string): Promise<StandardResponse<AdminAttemptDetail>> => {
        setLoadingAttemptDetail(true);
        try {
            const res = await request<AdminAttemptDetail>({ path: `${ADMIN}/attempts/${attemptId}` }, "Failed to fetch the attempt");
            if (res.success && res.data) {
                attemptDetailIdRef.current = attemptId;
                setAttemptDetail(res.data);
            }
            return res;
        } finally {
            setLoadingAttemptDetail(false);
        }
    }, []);

    const evaluateAttempt = useCallback(
        (attemptId: string, input: EvaluateAttemptInput) =>
            mutate<EvaluateAttemptResult>(
                { path: `${ADMIN}/attempts/${attemptId}/evaluate`, method: "POST", body: { responses: [], finalize: false, ...input } },
                "Failed to save the evaluation",
                input.finalize ? "Attempt evaluated" : "Marks saved",
                refreshEvaluationViews
            ),
        [mutate, refreshEvaluationViews]
    );

    const rerunAiEvaluation = useCallback(
        (attemptId: string) =>
            mutate<null>(
                { path: `${ADMIN}/attempts/${attemptId}/ai-evaluate`, method: "POST" },
                "Failed to queue AI evaluation",
                "AI evaluation queued",
                refreshEvaluationViews
            ),
        [mutate, refreshEvaluationViews]
    );

    const forceSubmitAttempt = useCallback(
        (attemptId: string, reason: string) =>
            mutate<ExamAttemptResultSummary>(
                { path: `${ADMIN}/attempts/${attemptId}/submit`, method: "POST", body: { reason } },
                "Failed to submit the attempt",
                "Attempt submitted",
                refreshEvaluationViews
            ),
        [mutate, refreshEvaluationViews]
    );

    const voidAttempt = useCallback(
        (attemptId: string, input: VoidAttemptInput) =>
            mutate<VoidAttemptResult>(
                { path: `${ADMIN}/attempts/${attemptId}/void`, method: "POST", body: { refundAttempt: true, ...input } },
                "Failed to void the attempt",
                "Attempt voided",
                refreshEvaluationViews
            ),
        [mutate, refreshEvaluationViews]
    );

    /* ============================================= admin: certificates */

    const getExamCertificates = useCallback(
        async (filters: CertificateFilters = {}): Promise<StandardResponse<PaginatedResult<ExamCertificateRecord>>> => {
            setLoadingCertificates(true);
            try {
                const res = await request<PaginatedResult<ExamCertificateRecord>>(
                    { path: `${ADMIN}/certificates`, params: cleanParams(filters) },
                    "Failed to fetch certificates"
                );
                if (res.success && res.data) {
                    certificatesFiltersRef.current = filters;
                    setExamCertificates(res.data);
                }
                return res;
            } finally {
                setLoadingCertificates(false);
            }
        },
        []
    );

    const changeCertificateStatus = useCallback(
        (certificateId: string, action: "revoke" | "reinstate", reason: string) =>
            mutate<ExamCertificateRecord>(
                { path: `${ADMIN}/certificates/${certificateId}/${action}`, method: "POST", body: { reason } },
                `Failed to ${action} the certificate`,
                action === "revoke" ? "Certificate revoked" : "Certificate reinstated",
                () => Promise.all([refreshCertificates(), refreshCandidateViews()])
            ),
        [mutate, refreshCertificates, refreshCandidateViews]
    );

    const revokeCertificate = useCallback(
        (certificateId: string, reason: string) => changeCertificateStatus(certificateId, "revoke", reason),
        [changeCertificateStatus]
    );
    const reinstateCertificate = useCallback(
        (certificateId: string, reason: string) => changeCertificateStatus(certificateId, "reinstate", reason),
        [changeCertificateStatus]
    );

    /* ============================================================ value */

    const value = useMemo<ExamContextValue>(
        () => ({
            studentExams,
            examDetail,
            examCertificate,
            activeAttempt,
            attemptResult,
            attemptReport,
            loadingExams,
            loadingExamDetail,
            loadingAttempt,
            loadingReport,
            savingResponses,
            submittingAttempt,
            adminExams,
            adminExam,
            publishCheck,
            adminSet,
            examCandidates,
            candidateDetail,
            examAttempts,
            attemptDetail,
            examCertificates,
            loadingAdminExams,
            loadingAdminExam,
            loadingAdminSet,
            loadingCandidates,
            loadingCandidate,
            loadingAttempts,
            loadingAttemptDetail,
            loadingCertificates,
            saving,
            getStudentExams,
            getStudentExam,
            getExamCertificate,
            verifyCertificate,
            startExamAttempt,
            getExamAttempt,
            saveExamResponses,
            sendExamHeartbeat,
            reportProctorEvent,
            submitExamLabFlag,
            createAnswerUploadUrl,
            uploadAnswerFile,
            submitExamAttempt,
            getAttemptReport,
            clearActiveAttempt,
            getAdminExams,
            createExam,
            getAdminExam,
            updateExam,
            deleteExam,
            getExamPublishCheck,
            publishExam,
            unpublishExam,
            archiveExam,
            resyncExam,
            createRound,
            updateRound,
            deleteRound,
            reorderRounds,
            getRoundSets,
            createSet,
            getAdminSet,
            updateSet,
            deleteSet,
            publishSet,
            unpublishSet,
            retireSet,
            cloneSet,
            createQuestion,
            importQuestions,
            reorderQuestions,
            updateQuestion,
            deleteQuestion,
            getExamCandidates,
            getExamCandidate,
            setCandidateUnlock,
            grantExtraAttempts,
            waiveCooldown,
            startAttemptForStudent,
            getAdminAttempts,
            getAdminAttempt,
            evaluateAttempt,
            rerunAiEvaluation,
            forceSubmitAttempt,
            voidAttempt,
            getExamCertificates,
            revokeCertificate,
            reinstateCertificate,
        }),
        [
            studentExams,
            examDetail,
            examCertificate,
            activeAttempt,
            attemptResult,
            attemptReport,
            loadingExams,
            loadingExamDetail,
            loadingAttempt,
            loadingReport,
            savingResponses,
            submittingAttempt,
            adminExams,
            adminExam,
            publishCheck,
            adminSet,
            examCandidates,
            candidateDetail,
            examAttempts,
            attemptDetail,
            examCertificates,
            loadingAdminExams,
            loadingAdminExam,
            loadingAdminSet,
            loadingCandidates,
            loadingCandidate,
            loadingAttempts,
            loadingAttemptDetail,
            loadingCertificates,
            saving,
            getStudentExams,
            getStudentExam,
            getExamCertificate,
            verifyCertificate,
            startExamAttempt,
            getExamAttempt,
            saveExamResponses,
            sendExamHeartbeat,
            reportProctorEvent,
            submitExamLabFlag,
            createAnswerUploadUrl,
            uploadAnswerFile,
            submitExamAttempt,
            getAttemptReport,
            clearActiveAttempt,
            getAdminExams,
            createExam,
            getAdminExam,
            updateExam,
            deleteExam,
            getExamPublishCheck,
            publishExam,
            unpublishExam,
            archiveExam,
            resyncExam,
            createRound,
            updateRound,
            deleteRound,
            reorderRounds,
            getRoundSets,
            createSet,
            getAdminSet,
            updateSet,
            deleteSet,
            publishSet,
            unpublishSet,
            retireSet,
            cloneSet,
            createQuestion,
            importQuestions,
            reorderQuestions,
            updateQuestion,
            deleteQuestion,
            getExamCandidates,
            getExamCandidate,
            setCandidateUnlock,
            grantExtraAttempts,
            waiveCooldown,
            startAttemptForStudent,
            getAdminAttempts,
            getAdminAttempt,
            evaluateAttempt,
            rerunAiEvaluation,
            forceSubmitAttempt,
            voidAttempt,
            getExamCertificates,
            revokeCertificate,
            reinstateCertificate,
        ]
    );

    return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

/** Certification exams: student exam flow + exam authoring / evaluation (admin). */
export function useExam(): ExamContextValue {
    const ctx = useContext(ExamContext);
    if (!ctx) throw new Error("useExam must be used inside <ExamProvider>");
    return ctx;
}
