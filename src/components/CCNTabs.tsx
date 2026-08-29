"use client";
import React from "react";
import { Box, Button } from "@mui/material";

export type CCNTab = {
    label: string;
    value?: string;
    href?: string;
};

type Props = {
    tabs: CCNTab[];
    /** Active tab identifier — matched against `value`, falling back to `href`, then `label`. */
    value?: string;
    onChange?: (tab: CCNTab, index: number) => void;
    className?: string;
};

const tabKey = (tab: CCNTab) => tab.value ?? tab.href ?? tab.label;

export default function CCNTabs({ tabs, value, onChange, className }: Props) {
    const activeKey = value ?? (tabs.length ? tabKey(tabs[0]) : undefined);

    return (
        <Box
            className={className}
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                p: "4px",
                borderRadius: "99px",
                border: "1px solid rgba(191,191,191,0.25)",
                backgroundColor: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(4px)",
                opacity: 0.8,
                maxWidth: "100%",
                overflowX: "auto",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
            }}
        >
            {tabs.map((tab, index) => {
                const active = tabKey(tab) === activeKey;
                return (
                    <Button
                        key={tabKey(tab)}
                        disableRipple
                        onClick={() => onChange?.(tab, index)}
                        sx={{
                            flexShrink: 0,
                            minWidth: 0,
                            height: { xs: 20, sm: 36 },
                            px: active ? { xs: "12px", sm: "16px" } : { xs: "14px", sm: "20px" },
                            py: "8px",
                            borderRadius: "99px",
                            textTransform: "none",
                            whiteSpace: "nowrap",
                            fontFamily: "var(--font-lato), Arial, Helvetica, sans-serif",
                            fontWeight: 500,
                            fontSize: { xs: "0.875rem", sm: "0.8em" },
                            lineHeight: "24px",
                            color: active ? "#ffffff" : "#8c8c8c",
                            // border: active ? "1px solid #e3e9f8" : "1px solid transparent",
                            background: active
                                ? "linear-gradient(180deg, rgba(187,201,237,0.44) 0%, rgba(106,114,135,0.26) 100%)"
                                : "transparent",
                            backdropFilter: active ? "blur(12px)" : "none",
                            transition: "color 0.2s ease, background 0.2s ease",
                            "&:hover": {
                                color: "#ffffff",
                                background: active
                                    ? "linear-gradient(180deg, rgba(187,201,237,0.44) 0%, rgba(106,114,135,0.26) 100%)"
                                    : "rgba(255,255,255,0.06)",
                            },
                        }}
                    >
                        {tab.label}
                    </Button>
                );
            })}
        </Box>
    );
}