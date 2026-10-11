"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import axiosHandler from "@/lib/enhanced-axios";
import type { StandardResponse } from "./AuthContext";
import type { Benefit, Course, PackageBase } from "./ContentContext";
import type {
    Batch,
    BatchQuery,
    BatchQueryStatus,
    BatchRequest,
    BatchRequestStatus,
    BatchStudent,
    BatchStudentStatus,
} from "./BatchContext";

/* ------------------------------------------------------------------ */
/* Prisma-derived types — mirror student.prisma + erp.prisma           */
/* ------------------------------------------------------------------ */

export interface ParentDetails {
    parentId: string;
    studentId: string;
    parentName: string;
    parentEmail: string | null;
    parentCallingCode: string;
    parentPhoneNumber: string | null;
    parentRelation: string | null;
    /** Set once the parent's phone number was confirmed with an OTP. */
    isContactVerified?: boolean;
}

export interface StudentAddress {
    addressId: string;
    studentId: string;
    /** "CURRENT" / "PERMANENT" (case-insensitive), "Office", "Other" */
    addressType: string | null;
    addressLine: string | null;
    apartment?: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
    latitude: number | null;
    longitude: number | null;
    mapUrl: string | null;
}

export interface StudentDocument {
    documentId: string;
    studentId: string;
    documentName: string;
    documentUrl: string;
    /** "Education" / "Educational" (marksheets), "Academic" (enrollment letter, receipts…), "Identification", "Other" */
    documentType: string;
    /** File size in bytes, when known. */
    documentSize?: number | null;
    isVerified: boolean;
    createdAt?: string;
}

export interface StudentAdhaarData {
    adhaarId: string;
    studentId: string;
    adhaarNumber: string | null;
    adhaarName: string | null;
    adhaarGender: string | null;
    adhaarDob: string | null;
    adhaarAddress: string | null;
    adhaarFrontImageUrl: string | null;
    adhaarBackImageUrl: string | null;
    referenceData: string | null;
    isVerified: boolean;
    isManuallyAdded: boolean;
}

export interface StudentCourseAccess {
    studentId: string;
    courseId: string;
    expiresAt: string | null;
    isActive: boolean;
}

export interface StudentPackagesAccess {
    studentId: string;
    packageId: string;
    expiresAt: string | null;
    isActive: boolean;
}

/* ------------------------------------------------------------------ */
/* Content relations attached by the RM includes                       */
/* ------------------------------------------------------------------ */

export interface BenefitOnPackage {
    benefitId: string;
    packageId: string;
    Benefits: Benefit;
}

export interface PackageWithBenefits extends PackageBase {
    benefitsOnPackages: BenefitOnPackage[];
}

/** Shape from add/update package access (`include: { Packages: true }`) */
export interface StudentPackagesAccessWithPackage extends StudentPackagesAccess {
    Packages: PackageBase;
}

/** Shape from GetStudentPackageAccesses (packages include their benefits) */
export interface StudentPackagesAccessDetail extends StudentPackagesAccess {
    Packages: PackageWithBenefits;
}

export interface StudentCourseAccessWithCourse extends StudentCourseAccess {
    Courses: Course;
}

export interface StudentPaymentSchedule {
    scheduleId: string;
    purchaseId: string;
    dueDate: string;
    amount: number;
    isPaid: boolean;
    isPartialPayment: boolean;
    partialPaymentAmount: number | null;
    fineAmount: number | null;
}

export interface StudentPurchase {
    purchaseId: string;
    studentId: string;
    purchasedAt: string;
    amount: number | null;
    currentPaidAmount: number | null;
    isAllPaymentsDone: boolean;
    isEMIEnabled: boolean;
    numberOfInstallments: number | null;
    /** RM who owns this enrollment. */
    rmId?: string | null;
    /** Admission counsellor who closed the admission. */
    counsellorName?: string | null;
    studentPaymentSchedules: StudentPaymentSchedule[];
}

export interface PackageInPurchase {
    purchaseId: string;
    packageId: string;
    Packages: PackageBase;
}

export interface CourseInPurchase {
    purchaseId: string;
    courseId: string;
    Courses: Course;
}

/** Shape from the purchase endpoints, which also include the purchased items */
export interface StudentPurchaseDetail extends StudentPurchase {
    packagesInPurchases: PackageInPurchase[];
    courseInPurchases: CourseInPurchase[];
}

export interface StudentPayment {
    paymentId: string;
    studentId: string;
    purchaseId: string | null;
    amount: number;
    paymentMode: string | null;
    paymentDate: string | null;
    paymentReference: string | null;
    paymentStatus: string | null;
    transactionId: string | null;
    isVerified: boolean;
    comments: string | null;
    createdAt: string;
    updatedAt: string;
}

/** Shape returned by prisma.student.findFirst with the rm.controller includes */
export interface LMSStudentData {
    studentId: string;
    studentName: string;
    callingCode: string;
    phoneNumber: string;
    isPhoneNumberVerified?: boolean;
    dateOfBirth: string | null;
    gender: string | null;
    email: string | null;
    isEmailVerified?: boolean;
    studentRegistrationNumber: string | null;
    studentPhoto: string | null;
    studentAlternatePhoneNumber: string | null;
    whatsappCallingCode?: string;
    whatsappNumber?: string | null;
    isWhatsappNumberVerified?: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    passwordUpdatedAt?: string | null;
    branchId: string;
    onboardingRefId: string | null;
    machineCode: string | null;
    highestEducation: string | null;
    highestEducationInstitute: string | null;
    highestEducationInstituteLocation?: string | null;
    webNotificationToken: string | null;
    androidNotificationToken: string | null;
    iosNotificationToken: string | null;
    parentDetails: ParentDetails[];
    studentAddresses: StudentAddress[];
    studentDocuments: StudentDocument[];
    studentAdhaarDatas: StudentAdhaarData[];
    studentCourseAccesses: StudentCourseAccess[];
    studentPackagesAccesses: StudentPackagesAccess[];
    studentPurchases: StudentPurchase[];
    studentPayments: StudentPayment[];
}

export interface PurchaseRM {
    rmId: string;
    rmName: string;
    callingCode: string;
    phoneNumber: string;
    email: string | null;
}

/** `GET /student/profile` — the signed-in student's own record with every relation expanded */
export interface StudentProfile
    extends Omit<LMSStudentData, "studentCourseAccesses" | "studentPackagesAccesses" | "studentPurchases"> {
    branch: { branchId: string; branchName: string };
    studentCourseAccesses: StudentCourseAccessWithCourse[];
    studentPackagesAccesses: StudentPackagesAccessWithPackage[];
    studentPurchases: (StudentPurchaseDetail & { rm: PurchaseRM | null })[];
    /** Aadhaar numbers arrive masked ("XXXX XXXX 1234"). */
    studentAdhaarDatas: StudentAdhaarData[];
    /** false when the student only signs in with OTP and never set a password. */
    hasPassword: boolean;
}

/* ------------------------------------------------------------------ */
/* Profile helpers                                                     */
/* ------------------------------------------------------------------ */

const EDUCATION_DOCUMENT_TYPES = ["education", "educational", "marksheet"];

/** Education proof (marksheet / certificate) shown on the Academic Details card. */
export function isEducationDocument(doc: Pick<StudentDocument, "documentType">): boolean {
    return EDUCATION_DOCUMENT_TYPES.includes(doc.documentType.trim().toLowerCase());
}

/** Current/residential address first, then the permanent one (matched case-insensitively). */
export function findStudentAddress(addresses: StudentAddress[] | null | undefined, kind: "current" | "permanent"): StudentAddress | null {
    const list = addresses ?? [];
    const match = list.find((a) => {
        const type = (a.addressType ?? "").trim().toLowerCase();
        return kind === "current" ? type === "current" || type === "residential" : type === "permanent";
    });
    if (match) return match;
    // Untyped legacy rows: treat the first one as the current address.
    return kind === "current" ? list.find((a) => !a.addressType) ?? null : null;
}

/* ------------------------------------------------------------------ */
/* Profile completion                                                  */
/* ------------------------------------------------------------------ */

export interface ProfileCompletionCheck {
    key: string;
    label: string;
    isComplete: (profile: StudentProfile) => boolean;
}

function hasText(value: string | null | undefined): boolean {
    return typeof value === "string" && value.trim().length > 0;
}

/** Fields the student is expected to fill in; each one is worth an equal share of the score. */
export const PROFILE_COMPLETION_CHECKS: ProfileCompletionCheck[] = [
    { key: "studentName", label: "Full name", isComplete: (p) => hasText(p.studentName) },
    { key: "phoneNumber", label: "Phone number", isComplete: (p) => hasText(p.phoneNumber) },
    { key: "email", label: "Email address", isComplete: (p) => hasText(p.email) },
    { key: "dateOfBirth", label: "Date of birth", isComplete: (p) => hasText(p.dateOfBirth) },
    { key: "gender", label: "Gender", isComplete: (p) => hasText(p.gender) },
    { key: "studentPhoto", label: "Profile photo", isComplete: (p) => hasText(p.studentPhoto) },
    { key: "studentAlternatePhoneNumber", label: "Alternate phone number", isComplete: (p) => hasText(p.studentAlternatePhoneNumber) },
    { key: "highestEducation", label: "Highest education", isComplete: (p) => hasText(p.highestEducation) },
    { key: "highestEducationInstitute", label: "Education institute", isComplete: (p) => hasText(p.highestEducationInstitute) },
    {
        key: "parentDetails",
        label: "Parent / guardian details",
        isComplete: (p) => (p.parentDetails ?? []).some((d) => hasText(d.parentName) && hasText(d.parentPhoneNumber)),
    },
    {
        key: "studentAddresses",
        label: "Address",
        isComplete: (p) => (p.studentAddresses ?? []).some((a) => hasText(a.addressLine) && hasText(a.city)),
    },
    {
        key: "studentDocuments",
        label: "Documents",
        isComplete: (p) => (p.studentDocuments ?? []).length > 0,
    },
    {
        key: "studentAdhaarDatas",
        label: "Aadhaar verification",
        isComplete: (p) => (p.studentAdhaarDatas ?? []).some((a) => a.isVerified),
    },
];

export interface ProfileCompletion {
    percentage: number;
    completed: number;
    total: number;
    missing: ProfileCompletionCheck[];
}

export function getProfileCompletion(profile: StudentProfile | null): ProfileCompletion {
    const total = PROFILE_COMPLETION_CHECKS.length;
    if (!profile) return { percentage: 0, completed: 0, total, missing: PROFILE_COMPLETION_CHECKS };

    const missing = PROFILE_COMPLETION_CHECKS.filter((check) => !check.isComplete(profile));
    const completed = total - missing.length;
    return { percentage: Math.round((completed / total) * 100), completed, total, missing };
}

/* ------------------------------------------------------------------ */
/* Student batch types — mirror student.controller.ts responses        */
/* ------------------------------------------------------------------ */

export interface StudentBatchCourse {
    courseId: string;
    courseName: string;
    durationInMonths: number | null;
    noOfModules: number | null;
    isCertified: boolean;
}

export interface StudentBatchTrainer {
    trainerId: string;
    trainerName: string;
    email: string | null;
    callingCode: string;
    phoneNumber: string;
    /** Profile fields shown on the trainer profile modal; not yet returned by the API. */
    photoUrl?: string | null;
    designation?: string | null;
    experienceYears?: number | null;
    rating?: number | null;
    expertise?: string[] | null;
}

/** Batch row enriched with the course + trainers included by the student endpoints */
export interface StudentBatch extends Batch {
    course: StudentBatchCourse;
    batchTrainers: { trainer: StudentBatchTrainer }[];
}

/** The student's own latest request on a batch, as returned by `/batches/available` */
export interface MyBatchRequest {
    batchRequestId: string;
    requestStatus: BatchRequestStatus;
    modeRequested: string;
    requestReason: string | null;
    createdAt: string;
    updatedAt: string;
}

/** The student's own latest query on a batch, as returned by `/batches/available` */
export interface MyBatchQuery {
    batchQueryId: string;
    queryType: string;
    queryText: string;
    queryStatus: BatchQueryStatus;
    queryResponse: string | null;
    createdAt: string;
    updatedAt: string;
}

/** `GET /batches/available` — batch plus this student's relationship to it */
export interface AvailableBatch extends StudentBatch {
    _count: { batchStudents: number; batchSessions: number };
    isEnrolled: boolean;
    myRequest: MyBatchRequest | null;
    myQuery: MyBatchQuery | null;
}

/** `GET /batches/enrolled` and `GET /batches/completed` */
export interface StudentBatchEnrollment extends BatchStudent {
    batch: StudentBatch;
}

export interface StudentBatchProgress {
    totalSessions: number;
    completedSessions: number;
    progressPercentage: number;
}

export interface StudentBatchAttendance {
    totalSessionsHeld: number;
    attendedSessions: number;
    attendancePercentage: number;
}

export interface StudentNextSession {
    batchSessionId: string;
    sessionNumber: number;
    sessionDate: string;
    sessionTime: string;
    sessionStatus: string;
    sessionLink: string | null;
}

/** `GET /batches/enrolled` — enrollment with session progress, attendance and next session */
export interface EnrolledBatch extends StudentBatchEnrollment {
    progress: StudentBatchProgress;
    attendance: StudentBatchAttendance;
    nextSession: StudentNextSession | null;
}

/** `GET /batches/completed` — same shape as an enrolled batch */
export type CompletedBatch = EnrolledBatch;

/** `GET /batch-requests` */
export interface StudentBatchRequest extends BatchRequest {
    batch: StudentBatch;
}

/** `GET /batches/:batchId` — full batch with this student's request/query history */
export interface StudentBatchDetail extends StudentBatch {
    _count: { batchStudents: number; batchSessions: number };
    batchRequests: MyBatchRequest[];
    batchQueries: MyBatchQuery[];
    isEnrolled: boolean;
    myRequest: MyBatchRequest | null;
    myQuery: MyBatchQuery | null;
    progress: StudentBatchProgress;
    attendance: StudentBatchAttendance;
    nextSession: StudentNextSession | null;
}

/** `GET /batch-queries` */
export interface StudentBatchQuery extends BatchQuery {
    batch: StudentBatch;
}

export interface CreateStudentBatchRequestInput {
    batchId: string;
    modeRequested?: string;
    requestReason?: string;
}

export interface CreateStudentBatchQueryInput {
    batchId: string;
    queryType: string;
    queryText: string;
}

/* ------------------------------------------------------------------ */
/* Attendance types — mirror `GET /student/attendance`                 */
/* ------------------------------------------------------------------ */

/** `late` is reserved for when the API starts tracking late arrivals. */
export type AttendanceStatus = "present" | "absent" | "late";

/** One enrolled batch, used to build the attendance scope dropdown */
export interface AttendanceBatchOption {
    batchId: string;
    batchName: string;
    courseName: string;
    mode: string | null;
    classTiming: string | null;
    status: BatchStudentStatus;
    isAccessActive: boolean;
}

export interface AttendanceSummary {
    totalSessionsHeld: number;
    attendedSessions: number;
    absentSessions: number;
    attendancePercentage: number;
    currentStreak: number;
    upcomingSessions: number;
}

export interface AttendancePerBatch {
    batchId: string;
    batchName: string;
    courseName: string;
    status: BatchStudentStatus;
    totalSessionsHeld: number;
    attendedSessions: number;
    absentSessions: number;
    attendancePercentage: number;
}

export interface AttendanceMonthlyPoint {
    year: number;
    /** 0-indexed month */
    month: number;
    held: number;
    attended: number;
    percentage: number;
}

export interface AttendanceDailyPoint {
    /** YYYY-MM-DD */
    date: string;
    status: AttendanceStatus;
    batchId: string;
    batchName: string;
    sessionTime: string;
}

export interface AttendanceHistoryRecord {
    batchSessionId: string;
    batchId: string;
    batchName: string;
    courseName: string;
    trainerName: string | null;
    mode: string | null;
    sessionDate: string;
    sessionTime: string;
    sessionStartedAt: string | null;
    sessionEndedAt: string | null;
    isRescheduled: boolean;
    status: AttendanceStatus;
    markedAt: string | null;
    /** Session topic; not yet returned by the API. */
    topic?: string | null;
}

export interface StudentAttendance {
    /** `"overall"` or the batchId the stats are scoped to */
    scope: string;
    batches: AttendanceBatchOption[];
    summary: AttendanceSummary;
    perBatch: AttendancePerBatch[];
    monthly: AttendanceMonthlyPoint[];
    years: number[];
    daily: AttendanceDailyPoint[];
    history: AttendanceHistoryRecord[];
}

export type { BatchQueryStatus, BatchRequestStatus, BatchStudentStatus };

/* ------------------------------------------------------------------ */
/* Fees — mirror `GET /student/profile/fees` (student-fees.service.ts) */
/* ------------------------------------------------------------------ */

export type FeeInstallmentStatus = "paid" | "overdue" | "due_today" | "upcoming";
export type FeeProgramStatus = "active" | "new" | "completed" | "inactive";

export interface FeePaymentInfo {
    paymentId: string | null;
    amount: number;
    paidOn: string;
    mode: string | null;
    reference: string | null;
    /** Covered by the amount collected at enrollment (no separate payment record). */
    atEnrollment: boolean;
}

export interface FeeInstallment {
    scheduleId: string;
    purchaseId: string;
    programName: string;
    programShortName: string;
    installmentNo: number;
    /** "2nd Installment" */
    label: string;
    dueDate: string;
    amount: number;
    paidAmount: number;
    outstandingAmount: number;
    status: FeeInstallmentStatus;
    isPartiallyPaid: boolean;
    daysOverdue: number;
    daysUntilDue: number;
    lateFeePerDay: number;
    /** daysOverdue × lateFeePerDay */
    lateFee: number;
    /** outstandingAmount + lateFee */
    payableAmount: number;
    payment: FeePaymentInfo | null;
}

export interface FeeProgram {
    purchaseId: string;
    name: string;
    shortName: string;
    kind: "package" | "course";
    status: FeeProgramStatus;
    durationInMonths: number | null;
    courses: { courseId: string; courseName: string }[];
    benefits: string[];
    enrollmentDate: string;
    studentRegistrationNumber: string | null;
    rm: { rmId: string; name: string; callingCode: string; phoneNumber: string; email: string | null } | null;
    counsellorName: string | null;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    isEMIEnabled: boolean;
    numberOfInstallments: number;
    isAllPaymentsDone: boolean;
    installmentsPaid: number;
}

export interface FeeDueBundle {
    scheduleIds: string[];
    installmentAmount: number;
    lateFee: number;
    totalPayable: number;
}

export interface FeeSummaryData {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    percentPaid: number;
    state: "overdue" | "due" | "settled";
    overdueCount: number;
    overdueAmount: number;
    lateFee: number;
    nextDue: FeeInstallment | null;
    overdue: FeeInstallment[];
    /** What "Pay Now" collects: every overdue installment (+ late fee), otherwise the next installment. */
    payNow: FeeDueBundle | null;
    /** Everything due up to the end of the current month, overdue included. */
    dueThisMonth: FeeDueBundle & { count: number };
}

export interface FeeDocument {
    documentId: string;
    documentName: string;
    documentUrl: string;
    documentType: string;
    documentSize: number | null;
    fileExtension: string | null;
    isVerified: boolean;
    createdAt: string;
}

export interface StudentFees {
    generatedAt: string;
    timezone: string;
    lateFeePerDay: number;
    studentRegistrationNumber: string | null;
    programs: FeeProgram[];
    /** Every installment of every program, ordered by due date. */
    installments: FeeInstallment[];
    summary: FeeSummaryData;
    documents: FeeDocument[];
}

/* ------------------------------------------------------------------ */
/* Achievements — mirror `GET /student/profile/achievements`           */
/* ------------------------------------------------------------------ */

export interface AchievementBadge {
    badgeId: string;
    code: string;
    name: string;
    description: string | null;
    iconUrl: string | null;
    courseLabel: string | null;
    criteriaType: string;
    xpReward: number;
    earned: boolean;
    awardedAt: string | null;
    progressCurrent: number;
    progressTarget: number;
    progressPct: number;
    /** "2/10 labs completed" */
    progressLabel: string;
}

export interface XpHistoryEntry {
    txnId: string;
    title: string;
    source: string;
    sourceLabel: string;
    courseName: string | null;
    amount: number;
    createdAt: string;
}

export interface CertificationItem {
    courseId: string;
    courseName: string;
    name: string;
    slug: string | null;
    examId: string | null;
    unlocked: boolean;
    status: "issued" | "expired" | "revoked" | "locked";
    certificateNo: string | null;
    issuedAt: string | null;
    validUntil: string | null;
    /** "Complete MCQ, Lab and Viva to unlock certificate" */
    requirement: string;
    roundsRequired: string[];
    roundsPassed: number;
    roundsTotal: number;
}

export interface StudentAchievements {
    rank: {
        level: number;
        title: string;
        iconUrl: string | null;
        totalXp: number;
        xpToNextLevel: number | null;
        nextLevel: { level: number; title: string; minXp: number } | null;
        currentStreak: number;
    };
    badgesEarned: number;
    badgesTotal: number;
    badges: AchievementBadge[];
    xpHistory: XpHistoryEntry[];
    certifications: CertificationItem[];
}

/* ------------------------------------------------------------------ */
/* Dashboard (overview) — mirror `GET /student/dashboard`              */
/* ------------------------------------------------------------------ */

/** Session times are institute wall-clock values in UTC fields — format with `getUTC*`. */
export interface DashboardSession {
    batchSessionId: string;
    batchId: string;
    batchName: string;
    courseName: string;
    courseShortName: string;
    /** Session topic, falling back to the course name. */
    title: string;
    sessionType: string;
    sessionNumber: number;
    startAt: string;
    endAt: string | null;
    mode: string | null;
    classRoomNumber: string | null;
    sessionStatus: string;
    isRescheduled: boolean;
}

export interface DashboardTodaySession extends DashboardSession {
    isLive: boolean;
    /** Online class link; null for offline batches. */
    joinUrl: string | null;
}

export interface DashboardTask {
    assignmentId: string;
    batchId: string;
    courseName: string | null;
    courseShortName: string | null;
    title: string;
    dueDate: string;
    status: "overdue" | "pending";
    progressStatus: string;
    totalTasks: number;
    submittedTasks: number;
}

export type DashboardUpdateCategory = "alert" | "announcement" | "news" | "blog";

export type DashboardUpdateLink =
    | { kind: "fees" }
    | { kind: "batch"; batchId: string }
    | { kind: "update"; updateType: "announcement" | "news" | "blog"; slug: string };

export interface DashboardUpdate {
    id: string;
    category: DashboardUpdateCategory;
    title: string;
    description: string | null;
    date: string | null;
    createdAt: string;
    dueAt: string | null;
    link: DashboardUpdateLink | null;
}

export interface StudentDashboard {
    generatedAt: string;
    timezone: string;
    performance: {
        overall: number;
        attendance: { percentage: number; attended: number; held: number };
        courses: { completed: number; total: number; averageProgress: number };
        activity: { earnedXp: number; totalXp: number; percentage: number };
    };
    todaySchedule: DashboardTodaySession | null;
    upcomingSessions: DashboardSession[];
    playerStatus: {
        level: number;
        totalPoints: number;
        totalBadges: number;
        currentStreak: number;
        highestStreak: number;
        globalRank: number | null;
        branchRank: number | null;
        batchRank: number | null;
    };
    activeMission: {
        courseId: string;
        slug: string | null;
        courseName: string;
        courseShortName: string;
        enrollmentStatus: string;
        progress: number;
        level: { levelId: string; levelNo: number; title: string } | null;
    } | null;
    tasks: DashboardTask[];
    updates: DashboardUpdate[];
}

export interface BirthdayRewardStatus {
    isBirthday: boolean;
    year: number;
    xp: number;
    claimed: boolean;
    claimedAt: string | null;
}

export interface BirthdayRewardClaim {
    alreadyClaimed: boolean;
    xpAwarded: number;
    totalXp: number;
    rankLevel: number;
    rankUp: { from: number; to: number } | null;
    claimedAt: string | null;
}

/* ------------------------------------------------------------------ */
/* Account actions                                                     */
/* ------------------------------------------------------------------ */

export interface ChangePasswordInput {
    /** Required only when the student already has a password. */
    currentPassword?: string;
    newPassword: string;
}

export interface PhoneInput {
    callingCode: string;
    phoneNumber: string;
}

export interface ParentOtpTicket extends PhoneInput {
    otpLength: number;
    resendAfterSec: number;
    expiresInSec: number;
}

/* ------------------------------------------------------------------ */
/* Context shape                                                       */
/* ------------------------------------------------------------------ */

interface StudentContextValue {
    profile: StudentProfile | null;
    fees: StudentFees | null;
    achievements: StudentAchievements | null;
    availableBatches: AvailableBatch[];
    enrolledBatches: EnrolledBatch[];
    completedBatches: CompletedBatch[];
    batchRequests: StudentBatchRequest[];
    batchQueries: StudentBatchQuery[];
    batchDetail: StudentBatchDetail | null;
    attendance: StudentAttendance | null;
    dashboard: StudentDashboard | null;
    birthdayReward: BirthdayRewardStatus | null;

    loadingProfile: boolean;
    loadingFees: boolean;
    loadingAchievements: boolean;
    loadingAvailableBatches: boolean;
    loadingEnrolledBatches: boolean;
    loadingCompletedBatches: boolean;
    loadingBatchRequests: boolean;
    loadingBatchQueries: boolean;
    loadingBatchDetail: boolean;
    loadingAttendance: boolean;
    loadingDashboard: boolean;
    loadingBirthdayReward: boolean;
    claimingBirthdayReward: boolean;

    getProfile: () => Promise<StandardResponse<StudentProfile>>;
    getFees: () => Promise<StandardResponse<StudentFees>>;
    getAchievements: () => Promise<StandardResponse<StudentAchievements>>;
    changePassword: (data: ChangePasswordInput) => Promise<StandardResponse<{ hasPassword: boolean; passwordUpdatedAt: string }>>;
    sendParentPhoneOtp: (parentId: string, phone?: PhoneInput) => Promise<StandardResponse<ParentOtpTicket>>;
    verifyParentPhoneOtp: (parentId: string, otp: string, phone?: PhoneInput) => Promise<StandardResponse<ParentDetails>>;
    getAvailableBatches: () => Promise<StandardResponse<AvailableBatch[]>>;
    getEnrolledBatches: () => Promise<StandardResponse<EnrolledBatch[]>>;
    getCompletedBatches: () => Promise<StandardResponse<CompletedBatch[]>>;
    getBatchDetails: (batchId: string) => Promise<StandardResponse<StudentBatchDetail>>;
    getBatchRequests: () => Promise<StandardResponse<StudentBatchRequest[]>>;
    getBatchQueries: () => Promise<StandardResponse<StudentBatchQuery[]>>;
    createBatchRequest: (data: CreateStudentBatchRequestInput) => Promise<StandardResponse<BatchRequest>>;
    createBatchQuery: (data: CreateStudentBatchQueryInput) => Promise<StandardResponse<BatchQuery>>;
    getAttendance: (batchId?: string) => Promise<StandardResponse<StudentAttendance>>;
    getDashboard: () => Promise<StandardResponse<StudentDashboard>>;
    getBirthdayReward: () => Promise<StandardResponse<BirthdayRewardStatus>>;
    /** Claims today's birthday XP and refreshes the dashboard's player points. */
    claimBirthdayReward: () => Promise<StandardResponse<BirthdayRewardClaim>>;
}

const StudentContext = createContext<StudentContextValue | null>(null);

const BASE = "/api/v1/student";

function toMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}

export function StudentProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [fees, setFees] = useState<StudentFees | null>(null);
    const [achievements, setAchievements] = useState<StudentAchievements | null>(null);
    const [availableBatches, setAvailableBatches] = useState<AvailableBatch[]>([]);
    const [enrolledBatches, setEnrolledBatches] = useState<EnrolledBatch[]>([]);
    const [completedBatches, setCompletedBatches] = useState<CompletedBatch[]>([]);
    const [batchRequests, setBatchRequests] = useState<StudentBatchRequest[]>([]);
    const [batchQueries, setBatchQueries] = useState<StudentBatchQuery[]>([]);
    const [batchDetail, setBatchDetail] = useState<StudentBatchDetail | null>(null);
    const [attendance, setAttendance] = useState<StudentAttendance | null>(null);
    const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
    const [birthdayReward, setBirthdayReward] = useState<BirthdayRewardStatus | null>(null);

    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingFees, setLoadingFees] = useState(false);
    const [loadingAchievements, setLoadingAchievements] = useState(false);
    const [loadingAvailableBatches, setLoadingAvailableBatches] = useState(false);
    const [loadingEnrolledBatches, setLoadingEnrolledBatches] = useState(false);
    const [loadingCompletedBatches, setLoadingCompletedBatches] = useState(false);
    const [loadingBatchRequests, setLoadingBatchRequests] = useState(false);
    const [loadingBatchQueries, setLoadingBatchQueries] = useState(false);
    const [loadingBatchDetail, setLoadingBatchDetail] = useState(false);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [loadingDashboard, setLoadingDashboard] = useState(false);
    const [loadingBirthdayReward, setLoadingBirthdayReward] = useState(false);
    const [claimingBirthdayReward, setClaimingBirthdayReward] = useState(false);

    const getProfile = useCallback(async (): Promise<StandardResponse<StudentProfile>> => {
        setLoadingProfile(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/profile`, method: "GET" }) as StudentProfile;
            setProfile(res);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch profile"), data: null };
        } finally {
            setLoadingProfile(false);
        }
    }, []);

    const getFees = useCallback(async (): Promise<StandardResponse<StudentFees>> => {
        setLoadingFees(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/profile/fees`, method: "GET" }) as StudentFees;
            setFees(res);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch fee details"), data: null };
        } finally {
            setLoadingFees(false);
        }
    }, []);

    const getAchievements = useCallback(async (): Promise<StandardResponse<StudentAchievements>> => {
        setLoadingAchievements(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/profile/achievements`, method: "GET" }) as StudentAchievements;
            setAchievements(res);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch achievements"), data: null };
        } finally {
            setLoadingAchievements(false);
        }
    }, []);

    const getDashboard = useCallback(async (): Promise<StandardResponse<StudentDashboard>> => {
        setLoadingDashboard(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/dashboard`, method: "GET" }) as StudentDashboard;
            setDashboard(res);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch your dashboard"), data: null };
        } finally {
            setLoadingDashboard(false);
        }
    }, []);

    const getBirthdayReward = useCallback(async (): Promise<StandardResponse<BirthdayRewardStatus>> => {
        setLoadingBirthdayReward(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/rewards/birthday`, method: "GET" }) as BirthdayRewardStatus;
            setBirthdayReward(res);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch birthday reward"), data: null };
        } finally {
            setLoadingBirthdayReward(false);
        }
    }, []);

    const claimBirthdayReward = useCallback(async (): Promise<StandardResponse<BirthdayRewardClaim>> => {
        setClaimingBirthdayReward(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/rewards/birthday/claim`, method: "POST" }) as BirthdayRewardClaim;
            setBirthdayReward((prev) => prev && { ...prev, claimed: true, claimedAt: res.claimedAt ?? prev.claimedAt });
            setDashboard((prev) => prev && {
                ...prev,
                playerStatus: { ...prev.playerStatus, totalPoints: res.totalXp, level: res.rankLevel },
            });
            return {
                success: true,
                message: res.alreadyClaimed ? "Birthday reward already claimed" : `+${res.xpAwarded} XP added to your account`,
                data: res,
            };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to claim birthday reward"), data: null };
        } finally {
            setClaimingBirthdayReward(false);
        }
    }, []);

    const changePassword = useCallback(async (
        data: ChangePasswordInput
    ): Promise<StandardResponse<{ hasPassword: boolean; passwordUpdatedAt: string }>> => {
        try {
            const res = await axiosHandler({
                path: `${BASE}/profile/change-password`,
                method: "POST",
                body: data,
            }) as { hasPassword: boolean; passwordUpdatedAt: string };
            setProfile((prev) => (prev ? { ...prev, hasPassword: true, passwordUpdatedAt: res.passwordUpdatedAt } : prev));
            return { success: true, message: data.currentPassword ? "Password changed successfully" : "Password set successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to change password"), data: null };
        }
    }, []);

    const sendParentPhoneOtp = useCallback(async (
        parentId: string,
        phone?: PhoneInput
    ): Promise<StandardResponse<ParentOtpTicket>> => {
        try {
            const res = await axiosHandler({
                path: `${BASE}/profile/parents/${parentId}/send-otp`,
                method: "POST",
                body: phone ?? {},
            }) as ParentOtpTicket;
            return { success: true, message: "Verification code sent", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to send verification code"), data: null };
        }
    }, []);

    const verifyParentPhoneOtp = useCallback(async (
        parentId: string,
        otp: string,
        phone?: PhoneInput
    ): Promise<StandardResponse<ParentDetails>> => {
        try {
            const res = await axiosHandler({
                path: `${BASE}/profile/parents/${parentId}/verify-otp`,
                method: "POST",
                body: { otp, ...(phone ?? {}) },
            }) as ParentDetails;
            setProfile((prev) => (prev
                ? { ...prev, parentDetails: prev.parentDetails.map((p) => (p.parentId === parentId ? { ...p, ...res } : p)) }
                : prev));
            return { success: true, message: "Parent phone number verified", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to verify the code"), data: null };
        }
    }, []);

    const getAvailableBatches = useCallback(async (): Promise<StandardResponse<AvailableBatch[]>> => {
        setLoadingAvailableBatches(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/batches/available`, method: "GET" }) as AvailableBatch[];
            setAvailableBatches(res);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch available batches"), data: null };
        } finally {
            setLoadingAvailableBatches(false);
        }
    }, []);

    const getEnrolledBatches = useCallback(async (): Promise<StandardResponse<EnrolledBatch[]>> => {
        setLoadingEnrolledBatches(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/batches/enrolled`, method: "GET" }) as EnrolledBatch[];
            setEnrolledBatches(res);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch enrolled batches"), data: null };
        } finally {
            setLoadingEnrolledBatches(false);
        }
    }, []);

    const getCompletedBatches = useCallback(async (): Promise<StandardResponse<CompletedBatch[]>> => {
        setLoadingCompletedBatches(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/batches/completed`, method: "GET" }) as CompletedBatch[];
            setCompletedBatches(res);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch completed batches"), data: null };
        } finally {
            setLoadingCompletedBatches(false);
        }
    }, []);

    const getBatchDetails = useCallback(async (batchId: string): Promise<StandardResponse<StudentBatchDetail>> => {
        setLoadingBatchDetail(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/batches/${batchId}`, method: "GET" }) as StudentBatchDetail;
            setBatchDetail(res);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch batch details"), data: null };
        } finally {
            setLoadingBatchDetail(false);
        }
    }, []);

    const getBatchRequests = useCallback(async (): Promise<StandardResponse<StudentBatchRequest[]>> => {
        setLoadingBatchRequests(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/batch-requests`, method: "GET" }) as StudentBatchRequest[];
            setBatchRequests(res);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch batch requests"), data: null };
        } finally {
            setLoadingBatchRequests(false);
        }
    }, []);

    const getBatchQueries = useCallback(async (): Promise<StandardResponse<StudentBatchQuery[]>> => {
        setLoadingBatchQueries(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/batch-queries`, method: "GET" }) as StudentBatchQuery[];
            setBatchQueries(res);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch batch queries"), data: null };
        } finally {
            setLoadingBatchQueries(false);
        }
    }, []);

    const createBatchRequest = useCallback(async (
        data: CreateStudentBatchRequestInput
    ): Promise<StandardResponse<BatchRequest>> => {
        try {
            const res = await axiosHandler({
                path: `${BASE}/batch-requests/create`,
                method: "POST",
                body: data,
            }) as BatchRequest;
            setAvailableBatches((prev) => prev.map((batch) => (
                batch.batchId === data.batchId ? { ...batch, myRequest: res } : batch
            )));
            return { success: true, message: "Batch request created successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to create batch request"), data: null };
        }
    }, []);

    const createBatchQuery = useCallback(async (
        data: CreateStudentBatchQueryInput
    ): Promise<StandardResponse<BatchQuery>> => {
        try {
            const res = await axiosHandler({
                path: `${BASE}/batch-queries/create`,
                method: "POST",
                body: data,
            }) as BatchQuery;
            setAvailableBatches((prev) => prev.map((batch) => (
                batch.batchId === data.batchId ? { ...batch, myQuery: res } : batch
            )));
            return { success: true, message: "Batch query created successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to create batch query"), data: null };
        }
    }, []);

    const getAttendance = useCallback(async (batchId?: string): Promise<StandardResponse<StudentAttendance>> => {
        setLoadingAttendance(true);
        try {
            const query = batchId && batchId !== "overall" ? `?batchId=${encodeURIComponent(batchId)}` : "";
            const res = await axiosHandler({ path: `${BASE}/attendance${query}`, method: "GET" }) as StudentAttendance;
            setAttendance(res);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch attendance"), data: null };
        } finally {
            setLoadingAttendance(false);
        }
    }, []);

    const value = useMemo<StudentContextValue>(() => ({
        profile, fees, achievements,
        availableBatches, enrolledBatches, completedBatches, batchRequests, batchQueries, batchDetail, attendance,
        dashboard, birthdayReward,
        loadingProfile, loadingFees, loadingAchievements,
        loadingAvailableBatches, loadingEnrolledBatches, loadingCompletedBatches,
        loadingBatchRequests, loadingBatchQueries, loadingBatchDetail, loadingAttendance,
        loadingDashboard, loadingBirthdayReward, claimingBirthdayReward,
        getProfile, getFees, getAchievements, changePassword, sendParentPhoneOtp, verifyParentPhoneOtp,
        getAvailableBatches, getEnrolledBatches, getCompletedBatches, getBatchDetails,
        getBatchRequests, getBatchQueries, createBatchRequest, createBatchQuery, getAttendance,
        getDashboard, getBirthdayReward, claimBirthdayReward,
    }), [
        profile, fees, achievements,
        availableBatches, enrolledBatches, completedBatches, batchRequests, batchQueries, batchDetail, attendance,
        dashboard, birthdayReward,
        loadingProfile, loadingFees, loadingAchievements,
        loadingAvailableBatches, loadingEnrolledBatches, loadingCompletedBatches,
        loadingBatchRequests, loadingBatchQueries, loadingBatchDetail, loadingAttendance,
        loadingDashboard, loadingBirthdayReward, claimingBirthdayReward,
        getProfile, getFees, getAchievements, changePassword, sendParentPhoneOtp, verifyParentPhoneOtp,
        getAvailableBatches, getEnrolledBatches, getCompletedBatches, getBatchDetails,
        getBatchRequests, getBatchQueries, createBatchRequest, createBatchQuery, getAttendance,
        getDashboard, getBirthdayReward, claimBirthdayReward,
    ]);

    return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

export function useStudent(): StudentContextValue {
    const ctx = useContext(StudentContext);
    if (!ctx) throw new Error("useStudent must be used inside <StudentProvider>");
    return ctx;
}
