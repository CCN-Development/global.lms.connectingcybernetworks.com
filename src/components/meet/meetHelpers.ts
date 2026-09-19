import type { JoinPrefs } from "./types";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

const segment = (length: number) =>
    Array.from({ length }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");

/** Meeting codes follow the familiar xxx-yyyy-zzz shape. */
export function createRoomId() {
    return `${segment(3)}-${segment(4)}-${segment(3)}`;
}

export function meetPath(roomId: string) {
    return `/dashboard/meet/${roomId}`;
}

export function meetUrl(roomId: string) {
    if (typeof window === "undefined") return meetPath(roomId);
    return `${window.location.origin}${meetPath(roomId)}`;
}

export function normalizeCode(input: string) {
    const trimmed = input.trim();
    const fromUrl = trimmed.match(/\/dashboard\/meet\/([a-z0-9-]+)/i)?.[1];
    return (fromUrl ?? trimmed).replace(/\s+/g, "").toLowerCase();
}

/** Chat message posted when someone starts a meeting from a conversation. */
export function meetInviteHtml({ hostName, chatName, url, code }: {
    hostName: string;
    chatName: string;
    url: string;
    code: string;
}) {
    return [
        `<p><strong>${hostName} started a CCN Meet video call</strong></p>`,
        `<p>${hostName} is hosting a video meeting for <em>${chatName}</em>. Join from any device — camera and microphone can be turned off before joining.</p>`,
        `<p>Meeting link: <a href="${url}" target="_blank" rel="noopener noreferrer nofollow">${url}</a></p>`,
        `<p>Meeting code: <code>${code}</code></p>`,
    ].join("");
}

const PREFS_KEY = "ccn-meet-prefs";

export function saveJoinPrefs(prefs: JoinPrefs) {
    if (typeof window === "undefined") return;
    try {
        window.sessionStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
        /* storage is optional */
    }
}

export function loadJoinPrefs(): JoinPrefs | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.sessionStorage.getItem(PREFS_KEY);
        return raw ? (JSON.parse(raw) as JoinPrefs) : null;
    } catch {
        return null;
    }
}

export function clockLabel(date = new Date()) {
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).toLowerCase();
}

export function elapsedLabel(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const mm = m.toString().padStart(2, "0");
    const ss = s.toString().padStart(2, "0");
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function meetUid(prefix = "id") {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Horizontal jitter for floating reactions. */
export function reactionOffset() {
    return Math.random() * 60 - 30;
}
