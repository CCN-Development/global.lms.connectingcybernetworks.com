"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Alert,
    Badge,
    Box,
    Button,
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
import {
    MdArchive,
    MdCheckCircle,
    MdDeleteOutline,
    MdErrorOutline,
    MdMoreVert,
    MdOutlineErrorOutline,
    MdOutlineWarningAmber,
    MdPublish,
    MdSync,
    MdUnpublished,
} from "react-icons/md";
import { useCourse } from "@/contexts/CourseContext";
import { useExam, type AdminExamTree, type ExamPublishCheck } from "@/contexts/ExamContext";
import { EmptyState, LoadingState, PageHeader, notify, useConfirm } from "@/components/course-admin/ui";
import { EXAM_ADMIN_BASE, ExamChip, UNLOCK_LABELS } from "./exam-ui";
import ExamSetupPanel from "./ExamSetupPanel";
import OverviewTab from "./OverviewTab";
import RoundsTab from "./RoundsTab";
import ExamSettingsTab from "./ExamSettingsTab";
import CandidatesTab from "./CandidatesTab";
import EvaluationsTab from "./EvaluationsTab";
import CertificatesTab from "./CertificatesTab";

export type WorkspaceTab = "overview" | "rounds" | "settings" | "candidates" | "evaluations" | "certificates";

/** True once any set of the exam was served to a student (structure deletions are then blocked by the API). */
export function examHasAttempts(exam: AdminExamTree) {
    return exam.rounds.some((round) => round.sets.some((set) => set.servedCount > 0));
}

export default function ExamWorkspace({ courseId }: { courseId: string }) {
    const router = useRouter();
    const { adminCourses, getAdminCourses } = useCourse();
    const { adminExam, getAdminExams, getAdminExam, getExamPublishCheck, publishExam, unpublishExam, archiveExam, resyncExam, deleteExam, saving } =
        useExam();
    const { confirm, dialog } = useConfirm();
    const [examId, setExamId] = useState<string | null | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<WorkspaceTab>("overview");
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
    const [check, setCheck] = useState<ExamPublishCheck | null>(null);
    const [checking, setChecking] = useState(false);

    const course = adminCourses.find((c) => c.courseId === courseId) ?? null;

    useEffect(() => {
        if (!adminCourses.length) getAdminCourses({});
    }, [adminCourses.length, getAdminCourses]);

    /** Finds the course's exam (one per course) and loads its full tree. */
    const resolveExam = useCallback(async () => {
        const list = await getAdminExams({ courseId, page: 1, pageSize: 1 });
        if (!list.success || !list.data) {
            setError(list.message ?? "Failed to load the exam");
            return;
        }
        const found = list.data.items[0];
        if (!found) {
            setExamId(null);
            return;
        }
        const tree = await getAdminExam(found.examId);
        if (!tree.success) setError(tree.message ?? "Failed to load the exam");
        setExamId(found.examId);
    }, [courseId, getAdminExams, getAdminExam]);

    useEffect(() => {
        resolveExam();
    }, [resolveExam]);

    const exam = examId && adminExam?.examId === examId ? adminExam : null;
    const pendingReview = useMemo(() => exam?.rounds.reduce((sum, r) => sum + r.stats.pendingReview, 0) ?? 0, [exam]);

    if (error && !exam) {
        return (
            <EmptyState
                icon={<MdOutlineErrorOutline />}
                title="Exam not available"
                description={error}
                action={
                    <Button variant="contained" href={EXAM_ADMIN_BASE}>
                        Back to exams
                    </Button>
                }
            />
        );
    }
    if (examId === undefined || (examId && !exam)) return <LoadingState label="Loading exam…" />;

    if (examId === null) {
        return (
            <Box>
                <PageHeader backHref={EXAM_ADMIN_BASE} title={course?.courseName ?? "Course exam"} subtitle="This course has no certification exam yet." />
                <ExamSetupPanel
                    courseId={courseId}
                    courseName={course?.courseName ?? "Course"}
                    onCreated={async () => {
                        await resolveExam();
                        setTab("rounds");
                    }}
                />
            </Box>
        );
    }
    if (!exam) return null;

    const hasAttempts = examHasAttempts(exam);

    const runCheck = async (thenPublish: boolean) => {
        setChecking(true);
        const res = await getExamPublishCheck(exam.examId);
        setChecking(false);
        if (!res.success || !res.data) return notify(res);
        if (thenPublish && res.data.canPublish && !res.data.warnings.length) return notify(await publishExam(exam.examId));
        setCheck(res.data);
    };

    const menuAction = async (action: "archive" | "resync" | "delete") => {
        setMenuAnchor(null);
        if (action === "resync") return notify(await resyncExam(exam.examId));
        if (action === "archive") {
            const ok = await confirm({
                title: "Archive this exam?",
                description: "Students can no longer start attempts. Results, attempts and certificates stay visible. Publish again any time.",
                confirmLabel: "Archive",
            });
            if (ok) notify(await archiveExam(exam.examId));
            return;
        }
        const ok = await confirm({
            title: "Delete this exam permanently?",
            description: "All rounds, sets and questions are removed. This is only possible while no student has attempted it.",
            confirmLabel: "Delete exam",
            danger: true,
        });
        if (ok && notify(await deleteExam(exam.examId))) router.push(EXAM_ADMIN_BASE);
    };

    const tabs: { key: WorkspaceTab; label: React.ReactNode }[] = [
        { key: "overview", label: "Overview" },
        { key: "rounds", label: `Rounds & sets (${exam.rounds.length})` },
        { key: "settings", label: "Settings & certificate" },
        { key: "candidates", label: "Candidates" },
        {
            key: "evaluations",
            label: (
                <Badge color="secondary" badgeContent={pendingReview} max={99} sx={{ "& .MuiBadge-badge": { right: -12, top: 2 } }}>
                    Evaluations
                </Badge>
            ),
        },
        { key: "certificates", label: "Certificates" },
    ];

    return (
        <Box>
            <PageHeader
                backHref={EXAM_ADMIN_BASE}
                title={exam.title}
                badge={<ExamChip status={exam.examStatus} size="medium" />}
                subtitle={
                    <>
                        {exam.course.courseName} · Unlock: {UNLOCK_LABELS[exam.unlockRule].label.toLowerCase()}
                        {exam.unlockRule === "progress_pct" ? ` (${exam.unlockProgressPct}%)` : ""} ·{" "}
                        {exam.roundProgression === "sequential" ? "Rounds in order" : "Rounds in any order"}
                        {exam.publishedAt ? ` · first published ${new Date(exam.publishedAt).toLocaleDateString("en-GB")}` : ""}
                    </>
                }
                actions={
                    <>
                        <Button variant="outlined" onClick={() => runCheck(false)} disabled={checking}>
                            Check readiness
                        </Button>
                        {exam.examStatus === "published" ? (
                            <Button
                                variant="outlined"
                                color="warning"
                                startIcon={<MdUnpublished />}
                                disabled={saving}
                                onClick={async () => {
                                    const ok = await confirm({
                                        title: "Move the exam back to draft?",
                                        description: "Students can't start new attempts while it's in draft. Attempts already in progress can still be finished.",
                                        confirmLabel: "Move to draft",
                                    });
                                    if (ok) notify(await unpublishExam(exam.examId));
                                }}
                            >
                                Move to draft
                            </Button>
                        ) : (
                            <Button variant="contained" startIcon={<MdPublish />} disabled={saving || checking} onClick={() => runCheck(true)}>
                                {exam.examStatus === "archived" ? "Re-publish" : "Publish"}
                            </Button>
                        )}
                        <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="More actions" sx={{ border: "1px solid rgba(255,255,255,0.12)" }}>
                            <MdMoreVert />
                        </IconButton>
                    </>
                }
            />

            {exam.course.contentStatus !== "published" && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    The course itself is <b>{exam.course.contentStatus}</b>. Students only reach the exam once the course is published and they have access to it.
                </Alert>
            )}
            {!exam.aiConfigured && exam.rounds.some((r) => r.evaluationMode === "ai" || r.evaluationMode === "ai_assisted") && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    AI evaluation isn&apos;t configured on the server (GEMINI_API_KEY). AI rounds will wait for manual marks in Evaluations.
                </Alert>
            )}

            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2.5, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {tabs.map((t) => (
                    <Tab key={t.key} value={t.key} label={t.label} />
                ))}
            </Tabs>

            {tab === "overview" && <OverviewTab exam={exam} onNavigate={setTab} />}
            {tab === "rounds" && <RoundsTab exam={exam} />}
            {tab === "settings" && <ExamSettingsTab key={exam.examId} exam={exam} />}
            {tab === "candidates" && <CandidatesTab exam={exam} />}
            {tab === "evaluations" && <EvaluationsTab exam={exam} />}
            {tab === "certificates" && <CertificatesTab exam={exam} />}

            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                <MenuItem onClick={() => menuAction("resync")}>
                    <ListItemIcon>
                        <MdSync />
                    </ListItemIcon>
                    Recompute candidate statuses
                </MenuItem>
                {exam.examStatus !== "archived" && (
                    <MenuItem onClick={() => menuAction("archive")}>
                        <ListItemIcon>
                            <MdArchive />
                        </ListItemIcon>
                        Archive exam
                    </MenuItem>
                )}
                <MenuItem disabled={hasAttempts} onClick={() => menuAction("delete")} sx={{ color: "error.main" }}>
                    <ListItemIcon sx={{ color: "error.main" }}>
                        <MdDeleteOutline />
                    </ListItemIcon>
                    {hasAttempts ? "Delete (blocked — students attempted it)" : "Delete exam"}
                </MenuItem>
            </Menu>

            <PublishCheckDialog
                check={check}
                published={exam.examStatus === "published"}
                busy={saving}
                onClose={() => setCheck(null)}
                onPublish={async () => {
                    setCheck(null);
                    notify(await publishExam(exam.examId));
                }}
                onFix={() => {
                    setCheck(null);
                    setTab("rounds");
                }}
            />
            {dialog}
        </Box>
    );
}

export function PublishCheckDialog({
    check,
    published,
    busy,
    onClose,
    onPublish,
    onFix,
}: {
    check: ExamPublishCheck | null;
    published: boolean;
    busy: boolean;
    onClose: () => void;
    onPublish: () => void;
    onFix: () => void;
}) {
    const title = !check ? "" : check.errors.length ? `${check.errors.length} issue${check.errors.length > 1 ? "s" : ""} block publishing` : check.warnings.length ? "Ready — with warnings" : "Ready to publish";
    return (
        <Dialog open={Boolean(check)} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers>
                {check && <ReadinessList check={check} />}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button color="inherit" onClick={onClose}>
                    Close
                </Button>
                {check && (check.errors.length > 0 || check.warnings.length > 0) && <Button onClick={onFix}>Go to rounds & sets</Button>}
                {check?.canPublish && !published && (
                    <Button variant="contained" disabled={busy} onClick={onPublish}>
                        {check.warnings.length ? "Publish anyway" : "Publish now"}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

export function ReadinessList({ check }: { check: ExamPublishCheck }) {
    if (!check.errors.length && !check.warnings.length) {
        return (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <MdCheckCircle color="#22C55E" size={26} />
                <Typography variant="body2">Every mandatory round has a published question set. Students can sit this exam.</Typography>
            </Stack>
        );
    }
    return (
        <Stack spacing={1}>
            {check.errors.map((message) => (
                <Stack key={message} direction="row" spacing={1.25} sx={{ alignItems: "flex-start", p: 1.25, borderRadius: "12px", bgcolor: "rgba(248,113,113,0.08)" }}>
                    <Box sx={{ color: "error.main", mt: 0.25, display: "flex" }}>
                        <MdErrorOutline size={18} />
                    </Box>
                    <Typography variant="body2">{message}</Typography>
                </Stack>
            ))}
            {check.warnings.map((message) => (
                <Stack key={message} direction="row" spacing={1.25} sx={{ alignItems: "flex-start", p: 1.25, borderRadius: "12px", bgcolor: "rgba(245,158,11,0.08)" }}>
                    <Box sx={{ color: "warning.main", mt: 0.25, display: "flex" }}>
                        <MdOutlineWarningAmber size={18} />
                    </Box>
                    <Typography variant="body2">{message}</Typography>
                </Stack>
            ))}
        </Stack>
    );
}
