"use client";

import React, { useMemo, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Chip,
    IconButton,
    Stack,
    Switch,
    Tooltip,
    Typography,
} from "@mui/material";
import { MdAdd, MdDeleteOutline, MdDriveFileMove, MdEdit, MdExpandMore, MdOutlineLayers, MdOutlineWarningAmber, MdUnfoldLess, MdUnfoldMore } from "react-icons/md";
import {
    useCourse,
    type AdminCourseTree,
    type AdminTreeLesson,
    type AdminTreeLevel,
    type AdminTreeModule,
    type AdminTreeSection,
    type CardType,
    type InstructorListItem,
    type LessonKind,
} from "@/contexts/CourseContext";
import { EmptyState, KindIcon, MoveButtons, StatusChip, formatDuration, kindLabel, moveId, notify, useConfirm } from "../ui";
import { CARD_LESSON_KIND, LessonCreateDialog, LevelDialog, ModuleDialog, MoveDialog, SectionDialog } from "./CurriculumDialogs";
import LessonEditorDrawer from "./LessonEditorDrawer";

type DialogState =
    | { kind: "level"; level: AdminTreeLevel | null }
    | { kind: "module"; levelId: string; module: AdminTreeModule | null }
    | { kind: "section"; moduleId: string; section: AdminTreeSection | null }
    | { kind: "lesson"; sectionId: string; allowedKinds: LessonKind[] }
    | { kind: "moveModule"; module: AdminTreeModule }
    | { kind: "moveLesson"; lesson: AdminTreeLesson };

const ALL_KINDS: LessonKind[] = ["video", "theory", "quiz", "lab"];

/** One-line readiness hint shown under each lesson. */
function contentHint(lesson: AdminTreeLesson): { text: string; warn: boolean } {
    switch (lesson.kind) {
        case "video":
            if (!lesson.video) return { text: "No video yet", warn: true };
            return { text: `Video ${lesson.video.videoStatus.replace("_", " ")}`, warn: lesson.video.videoStatus !== "ready" };
        case "theory": {
            const count = Array.isArray(lesson.theoryBlocks) ? lesson.theoryBlocks.length : 0;
            return { text: count ? `${count} content block${count > 1 ? "s" : ""}` : "No reading content", warn: !count };
        }
        case "quiz": {
            const count = lesson.quiz?._count.questions ?? 0;
            return { text: `${count} question${count === 1 ? "" : "s"}`, warn: !count };
        }
        case "lab":
            if (!lesson.lab) return { text: "Lab not configured", warn: true };
            return {
                text: lesson.lab.verificationMode === "flag" ? `Flag check · ${lesson.lab._count.flags} flag(s)` : "Self-reported completion",
                warn: lesson.lab.verificationMode === "flag" && !lesson.lab._count.flags,
            };
    }
}

export default function CurriculumTab({ course, instructors }: { course: AdminCourseTree; instructors: InstructorListItem[] }) {
    const {
        updateLevel,
        deleteLevel,
        reorderLevels,
        updateModule,
        deleteModule,
        reorderModules,
        moveModule,
        deleteSection,
        reorderSections,
        updateLesson,
        deleteLesson,
        reorderLessons,
        moveLesson,
        saving,
    } = useCourse();
    const { confirm, dialog: confirmDialog } = useConfirm();
    const [dialog, setDialog] = useState<DialogState | null>(null);
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

    const levels = course.levels;
    const lessonTargets = useMemo(
        () =>
            levels.flatMap((level) =>
                level.modules
                    .filter((m) => m.cardType === "module")
                    .flatMap((m) =>
                        m.sections.map((s) => ({
                            value: s.sectionId,
                            label: `${s.eyebrow ? `${s.eyebrow} · ` : ""}${s.title}`,
                            group: `L${level.levelNo} › ${m.title}`,
                        }))
                    )
            ),
        [levels]
    );

    const toggleLevel = (levelId: string) =>
        setCollapsed((prev) => {
            const next = new Set(prev);
            if (next.has(levelId)) next.delete(levelId);
            else next.add(levelId);
            return next;
        });

    const removeLevel = async (level: AdminTreeLevel) => {
        const ok = await confirm({
            title: `Delete level ${level.levelNo} "${level.title}"?`,
            description: "All cards, sections and lessons inside it are deleted. Levels with student progress can only be unpublished.",
            confirmLabel: "Delete",
            danger: true,
        });
        if (ok) notify(await deleteLevel(level.levelId));
    };

    const removeModule = async (module: AdminTreeModule) => {
        const ok = await confirm({
            title: `Delete "${module.title}"?`,
            description: "Its sections and lessons are deleted too. Cards with student progress can only be unpublished.",
            confirmLabel: "Delete",
            danger: true,
        });
        if (ok) notify(await deleteModule(module.moduleId));
    };

    const removeSection = async (section: AdminTreeSection) => {
        const ok = await confirm({ title: `Delete section "${section.title}"?`, description: "Lessons inside it are deleted too.", confirmLabel: "Delete", danger: true });
        if (ok) notify(await deleteSection(section.sectionId));
    };

    const removeLesson = async (lesson: AdminTreeLesson) => {
        const ok = await confirm({
            title: `Delete "${lesson.title}"?`,
            description: "If students already started it, the lesson is archived instead so their history stays intact.",
            confirmLabel: "Delete",
            danger: true,
        });
        if (ok) notify(await deleteLesson(lesson.lessonId));
    };

    const lessonRow = (lesson: AdminTreeLesson, section: AdminTreeSection, index: number, module: AdminTreeModule) => {
        const hint = contentHint(lesson);
        const published = lesson.lessonStatus === "published";
        return (
            <Stack
                key={lesson.lessonId}
                direction="row"
                spacing={1.25}
                onClick={() => setEditingLessonId(lesson.lessonId)}
                sx={{
                    alignItems: "center",
                    p: 1,
                    pl: 1.25,
                    borderRadius: "12px",
                    cursor: "pointer",
                    bgcolor: "rgba(255,255,255,0.02)",
                    border: "1px solid transparent",
                    opacity: lesson.lessonStatus === "archived" ? 0.55 : 1,
                    "&:hover": { borderColor: "rgba(91,124,255,0.45)", bgcolor: "rgba(91,124,255,0.05)" },
                }}
            >
                <KindIcon kind={lesson.kind} size={16} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                        {lesson.title}
                    </Typography>
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", color: hint.warn ? "warning.main" : "text.secondary" }}>
                        {hint.warn && <MdOutlineWarningAmber size={13} />}
                        <Typography variant="caption">
                            {kindLabel(lesson.kind)} · {hint.text} · {lesson.xp + (lesson.quiz?.accuracyBonusXp ?? 0)} XP · {formatDuration(lesson.kind === "quiz" && lesson.quiz?.timeLimitSec ? lesson.quiz.timeLimitSec : lesson.durationSec)}
                            {!lesson.isMandatory ? " · optional" : ""}
                            {lesson.isFreePreview ? " · free preview" : ""}
                        </Typography>
                    </Stack>
                </Box>
                <Box onClick={(e) => e.stopPropagation()} sx={{ display: "flex", alignItems: "center" }}>
                    {lesson.lessonStatus === "archived" ? (
                        <StatusChip status="archived" />
                    ) : (
                        <Tooltip title={published ? "Published — click to unpublish" : "Draft — click to publish"}>
                            <Switch
                                size="small"
                                checked={published}
                                disabled={saving}
                                onChange={async (e) => notify(await updateLesson(lesson.lessonId, { lessonStatus: e.target.checked ? "published" : "draft" }))}
                            />
                        </Tooltip>
                    )}
                    <MoveButtons
                        onUp={async () => notify(await reorderLessons(section.sectionId, moveId(section.lessons.map((l) => l.lessonId), index, -1)), "Order updated")}
                        onDown={async () => notify(await reorderLessons(section.sectionId, moveId(section.lessons.map((l) => l.lessonId), index, 1)), "Order updated")}
                        disableUp={index === 0 || saving}
                        disableDown={index === section.lessons.length - 1 || saving}
                    />
                    {module.cardType === "module" && (
                        <Tooltip title="Move to another section">
                            <IconButton size="small" onClick={() => setDialog({ kind: "moveLesson", lesson })}>
                                <MdDriveFileMove />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="Edit content">
                        <IconButton size="small" onClick={() => setEditingLessonId(lesson.lessonId)}>
                            <MdEdit />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => removeLesson(lesson)}>
                            <MdDeleteOutline />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Stack>
        );
    };

    const moduleCard = (module: AdminTreeModule, level: AdminTreeLevel, index: number) => {
        const lessons = module.sections.flatMap((s) => s.lessons);
        const singleKind = module.cardType === "module" ? null : CARD_LESSON_KIND[module.cardType as Exclude<CardType, "module">];
        const lead = module.moduleInstructors[0]?.instructor.name;
        return (
            <Box key={module.moduleId} sx={{ p: 1.75, borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", bgcolor: "rgba(255,255,255,0.015)" }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: lessons.length || module.cardType === "module" ? 1.5 : 0 }}>
                    {module.thumbnailUrl ? (
                        <Box component="img" src={module.thumbnailUrl} alt="" sx={{ width: 56, height: 36, objectFit: "cover", borderRadius: "8px", flexShrink: 0 }} />
                    ) : (
                        <KindIcon kind={module.cardType} />
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700 }} noWrap>
                            {module.title}
                            {module.titleAccent && (
                                <Box component="span" sx={{ color: "#A855F7" }}>
                                    {" "}
                                    {module.titleAccent}
                                </Box>
                            )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {kindLabel(module.cardType)} · {lessons.length} lesson{lessons.length === 1 ? "" : "s"} · {module.totalXp} XP ·{" "}
                            {formatDuration(module.videoDurationSec + module.activityDurationSec)}
                            {lead ? ` · ${lead}${module.moduleInstructors.length > 1 ? ` +${module.moduleInstructors.length - 1}` : ""}` : ""}
                        </Typography>
                    </Box>
                    <Tooltip title={module.isPublished ? "Visible — click to hide" : "Hidden — click to show"}>
                        <Switch
                            size="small"
                            checked={module.isPublished}
                            disabled={saving}
                            onChange={async (e) => notify(await updateModule(module.moduleId, { isPublished: e.target.checked }))}
                        />
                    </Tooltip>
                    <MoveButtons
                        onUp={async () => notify(await reorderModules(level.levelId, moveId(level.modules.map((m) => m.moduleId), index, -1)), "Order updated")}
                        onDown={async () => notify(await reorderModules(level.levelId, moveId(level.modules.map((m) => m.moduleId), index, 1)), "Order updated")}
                        disableUp={index === 0 || saving}
                        disableDown={index === level.modules.length - 1 || saving}
                    />
                    <Tooltip title="Move to another level">
                        <IconButton size="small" onClick={() => setDialog({ kind: "moveModule", module })}>
                            <MdDriveFileMove />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit card">
                        <IconButton size="small" onClick={() => setDialog({ kind: "module", levelId: level.levelId, module })}>
                            <MdEdit />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete card">
                        <IconButton size="small" color="error" onClick={() => removeModule(module)}>
                            <MdDeleteOutline />
                        </IconButton>
                    </Tooltip>
                </Stack>

                {singleKind ? (
                    <Stack spacing={0.75}>
                        {module.sections.map((section) => section.lessons.map((lesson, i) => lessonRow(lesson, section, i, module)))}
                        {!lessons.length && module.sections[0] && (
                            <Button
                                size="small"
                                startIcon={<MdAdd />}
                                sx={{ alignSelf: "flex-start" }}
                                onClick={() => setDialog({ kind: "lesson", sectionId: module.sections[0].sectionId, allowedKinds: [singleKind] })}
                            >
                                Add the {kindLabel(singleKind).toLowerCase()} lesson
                            </Button>
                        )}
                    </Stack>
                ) : (
                    <Stack spacing={1.5}>
                        {module.sections.map((section, sIndex) => (
                            <Box key={section.sectionId} sx={{ pl: { xs: 0, md: 1.5 }, borderLeft: { md: "2px solid rgba(255,255,255,0.06)" } }}>
                                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.75 }}>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        {section.eyebrow && (
                                            <Typography variant="caption" sx={{ color: "#A855F7", fontWeight: 700, letterSpacing: 0.8 }}>
                                                {section.eyebrow}
                                            </Typography>
                                        )}
                                        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                                            {section.title}
                                        </Typography>
                                    </Box>
                                    <Button size="small" startIcon={<MdAdd />} onClick={() => setDialog({ kind: "lesson", sectionId: section.sectionId, allowedKinds: ALL_KINDS })}>
                                        Lesson
                                    </Button>
                                    <MoveButtons
                                        onUp={async () => notify(await reorderSections(module.moduleId, moveId(module.sections.map((s) => s.sectionId), sIndex, -1)), "Order updated")}
                                        onDown={async () => notify(await reorderSections(module.moduleId, moveId(module.sections.map((s) => s.sectionId), sIndex, 1)), "Order updated")}
                                        disableUp={sIndex === 0 || saving}
                                        disableDown={sIndex === module.sections.length - 1 || saving}
                                    />
                                    <Tooltip title="Edit section">
                                        <IconButton size="small" onClick={() => setDialog({ kind: "section", moduleId: module.moduleId, section })}>
                                            <MdEdit />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete section">
                                        <IconButton size="small" color="error" onClick={() => removeSection(section)}>
                                            <MdDeleteOutline />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                                <Stack spacing={0.75}>
                                    {section.lessons.map((lesson, i) => lessonRow(lesson, section, i, module))}
                                    {!section.lessons.length && (
                                        <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>
                                            No lessons in this section yet.
                                        </Typography>
                                    )}
                                </Stack>
                            </Box>
                        ))}
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<MdAdd />}
                            sx={{ alignSelf: "flex-start" }}
                            onClick={() => setDialog({ kind: "section", moduleId: module.moduleId, section: null })}
                        >
                            Add section
                        </Button>
                    </Stack>
                )}
            </Box>
        );
    };

    return (
        <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2, flexWrap: "wrap" }} useFlexGap>
                <Typography variant="subtitle1" sx={{ flex: 1 }}>
                    Curriculum · {levels.length} level{levels.length === 1 ? "" : "s"}
                </Typography>
                <Button size="small" color="inherit" startIcon={<MdUnfoldMore />} onClick={() => setCollapsed(new Set())}>
                    Expand all
                </Button>
                <Button size="small" color="inherit" startIcon={<MdUnfoldLess />} onClick={() => setCollapsed(new Set(levels.map((l) => l.levelId)))}>
                    Collapse all
                </Button>
                <Button variant="contained" startIcon={<MdAdd />} onClick={() => setDialog({ kind: "level", level: null })}>
                    Add level
                </Button>
            </Stack>

            {!levels.length ? (
                <EmptyState
                    icon={<MdOutlineLayers />}
                    title="Start with a level"
                    description="Levels group the course into stages (e.g. Level 1 – Introduction). Add cards to each level: full modules with sections, or single video / reading / quiz / lab cards."
                    action={
                        <Button variant="contained" startIcon={<MdAdd />} onClick={() => setDialog({ kind: "level", level: null })}>
                            Add level
                        </Button>
                    }
                />
            ) : (
                <Stack spacing={1.5}>
                    {levels.map((level, index) => {
                        const lessonCount = level.modules.reduce((sum, m) => sum + m.sections.reduce((s, sec) => s + sec.lessons.length, 0), 0);
                        return (
                            <Accordion key={level.levelId} expanded={!collapsed.has(level.levelId)} onChange={() => toggleLevel(level.levelId)} disableGutters>
                                {/* Rendered as a div: the row holds its own buttons, and <button> can't nest. */}
                                <AccordionSummary component="div" expandIcon={<MdExpandMore />} sx={{ px: 2 }}>
                                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", width: "100%", pr: 1, minWidth: 0 }}>
                                        <Chip size="small" label={`LEVEL ${level.levelNo}`} color="primary" variant="outlined" />
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontWeight: 700 }} noWrap>
                                                {level.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {level.modules.length} card{level.modules.length === 1 ? "" : "s"} · {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
                                            </Typography>
                                        </Box>
                                        <Box onClick={(e) => e.stopPropagation()} sx={{ display: "flex", alignItems: "center" }}>
                                            <Tooltip title={level.isPublished ? "Visible — click to hide" : "Hidden — click to show"}>
                                                <Switch
                                                    size="small"
                                                    checked={level.isPublished}
                                                    disabled={saving}
                                                    onChange={async (e) => notify(await updateLevel(level.levelId, { isPublished: e.target.checked }))}
                                                />
                                            </Tooltip>
                                            <MoveButtons
                                                onUp={async () => notify(await reorderLevels(course.courseId, moveId(levels.map((l) => l.levelId), index, -1)), "Order updated")}
                                                onDown={async () => notify(await reorderLevels(course.courseId, moveId(levels.map((l) => l.levelId), index, 1)), "Order updated")}
                                                disableUp={index === 0 || saving}
                                                disableDown={index === levels.length - 1 || saving}
                                            />
                                            <Tooltip title="Edit level">
                                                <IconButton size="small" onClick={() => setDialog({ kind: "level", level })}>
                                                    <MdEdit />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete level">
                                                <IconButton size="small" color="error" onClick={() => removeLevel(level)}>
                                                    <MdDeleteOutline />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Stack>
                                </AccordionSummary>
                                <AccordionDetails sx={{ px: 2, pb: 2 }}>
                                    <Stack spacing={1.5}>
                                        {level.modules.map((module, mIndex) => moduleCard(module, level, mIndex))}
                                        <Button
                                            variant="outlined"
                                            startIcon={<MdAdd />}
                                            sx={{ alignSelf: "flex-start" }}
                                            onClick={() => setDialog({ kind: "module", levelId: level.levelId, module: null })}
                                        >
                                            Add card to level {level.levelNo}
                                        </Button>
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
                </Stack>
            )}

            {dialog?.kind === "level" && <LevelDialog courseId={course.courseId} level={dialog.level} onClose={() => setDialog(null)} />}
            {dialog?.kind === "module" && <ModuleDialog levelId={dialog.levelId} module={dialog.module} instructors={instructors} onClose={() => setDialog(null)} />}
            {dialog?.kind === "section" && <SectionDialog moduleId={dialog.moduleId} section={dialog.section} onClose={() => setDialog(null)} />}
            {dialog?.kind === "lesson" && (
                <LessonCreateDialog
                    sectionId={dialog.sectionId}
                    allowedKinds={dialog.allowedKinds}
                    onClose={() => setDialog(null)}
                    onCreated={(lesson) => {
                        setDialog(null);
                        setEditingLessonId(lesson.lessonId);
                    }}
                />
            )}
            {dialog?.kind === "moveModule" && (
                <MoveDialog
                    title={`Move "${dialog.module.title}"`}
                    options={levels.filter((l) => l.levelId !== dialog.module.levelId).map((l) => ({ value: l.levelId, label: `Level ${l.levelNo} – ${l.title}` }))}
                    onClose={() => setDialog(null)}
                    onMove={async (levelId) => {
                        if (notify(await moveModule(dialog.module.moduleId, levelId))) setDialog(null);
                    }}
                />
            )}
            {dialog?.kind === "moveLesson" && (
                <MoveDialog
                    title={`Move "${dialog.lesson.title}"`}
                    options={lessonTargets.filter((t) => t.value !== dialog.lesson.sectionId)}
                    onClose={() => setDialog(null)}
                    onMove={async (sectionId) => {
                        if (notify(await moveLesson(dialog.lesson.lessonId, sectionId))) setDialog(null);
                    }}
                />
            )}
            <LessonEditorDrawer lessonId={editingLessonId} onClose={() => setEditingLessonId(null)} />
            {confirmDialog}
        </Box>
    );
}
