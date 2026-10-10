"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { COLORS, TYPE } from "@/components/courses/my-courses-theme";
import { EXAM_STATUS_LABEL, examAsset, type Exam } from "./exam-data";
import { CardOutlineButton, CardPrimaryButton, IncludeChip, RequestStatusPill, glassCardSx } from "./exam-ui";

/** Ticket-shaped exam card: purple splash cut with side notches, a title panel and an action panel. */
export default function ExamCard({ exam, onOpen }: { exam: Exam; onOpen: () => void }) {
    const ongoing = exam.status === "ongoing";

    return (
        <Box
            component="article"
            aria-label={exam.title}
            onClick={onOpen}
            sx={{
                position: "relative",
                height: 320,
                minWidth: 0,
                cursor: "pointer",
                transition: "transform .2s ease, filter .2s ease",
                "&:hover": { transform: "translateY(-2px)", filter: "brightness(1.06)" },
            }}
        >
            <Box
                component="img"
                src={examAsset("card-ticket.svg")}
                alt=""
                aria-hidden
                sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", maxWidth: "none", pointerEvents: "none" }}
            />

            <Box sx={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", gap: "21px", p: "4px", overflow: "hidden" }}>
                {/* Title panel */}
                <Box
                    sx={{
                        ...glassCardSx({ angle: "167.512deg", radius: 24 }),
                        flexShrink: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "24px",
                        p: "24px",
                    }}
                >
                    <Box
                        aria-hidden
                        sx={{
                            position: "absolute",
                            left: "119.17px",
                            top: "calc(50% - 8.68px)",
                            transform: "translateY(-50%)",
                            width: 529.575,
                            height: 537.857,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            pointerEvents: "none",
                        }}
                    >
                        <Box
                            component="img"
                            src={examAsset("card-dots.svg")}
                            alt=""
                            sx={{ flex: "none", display: "block", width: 441.634, height: 429.921, maxWidth: "none", transform: "rotate(75deg) scaleY(-1)" }}
                        />
                    </Box>

                    <Typography
                        component="h3"
                        sx={{
                            position: "relative",
                            ...TYPE.headingSemibold24,
                            color: COLORS.white,
                            height: 72,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            overflowWrap: "anywhere",
                        }}
                    >
                        {exam.title}
                    </Typography>

                    <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
                        <Typography noWrap sx={{ ...TYPE.xsReg12, color: COLORS.neutral100 }}>
                            Includes
                        </Typography>
                        <Box sx={{ display: "flex", gap: "12px", height: 37, overflow: "hidden" }}>
                            {exam.includes.map((item) => (
                                <IncludeChip key={item} label={item} />
                            ))}
                        </Box>
                    </Box>
                </Box>

                {/* Action panel */}
                <Box
                    sx={{
                        ...glassCardSx({ angle: "174.865deg", radius: 24 }),
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        p: "24px",
                    }}
                >
                    <RequestStatusPill tone={exam.status} label={EXAM_STATUS_LABEL[exam.status]} />
                    {ongoing ? (
                        <CardPrimaryButton
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpen();
                            }}
                        >
                            Start Exam
                        </CardPrimaryButton>
                    ) : (
                        <CardOutlineButton
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpen();
                            }}
                        >
                            View Details
                        </CardOutlineButton>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
