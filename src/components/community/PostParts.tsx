"use client";

import React from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { CC, Post, pollPercent } from "./community-data";
import { Icon, TEXT } from "./community-ui";

interface PollOptionsProps {
    post: Post;
    showResults: boolean;
    onVote: (optionId: string) => void;
}

/** Bars run ~1.5× the vote share so smaller results stay readable, as in the design. */
const barWidth = (percent: number) => `${Math.min(100, Math.max(percent ? 8 : 0, percent * 1.5))}%`;

export function PollOptions({ post, showResults, onVote }: PollOptionsProps) {
    const poll = post.poll;
    if (!poll) return null;

    return (
        <Box role="radiogroup" aria-label="Poll options" sx={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            {poll.options.map((option) => {
                const voted = poll.votedOptionId === option.id;
                const percent = pollPercent(poll, option);
                return (
                    <ButtonBase
                        key={option.id}
                        role="radio"
                        aria-checked={voted}
                        aria-label={showResults ? `${option.text}, ${percent}%` : option.text}
                        onClick={(e) => {
                            e.stopPropagation();
                            onVote(option.id);
                        }}
                        sx={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "20px",
                            width: "100%",
                            pl: { xs: "16px", sm: "24px" },
                            pr: "16px",
                            py: { xs: "12px", sm: "16px" },
                            borderRadius: "99px",
                            border: "1px solid rgba(115,115,115,0.12)",
                            bgcolor: CC.pollFill,
                            overflow: "hidden",
                            textAlign: "left",
                            transition: "border-color .15s ease",
                            "&:hover": { borderColor: "rgba(147,169,226,0.4)" },
                        }}
                    >
                        {showResults && (
                            <Box
                                aria-hidden
                                sx={{
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: barWidth(percent),
                                    borderRadius: "99px",
                                    backgroundImage: voted ? CC.pollVoted : "none",
                                    bgcolor: voted ? "transparent" : CC.pollOther,
                                    transition: "width .4s ease",
                                }}
                            />
                        )}
                        <Typography sx={{ position: "relative", ...TEXT.med18, fontSize: { xs: "16px", sm: "18px" }, color: CC.n100 }}>
                            {option.text}
                        </Typography>
                        {showResults && (
                            <Typography sx={{ position: "relative", ...TEXT.med18, fontSize: { xs: "16px", sm: "18px" }, color: voted ? CC.purple : CC.n500 }}>
                                {percent}%
                            </Typography>
                        )}
                    </ButtonBase>
                );
            })}
        </Box>
    );
}

interface EngagementProps {
    likes: number;
    liked: boolean;
    onLike: () => void;
    comments?: number;
    commentLabel?: string;
    onComment?: () => void;
    views?: number;
}

/** Heart / comment / views counters. The heart asset is the "liked" state; unliked is desaturated. */
export function Engagement({ likes, liked, onLike, comments, commentLabel, onComment, views }: EngagementProps) {
    const item = { display: "flex", alignItems: "center", gap: "6px", ...TEXT.med16, color: CC.n200, borderRadius: "6px" } as const;
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <ButtonBase
                aria-label={liked ? "Unlike" : "Like"}
                aria-pressed={liked}
                onClick={(e) => {
                    e.stopPropagation();
                    onLike();
                }}
                sx={item}
            >
                <Icon
                    name="icon-heart.svg"
                    size={20}
                    sx={{ filter: liked ? "none" : "grayscale(1) brightness(1.6)", opacity: liked ? 1 : 0.7, transition: "filter .15s ease, transform .15s ease", "&:active": { transform: "scale(1.2)" } }}
                />
                {likes}
            </ButtonBase>
            {(comments !== undefined || commentLabel) &&
                (onComment ? (
                    <ButtonBase
                        aria-label={commentLabel ?? `${comments} replies`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onComment();
                        }}
                        sx={item}
                    >
                        <Icon name="icon-message-circle.svg" size={20} />
                        {commentLabel ?? comments}
                    </ButtonBase>
                ) : (
                    <Box sx={item} aria-label={`${comments} replies`}>
                        <Icon name="icon-message-circle.svg" size={20} />
                        {commentLabel ?? comments}
                    </Box>
                ))}
            {views !== undefined && (
                <Box sx={item} aria-label={`${views} views`}>
                    <Icon name="icon-eye.svg" size={20} />
                    {views}
                </Box>
            )}
        </Box>
    );
}
