"use client";

import React from "react";
import Image from "next/image";
import { Box } from "@mui/material";

// Shared dark "glass" sidebar design (Figma LMS) used by StudentLayout and DashboardLayout.

export const SIDEBAR_EXPANDED = 280;
export const SIDEBAR_COLLAPSED = 88;
export const SIDEBAR_COLLAPSED_BLEED = 112;

export const SIDEBAR_BG = { xs: "rgba(9,9,21,0.96)", md: "rgba(9,9,21,0.44)" };
export const COLLAPSE_BUTTON_BG = "linear-gradient(180deg, rgba(187,201,237,0.08) 0%, rgba(106,114,135,0.08) 100%)";
export const NAV_TEXT = "#D9D9D9";
export const NAV_HOVER_BG = "rgba(255,255,255,0.05)";
export const SIDEBAR_TRANSITION =
    "width 0.25s ease, min-width 0.25s ease, padding 0.25s ease, transform 0.28s cubic-bezier(0.4,0,0.2,1)";

/** Figma's three stacked stroke paints: top-left glow, bottom-right glow, flat 10% white. */
export const BORDER_PAINT = [
    "linear-gradient(rgba(255,255,255,0.10), rgba(255,255,255,0.10))",
    "linear-gradient(291deg, rgba(255,255,255,0.24) 3%, rgba(255,255,255,0) 47%)",
    "linear-gradient(105deg, rgba(255,255,255,0.24) 8%, rgba(153,153,153,0) 35%)",
].join(", ");

/** 1px gradient stroke, masked so it follows the rounded corners. Spread into an `sx` object. */
export const GRADIENT_STROKE_SX = {
    "&::before": {
        content: '""',
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        padding: "1px",
        backgroundImage: BORDER_PAINT,
        WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        pointerEvents: "none",
        zIndex: 2,
    },
} as const;

export const ACTIVE_GRADIENT =
    "linear-gradient(-89.946deg, rgba(0,11,53,0.47) 9.562%, rgba(0,20,93,0.94) 22.862%, rgba(0,30,132,0.97) 61.425%, rgb(0,39,172) 99.988%)";

/** Blurred streaks layered behind the active nav item, positioned as in the design. */
const ACTIVE_GLOWS = [
    { src: "/sidebar/glow-line-2.svg", left: -6, top: -23, width: 198, height: 39 },
    { src: "/sidebar/glow-line-3.svg", left: 95, top: -19, width: 198, height: 39 },
    { src: "/sidebar/glow-line-1.svg", left: -43, top: 42, width: 198, height: 37 },
    { src: "/sidebar/glow-line-5.svg", left: 9, top: 44, width: 198, height: 41 },
];

/** Glows for the icon-only active item: box position/size plus the blur overflow of each ellipse. */
const ACTIVE_GLOWS_COLLAPSED = [
    { src: "/sidebar/glow-collapsed-1.svg", left: -31, top: 54, width: 174, height: 13, insetY: "-92.31%" },
    { src: "/sidebar/glow-collapsed-2.svg", left: -31, top: -18, width: 174, height: 22, insetY: "-54.55%" },
    { src: "/sidebar/glow-collapsed-3.svg", left: 6, top: -11, width: 174, height: 15, insetY: "-80%" },
    { src: "/sidebar/glow-collapsed-4.svg", left: 21, top: 56, width: 174, height: 17, insetY: "-70.59%" },
];

/** Ambient background blobs behind the sidebar content. */
export function SidebarAmbientGlow() {
    return (
        <>
            <Box
                aria-hidden
                sx={{ position: "absolute", top: "73.1%", left: "116px", transform: "translate(-50%, -50%)", pointerEvents: "none" }}
            >
                <Image src="/sidebar/glow-blob-a.svg" alt="" width={909} height={909} />
            </Box>
            <Box
                aria-hidden
                sx={{ position: "absolute", top: "55.1%", left: "24px", transform: "translate(-50%, -50%)", pointerEvents: "none" }}
            >
                <Image src="/sidebar/glow-blob-b.svg" alt="" width={723} height={723} />
            </Box>
        </>
    );
}

/** Light streaks drawn inside the active nav item (expanded or icon-only variant). */
export function ActiveNavGlow({ collapsed }: { collapsed: boolean }) {
    if (collapsed) {
        return (
            <>
                {ACTIVE_GLOWS_COLLAPSED.map((glow) => (
                    <Box
                        key={glow.src}
                        aria-hidden
                        sx={{ position: "absolute", left: glow.left, top: glow.top, width: glow.width, height: glow.height, pointerEvents: "none" }}
                    >
                        <Box sx={{ position: "absolute", insetBlock: glow.insetY, insetInline: "-6.9%" }}>
                            <Box component="img" src={glow.src} alt="" sx={{ display: "block", maxWidth: "none", width: "100%", height: "100%" }} />
                        </Box>
                    </Box>
                ))}
            </>
        );
    }
    return (
        <>
            {ACTIVE_GLOWS.map((glow) => (
                <Box key={glow.src} aria-hidden sx={{ position: "absolute", left: glow.left, top: glow.top, pointerEvents: "none" }}>
                    <Image src={glow.src} alt="" width={glow.width} height={glow.height} />
                </Box>
            ))}
            <Box
                aria-hidden
                sx={{ position: "absolute", left: "231px", top: "99px", transform: "translate(-50%, -50%) rotate(90deg)", pointerEvents: "none" }}
            >
                <Image src="/sidebar/glow-line-4.svg" alt="" width={198} height={39} />
            </Box>
        </>
    );
}
