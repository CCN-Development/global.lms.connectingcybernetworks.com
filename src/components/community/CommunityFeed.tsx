"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, ButtonBase, Menu, MenuItem, Typography } from "@mui/material";
import {
    CategoryId,
    CC,
    CURRENT_USER_ID,
    FEED_MENU,
    FeedFilter,
    feedLabel,
    findCategory,
    htmlToText,
    Post,
    SORT_OPTIONS,
    SortKey,
    TAGS,
} from "./community-data";
import { CategorySwatch, darkScroll, dropdownItemSx, dropdownPaperSx, ellipsis, GlassCard, Icon, LmsButton, TEXT } from "./community-ui";
import { useCommunity } from "./CommunityContext";
import ForumSidebar from "./ForumSidebar";
import PostCard from "./PostCard";

const isCategory = (f: FeedFilter) => !["all", "pinned", "mine", "saved"].includes(f);

function matchesFilter(post: Post, filter: FeedFilter) {
    if (filter === "all") return true;
    if (filter === "pinned") return Boolean(post.pinnedBy);
    if (filter === "mine") return post.author.id === CURRENT_USER_ID;
    if (filter === "saved") return post.saved;
    return post.categoryId === filter;
}

function sortPosts(list: Post[], key: SortKey) {
    const sorted = [...list];
    switch (key) {
        case "oldest":
            return sorted.sort((a, b) => a.createdAt - b.createdAt);
        case "most-liked":
            return sorted.sort((a, b) => b.likes - a.likes);
        case "most-replied":
            return sorted.sort((a, b) => b.replies.length - a.replies.length);
        case "most-viewed":
            return sorted.sort((a, b) => b.views - a.views);
        default:
            // Latest keeps pinned announcements on top, as in the design.
            return sorted.sort((a, b) => Number(Boolean(b.pinnedBy)) - Number(Boolean(a.pinnedBy)) || b.createdAt - a.createdAt);
    }
}

// ─── Filter bar dropdown button ────────────────────────────────────────────
function FilterButton({
    children,
    open,
    onClick,
    label,
}: {
    children: React.ReactNode;
    open: boolean;
    onClick: (e: React.MouseEvent<HTMLElement>) => void;
    label: string;
}) {
    return (
        <ButtonBase
            aria-label={label}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={onClick}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                height: 40,
                pl: "16px",
                pr: "12px",
                borderRadius: "8px",
                bgcolor: CC.filterBg,
                backdropFilter: "blur(12px)",
                color: CC.white,
                ...TEXT.med16,
                whiteSpace: "nowrap",
                maxWidth: "100%",
                transition: "background-color .15s ease",
                "&:hover": { bgcolor: "rgba(64,64,64,0.6)" },
            }}
        >
            {children}
            <Icon name="icon-chevron-down.svg" size={24} sx={{ transition: "transform .15s ease", transform: open ? "rotate(180deg)" : "none" }} />
        </ButtonBase>
    );
}

export default function CommunityFeed() {
    const router = useRouter();
    const { posts, filter, setFilter, tagFilter, setTagFilter, sortKey, setSortKey, search, setSearch, openNewDiscussion } = useCommunity();
    const [catAnchor, setCatAnchor] = useState<HTMLElement | null>(null);
    const [tagAnchor, setTagAnchor] = useState<HTMLElement | null>(null);
    const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null);

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        const list = posts.filter(
            (p) =>
                matchesFilter(p, filter) &&
                (tagFilter.length === 0 || p.tags.some((t) => tagFilter.includes(t))) &&
                (!q || [p.title, htmlToText(p.html), p.author.name].some((s) => s.toLowerCase().includes(q))),
        );
        return sortPosts(list, sortKey);
    }, [posts, filter, tagFilter, search, sortKey]);

    const label = feedLabel(filter);
    const openThread = (post: Post) => router.push(`/dashboard/student/community/${post.id}`);
    const toggleTag = (tag: string) => setTagFilter(tagFilter.includes(tag) ? tagFilter.filter((t) => t !== tag) : [...tagFilter, tag]);

    return (
        <Box sx={{ display: "flex", gap: "24px", height: "100%", minHeight: 0 }}>
            <ForumSidebar posts={posts} active={filter} onSelect={setFilter} onNewDiscussion={openNewDiscussion} />

            <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "24px", minHeight: 0 }}>
                {/* Filter bar */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: { xs: "wrap", lg: "nowrap" } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
                        <FilterButton label="Filter by category" open={Boolean(catAnchor)} onClick={(e) => setCatAnchor(e.currentTarget)}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                                {isCategory(filter) && <CategorySwatch color={findCategory(filter as CategoryId).color} />}
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
                                {visible.length}
                            </Box>{" "}
                            latest topic{visible.length === 1 ? "" : "s"} in {label}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "12px", ml: "auto" }}>
                        <LmsButton onClick={openNewDiscussion} icon={<Icon name="icon-plus.svg" size={20} sx={{ position: "relative" }} />} sx={{ display: { xs: "flex", lg: "none" }, height: 40 }}>
                            New
                        </LmsButton>
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
                <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px", pr: "4px", pb: "8px", ...darkScroll }}>
                    {visible.map((post) => (
                        <PostCard key={post.id} post={post} onOpen={() => openThread(post)} />
                    ))}
                    {visible.length === 0 && (
                        <GlassCard sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", py: "48px !important", textAlign: "center" }}>
                            <Typography sx={{ ...TEXT.semi18, color: CC.white }}>No discussions here yet</Typography>
                            <Typography sx={{ ...TEXT.med14, color: CC.n300, maxWidth: 380 }}>
                                {search || tagFilter.length
                                    ? "Try a different search or clear the tag filters."
                                    : "Start the conversation — ask a question or share something useful with your batch."}
                            </Typography>
                            <LmsButton onClick={openNewDiscussion} icon={<Icon name="icon-plus.svg" size={20} sx={{ position: "relative" }} />} sx={{ width: 220 }}>
                                New Discussion
                            </LmsButton>
                        </GlassCard>
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
                {FEED_MENU.map((item) => (
                    <MenuItem
                        key={item.id}
                        selected={item.id === filter}
                        onClick={() => {
                            setFilter(item.id);
                            setCatAnchor(null);
                        }}
                        sx={dropdownItemSx(item.id === filter)}
                    >
                        {isCategory(item.id) ? (
                            <CategorySwatch color={findCategory(item.id as CategoryId).color} />
                        ) : (
                            <Icon name={item.icon} size={20} rotate={item.rotateIcon ? 180 : undefined} />
                        )}
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
                {TAGS.map((tag) => {
                    const on = tagFilter.includes(tag);
                    return (
                        <MenuItem key={tag} role="menuitemcheckbox" aria-checked={on} onClick={() => toggleTag(tag)} sx={dropdownItemSx(on)}>
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
                            {tag}
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
        </Box>
    );
}
