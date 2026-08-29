"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import axiosHandler from "@/lib/enhanced-axios";
import type { StandardResponse } from "./AuthContext";

/* ------------------------------------------------------------------ */
/* Vocabulary — mirrors request.controller.ts                          */
/* ------------------------------------------------------------------ */

export const REQUEST_TYPES = [
    "Academic",
    "Batch",
    "Fee",
    "Attendance",
    "Placement",
    "Certificate",
    "Technical Support",
    "General",
] as const;

export type RequestType = (typeof REQUEST_TYPES)[number];

export type RequestStatus =
    | "pending"
    | "in_review"
    | "approved"
    | "rejected"
    | "resolved"
    | "withdrawn";

export type RequestPriority = "low" | "normal" | "high";

/** The three tabs the student sees; each maps to a group of statuses server-side. */
export type RequestTab = "active" | "resolved" | "rejected";

export const ACTIVE_STATUSES: RequestStatus[] = ["pending", "in_review"];
export const RESOLVED_STATUSES: RequestStatus[] = ["approved", "resolved"];
export const REJECTED_STATUSES: RequestStatus[] = ["rejected", "withdrawn"];

export function tabForStatus(status: RequestStatus): RequestTab {
    if (ACTIVE_STATUSES.includes(status)) return "active";
    if (RESOLVED_STATUSES.includes(status)) return "resolved";
    return "rejected";
}

export const STATUS_LABELS: Record<RequestStatus, string> = {
    pending: "Pending",
    in_review: "In Review",
    approved: "Accepted",
    rejected: "Rejected",
    resolved: "Resolved",
    withdrawn: "Withdrawn",
};

/* ------------------------------------------------------------------ */
/* Prisma-derived types — mirror requests.prisma                       */
/* ------------------------------------------------------------------ */

export interface RequestSupportingDocument {
    documentId: string;
    requestId: string;
    documentName: string;
    documentUrl: string;
    documentType: string;
    documentSize: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface RequestTimeline {
    timelineId: string;
    requestId: string;
    timelineTitle: string;
    timelineStatus: RequestStatus;
    timelineNote: string | null;
    actorRole: string | null;
    actorName: string | null;
    timelineDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface RequestHandlerRM {
    rmId: string;
    rmName: string;
    email: string | null;
    callingCode: string;
    phoneNumber: string;
}

export interface StudentRequest {
    requestId: string;
    studentId: string;
    requestType: string;
    requestTitle: string;
    requestDescription: string;
    requestStatus: RequestStatus;
    isUrgent: boolean;
    requestPriority: RequestPriority;
    expectedResponseHours: number;
    handledByRmId: string | null;
    handledByRm: RequestHandlerRM | null;
    responseMessage: string | null;
    rejectionReason: string | null;
    requestResolutionDate: string | null;
    isResolved: boolean;
    isSatisfied: boolean | null;
    satisfactionComment: string | null;
    withdrawnAt: string | null;
    createdAt: string;
    updatedAt: string;
    requestSupportingDocuments: RequestSupportingDocument[];
    requestTimelines: RequestTimeline[];
}

/** Minimal student shape attached to every RM-facing request row. */
export interface RequestStudentSummary {
    studentId: string;
    studentName: string;
    studentPhoto: string | null;
    studentRegistrationNumber: string | null;
    callingCode: string;
    phoneNumber: string;
    email: string | null;
    branchId: string;
}

export interface BranchRequest extends StudentRequest {
    student: RequestStudentSummary;
}

export interface RequestSummary {
    total: number;
    active: number;
    resolved: number;
    rejected: number;
    byStatus: Partial<Record<RequestStatus, number>>;
}

export interface RequestPaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface BranchRequestsResult {
    data: BranchRequest[];
    meta: RequestPaginationMeta;
}

/* ------------------------------------------------------------------ */
/* Input types                                                         */
/* ------------------------------------------------------------------ */

export interface RequestDocumentInput {
    documentName: string;
    documentUrl: string;
    documentType?: string;
    documentSize?: number;
}

export interface CreateRequestInput {
    requestType: RequestType | string;
    requestDescription: string;
    requestTitle?: string;
    requestPriority?: RequestPriority;
    isUrgent?: boolean;
    documents?: RequestDocumentInput[];
}

export interface GetStudentRequestsParams {
    tab?: RequestTab;
    status?: RequestStatus;
    requestType?: string;
    search?: string;
    sort?: "newest" | "oldest";
}

export interface GetBranchRequestsParams extends GetStudentRequestsParams {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
}

/* ------------------------------------------------------------------ */
/* Context shape                                                       */
/* ------------------------------------------------------------------ */

interface RequestContextValue {
    /** Student-side cache, keyed by tab so the three pages never clobber each other. */
    requestsByTab: Record<RequestTab, StudentRequest[]>;
    summary: RequestSummary | null;
    branchRequests: BranchRequest[];
    branchMeta: RequestPaginationMeta | null;
    branchSummary: RequestSummary | null;

    loadingRequests: boolean;
    loadingDetail: boolean;
    loadingBranchRequests: boolean;
    submitting: boolean;

    getStudentRequests: (params?: GetStudentRequestsParams) => Promise<StandardResponse<StudentRequest[]>>;
    getStudentRequest: (requestId: string) => Promise<StandardResponse<StudentRequest>>;
    getStudentRequestSummary: () => Promise<StandardResponse<RequestSummary>>;
    createRequest: (data: CreateRequestInput) => Promise<StandardResponse<StudentRequest>>;
    withdrawRequest: (requestId: string, reason?: string) => Promise<StandardResponse<StudentRequest>>;
    submitRequestFeedback: (requestId: string, isSatisfied: boolean, comment?: string) => Promise<StandardResponse<StudentRequest>>;

    getBranchRequests: (params?: GetBranchRequestsParams) => Promise<StandardResponse<BranchRequestsResult>>;
    getBranchRequestSummary: () => Promise<StandardResponse<RequestSummary>>;
    getBranchRequest: (requestId: string) => Promise<StandardResponse<BranchRequest>>;
    markRequestInReview: (requestId: string, note?: string) => Promise<StandardResponse<BranchRequest>>;
    approveRequest: (requestId: string, responseMessage: string) => Promise<StandardResponse<BranchRequest>>;
    rejectRequest: (requestId: string, rejectionReason: string) => Promise<StandardResponse<BranchRequest>>;
    resolveRequest: (requestId: string, responseMessage?: string) => Promise<StandardResponse<BranchRequest>>;
    addRequestTimelineNote: (requestId: string, timelineNote: string, timelineTitle?: string) => Promise<StandardResponse<BranchRequest>>;
}

const RequestContext = createContext<RequestContextValue | null>(null);

const BASE = "/api/v1/requests";

function toMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function RequestProvider({ children }: { children: ReactNode }) {
    const [requestsByTab, setRequestsByTab] = useState<Record<RequestTab, StudentRequest[]>>({
        active: [],
        resolved: [],
        rejected: [],
    });
    const [summary, setSummary] = useState<RequestSummary | null>(null);
    const [branchRequests, setBranchRequests] = useState<BranchRequest[]>([]);
    const [branchMeta, setBranchMeta] = useState<RequestPaginationMeta | null>(null);
    const [branchSummary, setBranchSummary] = useState<RequestSummary | null>(null);

    const [loadingRequests, setLoadingRequests] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [loadingBranchRequests, setLoadingBranchRequests] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    /* ------------------------------ Student ------------------------------ */

    const getStudentRequests = useCallback(async (
        params: GetStudentRequestsParams = {},
    ): Promise<StandardResponse<StudentRequest[]>> => {
        setLoadingRequests(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/student/all`, method: "GET", params }) as StudentRequest[];
            if (params.tab) setRequestsByTab((prev) => ({ ...prev, [params.tab as RequestTab]: res }));
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch requests"), data: null };
        } finally {
            setLoadingRequests(false);
        }
    }, []);

    const getStudentRequest = useCallback(async (requestId: string): Promise<StandardResponse<StudentRequest>> => {
        setLoadingDetail(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/student/${requestId}`, method: "GET" }) as StudentRequest;
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch request"), data: null };
        } finally {
            setLoadingDetail(false);
        }
    }, []);

    const getStudentRequestSummary = useCallback(async (): Promise<StandardResponse<RequestSummary>> => {
        try {
            const res = await axiosHandler({ path: `${BASE}/student/summary`, method: "GET" }) as RequestSummary;
            setSummary(res);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch request summary"), data: null };
        }
    }, []);

    const createRequest = useCallback(async (data: CreateRequestInput): Promise<StandardResponse<StudentRequest>> => {
        setSubmitting(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/student/create`, method: "POST", body: data }) as StudentRequest;
            setRequestsByTab((prev) => ({ ...prev, active: [res, ...prev.active] }));
            return { success: true, message: "Request submitted successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to create request"), data: null };
        } finally {
            setSubmitting(false);
        }
    }, []);

    const withdrawRequest = useCallback(async (
        requestId: string,
        reason?: string,
    ): Promise<StandardResponse<StudentRequest>> => {
        setSubmitting(true);
        try {
            const res = await axiosHandler({
                path: `${BASE}/student/${requestId}/withdraw`,
                method: "POST",
                body: { reason },
            }) as StudentRequest;
            setRequestsByTab((prev) => ({
                ...prev,
                active: prev.active.filter((item) => item.requestId !== requestId),
                rejected: [res, ...prev.rejected.filter((item) => item.requestId !== requestId)],
            }));
            return { success: true, message: "Request withdrawn successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to withdraw request"), data: null };
        } finally {
            setSubmitting(false);
        }
    }, []);

    const submitRequestFeedback = useCallback(async (
        requestId: string,
        isSatisfied: boolean,
        satisfactionComment?: string,
    ): Promise<StandardResponse<StudentRequest>> => {
        try {
            const res = await axiosHandler({
                path: `${BASE}/student/${requestId}/feedback`,
                method: "POST",
                body: { isSatisfied, satisfactionComment },
            }) as StudentRequest;
            setRequestsByTab((prev) => {
                const patch = (list: StudentRequest[]) => list.map((item) => (item.requestId === requestId ? res : item));
                return { active: patch(prev.active), resolved: patch(prev.resolved), rejected: patch(prev.rejected) };
            });
            return { success: true, message: "Thanks for your feedback", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to submit feedback"), data: null };
        }
    }, []);

    /* -------------------------------- RM -------------------------------- */

    const getBranchRequests = useCallback(async (
        params: GetBranchRequestsParams = {},
    ): Promise<StandardResponse<BranchRequestsResult>> => {
        setLoadingBranchRequests(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/rm/all`, method: "GET", params }) as BranchRequestsResult;
            setBranchRequests(res.data);
            setBranchMeta(res.meta);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch requests"), data: null };
        } finally {
            setLoadingBranchRequests(false);
        }
    }, []);

    const getBranchRequestSummary = useCallback(async (): Promise<StandardResponse<RequestSummary>> => {
        try {
            const res = await axiosHandler({ path: `${BASE}/rm/summary`, method: "GET" }) as RequestSummary;
            setBranchSummary(res);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch request summary"), data: null };
        }
    }, []);

    const getBranchRequest = useCallback(async (requestId: string): Promise<StandardResponse<BranchRequest>> => {
        setLoadingDetail(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/rm/${requestId}`, method: "GET" }) as BranchRequest;
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch request"), data: null };
        } finally {
            setLoadingDetail(false);
        }
    }, []);

    const rmAction = useCallback(async (
        requestId: string,
        action: string,
        body: object,
        successMessage: string,
        failureMessage: string,
    ): Promise<StandardResponse<BranchRequest>> => {
        setSubmitting(true);
        try {
            const res = await axiosHandler({
                path: `${BASE}/rm/${requestId}/${action}`,
                method: "POST",
                body,
            }) as BranchRequest;
            setBranchRequests((prev) => prev.map((item) => (item.requestId === requestId ? res : item)));
            return { success: true, message: successMessage, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, failureMessage), data: null };
        } finally {
            setSubmitting(false);
        }
    }, []);

    const markRequestInReview = useCallback((requestId: string, note?: string) => (
        rmAction(requestId, "review", { note }, "Request moved to review", "Failed to move request to review")
    ), [rmAction]);

    const approveRequest = useCallback((requestId: string, responseMessage: string) => (
        rmAction(requestId, "approve", { responseMessage }, "Request approved", "Failed to approve request")
    ), [rmAction]);

    const rejectRequest = useCallback((requestId: string, rejectionReason: string) => (
        rmAction(requestId, "reject", { rejectionReason }, "Request rejected", "Failed to reject request")
    ), [rmAction]);

    const resolveRequest = useCallback((requestId: string, responseMessage?: string) => (
        rmAction(requestId, "resolve", { responseMessage }, "Request resolved", "Failed to resolve request")
    ), [rmAction]);

    const addRequestTimelineNote = useCallback((requestId: string, timelineNote: string, timelineTitle?: string) => (
        rmAction(requestId, "timeline", { timelineNote, timelineTitle }, "Note added", "Failed to add note")
    ), [rmAction]);

    const value = useMemo<RequestContextValue>(() => ({
        requestsByTab, summary, branchRequests, branchMeta, branchSummary,
        loadingRequests, loadingDetail, loadingBranchRequests, submitting,
        getStudentRequests, getStudentRequest, getStudentRequestSummary,
        createRequest, withdrawRequest, submitRequestFeedback,
        getBranchRequests, getBranchRequestSummary, getBranchRequest,
        markRequestInReview, approveRequest, rejectRequest, resolveRequest, addRequestTimelineNote,
    }), [
        requestsByTab, summary, branchRequests, branchMeta, branchSummary,
        loadingRequests, loadingDetail, loadingBranchRequests, submitting,
        getStudentRequests, getStudentRequest, getStudentRequestSummary,
        createRequest, withdrawRequest, submitRequestFeedback,
        getBranchRequests, getBranchRequestSummary, getBranchRequest,
        markRequestInReview, approveRequest, rejectRequest, resolveRequest, addRequestTimelineNote,
    ]);

    return <RequestContext.Provider value={value}>{children}</RequestContext.Provider>;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

export function useRequests(): RequestContextValue {
    const ctx = useContext(RequestContext);
    if (!ctx) throw new Error("useRequests must be used inside <RequestProvider>");
    return ctx;
}
