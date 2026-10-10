"use client";

import React from "react";
import { Box } from "@mui/material";
import { C, FONT_LATO } from "./theme";
import type { ChatType } from "./types";
import { initials } from "./helpers";

type Props = {
    name: string;
    avatar?: string;
    type?: ChatType;
    size?: number;
    /** Green presence dot (used in pickers and call screens, not in the chat list) */
    online?: boolean;
    /** Accent ring around large avatars */
    ring?: boolean;
};

function PresenceDot({ size }: { size: number }) {
    const dot = Math.max(9, size * 0.22);
    return (
        <Box
            sx={{
                position: "absolute", bottom: 0, right: 0, width: dot, height: dot, borderRadius: "50%",
                bgcolor: C.online, border: `2px solid ${C.panelSolid}`,
            }}
        />
    );
}

/** Round avatar: photo on the #93A9E2 plate for people, white CCN-logo plate for groups and communities. */
export default function ChatAvatar({ name, avatar, type = "personal", size = 44, online, ring }: Props) {
    const border = Math.max(0.88, size * 0.02);
    const ringSx = ring ? { boxShadow: `0 0 0 2px ${C.accentSoft}` } : {};
    const groupish = type !== "personal" && !avatar;

    return (
        <Box sx={{ position: "relative", flexShrink: 0, lineHeight: 0 }}>
            {groupish ? (
                <Box
                    sx={{
                        position: "relative",
                        width: size,
                        height: size,
                        borderRadius: "99px",
                        bgcolor: "#fff",
                        border: `1px solid ${C.textPlaceholder}`,
                        overflow: "hidden",
                        ...ringSx,
                    }}
                >
                    <Box
                        component="img"
                        src="/chats/ccn-community.svg"
                        alt=""
                        sx={{ position: "absolute", left: "25%", top: "23.86%", width: "50.4%", height: "56.6%", display: "block" }}
                    />
                </Box>
            ) : (
                <Box
                    sx={{
                        position: "relative",
                        width: size,
                        height: size,
                        borderRadius: "99px",
                        bgcolor: C.avatarBg,
                        border: `${border}px solid ${C.avatarBorder}`,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        ...ringSx,
                    }}
                >
                    {avatar ? (
                        <Box
                            component="img"
                            src={avatar}
                            alt={name}
                            sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                    ) : (
                        <Box component="span" sx={{ fontFamily: FONT_LATO, fontWeight: 700, fontSize: size * 0.36, color: "#0E1934" }}>
                            {initials(name)}
                        </Box>
                    )}
                </Box>
            )}
            {online && <PresenceDot size={size} />}
        </Box>
    );
}
