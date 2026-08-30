"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { Box, Button, LinearProgress, Skeleton } from "@mui/material";
import {
    Users,
    UserCheck,
    UserX,
    UserMinus,
    Layers,
    CalendarClock,
    PlayCircle,
    CheckCircle2,
    ArrowRight,
    RefreshCw,
    ClipboardList,
    GraduationCap,
    Inbox,
} from "lucide-react";
import RMDashboardLayout from "@/layouts/RMDashboardLayout";
import { useRM } from "@/contexts/RMContext";
import { BRAND, EmptyState, StatCard, Surface } from "@/components/batches/batch-ui";

/* ============================================================== */
/* Building blocks                                                 */
/* ============================================================== */

function Panel({
    title,
    icon,
    color,
    bg,
    action,
    children,
}: {
    title: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <Surface accent={color} className="p-3">
            <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-gray-100">
                <span
                    className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                    style={{ backgroundColor: bg, color }}
                >
                    {icon}
                </span>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-700">{title}</h4>
                {action && <span className="ml-auto">{action}</span>}
            </div>
            {children}
        </Surface>
    );
}

/** One share of a total, drawn as a labelled bar. */
function BreakdownBar({
    label,
    value,
    total,
    color,
    bg,
    icon,
}: {
    label: string;
    value: number;
    total: number;
    color: string;
    bg: string;
    icon: React.ReactNode;
}) {
    const percent = total === 0 ? 0 : Math.round((value / total) * 100);
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
                <span
                    className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                    style={{ backgroundColor: bg, color }}
                >
                    {icon}
                </span>
                <span className="text-xs font-medium text-gray-600 truncate">{label}</span>
                <span className="ml-auto text-xs font-bold" style={{ color }}>
                    {value}
                </span>
                <span className="text-[10px] text-gray-400 w-8 text-right">{percent}%</span>
            </div>
            <LinearProgress
                variant="determinate"
                value={percent}
                sx={{
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: "#f1f5f9",
                    "& .MuiLinearProgress-bar": { backgroundColor: color, borderRadius: 3 },
                }}
            />
        </div>
    );
}

function QuickLink({
    href,
    label,
    hint,
    color,
    bg,
    icon,
}: {
    href: string;
    label: string;
    hint: string;
    color: string;
    bg: string;
    icon: React.ReactNode;
}) {
    return (
        <Link href={href}>
            <Surface accent={color} className="p-3 h-full">
                <div className="flex items-center gap-2">
                    <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: bg, color }}
                    >
                        {icon}
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-800 truncate">{label}</p>
                        <p className="text-[10px] text-gray-400 truncate">{hint}</p>
                    </div>
                    <ArrowRight size={14} color={color} />
                </div>
            </Surface>
        </Link>
    );
}

/* ============================================================== */
/* Page                                                            */
/* ============================================================== */

export default function RMOverviewPage() {
    const { dashboardStats, loadingDashboardStats, getDashboardStats } = useRM();

    useEffect(() => {
        getDashboardStats();
    }, [getDashboardStats]);

    const students = dashboardStats?.students;
    const batches = dashboardStats?.batches;

    const retentionRate = useMemo(() => {
        if (!students || students.total === 0) return 0;
        return Math.round((students.active / students.total) * 100);
    }, [students]);

    const runningRate = useMemo(() => {
        if (!batches || batches.total === 0) return 0;
        return Math.round(((batches.ongoing + batches.upcoming) / batches.total) * 100);
    }, [batches]);

    return (
        <RMDashboardLayout title="Overview">
            <Box className="flex flex-col gap-2 sm:gap-3 h-full overflow-y-auto">

                {/* Header banner */}
                <Surface accent={BRAND.primary} className="p-3 sm:p-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span
                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: BRAND.primary, color: "#ffffff" }}
                        >
                            <GraduationCap size={20} />
                        </span>
                        <div className="min-w-0 flex-1">
                            <h2 className="text-sm sm:text-base font-bold text-gray-800">Branch Overview</h2>
                            <p className="text-[11px] text-gray-500">
                                Live counters for every student and batch in your branch.
                            </p>
                        </div>
                        <Button
                            onClick={() => getDashboardStats()}
                            disabled={loadingDashboardStats}
                            size="small"
                            variant="outlined"
                            startIcon={<RefreshCw size={13} />}
                            sx={{
                                textTransform: "none",
                                borderRadius: "8px",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                borderColor: BRAND.violet,
                                color: BRAND.violet,
                                "&:hover": { borderColor: BRAND.violet, bgcolor: BRAND.violetBg },
                            }}
                        >
                            Refresh
                        </Button>
                    </div>
                </Surface>

                {loadingDashboardStats && !dashboardStats ? (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: "8px" }} />
                            ))}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
                            <Skeleton variant="rounded" height={220} sx={{ borderRadius: "8px" }} />
                            <Skeleton variant="rounded" height={220} sx={{ borderRadius: "8px" }} />
                        </div>
                    </>
                ) : !dashboardStats || !students || !batches ? (
                    <EmptyState label="Dashboard stats could not be loaded." color={BRAND.rose} />
                ) : (
                    <>
                        {/* Headline counters */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                            <StatCard
                                label="Students"
                                value={students.total}
                                hint={`${students.active} currently active`}
                                color={BRAND.primary}
                                icon={<Users size={16} />}
                            />
                            <StatCard
                                label="Batches"
                                value={batches.total}
                                hint={`${batches.active} active`}
                                color={BRAND.violet}
                                icon={<Layers size={16} />}
                            />
                            <StatCard
                                label="Running now"
                                value={batches.ongoing}
                                hint={`${batches.upcoming} starting soon`}
                                color={BRAND.emerald}
                                icon={<PlayCircle size={16} />}
                            />
                            <StatCard
                                label="Needs attention"
                                value={students.dropped + batches.inactive}
                                hint={`${students.dropped} dropped · ${batches.inactive} inactive batches`}
                                color={BRAND.orange}
                                icon={<Inbox size={16} />}
                            />
                        </div>

                        {/* Breakdowns */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
                            <Panel
                                title="Students"
                                icon={<Users size={13} />}
                                color={BRAND.primary}
                                bg={BRAND.skyBg}
                                action={
                                    <span className="text-[11px] font-semibold" style={{ color: BRAND.primary }}>
                                        {retentionRate}% active
                                    </span>
                                }
                            >
                                {students.total === 0 ? (
                                    <p className="text-xs text-gray-400 py-3 text-center">
                                        No students in this branch yet.
                                    </p>
                                ) : (
                                    <div className="flex flex-col gap-2.5">
                                        <BreakdownBar
                                            label="Active"
                                            value={students.active}
                                            total={students.total}
                                            color={BRAND.emerald}
                                            bg={BRAND.emeraldBg}
                                            icon={<UserCheck size={12} />}
                                        />
                                        <BreakdownBar
                                            label="Inactive"
                                            value={students.inactive}
                                            total={students.total}
                                            color={BRAND.amber}
                                            bg={BRAND.amberBg}
                                            icon={<UserX size={12} />}
                                        />
                                        <BreakdownBar
                                            label="Dropped"
                                            value={students.dropped}
                                            total={students.total}
                                            color={BRAND.rose}
                                            bg={BRAND.roseBg}
                                            icon={<UserMinus size={12} />}
                                        />
                                    </div>
                                )}
                            </Panel>

                            <Panel
                                title="Batches"
                                icon={<Layers size={13} />}
                                color={BRAND.violet}
                                bg={BRAND.violetBg}
                                action={
                                    <span className="text-[11px] font-semibold" style={{ color: BRAND.violet }}>
                                        {runningRate}% live or upcoming
                                    </span>
                                }
                            >
                                {batches.total === 0 ? (
                                    <p className="text-xs text-gray-400 py-3 text-center">
                                        No batches created in this branch yet.
                                    </p>
                                ) : (
                                    <div className="flex flex-col gap-2.5">
                                        <BreakdownBar
                                            label="Ongoing"
                                            value={batches.ongoing}
                                            total={batches.total}
                                            color={BRAND.emerald}
                                            bg={BRAND.emeraldBg}
                                            icon={<PlayCircle size={12} />}
                                        />
                                        <BreakdownBar
                                            label="Upcoming"
                                            value={batches.upcoming}
                                            total={batches.total}
                                            color={BRAND.sky}
                                            bg={BRAND.skyBg}
                                            icon={<CalendarClock size={12} />}
                                        />
                                        <BreakdownBar
                                            label="Completed"
                                            value={batches.completed}
                                            total={batches.total}
                                            color={BRAND.cyan}
                                            bg={BRAND.cyanBg}
                                            icon={<CheckCircle2 size={12} />}
                                        />
                                        <BreakdownBar
                                            label="Inactive"
                                            value={batches.inactive}
                                            total={batches.total}
                                            color={BRAND.rose}
                                            bg={BRAND.roseBg}
                                            icon={<Layers size={12} />}
                                        />
                                    </div>
                                )}
                            </Panel>
                        </div>

                        {/* Quick links */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3">
                            <QuickLink
                                href="/dashboard/rm/student-profiles"
                                label="Student Profiles"
                                hint={`${students.total} students`}
                                color={BRAND.primary}
                                bg={BRAND.skyBg}
                                icon={<Users size={16} />}
                            />
                            <QuickLink
                                href="/dashboard/rm/batches"
                                label="Batches"
                                hint={`${batches.active} active batches`}
                                color={BRAND.violet}
                                bg={BRAND.violetBg}
                                icon={<Layers size={16} />}
                            />
                            <QuickLink
                                href="/dashboard/rm/onboarding-verification"
                                label="Onboarding Verification"
                                hint="Approve new admissions"
                                color={BRAND.emerald}
                                bg={BRAND.emeraldBg}
                                icon={<ClipboardList size={16} />}
                            />
                            <QuickLink
                                href="/dashboard/rm/student-requests"
                                label="Student Requests"
                                hint="Review pending requests"
                                color={BRAND.orange}
                                bg={BRAND.orangeBg}
                                icon={<Inbox size={16} />}
                            />
                        </div>
                    </>
                )}
            </Box>
        </RMDashboardLayout>
    );
}
