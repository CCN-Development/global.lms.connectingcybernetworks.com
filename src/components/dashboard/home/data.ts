// View models for the student home dashboard + mappers from `GET /student/dashboard`.

import type {
    DashboardSession,
    DashboardTask,
    DashboardTodaySession,
    DashboardUpdate,
    DashboardUpdateLink,
    StudentDashboard,
} from "@/contexts/StudentContext";
import { formatUTCClock, MONTH_LONG, MONTH_SHORT, normalizeMode } from "@/components/batches/batch-format";

export interface PerformanceMetric {
    label: string;
    value: string;
    dot: string;
}

export interface ScheduleItem {
    course: string;
    time: string;
    mode: string;
    classLabel: string;
    isLive: boolean;
    /** Online class link; when null the card opens the batch page instead. */
    joinUrl: string | null;
    batchId: string;
}

export interface SessionItem {
    id: string;
    title: string;
    type: string;
    date: string;
    time: string;
}

export interface PlayerStat {
    id: string;
    value: string;
    label: string;
    icon: string;
}

export interface ActiveMission {
    courseId: string;
    course: string;
    level: number;
    title: string;
    progress: number;
}

export type TaskStatus = "overdue" | "pending";

export interface TaskItem {
    id: string;
    batchId: string;
    course: string;
    title: string;
    dueAt: string;
    dueLabel: string;
    status: TaskStatus;
    statusLabel: string;
}

/** Alerts show a description; announcements, news and blogs show a tag + date. */
export type UpdateCategory = "alert" | "announcement" | "news" | "blog";

export interface UpdateItem {
    id: string;
    category: UpdateCategory;
    title: string;
    description?: string;
    date?: string;
    timeAgo: string;
    link?: DashboardUpdateLink | null;
}

// ─── formatting helpers ──────────────────────────────────────────────────────

const DAY_MS = 86_400_000;

function ordinal(day: number): string {
    const rem100 = day % 100;
    if (rem100 >= 11 && rem100 <= 13) return `${day}th`;
    return `${day}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[day % 10] ?? "th"}`;
}

function localClock(date: Date): string {
    const hours = date.getHours();
    return `${hours % 12 || 12}:${String(date.getMinutes()).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? "" : "s"}`;

/** Whole calendar days between today and `date` (local time); negative = past. */
function calendarDaysFromToday(date: Date): number {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    return Math.round((target - today) / DAY_MS);
}

/** Today's date key in the dashboard's timezone, e.g. "2026-10-11". */
function todayKeyIn(timezone: string): string {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" } as const;
    try {
        return new Intl.DateTimeFormat("en-CA", { ...options, timeZone: timezone }).format(new Date());
    } catch {
        return new Intl.DateTimeFormat("en-CA", options).format(new Date());
    }
}

/** Session days are wall-clock values stored in UTC fields: "Today", "Tomorrow" or "2nd July". */
function sessionDayLabel(iso: string, todayKey: string): string {
    const date = new Date(iso);
    const key = date.toISOString().slice(0, 10);
    if (key === todayKey) return "Today";
    const tomorrow = new Date(`${todayKey}T00:00:00.000Z`);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    if (key === tomorrow.toISOString().slice(0, 10)) return "Tomorrow";
    return `${ordinal(date.getUTCDate())} ${MONTH_LONG[date.getUTCMonth()]}`;
}

/** "2h ago", "1 day ago", "just now". */
function timeAgo(iso: string): string {
    const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${plural(days, "day")} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${plural(months, "month")} ago`;
    return `${plural(Math.floor(days / 365), "year")} ago`;
}

const formatRank = (rank: number | null) => (rank ? `#${rank}` : "—");
const sessionTypeLabel = (type: string) => type.replace(/_/g, " ").toUpperCase();

// ─── mappers ─────────────────────────────────────────────────────────────────

export function toPerformance(performance: StudentDashboard["performance"]): { overall: number; metrics: PerformanceMetric[] } {
    return {
        overall: performance.overall,
        metrics: [
            { label: "Attendance", value: `${performance.attendance.percentage}%`, dot: "perf-dot-attendance.png" },
            {
                label: "Completed Course",
                value: `${performance.courses.completed}/${performance.courses.total}`,
                dot: "perf-dot-course.png",
            },
            {
                label: "Activity",
                value: `${performance.activity.earnedXp}/${performance.activity.totalXp}`,
                dot: "perf-dot-activity.png",
            },
        ],
    };
}

export function toSchedule(session: DashboardTodaySession | null): ScheduleItem | null {
    if (!session) return null;
    const start = formatUTCClock(session.startAt);
    return {
        course: session.courseName,
        time: session.endAt ? `${start} - ${formatUTCClock(session.endAt)}` : start,
        mode: normalizeMode(session.mode),
        classLabel: `Class ${session.sessionNumber}`,
        isLive: session.isLive,
        joinUrl: session.joinUrl,
        batchId: session.batchId,
    };
}

export function toSessions(sessions: DashboardSession[], timezone: string): SessionItem[] {
    const todayKey = todayKeyIn(timezone);
    return sessions.map((session) => ({
        id: session.batchSessionId,
        title: session.title,
        type: sessionTypeLabel(session.sessionType),
        date: sessionDayLabel(session.startAt, todayKey),
        time: formatUTCClock(session.startAt),
    }));
}

export function toPlayerStats(status: StudentDashboard["playerStatus"]): PlayerStat[] {
    return [
        { id: "points", value: status.totalPoints.toLocaleString("en-IN"), label: "Total Points Earned", icon: "player-icon-zap.svg" },
        { id: "badges", value: String(status.totalBadges), label: "Total Badge Earned", icon: "player-icon-star.svg" },
        { id: "streak", value: plural(status.highestStreak, "Day"), label: "Highest Streak", icon: "player-icon-fire.svg" },
        { id: "global", value: formatRank(status.globalRank), label: "Global Rank", icon: "player-icon-chart.svg" },
        { id: "batch", value: formatRank(status.batchRank), label: "Batch Rank", icon: "player-icon-chart.svg" },
        { id: "branch", value: formatRank(status.branchRank), label: "Branch Rank", icon: "player-icon-chart.svg" },
    ];
}

export function toMission(mission: StudentDashboard["activeMission"]): ActiveMission | null {
    if (!mission) return null;
    return {
        courseId: mission.courseId,
        course: mission.courseShortName,
        level: mission.level?.levelNo ?? 1,
        title: mission.level?.title ?? mission.courseName,
        progress: mission.progress,
    };
}

export function toTasks(tasks: DashboardTask[]): TaskItem[] {
    return tasks.map((task) => {
        const due = new Date(task.dueDate);
        const dayOffset = calendarDaysFromToday(due);
        let statusLabel: string;
        if (task.status === "overdue") {
            statusLabel = dayOffset < 0 ? `Overdue by ${plural(-dayOffset, "day")}` : "Overdue";
        } else {
            statusLabel = dayOffset <= 0 ? "Due today" : `${plural(dayOffset, "day")} left`;
        }
        return {
            id: task.assignmentId,
            batchId: task.batchId,
            course: task.courseShortName ?? task.courseName ?? "Assignment",
            title: task.title,
            dueAt: task.dueDate,
            dueLabel: `Due ${due.getDate()} ${MONTH_SHORT[due.getMonth()]}, ${localClock(due)}`,
            status: task.status,
            statusLabel,
        };
    });
}

export function toUpdates(updates: DashboardUpdate[]): UpdateItem[] {
    return updates.map((update) => {
        let label = timeAgo(update.createdAt);
        if (update.dueAt) {
            const days = calendarDaysFromToday(new Date(update.dueAt));
            if (days === 0) label = "Due today";
            else if (days > 0) label = `Due in ${plural(days, "day")}`;
            else label = "Overdue";
        }
        const date = update.date ? new Date(update.date) : null;
        return {
            id: update.id,
            category: update.category,
            title: update.title,
            description: update.description ?? undefined,
            date: date ? `${ordinal(date.getDate())} ${MONTH_LONG[date.getMonth()]} ${date.getFullYear()}` : undefined,
            timeAgo: label,
            link: update.link,
        };
    });
}
