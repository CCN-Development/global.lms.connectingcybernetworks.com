"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import axiosHandler from "@/lib/enhanced-axios";
import { StandardResponse } from "./AuthContext";

/* ------------------------------------------------------------------ */
/* Entity types (mirroring batch.prisma / batch.controller)            */
/* ------------------------------------------------------------------ */

export type SessionStatus = "scheduled" | "ongoing" | "completed" | "cancelled" | "rescheduled";
export type BatchStudentStatus = "active" | "completed" | "dropped" | "failed";
export type BatchRequestStatus = "pending" | "approved" | "rejected";
export type BatchQueryStatus = "pending" | "resolved" | "closed";

export interface Trainer {
    trainerId: string;
    trainerName: string;
    email: string | null;
    callingCode: string;
    phoneNumber: string;
    branchId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export type BatchTrainerSummary = Pick<
    Trainer,
    "trainerId" | "trainerName" | "email" | "callingCode" | "phoneNumber" | "isActive"
>;

export interface StudentSummary {
    studentId: string;
    studentName: string;
    email: string | null;
    callingCode: string;
    phoneNumber: string;
    studentPhoto: string | null;
    studentRegistrationNumber: string | null;
    isActive: boolean;
    isDropped: boolean;
}

export interface BatchCourseRef {
    courseId: string;
    courseName: string;
    durationInMonths: number | null;
    noOfModules?: number | null;
}

export interface BatchCounts {
    batchTrainers: number;
    batchRequests: number;
    batchStudents: number;
    batchQueries: number;
    batchSessions: number;
    batchAssignments: number;
}

export interface Batch {
    batchId: string;
    batchName: string;
    batchDescription: string | null;
    batchStartDate: string;
    batchEndDate: string;
    createdAt: string;
    updatedAt: string;
    mode: string | null;
    isActive: boolean;
    classRoomNumber: string | null;
    classTiming: string | null;
    numberOfHoursPerClass: number | null;
    classStartTime: string | null;
    classEndTime: string | null;
    totalSeats: number | null;
    availableSeats: number | null;
    courseId: string;
    batchDays: string[];
    branchId: string;
    batchLink: string | null;
}

export interface BatchListItem extends Batch {
    course: BatchCourseRef;
    batchTrainers: { trainer: Pick<Trainer, "trainerId" | "trainerName" | "phoneNumber"> }[];
    _count: BatchCounts;
}

export interface BatchDetail extends Batch {
    course: BatchCourseRef;
    batchTrainers: { trainer: Omit<BatchTrainerSummary, "isActive"> }[];
    _count: BatchCounts;
}

export interface BatchSession {
    batchSessionId: string;
    batchId: string;
    sessionDate: string;
    sessionTime: string;
    isSessionCompleted: boolean;
    sessionLink: string | null;
    isRescheduled: boolean;
    rescheduledDate: string | null;
    rescheduledTime: string | null;
    sessionStatus: SessionStatus;
    sessionStartedAt: string | null;
    sessionEndedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface BatchSessionListItem extends BatchSession {
    sessionNumber: number;
    _count: { sessionAttendances: number };
}

export interface BatchStudent {
    batchStudentId: string;
    batchId: string;
    studentId: string;
    isAccessActive: boolean;
    status: BatchStudentStatus;
    createdAt: string;
    updatedAt: string;
}

export interface BatchStudentAttendance {
    totalSessionsHeld: number;
    attendedSessions: number;
    attendancePercentage: number;
}

export interface BatchStudentListItem extends BatchStudent {
    student: StudentSummary;
    attendance: BatchStudentAttendance;
}

export interface DuePaymentSchedule {
    scheduleId: string;
    purchaseId: string;
    dueDate: string;
    amount: number;
    remainingAmount: number;
    isOverdue: boolean;
    isPartialPayment: boolean;
    partialPaymentAmount: number | null;
}

export interface DuePayments {
    hasDues: boolean;
    totalPendingAmount: number;
    overdueAmount: number;
    overdueCount: number;
    nextDueDate: string | null;
    schedules: DuePaymentSchedule[];
}

export interface BatchRequest {
    batchRequestId: string;
    studentId: string;
    batchId: string;
    modeRequested: string;
    requestStatus: BatchRequestStatus;
    requestReason: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface BatchRequestListItem extends BatchRequest {
    student: StudentSummary;
    duePayments: DuePayments;
}

export interface BatchQuery {
    batchQueryId: string;
    batchId: string;
    studentId: string;
    queryType: string;
    queryText: string;
    queryStatus: BatchQueryStatus;
    queryResponse: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface BatchQueryListItem extends BatchQuery {
    student: StudentSummary;
}

/* ------------------------------------------------------------------ */
/* Input / filter types                                                */
/* ------------------------------------------------------------------ */

export interface BatchListQuery {
    courseId?: string;
    mode?: string;
    isActive?: boolean;
    search?: string;
}

export interface CreateBatchInput {
    batchName: string;
    courseId: string;
    batchStartDate: string;
    batchEndDate: string;
    batchDays: string[];
    trainerIds: string[];
    batchDescription?: string;
    mode?: string;
    classRoomNumber?: string;
    classTiming?: string;
    numberOfHoursPerClass?: number;
    /** "HH:mm" or ISO date-time */
    classStartTime?: string;
    /** "HH:mm" or ISO date-time */
    classEndTime?: string;
    totalSeats?: number | null;
    batchLink?: string;
}

export type UpdateBatchInput = Partial<Omit<CreateBatchInput, "trainerIds">> & {
    isActive?: boolean;
};

export interface SessionListQuery {
    status?: SessionStatus;
    from?: string;
    to?: string;
}

export interface AddBatchSessionInput {
    sessionDate: string;
    /** "HH:mm" or ISO date-time, falls back to the batch class start time */
    sessionTime?: string;
    sessionLink?: string;
}

export interface QueryListQuery {
    status?: BatchQueryStatus;
    queryType?: string;
}

export interface CreateBatchQueryInput {
    queryType: string;
    queryText: string;
}

export interface CreateBatchRequestInput {
    modeRequested?: string;
    requestReason?: string;
}

export interface ResolveBatchQueryInput {
    queryResponse?: string;
    queryStatus?: BatchQueryStatus;
}

/* ------------------------------------------------------------------ */
/* Response payload types                                              */
/* ------------------------------------------------------------------ */

export interface BatchDetailResult {
    batch: BatchDetail;
    sessionStats: Partial<Record<SessionStatus, number>>;
}

export interface CreateBatchResult {
    batch: Batch;
    totalSessionsCreated: number;
}

export interface UpdateBatchResult {
    batch: Batch;
    sessionsRegenerated: number;
}

export interface ApproveBatchRequestResult {
    request: BatchRequest;
    batchStudent: BatchStudent;
}

/* ------------------------------------------------------------------ */
/* Context shape                                                       */
/* ------------------------------------------------------------------ */

interface BatchContextValue {
    batches: BatchListItem[];
    batchDetail: BatchDetail | null;
    sessionStats: Partial<Record<SessionStatus, number>>;
    branchTrainers: Trainer[];
    batchTrainers: BatchTrainerSummary[];
    batchStudents: BatchStudentListItem[];
    batchSessions: BatchSessionListItem[];
    batchRequests: BatchRequestListItem[];
    batchQueries: BatchQueryListItem[];

    loadingBatches: boolean;
    loadingBatchDetail: boolean;
    loadingBranchTrainers: boolean;
    loadingBatchTrainers: boolean;
    loadingBatchStudents: boolean;
    loadingBatchSessions: boolean;
    loadingBatchRequests: boolean;
    loadingBatchQueries: boolean;

    getBranchTrainers: () => Promise<StandardResponse<Trainer[]>>;
    getBatches: (query?: BatchListQuery) => Promise<StandardResponse<BatchListItem[]>>;
    getBatchById: (batchId: string) => Promise<StandardResponse<BatchDetailResult>>;
    createBatch: (data: CreateBatchInput) => Promise<StandardResponse<CreateBatchResult>>;
    updateBatch: (batchId: string, data: UpdateBatchInput) => Promise<StandardResponse<UpdateBatchResult>>;
    deleteBatch: (batchId: string) => Promise<StandardResponse<null>>;

    getBatchTrainers: (batchId: string) => Promise<StandardResponse<BatchTrainerSummary[]>>;
    addBatchTrainers: (batchId: string, trainerIds: string[]) => Promise<StandardResponse<{ addedCount: number }>>;
    removeBatchTrainer: (batchId: string, trainerId: string) => Promise<StandardResponse<null>>;

    getBatchStudents: (batchId: string, status?: BatchStudentStatus) => Promise<StandardResponse<BatchStudentListItem[]>>;
    addBatchStudent: (batchId: string, studentId: string) => Promise<StandardResponse<BatchStudent>>;
    removeBatchStudent: (
        batchId: string,
        studentId: string,
        status?: Exclude<BatchStudentStatus, "active">
    ) => Promise<StandardResponse<null>>;

    getBatchSessions: (batchId: string, query?: SessionListQuery) => Promise<StandardResponse<BatchSessionListItem[]>>;
    addBatchSession: (batchId: string, data: AddBatchSessionInput) => Promise<StandardResponse<BatchSession>>;
    removeBatchSession: (batchId: string, sessionId: string) => Promise<StandardResponse<null>>;

    getBatchRequests: (batchId: string, status?: BatchRequestStatus) => Promise<StandardResponse<BatchRequestListItem[]>>;
    approveBatchRequest: (batchId: string, requestId: string, reason?: string) => Promise<StandardResponse<ApproveBatchRequestResult>>;
    rejectBatchRequest: (batchId: string, requestId: string, reason?: string) => Promise<StandardResponse<BatchRequest>>;

    getBatchQueries: (batchId: string, query?: QueryListQuery) => Promise<StandardResponse<BatchQueryListItem[]>>;
    resolveBatchQuery: (batchId: string, queryId: string, data: ResolveBatchQueryInput) => Promise<StandardResponse<BatchQuery>>;

    createBatchQuery: (batchId: string, data: CreateBatchQueryInput) => Promise<StandardResponse<BatchQuery>>;
    createBatchRequest: (batchId: string, data?: CreateBatchRequestInput) => Promise<StandardResponse<BatchRequest>>;
}

const BatchContext = createContext<BatchContextValue | null>(null);

const BASE = "/api/v1/batch";

function toMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}

export function BatchProvider({ children }: { children: ReactNode }) {
    const [batches, setBatches] = useState<BatchListItem[]>([]);
    const [batchDetail, setBatchDetail] = useState<BatchDetail | null>(null);
    const [sessionStats, setSessionStats] = useState<Partial<Record<SessionStatus, number>>>({});
    const [branchTrainers, setBranchTrainers] = useState<Trainer[]>([]);
    const [batchTrainers, setBatchTrainers] = useState<BatchTrainerSummary[]>([]);
    const [batchStudents, setBatchStudents] = useState<BatchStudentListItem[]>([]);
    const [batchSessions, setBatchSessions] = useState<BatchSessionListItem[]>([]);
    const [batchRequests, setBatchRequests] = useState<BatchRequestListItem[]>([]);
    const [batchQueries, setBatchQueries] = useState<BatchQueryListItem[]>([]);

    const [loadingBatches, setLoadingBatches] = useState(false);
    const [loadingBatchDetail, setLoadingBatchDetail] = useState(false);
    const [loadingBranchTrainers, setLoadingBranchTrainers] = useState(false);
    const [loadingBatchTrainers, setLoadingBatchTrainers] = useState(false);
    const [loadingBatchStudents, setLoadingBatchStudents] = useState(false);
    const [loadingBatchSessions, setLoadingBatchSessions] = useState(false);
    const [loadingBatchRequests, setLoadingBatchRequests] = useState(false);
    const [loadingBatchQueries, setLoadingBatchQueries] = useState(false);

    /* ---------------- batch crud ---------------- */

    const getBranchTrainers = useCallback(async (): Promise<StandardResponse<Trainer[]>> => {
        setLoadingBranchTrainers(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/get-branch-trainers`, method: "GET" }) as { trainers: Trainer[] };
            setBranchTrainers(res.trainers);
            return { success: true, message: null, data: res.trainers };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch branch trainers"), data: null };
        } finally {
            setLoadingBranchTrainers(false);
        }
    }, []);

    const getBatches = useCallback(async (query?: BatchListQuery): Promise<StandardResponse<BatchListItem[]>> => {
        setLoadingBatches(true);
        try {
            const res = await axiosHandler({
                path: `${BASE}/get-batches`,
                method: "GET",
                params: query,
            }) as { batches: BatchListItem[] };
            setBatches(res.batches);
            return { success: true, message: null, data: res.batches };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch batches"), data: null };
        } finally {
            setLoadingBatches(false);
        }
    }, []);

    const getBatchById = useCallback(async (batchId: string): Promise<StandardResponse<BatchDetailResult>> => {
        setLoadingBatchDetail(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/get-batch/${batchId}`, method: "GET" }) as BatchDetailResult;
            setBatchDetail(res.batch);
            setSessionStats(res.sessionStats ?? {});
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch batch"), data: null };
        } finally {
            setLoadingBatchDetail(false);
        }
    }, []);

    const createBatch = useCallback(async (data: CreateBatchInput): Promise<StandardResponse<CreateBatchResult>> => {
        try {
            const res = await axiosHandler({ path: `${BASE}/create-batch`, method: "POST", body: data }) as CreateBatchResult;
            return { success: true, message: "Batch created successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to create batch"), data: null };
        }
    }, []);

    const updateBatch = useCallback(async (batchId: string, data: UpdateBatchInput): Promise<StandardResponse<UpdateBatchResult>> => {
        try {
            const res = await axiosHandler({ path: `${BASE}/update-batch/${batchId}`, method: "PUT", body: data }) as UpdateBatchResult;
            return { success: true, message: "Batch updated successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to update batch"), data: null };
        }
    }, []);

    const deleteBatch = useCallback(async (batchId: string): Promise<StandardResponse<null>> => {
        try {
            await axiosHandler({ path: `${BASE}/delete-batch/${batchId}`, method: "DELETE" });
            setBatches((prev) => prev.filter((batch) => batch.batchId !== batchId));
            return { success: true, message: "Batch deleted successfully", data: null };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to delete batch"), data: null };
        }
    }, []);

    /* ---------------- trainers ---------------- */

    const getBatchTrainers = useCallback(async (batchId: string): Promise<StandardResponse<BatchTrainerSummary[]>> => {
        setLoadingBatchTrainers(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/${batchId}/trainers`, method: "GET" }) as { trainers: BatchTrainerSummary[] };
            setBatchTrainers(res.trainers);
            return { success: true, message: null, data: res.trainers };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch batch trainers"), data: null };
        } finally {
            setLoadingBatchTrainers(false);
        }
    }, []);

    const addBatchTrainers = useCallback(async (batchId: string, trainerIds: string[]): Promise<StandardResponse<{ addedCount: number }>> => {
        try {
            const res = await axiosHandler({
                path: `${BASE}/${batchId}/trainers`,
                method: "POST",
                body: { trainerIds },
            }) as { addedCount: number };
            return { success: true, message: "Batch trainer added successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to add batch trainer"), data: null };
        }
    }, []);

    const removeBatchTrainer = useCallback(async (batchId: string, trainerId: string): Promise<StandardResponse<null>> => {
        try {
            await axiosHandler({ path: `${BASE}/${batchId}/trainers/${trainerId}`, method: "DELETE" });
            setBatchTrainers((prev) => prev.filter((trainer) => trainer.trainerId !== trainerId));
            return { success: true, message: "Batch trainer removed successfully", data: null };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to remove batch trainer"), data: null };
        }
    }, []);

    /* ---------------- students ---------------- */

    const getBatchStudents = useCallback(async (
        batchId: string,
        status?: BatchStudentStatus
    ): Promise<StandardResponse<BatchStudentListItem[]>> => {
        setLoadingBatchStudents(true);
        try {
            const res = await axiosHandler({
                path: `${BASE}/${batchId}/students`,
                method: "GET",
                params: status ? { status } : undefined,
            }) as { students: BatchStudentListItem[] };
            setBatchStudents(res.students);
            return { success: true, message: null, data: res.students };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch batch students"), data: null };
        } finally {
            setLoadingBatchStudents(false);
        }
    }, []);

    const addBatchStudent = useCallback(async (batchId: string, studentId: string): Promise<StandardResponse<BatchStudent>> => {
        try {
            const res = await axiosHandler({
                path: `${BASE}/${batchId}/students`,
                method: "POST",
                body: { studentId },
            }) as { batchStudent: BatchStudent };
            return { success: true, message: "Student added to batch successfully", data: res.batchStudent };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to add student to batch"), data: null };
        }
    }, []);

    const removeBatchStudent = useCallback(async (
        batchId: string,
        studentId: string,
        status: Exclude<BatchStudentStatus, "active"> = "dropped"
    ): Promise<StandardResponse<null>> => {
        try {
            await axiosHandler({
                path: `${BASE}/${batchId}/students/${studentId}`,
                method: "DELETE",
                body: { status },
            });
            setBatchStudents((prev) => prev.filter((batchStudent) => batchStudent.studentId !== studentId));
            return { success: true, message: "Student removed from batch successfully", data: null };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to remove student from batch"), data: null };
        }
    }, []);

    /* ---------------- sessions ---------------- */

    const getBatchSessions = useCallback(async (
        batchId: string,
        query?: SessionListQuery
    ): Promise<StandardResponse<BatchSessionListItem[]>> => {
        setLoadingBatchSessions(true);
        try {
            const res = await axiosHandler({
                path: `${BASE}/${batchId}/sessions`,
                method: "GET",
                params: query,
            }) as { sessions: BatchSessionListItem[] };
            setBatchSessions(res.sessions);
            return { success: true, message: null, data: res.sessions };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch batch sessions"), data: null };
        } finally {
            setLoadingBatchSessions(false);
        }
    }, []);

    const addBatchSession = useCallback(async (
        batchId: string,
        data: AddBatchSessionInput
    ): Promise<StandardResponse<BatchSession>> => {
        try {
            const res = await axiosHandler({
                path: `${BASE}/${batchId}/sessions`,
                method: "POST",
                body: data,
            }) as { session: BatchSession };
            return { success: true, message: "Batch session added successfully", data: res.session };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to add batch session"), data: null };
        }
    }, []);

    const removeBatchSession = useCallback(async (batchId: string, sessionId: string): Promise<StandardResponse<null>> => {
        try {
            await axiosHandler({ path: `${BASE}/${batchId}/sessions/${sessionId}`, method: "DELETE" });
            setBatchSessions((prev) => prev.filter((session) => session.batchSessionId !== sessionId));
            return { success: true, message: "Batch session removed successfully", data: null };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to remove batch session"), data: null };
        }
    }, []);

    /* ---------------- requests ---------------- */

    const getBatchRequests = useCallback(async (
        batchId: string,
        status?: BatchRequestStatus
    ): Promise<StandardResponse<BatchRequestListItem[]>> => {
        setLoadingBatchRequests(true);
        try {
            const res = await axiosHandler({
                path: `${BASE}/${batchId}/requests`,
                method: "GET",
                params: status ? { status } : undefined,
            }) as { requests: BatchRequestListItem[] };
            setBatchRequests(res.requests);
            return { success: true, message: null, data: res.requests };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch batch requests"), data: null };
        } finally {
            setLoadingBatchRequests(false);
        }
    }, []);

    const approveBatchRequest = useCallback(async (
        batchId: string,
        requestId: string,
        reason?: string
    ): Promise<StandardResponse<ApproveBatchRequestResult>> => {
        try {
            const res = await axiosHandler({
                path: `${BASE}/${batchId}/requests/${requestId}/approve`,
                method: "PUT",
                body: { reason },
            }) as ApproveBatchRequestResult;
            setBatchRequests((prev) => prev.map((request) => (
                request.batchRequestId === requestId ? { ...request, ...res.request } : request
            )));
            return { success: true, message: "Batch request approved successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to approve batch request"), data: null };
        }
    }, []);

    const rejectBatchRequest = useCallback(async (
        batchId: string,
        requestId: string,
        reason?: string
    ): Promise<StandardResponse<BatchRequest>> => {
        try {
            const res = await axiosHandler({
                path: `${BASE}/${batchId}/requests/${requestId}/reject`,
                method: "PUT",
                body: { reason },
            }) as { request: BatchRequest };
            setBatchRequests((prev) => prev.map((request) => (
                request.batchRequestId === requestId ? { ...request, ...res.request } : request
            )));
            return { success: true, message: "Batch request rejected successfully", data: res.request };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to reject batch request"), data: null };
        }
    }, []);

    /* ---------------- queries ---------------- */

    const getBatchQueries = useCallback(async (
        batchId: string,
        query?: QueryListQuery
    ): Promise<StandardResponse<BatchQueryListItem[]>> => {
        setLoadingBatchQueries(true);
        try {
            const res = await axiosHandler({
                path: `${BASE}/${batchId}/queries`,
                method: "GET",
                params: query,
            }) as { queries: BatchQueryListItem[] };
            setBatchQueries(res.queries);
            return { success: true, message: null, data: res.queries };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch batch queries"), data: null };
        } finally {
            setLoadingBatchQueries(false);
        }
    }, []);

    const resolveBatchQuery = useCallback(async (
        batchId: string,
        queryId: string,
        data: ResolveBatchQueryInput
    ): Promise<StandardResponse<BatchQuery>> => {
        try {
            const res = await axiosHandler({
                path: `${BASE}/${batchId}/queries/${queryId}/resolve`,
                method: "PUT",
                body: data,
            }) as { query: BatchQuery };
            setBatchQueries((prev) => prev.map((item) => (
                item.batchQueryId === queryId ? { ...item, ...res.query } : item
            )));
            return { success: true, message: "Batch query updated successfully", data: res.query };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to update batch query"), data: null };
        }
    }, []);

    /* ---------------- student facing ---------------- */

    const createBatchQuery = useCallback(async (
        batchId: string,
        data: CreateBatchQueryInput
    ): Promise<StandardResponse<BatchQuery>> => {
        try {
            const res = await axiosHandler({
                path: `${BASE}/${batchId}/student/queries`,
                method: "POST",
                body: data,
            }) as { query: BatchQuery };
            return { success: true, message: "Batch query created successfully", data: res.query };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to create batch query"), data: null };
        }
    }, []);

    const createBatchRequest = useCallback(async (
        batchId: string,
        data?: CreateBatchRequestInput
    ): Promise<StandardResponse<BatchRequest>> => {
        try {
            const res = await axiosHandler({
                path: `${BASE}/${batchId}/student/requests`,
                method: "POST",
                body: data ?? {},
            }) as { request: BatchRequest };
            return { success: true, message: "Batch request created successfully", data: res.request };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to create batch request"), data: null };
        }
    }, []);

    const value = useMemo<BatchContextValue>(() => ({
        batches, batchDetail, sessionStats, branchTrainers, batchTrainers,
        batchStudents, batchSessions, batchRequests, batchQueries,
        loadingBatches, loadingBatchDetail, loadingBranchTrainers, loadingBatchTrainers,
        loadingBatchStudents, loadingBatchSessions, loadingBatchRequests, loadingBatchQueries,
        getBranchTrainers, getBatches, getBatchById, createBatch, updateBatch, deleteBatch,
        getBatchTrainers, addBatchTrainers, removeBatchTrainer,
        getBatchStudents, addBatchStudent, removeBatchStudent,
        getBatchSessions, addBatchSession, removeBatchSession,
        getBatchRequests, approveBatchRequest, rejectBatchRequest,
        getBatchQueries, resolveBatchQuery,
        createBatchQuery, createBatchRequest,
    }), [
        batches, batchDetail, sessionStats, branchTrainers, batchTrainers,
        batchStudents, batchSessions, batchRequests, batchQueries,
        loadingBatches, loadingBatchDetail, loadingBranchTrainers, loadingBatchTrainers,
        loadingBatchStudents, loadingBatchSessions, loadingBatchRequests, loadingBatchQueries,
        getBranchTrainers, getBatches, getBatchById, createBatch, updateBatch, deleteBatch,
        getBatchTrainers, addBatchTrainers, removeBatchTrainer,
        getBatchStudents, addBatchStudent, removeBatchStudent,
        getBatchSessions, addBatchSession, removeBatchSession,
        getBatchRequests, approveBatchRequest, rejectBatchRequest,
        getBatchQueries, resolveBatchQuery,
        createBatchQuery, createBatchRequest,
    ]);

    return <BatchContext.Provider value={value}>{children}</BatchContext.Provider>;
}

export function useBatch(): BatchContextValue {
    const ctx = useContext(BatchContext);
    if (!ctx) throw new Error("useBatch must be used inside <BatchProvider>");
    return ctx;
}
