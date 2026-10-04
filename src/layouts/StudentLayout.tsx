"use client";

import React, { useState } from "react";
import { Box, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Calendar } from "lucide-react";
import { MdMenu } from "react-icons/md";

// ─── Types ─────────────────────────────────────────────────────────────────
interface StudentLayoutProps {
    children: React.ReactNode | React.ReactNode[] | React.ReactElement | React.ReactElement[];
    header?: React.ReactNode;
}

interface NavItem {
    label: string;
    href: string;
    /** Path to an SVG in /public, or an icon component when no design asset exists. */
    icon: string | React.ElementType;
    rotate180?: boolean;
}

// ─── Nav Items ─────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
    { label: "Home", icon: "/sidebar/icon-home.svg", href: "/dashboard/student/overview" },
    { label: "My Courses", icon: "/sidebar/icon-school-mgmt.svg", href: "/dashboard/student/my-courses" },
    { label: "My Batches", icon: "/sidebar/icon-book-open.svg", href: "/dashboard/student/batches" },
    { label: "Attendance", icon: Calendar, href: "/dashboard/student/attendance" },
    { label: "Exam", icon: "/sidebar/icon-file-text.svg", href: "/dashboard/student/exams" },
    { label: "Practice Labs", icon: "/sidebar/icon-filter.svg", rotate180: true, href: "/dashboard/student/practice-labs" },
    { label: "Placement", icon: "/sidebar/icon-briefcase.svg", href: "/dashboard/student/placement" },
    { label: "My Requests", icon: "/sidebar/icon-send.svg", href: "/dashboard/student/requests" },
    { label: "Chats", icon: "/sidebar/icon-message-circle.svg", href: "/dashboard/chats" },
    { label: "News & Updates", icon: "/sidebar/icon-volume-2.svg", href: "/dashboard/student/updates" },
    { label: "CCN Community", icon: "/sidebar/icon-shield.svg", href: "/dashboard/student/community" },
];

// ─── Constants ─────────────────────────────────────────────────────────────
const SIDEBAR_EXPANDED = 280;
const SIDEBAR_COLLAPSED = 88;

/** Figma's three stacked stroke paints: top-left glow, bottom-right glow, flat 10% white. */
const BORDER_PAINT = [
    "linear-gradient(rgba(255,255,255,0.10), rgba(255,255,255,0.10))",
    "linear-gradient(291deg, rgba(255,255,255,0.24) 3%, rgba(255,255,255,0) 47%)",
    "linear-gradient(105deg, rgba(255,255,255,0.24) 8%, rgba(153,153,153,0) 35%)",
].join(", ");

const ACTIVE_GRADIENT =
    "linear-gradient(-89.946deg, rgba(0,11,53,0.47) 9.562%, rgba(0,20,93,0.94) 22.862%, rgba(0,30,132,0.97) 61.425%, rgb(0,39,172) 99.988%)";

/** Blurred streaks layered behind the active nav item, positioned as in the design. */
const ACTIVE_GLOWS = [
    { src: "/sidebar/glow-line-2.svg", left: -6, top: -23, width: 198, height: 39 },
    { src: "/sidebar/glow-line-3.svg", left: 95, top: -19, width: 198, height: 39 },
    { src: "/sidebar/glow-line-1.svg", left: -43, top: 42, width: 198, height: 37 },
    { src: "/sidebar/glow-line-5.svg", left: 9, top: 44, width: 198, height: 41 },
];

// ─── Component ─────────────────────────────────────────────────────────────
export default function StudentLayout({ children, header }: StudentLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width:900px)");
    const pathname = usePathname();
    const router = useRouter();

    const isCollapsed = collapsed && !isMobile;
    const sidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

    return (
        <Box
            sx={{
                display: "flex",
                height: "100vh",
                overflow: "hidden",
                color: "#fff",
                p: "10px",
            }}
        >
            {/* ── Sidebar ── */}
            <Box
                component="aside"
                sx={{
                    width: { xs: SIDEBAR_EXPANDED, md: sidebarWidth },
                    minWidth: { xs: SIDEBAR_EXPANDED, md: sidebarWidth },
                    position: { xs: "fixed", md: "sticky" },
                    top: 0,
                    left: { xs: 0, md: "auto" },
                    height: { xs: "100vh", md: "100%" },
                    transform: { xs: mobileOpen ? "translateX(0)" : "translateX(-110%)", md: "none" },
                    display: "flex",
                    flexDirection: "column",
                    gap: "44px",
                    backdropFilter: "blur(4px)",
                    bgcolor: { xs: "rgba(9,9,21,0.96)", md: "rgba(9,9,21,0.44)" },
                    border: "none",
                    borderRadius: { xs: "0 32px 32px 0", md: "32px" },
                    p: isCollapsed ? "24px 14px" : "24px",
                    transition: "width 0.25s ease, min-width 0.25s ease, padding 0.25s ease, transform 0.28s cubic-bezier(0.4,0,0.2,1)",
                    zIndex: { xs: 300, md: 100 },
                    overflow: "hidden",
                    // 1px gradient stroke, masked so it follows the rounded corners
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        borderRadius: "inherit",
                        padding: "1px",
                        backgroundImage: BORDER_PAINT,
                        WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                        pointerEvents: "none",
                        zIndex: 2,
                    },
                }}
            >
                {/* Ambient background blobs */}
                <Box
                    aria-hidden
                    sx={{
                        position: "absolute",
                        top: "73.1%",
                        left: "116px",
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "none",
                    }}
                >
                    <Image src="/sidebar/glow-blob-a.svg" alt="" width={909} height={909} />
                </Box>
                <Box
                    aria-hidden
                    sx={{
                        position: "absolute",
                        top: "55.1%",
                        left: "24px",
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "none",
                    }}
                >
                    <Image src="/sidebar/glow-blob-b.svg" alt="" width={723} height={723} />
                </Box>

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

                    {/* Collapse toggle */}
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
                            background: "linear-gradient(180deg, rgba(187,201,237,0.08) 0%, rgba(106,114,135,0.08) 100%)",
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
                    {NAV_ITEMS.map(({ label, icon, href, rotate180 }) => {
                        const isActive = pathname === href || pathname.startsWith(href + "/");
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
                                            background: isActive ? ACTIVE_GRADIENT : "rgba(255,255,255,0.05)",
                                        },
                                    }}
                                >
                                    {isActive && !isCollapsed && (
                                        <>
                                            {ACTIVE_GLOWS.map((glow) => (
                                                <Box
                                                    key={glow.src}
                                                    aria-hidden
                                                    sx={{ position: "absolute", left: glow.left, top: glow.top, pointerEvents: "none" }}
                                                >
                                                    <Image src={glow.src} alt="" width={glow.width} height={glow.height} />
                                                </Box>
                                            ))}
                                            <Box
                                                aria-hidden
                                                sx={{
                                                    position: "absolute",
                                                    left: "231px",
                                                    top: "99px",
                                                    transform: "translate(-50%, -50%) rotate(90deg)",
                                                    pointerEvents: "none",
                                                }}
                                            >
                                                <Image src="/sidebar/glow-line-4.svg" alt="" width={198} height={39} />
                                            </Box>
                                        </>
                                    )}

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
                                            <IconComponent size={28} strokeWidth={1.5} color="#D9D9D9" />
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
                                                color: isActive ? "#FFFFFF" : "#D9D9D9",
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
                    px: 2,
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
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        "&::-webkit-scrollbar": { display: "none" },
                        p: 1
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
}
