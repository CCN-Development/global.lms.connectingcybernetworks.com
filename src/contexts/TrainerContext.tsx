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

export type SessionStatus =
    | "scheduled"
    | "ongoing"
    | "completed"
    | "cancelled"
    | "rescheduled";

export type BatchStudentStatus = "active" | "completed" | "dropped" | "failed";

export interface TrainerBranchSummary {
    branchId: string;
    branchName: string;
    branchCode: string;
}

export interface TrainerCourseSummary {
    courseId: string;
    courseName: string;
}

export interface TrainerProfile {
    trainerId: string;
    trainerName: string;
    email: string | null;
    callingCode: string;
    phoneNumber: string;
    isActive: boolean;
    createdAt: string;
    branch: TrainerBranchSummary;
    totalBatches: number;
}

export interface UpdateTrainerProfileInput {
    name?: string;
    email?: string | null;
}

export interface TrainerBatchListItem {
    batchId: string;
    batchName: string;
    batchDescription: string | null;
    batchStartDate: string;
    batchEndDate: string;
    mode: string | null;
    isActive: boolean;
    classRoomNumber: string | null;
    classTiming: string | null;
    classStartTime: string | null;
    classEndTime: string | null;
    batchDays: string[];
    batchLink: string | null;
    totalSeats: number | null;
    availableSeats: number | null;
    course: TrainerCourseSummary;
    totalStudents: number;
    totalSessions: number;
}

export interface TrainerBatchStudent {
    batchStudentId: string;
    status: BatchStudentStatus;
    isAccessActive: boolean;
    enrolledAt: string;
    studentId: string;
    studentName: string;
    email: string | null;
    callingCode: string;
    phoneNumber: string;
    isActive: boolean;
}

export interface TrainerBatchSession {
    batchSessionId: string;
    sessionDate: string;
    sessionTime: string;
    sessionStatus: SessionStatus;
    isSessionCompleted: boolean;
    isRescheduled: boolean;
    rescheduledDate: string | null;
    rescheduledTime: string | null;
    sessionLink: string | null;
    sessionStartedAt: string | null;
    sessionEndedAt: string | null;
}

export interface TrainerBatchDetail {
    batchId: string;
    batchName: string;
    batchDescription: string | null;
    batchStartDate: string;
    batchEndDate: string;
    mode: string | null;
    isActive: boolean;
    classRoomNumber: string | null;
    classTiming: string | null;
    numberOfHoursPerClass: number | null;
    classStartTime: string | null;
    classEndTime: string | null;
    batchDays: string[];
    batchLink: string | null;
    totalSeats: number | null;
    availableSeats: number | null;
    course: TrainerCourseSummary;
    branch: { branchId: string; branchName: string };
    students: TrainerBatchStudent[];
    sessions: TrainerBatchSession[];
}

export interface TrainerSessionBatchSummary {
    batchId: string;
    batchName: string;
    classRoomNumber: string | null;
    mode: string | null;
    course: TrainerCourseSummary;
}

export interface TrainerSessionListItem extends TrainerBatchSession {
    batch: TrainerSessionBatchSummary;
    attendanceMarkedCount: number;
}

export interface TrainerSessionsResult {
    month: number;
    year: number;
    totalSessions: number;
    sessions: TrainerSessionListItem[];
}

export interface TrainerSessionStudent {
    studentId: string;
    studentName: string;
    email: string | null;
    callingCode: string;
    phoneNumber: string;
    enrollmentStatus: BatchStudentStatus;
    isAccessActive: boolean;
    sessionAttendanceId: string | null;
    isAttendanceMarked: boolean;
    isPresent: boolean;
    attendanceMarkedAt: string | null;
}

export interface TrainerSessionDetail extends TrainerBatchSession {
    batchId: string;
    batch: TrainerSessionBatchSummary & { batchLink: string | null };
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    students: TrainerSessionStudent[];
}

export interface TrainerTodaySession extends TrainerBatchSession {
    batch: TrainerSessionBatchSummary & {
        batchLink: string | null;
        totalStudents: number;
    };
}

export interface TrainerTodayScheduleResult {
    date: string;
    totalSessions: number;
    sessions: TrainerTodaySession[];
}

export interface TrainerSessionStats {
    month: number;
    year: number;
    totalSessions: number;
    completed: number;
    cancelled: number;
    scheduled: number;
    ongoing: number;
    rescheduled: number;
    notCompleted: number;
}

export interface StartSessionResult {
    batchSessionId: string;
    sessionStatus: SessionStatus;
    sessionStartedAt: string | null;
    sessionLink: string | null;
}

export interface EndSessionResult {
    batchSessionId: string;
    sessionStatus: SessionStatus;
    sessionStartedAt: string | null;
    sessionEndedAt: string | null;
    isSessionCompleted: boolean;
    autoMarkedAbsent: number;
}

export interface MarkAttendanceResult {
    sessionAttendanceId: string;
    studentId: string;
    isPresent: boolean;
}

export interface TrainerSessionFilters {
    month?: number;
    year?: number;
    batchId?: string;
    status?: SessionStatus;
}

export interface TrainerStatsFilters {
    month?: number;
    year?: number;
    batchId?: string;
}

/* ---------------------------------------------------------------- context */

interface TrainerContextValue {
    profile: TrainerProfile | null;
    batches: TrainerBatchListItem[];
    batchDetail: TrainerBatchDetail | null;
    sessions: TrainerSessionsResult | null;
    sessionDetail: TrainerSessionDetail | null;
    todaySchedule: TrainerTodayScheduleResult | null;
    sessionStats: TrainerSessionStats | null;

    loadingProfile: boolean;
    updatingProfile: boolean;
    loadingBatches: boolean;
    loadingBatchDetail: boolean;
    loadingSessions: boolean;
    loadingSessionDetail: boolean;
    loadingTodaySchedule: boolean;
    loadingSessionStats: boolean;
    updatingSession: boolean;
    markingAttendance: boolean;

    getProfile: () => Promise<StandardResponse<TrainerProfile>>;
    updateProfile: (
        data: UpdateTrainerProfileInput
    ) => Promise<StandardResponse<null>>;
    getBatches: () => Promise<StandardResponse<TrainerBatchListItem[]>>;
    getBatchDetails: (
        batchId: string
    ) => Promise<StandardResponse<TrainerBatchDetail>>;
    getSessions: (
        filters?: TrainerSessionFilters
    ) => Promise<StandardResponse<TrainerSessionsResult>>;
    getSessionDetails: (
        sessionId: string
    ) => Promise<StandardResponse<TrainerSessionDetail>>;
    startSession: (
        sessionId: string,
        sessionLink?: string
    ) => Promise<StandardResponse<StartSessionResult>>;
    endSession: (
        sessionId: string
    ) => Promise<StandardResponse<EndSessionResult>>;
    markAttendance: (
        sessionId: string,
        studentId: string,
        isPresent: boolean
    ) => Promise<StandardResponse<MarkAttendanceResult>>;
    getTodaySchedule: () => Promise<
        StandardResponse<TrainerTodayScheduleResult>
    >;
    getSessionStats: (
        filters?: TrainerStatsFilters
    ) => Promise<StandardResponse<TrainerSessionStats>>;
    clearBatchDetail: () => void;
    clearSessionDetail: () => void;
}

const TrainerContext = createContext<TrainerContextValue | null>(null);
const BASE = "/api/v1/trainer";

function toMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}

export function TrainerProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<TrainerProfile | null>(null);
    const [batches, setBatches] = useState<TrainerBatchListItem[]>([]);
    const [batchDetail, setBatchDetail] = useState<TrainerBatchDetail | null>(
        null
    );
    const [sessions, setSessions] = useState<TrainerSessionsResult | null>(null);
    const [sessionDetail, setSessionDetail] =
        useState<TrainerSessionDetail | null>(null);
    const [todaySchedule, setTodaySchedule] =
        useState<TrainerTodayScheduleResult | null>(null);
    const [sessionStats, setSessionStats] =
        useState<TrainerSessionStats | null>(null);

    const [loadingProfile, setLoadingProfile] = useState(false);
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [loadingBatches, setLoadingBatches] = useState(false);
    const [loadingBatchDetail, setLoadingBatchDetail] = useState(false);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [loadingSessionDetail, setLoadingSessionDetail] = useState(false);
    const [loadingTodaySchedule, setLoadingTodaySchedule] = useState(false);
    const [loadingSessionStats, setLoadingSessionStats] = useState(false);
    const [updatingSession, setUpdatingSession] = useState(false);
    const [markingAttendance, setMarkingAttendance] = useState(false);

    /** Applies a status change to the cached session lists and detail. */
    const patchCachedSession = useCallback(
        (sessionId: string, patch: Partial<TrainerBatchSession>) => {
            setSessions((prev) =>
                prev
                    ? {
                          ...prev,
                          sessions: prev.sessions.map((session) =>
                              session.batchSessionId === sessionId
                                  ? { ...session, ...patch }
                                  : session
                          ),
                      }
                    : prev
            );
            setTodaySchedule((prev) =>
                prev
                    ? {
                          ...prev,
                          sessions: prev.sessions.map((session) =>
                              session.batchSessionId === sessionId
                                  ? { ...session, ...patch }
                                  : session
                          ),
                      }
                    : prev
            );
            setSessionDetail((prev) =>
                prev && prev.batchSessionId === sessionId
                    ? { ...prev, ...patch }
                    : prev
            );
        },
        []
    );

    const getProfile = useCallback(async (): Promise<
        StandardResponse<TrainerProfile>
    > => {
        setLoadingProfile(true);
        try {
            const res = (await axiosHandler({
                path: `${BASE}/profile`,
                method: "GET",
            })) as TrainerProfile;
            setProfile(res);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return {
                success: false,
                message: toMessage(error, "Failed to fetch profile"),
                data: null,
            };
        } finally {
            setLoadingProfile(false);
        }
    }, []);

    const updateProfile = useCallback(
        async (
            data: UpdateTrainerProfileInput
        ): Promise<StandardResponse<null>> => {
            setUpdatingProfile(true);
            try {
                await axiosHandler({
                    path: `${BASE}/profile`,
                    method: "PUT",
                    body: data,
                });
                setProfile((prev) =>
                    prev
                        ? {
                              ...prev,
                              trainerName: data.name ?? prev.trainerName,
                              email:
                                  data.email !== undefined
                                      ? data.email
                                      : prev.email,
                          }
                        : prev
                );
                return {
                    success: true,
                    message: "Profile updated successfully",
                    data: null,
                };
            } catch (error: unknown) {
                return {
                    success: false,
                    message: toMessage(error, "Failed to update profile"),
                    data: null,
                };
            } finally {
                setUpdatingProfile(false);
            }
        },
        []
    );

    const getBatches = useCallback(async (): Promise<
        StandardResponse<TrainerBatchListItem[]>
    > => {
        setLoadingBatches(true);
        try {
            const res = (await axiosHandler({
                path: `${BASE}/batches`,
                method: "GET",
            })) as TrainerBatchListItem[];
            setBatches(res);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return {
                success: false,
                message: toMessage(error, "Failed to fetch batches"),
                data: null,
            };
        } finally {
            setLoadingBatches(false);
        }
    }, []);

    const getBatchDetails = useCallback(
        async (
            batchId: string
        ): Promise<StandardResponse<TrainerBatchDetail>> => {
            setLoadingBatchDetail(true);
            try {
                const res = (await axiosHandler({
                    path: `${BASE}/batches/${batchId}`,
                    method: "GET",
                })) as TrainerBatchDetail;
                setBatchDetail(res);
                return { success: true, message: null, data: res };
            } catch (error: unknown) {
                return {
                    success: false,
                    message: toMessage(error, "Failed to fetch batch details"),
                    data: null,
                };
            } finally {
                setLoadingBatchDetail(false);
            }
        },
        []
    );

    const getSessions = useCallback(
        async (
            filters?: TrainerSessionFilters
        ): Promise<StandardResponse<TrainerSessionsResult>> => {
            setLoadingSessions(true);
            try {
                const res = (await axiosHandler({
                    path: `${BASE}/sessions`,
                    method: "GET",
                    params: {
                        ...(filters?.month ? { month: filters.month } : {}),
                        ...(filters?.year ? { year: filters.year } : {}),
                        ...(filters?.batchId
                            ? { batchId: filters.batchId }
                            : {}),
                        ...(filters?.status ? { status: filters.status } : {}),
                    },
                })) as TrainerSessionsResult;
                setSessions(res);
                return { success: true, message: null, data: res };
            } catch (error: unknown) {
                return {
                    success: false,
                    message: toMessage(error, "Failed to fetch sessions"),
                    data: null,
                };
            } finally {
                setLoadingSessions(false);
            }
        },
        []
    );

    const getSessionDetails = useCallback(
        async (
            sessionId: string
        ): Promise<StandardResponse<TrainerSessionDetail>> => {
            setLoadingSessionDetail(true);
            try {
                const res = (await axiosHandler({
                    path: `${BASE}/sessions/${sessionId}`,
                    method: "GET",
                })) as TrainerSessionDetail;
                setSessionDetail(res);
                return { success: true, message: null, data: res };
            } catch (error: unknown) {
                return {
                    success: false,
                    message: toMessage(
                        error,
                        "Failed to fetch session details"
                    ),
                    data: null,
                };
            } finally {
                setLoadingSessionDetail(false);
            }
        },
        []
    );

    const startSession = useCallback(
        async (
            sessionId: string,
            sessionLink?: string
        ): Promise<StandardResponse<StartSessionResult>> => {
            setUpdatingSession(true);
            try {
                const res = (await axiosHandler({
                    path: `${BASE}/sessions/${sessionId}/start`,
                    method: "POST",
                    body: sessionLink ? { sessionLink } : {},
                })) as StartSessionResult;
                patchCachedSession(sessionId, {
                    sessionStatus: res.sessionStatus,
                    sessionStartedAt: res.sessionStartedAt,
                    sessionEndedAt: null,
                    sessionLink: res.sessionLink,
                });
                return {
                    success: true,
                    message: "Session started successfully",
                    data: res,
                };
            } catch (error: unknown) {
                return {
                    success: false,
                    message: toMessage(error, "Failed to start session"),
                    data: null,
                };
            } finally {
                setUpdatingSession(false);
            }
        },
        [patchCachedSession]
    );

    const endSession = useCallback(
        async (
            sessionId: string
        ): Promise<StandardResponse<EndSessionResult>> => {
            setUpdatingSession(true);
            try {
                const res = (await axiosHandler({
                    path: `${BASE}/sessions/${sessionId}/end`,
                    method: "POST",
                })) as EndSessionResult;
                patchCachedSession(sessionId, {
                    sessionStatus: res.sessionStatus,
                    sessionStartedAt: res.sessionStartedAt,
                    sessionEndedAt: res.sessionEndedAt,
                    isSessionCompleted: res.isSessionCompleted,
                });
                return {
                    success: true,
                    message: "Session ended successfully",
                    data: res,
                };
            } catch (error: unknown) {
                return {
                    success: false,
                    message: toMessage(error, "Failed to end session"),
                    data: null,
                };
            } finally {
                setUpdatingSession(false);
            }
        },
        [patchCachedSession]
    );

    const markAttendance = useCallback(
        async (
            sessionId: string,
            studentId: string,
            isPresent: boolean
        ): Promise<StandardResponse<MarkAttendanceResult>> => {
            setMarkingAttendance(true);
            try {
                const res = (await axiosHandler({
                    path: `${BASE}/sessions/${sessionId}/attendance`,
                    method: "POST",
                    body: { studentId, isPresent },
                })) as MarkAttendanceResult;

                setSessionDetail((prev) => {
                    if (!prev || prev.batchSessionId !== sessionId) return prev;
                    const students = prev.students.map((student) =>
                        student.studentId === studentId
                            ? {
                                  ...student,
                                  sessionAttendanceId: res.sessionAttendanceId,
                                  isAttendanceMarked: true,
                                  isPresent: res.isPresent,
                                  attendanceMarkedAt: new Date().toISOString(),
                              }
                            : student
                    );
                    return {
                        ...prev,
                        students,
                        presentCount: students.filter((s) => s.isPresent)
                            .length,
                        absentCount: students.filter(
                            (s) => s.isAttendanceMarked && !s.isPresent
                        ).length,
                    };
                });

                return {
                    success: true,
                    message: `Student marked ${
                        isPresent ? "present" : "absent"
                    } successfully`,
                    data: res,
                };
            } catch (error: unknown) {
                return {
                    success: false,
                    message: toMessage(error, "Failed to mark attendance"),
                    data: null,
                };
            } finally {
                setMarkingAttendance(false);
            }
        },
        []
    );

    const getTodaySchedule = useCallback(async (): Promise<
        StandardResponse<TrainerTodayScheduleResult>
    > => {
        setLoadingTodaySchedule(true);
        try {
            const res = (await axiosHandler({
                path: `${BASE}/sessions/today`,
                method: "GET",
            })) as TrainerTodayScheduleResult;
            setTodaySchedule(res);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return {
                success: false,
                message: toMessage(error, "Failed to fetch today's schedule"),
                data: null,
            };
        } finally {
            setLoadingTodaySchedule(false);
        }
    }, []);

    const getSessionStats = useCallback(
        async (
            filters?: TrainerStatsFilters
        ): Promise<StandardResponse<TrainerSessionStats>> => {
            setLoadingSessionStats(true);
            try {
                const res = (await axiosHandler({
                    path: `${BASE}/sessions/stats`,
                    method: "GET",
                    params: {
                        ...(filters?.month ? { month: filters.month } : {}),
                        ...(filters?.year ? { year: filters.year } : {}),
                        ...(filters?.batchId
                            ? { batchId: filters.batchId }
                            : {}),
                    },
                })) as TrainerSessionStats;
                setSessionStats(res);
                return { success: true, message: null, data: res };
            } catch (error: unknown) {
                return {
                    success: false,
                    message: toMessage(error, "Failed to fetch session stats"),
                    data: null,
                };
            } finally {
                setLoadingSessionStats(false);
            }
        },
        []
    );

    const clearBatchDetail = useCallback(() => setBatchDetail(null), []);
    const clearSessionDetail = useCallback(() => setSessionDetail(null), []);

    const value = useMemo<TrainerContextValue>(
        () => ({
            profile,
            batches,
            batchDetail,
            sessions,
            sessionDetail,
            todaySchedule,
            sessionStats,
            loadingProfile,
            updatingProfile,
            loadingBatches,
            loadingBatchDetail,
            loadingSessions,
            loadingSessionDetail,
            loadingTodaySchedule,
            loadingSessionStats,
            updatingSession,
            markingAttendance,
            getProfile,
            updateProfile,
            getBatches,
            getBatchDetails,
            getSessions,
            getSessionDetails,
            startSession,
            endSession,
            markAttendance,
            getTodaySchedule,
            getSessionStats,
            clearBatchDetail,
            clearSessionDetail,
        }),
        [
            profile,
            batches,
            batchDetail,
            sessions,
            sessionDetail,
            todaySchedule,
            sessionStats,
            loadingProfile,
            updatingProfile,
            loadingBatches,
            loadingBatchDetail,
            loadingSessions,
            loadingSessionDetail,
            loadingTodaySchedule,
            loadingSessionStats,
            updatingSession,
            markingAttendance,
            getProfile,
            updateProfile,
            getBatches,
            getBatchDetails,
            getSessions,
            getSessionDetails,
            startSession,
            endSession,
            markAttendance,
            getTodaySchedule,
            getSessionStats,
            clearBatchDetail,
            clearSessionDetail,
        ]
    );

    return (
        <TrainerContext.Provider value={value}>
            {children}
        </TrainerContext.Provider>
    );
}

export function useTrainer(): TrainerContextValue {
    const ctx = useContext(TrainerContext);
    if (!ctx) throw new Error("useTrainer must be used inside <TrainerProvider>");
    return ctx;
}
