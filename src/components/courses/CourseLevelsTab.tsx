"use client";

import React from "react";
import Image from "next/image";
import { Box, ButtonBase, Typography } from "@mui/material";
import type { LevelCardView, LevelView } from "@/contexts/CourseContext";
import { LESSON_THUMBS, formatLessonDuration, isRemoteSrc } from "./course-format";
import { COLORS, COURSE_ASSETS, LESSON_CARD_FILL, LEVEL_CARD_FILL, TYPE, UI_ICONS } from "./my-courses-theme";
import { framedPanelSx } from "./my-courses-ui";

const ASSETS = `${COURSE_ASSETS}/levels`;

const KIND_LABEL: Record<LevelCardView["kind"], string | null> = {
    module: null,
    video: "Video",
    reading: "Reading",
    quiz: "Knowledge Check",
    lab: "Lab",
};

function LessonThumb({ card, index }: { card: LevelCardView; index: number }) {
    const fallback = LESSON_THUMBS[index % LESSON_THUMBS.length];
    const src = card.thumbnailUrl || fallback.src;
    const watched = card.kind === "video" && card.watched !== null && card.watched > 0 ? card.watched : null;
    return (
        <Box
            sx={{
                position: "relative",
                width: 86,
                height: 64,
                flexShrink: 0,
                overflow: "hidden",
                borderRadius: "7.314px",
                border: `0.61px solid ${COLORS.neutral75}`,
                bgcolor: COLORS.white,
            }}
        >
            <Box sx={{ position: "absolute", left: "-19px", top: "-18px", width: 106, height: 82, pointerEvents: "none" }}>
                <Image src={src} alt="" fill sizes="106px" unoptimized={isRemoteSrc(src)} style={{ objectFit: "cover" }} />
                <Box sx={{ position: "absolute", inset: 0, background: card.thumbnailUrl ? "rgba(0,0,0,0.2)" : fallback.overlay }} />
            </Box>

            {watched !== null ? (
                <Box
                    sx={{
                        position: "absolute",
                        left: "4px",
                        top: "52px",
                        width: `max(6px, ${(78 * Math.min(100, watched)) / 100}px)`,
                        height: 6,
                        borderRadius: "99px",
                        border: "0.6px solid rgba(140,140,140,0.5)",
                        bgcolor: COLORS.white,
                        boxShadow: "0px 4px 4px 0px rgba(255,255,255,0.12)",
                    }}
                />
            ) : (
                <Box sx={{ position: "absolute", left: "30px", top: "19px", lineHeight: 0 }}>
                    <Image src={`${ASSETS}/thumb-play.svg`} alt="" width={26} height={26} />
                </Box>
            )}
        </Box>
    );
}

function MetaItem({ icon, label, color = COLORS.neutral200, flip }: { icon: string; label: string; color?: string; flip?: boolean }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <Image src={icon} alt="" width={16} height={16} style={flip ? { transform: "scaleX(-1)" } : undefined} />
            <Typography sx={{ ...TYPE.smallMed14, color, whiteSpace: "pre" }}>{label}</Typography>
        </Box>
    );
}

function LessonMeta({ card }: { card: LevelCardView }) {
    const items: React.ReactNode[] = [];
    const kind = KIND_LABEL[card.kind];
    if (kind) items.push(<MetaItem key="kind" icon={`${ASSETS}/icon-clipboard-16.svg`} label={kind} color={COLORS.neutral300} />);
    if (card.tasks > 0) items.push(<MetaItem key="tasks" icon={`${ASSETS}/icon-clipboard-16.svg`} label={`${card.tasks} Tasks`} />);
    if (card.durationSec > 0) items.push(<MetaItem key="time" icon={`${ASSETS}/icon-clock-16.svg`} label={formatLessonDuration(card.durationSec)} />);
    items.push(<MetaItem key="xp" icon={`${ASSETS}/icon-zap-16.svg`} label={`${card.xp} XP`} />);
    if (card.instructor) {
        const extra = card.extraInstructors > 0 ? `  +${card.extraInstructors}` : "";
        items.push(<MetaItem key="by" icon={`${ASSETS}/icon-user-16.svg`} label={`${card.instructor}${extra}`} color={COLORS.neutral300} flip />);
    }
    if (card.completed) {
        items.push(<MetaItem key="done" icon={`${ASSETS}/icon-check-circle-16.svg`} label="Completed" color={COLORS.lessonDone} />);
    } else if (card.progress > 0 && card.kind !== "video") {
        items.push(<MetaItem key="progress" icon={`${ASSETS}/icon-clock-16.svg`} label={`${Math.round(card.progress)}% done`} color={COLORS.purple} />);
    }

    return (
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", columnGap: "8px", rowGap: "4px" }}>
            {items.map((item, i) => (
                <React.Fragment key={i}>
                    {i > 0 && <Image src={`${ASSETS}/meta-dot.svg`} alt="" width={6} height={6} />}
                    {item}
                </React.Fragment>
            ))}
        </Box>
    );
}

function actionLabel(card: LevelCardView): string {
    const started = card.progress > 0 || (card.watched ?? 0) > 0;
    switch (card.kind) {
        case "video":
            return card.completed ? "Restart Video" : started ? "Resume Video" : "Play Video";
        case "reading":
            return card.completed ? "Read Again" : "Read Theory";
        case "quiz":
            return card.completed ? "Retake Quiz" : "Start Quiz";
        case "lab":
            return card.completed ? "Revisit Lab" : "Start Lab";
        default:
            return card.completed ? "Review Module" : started ? "Continue" : "View Details";
    }
}

function LessonRow({ card, index, locked, onOpen }: { card: LevelCardView; index: number; locked: boolean; onOpen: () => void }) {
    return (
        <Box
            sx={{
                ...framedPanelSx({ angle: "177.1deg", radius: 16, fill: LESSON_CARD_FILL }),
                display: "flex",
                alignItems: "center",
                flexWrap: { xs: "wrap", sm: "nowrap" },
                gap: { xs: "16px", sm: "24px" },
                p: { xs: "16px", sm: "24px" },
                opacity: locked ? 0.6 : 1,
            }}
        >
            <LessonThumb card={card} index={index} />

            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: { xs: "calc(100% - 102px)", sm: 0 } }}>
                <Typography sx={{ ...TYPE.largeMed18, color: COLORS.white }}>
                    {card.title}
                    {card.titleAccent && (
                        <Box component="span" sx={{ color: COLORS.purple }}>
                            {` ${card.titleAccent}`}
                        </Box>
                    )}
                </Typography>
                <LessonMeta card={card} />
            </Box>

            <ButtonBase
                onClick={onOpen}
                disabled={locked}
                sx={{
                    position: "relative",
                    flexShrink: 0,
                    ml: "auto",
                    gap: "10px",
                    px: "12px",
                    py: "8px",
                    borderRadius: "8px",
                    border: `1px solid ${COLORS.outlineButton}`,
                    transition: "border-color .18s ease, background-color .18s ease",
                    "&:hover": { borderColor: COLORS.neutral300, bgcolor: "rgba(255,255,255,0.04)" },
                    "&.Mui-disabled": { cursor: "not-allowed", pointerEvents: "auto" },
                    "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" },
                }}
            >
                {locked ? (
                    <Image src={UI_ICONS.lock16} alt="" width={16} height={16} />
                ) : (
                    card.completed && <Image src={`${ASSETS}/icon-play-16.svg`} alt="" width={16} height={16} />
                )}
                <Typography component="span" sx={{ ...TYPE.xsMed12, color: COLORS.white, whiteSpace: "nowrap" }}>
                    {locked ? "Locked" : actionLabel(card)}
                </Typography>
                {!locked && !card.completed && <Image src={`${ASSETS}/icon-arrow-right-16.svg`} alt="" width={16} height={16} />}
            </ButtonBase>
        </Box>
    );
}

export function LevelStatus({ progress, locked = false }: { progress: number; locked?: boolean }) {
    const done = progress >= 100;
    const started = progress > 0;
    if (locked) {
        return (
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Box sx={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Image src={UI_ICONS.lock16} alt="" width={20} height={20} />
                </Box>
                <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral400, whiteSpace: "nowrap" }}>Locked</Typography>
            </Box>
        );
    }
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Image
                src={`${ASSETS}/${done ? "status-completed" : "status-progress"}.svg`}
                alt=""
                width={32}
                height={32}
                style={done || started ? undefined : { filter: "grayscale(1)", opacity: 0.5 }}
            />
            <Typography
                sx={{
                    ...TYPE.smallMed14,
                    color: done ? COLORS.levelDone : started ? COLORS.purple : COLORS.neutral400,
                    whiteSpace: "nowrap",
                }}
            >
                {done ? "Completed" : started ? `${Math.round(progress)} % Completed` : "Not Started"}
            </Typography>
        </Box>
    );
}

function LevelCard({ level, onOpen }: { level: LevelView; onOpen: (card: LevelCardView) => void }) {
    return (
        <Box
            component="section"
            id={`level-${level.levelNo}`}
            aria-label={`Level ${level.levelNo}: ${level.title}`}
            sx={{
                position: "relative",
                scrollMarginTop: "16px",
                overflow: "hidden",
                display: "grid",
                gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(0, 816px)" },
                gap: "24px",
                alignItems: "flex-start",
                p: { xs: "16px", sm: "24px" },
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.88)",
                backgroundImage: LEVEL_CARD_FILL,
            }}
        >
            {/* Violet haze bleeding in from above the card */}
            <Box aria-hidden sx={{ position: "absolute", left: "-59.17px", top: "-782.18px", lineHeight: 0, pointerEvents: "none" }}>
                <Image src={`${ASSETS}/card-glow.svg`} alt="" width={1199.49} height={1199.49} style={{ maxWidth: "none" }} />
            </Box>

            <Box sx={{ position: { xs: "relative", lg: "sticky" }, top: 0, display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Typography noWrap sx={{ ...TYPE.mediumMed16, color: COLORS.neutral300, textTransform: "uppercase" }}>
                        Level {level.levelNo}
                    </Typography>
                    <Typography component="h2" sx={{ ...TYPE.headingSemibold20, color: COLORS.white }}>
                        {level.title}
                    </Typography>
                    {level.description && <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral300 }}>{level.description}</Typography>}
                </Box>
                <LevelStatus progress={level.completed ? 100 : level.progress} locked={level.isLocked} />
                {level.isLocked && (
                    <Typography sx={{ ...TYPE.xsMed12, color: COLORS.neutral300 }}>Complete the previous level to unlock this one.</Typography>
                )}
            </Box>

            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
                {level.lessons.length === 0 && (
                    <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral300 }}>Lessons for this level are on their way.</Typography>
                )}
                {level.lessons.map((card, i) => (
                    <LessonRow key={card.moduleId} card={card} index={level.levelNo + i} locked={level.isLocked} onOpen={() => onOpen(card)} />
                ))}
            </Box>
        </Box>
    );
}

export default function CourseLevelsTab({ levels, onOpen }: { levels: LevelView[]; onOpen: (card: LevelCardView) => void }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {levels.map((level) => (
                <LevelCard key={level.levelId} level={level} onOpen={onOpen} />
            ))}
        </Box>
    );
}
