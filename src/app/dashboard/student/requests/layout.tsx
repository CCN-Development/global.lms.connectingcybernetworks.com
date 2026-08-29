"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import StudentLayout from "@/layouts/StudentLayout";
import StudentHeader from "@/layouts/StudentHeader";
import { Box, Button, InputAdornment, Menu, MenuItem, TextField, Typography } from "@mui/material";
import { MdAdd, MdKeyboardArrowDown, MdSearch } from "react-icons/md";
import CCNButton from "@/components/buttons/CCNButton";
import CreateRequestModal from "@/components/requests/CreateRequestModal";
import { REQUEST_TYPES, RequestProvider, useRequests } from "@/contexts/RequestContext";
import { RequestFiltersProvider, useRequestFilters, type RequestSort } from "./filters";

// ── Tabs ───────────────────────────────────────────────────────────────────────

const TABS = [
    { label: "Active", href: "/dashboard/student/requests", key: "active" as const },
    { label: "Resolved", href: "/dashboard/student/requests/resolved", key: "resolved" as const },
    { label: "Rejected", href: "/dashboard/student/requests/rejected", key: "rejected" as const },
];

const SORT_OPTIONS: { label: string; value: RequestSort }[] = [
    { label: "Newest first", value: "newest" },
    { label: "Oldest first", value: "oldest" },
];

const FILTER_BUTTON_SX = {
    color: "rgba(255,255,255,0.65)",
    bgcolor: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    px: 1.5,
    py: 0.55,
    fontSize: "0.75rem",
    fontWeight: 500,
    textTransform: "none",
    "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
} as const;

const MENU_SLOT_PROPS = {
    paper: {
        sx: {
            bgcolor: "#0A0A0C",
            border: "1px solid #26262B",
            borderRadius: "10px",
            "& .MuiMenuItem-root": { fontSize: "0.78rem", color: "#E4E4E7" },
            "& .MuiMenuItem-root:hover": { bgcolor: "#18181B" },
            "& .Mui-selected": { bgcolor: "#1E1B4B !important" },
        },
    },
} as const;

// ── Toolbar ────────────────────────────────────────────────────────────────────

function RequestsToolbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { summary, getStudentRequestSummary } = useRequests();
    const { search, setSearch, sort, setSort, requestType, setRequestType, refresh } = useRequestFilters();

    const [createOpen, setCreateOpen] = useState(false);
    const [sortAnchor, setSortAnchor] = useState<null | HTMLElement>(null);
    const [typeAnchor, setTypeAnchor] = useState<null | HTMLElement>(null);

    useEffect(() => { void getStudentRequestSummary(); }, [getStudentRequestSummary]);

    const counts: Record<string, number | undefined> = {
        active: summary?.active,
        resolved: summary?.resolved,
        rejected: summary?.rejected,
    };

    return (
        <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, flexWrap: "wrap" }}>
                {/* Tab pills */}
                <Box
                    sx={{
                        display: "flex",
                        gap: 0.5,
                        bgcolor: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "10px",
                        p: "3px",
                    }}
                >
                    {TABS.map(({ label, href, key }) => {
                        const active =
                            href === "/dashboard/student/requests"
                                ? pathname === href
                                : pathname.startsWith(href);
                        const count = counts[key];
                        return (
                            <Button
                                key={href}
                                onClick={() => router.push(href)}
                                sx={{
                                    borderRadius: "7px",
                                    px: 1.5,
                                    py: 0.45,
                                    fontSize: "0.75rem",
                                    fontWeight: active ? 600 : 500,
                                    textTransform: "none",
                                    bgcolor: active ? "rgba(255,255,255,0.12)" : "transparent",
                                    color: active ? "#fff" : "rgba(255,255,255,0.45)",
                                    minWidth: 0,
                                    lineHeight: 1.4,
                                    gap: 0.6,
                                    "&:hover": {
                                        bgcolor: active ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)",
                                        color: active ? "#fff" : "rgba(255,255,255,0.7)",
                                    },
                                }}
                            >
                                {label}
                                {count !== undefined && count > 0 && (
                                    <Typography
                                        component="span"
                                        sx={{
                                            fontSize: "0.66rem",
                                            fontWeight: 600,
                                            px: 0.6,
                                            borderRadius: "999px",
                                            bgcolor: "rgba(255,255,255,0.12)",
                                            color: "inherit",
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        {count}
                                    </Typography>
                                )}
                            </Button>
                        );
                    })}
                </Box>

                <Box sx={{ flex: 1 }} />

                {/* Sort By */}
                <Button
                    onClick={(event) => setSortAnchor(event.currentTarget)}
                    endIcon={<MdKeyboardArrowDown size={14} />}
                    sx={FILTER_BUTTON_SX}
                >
                    {SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "Sort By"}
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

                {/* Category filter */}
                <Button
                    onClick={(event) => setTypeAnchor(event.currentTarget)}
                    endIcon={<MdKeyboardArrowDown size={14} />}
                    sx={FILTER_BUTTON_SX}
                >
                    {requestType || "Category"}
                </Button>
                <Menu
                    anchorEl={typeAnchor}
                    open={Boolean(typeAnchor)}
                    onClose={() => setTypeAnchor(null)}
                    slotProps={MENU_SLOT_PROPS}
                >
                    <MenuItem
                        selected={requestType === ""}
                        onClick={() => { setRequestType(""); setTypeAnchor(null); }}
                    >
                        All categories
                    </MenuItem>
                    {REQUEST_TYPES.map((type) => (
                        <MenuItem
                            key={type}
                            selected={type === requestType}
                            onClick={() => { setRequestType(type); setTypeAnchor(null); }}
                        >
                            {type}
                        </MenuItem>
                    ))}
                </Menu>

                {/* Search */}
                <TextField
                    placeholder="Search requests..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    size="small"
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MdSearch size={15} style={{ color: "rgba(255,255,255,0.3)" }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                    sx={{
                        width: 195,
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            bgcolor: "rgba(255,255,255,0.05)",
                            fontSize: "0.75rem",
                            "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                            "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                            "&.Mui-focused fieldset": { borderColor: "rgba(120,80,200,0.5)" },
                        },
                        "& .MuiOutlinedInput-input": {
                            color: "rgba(255,255,255,0.7)",
                            py: 0.72,
                            "&::placeholder": { color: "rgba(255,255,255,0.28)", opacity: 1 },
                        },
                    }}
                />

                {/* Create */}
                <Box>
                    <CCNButton onClick={() => setCreateOpen(true)}>
                        <MdAdd size={15} style={{ marginRight: 5, verticalAlign: "middle" }} />
                        Create New Request
                    </CCNButton>
                </Box>
            </Box>

            <CreateRequestModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={() => {
                    refresh();
                    void getStudentRequestSummary();
                    router.push("/dashboard/student/requests");
                }}
            />
        </>
    );
}

// ── Layout ─────────────────────────────────────────────────────────────────────

export default function RequestsLayout({ children }: { children: React.ReactNode }) {
    return (
        <RequestProvider>
            <RequestFiltersProvider>
                <StudentLayout header={<StudentHeader title="My Requests" />}>
                    <RequestsToolbar />
                    {children}
                </StudentLayout>
            </RequestFiltersProvider>
        </RequestProvider>
    );
}
