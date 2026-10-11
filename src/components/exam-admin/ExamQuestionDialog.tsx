"use client";

import React, { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    MenuItem,
    Radio,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { MdAdd, MdDeleteOutline, MdExpandLess, MdExpandMore } from "react-icons/md";
import {
    CHOICE_QUESTION_TYPES,
    ROUND_QUESTION_TYPES,
    type AdminExamQuestion,
    type ExamEvaluationMode,
    type ExamLabProvider,
    type ExamLabVerificationMode,
    type ExamQuestionInput,
    type ExamQuestionType,
    type ExamRoundRecord,
} from "@/contexts/ExamContext";
import type { ContentBlock } from "@/contexts/CourseContext";
import { ImageUploadField, StringListField } from "@/components/course-admin/ui";
import ContentBlocksEditor, { cleanBlocks, validateBlocks } from "@/components/course-admin/builder/ContentBlocksEditor";
import { QUESTION_TYPE_LABELS } from "./exam-ui";

/* ───────────────────────────── validation ───────────────────────────── */

const isChoice = (type: ExamQuestionType) => CHOICE_QUESTION_TYPES.includes(type);
const usesAi = (mode: ExamEvaluationMode) => mode === "ai" || mode === "ai_assisted";

/** Mirrors the API's questionSchema + set-publish rules. Returns an error (blocking) or null. */
export function validateExamQuestion(q: ExamQuestionInput, round: Pick<ExamRoundRecord, "roundType">): string | null {
    if (!ROUND_QUESTION_TYPES[round.roundType].includes(q.questionType)) {
        return `${QUESTION_TYPE_LABELS[q.questionType] ?? q.questionType} isn't allowed in this round`;
    }
    if (!q.prompt?.trim()) return "Write the question / task";
    if (q.marks !== null && q.marks !== undefined && (q.marks < 0 || q.marks > 1000)) return "Marks must be 0–1000";
    if (q.negativeMarks !== null && q.negativeMarks !== undefined && (q.negativeMarks < 0 || q.negativeMarks > 1000)) return "Negative marks must be 0–1000";
    if (q.answerTimeLimitSec !== null && q.answerTimeLimitSec !== undefined && (q.answerTimeLimitSec < 10 || q.answerTimeLimitSec > 10800)) {
        return "Answer time limit must be 10 s – 3 h";
    }
    if (isChoice(q.questionType)) {
        const options = q.options ?? [];
        if (options.length < 2) return "Add at least two options";
        if (options.length > 12) return "At most 12 options";
        if (options.some((o) => !o.optionText.trim())) return "Every option needs text";
        const correct = options.filter((o) => o.isCorrect).length;
        if (q.questionType === "true_false" && options.length !== 2) return "True / False needs exactly two options";
        if (q.questionType === "multiple_choice" ? correct < 1 : correct !== 1) {
            return q.questionType === "multiple_choice" ? "Mark at least one correct option" : "Mark exactly one correct option";
        }
    } else if (q.options?.length) return "Only choice questions have options";

    if (q.questionType === "lab_task") {
        if (!q.taskBlocks?.length) return "Describe the lab task (add at least one content block)";
        const blockProblem = validateBlocks(q.taskBlocks) ?? (q.solutionBlocks?.length ? validateBlocks(q.solutionBlocks) : null);
        if (blockProblem) return blockProblem;
        if (q.verificationMode === "flag" && !q.flags?.length) return "Flag-verified tasks need at least one flag";
        for (const f of q.flags ?? []) {
            if (!f.label.trim()) return "Every flag needs a label";
            if (!f.flag?.trim() && !f.flagId) return `Flag "${f.label}" needs a value`;
        }
    } else if (q.flags?.length) return "Only lab tasks can have flags";
    return null;
}

/** Non-blocking hint: AI-evaluated answers need something to compare against (blocking at set publish). */
export function aiReferenceWarning(q: ExamQuestionInput, round: Pick<ExamRoundRecord, "evaluationMode">): string | null {
    const aiPath = q.questionType === "lab_task" ? q.verificationMode === "ai" || (!q.verificationMode && usesAi(round.evaluationMode)) : !isChoice(q.questionType) && usesAi(round.evaluationMode);
    if (aiPath && !q.expectedAnswer?.trim() && !q.keyPoints?.length && !q.evaluationGuide?.trim()) {
        return "This answer is AI-evaluated — add an expected answer, key points or a marking guide (required before the set can be published).";
    }
    return null;
}

/* ───────────────────────────── form model ───────────────────────────── */

interface FlagRow {
    flagId?: string;
    label: string;
    flag: string;
    marks: string;
}

interface QuestionForm {
    questionType: ExamQuestionType;
    section: string;
    prompt: string;
    scenario: string;
    code: string;
    codeLanguage: string;
    imageUrl: string | null;
    marks: string;
    negativeMarks: string;
    explanation: string;
    options: { optionText: string; isCorrect: boolean; imageUrl: string | null }[];
    expectedAnswer: string;
    keyPoints: string[];
    evaluationGuide: string;
    answerTimeLimitSec: string;
    taskBlocks: ContentBlock[];
    solutionBlocks: ContentBlock[];
    labProvider: "" | ExamLabProvider;
    launchUrl: string;
    environmentTemplateId: string;
    tools: string[];
    verificationMode: "" | ExamLabVerificationMode;
    flags: FlagRow[];
}

const TRUE_FALSE = () => [
    { optionText: "True", isCorrect: true, imageUrl: null },
    { optionText: "False", isCorrect: false, imageUrl: null },
];
const BLANK_OPTIONS = () => [0, 1, 2, 3].map((i) => ({ optionText: "", isCorrect: i === 0, imageUrl: null }));

function toForm(q: AdminExamQuestion | null, round: ExamRoundRecord): QuestionForm {
    const type = q?.questionType ?? ROUND_QUESTION_TYPES[round.roundType][0];
    return {
        questionType: type,
        section: q?.section ?? "",
        prompt: q?.prompt ?? "",
        scenario: q?.scenario ?? "",
        code: q?.code ?? "",
        codeLanguage: q?.codeLanguage ?? "",
        imageUrl: q?.imageUrl ?? null,
        marks: q?.marks !== null && q?.marks !== undefined ? String(q.marks) : "",
        negativeMarks: q?.negativeMarks !== null && q?.negativeMarks !== undefined ? String(q.negativeMarks) : "",
        explanation: q?.explanation ?? "",
        options: q ? q.options.map((o) => ({ optionText: o.optionText, isCorrect: o.isCorrect, imageUrl: o.imageUrl })) : isChoice(type) ? (type === "true_false" ? TRUE_FALSE() : BLANK_OPTIONS()) : [],
        expectedAnswer: q?.expectedAnswer ?? "",
        keyPoints: q?.keyPoints ?? [],
        evaluationGuide: q?.evaluationGuide ?? "",
        answerTimeLimitSec: q?.answerTimeLimitSec ? String(q.answerTimeLimitSec) : "",
        taskBlocks: q?.taskBlocks ?? [],
        solutionBlocks: q?.solutionBlocks ?? [],
        labProvider: q?.labProvider ?? "",
        launchUrl: q?.launchUrl ?? "",
        environmentTemplateId: q?.environmentTemplateId ?? "",
        tools: q?.tools ?? [],
        verificationMode: q?.verificationMode ?? "",
        flags: (q?.flags ?? []).map((f) => ({ flagId: f.flagId, label: f.label, flag: "", marks: String(f.marks) })),
    };
}

const num = (v: string) => (v.trim() === "" ? null : Number(v));
const text = (v: string) => (v.trim() ? v.trim() : null);

function toInput(form: QuestionForm): ExamQuestionInput {
    const choice = isChoice(form.questionType);
    const lab = form.questionType === "lab_task";
    const openAnswer = form.questionType === "viva" || form.questionType === "hr" || lab;
    return {
        questionType: form.questionType,
        section: text(form.section),
        prompt: form.prompt.trim(),
        scenario: text(form.scenario),
        code: text(form.code),
        codeLanguage: form.code.trim() ? text(form.codeLanguage) : null,
        imageUrl: form.imageUrl,
        marks: num(form.marks),
        negativeMarks: choice ? num(form.negativeMarks) : null,
        explanation: text(form.explanation),
        options: choice ? form.options.map((o) => ({ optionText: o.optionText.trim(), isCorrect: o.isCorrect, imageUrl: o.imageUrl })) : [],
        expectedAnswer: openAnswer ? text(form.expectedAnswer) : null,
        keyPoints: openAnswer ? form.keyPoints.map((k) => k.trim()).filter(Boolean) : [],
        evaluationGuide: openAnswer ? text(form.evaluationGuide) : null,
        answerTimeLimitSec: form.questionType === "viva" || form.questionType === "hr" ? num(form.answerTimeLimitSec) : null,
        taskBlocks: lab ? cleanBlocks(form.taskBlocks) : null,
        solutionBlocks: lab && form.solutionBlocks.length ? cleanBlocks(form.solutionBlocks) : null,
        labProvider: lab && form.labProvider ? form.labProvider : null,
        launchUrl: lab ? text(form.launchUrl) : null,
        environmentTemplateId: lab ? text(form.environmentTemplateId) : null,
        tools: lab ? form.tools.map((t) => t.trim()).filter(Boolean) : [],
        verificationMode: lab && form.verificationMode ? form.verificationMode : null,
        flags: lab
            ? form.flags.map((f) => ({
                label: f.label.trim(),
                ...(f.flag.trim() ? { flag: f.flag.trim() } : f.flagId ? { flagId: f.flagId } : {}),
                marks: Number(f.marks) || 0,
            }))
            : [],
    };
}

/* ───────────────────────────── dialog ───────────────────────────── */

export default function ExamQuestionDialog({
    open,
    round,
    initial,
    onClose,
    onSubmit,
}: {
    open: boolean;
    round: ExamRoundRecord;
    initial: AdminExamQuestion | null;
    onClose: () => void;
    onSubmit: (input: ExamQuestionInput) => Promise<boolean>;
}) {
    const [form, setForm] = useState<QuestionForm>(() => toForm(initial, round));
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [showExtras, setShowExtras] = useState(Boolean(initial?.scenario || initial?.code || initial?.imageUrl));
    const set = <K extends keyof QuestionForm>(key: K, value: QuestionForm[K]) => setForm((f) => ({ ...f, [key]: value }));

    const type = form.questionType;
    const choice = isChoice(type);
    const single = type !== "multiple_choice";
    const lab = type === "lab_task";
    const openAnswer = type === "viva" || type === "hr";
    const allowedTypes = ROUND_QUESTION_TYPES[round.roundType];
    const warning = aiReferenceWarning(toInput(form), round);

    const changeType = (next: ExamQuestionType) => {
        if (next === "true_false") return setForm({ ...form, questionType: next, options: TRUE_FALSE() });
        let options = form.options.length >= 2 && form.questionType !== "true_false" ? form.options : BLANK_OPTIONS();
        if (next === "single_choice") {
            const first = options.findIndex((o) => o.isCorrect);
            options = options.map((o, i) => ({ ...o, isCorrect: i === (first < 0 ? 0 : first) }));
        }
        setForm({ ...form, questionType: next, options });
    };

    const toggleCorrect = (index: number) =>
        set(
            "options",
            form.options.map((o, i) => (single ? { ...o, isCorrect: i === index } : i === index ? { ...o, isCorrect: !o.isCorrect } : o))
        );

    const submit = async () => {
        const input = toInput(form);
        const problem = validateExamQuestion(input, round);
        setError(problem);
        if (problem) return;
        setBusy(true);
        const ok = await onSubmit(input);
        setBusy(false);
        if (ok) onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{initial ? "Edit question" : `New ${lab ? "lab task" : "question"}`}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.25}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField select label="Type" value={type} onChange={(e) => changeType(e.target.value as ExamQuestionType)} disabled={allowedTypes.length === 1} sx={{ minWidth: 230 }}>
                            {allowedTypes.map((t) => (
                                <MenuItem key={t} value={t}>
                                    {QUESTION_TYPE_LABELS[t]}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField label="Section / topic" value={form.section} onChange={(e) => set("section", e.target.value)} placeholder="Routing" helperText="Groups the student report" sx={{ flex: 1 }} />
                        <TextField
                            label="Marks"
                            type="number"
                            value={form.marks}
                            onChange={(e) => set("marks", e.target.value)}
                            placeholder={String(round.defaultMarks)}
                            helperText={`Empty = round default (${round.defaultMarks})`}
                            sx={{ width: 150 }}
                        />
                        {choice && (
                            <TextField
                                label="Negative marks"
                                type="number"
                                value={form.negativeMarks}
                                onChange={(e) => set("negativeMarks", e.target.value)}
                                placeholder={String(round.defaultNegativeMarks)}
                                helperText={`Empty = ${round.defaultNegativeMarks}`}
                                sx={{ width: 150 }}
                            />
                        )}
                    </Stack>

                    <TextField label={lab ? "Task summary" : "Question"} multiline minRows={2} value={form.prompt} onChange={(e) => set("prompt", e.target.value)} />

                    <Box>
                        <Button size="small" color="inherit" startIcon={showExtras ? <MdExpandLess /> : <MdExpandMore />} onClick={() => setShowExtras((v) => !v)}>
                            Scenario, code listing & exhibit image
                        </Button>
                        <Collapse in={showExtras}>
                            <Stack spacing={2} sx={{ mt: 1.5 }}>
                                <TextField label="Scenario" multiline minRows={2} value={form.scenario} onChange={(e) => set("scenario", e.target.value)} />
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                    <TextField
                                        label="Code / config listing"
                                        multiline
                                        minRows={3}
                                        value={form.code}
                                        onChange={(e) => set("code", e.target.value)}
                                        sx={{ flex: 1 }}
                                        slotProps={{ htmlInput: { style: { fontFamily: "ui-monospace, monospace", fontSize: 13 } } }}
                                    />
                                    <TextField label="Language" value={form.codeLanguage} onChange={(e) => set("codeLanguage", e.target.value)} placeholder="cisco-ios" sx={{ width: { sm: 160 } }} />
                                </Stack>
                                <ImageUploadField label="Exhibit image" value={form.imageUrl} onChange={(url) => set("imageUrl", url)} folder="content-images" />
                            </Stack>
                        </Collapse>
                    </Box>

                    {choice && (
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Options — {single ? "select the correct answer" : "tick every correct answer"}
                            </Typography>
                            <Stack spacing={1}>
                                {form.options.map((option, index) => (
                                    <Stack key={index} direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                        {single ? <Radio checked={option.isCorrect} onChange={() => toggleCorrect(index)} /> : <Checkbox checked={option.isCorrect} onChange={() => toggleCorrect(index)} />}
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                            value={option.optionText}
                                            disabled={type === "true_false"}
                                            onChange={(e) => set("options", form.options.map((o, i) => (i === index ? { ...o, optionText: e.target.value } : o)))}
                                        />
                                        {type !== "true_false" && (
                                            <IconButton aria-label="Remove option" disabled={form.options.length <= 2} onClick={() => set("options", form.options.filter((_, i) => i !== index))}>
                                                <MdDeleteOutline />
                                            </IconButton>
                                        )}
                                    </Stack>
                                ))}
                            </Stack>
                            {type !== "true_false" && form.options.length < 12 && (
                                <Button size="small" startIcon={<MdAdd />} sx={{ mt: 1 }} onClick={() => set("options", [...form.options, { optionText: "", isCorrect: false, imageUrl: null }])}>
                                    Add option
                                </Button>
                            )}
                        </Box>
                    )}

                    {(openAnswer || lab) && (
                        <>
                            <Divider />
                            <Typography variant="overline" color="text.secondary">
                                Reference for evaluation (never shown to students)
                            </Typography>
                            <TextField
                                label={lab ? "Expected outcome / correct configuration" : "Expected answer"}
                                multiline
                                minRows={3}
                                value={form.expectedAnswer}
                                onChange={(e) => set("expectedAnswer", e.target.value)}
                                helperText="What a full-marks answer contains — the AI and evaluators compare against it."
                            />
                            <StringListField label="Key points (each should be covered)" value={form.keyPoints} onChange={(v) => set("keyPoints", v)} addLabel="Add key point" />
                            <TextField
                                label="Marking guide"
                                multiline
                                minRows={2}
                                value={form.evaluationGuide}
                                onChange={(e) => set("evaluationGuide", e.target.value)}
                                placeholder="e.g. 50% for the definition, 50% for a correct example"
                            />
                            {openAnswer && (
                                <TextField
                                    label="Suggested answer time (seconds)"
                                    type="number"
                                    value={form.answerTimeLimitSec}
                                    onChange={(e) => set("answerTimeLimitSec", e.target.value)}
                                    sx={{ maxWidth: 260 }}
                                    helperText="Shown to the student as a hint"
                                />
                            )}
                        </>
                    )}

                    {lab && (
                        <>
                            <Divider />
                            <Typography variant="overline" color="text.secondary">
                                Task content (shown to the student)
                            </Typography>
                            <ContentBlocksEditor value={form.taskBlocks} onChange={(v) => set("taskBlocks", v)} emptyHint="Add the steps, topology and deliverables of this lab task." />
                            <Typography variant="overline" color="text.secondary">
                                Solution (evaluators only)
                            </Typography>
                            <ContentBlocksEditor value={form.solutionBlocks} onChange={(v) => set("solutionBlocks", v)} emptyHint="Optional reference solution for evaluators." />
                            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" } }}>
                                <TextField select label="Lab environment" value={form.labProvider} onChange={(e) => set("labProvider", e.target.value as QuestionForm["labProvider"])} slotProps={{ select: { displayEmpty: true } }}>
                                    <MenuItem value="">Not set</MenuItem>
                                    <MenuItem value="external_url">External URL</MenuItem>
                                    <MenuItem value="managed_vm">Managed VM</MenuItem>
                                    <MenuItem value="none">None (offline / own device)</MenuItem>
                                </TextField>
                                <TextField label="Launch URL" value={form.launchUrl} onChange={(e) => set("launchUrl", e.target.value)} disabled={form.labProvider === "none"} />
                                <TextField label="Environment template id" value={form.environmentTemplateId} onChange={(e) => set("environmentTemplateId", e.target.value)} disabled={form.labProvider !== "managed_vm"} />
                            </Box>
                            <StringListField label="Tools" value={form.tools} onChange={(v) => set("tools", v)} addLabel="Add tool" placeholder="Packet Tracer" />
                            <TextField
                                select
                                label="How is this task verified?"
                                value={form.verificationMode}
                                onChange={(e) => set("verificationMode", e.target.value as QuestionForm["verificationMode"])}
                                slotProps={{ select: { displayEmpty: true } }}
                                helperText={
                                    form.verificationMode === "flag"
                                        ? "Students submit flags; marks are split by flag weight."
                                        : form.verificationMode === "ai"
                                            ? "AI compares the student's write-up with the expected outcome."
                                            : form.verificationMode === "manual"
                                                ? "An evaluator marks the submission."
                                                : `Follows the round (${round.evaluationMode === "auto" ? "flags if any, else manual" : round.evaluationMode.replace("_", "-")}).`
                                }
                            >
                                <MenuItem value="">Round default</MenuItem>
                                <MenuItem value="flag">Flags</MenuItem>
                                <MenuItem value="ai">AI</MenuItem>
                                <MenuItem value="manual">Evaluator</MenuItem>
                            </TextField>
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Flags — stored hashed; existing values can&apos;t be shown, leave blank to keep them.
                                </Typography>
                                <Stack spacing={1}>
                                    {form.flags.map((flag, index) => (
                                        <Stack key={flag.flagId ?? `new-${index}`} direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { sm: "center" } }}>
                                            <TextField size="small" label="Label" value={flag.label} onChange={(e) => set("flags", form.flags.map((f, i) => (i === index ? { ...f, label: e.target.value } : f)))} sx={{ flex: 1 }} />
                                            <TextField
                                                size="small"
                                                label={flag.flagId ? "New value (optional)" : "Flag value"}
                                                placeholder={flag.flagId ? "•••••• kept" : "CCN{...}"}
                                                value={flag.flag}
                                                onChange={(e) => set("flags", form.flags.map((f, i) => (i === index ? { ...f, flag: e.target.value } : f)))}
                                                sx={{ flex: 1 }}
                                            />
                                            <TextField size="small" label="Weight" type="number" value={flag.marks} onChange={(e) => set("flags", form.flags.map((f, i) => (i === index ? { ...f, marks: e.target.value } : f)))} sx={{ width: 100 }} />
                                            <IconButton aria-label="Remove flag" onClick={() => set("flags", form.flags.filter((_, i) => i !== index))}>
                                                <MdDeleteOutline />
                                            </IconButton>
                                        </Stack>
                                    ))}
                                </Stack>
                                <Button size="small" startIcon={<MdAdd />} sx={{ mt: 1 }} onClick={() => set("flags", [...form.flags, { label: `Flag ${form.flags.length + 1}`, flag: "", marks: "1" }])}>
                                    Add flag
                                </Button>
                            </Box>
                        </>
                    )}

                    {choice && (
                        <TextField
                            label="Explanation (report, if the round reveals answers)"
                            multiline
                            minRows={2}
                            value={form.explanation}
                            onChange={(e) => set("explanation", e.target.value)}
                        />
                    )}

                    {warning && <Alert severity="warning">{warning}</Alert>}
                    {error && <Alert severity="error">{error}</Alert>}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={submit} disabled={busy}>
                    {initial ? "Save" : "Add"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ───────────────────────────── import ───────────────────────────── */

const IMPORT_EXAMPLES: Record<ExamRoundRecord["roundType"], string> = {
    mcq: `[
  {
    "questionType": "single_choice",
    "section": "Routing",
    "prompt": "Which protocol is link-state?",
    "options": [{ "optionText": "OSPF", "isCorrect": true }, { "optionText": "RIP" }]
  },
  {
    "questionType": "multiple_choice",
    "prompt": "Which devices work at Layer 2?",
    "options": [{ "optionText": "Switch", "isCorrect": true }, { "optionText": "Bridge", "isCorrect": true }, { "optionText": "Router" }]
  }
]`,
    viva: `[
  {
    "questionType": "viva",
    "section": "OSPF",
    "prompt": "Explain why OSPF uses areas.",
    "expectedAnswer": "Areas limit LSA flooding and SPF recalculation; area 0 is the backbone.",
    "keyPoints": ["Limits LSA flooding", "Area 0 is the backbone"]
  }
]`,
    hr: `[
  {
    "questionType": "hr",
    "prompt": "Tell us about a time you solved a difficult problem.",
    "evaluationGuide": "Clear situation, own actions, measurable result; confident communication."
  }
]`,
    lab: `[
  {
    "questionType": "lab_task",
    "prompt": "Configure OSPF between R1 and R2",
    "marks": 10,
    "verificationMode": "flag",
    "taskBlocks": [{ "type": "paragraph", "text": "Bring up OSPF area 0 and read the flag from R2." }],
    "flags": [{ "label": "R2 neighbour", "flag": "CCN{ospf-up}", "marks": 1 }]
  }
]`,
};

export function ExamImportDialog({
    open,
    round,
    onClose,
    onImport,
}: {
    open: boolean;
    round: ExamRoundRecord;
    onClose: () => void;
    onImport: (questions: ExamQuestionInput[]) => Promise<boolean>;
}) {
    const [value, setValue] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const submit = async () => {
        let parsed: unknown;
        try {
            parsed = JSON.parse(value);
        } catch {
            return setError("That isn't valid JSON");
        }
        if (!Array.isArray(parsed) || !parsed.length) return setError("Paste a JSON array of questions");
        if (parsed.length > 500) return setError("Import at most 500 questions at a time");
        const questions = parsed.map((raw) => {
            const q = (raw ?? {}) as Partial<ExamQuestionInput>;
            const type = (q.questionType ?? ROUND_QUESTION_TYPES[round.roundType][0]) as ExamQuestionType;
            return {
                ...q,
                questionType: type,
                prompt: String(q.prompt ?? ""),
                options: isChoice(type) ? (q.options ?? []).map((o) => ({ optionText: String(o.optionText ?? ""), isCorrect: Boolean(o.isCorrect), imageUrl: o.imageUrl ?? null })) : [],
                keyPoints: q.keyPoints ?? [],
                flags: q.flags ?? [],
            } as ExamQuestionInput;
        });
        for (const [i, q] of questions.entries()) {
            const problem = validateExamQuestion(q, round);
            if (problem) return setError(`Question ${i + 1}: ${problem}`);
        }
        setError(null);
        setBusy(true);
        const ok = await onImport(questions);
        setBusy(false);
        if (ok) {
            setValue("");
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Import questions</DialogTitle>
            <DialogContent dividers>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Paste a JSON array. Allowed types here: {ROUND_QUESTION_TYPES[round.roundType].map((t) => QUESTION_TYPE_LABELS[t]).join(", ")}.
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    minRows={14}
                    value={value}
                    placeholder={IMPORT_EXAMPLES[round.roundType]}
                    onChange={(e) => setValue(e.target.value)}
                    slotProps={{ htmlInput: { style: { fontFamily: "ui-monospace, monospace", fontSize: 13 } } }}
                />
                {error && (
                    <Alert severity="error" sx={{ mt: 1.5 }}>
                        {error}
                    </Alert>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={() => setValue(IMPORT_EXAMPLES[round.roundType])}>Use example</Button>
                <Button variant="contained" onClick={submit} disabled={busy || !value.trim()}>
                    Import
                </Button>
            </DialogActions>
        </Dialog>
    );
}
