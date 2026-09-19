export type ChatType = "personal" | "group" | "community";
export type MsgStatus = "sending" | "sent" | "delivered" | "read";
export type MemberRole = "owner" | "admin" | "member";
export type AttachmentKind = "image" | "video" | "file" | "audio";

export interface User {
    id: string;
    name: string;
    avatar?: string;
    about?: string;
    phone?: string;
    email?: string;
    designation?: string;
    isOnline?: boolean;
    lastSeen?: string;
}

export interface ChatMember {
    userId: string;
    role: MemberRole;
    joinedOn: string;
}

export interface Attachment {
    id: string;
    kind: AttachmentKind;
    name: string;
    url: string;
    /** Human readable size, e.g. "2.4 MB" */
    size?: string;
    /** Seconds, for audio/video */
    duration?: number;
    ext?: string;
    mime?: string;
}

export interface Reaction {
    emoji: string;
    userIds: string[];
}

/** An image or video opened in the full-screen viewer. */
export interface MediaItem {
    url: string;
    kind: "image" | "video";
    name?: string;
}

export interface ReplyRef {
    messageId: string;
    senderId: string;
    preview: string;
    kind?: AttachmentKind;
}

export interface Receipt {
    userId: string;
    at: string;
}

export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    /** Sanitised rich-text HTML produced by the composer */
    html: string;
    time: string;
    dayKey: string;
    status: MsgStatus;
    system?: boolean;
    forwarded?: boolean;
    edited?: boolean;
    starred?: boolean;
    pinned?: boolean;
    deleted?: boolean;
    attachments?: Attachment[];
    replyTo?: ReplyRef;
    reactions?: Reaction[];
    deliveredTo?: Receipt[];
    readBy?: Receipt[];
}

export interface Chat {
    id: string;
    type: ChatType;
    name: string;
    avatar?: string;
    description?: string;
    createdBy: string;
    createdOn: string;
    members: ChatMember[];
    unreadCount: number;
    muted: boolean;
    pinned: boolean;
    favorite?: boolean;
    typingUserId?: string;
    /** Community/announcement groups: only admins can post */
    announcementOnly?: boolean;
    linkedGroupIds?: string[];
    blocked?: boolean;
}

export type MessageMap = Record<string, Message[]>;
