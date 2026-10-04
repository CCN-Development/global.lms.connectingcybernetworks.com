import { BookOpen, File, FileText, MessageCircle, type LucideIcon } from "lucide-react";

export interface AishQuickAction {
    label: string;
    icon?: LucideIcon;
}

export interface AishMessage {
    id: string;
    role: "user" | "assistant";
    text: string;
    time: string;
    actions?: AishQuickAction[];
}

export interface AishChatThread {
    id: string;
    title: string;
    meta?: string;
    messages: AishMessage[];
}

export interface AishChatGroup {
    label: string;
    items: AishChatThread[];
}

export const ASSISTANT_PROMPT = "Great! What would you like to know about your course?";

export const ROOT_ACTIONS: AishQuickAction[] = [
    { label: "Course & Labs", icon: BookOpen },
    { label: "Fees", icon: File },
    { label: "Talk to Someone", icon: MessageCircle },
    { label: "Exams", icon: FileText },
];

/** Follow-up chips Ash offers after a quick action is picked. */
export const ACTION_FLOWS: Record<string, string[]> = {
    "Course & Labs": ["My Course Progress", "Topics & Lessons", "Labs", "Course Schedule"],
    Labs: ["My Labs", "Lab Instructions", "Lab Submission", "Lab Results"],
    Fees: ["Fee Structure", "Payment History", "Pending Dues", "Download Receipt"],
    "Talk to Someone": ["My Trainer", "Relationship Manager", "Support Team", "Raise a Request"],
    Exams: ["Exam Schedule", "Exam Syllabus", "My Results", "Hall Ticket"],
};

let seq = 0;
const user = (text: string, time: string): AishMessage => ({ id: `m${(seq += 1)}`, role: "user", text, time });
const ash = (text: string, time: string, actions?: string[]): AishMessage => ({
    id: `m${(seq += 1)}`,
    role: "assistant",
    text,
    time,
    actions: actions?.map((label) => ({ label })),
});

export const CHAT_HISTORY: AishChatGroup[] = [
    {
        label: "TODAY",
        items: [
            {
                id: "t1",
                title: "Lab Information",
                messages: [
                    user("Course & Labs", "12:04 PM"),
                    ash(ASSISTANT_PROMPT, "12:04 PM", ACTION_FLOWS["Course & Labs"]),
                    user("Labs", "12:04 PM"),
                    ash(ASSISTANT_PROMPT, "12:04 PM", ACTION_FLOWS.Labs),
                ],
            },
            {
                id: "t2",
                title: "Batch Updates",
                messages: [
                    user("Any updates on my batch?", "10:18 AM"),
                    ash(
                        "Your batch CCN-CEH-14 moves to the evening slot, 7:00 PM to 9:00 PM, starting Monday. Weekend doubt sessions stay at 11:00 AM.",
                        "10:18 AM",
                        ["Batch Schedule", "Trainer Details", "Attendance"],
                    ),
                ],
            },
        ],
    },
    {
        label: "OLDER",
        items: [
            {
                id: "o1",
                title: "Help with my lab submission",
                messages: [
                    user("I can't upload my lab report", "4:36 PM"),
                    ash(
                        "Submissions accept PDF or ZIP files up to 25 MB. If the upload stalls, rename the file without spaces and try again from the lab detail page.",
                        "4:36 PM",
                        ["Lab Submission", "Upload Guidelines", "Raise a Request"],
                    ),
                ],
            },
            {
                id: "o2",
                title: "When is my next exam?",
                messages: [
                    user("When is my next exam?", "9:12 AM"),
                    ash("Your next exam is Network Security — Module 3, on 14 Oct at 10:00 AM in Lab B.", "9:12 AM", [
                        "Exam Schedule",
                        "Hall Ticket",
                        "Exam Syllabus",
                    ]),
                ],
            },
            {
                id: "o3",
                title: "Exam Syllabus",
                messages: [
                    user("Exams", "2:05 PM"),
                    ash(ASSISTANT_PROMPT, "2:05 PM", ACTION_FLOWS.Exams),
                    user("Exam Syllabus", "2:06 PM"),
                    ash(
                        "Module 3 covers firewalls, IDS/IPS, VPN tunnelling and packet analysis. Labs 7 to 11 are part of the practical section.",
                        "2:06 PM",
                        ["Download Syllabus", "Topics & Lessons", "Exam Preparation"],
                    ),
                ],
            },
            {
                id: "o4",
                title: "Fee Payment Deadline",
                messages: [
                    user("Fees", "11:40 AM"),
                    ash(ASSISTANT_PROMPT, "11:40 AM", ACTION_FLOWS.Fees),
                    user("Pending Dues", "11:41 AM"),
                    ash("Instalment 3 of ₹18,000 is due on 20 Oct. No late fee applies until 25 Oct.", "11:41 AM", [
                        "Pay Now",
                        "Payment History",
                        "Download Receipt",
                    ]),
                ],
            },
            {
                id: "o5",
                title: "Placement Requirements",
                messages: [
                    user("What do I need for placements?", "6:22 PM"),
                    ash(
                        "You need 75% attendance, all labs submitted, and Module 1 to 3 cleared. Your resume also has to be approved by the placement cell.",
                        "6:22 PM",
                        ["Placement Eligibility", "Resume Help", "Talk to Someone"],
                    ),
                ],
            },
            {
                id: "o6",
                title: "Course Access",
                messages: [
                    user("My course videos are locked", "8:55 PM"),
                    ash(
                        "Module 4 unlocks once Module 3 labs are graded. Your last two labs are still in review, expected within 48 hours.",
                        "8:55 PM",
                        ["My Course Progress", "Lab Results", "Raise a Request"],
                    ),
                ],
            },
            {
                id: "o7",
                title: "Resume Help",
                messages: [
                    user("Can you review my resume?", "1:30 PM"),
                    ash(
                        "Upload it under Placement and I will check formatting, keywords and project descriptions against the CCN template.",
                        "1:30 PM",
                        ["Resume Template", "Upload Resume", "Talk to Someone"],
                    ),
                ],
            },
            {
                id: "o8",
                title: "Exam Preparation",
                messages: [
                    user("How should I prepare for Module 3?", "7:48 AM"),
                    ash(
                        "Start with the recorded sessions for Labs 7 to 11, then attempt the two mock tests. Most students clear it after the second mock.",
                        "7:48 AM",
                        ["Mock Tests", "Exam Syllabus", "Course Schedule"],
                    ),
                ],
            },
            {
                id: "o9",
                title: "Lab 4 Submission Help",
                messages: [
                    user("Lab 4 is marked incomplete", "3:14 PM"),
                    ash(
                        "Lab 4 needs both the scan output and the written analysis. Only the scan output was received, so resubmit with the analysis attached.",
                        "3:14 PM",
                        ["Lab Instructions", "Lab Submission", "My Labs"],
                    ),
                ],
            },
            {
                id: "o10",
                title: "Placement Eligibility",
                messages: [
                    user("Am I eligible for placements?", "5:02 PM"),
                    ash("You are at 81% attendance and 9 of 11 labs submitted. Clear the remaining two labs to become eligible.", "5:02 PM", [
                        "My Labs",
                        "Attendance",
                        "Placement Requirements",
                    ]),
                ],
            },
            {
                id: "o11",
                title: "Batch Updates",
                messages: [
                    user("Was today's session rescheduled?", "9:05 AM"),
                    ash("Yes, today's session shifts to 8:00 PM. The trainer shared a recording link for anyone who cannot attend.", "9:05 AM", [
                        "Batch Schedule",
                        "Session Recording",
                    ]),
                ],
            },
            {
                id: "o12",
                title: "Job Application",
                messages: [
                    user("How do I apply for the SOC Analyst role?", "12:50 PM"),
                    ash(
                        "The SOC Analyst opening at Cybernetics closes on 18 Oct. Apply from the Placement tab once your resume is approved.",
                        "12:50 PM",
                        ["Open Roles", "Resume Help", "Placement Eligibility"],
                    ),
                ],
            },
            {
                id: "o13",
                title: "Exam Schedule",
                messages: [
                    user("Exam Schedule", "10:33 AM"),
                    ash(
                        "Module 3 theory is on 14 Oct at 10:00 AM and the practical is on 16 Oct at 2:00 PM. Both are in Lab B.",
                        "10:33 AM",
                        ["Hall Ticket", "Exam Syllabus", "My Results"],
                    ),
                ],
            },
            {
                id: "o14",
                title: "Batch Updates",
                meta: "2 days ago",
                messages: [
                    user("Any change in the weekend session?", "4:10 PM"),
                    ash("The Sunday doubt session moves to Saturday 11:00 AM this week only.", "4:10 PM", ["Batch Schedule", "Attendance"]),
                ],
            },
        ],
    },
];

export const THREADS_BY_ID: Record<string, AishChatThread> = Object.fromEntries(
    CHAT_HISTORY.flatMap((group) => group.items).map((thread) => [thread.id, thread]),
);
