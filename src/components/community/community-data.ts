/** Design tokens, menu model and formatting helpers for the CCN Community forum (data comes from the API). */

import type { CommunityCapability, CommunityCategory, CommunityFeedCounts, PostStatus } from "@/contexts/CommunityContext";

export const communityAsset = (name: string) => `/community/${name}`;

// ─── Design tokens ─────────────────────────────────────────────────────────
export const CC = {
    white: "#FFFFFF",
    n75: "#F2F2F2",
    n100: "#D9D9D9",
    n200: "#BFBFBF",
    n300: "#A6A6A6",
    n400: "#8C8C8C",
    n500: "#737373",
    n700: "#404040",
    primary75: "#E3E9F8",
    primary200: "#93A9E2",
    primary500: "#2F53AD",
    primary800: "#0E1934",
    link: "#426ACC",
    purple: "#8C24FF",
    error: "#D1293D",
    success: "#2EC4B6",
    modalStroke: "#508AF2",
    lmsButton:
        "linear-gradient(90deg, #0027AC 0%, #0B22AC 12.5%, #161DAC 25%, #2C14AC 43.572%, #4608AC 65.007%, #4F04AC 82.544%, #5900AC 100%)",
    cardFill:
        "linear-gradient(172deg, rgba(0,0,0,0.563) 1.338%, rgba(10,9,9,0.41) 48.715%, rgba(102,102,102,0.013) 96.091%)",
    dropdownBg: "rgba(38,38,38,0.88)",
    dropdownShadow: "0 8px 24px rgba(255,255,255,0.08)",
    dropdownActive: "rgba(147,169,226,0.12)",
    filterBg: "rgba(38,38,38,0.44)",
    menuActive: "linear-gradient(105.44deg, rgba(64,64,64,0.5) 17.578%, rgba(64,64,64,0) 111.58%)",
    pollFill: "rgba(64,64,64,0.209)",
    pollVoted: "linear-gradient(161.09deg, rgba(140,36,255,0.5) 9.016%, rgba(77,31,153,0.5) 38.607%, rgba(14,25,52,0.5) 89.867%)",
    pollCorrect: "linear-gradient(161.09deg, rgba(46,196,182,0.45) 9.016%, rgba(27,76,51,0.45) 89.867%)",
    pollWrong: "linear-gradient(161.09deg, rgba(209,41,61,0.4) 9.016%, rgba(82,16,24,0.4) 89.867%)",
    pollOther: "rgba(217,217,217,0.04)",
} as const;

/** Student route; staff mount the same components at /dashboard/<role>/ccn-forum (see CommunityProvider basePath). */
export const STUDENT_COMMUNITY_PATH = "/dashboard/student/community";

export type CommunityVariant = "student" | "staff";

// ─── Staff management views (?view=…) ──────────────────────────────────────
export type ManageView = "queue" | "reports" | "members" | "spaces" | "taxonomy" | "analytics" | "log";

export interface ManageMenuItem {
    id: ManageView;
    label: string;
    /** Sidebar label when `label` is too long for the menu column. */
    short?: string;
    /** Shown only when the viewer has this global capability. */
    capability?: CommunityCapability;
}

export const MANAGE_MENU: ManageMenuItem[] = [
    { id: "queue", label: "Moderation Queue", short: "Approvals" },
    { id: "reports", label: "Reports", capability: "report.review" },
    { id: "members", label: "Members" },
    { id: "spaces", label: "Spaces" },
    { id: "taxonomy", label: "Categories & Tags", short: "Categories", capability: "taxonomy.manage" },
    { id: "analytics", label: "Analytics" },
    { id: "log", label: "Moderation Log" },
];

export const MANAGE_VIEWS = new Set<string>(MANAGE_MENU.map((m) => m.id));

// ─── Feed menu ─────────────────────────────────────────────────────────────
/** "all" | "pinned" | "mine" | "saved" or a category slug. */
export type FeedFilter = string;
export type SortKey = "latest" | "oldest" | "most-liked" | "most-replied" | "most-viewed";

export interface FeedMenuItem {
    id: FeedFilter;
    label: string;
    icon: string;
    rotateIcon?: boolean;
    /** Category swatch colour (category items only). */
    color?: string;
}

const LEAD_ITEMS: FeedMenuItem[] = [{ id: "all", label: "All Discussions", icon: "icon-layers.svg" }];
const TRAIL_ITEMS: FeedMenuItem[] = [
    { id: "pinned", label: "Pinned Posts", icon: "icon-pinned.svg" },
    { id: "mine", label: "My Discussions", icon: "icon-user.svg" },
    { id: "saved", label: "Saved Posts", icon: "icon-bookmark-24.svg" },
];
export const FIXED_FILTERS = new Set(["all", "pinned", "mine", "saved"]);
/** The Figma design shows this category's icon upside down. */
const ROTATED_ICONS = new Set(["lab-discussions"]);

/** All Discussions · one entry per active category · Pinned · Mine · Saved (the sidebar in the design). */
export function buildFeedMenu(categories: CommunityCategory[]): FeedMenuItem[] {
    return [
        ...LEAD_ITEMS,
        ...categories
            .filter((c) => c.isActive)
            .map((c) => ({ id: c.id, label: c.label, icon: c.icon ?? "icon-folder.svg", rotateIcon: ROTATED_ICONS.has(c.id), color: c.color })),
        ...TRAIL_ITEMS,
    ];
}

export const isCategoryFilter = (filter: FeedFilter) => !FIXED_FILTERS.has(filter);

export const feedLabel = (menu: FeedMenuItem[], filter: FeedFilter) => menu.find((m) => m.id === filter)?.label ?? "All Discussions";

export function menuCount(counts: CommunityFeedCounts | null, filter: FeedFilter): number {
    if (!counts) return 0;
    if (filter === "all" || filter === "pinned" || filter === "mine" || filter === "saved") return counts[filter];
    return counts.categories[filter] ?? 0;
}

export const SORT_OPTIONS: { id: SortKey; label: string }[] = [
    { id: "latest", label: "Latest" },
    { id: "oldest", label: "Oldest" },
    { id: "most-liked", label: "Most liked" },
    { id: "most-replied", label: "Most replied" },
    { id: "most-viewed", label: "Most viewed" },
];

export const POST_STATUS_LABELS: Partial<Record<PostStatus, string>> = {
    pending_review: "Waiting for approval",
    rejected: "Not approved",
    hidden: "Hidden by a moderator",
    deleted: "Deleted",
};

/** Minimal author shape the avatar / author row need (API authors satisfy it). */
export interface AuthorLike {
    name: string;
    avatar?: string | null;
    headline?: string | null;
    roleLabel?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const toTime = (value: number | string) => (typeof value === "number" ? value : new Date(value).getTime());

export function timeAgo(value: number | string, now = Date.now()) {
    const ts = toTime(value);
    const diff = Math.max(0, now - ts);
    if (diff < MIN) return "Just now";
    if (diff < HOUR) return `${Math.floor(diff / MIN)} min ago`;
    if (diff < DAY) {
        const h = Math.floor(diff / HOUR);
        return `${h} hour${h > 1 ? "s" : ""} ago`;
    }
    if (diff < 2 * DAY) return "Yesterday";
    if (diff < 7 * DAY) return `${Math.floor(diff / DAY)} days ago`;
    const d = new Date(ts);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`;
}

export function longDate(value: number | string) {
    const d = new Date(toTime(value));
    return `${d.getDate()} ${d.toLocaleString("en-US", { month: "long" })}, ${d.getFullYear()}`;
}

/** "Closes in 3 hours" / "Closes in 2 days". */
export function closesIn(value: string, now = Date.now()) {
    const diff = toTime(value) - now;
    if (diff <= 0) return "Closed";
    if (diff < HOUR) return `Closes in ${Math.max(1, Math.round(diff / MIN))} min`;
    if (diff < DAY) return `Closes in ${Math.round(diff / HOUR)} hours`;
    return `Closes in ${Math.round(diff / DAY)} days`;
}

export const htmlToText = (html: string) =>
    html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

export const escapeHtml = (text: string) =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Plain text → paragraph HTML (quick replies). */
export const textToHtml = (text: string) =>
    text
        .split(/\n{2,}/)
        .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
        .join("");

let idCounter = 0;
export const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

export const formatBytes = (bytes: number) =>
    bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
