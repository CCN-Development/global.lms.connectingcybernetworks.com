"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Box, Button, Divider, Skeleton, Typography } from "@mui/material";
import {
    MdAccessTime,
    MdArrowBack,
    MdArrowForward,
    MdCalendarToday,
    MdShare,
    MdVisibility,
} from "react-icons/md";
import RichTextView from "@/components/editor/RichTextView";
import {
    updateTypeFromSlug,
    useUpdates,
    type UpdateDetail,
    type UpdateItem,
} from "@/contexts/UpdatesContext";
import { BORDER, BORDER_HOVER, MUTED, SURFACE, TYPE_STYLE, updateHref } from "./UpdateCard";

const RELATED_STEP = 4;

function fmtPublished(value?: string | null) {
    if (!value) return "Unpublished";
    const date = new Date(value);
    const time = date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
    const day = date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    return `Published ${time} ${day}`;
}

function fmtUpdated(value?: string | null) {
    if (!value) return null;
    return `Last updated ${new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`;
}

function fmtViews(count: number) {
    if (count >= 1000) return `${(count / 1000).toFixed(2)}k views`;
    return `${count} view${count === 1 ? "" : "s"}`;
}

function RelatedCard({ item }: { item: UpdateItem }) {
    const router = useRouter();
    const style = TYPE_STYLE[item.updateType];
    const Icon = style.icon;

    return (
        <Box
            onClick={() => router.push(updateHref(item))}
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.6,
                p: 1.25,
                borderRadius: "10px",
                cursor: "pointer",
                border: `1px solid ${BORDER}`,
                bgcolor: SURFACE,
                transition: "border-color .18s",
                "&:hover": { borderColor: BORDER_HOVER },
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Icon size={12} color="#FFFFFF" />
                <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#FFFFFF", lineHeight: 1 }}>
                    {style.label}
                </Typography>
            </Box>
            <Typography sx={{ fontSize: "0.64rem", color: MUTED, lineHeight: 1 }}>
                {item.category} &nbsp;•&nbsp; {item.readTimeMinutes} min read
            </Typography>
            <Typography
                sx={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#C7CBD9" }}>
                <Typography sx={{ fontSize: "0.68rem", fontWeight: 500 }}>{style.readLabel}</Typography>
                <MdArrowForward size={11} />
            </Box>
        </Box>
    );
}

export default function UpdateDetailClient({ typeSlug, identifier }: { typeSlug: string; identifier: string }) {
    const router = useRouter();
    const { getUpdateDetail } = useUpdates();

    const type = updateTypeFromSlug(typeSlug);
    const [item, setItem] = useState<UpdateDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [visibleRelated, setVisibleRelated] = useState(RELATED_STEP);

    const load = useCallback(async () => {
        setLoading(true);
        const res = await getUpdateDetail(type, identifier);
        setItem(res.success ? res.data : null);
        setLoading(false);
    }, [getUpdateDetail, type, identifier]);

    useEffect(() => { void load(); }, [load]);

    const share = async () => {
        const url = typeof window === "undefined" ? "" : window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({ title: item?.title, url });
                return;
            } catch {
                // The user dismissed the share sheet — fall through to copying.
            }
        }
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pb: 3 }}>
                <Skeleton height={36} sx={{ bgcolor: SURFACE }} />
                <Skeleton variant="rectangular" height={260} sx={{ borderRadius: "12px", bgcolor: SURFACE }} />
                <Skeleton height={20} sx={{ bgcolor: SURFACE }} />
                <Skeleton height={20} sx={{ bgcolor: SURFACE }} />
            </Box>
        );
    }

    if (!item) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, py: 8 }}>
                <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#FFFFFF" }}>
                    This item is no longer available.
                </Typography>
                <Button
                    size="small"
                    onClick={() => router.push("/dashboard/student/updates")}
                    sx={{ textTransform: "none", fontWeight: 600, color: "#93C5FD" }}
                >
                    Back to News &amp; Updates
                </Button>
            </Box>
        );
    }

    const updatedLabel = fmtUpdated(item.updatedAt);
    const related = item.related ?? [];

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pb: 4 }}>
            <Button
                size="small"
                onClick={() => router.back()}
                startIcon={<MdArrowBack size={16} />}
                sx={{ alignSelf: "flex-start", textTransform: "none", fontSize: "0.78rem", fontWeight: 600, color: "#C7CBD9", px: 0.5 }}
            >
                Back
            </Button>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 300px" }, gap: { xs: 2, lg: 3 }, alignItems: "start" }}>
                {/* ── Article ── */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0 }}>
                    <Typography sx={{ fontSize: { xs: "1.25rem", md: "1.6rem" }, fontWeight: 600, color: "#FFFFFF", lineHeight: 1.25 }}>
                        {item.title}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, flexWrap: "wrap" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", color: MUTED }}>
                            <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#C7CBD9" }}>{item.category}</Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                                <MdCalendarToday size={12} />
                                <Typography sx={{ fontSize: "0.72rem" }}>{fmtPublished(item.publishedAt ?? item.createdAt)}</Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                                <MdAccessTime size={12} />
                                <Typography sx={{ fontSize: "0.72rem" }}>{item.readTimeMinutes} mins read</Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                                <MdVisibility size={12} />
                                <Typography sx={{ fontSize: "0.72rem" }}>{fmtViews(item.viewCount)}</Typography>
                            </Box>
                        </Box>

                        <Button
                            size="small"
                            onClick={share}
                            startIcon={<MdShare size={13} />}
                            sx={{
                                textTransform: "none",
                                fontSize: "0.72rem",
                                fontWeight: 600,
                                color: "#E4E4E7",
                                border: `1px solid ${BORDER_HOVER}`,
                                borderRadius: "8px",
                                px: 1.25,
                                py: 0.4,
                                "&:hover": { bgcolor: SURFACE },
                            }}
                        >
                            Share
                        </Button>
                    </Box>

                    {updatedLabel ? (
                        <Box
                            sx={{
                                alignSelf: "flex-start",
                                bgcolor: SURFACE,
                                border: `1px solid ${BORDER}`,
                                borderRadius: "8px",
                                px: 1.25,
                                py: 0.45,
                            }}
                        >
                            <Typography sx={{ fontSize: "0.68rem", color: MUTED }}>{updatedLabel}</Typography>
                        </Box>
                    ) : null}

                    {item.coverImageUrl ? (
                        <Box sx={{ borderRadius: "12px", overflow: "hidden", border: `1px solid ${BORDER}` }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={item.coverImageUrl}
                                alt={item.title}
                                style={{ width: "100%", display: "block", objectFit: "cover", maxHeight: 380 }}
                            />
                        </Box>
                    ) : null}

                    {item.summary ? (
                        <Typography sx={{ fontSize: "0.85rem", color: "#C7CBD9", lineHeight: 1.7 }}>{item.summary}</Typography>
                    ) : null}

                    <Box className="rich-text-dark" sx={{ color: "#D4D7E3", fontSize: "0.85rem", lineHeight: 1.8, "& a": { color: "#93C5FD" }, "& h1, & h2, & h3": { color: "#FFFFFF" } }}>
                        <RichTextView html={item.content} />
                    </Box>

                    {item.updateType === "announcement" && item.actionUrl ? (
                        <Button
                            size="small"
                            href={item.actionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="contained"
                            endIcon={<MdArrowForward size={14} />}
                            sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 700, borderRadius: "8px", bgcolor: "#2F53AD", "&:hover": { bgcolor: "#264491" } }}
                        >
                            {item.actionLabel ?? "Open"}
                        </Button>
                    ) : null}

                    {item.updateType === "news" && item.sourceUrl ? (
                        <Typography sx={{ fontSize: "0.72rem", color: MUTED }}>
                            Source:{" "}
                            <Box component="a" href={item.sourceUrl} target="_blank" rel="noopener noreferrer" sx={{ color: "#93C5FD" }}>
                                {item.sourceName ?? item.sourceUrl}
                            </Box>
                        </Typography>
                    ) : null}

                    <Divider sx={{ borderColor: BORDER, mt: 1 }} />

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                        {item.authorPhotoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={item.authorPhotoUrl}
                                alt={item.authorName}
                                style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                            />
                        ) : (
                            <Box
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: "50%",
                                    bgcolor: "#2A2E3F",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.8rem",
                                    fontWeight: 700,
                                    color: "#FFFFFF",
                                }}
                            >
                                {item.authorName.slice(0, 1).toUpperCase()}
                            </Box>
                        )}
                        <Box>
                            <Typography sx={{ fontSize: "0.66rem", color: MUTED }}>Published by</Typography>
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#FFFFFF" }}>{item.authorName}</Typography>
                        </Box>
                    </Box>
                </Box>

                {/* ── Related rail ── */}
                {related.length > 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#FFFFFF" }}>Related Articles</Typography>
                        {related.slice(0, visibleRelated).map((entry) => (
                            <RelatedCard key={`${entry.updateType}-${entry.updateId}`} item={entry} />
                        ))}
                        {visibleRelated < related.length ? (
                            <Button
                                size="small"
                                onClick={() => setVisibleRelated((count) => count + RELATED_STEP)}
                                sx={{
                                    textTransform: "none",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    color: "#E4E4E7",
                                    border: `1px solid ${BORDER_HOVER}`,
                                    borderRadius: "8px",
                                    py: 0.6,
                                    "&:hover": { bgcolor: SURFACE },
                                }}
                            >
                                Show More
                            </Button>
                        ) : null}
                    </Box>
                ) : null}
            </Box>
        </Box>
    );
}
