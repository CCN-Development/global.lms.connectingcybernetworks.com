"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, ButtonBase, CircularProgress, InputBase, Snackbar, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import BatchCard, { type ExploreCardStatus } from "@/components/batches/BatchCard";
import AskAboutBatchModal from "@/components/batches/AskAboutBatchModal";
import BatchFeedbackModal, { buildRejectionHistory, FALLBACK_REJECTION_REASON } from "@/components/batches/BatchFeedbackModal";
import ExploreFiltersModal, {
    countFilters, EMPTY_FILTERS, type ExploreFilterKey, type ExploreFilters,
} from "@/components/batches/ExploreFiltersModal";
import RequestSeatModal from "@/components/batches/RequestSeatModal";
import RequestSuccessModal from "@/components/batches/RequestSuccessModal";
import ViewBatchQueryModal from "@/components/batches/ViewBatchQueryModal";
import { CARD_GRID_SX, EmptyBatches, FONT_INTER, FONT_POPPINS } from "@/components/batches/batch-card-ui";
import {
    daysFromToday, formatEventDay, formatUTCClock, formatUTCDayMonth, MONTH_SHORT, normalizeMode, type BatchMode,
} from "@/components/batches/batch-format";
import { useStudent, type AvailableBatch } from "@/contexts/StudentContext";

// ── Display helpers ───────────────────────────────────────────────────────────

const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LONG: Record<string, string> = {
    mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday",
};

function formatBatchTime(batch: AvailableBatch): string {
    const start = batch.classStartTime ? formatUTCClock(batch.classStartTime) : "";
    const end = batch.classEndTime ? formatUTCClock(batch.classEndTime) : "";
    if (start && end) return `${start} - ${end}`;
    return start || batch.classTiming || "Not scheduled";
}

/** Consecutive days read as a range ("Tuesday - Friday"); anything else as a short list. */
function formatBatchDays(batchDays: string[]): string {
    const days = (batchDays ?? [])
        .map((day) => day.trim().toLowerCase().slice(0, 3))
        .filter((day) => DAY_ORDER.includes(day))
        .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
    if (days.length === 0) return "Not scheduled";
    if (days.length === 1) return DAY_LONG[days[0]];
    const consecutive = days.every((day, i) => i === 0 || DAY_ORDER.indexOf(day) === DAY_ORDER.indexOf(days[i - 1]) + 1);
    if (consecutive && days.length > 2) return `${DAY_LONG[days[0]]} - ${DAY_LONG[days[days.length - 1]]}`;
    return days.map((day) => DAY_LONG[day].slice(0, 3)).join(", ");
}

function durationInMonths(batch: AvailableBatch): number {
    if (batch.course?.durationInMonths) return batch.course.durationInMonths;
    const start = new Date(batch.batchStartDate).getTime();
    const end = new Date(batch.batchEndDate).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
    return (end - start) / (1000 * 60 * 60 * 24 * 30.44);
}

function formatDuration(batch: AvailableBatch): string {
    const months = durationInMonths(batch);
    if (months <= 0) return "—";
    if (months < 1) {
        const weeks = Math.max(1, Math.round(months * 4.33));
        return `${weeks} week${weeks !== 1 ? "s" : ""}`;
    }
    const rounded = Math.round(months * 10) / 10;
    return `${rounded} month${rounded !== 1 ? "s" : ""}`;
}

function getTimeSlot(batch: AvailableBatch): "Morning" | "Afternoon" | "Evening" | null {
    const date = batch.classStartTime ? new Date(batch.classStartTime) : null;
    if (!date || Number.isNaN(date.getTime())) return null;
    const hours = date.getUTCHours();
    if (hours < 12) return "Morning";
    if (hours < 17) return "Afternoon";
    return "Evening";
}

function startMonthLabel(batch: AvailableBatch): string {
    const date = new Date(batch.batchStartDate);
    return Number.isNaN(date.getTime()) ? "" : `${MONTH_SHORT[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function cardStatus(batch: AvailableBatch): ExploreCardStatus {
    const requestStatus = batch.myRequest?.requestStatus;
    if (batch.isEnrolled || requestStatus === "approved") return "enrolled";
    if (requestStatus === "pending") return "pending";
    if (requestStatus === "rejected") return "rejected";
    return "available";
}

function startsIn(batch: AvailableBatch): string {
    const days = daysFromToday(batch.batchStartDate);
    if (days === null) return "";
    if (days <= 0) return "started";
    if (days === 1) return "starts tomorrow";
    return `starts in ${days} days`;
}

function statusNote(batch: AvailableBatch, status: ExploreCardStatus): string | undefined {
    const request = batch.myRequest;
    if (status === "pending" && request) return `Requested ${formatEventDay(request.createdAt)} · awaiting approval`;
    if (status === "enrolled") {
        return request?.requestStatus === "approved"
            ? `Approved ${formatEventDay(request.updatedAt)} · ${startsIn(batch)}`
            : `Enrolled · ${startsIn(batch)}`;
    }
    if (status === "rejected" && request) {
        const reason = request.requestReason?.trim().split(/[.\n]/)[0];
        return `Rejected ${formatEventDay(request.updatedAt)} · ${reason ? reason.charAt(0).toLowerCase() + reason.slice(1) : "not approved"}`;
    }
    return undefined;
}

function dateRange(batch: AvailableBatch): string {
    return `${formatUTCDayMonth(batch.batchStartDate)} – ${formatUTCDayMonth(batch.batchEndDate)}`;
}

const SEAT_OPTIONS = ["Few (≤5)", "6–10", "11+"];
const DURATION_OPTIONS = ["≤ 1 month", "1–3 months", "3+ months"];

function matchesFilters(batch: AvailableBatch, filters: ExploreFilters): boolean {
    const any = (key: ExploreFilterKey, test: (option: string) => boolean) =>
        filters[key].length === 0 || filters[key].some(test);
    const seats = batch.availableSeats ?? 0;
    const months = durationInMonths(batch);
    return any("mode", (option) => normalizeMode(batch.mode) === option)
        && any("starts", (option) => startMonthLabel(batch) === option)
        && any("time", (option) => getTimeSlot(batch) === option)
        && any("seats", (option) =>
            option === "Few (≤5)" ? seats <= 5 : option === "6–10" ? seats >= 6 && seats <= 10 : seats >= 11)
        && any("duration", (option) =>
            option === "≤ 1 month" ? months <= 1 : option === "1–3 months" ? months > 1 && months <= 3 : months > 3);
}

const PILL_SX = {
    height: 44,
    display: "flex",
    alignItems: "center",
    gap: "12px",
    px: "19px",
    borderRadius: "99px",
    border: "1px solid #e3e9f8",
    backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(153,153,153,0.16) 100%)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
};

// ── Page ──────────────────────────────────────────────────────────────────────

type ModalState =
    | { kind: "request"; batch: AvailableBatch }
    | { kind: "ask"; batch: AvailableBatch }
    | { kind: "query"; batch: AvailableBatch }
    | { kind: "rejection"; batch: AvailableBatch }
    | { kind: "filters" }
    | { kind: "success" }
    | null;

export default function ExploreBatchesPage() {
    const router = useRouter();
    const { availableBatches, loadingAvailableBatches, getAvailableBatches, createBatchRequest, createBatchQuery } = useStudent();

    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<ExploreFilters>(EMPTY_FILTERS);
    const [modal, setModal] = useState<ModalState>(null);
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        getAvailableBatches();
    }, [getAvailableBatches]);

    const filterOptions = useMemo(() => {
        const months = [...new Map(availableBatches
            .map((batch) => [startMonthLabel(batch), new Date(batch.batchStartDate).getTime()] as const)
            .filter(([label]) => label)).entries()]
            .sort(([, a], [, b]) => a - b)
            .map(([label]) => label);
        return [
            { key: "mode" as const, label: "Mode", options: ["Online", "Offline", "Hybrid"] },
            { key: "starts" as const, label: "Starts", options: months },
            { key: "time" as const, label: "Time", options: ["Morning", "Afternoon", "Evening"] },
            { key: "seats" as const, label: "Seats", options: SEAT_OPTIONS },
            { key: "duration" as const, label: "Duration", options: DURATION_OPTIONS },
        ];
    }, [availableBatches]);

    const activeCount = countFilters(filters);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return availableBatches.filter((batch) =>
            (!term || `${batch.course?.courseName ?? ""} ${batch.batchName}`.toLowerCase().includes(term))
            && matchesFilters(batch, filters));
    }, [availableBatches, search, filters]);

    const closeModal = useCallback(() => setModal(null), []);

    const handleRequestSeat = async (batch: AvailableBatch, mode: BatchMode) => {
        const res = await createBatchRequest({ batchId: batch.batchId, modeRequested: mode });
        if (!res.success) {
            setNotice(res.message || "Could not send your request. Please try again.");
            return;
        }
        setModal({ kind: "success" });
        await getAvailableBatches();
    };

    const handleAskQuery = async (batch: AvailableBatch, queryType: string, queryText: string) => {
        const res = await createBatchQuery({ batchId: batch.batchId, queryType, queryText });
        setNotice(res.success ? "Your query has been sent to the coordinator." : res.message || "Could not send your query.");
        if (res.success) await getAvailableBatches();
    };

    const title = (batch: AvailableBatch) => batch.course?.courseName ?? batch.batchName;
    // Keep the last batch around so modal content doesn't blank out during the close animation.
    const [lastBatch, setLastBatch] = useState<AvailableBatch | null>(null);
    const currentBatch = modal && "batch" in modal ? modal.batch : null;
    if (currentBatch && currentBatch !== lastBatch) setLastBatch(currentBatch);
    const selectedBatch = currentBatch ?? lastBatch;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {/* Hero banner — the artwork is the exported Figma banner (gradient + light waves) */}
            <Box
                sx={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: "32px",
                    bgcolor: "#03060c",
                    backgroundImage: "url('/batched-hero-banner.webp')",
                    backgroundSize: "cover",
                    backgroundPosition: "center top",
                    minHeight: 229,
                    p: { xs: "24px 16px", md: "40px" },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "24px",
                    textAlign: "center",
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
                    <Typography sx={{ fontFamily: FONT_POPPINS, fontWeight: 600, fontSize: { xs: "20px", md: "28px" }, lineHeight: { xs: "30px", md: "42px" }, color: "#f2f2f2" }}>
                        Find the right batch that fits your schedule.
                    </Typography>
                    <Typography sx={{ fontFamily: FONT_INTER, fontSize: { xs: "14px", md: "16px" }, lineHeight: "24px", color: "#bfbfbf" }}>
                        Browse available batches, compare schedules, and register in a few clicks.
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", maxWidth: 561 }}>
                    <Box sx={{ ...PILL_SX, flex: 1, minWidth: 0 }}>
                        <Box component="img" src="/batches/explore/icon-search.svg" alt="" aria-hidden sx={{ width: 20, height: 20, flexShrink: 0 }} />
                        <InputBase
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by course name…"
                            inputProps={{ "aria-label": "Search by course name" }}
                            sx={{
                                flex: 1,
                                fontFamily: FONT_INTER,
                                fontSize: "14px",
                                lineHeight: "21px",
                                color: "#f2f2f2",
                                "& input::placeholder": { color: "#8c8c8c", opacity: 1 },
                            }}
                        />
                    </Box>
                    <ButtonBase onClick={() => setModal({ kind: "filters" })} sx={{ ...PILL_SX, flexShrink: 0 }}>
                        <Box component="img" src="/batches/explore/icon-filters.svg" alt="" aria-hidden sx={{ width: 16, height: 16 }} />
                        <Typography sx={{ fontFamily: FONT_INTER, fontSize: "14px", lineHeight: "21px", color: "#f2f2f2", whiteSpace: "nowrap" }}>
                            Filters{activeCount > 0 ? ` (${activeCount})` : ""}
                        </Typography>
                    </ButtonBase>
                </Box>
            </Box>

            {/* Batches */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <Typography sx={{ fontFamily: FONT_INTER, fontWeight: 500, fontSize: "18px", lineHeight: "27px", color: "#a6a6a6" }}>
                    Recently Added Batches
                </Typography>

                {loadingAvailableBatches ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                        <CircularProgress size={24} sx={{ color: "#7c3aed" }} />
                    </Box>
                ) : filtered.length === 0 ? (
                    <EmptyBatches message={search || activeCount > 0 ? "No batches match your filters." : "No batches available."} />
                ) : (
                    <Box sx={{ ...CARD_GRID_SX, rowGap: "24px" }}>
                        {filtered.map((batch) => {
                            const status = cardStatus(batch);
                            const start = new Date(batch.batchStartDate);
                            const end = new Date(batch.batchEndDate);
                            return (
                                <BatchCard
                                    key={batch.batchId}
                                    variant="explore"
                                    title={title(batch)}
                                    mode={normalizeMode(batch.mode)}
                                    trainers={batch.batchTrainers.map((item) => ({ name: item.trainer.trainerName }))}
                                    startMonth={MONTH_SHORT[start.getUTCMonth()] ?? ""}
                                    startDay={start.getUTCDate()}
                                    endMonth={MONTH_SHORT[end.getUTCMonth()] ?? ""}
                                    endDay={end.getUTCDate()}
                                    duration={formatDuration(batch)}
                                    batchTime={formatBatchTime(batch)}
                                    batchDays={formatBatchDays(batch.batchDays)}
                                    seatsLeft={batch.availableSeats ?? 0}
                                    status={status}
                                    statusNote={statusNote(batch, status)}
                                    onViewDetails={() => router.push(`/dashboard/student/batch/${batch.batchId}`)}
                                    onRequestSeat={() => setModal({ kind: "request", batch })}
                                    onAskAboutBatch={() => setModal({ kind: batch.myQuery ? "query" : "ask", batch })}
                                    // TODO(backend): there is no student endpoint to withdraw a batch request yet.
                                    onWithdraw={() => setNotice("Withdrawing a request isn’t available yet — please contact your coordinator.")}
                                    onViewInMyBatches={() => router.push(status === "pending" ? "/dashboard/student/batches/upcoming" : "/dashboard/student/batches")}
                                    onRequestHistory={() => router.push("/dashboard/student/batches/rejected")}
                                    onReasonForRejection={() => setModal({ kind: "rejection", batch })}
                                />
                            );
                        })}
                    </Box>
                )}
            </Box>

            {/* ── Modals ── */}
            <RequestSeatModal
                open={modal?.kind === "request"}
                onClose={closeModal}
                batchTitle={selectedBatch ? title(selectedBatch) : ""}
                seatsLeft={selectedBatch?.availableSeats ?? undefined}
                defaultMode={selectedBatch ? normalizeMode(selectedBatch.mode) : "Offline"}
                onSubmit={(mode) => { if (selectedBatch) void handleRequestSeat(selectedBatch, mode); }}
            />

            <AskAboutBatchModal
                open={modal?.kind === "ask"}
                onClose={closeModal}
                batchTitle={selectedBatch ? title(selectedBatch) : undefined}
                dateRange={selectedBatch ? dateRange(selectedBatch) : undefined}
                onSubmit={(queryType, message) => { if (selectedBatch) void handleAskQuery(selectedBatch, queryType, message); }}
            />

            {modal?.kind === "query" && modal.batch.myQuery && (
                <ViewBatchQueryModal
                    open
                    onClose={closeModal}
                    queryType={modal.batch.myQuery.queryType}
                    queryText={modal.batch.myQuery.queryText}
                    queryStatus={modal.batch.myQuery.queryStatus}
                    queryResponse={modal.batch.myQuery.queryResponse}
                    askedAt={modal.batch.myQuery.createdAt}
                    updatedAt={modal.batch.myQuery.updatedAt}
                    // TODO(backend): there is no student endpoint to withdraw a batch query yet.
                    onWithdraw={() => setNotice("Withdrawing a query isn’t available yet — please contact your coordinator.")}
                    onFollowUp={() => setModal({ kind: "ask", batch: modal.batch })}
                />
            )}

            {modal?.kind === "rejection" && modal.batch.myRequest && (
                <BatchFeedbackModal
                    open
                    onClose={closeModal}
                    history={buildRejectionHistory(modal.batch.myRequest)}
                    rejectionReason={modal.batch.myRequest.requestReason?.trim() || FALLBACK_REJECTION_REASON}
                />
            )}

            <ExploreFiltersModal
                open={modal?.kind === "filters"}
                onClose={closeModal}
                value={filters}
                options={filterOptions}
                onApply={setFilters}
            />

            <RequestSuccessModal
                open={modal?.kind === "success"}
                onClose={closeModal}
                onGoToBatches={() => {
                    closeModal();
                    router.push("/dashboard/student/batches/upcoming");
                }}
            />

            <Snackbar
                open={Boolean(notice)}
                autoHideDuration={4000}
                onClose={() => setNotice(null)}
                message={notice}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            />
        </Box>
    );
}
