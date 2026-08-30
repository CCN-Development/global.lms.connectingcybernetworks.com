"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, IconButton, Skeleton, Typography } from "@mui/material";
import { MdArrowForward, MdChevronLeft, MdChevronRight, MdTrendingUp } from "react-icons/md";
import type { UpdateItem } from "@/contexts/UpdatesContext";
import { BORDER, BORDER_HOVER, TYPE_STYLE, updateHref } from "./UpdateCard";

const ROTATE_MS = 7000;

export default function FeaturedCarousel({ items, loading }: { items: UpdateItem[]; loading: boolean }) {
    const router = useRouter();
    const [index, setIndex] = useState(0);

    useEffect(() => { setIndex(0); }, [items.length]);

    useEffect(() => {
        if (items.length < 2) return;
        const timer = setInterval(() => setIndex((current) => (current + 1) % items.length), ROTATE_MS);
        return () => clearInterval(timer);
    }, [items.length]);

    if (loading) {
        return <Skeleton variant="rectangular" height={250} sx={{ borderRadius: "16px", bgcolor: "#12141C" }} />;
    }

    if (items.length === 0) return null;

    const item = items[Math.min(index, items.length - 1)];
    const style = TYPE_STYLE[item.updateType];
    const Icon = style.icon;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {/* Dots + arrows */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 0.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    {items.map((entry, dot) => (
                        <Box
                            key={entry.updateId}
                            onClick={() => setIndex(dot)}
                            sx={{
                                width: dot === index ? 10 : 8,
                                height: dot === index ? 10 : 8,
                                borderRadius: "50%",
                                cursor: "pointer",
                                bgcolor: dot === index ? "#FFFFFF" : "transparent",
                                border: `1px solid ${dot === index ? "#FFFFFF" : "#5B6178"}`,
                                transition: "all .2s",
                            }}
                        />
                    ))}
                </Box>

                <Box sx={{ display: "flex", gap: 0.75 }}>
                    <IconButton
                        size="small"
                        onClick={() => setIndex((current) => (current - 1 + items.length) % items.length)}
                        sx={{ width: 26, height: 26, color: "#C7CBD9", border: `1px solid ${BORDER_HOVER}` }}
                    >
                        <MdChevronLeft size={16} />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => setIndex((current) => (current + 1) % items.length)}
                        sx={{ width: 26, height: 26, color: "#C7CBD9", border: `1px solid ${BORDER_HOVER}` }}
                    >
                        <MdChevronRight size={16} />
                    </IconButton>
                </Box>
            </Box>

            {/* Hero card */}
            <Box
                onClick={() => router.push(updateHref(item))}
                sx={{
                    position: "relative",
                    height: { xs: 200, md: 250 },
                    borderRadius: "16px",
                    overflow: "hidden",
                    cursor: "pointer",
                    bgcolor: "#0B0D14",
                    border: `1px solid ${BORDER}`,
                }}
            >
                {item.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={item.coverImageUrl}
                        alt={item.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                ) : null}

                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(180deg, rgba(4,6,12,0.55) 0%, rgba(4,6,12,0.15) 35%, rgba(4,6,12,0.92) 100%)",
                    }}
                />

                {/* Badges */}
                <Box sx={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 0.75 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            bgcolor: "#FFFFFF",
                            borderRadius: "7px",
                            px: 1,
                            py: 0.4,
                        }}
                    >
                        <Icon size={13} color="#111827" />
                        <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#111827", lineHeight: 1 }}>
                            {style.label}
                        </Typography>
                    </Box>
                    {item.isTrending ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, bgcolor: "#DC2626", borderRadius: "7px", px: 1, py: 0.4 }}>
                            <MdTrendingUp size={12} color="#FFFFFF" />
                            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#FFFFFF", lineHeight: 1 }}>
                                Trending
                            </Typography>
                        </Box>
                    ) : null}
                </Box>

                {/* Title + author + CTA */}
                <Box
                    sx={{
                        position: "absolute",
                        insetInline: 0,
                        bottom: 0,
                        p: { xs: 1.5, md: 2 },
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        gap: 1.5,
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            sx={{
                                fontSize: { xs: "0.95rem", md: "1.15rem" },
                                fontWeight: 600,
                                color: "#FFFFFF",
                                lineHeight: 1.3,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}
                        >
                            {item.title}
                        </Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: "#C7CBD9", mt: 0.5 }}>
                            by&nbsp; {item.authorName}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            flexShrink: 0,
                            border: "1px solid #FFFFFF",
                            borderRadius: "99px",
                            px: { xs: 1, md: 1.5 },
                            py: 0.6,
                            color: "#FFFFFF",
                            transition: "background-color .2s, color .2s",
                            "&:hover": { bgcolor: "#FFFFFF", color: "#111827" },
                        }}
                    >
                        <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, display: { xs: "none", sm: "block" } }}>
                            {TYPE_STYLE[item.updateType].readLabel}
                        </Typography>
                        <MdArrowForward size={14} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
