"use client";

import React from "react";
import Image from "next/image";
import { Box } from "@mui/material";
import { MY_COURSES_ASSETS } from "./my-courses-theme";

const CREST = `${MY_COURSES_ASSETS}/rank/crest`;
const STARS = `${MY_COURSES_ASSETS}/rank/stars`;

/** Crest layers in paint order; offsets are relative to the 165×163 crest box (Figma group 40002331:150693). */
const CREST_LAYERS: { src: string; left: number; top: number; width: number; height: number }[] = [
    { src: "vector-glow", left: 0.91, top: -0.43, width: 127.398, height: 127.398 },
    { src: "vector-gem-glow", left: 45.36, top: 98.39, width: 96.6408, height: 96.6407 },
    { src: "wing-left", left: 0, top: 35.74, width: 52.2817, height: 67.1705 },
    { src: "wing-right", left: 112.72, top: 35.74, width: 52.2821, height: 67.1705 },
    { src: "shield", left: 31.42, top: 35.64, width: 102.153, height: 124.11 },
    { src: "rivet-br", left: 111.43, top: 116.57, width: 17.0435, height: 17.9637 },
    { src: "rivet-bl", left: 36.46, top: 116.57, width: 17.0435, height: 17.9637 },
    { src: "rivet-r", left: 124.18, top: 63.27, width: 19.1446, height: 20.0506 },
    { src: "rivet-l", left: 21.97, top: 63.27, width: 19.1446, height: 19.4579 },
    { src: "star", left: 56.09, top: 65.13, width: 52.8292, height: 50.5538 },
    { src: "bolt-l", left: 40, top: 56.28, width: 6.90693, height: 9.96278 },
    { src: "bolt-r", left: 117.94, top: 56.15, width: 6.90817, height: 9.9431 },
    { src: "bolt-t", left: 78.41, top: 37.63, width: 6.90816, height: 9.95246 },
    { src: "bolt-b", left: 78.09, top: 140.24, width: 7.22673, height: 9.9431 },
    { src: "crown", left: 30.65, top: -27.47, width: 92.0376, height: 92.0376 },
];

/** Rank crest at the top of the My Courses side panel. */
export function RankCrest() {
    return (
        <Box sx={{ position: "relative", width: 165, height: 163, flexShrink: 0 }}>
            {CREST_LAYERS.map((layer) => (
                <Box
                    key={layer.src}
                    sx={{ position: "absolute", left: layer.left, top: layer.top, lineHeight: 0, pointerEvents: "none" }}
                >
                    <Image
                        src={`${CREST}/${layer.src}.svg`}
                        alt=""
                        width={layer.width}
                        height={layer.height}
                        style={{ maxWidth: "none" }}
                    />
                </Box>
            ))}
        </Box>
    );
}

/** Twinkles around the crest; `x` is measured from the panel's horizontal centre. */
const SPARKS: { src: string; x: number; top: number; width: number; height: number }[] = [
    { src: "mini-10", x: 71.1, top: 193.5, width: 7.1, height: 7.3 },
    { src: "mini-165", x: 105.4, top: 191.0, width: 3.6, height: 3.7 },
    { src: "mini-165", x: 80.3, top: 171.3, width: 3.6, height: 3.7 },
    { src: "mini-165", x: -146.6, top: 16.6, width: 3.6, height: 3.7 },
    { src: "mini-165", x: -167.1, top: 164.8, width: 3.6, height: 3.7 },
    { src: "mini-165", x: -127.1, top: 105.5, width: 3.6, height: 3.7 },
    { src: "mini-165", x: -97.7, top: 136.1, width: 3.6, height: 3.7 },
    { src: "mini-165", x: 22.9, top: 63.0, width: 3.6, height: 3.7 },
    { src: "mini-165", x: 48.6, top: 185.4, width: 3.5, height: 3.7 },
    { src: "mini-165", x: -147.9, top: 85.3, width: 3.6, height: 3.7 },
    { src: "mini-165", x: 113.7, top: 164.0, width: 3.6, height: 3.7 },
    { src: "mini-281", x: -38.6, top: 51.3, width: 3.6, height: 3.7 },
    { src: "mini-281", x: -66.0, top: 115.2, width: 3.6, height: 3.7 },
    { src: "animated-1", x: 175.7, top: 159.8, width: 8.6, height: 9.0 },
    { src: "animated-2", x: 44.7, top: 129.7, width: 8.5, height: 8.9 },
    { src: "animated-1", x: -36.6, top: 93.7, width: 8.6, height: 9.0 },
    { src: "animated-2", x: -107.6, top: 159.1, width: 8.6, height: 9.0 },
    { src: "animated-11", x: 121.6, top: 145.8, width: 8.5, height: 9.0 },
    { src: "mini-281", x: -31.0, top: 117.5, width: 3.6, height: 3.7 },
    { src: "shooting-star", x: 159.3, top: 155.1, width: 8.6, height: 9.0 },
];

/** Four-point glares: a vertical and a horizontal streak inside a skewed square. */
const GLARES: { v: string; h: string; x: number; top: number; size: number }[] = [
    { v: "glare-54", h: "glare-55", x: -161.4, top: 31.7, size: 47.6 },
    { v: "glare-56", h: "glare-57", x: -200.2, top: 129.8, size: 105.8 },
    { v: "glare-58", h: "glare-59", x: 126.0, top: 38.7, size: 91.6 },
];

const STREAK = "10.42%";

export function RankStarField() {
    return (
        <Box aria-hidden sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {SPARKS.map((spark, i) => (
                <Box
                    key={`${spark.src}-${i}`}
                    sx={{
                        position: "absolute",
                        left: `calc(50% + ${spark.x}px)`,
                        top: spark.top,
                        width: spark.width,
                        height: spark.height,
                        mixBlendMode: "color-dodge",
                    }}
                >
                    <Image src={`${STARS}/${spark.src}.svg`} alt="" fill sizes="10px" />
                </Box>
            ))}
            {GLARES.map((glare) => (
                <Box
                    key={glare.v}
                    sx={{
                        position: "absolute",
                        left: `calc(50% + ${glare.x}px)`,
                        top: glare.top,
                        width: glare.size,
                        height: glare.size,
                        transform: "rotate(23.82deg) skewX(-42.36deg)",
                        // Figma dodges these against pure black; the app background is lighter, so tone them down to match.
                        opacity: 0.2,
                    }}
                >
                    <Box sx={{ position: "absolute", top: 0, bottom: 0, left: "44.79%", right: "44.79%", mixBlendMode: "color-dodge" }}>
                        <Image src={`${STARS}/${glare.v}.svg`} alt="" fill sizes="24px" />
                    </Box>
                    <Box
                        sx={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            top: "44.79%",
                            bottom: "44.79%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mixBlendMode: "color-dodge",
                        }}
                    >
                        <Box sx={{ position: "relative", flexShrink: 0, width: `${(glare.size * parseFloat(STREAK)) / 100}px`, height: glare.size, transform: "rotate(-90deg)" }}>
                            <Image src={`${STARS}/${glare.h}.svg`} alt="" fill sizes="24px" />
                        </Box>
                    </Box>
                </Box>
            ))}
        </Box>
    );
}
