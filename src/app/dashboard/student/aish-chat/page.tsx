"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Drawer, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { PanelLeft, X } from "lucide-react";
import AshOrb from "@/components/aish/AshOrb";
import AishComposer from "@/components/aish/AishComposer";
import ChatHistorySidebar from "@/components/aish/ChatHistorySidebar";
import MessageBubble from "@/components/aish/MessageBubble";
import QuickActions from "@/components/aish/QuickActions";
import { ACTION_FLOWS, ASSISTANT_PROMPT, ROOT_ACTIONS, THREADS_BY_ID, type AishMessage } from "@/components/aish/data";
import { AISH, FONT_INTER, FONT_LATO, FONT_POPPINS, gradientBorder } from "@/components/aish/tokens";

const HISTORY_WIDTH = 234;

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const panelSx = {
    position: "relative" as const,
    display: "flex",
    flexDirection: "column" as const,
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    borderRadius: "24px",
    backgroundImage: AISH.panelBg,
    overflow: "hidden",
    "&::before": gradientBorder(),
};

export default function AishChatPage() {
    const router = useRouter();
    const [messages, setMessages] = useState<AishMessage[]>([]);
    const [draft, setDraft] = useState("");
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const started = messages.length > 0;

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages]);

    const reply = useCallback((prompt: string) => {
        const followUps = ACTION_FLOWS[prompt];
        const stamp = Date.now();
        setMessages((prev) => [
            ...prev,
            { id: `u-${stamp}`, role: "user", text: prompt, time: now() },
            {
                id: `a-${stamp + 1}`,
                role: "assistant",
                text: followUps ? ASSISTANT_PROMPT : `Let me pull that up for you — here is what I found about "${prompt}".`,
                time: now(),
                actions: followUps?.map((label) => ({ label })),
            },
        ]);
    }, []);

    const handleSelectAction = useCallback(
        (label: string) => {
            setHistoryOpen(false);
            reply(label);
        },
        [reply],
    );

    const handleSubmit = useCallback(() => {
        const text = draft.trim();
        if (!text) return;
        setDraft("");
        reply(text);
    }, [draft, reply]);

    const handleNewChat = useCallback(() => {
        setMessages([]);
        setDraft("");
        setActiveChatId(null);
        setHistoryOpen(false);
    }, []);

    const handleSelectChat = useCallback((id: string) => {
        const thread = THREADS_BY_ID[id];
        if (!thread) return;
        setActiveChatId(id);
        setMessages(thread.messages);
        setDraft("");
        setHistoryOpen(false);
    }, []);

    const header = (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", width: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: "12px", sm: "20px" }, minWidth: 0 }}>
                {started && <AshOrb size={44} />}
                <Typography
                    sx={{
                        fontFamily: FONT_LATO,
                        fontSize: "18px",
                        fontWeight: 600,
                        lineHeight: "27px",
                        color: AISH.white,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {started ? "Ask Aish" : "AI Assistant"}
                </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <Box
                    component="button"
                    type="button"
                    aria-label="Chat history"
                    onClick={() => setHistoryOpen(true)}
                    sx={{
                        display: started ? { xs: "flex", lg: "none" } : "flex",
                        alignItems: "center",
                        p: "8px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.04)",
                        backgroundImage: AISH.iconButtonBg,
                        backdropFilter: "blur(25px)",
                        cursor: "pointer",
                        transition: "border-color 0.18s ease",
                        "&:hover": { borderColor: "rgba(255,255,255,0.24)" },
                    }}
                >
                    <PanelLeft size={20} strokeWidth={1.5} color={AISH.textStrong} />
                </Box>

                <Box
                    component="button"
                    type="button"
                    onClick={() => router.back()}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        pl: "12px",
                        pr: "16px",
                        py: "8px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.04)",
                        backgroundImage: AISH.iconButtonBg,
                        backdropFilter: "blur(25px)",
                        color: AISH.textStrong,
                        cursor: "pointer",
                        transition: "border-color 0.18s ease",
                        "&:hover": { borderColor: "rgba(255,255,255,0.24)" },
                    }}
                >
                    <X size={20} strokeWidth={1.5} color={AISH.textStrong} />
                    <Typography component="span" sx={{ fontFamily: FONT_LATO, fontSize: "16px", fontWeight: 500, lineHeight: "24px", color: "inherit" }}>
                        Close
                    </Typography>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", gap: "24px", color: "#fff", padding: 2 }}>
            {header}

            <Box sx={{ display: "flex", gap: "24px", flex: 1, minHeight: 0 }}>
                {started && (
                    <Box sx={{ display: { xs: "none", lg: "block" }, width: HISTORY_WIDTH, flexShrink: 0 }}>
                        <ChatHistorySidebar activeId={activeChatId} onSelect={handleSelectChat} onNewChat={handleNewChat} />
                    </Box>
                )}

                <Box sx={panelSx}>
                    {started ? (
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: { xs: "20px", sm: "32px" },
                                flex: 1,
                                minHeight: 0,
                                p: { xs: "16px", sm: "24px", md: "32px" },
                            }}
                        >
                            <Box
                                ref={scrollRef}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: { xs: "20px", sm: "32px" },
                                    flex: 1,
                                    minHeight: 0,
                                    overflowY: "auto",
                                    scrollbarWidth: "none",
                                    "&::-webkit-scrollbar": { display: "none" },
                                }}
                            >
                                {messages.map((message) => (
                                    <MessageBubble key={message.id} message={message} onSelectAction={handleSelectAction} />
                                ))}
                            </Box>

                            <AishComposer
                                variant="inline"
                                value={draft}
                                onChange={setDraft}
                                onSubmit={handleSubmit}
                                placeholder="Ask Ash anything about your program...."
                            />
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                display: "flex",
                                flex: 1,
                                minHeight: 0,
                                overflowY: "auto",
                                p: { xs: "16px", sm: "24px" },
                                scrollbarWidth: "none",
                                "&::-webkit-scrollbar": { display: "none" },
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: { xs: "32px", md: "64px" },
                                    width: "100%",
                                    m: "auto",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: { xs: "32px", sm: "56px", md: "82px" },
                                        width: "100%",
                                    }}
                                >
                                    <AshOrb size={88} glow />
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%" }}>
                                        <Typography
                                            sx={{
                                                fontFamily: FONT_POPPINS,
                                                fontWeight: 400,
                                                fontSize: { xs: "24px", sm: "32px" },
                                                lineHeight: { xs: "36px", sm: "48px" },
                                                color: AISH.white,
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            Hey, I&apos;m Ash
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontFamily: FONT_INTER,
                                                fontSize: { xs: "14px", sm: "16px" },
                                                lineHeight: "24px",
                                                color: AISH.textSoft,
                                                textAlign: "center",
                                                width: "100%",
                                                maxWidth: 652,
                                            }}
                                        >
                                            Your course assistant. Ask me about labs, schedules, fees, exam prep — or anything
                                            else about your program.
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: { xs: "20px", sm: "32px" },
                                        width: "100%",
                                        maxWidth: 700,
                                    }}
                                >
                                    <AishComposer variant="hero" value={draft} onChange={setDraft} onSubmit={handleSubmit} />
                                    <QuickActions actions={ROOT_ACTIONS} onSelect={handleSelectAction} align="center" />
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>

            <Drawer
                anchor="left"
                open={historyOpen}
                onClose={() => setHistoryOpen(false)}
                slotProps={{
                    paper: {
                        sx: {
                            width: HISTORY_WIDTH + 48,
                            p: "24px",
                            bgcolor: "rgba(9,9,21,0.96)",
                            backdropFilter: "blur(4px)",
                            backgroundImage: "none",
                            borderRight: "1px solid rgba(255,255,255,0.10)",
                        },
                    },
                }}
            >
                <ChatHistorySidebar activeId={activeChatId} onSelect={handleSelectChat} onNewChat={handleNewChat} />
            </Drawer>
        </Box>
    );
}