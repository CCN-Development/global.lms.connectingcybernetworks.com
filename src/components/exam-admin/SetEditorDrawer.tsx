"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Drawer,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    MdAdd,
    MdClose,
    MdContentCopy,
    MdDeleteOutline,
    MdEdit,
    MdExpandLess,
    MdExpandMore,
    MdLockOutline,
    MdOutlineArchive,
    MdOutlineFileUpload,
    MdPublish,
    MdUnpublished,
} from "react-icons/md";
import {
    CHOICE_QUESTION_TYPES,
    useExam,
    type AdminExamQuestion,
    type ExamQuestionInput,
    type ExamRoundRecord,
    type ExamSetInput,
} from "@/contexts/ExamContext";
import { LoadingState, MoveButtons, moveId, notify, useConfirm } from "@/components/course-admin/ui";
import { ExamChip, QUESTION_TYPE_LABELS, ROUND_META, RoundIcon, formatDateTime, formatMarks } from "./exam-ui";
import ExamQuestionDialog, { ExamImportDialog, aiReferenceWarning, validateExamQuestion } from "./ExamQuestionDialog";

const SET_CODE_RE = /^[A-Z0-9][A-Z0-9_-]*$/;

/** Record → input, so stored questions can be re-validated with the same rules as the editor. */
function recordToInput(q: AdminExamQuestion): ExamQuestionInput {
    return {
        ...q,
        options: q.options.map((o) => ({ optionText: o.optionText, isCorrect: o.isCorrect, imageUrl: o.imageUrl })),
        flags: q.flags.map((f) => ({ label: f.label, flagId: f.flagId, marks: f.marks })),
    };
}

/** Problems that block publishing (same checks the API runs on publish). */
export function setPublishIssues(questions: AdminExamQuestion[], round: ExamRoundRecord): string[] {
    if (!questions.length) return ["Add at least one question"];
    return questions.flatMap((q, index) => {
        const input = recordToInput(q);
        const problem = validateExamQuestion(input, round) ?? aiReferenceWarning(input, round);
        return problem ? [`Q${index + 1}: ${problem}`] : [];
    });
}

export function SetMetaDialog({
    open,
    title,
    initial,
    onClose,
    onSubmit,
}: {
    open: boolean;
    title: string;
    initial: { code: string; title: string | null } | null;
    onClose: () => void;
    onSubmit: (input: ExamSetInput) => Promise<boolean>;
}) {
    const [code, setCode] = useState(initial?.code ?? "");
    const [name, setName] = useState(initial?.title ?? "");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const submit = async () => {
        const normalized = code.trim().toUpperCase();
        if (normalized && (!SET_CODE_RE.test(normalized) || normalized.length > 30)) return setError("Code: letters, numbers, dashes or underscores (max 30)");
        setError(null);
        setBusy(true);
        const ok = await onSubmit({ ...(normalized ? { code: normalized } : {}), title: name.trim() || null });
        setBusy(false);
        if (ok) onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <TextField label="Code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Auto (SET-A, SET-B…)" helperText="Unique within the round" />
                    <TextField label="Title (optional)" value={name} onChange={(e) => setName(e.target.value)} slotProps={{ htmlInput: { maxLength: 200 } }} />
                    {error && <Alert severity="error">{error}</Alert>}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={submit} disabled={busy}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default function SetEditorDrawer({
    setId,
    round,
    onClose,
    onOpenSet,
}: {
    setId: string | null;
    round: ExamRoundRecord | null;
    onClose: () => void;
    onOpenSet: (setId: string) => void;
}) {
    const { adminSet, loadingAdminSet, getAdminSet, publishSet, unpublishSet, retireSet, cloneSet, deleteSet, updateSet, createQuestion, updateQuestion, deleteQuestion, reorderQuestions, importQuestions, saving } =
        useExam();
    const { confirm, dialog } = useConfirm();
    const [editing, setEditing] = useState<{ question: AdminExamQuestion | null } | null>(null);
    const [importing, setImporting] = useState(false);
    const [renaming, setRenaming] = useState(false);
    const [issues, setIssues] = useState<string[] | null>(null);

    useEffect(() => {
        if (setId) getAdminSet(setId);
        setIssues(null);
    }, [setId, getAdminSet]);

    const set = setId && adminSet?.setId === setId ? adminSet : null;
    const effectiveRound = set?.round ?? round;
    const isDraft = set?.setStatus === "draft";
    const neverServed = (set?.servedCount ?? 0) === 0;
    const totalMarks = useMemo(() => set?.questions.reduce((sum, q) => sum + (q.marks ?? set.round.defaultMarks), 0) ?? 0, [set]);

    const publish = async () => {
        if (!set) return;
        const problems = setPublishIssues(set.questions, set.round);
        if (problems.length) return setIssues(problems);
        const ok = await confirm({
            title: `Publish ${set.code}?`,
            description: "Published sets are served to students at random and become read-only. To change it later you'll clone it into a new draft.",
            confirmLabel: "Publish set",
        });
        if (ok) notify(await publishSet(set.setId));
    };

    const clone = async () => {
        if (!set) return;
        const res = await cloneSet(set.setId);
        if (notify(res) && res.data) onOpenSet(res.data.setId);
    };

    const remove = async () => {
        if (!set) return;
        const ok = await confirm({ title: `Delete ${set.code}?`, description: "The set and its questions are removed permanently.", confirmLabel: "Delete", danger: true });
        if (ok && notify(await deleteSet(set.setId))) onClose();
    };

    const removeQuestion = async (q: AdminExamQuestion) => {
        const ok = await confirm({ title: "Delete this question?", confirmLabel: "Delete", danger: true });
        if (ok) notify(await deleteQuestion(q.questionId));
    };

    const move = async (index: number, dir: -1 | 1) => {
        if (!set) return;
        notify(await reorderQuestions(set.setId, moveId(set.questions.map((q) => q.questionId), index, dir)), "Order updated");
    };

    return (
        <Drawer anchor="right" open={Boolean(setId)} onClose={onClose} slotProps={{ paper: { sx: { width: { xs: "100%", md: 860 } } } }}>
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", p: 2.5, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {effectiveRound && <RoundIcon type={effectiveRound.roundType} />}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                            <Typography variant="h6" noWrap sx={{ fontSize: 18 }}>
                                {set ? `${set.code}${set.title ? ` · ${set.title}` : ""}` : "Question set"}
                            </Typography>
                            {set && <ExamChip status={set.setStatus} />}
                            {set && (
                                <Tooltip title="Rename">
                                    <IconButton size="small" onClick={() => setRenaming(true)}>
                                        <MdEdit />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Stack>
                        {set && (
                            <Typography variant="caption" color="text.secondary">
                                {set.round.title} · {set.questions.length} {set.round.roundType === "lab" ? "lab task" : "question"}
                                {set.questions.length === 1 ? "" : "s"} · {formatMarks(totalMarks)} mark{totalMarks === 1 ? "" : "s"} · served to {set.servedCount} student{set.servedCount === 1 ? "" : "s"}
                                {set.publishedAt ? ` · published ${formatDateTime(set.publishedAt)}` : ""}
                            </Typography>
                        )}
                    </Box>
                    <IconButton onClick={onClose} aria-label="Close">
                        <MdClose />
                    </IconButton>
                </Stack>

                <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
                    {loadingAdminSet && !set ? (
                        <LoadingState label="Loading set…" />
                    ) : !set ? null : (
                        <Stack spacing={2}>
                            {!isDraft && (
                                <Alert
                                    severity={set.setStatus === "retired" ? "info" : "success"}
                                    icon={<MdLockOutline />}
                                    action={
                                        <Button color="inherit" size="small" startIcon={<MdContentCopy />} onClick={clone} disabled={saving}>
                                            Clone to edit
                                        </Button>
                                    }
                                >
                                    {set.setStatus === "published"
                                        ? "Published — served at random to students who haven't seen it. Questions are locked so every attempt stays reproducible."
                                        : "Retired — never served again. Past attempts keep resolving to this exact paper."}
                                </Alert>
                            )}

                            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }} useFlexGap>
                                {isDraft && (
                                    <>
                                        <Button variant="contained" startIcon={<MdAdd />} onClick={() => setEditing({ question: null })}>
                                            Add {set.round.roundType === "lab" ? "lab task" : "question"}
                                        </Button>
                                        <Button variant="outlined" startIcon={<MdOutlineFileUpload />} onClick={() => setImporting(true)}>
                                            Import JSON
                                        </Button>
                                        <Button variant="outlined" color="success" startIcon={<MdPublish />} disabled={saving} onClick={publish}>
                                            Publish set
                                        </Button>
                                    </>
                                )}
                                {set.setStatus === "published" && (
                                    <Tooltip title={neverServed ? "Back to draft for edits" : "Already served — retire it instead"}>
                                        <span>
                                            <Button variant="outlined" color="warning" startIcon={<MdUnpublished />} disabled={!neverServed || saving} onClick={async () => notify(await unpublishSet(set.setId))}>
                                                Unpublish
                                            </Button>
                                        </span>
                                    </Tooltip>
                                )}
                                {set.setStatus === "published" && (
                                    <Button
                                        variant="outlined"
                                        startIcon={<MdOutlineArchive />}
                                        disabled={saving}
                                        onClick={async () => {
                                            const ok = await confirm({
                                                title: `Retire ${set.code}?`,
                                                description: "It won't be served to anyone again. Students already in an attempt on it can finish. Make sure other published sets remain for retakes.",
                                                confirmLabel: "Retire",
                                            });
                                            if (ok) notify(await retireSet(set.setId));
                                        }}
                                    >
                                        Retire
                                    </Button>
                                )}
                                <Button variant="outlined" startIcon={<MdContentCopy />} disabled={saving} onClick={clone}>
                                    Clone
                                </Button>
                                <Box sx={{ flex: 1 }} />
                                <Tooltip title={isDraft && neverServed ? "" : "Only never-served drafts can be deleted"}>
                                    <span>
                                        <Button color="error" startIcon={<MdDeleteOutline />} disabled={!isDraft || !neverServed || saving} onClick={remove}>
                                            Delete set
                                        </Button>
                                    </span>
                                </Tooltip>
                            </Stack>

                            {issues && (
                                <Alert severity="error" onClose={() => setIssues(null)}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                                        Fix before publishing:
                                    </Typography>
                                    {issues.slice(0, 12).map((issue) => (
                                        <Typography key={issue} variant="body2">
                                            • {issue}
                                        </Typography>
                                    ))}
                                </Alert>
                            )}

                            {!set.questions.length ? (
                                <Box sx={{ py: 6, textAlign: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No questions yet. {isDraft ? "Add them one by one or import a JSON array." : ""}
                                    </Typography>
                                </Box>
                            ) : (
                                <Stack spacing={1.25}>
                                    {set.questions.map((question, index) => (
                                        <QuestionCard
                                            key={question.questionId}
                                            question={question}
                                            index={index}
                                            round={set.round}
                                            actions={
                                                isDraft ? (
                                                    <>
                                                        <MoveButtons onUp={() => move(index, -1)} onDown={() => move(index, 1)} disableUp={index === 0 || saving} disableDown={index === set.questions.length - 1 || saving} />
                                                        <Tooltip title="Edit">
                                                            <IconButton size="small" onClick={() => setEditing({ question })}>
                                                                <MdEdit />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete">
                                                            <IconButton size="small" color="error" onClick={() => removeQuestion(question)}>
                                                                <MdDeleteOutline />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                ) : null
                                            }
                                        />
                                    ))}
                                </Stack>
                            )}
                        </Stack>
                    )}
                </Box>
            </Box>

            {set && editing && (
                <ExamQuestionDialog
                    key={editing.question?.questionId ?? "new"}
                    open
                    round={set.round}
                    initial={editing.question}
                    onClose={() => setEditing(null)}
                    onSubmit={async (input) => notify(editing.question ? await updateQuestion(editing.question.questionId, input) : await createQuestion(set.setId, input))}
                />
            )}
            {set && <ExamImportDialog open={importing} round={set.round} onClose={() => setImporting(false)} onImport={async (questions) => notify(await importQuestions(set.setId, questions))} />}
            {set && renaming && (
                <SetMetaDialog
                    open
                    title={`Rename ${set.code}`}
                    initial={{ code: set.code, title: set.title }}
                    onClose={() => setRenaming(false)}
                    onSubmit={async (input) => notify(await updateSet(set.setId, input))}
                />
            )}
            {dialog}
        </Drawer>
    );
}

export function QuestionCard({ question, index, round, actions }: { question: AdminExamQuestion; index: number; round: ExamRoundRecord; actions?: React.ReactNode }) {
    const [expanded, setExpanded] = useState(false);
    const isChoice = CHOICE_QUESTION_TYPES.includes(question.questionType);
    const marks = question.marks ?? round.defaultMarks;
    const negative = isChoice ? (question.negativeMarks ?? round.defaultNegativeMarks) : 0;
    const hasReference = Boolean(question.expectedAnswer || question.keyPoints.length || question.evaluationGuide || question.solutionBlocks?.length);

    return (
        <Box sx={{ p: 1.75, borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", bgcolor: "rgba(255,255,255,0.02)" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                <Typography sx={{ fontWeight: 700, color: "text.secondary", minWidth: 28 }}>{index + 1}.</Typography>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={0.75} sx={{ mb: 0.75, flexWrap: "wrap", alignItems: "center" }} useFlexGap>
                        <Chip size="small" label={QUESTION_TYPE_LABELS[question.questionType]} sx={{ height: 22, color: ROUND_META[round.roundType].color }} variant="outlined" />
                        {question.section && <Chip size="small" label={question.section} sx={{ height: 22 }} />}
                        <Typography variant="caption" color="text.secondary">
                            +{formatMarks(marks)}
                            {negative ? ` / −${formatMarks(negative)}` : ""}
                            {question.marks === null ? " (default)" : ""}
                        </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: "pre-wrap" }}>
                        {question.prompt}
                    </Typography>
                    {question.scenario && (
                        <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.75, whiteSpace: "pre-wrap" }}>
                            Scenario: {question.scenario}
                        </Typography>
                    )}
                    {question.code && (
                        <Box component="pre" sx={{ mt: 1, mb: 0, p: 1, borderRadius: "8px", bgcolor: "rgba(0,0,0,0.35)", fontSize: 12, overflowX: "auto", maxHeight: 160 }}>
                            {question.code}
                        </Box>
                    )}
                    {question.imageUrl && <Box component="img" src={question.imageUrl} alt="" sx={{ mt: 1, maxHeight: 120, borderRadius: "8px", display: "block" }} />}

                    {isChoice && (
                        <Stack direction="row" spacing={0.75} sx={{ mt: 1, flexWrap: "wrap" }} useFlexGap>
                            {question.options.map((o, i) => (
                                <Chip
                                    key={o.optionId}
                                    size="small"
                                    label={`${String.fromCharCode(65 + i)}. ${o.optionText}`}
                                    color={o.isCorrect ? "success" : "default"}
                                    variant={o.isCorrect ? "filled" : "outlined"}
                                    sx={{ maxWidth: 320 }}
                                />
                            ))}
                        </Stack>
                    )}

                    {question.questionType === "lab_task" && (
                        <Stack direction="row" spacing={0.75} sx={{ mt: 1, flexWrap: "wrap", alignItems: "center" }} useFlexGap>
                            <Chip size="small" variant="outlined" label={`${question.taskBlocks?.length ?? 0} content block${question.taskBlocks?.length === 1 ? "" : "s"}`} />
                            <Chip size="small" variant="outlined" label={`Verify: ${question.verificationMode ?? "round default"}`} />
                            {question.flags.map((f) => (
                                <Chip key={f.flagId} size="small" color="secondary" variant="outlined" label={`⚑ ${f.label} · ${f.marks}`} />
                            ))}
                            {question.tools.map((t) => (
                                <Chip key={t} size="small" label={t} />
                            ))}
                        </Stack>
                    )}

                    {hasReference && (
                        <>
                            <Button size="small" color="inherit" sx={{ mt: 0.75, px: 0.5 }} startIcon={expanded ? <MdExpandLess /> : <MdExpandMore />} onClick={() => setExpanded((v) => !v)}>
                                Evaluation reference
                            </Button>
                            <Collapse in={expanded}>
                                <Stack spacing={0.75} sx={{ p: 1.25, borderRadius: "10px", bgcolor: "rgba(168,85,247,0.06)" }}>
                                    {question.expectedAnswer && (
                                        <Typography variant="caption" sx={{ whiteSpace: "pre-wrap" }}>
                                            <b>Expected:</b> {question.expectedAnswer}
                                        </Typography>
                                    )}
                                    {question.keyPoints.length > 0 && (
                                        <Typography variant="caption">
                                            <b>Key points:</b> {question.keyPoints.join(" · ")}
                                        </Typography>
                                    )}
                                    {question.evaluationGuide && (
                                        <Typography variant="caption" sx={{ whiteSpace: "pre-wrap" }}>
                                            <b>Guide:</b> {question.evaluationGuide}
                                        </Typography>
                                    )}
                                    {question.solutionBlocks?.length ? (
                                        <Typography variant="caption">
                                            <b>Solution:</b> {question.solutionBlocks.length} block{question.solutionBlocks.length === 1 ? "" : "s"}
                                        </Typography>
                                    ) : null}
                                </Stack>
                            </Collapse>
                        </>
                    )}
                    {question.explanation && (
                        <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.75 }}>
                            Explanation: {question.explanation}
                        </Typography>
                    )}
                </Box>
                {actions && <Stack direction="row" sx={{ alignItems: "center" }}>{actions}</Stack>}
            </Stack>
        </Box>
    );
}
