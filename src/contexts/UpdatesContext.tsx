"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import axiosHandler from "@/lib/enhanced-axios";
import type { StandardResponse } from "./AuthContext";

/* ------------------------------------------------------------------ */
/* Vocabulary — mirrors updates.controller.ts                          */
/* ------------------------------------------------------------------ */

export type UpdateType = "blog" | "news" | "announcement";

/** The tab keys used by the student screen; "all" is the merged feed. */
export type UpdateTab = "all" | UpdateType;

export const UPDATE_TABS: { label: string; value: UpdateTab }[] = [
    { label: "All", value: "all" },
    { label: "News", value: "news" },
    { label: "Blogs", value: "blog" },
    { label: "Announcements", value: "announcement" },
];

export const UPDATE_TYPE_LABELS: Record<UpdateType, string> = {
    blog: "Blog",
    news: "News",
    announcement: "Announcement",
};

/** Plural path segment used in student/RM URLs, e.g. /updates/blogs/my-slug. */
export const UPDATE_TYPE_SLUGS: Record<UpdateType, string> = {
    blog: "blogs",
    news: "news",
    announcement: "announcements",
};

export function updateTypeFromSlug(slug: string): UpdateType {
    if (slug === "blogs" || slug === "blog") return "blog";
    if (slug === "announcements" || slug === "announcement") return "announcement";
    return "news";
}

export const ANNOUNCEMENT_TYPES = [
    "General",
    "Event",
    "Notice",
    "Opportunity",
    "Result",
    "Holiday",
] as const;

export type AnnouncementType = (typeof ANNOUNCEMENT_TYPES)[number];

export const UPDATE_PRIORITIES = ["low", "normal", "high"] as const;
export type UpdatePriority = (typeof UPDATE_PRIORITIES)[number];

export const DEFAULT_ACTION_LABELS: Record<AnnouncementType, string> = {
    General: "Read More",
    Event: "View Event",
    Notice: "View Notice",
    Opportunity: "View Opportunity",
    Result: "View Result",
    Holiday: "View Details",
};

export type UpdateSort = "newest" | "oldest" | "popular";
export type UpdateStatusFilter = "all" | "published" | "draft";

/* ------------------------------------------------------------------ */
/* Entity types — mirror blogs / news / announcements prisma models    */
/* ------------------------------------------------------------------ */

export interface UpdateCreator {
    rmId: string;
    rmName: string;
    email: string | null;
}

/** The flattened card shape returned by every updates endpoint. */
export interface UpdateItem {
    updateId: string;
    updateType: UpdateType;
    title: string;
    slug: string;
    summary: string | null;
    coverImageUrl: string | null;
    category: string;
    tags: string[];
    readTimeMinutes: number;
    authorName: string;
    authorPhotoUrl: string | null;
    isPublished?: boolean;
    isTrending: boolean;
    isFeatured: boolean;
    publishedAt: string | null;
    viewCount: number;
    branchId: string | null;
    createdAt: string;
    updatedAt: string;

    // news only
    sourceName?: string | null;
    sourceUrl?: string | null;

    // announcement only
    announcementType?: AnnouncementType;
    priority?: UpdatePriority;
    actionLabel?: string | null;
    actionUrl?: string | null;
    isPinned?: boolean;
    validFrom?: string | null;
    validTill?: string | null;

    createdByRm?: UpdateCreator | null;
    createdByRmId?: string | null;
}

/** Detail response — the card fields plus the HTML body and a related rail. */
export interface UpdateDetail extends UpdateItem {
    content: string;
    related: UpdateItem[];
}

export interface UpdateCounts {
    all: number;
    blog: number;
    news: number;
    announcement: number;
}

export interface UpdatePaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface UpdatesFeedResult {
    data: UpdateItem[];
    counts: UpdateCounts;
    meta: UpdatePaginationMeta;
}

export interface ManagedUpdatesResult {
    data: UpdateItem[];
    meta: UpdatePaginationMeta;
}

export interface UpdatesSummaryBucket {
    total: number;
    drafts: number;
    published: number;
}

export interface UpdatesSummary {
    blogs: UpdatesSummaryBucket;
    news: UpdatesSummaryBucket;
    announcements: UpdatesSummaryBucket;
}

/* ------------------------------------------------------------------ */
/* Input / filter types                                                */
/* ------------------------------------------------------------------ */

export interface GetUpdatesFeedParams {
    type?: UpdateTab;
    search?: string;
    category?: string;
    sort?: UpdateSort;
    page?: number;
    limit?: number;
}

export interface GetManagedUpdatesParams {
    search?: string;
    category?: string;
    status?: UpdateStatusFilter;
    announcementType?: AnnouncementType;
    page?: number;
    limit?: number;
}

/** Fields shared by the three create forms. */
export interface BaseUpdateInput {
    title: string;
    content: string;
    summary?: string;
    coverImageUrl?: string;
    category?: string;
    tags?: string[];
    readTimeMinutes?: number;
    authorName?: string;
    authorPhotoUrl?: string;
    isPublished?: boolean;
    isTrending?: boolean;
    isFeatured?: boolean;
    publishedAt?: string;
    /** True publishes to every branch instead of just the RM's own branch. */
    isGlobal?: boolean;
}

export type CreateBlogInput = BaseUpdateInput;
export type UpdateBlogInput = Partial<BaseUpdateInput>;

export interface CreateNewsInput extends BaseUpdateInput {
    sourceName?: string;
    sourceUrl?: string;
}
export type UpdateNewsInput = Partial<CreateNewsInput>;

export interface CreateAnnouncementInput extends BaseUpdateInput {
    announcementType?: AnnouncementType;
    priority?: UpdatePriority;
    actionLabel?: string;
    actionUrl?: string;
    isPinned?: boolean;
    validFrom?: string;
    validTill?: string;
}
export type UpdateAnnouncementInput = Partial<CreateAnnouncementInput>;

/* ------------------------------------------------------------------ */
/* Context shape                                                       */
/* ------------------------------------------------------------------ */

interface UpdatesContextValue {
    feed: UpdateItem[];
    counts: UpdateCounts | null;
    feedMeta: UpdatePaginationMeta | null;
    featured: UpdateItem[];
    categories: string[];

    managedBlogs: UpdateItem[];
    managedNews: UpdateItem[];
    managedAnnouncements: UpdateItem[];
    managedMeta: Record<UpdateType, UpdatePaginationMeta | null>;
    summary: UpdatesSummary | null;

    loadingFeed: boolean;
    loadingFeatured: boolean;
    loadingManaged: boolean;

    // Reader
    getUpdatesFeed: (params?: GetUpdatesFeedParams) => Promise<StandardResponse<UpdatesFeedResult>>;
    getFeaturedUpdates: (limit?: number) => Promise<StandardResponse<UpdateItem[]>>;
    getUpdateCategories: () => Promise<StandardResponse<string[]>>;
    getUpdateDetail: (type: UpdateType, identifier: string) => Promise<StandardResponse<UpdateDetail>>;

    // RM — blogs
    getManagedBlogs: (params?: GetManagedUpdatesParams) => Promise<StandardResponse<ManagedUpdatesResult>>;
    createBlog: (data: CreateBlogInput) => Promise<StandardResponse<UpdateItem>>;
    updateBlog: (blogId: string, data: UpdateBlogInput) => Promise<StandardResponse<UpdateItem>>;
    deleteBlog: (blogId: string) => Promise<StandardResponse<null>>;

    // RM — news
    getManagedNews: (params?: GetManagedUpdatesParams) => Promise<StandardResponse<ManagedUpdatesResult>>;
    createNews: (data: CreateNewsInput) => Promise<StandardResponse<UpdateItem>>;
    updateNews: (newsId: string, data: UpdateNewsInput) => Promise<StandardResponse<UpdateItem>>;
    deleteNews: (newsId: string) => Promise<StandardResponse<null>>;

    // RM — announcements
    getManagedAnnouncements: (params?: GetManagedUpdatesParams) => Promise<StandardResponse<ManagedUpdatesResult>>;
    createAnnouncement: (data: CreateAnnouncementInput) => Promise<StandardResponse<UpdateItem>>;
    updateAnnouncement: (announcementId: string, data: UpdateAnnouncementInput) => Promise<StandardResponse<UpdateItem>>;
    deleteAnnouncement: (announcementId: string) => Promise<StandardResponse<null>>;

    // RM — shared
    setPublishState: (type: UpdateType, updateId: string, isPublished: boolean) => Promise<StandardResponse<UpdateItem>>;
    getUpdatesSummary: () => Promise<StandardResponse<UpdatesSummary>>;
}

const UpdatesContext = createContext<UpdatesContextValue | null>(null);

const BASE = "/api/v1/updates";

function toMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}

/** Drops empty values so the query string stays clean. */
function cleanParams(params: object = {}): Record<string, unknown> {
    return Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "" && value !== "all"),
    );
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function UpdatesProvider({ children }: { children: ReactNode }) {
    const [feed, setFeed] = useState<UpdateItem[]>([]);
    const [counts, setCounts] = useState<UpdateCounts | null>(null);
    const [feedMeta, setFeedMeta] = useState<UpdatePaginationMeta | null>(null);
    const [featured, setFeatured] = useState<UpdateItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);

    const [managedBlogs, setManagedBlogs] = useState<UpdateItem[]>([]);
    const [managedNews, setManagedNews] = useState<UpdateItem[]>([]);
    const [managedAnnouncements, setManagedAnnouncements] = useState<UpdateItem[]>([]);
    const [managedMeta, setManagedMeta] = useState<Record<UpdateType, UpdatePaginationMeta | null>>({
        blog: null,
        news: null,
        announcement: null,
    });
    const [summary, setSummary] = useState<UpdatesSummary | null>(null);

    const [loadingFeed, setLoadingFeed] = useState(false);
    const [loadingFeatured, setLoadingFeatured] = useState(false);
    const [loadingManaged, setLoadingManaged] = useState(false);

    /* --------------------------- Reader --------------------------- */

    const getUpdatesFeed = useCallback(
        async (params: GetUpdatesFeedParams = {}): Promise<StandardResponse<UpdatesFeedResult>> => {
            setLoadingFeed(true);
            try {
                const res = (await axiosHandler({
                    path: `${BASE}/feed`,
                    method: "GET",
                    params: cleanParams({ ...params, type: params.type ?? "all" }),
                })) as UpdatesFeedResult;

                setFeed(res.data ?? []);
                setCounts(res.counts ?? null);
                setFeedMeta(res.meta ?? null);
                return { success: true, message: null, data: res };
            } catch (error: unknown) {
                return { success: false, message: toMessage(error, "Failed to fetch updates"), data: null };
            } finally {
                setLoadingFeed(false);
            }
        },
        [],
    );

    const getFeaturedUpdates = useCallback(async (limit = 5): Promise<StandardResponse<UpdateItem[]>> => {
        setLoadingFeatured(true);
        try {
            const res = (await axiosHandler({ path: `${BASE}/featured`, method: "GET", params: { limit } })) as UpdateItem[];
            setFeatured(res ?? []);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch featured updates"), data: null };
        } finally {
            setLoadingFeatured(false);
        }
    }, []);

    const getUpdateCategories = useCallback(async (): Promise<StandardResponse<string[]>> => {
        try {
            const res = (await axiosHandler({ path: `${BASE}/categories`, method: "GET" })) as string[];
            setCategories(res ?? []);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch categories"), data: null };
        }
    }, []);

    const getUpdateDetail = useCallback(
        async (type: UpdateType, identifier: string): Promise<StandardResponse<UpdateDetail>> => {
            try {
                const res = (await axiosHandler({ path: `${BASE}/${type}/${identifier}`, method: "GET" })) as UpdateDetail;
                return { success: true, message: null, data: res };
            } catch (error: unknown) {
                return { success: false, message: toMessage(error, "Failed to fetch update"), data: null };
            }
        },
        [],
    );

    /* ---------------------------- RM ------------------------------ */

    const fetchManaged = useCallback(
        async (
            type: UpdateType,
            path: string,
            params: GetManagedUpdatesParams,
            apply: (rows: UpdateItem[]) => void,
        ): Promise<StandardResponse<ManagedUpdatesResult>> => {
            setLoadingManaged(true);
            try {
                const res = (await axiosHandler({ path, method: "GET", params: cleanParams(params) })) as ManagedUpdatesResult;
                apply(res.data ?? []);
                setManagedMeta((prev) => ({ ...prev, [type]: res.meta ?? null }));
                return { success: true, message: null, data: res };
            } catch (error: unknown) {
                return { success: false, message: toMessage(error, "Failed to fetch items"), data: null };
            } finally {
                setLoadingManaged(false);
            }
        },
        [],
    );

    const getManagedBlogs = useCallback(
        (params: GetManagedUpdatesParams = {}) => fetchManaged("blog", `${BASE}/rm/blogs`, params, setManagedBlogs),
        [fetchManaged],
    );

    const getManagedNews = useCallback(
        (params: GetManagedUpdatesParams = {}) => fetchManaged("news", `${BASE}/rm/news`, params, setManagedNews),
        [fetchManaged],
    );

    const getManagedAnnouncements = useCallback(
        (params: GetManagedUpdatesParams = {}) =>
            fetchManaged("announcement", `${BASE}/rm/announcements`, params, setManagedAnnouncements),
        [fetchManaged],
    );

    const mutate = useCallback(
        async <T,>(path: string, body: object | undefined, successMessage: string, failureMessage: string): Promise<StandardResponse<T>> => {
            try {
                const res = (await axiosHandler({ path, method: "POST", body: body ?? {} })) as T;
                return { success: true, message: successMessage, data: res };
            } catch (error: unknown) {
                return { success: false, message: toMessage(error, failureMessage), data: null };
            }
        },
        [],
    );

    const createBlog = useCallback(
        (data: CreateBlogInput) => mutate<UpdateItem>(`${BASE}/rm/blogs/create`, data, "Blog created successfully", "Failed to create blog"),
        [mutate],
    );

    const updateBlog = useCallback(
        (blogId: string, data: UpdateBlogInput) =>
            mutate<UpdateItem>(`${BASE}/rm/blogs/${blogId}/update`, data, "Blog updated successfully", "Failed to update blog"),
        [mutate],
    );

    const deleteBlog = useCallback(
        (blogId: string) => mutate<null>(`${BASE}/rm/blogs/${blogId}/delete`, undefined, "Blog deleted successfully", "Failed to delete blog"),
        [mutate],
    );

    const createNews = useCallback(
        (data: CreateNewsInput) => mutate<UpdateItem>(`${BASE}/rm/news/create`, data, "News created successfully", "Failed to create news"),
        [mutate],
    );

    const updateNews = useCallback(
        (newsId: string, data: UpdateNewsInput) =>
            mutate<UpdateItem>(`${BASE}/rm/news/${newsId}/update`, data, "News updated successfully", "Failed to update news"),
        [mutate],
    );

    const deleteNews = useCallback(
        (newsId: string) => mutate<null>(`${BASE}/rm/news/${newsId}/delete`, undefined, "News deleted successfully", "Failed to delete news"),
        [mutate],
    );

    const createAnnouncement = useCallback(
        (data: CreateAnnouncementInput) =>
            mutate<UpdateItem>(`${BASE}/rm/announcements/create`, data, "Announcement created successfully", "Failed to create announcement"),
        [mutate],
    );

    const updateAnnouncement = useCallback(
        (announcementId: string, data: UpdateAnnouncementInput) =>
            mutate<UpdateItem>(
                `${BASE}/rm/announcements/${announcementId}/update`,
                data,
                "Announcement updated successfully",
                "Failed to update announcement",
            ),
        [mutate],
    );

    const deleteAnnouncement = useCallback(
        (announcementId: string) =>
            mutate<null>(
                `${BASE}/rm/announcements/${announcementId}/delete`,
                undefined,
                "Announcement deleted successfully",
                "Failed to delete announcement",
            ),
        [mutate],
    );

    const setPublishState = useCallback(
        (type: UpdateType, updateId: string, isPublished: boolean) =>
            mutate<UpdateItem>(
                `${BASE}/rm/${type}/${updateId}/publish`,
                { isPublished },
                isPublished ? "Published successfully" : "Moved to drafts",
                "Failed to change publish state",
            ),
        [mutate],
    );

    const getUpdatesSummary = useCallback(async (): Promise<StandardResponse<UpdatesSummary>> => {
        try {
            const res = (await axiosHandler({ path: `${BASE}/rm/summary`, method: "GET" })) as UpdatesSummary;
            setSummary(res);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch summary"), data: null };
        }
    }, []);

    const value = useMemo<UpdatesContextValue>(
        () => ({
            feed,
            counts,
            feedMeta,
            featured,
            categories,
            managedBlogs,
            managedNews,
            managedAnnouncements,
            managedMeta,
            summary,
            loadingFeed,
            loadingFeatured,
            loadingManaged,
            getUpdatesFeed,
            getFeaturedUpdates,
            getUpdateCategories,
            getUpdateDetail,
            getManagedBlogs,
            createBlog,
            updateBlog,
            deleteBlog,
            getManagedNews,
            createNews,
            updateNews,
            deleteNews,
            getManagedAnnouncements,
            createAnnouncement,
            updateAnnouncement,
            deleteAnnouncement,
            setPublishState,
            getUpdatesSummary,
        }),
        [
            feed,
            counts,
            feedMeta,
            featured,
            categories,
            managedBlogs,
            managedNews,
            managedAnnouncements,
            managedMeta,
            summary,
            loadingFeed,
            loadingFeatured,
            loadingManaged,
            getUpdatesFeed,
            getFeaturedUpdates,
            getUpdateCategories,
            getUpdateDetail,
            getManagedBlogs,
            createBlog,
            updateBlog,
            deleteBlog,
            getManagedNews,
            createNews,
            updateNews,
            deleteNews,
            getManagedAnnouncements,
            createAnnouncement,
            updateAnnouncement,
            deleteAnnouncement,
            setPublishState,
            getUpdatesSummary,
        ],
    );

    return <UpdatesContext.Provider value={value}>{children}</UpdatesContext.Provider>;
}

export function useUpdates() {
    const context = useContext(UpdatesContext);
    if (!context) throw new Error("useUpdates must be used within an UpdatesProvider");
    return context;
}
