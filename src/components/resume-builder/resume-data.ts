/**
 * Resume Builder data model.
 *
 * Every type here mirrors the payload the backend is expected to send / accept, so the
 * dummy data can later be swapped for API responses without touching the UI.
 * Dates are ISO-8601 strings, rich text is sanitised HTML, ids are opaque strings.
 */

export const rbAsset = (name: string) => `/resume-builder/${name}`;

// ─── Enums ─────────────────────────────────────────────────────────────────
export type ResumeStatus = "draft" | "under_review" | "needs_improvement" | "approved";
export type ResumeThemeId = "simple" | "modern" | "professional" | "custom";
export type BuilderStep = "theme" | "details" | "review";
export type DetailsTab = "personal" | "summary" | "education" | "achievements" | "skills" | "projects" | "experience" | "other";
export type SkillGroup = "technical" | "tools";
export type AiAction = "improve" | "metrics" | "generate" | "ats";

// ─── Resume content ────────────────────────────────────────────────────────
export interface ResumeLink {
    id: string;
    label: string;
    url: string;
}

export interface PersonalDetails {
    fullName: string;
    phone: string;
    email: string;
    location: string;
    /** Absolute URL / data URL of the profile photo, `null` when removed. */
    photoUrl: string | null;
    links: ResumeLink[];
}

export interface EducationEntry {
    id: string;
    institution: string;
    qualification: string;
    fieldOfStudy: string;
    yearOfCompletion: string;
    grade: string;
    /** HTML */
    description: string;
}

export interface AchievementEntry {
    id: string;
    certificationName: string;
    yearOfCompletion: string;
    organisation: string;
    credential: string;
    /** HTML */
    description: string;
}

export interface ProjectEntry {
    id: string;
    name: string;
    /** HTML */
    description: string;
}

export interface ExperienceEntry {
    id: string;
    company: string;
    role: string;
    /** ISO date (YYYY-MM-DD) */
    startDate: string;
    /** ISO date (YYYY-MM-DD), empty while the role is ongoing */
    endDate: string;
    /** HTML */
    description: string;
}

export interface OtherEntry {
    id: string;
    title: string;
    link: string;
    startDate: string;
    endDate: string;
    /** HTML */
    description: string;
}

export interface ResumeContent {
    personal: PersonalDetails;
    /** HTML */
    summary: string;
    education: EducationEntry[];
    achievements: AchievementEntry[];
    skills: Record<SkillGroup, string[]>;
    projects: ProjectEntry[];
    experience: ExperienceEntry[];
    other: OtherEntry[];
}

// ─── Review / feedback ─────────────────────────────────────────────────────
export interface AtsReview {
    score: number;
    maxScore: number;
    strengths: string[];
    improvements: string[];
}

/** Placement-team feedback attached when a resume is sent back for improvement. */
export interface ResumeFeedback {
    reviewedAt: string;
    keyIssues: string[];
    suggestions: string[];
}

export interface UploadedTemplate {
    fileName: string;
    sizeBytes: number;
}

export interface ResumeRecord {
    id: string;
    title: string;
    theme: ResumeThemeId;
    customTemplate: UploadedTemplate | null;
    status: ResumeStatus;
    isPrimary: boolean;
    createdAt: string;
    updatedAt: string;
    submittedAt: string | null;
    content: ResumeContent;
    feedback: ResumeFeedback | null;
    /** Public share URL issued by the backend. */
    shareUrl: string;
    /** Server rendered PDF; the client prints the live preview while this is `null`. */
    pdfUrl: string | null;
}

// ─── Static config ─────────────────────────────────────────────────────────
export const STEPS: { id: BuilderStep; label: string }[] = [
    { id: "theme", label: "Title & Select Theme" },
    { id: "details", label: "Enter your Details" },
    { id: "review", label: "Review & Optimize" },
];

export const DETAILS_TABS: { id: DetailsTab; label: string }[] = [
    { id: "personal", label: "Personal" },
    { id: "summary", label: "Summary" },
    { id: "education", label: "Education" },
    { id: "achievements", label: "Achievements" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "experience", label: "Experience" },
    { id: "other", label: "Other" },
];

export const THEMES: { id: Exclude<ResumeThemeId, "custom">; label: string }[] = [
    { id: "simple", label: "Simple" },
    { id: "modern", label: "Modern" },
    { id: "professional", label: "Professional" },
];

export const TEMPLATE_UPLOAD = { accept: ".doc,.docx", formats: "DOC", maxBytes: 10 * 1024 * 1024, maxLabel: "10 MB" };

export const SUMMARY_WORD_LIMIT = 300;

export const STATUS_META: Record<ResumeStatus, { label: string; color: string; icon: string | null }> = {
    draft: { label: "Draft", color: "#A6A6A6", icon: null },
    under_review: { label: "Under Review", color: "#FFAD4F", icon: "status-under-review.svg" },
    needs_improvement: { label: "Rejected Resume", color: "#D1293D", icon: "status-rejected.svg" },
    approved: { label: "Qualified Resume", color: "#2EC4B6", icon: "status-qualified.svg" },
};

export const STATUS_PAGE_COPY: Record<Exclude<ResumeStatus, "draft">, { title: string; body: string }> = {
    under_review: {
        title: "Your Resume is Under Review",
        body: "Our placement team is reviewing your resume. You’ll receive feedback within 24–48 hours.",
    },
    needs_improvement: {
        title: "Resume Needs Improvement",
        body: "Your resume was reviewed, but it needs some improvements before you can apply for jobs.",
    },
    approved: {
        title: "Resume Approved!",
        body: "Great job! Your resume meets placement standards. You can now start applying for job opportunities.",
    },
};

export const AI_ACTIONS: { id: AiAction; title: string; hint: string }[] = [
    { id: "improve", title: "Improve Writing", hint: "Make it more professional" },
    { id: "metrics", title: "Add Impact Metrics", hint: "Quantify your achievements" },
    { id: "generate", title: "Generate Content", hint: "AI write from your context" },
    { id: "ats", title: "ATS Optimize", hint: "Add ATS friendly keywords" },
];

export const SKILL_CATALOG: Record<SkillGroup, string[]> = {
    technical: [
        "Adobe In Design",
        "Communication Skills",
        "JavaScript",
        "Python",
        "Microsoft Excel",
        "Adobe Photoshop",
        "Figma",
        "Adobe Illustrator",
        "Network Security",
        "Ethical Hacking",
        "Incident Response",
        "Threat Analysis",
        "Linux Administration",
        "Cloud Security",
        "Vulnerability Assessment",
    ],
    tools: [
        "Adobe In Design",
        "Communication Skills",
        "JavaScript",
        "Python",
        "Figma",
        "Microsoft Excel",
        "Adobe Photoshop",
        "Adobe Illustrator",
        "Wireshark",
        "Nmap",
        "Splunk",
        "Burp Suite",
        "Metasploit",
        "Kali Linux",
        "AWS",
    ],
};

export const SKILL_GROUP_COPY: Record<SkillGroup, { label: string; add: string; modalTitle: string; modalBody: string; placeholder: string }> = {
    technical: {
        label: "TECHNICAL SKILLS",
        add: "Add Skill",
        modalTitle: "Select your Skills",
        modalBody: "Please select your key skills which will define your role properly.",
        placeholder: "Start typing your key skill",
    },
    tools: {
        label: "TOOLS & PLATFORMS",
        add: "Add Tools & Platforms",
        modalTitle: "Select Tools & Platforms",
        modalBody: "Please select the tools and platforms you have hands-on experience with.",
        placeholder: "Start typing a tool or platform",
    },
};

// ─── Tips ──────────────────────────────────────────────────────────────────
export interface TipsContent {
    title: string;
    what: { heading: string; intro: string; bullets: string[]; outro: string };
    how: { heading: string; steps: { title: string; hint: string; example: string }[] };
    avoid: { heading: string; items: { text: string; example?: string }[] };
}

const SUMMARY_TIPS: TipsContent = {
    title: "Tips for Summary",
    what: {
        heading: "WHAT IS A SUMMARY?",
        intro: "Your summary is a short introduction (2–4 lines) that highlights your:",
        bullets: ["Key skills", "Experience or projects", "Career focus"],
        outro: "This is the first thing recruiters and ATS scan",
    },
    how: {
        heading: "HOW TO WRITE A STRONG SUMMARY?",
        steps: [
            { title: "Start with Your Role + Skills", hint: "Use clear keywords from your domain", example: "“Product Designer skilled in UX research, wireframing, and prototyping…”" },
            { title: "Add Proof (Projects / Experience)", hint: "Mention what you’ve actually done", example: "“…with experience designing 5+ real-world web applications”" },
            { title: "Include Tools & Technologies", hint: "ATS looks for tools", example: "“Figma, Adobe XD, React basics”" },
            { title: "Show Career Intent", hint: "Tell what you’re looking for", example: "“seeking an entry-level role in product design”" },
        ],
    },
    avoid: {
        heading: "AVOID THESE MISTAKES",
        items: [
            { text: "Writing generic lines like", example: "“Hardworking and passionate individual”" },
            { text: "Using long paragraphs" },
            { text: "Adding personal details (age, address)" },
            { text: "Using vague words without proof" },
        ],
    },
};

const sectionTips = (
    section: string,
    intro: string,
    bullets: string[],
    steps: TipsContent["how"]["steps"],
    avoid: TipsContent["avoid"]["items"],
): TipsContent => ({
    title: `Tips for ${section}`,
    what: { heading: `WHAT TO ADD IN ${section.toUpperCase()}?`, intro, bullets, outro: "Recruiters and ATS use this section to match you with roles" },
    how: { heading: `HOW TO WRITE A STRONG ${section.toUpperCase()} SECTION?`, steps },
    avoid: { heading: "AVOID THESE MISTAKES", items: avoid },
});

export const TIPS: Record<DetailsTab | BuilderStep, TipsContent> = {
    summary: SUMMARY_TIPS,
    personal: sectionTips(
        "Personal Details",
        "Keep your contact details accurate and professional:",
        ["Full name as on documents", "Active phone & email", "LinkedIn / portfolio link"],
        [
            { title: "Use a professional email", hint: "Prefer your name over nicknames", example: "“aanchal.gupta@gmail.com”" },
            { title: "Add a clear photo", hint: "Plain background, face clearly visible", example: "“Head & shoulders, well lit”" },
            { title: "Link your profiles", hint: "Recruiters verify your work", example: "“linkedin.com/in/aanchal-gupta”" },
        ],
        [{ text: "Adding age, religion or marital status" }, { text: "Using outdated phone numbers" }],
    ),
    education: sectionTips(
        "Education",
        "List your qualifications, latest first:",
        ["Institution & qualification", "Field of study", "Year & grade"],
        [
            { title: "Start with the latest qualification", hint: "Recruiters read top-down", example: "“B.Sc. Information Technology — 2027”" },
            { title: "Mention grades when strong", hint: "CGPA / percentage / distinction", example: "“CGPA 8.6 / 10”" },
            { title: "Highlight relevant coursework", hint: "Keep it short and specific", example: "“Network Security, Cryptography”" },
        ],
        [{ text: "Listing every school you attended" }, { text: "Leaving out completion years" }],
    ),
    achievements: sectionTips(
        "Achievements",
        "Show certifications and awards that prove your skills:",
        ["Certification name", "Issuing organisation", "Credential ID / link"],
        [
            { title: "Add verifiable credentials", hint: "Include the credential ID or link", example: "“CompTIA Security+ — CCOMP001-10084”" },
            { title: "Keep them relevant", hint: "Prefer domain certifications", example: "“CEH, CCNA, Security+”" },
        ],
        [{ text: "Adding expired certifications" }, { text: "Listing participation-only certificates" }],
    ),
    skills: sectionTips(
        "Skills",
        "Group your skills so ATS can scan them quickly:",
        ["Technical skills", "Tools & platforms", "Domain keywords"],
        [
            { title: "Match the job description", hint: "Use the same keywords as the role", example: "“SIEM, Incident Response, Splunk”" },
            { title: "Keep it focused", hint: "8–12 strong skills beat 30 weak ones", example: "“Python, Wireshark, Nmap”" },
        ],
        [{ text: "Rating skills with stars or bars" }, { text: "Adding skills you can’t demonstrate" }],
    ),
    projects: sectionTips(
        "Projects",
        "Projects prove what you can actually build:",
        ["Project name", "What you built", "Measurable outcome"],
        [
            { title: "Lead with the outcome", hint: "Start with the result you achieved", example: "“Reduced false positives by 30%…”" },
            { title: "Mention the stack", hint: "ATS looks for tools", example: "“Built with Python, Splunk & ELK”" },
        ],
        [{ text: "Copying course descriptions" }, { text: "Writing long paragraphs" }],
    ),
    experience: sectionTips(
        "Experience",
        "Describe your roles with impact:",
        ["Company & role", "Duration", "Responsibilities & achievements"],
        [
            { title: "Use action verbs", hint: "Start every line with a verb", example: "“Monitored, triaged and escalated…”" },
            { title: "Quantify impact", hint: "Numbers make results believable", example: "“…handled 120+ alerts per week”" },
        ],
        [{ text: "Listing duties without results" }, { text: "Leaving gaps unexplained" }],
    ),
    other: sectionTips(
        "Other",
        "Add anything else that strengthens your profile:",
        ["Volunteering", "Publications", "Competitions & CTFs"],
        [
            { title: "Keep it relevant", hint: "Only add what supports your goal", example: "“Top 10 — National CTF 2024”" },
            { title: "Link proof", hint: "Add a link wherever possible", example: "“github.com/aanchal/ctf-writeups”" },
        ],
        [{ text: "Adding hobbies unrelated to the role" }],
    ),
    theme: sectionTips(
        "Themes",
        "Pick a layout that suits your profile:",
        ["Simple — clean two column layout", "Modern — bold accent header", "Professional — classic single accent"],
        [
            { title: "Name your resume", hint: "Use the role you are targeting", example: "“SOC Analyst — 2025”" },
            { title: "Prefer simple layouts", hint: "ATS reads plain layouts best", example: "“Simple”" },
        ],
        [{ text: "Uploading image-only templates" }],
    ),
    details: SUMMARY_TIPS,
    review: sectionTips(
        "ATS Score",
        "Your ATS score estimates how well hiring systems can read your resume:",
        ["Keyword coverage", "Section completeness", "Formatting"],
        [
            { title: "Fill every section", hint: "Empty sections lower the score", example: "“Summary, Skills, Experience”" },
            { title: "Use role keywords", hint: "Mirror the job description", example: "“SOC Analyst, SIEM, Threat Hunting”" },
        ],
        [{ text: "Using images for text" }, { text: "Using tables or text boxes" }],
    ),
};

// ─── Helpers ───────────────────────────────────────────────────────────────
export const uid = (prefix = "id") => `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;

export const htmlToText = (html: string) =>
    html
        .replace(/<\/(p|li|h\d)>/gi, " ")
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();

export const wordCount = (html: string) => {
    const text = htmlToText(html);
    return text ? text.split(" ").length : 0;
};

export const isBlankHtml = (html: string) => htmlToText(html).length === 0;

export const textToHtml = (text: string) => `<p>${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Display timezone for timestamps (keeps server and client rendering identical). */
export const DISPLAY_TIME_ZONE = "Asia/Kolkata";

/** "10 Jan 2024, 01:36 PM" */
export function formatEdited(iso: string) {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat("en-GB", { timeZone: DISPLAY_TIME_ZONE, day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })
            .formatToParts(new Date(iso))
            .map((p) => [p.type, p.value]),
    );
    return `${Number(parts.day)} ${MONTHS[Number(parts.month) - 1]} ${parts.year}, ${parts.hour.padStart(2, "0")}:${parts.minute} ${parts.dayPeriod.toUpperCase()}`;
}

/** ISO `YYYY-MM-DD` → `DD/MM/YY` (as typed in the form). */
export function isoToDisplayDate(iso: string) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    return m ? `${m[3]}/${m[2]}/${m[1].slice(2)}` : "";
}

/** `DD/MM/YY` or `DD/MM/YYYY` → ISO; `null` when the input is not a real date. */
export function displayToIsoDate(value: string): string | null {
    const m = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(value.trim());
    if (!m) return null;
    const year = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    const month = Number(m[2]);
    const day = Number(m[1]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export const yearOf = (iso: string) => (iso ? iso.slice(0, 4) : "");

export const formatBytes = (bytes: number) =>
    bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export const displayUrl = (url: string) => url.replace(/^https?:\/\//i, "").replace(/\/$/, "");

// ─── Factories ─────────────────────────────────────────────────────────────
export const blankEducation = (): EducationEntry => ({ id: uid("edu"), institution: "", qualification: "", fieldOfStudy: "", yearOfCompletion: "", grade: "", description: "" });
export const blankAchievement = (): AchievementEntry => ({ id: uid("ach"), certificationName: "", yearOfCompletion: "", organisation: "", credential: "", description: "" });
export const blankProject = (): ProjectEntry => ({ id: uid("prj"), name: "", description: "" });
export const blankExperience = (): ExperienceEntry => ({ id: uid("exp"), company: "", role: "", startDate: "", endDate: "", description: "" });
export const blankOther = (): OtherEntry => ({ id: uid("oth"), title: "", link: "", startDate: "", endDate: "", description: "" });

// ─── Student profile (source of pre-filled personal details) ───────────────
export const SAMPLE_PHOTO = rbAsset("avatar-sample.png");

export const STUDENT_PROFILE: PersonalDetails = {
    fullName: "Aanchal Gupta",
    phone: "+91 9898988959",
    email: "aanchalgupta@gmail.com",
    location: "Navi Mumbai",
    photoUrl: SAMPLE_PHOTO,
    links: [{ id: "link-linkedin", label: "LinkedIn URL", url: "https://www.linkedin.com/in/aanchal-gupta" }],
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** A new resume starts from the student profile so only the remaining sections need filling. */
export const blankContent = (): ResumeContent => ({
    personal: { ...clone(STUDENT_PROFILE), links: STUDENT_PROFILE.links.map((l) => ({ ...l, id: uid("link") })) },
    summary: "",
    education: [blankEducation()],
    achievements: [blankAchievement()],
    skills: { technical: [], tools: [] },
    projects: [blankProject()],
    experience: [blankExperience()],
    other: [blankOther()],
});

// ─── Dummy data ────────────────────────────────────────────────────────────
const SAMPLE_CONTENT: ResumeContent = {
    personal: STUDENT_PROFILE,
    summary:
        "<p>Cyber security graduate with hands-on experience in network security and SOC operations. Skilled in SIEM monitoring, threat analysis and incident response, with a CompTIA Security+ certification and lab experience securing enterprise networks.</p>",
    education: [
        {
            id: "edu-1",
            institution: "Mumbai University",
            qualification: "B.Sc. Information Technology",
            fieldOfStudy: "Cyber Security",
            yearOfCompletion: "2027",
            grade: "CGPA 8.4 / 10",
            description: "<p>Specialised in network security and cryptography.</p>",
        },
        {
            id: "edu-2",
            institution: "St.Augustine’s High School",
            qualification: "Class 10",
            fieldOfStudy: "Science",
            yearOfCompletion: "2024",
            grade: "Distinction",
            description: "",
        },
    ],
    achievements: [
        {
            id: "ach-1",
            certificationName: "Ethical Hacking",
            yearOfCompletion: "2023",
            organisation: "CCN",
            credential: "CCNEH-23-4471",
            description: "<p>Completed hands-on modules on reconnaissance, exploitation and reporting.</p>",
        },
        { id: "ach-2", certificationName: "CompTIA Security+", yearOfCompletion: "2024", organisation: "CCN", credential: "CCOMP001-10084", description: "" },
    ],
    skills: {
        technical: ["Adobe In Design", "Communication Skills", "JavaScript", "Python", "Figma", "Microsoft Excel", "Adobe Photoshop", "Adobe Illustrator"],
        tools: ["Adobe In Design", "Communication Skills", "JavaScript", "Python", "Figma", "Microsoft Excel", "Adobe Photoshop", "Adobe Illustrator"],
    },
    projects: [
        {
            id: "prj-1",
            name: "SOC Monitoring Dashboard",
            description: "<p>Built a Splunk dashboard to track alert volumes and mean time to respond across a simulated SOC.</p>",
        },
        { id: "prj-2", name: "Network Security Lab", description: "" },
    ],
    experience: [
        {
            id: "exp-1",
            company: "Connecting Cyber Networks",
            role: "SOC Analyst Intern",
            startDate: "2023-01-10",
            endDate: "2023-08-30",
            description: "<p>Supported the security operations team in monitoring SIEM alerts via Splunk, triaging and escalating high-priority incidents.</p>",
        },
        {
            id: "exp-2",
            company: "TCS",
            role: "Network Engineer",
            startDate: "2023-09-12",
            endDate: "2024-09-12",
            description: "<p>Configured firewalls and VPNs for client networks and documented hardening baselines.</p>",
        },
    ],
    other: [
        { id: "oth-1", title: "National CTF 2024 — Top 10", link: "https://ctf.ccn.example/2024", startDate: "2024-02-01", endDate: "2024-02-03", description: "" },
        { id: "oth-2", title: "TCS", link: "TCS", startDate: "2023-09-12", endDate: "2024-09-12", description: "" },
    ],
};

export const SAMPLE_FEEDBACK: ResumeFeedback = {
    reviewedAt: "2024-01-11T10:15:00.000Z",
    keyIssues: [
        "Weak project descriptions (no measurable results)",
        "Resume formatting not ATS-friendly",
        "Weak project descriptions (no measurable results)",
    ],
    suggestions: ["Add metrics and outcomes to projects", "Include cybersecurity tools (Wireshark, Nmap, etc.)", "Use bullet points instead of paragraphs"],
};

const shareUrlFor = (id: string) => `https://www.theecuationmatch.com/amitkumar/${id}/resume.pdf`;

export const SEED_RESUMES: ResumeRecord[] = [
    {
        id: "resume-100124",
        title: "Resume 100124",
        theme: "simple",
        customTemplate: null,
        status: "under_review",
        isPrimary: false,
        createdAt: "2024-01-09T09:00:00.000Z",
        updatedAt: "2024-01-10T13:36:00+05:30",
        submittedAt: "2024-01-10T13:36:00+05:30",
        content: clone(SAMPLE_CONTENT),
        feedback: null,
        shareUrl: shareUrlFor("resume-100124"),
        pdfUrl: null,
    },
    {
        id: "resume-100125",
        title: "Resume 100124",
        theme: "simple",
        customTemplate: null,
        status: "needs_improvement",
        isPrimary: false,
        createdAt: "2024-01-08T09:00:00.000Z",
        updatedAt: "2024-01-10T13:36:00+05:30",
        submittedAt: "2024-01-10T13:36:00+05:30",
        content: clone(SAMPLE_CONTENT),
        feedback: SAMPLE_FEEDBACK,
        shareUrl: shareUrlFor("resume-100125"),
        pdfUrl: null,
    },
    {
        id: "resume-aanchal",
        title: "Aanchal Gupta",
        theme: "simple",
        customTemplate: null,
        status: "approved",
        isPrimary: false,
        createdAt: "2024-12-01T09:00:00.000Z",
        updatedAt: "2024-12-08T16:06:00+05:30",
        submittedAt: "2024-12-07T11:00:00.000Z",
        content: clone(SAMPLE_CONTENT),
        feedback: null,
        shareUrl: "https://www.theecuationmatch.com/amitkumar/resume.pdf",
        pdfUrl: null,
    },
];

export function createResumeRecord(index: number): ResumeRecord {
    const now = new Date().toISOString();
    const id = uid("resume");
    return {
        id,
        title: `Resume ${100124 + index}`,
        theme: "simple",
        customTemplate: null,
        status: "draft",
        isPrimary: false,
        createdAt: now,
        updatedAt: now,
        submittedAt: null,
        content: blankContent(),
        feedback: null,
        shareUrl: shareUrlFor(id),
        pdfUrl: null,
    };
}

export function duplicateResumeRecord(source: ResumeRecord): ResumeRecord {
    const now = new Date().toISOString();
    const id = uid("resume");
    return {
        ...clone(source),
        id,
        title: `${source.title} (Copy)`,
        status: "draft",
        isPrimary: false,
        createdAt: now,
        updatedAt: now,
        submittedAt: null,
        feedback: null,
        shareUrl: shareUrlFor(id),
        pdfUrl: null,
    };
}

// ─── Routes ────────────────────────────────────────────────────────────────
export const RESUME_ROUTES = {
    list: "/dashboard/student/placement/resume-builder",
    view: (id: string) => `/dashboard/student/placement/resume-builder/${id}`,
    edit: (id: string, step: BuilderStep = "theme", tab?: DetailsTab) =>
        `/dashboard/student/placement/resume-builder/${id}/edit?step=${step}${tab ? `&tab=${tab}` : ""}`,
};

export const isBuilderStep = (value: string | null): value is BuilderStep => STEPS.some((s) => s.id === value);
export const isDetailsTab = (value: string | null): value is DetailsTab => DETAILS_TABS.some((t) => t.id === value);
