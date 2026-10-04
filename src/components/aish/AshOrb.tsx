"use client";

import React from "react";
import { Box } from "@mui/material";
import Image from "next/image";

/** Stops of the Figma radial fill, anchored well below the orb so the highlight sits at the top. */
const ORB_STOPS =
    "#FFFFFF 0%, #D3D1F9 5%, #A7A3F2 10%, #7B74EC 15%, #4F46E5 20%, #433BBF 30%, #373198 40%, #2A2672 50%, #1E1B4B 60%, #0F172A 100%";

/** Every offset below is the Figma value divided by the 88px reference container. */
const GLYPH_W = 0.5154;
const GLYPH_H = 0.5794;
const GLOW = 2.5705;

interface AshOrbProps {
    size?: number;
    /** Renders the layered violet halo that sits behind the orb on the empty state. */
    glow?: boolean;
}

export default function AshOrb({ size = 88, glow = false }: AshOrbProps) {
    const ring = size * 0.0157;
    const glowSize = size * GLOW;

    return (
        <Box sx={{ position: "relative", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {glow && (
                <Box
                    aria-hidden
                    sx={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: glowSize,
                        height: glowSize,
                        transform: "translate(-50%, -50%)",
                        lineHeight: 0,
                        pointerEvents: "none",
                    }}
                >
                    <Image
                        src="/aish/ash-orb-glow.svg"
                        alt=""
                        width={226}
                        height={226}
                        style={{ width: glowSize, height: glowSize, maxWidth: "none" }}
                    />
                </Box>
            )}

            <Box
                sx={{
                    position: "relative",
                    width: size,
                    height: size,
                    borderRadius: `${size / 2}px`,
                    border: `${ring}px solid #FFFFFF`,
                    backgroundImage: `radial-gradient(circle ${size * 2.3904}px at ${size * 0.5026}px ${size * 1.8164}px, ${ORB_STOPS})`,
                    boxShadow: `0 ${size * 0.0769}px ${size * 0.2308}px rgba(0,0,0,0.6), 0 0 ${size * 0.3077}px rgba(79,70,229,0.3)`,
                }}
            >
                <Image
                    src="/aish/ash-glyph.svg"
                    alt=""
                    width={45}
                    height={51}
                    style={{
                        position: "absolute",
                        left: size * 0.2438,
                        top: size * 0.2131,
                        width: size * GLYPH_W,
                        height: size * GLYPH_H,
                    }}
                />
                <Box
                    aria-hidden
                    sx={{
                        position: "absolute",
                        inset: `-${ring}px`,
                        borderRadius: "inherit",
                        pointerEvents: "none",
                        boxShadow: `inset -${size * 0.0962}px -${size * 0.0962}px ${size * 0.1538}px rgba(0,0,0,0.5), inset ${size * 0.0385}px ${size * 0.0385}px ${size * 0.0769}px rgba(255,255,255,0.3)`,
                    }}
                />
            </Box>
        </Box>
    );
}
