"use client";

import React, { useState, useRef } from "react";
import {
    Box,
    Typography,
    InputAdornment,
    TextField,
    Badge,
    Avatar,
    Paper,
    Divider,
    ClickAwayListener,
    Popper,
    Fade,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { MdSearch, MdNotificationsNone, MdPerson, MdLogout } from "react-icons/md";
import { BackgroundGray3D } from "@/components/backgrounds";

// ─── Types ─────────────────────────────────────────────────────────────────
interface StudentHeaderProps {
    title?: React.ReactNode | string;
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function StudentHeader({
    title,
}: StudentHeaderProps) {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const avatarRef = useRef<HTMLDivElement>(null);

    const avatarSrc = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"; // Replace with actual avatar source
    const userName = "Student Name"; // Replace with actual user name
    const unreadCount = 30; // Replace with actual unread notification count
    const handleSearchClick = () => router.push("/dashboard/student/search");
    const handleNotificationClick = () => router.push("/dashboard/student/notifications");
    const handleProfileClick = () => {
        router.push("/dashboard/student/profile");
        setMenuOpen(false);
    };
    const handleLogout = () => {
        setMenuOpen(false);
        // TODO: call your auth sign-out here
        router.push("/");
    };

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1.5,
            }}
        >
            {/* ── Title ── */}
            <Box sx={{ flexShrink: 0 }}>
                {typeof title === "string" ? (
                    <Typography
                        sx={{
                            fontSize: "1rem",
                            fontWeight: 700,
                            color: "#fff",
                            letterSpacing: "-0.01em",
                            lineHeight: 1,
                        }}
                    >
                        {title}
                    </Typography>
                ) : (
                    title
                )}
            </Box>

            {/* ── Right cluster ── */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, ml: "auto" }}>
                {/* Search bar (click → search page) */}
                <BackgroundGray3D>
                    <Box
                        onClick={handleSearchClick}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            borderRadius: "10px",
                            cursor: "pointer",
                            p: 0.6,
                            padding: "0.5rem 1rem",
                        }}
                    >

                        <MdSearch size={15} color="rgba(255, 255, 255, 0.97)" style={{ flexShrink: 0 }} />
                        <Typography
                            sx={{
                                display: { xs: "none", sm: "block" },
                                fontSize: "0.75rem",
                                color: "rgba(255, 255, 255, 0.73)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                userSelect: "none",
                            }}
                        >
                            Search courses, notes, assignments...
                        </Typography>
                    </Box>
                </BackgroundGray3D>

                {/* Notification bell */}
                <BackgroundGray3D>

                    <Box
                        onClick={handleNotificationClick}
                        sx={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                            p: 0.6,
                            borderRadius: "8px",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                            transition: "background 0.18s",
                        }}
                    >
                        <MdNotificationsNone size={19} color="rgba(255,255,255,0.7)" />
                        <div className="flex px-20 py-0.5 bg-orange-100 rounded-[999px]  gap-2" style={{
                            padding: "0.1rem 0.4rem",
                        }}>
                            <div className=" text-amber-500 text-xs ">2 unread</div>
                        </div>
                    </Box>
                </BackgroundGray3D>

                {/* Avatar + dropdown */}
                <Box ref={avatarRef}>
                    <Avatar
                        src={avatarSrc}
                        alt={userName ?? "Student"}
                        onClick={() => setMenuOpen((o) => !o)}
                        sx={{
                            width: 24,
                            height: 24,
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            bgcolor: "#1e3a8a",
                            transition: "border 0.18s",
                        }}
                    >
                        {!avatarSrc && (userName?.[0]?.toUpperCase() ?? "S")}
                    </Avatar>
                </Box>
            </Box>

            {/* ── Profile dropdown ── */}
            <Popper
                open={menuOpen}
                anchorEl={avatarRef.current}
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
                                        mt: 1,
                                        minWidth: 160,
                                        bgcolor: "rgba(3, 3, 3, 0.96)",
                                        border: "1px solid rgba(255, 255, 255, 0.88)",
                                        borderRadius: "12px",
                                        overflow: "hidden",
                                    }}
                                >
                                    {/* My Account */}
                                    <Box
                                        onClick={handleProfileClick}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.25,
                                            px: 1.75,
                                            py: 1.1,
                                            cursor: "pointer",
                                            color: "rgba(255,255,255,0.8)",
                                            "&:hover": {
                                                bgcolor: "rgba(0, 25, 79, 0.12)",
                                                color: "#fff",
                                            },
                                            transition: "background 0.15s, color 0.15s",
                                        }}
                                    >
                                        <MdPerson size={16} />
                                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 500 }}>
                                            My Account
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ borderColor: "rgba(255,255,255,0.07)" }} />

                                    {/* Logout */}
                                    <Box
                                        onClick={handleLogout}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.25,
                                            px: 1.75,
                                            py: 1.1,
                                            cursor: "pointer",
                                            color: "rgba(255,100,100,0.85)",
                                            "&:hover": {
                                                bgcolor: "rgba(255,80,80,0.1)",
                                                color: "#ff6b6b",
                                            },
                                            transition: "background 0.15s, color 0.15s",
                                        }}
                                    >
                                        <MdLogout size={16} />
                                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 500 }}>
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
