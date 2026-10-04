"use client";

import React from "react";
import { Box, ButtonBase, Typography, type SxProps, type Theme } from "@mui/material";
import Image from "next/image";
import { gradientBorder, FONT_LATO, FONT_POPPINS } from "@/components/aish/tokens";

// Not under /dashboard: that prefix is claimed by the app router and the auth proxy.
export const asset = (name: string) => `/home-dashboard/${name}`;

// ─── Typography ────────────────────────────────────────────────────────────
export const lato = (size: number, lineHeight: number, weight: number, color: string) => ({
    fontFamily: FONT_LATO,
    fontSize: `${size}px`,
    lineHeight: `${lineHeight}px`,
    fontWeight: weight,
    color,
});

export const poppins = (size: number, lineHeight: number) => ({
    fontFamily: FONT_POPPINS,
    fontSize: `${size}px`,
    lineHeight: `${lineHeight}px`,
    fontWeight: 600,
    color: "#FFFFFF",
});

export const glassFill = (angle: number) =>
    `linear-gradient(${angle}deg, rgba(0,0,0,0.387) 1.3382%, rgba(10,9,9,0.282) 48.715%, rgba(102,102,102,0.009) 96.091%)`;

const toArray = (sx?: SxProps<Theme>) => (sx === undefined ? [] : Array.isArray(sx) ? sx : [sx]);

// ─── Decorative layers ─────────────────────────────────────────────────────
interface DecorProps {
    src: string;
    sx?: SxProps<Theme>;
    /** Figma exports blurred SVGs larger than their layer box; this is that overflow. */
    bleed?: string;
    cover?: boolean;
}

/** Absolutely-positioned, non-interactive image layer. */
export function Decor({ src, sx, bleed = "0", cover }: DecorProps) {
    return (
        <Box aria-hidden sx={[{ position: "absolute", pointerEvents: "none" }, ...toArray(sx)]}>
            <Box sx={{ position: "absolute", inset: bleed }}>
                <Image src={src} alt="" fill sizes="600px" style={{ objectFit: cover ? "cover" : "fill", maxWidth: "none" }} />
            </Box>
        </Box>
    );
}

/** A horizontal glow strip rotated in place (Figma "rotate-90" wrappers). */
export function RotatedDecor({
    src,
    sx,
    length,
    thickness,
    rotate,
    bleed,
}: DecorProps & { length: number; thickness: number; rotate: number }) {
    return (
        <Box
            aria-hidden
            sx={[
                { position: "absolute", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" },
                ...toArray(sx),
            ]}
        >
            <Box sx={{ flex: "none", position: "relative", width: length, height: thickness, transform: `rotate(${rotate}deg)` }}>
                <Box sx={{ position: "absolute", inset: bleed ?? "0" }}>
                    <Image src={src} alt="" fill sizes="400px" style={{ maxWidth: "none" }} />
                </Box>
            </Box>
        </Box>
    );
}

/** Thin divider drawn from a Figma line asset (dashed or fading). */
export function Line({ src }: { src: string }) {
    return (
        <Box aria-hidden sx={{ position: "relative", width: "100%", height: 0, flexShrink: 0 }}>
            <Box sx={{ position: "absolute", inset: "-1px 0 0 0" }}>
                <Image src={src} alt="" fill sizes="600px" style={{ maxWidth: "none" }} />
            </Box>
        </Box>
    );
}

/** Soft blurred light leaks along the top and bottom edges of a card. */
export function EdgeGlows({
    top = asset("card-glow.png"),
    bottom = asset("card-glow.png"),
    topWidth = 353,
    bottomWidth = 353,
}: {
    top?: string;
    bottom?: string;
    topWidth?: number;
    bottomWidth?: number;
}) {
    return (
        <>
            <Decor src={top} cover sx={{ left: 4, top: -7, width: topWidth, height: 15, filter: "blur(50px)" }} />
            <Decor
                src={bottom}
                cover
                sx={{ left: 4, bottom: -16, width: bottomWidth, height: 15, filter: "blur(50px)", transform: "scaleY(-1)" }}
            />
        </>
    );
}

/** Glow pair used on list rows (sessions, updates). */
export function RowGlows({ bottomOffset = -1.5 }: { bottomOffset?: number }) {
    return (
        <>
            <Decor
                src={asset("row-glow-bottom.png")}
                cover
                sx={{ left: -1, bottom: bottomOffset, width: 452, height: 13, filter: "blur(50px)", transform: "scaleY(-1)" }}
            />
            <Decor src={asset("row-glow-top.png")} cover sx={{ left: 4, top: -1, width: 447, height: 15, filter: "blur(50px)" }} />
        </>
    );
}

// ─── Surfaces ──────────────────────────────────────────────────────────────
/** Dark glass card: gradient fill, 12px backdrop blur, gradient stroke, inner top highlight. */
export function GlassCard({
    children,
    angle = 168,
    sx,
    glows,
}: {
    children: React.ReactNode;
    angle?: number;
    sx?: SxProps<Theme>;
    glows?: React.ReactNode;
}) {
    return (
        <Box
            sx={[
                {
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    gap: { xs: "24px", sm: "32px" },
                    p: { xs: "20px", sm: "32px" },
                    borderRadius: "24px",
                    backgroundImage: glassFill(angle),
                    backdropFilter: "blur(12px)",
                    boxShadow: "inset 0 3px 6px rgba(255,255,255,0.16)",
                    "&::before": gradientBorder(),
                },
                ...toArray(sx),
            ]}
        >
            {children}
            {glows ?? <EdgeGlows />}
        </Box>
    );
}

/** Bordered list row with the gradient stroke used by sessions/updates. */
export const rowSurface = {
    position: "relative" as const,
    overflow: "hidden",
    "&::before": gradientBorder(),
};

// ─── Section header ────────────────────────────────────────────────────────
export function SeeAllButton({ onClick }: { onClick?: () => void }) {
    return (
        <ButtonBase
            onClick={onClick}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                py: "4px",
                borderRadius: "12px",
                flexShrink: 0,
                "&:hover .see-all-label": { color: "#FFFFFF" },
            }}
        >
            <Typography className="see-all-label" sx={{ ...lato(16, 24, 500, "#93A9E2"), transition: "color 0.15s" }}>
                See All
            </Typography>
            <Image src={asset("icon-see-all-arrow.svg")} alt="" width={20} height={20} style={{ transform: "scaleX(-1)" }} />
        </ButtonBase>
    );
}

export function SectionHeader({ title, children }: { title: string; children?: React.ReactNode }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", width: "100%" }}>
            <Typography component="h2" sx={{ ...poppins(20, 30), whiteSpace: "nowrap" }}>
                {title}
            </Typography>
            {children}
        </Box>
    );
}
