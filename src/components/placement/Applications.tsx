"use client";

import React from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { ACTIVITY, ActivityEvent, Application, NoteTone, PLACEMENT_ROUTES, STAGES, StageState, findJob, isClosed, stageStates } from "./jobs-data";
import { CompanyLine } from "./JobCards";
import { Asset, DashedLine, OutlineButton, PL, PTEXT, cq, glassCard } from "./placement-ui";

// ─── Stage tracker (Applied → Under Review → Interview → Offer) ───────────
function StageCircle({ state }: { state: StageState }) {
    const base = { width: 32, height: 32, borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
    if (state === "done")
        return (
            <Box sx={{ ...base, backgroundImage: PL.tealGradient }}>
                <Asset name="icon-check-white.svg" width={21.33} height={21.33} />
            </Box>
        );
    if (state === "failed")
        return (
            <Box sx={{ ...base, bgcolor: PL.errorFill }}>
                <Asset name="timeline-x.svg" width={16} height={16} />
            </Box>
        );
    if (state === "active")
        return (
            <Box sx={{ position: "relative", width: 32, height: 32, flexShrink: 0 }}>
                <Box sx={{ ...base, position: "absolute", inset: 0, border: "1px solid #8C24FF", filter: "blur(3px)" }}>
                    <Asset name="icon-circle-purple.svg" width={21.33} height={21.33} />
                </Box>
                <Box sx={{ ...base, position: "relative", border: "1px solid #8C24FF" }}>
                    <Asset name="icon-circle-purple.svg" width={21.33} height={21.33} />
                </Box>
            </Box>
        );
    return <Box sx={{ ...base, border: `0.93px solid ${PL.n500}` }} />;
}

export function StageTracker({ application }: { application: Application }) {
    const states = stageStates(application);
    return (
        <Box component="ol" aria-label="Application progress" sx={{ display: "flex", alignItems: "flex-start", m: 0, p: 0, listStyle: "none", width: "100%" }}>
            {STAGES.map((stage, i) => (
                <React.Fragment key={stage}>
                    {i > 0 && (
                        <Box aria-hidden sx={{ flex: 1, minWidth: 12, pt: "21.36px" }}>
                            <DashedLine tile={states[i - 1] === "done" ? "stage-line-done.svg" : "stage-line-pending.svg"} tileWidth={58} />
                        </Box>
                    )}
                    <Box
                        component="li"
                        aria-label={`${stage}: ${states[i]}`}
                        sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5.36px", p: "5.36px", width: { xs: 72, sm: 86 }, flexShrink: 0 }}
                    >
                        <StageCircle state={states[i]} />
                        <Typography sx={{ ...PTEXT.med12, color: states[i] === "active" ? PL.white : PL.n500, textAlign: "center", whiteSpace: "nowrap" }}>
                            {stage}
                        </Typography>
                    </Box>
                </React.Fragment>
            ))}
        </Box>
    );
}

// ─── Application card ──────────────────────────────────────────────────────
export function ApplicationCard({ application, actionLabel = "View Details" }: { application: Application; actionLabel?: string }) {
    const job = findJob(application.jobId);
    if (!job) return null;
    return (
        <Box sx={{ containerType: "inline-size" }}>
            <Box
                component="article"
                sx={{
                    ...glassCard("16px", PL.cardBg.replace("176.96deg", "177.84deg")),
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    p: "24px",
                    [cq(900)]: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: "24px" },
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: 0, [cq(900)]: { width: 280, flexShrink: 1 } }}>
                    <CompanyLine id={job.company} />
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Typography component="h3" sx={{ ...PTEXT.poppinsSemi20, color: PL.white }}>
                            {job.title}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Asset name="icon-calendar.svg" width={16} height={16} />
                            <Typography sx={{ ...PTEXT.med14, color: PL.n300 }}>Applied on {application.appliedOn}</Typography>
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, maxWidth: { xs: "100%" }, [cq(900)]: { maxWidth: 518 } }}>
                    <StageTracker application={application} />
                </Box>
                <OutlineButton href={PLACEMENT_ROUTES.application(application.id)} sx={{ alignSelf: "flex-start", [cq(900)]: { alignSelf: "center" } }}>
                    {actionLabel}
                </OutlineButton>
            </Box>
        </Box>
    );
}

// ─── Activity timeline (Track Application) ─────────────────────────────────
const NOTE_STYLE: Record<NoteTone, object> = {
    error: {
        backgroundImage: "linear-gradient(180deg, rgba(224,44,66,0.08) 0%, rgba(173,34,51,0.08) 50%, rgba(122,24,36,0.08) 100%)",
        border: "0.6px solid #7A1824",
        borderBottomWidth: "2px",
    },
    warning: {
        backgroundImage: "linear-gradient(180deg, rgba(255,173,79,0.08) 0%, rgba(204,138,63,0.08) 50%, rgba(153,104,47,0.08) 100%)",
        border: "0.6px solid rgba(255,173,79,0.24)",
        borderBottomWidth: "2px",
    },
    info: {
        bgcolor: "rgba(47,83,173,0.08)",
        border: "1px solid #2F53AD",
        borderBottomWidth: "3px",
    },
};

function EventIcon({ state }: { state: "done" | "current" | "failed" }) {
    if (state === "current") return <Asset name="timeline-current.svg" width={28} height={28} />;
    return (
        <Box
            sx={{
                width: 28,
                height: 28,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50px",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(25px)",
                ...(state === "done" ? { backgroundImage: PL.tealGradient } : { bgcolor: PL.errorFill }),
            }}
        >
            {state === "done" ? <Asset name="timeline-check.svg" width={18} height={18} /> : <Asset name="timeline-x.svg" width={16} height={16} />}
        </Box>
    );
}

function OfferActions({ onDecide }: { onDecide: (accept: boolean) => void }) {
    const button = (accept: boolean) => (
        <ButtonBase
            onClick={() => onDecide(accept)}
            sx={{
                flex: 1,
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                px: "16px",
                borderRadius: "8px",
                border: `1px solid ${accept ? "#207720" : "#7A1824"}`,
                ...PTEXT.reg12,
                color: accept ? PL.successDark : PL.error,
                transition: "background-color .15s ease",
                "&:hover": { bgcolor: accept ? "rgba(47,173,47,0.08)" : "rgba(209,41,61,0.08)" },
            }}
        >
            <Asset name={accept ? "icon-thumbs-up-green.svg" : "icon-thumbs-down-red.svg"} width={20} height={20} />
            {accept ? "Accept" : "Reject"}
        </ButtonBase>
    );
    return (
        <Box sx={{ display: "flex", gap: "12px", width: "100%" }}>
            {button(false)}
            {button(true)}
        </Box>
    );
}

export function ActivityTimeline({ application, onOfferDecision }: { application: Application; onOfferDecision?: (accept: boolean) => void }) {
    const { activity } = application;
    const closed = isClosed(application);

    return (
        <Box component="section" aria-label="Application activity" sx={{ ...glassCard("24px", PL.activityBg), boxShadow: "inset 0 0 6px 0 rgba(255,255,255,0.16)", p: "24px" }}>
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "24px" }}>
                <Typography component="h2" sx={{ ...PTEXT.semi18, color: PL.n200 }}>
                    ACTIVITY
                </Typography>
                <Box component="ol" sx={{ display: "flex", flexDirection: "column", gap: "12px", m: 0, p: 0, listStyle: "none" }}>
                    {activity.map((event: ActivityEvent, i) => {
                        const meta = ACTIVITY[event.type];
                        const isLast = i === activity.length - 1;
                        const state = !isLast ? "done" : meta.negative ? "failed" : meta.terminal ? "done" : "current";
                        const note = isLast ? meta.note : undefined;
                        const showNote = !!note && (!!event.note || event.type === "offer-received");
                        const showOfferActions = isLast && event.type === "offer-received" && !!onOfferDecision;
                        const showConnector = !(isLast && closed && !meta.negative) && !(isLast && meta.terminal);

                        return (
                            <Box component="li" key={`${event.type}-${i}`} sx={{ display: "flex", alignItems: "stretch", gap: "12px" }}>
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: "20px", flexShrink: 0, minHeight: 70 }}>
                                    <EventIcon state={state} />
                                    {showConnector && (
                                        <Box aria-hidden sx={{ flex: 1, width: "1px", minHeight: 22, backgroundImage: "linear-gradient(180deg, rgba(242,242,242,0.44) 0%, rgba(140,140,140,0.22) 100%)" }} />
                                    )}
                                </Box>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: showOfferActions ? "24px" : "12px", flex: 1, minWidth: 0, px: "16px", py: "12px" }}>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <Typography sx={{ ...PTEXT.med16, color: PL.white }}>{meta.title}</Typography>
                                        <Typography sx={{ ...PTEXT.reg12, color: PL.n300 }}>{event.at}</Typography>
                                    </Box>
                                    {showNote && note && (
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", p: "16px", borderRadius: "16px", ...NOTE_STYLE[note.tone] }}>
                                            <Typography sx={{ ...PTEXT.reg14, color: PL.n300, textTransform: "uppercase" }}>{note.label}</Typography>
                                            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                {event.note?.title && <Typography sx={{ ...PTEXT.med16, color: PL.white }}>{event.note.title}</Typography>}
                                                {event.note?.detail && (
                                                    <Typography sx={{ ...PTEXT.med16, color: event.note.title ? PL.n200 : PL.white }}>{event.note.detail}</Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    )}
                                    {showOfferActions && <OfferActions onDecide={onOfferDecision!} />}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Box>
    );
}
