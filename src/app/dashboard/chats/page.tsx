"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { MdChat } from "react-icons/md";
import toast from "react-hot-toast";

import StudentLayout from "@/layouts/StudentLayout";
import { useAuth } from "@/contexts/AuthContext";
import { C, t } from "@/components/chats/theme";
import { CHAT_DOCS, CHAT_LINKS, CHAT_MEDIA, CHATS, MESSAGES, USERS } from "@/components/chats/data";
import type { Attachment, Chat, MediaItem, Message, MessageMap } from "@/components/chats/types";
import {
    attachmentKind, clockTime, escapeHtml, fileExt, formatBytes, isAdmin, isHtmlEmpty, stripHtml, uid,
} from "@/components/chats/helpers";
import ChatListPanel from "@/components/chats/ChatListPanel";
import ChatWindow from "@/components/chats/ChatWindow";
import InfoPanel, { type DeletePayload, type ForwardPayload } from "@/components/chats/InfoPanel";
import type { BubbleActions } from "@/components/chats/MessageBubble";
import {
    AddMembersDialog, ConfirmDialog, DocumentPreviewDialog, ForwardDialog, MediaLightbox,
    MessageInfoDialog, NewChatDialog, StarredDialog,
} from "@/components/chats/ChatDialogs";
import InAppNotifications, { type ChatToast } from "@/components/chats/InAppNotifications";
import CallOverlay, { type CallSummary, type CallTarget } from "@/components/chats/CallOverlay";
import { useChatSimulator } from "@/components/chats/useChatSimulator";
import {
    getPermission, playPing, requestPermission, showSystemNotification,
    type PermissionState,
} from "@/components/chats/notifications";
import { createRoomId, meetInviteHtml, meetPath, meetUrl } from "@/components/meet/meetHelpers";

export default function ChatsPage() {
    const router = useRouter();
    const [chats, setChats] = useState<Chat[]>(CHATS);
    const [messages, setMessages] = useState<MessageMap>(MESSAGES);
    const [media, setMedia] = useState<Record<string, string[]>>(CHAT_MEDIA);

    const [activeChatId, setActiveChatId] = useState<string | null>("c4");
    const [showSidebar, setShowSidebar] = useState(true);
    const [infoOpen, setInfoOpen] = useState(false);
    const [unreadAnchorId, setUnreadAnchorId] = useState<string | null>(null);

    const [replyTo, setReplyTo] = useState<Message | null>(null);
    const [editMessage, setEditMessage] = useState<Message | null>(null);
    const [pending, setPending] = useState<Attachment[]>([]);

    const [lightbox, setLightbox] = useState<{ items: MediaItem[]; index: number }>({ items: [], index: -1 });
    const [previewDoc, setPreviewDoc] = useState<Attachment | null>(null);
    const [infoMessage, setInfoMessage] = useState<Message | null>(null);
    const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
    const [newChatType, setNewChatType] = useState<"personal" | "group" | "community" | null>(null);
    const [addMembersChat, setAddMembersChat] = useState<Chat | null>(null);
    const [starredOpen, setStarredOpen] = useState(false);
    const [callTarget, setCallTarget] = useState<CallTarget | null>(null);
    const [deleteChatId, setDeleteChatId] = useState<string | null>(null);

    const [permission, setPermission] = useState<PermissionState>("default");
    const [soundOn, setSoundOn] = useState(true);
    const [liveOn, setLiveOn] = useState(true);
    const [toasts, setToasts] = useState<ChatToast[]>([]);

    const { user } = useAuth();
    /* Students get the LMS rail from the design; other roles keep their own navigation. */
    const showRail = !user || user.role === "Student";

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
    const lockReason: "announcement" | "blocked" | null = !activeChat
        ? null
        : activeChat.blocked
            ? "blocked"
            : activeChat.announcementOnly && !isAdmin(activeChat, "me")
                ? "announcement"
                : null;
    const canSend = Boolean(activeChat) && lockReason === null;
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
        setEditMessage(null);
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

    /* ── messages ───────────────────────────────────────────────── */
    const patchMessage = useCallback((chatId: string, messageId: string, patch: (m: Message) => Message) => {
        setMessages((prev) => ({
            ...prev,
            [chatId]: (prev[chatId] ?? []).map((m) => (m.id === messageId ? patch(m) : m)),
        }));
    }, []);

    /* ── sending ────────────────────────────────────────────────── */
    const handleSend = useCallback((html: string) => {
        if (!activeChat) return;

        if (editMessage) {
            if (!isHtmlEmpty(html)) {
                patchMessage(editMessage.chatId, editMessage.id, (m) => ({ ...m, html, edited: true }));
            }
            setEditMessage(null);
            return;
        }

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
    }, [activeChat, pending, replyTo, editMessage, patchMessage]);

    /* ── message actions ────────────────────────────────────────── */
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
        onReply: (message) => { setEditMessage(null); setReplyTo(message); },
        onEdit: (message) => { setReplyTo(null); setEditMessage(message); },
        onReport: () => toast.success("Message reported. Our team will review it."),
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
            timeLabel: clockTime(),
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

    const closeConversation = () => {
        setActiveChatId(null);
        setInfoOpen(false);
        setShowSidebar(true);
    };

    const handleToggleRead = (id: string) => patchChat(id, (c) => ({ ...c, unreadCount: c.unreadCount > 0 ? 0 : 1 }));

    const handleMarkAllRead = () => {
        setChats((prev) => prev.map((c) => ({ ...c, unreadCount: 0 })));
        setUnreadAnchorId(null);
        toast.success("All chats marked as read");
    };

    const handleToggleArchive = (id: string) => {
        const chat = chats.find((c) => c.id === id);
        if (!chat) return;
        patchChat(id, (c) => ({ ...c, archived: !c.archived }));
        toast.success(chat.archived ? "Chat unarchived" : "Chat archived");
        if (!chat.archived && activeChatId === id) closeConversation();
    };

    const handleToggleBlock = (id: string) => {
        const chat = chats.find((c) => c.id === id);
        if (!chat) return;
        patchChat(id, (c) => ({ ...c, blocked: !c.blocked }));
        toast.success(chat.blocked ? `${chat.name} unblocked` : `${chat.name} blocked`);
    };

    const handleReportChat = () => toast.success("Report submitted. Our team will review this conversation.");

    const confirmDeleteChat = () => {
        if (!deleteChatId) return;
        const id = deleteChatId;
        setChats((prev) => prev.filter((c) => c.id !== id));
        setMessages((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
        if (activeChatId === id) closeConversation();
        setDeleteChatId(null);
        toast.success("Chat deleted");
    };

    /* ── shared media actions (contact info) ────────────────────── */
    const handleStarItems = (messageIds: string[]) => {
        if (!activeChatId) return;
        messageIds.forEach((id) => patchMessage(activeChatId, id, (m) => ({ ...m, starred: true })));
        toast.success(`Starred ${messageIds.length} message${messageIds.length > 1 ? "s" : ""}`);
    };

    const handleDeleteItems = ({ messageIds, mediaUrls }: DeletePayload) => {
        if (!activeChatId) return;
        messageIds.forEach((id) => actions.onDelete(id));
        if (mediaUrls.length > 0) {
            setMedia((prev) => ({ ...prev, [activeChatId]: (prev[activeChatId] ?? []).filter((url) => !mediaUrls.includes(url)) }));
        }
        toast.success("Deleted from this chat");
    };

    const handleForwardItems = ({ text, attachments }: ForwardPayload) => {
        if (!activeChat) return;
        setForwardMessage({
            id: uid("m"),
            chatId: activeChat.id,
            senderId: "me",
            html: text ? text.split("\n").map((line) => `<p>${escapeHtml(line)}</p>`).join("") : "",
            time: clockTime(),
            dayKey: "Today",
            status: "sent",
            attachments,
        });
    };

    /* ── calls & meetings ───────────────────────────────────────── */
    const appendSystemMessage = (chatId: string, html: string) => {
        setMessages((prev) => ({
            ...prev,
            [chatId]: [...(prev[chatId] ?? []), {
                id: uid("m"),
                chatId,
                senderId: "me",
                html,
                time: clockTime(),
                dayKey: "Today",
                status: "read" as const,
                system: true,
            }],
        }));
    };

    const handleStartCall = (chatId: string) => {
        const chat = chats.find((c) => c.id === chatId);
        if (!chat || chat.type !== "personal") return;
        const other = chat.members.find((m) => m.userId !== "me");
        setCallTarget({
            chatId,
            name: chat.name,
            avatar: chat.avatar ?? (other ? USERS[other.userId]?.avatar : undefined),
            type: chat.type,
            subtitle: other ? USERS[other.userId]?.designation : undefined,
        });
    };

    const handleCallEnded = (summary: CallSummary) => {
        setCallTarget(null);
        const label = summary.outcome === "completed" && summary.seconds > 0
            ? `Voice call ended · ${Math.floor(summary.seconds / 60)}m ${summary.seconds % 60}s`
            : "Voice call cancelled";
        appendSystemMessage(summary.chatId, `<p>${label}</p>`);
    };

    const handleStartMeeting = (chatId: string) => {
        const chat = chats.find((c) => c.id === chatId);
        if (!chat) return;

        const roomId = createRoomId();
        const invitees = chat.members.filter((m) => m.userId !== "me").map((m) => m.userId);

        appendSystemMessage(
            chatId,
            meetInviteHtml({
                hostName: "You",
                chatName: chat.name,
                url: meetUrl(roomId),
                code: roomId,
            }),
        );

        toast.success("CCN Meet started — invite shared in the chat");
        const invite = invitees.slice(0, 6).join(",");
        router.push(`${meetPath(roomId)}?from=chat${invite ? `&invite=${invite}` : ""}`);
    };

    return (
        <StudentLayout
            fullBleed
            lockCollapsed
            hideSidebar={!showRail}
            headerMobileOnly
            header={<Box sx={t("poppins", 20, 30, 500, C.text)}>Chats</Box>}
        >
            <Box sx={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
                {/* Chat list */}
                <Box
                    sx={{
                        width: { xs: showSidebar ? "100%" : 0, md: 380 },
                        minWidth: { xs: showSidebar ? "100%" : 0, md: 380 },
                        display: { xs: showSidebar ? "flex" : "none", md: "flex" },
                        flexDirection: "column",
                        borderRight: { md: `1px solid ${C.border}` },
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
                        onToggleRead={handleToggleRead}
                        onToggleArchive={handleToggleArchive}
                        onToggleBlock={handleToggleBlock}
                        onReport={handleReportChat}
                        onDeleteChat={setDeleteChatId}
                        onMarkAllRead={handleMarkAllRead}
                        onOpenProfile={() => router.push("/dashboard/chats/profile")}
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
                            lockReason={lockReason}
                            infoOpen={infoOpen}
                            unreadAnchorId={unreadAnchorId}
                            replyTo={replyTo}
                            editing={editMessage}
                            attachments={pending}
                            actions={actions}
                            onBack={() => setShowSidebar(true)}
                            onToggleInfo={() => setInfoOpen((v) => !v)}
                            onToggleMute={toggleMute}
                            onClearChat={handleClearChat}
                            onOpenStarred={() => setStarredOpen(true)}
                            onCancelReply={() => setReplyTo(null)}
                            onCancelEdit={() => setEditMessage(null)}
                            onUnblock={handleToggleBlock}
                            onAddFiles={handleAddFiles}
                            onAddVoiceNote={handleAddVoiceNote}
                            onRemoveAttachment={handleRemoveAttachment}
                            onSend={handleSend}
                            onStartCall={handleStartCall}
                            onStartMeeting={handleStartMeeting}
                        />
                    </Box>
                ) : (
                    <Box
                        sx={{
                            flex: 1, display: { xs: showSidebar ? "none" : "flex", md: "flex" },
                            flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px",
                        }}
                    >
                        <MdChat size={44} color={C.textFaint} />
                        <Box sx={t("poppins", 20, 30, 500, C.text)}>CCN Chat</Box>
                        <Box sx={t("lato", 14, 21, 500, C.textMuted)}>Select a conversation to start messaging</Box>
                    </Box>
                )}

                {/* Info panel */}
                <AnimatePresence>
                    {infoOpen && activeChat && (
                        <motion.div
                            key={`info-${activeChat.id}`}
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 328, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: "easeInOut" }}
                            style={{ overflow: "hidden", flexShrink: 0 }}
                        >
                            <Box sx={{ width: 328, height: "100%" }}>
                                <InfoPanel
                                    chat={activeChat}
                                    chats={chats}
                                    users={USERS}
                                    messages={activeMessages}
                                    media={media[activeChat.id] ?? []}
                                    sharedDocs={CHAT_DOCS[activeChat.id] ?? []}
                                    sharedLinks={CHAT_LINKS[activeChat.id] ?? []}
                                    onClose={() => setInfoOpen(false)}
                                    onToggleMute={toggleMute}
                                    onToggleFavorite={(id) => patchChat(id, (c) => ({ ...c, favorite: !c.favorite }))}
                                    onToggleBlock={handleToggleBlock}
                                    onReport={handleReportChat}
                                    onDeleteChat={setDeleteChatId}
                                    onOpenChat={handleSelect}
                                    onOpenMedia={(items, index) => setLightbox({ items, index })}
                                    onOpenDocument={(att) => setPreviewDoc(att)}
                                    onOpenStarred={() => setStarredOpen(true)}
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
                                    onStartCall={handleStartCall}
                                    onStartMeeting={handleStartMeeting}
                                    onForwardItems={handleForwardItems}
                                    onStarItems={handleStarItems}
                                    onDeleteItems={handleDeleteItems}
                                />
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>

            {/* Overlays */}
            <InAppNotifications toasts={toasts} onOpen={openFromToast} onDismiss={dismissToast} />
            <CallOverlay
                target={callTarget}
                onClose={handleCallEnded}
                onSwitchToVideo={(chatId) => handleStartMeeting(chatId)}
            />
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
            <ConfirmDialog
                open={Boolean(deleteChatId)}
                title="Delete this chat?"
                message="The conversation and its messages will be removed from your chat list."
                confirmLabel="Delete"
                onClose={() => setDeleteChatId(null)}
                onConfirm={confirmDeleteChat}
            />
        </StudentLayout>
    );
}