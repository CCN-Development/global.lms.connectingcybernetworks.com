"use client";
import React, { useState, useMemo } from "react";
import { Box, Typography, InputAdornment, TextField, Button, Collapse } from "@mui/material";
import { MdSearch, MdFilterList, MdClose } from "react-icons/md";
import BatchCard from "@/components/batches/BatchCard";

const T_ASHISH = [{ name: "Ashish Saini", avatar: "https://cdn-icons-png.flaticon.com/512/1754/1754623.png" }];
const T_KUSHAL = [{ name: "Kushal Korde", avatar: "https://cdn-icons-png.flaticon.com/512/1754/1754623.png" }];
const T_OMKAR = [{ name: "Omkar", avatar: "https://cdn-icons-png.flaticon.com/512/1754/1754623.png" }];
const T_SHIV = [{ name: "Shivkumar Chauhan", avatar: "https://cdn-icons-png.flaticon.com/512/1754/1754623.png" }];

const EXPLORE_BATCHES = [
    { id: 1, title: "Cisco Certified Network Associate", mode: "Offline" as const, startMonth: "AUG", startDay: 5, endMonth: "OCT", endDay: 31, duration: "3 months", batchTime: "11:00 AM – 1:00 PM", batchDays: "Mon – Wed – Fri", seatsLeft: 8, trainers: T_KUSHAL },
    { id: 2, title: "Cisco Certified Network Associate", mode: "Online" as const, startMonth: "SEP", startDay: 1, endMonth: "NOV", endDay: 30, duration: "3 months", batchTime: "7:00 PM – 9:00 PM", batchDays: "Tue – Thu", seatsLeft: 14, trainers: T_KUSHAL },
    { id: 3, title: "Ethical Hacking & Penetration Testing", mode: "Online" as const, startMonth: "AUG", startDay: 10, endMonth: "OCT", endDay: 10, duration: "2 months", batchTime: "11:00 AM – 1:00 PM", batchDays: "Mon – Wed – Fri", seatsLeft: 6, trainers: T_OMKAR },
    { id: 4, title: "Ethical Hacking & Penetration Testing", mode: "Hybrid" as const, startMonth: "SEP", startDay: 15, endMonth: "NOV", endDay: 15, duration: "2 months", batchTime: "2:00 PM – 4:00 PM", batchDays: "Sat – Sun", seatsLeft: 2, trainers: T_OMKAR },
    { id: 5, title: "SOC Analyst (Level 1)", mode: "Online" as const, startMonth: "AUG", startDay: 18, endMonth: "OCT", endDay: 31, duration: "2.5 months", batchTime: "10:00 AM – 12:00 PM", batchDays: "Tue – Thu – Sat", seatsLeft: 10, trainers: T_SHIV },
    { id: 6, title: "SOC Analyst (Level 2)", mode: "Online" as const, startMonth: "OCT", startDay: 5, endMonth: "DEC", endDay: 20, duration: "2.5 months", batchTime: "7:00 PM – 9:00 PM", batchDays: "Mon – Wed – Fri", seatsLeft: 12, trainers: T_SHIV },
    { id: 7, title: "Python for Cybersecurity", mode: "Online" as const, startMonth: "AUG", startDay: 4, endMonth: "SEP", endDay: 27, duration: "2 months", batchTime: "6:00 PM – 8:00 PM", batchDays: "Mon – Wed – Fri", seatsLeft: 18, trainers: T_OMKAR },
    { id: 8, title: "Linux for Security Professionals", mode: "Online" as const, startMonth: "SEP", startDay: 8, endMonth: "OCT", endDay: 25, duration: "7 weeks", batchTime: "11:00 AM – 1:00 PM", batchDays: "Tue – Thu", seatsLeft: 9, trainers: T_KUSHAL },
    { id: 9, title: "AWS Cloud Practitioner", mode: "Online" as const, startMonth: "AUG", startDay: 12, endMonth: "OCT", endDay: 5, duration: "2 months", batchTime: "10:00 AM – 12:00 PM", batchDays: "Mon – Wed – Fri", seatsLeft: 15, trainers: T_ASHISH },
    { id: 10, title: "Microsoft Azure Security (AZ-500)", mode: "Online" as const, startMonth: "SEP", startDay: 20, endMonth: "NOV", endDay: 20, duration: "2 months", batchTime: "7:00 PM – 9:00 PM", batchDays: "Tue – Thu – Sat", seatsLeft: 11, trainers: T_ASHISH },
    { id: 11, title: "Cisco Certified Network Professional", mode: "Offline" as const, startMonth: "OCT", startDay: 1, endMonth: "JAN", endDay: 31, duration: "4 months", batchTime: "11:00 AM – 2:00 PM", batchDays: "Mon – Wed – Fri", seatsLeft: 5, trainers: T_KUSHAL },
    { id: 12, title: "Digital Forensics & Incident Response", mode: "Hybrid" as const, startMonth: "SEP", startDay: 5, endMonth: "NOV", endDay: 5, duration: "2 months", batchTime: "10:00 AM – 12:00 PM", batchDays: "Tue – Thu", seatsLeft: 7, trainers: T_SHIV },
    { id: 13, title: "Soft Skills & Communication", mode: "Hybrid" as const, startMonth: "AUG", startDay: 1, endMonth: "AUG", endDay: 31, duration: "1 month", batchTime: "3:00 PM – 5:00 PM", batchDays: "Mon – Wed – Fri", seatsLeft: 20, trainers: T_ASHISH },
    { id: 14, title: "Bug Bounty Hunting (Intermediate)", mode: "Online" as const, startMonth: "OCT", startDay: 10, endMonth: "DEC", endDay: 10, duration: "2 months", batchTime: "8:00 PM – 10:00 PM", batchDays: "Tue – Thu – Sat", seatsLeft: 4, trainers: T_OMKAR },
    { id: 15, title: "CompTIA Security+", mode: "Online" as const, startMonth: "AUG", startDay: 25, endMonth: "OCT", endDay: 25, duration: "2 months", batchTime: "6:00 PM – 8:00 PM", batchDays: "Mon – Wed – Fri", seatsLeft: 13, trainers: T_ASHISH },
    { id: 16, title: "Malware Analysis & Reverse Engineering", mode: "Online" as const, startMonth: "SEP", startDay: 22, endMonth: "NOV", endDay: 22, duration: "2 months", batchTime: "7:00 PM – 9:00 PM", batchDays: "Mon – Wed", seatsLeft: 8, trainers: T_OMKAR },
    { id: 17, title: "Red Team Operations", mode: "Hybrid" as const, startMonth: "OCT", startDay: 15, endMonth: "DEC", endDay: 15, duration: "2 months", batchTime: "10:00 AM – 1:00 PM", batchDays: "Sat – Sun", seatsLeft: 3, trainers: T_OMKAR },
    { id: 18, title: "Cyber Threat Intelligence", mode: "Online" as const, startMonth: "NOV", startDay: 3, endMonth: "JAN", endDay: 10, duration: "2.5 months", batchTime: "7:00 PM – 9:00 PM", batchDays: "Tue – Thu", seatsLeft: 16, trainers: T_SHIV },
    { id: 19, title: "DevSecOps Fundamentals", mode: "Online" as const, startMonth: "AUG", startDay: 20, endMonth: "OCT", endDay: 20, duration: "2 months", batchTime: "11:00 AM – 1:00 PM", batchDays: "Mon – Wed – Fri", seatsLeft: 10, trainers: T_ASHISH },
    { id: 20, title: "Wireless Network Security", mode: "Offline" as const, startMonth: "SEP", startDay: 12, endMonth: "OCT", endDay: 25, duration: "6 weeks", batchTime: "10:00 AM – 12:00 PM", batchDays: "Mon – Wed – Fri", seatsLeft: 6, trainers: T_KUSHAL },
];

// ── Filter helpers ───────────────────────────────────────────────────────────

const MONTH_ORDER = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function getTimeSlot(batchTime: string): "Morning" | "Afternoon" | "Evening" {
    const match = batchTime.match(/^(\d+):00\s*(AM|PM)/i);
    if (!match) return "Morning";
    let h = parseInt(match[1]);
    const m = match[2].toUpperCase();
    if (m === "PM" && h !== 12) h += 12;
    if (m === "AM" && h === 12) h = 0;
    if (h < 12) return "Morning";
    if (h < 17) return "Afternoon";
    return "Evening";
}

function parseDurationMonths(duration: string): number {
    const mo = duration.match(/^([\d.]+)\s*month/i);
    if (mo) return parseFloat(mo[1]);
    const wk = duration.match(/^([\d.]+)\s*week/i);
    if (wk) return parseFloat(wk[1]) / 4.33;
    return 0;
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
    const [search, setSearch] = useState("");
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterMode, setFilterMode] = useState("All");
    const [filterMonth, setFilterMonth] = useState("All");
    const [filterTime, setFilterTime] = useState("All");
    const [filterSeats, setFilterSeats] = useState("All");
    const [filterDuration, setFilterDuration] = useState("All");

    const allMonths = useMemo(
        () => MONTH_ORDER.filter((m) => EXPLORE_BATCHES.some((b) => b.startMonth === m)),
        []
    );

    const activeCount = [filterMode, filterMonth, filterTime, filterSeats, filterDuration].filter((f) => f !== "All").length;

    const clearFilters = () => {
        setFilterMode("All"); setFilterMonth("All"); setFilterTime("All");
        setFilterSeats("All"); setFilterDuration("All");
    };

    const filtered = useMemo(() => EXPLORE_BATCHES.filter((b) => {
        if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterMode !== "All" && b.mode !== filterMode) return false;
        if (filterMonth !== "All" && b.startMonth !== filterMonth) return false;
        if (filterTime !== "All" && getTimeSlot(b.batchTime) !== filterTime) return false;
        if (filterSeats !== "All") {
            if (filterSeats === "Few (≤5)" && b.seatsLeft > 5) return false;
            if (filterSeats === "6–10" && (b.seatsLeft < 6 || b.seatsLeft > 10)) return false;
            if (filterSeats === "11+" && b.seatsLeft < 11) return false;
        }
        if (filterDuration !== "All") {
            const mo = parseDurationMonths(b.duration);
            if (filterDuration === "≤ 1 month" && mo > 1) return false;
            if (filterDuration === "1–3 months" && (mo <= 1 || mo > 3)) return false;
            if (filterDuration === "3+ months" && mo <= 3) return false;
        }
        return true;
    }), [search, filterMode, filterMonth, filterTime, filterSeats, filterDuration]);

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
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 1.5 }}>
                    {filtered.map((batch) => (
                        <BatchCard key={batch.id} variant="explore" {...batch} />
                    ))}
                </Box>
                {filtered.length === 0 && (
                    <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", textAlign: "center", py: 4 }}>
                        {search || activeCount > 0 ? "No batches match your filters." : "No batches available."}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}