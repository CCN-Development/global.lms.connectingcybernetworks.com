// Mock data + pure helpers for the Set Goal wizard — swap the constants for API data once goals are persisted.

import type { Course, LearnerRank } from "../course-data";

const ASSETS = "/my-courses/set-goal";

export type GoalStepKey = "goal" | "target" | "pace" | "schedule" | "review";

export const GOAL_STEPS: { key: GoalStepKey; label: string }[] = [
    { key: "goal", label: "Goal" },
    { key: "target", label: "Target" },
    { key: "pace", label: "Pace" },
    { key: "schedule", label: "Schedule" },
    { key: "review", label: "Review" },
];

export type GoalType = "course" | "level";

export interface GoalTypeOption {
    key: GoalType;
    title: string;
    description: string;
    icon: { src: string; width: number; height: number };
}

export const GOAL_TYPES: GoalTypeOption[] = [
    {
        key: "course",
        title: "Complete a Course",
        description: "Finish all levels and master your course.",
        icon: { src: `${ASSETS}/goal-course.png`, width: 48, height: 40 },
    },
    {
        key: "level",
        title: "Reach a Level",
        description: "Set your next progression milestone.",
        icon: { src: `${ASSETS}/goal-level.png`, width: 40, height: 40 },
    },
];

export type PaceKey = "30m" | "1h" | "1-2h" | "custom";

export interface PaceOption {
    key: PaceKey;
    label: string;
    hint: string;
    /** Minutes per learning day used for the projection. */
    minutesPerDay: number;
    /** Shown as "Daily Commitment" on the review card. */
    commitment: string;
}

export const PACE_OPTIONS: PaceOption[] = [
    { key: "30m", label: "30 min/day", hint: "Light & consistent", minutesPerDay: 30, commitment: "30 min" },
    { key: "1h", label: "1 hour/day", hint: "Recommended", minutesPerDay: 60, commitment: "1 hour" },
    { key: "1-2h", label: "1–2 hours/day", hint: "Fast progression", minutesPerDay: 90, commitment: "1–2 hours" },
    { key: "custom", label: "Custom", hint: "Set your own pace", minutesPerDay: 45, commitment: "Custom" },
];

/** `day` is the JS `Date#getDay()` index. */
export const WEEK_DAYS = [
    { key: "mon", label: "Mon", day: 1 },
    { key: "tue", label: "Tue", day: 2 },
    { key: "wed", label: "Wed", day: 3 },
    { key: "thu", label: "Thu", day: 4 },
    { key: "fri", label: "Fri", day: 5 },
    { key: "sat", label: "Sat", day: 6 },
    { key: "sun", label: "Sun", day: 0 },
] as const;

export type WeekDayKey = (typeof WEEK_DAYS)[number]["key"];

export interface GoalDraft {
    type: GoalType;
    courseId: string;
    pace: PaceKey;
    days: WeekDayKey[];
}

export const DEFAULT_GOAL_DRAFT: Omit<GoalDraft, "courseId"> = {
    type: "course",
    pace: "1h",
    days: ["mon", "tue", "wed", "thu", "fri"],
};

/** Average learner time per level; replace with per-course estimates from the API. */
const AVG_MINUTES_PER_LEVEL = 35;
/** "Reach a Level" aims this many levels above the learner's current one. */
const LEVEL_GOAL_STEP = 4;

export function courseLabel(course: Course): string {
    return course.shortTitle ?? course.title;
}

export function goalTargetText(draft: GoalDraft, course: Course, rank: LearnerRank): string {
    return draft.type === "course" ? `Complete all ${course.totalLevels} Levels` : `Reach Level ${rank.level + LEVEL_GOAL_STEP}`;
}

export function selectedDaysText(days: WeekDayKey[]): string {
    return WEEK_DAYS.filter((d) => days.includes(d.key))
        .map((d) => d.label)
        .join(", ");
}

/** Upper bound in weeks from labels like "8-10 Weeks". */
function maxWeeks(label: string): number | null {
    const numbers = label.match(/\d+/g);
    return numbers ? Number(numbers[numbers.length - 1]) : null;
}

export interface GoalProjection {
    completion: Date;
    daysRemaining: number;
    onTrack: boolean;
}

/** Walks forward day by day, spending the daily commitment on each chosen weekday until the target is met. */
export function projectGoal(draft: GoalDraft, course: Course, today = new Date()): GoalProjection {
    const pace = PACE_OPTIONS.find((p) => p.key === draft.pace) ?? PACE_OPTIONS[1];
    const learningDays = new Set<number>(WEEK_DAYS.filter((d) => draft.days.includes(d.key)).map((d) => d.day));
    const levels =
        draft.type === "course"
            ? Math.max(course.totalLevels - Math.round((course.progress / 100) * course.totalLevels), 0)
            : LEVEL_GOAL_STEP;

    let minutesLeft = levels * AVG_MINUTES_PER_LEVEL;
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let daysRemaining = 0;
    while (minutesLeft > 0 && learningDays.size > 0 && daysRemaining < 3650) {
        date.setDate(date.getDate() + 1);
        daysRemaining += 1;
        if (learningDays.has(date.getDay())) minutesLeft -= pace.minutesPerDay;
    }

    const weeks = draft.type === "course" ? maxWeeks(course.weeks) : null;
    return { completion: date, daysRemaining, onTrack: weeks === null || daysRemaining <= weeks * 7 };
}

export function formatGoalDate(date: Date): string {
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Mock persistence — replace with the goals API call. */
export async function saveLearningGoal(draft: GoalDraft): Promise<GoalDraft> {
    return Promise.resolve(draft);
}
