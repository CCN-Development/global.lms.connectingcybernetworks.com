"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import StudentLayout from "@/layouts/StudentLayout";
import { courseDetailPath } from "../CourseDetailShell";
import type { Course } from "../course-data";
import { LEVEL_CARD_FILL, MY_COURSES_ASSETS } from "../my-courses-theme";
import { BackButton } from "../my-courses-ui";
import LabFlow from "./LabFlow";
import QuizFlow from "./QuizFlow";
import { ModuleCardGlow, ModuleHero, ModuleSectionCard, ModuleStats } from "./ModuleView";
import { findLab, findQuiz, type CourseModule, type ModuleLesson, type ModuleSection } from "./module-data";

type LessonPatch = Partial<Pick<ModuleLesson, "completed" | "watched">>;
type Activity = { kind: "quiz" | "lab"; lessonId: string; run: number };

/** Module page: hero, stats and task sections; quizzes and labs open in the right-hand activity panel. */
export default function ModuleScreen({ course, module }: { course: Course; module: CourseModule }) {
    const router = useRouter();
    const [patches, setPatches] = useState<Record<string, LessonPatch>>({});
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [activity, setActivity] = useState<Activity | null>(null);

    const sections: ModuleSection[] = module.sections.map((section) => ({
        ...section,
        lessons: section.lessons.map((lesson) => ({ ...lesson, ...patches[lesson.lessonId] })),
    }));
    const lessons = sections.flatMap((s) => s.lessons);
    const levelsPath = courseDetailPath(course.courseId, "levels");

    const patch = (lessonId: string, next: LessonPatch) => setPatches((prev) => ({ ...prev, [lessonId]: { ...prev[lessonId], ...next } }));

    const open = (kind: Activity["kind"], lessonId: string) => setActivity((prev) => ({ kind, lessonId, run: (prev?.run ?? 0) + 1 }));

    const handleAction = (lesson: ModuleLesson) => {
        if (lesson.kind === "quiz") return open("quiz", lesson.lessonId);
        if (lesson.kind === "lab") return open("lab", lesson.lessonId);
        const opening = expandedId !== lesson.lessonId;
        setExpandedId(opening ? lesson.lessonId : null);
        if (opening && lesson.kind === "theory") patch(lesson.lessonId, { completed: true });
    };

    const handleProgress = (lesson: ModuleLesson, pct: number) => {
        if (pct >= 100) {
            if (!lesson.completed) patch(lesson.lessonId, { watched: 100, completed: true });
        } else if (pct > (lesson.watched ?? 0)) {
            patch(lesson.lessonId, { watched: pct });
        }
    };

    const activeLesson = activity ? lessons.find((l) => l.lessonId === activity.lessonId) : undefined;
    const activeSection = activity ? sections.find((s) => s.lessons.some((l) => l.lessonId === activity.lessonId)) : undefined;
    const sectionLab = activeSection?.lessons.find((l) => l.kind === "lab" && findLab(l.labId));
    const quiz = activity?.kind === "quiz" ? findQuiz(activeLesson?.quizId) : undefined;
    const lab = activity?.kind === "lab" ? findLab(activeLesson?.labId) : undefined;
    const close = () => setActivity(null);

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
                        <ModuleHero module={module} sections={sections} />
                        <ModuleStats module={module} />
                        {sections.map((section) => (
                            <ModuleSectionCard key={section.sectionId} section={section} expandedId={expandedId} onAction={handleAction} onProgress={handleProgress} />
                        ))}
                    </Box>
                </Box>
            </Box>

            {activity && quiz && (
                <QuizFlow
                    key={`${activity.lessonId}-${activity.run}`}
                    open
                    quiz={quiz}
                    hasLab={Boolean(sectionLab)}
                    onClose={close}
                    onComplete={() => patch(activity.lessonId, { completed: true })}
                    onContinueToLab={() => (sectionLab ? open("lab", sectionLab.lessonId) : close())}
                />
            )}

            {activity && lab && (
                <LabFlow
                    key={`${activity.lessonId}-${activity.run}`}
                    open
                    lab={lab}
                    nextLevelNo={module.nextLevelNo}
                    onClose={close}
                    onComplete={() => patch(activity.lessonId, { completed: true })}
                    onContinue={() => router.push(`${levelsPath}#level-${module.nextLevelNo}`)}
                    onCourseMap={() => router.push(levelsPath)}
                />
            )}
        </StudentLayout>
    );
}
