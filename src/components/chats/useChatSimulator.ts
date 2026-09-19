"use client";

import { useEffect, useRef } from "react";
import type { Chat, Message } from "./types";
import { clockTime, isAdmin, uid } from "./helpers";

const LINES: Record<Chat["type"], string[]> = {
    community: [
        "<p>Placement drive by <strong>Tata Elxsi</strong> on 28th Sept. Share your updated resume with the HR desk.</p>",
        "<p>Free workshop: <em>Wireshark for Incident Response</em>, Saturday 11:00 am. Limited seats.</p>",
        "<p>Advisory: a new phishing campaign is targeting student mail IDs. Do not open unknown attachments.</p>",
        "<p>Results for last week's CTF are out. Congratulations to the top three teams.</p>",
    ],
    group: [
        "<p>Reminder: assignment submission closes tonight at <strong>11:59 pm</strong>.</p>",
        "<p>Tomorrow's session moves to Lab 2. Please reach 10 minutes early.</p>",
        "<p>Can someone share today's class notes?</p>",
        "<p>Doubt session added for Friday 5 pm. Bring your lab errors.</p>",
        "<p>Uploaded the practice questions on the portal.</p>",
    ],
    personal: [
        "<p>Are you joining today's session?</p>",
        "<p>I have shared the notes, please check.</p>",
        "<p>Can we connect for 5 minutes after the class?</p>",
        "<p>Done with the lab exercise, thanks for the help.</p>",
        "<p>Sure, I'll get back to you shortly.</p>",
    ],
};

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

type Args = {
    chats: Chat[];
    enabled: boolean;
    onTyping: (chatId: string, userId?: string) => void;
    onIncoming: (message: Message, chat: Chat) => void;
};

/** Fakes other people chatting so notifications can be demoed without a backend. */
export function useChatSimulator({ chats, enabled, onTyping, onIncoming }: Args) {
    const chatsRef = useRef(chats);
    const onTypingRef = useRef(onTyping);
    const onIncomingRef = useRef(onIncoming);

    useEffect(() => { chatsRef.current = chats; }, [chats]);
    useEffect(() => { onTypingRef.current = onTyping; }, [onTyping]);
    useEffect(() => { onIncomingRef.current = onIncoming; }, [onIncoming]);

    useEffect(() => {
        if (!enabled) return;

        let nextTimer: ReturnType<typeof setTimeout>;
        let typingTimer: ReturnType<typeof setTimeout>;

        const schedule = () => {
            nextTimer = setTimeout(run, 10000 + Math.random() * 12000);
        };

        const run = () => {
            const candidates = chatsRef.current.filter((chat) => {
                const senders = chat.announcementOnly
                    ? chat.members.filter((m) => m.userId !== "me" && isAdmin(chat, m.userId))
                    : chat.members.filter((m) => m.userId !== "me");
                return senders.length > 0;
            });

            if (candidates.length === 0) {
                schedule();
                return;
            }

            const chat = pick(candidates);
            const senders = chat.announcementOnly
                ? chat.members.filter((m) => m.userId !== "me" && isAdmin(chat, m.userId))
                : chat.members.filter((m) => m.userId !== "me");
            const senderId = pick(senders).userId;

            onTypingRef.current(chat.id, senderId);

            typingTimer = setTimeout(() => {
                onTypingRef.current(chat.id, undefined);
                const message: Message = {
                    id: uid("m"),
                    chatId: chat.id,
                    senderId,
                    html: pick(LINES[chat.type]),
                    time: clockTime(),
                    dayKey: "Today",
                    status: "delivered",
                };
                onIncomingRef.current(message, chat);
                schedule();
            }, 1800 + Math.random() * 1800);
        };

        schedule();

        return () => {
            clearTimeout(nextTimer);
            clearTimeout(typingTimer);
        };
    }, [enabled]);
}
