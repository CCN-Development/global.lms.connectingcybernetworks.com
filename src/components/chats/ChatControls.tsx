"use client";

import React from "react";
import { Box } from "@mui/material";
import { C } from "./theme";
import ChatIcon from "./ChatIcon";

export const TOGGLE_ON_GRADIENT = "linear-gradient(91.43deg, rgb(46, 196, 182) 4.52%, rgb(27, 76, 51) 104.18%)";

/** Figma "Toogle Switch": 41x20.5 pill, white thumb, teal gradient when on. */
export function ToggleSwitch({
    checked, onChange, label,
}: { checked: boolean; onChange: (next: boolean) => void; label: string }) {
    return (
        <Box
            component="button"
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            sx={{ display: "block", position: "relative", width: 41, height: 20.5, p: 0, border: "none", background: "transparent", cursor: "pointer", flexShrink: 0 }}
        >
            <Box
                sx={{
                    position: "absolute", inset: 0, borderRadius: "99px", border: "1px solid #737373",
                    backgroundImage: checked ? TOGGLE_ON_GRADIENT : "none", transition: "background 0.18s ease",
                }}
            />
            <Box
                sx={{
                    position: "absolute", top: "12.5%", bottom: "12.5%", width: 15.375, borderRadius: "128px", bgcolor: "#fff",
                    left: checked ? "calc(100% - 15.375px - 2.63px)" : "6.25%", transition: "left 0.18s ease",
                }}
            />
        </Box>
    );
}

/** Figma "Radio": teal disc with white dot when selected, grey ring otherwise. */
export function RadioDot({ selected }: { selected: boolean }) {
    return (
        <Box
            aria-hidden
            sx={{
                width: 16, height: 16, flexShrink: 0, borderRadius: "50%", boxSizing: "border-box",
                ...(selected
                    ? { background: "linear-gradient(90deg, #2EC4B6 0%, #1B4C33 100%)", display: "flex", alignItems: "center", justifyContent: "center" }
                    : { border: "1px solid #737373" }),
            }}
        >
            {selected && <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#fff" }} />}
        </Box>
    );
}

/** Figma "Checkbox": 16px rounded square, #BFBFBF outline, check mark when selected. */
export function CheckBox({ checked, onChange, label }: { checked: boolean; onChange: (next: boolean) => void; label: string }) {
    return (
        <Box
            component="button"
            type="button"
            role="checkbox"
            aria-checked={checked}
            aria-label={label}
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onChange(!checked); }}
            sx={{
                position: "relative", width: 16, height: 16, p: 0, flexShrink: 0, cursor: "pointer", borderRadius: "4px",
                border: `1px solid ${checked ? C.accent : C.textSoft}`, bgcolor: checked ? C.accent : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
            }}
        >
            {checked && <ChatIcon name="check" size={10} color="#fff" />}
        </Box>
    );
}
