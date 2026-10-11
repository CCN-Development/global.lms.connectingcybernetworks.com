/** Design tokens + formatting helpers for the student "My Profile" screens (Figma: LMS-3 › My Profile). */

export const profileAsset = (name: string) => `/profile/${name}`;

export const PC = {
    white: "#FFFFFF",
    n50: "#F2F2F2",
    n100: "#D9D9D9",
    n200: "#BFBFBF",
    n300: "#A6A6A6",
    n400: "#8C8C8C",
    n500: "#737373",
    n600: "#5A5A5A",
    n700: "#404040",
    n800: "#262626",
    primary75: "#E3E9F8",
    primary300: "#6A8AD7",
    primary500: "#2F53AD",
    teal: "#2EC4B6",
    success300: "#6AD76A",
    success500: "#2FAD2F",
    warning500: "#FFAD4F",
    error500: "#D1293D",
    deepNavy: "#07051B",

    /** Figma "Gradients 1" (purple → navy) used on section pills and progress fills. */
    gradientPurple: "linear-gradient(151deg, #8C24FF 9.02%, #0E1934 89.87%)",
    /** Figma "Gradients 6" (teal → green). */
    gradientTeal: "linear-gradient(91deg, #2EC4B6 4.52%, #1B4C33 104.18%)",
    gradientActive: "linear-gradient(82deg, #2EC4B6 20.8%, #1B4C33 99.85%)",
    gradientNew: "linear-gradient(-6deg, #192C5C 7.71%, #345DC2 92.29%)",

    /** "My Tasks" glass card fill (44% opacity baked into the stops). */
    cardFill:
        "linear-gradient(165deg, rgba(0,0,0,0.387) 1.34%, rgba(10,9,9,0.282) 48.72%, rgba(102,102,102,0.009) 96.09%)",
    cardFillStrong:
        "linear-gradient(165deg, rgba(0,0,0,0.563) 1.34%, rgba(10,9,9,0.41) 48.72%, rgba(102,102,102,0.013) 96.09%)",
    /** Badge tiles use the same fill at full opacity. */
    cardFillSolid:
        "linear-gradient(165deg, rgba(0,0,0,0.88) 1.34%, rgba(10,9,9,0.64) 48.72%, rgba(102,102,102,0.02) 96.09%)",
    /** Card stroke: bright top-left / bottom-right edges, transparent middle. */
    cardStroke:
        "linear-gradient(158deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0) 20.1%, rgba(255,255,255,0) 74.2%, rgba(255,255,255,0.88) 100%)",
    /** Stroke used by inner rows / inputs (64,64,64 → 166,166,166). */
    rowStroke: (alpha: number) =>
        `linear-gradient(90deg, rgba(64,64,64,${alpha}) 0%, rgba(166,166,166,${alpha}) 100%)`,
} as const;

// ─── Formatting ────────────────────────────────────────────────────────────
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Fee dates are calendar days in India; render them in IST so they never shift by a day. */
function istParts(value: string | Date | null | undefined) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    const ist = new Date(date.getTime() + 330 * 60 * 1000);
    return { day: ist.getUTCDate(), month: ist.getUTCMonth(), year: ist.getUTCFullYear() };
}

export function ordinal(n: number) {
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
    return `${n}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
}

/** "12 May 2026" */
export function formatDate(value: string | Date | null | undefined, fallback = "—") {
    const p = istParts(value);
    return p ? `${p.day} ${MONTHS_SHORT[p.month]} ${p.year}` : fallback;
}

/** "10 February 2026" */
export function formatLongDate(value: string | Date | null | undefined, fallback = "—") {
    const p = istParts(value);
    return p ? `${p.day} ${MONTHS_LONG[p.month]} ${p.year}` : fallback;
}

/** "12th May, 2026" */
export function formatOrdinalDate(value: string | Date | null | undefined, fallback = "—") {
    const p = istParts(value);
    return p ? `${ordinal(p.day)} ${MONTHS_SHORT[p.month]}, ${p.year}` : fallback;
}

/** "May 12, 2026" */
export function formatUsDate(value: string | Date | null | undefined, fallback = "—") {
    const p = istParts(value);
    return p ? `${MONTHS_SHORT[p.month]} ${p.day}, ${p.year}` : fallback;
}

/** Date of birth is a calendar date stored at UTC midnight: "06-11-2006" (DD-MM-YYYY). */
export function formatDob(value: string | null | undefined, fallback = "—") {
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;
    const dd = String(date.getUTCDate()).padStart(2, "0");
    const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
    return `${dd}-${mm}-${date.getUTCFullYear()}`;
}

/** "₹ 22,000" (Indian digit grouping, paise only when present). */
export function formatINR(value: number | null | undefined, { space = true }: { space?: boolean } = {}) {
    const amount = Number(value ?? 0);
    const text = amount.toLocaleString("en-IN", { minimumFractionDigits: Number.isInteger(amount) ? 0 : 2, maximumFractionDigits: 2 });
    return `₹${space ? " " : ""}${text}`;
}

/** "+91 7888337278" */
export function formatPhone(callingCode: string | null | undefined, phone: string | null | undefined, fallback = "—") {
    if (!phone) return fallback;
    const code = (callingCode ?? "").replace(/\D/g, "");
    return code ? `+${code} ${phone}` : phone;
}

/** "1.2 MB" */
export function formatBytes(bytes: number | null | undefined) {
    if (!bytes || bytes <= 0) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatNumber(value: number) {
    return value.toLocaleString("en-IN");
}

/** "3 days" / "1 day" */
export function pluralDays(n: number) {
    return `${n} ${n === 1 ? "day" : "days"}`;
}

export function initialsOf(name: string | null | undefined) {
    const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Fallback text for empty profile fields. */
export const EMPTY = "—";
