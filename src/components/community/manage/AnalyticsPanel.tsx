"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, ButtonBase, Tooltip, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { CC, timeAgo } from "../community-data";
import { AuthorRow, CategorySwatch, ChoiceChip, ellipsis, EmptyCard, GlassCard, TEXT } from "../community-ui";
import { useCommunity } from "../CommunityContext";
import { PanelLoading, PanelShell } from "./ManagePanel";

const WINDOWS = [7, 30, 90];
const POSTS_COLOR = CC.primary200;
const REPLIES_COLOR = "#8C24FF";

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export default function AnalyticsPanel() {
    const router = useRouter();
    const { api, paths } = useCommunity();
    const { analytics, getAnalytics } = api;
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        void getAnalytics(days).then((res) => {
            if (!alive) return;
            setLoading(false);
            if (!res.success) toast.error(res.message ?? "Couldn't load analytics");
        });
        return () => {
            alive = false;
        };
    }, [getAnalytics, days]);

    const data = analytics && analytics.windowDays === days ? analytics : null;

    return (
        <PanelShell
            view="analytics"
            title="Analytics"
            subtitle="Activity in the spaces you look after."
            toolbar={
                <Box role="radiogroup" aria-label="Time window" sx={{ display: "flex", gap: "8px" }}>
                    {WINDOWS.map((d) => (
                        <ChoiceChip
                            key={d}
                            active={days === d}
                            onClick={() => {
                                if (d === days) return;
                                setLoading(true);
                                setDays(d);
                            }}
                        >
                            Last {d} days
                        </ChoiceChip>
                    ))}
                </Box>
            }
        >
            {loading && !data ? (
                <PanelLoading />
            ) : !data ? (
                <EmptyCard title="No analytics yet" message="Analytics appear once members start posting." />
            ) : (
                <>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" }, gap: "16px", flexShrink: 0 }}>
                        <Tile label="New discussions" value={data.window.newPosts} hint={`${data.totals.posts} in total`} />
                        <Tile label="New replies" value={data.window.newReplies} hint={`${data.totals.replies} in total`} />
                        <Tile label="Reactions" value={data.window.newReactions} />
                        <Tile label="Active members" value={data.window.activeMembers} />
                        <Tile label="Unanswered questions" value={data.totals.unansweredQuestions} tone={data.totals.unansweredQuestions ? "#FFAD4F" : undefined} />
                        <Tile label="Waiting for approval" value={data.queue.pendingPosts} tone={data.queue.pendingPosts ? "#FFAD4F" : undefined} onClick={() => router.push(paths.view("queue"))} />
                        <Tile label="Open reports" value={data.queue.openReports} tone={data.queue.openReports ? "#F07A88" : undefined} onClick={() => router.push(paths.view("reports"))} />
                        <Tile label="Hidden discussions" value={data.queue.hiddenPosts} onClick={() => router.push(paths.view("queue"))} />
                    </Box>

                    <DailyChart daily={data.daily} />

                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "1fr 1fr" }, gap: "16px", flexShrink: 0 }}>
                        <GlassCard sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <CardTitle>Top contributors</CardTitle>
                            {data.topContributors.length === 0 ? (
                                <Muted>No replies in this period.</Muted>
                            ) : (
                                data.topContributors.map((m, i) => (
                                    <Box key={m.id ?? i} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                                            <Typography sx={{ ...TEXT.med14, color: CC.n500, width: 18 }}>{i + 1}</Typography>
                                            <AuthorRow author={m} size={28} />
                                        </Box>
                                        <Typography sx={{ ...TEXT.reg14, color: CC.n300, whiteSpace: "nowrap" }}>
                                            {plural(m.replies, "reply", "replies")} · {plural(m.likesReceived, "like")}
                                        </Typography>
                                    </Box>
                                ))
                            )}
                        </GlassCard>

                        <GlassCard sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <CardTitle>Discussions by category</CardTitle>
                            {data.byCategory.length === 0 ? (
                                <Muted>No discussions in this period.</Muted>
                            ) : (
                                (() => {
                                    const max = Math.max(...data.byCategory.map((c) => c.posts), 1);
                                    return data.byCategory.map((c) => (
                                        <Box key={c.id} sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                                                    <CategorySwatch color={c.color ?? CC.n400} />
                                                    <Typography sx={{ ...TEXT.med14, color: CC.n100, ...ellipsis }}>{c.label}</Typography>
                                                </Box>
                                                <Typography sx={{ ...TEXT.med14, color: CC.white }}>{c.posts}</Typography>
                                            </Box>
                                            <Box sx={{ height: 6, borderRadius: "99px", bgcolor: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                                                <Box sx={{ height: "100%", width: `${(c.posts / max) * 100}%`, bgcolor: c.color ?? CC.n400, borderRadius: "99px" }} />
                                            </Box>
                                        </Box>
                                    ));
                                })()
                            )}
                        </GlassCard>
                    </Box>

                    <GlassCard sx={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                        <CardTitle>Most active discussions</CardTitle>
                        {data.topPosts.length === 0 ? (
                            <Muted>No discussions in this period.</Muted>
                        ) : (
                            data.topPosts.map((p) => (
                                <ButtonBase
                                    key={p.id}
                                    onClick={() => router.push(paths.thread(p.id))}
                                    sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", p: "10px 12px", mx: "-12px", borderRadius: "8px", textAlign: "left", "&:hover": { bgcolor: CC.dropdownActive } }}
                                >
                                    <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                                        <Typography sx={{ ...TEXT.med16, color: CC.white, ...ellipsis }}>{p.title}</Typography>
                                        <Typography sx={{ ...TEXT.reg12, color: CC.n500 }} suppressHydrationWarning>
                                            {timeAgo(p.createdAt)}
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ ...TEXT.reg14, color: CC.n300, whiteSpace: "nowrap" }}>
                                        {plural(p.replies, "reply", "replies")} · {plural(p.likes, "like")} · {plural(p.views, "view")}
                                    </Typography>
                                </ButtonBase>
                            ))
                        )}
                    </GlassCard>
                </>
            )}
        </PanelShell>
    );
}

function CardTitle({ children }: { children: React.ReactNode }) {
    return <Typography sx={{ ...TEXT.semi18, color: CC.white }}>{children}</Typography>;
}

function Muted({ children }: { children: React.ReactNode }) {
    return <Typography sx={{ ...TEXT.med14, color: CC.n500 }}>{children}</Typography>;
}

function Tile({ label, value, hint, tone, onClick }: { label: string; value: number; hint?: string; tone?: string; onClick?: () => void }) {
    return (
        <GlassCard interactive={Boolean(onClick)} onClick={onClick} sx={{ display: "flex", flexDirection: "column", gap: "4px", p: { xs: "16px", sm: "20px" } }}>
            <Typography sx={{ ...TEXT.reg14, color: CC.n300 }}>{label}</Typography>
            <Typography sx={{ ...TEXT.poppinsSemi24, color: tone ?? CC.white }}>{value.toLocaleString()}</Typography>
            {hint && <Typography sx={{ ...TEXT.reg12, color: CC.n500 }}>{hint}</Typography>}
        </GlassCard>
    );
}

function DailyChart({ daily }: { daily: { date: string; posts: number; replies: number }[] }) {
    const max = Math.max(...daily.map((d) => d.posts + d.replies), 1);
    const step = Math.max(1, Math.ceil(daily.length / 8));
    return (
        <GlassCard sx={{ display: "flex", flexDirection: "column", gap: "16px", flexShrink: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <CardTitle>Daily activity</CardTitle>
                <Box sx={{ display: "flex", gap: "16px" }}>
                    <Legend color={POSTS_COLOR} label="Discussions" />
                    <Legend color={REPLIES_COLOR} label="Replies" />
                </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "flex-end", gap: daily.length > 40 ? "2px" : "4px", height: 160 }}>
                {daily.map((d) => {
                    const total = d.posts + d.replies;
                    return (
                        <Tooltip key={d.date} title={`${d.date}: ${d.posts} discussions, ${d.replies} replies`} placement="top" arrow>
                            <Box sx={{ flex: 1, minWidth: 0, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", cursor: "default" }}>
                                <Box sx={{ height: `${(total / max) * 100}%`, minHeight: total ? 2 : 0, display: "flex", flexDirection: "column", borderRadius: "3px 3px 0 0", overflow: "hidden" }}>
                                    <Box sx={{ flex: d.replies, bgcolor: REPLIES_COLOR }} />
                                    <Box sx={{ flex: d.posts, bgcolor: POSTS_COLOR }} />
                                </Box>
                            </Box>
                        </Tooltip>
                    );
                })}
            </Box>
            <Box sx={{ display: "flex", gap: daily.length > 40 ? "2px" : "4px", mt: "-8px" }}>
                {daily.map((d, i) => (
                    <Typography key={d.date} sx={{ flex: 1, minWidth: 0, ...TEXT.reg12, fontSize: "10px", color: CC.n500, textAlign: "center", overflow: "visible", whiteSpace: "nowrap" }}>
                        {i % step === 0 ? d.date.slice(5) : ""}
                    </Typography>
                ))}
            </Box>
        </GlassCard>
    );
}

function Legend({ color, label }: { color: string; label: string }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: color }} />
            <Typography sx={{ ...TEXT.reg12, color: CC.n300 }}>{label}</Typography>
        </Box>
    );
}
