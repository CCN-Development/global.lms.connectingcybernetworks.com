/** Data model + mock data for the Placement Hub eligibility verification flow. */

export const placementAsset = (name: string) => `/placement/${name}`;

// ─── Types ─────────────────────────────────────────────────────────────────
export type EligibilityStepId = "course" | "hr" | "fees";

/** How a step renders in the left-hand stepper. */
export type StepStatus = "completed" | "active" | "pending";

/** How a checkpoint renders on a course / soft-skill progress card. */
export type MilestoneStatus = "completed" | "active" | "locked";

export interface Milestone {
    label: string;
    status: MilestoneStatus;
}

/** A course (or the Soft Skills batch) the student must finish, with its checkpoints. */
export interface TrackProgress {
    id: string;
    title: string;
    /** 0–100 */
    progress: number;
    latestUpdate: string;
    milestones: Milestone[];
}

export interface FeeProgress {
    id: string;
    title: string;
    /** Share of the course fee already paid, 0–100. */
    paidPercent: number;
    pendingAmount: number;
    latestUpdate: string;
}

export interface StepCompletionCopy {
    title: string;
    /** Rendered one per line; an empty string renders a blank line. */
    lines: string[];
    /** Short hint for the following step, shown in the "NEXT STEP" box. */
    nextStepHint?: string;
    actionLabel: string;
}

export interface EligibilityStep {
    id: EligibilityStepId;
    /** Left stepper copy */
    title: string;
    summary: string;
    /** Right panel copy */
    heading: string;
    description: string;
    completion: StepCompletionCopy;
}

export interface PlacementEligibility {
    /** All requirements met and the shortlisting step has finished — the Placement Hub is unlocked. */
    placementReady: boolean;
    /** Number of requirements the student has met (0–3), in step order. */
    completedSteps: number;
    /** Number of completion modals the student has already dismissed. */
    acknowledgedSteps: number;
    courses: TrackProgress[];
    softSkill: TrackProgress;
    fees: FeeProgress;
}

// ─── Steps ─────────────────────────────────────────────────────────────────
export const ELIGIBILITY_STEPS: EligibilityStep[] = [
    {
        id: "course",
        title: "Course Completion",
        summary: "Complete at least one course with its required assessments.",
        heading: "Complete a Course",
        description:
            "Complete at least one course along with its Technical Viva, MCQ Exam, and Lab Exam to meet the course requirement.",
        completion: {
            title: "Step 1 Completed!",
            lines: [
                "You’ve completed Step 1 of 3!",
                "Great work! You’ve completed the course requirement for placement eligibility.",
            ],
            nextStepHint: "Complete your Soft Skills batch and clear the HR round",
            actionLabel: "Okay, I understood",
        },
    },
    {
        id: "hr",
        title: "HR Round",
        summary: "Complete your Soft Skills batch and clear the HR round.",
        heading: "HR Round",
        description:
            "Complete your Soft Skills batch and clear the HR round to move one step closer to placement eligibility.",
        completion: {
            title: "HR Round Completed",
            lines: [
                "You’ve completed Step 2 of 3!",
                "Your Soft Skills and HR requirements are now complete. You’re one step closer to becoming placement eligible.",
            ],
            nextStepHint: "Clear 100% of your course fees to unlock placement eligibility.",
            actionLabel: "Okay, I understood",
        },
    },
    {
        id: "fees",
        title: "Fees Completion",
        summary: "Clear 100% of your course fees to become placement eligible.",
        heading: "Complete Your Fees",
        description:
            "Clear 100% of your course fees to complete this requirement and unlock placement eligibility.",
        completion: {
            title: "You’re now placement ready!",
            lines: [
                "You’ve completed all 3 requirements!",
                "",
                "Your course, Soft Skills & HR, and fee requirements are complete. You’re now eligible to apply for placement opportunities.",
            ],
            actionLabel: "Explore Recommended Jobs",
        },
    },
];

export const TOTAL_STEPS = ELIGIBILITY_STEPS.length;

export const WHY_THESE_STEPS = {
    title: "Why these steps?",
    body: "These requirements ensure you’re technically skilled, professionally prepared, and ready for placement.",
};

export const PROGRESS_FOOTNOTE = "You’ll be notified as you complete move forward in steps";

export const LOADER_COPY = {
    title: "Please wait...",
    subtitle: "Shortlisting best opportunities for you!",
};

// ─── Mock student data (replace with API response) ─────────────────────────
export const PLACEMENT_ELIGIBILITY: PlacementEligibility = {
    // The sample student has cleared every requirement; use `?stage=` to review the verification screens.
    placementReady: true,
    completedSteps: 3,
    acknowledgedSteps: 3,
    courses: [
        {
            id: "ccna",
            title: "Cisco Certified Network Associate (CCNA)",
            progress: 60,
            latestUpdate: "Batch completed on 12th May, 2026",
            milestones: [
                { label: "Batch", status: "completed" },
                { label: "Technical Viva", status: "active" },
                { label: "Exam", status: "locked" },
            ],
        },
        {
            id: "ethical-hacking",
            title: "Ethical Hacking",
            progress: 10,
            latestUpdate: "Batch is in progress",
            milestones: [
                { label: "Batch", status: "active" },
                { label: "Technical Viva", status: "locked" },
                { label: "Exam", status: "locked" },
            ],
        },
        {
            id: "bug-bounty",
            title: "Bug Bounty",
            progress: 0,
            latestUpdate: "Batch is in progress",
            milestones: [
                { label: "Batch", status: "locked" },
                { label: "Technical Viva", status: "locked" },
                { label: "Exam", status: "locked" },
            ],
        },
    ],
    softSkill: {
        id: "soft-skill",
        title: "Soft Skill",
        progress: 60,
        latestUpdate: "Batch completed on 12th May, 2026",
        milestones: [
            { label: "Batch", status: "completed" },
            { label: "HR Round", status: "active" },
            { label: "Exam", status: "locked" },
        ],
    },
    fees: {
        id: "soft-skill-fees",
        title: "Soft Skill",
        paidPercent: 74,
        pendingAmount: 12000,
        latestUpdate: "Last paid on 12th May, 2026",
    },
};

/**
 * Named states matching each Figma frame, selectable with `?stage=<key>` so every
 * screen of the flow can be reviewed without real backend progress.
 */
export const PREVIEW_STAGES = {
    course: { completedSteps: 0, acknowledgedSteps: 0 },
    "course-completed": { completedSteps: 1, acknowledgedSteps: 0 },
    hr: { completedSteps: 1, acknowledgedSteps: 1 },
    "hr-completed": { completedSteps: 2, acknowledgedSteps: 1 },
    fees: { completedSteps: 2, acknowledgedSteps: 2 },
    ready: { completedSteps: 3, acknowledgedSteps: 2 },
    shortlisting: { completedSteps: 3, acknowledgedSteps: 3 },
} as const satisfies Record<string, Pick<PlacementEligibility, "completedSteps" | "acknowledgedSteps">>;

export type PreviewStage = keyof typeof PREVIEW_STAGES;

export const isPreviewStage = (value: string | null): value is PreviewStage =>
    !!value && Object.prototype.hasOwnProperty.call(PREVIEW_STAGES, value);

// ─── Helpers ───────────────────────────────────────────────────────────────
export const stepStatus = (index: number, currentIndex: number): StepStatus =>
    index < currentIndex ? "completed" : index === currentIndex ? "active" : "pending";

/** Remaining checkpoints, surfaced only once the student has started clearing them. */
export const remainingMilestones = (track: TrackProgress) =>
    track.milestones.some((m) => m.status === "completed")
        ? track.milestones.filter((m) => m.status === "locked").length
        : 0;

export const formatAmount = (amount: number) => amount.toLocaleString("en-IN");
