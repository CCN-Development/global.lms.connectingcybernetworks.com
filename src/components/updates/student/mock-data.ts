/**
 * Static content for the student News & Updates screens.
 *
 * The UI is wired to these helpers only, so swapping in the real API later means
 * replacing the functions at the bottom of this file — the components stay untouched.
 */

export type UpdateKind = "news" | "blog" | "announcement";

export type InlineLink = { text: string; href: string };
/** A run of text that may contain links, e.g. ["Go to ", { text: "ssc.gov.in", href: "…" }]. */
export type RichText = string | Array<string | InlineLink>;

export interface ContentSection {
    heading?: string;
    /** Sits directly under the heading with no gap. */
    lead?: string;
    paragraphs?: RichText[];
    list?: RichText[];
    table?: { columns: string[]; rows: string[][] };
    image?: { src: string; caption?: string; alt?: string };
}

export interface UpdateAuthor {
    name: string;
    avatar?: string;
}

export interface UpdateEntry {
    id: string;
    slug: string;
    kind: UpdateKind;
    title: string;
    category: string;
    /** Intro paragraph shown under the "Last updated" chip on the detail page. */
    summary: string;
    coverImage?: string;
    coverCaption?: string;
    readMinutes: number;
    views: number;
    publishedAt: string;
    updatedAt: string;
    author: UpdateAuthor;
    trending?: boolean;
    featured?: boolean;
    /** Card CTA for announcements ("View Details", "View Opportunity", …). */
    actionLabel?: string;
    sections: ContentSection[];
}

export type UpdateSort = "newest" | "oldest" | "popular";

export const KIND_META: Record<
    UpdateKind,
    { label: string; tabLabel: string; slug: string; noun: string; readLabel: string; relatedTitle: string }
> = {
    news: { label: "News", tabLabel: "News", slug: "news", noun: "news", readLabel: "Read News", relatedTitle: "Related News" },
    blog: { label: "Blog", tabLabel: "Blogs", slug: "blogs", noun: "blogs", readLabel: "Read Article", relatedTitle: "Related Articles" },
    announcement: {
        label: "Announcement",
        tabLabel: "Announcements",
        slug: "announcements",
        noun: "announcements",
        readLabel: "Read More",
        relatedTitle: "Related Announcements",
    },
};

export const UPDATE_KINDS: UpdateKind[] = ["news", "blog", "announcement"];

const BASE_PATH = "/dashboard/student/updates";

export const listHref = (kind: UpdateKind) => `${BASE_PATH}/${KIND_META[kind].slug}`;
export const updateHref = (entry: Pick<UpdateEntry, "kind" | "slug">) => `${BASE_PATH}/${KIND_META[entry.kind].slug}/${entry.slug}`;

export function kindFromSlug(slug: string): UpdateKind {
    const match = UPDATE_KINDS.find((kind) => KIND_META[kind].slug === slug || kind === slug);
    return match ?? "news";
}

// ─── Assets ────────────────────────────────────────────────────────────────
const ASSET = (name: string) => `/updates/${name}`;
const COVERS = [ASSET("cover-1.png"), ASSET("cover-2.png"), ASSET("cover-3.png")];
const cover = (index: number) => COVERS[index % COVERS.length];

const RACHIT: UpdateAuthor = { name: "Rachit Kumar Saxena", avatar: ASSET("author.png") };
const NEWSROOM: UpdateAuthor = { name: "CCN Newsroom", avatar: ASSET("author.png") };
const ADMIN: UpdateAuthor = { name: "CCN Academic Team" };

/** ISO timestamp `hours` before now (minute-rounded) — keeps stamps like "Updated 2 hrs ago" realistic. */
const hoursAgo = (hours: number) => new Date(Math.floor(Date.now() / 60_000) * 60_000 - hours * 3_600_000).toISOString();

// ─── Shared article bodies ─────────────────────────────────────────────────
const PRACTICAL_LEARNING_SECTIONS: ContentSection[] = [
    {
        paragraphs: [
            "Why Practical > Only Theory:  Theory gives you knowledge, but practice gives you confidence. Cybersecurity is a fast-changing, real-world problem, and the best way to learn is by facing real-world scenarios in labs.",
            "Theory gives you knowledge, but practice gives you confidence. Cybersecurity is a fast-changing, real-world problem, and the best way to learn is by facing real-world scenarios in labs.",
            "The SSC CHSL Tier 1 exam 2024 was conducted from July 1 to 11 at the designated exam centres across the nation. The exam was conducted online as a Computer-Based Exam (CBE). The Commission will release the candidates’ response sheet with the answer key.",
        ],
    },
    {
        heading: "How to Download SSC CHSL Tier 1 Answer Key 2024?",
        lead: "The candidates can download the SSC CHSL Tier 1 answer key 2024 in the following manner:",
        list: [
            ["Go to the official website- ", { text: "ssc.gov.in", href: "https://ssc.gov.in" }],
            "Click on the Login button",
            "Go to the applications",
        ],
    },
    {
        heading: "Practical Learning vs 100% Theory",
        lead: "Here’s a side-by-side comparison to understand why practical learning always wins:",
        table: {
            columns: ["Aspect", "100% Theory", "80% Practical, 20% Theory"],
            rows: [
                ["Knowledge Depth", "Strong on concepts, weak in application", "Balanced: clear concepts + applied skills"],
                ["Confidence Level", "Low – unsure when facing real issues", "High – trained through real-world labs"],
                ["Industry Readiness", "Limited – requires extra training on the job", "Job-ready from day one"],
                ["Learning Experience", "Passive – listening & memorizing", "Active – doing, experimenting, troubleshooting"],
                ["Career Impact", "Delays growth, hard to stand out", "Faster placements, proven skills in interviews"],
            ],
        },
    },
];

const PRACTICAL_SUMMARY =
    "In the world of cybersecurity, reading books or watching lectures alone won’t make you job-ready. The real learning happens when you do — configuring firewalls, analyzing threats, and simulating attacks. That’s why CCN follows the 80% Practical, 20% Theory model, ensuring every learner gains hands-on expertise.";

const newsSections = (topic: string): ContentSection[] => [
    {
        paragraphs: [
            `${topic} has quickly become one of the most discussed developments in the security community this week. Analysts and practitioners are already weighing in on what it means for organisations of every size.`,
            "Teams are advised to review their exposure, apply vendor guidance as soon as it is available, and keep stakeholders informed about any changes to their security posture.",
        ],
    },
    {
        heading: "What this means for learners",
        lead: "If you are preparing for a role in cybersecurity, here’s how to make the most of this update:",
        list: [
            "Read the official advisory and note the affected systems",
            "Recreate the scenario in your CCN practice lab",
            ["Discuss your findings with peers in the ", { text: "CCN Community", href: "/dashboard/student/community" }],
        ],
    },
    {
        heading: "Quick summary",
        lead: "The key points at a glance:",
        table: {
            columns: ["Area", "Before", "After"],
            rows: [
                ["Risk Level", "Moderate", "Elevated until patched"],
                ["Recommended Action", "Routine monitoring", "Patch, verify and monitor"],
                ["Skills in Demand", "General awareness", "Incident response & threat hunting"],
            ],
        },
    },
];

const announcementSections = (details: string[], dates: string[][]): ContentSection[] => [
    { heading: "What you need to know", list: details },
    {
        heading: "Important dates",
        lead: "Please keep the following schedule in mind:",
        table: { columns: ["Activity", "Date", "Time"], rows: dates },
    },
    {
        paragraphs: [
            ["For any questions, raise a ticket from ", { text: "My Requests", href: "/dashboard/student/requests" }, " and our team will get back to you."],
        ],
    },
];

// ─── Blogs ─────────────────────────────────────────────────────────────────
const BLOG_SEED: Array<[slug: string, title: string, category: string, minutes: number, views: number, date: string]> = [
    ["why-80-practical-learning-beats-100-theory", "Why 80% Practical Learning Beats 100% Theory", "Learning at CCN", 15, 5240, "2024-06-18T12:00:00Z"],
    ["how-to-start-a-career-in-cyber-security-after-college", "How to Start a Career in Cyber Security After College", "Learning at CCN", 15, 5240, "2024-07-12T12:00:00Z"],
    ["building-your-first-home-lab-for-ethical-hacking", "Building Your First Home Lab for Ethical Hacking", "Learning at CCN", 12, 3110, "2024-07-10T09:30:00Z"],
    ["inside-the-mind-of-a-hacker", "Inside the Mind of a Hacker: Thinking Like an Attacker", "Cyber Security", 10, 8420, "2024-07-08T06:15:00Z"],
    ["soc-analyst-roadmap-2025", "SOC Analyst Roadmap: Skills You Need in 2025", "Career Guide", 18, 6120, "2024-07-05T11:00:00Z"],
    ["top-10-linux-commands-for-pentesters", "Top 10 Linux Commands Every Pentester Should Know", "Cyber Security", 8, 4310, "2024-07-02T08:45:00Z"],
    ["cracking-the-ceh-exam-study-plan", "Cracking the CEH Exam: A Practical Study Plan", "Career Guide", 14, 2980, "2024-06-28T10:20:00Z"],
    ["firewalls-explained-packet-filters-to-ngfw", "Firewalls Explained: From Packet Filters to NGFW", "Cyber Security", 11, 1870, "2024-06-24T07:00:00Z"],
    ["soft-skills-in-cyber-security-interviews", "Why Soft Skills Matter in Cyber Security Interviews", "Career Guide", 7, 1560, "2024-06-20T13:10:00Z"],
];

const BLOGS: UpdateEntry[] = BLOG_SEED.map(([slug, title, category, readMinutes, views, publishedAt], index) => ({
    id: `blog-${index + 1}`,
    slug,
    kind: "blog",
    title,
    category,
    summary: PRACTICAL_SUMMARY,
    coverImage: index === 0 ? ASSET("featured.png") : cover(index - 1),
    readMinutes,
    views,
    publishedAt,
    updatedAt: "2025-07-20T06:30:00Z",
    author: RACHIT,
    trending: index === 0,
    featured: index === 0 || index === 3,
    sections: [
        { image: { src: ASSET("featured.png"), caption: category, alt: title } },
        ...PRACTICAL_LEARNING_SECTIONS,
    ],
}));

// ─── News ──────────────────────────────────────────────────────────────────
const NEWS_SEED: Array<[slug: string, title: string, category: string, minutes: number, views: number, date: string]> = [
    ["india-to-hire-one-lakh-cyber-security-professionals", "India to Hire 1 Lakh Cyber Security Professionals by 2026", "Industry News", 6, 9120, "2024-07-13T05:30:00Z"],
    ["how-to-start-a-career-in-cyber-security-after-college", "How to Start a Career in Cyber Security After College", "Learning at CCN", 15, 5240, "2024-07-12T12:00:00Z"],
    ["cert-in-advisory-critical-chrome-vulnerabilities", "CERT-In Issues Advisory on Critical Chrome Vulnerabilities", "Threat Alert", 5, 7400, "2024-07-11T04:00:00Z"],
    ["ransomware-attacks-on-healthcare-rise", "Ransomware Attacks on Healthcare Rise Sharply in 2024", "Threat Alert", 9, 4380, "2024-07-09T10:00:00Z"],
    ["ccn-students-win-national-ctf", "CCN Students Win National Capture The Flag Championship", "Learning at CCN", 4, 6610, "2024-07-06T08:00:00Z"],
    ["new-dpdp-rules-what-it-teams-must-know", "New DPDP Rules: What IT Teams Must Know", "Industry News", 10, 3320, "2024-07-03T07:45:00Z"],
    ["ai-powered-phishing-on-the-rise", "AI-Powered Phishing Campaigns Are on the Rise", "Threat Alert", 7, 2890, "2024-06-30T09:15:00Z"],
    ["cloud-security-jobs-demand-2024", "Cloud Security Jobs See Record Demand This Year", "Industry News", 6, 2140, "2024-06-26T11:30:00Z"],
    ["zero-trust-adoption-in-indian-enterprises", "Zero Trust Adoption Accelerates in Indian Enterprises", "Industry News", 8, 1730, "2024-06-21T06:00:00Z"],
];

const NEWS: UpdateEntry[] = NEWS_SEED.map(([slug, title, category, readMinutes, views, publishedAt], index) => ({
    id: `news-${index + 1}`,
    slug,
    kind: "news",
    title,
    category,
    summary: index === 1 ? PRACTICAL_SUMMARY : `${title}. Here is everything you need to know about the latest development and why it matters for aspiring cybersecurity professionals.`,
    coverImage: cover(index),
    readMinutes,
    views,
    publishedAt,
    updatedAt: "2025-07-20T06:30:00Z",
    author: index === 1 ? RACHIT : NEWSROOM,
    featured: index === 0,
    sections: index === 1
        ? [{ image: { src: ASSET("featured.png"), caption: category, alt: title } }, ...PRACTICAL_LEARNING_SECTIONS]
        : [{ image: { src: cover(index), caption: category, alt: title } }, ...newsSections(title)],
}));

// ─── Announcements ─────────────────────────────────────────────────────────
type AnnouncementSeed = {
    slug: string;
    title: string;
    category: string;
    actionLabel: string;
    publishedHoursAgo: number;
    updatedHoursAgo?: number;
    summary: string;
    details: string[];
    dates: string[][];
};

const ANNOUNCEMENT_SEED: AnnouncementSeed[] = [
    {
        slug: "ccna-weekend-batch-updated",
        title: "CCNA Weekend Batch Updated",
        category: "Academic",
        actionLabel: "View Details",
        publishedHoursAgo: 1,
        summary: "The CCNA weekend batch schedule has been updated to give learners more hands-on lab time every Saturday and Sunday.",
        details: ["Saturday sessions now start at 10:00 AM", "Sunday sessions include an extra 1-hour lab block", "Recorded sessions will be available within 24 hours"],
        dates: [["Revised schedule starts", "20 July, 2025", "10:00 AM"], ["First extended lab", "21 July, 2025", "02:00 PM"]],
    },
    {
        slug: "placement-drive-registration-now-open",
        title: "Placement Drive Registration Now Open",
        category: "Placement",
        actionLabel: "View Opportunity",
        publishedHoursAgo: 1.5,
        summary: "Registrations for the upcoming placement drive with our hiring partners are now open for all eligible learners.",
        details: ["Open to learners with 75%+ attendance", "Update your resume on the Placement page before registering", "Shortlisted candidates will be notified by email"],
        dates: [["Registration closes", "25 July, 2025", "11:59 PM"], ["Aptitude round", "28 July, 2025", "10:00 AM"], ["Interviews", "30 July, 2025", "09:30 AM"]],
    },
    {
        slug: "lms-maintenance-this-weekend",
        title: "LMS Maintenance This Weekend",
        category: "Maintenance",
        actionLabel: "View Notice",
        publishedHoursAgo: 30,
        updatedHoursAgo: 2,
        summary: "The LMS will be briefly unavailable this weekend while we upgrade our servers to improve speed and reliability.",
        details: ["Courses, labs and exams will be unavailable during the window", "Progress is saved automatically — no action needed", "Live classes are not affected"],
        dates: [["Maintenance starts", "26 July, 2025", "11:00 PM"], ["Expected completion", "27 July, 2025", "03:00 AM"]],
    },
    {
        slug: "mid-term-examination-schedule-released",
        title: "Mid-Term Examination Schedule Released",
        category: "Institute",
        actionLabel: "Read More",
        publishedHoursAgo: 2.2,
        summary: "The mid-term examination schedule for all active batches has been published. Please review your exam slots carefully.",
        details: ["Exams will be conducted online via the Exam section", "Keep your webcam enabled throughout the exam", "Results will be announced within 7 working days"],
        dates: [["Mock test", "01 Aug, 2025", "10:00 AM"], ["Mid-term exam", "05 Aug, 2025", "10:00 AM"]],
    },
    {
        slug: "cyber-security-workshop-with-industry-expert",
        title: "Cyber Security Workshop with Industry Expert",
        category: "Event",
        actionLabel: "View Event",
        publishedHoursAgo: 2.4,
        summary: "Join a live, hands-on workshop on threat hunting with a senior SOC lead from one of our hiring partners.",
        details: ["Live demo of real-world threat hunting techniques", "Q&A session with the speaker", "Certificate of participation for all attendees"],
        dates: [["Workshop", "02 Aug, 2025", "04:00 PM"]],
    },
    {
        slug: "assignment-submission-deadline-extended",
        title: "Assignment Submission Deadline Extended",
        category: "Academic",
        actionLabel: "Read More",
        publishedHoursAgo: 28,
        updatedHoursAgo: 2.6,
        summary: "Based on learner feedback, the deadline for the current module assignments has been extended.",
        details: ["Applies to all assignments in the current module", "Late submissions after the new deadline will not be accepted", "Reach out to your trainer if you need help"],
        dates: [["New deadline", "29 July, 2025", "11:59 PM"]],
    },
    {
        slug: "ceh-batch-timings-revised",
        title: "CEH Batch Timings Revised",
        category: "Academic",
        actionLabel: "Read More",
        publishedHoursAgo: 26,
        updatedHoursAgo: 2.8,
        summary: "The CEH evening batch timings have been revised to better suit working professionals.",
        details: ["Weekday sessions move from 7:00 PM to 8:00 PM", "Session duration remains 90 minutes"],
        dates: [["Revised timings start", "22 July, 2025", "08:00 PM"]],
    },
    {
        slug: "new-practice-labs-for-network-security",
        title: "New Practice Labs Added for Network Security",
        category: "Academic",
        actionLabel: "Read More",
        publishedHoursAgo: 3,
        summary: "Five new hands-on practice labs covering firewalls, IDS and VPN configuration are now live.",
        details: ["Available under Practice Labs › Network Security", "Each lab includes guided hints and a final challenge"],
        dates: [["Labs available", "Live now", "—"]],
    },
    {
        slug: "independence-day-holiday-notice",
        title: "Independence Day Holiday Notice",
        category: "Institute",
        actionLabel: "Read More",
        publishedHoursAgo: 50,
        updatedHoursAgo: 3.2,
        summary: "All live classes will remain closed on Independence Day. Recorded content and labs remain accessible.",
        details: ["No live sessions on the holiday", "Missed sessions will be rescheduled by your trainer"],
        dates: [["Holiday", "15 Aug, 2025", "All day"]],
    },
];

/** Built per call so relative stamps stay fresh on long-running servers and match between SSR and hydration. */
const buildAnnouncements = (): UpdateEntry[] =>
    ANNOUNCEMENT_SEED.map((seed, index) => ({
        id: `announcement-${index + 1}`,
        slug: seed.slug,
        kind: "announcement",
        title: seed.title,
        category: seed.category,
        summary: seed.summary,
        readMinutes: 2,
        views: 1200 - index * 90,
        publishedAt: hoursAgo(seed.publishedHoursAgo),
        updatedAt: hoursAgo(seed.updatedHoursAgo ?? seed.publishedHoursAgo),
        author: ADMIN,
        actionLabel: seed.actionLabel,
        sections: announcementSections(seed.details, seed.dates),
    }));

const all = (kind: UpdateKind): UpdateEntry[] => (kind === "news" ? NEWS : kind === "blog" ? BLOGS : buildAnnouncements());

// ─── Query helpers (replace with API calls later) ──────────────────────────
const activity = (entry: UpdateEntry) => Math.max(Date.parse(entry.publishedAt), Date.parse(entry.updatedAt));

export function getUpdates(
    kind: UpdateKind,
    { search = "", sort = "newest", category = "" }: { search?: string; sort?: UpdateSort; category?: string } = {},
): UpdateEntry[] {
    const query = search.trim().toLowerCase();
    const sortKey = kind === "announcement" ? activity : (entry: UpdateEntry) => Date.parse(entry.publishedAt);

    return all(kind)
        .filter((entry) => !category || entry.category === category)
        .filter((entry) => !query || `${entry.title} ${entry.category} ${entry.summary}`.toLowerCase().includes(query))
        .sort((a, b) => {
            if (sort === "popular") return b.views - a.views;
            return sort === "oldest" ? sortKey(a) - sortKey(b) : sortKey(b) - sortKey(a);
        });
}

export function getUpdateCounts(): Record<UpdateKind, number> {
    return { news: NEWS.length, blog: BLOGS.length, announcement: ANNOUNCEMENT_SEED.length };
}

export function getCategories(kind: UpdateKind): string[] {
    return Array.from(new Set(all(kind).map((entry) => entry.category)));
}

export function getFeaturedUpdates(): UpdateEntry[] {
    return [...BLOGS, ...NEWS].filter((entry) => entry.featured && entry.coverImage);
}

export function findUpdate(kind: UpdateKind, slug: string): UpdateEntry | undefined {
    return all(kind).find((entry) => entry.slug === slug || entry.id === slug);
}

export function getRelatedUpdates(entry: UpdateEntry): UpdateEntry[] {
    const others = all(entry.kind).filter((candidate) => candidate.id !== entry.id);
    const sameCategory = others.filter((candidate) => candidate.category === entry.category);
    return [...sameCategory, ...others.filter((candidate) => candidate.category !== entry.category)];
}
