"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Menu, MenuItem, Typography } from "@mui/material";
import { ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import type { CommunityModerationLogEntry } from "@/contexts/CommunityContext";
import { CC, longDate, timeAgo } from "../community-data";
import { ActionButton, dropdownItemSx, dropdownPaperSx, EmptyCard, FilterButton, GlassCard, TEXT, UserAvatar } from "../community-ui";
import { useCommunity } from "../CommunityContext";
import { REPORT_ACTION_LABELS } from "./ReportsPanel";
import { PanelLoading, PanelShell } from "./ManagePanel";

/** Past-tense labels for `CommunityModerationLog.action`. */
const ACTION_LABELS: Record<string, string> = {
    approve: "approved",
    reject: "rejected",
    hide: "hid",
    auto_hide: "auto-hid (too many reports)",
    restore: "restored",
    delete: "removed",
    purge: "permanently deleted",
    pin: "pinned",
    unpin: "unpinned",
    lock: "locked replies on",
    unlock: "unlocked replies on",
    move: "moved",
    accept_answer: "accepted an answer on",
    unaccept_answer: "cleared the accepted answer on",
    mute: "muted",
    unmute: "unmuted",
    ban: "banned",
    unban: "lifted the ban on",
    resolve_report: "resolved a report",
    dismiss_report: "dismissed a report",
    space_create: "created a space",
    space_update: "updated a space",
    space_delete: "deleted a space",
    moderator_add: "added a space moderator",
    moderator_remove: "removed a space moderator",
    category_create: "created a category",
    category_update: "updated a category",
    category_deactivate: "deactivated a category",
    category_delete: "deleted a category",
    tag_create: "created a tag",
    tag_update: "updated a tag",
    tag_deactivate: "deactivated a tag",
    tag_delete: "deleted a tag",
};

const FILTERS: { id: string | null; label: string }[] = [
    { id: null, label: "All actions" },
    { id: "approve", label: "Approved" },
    { id: "reject", label: "Rejected" },
    { id: "hide", label: "Hidden" },
    { id: "auto_hide", label: "Auto-hidden" },
    { id: "restore", label: "Restored" },
    { id: "delete", label: "Removed" },
    { id: "purge", label: "Permanently deleted" },
    { id: "pin", label: "Pinned" },
    { id: "lock", label: "Locked" },
    { id: "move", label: "Moved" },
    { id: "mute", label: "Muted" },
    { id: "ban", label: "Banned" },
    { id: "resolve_report", label: "Reports resolved" },
    { id: "dismiss_report", label: "Reports dismissed" },
];

const TARGET_NOUN: Record<string, string> = { post: "a discussion", reply: "a reply", member: "", space: "", category: "", tag: "", report: "" };
const RED = new Set(["delete", "purge", "ban", "hide", "auto_hide", "reject"]);
const GREEN = new Set(["approve", "restore", "unban", "unmute", "resolve_report"]);

const PAGE = 30;

export default function ModerationLogPanel() {
    const router = useRouter();
    const { api, paths } = useCommunity();
    const { moderationLog, moderationLogMeta, loadingAdmin, getModerationLog } = api;
    const [action, setAction] = useState<string | null>(null);
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const [loaded, setLoaded] = useState(false);

    const load = useCallback(async () => {
        const res = await getModerationLog({ action: action ?? undefined, page: 1, limit: PAGE });
        setLoaded(true);
        if (!res.success) toast.error(res.message ?? "Couldn't load the moderation log");
    }, [getModerationLog, action]);

    useEffect(() => {
        void load();
    }, [load]);

    const loadMore = () => {
        if (!moderationLogMeta?.hasMore || loadingAdmin) return;
        void getModerationLog({ action: action ?? undefined, page: moderationLogMeta.page + 1, limit: PAGE }, { append: true });
    };

    const visible = action ? moderationLog.filter((e) => e.action === action) : moderationLog;

    return (
        <PanelShell
            view="log"
            title="Moderation Log"
            subtitle="Every moderation action in the spaces you look after, newest first."
            actions={<ActionButton onClick={() => void load()}>Refresh</ActionButton>}
            toolbar={
                <>
                    <FilterButton label="Filter by action" open={Boolean(anchor)} onClick={(e) => setAnchor(e.currentTarget)}>
                        {FILTERS.find((f) => f.id === action)?.label ?? "All actions"}
                    </FilterButton>
                    <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} slotProps={{ paper: { sx: { ...dropdownPaperSx, minWidth: 220, maxHeight: 420 } } }}>
                        {FILTERS.map((f) => (
                            <MenuItem
                                key={f.id ?? "all"}
                                selected={action === f.id}
                                onClick={() => {
                                    setAction(f.id);
                                    setAnchor(null);
                                }}
                                sx={dropdownItemSx(action === f.id)}
                            >
                                {f.label}
                            </MenuItem>
                        ))}
                    </Menu>
                    {moderationLogMeta && (
                        <Typography sx={{ ...TEXT.reg14, color: CC.n400 }}>
                            {moderationLogMeta.total} entr{moderationLogMeta.total === 1 ? "y" : "ies"}
                        </Typography>
                    )}
                </>
            }
            onEndReached={loadMore}
            loadingMore={loadingAdmin && visible.length > 0}
        >
            {!loaded || (loadingAdmin && visible.length === 0) ? (
                <PanelLoading />
            ) : visible.length === 0 ? (
                <EmptyCard title="Nothing logged yet" message="Moderation actions will be listed here." />
            ) : (
                <GlassCard sx={{ display: "flex", flexDirection: "column", p: "0 !important", flexShrink: 0, overflow: "hidden" }}>
                    {visible.map((entry, i) => (
                        <LogRow
                            key={entry.id}
                            entry={entry}
                            first={i === 0}
                            onOpen={entry.postId && entry.action !== "purge" ? () => router.push(paths.thread(entry.postId!, entry.replyId ?? undefined)) : undefined}
                        />
                    ))}
                </GlassCard>
            )}
        </PanelShell>
    );
}

function describe(entry: CommunityModerationLogEntry) {
    const verb = ACTION_LABELS[entry.action] ?? entry.action.replace(/_/g, " ");
    if (entry.targetType === "member" || ["mute", "unmute", "ban", "unban"].includes(entry.action)) return { verb, object: entry.targetMember?.name ?? "a member" };
    if (entry.targetType === "post" || entry.targetType === "reply") {
        const noun = TARGET_NOUN[entry.targetType];
        const title = typeof entry.meta?.title === "string" ? ` “${entry.meta.title}”` : "";
        const by = entry.targetMember ? ` by ${entry.targetMember.name}` : "";
        return { verb, object: `${noun}${title}${by}` };
    }
    return { verb, object: "" };
}

function LogRow({ entry, first, onOpen }: { entry: CommunityModerationLogEntry; first: boolean; onOpen?: () => void }) {
    const { verb, object } = describe(entry);
    const tone = RED.has(entry.action) ? "#F07A88" : GREEN.has(entry.action) ? CC.success : CC.primary200;
    const reportAction = typeof entry.meta?.action === "string" ? REPORT_ACTION_LABELS[entry.meta.action as keyof typeof REPORT_ACTION_LABELS] : undefined;
    const actor = entry.actor ?? { name: "System", avatar: null };
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: { xs: "flex-start", sm: "center" },
                flexDirection: { xs: "column", sm: "row" },
                gap: "12px",
                px: { xs: "16px", sm: "24px" },
                py: "14px",
                borderTop: first ? "none" : "1px solid rgba(255,255,255,0.06)",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1, minWidth: 0 }}>
                <UserAvatar author={actor} size={32} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                    <Typography sx={{ ...TEXT.med14, color: CC.n200 }}>
                        <Box component="span" sx={{ color: CC.white }}>
                            {actor.name}
                        </Box>{" "}
                        <Box component="span" sx={{ color: tone }}>
                            {verb}
                        </Box>
                        {object && ` ${object}`}
                        {reportAction && entry.action === "resolve_report" ? ` · ${reportAction}` : ""}
                    </Typography>
                    {entry.reason && <Typography sx={{ ...TEXT.reg14, color: CC.n400 }}>“{entry.reason}”</Typography>}
                    <Typography sx={{ ...TEXT.reg12, color: CC.n500 }} title={longDate(entry.createdAt)} suppressHydrationWarning>
                        {timeAgo(entry.createdAt)}
                        {entry.actor?.roleLabel ? ` · ${entry.actor.roleLabel}` : ""}
                    </Typography>
                </Box>
            </Box>
            {onOpen && (
                <ActionButton tone="primary" icon={<ExternalLink size={16} />} onClick={onOpen}>
                    Open
                </ActionButton>
            )}
        </Box>
    );
}
