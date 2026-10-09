"use client";

import React from "react";
import Image from "next/image";
import { Box, SxProps, Theme } from "@mui/material";
import { FONT_INTER, FONT_LATO, FONT_POPPINS } from "@/components/aish/tokens";
import { TEXT } from "@/components/community/community-ui";
import { placementAsset } from "./placement-data";

// ─── Tokens (Figma variables) ──────────────────────────────────────────────
export const PL = {
    white: "#FFFFFF",
    n75: "#F2F2F2",
    n100: "#D9D9D9",
    n200: "#BFBFBF",
    n300: "#A6A6A6",
    n400: "#8C8C8C",
    n500: "#737373",
    n600: "#5A5A5A",

    panelBg: "rgba(9,9,21,0.44)",
    whyCardBg: "linear-gradient(180deg, rgba(140,36,255,0.12) 0%, rgba(84,22,153,0.03) 100%)",
    whyCardBorder: "rgba(255,255,255,0.24)",
    divider: "linear-gradient(90deg, rgba(115,115,115,0.32) 0%, rgba(115,115,115,0) 100%)",
    cardBg:
        "linear-gradient(176.96deg, rgba(0,0,0,0.387) 1.34%, rgba(10,9,9,0.282) 48.72%, rgba(102,102,102,0.009) 96.09%)",
    cardInnerGlow: "inset 0 3px 6px 0 rgba(255,255,255,0.16)",
    /** "Gradients 4" — orange text gradient for remaining-steps hint. */
    warmText: "linear-gradient(90deg, #F1C40E 0%, #FF6000 100%)",
    /** "Gradients 6" — teal fee progress fill. */
    feeFill: "linear-gradient(118.19deg, rgb(46,196,182) 4.52%, rgb(27,76,51) 104.18%)",
    tabBg:
        "radial-gradient(117.69px 35.99px at 60.58px 18.6px, rgb(97,1,203) 0%, rgb(70,13,152) 25%, rgb(42,24,101) 50%, rgb(32,18,76) 62.5%, rgb(21,12,51) 75%, rgb(11,6,25) 87.5%, rgb(5,3,13) 93.75%, rgb(0,0,0) 100%)",

    modalBorder: "#508AF2",
    modalBackdrop: "rgba(64,64,64,0.24)",
    nextStepBg: "rgba(47,83,173,0.08)",
    nextStepBorder: "#2F53AD",
} as const;

export const PTEXT = {
    ...TEXT,
    medItalic12: { fontFamily: FONT_LATO, fontWeight: 500, fontStyle: "italic", fontSize: "12px", lineHeight: "18px" },
    interReg16: { fontFamily: FONT_INTER, fontWeight: 400, fontSize: "16px", lineHeight: "24px" },
    poppinsBold28: { fontFamily: FONT_POPPINS, fontWeight: 700, fontSize: "28px", lineHeight: "42px" },
} as const;

// ─── Primitives ────────────────────────────────────────────────────────────
/** Renders a design SVG/PNG from /public/placement at its native size. */
export function Asset({
    name,
    width,
    height,
    sx,
    priority,
}: {
    name: string;
    width: number;
    height: number;
    sx?: SxProps<Theme>;
    priority?: boolean;
}) {
    return (
        <Box aria-hidden sx={[{ lineHeight: 0, flexShrink: 0, pointerEvents: "none" }, ...(Array.isArray(sx) ? sx : [sx])]}>
            <Image
                src={placementAsset(name)}
                alt=""
                width={width}
                height={height}
                priority={priority}
                style={{ display: "block", width, height, maxWidth: "none" }}
            />
        </Box>
    );
}

/** Horizontal rule that fades out to the right (Figma "Line 247"). */
export function FadeDivider() {
    return <Box aria-hidden sx={{ width: "100%", height: "1px", flexShrink: 0, backgroundImage: PL.divider }} />;
}
