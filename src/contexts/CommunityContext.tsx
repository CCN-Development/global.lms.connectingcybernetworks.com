"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import axiosHandler from "@/lib/enhanced-axios";
import type { StandardResponse } from "./AuthContext";

/*
 * CCN Community — API layer for /api/v1/community (every role) and /api/v1/community-admin (forum staff).
 * Types mirror the backend presenters in api…/src/services/community/*. Dates are ISO strings.
 * Backend reference: api…/docs/community/README.md
 */

/* ------------------------------------------------------------------ */
/* Vocabulary — mirrors src/constants/community.constants.ts           */
/* ------------------------------------------------------------------ */

export const COMMUNITY_ROLES = ["Student", "Trainer", "RM", "Accountant", "Admin", "Owner", "Placement"] as const;
export type CommunityRole = (typeof COMMUNITY_ROLES)[number];
export const COMMUNITY_STAFF_ROLES: CommunityRole[] = ["Trainer", "RM", "Accountant", "Admin", "Owner", "Placement"];
export const COMMUNITY_MANAGER_ROLES: CommunityRole[] = ["Admin", "Owner"];

export const COMMUNITY_ROLE_LABELS: Record<CommunityRole, string> = {
    Student: "Student",
    Trainer: "Trainer",
    RM: "Relationship Manager",
    Accountant: "Accounts Team",
    Admin: "Admin",
    Owner: "Founder",
    Placement: "Placement Officer",
};

export type CommunityCapability =
    | "post.create"
    | "reply.create"
    | "poll.create"
    | "quiz.create"
    | "post.announce"
    | "post.pin"
    | "post.lock"
    | "post.hide"
    | "post.move"
    | "post.approve"
    | "post.delete"
    | "post.purge"
    | "answer.accept"
    | "report.review"
    | "member.mute"
    | "member.ban"
    | "anonymous.reveal"
    | "space.manage"
    | "taxonomy.manage";

export const SPACE_SCOPES = ["global", "branch", "batch", "course", "staff"] as const;
export type SpaceScope = (typeof SPACE_SCOPES)[number];
export type PostingPolicy = "everyone" | "staff_only";

export const POST_TYPES = ["discussion", "question", "announcement", "poll", "quiz"] as const;
export type PostType = (typeof POST_TYPES)[number];
export const POST_TYPE_LABELS: Record<PostType, string> = {
    discussion: "Discussion",
    question: "Question",
    announcement: "Announcement",
    poll: "Poll",
    quiz: "Quiz",
};

export const POST_STATUSES = ["published", "pending_review", "rejected", "hidden", "deleted"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];
export type ReplyStatus = "published" | "hidden" | "deleted";
export type MemberStatus = "active" | "muted" | "banned";

export const REACTION_TYPES = ["like", "love", "insightful", "helpful", "celebrate", "funny"] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];
export const REACTION_LABELS: Record<ReactionType, string> = {
    like: "Like",
    love: "Love",
    insightful: "Insightful",
    helpful: "Helpful",
    celebrate: "Celebrate",
    funny: "Funny",
};

export type SubscriptionLevel = "watching" | "muted";

export const FEED_FILTERS = ["all", "pinned", "mine", "saved", "following", "unanswered", "participated"] as const;
export type CommunityFeedFilter = (typeof FEED_FILTERS)[number];

export const FEED_SORTS = ["latest", "oldest", "active", "most-liked", "most-replied", "most-viewed", "trending"] as const;
export type CommunityFeedSort = (typeof FEED_SORTS)[number];
export const FEED_SORT_LABELS: Record<CommunityFeedSort, string> = {
    latest: "Latest",
    oldest: "Oldest",
    active: "Recently active",
    "most-liked": "Most liked",
    "most-replied": "Most replied",
    "most-viewed": "Most viewed",
    trending: "Trending",
};

export type ReplySort = "oldest" | "newest" | "top";
export type ReplyListMode = "tree" | "flat";

export type PollKind = "poll" | "quiz";
export type PollResultsVisibility = "always" | "after_vote" | "after_close";

export type AttachmentKind = "image" | "video" | "audio" | "document" | "archive" | "other";

export const REPORT_REASONS = ["spam", "harassment", "hate_speech", "misinformation", "off_topic", "cheating", "inappropriate", "other"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];
export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
    spam: "Spam",
    harassment: "Harassment or bullying",
    hate_speech: "Hate speech",
    misinformation: "Misinformation",
    off_topic: "Off-topic",
    cheating: "Cheating / sharing answers",
    inappropriate: "Inappropriate content",
    other: "Something else",
};
export type ReportTarget = "post" | "reply" | "member";
export type ReportStatus = "open" | "resolved" | "dismissed";
export type ReportAction = "none" | "hidden" | "deleted" | "member_muted" | "member_banned";

export type CommunityNotificationType =
    | "reply_to_post"
    | "reply_to_reply"
    | "mention"
    | "post_reaction"
    | "reply_reaction"
    | "answer_accepted"
    | "post_pinned"
    | "post_approved"
    | "post_rejected"
    | "content_moderated"
    | "poll_closed"
    | "report_resolved"
    | "member_sanctioned";

/* ------------------------------------------------------------------ */
/* Entity types — mirror the backend presenters                        */
/* ------------------------------------------------------------------ */

/** Author block on posts, replies, notifications, member lists. `id` is the CommunityMember id (null when anonymous). */
export interface CommunityAuthor {
    id: string | null;
    name: string;
    role: CommunityRole | string;
    roleLabel: string;
    /** "Senior Security Manager - Trainer" — falls back to the role label. */
    headline: string | null;
    avatar: string | null;
    isStaff: boolean;
    isOnline: boolean;
    isAnonymous: boolean;
    /** Only for moderators with `anonymous.reveal` on anonymous content. */
    revealedAuthor?: CommunityAuthor;
}

export interface CommunityAttachment {
    id: string;
    kind: AttachmentKind;
    name: string;
    mimeType: string;
    size: number | null;
    url: string;
    thumbnailUrl: string | null;
    width: number | null;
    height: number | null;
    durationSec: number | null;
    /** 0–100; always 100 from the API, lower while uploading locally. */
    progress: number;
}

export interface CommunityPollOption {
    id: string;
    text: string;
    /** null while results are hidden for the viewer. */
    votes: number | null;
    percent: number | null;
    votedByMe: boolean;
    /** Quiz only, once the viewer has answered (or the quiz is closed). */
    isCorrect?: boolean;
}

export interface CommunityPoll {
    id: string;
    kind: PollKind;
    /** null → the post title is the question. */
    question: string | null;
    allowMultiple: boolean;
    maxChoices: number | null;
    isAnonymous: boolean;
    resultsVisibility: PollResultsVisibility;
    allowVoteChange: boolean;
    closesAt: string | null;
    isClosed: boolean;
    hasVoted: boolean;
    showResults: boolean;
    totalVotes: number | null;
    voterCount: number | null;
    votedOptionId: string | null;
    votedOptionIds: string[];
    options: CommunityPollOption[];
    /** Quiz only, after answering. */
    explanation?: string | null;
    answeredCorrectly?: boolean | null;
}

export interface CommunitySpaceRef {
    id: string;
    slug: string;
    name: string;
    scope: SpaceScope;
}

export interface CommunitySpace extends CommunitySpaceRef {
    description: string | null;
    iconUrl: string | null;
    coverUrl: string | null;
    isDefault: boolean;
    isArchived: boolean;
    postingPolicy: PostingPolicy;
    requirePostApproval: boolean;
    /** Already resolved for the viewer (only students may post anonymously). */
    allowAnonymous: boolean;
    allowPolls: boolean;
    postCount: number;
    canPost: boolean;
    canModerate: boolean;
    capabilities: CommunityCapability[];
}

export interface CommunityCategory {
    /** Category slug — the frontend CategoryId, e.g. "lab-discussions". */
    id: string;
    /** Database uuid (admin endpoints). */
    categoryId: string;
    label: string;
    description: string | null;
    color: string;
    icon: string | null;
    staffOnly: boolean;
    isActive: boolean;
    postCount?: number;
}

export interface CommunityTag {
    id: string;
    slug: string;
    label: string;
    color: string | null;
    isStaffOnly: boolean;
    isActive: boolean;
    usageCount: number;
}

export interface CommunityPostPermissions {
    canEdit: boolean;
    canDelete: boolean;
    canReply: boolean;
    canAcceptAnswer: boolean;
    canModerate: boolean;
    capabilities: CommunityCapability[];
}

/** Feed card. The thread endpoint returns {@link CommunityPostDetail}. */
export interface CommunityPost {
    id: string;
    space: CommunitySpaceRef;
    /** Category slug. */
    categoryId: string;
    category: CommunityCategory;
    /** Tag display names, e.g. ["Important"]. */
    tags: string[];
    tagDetails: CommunityTag[];
    postType: PostType;
    title: string;
    /** Only on the thread endpoint. */
    html?: string;
    excerpt: string;
    author: CommunityAuthor;
    isAnonymous: boolean;
    isMine: boolean;
    status: PostStatus;
    moderationNote: string | null;
    createdAt: string;
    publishedAt: string | null;
    editedAt: string | null;
    lastActivityAt: string;
    isPinned: boolean;
    pinnedAt: string | null;
    pinExpiresAt: string | null;
    /** Role label of whoever pinned it, e.g. "Trainer". */
    pinnedBy: string | null;
    pinnedByMember: CommunityAuthor | null;
    isLocked: boolean;
    attachments: CommunityAttachment[];
    polls: CommunityPoll[];
    /** Single poll of a poll post (null otherwise). */
    poll: CommunityPoll | null;
    likes: number;
    liked: boolean;
    myReaction: ReactionType | null;
    views: number;
    replyCount: number;
    saves: number;
    saved: boolean;
    subscription: SubscriptionLevel | null;
    acceptedReplyId: string | null;
    isAnswered: boolean;
    lastViewedAt: string | null;
    hasNewActivity: boolean;
    permissions: CommunityPostPermissions;
}

export interface CommunityActivityEntry {
    author: CommunityAuthor;
    at: string | null;
}

export interface CommunityPostDetail extends CommunityPost {
    html: string;
    acceptedReply: CommunityReply | null;
    reactionSummary: Partial<Record<ReactionType, number>>;
    activity: {
        created: CommunityActivityEntry;
        frequentPoster: (CommunityActivityEntry & { replies: number }) | null;
        lastReply: (CommunityActivityEntry & { replyId: string }) | null;
    };
}

export interface CommunityReplyPermissions {
    canEdit: boolean;
    canDelete: boolean;
    canReply: boolean;
    canModerate: boolean;
}

export interface CommunityReply {
    id: string;
    postId: string;
    parentId: string | null;
    rootId: string | null;
    depth: number;
    /** null for removed replies shown as placeholders. */
    author: CommunityAuthor | null;
    /** Who this reply answers (kept when deep replies are re-parented). */
    replyTo: CommunityAuthor | null;
    /** null for removed replies shown as placeholders. */
    html: string | null;
    attachments: CommunityAttachment[];
    status: ReplyStatus;
    isAnonymous: boolean;
    isMine: boolean;
    isAccepted: boolean;
    likes: number;
    liked: boolean;
    myReaction: ReactionType | null;
    childCount: number;
    createdAt: string;
    editedAt: string | null;
    permissions: CommunityReplyPermissions;
    /** Tree mode only. */
    children?: CommunityReply[];
    hasMoreChildren?: boolean;
}

export interface CommunityReplyThread {
    postId: string;
    postTitle: string;
    ancestors: CommunityReply[];
    reply: CommunityReply;
}

export interface CommunityMemberStats {
    posts: number;
    replies: number;
    likesReceived: number;
    acceptedAnswers: number;
    reputation: number;
}

export interface CommunityPreferences {
    notifyOnReply: boolean;
    notifyOnMention: boolean;
    notifyOnLike: boolean;
    autoSubscribe: boolean;
}

export interface CommunityMe extends CommunityAuthor {
    bio: string | null;
    status: MemberStatus;
    mutedUntil: string | null;
    sanctionReason: string | null;
    preferences: CommunityPreferences;
    stats: CommunityMemberStats;
    joinedAt: string;
    capabilities: CommunityCapability[];
}

export interface CommunityMemberProfile extends CommunityAuthor {
    bio: string | null;
    joinedAt: string;
    stats: CommunityMemberStats;
    recentPosts: {
        id: string;
        title: string;
        createdAt: string;
        likes: number;
        replies: number;
        category: { id: string; label: string; color: string };
    }[];
}

/** All-time entries carry reputation / posts / acceptedAnswers; windowed (`days`) entries carry likesReceived. */
export interface CommunityLeaderboardEntry extends CommunityAuthor {
    replies: number;
    reputation?: number;
    acceptedAnswers?: number;
    posts?: number;
    likesReceived?: number;
}

export interface CommunityFeedCounts {
    all: number;
    pinned: number;
    mine: number;
    saved: number;
    following: number;
    unanswered: number;
    /** Keyed by category slug. */
    categories: Record<string, number>;
}

export interface CommunityConfig {
    maxTagsPerPost: number;
    maxAttachmentsPerItem: number;
    maxAttachmentBytes: number;
    maxPollOptions: number;
    maxQuizQuestions: number;
    maxReplyDepth: number;
    postTypes: PostType[];
    sorts: CommunityFeedSort[];
    reactionTypes: ReactionType[];
    reportReasons: ReportReason[];
}

export const DEFAULT_COMMUNITY_CONFIG: CommunityConfig = {
    maxTagsPerPost: 3,
    maxAttachmentsPerItem: 10,
    maxAttachmentBytes: 25 * 1024 * 1024,
    maxPollOptions: 10,
    maxQuizQuestions: 20,
    maxReplyDepth: 4,
    postTypes: [...POST_TYPES],
    sorts: [...FEED_SORTS],
    reactionTypes: [...REACTION_TYPES],
    reportReasons: [...REPORT_REASONS],
};

export interface CommunityBootstrap {
    me: CommunityMe;
    spaces: CommunitySpace[];
    categories: CommunityCategory[];
    tags: CommunityTag[];
    onlineCount: number;
    unreadNotifications: number;
    counts: CommunityFeedCounts;
    config: CommunityConfig;
}

export interface CommunityNotification {
    id: string;
    type: CommunityNotificationType;
    isRead: boolean;
    createdAt: string;
    /** Anonymous actors come back as the "Anonymous" author; null for system events. */
    actor: CommunityAuthor | null;
    post: { id: string; title: string } | null;
    reply: { id: string; excerpt: string | null } | null;
    data: Record<string, unknown> | null;
}

export interface CommunityReactionResult {
    likes: number;
    liked: boolean;
    myReaction: ReactionType | null;
}

export interface CommunityReactor extends CommunityAuthor {
    reactionType: ReactionType;
    reactedAt: string;
}

export interface CommunityPollVoters {
    optionId: string;
    text: string;
    voters: (CommunityAuthor & { votedAt: string })[];
}

export interface CommunityPostRevision {
    id: string;
    title: string | null;
    html: string;
    editedBy: CommunityAuthor;
    createdAt: string;
}

export interface CommunityReplyRevision {
    id: string;
    html: string;
    editedBy: CommunityAuthor;
    createdAt: string;
}

export interface CommunityUploadTicket {
    attachment: CommunityAttachment;
    upload: { url: string; method: string; headers: Record<string, string> };
}

/** Raw paginated payload from the API. */
export interface CommunityPage<T> {
    total: number;
    page: number;
    limit: number;
    items: T[];
}

export interface CommunityPageMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
}

export interface CommunityNotificationPage extends CommunityPage<CommunityNotification> {
    unread: number;
}

/* ------------------------------------------------------------------ */
/* Admin entity types — /api/v1/community-admin                        */
/* ------------------------------------------------------------------ */

export interface CommunityQueueSummary {
    pendingPosts: number;
    openReports: number;
    hiddenPosts: number;
}

export interface CommunityReport {
    id: string;
    targetType: ReportTarget;
    reason: ReportReason;
    details: string | null;
    status: ReportStatus;
    actionTaken: ReportAction | null;
    resolutionNote: string | null;
    createdAt: string;
    resolvedAt: string | null;
    reporter: CommunityAuthor;
    reportedMember: (CommunityAuthor & { status: MemberStatus }) | null;
    resolvedBy: CommunityAuthor | null;
    post: { id: string; title: string; status: PostStatus; excerpt: string } | null;
    reply: { id: string; status: ReplyStatus; excerpt: string } | null;
}

export interface CommunityReportResolution {
    closed: number;
    status: ReportStatus;
    action: ReportAction;
}

export interface CommunityAdminMember extends CommunityAuthor {
    id: string;
    status: MemberStatus;
    mutedUntil: string | null;
    bannedAt: string | null;
    sanctionReason: string | null;
    stats: { posts: number; replies: number; reputation: number };
    joinedAt: string;
    canSanction: boolean;
}

export interface CommunityModerationLogEntry {
    id: string;
    action: string;
    targetType: string;
    targetId: string | null;
    postId: string | null;
    replyId: string | null;
    spaceId: string | null;
    reason: string | null;
    meta: Record<string, unknown> | null;
    createdAt: string;
    actor: CommunityAuthor | null;
    targetMember: CommunityAuthor | null;
}

export interface CommunityAdminSpace {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    iconUrl: string | null;
    coverUrl: string | null;
    scope: SpaceScope;
    branch: { id: string; name: string | null } | null;
    batch: { id: string; name: string | null } | null;
    course: { id: string; name: string | null } | null;
    postingPolicy: PostingPolicy;
    requirePostApproval: boolean;
    allowAnonymous: boolean;
    allowPolls: boolean;
    isArchived: boolean;
    isDefault: boolean;
    sortOrder: number;
    postCount: number;
    moderatorCount: number;
    createdAt: string;
}

export interface CommunitySpaceModerator extends CommunityAuthor {
    grantedAt: string;
    grantedByMemberId: string | null;
}

export interface CommunityAnalytics {
    windowDays: number;
    totals: { posts: number; replies: number; unansweredQuestions: number };
    window: { newPosts: number; newReplies: number; newReactions: number; activeMembers: number };
    queue: CommunityQueueSummary;
    daily: { date: string; posts: number; replies: number }[];
    topContributors: (CommunityAuthor & { replies: number; likesReceived: number })[];
    byCategory: { id: string; label: string; color: string | null; posts: number }[];
    topPosts: { id: string; title: string; replies: number; likes: number; views: number; createdAt: string }[];
}

/* ------------------------------------------------------------------ */
/* Input / filter types                                                */
/* ------------------------------------------------------------------ */

export interface CommunityFeedParams {
    spaceId?: string;
    /** Category slug, e.g. "lab-discussions". */
    category?: string;
    /** Tag slugs or display names. */
    tags?: string[];
    type?: PostType;
    filter?: CommunityFeedFilter;
    sort?: CommunityFeedSort;
    search?: string;
    authorId?: string;
    /** Default true — pinned posts first on the "all" feed. */
    pinnedFirst?: boolean;
    page?: number;
    limit?: number;
}

export interface CommunityReplyParams {
    /** Tree mode: load the children of this reply instead of the top level. */
    parentId?: string;
    mode?: ReplyListMode;
    sort?: ReplySort;
    page?: number;
    limit?: number;
    /** Tree mode: first N children loaded under every item (0–10, default 3). */
    previewChildren?: number;
}

export interface PollOptionInput {
    text: string;
    /** Quiz only. */
    isCorrect?: boolean;
}

export interface PollInput {
    question?: string | null;
    options: PollOptionInput[];
    allowMultiple?: boolean;
    maxChoices?: number | null;
    isAnonymous?: boolean;
    resultsVisibility?: PollResultsVisibility;
    allowVoteChange?: boolean;
    /** ISO date. */
    closesAt?: string | null;
    /** Quiz only — shown after answering. */
    explanation?: string | null;
}

export interface PinInput {
    expiresAt?: string | null;
    /** 0–100, higher first among pinned posts. */
    priority?: number;
}

export interface CreatePostInput {
    /** Defaults to the global "CCN Community" space. */
    spaceId?: string;
    /** Category slug or uuid. */
    category: string;
    title: string;
    /** Editor HTML; mentions as <span class="mention" data-member-id="…">. */
    html: string;
    postType?: PostType;
    tags?: string[];
    attachmentIds?: string[];
    mentionedMemberIds?: string[];
    isAnonymous?: boolean;
    /** Poll posts (postType becomes "poll" automatically). */
    poll?: PollInput;
    /** Quiz posts: one entry per question. */
    polls?: PollInput[];
    /** Staff only. */
    pin?: PinInput | null;
    /** Staff only. */
    lockReplies?: boolean;
}

export interface UpdatePostInput {
    title?: string;
    html?: string;
    category?: string;
    tags?: string[];
    /** Full list after the edit (omitted = unchanged). */
    attachmentIds?: string[];
    mentionedMemberIds?: string[];
    /** Only while nobody has voted. */
    poll?: PollInput;
    polls?: PollInput[];
}

export interface CreateReplyInput {
    html: string;
    /** Reply-to-reply. */
    parentReplyId?: string | null;
    attachmentIds?: string[];
    mentionedMemberIds?: string[];
    isAnonymous?: boolean;
}

export interface UpdateReplyInput {
    html: string;
    attachmentIds?: string[];
    mentionedMemberIds?: string[];
}

export interface ReportInput {
    targetType: ReportTarget;
    postId?: string;
    replyId?: string;
    memberId?: string;
    reason: ReportReason;
    details?: string | null;
}

export interface UpdateMeInput {
    headline?: string | null;
    bio?: string | null;
    notifyOnReply?: boolean;
    notifyOnMention?: boolean;
    notifyOnLike?: boolean;
    autoSubscribe?: boolean;
}

export interface NotificationParams {
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
}

export interface UploadAttachmentOptions {
    onProgress?: (percent: number) => void;
    signal?: AbortSignal;
}

export interface ListOptions {
    /** Append the page to what is already loaded (infinite scroll). */
    append?: boolean;
}

/* --- admin --- */

export interface ModerationPostsParams {
    status?: PostStatus;
    spaceId?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface ReportsParams {
    status?: ReportStatus;
    targetType?: ReportTarget;
    page?: number;
    limit?: number;
}

export interface AdminMembersParams {
    q?: string;
    role?: CommunityRole;
    status?: MemberStatus;
    page?: number;
    limit?: number;
}

export interface ModerationLogParams {
    action?: string;
    postId?: string;
    memberId?: string;
    page?: number;
    limit?: number;
}

export interface AdminSpacesParams {
    scope?: SpaceScope;
    includeArchived?: boolean;
}

export interface MovePostInput {
    spaceId?: string;
    category?: string;
    tags?: string[];
    reason?: string | null;
}

export interface ResolveReportInput {
    action: ReportAction;
    note?: string | null;
    /** For member_muted; omitted = until unmuted. */
    muteUntil?: string | null;
}

export interface MuteMemberInput {
    until?: string | null;
    reason?: string | null;
}

interface SpaceFields {
    name: string;
    slug?: string;
    description?: string | null;
    iconUrl?: string | null;
    coverUrl?: string | null;
    postingPolicy?: PostingPolicy;
    requirePostApproval?: boolean;
    allowAnonymous?: boolean;
    allowPolls?: boolean;
    isDefault?: boolean;
    sortOrder?: number;
}

export interface CreateSpaceInput extends SpaceFields {
    scope: SpaceScope;
    branchId?: string | null;
    batchId?: string | null;
    courseId?: string | null;
}

/** Audience (scope / branch / batch / course) is fixed after creation. */
export type UpdateSpaceInput = Partial<SpaceFields> & { isArchived?: boolean };

export interface CategoryInput {
    name: string;
    slug?: string;
    description?: string | null;
    /** #RRGGBB */
    color?: string;
    icon?: string | null;
    postingPolicy?: PostingPolicy;
    sortOrder?: number;
    isActive?: boolean;
}

export interface TagInput {
    name: string;
    slug?: string;
    color?: string | null;
    isStaffOnly?: boolean;
    sortOrder?: number;
    isActive?: boolean;
}

/* ------------------------------------------------------------------ */
/* Context shape                                                       */
/* ------------------------------------------------------------------ */

type Res<T> = Promise<StandardResponse<T>>;

export interface CommunityApiContextValue {
    // Bootstrap & taxonomy
    me: CommunityMe | null;
    spaces: CommunitySpace[];
    categories: CommunityCategory[];
    tags: CommunityTag[];
    counts: CommunityFeedCounts | null;
    onlineCount: number;
    config: CommunityConfig;
    initialized: boolean;
    loadingBootstrap: boolean;

    // Feed & thread
    feed: CommunityPost[];
    feedMeta: CommunityPageMeta | null;
    loadingFeed: boolean;
    activePost: CommunityPostDetail | null;
    loadingPost: boolean;
    replies: CommunityReply[];
    repliesMeta: CommunityPageMeta | null;
    repliesPostId: string | null;
    loadingReplies: boolean;

    // Notifications
    notifications: CommunityNotification[];
    notificationsMeta: CommunityPageMeta | null;
    unreadNotifications: number;
    loadingNotifications: boolean;

    // Admin
    queue: CommunityQueueSummary | null;
    moderationPosts: CommunityPost[];
    moderationPostsMeta: CommunityPageMeta | null;
    reports: CommunityReport[];
    reportsMeta: CommunityPageMeta | null;
    adminMembers: CommunityAdminMember[];
    adminMembersMeta: CommunityPageMeta | null;
    moderationLog: CommunityModerationLogEntry[];
    moderationLogMeta: CommunityPageMeta | null;
    adminSpaces: CommunityAdminSpace[];
    adminCategories: CommunityCategory[];
    adminTags: CommunityTag[];
    analytics: CommunityAnalytics | null;
    loadingAdmin: boolean;

    // ── Member API: bootstrap & taxonomy ──
    getBootstrap: () => Res<CommunityBootstrap>;
    getSpaces: () => Res<CommunitySpace[]>;
    getCategories: (spaceId?: string) => Res<CommunityCategory[]>;
    getTags: () => Res<CommunityTag[]>;
    getFeedCounts: (spaceId?: string) => Res<CommunityFeedCounts>;

    // ── Posts ──
    getFeed: (params?: CommunityFeedParams, options?: ListOptions) => Res<CommunityPage<CommunityPost>>;
    getPost: (postId: string) => Res<CommunityPostDetail>;
    createPost: (input: CreatePostInput) => Res<CommunityPostDetail>;
    updatePost: (postId: string, input: UpdatePostInput) => Res<CommunityPostDetail>;
    deletePost: (postId: string) => Res<{ deleted: boolean }>;
    registerView: (postId: string) => Res<{ views: number }>;
    reactToPost: (postId: string, reactionType?: ReactionType) => Res<CommunityReactionResult>;
    removePostReaction: (postId: string) => Res<CommunityReactionResult>;
    /** Like / unlike based on the current `liked` flag. */
    togglePostLike: (post: Pick<CommunityPost, "id" | "liked">) => Res<CommunityReactionResult>;
    getPostReactions: (postId: string, params?: { type?: ReactionType; page?: number; limit?: number }) => Res<CommunityPage<CommunityReactor>>;
    setPostSaved: (postId: string, saved: boolean) => Res<{ saved: boolean }>;
    setPostSubscription: (postId: string, level: SubscriptionLevel | null) => Res<{ subscription: SubscriptionLevel | null }>;
    acceptAnswer: (postId: string, replyId: string | null) => Res<CommunityPostDetail>;
    getPostRevisions: (postId: string) => Res<CommunityPostRevision[]>;

    // ── Polls & quizzes ──
    votePoll: (pollId: string, optionIds: string[]) => Res<CommunityPoll>;
    retractVote: (pollId: string) => Res<CommunityPoll>;
    getPollVoters: (pollId: string) => Res<CommunityPollVoters[]>;

    // ── Replies ──
    getReplies: (postId: string, params?: CommunityReplyParams, options?: ListOptions) => Res<CommunityPage<CommunityReply>>;
    /** Tree mode: loads (more) children of a reply into `replies`. */
    loadReplyChildren: (postId: string, parentId: string, params?: Omit<CommunityReplyParams, "parentId" | "mode">) => Res<CommunityPage<CommunityReply>>;
    getReplyThread: (replyId: string) => Res<CommunityReplyThread>;
    createReply: (postId: string, input: CreateReplyInput) => Res<CommunityReply>;
    updateReply: (replyId: string, input: UpdateReplyInput) => Res<CommunityReply>;
    deleteReply: (replyId: string) => Res<{ deleted: boolean }>;
    reactToReply: (replyId: string, reactionType?: ReactionType) => Res<CommunityReactionResult>;
    removeReplyReaction: (replyId: string) => Res<CommunityReactionResult>;
    toggleReplyLike: (reply: Pick<CommunityReply, "id" | "liked">) => Res<CommunityReactionResult>;
    getReplyRevisions: (replyId: string) => Res<CommunityReplyRevision[]>;

    // ── Attachments ──
    /** Presign → PUT the file straight to storage → returns the attachment to pass in `attachmentIds`. */
    uploadAttachment: (file: File, options?: UploadAttachmentOptions) => Res<CommunityAttachment>;
    /** Removes an upload that was never attached to a post / reply. */
    deletePendingAttachment: (attachmentId: string) => Res<null>;

    // ── Reports ──
    reportContent: (input: ReportInput) => Res<{ reportId: string; status: ReportStatus }>;

    // ── Members ──
    getMe: () => Res<CommunityMe>;
    updateMe: (input: UpdateMeInput) => Res<CommunityMe>;
    searchMembers: (params?: { q?: string; spaceId?: string; limit?: number }) => Res<CommunityAuthor[]>;
    getLeaderboard: (params?: { limit?: number; days?: number }) => Res<CommunityLeaderboardEntry[]>;
    getMemberProfile: (memberId: string) => Res<CommunityMemberProfile>;

    // ── Notifications ──
    getNotifications: (params?: NotificationParams, options?: ListOptions) => Res<CommunityNotificationPage>;
    getUnreadCount: () => Res<{ unread: number }>;
    markNotificationsRead: (ids: string[] | "all") => Res<{ updated: number; unread: number }>;

    // ── Admin: queue & posts ──
    getQueueSummary: () => Res<CommunityQueueSummary>;
    getModerationPosts: (params?: ModerationPostsParams, options?: ListOptions) => Res<CommunityPage<CommunityPost>>;
    pinPost: (postId: string, input?: PinInput) => Res<CommunityPostDetail>;
    unpinPost: (postId: string) => Res<CommunityPostDetail>;
    lockPost: (postId: string, reason?: string) => Res<CommunityPostDetail>;
    unlockPost: (postId: string, reason?: string) => Res<CommunityPostDetail>;
    hidePost: (postId: string, reason?: string) => Res<{ status: PostStatus }>;
    restorePost: (postId: string) => Res<CommunityPostDetail>;
    approvePost: (postId: string) => Res<CommunityPostDetail>;
    rejectPost: (postId: string, reason: string) => Res<{ status: PostStatus }>;
    movePost: (postId: string, input: MovePostInput) => Res<CommunityPostDetail>;
    moderatorDeletePost: (postId: string, reason?: string) => Res<{ status: PostStatus }>;
    purgePost: (postId: string, reason?: string) => Res<{ purged: boolean }>;

    // ── Admin: replies ──
    hideReply: (replyId: string, reason?: string) => Res<{ status: ReplyStatus }>;
    restoreReply: (replyId: string) => Res<{ status: ReplyStatus }>;
    moderatorDeleteReply: (replyId: string, reason?: string) => Res<{ status: ReplyStatus }>;
    purgeReply: (replyId: string, reason?: string) => Res<{ purged: number }>;

    // ── Admin: reports ──
    getReports: (params?: ReportsParams, options?: ListOptions) => Res<CommunityPage<CommunityReport>>;
    resolveReport: (reportId: string, input: ResolveReportInput) => Res<CommunityReportResolution>;
    dismissReport: (reportId: string, note?: string) => Res<CommunityReportResolution>;

    // ── Admin: members ──
    getAdminMembers: (params?: AdminMembersParams, options?: ListOptions) => Res<CommunityPage<CommunityAdminMember>>;
    muteMember: (memberId: string, input?: MuteMemberInput) => Res<{ memberId: string; action: string }>;
    unmuteMember: (memberId: string) => Res<{ memberId: string; action: string }>;
    banMember: (memberId: string, reason: string) => Res<{ memberId: string; action: string }>;
    unbanMember: (memberId: string) => Res<{ memberId: string; action: string }>;
    getModerationLog: (params?: ModerationLogParams, options?: ListOptions) => Res<CommunityPage<CommunityModerationLogEntry>>;

    // ── Admin: spaces ──
    getAdminSpaces: (params?: AdminSpacesParams) => Res<CommunityAdminSpace[]>;
    createSpace: (input: CreateSpaceInput) => Res<CommunityAdminSpace>;
    updateSpace: (spaceId: string, input: UpdateSpaceInput) => Res<CommunityAdminSpace>;
    deleteSpace: (spaceId: string) => Res<{ deleted: boolean }>;
    syncBatchSpaces: () => Res<{ created: number }>;
    getSpaceModerators: (spaceId: string) => Res<CommunitySpaceModerator[]>;
    addSpaceModerator: (spaceId: string, memberId: string) => Res<CommunitySpaceModerator[]>;
    removeSpaceModerator: (spaceId: string, memberId: string) => Res<CommunitySpaceModerator[]>;

    // ── Admin: categories & tags ──
    getAdminCategories: () => Res<CommunityCategory[]>;
    createCategory: (input: CategoryInput) => Res<CommunityCategory>;
    updateCategory: (categoryId: string, input: Partial<CategoryInput>) => Res<CommunityCategory>;
    deleteCategory: (categoryId: string) => Res<{ deleted: boolean; deactivated: boolean }>;
    reorderCategories: (categoryIds: string[]) => Res<CommunityCategory[]>;
    getAdminTags: () => Res<CommunityTag[]>;
    createTag: (input: TagInput) => Res<CommunityTag>;
    updateTag: (tagId: string, input: Partial<TagInput>) => Res<CommunityTag>;
    deleteTag: (tagId: string) => Res<{ deleted: boolean; deactivated: boolean }>;

    // ── Admin: analytics ──
    getAnalytics: (days?: number) => Res<CommunityAnalytics>;
}

const CommunityApiContext = createContext<CommunityApiContextValue | null>(null);

const BASE = "/api/v1/community";
const ADMIN = "/api/v1/community-admin";
const enc = encodeURIComponent;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
    path: string;
    method?: HttpMethod;
    body?: object;
    params?: object;
}

function toMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
}

/** Wraps axiosHandler into the StandardResponse shape used by every context. */
async function request<T>(options: RequestOptions, fallback: string, successMessage: string | null = null): Promise<StandardResponse<T>> {
    try {
        const data = (await axiosHandler({ method: "GET", ...options })) as T;
        return { success: true, message: successMessage, data: data ?? null };
    } catch (error: unknown) {
        return { success: false, message: toMessage(error, fallback), data: null };
    }
}

/** Drops empty filters and sends arrays as "a,b" (what the API's zod schemas expect). */
function cleanParams(params?: object): Record<string, string | number | boolean> | undefined {
    if (!params) return undefined;
    const entries = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0))
        .map(([k, v]) => [k, Array.isArray(v) ? v.join(",") : v]);
    return entries.length ? (Object.fromEntries(entries) as Record<string, string | number | boolean>) : undefined;
}

function toMeta(page: { total: number; page: number; limit: number }): CommunityPageMeta {
    const totalPages = Math.max(1, Math.ceil(page.total / Math.max(1, page.limit)));
    return { total: page.total, page: page.page, limit: page.limit, totalPages, hasMore: page.page < totalPages };
}

/** Appends a page, skipping ids already loaded (items can shift between pages). */
function mergePage<T extends { id: string }>(prev: T[], next: T[], append?: boolean): T[] {
    if (!append) return next;
    const seen = new Set(prev.map((item) => item.id));
    return [...prev, ...next.filter((item) => !seen.has(item.id))];
}

/** Applies `fn` to the reply with `replyId` anywhere in a (possibly nested) list. */
function mapReplyTree(list: CommunityReply[], replyId: string, fn: (reply: CommunityReply) => CommunityReply): CommunityReply[] {
    let touched = false;
    const next = list.map((reply) => {
        if (reply.id === replyId) {
            touched = true;
            return fn(reply);
        }
        if (reply.children?.length) {
            const children = mapReplyTree(reply.children, replyId, fn);
            if (children !== reply.children) {
                touched = true;
                return { ...reply, children };
            }
        }
        return reply;
    });
    return touched ? next : list;
}

function mapAllReplies(list: CommunityReply[], fn: (reply: CommunityReply) => CommunityReply): CommunityReply[] {
    return list.map((reply) => {
        const mapped = fn(reply);
        return mapped.children?.length ? { ...mapped, children: mapAllReplies(mapped.children, fn) } : mapped;
    });
}

function findReply(list: CommunityReply[], replyId: string): CommunityReply | null {
    for (const reply of list) {
        if (reply.id === replyId) return reply;
        const found = reply.children?.length ? findReply(reply.children, replyId) : null;
        if (found) return found;
    }
    return null;
}

function removeReply(list: CommunityReply[], replyId: string): CommunityReply[] {
    return list
        .filter((reply) => reply.id !== replyId)
        .map((reply) => (reply.children?.length ? { ...reply, children: removeReply(reply.children, replyId) } : reply));
}

/** Placeholder the API shows for removed replies that still have answers. */
function asRemovedPlaceholder(reply: CommunityReply, status: ReplyStatus): CommunityReply {
    return { ...reply, status, html: null, author: null, attachments: [], liked: false, myReaction: null };
}

/** Width / height for images, used by the UI to reserve space before the image loads. */
async function readImageSize(file: File): Promise<{ width?: number; height?: number }> {
    if (!file.type.startsWith("image/") || typeof createImageBitmap === "undefined") return {};
    try {
        const bitmap = await createImageBitmap(file);
        const size = { width: bitmap.width, height: bitmap.height };
        bitmap.close();
        return size;
    } catch {
        return {};
    }
}

/** PUT straight to the presigned storage URL — never sends our auth header. */
function putToStorage(url: string, file: File, headers: Record<string, string>, onProgress?: (pct: number) => void, signal?: AbortSignal) {
    return new Promise<void>((resolve, reject) => {
        if (signal?.aborted) return reject(new Error("Upload cancelled"));
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        Object.entries(headers).forEach(([key, value]) => xhr.setRequestHeader(key, value));
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) onProgress?.(Math.min(99, Math.round((event.loaded / event.total) * 100)));
        };
        const onAbort = () => xhr.abort();
        signal?.addEventListener("abort", onAbort, { once: true });
        const done = () => signal?.removeEventListener("abort", onAbort);
        xhr.onload = () => {
            done();
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`Upload failed (HTTP ${xhr.status})`));
        };
        xhr.onerror = () => {
            done();
            reject(new Error("Network error during upload"));
        };
        xhr.onabort = () => {
            done();
            reject(new Error("Upload cancelled"));
        };
        xhr.send(file);
    });
}

/** Mention markup the API understands (pass the member id, not the user id). */
export function mentionHtml(member: Pick<CommunityAuthor, "id" | "name">): string {
    const name = member.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    return `<span class="mention" data-member-id="${member.id ?? ""}">@${name}</span>`;
}

/**
 * Maps a sidebar selection (the UI's FeedFilter: "all" | category slug | "pinned" | "mine" | "saved" …)
 * to feed params.
 */
export function feedParamsFromSelection(selection: string): Pick<CommunityFeedParams, "filter" | "category"> {
    return (FEED_FILTERS as readonly string[]).includes(selection)
        ? { filter: selection as CommunityFeedFilter, category: undefined }
        : { filter: "all", category: selection };
}

export const isStaffRole = (role: string) => (COMMUNITY_STAFF_ROLES as string[]).includes(role);

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

type PostPatch = Partial<CommunityPost> | ((post: CommunityPost) => Partial<CommunityPost>);

export function CommunityApiProvider({ children }: { children: ReactNode }) {
    // Bootstrap & taxonomy
    const [me, setMe] = useState<CommunityMe | null>(null);
    const [spaces, setSpaces] = useState<CommunitySpace[]>([]);
    const [categories, setCategories] = useState<CommunityCategory[]>([]);
    const [tags, setTags] = useState<CommunityTag[]>([]);
    const [counts, setCounts] = useState<CommunityFeedCounts | null>(null);
    const [onlineCount, setOnlineCount] = useState(0);
    const [config, setConfig] = useState<CommunityConfig>(DEFAULT_COMMUNITY_CONFIG);
    const [initialized, setInitialized] = useState(false);
    const [loadingBootstrap, setLoadingBootstrap] = useState(false);

    // Feed & thread
    const [feed, setFeed] = useState<CommunityPost[]>([]);
    const [feedMeta, setFeedMeta] = useState<CommunityPageMeta | null>(null);
    const [loadingFeed, setLoadingFeed] = useState(false);
    const [activePost, setActivePost] = useState<CommunityPostDetail | null>(null);
    const [loadingPost, setLoadingPost] = useState(false);
    const [replies, setReplies] = useState<CommunityReply[]>([]);
    const [repliesMeta, setRepliesMeta] = useState<CommunityPageMeta | null>(null);
    const [repliesPostId, setRepliesPostId] = useState<string | null>(null);
    const [loadingReplies, setLoadingReplies] = useState(false);

    // Notifications
    const [notifications, setNotifications] = useState<CommunityNotification[]>([]);
    const [notificationsMeta, setNotificationsMeta] = useState<CommunityPageMeta | null>(null);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    // Admin
    const [queue, setQueue] = useState<CommunityQueueSummary | null>(null);
    const [moderationPosts, setModerationPosts] = useState<CommunityPost[]>([]);
    const [moderationPostsMeta, setModerationPostsMeta] = useState<CommunityPageMeta | null>(null);
    const [reports, setReports] = useState<CommunityReport[]>([]);
    const [reportsMeta, setReportsMeta] = useState<CommunityPageMeta | null>(null);
    const [adminMembers, setAdminMembers] = useState<CommunityAdminMember[]>([]);
    const [adminMembersMeta, setAdminMembersMeta] = useState<CommunityPageMeta | null>(null);
    const [moderationLog, setModerationLog] = useState<CommunityModerationLogEntry[]>([]);
    const [moderationLogMeta, setModerationLogMeta] = useState<CommunityPageMeta | null>(null);
    const [adminSpaces, setAdminSpaces] = useState<CommunityAdminSpace[]>([]);
    const [adminCategories, setAdminCategories] = useState<CommunityCategory[]>([]);
    const [adminTags, setAdminTags] = useState<CommunityTag[]>([]);
    const [analytics, setAnalytics] = useState<CommunityAnalytics | null>(null);
    const [loadingAdmin, setLoadingAdmin] = useState(false);

    // Latest values for callbacks that need to read state without changing identity.
    const feedSeq = useRef(0);
    const repliesSeq = useRef(0);
    const latest = useRef({ config, replies, reports, queue, repliesPostId, feedSpaceId: undefined as string | undefined, replyMode: "tree" as ReplyListMode });
    useEffect(() => {
        latest.current = { ...latest.current, config, replies, reports, queue, repliesPostId };
    }, [config, replies, reports, queue, repliesPostId]);

    /* ----------------------- local state patches ----------------------- */

    /** Patches a post everywhere it is shown (feed, open thread, moderation list). */
    const patchPost = useCallback((postId: string, patch: PostPatch) => {
        const apply = <P extends CommunityPost>(post: P): P =>
            post.id === postId ? ({ ...post, ...(typeof patch === "function" ? patch(post) : patch) } as P) : post;
        setFeed((prev) => prev.map(apply));
        setModerationPosts((prev) => prev.map(apply));
        setActivePost((prev) => (prev ? apply(prev) : prev));
    }, []);

    /** Replaces a post with a fresh detail payload (moderation / edit responses). */
    const replacePost = useCallback((detail: CommunityPostDetail) => {
        const apply = <P extends CommunityPost>(post: P): P => (post.id === detail.id ? ({ ...post, ...detail } as P) : post);
        setFeed((prev) => prev.map(apply));
        setModerationPosts((prev) => prev.map(apply));
        setActivePost((prev) => (prev?.id === detail.id ? detail : prev));
    }, []);

    const removePostLocally = useCallback((postId: string) => {
        setFeed((prev) => prev.filter((post) => post.id !== postId));
        setModerationPosts((prev) => prev.filter((post) => post.id !== postId));
        setActivePost((prev) => (prev?.id === postId ? null : prev));
    }, []);

    const patchPoll = useCallback((poll: CommunityPoll) => {
        const apply = <P extends CommunityPost>(post: P): P =>
            post.polls.some((p) => p.id === poll.id)
                ? ({ ...post, polls: post.polls.map((p) => (p.id === poll.id ? poll : p)), poll: post.poll?.id === poll.id ? poll : post.poll } as P)
                : post;
        setFeed((prev) => prev.map(apply));
        setModerationPosts((prev) => prev.map(apply));
        setActivePost((prev) => (prev ? apply(prev) : prev));
    }, []);

    const patchReply = useCallback((replyId: string, fn: (reply: CommunityReply) => CommunityReply) => {
        setReplies((prev) => mapReplyTree(prev, replyId, fn));
        setActivePost((prev) => (prev?.acceptedReply?.id === replyId ? { ...prev, acceptedReply: fn(prev.acceptedReply) } : prev));
    }, []);

    /**
     * Mirrors a reply status change locally, including post.replyCount, the parent's childCount and the
     * accepted answer. `keepContent` = the viewer still sees it (moderators); otherwise it becomes a
     * placeholder (if it has answers) or disappears.
     */
    const applyReplyStatus = useCallback(
        (replyId: string, status: ReplyStatus, keepContent: boolean) => {
            const current = findReply(latest.current.replies, replyId);
            if (!current) {
                setActivePost((prev) => (prev?.acceptedReply?.id === replyId ? { ...prev, acceptedReply: { ...prev.acceptedReply, status } } : prev));
                return;
            }
            if (current.status === status) return;
            const delta = (status === "published" ? 1 : 0) - (current.status === "published" ? 1 : 0);
            if (keepContent) setReplies((prev) => mapReplyTree(prev, replyId, (reply) => ({ ...reply, status })));
            else if (current.childCount > 0) setReplies((prev) => mapReplyTree(prev, replyId, (reply) => asRemovedPlaceholder(reply, status)));
            else setReplies((prev) => removeReply(prev, replyId));
            if (delta && current.parentId) {
                setReplies((prev) => mapReplyTree(prev, current.parentId!, (parent) => ({ ...parent, childCount: Math.max(0, parent.childCount + delta) })));
            }
            const clearsAnswer = status !== "published" && current.isAccepted;
            patchPost(current.postId, (post) => ({
                replyCount: Math.max(0, post.replyCount + delta),
                ...(clearsAnswer ? { acceptedReplyId: null, isAnswered: false } : {}),
            }));
            if (clearsAnswer) {
                setActivePost((prev) => (prev?.id === current.postId ? { ...prev, acceptedReply: null } : prev));
                setReplies((prev) => mapReplyTree(prev, replyId, (reply) => ({ ...reply, isAccepted: false })));
            }
        },
        [patchPost],
    );

    /* ------------------------- silent refreshes ------------------------- */

    const refreshCounts = useCallback(async () => {
        const res = await request<CommunityFeedCounts>({ path: `${BASE}/feed/counts`, params: cleanParams({ spaceId: latest.current.feedSpaceId }) }, "");
        if (res.success && res.data) setCounts(res.data);
    }, []);

    const refreshPost = useCallback(
        async (postId: string) => {
            const res = await request<CommunityPostDetail>({ path: `${BASE}/posts/${enc(postId)}` }, "");
            if (res.success && res.data) replacePost(res.data);
        },
        [replacePost],
    );

    /** Only when a moderation screen has loaded the queue. */
    const refreshQueue = useCallback(async () => {
        if (!latest.current.queue) return;
        const res = await request<CommunityQueueSummary>({ path: `${ADMIN}/queue` }, "");
        if (res.success && res.data) setQueue(res.data);
    }, []);

    /* ---------------------- bootstrap & taxonomy ---------------------- */

    const getBootstrap = useCallback(async (): Res<CommunityBootstrap> => {
        setLoadingBootstrap(true);
        try {
            const res = await request<CommunityBootstrap>({ path: `${BASE}/bootstrap` }, "Failed to load the community");
            if (res.success && res.data) {
                setMe(res.data.me);
                setSpaces(res.data.spaces);
                setCategories(res.data.categories);
                setTags(res.data.tags);
                setCounts(res.data.counts);
                setOnlineCount(res.data.onlineCount);
                setUnreadNotifications(res.data.unreadNotifications);
                setConfig({ ...DEFAULT_COMMUNITY_CONFIG, ...res.data.config });
                setInitialized(true);
            }
            return res;
        } finally {
            setLoadingBootstrap(false);
        }
    }, []);

    const getSpaces = useCallback(async (): Res<CommunitySpace[]> => {
        const res = await request<CommunitySpace[]>({ path: `${BASE}/spaces` }, "Failed to fetch spaces");
        if (res.success && res.data) setSpaces(res.data);
        return res;
    }, []);

    const getCategories = useCallback(async (spaceId?: string): Res<CommunityCategory[]> => {
        const res = await request<CommunityCategory[]>({ path: `${BASE}/categories`, params: cleanParams({ spaceId }) }, "Failed to fetch categories");
        if (res.success && res.data) setCategories(res.data);
        return res;
    }, []);

    const getTags = useCallback(async (): Res<CommunityTag[]> => {
        const res = await request<CommunityTag[]>({ path: `${BASE}/tags` }, "Failed to fetch tags");
        if (res.success && res.data) setTags(res.data);
        return res;
    }, []);

    const getFeedCounts = useCallback(async (spaceId?: string): Res<CommunityFeedCounts> => {
        const res = await request<CommunityFeedCounts>({ path: `${BASE}/feed/counts`, params: cleanParams({ spaceId }) }, "Failed to fetch counts");
        if (res.success && res.data) setCounts(res.data);
        return res;
    }, []);

    /* ------------------------------ posts ------------------------------ */

    const getFeed = useCallback(async (params: CommunityFeedParams = {}, options: ListOptions = {}): Res<CommunityPage<CommunityPost>> => {
        const seq = ++feedSeq.current;
        setLoadingFeed(true);
        latest.current.feedSpaceId = params.spaceId;
        try {
            const res = await request<CommunityPage<CommunityPost>>({ path: `${BASE}/posts`, params: cleanParams(params) }, "Failed to fetch discussions");
            // A newer feed request was issued meanwhile (filter changed) — drop this response.
            if (seq !== feedSeq.current) return res;
            if (res.success && res.data) {
                const page = res.data;
                setFeed((prev) => mergePage(prev, page.items, options.append));
                setFeedMeta(toMeta(page));
            }
            return res;
        } finally {
            if (seq === feedSeq.current) setLoadingFeed(false);
        }
    }, []);

    const getPost = useCallback(
        async (postId: string): Res<CommunityPostDetail> => {
            setLoadingPost(true);
            try {
                const res = await request<CommunityPostDetail>({ path: `${BASE}/posts/${enc(postId)}` }, "Failed to fetch the discussion");
                if (res.success && res.data) {
                    setActivePost(res.data);
                    replacePost(res.data);
                } else {
                    setActivePost((prev) => (prev?.id === postId ? null : prev));
                }
                return res;
            } finally {
                setLoadingPost(false);
            }
        },
        [replacePost],
    );

    const createPost = useCallback(
        async (input: CreatePostInput): Res<CommunityPostDetail> => {
            const res = await request<CommunityPostDetail>(
                { path: `${BASE}/posts`, method: "POST", body: input },
                "Failed to create the discussion",
                input.postType === "quiz" ? "Quiz posted" : "Discussion posted",
            );
            if (res.success && res.data) {
                const post = res.data;
                setFeed((prev) => [post, ...prev.filter((p) => p.id !== post.id)]);
                if (post.status === "pending_review") res.message = "Submitted — a moderator will review it shortly";
                void refreshCounts();
            }
            return res;
        },
        [refreshCounts],
    );

    const updatePost = useCallback(
        async (postId: string, input: UpdatePostInput): Res<CommunityPostDetail> => {
            const res = await request<CommunityPostDetail>({ path: `${BASE}/posts/${enc(postId)}`, method: "PATCH", body: input }, "Failed to update the discussion", "Discussion updated");
            if (res.success && res.data) replacePost(res.data);
            return res;
        },
        [replacePost],
    );

    const deletePost = useCallback(
        async (postId: string): Res<{ deleted: boolean }> => {
            const res = await request<{ deleted: boolean }>({ path: `${BASE}/posts/${enc(postId)}`, method: "DELETE" }, "Failed to delete the discussion", "Discussion deleted");
            if (res.success) {
                removePostLocally(postId);
                void refreshCounts();
            }
            return res;
        },
        [removePostLocally, refreshCounts],
    );

    const registerView = useCallback(
        async (postId: string): Res<{ views: number }> => {
            const res = await request<{ views: number }>({ path: `${BASE}/posts/${enc(postId)}/view`, method: "POST" }, "Failed to register the view");
            if (res.success && res.data) patchPost(postId, { views: res.data.views, lastViewedAt: new Date().toISOString(), hasNewActivity: false });
            return res;
        },
        [patchPost],
    );

    const reactToPost = useCallback(
        async (postId: string, reactionType: ReactionType = "like"): Res<CommunityReactionResult> => {
            const res = await request<CommunityReactionResult>({ path: `${BASE}/posts/${enc(postId)}/reaction`, method: "PUT", body: { reactionType } }, "Failed to react");
            if (res.success && res.data) patchPost(postId, res.data);
            return res;
        },
        [patchPost],
    );

    const removePostReaction = useCallback(
        async (postId: string): Res<CommunityReactionResult> => {
            const res = await request<CommunityReactionResult>({ path: `${BASE}/posts/${enc(postId)}/reaction`, method: "DELETE" }, "Failed to remove the reaction");
            if (res.success && res.data) patchPost(postId, res.data);
            return res;
        },
        [patchPost],
    );

    const togglePostLike = useCallback(
        (post: Pick<CommunityPost, "id" | "liked">) => (post.liked ? removePostReaction(post.id) : reactToPost(post.id)),
        [reactToPost, removePostReaction],
    );

    const getPostReactions = useCallback(
        (postId: string, params: { type?: ReactionType; page?: number; limit?: number } = {}) =>
            request<CommunityPage<CommunityReactor>>({ path: `${BASE}/posts/${enc(postId)}/reactions`, params: cleanParams(params) }, "Failed to fetch reactions"),
        [],
    );

    const setPostSaved = useCallback(
        async (postId: string, saved: boolean): Res<{ saved: boolean }> => {
            const res = await request<{ saved: boolean }>(
                { path: `${BASE}/posts/${enc(postId)}/save`, method: saved ? "PUT" : "DELETE" },
                saved ? "Failed to save the discussion" : "Failed to unsave the discussion",
                saved ? "Saved" : "Removed from saved",
            );
            if (res.success) {
                patchPost(postId, (post) => (post.saved === saved ? {} : { saved, saves: Math.max(0, post.saves + (saved ? 1 : -1)) }));
                void refreshCounts();
            }
            return res;
        },
        [patchPost, refreshCounts],
    );

    const setPostSubscription = useCallback(
        async (postId: string, level: SubscriptionLevel | null): Res<{ subscription: SubscriptionLevel | null }> => {
            const res = await request<{ subscription: SubscriptionLevel | null }>(
                level ? { path: `${BASE}/posts/${enc(postId)}/subscription`, method: "PUT", body: { level } } : { path: `${BASE}/posts/${enc(postId)}/subscription`, method: "DELETE" },
                "Failed to update notifications for this discussion",
                level === "watching" ? "You'll be notified of new replies" : level === "muted" ? "Discussion muted" : "Stopped following",
            );
            if (res.success) patchPost(postId, { subscription: level });
            return res;
        },
        [patchPost],
    );

    const acceptAnswer = useCallback(
        async (postId: string, replyId: string | null): Res<CommunityPostDetail> => {
            const res = await request<CommunityPostDetail>(
                replyId
                    ? { path: `${BASE}/posts/${enc(postId)}/accepted-answer`, method: "PUT", body: { replyId } }
                    : { path: `${BASE}/posts/${enc(postId)}/accepted-answer`, method: "DELETE" },
                "Failed to update the accepted answer",
                replyId ? "Marked as the answer" : "Answer unmarked",
            );
            if (res.success && res.data) {
                const acceptedId = res.data.acceptedReplyId;
                replacePost(res.data);
                if (latest.current.repliesPostId === postId) setReplies((prev) => mapAllReplies(prev, (reply) => ({ ...reply, isAccepted: reply.id === acceptedId })));
            }
            return res;
        },
        [replacePost],
    );

    const getPostRevisions = useCallback(
        (postId: string) => request<CommunityPostRevision[]>({ path: `${BASE}/posts/${enc(postId)}/revisions` }, "Failed to fetch edit history"),
        [],
    );

    /* ------------------------- polls & quizzes ------------------------- */

    const votePoll = useCallback(
        async (pollId: string, optionIds: string[]): Res<CommunityPoll> => {
            const res = await request<CommunityPoll>({ path: `${BASE}/polls/${enc(pollId)}/vote`, method: "PUT", body: { optionIds } }, "Failed to save your vote");
            if (res.success && res.data) patchPoll(res.data);
            return res;
        },
        [patchPoll],
    );

    const retractVote = useCallback(
        async (pollId: string): Res<CommunityPoll> => {
            const res = await request<CommunityPoll>({ path: `${BASE}/polls/${enc(pollId)}/vote`, method: "DELETE" }, "Failed to remove your vote", "Vote removed");
            if (res.success && res.data) patchPoll(res.data);
            return res;
        },
        [patchPoll],
    );

    const getPollVoters = useCallback(
        (pollId: string) => request<CommunityPollVoters[]>({ path: `${BASE}/polls/${enc(pollId)}/voters` }, "Failed to fetch voters"),
        [],
    );

    /* ------------------------------ replies ----------------------------- */

    const getReplies = useCallback(
        async (postId: string, params: CommunityReplyParams = {}, options: ListOptions = {}): Res<CommunityPage<CommunityReply>> => {
            const seq = ++repliesSeq.current;
            setLoadingReplies(true);
            const samePost = latest.current.repliesPostId === postId;
            latest.current.replyMode = params.mode ?? "tree";
            try {
                const res = await request<CommunityPage<CommunityReply>>(
                    { path: `${BASE}/posts/${enc(postId)}/replies`, params: cleanParams(params) },
                    "Failed to fetch replies",
                );
                if (seq !== repliesSeq.current) return res;
                if (res.success && res.data) {
                    const page = res.data;
                    setRepliesPostId(postId);
                    latest.current.repliesPostId = postId;
                    setReplies((prev) => mergePage(samePost ? prev : [], page.items, options.append && samePost));
                    setRepliesMeta(toMeta(page));
                }
                return res;
            } finally {
                if (seq === repliesSeq.current) setLoadingReplies(false);
            }
        },
        [],
    );

    const loadReplyChildren = useCallback(
        async (postId: string, parentId: string, params: Omit<CommunityReplyParams, "parentId" | "mode"> = {}): Res<CommunityPage<CommunityReply>> => {
            const res = await request<CommunityPage<CommunityReply>>(
                { path: `${BASE}/posts/${enc(postId)}/replies`, params: cleanParams({ previewChildren: 3, ...params, parentId, mode: "tree" }) },
                "Failed to fetch replies",
            );
            if (res.success && res.data) {
                const page = res.data;
                const hasMore = toMeta(page).hasMore;
                setReplies((prev) => mapReplyTree(prev, parentId, (reply) => ({ ...reply, children: mergePage(reply.children ?? [], page.items, true), hasMoreChildren: hasMore })));
            }
            return res;
        },
        [],
    );

    const getReplyThread = useCallback(
        (replyId: string) => request<CommunityReplyThread>({ path: `${BASE}/replies/${enc(replyId)}` }, "Failed to fetch the reply"),
        [],
    );

    const createReply = useCallback(
        async (postId: string, input: CreateReplyInput): Res<CommunityReply> => {
            const res = await request<CommunityReply>({ path: `${BASE}/posts/${enc(postId)}/replies`, method: "POST", body: input }, "Failed to post your reply", "Reply posted");
            if (!res.success || !res.data) return res;
            const reply: CommunityReply = { children: [], hasMoreChildren: false, ...res.data };
            if (latest.current.repliesPostId === postId) {
                // Deep replies may be re-parented by the API — always insert under the returned parentId.
                if (latest.current.replyMode === "tree" && reply.parentId) {
                    setReplies((prev) =>
                        mapReplyTree(prev, reply.parentId!, (parent) => ({ ...parent, childCount: parent.childCount + 1, children: [...(parent.children ?? []), reply] })),
                    );
                } else {
                    setReplies((prev) => [...prev, reply]);
                    setRepliesMeta((prev) => (prev ? { ...prev, total: prev.total + 1 } : prev));
                    if (reply.parentId) {
                        setReplies((prev) => mapReplyTree(prev, reply.parentId!, (parent) => ({ ...parent, childCount: parent.childCount + 1 })));
                    }
                }
            }
            patchPost(postId, (post) => ({ replyCount: post.replyCount + 1, lastActivityAt: reply.createdAt }));
            if (reply.author) {
                const lastReply = { author: reply.author, at: reply.createdAt, replyId: reply.id };
                setActivePost((prev) => (prev?.id === postId ? { ...prev, activity: { ...prev.activity, lastReply } } : prev));
            }
            return res;
        },
        [patchPost],
    );

    const updateReply = useCallback(
        async (replyId: string, input: UpdateReplyInput): Res<CommunityReply> => {
            const res = await request<CommunityReply>({ path: `${BASE}/replies/${enc(replyId)}`, method: "PATCH", body: input }, "Failed to update your reply", "Reply updated");
            if (res.success && res.data) {
                const updated = res.data;
                patchReply(replyId, (reply) => ({ ...updated, children: reply.children, hasMoreChildren: reply.hasMoreChildren }));
            }
            return res;
        },
        [patchReply],
    );

    const deleteReply = useCallback(
        async (replyId: string): Res<{ deleted: boolean }> => {
            const res = await request<{ deleted: boolean }>({ path: `${BASE}/replies/${enc(replyId)}`, method: "DELETE" }, "Failed to delete your reply", "Reply deleted");
            if (res.success) applyReplyStatus(replyId, "deleted", false);
            return res;
        },
        [applyReplyStatus],
    );

    const reactToReply = useCallback(
        async (replyId: string, reactionType: ReactionType = "like"): Res<CommunityReactionResult> => {
            const res = await request<CommunityReactionResult>({ path: `${BASE}/replies/${enc(replyId)}/reaction`, method: "PUT", body: { reactionType } }, "Failed to react");
            if (res.success && res.data) {
                const result = res.data;
                patchReply(replyId, (reply) => ({ ...reply, ...result }));
            }
            return res;
        },
        [patchReply],
    );

    const removeReplyReaction = useCallback(
        async (replyId: string): Res<CommunityReactionResult> => {
            const res = await request<CommunityReactionResult>({ path: `${BASE}/replies/${enc(replyId)}/reaction`, method: "DELETE" }, "Failed to remove the reaction");
            if (res.success && res.data) {
                const result = res.data;
                patchReply(replyId, (reply) => ({ ...reply, ...result }));
            }
            return res;
        },
        [patchReply],
    );

    const toggleReplyLike = useCallback(
        (reply: Pick<CommunityReply, "id" | "liked">) => (reply.liked ? removeReplyReaction(reply.id) : reactToReply(reply.id)),
        [reactToReply, removeReplyReaction],
    );

    const getReplyRevisions = useCallback(
        (replyId: string) => request<CommunityReplyRevision[]>({ path: `${BASE}/replies/${enc(replyId)}/revisions` }, "Failed to fetch edit history"),
        [],
    );

    /* ---------------------------- attachments ---------------------------- */

    const deletePendingAttachment = useCallback(
        (attachmentId: string) => request<null>({ path: `${BASE}/attachments/${enc(attachmentId)}`, method: "DELETE" }, "Failed to remove the attachment"),
        [],
    );

    const uploadAttachment = useCallback(
        async (file: File, options: UploadAttachmentOptions = {}): Res<CommunityAttachment> => {
            const { maxAttachmentBytes } = latest.current.config;
            if (file.size > maxAttachmentBytes) {
                return { success: false, message: `Files must be smaller than ${Math.round(maxAttachmentBytes / 1024 / 1024)} MB`, data: null };
            }
            const ticket = await request<CommunityUploadTicket>(
                {
                    path: `${BASE}/attachments/upload-url`,
                    method: "POST",
                    body: { fileName: file.name, contentType: file.type || "application/octet-stream", sizeBytes: file.size, ...(await readImageSize(file)) },
                },
                "Couldn't start the upload",
            );
            if (!ticket.success || !ticket.data) return { success: false, message: ticket.message, data: null };
            const { attachment, upload } = ticket.data;
            try {
                options.onProgress?.(0);
                await putToStorage(upload.url, file, upload.headers ?? {}, options.onProgress, options.signal);
                options.onProgress?.(100);
                return { success: true, message: null, data: { ...attachment, progress: 100 } };
            } catch (error: unknown) {
                void deletePendingAttachment(attachment.id);
                return { success: false, message: toMessage(error, "Upload failed"), data: null };
            }
        },
        [deletePendingAttachment],
    );

    /* ------------------------------ reports ----------------------------- */

    const reportContent = useCallback(
        (input: ReportInput) =>
            request<{ reportId: string; status: ReportStatus }>({ path: `${BASE}/reports`, method: "POST", body: input }, "Failed to send the report", "Thanks — our moderators will review this"),
        [],
    );

    /* ------------------------------ members ----------------------------- */

    const getMe = useCallback(async (): Res<CommunityMe> => {
        const res = await request<CommunityMe>({ path: `${BASE}/me` }, "Failed to fetch your community profile");
        if (res.success && res.data) setMe(res.data);
        return res;
    }, []);

    const updateMe = useCallback(async (input: UpdateMeInput): Res<CommunityMe> => {
        const res = await request<CommunityMe>({ path: `${BASE}/me`, method: "PATCH", body: input }, "Failed to update your profile", "Profile updated");
        if (res.success && res.data) setMe(res.data);
        return res;
    }, []);

    const searchMembers = useCallback(
        (params: { q?: string; spaceId?: string; limit?: number } = {}) =>
            request<CommunityAuthor[]>({ path: `${BASE}/members/search`, params: cleanParams(params) }, "Failed to search members"),
        [],
    );

    const getLeaderboard = useCallback(
        (params: { limit?: number; days?: number } = {}) =>
            request<CommunityLeaderboardEntry[]>({ path: `${BASE}/members/leaderboard`, params: cleanParams(params) }, "Failed to fetch the leaderboard"),
        [],
    );

    const getMemberProfile = useCallback(
        (memberId: string) => request<CommunityMemberProfile>({ path: `${BASE}/members/${enc(memberId)}` }, "Failed to fetch the member"),
        [],
    );

    /* --------------------------- notifications --------------------------- */

    const getNotifications = useCallback(async (params: NotificationParams = {}, options: ListOptions = {}): Res<CommunityNotificationPage> => {
        setLoadingNotifications(true);
        try {
            const res = await request<CommunityNotificationPage>({ path: `${BASE}/notifications`, params: cleanParams(params) }, "Failed to fetch notifications");
            if (res.success && res.data) {
                const page = res.data;
                setNotifications((prev) => mergePage(prev, page.items, options.append));
                setNotificationsMeta(toMeta(page));
                setUnreadNotifications(page.unread);
            }
            return res;
        } finally {
            setLoadingNotifications(false);
        }
    }, []);

    const getUnreadCount = useCallback(async (): Res<{ unread: number }> => {
        const res = await request<{ unread: number }>({ path: `${BASE}/notifications/unread-count` }, "Failed to fetch unread notifications");
        if (res.success && res.data) setUnreadNotifications(res.data.unread);
        return res;
    }, []);

    const markNotificationsRead = useCallback(async (ids: string[] | "all"): Res<{ updated: number; unread: number }> => {
        const all = ids === "all";
        const res = await request<{ updated: number; unread: number }>(
            { path: `${BASE}/notifications/read`, method: "POST", body: all ? { all: true } : { ids } },
            "Failed to update notifications",
        );
        if (res.success && res.data) {
            const read = new Set(all ? [] : ids);
            setNotifications((prev) => prev.map((n) => (all || read.has(n.id) ? { ...n, isRead: true } : n)));
            setUnreadNotifications(res.data.unread);
        }
        return res;
    }, []);

    /* ------------------------- admin: queue & posts ------------------------- */

    const getQueueSummary = useCallback(async (): Res<CommunityQueueSummary> => {
        const res = await request<CommunityQueueSummary>({ path: `${ADMIN}/queue` }, "Failed to fetch the moderation queue");
        if (res.success && res.data) setQueue(res.data);
        return res;
    }, []);

    const getModerationPosts = useCallback(async (params: ModerationPostsParams = {}, options: ListOptions = {}): Res<CommunityPage<CommunityPost>> => {
        setLoadingAdmin(true);
        try {
            const res = await request<CommunityPage<CommunityPost>>({ path: `${ADMIN}/posts`, params: cleanParams(params) }, "Failed to fetch discussions");
            if (res.success && res.data) {
                const page = res.data;
                setModerationPosts((prev) => mergePage(prev, page.items, options.append));
                setModerationPostsMeta(toMeta(page));
            }
            return res;
        } finally {
            setLoadingAdmin(false);
        }
    }, []);

    /** Moderation actions that answer with the refreshed thread. */
    const postAction = useCallback(
        async (path: string, method: HttpMethod, body: object | undefined, fallback: string, success: string): Res<CommunityPostDetail> => {
            const res = await request<CommunityPostDetail>({ path, method, body }, fallback, success);
            if (res.success && res.data) {
                replacePost(res.data);
                void refreshQueue();
            }
            return res;
        },
        [replacePost, refreshQueue],
    );

    const pinPost = useCallback(
        (postId: string, input: PinInput = {}) => postAction(`${ADMIN}/posts/${enc(postId)}/pin`, "POST", input, "Failed to pin the discussion", "Discussion pinned"),
        [postAction],
    );
    const unpinPost = useCallback(
        (postId: string) => postAction(`${ADMIN}/posts/${enc(postId)}/pin`, "DELETE", undefined, "Failed to unpin the discussion", "Discussion unpinned"),
        [postAction],
    );
    const lockPost = useCallback(
        (postId: string, reason?: string) => postAction(`${ADMIN}/posts/${enc(postId)}/lock`, "POST", { reason }, "Failed to lock the discussion", "Discussion locked"),
        [postAction],
    );
    const unlockPost = useCallback(
        (postId: string, reason?: string) => postAction(`${ADMIN}/posts/${enc(postId)}/lock`, "DELETE", { reason }, "Failed to unlock the discussion", "Discussion unlocked"),
        [postAction],
    );
    const restorePost = useCallback(
        (postId: string) => postAction(`${ADMIN}/posts/${enc(postId)}/restore`, "POST", undefined, "Failed to restore the discussion", "Discussion restored"),
        [postAction],
    );
    const approvePost = useCallback(
        (postId: string) => postAction(`${ADMIN}/posts/${enc(postId)}/approve`, "POST", undefined, "Failed to approve the discussion", "Discussion approved"),
        [postAction],
    );
    const movePost = useCallback(
        (postId: string, input: MovePostInput) => postAction(`${ADMIN}/posts/${enc(postId)}/move`, "POST", input, "Failed to move the discussion", "Discussion moved"),
        [postAction],
    );

    /** Moderation actions that answer with the new status only. */
    const postStatusAction = useCallback(
        async (postId: string, action: "hide" | "reject" | "delete", body: object, fallback: string, success: string): Res<{ status: PostStatus }> => {
            const res = await request<{ status: PostStatus }>({ path: `${ADMIN}/posts/${enc(postId)}/${action}`, method: "POST", body }, fallback, success);
            if (res.success && res.data) {
                const { status } = res.data;
                const note = (body as { reason?: string }).reason;
                patchPost(postId, { status, ...(note ? { moderationNote: note } : {}) });
                void refreshQueue();
            }
            return res;
        },
        [patchPost, refreshQueue],
    );

    const hidePost = useCallback(
        (postId: string, reason?: string) => postStatusAction(postId, "hide", { reason }, "Failed to hide the discussion", "Discussion hidden"),
        [postStatusAction],
    );
    const rejectPost = useCallback(
        (postId: string, reason: string) => postStatusAction(postId, "reject", { reason }, "Failed to reject the discussion", "Discussion rejected"),
        [postStatusAction],
    );
    const moderatorDeletePost = useCallback(
        (postId: string, reason?: string) => postStatusAction(postId, "delete", { reason }, "Failed to delete the discussion", "Discussion deleted"),
        [postStatusAction],
    );

    const purgePost = useCallback(
        async (postId: string, reason?: string): Res<{ purged: boolean }> => {
            const res = await request<{ purged: boolean }>(
                { path: `${ADMIN}/posts/${enc(postId)}`, method: "DELETE", body: { reason } },
                "Failed to permanently delete the discussion",
                "Discussion permanently deleted",
            );
            if (res.success) {
                removePostLocally(postId);
                void refreshCounts();
                void refreshQueue();
            }
            return res;
        },
        [removePostLocally, refreshCounts, refreshQueue],
    );

    /* --------------------------- admin: replies --------------------------- */

    const replyStatusAction = useCallback(
        async (replyId: string, action: "hide" | "restore" | "delete", reason: string | undefined, fallback: string, success: string): Res<{ status: ReplyStatus }> => {
            const res = await request<{ status: ReplyStatus }>(
                { path: `${ADMIN}/replies/${enc(replyId)}/${action}`, method: "POST", body: action === "restore" ? undefined : { reason } },
                fallback,
                success,
            );
            if (res.success && res.data) applyReplyStatus(replyId, res.data.status, true);
            return res;
        },
        [applyReplyStatus],
    );

    const hideReply = useCallback(
        (replyId: string, reason?: string) => replyStatusAction(replyId, "hide", reason, "Failed to hide the reply", "Reply hidden"),
        [replyStatusAction],
    );
    const restoreReply = useCallback(
        (replyId: string) => replyStatusAction(replyId, "restore", undefined, "Failed to restore the reply", "Reply restored"),
        [replyStatusAction],
    );
    const moderatorDeleteReply = useCallback(
        (replyId: string, reason?: string) => replyStatusAction(replyId, "delete", reason, "Failed to delete the reply", "Reply deleted"),
        [replyStatusAction],
    );

    const purgeReply = useCallback(
        async (replyId: string, reason?: string): Res<{ purged: number }> => {
            const postId = findReply(latest.current.replies, replyId)?.postId;
            const res = await request<{ purged: number }>(
                { path: `${ADMIN}/replies/${enc(replyId)}`, method: "DELETE", body: { reason } },
                "Failed to permanently delete the reply",
                "Reply permanently deleted",
            );
            if (res.success) {
                setReplies((prev) => removeReply(prev, replyId));
                // The whole sub-thread is gone — resync counts / accepted answer from the server.
                if (postId) void refreshPost(postId);
            }
            return res;
        },
        [refreshPost],
    );

    /* --------------------------- admin: reports --------------------------- */

    const getReports = useCallback(async (params: ReportsParams = {}, options: ListOptions = {}): Res<CommunityPage<CommunityReport>> => {
        setLoadingAdmin(true);
        try {
            const res = await request<CommunityPage<CommunityReport>>({ path: `${ADMIN}/reports`, params: cleanParams(params) }, "Failed to fetch reports");
            if (res.success && res.data) {
                const page = res.data;
                setReports((prev) => mergePage(prev, page.items, options.append));
                setReportsMeta(toMeta(page));
            }
            return res;
        } finally {
            setLoadingAdmin(false);
        }
    }, []);

    /** The API closes every open report on the same target — mirror that locally. */
    const closeReportsLocally = useCallback((reportId: string, result: CommunityReportResolution) => {
        const report = latest.current.reports.find((r) => r.id === reportId);
        const sameTarget = (r: CommunityReport) =>
            r.id === reportId ||
            (!!report &&
                r.status === "open" &&
                r.targetType === report.targetType &&
                (report.targetType === "reply"
                    ? r.reply?.id === report.reply?.id
                    : report.targetType === "post"
                      ? r.post?.id === report.post?.id
                      : r.reportedMember?.id === report.reportedMember?.id));
        const resolvedAt = new Date().toISOString();
        setReports((prev) => prev.map((r) => (sameTarget(r) ? { ...r, status: result.status, actionTaken: result.action, resolvedAt } : r)));
        return report;
    }, []);

    const resolveReport = useCallback(
        async (reportId: string, input: ResolveReportInput): Res<CommunityReportResolution> => {
            const res = await request<CommunityReportResolution>({ path: `${ADMIN}/reports/${enc(reportId)}/resolve`, method: "POST", body: input }, "Failed to resolve the report", "Report resolved");
            if (res.success && res.data) {
                const report = closeReportsLocally(reportId, res.data);
                if (report) {
                    if (input.action === "hidden" || input.action === "deleted") {
                        if (report.targetType === "reply" && report.reply) applyReplyStatus(report.reply.id, input.action, true);
                        else if (report.post) patchPost(report.post.id, { status: input.action });
                    }
                    const memberId = report.reportedMember?.id;
                    if (memberId && (input.action === "member_muted" || input.action === "member_banned")) {
                        const status: MemberStatus = input.action === "member_muted" ? "muted" : "banned";
                        setAdminMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, status, mutedUntil: status === "muted" ? (input.muteUntil ?? null) : null } : m)));
                    }
                }
                void refreshQueue();
            }
            return res;
        },
        [closeReportsLocally, applyReplyStatus, patchPost, refreshQueue],
    );

    const dismissReport = useCallback(
        async (reportId: string, note?: string): Res<CommunityReportResolution> => {
            const res = await request<CommunityReportResolution>({ path: `${ADMIN}/reports/${enc(reportId)}/dismiss`, method: "POST", body: { note } }, "Failed to dismiss the report", "Report dismissed");
            if (res.success && res.data) {
                closeReportsLocally(reportId, res.data);
                void refreshQueue();
            }
            return res;
        },
        [closeReportsLocally, refreshQueue],
    );

    /* --------------------------- admin: members --------------------------- */

    const getAdminMembers = useCallback(async (params: AdminMembersParams = {}, options: ListOptions = {}): Res<CommunityPage<CommunityAdminMember>> => {
        setLoadingAdmin(true);
        try {
            const res = await request<CommunityPage<CommunityAdminMember>>({ path: `${ADMIN}/members`, params: cleanParams(params) }, "Failed to fetch members");
            if (res.success && res.data) {
                const page = res.data;
                setAdminMembers((prev) => mergePage(prev, page.items, options.append));
                setAdminMembersMeta(toMeta(page));
            }
            return res;
        } finally {
            setLoadingAdmin(false);
        }
    }, []);

    const sanction = useCallback(
        async (memberId: string, path: string, method: HttpMethod, body: object | undefined, patch: Partial<CommunityAdminMember>, fallback: string, success: string) => {
            const res = await request<{ memberId: string; action: string }>({ path, method, body }, fallback, success);
            if (res.success) setAdminMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, ...patch } : m)));
            return res;
        },
        [],
    );

    const muteMember = useCallback(
        (memberId: string, input: MuteMemberInput = {}) =>
            sanction(
                memberId,
                `${ADMIN}/members/${enc(memberId)}/mute`,
                "POST",
                input,
                { status: "muted", mutedUntil: input.until ?? null, sanctionReason: input.reason ?? null },
                "Failed to mute the member",
                "Member muted",
            ),
        [sanction],
    );
    const unmuteMember = useCallback(
        (memberId: string) =>
            sanction(memberId, `${ADMIN}/members/${enc(memberId)}/mute`, "DELETE", undefined, { status: "active", mutedUntil: null, sanctionReason: null }, "Failed to unmute the member", "Member unmuted"),
        [sanction],
    );
    const banMember = useCallback(
        (memberId: string, reason: string) =>
            sanction(
                memberId,
                `${ADMIN}/members/${enc(memberId)}/ban`,
                "POST",
                { reason },
                { status: "banned", bannedAt: new Date().toISOString(), mutedUntil: null, sanctionReason: reason },
                "Failed to ban the member",
                "Member banned",
            ),
        [sanction],
    );
    const unbanMember = useCallback(
        (memberId: string) =>
            sanction(memberId, `${ADMIN}/members/${enc(memberId)}/ban`, "DELETE", undefined, { status: "active", bannedAt: null, sanctionReason: null }, "Failed to unban the member", "Member unbanned"),
        [sanction],
    );

    const getModerationLog = useCallback(async (params: ModerationLogParams = {}, options: ListOptions = {}): Res<CommunityPage<CommunityModerationLogEntry>> => {
        setLoadingAdmin(true);
        try {
            const res = await request<CommunityPage<CommunityModerationLogEntry>>({ path: `${ADMIN}/moderation-log`, params: cleanParams(params) }, "Failed to fetch the moderation log");
            if (res.success && res.data) {
                const page = res.data;
                setModerationLog((prev) => mergePage(prev, page.items, options.append));
                setModerationLogMeta(toMeta(page));
            }
            return res;
        } finally {
            setLoadingAdmin(false);
        }
    }, []);

    /* ---------------------------- admin: spaces ---------------------------- */

    const getAdminSpaces = useCallback(async (params: AdminSpacesParams = {}): Res<CommunityAdminSpace[]> => {
        setLoadingAdmin(true);
        try {
            const res = await request<CommunityAdminSpace[]>({ path: `${ADMIN}/spaces`, params: cleanParams(params) }, "Failed to fetch spaces");
            if (res.success && res.data) setAdminSpaces(res.data);
            return res;
        } finally {
            setLoadingAdmin(false);
        }
    }, []);

    /** Only one default space exists — mirror the API's swap locally. */
    const upsertAdminSpace = useCallback((space: CommunityAdminSpace) => {
        setAdminSpaces((prev) => {
            const rest = prev.map((s) => (space.isDefault && s.id !== space.id ? { ...s, isDefault: false } : s));
            return rest.some((s) => s.id === space.id) ? rest.map((s) => (s.id === space.id ? space : s)) : [...rest, space];
        });
    }, []);

    const createSpace = useCallback(
        async (input: CreateSpaceInput): Res<CommunityAdminSpace> => {
            const res = await request<CommunityAdminSpace>({ path: `${ADMIN}/spaces`, method: "POST", body: input }, "Failed to create the space", "Space created");
            if (res.success && res.data) upsertAdminSpace(res.data);
            return res;
        },
        [upsertAdminSpace],
    );

    const updateSpace = useCallback(
        async (spaceId: string, input: UpdateSpaceInput): Res<CommunityAdminSpace> => {
            const res = await request<CommunityAdminSpace>({ path: `${ADMIN}/spaces/${enc(spaceId)}`, method: "PATCH", body: input }, "Failed to update the space", "Space updated");
            if (res.success && res.data) upsertAdminSpace(res.data);
            return res;
        },
        [upsertAdminSpace],
    );

    const deleteSpace = useCallback(async (spaceId: string): Res<{ deleted: boolean }> => {
        const res = await request<{ deleted: boolean }>({ path: `${ADMIN}/spaces/${enc(spaceId)}`, method: "DELETE" }, "Failed to delete the space", "Space deleted");
        if (res.success) setAdminSpaces((prev) => prev.filter((s) => s.id !== spaceId));
        return res;
    }, []);

    const syncBatchSpaces = useCallback(async (): Res<{ created: number }> => {
        const res = await request<{ created: number }>({ path: `${ADMIN}/spaces/sync-batches`, method: "POST" }, "Failed to sync batch spaces");
        if (res.success && res.data) {
            res.message = res.data.created ? `${res.data.created} batch space${res.data.created === 1 ? "" : "s"} created` : "Every batch already has a space";
            if (res.data.created) void getAdminSpaces();
        }
        return res;
    }, [getAdminSpaces]);

    const moderatorsAction = useCallback(
        async (spaceId: string, path: string, method: HttpMethod, body: object | undefined, fallback: string, success: string | null): Res<CommunitySpaceModerator[]> => {
            const res = await request<CommunitySpaceModerator[]>({ path, method, body }, fallback, success);
            if (res.success && res.data) {
                const moderatorCount = res.data.length;
                setAdminSpaces((prev) => prev.map((s) => (s.id === spaceId ? { ...s, moderatorCount } : s)));
            }
            return res;
        },
        [],
    );

    const getSpaceModerators = useCallback(
        (spaceId: string) => moderatorsAction(spaceId, `${ADMIN}/spaces/${enc(spaceId)}/moderators`, "GET", undefined, "Failed to fetch moderators", null),
        [moderatorsAction],
    );
    const addSpaceModerator = useCallback(
        (spaceId: string, memberId: string) =>
            moderatorsAction(spaceId, `${ADMIN}/spaces/${enc(spaceId)}/moderators`, "POST", { memberId }, "Failed to add the moderator", "Moderator added"),
        [moderatorsAction],
    );
    const removeSpaceModerator = useCallback(
        (spaceId: string, memberId: string) =>
            moderatorsAction(spaceId, `${ADMIN}/spaces/${enc(spaceId)}/moderators/${enc(memberId)}`, "DELETE", undefined, "Failed to remove the moderator", "Moderator removed"),
        [moderatorsAction],
    );

    /* ----------------------- admin: categories & tags ----------------------- */

    const getAdminCategories = useCallback(async (): Res<CommunityCategory[]> => {
        const res = await request<CommunityCategory[]>({ path: `${ADMIN}/categories` }, "Failed to fetch categories");
        if (res.success && res.data) setAdminCategories(res.data);
        return res;
    }, []);

    const createCategory = useCallback(async (input: CategoryInput): Res<CommunityCategory> => {
        const res = await request<CommunityCategory>({ path: `${ADMIN}/categories`, method: "POST", body: input }, "Failed to create the category", "Category created");
        if (res.success && res.data) {
            const category = res.data;
            setAdminCategories((prev) => [...prev, { ...category, postCount: 0 }]);
        }
        return res;
    }, []);

    const updateCategory = useCallback(async (categoryId: string, input: Partial<CategoryInput>): Res<CommunityCategory> => {
        const res = await request<CommunityCategory>({ path: `${ADMIN}/categories/${enc(categoryId)}`, method: "PATCH", body: input }, "Failed to update the category", "Category updated");
        if (res.success && res.data) {
            const category = res.data;
            setAdminCategories((prev) => prev.map((c) => (c.categoryId === categoryId ? { ...category, postCount: c.postCount } : c)));
        }
        return res;
    }, []);

    const deleteCategory = useCallback(async (categoryId: string): Res<{ deleted: boolean; deactivated: boolean }> => {
        const res = await request<{ deleted: boolean; deactivated: boolean }>({ path: `${ADMIN}/categories/${enc(categoryId)}`, method: "DELETE" }, "Failed to remove the category");
        if (res.success && res.data) {
            res.message = res.data.deleted ? "Category deleted" : "Category has discussions — it was deactivated instead";
            setAdminCategories((prev) => (res.data!.deleted ? prev.filter((c) => c.categoryId !== categoryId) : prev.map((c) => (c.categoryId === categoryId ? { ...c, isActive: false } : c))));
        }
        return res;
    }, []);

    const reorderCategories = useCallback(async (categoryIds: string[]): Res<CommunityCategory[]> => {
        const res = await request<CommunityCategory[]>({ path: `${ADMIN}/categories/reorder`, method: "PUT", body: { categoryIds } }, "Failed to reorder categories", "Order saved");
        if (res.success && res.data) setAdminCategories(res.data);
        return res;
    }, []);

    const getAdminTags = useCallback(async (): Res<CommunityTag[]> => {
        const res = await request<CommunityTag[]>({ path: `${ADMIN}/tags` }, "Failed to fetch tags");
        if (res.success && res.data) setAdminTags(res.data);
        return res;
    }, []);

    const createTag = useCallback(async (input: TagInput): Res<CommunityTag> => {
        const res = await request<CommunityTag>({ path: `${ADMIN}/tags`, method: "POST", body: input }, "Failed to create the tag", "Tag created");
        if (res.success && res.data) {
            const tag = res.data;
            setAdminTags((prev) => [...prev, tag]);
        }
        return res;
    }, []);

    const updateTag = useCallback(async (tagId: string, input: Partial<TagInput>): Res<CommunityTag> => {
        const res = await request<CommunityTag>({ path: `${ADMIN}/tags/${enc(tagId)}`, method: "PATCH", body: input }, "Failed to update the tag", "Tag updated");
        if (res.success && res.data) {
            const tag = res.data;
            setAdminTags((prev) => prev.map((t) => (t.id === tagId ? tag : t)));
        }
        return res;
    }, []);

    const deleteTag = useCallback(async (tagId: string): Res<{ deleted: boolean; deactivated: boolean }> => {
        const res = await request<{ deleted: boolean; deactivated: boolean }>({ path: `${ADMIN}/tags/${enc(tagId)}`, method: "DELETE" }, "Failed to remove the tag");
        if (res.success && res.data) {
            res.message = res.data.deleted ? "Tag deleted" : "Tag is in use — it was deactivated instead";
            setAdminTags((prev) => (res.data!.deleted ? prev.filter((t) => t.id !== tagId) : prev.map((t) => (t.id === tagId ? { ...t, isActive: false } : t))));
        }
        return res;
    }, []);

    /* -------------------------- admin: analytics -------------------------- */

    const getAnalytics = useCallback(async (days = 30): Res<CommunityAnalytics> => {
        setLoadingAdmin(true);
        try {
            const res = await request<CommunityAnalytics>({ path: `${ADMIN}/analytics`, params: { days } }, "Failed to fetch analytics");
            if (res.success && res.data) {
                setAnalytics(res.data);
                setQueue(res.data.queue);
            }
            return res;
        } finally {
            setLoadingAdmin(false);
        }
    }, []);

    /* ------------------------------- value ------------------------------- */

    const value = useMemo<CommunityApiContextValue>(
        () => ({
            me,
            spaces,
            categories,
            tags,
            counts,
            onlineCount,
            config,
            initialized,
            loadingBootstrap,
            feed,
            feedMeta,
            loadingFeed,
            activePost,
            loadingPost,
            replies,
            repliesMeta,
            repliesPostId,
            loadingReplies,
            notifications,
            notificationsMeta,
            unreadNotifications,
            loadingNotifications,
            queue,
            moderationPosts,
            moderationPostsMeta,
            reports,
            reportsMeta,
            adminMembers,
            adminMembersMeta,
            moderationLog,
            moderationLogMeta,
            adminSpaces,
            adminCategories,
            adminTags,
            analytics,
            loadingAdmin,
            getBootstrap,
            getSpaces,
            getCategories,
            getTags,
            getFeedCounts,
            getFeed,
            getPost,
            createPost,
            updatePost,
            deletePost,
            registerView,
            reactToPost,
            removePostReaction,
            togglePostLike,
            getPostReactions,
            setPostSaved,
            setPostSubscription,
            acceptAnswer,
            getPostRevisions,
            votePoll,
            retractVote,
            getPollVoters,
            getReplies,
            loadReplyChildren,
            getReplyThread,
            createReply,
            updateReply,
            deleteReply,
            reactToReply,
            removeReplyReaction,
            toggleReplyLike,
            getReplyRevisions,
            uploadAttachment,
            deletePendingAttachment,
            reportContent,
            getMe,
            updateMe,
            searchMembers,
            getLeaderboard,
            getMemberProfile,
            getNotifications,
            getUnreadCount,
            markNotificationsRead,
            getQueueSummary,
            getModerationPosts,
            pinPost,
            unpinPost,
            lockPost,
            unlockPost,
            hidePost,
            restorePost,
            approvePost,
            rejectPost,
            movePost,
            moderatorDeletePost,
            purgePost,
            hideReply,
            restoreReply,
            moderatorDeleteReply,
            purgeReply,
            getReports,
            resolveReport,
            dismissReport,
            getAdminMembers,
            muteMember,
            unmuteMember,
            banMember,
            unbanMember,
            getModerationLog,
            getAdminSpaces,
            createSpace,
            updateSpace,
            deleteSpace,
            syncBatchSpaces,
            getSpaceModerators,
            addSpaceModerator,
            removeSpaceModerator,
            getAdminCategories,
            createCategory,
            updateCategory,
            deleteCategory,
            reorderCategories,
            getAdminTags,
            createTag,
            updateTag,
            deleteTag,
            getAnalytics,
        }),
        [
            me,
            spaces,
            categories,
            tags,
            counts,
            onlineCount,
            config,
            initialized,
            loadingBootstrap,
            feed,
            feedMeta,
            loadingFeed,
            activePost,
            loadingPost,
            replies,
            repliesMeta,
            repliesPostId,
            loadingReplies,
            notifications,
            notificationsMeta,
            unreadNotifications,
            loadingNotifications,
            queue,
            moderationPosts,
            moderationPostsMeta,
            reports,
            reportsMeta,
            adminMembers,
            adminMembersMeta,
            moderationLog,
            moderationLogMeta,
            adminSpaces,
            adminCategories,
            adminTags,
            analytics,
            loadingAdmin,
            getBootstrap,
            getSpaces,
            getCategories,
            getTags,
            getFeedCounts,
            getFeed,
            getPost,
            createPost,
            updatePost,
            deletePost,
            registerView,
            reactToPost,
            removePostReaction,
            togglePostLike,
            getPostReactions,
            setPostSaved,
            setPostSubscription,
            acceptAnswer,
            getPostRevisions,
            votePoll,
            retractVote,
            getPollVoters,
            getReplies,
            loadReplyChildren,
            getReplyThread,
            createReply,
            updateReply,
            deleteReply,
            reactToReply,
            removeReplyReaction,
            toggleReplyLike,
            getReplyRevisions,
            uploadAttachment,
            deletePendingAttachment,
            reportContent,
            getMe,
            updateMe,
            searchMembers,
            getLeaderboard,
            getMemberProfile,
            getNotifications,
            getUnreadCount,
            markNotificationsRead,
            getQueueSummary,
            getModerationPosts,
            pinPost,
            unpinPost,
            lockPost,
            unlockPost,
            hidePost,
            restorePost,
            approvePost,
            rejectPost,
            movePost,
            moderatorDeletePost,
            purgePost,
            hideReply,
            restoreReply,
            moderatorDeleteReply,
            purgeReply,
            getReports,
            resolveReport,
            dismissReport,
            getAdminMembers,
            muteMember,
            unmuteMember,
            banMember,
            unbanMember,
            getModerationLog,
            getAdminSpaces,
            createSpace,
            updateSpace,
            deleteSpace,
            syncBatchSpaces,
            getSpaceModerators,
            addSpaceModerator,
            removeSpaceModerator,
            getAdminCategories,
            createCategory,
            updateCategory,
            deleteCategory,
            reorderCategories,
            getAdminTags,
            createTag,
            updateTag,
            deleteTag,
            getAnalytics,
        ],
    );

    return <CommunityApiContext.Provider value={value}>{children}</CommunityApiContext.Provider>;
}

export function useCommunityApi() {
    const ctx = useContext(CommunityApiContext);
    if (!ctx) throw new Error("useCommunityApi must be used inside <CommunityApiProvider>");
    return ctx;
}
