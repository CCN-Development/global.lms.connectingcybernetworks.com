"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { MdChat } from "react-icons/md";
import toast from "react-hot-toast";

import { C } from "@/components/chats/theme";
import { CHAT_MEDIA, CHATS, MESSAGES, USERS } from "@/components/chats/data";
import type { Attachment, Chat, MediaItem, Message, MessageMap } from "@/components/chats/types";
import {
    attachmentKind, clockTime, fileExt, formatBytes, isAdmin, isHtmlEmpty, stripHtml, uid,
} from "@/components/chats/helpers";
import ChatListPanel from "@/components/chats/ChatListPanel";
import ChatWindow from "@/components/chats/ChatWindow";
import InfoPanel from "@/components/chats/InfoPanel";
import type { BubbleActions } from "@/components/chats/MessageBubble";
import {
    AddMembersDialog, DocumentPreviewDialog, ForwardDialog, MediaLightbox,
    MessageInfoDialog, NewChatDialog, StarredDialog,
} from "@/components/chats/ChatDialogs";
import InAppNotifications, { type ChatToast } from "@/components/chats/InAppNotifications";
import { useChatSimulator } from "@/components/chats/useChatSimulator";
import {
    getPermission, playPing, requestPermission, showSystemNotification,
    type PermissionState,
} from "@/components/chats/notifications";

export default function ChatsPage() {
    const [chats, setChats] = useState<Chat[]>(CHATS);
    const [messages, setMessages] = useState<MessageMap>(MESSAGES);
    const [media, setMedia] = useState<Record<string, string[]>>(CHAT_MEDIA);

    const [activeChatId, setActiveChatId] = useState<string | null>("c4");
    const [showSidebar, setShowSidebar] = useState(true);
    const [infoOpen, setInfoOpen] = useState(false);
    const [unreadAnchorId, setUnreadAnchorId] = useState<string | null>(null);

    const [replyTo, setReplyTo] = useState<Message | null>(null);
    const [pending, setPending] = useState<Attachment[]>([]);

    const [lightbox, setLightbox] = useState<{ items: MediaItem[]; index: number }>({ items: [], index: -1 });
    const [previewDoc, setPreviewDoc] = useState<Attachment | null>(null);
    const [infoMessage, setInfoMessage] = useState<Message | null>(null);
    const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
    const [newChatType, setNewChatType] = useState<"personal" | "group" | "community" | null>(null);
    const [addMembersChat, setAddMembersChat] = useState<Chat | null>(null);
    const [starredOpen, setStarredOpen] = useState(false);

    const [permission, setPermission] = useState<PermissionState>("default");
    const [soundOn, setSoundOn] = useState(true);
    const [liveOn, setLiveOn] = useState(true);
    const [toasts, setToasts] = useState<ChatToast[]>([]);

    const objectUrls = useRef<string[]>([]);
    const activeChatIdRef = useRef<string | null>(activeChatId);
    const soundOnRef = useRef(soundOn);

    useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);
    useEffect(() => { soundOnRef.current = soundOn; }, [soundOn]);
    useEffect(() => { setPermission(getPermission()); }, []);

    useEffect(() => {
        const urls = objectUrls.current;
        return () => urls.forEach((url) => URL.revokeObjectURL(url));
    }, []);

    const activeChat = chats.find((c) => c.id === activeChatId) ?? null;
    const activeMessages = useMemo(
        () => (activeChatId ? messages[activeChatId] ?? [] : []),
        [messages, activeChatId],
    );
    const canSend = activeChat ? !activeChat.announcementOnly || isAdmin(activeChat, "me") : false;
    const unreadTotal = chats.reduce((n, c) => n + c.unreadCount, 0);

    /* Mirror the unread count in the browser tab. */
    useEffect(() => {
        const base = "CCN Chat | Connecting Cyber Networks";
        document.title = unreadTotal > 0 ? `(${unreadTotal}) ${base}` : base;
    }, [unreadTotal]);

    /* ── selection ──────────────────────────────────────────────── */
    const handleSelect = useCallback((chatId: string) => {
        setActiveChatId(chatId);
        setShowSidebar(false);
        setReplyTo(null);
        setPending([]);
        setChats((prev) => {
            const chat = prev.find((c) => c.id === chatId);
            if (chat && chat.unreadCount > 0) {
                const list = messages[chatId] ?? [];
                setUnreadAnchorId(list[Math.max(0, list.length - chat.unreadCount)]?.id ?? null);
            } else {
                setUnreadAnchorId(null);
            }
            return prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c));
        });
    }, [messages]);

    /* ── notifications ──────────────────────────────────────────── */
    const handleSelectRef = useRef(handleSelect);
    useEffect(() => { handleSelectRef.current = handleSelect; }, [handleSelect]);

    const handleTyping = useCallback((chatId: string, userId?: string) => {
        setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, typingUserId: userId } : c)));
    }, []);

    const handleIncoming = useCallback((message: Message, chat: Chat) => {
        setMessages((prev) => ({ ...prev, [chat.id]: [...(prev[chat.id] ?? []), message] }));

        const isOpenAndVisible = activeChatIdRef.current === chat.id && !document.hidden;
        if (isOpenAndVisible) return;

        setChats((prev) => prev.map((c) => (c.id === chat.id ? { ...c, unreadCount: c.unreadCount + 1 } : c)));
        if (chat.muted) return;

        const sender = USERS[message.senderId];
        const preview = stripHtml(message.html);
        if (soundOnRef.current) playPing();

        setToasts((prev) => [
            {
                id: message.id,
                chatId: chat.id,
                chatName: chat.name,
                chatType: chat.type,
                senderName: sender?.name ?? "Someone",
                avatar: chat.avatar ?? sender?.avatar,
                preview,
                time: message.time,
            },
            ...prev,
        ].slice(0, 4));

        showSystemNotification({
            title: chat.type === "personal" ? chat.name : `${sender?.name ?? "Someone"} · ${chat.name}`,
            body: preview,
            icon: chat.avatar ?? sender?.avatar,
            tag: chat.id,
            onClick: () => handleSelectRef.current(chat.id),
        });
    }, []);

    useChatSimulator({ chats, enabled: liveOn, onTyping: handleTyping, onIncoming: handleIncoming });

    const handleEnableNotifications = async () => {
        const result = await requestPermission();
        setPermission(result);
        if (result === "granted") {
            playPing();
            toast.success("Desktop notifications enabled");
        } else if (result === "denied") {
            toast.error("Notifications are blocked in your browser settings");
        } else if (result === "unsupported") {
            toast.error("This browser does not support notifications");
        }
    };

    const dismissToast = useCallback((toastId: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, []);

    const openFromToast = (chatId: string, toastId: string) => {
        handleSelect(chatId);
        dismissToast(toastId);
    };

    /* ── attachments ────────────────────────────────────────────── */
    const handleAddFiles = useCallback((files: FileList | File[]) => {
        const next: Attachment[] = Array.from(files).slice(0, 10).map((file) => {
            const url = URL.createObjectURL(file);
            objectUrls.current.push(url);
            return {
                id: uid("att"),
                kind: attachmentKind(file),
                name: file.name,
                url,
                size: formatBytes(file.size),
                ext: fileExt(file.name),
                mime: file.type || undefined,
            };
        });
        setPending((p) => [...p, ...next]);
    }, []);

    const handleAddVoiceNote = useCallback((seconds: number, url: string) => {
        objectUrls.current.push(url);
        setPending((p) => [
            ...p,
            { id: uid("att"), kind: "audio", name: `voice-note-${p.length + 1}.webm`, url, duration: seconds },
        ]);
    }, []);

    const handleRemoveAttachment = useCallback((id: string) => {
        setPending((p) => p.filter((a) => a.id !== id));
    }, []);

    /* ── sending ────────────────────────────────────────────────── */
    const handleSend = useCallback((html: string) => {
        if (!activeChat) return;
        if (isHtmlEmpty(html) && pending.length === 0) return;

        const chatId = activeChat.id;
        const message: Message = {
            id: uid("m"),
            chatId,
            senderId: "me",
            html: isHtmlEmpty(html) ? "" : html,
            time: clockTime(),
            dayKey: "Today",
            status: "sending",
            attachments: pending.length > 0 ? pending : undefined,
            replyTo: replyTo
                ? {
                    messageId: replyTo.id,
                    senderId: replyTo.senderId,
                    preview: stripHtml(replyTo.html) || replyTo.attachments?.[0]?.name || "Attachment",
                    kind: replyTo.attachments?.[0]?.kind,
                }
                : undefined,
        };

        setMessages((prev) => ({ ...prev, [chatId]: [...(prev[chatId] ?? []), message] }));

        const images = pending.filter((a) => a.kind === "image").map((a) => a.url);
        if (images.length > 0) setMedia((prev) => ({ ...prev, [chatId]: [...images, ...(prev[chatId] ?? [])] }));

        setPending([]);
        setReplyTo(null);
        setUnreadAnchorId(null);

        const others = activeChat.members.filter((m) => m.userId !== "me").map((m) => m.userId);
        const bump = (status: Message["status"], patch?: Partial<Message>) =>
            setMessages((prev) => ({
                ...prev,
                [chatId]: (prev[chatId] ?? []).map((m) => (m.id === message.id ? { ...m, status, ...patch } : m)),
            }));

        window.setTimeout(() => bump("sent"), 400);
        window.setTimeout(
            () => bump("delivered", { deliveredTo: others.map((userId) => ({ userId, at: `Today ${clockTime()}` })) }),
            1200,
        );
        window.setTimeout(
            () => bump("read", {
                readBy: others.slice(0, Math.max(1, others.length - 1)).map((userId) => ({ userId, at: `Today ${clockTime()}` })),
            }),
            2600,
        );
    }, [activeChat, pending, replyTo]);

    /* ── message actions ────────────────────────────────────────── */
    const patchMessage = useCallback((chatId: string, messageId: string, patch: (m: Message) => Message) => {
        setMessages((prev) => ({
            ...prev,
            [chatId]: (prev[chatId] ?? []).map((m) => (m.id === messageId ? patch(m) : m)),
        }));
    }, []);

    const actions: BubbleActions = useMemo(() => ({
        onReact: (messageId, emoji) => {
            if (!activeChatId) return;
            patchMessage(activeChatId, messageId, (m) => {
                const reactions = [...(m.reactions ?? [])];
                const idx = reactions.findIndex((r) => r.emoji === emoji);
                if (idx === -1) return { ...m, reactions: [...reactions, { emoji, userIds: ["me"] }] };
                const mine = reactions[idx].userIds.includes("me");
                const userIds = mine
                    ? reactions[idx].userIds.filter((u) => u !== "me")
                    : [...reactions[idx].userIds, "me"];
                if (userIds.length === 0) reactions.splice(idx, 1);
                else reactions[idx] = { ...reactions[idx], userIds };
                return { ...m, reactions };
            });
        },
        onReply: (message) => setReplyTo(message),
        onForward: (message) => setForwardMessage(message),
        onStar: (messageId) => {
            if (!activeChatId) return;
            patchMessage(activeChatId, messageId, (m) => ({ ...m, starred: !m.starred }));
        },
        onPin: (messageId) => {
            if (!activeChatId) return;
            patchMessage(activeChatId, messageId, (m) => ({ ...m, pinned: !m.pinned }));
        },
        onCopy: async (message) => {
            try {
                await navigator.clipboard.writeText(stripHtml(message.html));
                toast.success("Message copied");
            } catch {
                toast.error("Could not copy message");
            }
        },
        onInfo: (message) => setInfoMessage(message),
        onDelete: (messageId) => {
            if (!activeChatId) return;
            patchMessage(activeChatId, messageId, (m) => ({
                ...m, deleted: true, html: "", attachments: undefined, reactions: [], pinned: false,
            }));
        },
        onJumpTo: () => { /* replaced by ChatWindow's scroll handler */ },
        onOpenMedia: (items, index) => setLightbox({ items, index }),
        onOpenDocument: (att) => setPreviewDoc(att),
    }), [activeChatId, patchMessage]);

    /* ── chat actions ───────────────────────────────────────────── */
    const patchChat = (chatId: string, patch: (c: Chat) => Chat) =>
        setChats((prev) => prev.map((c) => (c.id === chatId ? patch(c) : c)));

    const handleForward = (chatIds: string[]) => {
        if (!forwardMessage) return;
        setMessages((prev) => {
            const next = { ...prev };
            chatIds.forEach((chatId) => {
                next[chatId] = [
                    ...(next[chatId] ?? []),
                    {
                        ...forwardMessage,
                        id: uid("m"),
                        chatId,
                        senderId: "me",
                        forwarded: true,
                        pinned: false,
                        starred: false,
                        reactions: [],
                        replyTo: undefined,
                        readBy: [],
                        deliveredTo: [],
                        status: "sent" as const,
                        time: clockTime(),
                        dayKey: "Today",
                    },
                ];
            });
            return next;
        });
        setForwardMessage(null);
        toast.success(`Forwarded to ${chatIds.length} chat${chatIds.length > 1 ? "s" : ""}`);
    };

    const handleCreateChat = ({ type, name, description, memberIds }: {
        type: "personal" | "group" | "community";
        name: string;
        description: string;
        memberIds: string[];
    }) => {
        const existing = type === "personal"
            ? chats.find((c) => c.type === "personal" && c.members.some((m) => m.userId === memberIds[0]))
            : undefined;
        if (existing) {
            handleSelect(existing.id);
            return;
        }

        const id = uid("c");
        const chat: Chat = {
            id,
            type,
            name,
            avatar: type === "personal" ? USERS[memberIds[0]]?.avatar : undefined,
            description: description || undefined,
            createdBy: "me",
            createdOn: "Today",
            members: [
                { userId: "me", role: type === "personal" ? "member" : "owner", joinedOn: "Today" },
                ...memberIds.map((userId) => ({ userId, role: "member" as const, joinedOn: "Today" })),
            ],
            unreadCount: 0,
            muted: false,
            pinned: false,
        };

        setChats((prev) => [chat, ...prev]);
        setMessages((prev) => ({
            ...prev,
            [id]: type === "personal" ? [] : [{
                id: uid("m"),
                chatId: id,
                senderId: "me",
                html: `<p>You created ${type === "group" ? "group" : "community"} <strong>${name}</strong></p>`,
                time: clockTime(),
                dayKey: "Today",
                status: "read" as const,
                system: true,
            }],
        }));
        handleSelect(id);
        toast.success(`${type === "personal" ? "Chat" : type === "group" ? "Group" : "Community"} created`);
    };

    const handleClearChat = (chatId: string) => {
        setMessages((prev) => ({ ...prev, [chatId]: [] }));
        toast.success("Chat cleared");
    };

    const handleExitChat = (chatId: string) => {
        patchChat(chatId, (c) => ({ ...c, members: c.members.filter((m) => m.userId !== "me") }));
        setInfoOpen(false);
        toast.success("You left the chat");
    };

    const handleMessageMember = (userId: string) => {
        const existing = chats.find((c) => c.type === "personal" && c.members.some((m) => m.userId === userId));
        if (existing) {
            handleSelect(existing.id);
            setInfoOpen(false);
        } else {
            handleCreateChat({ type: "personal", name: USERS[userId]?.name ?? "Chat", description: "", memberIds: [userId] });
        }
    };

    const handleJumpToStarred = (chatId: string, messageId: string) => {
        handleSelect(chatId);
        window.setTimeout(() => {
            document.getElementById(`msg-${messageId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 260);
    };

    const toggleMute = (id: string) => patchChat(id, (c) => ({ ...c, muted: !c.muted }));

    return (
        <Box sx={{ height: "100vh", p: { xs: 0, md: 1.5 }, overflow: "hidden" }}>
            <Box
                sx={{
                    display: "flex", height: "100%", overflow: "hidden",
                    borderRadius: { xs: 0, md: "14px" },
                    border: `1px solid ${C.border}`,
                    boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
                }}
            >
                {/* Chat list */}
                <Box
                    sx={{
                        width: { xs: showSidebar ? "100%" : 0, md: 296 },
                        minWidth: { xs: showSidebar ? "100%" : 0, md: 296 },
                        display: { xs: showSidebar ? "flex" : "none", md: "flex" },
                        flexDirection: "column",
                        borderRight: `1px solid ${C.border}`,
                        overflow: "hidden",
                    }}
                >
                    <ChatListPanel
                        chats={chats}
                        users={USERS}
                        messages={messages}
                        activeChatId={activeChatId}
                        onSelect={handleSelect}
                        onTogglePin={(id) => patchChat(id, (c) => ({ ...c, pinned: !c.pinned }))}
                        onToggleMute={toggleMute}
                        onMarkUnread={(id) => patchChat(id, (c) => ({ ...c, unreadCount: Math.max(1, c.unreadCount) }))}
                        onDeleteChat={handleClearChat}
                        onNewChat={(type) => setNewChatType(type)}
                        onOpenStarred={() => setStarredOpen(true)}
                        permission={permission}
                        soundOn={soundOn}
                        liveOn={liveOn}
                        onEnableNotifications={() => void handleEnableNotifications()}
                        onToggleSound={() => setSoundOn((v) => !v)}
                        onToggleLive={() => setLiveOn((v) => !v)}
                    />
                </Box>

                {/* Conversation */}
                {activeChat ? (
                    <Box sx={{ flex: 1, minWidth: 0, display: { xs: showSidebar ? "none" : "flex", md: "flex" } }}>
                        <ChatWindow
                            chat={activeChat}
                            users={USERS}
                            messages={activeMessages}
                            canSend={canSend}
                            infoOpen={infoOpen}
                            unreadAnchorId={unreadAnchorId}
                            replyTo={replyTo}
                            attachments={pending}
                            actions={actions}
                            onBack={() => setShowSidebar(true)}
                            onToggleInfo={() => setInfoOpen((v) => !v)}
                            onToggleMute={toggleMute}
                            onDeleteChat={handleClearChat}
                            onOpenStarred={() => setStarredOpen(true)}
                            onCancelReply={() => setReplyTo(null)}
                            onAddFiles={handleAddFiles}
                            onAddVoiceNote={handleAddVoiceNote}
                            onRemoveAttachment={handleRemoveAttachment}
                            onSend={handleSend}
                        />
                    </Box>
                ) : (
                    <Box
                        sx={{
                            flex: 1, display: { xs: showSidebar ? "none" : "flex", md: "flex" },
                            flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
                        }}
                    >
                        <MdChat size={44} color={C.textMuted} />
                        <Typography sx={{ fontSize: "0.85rem", color: C.text, fontWeight: 600 }}>CCN Chat</Typography>
                        <Typography sx={{ fontSize: "0.74rem", color: C.textMuted }}>
                            Select a conversation to start messaging
                        </Typography>
                    </Box>
                )}

                {/* Info panel */}
                <AnimatePresence>
                    {infoOpen && activeChat && (
                        <motion.div
                            key={`info-${activeChat.id}`}
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 296, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: "easeInOut" }}
                            style={{ overflow: "hidden", flexShrink: 0 }}
                        >
                            <Box sx={{ width: 296, height: "100%" }}>
                                <InfoPanel
                                    chat={activeChat}
                                    chats={chats}
                                    users={USERS}
                                    messages={activeMessages}
                                    media={media[activeChat.id] ?? []}
                                    onClose={() => setInfoOpen(false)}
                                    onToggleMute={toggleMute}
                                    onToggleFavorite={(id) => patchChat(id, (c) => ({ ...c, favorite: !c.favorite }))}
                                    onDeleteChat={handleClearChat}
                                    onOpenChat={handleSelect}
                                    onOpenMedia={(items, index) => setLightbox({ items, index })}
                                    onOpenDocument={(att) => setPreviewDoc(att)}
                                    onPromoteMember={(chatId, userId) =>
                                        patchChat(chatId, (c) => ({
                                            ...c,
                                            members: c.members.map((m) =>
                                                m.userId === userId ? { ...m, role: m.role === "member" ? "admin" : "member" } : m,
                                            ),
                                        }))
                                    }
                                    onRemoveMember={(chatId, userId) =>
                                        patchChat(chatId, (c) => ({ ...c, members: c.members.filter((m) => m.userId !== userId) }))
                                    }
                                    onMessageMember={handleMessageMember}
                                    onAddMembers={(chatId) => setAddMembersChat(chats.find((c) => c.id === chatId) ?? null)}
                                    onExitChat={handleExitChat}
                                />
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>

            {/* Overlays */}
            <InAppNotifications toasts={toasts} onOpen={openFromToast} onDismiss={dismissToast} />
            <MediaLightbox
                items={lightbox.items}
                index={lightbox.index}
                onClose={() => setLightbox({ items: [], index: -1 })}
                onNavigate={(index) => setLightbox((l) => ({ ...l, index }))}
            />
            <MessageInfoDialog message={infoMessage} users={USERS} onClose={() => setInfoMessage(null)} />
            <DocumentPreviewDialog attachment={previewDoc} onClose={() => setPreviewDoc(null)} />
            <ForwardDialog
                open={Boolean(forwardMessage)}
                chats={chats}
                users={USERS}
                onClose={() => setForwardMessage(null)}
                onForward={handleForward}
            />
            <NewChatDialog
                type={newChatType}
                users={USERS}
                existingChats={chats}
                onClose={() => setNewChatType(null)}
                onCreate={handleCreateChat}
            />
            <AddMembersDialog
                chat={addMembersChat}
                users={USERS}
                onClose={() => setAddMembersChat(null)}
                onAdd={(chatId, userIds) =>
                    patchChat(chatId, (c) => ({
                        ...c,
                        members: [...c.members, ...userIds.map((userId) => ({ userId, role: "member" as const, joinedOn: "Today" }))],
                    }))
                }
            />
            <StarredDialog
                open={starredOpen}
                chats={chats}
                messages={messages}
                users={USERS}
                onClose={() => setStarredOpen(false)}
                onJump={handleJumpToStarred}
            />
        </Box>
    );
}
