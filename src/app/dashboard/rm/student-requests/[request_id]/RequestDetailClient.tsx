"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import {
    Check,
    ExternalLink,
    Eye,
    FileText,
    Loader2,
    Mail,
    MessageSquarePlus,
    Phone,
    ShieldCheck,
    ThumbsDown,
    ThumbsUp,
    User,
    X,
    XCircle,
} from "lucide-react";
import {
    ACTIVE_STATUSES,
    STATUS_LABELS,
    useRequests,
    type BranchRequest,
    type RequestStatus,
    type RequestTimeline,
} from "@/contexts/RequestContext";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const BRAND = {
    primary: "#009DFF",
    violet: "#7c3aed",
    violetBg: "#ede9fe",
    sky: "#0284c7",
    skyBg: "#e0f2fe",
    emerald: "#10b981",
    orange: "#f97316",
    amber: "#f59e0b",
    rose: "#f43f5e",
    slate: "#64748b",
};

const STATUS_COLOR: Record<RequestStatus, string> = {
    pending: BRAND.amber,
    in_review: BRAND.sky,
    approved: BRAND.emerald,
    resolved: BRAND.emerald,
    rejected: BRAND.rose,
    withdrawn: BRAND.slate,
};

const FIELD_SX = { "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.8rem" } };

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatDateTime(value?: string | null) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return `${date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · ${date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}`;
}

function formatFileSize(bytes?: number | null) {
    if (!bytes || bytes <= 0) return "Attachment";
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function Surface({ accent, children, className = "" }: { accent: string; children: React.ReactNode; className?: string }) {
    return (
        <Paper
            elevation={0}
            className={className}
            sx={{ borderRadius: "8px", border: `1px solid ${accent}`, transition: "box-shadow .2s", "&:hover": { boxShadow: 3 } }}
        >
            {children}
        </Paper>
    );
}

function SectionTitle({ label, color }: { label: string; color: string }) {
    return (
        <Typography className="text-[11px] font-bold uppercase tracking-wider" sx={{ color }}>
            {label}
        </Typography>
    );
}

function TimelineItem({ item, isLast }: { item: RequestTimeline; isLast: boolean }) {
    const color = STATUS_COLOR[item.timelineStatus] ?? BRAND.slate;
    return (
        <div className="flex gap-2 relative pb-2.5 last:pb-0">
            <div className="relative flex flex-col items-center shrink-0">
                <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: color }} />
                {!isLast && <span className="absolute top-4 -bottom-2.5 w-0.5 bg-gray-200" />}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                    <p className="text-xs font-semibold text-gray-900">{item.timelineTitle}</p>
                    <p className="text-[10px] text-gray-400">{formatDateTime(item.timelineDate)}</p>
                </div>
                {item.actorName && (
                    <p className="text-[10px] text-gray-400">
                        {item.actorName}{item.actorRole ? ` · ${item.actorRole}` : ""}
                    </p>
                )}
                {item.timelineNote && <p className="text-[11px] text-gray-600 mt-0.5">{item.timelineNote}</p>}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function RequestDetailClient({ requestId }: { requestId: string }) {
    const {
        getBranchRequest, markRequestInReview, approveRequest,
        rejectRequest, resolveRequest, addRequestTimelineNote, submitting,
    } = useRequests();

    const [request, setRequest] = useState<BranchRequest | null>(null);
    const [loading, setLoading] = useState(true);

    const [responseMessage, setResponseMessage] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [note, setNote] = useState("");

    const load = useCallback(async () => {
        const res = await getBranchRequest(requestId);
        if (res.success && res.data) setRequest(res.data);
        else toast.error(res.message ?? "Failed to load request");
    }, [getBranchRequest, requestId]);

    useEffect(() => {
        setLoading(true);
        load().finally(() => setLoading(false));
    }, [load]);

    const apply = (
        res: { success: boolean; message: string | null; data: BranchRequest | null },
        clear?: () => void,
    ) => {
        if (!res.success || !res.data) {
            toast.error(res.message ?? "Action failed");
            return;
        }
        toast.success(res.message ?? "Done");
        setRequest(res.data);
        clear?.();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full p-6">
                <Loader2 size={20} className="animate-spin" style={{ color: BRAND.primary }} />
            </div>
        );
    }

    if (!request) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-gray-500">
                <XCircle size={28} className="mb-2" style={{ color: BRAND.rose }} />
                <p className="text-sm">Request not found.</p>
                <Link href="/dashboard/rm/student-requests" className="text-xs hover:underline mt-2" style={{ color: BRAND.primary }}>
                    Back to list
                </Link>
            </div>
        );
    }

    const isOpen = ACTIVE_STATUSES.includes(request.requestStatus);
    const statusColor = STATUS_COLOR[request.requestStatus];

    return (
        <div className="flex flex-col gap-2 sm:gap-3 h-full overflow-y-auto">
            {/* Header */}
            <Surface accent={statusColor}>
                <Box
                    sx={{
                        background: `linear-gradient(90deg, ${BRAND.primary} 0%, ${BRAND.violet} 100%)`,
                        borderRadius: "8px 8px 0 0",
                        px: 1.5,
                        py: 1.25,
                    }}
                >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <Link href="/dashboard/rm/student-requests" className="text-[11px] font-semibold text-white hover:underline">
                            ← All requests
                        </Link>
                        <Link
                            href={`/dashboard/rm/student-profiles/${request.studentId}`}
                            className="flex items-center gap-1 text-[11px] font-semibold text-white hover:underline"
                        >
                            <ExternalLink size={12} /> Student profile
                        </Link>
                    </div>
                </Box>

                <div className="p-3 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <Chip size="small" label={STATUS_LABELS[request.requestStatus]} sx={{ height: 22, fontWeight: 700, backgroundColor: statusColor, color: "#fff" }} />
                        <Chip size="small" label={request.requestType} sx={{ height: 22, fontWeight: 600, backgroundColor: BRAND.sky, color: "#fff" }} />
                        <Chip size="small" label={`Priority: ${request.requestPriority}`} sx={{ height: 22, fontWeight: 600, backgroundColor: BRAND.violet, color: "#fff" }} />
                        {request.isUrgent && (
                            <Chip size="small" label="Urgent" sx={{ height: 22, fontWeight: 700, backgroundColor: BRAND.orange, color: "#fff" }} />
                        )}
                        <Chip size="small" label={`Raised ${formatDateTime(request.createdAt)}`} sx={{ height: 22, fontWeight: 600, backgroundColor: "#f1f5f9", color: BRAND.slate }} />
                    </div>

                    <Typography className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                        {request.requestTitle}
                    </Typography>

                    {/* Student strip */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Avatar
                            src={request.student.studentPhoto || undefined}
                            sx={{ width: 36, height: 36, border: `1px solid ${BRAND.violet}`, backgroundColor: BRAND.violetBg, color: BRAND.violet }}
                        >
                            <User size={16} />
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{request.student.studentName}</p>
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-gray-500">
                                <span className="flex items-center gap-1 font-mono">
                                    <Phone size={10} style={{ color: BRAND.sky }} />
                                    +{request.student.callingCode} {request.student.phoneNumber}
                                </span>
                                {request.student.email && (
                                    <span className="flex items-center gap-1 truncate">
                                        <Mail size={10} style={{ color: BRAND.primary }} />
                                        {request.student.email}
                                    </span>
                                )}
                                {request.student.studentRegistrationNumber && (
                                    <span className="font-mono">{request.student.studentRegistrationNumber}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Surface>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                {/* Left: description, attachments, outcome */}
                <div className="flex flex-col gap-2">
                    <Surface accent={BRAND.sky}>
                        <div className="p-3">
                            <SectionTitle label="Description" color={BRAND.sky} />
                            <Typography className="text-[13px] text-gray-700 mt-1 whitespace-pre-line leading-relaxed">
                                {request.requestDescription}
                            </Typography>
                        </div>
                    </Surface>

                    <Surface accent={BRAND.amber}>
                        <div className="p-3 flex flex-col gap-1.5">
                            <SectionTitle label="Supporting documents" color={BRAND.amber} />
                            {request.requestSupportingDocuments.length === 0 ? (
                                <p className="text-[11px] text-gray-400">No attachments.</p>
                            ) : (
                                request.requestSupportingDocuments.map((doc) => (
                                    <div key={doc.documentId} className="flex items-center gap-2 rounded p-1.5 bg-gray-50 border border-gray-100">
                                        <FileText size={14} style={{ color: BRAND.amber }} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[12px] font-semibold text-gray-800 truncate">{doc.documentName}</p>
                                            <p className="text-[10px] text-gray-400">{formatFileSize(doc.documentSize)}</p>
                                        </div>
                                        <a
                                            href={doc.documentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 rounded hover:bg-gray-100"
                                            style={{ color: BRAND.primary }}
                                        >
                                            <Eye size={13} />
                                        </a>
                                    </div>
                                ))
                            )}
                        </div>
                    </Surface>

                    {request.responseMessage && (
                        <Surface accent={BRAND.emerald}>
                            <div className="p-3">
                                <SectionTitle label="Response sent to student" color={BRAND.emerald} />
                                <Typography className="text-[13px] text-gray-700 mt-1 whitespace-pre-line">
                                    {request.responseMessage}
                                </Typography>
                            </div>
                        </Surface>
                    )}

                    {request.rejectionReason && (
                        <Surface accent={BRAND.rose}>
                            <div className="p-3">
                                <SectionTitle label="Reason for rejection" color={BRAND.rose} />
                                <Typography className="text-[13px] text-gray-700 mt-1 whitespace-pre-line">
                                    {request.rejectionReason}
                                </Typography>
                            </div>
                        </Surface>
                    )}

                    {request.isSatisfied !== null && (
                        <Surface accent={request.isSatisfied ? BRAND.emerald : BRAND.rose}>
                            <div className="p-3 flex items-center gap-2">
                                {request.isSatisfied
                                    ? <ThumbsUp size={15} style={{ color: BRAND.emerald }} />
                                    : <ThumbsDown size={15} style={{ color: BRAND.rose }} />}
                                <div>
                                    <SectionTitle label="Student feedback" color={request.isSatisfied ? BRAND.emerald : BRAND.rose} />
                                    <p className="text-[12px] text-gray-700">
                                        {request.isSatisfied ? "Handled satisfactorily" : "Not satisfied with the resolution"}
                                        {request.satisfactionComment ? ` — ${request.satisfactionComment}` : ""}
                                    </p>
                                </div>
                            </div>
                        </Surface>
                    )}
                </div>

                {/* Right: timeline + actions */}
                <div className="flex flex-col gap-2">
                    <Surface accent={BRAND.violet}>
                        <div className="p-3">
                            <SectionTitle label="Status history" color={BRAND.violet} />
                            <div className="mt-2">
                                {request.requestTimelines.map((item, index) => (
                                    <TimelineItem
                                        key={item.timelineId}
                                        item={item}
                                        isLast={index === request.requestTimelines.length - 1}
                                    />
                                ))}
                            </div>
                            {request.handledByRm && (
                                <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                                    <ShieldCheck size={11} style={{ color: BRAND.violet }} />
                                    Handled by {request.handledByRm.rmName}
                                </p>
                            )}
                        </div>
                    </Surface>

                    {isOpen ? (
                        <Surface accent={BRAND.orange}>
                            <div className="p-3 flex flex-col gap-2">
                                <SectionTitle label="Take action" color={BRAND.orange} />

                                {request.requestStatus === "pending" && (
                                    <Button
                                        onClick={() => markRequestInReview(request.requestId).then((res) => apply(res))}
                                        disabled={submitting}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                            textTransform: "none", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 600,
                                            borderColor: BRAND.sky, color: BRAND.sky,
                                            "&:hover": { borderColor: BRAND.sky, backgroundColor: BRAND.skyBg },
                                        }}
                                    >
                                        Mark as under review
                                    </Button>
                                )}

                                <TextField
                                    label="Next step for the student (required to approve)"
                                    value={responseMessage}
                                    onChange={(event) => setResponseMessage(event.target.value)}
                                    multiline
                                    minRows={2}
                                    size="small"
                                    sx={FIELD_SX}
                                />
                                <TextField
                                    label="Reason for rejection (required to reject)"
                                    value={rejectionReason}
                                    onChange={(event) => setRejectionReason(event.target.value)}
                                    multiline
                                    minRows={2}
                                    size="small"
                                    sx={FIELD_SX}
                                />

                                <div className="flex items-center justify-end gap-1.5">
                                    <Button
                                        onClick={() => {
                                            if (!rejectionReason.trim()) {
                                                toast.error("Add a reason before rejecting");
                                                return;
                                            }
                                            rejectRequest(request.requestId, rejectionReason.trim())
                                                .then((res) => apply(res, () => setRejectionReason("")));
                                        }}
                                        disabled={submitting}
                                        size="small"
                                        variant="outlined"
                                        startIcon={<X size={12} />}
                                        sx={{
                                            textTransform: "none", borderRadius: "8px", fontSize: "0.72rem",
                                            borderColor: BRAND.rose, color: BRAND.rose,
                                            "&:hover": { borderColor: BRAND.rose, backgroundColor: "#ffe4e6" },
                                        }}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            if (!responseMessage.trim()) {
                                                toast.error("Add the next step before approving");
                                                return;
                                            }
                                            approveRequest(request.requestId, responseMessage.trim())
                                                .then((res) => apply(res, () => setResponseMessage("")));
                                        }}
                                        disabled={submitting}
                                        size="small"
                                        variant="contained"
                                        startIcon={submitting ? <CircularProgress size={12} color="inherit" /> : <Check size={12} />}
                                        sx={{
                                            textTransform: "none", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 600,
                                            backgroundColor: BRAND.emerald, "&:hover": { backgroundColor: "#059669" },
                                        }}
                                    >
                                        Approve
                                    </Button>
                                </div>
                            </div>
                        </Surface>
                    ) : request.requestStatus === "approved" ? (
                        <Surface accent={BRAND.emerald}>
                            <div className="p-3 flex flex-col gap-2">
                                <SectionTitle label="Close out" color={BRAND.emerald} />
                                <p className="text-[11px] text-gray-500">
                                    Mark the request resolved once the promised action has actually been completed.
                                </p>
                                <TextField
                                    label="Closing note (optional)"
                                    value={responseMessage}
                                    onChange={(event) => setResponseMessage(event.target.value)}
                                    multiline
                                    minRows={2}
                                    size="small"
                                    sx={FIELD_SX}
                                />
                                <Button
                                    onClick={() => resolveRequest(request.requestId, responseMessage.trim() || undefined)
                                        .then((res) => apply(res, () => setResponseMessage("")))}
                                    disabled={submitting}
                                    size="small"
                                    variant="contained"
                                    startIcon={<Check size={12} />}
                                    sx={{
                                        alignSelf: "flex-end",
                                        textTransform: "none", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 600,
                                        backgroundColor: BRAND.emerald, "&:hover": { backgroundColor: "#059669" },
                                    }}
                                >
                                    Mark resolved
                                </Button>
                            </div>
                        </Surface>
                    ) : null}

                    {/* Progress note — available for any request that is not already closed negatively */}
                    {request.requestStatus !== "withdrawn" && (
                        <Surface accent={BRAND.primary}>
                            <div className="p-3 flex flex-col gap-2">
                                <SectionTitle label="Add a progress note" color={BRAND.primary} />
                                <TextField
                                    label="Note visible in the student's status history"
                                    value={note}
                                    onChange={(event) => setNote(event.target.value)}
                                    multiline
                                    minRows={2}
                                    size="small"
                                    sx={FIELD_SX}
                                />
                                <Button
                                    onClick={() => {
                                        if (!note.trim()) {
                                            toast.error("Write a note first");
                                            return;
                                        }
                                        addRequestTimelineNote(request.requestId, note.trim())
                                            .then((res) => apply(res, () => setNote("")));
                                    }}
                                    disabled={submitting}
                                    size="small"
                                    variant="contained"
                                    startIcon={<MessageSquarePlus size={12} />}
                                    sx={{
                                        alignSelf: "flex-end",
                                        textTransform: "none", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 600,
                                        backgroundColor: BRAND.primary, "&:hover": { backgroundColor: "#007fd4" },
                                    }}
                                >
                                    Add note
                                </Button>
                            </div>
                        </Surface>
                    )}
                </div>
            </div>
        </div>
    );
}
