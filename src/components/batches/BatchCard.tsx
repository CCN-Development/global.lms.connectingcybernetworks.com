"use client";
import React, { useState } from "react";
import { Box, Typography, Avatar, AvatarGroup, Chip, Button } from "@mui/material";
import CCNButton from "@/components/buttons/CCNButton";
import RequestSeatModal from "@/components/batches/RequestSeatModal";
import AskAboutBatchModal from "@/components/batches/AskAboutBatchModal";
import ViewBatchQueryModal from "@/components/batches/ViewBatchQueryModal";

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
    /** The student's existing seat request, when they already made one */
    myRequest?: ExploreRequestInfo | null;
    /** The student's existing query, when they already asked one */
    myQuery?: ExploreQueryInfo | null;
    onViewDetails?: () => void;
    onRequestSeat?: (mode: "Online" | "Offline" | "Hybrid") => void;
    onAskQuery?: (queryType: string, message: string) => void;
}

export interface ExploreRequestInfo {
    status: "pending" | "approved" | "rejected";
    mode: string;
    requestedOn: string;
}

export interface ExploreQueryInfo {
    queryType: string;
    queryText: string;
    queryStatus: "pending" | "resolved" | "closed";
    queryResponse: string | null;
    askedOn: string;
}

export type BatchCardProps =
    | OngoingBatchCardProps
    | UpcomingBatchCardProps
    | CompletedBatchCardProps
    | ExploreBatchCardProps;

// ── Shared styles ─────────────────────────────────────────────────────────────

const CARD_SX = {
    background: "#0D0D0D",
    borderRadius: "14px",
    p: 1.5,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    position: "relative",
    top: "40px",
    width: "100%",
    mb: "40px",
} as const;

const LABEL_SX = {
    fontSize: "0.6rem",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    fontWeight: 500,
    mb: 1,
    lineHeight: 1.2,
};

const VALUE_SX = {
    fontSize: "0.8rem",
    color: "#fff",
    fontWeight: 600,
    lineHeight: 1.25,
};

const OUTLINED_BTN_SX = {
    flex: 1,
    border: "1px solid rgba(255,255,255,0.22)",
    color: "#fff",
    borderRadius: "8px",
    fontSize: "0.75rem",
    fontWeight: 600,
    py: 0.75,
    textTransform: "none" as const,
    "&:hover": {
        border: "1px solid rgba(255,255,255,0.45)",
        bgcolor: "rgba(255,255,255,0.04)",
    },
};

const TITLE_SX = {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "-0.01em",
    lineHeight: 1.3,
};

const STATUS_MAP = {
    Pending: { bg: "rgb(255, 239, 198)", color: "#FC9700", border: "rgba(251, 190, 36, 0)" },
    Approved: { bg: "rgb(205, 255, 238)", color: "#00FFAA", border: "rgba(147, 255, 219, 0.01)" },
    Rejected: { bg: "rgb(255, 207, 207)", color: "#FD0000", border: "rgba(239, 68, 68, 0.01)" },
};

const REQUEST_STATUS_MAP: Record<ExploreRequestInfo["status"], { label: string; bg: string; color: string; border: string }> = {
    pending: { label: "Pending approval", bg: "#3A2C10", color: "#FFB74D", border: "#B77B12" },
    approved: { label: "Approved", bg: "#0E2E23", color: "#4ADE80", border: "#1F7A55" },
    rejected: { label: "Rejected", bg: "#33161A", color: "#FF7A7A", border: "#8C2F35" },
};

const QUERY_STATUS_MAP: Record<ExploreQueryInfo["queryStatus"], { label: string; color: string }> = {
    pending: { label: "Awaiting reply", color: "#FFB74D" },
    resolved: { label: "Answered", color: "#4ADE80" },
    closed: { label: "Closed", color: "rgba(255,255,255,0.5)" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const StatCell = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Box>
        <Typography sx={LABEL_SX}>{label}</Typography>
        {children}
    </Box>
);

const StatValue = ({ value }: { value: string }) => (
    <Typography sx={VALUE_SX}>{value}</Typography>
);

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const TrainersCell = ({ trainers }: { trainers: Trainer[] }) => {
    if (trainers.length === 0) {
        return (
            <StatCell label="Trainers">
                <StatValue value="Not assigned" />
            </StatCell>
        );
    }
    return (
        <StatCell label={`${trainers.length} Trainer${trainers.length !== 1 ? "s" : ""}`}>
            <AvatarGroup
                max={3}
                sx={{
                    justifyContent: "flex-start",
                    flexDirection: "row",
                    width: "100%",
                    "& .MuiAvatar-root": {
                        width: 22,
                        height: 22,
                        fontSize: "0.55rem",
                        fontWeight: 700,
                        color: "#fff",
                        border: "1.5px solid rgba(255,255,255,0.12)",
                        bgcolor: "#7c3aed",
                    },
                }}
            >
                {trainers.map((t, i) => (
                    <Avatar key={i} src={t.avatar || undefined} alt={t.name}>
                        {getInitials(t.name)}
                    </Avatar>
                ))}
            </AvatarGroup>
        </StatCell>
    );
};

const OutlinedBtn = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <Button variant="outlined" sx={OUTLINED_BTN_SX} onClick={onClick}>
        {children}
    </Button>
);

const GradientBtn = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <Box sx={{ flex: 1 }}>
        <CCNButton onClick={onClick} className="w-full">{children}</CCNButton>
    </Box>
);

// ── Ongoing Card ──────────────────────────────────────────────────────────────

const OngoingCard = ({
    title, batchProgress, attendance, mode, trainers = [],
    nextSession, hasJoinClass, onViewDetails, onJoinClass,
}: OngoingBatchCardProps) => (
    <Box sx={{ position: "relative", padding: "0.5px", display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center" }}>
        <Box sx={{
            position: "absolute",
            width: "100%",
            height: "80%",
            borderRadius: 3,
            overflow: "hidden",
            background: "linear-gradient(90deg, #402062 0%, #512D58 100%)",
            mb: 0,
            padding: "12px",
        }} >
            <Typography sx={TITLE_SX}>{title}</Typography>


        </Box>

        <Box sx={CARD_SX}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, border: "1px dashed rgba(255,255,255,0.22)", padding: 1, borderRadius: "8px" }}>
                <StatCell label="Batch Progress"><StatValue value={`${batchProgress}% Completed`} /></StatCell>
                <StatCell label="Your Attendance"><StatValue value={`${attendance}%`} /></StatCell>
                <StatCell label="Mode"><StatValue value={mode} /></StatCell>
                <TrainersCell trainers={trainers} />
            </Box>
            <Box sx={{
                bgcolor: "#141416",
                // borderLeft: "3px solid #8b5cf6",
                borderRadius: "0 8px 8px 0",
                p: "8px 10px",
                position: "relative",
            }}>
                <Box sx={{ position: "absolute", top: 0, left: 0, width: `5px`, height: "100%", background: "linear-gradient(180deg, #2431B3, #BE6E5D, #BDA045, #BAB31F)", borderRadius: "8px 0 0 8px", zIndex: 1 }} />
                <Typography sx={{ ...LABEL_SX, mb: 0.5 }}>{nextSession?.label ?? "Next Session"}</Typography>
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: nextSession ? "#fff" : "rgba(255,255,255,0.45)", mb: 0.3 }}>
                    {nextSession?.title ?? "No session scheduled"}
                </Typography>
                {nextSession && (
                    <Typography sx={{ fontSize: "0.7rem", color: "rgba(255, 255, 255, 0.77)" }}>{nextSession.timing}</Typography>
                )}
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
                <OutlinedBtn onClick={onViewDetails}>View Details</OutlinedBtn>
                {hasJoinClass && <GradientBtn onClick={onJoinClass}>Join Class</GradientBtn>}
            </Box>
        </Box>
    </Box>
);

// ── Upcoming Card ─────────────────────────────────────────────────────────────

const UpcomingCard = ({
    title, mode, trainers = [], requestedOn, batchStartDate,
    requestStatus, onCancelRequest, onViewRequest,
}: UpcomingBatchCardProps) => {
    const sc = STATUS_MAP[requestStatus];
    return (
        <Box sx={{ position: "relative", padding: "1px", display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center" }}>
            <Box sx={{
                position: "absolute",
                width: "100%",
                height: "80%",
                borderRadius: 3,
                overflow: "hidden",
                background: "linear-gradient(90deg, #402062 0%, #512D58 100%)",
                mb: 1.5,
                padding: "12px",
            }}>
                <Typography sx={TITLE_SX}>{title}</Typography>
            </Box>

            <Box sx={CARD_SX}>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, border: "1px dashed rgba(255,255,255,0.22)", padding: 1, borderRadius: "8px" }}>
                    <StatCell label="Requested On"><StatValue value={requestedOn} /></StatCell>
                    <StatCell label="Batch Start Date"><StatValue value={batchStartDate} /></StatCell>
                    <StatCell label="Mode"><StatValue value={mode} /></StatCell>
                    <StatCell label="Status">
                        <Chip
                            label={requestStatus}
                            size="small"
                            sx={{
                                bgcolor: sc.bg,
                                color: sc.color,
                                border: `1px solid ${sc.border}`,
                                fontSize: "0.65rem",
                                fontWeight: 600,
                                height: 20,
                                borderRadius: "5px",
                            }}
                        />
                    </StatCell>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <OutlinedBtn onClick={onCancelRequest}>Cancel Request</OutlinedBtn>
                    <GradientBtn onClick={onViewRequest}>View Request</GradientBtn>
                </Box>
            </Box>
        </Box>
    );
};

// ── Completed Card ────────────────────────────────────────────────────────────

const CompletedCard = ({
    title, mode, trainers = [], batchCompletedOn, attendance, onViewDetails,
}: CompletedBatchCardProps) => (
    <Box sx={{ position: "relative", padding: "1px", display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center" }}>
        <Box sx={{
            position: "absolute",
            width: "100%",
            height: "80%",
            borderRadius: 3,
            overflow: "hidden",
            background: "linear-gradient(90deg, #402062 0%, #512D58 100%)",
            mb: 1.5,
            padding: "12px",
        }}>
            <Typography sx={TITLE_SX}>{title}</Typography>
        </Box>

        <Box sx={CARD_SX}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, border: "1px dashed rgba(255,255,255,0.22)", padding: 1, borderRadius: "8px" }}>
                <StatCell label="Batch Completed on"><StatValue value={batchCompletedOn} /></StatCell>
                <StatCell label="Your Attendance"><StatValue value={`${attendance}%`} /></StatCell>
                <StatCell label="Mode"><StatValue value={mode} /></StatCell>
                <TrainersCell trainers={trainers} />
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
                <OutlinedBtn onClick={onViewDetails}>View Details</OutlinedBtn>
            </Box>
        </Box>
    </Box>
);

// ── Explore Card ──────────────────────────────────────────────────────────────

const ExploreCard = ({
    title, mode, trainers = [],
    startMonth, startDay, endMonth, endDay, duration,
    batchTime, batchDays, seatsLeft,
    myRequest, myQuery,
    onViewDetails, onRequestSeat, onAskQuery,
}: ExploreBatchCardProps) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [askModalOpen, setAskModalOpen] = useState(false);
    const [viewQueryOpen, setViewQueryOpen] = useState(false);
    const requestStatus = myRequest ? REQUEST_STATUS_MAP[myRequest.status] : null;
    const queryStatus = myQuery ? QUERY_STATUS_MAP[myQuery.queryStatus] : null;
    return (
        <>
            <Box sx={{ position: "relative", padding: "1px", display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center" }}>
                <Box sx={{
                    position: "absolute",
                    width: "100%",
                    height: "80%",
                    borderRadius: 3,
                    overflow: "hidden",
                    background: "linear-gradient(90deg, #402062 0%, #512D58 100%)",
                    mb: 2,
                    padding: "12px",
                }}>
                    <Typography sx={TITLE_SX}>{title}</Typography>
                </Box>

                <Box sx={CARD_SX}>
                    {/* Date row */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 1, border: "1px dashed rgba(255,255,255,0.22)", padding: 1, borderRadius: "8px" }}>
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, }}>
                            <Box sx={{ flexShrink: 0 }}>
                                <Typography sx={LABEL_SX}>Starts at</Typography>
                                <Box sx={{ display: "flex", mb: 0.3, flexDirection: "column", alignItems: "flex-start", borderRadius: "4px", overflow: "hidden" }}>
                                    <Typography sx={{ background: "linear-gradient(90deg, #8C24FF 0%, #0E1934 100%)", color: "#fff", fontSize: "0.55rem", height: 18, display: "flex", width: "100%", textAlign: "center", justifyContent: "center", alignItems: "center" }}>{startMonth}</Typography>
                                    <Typography sx={{ color: "#000", fontSize: "1.05rem", background: "white", width: "100%", textAlign: "center", fontWeight: 600 }}>{startDay}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 0.5, mt: "22px" }}>
                                <Typography sx={{ color: "rgba(255,255,255,0.22)", fontSize: "0.7rem", flexShrink: 0 }}>*</Typography>
                                <Box sx={{ flex: 1, borderTop: "1px dashed rgba(255,255,255,0.14)" }} />
                                <Typography sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.38)", whiteSpace: "nowrap", flexShrink: 0 }}>
                                    Duration: {duration}
                                </Typography>
                                <Box sx={{ flex: 1, borderTop: "1px dashed rgba(255,255,255,0.14)" }} />
                                <Typography sx={{ color: "rgba(255,255,255,0.22)", fontSize: "0.7rem", flexShrink: 0 }}>*</Typography>
                            </Box>
                            <Box sx={{ flexShrink: 0, textAlign: "right" }}>
                                <Typography sx={LABEL_SX}>Ends at</Typography>

                                <Box sx={{ display: "flex", mb: 0.3, flexDirection: "column", alignItems: "flex-start", borderRadius: "4px", overflow: "hidden", minWidth: 40 }}>
                                    <Typography sx={{ background: "linear-gradient(90deg, #8C24FF 0%, #0E1934 100%)", color: "#fff", fontSize: "0.55rem", height: 18, display: "flex", width: "100%", textAlign: "center", justifyContent: "center", alignItems: "center" }}>{endMonth}</Typography>
                                    <Typography sx={{ color: "#000", fontSize: "1.05rem", background: "white", width: "100%", textAlign: "center", fontWeight: 600 }}>{endDay}</Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Time & days */}
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                            <StatCell label="Batch Time"><StatValue value={batchTime} /></StatCell>
                            <StatCell label="Batch Days"><StatValue value={batchDays} /></StatCell>
                        </Box>

                        {/* Mode + trainers */}
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                            <StatCell label="Mode">
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                                    <Typography sx={VALUE_SX}>{mode}</Typography>
                                    <Chip
                                        label={`${seatsLeft} seats left`}
                                        size="small"
                                        sx={{
                                            bgcolor: "rgb(255, 220, 195)",
                                            color: "#B30F00DA",
                                            border: "1px solid rgba(249,115,22,0.28)",
                                            fontSize: "0.55rem",
                                            height: 18,
                                            borderRadius: "5px",
                                        }}
                                    />
                                </Box>
                            </StatCell>
                            <TrainersCell trainers={trainers} />
                        </Box>
                    </Box>
                    {/* Existing request */}
                    {myRequest && requestStatus && (
                        <Box sx={{
                            bgcolor: requestStatus.bg,
                            border: `1px solid ${requestStatus.border}`,
                            borderRadius: "8px",
                            p: "8px 10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                        }}>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ ...LABEL_SX, mb: 0.3 }}>Your Request</Typography>
                                <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)" }}>
                                    {myRequest.mode} · {myRequest.requestedOn}
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: requestStatus.color, whiteSpace: "nowrap" }}>
                                {requestStatus.label}
                            </Typography>
                        </Box>
                    )}

                    {/* Buttons */}
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <OutlinedBtn onClick={onViewDetails}>View Details</OutlinedBtn>
                        {!myRequest && <GradientBtn onClick={() => setModalOpen(true)}>Request Seat</GradientBtn>}
                    </Box>

                    {/* Query */}
                    {myQuery && queryStatus ? (
                        <Box
                            onClick={() => setViewQueryOpen(true)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 0.75,
                                cursor: "pointer",
                                mt: -0.5,
                                "&:hover .view-query-label": { color: "#fff" },
                            }}
                        >
                            <Typography
                                className="view-query-label"
                                sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.55)", textDecoration: "underline" }}
                            >
                                View your query
                            </Typography>
                            <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: queryStatus.color }}>
                                · {queryStatus.label}
                            </Typography>
                        </Box>
                    ) : (
                        <Typography
                            onClick={() => setAskModalOpen(true)}
                            sx={{
                                fontSize: "0.7rem",
                                color: "rgba(255,255,255,0.38)",
                                textAlign: "center",
                                cursor: "pointer",
                                textDecoration: "underline",
                                mt: -0.5,
                                "&:hover": { color: "rgba(255,255,255,0.65)" },
                            }}
                        >
                            Ask about this batch
                        </Typography>
                    )}
                </Box>
            </Box>

            <RequestSeatModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                batchTitle={title}
                seatsLeft={seatsLeft}
                onSubmit={(selectedMode) => onRequestSeat?.(selectedMode)}
            />
            <AskAboutBatchModal
                open={askModalOpen}
                onClose={() => setAskModalOpen(false)}
                batchTitle={title}
                onSubmit={(queryType, message) => onAskQuery?.(queryType, message)}
            />
            {myQuery && (
                <ViewBatchQueryModal
                    open={viewQueryOpen}
                    onClose={() => setViewQueryOpen(false)}
                    batchTitle={title}
                    queryType={myQuery.queryType}
                    queryText={myQuery.queryText}
                    queryStatus={myQuery.queryStatus}
                    queryResponse={myQuery.queryResponse}
                    askedOn={myQuery.askedOn}
                />
            )}
        </>
    );
};

// ── Main export ───────────────────────────────────────────────────────────────

export default function BatchCard(props: BatchCardProps) {
    switch (props.variant) {
        case "ongoing": return <OngoingCard   {...props} />;
        case "upcoming": return <UpcomingCard  {...props} />;
        case "completed": return <CompletedCard {...props} />;
        case "explore": return <ExploreCard   {...props} />;
    }
}
