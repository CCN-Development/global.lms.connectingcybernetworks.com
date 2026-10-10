/** Filter groups + matchers for the Placement list pages. */
import type { FilterGroup } from "./Filters";
import { Application, COMPANIES, Job, JobType, PrepArticle, applicationStatus, findJob } from "./jobs-data";

const opts = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

const JOB_TYPES: JobType[] = ["Full Time", "Part Time", "Remote", "Hybrid", "Internship"];
const companyOptions = Object.values(COMPANIES).map((c) => ({ value: c.id, label: c.name }));

// ─── Jobs ──────────────────────────────────────────────────────────────────
export const JOB_FILTER_GROUPS: FilterGroup[] = [
    { id: "jobType", label: "Job Type", options: opts(JOB_TYPES) },
    { id: "skillMatch", label: "Skill Match", options: opts(["80% and above", "60% – 79%", "Below 60%"]) },
    { id: "location", label: "Location", options: opts(["Hyderabad", "Mumbai", "Bangalore", "Pune", "Delhi"]) },
    { id: "company", label: "Company", options: companyOptions },
    { id: "salary", label: "Salary", options: opts(["Up to 10 LPA", "10 – 20 LPA", "20+ LPA"]) },
    { id: "posted", label: "Date Posted", options: opts(["Last 24 hours", "Last 3 days", "Last 7 days"]) },
    { id: "saved", label: "Saved", options: opts(["Favourites"]) },
];

export function jobFilterValues(job: Job, groupId: string, favourites: Set<string>): string[] {
    switch (groupId) {
        case "jobType":
            return [job.jobType];
        case "skillMatch":
            return [job.skillMatch >= 80 ? "80% and above" : job.skillMatch >= 60 ? "60% – 79%" : "Below 60%"];
        case "location":
            return [job.location.split(",")[0].trim()];
        case "company":
            return [job.company];
        case "salary":
            return [job.salary[1] <= 10 ? "Up to 10 LPA" : job.salary[0] >= 20 ? "20+ LPA" : "10 – 20 LPA"];
        case "posted":
            return ["Last 7 days", ...(job.postedDaysAgo <= 3 ? ["Last 3 days"] : []), ...(job.postedDaysAgo <= 1 ? ["Last 24 hours"] : [])].filter(
                () => job.postedDaysAgo <= 7,
            );
        case "saved":
            return favourites.has(job.id) ? ["Favourites"] : [];
        default:
            return [];
    }
}

export const JOB_SORTS = [
    { value: "relevance", label: "Most Relevant" },
    { value: "match", label: "Best Match" },
    { value: "newest", label: "Newest" },
    { value: "salary", label: "Highest Salary" },
] as const;
export type JobSort = (typeof JOB_SORTS)[number]["value"];

/** "relevance" keeps the server's ranking order. */
export const sortJobs = (jobs: Job[], sort: JobSort) =>
    sort === "relevance"
        ? [...jobs]
        : [...jobs].sort((a, b) =>
              sort === "newest" ? a.postedDaysAgo - b.postedDaysAgo : sort === "salary" ? b.salary[1] - a.salary[1] : b.skillMatch - a.skillMatch,
          );

export const matchesQuery = (job: Job, query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [job.title, COMPANIES[job.company].name, job.location, ...job.skills].some((v) => v.toLowerCase().includes(q));
};

// ─── Applications ──────────────────────────────────────────────────────────
export const APPLICATION_FILTER_GROUPS: FilterGroup[] = [
    { id: "status", label: "Status", options: opts(["Under Review", "Interview", "Offer", "Closed"]) },
    { id: "company", label: "Company", options: companyOptions },
    { id: "jobType", label: "Job Type", options: opts(JOB_TYPES) },
];

export function applicationFilterValues(application: Application, groupId: string): string[] {
    const job = findJob(application.jobId);
    if (groupId === "status") return [applicationStatus(application)];
    if (groupId === "company") return job ? [job.company] : [];
    if (groupId === "jobType") return job ? [job.jobType] : [];
    return [];
}

export const APPLICATION_SORTS = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
] as const;
export type ApplicationSort = (typeof APPLICATION_SORTS)[number]["value"];

export const sortApplications = (applications: Application[], sort: ApplicationSort) =>
    [...applications].sort((a, b) => (sort === "oldest" ? a.appliedAt.localeCompare(b.appliedAt) : b.appliedAt.localeCompare(a.appliedAt)));

// ─── Interview preparation ─────────────────────────────────────────────────
export const PREP_FILTER_GROUPS: FilterGroup[] = [
    { id: "category", label: "Category", options: opts(["Career Guide", "Interview Tips", "Cyber Security"]) },
    { id: "readTime", label: "Read Time", options: opts(["Under 10 min", "10 – 15 min", "Over 15 min"]) },
];

export function prepFilterValues(article: PrepArticle, groupId: string): string[] {
    if (groupId === "category") return [article.category];
    if (groupId === "readTime") return [article.readMinutes < 10 ? "Under 10 min" : article.readMinutes <= 15 ? "10 – 15 min" : "Over 15 min"];
    return [];
}
