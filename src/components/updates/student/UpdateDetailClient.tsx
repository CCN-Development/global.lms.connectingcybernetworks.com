"use client";

import { Fragment, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Box, ButtonBase, Typography } from "@mui/material";
import { FiShare2 } from "react-icons/fi";
import { MdArrowBack } from "react-icons/md";
import UpdateCard from "./UpdateCard";
import {
    KIND_META,
    findUpdate,
    getRelatedUpdates,
    kindFromSlug,
    listHref,
    type ContentSection,
    type RichText,
    type UpdateEntry,
} from "./mock-data";
import { FONT_INTER, FONT_LATO, FONT_POPPINS, UPD } from "./tokens";

const RELATED_PREVIEW = 3;
const IST = "Asia/Kolkata";

// ─── Formatters ────────────────────────────────────────────────────────────
function longDate(value: string) {
    const parts = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: IST }).formatToParts(new Date(value));
    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((entry) => entry.type === type)?.value ?? "";
    return `${part("day")} ${part("month")}, ${part("year")}`;
}

function publishedLabel(value: string) {
    const time = new Date(value).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: IST }).toLowerCase();
    return `${time} ${longDate(value)}`;
}

function viewsLabel(count: number) {
    if (count < 1000) return `${count} view${count === 1 ? "" : "s"}`;
    return `${parseFloat((count / 1000).toFixed(2))}k views`;
}

// ─── Rich content ──────────────────────────────────────────────────────────
const BODY_SX = { fontFamily: FONT_LATO, fontWeight: 500, fontSize: "16px", lineHeight: "24px", color: UPD.white } as const;
const HEADING_SX = { fontFamily: FONT_POPPINS, fontWeight: 600, fontSize: "20px", lineHeight: "30px", color: UPD.white } as const;

function Rich({ value }: { value: RichText }) {
    if (typeof value === "string") return <>{value}</>;
    return (
        <>
            {value.map((part, index) => {
                if (typeof part === "string") return <Fragment key={index}>{part}</Fragment>;
                const external = /^https?:\/\//.test(part.href);
                return (
                    <Box
                        key={index}
                        component={external ? "a" : Link}
                        href={part.href}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        sx={{ color: UPD.link, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                    >
                        {part.text}
                    </Box>
                );
            })}
        </>
    );
}

function CaptionedImage({ src, alt, caption, priority = false }: { src: string; alt: string; caption?: string; priority?: boolean }) {
    return (
        <Box
            sx={{
                position: "relative",
                height: { xs: 240, sm: 360, md: 500 },
                borderRadius: "16px",
                overflow: "hidden",
                bgcolor: "#e4e4e4",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                p: "12px",
            }}
        >
            <Image src={src} alt={alt} fill priority={priority} sizes="(max-width: 1200px) 100vw, 830px" style={{ objectFit: "cover" }} />
            {caption ? (
                <Box sx={{ position: "relative", px: "8px", py: "2px", borderRadius: "8px", bgcolor: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)" }}>
                    <Typography sx={{ fontFamily: FONT_INTER, fontWeight: 500, fontSize: "14px", lineHeight: "24px", color: UPD.white, whiteSpace: "nowrap" }}>
                        {caption}
                    </Typography>
                </Box>
            ) : null}
        </Box>
    );
}

/** Wide version of the announcement tile used in place of a cover photo. */
function AnnouncementBanner({ caption }: { caption: string }) {
    return (
        <Box
            sx={{
                position: "relative",
                height: { xs: 220, sm: 300, md: 360 },
                borderRadius: "16px",
                overflow: "hidden",
                bgcolor: UPD.announcementTileBg,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                p: "12px",
            }}
        >
            <Box aria-hidden sx={{ position: "absolute", left: "50%", top: "50%", width: 3000, height: 3000, transform: "translate(-50%, -50%) scaleX(-1)" }}>
                <Image src="/updates/rays.svg" alt="" fill unoptimized priority />
            </Box>
            <Box
                aria-hidden
                sx={{ position: "absolute", left: "50%", top: "50%", width: { xs: 160, md: 240 }, height: { xs: 160, md: 240 }, transform: "translate(-50%, -50%)" }}
            >
                <Image src="/updates/megaphone.png" alt="" fill priority sizes="240px" style={{ objectFit: "cover" }} />
            </Box>
            <Box sx={{ position: "relative", px: "8px", py: "2px", borderRadius: "8px", bgcolor: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)" }}>
                <Typography sx={{ fontFamily: FONT_INTER, fontWeight: 500, fontSize: "14px", lineHeight: "24px", color: UPD.white }}>{caption}</Typography>
            </Box>
        </Box>
    );
}

function ComparisonTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
    const template = `minmax(140px, 270px) repeat(${columns.length - 1}, minmax(0, 1fr))`;
    const cell = { p: "16px", display: "flex", alignItems: "center", fontFamily: FONT_LATO, fontSize: "16px", lineHeight: "24px" } as const;

    return (
        <Box sx={{ border: `1px solid ${UPD.neutral600}`, borderRadius: "16px", p: "8px", overflowX: "auto" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: template, gap: "4px", minWidth: 560 }}>
                {columns.map((column, index) => (
                    <Box
                        key={column}
                        sx={{
                            ...cell,
                            fontWeight: 600,
                            color: UPD.neutral100,
                            bgcolor: UPD.tableHeadBg,
                            borderTopLeftRadius: index === 0 ? "8px" : 0,
                            borderTopRightRadius: index === columns.length - 1 ? "8px" : 0,
                        }}
                    >
                        {column}
                    </Box>
                ))}
                {rows.map((row, rowIndex) =>
                    row.map((value, columnIndex) => (
                        <Box key={`${rowIndex}-${columnIndex}`} sx={{ ...cell, fontWeight: 500, color: UPD.white, background: UPD.tableCellBg }}>
                            {value}
                        </Box>
                    )),
                )}
            </Box>
        </Box>
    );
}

function Section({ section, priority = false }: { section: ContentSection; priority?: boolean }) {
    if (section.image) {
        return <CaptionedImage src={section.image.src} alt={section.image.alt ?? ""} caption={section.image.caption} priority={priority} />;
    }

    const hasHeader = Boolean(section.heading || section.lead);
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {hasHeader ? (
                <Box>
                    {section.heading ? (
                        <Typography component="h2" sx={HEADING_SX}>
                            {section.heading}
                        </Typography>
                    ) : null}
                    {section.lead ? <Typography sx={BODY_SX}>{section.lead}</Typography> : null}
                </Box>
            ) : null}

            {section.paragraphs?.map((paragraph, index) => (
                <Typography key={index} sx={BODY_SX}>
                    <Rich value={paragraph} />
                </Typography>
            ))}

            {section.list ? (
                <Box component="ul" sx={{ m: 0, pl: "24px", listStyle: "disc", ...BODY_SX, "& li::marker": { color: UPD.white } }}>
                    {section.list.map((item, index) => (
                        <li key={index}>
                            <Rich value={item} />
                        </li>
                    ))}
                </Box>
            ) : null}

            {section.table ? <ComparisonTable columns={section.table.columns} rows={section.table.rows} /> : null}
        </Box>
    );
}

// ─── Side panels ───────────────────────────────────────────────────────────
function RelatedPanel({ entry }: { entry: UpdateEntry }) {
    const related = useMemo(() => getRelatedUpdates(entry), [entry]);
    const [expanded, setExpanded] = useState(false);

    if (related.length === 0) return null;

    const canExpand = related.length > RELATED_PREVIEW;
    const visible = expanded ? related : related.slice(0, RELATED_PREVIEW);
    const faded = canExpand && !expanded;

    return (
        <Box
            component="aside"
            sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "32px",
                p: "24px",
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.88)",
                background: UPD.relatedPanelBg,
                backdropFilter: "blur(12px)",
                boxShadow: "inset 0 0 6px rgba(255,255,255,0.16)",
                overflow: "hidden",
            }}
        >
            <Typography sx={{ alignSelf: "stretch", fontFamily: FONT_INTER, fontWeight: 600, fontSize: "16px", lineHeight: "24px", color: UPD.primary75 }}>
                {KIND_META[entry.kind].relatedTitle}
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
                {visible.map((item) => (
                    <UpdateCard key={item.id} entry={item} />
                ))}
            </Box>

            {faded ? (
                <Box
                    aria-hidden
                    sx={{
                        position: "absolute",
                        insetInline: 0,
                        bottom: -1,
                        height: "44%",
                        background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 80.45%)",
                        pointerEvents: "none",
                    }}
                />
            ) : null}

            {canExpand ? (
                <ButtonBase
                    onClick={() => setExpanded((value) => !value)}
                    sx={{
                        position: "relative",
                        zIndex: 1,
                        height: 44,
                        px: "16px",
                        borderRadius: "50px",
                        border: `1px solid ${UPD.neutral700}`,
                        fontFamily: FONT_LATO,
                        fontWeight: 500,
                        fontSize: "14px",
                        lineHeight: "21px",
                        color: UPD.white,
                        transition: "border-color .2s, background-color .2s",
                        "&:hover": { borderColor: UPD.neutral300, bgcolor: "rgba(255,255,255,0.04)" },
                    }}
                >
                    {expanded ? "Show Less" : "Show More"}
                </ButtonBase>
            ) : null}
        </Box>
    );
}

function AuthorDetails({ entry }: { entry: UpdateEntry }) {
    const { name, avatar } = entry.author;
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <Box
                sx={{
                    position: "relative",
                    width: 50,
                    height: 50,
                    flexShrink: 0,
                    borderRadius: "50px",
                    border: `1px solid ${UPD.primary100}`,
                    bgcolor: "#EDEFF4",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {avatar ? (
                    <Image src={avatar} alt={name} fill sizes="50px" style={{ objectFit: "cover", objectPosition: "top" }} />
                ) : (
                    <Typography sx={{ fontFamily: FONT_INTER, fontWeight: 600, fontSize: "18px", color: UPD.primary800 }}>
                        {name.slice(0, 1).toUpperCase()}
                    </Typography>
                )}
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                <Typography sx={{ fontFamily: FONT_INTER, fontSize: "16px", lineHeight: "20px", color: UPD.neutral100 }}>Published by</Typography>
                <Typography sx={{ fontFamily: FONT_INTER, fontWeight: 600, fontSize: "18px", lineHeight: "24px", color: UPD.white }}>{name}</Typography>
            </Box>
        </Box>
    );
}

// ─── Page ──────────────────────────────────────────────────────────────────
function Bullet() {
    return (
        <Typography component="span" sx={{ fontFamily: FONT_INTER, fontSize: "14px", lineHeight: "20px", color: UPD.neutral400 }}>
            •
        </Typography>
    );
}

const META_SX = { fontFamily: FONT_LATO, fontSize: "16px", lineHeight: "24px", color: UPD.neutral200, whiteSpace: "nowrap" } as const;

export default function UpdateDetailClient({ typeSlug, identifier }: { typeSlug: string; identifier: string }) {
    const router = useRouter();
    const kind = kindFromSlug(typeSlug);
    const entry = useMemo(() => findUpdate(kind, identifier), [kind, identifier]);

    const goBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) router.back();
        else router.push(listHref(kind));
    };

    const share = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({ title: entry?.title, url });
                return;
            } catch {
                // Share sheet dismissed or unsupported target — fall back to copying the link.
            }
        }
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied");
        } catch {
            toast.error("Couldn't copy the link");
        }
    };

    if (!entry) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", p: 3 }}>
                <Typography sx={{ fontFamily: FONT_POPPINS, fontWeight: 500, fontSize: "20px", color: UPD.white }}>
                    This {KIND_META[kind].label.toLowerCase()} is no longer available.
                </Typography>
                <ButtonBase
                    component={Link}
                    href={listHref(kind)}
                    sx={{ height: 44, px: "16px", borderRadius: "50px", border: `1px solid ${UPD.neutral700}`, fontFamily: FONT_LATO, fontSize: "14px", color: UPD.white }}
                >
                    Back to {KIND_META[kind].tabLabel}
                </ButtonBase>
            </Box>
        );
    }

    const showUpdated = Date.parse(entry.updatedAt) - Date.parse(entry.publishedAt) > 60_000;

    return (
        <Box
            sx={{
                height: "100vh",
                overflowY: "auto",
                overflowX: "hidden",
                color: UPD.white,
                p: { xs: "16px", md: "24px" },
                scrollbarWidth: "thin",
                scrollbarColor: `${UPD.neutral700} transparent`,
            }}
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: "32px", maxWidth: 1600, mx: "auto" }}>
                {/* ── Header ── */}
                <Box sx={{ display: "flex", alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", gap: "16px" }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: { xs: "12px", sm: "16px" }, minWidth: 0 }}>
                        <ButtonBase
                            aria-label="Go back"
                            onClick={goBack}
                            sx={{
                                width: 44,
                                height: 44,
                                flexShrink: 0,
                                borderRadius: "50px",
                                border: "1px solid rgba(255,255,255,0.08)",
                                background: UPD.backButtonBg,
                                backdropFilter: "blur(25px)",
                                color: UPD.white,
                                transition: "border-color .15s",
                                "&:hover": { borderColor: "rgba(255,255,255,0.24)" },
                            }}
                        >
                            <MdArrowBack size={24} />
                        </ButtonBase>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
                            <Typography
                                component="h1"
                                sx={{ fontFamily: FONT_POPPINS, fontWeight: 500, fontSize: { xs: "18px", sm: "20px" }, lineHeight: { xs: "27px", sm: "30px" }, color: UPD.white }}
                            >
                                {entry.title}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: "4px 12px", flexWrap: "wrap" }}>
                                <Typography sx={META_SX}>{entry.category}</Typography>
                                <Bullet />
                                <Typography sx={META_SX} suppressHydrationWarning>
                                    <Box component="span" sx={{ fontWeight: 500 }}>
                                        Published
                                    </Box>{" "}
                                    {publishedLabel(entry.publishedAt)}
                                </Typography>
                                <Bullet />
                                <Typography sx={META_SX}>{entry.readMinutes} mins read</Typography>
                                <Bullet />
                                <Typography sx={META_SX}>{viewsLabel(entry.views)}</Typography>
                            </Box>
                        </Box>
                    </Box>

                    <ButtonBase
                        onClick={share}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            height: 44,
                            pl: "12px",
                            pr: { xs: "12px", sm: "16px" },
                            flexShrink: 0,
                            borderRadius: "8px",
                            border: "1px solid rgba(140,140,140,0.5)",
                            boxShadow: "0 4px 24px rgba(0,0,0,0.16)",
                            color: UPD.neutral75,
                            transition: "border-color .2s, background-color .2s",
                            "&:hover": { borderColor: UPD.neutral300, bgcolor: "rgba(255,255,255,0.04)" },
                        }}
                    >
                        <FiShare2 size={20} strokeWidth={1.5} />
                        <Typography sx={{ display: { xs: "none", sm: "block" }, fontFamily: FONT_LATO, fontWeight: 500, fontSize: "14px", lineHeight: "21px", color: UPD.neutral75 }}>
                            Share
                        </Typography>
                    </ButtonBase>
                </Box>

                {/* ── Body ── */}
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, alignItems: { xs: "stretch", lg: "flex-start" }, gap: "24px" }}>
                        {/* Timeline rail */}
                        <Box sx={{ display: { xs: "none", lg: "flex" }, flexDirection: "column", alignItems: "center", pt: "6px", width: 50, flexShrink: 0, alignSelf: "stretch" }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: UPD.neutral400, flexShrink: 0 }} />
                            <Box sx={{ flex: 1, width: "1px", bgcolor: UPD.neutral600 }} />
                        </Box>

                        {/* Article */}
                        <Box component="article" sx={{ display: "flex", flexDirection: "column", gap: "40px", pb: "40px", flex: { lg: "0 1 827px" }, minWidth: 0 }}>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "24px" }}>
                                {showUpdated ? (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: "4px", px: "8px", py: "2px", borderRadius: "8px", bgcolor: UPD.primary75 }}>
                                        <Typography sx={{ fontFamily: FONT_INTER, fontSize: "14px", lineHeight: "24px", color: UPD.primary800 }}>Last updated</Typography>
                                        <Typography suppressHydrationWarning sx={{ fontFamily: FONT_INTER, fontWeight: 500, fontSize: "14px", lineHeight: "24px", color: UPD.primary800 }}>
                                            {longDate(entry.updatedAt)}
                                        </Typography>
                                    </Box>
                                ) : null}
                                <Typography sx={BODY_SX}>{entry.summary}</Typography>
                            </Box>

                            {entry.kind === "announcement" && !entry.sections.some((section) => section.image) ? (
                                <AnnouncementBanner caption={entry.category} />
                            ) : null}

                            {entry.sections.map((section, index) => (
                                <Section key={index} section={section} priority={index === 0} />
                            ))}
                        </Box>

                        {/* Related */}
                        <Box sx={{ flex: { lg: "1 1 0" }, minWidth: { lg: 320 } }}>
                            <RelatedPanel entry={entry} />
                        </Box>
                    </Box>

                    <Box sx={{ pt: { xs: "32px", lg: 0 } }}>
                        <AuthorDetails entry={entry} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
