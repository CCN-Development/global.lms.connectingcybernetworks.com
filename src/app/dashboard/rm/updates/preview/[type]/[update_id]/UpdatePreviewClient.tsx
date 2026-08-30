"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Chip, Paper, Skeleton, Typography } from "@mui/material";
import { ArrowLeft, Calendar, Clock, Eye, Tag } from "lucide-react";
import RichTextView from "@/components/editor/RichTextView";
import {
    UPDATE_TYPE_LABELS,
    updateTypeFromSlug,
    useUpdates,
    type UpdateDetail,
} from "@/contexts/UpdatesContext";
import { TYPE_ACCENT } from "@/components/updates/UpdateFormModal";

function fmtDateTime(value?: string | null) {
    if (!value) return "Not published";
    return new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function UpdatePreviewClient({ typeSlug, updateId }: { typeSlug: string; updateId: string }) {
    const router = useRouter();
    const { getUpdateDetail } = useUpdates();

    const type = updateTypeFromSlug(typeSlug);
    const accent = TYPE_ACCENT[type];

    const [item, setItem] = useState<UpdateDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        const res = await getUpdateDetail(type, updateId);
        setItem(res.success ? res.data : null);
        setLoading(false);
    }, [getUpdateDetail, type, updateId]);

    useEffect(() => { void load(); }, [load]);

    if (loading) {
        return (
            <Box className="flex flex-col gap-2">
                <Skeleton height={40} />
                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: "10px" }} />
                <Skeleton height={24} />
                <Skeleton height={24} />
            </Box>
        );
    }

    if (!item) {
        return (
            <Box className="flex flex-col items-center gap-2 py-10 text-gray-500">
                <Typography className="text-sm font-semibold">This item could not be found.</Typography>
                <Button size="small" onClick={() => router.back()} startIcon={<ArrowLeft size={14} />} sx={{ textTransform: "none", fontWeight: 700 }}>
                    Go back
                </Button>
            </Box>
        );
    }

    return (
        <Box className="flex flex-col gap-2 sm:gap-3 h-full overflow-y-auto">
            <Button
                size="small"
                onClick={() => router.back()}
                startIcon={<ArrowLeft size={14} />}
                sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 700, color: accent }}
            >
                Back
            </Button>

            <Paper elevation={0} className="rounded-lg overflow-hidden" sx={{ border: `1px solid ${accent}` }}>
                {item.coverImageUrl ? (
                    <Box className="relative w-full h-44 sm:h-64">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.coverImageUrl} alt={item.title} className="w-full h-full object-cover" />
                    </Box>
                ) : null}

                <Box className="p-3 sm:p-5 flex flex-col gap-2">
                    <Box className="flex items-center gap-1.5 flex-wrap">
                        <Chip
                            size="small"
                            label={UPDATE_TYPE_LABELS[item.updateType]}
                            sx={{ height: 20, fontSize: 10, fontWeight: 800, bgcolor: accent, color: "#ffffff" }}
                        />
                        <Chip
                            size="small"
                            label={item.isPublished ? "Published" : "Draft"}
                            sx={{ height: 20, fontSize: 10, fontWeight: 800, bgcolor: item.isPublished ? "#10b981" : "#f59e0b", color: "#ffffff" }}
                        />
                        {item.announcementType ? (
                            <Chip size="small" label={item.announcementType} sx={{ height: 20, fontSize: 10, fontWeight: 800, bgcolor: "#ede9fe", color: "#7c3aed" }} />
                        ) : null}
                    </Box>

                    <Typography className="text-lg sm:text-2xl font-black leading-tight">{item.title}</Typography>

                    {item.summary ? (
                        <Typography className="text-sm text-gray-600 leading-relaxed">{item.summary}</Typography>
                    ) : null}

                    <Box className="flex items-center gap-x-3 gap-y-1 flex-wrap text-gray-500">
                        <Box className="flex items-center gap-1">
                            <Tag size={13} />
                            <Typography className="text-xs font-semibold">{item.category}</Typography>
                        </Box>
                        <Box className="flex items-center gap-1">
                            <Calendar size={13} />
                            <Typography className="text-xs">{fmtDateTime(item.publishedAt ?? item.createdAt)}</Typography>
                        </Box>
                        <Box className="flex items-center gap-1">
                            <Clock size={13} />
                            <Typography className="text-xs">{item.readTimeMinutes} min read</Typography>
                        </Box>
                        <Box className="flex items-center gap-1">
                            <Eye size={13} />
                            <Typography className="text-xs">{item.viewCount} views</Typography>
                        </Box>
                    </Box>

                    <Box className="pt-1">
                        <RichTextView html={item.content} />
                    </Box>

                    <Box className="flex items-center gap-2 pt-2 border-t border-gray-200">
                        {item.authorPhotoUrl ? (
                            <Box className="relative w-8 h-8 rounded-full overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.authorPhotoUrl} alt={item.authorName} className="w-full h-full object-cover" />
                            </Box>
                        ) : null}
                        <Box>
                            <Typography className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Published by</Typography>
                            <Typography className="text-xs font-bold">{item.authorName}</Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}
