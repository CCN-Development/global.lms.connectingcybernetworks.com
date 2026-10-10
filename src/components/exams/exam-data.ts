// Mock data for the student "Exam" screens (Figma: LMS (3) › Student Dashboard › Exam).
// Shapes mirror what the exams API is expected to return, so the UI stays server-driven.

export const EXAMS_PATH = "/dashboard/student/exams";
export const EXAM_ASSETS = "/exams";
export const examAsset = (name: string) => `${EXAM_ASSETS}/${name}`;

export const examDetailPath = (examId: string) => `${EXAMS_PATH}/${examId}`;
export const examCertificatePath = (examId: string) => `${EXAMS_PATH}/${examId}/certificate`;

// ─── List ──────────────────────────────────────────────────────────────────

export type ExamStatus = "ongoing" | "locked" | "completed" | "re-exam";

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

export type StageKind = "viva" | "mcq" | "lab" | "certificate";

/** Pill shown next to a round's title; rounds without one show the info tooltip instead. */
export type StageBadge = "eligible" | "not-cleared";

/** Call-to-action on the right of a round. */
export type StageAction = "start" | "retake" | "download" | "locked" | "view-certificate";

export interface ExamAttempt {
    attemptNo: number;
    /** ISO date (yyyy-mm-dd). */
    date: string;
    /** hh:mm:ss */
    timeTaken: string;
    correctPct: number;
    passed: boolean;
}

export interface ExamStage {
    stageId: string;
    kind: StageKind;
    title: string;
    /** Copy for the info tooltip next to the title. */
    info: string;
    questions?: number;
    durationMins?: number;
    mode?: "Online" | "Offline";
    badge?: StageBadge;
    action: StageAction;
    /** Label for the `start` action ("Start Viva", "Start Exam"). */
    startLabel?: string;
    /** When set, an "N Attempt" chip is shown before the mode chip. */
    attemptsUsed?: number;
    attempts: ExamAttempt[];
}

export interface ExamCertificate {
    certificateId: string;
    candidate: string;
    courseName: string;
    courseShort: string;
    /** ISO dates (yyyy-mm-dd). */
    issueDate: string;
    validThrough: string;
    signatory: { name: string; title: string; organisation: string };
    verifyHost: string;
}

export interface Exam {
    examId: string;
    title: string;
    /** Header title on the detail pages. */
    courseName: string;
    courseShort: string;
    status: ExamStatus;
    includes: string[];
    stages: ExamStage[];
    certificate?: ExamCertificate;
}

// ─── Stage builders ────────────────────────────────────────────────────────

const STAGE_INFO: Record<StageKind, string> = {
    viva: "One-on-one technical viva with your trainer.",
    mcq: "Unlocks after you clear the Technical Viva.",
    lab: "Unlocks after you clear the MCQ Exam.",
    certificate: "Issued once you clear every round of this exam.",
};

type StageOverrides = Partial<Omit<ExamStage, "stageId" | "kind">>;

const viva = (o: StageOverrides = {}): ExamStage => ({
    stageId: "viva",
    kind: "viva",
    title: "Technical Viva",
    info: STAGE_INFO.viva,
    questions: 150,
    durationMins: 90,
    mode: "Offline",
    action: "locked",
    startLabel: "Start Viva",
    attempts: [],
    ...o,
});

const mcq = (o: StageOverrides = {}): ExamStage => ({
    stageId: "mcq",
    kind: "mcq",
    title: "MCQ Exam",
    info: STAGE_INFO.mcq,
    questions: 150,
    durationMins: 90,
    mode: "Online",
    action: "locked",
    startLabel: "Start Exam",
    attempts: [],
    ...o,
});

const lab = (o: StageOverrides = {}): ExamStage => ({
    stageId: "lab",
    kind: "lab",
    title: "Practical Lab",
    info: STAGE_INFO.lab,
    questions: 150,
    durationMins: 90,
    mode: "Offline",
    action: "locked",
    startLabel: "Start Lab",
    attempts: [],
    ...o,
});

const certificateStage = (o: StageOverrides = {}): ExamStage => ({
    stageId: "certificate",
    kind: "certificate",
    title: "Certificate",
    info: STAGE_INFO.certificate,
    action: "locked",
    attempts: [],
    ...o,
});

const failed = (attemptNo: number): ExamAttempt => ({ attemptNo, date: "2026-07-22", timeTaken: "50:09:20", correctPct: 10, passed: false });
const passed = (attemptNo = 1): ExamAttempt => ({ attemptNo, date: "2026-07-22", timeTaken: "50:09:20", correctPct: 92, passed: true });

/**
 * Progression snapshots, one per Figma frame; `?state=<key>` on the detail page previews any of them.
 * Eligible → Not Cleared → Viva cleared → MCQ cleared → Certified.
 */
export const EXAM_STATE_PRESETS = {
    "viva-eligible": () => [viva({ badge: "eligible", action: "start" }), mcq(), lab(), certificateStage()],
    "viva-not-cleared": () => [
        viva({ badge: "not-cleared", action: "retake", attempts: [failed(1), failed(2), failed(3)] }),
        mcq(),
        lab(),
        certificateStage(),
    ],
    "viva-cleared": () => [
        viva({ action: "download", attemptsUsed: 1, attempts: [passed()] }),
        mcq({ badge: "eligible", action: "start" }),
        lab(),
        certificateStage(),
    ],
    "mcq-cleared": () => [
        viva({ action: "download", attemptsUsed: 1, attempts: [passed()] }),
        mcq({ badge: "eligible", action: "start", attempts: [passed()] }),
        lab({ attempts: [passed()] }),
        certificateStage(),
    ],
    certified: () => [
        viva({ action: "download", attemptsUsed: 1, attempts: [passed()] }),
        mcq({ badge: "eligible", action: "download", attempts: [passed()] }),
        lab({ action: "download", attemptsUsed: 1, attempts: [passed()] }),
        certificateStage({ action: "view-certificate" }),
    ],
    locked: () => [viva(), mcq(), lab(), certificateStage()],
} satisfies Record<string, () => ExamStage[]>;

export type ExamStateKey = keyof typeof EXAM_STATE_PRESETS;

export const isExamStateKey = (value: string | null | undefined): value is ExamStateKey =>
    Boolean(value && Object.prototype.hasOwnProperty.call(EXAM_STATE_PRESETS, value));

// ─── Exams ─────────────────────────────────────────────────────────────────

const CCNA_CERTIFICATE: ExamCertificate = {
    certificateId: "CCN-CERT-9327",
    candidate: "Aanchal Ravi Gupta",
    courseName: "Cisco Certified Network Associate (CCNA)",
    courseShort: "CCNA",
    issueDate: "2026-09-01",
    validThrough: "2029-09-01",
    signatory: { name: "Ashish Kumar Saini", title: "Chief Executive Officer", organisation: "Connecting Cyber Networks" },
    verifyHost: "verify.ccn.in",
};

export const EXAMS: Exam[] = [
    {
        examId: "ccna",
        title: "Cisco Certified Network Associate (CCNA)",
        courseName: "Cisco Certified Network Associate",
        courseShort: "CCNA",
        status: "ongoing",
        includes: ["Technical Viva", "MCQ", "Lab"],
        stages: EXAM_STATE_PRESETS["viva-eligible"](),
        certificate: CCNA_CERTIFICATE,
    },
    {
        examId: "bug-bounty",
        title: "Bug Bounty",
        courseName: "Bug Bounty",
        courseShort: "Bug Bounty",
        status: "locked",
        includes: ["Technical Viva", "MCQ", "Lab"],
        stages: EXAM_STATE_PRESETS.locked(),
    },
    {
        examId: "ethical-hacking",
        title: "Ethical Hacking",
        courseName: "Ethical Hacking",
        courseShort: "Ethical Hacking",
        status: "locked",
        includes: ["Technical Viva", "MCQ", "Lab"],
        stages: EXAM_STATE_PRESETS.locked(),
    },
    {
        examId: "soft-skills-re-exam",
        title: "Soft Skills",
        courseName: "Soft Skills",
        courseShort: "Soft Skills",
        status: "re-exam",
        includes: ["Technical Viva", "MCQ", "Lab"],
        stages: EXAM_STATE_PRESETS["viva-not-cleared"](),
    },
    {
        examId: "soft-skills",
        title: "Soft Skills",
        courseName: "Soft Skills",
        courseShort: "Soft Skills",
        status: "completed",
        includes: ["MCQ", "HR Round"],
        stages: EXAM_STATE_PRESETS.certified(),
        certificate: { ...CCNA_CERTIFICATE, certificateId: "CCN-CERT-9412", courseName: "Soft Skills", courseShort: "Soft Skills" },
    },
];

export const findExam = (examId: string | undefined) => EXAMS.find((exam) => exam.examId === examId);

export const isCertified = (stages: ExamStage[]) =>
    stages.some((stage) => stage.kind === "certificate" && stage.action === "view-certificate");

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
    const [year, month, day] = iso.split("-").map(Number);
    const dayLabel = ordinal(day);
    return `${padDay && day < 10 ? `0${dayLabel}` : dayLabel} ${MONTHS[month - 1]}, ${year}`;
}
