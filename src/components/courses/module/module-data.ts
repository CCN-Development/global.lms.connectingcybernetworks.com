// Mock data for the module page and its quiz / lab activities — swap for API data once the endpoints exist.

import { MY_COURSES_ASSETS } from "../my-courses-theme";

export const MODULE_ASSETS = `${MY_COURSES_ASSETS}/module`;
export const ACTIVITY_ASSETS = `${MY_COURSES_ASSETS}/activity`;

export type ModuleLessonKind = "video" | "quiz" | "theory" | "lab";

/** Rich-text blocks shared by theory lessons and the lab Task / Solution tabs. */
export type ContentBlock =
    | { type: "heading"; text: string }
    | { type: "paragraph"; text: string }
    /** Muted uppercase caption with one or more lines below it ("NOTE", "STEP 1"). */
    | { type: "field"; label: string; lines: string[] }
    | { type: "list"; items: string[] }
    | { type: "links"; items: { label: string; href: string }[] }
    | { type: "image"; src: string; alt: string; /** width / height */ ratio: number };

export interface ModuleVideo {
    poster: string;
    /** Title card baked over the poster ("Computer Hardware"). */
    caption: string;
    /** Playable source; the poster stays up until one is provided. */
    src?: string;
}

export interface ModuleLesson {
    lessonId: string;
    title: string;
    kind: ModuleLessonKind;
    duration: string;
    xp: number;
    completed: boolean;
    /** Video only: 0 - 100 playback progress. */
    watched?: number;
    video?: ModuleVideo;
    theory?: ContentBlock[];
    quizId?: string;
    labId?: string;
}

export interface ModuleSection {
    sectionId: string;
    /** Small caps label above the title ("TASK 1"). */
    eyebrow?: string;
    title: string;
    lessons: ModuleLesson[];
}

export interface CourseModule {
    moduleId: string;
    title: string;
    /** Trailing words rendered in purple. */
    titleAccent: string;
    description: string[];
    intro: ModuleVideo;
    videoContent: string;
    handsOnActivity: string;
    pointsEarned: number;
    instructor: { name: string; avatar: string };
    extraInstructors: number;
    /** Level the "Continue to Level N" CTA points at once the module's lab is done. */
    nextLevelNo: number;
    sections: ModuleSection[];
}

export interface QuizQuestion {
    questionId: string;
    prompt: string;
    options: string[];
    /** Index into `options`. */
    answer: number;
    explanation: string;
}

export interface Quiz {
    quizId: string;
    title: string;
    intro: string[];
    /** Shown on the intro card ("~3 min"). */
    estimate: string;
    timeLimitSec: number;
    points: number;
    /** Extra XP once the score ratio reaches `threshold` (0 - 1). */
    accuracyBonus: { threshold: number; xp: number };
    questions: QuizQuestion[];
}

export interface Lab {
    labId: string;
    title: string;
    intro: string[];
    tasks: number;
    duration: string;
    points: number;
    /** XP deducted when the learner gives up and opens the solution. */
    solutionPenalty: number;
    /** How long the environment takes to provision. */
    buildSeconds: number;
    /** Opened in a new tab once the environment is ready. */
    url?: string;
    overview: string;
    task: ContentBlock[];
    solution: ContentBlock[];
}

const INTRO_VIDEO: ModuleVideo = { poster: `${MODULE_ASSETS}/hero-thumb.png`, caption: "Computer Hardware" };
const LESSON_VIDEO: ModuleVideo = { poster: `${MODULE_ASSETS}/lesson-video-thumb.png`, caption: "Computer Hardware" };

export const QUIZZES: Record<string, Quiz> = {
    "quiz-hardware": {
        quizId: "quiz-hardware",
        title: "Knowledge Test",
        intro: ["Ready to prove what you’ve learned?", "Test your understanding, improve your skill score, and earn XP."],
        estimate: "~3 min",
        timeLimitSec: 300,
        points: 150,
        accuracyBonus: { threshold: 0.8, xp: 25 },
        questions: [
            {
                questionId: "q-1",
                prompt: "What is the primary function of the OSI Model's Network Layer?",
                options: [
                    "Routing packets across networks using IP addresses",
                    "Managing physical connections between devices",
                    "Encrypting data for secure transmission",
                    "Converting data into application-readable formats",
                ],
                answer: 0,
                explanation:
                    "The Network Layer is responsible for routing data between different networks using IP addresses. It determines the best path for data to travel from source to destination.",
            },
            {
                questionId: "q-2",
                prompt: "Which component temporarily stores data the CPU is actively working on?",
                options: ["Hard disk drive", "Random Access Memory (RAM)", "Power supply unit", "Network interface card"],
                answer: 1,
                explanation:
                    "RAM is volatile working memory. It holds the instructions and data the CPU needs right now, and is cleared when the machine powers off.",
            },
            {
                questionId: "q-3",
                prompt: "What does a Network Interface Card (NIC) provide to a computer?",
                options: [
                    "Additional graphics processing power",
                    "Long-term storage for the operating system",
                    "A physical connection to a network",
                    "Cooling for the motherboard chipset",
                ],
                answer: 2,
                explanation:
                    "A NIC connects the computer to a network over Ethernet or Wi-Fi and gives it a unique MAC address at the Data Link Layer.",
            },
        ],
    },
};

export const LABS: Record<string, Lab> = {
    "lab-rdp": {
        labId: "lab-rdp",
        title: "Lab Challenge",
        intro: ["Put your knowledge into practice.", "Complete the hands-on task, solve the challenge, and prove your skills."],
        tasks: 2,
        duration: "20 min",
        points: 150,
        solutionPenalty: 50,
        buildSeconds: 20,
        overview:
            "This lab demonstrates the process of identifying and exploiting an insecure Remote Desktop Protocol (RDP) service on a Windows machine.",
        task: [
            { type: "heading", text: "Lab Environment" },
            {
                type: "paragraph",
                text: "In this lab environment, you will be provided with GUI access to a Kali machine. The target machines will be accessible at demo.ine.local running a vulnerable RDP service.",
            },
            {
                type: "field",
                label: "NOTE",
                lines: ["rdesktop will not work on this setup as it does not support NLA. Please use xfreerdp to connect to the RDP server."],
            },
            {
                type: "field",
                label: "OBJECTIVE",
                lines: ["To fingerprint the running RDP service, then exploit the vulnerability using the appropriate method and retrieve the flag!."],
            },
            {
                type: "field",
                label: "DICTIONARIES TO USE",
                lines: [
                    "/usr/share/metasploit-framework/data/wordlists/common_users.txt",
                    "/usr/share/metasploit-framework/data/wordlists/unix_passwords.txt",
                ],
            },
            { type: "heading", text: "TOOLS" },
            { type: "paragraph", text: "The best tools for this lab are:" },
            { type: "list", items: ["Nmap", "searchsploit", "msfconsole", "xfreerdp"] },
        ],
        solution: [
            { type: "field", label: "STEP 1", lines: ["Open the lab link to access the Kali machine"] },
            { type: "image", src: `${ACTIVITY_ASSETS}/lab-solution-step-1.png`, alt: "Kali desktop after opening the lab link", ratio: 651 / 468 },
            { type: "field", label: "STEP 2", lines: ["Check if the target machine is reachable"] },
            { type: "heading", text: "Conclusion" },
            {
                type: "paragraph",
                text: "This lab demonstrates the identification of a non-default RDP port using Nmap and Metasploit, followed by a successful brute force attack with Hydra to gain access to the Windows system.",
            },
            { type: "heading", text: "References" },
            {
                type: "links",
                items: [
                    { label: "Hydra", href: "https://github.com/vanhauser-thc/thc-hydra" },
                    { label: "Metasploit Module", href: "https://www.rapid7.com/db/modules/auxiliary/scanner/rdp/rdp_scanner/" },
                ],
            },
        ],
    },
};

const DESCRIPTION = [
    "Your first step into networking. The CCNA course equips you with the knowledge and confidence to build a strong career foundation in networking and cybersecurity.",
    "Whether you're stepping into IT for the first time or formalizing skills you already have, this module gives you everything you need to move forward.",
];

function theoryFor(caption: string): ContentBlock[] {
    return [
        { type: "heading", text: `${caption} at a Glance` },
        {
            type: "paragraph",
            text: "Every computer is built from the same core parts: a CPU that executes instructions, memory that holds the data being worked on, storage that keeps data between sessions, and a motherboard that connects them all.",
        },
        { type: "field", label: "KEY TERMS", lines: ["CPU, RAM, storage, motherboard, power supply, NIC"] },
        { type: "paragraph", text: "Remember the flow:" },
        { type: "list", items: ["Input devices feed data in", "The CPU processes it using RAM", "Results are stored or sent to output devices"] },
    ];
}

function buildModule(
    moduleId: string,
    title: string,
    titleAccent: string,
    topic: string,
    caption: string,
    nextLevelNo: number,
): CourseModule {
    const lessonVideo = { ...LESSON_VIDEO, caption };
    return {
        moduleId,
        title,
        titleAccent,
        description: DESCRIPTION,
        intro: { ...INTRO_VIDEO, caption },
        videoContent: "126 h 12 m",
        handsOnActivity: "42 h 12 m",
        pointsEarned: 1200,
        instructor: { name: "Kushal Korde", avatar: `${MODULE_ASSETS}/instructor-avatar.png` },
        extraInstructors: 1,
        nextLevelNo,
        sections: [
            {
                sectionId: `${moduleId}-welcome`,
                title: "Welcome",
                lessons: [
                    {
                        lessonId: `${moduleId}-welcome-video`,
                        title: `Explain the Role and Function of ${topic}`,
                        kind: "video",
                        duration: "6m 18s",
                        xp: 12,
                        completed: true,
                        watched: 72,
                        video: lessonVideo,
                    },
                ],
            },
            {
                sectionId: `${moduleId}-task-1`,
                eyebrow: "TASK 1",
                title: `${title} ${titleAccent}`,
                lessons: [
                    {
                        lessonId: `${moduleId}-task-1-video`,
                        title: `Explain the Role and Function of ${topic}`,
                        kind: "video",
                        duration: "6m 18s",
                        xp: 12,
                        completed: false,
                        watched: 100,
                        video: lessonVideo,
                    },
                    {
                        lessonId: `${moduleId}-task-1-theory`,
                        title: `Theory: Building Blocks of ${topic}`,
                        kind: "theory",
                        duration: "4m 30s",
                        xp: 8,
                        completed: false,
                        theory: theoryFor(caption),
                    },
                    {
                        lessonId: `${moduleId}-task-1-quiz`,
                        title: `Test your knowledge: ${topic}`,
                        kind: "quiz",
                        duration: "6m 18s",
                        xp: 12,
                        completed: false,
                        quizId: "quiz-hardware",
                    },
                    {
                        lessonId: `${moduleId}-task-1-lab`,
                        title: `Lab : Role and Function of ${topic}`,
                        kind: "lab",
                        duration: "6m 18s",
                        xp: 12,
                        completed: false,
                        labId: "lab-rdp",
                    },
                ],
            },
        ],
    };
}

export const MODULES: Record<string, CourseModule> = {
    "explain-computer-hardware": buildModule("explain-computer-hardware", "Explain Computer", "Hardware", "Computer hardware", "Computer Hardware", 3),
    "computer-memory": buildModule("computer-memory", "Computer Memory -", "Internal and External", "Computer memory", "Computer Memory", 3),
    "osi-model": buildModule("osi-model", "OSI Model - All Seven", "Layers Explained", "the OSI model", "OSI Model", 4),
};

export function findModule(moduleId: string): CourseModule | undefined {
    return MODULES[moduleId];
}

export function findQuiz(quizId: string | undefined): Quiz | undefined {
    return quizId ? QUIZZES[quizId] : undefined;
}

export function findLab(labId: string | undefined): Lab | undefined {
    return labId ? LABS[labId] : undefined;
}

/** 0 - 100: finished lessons count fully, a partly watched video counts by its playback progress. */
export function sectionProgress(lessons: ModuleLesson[]): number {
    if (lessons.length === 0) return 0;
    const done = lessons.reduce(
        (sum, l) => sum + (l.completed ? 1 : l.kind === "video" ? Math.min(100, l.watched ?? 0) / 100 : 0),
        0,
    );
    return Math.round((done / lessons.length) * 100);
}
