"use client";

import React, { useEffect, useEffectEvent, useState } from "react";
import Image from "next/image";
import { Box, ButtonBase, Dialog, Typography } from "@mui/material";
import { COLORS, GOLD_GRADIENT, TYPE, gradientText } from "../my-courses-theme";
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
import { ACTIVITY_ASSETS, type Quiz, type QuizQuestion } from "./module-data";

export interface QuizOutcome {
    score: number;
    total: number;
    xp: number;
}

type Stage = "intro" | "question" | "result";
type OptionState = "idle" | "selected" | "correct" | "incorrect";

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

function QuizTimer({ deadline, totalMs, onExpire }: { deadline: number; totalMs: number; onExpire: () => void }) {
    const [remaining, setRemaining] = useState(totalMs);
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

function QuizIntro({ quiz, onStart, onLater }: { quiz: Quiz; onStart: () => void; onLater: () => void }) {
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
                            {quiz.title}
                        </Typography>
                        <Box>
                            {quiz.intro.map((line) => (
                                <Typography key={line} sx={{ ...ACTIVITY_TYPE.latoReg16, color: COLORS.neutral200 }}>
                                    {line}
                                </Typography>
                            ))}
                        </Box>
                    </Box>
                    <StatTiles
                        caption="BEFORE YOU START"
                        tiles={[
                            { value: String(quiz.questions.length), label: "Questions" },
                            { value: quiz.estimate, label: "Time" },
                            { value: `+${quiz.points}`, label: "Points" },
                        ]}
                    />
                    <CardDivider />
                    <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: 200, maxWidth: "100%" }}>
                        <ActivityButton onClick={onStart} width="100%">
                            Start Quiz
                        </ActivityButton>
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

function OptionRow({ label, state, disabled, onSelect }: { label: string; state: OptionState; disabled: boolean; onSelect: () => void }) {
    const tone = state === "idle" ? null : OPTION_TONE[state];
    return (
        <ButtonBase
            role="radio"
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
            <Image src={`${ACTIVITY_ASSETS}/${tone ? tone.radio : "radio.svg"}`} alt="" width={24} height={24} style={{ flexShrink: 0 }} />
            <Typography sx={{ ...TYPE.mediumMed16, color: COLORS.neutral100 }}>{label}</Typography>
        </ButtonBase>
    );
}

/** The live question card with four faded cards fanned out behind it. */
function QuestionStack({
    question,
    selected,
    result,
    onSelect,
}: {
    question: QuizQuestion;
    selected: number | null;
    result: "correct" | "incorrect" | null;
    onSelect: (index: number) => void;
}) {
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

                    <Typography
                        component="h2"
                        sx={{ position: "relative", ...TYPE.headingSemibold24, fontSize: { xs: "20px", sm: "24px" }, lineHeight: { xs: "30px", sm: "36px" }, color: COLORS.white, textAlign: "center" }}
                    >
                        {question.prompt}
                    </Typography>

                    <Box role="radiogroup" aria-label={question.prompt} sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "24px", width: 577, maxWidth: "100%" }}>
                        {question.options.map((option, i) => {
                            const state: OptionState = selected !== i ? "idle" : result ?? "selected";
                            return <OptionRow key={option} label={option} state={state} disabled={result !== null} onSelect={() => onSelect(i)} />;
                        })}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

function AnswerPill({ correct }: { correct: boolean }) {
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
                ...(correct
                    ? { border: `1px solid ${COLORS.lessonDone}`, backgroundImage: "linear-gradient(99.93deg, #2EC4B6 27.735%, #1B4C33 102.73%)" }
                    : { border: "1px solid #F0B3BA", bgcolor: "#571119" }),
            }}
        >
            <Image src={`${ACTIVITY_ASSETS}/${correct ? "icon-check-20.svg" : "icon-x-20.svg"}`} alt="" width={20} height={20} />
            <Typography sx={{ ...(correct ? TYPE.mediumMed16 : TYPE.smallMed14), color: COLORS.white, whiteSpace: "nowrap" }}>
                {correct ? "Correct" : "Incorrect"}
            </Typography>
        </Box>
    );
}

function ExplanationDialog({
    open,
    question,
    chosen,
    onClose,
    onContinue,
}: {
    open: boolean;
    question: QuizQuestion;
    chosen: number | null;
    onClose: () => void;
    onContinue: () => void;
}) {
    const correct = chosen === question.answer;
    const fields = correct
        ? [{ label: "EXPLANATION", text: question.explanation }]
        : [
              { label: "YOUR ANSWER", text: chosen === null ? "No answer" : question.options[chosen] },
              { label: "CORRECT ANSWER", text: question.options[question.answer] },
              { label: "EXPLANATION", text: question.explanation },
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

/** Knowledge test overlay: intro → timed questions with instant feedback → result. */
export default function QuizFlow({
    open,
    quiz,
    hasLab,
    onClose,
    onComplete,
    onContinueToLab,
}: {
    open: boolean;
    quiz: Quiz;
    /** Whether the section has a lab to point the learner at next. */
    hasLab: boolean;
    onClose: () => void;
    onComplete: (outcome: QuizOutcome) => void;
    onContinueToLab: () => void;
}) {
    const [stage, setStage] = useState<Stage>("intro");
    const [index, setIndex] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [explaining, setExplaining] = useState(false);
    const [clock, setClock] = useState<{ start: number; deadline: number } | null>(null);
    const [elapsed, setElapsed] = useState(0);

    const total = quiz.questions.length;
    const question = quiz.questions[index];
    const score = answers.reduce<number>((sum, a, i) => sum + (a === quiz.questions[i].answer ? 1 : 0), 0);
    const ratio = total ? score / total : 0;
    const bonus = ratio >= quiz.accuracyBonus.threshold ? quiz.accuracyBonus.xp : 0;
    const xp = Math.round(quiz.points * ratio);

    const start = () => {
        const now = Date.now();
        setClock({ start: now, deadline: now + quiz.timeLimitSec * 1000 });
        setStage("question");
    };

    const finish = (finalAnswers: (number | null)[]) => {
        setElapsed(clock ? Math.min(Date.now() - clock.start, quiz.timeLimitSec * 1000) : 0);
        setExplaining(false);
        setStage("result");
        const finalScore = finalAnswers.reduce<number>((sum, a, i) => sum + (a === quiz.questions[i].answer ? 1 : 0), 0);
        const finalRatio = total ? finalScore / total : 0;
        onComplete({
            score: finalScore,
            total,
            xp: Math.round(quiz.points * finalRatio) + (finalRatio >= quiz.accuracyBonus.threshold ? quiz.accuracyBonus.xp : 0),
        });
    };

    const submit = () => {
        if (selected === null) return;
        const next = [...answers];
        next[index] = selected;
        setAnswers(next);
        setSubmitted(true);
    };

    const advance = () => {
        setExplaining(false);
        if (index + 1 < total) {
            setIndex(index + 1);
            setSelected(null);
            setSubmitted(false);
        } else {
            finish(answers);
        }
    };

    const correct = submitted && selected === question.answer;

    if (stage === "intro") {
        return (
            <ActivityPanel open={open} onClose={onClose} ariaLabel={quiz.title}>
                <QuizIntro quiz={quiz} onStart={start} onLater={onClose} />
            </ActivityPanel>
        );
    }

    if (stage === "result") {
        return (
            <ActivityPanel open={open} onClose={onClose} ariaLabel="Knowledge check result">
                <ResultCard
                    badge={QUIZ_BADGE}
                    title="Knowledge Check Complete"
                    subtitle={ratio >= 0.5 ? "Great work! You’ve cleared the knowledge check." : "Keep going! Review the lesson and retake the quiz to lift your score."}
                    tiles={[
                        { value: `${score}/${total}`, label: "Score" },
                        { value: formatDuration(elapsed), label: "Time taken" },
                        { value: `+${xp}`, label: "XP Earned" },
                    ]}
                    bonus={bonus ? { label: "Hurray! You get a Accuracy bonus", xp: bonus } : undefined}
                    nextStep={hasLab ? "NEXT STEP : Complete the Lab Challenge to finish this level." : undefined}
                    primary={hasLab ? { label: "Continue to Lab", onClick: onContinueToLab } : { label: "Back to Module", onClick: onClose }}
                    secondary={{ label: "Go back to Home", onClick: onClose }}
                />
            </ActivityPanel>
        );
    }

    return (
        <ActivityPanel
            open={open}
            onClose={onClose}
            ariaLabel={`Question ${index + 1} of ${total}`}
            header={
                <QuestionHeader
                    index={index}
                    total={total}
                    timer={clock && <QuizTimer deadline={clock.deadline} totalMs={quiz.timeLimitSec * 1000} onExpire={() => finish(answers)} />}
                />
            }
            footer={
                submitted ? (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", width: "100%" }}>
                        <AnswerPill correct={correct} />
                        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", ml: "auto" }}>
                            <GhostButton size="lg" onClick={() => setExplaining(true)}>
                                {correct ? "See Explanation" : "See Why?"}
                            </GhostButton>
                            <ActivityButton onClick={advance} width={185}>
                                Continue
                            </ActivityButton>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
                        <ActivityButton onClick={submit} width={185} disabled={selected === null}>
                            Submit
                        </ActivityButton>
                    </Box>
                )
            }
        >
            <QuestionStack question={question} selected={selected} result={submitted ? (correct ? "correct" : "incorrect") : null} onSelect={setSelected} />
            <ExplanationDialog open={explaining} question={question} chosen={selected} onClose={() => setExplaining(false)} onContinue={advance} />
        </ActivityPanel>
    );
}
