"use client";

import Image from "next/image";
import Link from "next/link";
import { Box, Typography } from "@mui/material";
import { FiArrowRight, FiFileText, FiGlobe, FiVolume2 } from "react-icons/fi";
import { KIND_META, updateHref, type UpdateEntry, type UpdateKind } from "./mock-data";
import { FONT_LATO, UPD } from "./tokens";

export const KIND_ICON: Record<UpdateKind, React.ElementType> = {
    news: FiGlobe,
    blog: FiFileText,
    announcement: FiVolume2,
};

const IST = "Asia/Kolkata";
const dayKey = (date: Date) => date.toLocaleDateString("en-CA", { timeZone: IST });

/** "Published Today" / "Updated 2 hrs ago" stamp used on announcement cards. */
export function formatStamp(entry: Pick<UpdateEntry, "publishedAt" | "updatedAt">): string {
    const published = new Date(entry.publishedAt);
    const updated = new Date(entry.updatedAt);

    if (updated.getTime() - published.getTime() > 60_000) {
        const hours = Math.floor((Date.now() - updated.getTime()) / 3_600_000);
        if (hours < 1) return "Updated just now";
        if (hours < 24) return `Updated ${hours} hr${hours === 1 ? "" : "s"} ago`;
        const days = Math.floor(hours / 24);
        return `Updated ${days} day${days === 1 ? "" : "s"} ago`;
    }

    const today = new Date();
    const yesterday = new Date(today.getTime() - 86_400_000);
    if (dayKey(published) === dayKey(today)) return "Published Today";
    if (dayKey(published) === dayKey(yesterday)) return "Published Yesterday";
    return `Published ${published.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: IST })}`;
}

// ─── Primitives ────────────────────────────────────────────────────────────
export function TypeBadge({ kind, size = "sm" }: { kind: UpdateKind; size?: "sm" | "lg" }) {
    const Icon = KIND_ICON[kind];
    const large = size === "lg";
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                px: "8px",
                py: "2px",
                bgcolor: UPD.neutral75,
                borderRadius: large ? "8px" : "4px",
            }}
        >
            <Icon size={16} color={UPD.black} strokeWidth={1.75} />
            <Typography
                sx={{
                    fontFamily: FONT_LATO,
                    fontWeight: large ? 400 : 500,
                    fontSize: large ? "16px" : "12px",
                    lineHeight: large ? "24px" : "18px",
                    color: UPD.black,
                    whiteSpace: "nowrap",
                }}
            >
                {KIND_META[kind].label}
            </Typography>
        </Box>
    );
}

export function TrendingBadge() {
    return (
        <Box sx={{ display: "inline-flex", alignItems: "center", px: "8px", py: "2px", bgcolor: UPD.trending, borderRadius: "8px" }}>
            <Typography sx={{ fontFamily: FONT_LATO, fontSize: "16px", lineHeight: "24px", color: UPD.white, whiteSpace: "nowrap" }}>
                Trending
            </Typography>
        </Box>
    );
}

export function MetaLine({ items }: { items: string[] }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, maxWidth: "100%", overflow: "hidden" }}>
            {items.map((text, index) => (
                <Box key={`${text}-${index}`} sx={{ display: "contents" }}>
                    {index > 0 ? <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: UPD.neutral200, flexShrink: 0 }} /> : null}
                    <Typography
                        suppressHydrationWarning
                        sx={{
                            fontFamily: FONT_LATO,
                            fontSize: "12px",
                            lineHeight: "18px",
                            color: UPD.neutral200,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            flexShrink: index === items.length - 1 ? 1 : 0,
                            minWidth: 0,
                        }}
                    >
                        {text}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}

export function CardAction({ label }: { label: string }) {
    return (
        <Box
            className="card-action"
            sx={{ display: "inline-flex", alignItems: "center", gap: "8px", height: 28, color: UPD.neutral200, transition: "color .2s" }}
        >
            <Typography sx={{ fontFamily: FONT_LATO, fontWeight: 500, fontSize: "14px", lineHeight: "21px", color: "inherit", whiteSpace: "nowrap" }}>
                {label}
            </Typography>
            <Box component="span" className="card-action-arrow" sx={{ display: "flex", transition: "transform .2s" }}>
                <FiArrowRight size={20} strokeWidth={1.5} />
            </Box>
        </Box>
    );
}

const TITLE_SX = {
    fontFamily: FONT_LATO,
    fontWeight: 600,
    fontSize: "18px",
    lineHeight: "27px",
    color: UPD.white,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
} as const;

const CARD_HOVER_SX = {
    "&:hover .card-action": { color: UPD.white },
    "&:hover .card-action-arrow": { transform: "translateX(3px)" },
    "&:focus-visible": { outline: `2px solid ${UPD.primary100}`, outlineOffset: "4px" },
} as const;

// ─── News & blog card ──────────────────────────────────────────────────────
export function ArticleCard({ entry }: { entry: UpdateEntry }) {
    return (
        <Box
            component={Link}
            href={updateHref(entry)}
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                minWidth: 0,
                textDecoration: "none",
                borderRadius: "12px",
                ...CARD_HOVER_SX,
                "&:hover .card-cover img": { transform: "scale(1.04)" },
            }}
        >
            <Box
                className="card-cover"
                sx={{
                    position: "relative",
                    height: 150,
                    borderRadius: "12px",
                    border: `1px solid ${UPD.cardBorder}`,
                    overflow: "hidden",
                    bgcolor: "#0B0B12",
                    "& img": { transition: "transform .35s ease" },
                }}
            >
                {entry.coverImage ? (
                    <Image src={entry.coverImage} alt={entry.title} fill sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 350px" style={{ objectFit: "cover" }} />
                ) : null}
                <Box sx={{ position: "absolute", insetInline: 0, top: 0, height: 102, background: UPD.cardTopShade, pointerEvents: "none" }} />
                <Box sx={{ position: "absolute", left: 13, top: 12 }}>
                    <TypeBadge kind={entry.kind} />
                </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
                <MetaLine items={[entry.category, `${entry.readMinutes} min read`]} />
                <Typography sx={TITLE_SX}>{entry.title}</Typography>
                <CardAction label={KIND_META[entry.kind].readLabel} />
            </Box>
        </Box>
    );
}

// ─── Announcement card ─────────────────────────────────────────────────────
/** Purple tile with sun-ray burst and megaphone — announcements have no cover art. */
export function AnnouncementTile({ size = 120, radius = 12 }: { size?: number; radius?: number }) {
    const scale = size / 120;
    return (
        <Box
            sx={{
                position: "relative",
                width: size,
                height: size,
                flexShrink: 0,
                borderRadius: `${radius}px`,
                overflow: "hidden",
                bgcolor: UPD.announcementTileBg,
            }}
        >
            <Box
                aria-hidden
                sx={{
                    position: "absolute",
                    left: `calc(50% + ${5 * scale}px)`,
                    top: `calc(50% + ${2 * scale}px)`,
                    width: 1192 * scale,
                    height: 1192 * scale,
                    transform: "translate(-50%, -50%) scaleX(-1)",
                    pointerEvents: "none",
                }}
            >
                <Image src="/updates/rays.svg" alt="" fill unoptimized />
            </Box>
            <Box
                aria-hidden
                sx={{
                    position: "absolute",
                    left: `calc(50% + ${7 * scale}px)`,
                    top: `calc(50% + ${7 * scale}px)`,
                    width: 106 * scale,
                    height: 106 * scale,
                    transform: "translate(-50%, -50%)",
                }}
            >
                <Image src="/updates/megaphone.png" alt="" fill sizes={`${Math.ceil(106 * scale)}px`} style={{ objectFit: "cover" }} />
            </Box>
        </Box>
    );
}

export function AnnouncementCard({ entry }: { entry: UpdateEntry }) {
    return (
        <Box
            component={Link}
            href={updateHref(entry)}
            sx={{
                display: "flex",
                gap: "20px",
                alignItems: "flex-start",
                minWidth: 0,
                textDecoration: "none",
                borderRadius: "12px",
                ...CARD_HOVER_SX,
            }}
        >
            <AnnouncementTile />
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                    <MetaLine items={[entry.category, formatStamp(entry)]} />
                    <Typography sx={TITLE_SX}>{entry.title}</Typography>
                </Box>
                <CardAction label={entry.actionLabel ?? KIND_META.announcement.readLabel} />
            </Box>
        </Box>
    );
}

export default function UpdateCard({ entry }: { entry: UpdateEntry }) {
    return entry.kind === "announcement" ? <AnnouncementCard entry={entry} /> : <ArticleCard entry={entry} />;
}
