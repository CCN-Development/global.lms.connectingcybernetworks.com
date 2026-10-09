/** Data model, design tokens and seed content for the CCN Community forum. */

export const communityAsset = (name: string) => `/community/${name}`;

// ─── Design tokens ─────────────────────────────────────────────────────────
export const CC = {
    white: "#FFFFFF",
    n75: "#F2F2F2",
    n100: "#D9D9D9",
    n200: "#BFBFBF",
    n300: "#A6A6A6",
    n400: "#8C8C8C",
    n500: "#737373",
    n700: "#404040",
    primary75: "#E3E9F8",
    primary200: "#93A9E2",
    primary500: "#2F53AD",
    primary800: "#0E1934",
    link: "#426ACC",
    purple: "#8C24FF",
    error: "#D1293D",
    modalStroke: "#508AF2",
    lmsButton:
        "linear-gradient(90deg, #0027AC 0%, #0B22AC 12.5%, #161DAC 25%, #2C14AC 43.572%, #4608AC 65.007%, #4F04AC 82.544%, #5900AC 100%)",
    cardFill:
        "linear-gradient(172deg, rgba(0,0,0,0.563) 1.338%, rgba(10,9,9,0.41) 48.715%, rgba(102,102,102,0.013) 96.091%)",
    dropdownBg: "rgba(38,38,38,0.88)",
    dropdownShadow: "0 8px 24px rgba(255,255,255,0.08)",
    dropdownActive: "rgba(147,169,226,0.12)",
    filterBg: "rgba(38,38,38,0.44)",
    menuActive: "linear-gradient(105.44deg, rgba(64,64,64,0.5) 17.578%, rgba(64,64,64,0) 111.58%)",
    pollFill: "rgba(64,64,64,0.209)",
    pollVoted: "linear-gradient(161.09deg, rgba(140,36,255,0.5) 9.016%, rgba(77,31,153,0.5) 38.607%, rgba(14,25,52,0.5) 89.867%)",
    pollOther: "rgba(217,217,217,0.04)",
} as const;

// ─── Types ─────────────────────────────────────────────────────────────────
export type CategoryId =
    | "batch-updates"
    | "lecture-discussions"
    | "lab-discussions"
    | "assignment-help"
    | "quiz-discussions"
    | "exam-preparation"
    | "general-discussion"
    | "resources-notes";

export type FeedFilter = "all" | CategoryId | "pinned" | "mine" | "saved";

export type SortKey = "latest" | "oldest" | "most-liked" | "most-replied" | "most-viewed";

export interface Category {
    id: CategoryId;
    label: string;
    color: string;
}

export interface FeedMenuItem {
    id: FeedFilter;
    label: string;
    icon: string;
    rotateIcon?: boolean;
}

export interface Author {
    id: string;
    name: string;
    role: string;
    avatar?: string;
}

export interface Attachment {
    id: string;
    name: string;
    /** 0–100; 100 means the upload has finished. */
    progress: number;
    url?: string;
}

export interface Reply {
    id: string;
    author: Author;
    createdAt: number;
    html: string;
    attachments: Attachment[];
    likes: number;
    liked: boolean;
}

export interface PollOption {
    id: string;
    text: string;
    votes: number;
}

export interface Poll {
    options: PollOption[];
    votedOptionId?: string;
}

export interface Post {
    id: string;
    categoryId: CategoryId;
    tags: string[];
    author: Author;
    createdAt: number;
    title: string;
    html: string;
    attachments?: Attachment[];
    pinnedBy?: string;
    poll?: Poll;
    likes: number;
    liked: boolean;
    views: number;
    saved: boolean;
    replies: Reply[];
}

// ─── Static lists ──────────────────────────────────────────────────────────
export const CATEGORIES: Category[] = [
    { id: "batch-updates", label: "Batch Updates", color: "#2F53AD" },
    { id: "lecture-discussions", label: "Lecture Discussions", color: "#2FAD2F" },
    { id: "lab-discussions", label: "Lab Discussions", color: "#FFAD4F" },
    { id: "assignment-help", label: "Assignment Help", color: "#737373" },
    { id: "quiz-discussions", label: "Quiz Discussions", color: "#D1293D" },
    { id: "exam-preparation", label: "Exam Preparation", color: "#8C24FF" },
    { id: "general-discussion", label: "General Discussion", color: "#FF0072" },
    { id: "resources-notes", label: "Resources & Notes", color: "#2EC4B6" },
];

export const findCategory = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;

export const FEED_MENU: FeedMenuItem[] = [
    { id: "all", label: "All Discussions", icon: "icon-layers.svg" },
    { id: "batch-updates", label: "Batch Updates", icon: "icon-grid.svg" },
    { id: "lecture-discussions", label: "Lecture Discussions", icon: "icon-copy.svg" },
    { id: "lab-discussions", label: "Lab Discussions", icon: "icon-filter.svg", rotateIcon: true },
    { id: "assignment-help", label: "Assignment Help", icon: "icon-file.svg" },
    { id: "quiz-discussions", label: "Quiz Discussions", icon: "icon-command.svg" },
    { id: "exam-preparation", label: "Exam Preparation", icon: "icon-file-text.svg" },
    { id: "general-discussion", label: "General Discussion", icon: "icon-message-circle-24.svg" },
    { id: "resources-notes", label: "Resources & Notes", icon: "icon-folder.svg" },
    { id: "pinned", label: "Pinned Posts", icon: "icon-pinned.svg" },
    { id: "mine", label: "My Discussions", icon: "icon-user.svg" },
    { id: "saved", label: "Saved Posts", icon: "icon-bookmark-24.svg" },
];

export const feedLabel = (filter: FeedFilter) => FEED_MENU.find((m) => m.id === filter)?.label ?? "All Discussions";

export const TAGS = ["General Question", "Important", "Lecture", "Bug", "Infrastructure", "Staff"];
export const MAX_TAGS = 3;

export const SORT_OPTIONS: { id: SortKey; label: string }[] = [
    { id: "latest", label: "Latest" },
    { id: "oldest", label: "Oldest" },
    { id: "most-liked", label: "Most liked" },
    { id: "most-replied", label: "Most replied" },
    { id: "most-viewed", label: "Most viewed" },
];

export const ONLINE_COUNT = 18;

// ─── People ────────────────────────────────────────────────────────────────
export const CURRENT_USER_ID = "me";

const TRAINER: Author = {
    id: "kushal-korde",
    name: "Kushal Korde",
    role: "Senior Security Manager - Trainer",
    avatar: communityAsset("avatar-trainer.png"),
};
const JOSH: Author = { id: "josh-hazelwood", name: "Josh Hazelwood", role: "Student", avatar: communityAsset("avatar-trainer.png") };
const ANONYMOUS: Author = { id: "anonymous", name: "Anonymous", role: "Student" };
const PRIYA: Author = { id: "priya-sharma", name: "Priya Sharma", role: "Student" };
const RAVI: Author = { id: "ravi-patel", name: "Ravi Patel", role: "Student" };
const NEHA: Author = { id: "neha-joshi", name: "Neha Joshi", role: "Student" };

/** People who can be @mentioned from the editors. */
export const MENTIONABLE: Author[] = [TRAINER, JOSH, PRIYA, RAVI, NEHA];

export const makeCurrentUser = (name: string, avatar?: string | null): Author => ({
    id: CURRENT_USER_ID,
    name,
    role: "Student",
    avatar: avatar || undefined,
});

// ─── Helpers ───────────────────────────────────────────────────────────────
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export function timeAgo(ts: number, now = Date.now()) {
    const diff = Math.max(0, now - ts);
    if (diff < MIN) return "Just now";
    if (diff < HOUR) return `${Math.floor(diff / MIN)} min ago`;
    if (diff < DAY) {
        const h = Math.floor(diff / HOUR);
        return `${h} hour${h > 1 ? "s" : ""} ago`;
    }
    if (diff < 2 * DAY) return "Yesterday";
    if (diff < 7 * DAY) return `${Math.floor(diff / DAY)} days ago`;
    const d = new Date(ts);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`;
}

export function longDate(ts: number) {
    const d = new Date(ts);
    return `${d.getDate()} ${d.toLocaleString("en-US", { month: "long" })}, ${d.getFullYear()}`;
}

export const pollTotal = (poll: Poll) => poll.options.reduce((sum, o) => sum + o.votes, 0);

export const pollPercent = (poll: Poll, option: PollOption) => {
    const total = pollTotal(poll);
    return total ? Math.round((option.votes / total) * 100) : 0;
};

export const htmlToText = (html: string) =>
    html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

export const escapeHtml = (text: string) =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const mentionHtml = (name: string) => `<span class="mention">@${escapeHtml(name.toLowerCase())}</span>`;

let idCounter = 0;
export const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

// ─── Seed content ──────────────────────────────────────────────────────────
const reply = (id: string, author: Author, ago: number, text: string, likes = 0, liked = false): Omit<Reply, "createdAt"> & { ago: number } => ({
    id,
    author,
    ago,
    html: `<p>${escapeHtml(text)}</p>`,
    attachments: [],
    likes,
    liked,
});

type SeedReply = ReturnType<typeof reply>;
type SeedPost = Omit<Post, "createdAt" | "replies"> & { ago?: number; at?: number; replies: SeedReply[] };

const SEED: SeedPost[] = [
    {
        id: "welcome-and-forum-guidelines",
        categoryId: "general-discussion",
        tags: [],
        author: TRAINER,
        at: new Date(2026, 4, 12, 10, 0).getTime(),
        title: "Welcome and Forum Guidelines",
        html: "<p>Hi there and welcome to our brand new support forum. This is a place for our community (that’s you) to connect with each other, ask and answer each other’s questions, share feedback, and more!</p>",
        pinnedBy: "Trainer",
        likes: 41,
        liked: false,
        views: 210,
        saved: false,
        replies: [],
    },
    {
        id: "assignment-3-deadline-extended",
        categoryId: "batch-updates",
        tags: ["Important"],
        author: TRAINER,
        ago: 8 * MIN,
        title: "Assignment 3 Deadline Extended — New Due Date: Friday 6 PM",
        html:
            "<p>Due to the lab environment issues we faced during Wednesday's session, the deadline for Assignment 3 (Network Scanning &amp; Enumeration) has been extended to Friday, 6:00 PM. Due to the lab environment issues we faced during Wednesday's session, the deadline for Assignment 3 (Network Scanning &amp; Enumeration) has been extended to Friday, 6:00 PM.</p>" +
            "<p>Please ensure:</p><ul><li><p>Screenshots of all Nmap scans (SYN, UDP, version detection)</p></li><li><p>Wireshark capture file (.pcap) attached</p></li><li><p>PDF report with findings and recommendations</p></li><li><p>Submission via the portal only — no email submissions</p></li></ul>" +
            "<p>If you face any further issues, ping me on the Messenger or post here. Good luck!</p>",
        likes: 24,
        liked: true,
        views: 32,
        saved: false,
        replies: [
            reply("r-a3-1", ANONYMOUS, 7 * MIN, "Thank you sir! Will submit by Thursday itself. Really needed the extra time for the Wireshark section.", 4),
            reply("r-a3-2", PRIYA, 6 * MIN, "Does the PDF report need a cover page or just the findings?", 2),
            reply("r-a3-3", TRAINER, 5 * MIN, "Just the findings and recommendations are fine, Priya.", 6),
            reply("r-a3-4", RAVI, 4 * MIN, "Can we submit the .pcap as a zip if it is too large?", 1),
            reply("r-a3-5", TRAINER, 3 * MIN, "Yes, zip is fine as long as it is under 50 MB.", 3),
            reply("r-a3-6", JOSH, 2 * MIN, "Thanks for the extension!", 0),
        ],
    },
    {
        id: "extra-session-topic-poll",
        categoryId: "lecture-discussions",
        tags: ["General Question"],
        author: TRAINER,
        ago: 2 * HOUR,
        title: "Which topic should we cover in tomorrow's extra session?",
        html: "<p>Vote for the topic you need most before tomorrow's 2 PM session. Results will guide the agenda.</p>",
        poll: {
            options: [
                { id: "firewall", text: "Firewall Rules & ACLs", votes: 14 },
                { id: "ospf", text: "OSPF Neighbor State", votes: 9 },
                { id: "vpn", text: "VPN Tunnelling (IPsec)", votes: 7 },
                { id: "wireshark", text: "Wireshark Deep Dive", votes: 6 },
            ],
        },
        likes: 24,
        liked: true,
        views: 41,
        saved: false,
        replies: [
            reply("r-poll-1", ANONYMOUS, 3 * HOUR, "Thank you sir! Will submit by Thursday itself. Really needed the extra time for the Wireshark section.", 24, true),
            reply("r-poll-2", JOSH, 90 * MIN, "Firewall rules please — the ACL ordering still confuses me.", 5),
            reply("r-poll-3", JOSH, 80 * MIN, "Also happy to see a Wireshark filter cheat-sheet if there is time.", 2),
            reply("r-poll-4", NEHA, 70 * MIN, "+1 for OSPF neighbor states.", 1),
            {
                id: "r-poll-5",
                author: { id: CURRENT_USER_ID, name: "", role: "Student", avatar: communityAsset("avatar-trainer.png") },
                ago: 2 * MIN,
                html:
                    `<p>Hey ${mentionHtml("Kushal Korde")} , thanks for the feedback and for the frustration!</p>` +
                    "<p>This is the current behavior when adding an Admin or changing the Owner of a team.</p>" +
                    '<p>More information on this can be found in our article on <a href="https://help.figma.com/hc/en-us/articles/360039970673" target="_blank" rel="noopener noreferrer nofollow">Team permissions 4</a>.</p>',
                attachments: [
                    { id: "att-856", name: "Image856.png", progress: 100 },
                    { id: "att-858", name: "Image858.png", progress: 100 },
                ],
                likes: 0,
                liked: false,
            },
            reply("r-poll-6", JOSH, MIN, "Josh here again — VPN would be great next week.", 0),
        ],
    },
    {
        id: "gns3-topology-not-saving",
        categoryId: "lab-discussions",
        tags: ["Bug"],
        author: PRIYA,
        ago: 5 * HOUR,
        title: "GNS3 topology not saving after restart – anyone else facing this?",
        html: "<p>My GNS3 project file keeps losing the saved topology whenever I restart the VM. I've already tried re-importing but the issue persists. Any fixes?</p>",
        likes: 11,
        liked: false,
        views: 58,
        saved: false,
        replies: [
            reply("r-gns-1", RAVI, 4 * HOUR, "Make sure you save the project inside the shared folder, not the VM temp directory.", 4),
            reply("r-gns-2", TRAINER, 3 * HOUR, "Ravi is right. Also check that the GNS3 VM version matches your GUI version.", 7),
        ],
    },
    {
        id: "subnetting-answers-discussion",
        categoryId: "assignment-help",
        tags: ["General Question"],
        author: RAVI,
        ago: 26 * HOUR,
        title: "Assignment 2 – Part B: Subnetting Answers Discussion",
        html: "<p>Let's compare our answers for Assignment 2 Part B. I got /26 for the third subnet but not sure if it's right. Post your work below!</p>",
        likes: 18,
        liked: false,
        views: 97,
        saved: true,
        replies: [reply("r-sub-1", NEHA, 20 * HOUR, "I got /26 as well — 62 usable hosts fits the requirement.", 3)],
    },
    {
        id: "quiz-4-question-7",
        categoryId: "quiz-discussions",
        tags: ["Lecture"],
        author: NEHA,
        ago: 2 * DAY,
        title: "Quiz 4 – Question 7: Why is the answer TCP and not UDP?",
        html: "<p>The question asked which protocol DNS zone transfers use. I chose UDP since DNS normally uses UDP — can someone explain why it is TCP?</p>",
        likes: 9,
        liked: false,
        views: 44,
        saved: false,
        replies: [reply("r-quiz-1", TRAINER, 2 * DAY - HOUR, "Zone transfers (AXFR/IXFR) carry large payloads, so they use TCP for reliable delivery.", 8)],
    },
    {
        id: "ccna-exam-prep-plan",
        categoryId: "exam-preparation",
        tags: ["Important"],
        author: TRAINER,
        ago: 3 * DAY,
        title: "Two-week revision plan for the module exam",
        html: "<p>Here is a suggested two-week plan covering routing, switching, security fundamentals and two full mock tests. Follow it day by day and post your doubts here.</p>",
        likes: 31,
        liked: false,
        views: 156,
        saved: false,
        replies: [],
    },
    {
        id: "wireshark-filter-cheatsheet",
        categoryId: "resources-notes",
        tags: ["Lecture"],
        author: JOSH,
        ago: 4 * DAY,
        title: "Wireshark display filter cheat-sheet (PDF)",
        html: "<p>Sharing the cheat-sheet I made while revising — covers the most common display filters for HTTP, DNS, TCP flags and ARP.</p>",
        likes: 27,
        liked: false,
        views: 132,
        saved: false,
        replies: [reply("r-ws-1", PRIYA, 3 * DAY, "This is super helpful, thank you!", 2)],
    },
    {
        id: "infra-maintenance-window",
        categoryId: "batch-updates",
        tags: ["Infrastructure", "Staff"],
        author: TRAINER,
        ago: 5 * DAY,
        title: "Lab infrastructure maintenance this Sunday",
        html: "<p>The practice lab servers will be down for maintenance on Sunday from 8 AM to 12 PM. Please plan your lab work accordingly.</p>",
        likes: 6,
        liked: false,
        views: 64,
        saved: false,
        replies: [],
    },
];

export function seedPosts(now = Date.now()): Post[] {
    return SEED.map(({ ago, at, replies, ...post }) => ({
        ...post,
        createdAt: at ?? now - (ago ?? 0),
        replies: replies.map(({ ago: replyAgo, ...r }) => ({ ...r, createdAt: now - replyAgo })),
    }));
}
