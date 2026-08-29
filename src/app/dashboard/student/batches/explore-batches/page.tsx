"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Box, Typography, InputAdornment, TextField, Button, Collapse, CircularProgress } from "@mui/material";
import { MdSearch, MdFilterList, MdClose } from "react-icons/md";
import { useRouter } from "next/navigation";
import BatchCard from "@/components/batches/BatchCard";
import RequestSuccessModal from "@/components/batches/RequestSuccessModal";
import { useStudent, type AvailableBatch } from "@/contexts/StudentContext";

// ── Filter helpers ───────────────────────────────────────────────────────────

const MONTH_ORDER = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const DAY_LABELS: Record<string, string> = {
    sun: "Sun", mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat",
};

type BatchMode = "Online" | "Offline" | "Hybrid";

function normalizeMode(mode: string | null): BatchMode {
    const value = (mode ?? "").trim().toLowerCase();
    if (value === "offline") return "Offline";
    if (value === "hybrid") return "Hybrid";
    return "Online";
}

/** Clock times are persisted as 1970-01-01T{HH:mm}Z, so they must be read in UTC. */
function formatClockTime(iso: string | null): string | null {
    const date = iso ? new Date(iso) : null;
    if (!date || Number.isNaN(date.getTime())) return null;
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const suffix = hours >= 12 ? "PM" : "AM";
    return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function formatBatchTime(batch: AvailableBatch): string {
    const start = formatClockTime(batch.classStartTime);
    const end = formatClockTime(batch.classEndTime);
    if (start && end) return `${start} – ${end}`;
    return start ?? batch.classTiming ?? "Not scheduled";
}

function formatBatchDays(batchDays: string[]): string {
    if (!batchDays?.length) return "Not scheduled";
    return batchDays
        .map((day) => DAY_LABELS[day.trim().toLowerCase().slice(0, 3)] ?? day)
        .join(" – ");
}

function getTimeSlot(batch: AvailableBatch): "Morning" | "Afternoon" | "Evening" | null {
    const date = batch.classStartTime ? new Date(batch.classStartTime) : null;
    if (!date || Number.isNaN(date.getTime())) return null;
    const hours = date.getUTCHours();
    if (hours < 12) return "Morning";
    if (hours < 17) return "Afternoon";
    return "Evening";
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

function formatDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    const month = MONTH_ORDER[date.getUTCMonth()];
    return `${date.getUTCDate()} ${month[0]}${month.slice(1).toLowerCase()} ${date.getUTCFullYear()}`;
}

// ── Filter chip ───────────────────────────────────────────────────────────────

const FilterChip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <Box
        onClick={onClick}
        sx={{
            px: 1.25, py: "3px",
            borderRadius: "20px",
            border: active ? "1px solid #7c3aed" : "1px solid rgba(255,255,255,0.12)",
            bgcolor: active ? "rgba(124,58,237,0.22)" : "transparent",
            color: active ? "#c4b5fd" : "rgba(255,255,255,0.48)",
            fontSize: "0.7rem",
            fontWeight: active ? 700 : 500,
            cursor: "pointer",
            whiteSpace: "nowrap",
            userSelect: "none",
            transition: "all 0.15s ease",
            "&:hover": { border: "1px solid rgba(124,58,237,0.45)", color: "#d8b4fe" },
        }}
    >
        {label}
    </Box>
);

const FilterRow = ({ label, options, value, onChange }: {
    label: string; options: string[]; value: string; onChange: (v: string) => void;
}) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.28)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", minWidth: 56, flexShrink: 0 }}>
            {label}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {options.map((opt) => (
                <FilterChip key={opt} label={opt} active={value === opt} onClick={() => onChange(value === opt && opt !== "All" ? "All" : opt)} />
            ))}
        </Box>
    </Box>
);

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ExploreBatchesPage() {
    const router = useRouter();
    const { availableBatches, loadingAvailableBatches, getAvailableBatches, createBatchRequest, createBatchQuery } = useStudent();

    const [search, setSearch] = useState("");
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterMode, setFilterMode] = useState("All");
    const [filterMonth, setFilterMonth] = useState("All");
    const [filterTime, setFilterTime] = useState("All");
    const [filterSeats, setFilterSeats] = useState("All");
    const [filterDuration, setFilterDuration] = useState("All");
    const [successBatchTitle, setSuccessBatchTitle] = useState<string | null>(null);

    useEffect(() => {
        getAvailableBatches();
    }, [getAvailableBatches]);

    const allMonths = useMemo(() => {
        const present = new Set(availableBatches.map((b) => MONTH_ORDER[new Date(b.batchStartDate).getMonth()]));
        return MONTH_ORDER.filter((m) => present.has(m));
    }, [availableBatches]);

    const activeCount = [filterMode, filterMonth, filterTime, filterSeats, filterDuration].filter((f) => f !== "All").length;

    const clearFilters = () => {
        setFilterMode("All"); setFilterMonth("All"); setFilterTime("All");
        setFilterSeats("All"); setFilterDuration("All");
    };

    const filtered = useMemo(() => availableBatches.filter((b) => {
        const term = search.trim().toLowerCase();
        if (term && !`${b.course?.courseName ?? ""} ${b.batchName}`.toLowerCase().includes(term)) return false;
        if (filterMode !== "All" && normalizeMode(b.mode) !== filterMode) return false;
        if (filterMonth !== "All" && MONTH_ORDER[new Date(b.batchStartDate).getMonth()] !== filterMonth) return false;
        if (filterTime !== "All" && getTimeSlot(b) !== filterTime) return false;
        if (filterSeats !== "All") {
            const seats = b.availableSeats ?? 0;
            if (filterSeats === "Few (≤5)" && seats > 5) return false;
            if (filterSeats === "6–10" && (seats < 6 || seats > 10)) return false;
            if (filterSeats === "11+" && seats < 11) return false;
        }
        if (filterDuration !== "All") {
            const months = durationInMonths(b);
            if (filterDuration === "≤ 1 month" && months > 1) return false;
            if (filterDuration === "1–3 months" && (months <= 1 || months > 3)) return false;
            if (filterDuration === "3+ months" && months <= 3) return false;
        }
        return true;
    }), [availableBatches, search, filterMode, filterMonth, filterTime, filterSeats, filterDuration]);

    const handleRequestSeat = async (batch: AvailableBatch, mode: BatchMode) => {
        const res = await createBatchRequest({ batchId: batch.batchId, modeRequested: mode });
        if (!res.success) return;
        setSuccessBatchTitle(batch.course?.courseName ?? batch.batchName);
        await getAvailableBatches();
    };

    const handleAskQuery = async (batch: AvailableBatch, queryType: string, queryText: string) => {
        const res = await createBatchQuery({ batchId: batch.batchId, queryType, queryText });
        if (res.success) await getAvailableBatches();
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Hero Banner */}
            <Box sx={{
                borderRadius: "16px",
                overflow: "hidden",
                position: "relative",
                background: "url('/batched-hero-banner.webp') center/cover no-repeat",
                border: "1px solid rgba(120,80,200,0.22)",
                py: { xs: 3, md: 6 },
                px: { xs: 2, md: 4 },
                textAlign: "center",
            }}>
                {/* Glow blobs */}
                <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
                    <Box sx={{ position: "absolute", top: "-40%", left: "-10%", width: "55%", height: "220%", background: "radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, transparent 70%)", filter: "blur(32px)" }} />
                    <Box sx={{ position: "absolute", bottom: "-40%", right: "-10%", width: "55%", height: "220%", background: "radial-gradient(ellipse, rgba(59,130,246,0.14) 0%, transparent 70%)", filter: "blur(32px)" }} />
                </Box>

                <Typography sx={{ fontSize: { xs: "1rem", md: "1.25rem" }, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", mb: 0.75, position: "relative" }}>
                    Find the right batch that fits your schedule.
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", mb: 2.25, position: "relative" }}>
                    Browse available batches, compare schedules, and register in a few clicks.
                </Typography>

                {/* Search + Filter */}
                <Box sx={{ maxWidth: 480, mx: "auto", position: "relative" }}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <TextField
                            placeholder="Search by course name..."
                            size="small"
                            fullWidth
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <MdSearch size={15} style={{ color: "rgba(255,255,255,0.38)" }} />
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        bgcolor: "rgba(255,255,255,0.08)",
                                        borderRadius: "10px",
                                        color: "#fff",
                                        fontSize: "0.78rem",
                                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.12)" },
                                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.25)" },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(139,92,246,0.5)" },
                                    },
                                },
                                htmlInput: { style: { color: "#fff", fontSize: "0.78rem" } },
                            }}
                        />
                        <Button
                            variant="outlined"
                            startIcon={<MdFilterList size={14} />}
                            onClick={() => setFilterOpen((p) => !p)}
                            sx={{
                                border: filterOpen || activeCount > 0 ? "1px solid rgba(124,58,237,0.6)" : "1px solid rgba(255,255,255,0.22)",
                                color: filterOpen || activeCount > 0 ? "#c4b5fd" : "#fff",
                                bgcolor: filterOpen || activeCount > 0 ? "rgba(124,58,237,0.1)" : "transparent",
                                borderRadius: "10px",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                textTransform: "none",
                                px: 1.75,
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                                minWidth: 0,
                                "&:hover": { bgcolor: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.6)" },
                            }}
                        >
                            Filters
                            {activeCount > 0 && (
                                <Box sx={{ bgcolor: "#7c3aed", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: "0.6rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", ml: 0.5 }}>
                                    {activeCount}
                                </Box>
                            )}
                        </Button>
                    </Box>

                    {/* Filter panel */}
                    <Collapse in={filterOpen}>
                        <Box sx={{ mt: 1.5, p: "12px 14px", bgcolor: "rgba(0,0,0,0.4)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(10px)", display: "flex", flexDirection: "column", gap: 1.25, textAlign: "left" }}>
                            <FilterRow label="Mode" options={["All", "Online", "Offline", "Hybrid"]} value={filterMode} onChange={setFilterMode} />
                            <FilterRow label="Starts" options={["All", ...allMonths]} value={filterMonth} onChange={setFilterMonth} />
                            <FilterRow label="Time" options={["All", "Morning", "Afternoon", "Evening"]} value={filterTime} onChange={setFilterTime} />
                            <FilterRow label="Seats" options={["All", "Few (≤5)", "6–10", "11+"]} value={filterSeats} onChange={setFilterSeats} />
                            <FilterRow label="Duration" options={["All", "≤ 1 month", "1–3 months", "3+ months"]} value={filterDuration} onChange={setFilterDuration} />
                            {activeCount > 0 && (
                                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.25 }}>
                                    <Box onClick={clearFilters} sx={{ display: "flex", alignItems: "center", gap: 0.4, cursor: "pointer", color: "rgba(255,120,120,0.7)", fontSize: "0.7rem", fontWeight: 600, "&:hover": { color: "#f87171" } }}>
                                        <MdClose size={12} /> Clear all
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Collapse>
                </Box>
            </Box>

            {/* Batch grid */}
            <Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                        Recently Added Batches
                    </Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>
                        {filtered.length} batch{filtered.length !== 1 ? "es" : ""}
                    </Typography>
                </Box>

                {loadingAvailableBatches ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                        <CircularProgress size={24} sx={{ color: "#7c3aed" }} />
                    </Box>
                ) : (
                    <>
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 1.5 }}>
                            {filtered.map((batch) => {
                                const startDate = new Date(batch.batchStartDate);
                                const endDate = new Date(batch.batchEndDate);
                                return (
                                    <BatchCard
                                        key={batch.batchId}
                                        variant="explore"
                                        title={batch.course?.courseName ?? batch.batchName}
                                        mode={normalizeMode(batch.mode)}
                                        trainers={batch.batchTrainers.map((item) => ({ name: item.trainer.trainerName }))}
                                        startMonth={MONTH_ORDER[startDate.getMonth()]}
                                        startDay={startDate.getDate()}
                                        endMonth={MONTH_ORDER[endDate.getMonth()]}
                                        endDay={endDate.getDate()}
                                        duration={formatDuration(batch)}
                                        batchTime={formatBatchTime(batch)}
                                        batchDays={formatBatchDays(batch.batchDays)}
                                        seatsLeft={batch.availableSeats ?? 0}
                                        myRequest={batch.myRequest && {
                                            status: batch.myRequest.requestStatus,
                                            mode: batch.myRequest.modeRequested,
                                            requestedOn: formatDate(batch.myRequest.createdAt),
                                        }}
                                        myQuery={batch.myQuery && {
                                            queryType: batch.myQuery.queryType,
                                            queryText: batch.myQuery.queryText,
                                            queryStatus: batch.myQuery.queryStatus,
                                            queryResponse: batch.myQuery.queryResponse,
                                            askedOn: formatDate(batch.myQuery.createdAt),
                                        }}
                                        onViewDetails={() => router.push(`/dashboard/student/batch/${batch.batchId}`)}
                                        onRequestSeat={(mode) => handleRequestSeat(batch, mode)}
                                        onAskQuery={(queryType, message) => handleAskQuery(batch, queryType, message)}
                                    />
                                );
                            })}
                        </Box>
                        {filtered.length === 0 && (
                            <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", textAlign: "center", py: 4 }}>
                                {search || activeCount > 0 ? "No batches match your filters." : "No batches available."}
                            </Typography>
                        )}
                    </>
                )}
            </Box>

            <RequestSuccessModal
                open={Boolean(successBatchTitle)}
                onClose={() => setSuccessBatchTitle(null)}
                batchTitle={successBatchTitle ?? undefined}
                onGoToBatches={() => {
                    setSuccessBatchTitle(null);
                    router.push("/dashboard/student/batches/upcoming");
                }}
            />
        </Box>
    );
}