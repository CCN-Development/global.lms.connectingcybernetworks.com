"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Button,
    Divider,
    IconButton,
    InputAdornment,
    ListItemIcon,
    Menu,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    MdAdd,
    MdArchive,
    MdDeleteOutline,
    MdMoreVert,
    MdOpenInNew,
    MdOutlineLayers,
    MdOutlinePeople,
    MdOutlineSchool,
    MdPublish,
    MdSearch,
    MdUnpublished,
} from "react-icons/md";
import { useCourse, type AdminCourseListItem, type ContentStatus } from "@/contexts/CourseContext";
import { CreateCourseDialog, THEME_OPTIONS } from "./CourseForm";
import {
    COURSE_ADMIN_BASE,
    CourseAdminNav,
    EmptyState,
    GlassCard,
    LoadingState,
    PageHeader,
    StatTile,
    StatusChip,
    formatDate,
    formatDuration,
    notify,
    useConfirm,
} from "./ui";

const STATUS_FILTERS: { value: "" | ContentStatus; label: string }[] = [
    { value: "", label: "All statuses" },
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
];

export default function CourseList() {
    const router = useRouter();
    const { adminCourses, loadingAdminCourses, getAdminCourses, publishCourse, unpublishCourse, archiveCourse, deleteCourse } = useCourse();
    const { confirm, dialog } = useConfirm();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<"" | ContentStatus>("");
    const [creating, setCreating] = useState(false);
    const [menu, setMenu] = useState<{ anchor: HTMLElement; course: AdminCourseListItem } | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            getAdminCourses({ q: search.trim() || undefined, status: status || undefined });
        }, 250);
        return () => clearTimeout(timer);
    }, [search, status, getAdminCourses]);

    const stats = useMemo(
        () => ({
            total: adminCourses.length,
            published: adminCourses.filter((c) => c.contentStatus === "published").length,
            drafts: adminCourses.filter((c) => c.contentStatus === "draft").length,
            enrollments: adminCourses.reduce((sum, c) => sum + c.enrollmentsCount, 0),
        }),
        [adminCourses]
    );

    const openCourse = (courseId: string) => router.push(`${COURSE_ADMIN_BASE}/${courseId}`);

    const runAction = async (action: "publish" | "unpublish" | "archive" | "delete", course: AdminCourseListItem) => {
        setMenu(null);
        if (action === "delete") {
            const ok = await confirm({
                title: `Delete "${course.courseName}"?`,
                description: "This permanently removes the course and all of its content. Courses with students, batches or purchases can only be archived.",
                confirmLabel: "Delete",
                danger: true,
            });
            if (ok) notify(await deleteCourse(course.courseId));
            return;
        }
        if (action === "archive") {
            const ok = await confirm({
                title: `Archive "${course.courseName}"?`,
                description: "Archived courses are hidden from students. You can publish them again later.",
                confirmLabel: "Archive",
            });
            if (ok) notify(await archiveCourse(course.courseId));
            return;
        }
        notify(action === "publish" ? await publishCourse(course.courseId) : await unpublishCourse(course.courseId));
    };

    return (
        <Box>
            <PageHeader
                title="Courses"
                subtitle="Build curriculum, upload videos, author quizzes and labs, and track learners."
                actions={
                    <Button variant="contained" startIcon={<MdAdd />} onClick={() => setCreating(true)}>
                        New course
                    </Button>
                }
            />
            <CourseAdminNav />

            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, mb: 2.5 }}>
                <StatTile label="Courses" value={stats.total} />
                <StatTile label="Published" value={stats.published} />
                <StatTile label="Drafts" value={stats.drafts} />
                <StatTile label="Enrollments" value={stats.enrollments} />
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2.5 }}>
                <TextField
                    size="small"
                    placeholder="Search by name or slug"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ flex: 1, maxWidth: { sm: 420 } }}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><MdSearch /></InputAdornment> } }}
                />
                <TextField select size="small" value={status} slotProps={{ select: { displayEmpty: true } }} onChange={(e) => setStatus(e.target.value as "" | ContentStatus)} sx={{ minWidth: 180 }}>
                    {STATUS_FILTERS.map((s) => (
                        <MenuItem key={s.value || "all"} value={s.value}>
                            {s.label}
                        </MenuItem>
                    ))}
                </TextField>
            </Stack>

            {loadingAdminCourses && !adminCourses.length ? (
                <LoadingState label="Loading courses…" />
            ) : !adminCourses.length ? (
                <EmptyState
                    icon={<MdOutlineSchool />}
                    title={search || status ? "No courses match your filters" : "No courses yet"}
                    description="Create your first course, then add levels, modules and lessons in the builder."
                    action={
                        <Button variant="contained" startIcon={<MdAdd />} onClick={() => setCreating(true)}>
                            New course
                        </Button>
                    }
                />
            ) : (
                <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" } }}>
                    {adminCourses.map((course) => (
                        <CourseCard key={course.courseId} course={course} onOpen={() => openCourse(course.courseId)} onMenu={(anchor) => setMenu({ anchor, course })} />
                    ))}
                </Box>
            )}

            <Menu anchorEl={menu?.anchor} open={Boolean(menu)} onClose={() => setMenu(null)}>
                <MenuItem onClick={() => menu && openCourse(menu.course.courseId)}>
                    <ListItemIcon><MdOpenInNew /></ListItemIcon>Open builder
                </MenuItem>
                {menu?.course.contentStatus !== "published" ? (
                    <MenuItem onClick={() => menu && runAction("publish", menu.course)}>
                        <ListItemIcon><MdPublish /></ListItemIcon>Publish
                    </MenuItem>
                ) : (
                    <MenuItem onClick={() => menu && runAction("unpublish", menu.course)}>
                        <ListItemIcon><MdUnpublished /></ListItemIcon>Move to draft
                    </MenuItem>
                )}
                {menu?.course.contentStatus !== "archived" && (
                    <MenuItem onClick={() => menu && runAction("archive", menu.course)}>
                        <ListItemIcon><MdArchive /></ListItemIcon>Archive
                    </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={() => menu && runAction("delete", menu.course)} sx={{ color: "error.main" }}>
                    <ListItemIcon sx={{ color: "error.main" }}><MdDeleteOutline /></ListItemIcon>Delete
                </MenuItem>
            </Menu>

            <CreateCourseDialog
                open={creating}
                onClose={() => setCreating(false)}
                onCreated={(course) => {
                    setCreating(false);
                    openCourse(course.courseId);
                }}
            />
            {dialog}
        </Box>
    );
}

function CourseCard({ course, onOpen, onMenu }: { course: AdminCourseListItem; onOpen: () => void; onMenu: (anchor: HTMLElement) => void }) {
    const swatch = THEME_OPTIONS.find((t) => t.value === course.theme)?.swatch ?? "#7c3aed";
    const facts = [
        { label: "Levels", value: course.totalLevels },
        { label: "Lessons", value: course.totalLessons },
        { label: "Videos", value: course.totalVideos },
        { label: "Quizzes", value: course.totalQuizzes },
        { label: "Labs", value: course.totalLabs },
        { label: "XP", value: course.totalXp },
    ];

    return (
        <GlassCard
            sx={{ overflow: "hidden", cursor: "pointer", transition: "border-color .2s ease, transform .2s ease", "&:hover": { borderColor: `${swatch}88`, transform: "translateY(-2px)" } }}
            onClick={onOpen}
        >
            <Box
                sx={{
                    height: 96,
                    position: "relative",
                    background: course.coverUrl
                        ? `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(9,9,21,0.9) 100%), center / cover no-repeat url("${course.coverUrl}")`
                        : `radial-gradient(80% 140% at 85% 10%, ${swatch}cc 0%, ${swatch}00 60%), linear-gradient(115deg, ${swatch}55 0%, rgba(9,9,21,0.9) 100%)`,
                }}
            >
                <Box sx={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 1, alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
                    <StatusChip status={course.contentStatus} />
                    <IconButton size="small" aria-label="Course actions" onClick={(e) => onMenu(e.currentTarget)} sx={{ bgcolor: "rgba(0,0,0,0.35)" }}>
                        <MdMoreVert />
                    </IconButton>
                </Box>
                {course.emblemUrl && (
                    <Box
                        component="img"
                        src={course.emblemUrl}
                        alt=""
                        sx={{ position: "absolute", left: 16, bottom: -24, width: 56, height: 56, objectFit: "cover", borderRadius: "14px", border: "2px solid rgba(9,9,21,0.9)" }}
                    />
                )}
            </Box>
            <Box sx={{ p: 2, pt: course.emblemUrl ? 4 : 2 }}>
                <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }} noWrap>
                    {course.courseName}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                    {course.shortTitle ? `${course.shortTitle} · ` : ""}
                    {course.slug ? `/${course.slug}` : "No slug yet"}
                </Typography>
                {course.tagline && (
                    <Typography variant="body2" sx={{ mt: 1, color: "rgba(245,246,250,0.8)" }} noWrap>
                        {course.tagline}
                    </Typography>
                )}

                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 1, mt: 2 }}>
                    {facts.map((f) => (
                        <Box key={f.label} sx={{ textAlign: "center", p: 0.75, borderRadius: "10px", bgcolor: "rgba(255,255,255,0.03)" }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{f.value}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10.5 }}>
                                {f.label}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                <Stack direction="row" spacing={2} sx={{ alignItems: "center", mt: 2, color: "text.secondary" }}>
                    <Tooltip title="Enrolled students">
                        <Stack sx={{ alignItems: "center" }} direction="row" spacing={0.5}>
                            <MdOutlinePeople />
                            <Typography variant="caption">{course.enrollmentsCount}</Typography>
                        </Stack>
                    </Tooltip>
                    <Tooltip title="Total content duration">
                        <Stack sx={{ alignItems: "center" }} direction="row" spacing={0.5}>
                            <MdOutlineLayers />
                            <Typography variant="caption">{formatDuration(course.videoDurationSec + course.activityDurationSec)}</Typography>
                        </Stack>
                    </Tooltip>
                    <Box sx={{ flex: 1 }} />
                    <Typography variant="caption">Updated {formatDate(course.updatedAt)}</Typography>
                </Stack>
            </Box>
        </GlassCard>
    );
}
