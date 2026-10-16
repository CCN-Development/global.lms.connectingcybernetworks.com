"use client";

import React from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { POST_TYPE_LABELS, type CommunityPost } from "@/contexts/CommunityContext";
import { CC, POST_STATUS_LABELS, timeAgo } from "./community-data";
import { AuthorRow, CategoryLabel, ellipsis, GlassCard, Icon, StatusChip, TagChip, TEXT } from "./community-ui";
import { useCommunity } from "./CommunityContext";
import { Engagement, PollOptions, usePollVoting } from "./PostParts";

/** Accent colours for the post-type / state chips (solid, per the design preferences). */
export const POST_TYPE_COLORS = { question: "#93A9E2", poll: "#FFAD4F", quiz: "#D1293D", announcement: "#8C24FF", answered: CC.success } as const;

export function PostBadges({ post }: { post: CommunityPost }) {
    const statusLabel = POST_STATUS_LABELS[post.status];
    return (
        <>
            {post.postType !== "discussion" && <StatusChip label={POST_TYPE_LABELS[post.postType]} color={POST_TYPE_COLORS[post.postType]} />}
            {post.isAnswered && <StatusChip label="Answered" color={POST_TYPE_COLORS.answered} />}
            {post.isLocked && <StatusChip label="Locked" color={CC.n300} />}
            {statusLabel && <StatusChip label={statusLabel} color={post.status === "pending_review" ? "#FFAD4F" : CC.error} />}
        </>
    );
}

/** `footer` — extra row under the card (moderation queue actions). */
export default function PostCard({ post, onOpen, footer }: { post: CommunityPost; onOpen: () => void; footer?: React.ReactNode }) {
    const { api } = useCommunity();
    const { busyPollId, vote } = usePollVoting();
    const isPinned = post.isPinned;

    const like = async () => {
        const res = await api.togglePostLike(post);
        if (!res.success) toast.error(res.message ?? "Couldn't update your like");
    };

    return (
        <GlassCard interactive onClick={onOpen} component="article" sx={{ display: "flex", flexDirection: "column", gap: "16px", flexShrink: 0 }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                {isPinned ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                        <Icon name="icon-pinned-purple.svg" size={24} />
                        <Typography sx={{ ...TEXT.med16, color: CC.purple, ...ellipsis }}>Pinned by {post.pinnedBy ?? "Moderator"}</Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flexWrap: "wrap" }}>
                        <CategoryLabel category={post.category} />
                        {post.tags.map((tag) => (
                            <TagChip key={tag} label={tag} />
                        ))}
                        <PostBadges post={post} />
                    </Box>
                )}
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    {post.hasNewActivity && !post.isMine && (
                        <Box aria-label="New activity" sx={{ width: 8, height: 8, borderRadius: "99px", bgcolor: CC.modalStroke, flexShrink: 0 }} />
                    )}
                    <Typography sx={{ ...TEXT.med14, color: CC.n300, whiteSpace: "nowrap" }} suppressHydrationWarning>
                        {timeAgo(post.createdAt)}
                    </Typography>
                </Box>
            </Box>

            {/* Body */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <AuthorRow author={post.author} you={post.isMine} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", pl: { xs: 0, sm: "42px" } }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
                        <Typography component="h3" sx={{ ...TEXT.semi18, color: CC.white, ...ellipsis }}>
                            {post.title}
                        </Typography>
                        {post.excerpt && (
                            <Typography
                                sx={{
                                    ...TEXT.med14,
                                    color: CC.n200,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                }}
                            >
                                {post.excerpt}
                            </Typography>
                        )}
                        {post.postType === "quiz" && (
                            <Typography sx={{ ...TEXT.med14, color: CC.n300 }}>
                                {post.polls.length} question{post.polls.length === 1 ? "" : "s"} · open the thread to answer
                            </Typography>
                        )}
                    </Box>

                    {post.poll && (
                        <PollOptions
                            poll={post.poll}
                            disabled={post.isLocked || post.status !== "published" || busyPollId === post.poll.id}
                            onVote={(ids) => vote(post.poll!.id, ids)}
                        />
                    )}

                    {!isPinned && (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                            <Engagement likes={post.likes} liked={post.liked} onLike={like} comments={post.replyCount} views={post.views} />
                            <ButtonBase
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpen();
                                }}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    pl: "12px",
                                    pr: "16px",
                                    py: "8px",
                                    borderRadius: "8px",
                                    border: "0.4px solid rgba(140,140,140,0.5)",
                                    backgroundImage: "linear-gradient(180deg, rgba(191,191,191,0.12) 0%, rgba(89,89,89,0.04) 100%)",
                                    boxShadow: "0 4px 24px rgba(0,0,0,0.16)",
                                    color: CC.white,
                                    ...TEXT.med14,
                                    transition: "border-color .15s ease",
                                    "&:hover": { borderColor: CC.primary200 },
                                }}
                            >
                                Open Thread
                                <Icon name="icon-arrow-right.svg" size={20} />
                            </ButtonBase>
                        </Box>
                    )}
                </Box>
            </Box>

            {footer && (
                <Box
                    onClick={(e) => e.stopPropagation()}
                    sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", pt: "16px", borderTop: "1px solid rgba(255,255,255,0.08)", cursor: "default" }}
                >
                    {footer}
                </Box>
            )}
        </GlassCard>
    );
}
