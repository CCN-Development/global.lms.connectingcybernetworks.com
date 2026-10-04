"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { AISH, FONT_LATO } from "./tokens";
import type { AishQuickAction } from "./data";

interface QuickActionsProps {
    actions: AishQuickAction[];
    onSelect: (label: string) => void;
    align?: "center" | "start";
    maxWidth?: number | string;
}

export default function QuickActions({ actions, onSelect, align = "start", maxWidth }: QuickActionsProps) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", alignItems: align === "center" ? "center" : "stretch" }}>
            <Typography
                sx={{
                    fontFamily: FONT_LATO,
                    fontSize: "14px",
                    fontWeight: 400,
                    lineHeight: "21px",
                    color: AISH.textLabel,
                    textAlign: align === "center" ? "center" : "left",
                    width: "100%",
                }}
            >
                QUICK ACTIONS
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: { xs: "8px", sm: "16px" },
                    justifyContent: align === "center" ? "center" : "flex-start",
                    width: "100%",
                    maxWidth: maxWidth ?? "none",
                }}
            >
                {actions.map(({ label, icon: Icon }) => (
                    <Box
                        key={label}
                        component="button"
                        type="button"
                        onClick={() => onSelect(label)}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            px: "12px",
                            py: "8px",
                            borderRadius: "8px",
                            border: `1px solid ${AISH.chipBorder}`,
                            bgcolor: AISH.chipBg,
                            backdropFilter: "blur(15px)",
                            color: AISH.textStrong,
                            cursor: "pointer",
                            overflow: "hidden",
                            transition: "background-color 0.18s ease, border-color 0.18s ease",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.1)", borderColor: AISH.white },
                        }}
                    >
                        {Icon && <Icon size={20} strokeWidth={1.5} color={AISH.textStrong} style={{ flexShrink: 0 }} />}
                        <Typography
                            component="span"
                            sx={{
                                fontFamily: FONT_LATO,
                                fontSize: { xs: "14px", sm: "16px" },
                                fontWeight: 500,
                                lineHeight: "24px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                color: "inherit",
                            }}
                        >
                            {label}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
