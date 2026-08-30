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
}

export interface StudentAddress {
    addressId: string;
    studentId: string;
    addressType: string | null;
    addressLine: string | null;
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
    documentType: string;
    isVerified: boolean;
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
    dateOfBirth: string | null;
    gender: string | null;
    email: string | null;
    studentRegistrationNumber: string | null;
    studentPhoto: string | null;
    studentAlternatePhoneNumber: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    branchId: string;
    onboardingRefId: string | null;
    machineCode: string | null;
    highestEducation: string | null;
    highestEducationInstitute: string | null;
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

/** `GET /student/profile` — the signed-in student's own record with every relation expanded */
export interface StudentProfile
    extends Omit<LMSStudentData, "studentCourseAccesses" | "studentPackagesAccesses" | "studentPurchases"> {
    branch: { branchId: string; branchName: string };
    studentCourseAccesses: StudentCourseAccessWithCourse[];
    studentPackagesAccesses: StudentPackagesAccessWithPackage[];
    studentPurchases: StudentPurchaseDetail[];
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

export type AttendanceStatus = "present" | "absent";

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
/* Context shape                                                       */
/* ------------------------------------------------------------------ */

interface StudentContextValue {
    profile: StudentProfile | null;
    availableBatches: AvailableBatch[];
    enrolledBatches: EnrolledBatch[];
    completedBatches: CompletedBatch[];
    batchRequests: StudentBatchRequest[];
    batchQueries: StudentBatchQuery[];
    batchDetail: StudentBatchDetail | null;
    attendance: StudentAttendance | null;

    loadingProfile: boolean;
    loadingAvailableBatches: boolean;
    loadingEnrolledBatches: boolean;
    loadingCompletedBatches: boolean;
    loadingBatchRequests: boolean;
    loadingBatchQueries: boolean;
    loadingBatchDetail: boolean;
    loadingAttendance: boolean;

    getProfile: () => Promise<StandardResponse<StudentProfile>>;
    getAvailableBatches: () => Promise<StandardResponse<AvailableBatch[]>>;
    getEnrolledBatches: () => Promise<StandardResponse<EnrolledBatch[]>>;
    getCompletedBatches: () => Promise<StandardResponse<CompletedBatch[]>>;
    getBatchDetails: (batchId: string) => Promise<StandardResponse<StudentBatchDetail>>;
    getBatchRequests: () => Promise<StandardResponse<StudentBatchRequest[]>>;
    getBatchQueries: () => Promise<StandardResponse<StudentBatchQuery[]>>;
    createBatchRequest: (data: CreateStudentBatchRequestInput) => Promise<StandardResponse<BatchRequest>>;
    createBatchQuery: (data: CreateStudentBatchQueryInput) => Promise<StandardResponse<BatchQuery>>;
    getAttendance: (batchId?: string) => Promise<StandardResponse<StudentAttendance>>;
}

const StudentContext = createContext<StudentContextValue | null>(null);

const BASE = "/api/v1/student";

function toMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}

export function StudentProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [availableBatches, setAvailableBatches] = useState<AvailableBatch[]>([]);
    const [enrolledBatches, setEnrolledBatches] = useState<EnrolledBatch[]>([]);
    const [completedBatches, setCompletedBatches] = useState<CompletedBatch[]>([]);
    const [batchRequests, setBatchRequests] = useState<StudentBatchRequest[]>([]);
    const [batchQueries, setBatchQueries] = useState<StudentBatchQuery[]>([]);
    const [batchDetail, setBatchDetail] = useState<StudentBatchDetail | null>(null);
    const [attendance, setAttendance] = useState<StudentAttendance | null>(null);

    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingAvailableBatches, setLoadingAvailableBatches] = useState(false);
    const [loadingEnrolledBatches, setLoadingEnrolledBatches] = useState(false);
    const [loadingCompletedBatches, setLoadingCompletedBatches] = useState(false);
    const [loadingBatchRequests, setLoadingBatchRequests] = useState(false);
    const [loadingBatchQueries, setLoadingBatchQueries] = useState(false);
    const [loadingBatchDetail, setLoadingBatchDetail] = useState(false);
    const [loadingAttendance, setLoadingAttendance] = useState(false);

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
        profile,
        availableBatches, enrolledBatches, completedBatches, batchRequests, batchQueries, batchDetail, attendance,
        loadingProfile,
        loadingAvailableBatches, loadingEnrolledBatches, loadingCompletedBatches,
        loadingBatchRequests, loadingBatchQueries, loadingBatchDetail, loadingAttendance,
        getProfile,
        getAvailableBatches, getEnrolledBatches, getCompletedBatches, getBatchDetails,
        getBatchRequests, getBatchQueries, createBatchRequest, createBatchQuery, getAttendance,
    }), [
        profile,
        availableBatches, enrolledBatches, completedBatches, batchRequests, batchQueries, batchDetail, attendance,
        loadingProfile,
        loadingAvailableBatches, loadingEnrolledBatches, loadingCompletedBatches,
        loadingBatchRequests, loadingBatchQueries, loadingBatchDetail, loadingAttendance,
        getProfile,
        getAvailableBatches, getEnrolledBatches, getCompletedBatches, getBatchDetails,
        getBatchRequests, getBatchQueries, createBatchRequest, createBatchQuery, getAttendance,
    ]);

    return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

export function useStudent(): StudentContextValue {
    const ctx = useContext(StudentContext);
    if (!ctx) throw new Error("useStudent must be used inside <StudentProvider>");
    return ctx;
}
