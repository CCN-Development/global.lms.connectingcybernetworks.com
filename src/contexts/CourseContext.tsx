"use client";

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from "react";
import axiosHandler from "@/lib/enhanced-axios";
import type { StandardResponse } from "./AuthContext";

/* ================================================================ enums */
// Mirror the VarChar values documented in prisma/schema (course*.prisma, gamification.prisma).

export type ContentStatus = "draft" | "published" | "archived";
export type CourseTheme = "violet" | "crimson" | "amber" | "indigo" | "teal";
export type ProgressionMode = "sequential" | "free";
/** Level-card type; same values as the My Courses `LessonKind`. */
export type CardType = "module" | "video" | "reading" | "quiz" | "lab";
export type LessonKind = "video" | "theory" | "quiz" | "lab";
export type VideoStatus = "pending_upload" | "processing" | "ready" | "error" | "deleted";
export type UploadMethod = "basic_post" | "tus" | "url_copy";
export type QuestionType = "single_choice" | "multiple_choice" | "true_false";
export type RevealMode = "immediate" | "after_submit" | "never";
export type QuizAttemptStatus = "in_progress" | "submitted" | "expired";
export type LabProvider = "external_url" | "managed_vm" | "none";
export type LabVerificationMode = "self_report" | "flag";
export type LabAttemptStatus = "provisioning" | "running" | "completed" | "abandoned" | "expired" | "failed";
export type ProgressStatus = "not_started" | "in_progress" | "completed";
export type EnrollmentStatus = "locked" | "unlocked" | "in_progress" | "completed";
/** Status shown on cards: only the active mission is "Active"; "Upcoming" = purchased but not published yet. */
export type CourseUiStatus = "Active" | "Unlocked" | "Locked" | "Completed" | "Upcoming";
export type AccessSource = "course" | "package" | "batch";
export type XpSource =
    | "lesson_complete"
    | "quiz_score"
    | "quiz_accuracy_bonus"
    | "lab_complete"
    | "badge_reward"
    | "streak_bonus"
    | "goal_achieved"
    | "admin_adjustment";
export type BadgeScope = "global" | "course" | "level";
export type BadgeCriteria =
    | "level_completed"
    | "course_completed"
    | "xp_total"
    | "streak_days"
    | "labs_completed"
    | "quiz_perfect"
    | "quizzes_passed"
    | "no_solution_labs";
export type GoalType = "complete_course" | "reach_level";
export type GoalStatus = "active" | "achieved" | "abandoned" | "replaced";
export type PaceKey = "30m" | "1h" | "1-2h" | "custom";
export type WeekDayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type LeaderboardScope = "batch" | "global";
export type MyCoursesSort = "default" | "levels" | "xp" | "title" | "recent";
export type AssetFolder =
    | "course-emblems"
    | "course-covers"
    | "module-thumbnails"
    | "content-images"
    | "instructors"
    | "badges"
    | "rank-tiers";
export type ImageContentType = "image/png" | "image/jpeg" | "image/jpg" | "image/webp" | "image/gif" | "image/svg+xml";

/** Rich-text blocks for theory lessons and the lab Task / Solution tabs. */
export type ContentBlock =
    | { type: "heading"; text: string }
    | { type: "paragraph"; text: string }
    | { type: "field"; label: string; lines: string[] }
    | { type: "list"; items: string[] }
    | { type: "links"; items: { label: string; href: string }[] }
    | { type: "image"; src: string; alt: string; ratio: number };

/* ======================================================= schema records */
// Raw Prisma rows as returned by the admin API (dates are ISO strings).

export interface CourseTotals {
    totalLevels: number;
    totalModules: number;
    totalLessons: number;
    totalVideos: number;
    totalQuizzes: number;
    totalLabs: number;
    totalXp: number;
    videoDurationSec: number;
    activityDurationSec: number;
}

export interface CourseRecord extends CourseTotals {
    courseId: string;
    courseName: string;
    description: string | null;
    durationInMonths: number | null;
    isCertified: boolean;
    noOfModules: number | null;
    price: number | null;
    slug: string | null;
    shortTitle: string | null;
    titleAccent: string | null;
    tagline: string | null;
    overview: string[];
    theme: CourseTheme;
    emblemUrl: string | null;
    coverUrl: string | null;
    trailerVideoId: string | null;
    estimatedWeeksMin: number | null;
    estimatedWeeksMax: number | null;
    progressionMode: ProgressionMode;
    contentStatus: ContentStatus;
    sortOrder: number;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface InstructorRecord {
    instructorId: string;
    name: string;
    designation: string | null;
    avatarUrl: string | null;
    bio: string | null;
    trainerId: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CourseInstructorLink {
    courseId: string;
    instructorId: string;
    isLead: boolean;
    sortOrder: number;
}

export interface ModuleInstructorLink {
    moduleId: string;
    instructorId: string;
    isLead: boolean;
    sortOrder: number;
}

export interface CourseLevelRecord {
    levelId: string;
    courseId: string;
    levelNo: number;
    title: string;
    description: string | null;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CourseModuleRecord {
    moduleId: string;
    courseId: string;
    levelId: string;
    cardType: CardType;
    title: string;
    titleAccent: string | null;
    overview: string[];
    thumbnailUrl: string | null;
    introVideoId: string | null;
    sortOrder: number;
    isPublished: boolean;
    totalLessons: number;
    taskCount: number;
    totalXp: number;
    videoDurationSec: number;
    activityDurationSec: number;
    createdAt: string;
    updatedAt: string;
}

export interface ModuleSectionRecord {
    sectionId: string;
    moduleId: string;
    eyebrow: string | null;
    title: string;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface LessonRecord {
    lessonId: string;
    courseId: string;
    levelId: string;
    moduleId: string;
    sectionId: string;
    kind: LessonKind;
    title: string;
    sortOrder: number;
    /** Base XP (quiz: XP at 100%, bonus on Quiz; lab: before the solution penalty). */
    xp: number;
    durationSec: number;
    isMandatory: boolean;
    isFreePreview: boolean;
    lessonStatus: ContentStatus;
    videoId: string | null;
    completionThresholdPct: number;
    theoryBlocks: ContentBlock[] | null;
    createdAt: string;
    updatedAt: string;
}

export interface QuizRecord {
    quizId: string;
    lessonId: string;
    title: string;
    introLines: string[];
    timeLimitSec: number | null;
    passingScorePct: number;
    accuracyBonusThresholdPct: number;
    accuracyBonusXp: number;
    maxAttempts: number | null;
    retakeCooldownMin: number | null;
    questionsPerAttempt: number | null;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    revealMode: RevealMode;
    createdAt: string;
    updatedAt: string;
}

export interface QuizOptionRecord {
    optionId: string;
    questionId: string;
    optionText: string;
    isCorrect: boolean;
    sortOrder: number;
}

export interface QuizQuestionRecord {
    questionId: string;
    quizId: string;
    questionType: QuestionType;
    prompt: string;
    imageUrl: string | null;
    explanation: string | null;
    points: number;
    sortOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface QuizQuestionWithOptions extends QuizQuestionRecord {
    options: QuizOptionRecord[];
}

export interface LabRecord {
    labId: string;
    lessonId: string;
    title: string;
    introLines: string[];
    overview: string;
    taskBlocks: ContentBlock[];
    solutionBlocks: ContentBlock[];
    taskCount: number;
    tools: string[];
    solutionPenaltyXp: number;
    provider: LabProvider;
    launchUrl: string | null;
    environmentTemplateId: string | null;
    buildSeconds: number;
    sessionTimeoutMin: number | null;
    verificationMode: LabVerificationMode;
    createdAt: string;
    updatedAt: string;
}

/** Flags are stored hashed; the API only ever returns the label. */
export interface LabFlagSummary {
    flagId: string;
    label: string;
    sortOrder: number;
}

/** Cloudflare Stream asset (rawMeta omitted, sizeBytes converted to number). */
export interface VideoAsset {
    videoId: string;
    streamUid: string;
    title: string;
    fileName: string | null;
    videoStatus: VideoStatus;
    readyToStream: boolean;
    pctComplete: number | null;
    errorReasonCode: string | null;
    errorReasonText: string | null;
    uploadMethod: UploadMethod;
    maxDurationSeconds: number;
    uploadExpiresAt: string | null;
    durationSec: number | null;
    sizeBytes: number | null;
    width: number | null;
    height: number | null;
    thumbnailUrl: string | null;
    thumbnailTimePct: number | null;
    requireSignedUrls: boolean;
    uploadedById: string | null;
    uploadedByRole: string | null;
    lastSyncedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

/** Compact video info embedded in admin course / module / lesson payloads. */
export interface VideoSummary {
    videoId: string;
    streamUid: string;
    title: string;
    videoStatus: VideoStatus;
    readyToStream: boolean;
    durationSec: number | null;
    thumbnailUrl: string | null;
    requireSignedUrls: boolean;
    errorReasonCode: string | null;
}

export interface CourseEnrollmentRecord {
    enrollmentId: string;
    studentId: string;
    courseId: string;
    batchId: string | null;
    accessSource: AccessSource | null;
    enrollmentStatus: EnrollmentStatus;
    isActiveMission: boolean;
    progressPct: number;
    completedLessons: number;
    completedLevels: number;
    completedLabs: number;
    completedQuizzes: number;
    earnedXp: number;
    currentLevelId: string | null;
    lastLessonId: string | null;
    lastXpAt: string | null;
    unlockedAt: string | null;
    startedAt: string | null;
    completedAt: string | null;
    lastActivityAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface LessonProgressRecord {
    progressId: string;
    studentId: string;
    lessonId: string;
    courseId: string;
    levelId: string;
    moduleId: string;
    kind: LessonKind;
    progressStatus: ProgressStatus;
    progressPct: number;
    xpEarned: number;
    attemptsCount: number;
    bestScorePct: number | null;
    timeSpentSec: number;
    lastPositionSec: number;
    maxPositionSec: number;
    watchedSec: number;
    lastHeartbeatAt: string | null;
    solutionUnlockedAt: string | null;
    firstOpenedAt: string | null;
    completedAt: string | null;
    lastActivityAt: string;
}

export interface LearnerLevelTier {
    levelNo: number;
    title: string;
    minXp: number;
    iconUrl: string | null;
    isMilestone: boolean;
    milestoneDescription: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface BadgeRecord {
    badgeId: string;
    code: string;
    name: string;
    description: string | null;
    iconUrl: string | null;
    scope: BadgeScope;
    courseId: string | null;
    levelId: string | null;
    criteriaType: BadgeCriteria;
    criteriaValue: number | null;
    xpReward: number;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface LearningGoalRecord {
    goalId: string;
    studentId: string;
    courseId: string;
    goalType: GoalType;
    targetValue: number;
    baselineValue: number;
    paceKey: PaceKey;
    minutesPerDay: number;
    learningDays: WeekDayKey[];
    timezone: string;
    reminderEnabled: boolean;
    reminderTime: string | null;
    startDate: string;
    projectedDate: string;
    onTrack: boolean;
    goalStatus: GoalStatus;
    achievedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

/* ===================================================== admin responses */

export interface AdminCourseListItem extends CourseRecord {
    enrollmentsCount: number;
    levelsCount: number;
    badgesCount: number;
}

export interface AdminTreeLesson extends LessonRecord {
    video: VideoSummary | null;
    quiz: { quizId: string; accuracyBonusXp: number; timeLimitSec: number | null; _count: { questions: number } } | null;
    lab: { labId: string; provider: LabProvider; verificationMode: LabVerificationMode; _count: { flags: number } } | null;
}

export interface AdminTreeSection extends ModuleSectionRecord {
    lessons: AdminTreeLesson[];
}

export interface AdminTreeModule extends CourseModuleRecord {
    introVideo: VideoSummary | null;
    moduleInstructors: (ModuleInstructorLink & { instructor: { instructorId: string; name: string } })[];
    sections: AdminTreeSection[];
}

export interface AdminTreeLevel extends CourseLevelRecord {
    modules: AdminTreeModule[];
}

/** GET /course-admin/courses/:courseId — everything the course builder needs. */
export interface AdminCourseTree extends CourseRecord {
    trailerVideo: VideoSummary | null;
    courseInstructors: (CourseInstructorLink & { instructor: InstructorRecord })[];
    prerequisites: { courseId: string; requiredCourseId: string; requiredCourse: { courseId: string; courseName: string } }[];
    levels: AdminTreeLevel[];
    _count: { enrollments: number; badges: number };
}

export interface AdminModuleDetail extends CourseModuleRecord {
    level: CourseLevelRecord;
    introVideo: VideoSummary | null;
    moduleInstructors: (ModuleInstructorLink & { instructor: InstructorRecord })[];
    sections: (ModuleSectionRecord & {
        lessons: (LessonRecord & {
            video: VideoSummary | null;
            quiz: { quizId: string; _count: { questions: number } } | null;
            lab: { labId: string } | null;
        })[];
    })[];
}

export interface AdminLessonDetail extends LessonRecord {
    video: VideoSummary | null;
    quiz: (QuizRecord & { questions: QuizQuestionWithOptions[]; _count: { attempts: number } }) | null;
    lab: (LabRecord & { flags: LabFlagSummary[]; _count: { attempts: number } }) | null;
    _count: { lessonProgresses: number };
}

export type CreatedModule = CourseModuleRecord & { sections: ModuleSectionRecord[] };
export type CreatedLesson = LessonRecord & { quiz: QuizRecord | null };
export type LessonWithVideo = LessonRecord & { video: VideoSummary | null };

export interface PublishIssue {
    scope: "course" | "level" | "module" | "lesson";
    id: string;
    title: string;
    message: string;
}

export interface PublishCheckResult {
    canPublish: boolean;
    issues: PublishIssue[];
}

export interface PublishResult {
    courseId: string;
    totals: CourseTotals;
}

export interface InstructorListItem extends InstructorRecord {
    trainer: { trainerId: string; trainerName: string } | null;
    _count: { courseInstructors: number; moduleInstructors: number };
}

export interface VideoUploadTicket {
    videoId: string;
    streamUid: string;
    /** One-time Cloudflare URL — upload the file straight to it (never through our API). */
    uploadURL: string;
    uploadMethod: Exclude<UploadMethod, "url_copy">;
    expiresAt: string;
    instructions: string;
}

export interface VideoListItem extends VideoAsset {
    usageCount: number;
}

export interface VideoListResult {
    page: number;
    pageSize: number;
    total: number;
    videos: VideoListItem[];
}

export interface VideoDetail extends VideoAsset {
    lessons: { lessonId: string; title: string; courseId: string; moduleId: string }[];
    moduleIntros: { moduleId: string; title: string; courseId: string }[];
    courseTrailers: { courseId: string; courseName: string }[];
}

export interface AssetUploadTicket {
    key: string;
    uploadUrl: string;
    method: "PUT";
    headers: { "Content-Type": string };
    /** CDN URL to store on the record once the PUT succeeds. */
    publicUrl: string;
}

export interface AdminBadgeListItem extends BadgeRecord {
    _count: { studentBadges: number };
    course: { courseName: string } | null;
    level: { levelNo: number; title: string } | null;
}

export interface XpAdjustmentResult {
    txnId: string;
    totalXp: number;
    rankLevel: number;
}

export interface CourseStudentRow extends CourseEnrollmentRecord {
    student: { studentId: string; studentName: string; email: string | null; phoneNumber: string; studentPhoto: string | null };
    batch: { batchId: string; batchName: string } | null;
}

export interface CourseStudentsResult {
    page: number;
    pageSize: number;
    total: number;
    students: CourseStudentRow[];
}

export interface QuizAttemptSummary {
    attemptId: string;
    attemptNumber: number;
    attemptStatus: QuizAttemptStatus;
    startedAt: string;
    submittedAt: string | null;
    timeTakenSec: number | null;
    correctCount: number;
    totalQuestions: number;
    scorePct: number;
    passed: boolean;
    xpAwarded: number;
}

export interface StudentCourseProgressResult {
    enrollment: CourseEnrollmentRecord & { batch: { batchName: string } | null };
    levels: {
        levelId: string;
        levelNo: number;
        title: string;
        modules: {
            moduleId: string;
            title: string;
            lessons: {
                lessonId: string;
                title: string;
                kind: LessonKind;
                xp: number;
                lessonStatus: ContentStatus;
                progress: LessonProgressRecord | null;
            }[];
        }[];
    }[];
    quizAttempts: (Omit<QuizAttemptSummary, "timeTakenSec" | "correctCount" | "totalQuestions"> & { lessonId: string })[];
    labAttempts: {
        attemptId: string;
        lessonId: string;
        attemptNumber: number;
        attemptStatus: LabAttemptStatus;
        solutionUsed: boolean;
        accuracyPct: number | null;
        xpAwarded: number;
        startedAt: string;
        completedAt: string | null;
    }[];
}

export interface ResetProgressResult {
    lessonsReset: number;
    xpRemoved: number;
}

export interface CourseAnalytics {
    enrollments: Partial<Record<EnrollmentStatus, number>>;
    averageProgressPct: number;
    averageEarnedXp: number;
    lessonCompletionsByLevel: { levelId: string; levelNo: number; title: string; lessonCompletions: number }[];
    quizzes: { lessonId: string; title: string; attempts: number; averageScorePct: number }[];
    labs: { lessonId: string; title: string; completed: number; withSolution: number; solutionUnlockRatePct: number }[];
    hardestQuestions: { questionId: string; prompt: string; answers: number; correctRatePct: number }[];
}

/* =================================================== student responses */

export interface LevelRef {
    levelId: string;
    levelNo: number;
    title: string;
}

/** Learner rank (RankPanel / CourseSidePanel). */
export interface LearnerRank {
    level: number;
    title: string;
    iconUrl: string | null;
    totalXp: number;
    /** Same as totalXp — the UI labels it "Total Points". */
    totalPoints: number;
    xpToNextLevel: number | null;
    nextLevel: { level: number; title: string; minXp: number } | null;
    totalBadges: number;
    currentStreak: number;
    highestStreak: number;
    batchRank: number | null;
    coursesCompleted: number;
    coursesTotal: number;
    levelsCompleted: number;
    levelsTotal: number;
    labsCompleted: number;
    labsTotal: number;
    nextMilestone: { title: string; description: string; icon: string | null; level: number } | null;
}

/** Card on My Courses (banner + "All Courses" grid). */
export interface MyCourseCard {
    courseId: string;
    slug: string | null;
    title: string;
    shortTitle: string | null;
    titleAccent: string | null;
    tagline: string | null;
    theme: CourseTheme;
    emblemUrl: string | null;
    coverUrl: string | null;
    status: CourseUiStatus;
    enrollmentStatus: EnrollmentStatus;
    isActiveMission: boolean;
    /** 0 - 100 */
    progress: number;
    totalLevels: number;
    totalBadges: number;
    totalXp: number;
    earnedXp: number;
    totalLabs: number;
    totalKnowledgeChecks: number;
    /** "8-10 Weeks" */
    weeks: string | null;
    currentLevel: LevelRef | null;
    /** "LEVEL 1 - Introduction" */
    currentLevelLabel: string | null;
    batchName: string | null;
    lastActivityAt: string | null;
    sortOrder: number;
}

export interface MyCoursesResult {
    activeCourse: MyCourseCard | null;
    courses: MyCourseCard[];
    rank: LearnerRank;
}

/** Poster/availability for a video that needs a signed token to play. */
export interface VideoPreview {
    available: boolean;
    durationSec: number | null;
    /** Only set for unsigned videos; signed ones get a thumbnail from the playback endpoint. */
    posterUrl: string | null;
}

export interface InstructorView {
    instructorId: string;
    name: string;
    designation: string | null;
    avatar: string | null;
    isLead: boolean;
}

export interface ContentBreakdownItem {
    kind: "video" | "test" | "lab";
    label: string;
    totalXp: number;
    xp: number;
    completed: number;
    total: number;
    /** 0 - 100 */
    progress: number;
}

export interface CourseOverview {
    courseId: string;
    slug: string | null;
    title: string;
    shortTitle: string | null;
    titleAccent: string | null;
    tagline: string | null;
    description: string[];
    theme: CourseTheme;
    emblemUrl: string | null;
    coverUrl: string | null;
    isCertified: boolean;
    status: CourseUiStatus;
    enrollmentStatus: EnrollmentStatus;
    isActiveMission: boolean;
    progress: number;
    weeks: string | null;
    progressionMode: ProgressionMode;
    trailer: VideoPreview;
    currentLevel: LevelRef | null;
    currentLevelLabel: string | null;
    stats: {
        earnedXp: number;
        totalXp: number;
        totalLevels: number;
        completedLevels: number;
        totalLabs: number;
        totalKnowledgeChecks: number;
        totalVideos: number;
        totalBadges: number;
        batchRank: number | null;
        videoDurationSec: number;
        activityDurationSec: number;
    };
    content: ContentBreakdownItem[];
    instructors: InstructorView[];
    batch: { batchId: string; batchName: string } | null;
    rank: LearnerRank;
    activeGoal: ActiveGoal | null;
}

/** A card on the Levels tab (module or single-lesson card). */
export interface LevelCardView {
    moduleId: string;
    /** Set for single-lesson cards — open this lesson directly. */
    lessonId: string | null;
    kind: CardType;
    title: string;
    titleAccent: string | null;
    thumbnailUrl: string | null;
    tasks: number;
    durationSec: number;
    xp: number;
    instructor: string | null;
    extraInstructors: number;
    progress: number;
    completed: boolean;
    /** Video cards only: 0 - 100 */
    watched: number | null;
}

export interface LevelView extends LevelRef {
    description: string | null;
    isLocked: boolean;
    progress: number;
    completed: boolean;
    lessons: LevelCardView[];
}

export interface CourseLevelsResult {
    courseId: string;
    levels: LevelView[];
}

export interface ModuleLessonView {
    lessonId: string;
    kind: LessonKind;
    title: string;
    durationSec: number;
    /** Max XP (quiz includes the accuracy bonus). */
    xp: number;
    isMandatory: boolean;
    status: ProgressStatus;
    completed: boolean;
    watched: number | null;
    xpEarned: number;
    video: VideoPreview | null;
    quizId: string | null;
    labId: string | null;
}

export interface ModuleSectionView {
    sectionId: string;
    eyebrow: string | null;
    title: string;
    progress: number;
    lessons: ModuleLessonView[];
}

export interface ModuleView {
    moduleId: string;
    courseId: string;
    kind: CardType;
    title: string;
    titleAccent: string | null;
    description: string[];
    thumbnailUrl: string | null;
    intro: VideoPreview;
    isLocked: boolean;
    level: LevelRef;
    nextLevel: LevelRef | null;
    nextLevelNo: number | null;
    stats: {
        videoDurationSec: number;
        activityDurationSec: number;
        totalXp: number;
        pointsEarned: number;
        completedLessons: number;
        totalLessons: number;
    };
    instructors: InstructorView[];
    sections: ModuleSectionView[];
}

export interface ContinueLearningResult {
    courseCompleted: boolean;
    next: {
        lessonId: string;
        kind: LessonKind;
        title: string;
        moduleId: string;
        levelId: string;
        cardType: CardType;
        moduleTitle: string;
    } | null;
}

export interface LessonView {
    lessonId: string;
    kind: LessonKind;
    title: string;
    xp: number;
    durationSec: number;
    courseId: string;
    levelId: string;
    moduleId: string;
    section: { sectionId: string; eyebrow: string | null; title: string };
    module: { moduleId: string; title: string; cardType: CardType };
    level: LevelRef;
    theory: ContentBlock[] | null;
    video: (VideoPreview & { completionThresholdPct: number }) | null;
    progress: {
        status: ProgressStatus;
        progressPct: number;
        xpEarned: number;
        lastPositionSec: number;
        completedAt: string | null;
    };
}

/** Signed Cloudflare Stream playback (HLS / DASH / iframe / @cloudflare/stream-react `src = token ?? playbackId`). */
export interface PlaybackInfo {
    videoId: string;
    signed: boolean;
    token: string | null;
    playbackId: string;
    hlsUrl: string;
    dashUrl: string;
    iframeUrl: string;
    thumbnailUrl: string;
    durationSec: number | null;
    expiresAt: string | null;
}

export interface LessonPlayback extends PlaybackInfo {
    lessonId: string;
    resumeAtSec: number;
    completionThresholdPct: number;
    progressPct: number;
    completed: boolean;
    /** Send `saveVideoProgress` this often while playing. */
    heartbeatIntervalSec: number;
}

export interface AdminVideoPlayback {
    videoId: string;
    token: string | null;
    playbackId: string;
    hlsUrl: string;
    dashUrl: string;
    iframeUrl: string;
    thumbnailUrl: string;
    durationSec: number | null;
}

export interface EarnedBadge {
    badgeId: string;
    code: string;
    name: string;
    iconUrl: string | null;
    xpReward: number;
}

/** Side effects of a learning event — drive toasts / celebrations. */
export interface ActivityRewards {
    rankUp: { from: number; to: number } | null;
    newBadges: EarnedBadge[];
    levelCompleted: boolean;
    courseCompleted: boolean;
    goalsAchieved: string[];
    totalXp: number;
    courseProgressPct: number;
}

export interface LessonRewards extends ActivityRewards {
    xpAwarded: number;
    completed: boolean;
}

export interface VideoProgressResult extends LessonRewards {
    progressPct: number;
    watchedSec: number;
    lastPositionSec: number;
}

export interface QuizIntro {
    quizId: string;
    lessonId: string;
    title: string;
    lessonTitle: string;
    introLines: string[];
    questionCount: number;
    timeLimitSec: number | null;
    estimateMinutes: number;
    points: number;
    accuracyBonus: { thresholdPct: number; xp: number };
    passingScorePct: number;
    revealMode: RevealMode;
    maxAttempts: number | null;
    attemptsUsed: number;
    attemptsLeft: number | null;
    cooldownUntil: string | null;
    inProgressAttemptId: string | null;
    bestScorePct: number | null;
    xpEarned: number;
    completed: boolean;
}

export interface QuizQuestionView {
    questionId: string;
    questionType: QuestionType;
    prompt: string;
    imageUrl: string | null;
    points: number;
    options: { optionId: string; optionText: string }[];
    /** Present once answered; correctness only when the quiz reveals it. */
    answer: {
        selectedOptionIds: string[];
        isCorrect?: boolean;
        correctOptionIds?: string[];
        explanation?: string | null;
    } | null;
}

export interface QuizAttemptResultSummary {
    correctCount: number;
    totalQuestions: number;
    scorePct: number;
    passed: boolean;
    timeTakenSec: number | null;
    baseXp: number;
    bonusXp: number;
    xpAwarded: number;
}

export interface QuizAttemptView {
    attemptId: string;
    quizId: string;
    attemptNumber: number;
    attemptStatus: QuizAttemptStatus;
    startedAt: string;
    /** Server deadline — drive the timer from `deadlineAt - serverTime`, not the client clock. */
    deadlineAt: string | null;
    serverTime: string;
    timeLimitSec: number | null;
    totalQuestions: number;
    answeredCount: number;
    questions: QuizQuestionView[];
    result?: QuizAttemptResultSummary;
}

export interface QuizAnswerResult {
    questionId: string;
    recorded: true;
    answeredCount: number;
    totalQuestions: number;
    isLast: boolean;
    isCorrect?: boolean;
    correctOptionIds?: string[];
    explanation?: string | null;
}

export interface QuizSubmitResult extends QuizAttemptResultSummary {
    attemptId: string;
    attemptStatus: QuizAttemptStatus;
    /** "Continue to Lab" target in the same section. */
    nextStep: { labLessonId: string; title: string } | null;
    /** null when the attempt had already been submitted. */
    rewards: ActivityRewards | null;
}

export interface LabAttemptView {
    attemptId: string;
    attemptNumber: number;
    attemptStatus: LabAttemptStatus;
    startedAt: string;
    readyAt: string | null;
    expiresAt: string | null;
    completedAt: string | null;
    secondsUntilReady: number;
    /** Only while running. */
    launchUrl: string | null;
    solutionUsed: boolean;
    flagsCaptured: number;
    totalFlags: number;
    timeTakenSec: number | null;
    accuracyPct: number | null;
    xpAwarded: number;
    serverTime: string;
}

export interface LabBrief {
    labId: string;
    lessonId: string;
    title: string;
    lessonTitle: string;
    introLines: string[];
    overview: string;
    taskBlocks: ContentBlock[];
    taskCount: number;
    tools: string[];
    durationSec: number | null;
    points: number;
    solutionPenaltyXp: number;
    buildSeconds: number;
    provider: LabProvider;
    verificationMode: LabVerificationMode;
    totalFlags: number;
    solutionLocked: boolean;
    solutionBlocks: ContentBlock[] | null;
    xpIfCompleted: number;
    activeAttempt: LabAttemptView | null;
    completed: boolean;
    xpEarned: number;
}

export interface LabSolution {
    solutionBlocks: ContentBlock[];
    solutionPenaltyXp: number;
    xpIfCompleted: number;
}

export interface LabFlagResult {
    correct: boolean;
    flagLabel?: string;
    flagsCaptured: number;
    totalFlags: number;
}

export interface LabCompleteResult extends LabAttemptView {
    nextLevel: LevelRef | null;
    rewards: ActivityRewards | null;
}

export interface LeaderboardEntry {
    learnerId: string;
    rank: number;
    name: string;
    batchName: string | null;
    avatar: string | null;
    level: number;
    xp: number;
    points: number;
    badges: number;
}

export interface LeaderboardResult {
    scope: LeaderboardScope;
    currentLearnerId: string;
    entries: LeaderboardEntry[];
    /** The learner's own row (pin it when it's not in `entries`). */
    me: LeaderboardEntry | null;
    batch?: { batchId: string; batchName: string | null; courseId: string } | null;
}

export interface StudentBadgeItem {
    badgeId: string;
    code: string;
    name: string;
    description: string | null;
    iconUrl: string | null;
    scope: BadgeScope;
    courseId: string | null;
    courseLabel: string | null;
    criteriaType: BadgeCriteria;
    criteriaValue: number | null;
    xpReward: number;
    earned: boolean;
    awardedAt: string | null;
}

export interface StudentBadgesResult {
    totalEarned: number;
    badges: StudentBadgeItem[];
}

export interface PaceOption {
    key: PaceKey;
    label: string;
    hint: string;
    minutesPerDay: number;
}

export interface GoalOptions {
    courses: {
        courseId: string;
        title: string;
        label: string;
        emblemUrl: string | null;
        theme: CourseTheme;
        totalLevels: number;
        completedLevels: number;
        progress: number;
        weeks: string | null;
    }[];
    goalTypes: { key: GoalType; title: string; description: string }[];
    paces: PaceOption[];
    weekDays: WeekDayKey[];
    rank: { level: number; title: string; suggestedTargetLevel: number | null; maxLevel: number | null };
    defaults: { goalType: GoalType; courseId: string | null; paceKey: PaceKey; learningDays: WeekDayKey[] };
}

export interface GoalProjection {
    courseId: string;
    courseLabel: string;
    goalType: GoalType;
    targetText: string;
    targetValue: number;
    baselineValue: number;
    paceKey: PaceKey;
    minutesPerDay: number;
    learningDays: WeekDayKey[];
    timezone: string;
    remainingMinutes: number;
    /** YYYY-MM-DD in the learner's timezone */
    startDate: string;
    projectedDate: string;
    daysRemaining: number;
    onTrack: boolean;
}

export interface GoalSaveResult {
    goal: LearningGoalRecord;
    projection: GoalProjection;
}

export interface ActiveGoal {
    goalId: string;
    courseId: string;
    courseLabel: string;
    goalType: GoalType;
    targetValue: number;
    baselineValue: number;
    currentValue: number;
    progressPct: number;
    paceKey: PaceKey;
    minutesPerDay: number;
    learningDays: WeekDayKey[];
    reminderEnabled: boolean;
    reminderTime: string | null;
    startDate: string;
    projectedDate: string;
    onTrack: boolean;
    today: { isLearningDay: boolean; minutesLearned: number; minutesPlanned: number };
    thisWeek: { minutesLearned: number; minutesPlanned: number };
}

/* ========================================================== inputs */
// Mirror src/validators/course.validators.ts on the API.

export interface CourseInput {
    courseName: string;
    description?: string | null;
    durationInMonths?: number | null;
    isCertified?: boolean;
    price?: number | null;
    /** lowercase-with-dashes, used in /my-courses/<slug> */
    slug?: string | null;
    shortTitle?: string | null;
    titleAccent?: string | null;
    tagline?: string | null;
    overview?: string[];
    theme?: CourseTheme;
    emblemUrl?: string | null;
    coverUrl?: string | null;
    estimatedWeeksMin?: number | null;
    estimatedWeeksMax?: number | null;
    progressionMode?: ProgressionMode;
    sortOrder?: number;
}
export type UpdateCourseInput = Partial<CourseInput>;

export interface InstructorInput {
    name: string;
    designation?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
    trainerId?: string | null;
    isActive?: boolean;
}

export interface InstructorLinkInput {
    instructorId: string;
    isLead?: boolean;
    sortOrder?: number;
}

export interface LevelInput {
    title: string;
    description?: string | null;
    isPublished?: boolean;
}

export interface ModuleInput {
    cardType?: CardType;
    title: string;
    titleAccent?: string | null;
    overview?: string[];
    thumbnailUrl?: string | null;
    introVideoId?: string | null;
    isPublished?: boolean;
}

export interface SectionInput {
    eyebrow?: string | null;
    title: string;
}

export interface CreateLessonInput {
    kind: LessonKind;
    title: string;
    xp?: number;
    durationSec?: number;
    isMandatory?: boolean;
    isFreePreview?: boolean;
    /** Create as published (default draft). */
    publish?: boolean;
}

export interface UpdateLessonInput {
    title?: string;
    xp?: number;
    durationSec?: number;
    isMandatory?: boolean;
    isFreePreview?: boolean;
    lessonStatus?: ContentStatus;
}

export interface LessonVideoInput {
    /** null detaches the video. */
    videoId: string | null;
    completionThresholdPct?: number;
}

export interface QuizSettingsInput {
    title?: string | null;
    introLines?: string[];
    timeLimitSec?: number | null;
    passingScorePct?: number;
    accuracyBonusThresholdPct?: number;
    accuracyBonusXp?: number;
    maxAttempts?: number | null;
    retakeCooldownMin?: number | null;
    questionsPerAttempt?: number | null;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    revealMode?: RevealMode;
}

export interface QuestionInput {
    questionType?: QuestionType;
    prompt: string;
    imageUrl?: string | null;
    explanation?: string | null;
    points?: number;
    /** single_choice / true_false: exactly one correct; multiple_choice: at least one. */
    options: { optionText: string; isCorrect?: boolean }[];
}

export interface LabInput {
    title?: string | null;
    introLines?: string[];
    overview: string;
    taskBlocks: ContentBlock[];
    solutionBlocks: ContentBlock[];
    taskCount?: number;
    tools?: string[];
    solutionPenaltyXp?: number;
    provider?: LabProvider;
    launchUrl?: string | null;
    environmentTemplateId?: string | null;
    buildSeconds?: number;
    sessionTimeoutMin?: number | null;
    verificationMode?: LabVerificationMode;
}

export interface LabFlagInput {
    label: string;
    flag: string;
}

export interface VideoUploadInput {
    title: string;
    fileName?: string | null;
    sizeBytes: number;
    maxDurationSeconds?: number;
    /** Force tus (resumable) even for files ≤ 200 MB. */
    resumable?: boolean;
}

export interface VideoImportInput {
    title: string;
    url: string;
}

export interface VideoUpdateInput {
    title?: string;
    /** 0 - 1 */
    thumbnailTimePct?: number;
}

export interface AssetUploadInput {
    folder: AssetFolder;
    fileName: string;
    contentType: ImageContentType;
}

export interface RankTierInput {
    levelNo: number;
    title: string;
    minXp: number;
    iconUrl?: string | null;
    isMilestone?: boolean;
    milestoneDescription?: string | null;
}

export interface BadgeInput {
    code: string;
    name: string;
    description?: string | null;
    iconUrl?: string | null;
    scope?: BadgeScope;
    courseId?: string | null;
    levelId?: string | null;
    criteriaType: BadgeCriteria;
    criteriaValue?: number | null;
    xpReward?: number;
    isActive?: boolean;
    sortOrder?: number;
}

export interface XpAdjustmentInput {
    /** Non-zero; negative to deduct. */
    amount: number;
    note: string;
    courseId?: string | null;
}

export interface AdminCourseFilters {
    status?: ContentStatus;
    q?: string;
}

export interface VideoListFilters {
    status?: VideoStatus;
    q?: string;
    page?: number;
    pageSize?: number;
}

export interface CourseStudentsFilters {
    batchId?: string;
    q?: string;
    page?: number;
    pageSize?: number;
}

export interface VideoProgressInput {
    positionSec: number;
    /** Seconds actually played since the previous heartbeat. */
    watchedDeltaSec: number;
    playbackRate?: number;
    ended?: boolean;
}

export interface QuizAnswerInput {
    questionId: string;
    selectedOptionIds: string[];
}

export interface GoalDraftInput {
    courseId: string;
    goalType: GoalType;
    /** reach_level only; defaults to current rank level + 4. */
    targetValue?: number;
    paceKey: PaceKey;
    /** Required when paceKey is "custom". */
    minutesPerDay?: number;
    learningDays: WeekDayKey[];
    timezone?: string;
    reminderEnabled?: boolean;
    /** "HH:mm" */
    reminderTime?: string | null;
}
export type GoalUpdateInput = Partial<Omit<GoalDraftInput, "courseId" | "goalType">>;

export interface LeaderboardQuery {
    scope?: LeaderboardScope;
    /** Course whose batch to rank (defaults to the active mission). */
    courseId?: string;
    branchId?: string;
    limit?: number;
}

export interface UploadVideoOptions {
    title: string;
    maxDurationSeconds?: number;
    resumable?: boolean;
    /** Attach the uploaded video to this video lesson once uploaded. */
    lessonId?: string;
    /** 0 - 100 */
    onProgress?: (percent: number) => void;
    signal?: AbortSignal;
}

/* ======================================================= context type */

interface CourseContextValue {
    // ── student state
    myCourses: MyCoursesResult | null;
    rank: LearnerRank | null;
    courseOverview: CourseOverview | null;
    courseLevels: CourseLevelsResult | null;
    moduleDetail: ModuleView | null;
    lessonDetail: LessonView | null;
    quizIntro: QuizIntro | null;
    quizAttempt: QuizAttemptView | null;
    labBrief: LabBrief | null;
    labAttempt: LabAttemptView | null;
    leaderboard: LeaderboardResult | null;
    myBadges: StudentBadgesResult | null;
    goalOptions: GoalOptions | null;
    activeGoals: ActiveGoal[];

    loadingMyCourses: boolean;
    loadingCourse: boolean;
    loadingModule: boolean;
    loadingLesson: boolean;
    loadingActivity: boolean;
    loadingLeaderboard: boolean;
    loadingGoals: boolean;

    // ── admin state
    adminCourses: AdminCourseListItem[];
    adminCourse: AdminCourseTree | null;
    adminModule: AdminModuleDetail | null;
    adminLesson: AdminLessonDetail | null;
    videoLibrary: VideoListResult | null;
    instructors: InstructorListItem[];
    rankTiers: LearnerLevelTier[];
    adminBadges: AdminBadgeListItem[];
    courseStudents: CourseStudentsResult | null;

    loadingAdminCourses: boolean;
    loadingAdminCourse: boolean;
    loadingVideos: boolean;
    uploadingVideo: boolean;
    saving: boolean;

    // ── student: courses
    getMyCourses: (sort?: MyCoursesSort) => Promise<StandardResponse<MyCoursesResult>>;
    setActiveMission: (courseId: string) => Promise<StandardResponse<{ courseId: string }>>;
    getMyRank: () => Promise<StandardResponse<LearnerRank>>;
    getMyBadges: () => Promise<StandardResponse<StudentBadgesResult>>;
    getLeaderboard: (query?: LeaderboardQuery) => Promise<StandardResponse<LeaderboardResult>>;
    /** `courseIdOrSlug` accepts the UUID or the slug ("ccna"). */
    getCourseOverview: (courseIdOrSlug: string) => Promise<StandardResponse<CourseOverview>>;
    getCourseLevels: (courseIdOrSlug: string) => Promise<StandardResponse<CourseLevelsResult>>;
    getModule: (courseIdOrSlug: string, moduleId: string) => Promise<StandardResponse<ModuleView>>;
    getContinueLearning: (courseIdOrSlug: string) => Promise<StandardResponse<ContinueLearningResult>>;
    getTrailerPlayback: (courseIdOrSlug: string) => Promise<StandardResponse<PlaybackInfo>>;
    getModuleIntroPlayback: (courseIdOrSlug: string, moduleId: string) => Promise<StandardResponse<PlaybackInfo>>;

    // ── student: lessons
    getLesson: (lessonId: string) => Promise<StandardResponse<LessonView>>;
    getLessonPlayback: (lessonId: string) => Promise<StandardResponse<LessonPlayback>>;
    saveVideoProgress: (lessonId: string, input: VideoProgressInput) => Promise<StandardResponse<VideoProgressResult>>;
    completeLesson: (lessonId: string) => Promise<StandardResponse<LessonRewards>>;

    // ── student: quiz
    getQuizIntro: (lessonId: string) => Promise<StandardResponse<QuizIntro>>;
    startQuizAttempt: (lessonId: string) => Promise<StandardResponse<QuizAttemptView>>;
    listQuizAttempts: (lessonId: string) => Promise<StandardResponse<QuizAttemptSummary[]>>;
    getQuizAttempt: (attemptId: string) => Promise<StandardResponse<QuizAttemptView>>;
    answerQuizQuestion: (attemptId: string, input: QuizAnswerInput) => Promise<StandardResponse<QuizAnswerResult>>;
    submitQuizAttempt: (attemptId: string) => Promise<StandardResponse<QuizSubmitResult>>;

    // ── student: lab
    getLabBrief: (lessonId: string) => Promise<StandardResponse<LabBrief>>;
    unlockLabSolution: (lessonId: string) => Promise<StandardResponse<LabSolution>>;
    launchLab: (lessonId: string) => Promise<StandardResponse<LabAttemptView>>;
    getLabAttempt: (attemptId: string) => Promise<StandardResponse<LabAttemptView>>;
    submitLabFlag: (attemptId: string, flag: string) => Promise<StandardResponse<LabFlagResult>>;
    completeLab: (attemptId: string) => Promise<StandardResponse<LabCompleteResult>>;
    abandonLab: (attemptId: string) => Promise<StandardResponse<{ attemptId: string; attemptStatus: LabAttemptStatus }>>;

    // ── student: goals
    getGoalOptions: () => Promise<StandardResponse<GoalOptions>>;
    previewGoal: (input: GoalDraftInput) => Promise<StandardResponse<GoalProjection>>;
    createGoal: (input: GoalDraftInput) => Promise<StandardResponse<GoalSaveResult>>;
    getActiveGoals: (courseIdOrSlug?: string) => Promise<StandardResponse<ActiveGoal[]>>;
    updateGoal: (goalId: string, input: GoalUpdateInput) => Promise<StandardResponse<GoalSaveResult>>;
    abandonGoal: (goalId: string) => Promise<StandardResponse<null>>;

    // ── admin: courses
    getAdminCourses: (filters?: AdminCourseFilters) => Promise<StandardResponse<AdminCourseListItem[]>>;
    createCourse: (input: CourseInput) => Promise<StandardResponse<CourseRecord>>;
    getAdminCourse: (courseId: string) => Promise<StandardResponse<AdminCourseTree>>;
    updateCourse: (courseId: string, input: UpdateCourseInput) => Promise<StandardResponse<CourseRecord>>;
    deleteCourse: (courseId: string) => Promise<StandardResponse<null>>;
    getPublishCheck: (courseId: string) => Promise<StandardResponse<PublishCheckResult>>;
    publishCourse: (courseId: string) => Promise<StandardResponse<PublishResult>>;
    unpublishCourse: (courseId: string) => Promise<StandardResponse<null>>;
    archiveCourse: (courseId: string) => Promise<StandardResponse<null>>;
    recomputeCourse: (courseId: string) => Promise<StandardResponse<CourseTotals>>;
    setCourseTrailer: (courseId: string, videoId: string | null) => Promise<StandardResponse<null>>;
    setCoursePrerequisites: (
        courseId: string,
        courseIds: string[]
    ) => Promise<StandardResponse<{ courseId: string; requiredCourseIds: string[] }>>;
    setCourseInstructors: (courseId: string, instructors: InstructorLinkInput[]) => Promise<StandardResponse<null>>;

    // ── admin: instructors
    getInstructors: (q?: string) => Promise<StandardResponse<InstructorListItem[]>>;
    createInstructor: (input: InstructorInput) => Promise<StandardResponse<InstructorRecord>>;
    updateInstructor: (instructorId: string, input: Partial<InstructorInput>) => Promise<StandardResponse<InstructorRecord>>;
    deleteInstructor: (instructorId: string) => Promise<StandardResponse<null>>;

    // ── admin: structure
    createLevel: (courseId: string, input: LevelInput) => Promise<StandardResponse<CourseLevelRecord>>;
    updateLevel: (levelId: string, input: Partial<LevelInput>) => Promise<StandardResponse<CourseLevelRecord>>;
    deleteLevel: (levelId: string) => Promise<StandardResponse<null>>;
    reorderLevels: (courseId: string, levelIds: string[]) => Promise<StandardResponse<CourseLevelRecord[]>>;
    createModule: (levelId: string, input: ModuleInput) => Promise<StandardResponse<CreatedModule>>;
    getAdminModule: (moduleId: string) => Promise<StandardResponse<AdminModuleDetail>>;
    updateModule: (moduleId: string, input: Partial<ModuleInput>) => Promise<StandardResponse<CourseModuleRecord>>;
    deleteModule: (moduleId: string) => Promise<StandardResponse<null>>;
    reorderModules: (levelId: string, moduleIds: string[]) => Promise<StandardResponse<string[]>>;
    moveModule: (moduleId: string, levelId: string) => Promise<StandardResponse<null>>;
    setModuleInstructors: (moduleId: string, instructors: InstructorLinkInput[]) => Promise<StandardResponse<null>>;
    createSection: (moduleId: string, input: SectionInput) => Promise<StandardResponse<ModuleSectionRecord>>;
    updateSection: (sectionId: string, input: Partial<SectionInput>) => Promise<StandardResponse<ModuleSectionRecord>>;
    deleteSection: (sectionId: string) => Promise<StandardResponse<null>>;
    reorderSections: (moduleId: string, sectionIds: string[]) => Promise<StandardResponse<string[]>>;
    createLesson: (sectionId: string, input: CreateLessonInput) => Promise<StandardResponse<CreatedLesson>>;
    getAdminLesson: (lessonId: string) => Promise<StandardResponse<AdminLessonDetail>>;
    updateLesson: (lessonId: string, input: UpdateLessonInput) => Promise<StandardResponse<LessonRecord>>;
    /** Archives instead of deleting when students already have progress (`archived: true`). */
    deleteLesson: (lessonId: string) => Promise<StandardResponse<{ archived: boolean }>>;
    reorderLessons: (sectionId: string, lessonIds: string[]) => Promise<StandardResponse<string[]>>;
    moveLesson: (lessonId: string, sectionId: string) => Promise<StandardResponse<null>>;

    // ── admin: lesson content
    setLessonVideo: (lessonId: string, input: LessonVideoInput) => Promise<StandardResponse<LessonWithVideo>>;
    setLessonTheory: (lessonId: string, blocks: ContentBlock[]) => Promise<StandardResponse<LessonRecord>>;
    upsertQuiz: (lessonId: string, input: QuizSettingsInput) => Promise<StandardResponse<QuizRecord>>;
    createQuestion: (quizId: string, input: QuestionInput) => Promise<StandardResponse<QuizQuestionWithOptions>>;
    /** Answered questions are versioned: the returned questionId may differ from the one passed in. */
    updateQuestion: (questionId: string, input: QuestionInput) => Promise<StandardResponse<QuizQuestionWithOptions>>;
    deleteQuestion: (questionId: string) => Promise<StandardResponse<null>>;
    reorderQuestions: (quizId: string, questionIds: string[]) => Promise<StandardResponse<string[]>>;
    importQuestions: (quizId: string, questions: QuestionInput[]) => Promise<StandardResponse<{ imported: number }>>;
    upsertLab: (lessonId: string, input: LabInput) => Promise<StandardResponse<LabRecord>>;
    createLabFlag: (labId: string, input: LabFlagInput) => Promise<StandardResponse<LabFlagSummary>>;
    deleteLabFlag: (flagId: string) => Promise<StandardResponse<null>>;

    // ── admin: video library (Cloudflare Stream)
    createVideoUpload: (input: VideoUploadInput) => Promise<StandardResponse<VideoUploadTicket>>;
    /** Full flow: upload-url → direct browser upload (basic / tus) → mark uploaded → optional attach to lesson. */
    uploadVideo: (file: File, options: UploadVideoOptions) => Promise<StandardResponse<VideoAsset>>;
    importVideoFromUrl: (input: VideoImportInput) => Promise<StandardResponse<VideoAsset>>;
    markVideoUploaded: (videoId: string) => Promise<StandardResponse<VideoAsset>>;
    getVideos: (filters?: VideoListFilters) => Promise<StandardResponse<VideoListResult>>;
    getVideo: (videoId: string) => Promise<StandardResponse<VideoDetail>>;
    updateVideo: (videoId: string, input: VideoUpdateInput) => Promise<StandardResponse<VideoAsset>>;
    syncVideo: (videoId: string) => Promise<StandardResponse<VideoAsset>>;
    getVideoPlayback: (videoId: string) => Promise<StandardResponse<AdminVideoPlayback>>;
    deleteVideo: (videoId: string) => Promise<StandardResponse<null>>;

    // ── admin: images (R2)
    createAssetUploadUrl: (input: AssetUploadInput) => Promise<StandardResponse<AssetUploadTicket>>;
    /** Presign + PUT; resolves with the CDN URL to save on the record. */
    uploadImage: (file: File, folder: AssetFolder) => Promise<StandardResponse<{ publicUrl: string; key: string }>>;

    // ── admin: gamification
    getRankTiers: () => Promise<StandardResponse<LearnerLevelTier[]>>;
    saveRankTiers: (tiers: RankTierInput[]) => Promise<StandardResponse<LearnerLevelTier[]>>;
    getAdminBadges: (courseId?: string) => Promise<StandardResponse<AdminBadgeListItem[]>>;
    createBadge: (input: BadgeInput) => Promise<StandardResponse<BadgeRecord>>;
    updateBadge: (badgeId: string, input: Partial<BadgeInput>) => Promise<StandardResponse<BadgeRecord>>;
    deleteBadge: (badgeId: string) => Promise<StandardResponse<null>>;
    adjustStudentXp: (studentId: string, input: XpAdjustmentInput) => Promise<StandardResponse<XpAdjustmentResult>>;

    // ── admin: student support
    getCourseStudents: (courseId: string, filters?: CourseStudentsFilters) => Promise<StandardResponse<CourseStudentsResult>>;
    getStudentCourseProgress: (courseId: string, studentId: string) => Promise<StandardResponse<StudentCourseProgressResult>>;
    resetStudentProgress: (
        courseId: string,
        studentId: string,
        lessonId?: string | null
    ) => Promise<StandardResponse<ResetProgressResult>>;
    getCourseAnalytics: (courseId: string) => Promise<StandardResponse<CourseAnalytics>>;
}

/* ============================================================ helpers */

const CourseContext = createContext<CourseContextValue | null>(null);

const STUDENT = "/api/v1/student-course";
const ADMIN = "/api/v1/course-admin";
/** Cloudflare Stream tus chunks must be ≥ 5 MB and a multiple of 256 KiB. */
const TUS_CHUNK_BYTES = 50 * 1024 * 1024;
const TUS_MAX_RETRIES = 5;

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
    path: string;
    method?: HttpMethod;
    body?: object;
    params?: object;
}

function toMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
}

/** Wraps axiosHandler into the StandardResponse shape used by every context. */
async function request<T>(options: RequestOptions, fallback: string, successMessage: string | null = null): Promise<StandardResponse<T>> {
    try {
        const data = (await axiosHandler({ method: "GET", ...options })) as T;
        return { success: true, message: successMessage, data: data ?? null };
    } catch (error: unknown) {
        return { success: false, message: toMessage(error, fallback), data: null };
    }
}

/** Drops empty filters so they aren't sent as `?q=`. */
function cleanParams(params?: object): Record<string, string | number> | undefined {
    if (!params) return undefined;
    const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
    return entries.length ? (Object.fromEntries(entries) as Record<string, string | number>) : undefined;
}

const enc = encodeURIComponent;

/* ------------------------------------------------ direct-to-cloud uploads */
// These talk to Cloudflare / R2 directly, so they deliberately never send our auth header.

interface XhrResult {
    status: number;
    header: (name: string) => string | null;
}

function xhrSend(options: {
    url: string;
    method: "POST" | "PUT" | "PATCH" | "HEAD";
    body?: XMLHttpRequestBodyInit | null;
    headers?: Record<string, string>;
    onProgress?: (loadedBytes: number) => void;
    signal?: AbortSignal;
}): Promise<XhrResult> {
    return new Promise((resolve, reject) => {
        if (options.signal?.aborted) return reject(new Error("Upload cancelled"));
        const xhr = new XMLHttpRequest();
        xhr.open(options.method, options.url);
        Object.entries(options.headers ?? {}).forEach(([key, value]) => xhr.setRequestHeader(key, value));
        if (options.onProgress) xhr.upload.onprogress = (event) => options.onProgress!(event.loaded);
        const onAbort = () => xhr.abort();
        options.signal?.addEventListener("abort", onAbort, { once: true });
        const done = () => options.signal?.removeEventListener("abort", onAbort);
        xhr.onload = () => {
            done();
            if (xhr.status >= 200 && xhr.status < 300) resolve({ status: xhr.status, header: (name) => xhr.getResponseHeader(name) });
            else reject(new Error(`Upload failed (HTTP ${xhr.status})`));
        };
        xhr.onerror = () => {
            done();
            reject(new Error("Network error during upload"));
        };
        xhr.onabort = () => {
            done();
            reject(new Error("Upload cancelled"));
        };
        xhr.send(options.body ?? null);
    });
}

const clampPct = (value: number) => Math.max(0, Math.min(100, Math.round(value * 10) / 10));

/** Cloudflare Stream basic upload (≤ 200 MB): multipart POST, field "file". */
async function uploadBasic(url: string, file: File, onProgress?: (pct: number) => void, signal?: AbortSignal) {
    const form = new FormData();
    form.append("file", file);
    await xhrSend({ url, method: "POST", body: form, signal, onProgress: (loaded) => onProgress?.(clampPct((loaded / file.size) * 100)) });
    onProgress?.(100);
}

async function tusOffset(url: string, signal?: AbortSignal): Promise<number> {
    const res = await xhrSend({ url, method: "HEAD", headers: { "Tus-Resumable": "1.0.0" }, signal });
    const offset = Number(res.header("Upload-Offset"));
    return Number.isFinite(offset) ? offset : 0;
}

/** Minimal resumable tus 1.0 client (PATCH chunks, re-sync offset with HEAD and back off on failure). */
async function uploadTus(url: string, file: File, onProgress?: (pct: number) => void, signal?: AbortSignal) {
    let offset = await tusOffset(url, signal).catch(() => 0);
    let failures = 0;
    while (offset < file.size) {
        const start = offset;
        const chunk = file.slice(start, start + TUS_CHUNK_BYTES);
        try {
            const res = await xhrSend({
                url,
                method: "PATCH",
                body: chunk,
                signal,
                headers: {
                    "Tus-Resumable": "1.0.0",
                    "Upload-Offset": String(start),
                    "Content-Type": "application/offset+octet-stream",
                },
                onProgress: (loaded) => onProgress?.(clampPct(((start + loaded) / file.size) * 100)),
            });
            const next = Number(res.header("Upload-Offset"));
            offset = Number.isFinite(next) && next > start ? next : start + chunk.size;
            failures = 0;
        } catch (error) {
            if (signal?.aborted || ++failures > TUS_MAX_RETRIES) throw error;
            await new Promise((r) => setTimeout(r, Math.min(30_000, 1000 * 2 ** failures)));
            offset = await tusOffset(url, signal).catch(() => start);
        }
    }
    onProgress?.(100);
}

/* ---------------------------------------------------- local state patches */

function patchModuleLesson(module: ModuleView | null, lessonId: string, patch: Partial<ModuleLessonView>): ModuleView | null {
    if (!module) return module;
    let touched = false;
    const sections = module.sections.map((section) => {
        if (!section.lessons.some((l) => l.lessonId === lessonId)) return section;
        touched = true;
        return { ...section, lessons: section.lessons.map((l) => (l.lessonId === lessonId ? { ...l, ...patch } : l)) };
    });
    return touched ? { ...module, sections } : module;
}

/* =========================================================== provider */

export function CourseProvider({ children }: { children: ReactNode }) {
    // ── student state
    const [myCourses, setMyCourses] = useState<MyCoursesResult | null>(null);
    const [rank, setRank] = useState<LearnerRank | null>(null);
    const [courseOverview, setCourseOverview] = useState<CourseOverview | null>(null);
    const [courseLevels, setCourseLevels] = useState<CourseLevelsResult | null>(null);
    const [moduleDetail, setModuleDetail] = useState<ModuleView | null>(null);
    const [lessonDetail, setLessonDetail] = useState<LessonView | null>(null);
    const [quizIntro, setQuizIntro] = useState<QuizIntro | null>(null);
    const [quizAttempt, setQuizAttempt] = useState<QuizAttemptView | null>(null);
    const [labBrief, setLabBrief] = useState<LabBrief | null>(null);
    const [labAttempt, setLabAttempt] = useState<LabAttemptView | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardResult | null>(null);
    const [myBadges, setMyBadges] = useState<StudentBadgesResult | null>(null);
    const [goalOptions, setGoalOptions] = useState<GoalOptions | null>(null);
    const [activeGoals, setActiveGoals] = useState<ActiveGoal[]>([]);

    const [loadingMyCourses, setLoadingMyCourses] = useState(false);
    const [loadingCourse, setLoadingCourse] = useState(false);
    const [loadingModule, setLoadingModule] = useState(false);
    const [loadingLesson, setLoadingLesson] = useState(false);
    const [loadingActivity, setLoadingActivity] = useState(false);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
    const [loadingGoals, setLoadingGoals] = useState(false);

    // ── admin state
    const [adminCourses, setAdminCourses] = useState<AdminCourseListItem[]>([]);
    const [adminCourse, setAdminCourse] = useState<AdminCourseTree | null>(null);
    const [adminModule, setAdminModule] = useState<AdminModuleDetail | null>(null);
    const [adminLesson, setAdminLesson] = useState<AdminLessonDetail | null>(null);
    const [videoLibrary, setVideoLibrary] = useState<VideoListResult | null>(null);
    const [instructors, setInstructors] = useState<InstructorListItem[]>([]);
    const [rankTiers, setRankTiers] = useState<LearnerLevelTier[]>([]);
    const [adminBadges, setAdminBadges] = useState<AdminBadgeListItem[]>([]);
    const [courseStudents, setCourseStudents] = useState<CourseStudentsResult | null>(null);

    const [loadingAdminCourses, setLoadingAdminCourses] = useState(false);
    const [loadingAdminCourse, setLoadingAdminCourse] = useState(false);
    const [loadingVideos, setLoadingVideos] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [saving, setSaving] = useState(false);

    // What is currently on screen, so mutations can silently refresh it.
    const myCoursesSortRef = useRef<MyCoursesSort | null>(null);
    const levelsKeyRef = useRef<string | null>(null);
    const moduleKeyRef = useRef<{ course: string; moduleId: string } | null>(null);
    const quizLessonRef = useRef<string | null>(null);
    const goalsCourseRef = useRef<string | undefined>(undefined);
    const adminCourseIdRef = useRef<string | null>(null);
    const adminModuleIdRef = useRef<string | null>(null);
    const adminLessonIdRef = useRef<string | null>(null);
    const videoFiltersRef = useRef<VideoListFilters | null>(null);
    const instructorQueryRef = useRef<string | null>(null);
    const badgeCourseRef = useRef<string | null>(null);

    /* --------------------------------------------------- silent refreshers */

    const refreshLearningViews = useCallback(async () => {
        const tasks: Promise<void>[] = [];
        const moduleKey = moduleKeyRef.current;
        if (moduleKey) {
            tasks.push(
                request<ModuleView>({ path: `${STUDENT}/courses/${enc(moduleKey.course)}/modules/${moduleKey.moduleId}` }, "").then((res) => {
                    if (res.success && res.data && moduleKeyRef.current?.moduleId === moduleKey.moduleId) setModuleDetail(res.data);
                })
            );
        }
        const levelsKey = levelsKeyRef.current;
        if (levelsKey) {
            tasks.push(
                request<CourseLevelsResult>({ path: `${STUDENT}/courses/${enc(levelsKey)}/levels` }, "").then((res) => {
                    if (res.success && res.data && levelsKeyRef.current === levelsKey) setCourseLevels(res.data);
                })
            );
        }
        await Promise.all(tasks);
    }, []);

    const refreshQuizIntro = useCallback(async () => {
        const lessonId = quizLessonRef.current;
        if (!lessonId) return;
        const res = await request<QuizIntro>({ path: `${STUDENT}/lessons/${lessonId}/quiz` }, "");
        if (res.success && res.data && quizLessonRef.current === lessonId) setQuizIntro(res.data);
    }, []);

    const refreshActiveGoals = useCallback(async () => {
        const res = await request<ActiveGoal[]>(
            { path: `${STUDENT}/goals/active`, params: cleanParams({ courseId: goalsCourseRef.current }) },
            ""
        );
        if (res.success) setActiveGoals(res.data ?? []);
    }, []);

    const refreshMyCourses = useCallback(async () => {
        if (myCoursesSortRef.current === null) return;
        const res = await request<MyCoursesResult>({ path: `${STUDENT}/courses`, params: { sort: myCoursesSortRef.current } }, "");
        if (res.success && res.data) {
            setMyCourses(res.data);
            setRank(res.data.rank);
        }
    }, []);

    /* ================================================ student: courses */

    const getMyCourses = useCallback(async (sort: MyCoursesSort = "default"): Promise<StandardResponse<MyCoursesResult>> => {
        setLoadingMyCourses(true);
        try {
            const res = await request<MyCoursesResult>({ path: `${STUDENT}/courses`, params: { sort } }, "Failed to fetch your courses");
            if (res.success && res.data) {
                myCoursesSortRef.current = sort;
                setMyCourses(res.data);
                setRank(res.data.rank);
            }
            return res;
        } finally {
            setLoadingMyCourses(false);
        }
    }, []);

    const setActiveMission = useCallback(
        async (courseId: string): Promise<StandardResponse<{ courseId: string }>> => {
            setSaving(true);
            try {
                const res = await request<{ courseId: string }>(
                    { path: `${STUDENT}/courses/${enc(courseId)}/active`, method: "PUT" },
                    "Failed to change the active mission",
                    "Active mission updated"
                );
                if (res.success) await refreshMyCourses();
                return res;
            } finally {
                setSaving(false);
            }
        },
        [refreshMyCourses]
    );

    const getMyRank = useCallback(async (): Promise<StandardResponse<LearnerRank>> => {
        const res = await request<LearnerRank>({ path: `${STUDENT}/me/rank` }, "Failed to fetch your rank");
        if (res.success && res.data) setRank(res.data);
        return res;
    }, []);

    const getMyBadges = useCallback(async (): Promise<StandardResponse<StudentBadgesResult>> => {
        const res = await request<StudentBadgesResult>({ path: `${STUDENT}/me/badges` }, "Failed to fetch badges");
        if (res.success && res.data) setMyBadges(res.data);
        return res;
    }, []);

    const getLeaderboard = useCallback(async (query: LeaderboardQuery = {}): Promise<StandardResponse<LeaderboardResult>> => {
        setLoadingLeaderboard(true);
        try {
            const res = await request<LeaderboardResult>(
                { path: `${STUDENT}/leaderboard`, params: cleanParams({ scope: "batch", ...query }) },
                "Failed to fetch the leaderboard"
            );
            if (res.success && res.data) setLeaderboard(res.data);
            return res;
        } finally {
            setLoadingLeaderboard(false);
        }
    }, []);

    const getCourseOverview = useCallback(async (courseIdOrSlug: string): Promise<StandardResponse<CourseOverview>> => {
        setLoadingCourse(true);
        try {
            const res = await request<CourseOverview>({ path: `${STUDENT}/courses/${enc(courseIdOrSlug)}` }, "Failed to fetch the course");
            if (res.success && res.data) {
                setCourseOverview(res.data);
                setRank(res.data.rank);
            }
            return res;
        } finally {
            setLoadingCourse(false);
        }
    }, []);

    const getCourseLevels = useCallback(async (courseIdOrSlug: string): Promise<StandardResponse<CourseLevelsResult>> => {
        setLoadingCourse(true);
        try {
            const res = await request<CourseLevelsResult>({ path: `${STUDENT}/courses/${enc(courseIdOrSlug)}/levels` }, "Failed to fetch levels");
            if (res.success && res.data) {
                levelsKeyRef.current = courseIdOrSlug;
                setCourseLevels(res.data);
            }
            return res;
        } finally {
            setLoadingCourse(false);
        }
    }, []);

    const getModule = useCallback(async (courseIdOrSlug: string, moduleId: string): Promise<StandardResponse<ModuleView>> => {
        setLoadingModule(true);
        try {
            const res = await request<ModuleView>(
                { path: `${STUDENT}/courses/${enc(courseIdOrSlug)}/modules/${moduleId}` },
                "Failed to fetch the module"
            );
            if (res.success && res.data) {
                moduleKeyRef.current = { course: courseIdOrSlug, moduleId };
                setModuleDetail(res.data);
            }
            return res;
        } finally {
            setLoadingModule(false);
        }
    }, []);

    const getContinueLearning = useCallback(
        (courseIdOrSlug: string) =>
            request<ContinueLearningResult>({ path: `${STUDENT}/courses/${enc(courseIdOrSlug)}/continue` }, "Failed to find your next lesson"),
        []
    );

    const getTrailerPlayback = useCallback(
        (courseIdOrSlug: string) =>
            request<PlaybackInfo>({ path: `${STUDENT}/courses/${enc(courseIdOrSlug)}/trailer/playback` }, "Trailer is not available"),
        []
    );

    const getModuleIntroPlayback = useCallback(
        (courseIdOrSlug: string, moduleId: string) =>
            request<PlaybackInfo>(
                { path: `${STUDENT}/courses/${enc(courseIdOrSlug)}/modules/${moduleId}/intro/playback` },
                "Intro video is not available"
            ),
        []
    );

    /* ================================================ student: lessons */

    const getLesson = useCallback(async (lessonId: string): Promise<StandardResponse<LessonView>> => {
        setLoadingLesson(true);
        try {
            const res = await request<LessonView>({ path: `${STUDENT}/lessons/${lessonId}` }, "Failed to open the lesson");
            if (res.success && res.data) setLessonDetail(res.data);
            return res;
        } finally {
            setLoadingLesson(false);
        }
    }, []);

    const getLessonPlayback = useCallback(
        (lessonId: string) => request<LessonPlayback>({ path: `${STUDENT}/lessons/${lessonId}/playback` }, "Video is not available"),
        []
    );

    const saveVideoProgress = useCallback(
        async (lessonId: string, input: VideoProgressInput): Promise<StandardResponse<VideoProgressResult>> => {
            const res = await request<VideoProgressResult>(
                { path: `${STUDENT}/lessons/${lessonId}/video-progress`, method: "POST", body: input },
                "Failed to save video progress"
            );
            const data = res.data;
            if (!res.success || !data) return res;
            setModuleDetail((prev) =>
                patchModuleLesson(prev, lessonId, {
                    watched: data.progressPct,
                    ...(data.completed ? { completed: true, status: "completed" as const } : {}),
                })
            );
            setLessonDetail((prev) =>
                prev?.lessonId === lessonId
                    ? {
                        ...prev,
                        progress: {
                            ...prev.progress,
                            progressPct: data.progressPct,
                            lastPositionSec: data.lastPositionSec,
                            status: data.completed ? "completed" : prev.progress.status === "not_started" ? "in_progress" : prev.progress.status,
                            xpEarned: prev.progress.xpEarned + data.xpAwarded,
                        },
                    }
                    : prev
            );
            // Totals / unlocks only change when XP is credited.
            if (data.xpAwarded > 0) await refreshLearningViews();
            return res;
        },
        [refreshLearningViews]
    );

    const completeLesson = useCallback(
        async (lessonId: string): Promise<StandardResponse<LessonRewards>> => {
            const res = await request<LessonRewards>(
                { path: `${STUDENT}/lessons/${lessonId}/complete`, method: "POST" },
                "Failed to complete the lesson"
            );
            if (res.success && res.data) {
                setModuleDetail((prev) => patchModuleLesson(prev, lessonId, { completed: true, status: "completed" }));
                await refreshLearningViews();
            }
            return res;
        },
        [refreshLearningViews]
    );

    /* =================================================== student: quiz */

    const getQuizIntro = useCallback(async (lessonId: string): Promise<StandardResponse<QuizIntro>> => {
        setLoadingActivity(true);
        try {
            const res = await request<QuizIntro>({ path: `${STUDENT}/lessons/${lessonId}/quiz` }, "Failed to load the quiz");
            if (res.success && res.data) {
                quizLessonRef.current = lessonId;
                setQuizIntro(res.data);
            }
            return res;
        } finally {
            setLoadingActivity(false);
        }
    }, []);

    const startQuizAttempt = useCallback(async (lessonId: string): Promise<StandardResponse<QuizAttemptView>> => {
        setLoadingActivity(true);
        try {
            const res = await request<QuizAttemptView>(
                { path: `${STUDENT}/lessons/${lessonId}/quiz/attempts`, method: "POST" },
                "Failed to start the quiz"
            );
            if (res.success && res.data) setQuizAttempt(res.data);
            return res;
        } finally {
            setLoadingActivity(false);
        }
    }, []);

    const listQuizAttempts = useCallback(
        (lessonId: string) => request<QuizAttemptSummary[]>({ path: `${STUDENT}/lessons/${lessonId}/quiz/attempts` }, "Failed to fetch attempts"),
        []
    );

    const getQuizAttempt = useCallback(async (attemptId: string): Promise<StandardResponse<QuizAttemptView>> => {
        const res = await request<QuizAttemptView>({ path: `${STUDENT}/quiz-attempts/${attemptId}` }, "Failed to fetch the attempt");
        if (res.success && res.data) setQuizAttempt(res.data);
        return res;
    }, []);

    const answerQuizQuestion = useCallback(
        async (attemptId: string, input: QuizAnswerInput): Promise<StandardResponse<QuizAnswerResult>> => {
            const res = await request<QuizAnswerResult>(
                { path: `${STUDENT}/quiz-attempts/${attemptId}/answers`, method: "POST", body: input },
                "Failed to submit the answer"
            );
            const data = res.data;
            if (res.success && data) {
                setQuizAttempt((prev) =>
                    prev?.attemptId === attemptId
                        ? {
                            ...prev,
                            answeredCount: data.answeredCount,
                            questions: prev.questions.map((q) =>
                                q.questionId === input.questionId
                                    ? {
                                        ...q,
                                        answer: {
                                            selectedOptionIds: input.selectedOptionIds,
                                            isCorrect: data.isCorrect,
                                            correctOptionIds: data.correctOptionIds,
                                            explanation: data.explanation,
                                        },
                                    }
                                    : q
                            ),
                        }
                        : prev
                );
            }
            return res;
        },
        []
    );

    const submitQuizAttempt = useCallback(
        async (attemptId: string): Promise<StandardResponse<QuizSubmitResult>> => {
            setLoadingActivity(true);
            try {
                const res = await request<QuizSubmitResult>(
                    { path: `${STUDENT}/quiz-attempts/${attemptId}/submit`, method: "POST" },
                    "Failed to submit the quiz",
                    "Quiz submitted"
                );
                const data = res.data;
                if (res.success && data) {
                    setQuizAttempt((prev) =>
                        prev?.attemptId === attemptId
                            ? {
                                ...prev,
                                attemptStatus: data.attemptStatus,
                                result: {
                                    correctCount: data.correctCount,
                                    totalQuestions: data.totalQuestions,
                                    scorePct: data.scorePct,
                                    passed: data.passed,
                                    timeTakenSec: data.timeTakenSec,
                                    baseXp: data.baseXp,
                                    bonusXp: data.bonusXp,
                                    xpAwarded: data.xpAwarded,
                                },
                            }
                            : prev
                    );
                    await Promise.all([refreshQuizIntro(), refreshLearningViews()]);
                }
                return res;
            } finally {
                setLoadingActivity(false);
            }
        },
        [refreshLearningViews, refreshQuizIntro]
    );

    /* ==================================================== student: lab */

    const getLabBrief = useCallback(async (lessonId: string): Promise<StandardResponse<LabBrief>> => {
        setLoadingActivity(true);
        try {
            const res = await request<LabBrief>({ path: `${STUDENT}/lessons/${lessonId}/lab` }, "Failed to load the lab");
            if (res.success && res.data) {
                setLabBrief(res.data);
                setLabAttempt(res.data.activeAttempt);
            }
            return res;
        } finally {
            setLoadingActivity(false);
        }
    }, []);

    const unlockLabSolution = useCallback(async (lessonId: string): Promise<StandardResponse<LabSolution>> => {
        const res = await request<LabSolution>(
            { path: `${STUDENT}/lessons/${lessonId}/lab/unlock-solution`, method: "POST" },
            "Failed to unlock the solution"
        );
        const data = res.data;
        if (res.success && data) {
            setLabBrief((prev) =>
                prev?.lessonId === lessonId
                    ? { ...prev, solutionLocked: false, solutionBlocks: data.solutionBlocks, xpIfCompleted: data.xpIfCompleted }
                    : prev
            );
            setLabAttempt((prev) => (prev ? { ...prev, solutionUsed: true } : prev));
        }
        return res;
    }, []);

    const launchLab = useCallback(async (lessonId: string): Promise<StandardResponse<LabAttemptView>> => {
        setLoadingActivity(true);
        try {
            const res = await request<LabAttemptView>(
                { path: `${STUDENT}/lessons/${lessonId}/lab/attempts`, method: "POST" },
                "Failed to launch the lab"
            );
            if (res.success && res.data) setLabAttempt(res.data);
            return res;
        } finally {
            setLoadingActivity(false);
        }
    }, []);

    const getLabAttempt = useCallback(async (attemptId: string): Promise<StandardResponse<LabAttemptView>> => {
        const res = await request<LabAttemptView>({ path: `${STUDENT}/lab-attempts/${attemptId}` }, "Failed to fetch the lab status");
        if (res.success && res.data) setLabAttempt(res.data);
        return res;
    }, []);

    const submitLabFlag = useCallback(async (attemptId: string, flag: string): Promise<StandardResponse<LabFlagResult>> => {
        const res = await request<LabFlagResult>(
            { path: `${STUDENT}/lab-attempts/${attemptId}/flags`, method: "POST", body: { flag } },
            "Failed to submit the flag"
        );
        const data = res.data;
        if (res.success && data) {
            setLabAttempt((prev) => (prev?.attemptId === attemptId ? { ...prev, flagsCaptured: data.flagsCaptured, totalFlags: data.totalFlags } : prev));
        }
        return res;
    }, []);

    const completeLab = useCallback(
        async (attemptId: string): Promise<StandardResponse<LabCompleteResult>> => {
            setLoadingActivity(true);
            try {
                const res = await request<LabCompleteResult>(
                    { path: `${STUDENT}/lab-attempts/${attemptId}/complete`, method: "POST" },
                    "Failed to complete the lab",
                    "Lab completed"
                );
                const data = res.data;
                if (res.success && data) {
                    const { nextLevel: _nextLevel, rewards: _rewards, ...attempt } = data;
                    setLabAttempt(attempt);
                    setLabBrief((prev) => (prev ? { ...prev, completed: true, activeAttempt: null, xpEarned: prev.xpEarned + data.xpAwarded } : prev));
                    await refreshLearningViews();
                }
                return res;
            } finally {
                setLoadingActivity(false);
            }
        },
        [refreshLearningViews]
    );

    const abandonLab = useCallback(
        async (attemptId: string): Promise<StandardResponse<{ attemptId: string; attemptStatus: LabAttemptStatus }>> => {
            const res = await request<{ attemptId: string; attemptStatus: LabAttemptStatus }>(
                { path: `${STUDENT}/lab-attempts/${attemptId}/abandon`, method: "POST" },
                "Failed to stop the lab"
            );
            if (res.success) {
                setLabAttempt((prev) => (prev?.attemptId === attemptId ? { ...prev, attemptStatus: "abandoned", launchUrl: null } : prev));
                setLabBrief((prev) => (prev ? { ...prev, activeAttempt: null } : prev));
            }
            return res;
        },
        []
    );

    /* ================================================== student: goals */

    const getGoalOptions = useCallback(async (): Promise<StandardResponse<GoalOptions>> => {
        setLoadingGoals(true);
        try {
            const res = await request<GoalOptions>({ path: `${STUDENT}/goals/options` }, "Failed to load goal options");
            if (res.success && res.data) setGoalOptions(res.data);
            return res;
        } finally {
            setLoadingGoals(false);
        }
    }, []);

    const previewGoal = useCallback(
        (input: GoalDraftInput) =>
            request<GoalProjection>({ path: `${STUDENT}/goals/preview`, method: "POST", body: input }, "Failed to project the goal"),
        []
    );

    const createGoal = useCallback(
        async (input: GoalDraftInput): Promise<StandardResponse<GoalSaveResult>> => {
            setSaving(true);
            try {
                const res = await request<GoalSaveResult>(
                    { path: `${STUDENT}/goals`, method: "POST", body: input },
                    "Failed to save the goal",
                    "Goal saved"
                );
                if (res.success) await refreshActiveGoals();
                return res;
            } finally {
                setSaving(false);
            }
        },
        [refreshActiveGoals]
    );

    const getActiveGoals = useCallback(async (courseIdOrSlug?: string): Promise<StandardResponse<ActiveGoal[]>> => {
        setLoadingGoals(true);
        try {
            const res = await request<ActiveGoal[]>(
                { path: `${STUDENT}/goals/active`, params: cleanParams({ courseId: courseIdOrSlug }) },
                "Failed to fetch goals"
            );
            if (res.success) {
                goalsCourseRef.current = courseIdOrSlug;
                setActiveGoals(res.data ?? []);
            }
            return res;
        } finally {
            setLoadingGoals(false);
        }
    }, []);

    const updateGoal = useCallback(
        async (goalId: string, input: GoalUpdateInput): Promise<StandardResponse<GoalSaveResult>> => {
            setSaving(true);
            try {
                const res = await request<GoalSaveResult>(
                    { path: `${STUDENT}/goals/${goalId}`, method: "PUT", body: input },
                    "Failed to update the goal",
                    "Goal updated"
                );
                if (res.success) await refreshActiveGoals();
                return res;
            } finally {
                setSaving(false);
            }
        },
        [refreshActiveGoals]
    );

    const abandonGoal = useCallback(async (goalId: string): Promise<StandardResponse<null>> => {
        setSaving(true);
        try {
            const res = await request<null>({ path: `${STUDENT}/goals/${goalId}`, method: "DELETE" }, "Failed to remove the goal", "Goal removed");
            if (res.success) setActiveGoals((prev) => prev.filter((g) => g.goalId !== goalId));
            return res;
        } finally {
            setSaving(false);
        }
    }, []);

    /* ===================================================== admin helpers */

    const adminCourseFiltersRef = useRef<AdminCourseFilters | null>(null);

    /** Re-fetches whichever admin screens are open (tree / module / lesson / course list). */
    const refreshAdminViews = useCallback(async () => {
        const tasks: Promise<void>[] = [];
        const courseId = adminCourseIdRef.current;
        if (courseId) {
            tasks.push(
                request<AdminCourseTree>({ path: `${ADMIN}/courses/${courseId}` }, "").then((res) => {
                    if (res.success && res.data && adminCourseIdRef.current === courseId) setAdminCourse(res.data);
                })
            );
        }
        const moduleId = adminModuleIdRef.current;
        if (moduleId) {
            tasks.push(
                request<AdminModuleDetail>({ path: `${ADMIN}/modules/${moduleId}` }, "").then((res) => {
                    if (adminModuleIdRef.current !== moduleId) return;
                    if (res.success && res.data) setAdminModule(res.data);
                    else {
                        adminModuleIdRef.current = null;
                        setAdminModule(null);
                    }
                })
            );
        }
        const lessonId = adminLessonIdRef.current;
        if (lessonId) {
            tasks.push(
                request<AdminLessonDetail>({ path: `${ADMIN}/lessons/${lessonId}` }, "").then((res) => {
                    if (adminLessonIdRef.current !== lessonId) return;
                    if (res.success && res.data) setAdminLesson(res.data);
                    else {
                        adminLessonIdRef.current = null;
                        setAdminLesson(null);
                    }
                })
            );
        }
        const listFilters = adminCourseFiltersRef.current;
        if (listFilters) {
            tasks.push(
                request<AdminCourseListItem[]>({ path: `${ADMIN}/courses`, params: cleanParams(listFilters) }, "").then((res) => {
                    if (res.success) setAdminCourses(res.data ?? []);
                })
            );
        }
        await Promise.all(tasks);
    }, []);

    const reloadVideos = useCallback(async () => {
        const filters = videoFiltersRef.current;
        if (!filters) return;
        const res = await request<VideoListResult>({ path: `${ADMIN}/videos`, params: cleanParams(filters) }, "");
        if (res.success && res.data) setVideoLibrary(res.data);
    }, []);

    const reloadInstructors = useCallback(async () => {
        if (instructorQueryRef.current === null) return;
        const res = await request<InstructorListItem[]>(
            { path: `${ADMIN}/instructors`, params: cleanParams({ q: instructorQueryRef.current }) },
            ""
        );
        if (res.success) setInstructors(res.data ?? []);
    }, []);

    const reloadBadges = useCallback(async () => {
        if (badgeCourseRef.current === null) return;
        const res = await request<AdminBadgeListItem[]>(
            { path: `${ADMIN}/badges`, params: cleanParams({ courseId: badgeCourseRef.current }) },
            ""
        );
        if (res.success) setAdminBadges(res.data ?? []);
    }, []);

    /** Runs an admin write with the shared `saving` flag, then refreshes open admin screens. */
    const mutate = useCallback(
        async <T,>(options: RequestOptions, fallback: string, successMessage: string, refresh = true): Promise<StandardResponse<T>> => {
            setSaving(true);
            try {
                const res = await request<T>(options, fallback, successMessage);
                if (res.success && refresh) await refreshAdminViews();
                return res;
            } finally {
                setSaving(false);
            }
        },
        [refreshAdminViews]
    );

    /* ===================================================== admin: courses */

    const getAdminCourses = useCallback(async (filters: AdminCourseFilters = {}): Promise<StandardResponse<AdminCourseListItem[]>> => {
        setLoadingAdminCourses(true);
        try {
            const res = await request<AdminCourseListItem[]>(
                { path: `${ADMIN}/courses`, params: cleanParams(filters) },
                "Failed to fetch courses"
            );
            if (res.success) {
                adminCourseFiltersRef.current = filters;
                setAdminCourses(res.data ?? []);
            }
            return res;
        } finally {
            setLoadingAdminCourses(false);
        }
    }, []);

    const createCourse = useCallback(
        (input: CourseInput) =>
            mutate<CourseRecord>({ path: `${ADMIN}/courses`, method: "POST", body: input }, "Failed to create the course", "Course created"),
        [mutate]
    );

    const getAdminCourse = useCallback(async (courseId: string): Promise<StandardResponse<AdminCourseTree>> => {
        setLoadingAdminCourse(true);
        try {
            const res = await request<AdminCourseTree>({ path: `${ADMIN}/courses/${courseId}` }, "Failed to fetch the course");
            if (res.success && res.data) {
                adminCourseIdRef.current = courseId;
                setAdminCourse(res.data);
            }
            return res;
        } finally {
            setLoadingAdminCourse(false);
        }
    }, []);

    const updateCourse = useCallback(
        (courseId: string, input: UpdateCourseInput) =>
            mutate<CourseRecord>({ path: `${ADMIN}/courses/${courseId}`, method: "PUT", body: input }, "Failed to update the course", "Course updated"),
        [mutate]
    );

    const deleteCourse = useCallback(
        async (courseId: string): Promise<StandardResponse<null>> => {
            // Don't try to refresh a tree that is about to disappear.
            const previous = adminCourseIdRef.current;
            if (previous === courseId) adminCourseIdRef.current = null;
            const res = await mutate<null>({ path: `${ADMIN}/courses/${courseId}`, method: "DELETE" }, "Failed to delete the course", "Course deleted");
            if (res.success) {
                setAdminCourses((prev) => prev.filter((c) => c.courseId !== courseId));
                setAdminCourse((prev) => (prev?.courseId === courseId ? null : prev));
            } else {
                adminCourseIdRef.current = previous;
            }
            return res;
        },
        [mutate]
    );

    const getPublishCheck = useCallback(
        (courseId: string) => request<PublishCheckResult>({ path: `${ADMIN}/courses/${courseId}/publish-check` }, "Failed to check the course"),
        []
    );

    const publishCourse = useCallback(
        (courseId: string) =>
            mutate<PublishResult>({ path: `${ADMIN}/courses/${courseId}/publish`, method: "POST" }, "Failed to publish the course", "Course published"),
        [mutate]
    );

    const unpublishCourse = useCallback(
        (courseId: string) =>
            mutate<null>({ path: `${ADMIN}/courses/${courseId}/unpublish`, method: "POST" }, "Failed to unpublish the course", "Course moved to draft"),
        [mutate]
    );

    const archiveCourse = useCallback(
        (courseId: string) =>
            mutate<null>({ path: `${ADMIN}/courses/${courseId}/archive`, method: "POST" }, "Failed to archive the course", "Course archived"),
        [mutate]
    );

    const recomputeCourse = useCallback(
        (courseId: string) =>
            mutate<CourseTotals>({ path: `${ADMIN}/courses/${courseId}/recompute`, method: "POST" }, "Failed to recompute totals", "Totals recomputed"),
        [mutate]
    );

    const setCourseTrailer = useCallback(
        (courseId: string, videoId: string | null) =>
            mutate<null>(
                { path: `${ADMIN}/courses/${courseId}/trailer`, method: "PUT", body: { videoId } },
                "Failed to update the trailer",
                "Trailer updated"
            ),
        [mutate]
    );

    const setCoursePrerequisites = useCallback(
        (courseId: string, courseIds: string[]) =>
            mutate<{ courseId: string; requiredCourseIds: string[] }>(
                { path: `${ADMIN}/courses/${courseId}/prerequisites`, method: "PUT", body: { courseIds } },
                "Failed to update prerequisites",
                "Prerequisites updated"
            ),
        [mutate]
    );

    const setCourseInstructors = useCallback(
        (courseId: string, links: InstructorLinkInput[]) =>
            mutate<null>(
                { path: `${ADMIN}/courses/${courseId}/instructors`, method: "PUT", body: { instructors: links } },
                "Failed to update instructors",
                "Instructors updated"
            ),
        [mutate]
    );

    /* ================================================= admin: instructors */

    const getInstructors = useCallback(async (q = ""): Promise<StandardResponse<InstructorListItem[]>> => {
        const res = await request<InstructorListItem[]>({ path: `${ADMIN}/instructors`, params: cleanParams({ q }) }, "Failed to fetch instructors");
        if (res.success) {
            instructorQueryRef.current = q;
            setInstructors(res.data ?? []);
        }
        return res;
    }, []);

    const createInstructor = useCallback(
        async (input: InstructorInput): Promise<StandardResponse<InstructorRecord>> => {
            const res = await mutate<InstructorRecord>(
                { path: `${ADMIN}/instructors`, method: "POST", body: input },
                "Failed to create the instructor",
                "Instructor created",
                false
            );
            if (res.success) await reloadInstructors();
            return res;
        },
        [mutate, reloadInstructors]
    );

    const updateInstructor = useCallback(
        async (instructorId: string, input: Partial<InstructorInput>): Promise<StandardResponse<InstructorRecord>> => {
            const res = await mutate<InstructorRecord>(
                { path: `${ADMIN}/instructors/${instructorId}`, method: "PUT", body: input },
                "Failed to update the instructor",
                "Instructor updated"
            );
            if (res.success) await reloadInstructors();
            return res;
        },
        [mutate, reloadInstructors]
    );

    const deleteInstructor = useCallback(
        async (instructorId: string): Promise<StandardResponse<null>> => {
            const res = await mutate<null>(
                { path: `${ADMIN}/instructors/${instructorId}`, method: "DELETE" },
                "Failed to delete the instructor",
                "Instructor deleted"
            );
            if (res.success) setInstructors((prev) => prev.filter((i) => i.instructorId !== instructorId));
            return res;
        },
        [mutate]
    );

    /* ================================================== admin: structure */

    const createLevel = useCallback(
        (courseId: string, input: LevelInput) =>
            mutate<CourseLevelRecord>({ path: `${ADMIN}/courses/${courseId}/levels`, method: "POST", body: input }, "Failed to create the level", "Level created"),
        [mutate]
    );

    const updateLevel = useCallback(
        (levelId: string, input: Partial<LevelInput>) =>
            mutate<CourseLevelRecord>({ path: `${ADMIN}/levels/${levelId}`, method: "PUT", body: input }, "Failed to update the level", "Level updated"),
        [mutate]
    );

    const deleteLevel = useCallback(
        (levelId: string) => mutate<null>({ path: `${ADMIN}/levels/${levelId}`, method: "DELETE" }, "Failed to delete the level", "Level deleted"),
        [mutate]
    );

    const reorderLevels = useCallback(
        (courseId: string, levelIds: string[]) =>
            mutate<CourseLevelRecord[]>(
                { path: `${ADMIN}/courses/${courseId}/levels/reorder`, method: "PUT", body: { levelIds } },
                "Failed to reorder levels",
                "Levels reordered"
            ),
        [mutate]
    );

    const createModule = useCallback(
        (levelId: string, input: ModuleInput) =>
            mutate<CreatedModule>({ path: `${ADMIN}/levels/${levelId}/modules`, method: "POST", body: input }, "Failed to create the module", "Module created"),
        [mutate]
    );

    const getAdminModule = useCallback(async (moduleId: string): Promise<StandardResponse<AdminModuleDetail>> => {
        const res = await request<AdminModuleDetail>({ path: `${ADMIN}/modules/${moduleId}` }, "Failed to fetch the module");
        if (res.success && res.data) {
            adminModuleIdRef.current = moduleId;
            setAdminModule(res.data);
        }
        return res;
    }, []);

    const updateModule = useCallback(
        (moduleId: string, input: Partial<ModuleInput>) =>
            mutate<CourseModuleRecord>({ path: `${ADMIN}/modules/${moduleId}`, method: "PUT", body: input }, "Failed to update the module", "Module updated"),
        [mutate]
    );

    const deleteModule = useCallback(
        async (moduleId: string): Promise<StandardResponse<null>> => {
            // Stop refreshing a module that is about to disappear.
            const previous = adminModuleIdRef.current;
            if (previous === moduleId) adminModuleIdRef.current = null;
            const res = await mutate<null>({ path: `${ADMIN}/modules/${moduleId}`, method: "DELETE" }, "Failed to delete the module", "Module deleted");
            if (res.success) setAdminModule((prev) => (prev?.moduleId === moduleId ? null : prev));
            else adminModuleIdRef.current = previous;
            return res;
        },
        [mutate]
    );

    const reorderModules = useCallback(
        (levelId: string, moduleIds: string[]) =>
            mutate<string[]>(
                { path: `${ADMIN}/levels/${levelId}/modules/reorder`, method: "PUT", body: { moduleIds } },
                "Failed to reorder modules",
                "Modules reordered"
            ),
        [mutate]
    );

    const moveModule = useCallback(
        (moduleId: string, levelId: string) =>
            mutate<null>({ path: `${ADMIN}/modules/${moduleId}/move`, method: "POST", body: { levelId } }, "Failed to move the module", "Module moved"),
        [mutate]
    );

    const setModuleInstructors = useCallback(
        (moduleId: string, links: InstructorLinkInput[]) =>
            mutate<null>(
                { path: `${ADMIN}/modules/${moduleId}/instructors`, method: "PUT", body: { instructors: links } },
                "Failed to update instructors",
                "Instructors updated"
            ),
        [mutate]
    );

    const createSection = useCallback(
        (moduleId: string, input: SectionInput) =>
            mutate<ModuleSectionRecord>(
                { path: `${ADMIN}/modules/${moduleId}/sections`, method: "POST", body: input },
                "Failed to create the section",
                "Section created"
            ),
        [mutate]
    );

    const updateSection = useCallback(
        (sectionId: string, input: Partial<SectionInput>) =>
            mutate<ModuleSectionRecord>({ path: `${ADMIN}/sections/${sectionId}`, method: "PUT", body: input }, "Failed to update the section", "Section updated"),
        [mutate]
    );

    const deleteSection = useCallback(
        (sectionId: string) => mutate<null>({ path: `${ADMIN}/sections/${sectionId}`, method: "DELETE" }, "Failed to delete the section", "Section deleted"),
        [mutate]
    );

    const reorderSections = useCallback(
        (moduleId: string, sectionIds: string[]) =>
            mutate<string[]>(
                { path: `${ADMIN}/modules/${moduleId}/sections/reorder`, method: "PUT", body: { sectionIds } },
                "Failed to reorder sections",
                "Sections reordered"
            ),
        [mutate]
    );

    const createLesson = useCallback(
        (sectionId: string, input: CreateLessonInput) =>
            mutate<CreatedLesson>({ path: `${ADMIN}/sections/${sectionId}/lessons`, method: "POST", body: input }, "Failed to create the lesson", "Lesson created"),
        [mutate]
    );

    const getAdminLesson = useCallback(async (lessonId: string): Promise<StandardResponse<AdminLessonDetail>> => {
        const res = await request<AdminLessonDetail>({ path: `${ADMIN}/lessons/${lessonId}` }, "Failed to fetch the lesson");
        if (res.success && res.data) {
            adminLessonIdRef.current = lessonId;
            setAdminLesson(res.data);
        }
        return res;
    }, []);

    const updateLesson = useCallback(
        (lessonId: string, input: UpdateLessonInput) =>
            mutate<LessonRecord>({ path: `${ADMIN}/lessons/${lessonId}`, method: "PUT", body: input }, "Failed to update the lesson", "Lesson updated"),
        [mutate]
    );

    const deleteLesson = useCallback(
        async (lessonId: string): Promise<StandardResponse<{ archived: boolean }>> => {
            // A deleted lesson can't be refreshed; an archived one still can.
            const previous = adminLessonIdRef.current;
            if (previous === lessonId) adminLessonIdRef.current = null;
            const res = await mutate<{ archived: boolean }>(
                { path: `${ADMIN}/lessons/${lessonId}`, method: "DELETE" },
                "Failed to delete the lesson",
                "Lesson deleted"
            );
            if (!res.success || res.data?.archived) adminLessonIdRef.current = previous;
            else setAdminLesson((prev) => (prev?.lessonId === lessonId ? null : prev));
            return res.success && res.data?.archived ? { ...res, message: "Lesson archived — students already have progress on it" } : res;
        },
        [mutate]
    );

    const reorderLessons = useCallback(
        (sectionId: string, lessonIds: string[]) =>
            mutate<string[]>(
                { path: `${ADMIN}/sections/${sectionId}/lessons/reorder`, method: "PUT", body: { lessonIds } },
                "Failed to reorder lessons",
                "Lessons reordered"
            ),
        [mutate]
    );

    const moveLesson = useCallback(
        (lessonId: string, sectionId: string) =>
            mutate<null>({ path: `${ADMIN}/lessons/${lessonId}/move`, method: "POST", body: { sectionId } }, "Failed to move the lesson", "Lesson moved"),
        [mutate]
    );

    /* ============================================= admin: lesson content */

    const setLessonVideo = useCallback(
        (lessonId: string, input: LessonVideoInput) =>
            mutate<LessonWithVideo>({ path: `${ADMIN}/lessons/${lessonId}/video`, method: "PUT", body: input }, "Failed to attach the video", "Video attached"),
        [mutate]
    );

    const setLessonTheory = useCallback(
        (lessonId: string, blocks: ContentBlock[]) =>
            mutate<LessonRecord>({ path: `${ADMIN}/lessons/${lessonId}/theory`, method: "PUT", body: { blocks } }, "Failed to save the content", "Content saved"),
        [mutate]
    );

    const upsertQuiz = useCallback(
        (lessonId: string, input: QuizSettingsInput) =>
            mutate<QuizRecord>({ path: `${ADMIN}/lessons/${lessonId}/quiz`, method: "PUT", body: input }, "Failed to save the quiz", "Quiz saved"),
        [mutate]
    );

    const createQuestion = useCallback(
        (quizId: string, input: QuestionInput) =>
            mutate<QuizQuestionWithOptions>(
                { path: `${ADMIN}/quizzes/${quizId}/questions`, method: "POST", body: input },
                "Failed to add the question",
                "Question added"
            ),
        [mutate]
    );

    const updateQuestion = useCallback(
        (questionId: string, input: QuestionInput) =>
            mutate<QuizQuestionWithOptions>(
                { path: `${ADMIN}/questions/${questionId}`, method: "PUT", body: input },
                "Failed to update the question",
                "Question updated"
            ),
        [mutate]
    );

    const deleteQuestion = useCallback(
        (questionId: string) => mutate<null>({ path: `${ADMIN}/questions/${questionId}`, method: "DELETE" }, "Failed to remove the question", "Question removed"),
        [mutate]
    );

    const reorderQuestions = useCallback(
        (quizId: string, questionIds: string[]) =>
            mutate<string[]>(
                { path: `${ADMIN}/quizzes/${quizId}/questions/reorder`, method: "PUT", body: { questionIds } },
                "Failed to reorder questions",
                "Questions reordered"
            ),
        [mutate]
    );

    const importQuestions = useCallback(
        async (quizId: string, questions: QuestionInput[]): Promise<StandardResponse<{ imported: number }>> => {
            const res = await mutate<{ imported: number }>(
                { path: `${ADMIN}/quizzes/${quizId}/questions/import`, method: "POST", body: { questions } },
                "Failed to import questions",
                "Questions imported"
            );
            return res.success && res.data ? { ...res, message: `${res.data.imported} questions imported` } : res;
        },
        [mutate]
    );

    const upsertLab = useCallback(
        (lessonId: string, input: LabInput) =>
            mutate<LabRecord>({ path: `${ADMIN}/lessons/${lessonId}/lab`, method: "PUT", body: input }, "Failed to save the lab", "Lab saved"),
        [mutate]
    );

    const createLabFlag = useCallback(
        (labId: string, input: LabFlagInput) =>
            mutate<LabFlagSummary>({ path: `${ADMIN}/labs/${labId}/flags`, method: "POST", body: input }, "Failed to add the flag", "Flag added"),
        [mutate]
    );

    const deleteLabFlag = useCallback(
        (flagId: string) => mutate<null>({ path: `${ADMIN}/flags/${flagId}`, method: "DELETE" }, "Failed to remove the flag", "Flag removed"),
        [mutate]
    );

    /* ============================================== admin: video library */

    const createVideoUpload = useCallback(
        (input: VideoUploadInput) =>
            request<VideoUploadTicket>({ path: `${ADMIN}/videos/upload-url`, method: "POST", body: input }, "Failed to start the upload"),
        []
    );

    const markVideoUploaded = useCallback(
        async (videoId: string): Promise<StandardResponse<VideoAsset>> => {
            const res = await request<VideoAsset>(
                { path: `${ADMIN}/videos/${videoId}/uploaded`, method: "POST" },
                "Upload finished but could not be confirmed",
                "Upload received"
            );
            if (res.success) await reloadVideos();
            return res;
        },
        [reloadVideos]
    );

    const uploadVideo = useCallback(
        async (file: File, options: UploadVideoOptions): Promise<StandardResponse<VideoAsset>> => {
            setUploadingVideo(true);
            try {
                const ticket = await request<VideoUploadTicket>(
                    {
                        path: `${ADMIN}/videos/upload-url`,
                        method: "POST",
                        body: {
                            title: options.title,
                            fileName: file.name,
                            sizeBytes: file.size,
                            maxDurationSeconds: options.maxDurationSeconds,
                            resumable: options.resumable,
                        },
                    },
                    "Failed to start the upload"
                );
                if (!ticket.success || !ticket.data) return { success: false, message: ticket.message, data: null };

                try {
                    if (ticket.data.uploadMethod === "tus") await uploadTus(ticket.data.uploadURL, file, options.onProgress, options.signal);
                    else await uploadBasic(ticket.data.uploadURL, file, options.onProgress, options.signal);
                } catch (error: unknown) {
                    return { success: false, message: toMessage(error, "Video upload failed"), data: null };
                }

                const uploaded = await request<VideoAsset>(
                    { path: `${ADMIN}/videos/${ticket.data.videoId}/uploaded`, method: "POST" },
                    "Upload finished but could not be confirmed"
                );
                if (!uploaded.success || !uploaded.data) return uploaded;

                if (options.lessonId) {
                    const attached = await request<LessonWithVideo>(
                        { path: `${ADMIN}/lessons/${options.lessonId}/video`, method: "PUT", body: { videoId: ticket.data.videoId } },
                        "Video uploaded but could not be attached to the lesson"
                    );
                    if (!attached.success) return { success: false, message: attached.message, data: uploaded.data };
                }

                await Promise.all([refreshAdminViews(), reloadVideos()]);
                return {
                    success: true,
                    message:
                        uploaded.data.videoStatus === "ready"
                            ? "Video uploaded"
                            : "Video uploaded — Cloudflare is processing it, it will be playable shortly",
                    data: uploaded.data,
                };
            } finally {
                setUploadingVideo(false);
            }
        },
        [refreshAdminViews, reloadVideos]
    );

    const importVideoFromUrl = useCallback(
        async (input: VideoImportInput): Promise<StandardResponse<VideoAsset>> => {
            const res = await mutate<VideoAsset>(
                { path: `${ADMIN}/videos/import-url`, method: "POST", body: input },
                "Failed to import the video",
                "Video import started",
                false
            );
            if (res.success) await reloadVideos();
            return res;
        },
        [mutate, reloadVideos]
    );

    const getVideos = useCallback(async (filters: VideoListFilters = {}): Promise<StandardResponse<VideoListResult>> => {
        setLoadingVideos(true);
        try {
            const res = await request<VideoListResult>({ path: `${ADMIN}/videos`, params: cleanParams(filters) }, "Failed to fetch videos");
            if (res.success && res.data) {
                videoFiltersRef.current = filters;
                setVideoLibrary(res.data);
            }
            return res;
        } finally {
            setLoadingVideos(false);
        }
    }, []);

    const getVideo = useCallback(
        (videoId: string) => request<VideoDetail>({ path: `${ADMIN}/videos/${videoId}` }, "Failed to fetch the video"),
        []
    );

    const updateVideo = useCallback(
        async (videoId: string, input: VideoUpdateInput): Promise<StandardResponse<VideoAsset>> => {
            const res = await mutate<VideoAsset>({ path: `${ADMIN}/videos/${videoId}`, method: "PUT", body: input }, "Failed to update the video", "Video updated");
            if (res.success) await reloadVideos();
            return res;
        },
        [mutate, reloadVideos]
    );

    const syncVideo = useCallback(
        async (videoId: string): Promise<StandardResponse<VideoAsset>> => {
            const res = await mutate<VideoAsset>({ path: `${ADMIN}/videos/${videoId}/sync`, method: "POST" }, "Failed to sync the video", "Video synced");
            if (res.success) await reloadVideos();
            return res;
        },
        [mutate, reloadVideos]
    );

    const getVideoPlayback = useCallback(
        (videoId: string) => request<AdminVideoPlayback>({ path: `${ADMIN}/videos/${videoId}/playback` }, "Video is not ready yet"),
        []
    );

    const deleteVideo = useCallback(
        async (videoId: string): Promise<StandardResponse<null>> => {
            const res = await mutate<null>({ path: `${ADMIN}/videos/${videoId}`, method: "DELETE" }, "Failed to delete the video", "Video deleted", false);
            if (res.success) {
                setVideoLibrary((prev) =>
                    prev ? { ...prev, total: Math.max(0, prev.total - 1), videos: prev.videos.filter((v) => v.videoId !== videoId) } : prev
                );
            }
            return res;
        },
        [mutate]
    );

    /* ==================================================== admin: images */

    const createAssetUploadUrl = useCallback(
        (input: AssetUploadInput) =>
            request<AssetUploadTicket>({ path: `${ADMIN}/assets/upload-url`, method: "POST", body: input }, "Failed to prepare the upload"),
        []
    );

    const uploadImage = useCallback(
        async (file: File, folder: AssetFolder): Promise<StandardResponse<{ publicUrl: string; key: string }>> => {
            setSaving(true);
            try {
                const ticket = await request<AssetUploadTicket>(
                    {
                        path: `${ADMIN}/assets/upload-url`,
                        method: "POST",
                        body: { folder, fileName: file.name, contentType: file.type || "image/png" },
                    },
                    "Failed to prepare the upload"
                );
                if (!ticket.success || !ticket.data) return { success: false, message: ticket.message, data: null };
                await xhrSend({ url: ticket.data.uploadUrl, method: "PUT", body: file, headers: ticket.data.headers });
                return { success: true, message: "Image uploaded", data: { publicUrl: ticket.data.publicUrl, key: ticket.data.key } };
            } catch (error: unknown) {
                return { success: false, message: toMessage(error, "Image upload failed"), data: null };
            } finally {
                setSaving(false);
            }
        },
        []
    );

    /* ============================================== admin: gamification */

    const getRankTiers = useCallback(async (): Promise<StandardResponse<LearnerLevelTier[]>> => {
        const res = await request<LearnerLevelTier[]>({ path: `${ADMIN}/rank-tiers` }, "Failed to fetch rank levels");
        if (res.success) setRankTiers(res.data ?? []);
        return res;
    }, []);

    const saveRankTiers = useCallback(
        async (tiers: RankTierInput[]): Promise<StandardResponse<LearnerLevelTier[]>> => {
            const res = await mutate<LearnerLevelTier[]>(
                { path: `${ADMIN}/rank-tiers`, method: "PUT", body: { tiers } },
                "Failed to save rank levels",
                "Rank levels saved",
                false
            );
            if (res.success) await getRankTiers();
            return res;
        },
        [mutate, getRankTiers]
    );

    const getAdminBadges = useCallback(async (courseId?: string): Promise<StandardResponse<AdminBadgeListItem[]>> => {
        const res = await request<AdminBadgeListItem[]>({ path: `${ADMIN}/badges`, params: cleanParams({ courseId }) }, "Failed to fetch badges");
        if (res.success) {
            badgeCourseRef.current = courseId ?? "";
            setAdminBadges(res.data ?? []);
        }
        return res;
    }, []);

    const createBadge = useCallback(
        async (input: BadgeInput): Promise<StandardResponse<BadgeRecord>> => {
            const res = await mutate<BadgeRecord>({ path: `${ADMIN}/badges`, method: "POST", body: input }, "Failed to create the badge", "Badge created", false);
            if (res.success) await reloadBadges();
            return res;
        },
        [mutate, reloadBadges]
    );

    const updateBadge = useCallback(
        async (badgeId: string, input: Partial<BadgeInput>): Promise<StandardResponse<BadgeRecord>> => {
            const res = await mutate<BadgeRecord>(
                { path: `${ADMIN}/badges/${badgeId}`, method: "PUT", body: input },
                "Failed to update the badge",
                "Badge updated",
                false
            );
            if (res.success) await reloadBadges();
            return res;
        },
        [mutate, reloadBadges]
    );

    const deleteBadge = useCallback(
        async (badgeId: string): Promise<StandardResponse<null>> => {
            const res = await mutate<null>({ path: `${ADMIN}/badges/${badgeId}`, method: "DELETE" }, "Failed to delete the badge", "Badge deleted", false);
            if (res.success) setAdminBadges((prev) => prev.filter((b) => b.badgeId !== badgeId));
            return res;
        },
        [mutate]
    );

    const adjustStudentXp = useCallback(
        (studentId: string, input: XpAdjustmentInput) =>
            mutate<XpAdjustmentResult>(
                { path: `${ADMIN}/students/${studentId}/xp-adjustments`, method: "POST", body: input },
                "Failed to adjust XP",
                "XP adjusted",
                false
            ),
        [mutate]
    );

    /* =========================================== admin: student support */

    const getCourseStudents = useCallback(
        async (courseId: string, filters: CourseStudentsFilters = {}): Promise<StandardResponse<CourseStudentsResult>> => {
            const res = await request<CourseStudentsResult>(
                { path: `${ADMIN}/courses/${courseId}/students`, params: cleanParams(filters) },
                "Failed to fetch students"
            );
            if (res.success && res.data) setCourseStudents(res.data);
            return res;
        },
        []
    );

    const getStudentCourseProgress = useCallback(
        (courseId: string, studentId: string) =>
            request<StudentCourseProgressResult>(
                { path: `${ADMIN}/courses/${courseId}/students/${studentId}/progress` },
                "Failed to fetch the student's progress"
            ),
        []
    );

    const resetStudentProgress = useCallback(
        (courseId: string, studentId: string, lessonId?: string | null) =>
            mutate<ResetProgressResult>(
                { path: `${ADMIN}/courses/${courseId}/students/${studentId}/reset`, method: "POST", body: { lessonId: lessonId ?? null } },
                "Failed to reset progress",
                lessonId ? "Lesson progress reset" : "Course progress reset",
                false
            ),
        [mutate]
    );

    const getCourseAnalytics = useCallback(
        (courseId: string) => request<CourseAnalytics>({ path: `${ADMIN}/courses/${courseId}/analytics` }, "Failed to fetch analytics"),
        []
    );

    const value = useMemo<CourseContextValue>(
        () => ({
            myCourses,
            rank,
            courseOverview,
            courseLevels,
            moduleDetail,
            lessonDetail,
            quizIntro,
            quizAttempt,
            labBrief,
            labAttempt,
            leaderboard,
            myBadges,
            goalOptions,
            activeGoals,
            loadingMyCourses,
            loadingCourse,
            loadingModule,
            loadingLesson,
            loadingActivity,
            loadingLeaderboard,
            loadingGoals,
            adminCourses,
            adminCourse,
            adminModule,
            adminLesson,
            videoLibrary,
            instructors,
            rankTiers,
            adminBadges,
            courseStudents,
            loadingAdminCourses,
            loadingAdminCourse,
            loadingVideos,
            uploadingVideo,
            saving,
            getMyCourses,
            setActiveMission,
            getMyRank,
            getMyBadges,
            getLeaderboard,
            getCourseOverview,
            getCourseLevels,
            getModule,
            getContinueLearning,
            getTrailerPlayback,
            getModuleIntroPlayback,
            getLesson,
            getLessonPlayback,
            saveVideoProgress,
            completeLesson,
            getQuizIntro,
            startQuizAttempt,
            listQuizAttempts,
            getQuizAttempt,
            answerQuizQuestion,
            submitQuizAttempt,
            getLabBrief,
            unlockLabSolution,
            launchLab,
            getLabAttempt,
            submitLabFlag,
            completeLab,
            abandonLab,
            getGoalOptions,
            previewGoal,
            createGoal,
            getActiveGoals,
            updateGoal,
            abandonGoal,
            getAdminCourses,
            createCourse,
            getAdminCourse,
            updateCourse,
            deleteCourse,
            getPublishCheck,
            publishCourse,
            unpublishCourse,
            archiveCourse,
            recomputeCourse,
            setCourseTrailer,
            setCoursePrerequisites,
            setCourseInstructors,
            getInstructors,
            createInstructor,
            updateInstructor,
            deleteInstructor,
            createLevel,
            updateLevel,
            deleteLevel,
            reorderLevels,
            createModule,
            getAdminModule,
            updateModule,
            deleteModule,
            reorderModules,
            moveModule,
            setModuleInstructors,
            createSection,
            updateSection,
            deleteSection,
            reorderSections,
            createLesson,
            getAdminLesson,
            updateLesson,
            deleteLesson,
            reorderLessons,
            moveLesson,
            setLessonVideo,
            setLessonTheory,
            upsertQuiz,
            createQuestion,
            updateQuestion,
            deleteQuestion,
            reorderQuestions,
            importQuestions,
            upsertLab,
            createLabFlag,
            deleteLabFlag,
            createVideoUpload,
            uploadVideo,
            importVideoFromUrl,
            markVideoUploaded,
            getVideos,
            getVideo,
            updateVideo,
            syncVideo,
            getVideoPlayback,
            deleteVideo,
            createAssetUploadUrl,
            uploadImage,
            getRankTiers,
            saveRankTiers,
            getAdminBadges,
            createBadge,
            updateBadge,
            deleteBadge,
            adjustStudentXp,
            getCourseStudents,
            getStudentCourseProgress,
            resetStudentProgress,
            getCourseAnalytics,
        }),
        [
            myCourses,
            rank,
            courseOverview,
            courseLevels,
            moduleDetail,
            lessonDetail,
            quizIntro,
            quizAttempt,
            labBrief,
            labAttempt,
            leaderboard,
            myBadges,
            goalOptions,
            activeGoals,
            loadingMyCourses,
            loadingCourse,
            loadingModule,
            loadingLesson,
            loadingActivity,
            loadingLeaderboard,
            loadingGoals,
            adminCourses,
            adminCourse,
            adminModule,
            adminLesson,
            videoLibrary,
            instructors,
            rankTiers,
            adminBadges,
            courseStudents,
            loadingAdminCourses,
            loadingAdminCourse,
            loadingVideos,
            uploadingVideo,
            saving,
            getMyCourses,
            setActiveMission,
            getMyRank,
            getMyBadges,
            getLeaderboard,
            getCourseOverview,
            getCourseLevels,
            getModule,
            getContinueLearning,
            getTrailerPlayback,
            getModuleIntroPlayback,
            getLesson,
            getLessonPlayback,
            saveVideoProgress,
            completeLesson,
            getQuizIntro,
            startQuizAttempt,
            listQuizAttempts,
            getQuizAttempt,
            answerQuizQuestion,
            submitQuizAttempt,
            getLabBrief,
            unlockLabSolution,
            launchLab,
            getLabAttempt,
            submitLabFlag,
            completeLab,
            abandonLab,
            getGoalOptions,
            previewGoal,
            createGoal,
            getActiveGoals,
            updateGoal,
            abandonGoal,
            getAdminCourses,
            createCourse,
            getAdminCourse,
            updateCourse,
            deleteCourse,
            getPublishCheck,
            publishCourse,
            unpublishCourse,
            archiveCourse,
            recomputeCourse,
            setCourseTrailer,
            setCoursePrerequisites,
            setCourseInstructors,
            getInstructors,
            createInstructor,
            updateInstructor,
            deleteInstructor,
            createLevel,
            updateLevel,
            deleteLevel,
            reorderLevels,
            createModule,
            getAdminModule,
            updateModule,
            deleteModule,
            reorderModules,
            moveModule,
            setModuleInstructors,
            createSection,
            updateSection,
            deleteSection,
            reorderSections,
            createLesson,
            getAdminLesson,
            updateLesson,
            deleteLesson,
            reorderLessons,
            moveLesson,
            setLessonVideo,
            setLessonTheory,
            upsertQuiz,
            createQuestion,
            updateQuestion,
            deleteQuestion,
            reorderQuestions,
            importQuestions,
            upsertLab,
            createLabFlag,
            deleteLabFlag,
            createVideoUpload,
            uploadVideo,
            importVideoFromUrl,
            markVideoUploaded,
            getVideos,
            getVideo,
            updateVideo,
            syncVideo,
            getVideoPlayback,
            deleteVideo,
            createAssetUploadUrl,
            uploadImage,
            getRankTiers,
            saveRankTiers,
            getAdminBadges,
            createBadge,
            updateBadge,
            deleteBadge,
            adjustStudentXp,
            getCourseStudents,
            getStudentCourseProgress,
            resetStudentProgress,
            getCourseAnalytics,
        ]
    );

    return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

/** My Courses (student) + course authoring (admin) API state and actions. */
export function useCourse(): CourseContextValue {
    const ctx = useContext(CourseContext);
    if (!ctx) throw new Error("useCourse must be used inside <CourseProvider>");
    return ctx;
}

