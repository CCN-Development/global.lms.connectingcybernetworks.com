// Mock data source — swap for a PracticeLabContext once the labs API exists.

export type LabDifficulty = "Easy" | "Intermediate" | "Hard";
export type LabAccess = "Free" | "Paid";
export type LabRoomType = "Guided" | "Challenge" | "Walkthrough";

export type LabTaskBlock =
    | { kind: "banner"; caption: string }
    | { kind: "text"; heading?: string; body: string }
    | { kind: "question"; questionId: string; prompt: string; answer: string; hint: string };

export interface PracticeLabTask {
    taskId: string;
    title: string;
    blocks: LabTaskBlock[];
}

export interface PracticeLab {
    practiceLabId: string;
    title: string;
    description: string;
    overview: string;
    objectives: string[];
    prerequisites: string[];
    tags: string[];
    category: string;
    difficulty: LabDifficulty;
    access: LabAccess;
    roomType: LabRoomType;
    xp: number;
    points: number;
    durationMinutes: number;
    /** 0 - 100 */
    progress: number;
    isNew: boolean;
    /** Index into the card artwork palette. */
    art: number;
    tasks: PracticeLabTask[];
    solution: { title: string; body: string }[];
}

export const DIFFICULTY_COLORS: Record<LabDifficulty, string> = {
    Easy: "#10b981",
    Intermediate: "#f59e0b",
    Hard: "#f43f5e",
};

/** Layered gradients that stand in for the aurora artwork on each card. */
export const LAB_ART: string[] = [
    "radial-gradient(65% 110% at 84% 12%, #ff2fb0 0%, rgba(255,47,176,0) 55%), radial-gradient(70% 120% at 60% -8%, #7c3aed 0%, rgba(124,58,237,0) 58%), radial-gradient(80% 115% at 34% 4%, #1d4ed8 0%, rgba(29,78,216,0) 62%), radial-gradient(55% 95% at 97% 52%, #06b6d4 0%, rgba(6,182,212,0) 60%), #05060d",
    "radial-gradient(60% 105% at 20% 8%, #009DFF 0%, rgba(0,157,255,0) 55%), radial-gradient(70% 120% at 55% -6%, #6d28d9 0%, rgba(109,40,217,0) 58%), radial-gradient(65% 110% at 88% 18%, #c026d3 0%, rgba(192,38,211,0) 60%), radial-gradient(50% 90% at 5% 45%, #0e7490 0%, rgba(14,116,144,0) 62%), #05060d",
    "radial-gradient(60% 110% at 75% 6%, #4338ca 0%, rgba(67,56,202,0) 58%), radial-gradient(70% 115% at 45% -10%, #db2777 0%, rgba(219,39,119,0) 55%), radial-gradient(75% 120% at 15% 10%, #06b6d4 0%, rgba(6,182,212,0) 60%), radial-gradient(55% 95% at 92% 48%, #7c3aed 0%, rgba(124,58,237,0) 62%), #05060d",
    "radial-gradient(62% 108% at 88% 10%, #7c3aed 0%, rgba(124,58,237,0) 56%), radial-gradient(72% 118% at 50% -8%, #009DFF 0%, rgba(0,157,255,0) 58%), radial-gradient(70% 112% at 22% 6%, #f43f5e 0%, rgba(244,63,94,0) 55%), radial-gradient(52% 92% at 8% 50%, #4338ca 0%, rgba(67,56,202,0) 62%), #05060d",
];

const SOC_TASK: PracticeLabTask = {
    taskId: "task-1",
    title: "Task 1",
    blocks: [
        { kind: "banner", caption: "Security Operations Center — live alert triage" },
        {
            kind: "text",
            body: "In this lab environment, you will be provided with GUI access to a Kali machine. The target machines will be accessible at demo.ine.local running a vulnerable RDP service.",
        },
        {
            kind: "text",
            heading: "SOC and your team",
            body: "You are not alone in monitoring the alerts and securing the whole company. A lot of people support you with your job. SOC engineers are configuring the security tools, senior analysts are helping with complex attacks, and a manager is trying to keep everything under control. A Security Operations Center (SOC) is your big team that protects the company, each role in its own way. Now, let's meet your colleagues!",
        },
        {
            kind: "question",
            questionId: "q-1",
            prompt: "What was the malicious IP address in the alerts?",
            answer: "221.181.185.159",
            hint: "Sort the alert table by source address and look for the host repeating across every failed RDP attempt.",
        },
        {
            kind: "text",
            heading: "Your daily duties",
            body: "Are you inspired by your colleagues' work and wish to advance to their level one day? Start by mastering the fundamentals — triage every alert, document what you see, and escalate anything you cannot confidently close. Consistency beats brilliance in a SOC.",
        },
    ],
};

const SOC_TASK_2: PracticeLabTask = {
    taskId: "task-2",
    title: "Task 2",
    blocks: [
        {
            kind: "text",
            heading: "Building your own tooling",
            body: "Manual triage does not scale. In this task you will write a small Python utility that parses the exported alert log, groups events by source address, and flags any host crossing the brute-force threshold.",
        },
        {
            kind: "question",
            questionId: "q-2",
            prompt: "How many failed authentication attempts did the malicious host generate?",
            answer: "148",
            hint: "Run your parser against auth.log and count only the EventID 4625 rows for the flagged address.",
        },
        {
            kind: "text",
            heading: "Wrapping up",
            body: "Once the script reports the correct count, export the result to CSV and attach it to the incident ticket. That artefact is what your senior analyst will review during handover.",
        },
    ],
};

const TITLES: { title: string; description: string; category: string }[] = [
    { title: "Custom Tooling Using Python", description: "Create custom tooling for application testing using Python", category: "Offensive Security" },
    { title: "SOC Alert Triage Fundamentals", description: "Investigate and classify real alerts inside a live SOC console", category: "Blue Team" },
    { title: "VLSM & Subnetting Practice", description: "Design an addressing plan for a multi site enterprise network", category: "CCNA" },
    { title: "RDP Brute Force Detection", description: "Detect and contain a brute force attack against an RDP service", category: "Blue Team" },
    { title: "Linux Privilege Escalation", description: "Escalate from a low privileged shell to root on a hardened host", category: "Offensive Security" },
    { title: "Packet Analysis With Wireshark", description: "Read captures and reconstruct the attacker session end to end", category: "Network Security" },
    { title: "Static Routing Lab", description: "Configure and verify static routes across three branch routers", category: "CCNA" },
    { title: "Web App Injection Testing", description: "Find and exploit injection flaws in a deliberately vulnerable app", category: "Web Security" },
    { title: "Firewall Policy Hardening", description: "Audit an overly permissive ruleset and rebuild it safely", category: "Network Security" },
    { title: "Windows Event Log Forensics", description: "Rebuild an intrusion timeline purely from Windows event logs", category: "Blue Team" },
    { title: "OSPF Multi Area Configuration", description: "Deploy and troubleshoot a multi area OSPF topology", category: "CCNP" },
    { title: "Malware Traffic Identification", description: "Spot command and control beacons hiding inside normal traffic", category: "Threat Hunting" },
];

const DIFFICULTIES: LabDifficulty[] = ["Easy", "Intermediate", "Hard"];
const ROOM_TYPES: LabRoomType[] = ["Guided", "Challenge", "Walkthrough"];
const PROGRESS_CYCLE = [10, 0, 100, 0, 45, 100, 0, 72, 100, 0, 30, 100];

export const PRACTICE_LABS: PracticeLab[] = TITLES.map((entry, index) => {
    const difficulty = DIFFICULTIES[index % 3];
    return {
        practiceLabId: `lab-${index + 1}`,
        title: entry.title,
        description: entry.description,
        category: entry.category,
        overview:
            "This lab drops you into a realistic environment with no hand holding. Work through each task in order, answer the embedded questions to confirm your findings, and use the solution tab only once you are genuinely stuck.",
        objectives: [
            "Navigate a live target environment from a provisioned Kali workstation",
            "Collect evidence and validate every finding before reporting it",
            "Automate the repetitive part of the workflow with a small custom tool",
            "Document the outcome the way a real engagement report expects",
        ],
        prerequisites: [
            "Comfortable with the Linux command line",
            "Basic understanding of TCP/IP and common service ports",
            "Python fundamentals — loops, files and string parsing",
        ],
        tags: ["python", "tooling", "blue-team", "automation"],
        difficulty,
        access: index % 4 === 3 ? "Paid" : "Free",
        roomType: ROOM_TYPES[index % 3],
        xp: 75,
        points: 150,
        durationMinutes: 20,
        progress: PROGRESS_CYCLE[index],
        isNew: index % 3 === 1,
        art: index % LAB_ART.length,
        tasks: [SOC_TASK, SOC_TASK_2],
        solution: [
            {
                title: "Identifying the malicious host",
                body: "Open the alerts console and group the failed logon events by source address. A single external host accounts for the overwhelming majority of EventID 4625 entries — that address is 221.181.185.159.",
            },
            {
                title: "Counting the attempts",
                body: "Export the filtered alert set and run your parser over it. Counting only EventID 4625 rows belonging to the flagged address returns 148 failed attempts within the capture window.",
            },
            {
                title: "Containment",
                body: "Block the address at the perimeter firewall, force a password reset for every targeted account, and raise an incident ticket with the exported CSV attached as evidence.",
            },
        ],
    };
});

export function findPracticeLab(labId: string): PracticeLab | undefined {
    return PRACTICE_LABS.find((lab) => lab.practiceLabId === labId);
}

export function labStatusBadge(lab: PracticeLab): { label: string; bg: string; fg: string } {
    if (lab.progress >= 100) return { label: "100% completed", bg: "#10b981", fg: "#04241c" };
    if (lab.isNew && lab.progress === 0) return { label: "Newly Added", bg: "#f43f5e", fg: "#3d0713" };
    if (lab.progress > 0) return { label: `${lab.progress}% completed`, bg: "#009DFF", fg: "#031f33" };
    return { label: "Not Started", bg: "#2a2a35", fg: "#c9c9d4" };
}
