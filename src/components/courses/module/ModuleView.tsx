"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Box, ButtonBase, Tooltip, Typography } from "@mui/material";
import { BookOpen } from "lucide-react";
import { COLORS, COURSE_ASSETS, LESSON_CARD_FILL, LEVEL_CARD_FILL, TYPE, glassFill } from "../my-courses-theme";
import { StatusPill, framedPanelSx } from "../my-courses-ui";
import { LevelStatus } from "../CourseLevelsTab";
import { ContentBlocks } from "./activity-ui";
import { MODULE_ASSETS, sectionProgress, type CourseModule, type ModuleLesson, type ModuleSection, type ModuleVideo } from "./module-data";

const LEVEL_ASSETS = `${COURSE_ASSETS}/levels`;

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

/** Poster frame with the gold-ruled title card; swaps to a native player once a source exists and play is pressed. */
function VideoPoster({
    video,
    variant,
    onProgress,
}: {
    video: ModuleVideo;
    variant: keyof typeof POSTER;
    /** 0 - 100 playback progress. */
    onProgress?: (pct: number) => void;
}) {
    const p = POSTER[variant];
    const [playing, setPlaying] = useState(false);
    const center = (dx: number, dy: number) => `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

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
            {playing && video.src ? (
                <Box
                    component="video"
                    src={video.src}
                    poster={video.poster}
                    controls
                    autoPlay
                    onTimeUpdate={(e: React.SyntheticEvent<HTMLVideoElement>) => {
                        const el = e.currentTarget;
                        if (el.duration) onProgress?.(Math.round((el.currentTime / el.duration) * 100));
                    }}
                    onEnded={() => onProgress?.(100)}
                    sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", bgcolor: "#000" }}
                />
            ) : (
                <>
                    <Image src={video.poster} alt="" fill sizes="(max-width: 1200px) 100vw, 766px" style={{ objectFit: "cover" }} priority={variant === "hero"} />
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
                            {video.caption}
                        </Typography>
                    </Box>
                    <Box sx={{ position: "absolute", inset: 0, backgroundImage: p.fade }} />
                    <Tooltip title={video.src ? "" : "Video coming soon"} placement="top">
                        <ButtonBase
                            aria-label={`Play ${video.caption}`}
                            aria-disabled={!video.src}
                            onClick={() => video.src && setPlaying(true)}
                            sx={{
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                transform: center(p.play.dx, p.play.dy),
                                width: p.play.size,
                                height: p.play.size,
                                borderRadius: "50%",
                                transition: "transform .2s ease",
                                cursor: video.src ? "pointer" : "default",
                                "&:hover": video.src ? { transform: `${center(p.play.dx, p.play.dy)} scale(1.06)` } : {},
                                ...focusRing,
                            }}
                        >
                            <Image src={p.play.src} alt="" width={p.play.size} height={p.play.size} />
                        </ButtonBase>
                    </Tooltip>
                </>
            )}
        </Box>
    );
}

function moduleStatus(sections: ModuleSection[]): string {
    const lessons = sections.flatMap((s) => s.lessons);
    const done = lessons.filter((l) => l.completed).length;
    if (lessons.length > 0 && done === lessons.length) return "Module completed";
    if (done > 0 || lessons.some((l) => (l.watched ?? 0) > 0)) return "Module in progress";
    return "Module not started";
}

export function ModuleHero({ module, sections }: { module: CourseModule; sections: ModuleSection[] }) {
    return (
        <Box sx={{ position: "relative", display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: { xs: "24px", lg: "44px" }, alignItems: { lg: "stretch" } }}>
            <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "24px" }}>
                <StatusPill label={moduleStatus(sections)} size="md" color={COLORS.lessonDone} />
                <Typography
                    component="h1"
                    sx={{ ...TYPE.displayReg44, fontSize: { xs: "32px", sm: "44px" }, lineHeight: { xs: "48px", sm: "66px" }, color: COLORS.white, maxWidth: 406 }}
                >
                    {module.title}{" "}
                    <Box component="span" sx={{ color: COLORS.purple }}>
                        {module.titleAccent}
                    </Box>
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "27px" }}>
                    {module.description.map((paragraph) => (
                        <Typography key={paragraph} sx={{ ...TYPE.largeMed18, fontSize: { xs: "16px", sm: "18px" }, color: COLORS.neutral100 }}>
                            {paragraph}
                        </Typography>
                    ))}
                </Box>
            </Box>
            <Box sx={{ width: { xs: "100%", lg: "min(650px, 48%)" }, flexShrink: 0, aspectRatio: { xs: "650 / 371", lg: "auto" }, minHeight: { lg: 320 } }}>
                <VideoPoster video={module.intro} variant="hero" />
            </Box>
        </Box>
    );
}

export function ModuleStats({ module }: { module: CourseModule }) {
    const items: { label: string; value: React.ReactNode }[] = [
        { label: "Video Content", value: module.videoContent },
        { label: "Hands on Activity", value: module.handsOnActivity },
        { label: "Points earned", value: `${module.pointsEarned.toLocaleString("en-US")} XP` },
        {
            label: "Instructor",
            value: (
                <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <Box
                        component="span"
                        sx={{ position: "relative", width: 24, height: 24, flexShrink: 0, borderRadius: "50%", overflow: "hidden", border: "1.375px solid rgba(255,255,255,0.88)" }}
                    >
                        <Image src={module.instructor.avatar} alt="" fill sizes="24px" style={{ objectFit: "cover" }} />
                    </Box>
                    {module.instructor.name}
                    {module.extraInstructors > 0 && (
                        <Box component="span" sx={{ ...TYPE.smallMed14, color: COLORS.milestoneBorder, textDecoration: "underline" }}>
                            +{module.extraInstructors}
                        </Box>
                    )}
                </Box>
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

const KIND_ICON: Record<Exclude<ModuleLesson["kind"], "theory">, { tile: string; button: string }> = {
    video: { tile: `${MODULE_ASSETS}/icon-video-28.svg`, button: `${LEVEL_ASSETS}/icon-play-16.svg` },
    quiz: { tile: `${MODULE_ASSETS}/icon-file-text-28.svg`, button: `${MODULE_ASSETS}/icon-file-text-16.svg` },
    lab: { tile: `${MODULE_ASSETS}/icon-flask-28.svg`, button: `${MODULE_ASSETS}/icon-flask-16.svg` },
};

function actionLabel(lesson: ModuleLesson, expanded: boolean): string {
    switch (lesson.kind) {
        case "video": {
            const watched = lesson.watched ?? 0;
            if (watched >= 100) return "Restart Video";
            return watched > 0 ? "Resume Video" : "Play Video";
        }
        case "quiz":
            return lesson.completed ? "Retake Quiz" : "Start Quiz";
        case "lab":
            return lesson.completed ? "Revisit Lab" : "Start Lab";
        case "theory":
            if (expanded) return "Hide Theory";
            return lesson.completed ? "Read Again" : "Read Theory";
    }
}

function KindTile({ lesson }: { lesson: ModuleLesson }) {
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
        </Box>
    );
}

function LessonMeta({ lesson }: { lesson: ModuleLesson }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Image src={`${LEVEL_ASSETS}/icon-clock-16.svg`} alt="" width={16} height={16} />
                <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral200, whiteSpace: "nowrap" }}>{lesson.duration}</Typography>
            </Box>
            <Image src={`${LEVEL_ASSETS}/meta-dot.svg`} alt="" width={6} height={6} />
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Image src={`${LEVEL_ASSETS}/icon-zap-16.svg`} alt="" width={16} height={16} />
                <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral200, whiteSpace: "nowrap" }}>{lesson.xp} XP</Typography>
            </Box>
        </Box>
    );
}

function LessonRow({
    lesson,
    expanded,
    onAction,
    onProgress,
}: {
    lesson: ModuleLesson;
    expanded: boolean;
    onAction: () => void;
    onProgress: (pct: number) => void;
}) {
    const inline = expanded && ((lesson.kind === "video" && lesson.video) || (lesson.kind === "theory" && lesson.theory));
    const label = actionLabel(lesson, expanded);
    const narrowButton = lesson.kind === "quiz" || lesson.kind === "lab";

    return (
        <Box
            sx={{
                ...framedPanelSx({ angle: "177.21deg", radius: 16, fill: LESSON_CARD_FILL }),
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                p: { xs: "16px", sm: "24px" },
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
                        ...focusRing,
                    }}
                >
                    {lesson.kind === "theory" ? (
                        <BookOpen size={16} strokeWidth={1.5} color={COLORS.white} />
                    ) : (
                        <Image src={KIND_ICON[lesson.kind].button} alt="" width={16} height={16} />
                    )}
                    <Typography component="span" sx={{ ...TYPE.xsMed12, color: COLORS.white, whiteSpace: "nowrap" }}>
                        {label}
                    </Typography>
                </ButtonBase>
            </Box>

            {inline && (
                <>
                    <Box aria-hidden sx={{ position: "relative", height: "1px", lineHeight: 0 }}>
                        <Box component="img" src={`${MODULE_ASSETS}/divider-lesson.svg`} alt="" sx={{ display: "block", width: "100%", height: "1px", maxWidth: "none" }} />
                    </Box>
                    {lesson.kind === "video" && lesson.video ? (
                        <Box sx={{ position: "relative", height: { xs: 200, sm: 320 } }}>
                            <VideoPoster video={lesson.video} variant="inline" onProgress={onProgress} />
                        </Box>
                    ) : (
                        <Box sx={{ position: "relative" }}>
                            <ContentBlocks blocks={lesson.theory ?? []} />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}

export function ModuleSectionCard({
    section,
    expandedId,
    onAction,
    onProgress,
}: {
    section: ModuleSection;
    expandedId: string | null;
    onAction: (lesson: ModuleLesson) => void;
    onProgress: (lesson: ModuleLesson, pct: number) => void;
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
                <LevelStatus progress={sectionProgress(section.lessons)} />
            </Box>

            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
                {section.lessons.map((lesson) => (
                    <LessonRow
                        key={lesson.lessonId}
                        lesson={lesson}
                        expanded={expandedId === lesson.lessonId}
                        onAction={() => onAction(lesson)}
                        onProgress={(pct) => onProgress(lesson, pct)}
                    />
                ))}
            </Box>
        </Box>
    );
}

export { CardGlow as ModuleCardGlow };
