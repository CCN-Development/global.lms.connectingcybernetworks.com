"use client";
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
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

export default function Page() {
    const router = useRouter();

    return (
        <StudentLayout
            header={<StudentHeader />}
        >
            <BirthdayWish />

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 461fr) minmax(0, 603fr)" },
                    alignItems: "start",
                    gap: "24px",
                    pt: { xs: "8px", md: "16px" },
                    pb: "24px",
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: "24px", sm: "32px" }, minWidth: 0 }}>
                    <PerformanceCard />
                    <TodayScheduleCard onJoin={() => router.push("/dashboard/student/batches")} />
                    <UpcomingSessionsList onSeeAll={() => router.push("/dashboard/student/batches")} />
                    <PlayerStatusCard />
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
                    <ActiveMissionBanner onResume={() => router.push("/dashboard/student/my-courses")} />
                    <YourTasks onSeeAll={() => router.push("/dashboard/student/my-courses")} />
                    <UpdatesFeed />
                </Box>
            </Box>
        </StudentLayout>
    )
}