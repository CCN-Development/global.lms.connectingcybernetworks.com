"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { Plus } from "lucide-react";
import { AISH, FONT_INTER, FONT_LATO } from "./tokens";
import { CHAT_HISTORY } from "./data";

interface ChatHistorySidebarProps {
    activeId: string | null;
    onSelect: (id: string) => void;
    onNewChat: () => void;
}

export default function ChatHistorySidebar({ activeId, onSelect, onNewChat }: ChatHistorySidebarProps) {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: "20px", sm: "32px" },
                width: "100%",
                height: "100%",
                overflowY: "auto",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
            }}
        >
            <Box
                component="button"
                type="button"
                onClick={onNewChat}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    width: "100%",
                    py: "12px",
                    border: "none",
                    borderRadius: "16px",
                    bgcolor: AISH.menuActiveBg,
                    color: AISH.textStrong,
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "background-color 0.18s ease",
                    "&:hover": { bgcolor: "rgba(84,84,84,0.6)" },
                }}
            >
                <Plus size={24} strokeWidth={1.5} color={AISH.textStrong} />
                <Typography component="span" sx={{ fontFamily: FONT_LATO, fontSize: "14px", fontWeight: 500, lineHeight: "21px", color: "inherit" }}>
                    New Chat
                </Typography>
            </Box>

            {CHAT_HISTORY.map((group) => (
                <Box key={group.label} sx={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                    <Typography sx={{ fontFamily: FONT_LATO, fontSize: "14px", fontWeight: 400, lineHeight: "21px", color: AISH.textLabel }}>
                        {group.label}
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                        {group.items.map((item) => {
                            const isActive = item.id === activeId;
                            return (
                                <Box
                                    key={item.id}
                                    component="button"
                                    type="button"
                                    onClick={() => onSelect(item.id)}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        width: "100%",
                                        py: "12px",
                                        px: "12px",
                                        border: "none",
                                        borderRadius: "16px",
                                        bgcolor: isActive ? AISH.menuActiveBg : "transparent",
                                        color: isActive ? AISH.textStrong : AISH.textMuted,
                                        cursor: "pointer",
                                        textAlign: "left",
                                        overflow: "hidden",
                                        transition: "background-color 0.18s ease, color 0.18s ease",
                                        "&:hover": { bgcolor: "rgba(64,64,64,0.35)", color: AISH.textStrong },
                                    }}
                                >
                                    <Typography
                                        component="span"
                                        sx={{
                                            fontFamily: FONT_LATO,
                                            fontSize: "14px",
                                            fontWeight: 500,
                                            lineHeight: "21px",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            color: "inherit",
                                        }}
                                    >
                                        {item.title}
                                    </Typography>
                                    {item.meta && (
                                        <Typography
                                            component="span"
                                            sx={{
                                                fontFamily: FONT_INTER,
                                                fontSize: "12px",
                                                lineHeight: "18px",
                                                color: AISH.textMuted,
                                                whiteSpace: "nowrap",
                                                flexShrink: 0,
                                            }}
                                        >
                                            {item.meta}
                                        </Typography>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            ))}
        </Box>
    );
}
