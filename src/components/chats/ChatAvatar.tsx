"use client";

import React from "react";
import { Avatar, Box } from "@mui/material";
import { MdGroups, MdShield } from "react-icons/md";
import { C } from "./theme";
import type { ChatType } from "./types";
import { initials } from "./helpers";

type Props = {
    name: string;
    avatar?: string;
    type?: ChatType;
    size?: number;
    online?: boolean;
    ring?: boolean;
};

export default function ChatAvatar({ name, avatar, type = "personal", size = 38, online, ring }: Props) {
    const isGroupish = type !== "personal" && !avatar;
    const Icon = type === "community" ? MdShield : MdGroups;

    return (
        <Box sx={{ position: "relative", flexShrink: 0, lineHeight: 0 }}>
            {isGroupish ? (
                <Box
                    sx={{
                        width: size,
                        height: size,
                        borderRadius: "50%",
                        background: type === "community" ? C.communityGrad : C.groupGrad,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: ring ? `2px solid ${C.accentSoft}` : "none",
                    }}
                >
                    <Icon size={size * 0.5} color="#ffffff" />
                </Box>
            ) : (
                <Avatar
                    src={avatar}
                    sx={{
                        width: size,
                        height: size,
                        fontSize: size * 0.36,
                        fontWeight: 700,
                        background: C.accentGrad,
                        border: ring ? `2px solid ${C.accentSoft}` : "none",
                    }}
                >
                    {initials(name)}
                </Avatar>
            )}

            {online && (
                <Box
                    sx={{
                        position: "absolute",
                        bottom: size > 56 ? 4 : 0,
                        right: size > 56 ? 4 : 0,
                        width: Math.max(9, size * 0.22),
                        height: Math.max(9, size * 0.22),
                        borderRadius: "50%",
                        background: C.online,
                        border: `2px solid ${C.panelSolid}`,
                    }}
                />
            )}
        </Box>
    );
}
