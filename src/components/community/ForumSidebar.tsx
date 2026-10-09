"use client";

import React, { useMemo } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { FONT_INTER, gradientBorder } from "@/components/aish/tokens";
import { CC, CURRENT_USER_ID, FEED_MENU, FeedFilter, Post } from "./community-data";
import { darkScroll, ellipsis, Icon, LmsButton, TEXT } from "./community-ui";

export function countFor(posts: Post[], filter: FeedFilter) {
    switch (filter) {
        case "all":
            return posts.length;
        case "pinned":
            return posts.filter((p) => p.pinnedBy).length;
        case "mine":
            return posts.filter((p) => p.author.id === CURRENT_USER_ID).length;
        case "saved":
            return posts.filter((p) => p.saved).length;
        default:
            return posts.filter((p) => p.categoryId === filter).length;
    }
}

interface ForumSidebarProps {
    posts: Post[];
    active: FeedFilter | null;
    onSelect: (filter: FeedFilter) => void;
    onNewDiscussion: () => void;
}

export default function ForumSidebar({ posts, active, onSelect, onNewDiscussion }: ForumSidebarProps) {
    const counts = useMemo(() => Object.fromEntries(FEED_MENU.map((m) => [m.id, countFor(posts, m.id)])), [posts]);

    return (
        <Box
            component="nav"
            aria-label="Community menu"
            sx={{
                position: "relative",
                display: { xs: "none", lg: "flex" },
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "24px",
                width: { lg: 260, xl: 298 },
                flexShrink: 0,
                height: "100%",
                p: { lg: "24px", xl: "32px" },
                borderRadius: "32px",
                bgcolor: "rgba(9,9,21,0.44)",
                backdropFilter: "blur(4px)",
                overflow: "hidden",
                "&::before": gradientBorder(),
            }}
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", minHeight: 0 }}>
                <Typography sx={{ ...TEXT.reg14, color: CC.n500 }}>MENU</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto", mx: "-4px", px: "4px", ...darkScroll }}>
                    {FEED_MENU.map((item) => {
                        const isActive = active === item.id;
                        return (
                            <ButtonBase
                                key={item.id}
                                onClick={() => onSelect(item.id)}
                                aria-current={isActive ? "page" : undefined}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "12px",
                                    width: "100%",
                                    px: "16px",
                                    py: "12px",
                                    flexShrink: 0,
                                    borderRadius: "16px",
                                    backgroundImage: isActive ? CC.menuActive : "none",
                                    transition: "background-color .15s ease",
                                    "&:hover": { bgcolor: isActive ? "transparent" : "rgba(255,255,255,0.04)" },
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                                    <Icon name={item.icon} size={24} rotate={item.rotateIcon ? 180 : undefined} />
                                    <Typography sx={{ ...TEXT.med14, color: CC.n100, ...ellipsis }}>{item.label}</Typography>
                                </Box>
                                <Typography sx={{ fontFamily: FONT_INTER, fontSize: "12px", lineHeight: "18px", color: CC.n300 }}>
                                    {counts[item.id]}
                                </Typography>
                            </ButtonBase>
                        );
                    })}
                </Box>
            </Box>

            <LmsButton onClick={onNewDiscussion} icon={<Icon name="icon-plus.svg" size={20} sx={{ position: "relative" }} />} sx={{ width: "100%", flexShrink: 0 }}>
                New Discussion
            </LmsButton>
        </Box>
    );
}
