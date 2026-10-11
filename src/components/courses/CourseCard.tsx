"use client";

import React from "react";
import Image from "next/image";
import { Box, ButtonBase, Typography } from "@mui/material";
import type { MyCourseCard } from "@/contexts/CourseContext";
import { courseEmblem, isRemoteSrc } from "./course-format";
import {
    COLORS,
    COURSE_THEMES,
    INSET_HIGHLIGHT,
    LOCKED_BUTTON_FILL,
    MY_COURSES_ASSETS,
    TYPE,
    UI_ICONS,
    glassFill,
} from "./my-courses-theme";
import { FadeDivider, StatChip, missionStats } from "./my-courses-ui";

interface Props {
    course: MyCourseCard;
    onClick: () => void;
}

function actionLabel(course: MyCourseCard): string {
    switch (course.status) {
        case "Locked":
            return "Mission Locked";
        case "Upcoming":
            return "Coming Soon";
        case "Completed":
            return "Review Mission";
        default:
            return course.progress > 0 ? "Continue Mission" : "Start Mission";
    }
}

export default function CourseCard({ course, onClick }: Props) {
    const theme = COURSE_THEMES[course.theme] ?? COURSE_THEMES.violet;
    const locked = course.status === "Locked" || course.status === "Upcoming";
    const stats = missionStats(course, "card");
    const emblem = courseEmblem(course);

    return (
        <Box
            onClick={onClick}
            sx={{
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                pt: "12px",
                px: "8px",
                pb: "8px",
                borderRadius: "20px",
                border: `1px solid ${theme.border}`,
                backgroundImage: glassFill("165.69deg"),
                backdropFilter: "blur(12px)",
                cursor: "pointer",
                transition: "transform .18s ease, box-shadow .18s ease",
                "&:hover": { transform: "translateY(-2px)", boxShadow: `0 16px 36px -20px ${theme.border}` },
                "&::after": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    borderRadius: "inherit",
                    boxShadow: INSET_HIGHLIGHT,
                    pointerEvents: "none",
                    zIndex: 3,
                },
            }}
        >
            {/* Hero key art */}
            <Box
                sx={{
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    pt: "16px",
                    px: "16px",
                    pb: "76px",
                    borderRadius: "16px",
                    background: `url(${theme.art}) center / 100% 100% no-repeat, ${theme.fallback}`,
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", width: "100%", minWidth: 0 }}>
                    <Typography component="h3" noWrap title={course.title} sx={{ ...TYPE.missionTitle20, color: COLORS.white, maxWidth: "calc(100% - 84px)" }}>
                        {course.title}
                    </Typography>
                    <Typography noWrap sx={{ ...TYPE.xsMed12, color: COLORS.neutral200, maxWidth: "calc(100% - 64px)" }}>
                        {course.tagline ?? ""}
                    </Typography>
                </Box>

                <FadeDivider variant="card" />

                <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Typography noWrap sx={{ ...TYPE.xxsReg11, color: COLORS.neutral300 }}>
                        Mission Includes :
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {stats.map((stat) => (
                            <StatChip key={stat.key} stat={stat} size="sm" />
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* Mission emblem */}
            <Box
                sx={{
                    position: "absolute",
                    top: "7px",
                    right: "15.75px",
                    width: 87,
                    height: 96,
                    pointerEvents: "none",
                    zIndex: 2,
                }}
            >
                <Image src={emblem} alt="" fill sizes="87px" unoptimized={isRemoteSrc(emblem)} style={{ objectFit: "cover" }} />
            </Box>

            {/* Action strip */}
            <Box sx={{ position: "absolute", left: "8px", right: "8px", bottom: "-1px", height: 74, zIndex: 1 }}>
                <Box sx={{ position: "absolute", left: "-1px", top: "-0.725px", width: "calc(100% + 2px)", lineHeight: 0 }}>
                    <Image
                        src={`${MY_COURSES_ASSETS}/ui/strip-card.svg`}
                        alt=""
                        width={368}
                        height={75.7284}
                        style={{ width: "100%", height: 75.7284 }}
                    />
                </Box>

                <ButtonBase
                    aria-disabled={locked}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick();
                    }}
                    sx={{
                        position: "absolute",
                        top: "22px",
                        left: "calc(50% - 0.5px)",
                        transform: "translateX(-50%)",
                        height: 36,
                        gap: "12px",
                        px: "17px",
                        py: "1px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.88)",
                        backdropFilter: "blur(12px)",
                        boxShadow: INSET_HIGHLIGHT,
                        overflow: "hidden",
                        transition: "border-color .18s ease",
                        "&::before": {
                            content: '""',
                            position: "absolute",
                            inset: 0,
                            backgroundImage: LOCKED_BUTTON_FILL,
                            opacity: 0.44,
                            pointerEvents: "none",
                        },
                        "&:hover": { borderColor: COLORS.white },
                        "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" },
                    }}
                >
                    <Box sx={{ position: "relative", width: 16, height: 16, flexShrink: 0, lineHeight: 0 }}>
                        <Image src={course.status === "Upcoming" ? UI_ICONS.clock14 : locked ? UI_ICONS.lock16 : UI_ICONS.play18} alt="" width={16} height={16} />
                    </Box>
                    <Typography
                        component="span"
                        sx={{ ...TYPE.smallMed14, position: "relative", color: COLORS.neutral75, whiteSpace: "nowrap" }}
                    >
                        {actionLabel(course)}
                    </Typography>
                </ButtonBase>
            </Box>
        </Box>
    );
}
