"use client";

import React from "react";
import Image from "next/image";
import { Box, Typography } from "@mui/material";
import { COLORS, GOLD_GRADIENT, TYPE, gradientText } from "../my-courses-theme";
import { AVATAR_PLACEHOLDER, displayName, type LeaderboardEntry } from "./leaderboard-data";

const ASSETS = "/my-courses/leaderboard";

export const PODIUM_STAGE = { width: 728, height: 458 };

interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

interface SlotLayout {
    size: "lg" | "sm";
    /** Hexagonal photo window; the photo is wider than the window and top-aligned (Figma "image 30"). */
    hex: Rect & { mask: string };
    frameBack: Rect & { src: string };
    frameFront: Rect & { src: string };
    label: { cx: number; top: number };
    podium: { x: number; y: number; src: string; h: number; shadow: string; shadowTop: number; shadowH: number };
    number: { cx: number; top: number };
}

/** Stage coordinates (px) measured from Figma frames 40002331:141573 / 141110, origin at the top of the #1 photo. */
const SLOTS: Record<1 | 2 | 3, SlotLayout> = {
    1: {
        size: "lg",
        hex: { x: 303.91, y: 0, w: 115.181, h: 133, mask: "mask-lg" },
        frameBack: { src: "frame-lg-back", x: 307.55, y: 30.01, w: 109.001, h: 138.006 },
        frameFront: { src: "frame-lg-front", x: 302.94, y: 101.5, w: 117.55, h: 51.292 },
        label: { cx: 361.5, top: 177 },
        podium: { x: 217, y: 273.4, src: "podium-1", h: 172.456, shadow: "podium-shadow-lg", shadowTop: 134.18, shadowH: 50.4197 },
        number: { cx: 363.85, top: 305 },
    },
    2: {
        size: "sm",
        hex: { x: 104.5, y: 100, w: 84.0045, h: 97, mask: "mask-sm" },
        frameBack: { src: "frame-sm-back-l", x: 107.25, y: 119.97, w: 79.7439, h: 100.964 },
        frameFront: { src: "frame-sm-front-l", x: 103.94, y: 172.35, w: 86, h: 37.5281 },
        label: { cx: 146.5, top: 229 },
        podium: { x: 0, y: 323.4, src: "podium-2", h: 125.745, shadow: "podium-shadow-sm", shadowTop: 97.84, shadowH: 36.7632 },
        number: { cx: 146.85, top: 350 },
    },
    3: {
        size: "sm",
        hex: { x: 538.5, y: 98, w: 84.0045, h: 97, mask: "mask-sm" },
        frameBack: { src: "frame-sm-back-r", x: 541.26, y: 119.97, w: 78.8182, h: 99.7917 },
        frameFront: { src: "frame-sm-front-r", x: 537.95, y: 171.7, w: 85, h: 37.0879 },
        label: { cx: 580.5, top: 229 },
        podium: { x: 434, y: 323.4, src: "podium-3", h: 125.842, shadow: "podium-shadow-sm", shadowTop: 97.84, shadowH: 36.7632 },
        number: { cx: 580.85, top: 352 },
    },
};

const PODIUM_W = 185.706;
const SHADOW_W = 294;
const PODIUM_OFFSET = 54;
/** The portrait is 1.8706× the hex width and shifted left by 0.4931× so the face sits in the window. */
const PHOTO_SCALE = 157.14 / 84.0045;
const PHOTO_SHIFT = 41.42 / 84.0045;

/**
 * Figma lays a #04020F → transparent gradient (stage y 279–451) over the pedestals. Masking the pedestals with the
 * same stops fades them into whatever background sits behind, so no rectangle edge shows when the art is scaled.
 */
const PEDESTAL_FADE = "linear-gradient(180deg, #000 279px, rgba(0,0,0,0.5) 380px, transparent 438.8px)";

function Layer({ src, x, y, w, h, sx }: { src: string; x: number; y: number; w: number; h: number; sx?: object }) {
    return (
        <Box sx={{ position: "absolute", left: x, top: y, width: w, height: h, lineHeight: 0, pointerEvents: "none", ...sx }}>
            <Image src={`${ASSETS}/${src}.svg`} alt="" width={w} height={h} style={{ maxWidth: "none", width: w, height: h }} />
        </Box>
    );
}

function Frames({ slot }: { slot: SlotLayout }) {
    const { frameBack: b, frameFront: f } = slot;
    return (
        <>
            <Layer src={b.src} x={b.x} y={b.y} w={b.w} h={b.h} />
            <Layer src={f.src} x={f.x} y={f.y} w={f.w} h={f.h} />
        </>
    );
}

function Photo({ slot, entry }: { slot: SlotLayout; entry: LeaderboardEntry }) {
    const { hex } = slot;
    const size = hex.w * PHOTO_SCALE;
    const mask = `url(${ASSETS}/${hex.mask}.svg) center / 100% 100% no-repeat`;
    return (
        <Box
            sx={{
                position: "absolute",
                left: hex.x,
                top: hex.y,
                width: hex.w,
                height: hex.h,
                overflow: "hidden",
                mask,
                WebkitMask: mask,
                pointerEvents: "none",
            }}
        >
            <Box
                component="img"
                src={entry.avatar ?? AVATAR_PLACEHOLDER}
                alt={entry.name}
                sx={{
                    position: "absolute",
                    left: -hex.w * PHOTO_SHIFT,
                    top: 0,
                    width: size,
                    height: size,
                    maxWidth: "none",
                    objectFit: "cover",
                }}
            />
        </Box>
    );
}

function Label({ slot, entry, currentLearnerId }: { slot: SlotLayout; entry: LeaderboardEntry; currentLearnerId: string }) {
    const lg = slot.size === "lg";
    return (
        <Box
            sx={{
                position: "absolute",
                left: slot.label.cx,
                top: slot.label.top,
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                whiteSpace: "nowrap",
            }}
        >
            <Typography sx={{ ...(lg ? TYPE.smallMed14 : TYPE.xsMed12), color: COLORS.neutral300 }}>LEVEL {entry.level}</Typography>
            <Typography sx={{ ...(lg ? TYPE.largeSemibold18 : TYPE.mediumSemibold16), color: COLORS.white }}>
                {displayName(entry, currentLearnerId)}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Image src={`${ASSETS}/icon-zap.svg`} alt="" width={16} height={16} />
                <Typography sx={{ ...TYPE.smallMed14, ...gradientText(GOLD_GRADIENT) }}>
                    {entry.xp} XP
                </Typography>
            </Box>
        </Box>
    );
}

function PedestalShadow({ slot }: { slot: SlotLayout }) {
    const { podium: p } = slot;
    return <Layer src={p.shadow} x={p.x} y={p.y + p.shadowTop} w={SHADOW_W} h={p.shadowH} sx={{ mixBlendMode: "color-burn" }} />;
}

function Pedestal({ slot }: { slot: SlotLayout }) {
    const { podium: p } = slot;
    return <Layer src={p.src} x={p.x + PODIUM_OFFSET} y={p.y} w={PODIUM_W} h={p.h} />;
}

function RankNumber({ rank, slot }: { rank: number; slot: SlotLayout }) {
    return (
        <Typography
            aria-hidden
            sx={{
                ...(slot.size === "lg" ? TYPE.displayBold52 : TYPE.displayBold44),
                position: "absolute",
                left: slot.number.cx,
                top: slot.number.top,
                transform: "translateX(-50%)",
                color: COLORS.white,
                pointerEvents: "none",
            }}
        >
            {rank}
        </Typography>
    );
}

/** Top-three podium. Paint order mirrors Figma: side frames → podiums (faded) → labels → numbers → #1 crest. */
export default function LeaderboardPodium({ podium, currentLearnerId }: { podium: LeaderboardEntry[]; currentLearnerId: string }) {
    const [first, second, third] = podium;
    const places: { place: 1 | 2 | 3; entry?: LeaderboardEntry }[] = [
        { place: 2, entry: second },
        { place: 1, entry: first },
        { place: 3, entry: third },
    ];

    return (
        <Box
            component="section"
            aria-label="Top three learners"
            sx={{ position: "relative", width: PODIUM_STAGE.width, height: PODIUM_STAGE.height, flexShrink: 0 }}
        >
            <Frames slot={SLOTS[2]} />
            <Frames slot={SLOTS[3]} />
            {second && <Photo slot={SLOTS[2]} entry={second} />}

            {places.map(({ place }) => (
                <PedestalShadow key={place} slot={SLOTS[place]} />
            ))}
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    maskImage: PEDESTAL_FADE,
                    WebkitMaskImage: PEDESTAL_FADE,
                }}
            >
                {places.map(({ place }) => (
                    <Pedestal key={place} slot={SLOTS[place]} />
                ))}
            </Box>
            {places.map(({ place, entry }) =>
                entry ? <Label key={place} slot={SLOTS[place]} entry={entry} currentLearnerId={currentLearnerId} /> : null,
            )}

            {places.map(({ place }) => (
                <RankNumber key={place} rank={place} slot={SLOTS[place]} />
            ))}

            {third && <Photo slot={SLOTS[3]} entry={third} />}
            <Frames slot={SLOTS[1]} />
            {first && <Photo slot={SLOTS[1]} entry={first} />}
        </Box>
    );
}
