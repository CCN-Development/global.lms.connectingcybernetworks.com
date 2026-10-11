/**
 * Design tokens + view helpers for the student "My Requests" screens
 * (Figma: LMS (3) › My Request). Data comes from `RequestContext`; the helpers
 * below map persisted requests onto what each card / drawer element shows.
 */
import { FONT_INTER, FONT_LATO, FONT_POPPINS } from "@/components/aish/tokens";
import { tabForStatus, type RequestStatus, type RequestTab, type StudentRequest } from "@/contexts/RequestContext";

export type { RequestTab };

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

// ─── View types ────────────────────────────────────────────────────────────
export type TimelineKind = "step" | "accepted" | "rejected";

export interface TimelineItem {
    id: string;
    title: string;
    note?: string;
    kind: TimelineKind;
    /** ISO timestamp. */
    at: string;
}

export type FeedbackValue = "up" | "down";

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

// ─── Request → view mapping ────────────────────────────────────────────────
const ACCEPTED_STATUSES: RequestStatus[] = ["approved", "resolved"];
const CLOSED_NEGATIVE: RequestStatus[] = ["rejected", "withdrawn"];

export function requestTab(request: StudentRequest): RequestTab {
    return tabForStatus(request.requestStatus);
}

/**
 * Status history rows. Only the entry that moves a request into an accepted / rejected
 * state gets the coloured marker; later RM notes stay regular steps. The RM message on
 * accept / reject is shown in the "Next Step" / "Reason for Rejection" callout instead.
 */
export function timelineItems(request: StudentRequest): TimelineItem[] {
    let previous: RequestStatus | null = null;
    return request.requestTimelines.map((entry) => {
        const isTransition = entry.timelineStatus !== previous;
        previous = entry.timelineStatus;
        const kind: TimelineKind = !isTransition
            ? "step"
            : ACCEPTED_STATUSES.includes(entry.timelineStatus)
                ? "accepted"
                : CLOSED_NEGATIVE.includes(entry.timelineStatus)
                    ? "rejected"
                    : "step";
        const hideNote = kind === "accepted" || entry.timelineStatus === "rejected";
        return {
            id: entry.timelineId,
            title: entry.timelineTitle,
            note: !hideNote && entry.timelineNote ? entry.timelineNote : undefined,
            kind,
            at: entry.timelineDate,
        };
    });
}

/** Label + timestamp in the card's highlighted status row. */
export function cardStatus(request: StudentRequest): { label: string; at: string } {
    const latest = request.requestTimelines[request.requestTimelines.length - 1];
    const closedAt = request.requestResolutionDate ?? request.updatedAt;
    switch (request.requestStatus) {
        case "pending":
        case "in_review":
            return { label: latest?.timelineTitle ?? "Request Submitted", at: latest?.timelineDate ?? request.createdAt };
        case "approved":
            return { label: "Accepted on", at: closedAt };
        case "resolved":
            return { label: "Resolved on", at: closedAt };
        case "rejected":
            return { label: "Feedback Added", at: closedAt };
        case "withdrawn":
            return { label: "Withdrawn on", at: request.withdrawnAt ?? request.updatedAt };
    }
}

/** "24h" while the promised reply window is still running, otherwise null. */
export function repliesIn(request: StudentRequest, now = Date.now()): string | null {
    if (requestTab(request) !== "active") return null;
    const deadline = new Date(request.createdAt).getTime() + request.expectedResponseHours * 3_600_000;
    const left = deadline - now;
    if (left <= 0) return null;
    return `${Math.max(1, Math.ceil(left / 3_600_000))}h`;
}

export function feedbackValue(request: StudentRequest): FeedbackValue | null {
    if (request.isSatisfied === null) return null;
    return request.isSatisfied ? "up" : "down";
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

export function formatFileSize(bytes?: number | null) {
    if (!bytes || bytes <= 0) return "";
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/** Start of the selected "Date" filter window as an ISO string (undefined = all time). */
export function dateRangeStart(range: DateRange, now = new Date()): string | undefined {
    if (range === "all") return undefined;
    if (range === "year") return new Date(now.getFullYear(), 0, 1).toISOString();
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}
