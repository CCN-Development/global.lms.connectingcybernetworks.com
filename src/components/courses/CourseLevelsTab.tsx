"use client";

import React from "react";
import Image from "next/image";
import { Box, ButtonBase, Typography } from "@mui/material";
import { LESSON_THUMBS, type Course, type CourseLesson, type CourseLevel } from "./course-data";
import { COLORS, COURSE_ASSETS, LESSON_CARD_FILL, LEVEL_CARD_FILL, TYPE } from "./my-courses-theme";
import { framedPanelSx } from "./my-courses-ui";

const ASSETS = `${COURSE_ASSETS}/levels`;

function LessonThumb({ lesson }: { lesson: CourseLesson }) {
    const art = LESSON_THUMBS[lesson.art % LESSON_THUMBS.length];
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
                <Image src={art.src} alt="" fill sizes="106px" style={{ objectFit: "cover" }} />
                <Box sx={{ position: "absolute", inset: 0, background: art.overlay }} />
            </Box>

            {lesson.watched !== undefined ? (
                <Box
                    sx={{
                        position: "absolute",
                        left: "4px",
                        top: "52px",
                        width: `max(6px, ${(78 * Math.min(100, Math.max(0, lesson.watched))) / 100}px)`,
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

function LessonMeta({ lesson }: { lesson: CourseLesson }) {
    const items: React.ReactNode[] = [];
    if (lesson.tasks > 0) items.push(<MetaItem key="tasks" icon={`${ASSETS}/icon-clipboard-16.svg`} label={`${lesson.tasks} Tasks`} />);
    items.push(<MetaItem key="time" icon={`${ASSETS}/icon-clock-16.svg`} label={lesson.duration} />);
    items.push(<MetaItem key="xp" icon={`${ASSETS}/icon-zap-16.svg`} label={`${lesson.xp} XP`} />);
    if (lesson.instructor) {
        const extra = lesson.extraInstructors > 0 ? `  +${lesson.extraInstructors}` : "";
        items.push(
            <MetaItem key="by" icon={`${ASSETS}/icon-user-16.svg`} label={`${lesson.instructor}${extra}`} color={COLORS.neutral300} flip />,
        );
    }
    // A finished watch bar on the thumbnail already says "completed".
    if (lesson.completed && lesson.watched === undefined) {
        items.push(<MetaItem key="done" icon={`${ASSETS}/icon-check-circle-16.svg`} label="Completed" color={COLORS.lessonDone} />);
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

function LessonRow({ lesson, onOpen }: { lesson: CourseLesson; onOpen: () => void }) {
    return (
        <Box
            sx={{
                ...framedPanelSx({ angle: "177.1deg", radius: 16, fill: LESSON_CARD_FILL }),
                display: "flex",
                alignItems: "center",
                flexWrap: { xs: "wrap", sm: "nowrap" },
                gap: { xs: "16px", sm: "24px" },
                p: { xs: "16px", sm: "24px" },
            }}
        >
            <LessonThumb lesson={lesson} />

            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: { xs: "calc(100% - 102px)", sm: 0 } }}>
                <Typography sx={{ ...TYPE.largeMed18, color: COLORS.white }}>{lesson.title}</Typography>
                <LessonMeta lesson={lesson} />
            </Box>

            <ButtonBase
                onClick={onOpen}
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
                    "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" },
                }}
            >
                {lesson.completed && <Image src={`${ASSETS}/icon-play-16.svg`} alt="" width={16} height={16} />}
                <Typography component="span" sx={{ ...TYPE.xsMed12, color: COLORS.white, whiteSpace: "nowrap" }}>
                    {lesson.completed ? "Restart Video" : "View Details"}
                </Typography>
                {!lesson.completed && <Image src={`${ASSETS}/icon-arrow-right-16.svg`} alt="" width={16} height={16} />}
            </ButtonBase>
        </Box>
    );
}

function LevelStatus({ progress }: { progress: number }) {
    const done = progress >= 100;
    const started = progress > 0;
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
                {done ? "Completed" : started ? `${progress} % Completed` : "Not Started"}
            </Typography>
        </Box>
    );
}

function LevelCard({ level, onOpenLesson }: { level: CourseLevel; onOpenLesson: (lesson: CourseLesson) => void }) {
    return (
        <Box
            component="section"
            aria-label={`Level ${level.levelNo}: ${level.title}`}
            sx={{
                position: "relative",
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
                </Box>
                <LevelStatus progress={level.progress} />
            </Box>

            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
                {level.lessons.map((lesson) => (
                    <LessonRow key={lesson.lessonId} lesson={lesson} onOpen={() => onOpenLesson(lesson)} />
                ))}
            </Box>
        </Box>
    );
}

export default function CourseLevelsTab({ course, onOpenLesson }: { course: Course; onOpenLesson: (lesson: CourseLesson) => void }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {course.levels.map((level) => (
                <LevelCard key={level.levelId} level={level} onOpenLesson={onOpenLesson} />
            ))}
        </Box>
    );
}
