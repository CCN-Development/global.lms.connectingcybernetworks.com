"use client";

import React from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { COMPANIES, Job, formatSalary } from "./jobs-data";
import { CompanyLogo } from "./JobCards";
import { usePlacement } from "./PlacementContext";
import { Asset, MetaDot, PL, PTEXT } from "./placement-ui";

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <Typography component="h2" sx={{ ...PTEXT.semi14, color: PL.n400, textTransform: "uppercase" }}>
            {children}
        </Typography>
    );
}

function BulletList({ items }: { items: string[] }) {
    return (
        <Box component="ul" sx={{ m: 0, pl: "24px", listStyle: "disc", ...PTEXT.med16, color: PL.white }}>
            {items.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </Box>
    );
}

function AiBox({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", p: "16px", borderRadius: "12px", bgcolor: PL.aiBoxBg }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Asset name="icon-ai-spark.svg" width={16} height={16} />
                <Typography sx={{ ...PTEXT.med14, backgroundImage: PL.warmText, backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }}>
                    {label}
                </Typography>
            </Box>
            <Box sx={{ ...PTEXT.med16, color: PL.white }}>{children}</Box>
        </Box>
    );
}

/** Salary glyph from the design (card outline + coin), composed from its two vector parts. */
function MoneyIcon() {
    return (
        <Box aria-hidden sx={{ position: "relative", width: 24, height: 24, flexShrink: 0 }}>
            <Box sx={{ position: "absolute", left: 0, top: 6.27, width: 16.25, height: 7.5, border: `1.25px solid ${PL.n400}`, borderRadius: "1.25px" }}>
                <Asset name="money-dot.svg" width={3.75} height={3.75} sx={{ position: "absolute", left: "calc(50% - 1.25px)", top: "calc(50% - 1.875px)" }} />
            </Box>
            <Asset name="money-back.svg" width={19.69} height={10.76} sx={{ position: "absolute", left: 0.32, top: 2.38 }} />
        </Box>
    );
}

/** `onApply` omitted renders the primary button disabled (e.g. already applied). */
export function JobDetailColumn({ job, applyLabel = "Easy Apply", onApply }: { job: Job; applyLabel?: string; onApply?: () => void }) {
    const { favourites, toggleFavourite } = usePlacement();
    const favourite = favourites.has(job.id);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "32px", minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
                <Box
                    sx={{
                        width: 88,
                        height: 88,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "11px",
                        bgcolor: PL.white,
                        border: "1.47px solid #E3E5EB",
                    }}
                >
                    <CompanyLogo id={job.company} size={64.5} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                    <Typography sx={{ ...PTEXT.med14, color: PL.n400, textTransform: "uppercase" }}>{COMPANIES[job.company].name}</Typography>
                    <Typography component="h2" sx={{ ...PTEXT.poppinsMed24, fontSize: { xs: "20px", sm: "24px" }, color: PL.white }}>
                        {job.title}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px 8px" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Asset name="icon-map-pin.svg" width={20} height={20} />
                            <Typography sx={{ ...PTEXT.med14, color: PL.n300 }}>{job.location}</Typography>
                        </Box>
                        <MetaDot />
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <MoneyIcon />
                            <Typography sx={{ ...PTEXT.med14, color: PL.n300 }}>{formatSalary(job.salary)}</Typography>
                        </Box>
                        <MetaDot />
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Asset name="icon-briefcase.svg" width={20} height={20} />
                            <Typography sx={{ ...PTEXT.med14, color: PL.n300 }}>{job.jobType}</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: "16px" }}>
                <ButtonBase
                    aria-pressed={favourite}
                    onClick={() => toggleFavourite(job.id)}
                    sx={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        p: "12px",
                        borderRadius: "8px",
                        border: `1px solid ${favourite ? "rgba(224,44,66,0.6)" : PL.n600}`,
                        ...PTEXT.med16,
                        color: PL.n100,
                        "&:hover": { borderColor: favourite ? "#E02C42" : PL.n400 },
                    }}
                >
                    <Asset name="icon-heart-24.svg" width={24} height={24} />
                    {favourite ? "Added to Favourite" : "Add to Favourite"}
                </ButtonBase>
                <ButtonBase
                    disabled={!onApply}
                    onClick={onApply}
                    sx={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "11.22px",
                        px: "15px",
                        py: "12px",
                        borderRadius: "9.35px",
                        backgroundImage: PL.lmsGradient,
                        filter: "drop-shadow(0 0 3.74px rgba(255,255,255,0.12))",
                        ...PTEXT.med16,
                        color: PL.white,
                        "&:hover": { filter: "drop-shadow(0 0 3.74px rgba(255,255,255,0.12)) brightness(1.12)" },
                        "&.Mui-disabled": { opacity: 0.6, color: PL.white },
                    }}
                >
                    <Asset name="icon-zap.svg" width={24} height={24} />
                    {applyLabel}
                </ButtonBase>
            </Box>

            <Box sx={{ position: "relative", display: "flex", alignItems: "stretch", gap: { xs: "12px", sm: "32px" }, p: "24px", borderRadius: "16px", backgroundImage: PL.sectionBg, overflow: "hidden" }}>
                {[
                    [job.experience, "Experience Level"],
                    [`${job.applicants} Applicants`, "Competition"],
                    [`${job.openings} ${job.openings === 1 ? "Position" : "Positions"}`, "Openings"],
                ].map(([value, label], i) => (
                    <React.Fragment key={label}>
                        {i > 0 && <Box aria-hidden sx={{ width: "1px", flexShrink: 0, backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0) 0%, #CCCCCC 50%, rgba(153,153,153,0) 100%)" }} />}
                        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", textAlign: "center" }}>
                            <Typography sx={{ ...PTEXT.med16, color: PL.white }}>{value}</Typography>
                            <Typography sx={{ ...PTEXT.med16, fontSize: { xs: "13px", sm: "16px" }, color: PL.n300 }}>{label}</Typography>
                        </Box>
                    </React.Fragment>
                ))}
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <SectionLabel>About this role</SectionLabel>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {job.about.map((paragraph) => (
                        <Typography key={paragraph} sx={{ ...PTEXT.med16, color: PL.white }}>
                            {paragraph}
                        </Typography>
                    ))}
                </Box>
            </Box>

            <AiBox label="AI Summary">{job.aiSummary}</AiBox>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <SectionLabel>Key Responsibilities</SectionLabel>
                <BulletList items={job.responsibilities} />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <SectionLabel>Requirements</SectionLabel>
                <BulletList items={job.requirements} />
            </Box>

            <AiBox label="AI Insight">
                <Box component="p" sx={{ m: 0 }}>
                    Your Gaps
                </Box>
                <Box component="ul" sx={{ m: 0, pl: "24px", listStyle: "disc" }}>
                    {job.aiInsight.gaps.map((gap) => (
                        <li key={gap.value}>
                            {gap.label}: {gap.value}
                        </li>
                    ))}
                </Box>
                <Box component="p" sx={{ m: 0, mt: "24px" }}>
                    ⚡ Fix these to increase match to {job.aiInsight.boostTo}%
                </Box>
            </AiBox>
        </Box>
    );
}

/** "AI Match Score : 85%" pill from the Track Application header. */
export function MatchScorePill({ score }: { score: number }) {
    return (
        <Box sx={{ px: "7.48px", py: "1.87px", borderRadius: "934px", bgcolor: "#BBEDBB", flexShrink: 0 }}>
            <Typography sx={{ ...PTEXT.med16, color: "#0E340E", whiteSpace: "nowrap" }}>AI Match Score : {score}%</Typography>
        </Box>
    );
}
