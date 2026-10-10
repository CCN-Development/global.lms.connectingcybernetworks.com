"use client";

import React, { useEffect, useEffectEvent, useState } from "react";
import { Box, ButtonBase, Modal, Typography } from "@mui/material";
import { COLORS, TYPE } from "../my-courses-theme";
import { BackButton } from "../my-courses-ui";
import {
    ACTIVITY_TYPE,
    ActivityButton,
    ActivityCard,
    ActivityPanel,
    CardDivider,
    CardGlows,
    ContentBlockView,
    ContentBlocks,
    GhostButton,
    IconTile,
    StatTiles,
    formatDuration,
} from "./activity-ui";
import ResultCard, { LAB_BADGE } from "./ResultCard";
import { ACTIVITY_ASSETS, type Lab } from "./module-data";

type Tab = "overview" | "task" | "solution";
type Stage = "brief" | "building" | "running" | "result";

const TABS: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "task", label: "Task" },
    { key: "solution", label: "Solutions" },
];

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

/** Frosted cover over the solution until the learner gives up on solving it alone. */
function SolutionLock({ onReveal }: { onReveal: () => void }) {
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
                pt: { xs: "48px", lg: "162px" },
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
                            Give it one more try before revealing the solution. You’ll lose points if you choose to view it.
                        </Typography>
                    </Box>
                </Box>
                <CardDivider src={`${ACTIVITY_ASSETS}/divider-373.svg`} maxWidth={373} />
                <ActivityButton onClick={onReveal}>Give Up &amp; View Solution</ActivityButton>
            </Box>
        </Box>
    );
}

function LabDetails({ lab, tab, onTab, unlocked, onUnlock }: { lab: Lab; tab: Tab; onTab: (tab: Tab) => void; unlocked: boolean; onUnlock: () => void }) {
    const locked = tab === "solution" && !unlocked;
    const [firstStep, ...rest] = lab.solution;
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
                {tab === "overview" && <Typography sx={{ ...ACTIVITY_TYPE.interReg16, color: COLORS.white }}>{lab.overview}</Typography>}
                {tab === "task" && <ContentBlocks blocks={lab.task} />}
                {tab === "solution" &&
                    (unlocked || !firstStep ? (
                        <ContentBlocks blocks={lab.solution} />
                    ) : (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", flex: 1 }}>
                            <ContentBlockView block={firstStep} />
                            <Box sx={{ position: "relative", flex: 1 }}>
                                <Box aria-hidden sx={{ userSelect: "none" }}>
                                    <ContentBlocks blocks={rest} />
                                </Box>
                                <SolutionLock onReveal={onUnlock} />
                            </Box>
                        </Box>
                    ))}
            </Box>
        </ActivityCard>
    );
}

function LabChallengeCard({ lab, running, onLaunch, onFinish, onLater }: { lab: Lab; running: boolean; onLaunch: () => void; onFinish: () => void; onLater: () => void }) {
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
                    {lab.title}
                </Typography>
                <Box>
                    {lab.intro.map((line) => (
                        <Typography key={line} sx={{ ...ACTIVITY_TYPE.latoReg16, color: COLORS.neutral200 }}>
                            {line}
                        </Typography>
                    ))}
                </Box>
            </Box>
            <StatTiles
                caption={running ? "LAB IS READY" : "BEFORE YOU START"}
                tiles={[
                    { value: String(lab.tasks), label: "Tasks" },
                    { value: lab.duration, label: "Time" },
                    { value: `+${lab.points}`, label: "Points" },
                ]}
            />
            <CardDivider src={`${ACTIVITY_ASSETS}/divider-528.svg`} maxWidth={528} />
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: 200, maxWidth: "100%" }}>
                <ActivityButton onClick={running ? onFinish : onLaunch} width="100%">
                    {running ? "Complete Lab" : "Launch Lab"}
                </ActivityButton>
                {running && lab.url && <GhostButton onClick={() => window.open(lab.url, "_blank", "noopener,noreferrer")}>Open Lab Environment</GhostButton>}
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

/** Lab overlay: brief with Overview / Task / Solutions → environment build → run → result. */
export default function LabFlow({
    open,
    lab,
    nextLevelNo,
    onClose,
    onComplete,
    onContinue,
    onCourseMap,
}: {
    open: boolean;
    lab: Lab;
    nextLevelNo: number;
    onClose: () => void;
    onComplete: (xp: number) => void;
    onContinue: () => void;
    onCourseMap: () => void;
}) {
    const [tab, setTab] = useState<Tab>("overview");
    const [unlocked, setUnlocked] = useState(false);
    const [stage, setStage] = useState<Stage>("brief");
    const [startedAt, setStartedAt] = useState(0);
    const [elapsed, setElapsed] = useState(0);

    const xp = Math.max(0, lab.points - (unlocked ? lab.solutionPenalty : 0));
    const accuracy = Math.round((xp / lab.points) * 100);

    const ready = () => {
        setStartedAt(Date.now());
        setStage("running");
    };

    const finish = () => {
        setElapsed(Date.now() - startedAt);
        setStage("result");
        onComplete(xp);
    };

    if (stage === "result") {
        return (
            <ActivityPanel open={open} onClose={onClose} ariaLabel="Lab result">
                <ResultCard
                    badge={LAB_BADGE}
                    title="Lab Completed"
                    subtitle="Excellent work! You’ve successfully completed the lab."
                    tiles={[
                        { value: formatDuration(elapsed), label: "Time Taken" },
                        { value: `${accuracy}%`, label: "Accuracy" },
                        { value: `+${xp}`, label: "XP Earned" },
                    ]}
                    leftGlow={`${ACTIVITY_ASSETS}/lab-result-glow-left.svg`}
                    primary={{ label: `Continue to Level ${nextLevelNo}`, onClick: onContinue }}
                    secondary={{ label: "Go back to Course Mapping", onClick: onCourseMap }}
                />
            </ActivityPanel>
        );
    }

    return (
        <ActivityPanel open={open} onClose={onClose} ariaLabel={lab.title}>
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
                <LabDetails lab={lab} tab={tab} onTab={setTab} unlocked={unlocked} onUnlock={() => setUnlocked(true)} />
                <LabChallengeCard lab={lab} running={stage === "running"} onLaunch={() => setStage("building")} onFinish={finish} onLater={onClose} />
            </Box>
            {stage === "building" && <LabBuilding seconds={lab.buildSeconds} onCancel={() => setStage("brief")} onReady={ready} />}
        </ActivityPanel>
    );
}
