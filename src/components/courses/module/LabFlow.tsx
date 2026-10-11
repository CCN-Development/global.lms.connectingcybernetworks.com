"use client";

import React, { useEffect, useEffectEvent, useState } from "react";
import { Box, ButtonBase, CircularProgress, InputBase, Modal, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { useCourse, type LabAttemptView, type LabBrief, type LabCompleteResult } from "@/contexts/CourseContext";
import { announceRewards, formatClockDuration } from "../course-format";
import { ACTIVITY_ASSETS, COLORS, TYPE } from "../my-courses-theme";
import { BackButton } from "../my-courses-ui";
import {
    ACTIVITY_TYPE,
    ActivityButton,
    ActivityCard,
    ActivityPanel,
    CardDivider,
    CardGlows,
    ContentBlocks,
    GhostButton,
    IconTile,
    StatTiles,
    formatDuration,
} from "./activity-ui";
import ResultCard, { LAB_BADGE } from "./ResultCard";

type Tab = "overview" | "task" | "solution";

const TABS: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "task", label: "Task" },
    { key: "solution", label: "Solutions" },
];

const DEFAULT_INTRO = ["Put your knowledge into practice.", "Complete the hands-on task, solve the challenge, and prove your skills."];

function LabTabs({ value, onChange }: { value: Tab; onChange: (tab: Tab) => void }) {
    return (
        <Box role="tablist" aria-label="Lab details" sx={{ display: "flex", gap: "12px", flexShrink: 0 }}>
            {TABS.map((tab) => {
                const active = tab.key === value;
                return (
                    <ButtonBase
                        key={tab.key}
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(tab.key)}
                        sx={{
                            px: "12px",
                            py: "8px",
                            borderRadius: "99px",
                            border: `1px solid ${active ? COLORS.primary75 : "transparent"}`,
                            backgroundImage: active ? "linear-gradient(180deg, rgba(187,201,237,0.12) 0%, rgba(106,114,135,0.12) 100%)" : "none",
                            "&:hover p": active ? {} : { color: COLORS.neutral100 },
                            "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" },
                        }}
                    >
                        <Typography sx={{ ...ACTIVITY_TYPE.interMed14, color: active ? COLORS.white : COLORS.neutral400, whiteSpace: "nowrap", transition: "color .18s ease" }}>
                            {tab.label}
                        </Typography>
                    </ButtonBase>
                );
            })}
        </Box>
    );
}

/** Blurred stand-in for the hidden solution — the real blocks are only sent once unlocked. */
function SolutionPlaceholder() {
    return (
        <Box aria-hidden sx={{ display: "flex", flexDirection: "column", gap: "16px", userSelect: "none" }}>
            {[92, 70, 84, 40, 76, 88, 60].map((width, i) => (
                <Box key={i} sx={{ height: i % 3 === 0 ? 22 : 14, width: `${width}%`, borderRadius: "6px", bgcolor: "rgba(255,255,255,0.12)" }} />
            ))}
        </Box>
    );
}

/** Frosted cover over the solution until the learner gives up on solving it alone. */
function SolutionLock({ penalty, busy, onReveal }: { penalty: number; busy: boolean; onReveal: () => void }) {
    return (
        <Box
            sx={{
                position: "absolute",
                top: "-11px",
                left: { xs: "-16px", sm: "-24px" },
                right: { xs: "-16px", sm: "-24px" },
                bottom: { xs: "-16px", sm: "-24px" },
                zIndex: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                pt: { xs: "48px", lg: "120px" },
                px: "16px",
                backgroundImage: `url("${ACTIVITY_ASSETS}/locked-scrim.svg")`,
                backgroundSize: "100% 100%",
                backdropFilter: "blur(12px)",
            }}
        >
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "44px", p: "10px", width: 393, maxWidth: "100%" }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                    <IconTile variant="md" icon={`${ACTIVITY_ASSETS}/icon-lock-20.svg`} />
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: 375, maxWidth: "100%", textAlign: "center" }}>
                        <Typography component="h3" sx={{ ...TYPE.headingSemibold28, fontSize: { xs: "22px", sm: "28px" }, color: COLORS.neutral100 }}>
                            Solution Locked
                        </Typography>
                        <Typography sx={{ ...ACTIVITY_TYPE.latoReg16, color: COLORS.neutral200 }}>
                            Give it one more try before revealing the solution.
                            {penalty > 0 ? ` You’ll lose ${penalty} XP if you choose to view it.` : ""}
                        </Typography>
                    </Box>
                </Box>
                <CardDivider src={`${ACTIVITY_ASSETS}/divider-373.svg`} maxWidth={373} />
                <ActivityButton onClick={onReveal} disabled={busy}>
                    {busy ? "Unlocking…" : "Give Up & View Solution"}
                </ActivityButton>
            </Box>
        </Box>
    );
}

function LabDetails({ brief, tab, onTab, unlocking, onUnlock }: { brief: LabBrief; tab: Tab; onTab: (tab: Tab) => void; unlocking: boolean; onUnlock: () => void }) {
    const locked = tab === "solution" && brief.solutionLocked;
    const pad = { xs: "16px", sm: "24px" };
    const negPad = { xs: "-16px", sm: "-24px" };

    return (
        <ActivityCard
            angle="144.39deg"
            radius={24}
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                pt: pad,
                px: pad,
                pb: pad,
                width: { xs: "100%", lg: 480 },
                flexShrink: 0,
                height: { lg: "100%" },
                minHeight: { xs: locked ? 640 : 0, lg: 0 },
            }}
        >
            <Box sx={{ position: "relative" }}>
                <LabTabs value={tab} onChange={onTab} />
            </Box>
            {/* Bleeds to the card edges so the solution lock can cover the full width and scrolling stays inside the frame. */}
            <Box
                sx={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    minHeight: 0,
                    mx: negPad,
                    mb: negPad,
                    px: pad,
                    pb: pad,
                    overflowY: { lg: locked ? "hidden" : "auto" },
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                }}
            >
                {tab === "overview" && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <Typography sx={{ ...ACTIVITY_TYPE.interReg16, color: COLORS.white, whiteSpace: "pre-line" }}>
                            {brief.overview || "Your instructor hasn’t added an overview for this lab yet."}
                        </Typography>
                        {brief.tools.length > 0 && (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <Typography sx={{ ...ACTIVITY_TYPE.latoReg14, color: COLORS.neutral400 }}>TOOLS</Typography>
                                <Box component="ul" sx={{ m: 0, pl: "24px", ...ACTIVITY_TYPE.interReg16, color: COLORS.white }}>
                                    {brief.tools.map((tool) => (
                                        <li key={tool}>{tool}</li>
                                    ))}
                                </Box>
                            </Box>
                        )}
                        {brief.verificationMode === "flag" && brief.totalFlags > 0 && (
                            <Typography sx={{ ...ACTIVITY_TYPE.interReg16, color: COLORS.neutral200 }}>
                                Capture {brief.totalFlags} flag{brief.totalFlags === 1 ? "" : "s"} to complete this lab.
                            </Typography>
                        )}
                    </Box>
                )}
                {tab === "task" &&
                    (brief.taskBlocks.length ? (
                        <ContentBlocks blocks={brief.taskBlocks} />
                    ) : (
                        <Typography sx={{ ...ACTIVITY_TYPE.interReg16, color: COLORS.neutral200 }}>No task steps were added for this lab.</Typography>
                    ))}
                {tab === "solution" &&
                    (brief.solutionLocked ? (
                        <Box sx={{ position: "relative", flex: 1, minHeight: 420 }}>
                            <SolutionPlaceholder />
                            <SolutionLock penalty={brief.solutionPenaltyXp} busy={unlocking} onReveal={onUnlock} />
                        </Box>
                    ) : brief.solutionBlocks?.length ? (
                        <ContentBlocks blocks={brief.solutionBlocks} />
                    ) : (
                        <Typography sx={{ ...ACTIVITY_TYPE.interReg16, color: COLORS.neutral200 }}>No solution was published for this lab.</Typography>
                    ))}
            </Box>
        </ActivityCard>
    );
}

function FlagForm({ attempt, onSubmit }: { attempt: LabAttemptView; onSubmit: (flag: string) => Promise<boolean> }) {
    const [flag, setFlag] = useState("");
    const [busy, setBusy] = useState(false);

    const submit = async () => {
        if (!flag.trim() || busy) return;
        setBusy(true);
        try {
            if (await onSubmit(flag.trim())) setFlag("");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "8px", width: "100%", maxWidth: 420 }}>
            <Typography sx={{ ...TYPE.xsMed12, color: COLORS.neutral400, textAlign: "center" }}>
                FLAGS CAPTURED {attempt.flagsCaptured}/{attempt.totalFlags}
            </Typography>
            <Box
                component="form"
                onSubmit={(e: React.FormEvent) => {
                    e.preventDefault();
                    submit();
                }}
                sx={{ display: "flex", gap: "8px" }}
            >
                <InputBase
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    placeholder="FLAG{…}"
                    inputProps={{ "aria-label": "Flag", spellCheck: false, autoComplete: "off" }}
                    sx={{
                        flex: 1,
                        height: 44,
                        px: "14px",
                        borderRadius: "10px",
                        border: `1px solid ${COLORS.tileBorder}`,
                        bgcolor: "rgba(0,0,0,0.4)",
                        color: COLORS.white,
                        fontFamily: "monospace",
                        fontSize: 14,
                    }}
                />
                <ActivityButton onClick={submit} width={120} disabled={!flag.trim() || busy}>
                    {busy ? "Checking…" : "Submit Flag"}
                </ActivityButton>
            </Box>
        </Box>
    );
}

function LabChallengeCard({
    brief,
    attempt,
    busy,
    onLaunch,
    onFinish,
    onStop,
    onLater,
    onFlag,
}: {
    brief: LabBrief;
    attempt: LabAttemptView | null;
    busy: boolean;
    onLaunch: () => void;
    onFinish: () => void;
    onStop: () => void;
    onLater: () => void;
    onFlag: (flag: string) => Promise<boolean>;
}) {
    const running = attempt?.attemptStatus === "running";
    const needsFlags = brief.verificationMode === "flag" && brief.totalFlags > 0;
    const flagsDone = !needsFlags || (attempt ? attempt.flagsCaptured >= attempt.totalFlags : false);
    const expiresAt = running && attempt?.expiresAt ? new Date(attempt.expiresAt) : null;

    return (
        <ActivityCard
            angle="160.67deg"
            sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "32px", px: { xs: "16px", sm: "24px" }, py: "32px" }}
        >
            <CardGlows
                left={`${ACTIVITY_ASSETS}/lab-glow-left.svg`}
                right={`${ACTIVITY_ASSETS}/lab-glow-right.svg`}
                leftAt={{ left: -557, top: -31 }}
                rightAt={{ left: 372, top: -256 }}
            />
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%", textAlign: "center" }}>
                <IconTile variant="lg" icon={`${ACTIVITY_ASSETS}/icon-flask-35.svg`} />
                <Typography component="h2" sx={{ ...TYPE.headingSemibold28, fontSize: { xs: "22px", sm: "28px" }, color: COLORS.neutral100 }}>
                    {brief.title || brief.lessonTitle}
                </Typography>
                <Box>
                    {(brief.introLines.length ? brief.introLines : DEFAULT_INTRO).map((line, i) => (
                        <Typography key={i} sx={{ ...ACTIVITY_TYPE.latoReg16, color: COLORS.neutral200 }}>
                            {line}
                        </Typography>
                    ))}
                </Box>
                {brief.completed && !running && (
                    <Typography sx={{ ...TYPE.smallMed14, color: COLORS.lessonDone }}>
                        Completed · {brief.xpEarned} XP earned. You can run the lab again to practise.
                    </Typography>
                )}
            </Box>
            <StatTiles
                caption={running ? "LAB IS READY" : "BEFORE YOU START"}
                tiles={[
                    { value: String(brief.taskCount), label: "Tasks" },
                    { value: brief.durationSec ? formatClockDuration(brief.durationSec) : "Self-paced", label: "Time" },
                    { value: `+${brief.xpIfCompleted}`, label: "Points" },
                ]}
            />
            {!brief.solutionLocked && brief.solutionPenaltyXp > 0 && (
                <Typography sx={{ position: "relative", ...TYPE.xsMed12, color: COLORS.neutral300, mt: "-16px" }}>
                    Solution viewed: −{brief.solutionPenaltyXp} XP applied to this lab.
                </Typography>
            )}
            {running && needsFlags && attempt && <FlagForm attempt={attempt} onSubmit={onFlag} />}
            <CardDivider src={`${ACTIVITY_ASSETS}/divider-528.svg`} maxWidth={528} />
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: 220, maxWidth: "100%" }}>
                <ActivityButton onClick={running ? onFinish : onLaunch} width="100%" disabled={busy || (running && !flagsDone)}>
                    {busy ? "Please wait…" : running ? "Complete Lab" : brief.completed ? "Relaunch Lab" : "Launch Lab"}
                </ActivityButton>
                {running && !flagsDone && (
                    <Typography sx={{ ...TYPE.xsMed12, color: COLORS.neutral300, textAlign: "center" }}>Capture every flag to complete the lab.</Typography>
                )}
                {running && attempt?.launchUrl && (
                    <GhostButton onClick={() => window.open(attempt.launchUrl!, "_blank", "noopener,noreferrer")}>Open Lab Environment</GhostButton>
                )}
                {expiresAt && (
                    <Typography sx={{ ...TYPE.xsMed12, color: COLORS.neutral300, textAlign: "center" }}>
                        Session ends at {expiresAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Typography>
                )}
                {running && <GhostButton onClick={onStop}>Stop Lab</GhostButton>}
                <GhostButton onClick={onLater}>I will do this later</GhostButton>
            </Box>
        </ActivityCard>
    );
}

/** Full-screen "lab is still being built" countdown; mounted per launch so the clock always starts fresh. */
function LabBuilding({ seconds, onCancel, onReady }: { seconds: number; onCancel: () => void; onReady: () => void }) {
    const [left, setLeft] = useState(seconds);
    const ready = useEffectEvent(onReady);

    useEffect(() => {
        const deadline = Date.now() + seconds * 1000;
        const id = window.setInterval(() => {
            const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
            setLeft(remaining);
            if (remaining === 0) {
                window.clearInterval(id);
                ready();
            }
        }, 250);
        return () => window.clearInterval(id);
    }, [seconds]);

    const mm = String(Math.floor(left / 60)).padStart(2, "0");
    const ss = String(left % 60).padStart(2, "0");

    return (
        <Modal open onClose={onCancel} hideBackdrop aria-labelledby="lab-building-title">
            <Box
                className="student-dashboard"
                sx={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", gap: "24px", p: { xs: "16px", md: "24px" }, bgcolor: "#000", color: COLORS.white, outline: "none" }}
            >
                <Box sx={{ display: "flex" }}>
                    <BackButton label="Cancel lab launch" onClick={onCancel} />
                </Box>
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "24px", textAlign: "center", pb: "68px" }}>
                    <IconTile variant="xxl" icon={`${ACTIVITY_ASSETS}/icon-flask-60.svg`} />
                    <Typography id="lab-building-title" sx={{ ...ACTIVITY_TYPE.poppinsReg28, fontSize: { xs: "20px", sm: "28px" }, color: COLORS.neutral100 }}>
                        Please wait, the lab is still being built...
                    </Typography>
                    <Typography role="timer" aria-live="off" sx={{ ...ACTIVITY_TYPE.poppinsSemibold44, color: COLORS.white, fontVariantNumeric: "tabular-nums" }}>
                        {mm}:{ss}
                    </Typography>
                </Box>
            </Box>
        </Modal>
    );
}

/**
 * Lab overlay backed by the lab API: brief (Overview / Task / Solutions) → environment provisioning →
 * running session (environment link, flags) → graded result pointing at the next level.
 */
export default function LabFlow({
    open,
    lessonId,
    onClose,
    onContinueToLevel,
    onCourseMap,
}: {
    open: boolean;
    lessonId: string;
    onClose: () => void;
    onContinueToLevel: (levelNo: number) => void;
    onCourseMap: () => void;
}) {
    const { labBrief, labAttempt, getLabBrief, unlockLabSolution, launchLab, getLabAttempt, submitLabFlag, completeLab, abandonLab } = useCourse();
    const [tab, setTab] = useState<Tab>("overview");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [unlocking, setUnlocking] = useState(false);
    const [building, setBuilding] = useState<{ attemptId: string; seconds: number; run: number } | null>(null);
    const [result, setResult] = useState<LabCompleteResult | null>(null);

    const brief = labBrief?.lessonId === lessonId ? labBrief : null;
    const attempt = brief && labAttempt && ["provisioning", "running"].includes(labAttempt.attemptStatus) ? labAttempt : null;

    useEffect(() => {
        let cancelled = false;
        getLabBrief(lessonId).then((res) => {
            if (cancelled) return;
            if (!res.success || !res.data) {
                setError(res.message ?? "Failed to load the lab");
                return;
            }
            // Resume an environment that is still being built.
            const active = res.data.activeAttempt;
            if (active?.attemptStatus === "provisioning") setBuilding({ attemptId: active.attemptId, seconds: active.secondsUntilReady, run: 0 });
        });
        return () => {
            cancelled = true;
        };
    }, [lessonId, getLabBrief]);

    const unlock = async () => {
        setUnlocking(true);
        try {
            const res = await unlockLabSolution(lessonId);
            if (!res.success || !res.data) toast.error(res.message ?? "Failed to unlock the solution");
            else if (res.data.solutionPenaltyXp > 0) toast(`Solution unlocked — this lab now awards ${res.data.xpIfCompleted} XP`);
        } finally {
            setUnlocking(false);
        }
    };

    const launch = async () => {
        setBusy(true);
        try {
            const res = await launchLab(lessonId);
            if (!res.success || !res.data) {
                toast.error(res.message ?? "Failed to launch the lab");
                return;
            }
            if (res.data.attemptStatus === "provisioning") setBuilding({ attemptId: res.data.attemptId, seconds: res.data.secondsUntilReady, run: 0 });
        } finally {
            setBusy(false);
        }
    };

    /** Countdown finished: ask the server to promote the attempt to running (retry briefly on clock skew). */
    const ready = async () => {
        if (!building) return;
        const res = await getLabAttempt(building.attemptId);
        if (!res.success || !res.data) {
            toast.error(res.message ?? "Failed to start the lab");
            setBuilding(null);
            return;
        }
        if (res.data.attemptStatus === "provisioning") {
            setBuilding({ attemptId: res.data.attemptId, seconds: Math.max(2, res.data.secondsUntilReady), run: building.run + 1 });
            return;
        }
        setBuilding(null);
        if (res.data.attemptStatus === "running") toast.success("Your lab is ready");
        else toast.error("The lab session ended before it was ready. Launch it again.");
    };

    const cancelBuild = async () => {
        if (!building) return;
        const id = building.attemptId;
        setBuilding(null);
        await abandonLab(id);
    };

    const stop = async () => {
        if (!attempt) return;
        setBusy(true);
        try {
            const res = await abandonLab(attempt.attemptId);
            if (!res.success) toast.error(res.message ?? "Failed to stop the lab");
            else toast("Lab stopped. You can launch it again anytime.");
        } finally {
            setBusy(false);
        }
    };

    const flag = async (value: string): Promise<boolean> => {
        if (!attempt) return false;
        const res = await submitLabFlag(attempt.attemptId, value);
        if (!res.success || !res.data) {
            toast.error(res.message ?? "Failed to submit the flag");
            return false;
        }
        if (res.data.correct) toast.success(`Flag captured${res.data.flagLabel ? `: ${res.data.flagLabel}` : ""} (${res.data.flagsCaptured}/${res.data.totalFlags})`);
        else toast.error("That flag isn't correct. Keep digging!");
        return res.data.correct;
    };

    const finish = async () => {
        if (!attempt) return;
        setBusy(true);
        try {
            const res = await completeLab(attempt.attemptId);
            if (!res.success || !res.data) {
                toast.error(res.message ?? "Failed to complete the lab");
                // Expired / stopped sessions: refresh so the brief shows "Launch Lab" again.
                await getLabBrief(lessonId);
                return;
            }
            setResult(res.data);
            announceRewards(res.data.rewards, res.data.xpAwarded);
        } finally {
            setBusy(false);
        }
    };

    if (result) {
        const nextLevel = result.nextLevel;
        return (
            <ActivityPanel open={open} onClose={onClose} ariaLabel="Lab result">
                <ResultCard
                    badge={LAB_BADGE}
                    title="Lab Completed"
                    subtitle={result.solutionUsed ? "Nice work finishing the lab! Try the next one without the solution for full XP." : "Excellent work! You’ve successfully completed the lab."}
                    tiles={[
                        { value: formatDuration((result.timeTakenSec ?? 0) * 1000), label: "Time Taken" },
                        { value: `${Math.round(result.accuracyPct ?? 100)}%`, label: "Accuracy" },
                        { value: `+${result.xpAwarded}`, label: "XP Earned" },
                    ]}
                    leftGlow={`${ACTIVITY_ASSETS}/lab-result-glow-left.svg`}
                    primary={
                        nextLevel
                            ? { label: `Continue to Level ${nextLevel.levelNo}`, onClick: () => onContinueToLevel(nextLevel.levelNo) }
                            : { label: "Back to Module", onClick: onClose }
                    }
                    secondary={{ label: "Go back to Course Mapping", onClick: onCourseMap }}
                />
            </ActivityPanel>
        );
    }

    return (
        <ActivityPanel open={open} onClose={onClose} ariaLabel={brief?.title ?? "Lab"}>
            {!brief ? (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", minHeight: 320, textAlign: "center" }}>
                    {error ? (
                        <>
                            <Typography sx={{ ...TYPE.mediumMed16, color: COLORS.neutral100 }}>{error}</Typography>
                            <GhostButton onClick={onClose}>Back to module</GhostButton>
                        </>
                    ) : (
                        <CircularProgress size={32} sx={{ color: COLORS.purple }} />
                    )}
                </Box>
            ) : (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column-reverse", lg: "row" },
                        alignItems: { xs: "stretch", lg: "flex-start" },
                        gap: "24px",
                        pt: "24px",
                        height: { lg: "100%" },
                    }}
                >
                    <LabDetails brief={brief} tab={tab} onTab={setTab} unlocking={unlocking} onUnlock={unlock} />
                    <LabChallengeCard
                        brief={brief}
                        attempt={attempt}
                        busy={busy || Boolean(building)}
                        onLaunch={launch}
                        onFinish={finish}
                        onStop={stop}
                        onLater={onClose}
                        onFlag={flag}
                    />
                </Box>
            )}
            {building && <LabBuilding key={`${building.attemptId}-${building.run}`} seconds={building.seconds} onCancel={cancelBuild} onReady={ready} />}
        </ActivityPanel>
    );
}
