/**
 * Static content + design tokens for the student "My Requests" screens
 * (Figma: LMS (3) › My Request). The pages currently run on this sample data
 * only — the backend `RequestContext` is intentionally not wired in.
 */
import { FONT_INTER, FONT_LATO, FONT_POPPINS } from "@/components/aish/tokens";

export const requestAsset = (name: string) => `/requests/${name}`;

// ─── Design tokens ─────────────────────────────────────────────────────────
export const RQ = {
    white: "#FFFFFF",
    n75: "#F2F2F2",
    n100: "#D9D9D9",
    n200: "#BFBFBF",
    n300: "#A6A6A6",
    n400: "#8C8C8C",
    n500: "#737373",
    n600: "#5A5A5A",
    n700: "#404040",
    n800: "#262626",
    primary75: "#E3E9F8",
    primary500: "#2F53AD",
    error500: "#D1293D",
    error600: "#C02638",
    warning: "#FFAD4F",
    modalStroke: "#508AF2",
    lmsButton:
        "linear-gradient(90deg, #0027AC 0%, #0B22AC 12.5%, #161DAC 25%, #2C14AC 43.572%, #4608AC 65.007%, #4F04AC 82.544%, #5900AC 100%)",
    cardFrame: "linear-gradient(186.5deg, rgba(92,32,178,0.24) 0%, rgba(140,36,255,0.24) 100%)",
    cardInner: "rgba(13,13,13,0.9)",
    timelineBox: "rgba(38,38,38,0.44)",
    timelineAccent: "linear-gradient(180deg, #2431B3 0%, #BE6E5D 50%, #BDA045 75%, #BAB31F 100%)",
    timelineLine: "linear-gradient(180deg, rgba(242,242,242,0.44) 0%, rgba(140,140,140,0.22) 100%)",
    chipButton: "linear-gradient(180deg, rgba(187,201,237,0.08) 0%, rgba(106,114,135,0.08) 100%)",
    tabGroupBg: "rgba(255,255,255,0.04)",
    tabGroupBorder: "rgba(191,191,191,0.25)",
    tabActiveBg: "linear-gradient(180deg, rgba(187,201,237,0.44) 0%, rgba(106,114,135,0.26) 100%)",
    filterBg: "rgba(38,38,38,0.44)",
    glassPanel:
        "linear-gradient(169deg, rgba(0,0,0,0.387) 1.338%, rgba(10,9,9,0.282) 48.715%, rgba(102,102,102,0.009) 96.091%)",
    glassInset: "inset 0 0 6px rgba(255,255,255,0.16)",
    iconButton: "linear-gradient(180deg, rgba(227,233,248,0.08) 0%, rgba(134,137,146,0.04) 100%)",
    attachmentRow: "linear-gradient(90deg, rgba(38,38,38,0.5) 0%, rgba(140,140,140,0) 100%)",
    acceptedMarker: "linear-gradient(90.71deg, #2EC4B6 4.52%, #1B4C33 104.18%)",
    overlay: "rgba(64,64,64,0.24)",
    dropdownBg: "rgba(38,38,38,0.88)",
    dropdownShadow: "0 8px 24px rgba(255,255,255,0.08)",
    dropdownActive: "rgba(147,169,226,0.12)",
} as const;

// ─── Text presets (Figma text styles; letterSpacing 0 overrides MUI body1) ─
export const TEXT = {
    med10: { fontFamily: FONT_LATO, fontWeight: 500, fontSize: "10px", lineHeight: "15px", letterSpacing: 0 },
    reg12: { fontFamily: FONT_LATO, fontWeight: 400, fontSize: "12px", lineHeight: "18px", letterSpacing: 0 },
    med12: { fontFamily: FONT_LATO, fontWeight: 500, fontSize: "12px", lineHeight: "18px", letterSpacing: 0 },
    reg14: { fontFamily: FONT_LATO, fontWeight: 400, fontSize: "14px", lineHeight: "21px", letterSpacing: 0 },
    med14: { fontFamily: FONT_LATO, fontWeight: 500, fontSize: "14px", lineHeight: "21px", letterSpacing: 0 },
    reg16: { fontFamily: FONT_LATO, fontWeight: 400, fontSize: "16px", lineHeight: "24px", letterSpacing: 0 },
    med16: { fontFamily: FONT_LATO, fontWeight: 500, fontSize: "16px", lineHeight: "24px", letterSpacing: 0 },
    semi18: { fontFamily: FONT_LATO, fontWeight: 600, fontSize: "18px", lineHeight: "27px", letterSpacing: 0 },
    interReg12: { fontFamily: FONT_INTER, fontWeight: 400, fontSize: "12px", lineHeight: "18px", letterSpacing: 0 },
    interReg14: { fontFamily: FONT_INTER, fontWeight: 400, fontSize: "14px", lineHeight: "21px", letterSpacing: 0 },
    interMed14: { fontFamily: FONT_INTER, fontWeight: 500, fontSize: "14px", lineHeight: "21px", letterSpacing: 0 },
    interReg16: { fontFamily: FONT_INTER, fontWeight: 400, fontSize: "16px", lineHeight: "24px", letterSpacing: 0 },
    interMed16: { fontFamily: FONT_INTER, fontWeight: 500, fontSize: "16px", lineHeight: "24px", letterSpacing: 0 },
    poppinsMed20: { fontFamily: FONT_POPPINS, fontWeight: 500, fontSize: "20px", lineHeight: "30px", letterSpacing: 0 },
    poppinsSemi24: { fontFamily: FONT_POPPINS, fontWeight: 600, fontSize: "24px", lineHeight: "36px", letterSpacing: 0 },
    poppinsSemi28: { fontFamily: FONT_POPPINS, fontWeight: 600, fontSize: "28px", lineHeight: "42px", letterSpacing: 0 },
} as const;

// ─── Types ─────────────────────────────────────────────────────────────────
export type RequestTab = "active" | "resolved" | "rejected";

export type TimelineKind = "step" | "accepted" | "rejected";

export interface TimelineItem {
    id: string;
    title: string;
    note?: string;
    kind: TimelineKind;
    /** ISO timestamp. */
    at: string;
}

export interface RequestAttachment {
    name: string;
    sizeLabel: string;
    url?: string;
}

export interface SampleRequest {
    id: string;
    tab: RequestTab;
    /** Card heading, e.g. "Batch Change". */
    category: string;
    /** Drawer chip next to the status pill, e.g. "Academic". */
    tag: string;
    /** Drawer heading. */
    title: string;
    description: string;
    attachment?: RequestAttachment;
    createdAt: string;
    /** Card status row, e.g. "Under review by RM" / "Resolved on" / "Feedback Added". */
    statusLabel: string;
    statusAt: string;
    repliesIn?: string;
    timeline: TimelineItem[];
    expectedResponse?: string;
    nextStep?: string;
    rejectionReason?: string;
    feedback?: "up" | "down" | null;
}

export const REQUEST_CATEGORIES = [
    "Batch Change",
    "Leave Request",
    "Fee Query",
    "Assignment",
    "Lab Access",
    "Attendance",
    "Placement",
    "Technical Support",
    "Certificate",
    "General",
] as const;

/** Drawer chip shown for each category. */
export const CATEGORY_TAG: Record<string, string> = {
    "Batch Change": "Academic",
    "Leave Request": "Academic",
    "Fee Query": "Finance",
    Assignment: "Academic",
    "Lab Access": "Technical",
    Attendance: "Academic",
    Placement: "Career",
    "Technical Support": "Technical",
    Certificate: "Academic",
    General: "General",
};

export type SortOption = "newest" | "oldest";
export type DateRange = "all" | "7d" | "30d" | "90d" | "year";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
];

export const DATE_OPTIONS: { value: DateRange; label: string }[] = [
    { value: "all", label: "All time" },
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "year", label: "This year" },
];

// ─── Sample data (copy from the Figma screens) ─────────────────────────────
const DESCRIPTION =
    "I’m facing a scheduling conflict with my current batch timing, which is making it difficult for me to attend sessions regularly. I would like to request a transfer to another available batch that better matches my availability so I can continue the course without interruption.";
const ATTACHMENT: RequestAttachment = { name: "Report name_T1.pdf", sizeLabel: "2.5MB" };
const STEP_AT = "2026-04-12T14:30:00+05:30";

const submitted = (id: string): TimelineItem => ({ id: `${id}-submitted`, title: "Request Submitted", note: "Reply within 24 hours", kind: "step", at: STEP_AT });
const review = (id: string): TimelineItem => ({ id: `${id}-review`, title: "Under review by RM", note: "RM is checking", kind: "step", at: STEP_AT });

function active(id: string, category: string, createdAt: string): SampleRequest {
    return {
        id,
        tab: "active",
        category,
        tag: "Academic",
        title: "Request to shift morning CCNA batch to evening",
        description: DESCRIPTION,
        attachment: ATTACHMENT,
        createdAt,
        statusLabel: "Under review by RM",
        statusAt: STEP_AT,
        repliesIn: "24h",
        timeline: [submitted(id), review(id)],
        expectedResponse: "Expected response within 24 hours",
    };
}

function resolved(id: string, category: string, createdAt: string): SampleRequest {
    return {
        id,
        tab: "resolved",
        category,
        tag: "Academic",
        title: "Request to shift morning CCNA batch to evening",
        description: DESCRIPTION,
        attachment: ATTACHMENT,
        createdAt,
        statusLabel: "Resolved on",
        statusAt: STEP_AT,
        timeline: [submitted(id), review(id), { id: `${id}-accepted`, title: "Request Accepted", kind: "accepted", at: STEP_AT }],
        nextStep: "Your batch has been successfully updated. Check your updated schedule and join the upcoming session.",
        feedback: null,
    };
}

function rejected(id: string, category: string, createdAt: string): SampleRequest {
    return {
        id,
        tab: "rejected",
        category,
        tag: "Academic",
        title: "Request to shift morning CCNA batch to evening",
        description: DESCRIPTION,
        attachment: ATTACHMENT,
        createdAt,
        statusLabel: "Feedback Added",
        statusAt: STEP_AT,
        timeline: [submitted(id), review(id), { id: `${id}-rejected`, title: "Request Rejected", kind: "rejected", at: STEP_AT }],
        rejectionReason:
            "Your requested batch is currently full. We’re unable to move you to this slot at the moment. \nYou can choose another available batch or submit a new request later.",
        feedback: null,
    };
}

export const SAMPLE_REQUESTS: SampleRequest[] = [
    active("req-batch-change", "Batch Change", "2026-07-10T16:00:00+05:30"),
    active("req-leave", "Leave Request", "2026-07-10T15:00:00+05:30"),
    active("req-fee", "Fee Query", "2026-07-10T14:00:00+05:30"),
    active("req-assignment", "Assignment", "2026-07-10T13:00:00+05:30"),
    active("req-lab-access", "Lab Access", "2026-07-10T12:00:00+05:30"),
    resolved("req-attendance", "Attendance", "2026-07-10T16:00:00+05:30"),
    resolved("req-placement-resolved", "Placement", "2026-07-10T15:00:00+05:30"),
    resolved("req-tech-support", "Technical Support", "2026-07-10T14:00:00+05:30"),
    rejected("req-general", "General", "2026-07-10T16:00:00+05:30"),
    rejected("req-placement-rejected", "Placement", "2026-07-10T15:00:00+05:30"),
    rejected("req-certificate", "Certificate", "2026-07-10T14:00:00+05:30"),
];

/** Builds a new active request from the Create Request form. */
export function makeRequest(category: string, description: string, attachment?: RequestAttachment): SampleRequest {
    const now = new Date().toISOString();
    const id = `req-${Date.now()}`;
    return {
        id,
        tab: "active",
        category,
        tag: CATEGORY_TAG[category] ?? "General",
        title: category,
        description,
        attachment,
        createdAt: now,
        statusLabel: "Request Submitted",
        statusAt: now,
        repliesIn: "24h",
        timeline: [{ ...submitted(id), at: now }],
        expectedResponse: "Expected response within 24 hours",
    };
}

// ─── Helpers ───────────────────────────────────────────────────────────────
/** "12 April, 2026" */
export function formatDay(iso: string) {
    const d = new Date(iso);
    return `${d.getDate()} ${d.toLocaleString("en-US", { month: "long" })}, ${d.getFullYear()}`;
}

/** "2:30 PM" */
export function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

/** "July 10, 2026" */
export function formatCreated(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function inDateRange(iso: string, range: DateRange, now = Date.now()) {
    if (range === "all") return true;
    const ts = new Date(iso).getTime();
    if (range === "year") return new Date(ts).getFullYear() === new Date(now).getFullYear();
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    return now - ts <= days * 24 * 60 * 60 * 1000;
}
