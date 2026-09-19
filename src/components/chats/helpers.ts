import type { Attachment, Chat, Message, User } from "./types";

export function stripHtml(html: string) {
    return html
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, " ")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();
}

export function isHtmlEmpty(html: string | null | undefined) {
    return !html || stripHtml(html).length === 0;
}

/** Escapes user text before wrapping it in markup. */
export function escapeHtml(text: string) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export function clockTime(d: Date = new Date()) {
    return d
        .toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
        .toLowerCase();
}

export function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function initials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("");
}

export function attachmentKind(file: File): Attachment["kind"] {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    return "file";
}

export function fileExt(name: string) {
    const parts = name.split(".");
    return parts.length > 1 ? parts.pop()!.toUpperCase() : "FILE";
}

const FILE_ACCENTS: Record<string, string> = {
    PDF: "#f43f5e",
    DOC: "#3b82f6", DOCX: "#3b82f6", RTF: "#3b82f6",
    XLS: "#22c55e", XLSX: "#22c55e", CSV: "#22c55e",
    PPT: "#f97316", PPTX: "#f97316",
    ZIP: "#f59e0b", RAR: "#f59e0b", "7Z": "#f59e0b",
    TXT: "#94a3b8", LOG: "#94a3b8", JSON: "#94a3b8",
    PKT: "#06b6d4", PCAP: "#06b6d4", PCAPNG: "#06b6d4",
};

export function fileAccent(ext?: string) {
    return (ext && FILE_ACCENTS[ext.toUpperCase()]) || "#6366f1";
}

/** PDFs and plain text can be shown in the viewer; everything else downloads. */
export function canPreviewInline(att: { ext?: string; mime?: string; url: string }) {
    if (!att.url || att.url === "#") return false;
    const ext = att.ext?.toUpperCase();
    if (att.mime === "application/pdf" || att.mime?.startsWith("text/")) return true;
    return ext === "PDF" || ext === "TXT" || ext === "LOG" || ext === "JSON" || ext === "CSV";
}

export function lastMessageOf(messages: Message[] | undefined) {
    if (!messages || messages.length === 0) return undefined;
    return messages[messages.length - 1];
}

/** Short preview line used in the chat list and reply quotes. */
export function previewOf(msg: Message | undefined, users: Record<string, User>, forList = false) {
    if (!msg) return "No messages yet";
    if (msg.deleted) return "This message was deleted";
    const att = msg.attachments?.[0];
    const body = stripHtml(msg.html);
    let label = body;
    if (!label && att) {
        label =
            att.kind === "image" ? "Photo" :
                att.kind === "video" ? "Video" :
                    att.kind === "audio" ? "Voice message" : att.name;
    }
    if (att && body) label = `${body}`;
    if (!forList || msg.system || msg.senderId === "me") return label;
    const name = users[msg.senderId]?.name?.split(" ")[0];
    return name ? `${name}: ${label}` : label;
}

export function chatSubtitle(chat: Chat, users: Record<string, User>) {
    if (chat.type === "personal") {
        const other = chat.members.find((m) => m.userId !== "me");
        const user = other ? users[other.userId] : undefined;
        if (user?.isOnline) return "online";
        return user?.lastSeen ? `last seen ${user.lastSeen}` : "offline";
    }
    const names = chat.members
        .filter((m) => m.userId !== "me")
        .slice(0, 4)
        .map((m) => users[m.userId]?.name?.split(" ")[0])
        .filter(Boolean);
    const extra = chat.members.length - 1 - names.length;
    return extra > 0 ? `${names.join(", ")} +${extra} more` : `You, ${names.join(", ")}`;
}

export function counterpartOf(chat: Chat, users: Record<string, User>) {
    const other = chat.members.find((m) => m.userId !== "me");
    return other ? users[other.userId] : undefined;
}

export function roleOf(chat: Chat, userId: string) {
    return chat.members.find((m) => m.userId === userId)?.role ?? "member";
}

export function isAdmin(chat: Chat, userId: string) {
    const role = roleOf(chat, userId);
    return role === "admin" || role === "owner";
}

export function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
