// Dummy data for the student home dashboard — replace with API data.

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
    course: string;
    level: number;
    title: string;
    progress: number;
}

export type TaskStatus = "overdue" | "pending";

export interface TaskItem {
    id: string;
    course: string;
    title: string;
    dueAt: string;
    dueLabel: string;
    status: TaskStatus;
    statusLabel: string;
}

/** Alerts show a description; announcements and blogs show a tag + date. */
export type UpdateCategory = "alert" | "announcement" | "blog";

export interface UpdateItem {
    id: string;
    category: UpdateCategory;
    title: string;
    description?: string;
    date?: string;
    timeAgo: string;
}

export const OVERALL_PERFORMANCE = 44;

export const PERFORMANCE_METRICS: PerformanceMetric[] = [
    { label: "Attendance", value: "84%", dot: "perf-dot-attendance.png" },
    { label: "Completed Course", value: "1/5", dot: "perf-dot-course.png" },
    { label: "Activity", value: "12/24000", dot: "perf-dot-activity.png" },
];

export const TODAY_SCHEDULE: ScheduleItem = {
    course: "Cisco Certified Network Associate (CCNA)",
    time: "12:00 PM - 2:00 PM",
    mode: "Offline",
    classLabel: "Class 3",
    isLive: true,
};

export const UPCOMING_SESSIONS: SessionItem[] = [
    { id: "s1", title: "Soft Skills", type: "LECTURE", date: "2nd July", time: "12:00 PM" },
    { id: "s2", title: "Job Ready", type: "SEMINAR", date: "4th July", time: "12:00 PM" },
];

export const PLAYER_STATS: PlayerStat[] = [
    { id: "points", value: "120", label: "Total Points Earned", icon: "player-icon-zap.svg" },
    { id: "badges", value: "2", label: "Total Badge Earned", icon: "player-icon-star.svg" },
    { id: "streak", value: "4 Days", label: "Highest Streak", icon: "player-icon-fire.svg" },
    { id: "global", value: "#52", label: "Global Rank", icon: "player-icon-chart.svg" },
    { id: "batch", value: "#12", label: "Batch Rank", icon: "player-icon-chart.svg" },
    { id: "branch", value: "#12", label: "Batch Rank", icon: "player-icon-chart.svg" },
];

export const ACTIVE_MISSION: ActiveMission = {
    course: "CCNA",
    level: 4,
    title: "Introduction to the SOC",
    progress: 10,
};

export const TASKS: TaskItem[] = [
    {
        id: "t1",
        course: "CCNA",
        title: "Network Fundamental",
        dueAt: "2026-02-25T16:00:00",
        dueLabel: "Due 25 Feb, 4:00 PM",
        status: "overdue",
        statusLabel: "Overdue by 2 days",
    },
    {
        id: "t2",
        course: "CCNA",
        title: "Network Fundamental",
        dueAt: "2026-02-25T16:00:00",
        dueLabel: "Due 25 Feb, 4:00 PM",
        status: "overdue",
        statusLabel: "Overdue by 2 days",
    },
    {
        id: "t3",
        course: "ETHICAL HACKING",
        title: "OSI Assessment",
        dueAt: "2026-02-25T16:00:00",
        dueLabel: "Due 25 Feb, 4:00 PM",
        status: "pending",
        statusLabel: "3 days left",
    },
];

export const UPDATES: UpdateItem[] = [
    {
        id: "u1",
        category: "alert",
        title: "Fees Reminder",
        description: "Your next installment is due on 4th July 2026",
        timeAgo: "2h ago",
    },
    { id: "u2", category: "announcement", title: "How to become Career Ready!", date: "4th July 2026", timeAgo: "1 day ago" },
    { id: "u3", category: "blog", title: "How to become Career Ready!", date: "4th July 2026", timeAgo: "1 day ago" },
    {
        id: "u4",
        category: "alert",
        title: "Holiday Notice",
        description: "Institute will remain closed on 4th July 2026",
        timeAgo: "1 day ago",
    },
];
