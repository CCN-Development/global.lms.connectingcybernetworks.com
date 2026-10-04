"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Typography,
    Avatar,
    Paper,
    ClickAwayListener,
    Popper,
    Fade,
} from "@mui/material";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getProfileCompletion, useStudent } from "@/contexts/StudentContext";
import { useAuth } from "@/contexts/AuthContext";

// ─── Types ─────────────────────────────────────────────────────────────────
interface StudentHeaderProps {
    title?: React.ReactNode | string;
}

// ─── Design tokens ─────────────────────────────────────────────────────────
const PILL_FILL = "linear-gradient(180deg, rgba(187,201,237,0.16) 0%, rgba(106,114,135,0.096) 100%)";
const PILL_STROKE = "linear-gradient(180deg, rgba(227,233,248,0.24) 0%, rgba(134,137,146,0) 100%)";
/** Avatar ring: the design's soft purple arc, with its sweep driven by profile completion. */
const completionRing = (percent: number) => {
    const filled = Math.min(Math.max(percent, 0), 100);
    const fade = Math.min(filled, 18);
    return `conic-gradient(from 0deg, #8C24FF 0% ${filled - fade}%, rgba(140,36,255,0) ${filled}% 100%)`;
};
const ORB_RING = "linear-gradient(180deg, #FFFFFF 0%, #19B214 25%, #D812C4 50%, #A41014 75%, #EFE93B 100%)";
const ORB_FILL = "radial-gradient(circle 114.74px at 24.1px 87.2px, #FFFFFF 0%, #4F46E5 20%, #1E1B4B 60%, #0F172A 100%)";
const ACTION_BUTTON = "linear-gradient(90deg, #0027AC 0%, #0B22AC 12.5%, #161DAC 25%, #2C14AC 43.572%, #4608AC 65.007%, #4F04AC 82.544%, #5900AC 100%)";

/** Profile panel is 317px of content, inbox panel 392px, both plus 24px side padding. */
const MENU_WIDTH = 365;
const MENU_CONTENT_WIDTH = 317;
const INBOX_WIDTH = 440;

/** Shared glass chrome for the header poppers. */
const panelSx = (angle: string) => ({
    mt: "12px",
    maxWidth: "calc(100vw - 24px)",
    display: "flex",
    flexDirection: "column" as const,
    px: "24px",
    pt: "12px",
    pb: "24px",
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,0.88)",
    bgcolor: "transparent",
    backgroundImage: `linear-gradient(${angle}, rgba(0,0,0,0.88) 0%, rgba(10,9,9,0.64) 66.942%, rgba(102,102,102,0.64) 133.88%)`,
    backdropFilter: "blur(100px)",
    boxShadow: "0 2px 17.5px rgba(255,255,255,0.25), inset 0 3px 6px rgba(255,255,255,0.16)",
    overflow: "hidden",
});

/** Figma strokes are gradients, so they are painted on a masked pseudo-element. */
const gradientBorder = (paint: string, width: string, radius: string) => ({
    content: '""',
    position: "absolute" as const,
    inset: `-${width}`,
    borderRadius: radius,
    padding: width,
    backgroundImage: paint,
    WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
    pointerEvents: "none" as const,
});

function capitalizeFirstLetterOfAllWords(str: string) {
    return str.split(" ").map(word => word.toLowerCase().charAt(0).toUpperCase() + word.toLowerCase().slice(1)).join(" ");
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function StudentHeader({
    title,
}: StudentHeaderProps) {
    const router = useRouter();
    const { profile, getProfile } = useStudent();
    const [menuOpen, setMenuOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const [inboxOpen, setInboxOpen] = useState(false);
    const [inboxAnchorEl, setInboxAnchorEl] = useState<HTMLDivElement | null>(null);
    const { logout } = useAuth();
    useEffect(() => {
        if (!profile) void getProfile();
    }, [profile, getProfile]);

    const avatarSrc = profile?.studentPhoto ?? "";
    const userName = capitalizeFirstLetterOfAllWords(profile?.studentName ?? "Student");
    const userStatus = profile?.isActive ? "Active" : "Inactive";
    const profileCompletion = useMemo(() => getProfileCompletion(profile).percentage, [profile]);
    const unreadCount = 2; // Replace with actual unread notification count
    const handleSearchClick = () => router.push("/dashboard/student/search");
    const handleAishClick = () => router.push("/dashboard/student/aish-chat");
    const handleSeeAllNotifications = () => {
        router.push("/dashboard/student/notifications");
        setInboxOpen(false);
    };
    const handleProfileClick = () => {
        router.push("/dashboard/student/profile");
        setMenuOpen(false);
    };
    const handleSettingsClick = () => {
        router.push("/dashboard/student/settings");
        setMenuOpen(false);
    };
    const handleLogout = () => {
        setMenuOpen(false);
        logout();
        router.push("/");
    };

    const menuItems = [
        { label: "View Profile", icon: "/header/icon-user.svg", onClick: handleProfileClick },
        { label: "Settings", icon: "/header/icon-settings.svg", onClick: handleSettingsClick },
    ];

    const divider = (
        <Box sx={{ lineHeight: 0, width: "100%" }}>
            <Image src="/header/menu-divider.svg" alt="" width={MENU_CONTENT_WIDTH} height={1} />
        </Box>
    );

    // Replace with real inbox data
    const notifications = [
        {
            id: "1",
            title: "Security Update: Token Management",
            body: "Secure your integration with the new token management system to safeguard your API keys.",
            time: "Yesterday at 9:42 AM",
            unread: true,
        },
        {
            id: "2",
            title: "Security Update: Token Management",
            body: "Secure your integration with the new token management system to safeguard your API keys.",
            time: "Yesterday at 9:42 AM",
            action: "Verify Now",
        },
        {
            id: "3",
            title: "Security Update: Token Management",
            body: "Secure your integration with the new token management system to safeguard your API keys.",
        },
    ];

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                width: "100%",
            }}
        >
            {/* ── Title ── */}
            <Box sx={{ minWidth: 0 }}>
                {typeof title === "string" ? (
                    <Typography
                        sx={{
                            fontFamily: "var(--font-poppins)",
                            fontWeight: 500,
                            fontSize: { xs: "1.25rem", sm: "1.5rem", lg: "22px" },
                            lineHeight: { xs: 1.4, lg: "48px" },
                            color: "#fff",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {title}
                    </Typography>
                ) : (
                    title || <Typography
                        sx={{
                            fontFamily: "var(--font-poppins)",
                            fontWeight: 500,
                            fontSize: { xs: "1.25rem", sm: "1.5rem", lg: "32px" },
                            lineHeight: { xs: 1.4, lg: "48px" },
                            color: "#fff",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        <span className="font-semibold text-gray-500">Hi,</span> {userName}
                    </Typography>
                )}
            </Box>

            {/* ── Right cluster ── */}
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: "8px", sm: "16px" }, ml: "auto", flexShrink: 0 }}>
                {/* Search bar (click → search page) */}
                <Box
                    onClick={handleSearchClick}
                    sx={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        height: 48,
                        px: { xs: "12px", md: "16px" },
                        py: "8px",
                        borderRadius: "99px",
                        background: PILL_FILL,
                        cursor: "pointer",
                        flexShrink: 1,
                        minWidth: 0,
                        "&::before": gradientBorder(PILL_STROKE, "1px", "99px"),
                    }}
                >
                    <Image src="/header/icon-search.svg" alt="" width={24} height={24} />
                    <Typography
                        sx={{
                            display: { xs: "none", md: "block" },
                            fontSize: "16px",
                            lineHeight: "25px",
                            color: "#A6A6A6",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            userSelect: "none",
                        }}
                    >
                        Search courses, notes, assignments...
                    </Typography>
                </Box>

                {/* CCN brand orb */}
                <Box
                    role="button"
                    tabIndex={0}
                    aria-label="Open AI Assistant"
                    onClick={handleAishClick}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleAishClick();
                        }
                    }}
                    sx={{
                        position: "relative",
                        width: 48,
                        height: 48,
                        flexShrink: 0,
                        borderRadius: "24px",
                        background: ORB_FILL,
                        boxShadow:
                            "0 0 14.77px rgba(79,70,229,0.3), 0 3.69px 11.08px rgba(0,0,0,0.6), inset 1.85px 1.85px 3.69px rgba(255,255,255,0.3), inset -4.62px -4.62px 7.38px rgba(0,0,0,0.5)",
                        display: { xs: "none", sm: "block" },
                        cursor: "pointer",
                        transition: "transform 0.18s ease",
                        "&:hover": { transform: "scale(1.06)" },
                        "&::before": gradientBorder(ORB_RING, "0.754px", "24px"),
                    }}
                >
                    <Box sx={{ position: "absolute", left: "11.71px", top: "10.23px" }}>
                        <Image src="/header/ccn-orb-mark.svg" alt="" width={24.7385} height={27.8123} />
                    </Box>
                </Box>

                {/* Notification bell */}
                <Box
                    ref={setInboxAnchorEl}
                    onClick={() => setInboxOpen((o) => !o)}
                    sx={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        height: 48,
                        pl: "8px",
                        pr: { xs: "8px", sm: "12px" },
                        py: "8px",
                        borderRadius: "99px",
                        background: PILL_FILL,
                        cursor: "pointer",
                        flexShrink: 0,
                        "&::before": gradientBorder(PILL_STROKE, "1px", "99px"),
                    }}
                >
                    <Image src="/header/icon-bell.svg" alt="Notifications" width={28} height={28} />
                    <Box
                        sx={{
                            display: { xs: "none", sm: "flex" },
                            alignItems: "center",
                            justifyContent: "center",
                            px: "8px",
                            py: "2px",
                            borderRadius: "999px",
                            bgcolor: "#FFEFDC",
                        }}
                    >
                        <Typography sx={{ fontSize: "12px", lineHeight: "18px", color: "#FB8600", whiteSpace: "nowrap" }}>
                            {unreadCount} unread
                        </Typography>
                    </Box>
                    <Box sx={{ position: "absolute", left: "32px", top: "10px", lineHeight: 0 }}>
                        <Image src="/header/bell-dot.svg" alt="" width={4} height={4} />
                    </Box>
                </Box>

                {/* Avatar + dropdown */}
                <Box
                    ref={setAnchorEl}
                    onClick={() => setMenuOpen((o) => !o)}
                    sx={{
                        position: "relative",
                        width: 48,
                        height: 48,
                        flexShrink: 0,
                        borderRadius: "50%",
                        bgcolor: "#E3E9F8",
                        cursor: "pointer",
                        "&::before": gradientBorder(completionRing(profileCompletion), "4px", "50%"),
                    }}
                >
                    <Avatar
                        src={avatarSrc || undefined}
                        alt={userName}
                        sx={{ width: 48, height: 48, fontSize: "1rem", bgcolor: "#1e3a8a" }}
                    >
                        {userName.charAt(0).toUpperCase()}
                    </Avatar>
                </Box>
            </Box>

            {/* ── Notification inbox ── */}
            <Popper
                open={inboxOpen}
                anchorEl={inboxAnchorEl}
                placement="bottom-end"
                transition
                style={{ zIndex: 1300 }}
            >
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={160}>
                        <div>
                            <ClickAwayListener onClickAway={() => setInboxOpen(false)}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        ...panelSx("155.5deg"),
                                        width: INBOX_WIDTH,
                                        gap: "12px",
                                    }}
                                >
                                    {/* Top menu bar */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            px: "16px",
                                            pt: "12px",
                                            pb: "8px",
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: "2px" }}>
                                            <Typography sx={{ fontSize: "16px", lineHeight: "24px", fontWeight: 500, color: "#D9D9D9" }}>
                                                Inbox
                                            </Typography>
                                            <Image src="/header/icon-arrow-down-s.svg" alt="" width={20} height={20} />
                                        </Box>

                                        <Box
                                            onClick={handleSeeAllNotifications}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                py: "4px",
                                                borderRadius: "12px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <Typography sx={{ fontSize: "14px", lineHeight: "21px", fontWeight: 500, color: "#93A9E2", whiteSpace: "nowrap" }}>
                                                See All
                                            </Typography>
                                            <Box sx={{ display: "flex", lineHeight: 0, transform: "scaleX(-1)" }}>
                                                <Image src="/header/icon-arrow-right-blue.svg" alt="" width={20} height={20} />
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Notifications */}
                                    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                                        {notifications.map((n) => (
                                            <Box
                                                key={n.id}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    gap: "12px",
                                                    p: "16px",
                                                    width: "100%",
                                                    bgcolor: n.unread ? "rgba(140,36,255,0.08)" : "transparent",
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        width: 32,
                                                        height: 32,
                                                        flexShrink: 0,
                                                        borderRadius: "999px",
                                                        bgcolor: "#D9D9D9",
                                                    }}
                                                >
                                                    <Image src="/header/icon-notification-fill.svg" alt="" width={24} height={24} />
                                                </Box>

                                                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", flex: "1 0 0", minWidth: 0 }}>
                                                    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                                                            <Typography sx={{ flex: "1 0 0", minWidth: 0, fontSize: "14px", lineHeight: "21px", fontWeight: 500, color: "#fff" }}>
                                                                {n.title}
                                                            </Typography>
                                                            {n.unread && (
                                                                <Box sx={{ display: "flex", alignItems: "center", px: "7px", lineHeight: 0 }}>
                                                                    <Image src="/header/unread-dot.svg" alt="Unread" width={6} height={6} />
                                                                </Box>
                                                            )}
                                                        </Box>
                                                        <Typography sx={{ fontSize: "14px", lineHeight: "21px", fontWeight: 500, color: "#A6A6A6", opacity: 0.9, maxWidth: 530 }}>
                                                            {n.body}
                                                        </Typography>
                                                    </Box>

                                                    {n.action && (
                                                        <Box
                                                            component="button"
                                                            sx={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                width: 97,
                                                                height: 28,
                                                                px: "16px",
                                                                border: "none",
                                                                borderRadius: "4px",
                                                                cursor: "pointer",
                                                                background: ACTION_BUTTON,
                                                                boxShadow: "0 0 8px rgba(255,255,255,0.12)",
                                                            }}
                                                        >
                                                            <Typography sx={{ fontSize: "12px", lineHeight: "18px", fontWeight: 500, color: "#fff", whiteSpace: "nowrap" }}>
                                                                {n.action}
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    {n.time && (
                                                        <Typography
                                                            sx={{
                                                                fontSize: "12px",
                                                                lineHeight: "18px",
                                                                fontWeight: 500,
                                                                color: "#737373",
                                                                opacity: n.unread ? 0.5 : 1,
                                                            }}
                                                        >
                                                            {n.time}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Paper>
                            </ClickAwayListener>
                        </div>
                    </Fade>
                )}
            </Popper>

            {/* ── Profile dropdown ── */}
            <Popper
                open={menuOpen}
                anchorEl={anchorEl}
                placement="bottom-end"
                transition
                style={{ zIndex: 1300 }}
            >
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={160}>
                        <div>
                            <ClickAwayListener onClickAway={() => setMenuOpen(false)}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        ...panelSx("159.4deg"),
                                        width: MENU_WIDTH,
                                        gap: "16px",
                                    }}
                                >
                                    {/* Identity */}
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", py: "8px" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
                                            <Box
                                                sx={{
                                                    position: "relative",
                                                    width: 54,
                                                    height: 54,
                                                    flexShrink: 0,
                                                    borderRadius: "50%",
                                                    bgcolor: "#E3E9F8",
                                                    "&::before": gradientBorder(completionRing(profileCompletion), "4px", "50%"),
                                                }}
                                            >
                                                <Avatar src={avatarSrc || undefined} alt={userName} sx={{ width: 54, height: 54, bgcolor: "#1e3a8a" }}>
                                                    {userName.charAt(0).toUpperCase()}
                                                </Avatar>
                                            </Box>

                                            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                                                <Typography
                                                    sx={{
                                                        fontSize: "18px",
                                                        lineHeight: "27px",
                                                        fontWeight: 500,
                                                        color: "#fff",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }}
                                                >
                                                    {userName}
                                                </Typography>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <Typography sx={{ fontSize: "14px", lineHeight: "21px", fontWeight: 500, color: "#A6A6A6", opacity: 0.9 }}>
                                                        {userStatus}
                                                    </Typography>
                                                    <Box sx={{ display: "flex", lineHeight: 0, transform: "rotate(90deg)" }}>
                                                        <Image src="/header/icon-chevron-right-16.svg" alt="" width={16} height={16} />
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Box sx={{ px: "8px", py: "2px", borderRadius: "999px", bgcolor: "#E8D6FD", flexShrink: 0 }}>
                                            <Typography sx={{ fontSize: "12px", lineHeight: "18px", fontWeight: 500, color: "#8C24FF", whiteSpace: "nowrap" }}>
                                                {profileCompletion}% complete
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {divider}

                                    {/* Actions */}
                                    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                                        {menuItems.map(({ label, icon, onClick }) => (
                                            <Box
                                                key={label}
                                                onClick={onClick}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "32px",
                                                    p: "16px",
                                                    borderRadius: "8px",
                                                    cursor: "pointer",
                                                    "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                                                    transition: "background 0.15s",
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center", gap: "12px", flex: "1 0 0", minWidth: 0 }}>
                                                    <Image src={icon} alt="" width={24} height={24} />
                                                    <Typography sx={{ fontSize: "16px", lineHeight: "24px", fontWeight: 500, color: "#D9D9D9" }}>
                                                        {label}
                                                    </Typography>
                                                </Box>
                                                <Image src="/header/icon-chevron-right.svg" alt="" width={24} height={24} />
                                            </Box>
                                        ))}
                                    </Box>

                                    {divider}

                                    {/* Logout */}
                                    <Box
                                        onClick={handleLogout}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            p: "16px",
                                            borderRadius: "8px",
                                            bgcolor: "rgba(209,41,61,0.04)",
                                            cursor: "pointer",
                                            "&:hover": { bgcolor: "rgba(209,41,61,0.12)" },
                                            transition: "background 0.15s",
                                        }}
                                    >
                                        <Image src="/header/icon-log-out.svg" alt="" width={24} height={24} />
                                        <Typography sx={{ fontSize: "16px", lineHeight: "24px", fontWeight: 500, color: "#D1293D" }}>
                                            Logout
                                        </Typography>
                                    </Box>
                                </Paper>
                            </ClickAwayListener>
                        </div>
                    </Fade>
                )}
            </Popper>
        </Box>
    );
}
