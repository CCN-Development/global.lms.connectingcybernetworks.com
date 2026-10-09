"use client";

import React from "react";
import Image from "next/image";
import { Box, ButtonBase, Typography } from "@mui/material";
import { courseStatusBadge, type Course } from "./course-data";
import {
    ACTIVE_PILL_FILL,
    COLORS,
    COURSE_THEMES,
    INSET_HIGHLIGHT,
    MY_COURSES_ASSETS,
    PRIMARY_BUTTON_FILL,
    TYPE,
    UI_ICONS,
    glassFill,
} from "./my-courses-theme";
import { FadeDivider, ProgressTrack, StatChip, missionStats } from "./my-courses-ui";

interface Props {
    course: Course;
    onStart: () => void;
    onOpen: () => void;
}

export default function ActiveMissionBanner({ course, onStart, onOpen }: Props) {
    const theme = COURSE_THEMES[course.theme];
    const stats = missionStats(course, "banner");

    return (
        <Box
            onClick={onOpen}
            sx={{
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                pt: "12px",
                px: "8px",
                pb: "8px",
                borderRadius: "20px",
                border: `1px solid ${theme.border}`,
                backgroundImage: glassFill("171.63deg"),
                backdropFilter: "blur(12px)",
                cursor: "pointer",
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
                    gap: "16px",
                    minHeight: 306,
                    p: { xs: "16px", sm: "24px" },
                    pb: { xs: "96px", sm: "87px" },
                    borderRadius: "16px",
                    background: `url(${theme.art}) center / 100% 100% no-repeat, ${theme.fallback}`,
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
                    <Box
                        sx={{
                            display: "inline-flex",
                            px: "12px",
                            py: "4px",
                            borderRadius: "32px",
                            border: `1px solid ${COLORS.white}`,
                            backgroundImage: ACTIVE_PILL_FILL,
                            backdropFilter: "blur(4px)",
                        }}
                    >
                        <Typography sx={{ ...TYPE.xsMed12, color: COLORS.white, whiteSpace: "nowrap" }}>
                            {courseStatusBadge(course.status).label}
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", width: "100%", minWidth: 0 }}>
                        <Typography
                            component="h2"
                            sx={{
                                ...TYPE.missionTitle24,
                                fontSize: { xs: "20px", sm: "24px" },
                                color: COLORS.white,
                                maxWidth: { sm: "calc(100% - 200px)" },
                            }}
                        >
                            {course.title}
                        </Typography>
                        <Typography noWrap sx={{ ...TYPE.smallMed14, color: COLORS.neutral200 }}>
                            {course.tagline}
                        </Typography>
                    </Box>
                </Box>

                <FadeDivider variant="banner" />

                <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Typography noWrap sx={{ ...TYPE.xsMed12, color: COLORS.neutral300 }}>
                        Quick Insights :
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {stats.map((stat) => (
                            <StatChip key={stat.key} stat={stat} size="md" />
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* Mission emblem */}
            <Box
                sx={{
                    position: "absolute",
                    top: "5px",
                    right: "32px",
                    width: 182,
                    height: 201,
                    display: { xs: "none", sm: "block" },
                    filter: "drop-shadow(0px 4px 24px rgba(0,0,0,0.5))",
                    pointerEvents: "none",
                    zIndex: 2,
                }}
            >
                <Image src={course.emblem} alt="" fill sizes="182px" style={{ objectFit: "cover" }} priority />
            </Box>

            {/* Continue strip */}
            <Box sx={{ position: "absolute", left: "8px", right: "8px", bottom: "-1px", height: 81, zIndex: 1 }}>
                <Box sx={{ position: "absolute", left: "-1px", top: "-0.87px", width: "calc(100% + 2px)", lineHeight: 0 }}>
                    <Image
                        src={`${MY_COURSES_ASSETS}/ui/strip-banner.svg`}
                        alt=""
                        width={793}
                        height={82.8632}
                        style={{ width: "100%", height: 82.8632 }}
                    />
                </Box>

                <Box
                    sx={{
                        position: "absolute",
                        top: "19px",
                        left: { xs: "16px", sm: "24px" },
                        right: { xs: "16px", sm: "24px" },
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "16px",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: "12px", mt: "1px", minWidth: 0 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                flexShrink: 0,
                                display: { xs: "none", sm: "flex" },
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "6px",
                                border: `1px solid ${COLORS.neutral200}`,
                                bgcolor: "rgba(0,0,0,0.12)",
                                backdropFilter: "blur(15px)",
                            }}
                        >
                            <Image src={UI_ICONS.layers20} alt="" width={20} height={20} />
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
                            <Typography noWrap sx={{ ...TYPE.smallMed14, color: COLORS.neutral75 }}>
                                {course.currentLevelLabel}
                            </Typography>
                            <ProgressTrack value={course.progress} fill={COLORS.neutral200} minFill={3} width={284} />
                        </Box>
                    </Box>

                    <ButtonBase
                        onClick={(e) => {
                            e.stopPropagation();
                            onStart();
                        }}
                        sx={{
                            position: "relative",
                            flexShrink: 0,
                            height: 40,
                            gap: "12px",
                            p: "16px",
                            borderRadius: "10px",
                            backgroundImage: PRIMARY_BUTTON_FILL,
                            filter: "drop-shadow(0px 0px 4px rgba(255,255,255,0.12))",
                            transition: "filter .18s ease",
                            "&:hover": { filter: "drop-shadow(0px 0px 10px rgba(140,36,255,0.55))" },
                            "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" },
                        }}
                    >
                        <Image src={UI_ICONS.play18} alt="" width={18} height={18} />
                        <Typography component="span" sx={{ ...TYPE.buttonMed14, color: COLORS.white, whiteSpace: "nowrap" }}>
                            {course.progress > 0 ? "Continue Learning" : "Start Learning"}
                        </Typography>
                        <Box
                            sx={{
                                position: "absolute",
                                top: "-3px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                lineHeight: 0,
                                pointerEvents: "none",
                            }}
                        >
                            <Image
                                src={`${MY_COURSES_ASSETS}/ui/button-highlight.svg`}
                                alt=""
                                width={158}
                                height={23}
                                style={{ maxWidth: "none" }}
                            />
                        </Box>
                    </ButtonBase>
                </Box>
            </Box>
        </Box>
    );
}
