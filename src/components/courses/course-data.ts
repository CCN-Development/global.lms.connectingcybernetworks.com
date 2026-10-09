// Mock data source — swap for a CourseContext once the courses API exists.

import type { CourseThemeKey } from "./my-courses-theme";

export type CourseStatus = "Active" | "Locked" | "Completed";
export type LessonKind = "video" | "reading" | "lab" | "quiz";

export interface CourseInstructor {
    instructorId: string;
    name: string;
    designation: string;
    avatar: string;
}

export interface CourseLesson {
    lessonId: string;
    title: string;
    kind: LessonKind;
    tasks: number;
    duration: string;
    xp: number;
    /** Lead instructor; omitted when the lesson card shouldn't credit anyone. */
    instructor?: string;
    extraInstructors: number;
    completed: boolean;
    /** 0 - 100 playback progress; when set, the thumbnail shows a watch bar instead of a play button. */
    watched?: number;
    /** Index into LESSON_THUMBS. */
    art: number;
}

export interface CourseLevel {
    levelId: string;
    levelNo: number;
    title: string;
    /** 0 - 100 */
    progress: number;
    lessons: CourseLesson[];
}

export interface CourseContentBreakdown {
    label: string;
    xp: number;
    /** 0 - 100 */
    progress: number;
    kind: "video" | "test" | "lab";
}

export interface Course {
    courseId: string;
    title: string;
    /** Compact name for tight spaces such as goal cards ("CCNA"); falls back to `title`. */
    shortTitle?: string;
    /** Trailing words rendered in the accent colour on the detail page. */
    titleAccent: string;
    tagline: string;
    description: string[];
    status: CourseStatus;
    /** 0 - 100 */
    progress: number;
    accent: string;
    accentDark: string;
    art: string;
    /** Key-art theme used by the My Courses banner and mission cards. */
    theme: CourseThemeKey;
    /** Hexagonal mission emblem image (URL or /public path). */
    emblem: string;
    totalLevels: number;
    totalBadges: number;
    totalXp: number;
    earnedXp: number;
    totalLabs: number;
    totalKnowledgeChecks: number;
    batchRank: number;
    videoDuration: string;
    activityDuration: string;
    weeks: string;
    currentLevelLabel: string;
    trailerDuration: string;
    instructors: CourseInstructor[];
    content: CourseContentBreakdown[];
    levels: CourseLevel[];
}

export interface LessonThumb {
    src: string;
    /** Scrim painted over the artwork (Figma bakes a different one per thumbnail). */
    overlay: string;
}

const THUMBS = "/my-courses/course/levels/thumbs";
const FLAT_SCRIM = "rgba(0,0,0,0.2)";
const TOP_SCRIM = "linear-gradient(180deg, rgba(0,0,0,0.44) 0%, rgba(102,102,102,0) 100%)";

/** Lesson thumbnail artwork, cycled by `CourseLesson.art`. */
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

const INSTRUCTORS: CourseInstructor[] = [
    { instructorId: "i-1", name: "Kushali Singh", designation: "Senior Security Manager", avatar: "https://i.pravatar.cc/80?img=47" },
    { instructorId: "i-2", name: "Kushal Korde", designation: "Senior Security Manager", avatar: "https://i.pravatar.cc/80?img=12" },
    { instructorId: "i-3", name: "Maya Lin", designation: "Lead Cybersecurity Analyst", avatar: "https://i.pravatar.cc/80?img=32" },
    { instructorId: "i-4", name: "Ethan Patel", designation: "Chief Risk Officer", avatar: "https://i.pravatar.cc/80?img=15" },
];

function lesson(
    id: string,
    title: string,
    art: number,
    opts: Partial<CourseLesson> = {},
): CourseLesson {
    return {
        lessonId: id,
        title,
        kind: "video",
        tasks: 4,
        duration: "2h 12min",
        xp: 80,
        extraInstructors: 0,
        completed: false,
        art,
        ...opts,
    };
}

const CCNA_LEVELS: CourseLevel[] = [
    {
        levelId: "lvl-1",
        levelNo: 1,
        title: "Welcome",
        progress: 100,
        lessons: [
            lesson("ls-1-1", "About CCNA", 0, {
                tasks: 0,
                duration: "2min",
                xp: 8,
                completed: true,
                watched: 100,
            }),
        ],
    },
    {
        levelId: "lvl-2",
        levelNo: 2,
        title: "Introduction About CCNA and Computer Hardware",
        progress: 60,
        lessons: [
            lesson("ls-2-1", "Explain Cisco and CCNA Certification", 1, {
                tasks: 0,
                duration: "2min",
                xp: 12,
                completed: true,
            }),
            lesson("ls-2-2", "Explain Computer Hardware", 2),
            lesson("ls-2-3", "Computer Memory - Internal and External", 3),
            lesson("ls-2-4", "Network Interface Card (NIC)", 4),
            lesson("ls-2-5", "CPU and types of CPU - Manufacture (Intel and AMD)", 5),
            lesson("ls-2-6", "GPU and types of GPU - Manufacture (Intel and NVIDIA)", 6),
            lesson("ls-2-7", "Motherboard Architecture", 7, { instructor: "Kushal Korde", extraInstructors: 2 }),
        ],
    },
    {
        levelId: "lvl-3",
        levelNo: 3,
        title: "Networking Fundamentals and the OSI Model",
        progress: 0,
        lessons: [
            lesson("ls-3-1", "What is a Network and Why it Matters", 1),
            lesson("ls-3-2", "OSI Model - All Seven Layers Explained", 2),
            lesson("ls-3-3", "TCP/IP Model and Protocol Stack", 3, { kind: "lab", xp: 120 }),
            lesson("ls-3-4", "Knowledge Check - Networking Basics", 4, { kind: "quiz", tasks: 20, duration: "25min", xp: 60 }),
        ],
    },
    {
        levelId: "lvl-4",
        levelNo: 4,
        title: "IP Addressing, Subnetting and VLSM",
        progress: 0,
        lessons: [
            lesson("ls-4-1", "IPv4 Addressing and Address Classes", 5),
            lesson("ls-4-2", "Subnetting Made Simple", 0),
            lesson("ls-4-3", "VLSM and Route Summarisation Lab", 1, { kind: "lab", xp: 150 }),
            lesson("ls-4-4", "IPv6 Fundamentals", 2),
        ],
    },
];

function makeLevels(seed: string, count: number): CourseLevel[] {
    return Array.from({ length: count }, (_, i) => ({
        levelId: `${seed}-lvl-${i + 1}`,
        levelNo: i + 1,
        title: `Module ${i + 1} - Core Concepts`,
        progress: 0,
        lessons: Array.from({ length: 4 }, (_, j) =>
            lesson(`${seed}-ls-${i + 1}-${j + 1}`, `Lesson ${j + 1} - Foundations`, (i + j) % LESSON_THUMBS.length),
        ),
    }));
}

const DEFAULT_CONTENT: CourseContentBreakdown[] = [
    { label: "Video", xp: 100, progress: 2.4, kind: "video" },
    { label: "Knowledge Test", xp: 150, progress: 1.2, kind: "test" },
    { label: "Labs", xp: 200, progress: 1.6, kind: "lab" },
];

export const COURSES: Course[] = [
    {
        courseId: "ccna",
        title: "Cisco Certified Network Associate",
        shortTitle: "CCNA",
        titleAccent: "Network Associate",
        tagline: "Master real world offensive security",
        description: [
            "Your first step into networking. The CCNA course equips you with the knowledge and confidence to build a strong career foundation in networking and cybersecurity.",
            "Whether you're stepping into IT for the first time or formalizing skills you already have, this module gives you everything you need to move forward.",
        ],
        status: "Active",
        progress: 0,
        accent: "#7c3aed",
        accentDark: "#4c1d95",
        art: "radial-gradient(80% 140% at 85% 10%, #a855f7 0%, rgba(168,85,247,0) 58%), linear-gradient(115deg, #4c1d95 0%, #6d28d9 45%, #2e1065 100%)",
        theme: "violet",
        emblem: "/my-courses/emblems/ccna.png",
        totalLevels: 44,
        totalBadges: 24,
        totalXp: 5000,
        earnedXp: 0,
        totalLabs: 103,
        totalKnowledgeChecks: 146,
        batchRank: 12,
        videoDuration: "124h 22m",
        activityDuration: "42h 12m",
        weeks: "8-10 Weeks",
        currentLevelLabel: "LEVEL 1 - Cybersecurity Fundamentals",
        trailerDuration: "2mins",
        instructors: INSTRUCTORS,
        content: DEFAULT_CONTENT,
        levels: CCNA_LEVELS,
    },
    {
        courseId: "bug-bounty",
        title: "Bug Bounty",
        titleAccent: "Bounty",
        tagline: "Master real world offensive security",
        description: [
            "Hunt vulnerabilities the way professional researchers do. Learn reconnaissance, exploitation and responsible disclosure on real targets.",
            "This mission unlocks once you complete your active mission.",
        ],
        status: "Locked",
        progress: 0,
        accent: "#f43f5e",
        accentDark: "#881337",
        art: "radial-gradient(80% 140% at 85% 10%, #fb7185 0%, rgba(251,113,133,0) 58%), linear-gradient(115deg, #7f1d1d 0%, #b91c1c 45%, #2a0509 100%)",
        theme: "crimson",
        emblem: "/my-courses/emblems/bug-bounty.png",
        totalLevels: 44,
        totalBadges: 24,
        totalXp: 5000,
        earnedXp: 0,
        totalLabs: 62,
        totalKnowledgeChecks: 88,
        batchRank: 12,
        videoDuration: "68h 40m",
        activityDuration: "31h 05m",
        weeks: "8-10 Weeks",
        currentLevelLabel: "LEVEL 1 - Recon Fundamentals",
        trailerDuration: "3mins",
        instructors: INSTRUCTORS.slice(0, 3),
        content: DEFAULT_CONTENT,
        levels: makeLevels("bb", 4),
    },
    {
        courseId: "soft-skill",
        title: "Soft Skill",
        titleAccent: "Skill",
        tagline: "Master real world offensive security",
        description: [
            "Communication, interview readiness and workplace confidence for cybersecurity professionals.",
            "This mission unlocks once you complete your active mission.",
        ],
        status: "Locked",
        progress: 0,
        accent: "#f59e0b",
        accentDark: "#78350f",
        art: "radial-gradient(80% 140% at 85% 10%, #fbbf24 0%, rgba(251,191,36,0) 58%), linear-gradient(115deg, #78350f 0%, #c2410c 45%, #200e02 100%)",
        theme: "amber",
        emblem: "/my-courses/emblems/soft-skill.png",
        totalLevels: 44,
        totalBadges: 24,
        totalXp: 5000,
        earnedXp: 0,
        totalLabs: 18,
        totalKnowledgeChecks: 40,
        batchRank: 12,
        videoDuration: "22h 10m",
        activityDuration: "12h 30m",
        weeks: "8-10 Weeks",
        currentLevelLabel: "LEVEL 1 - Communication Basics",
        trailerDuration: "2mins",
        instructors: INSTRUCTORS.slice(1, 4),
        content: DEFAULT_CONTENT,
        levels: makeLevels("ss", 4),
    },
    {
        courseId: "ethical-hacking",
        title: "Ethical Hacking",
        titleAccent: "Hacking",
        tagline: "Master real world offensive security",
        description: [
            "Think like an attacker. Scanning, enumeration, exploitation and post exploitation across Windows and Linux estates.",
            "This mission unlocks once you complete your active mission.",
        ],
        status: "Locked",
        progress: 0,
        accent: "#8b5cf6",
        accentDark: "#3730a3",
        art: "radial-gradient(80% 140% at 85% 10%, #818cf8 0%, rgba(129,140,248,0) 58%), linear-gradient(115deg, #312e81 0%, #6d28d9 45%, #140d33 100%)",
        theme: "indigo",
        emblem: "/my-courses/emblems/ethical-hacking.png",
        totalLevels: 44,
        totalBadges: 24,
        totalXp: 5000,
        earnedXp: 0,
        totalLabs: 96,
        totalKnowledgeChecks: 120,
        batchRank: 12,
        videoDuration: "92h 15m",
        activityDuration: "48h 20m",
        weeks: "8-10 Weeks",
        currentLevelLabel: "LEVEL 1 - Attacker Mindset",
        trailerDuration: "4mins",
        instructors: INSTRUCTORS,
        content: DEFAULT_CONTENT,
        levels: makeLevels("eh", 4),
    },
    {
        courseId: "cloud-security",
        title: "Cloud Security",
        titleAccent: "Security",
        tagline: "Master real world offensive security",
        description: [
            "Secure AWS, Azure and GCP workloads. Identity, network isolation, logging and incident response in the cloud.",
            "This mission unlocks once you complete your active mission.",
        ],
        status: "Locked",
        progress: 0,
        accent: "#06b6d4",
        accentDark: "#155e75",
        art: "radial-gradient(80% 140% at 85% 10%, #22d3ee 0%, rgba(34,211,238,0) 58%), linear-gradient(115deg, #134e4a 0%, #0e7490 45%, #04171a 100%)",
        theme: "teal",
        emblem: "/my-courses/emblems/cloud-security.png",
        totalLevels: 44,
        totalBadges: 24,
        totalXp: 5000,
        earnedXp: 0,
        totalLabs: 54,
        totalKnowledgeChecks: 76,
        batchRank: 12,
        videoDuration: "58h 45m",
        activityDuration: "27h 40m",
        weeks: "8-10 Weeks",
        currentLevelLabel: "LEVEL 1 - Shared Responsibility",
        trailerDuration: "3mins",
        instructors: INSTRUCTORS.slice(0, 2),
        content: DEFAULT_CONTENT,
        levels: makeLevels("cs", 4),
    },
    {
        courseId: "soc-analyst",
        title: "SOC Analyst",
        titleAccent: "Analyst",
        tagline: "Master real world defensive security",
        description: [
            "Triage alerts, hunt threats and run investigations inside a modern security operations centre.",
            "This mission unlocks once you complete your active mission.",
        ],
        status: "Locked",
        progress: 0,
        accent: "#10b981",
        accentDark: "#065f46",
        art: "radial-gradient(80% 140% at 85% 10%, #34d399 0%, rgba(52,211,153,0) 58%), linear-gradient(115deg, #064e3b 0%, #047857 45%, #03120d 100%)",
        theme: "crimson",
        emblem: "/my-courses/emblems/bug-bounty.png",
        totalLevels: 44,
        totalBadges: 24,
        totalXp: 5000,
        earnedXp: 0,
        totalLabs: 71,
        totalKnowledgeChecks: 94,
        batchRank: 12,
        videoDuration: "64h 05m",
        activityDuration: "35h 15m",
        weeks: "8-10 Weeks",
        currentLevelLabel: "LEVEL 1 - SOC Foundations",
        trailerDuration: "2mins",
        instructors: INSTRUCTORS.slice(1, 3),
        content: DEFAULT_CONTENT,
        levels: makeLevels("soc", 4),
    },
];

export interface LearnerRank {
    level: number;
    title: string;
    totalPoints: number;
    totalBadges: number;
    highestStreak: number;
    batchRank: number;
    coursesCompleted: number;
    coursesTotal: number;
    levelsCompleted: number;
    levelsTotal: number;
    labsCompleted: number;
    labsTotal: number;
    nextMilestone: { title: string; description: string; /** Illustration URL or /public path. */ icon: string };
}

export const LEARNER_RANK: LearnerRank = {
    level: 1,
    title: "Cyber Explorer",
    totalPoints: 10,
    totalBadges: 1,
    highestStreak: 0,
    batchRank: 1,
    coursesCompleted: 0,
    coursesTotal: COURSES.length,
    levelsCompleted: 3,
    levelsTotal: 6000,
    labsCompleted: 1,
    labsTotal: 6000,
    nextMilestone: {
        title: "Reach Level 5",
        description: "Unlock exciting badges and earn points.Unlock exciting badges and earn points. Unlock exciting badges and earn points.",
        icon: "/my-courses/rank/milestone-level.png",
    },
};

export function findCourse(courseId: string): Course | undefined {
    return COURSES.find((course) => course.courseId === courseId);
}

export function activeCourse(): Course {
    return COURSES.find((course) => course.status === "Active") ?? COURSES[0];
}

export function courseStatusBadge(status: CourseStatus): { label: string; bg: string; fg: string } {
    if (status === "Active") return { label: "Active Mission", bg: "#1e1b3a", fg: "#c4b5fd" };
    if (status === "Completed") return { label: "Completed", bg: "#052e2b", fg: "#34d399" };
    return { label: "Mission Locked", bg: "#16161f", fg: "#9a9aab" };
}

export function totalLessons(course: Course): number {
    return course.levels.reduce((sum, level) => sum + level.lessons.length, 0);
}
