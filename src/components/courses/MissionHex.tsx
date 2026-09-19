"use client";

import React from "react";
import { Box } from "@mui/material";
import { MdLock } from "react-icons/md";

const HEX = "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";

interface MissionHexProps {
    accent: string;
    accentDark: string;
    size?: number;
    locked?: boolean;
    icon?: React.ReactNode;
}

/** Hexagonal mission key-art badge — outer ring, glowing core and a centred glyph. */
export default function MissionHex({ accent, accentDark, size = 108, locked = true, icon }: MissionHexProps) {
    const inner = size * 0.82;
    const core = size * 0.56;

    return (
        <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    clipPath: HEX,
                    background: `linear-gradient(150deg, ${accent} 0%, ${accentDark} 55%, #05060d 100%)`,
                    boxShadow: `0 0 26px -6px ${accent}`,
                }}
            />
            <Box
                sx={{
                    position: "absolute",
                    top: (size - inner) / 2,
                    left: (size - inner) / 2,
                    width: inner,
                    height: inner,
                    clipPath: HEX,
                    background: "linear-gradient(160deg, #0b0b16 0%, #05060d 100%)",
                }}
            />
            <Box
                sx={{
                    position: "absolute",
                    top: (size - core) / 2,
                    left: (size - core) / 2,
                    width: core,
                    height: core,
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 35% 30%, ${accent} 0%, ${accentDark} 45%, rgba(5,6,13,0) 72%)`,
                    filter: "blur(2px)",
                }}
            />
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                }}
            >
                {icon ?? (locked ? <MdLock size={size * 0.22} /> : null)}
            </Box>
        </Box>
    );
}
