"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Box, ButtonBase, Typography } from "@mui/material";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { KIND_META, updateHref, type UpdateEntry } from "./mock-data";
import { TrendingBadge, TypeBadge } from "./UpdateCard";
import { FONT_LATO, FONT_POPPINS, UPD } from "./tokens";

const ROTATE_MS = 7000;

function NavButton({ direction, onClick }: { direction: "prev" | "next"; onClick: () => void }) {
    const Icon = direction === "prev" ? FiChevronLeft : FiChevronRight;
    return (
        <ButtonBase
            aria-label={direction === "prev" ? "Previous featured update" : "Next featured update"}
            onClick={onClick}
            sx={{
                width: 24,
                height: 24,
                borderRadius: "999px",
                border: `1px solid ${UPD.neutral700}`,
                background: UPD.iconButtonBg,
                color: UPD.white,
                transition: "border-color .2s",
                "&:hover": { borderColor: UPD.neutral300 },
            }}
        >
            <Icon size={16} />
        </ButtonBase>
    );
}

export default function FeaturedCarousel({ items }: { items: UpdateEntry[] }) {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const count = items.length;

    useEffect(() => {
        if (count < 2 || paused) return;
        const timer = setInterval(() => setIndex((current) => (current + 1) % count), ROTATE_MS);
        return () => clearInterval(timer);
    }, [count, paused]);

    if (count === 0) return null;

    const active = items[Math.min(index, count - 1)];
    const go = (step: number) => setIndex((current) => (current + step + count) % count);

    return (
        <Box
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            sx={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, minWidth: 0, width: "100%" }}
        >
            {/* Dots + arrows */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {items.map((entry, dot) => {
                        const selected = dot === index;
                        return (
                            <ButtonBase
                                key={entry.id}
                                aria-label={`Show featured update ${dot + 1}`}
                                aria-current={selected}
                                onClick={() => setIndex(dot)}
                                sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: "99px",
                                    border: `1px solid ${selected ? UPD.white : UPD.neutral600}`,
                                    transition: "border-color .2s",
                                }}
                            >
                                {selected ? <Box sx={{ width: 6, height: 6, borderRadius: "99px", bgcolor: UPD.white }} /> : null}
                            </ButtonBase>
                        );
                    })}
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <NavButton direction="prev" onClick={() => go(-1)} />
                    <NavButton direction="next" onClick={() => go(1)} />
                </Box>
            </Box>

            {/* Hero card */}
            <Box
                component={Link}
                href={updateHref(active)}
                sx={{
                    position: "relative",
                    display: "block",
                    height: { xs: 260, sm: 320, lg: 361 },
                    borderRadius: "16px",
                    border: `1px solid ${UPD.neutral600}`,
                    overflow: "hidden",
                    bgcolor: "#e4e4e4",
                    textDecoration: "none",
                    "&:hover .featured-cta": { pl: "16px" },
                    "&:hover .featured-cta-label": { maxWidth: 140, opacity: 1, mr: 0 },
                }}
            >
                {items.map((entry, slide) => (
                    <Box
                        key={entry.id}
                        aria-hidden={slide !== index}
                        sx={{ position: "absolute", inset: 0, opacity: slide === index ? 1 : 0, transition: "opacity .6s ease" }}
                    >
                        {entry.coverImage ? (
                            <Image src={entry.coverImage} alt={entry.title} fill priority={slide === 0} sizes="(max-width: 1200px) 100vw, 600px" style={{ objectFit: "cover" }} />
                        ) : null}
                    </Box>
                ))}

                <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 100%)", pointerEvents: "none" }} />

                <Box sx={{ position: "absolute", left: 17, top: 22, display: "flex", alignItems: "center", gap: "8px" }}>
                    <TypeBadge kind={active.kind} size="lg" />
                    {active.trending ? <TrendingBadge /> : null}
                </Box>

                <Box
                    sx={{
                        position: "absolute",
                        insetInline: 0,
                        bottom: 0,
                        p: { xs: "16px", sm: "24px" },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                    }}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", opacity: 0.8, minWidth: 0, maxWidth: 359 }}>
                        <Typography
                            sx={{
                                fontFamily: FONT_POPPINS,
                                fontWeight: 500,
                                fontSize: { xs: "17px", sm: "20px" },
                                lineHeight: { xs: "26px", sm: "30px" },
                                color: UPD.white,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}
                        >
                            {active.title}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Typography sx={{ fontFamily: FONT_LATO, fontWeight: 500, fontSize: "14px", lineHeight: "21px", color: UPD.neutral200 }}>by</Typography>
                            <Typography noWrap sx={{ fontFamily: FONT_LATO, fontWeight: 500, fontSize: "14px", lineHeight: "21px", color: UPD.neutral200 }}>
                                {active.author.name}
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        className="featured-cta"
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            flexShrink: 0,
                            height: 32,
                            px: "12px",
                            borderRadius: "999px",
                            border: `1px solid ${UPD.neutral300}`,
                            background: UPD.iconButtonBg,
                            color: UPD.white,
                            transition: "padding .25s ease",
                        }}
                    >
                        <Typography
                            className="featured-cta-label"
                            sx={{
                                fontFamily: FONT_LATO,
                                fontWeight: 500,
                                fontSize: "14px",
                                lineHeight: "21px",
                                color: UPD.white,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                maxWidth: 0,
                                opacity: 0,
                                mr: "-8px",
                                transition: "max-width .25s ease, opacity .2s ease, margin .25s ease",
                            }}
                        >
                            {KIND_META[active.kind].readLabel}
                        </Typography>
                        <Box component="span" sx={{ display: "flex", ml: "8px" }}>
                            <FiArrowRight size={20} strokeWidth={1.5} />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
