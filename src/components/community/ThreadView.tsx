"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, ButtonBase, Typography } from "@mui/material";
import toast from "react-hot-toast";
import RichTextView from "@/components/editor/RichTextView";
import {
    Author,
    CC,
    CURRENT_USER_ID,
    escapeHtml,
    longDate,
    mentionHtml,
    Post,
    pollTotal,
    Reply,
    timeAgo,
} from "./community-data";
import {
    ActionMenu,
    AuthorRow,
    CategoryLabel,
    CommunityModal,
    darkScroll,
    Divider,
    GlassCard,
    Icon,
    LmsButton,
    PillButton,
    TagChip,
    TEXT,
} from "./community-ui";
import { AttachmentChip } from "./CommunityEditor";
import { ReplyInput as ReplyPayload, useCommunity } from "./CommunityContext";
import ForumSidebar from "./ForumSidebar";
import { Engagement, PollOptions } from "./PostParts";
import PostThoughtsModal from "./PostThoughtsModal";

const FEED_PATH = "/dashboard/student/community";

// ─── Inline "Write reply" row ──────────────────────────────────────────────
function QuickReply({ onSend, onCancel }: { onSend: (text: string) => void; onCancel: () => void }) {
    const [text, setText] = useState("");
    const send = () => {
        if (!text.trim()) return;
        onSend(text.trim());
        setText("");
    };
    return (
        <Box
            component="form"
            onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                send();
            }}
            sx={{ display: "flex", gap: "16px", width: "100%" }}
        >
            <Box
                component="input"
                autoFocus
                value={text}
                placeholder="Write reply"
                aria-label="Write reply"
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
            <LmsButton type="submit" disabled={!text.trim()} sx={{ width: 77, flexShrink: 0 }}>
                Send
            </LmsButton>
        </Box>
    );
}

// ─── Reply card ────────────────────────────────────────────────────────────
interface ReplyCardProps {
    reply: Reply;
    author: Author;
    onLike: () => void;
    onReply: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

function ReplyCard({ reply, author, onLike, onReply, onEdit, onDelete }: ReplyCardProps) {
    const mine = reply.author.id === CURRENT_USER_ID;
    return (
        <GlassCard sx={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <AuthorRow author={author} you={mine} />
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: "12px", sm: "20px" }, flexShrink: 0 }}>
                    <Typography sx={{ ...TEXT.med14, color: CC.n300, whiteSpace: "nowrap" }} suppressHydrationWarning>
                        {timeAgo(reply.createdAt)}
                    </Typography>
                    {mine && (
                        <ActionMenu
                            label="Reply options"
                            trigger={
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 16, height: 16 }}>
                                    <Icon name="icon-more-dots.svg" size={16} height={4} />
                                </Box>
                            }
                            items={[
                                { label: "Edit", icon: "icon-edit.svg", onClick: onEdit },
                                { label: "Delete", icon: "icon-trash.svg", danger: true, onClick: onDelete },
                            ]}
                        />
                    )}
                </Box>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", pl: { xs: 0, sm: "42px" } }}>
                <RichTextView html={reply.html} className="community-rich community-rich--sm" allowClassAttr />
                {reply.attachments.length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {reply.attachments.map((a) => (
                            <AttachmentChip key={a.id} attachment={a} />
                        ))}
                    </Box>
                )}
                <Engagement likes={reply.likes} liked={reply.liked} onLike={onLike} commentLabel="Reply" onComment={onReply} />
            </Box>
        </GlassCard>
    );
}

// ─── Activity side panel ───────────────────────────────────────────────────
function ActivityPanel({ post, resolveAuthor }: { post: Post; resolveAuthor: (a: Author) => Author }) {
    const frequent = useMemo(() => {
        const counts = new Map<string, { reply: Reply; count: number }>();
        post.replies.forEach((r) => {
            const entry = counts.get(r.author.id);
            counts.set(r.author.id, { reply: r, count: (entry?.count ?? 0) + 1 });
        });
        return [...counts.values()].sort((a, b) => b.count - a.count || b.reply.createdAt - a.reply.createdAt)[0]?.reply;
    }, [post.replies]);
    const last = post.replies[post.replies.length - 1];

    const rows: { label: string; author: Author; date: number }[] = [
        { label: "Created", author: post.author, date: post.createdAt },
        ...(frequent ? [{ label: "Frequent Poster", author: frequent.author, date: frequent.createdAt }] : []),
        ...(last ? [{ label: "Last Reply", author: last.author, date: last.createdAt }] : []),
    ];

    const stats = [
        { label: "Replies", value: post.replies.length },
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
                            <AuthorRow author={resolveAuthor(row.author)} size={40} subtitle={longDate(row.date)} />
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
export default function ThreadView({ threadId }: { threadId: string }) {
    const router = useRouter();
    const {
        posts,
        filter,
        setFilter,
        openNewDiscussion,
        getPost,
        resolveAuthor,
        registerView,
        togglePostLike,
        togglePostSave,
        votePoll,
        addReply,
        updateReply,
        deleteReply,
        toggleReplyLike,
    } = useCommunity();
    const post = getPost(threadId);

    const [composerOpen, setComposerOpen] = useState(false);
    const [editing, setEditing] = useState<Reply | null>(null);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<Reply | null>(null);

    const viewed = useRef<string | null>(null);
    useEffect(() => {
        if (post && viewed.current !== threadId) {
            viewed.current = threadId;
            registerView(threadId);
        }
    }, [post, threadId, registerView]);

    const editingInitial = useMemo<ReplyPayload | undefined>(
        () => (editing ? { html: editing.html, attachments: editing.attachments } : undefined),
        [editing],
    );

    if (!post) {
        return (
            <GlassCard sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", py: "64px !important", textAlign: "center" }}>
                <Typography sx={{ ...TEXT.poppinsSemi20, color: CC.white }}>This discussion is no longer available</Typography>
                <Typography sx={{ ...TEXT.med14, color: CC.n300 }}>It may have been removed or the link is incorrect.</Typography>
                <LmsButton onClick={() => router.push(FEED_PATH)} sx={{ width: 200 }}>
                    Back to Feed
                </LmsButton>
            </GlassCard>
        );
    }

    const share = async () => {
        const url = window.location.href;
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

    const sendQuickReply = (target: Reply, text: string) => {
        const author = resolveAuthor(target.author);
        const prefix = target.author.id === CURRENT_USER_ID ? "" : `${mentionHtml(author.name)} `;
        addReply(post.id, { html: `<p>${prefix}${escapeHtml(text)}</p>`, attachments: [] });
        setReplyingTo(null);
        toast.success("Reply posted");
    };

    return (
        <Box sx={{ display: "flex", gap: "24px", height: "100%", minHeight: 0 }}>
            <ForumSidebar
                posts={posts}
                active={filter}
                onSelect={(f) => {
                    setFilter(f);
                    router.push(FEED_PATH);
                }}
                onNewDiscussion={openNewDiscussion}
            />

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
                            {post.pinnedBy && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mr: "8px" }}>
                                    <Icon name="icon-pinned-purple.svg" size={24} />
                                    <Typography sx={{ ...TEXT.med16, color: CC.purple }}>Pinned by {post.pinnedBy}</Typography>
                                </Box>
                            )}
                            <CategoryLabel categoryId={post.categoryId} />
                            {post.tags.map((tag) => (
                                <TagChip key={tag} label={tag} />
                            ))}
                        </Box>
                        <ActionMenu
                            label="Discussion options"
                            trigger={<Icon name="icon-more-horiz.svg" size={24} />}
                            items={[
                                {
                                    label: post.saved ? "Unsave" : "Save",
                                    icon: "icon-bookmark.svg",
                                    onClick: () => {
                                        togglePostSave(post.id);
                                        toast.success(post.saved ? "Removed from saved posts" : "Saved to your posts");
                                    },
                                },
                                {
                                    label: "Report",
                                    icon: "icon-flag.svg",
                                    danger: true,
                                    onClick: () => toast.success("Thanks — a trainer will review this discussion"),
                                },
                            ]}
                        />
                    </Box>

                    {/* Title & body */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Typography component="h1" sx={{ ...TEXT.poppinsSemi20, fontSize: { xs: "18px", sm: "20px" }, color: CC.white }}>
                            {post.title}
                        </Typography>
                        {post.html && <RichTextView html={post.html} className="community-rich" allowClassAttr />}
                        {post.attachments && post.attachments.length > 0 && (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px", mt: "4px" }}>
                                {post.attachments.map((a) => (
                                    <AttachmentChip key={a.id} attachment={a} />
                                ))}
                            </Box>
                        )}
                    </Box>

                    {post.poll && <PollOptions post={post} showResults onVote={(id) => votePoll(post.id, id)} />}

                    {/* Votes / likes + actions */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                        {post.poll ? (
                            <Typography sx={{ ...TEXT.med16, color: CC.n400 }}>
                                {pollTotal(post.poll)} vote{pollTotal(post.poll) === 1 ? "" : "s"}
                            </Typography>
                        ) : (
                            <Engagement likes={post.likes} liked={post.liked} onLike={() => togglePostLike(post.id)} />
                        )}
                        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", ml: "auto" }}>
                            <PillButton icon="icon-reply.svg" onClick={() => setComposerOpen(true)}>
                                Post your thoughts
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
                            {post.replies.length} {post.replies.length === 1 ? "Reply" : "Replies"}
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {post.replies.map((reply) => (
                                <React.Fragment key={reply.id}>
                                    <ReplyCard
                                        reply={reply}
                                        author={resolveAuthor(reply.author)}
                                        onLike={() => toggleReplyLike(post.id, reply.id)}
                                        onReply={() => setReplyingTo((cur) => (cur === reply.id ? null : reply.id))}
                                        onEdit={() => setEditing(reply)}
                                        onDelete={() => setDeleting(reply)}
                                    />
                                    {replyingTo === reply.id && (
                                        <QuickReply onSend={(text) => sendQuickReply(reply, text)} onCancel={() => setReplyingTo(null)} />
                                    )}
                                </React.Fragment>
                            ))}
                            {post.replies.length === 0 && (
                                <GlassCard sx={{ textAlign: "center" }}>
                                    <Typography sx={{ ...TEXT.med14, color: CC.n300 }}>
                                        No replies yet —{" "}
                                        <ButtonBase onClick={() => setComposerOpen(true)} sx={{ ...TEXT.med14, color: CC.link, verticalAlign: "baseline" }}>
                                            be the first to post your thoughts
                                        </ButtonBase>
                                    </Typography>
                                </GlassCard>
                            )}
                        </Box>
                    </Box>
                </Box>

                <ActivityPanel post={post} resolveAuthor={resolveAuthor} />
            </Box>

            <PostThoughtsModal
                open={composerOpen || Boolean(editing)}
                initial={editingInitial}
                onClose={() => {
                    setComposerOpen(false);
                    setEditing(null);
                }}
                onSubmit={(input) => {
                    if (editing) {
                        updateReply(post.id, editing.id, input);
                        toast.success("Reply updated");
                    } else {
                        addReply(post.id, input);
                        toast.success("Your thoughts were posted");
                    }
                }}
            />

            <CommunityModal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete reply?" width={440}>
                <Typography sx={{ ...TEXT.med16, color: CC.n200 }}>This reply will be permanently removed from the discussion.</Typography>
                <Box sx={{ display: "flex", gap: "12px" }}>
                    <ButtonBase
                        onClick={() => setDeleting(null)}
                        sx={{ flex: 1, height: 44, borderRadius: "10px", border: `1px solid ${CC.n700}`, color: CC.n100, ...TEXT.interMed14, "&:hover": { borderColor: CC.n500 } }}
                    >
                        Cancel
                    </ButtonBase>
                    <ButtonBase
                        onClick={() => {
                            if (deleting) deleteReply(post.id, deleting.id);
                            setDeleting(null);
                            toast.success("Reply deleted");
                        }}
                        sx={{ flex: 1, height: 44, borderRadius: "10px", bgcolor: CC.error, color: CC.white, ...TEXT.interMed14, "&:hover": { bgcolor: "#b52233" } }}
                    >
                        Delete
                    </ButtonBase>
                </Box>
            </CommunityModal>
        </Box>
    );
}
