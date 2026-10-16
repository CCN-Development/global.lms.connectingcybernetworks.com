"use client";

import React, { useCallback, useState } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import toast from "react-hot-toast";
import type { CommunityPoll } from "@/contexts/CommunityContext";
import { CC, closesIn } from "./community-data";
import { Icon, TEXT } from "./community-ui";
import { useCommunity } from "./CommunityContext";

/** Vote / change / remove a vote with one request in flight at a time. */
export function usePollVoting() {
    const { api } = useCommunity();
    const { votePoll, retractVote } = api;
    const [busyPollId, setBusyPollId] = useState<string | null>(null);
    const vote = useCallback(
        async (pollId: string, optionIds: string[]) => {
            if (busyPollId) return;
            setBusyPollId(pollId);
            const res = optionIds.length ? await votePoll(pollId, optionIds) : await retractVote(pollId);
            setBusyPollId(null);
            if (!res.success) toast.error(res.message ?? "Couldn't save your vote");
        },
        [busyPollId, votePoll, retractVote],
    );
    return { busyPollId, vote };
}

interface PollOptionsProps {
    poll: CommunityPoll;
    /** Locked thread, request in flight, or read-only surface. */
    disabled?: boolean;
    /** The full new selection; an empty list means "remove my vote". */
    onVote: (optionIds: string[]) => void;
}

/** Bars run ~1.5× the vote share so smaller results stay readable, as in the design. */
const barWidth = (percent: number) => `${Math.min(100, Math.max(percent ? 8 : 0, percent * 1.5))}%`;

export function PollOptions({ poll, disabled, onVote }: PollOptionsProps) {
    const locked = disabled || poll.isClosed || (poll.hasVoted && !poll.allowVoteChange);
    const quizRevealed = poll.kind === "quiz" && poll.options.some((o) => o.isCorrect !== undefined);

    const choose = (optionId: string) => {
        if (locked) return;
        if (!poll.allowMultiple) {
            if (!poll.votedOptionIds.includes(optionId)) onVote([optionId]);
            return;
        }
        const next = poll.votedOptionIds.includes(optionId) ? poll.votedOptionIds.filter((id) => id !== optionId) : [...poll.votedOptionIds, optionId];
        if (poll.maxChoices && next.length > poll.maxChoices) return void toast.error(`You can pick up to ${poll.maxChoices} options`);
        onVote(next);
    };

    return (
        <Box
            role={poll.allowMultiple ? "group" : "radiogroup"}
            aria-label={poll.kind === "quiz" ? "Quiz options" : "Poll options"}
            sx={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}
        >
            {poll.options.map((option) => {
                const voted = option.votedByMe;
                const percent = option.percent ?? 0;
                const correct = quizRevealed && option.isCorrect;
                const showBar = poll.showResults || quizRevealed;
                const bar = quizRevealed ? (correct ? CC.pollCorrect : voted ? CC.pollWrong : "none") : voted ? CC.pollVoted : "none";
                // A revealed quiz always marks the right answer, even if nobody picked it.
                const width = correct ? "100%" : poll.showResults ? barWidth(percent) : quizRevealed && voted ? "100%" : 0;
                const accent = correct ? CC.success : quizRevealed && voted ? CC.error : voted ? CC.purple : CC.n500;
                const border = correct ? CC.success : voted && !poll.showResults ? CC.primary200 : "rgba(115,115,115,0.12)";
                return (
                    <ButtonBase
                        key={option.id}
                        role={poll.allowMultiple ? "checkbox" : "radio"}
                        aria-checked={voted}
                        aria-disabled={locked}
                        aria-label={poll.showResults ? `${option.text}, ${percent}%` : option.text}
                        onClick={(e) => {
                            e.stopPropagation();
                            choose(option.id);
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
                            border: `1px solid ${border}`,
                            bgcolor: CC.pollFill,
                            overflow: "hidden",
                            textAlign: "left",
                            cursor: locked ? "default" : "pointer",
                            transition: "border-color .15s ease",
                            "&:hover": { borderColor: locked ? undefined : "rgba(147,169,226,0.4)" },
                        }}
                    >
                        {showBar && (
                            <Box
                                aria-hidden
                                sx={{
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width,
                                    borderRadius: "99px",
                                    backgroundImage: bar,
                                    bgcolor: bar === "none" ? CC.pollOther : "transparent",
                                    transition: "width .4s ease",
                                }}
                            />
                        )}
                        <Typography sx={{ position: "relative", ...TEXT.med18, fontSize: { xs: "16px", sm: "18px" }, color: correct ? CC.white : CC.n100 }}>
                            {option.text}
                        </Typography>
                        {poll.showResults && (
                            <Typography sx={{ position: "relative", ...TEXT.med18, fontSize: { xs: "16px", sm: "18px" }, color: accent }}>{percent}%</Typography>
                        )}
                    </ButtonBase>
                );
            })}
        </Box>
    );
}

/** Votes · rules · deadline under a poll, and the explanation once a quiz question is answered. */
export function PollFooter({ poll, onRetract }: { poll: CommunityPoll; onRetract?: () => void }) {
    const parts: string[] = [];
    if (poll.voterCount !== null) parts.push(`${poll.voterCount} ${poll.kind === "quiz" ? "answer" : "vote"}${poll.voterCount === 1 ? "" : "s"}`);
    else parts.push(poll.kind === "quiz" ? "Answer to see the result" : poll.resultsVisibility === "after_close" ? "Results when the poll closes" : "Vote to see results");
    if (poll.allowMultiple) parts.push(poll.maxChoices ? `Pick up to ${poll.maxChoices}` : "Pick any");
    if (poll.isClosed) parts.push("Closed");
    else if (poll.closesAt) parts.push(closesIn(poll.closesAt));

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <Typography sx={{ ...TEXT.med16, color: CC.n400 }} suppressHydrationWarning>
                    {parts.join(" · ")}
                </Typography>
                {onRetract && poll.hasVoted && poll.allowVoteChange && !poll.isClosed && (
                    <ButtonBase onClick={onRetract} sx={{ ...TEXT.med14, color: CC.link, borderRadius: "4px", px: "4px" }}>
                        Remove my vote
                    </ButtonBase>
                )}
            </Box>
            {poll.kind === "quiz" && poll.answeredCorrectly !== undefined && poll.answeredCorrectly !== null && (
                <Typography sx={{ ...TEXT.med14, color: poll.answeredCorrectly ? CC.success : CC.error }}>
                    {poll.answeredCorrectly ? "Correct!" : "Not quite."}
                    {poll.explanation ? <Box component="span" sx={{ color: CC.n200 }}>{` ${poll.explanation}`}</Box> : null}
                </Typography>
            )}
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
