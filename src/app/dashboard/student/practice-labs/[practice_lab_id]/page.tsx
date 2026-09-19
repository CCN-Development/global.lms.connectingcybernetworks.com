"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Button, Collapse, IconButton, TextField, Typography } from "@mui/material";
import {
    MdBolt,
    MdCheckCircle,
    MdCheckCircleOutline,
    MdErrorOutline,
    MdKeyboardArrowDown,
    MdLockOutline,
    MdOutlineHelpOutline,
    MdOutlineMonitor,
    MdOutlineScience,
    MdOutlineTimer,
    MdStarBorder,
    MdStopCircle,
} from "react-icons/md";
import CCNTabs from "@/components/CCNTabs";
import {
    DIFFICULTY_COLORS,
    findPracticeLab,
    type LabTaskBlock,
    type PracticeLab,
    type PracticeLabTask,
} from "@/components/practice-labs/lab-data";

const PANEL_SX = {
    border: "1px solid #1c1c26",
    borderRadius: "16px",
    bgcolor: "#0b0b12",
} as const;

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

// ── Task blocks ────────────────────────────────────────────────────────────────

function TaskBanner({ caption }: { caption: string }) {
    return (
        <Box
            sx={{
                position: "relative",
                borderRadius: "10px",
                overflow: "hidden",
                border: "1px solid #23232e",
                background:
                    "radial-gradient(80% 120% at 20% 0%, #1e3a8a 0%, rgba(30,58,138,0) 60%), radial-gradient(70% 110% at 85% 10%, #4c1d95 0%, rgba(76,29,149,0) 60%), #0a1020",
                height: { xs: 130, sm: 165 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.75,
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                        "linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)",
                    backgroundSize: "34px 34px",
                    opacity: 0.18,
                }}
            />
            <MdOutlineMonitor size={30} color="#38bdf8" style={{ position: "relative" }} />
            <Typography
                sx={{ position: "relative", color: "#93c5fd", fontSize: "0.72rem", fontWeight: 600, px: 2, textAlign: "center" }}
            >
                {caption}
            </Typography>
        </Box>
    );
}

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

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.9 }}>
            <Typography
                sx={{
                    color: "#f59e0b",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                }}
            >
                Answer the question below
            </Typography>
            <Typography sx={{ color: "#c9c9d4", fontSize: "0.8rem", lineHeight: 1.6 }}>{prompt}</Typography>

            <TextField
                size="small"
                fullWidth
                value={value}
                disabled={solved}
                placeholder="Type your answer"
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") onCheck();
                }}
                slotProps={{
                    input: {
                        sx: {
                            bgcolor: "#101018",
                            borderRadius: "8px",
                            color: "#fff",
                            fontSize: "0.8rem",
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: solved ? "#10b981" : error ? "#f43f5e" : "#23232e",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: solved ? "#10b981" : "#3a3a48" },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#7c3aed" },
                            "&.Mui-disabled .MuiOutlinedInput-notchedOutline": { borderColor: "#10b981" },
                        },
                    },
                    htmlInput: { style: { color: "#fff", fontSize: "0.8rem" } },
                }}
            />

            {error && !solved && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <MdErrorOutline size={14} color="#f43f5e" />
                    <Typography sx={{ color: "#f43f5e", fontSize: "0.7rem" }}>
                        That is not the expected answer. Review your evidence and try again.
                    </Typography>
                </Box>
            )}

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <IconButton
                    onClick={() => setHintOpen((v) => !v)}
                    sx={{
                        width: 34,
                        height: 34,
                        flexShrink: 0,
                        borderRadius: "8px",
                        border: `1px solid ${hintOpen ? "#f59e0b" : "#2b2b38"}`,
                        color: hintOpen ? "#f59e0b" : "#8a8a9a",
                        "&:hover": { borderColor: "#f59e0b", color: "#f59e0b" },
                    }}
                >
                    <MdOutlineHelpOutline size={17} />
                </IconButton>

                <Button
                    fullWidth
                    disabled={solved}
                    onClick={onCheck}
                    startIcon={solved ? <MdCheckCircle size={16} /> : undefined}
                    sx={{
                        height: 34,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "#04241c",
                        background: "linear-gradient(90deg, #10b981 0%, #2dd4bf 100%)",
                        "&:hover": { background: "linear-gradient(90deg, #059669 0%, #14b8a6 100%)" },
                        "&.Mui-disabled": { background: "#0d2f26", color: "#10b981" },
                    }}
                >
                    {solved ? "Correct" : "Check"}
                </Button>
            </Box>

            <Collapse in={hintOpen} unmountOnExit>
                <Box sx={{ border: "1px solid #f59e0b", bgcolor: "#1c1508", borderRadius: "8px", p: 1 }}>
                    <Typography sx={{ color: "#fbbf24", fontSize: "0.72rem", lineHeight: 1.6 }}>{hint}</Typography>
                </Box>
            </Collapse>
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
        <Box
            sx={{
                border: `1px solid ${percent === 100 ? "#10b981" : open ? "#2b2b38" : "#1c1c26"}`,
                borderRadius: "12px",
                bgcolor: "#101018",
                overflow: "hidden",
                transition: "border-color .18s ease",
            }}
        >
            <Box
                onClick={onToggle}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    px: 1.5,
                    py: 1.1,
                    cursor: "pointer",
                    userSelect: "none",
                    "&:hover": { bgcolor: "#16161f" },
                }}
            >
                <Typography sx={{ color: "#fff", fontSize: "0.82rem", fontWeight: 600 }}>
                    {task.title || `Task ${index + 1}`}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                    {percent > 0 && (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.4,
                                border: `1px solid ${percent === 100 ? "#10b981" : "#f59e0b"}`,
                                bgcolor: percent === 100 ? "#0d2f26" : "#1c1508",
                                color: percent === 100 ? "#10b981" : "#f59e0b",
                                borderRadius: "999px",
                                px: 0.9,
                                py: 0.2,
                                fontSize: "0.65rem",
                                fontWeight: 700,
                            }}
                        >
                            <MdCheckCircleOutline size={13} />
                            {percent}% Completed
                        </Box>
                    )}
                    <MdKeyboardArrowDown
                        size={18}
                        color="#8a8a9a"
                        style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .18s ease" }}
                    />
                </Box>
            </Box>

            <Collapse in={open} unmountOnExit>
                <Box sx={{ height: "1px", bgcolor: "#1c1c26" }} />
                <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1.25 }}>
                    {task.blocks.map((block, blockIndex) => {
                        if (block.kind === "banner") return <TaskBanner key={blockIndex} caption={block.caption} />;

                        if (block.kind === "text") {
                            return (
                                <Box key={blockIndex} sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                    {block.heading && (
                                        <Typography
                                            sx={{
                                                color: "#8a8a9a",
                                                fontSize: "0.68rem",
                                                fontWeight: 700,
                                                letterSpacing: "0.08em",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            {block.heading}
                                        </Typography>
                                    )}
                                    <Typography sx={{ color: "#b4b4c2", fontSize: "0.8rem", lineHeight: 1.7 }}>
                                        {block.body}
                                    </Typography>
                                </Box>
                            );
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

// ── Side panel ─────────────────────────────────────────────────────────────────

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
    return (
        <Box
            sx={{
                flex: 1,
                minWidth: 0,
                border: "1px solid #2b2b38",
                borderRadius: "10px",
                bgcolor: "#101018",
                py: 1.1,
                px: 0.5,
                textAlign: "center",
            }}
        >
            <Typography noWrap sx={{ color, fontSize: "1rem", fontWeight: 800, lineHeight: 1.3 }}>
                {value}
            </Typography>
            <Typography sx={{ color: "#8a8a9a", fontSize: "0.68rem" }}>{label}</Typography>
        </Box>
    );
}

function LabChallengePanel({ lab }: { lab: PracticeLab }) {
    const router = useRouter();
    const [running, setRunning] = useState(false);
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
                ...PANEL_SX,
                position: "relative",
                overflow: "hidden",
                p: { xs: 2, sm: 3 },
                textAlign: "center",
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    bottom: "-45%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "130%",
                    height: "85%",
                    background: "radial-gradient(ellipse at center, #7c3aed 0%, rgba(124,58,237,0) 68%)",
                    opacity: 0.35,
                    filter: "blur(30px)",
                    pointerEvents: "none",
                }}
            />

            <Box sx={{ position: "relative" }}>
                <Box
                    sx={{
                        width: 46,
                        height: 46,
                        mx: "auto",
                        mb: 1.25,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "12px",
                        border: "1px solid #3a3a48",
                        bgcolor: "#101018",
                    }}
                >
                    <MdOutlineScience size={24} color="#c4b5fd" />
                </Box>

                <Typography sx={{ color: "#fff", fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.01em" }}>
                    Lab Challenge
                </Typography>
                <Typography sx={{ color: "#9a9aab", fontSize: "0.75rem", lineHeight: 1.7, mt: 0.5 }}>
                    Put your knowledge into practice.
                    <br />
                    Complete the hands-on task, solve the challenge, and prove your skills.
                </Typography>

                <Typography
                    sx={{
                        color: "#6b6b7b",
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        mt: 2,
                        mb: 1,
                    }}
                >
                    {running ? "Session running" : "Before you start"}
                </Typography>

                {running ? (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                            border: "1px solid #10b981",
                            bgcolor: "#0d2f26",
                            borderRadius: "10px",
                            py: 1.1,
                        }}
                    >
                        <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#10b981" }} />
                        <Typography sx={{ color: "#10b981", fontSize: "0.82rem", fontWeight: 700 }}>
                            Environment ready — {clock}
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Stat value={String(lab.tasks.length)} label="Tasks" color="#fff" />
                        <Stat value={`${lab.durationMinutes} min`} label="Time" color="#fff" />
                        <Stat value={`+${lab.points}`} label="Points" color="#fff" />
                    </Box>
                )}

                <Button
                    fullWidth
                    // onClick={() => setRunning((v) => !v)}
                    startIcon={running ? <MdStopCircle size={17} /> : undefined}
                    sx={{
                        mt: 2,
                        py: 1,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: "#fff",
                        background: running
                            ? "linear-gradient(90deg, #be123c 0%, #f43f5e 100%)"
                            : "linear-gradient(90deg, #1d4ed8 0%, #7c3aed 100%)",
                        "&:hover": {
                            background: running
                                ? "linear-gradient(90deg, #9f1239 0%, #e11d48 100%)"
                                : "linear-gradient(90deg, #1e40af 0%, #6d28d9 100%)",
                        },
                    }}
                >
                    {running ? "Stop Lab" : "Launch Lab"}
                </Button>

                <Button
                    onClick={() => router.push("/dashboard/student/practice-labs")}
                    sx={{
                        mt: 1,
                        color: "#6b6b7b",
                        fontSize: "0.72rem",
                        fontWeight: 500,
                        textTransform: "none",
                        "&:hover": { color: "#b4b4c2", bgcolor: "transparent" },
                    }}
                >
                    I will do this later
                </Button>
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
            <Typography sx={{ color: "#8a8a9a", fontSize: "0.82rem", textAlign: "center", py: 6 }}>
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

    const TABS = [
        { label: "Overview", value: "overview" },
        { label: `Task (${lab.tasks.length})`, value: "tasks" },
        { label: "Solution", value: "solution" },
    ];

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "3fr 2fr" },
                gap: 1.5,
                alignItems: "flex-start",
            }}
        >
            {/* Left — tabs + content */}
            <Box sx={{ ...PANEL_SX, p: { xs: 1.25, sm: 1.5 }, minWidth: 0 }}>
                <CCNTabs tabs={TABS} value={tab} onChange={(t) => setTab(t.value ?? "overview")} />

                <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 1.25 }}>
                    {tab === "overview" && (
                        <>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                                <MetaChip
                                    icon={<MdBolt size={13} color="#f59e0b" />}
                                    label={`${lab.xp} XP`}
                                    color="#f59e0b"
                                />
                                <MetaChip
                                    icon={<MdOutlineTimer size={13} color="#009DFF" />}
                                    label={`${lab.durationMinutes} min`}
                                    color="#009DFF"
                                />
                                <MetaChip
                                    icon={<MdOutlineScience size={13} color={DIFFICULTY_COLORS[lab.difficulty]} />}
                                    label={lab.difficulty}
                                    color={DIFFICULTY_COLORS[lab.difficulty]}
                                />
                                <MetaChip
                                    icon={<MdStarBorder size={13} color="#06b6d4" />}
                                    label={lab.access}
                                    color="#06b6d4"
                                />
                                <MetaChip label={lab.roomType} color="#7c3aed" />
                                <MetaChip label={lab.category} color="#10b981" />
                            </Box>

                            <Section heading="About this lab" accent="#009DFF">
                                <Typography sx={{ color: "#b4b4c2", fontSize: "0.8rem", lineHeight: 1.7 }}>
                                    {lab.overview}
                                </Typography>
                            </Section>

                            <Section heading="What you will learn" accent="#10b981">
                                <BulletList items={lab.objectives} color="#10b981" />
                            </Section>

                            <Section heading="Prerequisites" accent="#f59e0b">
                                <BulletList items={lab.prerequisites} color="#f59e0b" />
                            </Section>
                        </>
                    )}

                    {tab === "tasks" &&
                        lab.tasks.map((task, index) => (
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

                    {tab === "solution" &&
                        (allSolved ? (
                            lab.solution.map((step, index) => (
                                <Section key={step.title} heading={`${index + 1}. ${step.title}`} accent="#7c3aed">
                                    <Typography sx={{ color: "#b4b4c2", fontSize: "0.8rem", lineHeight: 1.7 }}>
                                        {step.body}
                                    </Typography>
                                </Section>
                            ))
                        ) : (
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 0.75,
                                    py: 5,
                                    border: "1px solid #2b2b38",
                                    borderRadius: "12px",
                                    bgcolor: "#101018",
                                }}
                            >
                                <MdLockOutline size={24} color="#f59e0b" />
                                <Typography sx={{ color: "#e4e4ec", fontSize: "0.82rem", fontWeight: 600 }}>
                                    Solution locked
                                </Typography>
                                <Typography sx={{ color: "#8a8a9a", fontSize: "0.74rem", textAlign: "center", px: 2 }}>
                                    Answer all {totalQuestions} questions to unlock the full walkthrough.
                                    {" "}
                                    {solvedQuestions}/{totalQuestions} solved.
                                </Typography>
                            </Box>
                        ))}
                </Box>
            </Box>

            {/* Right — challenge panel */}
            <Box sx={{ position: { lg: "sticky" }, top: 0, minWidth: 0 }}>
                <LabChallengePanel lab={lab} />
            </Box>
        </Box>
    );
}

// ── Small shared pieces ────────────────────────────────────────────────────────

function MetaChip({ icon, label, color }: { icon?: React.ReactNode; label: string; color: string }) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.4,
                border: `1px solid ${color}`,
                borderRadius: "999px",
                px: 1,
                py: 0.25,
                bgcolor: "#101018",
            }}
        >
            {icon}
            <Typography sx={{ color, fontSize: "0.68rem", fontWeight: 600 }}>{label}</Typography>
        </Box>
    );
}

function Section({ heading, accent, children }: { heading: string; accent: string; children: React.ReactNode }) {
    return (
        <Box sx={{ border: `1px solid ${accent}`, borderRadius: "12px", bgcolor: "#101018", p: 1.5 }}>
            <Typography sx={{ color: accent, fontSize: "0.8rem", fontWeight: 700, mb: 0.75 }}>{heading}</Typography>
            {children}
        </Box>
    );
}

function BulletList({ items, color }: { items: string[]; color: string }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6 }}>
            {items.map((item) => (
                <Box key={item} sx={{ display: "flex", alignItems: "flex-start", gap: 0.75 }}>
                    <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: color, mt: "7px", flexShrink: 0 }} />
                    <Typography sx={{ color: "#b4b4c2", fontSize: "0.8rem", lineHeight: 1.6 }}>{item}</Typography>
                </Box>
            ))}
        </Box>
    );
}
