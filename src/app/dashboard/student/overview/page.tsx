"use client";
import StudentLayout from '@/layouts/StudentLayout';
import StudentHeader from '@/layouts/StudentHeader';
import AttendanceCard from '@/components/dashboard/AttendanceCard';
import CCNButton from '@/components/buttons/CCNButton';
import TodaySchedule from '@/components/dashboard/TodaySchedule';
import router from 'next/router';
import NextLesson from '@/components/dashboard/NextLesson';
import UpcomingSessions from '@/components/dashboard/UpcomingSessions';
import Announcements from '@/components/dashboard/Announcements';
import QuickTaskData from '@/components/dashboard/QuickTaskData';

type Props = {}

export default function page({ }: Props) {
    return (
        <StudentLayout
            header={<StudentHeader title={
                <div className='text-lg text-gray-300'>
                    Hi, <span className='font-semibold'>Shivkumar Chauhan</span>
                </div>
            } />}
        >
            <div
                className='grid grid-cols-[1fr_1fr] md:grid-cols-[2fr_3fr_2fr] lg:grid-cols-[2fr_4fr_2fr] xl:grid-cols-[2fr_3fr_2fr_2fr] gap-4 justify-start'
            >
                <AttendanceCard
                    overallProgress={78}
                    items={[
                        { label: "Attendance", value: 78, color: "#e8c547" },
                        { label: "Course Progress", value: 45, color: "#06d6a0" },
                        { label: "Assignments Submissions", value: 80, color: "#0617D6" },
                    ]}
                />
                <div className='flex flex-col gap-4'>
                    <TodaySchedule
                        title="Ethical Hacking & Penetration Testing"
                        startTime="11:00 AM"
                        endTime="1:00 PM"
                        mode="Online"
                        isLive={true}
                        onJoin={() => router.push("/join")}
                    />
                    <UpcomingSessions />
                </div>
                <div className='flex md:flex-col gap-4 col-span-2 md:col-span-1 row-span-2 '>

                    <NextLesson
                        subtitle="Continue where you left off"
                        title="Cisco Certified Network Associate (CCNA)"
                        completionPercent={45}
                        nextUpType="video"
                        nextUpTitle="Subnetting & VLSM Deep Dive"
                        onContinue={() => router.push("/course/ccna")}
                    />
                    <Announcements
                        announcements={[
                            { category: "Classes Update", title: "CCNA Batch B timing shifted to 11 AM from 1st Aug", date: "28th July 2026" },
                            { category: "Latest News", title: "CCN partners with Cisco for exclusive lab access", date: "25th July 2026" },
                            { category: "Blog", title: "Top 5 certifications to land your first cybersecurity job", date: "22nd July 2026" },
                        ]}
                        onSeeAll={() => router.push("/dashboard/student/notifications")}
                    />
                </div>
                <div className='col-span-2'>

                    <QuickTaskData
                        tasks={[
                            {
                                category: "LAB ASSIGNMENT",
                                title: "Subnetting & VLSM Practice Lab",
                                batchName: "CCNA Batch B",
                                dueDate: "27 Jul • 11:59 PM",
                                assignedBy: "Kushal Korde",
                                status: "Overdue",
                                badgeLabel: "Overdue by 2 days",
                                badgeType: "danger",
                            },
                            {
                                category: "MCQ QUIZ",
                                title: "Network Security Fundamentals Quiz",
                                batchName: "Ethical Hacking",
                                dueDate: "31 Jul • 6:00 PM",
                                assignedBy: "Harshit Sharma",
                                status: "Pending",
                                badgeLabel: "2 days left",
                                badgeType: "warning",
                            },
                            {
                                category: "ASSIGNMENT SUBMISSION",
                                title: "Firewall Rules & ACL Configuration",
                                batchName: "CCNA Batch B",
                                dueDate: "4 Aug • 11:59 PM",
                                assignedBy: "Kushal Korde",
                                status: "Pending",
                                badgeLabel: "6 days left",
                                badgeType: "success",
                            },
                        ]}
                        onSort={() => { }}
                        onSeeAll={() => router.push("/dashboard/student/tasks")}
                        onViewDetails={(task) => router.push(`/task/${task.title}`)}
                    />

                </div>
            </div>
        </StudentLayout>
    )
}