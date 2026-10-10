"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, ButtonBase, InputBase, Typography } from "@mui/material";
import { gradientBorder } from "@/components/aish/tokens";
import { JOBS, PLACEMENT_ROUTES, PrepArticle, articleHref } from "./jobs-data";
import { APPLICATION_SORTS, ApplicationSort, JOB_SORTS, JobSort, sortApplications, sortJobs } from "./list-filters";
import { placementAsset } from "./placement-data";
import { usePlacement } from "./PlacementContext";
import { ApplicationCard } from "./Applications";
import { JobCard, QuickActionCard } from "./JobCards";
import { Asset, MetaDot, PL, PTEXT, SectionHeader, SeeAllLink, SortButton, cq } from "./placement-ui";

// ─── Hero ──────────────────────────────────────────────────────────────────
function HubHero() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const pill = {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        height: 54,
        px: "16px",
        borderRadius: "99px",
        border: `1px solid ${PL.pillBorder}`,
        backgroundImage: PL.pillBg,
    } as const;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "32px", pt: { xs: "8px", md: "32px" }, pb: "12px" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "center" }}>
                <Typography component="h1" sx={{ ...PTEXT.poppinsReg44, fontSize: { xs: "28px", sm: "36px", md: "44px" }, lineHeight: { xs: "40px", sm: "52px", md: "66px" }, color: PL.n75 }}>
                    Find Jobs That Match Your Skills
                </Typography>
                <Typography sx={{ ...PTEXT.med16, color: PL.n300 }}>Explore personalized job opportunities based on your skills and apply with confidence.</Typography>
            </Box>
            <Box
                component="form"
                role="search"
                onSubmit={(event: React.FormEvent) => {
                    event.preventDefault();
                    router.push(`${PLACEMENT_ROUTES.jobs}${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
                }}
                sx={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", maxWidth: 561 }}
            >
                <Box sx={{ ...pill, flex: 1, minWidth: 0, "&:focus-within": { borderColor: PL.primary200 } }}>
                    <Asset name="icon-search.svg" width={24} height={24} />
                    <InputBase
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search jobs, companies, skills..."
                        inputProps={{ "aria-label": "Search jobs" }}
                        sx={{ flex: 1, ...PTEXT.med16, color: PL.n75, "& input": { p: 0, textOverflow: "ellipsis" }, "& input::placeholder": { color: PL.n400, opacity: 1 } }}
                    />
                </Box>
                <ButtonBase LinkComponent={Link} href={`${PLACEMENT_ROUTES.jobs}?saved=Favourites`} sx={{ ...pill, flexShrink: 0, ...PTEXT.med16, color: PL.n75, "&:hover": { borderColor: PL.primary200 } }}>
                    <Asset name="icon-heart.svg" width={24} height={24} />
                    <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                        Favourites
                    </Box>
                </ButtonBase>
            </Box>
        </Box>
    );
}

// ─── Sections ──────────────────────────────────────────────────────────────
function RecommendedJobs() {
    const [sort, setSort] = useState<JobSort>("relevance");
    const jobs = useMemo(() => sortJobs(JOBS.filter((j) => j.recommendedFor), sort).slice(0, 3), [sort]);

    return (
        <Box
            component="section"
            sx={{
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                p: { xs: "16px", sm: "24px" },
                borderRadius: "24px",
                backgroundImage: PL.sectionBg,
                "&::before": gradientBorder(),
            }}
        >
            <Asset name="panel-glow.svg" width={1199.49} height={1199.49} sx={{ position: "absolute", left: -59, top: -782 }} />
            <SectionHeader title="Jobs recommended for you!">
                <SortButton value={sort} options={[...JOB_SORTS]} onChange={setSort} />
                <SeeAllLink href={PLACEMENT_ROUTES.recommended} />
            </SectionHeader>
            <Box
                sx={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "16px",
                    [cq(700)]: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
                    [cq(1050)]: { gridTemplateColumns: "repeat(3, minmax(0, 1fr))" },
                }}
            >
                {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                ))}
            </Box>
        </Box>
    );
}

function MyApplications() {
    const { applications } = usePlacement();
    const [sort, setSort] = useState<ApplicationSort>("newest");
    const visible = useMemo(() => sortApplications(applications, sort).slice(0, 2), [applications, sort]);
    if (!applications.length) return null;

    return (
        <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <SectionHeader title="My Applications">
                <SortButton value={sort} options={[...APPLICATION_SORTS]} onChange={setSort} />
                <SeeAllLink href={PLACEMENT_ROUTES.applications} />
            </SectionHeader>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {visible.map((application) => (
                    <ApplicationCard key={application.id} application={application} />
                ))}
            </Box>
        </Box>
    );
}

/** Placement Hub — landing page once the student is placement ready. */
export default function PlacementHub() {
    return (
        <Box sx={{ containerType: "inline-size", display: "flex", flexDirection: "column", gap: "32px", pb: "24px" }}>
            <HubHero />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px", [cq(760)]: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" } }}>
                {(["resume", "jobs", "request", "interview"] as const).map((id) => (
                    <QuickActionCard key={id} id={id} />
                ))}
            </Box>
            <RecommendedJobs />
            <MyApplications />
        </Box>
    );
}

// ─── Interview preparation article ─────────────────────────────────────────
export function ArticleCard({ article }: { article: PrepArticle }) {
    return (
        <Box component="article" sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Box sx={{ position: "relative", height: 150, overflow: "hidden", borderRadius: "12px", border: "1px solid rgba(133,133,133,0.24)" }}>
                <Box sx={{ position: "absolute", left: -32, top: -122, width: "calc(100% + 41px)", height: 341 }}>
                    <Image src={placementAsset("article-cover.png")} alt="" fill sizes="(min-width: 900px) 608px, 100vw" style={{ objectFit: "cover" }} />
                </Box>
                <Box aria-hidden sx={{ position: "absolute", left: 0, top: 0, width: "100%", height: 102, backgroundImage: "linear-gradient(180deg, #000 14.7%, rgba(0,0,0,0) 92.65%)" }} />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Typography sx={{ ...PTEXT.reg12, color: PL.n200 }}>{article.source}</Typography>
                    <MetaDot size={4} />
                    <Typography sx={{ ...PTEXT.reg12, color: PL.n200 }}>{article.readMinutes} min read</Typography>
                </Box>
                <Typography component="h2" sx={{ ...PTEXT.semi18, color: PL.white }}>
                    {article.title}
                </Typography>
                <ButtonBase
                    LinkComponent={Link}
                    href={articleHref(article.slug)}
                    sx={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "8px", height: 28, borderRadius: "50px", ...PTEXT.med14, color: PL.n200, "&:hover": { color: PL.white } }}
                >
                    Read More
                    <Asset name="icon-arrow-right-grey.svg" width={20} height={20} />
                </ButtonBase>
            </Box>
        </Box>
    );
}
