"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { MdShield, MdAutoAwesome } from "react-icons/md";

interface LevelShieldProps {
    level: number;
    title: string;
}

/** The rank crest shown at the top of the course side rails. */
export default function LevelShield({ level, title }: LevelShieldProps) {
    return (
        <Box
            sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: "14px",
                border: "1px solid #1f1f2b",
                background: "linear-gradient(180deg, #14142a 0%, #0a0a14 55%, #07070d 100%)",
                pt: 1.5,
                pb: 1.75,
                px: 1.5,
                textAlign: "center",
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    top: "-45%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "130%",
                    height: "120%",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, #6d28d9 0%, rgba(109,40,217,0) 62%)",
                    opacity: 0.55,
                    filter: "blur(18px)",
                    pointerEvents: "none",
                }}
            />

            <Box sx={{ position: "relative", display: "flex", justifyContent: "center", mb: 1 }}>
                <Box sx={{ position: "relative", width: 92, height: 96 }}>
                    <MdShield
                        size={92}
                        style={{
                            position: "absolute",
                            inset: 0,
                            margin: "auto",
                            color: "#c7d2fe",
                            filter: "drop-shadow(0 0 16px #7c3aed)",
                        }}
                    />
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            pt: 0.5,
                        }}
                    >
                        <Box
                            sx={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "linear-gradient(145deg, #a78bfa 0%, #4c1d95 100%)",
                                border: "1px solid #ddd6fe",
                            }}
                        >
                            <MdAutoAwesome size={17} color="#fff" />
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Typography sx={{ position: "relative", color: "#8a8a9a", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em" }}>
                YOU&apos;RE AT
            </Typography>
            <Typography sx={{ position: "relative", color: "#fff", fontSize: "1.35rem", fontWeight: 800, lineHeight: 1.25 }}>
                Level {level}
            </Typography>
            <Typography sx={{ position: "relative", color: "#c4b5fd", fontSize: "0.75rem", fontWeight: 500 }}>
                {title}
            </Typography>
        </Box>
    );
}
