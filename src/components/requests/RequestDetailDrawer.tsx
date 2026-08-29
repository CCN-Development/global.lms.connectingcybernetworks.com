"use client";

import React, { useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Drawer,
    IconButton,
    Typography,
} from "@mui/material";
import toast from "react-hot-toast";
import {
    MdCheck,
    MdClose,
    MdDescription,
    MdThumbDown,
    MdThumbUp,
    MdVisibility,
} from "react-icons/md";
import {
    ACTIVE_STATUSES,
    STATUS_LABELS,
    useRequests,
    type RequestTimeline,
    type StudentRequest,
} from "@/contexts/RequestContext";
import { STATUS_TONE, formatDateTime, formatFileSize, hoursRemaining } from "./request-ui";

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <Typography
            sx={{
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#8A8A93",
            }}
        >
            {children}
        </Typography>
    );
}

function TimelineRow({ item, isLast }: { item: RequestTimeline; isLast: boolean }) {
    const isRejected = item.timelineStatus === "rejected" || item.timelineStatus === "withdrawn";
    const isDone = item.timelineStatus === "approved" || item.timelineStatus === "resolved";

    const markerColor = isRejected ? "#f43f5e" : isDone ? "#10b981" : "#8B5CF6";

    return (
        <Box sx={{ display: "flex", gap: 1.25, position: "relative", pb: isLast ? 0 : 1.75 }}>
            {/* Connector + marker */}
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <Box
                    sx={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        bgcolor: markerColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        zIndex: 1,
                    }}
                >
                    {isRejected ? <MdClose size={12} /> : isDone ? <MdCheck size={12} /> : (
                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#fff" }} />
                    )}
                </Box>
                {!isLast && (
                    <Box sx={{ position: "absolute", top: 18, bottom: -4, width: "2px", bgcolor: "#3F3F46" }} />
                )}
            </Box>

            {/* Copy */}
            <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 0.5 }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 500, color: "#fff", flex: 1, minWidth: 120 }}>
                    {item.timelineTitle}
                </Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "#8A8A93", whiteSpace: "nowrap" }}>
                    {formatDateTime(item.timelineDate)}
                </Typography>
                {item.timelineNote && (
                    <Typography sx={{ fontSize: "0.76rem", color: "#A1A1AA", width: "100%", mt: 0.25 }}>
                        {item.timelineNote}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

function CalloutBox({
    label,
    text,
    color,
}: { label: string; text: string; color: string }) {
    return (
        <Box sx={{ borderRadius: "12px", border: `1px solid ${color}`, bgcolor: "#0A0A0C", p: 1.5 }}>
            <Typography
                sx={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color,
                    mb: 0.75,
                }}
            >
                {label}
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "#E4E4E7", lineHeight: 1.55, whiteSpace: "pre-line" }}>
                {text}
            </Typography>
        </Box>
    );
}

/* ------------------------------------------------------------------ */
/* Drawer                                                              */
/* ------------------------------------------------------------------ */

export interface RequestDetailDrawerProps {
    open: boolean;
    request: StudentRequest | null;
    onClose: () => void;
    onChanged?: (request: StudentRequest) => void;
}

export default function RequestDetailDrawer({ open, request, onClose, onChanged }: RequestDetailDrawerProps) {
    const { withdrawRequest, submitRequestFeedback, submitting } = useRequests();
    const [feedbackBusy, setFeedbackBusy] = useState(false);

    if (!request) return null;

    const isActive = ACTIVE_STATUSES.includes(request.requestStatus);
    const tone = STATUS_TONE[request.requestStatus];
    const sla = hoursRemaining(request);

    const handleWithdraw = async () => {
        const res = await withdrawRequest(request.requestId);
        if (!res.success || !res.data) {
            toast.error(res.message ?? "Failed to withdraw request");
            return;
        }
        toast.success(res.message ?? "Request withdrawn");
        onChanged?.(res.data);
        onClose();
    };

    const handleFeedback = async (isSatisfied: boolean) => {
        setFeedbackBusy(true);
        const res = await submitRequestFeedback(request.requestId, isSatisfied);
        setFeedbackBusy(false);
        if (!res.success || !res.data) {
            toast.error(res.message ?? "Failed to submit feedback");
            return;
        }
        toast.success(res.message ?? "Thanks for your feedback");
        onChanged?.(res.data);
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        width: { xs: "100%", sm: 460 },
                        bgcolor: "#000000",
                        borderLeft: "1px solid #041884",
                        borderTopLeftRadius: { xs: 0, sm: "18px" },
                        borderBottomLeftRadius: { xs: 0, sm: "18px" },
                        color: "#fff",
                    },
                },
                backdrop: { sx: { backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" } },
            }}
        >
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                {/* Header */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, pt: 2, pb: 1 }}>
                    <SectionLabel>Request Details</SectionLabel>
                    <Box sx={{ flex: 1 }} />
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            color: "#fff",
                            border: "1px solid #3F3F46",
                            bgcolor: "#121216",
                            "&:hover": { bgcolor: "#1F1F26" },
                        }}
                    >
                        <MdClose size={16} />
                    </IconButton>
                </Box>

                {/* Scrollable body */}
                <Box sx={{ flex: 1, overflowY: "auto", px: 2, pb: 2 }}>
                    {/* Pills */}
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 0.5 }}>
                        <Box
                            sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.5,
                                px: 1.1,
                                py: 0.4,
                                borderRadius: "999px",
                                bgcolor: tone.bg,
                            }}
                        >
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: tone.text }} />
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: tone.text, lineHeight: 1 }}>
                                {STATUS_LABELS[request.requestStatus]}
                            </Typography>
                        </Box>
                        <Box sx={{ px: 1.1, py: 0.4, borderRadius: "999px", bgcolor: "#26262B" }}>
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 500, color: "#D4D4D8", lineHeight: 1.4 }}>
                                {request.requestType}
                            </Typography>
                        </Box>
                        {request.isUrgent && (
                            <Box sx={{ px: 1.1, py: 0.4, borderRadius: "999px", bgcolor: "#3a2a08" }}>
                                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#fbbf24", lineHeight: 1.4 }}>
                                    Urgent
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Title */}
                    <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", lineHeight: 1.25, mt: 1.5 }}>
                        {request.requestTitle}
                    </Typography>

                    {/* Description */}
                    <Box sx={{ mt: 1.75, borderRadius: "12px", border: "1px solid #26262B", bgcolor: "#0A0A0C", p: 1.5 }}>
                        <SectionLabel>Description</SectionLabel>
                        <Typography sx={{ fontSize: "0.85rem", color: "#E4E4E7", lineHeight: 1.6, mt: 0.75, whiteSpace: "pre-line" }}>
                            {request.requestDescription}
                        </Typography>
                    </Box>

                    {/* Attachments */}
                    {request.requestSupportingDocuments.map((doc) => (
                        <Box
                            key={doc.documentId}
                            sx={{
                                mt: 1.25,
                                display: "flex",
                                alignItems: "center",
                                gap: 1.25,
                                p: 1.25,
                                borderRadius: "12px",
                                bgcolor: "#121216",
                            }}
                        >
                            <Box
                                sx={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: "8px",
                                    bgcolor: "#26262B",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#D4D4D8",
                                    flexShrink: 0,
                                }}
                            >
                                <MdDescription size={18} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontSize: "0.85rem", fontWeight: 500, color: "#fff" }} noWrap>
                                    {doc.documentName}
                                </Typography>
                                <Typography sx={{ fontSize: "0.72rem", color: "#8A8A93" }}>
                                    {formatFileSize(doc.documentSize) || "Attachment"}
                                </Typography>
                            </Box>
                            <IconButton
                                component="a"
                                href={doc.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="small"
                                sx={{
                                    color: "#D4D4D8",
                                    border: "1px solid #3F3F46",
                                    "&:hover": { color: "#fff", bgcolor: "#1F1F26" },
                                }}
                            >
                                <MdVisibility size={15} />
                            </IconButton>
                        </Box>
                    ))}

                    {/* Status history */}
                    <Box sx={{ mt: 2.5 }}>
                        <SectionLabel>Status History</SectionLabel>
                        <Box sx={{ mt: 1.25 }}>
                            {request.requestTimelines.map((item, index) => (
                                <TimelineRow
                                    key={item.timelineId}
                                    item={item}
                                    isLast={index === request.requestTimelines.length - 1}
                                />
                            ))}
                        </Box>
                    </Box>

                    {/* SLA note — only while the request is still open */}
                    {isActive && (
                        <Typography sx={{ mt: 1.75, fontSize: "0.8rem", fontWeight: 500, color: "#f59e0b" }}>
                            {sla === null
                                ? "Response is overdue — your RM has been notified"
                                : `Expected response within ${sla} hour${sla === 1 ? "" : "s"}`}
                        </Typography>
                    )}

                    {/* Outcome callout */}
                    {request.rejectionReason && (
                        <Box sx={{ mt: 2 }}>
                            <CalloutBox label="Reason for rejection" text={request.rejectionReason} color="#f43f5e" />
                        </Box>
                    )}
                    {!request.rejectionReason && request.responseMessage && (
                        <Box sx={{ mt: 2 }}>
                            <CalloutBox label="Next step" text={request.responseMessage} color="#3B5BFF" />
                        </Box>
                    )}

                    {/* Satisfaction feedback */}
                    {!isActive && (
                        <Box
                            sx={{
                                mt: 2,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                p: 1.5,
                                borderRadius: "12px",
                                border: "1px solid #26262B",
                                bgcolor: "#0A0A0C",
                            }}
                        >
                            <Typography sx={{ flex: 1, fontSize: "0.85rem", color: "#E4E4E7" }}>
                                {request.isSatisfied === null
                                    ? "Was this request handled satisfactorily?"
                                    : request.isSatisfied
                                        ? "Thanks — glad we could help."
                                        : "Thanks for the feedback, we'll do better."}
                            </Typography>
                            {request.isSatisfied === null && (
                                <>
                                    <IconButton
                                        onClick={() => handleFeedback(true)}
                                        disabled={feedbackBusy}
                                        size="small"
                                        sx={{ color: "#D4D4D8", "&:hover": { color: "#10b981" } }}
                                    >
                                        <MdThumbUp size={17} />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleFeedback(false)}
                                        disabled={feedbackBusy}
                                        size="small"
                                        sx={{ color: "#D4D4D8", "&:hover": { color: "#f43f5e" } }}
                                    >
                                        <MdThumbDown size={17} />
                                    </IconButton>
                                </>
                            )}
                        </Box>
                    )}
                </Box>

                {/* Footer action */}
                {isActive && (
                    <Box sx={{ px: 2, pb: 2, pt: 1, borderTop: "1px solid #1A1A20" }}>
                        <Button
                            fullWidth
                            onClick={handleWithdraw}
                            disabled={submitting}
                            sx={{
                                py: 1.1,
                                borderRadius: "10px",
                                textTransform: "none",
                                fontSize: "0.88rem",
                                fontWeight: 500,
                                color: "#fff",
                                border: "1px solid #3F3F46",
                                bgcolor: "#0A0A0C",
                                "&:hover": { bgcolor: "#18181B", borderColor: "#52525B" },
                            }}
                        >
                            {submitting ? <CircularProgress size={16} color="inherit" /> : "Withdraw Request"}
                        </Button>
                    </Box>
                )}
            </Box>
        </Drawer>
    );
}
