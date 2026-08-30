"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TrainerDashboardLayout from "@/layouts/TrainerDashboardLayout";
import { useTrainer, type TrainerBatchListItem } from "@/contexts/TrainerContext";
import {
    Box,
    Chip,
    InputAdornment,
    LinearProgress,
    MenuItem,
    Paper,
    Skeleton,
    TextField,
    Typography,
} from "@mui/material";
import {
    MdOutlineCalendarMonth,
    MdOutlineClass,
    MdOutlineEventNote,
    MdOutlineGroups,
    MdOutlineLocationOn,
    MdOutlineSchool,
    MdOutlineSearch,
    MdOutlineWatchLater,
} from "react-icons/md";

const ACCENTS = [
    { color: "#009DFF", bg: "#e0f2fe" },
    { color: "#7c3aed", bg: "#ede9fe" },
    { color: "#059669", bg: "#d1fae5" },
    { color: "#ea6e0b", bg: "#ffedd5" },
    { color: "#06b6d4", bg: "#cffafe" },
    { color: "#f43f5e", bg: "#ffe4e6" },
];

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatTime(value: string | null) {
    if (!value) return null;
    return new Date(value).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

export default function TrainerBatchesPage() {
    const router = useRouter();
    const { batches, loadingBatches, getBatches } = useTrainer();

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<"all" | "active" | "inactive">("all");

    useEffect(() => {
        getBatches();
    }, [getBatches]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return batches.filter((batch) => {
            if (status === "active" && !batch.isActive) return false;
            if (status === "inactive" && batch.isActive) return false;
            if (!term) return true;
            return (
                batch.batchName.toLowerCase().includes(term) ||
                batch.course.courseName.toLowerCase().includes(term)
            );
        });
    }, [batches, search, status]);

    const totalStudents = batches.reduce((sum, batch) => sum + batch.totalStudents, 0);
    const activeCount = batches.filter((batch) => batch.isActive).length;

    return (
        <TrainerDashboardLayout title="My Batches">
            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.5, sm: 2.5 } }}>

                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 2,
                        border: "1px solid #0284c7",
                        background: "linear-gradient(120deg, #009DFF 0%, #0284c7 50%, #7c3aed 100%)",
                        color: "#ffffff",
                        p: { xs: 1.75, sm: 2.5 },
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.5,
                    }}
                >
                    <Box>
                        <Typography sx={{ fontSize: { xs: 18, sm: 22 }, fontWeight: 800, lineHeight: 1.2 }}>
                            My Batches
                        </Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 500, mt: .25 }}>
                            Batches assigned to you across all your courses
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Chip size="small" icon={<MdOutlineClass size={15} color="#ffffff" />} label={`${batches.length} total`} sx={{ backgroundColor: "#0369a1", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }} />
                        <Chip size="small" label={`${activeCount} active`} sx={{ backgroundColor: "#10b981", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }} />
                        <Chip size="small" icon={<MdOutlineGroups size={15} color="#ffffff" />} label={`${totalStudents} students`} sx={{ backgroundColor: "#6d28d9", color: "#ffffff", fontWeight: 700, border: "1px solid #ffffff" }} />
                    </Box>
                </Paper>

                <Paper
                    elevation={0}
                    sx={{ borderRadius: 2, border: "1px solid #7c3aed", backgroundColor: "#ffffff", p: { xs: 1.25, sm: 1.5 }, display: "flex", gap: 1, flexWrap: "wrap" }}
                >
                    <TextField
                        size="small"
                        placeholder="Search batch or course"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ flex: 1, minWidth: 200 }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <MdOutlineSearch color="#7c3aed" />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                    <TextField
                        select
                        size="small"
                        label="Status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as typeof status)}
                        sx={{ minWidth: 140 }}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                    </TextField>
                </Paper>

                {loadingBatches && batches.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                        {[0, 1, 2, 3].map((key) => (
                            <Skeleton key={key} variant="rounded" height={190} />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #cbd5e1", py: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        <MdOutlineSchool size={38} color="#94a3b8" />
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#475569" }}>No batches found</Typography>
                        <Typography sx={{ fontSize: 12, color: "#64748b" }}>Try changing the search or status filter.</Typography>
                    </Paper>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                        {filtered.map((batch, index) => (
                            <BatchCard
                                key={batch.batchId}
                                batch={batch}
                                accent={ACCENTS[index % ACCENTS.length]}
                                onOpen={() => router.push(`/dashboard/trainer/my-batches/${batch.batchId}`)}
                            />
                        ))}
                    </div>
                )}
            </Box>
        </TrainerDashboardLayout>
    );
}

type BatchCardProps = {
    batch: TrainerBatchListItem;
    accent: { color: string; bg: string };
    onOpen: () => void;
};

function BatchCard({ batch, accent, onOpen }: BatchCardProps) {
    const seatsFilled = batch.totalSeats
        ? Math.min(100, Math.round(((batch.totalSeats - (batch.availableSeats ?? 0)) / batch.totalSeats) * 100))
        : null;
    const timing = batch.classTiming
        ?? [formatTime(batch.classStartTime), formatTime(batch.classEndTime)].filter(Boolean).join(" - ");

    return (
        <Paper
            elevation={0}
            onClick={onOpen}
            sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                border: `1px solid ${accent.color}`,
                backgroundColor: "#ffffff",
                cursor: "pointer",
                transition: "box-shadow .2s ease, transform .2s ease",
                "&:hover": { boxShadow: `0 10px 24px ${accent.bg}`, transform: "translateY(-3px)" },
                display: "flex",
                flexDirection: "column",
                gap: 1,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
                <Box sx={{ width: 36, height: 36, flexShrink: 0, borderRadius: 1.5, backgroundColor: accent.bg, color: accent.color, display: "grid", placeItems: "center", fontSize: 20 }}>
                    <MdOutlineClass />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#1e293b" }} noWrap>
                        {batch.batchName}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#64748b" }} noWrap>
                        {batch.course.courseName}
                    </Typography>
                </Box>
                <Chip
                    size="small"
                    label={batch.isActive ? "Active" : "Inactive"}
                    sx={{
                        height: 22,
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: batch.isActive ? "#d1fae5" : "#ffe4e6",
                        color: batch.isActive ? "#059669" : "#f43f5e",
                        border: `1px solid ${batch.isActive ? "#10b981" : "#f43f5e"}`,
                    }}
                />
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: .75 }}>
                <Chip size="small" icon={<MdOutlineGroups size={14} color="#0369a1" />} label={`${batch.totalStudents} students`} sx={{ height: 22, fontSize: 11, fontWeight: 600, backgroundColor: "#e0f2fe", color: "#0369a1", border: "1px solid #0284c7" }} />
                <Chip size="small" icon={<MdOutlineEventNote size={14} color="#6d28d9" />} label={`${batch.totalSessions} sessions`} sx={{ height: 22, fontSize: 11, fontWeight: 600, backgroundColor: "#ede9fe", color: "#6d28d9", border: "1px solid #7c3aed" }} />
                {batch.mode && (
                    <Chip size="small" label={batch.mode} sx={{ height: 22, fontSize: 11, fontWeight: 600, backgroundColor: "#cffafe", color: "#0e7490", border: "1px solid #06b6d4" }} />
                )}
                {batch.classRoomNumber && (
                    <Chip size="small" icon={<MdOutlineLocationOn size={14} color="#ea6e0b" />} label={batch.classRoomNumber} sx={{ height: 22, fontSize: 11, fontWeight: 600, backgroundColor: "#ffedd5", color: "#ea6e0b", border: "1px solid #f97316" }} />
                )}
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, color: "#475569" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: .5 }}>
                    <MdOutlineCalendarMonth color="#64748b" />
                    <Typography sx={{ fontSize: 11.5, fontWeight: 600 }}>
                        {formatDate(batch.batchStartDate)} - {formatDate(batch.batchEndDate)}
                    </Typography>
                </Box>
                {timing && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: .5 }}>
                        <MdOutlineWatchLater color="#64748b" />
                        <Typography sx={{ fontSize: 11.5, fontWeight: 600 }}>{timing}</Typography>
                    </Box>
                )}
            </Box>

            {batch.batchDays.length > 0 && (
                <Box sx={{ display: "flex", gap: .5, flexWrap: "wrap" }}>
                    {batch.batchDays.map((day) => (
                        <Box
                            key={day}
                            sx={{
                                px: .75,
                                py: .25,
                                borderRadius: .75,
                                fontSize: 10,
                                fontWeight: 700,
                                backgroundColor: accent.bg,
                                color: accent.color,
                                border: `1px solid ${accent.color}`,
                            }}
                        >
                            {day.slice(0, 3)}
                        </Box>
                    ))}
                </Box>
            )}

            {seatsFilled !== null && (
                <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: .25 }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Seats filled</Typography>
                        <Typography sx={{ fontSize: 11, fontWeight: 800, color: accent.color }}>
                            {batch.totalSeats! - (batch.availableSeats ?? 0)}/{batch.totalSeats}
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={seatsFilled}
                        sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: accent.bg,
                            "& .MuiLinearProgress-bar": { backgroundColor: accent.color, borderRadius: 3 },
                        }}
                    />
                </Box>
            )}
        </Paper>
    );
}