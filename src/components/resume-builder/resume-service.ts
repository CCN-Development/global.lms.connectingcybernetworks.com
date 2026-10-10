/**
 * Resume Builder service layer.
 *
 * Everything that will eventually hit the backend lives here behind async functions,
 * so swapping the mock implementation for real `fetch`/axios calls is a local change.
 */
import {
    AiAction,
    AtsReview,
    ResumeContent,
    ResumeRecord,
    SEED_RESUMES,
    htmlToText,
    isBlankHtml,
} from "./resume-data";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** GET /placement/resumes */
export async function fetchResumes(): Promise<ResumeRecord[]> {
    return SEED_RESUMES;
}

/** PUT /placement/resumes/:id */
export async function saveResume(resume: ResumeRecord): Promise<ResumeRecord> {
    return resume;
}

/** POST /placement/resumes/:id/submit */
export async function submitResume(resume: ResumeRecord): Promise<ResumeRecord> {
    const now = new Date().toISOString();
    return { ...resume, status: "under_review", submittedAt: now, updatedAt: now, feedback: null };
}

// ─── AI assist ─────────────────────────────────────────────────────────────
export interface AiContext {
    /** Section the text belongs to, e.g. "summary", "experience". */
    section: string;
    /** Free-form hints (role, company, project name…) used when generating from scratch. */
    hints: string[];
}

const IMPROVED_SAMPLES = [
    "Supported the security operations team in monitoring SIEM alerts via Splunk, triaging and escalating high-priority incidents. Developed custom detection rules to improve alert accuracy across the enterprise environment.",
    "Monitored and triaged SIEM alerts in Splunk for a 24x7 SOC, escalating critical incidents within SLA and authoring detection rules that sharpened alert fidelity across enterprise assets.",
    "Strengthened SOC operations by analysing Splunk SIEM alerts, prioritising high-risk incidents for escalation and engineering custom correlation rules that reduced noisy alerts.",
];

const METRIC_SUFFIXES = [
    " Handled 120+ alerts per week and cut false positives by 30%.",
    " Reduced mean time to respond by 25% across 3 client environments.",
    " Delivered 5 detection playbooks adopted by a 12-member team.",
];

const ATS_KEYWORDS = " Keywords: SIEM, Incident Response, Threat Analysis, Network Security, Splunk.";

const POLISH: [RegExp, string][] = [
    [/\bhelped\b/gi, "supported"],
    [/\bworked on\b/gi, "delivered"],
    [/\bresponsible for\b/gi, "accountable for"],
    [/\bhands-on experience\b/gi, "proven hands-on experience"],
    [/\bSkilled in\b/g, "Adept at"],
    [/\bgood\b/gi, "strong"],
    [/\bdid\b/gi, "executed"],
    [/\bmade\b/gi, "built"],
];

const CLOSERS = [
    " Recognised for clear documentation and dependable execution.",
    " Known for calm, structured problem solving under pressure.",
    " Committed to continuous learning and measurable security outcomes.",
];

const sentenceCase = (text: string) => {
    const trimmed = text.trim().replace(/\s+/g, " ");
    if (!trimmed) return trimmed;
    const capped = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    return /[.!?]$/.test(capped) ? capped : `${capped}.`;
};

const polish = (text: string, attempt: number) => {
    const rewritten = POLISH.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), sentenceCase(text));
    return rewritten === sentenceCase(text) || attempt > 0 ? `${rewritten}${CLOSERS[attempt % CLOSERS.length]}` : rewritten;
};

/** POST /placement/resumes/ai-assist — returns plain text for the chosen action. */
export async function aiAssist(action: AiAction, html: string, context: AiContext, attempt = 0): Promise<string> {
    await delay(700);
    const source = isBlankHtml(html) ? "" : htmlToText(html);
    const sample = IMPROVED_SAMPLES[attempt % IMPROVED_SAMPLES.length];
    const base = source ? sentenceCase(source) : sample;

    switch (action) {
        case "improve":
            return source ? polish(source, attempt) : sample;
        case "metrics":
            return `${base}${METRIC_SUFFIXES[attempt % METRIC_SUFFIXES.length]}`;
        case "generate": {
            const hints = context.hints.filter(Boolean).join(", ");
            return hints ? `${sample} Focused on ${hints}.` : sample;
        }
        case "ats":
            return `${base}${ATS_KEYWORDS}`;
    }
}

// ─── ATS analysis ──────────────────────────────────────────────────────────
const STRENGTHS = [
    "You tied 'financial analysis' and 'valuation models' to analyst roles, which supports strong match quality.",
    "You showed a multi scenario DCF project, which demonstrates hands-on valuation ability.",
];

const IMPROVEMENTS = [
    "Add counts for reports, models, or client engagements to show scale.",
    "State the next role you want so your summary aligns with one target.",
    "Add forecasting, variance analysis, and management reporting for analyst roles.",
    "Pick a template design to match your style, field, and career goals.",
];

const hasMetrics = (content: ResumeContent) =>
    [content.summary, ...content.experience.map((e) => e.description), ...content.projects.map((p) => p.description)].some((html) =>
        /\d+\s*(%|\+|x\b)/i.test(htmlToText(html)),
    );

/** POST /placement/resumes/:id/ats-score — mocked as a completeness score. */
export function analyseResume(content: ResumeContent): AtsReview {
    const { personal } = content;
    const checks: [boolean, number][] = [
        [!!(personal.fullName && personal.email && personal.phone), 10],
        [htmlToText(content.summary).split(" ").filter(Boolean).length >= 20, 15],
        [content.education.some((e) => e.institution.trim()), 10],
        [content.skills.technical.length >= 5, 10],
        [content.skills.tools.length >= 3, 10],
        [content.experience.some((e) => e.company.trim() && e.role.trim()), 15],
        [content.projects.some((p) => p.name.trim()), 10],
        [content.achievements.some((a) => a.certificationName.trim()), 5],
        [hasMetrics(content), 15],
    ];
    const score = checks.reduce((total, [passed, weight]) => total + (passed ? weight : 0), 0);
    return { score, maxScore: 100, strengths: STRENGTHS, improvements: IMPROVEMENTS };
}

export function atsVerdict(score: number) {
    if (score >= 75) return { text: "Strong resume. Ready for submission.", color: "#42CC42" };
    if (score >= 50) return { text: "Good start. A few improvements are recommended.", color: "#FFAD4F" };
    return { text: "Add more details before submitting for review.", color: "#D1293D" };
}
