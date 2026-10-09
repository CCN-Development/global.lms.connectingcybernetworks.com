"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Box, ButtonBase, Collapse, InputBase, Typography } from "@mui/material";
import { MdCheck, MdErrorOutline, MdLockOutline } from "react-icons/md";
import { Line, RotatedDecor, glassFill, lato } from "@/components/dashboard/home/shared";
import { AISH, FONT_INTER, FONT_POPPINS, gradientBorder } from "@/components/aish/tokens";
import { DIFFICULTY_ICON } from "@/components/practice-labs/LabCard";
import { FadeDivider } from "@/components/practice-labs/LabFilters";
import {
    findPracticeLab,
    labAsset,
    type LabTaskBlock,
    type PracticeLab,
    type PracticeLabTask,
} from "@/components/practice-labs/lab-data";

// ── Tokens ─────────────────────────────────────────────────────────────────────

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

const BODY = {
    fontFamily: FONT_INTER,
    fontWeight: 400,
    fontSize: { xs: "14px", sm: "16px" },
    lineHeight: { xs: "22px", sm: "24px" },
    color: "#FFFFFF",
} as const;

const LABEL = {
    ...lato(16, 24, 500, "#A6A6A6"),
    fontSize: { xs: "14px", sm: "16px" },
    textTransform: "uppercase",
} as const;

const DISPLAY = {
    fontFamily: FONT_POPPINS,
    fontWeight: 700,
    fontSize: { xs: "22px", sm: "28px" },
    lineHeight: { xs: "32px", sm: "42px" },
    color: "#FFFFFF",
} as const;

/** Dark glass surface: gradient fill, 12px backdrop blur, gradient stroke, inner top highlight. */
const glassPanel = (angle: number, radius: number) =>
    ({
        position: "relative",
        borderRadius: `${radius}px`,
        backgroundImage: glassFill(angle),
        backdropFilter: "blur(12px)",
        boxShadow: "inset 0 3px 6px rgba(255,255,255,0.16)",
        "&::before": gradientBorder(),
    }) as const;

const menuSurface = (angle: number) =>
    ({
        borderRadius: "16px",
        p: { xs: "12px", sm: "16px" },
        backgroundImage: `linear-gradient(${angle}deg, rgba(64,64,64,0.25) 17.578%, rgba(64,64,64,0) 111.58%)`,
    }) as const;

// ── Shared pieces ──────────────────────────────────────────────────────────────

function BulletList({ items }: { items: string[] }) {
    return (
        <Box component="ul" sx={{ m: 0, pl: "24px", listStyle: "disc" }}>
            {items.map((item) => (
                <Typography key={item} component="li" sx={BODY}>
                    {item}
                </Typography>
            ))}
        </Box>
    );
}

function TextBlock({ heading, body, bullets }: { heading?: string; body?: string; bullets?: string[] }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
            {heading && <Typography sx={LABEL}>{heading}</Typography>}
            {body && <Typography sx={BODY}>{body}</Typography>}
            {bullets && bullets.length > 0 && (
                <Box sx={{ mt: body ? { xs: "14px", sm: "16px" } : 0 }}>
                    <BulletList items={bullets} />
                </Box>
            )}
        </Box>
    );
}

function LabTabs({
    tabs,
    value,
    onChange,
}: {
    tabs: { label: string; value: string }[];
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <Box role="tablist" sx={{ display: "flex", gap: { xs: "8px", sm: "12px" }, flexWrap: "wrap" }}>
            {tabs.map((tab) => {
                const active = tab.value === value;
                return (
                    <ButtonBase
                        key={tab.value}
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(tab.value)}
                        sx={{
                            px: "12px",
                            py: "8px",
                            borderRadius: "99px",
                            border: `1px solid ${active ? "#E3E9F8" : "transparent"}`,
                            backgroundImage: active
                                ? "linear-gradient(180deg, rgba(187,201,237,0.12) 0%, rgba(106,114,135,0.12) 100%)"
                                : "none",
                            fontFamily: FONT_INTER,
                            fontWeight: 500,
                            fontSize: "14px",
                            lineHeight: "21px",
                            color: active ? "#FFFFFF" : "#8C8C8C",
                            whiteSpace: "nowrap",
                            transition: "color .15s ease",
                            "&:hover": { color: active ? "#FFFFFF" : "#D9D9D9" },
                        }}
                    >
                        {tab.label}
                    </ButtonBase>
                );
            })}
        </Box>
    );
}

// ── Task blocks ────────────────────────────────────────────────────────────────

function QuestionBlock({
    prompt,
    hint,
    solved,
    value,
    error,
    onChange,
    onCheck,
}: {
    prompt: string;
    hint: string;
    solved: boolean;
    value: string;
    error: boolean;
    onChange: (next: string) => void;
    onCheck: () => void;
}) {
    const [hintOpen, setHintOpen] = useState(false);
    const borderColor = solved ? "rgba(46,196,182,0.64)" : error ? "rgba(244,63,94,0.64)" : "rgba(64,64,64,0.5)";

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Typography
                    sx={{
                        ...lato(16, 24, 500, "transparent"),
                        fontSize: { xs: "14px", sm: "16px" },
                        whiteSpace: "nowrap",
                        backgroundImage: "linear-gradient(90deg, #F1C40E 0%, #FF6000 100%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                    }}
                >
                    ANSWER THE QUESTION BELOW
                </Typography>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <FadeDivider />
                </Box>
            </Box>

            <Typography sx={BODY}>{prompt}</Typography>

            <InputBase
                fullWidth
                value={value}
                disabled={solved}
                placeholder="Type your answer"
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") onCheck();
                }}
                inputProps={{ "aria-label": prompt }}
                sx={{
                    ...BODY,
                    height: { xs: 52, sm: 60 },
                    px: "16px",
                    borderRadius: "12px",
                    bgcolor: "rgba(255,255,255,0.02)",
                    border: `1px solid ${borderColor}`,
                    transition: "border-color .15s ease",
                    "&.Mui-focused": { borderColor: solved ? borderColor : "rgba(227,233,248,0.32)" },
                    "& input::placeholder": { color: "#737373", opacity: 1 },
                    "& .Mui-disabled": { WebkitTextFillColor: "#FFFFFF" },
                }}
            />

            {error && !solved && (
                <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mt: "-8px" }}>
                    <MdErrorOutline size={14} color="#F43F5E" style={{ flexShrink: 0 }} />
                    <Typography sx={lato(12, 18, 500, "#F6D4D8")}>
                        That is not the expected answer. Review your evidence and try again.
                    </Typography>
                </Box>
            )}

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <ButtonBase
                    aria-label={hintOpen ? "Hide hint" : "Show hint"}
                    aria-expanded={hintOpen}
                    onClick={() => setHintOpen((v) => !v)}
                    sx={{
                        position: "relative",
                        width: 44,
                        height: 36,
                        flexShrink: 0,
                        borderRadius: "8px",
                        bgcolor: hintOpen ? "rgba(241,196,14,0.08)" : "transparent",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
                    }}
                >
                    <Box sx={{ position: "absolute", inset: "-2.78% -2.27%" }}>
                        <Image src={labAsset("hint-button.svg")} alt="" fill sizes="46px" style={{ maxWidth: "none" }} />
                    </Box>
                </ButtonBase>

                <ButtonBase
                    disabled={solved}
                    onClick={onCheck}
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        height: 36,
                        gap: "8px",
                        px: "16px",
                        borderRadius: "8px",
                        backgroundImage: "linear-gradient(99.26deg, rgb(46,196,182) 4.5235%, rgb(27,76,51) 104.18%)",
                        filter: "drop-shadow(0 0 4px rgba(255,255,255,0.12))",
                        ...lato(14, 21, 500, "#FFFFFF"),
                        transition: "filter .15s ease",
                        "&:hover": { filter: "drop-shadow(0 0 4px rgba(255,255,255,0.12)) brightness(1.12)" },
                        "&.Mui-disabled": { color: "#FFFFFF", opacity: 0.72 },
                    }}
                >
                    {solved && <MdCheck size={16} />}
                    {solved ? "Correct" : "Check"}
                </ButtonBase>
            </Box>

            <Collapse in={hintOpen} unmountOnExit>
                <Box
                    sx={{
                        borderRadius: "12px",
                        border: "1px solid rgba(241,196,14,0.32)",
                        bgcolor: "rgba(241,196,14,0.06)",
                        px: "16px",
                        py: "12px",
                    }}
                >
                    <Typography sx={lato(14, 21, 500, "#F1C40E")}>{hint}</Typography>
                </Box>
            </Collapse>
        </Box>
    );
}

function ProgressPill({ percent }: { percent: number }) {
    const done = percent === 100;
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                px: "12px",
                py: "2px",
                borderRadius: "99px",
                bgcolor: done ? "#BBEDBB" : "#BBC9ED",
                flexShrink: 0,
            }}
        >
            {done && <Image src={labAsset("icon-check-circle.svg")} alt="" width={14} height={14} />}
            <Typography
                sx={{
                    ...lato(14, 21, 500, done ? "#0E340E" : "#0E1934"),
                    fontSize: { xs: "12px", sm: "14px" },
                    whiteSpace: "nowrap",
                }}
            >
                {percent}% Completed
            </Typography>
        </Box>
    );
}

function TaskAccordion({
    task,
    index,
    open,
    onToggle,
    answers,
    solved,
    errors,
    onAnswerChange,
    onCheck,
}: {
    task: PracticeLabTask;
    index: number;
    open: boolean;
    onToggle: () => void;
    answers: Record<string, string>;
    solved: Record<string, boolean>;
    errors: Record<string, boolean>;
    onAnswerChange: (questionId: string, value: string) => void;
    onCheck: (questionId: string, expected: string) => void;
}) {
    const questions = task.blocks.filter((b): b is Extract<LabTaskBlock, { kind: "question" }> => b.kind === "question");
    const solvedCount = questions.filter((q) => solved[q.questionId]).length;
    const percent = questions.length ? Math.round((solvedCount / questions.length) * 100) : 0;

    return (
        <Box sx={{ ...menuSurface(open ? 91.5 : 118.78), width: "100%" }}>
            <ButtonBase
                onClick={onToggle}
                aria-expanded={open}
                sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}
            >
                <Typography noWrap sx={{ ...lato(18, 27, 500, "#F2F2F2"), fontSize: { xs: "16px", sm: "18px" } }}>
                    {task.title || `Task ${index + 1}`}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                    {percent > 0 && <ProgressPill percent={percent} />}
                    <Image src={labAsset("icon-chevron-down.svg")} alt="" width={20} height={20} />
                </Box>
            </ButtonBase>

            <Collapse in={open} unmountOnExit>
                <Box sx={{ pt: "16px" }}>
                    <FadeDivider />
                </Box>
                <Box sx={{ pt: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
                    {task.blocks.map((block, blockIndex) => {
                        if (block.kind === "banner") {
                            return (
                                <Image
                                    key={blockIndex}
                                    src={block.image}
                                    alt={block.caption}
                                    width={439}
                                    height={237}
                                    sizes="(max-width: 600px) 100vw, 439px"
                                    style={{ width: "100%", maxWidth: 439, height: "auto", objectFit: "cover" }}
                                />
                            );
                        }

                        if (block.kind === "text") {
                            return <TextBlock key={blockIndex} heading={block.heading} body={block.body} bullets={block.bullets} />;
                        }

                        return (
                            <QuestionBlock
                                key={block.questionId}
                                prompt={block.prompt}
                                hint={block.hint}
                                solved={Boolean(solved[block.questionId])}
                                value={answers[block.questionId] ?? ""}
                                error={Boolean(errors[block.questionId])}
                                onChange={(next) => onAnswerChange(block.questionId, next)}
                                onCheck={() => onCheck(block.questionId, block.answer)}
                            />
                        );
                    })}
                </Box>
            </Collapse>
        </Box>
    );
}

// ── Overview / Solution ────────────────────────────────────────────────────────

function InfoSection({ heading, children }: { heading: string; children: React.ReactNode }) {
    return (
        <Box sx={{ ...menuSurface(118.78), display: "flex", flexDirection: "column", gap: "8px" }}>
            <Typography sx={LABEL}>{heading}</Typography>
            {children}
        </Box>
    );
}

const MetaDot = () => <Image src={labAsset("meta-dot.svg")} alt="" width={4} height={4} style={{ flexShrink: 0 }} />;

function MetaItem({ icon, size = 16, label }: { icon?: string; size?: number; label: string }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {icon && <Image src={labAsset(icon)} alt="" width={size} height={size} />}
            <Typography sx={{ ...lato(14, 21, 500, "#F2F2F2"), whiteSpace: "nowrap" }}>{label}</Typography>
        </Box>
    );
}

function OverviewTab({ lab }: { lab: PracticeLab }) {
    const meta = [
        <MetaItem key="difficulty" icon={DIFFICULTY_ICON[lab.difficulty]} size={20} label={lab.difficulty} />,
        <MetaItem key="xp" icon="icon-zap.svg" label={`${lab.xp} XP`} />,
        <MetaItem key="access" icon="icon-star.svg" label={lab.access} />,
        <MetaItem key="time" label={`${lab.durationMinutes} min`} />,
        <MetaItem key="room" label={lab.roomType} />,
        <MetaItem key="category" label={lab.category} />,
    ];

    return (
        <>
            <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", columnGap: "10px", rowGap: "8px" }}>
                {meta.map((item, i) => (
                    <Box key={item.key} sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {i > 0 && <MetaDot />}
                        {item}
                    </Box>
                ))}
            </Box>

            <InfoSection heading="About this lab">
                <Typography sx={BODY}>{lab.overview}</Typography>
            </InfoSection>
            <InfoSection heading="What you will learn">
                <BulletList items={lab.objectives} />
            </InfoSection>
            <InfoSection heading="Prerequisites">
                <BulletList items={lab.prerequisites} />
            </InfoSection>
        </>
    );
}

// ── Challenge panel ────────────────────────────────────────────────────────────

const GLOW_BLEED = "-40.85% -28.08% -44.72% -26.33%";

function Stat({ children }: { children: React.ReactNode }) {
    return (
        <Box
            sx={{
                position: "relative",
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                p: { xs: "10px 6px", sm: "12px" },
                borderRadius: "12px",
                bgcolor: "rgba(0,0,0,0.24)",
                backdropFilter: "blur(15px)",
                "&::before": gradientBorder(),
            }}
        >
            {children}
        </Box>
    );
}

const statValue = { ...lato(18, 27, 500, "#FFFFFF"), fontSize: { xs: "16px", sm: "18px" }, whiteSpace: "nowrap" } as const;
const statLabel = { ...lato(16, 24, 400, "#BFBFBF"), fontSize: { xs: "14px", sm: "16px" } } as const;

function LabChallengePanel({ lab }: { lab: PracticeLab }) {
    const router = useRouter();
    const [running] = useState(false);
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (!running) return;
        const id = setInterval(() => setElapsed((v) => v + 1), 1000);
        return () => clearInterval(id);
    }, [running]);

    const clock = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

    return (
        <Box
            sx={{
                ...glassPanel(161.73, 32),
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: { xs: "24px", sm: "32px" },
                px: { xs: "16px", sm: "24px" },
                py: { xs: "24px", sm: "32px" },
                textAlign: "center",
            }}
        >
            <RotatedDecor
                src={labAsset("challenge-glow-1.svg")}
                length={658.307}
                thickness={416.478}
                rotate={180}
                bleed={GLOW_BLEED}
                sx={{ right: -345, top: -235, width: 658.307, height: 416.478 }}
            />
            <RotatedDecor
                src={labAsset("challenge-glow-2.svg")}
                length={658.302}
                thickness={416.479}
                rotate={-135.73}
                bleed={GLOW_BLEED}
                sx={{ left: -527, top: -33, width: 762.09, height: 757.758 }}
            />

            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <Box
                    sx={{
                        position: "relative",
                        width: 70,
                        height: 70,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "7px",
                        background:
                            "radial-gradient(circle 35px at 50% 50%, rgba(217,217,217,0.08) 0%, rgba(166,166,166,0.08) 50%, rgba(141,141,141,0.08) 75%, rgba(115,115,115,0.08) 100%)",
                        boxShadow: "0 24.5px 53.455px -28.955px #8A50E6",
                        "&::before": gradientBorder("1.75px"),
                    }}
                >
                    <Image src={labAsset("icon-flask.svg")} alt="" width={35} height={35} />
                </Box>

                <Typography
                    component="h2"
                    sx={{
                        fontFamily: FONT_POPPINS,
                        fontWeight: 600,
                        fontSize: { xs: "22px", sm: "28px" },
                        lineHeight: { xs: "32px", sm: "42px" },
                        color: "#D9D9D9",
                    }}
                >
                    Lab Challenge
                </Typography>
                <Typography sx={{ ...lato(16, 24, 400, "#BFBFBF"), fontSize: { xs: "14px", sm: "16px" } }}>
                    Put your knowledge into practice.
                    <br />
                    Complete the hands-on task, solve the challenge, and prove your skills.
                </Typography>
            </Box>

            <Box sx={{ position: "relative", width: "100%", maxWidth: 506, display: "flex", flexDirection: "column", gap: "16px" }}>
                <Typography sx={lato(12, 18, 500, "#8C8C8C")}>{running ? "SESSION RUNNING" : "BEFORE YOU START"}</Typography>

                {running ? (
                    <Stat>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#2EC4B6" }} />
                            <Typography sx={statValue}>Environment ready — {clock}</Typography>
                        </Box>
                    </Stat>
                ) : (
                    <Box sx={{ display: "flex", gap: { xs: "8px", sm: "16px" } }}>
                        <Stat>
                            <Typography sx={statValue}>{lab.tasks.length}</Typography>
                            <Typography sx={statLabel}>Tasks</Typography>
                        </Stat>
                        <Stat>
                            <Typography sx={statValue}>{lab.durationMinutes} min</Typography>
                            <Typography sx={statLabel}>Time</Typography>
                        </Stat>
                        <Stat>
                            <Typography sx={statValue}>+{lab.points}</Typography>
                            <Typography sx={statLabel}>Points</Typography>
                        </Stat>
                    </Box>
                )}
            </Box>

            <Box sx={{ position: "relative", width: "100%" }}>
                <Line src={labAsset("challenge-divider.svg")} />
            </Box>

            <Box sx={{ position: "relative", width: 200, display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                <ButtonBase
                    // onClick={() => setRunning((v) => !v)}
                    sx={{
                        width: "100%",
                        height: 44,
                        borderRadius: "10px",
                        backgroundImage: running ? "linear-gradient(90deg, #9D1F2E 0%, #F43F5E 100%)" : AISH.sendBg,
                        filter: "drop-shadow(0 0 4px rgba(255,255,255,0.12))",
                        fontFamily: FONT_INTER,
                        fontWeight: 500,
                        fontSize: "14px",
                        lineHeight: "21px",
                        color: "#FFFFFF",
                        transition: "filter .15s ease",
                        "&:hover": { filter: "drop-shadow(0 0 4px rgba(255,255,255,0.12)) brightness(1.15)" },
                    }}
                >
                    {running ? "Stop Lab" : "Launch Lab"}
                </ButtonBase>

                <ButtonBase
                    onClick={() => router.push("/dashboard/student/practice-labs")}
                    sx={{
                        height: 36,
                        px: "16px",
                        borderRadius: "10px",
                        backdropFilter: "blur(4px)",
                        ...lato(12, 18, 500, "#FFFFFF"),
                        "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
                    }}
                >
                    I will do this later
                </ButtonBase>
            </Box>
        </Box>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function PracticeLabDetailPage() {
    const params = useParams();
    const labId = params?.practice_lab_id as string;
    const lab = useMemo(() => findPracticeLab(labId), [labId]);

    const [tab, setTab] = useState("tasks");
    const [openTask, setOpenTask] = useState<string | null>(lab?.tasks[0]?.taskId ?? null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [solved, setSolved] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, boolean>>({});

    if (!lab) {
        return (
            <Typography sx={{ ...lato(14, 21, 500, "#A6A6A6"), textAlign: "center", py: 6 }}>
                Practice lab not found.
            </Typography>
        );
    }

    const totalQuestions = lab.tasks.reduce(
        (sum, task) => sum + task.blocks.filter((b) => b.kind === "question").length,
        0,
    );
    const solvedQuestions = Object.values(solved).filter(Boolean).length;
    const allSolved = totalQuestions > 0 && solvedQuestions === totalQuestions;

    const handleCheck = (questionId: string, expected: string) => {
        const correct = normalize(answers[questionId] ?? "") === normalize(expected);
        setSolved((prev) => ({ ...prev, [questionId]: correct }));
        setErrors((prev) => ({ ...prev, [questionId]: !correct }));
    };

    const tabs = [
        { label: "Overview", value: "overview" },
        { label: `Task (${lab.tasks.length})`, value: "tasks" },
        { label: "Solution", value: "solution" },
    ];

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 620fr) minmax(0, 612fr)" },
                gap: { xs: "16px", lg: "24px" },
                alignItems: "flex-start",
            }}
        >
            {/* Left — tabs + content */}
            <Box
                sx={{
                    ...glassPanel(150.58, 24),
                    minWidth: 0,
                    minHeight: { lg: "calc(100dvh - 128px)" },
                    display: "flex",
                    flexDirection: "column",
                    gap: { xs: "16px", sm: "24px" },
                    p: { xs: "16px", sm: "24px" },
                }}
            >
                <LabTabs tabs={tabs} value={tab} onChange={setTab} />

                {tab === "overview" && <OverviewTab lab={lab} />}

                {tab === "tasks" && (
                    <>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {lab.tasks.map((task, index) => (
                                <TaskAccordion
                                    key={task.taskId}
                                    task={task}
                                    index={index}
                                    open={openTask === task.taskId}
                                    onToggle={() => setOpenTask((prev) => (prev === task.taskId ? null : task.taskId))}
                                    answers={answers}
                                    solved={solved}
                                    errors={errors}
                                    onAnswerChange={(questionId, value) => {
                                        setAnswers((prev) => ({ ...prev, [questionId]: value }));
                                        setErrors((prev) => ({ ...prev, [questionId]: false }));
                                    }}
                                    onCheck={handleCheck}
                                />
                            ))}
                        </Box>

                        {lab.environment.length > 0 && (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: "16px", sm: "24px" } }}>
                                <Typography component="h2" sx={DISPLAY}>
                                    Lab Environment
                                </Typography>
                                {lab.environment.map((section) => (
                                    <Box key={section.heading} sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        <Typography component="h3" sx={{ ...DISPLAY, textTransform: "uppercase" }}>
                                            {section.heading}
                                        </Typography>
                                        <TextBlock body={section.body} bullets={section.bullets} />
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </>
                )}

                {tab === "solution" &&
                    (allSolved ? (
                        lab.solution.map((step, index) => (
                            <InfoSection key={step.title} heading={`${index + 1}. ${step.title}`}>
                                <Typography sx={BODY}>{step.body}</Typography>
                            </InfoSection>
                        ))
                    ) : (
                        <Box
                            sx={{
                                ...menuSurface(118.78),
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "8px",
                                py: { xs: 5, sm: 6 },
                                textAlign: "center",
                            }}
                        >
                            <MdLockOutline size={28} color="#A6A6A6" />
                            <Typography sx={lato(16, 24, 500, "#F2F2F2")}>Solution locked</Typography>
                            <Typography sx={lato(14, 21, 400, "#A6A6A6")}>
                                Answer all {totalQuestions} questions to unlock the full walkthrough. {solvedQuestions}/
                                {totalQuestions} solved.
                            </Typography>
                        </Box>
                    ))}
            </Box>

            {/* Right — challenge panel */}
            <Box sx={{ position: { lg: "sticky" }, top: 0, minWidth: 0 }}>
                <LabChallengePanel lab={lab} />
            </Box>
        </Box>
    );
}
