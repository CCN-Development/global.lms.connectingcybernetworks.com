"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import { Ban, CircleCheck, ExternalLink, EyeOff, Trash2, VolumeX, X } from "lucide-react";
import toast from "react-hot-toast";
import {
    REPORT_REASON_LABELS,
    type CommunityReport,
    type ReportAction,
    type ReportStatus,
    type ReportTarget,
} from "@/contexts/CommunityContext";
import { CC, POST_STATUS_LABELS, timeAgo } from "../community-data";
import { ActionButton, ActionMenu, ActionMenuItem, AuthorRow, ChoiceChip, EmptyCard, GlassCard, ReasonModal, StatusChip, TEXT } from "../community-ui";
import { useCommunity } from "../CommunityContext";
import { PanelLoading, PanelShell } from "./ManagePanel";

const STATUS_TABS: { id: ReportStatus | "all"; label: string }[] = [
    { id: "open", label: "Open" },
    { id: "resolved", label: "Resolved" },
    { id: "dismissed", label: "Dismissed" },
    { id: "all", label: "All" },
];

const TARGET_TABS: { id: ReportTarget | "all"; label: string }[] = [
    { id: "all", label: "Everything" },
    { id: "post", label: "Discussions" },
    { id: "reply", label: "Replies" },
    { id: "member", label: "Members" },
];

export const REPORT_ACTION_LABELS: Record<ReportAction, string> = {
    none: "No action",
    hidden: "Content hidden",
    deleted: "Content removed",
    member_muted: "Member muted",
    member_banned: "Member banned",
};

const TARGET_LABELS: Record<ReportTarget, string> = { post: "Discussion", reply: "Reply", member: "Member" };
const STATUS_COLORS: Record<ReportStatus, string> = { open: "#FFAD4F", resolved: CC.success, dismissed: CC.n300 };

const HOUR = 3_600_000;
const MUTE_OPTIONS = [
    { label: "24 hours", ms: 24 * HOUR },
    { label: "7 days", ms: 7 * 24 * HOUR },
    { label: "Until unmuted", ms: 0 },
];

const ACTION_COPY: Record<ReportAction, { title: string; message: string; confirm: string; danger?: boolean; required?: boolean }> = {
    none: { title: "Resolve report", message: "Close the report without changing the content. The reporter is told it was reviewed.", confirm: "Resolve" },
    hidden: { title: "Hide and resolve", message: "The content is hidden from members and every open report on it is closed.", confirm: "Hide content" },
    deleted: { title: "Remove and resolve", message: "The content is removed from the community and every open report on it is closed.", confirm: "Remove content", danger: true },
    member_muted: { title: "Mute and resolve", message: "The member can still read but can't post, reply or vote while muted.", confirm: "Mute member" },
    member_banned: { title: "Ban and resolve", message: "The member loses access to the community until unbanned.", confirm: "Ban member", danger: true, required: true },
};

const PAGE = 20;

export default function ReportsPanel() {
    const router = useRouter();
    const { api, paths, can } = useCommunity();
    const { reports, reportsMeta, loadingAdmin, queue, getReports, resolveReport, dismissReport } = api;
    const [status, setStatus] = useState<ReportStatus | "all">("open");
    const [target, setTarget] = useState<ReportTarget | "all">("all");
    const [loaded, setLoaded] = useState(false);
    const [pending, setPending] = useState<{ report: CommunityReport; action: ReportAction | "dismiss" } | null>(null);
    const [muteMs, setMuteMs] = useState(24 * HOUR);
    const [busy, setBusy] = useState(false);

    const params = useCallback(
        (page: number) => ({ status: status === "all" ? undefined : status, targetType: target === "all" ? undefined : target, page, limit: PAGE }),
        [status, target],
    );

    const load = useCallback(async () => {
        const res = await getReports(params(1));
        setLoaded(true);
        if (!res.success) toast.error(res.message ?? "Couldn't load reports");
    }, [getReports, params]);

    useEffect(() => {
        void load();
    }, [load]);

    const loadMore = () => {
        if (!reportsMeta?.hasMore || loadingAdmin) return;
        void getReports(params(reportsMeta.page + 1), { append: true });
    };

    const confirm = async (note: string) => {
        if (!pending) return;
        setBusy(true);
        const res =
            pending.action === "dismiss"
                ? await dismissReport(pending.report.id, note || undefined)
                : await resolveReport(pending.report.id, {
                      action: pending.action,
                      note: note || null,
                      muteUntil: pending.action === "member_muted" && muteMs ? new Date(Date.now() + muteMs).toISOString() : null,
                  });
        setBusy(false);
        if (!res.success) {
            toast.error(res.message ?? "Couldn't update the report");
            return;
        }
        toast.success(pending.action === "dismiss" ? "Report dismissed" : "Report resolved");
        setPending(null);
    };

    const visible = reports.filter((r) => (status === "all" || r.status === status) && (target === "all" || r.targetType === target));
    const copy = pending ? (pending.action === "dismiss" ? null : ACTION_COPY[pending.action]) : null;

    return (
        <PanelShell
            view="reports"
            title="Reports"
            subtitle="Content and members flagged by the community. Closing a report notifies everyone who reported the same thing."
            actions={<ActionButton onClick={() => void load()}>Refresh</ActionButton>}
            toolbar={
                <>
                    <Box role="radiogroup" aria-label="Report status" sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {STATUS_TABS.map((t) => (
                            <ChoiceChip key={t.id} active={status === t.id} count={t.id === "open" ? queue?.openReports : undefined} onClick={() => setStatus(t.id)}>
                                {t.label}
                            </ChoiceChip>
                        ))}
                    </Box>
                    <Box role="radiogroup" aria-label="Reported item" sx={{ display: "flex", gap: "8px", flexWrap: "wrap", ml: { md: "auto" } }}>
                        {TARGET_TABS.map((t) => (
                            <ChoiceChip key={t.id} active={target === t.id} onClick={() => setTarget(t.id)}>
                                {t.label}
                            </ChoiceChip>
                        ))}
                    </Box>
                </>
            }
            onEndReached={loadMore}
            loadingMore={loadingAdmin && visible.length > 0}
        >
            {!loaded || (loadingAdmin && visible.length === 0) ? (
                <PanelLoading />
            ) : visible.length === 0 ? (
                <EmptyCard title={status === "open" ? "No open reports" : "No reports"} message={status === "open" ? "Nothing needs your attention right now." : "Nothing matches these filters."} />
            ) : (
                visible.map((report) => (
                    <ReportCard
                        key={report.id}
                        report={report}
                        canBan={can("member.ban")}
                        onOpen={report.post ? () => router.push(paths.thread(report.post!.id, report.reply?.id)) : undefined}
                        onAction={(action) => {
                            setMuteMs(24 * HOUR);
                            setPending({ report, action });
                        }}
                    />
                ))
            )}

            <ReasonModal
                open={Boolean(pending)}
                title={copy?.title ?? "Dismiss report"}
                message={copy?.message ?? "Close the report as not breaking the guidelines. Nothing changes for the reported content."}
                confirmLabel={copy?.confirm ?? "Dismiss"}
                danger={copy?.danger}
                required={copy?.required}
                busy={busy}
                placeholder="Add a note for the moderation log"
                onConfirm={(note) => void confirm(note)}
                onClose={() => setPending(null)}
            >
                {pending?.action === "member_muted" && (
                    <Box role="radiogroup" aria-label="Mute duration" sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {MUTE_OPTIONS.map((o) => (
                            <ChoiceChip key={o.label} active={muteMs === o.ms} onClick={() => setMuteMs(o.ms)}>
                                {o.label}
                            </ChoiceChip>
                        ))}
                    </Box>
                )}
            </ReasonModal>
        </PanelShell>
    );
}

function ReportCard({ report, canBan, onOpen, onAction }: { report: CommunityReport; canBan: boolean; onOpen?: () => void; onAction: (action: ReportAction | "dismiss") => void }) {
    const isOpen = report.status === "open";
    const member = report.reportedMember;
    const content = report.targetType === "reply" ? report.reply : report.post;
    const contentStatus = content ? POST_STATUS_LABELS[content.status] : undefined;

    const resolveItems: ActionMenuItem[] = [{ label: "Resolve, no action", icon: <CircleCheck size={20} color={CC.success} />, onClick: () => onAction("none") }];
    if (report.targetType !== "member" && content && content.status === "published") {
        resolveItems.push({ label: "Hide content", icon: <EyeOff size={20} color={CC.n200} />, onClick: () => onAction("hidden") });
        resolveItems.push({ label: "Remove content", icon: <Trash2 size={20} color={CC.error} />, danger: true, onClick: () => onAction("deleted") });
    }
    if (member && !member.isStaff && member.status !== "banned") {
        if (member.status !== "muted") resolveItems.push({ label: `Mute ${member.name}`, icon: <VolumeX size={20} color={CC.n200} />, onClick: () => onAction("member_muted") });
        if (canBan) resolveItems.push({ label: `Ban ${member.name}`, icon: <Ban size={20} color={CC.error} />, danger: true, onClick: () => onAction("member_banned") });
    }

    return (
        <GlassCard sx={{ display: "flex", flexDirection: "column", gap: "16px", flexShrink: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <StatusChip label={REPORT_REASON_LABELS[report.reason]} color="#F07A88" />
                    <StatusChip label={TARGET_LABELS[report.targetType]} color={CC.primary200} />
                    <StatusChip label={report.status[0].toUpperCase() + report.status.slice(1)} color={STATUS_COLORS[report.status]} />
                </Box>
                <Typography sx={{ ...TEXT.med14, color: CC.n300, whiteSpace: "nowrap" }} suppressHydrationWarning>
                    {timeAgo(report.createdAt)}
                </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Typography sx={{ ...TEXT.reg14, color: CC.n400 }}>
                    Reported by <Box component="span" sx={{ color: CC.n100 }}>{report.reporter.name}</Box>
                    {report.reporter.roleLabel ? ` · ${report.reporter.roleLabel}` : ""}
                </Typography>
                {report.details && <Typography sx={{ ...TEXT.med16, color: CC.n100, whiteSpace: "pre-wrap" }}>“{report.details}”</Typography>}
            </Box>

            {/* Reported item */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", p: "14px 16px", borderRadius: "12px", border: `1px solid ${CC.n700}`, bgcolor: "rgba(0,0,0,0.24)" }}>
                {report.post && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <Typography sx={{ ...TEXT.semi18, fontSize: "16px", color: CC.white }}>{report.post.title}</Typography>
                        {contentStatus && <StatusChip label={contentStatus} color={CC.error} />}
                    </Box>
                )}
                {content?.excerpt && (
                    <Typography sx={{ ...TEXT.med14, color: CC.n200, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {report.targetType === "reply" ? "Reply: " : ""}
                        {content.excerpt}
                    </Typography>
                )}
                {member && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <AuthorRow author={member} size={28} />
                        {member.status !== "active" && <StatusChip label={member.status === "muted" ? "Muted" : "Banned"} color={member.status === "muted" ? "#FFAD4F" : CC.error} />}
                    </Box>
                )}
            </Box>

            {isOpen ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <ActionMenu
                        label="Resolve report"
                        items={resolveItems}
                        trigger={
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    height: 28,
                                    px: "8px",
                                    borderRadius: "8px",
                                    border: "0.6px solid rgba(46,196,182,0.5)",
                                    backgroundImage: "linear-gradient(180deg, rgba(191,191,191,0.12) 0%, rgba(89,89,89,0.04) 100%)",
                                    ...TEXT.med14,
                                    color: CC.success,
                                }}
                            >
                                <CircleCheck size={18} />
                                Resolve…
                            </Box>
                        }
                    />
                    <ActionButton icon={<X size={18} />} onClick={() => onAction("dismiss")}>
                        Dismiss
                    </ActionButton>
                    {onOpen && (
                        <ActionButton tone="primary" icon={<ExternalLink size={18} />} onClick={onOpen}>
                            Open in thread
                        </ActionButton>
                    )}
                </Box>
            ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <Typography sx={{ ...TEXT.reg14, color: CC.n400 }}>
                        {report.actionTaken ? REPORT_ACTION_LABELS[report.actionTaken] : "Closed"}
                        {report.resolvedBy ? ` by ${report.resolvedBy.name}` : ""}
                        {report.resolvedAt ? ` · ${timeAgo(report.resolvedAt)}` : ""}
                        {report.resolutionNote ? ` — ${report.resolutionNote}` : ""}
                    </Typography>
                    {onOpen && (
                        <Box sx={{ ml: "auto" }}>
                            <ActionButton tone="primary" icon={<ExternalLink size={18} />} onClick={onOpen}>
                                Open in thread
                            </ActionButton>
                        </Box>
                    )}
                </Box>
            )}
        </GlassCard>
    );
}
