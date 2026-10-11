"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    ListItemIcon,
    Menu,
    MenuItem,
    Stack,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import { MdArchive, MdCalculate, MdCheckCircle, MdMoreVert, MdOutlineErrorOutline, MdPublish, MdUnpublished } from "react-icons/md";
import { useCourse, type PublishIssue } from "@/contexts/CourseContext";
import { COURSE_ADMIN_BASE, EmptyState, LoadingState, PageHeader, StatTile, StatusChip, formatDuration, notify, useConfirm } from "../ui";
import CurriculumTab from "./CurriculumTab";
import LessonEditorDrawer from "./LessonEditorDrawer";
import { DetailsTab, SetupTab } from "./SettingsTabs";
import { AnalyticsTab, StudentsTab } from "./LearnersTabs";

type TabKey = "curriculum" | "details" | "setup" | "students" | "analytics";

const TABS: { key: TabKey; label: string }[] = [
    { key: "curriculum", label: "Curriculum" },
    { key: "details", label: "Details" },
    { key: "setup", label: "Trailer, instructors & access" },
    { key: "students", label: "Students" },
    { key: "analytics", label: "Analytics" },
];

export default function CourseBuilder({ courseId }: { courseId: string }) {
    const {
        adminCourse,
        getAdminCourse,
        instructors,
        getInstructors,
        adminCourses,
        getAdminCourses,
        getPublishCheck,
        publishCourse,
        unpublishCourse,
        archiveCourse,
        recomputeCourse,
        saving,
    } = useCourse();
    const { confirm, dialog } = useConfirm();
    const [tab, setTab] = useState<TabKey>("curriculum");
    const [error, setError] = useState<string | null>(null);
    const [issues, setIssues] = useState<PublishIssue[] | null>(null);
    const [checking, setChecking] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
    const [issueLessonId, setIssueLessonId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        getAdminCourse(courseId).then((res) => {
            if (!cancelled) setError(res.success ? null : (res.message ?? "Course not found"));
        });
        return () => {
            cancelled = true;
        };
    }, [courseId, getAdminCourse]);

    useEffect(() => {
        getInstructors("");
        getAdminCourses({});
    }, [getInstructors, getAdminCourses]);

    const course = adminCourse?.courseId === courseId ? adminCourse : null;

    if (error && !course) {
        return (
            <EmptyState
                icon={<MdOutlineErrorOutline />}
                title="Course not available"
                description={error}
                action={
                    <Button variant="contained" href={COURSE_ADMIN_BASE}>
                        Back to courses
                    </Button>
                }
            />
        );
    }
    if (!course) return <LoadingState label="Loading course…" />;

    const publish = async () => {
        setChecking(true);
        const check = await getPublishCheck(courseId);
        setChecking(false);
        if (!check.success || !check.data) return notify(check);
        if (!check.data.canPublish) return setIssues(check.data.issues);
        notify(await publishCourse(courseId));
    };

    const runCheck = async () => {
        setChecking(true);
        const check = await getPublishCheck(courseId);
        setChecking(false);
        if (check.success && check.data) setIssues(check.data.issues);
        else notify(check);
    };

    const tiles = [
        { label: "Levels", value: course.totalLevels },
        { label: "Cards", value: course.totalModules },
        { label: "Lessons", value: course.totalLessons },
        { label: "Videos", value: course.totalVideos },
        { label: "Quizzes", value: course.totalQuizzes },
        { label: "Labs", value: course.totalLabs },
        { label: "Total XP", value: course.totalXp },
        { label: "Duration", value: formatDuration(course.videoDurationSec + course.activityDurationSec) },
        { label: "Students", value: course._count.enrollments },
    ];

    return (
        <Box>
            <PageHeader
                backHref={COURSE_ADMIN_BASE}
                title={course.courseName}
                badge={<StatusChip status={course.contentStatus} size="medium" />}
                subtitle={
                    <>
                        {course.slug ? `/my-courses/${course.slug}` : "No URL slug yet"} · {course.progressionMode === "sequential" ? "Sequential levels" : "Free navigation"}
                        {course.publishedAt ? ` · first published ${new Date(course.publishedAt).toLocaleDateString("en-GB")}` : ""}
                    </>
                }
                actions={
                    <>
                        <Button variant="outlined" onClick={runCheck} disabled={checking}>
                            Check readiness
                        </Button>
                        {course.contentStatus === "published" ? (
                            <Button variant="outlined" color="warning" startIcon={<MdUnpublished />} disabled={saving} onClick={async () => notify(await unpublishCourse(courseId))}>
                                Move to draft
                            </Button>
                        ) : (
                            <Button variant="contained" startIcon={<MdPublish />} disabled={saving || checking} onClick={publish}>
                                Publish
                            </Button>
                        )}
                        <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="More actions" sx={{ border: "1px solid rgba(255,255,255,0.12)" }}>
                            <MdMoreVert />
                        </IconButton>
                    </>
                }
            />

            <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "repeat(3, 1fr)", md: "repeat(5, 1fr)", xl: "repeat(9, 1fr)" }, mb: 1 }}>
                {tiles.map((t) => (
                    <StatTile key={t.label} label={t.label} value={t.value} />
                ))}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                Totals count published levels, cards and lessons — what students see.
            </Typography>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2.5, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {TABS.map((t) => (
                    <Tab key={t.key} value={t.key} label={t.label} />
                ))}
            </Tabs>

            {tab === "curriculum" && <CurriculumTab course={course} instructors={instructors} />}
            {tab === "details" && <DetailsTab key={course.courseId} course={course} />}
            {tab === "setup" && <SetupTab key={course.courseId} course={course} instructors={instructors} allCourses={adminCourses} />}
            {tab === "students" && <StudentsTab courseId={courseId} />}
            {tab === "analytics" && <AnalyticsTab courseId={courseId} />}

            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                <MenuItem
                    onClick={async () => {
                        setMenuAnchor(null);
                        notify(await recomputeCourse(courseId));
                    }}
                >
                    <ListItemIcon>
                        <MdCalculate />
                    </ListItemIcon>
                    Recompute totals
                </MenuItem>
                {course.contentStatus !== "archived" && (
                    <MenuItem
                        onClick={async () => {
                            setMenuAnchor(null);
                            const ok = await confirm({
                                title: "Archive this course?",
                                description: "It disappears for students; progress is kept. Publish it again any time.",
                                confirmLabel: "Archive",
                            });
                            if (ok) notify(await archiveCourse(courseId));
                        }}
                    >
                        <ListItemIcon>
                            <MdArchive />
                        </ListItemIcon>
                        Archive
                    </MenuItem>
                )}
            </Menu>

            <Dialog open={issues !== null} onClose={() => setIssues(null)} maxWidth="sm" fullWidth>
                <DialogTitle>{issues?.length ? `${issues.length} thing${issues.length > 1 ? "s" : ""} to fix before publishing` : "Ready to publish"}</DialogTitle>
                <DialogContent dividers>
                    {!issues?.length ? (
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                            <MdCheckCircle color="#22C55E" size={28} />
                            <Typography variant="body2">Every published level, card and lesson has its content. Students will see exactly what&apos;s published.</Typography>
                        </Stack>
                    ) : (
                        <Stack spacing={1}>
                            {issues.map((issue, index) => (
                                <Stack key={`${issue.id}-${index}`} direction="row" spacing={1.5} sx={{ alignItems: "center", p: 1.25, borderRadius: "12px", bgcolor: "rgba(255,255,255,0.03)" }}>
                                    <Chip size="small" label={issue.scope} variant="outlined" sx={{ textTransform: "capitalize", minWidth: 64 }} />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                                            {issue.title || course.courseName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {issue.message}
                                        </Typography>
                                    </Box>
                                    {issue.scope === "lesson" && (
                                        <Button
                                            size="small"
                                            onClick={() => {
                                                setIssues(null);
                                                setIssueLessonId(issue.id);
                                            }}
                                        >
                                            Fix
                                        </Button>
                                    )}
                                    {issue.scope === "course" && (
                                        <Button
                                            size="small"
                                            onClick={() => {
                                                setIssues(null);
                                                setTab(issue.message.includes("slug") ? "details" : "curriculum");
                                            }}
                                        >
                                            Fix
                                        </Button>
                                    )}
                                </Stack>
                            ))}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setIssues(null)}>Close</Button>
                    {!issues?.length && course.contentStatus !== "published" && (
                        <Button
                            variant="contained"
                            disabled={saving}
                            onClick={async () => {
                                setIssues(null);
                                notify(await publishCourse(courseId));
                            }}
                        >
                            Publish now
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
            <LessonEditorDrawer lessonId={issueLessonId} onClose={() => setIssueLessonId(null)} />
            {dialog}
        </Box>
    );
}
