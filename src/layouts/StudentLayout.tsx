"use client";

import React, { useState } from "react";
import { Box, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Calendar } from "lucide-react";
import { MdMenu } from "react-icons/md";
import {
    ACTIVE_GRADIENT,
    ActiveNavGlow,
    COLLAPSE_BUTTON_BG,
    GRADIENT_STROKE_SX,
    NAV_HOVER_BG,
    NAV_TEXT,
    SIDEBAR_BG,
    SIDEBAR_COLLAPSED,
    SIDEBAR_COLLAPSED_BLEED,
    SIDEBAR_EXPANDED,
    SIDEBAR_TRANSITION,
    SidebarAmbientGlow,
} from "./sidebar-theme";

// ─── Types ─────────────────────────────────────────────────────────────────
interface StudentLayoutProps {
    children: React.ReactNode | React.ReactNode[] | React.ReactElement | React.ReactElement[];
    header?: React.ReactNode;
    /** Render the header slot only below `md` (keeps the mobile menu button for pages whose design has no top bar). */
    headerMobileOnly?: boolean;
    /** Start with the icon-only rail. */
    defaultCollapsed?: boolean;
    /** Keep the rail icon-only and drop the collapse toggle (the logo mark takes its place). */
    lockCollapsed?: boolean;
    /** Edge-to-edge canvas: 24px frame padding and no inner page padding. */
    fullBleed?: boolean;
    /** Render only the page content, for roles that have their own navigation. */
    hideSidebar?: boolean;
}

interface NavItem {
    label: string;
    href: string;
    /** Path to an SVG in /public, or an icon component when no design asset exists. */
    icon: string | React.ElementType;
    rotate180?: boolean;
    /** Extra route prefixes that should also mark this item active. */
    activePrefixes?: string[];
}

// ─── Nav Items ─────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
    { label: "Home", icon: "/sidebar/icon-home.svg", href: "/dashboard/student/overview" },
    { label: "My Courses", icon: "/sidebar/icon-school-mgmt.svg", href: "/dashboard/student/my-courses" },
    { label: "My Batches", icon: "/sidebar/icon-book-open.svg", href: "/dashboard/student/batches", activePrefixes: ["/dashboard/student/batch/"] },
    { label: "Attendance", icon: Calendar, href: "/dashboard/student/attendance" },
    { label: "Exam", icon: "/sidebar/icon-file-text.svg", href: "/dashboard/student/exams" },
    { label: "Practice Labs", icon: "/sidebar/icon-filter.svg", rotate180: true, href: "/dashboard/student/practice-labs" },
    { label: "Placement", icon: "/sidebar/icon-briefcase.svg", href: "/dashboard/student/placement" },
    { label: "My Requests", icon: "/sidebar/icon-send.svg", href: "/dashboard/student/requests" },
    { label: "Chats", icon: "/sidebar/icon-message-circle.svg", href: "/dashboard/chats" },
    { label: "News & Updates", icon: "/sidebar/icon-volume-2.svg", href: "/dashboard/student/updates" },
    { label: "CCN Community", icon: "/sidebar/icon-shield.svg", href: "/dashboard/student/community" },
];

// ─── Component ─────────────────────────────────────────────────────────────
export default function StudentLayout({
    children,
    header,
    headerMobileOnly = false,
    defaultCollapsed = false,
    lockCollapsed = false,
    fullBleed = false,
    hideSidebar = false,
}: StudentLayoutProps) {
    const [collapsed, setCollapsed] = useState(defaultCollapsed || lockCollapsed);
    const [mobileOpen, setMobileOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width:900px)");
    const pathname = usePathname();
    const router = useRouter();

    const isCollapsed = collapsed && !isMobile;
    const collapsedWidth = fullBleed ? SIDEBAR_COLLAPSED_BLEED : SIDEBAR_COLLAPSED;
    const sidebarWidth = isCollapsed ? collapsedWidth : SIDEBAR_EXPANDED;

    return (
        <Box
            sx={{
                display: "flex",
                height: "100vh",
                overflow: "hidden",
                color: "#fff",
                p: fullBleed ? { xs: "10px", md: "24px" } : "10px",
            }}
        >
            {/* ── Sidebar ── */}
            <Box
                component="aside"
                sx={{
                    display: hideSidebar ? "none" : "flex",
                    width: { xs: SIDEBAR_EXPANDED, md: sidebarWidth },
                    minWidth: { xs: SIDEBAR_EXPANDED, md: sidebarWidth },
                    position: { xs: "fixed", md: "sticky" },
                    top: 0,
                    left: { xs: 0, md: "auto" },
                    height: { xs: "100vh", md: "100%" },
                    transform: { xs: mobileOpen ? "translateX(0)" : "translateX(-110%)", md: "none" },
                    flexDirection: "column",
                    gap: "44px",
                    backdropFilter: "blur(4px)",
                    bgcolor: SIDEBAR_BG,
                    border: "none",
                    borderRadius: { xs: "0 32px 32px 0", md: "32px" },
                    p: isCollapsed && !fullBleed ? "24px 14px" : "24px",
                    transition: SIDEBAR_TRANSITION,
                    zIndex: { xs: 300, md: 100 },
                    overflow: "hidden",
                    ...GRADIENT_STROKE_SX,
                }}
            >
                <SidebarAmbientGlow />

                {/* Logo + Collapse button */}
                <Box
                    sx={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: isCollapsed ? "center" : "space-between",
                        flexShrink: 0,
                    }}
                >
                    {!isCollapsed && (
                        <Image
                            src="/Logo-Dark-Theme.svg"
                            alt="Connecting Cyber Networks"
                            width={159}
                            height={67}
                            priority
                        />
                    )}

                    {/* Icon-only rail shows just the logo mark, as in the design */}
                    {isCollapsed && lockCollapsed && (
                        <Box sx={{ position: "relative", width: 64, height: 66.57, flexShrink: 0 }}>
                            <Box
                                component="img"
                                src="/chats/ccn-mark.svg"
                                alt="Connecting Cyber Networks"
                                sx={{ position: "absolute", left: "4.75px", top: "2.08px", width: 54.7, height: 61.6, display: "block" }}
                            />
                        </Box>
                    )}

                    {/* Collapse toggle */}
                    {!lockCollapsed && (
                    <Box
                        component="button"
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        onClick={() => setCollapsed((c) => !c)}
                        sx={{
                            width: 40,
                            height: 40,
                            minWidth: 40,
                            borderRadius: "12px",
                            display: { xs: "none", md: "flex" },
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            flexShrink: 0,
                            border: "none",
                            p: 0,
                            background: COLLAPSE_BUTTON_BG,
                        }}
                    >
                        <Image
                            src="/sidebar/icon-chevron-left.svg"
                            alt=""
                            width={24}
                            height={24}
                            style={{ transform: isCollapsed ? "rotate(180deg)" : "none" }}
                        />
                    </Box>
                    )}
                </Box>

                {/* Nav Items */}
                <Box
                    component="nav"
                    sx={{
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        // spacing breathes on tall screens and tightens on short ones so the list never scrolls
                        gap: "clamp(4px, 1vh, 24px)",
                        flex: 1,
                        overflowY: "auto",
                        overflowX: "hidden",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        "&::-webkit-scrollbar": { display: "none" },
                    }}
                >
                    {NAV_ITEMS.map(({ label, icon, href, rotate180, activePrefixes }) => {
                        const isActive = pathname === href
                            || pathname.startsWith(href + "/")
                            || Boolean(activePrefixes?.some((prefix) => pathname.startsWith(prefix)));
                        const IconComponent = typeof icon === "string" ? null : icon;

                        return (
                            <Tooltip
                                key={href}
                                title={isCollapsed ? label : ""}
                                placement="right"
                                arrow
                            >
                                <Box
                                    component="button"
                                    onClick={() => {
                                        router.push(href);
                                        setMobileOpen(false);
                                    }}
                                    sx={{
                                        position: "relative",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: isCollapsed ? 0 : "12px",
                                        justifyContent: isCollapsed ? "center" : "flex-start",
                                        width: "100%",
                                        p: "clamp(9px, 1.3vh, 16px) 16px",
                                        border: "none",
                                        cursor: "pointer",
                                        flexShrink: 0,
                                        overflow: "hidden",
                                        textAlign: "left",
                                        borderRadius: isActive ? "18px" : "16px",
                                        background: isActive ? ACTIVE_GRADIENT : "transparent",
                                        transition: "background 0.2s ease, border-radius 0.2s ease",
                                        "&:hover": {
                                            background: isActive ? ACTIVE_GRADIENT : NAV_HOVER_BG,
                                        },
                                    }}
                                >
                                    {isActive && <ActiveNavGlow collapsed={isCollapsed} />}

                                    <Box
                                        sx={{
                                            position: "relative",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            width: 28,
                                            height: 28,
                                            transform: rotate180 ? "rotate(180deg)" : "none",
                                        }}
                                    >
                                        {IconComponent ? (
                                            <IconComponent size={28} strokeWidth={1.5} color={NAV_TEXT} />
                                        ) : (
                                            <Image src={icon as string} alt="" width={28} height={28} />
                                        )}
                                    </Box>

                                    {!isCollapsed && (
                                        <Typography
                                            sx={{
                                                position: "relative",
                                                fontSize: "16px",
                                                fontWeight: 500,
                                                lineHeight: "24px",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                color: isActive ? "#FFFFFF" : NAV_TEXT,
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
                    ...(fullBleed
                        ? { pl: { xs: 0, md: hideSidebar ? 0 : "24px" }, pr: 0 }
                        : { px: 2 }),
                }}
            >
                {/* Header slot */}
                {header && (
                    <Box
                        component="header"
                        sx={{
                            flexShrink: 0,
                            display: headerMobileOnly ? { xs: "flex", md: "none" } : "flex",
                            alignItems: "center",
                            gap: 0.5,
                            py: fullBleed ? { xs: 1, md: 0 } : 1,
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
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        "&::-webkit-scrollbar": { display: "none" },
                        p: fullBleed ? 0 : 1,
                        ...(fullBleed ? { display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" } : {}),
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
}
