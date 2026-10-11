"use client";

import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { useCourse, type ContentBlock, type ModuleLessonView } from "@/contexts/CourseContext";
import { announceRewards } from "../course-format";
import { COLORS, TYPE } from "../my-courses-theme";
import { PrimaryButton } from "../my-courses-ui";
import { ContentBlocks } from "./activity-ui";

/** Reading lesson: renders the theory blocks and lets the learner mark it as read (awards the lesson XP). */
export default function TheoryPanel({ lesson }: { lesson: ModuleLessonView }) {
    const { getLesson, completeLesson } = useCourse();
    const [blocks, setBlocks] = useState<ContentBlock[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        let cancelled = false;
        // Opening the lesson also starts its progress (and "continue learning") on the server.
        getLesson(lesson.lessonId).then((res) => {
            if (cancelled) return;
            if (res.success && res.data) setBlocks(res.data.theory ?? []);
            else setError(res.message ?? "Failed to open the lesson");
        });
        return () => {
            cancelled = true;
        };
    }, [lesson.lessonId, getLesson]);

    const markRead = async () => {
        setCompleting(true);
        try {
            const res = await completeLesson(lesson.lessonId);
            if (!res.success || !res.data) {
                toast.error(res.message ?? "Failed to complete the lesson");
                return;
            }
            if (res.data.xpAwarded > 0) announceRewards(res.data, res.data.xpAwarded);
            else {
                toast.success("Lesson marked as read");
                announceRewards(res.data);
            }
        } finally {
            setCompleting(false);
        }
    };

    if (error) return <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral200 }}>{error}</Typography>;
    if (!blocks) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: "24px" }}>
                <CircularProgress size={28} sx={{ color: COLORS.purple }} />
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {blocks.length ? (
                <ContentBlocks blocks={blocks} />
            ) : (
                <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral300 }}>This reading has no content yet.</Typography>
            )}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "16px", flexWrap: "wrap" }}>
                {lesson.completed ? (
                    <Typography sx={{ ...TYPE.smallMed14, color: COLORS.lessonDone }}>
                        Completed{lesson.xpEarned > 0 ? ` · +${lesson.xpEarned} XP earned` : ""}
                    </Typography>
                ) : (
                    <PrimaryButton onClick={markRead} disabled={completing}>
                        {completing ? "Saving…" : `Mark as Read${lesson.xp ? ` · +${lesson.xp} XP` : ""}`}
                    </PrimaryButton>
                )}
            </Box>
        </Box>
    );
}
