// Draft model + helpers for the Set Goal wizard (backed by /student-course/goals).

import type { GoalDraftInput, GoalType, PaceKey, WeekDayKey } from "@/contexts/CourseContext";

const ASSETS = "/my-courses/set-goal";

export type GoalStepKey = "goal" | "target" | "pace" | "schedule" | "review";

export const GOAL_STEPS: { key: GoalStepKey; label: string }[] = [
    { key: "goal", label: "Goal" },
    { key: "target", label: "Target" },
    { key: "pace", label: "Pace" },
    { key: "schedule", label: "Schedule" },
    { key: "review", label: "Review" },
];

export const GOAL_TYPE_ICONS: Record<GoalType, { src: string; width: number; height: number }> = {
    complete_course: { src: `${ASSETS}/goal-course.png`, width: 48, height: 40 },
    reach_level: { src: `${ASSETS}/goal-level.png`, width: 40, height: 40 },
};

export interface GoalDraft {
    goalType: GoalType;
    courseId: string;
    /** reach_level only. */
    targetLevel: number | null;
    paceKey: PaceKey;
    /** Used when paceKey is "custom". */
    customMinutes: number;
    learningDays: WeekDayKey[];
    reminderEnabled: boolean;
    /** "HH:mm" */
    reminderTime: string;
}

export const CUSTOM_MINUTES = { min: 5, max: 16 * 60, step: 5 } as const;

export function learnerTimezone(): string | undefined {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
    } catch {
        return undefined;
    }
}

export function toGoalInput(draft: GoalDraft): GoalDraftInput {
    return {
        courseId: draft.courseId,
        goalType: draft.goalType,
        ...(draft.goalType === "reach_level" && draft.targetLevel ? { targetValue: draft.targetLevel } : {}),
        paceKey: draft.paceKey,
        ...(draft.paceKey === "custom" ? { minutesPerDay: draft.customMinutes } : {}),
        learningDays: draft.learningDays,
        timezone: learnerTimezone(),
        reminderEnabled: draft.reminderEnabled,
        reminderTime: draft.reminderEnabled ? draft.reminderTime : null,
    };
}

/** "8-10 Weeks" → "8 - 10 weeks", as written on the target card. */
export function formatWeeks(weeks: string | null): string {
    return weeks ? weeks.replace(/(\d+)\s*-\s*(\d+)/, "$1 - $2").toLowerCase() : "self-paced";
}
