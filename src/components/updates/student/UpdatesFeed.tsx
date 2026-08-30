"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    Box,
    Button,
    InputBase,
    Menu,
    MenuItem,
    Pagination,
    Skeleton,
    Typography,
} from "@mui/material";
import { MdKeyboardArrowDown, MdSearch } from "react-icons/md";
import {
    useUpdates,
    type UpdateSort,
    type UpdateTab,
} from "@/contexts/UpdatesContext";
import UpdateCard, { BORDER, BORDER_HOVER, MUTED, SURFACE } from "./UpdateCard";
import FeaturedCarousel from "./FeaturedCarousel";

const PRIMARY = "#2F53AD";
const PRIMARY_HOVER = "#26449120";
const LIMIT = 12;

const TABS: { label: string; value: UpdateTab; href: string; countKey: "news" | "blog" | "announcement" | null }[] = [
    { label: "News", value: "news", href: "/dashboard/student/updates/news", countKey: "news" },
    { label: "Blogs", value: "blog", href: "/dashboard/student/updates/blogs", countKey: "blog" },
    { label: "Announcements", value: "announcement", href: "/dashboard/student/updates/announcements", countKey: "announcement" },
];

const SORT_OPTIONS: { label: string; value: UpdateSort }[] = [
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "Most viewed", value: "popular" },
];

const MENU_SLOT_PROPS = {
    paper: {
        sx: {
            bgcolor: "#0B0D14",
            border: `1px solid ${BORDER_HOVER}`,
            borderRadius: "10px",
            "& .MuiMenuItem-root": { fontSize: "0.78rem", color: "#E4E4E7" },
            "& .MuiMenuItem-root:hover": { bgcolor: SURFACE },
        },
    },
} as const;

export default function UpdatesFeed({ tab }: { tab: UpdateTab }) {
    const router = useRouter();
    const pathname = usePathname();
    const { feed, counts, feedMeta, featured, loadingFeed, loadingFeatured, getUpdatesFeed, getFeaturedUpdates } = useUpdates();

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<UpdateSort>("newest");
    const [page, setPage] = useState(1);
    const [sortAnchor, setSortAnchor] = useState<null | HTMLElement>(null);

    useEffect(() => { void getFeaturedUpdates(5); }, [getFeaturedUpdates]);

    const load = useCallback(() => {
        void getUpdatesFeed({ type: tab, search: search || undefined, sort, page, limit: LIMIT });
    }, [getUpdatesFeed, tab, search, sort, page]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { setPage(1); }, [tab, search, sort]);

    const totalLabel = useMemo(() => {
        const total = feedMeta?.total ?? 0;
        const noun = tab === "news" ? "news" : tab === "blog" ? "blogs" : tab === "announcement" ? "announcements" : "updates";
        return { total: total.toLocaleString("en-IN"), noun };
    }, [feedMeta, tab]);

    const isAnnouncements = tab === "announcement";

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pb: 3 }}>
            {/* ── Intro + featured carousel ── */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1.05fr" }, gap: { xs: 2, lg: 3 }, alignItems: "center" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                    <Typography sx={{ fontSize: { xs: "1.35rem", md: "1.75rem" }, fontWeight: 600, color: "#FFFFFF", lineHeight: 1.2 }}>
                        News &amp; Updates
                    </Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: MUTED, lineHeight: 1.6, maxWidth: 380 }}>
                        Stay updated with the latest announcements, cybersecurity news, events, placements, and blogs.
                    </Typography>

                    <Box
                        component="form"
                        onSubmit={(event: React.FormEvent) => { event.preventDefault(); setSearch(searchInput.trim()); }}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            bgcolor: SURFACE,
                            border: `1px solid ${BORDER}`,
                            borderRadius: "10px",
                            pl: 1.5,
                            pr: 0.6,
                            py: 0.6,
                            maxWidth: 380,
                        }}
                    >
                        <InputBase
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            placeholder="Search latest news, blogs or announcements..."
                            sx={{ flex: 1, fontSize: "0.75rem", color: "#FFFFFF", "& input::placeholder": { color: MUTED, opacity: 1 } }}
                        />
                        <Button
                            type="submit"
                            size="small"
                            variant="contained"
                            startIcon={<MdSearch size={14} />}
                            sx={{
                                borderRadius: "7px",
                                textTransform: "none",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                px: 1.25,
                                py: 0.5,
                                minWidth: 0,
                                bgcolor: PRIMARY,
                                "& .MuiButton-startIcon": { mr: 0.4 },
                                "&:hover": { bgcolor: "#264491" },
                            }}
                        >
                            Search
                        </Button>
                    </Box>
                </Box>

                <FeaturedCarousel items={featured} loading={loadingFeatured} />
            </Box>

            {/* ── Toolbar ── */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, flexWrap: "wrap" }}>
                <Typography sx={{ fontSize: "0.78rem", color: MUTED }}>
                    <Box component="span" sx={{ color: "#FFFFFF", fontWeight: 700 }}>{totalLabel.total}</Box>
                    {` ${totalLabel.noun} in total`}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Button
                        size="small"
                        onClick={(event) => setSortAnchor(event.currentTarget)}
                        endIcon={<MdKeyboardArrowDown size={16} />}
                        sx={{
                            bgcolor: SURFACE,
                            border: `1px solid ${BORDER}`,
                            borderRadius: "9px",
                            px: 1.5,
                            py: 0.6,
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            textTransform: "none",
                            color: "#E4E4E7",
                            "&:hover": { bgcolor: PRIMARY_HOVER, borderColor: BORDER_HOVER },
                        }}
                    >
                        {SORT_OPTIONS.find((option) => option.value === sort)?.label}
                    </Button>
                    <Menu
                        anchorEl={sortAnchor}
                        open={Boolean(sortAnchor)}
                        onClose={() => setSortAnchor(null)}
                        slotProps={MENU_SLOT_PROPS}
                    >
                        {SORT_OPTIONS.map((option) => (
                            <MenuItem
                                key={option.value}
                                selected={option.value === sort}
                                onClick={() => { setSort(option.value); setSortAnchor(null); }}
                            >
                                {option.label}
                            </MenuItem>
                        ))}
                    </Menu>

                    {/* Segmented tabs */}
                    <Box sx={{ display: "flex", gap: 0.5, bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "10px", p: "3px" }}>
                        {TABS.map(({ label, value, href, countKey }) => {
                            const active = tab === value || (tab === "all" && pathname === href);
                            const count = countKey && counts ? counts[countKey] : undefined;
                            return (
                                <Button
                                    key={value}
                                    onClick={() => router.push(href)}
                                    sx={{
                                        borderRadius: "8px",
                                        px: 1.5,
                                        py: 0.5,
                                        fontSize: "0.75rem",
                                        fontWeight: active ? 600 : 500,
                                        textTransform: "none",
                                        minWidth: 0,
                                        lineHeight: 1.4,
                                        whiteSpace: "nowrap",
                                        bgcolor: active ? "#2A2E3F" : "transparent",
                                        color: active ? "#FFFFFF" : MUTED,
                                        "&:hover": { bgcolor: active ? "#2A2E3F" : "#1A1D28", color: "#FFFFFF" },
                                    }}
                                >
                                    {label}{count !== undefined ? ` (${count})` : ""}
                                </Button>
                            );
                        })}
                    </Box>
                </Box>
            </Box>

            {/* ── Grid ── */}
            {loadingFeed ? (
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" }, gap: 1.5 }}>
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton
                            key={index}
                            variant="rectangular"
                            height={isAnnouncements ? 110 : 230}
                            sx={{ borderRadius: "12px", bgcolor: SURFACE }}
                        />
                    ))}
                </Box>
            ) : feed.length === 0 ? (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
                        py: 6,
                        bgcolor: SURFACE,
                        border: `1px solid ${BORDER}`,
                        borderRadius: "12px",
                    }}
                >
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#FFFFFF" }}>Nothing here yet</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: MUTED }}>
                        {search ? "No results matched your search." : "Check back soon for new updates."}
                    </Typography>
                    {search ? (
                        <Button
                            size="small"
                            onClick={() => { setSearchInput(""); setSearch(""); }}
                            sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 600, color: "#93C5FD" }}
                        >
                            Clear search
                        </Button>
                    ) : null}
                </Box>
            ) : (
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" }, gap: isAnnouncements ? 1 : 1.5 }}>
                    {feed.map((item) => (
                        <UpdateCard key={`${item.updateType}-${item.updateId}`} item={item} />
                    ))}
                </Box>
            )}

            {feedMeta && feedMeta.totalPages > 1 ? (
                <Box sx={{ display: "flex", justifyContent: "center", pt: 1 }}>
                    <Pagination
                        size="small"
                        count={feedMeta.totalPages}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        sx={{
                            "& .MuiPaginationItem-root": { color: MUTED },
                            "& .Mui-selected": { backgroundColor: `${PRIMARY} !important`, color: "#FFFFFF" },
                        }}
                    />
                </Box>
            ) : null}
        </Box>
    );
}
