/** Design tokens + mock data for the student "My Profile" screens (Figma: LMS-3 › My Profile). */

export const profileAsset = (name: string) => `/profile/${name}`;

export const PC = {
    white: "#FFFFFF",
    n50: "#F2F2F2",
    n100: "#D9D9D9",
    n200: "#BFBFBF",
    n300: "#A6A6A6",
    n400: "#8C8C8C",
    n500: "#737373",
    n600: "#5A5A5A",
    n700: "#404040",
    n800: "#262626",
    primary75: "#E3E9F8",
    primary300: "#6A8AD7",
    primary500: "#2F53AD",
    teal: "#2EC4B6",
    success300: "#6AD76A",
    success500: "#2FAD2F",
    warning500: "#FFAD4F",
    error500: "#D1293D",
    deepNavy: "#07051B",

    /** Figma "Gradients 1" (purple → navy) used on section pills and progress fills. */
    gradientPurple: "linear-gradient(151deg, #8C24FF 9.02%, #0E1934 89.87%)",
    /** Figma "Gradients 6" (teal → green). */
    gradientTeal: "linear-gradient(91deg, #2EC4B6 4.52%, #1B4C33 104.18%)",
    gradientActive: "linear-gradient(82deg, #2EC4B6 20.8%, #1B4C33 99.85%)",
    gradientNew: "linear-gradient(-6deg, #192C5C 7.71%, #345DC2 92.29%)",

    /** "My Tasks" glass card fill (44% opacity baked into the stops). */
    cardFill:
        "linear-gradient(165deg, rgba(0,0,0,0.387) 1.34%, rgba(10,9,9,0.282) 48.72%, rgba(102,102,102,0.009) 96.09%)",
    cardFillStrong:
        "linear-gradient(165deg, rgba(0,0,0,0.563) 1.34%, rgba(10,9,9,0.41) 48.72%, rgba(102,102,102,0.013) 96.09%)",
    /** Badge tiles use the same fill at full opacity. */
    cardFillSolid:
        "linear-gradient(165deg, rgba(0,0,0,0.88) 1.34%, rgba(10,9,9,0.64) 48.72%, rgba(102,102,102,0.02) 96.09%)",
    /** Card stroke: bright top-left / bottom-right edges, transparent middle. */
    cardStroke:
        "linear-gradient(158deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0) 20.1%, rgba(255,255,255,0) 74.2%, rgba(255,255,255,0.88) 100%)",
    /** Stroke used by inner rows / inputs (64,64,64 → 166,166,166). */
    rowStroke: (alpha: number) =>
        `linear-gradient(90deg, rgba(64,64,64,${alpha}) 0%, rgba(166,166,166,${alpha}) 100%)`,
} as const;

// ─── Personal details ──────────────────────────────────────────────────────
export const PERSONAL = {
    name: "Aanchal Ravi Gupta",
    gender: "Female",
    dateOfBirth: "06-11-2006",
    phone: "+91 7888337278",
    email: "aanchalg@gmail.com",
    whatsapp: "+91 7454459098",
    aadhaarMasked: "XXXX XXXX 4582",
    passwordUpdated: "Last updated on 24 Jan 2026",
    academic: {
        institute: "Little Flower College of Science",
        location: "SakiNaka, Mumbai",
        highestEducation: "Class 12",
        documentLabel: "12th Marksheet",
        documentVerified: false,
    },
    parent: {
        name: "Ravi Ashok Sharma",
        phone: "+91 7888337278",
        otpPhone: "+91-7637258223",
        email: "sanjaysharma@gmail.com",
        relationship: "Father",
    },
    residential: {
        street: "Shree Heights, Andheri East",
        apartment: "A Wing FlatNo. 1604",
        city: "Mumbai",
        state: "Maharashtra",
        zip: "400069",
    },
} as const;

// ─── Fees ──────────────────────────────────────────────────────────────────
export type ProgramStatus = "active" | "new";

export interface Program {
    id: string;
    name: string;
    shortName: string;
    status: ProgramStatus;
    duration: string;
    courses?: string;
    benefits: string;
    enrollmentDate: string;
    studentId: string;
    rm: string;
    counsellor: string;
}

export interface TimelineItem {
    id: string;
    programId: string;
    /** Label used when a single program is selected, e.g. "2nd Installment". */
    label: string;
    amount: string;
    due?: string;
    paid?: { title: string; method: string };
}

export type DueTone = "warning" | "success" | "error";

export interface DueLine {
    label: string;
    amount: string;
    pill?: string;
}

export interface FeeSummary {
    combinedLabel?: string;
    total: string;
    pending: string;
    paid: string;
    percent: number;
    title?: string;
    dueOn?: string;
    status?: { label: string; tone: DueTone };
    /** Itemised breakdown (overdue states); when omitted only "Total Payable" is shown. */
    lines?: DueLine[];
    lateFee?: string;
    totalPayable: string;
    payAllDues?: string;
    note?: string;
}

export interface FeeScenario {
    layout: "multi" | "single";
    programs: Program[];
    summary: FeeSummary;
    defaultTab: string;
}

export const PROGRAMS: Record<string, Program> = {
    cyber: {
        id: "cyber",
        name: "Cyber Security Professional Program",
        shortName: "Cyber Security Professional",
        status: "active",
        duration: "12 Month",
        courses: "6 Courses",
        benefits: "3 Benefits",
        enrollmentDate: "12 May 2026",
        studentId: "CCN-2026-10",
        rm: "Falguni Pathak",
        counsellor: "Fatema Shaikh",
    },
    ethical: {
        id: "ethical",
        name: "Ethical Hacking",
        shortName: "Ethical Hacking",
        status: "new",
        duration: "2 Month",
        benefits: "3 Benefits",
        enrollmentDate: "18 July 2026",
        studentId: "CCN-2026-10",
        rm: "Falguni Pathak",
        counsellor: "Fatema Shaikh",
    },
};

const INSTALLMENT_AMOUNT = "₹ 22,000";

export const TIMELINE: TimelineItem[] = [
    {
        id: "cyber-1",
        programId: "cyber",
        label: "1st Installment",
        amount: "₹ 10,000",
        paid: { title: "Paid ₹10,000 on 12th May, 2026", method: "UPI · paytm@upi" },
    },
    { id: "cyber-2", programId: "cyber", label: "2nd Installment", amount: INSTALLMENT_AMOUNT, due: "Due on 10 Feb 2026" },
    { id: "ethical-3", programId: "ethical", label: "3rd Installment", amount: INSTALLMENT_AMOUNT, due: "Due on 10 March 2026" },
    { id: "cyber-3", programId: "cyber", label: "3rd Installment", amount: INSTALLMENT_AMOUNT, due: "Due on 10 March 2026" },
    { id: "cyber-4", programId: "cyber", label: "4th Installment", amount: INSTALLMENT_AMOUNT, due: "Due on 10 April 2026" },
    { id: "cyber-5", programId: "cyber", label: "5th Installment", amount: INSTALLMENT_AMOUNT, due: "Due on 10 May 2026" },
    { id: "cyber-6", programId: "cyber", label: "6th Installment", amount: INSTALLMENT_AMOUNT, due: "Due on 10 June 2026" },
];

export const TIMELINE_TABS = [
    { id: "all", label: "All" },
    { id: "cyber", label: "Cyber Security Professional" },
    { id: "ethical", label: "Ethical Hacking" },
] as const;

export const ACADEMIC_DOCUMENTS = [
    { name: "Enrollment Letter", meta: "1.2 MB · PDF" },
    { name: "Admission Receipt", meta: "890 KB · PDF" },
    { name: "Fee Agreement", meta: "2.1 MB · PDF" },
    { name: "Invoice #INV-2026", meta: "540 KB · PDF" },
    { name: "Student Contract", meta: "3.4 MB · PDF" },
] as const;

const BASE_AMOUNTS = { total: "₹ 1,20,000", pending: "₹ 1,10,000", paid: "₹ 10,000", percent: 8 } as const;
const SINGLE_PROGRAM: Program = { ...PROGRAMS.cyber, studentId: "CCN-2026-1034" };

/**
 * Preview states from the Figma file. Backend data is ignored for now, so the
 * page picks one with `?view=` (defaults to the multi-program "before due" screen).
 */
export const FEE_SCENARIOS: Record<string, FeeScenario> = {
    // LMS- Student Dashboard - My Profile - Fees Details - Before Due
    multi: {
        layout: "multi",
        programs: [PROGRAMS.cyber, PROGRAMS.ethical],
        defaultTab: "cyber",
        summary: {
            ...BASE_AMOUNTS,
            combinedLabel: "All program/Courses combined",
            title: "Cyber Security - 2nd Installment",
            dueOn: "Due on 10 February 2026",
            status: { label: "Due in 5 days", tone: "warning" },
            totalPayable: INSTALLMENT_AMOUNT,
            payAllDues: "₹ 42,000",
            note: "Pay on time to avoid ₹250/day late charges.",
        },
    },
    // LMS- Student Dashboard - My Profile - Fees Details - Due Today
    "due-today": {
        layout: "single",
        programs: [SINGLE_PROGRAM],
        defaultTab: "all",
        summary: {
            ...BASE_AMOUNTS,
            title: "2nd Installment",
            dueOn: "Due on 10 February 2026",
            status: { label: "Due Today", tone: "success" },
            totalPayable: INSTALLMENT_AMOUNT,
            payAllDues: "₹ 42,000",
            note: "Pay on time to avoid ₹250/day late charges.",
        },
    },
    // LMS- Student Dashboard - My Profile - Fees Details - After Due (Overdue View)
    overdue: {
        layout: "single",
        programs: [SINGLE_PROGRAM],
        defaultTab: "cyber",
        summary: {
            ...BASE_AMOUNTS,
            title: "2nd Installment",
            dueOn: "Due on 10 February 2026",
            status: { label: "Overdue by 3 days", tone: "error" },
            lines: [{ label: "Installment Amount", amount: INSTALLMENT_AMOUNT }],
            lateFee: "₹ 750",
            totalPayable: "₹ 22,750",
            payAllDues: "₹ 42,000",
        },
    },
    // Combined dues across programs (multiple installments overdue)
    "multi-overdue": {
        layout: "multi",
        programs: [PROGRAMS.cyber, PROGRAMS.ethical],
        defaultTab: "cyber",
        summary: {
            ...BASE_AMOUNTS,
            lines: [
                { label: "Cyber Security Professional - 2nd Installment", amount: INSTALLMENT_AMOUNT, pill: "Overdue by 3 days" },
                { label: "Ethical Hacking - 3rd Installment", amount: "₹ 12,000" },
            ],
            lateFee: "₹ 750",
            totalPayable: "₹ 22,750",
        },
    },
};

// ─── Certifications & achievements ─────────────────────────────────────────
// Image boxes are expressed relative to the 448×265 Figma card so they scale with the card width.
export const ACHIEVEMENT_STATS = [
    { value: "Cyber Explorer", label: "Your Current Title", image: "stat-title-bg.png", imageBox: { left: "-0.45%", top: "-7.92%", width: "107.37%", height: "107.55%" } },
    { value: "8/12", label: "Total Badges Earned", image: "stat-badges-bg.png", imageBox: { left: "-0.37%", top: "-7.92%", width: "100.75%", height: "114.72%" } },
    { value: "4,580 XP", label: "Total Points Earned", image: "stat-xp-bg.png", imageBox: { left: "-0.45%", top: "-7.92%", width: "115.85%", height: "107.55%" }, dim: true },
] as const;

export type BadgeState = "earned" | "current" | "locked";

export interface Badge {
    id: string;
    title: string;
    subtitle: string;
    state: BadgeState;
    /** Progress bar fill width in px (track is 110px wide). */
    progress: number;
}

export const BADGES: Badge[] = [
    { id: "b1", title: "Lab Master", subtitle: "Complete 10 labs", state: "earned", progress: 90 },
    { id: "b2", title: "Lab Master", subtitle: "2/10 labs completed", state: "current", progress: 20 },
    ...Array.from({ length: 7 }, (_, i): Badge => ({
        id: `b${i + 3}`,
        title: "Lab Master",
        subtitle: "Complete 10 labs",
        state: "locked",
        progress: 1,
    })),
];

export const XP_HISTORY = Array.from({ length: 5 }, (_, i) => ({
    id: `xp-${i}`,
    title: "Introduction to SOC",
    date: "22nd Aug, 2026",
    xp: "+150 XP",
}));

export const CERTIFICATIONS = [
    { id: "c1", name: "CCNA", detail: "Issued on May 12, 2026", unlocked: true },
    { id: "c2", name: "Ethical Hacking", detail: "Complete MCQ, Lab and Viva to unlock certificate", unlocked: false },
    { id: "c3", name: "Soft Skill", detail: "Complete MCQ and Viva to unlock certificate", unlocked: false },
    { id: "c4", name: "Ethical Hacking", detail: "Complete MCQ, Lab and Viva to unlock certificate", unlocked: false },
] as const;
