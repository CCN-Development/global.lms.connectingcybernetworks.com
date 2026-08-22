"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    MdMenu,
    MdClose,
    MdChevronLeft,
    MdChevronRight,
    MdSearch,
    MdNotificationsNone,
    MdPerson,
    MdLogout,
    MdKeyboardArrowDown,
} from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";

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
    /** Notification count shown on the bell */
    notificationCount?: number;
    /** Avatar URL for the top-right user menu */
    avatarSrc?: string;
    userName?: string;
    userRole?: string;
    onLogout?: () => void;
    onProfileClick?: () => void;
    onNotificationClick?: () => void;
    onSearchClick?: () => void;
};

// ─── Constants ──────────────────────────────────────────────────────────────
const SIDEBAR_W_EXPANDED = 220;
const SIDEBAR_W_COLLAPSED = 68;

// ─── DashboardLayout ────────────────────────────────────────────────────────
export default function DashboardLayout({
    children,
    headerTitle,
    navItems = [],
    notificationCount = 0,
    avatarSrc,
    userName = "User",
    userRole,
    onProfileClick,
    onNotificationClick,
    onSearchClick,
}: Props) {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const sidebarW = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED;

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f0f2f7]">

            {/* ── Mobile backdrop ───────────────────────────────────────── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-298 bg-black/40 backdrop-blur-sm md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── Sidebar ───────────────────────────────────────────────── */}
            <aside
                style={{ width: sidebarW, minWidth: sidebarW }}
                className={cn(
                    "fixed top-0 left-0 z-299 flex h-screen flex-col bg-[#fafafa] border-r border-gray-200/80",
                    "shadow-[4px_0_24px_rgba(0,0,0,0.07)]",
                    "transition-[width,min-width,transform] duration-300 ease-in-out",
                    "md:static md:translate-x-0 md:h-full",
                    mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                )}
            >
                {/* Logo row */}
                <div
                    className={cn(
                        "flex items-center border-b border-gray-200/70 bg-white px-3 py-3.5",
                        collapsed ? "justify-center" : "justify-between",
                    )}
                >
                    {!collapsed && (
                        <Image
                            src="/Logo-Light-Theme.svg"
                            alt="CCN LMS Logo"
                            width={130}
                            height={32}
                            priority
                            className="object-contain"
                        />
                    )}

                    {/* Collapse toggle — desktop only */}
                    <button
                        onClick={() => setCollapsed((c) => !c)}
                        className="hidden md:flex items-center justify-center h-7 w-7 rounded-md bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors active:scale-90"
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? <MdChevronRight size={16} /> : <MdChevronLeft size={16} />}
                    </button>

                    {/* Mobile close */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="md:hidden flex items-center justify-center h-7 w-7 rounded-md text-gray-500 hover:bg-gray-100 transition-colors active:scale-90 ml-auto"
                        aria-label="Close menu"
                    >
                        <MdClose size={18} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex flex-1 flex-col gap-0.75 overflow-y-auto overflow-x-hidden px-2.5 py-3">
                    {navItems.map((item, idx) => {
                        const isActive =
                            item.isActive ??
                            (pathname === item.link || pathname?.startsWith(item.link + "/"));
                        return (
                            <Link
                                key={idx}
                                href={item.link}
                                title={collapsed ? item.label : undefined}
                                className={cn(
                                    "group flex items-center gap-2.5 rounded-md px-2 py-1.75 text-[13px] font-medium",
                                    "transition-all duration-150 select-none no-underline",
                                    "active:scale-[0.97] active:brightness-95",
                                    collapsed && "justify-center px-1.5",
                                    isActive
                                        ? "bg-blue-500 text-white"
                                        : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm",
                                )}
                                style={isActive ? { boxShadow: "0 2px 8px rgba(79,70,229,0.35)" } : {}}
                            >
                                {/* Elevated icon chip */}
                                <span
                                    className={cn(
                                        "flex shrink-0 items-center justify-center w-7.5 h-7.5 rounded-md text-[17px] transition-all duration-150",
                                        isActive
                                            ? "bg-white/20 text-white shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
                                            : "bg-white text-gray-500 shadow-[0_1px_4px_rgba(0,0,0,0.10)] group-hover:text-indigo-600 group-hover:shadow-[0_2px_8px_rgba(79,70,229,0.18)]",
                                    )}
                                >
                                    {item.icon}
                                </span>

                                {!collapsed && (
                                    <span className="flex-1 truncate leading-none tracking-[-0.01em]">
                                        {item.label}
                                    </span>
                                )}

                                {/* Badge */}
                                {!collapsed && item.badge && (
                                    <span
                                        className="ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold leading-none"
                                        style={{
                                            background: item.badge.color + "22",
                                            color: item.badge.color,
                                        }}
                                    >
                                        {item.badge.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout button */}
                <div className="shrink-0 border-t border-gray-200/70 px-2.5 py-3">
                    <button
                        onClick={() => { logout(); }}
                        title={collapsed ? "Logout" : undefined}
                        className={cn(
                            "group flex w-full gap-2.5   items-center  rounded-md px-2 py-1.75 text-[13px] font-medium",
                            "text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 select-none",
                            "active:scale-[0.97]",
                            collapsed && "justify-center px-1.5",
                        )}
                    >
                        <span className="flex shrink-0 items-center justify-center w-7.5 h-7.5 rounded-md bg-white text-red-400 shadow-[0_1px_4px_rgba(0,0,0,0.10)] text-[17px] group-hover:text-red-600">
                            <MdLogout />
                        </span>
                        {!collapsed && <span className="">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* ── Main column ───────────────────────────────────────────── */}
            <div className="flex flex-1 min-w-0 flex-col h-full overflow-hidden">

                {/* ── Top header ──────────────────────────────────────── */}
                <header className="flex shrink-0 items-center min-h-10 gap-3 bg-white border-b border-gray-100 px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="flex md:hidden items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
                        aria-label="Open menu"
                    >
                        <MdMenu size={20} />
                    </button>

                    {/* Page title */}
                    <div className="flex-1 min-w-0">
                        {typeof headerTitle === "string" ? (
                            <h1 className="truncate text-[15px] font-bold text-gray-800 leading-none">
                                {headerTitle}
                            </h1>
                        ) : (
                            headerTitle
                        )}
                    </div>
                </header>

                {/* ── Page content ────────────────────────────────────── */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-2 scrollbar-thin [scrollbar-color:#e2e8f0_transparent]">
                    {children}
                </main>
            </div>
        </div>
    );
}
