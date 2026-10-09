"use client";

import React from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { CC, CURRENT_USER_ID, htmlToText, Post, timeAgo } from "./community-data";
import { AuthorRow, CategoryLabel, ellipsis, GlassCard, Icon, TagChip, TEXT } from "./community-ui";
import { useCommunity } from "./CommunityContext";
import { Engagement, PollOptions } from "./PostParts";

export default function PostCard({ post, onOpen }: { post: Post; onOpen: () => void }) {
    const { resolveAuthor, togglePostLike, votePoll } = useCommunity();
    const author = resolveAuthor(post.author);
    const isPinned = Boolean(post.pinnedBy);
    const excerpt = htmlToText(post.html);

    return (
        <GlassCard interactive onClick={onOpen} component="article" sx={{ display: "flex", flexDirection: "column", gap: "16px", flexShrink: 0 }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                {isPinned ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                        <Icon name="icon-pinned-purple.svg" size={24} />
                        <Typography sx={{ ...TEXT.med16, color: CC.purple, ...ellipsis }}>Pinned by {post.pinnedBy}</Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flexWrap: "wrap" }}>
                        <CategoryLabel categoryId={post.categoryId} />
                        {post.tags.map((tag) => (
                            <TagChip key={tag} label={tag} />
                        ))}
                    </Box>
                )}
                <Typography sx={{ ...TEXT.med14, color: CC.n300, whiteSpace: "nowrap" }} suppressHydrationWarning>
                    {timeAgo(post.createdAt)}
                </Typography>
            </Box>

            {/* Body */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <AuthorRow author={author} you={post.author.id === CURRENT_USER_ID} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", pl: { xs: 0, sm: "42px" } }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
                        <Typography component="h3" sx={{ ...TEXT.semi18, color: CC.white, ...ellipsis }}>
                            {post.title}
                        </Typography>
                        {excerpt && (
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
                                {excerpt}
                            </Typography>
                        )}
                    </Box>

                    {post.poll && (
                        <PollOptions post={post} showResults={Boolean(post.poll.votedOptionId)} onVote={(id) => votePoll(post.id, id)} />
                    )}

                    {!isPinned && (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                            <Engagement
                                likes={post.likes}
                                liked={post.liked}
                                onLike={() => togglePostLike(post.id)}
                                comments={post.replies.length}
                                views={post.views}
                            />
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
        </GlassCard>
    );
}
