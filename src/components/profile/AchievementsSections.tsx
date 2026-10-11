"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import type { AchievementBadge, CertificationItem, StudentAchievements, XpHistoryEntry } from "@/contexts/StudentContext";
import { examCertificatePath } from "@/components/exams/exam-data";
import { PC, formatNumber, formatOrdinalDate, formatUsDate, profileAsset } from "./profile-data";
import { CardTitle, GlassCard, OutlineButton, PIcon, PT, RowBox, ellipsis, strokeLayer } from "./profile-ui";
import { EmptyNote } from "./ProfileStates";

export type BadgeState = "earned" | "current" | "locked";

interface BadgeView {
    id: string;
    title: string;
    subtitle: string;
    state: BadgeState;
    iconUrl: string | null;
    /** Progress bar fill width in px (track is 110px wide). */
    progress: number;
}

const PROGRESS_TRACK = 110;

/** Earned badges, then the next one being worked on ("current"), then the locked rest. */
function toBadgeViews(badges: AchievementBadge[]): BadgeView[] {
    const currentId = badges.find((b) => !b.earned)?.badgeId;
    return badges.map((badge) => {
        const state: BadgeState = badge.earned ? "earned" : badge.badgeId === currentId ? "current" : "locked";
        const subtitle = state === "current" ? badge.progressLabel : badge.description || badge.progressLabel;
        return {
            id: badge.badgeId,
            title: badge.name,
            subtitle,
            state,
            iconUrl: badge.iconUrl,
            progress: Math.max(1, Math.round((Math.min(100, badge.progressPct) / 100) * PROGRESS_TRACK)),
        };
    });
}

// ─── Stat banners ──────────────────────────────────────────────────────────
// Image boxes are expressed relative to the 448×265 Figma card so they scale with the card width.
const STAT_IMAGES = [
    { image: "stat-title-bg.png", imageBox: { left: "-0.45%", top: "-7.92%", width: "107.37%", height: "107.55%" }, dim: false },
    { image: "stat-badges-bg.png", imageBox: { left: "-0.37%", top: "-7.92%", width: "100.75%", height: "114.72%" }, dim: false },
    { image: "stat-xp-bg.png", imageBox: { left: "-0.45%", top: "-7.92%", width: "115.85%", height: "107.55%" }, dim: true },
] as const;

export function AchievementStats({ achievements }: { achievements: StudentAchievements }) {
    const stats = [
        { value: achievements.rank.title, label: "Your Current Title" },
        { value: `${achievements.badgesEarned}/${achievements.badgesTotal}`, label: "Total Badges Earned" },
        { value: `${formatNumber(achievements.rank.totalXp)} XP`, label: "Total Points Earned" },
    ];
    return (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(3, minmax(0, 1fr))" }, gap: { xs: "16px", md: "24px" } }}>
            {stats.map((stat, index) => {
                const art = STAT_IMAGES[index];
                return (
                    <GlassCard
                        key={stat.label}
                        decor={false}
                        sx={{ height: { xs: 200, md: 265 }, justifyContent: "flex-end", p: "24px", gap: "24px" }}
                    >
                        <Box aria-hidden sx={{ position: "absolute", ...art.imageBox, zIndex: -1 }}>
                            <Image src={profileAsset(art.image)} alt="" fill sizes="(min-width: 900px) 40vw, 100vw" style={{ objectFit: "cover" }} priority />
                            {art.dim && <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.2)" }} />}
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <Typography sx={{ ...PT.poppinsBold32, color: PC.white, fontSize: { xs: "26px", md: "32px" } }}>{stat.value}</Typography>
                            <Typography sx={{ ...PT.med18, color: PC.n200 }}>{stat.label}</Typography>
                        </Box>
                    </GlassCard>
                );
            })}
        </Box>
    );
}

// ─── Badges ────────────────────────────────────────────────────────────────
const COLUMN = 158;
const COLUMN_GAP = 24;

/** [file, left, top, width, height] inside the 64×64 badge frame (glow fragments carry blur margins). */
const BADGE_PARTS: Array<[string, number, number, number, number]> = [
    ["glow-a.svg", 12.77 - 32, 12.39 - 32, 88.59, 88.888],
    ["glow-b.svg", 30.01 - 32, 51.19 - 32, 76.661, 76.814],
    ["wing-l.svg", 0, 14.03, 20.279, 26.369],
    ["wing-r.svg", 43.72, 14.03, 20.279, 26.369],
    ["shield.svg", 12.19, 13.99, 39.623, 48.724],
    ["g3.svg", 43.22, 45.76, 6.611, 7.05],
    ["g4.svg", 14.14, 45.76, 6.611, 7.05],
    ["g5.svg", 48.17, 24.84, 7.426, 7.872],
    ["g6.svg", 8.52, 24.84, 7.426, 7.64],
    ["star.svg", 21.75, 25.57, 20.491, 19.846],
    ["g8.svg", 15.52, 22.09, 2.679, 3.91],
    ["g9.svg", 45.75, 22.04, 2.679, 3.899],
    ["g10.svg", 30.41, 14.77, 2.679, 3.906],
    ["g11.svg", 30.29, 55.05, 2.804, 3.903],
    ["crown.svg", 20.75 - 28.45, -30.22, 74.875, 75.007],
];

function BadgeIcon({ iconUrl }: { iconUrl: string | null }) {
    if (iconUrl) {
        return <Box component="img" src={iconUrl} alt="" aria-hidden sx={{ width: 64, height: 64, flexShrink: 0, objectFit: "contain" }} />;
    }
    return (
        // The Figma group is mirrored horizontally (rotate 180° + flip Y).
        <Box aria-hidden sx={{ position: "relative", width: 64, height: 64, flexShrink: 0, transform: "scaleX(-1)" }}>
            {BADGE_PARTS.map(([file, left, top, width, height]) => (
                <Box key={file} component="img" src={profileAsset(`badge/${file}`)} alt="" sx={{ position: "absolute", left, top, width, height, maxWidth: "none" }} />
            ))}
        </Box>
    );
}

function StepMarker({ state }: { state: BadgeState }) {
    if (state === "current") {
        return (
            <Box sx={{ position: "relative", width: 32, height: 32 }}>
                <Box component="img" src={profileAsset("step-current.svg")} alt="" sx={{ position: "absolute", left: -4, top: -4, width: 40, height: 40, maxWidth: "none" }} />
            </Box>
        );
    }
    return <PIcon name={state === "earned" ? "step-done.svg" : "step-pending.svg"} size={32} />;
}

function BadgeTile({ badge }: { badge: BadgeView }) {
    const current = badge.state === "current";
    return (
        <Box sx={{ position: "relative", width: COLUMN, height: 166 }}>
            {current && (
                // Soft duplicated outline behind the highlighted tile (Figma layer blur).
                <Box aria-hidden sx={{ position: "absolute", left: -18, top: 0, width: COLUMN, height: 166, borderRadius: "20px", filter: "blur(2px)", "&::before": strokeLayer(PC.cardStroke) }} />
            )}
            <Box
                sx={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    px: "24px",
                    py: "16px",
                    borderRadius: "20px",
                    backgroundImage: PC.cardFillSolid,
                    backdropFilter: "blur(44px)",
                    boxShadow: "inset 0 0 6px rgba(255,255,255,0.16)",
                    "&::before": { ...strokeLayer(PC.cardStroke), opacity: current ? 1 : 0.5 },
                }}
            >
                <BadgeIcon iconUrl={badge.iconUrl} />
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", maxWidth: "100%" }}>
                    <Typography sx={{ ...PT.med16, color: PC.n50, textAlign: "center", ...ellipsis, maxWidth: "100%" }} title={badge.title}>{badge.title}</Typography>
                    <Typography sx={{ ...PT.reg12, color: PC.n400, textAlign: "center", ...ellipsis, maxWidth: "100%" }} title={badge.subtitle}>{badge.subtitle}</Typography>
                </Box>
                <Box
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={PROGRESS_TRACK}
                    aria-valuenow={badge.progress}
                    sx={{
                        position: "relative",
                        width: "100%",
                        height: 10,
                        p: "1px",
                        borderRadius: "32px",
                        overflow: "hidden",
                        bgcolor: "rgba(255,255,255,0.02)",
                        backdropFilter: "blur(4px)",
                        boxShadow: "inset 0 0 6px rgba(255,255,255,0.16)",
                        "&::before": strokeLayer(
                            "linear-gradient(100deg, rgba(255,255,255,0.44) 0%, rgba(153,153,153,0) 60%), linear-gradient(280deg, rgba(255,255,255,0.44) 0%, rgba(255,255,255,0) 60%)",
                        ),
                    }}
                >
                    <Box sx={{ width: `${badge.progress}px`, height: 8, borderRadius: "16px", backgroundImage: badge.state === "earned" ? PC.gradientTeal : PC.gradientPurple }} />
                </Box>
            </Box>
        </Box>
    );
}

export function BadgesSection({ badges }: { badges: AchievementBadge[] }) {
    const views = toBadgeViews(badges);
    return (
        <Box component="section" sx={{ position: "relative", display: "flex", flexDirection: "column", gap: { xs: "24px", md: "53px" } }}>
            <Box
                aria-hidden
                component="img"
                src={profileAsset("badges-bg.svg")}
                alt=""
                sx={{ position: "absolute", left: 0, top: 46, width: "100%", height: 290, pointerEvents: "none" }}
            />
            <Typography component="h2" sx={{ position: "relative", ...PT.med18, color: PC.n100 }}>
                Your Badges
            </Typography>
            {views.length === 0 && (
                <Box sx={{ position: "relative", mx: "24px" }}>
                    <EmptyNote>Badges unlock as you complete lessons, labs and quizzes in your courses.</EmptyNote>
                </Box>
            )}
            <Box
                sx={{
                    position: "relative",
                    mx: "24px",
                    overflowX: "auto",
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                }}
            >
                <Box sx={{ display: "flex", gap: `${COLUMN_GAP}px`, width: "max-content" }}>
                    {views.map((badge, index) => (
                        <Box key={badge.id} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", width: COLUMN }}>
                            <Box sx={{ position: "relative", width: "100%", height: 32, display: "flex", justifyContent: "center" }}>
                                <StepMarker state={badge.state} />
                                {index < views.length - 1 && (
                                    <Box
                                        component="img"
                                        src={profileAsset("step-line-a.svg")}
                                        alt=""
                                        aria-hidden
                                        sx={{ position: "absolute", top: 15, left: COLUMN / 2 + 16 + 10, width: COLUMN + COLUMN_GAP - 32 - 20, height: 2 }}
                                    />
                                )}
                            </Box>
                            <BadgeTile badge={badge} />
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}

// ─── XP history + certifications ───────────────────────────────────────────
export function XpHistoryCard({ entries }: { entries: XpHistoryEntry[] }) {
    return (
        <GlassCard decor={false} sx={{ p: "24px", gap: "24px" }}>
            <CardTitle>XP Balance History</CardTitle>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    maxHeight: 420,
                    overflowY: "auto",
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(255,255,255,0.16) transparent",
                }}
            >
                {entries.length === 0 && <EmptyNote>Complete lessons, quizzes and labs to start earning XP.</EmptyNote>}
                {entries.map((entry) => (
                    <Box
                        key={entry.txnId}
                        sx={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                            px: "12px",
                            py: "8px",
                            flexShrink: 0,
                            borderRadius: "12px",
                            backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(153,153,153,0.04) 100%)",
                            "&::before": strokeLayer(PC.rowStroke(0.24)),
                        }}
                    >
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                            <Typography sx={{ ...PT.med14, color: PC.white, ...ellipsis }} title={entry.courseName ? `${entry.title} · ${entry.courseName}` : entry.title}>
                                {entry.title}
                            </Typography>
                            <Typography sx={{ ...PT.reg12, color: PC.n300 }}>{formatOrdinalDate(entry.createdAt)}</Typography>
                        </Box>
                        <Typography
                            sx={{
                                ...PT.med14,
                                whiteSpace: "nowrap",
                                backgroundImage:
                                    entry.amount >= 0
                                        ? "linear-gradient(92deg, #2EC4B6 4.52%, #1B4C33 104.18%)"
                                        : `linear-gradient(92deg, ${PC.error500} 0%, ${PC.error500} 100%)`,
                                WebkitBackgroundClip: "text",
                                backgroundClip: "text",
                                color: "transparent",
                            }}
                        >
                            {`${entry.amount >= 0 ? "+" : "-"}${formatNumber(Math.abs(entry.amount))} XP`}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </GlassCard>
    );
}

function certificationDetail(cert: CertificationItem) {
    if (cert.status === "issued") return `Issued on ${formatUsDate(cert.issuedAt)}`;
    if (cert.status === "expired") return `Expired on ${formatUsDate(cert.validUntil)}`;
    return cert.requirement;
}

export function CertificationsCard({ certifications }: { certifications: CertificationItem[] }) {
    const router = useRouter();
    return (
        <GlassCard>
            <CardTitle>My Certification</CardTitle>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {certifications.length === 0 && <EmptyNote>Certifications for your enrolled courses will appear here.</EmptyNote>}
                {certifications.map((cert) => (
                    <RowBox key={cert.courseId} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", px: "16px", py: "12px", flexWrap: { xs: "wrap", sm: "nowrap" } }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                            <Typography sx={{ ...PT.med16, color: PC.white }}>{cert.name}</Typography>
                            <Typography sx={{ ...PT.interReg14, color: cert.status === "revoked" ? PC.error500 : PC.n300 }}>{certificationDetail(cert)}</Typography>
                        </Box>
                        {cert.unlocked ? (
                            <OutlineButton icon="icon-download.svg" onClick={() => router.push(examCertificatePath(cert.slug ?? cert.examId ?? cert.courseId))}>
                                Download Certificate
                            </OutlineButton>
                        ) : (
                            <OutlineButton icon="icon-lock.svg" locked>
                                Locked
                            </OutlineButton>
                        )}
                    </RowBox>
                ))}
            </Box>
        </GlassCard>
    );
}