"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Box, ButtonBase, CircularProgress, Tooltip, Typography } from "@mui/material";
import { BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import type { StandardResponse } from "@/contexts/AuthContext";
import type { ModuleLessonView, ModuleSectionView, ModuleView, PlaybackInfo } from "@/contexts/CourseContext";
import { formatClockDuration, formatHoursMinutes, isRemoteSrc } from "../course-format";
import { COLORS, COURSE_ASSETS, LESSON_CARD_FILL, LEVEL_CARD_FILL, MODULE_ASSETS, TYPE, UI_ICONS, glassFill } from "../my-courses-theme";
import { StatusPill, framedPanelSx } from "../my-courses-ui";
import { LevelStatus } from "../CourseLevelsTab";
import StreamPlayer from "../StreamPlayer";

const LEVEL_ASSETS = `${COURSE_ASSETS}/levels`;
export const MODULE_HERO_POSTER = `${MODULE_ASSETS}/hero-thumb.png`;
export const LESSON_VIDEO_POSTER = `${MODULE_ASSETS}/lesson-video-thumb.png`;

const focusRing = { "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" } } as const;

/** Violet haze bleeding into every module card from above, as on the Levels tab. */
function CardGlow() {
    return (
        <Box aria-hidden sx={{ position: "absolute", left: "-59.17px", top: "-782.18px", lineHeight: 0, pointerEvents: "none" }}>
            <Image src={`${LEVEL_ASSETS}/card-glow.svg`} alt="" width={1199.49} height={1199.49} style={{ maxWidth: "none" }} />
        </Box>
    );
}

const POSTER = {
    hero: {
        radius: 14.142,
        border: 0.988,
        glass: "168.3deg",
        scrim: "linear-gradient(180deg, rgba(0,0,0,0.44) 0%, rgba(102,102,102,0) 100%)",
        fade: "linear-gradient(0.1945deg, #000 19.12%, rgba(0,0,0,0) 99.705%)",
        caption: { rule: 5.929, radius: 3.952, px: 7.905, py: 9.881, width: 347.816, dx: -10.19, dy: 1.13, size: 19.762, line: 29.643 },
        play: { src: `${MODULE_ASSETS}/play-100.svg`, size: 100, dx: -10, dy: 8.5 },
        highlight: "inset 0px 2.964px 5.929px 0px rgba(255,255,255,0.16)",
    },
    inline: {
        radius: 20,
        border: 1.397,
        glass: "174.68deg",
        scrim: "linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2))",
        fade: "linear-gradient(0.1424deg, #000 19.12%, rgba(0,0,0,0) 99.705%)",
        caption: { rule: 8.384, radius: 5.59, px: 11.179, py: 13.974, width: 491.878, dx: -13.71, dy: 0.7, size: 27.948, line: 41.921 },
        play: { src: `${MODULE_ASSETS}/play-89.svg`, size: 89.432, dx: -0.28, dy: -0.28 },
        highlight: "inset 0px 4.192px 8.384px 0px rgba(255,255,255,0.16)",
    },
} as const;

/**
 * Poster frame with the gold-ruled title card. Renders `children` (the live Stream player) instead of the
 * poster once playback has started.
 */
export function VideoPoster({
    poster,
    caption,
    variant,
    available,
    busy = false,
    message,
    onPlay,
    children,
}: {
    poster: string;
    caption: string;
    variant: keyof typeof POSTER;
    available: boolean;
    busy?: boolean;
    /** Replaces the "Video coming soon" hint (e.g. a playback error). */
    message?: string | null;
    onPlay?: () => void;
    children?: React.ReactNode;
}) {
    const p = POSTER[variant];
    const center = (dx: number, dy: number) => `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    const playable = available && Boolean(onPlay) && !busy;
    const hint = message ?? (available ? "" : "Video coming soon");

    return (
        <Box
            sx={{
                position: "relative",
                overflow: "hidden",
                isolation: "isolate",
                width: "100%",
                height: "100%",
                borderRadius: `${p.radius}px`,
                border: `${p.border}px solid rgba(255,255,255,0.88)`,
                backgroundImage: glassFill(p.glass),
                "&::after": { content: '""', position: "absolute", inset: 0, borderRadius: "inherit", boxShadow: p.highlight, pointerEvents: "none" },
            }}
        >
            {children ?? (
                <>
                    <Image
                        src={poster}
                        alt=""
                        fill
                        sizes="(max-width: 1200px) 100vw, 766px"
                        unoptimized={isRemoteSrc(poster)}
                        style={{ objectFit: "cover" }}
                        priority={variant === "hero"}
                    />
                    <Box sx={{ position: "absolute", inset: 0, backgroundImage: p.scrim }} />
                    <Box
                        sx={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform: center(p.caption.dx, p.caption.dy),
                            width: p.caption.width,
                            maxWidth: "calc(100% - 48px)",
                            px: `${p.caption.px}px`,
                            py: `${p.caption.py}px`,
                            borderRadius: `${p.caption.radius}px`,
                            borderLeft: `${p.caption.rule}px solid #F1C40E`,
                        }}
                    >
                        <Typography
                            sx={{
                                fontFamily: "var(--font-poppins), sans-serif",
                                fontWeight: 700,
                                fontSize: { xs: `${p.caption.size * 0.7}px`, sm: `${p.caption.size}px` },
                                lineHeight: { xs: `${p.caption.line * 0.7}px`, sm: `${p.caption.line}px` },
                                color: COLORS.white,
                            }}
                        >
                            {caption}
                        </Typography>
                    </Box>
                    <Box sx={{ position: "absolute", inset: 0, backgroundImage: p.fade }} />
                    {busy ? (
                        <Box sx={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
                            <CircularProgress size={44} sx={{ color: COLORS.white }} />
                        </Box>
                    ) : (
                        <Tooltip title={hint} placement="top">
                            <ButtonBase
                                aria-label={`Play ${caption}`}
                                aria-disabled={!playable}
                                onClick={() => playable && onPlay?.()}
                                sx={{
                                    position: "absolute",
                                    left: "50%",
                                    top: "50%",
                                    transform: center(p.play.dx, p.play.dy),
                                    width: p.play.size,
                                    height: p.play.size,
                                    borderRadius: "50%",
                                    opacity: playable ? 1 : 0.55,
                                    transition: "transform .2s ease",
                                    cursor: playable ? "pointer" : "default",
                                    "&:hover": playable ? { transform: `${center(p.play.dx, p.play.dy)} scale(1.06)` } : {},
                                    ...focusRing,
                                }}
                            >
                                <Image src={p.play.src} alt="" width={p.play.size} height={p.play.size} />
                            </ButtonBase>
                        </Tooltip>
                    )}
                    {message && (
                        <Typography
                            role="status"
                            sx={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                bottom: "16px",
                                px: "16px",
                                textAlign: "center",
                                ...TYPE.smallMed14,
                                color: COLORS.neutral100,
                            }}
                        >
                            {message}
                        </Typography>
                    )}
                </>
            )}
        </Box>
    );
}

function moduleStatus(module: ModuleView): string {
    const { completedLessons, totalLessons } = module.stats;
    if (totalLessons > 0 && completedLessons >= totalLessons) return "Module completed";
    const started = completedLessons > 0 || module.sections.some((s) => s.progress > 0);
    return started ? "Module in progress" : "Module not started";
}

/** Intro video poster that swaps to the signed Stream player when played. */
function IntroVideo({ module, loadIntro }: { module: ModuleView; loadIntro: () => Promise<StandardResponse<PlaybackInfo>> }) {
    const [playback, setPlayback] = useState<PlaybackInfo | null>(null);
    const [busy, setBusy] = useState(false);

    const play = async () => {
        setBusy(true);
        try {
            const res = await loadIntro();
            if (res.success && res.data) setPlayback(res.data);
            else toast.error(res.message ?? "Intro video is not available");
        } finally {
            setBusy(false);
        }
    };

    return (
        <VideoPoster
            poster={module.intro.posterUrl || module.thumbnailUrl || MODULE_HERO_POSTER}
            caption={module.title}
            variant="hero"
            available={module.intro.available}
            busy={busy}
            onPlay={play}
        >
            {playback ? <StreamPlayer playback={playback} title={`${module.title} — Introduction`} /> : undefined}
        </VideoPoster>
    );
}

export function ModuleHero({ module, loadIntro }: { module: ModuleView; loadIntro: () => Promise<StandardResponse<PlaybackInfo>> }) {
    return (
        <Box sx={{ position: "relative", display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: { xs: "24px", lg: "44px" }, alignItems: { lg: "stretch" } }}>
            <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "24px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <StatusPill label={moduleStatus(module)} size="md" color={COLORS.lessonDone} />
                    <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral300 }}>
                        Level {module.level.levelNo} · {module.level.title}
                    </Typography>
                </Box>
                <Typography
                    component="h1"
                    sx={{ ...TYPE.displayReg44, fontSize: { xs: "32px", sm: "44px" }, lineHeight: { xs: "48px", sm: "66px" }, color: COLORS.white, maxWidth: 520 }}
                >
                    {module.title}
                    {module.titleAccent && (
                        <Box component="span" sx={{ color: COLORS.purple }}>
                            {` ${module.titleAccent}`}
                        </Box>
                    )}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "27px" }}>
                    {module.description.map((paragraph, i) => (
                        <Typography key={i} sx={{ ...TYPE.largeMed18, fontSize: { xs: "16px", sm: "18px" }, color: COLORS.neutral100 }}>
                            {paragraph}
                        </Typography>
                    ))}
                </Box>
            </Box>
            <Box sx={{ width: { xs: "100%", lg: "min(650px, 48%)" }, flexShrink: 0, aspectRatio: { xs: "650 / 371", lg: "auto" }, minHeight: { lg: 320 } }}>
                <IntroVideo module={module} loadIntro={loadIntro} />
            </Box>
        </Box>
    );
}

export function ModuleStats({ module }: { module: ModuleView }) {
    const lead = module.instructors.find((i) => i.isLead) ?? module.instructors[0];
    const extra = Math.max(0, module.instructors.length - 1);
    const items: { label: string; value: React.ReactNode }[] = [
        { label: "Video Content", value: formatHoursMinutes(module.stats.videoDurationSec, true) },
        { label: "Hands on Activity", value: formatHoursMinutes(module.stats.activityDurationSec, true) },
        { label: "Points earned", value: `${module.stats.pointsEarned.toLocaleString("en-US")} XP` },
        {
            label: "Instructor",
            value: lead ? (
                <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <Box
                        component="span"
                        sx={{
                            position: "relative",
                            width: 24,
                            height: 24,
                            flexShrink: 0,
                            borderRadius: "50%",
                            overflow: "hidden",
                            border: "1.375px solid rgba(255,255,255,0.88)",
                            bgcolor: "#93A9E2",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            color: "#0A0A10",
                        }}
                    >
                        {lead.avatar ? (
                            <Image src={lead.avatar} alt="" fill sizes="24px" unoptimized={isRemoteSrc(lead.avatar)} style={{ objectFit: "cover" }} />
                        ) : (
                            lead.name.charAt(0).toUpperCase()
                        )}
                    </Box>
                    {lead.name}
                    {extra > 0 && (
                        <Tooltip title={module.instructors.slice(1).map((i) => i.name).join(", ")}>
                            <Box component="span" sx={{ ...TYPE.smallMed14, color: COLORS.milestoneBorder, textDecoration: "underline", cursor: "default" }}>
                                +{extra}
                            </Box>
                        </Tooltip>
                    )}
                </Box>
            ) : (
                "—"
            ),
        },
    ];

    return (
        <Box
            sx={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                gap: { xs: "4px", lg: "16px" },
                p: { xs: "8px", sm: "16px" },
                borderRadius: "12px",
                border: "1px solid rgba(64,64,64,0.5)",
                backgroundImage: "linear-gradient(172.85deg, rgba(140,36,255,0.08) 9.0161%, rgba(14,25,52,0.08) 89.867%)",
            }}
        >
            {items.map((item, i) => (
                <Box
                    key={item.label}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        pt: "8px",
                        pb: "12px",
                        px: { xs: "12px", sm: "24px" },
                        borderRight: { lg: i < items.length - 1 ? "1px solid rgba(242,242,242,0.12)" : "none" },
                        minWidth: 0,
                    }}
                >
                    <Typography sx={{ ...TYPE.mediumMed16, color: COLORS.neutral300, whiteSpace: "nowrap" }}>{item.label}</Typography>
                    <Typography component="div" sx={{ ...TYPE.largeMed18, color: COLORS.neutral100, whiteSpace: "nowrap" }}>
                        {item.value}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}

const KIND_ICON: Record<Exclude<ModuleLessonView["kind"], "theory">, { tile: string; button: string }> = {
    video: { tile: `${MODULE_ASSETS}/icon-video-28.svg`, button: `${LEVEL_ASSETS}/icon-play-16.svg` },
    quiz: { tile: `${MODULE_ASSETS}/icon-file-text-28.svg`, button: `${MODULE_ASSETS}/icon-file-text-16.svg` },
    lab: { tile: `${MODULE_ASSETS}/icon-flask-28.svg`, button: `${MODULE_ASSETS}/icon-flask-16.svg` },
};

function actionLabel(lesson: ModuleLessonView, expanded: boolean): string {
    switch (lesson.kind) {
        case "video": {
            if (expanded) return "Hide Video";
            if (lesson.completed) return "Restart Video";
            return (lesson.watched ?? 0) > 0 ? "Resume Video" : "Play Video";
        }
        case "quiz":
            return lesson.completed ? "Retake Quiz" : lesson.status === "in_progress" ? "Continue Quiz" : "Start Quiz";
        case "lab":
            return lesson.completed ? "Revisit Lab" : lesson.status === "in_progress" ? "Continue Lab" : "Start Lab";
        case "theory":
            if (expanded) return "Hide Theory";
            return lesson.completed ? "Read Again" : "Read Theory";
    }
}

function KindTile({ lesson }: { lesson: ModuleLessonView }) {
    return (
        <Box
            aria-hidden
            sx={{
                position: "relative",
                width: 48,
                height: 48,
                flexShrink: 0,
                overflow: "hidden",
                borderRadius: "4.364px",
                backgroundImage: "linear-gradient(180deg, rgba(191,191,191,0.16) 0%, rgba(89,89,89,0.08) 100%)",
                borderBottom: lesson.kind === "video" ? `2.182px solid ${COLORS.white}` : "none",
            }}
        >
            <Box sx={{ position: "absolute", left: 10, top: 10, width: 28, height: 28, lineHeight: 0 }}>
                {lesson.kind === "theory" ? (
                    <BookOpen size={28} strokeWidth={1.5} color={COLORS.white} />
                ) : (
                    <Image src={KIND_ICON[lesson.kind].tile} alt="" width={28} height={28} />
                )}
            </Box>
            {lesson.kind === "video" && (lesson.watched ?? 0) > 0 && (
                <Box sx={{ position: "absolute", left: 0, bottom: 0, height: 3, width: `${Math.min(100, lesson.watched ?? 0)}%`, bgcolor: COLORS.purple }} />
            )}
        </Box>
    );
}

function LessonMeta({ lesson }: { lesson: ModuleLessonView }) {
    const xpLabel = lesson.xpEarned > 0 && lesson.xpEarned < lesson.xp ? `${lesson.xpEarned}/${lesson.xp} XP` : `${lesson.xp} XP`;
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {lesson.durationSec > 0 && (
                <>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Image src={`${LEVEL_ASSETS}/icon-clock-16.svg`} alt="" width={16} height={16} />
                        <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral200, whiteSpace: "nowrap" }}>
                            {formatClockDuration(lesson.durationSec)}
                        </Typography>
                    </Box>
                    <Image src={`${LEVEL_ASSETS}/meta-dot.svg`} alt="" width={6} height={6} />
                </>
            )}
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Image src={`${LEVEL_ASSETS}/icon-zap-16.svg`} alt="" width={16} height={16} />
                <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral200, whiteSpace: "nowrap" }}>{xpLabel}</Typography>
            </Box>
            {!lesson.isMandatory && (
                <>
                    <Image src={`${LEVEL_ASSETS}/meta-dot.svg`} alt="" width={6} height={6} />
                    <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral300, whiteSpace: "nowrap" }}>Optional</Typography>
                </>
            )}
        </Box>
    );
}

function LessonRow({
    lesson,
    expanded,
    locked,
    inline,
    onAction,
}: {
    lesson: ModuleLessonView;
    expanded: boolean;
    locked: boolean;
    /** Video player / theory reader rendered under the row while expanded. */
    inline: React.ReactNode;
    onAction: () => void;
}) {
    const label = locked ? "Locked" : actionLabel(lesson, expanded);
    const narrowButton = lesson.kind === "quiz" || lesson.kind === "lab";

    return (
        <Box
            id={`lesson-${lesson.lessonId}`}
            sx={{
                ...framedPanelSx({ angle: "177.21deg", radius: 16, fill: LESSON_CARD_FILL }),
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                p: { xs: "16px", sm: "24px" },
                scrollMarginTop: "16px",
            }}
        >
            <Box sx={{ position: "relative", display: "flex", alignItems: "center", flexWrap: { xs: "wrap", sm: "nowrap" }, gap: { xs: "16px", sm: "24px" } }}>
                <Image
                    src={`${MODULE_ASSETS}/${lesson.completed ? "icon-check-teal-28.svg" : "icon-check-grey-28.svg"}`}
                    alt={lesson.completed ? "Completed" : "Not completed"}
                    width={28}
                    height={28}
                />
                <KindTile lesson={lesson} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: { xs: "calc(100% - 120px)", sm: 0 } }}>
                    <Typography sx={{ ...TYPE.largeMed18, fontSize: { xs: "16px", sm: "18px" }, color: COLORS.white }}>{lesson.title}</Typography>
                    <LessonMeta lesson={lesson} />
                </Box>
                <ButtonBase
                    onClick={onAction}
                    disabled={locked}
                    aria-expanded={lesson.kind === "video" || lesson.kind === "theory" ? expanded : undefined}
                    sx={{
                        flexShrink: 0,
                        ml: "auto",
                        minWidth: narrowButton ? 122 : undefined,
                        gap: "10px",
                        px: "12px",
                        py: "8px",
                        borderRadius: "8px",
                        border: `1px solid ${COLORS.outlineButton}`,
                        transition: "border-color .18s ease, background-color .18s ease",
                        "&:hover": { borderColor: COLORS.neutral300, bgcolor: "rgba(255,255,255,0.04)" },
                        "&.Mui-disabled": { opacity: 0.6, cursor: "not-allowed", pointerEvents: "auto" },
                        ...focusRing,
                    }}
                >
                    {locked ? (
                        <Image src={UI_ICONS.lock16} alt="" width={16} height={16} />
                    ) : lesson.kind === "theory" ? (
                        <BookOpen size={16} strokeWidth={1.5} color={COLORS.white} />
                    ) : (
                        <Image src={KIND_ICON[lesson.kind].button} alt="" width={16} height={16} />
                    )}
                    <Typography component="span" sx={{ ...TYPE.xsMed12, color: COLORS.white, whiteSpace: "nowrap" }}>
                        {label}
                    </Typography>
                </ButtonBase>
            </Box>

            {expanded && inline && (
                <>
                    <Box aria-hidden sx={{ position: "relative", height: "1px", lineHeight: 0 }}>
                        <Box component="img" src={`${MODULE_ASSETS}/divider-lesson.svg`} alt="" sx={{ display: "block", width: "100%", height: "1px", maxWidth: "none" }} />
                    </Box>
                    <Box sx={{ position: "relative" }}>{inline}</Box>
                </>
            )}
        </Box>
    );
}

export function ModuleSectionCard({
    section,
    expandedId,
    locked,
    onAction,
    renderInline,
}: {
    section: ModuleSectionView;
    expandedId: string | null;
    locked: boolean;
    onAction: (lesson: ModuleLessonView) => void;
    renderInline: (lesson: ModuleLessonView) => React.ReactNode;
}) {
    return (
        <Box
            component="section"
            aria-label={section.eyebrow ? `${section.eyebrow}: ${section.title}` : section.title}
            sx={{
                position: "relative",
                overflow: "hidden",
                display: "grid",
                gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(0, 790px)" },
                gap: "24px",
                alignItems: "flex-start",
                p: { xs: "16px", sm: "24px" },
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.88)",
                backgroundImage: LEVEL_CARD_FILL,
            }}
        >
            <CardGlow />

            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {section.eyebrow && (
                        <Typography noWrap sx={{ ...TYPE.mediumMed16, color: COLORS.neutral300, textTransform: "uppercase" }}>
                            {section.eyebrow}
                        </Typography>
                    )}
                    <Typography component="h2" sx={{ ...TYPE.headingSemibold20, color: COLORS.white }}>
                        {section.title}
                    </Typography>
                </Box>
                <LevelStatus progress={section.progress} locked={locked} />
            </Box>

            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
                {section.lessons.length === 0 && (
                    <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral300 }}>Lessons for this task are on their way.</Typography>
                )}
                {section.lessons.map((lesson) => {
                    const expanded = expandedId === lesson.lessonId;
                    return (
                        <LessonRow
                            key={lesson.lessonId}
                            lesson={lesson}
                            expanded={expanded}
                            locked={locked}
                            inline={expanded ? renderInline(lesson) : null}
                            onAction={() => onAction(lesson)}
                        />
                    );
                })}
            </Box>
        </Box>
    );
}

export { CardGlow as ModuleCardGlow };
