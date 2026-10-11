"use client";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { MdOutlineWifiOff } from 'react-icons/md';
import StudentLayout from '@/layouts/StudentLayout';
import StudentHeader from '@/layouts/StudentHeader';
import BirthdayWish from '@/components/profile/BirthdayWish';
import PerformanceCard from '@/components/dashboard/home/PerformanceCard';
import TodayScheduleCard from '@/components/dashboard/home/TodayScheduleCard';
import UpcomingSessionsList from '@/components/dashboard/home/UpcomingSessionsList';
import PlayerStatusCard from '@/components/dashboard/home/PlayerStatusCard';
import ActiveMissionBanner from '@/components/dashboard/home/ActiveMissionBanner';
import YourTasks from '@/components/dashboard/home/YourTasks';
import UpdatesFeed from '@/components/dashboard/home/UpdatesFeed';
import {
    toMission,
    toPerformance,
    toPlayerStats,
    toSchedule,
    toSessions,
    toTasks,
    toUpdates,
    type TaskItem,
    type UpdateItem,
} from '@/components/dashboard/home/data';
import { NoticePanel, SkeletonBlock } from '@/components/courses/my-courses-ui';
import { courseDetailPath, modulePath } from '@/components/courses/course-format';
import { useStudent } from '@/contexts/StudentContext';
import { useCourse } from '@/contexts/CourseContext';

const BATCHES_PATH = "/dashboard/student/batches";
const batchPath = (batchId: string) => `/dashboard/student/batch/${batchId}`;
const UPDATE_PATH = { announcement: "announcements", news: "news", blog: "blogs" } as const;

const GRID_SX = {
    display: "grid",
    gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 461fr) minmax(0, 603fr)" },
    alignItems: "start",
    gap: "24px",
    pt: { xs: "8px", md: "16px" },
    pb: "24px",
} as const;

function DashboardSkeleton() {
    return (
        <Box sx={GRID_SX}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: "24px", sm: "32px" }, minWidth: 0 }}>
                <SkeletonBlock height={240} radius={24} />
                <SkeletonBlock height={260} radius={24} />
                <SkeletonBlock height={220} radius={24} />
                <SkeletonBlock height={320} radius={24} />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
                <SkeletonBlock height={271} />
                <SkeletonBlock height={260} radius={24} />
                <SkeletonBlock height={420} radius={24} />
            </Box>
        </Box>
    );
}

export default function Page() {
    const router = useRouter();
    const { dashboard, loadingDashboard, getDashboard } = useStudent();
    const { getContinueLearning } = useCourse();
    const [error, setError] = useState<string | null>(null);
    const [resuming, setResuming] = useState(false);

    const load = useCallback(async () => {
        const res = await getDashboard();
        setError(res.success ? null : (res.message ?? "Failed to load your dashboard"));
    }, [getDashboard]);

    useEffect(() => {
        void load();
    }, [load]);

    const view = useMemo(() => {
        if (!dashboard) return null;
        return {
            performance: toPerformance(dashboard.performance),
            schedule: toSchedule(dashboard.todaySchedule),
            sessions: toSessions(dashboard.upcomingSessions, dashboard.timezone),
            stats: toPlayerStats(dashboard.playerStatus),
            mission: toMission(dashboard.activeMission),
            tasks: toTasks(dashboard.tasks),
            updates: toUpdates(dashboard.updates),
        };
    }, [dashboard]);

    const joinSchedule = () => {
        const schedule = view?.schedule;
        if (!schedule) return router.push(BATCHES_PATH);
        if (schedule.joinUrl) {
            window.open(schedule.joinUrl, "_blank", "noopener,noreferrer");
            return;
        }
        router.push(batchPath(schedule.batchId));
    };

    /** Jumps straight into the next unfinished lesson of the active mission. */
    const resumeMission = async () => {
        const mission = view?.mission;
        if (!mission || resuming) return;
        setResuming(true);
        try {
            const res = await getContinueLearning(mission.courseId);
            if (!res.success || !res.data) {
                toast.error(res.message ?? "Couldn't find your next lesson");
                return;
            }
            const next = res.data.next;
            router.push(next ? modulePath(mission.courseId, next.moduleId, next.lessonId) : courseDetailPath(mission.courseId, "levels"));
        } finally {
            setResuming(false);
        }
    };

    const openTask = (task: TaskItem) => router.push(`${batchPath(task.batchId)}/assignments/${task.id}`);

    const seeAllTasks = () => {
        const batchId = view?.tasks[0]?.batchId ?? view?.schedule?.batchId;
        router.push(batchId ? `${batchPath(batchId)}/assignments` : BATCHES_PATH);
    };

    const openUpdate = (update: UpdateItem) => {
        const link = update.link;
        if (!link) return;
        if (link.kind === "fees") return router.push("/dashboard/student/profile/fee-details");
        if (link.kind === "batch") return router.push(batchPath(link.batchId));
        router.push(`/dashboard/student/updates/${UPDATE_PATH[link.updateType]}/${link.slug}`);
    };

    const showSkeleton = !view && (loadingDashboard || !error);

    return (
        <StudentLayout
            header={<StudentHeader />}
        >
            <BirthdayWish onClaimed={() => void load()} />

            {showSkeleton && <DashboardSkeleton />}

            {!view && !showSkeleton && (
                <Box sx={{ pt: "16px" }}>
                    <NoticePanel
                        icon={<MdOutlineWifiOff size={28} color="#8C8C8C" />}
                        title="We couldn't load your dashboard"
                        message={error ?? undefined}
                        action={{ label: "Try again", onClick: () => void load() }}
                    />
                </Box>
            )}

            {view && (
                <Box sx={GRID_SX}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: "24px", sm: "32px" }, minWidth: 0 }}>
                        <PerformanceCard overall={view.performance.overall} metrics={view.performance.metrics} />
                        <TodayScheduleCard schedule={view.schedule} onJoin={joinSchedule} />
                        <UpcomingSessionsList sessions={view.sessions} onSeeAll={() => router.push(BATCHES_PATH)} />
                        <PlayerStatusCard stats={view.stats} />
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
                        {view.mission && (
                            <ActiveMissionBanner mission={view.mission} onResume={resumeMission} resuming={resuming} />
                        )}
                        <YourTasks tasks={view.tasks} onSeeAll={seeAllTasks} onViewTask={openTask} />
                        <UpdatesFeed updates={view.updates} onOpen={openUpdate} />
                    </Box>
                </Box>
            )}
        </StudentLayout>
    )
}
