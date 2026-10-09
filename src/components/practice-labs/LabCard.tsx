"use client";

import React from "react";
import Image from "next/image";
import { Box, Typography } from "@mui/material";
import { Decor, lato } from "@/components/dashboard/home/shared";
import { labAsset, labStatusBadge, type PracticeLab } from "./lab-data";

export const DIFFICULTY_ICON = {
    Easy: "icon-difficulty-easy.svg",
    Intermediate: "icon-difficulty-intermediate.svg",
    Hard: "icon-difficulty-hard.svg",
} as const;

const metaText = { ...lato(12, 18, 500, "#FFFFFF"), whiteSpace: "nowrap" } as const;

function Meta({ icon, size, label }: { icon: string; size: number; label: string }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <Image src={labAsset(icon)} alt="" width={size} height={size} />
            <Typography sx={metaText}>{label}</Typography>
        </Box>
    );
}

const Dot = () => <Image src={labAsset("meta-dot.svg")} alt="" width={4} height={4} style={{ flexShrink: 0 }} />;

export default function LabCard({ lab, onClick }: { lab: PracticeLab; onClick: () => void }) {
    const badge = labStatusBadge(lab);

    return (
        <Box
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onClick();
            }}
            sx={{
                position: "relative",
                height: 284,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                p: "70px 4px 4px",
                borderRadius: "24px",
                overflow: "hidden",
                cursor: "pointer",
                bgcolor: "rgba(38,38,38,0.44)",
                transition: "transform .18s ease, box-shadow .18s ease",
                "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 14px 34px -16px rgba(147,169,226,0.45)",
                },
                "&:focus-visible": { outline: "2px solid #009DFF", outlineOffset: "2px" },
            }}
        >
            <Box sx={{ position: "absolute", left: 4, right: 4, top: 4, height: 162, borderRadius: "20px", overflow: "hidden" }}>
                <Image
                    src={labAsset("cover.png")}
                    alt=""
                    fill
                    sizes="(max-width: 600px) 100vw, 360px"
                    style={{ objectFit: "cover", maxWidth: "none" }}
                />
            </Box>

            <Box sx={{ position: "relative", height: 210, flexShrink: 0 }}>
                {/* SVG backdrop-blur doesn't survive <img>, so the blur is re-applied through the same shape as a mask. */}
                <Box
                    aria-hidden
                    sx={{
                        position: "absolute",
                        inset: 0,
                        backdropFilter: "blur(44px)",
                        WebkitBackdropFilter: "blur(44px)",
                        maskImage: `url(${labAsset("card-body.svg")})`,
                        WebkitMaskImage: `url(${labAsset("card-body.svg")})`,
                        maskSize: "100% 100%",
                        WebkitMaskSize: "100% 100%",
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                    }}
                />
                <Decor src={labAsset("card-body.svg")} sx={{ inset: 0 }} />

                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        p: "16px",
                    }}
                >
                    <Decor src={labAsset("card-glow.svg")} bleed="-100%" sx={{ left: 49, top: 72, width: 120, height: 120 }} />

                    <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
                        <Box
                            component="span"
                            sx={{
                                alignSelf: "flex-start",
                                px: "12px",
                                py: "4px",
                                borderRadius: "50px",
                                bgcolor: badge.bg,
                                ...lato(12, 18, 500, badge.fg),
                                whiteSpace: "nowrap",
                            }}
                        >
                            {badge.label}
                        </Box>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
                            <Typography noWrap sx={lato(18, 27, 600, "#FFFFFF")}>
                                {lab.title}
                            </Typography>
                            <Typography
                                sx={{
                                    ...lato(12, 18, 500, "#BFBFBF"),
                                    height: 36,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                }}
                            >
                                {lab.description}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                        <Meta icon={DIFFICULTY_ICON[lab.difficulty]} size={20} label={lab.difficulty} />
                        <Dot />
                        <Meta icon="icon-zap.svg" size={16} label={`${lab.xp} XP`} />
                        <Dot />
                        <Meta icon="icon-star.svg" size={16} label={lab.access} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
