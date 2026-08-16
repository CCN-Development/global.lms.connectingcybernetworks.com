"use client";

import React, { useState } from "react";
import { Box, Drawer, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
    MdOutlineHome,
    MdOutlineMenuBook,
    MdOutlineBook,
    MdOutlineCalendarToday,
    MdOutlineAssignment,
    MdOutlineBusinessCenter,
    MdOutlineSend,
    MdOutlineChat,
    MdOutlineCampaign,
    MdOutlineShield,
    MdOutlineSettings,
    MdChevronLeft,
    MdChevronRight,
    MdMenu,
} from "react-icons/md";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────
interface StudentLayoutProps {
    children: React.ReactNode | React.ReactNode[] | React.ReactElement | React.ReactElement[];
    header?: React.ReactNode;
}

// ─── Nav Items ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { label: "Home", icon: MdOutlineHome, href: "/dashboard/student/overview" },
    { label: "My Courses", icon: MdOutlineMenuBook, href: "/dashboard/student/my-courses" },
    { label: "My Batches", icon: MdOutlineBook, href: "/dashboard/student/batches" },
    { label: "Attendance", icon: MdOutlineCalendarToday, href: "/dashboard/student/attendance" },
    { label: "Exam", icon: MdOutlineAssignment, href: "/dashboard/student/exams" },
    { label: "Placement", icon: MdOutlineBusinessCenter, href: "/dashboard/student/placement" },
    { label: "My Requests", icon: MdOutlineSend, href: "/dashboard/student/requests" },
    { label: "Chats", icon: MdOutlineChat, href: "/dashboard/student/chats" },
    { label: "News & Updates", icon: MdOutlineCampaign, href: "/dashboard/student/news" },
    { label: "CCN Community", icon: MdOutlineShield, href: "/dashboard/student/community" },
    { label: "Settings", icon: MdOutlineSettings, href: "/dashboard/student/settings" },
];

// ─── Constants ─────────────────────────────────────────────────────────────
const SIDEBAR_EXPANDED = 170;
const SIDEBAR_COLLAPSED = 64;

// ─── Component ─────────────────────────────────────────────────────────────
export default function StudentLayout({ children, header }: StudentLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width:900px)");
    const pathname = usePathname();
    const router = useRouter();

    const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

    return (
        <Box
            sx={{
                display: "flex",
                height: "100vh",
                overflow: "hidden",
                color: "#fff",
                p: "5px",
            }}
        >
            {/* ── Sidebar ── */}
            <Box
                component="aside"
                sx={{
                    width: sidebarWidth,
                    minWidth: sidebarWidth,
                    position: { xs: "fixed", md: "sticky" },
                    top: 0,
                    left: { xs: 0, md: "auto" },
                    height: { xs: "100vh", md: "100%" },
                    transform: { xs: mobileOpen ? "translateX(0)" : "translateX(-110%)", md: "none" },
                    display: "flex",
                    flexDirection: "column",
                    backdropFilter: "blur(16px)",
                    bgcolor: { xs: "rgba(8,12,24,0.98)", md: "transparent" },
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: { xs: "0 20px 20px 0", md: "20px" },
                    py: 1.5,
                    px: collapsed ? 0.75 : 1.25,
                    transition: "width 0.25s ease, min-width 0.25s ease, padding 0.25s ease, transform 0.28s cubic-bezier(0.4,0,0.2,1)",
                    zIndex: { xs: 300, md: 100 },
                    overflow: "hidden",
                }}
            >
                {/* Logo + Collapse button */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: collapsed ? "center" : "space-between",
                        mb: 2.5,
                        px: collapsed ? 0 : 0.5,
                    }}
                >
                    {!collapsed && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <Image
                                src="/Logo-Dark-Theme.svg"
                                alt="CCN Logo"
                                width={110}
                                height={26}
                                priority
                            />
                        </Box>
                    )}

                    {/* Collapse toggle */}
                    <Box
                        onClick={() => setCollapsed((c) => !c)}
                        sx={{
                            width: 24,
                            height: 24,
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            flexShrink: 0,
                            color: "#FEFEFE",
                        }}
                        className="Menu size-10 p-4 bg-linear-to-b from-indigo-200/10 to-gray-500/10 rounded-xl inline-flex justify-center items-center gap-3 overflow-hidden"
                    >
                        {collapsed ? <MdChevronRight size={14} /> : <MdChevronLeft size={14} />}
                    </Box>
                </Box>

                {/* Nav Items */}
                <Box
                    component="nav"
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        flex: 1,
                        overflowY: "auto",
                        overflowX: "hidden",
                        "&::-webkit-scrollbar": { width: 1 },
                        "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(0, 17, 53, 0.25)", borderRadius: 4 },
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: 60,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            background: "radial-gradient(circle, rgba(61, 61, 61, 0.45) 0%, rgba(255, 255, 255, 0) 70%)",
                            pointerEvents: "none",
                        }}
                    />

                    {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
                        const isActive = pathname === href || pathname.startsWith(href + "/");
                        return (
                            <Tooltip
                                key={href}
                                title={collapsed ? label : ""}
                                placement="right"
                                arrow
                            >
                                <Box
                                    onClick={() => router.push(href)}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: collapsed ? 0 : 1.25,
                                        px: collapsed ? 0 : 1,
                                        py: 0.9,
                                        borderRadius: "10px",
                                        cursor: "pointer",
                                        justifyContent: collapsed ? "center" : "flex-start",
                                        color: isActive ? "#fff" : "rgb(255, 255, 255)",
                                    }}
                                    className={cn(
                                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-light transition-all duration-200",
                                        isActive
                                            ? "bg-linear-to-r from-[#002cbd] to-black/10 text-white "
                                            : "text-zinc-400 hover:bg-white/5 hover:text-white",
                                        collapsed && "justify-center px-2"
                                    )}

                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Icon size={18} />
                                    </Box>

                                    {!collapsed && (
                                        <Typography
                                            sx={{
                                                fontSize: "0.775rem",
                                                fontWeight: isActive ? 600 : 500,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                lineHeight: 1,
                                            }}
                                        >
                                            {label}
                                        </Typography>
                                    )}
                                </Box>
                            </Tooltip>
                        );
                    })}
                </Box>
            </Box>

            {/* Mobile backdrop */}
            {mobileOpen && (
                <Box
                    onClick={() => setMobileOpen(false)}
                    sx={{
                        display: { md: "none" },
                        position: "fixed",
                        inset: 0,
                        bgcolor: "rgba(0,0,0,0.55)",
                        zIndex: 299,
                    }}
                />
            )}

            {/* ── Main Area ── */}
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                    height: "100%",
                    overflow: "hidden",
                    px: 1,
                }}
            >
                {/* Header slot */}
                {header && (
                    <Box
                        component="header"
                        sx={{
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            py: 1,
                        }}
                    >
                        {/* Mobile hamburger */}
                        <Box
                            component="button"
                            onClick={() => setMobileOpen(true)}
                            sx={{
                                display: { xs: "flex", md: "none" },
                                alignItems: "center",
                                cursor: "pointer",
                                color: "rgba(255,255,255,0.8)",
                                p: 0.75,
                                borderRadius: "8px",
                                border: "none",
                                bgcolor: "transparent",
                                touchAction: "manipulation",
                                WebkitTapHighlightColor: "transparent",
                                "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                                flexShrink: 0,
                            }}
                        >
                            <MdMenu size={20} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            {header}
                        </Box>
                    </Box>
                )}

                {/* Page content */}
                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        overflowY: "auto",
                        overflowX: "hidden",
                        "&::-webkit-scrollbar": { width: 1 },
                        "&::-webkit-scrollbar-thumb": {
                            bgcolor: "rgba(0, 17, 54, 0.2)",
                            borderRadius: 4,
                        },
                        p: 1
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
}
