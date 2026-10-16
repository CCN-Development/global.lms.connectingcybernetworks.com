"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    CommunityApiContextValue,
    CommunityCapability,
    CommunityCategory,
    CommunityPostDetail,
    CommunityTag,
    feedParamsFromSelection,
    useCommunityApi,
} from "@/contexts/CommunityContext";
import { buildFeedMenu, CommunityVariant, FeedFilter, FeedMenuItem, ManageView, SortKey } from "./community-data";

const PAGE_SIZE = 20;

export interface CommunityPaths {
    feed: string;
    thread: (postId: string, replyId?: string) => string;
    view: (view: ManageView) => string;
}

/**
 * Screen state for the community pages (filters, sort, search, modals) on top of the API context.
 * Data and actions live in `api` (CommunityApiProvider) so every component shares the same state.
 * The same components serve students (/dashboard/student/community) and every staff role
 * (/dashboard/<role>/ccn-forum); `variant` turns on the management UI, `basePath` drives links.
 */
interface CommunityContextValue {
    api: CommunityApiContextValue;
    ready: boolean;
    bootError: string | null;
    retryBootstrap: () => void;

    variant: CommunityVariant;
    /** Staff variant and the signed-in member is staff. */
    isStaffView: boolean;
    paths: CommunityPaths;
    /** Global (role) capability of the signed-in member. */
    can: (capability: CommunityCapability) => boolean;
    /** Re-fetch the moderation queue counts (sidebar badges). */
    refreshQueue: () => void;

    menu: FeedMenuItem[];
    /** Categories / tags the viewer may post with (staff-only ones hidden for students). */
    postableCategories: CommunityCategory[];
    postableTags: CommunityTag[];
    tagLabel: (slug: string) => string;

    filter: FeedFilter;
    setFilter: (filter: FeedFilter) => void;
    /** Tag slugs. */
    tagFilter: string[];
    setTagFilter: (tags: string[]) => void;
    sortKey: SortKey;
    setSortKey: (key: SortKey) => void;
    search: string;
    setSearch: (q: string) => void;
    loadMore: () => void;
    refreshFeed: () => void;
    /** First page of a new filter / sort / search is loading. */
    refreshing: boolean;

    newDiscussionOpen: boolean;
    editingPost: CommunityPostDetail | null;
    openNewDiscussion: () => void;
    openEditDiscussion: (post: CommunityPostDetail) => void;
    closeNewDiscussion: () => void;
}

const CommunityContext = createContext<CommunityContextValue | null>(null);

export interface CommunityProviderProps {
    children: React.ReactNode;
    /** Route of the feed, e.g. /dashboard/admin/ccn-forum. Threads live at `${basePath}/<postId>`. */
    basePath: string;
    variant?: CommunityVariant;
}

export function CommunityProvider({ children, basePath, variant = "student" }: CommunityProviderProps) {
    const api = useCommunityApi();
    const { getBootstrap, getFeed, getQueueSummary, initialized, me, categories, tags, feedMeta, loadingFeed } = api;

    const [bootError, setBootError] = useState<string | null>(null);
    const [filter, setFilter] = useState<FeedFilter>("all");
    const [tagFilter, setTagFilter] = useState<string[]>([]);
    const [sortKey, setSortKey] = useState<SortKey>("latest");
    const [search, setSearch] = useState("");
    const [newDiscussionOpen, setNewDiscussionOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<CommunityPostDetail | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const refreshId = useRef(0);

    const bootstrap = useCallback(async () => {
        setBootError(null);
        const res = await getBootstrap();
        if (!res.success) setBootError(res.message ?? "Couldn't load the community");
    }, [getBootstrap]);

    useEffect(() => {
        void bootstrap();
    }, [bootstrap]);

    const feedParams = useCallback(
        (page: number) => ({ ...feedParamsFromSelection(filter), tags: tagFilter, sort: sortKey, search: search.trim() || undefined, page, limit: PAGE_SIZE }),
        [filter, tagFilter, sortKey, search],
    );

    const refreshFeed = useCallback(async () => {
        const id = ++refreshId.current;
        setRefreshing(true);
        await getFeed(feedParams(1));
        if (id === refreshId.current) setRefreshing(false);
    }, [getFeed, feedParams]);

    useEffect(() => {
        if (initialized) void refreshFeed();
    }, [initialized, refreshFeed]);

    const loadMore = useCallback(() => {
        if (!feedMeta?.hasMore || loadingFeed) return;
        void getFeed(feedParams(feedMeta.page + 1), { append: true });
    }, [feedMeta, loadingFeed, getFeed, feedParams]);

    const isStaff = Boolean(me?.isStaff);
    const isStaffView = variant === "staff" && isStaff;
    const capabilities = me?.capabilities;
    const can = useCallback((capability: CommunityCapability) => Boolean(capabilities?.includes(capability)), [capabilities]);

    const refreshQueue = useCallback(() => {
        if (isStaffView) void getQueueSummary();
    }, [isStaffView, getQueueSummary]);
    useEffect(() => {
        refreshQueue();
    }, [refreshQueue]);

    const paths = useMemo<CommunityPaths>(
        () => ({
            feed: basePath,
            thread: (postId, replyId) => `${basePath}/${postId}${replyId ? `?reply=${replyId}` : ""}`,
            view: (view) => `${basePath}?view=${view}`,
        }),
        [basePath],
    );

    const menu = useMemo(() => buildFeedMenu(categories), [categories]);
    const postableCategories = useMemo(() => categories.filter((c) => c.isActive && (isStaff || !c.staffOnly)), [categories, isStaff]);
    const postableTags = useMemo(() => tags.filter((t) => t.isActive && (isStaff || !t.isStaffOnly)), [tags, isStaff]);
    const tagLabel = useCallback((slug: string) => tags.find((t) => t.slug === slug)?.label ?? slug, [tags]);

    const value = useMemo<CommunityContextValue>(
        () => ({
            api,
            ready: initialized,
            bootError,
            retryBootstrap: () => void bootstrap(),
            variant,
            isStaffView,
            paths,
            can,
            refreshQueue,
            menu,
            postableCategories,
            postableTags,
            tagLabel,
            filter,
            setFilter,
            tagFilter,
            setTagFilter,
            sortKey,
            setSortKey,
            search,
            setSearch,
            loadMore,
            refreshFeed: () => void refreshFeed(),
            refreshing,
            newDiscussionOpen,
            editingPost,
            openNewDiscussion: () => {
                setEditingPost(null);
                setNewDiscussionOpen(true);
            },
            openEditDiscussion: (post) => {
                setEditingPost(post);
                setNewDiscussionOpen(true);
            },
            closeNewDiscussion: () => {
                setNewDiscussionOpen(false);
                setEditingPost(null);
            },
        }),
        [api, initialized, bootError, bootstrap, variant, isStaffView, paths, can, refreshQueue, menu, postableCategories, postableTags, tagLabel, filter, tagFilter, sortKey, search, loadMore, refreshFeed, refreshing, newDiscussionOpen, editingPost],
    );

    return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
    const ctx = useContext(CommunityContext);
    if (!ctx) throw new Error("useCommunity must be used inside <CommunityProvider>");
    return ctx;
}
