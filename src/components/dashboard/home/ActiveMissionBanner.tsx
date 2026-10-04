"use client";

import React from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import Image from "next/image";
import { gradientBorder } from "@/components/aish/tokens";
import { asset, Decor, glassFill, lato, poppins, RotatedDecor } from "./shared";
import { ACTIVE_MISSION, type ActiveMission } from "./data";

interface ActiveMissionBannerProps {
    mission?: ActiveMission;
    onResume?: () => void;
}

const BANNER_FILL =
    "radial-gradient(97.3% 97.3% at 50% 50%, #6101CB 0%, #460D98 25%, #2A1865 50%, #20124C 62.5%, #150C33 75%, #0B0619 87.5%, #05030D 93.75%, #000000 100%)";
const RAY_MASK = asset("hero-element-mask.svg");
const RAY_BLUE = "linear-gradient(180deg, #2388FF 0%, rgba(35,136,255,0) 80%)";
const RAY_VIOLET = "linear-gradient(180deg, #8C24FF 0%, rgba(140,36,255,0) 88%)";
const RAY_VIOLET_SOFT = "linear-gradient(180.31deg, #8C24FF 38.81%, rgba(140,36,255,0) 72.523%)";

interface Ray {
    left: number;
    top: number;
    width: number;
    height: number;
    transform: string;
    boxWidth: number;
    boxHeight: number;
    opacity: number;
    lighten?: boolean;
    blur?: number;
    fill?: string;
    img?: string;
    bleed?: string;
    maskPosition?: string;
}

/** Light-ray composition behind the badge (Figma "Group 1"). */
const RAYS: Ray[] = [
    { left: 735.26, top: -241.11, width: 296.281, height: 296.281, transform: "rotate(45deg)", boxWidth: 200.757, boxHeight: 218.248, opacity: 0.88, img: "hero-element-1.svg", bleed: "-20.69% -22.49%", maskPosition: "-308.94px 42.109px" },
    { left: 671.74, top: -106.42, width: 244.809, height: 252.531, transform: "rotate(43.56deg) skewX(-0.22deg)", boxWidth: 43.515, boxHeight: 308.24, opacity: 0.26, lighten: true, blur: 2.608, fill: RAY_BLUE, maskPosition: "-186.463px -92.586px" },
    { left: 695.99, top: -83.5, width: 251.22, height: 246.196, transform: "rotate(45.93deg) skewX(0.14deg)", boxWidth: 43.514, boxHeight: 308.247, opacity: 0.7, lighten: true, blur: 4.606, fill: RAY_VIOLET, maskPosition: "-203.031px -115.508px" },
    { left: 684.43, top: -161.2, width: 296.281, height: 296.281, transform: "rotate(45deg)", boxWidth: 200.757, boxHeight: 218.248, opacity: 0.88, img: "hero-element-1.svg", bleed: "-20.69% -22.49%" },
    { left: 620.91, top: -26.5, width: 244.809, height: 252.531, transform: "rotate(43.56deg) skewX(-0.22deg)", boxWidth: 43.515, boxHeight: 308.24, opacity: 0.26, lighten: true, blur: 2.608, fill: RAY_BLUE },
    { left: 645.15, top: -3.55, width: 251.22, height: 246.196, transform: "rotate(45.93deg) skewX(0.14deg)", boxWidth: 43.514, boxHeight: 308.247, opacity: 0.7, lighten: true, blur: 4.606, fill: RAY_VIOLET },
    { left: 669.16, top: 27.68, width: 146.817, height: 146.817, transform: "rotate(45deg)", boxWidth: 0, boxHeight: 207.63, opacity: 0.88, lighten: true, img: "hero-element-2.svg", bleed: "-2.12% -4.85px" },
    { left: 619.3, top: -7.61, width: 146.817, height: 146.817, transform: "rotate(45deg)", boxWidth: 0, boxHeight: 207.63, opacity: 0.88, lighten: true, img: "hero-element-2.svg", bleed: "-2.12% -4.85px" },
    { left: 616.6, top: 38.25, width: 109.913, height: 109.913, transform: "rotate(45deg)", boxWidth: 0, boxHeight: 155.44, opacity: 0.88, lighten: true, img: "hero-element-3.svg", bleed: "-2.83% -4.51px" },
    { left: 573.66, top: -196, width: 306.94, height: 306.94, transform: "rotate(45deg)", boxWidth: 200.757, boxHeight: 233.321, opacity: 0.26, img: "hero-element-4.svg", bleed: "-19.36% -22.49%" },
    { left: 504.33, top: -54, width: 259.912, height: 267.527, transform: "rotate(43.47deg) skewX(-0.4deg)", boxWidth: 43.517, boxHeight: 329.52, opacity: 0.08, lighten: true, blur: 2.556, fill: RAY_VIOLET },
    { left: 527.58, top: -31.57, width: 266.238, height: 261.283, transform: "rotate(46deg) skewX(0.26deg)", boxWidth: 43.515, boxHeight: 329.533, opacity: 0.21, lighten: true, blur: 4.772, fill: RAY_VIOLET },
    { left: 437.85, top: -190.45, width: 278.188, height: 278.188, transform: "rotate(45deg)", boxWidth: 200.757, boxHeight: 192.66, opacity: 0.26, img: "hero-elements.svg", bleed: "-23.18% -22.24%" },
    { left: 385.95, top: -67.37, width: 219.171, height: 227.073, transform: "rotate(43.73deg) skewX(0.11deg)", boxWidth: 43.512, boxHeight: 272.12, opacity: 0.21, lighten: true, blur: 6.817, fill: RAY_VIOLET_SOFT },
    { left: 410.12, top: -44.35, width: 225.727, height: 220.586, transform: "rotate(45.82deg) skewX(-0.07deg)", boxWidth: 43.513, boxHeight: 272.116, opacity: 0.21, lighten: true, blur: 6.817, fill: RAY_VIOLET_SOFT },
    { left: 478.17, top: -45.84, width: 236.852, height: 236.852, transform: "rotate(45deg)", boxWidth: 30.045, boxHeight: 304.914, opacity: 0.88, lighten: true, img: "hero-ellipse-a.svg", bleed: "-5.59% -56.72%" },
    { left: 595.3, top: -67.09, width: 236.852, height: 236.852, transform: "rotate(45deg)", boxWidth: 30.045, boxHeight: 304.914, opacity: 0.88, lighten: true, img: "hero-ellipse-b.svg", bleed: "-2.57% -26.09%" },
];

function RayLayer({ ray }: { ray: Ray }) {
    return (
        <Box
            aria-hidden
            sx={{
                position: "absolute",
                left: ray.left,
                top: ray.top,
                width: ray.width,
                height: ray.height,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                mixBlendMode: ray.lighten ? "plus-lighter" : undefined,
            }}
        >
            <Box sx={{ flex: "none", transform: ray.transform }}>
                <Box
                    sx={{
                        position: "relative",
                        width: ray.boxWidth,
                        height: ray.boxHeight,
                        opacity: ray.opacity,
                        filter: ray.blur ? `blur(${ray.blur}px)` : undefined,
                        backgroundImage: ray.fill,
                        ...(ray.maskPosition && {
                            maskImage: `url("${RAY_MASK}")`,
                            maskMode: "alpha",
                            maskComposite: "intersect",
                            maskClip: "no-clip",
                            maskRepeat: "no-repeat",
                            maskPosition: ray.maskPosition,
                            maskSize: "571.082px 571.086px",
                        }),
                    }}
                >
                    {ray.img && (
                        <Box sx={{ position: "absolute", inset: ray.bleed }}>
                            <Image src={asset(ray.img)} alt="" fill sizes="300px" style={{ maxWidth: "none" }} />
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

/** Rotated noise-dot texture blended over the banner. */
function NoiseTexture() {
    return (
        <Box
            aria-hidden
            sx={{
                position: "absolute",
                inset: "-653.51% -131.82% -208.61% -112.91%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mixBlendMode: "overlay",
                containerType: "size",
                pointerEvents: "none",
            }}
        >
            <Box
                sx={{
                    flex: "none",
                    width: "hypot(24.9948cqw, 42.436cqh)",
                    height: "hypot(-75.0052cqw, 57.564cqh)",
                    transform: "rotate(63.63deg) skewX(15.98deg)",
                }}
            >
                <Box
                    sx={{
                        width: "100%",
                        height: "100%",
                        opacity: 0.8,
                        backgroundImage: `url("${asset("hero-noise-dots.png")}")`,
                        backgroundSize: "834.0947px 834.0947px",
                        backgroundPosition: "top left",
                        maskImage: `url("${asset("hero-noise-mask.svg")}")`,
                        maskMode: "alpha",
                        maskComposite: "intersect",
                        maskClip: "no-clip",
                        maskRepeat: "no-repeat",
                        maskPosition: "638.489px 946.23px",
                        maskSize: "1064.346px 955.578px",
                    }}
                />
            </Box>
        </Box>
    );
}

export default function ActiveMissionBanner({ mission = ACTIVE_MISSION, onResume }: ActiveMissionBannerProps) {
    const progress = Math.min(Math.max(mission.progress, 0), 100);

    return (
        <Box
            component="section"
            sx={{
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                height: 271,
                pt: "12px",
                px: "8px",
                pb: "8px",
                border: "1px solid #5E03C5",
                borderRadius: "20px",
                backgroundImage: glassFill(170.74),
                backdropFilter: "blur(12px)",
            }}
        >
            {/* Banner artwork */}
            <Box
                sx={{
                    position: "relative",
                    overflow: "hidden",
                    flexShrink: 0,
                    height: 249,
                    borderRadius: "16px",
                    backgroundImage: BANNER_FILL,
                }}
            >
                <NoiseTexture />
                <Box
                    aria-hidden
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 74,
                        right: 0,
                        height: 283,
                        backgroundImage: "linear-gradient(to left, #261653, rgba(38,22,83,0))",
                    }}
                />

                {/* Mission copy */}
                <Box sx={{ position: "relative", p: { xs: "16px", sm: "24px" } }}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            gap: "16px",
                            width: { xs: "100%", sm: 348 },
                            maxWidth: { xs: "100%", sm: "calc(100% - 140px)" },
                        }}
                    >
                        <Box
                            sx={{
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                                px: "12px",
                                py: "4px",
                                borderRadius: "32px",
                                backdropFilter: "blur(4px)",
                                backgroundImage:
                                    "linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(204,204,204,0.08) 50%, rgba(153,153,153,0) 100%)",
                                "&::before": gradientBorder(),
                            }}
                        >
                            <Typography sx={{ ...lato(12, 18, 500, "#FFFFFF"), whiteSpace: "nowrap" }}>
                                Active Mission - {mission.course}
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                            <Typography noWrap sx={lato(14, 21, 500, "#BFBFBF")}>
                                Continue where you left off
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        p: "11px",
                                        flexShrink: 0,
                                        overflow: "hidden",
                                        borderRadius: "8.25px",
                                        border: "1.375px solid #BFBFBF",
                                        bgcolor: "rgba(0,0,0,0.12)",
                                        backdropFilter: "blur(23.571px)",
                                    }}
                                >
                                    <Image src={asset("hero-icon-video.svg")} alt="" width={22} height={22} />
                                </Box>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 }}>
                                    <Typography sx={lato(14, 21, 500, "#D9D9D9")}>LEVEL {mission.level}</Typography>
                                    <Typography
                                        noWrap
                                        component="h2"
                                        sx={{
                                            ...poppins(24, 36),
                                            fontSize: { xs: "18px", sm: "24px" },
                                            lineHeight: { xs: "28px", sm: "36px" },
                                        }}
                                    >
                                        {mission.title}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <RotatedDecor
                    src={asset("hero-glow-vertical.svg")}
                    sx={{ left: -40, top: 3, width: 22, height: 307 }}
                    length={307}
                    thickness={22}
                    rotate={-90}
                    bleed="-290.91% -20.85%"
                />
                <RotatedDecor
                    src={asset("hero-glow-vertical.svg")}
                    sx={{ right: -87, top: 33, width: 22, height: 307 }}
                    length={307}
                    thickness={22}
                    rotate={-90}
                    bleed="-290.91% -20.85%"
                />
                <Decor src={asset("hero-glow-horizontal.svg")} sx={{ left: 0, top: 267, width: 1141, height: 22 }} bleed="-290.91% -5.61%" />

                {RAYS.map((ray, index) => (
                    <RayLayer key={index} ray={ray} />
                ))}
            </Box>

            {/* Progress tray with notched top edge */}
            <Box
                sx={{
                    position: "absolute",
                    left: 8,
                    right: 8,
                    bottom: -1,
                    height: 81,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    px: { xs: "16px", sm: "24px" },
                }}
            >
                <Decor src={asset("hero-bottom-panel.svg")} sx={{ inset: 0 }} bleed="-1.01% -0.17% -1.23% -0.17%" />

                <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "8px", width: 238, minWidth: 0, flexShrink: 1 }}>
                    <Typography noWrap sx={lato(12, 18, 500, "#BFBFBF")}>
                        {progress}% course completed
                    </Typography>
                    <Box
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        sx={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            p: "1px",
                            borderRadius: "32px",
                            overflow: "hidden",
                            bgcolor: "rgba(255,255,255,0.02)",
                            backdropFilter: "blur(4px)",
                            "&::before": gradientBorder(),
                        }}
                    >
                        <Box
                            sx={{
                                height: 8,
                                width: `${progress}%`,
                                minWidth: 9,
                                borderRadius: "16px",
                                backgroundImage: "linear-gradient(90.8deg, #2EC4B6 4.5235%, #1B4C33 104.18%)",
                            }}
                        />
                    </Box>
                </Box>

                <ButtonBase
                    onClick={onResume}
                    sx={{
                        position: "relative",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        height: 40,
                        px: "12px",
                        flexShrink: 0,
                        borderRadius: "10px",
                        bgcolor: "#FFFFFF",
                        boxShadow: "0 0 8px rgba(255,255,255,0.12)",
                        transition: "transform 0.15s ease",
                        "&:hover": { transform: "translateY(-1px)" },
                    }}
                >
                    <Image src={asset("icon-play.svg")} alt="" width={18} height={18} />
                    <Typography
                        sx={{
                            fontFamily: "var(--font-sans)",
                            fontWeight: 500,
                            fontSize: "14px",
                            lineHeight: "21px",
                            color: "#262626",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Resume Level {mission.level}
                    </Typography>
                    <Decor src={asset("hero-btn-glow-top.svg")} sx={{ left: -32, top: 0, width: 286, height: 3 }} bleed="-266.67% -2.8%" />
                    <RotatedDecor
                        src={asset("hero-btn-glow-left.svg")}
                        sx={{ left: -5, top: -55, width: 6, height: 144 }}
                        length={144}
                        thickness={6}
                        rotate={90}
                        bleed="-133.33% -5.56%"
                    />
                    <Decor src={asset("hero-btn-glow-bottom.svg")} sx={{ left: -3, top: 43, width: 231, height: 6 }} bleed="-133.33% -3.46%" />
                </ButtonBase>
            </Box>

            {/* Hexagon badge */}
            <Box
                aria-hidden
                sx={{
                    position: "absolute",
                    top: 4,
                    right: "calc(6.04% - 0.88px)",
                    width: { xs: 90, sm: 125.26 },
                    aspectRatio: "94 / 104",
                    filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.5))",
                    display: { xs: "none", sm: "block" },
                    pointerEvents: "none",
                }}
            >
                <Image src={asset("hero-object.png")} alt="" fill sizes="126px" style={{ objectFit: "cover" }} priority />
            </Box>

            <Box
                aria-hidden
                sx={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "inherit",
                    boxShadow: "inset 0 5px 12px rgba(255,255,255,0.12)",
                    pointerEvents: "none",
                }}
            />
        </Box>
    );
}
