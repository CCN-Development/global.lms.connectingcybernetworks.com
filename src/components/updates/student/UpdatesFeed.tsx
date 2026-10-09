"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Box, ButtonBase, InputBase, Menu, MenuItem, Typography } from "@mui/material";
import { FiChevronDown, FiSearch, FiX } from "react-icons/fi";
import FeaturedCarousel from "./FeaturedCarousel";
import UpdateCard from "./UpdateCard";
import {
    KIND_META,
    UPDATE_KINDS,
    getCategories,
    getFeaturedUpdates,
    getUpdateCounts,
    getUpdates,
    listHref,
    type UpdateKind,
    type UpdateSort,
} from "./mock-data";
import { FONT_INTER, FONT_LATO, FONT_POPPINS, UPD } from "./tokens";

const SORT_OPTIONS: { label: string; value: UpdateSort }[] = [
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "Most Viewed", value: "popular" },
];

const ALL_CATEGORY = "All Category";

// ─── Toolbar dropdown ──────────────────────────────────────────────────────
function Dropdown<T extends string>({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: T;
    options: { label: string; value: T }[];
    onChange: (value: T) => void;
}) {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    return (
        <>
            <ButtonBase
                aria-haspopup="listbox"
                aria-expanded={Boolean(anchor)}
                onClick={(event) => setAnchor(event.currentTarget)}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    pl: "16px",
                    pr: "12px",
                    py: "8px",
                    borderRadius: "8px",
                    bgcolor: UPD.dropdownBg,
                    backdropFilter: "blur(12px)",
                    color: UPD.white,
                    flexShrink: 0,
                    transition: "background-color .2s",
                    "&:hover": { bgcolor: "rgba(64,64,64,0.6)" },
                }}
            >
                <Typography sx={{ fontFamily: FONT_LATO, fontWeight: 500, fontSize: "16px", lineHeight: "24px", color: UPD.white, whiteSpace: "nowrap" }}>
                    {label}
                </Typography>
                <Box component="span" sx={{ display: "flex", transition: "transform .2s", transform: anchor ? "rotate(180deg)" : "none" }}>
                    <FiChevronDown size={24} strokeWidth={1.5} />
                </Box>
            </ButtonBase>
            <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                slotProps={{
                    paper: {
                        sx: {
                            mt: "6px",
                            minWidth: anchor?.offsetWidth,
                            bgcolor: "rgba(20,20,24,0.92)",
                            backdropFilter: "blur(12px)",
                            border: `1px solid ${UPD.neutral700}`,
                            borderRadius: "8px",
                            "& .MuiMenuItem-root": { fontFamily: FONT_LATO, fontSize: "14px", color: UPD.neutral100 },
                            "& .MuiMenuItem-root:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                            "& .MuiMenuItem-root.Mui-selected": { bgcolor: "rgba(187,201,237,0.16)", color: UPD.white },
                        },
                    },
                }}
            >
                {options.map((option) => (
                    <MenuItem
                        key={option.value}
                        selected={option.value === value}
                        onClick={() => {
                            onChange(option.value);
                            setAnchor(null);
                        }}
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}

// ─── Segmented tabs ────────────────────────────────────────────────────────
function KindTabs({ active }: { active: UpdateKind }) {
    const counts = getUpdateCounts();
    return (
        <Box
            role="tablist"
            sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                p: "4px",
                borderRadius: "99px",
                bgcolor: UPD.tabsBg,
                border: `1px solid ${UPD.tabsBorder}`,
                backdropFilter: "blur(4px)",
                maxWidth: "100%",
                overflowX: "auto",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
            }}
        >
            {UPDATE_KINDS.map((kind) => {
                const selected = kind === active;
                return (
                    <Box
                        key={kind}
                        component={Link}
                        href={listHref(kind)}
                        role="tab"
                        aria-selected={selected}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            height: 44,
                            px: selected ? "16px" : "20px",
                            borderRadius: selected ? "99px" : "8px",
                            border: selected ? `1px solid ${UPD.primary75}` : "1px solid transparent",
                            background: selected ? UPD.tabActiveBg : "transparent",
                            backdropFilter: selected ? "blur(12px)" : "none",
                            textDecoration: "none",
                            fontFamily: FONT_LATO,
                            fontWeight: 500,
                            fontSize: "16px",
                            lineHeight: "24px",
                            whiteSpace: "nowrap",
                            color: selected ? UPD.white : UPD.neutral400,
                            transition: "color .2s",
                            "&:hover": { color: UPD.white },
                        }}
                    >
                        {KIND_META[kind].tabLabel} ({counts[kind]})
                    </Box>
                );
            })}
        </Box>
    );
}

// ─── Feed ──────────────────────────────────────────────────────────────────
export default function UpdatesFeed({ kind }: { kind: UpdateKind }) {
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<UpdateSort>("newest");
    const [category, setCategory] = useState(ALL_CATEGORY);

    const featured = useMemo(() => getFeaturedUpdates(), []);
    const categoryOptions = useMemo(
        () => [ALL_CATEGORY, ...getCategories(kind)].map((value) => ({ label: value, value })),
        [kind],
    );
    const items = useMemo(
        () => getUpdates(kind, { search, sort, category: category === ALL_CATEGORY ? "" : category }),
        [kind, search, sort, category],
    );

    const total = items.length.toLocaleString("en-IN");
    const summary = kind === "blog" ? `${KIND_META.blog.noun} in ${category}` : `${KIND_META[kind].noun} in total`;

    const clearSearch = () => {
        setSearchInput("");
        setSearch("");
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "32px", pb: "32px" }}>
            {/* ── Hero ── */}
            <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, alignItems: { xs: "stretch", lg: "center" }, gap: "32px" }}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: { xs: "24px", lg: "44px" },
                        px: { xs: 0, lg: "24px" },
                        width: { xs: "100%", lg: 465 },
                        flexShrink: 0,
                    }}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <Typography
                            component="h1"
                            sx={{ fontFamily: FONT_POPPINS, fontWeight: 600, fontSize: { xs: "24px", sm: "28px" }, lineHeight: { xs: "36px", sm: "42px" }, color: UPD.white }}
                        >
                            News &amp; Updates
                        </Typography>
                        <Typography sx={{ fontFamily: FONT_LATO, fontWeight: 500, fontSize: "16px", lineHeight: "24px", color: UPD.neutral300 }}>
                            Stay updated with the latest announcements, cybersecurity news, events, placements, and blogs.
                        </Typography>
                    </Box>

                    <Box
                        component="form"
                        role="search"
                        onSubmit={(event: React.FormEvent) => {
                            event.preventDefault();
                            setSearch(searchInput.trim());
                        }}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "8px",
                            height: 44,
                            pl: "20px",
                            pr: "6px",
                            borderRadius: "12px",
                            border: `1px solid ${UPD.primary75}`,
                            background: UPD.searchBg,
                            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                        }}
                    >
                        <InputBase
                            value={searchInput}
                            onChange={(event) => {
                                setSearchInput(event.target.value);
                                if (!event.target.value) setSearch("");
                            }}
                            placeholder="Search latest news, blogs or announcements..."
                            inputProps={{ "aria-label": "Search news, blogs or announcements" }}
                            sx={{
                                flex: 1,
                                minWidth: 0,
                                fontFamily: FONT_INTER,
                                fontSize: "14px",
                                lineHeight: "21px",
                                color: UPD.white,
                                "& input": { p: 0, textOverflow: "ellipsis" },
                                "& input::placeholder": { color: UPD.neutral600, opacity: 1 },
                            }}
                        />
                        {searchInput ? (
                            <ButtonBase aria-label="Clear search" onClick={clearSearch} sx={{ color: UPD.neutral400, borderRadius: "50%", p: "4px", "&:hover": { color: UPD.white } }}>
                                <FiX size={16} />
                            </ButtonBase>
                        ) : null}
                        <ButtonBase
                            type="submit"
                            sx={{
                                position: "relative",
                                overflow: "hidden",
                                height: 32,
                                px: "12px",
                                borderRadius: "8px",
                                background: UPD.searchButtonBg,
                                filter: "drop-shadow(0 0 4px rgba(255,255,255,0.12))",
                                fontFamily: FONT_LATO,
                                fontWeight: 500,
                                fontSize: "12px",
                                lineHeight: "18px",
                                color: UPD.white,
                                flexShrink: 0,
                                transition: "filter .2s",
                                "&:hover": { filter: "drop-shadow(0 0 8px rgba(89,0,172,0.6))" },
                            }}
                        >
                            <Box component="span" sx={{ display: { xs: "flex", sm: "none" } }}>
                                <FiSearch size={14} />
                            </Box>
                            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                                Search
                            </Box>
                        </ButtonBase>
                    </Box>
                </Box>

                <FeaturedCarousel items={featured} />
            </Box>

            {/* ── Toolbar ── */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px 24px", flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "4px", minWidth: 0 }}>
                    <Typography sx={{ fontFamily: FONT_INTER, fontWeight: 600, fontSize: "16px", lineHeight: "24px", color: UPD.white }}>{total}</Typography>
                    <Typography noWrap sx={{ fontFamily: FONT_INTER, fontSize: "16px", lineHeight: "24px", color: UPD.neutral100 }}>
                        {summary}
                        {search ? ` for “${search}”` : ""}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: "12px", md: "24px" }, flexWrap: "wrap", maxWidth: "100%" }}>
                    {kind === "blog" ? <Dropdown label={category} value={category} options={categoryOptions} onChange={setCategory} /> : null}
                    <Dropdown label={SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "Newest"} value={sort} options={SORT_OPTIONS} onChange={setSort} />
                    <KindTabs active={kind} />
                </Box>
            </Box>

            {/* ── Grid ── */}
            {items.length === 0 ? (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                        py: "56px",
                        borderRadius: "16px",
                        border: `1px solid ${UPD.cardBorder}`,
                        bgcolor: "rgba(255,255,255,0.02)",
                    }}
                >
                    <Typography sx={{ fontFamily: FONT_POPPINS, fontWeight: 500, fontSize: "18px", lineHeight: "27px", color: UPD.white }}>
                        No {KIND_META[kind].noun} found
                    </Typography>
                    <Typography sx={{ fontFamily: FONT_LATO, fontSize: "14px", lineHeight: "21px", color: UPD.neutral300 }}>
                        {search ? "Try a different keyword or clear your search." : "Check back soon for new updates."}
                    </Typography>
                    {search || category !== ALL_CATEGORY ? (
                        <ButtonBase
                            onClick={() => {
                                clearSearch();
                                setCategory(ALL_CATEGORY);
                            }}
                            sx={{
                                mt: "8px",
                                height: 36,
                                px: "16px",
                                borderRadius: "50px",
                                border: `1px solid ${UPD.neutral700}`,
                                fontFamily: FONT_LATO,
                                fontWeight: 500,
                                fontSize: "14px",
                                color: UPD.white,
                                "&:hover": { borderColor: UPD.neutral300 },
                            }}
                        >
                            Clear filters
                        </ButtonBase>
                    ) : null}
                </Box>
            ) : (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" },
                        columnGap: "24px",
                        rowGap: "32px",
                        alignItems: "start",
                    }}
                >
                    {items.map((entry) => (
                        <UpdateCard key={entry.id} entry={entry} />
                    ))}
                </Box>
            )}
        </Box>
    );
}
