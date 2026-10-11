"use client";

import React, { useMemo, useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    MenuItem,
    Radio,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { MdAdd, MdDeleteOutline, MdEdit, MdOutlineFileUpload, MdSave } from "react-icons/md";
import {
    useCourse,
    type AdminLessonDetail,
    type QuestionInput,
    type QuestionType,
    type QuizQuestionWithOptions,
    type QuizRecord,
    type QuizSettingsInput,
    type RevealMode,
} from "@/contexts/CourseContext";
import { GlassCard, MoveButtons, StringListField, moveId, notify, useConfirm } from "../ui";

/* ───────────────────────────── settings ───────────────────────────── */

interface SettingsForm {
    title: string;
    introLines: string[];
    timeLimitMin: string;
    passingScorePct: string;
    accuracyBonusThresholdPct: string;
    accuracyBonusXp: string;
    maxAttempts: string;
    retakeCooldownMin: string;
    questionsPerAttempt: string;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    revealMode: RevealMode;
}

function toSettingsForm(quiz: QuizRecord | null): SettingsForm {
    return {
        title: quiz?.title ?? "Knowledge Test",
        introLines: quiz?.introLines ?? ["Ready to prove what you’ve learned?", "Test your understanding, improve your skill score, and earn XP."],
        timeLimitMin: quiz?.timeLimitSec ? String(Math.round(quiz.timeLimitSec / 60)) : "",
        passingScorePct: String(quiz?.passingScorePct ?? 50),
        accuracyBonusThresholdPct: String(quiz?.accuracyBonusThresholdPct ?? 80),
        accuracyBonusXp: String(quiz?.accuracyBonusXp ?? 0),
        maxAttempts: quiz?.maxAttempts ? String(quiz.maxAttempts) : "",
        retakeCooldownMin: quiz?.retakeCooldownMin ? String(quiz.retakeCooldownMin) : "",
        questionsPerAttempt: quiz?.questionsPerAttempt ? String(quiz.questionsPerAttempt) : "",
        shuffleQuestions: quiz?.shuffleQuestions ?? false,
        shuffleOptions: quiz?.shuffleOptions ?? false,
        revealMode: quiz?.revealMode ?? "immediate",
    };
}

function toSettingsInput(form: SettingsForm): QuizSettingsInput {
    const opt = (v: string) => (v.trim() ? Number(v) : null);
    return {
        title: form.title.trim() || null,
        introLines: form.introLines.map((l) => l.trim()).filter(Boolean),
        timeLimitSec: form.timeLimitMin.trim() ? Math.round(Number(form.timeLimitMin) * 60) : null,
        passingScorePct: Number(form.passingScorePct) || 0,
        accuracyBonusThresholdPct: Number(form.accuracyBonusThresholdPct) || 0,
        accuracyBonusXp: Number(form.accuracyBonusXp) || 0,
        maxAttempts: opt(form.maxAttempts),
        retakeCooldownMin: opt(form.retakeCooldownMin),
        questionsPerAttempt: opt(form.questionsPerAttempt),
        shuffleQuestions: form.shuffleQuestions,
        shuffleOptions: form.shuffleOptions,
        revealMode: form.revealMode,
    };
}

/* ───────────────────────────── question dialog ───────────────────────────── */

interface QuestionForm {
    questionType: QuestionType;
    prompt: string;
    explanation: string;
    points: string;
    options: { optionText: string; isCorrect: boolean }[];
}

const TRUE_FALSE = [
    { optionText: "True", isCorrect: true },
    { optionText: "False", isCorrect: false },
];

function toQuestionForm(q?: QuizQuestionWithOptions | null): QuestionForm {
    if (!q) {
        return {
            questionType: "single_choice",
            prompt: "",
            explanation: "",
            points: "1",
            options: [
                { optionText: "", isCorrect: true },
                { optionText: "", isCorrect: false },
                { optionText: "", isCorrect: false },
                { optionText: "", isCorrect: false },
            ],
        };
    }
    return {
        questionType: q.questionType,
        prompt: q.prompt,
        explanation: q.explanation ?? "",
        points: String(q.points),
        options: q.options.map((o) => ({ optionText: o.optionText, isCorrect: o.isCorrect })),
    };
}

/** Mirrors the API rule: single_choice / true_false → exactly one correct, multiple_choice → at least one. */
export function validateQuestion(q: QuestionInput): string | null {
    if (!q.prompt.trim()) return "Write the question";
    const options = q.options.filter((o) => o.optionText.trim());
    if (options.length < 2) return "Add at least two options";
    if (q.questionType === "true_false" && options.length !== 2) return "True/False needs exactly two options";
    const correct = options.filter((o) => o.isCorrect).length;
    if (q.questionType === "multiple_choice" ? correct < 1 : correct !== 1) {
        return q.questionType === "multiple_choice" ? "Mark at least one correct option" : "Mark exactly one correct option";
    }
    return null;
}

function formToQuestionInput(form: QuestionForm): QuestionInput {
    return {
        questionType: form.questionType,
        prompt: form.prompt.trim(),
        explanation: form.explanation.trim() || null,
        points: Math.max(1, Number(form.points) || 1),
        options: form.options.filter((o) => o.optionText.trim()).map((o) => ({ optionText: o.optionText.trim(), isCorrect: o.isCorrect })),
    };
}

function QuestionDialog({
    open,
    initial,
    onClose,
    onSubmit,
}: {
    open: boolean;
    initial: QuizQuestionWithOptions | null;
    onClose: () => void;
    onSubmit: (input: QuestionInput) => Promise<boolean>;
}) {
    const [form, setForm] = useState<QuestionForm>(() => toQuestionForm(initial));
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const single = form.questionType !== "multiple_choice";

    const setType = (questionType: QuestionType) => {
        if (questionType === "true_false") return setForm({ ...form, questionType, options: TRUE_FALSE.map((o) => ({ ...o })) });
        let options = form.options;
        if (questionType === "single_choice") {
            const first = options.findIndex((o) => o.isCorrect);
            options = options.map((o, i) => ({ ...o, isCorrect: i === (first < 0 ? 0 : first) }));
        }
        setForm({ ...form, questionType, options });
    };

    const toggleCorrect = (index: number) =>
        setForm({
            ...form,
            options: form.options.map((o, i) => (single ? { ...o, isCorrect: i === index } : i === index ? { ...o, isCorrect: !o.isCorrect } : o)),
        });

    const submit = async () => {
        const input = formToQuestionInput(form);
        const problem = validateQuestion(input);
        setError(problem);
        if (problem) return;
        setBusy(true);
        const ok = await onSubmit(input);
        setBusy(false);
        if (ok) onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{initial ? "Edit question" : "New question"}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField select label="Type" value={form.questionType} onChange={(e) => setType(e.target.value as QuestionType)} sx={{ minWidth: 220 }}>
                            <MenuItem value="single_choice">Single choice</MenuItem>
                            <MenuItem value="multiple_choice">Multiple choice</MenuItem>
                            <MenuItem value="true_false">True / False</MenuItem>
                        </TextField>
                        <TextField
                            label="Weight"
                            type="number"
                            value={form.points}
                            onChange={(e) => setForm({ ...form, points: e.target.value })}
                            sx={{ maxWidth: 140 }}
                            helperText="Share of the score"
                        />
                    </Stack>
                    <TextField label="Question" multiline minRows={2} value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} />

                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Options — {single ? "select the correct answer" : "tick every correct answer"}
                        </Typography>
                        <Stack spacing={1}>
                            {form.options.map((option, index) => (
                                <Stack key={index} direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                    {single ? (
                                        <Radio checked={option.isCorrect} onChange={() => toggleCorrect(index)} />
                                    ) : (
                                        <Checkbox checked={option.isCorrect} onChange={() => toggleCorrect(index)} />
                                    )}
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder={`Option ${index + 1}`}
                                        value={option.optionText}
                                        disabled={form.questionType === "true_false"}
                                        onChange={(e) =>
                                            setForm({ ...form, options: form.options.map((o, i) => (i === index ? { ...o, optionText: e.target.value } : o)) })
                                        }
                                    />
                                    {form.questionType !== "true_false" && (
                                        <IconButton
                                            aria-label="Remove option"
                                            disabled={form.options.length <= 2}
                                            onClick={() => setForm({ ...form, options: form.options.filter((_, i) => i !== index) })}
                                        >
                                            <MdDeleteOutline />
                                        </IconButton>
                                    )}
                                </Stack>
                            ))}
                        </Stack>
                        {form.questionType !== "true_false" && form.options.length < 10 && (
                            <Button size="small" startIcon={<MdAdd />} sx={{ mt: 1 }} onClick={() => setForm({ ...form, options: [...form.options, { optionText: "", isCorrect: false }] })}>
                                Add option
                            </Button>
                        )}
                    </Box>

                    <TextField
                        label="Explanation (shown after answering)"
                        multiline
                        minRows={2}
                        value={form.explanation}
                        onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                    />
                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={submit} disabled={busy}>
                    {initial ? "Save question" : "Add question"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ───────────────────────────── import dialog ───────────────────────────── */

const IMPORT_EXAMPLE = `[
  {
    "questionType": "single_choice",
    "prompt": "Which layer routes packets using IP addresses?",
    "explanation": "The Network layer (Layer 3) handles routing.",
    "options": [
      { "optionText": "Network", "isCorrect": true },
      { "optionText": "Data Link", "isCorrect": false }
    ]
  }
]`;

function ImportDialog({ open, onClose, onImport }: { open: boolean; onClose: () => void; onImport: (questions: QuestionInput[]) => Promise<boolean> }) {
    const [text, setText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const submit = async () => {
        let parsed: unknown;
        try {
            parsed = JSON.parse(text);
        } catch {
            return setError("That isn't valid JSON");
        }
        if (!Array.isArray(parsed) || !parsed.length) return setError("Paste a JSON array of questions");
        const questions = parsed.map((raw) => {
            const q = raw as Partial<QuestionInput>;
            return {
                questionType: q.questionType ?? "single_choice",
                prompt: String(q.prompt ?? ""),
                explanation: q.explanation ?? null,
                points: q.points ?? 1,
                options: (q.options ?? []).map((o) => ({ optionText: String(o.optionText ?? ""), isCorrect: Boolean(o.isCorrect) })),
            } as QuestionInput;
        });
        for (const [i, q] of questions.entries()) {
            const problem = validateQuestion(q);
            if (problem) return setError(`Question ${i + 1}: ${problem}`);
        }
        setError(null);
        setBusy(true);
        const ok = await onImport(questions);
        setBusy(false);
        if (ok) {
            setText("");
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Import questions</DialogTitle>
            <DialogContent dividers>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Paste a JSON array. Each question needs a prompt and options; mark correct ones with <code>isCorrect</code>.
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    minRows={12}
                    value={text}
                    placeholder={IMPORT_EXAMPLE}
                    onChange={(e) => setText(e.target.value)}
                    slotProps={{ htmlInput: { style: { fontFamily: "ui-monospace, monospace", fontSize: 13 } } }}
                />
                {error && (
                    <Typography color="error" variant="body2" sx={{ mt: 1.5 }}>
                        {error}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={submit} disabled={busy || !text.trim()}>
                    Import
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ───────────────────────────── editor ───────────────────────────── */

export default function QuizEditor({ lesson }: { lesson: AdminLessonDetail }) {
    const { upsertQuiz, createQuestion, updateQuestion, deleteQuestion, reorderQuestions, importQuestions, saving } = useCourse();
    const { confirm, dialog } = useConfirm();
    const quiz = lesson.quiz;
    const [form, setForm] = useState<SettingsForm>(() => toSettingsForm(quiz));
    const [editing, setEditing] = useState<{ question: QuizQuestionWithOptions | null } | null>(null);
    const [importing, setImporting] = useState(false);
    const [showRetired, setShowRetired] = useState(false);

    const active = useMemo(() => (quiz?.questions ?? []).filter((q) => q.isActive), [quiz]);
    const retired = useMemo(() => (quiz?.questions ?? []).filter((q) => !q.isActive), [quiz]);
    const totalWeight = active.reduce((sum, q) => sum + q.points, 0);
    const set = <K extends keyof SettingsForm>(key: K, v: SettingsForm[K]) => setForm((f) => ({ ...f, [key]: v }));

    const saveSettings = async () => notify(await upsertQuiz(lesson.lessonId, toSettingsInput(form)));

    const removeQuestion = async (question: QuizQuestionWithOptions) => {
        const ok = await confirm({
            title: "Remove this question?",
            description: "Questions that students already answered are retired instead of deleted, so their attempt history stays intact.",
            confirmLabel: "Remove",
            danger: true,
        });
        if (ok) notify(await deleteQuestion(question.questionId));
    };

    const move = async (index: number, dir: -1 | 1) => {
        if (!quiz) return;
        notify(await reorderQuestions(quiz.quizId, moveId(active.map((q) => q.questionId), index, dir)), "Order updated");
    };

    return (
        <Stack spacing={2.5}>
            <GlassCard sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Quiz settings
                </Typography>
                <Stack spacing={2}>
                    <TextField label="Title" value={form.title} onChange={(e) => set("title", e.target.value)} />
                    <StringListField label="Intro lines (quiz start card)" value={form.introLines} onChange={(v) => set("introLines", v)} addLabel="Add line" />
                    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" } }}>
                        <TextField label="Time limit (min)" type="number" value={form.timeLimitMin} onChange={(e) => set("timeLimitMin", e.target.value)} helperText="Empty = untimed" />
                        <TextField label="Pass mark (%)" type="number" value={form.passingScorePct} onChange={(e) => set("passingScorePct", e.target.value)} />
                        <TextField label="Max attempts" type="number" value={form.maxAttempts} onChange={(e) => set("maxAttempts", e.target.value)} helperText="Empty = unlimited" />
                        <TextField label="Accuracy bonus at (%)" type="number" value={form.accuracyBonusThresholdPct} onChange={(e) => set("accuracyBonusThresholdPct", e.target.value)} />
                        <TextField label="Accuracy bonus XP" type="number" value={form.accuracyBonusXp} onChange={(e) => set("accuracyBonusXp", e.target.value)} />
                        <TextField label="Retake cooldown (min)" type="number" value={form.retakeCooldownMin} onChange={(e) => set("retakeCooldownMin", e.target.value)} />
                        <TextField
                            label="Questions per attempt"
                            type="number"
                            value={form.questionsPerAttempt}
                            onChange={(e) => set("questionsPerAttempt", e.target.value)}
                            helperText="Random pool; empty = all"
                        />
                        <TextField select label="Reveal answers" value={form.revealMode} onChange={(e) => set("revealMode", e.target.value as RevealMode)}>
                            <MenuItem value="immediate">After each question</MenuItem>
                            <MenuItem value="after_submit">After submitting</MenuItem>
                            <MenuItem value="never">Never</MenuItem>
                        </TextField>
                    </Box>
                    <Stack direction="row" spacing={3} sx={{ flexWrap: "wrap" }}>
                        <FormControlLabel control={<Switch checked={form.shuffleQuestions} onChange={(e) => set("shuffleQuestions", e.target.checked)} />} label="Shuffle questions" />
                        <FormControlLabel control={<Switch checked={form.shuffleOptions} onChange={(e) => set("shuffleOptions", e.target.checked)} />} label="Shuffle options" />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                        Score XP = lesson XP ({lesson.xp}) × score. Students only earn the improvement on retakes.
                    </Typography>
                    <Box>
                        <Button variant="contained" startIcon={<MdSave />} onClick={saveSettings} disabled={saving}>
                            Save settings
                        </Button>
                    </Box>
                </Stack>
            </GlassCard>

            <GlassCard sx={{ p: 2.5 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { sm: "center" }, mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1">Questions ({active.length})</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Total weight {totalWeight}
                        </Typography>
                    </Box>
                    <Button variant="outlined" startIcon={<MdOutlineFileUpload />} disabled={!quiz} onClick={() => setImporting(true)}>
                        Import JSON
                    </Button>
                    <Button variant="contained" startIcon={<MdAdd />} disabled={!quiz} onClick={() => setEditing({ question: null })}>
                        Add question
                    </Button>
                </Stack>

                {!quiz ? (
                    <Typography variant="body2" color="text.secondary">
                        Save the quiz settings first to start adding questions.
                    </Typography>
                ) : !active.length ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                        No questions yet.
                    </Typography>
                ) : (
                    <Stack spacing={1}>
                        {active.map((question, index) => (
                            <QuestionRow
                                key={question.questionId}
                                question={question}
                                index={index}
                                onEdit={() => setEditing({ question })}
                                onDelete={() => removeQuestion(question)}
                                move={
                                    <MoveButtons
                                        onUp={() => move(index, -1)}
                                        onDown={() => move(index, 1)}
                                        disableUp={index === 0 || saving}
                                        disableDown={index === active.length - 1 || saving}
                                    />
                                }
                            />
                        ))}
                    </Stack>
                )}

                {retired.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Button size="small" color="inherit" onClick={() => setShowRetired((v) => !v)}>
                            {showRetired ? "Hide" : "Show"} {retired.length} retired question{retired.length > 1 ? "s" : ""}
                        </Button>
                        {showRetired && (
                            <Stack spacing={1} sx={{ mt: 1, opacity: 0.6 }}>
                                {retired.map((question, index) => (
                                    <QuestionRow key={question.questionId} question={question} index={index} />
                                ))}
                            </Stack>
                        )}
                    </Box>
                )}
            </GlassCard>

            {editing && quiz && (
                <QuestionDialog
                    key={editing.question?.questionId ?? "new"}
                    open
                    initial={editing.question}
                    onClose={() => setEditing(null)}
                    onSubmit={async (input) =>
                        notify(editing.question ? await updateQuestion(editing.question.questionId, input) : await createQuestion(quiz.quizId, input))
                    }
                />
            )}
            {quiz && <ImportDialog open={importing} onClose={() => setImporting(false)} onImport={async (questions) => notify(await importQuestions(quiz.quizId, questions))} />}
            {dialog}
        </Stack>
    );
}

function QuestionRow({
    question,
    index,
    onEdit,
    onDelete,
    move,
}: {
    question: QuizQuestionWithOptions;
    index: number;
    onEdit?: () => void;
    onDelete?: () => void;
    move?: React.ReactNode;
}) {
    return (
        <Box sx={{ p: 1.5, borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", bgcolor: "rgba(255,255,255,0.02)" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                <Typography sx={{ fontWeight: 700, color: "text.secondary", minWidth: 24 }}>{index + 1}.</Typography>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: "pre-wrap" }}>
                        {question.prompt}
                    </Typography>
                    <Stack direction="row" spacing={0.75} sx={{ mt: 1, flexWrap: "wrap" }} useFlexGap>
                        {question.options.map((o) => (
                            <Chip
                                key={o.optionId}
                                size="small"
                                label={o.optionText}
                                color={o.isCorrect ? "success" : "default"}
                                variant={o.isCorrect ? "filled" : "outlined"}
                                sx={{ maxWidth: 260 }}
                            />
                        ))}
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block" }}>
                        {question.questionType.replace("_", " ")} · weight {question.points}
                        {question.explanation ? " · has explanation" : ""}
                    </Typography>
                </Box>
                {move}
                {onEdit && (
                    <Tooltip title="Edit">
                        <IconButton size="small" onClick={onEdit}>
                            <MdEdit />
                        </IconButton>
                    </Tooltip>
                )}
                {onDelete && (
                    <Tooltip title="Remove">
                        <IconButton size="small" color="error" onClick={onDelete}>
                            <MdDeleteOutline />
                        </IconButton>
                    </Tooltip>
                )}
            </Stack>
        </Box>
    );
}
