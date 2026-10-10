"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, ButtonBase, Typography } from "@mui/material";
import { COMPANIES, CompanyId, Job, PLACEMENT_ROUTES, formatSalary, postedLabel } from "./jobs-data";
import { placementAsset } from "./placement-data";
import { usePlacement } from "./PlacementContext";
import { ArrowCircle, Asset, DashedLine, EasyApplyButton, FavouriteButton, MetaDot, PL, PTEXT, glassCard } from "./placement-ui";

// ─── Company ───────────────────────────────────────────────────────────────
export function CompanyLogo({ id, size = 24 }: { id: CompanyId; size?: number }) {
    const company = COMPANIES[id];
    if (company.logoOnDisc) {
        return (
            <Box
                sx={{
                    width: size,
                    height: size,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    bgcolor: PL.white,
                    filter: "drop-shadow(0 0.22px 0.33px rgba(0,0,0,0.1)) drop-shadow(0 0.22px 0.22px rgba(0,0,0,0.1))",
                }}
            >
                <Image src={placementAsset(company.logo)} alt={company.name} width={(size * 2) / 3} height={(size * 2) / 3} />
            </Box>
        );
    }
    return <Image src={placementAsset(company.logo)} alt={company.name} width={size} height={size} style={{ flexShrink: 0 }} />;
}

export function CompanyLine({ id }: { id: CompanyId }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
            <CompanyLogo id={id} />
            <Typography sx={{ ...PTEXT.med14, color: PL.n300, textTransform: "uppercase", whiteSpace: "nowrap" }}>{COMPANIES[id].name}</Typography>
        </Box>
    );
}

/** Location • Job type • Skill match */
export function JobMeta({ job, large }: { job: Job; large?: boolean }) {
    const icon = large ? 20 : 16;
    const small = large ? PTEXT.med14 : PTEXT.med12;
    return (
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px 8px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Asset name="icon-map-pin.svg" width={icon} height={icon} />
                <Typography sx={{ ...PTEXT.med14, color: PL.n200, whiteSpace: "nowrap" }}>{job.location}</Typography>
            </Box>
            <MetaDot />
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Asset name="icon-briefcase.svg" width={icon} height={icon} />
                <Typography sx={{ ...small, color: PL.n300, whiteSpace: "nowrap" }}>{job.jobType}</Typography>
            </Box>
            <MetaDot />
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Asset name="icon-thumbs-up.svg" width={icon} height={icon} />
                <Typography sx={{ ...small, color: PL.success, whiteSpace: "nowrap" }}>{job.skillMatch}% Skill Match</Typography>
            </Box>
        </Box>
    );
}

// ─── Tab above a card ("Ethical Hacking Completed") ───────────────────────
export function CardTab({ label }: { label: string }) {
    return (
        <Box
            sx={{
                position: "relative",
                overflow: "hidden",
                alignSelf: "flex-start",
                px: "12px",
                py: "8px",
                borderRadius: "16px 16px 0 0",
                backgroundImage: PL.jobTagBg,
            }}
        >
            <Box
                aria-hidden
                sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url("${placementAsset("tab-noise-dots.png")}")`,
                    backgroundSize: "834px 834px",
                    mixBlendMode: "overlay",
                    opacity: 0.8,
                    pointerEvents: "none",
                }}
            />
            <Typography sx={{ position: "relative", ...PTEXT.med12, color: PL.n75, whiteSpace: "nowrap" }}>{label}</Typography>
        </Box>
    );
}

// ─── Job card ──────────────────────────────────────────────────────────────
export function JobCard({ job, variant = "compact" }: { job: Job; variant?: "compact" | "detailed" }) {
    const router = useRouter();
    const { favourites, toggleFavourite, applicationForJob, startApply } = usePlacement();
    const application = applicationForJob(job.id);
    const detailed = variant === "detailed";
    const tagged = !detailed && !!job.recommendedFor;
    const extraSkills = job.skills.length - 3;

    return (
        <Box component="article" sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            {tagged && <CardTab label={`${job.recommendedFor} Completed`} />}
            <Box
                role="link"
                tabIndex={0}
                aria-label={`${job.title} at ${COMPANIES[job.company].name}`}
                onClick={() => router.push(PLACEMENT_ROUTES.job(job.id))}
                onKeyDown={(event) => {
                    if (event.key === "Enter") router.push(PLACEMENT_ROUTES.job(job.id));
                }}
                sx={{
                    ...glassCard(tagged ? "0 16px 16px 16px" : "16px", PL.cardBg.replace("176.96deg", "168.19deg")),
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                    p: "24px",
                    cursor: "pointer",
                    outline: "none",
                    transition: "transform .15s ease",
                    "&:hover, &:focus-visible": { transform: "translateY(-2px)" },
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                        <CompanyLine id={job.company} />
                        <Typography sx={{ ...PTEXT.med14, color: PL.n400, whiteSpace: "nowrap" }}>{postedLabel(job.postedDaysAgo)}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Typography component="h3" sx={{ ...PTEXT.poppinsSemi20, color: PL.white }}>
                            {job.title}
                        </Typography>
                        <JobMeta job={job} large={detailed} />
                    </Box>
                </Box>

                {detailed && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Typography sx={{ ...PTEXT.reg12, color: PL.n400 }}>Skills Required :</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                            {job.skills.slice(0, 3).map((skill, i) => (
                                <Box key={`${skill}-${i}`} sx={{ p: "8px", borderRadius: "8px", backgroundImage: PL.chipBg, backdropFilter: "blur(12px)" }}>
                                    <Typography sx={{ ...PTEXT.med14, color: PL.n100, whiteSpace: "nowrap" }}>{skill}</Typography>
                                </Box>
                            ))}
                            {extraSkills > 0 && (
                                <Typography title={job.skills.slice(3).join(", ")} sx={{ ...PTEXT.med14, color: PL.n200, textDecoration: "underline" }}>
                                    +{extraSkills}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                )}

                <DashedLine tile="card-dashed-line.svg" tileWidth={342} sx={{ mt: "auto" }} />

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <Typography sx={{ ...PTEXT.med16, color: PL.n100, whiteSpace: "nowrap" }}>{formatSalary(job.salary)}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <FavouriteButton active={favourites.has(job.id)} onToggle={() => toggleFavourite(job.id)} />
                        <EasyApplyButton
                            applied={!!application}
                            onClick={() => (application ? router.push(PLACEMENT_ROUTES.application(application.id)) : startApply(job.id))}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

// ─── Quick action cards ────────────────────────────────────────────────────
export type QuickActionId = "resume" | "jobs" | "request" | "interview";

interface QuickActionDef {
    title: string;
    description: string;
    icon: string;
    ring: string;
    background: string;
    /** Decorative ring placement for the wide (hub) and compact (side) cards. */
    wideRing: { right: number; top: string };
    compactRing: { left: number; top: number };
}

export const QUICK_ACTIONS: Record<QuickActionId, QuickActionDef> = {
    resume: {
        title: "Build your Resume",
        description: "Prepare for interviews with expert tips and insights.",
        icon: "action-resume.png",
        ring: "action-ring-resume.svg",
        background: "linear-gradient(12.05deg, rgb(85,31,166) 5.67%, rgb(46,28,103) 96.74%)",
        wideRing: { right: 134, top: "calc(50% + 127.5px)" },
        compactRing: { left: 125, top: 21 },
    },
    jobs: {
        title: "Explore 15000+ Jobs",
        description: "Browse available placement opportunities.",
        icon: "action-jobs.png",
        ring: "action-ring-jobs.svg",
        background: "linear-gradient(12.62deg, rgb(0,59,56) 5.73%, rgb(0,81,68) 108.3%)",
        wideRing: { right: -133.34, top: "calc(50% - 4.5px)" },
        compactRing: { left: 218, top: -95 },
    },
    request: {
        title: "Request an Opportunity",
        description: "Can’t find the right role? Tell us what you’re looking for.",
        icon: "action-request.png",
        ring: "action-ring-request.svg",
        background: "linear-gradient(12.62deg, rgb(192,59,25) 5.73%, rgb(220,73,22) 108.3%)",
        wideRing: { right: 327.34, top: "calc(50% - 4.5px)" },
        compactRing: { left: -126, top: -100 },
    },
    interview: {
        title: "Interview Preparation",
        description: "Prepare for interviews with expert tips and insights.",
        icon: "action-interview.png",
        ring: "action-ring-interview.svg",
        background: "linear-gradient(12.62deg, rgb(16,9,63) 5.73%, rgb(35,14,119) 108.3%)",
        wideRing: { right: 247, top: "calc(50% - 96.5px)" },
        compactRing: { left: 0, top: -187 },
    },
};

/** Where each quick action leads — Request opens the modal instead of navigating. */
function useQuickAction(id: QuickActionId) {
    const { setRequestOpen } = usePlacement();
    if (id === "request") return { onClick: () => setRequestOpen(true) };
    const href = { resume: PLACEMENT_ROUTES.resume, jobs: PLACEMENT_ROUTES.jobs, interview: PLACEMENT_ROUTES.interviewPrep }[id];
    return { LinkComponent: Link, href };
}

export function QuickActionCard({ id, compact }: { id: QuickActionId; compact?: boolean }) {
    const def = QUICK_ACTIONS[id];
    const action = useQuickAction(id);
    const ring = compact
        ? { left: def.compactRing.left, top: def.compactRing.top }
        : { right: def.wideRing.right, top: def.wideRing.top, transform: "translateY(-50%)" };

    return (
        <ButtonBase
            {...action}
            sx={{
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: compact ? "column" : "row",
                alignItems: compact ? "flex-start" : "center",
                justifyContent: compact ? "center" : "flex-start",
                gap: "12px",
                width: "100%",
                minHeight: compact ? 143 : 103,
                p: compact ? "16px" : "24px",
                borderRadius: "15px",
                backgroundImage: def.background,
                textAlign: "left",
                transition: "filter .15s ease, transform .15s ease",
                "&:hover": { filter: "brightness(1.08)", transform: "translateY(-2px)" },
            }}
        >
            <Asset name={def.ring} width={316} height={316} sx={{ position: "absolute", ...ring }} />
            <Image
                src={placementAsset(def.icon)}
                alt=""
                width={compact ? 32 : 50}
                height={compact ? 32 : 50}
                sizes={compact ? "32px" : "50px"}
                style={{ position: "relative", flexShrink: 0, objectFit: "cover" }}
            />
            <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: "12px", flex: compact ? undefined : 1, width: compact ? "100%" : "auto", minWidth: 0 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 }}>
                    <Typography sx={{ ...(compact ? PTEXT.semi18 : PTEXT.poppinsSemi20), color: PL.white }}>{def.title}</Typography>
                    <Typography sx={{ ...(compact ? PTEXT.med12 : PTEXT.med14), color: PL.n200 }}>{def.description}</Typography>
                </Box>
                <ArrowCircle size={compact ? 32 : 44} />
            </Box>
        </ButtonBase>
    );
}

export function QuickActionColumn({ ids }: { ids: QuickActionId[] }) {
    return (
        <Box component="aside" aria-label="Quick actions" sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {ids.map((id) => (
                <QuickActionCard key={id} id={id} compact />
            ))}
        </Box>
    );
}
