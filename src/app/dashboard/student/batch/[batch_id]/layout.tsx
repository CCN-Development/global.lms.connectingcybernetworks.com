"use client";
import React from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import StudentLayout from "@/layouts/StudentLayout";
import { Box, Typography, Button } from "@mui/material";
import { MdArrowBack } from "react-icons/md";

export default function BatchDetailLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const batchId = params?.batch_id as string;
    const isAssignments = pathname.includes("/assignments");

    const TABS = [
        { label: "Batch Details", href: `/dashboard/student/batch/${batchId}` },
        { label: "Tasks & Assignments", href: `/dashboard/student/batch/${batchId}/assignments` },
    ];

    return (
        <StudentLayout
            header={
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 1 }}>
                    {/* Left: back arrow + batch title */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                        <Typography
                            noWrap
                            sx={{ fontSize: "1rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}
                        >
                            Cisco Certified Network Associate
                        </Typography>
                    </Box>

                    {/* Right: tab pills */}
                    <Box sx={{
                        display: "flex",
                        gap: 0.5,
                        bgcolor: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "10px",
                        p: "3px",
                        flexShrink: 0,
                    }}>
                        {TABS.map(({ label, href }) => {
                            const active = label === "Tasks & Assignments" ? isAssignments : !isAssignments;
                            return (
                                <Button
                                    key={href}
                                    onClick={() => router.push(href)}
                                    disableRipple={false}
                                    sx={{
                                        borderRadius: "7px",
                                        px: 1.75,
                                        py: 0.5,
                                        fontSize: "0.75rem",
                                        fontWeight: active ? 700 : 500,
                                        textTransform: "none",
                                        bgcolor: active ? "rgba(255,255,255,0.13)" : "transparent",
                                        color: active ? "#fff" : "rgba(255,255,255,0.45)",
                                        minWidth: 0,
                                        lineHeight: 1.4,
                                        "&:hover": {
                                            bgcolor: active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)",
                                            color: "#fff",
                                        },
                                        transition: "all 0.15s",
                                    }}
                                >
                                    {label}
                                </Button>
                            );
                        })}
                    </Box>
                </Box>
            }
        >
            {children}
        </StudentLayout>
    );
}
