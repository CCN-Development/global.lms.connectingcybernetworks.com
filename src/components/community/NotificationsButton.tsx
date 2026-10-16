"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, ButtonBase, CircularProgress, Menu, Typography } from "@mui/material";
import { Bell } from "lucide-react";
import toast from "react-hot-toast";
import type { CommunityNotification } from "@/contexts/CommunityContext";
import { CC, timeAgo } from "./community-data";
import { darkScroll, dropdownPaperSx, TEXT, UserAvatar } from "./community-ui";
import { useCommunity } from "./CommunityContext";

function describe(n: CommunityNotification): { actor: string; text: string } {
    const actor = n.actor?.name ?? "Someone";
    const title = n.post?.title ? `“${n.post.title}”` : "a discussion";
    const data = (n.data ?? {}) as { action?: string; reason?: string | null; status?: string };
    switch (n.type) {
        case "reply_to_post":
            return { actor, text: `replied in ${title}` };
        case "reply_to_reply":
            return { actor, text: `replied to you in ${title}` };
        case "mention":
            return { actor, text: `mentioned you in ${title}` };
        case "post_reaction":
            return { actor, text: `liked your discussion ${title}` };
        case "reply_reaction":
            return { actor, text: `liked your reply in ${title}` };
        case "answer_accepted":
            return { actor, text: `marked your reply as the answer in ${title}` };
        case "post_pinned":
            return { actor: "", text: `Your discussion ${title} was pinned` };
        case "post_approved":
            return { actor: "", text: `Your discussion ${title} was approved` };
        case "post_rejected":
            return { actor: "", text: `Your discussion ${title} was not approved${data.reason ? ` — ${data.reason}` : ""}` };
        case "content_moderated":
            return { actor: "", text: `A moderator ${data.action === "deleted" ? "removed" : data.action === "hidden" ? "hid" : "updated"} your ${n.reply ? "reply" : "discussion"} in ${title}${data.reason ? ` — ${data.reason}` : ""}` };
        case "poll_closed":
            return { actor: "", text: `Your poll ${title} has closed` };
        case "report_resolved":
            return { actor: "", text: "A moderator reviewed your report — thank you" };
        case "member_sanctioned":
            return { actor: "", text: `You were ${data.action === "ban" ? "banned" : "muted"} in the community${data.reason ? ` — ${data.reason}` : ""}` };
        default:
            return { actor, text: "New activity" };
    }
}

/** Bell with unread count + dropdown list, styled like the feed's filter buttons and menus. */
export default function NotificationsButton() {
    const router = useRouter();
    const { api, paths } = useCommunity();
    const { unreadNotifications, notifications, notificationsMeta, loadingNotifications, getNotifications, markNotificationsRead } = api;
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);

    const open = async (e: React.MouseEvent<HTMLElement>) => {
        setAnchor(e.currentTarget);
        const res = await getNotifications({ limit: 20 });
        if (!res.success) toast.error(res.message ?? "Couldn't load notifications");
    };

    const openItem = (n: CommunityNotification) => {
        setAnchor(null);
        if (!n.isRead) void markNotificationsRead([n.id]);
        if (n.post) router.push(paths.thread(n.post.id, n.reply?.id));
    };

    const onScroll = (e: React.UIEvent<HTMLElement>) => {
        const el = e.currentTarget;
        if (el.scrollHeight - el.scrollTop - el.clientHeight < 120 && notificationsMeta?.hasMore && !loadingNotifications) {
            void getNotifications({ limit: 20, page: notificationsMeta.page + 1 }, { append: true });
        }
    };

    return (
        <>
            <ButtonBase
                aria-label={unreadNotifications ? `Notifications, ${unreadNotifications} unread` : "Notifications"}
                aria-haspopup="menu"
                aria-expanded={Boolean(anchor)}
                onClick={open}
                sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    borderRadius: "8px",
                    bgcolor: CC.filterBg,
                    backdropFilter: "blur(12px)",
                    color: CC.n100,
                    transition: "background-color .15s ease",
                    "&:hover": { bgcolor: "rgba(64,64,64,0.6)" },
                }}
            >
                <Bell size={20} strokeWidth={1.75} />
                {unreadNotifications > 0 && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            minWidth: 16,
                            height: 16,
                            px: "4px",
                            borderRadius: "99px",
                            bgcolor: CC.error,
                            color: CC.white,
                            fontSize: "10px",
                            lineHeight: "16px",
                            fontWeight: 600,
                            textAlign: "center",
                        }}
                    >
                        {unreadNotifications > 99 ? "99+" : unreadNotifications}
                    </Box>
                )}
            </ButtonBase>

            <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: { ...dropdownPaperSx, width: { xs: 300, sm: 360 }, maxHeight: 440 } }, list: { sx: { py: 0 } } }}
            >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: "16px", py: "12px", borderBottom: "1px solid rgba(0,0,0,0.5)" }}>
                    <Typography sx={{ ...TEXT.semi18, fontSize: "16px", color: CC.white }}>Notifications</Typography>
                    {unreadNotifications > 0 && (
                        <ButtonBase onClick={() => void markNotificationsRead("all")} sx={{ ...TEXT.med14, color: CC.link, borderRadius: "4px", px: "4px" }}>
                            Mark all read
                        </ButtonBase>
                    )}
                </Box>
                <Box onScroll={onScroll} sx={{ maxHeight: 380, overflowY: "auto", ...darkScroll }}>
                    {notifications.map((n) => {
                        const { actor, text } = describe(n);
                        return (
                            <ButtonBase
                                key={n.id}
                                onClick={() => openItem(n)}
                                sx={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "10px",
                                    width: "100%",
                                    px: "16px",
                                    py: "10px",
                                    textAlign: "left",
                                    justifyContent: "flex-start",
                                    bgcolor: n.isRead ? "transparent" : CC.dropdownActive,
                                    "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                                }}
                            >
                                <UserAvatar author={n.actor ?? { name: "CCN" }} size={28} />
                                <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0, flex: 1 }}>
                                    <Typography sx={{ ...TEXT.med14, color: CC.n200 }}>
                                        {actor && (
                                            <Box component="span" sx={{ color: CC.white }}>
                                                {actor}{" "}
                                            </Box>
                                        )}
                                        {text}
                                    </Typography>
                                    <Typography sx={{ ...TEXT.reg12, color: CC.n500 }} suppressHydrationWarning>
                                        {timeAgo(n.createdAt)}
                                    </Typography>
                                </Box>
                                {!n.isRead && <Box sx={{ width: 8, height: 8, mt: "6px", borderRadius: "99px", bgcolor: CC.modalStroke, flexShrink: 0 }} />}
                            </ButtonBase>
                        );
                    })}
                    {loadingNotifications && (
                        <Box sx={{ display: "flex", justifyContent: "center", py: "12px" }}>
                            <CircularProgress size={20} sx={{ color: CC.primary200 }} />
                        </Box>
                    )}
                    {!loadingNotifications && notifications.length === 0 && (
                        <Typography sx={{ ...TEXT.med14, color: CC.n500, px: "16px", py: "20px", textAlign: "center" }}>You&apos;re all caught up</Typography>
                    )}
                </Box>
            </Menu>
        </>
    );
}
