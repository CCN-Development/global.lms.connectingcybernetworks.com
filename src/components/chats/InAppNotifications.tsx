"use client";

import React, { useEffect, useRef } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { MdClose, MdReply } from "react-icons/md";
import { C } from "./theme";
import type { ChatType } from "./types";
import ChatAvatar from "./ChatAvatar";

export type ChatToast = {
    id: string;
    chatId: string;
    chatName: string;
    chatType: ChatType;
    senderName: string;
    avatar?: string;
    preview: string;
    time: string;
};

const AUTO_DISMISS_MS = 6000;

function ToastCard({ toast, onOpen, onDismiss }: { toast: ChatToast; onOpen: () => void; onDismiss: () => void }) {
    const dismissRef = useRef(onDismiss);

    useEffect(() => { dismissRef.current = onDismiss; });

    useEffect(() => {
        const timer = setTimeout(() => dismissRef.current(), AUTO_DISMISS_MS);
        return () => clearTimeout(timer);
    }, [toast.id]);

    const isGroupish = toast.chatType !== "personal";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
        >
            <Box
                onClick={onOpen}
                sx={{
                    position: "relative", width: 296, cursor: "pointer", overflow: "hidden",
                    display: "flex", alignItems: "flex-start", gap: 1, p: 1.2,
                    background: C.panelSolid, border: `1px solid ${C.border}`, borderRadius: "10px",
                    borderLeft: `3px solid ${C.accent}`,
                    boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
                    "&:hover": { background: C.raised, borderColor: C.accent },
                    transition: "background 0.15s, border-color 0.15s",
                }}
            >
                <ChatAvatar name={toast.chatName} avatar={toast.avatar} type={toast.chatType} size={34} />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 0.5 }}>
                        <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {toast.chatName}
                        </Typography>
                        <Typography sx={{ fontSize: "0.6rem", color: C.textMuted, flexShrink: 0 }}>{toast.time}</Typography>
                    </Box>

                    {isGroupish && (
                        <Typography sx={{ fontSize: "0.63rem", color: C.accentSoft, fontWeight: 600 }}>
                            {toast.senderName}
                        </Typography>
                    )}

                    <Typography
                        sx={{
                            fontSize: "0.7rem", color: C.textSoft, mt: 0.1,
                            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}
                    >
                        {toast.preview}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.5, color: C.accentSoft }}>
                        <MdReply size={12} />
                        <Typography sx={{ fontSize: "0.6rem", fontWeight: 600 }}>Click to open chat</Typography>
                    </Box>
                </Box>

                <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onDismiss(); }}
                    sx={{ color: C.textMuted, p: 0.3, "&:hover": { color: C.text } }}
                >
                    <MdClose size={14} />
                </IconButton>

                <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: 0 }}
                    transition={{ duration: AUTO_DISMISS_MS / 1000, ease: "linear" }}
                    style={{ position: "absolute", left: 0, bottom: 0, height: 2, background: C.accent }}
                />
            </Box>
        </motion.div>
    );
}

type Props = {
    toasts: ChatToast[];
    onOpen: (chatId: string, toastId: string) => void;
    onDismiss: (toastId: string) => void;
};

export default function InAppNotifications({ toasts, onOpen, onDismiss }: Props) {
    return (
        <Box
            sx={{
                position: "fixed", top: 14, right: 14, zIndex: 1400,
                display: "flex", flexDirection: "column", gap: 1, pointerEvents: "none",
                "& > *": { pointerEvents: "auto" },
            }}
        >
            <AnimatePresence initial={false}>
                {toasts.slice(0, 3).map((toast) => (
                    <ToastCard
                        key={toast.id}
                        toast={toast}
                        onOpen={() => onOpen(toast.chatId, toast.id)}
                        onDismiss={() => onDismiss(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </Box>
    );
}
