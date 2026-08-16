"use client";
import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, Avatar, InputBase, IconButton, Switch } from "@mui/material";
import {
    MdSearch, MdMoreVert, MdAdd, MdSentimentSatisfiedAlt,
    MdSend, MdDoneAll, MdDone, MdArrowBack, MdGroups,
    MdCampaign, MdAccountBalance, MdShield,
    MdClose, MdContentCopy, MdVideoCall, MdPhone,
    MdNotificationsNone, MdStar, MdFavoriteBorder,
    MdBlock, MdFlag, MdDeleteOutline,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

// ─── Theme ─────────────────────────────────────────────────────────────────
const C = {
    bg: "#080c18",
    sidebar: "#0d1121",
    sidebarBorder: "rgba(255,255,255,0.06)",
    chatBg: "#080c18",
    activeChat: "rgba(99,102,241,0.13)",
    activeChatBorder: "rgba(99,102,241,0.4)",
    hoverChat: "rgba(255,255,255,0.04)",
    sentBubble: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    receivedBubble: "#1a2035",
    inputBg: "#101527",
    dividerText: "rgba(255,255,255,0.35)",
    secondaryText: "rgba(255,255,255,0.45)",
    mutedText: "rgba(255,255,255,0.28)",
    white: "#ffffff",
    online: "#22c55e",
    unreadBadge: "#4f46e5",
    tabActive: "#4f46e5",
};

// ─── Types ─────────────────────────────────────────────────────────────────
type ChatType = "personal" | "group" | "community";
type MsgStatus = "sent" | "delivered" | "read";

interface Message {
    id: number;
    text: string;
    time: string;
    isSent: boolean;
    status?: MsgStatus;
    isLink?: boolean;
    linkUrl?: string;
    date?: string; // used for date separator
}

interface Chat {
    id: number;
    name: string;
    avatar?: string;
    type: ChatType;
    lastMessage: string;
    time: string;
    unreadCount: number;
    isOnline?: boolean;
    phone?: string;
    email?: string;
    media?: string[];
    messages: Message[];
}

// ─── Dummy Data ─────────────────────────────────────────────────────────────
const CHATS: Chat[] = [
    {
        id: 1,
        name: "CCN Community",
        type: "community",
        lastMessage: "You have been added to this community",
        time: "09:40 am",
        unreadCount: 3,
        messages: [
            { id: 1, text: "Welcome to CCN Community! Stay updated with all announcements, news, and learning resources.", time: "09:40 am", isSent: false, date: "24th July, 2026" },
            { id: 2, text: "You have been added to this community", time: "09:41 am", isSent: false },
            { id: 3, text: "Check out our latest courses on Ethical Hacking and CCNA!", time: "09:45 am", isSent: false },
            { id: 4, text: "Thank you! Excited to be here.", time: "10:00 am", isSent: true, status: "read" },
        ],
    },
    {
        id: 2,
        name: "CCNA Batch 2025-2026",
        type: "group",
        lastMessage: "You have been added to this group",
        time: "09:40 am",
        unreadCount: 1,
        messages: [
            { id: 1, text: "You have been added to CCNA Batch 2025-2026 group.", time: "09:40 am", isSent: false, date: "24th July, 2026" },
            { id: 2, text: "Today's session on Subnetting starts at 11:00 AM. Join on time!", time: "09:50 am", isSent: false },
            { id: 3, text: "Sure, I'll join!", time: "09:52 am", isSent: true, status: "read" },
        ],
    },
    {
        id: 3,
        name: "Account Department",
        type: "group",
        lastMessage: "You have been added to this group",
        time: "09:40 am",
        unreadCount: 0,
        messages: [
            { id: 1, text: "You have been added to Account Department group.", time: "09:40 am", isSent: false, date: "24th July, 2026" },
            { id: 2, text: "Please submit your fee receipts by July 30th.", time: "09:55 am", isSent: false },
            { id: 3, text: "Received, thank you.", time: "10:05 am", isSent: true, status: "read" },
        ],
    },
    {
        id: 4,
        name: "Falguni Pathak",
        type: "personal",
        avatar: "https://i.pravatar.cc/150?img=47",
        lastMessage: "https://www.connectingcybernetworks.com/",
        time: "4:00 pm",
        unreadCount: 0,
        isOnline: true,
        phone: "+91 9876543210",
        email: "falgunipathak@ccnmail.in",
        media: [
            "https://picsum.photos/seed/m1/80/60",
            "https://picsum.photos/seed/m2/80/60",
            "https://picsum.photos/seed/m3/80/60",
            "https://picsum.photos/seed/m4/80/60",
            "https://picsum.photos/seed/m5/80/60",
        ],
        messages: [
            {
                id: 1,
                text: "Connecting Cyber Networks offers various Cyber Security courses, including Ethical Hacking, CCNP Security, CCIE Security, Checkpoint CCSA/CCSE, PALO ALTO PCNSA, Bug Bounty, Penetration Testing, and Cyber Forensic. A career in cybersecurity offers significant scope and possibilities, including high salary growth potential, career advancement opportunities, and regular industry updates.",
                time: "3:55 pm", isSent: false, date: "24th July, 2026",
            },
            {
                id: 2,
                text: "Connecting Cyber Networks offers various Cyber Security courses, including Ethical Hacking, CCNP Security, CCIE Security, Checkpoint CCSA/CCSE, PALO ALTO PCNSA, Bug Bounty, Penetration Testing, and Cyber Forensic. A career in cybersecurity offers significant scope and possibilities, including high salary growth potential, career advancement opportunities, and regular industry updates.",
                time: "4:00 pm", isSent: true, status: "read",
            },
            {
                id: 3,
                text: "www.connectingcybernetworks.com\nhttps://www.connectingcybernetworks.com/",
                time: "4:00 pm", isSent: true, status: "read", isLink: true, linkUrl: "https://www.connectingcybernetworks.com/",
            },
        ],
    },
    {
        id: 5,
        name: "Kushal Korde",
        type: "personal",
        avatar: "https://i.pravatar.cc/150?img=12",
        lastMessage: "No Messages",
        time: "09:40 am",
        unreadCount: 0,
        phone: "+91 9823100012",
        email: "kushalkorde@ccnmail.in",
        media: [],
        messages: [],
    },
    {
        id: 6,
        name: "Reema Sharma",
        type: "personal",
        avatar: "https://i.pravatar.cc/150?img=32",
        lastMessage: "No Messages",
        time: "09:40 am",
        unreadCount: 0,
        isOnline: true,
        phone: "+91 9712233445",
        email: "reemasharma@ccnmail.in",
        media: ["https://picsum.photos/seed/r1/80/60", "https://picsum.photos/seed/r2/80/60"],
        messages: [],
    },
    {
        id: 7,
        name: "Hazel Desai",
        type: "personal",
        avatar: "https://i.pravatar.cc/150?img=23",
        lastMessage: "No Messages",
        time: "09:40 am",
        unreadCount: 0,
        phone: "+91 9900112233",
        email: "hazeldesai@ccnmail.in",
        media: [],
        messages: [],
    },
    {
        id: 8,
        name: "Harsh Rawal",
        type: "personal",
        avatar: "https://i.pravatar.cc/150?img=8",
        lastMessage: "No Messages",
        time: "09:40 am",
        unreadCount: 0,
        phone: "+91 9988776655",
        email: "harshrawal@ccnmail.in",
        media: [],
        messages: [],
    },
    {
        id: 9,
        name: "Aniket Pandit",
        type: "personal",
        avatar: "https://i.pravatar.cc/150?img=15",
        lastMessage: "No Messages",
        time: "09:40 am",
        unreadCount: 0,
        phone: "+91 9765432100",
        email: "aniketpandit@ccnmail.in",
        media: [],
        messages: [],
    },
    {
        id: 10,
        name: "Kirti Prajapati",
        type: "personal",
        avatar: "https://i.pravatar.cc/150?img=44",
        lastMessage: "No Messages",
        time: "09:40 am",
        unreadCount: 0,
        phone: "+91 9654321089",
        email: "kirtiprajapati@ccnmail.in",
        media: [],
        messages: [],
    },
];

const FILTER_TABS = ["All", "Unread", "Communities"];

// ─── Helper: group icon ─────────────────────────────────────────────────────
function GroupAvatar({ type, size = 36 }: { type: ChatType; size?: number }) {
    const Icon = type === "community" ? MdShield : type === "group" ? MdGroups : null;
    const bg =
        type === "community" ? "linear-gradient(135deg,#4f46e5,#7c3aed)" :
            type === "group" ? "linear-gradient(135deg,#0ea5e9,#2563eb)" : "transparent";
    if (!Icon) return null;
    return (
        <Box sx={{
            width: size, height: size, borderRadius: "50%",
            background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
            <Icon size={size * 0.52} color="#fff" />
        </Box>
    );
}

// ─── Helper: message status ticks ──────────────────────────────────────────
function MsgTick({ status }: { status?: MsgStatus }) {
    if (!status) return null;
    if (status === "read") return <MdDoneAll size={14} color="#818cf8" />;
    if (status === "delivered") return <MdDoneAll size={14} color={C.secondaryText} />;
    return <MdDone size={14} color={C.secondaryText} />;
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function ChatsPage() {
    const [activeTab, setActiveTab] = useState("All");
    const [activeChatId, setActiveChatId] = useState<number>(4);
    const [inputText, setInputText] = useState("");
    const [chats, setChats] = useState<Chat[]>(CHATS);
    const [showSidebar, setShowSidebar] = useState(true); // mobile toggle
    const [showContactInfo, setShowContactInfo] = useState(false);
    const [muteNotif, setMuteNotif] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeChat = chats.find((c) => c.id === activeChatId)!;

    const filteredChats = chats.filter((c) => {
        if (activeTab === "Unread") return c.unreadCount > 0;
        if (activeTab === "Communities") return c.type === "community";
        return true;
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeChatId, activeChat?.messages.length]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        const now = new Date();
        const time = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
        const newMsg: Message = { id: Date.now(), text: inputText.trim(), time, isSent: true, status: "sent" };
        setChats((prev) =>
            prev.map((c) =>
                c.id === activeChatId
                    ? { ...c, lastMessage: inputText.trim(), time, messages: [...c.messages, newMsg] }
                    : c
            )
        );
        setInputText("");
    };

    const handleSelectChat = (id: number) => {
        setActiveChatId(id);
        setShowSidebar(false);
        setShowContactInfo(false);
        setChats((prev) => prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)));
    };

    return (

        <Box sx={{
            display: "flex", height: "100%", overflow: "hidden",
            borderRadius: "16px", border: `1px solid ${C.sidebarBorder}`,
            // background: C.bg,
            minHeight: "100vh",
        }}>

            {/* ── Left: Chat List ─────────────────────────────────────────── */}
            <Box sx={{
                width: { xs: showSidebar ? "100%" : "0", md: "270px" },
                minWidth: { xs: showSidebar ? "100%" : "0", md: "270px" },
                display: { xs: showSidebar ? "flex" : "none", md: "flex" },
                flexDirection: "column",
                // background: C.sidebar,
                borderRight: `1px solid ${C.sidebarBorder}`,
                overflow: "hidden",
                transition: "width 0.2s",
            }}>
                {/* Header */}
                <Box sx={{ px: 2, pt: 1.8, pb: 1.2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: C.white }}>Chats</Typography>
                    <IconButton size="small" sx={{ color: C.secondaryText, "&:hover": { color: C.white } }}>
                        <MdMoreVert size={18} />
                    </IconButton>
                </Box>

                {/* Search */}
                <Box sx={{ px: 1.5, pb: 1 }}>
                    <Box sx={{
                        display: "flex", alignItems: "center", gap: 1,
                        background: C.inputBg, borderRadius: "10px",
                        px: 1.5, py: 0.6, border: `1px solid ${C.sidebarBorder}`,
                    }}>
                        <MdSearch size={16} color={C.secondaryText} />
                        <InputBase
                            placeholder="Search or start a new chat"
                            sx={{ fontSize: "0.75rem", color: C.white, flex: 1, "& ::placeholder": { color: C.secondaryText } }}
                        />
                    </Box>
                </Box>

                {/* Tabs */}
                <Box sx={{ display: "flex", gap: 0.5, px: 1.5, pb: 1 }}>
                    {FILTER_TABS.map((tab) => (
                        <Box
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            sx={{
                                px: 1.2, py: 0.35, borderRadius: "20px", cursor: "pointer",
                                fontSize: "0.7rem", fontWeight: 600,
                                background: activeTab === tab ? C.tabActive : "rgba(255,255,255,0.07)",
                                color: activeTab === tab ? C.white : C.secondaryText,
                                transition: "all 0.2s",
                                "&:hover": { background: activeTab === tab ? C.tabActive : "rgba(255,255,255,0.1)" },
                            }}
                        >{tab}</Box>
                    ))}
                </Box>

                {/* Chat Items */}
                <Box sx={{ flex: 1, overflowY: "auto", "&::-webkit-scrollbar": { width: "3px" }, "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.1)", borderRadius: "4px" } }}>
                    {filteredChats.map((chat) => (
                        <motion.div key={chat.id} whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
                            <Box
                                onClick={() => handleSelectChat(chat.id)}
                                sx={{
                                    display: "flex", alignItems: "center", gap: 1.2,
                                    px: 1.5, py: 1,
                                    cursor: "pointer",
                                    background: activeChatId === chat.id ? C.activeChat : "transparent",
                                    borderLeft: activeChatId === chat.id ? `3px solid ${C.activeChatBorder}` : "3px solid transparent",
                                    "&:hover": { background: activeChatId === chat.id ? C.activeChat : C.hoverChat },
                                    transition: "background 0.15s",
                                }}
                            >
                                {/* Avatar */}
                                <Box sx={{ position: "relative", flexShrink: 0 }}>
                                    {chat.type !== "personal" ? (
                                        <GroupAvatar type={chat.type} size={38} />
                                    ) : (
                                        <Avatar src={chat.avatar} sx={{ width: 38, height: 38, fontSize: "0.85rem" }}>
                                            {chat.name[0]}
                                        </Avatar>
                                    )}
                                    {chat.isOnline && (
                                        <Box sx={{
                                            position: "absolute", bottom: 1, right: 1,
                                            width: 9, height: 9, borderRadius: "50%",
                                            background: C.online, border: `2px solid ${C.sidebar}`,
                                        }} />
                                    )}
                                </Box>

                                {/* Info */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.2 }}>
                                        <Typography sx={{ fontWeight: 600, fontSize: "0.78rem", color: C.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "140px" }}>
                                            {chat.name}
                                        </Typography>
                                        <Typography sx={{ fontSize: "0.65rem", color: chat.unreadCount > 0 ? "#818cf8" : C.mutedText, flexShrink: 0, ml: 0.5 }}>
                                            {chat.time}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Typography sx={{ fontSize: "0.7rem", color: C.secondaryText, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "150px" }}>
                                            {chat.lastMessage}
                                        </Typography>
                                        {chat.unreadCount > 0 && (
                                            <Box sx={{
                                                minWidth: 18, height: 18, borderRadius: "9px",
                                                background: C.unreadBadge, display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: "0.6rem", fontWeight: 700, color: C.white, px: 0.5, flexShrink: 0, ml: 0.5,
                                            }}>
                                                {chat.unreadCount}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </motion.div>
                    ))}
                </Box>
            </Box>

            {/* ── Right: Active Chat ──────────────────────────────────────── */}
            <Box sx={{
                flex: 1, display: { xs: !showSidebar ? "flex" : "none", md: "flex" },
                flexDirection: "column", overflow: "hidden",
                // background: C.chatBg,
                backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
            }}>
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <Box sx={{
                            display: "flex", alignItems: "center", gap: 1.2,
                            px: 2, py: 1.2,
                            borderBottom: `1px solid ${C.sidebarBorder}`,
                        }}>
                            {/* Mobile back button */}
                            <IconButton size="small" onClick={() => setShowSidebar(true)} sx={{ display: { md: "none" }, color: C.secondaryText, mr: 0.5 }}>
                                <MdArrowBack size={18} />
                            </IconButton>

                            {/* Clickable profile area */}
                            <Box
                                onClick={() => setShowContactInfo((v) => !v)}
                                sx={{ display: "flex", alignItems: "center", gap: 1.2, flex: 1, cursor: "pointer", borderRadius: "10px", py: 0.3, px: 0.5, "&:hover": { background: "rgba(255,255,255,0.04)" }, transition: "background 0.15s" }}
                            >
                                <Box sx={{ position: "relative" }}>
                                    {activeChat.type !== "personal" ? (
                                        <GroupAvatar type={activeChat.type} size={36} />
                                    ) : (
                                        <Avatar src={activeChat.avatar} sx={{ width: 36, height: 36, fontSize: "0.8rem" }}>
                                            {activeChat.name[0]}
                                        </Avatar>
                                    )}
                                    {activeChat.isOnline && (
                                        <Box sx={{
                                            position: "absolute", bottom: 1, right: 1,
                                            width: 8, height: 8, borderRadius: "50%",
                                            background: C.online, border: `2px solid ${C.sidebar}`,
                                        }} />
                                    )}
                                </Box>
                                <Box>
                                    <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: C.white }}>
                                        {activeChat.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.65rem", color: activeChat.isOnline ? C.online : C.secondaryText }}>
                                        {activeChat.isOnline ? "online" : activeChat.type !== "personal" ? `${activeChat.messages.length} members` : "offline"}
                                    </Typography>
                                </Box>
                            </Box>

                            <IconButton size="small" sx={{ color: C.secondaryText, "&:hover": { color: C.white } }}>
                                <MdSearch size={18} />
                            </IconButton>
                            <IconButton size="small" sx={{ color: C.secondaryText, "&:hover": { color: C.white } }}>
                                <MdMoreVert size={18} />
                            </IconButton>
                        </Box>

                        {/* Messages */}
                        <Box sx={{ flex: 1, maxHeight: "calc(100vh - 120px)", overflowY: "auto", px: { xs: 1.5, md: 2.5 }, py: 1.5, display: "flex", flexDirection: "column", gap: 0.5, "&::-webkit-scrollbar": { width: "3px" }, "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.1)", borderRadius: "4px" } }}>
                            {activeChat.messages.length === 0 ? (
                                <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Typography sx={{ fontSize: "0.75rem", color: C.secondaryText }}>No messages yet. Say hi! 👋</Typography>
                                </Box>
                            ) : (
                                activeChat.messages.map((msg, idx) => (
                                    <React.Fragment key={msg.id}>
                                        {/* Date separator */}
                                        {msg.date && (
                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", my: 1 }}>
                                                <Box sx={{ px: 1.5, py: 0.3, borderRadius: "10px", background: "rgba(255,255,255,0.07)", border: `1px solid rgba(255,255,255,0.08)` }}>
                                                    <Typography sx={{ fontSize: "0.65rem", color: C.dividerText, fontWeight: 500 }}>{msg.date}</Typography>
                                                </Box>
                                            </Box>
                                        )}

                                        {/* Message Bubble */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.18 }}
                                            style={{ display: "flex", justifyContent: msg.isSent ? "flex-end" : "flex-start" }}
                                        >
                                            <Box sx={{
                                                maxWidth: { xs: "85%", md: "60%" },
                                                px: 1.5, py: 1,
                                                borderRadius: msg.isSent ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                                                background: msg.isSent ? C.sentBubble : C.receivedBubble,
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                                            }}>
                                                {msg.isLink ? (
                                                    <Box>
                                                        <Box sx={{ background: "rgba(0,0,0,0.25)", borderRadius: "8px", p: 1, mb: 0.5 }}>
                                                            <Typography sx={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.55)", mb: 0.3 }}>
                                                                {msg.linkUrl}
                                                            </Typography>
                                                            <Typography
                                                                component="a"
                                                                href={msg.linkUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                sx={{ fontSize: "0.7rem", color: "#93c5fd", wordBreak: "break-all", textDecoration: "underline", display: "block" }}
                                                            >
                                                                {msg.linkUrl}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                ) : (
                                                    <Typography sx={{ fontSize: "0.75rem", color: C.white, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                                                        {msg.text}
                                                    </Typography>
                                                )}
                                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.4, mt: 0.4 }}>
                                                    <Typography sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.45)" }}>{msg.time}</Typography>
                                                    {msg.isSent && <MsgTick status={msg.status} />}
                                                </Box>
                                            </Box>
                                        </motion.div>
                                    </React.Fragment>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </Box>

                        {/* Input Bar */}
                        <Box sx={{
                            display: "flex", alignItems: "center", gap: 1,
                            px: 1.5, py: 1,
                            // background: C.sidebar,
                            borderTop: `1px solid ${C.sidebarBorder}`,
                        }}>
                            <IconButton size="small" sx={{ color: C.secondaryText, "&:hover": { color: C.white } }}>
                                <MdAdd size={20} />
                            </IconButton>
                            <IconButton size="small" sx={{ color: C.secondaryText, "&:hover": { color: C.white } }}>
                                <MdSentimentSatisfiedAlt size={20} />
                            </IconButton>

                            <Box sx={{
                                flex: 1, display: "flex", alignItems: "center", borderRadius: "24px",
                                px: 1.8, py: 0.6,
                                border: `1px solid ${C.sidebarBorder}`,
                            }}>
                                <InputBase
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                                    placeholder="Type a message"
                                    multiline
                                    maxRows={3}
                                    sx={{ flex: 1, fontSize: "0.78rem", color: C.white, "& ::placeholder": { color: C.secondaryText } }}
                                />
                            </Box>

                            <IconButton
                                onClick={handleSend}
                                size="small"
                                sx={{
                                    width: 36, height: 36, borderRadius: "50%",
                                    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                                    color: C.white, flexShrink: 0,
                                    "&:hover": { background: "linear-gradient(135deg,#6366f1,#8b5cf6)", transform: "scale(1.05)" },
                                    transition: "all 0.15s",
                                }}
                            >
                                <MdSend size={16} />
                            </IconButton>
                        </Box>
                    </>
                ) : (
                    <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Typography sx={{ fontSize: "0.8rem", color: C.secondaryText }}>Select a chat to start messaging</Typography>
                    </Box>
                )}
            </Box>

            {/* ── Right: Contact Info Panel ─────────────────────────── */}
            <AnimatePresence>
                {showContactInfo && activeChat && (
                    <motion.div
                        key="contact-info"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 230, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        style={{ overflow: "hidden", flexShrink: 0 }}
                    >
                        <Box sx={{
                            width: 230, height: "100%", display: "flex", flexDirection: "column",
                            borderLeft: `1px solid ${C.sidebarBorder}`,
                            overflowY: "auto",
                            "&::-webkit-scrollbar": { width: "3px" },
                            "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.1)", borderRadius: "4px" },
                        }}>
                            {/* Header */}
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.8, py: 1.3, borderBottom: `1px solid ${C.sidebarBorder}` }}>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: C.white }}>Contact Info</Typography>
                                <IconButton size="small" onClick={() => setShowContactInfo(false)} sx={{ color: C.secondaryText, "&:hover": { color: C.white } }}>
                                    <MdClose size={16} />
                                </IconButton>
                            </Box>

                            {/* Avatar + Name */}
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 2.5, pb: 1.5, gap: 0.8 }}>
                                <Box sx={{ position: "relative" }}>
                                    {activeChat.type !== "personal" ? (
                                        <GroupAvatar type={activeChat.type} size={72} />
                                    ) : (
                                        <Avatar src={activeChat.avatar} sx={{ width: 72, height: 72, fontSize: "1.4rem", border: `2px solid rgba(99,102,241,0.4)` }}>
                                            {activeChat.name[0]}
                                        </Avatar>
                                    )}
                                    {activeChat.isOnline && (
                                        <Box sx={{ position: "absolute", bottom: 3, right: 3, width: 12, height: 12, borderRadius: "50%", background: C.online, border: `2px solid ${C.sidebar}` }} />
                                    )}
                                </Box>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: C.white }}>{activeChat.name}</Typography>
                            </Box>

                            {/* Phone & Email */}
                            {activeChat.phone && (
                                <Box sx={{ px: 1.8, py: 0.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                        <MdPhone size={14} color={C.secondaryText} />
                                        <Typography sx={{ fontSize: "0.72rem", color: C.white }}>{activeChat.phone}</Typography>
                                    </Box>
                                    <IconButton size="small" sx={{ color: C.secondaryText, "&:hover": { color: C.white } }}>
                                        <MdContentCopy size={13} />
                                    </IconButton>
                                </Box>
                            )}
                            {activeChat.email && (
                                <Box sx={{ px: 1.8, py: 0.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <Typography sx={{ fontSize: "0.7rem", color: C.white, wordBreak: "break-all" }}>{activeChat.email}</Typography>
                                    <IconButton size="small" sx={{ color: C.secondaryText, "&:hover": { color: C.white } }}>
                                        <MdContentCopy size={13} />
                                    </IconButton>
                                </Box>
                            )}

                            {/* Call Buttons */}
                            {activeChat.type === "personal" && (
                                <Box sx={{ display: "flex", gap: 1, px: 1.8, py: 1.2 }}>
                                    <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, py: 0.6, borderRadius: "8px", border: `1px solid ${C.sidebarBorder}`, cursor: "pointer", "&:hover": { background: "rgba(255,255,255,0.05)" } }}>
                                        <MdVideoCall size={15} color={C.secondaryText} />
                                        <Typography sx={{ fontSize: "0.68rem", color: C.secondaryText }}>Video Call</Typography>
                                    </Box>
                                    <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, py: 0.6, borderRadius: "8px", border: `1px solid ${C.sidebarBorder}`, cursor: "pointer", "&:hover": { background: "rgba(255,255,255,0.05)" } }}>
                                        <MdPhone size={14} color={C.secondaryText} />
                                        <Typography sx={{ fontSize: "0.68rem", color: C.secondaryText }}>Phone Call</Typography>
                                    </Box>
                                </Box>
                            )}

                            {/* Media */}
                            {activeChat.media && activeChat.media.length > 0 && (
                                <Box sx={{ px: 1.8, pb: 1.2 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.8 }}>
                                        <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: C.white, letterSpacing: "0.05em", textTransform: "uppercase" }}>Media</Typography>
                                        <Box sx={{ px: 0.8, py: 0.15, borderRadius: "8px", background: C.unreadBadge }}>
                                            <Typography sx={{ fontSize: "0.6rem", color: C.white, fontWeight: 700 }}>{activeChat.media.length}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0.5 }}>
                                        {activeChat.media.slice(0, 3).map((src, i) => (
                                            <Box key={i} component="img" src={src} sx={{ width: "100%", aspectRatio: "4/3", borderRadius: "6px", objectFit: "cover", border: `1px solid ${C.sidebarBorder}` }} />
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            <Box sx={{ borderTop: `1px solid ${C.sidebarBorder}`, mt: 0.5 }} />

                            {/* Action rows */}
                            {[
                                { icon: <MdNotificationsNone size={16} />, label: "Mute Notification", toggle: true },
                                { icon: <MdStar size={16} />, label: "Starred Messages" },
                                { icon: <MdFavoriteBorder size={16} />, label: "Add to Favorites" },
                            ].map((item) => (
                                <Box key={item.label} sx={{ display: "flex", alignItems: "center", px: 1.8, py: 0.9, cursor: "pointer", "&:hover": { background: C.hoverChat }, transition: "background 0.15s" }}>
                                    <Box sx={{ color: C.secondaryText, mr: 1.2, display: "flex" }}>{item.icon}</Box>
                                    <Typography sx={{ flex: 1, fontSize: "0.73rem", color: C.white }}>{item.label}</Typography>
                                    {item.toggle && (
                                        <Switch
                                            checked={muteNotif}
                                            onChange={(e) => setMuteNotif(e.target.checked)}
                                            size="small"
                                            sx={{ "& .MuiSwitch-thumb": { width: 12, height: 12 }, "& .MuiSwitch-track": { borderRadius: 6 } }}
                                        />
                                    )}
                                </Box>
                            ))}

                            <Box sx={{ borderTop: `1px solid ${C.sidebarBorder}`, mt: 0.5 }} />

                            {/* Danger rows */}
                            {[
                                { icon: <MdBlock size={16} />, label: `Block ${activeChat.name}` },
                                { icon: <MdFlag size={16} />, label: `Report ${activeChat.name}` },
                                { icon: <MdDeleteOutline size={16} />, label: "Delete Chats" },
                            ].map((item) => (
                                <Box key={item.label} sx={{ display: "flex", alignItems: "center", px: 1.8, py: 0.9, cursor: "pointer", "&:hover": { background: "rgba(239,68,68,0.07)" }, transition: "background 0.15s" }}>
                                    <Box sx={{ color: "#ef4444", mr: 1.2, display: "flex" }}>{item.icon}</Box>
                                    <Typography sx={{ fontSize: "0.73rem", color: "#ef4444" }}>{item.label}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
}