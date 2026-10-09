"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Box, ButtonBase, InputBase, Menu, MenuItem, Typography } from "@mui/material";
import StudentLayout from "@/layouts/StudentLayout";
import StudentHeader from "@/layouts/StudentHeader";
import { LmsButton } from "@/components/community/community-ui";
import CreateRequestModal from "@/components/requests/CreateRequestModal";
import { DATE_OPTIONS, RQ, SORT_OPTIONS, TEXT, requestAsset } from "@/components/requests/request-data";
import { Icon, dropdownItemSx, dropdownPaperSx } from "@/components/requests/request-parts";
import { RequestFiltersProvider, useRequestFilters } from "./filters";

const BASE = "/dashboard/student/requests";

const TABS = [
    { label: "Active", href: BASE },
    { label: "Resolved", href: `${BASE}/resolved` },
    { label: "Rejected", href: `${BASE}/rejected` },
];

// ─── Filter dropdown ("Sort By" / "Date") ──────────────────────────────────
function FilterDropdown<T extends string>({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: T;
    options: { value: T; label: string }[];
    onChange: (value: T) => void;
}) {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    return (
        <>
            <ButtonBase
                aria-haspopup="menu"
                aria-label={`${label}: ${options.find((o) => o.value === value)?.label ?? ""}`}
                onClick={(event) => setAnchor(event.currentTarget)}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    pl: "16px",
                    pr: "12px",
                    py: "8px",
                    borderRadius: "8px",
                    bgcolor: RQ.filterBg,
                    backdropFilter: "blur(12px)",
                    ...TEXT.med16,
                    color: RQ.white,
                    whiteSpace: "nowrap",
                    transition: "background-color .15s ease",
                    "&:hover": { bgcolor: "rgba(64,64,64,0.6)" },
                }}
            >
                {label}
                <Icon name="icon-chevron-down.svg" size={24} sx={{ transform: anchor ? "rotate(180deg)" : "none", transition: "transform .15s ease" }} />
            </ButtonBase>
            <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                slotProps={{ paper: { sx: { ...dropdownPaperSx, minWidth: 180 } } }}
            >
                {options.map((option) => (
                    <MenuItem
                        key={option.value}
                        selected={option.value === value}
                        sx={dropdownItemSx}
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

// ─── Header + toolbar ──────────────────────────────────────────────────────
function RequestsToolbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { search, setSearch, sort, setSort, dateRange, setDateRange, addRequest } = useRequestFilters();
    const [createOpen, setCreateOpen] = useState(false);

    return (
        <>
            {/* Title row */}
            <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: { xs: "flex-end", md: "space-between" }, gap: "16px", minHeight: 44 }}>
                <Typography component="h1" sx={{ ...TEXT.poppinsMed20, color: RQ.white, display: { xs: "none", md: "block" } }}>
                    My Requests
                </Typography>
                <Box aria-hidden sx={{ position: "absolute", left: 159, top: -755, lineHeight: 0, pointerEvents: "none", display: { xs: "none", md: "block" } }}>
                    <Image src={requestAsset("header-stars.svg")} alt="" width={901} height={831} loading="eager" />
                </Box>
                <LmsButton onClick={() => setCreateOpen(true)} icon={<Icon name="icon-plus.svg" size={20} />} sx={{ position: "relative" }}>
                    Create New Request
                </LmsButton>
            </Box>

            {/* Tabs + filters */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px 24px" }}>
                <Box
                    role="tablist"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        p: "4px",
                        borderRadius: "99px",
                        border: `1px solid ${RQ.tabGroupBorder}`,
                        bgcolor: RQ.tabGroupBg,
                        backdropFilter: "blur(4px)",
                        opacity: 0.8,
                        maxWidth: "100%",
                        overflowX: "auto",
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": { display: "none" },
                    }}
                >
                    {TABS.map((tab) => {
                        const active = tab.href === BASE ? pathname === BASE : pathname.startsWith(tab.href);
                        return (
                            <ButtonBase
                                key={tab.href}
                                LinkComponent={Link}
                                href={tab.href}
                                role="tab"
                                aria-selected={active}
                                sx={{
                                    height: 44,
                                    px: active ? "16px" : "20px",
                                    py: "8px",
                                    flexShrink: 0,
                                    borderRadius: active ? "99px" : "8px",
                                    border: active ? `1px solid ${RQ.primary75}` : "1px solid transparent",
                                    backgroundImage: active ? RQ.tabActiveBg : "none",
                                    backdropFilter: active ? "blur(12px)" : "none",
                                    ...TEXT.med16,
                                    color: active ? RQ.white : RQ.n400,
                                    whiteSpace: "nowrap",
                                    transition: "color .15s ease",
                                    "&:hover": { color: RQ.white },
                                }}
                            >
                                {tab.label}
                            </ButtonBase>
                        );
                    })}
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "16px 24px", width: { xs: "100%", lg: "auto" }, justifyContent: { lg: "flex-end" } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <FilterDropdown label="Sort By" value={sort} options={SORT_OPTIONS} onChange={setSort} />
                        <FilterDropdown label="Date" value={dateRange} options={DATE_OPTIONS} onChange={setDateRange} />
                    </Box>
                    <Box
                        role="search"
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            height: 48,
                            width: { xs: "100%", sm: 279 },
                            px: "12px",
                            py: "8px",
                            borderRadius: "12px",
                            border: `1px solid ${RQ.primary75}`,
                        }}
                    >
                        <Icon name="icon-search.svg" size={24} />
                        <InputBase
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search requests..."
                            inputProps={{ "aria-label": "Search requests" }}
                            sx={{
                                flex: 1,
                                minWidth: 0,
                                ...TEXT.interReg16,
                                lineHeight: "25px",
                                color: RQ.white,
                                "& input": { p: 0, textOverflow: "ellipsis" },
                                "& input::placeholder": { color: RQ.n300, opacity: 1 },
                            }}
                        />
                    </Box>
                </Box>
            </Box>

            <CreateRequestModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={(request) => {
                    addRequest(request);
                    router.push(BASE);
                }}
            />
        </>
    );
}

// ─── Layout ────────────────────────────────────────────────────────────────
export default function RequestsLayout({ children }: { children: React.ReactNode }) {
    return (
        <RequestFiltersProvider>
            <StudentLayout header={<StudentHeader title="My Requests" />} headerMobileOnly>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", pb: "24px" }}>
                    <RequestsToolbar />
                    {children}
                </Box>
            </StudentLayout>
        </RequestFiltersProvider>
    );
}
