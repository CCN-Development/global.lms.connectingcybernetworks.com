"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Menu, MenuItem } from "@mui/material";
import { CircleCheck, CircleX, Eye, MoreHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import type { PostStatus } from "@/contexts/CommunityContext";
import { CC, timeAgo } from "../community-data";
import { ActionButton, ActionMenu, ChoiceChip, dropdownItemSx, dropdownPaperSx, EmptyCard, FieldInput, FilterButton, TEXT } from "../community-ui";
import { useCommunity } from "../CommunityContext";
import PostCard from "../PostCard";
import { RevealedAuthorNote } from "../ThreadView";
import { PanelLoading, PanelShell } from "./ManagePanel";
import { useModeration } from "./useModeration";

const TABS: { id: PostStatus; label: string; empty: string }[] = [
    { id: "pending_review", label: "Waiting for approval", empty: "Nothing to review. New posts in spaces that need approval will show up here." },
    { id: "hidden", label: "Hidden", empty: "No hidden discussions." },
    { id: "rejected", label: "Rejected", empty: "No rejected discussions." },
    { id: "deleted", label: "Removed", empty: "No removed discussions." },
];

const PAGE = 20;

export default function QueuePanel() {
    const router = useRouter();
    const { api, paths, refreshQueue } = useCommunity();
    const { moderationPosts, moderationPostsMeta, loadingAdmin, queue, spaces } = api;
    const [status, setStatus] = useState<PostStatus>("pending_review");
    const [spaceId, setSpaceId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [loaded, setLoaded] = useState(false);
    const [spaceAnchor, setSpaceAnchor] = useState<HTMLElement | null>(null);

    const moderatable = spaces.filter((s) => s.canModerate);
    const spaceName = spaceId ? (moderatable.find((s) => s.id === spaceId)?.name ?? "Space") : "All spaces";
    const { getModerationPosts } = api;

    const load = useCallback(async () => {
        const res = await getModerationPosts({ status, spaceId: spaceId ?? undefined, search: query || undefined, page: 1, limit: PAGE });
        setLoaded(true);
        if (!res.success) toast.error(res.message ?? "Couldn't load the queue");
    }, [getModerationPosts, status, spaceId, query]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        const t = setTimeout(() => setQuery(search.trim()), 350);
        return () => clearTimeout(t);
    }, [search]);

    const moderation = useModeration({ onChanged: () => void load() });

    const loadMore = () => {
        if (!moderationPostsMeta?.hasMore || loadingAdmin) return;
        void getModerationPosts({ status, spaceId: spaceId ?? undefined, search: query || undefined, page: moderationPostsMeta.page + 1, limit: PAGE }, { append: true });
    };

    const counts: Partial<Record<PostStatus, number | undefined>> = { pending_review: queue?.pendingPosts, hidden: queue?.hiddenPosts };
    const tab = TABS.find((t) => t.id === status)!;
    const posts = moderationPosts.filter((p) => p.status === status);

    return (
        <PanelShell
            view="queue"
            title="Moderation Queue"
            subtitle="Approve new posts and review content that has been hidden, rejected or removed."
            actions={
                <ActionButton
                    onClick={() => {
                        refreshQueue();
                        void load();
                    }}
                >
                    Refresh
                </ActionButton>
            }
            toolbar={
                <>
                    <Box role="radiogroup" sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {TABS.map((t) => (
                            <ChoiceChip key={t.id} active={status === t.id} count={counts[t.id]} onClick={() => setStatus(t.id)}>
                                {t.label}
                            </ChoiceChip>
                        ))}
                    </Box>
                    <Box sx={{ display: "flex", gap: "8px", ml: { md: "auto" }, flexWrap: "wrap", width: { xs: "100%", md: "auto" } }}>
                        {moderatable.length > 1 && (
                            <FilterButton label="Filter by space" open={Boolean(spaceAnchor)} onClick={(e) => setSpaceAnchor(e.currentTarget)}>
                                {spaceName}
                            </FilterButton>
                        )}
                        <FieldInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title or text" aria-label="Search queue" sx={{ height: 40, width: { xs: "100%", sm: 240 } }} />
                    </Box>
                    <Menu anchorEl={spaceAnchor} open={Boolean(spaceAnchor)} onClose={() => setSpaceAnchor(null)} slotProps={{ paper: { sx: { ...dropdownPaperSx, minWidth: 220 } } }}>
                        {[{ id: null as string | null, name: "All spaces" }, ...moderatable].map((s) => (
                            <MenuItem
                                key={s.id ?? "all"}
                                selected={spaceId === s.id}
                                onClick={() => {
                                    setSpaceId(s.id);
                                    setSpaceAnchor(null);
                                }}
                                sx={dropdownItemSx(spaceId === s.id)}
                            >
                                {s.name}
                            </MenuItem>
                        ))}
                    </Menu>
                </>
            }
            onEndReached={loadMore}
            loadingMore={loadingAdmin && posts.length > 0}
        >
            {!loaded || (loadingAdmin && posts.length === 0) ? (
                <PanelLoading />
            ) : posts.length === 0 ? (
                <EmptyCard title="All clear" message={query ? "No discussions match your search." : tab.empty} />
            ) : (
                posts.map((post) => {
                    const more = moderation.postItems(post).filter((i) => i.label !== "Approve" && i.label !== "Reject");
                    return (
                        <PostCard
                            key={post.id}
                            post={post}
                            onOpen={() => router.push(paths.thread(post.id))}
                            footer={
                                <>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0, mr: "auto" }}>
                                        <Box component="span" sx={{ ...TEXT.reg12, color: CC.n400 }}>
                                            {post.space.name} · {timeAgo(post.createdAt)}
                                        </Box>
                                        <RevealedAuthorNote author={post.author} />
                                        {post.moderationNote && (
                                            <Box component="span" sx={{ ...TEXT.reg12, color: CC.n300 }}>
                                                Reason: {post.moderationNote}
                                            </Box>
                                        )}
                                    </Box>
                                    {post.status === "pending_review" && post.permissions.capabilities.includes("post.approve") && (
                                        <>
                                            <ActionButton tone="success" disabled={moderation.busy} icon={<CircleCheck size={18} />} onClick={() => void moderation.approve(post.id)}>
                                                Approve
                                            </ActionButton>
                                            <ActionButton tone="danger" disabled={moderation.busy} icon={<CircleX size={18} />} onClick={() => moderation.reject(post.id)}>
                                                Reject
                                            </ActionButton>
                                        </>
                                    )}
                                    <ActionButton icon={<Eye size={18} />} onClick={() => router.push(paths.thread(post.id))}>
                                        Review
                                    </ActionButton>
                                    {more.length > 0 && <ActionMenu label="More moderation actions" items={more} trigger={<MoreHorizontal size={22} color={CC.n200} />} />}
                                </>
                            }
                        />
                    );
                })
            )}
            {moderation.modals}
        </PanelShell>
    );
}
