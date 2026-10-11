"use client";

import React, { useEffect, useEffectEvent, useState } from "react";
import Image from "next/image";
import { Box, ButtonBase, CircularProgress, Dialog, Typography } from "@mui/material";
import toast from "react-hot-toast";
import {
    useCourse,
    type QuizAnswerResult,
    type QuizAttemptView,
    type QuizQuestionView,
    type QuizSubmitResult,
} from "@/contexts/CourseContext";
import { announceRewards, formatDate, isRemoteSrc } from "../course-format";
import { ACTIVITY_ASSETS, COLORS, GOLD_GRADIENT, TYPE, gradientText } from "../my-courses-theme";
import {
    ACTIVITY_TYPE,
    ActivityButton,
    ActivityCard,
    ActivityPanel,
    CardDivider,
    CardGlows,
    FigmaGlow,
    GhostButton,
    IconTile,
    StatTiles,
    formatDuration,
} from "./activity-ui";
import ResultCard, { QUIZ_BADGE } from "./ResultCard";

type Stage = "intro" | "question" | "result";
type OptionState = "idle" | "selected" | "correct" | "incorrect";

const DEFAULT_INTRO = ["Ready to prove what you’ve learned?", "Test your understanding, improve your skill score, and earn XP."];

const OPTION_TONE: Record<Exclude<OptionState, "idle">, { border: string; radio: string }> = {
    selected: { border: COLORS.purple, radio: "radio-selected.svg" },
    correct: { border: COLORS.lessonDone, radio: "radio-correct.svg" },
    incorrect: { border: "#D1293D", radio: "radio-incorrect.svg" },
};

/** "m:ss:cc" countdown, as in the design ("5:00:00"). */
function formatClock(ms: number): string {
    const clamped = Math.max(0, ms);
    const m = Math.floor(clamped / 60000);
    const s = Math.floor(clamped / 1000) % 60;
    const cs = Math.floor(clamped / 10) % 100;
    return `${m}:${String(s).padStart(2, "0")}:${String(cs).padStart(2, "0")}`;
}

/** Counts down to the server deadline (already shifted into the local clock). */
function QuizTimer({ deadline, onExpire }: { deadline: number; onExpire: () => void }) {
    const [remaining, setRemaining] = useState(() => Math.max(0, deadline - Date.now()));
    const expire = useEffectEvent(onExpire);

    useEffect(() => {
        const id = window.setInterval(() => {
            const left = deadline - Date.now();
            setRemaining(Math.max(0, left));
            if (left <= 0) {
                window.clearInterval(id);
                expire();
            }
        }, 50);
        return () => window.clearInterval(id);
    }, [deadline]);

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }} role="timer" aria-label="Time remaining">
            <Image src={`${ACTIVITY_ASSETS}/icon-clock-gold-16.svg`} alt="" width={16} height={16} />
            <Typography sx={{ ...TYPE.largeSemibold18, ...gradientText(GOLD_GRADIENT), fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                {formatClock(remaining)}
            </Typography>
        </Box>
    );
}

function QuestionHeader({ index, total, timer }: { index: number; total: number; timer: React.ReactNode }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <Typography sx={{ ...TYPE.largeSemibold18, color: COLORS.white, whiteSpace: "nowrap" }}>
                    Question {index + 1} of {total}
                </Typography>
                {timer}
            </Box>
            <Box sx={{ display: "flex", gap: "8px" }} role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={index + 1}>
                {Array.from({ length: total }, (_, i) => (
                    <Box
                        key={i}
                        sx={{
                            flex: 1,
                            height: 10,
                            borderRadius: "8px",
                            transition: "background .3s ease",
                            background: i <= index ? "linear-gradient(103.73deg, #2EC4B6 4.5235%, #1B4C33 104.18%)" : "rgba(199,211,235,0.24)",
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
}

function CenteredSpinner() {
    return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 320 }}>
            <CircularProgress size={32} sx={{ color: COLORS.purple }} />
        </Box>
    );
}

interface IntroAction {
    label: string;
    disabled: boolean;
    note: string | null;
}

function QuizIntroCard({
    title,
    lines,
    tiles,
    action,
    note,
    onStart,
    onLater,
}: {
    title: string;
    lines: string[];
    tiles: { value: string; label: string }[];
    action: IntroAction;
    note: string | null;
    onStart: () => void;
    onLater: () => void;
}) {
    return (
        <Box sx={{ display: "flex", justifyContent: "center", pt: { xs: "72px", md: "120px" }, pb: "32px" }}>
            <Box sx={{ position: "relative", width: 669, maxWidth: "100%" }}>
                <ActivityCard
                    angle="164.63deg"
                    sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "32px", pt: "64px", pb: "32px", px: { xs: "16px", sm: "24px" } }}
                >
                    <CardGlows
                        left={`${ACTIVITY_ASSETS}/card-glow-left.svg`}
                        right={`${ACTIVITY_ASSETS}/card-glow-right.svg`}
                        leftAt={{ left: -557.01, top: -33 }}
                        rightAt={{ left: 649, top: -235 }}
                    />
                    <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%", maxWidth: 580, textAlign: "center" }}>
                        <Typography component="h2" sx={{ ...TYPE.headingSemibold28, fontSize: { xs: "22px", sm: "28px" }, color: COLORS.neutral100 }}>
                            {title}
                        </Typography>
                        <Box>
                            {lines.map((line, i) => (
                                <Typography key={i} sx={{ ...ACTIVITY_TYPE.latoReg16, color: COLORS.neutral200 }}>
                                    {line}
                                </Typography>
                            ))}
                        </Box>
                    </Box>
                    <StatTiles caption="BEFORE YOU START" tiles={tiles} />
                    {note && (
                        <Typography sx={{ position: "relative", ...TYPE.smallMed14, color: COLORS.neutral300, textAlign: "center", mt: "-16px" }}>{note}</Typography>
                    )}
                    <CardDivider />
                    <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: 220, maxWidth: "100%" }}>
                        <ActivityButton onClick={onStart} width="100%" disabled={action.disabled}>
                            {action.label}
                        </ActivityButton>
                        {action.note && <Typography sx={{ ...TYPE.xsMed12, color: COLORS.neutral300, textAlign: "center" }}>{action.note}</Typography>}
                        <GhostButton onClick={onLater}>I will do this later</GhostButton>
                    </Box>
                </ActivityCard>
                <IconTile variant="xl" icon={`${ACTIVITY_ASSETS}/icon-file-text-45.svg`} sx={{ position: "absolute", top: -46, left: "50%", transform: "translateX(-50%)" }} />
            </Box>
        </Box>
    );
}

const BACK_CARDS = [
    { top: 13.98, left: 37.99, right: 38.72, bottom: 17.35, angle: "161.61deg", radius: 30.734, border: 0.96, glow: { src: "question-glow-5.svg", left: 556.1, top: -425.48, w: 1217.477, h: 710.658, iw: 38.477, ih: 1376.613 } },
    { top: 21.58, left: 30.02, right: 30.09, bottom: 28.93, angle: "162.67deg", radius: 30.972, border: 0.968, glow: { src: "question-glow-4.svg", left: 560.39, top: -428.76, w: 1226.884, h: 716.149, iw: 38.775, ih: 1387.25 } },
    { top: 29.91, left: 21.97, right: 21.03, bottom: 29.05, angle: "163.35deg", radius: 31.177, border: 0.974, glow: { src: "question-glow-3.svg", left: 564.11, top: -431.6, w: 1235.023, h: 720.9, iw: 39.032, ih: 1396.453 } },
    { top: 39.78, left: 12.98, right: 12.04, bottom: 22.25, angle: "163.85deg", radius: 31.417, border: 0.982, glow: { src: "question-glow-2.svg", left: 568.44, top: -434.92, w: 1244.507, h: 726.436, iw: 39.331, ih: 1407.177 } },
];

const stackFill = (angle: string) =>
    `linear-gradient(${angle}, rgba(0,0,0,0.88) 4.0946%, rgba(5,4,4,0.76) 25.899%, rgba(10,9,9,0.64) 55.893%, rgba(56,55,55,0.33) 85.887%, rgba(102,102,102,0.02) 115.88%)`;

const cardHighlight = {
    content: '""',
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    boxShadow: "inset 0px 3px 6px 0px rgba(255,255,255,0.16)",
    pointerEvents: "none",
} as const;

function OptionRow({
    label,
    state,
    multi,
    disabled,
    onSelect,
}: {
    label: string;
    state: OptionState;
    multi: boolean;
    disabled: boolean;
    onSelect: () => void;
}) {
    const tone = state === "idle" ? null : OPTION_TONE[state];
    return (
        <ButtonBase
            role={multi ? "checkbox" : "radio"}
            aria-checked={state !== "idle"}
            disabled={disabled}
            onClick={onSelect}
            sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "20px",
                width: "100%",
                px: { xs: "16px", sm: "23px" },
                pt: "19px",
                // Figma strokes sit inside the frame; padding absorbs the border so active rows (3px rim) stay 64px tall.
                pb: tone ? "17px" : "19px",
                borderRadius: "12px",
                textAlign: "left",
                border: `1px solid ${tone ? tone.border : "rgba(115,115,115,0.12)"}`,
                borderBottomWidth: tone ? "3px" : "1px",
                background: tone ? "rgba(147,169,226,0.08)" : "linear-gradient(179.91deg, rgba(13,13,13,0.41) 0.69356%, rgba(115,115,115,0.077) 226.95%)",
                transition: "border-color .18s ease, background .18s ease",
                "&:hover": tone ? {} : { borderColor: "rgba(140,36,255,0.5)" },
                "&.Mui-disabled": { pointerEvents: "none" },
                "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" },
            }}
        >
            <Image
                src={`${ACTIVITY_ASSETS}/${tone ? tone.radio : "radio.svg"}`}
                alt=""
                width={24}
                height={24}
                style={{ flexShrink: 0, borderRadius: multi ? 6 : undefined }}
            />
            <Typography sx={{ ...TYPE.mediumMed16, color: COLORS.neutral100 }}>{label}</Typography>
        </ButtonBase>
    );
}

/** The live question card with four faded cards fanned out behind it. */
function QuestionStack({
    question,
    optionState,
    locked,
    onSelect,
}: {
    question: QuizQuestionView;
    optionState: (optionId: string) => OptionState;
    locked: boolean;
    onSelect: (optionId: string) => void;
}) {
    const multi = question.questionType === "multiple_choice";
    return (
        <Box sx={{ display: "flex", justifyContent: "center", pt: { xs: "48px", md: "120px" }, pb: "32px" }}>
            <Box sx={{ position: "relative", width: 725, maxWidth: "100%", pt: "53px" }}>
                {BACK_CARDS.map((card) => (
                    <Box
                        key={card.glow.src}
                        aria-hidden
                        sx={{
                            position: "absolute",
                            top: card.top,
                            left: card.left,
                            right: card.right,
                            bottom: card.bottom,
                            overflow: "hidden",
                            borderRadius: `${card.radius}px`,
                            border: `${card.border}px solid rgba(255,255,255,0.88)`,
                            backgroundImage: stackFill(card.angle),
                            backdropFilter: "blur(192px)",
                            "&::after": cardHighlight,
                        }}
                    >
                        <FigmaGlow
                            src={`${ACTIVITY_ASSETS}/${card.glow.src}`}
                            left={card.glow.left}
                            top={card.glow.top}
                            width={card.glow.w}
                            height={card.glow.h}
                            innerWidth={card.glow.iw}
                            innerHeight={card.glow.ih}
                            transform="rotate(-119.47deg)"
                            inset="-6.98% -249.61%"
                        />
                    </Box>
                ))}

                <Box
                    sx={{
                        position: "relative",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "32px",
                        p: { xs: "20px", sm: "32px" },
                        borderRadius: "32px",
                        border: "1px solid rgba(255,255,255,0.88)",
                        backgroundImage:
                            "linear-gradient(169.86deg, rgba(0,0,0,0.88) 2.8876%, rgba(5,4,4,0.88) 52.201%, rgb(10,9,9) 107.29%, rgba(56,55,55,0.33) 162.38%, rgba(102,102,102,0.02) 217.47%)",
                        backdropFilter: "blur(200px)",
                        "&::after": cardHighlight,
                    }}
                >
                    <FigmaGlow
                        src={`${ACTIVITY_ASSETS}/question-glow-left.svg`}
                        left={-81}
                        top={-98}
                        width={466.552}
                        height={147.785}
                        innerWidth={458.233}
                        innerHeight={136.323}
                        transform="rotate(-178.53deg) skewX(-2.1deg)"
                        inset="-146.71% -43.65%"
                    />
                    <FigmaGlow
                        src={`${ACTIVITY_ASSETS}/question-glow-right.svg`}
                        left={10}
                        top={-281}
                        width={658.307}
                        height={416.478}
                        innerWidth={658.307}
                        innerHeight={416.478}
                        transform="rotate(180deg)"
                        inset="-40.85% -28.08% -44.72% -26.33%"
                    />
                    <FigmaGlow
                        src={`${ACTIVITY_ASSETS}/question-glow-1.svg`}
                        left={579}
                        top={-443}
                        width={1267.619}
                        height={739.927}
                        innerWidth={40.062}
                        innerHeight={1433.31}
                        transform="rotate(-119.47deg)"
                        inset="-6.98% -249.61%"
                    />

                    <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                        <Typography
                            component="h2"
                            sx={{ ...TYPE.headingSemibold24, fontSize: { xs: "20px", sm: "24px" }, lineHeight: { xs: "30px", sm: "36px" }, color: COLORS.white, textAlign: "center" }}
                        >
                            {question.prompt}
                        </Typography>
                        {multi && <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral300 }}>Select all that apply</Typography>}
                    </Box>

                    {question.imageUrl && (
                        <Box sx={{ position: "relative", width: 577, maxWidth: "100%", aspectRatio: "16 / 9", borderRadius: "12px", overflow: "hidden" }}>
                            <Image
                                src={question.imageUrl}
                                alt=""
                                fill
                                sizes="577px"
                                unoptimized={isRemoteSrc(question.imageUrl)}
                                style={{ objectFit: "contain", background: "#05050a" }}
                            />
                        </Box>
                    )}

                    <Box
                        role={multi ? "group" : "radiogroup"}
                        aria-label={question.prompt}
                        sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "24px", width: 577, maxWidth: "100%" }}
                    >
                        {question.options.map((option) => (
                            <OptionRow
                                key={option.optionId}
                                label={option.optionText}
                                state={optionState(option.optionId)}
                                multi={multi}
                                disabled={locked}
                                onSelect={() => onSelect(option.optionId)}
                            />
                        ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

function AnswerPill({ correct }: { correct: boolean | null }) {
    const neutral = correct === null;
    return (
        <Box
            role="status"
            sx={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                pl: "16px",
                pr: "24px",
                py: "12px",
                borderRadius: "99px",
                flexShrink: 0,
                ...(neutral
                    ? { border: `1px solid ${COLORS.primary75}`, bgcolor: "rgba(140,36,255,0.18)" }
                    : correct
                      ? { border: `1px solid ${COLORS.lessonDone}`, backgroundImage: "linear-gradient(99.93deg, #2EC4B6 27.735%, #1B4C33 102.73%)" }
                      : { border: "1px solid #F0B3BA", bgcolor: "#571119" }),
            }}
        >
            {!neutral && <Image src={`${ACTIVITY_ASSETS}/${correct ? "icon-check-20.svg" : "icon-x-20.svg"}`} alt="" width={20} height={20} />}
            <Typography sx={{ ...(correct ? TYPE.mediumMed16 : TYPE.smallMed14), color: COLORS.white, whiteSpace: "nowrap" }}>
                {neutral ? "Answer saved" : correct ? "Correct" : "Incorrect"}
            </Typography>
        </Box>
    );
}

function ExplanationDialog({
    open,
    question,
    selectedIds,
    answer,
    onClose,
    onContinue,
}: {
    open: boolean;
    question: QuizQuestionView;
    selectedIds: string[];
    answer: QuizAnswerResult;
    onClose: () => void;
    onContinue: () => void;
}) {
    const correct = Boolean(answer.isCorrect);
    const textOf = (ids: string[]) =>
        question.options
            .filter((o) => ids.includes(o.optionId))
            .map((o) => o.optionText)
            .join(", ") || "No answer";
    const explanation = answer.explanation?.trim() || "No explanation was provided for this question.";
    const fields = correct
        ? [{ label: "EXPLANATION", text: explanation }]
        : [
              { label: "YOUR ANSWER", text: textOf(selectedIds) },
              { label: "CORRECT ANSWER", text: textOf(answer.correctOptionIds ?? []) },
              { label: "EXPLANATION", text: explanation },
          ];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="quiz-explanation-title"
            slotProps={{
                backdrop: { sx: { bgcolor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" } },
                paper: {
                    sx: {
                        position: "relative",
                        width: 604,
                        maxWidth: "calc(100% - 32px)",
                        m: "16px",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "44px",
                        p: { xs: "24px", sm: "32px" },
                        borderRadius: "24px",
                        bgcolor: "#000",
                        backgroundImage: "none",
                        backdropFilter: "blur(50px)",
                        borderTop: "1.5px solid #508AF2",
                        borderRight: "1.5px solid #508AF2",
                        color: COLORS.white,
                    },
                },
            }}
        >
            <FigmaGlow
                src={`${ACTIVITY_ASSETS}/explain-glow.svg`}
                left={-139.88}
                top={-282.5}
                width={977.882}
                height={1140.277}
                innerWidth={69.794}
                innerHeight={1433.31}
                transform="rotate(-40.17deg)"
                inset="-6.98% -143.28%"
            />
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
                <Typography id="quiz-explanation-title" component="h2" sx={{ ...ACTIVITY_TYPE.poppinsBold28, fontSize: { xs: "22px", sm: "28px" }, color: COLORS.white }}>
                    {correct ? "Why this is correct" : "Why this is incorrect"}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {fields.map((field) => (
                        <Box key={field.label} sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <Typography sx={{ ...ACTIVITY_TYPE.latoReg14, color: COLORS.neutral500 }}>{field.label}</Typography>
                            <Typography sx={{ ...ACTIVITY_TYPE.interReg16, color: COLORS.white }}>{field.text}</Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
            <ButtonBase
                onClick={correct ? onClose : onContinue}
                sx={{
                    position: "relative",
                    width: "100%",
                    height: 40,
                    px: "16px",
                    borderRadius: "99px",
                    border: "1.5px solid #192C5C",
                    backgroundImage: "linear-gradient(-0.79deg, #192C5C 7.7062%, #345DC2 92.294%)",
                    transition: "filter .18s ease",
                    "&:hover": { filter: "brightness(1.15)" },
                    "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" },
                }}
            >
                <Typography component="span" sx={{ ...ACTIVITY_TYPE.interMed12, color: COLORS.white }}>
                    {correct ? "Got it" : "Continue"}
                </Typography>
            </ButtonBase>
        </Dialog>
    );
}

function firstOpenIndex(attempt: QuizAttemptView): number {
    const index = attempt.questions.findIndex((q) => !q.answer);
    return index === -1 ? attempt.questions.length : index;
}

/**
 * Knowledge check overlay backed by the attempts API: intro (attempt limits / cooldown / resume) →
 * server-timed questions with per-question answers → graded result with XP and rewards.
 */
export default function QuizFlow({
    open,
    lessonId,
    onClose,
    onContinueToLab,
    onCourseMap,
}: {
    open: boolean;
    lessonId: string;
    onClose: () => void;
    /** Opens the lab in the same section ("Continue to Lab"). */
    onContinueToLab: (labLessonId: string) => void;
    onCourseMap: () => void;
}) {
    const { quizIntro, quizAttempt, getQuizIntro, startQuizAttempt, answerQuizQuestion, submitQuizAttempt, getQuizAttempt } = useCourse();
    const [stage, setStage] = useState<Stage>("intro");
    const [error, setError] = useState<string | null>(null);
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [index, setIndex] = useState(0);
    const [selected, setSelected] = useState<string[]>([]);
    const [answer, setAnswer] = useState<QuizAnswerResult | null>(null);
    const [explaining, setExplaining] = useState(false);
    const [deadline, setDeadline] = useState<number | null>(null);
    const [result, setResult] = useState<QuizSubmitResult | null>(null);
    const [busy, setBusy] = useState(false);

    const intro = quizIntro?.lessonId === lessonId ? quizIntro : null;
    const attempt = attemptId && quizAttempt?.attemptId === attemptId ? quizAttempt : null;
    const question = attempt?.questions[index] ?? null;
    const total = attempt?.totalQuestions ?? 0;

    useEffect(() => {
        let cancelled = false;
        getQuizIntro(lessonId).then((res) => {
            if (!cancelled && !res.success) setError(res.message ?? "Failed to load the quiz");
        });
        return () => {
            cancelled = true;
        };
    }, [lessonId, getQuizIntro]);

    const finish = async (id: string) => {
        setBusy(true);
        setExplaining(false);
        try {
            const res = await submitQuizAttempt(id);
            if (!res.success || !res.data) {
                toast.error(res.message ?? "Failed to submit the quiz");
                return;
            }
            setResult(res.data);
            setStage("result");
            announceRewards(res.data.rewards, res.data.xpAwarded);
        } finally {
            setBusy(false);
        }
    };

    const begin = (view: QuizAttemptView) => {
        // Drive the timer from the server deadline, corrected for this device's clock skew.
        const offset = Date.parse(view.serverTime) - Date.now();
        setDeadline(view.deadlineAt ? Date.parse(view.deadlineAt) - offset : null);
        setAttemptId(view.attemptId);
        setSelected([]);
        setAnswer(null);
        setResult(null);
        const next = firstOpenIndex(view);
        setIndex(next);
        if (view.attemptStatus !== "in_progress" || next >= view.questions.length) {
            finish(view.attemptId);
            return;
        }
        setStage("question");
    };

    const start = async () => {
        setBusy(true);
        try {
            const res = await startQuizAttempt(lessonId);
            if (!res.success || !res.data) {
                toast.error(res.message ?? "Failed to start the quiz");
                await getQuizIntro(lessonId);
                return;
            }
            begin(res.data);
        } finally {
            setBusy(false);
        }
    };

    const submitAnswer = async () => {
        if (!attempt || !question || !selected.length || busy) return;
        setBusy(true);
        try {
            const res = await answerQuizQuestion(attempt.attemptId, { questionId: question.questionId, selectedOptionIds: selected });
            if (res.success && res.data) {
                setAnswer(res.data);
                return;
            }
            const message = res.message ?? "Failed to submit the answer";
            if (/time is up/i.test(message)) {
                toast.error("Time is up — your attempt has been submitted");
                await finish(attempt.attemptId);
            } else if (/already/i.test(message)) {
                // Another tab answered first: resync and move on.
                const fresh = await getQuizAttempt(attempt.attemptId);
                if (fresh.success && fresh.data) begin(fresh.data);
            } else {
                toast.error(message);
            }
        } finally {
            setBusy(false);
        }
    };

    const advance = () => {
        if (!attempt) return;
        setExplaining(false);
        if (answer?.isLast || index + 1 >= attempt.questions.length) {
            finish(attempt.attemptId);
            return;
        }
        setIndex(index + 1);
        setSelected([]);
        setAnswer(null);
    };

    const retake = async () => {
        setStage("intro");
        setAttemptId(null);
        setResult(null);
        await getQuizIntro(lessonId);
    };

    const toggle = (optionId: string) => {
        if (!question || answer) return;
        if (question.questionType === "multiple_choice") {
            setSelected((prev) => (prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]));
        } else {
            setSelected([optionId]);
        }
    };

    const revealed = answer?.isCorrect !== undefined;
    const optionState = (optionId: string): OptionState => {
        const chosen = selected.includes(optionId);
        if (answer && revealed) {
            const right = answer.correctOptionIds?.includes(optionId) ?? false;
            if (right) return "correct";
            return chosen ? "incorrect" : "idle";
        }
        return chosen ? "selected" : "idle";
    };

    /* ------------------------------------------------------------ intro */

    if (stage === "intro") {
        let body: React.ReactNode;
        if (!intro) {
            body = error ? (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", pt: "120px", textAlign: "center" }}>
                    <Typography sx={{ ...TYPE.mediumMed16, color: COLORS.neutral100 }}>{error}</Typography>
                    <GhostButton onClick={onClose}>Back to module</GhostButton>
                </Box>
            ) : (
                <CenteredSpinner />
            );
        } else {
            // The API only sends cooldownUntil while the cooldown is still running.
            const cooldown = intro.cooldownUntil;
            const action: IntroAction =
                intro.questionCount === 0
                    ? { label: "Quiz coming soon", disabled: true, note: null }
                    : intro.inProgressAttemptId
                      ? { label: busy ? "Resuming…" : "Resume Quiz", disabled: busy, note: "You have an unfinished attempt." }
                      : intro.attemptsLeft === 0
                        ? { label: "No attempts left", disabled: true, note: null }
                        : cooldown
                          ? {
                                label: "Retake locked",
                                disabled: true,
                                note: `Available ${formatDate(cooldown)} at ${new Date(cooldown).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
                            }
                          : { label: busy ? "Starting…" : intro.attemptsUsed > 0 ? "Retake Quiz" : "Start Quiz", disabled: busy, note: null };
            const notes = [
                intro.bestScorePct !== null ? `Best score ${Math.round(intro.bestScorePct)}%` : null,
                `Pass mark ${Math.round(intro.passingScorePct)}%`,
                intro.maxAttempts ? `Attempts ${intro.attemptsUsed}/${intro.maxAttempts}` : null,
                intro.accuracyBonus.xp > 0 ? `+${intro.accuracyBonus.xp} XP bonus at ${Math.round(intro.accuracyBonus.thresholdPct)}%` : null,
            ].filter(Boolean);
            body = (
                <QuizIntroCard
                    title={intro.title || "Knowledge Test"}
                    lines={intro.introLines.length ? intro.introLines : DEFAULT_INTRO}
                    tiles={[
                        { value: String(intro.questionCount), label: "Questions" },
                        { value: intro.timeLimitSec ? `~${intro.estimateMinutes} min` : "No limit", label: "Time" },
                        { value: `+${intro.points}`, label: "Points" },
                    ]}
                    note={notes.join(" · ")}
                    action={action}
                    onStart={start}
                    onLater={onClose}
                />
            );
        }
        return (
            <ActivityPanel open={open} onClose={onClose} ariaLabel={intro?.title ?? "Knowledge check"}>
                {body}
            </ActivityPanel>
        );
    }

    /* ----------------------------------------------------------- result */

    if (stage === "result" && result) {
        const canRetake = Boolean(intro) && !intro?.inProgressAttemptId && intro?.attemptsLeft !== 0 && !intro?.cooldownUntil;
        const next = result.nextStep;
        const primary = next
            ? { label: "Continue to Lab", onClick: () => onContinueToLab(next.labLessonId) }
            : !result.passed && canRetake
              ? { label: "Retake Quiz", onClick: retake }
              : { label: "Back to Module", onClick: onClose };
        const secondary = primary.label === "Back to Module" ? { label: "Go back to Course Map", onClick: onCourseMap } : { label: "Back to Module", onClick: onClose };
        return (
            <ActivityPanel open={open} onClose={onClose} ariaLabel="Knowledge check result">
                <ResultCard
                    badge={QUIZ_BADGE}
                    title={result.attemptStatus === "expired" ? "Time's Up" : "Knowledge Check Complete"}
                    subtitle={
                        result.passed
                            ? "Great work! You’ve cleared the knowledge check."
                            : `You scored ${Math.round(result.scorePct)}%. Review the lesson and retake the quiz to lift your score.`
                    }
                    tiles={[
                        { value: `${result.correctCount}/${result.totalQuestions}`, label: "Score" },
                        { value: formatDuration((result.timeTakenSec ?? 0) * 1000), label: "Time taken" },
                        { value: `+${result.xpAwarded}`, label: "XP Earned" },
                    ]}
                    bonus={result.bonusXp ? { label: "Hurray! You get a Accuracy bonus", xp: result.bonusXp } : undefined}
                    nextStep={next ? `NEXT STEP : Complete the Lab Challenge “${next.title}” to finish this task.` : undefined}
                    primary={primary}
                    secondary={secondary}
                />
            </ActivityPanel>
        );
    }

    /* --------------------------------------------------------- question */

    return (
        <ActivityPanel
            open={open}
            onClose={onClose}
            ariaLabel={`Question ${index + 1} of ${total}`}
            header={
                attempt && (
                    <QuestionHeader
                        index={Math.min(index, Math.max(0, total - 1))}
                        total={total}
                        timer={deadline !== null && <QuizTimer deadline={deadline} onExpire={() => finish(attempt.attemptId)} />}
                    />
                )
            }
            footer={
                question &&
                (answer ? (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", width: "100%" }}>
                        <AnswerPill correct={revealed ? Boolean(answer.isCorrect) : null} />
                        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", ml: "auto" }}>
                            {revealed && (
                                <GhostButton size="lg" onClick={() => setExplaining(true)}>
                                    {answer.isCorrect ? "See Explanation" : "See Why?"}
                                </GhostButton>
                            )}
                            <ActivityButton onClick={advance} width={185} disabled={busy}>
                                {answer.isLast || index + 1 >= total ? "Finish Quiz" : "Continue"}
                            </ActivityButton>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
                        <ActivityButton onClick={submitAnswer} width={185} disabled={!selected.length || busy}>
                            {busy ? "Submitting…" : "Submit"}
                        </ActivityButton>
                    </Box>
                ))
            }
        >
            {question ? (
                <>
                    <QuestionStack question={question} optionState={optionState} locked={Boolean(answer) || busy} onSelect={toggle} />
                    {answer && revealed && (
                        <ExplanationDialog
                            open={explaining}
                            question={question}
                            selectedIds={selected}
                            answer={answer}
                            onClose={() => setExplaining(false)}
                            onContinue={advance}
                        />
                    )}
                </>
            ) : (
                <CenteredSpinner />
            )}
        </ActivityPanel>
    );
}
