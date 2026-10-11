"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { MdClose, MdLogout, MdMenu } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";
import {
    ACTIVE_GRADIENT,
    ActiveNavGlow,
    COLLAPSE_BUTTON_BG,
    GRADIENT_STROKE_SX,
    NAV_HOVER_BG,
    NAV_TEXT,
    SIDEBAR_BG,
    SIDEBAR_COLLAPSED,
    SIDEBAR_EXPANDED,
    SIDEBAR_TRANSITION,
    SidebarAmbientGlow,
} from "@/layouts/sidebar-theme";

// ─── Types ──────────────────────────────────────────────────────────────────
export type NavBadge = { label: string; color: string };

export type NavItem = {
    label: string;
    link: string;
    icon: React.ReactNode;
    isActive?: boolean;
    badge?: NavBadge;
};

type Props = {
    children?: React.ReactNode;
    headerTitle?: React.ReactNode | string;
    navItems?: NavItem[];
    /** Reserved for the header user menu. */
    notificationCount?: number;
    avatarSrc?: string;
    userName?: string;
    userRole?: string;
    onLogout?: () => void;
    onProfileClick?: () => void;
    onNotificationClick?: () => void;
    onSearchClick?: () => void;
};

const LOGOUT_COLOR = "#FF8A8A";

/** Shared nav-row shape so links and the logout button line up. */
function navRowSx(collapsed: boolean) {
    return {
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: collapsed ? 0 : "12px",
        justifyContent: collapsed ? "center" : "flex-start",
        width: "100%",
        p: "clamp(9px, 1.3vh, 16px) 16px",
        border: "none",
        cursor: "pointer",
        flexShrink: 0,
        overflow: "hidden",
        textAlign: "left",
        textDecoration: "none",
        bgcolor: "transparent",
        transition: "background 0.2s ease, border-radius 0.2s ease",
        "&:focus-visible": { outline: "2px solid rgba(255,255,255,0.6)", outlineOffset: "-2px" },
    } as const;
}

const iconBoxSx = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: 28,
    height: 28,
    fontSize: 24,
} as const;

const labelSx = {
    position: "relative",
    fontSize: "16px",
    fontWeight: 500,
    lineHeight: "24px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
} as const;

// ─── DashboardLayout ────────────────────────────────────────────────────────
// Staff dashboards (Admin / RM / Trainer / Accountant) in the same dark glass design as StudentLayout.
export default function DashboardLayout({ children, headerTitle, navItems = [], onLogout }: Props) {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width:900px)");

    const isCollapsed = collapsed && !isMobile;
    const sidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

    return (
        <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", color: "#fff", p: "10px" }}>
            {/* ── Sidebar ── */}
            <Box
                component="aside"
                sx={{
                    display: "flex",
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
                    p: isCollapsed ? "24px 14px" : "24px",
                    transition: SIDEBAR_TRANSITION,
                    zIndex: { xs: 300, md: 100 },
                    overflow: "hidden",
                    ...GRADIENT_STROKE_SX,
                }}
            >
                <SidebarAmbientGlow />

                {/* Logo + collapse / close */}
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
                        <Image src="/Logo-Dark-Theme.svg" alt="Connecting Cyber Networks" width={159} height={67} priority />
                    )}

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

                    <Box
                        component="button"
                        aria-label="Close menu"
                        onClick={() => setMobileOpen(false)}
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "12px",
                            display: { xs: "flex", md: "none" },
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            border: "none",
                            p: 0,
                            color: NAV_TEXT,
                            background: COLLAPSE_BUTTON_BG,
                        }}
                    >
                        <MdClose size={22} />
                    </Box>
                </Box>

                {/* Nav items */}
                <Box
                    component="nav"
                    sx={{
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        gap: "clamp(4px, 1vh, 24px)",
                        flex: 1,
                        overflowY: "auto",
                        overflowX: "hidden",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        "&::-webkit-scrollbar": { display: "none" },
                    }}
                >
                    {navItems.map((item) => {
                        const isActive = item.isActive ?? (pathname === item.link || pathname?.startsWith(item.link + "/"));
                        return (
                            <Tooltip key={item.link} title={isCollapsed ? item.label : ""} placement="right" arrow>
                                <Box
                                    component={Link}
                                    href={item.link}
                                    aria-current={isActive ? "page" : undefined}
                                    onClick={() => setMobileOpen(false)}
                                    sx={{
                                        ...navRowSx(isCollapsed),
                                        borderRadius: isActive ? "18px" : "16px",
                                        background: isActive ? ACTIVE_GRADIENT : "transparent",
                                        "&:hover": { background: isActive ? ACTIVE_GRADIENT : NAV_HOVER_BG },
                                    }}
                                >
                                    {isActive && <ActiveNavGlow collapsed={isCollapsed} />}

                                    <Box sx={{ ...iconBoxSx, color: isActive ? "#FFFFFF" : NAV_TEXT }}>{item.icon}</Box>

                                    {!isCollapsed && (
                                        <Typography sx={{ ...labelSx, flex: 1, color: isActive ? "#FFFFFF" : NAV_TEXT }}>{item.label}</Typography>
                                    )}

                                    {!isCollapsed && item.badge && (
                                        <Box
                                            component="span"
                                            sx={{
                                                position: "relative",
                                                ml: "auto",
                                                flexShrink: 0,
                                                px: "8px",
                                                py: "2px",
                                                borderRadius: "999px",
                                                fontSize: "11px",
                                                fontWeight: 700,
                                                lineHeight: "16px",
                                                color: item.badge.color,
                                                bgcolor: `${item.badge.color}29`,
                                                border: `1px solid ${item.badge.color}52`,
                                            }}
                                        >
                                            {item.badge.label}
                                        </Box>
                                    )}
                                </Box>
                            </Tooltip>
                        );
                    })}
                </Box>

                {/* Logout */}
                <Box sx={{ position: "relative", flexShrink: 0, mt: "-28px", pt: "16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <Tooltip title={isCollapsed ? "Logout" : ""} placement="right" arrow>
                        <Box
                            component="button"
                            onClick={() => (onLogout ? onLogout() : logout())}
                            sx={{
                                ...navRowSx(isCollapsed),
                                borderRadius: "16px",
                                "&:hover": { background: "rgba(255,77,77,0.10)" },
                            }}
                        >
                            <Box sx={{ ...iconBoxSx, color: LOGOUT_COLOR }}>
                                <MdLogout />
                            </Box>
                            {!isCollapsed && <Typography sx={{ ...labelSx, color: LOGOUT_COLOR }}>Logout</Typography>}
                        </Box>
                    </Tooltip>
                </Box>
            </Box>

            {/* Mobile backdrop */}
            {mobileOpen && (
                <Box
                    onClick={() => setMobileOpen(false)}
                    sx={{ display: { md: "none" }, position: "fixed", inset: 0, bgcolor: "rgba(0,0,0,0.55)", zIndex: 299 }}
                />
            )}

            {/* ── Main area ── */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100%", overflow: "hidden", px: 2 }}>
                <Box component="header" sx={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 0.5, minHeight: 48, py: 1 }}>
                    <Box
                        component="button"
                        aria-label="Open menu"
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
                        {typeof headerTitle === "string" ? (
                            <Typography
                                component="h1"
                                noWrap
                                sx={{
                                    fontFamily: "var(--font-poppins), sans-serif",
                                    fontWeight: 500,
                                    fontSize: "20px",
                                    lineHeight: "30px",
                                    color: "#FFFFFF",
                                }}
                            >
                                {headerTitle}
                            </Typography>
                        ) : (
                            headerTitle
                        )}
                    </Box>
                </Box>

                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        overflowY: "auto",
                        overflowX: "hidden",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        "&::-webkit-scrollbar": { display: "none" },
                        p: 1,
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
}
