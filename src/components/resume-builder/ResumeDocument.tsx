"use client";

import React from "react";
import DOMPurify from "isomorphic-dompurify";
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";
import { Box, SxProps, Theme } from "@mui/material";
import { FONT_POPPINS } from "@/components/aish/tokens";
import { ResumeRecord, ResumeThemeId, SAMPLE_PHOTO, displayUrl, isBlankHtml, yearOf } from "./resume-data";

const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });
const plexCondensed = IBM_Plex_Sans_Condensed({ subsets: ["latin"], weight: ["400", "500"], display: "swap" });

/** Native size of the A4-ish preview page in Figma. */
export const DOC_WIDTH = 576;
export const DOC_HEIGHT = 850;

// ─── Theme palettes ────────────────────────────────────────────────────────
interface DocPalette {
    heading: string;
    title: string;
    body: string;
    muted: string;
    rule: string;
    headerBg: string;
    nameColor: string;
    contactColor: string;
    photoBg: string;
    headingTransform: "none" | "uppercase";
}

const PALETTES: Record<ResumeThemeId, DocPalette> = {
    simple: {
        heading: "#1F1F1F",
        title: "#262626",
        body: "#6B6B6B",
        muted: "#8C8C8C",
        rule: "#E6E6E6",
        headerBg: "transparent",
        nameColor: "#262626",
        contactColor: "#6B6B6B",
        photoBg: "#BBC9ED",
        headingTransform: "none",
    },
    modern: {
        heading: "#2F53AD",
        title: "#262626",
        body: "#6B6B6B",
        muted: "#8C8C8C",
        rule: "#E3E9F8",
        headerBg: "linear-gradient(90deg, #0027AC 0%, #2C14AC 43.57%, #5900AC 100%)",
        nameColor: "#FFFFFF",
        contactColor: "#E3E9F8",
        photoBg: "#BBC9ED",
        headingTransform: "none",
    },
    professional: {
        heading: "#244085",
        title: "#1F1F1F",
        body: "#595959",
        muted: "#8C8C8C",
        rule: "#D9D9D9",
        headerBg: "transparent",
        nameColor: "#244085",
        contactColor: "#595959",
        photoBg: "#E3E9F8",
        headingTransform: "uppercase",
    },
    custom: {} as DocPalette,
};
PALETTES.custom = PALETTES.simple;

// ─── Rich text ─────────────────────────────────────────────────────────────
const ALLOWED_TAGS = ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "span"];

/** Sanitises editor HTML, keeping only `text-align` from inline styles. */
export function sanitizeResumeHtml(html: string) {
    const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR: ["style"] });
    return clean.replace(/\sstyle="([^"]*)"/g, (_, style: string) => {
        const align = /text-align:\s*(left|right|center|justify)/.exec(style);
        return align ? ` style="text-align: ${align[1]}"` : "";
    });
}

function RichText({ html, color }: { html: string; color: string }) {
    if (isBlankHtml(html)) return null;
    return (
        <Box
            sx={{
                color,
                "& p": { m: 0 },
                "& ul, & ol": { m: 0, pl: "14px" },
                "& li": { m: 0 },
                "& li p": { display: "inline" },
            }}
            dangerouslySetInnerHTML={{ __html: sanitizeResumeHtml(html) }}
        />
    );
}

// ─── Photo ─────────────────────────────────────────────────────────────────
/** Circular photo; the sample photo keeps the Figma framing (image larger than the circle). */
export function ResumePhoto({ url, size, background = "#BBC9ED", sx }: { url: string | null; size: number; background?: string; sx?: SxProps<Theme> }) {
    const framed = url === SAMPLE_PHOTO;
    return (
        <Box
            sx={[
                { position: "relative", width: size, height: size, flexShrink: 0, overflow: "hidden", borderRadius: "50%", bgcolor: background },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            {url && (
                <Box
                    component="img"
                    src={url}
                    alt=""
                    sx={
                        framed
                            ? { position: "absolute", left: `${(-55.86 / 147) * 100}%`, top: `${(7.35 / 147) * 100}%`, width: `${(245.356 / 147) * 100}%`, height: `${(245.356 / 147) * 100}%`, objectFit: "cover", maxWidth: "none" }
                            : { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }
                    }
                />
            )}
        </Box>
    );
}

// ─── Building blocks ───────────────────────────────────────────────────────
const LINE = "19.4px";

function Section({ title, palette, children }: { title: string; palette: DocPalette; children: React.ReactNode }) {
    return (
        <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <Box
                component="h3"
                sx={{
                    m: 0,
                    fontFamily: plexSans.style.fontFamily,
                    fontWeight: 600,
                    fontSize: palette.headingTransform === "uppercase" ? "11.5px" : "13px",
                    letterSpacing: palette.headingTransform === "uppercase" ? "0.08em" : 0,
                    textTransform: palette.headingTransform,
                    lineHeight: "20px",
                    color: palette.heading,
                }}
            >
                {title}
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>{children}</Box>
        </Box>
    );
}

function Entry({ from, to, title, lines, html, palette }: { from?: string; to?: string; title: string; lines?: string[]; html?: string; palette: DocPalette }) {
    const details = (lines ?? []).filter(Boolean);
    return (
        <Box sx={{ display: "grid", gridTemplateColumns: "38px minmax(0, 1fr)" }}>
            <Box sx={{ fontFamily: plexCondensed.style.fontFamily, fontSize: "9px", lineHeight: LINE, color: palette.muted, display: "flex", flexDirection: "column" }}>
                {from && <span>{from}</span>}
                {from && to && to !== from && (
                    <>
                        <span>—</span>
                        <span>{to}</span>
                    </>
                )}
            </Box>
            <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "5px", overflowWrap: "anywhere" }}>
                <Box sx={{ fontFamily: plexSans.style.fontFamily, fontWeight: 500, fontSize: "10.5px", lineHeight: LINE, color: palette.title }}>{title}</Box>
                {(details.length > 0 || (html && !isBlankHtml(html))) && (
                    <Box sx={{ fontFamily: plexCondensed.style.fontFamily, fontSize: "10px", lineHeight: LINE, color: palette.body }}>
                        {details.map((line, i) => (
                            <Box key={i}>{line}</Box>
                        ))}
                        {html && <RichText html={html} color={palette.body} />}
                    </Box>
                )}
            </Box>
        </Box>
    );
}

// ─── Document ──────────────────────────────────────────────────────────────
/** Renders a resume from data at its native 576px width (scale it with a CSS transform). */
export default function ResumeDocument({ resume, sx }: { resume: ResumeRecord; sx?: SxProps<Theme> }) {
    const palette = PALETTES[resume.theme];
    const { personal, summary, education, achievements, skills, projects, experience, other } = resume.content;
    const contact = [personal.location, personal.email, personal.links.find((l) => l.url.trim())?.url, personal.phone].filter(Boolean) as string[];

    const educationEntries = education.filter((e) => e.institution.trim());
    const experienceEntries = experience.filter((e) => e.company.trim() || e.role.trim());
    const achievementEntries = achievements.filter((a) => a.certificationName.trim());
    const projectEntries = projects.filter((p) => p.name.trim());
    const otherEntries = other.filter((o) => o.title.trim());
    const hasSkills = skills.technical.length > 0 || skills.tools.length > 0;

    const body = { fontFamily: plexCondensed.style.fontFamily, fontSize: "10px", lineHeight: LINE, color: palette.body } as const;

    return (
        <Box
            sx={[
                {
                    width: DOC_WIDTH,
                    minHeight: DOC_HEIGHT,
                    flexShrink: 0,
                    bgcolor: "#FFFFFF",
                    color: palette.title,
                    display: "flex",
                    flexDirection: "column",
                    pb: "40px",
                    textAlign: "left",
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            {/* Header */}
            <Box sx={{ background: palette.headerBg, px: "38px", pt: "32px", pb: palette.headerBg === "transparent" ? 0 : "18px" }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "104px minmax(0, 1fr) 187px", alignItems: "center", columnGap: "12px", minHeight: 104 }}>
                    <ResumePhoto url={personal.photoUrl} size={104} background={palette.photoBg} />
                    <Box
                        component="h2"
                        sx={{ m: 0, fontFamily: FONT_POPPINS, fontWeight: 700, fontSize: "20px", lineHeight: "32px", color: palette.nameColor, overflowWrap: "anywhere", pr: "8px" }}
                    >
                        {personal.fullName || "Your Name"}
                    </Box>
                    <Box sx={{ ...body, color: palette.contactColor, minWidth: 0 }}>
                        {contact.map((line, i) => (
                            <Box key={i} sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {/^https?:\/\//i.test(line) ? displayUrl(line) : line}
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
            <Box sx={{ mx: "38px", mt: "18px", height: "1px", bgcolor: palette.rule, flexShrink: 0 }} />

            {/* Columns */}
            <Box sx={{ flex: 1, display: "grid", gridTemplateColumns: "minmax(0, 1fr) 1px minmax(0, 1fr)", columnGap: "24px", px: "38px", pt: "23px" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "27px", minWidth: 0 }}>
                    {!isBlankHtml(summary) && (
                        <Section title="Profile" palette={palette}>
                            <Box sx={body}>
                                <RichText html={summary} color={palette.body} />
                            </Box>
                        </Section>
                    )}
                    {educationEntries.length > 0 && (
                        <Section title="Education" palette={palette}>
                            {educationEntries.map((e) => (
                                <Entry
                                    key={e.id}
                                    from={e.yearOfCompletion}
                                    title={e.institution}
                                    lines={[[e.qualification, e.fieldOfStudy].filter(Boolean).join(" in "), e.grade]}
                                    html={e.description}
                                    palette={palette}
                                />
                            ))}
                        </Section>
                    )}
                    {hasSkills && (
                        <Section title="Key Skills" palette={palette}>
                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "12px", mt: "-2px" }}>
                                {(
                                    [
                                        ["Technical", skills.technical],
                                        ["Tools & Platforms", skills.tools],
                                    ] as const
                                ).map(([label, list]) => (
                                    <Box key={label} sx={{ minWidth: 0 }}>
                                        <Box sx={{ fontFamily: plexSans.style.fontFamily, fontWeight: 500, fontSize: "10.5px", lineHeight: LINE, color: palette.title, mb: "5px" }}>
                                            {label}
                                        </Box>
                                        {list.map((skill) => (
                                            <Box key={skill} sx={body}>
                                                {skill}
                                            </Box>
                                        ))}
                                    </Box>
                                ))}
                            </Box>
                        </Section>
                    )}
                </Box>

                <Box aria-hidden sx={{ bgcolor: palette.rule, mb: "-0px" }} />

                <Box sx={{ display: "flex", flexDirection: "column", gap: "27px", minWidth: 0 }}>
                    {experienceEntries.length > 0 && (
                        <Section title="Experience" palette={palette}>
                            {experienceEntries.map((e) => (
                                <Entry
                                    key={e.id}
                                    from={yearOf(e.startDate)}
                                    to={yearOf(e.endDate) || "Now"}
                                    title={[e.role, e.company].filter(Boolean).join(" at ")}
                                    html={e.description}
                                    palette={palette}
                                />
                            ))}
                        </Section>
                    )}
                    {achievementEntries.length > 0 && (
                        <Section title="Achievements" palette={palette}>
                            {achievementEntries.map((a) => (
                                <Entry
                                    key={a.id}
                                    from={a.yearOfCompletion}
                                    title={a.certificationName}
                                    lines={[[a.organisation, a.credential].filter(Boolean).join(" · ")]}
                                    html={a.description}
                                    palette={palette}
                                />
                            ))}
                        </Section>
                    )}
                    {projectEntries.length > 0 && (
                        <Section title="Projects" palette={palette}>
                            {projectEntries.map((p) => (
                                <Entry key={p.id} title={p.name} html={p.description} palette={palette} />
                            ))}
                        </Section>
                    )}
                    {otherEntries.length > 0 && (
                        <Section title="Other" palette={palette}>
                            {otherEntries.map((o) => (
                                <Entry
                                    key={o.id}
                                    from={yearOf(o.startDate)}
                                    to={yearOf(o.endDate)}
                                    title={o.title}
                                    lines={[o.link && o.link !== o.title ? displayUrl(o.link) : ""]}
                                    html={o.description}
                                    palette={palette}
                                />
                            ))}
                        </Section>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
