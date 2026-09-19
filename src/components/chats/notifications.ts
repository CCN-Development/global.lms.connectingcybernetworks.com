"use client";

export type PermissionState = "unsupported" | "default" | "granted" | "denied";

export function getPermission(): PermissionState {
    if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
    return Notification.permission;
}

export async function requestPermission(): Promise<PermissionState> {
    if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
    if (Notification.permission !== "default") return Notification.permission;
    try {
        return await Notification.requestPermission();
    } catch {
        return "denied";
    }
}

type SystemNotification = {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    onClick?: () => void;
};

export function showSystemNotification({ title, body, icon, tag, onClick }: SystemNotification) {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    try {
        // The app plays its own ping, so the OS sound is suppressed.
        const notification = new Notification(title, { body, icon, tag, silent: true });
        notification.onclick = () => {
            window.focus();
            onClick?.();
            notification.close();
        };
    } catch {
        /* notification constructor is unavailable on some mobile browsers */
    }
}

let audioCtx: AudioContext | null = null;

export function playPing() {
    if (typeof window === "undefined") return;
    try {
        const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;
        audioCtx ??= new Ctor();
        if (audioCtx.state === "suspended") void audioCtx.resume();

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(760, now);
        osc.frequency.exponentialRampToValueAtTime(1180, now + 0.09);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.32);
    } catch {
        /* audio is a nice-to-have, never block the message */
    }
}
