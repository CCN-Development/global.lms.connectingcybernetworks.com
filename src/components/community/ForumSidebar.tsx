"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Box, ButtonBase, Typography } from "@mui/material";
import { BarChart3, Flag, Layers3, ScrollText, ShieldCheck, Tags, Users } from "lucide-react";
import { FONT_INTER, gradientBorder } from "@/components/aish/tokens";
import { CC, FeedFilter, MANAGE_MENU, ManageView, menuCount } from "./community-data";
import { darkScroll, ellipsis, Icon, LmsButton, TEXT } from "./community-ui";
import { useCommunity } from "./CommunityContext";

interface ForumSidebarProps {
    /** Active feed filter, or the active management view (staff). */
    active: FeedFilter | ManageView | null;
    onSelect: (filter: FeedFilter) => void;
    onNewDiscussion: () => void;
}

/** No Figma assets exist for the management items — lucide icons drawn in the same stroke / colour. */
const MANAGE_ICONS: Record<ManageView, React.ElementType> = {
    queue: ShieldCheck,
    reports: Flag,
    members: Users,
    spaces: Layers3,
    taxonomy: Tags,
    analytics: BarChart3,
    log: ScrollText,
};

function MenuRow({
    active,
    onClick,
    icon,
    label,
    trailing,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    trailing: React.ReactNode;
}) {
    return (
        <ButtonBase
            onClick={onClick}
            aria-current={active ? "page" : undefined}
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
                backgroundImage: active ? CC.menuActive : "none",
                transition: "background-color .15s ease",
                "&:hover": { bgcolor: active ? "transparent" : "rgba(255,255,255,0.04)" },
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                {icon}
                <Typography sx={{ ...TEXT.med14, color: CC.n100, ...ellipsis }}>{label}</Typography>
            </Box>
            {trailing}
        </ButtonBase>
    );
}

const countSx = { fontFamily: FONT_INTER, fontSize: "12px", lineHeight: "18px", color: CC.n300 } as const;

function Badge({ value, color }: { value: number; color: string }) {
    if (!value) return null;
    return (
        <Box sx={{ minWidth: 20, height: 20, px: "6px", borderRadius: "99px", border: `1px solid ${color}`, ...countSx, color, textAlign: "center" }}>
            {value > 99 ? "99+" : value}
        </Box>
    );
}

export default function ForumSidebar({ active, onSelect, onNewDiscussion }: ForumSidebarProps) {
    const router = useRouter();
    const { menu, api, isStaffView, paths, can } = useCommunity();
    const counts = api.counts;
    const queue = api.queue;
    const manageItems = isStaffView ? MANAGE_MENU.filter((m) => !m.capability || can(m.capability)) : [];

    const badgeFor = (view: ManageView) =>
        view === "queue" ? <Badge value={queue?.pendingPosts ?? 0} color="#FFAD4F" /> : view === "reports" ? <Badge value={queue?.openReports ?? 0} color={CC.error} /> : null;

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
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", minHeight: 0, overflowY: "auto", mx: "-4px", px: "4px", ...darkScroll }}>
                <Typography sx={{ ...TEXT.reg14, color: CC.n500, flexShrink: 0 }}>MENU</Typography>
                {menu.map((item) => (
                    <MenuRow
                        key={item.id}
                        active={active === item.id}
                        onClick={() => onSelect(item.id)}
                        icon={<Icon name={item.icon} size={24} rotate={item.rotateIcon ? 180 : undefined} />}
                        label={item.label}
                        trailing={<Typography sx={countSx}>{menuCount(counts, item.id)}</Typography>}
                    />
                ))}

                {manageItems.length > 0 && (
                    <>
                        <Typography sx={{ ...TEXT.reg14, color: CC.n500, mt: "12px", flexShrink: 0 }}>MANAGE</Typography>
                        {manageItems.map((item) => {
                            const IconCmp = MANAGE_ICONS[item.id];
                            return (
                                <MenuRow
                                    key={item.id}
                                    active={active === item.id}
                                    onClick={() => router.push(paths.view(item.id))}
                                    icon={<IconCmp size={22} color={CC.n100} strokeWidth={1.5} style={{ flexShrink: 0 }} />}
                                    label={item.short ?? item.label}
                                    trailing={badgeFor(item.id)}
                                />
                            );
                        })}
                    </>
                )}
            </Box>

            <LmsButton onClick={onNewDiscussion} icon={<Icon name="icon-plus.svg" size={20} sx={{ position: "relative" }} />} sx={{ width: "100%", flexShrink: 0 }}>
                New Discussion
            </LmsButton>
        </Box>
    );
}
