"use client";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import StudentLayout from "@/layouts/StudentLayout";
import StudentHeader from "@/layouts/StudentHeader";
import { Box, Button, TextField, InputAdornment } from "@mui/material";
import { MdAdd, MdKeyboardArrowDown, MdSearch } from "react-icons/md";
import CCNButton from "@/components/buttons/CCNButton";

// ── Tabs ───────────────────────────────────────────────────────────────────────

const TABS = [
    { label: "Active", href: "/dashboard/student/requests" },
    { label: "Resolved", href: "/dashboard/student/requests/resolved" },
    { label: "Rejected", href: "/dashboard/student/requests/rejected" },
];

// ── Layout ─────────────────────────────────────────────────────────────────────

export default function RequestsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [search, setSearch] = useState("");

    return (
        <StudentLayout header={<StudentHeader title="My Requests" />}>



            {/* Tabs + filters row */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                    flexWrap: "wrap",
                }}
            >
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
                    {TABS.map(({ label, href }) => {
                        const active =
                            href === "/dashboard/student/requests"
                                ? pathname === href
                                : pathname.startsWith(href);
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
                                    "&:hover": {
                                        bgcolor: active
                                            ? "rgba(255,255,255,0.15)"
                                            : "rgba(255,255,255,0.06)",
                                        color: active ? "#fff" : "rgba(255,255,255,0.7)",
                                    },
                                }}
                            >
                                {label}
                            </Button>
                        );
                    })}
                </Box>

                <Box sx={{ flex: 1 }} />

                {/* Sort By */}
                <Button
                    endIcon={<MdKeyboardArrowDown size={14} />}
                    sx={{
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
                    }}
                >
                    Sort By
                </Button>

                {/* Date */}
                <Button
                    endIcon={<MdKeyboardArrowDown size={14} />}
                    sx={{
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
                    }}
                >
                    Date
                </Button>

                {/* Search */}
                <TextField
                    placeholder="Search requests..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
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
                {/* Create button row */}
                <Box >
                    <CCNButton onClick={() => { }}>
                        <MdAdd size={15} style={{ marginRight: 5, verticalAlign: "middle" }} />
                        Create New Request
                    </CCNButton>
                </Box>
            </Box>

            {children}
        </StudentLayout>
    );
}
