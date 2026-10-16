"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, ButtonBase, CircularProgress, Menu, MenuItem, Skeleton, Typography } from "@mui/material";
import { CC, feedLabel, isCategoryFilter, MANAGE_MENU, MANAGE_VIEWS, ManageView, SORT_OPTIONS } from "./community-data";
import { CategorySwatch, darkScroll, dropdownItemSx, dropdownPaperSx, ellipsis, FilterButton, GlassCard, Icon, LmsButton, TEXT } from "./community-ui";
import { useCommunity } from "./CommunityContext";
import ForumSidebar from "./ForumSidebar";
import ManagePanel from "./manage/ManagePanel";
import NotificationsButton from "./NotificationsButton";
import PostCard from "./PostCard";

export { FilterButton };

/** Loading / error states share the card look of the feed. */
export function CommunityStatus({ error, onRetry }: { error: string | null; onRetry: () => void }) {
    if (error) {
        return (
            <GlassCard sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", py: "48px !important", textAlign: "center" }}>
                <Typography sx={{ ...TEXT.semi18, color: CC.white }}>Couldn&apos;t load the community</Typography>
                <Typography sx={{ ...TEXT.med14, color: CC.n300, maxWidth: 380 }}>{error}</Typography>
                <LmsButton onClick={onRetry} sx={{ width: 180 }}>
                    Try again
                </LmsButton>
            </GlassCard>
        );
    }
    return <PostSkeletons />;
}

export function PostSkeletons({ count = 3 }: { count?: number }) {
    const bone = { bgcolor: "rgba(255,255,255,0.06)" };
    return (
        <>
            {Array.from({ length: count }, (_, i) => (
                <GlassCard key={i} sx={{ display: "flex", flexDirection: "column", gap: "16px", flexShrink: 0 }}>
                    <Skeleton variant="text" width={180} sx={bone} />
                    <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Skeleton variant="circular" width={32} height={32} sx={bone} />
                        <Skeleton variant="text" width={140} sx={bone} />
                    </Box>
                    <Box sx={{ pl: { xs: 0, sm: "42px" }, display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Skeleton variant="text" width="60%" height={28} sx={bone} />
                        <Skeleton variant="text" width="90%" sx={bone} />
                    </Box>
                </GlassCard>
            ))}
        </>
    );
}

/**
 * Community home. Students: sidebar + feed. Staff (variant "staff"): the same feed, plus the management
 * views (?view=queue|reports|members|spaces|taxonomy|analytics|log) in place of the feed column.
 */
export default function CommunityFeed() {
    return (
        <Suspense fallback={<HomeFallback />}>
            <CommunityHome />
        </Suspense>
    );
}

function HomeFallback() {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <PostSkeletons count={2} />
        </Box>
    );
}

function CommunityHome() {
    const router = useRouter();
    const params = useSearchParams();
    const { isStaffView, filter, setFilter, paths, openNewDiscussion } = useCommunity();
    const requested = params.get("view");
    const view = isStaffView && requested && MANAGE_VIEWS.has(requested) ? (requested as ManageView) : null;

    return (
        <Box sx={{ display: "flex", gap: "24px", height: "100%", minHeight: 0 }}>
            <ForumSidebar
                active={view ?? filter}
                onSelect={(f) => {
                    setFilter(f);
                    if (view) router.push(paths.feed);
                }}
                onNewDiscussion={openNewDiscussion}
            />
            {view ? <ManagePanel view={view} /> : <FeedColumn />}
        </Box>
    );
}

/** Staff on small screens (forum sidebar hidden): jump between the feed and the management views. */
export function ManageViewMenu({ active }: { active: ManageView | null }) {
    const router = useRouter();
    const { isStaffView, paths, can, api } = useCommunity();
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    if (!isStaffView) return null;
    const items = MANAGE_MENU.filter((m) => !m.capability || can(m.capability));
    const label = active ? (MANAGE_MENU.find((m) => m.id === active)?.label ?? "Manage") : "Discussions";
    const badge = (api.queue?.pendingPosts ?? 0) + (api.queue?.openReports ?? 0);
    return (
        <Box sx={{ display: { xs: "flex", lg: "none" } }}>
            <FilterButton label="Forum sections" open={Boolean(anchor)} onClick={(e) => setAnchor(e.currentTarget)}>
                {label}
                {badge > 0 && <Box component="span" sx={{ ...TEXT.med12, color: "#FFAD4F" }}>{badge}</Box>}
            </FilterButton>
            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} slotProps={{ paper: { sx: { ...dropdownPaperSx, minWidth: 220 } } }}>
                <MenuItem
                    selected={!active}
                    onClick={() => {
                        setAnchor(null);
                        router.push(paths.feed);
                    }}
                    sx={dropdownItemSx(!active)}
                >
                    Discussions
                </MenuItem>
                {items.map((item) => (
                    <MenuItem
                        key={item.id}
                        selected={active === item.id}
                        onClick={() => {
                            setAnchor(null);
                            router.push(paths.view(item.id));
                        }}
                        sx={dropdownItemSx(active === item.id)}
                    >
                        {item.label}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}

function FeedColumn() {
    const router = useRouter();
    const {
        api,
        ready,
        bootError,
        retryBootstrap,
        menu,
        filter,
        setFilter,
        tagFilter,
        setTagFilter,
        sortKey,
        setSortKey,
        search,
        setSearch,
        loadMore,
        refreshFeed,
        refreshing,
        openNewDiscussion,
        isStaffView,
        paths,
    } = useCommunity();
    const { feed: posts, feedMeta, loadingFeed, tags } = api;
    const [catAnchor, setCatAnchor] = useState<HTMLElement | null>(null);
    const [tagAnchor, setTagAnchor] = useState<HTMLElement | null>(null);
    const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null);

    const label = feedLabel(menu, filter);
    const activeCategory = isCategoryFilter(filter) ? menu.find((m) => m.id === filter) : undefined;
    const total = feedMeta?.total ?? posts.length;
    const firstLoad = !ready || refreshing || (loadingFeed && !feedMeta);
    const toggleTag = (slug: string) => setTagFilter(tagFilter.includes(slug) ? tagFilter.filter((t) => t !== slug) : [...tagFilter, slug]);

    const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        if (el.scrollHeight - el.scrollTop - el.clientHeight < 400) loadMore();
    };

    return (
        <>
            <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "24px", minHeight: 0 }}>
                {/* Filter bar */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: { xs: "wrap", lg: "nowrap" } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
                        <ManageViewMenu active={null} />
                        <FilterButton label="Filter by category" open={Boolean(catAnchor)} onClick={(e) => setCatAnchor(e.currentTarget)}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                                {activeCategory?.color && <CategorySwatch color={activeCategory.color} />}
                                <Box component="span" sx={ellipsis}>
                                    {label}
                                </Box>
                            </Box>
                        </FilterButton>
                        <FilterButton label="Filter by tags" open={Boolean(tagAnchor)} onClick={(e) => setTagAnchor(e.currentTarget)}>
                            {tagFilter.length ? `tags (${tagFilter.length})` : "tags"}
                        </FilterButton>
                        <Typography sx={{ ...TEXT.reg16, color: CC.n300, ...ellipsis, display: { xs: "none", sm: "block" } }}>
                            <Box component="span" sx={{ fontWeight: 600, color: CC.n75 }}>
                                {total}
                            </Box>{" "}
                            latest topic{total === 1 ? "" : "s"} in {label}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "12px", ml: "auto" }}>
                        <LmsButton onClick={openNewDiscussion} icon={<Icon name="icon-plus.svg" size={20} sx={{ position: "relative" }} />} sx={{ display: { xs: "flex", lg: "none" }, height: 40 }}>
                            New
                        </LmsButton>
                        {/* Staff have the bell in the page header. */}
                        {!isStaffView && <NotificationsButton />}
                        <FilterButton label="Sort discussions" open={Boolean(sortAnchor)} onClick={(e) => setSortAnchor(e.currentTarget)}>
                            Sort by
                        </FilterButton>
                    </Box>
                </Box>

                {search.trim() && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mt: "-8px" }}>
                        <Typography sx={{ ...TEXT.med14, color: CC.n300 }}>
                            Results for <Box component="span" sx={{ color: CC.white }}>“{search.trim()}”</Box>
                        </Typography>
                        <ButtonBase onClick={() => setSearch("")} sx={{ ...TEXT.med14, color: CC.link, borderRadius: "4px", px: "4px" }}>
                            Clear
                        </ButtonBase>
                    </Box>
                )}

                {/* Posts */}
                <Box
                    onScroll={onScroll}
                    sx={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px", pr: "4px", pb: "8px", ...darkScroll }}
                >
                    {bootError || firstLoad ? (
                        <CommunityStatus error={bootError} onRetry={bootError ? retryBootstrap : refreshFeed} />
                    ) : (
                        <>
                            {posts.map((post) => (
                                <PostCard key={post.id} post={post} onOpen={() => router.push(paths.thread(post.id))} />
                            ))}
                            {loadingFeed && posts.length > 0 && (
                                <Box sx={{ display: "flex", justifyContent: "center", py: "8px", flexShrink: 0 }}>
                                    <CircularProgress size={24} sx={{ color: CC.primary200 }} />
                                </Box>
                            )}
                            {!loadingFeed && posts.length === 0 && (
                                <GlassCard sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", py: "48px !important", textAlign: "center" }}>
                                    <Typography sx={{ ...TEXT.semi18, color: CC.white }}>No discussions here yet</Typography>
                                    <Typography sx={{ ...TEXT.med14, color: CC.n300, maxWidth: 380 }}>
                                        {search || tagFilter.length
                                            ? "Try a different search or clear the tag filters."
                                            : filter === "saved"
                                              ? "Save a discussion from its menu to find it here later."
                                              : "Start the conversation — ask a question or share something useful with your batch."}
                                    </Typography>
                                    <LmsButton onClick={openNewDiscussion} icon={<Icon name="icon-plus.svg" size={20} sx={{ position: "relative" }} />} sx={{ width: 220 }}>
                                        New Discussion
                                    </LmsButton>
                                </GlassCard>
                            )}
                        </>
                    )}
                </Box>
            </Box>

            {/* Category menu */}
            <Menu
                anchorEl={catAnchor}
                open={Boolean(catAnchor)}
                onClose={() => setCatAnchor(null)}
                slotProps={{ paper: { sx: { ...dropdownPaperSx, minWidth: 240 } } }}
            >
                {menu.map((item) => (
                    <MenuItem
                        key={item.id}
                        selected={item.id === filter}
                        onClick={() => {
                            setFilter(item.id);
                            setCatAnchor(null);
                        }}
                        sx={dropdownItemSx(item.id === filter)}
                    >
                        {item.color ? <CategorySwatch color={item.color} /> : <Icon name={item.icon} size={20} rotate={item.rotateIcon ? 180 : undefined} />}
                        {item.label}
                    </MenuItem>
                ))}
            </Menu>

            {/* Tag menu */}
            <Menu
                anchorEl={tagAnchor}
                open={Boolean(tagAnchor)}
                onClose={() => setTagAnchor(null)}
                slotProps={{ paper: { sx: { ...dropdownPaperSx, minWidth: 220 } } }}
            >
                {tags
                    .filter((t) => t.isActive)
                    .map((tag) => {
                        const on = tagFilter.includes(tag.slug);
                        return (
                            <MenuItem key={tag.id} role="menuitemcheckbox" aria-checked={on} onClick={() => toggleTag(tag.slug)} sx={dropdownItemSx(on)}>
                                <Box
                                    aria-hidden
                                    sx={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: "4px",
                                        border: `1.5px solid ${on ? CC.primary200 : CC.n500}`,
                                        bgcolor: on ? CC.primary500 : "transparent",
                                        flexShrink: 0,
                                    }}
                                />
                                {tag.label}
                            </MenuItem>
                        );
                    })}
                {tagFilter.length > 0 && (
                    <MenuItem onClick={() => setTagFilter([])} sx={{ ...dropdownItemSx(), color: CC.link, borderTop: "1px solid rgba(0,0,0,0.5)" }}>
                        Clear tags
                    </MenuItem>
                )}
            </Menu>

            {/* Sort menu */}
            <Menu
                anchorEl={sortAnchor}
                open={Boolean(sortAnchor)}
                onClose={() => setSortAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: { ...dropdownPaperSx, minWidth: 180 } } }}
            >
                {SORT_OPTIONS.map((opt) => (
                    <MenuItem
                        key={opt.id}
                        selected={opt.id === sortKey}
                        onClick={() => {
                            setSortKey(opt.id);
                            setSortAnchor(null);
                        }}
                        sx={dropdownItemSx(opt.id === sortKey)}
                    >
                        {opt.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
