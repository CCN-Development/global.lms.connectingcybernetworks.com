"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, ButtonBase, Menu, MenuItem, MenuList, Popover, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { FONT_INTER } from "@/components/aish/tokens";
import type { CommunityCapability, PollInput, PostType } from "@/contexts/CommunityContext";
import { CC } from "./community-data";
import { CategorySwatch, CheckRow, ChoiceChip, CommunityModal, dropdownItemSx, dropdownPaperSx, ellipsis, Icon, LmsButton, TagChip, TEXT } from "./community-ui";
import CommunityEditor, { EditorAttachment, toEditorAttachment } from "./CommunityEditor";
import { useCommunity } from "./CommunityContext";
import { POST_TYPE_COLORS } from "./PostCard";

// ─── Outlined field with the design's floating label ───────────────────────
interface FloatingFieldProps {
    label: string;
    /** Text shown inside the empty field (defaults to the label). */
    emptyLabel?: string;
    required?: boolean;
    filled: boolean;
    focused?: boolean;
    error?: string;
    trailing?: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    fieldRef?: React.Ref<HTMLDivElement>;
    children: React.ReactNode;
    htmlFor?: string;
}

function FloatingField({ label, emptyLabel, required, filled, focused, error, trailing, onClick, fieldRef, children, htmlFor }: FloatingFieldProps) {
    const floating = filled || focused;
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: 0 }}>
            <Box
                ref={fieldRef}
                onClick={onClick ?? (() => htmlFor && document.getElementById(htmlFor)?.focus())}
                sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    minHeight: 62,
                    px: "16px",
                    py: "10px",
                    borderRadius: "8px",
                    border: `1px solid ${error ? CC.error : focused ? CC.primary200 : CC.primary75}`,
                    cursor: onClick ? "pointer" : "text",
                    transition: "border-color .15s ease",
                }}
            >
                <Box
                    component="label"
                    htmlFor={htmlFor}
                    sx={{
                        position: "absolute",
                        display: "flex",
                        gap: "4px",
                        alignItems: "center",
                        p: floating ? "4px" : 0,
                        left: floating ? "13px" : "24px",
                        top: floating ? "-17px" : "50%",
                        transform: floating ? "none" : "translateY(-50%)",
                        borderRadius: "2px",
                        bgcolor: floating ? "#03050B" : "transparent",
                        fontFamily: FONT_INTER,
                        fontSize: "16px",
                        lineHeight: "24px",
                        whiteSpace: "nowrap",
                        maxWidth: "calc(100% - 56px)",
                        pointerEvents: "none",
                        transition: "top .15s ease, left .15s ease, transform .15s ease",
                        zIndex: 1,
                    }}
                >
                    <Box component="span" sx={{ fontWeight: floating ? 400 : 500, color: floating ? CC.n300 : CC.white, ...ellipsis }}>
                        {floating ? label : (emptyLabel ?? label)}
                    </Box>
                    {required && (
                        <Box component="span" sx={{ fontWeight: 500, color: CC.error }}>
                            *
                        </Box>
                    )}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, p: "8px", opacity: floating ? 1 : 0 }}>{children}</Box>
                {trailing}
            </Box>
            {error && <Typography sx={{ ...TEXT.reg14, color: CC.error, pl: "4px" }}>{error}</Typography>}
        </Box>
    );
}

const Choice = ChoiceChip;

const POST_TYPES: { id: PostType; label: string; color?: string; capability?: CommunityCapability }[] = [
    { id: "discussion", label: "Discussion" },
    { id: "question", label: "Question", color: POST_TYPE_COLORS.question },
    { id: "poll", label: "Poll", color: POST_TYPE_COLORS.poll, capability: "poll.create" },
    { id: "announcement", label: "Announcement", color: POST_TYPE_COLORS.announcement, capability: "post.announce" },
    { id: "quiz", label: "Quiz", color: POST_TYPE_COLORS.quiz, capability: "quiz.create" },
];

interface QuizQuestionDraft {
    question: string;
    options: string[];
    /** Indexes into `options`. */
    correct: number[];
    multiple: boolean;
    explanation: string;
}

const emptyQuestion = (): QuizQuestionDraft => ({ question: "", options: ["", ""], correct: [], multiple: false, explanation: "" });

const daysFromNow = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

/** First problem in a quiz draft, or null. */
function quizError(questions: QuizQuestionDraft[]): string | null {
    for (const [i, q] of questions.entries()) {
        const n = questions.length > 1 ? ` (question ${i + 1})` : "";
        const filled = q.options.map((o) => o.trim()).filter(Boolean);
        if (!q.question.trim()) return `Write the question${n}`;
        if (filled.length < 2) return `Add at least two options${n}`;
        if (new Set(filled.map((o) => o.toLowerCase())).size !== filled.length) return `Options must be different${n}`;
        const correct = q.correct.filter((c) => q.options[c]?.trim());
        if (!correct.length) return `Mark the correct answer${n}`;
        if (!q.multiple && correct.length !== 1) return `Pick exactly one correct answer${n}`;
    }
    return null;
}

const toQuizPolls = (questions: QuizQuestionDraft[]): PollInput[] =>
    questions.map((q) => ({
        question: q.question.trim(),
        allowMultiple: q.multiple,
        explanation: q.explanation.trim() || null,
        options: q.options
            .map((text, i) => ({ text: text.trim(), isCorrect: q.correct.includes(i) }))
            .filter((o) => o.text),
    }));

const optionInputSx = {
    flex: 1,
    minWidth: 0,
    height: 48,
    px: "20px",
    borderRadius: "99px",
    border: "1px solid rgba(115,115,115,0.32)",
    bgcolor: CC.pollFill,
    color: CC.white,
    ...TEXT.med16,
    outline: "none",
    "&:focus": { borderColor: CC.primary200 },
    "&::placeholder": { color: CC.n500 },
} as const;

function QuizBuilder({ questions, setQuestions, maxQuestions, maxOptions, error }: {
    questions: QuizQuestionDraft[];
    setQuestions: React.Dispatch<React.SetStateAction<QuizQuestionDraft[]>>;
    maxQuestions: number;
    maxOptions: number;
    error: string | null;
}) {
    const update = (index: number, patch: Partial<QuizQuestionDraft>) => setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
    const toggleCorrect = (index: number, option: number) =>
        setQuestions((prev) =>
            prev.map((q, i) => {
                if (i !== index) return q;
                if (!q.multiple) return { ...q, correct: [option] };
                return { ...q, correct: q.correct.includes(option) ? q.correct.filter((c) => c !== option) : [...q.correct, option] };
            }),
        );
    const removeOption = (index: number, option: number) =>
        setQuestions((prev) =>
            prev.map((q, i) =>
                i === index
                    ? { ...q, options: q.options.filter((_, j) => j !== option), correct: q.correct.filter((c) => c !== option).map((c) => (c > option ? c - 1 : c)) }
                    : q,
            ),
        );

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {questions.map((q, i) => (
                <Box key={i} sx={{ display: "flex", flexDirection: "column", gap: "12px", p: "16px", borderRadius: "12px", border: `1px solid ${CC.n700}` }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <Typography sx={{ ...TEXT.med16, color: CC.n100 }}>Question {i + 1}</Typography>
                        {questions.length > 1 && (
                            <ButtonBase onClick={() => setQuestions((prev) => prev.filter((_, j) => j !== i))} sx={{ ...TEXT.med14, color: CC.error, borderRadius: "4px", px: "4px" }}>
                                Remove
                            </ButtonBase>
                        )}
                    </Box>
                    <Box component="input" value={q.question} maxLength={500} placeholder="Type the question" aria-label={`Question ${i + 1}`} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(i, { question: e.target.value })} sx={{ ...optionInputSx, flex: "none", borderRadius: "8px" }} />
                    <Typography sx={{ ...TEXT.reg12, color: CC.n500 }}>{q.multiple ? "Tick every correct option" : "Tick the correct option"}</Typography>
                    {q.options.map((option, j) => {
                        const isCorrect = q.correct.includes(j);
                        return (
                            <Box key={j} sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <ButtonBase
                                    role={q.multiple ? "checkbox" : "radio"}
                                    aria-checked={isCorrect}
                                    aria-label={`Mark option ${j + 1} correct`}
                                    onClick={() => toggleCorrect(i, j)}
                                    sx={{
                                        width: 22,
                                        height: 22,
                                        flexShrink: 0,
                                        borderRadius: q.multiple ? "5px" : "99px",
                                        border: `1.5px solid ${isCorrect ? CC.success : CC.n500}`,
                                        bgcolor: isCorrect ? CC.success : "transparent",
                                    }}
                                />
                                <Box
                                    component="input"
                                    value={option}
                                    maxLength={300}
                                    placeholder={`Option ${j + 1}`}
                                    aria-label={`Question ${i + 1} option ${j + 1}`}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(i, { options: q.options.map((o, k) => (k === j ? e.target.value : o)) })}
                                    sx={{ ...optionInputSx, borderColor: isCorrect ? CC.success : "rgba(115,115,115,0.32)" }}
                                />
                                {q.options.length > 2 && (
                                    <ButtonBase aria-label={`Remove option ${j + 1}`} onClick={() => removeOption(i, j)} sx={{ borderRadius: "6px", "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } }}>
                                        <Icon name="icon-chip-x.svg" size={24} />
                                    </ButtonBase>
                                )}
                            </Box>
                        );
                    })}
                    {q.options.length < maxOptions && (
                        <ButtonBase onClick={() => update(i, { options: [...q.options, ""] })} sx={{ alignSelf: "flex-start", ...TEXT.med14, color: CC.link, borderRadius: "4px", px: "4px" }}>
                            + Add option
                        </ButtonBase>
                    )}
                    <CheckRow checked={q.multiple} onChange={(multiple) => update(i, { multiple, correct: multiple ? q.correct : q.correct.slice(0, 1) })} label="More than one correct answer" />
                    <Box component="input" value={q.explanation} maxLength={2000} placeholder="Explanation shown after answering (optional)" aria-label={`Question ${i + 1} explanation`} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(i, { explanation: e.target.value })} sx={{ ...optionInputSx, flex: "none", height: 44, borderRadius: "8px", ...TEXT.med14 }} />
                </Box>
            ))}
            {questions.length < maxQuestions && (
                <ButtonBase onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])} sx={{ alignSelf: "flex-start", ...TEXT.med14, color: CC.link, borderRadius: "4px", px: "4px" }}>
                    + Add question
                </ButtonBase>
            )}
            {error && <Typography sx={{ ...TEXT.reg14, color: CC.error }}>{error}</Typography>}
        </Box>
    );
}

const CLOSE_AFTER = [
    { label: "No end", days: 0 },
    { label: "1 day", days: 1 },
    { label: "3 days", days: 3 },
    { label: "1 week", days: 7 },
];

const fieldInputSx = {
    width: "100%",
    border: "none",
    outline: "none",
    bgcolor: "transparent",
    color: CC.white,
    fontFamily: FONT_INTER,
    fontWeight: 500,
    fontSize: { xs: "16px", sm: "18px" },
    lineHeight: "27px",
    p: 0,
} as const;

// ─── Modal ─────────────────────────────────────────────────────────────────
export default function NewDiscussionModal() {
    const { newDiscussionOpen, editingPost, closeNewDiscussion } = useCommunity();
    return (
        <CommunityModal open={newDiscussionOpen} onClose={closeNewDiscussion} title={editingPost ? "Edit Discussion" : "New Discussion"} width={650}>
            {/* Dialog content unmounts on close, so every open starts from a fresh form. */}
            <DiscussionForm key={editingPost?.id ?? "new"} />
        </CommunityModal>
    );
}

function DiscussionForm() {
    const router = useRouter();
    const { api, editingPost: editing, closeNewDiscussion, postableCategories, postableTags, tagLabel, paths } = useCommunity();
    const { spaces, config, createPost, updatePost, deletePendingAttachment } = api;

    const postableSpaces = useMemo(() => spaces.filter((s) => s.canPost), [spaces]);
    const [spaceId, setSpaceId] = useState<string | null>(() => postableSpaces.find((s) => s.isDefault)?.id ?? postableSpaces[0]?.id ?? null);
    const space = spaces.find((s) => s.id === (editing?.space.id ?? spaceId)) ?? null;

    const [title, setTitle] = useState(editing?.title ?? "");
    const [titleFocused, setTitleFocused] = useState(false);
    const [categoryId, setCategoryId] = useState<string | null>(editing?.categoryId ?? null);
    const [tags, setTags] = useState<string[]>(editing?.tagDetails.map((t) => t.slug) ?? []);
    const [html, setHtml] = useState(editing?.html ?? "");
    const [attachments, setAttachments] = useState<EditorAttachment[]>(editing?.attachments.map(toEditorAttachment) ?? []);
    const [postType, setPostType] = useState<PostType>("discussion");
    const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
    const [allowMultiple, setAllowMultiple] = useState(false);
    const [closeDays, setCloseDays] = useState(0);
    const [anonymous, setAnonymous] = useState(false);
    const [quiz, setQuiz] = useState<QuizQuestionDraft[]>(() => [emptyQuestion()]);
    const [pinOnCreate, setPinOnCreate] = useState(false);
    const [lockReplies, setLockReplies] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [busy, setBusy] = useState(false);
    const [categoryAnchor, setCategoryAnchor] = useState<HTMLElement | null>(null);
    const [tagAnchor, setTagAnchor] = useState<HTMLElement | null>(null);
    const [spaceAnchor, setSpaceAnchor] = useState<HTMLElement | null>(null);
    const categoryRef = useRef<HTMLDivElement>(null);
    const tagRef = useRef<HTMLDivElement>(null);
    const spaceRef = useRef<HTMLDivElement>(null);

    // Uploads made in this form but never posted are removed when the modal closes.
    const saved = useRef(false);
    const attachmentsRef = useRef(attachments);
    useEffect(() => {
        attachmentsRef.current = attachments;
    }, [attachments]);
    useEffect(
        () => () => {
            if (saved.current) return;
            attachmentsRef.current.filter((a) => a.fresh && a.progress >= 100).forEach((a) => void deletePendingAttachment(a.id));
        },
        [deletePendingAttachment],
    );

    const maxTags = config.maxTagsPerPost;
    const category = postableCategories.find((c) => c.id === categoryId) ?? (editing && editing.categoryId === categoryId ? editing.category : null);
    const remainingTags = postableTags.filter((t) => !tags.includes(t.slug));
    const isPoll = !editing && postType === "poll";
    const isQuiz = !editing && postType === "quiz";
    const filledOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
    const spaceCaps = space?.capabilities ?? [];
    const spaceCan = (c: CommunityCapability) => spaceCaps.includes(c);
    const availableTypes = POST_TYPES.filter((t) => (!t.capability || spaceCan(t.capability)) && (t.id !== "poll" || space?.allowPolls !== false));
    const currentQuizError = isQuiz ? quizError(quiz) : null;

    const titleError = submitted && !title.trim() ? "Please add a topic title" : undefined;
    const categoryError = submitted && !categoryId ? "Please select a category" : undefined;
    const pollError =
        submitted && isPoll
            ? filledOptions.length < 2
                ? "Add at least two options"
                : new Set(filledOptions.map((o) => o.toLowerCase())).size !== filledOptions.length
                  ? "Options must be different"
                  : undefined
            : undefined;

    const toggleTag = (slug: string) => {
        if (tags.includes(slug)) return setTags(tags.filter((t) => t !== slug));
        if (tags.length >= maxTags) return void toast.error(`You can add upto ${maxTags} tags only`);
        setTags([...tags, slug]);
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        if (!title.trim() || !categoryId) return;
        if (isPoll && (filledOptions.length < 2 || new Set(filledOptions.map((o) => o.toLowerCase())).size !== filledOptions.length)) return;
        if (isQuiz && currentQuizError) return;
        if (attachments.some((a) => a.progress < 100)) return void toast.error("Please wait for the uploads to finish");
        setBusy(true);
        const attachmentIds = attachments.map((a) => a.id);
        if (editing) {
            const res = await updatePost(editing.id, { title: title.trim(), html, category: categoryId, tags, attachmentIds });
            setBusy(false);
            if (!res.success) return void toast.error(res.message ?? "Couldn't update the discussion");
            saved.current = true;
            toast.success("Discussion updated");
            return closeNewDiscussion();
        }
        const poll: PollInput | undefined = isPoll
            ? {
                  options: filledOptions.map((text) => ({ text })),
                  allowMultiple,
                  closesAt: closeDays ? daysFromNow(closeDays) : null,
              }
            : undefined;
        const res = await createPost({
            spaceId: spaceId ?? undefined,
            category: categoryId,
            title: title.trim(),
            html,
            postType,
            tags,
            attachmentIds,
            isAnonymous: space?.allowAnonymous ? anonymous : false,
            poll,
            polls: isQuiz ? toQuizPolls(quiz) : undefined,
            pin: pinOnCreate && spaceCan("post.pin") ? { priority: 0 } : undefined,
            lockReplies: lockReplies && spaceCan("post.lock") ? true : undefined,
        });
        setBusy(false);
        if (!res.success || !res.data) return void toast.error(res.message ?? "Couldn't create the discussion");
        saved.current = true;
        toast.success(res.message ?? "Discussion created");
        closeNewDiscussion();
        router.push(paths.thread(res.data.id));
    };

    const chevron = (open: boolean) => (
        <Icon name="icon-chevron-down-field.svg" size={24} sx={{ transition: "transform .15s ease", transform: open ? "rotate(180deg)" : "none" }} />
    );

    return (
        <>
            <Box
                component="form"
                noValidate
                onSubmit={(e: React.FormEvent) => {
                    e.preventDefault();
                    void handleSubmit();
                }}
                sx={{ display: "flex", flexDirection: "column", gap: "32px" }}
            >
                <FloatingField
                    label="Topic Title"
                    emptyLabel="Topic Title : Please keep it short and descriptive"
                    required
                    filled={Boolean(title)}
                    focused={titleFocused}
                    error={titleError}
                    htmlFor="community-topic-title"
                >
                    <Box
                        component="input"
                        id="community-topic-title"
                        value={title}
                        maxLength={140}
                        autoComplete="off"
                        onFocus={() => setTitleFocused(true)}
                        onBlur={() => setTitleFocused(false)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                        sx={fieldInputSx}
                    />
                </FloatingField>

                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: { xs: "32px", sm: "16px" } }}>
                    <FloatingField
                        label="Select category"
                        required
                        filled={Boolean(category)}
                        focused={Boolean(categoryAnchor)}
                        error={categoryError}
                        fieldRef={categoryRef}
                        onClick={() => setCategoryAnchor(categoryRef.current)}
                        trailing={chevron(Boolean(categoryAnchor))}
                    >
                        <ButtonBase
                            aria-haspopup="listbox"
                            aria-label="Select category"
                            sx={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", justifyContent: "flex-start", minHeight: 24 }}
                        >
                            {category && (
                                <>
                                    <CategorySwatch color={category.color} />
                                    <Typography sx={{ ...TEXT.med16, color: CC.n200, ...ellipsis }}>{category.label}</Typography>
                                </>
                            )}
                        </ButtonBase>
                    </FloatingField>

                    <FloatingField
                        label="Add optional tags"
                        required
                        filled={tags.length > 0}
                        focused={Boolean(tagAnchor)}
                        fieldRef={tagRef}
                        onClick={() => setTagAnchor(tagRef.current)}
                        trailing={chevron(Boolean(tagAnchor))}
                    >
                        <ButtonBase aria-haspopup="listbox" aria-label="Add optional tags" sx={{ width: "100%", justifyContent: "flex-start", minHeight: 24 }}>
                            <Typography sx={{ ...TEXT.med16, color: CC.n200, ...ellipsis }}>{tags.map(tagLabel).join(", ")}</Typography>
                        </ButtonBase>
                    </FloatingField>
                </Box>

                {!editing && (
                    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: { xs: "24px", sm: "16px" }, alignItems: { sm: "center" } }}>
                        {postableSpaces.length > 1 && (
                            <Box sx={{ display: "flex", width: { xs: "100%", sm: 260 }, flexShrink: 0 }}>
                                <FloatingField
                                    label="Post in"
                                    filled={Boolean(space)}
                                    focused={Boolean(spaceAnchor)}
                                    fieldRef={spaceRef}
                                    onClick={() => setSpaceAnchor(spaceRef.current)}
                                    trailing={chevron(Boolean(spaceAnchor))}
                                >
                                    <ButtonBase aria-haspopup="listbox" aria-label="Post in" sx={{ width: "100%", justifyContent: "flex-start", minHeight: 24 }}>
                                        <Typography sx={{ ...TEXT.med16, color: CC.n200, ...ellipsis }}>{space?.name}</Typography>
                                    </ButtonBase>
                                </FloatingField>
                            </Box>
                        )}
                        <Box role="radiogroup" aria-label="Discussion type" sx={{ display: "flex", gap: "8px", flexWrap: "wrap", flex: 1 }}>
                            {availableTypes.map((t) => (
                                <Choice key={t.id} active={postType === t.id} color={t.color} onClick={() => setPostType(t.id)}>
                                    {t.label}
                                </Choice>
                            ))}
                        </Box>
                    </Box>
                )}

                {isPoll && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <Typography sx={{ ...TEXT.med16, color: CC.n100 }}>Poll options</Typography>
                        {pollOptions.map((option, i) => (
                            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Box
                                    component="input"
                                    value={option}
                                    maxLength={300}
                                    placeholder={`Option ${i + 1}`}
                                    aria-label={`Option ${i + 1}`}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPollOptions(pollOptions.map((o, j) => (j === i ? e.target.value : o)))}
                                    sx={{
                                        flex: 1,
                                        minWidth: 0,
                                        height: 48,
                                        px: "20px",
                                        borderRadius: "99px",
                                        border: "1px solid rgba(115,115,115,0.32)",
                                        bgcolor: CC.pollFill,
                                        color: CC.white,
                                        ...TEXT.med16,
                                        outline: "none",
                                        "&:focus": { borderColor: CC.primary200 },
                                        "&::placeholder": { color: CC.n500 },
                                    }}
                                />
                                {pollOptions.length > 2 && (
                                    <ButtonBase
                                        aria-label={`Remove option ${i + 1}`}
                                        onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))}
                                        sx={{ borderRadius: "6px", "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } }}
                                    >
                                        <Icon name="icon-chip-x.svg" size={24} />
                                    </ButtonBase>
                                )}
                            </Box>
                        ))}
                        {pollOptions.length < config.maxPollOptions && (
                            <ButtonBase onClick={() => setPollOptions([...pollOptions, ""])} sx={{ alignSelf: "flex-start", ...TEXT.med14, color: CC.link, borderRadius: "4px", px: "4px" }}>
                                + Add option
                            </ButtonBase>
                        )}
                        {pollError && <Typography sx={{ ...TEXT.reg14, color: CC.error }}>{pollError}</Typography>}
                        <CheckRow checked={allowMultiple} onChange={setAllowMultiple} label="Allow multiple answers" />
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }} role="radiogroup" aria-label="Poll duration">
                            <Typography sx={{ ...TEXT.med14, color: CC.n300, mr: "4px" }}>Closes</Typography>
                            {CLOSE_AFTER.map((c) => (
                                <Choice key={c.days} active={closeDays === c.days} onClick={() => setCloseDays(c.days)}>
                                    {c.label}
                                </Choice>
                            ))}
                        </Box>
                    </Box>
                )}

                {isQuiz && (
                    <QuizBuilder
                        questions={quiz}
                        setQuestions={setQuiz}
                        maxQuestions={config.maxQuizQuestions}
                        maxOptions={config.maxPollOptions}
                        error={submitted ? currentQuizError : null}
                    />
                )}

                <CommunityEditor
                    value={html}
                    onChange={setHtml}
                    placeholder="Type topic description here (optional)"
                    attachments={attachments}
                    setAttachments={setAttachments}
                    spaceId={editing?.space.id ?? spaceId ?? undefined}
                />

                {!editing && space?.allowAnonymous && (
                    <CheckRow checked={anonymous} onChange={setAnonymous} label="Post anonymously" hint="Your name is hidden from other students. Moderators can still see it." />
                )}
                {!editing && (spaceCan("post.pin") || spaceCan("post.lock")) && (
                    <Box sx={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                        {spaceCan("post.pin") && <CheckRow checked={pinOnCreate} onChange={setPinOnCreate} label="Pin to top" hint="Shown above every other discussion." />}
                        {spaceCan("post.lock") && <CheckRow checked={lockReplies} onChange={setLockReplies} label="Turn off replies" hint="Members can read and react, not reply." />}
                    </Box>
                )}
                {!editing && space?.requirePostApproval && (
                    <Typography sx={{ ...TEXT.reg14, color: CC.n300, mt: "-16px" }}>Posts in {space.name} are reviewed by a moderator before they appear.</Typography>
                )}

                <Box sx={{ py: "8px" }}>
                    <LmsButton type="submit" disabled={busy} sx={{ width: "100%" }}>
                        {busy ? "Please wait…" : editing ? "Save Changes" : "Create Topic"}
                    </LmsButton>
                </Box>
            </Box>

            {/* Category dropdown */}
            <Menu
                anchorEl={categoryAnchor}
                open={Boolean(categoryAnchor)}
                onClose={() => setCategoryAnchor(null)}
                slotProps={{ paper: { sx: { ...dropdownPaperSx, width: categoryAnchor?.offsetWidth ?? 281 } } }}
            >
                {postableCategories.map((c) => (
                    <MenuItem
                        key={c.id}
                        selected={c.id === categoryId}
                        onClick={() => {
                            setCategoryId(c.id);
                            setCategoryAnchor(null);
                        }}
                        sx={dropdownItemSx(c.id === categoryId)}
                    >
                        <CategorySwatch color={c.color} />
                        {c.label}
                    </MenuItem>
                ))}
            </Menu>

            {/* Space dropdown */}
            <Menu
                anchorEl={spaceAnchor}
                open={Boolean(spaceAnchor)}
                onClose={() => setSpaceAnchor(null)}
                slotProps={{ paper: { sx: { ...dropdownPaperSx, width: spaceAnchor?.offsetWidth ?? 281 } } }}
            >
                {postableSpaces.map((s) => (
                    <MenuItem
                        key={s.id}
                        selected={s.id === spaceId}
                        onClick={() => {
                            setSpaceId(s.id);
                            setSpaceAnchor(null);
                            if (!s.allowAnonymous) setAnonymous(false);
                            if (!s.allowPolls && postType === "poll") setPostType("discussion");
                            const needs = POST_TYPES.find((t) => t.id === postType)?.capability;
                            if (needs && !s.capabilities.includes(needs)) setPostType("discussion");
                        }}
                        sx={dropdownItemSx(s.id === spaceId)}
                    >
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                            {s.name}
                            <Typography sx={{ ...TEXT.reg12, color: CC.n500 }}>
                                {s.scope === "global" ? "Everyone at CCN" : s.scope === "batch" ? "Your batch" : s.scope === "course" ? "Your course" : s.scope === "branch" ? "Your branch" : "Staff"}
                            </Typography>
                        </Box>
                    </MenuItem>
                ))}
            </Menu>

            {/* Tag dropdown */}
            <Popover
                anchorEl={tagAnchor}
                open={Boolean(tagAnchor)}
                onClose={() => setTagAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                slotProps={{ paper: { sx: { ...dropdownPaperSx, width: tagAnchor?.offsetWidth ?? 285 } } }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", px: "16px", py: "12px", borderBottom: "1px solid rgba(0,0,0,0.5)" }}>
                    <Typography sx={{ ...TEXT.reg12, color: CC.n500 }}>You can add upto {maxTags} tags only</Typography>
                    {tags.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {tags.map((slug) => (
                                <TagChip key={slug} label={tagLabel(slug)} onRemove={() => toggleTag(slug)} />
                            ))}
                        </Box>
                    )}
                </Box>
                <MenuList aria-label="Available tags" sx={{ py: 0 }}>
                    {remainingTags.map((tag) => (
                        <MenuItem key={tag.id} disabled={tags.length >= maxTags} onClick={() => toggleTag(tag.slug)} sx={dropdownItemSx()}>
                            {tag.label}
                        </MenuItem>
                    ))}
                    {remainingTags.length === 0 && (
                        <Typography sx={{ ...TEXT.med14, color: CC.n500, px: "16px", py: "12px" }}>All tags added</Typography>
                    )}
                </MenuList>
            </Popover>
        </>
    );
}
