"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, InputAdornment, MenuItem, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { MdAdd, MdOutlineErrorOutline, MdOutlineFactCheck, MdOutlinePeople, MdOutlineWorkspacePremium, MdRefresh, MdSearch } from "react-icons/md";
import { useCourse, type AdminCourseListItem } from "@/contexts/CourseContext";
import { useExam, type AdminExamListItem, type ExamPublishStatus } from "@/contexts/ExamContext";
import { THEME_OPTIONS } from "@/components/course-admin/CourseForm";
import { EmptyState, GlassCard, LoadingState, PageHeader, StatTile, formatDate } from "@/components/course-admin/ui";
import { ExamChip, ROUND_META, RoundIcon, examWorkspacePath } from "./exam-ui";

type ExamFilter = "" | "none" | ExamPublishStatus;

const EXAM_FILTERS: { value: ExamFilter; label: string }[] = [
    { value: "", label: "All courses" },
    { value: "none", label: "No exam yet" },
    { value: "draft", label: "Exam in draft" },
    { value: "published", label: "Exam published" },
    { value: "archived", label: "Exam archived" },
];

export default function ExamCourseList() {
    const router = useRouter();
    const { adminCourses, loadingAdminCourses, getAdminCourses } = useCourse();
    const { getAdminExams } = useExam();
    const [exams, setExams] = useState<AdminExamListItem[]>([]);
    const [loadingExams, setLoadingExams] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<ExamFilter>("");

    /** The list endpoint is paginated (max 100) — walk every page so each course can be matched to its exam. */
    const loadExams = useCallback(async () => {
        setLoadingExams(true);
        const all: AdminExamListItem[] = [];
        let failed: string | null = null;
        for (let page = 1; page <= 50; page++) {
            const res = await getAdminExams({ page, pageSize: 100 });
            if (!res.success || !res.data) {
                failed = res.message ?? "Failed to load exams";
                break;
            }
            all.push(...res.data.items);
            if (all.length >= res.data.total || !res.data.items.length) break;
        }
        setExams(all);
        setLoadingExams(false);
        return failed;
    }, [getAdminExams]);

    const loadAll = useCallback(async () => {
        setLoadError(null);
        const [courses, examError] = await Promise.all([getAdminCourses({}), loadExams()]);
        setLoadError(!courses.success ? (courses.message ?? "Failed to load courses") : examError);
    }, [getAdminCourses, loadExams]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const examByCourse = useMemo(() => new Map(exams.map((e) => [e.courseId, e])), [exams]);

    const rows = useMemo(() => {
        const q = search.trim().toLowerCase();
        return adminCourses
            .filter((course) => {
                const exam = examByCourse.get(course.courseId);
                if (filter === "none" && exam) return false;
                if (filter && filter !== "none" && exam?.examStatus !== filter) return false;
                if (!q) return true;
                return [course.courseName, course.shortTitle, course.slug, exam?.title].some((v) => v?.toLowerCase().includes(q));
            })
            .map((course) => ({ course, exam: examByCourse.get(course.courseId) ?? null }));
    }, [adminCourses, examByCourse, filter, search]);

    const stats = useMemo(
        () => ({
            courses: adminCourses.length,
            withExam: adminCourses.filter((c) => examByCourse.has(c.courseId)).length,
            published: exams.filter((e) => e.examStatus === "published").length,
            candidates: exams.reduce((sum, e) => sum + e._count.candidates, 0),
            certificates: exams.reduce((sum, e) => sum + e._count.certificates, 0),
        }),
        [adminCourses, examByCourse, exams]
    );

    const loading = (loadingAdminCourses && !adminCourses.length) || (loadingExams && !exams.length);

    return (
        <Box>
            <PageHeader
                title="Exam Management"
                subtitle="Certification exams per course — rounds, question sets, candidates, evaluations and certificates."
                actions={
                    <Button variant="outlined" startIcon={<MdRefresh />} onClick={loadAll}>
                        Refresh
                    </Button>
                }
            />

            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(5, 1fr)" }, mb: 2.5 }}>
                <StatTile label="Courses" value={stats.courses} />
                <StatTile label="With an exam" value={stats.withExam} hint={`${Math.max(0, stats.courses - stats.withExam)} without`} />
                <StatTile label="Published exams" value={stats.published} />
                <StatTile label="Candidates" value={stats.candidates} />
                <StatTile label="Certificates issued" value={stats.certificates} />
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2.5 }}>
                <TextField
                    size="small"
                    placeholder="Search course or exam"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ flex: 1, maxWidth: { sm: 420 } }}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><MdSearch /></InputAdornment> } }}
                />
                <TextField select size="small" value={filter} onChange={(e) => setFilter(e.target.value as ExamFilter)} sx={{ minWidth: 200 }} slotProps={{ select: { displayEmpty: true } }}>
                    {EXAM_FILTERS.map((f) => (
                        <MenuItem key={f.value || "all"} value={f.value}>
                            {f.label}
                        </MenuItem>
                    ))}
                </TextField>
            </Stack>

            {loading ? (
                <LoadingState label="Loading courses and exams…" />
            ) : loadError && !adminCourses.length ? (
                <EmptyState
                    icon={<MdOutlineErrorOutline />}
                    title="Couldn't load courses and exams"
                    description={loadError}
                    action={
                        <Button variant="contained" startIcon={<MdRefresh />} onClick={loadAll}>
                            Retry
                        </Button>
                    }
                />
            ) : !rows.length ? (
                <EmptyState
                    icon={<MdOutlineFactCheck />}
                    title={search || filter ? "No courses match your filters" : "No courses yet"}
                    description="Exams belong to a course. Create courses in Course Management first."
                />
            ) : (
                <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" } }}>
                    {rows.map(({ course, exam }) => (
                        <ExamCourseCard key={course.courseId} course={course} exam={exam} onOpen={() => router.push(examWorkspacePath(course.courseId))} />
                    ))}
                </Box>
            )}
        </Box>
    );
}

function ExamCourseCard({ course, exam, onOpen }: { course: AdminCourseListItem; exam: AdminExamListItem | null; onOpen: () => void }) {
    const swatch = THEME_OPTIONS.find((t) => t.value === course.theme)?.swatch ?? "#7c3aed";

    return (
        <GlassCard
            onClick={onOpen}
            sx={{ overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column", transition: "border-color .2s ease, transform .2s ease", "&:hover": { borderColor: `${swatch}88`, transform: "translateY(-2px)" } }}
        >
            <Box
                sx={{
                    height: 84,
                    position: "relative",
                    background: course.coverUrl
                        ? `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(9,9,21,0.92) 100%), center / cover no-repeat url("${course.coverUrl}")`
                        : `radial-gradient(80% 140% at 85% 10%, ${swatch}cc 0%, ${swatch}00 60%), linear-gradient(115deg, ${swatch}55 0%, rgba(9,9,21,0.9) 100%)`,
                }}
            >
                <Stack direction="row" spacing={1} sx={{ position: "absolute", top: 10, right: 10 }}>
                    <Tooltip title="Course status">
                        <span>
                            <ExamChip status={course.contentStatus} label={`Course ${course.contentStatus}`} />
                        </span>
                    </Tooltip>
                </Stack>
                {course.emblemUrl && (
                    <Box
                        component="img"
                        src={course.emblemUrl}
                        alt=""
                        sx={{ position: "absolute", left: 16, bottom: -22, width: 48, height: 48, objectFit: "cover", borderRadius: "12px", border: "2px solid rgba(9,9,21,0.9)" }}
                    />
                )}
            </Box>

            <Box sx={{ p: 2, pt: course.emblemUrl ? 3.5 : 2, display: "flex", flexDirection: "column", gap: 1.5, flex: 1 }}>
                <Box>
                    <Typography variant="subtitle1" noWrap>
                        {course.courseName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                        {exam ? exam.title : "No certification exam configured"}
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }} useFlexGap>
                    {exam ? <ExamChip status={exam.examStatus} label={`Exam ${exam.examStatus}`} /> : <ExamChip status="none" label="No exam" color="default" />}
                    {exam?.rounds.map((round) => (
                        <Tooltip key={round.roundId} title={round.title}>
                            <Box component="span" sx={{ display: "inline-flex" }}>
                                <RoundIcon type={round.roundType} size={14} />
                            </Box>
                        </Tooltip>
                    ))}
                    {exam && !exam.rounds.length && (
                        <Typography variant="caption" color="warning.main">
                            No rounds yet
                        </Typography>
                    )}
                </Stack>

                {exam ? (
                    <Stack direction="row" spacing={2} sx={{ alignItems: "center", color: "text.secondary", mt: "auto" }}>
                        <Tooltip title="Candidates">
                            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                                <MdOutlinePeople />
                                <Typography variant="caption">{exam._count.candidates}</Typography>
                            </Stack>
                        </Tooltip>
                        <Tooltip title="Certificates issued">
                            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                                <MdOutlineWorkspacePremium />
                                <Typography variant="caption">{exam._count.certificates}</Typography>
                            </Stack>
                        </Tooltip>
                        <Typography variant="caption" sx={{ flex: 1 }} noWrap>
                            {exam.rounds.map((r) => ROUND_META[r.roundType].short).join(" → ")}
                        </Typography>
                        <Typography variant="caption">Updated {formatDate(exam.updatedAt)}</Typography>
                    </Stack>
                ) : (
                    <Box sx={{ mt: "auto" }}>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<MdAdd />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpen();
                            }}
                        >
                            Set up exam
                        </Button>
                    </Box>
                )}
            </Box>
        </GlassCard>
    );
}
