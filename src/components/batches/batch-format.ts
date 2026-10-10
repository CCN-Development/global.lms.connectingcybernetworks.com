/* Display formatters shared by the student "My Batches" tabs. */

export type BatchMode = "Online" | "Offline" | "Hybrid";

export const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const MONTH_LONG = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export function normalizeMode(mode: string | null | undefined): BatchMode {
    const value = (mode ?? "").trim().toLowerCase();
    if (value === "offline") return "Offline";
    if (value === "hybrid") return "Hybrid";
    return "Online";
}

function toDate(iso: string | null | undefined): Date | null {
    if (!iso) return null;
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? null : date;
}

function ordinal(day: number): string {
    const rem100 = day % 100;
    if (rem100 >= 11 && rem100 <= 13) return `${day}th`;
    return `${day}${{ 1: "st", 2: "nd", 3: "rd" }[day % 10] ?? "th"}`;
}

/** Batch/session dates are stored as UTC calendar dates, so they're read in UTC. */
export function formatUTCDate(iso: string | null | undefined, style: "short" | "long" | "ordinal" = "short"): string {
    const date = toDate(iso);
    if (!date) return "—";
    const day = date.getUTCDate();
    const month = date.getUTCMonth();
    const year = date.getUTCFullYear();
    if (style === "ordinal") return `${ordinal(day)} ${MONTH_LONG[month]} ${year}`;
    return `${day} ${(style === "long" ? MONTH_LONG : MONTH_SHORT)[month]} ${year}`;
}

/** "14 Feb" */
export function formatUTCDayMonth(iso: string | null | undefined): string {
    const date = toDate(iso);
    if (!date) return "—";
    return `${date.getUTCDate()} ${MONTH_SHORT[date.getUTCMonth()]}`;
}

/** Session times are persisted as UTC wall-clock times. */
export function formatUTCClock(iso: string | null | undefined): string {
    const date = toDate(iso);
    if (!date) return "";
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

/** Real event timestamps (createdAt/updatedAt) → `{ date: "12 April, 2026", time: "2:30 PM" }` in local time. */
export function formatTimestamp(iso: string | null | undefined): { date: string; time: string } {
    const date = toDate(iso);
    if (!date) return { date: "—", time: "—" };
    const hours = date.getHours();
    return {
        date: `${date.getDate()} ${MONTH_LONG[date.getMonth()]}, ${date.getFullYear()}`,
        time: `${hours % 12 || 12}:${String(date.getMinutes()).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`,
    };
}

export function daysFromToday(iso: string): number | null {
    const date = toDate(iso);
    if (!date) return null;
    const now = new Date();
    const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const target = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return Math.round((target - today) / 86400000);
}

/** Figma writes September as "Sept" in short dates. */
const MONTH_FIGMA = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

/** Real event timestamps → "12 Sept" (local time). */
export function formatEventDay(iso: string | null | undefined): string {
    const date = toDate(iso);
    return date ? `${date.getDate()} ${MONTH_FIGMA[date.getMonth()]}` : "—";
}

/** Real event timestamps → "18 Sept, 4:12 PM" (local time). */
export function formatEventDayTime(iso: string | null | undefined): string {
    const date = toDate(iso);
    if (!date) return "—";
    const hours = date.getHours();
    return `${formatEventDay(iso)}, ${hours % 12 || 12}:${String(date.getMinutes()).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

/** "2 hours ago", "3 days ago", "just now". */
export function formatTimeAgo(iso: string | null | undefined): string {
    const date = toDate(iso);
    if (!date) return "";
    const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
    if (minutes < 1) return "just now";
    const units: [number, string][] = [[60 * 24 * 365, "year"], [60 * 24 * 30, "month"], [60 * 24, "day"], [60, "hour"], [1, "minute"]];
    const [size, unit] = units.find(([unitSize]) => minutes >= unitSize) ?? [1, "minute"];
    const count = Math.floor(minutes / size);
    return `${count} ${unit}${count === 1 ? "" : "s"} ago`;
}
