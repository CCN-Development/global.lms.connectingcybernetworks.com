"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { AISH, FONT_LATO, gradientBorder } from "./tokens";
import QuickActions from "./QuickActions";
import type { AishMessage } from "./data";

interface MessageBubbleProps {
    message: AishMessage;
    onSelectAction: (label: string) => void;
}

export default function MessageBubble({ message, onSelectAction }: MessageBubbleProps) {
    const isUser = message.role === "user";

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                width: "100%",
                alignItems: isUser ? "flex-end" : "flex-start",
            }}
        >
            <Box
                sx={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    maxWidth: isUser ? { xs: "85%", sm: "70%" } : { xs: "100%", md: "516px" },
                    px: "20px",
                    py: "16px",
                    borderRadius: "24px",
                    backgroundImage: isUser ? AISH.userBubbleBg : AISH.botBubbleBg,
                    backdropFilter: "blur(12px)",
                    boxShadow: AISH.bubbleInnerGlow,
                    "&::before": gradientBorder(),
                }}
            >
                <Typography
                    sx={{
                        fontFamily: FONT_LATO,
                        fontSize: "16px",
                        fontWeight: 500,
                        lineHeight: "24px",
                        color: AISH.textBody,
                        wordBreak: "break-word",
                    }}
                >
                    {message.text}
                </Typography>

                {message.actions && message.actions.length > 0 && (
                    <QuickActions actions={message.actions} onSelect={onSelectAction} />
                )}
            </Box>

            <Typography sx={{ fontFamily: FONT_LATO, fontSize: "12px", fontWeight: 500, lineHeight: "18px", color: AISH.textLabel }}>
                {message.time}
            </Typography>
        </Box>
    );
}
