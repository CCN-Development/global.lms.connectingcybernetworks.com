"use client";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import StudentLayout from "@/layouts/StudentLayout";
import StudentHeader from "@/layouts/StudentHeader";
import { Box, Typography, Button } from "@mui/material";
import { MdArrowBack, MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md";
import CCNTabs from "@/components/CCNTabs";

const TABS = [
    { label: "Ongoing", href: "/dashboard/student/batches" },
    { label: "Upcoming", href: "/dashboard/student/batches/upcoming" },
    { label: "Completed", href: "/dashboard/student/batches/completed" },
];

export default function BatchesLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const isExplore = pathname.includes("explore-batches");
    const isCompleted = pathname === "/dashboard/student/batches/completed";
    const [year, setYear] = useState(new Date().getFullYear());

    const activeHref =
        TABS.find(({ href }) =>
            href === "/dashboard/student/batches" ? pathname === href : pathname.startsWith(href)
        )?.href ?? "/dashboard/student/batches";

    const changeYear = (delta: number) => {
        const next = year + delta;
        setYear(next);
        router.replace(`/dashboard/student/batches/completed?year=${next}`, { scroll: false });
    };

    const header = isExplore ? (
        <StudentHeader
            title={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                        onClick={() => router.back()}
                        sx={{ cursor: "pointer", display: "flex", alignItems: "center", color: "rgba(255,255,255,0.55)", "&:hover": { color: "#fff" } }}
                    >
                        <MdArrowBack size={16} />
                    </Box>
                    <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}>
                        Explore Batches
                    </Typography>
                </Box>
            }
        />
    ) : (
        <StudentHeader title="My Batches" />
    );

    return (
        <StudentLayout header={header}>
            {!isExplore && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
                    <CCNTabs
                        tabs={TABS}
                        value={activeHref}
                        onChange={({ href }) => href && router.push(href)}
                    />

                    <Box sx={{ flex: 1 }} />

                    {/* Year selector — only on Completed tab */}
                    {isCompleted && (
                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            bgcolor: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "8px",
                            px: 1.25,
                            py: 0.45,
                        }}>
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#fff" }}>
                                {year}
                            </Typography>
                            <Box sx={{ display: "flex", flexDirection: "row" }}>
                                <Box onClick={() => changeYear(1)} sx={{ cursor: "pointer", display: "flex", color: "rgba(255,255,255,0.5)", "&:hover": { color: "#fff" } }}>
                                    <MdKeyboardArrowUp size={14} />
                                </Box>
                                <Box onClick={() => changeYear(-1)} sx={{ cursor: "pointer", display: "flex", color: "rgba(255,255,255,0.5)", "&:hover": { color: "#fff" } }}>
                                    <MdKeyboardArrowDown size={14} />
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {/* Explore Batches button */}
                    <Button
                        onClick={() => router.push("/dashboard/student/batches/explore-batches")}
                        sx={{
                            background: "rgb(255, 255, 255)",
                            color: "#000",
                            borderRadius: "8px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            py: 1,
                            px: 1.5,
                            textTransform: "none",
                            
                        }}
                    >
                        
                        Explore Batches
                    </Button>
                </Box>
            )}
            {children}
        </StudentLayout>
    );
}
