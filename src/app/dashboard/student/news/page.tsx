"use client";

import React, { useState } from "react";
import StudentLayout from "@/layouts/StudentLayout";
import StudentHeader from "@/layouts/StudentHeader";
import { Box, Typography, Button } from "@mui/material";
import {
    MdSearch,
    MdCampaign,
    MdArticle,
    MdNewspaper,
    MdChevronRight,
    MdArrowForward,
    MdTrendingUp,
    MdAccessTime,
    MdPerson,
    MdCalendarToday,
} from "react-icons/md";

// ── Types ──────────────────────────────────────────────────────────────────
type ContentType = "news" | "blog" | "announcement";
type Tab = "all" | ContentType;

interface Article {
    id: number;
    type: ContentType;
    title: string;
    excerpt: string;
    author: string;
    readTime: string;
    date: string;
    image: string;
    isTrending?: boolean;
    isFeatured?: boolean;
}

// ── Mock Data ──────────────────────────────────────────────────────────────
const ARTICLES: Article[] = [
    // News
    {
        id: 1, type: "news",
        title: "CCN Launches New Cybersecurity Certification Track for 2026",
        excerpt: "Connecting Cyber Networks announces a brand-new industry-recognized certification track starting this August.",
        author: "CCN Team", readTime: "5 min read", date: "Jul 28, 2026",
        image: "https://picsum.photos/seed/ccnnews1/600/340", isTrending: true,
    },
    {
        id: 2, type: "news",
        title: "Placement Drive: 12 Companies Visiting This Month",
        excerpt: "Top-tier cybersecurity firms are visiting campus for direct recruitment this July. Register before Aug 1.",
        author: "Placement Cell", readTime: "3 min read", date: "Jul 26, 2026",
        image: "https://picsum.photos/seed/ccnnews2/600/340",
    },
    {
        id: 3, type: "news",
        title: "New Batch Starting August 15 — Limited Seats Available",
        excerpt: "Enroll now for the CCNA batch starting mid-August. Only 20 seats remaining out of 60.",
        author: "Admissions", readTime: "2 min read", date: "Jul 25, 2026",
        image: "https://picsum.photos/seed/ccnnews3/600/340",
    },
    {
        id: 4, type: "news",
        title: "CCN Partners with Global Cybersecurity Association",
        excerpt: "Strategic partnership to provide students with international exposure and globally recognized certifications.",
        author: "CCN Team", readTime: "4 min read", date: "Jul 22, 2026",
        image: "https://picsum.photos/seed/ccnnews4/600/340",
    },
    // Blogs
    {
        id: 5, type: "blog",
        title: "Why 80% Practical Learning Beats 100% Theory",
        excerpt: "Hands-on experience in cybersecurity is irreplaceable. Here's why a practice-first approach produces better professionals.",
        author: "Rachit Kumar Saxena", readTime: "15 min read", date: "Jul 29, 2026",
        image: "https://picsum.photos/seed/ccnblog1/600/340", isFeatured: true, isTrending: true,
    },
    {
        id: 6, type: "blog",
        title: "How to Start a Career in Cyber Security After College",
        excerpt: "A comprehensive guide covering certifications, skill sets, resume tips, and job search strategies for fresh graduates.",
        author: "Learning at CCN", readTime: "12 min read", date: "Jul 28, 2026",
        image: "https://picsum.photos/seed/ccnblog2/600/340",
    },
    {
        id: 7, type: "blog",
        title: "Top 10 Tools Every Ethical Hacker Should Master",
        excerpt: "From Kali Linux to Burp Suite — the essential toolkit for penetration testing professionals in 2026.",
        author: "Cyber Expert", readTime: "10 min read", date: "Jul 25, 2026",
        image: "https://picsum.photos/seed/ccnblog3/600/340",
    },
    {
        id: 8, type: "blog",
        title: "Zero Trust Architecture: A Beginner's Complete Guide",
        excerpt: "Understanding the zero-trust model and why every modern organization is adopting it as the security standard.",
        author: "Learning at CCN", readTime: "8 min read", date: "Jul 20, 2026",
        image: "https://picsum.photos/seed/ccnblog4/600/340",
    },
    {
        id: 9, type: "blog",
        title: "From Student to Security Analyst: My CCN Journey",
        excerpt: "A CCN alumnus shares their experience breaking into the cybersecurity industry within 6 months of graduation.",
        author: "Alumni Spotlight", readTime: "7 min read", date: "Jul 18, 2026",
        image: "https://picsum.photos/seed/ccnblog5/600/340",
    },
    // Announcements
    {
        id: 10, type: "announcement",
        title: "Holiday Notice: Office Closed on August 15",
        excerpt: "Our offices and virtual support will be unavailable on Independence Day. All classes resume on August 16.",
        author: "Admin", readTime: "1 min read", date: "Jul 29, 2026",
        image: "https://picsum.photos/seed/ccnann1/600/340",
    },
    {
        id: 11, type: "announcement",
        title: "Upcoming Webinar: Cloud Security Fundamentals — Register Now",
        excerpt: "Join our free webinar on cloud security essentials happening August 5. Limited spots available.",
        author: "Events Team", readTime: "2 min read", date: "Jul 27, 2026",
        image: "https://picsum.photos/seed/ccnann2/600/340", isTrending: true,
    },
    {
        id: 12, type: "announcement",
        title: "Portal Maintenance: System Down Aug 3, 2–4 AM",
        excerpt: "Scheduled maintenance window. Please plan your submissions and downloads accordingly before the downtime.",
        author: "IT Support", readTime: "1 min read", date: "Jul 26, 2026",
        image: "https://picsum.photos/seed/ccnann3/600/340",
    },
    {
        id: 13, type: "announcement",
        title: "Feedback Forms Now Open for Batch #2025-C",
        excerpt: "All students enrolled in Batch 2025-C, please fill in your end-of-batch feedback form by August 1.",
        author: "Quality Team", readTime: "1 min read", date: "Jul 24, 2026",
        image: "https://picsum.photos/seed/ccnann4/600/340",
    },
];

const FEATURED = ARTICLES.find((a) => a.isFeatured) ?? ARTICLES[0];

// ── Config ─────────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<ContentType, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    news: { label: "News", color: "#60a5fa", bg: "rgba(96,165,250,0.12)", icon: MdNewspaper },
    blog: { label: "Blog", color: "#a78bfa", bg: "rgba(167,139,250,0.12)", icon: MdArticle },
    announcement: { label: "Announcement", color: "#34d399", bg: "rgba(52,211,153,0.12)", icon: MdCampaign },
};

const TABS: { label: string; value: Tab; count?: number }[] = [
    { label: "All", value: "all" },
    { label: "News", value: "news", count: ARTICLES.filter((a) => a.type === "news").length },
    { label: "Blogs", value: "blog", count: ARTICLES.filter((a) => a.type === "blog").length },
    { label: "Announcements", value: "announcement", count: ARTICLES.filter((a) => a.type === "announcement").length },
];

// ── ArticleCard ────────────────────────────────────────────────────────────
function ArticleCard({ article }: { article: Article }) {
    const cfg = TYPE_CONFIG[article.type];
    const Icon = cfg.icon;
    return (
        <Box
            sx={{
                bgcolor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "14px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                    borderColor: "rgba(255,255,255,0.18)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 28px rgba(0,0,0,0.35)",
                },
            }}
        >
            {/* Thumbnail */}
            <Box sx={{ position: "relative", height: 130, overflow: "hidden", flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={article.image}
                    alt={article.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.65))" }} />
                {/* Badges */}
                <Box sx={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 0.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, bgcolor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", border: `1px solid ${cfg.color}40`, borderRadius: "6px", px: 0.8, py: 0.3 }}>
                        <Icon size={10} color={cfg.color} />
                        <Typography sx={{ fontSize: "0.58rem", fontWeight: 700, color: cfg.color, letterSpacing: "0.03em" }}>{cfg.label}</Typography>
                    </Box>
                    {article.isTrending && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, bgcolor: "rgba(239,68,68,0.8)", backdropFilter: "blur(6px)", borderRadius: "6px", px: 0.8, py: 0.3 }}>
                            <MdTrendingUp size={10} color="#fff" />
                            <Typography sx={{ fontSize: "0.58rem", fontWeight: 700, color: "#fff" }}>Trending</Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Body */}
            <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 0.75, flex: 1 }}>
                <Typography sx={{
                    fontSize: "0.78rem", fontWeight: 700, color: "#fff", lineHeight: 1.35,
                    letterSpacing: "-0.01em",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                    {article.title}
                </Typography>
                <Typography sx={{
                    fontSize: "0.68rem", color: "rgba(255,255,255,0.42)", lineHeight: 1.55,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                    {article.excerpt}
                </Typography>

                {/* Footer */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto", pt: 0.5, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                            <MdPerson size={10} color="rgba(255,255,255,0.3)" />
                            <Typography sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.38)" }}>{article.author}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                            <MdAccessTime size={10} color="rgba(255,255,255,0.3)" />
                            <Typography sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.38)" }}>{article.readTime}</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, color: "#818cf8", "&:hover": { color: "#a5b4fc" }, transition: "color 0.15s" }}>
                        <Typography sx={{ fontSize: "0.62rem", fontWeight: 600 }}>Read</Typography>
                        <MdArrowForward size={11} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

// ── SectionBlock ───────────────────────────────────────────────────────────
function SectionBlock({ type, articles }: { type: ContentType; articles: Article[] }) {
    const cfg = TYPE_CONFIG[type];
    const Icon = cfg.icon;
    return (
        <Box sx={{ mb: 1 }}>
            {/* Section header */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box sx={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 26, height: 26, borderRadius: "8px",
                        bgcolor: cfg.bg, border: `1px solid ${cfg.color}30`,
                    }}>
                        <Icon size={13} color={cfg.color} />
                    </Box>
                    <Typography sx={{ fontSize: "0.825rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>
                        {cfg.label}
                    </Typography>
                    <Box sx={{ bgcolor: "rgba(255,255,255,0.07)", borderRadius: "99px", px: 0.75, py: 0.1 }}>
                        <Typography sx={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.38)", fontWeight: 600 }}>
                            {articles.length}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, color: "rgba(255,255,255,0.32)", cursor: "pointer", "&:hover": { color: "rgba(255,255,255,0.8)" }, transition: "color 0.15s" }}>
                    <Typography sx={{ fontSize: "0.68rem", fontWeight: 500 }}>View all</Typography>
                    <MdChevronRight size={13} />
                </Box>
            </Box>

            {/* Grid */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 1.5 }}>
                {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </Box>
        </Box>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function NewsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("all");
    const [search, setSearch] = useState("");

    const getArticles = (type: ContentType) =>
        ARTICLES.filter(
            (a) =>
                a.type === type &&
                (!search ||
                    a.title.toLowerCase().includes(search.toLowerCase()) ||
                    a.author.toLowerCase().includes(search.toLowerCase()) ||
                    a.excerpt.toLowerCase().includes(search.toLowerCase()))
        );

    const visibleSections: ContentType[] =
        activeTab === "all" ? ["news", "blog", "announcement"] : [activeTab as ContentType];

    const hasResults = visibleSections.some((t) => getArticles(t).length > 0);

    return (
        <StudentLayout header={<StudentHeader title="News & Updates" />}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pb: 3 }}>

                {/* ── Hero Featured Article ── */}
                <Box sx={{
                    position: "relative",
                    borderRadius: "16px",
                    overflow: "hidden",
                    height: { xs: 170, md: 200 },
                    flexShrink: 0,
                    border: "1px solid rgba(255,255,255,0.08)",
                }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={FEATURED.image}
                        alt={FEATURED.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(0,0,0,0.88) 30%, rgba(0,0,0,0.25) 100%)" }} />

                    {/* Content */}
                    <Box sx={{ position: "absolute", inset: 0, p: { xs: 2, md: 2.5 }, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                        {/* Badges */}
                        <Box sx={{ display: "flex", gap: 0.5, mb: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, bgcolor: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)", border: "1px solid rgba(167,139,250,0.4)", borderRadius: "6px", px: 0.9, py: 0.3 }}>
                                <MdArticle size={10} color="#a78bfa" />
                                <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#e9d5ff" }}>Blog</Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, bgcolor: "rgba(239,68,68,0.75)", backdropFilter: "blur(6px)", borderRadius: "6px", px: 0.9, py: 0.3 }}>
                                <MdTrendingUp size={10} color="#fff" />
                                <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#fff" }}>Trending</Typography>
                            </Box>
                        </Box>

                        <Typography sx={{
                            fontSize: { xs: "0.95rem", md: "1.15rem" },
                            fontWeight: 800, color: "#fff", lineHeight: 1.25,
                            letterSpacing: "-0.02em", maxWidth: 420, mb: 0.75,
                        }}>
                            {FEATURED.title}
                        </Typography>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.35 }}>
                                <MdPerson size={11} color="rgba(255,255,255,0.5)" />
                                <Typography sx={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.55)" }}>
                                    by {FEATURED.author}
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.25)" }}>·</Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.35 }}>
                                <MdAccessTime size={11} color="rgba(255,255,255,0.5)" />
                                <Typography sx={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.55)" }}>
                                    {FEATURED.readTime}
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.25)" }}>·</Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.35 }}>
                                <MdCalendarToday size={10} color="rgba(255,255,255,0.5)" />
                                <Typography sx={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.55)" }}>
                                    {FEATURED.date}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Read button */}
                    <Box sx={{ position: "absolute", bottom: 16, right: 16 }}>
                        <Box sx={{
                            display: "flex", alignItems: "center", gap: 0.5,
                            bgcolor: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)",
                            border: "1px solid rgba(255,255,255,0.2)", borderRadius: "99px",
                            px: 1.25, py: 0.5, cursor: "pointer",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.2)" }, transition: "background 0.18s",
                        }}>
                            <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, color: "#fff" }}>Read Article</Typography>
                            <MdArrowForward size={12} color="#fff" />
                        </Box>
                    </Box>
                </Box>

                {/* ── Stats bar ── */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                    {(["news", "blog", "announcement"] as ContentType[]).map((type) => {
                        const cfg = TYPE_CONFIG[type];
                        const Icon = cfg.icon;
                        const count = ARTICLES.filter((a) => a.type === type).length;
                        return (
                            <Box key={type} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <Icon size={11} color={cfg.color} />
                                <Typography sx={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.45)" }}>
                                    <Box component="span" sx={{ color: "#fff", fontWeight: 700 }}>{count}</Box> {cfg.label}s
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>

                {/* ── Search + Tabs ── */}
                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, gap: 1.25 }}>
                    {/* Search input */}
                    <Box sx={{
                        display: "flex", alignItems: "center", gap: 0.75,
                        bgcolor: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px", px: 1.25, py: 0.75,
                        flex: { sm: "none" }, width: { xs: "100%", sm: 300 },
                        "&:focus-within": { borderColor: "rgba(99,102,241,0.5)" },
                        transition: "border-color 0.18s",
                    }}>
                        <MdSearch size={15} color="rgba(255,255,255,0.35)" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search news, blogs or announcements..."
                            style={{
                                background: "transparent", border: "none", outline: "none",
                                color: "#fff", fontSize: "0.72rem", width: "100%",
                            }}
                        />
                    </Box>

                    {/* Tab pills */}
                    <Box sx={{
                        display: "flex", gap: 0.5,
                        bgcolor: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "10px", p: "3px",
                    }}>
                        {TABS.map((tab) => {
                            const active = activeTab === tab.value;
                            return (
                                <Button
                                    key={tab.value}
                                    onClick={() => setActiveTab(tab.value)}
                                    disableRipple
                                    sx={{
                                        borderRadius: "7px", px: 1.25, py: 0.4,
                                        fontSize: "0.7rem", fontWeight: active ? 700 : 500,
                                        textTransform: "none",
                                        bgcolor: active ? "rgba(255,255,255,0.11)" : "transparent",
                                        color: active ? "#fff" : "rgba(255,255,255,0.4)",
                                        minWidth: 0, lineHeight: 1.4,
                                        "&:hover": { bgcolor: active ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)", color: "#fff" },
                                        transition: "all 0.15s",
                                    }}
                                >
                                    {tab.label}
                                    {tab.count !== undefined && (
                                        <Box
                                            component="span"
                                            sx={{
                                                ml: 0.5, fontSize: "0.58rem",
                                                bgcolor: active ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.07)",
                                                borderRadius: "99px", px: 0.7, py: 0.1,
                                            }}
                                        >
                                            {tab.count}
                                        </Box>
                                    )}
                                </Button>
                            );
                        })}
                    </Box>
                </Box>

                {/* ── Content Sections ── */}
                {hasResults ? (
                    visibleSections.map((type) => {
                        const arts = getArticles(type);
                        if (arts.length === 0) return null;
                        return <SectionBlock key={type} type={type} articles={arts} />;
                    })
                ) : (
                    <Box sx={{ textAlign: "center", py: 8, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        <MdSearch size={32} color="rgba(255,255,255,0.15)" />
                        <Typography sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.28)", fontWeight: 500 }}>
                            No results found for &ldquo;{search}&rdquo;
                        </Typography>
                        <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.18)" }}>
                            Try searching with different keywords
                        </Typography>
                    </Box>
                )}
            </Box>
        </StudentLayout>
    );
}
