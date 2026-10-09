"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Box, ButtonBase, Typography } from "@mui/material";
import StudentLayout from "@/layouts/StudentLayout";
import { COURSES, LEARNER_RANK, activeCourse } from "@/components/courses/course-data";
import { COLORS, MY_COURSES_ASSETS, TYPE } from "@/components/courses/my-courses-theme";
import GoalStepper from "@/components/courses/set-goal/GoalStepper";
import { GoalTypeStep, PaceStep, ReviewStep, ScheduleStep, TargetStep } from "@/components/courses/set-goal/GoalSteps";
import { SET_GOAL_ASSETS } from "@/components/courses/set-goal/GoalUI";
import { DEFAULT_GOAL_DRAFT, GOAL_STEPS, saveLearningGoal, type GoalDraft } from "@/components/courses/set-goal/set-goal-data";

const MY_COURSES_PATH = "/dashboard/student/my-courses";

export default function SetGoalPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [draft, setDraft] = useState<GoalDraft>(() => ({ ...DEFAULT_GOAL_DRAFT, courseId: activeCourse().courseId }));
    const [saving, setSaving] = useState(false);

    const course = COURSES.find((c) => c.courseId === draft.courseId) ?? activeCourse();
    const update = (patch: Partial<GoalDraft>) => setDraft((prev) => ({ ...prev, ...patch }));
    const next = () => setStep((s) => Math.min(s + 1, GOAL_STEPS.length - 1));
    const exit = () => router.push(MY_COURSES_PATH);
    const back = () => (step > 0 ? setStep(step - 1) : exit());

    const confirm = async () => {
        if (saving) return;
        setSaving(true);
        try {
            await saveLearningGoal(draft);
            exit();
        } finally {
            setSaving(false);
        }
    };

    const stepKey = GOAL_STEPS[step].key;

    return (
        <StudentLayout>
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "24px", pb: "24px" }}>
                {/* Star dust trailing in from above the page, as in the design. */}
                <Box aria-hidden sx={{ position: "absolute", left: -1, top: -779, lineHeight: 0, pointerEvents: "none", display: { xs: "none", md: "block" } }}>
                    <Image src={`${MY_COURSES_ASSETS}/ui/header-vector.svg`} alt="" width={901} height={831} style={{ maxWidth: "none" }} />
                </Box>

                <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <ButtonBase
                        aria-label={step > 0 ? "Previous step" : "Back to My Courses"}
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

                <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "44px" }}>
                    <GoalStepper steps={GOAL_STEPS} current={step} onSelect={setStep} />

                    {stepKey === "goal" && <GoalTypeStep draft={draft} update={update} onNext={next} />}
                    {stepKey === "target" && <TargetStep draft={draft} update={update} courses={COURSES} rank={LEARNER_RANK} onNext={next} />}
                    {stepKey === "pace" && <PaceStep draft={draft} update={update} onNext={next} />}
                    {stepKey === "schedule" && <ScheduleStep draft={draft} update={update} onNext={next} />}
                    {stepKey === "review" && <ReviewStep draft={draft} course={course} onConfirm={confirm} onCancel={exit} />}
                </Box>
            </Box>
        </StudentLayout>
    );
}
