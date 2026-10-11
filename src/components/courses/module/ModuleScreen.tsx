"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import { MdLockOutline } from "react-icons/md";
import StudentLayout from "@/layouts/StudentLayout";
import { useCourse, type ModuleLessonView, type ModuleView } from "@/contexts/CourseContext";
import { courseDetailPath } from "../course-format";
import { LEVEL_CARD_FILL, MY_COURSES_ASSETS } from "../my-courses-theme";
import { BackButton, NoticePanel } from "../my-courses-ui";
import LabFlow from "./LabFlow";
import QuizFlow from "./QuizFlow";
import TheoryPanel from "./TheoryPanel";
import VideoLessonPlayer from "./VideoLessonPlayer";
import { ModuleCardGlow, ModuleHero, ModuleSectionCard, ModuleStats } from "./ModuleView";

type Activity = { kind: "quiz" | "lab"; lessonId: string; run: number };

const isPanelKind = (kind: ModuleLessonView["kind"]): kind is Activity["kind"] => kind === "quiz" || kind === "lab";

/**
 * Module page: hero, stats and task sections. Videos and theory open inline; quizzes and labs open in the
 * right-hand activity panel. `initialLessonId` (from `?lesson=`) opens that lesson on arrival.
 */
export default function ModuleScreen({ courseParam, module, initialLessonId }: { courseParam: string; module: ModuleView; initialLessonId: string | null }) {
    const router = useRouter();
    const { getModuleIntroPlayback } = useCourse();
    const locked = module.isLocked;
    const levelsPath = courseDetailPath(courseParam, "levels");

    const target = locked || !initialLessonId ? null : (module.sections.flatMap((s) => s.lessons).find((l) => l.lessonId === initialLessonId) ?? null);
    const [expandedId, setExpandedId] = useState<string | null>(() => (target && !isPanelKind(target.kind) ? target.lessonId : null));
    const [activity, setActivity] = useState<Activity | null>(() => (target && isPanelKind(target.kind) ? { kind: target.kind, lessonId: target.lessonId, run: 1 } : null));
    const scrollTo = useRef(expandedId);

    useEffect(() => {
        const id = scrollTo.current;
        if (!id) return;
        scrollTo.current = null;
        const frame = window.requestAnimationFrame(() => document.getElementById(`lesson-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
        return () => window.cancelAnimationFrame(frame);
    }, []);

    const open = (kind: Activity["kind"], lessonId: string) => setActivity((prev) => ({ kind, lessonId, run: (prev?.run ?? 0) + 1 }));
    const close = () => setActivity(null);

    const handleAction = (lesson: ModuleLessonView) => {
        if (locked) return;
        if (isPanelKind(lesson.kind)) return open(lesson.kind, lesson.lessonId);
        setExpandedId((prev) => (prev === lesson.lessonId ? null : lesson.lessonId));
    };

    const renderInline = (lesson: ModuleLessonView) =>
        lesson.kind === "video" ? (
            <VideoLessonPlayer key={lesson.lessonId} lesson={lesson} />
        ) : lesson.kind === "theory" ? (
            <TheoryPanel key={lesson.lessonId} lesson={lesson} />
        ) : null;

    return (
        <StudentLayout hideSidebar fullBleed>
            <Box sx={{ position: "relative", flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Star dust trailing in from above the page. */}
                <Box aria-hidden sx={{ position: "absolute", left: 134, top: -780, lineHeight: 0, pointerEvents: "none", display: { xs: "none", md: "block" } }}>
                    <Image src={`${MY_COURSES_ASSETS}/ui/header-vector.svg`} alt="" width={901} height={831} style={{ maxWidth: "none" }} />
                </Box>

                <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <BackButton label="Back to Levels" onClick={() => router.push(levelsPath)} />
                </Box>

                <Box
                    sx={{
                        position: "relative",
                        flex: 1,
                        minHeight: 0,
                        overflowY: "auto",
                        overflowX: "hidden",
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": { display: "none" },
                        p: { xs: "16px", sm: "24px" },
                        borderRadius: "24px",
                        border: "1px solid rgba(255,255,255,0.88)",
                        backgroundImage: LEVEL_CARD_FILL,
                    }}
                >
                    <ModuleCardGlow />
                    <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: { xs: "24px", md: "44px" } }}>
                        {locked && (
                            <NoticePanel
                                icon={<MdLockOutline size={26} color="#8a8a9a" />}
                                title="This module is locked"
                                message={`Finish the levels before Level ${module.level.levelNo} to unlock its lessons. You can still preview what's inside.`}
                                action={{ label: "Back to Levels", onClick: () => router.push(levelsPath) }}
                            />
                        )}
                        <ModuleHero module={module} loadIntro={() => getModuleIntroPlayback(courseParam, module.moduleId)} />
                        <ModuleStats module={module} />
                        {module.sections.map((section) => (
                            <ModuleSectionCard
                                key={section.sectionId}
                                section={section}
                                expandedId={expandedId}
                                locked={locked}
                                onAction={handleAction}
                                renderInline={renderInline}
                            />
                        ))}
                    </Box>
                </Box>
            </Box>

            {activity?.kind === "quiz" && (
                <QuizFlow
                    key={`${activity.lessonId}-${activity.run}`}
                    open
                    lessonId={activity.lessonId}
                    onClose={close}
                    onContinueToLab={(labLessonId) => open("lab", labLessonId)}
                    onCourseMap={() => router.push(levelsPath)}
                />
            )}

            {activity?.kind === "lab" && (
                <LabFlow
                    key={`${activity.lessonId}-${activity.run}`}
                    open
                    lessonId={activity.lessonId}
                    onClose={close}
                    onContinueToLevel={(levelNo) => router.push(`${levelsPath}#level-${levelNo}`)}
                    onCourseMap={() => router.push(levelsPath)}
                />
            )}
        </StudentLayout>
    );
}
