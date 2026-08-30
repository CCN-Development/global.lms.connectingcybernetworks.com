"use client";

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";
import axiosHandler from "@/lib/enhanced-axios";
import type { StandardResponse } from "./AuthContext";

/* ------------------------------------------------------------------ types */

export type TaskSubmissionStatus =
    | "submitted"
    | "under_review"
    | "approved"
    | "rejected"
    | "resubmit";

export type AssignmentSubmissionStatus =
    | "pending"
    | "submitted"
    | "under_review"
    | "approved"
    | "rejected"
    | "resubmit";

/** Derived card status — never sent to the API, only read from it. */
export type AssignmentProgressStatus =
    | "recently_added"
    | "in_progress"
    | "under_review"
    | "needs_rework"
    | "overdue"
    | "completed";

export type FeedbackGrade = "excellent" | "good" | "average" | "poor";

export interface TrainerRef {
    trainerId: string;
    trainerName: string;
}

export interface AssignmentStudentRef {
    studentId: string;
    studentName: string;
    email: string | null;
    callingCode: string;
    phoneNumber: string;
    studentPhoto: string | null;
    studentRegistrationNumber: string | null;
}

export interface TaskReferenceDocument {
    referenceDocumentId: string;
    documentName: string;
    documentType: string;
    documentUrl: string;
}

export interface SubmissionDocument {
    submissionDocumentId: string;
    documentName: string;
    documentType: string;
    documentUrl: string;
    fileSizeInBytes: number | null;
    uploadedAt: string;
}

export interface SubmissionStatusHistoryItem {
    statusHistoryId: string;
    status: string;
    note: string | null;
    actorRole: string;
    actorName: string | null;
    createdAt: string;
}

export interface TaskSubmission {
    taskSubmissionId: string;
    taskId: string;
    studentId: string;
    batchAssignmentId: string;
    submissionDate: string;
    submissionLink: string | null;
    submissionNote: string | null;
    submissionStatus: TaskSubmissionStatus;
    attemptNumber: number;
    isLate: boolean;
    marks: number | null;
    feedbackGrade: FeedbackGrade | null;
    feedback: string | null;
    reviewedAt: string | null;
    createdAt: string;
    updatedAt: string;
    reviewer: TrainerRef | null;
    submissionDocuments: SubmissionDocument[];
    statusHistory: SubmissionStatusHistoryItem[];
}

export interface AssignmentTask {
    taskId: string;
    taskOrder: number;
    taskTitle: string;
    taskObjective: string | null;
    taskDescription: string | null;
    deliverables: string | null;
    taskDueDate: string;
    estimatedTimeToComplete: number | null;
    tools: string[];
    referenceLinks: string[];
    maximumMarks: number | null;
    isActive: boolean;
    createdAt: string;
    referenceDocumentsInTasks: TaskReferenceDocument[];
}

export interface AssignmentTaskWithCounts extends AssignmentTask {
    submissionCount: number;
    approvedCount: number;
    pendingReviewCount: number;
    notSubmittedCount: number;
}

export interface AssignmentTaskWithSubmission extends AssignmentTask {
    submission: TaskSubmission | null;
}

export interface AssignmentListItem {
    batchAssignmentId: string;
    assignmentTitle: string;
    assignmentDesc: string | null;
    assignedOn: string;
    assignmentDueDate: string;
    maximumMarks: number | null;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    trainer: TrainerRef;
    totalTasks: number;
    totalStudents: number;
    totalTaskMarks: number;
    submittedStudents: number;
    completedStudents: number;
    pendingReviewCount: number;
    totalSubmissions: number;
    isOverdue: boolean;
    daysOverdue: number;
}

export interface AssignmentListResult {
    totalStudents: number;
    totalAssignments: number;
    assignments: AssignmentListItem[];
}

export interface AssignmentDetail {
    batchAssignmentId: string;
    batchId: string;
    assignmentTitle: string;
    assignmentDesc: string | null;
    assignedOn: string;
    assignmentDueDate: string;
    maximumMarks: number | null;
    isPublished: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    trainer: TrainerRef;
    batch: {
        batchId: string;
        batchName: string;
        course: { courseId: string; courseName: string };
    };
    tasks: AssignmentTaskWithCounts[];
}

export interface AssignmentStats {
    totalTasks: number;
    totalStudents: number;
    totalSubmissions: number;
    pendingReviewCount: number;
    completedStudents: number;
    totalTaskMarks: number;
}

export interface AssignmentDetailResult {
    assignment: AssignmentDetail;
    stats: AssignmentStats;
}

export interface AssignmentTasksResult {
    totalStudents: number;
    tasks: AssignmentTaskWithCounts[];
}

export interface AssignmentSummaryRef {
    batchAssignmentId: string;
    batchId: string;
    assignmentTitle: string;
    assignmentDueDate: string;
    maximumMarks: number | null;
}

export interface SubmissionTaskStatus {
    taskId: string;
    taskOrder: number;
    taskTitle: string;
    maximumMarks: number | null;
    taskSubmissionId: string | null;
    submissionStatus: TaskSubmissionStatus | null;
    submittedAt: string | null;
    marks: number | null;
}

export interface AssignmentStudentRow {
    batchStudentId: string;
    enrollmentStatus: string;
    student: AssignmentStudentRef;
    totalTasks: number;
    submittedTasks: number;
    approvedTasks: number;
    pendingReviewCount: number;
    notSubmittedTasks: number;
    lateSubmissions: number;
    obtainedMarks: number;
    totalMarks: number;
    overallStatus: AssignmentSubmissionStatus;
    progressStatus: AssignmentProgressStatus;
    feedbackGrade: FeedbackGrade | null;
    feedback: string | null;
    firstSubmittedAt: string | null;
    reviewedAt: string | null;
    taskStatuses: SubmissionTaskStatus[];
}

export interface AssignmentSubmissionsResult {
    assignment: AssignmentSummaryRef;
    totalTasks: number;
    totalTaskMarks: number;
    totalStudents: number;
    summary: {
        notStarted: number;
        inProgress: number;
        completed: number;
        pendingReview: number;
    };
    tasks: { taskId: string; taskTitle: string; taskOrder: number; maximumMarks: number | null }[];
    students: AssignmentStudentRow[];
}

export interface StudentSubmissionReviewResult {
    assignment: AssignmentSummaryRef;
    student: AssignmentStudentRef;
    enrollmentStatus: string;
    overall: {
        totalTasks: number;
        submittedTasks: number;
        approvedTasks: number;
        obtainedMarks: number;
        totalMarks: number;
        status: AssignmentSubmissionStatus;
        feedbackGrade: FeedbackGrade | null;
        feedback: string | null;
        progressStatus: AssignmentProgressStatus;
    };
    tasks: AssignmentTaskWithSubmission[];
}

/* ------------------------------------------------------------ input types */

export interface TaskDocumentInput {
    documentName: string;
    documentType: string;
    documentUrl: string;
    fileSizeInBytes?: number | null;
}

export interface TaskInput {
    taskTitle: string;
    taskObjective?: string | null;
    taskDescription?: string | null;
    deliverables?: string | null;
    taskDueDate: string;
    estimatedTimeToComplete?: number | null;
    tools?: string[];
    referenceLinks?: string[];
    maximumMarks?: number | null;
    taskOrder?: number;
    referenceDocuments?: TaskDocumentInput[];
}

export interface CreateAssignmentInput {
    assignmentTitle: string;
    assignmentDesc?: string | null;
    assignmentDueDate: string;
    maximumMarks?: number | null;
    isPublished?: boolean;
    tasks?: TaskInput[];
}

export type UpdateAssignmentInput = Partial<Omit<CreateAssignmentInput, "tasks">>;

export interface ReviewTaskSubmissionInput {
    submissionStatus: Exclude<TaskSubmissionStatus, "submitted">;
    marks?: number | null;
    feedback?: string | null;
    feedbackGrade?: FeedbackGrade | null;
}

export interface ReviewAssignmentInput {
    marks?: number | null;
    feedback?: string | null;
    feedbackGrade?: FeedbackGrade | null;
}

export interface SubmitTaskInput {
    submissionLink?: string | null;
    submissionNote?: string | null;
    documents?: TaskDocumentInput[];
}

/* ------------------------------------------------- student-facing results */

export interface StudentAssignmentListItem {
    batchAssignmentId: string;
    assignmentTitle: string;
    assignmentDesc: string | null;
    assignedOn: string;
    assignmentDueDate: string;
    maximumMarks: number | null;
    trainer: TrainerRef;
    totalTasks: number;
    submittedTasks: number;
    completedTasks: number;
    totalMarks: number;
    obtainedMarks: number;
    progressStatus: AssignmentProgressStatus;
    daysOverdue: number;
    completedOn: string | null;
    feedback: string | null;
    feedbackGrade: FeedbackGrade | null;
}

export interface StudentAssignmentDetailResult {
    assignment: Omit<AssignmentDetail, "tasks" | "isPublished" | "isActive" | "createdAt" | "updatedAt"> & {
        tasks: AssignmentTaskWithSubmission[];
    };
    progress: {
        totalTasks: number;
        submittedTasks: number;
        completedTasks: number;
        obtainedMarks: number;
        totalMarks: number;
        progressStatus: AssignmentProgressStatus;
        feedback: string | null;
        feedbackGrade: FeedbackGrade | null;
        overallStatus: AssignmentSubmissionStatus;
    };
}

/* ---------------------------------------------------------------- context */

interface AssignmentContextValue {
    assignments: AssignmentListItem[];
    assignmentDetail: AssignmentDetailResult | null;
    assignmentTasks: AssignmentTaskWithCounts[];
    assignmentSubmissions: AssignmentSubmissionsResult | null;
    studentAssignments: StudentAssignmentListItem[];

    loadingAssignments: boolean;
    loadingAssignmentDetail: boolean;
    loadingTasks: boolean;
    loadingSubmissions: boolean;
    saving: boolean;

    getBatchAssignments: (batchId: string, search?: string) => Promise<StandardResponse<AssignmentListResult>>;
    createAssignment: (batchId: string, input: CreateAssignmentInput) => Promise<StandardResponse<AssignmentDetail>>;
    getAssignmentById: (assignmentId: string) => Promise<StandardResponse<AssignmentDetailResult>>;
    updateAssignment: (assignmentId: string, input: UpdateAssignmentInput) => Promise<StandardResponse<null>>;
    deleteAssignment: (assignmentId: string) => Promise<StandardResponse<null>>;

    getAssignmentTasks: (assignmentId: string) => Promise<StandardResponse<AssignmentTasksResult>>;
    addTask: (assignmentId: string, input: TaskInput) => Promise<StandardResponse<AssignmentTask>>;
    updateTask: (taskId: string, input: Partial<TaskInput>) => Promise<StandardResponse<AssignmentTask>>;
    removeTask: (taskId: string) => Promise<StandardResponse<null>>;

    getAssignmentSubmissions: (assignmentId: string) => Promise<StandardResponse<AssignmentSubmissionsResult>>;
    getStudentSubmission: (
        assignmentId: string,
        studentId: string
    ) => Promise<StandardResponse<StudentSubmissionReviewResult>>;
    reviewTaskSubmission: (
        submissionId: string,
        input: ReviewTaskSubmissionInput
    ) => Promise<StandardResponse<TaskSubmission>>;
    reviewAssignmentSubmission: (
        assignmentId: string,
        studentId: string,
        input: ReviewAssignmentInput
    ) => Promise<StandardResponse<null>>;

    getStudentBatchAssignments: (
        batchId: string,
        filters?: { search?: string; status?: string }
    ) => Promise<StandardResponse<{ totalAssignments: number; assignments: StudentAssignmentListItem[] }>>;
    getStudentAssignmentDetail: (
        assignmentId: string
    ) => Promise<StandardResponse<StudentAssignmentDetailResult>>;
    submitTask: (taskId: string, input: SubmitTaskInput) => Promise<StandardResponse<TaskSubmission>>;
    withdrawTaskSubmission: (taskId: string) => Promise<StandardResponse<null>>;
}

const AssignmentContext = createContext<AssignmentContextValue | null>(null);
const BASE = "/api/v1/assignments";

function toMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}

export function AssignmentProvider({ children }: { children: ReactNode }) {
    const [assignments, setAssignments] = useState<AssignmentListItem[]>([]);
    const [assignmentDetail, setAssignmentDetail] = useState<AssignmentDetailResult | null>(null);
    const [assignmentTasks, setAssignmentTasks] = useState<AssignmentTaskWithCounts[]>([]);
    const [assignmentSubmissions, setAssignmentSubmissions] =
        useState<AssignmentSubmissionsResult | null>(null);
    const [studentAssignments, setStudentAssignments] = useState<StudentAssignmentListItem[]>([]);

    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [loadingAssignmentDetail, setLoadingAssignmentDetail] = useState(false);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [saving, setSaving] = useState(false);

    const getBatchAssignments = useCallback(
        async (batchId: string, search?: string): Promise<StandardResponse<AssignmentListResult>> => {
            setLoadingAssignments(true);
            try {
                const res = (await axiosHandler({
                    path: `${BASE}/batches/${batchId}/assignments`,
                    method: "GET",
                    params: search ? { search } : undefined,
                })) as AssignmentListResult;
                setAssignments(res.assignments ?? []);
                return { success: true, message: null, data: res };
            } catch (error: unknown) {
                return { success: false, message: toMessage(error, "Failed to fetch assignments"), data: null };
            } finally {
                setLoadingAssignments(false);
            }
        },
        []
    );

    const createAssignment = useCallback(
        async (batchId: string, input: CreateAssignmentInput): Promise<StandardResponse<AssignmentDetail>> => {
            setSaving(true);
            try {
                const res = (await axiosHandler({
                    path: `${BASE}/batches/${batchId}/assignments`,
                    method: "POST",
                    body: input,
                })) as AssignmentDetail;
                return { success: true, message: "Assignment created successfully", data: res };
            } catch (error: unknown) {
                return { success: false, message: toMessage(error, "Failed to create assignment"), data: null };
            } finally {
                setSaving(false);
            }
        },
        []
    );

    const getAssignmentById = useCallback(
        async (assignmentId: string): Promise<StandardResponse<AssignmentDetailResult>> => {
            setLoadingAssignmentDetail(true);
            try {
                const res = (await axiosHandler({
                    path: `${BASE}/${assignmentId}`,
                    method: "GET",
                })) as AssignmentDetailResult;
                setAssignmentDetail(res);
                return { success: true, message: null, data: res };
            } catch (error: unknown) {
                return { success: false, message: toMessage(error, "Failed to fetch assignment"), data: null };
            } finally {
                setLoadingAssignmentDetail(false);
            }
        },
        []
    );

    const updateAssignment = useCallback(
        async (assignmentId: string, input: UpdateAssignmentInput): Promise<StandardResponse<null>> => {
            setSaving(true);
            try {
                await axiosHandler({ path: `${BASE}/${assignmentId}`, method: "PUT", body: input });
                return { success: true, message: "Assignment updated successfully", data: null };
            } catch (error: unknown) {
                return { success: false, message: toMessage(error, "Failed to update assignment"), data: null };
            } finally {
                setSaving(false);
            }
        },
        []
    );

    const deleteAssignment = useCallback(
        async (assignmentId: string): Promise<StandardResponse<null>> => {
            setSaving(true);
            try {
                await axiosHandler({ path: `${BASE}/${assignmentId}`, method: "DELETE" });
                setAssignments((prev) => prev.filter((a) => a.batchAssignmentId !== assignmentId));
                return { success: true, message: "Assignment removed successfully", data: null };
            } catch (error: unknown) {
                return { success: false, message: toMessage(error, "Failed to remove assignment"), data: null };
            } finally {
                setSaving(false);
            }
        },
        []
    );

    const getAssignmentTasks = useCallback(
        async (assignmentId: string): Promise<StandardResponse<AssignmentTasksResult>> => {
            setLoadingTasks(true);
            try {
                const res = (await axiosHandler({
                    path: `${BASE}/${assignmentId}/tasks`,
                    method: "GET",
                })) as AssignmentTasksResult;
                setAssignmentTasks(res.tasks ?? []);
                return { success: true, message: null, data: res };
            } catch (error: unknown) {
                return { success: false, message: toMessage(error, "Failed to fetch tasks"), data: null };
            } finally {
                setLoadingTasks(false);
            }
        },
        []
    );

    const addTask = useCallback(
        async (assignmentId: string, input: TaskInput): Promise<StandardResponse<AssignmentTask>> => {
            setSaving(true);
            try {
                const res = (await axiosHandler({
                    path: `${BASE}/${assignmentId}/tasks`,
                    method: "POST",
                    body: input,
                })) as AssignmentTask;
                return { success: true, message: "Task added successfully", data: res };
            } catch (error: unknown) {
                return { success: false, message: toMessage(error, "Failed to add task"), data: null };
            } finally {
                setSaving(false);
            }
        },
        []
    );

    const updateTask = useCallback(
        async (taskId: string, input: Partial<TaskInput>): Promise<StandardResponse<AssignmentTask>> => {
            setSaving(true);
            try {
                const res = (await axiosHandler({
                    path: `${BASE}/tasks/${taskId}`,
                    method: "PUT",
                    body: input,
                })) as AssignmentTask;
                return { success: true, message: "Task updated successfully", data: res };
            } catch (error: unknown) {
                return { success: false, message: toMessage(error, "Failed to update task"), data: null };
            } finally {
                setSaving(false);
            }
        },
        []
    );

    const removeTask = useCallback(async (taskId: string): Promise<StandardResponse<null>> => {
        setSaving(true);
        try {
            await axiosHandler({ path: `${BASE}/tasks/${taskId}`, method: "DELETE" });
            setAssignmentTasks((prev) => prev.filter((task) => task.taskId !== taskId));
            return { success: true, message: "Task removed successfully", data: null };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to remove task"), data: null };
        } finally {
            setSaving(false);
        }
    }, []);

    const getAssignmentSubmissions = useCallback(
        async (assignmentId: string): Promise<StandardResponse<AssignmentSubmissionsResult>> => {
            setLoadingSubmissions(true);
            try {
                const res = (await axiosHandler({
                    path: `${BASE}/${assignmentId}/submissions`,
                    method: "GET",
                })) as AssignmentSubmissionsResult;
                setAssignmentSubmissions(res);
                return { success: true, message: null, data: res };
            } catch (error: unknown) {
                return { success: false, message: toMessage(error, "Failed to fetch submissions"), data: null };
            } finally {
                setLoadingSubmissions(false);
            }
        },
        []
    );

    const getStudentSubmission = useCallback(
        async (
            assignmentId: string,
            studentId: string
        ): Promise<StandardResponse<StudentSubmissionReviewResult>> => {
            try {
                const res = (await axiosHandler({
                    path: `${BASE}/${assignmentId}/students/${studentId}`,
                    method: "GET",
                })) as StudentSubmissionReviewResult;
                return { success: true, message: null, data: res };
            } catch (error: unknown) {
                return {
                    success: false,
                    message: toMessage(error, "Failed to fetch student submission"),
                    data: null,
                };
            }
        },
        []
    );

    const reviewTaskSubmission = useCallback(
        async (
            submissionId: string,
            input: ReviewTaskSubmissionInput
        ): Promise<StandardResponse<TaskSubmission>> => {
            setSaving(true);
            try {
                const res = (await axiosHandler({
                    path: `${BASE}/submissions/${submissionId}/review`,
                    method: "PUT",
                    body: input,
                })) as TaskSubmission;
                return { success: true, message: "Submission reviewed successfully", data: res };
            } catch (error: unknown) {
                return { success: false, message: toMessage(error, "Failed to review submission"), data: null };
            } finally {
                setSaving(false);
            }
        },
        []
    );

    const reviewAssignmentSubmission = useCallback(
        async (
            assignmentId: string,
            studentId: string,
            input: ReviewAssignmentInput
        ): Promise<StandardResponse<null>> => {
            setSaving(true);
            try {
                await axiosHandler({
                    path: `${BASE}/${assignmentId}/students/${studentId}/review`,
                    method: "PUT",
                    body: input,
                });
                return { success: true, message: "Feedback saved successfully", data: null };
            } catch (error: unknown) {
                return { success: false, message: toMessage(error, "Failed to save feedback"), data: null };
            } finally {
                setSaving(false);
            }
        },
        []
    );

    const getStudentBatchAssignments = useCallback(
        async (batchId: string, filters?: { search?: string; status?: string }) => {
            setLoadingAssignments(true);
            try {
                const res = (await axiosHandler({
                    path: `${BASE}/student/batches/${batchId}/assignments`,
                    method: "GET",
                    params: filters,
                })) as { totalAssignments: number; assignments: StudentAssignmentListItem[] };
                setStudentAssignments(res.assignments ?? []);
                return { success: true, message: null, data: res };
            } catch (error: unknown) {
                return { success: false, message: toMessage(error, "Failed to fetch assignments"), data: null };
            } finally {
                setLoadingAssignments(false);
            }
        },
        []
    );

    const getStudentAssignmentDetail = useCallback(
        async (assignmentId: string): Promise<StandardResponse<StudentAssignmentDetailResult>> => {
            setLoadingAssignmentDetail(true);
            try {
                const res = (await axiosHandler({
                    path: `${BASE}/student/assignments/${assignmentId}`,
                    method: "GET",
                })) as StudentAssignmentDetailResult;
                return { success: true, message: null, data: res };
            } catch (error: unknown) {
                return { success: false, message: toMessage(error, "Failed to fetch assignment"), data: null };
            } finally {
                setLoadingAssignmentDetail(false);
            }
        },
        []
    );

    const submitTask = useCallback(
        async (taskId: string, input: SubmitTaskInput): Promise<StandardResponse<TaskSubmission>> => {
            setSaving(true);
            try {
                const res = (await axiosHandler({
                    path: `${BASE}/student/tasks/${taskId}/submit`,
                    method: "POST",
                    body: input,
                })) as TaskSubmission;
                return { success: true, message: "Task submitted successfully", data: res };
            } catch (error: unknown) {
                return { success: false, message: toMessage(error, "Failed to submit task"), data: null };
            } finally {
                setSaving(false);
            }
        },
        []
    );

    const withdrawTaskSubmission = useCallback(
        async (taskId: string): Promise<StandardResponse<null>> => {
            setSaving(true);
            try {
                await axiosHandler({ path: `${BASE}/student/tasks/${taskId}/submission`, method: "DELETE" });
                return { success: true, message: "Submission withdrawn successfully", data: null };
            } catch (error: unknown) {
                return { success: false, message: toMessage(error, "Failed to withdraw submission"), data: null };
            } finally {
                setSaving(false);
            }
        },
        []
    );

    const value = useMemo<AssignmentContextValue>(
        () => ({
            assignments,
            assignmentDetail,
            assignmentTasks,
            assignmentSubmissions,
            studentAssignments,
            loadingAssignments,
            loadingAssignmentDetail,
            loadingTasks,
            loadingSubmissions,
            saving,
            getBatchAssignments,
            createAssignment,
            getAssignmentById,
            updateAssignment,
            deleteAssignment,
            getAssignmentTasks,
            addTask,
            updateTask,
            removeTask,
            getAssignmentSubmissions,
            getStudentSubmission,
            reviewTaskSubmission,
            reviewAssignmentSubmission,
            getStudentBatchAssignments,
            getStudentAssignmentDetail,
            submitTask,
            withdrawTaskSubmission,
        }),
        [
            assignments,
            assignmentDetail,
            assignmentTasks,
            assignmentSubmissions,
            studentAssignments,
            loadingAssignments,
            loadingAssignmentDetail,
            loadingTasks,
            loadingSubmissions,
            saving,
            getBatchAssignments,
            createAssignment,
            getAssignmentById,
            updateAssignment,
            deleteAssignment,
            getAssignmentTasks,
            addTask,
            updateTask,
            removeTask,
            getAssignmentSubmissions,
            getStudentSubmission,
            reviewTaskSubmission,
            reviewAssignmentSubmission,
            getStudentBatchAssignments,
            getStudentAssignmentDetail,
            submitTask,
            withdrawTaskSubmission,
        ]
    );

    return <AssignmentContext.Provider value={value}>{children}</AssignmentContext.Provider>;
}

export function useAssignment(): AssignmentContextValue {
    const ctx = useContext(AssignmentContext);
    if (!ctx) throw new Error("useAssignment must be used inside <AssignmentProvider>");
    return ctx;
}
