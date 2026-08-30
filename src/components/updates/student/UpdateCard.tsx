"use client";

import { useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import { MdArrowForward, MdArticle, MdCampaign, MdPublic, MdTrendingUp } from "react-icons/md";
import {
    DEFAULT_ACTION_LABELS,
    UPDATE_TYPE_SLUGS,
    type AnnouncementType,
    type UpdateItem,
    type UpdateType,
} from "@/contexts/UpdatesContext";

export const TYPE_STYLE: Record<UpdateType, { label: string; color: string; icon: React.ElementType; readLabel: string }> = {
    news: { label: "News", color: "#60a5fa", icon: MdPublic, readLabel: "Read News" },
    blog: { label: "Blog", color: "#a78bfa", icon: MdArticle, readLabel: "Read Article" },
    announcement: { label: "Announcement", color: "#a78bfa", icon: MdCampaign, readLabel: "Read More" },
};

export const SURFACE = "#12141C";
export const BORDER = "#23262F";
export const BORDER_HOVER = "#3A3F55";
export const MUTED = "#8A8FA3";

/** "Published Today" / "Updated 2 hrs ago" style stamp used on the cards. */
export function relativeStamp(item: UpdateItem): string {
    const published = item.publishedAt ?? item.createdAt;
    const updated = item.updatedAt;
    const useUpdated = new Date(updated).getTime() - new Date(published).getTime() > 60_000;
    const target = new Date(useUpdated ? updated : published);
    const prefix = useUpdated ? "Updated" : "Published";

    const diffMs = Date.now() - target.getTime();
    const hours = Math.floor(diffMs / 3_600_000);

    if (hours < 1) return `${prefix} just now`;
    if (hours < 24) return `${prefix} ${hours} hr${hours === 1 ? "" : "s"} ago`;

    const days = Math.floor(hours / 24);
    if (days === 1) return `${prefix} yesterday`;
    if (days < 7) return `${prefix} ${days} days ago`;

    return `${prefix} ${target.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;
}

export function updateHref(item: UpdateItem) {
    return `/dashboard/student/updates/${UPDATE_TYPE_SLUGS[item.updateType]}/${item.slug}`;
}

function TypeBadge({ type }: { type: UpdateType }) {
    const style = TYPE_STYLE[type];
    const Icon = style.icon;
    return (
        <Box
            sx={{
                position: "absolute",
                top: 8,
                left: 8,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: "#0B0D14",
                border: `1px solid ${BORDER_HOVER}`,
                borderRadius: "7px",
                px: 0.9,
                py: 0.35,
            }}
        >
            <Icon size={12} color="#FFFFFF" />
            <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#FFFFFF", lineHeight: 1 }}>
                {style.label}
            </Typography>
        </Box>
    );
}

/** Announcements have no cover art in the design — they use a purple megaphone tile. */
function AnnouncementThumb() {
    return (
        <Box
            sx={{
                width: 86,
                height: 86,
                flexShrink: 0,
                borderRadius: "10px",
                background: "linear-gradient(140deg, #3B1E6E 0%, #6D28D9 55%, #2A1250 100%)",
                border: `1px solid ${BORDER_HOVER}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <MdCampaign size={34} color="#E9D5FF" />
        </Box>
    );
}

export default function UpdateCard({ item }: { item: UpdateItem }) {
    const router = useRouter();
    const style = TYPE_STYLE[item.updateType];
    const open = () => router.push(updateHref(item));

    const actionLabel =
        item.updateType === "announcement"
            ? item.actionLabel ?? DEFAULT_ACTION_LABELS[(item.announcementType ?? "General") as AnnouncementType]
            : style.readLabel;

    /* Announcements: compact horizontal row with the megaphone tile. */
    if (item.updateType === "announcement") {
        return (
            <Box
                onClick={open}
                sx={{
                    display: "flex",
                    gap: 1.5,
                    p: 1.25,
                    borderRadius: "12px",
                    cursor: "pointer",
                    border: "1px solid transparent",
                    transition: "background-color .18s, border-color .18s",
                    "&:hover": { bgcolor: SURFACE, borderColor: BORDER },
                }}
            >
                <AnnouncementThumb />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6, minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontSize: "0.66rem", color: MUTED, lineHeight: 1 }}>
                        {item.category} &nbsp;•&nbsp; {relativeStamp(item)}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            color: "#FFFFFF",
                            lineHeight: 1.35,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        {item.title}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: "auto", color: "#C7CBD9" }}>
                        <Typography sx={{ fontSize: "0.7rem", fontWeight: 500 }}>{actionLabel}</Typography>
                        <MdArrowForward size={12} />
                    </Box>
                </Box>
            </Box>
        );
    }

    /* News & blogs: cover image on top, meta + title + read link below. */
    return (
        <Box
            onClick={open}
            sx={{
                display: "flex",
                flexDirection: "column",
                borderRadius: "12px",
                overflow: "hidden",
                cursor: "pointer",
                bgcolor: SURFACE,
                border: `1px solid ${BORDER}`,
                transition: "border-color .18s, transform .18s, box-shadow .18s",
                "&:hover": {
                    borderColor: BORDER_HOVER,
                    transform: "translateY(-2px)",
                    boxShadow: "0 10px 28px rgba(0,0,0,0.45)",
                },
            }}
        >
            <Box sx={{ position: "relative", aspectRatio: "16 / 9", bgcolor: "#0B0D14", overflow: "hidden" }}>
                {item.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={item.coverImageUrl}
                        alt={item.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                ) : (
                    <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <style.icon size={30} color={style.color} />
                    </Box>
                )}
                <TypeBadge type={item.updateType} />
                {item.isTrending ? (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.4,
                            bgcolor: "#DC2626",
                            borderRadius: "7px",
                            px: 0.8,
                            py: 0.35,
                        }}
                    >
                        <MdTrendingUp size={11} color="#FFFFFF" />
                        <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#FFFFFF", lineHeight: 1 }}>
                            Trending
                        </Typography>
                    </Box>
                ) : null}
            </Box>

            <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 0.75, flex: 1 }}>
                <Typography sx={{ fontSize: "0.66rem", color: MUTED, lineHeight: 1 }}>
                    {item.category} &nbsp;•&nbsp; {item.readTimeMinutes} min read
                </Typography>
                <Typography
                    sx={{
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: "#FFFFFF",
                        lineHeight: 1.35,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {item.title}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: "auto", pt: 0.5, color: "#C7CBD9" }}>
                    <Typography sx={{ fontSize: "0.72rem", fontWeight: 500 }}>{actionLabel}</Typography>
                    <MdArrowForward size={12} />
                </Box>
            </Box>
        </Box>
    );
}
