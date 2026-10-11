// Shared constants, types and formatters for the student "Exam" screens (Figma: LMS (3) › Student Dashboard › Exam).
// Data comes from ExamContext (/api/v1/student-exam); these types are thin aliases so the UI stays server-driven.

import type {
    ExamCertificateView,
    ExamUiStatus,
    StageBadge as ApiStageBadge,
    StudentCertificateStage,
    StudentExamCard,
    StudentExamStage,
    StudentRoundStage,
    StudentStageAttempt,
} from "@/contexts/ExamContext";

export const EXAMS_PATH = "/dashboard/student/exams";
export const EXAM_ASSETS = "/exams";
export const examAsset = (name: string) => `${EXAM_ASSETS}/${name}`;

/** `examId` may be the exam id, course id or course slug — the API resolves all three. */
export const examDetailPath = (examId: string) => `${EXAMS_PATH}/${examId}`;
export const examCertificatePath = (examId: string) => `${EXAMS_PATH}/${examId}/certificate`;
export const examReportPath = (examId: string, attemptId: string) => `${EXAMS_PATH}/${examId}/attempts/${attemptId}`;

/**
 * Exams are taken only in the proctored "CCN Certified" desktop app (Microsoft Store);
 * the web portal shows rounds, attempts, results and certificates.
 */
export const DESKTOP_APP = {
    name: "CCN Certified",
    storeUrl: process.env.NEXT_PUBLIC_CCN_DESKTOP_STORE_URL || "https://apps.microsoft.com/search?query=CCN%20Certified",
} as const;

// ─── Types (API-backed) ────────────────────────────────────────────────────

export type ExamStatus = ExamUiStatus;
export type StageBadge = ApiStageBadge;
export type Exam = StudentExamCard;
export type ExamStage = StudentExamStage;
export type RoundStage = StudentRoundStage;
export type CertificateStage = StudentCertificateStage;
export type ExamAttempt = StudentStageAttempt;
export type ExamCertificate = ExamCertificateView;

export const isRoundStage = (stage: ExamStage): stage is RoundStage => stage.kind !== "certificate";

// ─── List ──────────────────────────────────────────────────────────────────

export const EXAM_STATUS_LABEL: Record<ExamStatus, string> = {
    ongoing: "Ongoing",
    locked: "Locked",
    completed: "Completed",
    "re-exam": "Re- Exam",
};

export type ExamFilter = "all" | ExamStatus;

export const EXAM_FILTERS: { value: ExamFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "ongoing", label: "Ongoing" },
    { value: "locked", label: "Locked" },
    { value: "completed", label: "Completed" },
    { value: "re-exam", label: "Re-Exam" },
];

// ─── Detail ────────────────────────────────────────────────────────────────

/** Tooltip copy when a round has no admin-written info. */
export const STAGE_INFO: Record<ExamStage["kind"], string> = {
    viva: "Technical viva — explain concepts in your own words.",
    mcq: "Multiple-choice exam — single and multiple correct answers.",
    lab: "Hands-on practical lab.",
    hr: "HR round — communication and professional readiness.",
    certificate: "Issued once you clear every mandatory round of this exam.",
};

export const isCertified = (stages: ExamStage[]) =>
    stages.some((stage) => stage.kind === "certificate" && stage.action === "view-certificate");

/** Latest passed attempt of a round (what "Download Result" opens). */
export const passedAttempt = (stage: RoundStage) => [...stage.attempts].reverse().find((attempt) => attempt.passed) ?? null;

// ─── Formatting ────────────────────────────────────────────────────────────

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function ordinal(n: number) {
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
    const suffix: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
    return `${n}${suffix[n % 10] ?? "th"}`;
}

/** "2026-07-22" → "22nd July, 2026"; `padDay` gives the certificate's "01st September, 2026". */
export function formatLongDate(iso: string, padDay = false) {
    const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
    const dayLabel = ordinal(day);
    return `${padDay && day < 10 ? `0${dayLabel}` : dayLabel} ${MONTHS[month - 1]}, ${year}`;
}

/** ISO timestamp → "12 Oct, 10:30 am" in the student's timezone. */
export function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export function formatClock(totalSec: number | null | undefined) {
    if (totalSec === null || totalSec === undefined) return "—";
    const s = Math.max(0, Math.round(totalSec));
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

export const formatScore = (value: number | null | undefined) => (value === null || value === undefined ? "—" : `${Math.round(value * 10) / 10}%`);
export const formatMarks = (value: number | null | undefined) => (value === null || value === undefined ? "—" : String(Math.round(value * 100) / 100));
