"use client";

import React, { useRef } from "react";
import { Box, InputBase } from "@mui/material";
import { Mic, Plus, Send } from "lucide-react";
import { AISH, FONT_INTER, gradientBorder } from "./tokens";

interface AishComposerProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    /** `hero` is the tall empty-state box; `inline` is the single-row bar under a conversation. */
    variant?: "hero" | "inline";
    placeholder?: string;
}

function SendButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
    return (
        <Box
            component="button"
            type="button"
            aria-label="Send message"
            onClick={onClick}
            disabled={disabled}
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                width: 40,
                height: 40,
                border: "none",
                borderRadius: "99px",
                backgroundImage: AISH.sendBg,
                filter: "drop-shadow(0 0 4px rgba(255,255,255,0.12))",
                cursor: disabled ? "default" : "pointer",
                opacity: disabled ? 0.45 : 1,
                transition: "opacity 0.18s ease, transform 0.18s ease",
                "&:hover": { transform: disabled ? "none" : "scale(1.05)" },
            }}
        >
            <Box sx={{ display: "flex", transform: "rotate(43.81deg)" }}>
                <Send size={16} strokeWidth={1.5} color={AISH.white} />
            </Box>
        </Box>
    );
}

export default function AishComposer({
    value,
    onChange,
    onSubmit,
    variant = "inline",
    placeholder = "Start typing....",
}: AishComposerProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const isHero = variant === "hero";

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSubmit();
        }
    };

    const inputSx = {
        flex: 1,
        minWidth: 0,
        fontFamily: FONT_INTER,
        fontSize: "16px",
        lineHeight: "24px",
        color: AISH.white,
        "& .MuiInputBase-input::placeholder": { color: AISH.textPlaceholder, opacity: 1 },
    };

    return (
        <Box
            onClick={() => inputRef.current?.focus()}
            sx={{
                position: "relative",
                display: "flex",
                flexDirection: isHero ? "column" : "row",
                alignItems: isHero ? "flex-start" : "center",
                gap: isHero ? { xs: "20px", sm: "32px" } : "12px",
                width: "100%",
                p: { xs: "16px", sm: "24px" },
                borderRadius: "24px",
                bgcolor: AISH.composerBg,
                backdropFilter: "blur(4px)",
                cursor: "text",
                "&::before": gradientBorder(),
            }}
        >
            {!isHero && <Plus size={24} strokeWidth={1.5} color={AISH.textStrong} style={{ flexShrink: 0 }} />}

            <InputBase
                inputRef={inputRef}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                multiline={isHero}
                maxRows={isHero ? 5 : 1}
                sx={isHero ? { ...inputSx, width: "100%" } : inputSx}
            />

            {isHero ? (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <Plus size={24} strokeWidth={1.5} color={AISH.textStrong} />
                    <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Mic size={24} strokeWidth={1.5} color={AISH.textStrong} />
                        {value.trim() !== "" && <SendButton onClick={onSubmit} disabled={false} />}
                    </Box>
                </Box>
            ) : (
                <>
                    <Mic size={24} strokeWidth={1.5} color={AISH.textStrong} style={{ flexShrink: 0 }} />
                    <SendButton onClick={onSubmit} disabled={value.trim() === ""} />
                </>
            )}
        </Box>
    );
}
