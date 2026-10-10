"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import {
    AccentPanel, BatchCardShell, ButtonRow, DateTimeMeta, FONT_INTER, FONT_LATO,
    GradientButton, OutlineButton, Stat, STAT_VALUE_SX, StatGrid, StatusPill, TIMELINE_LINE_GRADIENT, TrainersStat,
} from "@/components/batches/batch-card-ui";

// ── Types ─────────────────────────────────────────────────────────────────────

export type Trainer = { name: string; avatar?: string };

export interface NextSessionInfo {
    /** Section heading, e.g. "Today's Class" or "Next Session" */
    label: string;
    title: string;
    timing: string;
}

export interface OngoingBatchCardProps {
    variant: "ongoing";
    title: string;
    batchProgress: number;
    attendance: number;
    mode: "Online" | "Offline" | "Hybrid";
    trainers?: Trainer[];
    nextSession?: NextSessionInfo | null;
    hasJoinClass?: boolean;
    onViewDetails?: () => void;
    onJoinClass?: () => void;
}

export interface UpcomingBatchCardProps {
    variant: "upcoming";
    title: string;
    mode: "Online" | "Offline" | "Hybrid";
    trainers?: Trainer[];
    requestedOn: string;
    batchStartDate: string;
    requestStatus: "Pending" | "Approved" | "Rejected";
    onCancelRequest?: () => void;
    onViewRequest?: () => void;
}

export interface CompletedBatchCardProps {
    variant: "completed";
    title: string;
    mode: "Online" | "Offline" | "Hybrid";
    trainers?: Trainer[];
    batchCompletedOn: string;
    attendance: number;
    onViewDetails?: () => void;
}

export interface RejectedBatchCardProps {
    variant: "rejected";
    title: string;
    /** When the RM's feedback (rejection) was added, e.g. "12 April, 2026" */
    feedbackDate: string;
    /** e.g. "2:30 PM" */
    feedbackTime: string;
    onViewFeedback?: () => void;
}

export interface MissedBatchCardProps {
    variant: "missed";
    title: string;
    mode: "Online" | "Offline" | "Hybrid";
    /** e.g. "14 Feb – 16 Apr" */
    batchDuration: string;
    attendedSessions: number;
    totalSessions: number;
    /** e.g. "Never joined · seat released 18 Feb" */
    note: string;
    onViewAttendance?: () => void;
    onRejoin?: () => void;
}

export type ExploreCardStatus = "available" | "pending" | "enrolled" | "rejected";

export interface ExploreBatchCardProps {
    variant: "explore";
    title: string;
    mode: "Online" | "Offline" | "Hybrid";
    trainers?: Trainer[];
    startMonth: string;
    startDay: number | string;
    endMonth: string;
    endDay: number | string;
    duration: string;
    batchTime: string;
    batchDays: string;
    seatsLeft: number;
    /** The student's relationship to this batch */
    status: ExploreCardStatus;
    /** e.g. "Requested 12 Sept · awaiting approval" — shown for non-available states */
    statusNote?: string;
    onViewDetails?: () => void;
    onRequestSeat?: () => void;
    onAskAboutBatch?: () => void;
    onWithdraw?: () => void;
    onViewInMyBatches?: () => void;
    onRequestHistory?: () => void;
    onReasonForRejection?: () => void;
}
export type BatchCardProps =
    | OngoingBatchCardProps
    | UpcomingBatchCardProps
    | CompletedBatchCardProps
    | RejectedBatchCardProps
    | MissedBatchCardProps
    | ExploreBatchCardProps;

// ── Ongoing Card (Figma: Batches - Ongoing) ──────────────────────────────────

const TOPIC_LABEL_SX = {
    fontFamily: FONT_INTER,
    fontSize: "12px",
    lineHeight: "18px",
    letterSpacing: "0.6px",
    color: "#8c8c8c",
    textTransform: "uppercase" as const,
};

const TOPIC_TEXT_SX = {
    fontFamily: FONT_INTER,
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "21px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
};

const OngoingCard = ({
    title, batchProgress, attendance, mode, trainers = [],
    nextSession, hasJoinClass, onViewDetails, onJoinClass,
}: OngoingBatchCardProps) => (
    <BatchCardShell title={title}>
        <StatGrid>
            <Stat label="Batch Progress" value={`${batchProgress}% Completed`} />
            <Stat label="Your Attendance" value={`${attendance}%`} />
            <Stat label="Mode" value={mode} />
            <TrainersStat trainers={trainers} />
        </StatGrid>
        <AccentPanel>
            <Typography sx={TOPIC_LABEL_SX}>{nextSession?.label ?? "Next Topic"}</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                <Typography sx={{ ...TOPIC_TEXT_SX, color: nextSession ? "#f2f2f2" : "#8c8c8c" }}>
                    {nextSession?.title ?? "No session scheduled"}
                </Typography>
                {nextSession && (
                    <Typography sx={{ ...TOPIC_TEXT_SX, color: "#bfbfbf" }}>{nextSession.timing}</Typography>
                )}
            </Box>
        </AccentPanel>
        <ButtonRow>
            <OutlineButton onClick={onViewDetails}>View Details</OutlineButton>
            {hasJoinClass && <GradientButton onClick={onJoinClass}>Join Class</GradientButton>}
        </ButtonRow>
    </BatchCardShell>
);

// ── Upcoming Card (Figma: Batches - Upcoming) ────────────────────────────────

const UpcomingCard = ({
    title, mode, requestedOn, batchStartDate,
    requestStatus, onCancelRequest, onViewRequest,
}: UpcomingBatchCardProps) => (
    <BatchCardShell title={title}>
        <StatGrid>
            <Stat label="Requested On" value={requestedOn} />
            <Stat label="Batch Start Date" value={batchStartDate} />
            <Stat label="Mode" value={mode} />
            <Stat label="Status"><StatusPill status={requestStatus} /></Stat>
        </StatGrid>
        <ButtonRow>
            <OutlineButton onClick={onCancelRequest}>Cancel Request</OutlineButton>
            <GradientButton onClick={onViewRequest}>View Request</GradientButton>
        </ButtonRow>
    </BatchCardShell>
);

// ── Completed Card (Figma: Batches - Completed) ──────────────────────────────

const CompletedCard = ({
    title, mode, trainers = [], batchCompletedOn, attendance, onViewDetails,
}: CompletedBatchCardProps) => (
    <BatchCardShell title={title}>
        <StatGrid>
            <Stat label="Batch Completed on" value={batchCompletedOn} />
            <Stat label="Your Attendance" value={`${attendance}%`} />
            <Stat label="Mode" value={mode} />
            <TrainersStat trainers={trainers} />
        </StatGrid>
        <ButtonRow>
            <OutlineButton onClick={onViewDetails}>View Details</OutlineButton>
        </ButtonRow>
    </BatchCardShell>
);

// ── Rejected Card (Figma: Batches - Rejected) ────────────────────────────────

const RejectedCard = ({ title, feedbackDate, feedbackTime, onViewFeedback }: RejectedBatchCardProps) => (
    <BatchCardShell title={title}>
        <AccentPanel bg="rgba(38,38,38,0.44)">
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "stretch", pt: "3px", flexShrink: 0 }}>
                    <Box component="img" src="/batches/timeline-dot-sm.svg" alt="" aria-hidden sx={{ width: 16, height: 16, display: "block" }} />
                    <Box sx={{ flex: 1, width: "1px", minHeight: "1px", backgroundImage: TIMELINE_LINE_GRADIENT }} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                    <Typography sx={{ fontFamily: FONT_LATO, fontWeight: 500, fontSize: "14px", lineHeight: "21px", color: "#fff" }}>
                        Feedback Added
                    </Typography>
                    <DateTimeMeta date={feedbackDate} time={feedbackTime} />
                </Box>
            </Box>
        </AccentPanel>
        <ButtonRow>
            <OutlineButton onClick={onViewFeedback}>View Feedback</OutlineButton>
        </ButtonRow>
    </BatchCardShell>
);

// ── Missed Card (Figma: Batches - Missed) ────────────────────────────────────

const MissedCard = ({
    title, mode, batchDuration, attendedSessions, totalSessions, note, onViewAttendance, onRejoin,
}: MissedBatchCardProps) => {
    const percent = totalSessions > 0 ? Math.min(100, (attendedSessions / totalSessions) * 100) : 0;
    return (
        <BatchCardShell title={title} gap={16}>
            <StatGrid columnGap={16}>
                <Stat label="Batch Duration" value={batchDuration} />
                <Stat label="Mode" value={mode} />
            </StatGrid>
            <Box sx={{ bgcolor: "rgba(38,38,38,0.32)", borderRadius: "12px", pt: "8px", pb: "12px", px: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                    {["Attendance", `${attendedSessions}/${totalSessions} Session`].map((text) => (
                        <Typography key={text} sx={{ fontFamily: FONT_LATO, fontWeight: 500, fontSize: "14px", lineHeight: "21px", color: "#bfbfbf", whiteSpace: "nowrap" }}>
                            {text}
                        </Typography>
                    ))}
                </Box>
                <Box
                    role="progressbar"
                    aria-valuenow={attendedSessions}
                    aria-valuemin={0}
                    aria-valuemax={totalSessions}
                    sx={{
                        p: 0,
                        borderRadius: "32px",
                        border: "1px solid rgba(255,255,255,0.32)",
                        bgcolor: "rgba(255,255,255,0.02)",
                        backdropFilter: "blur(4px)",
                        overflow: "hidden",
                        display: "flex",
                    }}
                >
                    <Box
                        sx={{
                            height: 8,
                            minWidth: 9,
                            width: `${percent}%`,
                            borderRadius: "16px",
                            backgroundImage: "linear-gradient(100deg, #2EC4B6 4.5%, #1B4C33 104.18%)",
                        }}
                    />
                </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                <Box component="img" src="/batches/icon-x-muted.svg" alt="" aria-hidden sx={{ width: 16, height: 16, flexShrink: 0 }} />
                <Typography sx={{ fontFamily: FONT_INTER, fontSize: "12px", lineHeight: "18px", color: "#8c8c8c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {note}
                </Typography>
            </Box>
            <ButtonRow py={0}>
                <OutlineButton onClick={onViewAttendance}>View attendance</OutlineButton>
                <GradientButton onClick={onRejoin}>Rejoin next Batch</GradientButton>
            </ButtonRow>
        </BatchCardShell>
    );
};
// ── Explore Card (Figma: Explore Batches) ────────────────────────────────────

const EXPLORE_BADGE: Record<Exclude<ExploreCardStatus, "available">, { label: string; bg: string; color: string }> = {
    pending: { label: "Pending", bg: "#ffefdc", color: "#fb8600" },
    enrolled: { label: "Enrolled", bg: "#bbedbb", color: "#195c19" },
    rejected: { label: "Rejected", bg: "#f6d4d8", color: "#9d1f2e" },
};

const EXPLORE_NOTE: Record<Exclude<ExploreCardStatus, "available">, { icon: string; color: string }> = {
    pending: { icon: "/batches/explore/icon-clock.svg", color: "#fb8600" },
    enrolled: { icon: "/batches/explore/icon-check-circle.svg", color: "#42cc42" },
    rejected: { icon: "/batches/explore/icon-x-circle-red.svg", color: "#d1293d" },
};

const SMALL_TEXT_SX = { fontFamily: FONT_INTER, fontSize: "12px", lineHeight: "18px", whiteSpace: "nowrap" as const };

const DateTile = ({ label, month, day }: { label: string; month: string; day: number | string }) => (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flexShrink: 0 }}>
        <Typography sx={{ ...SMALL_TEXT_SX, color: "#d9d9d9" }}>{label}</Typography>
        <Box sx={{ width: 52, borderRadius: "8px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Box sx={{ px: "4px", py: "2px", display: "flex", justifyContent: "center", backgroundImage: "linear-gradient(137.93deg, #8C24FF 9.0161%, #0E1934 89.867%)" }}>
                <Typography sx={{ ...SMALL_TEXT_SX, color: "#d9d9d9", textTransform: "uppercase" }}>{month}</Typography>
            </Box>
            <Box sx={{ px: "8px", py: "2px", bgcolor: "#bfbfbf", textAlign: "center" }}>
                <Typography sx={{ fontFamily: FONT_LATO, fontWeight: 700, fontSize: "14px", lineHeight: "21px", color: "#0d0d0d" }}>{day}</Typography>
            </Box>
        </Box>
    </Box>
);

const CardLink = ({ children, onClick, color = "#d9d9d9" }: { children: React.ReactNode; onClick?: () => void; color?: string }) => (
    <Typography
        component="button"
        type="button"
        onClick={onClick}
        sx={{
            ...SMALL_TEXT_SX,
            color,
            alignSelf: "center",
            background: "none",
            border: "none",
            p: 0,
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlinePosition: "from-font",
            "&:hover": { color: "#fff" },
        }}
    >
        {children}
    </Typography>
);

const ExploreCard = ({
    title, mode, trainers = [], startMonth, startDay, endMonth, endDay, duration, batchTime, batchDays,
    seatsLeft, status, statusNote, onViewDetails, onRequestSeat, onAskAboutBatch, onWithdraw,
    onViewInMyBatches, onRequestHistory, onReasonForRejection,
}: ExploreBatchCardProps) => {
    const badge = status === "available" ? null : EXPLORE_BADGE[status];
    const note = status === "available" ? null : EXPLORE_NOTE[status];
    return (
        <BatchCardShell
            title={title}
            badge={badge && (
                <Box component="span" sx={{ flexShrink: 0, px: "8px", py: "2px", borderRadius: "99px", bgcolor: badge.bg, color: badge.color, fontFamily: FONT_LATO, fontWeight: 500, fontSize: "12px", lineHeight: "18px" }}>
                    {badge.label}
                </Box>
            )}
        >
            {/* Schedule */}
            <Box sx={{ border: "1px dashed #262626", borderRadius: "18px", p: "15px", display: "flex", flexDirection: "column", gap: status === "pending" || status === "enrolled" ? "24px" : "32px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <DateTile label="Starts at" month={startMonth} day={startDay} />
                    <Box sx={{ flex: 1, minWidth: 0, alignSelf: "stretch", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", pb: "2px" }}>
                        <Typography sx={{ ...SMALL_TEXT_SX, color: "#d9d9d9" }}>Duration: {duration}</Typography>
                        <Box sx={{ position: "relative", width: "100%", height: 0 }}>
                            <Box component="img" src="/batches/explore/duration-line.svg" alt="" aria-hidden sx={{ position: "absolute", left: "-0.3%", top: "-2.67px", width: "100.6%", height: "5.333px", maxWidth: "none", display: "block" }} />
                        </Box>
                    </Box>
                    <DateTile label="Ends at" month={endMonth} day={endDay} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "24px" }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}><Stat label="Batch Time" value={batchTime} /></Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}><Stat label="Batch Days" value={batchDays} /></Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "24px" }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stat label="Mode">
                                <Box sx={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                                    <Typography sx={STAT_VALUE_SX}>{mode}</Typography>
                                    {status === "available" && (
                                        <Box component="span" sx={{ flexShrink: 0, px: "8px", py: "2px", borderRadius: "99px", bgcolor: "#ffefdc", color: "#fb8600", ...SMALL_TEXT_SX }}>
                                            {seatsLeft} seats left
                                        </Box>
                                    )}
                                </Box>
                            </Stat>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}><TrainersStat trainers={trainers} /></Box>
                    </Box>
                </Box>
            </Box>

            {status === "available" ? (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <Box sx={{ width: "100%" }}>
                        <ButtonRow>
                            <OutlineButton onClick={onViewDetails}>View Details</OutlineButton>
                            <GradientButton onClick={onRequestSeat}>Request Seat</GradientButton>
                        </ButtonRow>
                    </Box>
                    <CardLink onClick={onAskAboutBatch}>Ask about this batch</CardLink>
                </Box>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {note && statusNote && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                            <Box component="img" src={note.icon} alt="" aria-hidden sx={{ width: 16, height: 16, flexShrink: 0 }} />
                            <Typography sx={{ ...SMALL_TEXT_SX, color: note.color, overflow: "hidden", textOverflow: "ellipsis" }}>{statusNote}</Typography>
                        </Box>
                    )}
                    <ButtonRow py={0}>
                        {status === "pending" && (
                            <>
                                <OutlineButton borderless onClick={onWithdraw}>Withdraw</OutlineButton>
                                <OutlineButton width={169} onClick={onViewInMyBatches}>View In my Batches</OutlineButton>
                            </>
                        )}
                        {status === "enrolled" && <OutlineButton onClick={onViewInMyBatches}>View In my Batches</OutlineButton>}
                        {status === "rejected" && (
                            <>
                                <OutlineButton onClick={onRequestHistory}>Request History</OutlineButton>
                                <GradientButton onClick={onRequestSeat}>Request Again</GradientButton>
                            </>
                        )}
                    </ButtonRow>
                    <CardLink color="#bfbfbf" onClick={onAskAboutBatch}>Ask about this batch</CardLink>
                </Box>
            )}

            {status === "rejected" && <CardLink onClick={onReasonForRejection}>Reason for Rejection</CardLink>}
        </BatchCardShell>
    );
};
// ── Main export ───────────────────────────────────────────────────────────────

export default function BatchCard(props: BatchCardProps) {
    switch (props.variant) {
        case "ongoing": return <OngoingCard   {...props} />;
        case "upcoming": return <UpcomingCard  {...props} />;
        case "completed": return <CompletedCard {...props} />;
        case "rejected": return <RejectedCard  {...props} />;
        case "missed": return <MissedCard    {...props} />;
        case "explore": return <ExploreCard   {...props} />;
    }
}
