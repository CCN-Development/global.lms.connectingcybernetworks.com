"use client";

import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, ButtonBase, CircularProgress, Typography } from "@mui/material";
import toast from "react-hot-toast";
import StudentLayout from "@/layouts/StudentLayout";
import { MY_COURSES_PATH, MY_GOALS_PATH, courseDetailPath } from "@/components/courses/course-format";
import { COLORS, MY_COURSES_ASSETS, TYPE } from "@/components/courses/my-courses-theme";
import { NoticePanel } from "@/components/courses/my-courses-ui";
import GoalStepper from "@/components/courses/set-goal/GoalStepper";
import { GoalTypeStep, PaceStep, ReviewStep, ScheduleStep, TargetStep } from "@/components/courses/set-goal/GoalSteps";
import { SET_GOAL_ASSETS } from "@/components/courses/set-goal/GoalUI";
import { GOAL_STEPS, toGoalInput, type GoalDraft } from "@/components/courses/set-goal/set-goal-utils";
import { useCourse, type GoalOptions, type GoalProjection } from "@/contexts/CourseContext";

function defaultDraft(options: GoalOptions, preferredCourseId: string | null): GoalDraft {
    const preferred = options.courses.find((c) => c.courseId === preferredCourseId)?.courseId;
    return {
        goalType: options.defaults.goalType,
        courseId: preferred ?? options.defaults.courseId ?? options.courses[0]?.courseId ?? "",
        targetLevel: options.rank.suggestedTargetLevel,
        paceKey: options.defaults.paceKey,
        customMinutes: options.paces.find((p) => p.key === "custom")?.minutesPerDay ?? 45,
        learningDays: options.defaults.learningDays,
        reminderEnabled: false,
        reminderTime: "19:00",
    };
}

function SetGoalContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preferredCourseId = searchParams?.get("courseId") ?? null;
    const { goalOptions, myCourses, getGoalOptions, getMyCourses, previewGoal, createGoal, saving } = useCourse();
    const [step, setStep] = useState(0);
    const [edits, setEdits] = useState<GoalDraft | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [projection, setProjection] = useState<GoalProjection | null>(null);
    const [previewError, setPreviewError] = useState<string | null>(null);

    useEffect(() => {
        getGoalOptions().then((res) => setLoadError(res.success ? null : (res.message ?? "Failed to load goal options")));
        // Only used to show locked missions on the Target step.
        getMyCourses();
    }, [getGoalOptions, getMyCourses]);

    const draft = edits ?? (goalOptions ? defaultDraft(goalOptions, preferredCourseId) : null);
    const stepKey = GOAL_STEPS[step].key;

    const update = (patch: Partial<GoalDraft>) => draft && setEdits({ ...draft, ...patch });

    const goTo = (index: number) => {
        setProjection(null);
        setPreviewError(null);
        setStep(index);
        if (GOAL_STEPS[index].key !== "review" || !draft) return;
        // The projection comes from the server so it matches the goal that will be saved.
        previewGoal(toGoalInput(draft)).then((res) => {
            if (res.success && res.data) setProjection(res.data);
            else setPreviewError(res.message ?? "Failed to project the goal");
        });
    };

    const next = () => goTo(Math.min(step + 1, GOAL_STEPS.length - 1));
    const exit = () => router.push(preferredCourseId ? courseDetailPath(preferredCourseId) : MY_COURSES_PATH);
    const back = () => (step > 0 ? goTo(step - 1) : exit());

    const confirm = async () => {
        if (!draft || saving) return;
        const res = await createGoal(toGoalInput(draft));
        if (!res.success) {
            toast.error(res.message ?? "Failed to save the goal");
            return;
        }
        toast.success("Goal saved — let's do this!");
        router.push(MY_GOALS_PATH);
    };

    const lockedCourses = (myCourses?.courses ?? []).filter((c) => c.status === "Locked" || c.status === "Upcoming");
    const selectedCourse = goalOptions?.courses.find((c) => c.courseId === draft?.courseId) ?? null;

    let body: React.ReactNode;
    if (!goalOptions || !draft) {
        body = loadError ? (
            <Box sx={{ width: 620, maxWidth: "100%" }}>
                <NoticePanel title="We couldn't load your goal options" message={loadError} action={{ label: "Try again", onClick: () => getGoalOptions() }} />
            </Box>
        ) : (
            <CircularProgress size={32} sx={{ color: COLORS.purple }} />
        );
    } else if (goalOptions.courses.length === 0) {
        body = (
            <Box sx={{ width: 620, maxWidth: "100%" }}>
                <NoticePanel
                    title="No missions to set a goal for"
                    message="Goals can be set once a course is unlocked for you."
                    action={{ label: "Back to My Courses", onClick: () => router.push(MY_COURSES_PATH) }}
                />
            </Box>
        );
    } else {
        body = (
            <>
                <GoalStepper steps={GOAL_STEPS} current={step} onSelect={goTo} />
                {stepKey === "goal" && <GoalTypeStep options={goalOptions} draft={draft} update={update} onNext={next} />}
                {stepKey === "target" && <TargetStep options={goalOptions} lockedCourses={lockedCourses} draft={draft} update={update} onNext={next} />}
                {stepKey === "pace" && <PaceStep options={goalOptions} draft={draft} update={update} onNext={next} />}
                {stepKey === "schedule" && <ScheduleStep options={goalOptions} draft={draft} update={update} onNext={next} />}
                {stepKey === "review" && (
                    <ReviewStep
                        projection={projection}
                        error={previewError}
                        weeks={selectedCourse?.weeks ?? null}
                        saving={saving}
                        onConfirm={confirm}
                        onCancel={exit}
                    />
                )}
            </>
        );
    }

    return (
        <StudentLayout>
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "24px", pb: "24px" }}>
                {/* Star dust trailing in from above the page, as in the design. */}
                <Box aria-hidden sx={{ position: "absolute", left: -1, top: -779, lineHeight: 0, pointerEvents: "none", display: { xs: "none", md: "block" } }}>
                    <Image src={`${MY_COURSES_ASSETS}/ui/header-vector.svg`} alt="" width={901} height={831} style={{ maxWidth: "none" }} />
                </Box>

                <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                    <ButtonBase
                        aria-label={step > 0 ? "Previous step" : "Back"}
                        onClick={back}
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "50px",
                            border: "1px solid rgba(255,255,255,0.08)",
                            backgroundImage: "linear-gradient(180deg, rgba(227,233,248,0.08) 0%, rgba(134,137,146,0.04) 100%)",
                            backdropFilter: "blur(25px)",
                            "&:hover": { borderColor: "rgba(255,255,255,0.24)" },
                            "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" },
                        }}
                    >
                        <Image src={`${SET_GOAL_ASSETS}/icon-arrow-back.svg`} alt="" width={24} height={24} />
                    </ButtonBase>
                    <ButtonBase
                        onClick={() => router.push(MY_GOALS_PATH)}
                        sx={{ px: "16px", height: 40, borderRadius: "10px", border: `1px solid ${COLORS.buttonBorder}`, "&:hover": { borderColor: "rgba(227,233,248,0.64)" } }}
                    >
                        <Typography component="span" sx={{ ...TYPE.buttonMed14, color: COLORS.white }}>
                            My Goals
                        </Typography>
                    </ButtonBase>
                </Box>

                <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", pb: "16px", textAlign: "center" }}>
                    <Image src={`${SET_GOAL_ASSETS}/icon-briefcase-44.svg`} alt="" width={44} height={44} />
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", maxWidth: 788 }}>
                        <Typography component="h1" sx={{ ...TYPE.headingSemibold28, color: COLORS.neutral75 }}>
                            Set your Goal
                        </Typography>
                        <Typography sx={{ ...TYPE.interReg16, color: COLORS.neutral200 }}>
                            Choose a target and build a learning pace you can actually maintain.
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "44px" }}>{body}</Box>
            </Box>
        </StudentLayout>
    );
}

export default function SetGoalPage() {
    return (
        <Suspense fallback={null}>
            <SetGoalContent />
        </Suspense>
    );
}
