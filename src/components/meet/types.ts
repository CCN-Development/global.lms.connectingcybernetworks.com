export type MeetLayout = "auto" | "tiled" | "spotlight" | "sidebar";
export type PanelTab = "people" | "chat" | "info" | "activities" | null;

export interface Participant {
    id: string;
    name: string;
    avatar?: string;
    isYou?: boolean;
    host?: boolean;
    micOn: boolean;
    camOn: boolean;
    handRaised?: boolean;
    speaking?: boolean;
    presenting?: boolean;
    pinned?: boolean;
    /** Simulated network quality 0-3 */
    signal?: number;
}

export interface MeetChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    time: string;
}

export interface FloatingReaction {
    id: string;
    emoji: string;
    name: string;
    offset: number;
}

export interface JoinPrefs {
    displayName: string;
    micOn: boolean;
    camOn: boolean;
}
