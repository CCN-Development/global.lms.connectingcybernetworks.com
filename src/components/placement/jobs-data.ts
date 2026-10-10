/** Data model + mock data for the Placement Hub (jobs, applications, interview prep). */

// ─── Companies ─────────────────────────────────────────────────────────────
export type CompanyId = "microsoft" | "apple" | "google";

export interface Company {
    id: CompanyId;
    name: string;
    /** Path under /public/placement; rendered at 24px (88px on the detail page). */
    logo: string;
    /** Apple's mark sits on a white disc in the design. */
    logoOnDisc?: boolean;
}

export const COMPANIES: Record<CompanyId, Company> = {
    microsoft: { id: "microsoft", name: "Microsoft", logo: "logo-microsoft.png" },
    apple: { id: "apple", name: "Apple", logo: "logo-apple.svg", logoOnDisc: true },
    google: { id: "google", name: "Google", logo: "logo-google.svg" },
};

// ─── Jobs ──────────────────────────────────────────────────────────────────
export type JobType = "Full Time" | "Part Time" | "Remote" | "Hybrid" | "Internship";

export interface Job {
    id: string;
    title: string;
    company: CompanyId;
    location: string;
    jobType: JobType;
    /** Salary range in LPA. */
    salary: [number, number];
    /** 0–100 */
    skillMatch: number;
    postedDaysAgo: number;
    skills: string[];
    /** Completed course that triggered the recommendation, e.g. "CCNA". */
    recommendedFor?: string;
    experience: string;
    applicants: number;
    openings: number;
    about: string[];
    aiSummary: string;
    responsibilities: string[];
    requirements: string[];
    aiInsight: { gaps: { label: string; value: string }[]; boostTo: number };
}

const SOC_DETAIL = {
    experience: "1+ years",
    applicants: 86,
    openings: 4,
    about: [
        "We are looking for a vigilant SOC Analyst to monitor, triage and respond to security events across our cloud and on-prem estate. You will work closely with incident responders and threat hunters to keep our customers safe.",
        "This role is ideal for someone who enjoys investigating alerts, has a strong grasp of networking fundamentals, and wants to grow into threat hunting.",
    ],
    aiSummary: "This role focuses on alert triage, SIEM monitoring and incident escalation. Best suited for early-career analysts with strong networking fundamentals.",
    responsibilities: [
        "Monitor SIEM dashboards and triage security alerts",
        "Investigate suspicious network and endpoint activity",
        "Escalate confirmed incidents with clear documentation",
        "Tune detection rules to reduce false positives",
        "Contribute to playbooks and shift hand-over notes",
    ],
    requirements: [
        "Understanding of TCP/IP, DNS and common protocols",
        "Hands-on experience with Wireshark / Nmap",
        "Familiarity with a SIEM such as Splunk or Sentinel",
        "CCNA or Security+ certification is a plus",
        "Willingness to work in rotational shifts",
    ],
    aiInsight: { gaps: [{ label: "Missing", value: "SIEM query writing" }, { label: "Weak", value: "Incident documentation" }], boostTo: 91 },
};

const CLOUD_DETAIL = {
    experience: "2+ years",
    applicants: 142,
    openings: 3,
    about: [
        "Join our cloud platform team to design, secure and operate highly available infrastructure. You will automate deployments and harden workloads running at global scale.",
        "This role suits engineers who love automation, care about reliability and enjoy collaborating with security teams.",
    ],
    aiSummary: "This role focuses on cloud networking, IAM and infrastructure-as-code. Best suited for engineers with CCNA-level networking and scripting skills.",
    responsibilities: [
        "Build and maintain cloud networking (VPCs, routing, VPN)",
        "Automate provisioning with Terraform and CI pipelines",
        "Apply least-privilege IAM and security baselines",
        "Monitor cost, performance and availability",
        "Document architecture decisions and runbooks",
    ],
    requirements: [
        "Strong networking fundamentals (subnetting, routing, firewalls)",
        "Experience with AWS, Azure or GCP",
        "Scripting in Python or Bash",
        "Familiarity with containers and Kubernetes",
        "Good communication and problem-solving skills",
    ],
    aiInsight: { gaps: [{ label: "Missing", value: "Terraform" }, { label: "Weak", value: "Kubernetes networking" }], boostTo: 90 },
};

const PRODUCT_DESIGNER_DETAIL = {
    experience: "3+ years",
    applicants: 120,
    openings: 6,
    about: [
        "We are looking for a passionate Product Designer to join our team and help craft intuitive, user-centered digital experiences. You will collaborate with cross-functional teams including product managers, engineers, and researchers to design solutions that are both functional and visually engaging.",
        "This role is ideal for someone who enjoys solving complex problems, has a strong design sense, and is eager to create impactful user experiences at scale.",
    ],
    aiSummary: "This role focuses on UX design, prototyping, and cross-team collaboration. Best suited for mid-level designers with strong UI skills.",
    responsibilities: [
        "Design intuitive user interfaces and seamless user experiences",
        "Conduct user research and translate insights into design decisions",
        "Create wireframes, prototypes, and high-fidelity UI designs",
        "Collaborate with developers to ensure design feasibility",
        "Maintain design systems and ensure consistency across products",
        "Iterate designs based on feedback and usability testing",
    ],
    requirements: [
        "3+ years of experience in Product/UX/UI Design",
        "Strong portfolio showcasing real-world projects",
        "Proficiency in tools like Figma, Adobe XD, or Sketch",
        "Understanding of user-centered design principles",
        "Basic knowledge of front-end (HTML/CSS) is a plus",
        "Strong communication and problem-solving skills",
    ],
    aiInsight: { gaps: [{ label: "Missing", value: "Prototyping tools" }, { label: "Weak", value: "Research experience" }], boostTo: 92 },
};

const SECURITY_SKILLS = ["Network Security", "Wireshark / Nmap", "SIEM", "Incident Response", "Linux"];
const CLOUD_SKILLS = ["Cloud Networking", "AWS / Azure", "Terraform", "Kubernetes", "Python"];

export const JOBS: Job[] = [
    { id: "soc-analyst-microsoft", title: "SOC Analyst", company: "microsoft", location: "Hyderabad", jobType: "Full Time", salary: [15, 25], skillMatch: 84, postedDaysAgo: 2, skills: SECURITY_SKILLS, recommendedFor: "Ethical Hacking", ...SOC_DETAIL },
    { id: "cloud-engineer-apple", title: "Cloud Engineer", company: "apple", location: "Hyderabad", jobType: "Full Time", salary: [15, 25], skillMatch: 84, postedDaysAgo: 2, skills: CLOUD_SKILLS, recommendedFor: "CCNA", ...CLOUD_DETAIL },
    { id: "devops-architect-google", title: "DevOps Architect", company: "google", location: "Mumbai", jobType: "Remote", salary: [15, 25], skillMatch: 84, postedDaysAgo: 2, skills: CLOUD_SKILLS, recommendedFor: "CCNA", ...CLOUD_DETAIL },
    { id: "product-designer-microsoft", title: "Product Designer", company: "microsoft", location: "Hyderabad, India", jobType: "Full Time", salary: [35, 45], skillMatch: 85, postedDaysAgo: 3, skills: ["Figma", "Prototyping", "User Research", "Design Systems"], ...PRODUCT_DESIGNER_DETAIL },
    { id: "network-engineer-google", title: "Network Engineer", company: "google", location: "Bangalore", jobType: "Full Time", salary: [12, 20], skillMatch: 81, postedDaysAgo: 1, skills: ["Routing & Switching", "Network Security", "Wireshark / Nmap", "BGP"], recommendedFor: "CCNA", ...CLOUD_DETAIL },
    { id: "penetration-tester-apple", title: "Penetration Tester", company: "apple", location: "Bangalore", jobType: "Hybrid", salary: [18, 28], skillMatch: 78, postedDaysAgo: 4, skills: ["Web App Security", "Burp Suite", "Wireshark / Nmap", "Linux"], recommendedFor: "Ethical Hacking", ...SOC_DETAIL },
    { id: "security-intern-microsoft", title: "Security Analyst Intern", company: "microsoft", location: "Pune", jobType: "Internship", salary: [4, 6], skillMatch: 92, postedDaysAgo: 0, skills: ["Network Security", "Linux", "Python"], recommendedFor: "Ethical Hacking", ...SOC_DETAIL },
    { id: "threat-hunter-google", title: "Threat Hunter", company: "google", location: "Hyderabad", jobType: "Full Time", salary: [22, 32], skillMatch: 66, postedDaysAgo: 6, skills: ["Threat Intelligence", "SIEM", "Wireshark / Nmap", "Python"], ...SOC_DETAIL },
    { id: "it-support-apple", title: "IT Support Engineer", company: "apple", location: "Delhi", jobType: "Part Time", salary: [5, 8], skillMatch: 72, postedDaysAgo: 5, skills: ["Networking", "Windows Server", "Active Directory"], ...CLOUD_DETAIL },
];

export const TOTAL_LISTED_JOBS = "15000+";

export const findJob = (id: string) => JOBS.find((job) => job.id === id);

export const formatSalary = ([min, max]: [number, number]) => `₹${min}-${max} LPA`;

export const postedLabel = (days: number) =>
    days === 0 ? "Posted today" : `Posted ${days} ${days === 1 ? "day" : "days"} ago`;

// ─── Applications ──────────────────────────────────────────────────────────
export type ActivityType =
    | "submitted"
    | "viewed-by-placement"
    | "rejected-by-placement"
    | "shortlisted-by-placement"
    | "recruiter-review"
    | "rejected-by-recruiter"
    | "shortlisted-by-recruiter"
    | "interview-scheduled"
    | "interview-rescheduled"
    | "interview-cancelled"
    | "interview-hold"
    | "interview-completed"
    | "next-round-scheduled"
    | "next-round-selected"
    | "next-round-rejected"
    | "offer-received"
    | "offer-accepted"
    | "offer-declined"
    | "offer-expired"
    | "withdrawn";

export type NoteTone = "error" | "warning" | "info";

interface ActivityMeta {
    title: string;
    /** Ends the application unsuccessfully (red ✕). */
    negative?: boolean;
    /** Ends the application (no further steps, no trailing connector). */
    terminal?: boolean;
    /** Pipeline stage reached (0 Applied, 1 Under Review, 2 Interview, 3 Offer). */
    stage: number;
    note?: { label: string; tone: NoteTone };
}

export const ACTIVITY: Record<ActivityType, ActivityMeta> = {
    submitted: { title: "Application Submitted", stage: 1 },
    "viewed-by-placement": { title: "Application Viewed by Placement Team", stage: 1 },
    "rejected-by-placement": { title: "Rejected by Placement Team", stage: 1, negative: true, note: { label: "Reason for Rejection", tone: "error" } },
    "shortlisted-by-placement": { title: "Shortlisted by Placement Team", stage: 1 },
    "recruiter-review": { title: "Recruiter Review", stage: 1 },
    "rejected-by-recruiter": { title: "Rejected by Recruiter", stage: 1, negative: true, note: { label: "Reason for Rejection", tone: "error" } },
    "shortlisted-by-recruiter": { title: "Shortlisted by Recruiter", stage: 2 },
    "interview-scheduled": { title: "Interview Scheduled", stage: 2 },
    "interview-rescheduled": { title: "Interview Rescheduled", stage: 2, note: { label: "Reason for Reschedule", tone: "info" } },
    "interview-cancelled": { title: "Interview Canceled", stage: 2, negative: true, note: { label: "Reason for Cancellation", tone: "error" } },
    "interview-hold": { title: "Interview on Hold", stage: 2, note: { label: "Reason for Hold", tone: "warning" } },
    "interview-completed": { title: "Interview Completed", stage: 2 },
    "next-round-scheduled": { title: "Next Round Scheduled", stage: 2 },
    "next-round-selected": { title: "Next Round Selected", stage: 2 },
    "next-round-rejected": { title: "Next Round Rejected", stage: 2, negative: true, note: { label: "Reason for Cancellation", tone: "error" } },
    "offer-received": { title: "Offer Received", stage: 3, note: { label: "Next Step", tone: "info" } },
    "offer-accepted": { title: "Offer Accepted", stage: 3, terminal: true, note: { label: "Next Step", tone: "info" } },
    "offer-declined": { title: "Offer Declined", stage: 3, negative: true, terminal: true, note: { label: "Reason", tone: "info" } },
    "offer-expired": { title: "Offer Expired", stage: 3, negative: true, terminal: true, note: { label: "Reason for Withdrawal", tone: "error" } },
    withdrawn: { title: "Withdrawn by the Student", stage: 1, negative: true, terminal: true, note: { label: "Reason for Withdrawal", tone: "error" } },
};

export interface ActivityEvent {
    type: ActivityType;
    /** Display timestamp, e.g. "6th Aug, 2026 • 2:10 PM". */
    at: string;
    note?: { title?: string; detail?: string };
}

export interface Application {
    id: string;
    jobId: string;
    appliedOn: string;
    /** ISO date used for sorting / date filters. */
    appliedAt: string;
    matchScore: number;
    activity: ActivityEvent[];
}

const T0 = "6th Aug, 2026 • 10:30 AM";
const T = "6th Aug, 2026 • 2:10 PM";

const PIPELINE: ActivityType[] = [
    "submitted",
    "viewed-by-placement",
    "shortlisted-by-placement",
    "recruiter-review",
    "shortlisted-by-recruiter",
    "interview-scheduled",
    "interview-completed",
    "next-round-scheduled",
    "next-round-selected",
    "offer-received",
];

/** Builds the timeline up to (and excluding) `upTo`, then appends `last`. */
const history = (upTo: ActivityType, last: ActivityEvent): ActivityEvent[] => [
    ...PIPELINE.slice(0, PIPELINE.indexOf(upTo)).map((type, i) => ({ type, at: i === 0 ? T0 : T })),
    last,
];

const app = (id: string, jobId: string, appliedOn: string, appliedAt: string, activity: ActivityEvent[]): Application => ({
    id,
    jobId,
    appliedOn,
    appliedAt,
    matchScore: 85,
    activity,
});

/** One application per Figma "Activity" variant so every state can be reviewed. */
export const APPLICATIONS: Application[] = [
    app("app-soc-analyst", "soc-analyst-microsoft", "18th Aug", "2026-08-18", history("viewed-by-placement", { type: "viewed-by-placement", at: T })),
    app("app-cloud-engineer", "cloud-engineer-apple", "8th Aug", "2026-08-08", history("viewed-by-placement", { type: "viewed-by-placement", at: T })),
    app("app-product-designer", "product-designer-microsoft", "6th Aug", "2026-08-06", [
        ...history("offer-received", { type: "offer-received", at: T }),
        { type: "offer-accepted", at: T, note: { detail: "Congratulations! You will receive a call from recruiter for further notice." } },
    ]),
    app("app-network-engineer", "network-engineer-google", "6th Aug", "2026-08-06", history("offer-received", {
        type: "offer-received",
        at: T,
        note: { detail: "You have 3 days to make a decision with this offer." },
    })),
    app("app-devops-architect", "devops-architect-google", "5th Aug", "2026-08-05", history("next-round-selected", { type: "next-round-selected", at: T })),
    app("app-pen-tester", "penetration-tester-apple", "4th Aug", "2026-08-04", history("interview-completed", {
        type: "interview-rescheduled",
        at: T,
        note: { title: "Recruiter unavailable", detail: "The interview has been rescheduled. Updated details will be shared." },
    })),
    app("app-threat-hunter", "threat-hunter-google", "3rd Aug", "2026-08-03", history("interview-completed", {
        type: "interview-hold",
        at: T,
        note: { title: "Candidate didn’t appear." },
    })),
    app("app-it-support", "it-support-apple", "2nd Aug", "2026-08-02", history("interview-completed", {
        type: "interview-cancelled",
        at: T,
        note: { title: "Company hiring paused", detail: "The interview has been cancelled due to internal or scheduling reasons." },
    })),
    app("app-security-intern", "security-intern-microsoft", "1st Aug", "2026-08-01", history("next-round-selected", {
        type: "next-round-rejected",
        at: T,
        note: { title: "Candidate didn’t appear." },
    })),
    app("app-cloud-engineer-2", "cloud-engineer-apple", "30th Jul", "2026-07-30", [
        ...history("offer-received", { type: "offer-received", at: T }),
        { type: "offer-declined", at: T, note: { title: "Accepted another offer", detail: "Compensation or role expectations did not match candidate preferences." } },
    ]),
    app("app-soc-analyst-2", "soc-analyst-microsoft", "28th Jul", "2026-07-28", [
        ...history("offer-received", { type: "offer-received", at: T }),
        { type: "offer-expired", at: T, note: { title: "No response from candidate", detail: "The offer was not accepted within the given deadline and has now expired." } },
    ]),
    app("app-network-engineer-2", "network-engineer-google", "26th Jul", "2026-07-26", history("next-round-selected", {
        type: "withdrawn",
        at: T,
        note: { title: "Not interested in role", detail: "Candidate has voluntarily withdrawn from the recruitment process." },
    })),
    app("app-devops-architect-2", "devops-architect-google", "24th Jul", "2026-07-24", history("shortlisted-by-recruiter", {
        type: "rejected-by-recruiter",
        at: T,
        note: { title: "Better candidates available", detail: "Other candidates better matched the job criteria." },
    })),
    app("app-pen-tester-2", "penetration-tester-apple", "22nd Jul", "2026-07-22", history("shortlisted-by-placement", {
        type: "rejected-by-placement",
        at: T,
        note: { title: "CGPA Issue", detail: "Minimum required CGPA is 7.5, candidate has 6.8" },
    })),
];

export type StageState = "done" | "active" | "pending" | "failed";
export const STAGES = ["Applied", "Under Review", "Interview", "Offer"] as const;

export const lastEvent = (application: Application) => application.activity[application.activity.length - 1];

export const isClosed = (application: Application) => {
    const meta = ACTIVITY[lastEvent(application).type];
    return !!(meta.negative || meta.terminal);
};

/** Card tracker state for each of the four pipeline stages. */
export function stageStates(application: Application): StageState[] {
    const meta = ACTIVITY[lastEvent(application).type];
    return STAGES.map((_, i) => {
        if (i < meta.stage) return "done";
        if (i > meta.stage) return "pending";
        if (meta.negative) return "failed";
        return meta.terminal ? "done" : "active";
    });
}

export type ApplicationStatus = "Under Review" | "Interview" | "Offer" | "Closed";

export const applicationStatus = (application: Application): ApplicationStatus => {
    if (isClosed(application) && lastEvent(application).type !== "offer-accepted") return "Closed";
    return STAGES[ACTIVITY[lastEvent(application).type].stage] as ApplicationStatus;
};

export const nowStamp = () => {
    const d = new Date();
    const day = d.getDate();
    const suffix = day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th";
    const month = d.toLocaleString("en-US", { month: "short" });
    const time = d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit" });
    return { stamp: `${day}${suffix} ${month}, ${d.getFullYear()} • ${time}`, short: `${day}${suffix} ${month}`, iso: d.toISOString().slice(0, 10) };
};

// ─── Resumes ───────────────────────────────────────────────────────────────
/** Apply-flow view of an approved Resume Builder resume. */
export interface Resume {
    id: string;
    name: string;
    size: string;
    approved: boolean;
}

// ─── Apply form defaults (prefilled from the student profile) ─────────────
export const APPLICANT_PROFILE = {
    basic: { firstName: "Aanchal Ravi Gupta", whatsapp: "+91 7454459098", email: "aanchalg@gmail.com" },
    experience: { title: "Product Designer", company: "Connecting Cyber Network", from: "July 2025", to: "Dec 2026", city: "Mumbai", description: "" },
    education: { school: "Mumbai University", degree: "Bachelor of Science", major: "Computer Science", from: "July 2025", to: "Dec 2026" },
};

export const ADDITIONAL_QUESTIONS = [
    { id: "ux-years", label: "How many years of Experience of work experience do you have with User Experience?", value: "3" },
    { id: "onsite", label: "Are you comfortable working in an onsite setting?", value: "" },
    { id: "current-ctc", label: "What is your current CTC?", value: "" },
    { id: "expected-ctc", label: "What is your expected CTC?", value: "" },
    { id: "notice", label: "How soon can you join us?", value: "" },
];

// ─── Request a job ─────────────────────────────────────────────────────────
export const REQUEST_LOCATIONS = ["Mumbai", "Bangalore", "Delhi", "Hyderabad", "Pune", "Chennai", "Kolkata", "Remote"];
export const REQUEST_JOB_TYPES = ["Work from home", "Part Time", "Hybrid", "Work from Office"] as const;
export const SALARY_RANGE = { min: 0, max: 100 };

// ─── Interview preparation ─────────────────────────────────────────────────
export interface PrepArticle {
    slug: string;
    title: string;
    source: string;
    category: "Career Guide" | "Interview Tips" | "Cyber Security";
    readMinutes: number;
}

/** Slugs match the student blog so "Read More" opens the full article. */
export const PREP_ARTICLES: PrepArticle[] = [
    { slug: "how-to-start-a-career-in-cyber-security-after-college", title: "How to Start a Career in Cyber Security After College", source: "Learning at CCN", category: "Career Guide", readMinutes: 15 },
    { slug: "soft-skills-in-cyber-security-interviews", title: "Why Soft Skills Matter in Cyber Security Interviews", source: "Learning at CCN", category: "Interview Tips", readMinutes: 7 },
    { slug: "soc-analyst-roadmap-2025", title: "SOC Analyst Roadmap: Skills You Need in 2025", source: "Learning at CCN", category: "Career Guide", readMinutes: 18 },
    { slug: "cracking-the-ceh-exam-study-plan", title: "Cracking the CEH Exam: A Practical Study Plan", source: "Learning at CCN", category: "Interview Tips", readMinutes: 14 },
    { slug: "top-10-linux-commands-for-pentesters", title: "Top 10 Linux Commands Every Pentester Should Know", source: "Learning at CCN", category: "Cyber Security", readMinutes: 8 },
    { slug: "firewalls-explained-packet-filters-to-ngfw", title: "Firewalls Explained: From Packet Filters to NGFW", source: "Learning at CCN", category: "Cyber Security", readMinutes: 11 },
];

export const articleHref = (slug: string) => `/dashboard/student/updates/blogs/${slug}`;

// ─── Routes ────────────────────────────────────────────────────────────────
export const PLACEMENT_ROUTES = {
    hub: "/dashboard/student/placement",
    jobs: "/dashboard/student/placement/jobs",
    job: (id: string) => `/dashboard/student/placement/jobs/${id}`,
    recommended: "/dashboard/student/placement/recommended",
    applications: "/dashboard/student/placement/applications",
    application: (id: string) => `/dashboard/student/placement/applications/${id}`,
    interviewPrep: "/dashboard/student/placement/interview-preparation",
    resume: "/dashboard/student/placement/resume-builder",
};
