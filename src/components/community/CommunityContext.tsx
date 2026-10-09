"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useStudent } from "@/contexts/StudentContext";
import {
    Attachment,
    Author,
    CategoryId,
    CURRENT_USER_ID,
    FeedFilter,
    makeCurrentUser,
    Post,
    Reply,
    seedPosts,
    SortKey,
    uid,
} from "./community-data";

export interface NewPostInput {
    title: string;
    categoryId: CategoryId;
    tags: string[];
    html: string;
    attachments: Attachment[];
}

export interface ReplyInput {
    html: string;
    attachments: Attachment[];
}

interface CommunityContextValue {
    posts: Post[];
    currentUser: Author;
    /** Resolves the seeded "me" author to the signed-in student. */
    resolveAuthor: (author: Author) => Author;
    filter: FeedFilter;
    setFilter: (filter: FeedFilter) => void;
    tagFilter: string[];
    setTagFilter: (tags: string[]) => void;
    sortKey: SortKey;
    setSortKey: (key: SortKey) => void;
    search: string;
    setSearch: (q: string) => void;
    newDiscussionOpen: boolean;
    openNewDiscussion: () => void;
    closeNewDiscussion: () => void;
    getPost: (id: string) => Post | undefined;
    createPost: (input: NewPostInput) => Post;
    togglePostLike: (postId: string) => void;
    togglePostSave: (postId: string) => void;
    votePoll: (postId: string, optionId: string) => void;
    registerView: (postId: string) => void;
    addReply: (postId: string, input: ReplyInput) => void;
    updateReply: (postId: string, replyId: string, input: ReplyInput) => void;
    deleteReply: (postId: string, replyId: string) => void;
    toggleReplyLike: (postId: string, replyId: string) => void;
}

const CommunityContext = createContext<CommunityContextValue | null>(null);

const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export function CommunityProvider({ children }: { children: React.ReactNode }) {
    const { profile, getProfile } = useStudent();
    useEffect(() => {
        if (!profile) void getProfile();
    }, [profile, getProfile]);
    const [posts, setPosts] = useState<Post[]>(() => seedPosts());
    const [filter, setFilter] = useState<FeedFilter>("all");
    const [tagFilter, setTagFilter] = useState<string[]>([]);
    const [sortKey, setSortKey] = useState<SortKey>("latest");
    const [search, setSearch] = useState("");
    const [newDiscussionOpen, setNewDiscussionOpen] = useState(false);

    const studentName = profile?.studentName;
    const studentPhoto = profile?.studentPhoto;
    const currentUser = useMemo(
        () => makeCurrentUser(studentName ? titleCase(studentName) : "Rohit Kulkarni", studentPhoto),
        [studentName, studentPhoto],
    );

    const resolveAuthor = useCallback(
        (author: Author) => (author.id === CURRENT_USER_ID ? { ...currentUser, avatar: currentUser.avatar ?? author.avatar } : author),
        [currentUser],
    );

    const updatePost = useCallback((postId: string, fn: (post: Post) => Post) => {
        setPosts((prev) => prev.map((p) => (p.id === postId ? fn(p) : p)));
    }, []);

    const updateReplies = useCallback(
        (postId: string, fn: (replies: Reply[]) => Reply[]) => updatePost(postId, (p) => ({ ...p, replies: fn(p.replies) })),
        [updatePost],
    );

    const value = useMemo<CommunityContextValue>(() => {
        const getPost = (id: string) => posts.find((p) => p.id === id);

        return {
            posts,
            currentUser,
            resolveAuthor,
            filter,
            setFilter,
            tagFilter,
            setTagFilter,
            sortKey,
            setSortKey,
            search,
            setSearch,
            newDiscussionOpen,
            openNewDiscussion: () => setNewDiscussionOpen(true),
            closeNewDiscussion: () => setNewDiscussionOpen(false),
            getPost,
            createPost: (input) => {
                const post: Post = {
                    id: uid("post"),
                    categoryId: input.categoryId,
                    tags: input.tags,
                    author: { ...currentUser, id: CURRENT_USER_ID },
                    createdAt: Date.now(),
                    title: input.title,
                    html: input.html,
                    attachments: input.attachments,
                    likes: 0,
                    liked: false,
                    views: 0,
                    saved: false,
                    replies: [],
                };
                setPosts((prev) => [post, ...prev]);
                return post;
            },
            togglePostLike: (postId) =>
                updatePost(postId, (p) => ({ ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) })),
            togglePostSave: (postId) => updatePost(postId, (p) => ({ ...p, saved: !p.saved })),
            votePoll: (postId, optionId) =>
                updatePost(postId, (p) => {
                    if (!p.poll || p.poll.votedOptionId === optionId) return p;
                    const previous = p.poll.votedOptionId;
                    return {
                        ...p,
                        poll: {
                            votedOptionId: optionId,
                            options: p.poll.options.map((o) => ({
                                ...o,
                                votes: o.votes + (o.id === optionId ? 1 : 0) - (o.id === previous ? 1 : 0),
                            })),
                        },
                    };
                }),
            registerView: (postId) => updatePost(postId, (p) => ({ ...p, views: p.views + 1 })),
            addReply: (postId, input) =>
                updateReplies(postId, (replies) => [
                    ...replies,
                    {
                        id: uid("reply"),
                        author: { ...currentUser, id: CURRENT_USER_ID },
                        createdAt: Date.now(),
                        html: input.html,
                        attachments: input.attachments,
                        likes: 0,
                        liked: false,
                    },
                ]),
            updateReply: (postId, replyId, input) =>
                updateReplies(postId, (replies) =>
                    replies.map((r) => (r.id === replyId ? { ...r, html: input.html, attachments: input.attachments } : r)),
                ),
            deleteReply: (postId, replyId) => updateReplies(postId, (replies) => replies.filter((r) => r.id !== replyId)),
            toggleReplyLike: (postId, replyId) =>
                updateReplies(postId, (replies) =>
                    replies.map((r) => (r.id === replyId ? { ...r, liked: !r.liked, likes: r.likes + (r.liked ? -1 : 1) } : r)),
                ),
        };
    }, [posts, currentUser, resolveAuthor, filter, tagFilter, sortKey, search, newDiscussionOpen, updatePost, updateReplies]);

    return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
    const ctx = useContext(CommunityContext);
    if (!ctx) throw new Error("useCommunity must be used inside <CommunityProvider>");
    return ctx;
}
