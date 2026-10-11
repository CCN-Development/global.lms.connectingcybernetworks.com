// Shared formatting, routing and feedback helpers for the student My Courses screens.

import toast from "react-hot-toast";
import type { ActivityRewards, CourseTheme, CourseUiStatus, WeekDayKey } from "@/contexts/CourseContext";
import { COURSE_THEMES } from "./my-courses-theme";

/* ------------------------------------------------------------------ routes */

export const MY_COURSES_PATH = "/dashboard/student/my-courses";
export const SET_GOAL_PATH = `${MY_COURSES_PATH}/set-goal`;
export const MY_GOALS_PATH = `${MY_COURSES_PATH}/goal-set`;
export const LEADERBOARD_PATH = `${MY_COURSES_PATH}/leaderboard`;

export type CourseDetailTab = "overview" | "levels";

export function courseDetailPath(courseId: string, tab: CourseDetailTab = "overview"): string {
    const base = `${MY_COURSES_PATH}/${courseId}`;
    return tab === "overview" ? base : `${base}/${tab}`;
}

/** Module page; `lessonId` opens that lesson (video / theory inline, quiz / lab panel) on arrival. */
export function modulePath(courseId: string, moduleId: string, lessonId?: string | null): string {
    const base = `${MY_COURSES_PATH}/${courseId}/${moduleId}`;
    return lessonId ? `${base}?lesson=${encodeURIComponent(lessonId)}` : base;
}

export function setGoalPath(courseId?: string | null): string {
    return courseId ? `${SET_GOAL_PATH}?courseId=${encodeURIComponent(courseId)}` : SET_GOAL_PATH;
}

/* ------------------------------------------------------------------ course */

export function courseEmblem(course: { emblemUrl: string | null; theme: CourseTheme }): string {
    return course.emblemUrl || COURSE_THEMES[course.theme]?.emblem || COURSE_THEMES.violet.emblem;
}

export function courseStatusLabel(status: CourseUiStatus): string {
    switch (status) {
        case "Active":
            return "Active Mission";
        case "Completed":
            return "Mission Completed";
        case "Locked":
            return "Mission Locked";
        case "Upcoming":
            return "Coming Soon";
        default:
            return "Mission Unlocked";
    }
}

/** Remote (API / CDN) images skip the Next optimiser so any configured host works. */
export function isRemoteSrc(src: string | null | undefined): boolean {
    return Boolean(src && /^(https?:)?\/\//i.test(src));
}

/** Splits "8-10 Weeks" into its bold value and regular unit. */
export function splitWeeks(label: string | null): { value: string; unit: string } {
    if (!label) return { value: "Self", unit: "paced" };
    const [value, ...rest] = label.trim().split(/\s+/);
    return { value, unit: rest.join(" ") };
}

/* --------------------------------------------------------------- durations */

/** Lesson cards: "2h 12min", "25min", "45s". */
export function formatLessonDuration(sec: number): string {
    const total = Math.max(0, Math.round(sec));
    if (total < 60) return `${total}s`;
    const hours = Math.floor(total / 3600);
    const minutes = Math.round((total % 3600) / 60);
    if (hours) return minutes ? `${hours}h ${minutes}min` : `${hours}h`;
    return `${minutes}min`;
}

/** Module lessons: "6m 18s", "1h 05m". */
export function formatClockDuration(sec: number): string {
    const total = Math.max(0, Math.round(sec));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    if (hours) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
    if (minutes) return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
    return `${seconds}s`;
}

/** Course / module totals: "124h 22m", "42m" (or "126 h 12 m" when spaced). */
export function formatHoursMinutes(sec: number, spaced = false): string {
    const total = Math.max(0, Math.round(sec / 60));
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    const gap = spaced ? " " : "";
    return hours ? `${hours}${gap}h ${minutes}${gap}m` : `${minutes}${gap}m`;
}

/** Trailer button: "2mins", "45s". */
export function formatShortMinutes(sec: number | null): string {
    if (!sec) return "";
    if (sec < 60) return `${Math.round(sec)}s`;
    const minutes = Math.round(sec / 60);
    return `${minutes}min${minutes === 1 ? "" : "s"}`;
}

export function formatDate(iso: string | null | undefined): string {
    if (!iso) return "—";
    // Date-only strings (YYYY-MM-DD) are already in the learner's timezone; don't shift them through UTC.
    const date = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00`) : new Date(iso);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export const WEEK_DAY_LABELS: Record<WeekDayKey, string> = {
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
    sun: "Sun",
};

export const WEEK_DAY_ORDER: WeekDayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export function selectedDaysText(days: WeekDayKey[]): string {
    return WEEK_DAY_ORDER.filter((d) => days.includes(d))
        .map((d) => WEEK_DAY_LABELS[d])
        .join(", ");
}

export function minutesLabel(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    const h = `${hours} hour${hours === 1 ? "" : "s"}`;
    return rest ? `${h} ${rest} min` : h;
}

/* ------------------------------------------------------------- thumbnails */

export interface LessonThumb {
    src: string;
    /** Scrim painted over the artwork (Figma bakes a different one per thumbnail). */
    overlay: string;
}

const THUMBS = "/my-courses/course/levels/thumbs";
const FLAT_SCRIM = "rgba(0,0,0,0.2)";
const TOP_SCRIM = "linear-gradient(180deg, rgba(0,0,0,0.44) 0%, rgba(102,102,102,0) 100%)";

/** Fallback lesson-card artwork, cycled by card position when a module has no thumbnail. */
export const LESSON_THUMBS: LessonThumb[] = [
    { src: `${THUMBS}/lesson-1.webp`, overlay: "linear-gradient(180deg, rgba(0,0,0,0) 14.024%, rgba(0,0,0,0.64) 86.585%)" },
    { src: `${THUMBS}/lesson-2.webp`, overlay: "linear-gradient(180deg, rgba(0,0,0,0.44) 0%, rgba(102,102,102,0) 179.27%)" },
    { src: `${THUMBS}/lesson-3.webp`, overlay: FLAT_SCRIM },
    { src: `${THUMBS}/lesson-4.webp`, overlay: TOP_SCRIM },
    { src: `${THUMBS}/lesson-5.webp`, overlay: FLAT_SCRIM },
    { src: `${THUMBS}/lesson-6.webp`, overlay: FLAT_SCRIM },
    { src: `${THUMBS}/lesson-7.webp`, overlay: FLAT_SCRIM },
    { src: `${THUMBS}/lesson-8.webp`, overlay: TOP_SCRIM },
];

/* --------------------------------------------------------------- feedback */

/** Toasts for XP, rank-ups, badges, level / course completion and goals after a learning event. */
export function announceRewards(rewards: ActivityRewards | null | undefined, xpAwarded = 0) {
    if (xpAwarded > 0) toast.success(`+${xpAwarded} XP earned`);
    if (!rewards) return;
    if (rewards.rankUp) toast.success(`Rank up! You reached Level ${rewards.rankUp.to}`, { duration: 5000 });
    rewards.newBadges.forEach((badge) =>
        toast.success(`Badge unlocked: ${badge.name}${badge.xpReward ? ` (+${badge.xpReward} XP)` : ""}`, { duration: 5000 })
    );
    if (rewards.courseCompleted) toast.success("Mission completed! Congratulations.", { duration: 6000 });
    else if (rewards.levelCompleted) toast.success("Level completed — the next level is unlocked.", { duration: 5000 });
    if (rewards.goalsAchieved.length) toast.success("Learning goal achieved!", { duration: 5000 });
}
