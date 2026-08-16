"use client";

import React, { useState } from "react";
import StudentLayout from "@/layouts/StudentLayout";
import StudentHeader from "@/layouts/StudentHeader";
import {
    Box,
    Typography,
    Avatar,
    Chip,
    IconButton,
    Divider,
    Menu,
    MenuItem,
} from "@mui/material";
import {
    MdOutlineApps,
    MdOutlineLayersClear,
    MdOutlineChat,

    MdOutlineAssignment,
    MdOutlineQuiz,
    MdOutlineSchool,
    MdOutlineForum,
    MdOutlineMenuBook,
    MdOutlinePushPin,
    MdOutlinePerson,
    MdOutlineBookmark,
    MdAdd,
    MdArrowDropDown,
    MdFavorite,
    MdFavoriteBorder,
    MdChatBubbleOutline,
    MdOutlineVisibility,
    MdArrowForward,
    MdPushPin,
    MdOutlineLabel,
    MdSort,
    MdOutlineLayers,
    MdOutlineBiotech,
    MdOutlineScience,
    MdKeyboardArrowDown,
} from "react-icons/md";

// ── Types ──────────────────────────────────────────────────────────────────
type CategoryKey =
    | "all"
    | "batch-updates"
    | "lecture-discussions"
    | "lab-discussions"
    | "assignment-help"
    | "quiz-discussions"
    | "exam-preparation"
    | "general-discussion"
    | "resources-notes"
    | "pinned-posts"
    | "my-discussions"
    | "saved-posts";

type PostType = "pinned" | "regular" | "poll";

interface PollOption {
    id: number;
    text: string;
    votes?: number;
}

interface Post {
    id: number;
    type: PostType;
    category: string;
    categoryColor: string;
    badge?: string;
    badgeColor?: string;
    badgeBg?: string;
    author: string;
    authorRole: string;
    avatarSeed: string;
    date: string;
    title: string;
    excerpt?: string;
    pollQuestion?: string;
    pollOptions?: PollOption[];
    likes: number;
    comments: number;
    views: number;
    isPinned?: boolean;
    pinnedBy?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────
const CAT_COLOR: Record<string, string> = {
    "Batch Updates": "#60a5fa",
    "Lecture Discussions": "#a78bfa",
    "Lab Discussions": "#34d399",
    "Assignment Help": "#f97316",
    "Quiz Discussions": "#fbbf24",
    "Exam Preparation": "#f43f5e",
    "General Discussion": "#22d3ee",
    "Resources & Notes": "#86efac",
};

const CATEGORIES: { key: CategoryKey; label: string; count: number; icon: React.ElementType }[] = [
    { key: "all", label: "All Discussions", count: 143, icon: MdOutlineApps },
    { key: "batch-updates", label: "Batch Updates", count: 12, icon: MdOutlineLayers },
    { key: "lecture-discussions", label: "Lecture Discussions", count: 3, icon: MdOutlineChat },
    { key: "lab-discussions", label: "Lab Discussions", count: 32, icon: MdOutlineScience },
    { key: "assignment-help", label: "Assignment Help", count: 86, icon: MdOutlineAssignment },
    { key: "quiz-discussions", label: "Quiz Discussions", count: 12, icon: MdOutlineQuiz },
    { key: "exam-preparation", label: "Exam Preparation", count: 9, icon: MdOutlineSchool },
    { key: "general-discussion", label: "General Discussion", count: 9, icon: MdOutlineForum },
    { key: "resources-notes", label: "Resources & Notes", count: 71, icon: MdOutlineMenuBook },
    { key: "pinned-posts", label: "Pinned Posts", count: 9, icon: MdOutlinePushPin },
    { key: "my-discussions", label: "My Discussions", count: 12, icon: MdOutlinePerson },
    { key: "saved-posts", label: "Saved Posts", count: 34, icon: MdOutlineBookmark },
];

const MOCK_POSTS: Post[] = [
    {
        id: 1,
        type: "pinned",
        category: "General Discussion",
        categoryColor: "#22d3ee",
        author: "Kushal Korde",
        authorRole: "Senior Security Manager - Trainer",
        avatarSeed: "kushal",
        date: "12/05/26",
        title: "Welcome and Forum Guidelines",
        excerpt:
            "Hi there and welcome to our brand new support forum. This is a place for you to connect with each other, ask and answer each other's questions, share feedback, and more!",
        likes: 0,
        comments: 0,
        views: 0,
        isPinned: true,
        pinnedBy: "Trainer",
    },
    {
        id: 2,
        type: "regular",
        category: "Batch Updates",
        categoryColor: "#60a5fa",
        badge: "Important",
        badgeColor: "#fff",
        badgeBg: "#ef4444",
        author: "Kushal Korde",
        authorRole: "Senior Security Manager - Trainer",
        avatarSeed: "kushal",
        date: "8 min ago",
        title: "Assignment 3 Deadline Extended – New Due Date: Friday 6 PM",
        excerpt:
            "Due to the lab environment issues we faced during Wednesday's session, the deadline for Assignment 3 (Network Scanning & Enumeration) has been extended to Friday, 6:00 PM. Due to the lab environment issues we faced during Wednesday's session, the deadline for Assignment 3 (Network Scanning & Enumerat...",
        likes: 24,
        comments: 6,
        views: 32,
    },
    {
        id: 3,
        type: "poll",
        category: "Lecture Discussions",
        categoryColor: "#a78bfa",
        badge: "General Question",
        badgeColor: "#fff",
        badgeBg: "#0891b2",
        author: "Kushal Korde",
        authorRole: "Senior Security Manager - Trainer",
        avatarSeed: "kushal",
        date: "2 hours ago",
        title: "Which topic should we cover in tomorrow's extra session?",
        pollQuestion: "Vote for the topic you need most before tomorrow's 2 PM session. Results will guide the agenda.",
        pollOptions: [
            { id: 1, text: "Firewall Rules & ACLs" },
            { id: 2, text: "OSPF Neighbor State" },
            { id: 3, text: "VPN Tunnelling (IPsec)" },
            { id: 4, text: "Wireshark Deep Dive" },
        ],
        likes: 24,
        comments: 6,
        views: 32,
    },
    {
        id: 4,
        type: "regular",
        category: "Lab Discussions",
        categoryColor: "#34d399",
        badge: "Help Needed",
        badgeColor: "#fff",
        badgeBg: "#d97706",
        author: "Priya Sharma",
        authorRole: "Student",
        avatarSeed: "priya",
        date: "5 hours ago",
        title: "GNS3 topology not saving after restart – anyone else facing this?",
        excerpt:
            "My GNS3 project file keeps losing the saved topology whenever I restart the VM. I've already tried re-importing but the issue persists. Any fixes?",
        likes: 11,
        comments: 14,
        views: 58,
    },
    {
        id: 5,
        type: "regular",
        category: "Assignment Help",
        categoryColor: "#f97316",
        badge: "Discussion",
        badgeColor: "#fff",
        badgeBg: "#7c3aed",
        author: "Ravi Patel",
        authorRole: "Student",
        avatarSeed: "ravi",
        date: "Yesterday",
        title: "Assignment 2 – Part B: Subnetting Answers Discussion",
        excerpt:
            "Let's compare our answers for Assignment 2 Part B. I got /26 for the third subnet but not sure if it's right. Post your work below!",
        likes: 18,
        comments: 22,
        views: 97,
    },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const AVATAR_URL = (seed: string) =>
    `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=0369a1,7c3aed,0891b2,d97706,be123c&backgroundType=gradientLinear&fontSize=38`;

// ── Sub-components ─────────────────────────────────────────────────────────
function CategoryPill({ label, color }: { label: string; color: string }) {
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 0.9,
                py: 0.25,
                borderRadius: "5px",
                border: `1px solid ${color}44`,
                backgroundColor: `${color}18`,
                color,
                fontSize: "0.64rem",
                fontWeight: 600,
                lineHeight: 1,
                whiteSpace: "nowrap",
            }}
        >
            <Box
                sx={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    backgroundColor: color,
                    flexShrink: 0,
                }}
            />
            {label}
        </Box>
    );
}

function BadgePill({ label, color, bg }: { label: string; color: string; bg: string }) {
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                px: 0.9,
                py: 0.25,
                borderRadius: "5px",
                backgroundColor: bg,
                color,
                fontSize: "0.64rem",
                fontWeight: 700,
                lineHeight: 1,
                whiteSpace: "nowrap",
            }}
        >
            {label}
        </Box>
    );
}

function EngagementBar({ likes, comments, views, showAction = true }: { likes: number; comments: number; views: number; showAction?: boolean }) {
    const [liked, setLiked] = useState(false);
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mt: 1.5,
                pt: 1.2,
                borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {/* Likes */}
                <Box
                    sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer" }}
                    onClick={() => setLiked((p) => !p)}
                >
                    {liked ? (
                        <MdFavorite style={{ fontSize: "0.9rem", color: "#f43f5e" }} />
                    ) : (
                        <MdFavoriteBorder style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.45)" }} />
                    )}
                    <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", lineHeight: 1 }}>
                        {liked ? likes + 1 : likes}
                    </Typography>
                </Box>
                {/* Comments */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <MdChatBubbleOutline style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.45)" }} />
                    <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", lineHeight: 1 }}>
                        {comments}
                    </Typography>
                </Box>
                {/* Views */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <MdOutlineVisibility style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.45)" }} />
                    <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", lineHeight: 1 }}>
                        {views}
                    </Typography>
                </Box>
            </Box>
            {showAction && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.4,
                        cursor: "pointer",
                        color: "rgba(255,255,255,0.55)",
                        fontSize: "0.72rem",
                        fontWeight: 500,
                        transition: "color 0.15s",
                        "&:hover": { color: "#60a5fa" },
                    }}
                >
                    Open Thread
                    <MdArrowForward style={{ fontSize: "0.85rem" }} />
                </Box>
            )}
        </Box>
    );
}

function PostCard({ post }: { post: Post }) {
    if (post.type === "pinned") {
        return (
            <Box
                sx={{
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backgroundColor: "rgba(255,255,255,0.03)",
                    overflow: "hidden",
                }}
            >
                {/* Pin banner */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.6,
                        px: 1.5,
                        py: 0.6,
                        backgroundColor: "rgba(249,115,22,0.15)",
                        borderBottom: "1px solid rgba(249,115,22,0.2)",
                    }}
                >
                    <MdPushPin style={{ fontSize: "0.75rem", color: "#f97316" }} />
                    <Typography sx={{ fontSize: "0.65rem", color: "#f97316", fontWeight: 600 }}>
                        Pinned by {post.pinnedBy}
                    </Typography>
                    <Box sx={{ flex: 1 }} />
                    <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.35)" }}>{post.date}</Typography>
                </Box>
                {/* Body */}
                <Box sx={{ p: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <Avatar src={AVATAR_URL(post.avatarSeed)} sx={{ width: 26, height: 26, fontSize: "0.65rem" }} />
                        <Box>
                            <Typography sx={{ fontSize: "0.73rem", fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>
                                {post.author}
                            </Typography>
                            <Typography sx={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.4)" }}>
                                {post.authorRole}
                            </Typography>
                        </Box>
                    </Box>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#fff", mb: 0.6 }}>
                        {post.title}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: "0.71rem",
                            color: "rgba(255,255,255,0.5)",
                            lineHeight: 1.55,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        {post.excerpt}
                    </Typography>
                </Box>
            </Box>
        );
    }

    if (post.type === "poll") {
        return (
            <Box
                sx={{
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backgroundColor: "rgba(255,255,255,0.03)",
                    p: 1.5,
                }}
            >
                {/* Header row */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, mb: 1 }}>
                    <CategoryPill label={post.category} color={post.categoryColor} />
                    {post.badge && <BadgePill label={post.badge} color={post.badgeColor!} bg={post.badgeBg!} />}
                    <Box sx={{ flex: 1 }} />
                    <Typography sx={{ fontSize: "0.63rem", color: "rgba(255,255,255,0.35)" }}>{post.date}</Typography>
                </Box>
                {/* Author */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1 }}>
                    <Avatar src={AVATAR_URL(post.avatarSeed)} sx={{ width: 24, height: 24, fontSize: "0.6rem" }} />
                    <Box>
                        <Typography sx={{ fontSize: "0.71rem", fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>
                            {post.author}
                        </Typography>
                        <Typography sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.38)" }}>
                            {post.authorRole}
                        </Typography>
                    </Box>
                </Box>
                {/* Title & question */}
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#fff", mb: 0.4 }}>
                    {post.title}
                </Typography>
                <Typography sx={{ fontSize: "0.69rem", color: "rgba(255,255,255,0.45)", mb: 1 }}>
                    {post.pollQuestion}
                </Typography>
                {/* Poll options */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.7, mb: 0.5 }}>
                    {post.pollOptions?.map((opt) => (
                        <Box
                            key={opt.id}
                            sx={{
                                px: 1.2,
                                py: 0.7,
                                borderRadius: "7px",
                                border: "1px solid rgba(255,255,255,0.1)",
                                backgroundColor: "rgba(255,255,255,0.05)",
                                fontSize: "0.72rem",
                                color: "rgba(255,255,255,0.75)",
                                cursor: "pointer",
                                transition: "background 0.15s, border-color 0.15s",
                                "&:hover": {
                                    backgroundColor: "rgba(96,165,250,0.12)",
                                    borderColor: "rgba(96,165,250,0.35)",
                                    color: "#fff",
                                },
                            }}
                        >
                            {opt.text}
                        </Box>
                    ))}
                </Box>
                <EngagementBar likes={post.likes} comments={post.comments} views={post.views} />
            </Box>
        );
    }

    // Regular post
    return (
        <Box
            sx={{
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.08)",
                backgroundColor: "rgba(255,255,255,0.03)",
                p: 1.5,
            }}
        >
            {/* Header row */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, mb: 1 }}>
                <CategoryPill label={post.category} color={post.categoryColor} />
                {post.badge && <BadgePill label={post.badge} color={post.badgeColor!} bg={post.badgeBg!} />}
                <Box sx={{ flex: 1 }} />
                <Typography sx={{ fontSize: "0.63rem", color: "rgba(255,255,255,0.35)" }}>{post.date}</Typography>
            </Box>
            {/* Author */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1 }}>
                <Avatar src={AVATAR_URL(post.avatarSeed)} sx={{ width: 24, height: 24, fontSize: "0.6rem" }} />
                <Box>
                    <Typography sx={{ fontSize: "0.71rem", fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>
                        {post.author}
                    </Typography>
                    <Typography sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.38)" }}>
                        {post.authorRole}
                    </Typography>
                </Box>
            </Box>
            {/* Title */}
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#fff", mb: 0.5 }}>
                {post.title}
            </Typography>
            {/* Excerpt */}
            {post.excerpt && (
                <Typography
                    sx={{
                        fontSize: "0.69rem",
                        color: "rgba(255,255,255,0.45)",
                        lineHeight: 1.55,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        mb: 0.5,
                    }}
                >
                    {post.excerpt}
                </Typography>
            )}
            <EngagementBar likes={post.likes} comments={post.comments} views={post.views} />
        </Box>
    );
}

// ── Dropdown Button ────────────────────────────────────────────────────────
function DropdownBtn({ label, icon }: { label: string; icon?: React.ReactNode }) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    return (
        <>
            <Box
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 1.2,
                    py: 0.55,
                    borderRadius: "7px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "0.72rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "background 0.15s",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
                }}
            >
                {icon && <Box sx={{ display: "flex", alignItems: "center" }}>{icon}</Box>}
                {label}
                <MdKeyboardArrowDown style={{ fontSize: "0.9rem", opacity: 0.7 }} />
            </Box>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                slotProps={{
                    paper: {
                        sx: {
                            backgroundColor: "#1a2235",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "8px",
                            minWidth: 140,
                        },
                    },
                }}
            >
                <MenuItem sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.75)" }} onClick={() => setAnchorEl(null)}>
                    {label}
                </MenuItem>
            </Menu>
        </>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function CommunityPage() {
    const [activeCategory, setActiveCategory] = useState<CategoryKey>("batch-updates");

    const activeCatData = CATEGORIES.find((c) => c.key === activeCategory)!;

    return (
        <Box
            sx={{
                display: "flex",
                gap: 1.5,
                overflow: "hidden",
                padding: 1.5,
                height: "calc(100% - 1.5rem)",
            }}
        >
            {/* ── Forum Sidebar ─────────────────────────────────── */}
            <Box
                sx={{
                    width: 185,
                    minWidth: 185,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.07)",
                    backgroundColor: "rgba(255,255,255,0.02)",
                    overflow: "hidden",
                }}
            >
                {/* Menu label */}
                <Box sx={{ px: 1.5, pt: 1.2, pb: 0.6 }}>
                    <Typography
                        sx={{
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            color: "rgba(255,255,255,0.3)",
                            textTransform: "uppercase",
                        }}
                    >
                        Menu
                    </Typography>
                </Box>

                {/* Category list */}
                <Box sx={{ flex: 1, overflowY: "auto", pb: 1, "&::-webkit-scrollbar": { width: 3 }, "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 2 } }}>
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = activeCategory === cat.key;
                        return (
                            <Box
                                key={cat.key}
                                onClick={() => setActiveCategory(cat.key)}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    px: 1.5,
                                    py: 0.75,
                                    mx: 0.75,
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    backgroundColor: isActive ? "rgba(96,165,250,0.12)" : "transparent",
                                    transition: "background 0.15s",
                                    "&:hover": {
                                        backgroundColor: isActive
                                            ? "rgba(96,165,250,0.14)"
                                            : "rgba(255,255,255,0.04)",
                                    },
                                }}
                            >
                                <Icon
                                    style={{
                                        fontSize: "0.95rem",
                                        color: isActive ? "#60a5fa" : "rgba(255,255,255,0.4)",
                                        flexShrink: 0,
                                    }}
                                />
                                <Typography
                                    sx={{
                                        fontSize: "0.72rem",
                                        fontWeight: isActive ? 600 : 400,
                                        color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
                                        flex: 1,
                                        lineHeight: 1.2,
                                    }}
                                >
                                    {cat.label}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: "0.62rem",
                                        fontWeight: 600,
                                        color: isActive ? "#60a5fa" : "rgba(255,255,255,0.28)",
                                        minWidth: 18,
                                        textAlign: "right",
                                    }}
                                >
                                    {cat.count}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>

                {/* Divider */}
                <Divider sx={{ borderColor: "rgba(255,255,255,0.07)" }} />

                {/* New Discussion button */}
                <Box sx={{ p: 1.2 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.6,
                            py: 0.9,
                            borderRadius: "9px",
                            background: "linear-gradient(to right, #1d4ed8, #6d28d9)",
                            color: "#fff",
                            fontSize: "0.73rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "opacity 0.15s",
                            "&:hover": { opacity: 0.88 },
                        }}
                    >
                        <MdAdd style={{ fontSize: "1rem" }} />
                        New Discussion
                    </Box>
                </Box>
            </Box>

            {/* ── Main Content ──────────────────────────────────── */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
                {/* Filter bar */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1.5,
                        flexWrap: "wrap",
                    }}
                >
                    <DropdownBtn label={activeCatData.label} />
                    <DropdownBtn
                        label="tags"
                        icon={<MdOutlineLabel style={{ fontSize: "0.85rem", marginRight: 1 }} />}
                    />
                    <Typography
                        sx={{
                            fontSize: "0.69rem",
                            color: "rgba(255,255,255,0.38)",
                            flex: 1,
                            minWidth: 0,
                        }}
                    >
                        {activeCatData.count} latest topics in {activeCatData.label}
                    </Typography>
                    <DropdownBtn
                        label="Sort by"
                        icon={<MdSort style={{ fontSize: "0.9rem", marginRight: 1 }} />}
                    />
                </Box>

                {/* Posts list */}
                <Box
                    sx={{
                        flex: 1,
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.2,
                        pr: 0.5,
                        "&::-webkit-scrollbar": { width: 4 },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "rgba(255,255,255,0.1)",
                            borderRadius: 2,
                        },
                    }}
                >
                    {MOCK_POSTS.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
