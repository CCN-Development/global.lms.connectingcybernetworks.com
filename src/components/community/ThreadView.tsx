"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, ButtonBase, CircularProgress, Typography } from "@mui/material";
import { Bell, BellOff, CircleCheck, CircleX } from "lucide-react";
import toast from "react-hot-toast";
import RichTextView from "@/components/editor/RichTextView";
import type { CommunityAuthor, CommunityPostDetail, CommunityReply } from "@/contexts/CommunityContext";
import { CC, longDate, textToHtml, timeAgo } from "./community-data";
import {
    ActionButton,
    ActionMenu,
    ActionMenuItem,
    AuthorRow,
    CategoryLabel,
    ConfirmModal,
    darkScroll,
    Divider,
    GlassCard,
    Icon,
    LmsButton,
    PillButton,
    StatusChip,
    TagChip,
    TEXT,
} from "./community-ui";
import { AttachmentChip, toEditorAttachment } from "./CommunityEditor";
import { useCommunity } from "./CommunityContext";
import { PostSkeletons } from "./CommunityFeed";
import ForumSidebar from "./ForumSidebar";
import { PostBadges } from "./PostCard";
import { Engagement, PollFooter, PollOptions, usePollVoting } from "./PostParts";
import PostThoughtsModal, { ThoughtsPayload } from "./PostThoughtsModal";
import ReportModal, { ReportTargetInput } from "./ReportModal";
import { useModeration } from "./manage/useModeration";

const REPLY_PARAMS = { mode: "tree" as const, sort: "oldest" as const, limit: 20, previewChildren: 3 };

// ─── Inline "Write reply" row ──────────────────────────────────────────────
function QuickReply({ onSend, onCancel }: { onSend: (text: string) => Promise<boolean>; onCancel: () => void }) {
    const [text, setText] = useState("");
    const [busy, setBusy] = useState(false);
    const send = async () => {
        if (!text.trim() || busy) return;
        setBusy(true);
        const ok = await onSend(text.trim());
        setBusy(false);
        if (ok) setText("");
    };
    return (
        <Box
            component="form"
            onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                void send();
            }}
            sx={{ display: "flex", gap: "16px", width: "100%" }}
        >
            <Box
                component="input"
                autoFocus
                value={text}
                placeholder="Write reply"
                aria-label="Write reply"
                maxLength={5000}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => e.key === "Escape" && onCancel()}
                sx={{
                    flex: 1,
                    minWidth: 0,
                    height: 44,
                    px: "16px",
                    borderRadius: "10px",
                    border: `1px solid ${CC.primary75}`,
                    backgroundImage: "linear-gradient(180deg, rgba(187,201,237,0.16) 0%, rgba(106,114,135,0.1) 100%)",
                    bgcolor: "transparent",
                    color: CC.white,
                    ...TEXT.interReg16,
                    outline: "none",
                    "&::placeholder": { color: CC.n300 },
                    "&:focus": { borderColor: CC.primary200 },
                }}
            />
            <LmsButton type="submit" disabled={!text.trim() || busy} sx={{ width: 77, flexShrink: 0 }}>
                {busy ? "…" : "Send"}
            </LmsButton>
        </Box>
    );
}

// ─── Reply card ────────────────────────────────────────────────────────────
interface ReplyCardProps {
    reply: CommunityReply;
    post: CommunityPostDetail;
    /** Author name of the reply this one sits under (to show "Replying to" only when it differs). */
    parentAuthorName?: string;
    highlighted?: boolean;
    /** Moderator actions (staff only), appended to the reply menu. */
    modItems?: ActionMenuItem[];
    onLike: () => void;
    onReply: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onReport: () => void;
    onToggleAnswer: () => void;
}

/** Moderators see who wrote anonymous content. */
export function RevealedAuthorNote({ author }: { author: CommunityAuthor | null | undefined }) {
    if (!author?.isAnonymous || !author.revealedAuthor) return null;
    return (
        <Typography sx={{ ...TEXT.med12, color: CC.n400 }}>
            Posted anonymously by <Box component="span" sx={{ color: CC.primary200 }}>{author.revealedAuthor.name}</Box> · only moderators see this
        </Typography>
    );
}

function ReplyCard({ reply, post, parentAuthorName, highlighted, modItems = [], onLike, onReply, onEdit, onDelete, onReport, onToggleAnswer }: ReplyCardProps) {
    const cardSx = { display: "flex", flexDirection: "column", gap: "12px", width: "100%", ...(highlighted && { outline: `1px solid ${CC.primary200}` }) } as const;

    if (reply.html === null || !reply.author) {
        return (
            <GlassCard sx={cardSx}>
                <Box id={`reply-${reply.id}`} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <Typography sx={{ ...TEXT.med14, color: CC.n500, fontStyle: "italic" }}>
                        {reply.status === "hidden" ? "This reply was hidden by a moderator" : "This reply was deleted"}
                    </Typography>
                    <Typography sx={{ ...TEXT.med14, color: CC.n300, whiteSpace: "nowrap" }} suppressHydrationWarning>
                        {timeAgo(reply.createdAt)}
                    </Typography>
                </Box>
            </GlassCard>
        );
    }

    const canAccept = post.permissions.canAcceptAnswer && reply.status === "published";
    const items: ActionMenuItem[] = [
        ...(canAccept
            ? [
                  {
                      label: reply.isAccepted ? "Unmark answer" : "Mark as answer",
                      icon: reply.isAccepted ? <CircleX size={20} color={CC.n200} /> : <CircleCheck size={20} color={CC.success} />,
                      onClick: onToggleAnswer,
                  },
              ]
            : []),
        ...(reply.permissions.canEdit ? [{ label: "Edit", icon: "icon-edit.svg", onClick: onEdit }] : []),
        ...(reply.permissions.canDelete ? [{ label: "Delete", icon: "icon-trash.svg", danger: true, onClick: onDelete }] : []),
        ...(!reply.isMine ? [{ label: "Report", icon: "icon-flag.svg", danger: true, onClick: onReport }] : []),
        ...modItems,
    ];
    const replyTo = reply.replyTo && reply.replyTo.name !== parentAuthorName ? reply.replyTo.name : null;

    return (
        <GlassCard sx={cardSx}>
            <Box id={`reply-${reply.id}`} sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <AuthorRow author={reply.author} you={reply.isMine} />
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: "12px", sm: "20px" }, flexShrink: 0 }}>
                    <Typography sx={{ ...TEXT.med14, color: CC.n300, whiteSpace: "nowrap" }} suppressHydrationWarning>
                        {timeAgo(reply.createdAt)}
                        {reply.editedAt ? " · edited" : ""}
                    </Typography>
                    {items.length > 0 && (
                        <ActionMenu
                            label="Reply options"
                            trigger={
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 16, height: 16 }}>
                                    <Icon name="icon-more-dots.svg" size={16} height={4} />
                                </Box>
                            }
                            items={items}
                        />
                    )}
                </Box>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", pl: { xs: 0, sm: "42px" } }}>
                {(reply.isAccepted || reply.status !== "published") && (
                    <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {reply.isAccepted && <StatusChip label="Accepted answer" color={CC.success} />}
                        {reply.status === "hidden" && <StatusChip label="Hidden by a moderator" color={CC.error} />}
                        {reply.status === "deleted" && <StatusChip label="Deleted" color={CC.error} />}
                    </Box>
                )}
                <RevealedAuthorNote author={reply.author} />
                {replyTo && (
                    <Typography sx={{ ...TEXT.med12, color: CC.n500 }}>
                        Replying to <Box component="span" sx={{ color: CC.link }}>@{replyTo}</Box>
                    </Typography>
                )}
                <RichTextView html={reply.html} className="community-rich community-rich--sm" allowClassAttr />
                {reply.attachments.length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {reply.attachments.map((a) => (
                            <AttachmentChip key={a.id} attachment={a} />
                        ))}
                    </Box>
                )}
                <Engagement
                    likes={reply.likes}
                    liked={reply.liked}
                    onLike={onLike}
                    commentLabel={reply.permissions.canReply ? "Reply" : undefined}
                    onComment={reply.permissions.canReply ? onReply : undefined}
                />
            </Box>
        </GlassCard>
    );
}

// ─── Activity side panel ───────────────────────────────────────────────────
function ActivityPanel({ post }: { post: CommunityPostDetail }) {
    const { created, frequentPoster, lastReply } = post.activity;
    const rows = [
        { label: "Created", author: created.author, date: created.at ?? post.createdAt },
        ...(frequentPoster ? [{ label: "Frequent Poster", author: frequentPoster.author, date: frequentPoster.at ?? post.createdAt }] : []),
        ...(lastReply ? [{ label: "Last Reply", author: lastReply.author, date: lastReply.at ?? post.createdAt }] : []),
    ];

    const stats = [
        { label: "Replies", value: post.replyCount },
        { label: "Likes", value: post.likes },
        { label: "Views", value: post.views },
    ];

    return (
        <Box
            component="aside"
            aria-label="Thread activity"
            sx={{
                width: { xs: "100%", lg: 295 },
                flexShrink: 0,
                position: { lg: "sticky" },
                top: 0,
                display: "flex",
                flexDirection: { xs: "column", sm: "row", lg: "column" },
                gap: "24px",
            }}
        >
            <GlassCard sx={{ display: "flex", flexDirection: "column", gap: "24px", flex: { sm: 1, lg: "none" } }}>
                <Typography sx={{ ...TEXT.semi18, color: CC.n200 }}>ACTIVITY</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {rows.map((row) => (
                        <Box key={row.label} sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <Typography sx={{ ...TEXT.reg14, color: CC.n500 }}>{row.label}</Typography>
                            <AuthorRow author={row.author} size={40} subtitle={longDate(row.date)} />
                        </Box>
                    ))}
                </Box>
            </GlassCard>

            <GlassCard sx={{ display: "flex", alignItems: "stretch", px: "12px !important", py: "24px !important", flex: { sm: 1, lg: "none" }, alignSelf: { sm: "flex-start", lg: "auto" }, width: { sm: "auto" } }}>
                {stats.map((s, i) => (
                    <Box
                        key={s.label}
                        sx={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            minHeight: 56,
                            borderLeft: i === 1 ? "1px solid rgba(206,210,220,0.12)" : "none",
                            borderRight: i === 1 ? "1px solid rgba(206,210,220,0.12)" : "none",
                        }}
                    >
                        <Typography sx={{ ...TEXT.med16, color: CC.white }}>{s.value}</Typography>
                        <Typography sx={{ ...TEXT.med16, color: CC.n300 }}>{s.label}</Typography>
                    </Box>
                ))}
            </GlassCard>
        </Box>
    );
}

// ─── Thread view ───────────────────────────────────────────────────────────
type Deleting = { kind: "post" } | { kind: "reply"; reply: CommunityReply } | null;

export default function ThreadView({ threadId }: { threadId: string }) {
    const router = useRouter();
    const { api, ready, bootError, retryBootstrap, filter, setFilter, openNewDiscussion, openEditDiscussion, paths } = useCommunity();
    const {
        activePost,
        replies,
        repliesMeta,
        repliesPostId,
        loadingReplies,
        spaces,
        getPost,
        getReplies,
        loadReplyChildren,
        getReplyThread,
        registerView,
        togglePostLike,
        setPostSaved,
        setPostSubscription,
        deletePost,
        createReply,
        updateReply,
        deleteReply,
        toggleReplyLike,
        acceptAnswer,
    } = api;
    const { busyPollId, vote } = usePollVoting();
    const moderation = useModeration({ onPostPurged: () => router.push(paths.feed) });

    const post = activePost?.id === threadId ? activePost : null;
    const repliesReady = repliesPostId === threadId;
    const [loadError, setLoadError] = useState<{ id: string; message: string } | null>(null);
    const [composerOpen, setComposerOpen] = useState(false);
    const [editing, setEditing] = useState<CommunityReply | null>(null);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<Deleting>(null);
    const [deleteBusy, setDeleteBusy] = useState(false);
    const [reportTarget, setReportTarget] = useState<ReportTargetInput | null>(null);
    const [highlightId, setHighlightId] = useState<string | null>(null);

    // Load the thread + first page of replies; count the view once per visit.
    useEffect(() => {
        if (!ready) return;
        let cancelled = false;
        void (async () => {
            const res = await getPost(threadId);
            if (cancelled) return;
            if (!res.success) return setLoadError({ id: threadId, message: res.message ?? "This discussion is no longer available" });
            setLoadError(null);
            void registerView(threadId);
            void getReplies(threadId, REPLY_PARAMS);
        })();
        return () => {
            cancelled = true;
        };
    }, [ready, threadId, getPost, getReplies, registerView]);

    // Deep link from a notification: ?reply=<id> → expand its ancestors, scroll to it and highlight it.
    const deepLinked = useRef<string | null>(null);
    useEffect(() => {
        if (!post || !repliesReady || typeof window === "undefined") return;
        const target = new URLSearchParams(window.location.search).get("reply");
        if (!target || deepLinked.current === target) return;
        deepLinked.current = target;
        void (async () => {
            if (!document.getElementById(`reply-${target}`)) {
                const thread = await getReplyThread(target);
                if (thread.success && thread.data) {
                    for (const ancestor of thread.data.ancestors) await loadReplyChildren(threadId, ancestor.id, { limit: 50 });
                }
            }
            window.setTimeout(() => {
                document.getElementById(`reply-${target}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                setHighlightId(target);
                window.setTimeout(() => setHighlightId(null), 2500);
            }, 150);
        })();
    }, [post, repliesReady, threadId, getReplyThread, loadReplyChildren]);

    const fail = useCallback((message: string | null, fallback: string) => {
        toast.error(message ?? fallback);
        return false;
    }, []);

    // Stable object — the modal re-fills the editor whenever `initial` changes.
    const editingInitial = useMemo(
        () => (editing ? { html: editing.html ?? "", attachments: editing.attachments.map(toEditorAttachment) } : undefined),
        [editing],
    );

    if (bootError) {
        return (
            <GlassCard sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", py: "64px !important", textAlign: "center" }}>
                <Typography sx={{ ...TEXT.poppinsSemi20, color: CC.white }}>Couldn&apos;t load the community</Typography>
                <Typography sx={{ ...TEXT.med14, color: CC.n300 }}>{bootError}</Typography>
                <LmsButton onClick={retryBootstrap} sx={{ width: 200 }}>
                    Try again
                </LmsButton>
            </GlassCard>
        );
    }

    if (loadError?.id === threadId) {
        return (
            <GlassCard sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", py: "64px !important", textAlign: "center" }}>
                <Typography sx={{ ...TEXT.poppinsSemi20, color: CC.white }}>This discussion is no longer available</Typography>
                <Typography sx={{ ...TEXT.med14, color: CC.n300 }}>It may have been removed or the link is incorrect.</Typography>
                <LmsButton onClick={() => router.push(paths.feed)} sx={{ width: 200 }}>
                    Back to Feed
                </LmsButton>
            </GlassCard>
        );
    }

    const sidebar = (
        <ForumSidebar
            active={filter}
            onSelect={(f) => {
                setFilter(f);
                router.push(paths.feed);
            }}
            onNewDiscussion={openNewDiscussion}
        />
    );

    if (!post) {
        return (
            <Box sx={{ display: "flex", gap: "24px", height: "100%", minHeight: 0 }}>
                {sidebar}
                <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "24px" }}>
                    <PostSkeletons count={2} />
                </Box>
            </Box>
        );
    }

    const space = spaces.find((s) => s.id === post.space.id);
    const allowAnonymous = Boolean(space?.allowAnonymous);
    const canReply = post.permissions.canReply;
    const pollPost = post.postType === "poll" && post.poll;

    const share = async () => {
        const url = `${window.location.origin}${window.location.pathname}`;
        try {
            if (navigator.share) await navigator.share({ title: post.title, url });
            else {
                await navigator.clipboard.writeText(url);
                toast.success("Link copied to clipboard");
            }
        } catch (err) {
            if ((err as DOMException)?.name !== "AbortError") toast.error("Couldn't share this discussion");
        }
    };

    const likePost = async () => {
        const res = await togglePostLike(post);
        if (!res.success) fail(res.message, "Couldn't update your like");
    };

    const likeReply = async (reply: CommunityReply) => {
        const res = await toggleReplyLike(reply);
        if (!res.success) fail(res.message, "Couldn't update your like");
    };

    const toggleSaved = async () => {
        const res = await setPostSaved(post.id, !post.saved);
        if (!res.success) return fail(res.message, "Couldn't update saved posts");
        toast.success(post.saved ? "Removed from saved posts" : "Saved to your posts");
    };

    const toggleFollow = async () => {
        const res = await setPostSubscription(post.id, post.subscription === "watching" ? "muted" : "watching");
        if (!res.success) return fail(res.message, "Couldn't update notifications");
        toast.success(res.message ?? "Updated");
    };

    const toggleAnswer = async (reply: CommunityReply) => {
        const res = await acceptAnswer(post.id, reply.isAccepted ? null : reply.id);
        if (!res.success) return fail(res.message, "Couldn't update the accepted answer");
        toast.success(res.message ?? "Updated");
    };

    const sendQuickReply = async (target: CommunityReply, text: string) => {
        const res = await createReply(post.id, { html: textToHtml(text), parentReplyId: target.id });
        if (!res.success) return fail(res.message, "Couldn't post your reply");
        setReplyingTo(null);
        toast.success("Reply posted");
        return true;
    };

    const submitThoughts = async (input: ThoughtsPayload) => {
        if (editing) {
            const res = await updateReply(editing.id, { html: input.html, attachmentIds: input.attachmentIds });
            if (!res.success) return fail(res.message, "Couldn't update your reply");
            toast.success("Reply updated");
            return true;
        }
        const res = await createReply(post.id, input);
        if (!res.success) return fail(res.message, "Couldn't post your reply");
        toast.success("Your thoughts were posted");
        return true;
    };

    const confirmDelete = async () => {
        if (!deleting) return;
        setDeleteBusy(true);
        const res = deleting.kind === "post" ? await deletePost(post.id) : await deleteReply(deleting.reply.id);
        setDeleteBusy(false);
        if (!res.success) return void fail(res.message, "Couldn't delete");
        toast.success(deleting.kind === "post" ? "Discussion deleted" : "Reply deleted");
        setDeleting(null);
        if (deleting.kind === "post") router.push(paths.feed);
    };

    const postMenu: ActionMenuItem[] = [
        { label: post.saved ? "Unsave" : "Save", icon: "icon-bookmark.svg", onClick: () => void toggleSaved() },
        {
            label: post.subscription === "watching" ? "Mute replies" : "Follow replies",
            icon: post.subscription === "watching" ? <BellOff size={20} color={CC.n200} /> : <Bell size={20} color={CC.n200} />,
            onClick: () => void toggleFollow(),
        },
        ...(post.permissions.canEdit ? [{ label: "Edit", icon: "icon-edit.svg", onClick: () => openEditDiscussion(post) }] : []),
        ...(post.permissions.canDelete ? [{ label: "Delete", icon: "icon-trash.svg", danger: true, onClick: () => setDeleting({ kind: "post" }) }] : []),
        ...(!post.isMine ? [{ label: "Report", icon: "icon-flag.svg", danger: true, onClick: () => setReportTarget({ targetType: "post", postId: post.id }) }] : []),
        ...moderation.postItems(post),
    ];

    const canModerate = post.permissions.canModerate;
    const canApprove = post.status === "pending_review" && post.permissions.capabilities.includes("post.approve");
    const statusNote =
        post.status === "pending_review"
            ? {
                  color: "#FFAD4F",
                  text: canModerate
                      ? "Waiting for approval — members can't see this discussion until a moderator approves it."
                      : "Waiting for moderator approval — only you can see this discussion for now.",
              }
            : post.status === "rejected"
              ? { color: CC.error, text: `Not approved${post.moderationNote ? `: ${post.moderationNote}` : ""}.${post.isMine ? " Edit it to submit again." : ""}` }
              : post.status === "hidden"
                ? { color: CC.error, text: `Hidden by a moderator${post.moderationNote ? `: ${post.moderationNote}` : ""}.` }
                : post.status === "deleted"
                  ? { color: CC.error, text: `Removed${post.moderationNote ? `: ${post.moderationNote}` : ""}. Only moderators can see it.` }
                  : null;

    const renderReplies = (list: CommunityReply[], parent?: CommunityReply): React.ReactNode =>
        list.map((reply) => {
            const children = reply.children ?? [];
            const hiddenChildren = Math.max(0, reply.childCount - children.filter((c) => c.status === "published").length);
            return (
                <React.Fragment key={reply.id}>
                    <ReplyCard
                        reply={reply}
                        post={post}
                        parentAuthorName={parent?.author?.name}
                        highlighted={highlightId === reply.id}
                        modItems={moderation.replyItems(reply, post)}
                        onLike={() => void likeReply(reply)}
                        onReply={() => setReplyingTo((cur) => (cur === reply.id ? null : reply.id))}
                        onEdit={() => setEditing(reply)}
                        onDelete={() => setDeleting({ kind: "reply", reply })}
                        onReport={() => setReportTarget({ targetType: "reply", replyId: reply.id })}
                        onToggleAnswer={() => void toggleAnswer(reply)}
                    />
                    {replyingTo === reply.id && <QuickReply onSend={(text) => sendQuickReply(reply, text)} onCancel={() => setReplyingTo(null)} />}
                    {(children.length > 0 || (reply.hasMoreChildren && hiddenChildren > 0)) && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", pl: { xs: "16px", sm: "42px" } }}>
                            {renderReplies(children, reply)}
                            {reply.hasMoreChildren && hiddenChildren > 0 && (
                                <ButtonBase
                                    onClick={() => void loadReplyChildren(post.id, reply.id, { limit: 50 })}
                                    sx={{ alignSelf: "flex-start", ...TEXT.med14, color: CC.link, borderRadius: "4px", px: "4px" }}
                                >
                                    View {hiddenChildren} more repl{hiddenChildren === 1 ? "y" : "ies"}
                                </ButtonBase>
                            )}
                        </Box>
                    )}
                </React.Fragment>
            );
        });

    return (
        <Box sx={{ display: "flex", gap: "24px", height: "100%", minHeight: 0 }}>
            {sidebar}

            <Box
                sx={{
                    flex: 1,
                    minWidth: 0,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: { xs: "column", lg: "row" },
                    alignItems: { lg: "flex-start" },
                    gap: "24px",
                    pr: "4px",
                    pb: "16px",
                    ...darkScroll,
                }}
            >
                <Box component="article" sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Category, tags, overflow menu */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", minWidth: 0 }}>
                            {post.isPinned && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mr: "8px" }}>
                                    <Icon name="icon-pinned-purple.svg" size={24} />
                                    <Typography sx={{ ...TEXT.med16, color: CC.purple }}>Pinned by {post.pinnedBy ?? "Moderator"}</Typography>
                                </Box>
                            )}
                            <CategoryLabel category={post.category} />
                            {post.tags.map((tag) => (
                                <TagChip key={tag} label={tag} />
                            ))}
                            <PostBadges post={post} />
                        </Box>
                        <ActionMenu label="Discussion options" trigger={<Icon name="icon-more-horiz.svg" size={24} />} items={postMenu} />
                    </Box>

                    {statusNote && (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "12px",
                                flexWrap: "wrap",
                                px: "16px",
                                py: "12px",
                                borderRadius: "12px",
                                border: `1px solid ${statusNote.color}`,
                                bgcolor: "rgba(0,0,0,0.24)",
                            }}
                        >
                            <Typography sx={{ ...TEXT.med14, color: statusNote.color }}>{statusNote.text}</Typography>
                            {canApprove && (
                                <Box sx={{ display: "flex", gap: "8px" }}>
                                    <ActionButton tone="success" icon={<CircleCheck size={18} />} disabled={moderation.busy} onClick={() => void moderation.approve(post.id)}>
                                        Approve
                                    </ActionButton>
                                    <ActionButton tone="danger" icon={<CircleX size={18} />} disabled={moderation.busy} onClick={() => moderation.reject(post.id)}>
                                        Reject
                                    </ActionButton>
                                </Box>
                            )}
                        </Box>
                    )}

                    <RevealedAuthorNote author={post.author} />

                    {/* Title & body */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Typography component="h1" sx={{ ...TEXT.poppinsSemi20, fontSize: { xs: "18px", sm: "20px" }, color: CC.white }}>
                            {post.title}
                        </Typography>
                        {post.html && <RichTextView html={post.html} className="community-rich" allowClassAttr />}
                        {post.attachments.length > 0 && (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px", mt: "4px" }}>
                                {post.attachments.map((a) => (
                                    <AttachmentChip key={a.id} attachment={a} />
                                ))}
                            </Box>
                        )}
                    </Box>

                    {/* Poll / quiz questions */}
                    {post.polls.map((poll, i) => (
                        <Box key={poll.id} sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {post.postType === "quiz" && (
                                <Typography sx={{ ...TEXT.semi18, color: CC.n100 }}>
                                    {post.polls.length > 1 ? `Q${i + 1}. ` : ""}
                                    {poll.question ?? post.title}
                                </Typography>
                            )}
                            <PollOptions
                                poll={poll}
                                disabled={post.isLocked || post.status !== "published" || busyPollId === poll.id}
                                onVote={(ids) => void vote(poll.id, ids)}
                            />
                            {post.postType === "quiz" && <PollFooter poll={poll} />}
                        </Box>
                    ))}

                    {/* Votes / likes + actions */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                        {pollPost ? (
                            <PollFooter poll={pollPost} onRetract={() => void vote(pollPost.id, [])} />
                        ) : (
                            <Engagement likes={post.likes} liked={post.liked} onLike={() => void likePost()} />
                        )}
                        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", ml: "auto" }}>
                            {pollPost && <Engagement likes={post.likes} liked={post.liked} onLike={() => void likePost()} />}
                            <PillButton icon="icon-reply.svg" onClick={() => setComposerOpen(true)} disabled={!canReply}>
                                {canReply ? "Post your thoughts" : post.isLocked ? "Replies are closed" : "Replies unavailable"}
                            </PillButton>
                            <PillButton icon="icon-share.svg" onClick={share}>
                                Share
                            </PillButton>
                        </Box>
                    </Box>

                    <Divider />

                    {/* Replies */}
                    <Box component="section" aria-label="Replies" sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <Typography sx={{ ...TEXT.med14, color: CC.n200 }}>
                            {post.replyCount} {post.replyCount === 1 ? "Reply" : "Replies"}
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {repliesReady && renderReplies(replies)}
                            {(loadingReplies || !repliesReady) && (
                                <Box sx={{ display: "flex", justifyContent: "center", py: "8px" }}>
                                    <CircularProgress size={24} sx={{ color: CC.primary200 }} />
                                </Box>
                            )}
                            {repliesReady && !loadingReplies && repliesMeta?.hasMore && (
                                <ButtonBase
                                    onClick={() => void getReplies(post.id, { ...REPLY_PARAMS, page: repliesMeta.page + 1 }, { append: true })}
                                    sx={{ alignSelf: "center", ...TEXT.med14, color: CC.link, borderRadius: "4px", px: "8px", py: "4px" }}
                                >
                                    Load more replies
                                </ButtonBase>
                            )}
                            {repliesReady && !loadingReplies && replies.length === 0 && (
                                <GlassCard sx={{ textAlign: "center" }}>
                                    <Typography sx={{ ...TEXT.med14, color: CC.n300 }}>
                                        {canReply ? (
                                            <>
                                                No replies yet —{" "}
                                                <ButtonBase onClick={() => setComposerOpen(true)} sx={{ ...TEXT.med14, color: CC.link, verticalAlign: "baseline" }}>
                                                    be the first to post your thoughts
                                                </ButtonBase>
                                            </>
                                        ) : (
                                            "No replies yet"
                                        )}
                                    </Typography>
                                </GlassCard>
                            )}
                        </Box>
                    </Box>
                </Box>

                <ActivityPanel post={post} />
            </Box>

            <PostThoughtsModal
                open={composerOpen || Boolean(editing)}
                initial={editingInitial}
                spaceId={post.space.id}
                allowAnonymous={allowAnonymous && !editing}
                onClose={() => {
                    setComposerOpen(false);
                    setEditing(null);
                }}
                onSubmit={submitThoughts}
            />

            <ConfirmModal
                open={Boolean(deleting)}
                title={deleting?.kind === "post" ? "Delete discussion?" : "Delete reply?"}
                message={
                    deleting?.kind === "post"
                        ? "This discussion and its replies will be removed from the community."
                        : "This reply will be permanently removed from the discussion."
                }
                busy={deleteBusy}
                onConfirm={() => void confirmDelete()}
                onClose={() => setDeleting(null)}
            />

            <ReportModal target={reportTarget} onClose={() => setReportTarget(null)} />
            {moderation.modals}
        </Box>
    );
}
