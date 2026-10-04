"use client";

import React, { useMemo, useState } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import Image from "next/image";
import { asset, EdgeGlows, GlassCard, lato, rowSurface, RowGlows } from "./shared";
import { UPDATES, type UpdateCategory, type UpdateItem } from "./data";

type TabKey = "all" | "alert" | "announcement";

const TAG: Partial<Record<UpdateCategory, { label: string; icon: string }>> = {
    announcement: { label: "Latest News", icon: "icon-menu.svg" },
    blog: { label: "Blog", icon: "icon-file-text.svg" },
};

const ACTIVE_TAB_STROKE = "linear-gradient(180deg, #E3E9F8 0%, rgba(227,233,248,0.24) 100%)";

interface UpdatesFeedProps {
    updates?: UpdateItem[];
    onOpen?: (update: UpdateItem) => void;
}

function UpdateRow({ update, onOpen }: { update: UpdateItem; onOpen?: () => void }) {
    const tag = TAG[update.category];

    return (
        <ButtonBase
            onClick={onOpen}
            sx={{
                ...rowSurface,
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                width: "100%",
                px: "16px",
                py: "12px",
                borderRadius: "12px",
                textAlign: "left",
                bgcolor: "rgba(9,8,8,0.08)",
                backdropFilter: "blur(4px)",
                transition: "background-color 0.2s ease",
                "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
            }}
        >
            <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                <Typography noWrap sx={lato(16, 24, 500, "#FFFFFF")}>
                    {update.title}
                </Typography>
                {update.description && (
                    <Typography sx={lato(14, 21, 400, "#A6A6A6")}>{update.description}</Typography>
                )}
                {tag && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Image src={asset(tag.icon)} alt="" width={14} height={14} style={{ transform: "scaleX(-1)" }} />
                            <Typography sx={{ ...lato(12, 18, 500, "#A6A6A6"), whiteSpace: "nowrap" }}>{tag.label}</Typography>
                        </Box>
                        {update.date && (
                            <>
                                <Image src={asset("upd-dot.svg")} alt="" width={6} height={6} />
                                <Typography sx={{ ...lato(12, 18, 500, "#A6A6A6"), whiteSpace: "nowrap" }}>{update.date}</Typography>
                            </>
                        )}
                    </Box>
                )}
            </Box>
            <Typography sx={{ ...lato(12, 18, 500, "#737373"), whiteSpace: "nowrap", flexShrink: 0 }}>{update.timeAgo}</Typography>
            <RowGlows bottomOffset={-2} />
        </ButtonBase>
    );
}

export default function UpdatesFeed({ updates = UPDATES, onOpen }: UpdatesFeedProps) {
    const [tab, setTab] = useState<TabKey>("all");

    const tabs = useMemo(
        () => [
            { key: "all" as const, label: "All" },
            { key: "alert" as const, label: `Alerts (${updates.filter((u) => u.category === "alert").length})` },
            {
                key: "announcement" as const,
                label: `Announcements (${updates.filter((u) => u.category === "announcement").length})`,
            },
        ],
        [updates],
    );

    const visible = tab === "all" ? updates : updates.filter((u) => u.category === tab);

    return (
        <GlassCard
            angle={163.88}
            glows={<EdgeGlows top={asset("card-glow-wide.png")} topWidth={600} />}
        >
            <Box
                role="tablist"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: "4px", sm: "8px" },
                    width: "100%",
                    p: "4px",
                    borderRadius: "99px",
                    opacity: 0.8,
                    bgcolor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(191,191,191,0.25)",
                    backdropFilter: "blur(4px)",
                }}
            >
                {tabs.map(({ key, label }) => {
                    const active = tab === key;
                    return (
                        <ButtonBase
                            key={key}
                            role="tab"
                            aria-selected={active}
                            onClick={() => setTab(key)}
                            sx={{
                                position: "relative",
                                flex: "1 0 0",
                                minWidth: 0,
                                height: 44,
                                px: { xs: "6px", sm: "8px" },
                                borderRadius: active ? "99px" : "8px",
                                backgroundImage: active
                                    ? "linear-gradient(180deg, rgba(187,201,237,0.44) 0%, rgba(106,114,135,0.26) 100%)"
                                    : "none",
                                backdropFilter: active ? "blur(12px)" : "none",
                                transition: "background-image 0.2s ease",
                                "&::before": active
                                    ? {
                                          content: '""',
                                          position: "absolute",
                                          inset: 0,
                                          borderRadius: "inherit",
                                          padding: "1px",
                                          backgroundImage: ACTIVE_TAB_STROKE,
                                          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                                          WebkitMaskComposite: "xor",
                                          maskComposite: "exclude",
                                          pointerEvents: "none",
                                      }
                                    : undefined,
                            }}
                        >
                            <Typography
                                noWrap
                                sx={{ ...lato(16, 24, 500, active ? "#FFFFFF" : "#8C8C8C"), fontSize: { xs: "13px", sm: "16px" } }}
                            >
                                {label}
                            </Typography>
                        </ButtonBase>
                    );
                })}
            </Box>

            <Box role="tabpanel" sx={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
                {visible.map((update) => (
                    <UpdateRow key={update.id} update={update} onOpen={onOpen ? () => onOpen(update) : undefined} />
                ))}
                {visible.length === 0 && (
                    <Typography sx={{ ...lato(14, 21, 400, "#8C8C8C"), textAlign: "center", py: "24px" }}>
                        Nothing here yet
                    </Typography>
                )}
            </Box>
        </GlassCard>
    );
}
