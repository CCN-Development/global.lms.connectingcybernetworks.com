"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Menu, MenuItem, CircularProgress } from "@mui/material";
import StudentLayout from "@/layouts/StudentLayout";
import StudentHeader from "@/layouts/StudentHeader";
import {
    useStudent,
    type AttendanceDailyPoint,
    type AttendanceHistoryRecord,
    type AttendancePerBatch,
} from "@/contexts/StudentContext";
import {
    MdStar,
    MdCheckCircleOutline,
    MdEventAvailable,
    MdSentimentDissatisfied,
    MdFavorite,
    MdArrowDropDown,
    MdDownload,
    MdInfoOutline,
} from "react-icons/md";

// ─── Palette ────────────────────────────────────────────────────────────────
const BG_CARD = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT_MUTED = "rgba(255,255,255,0.45)";
const TEXT_SUB = "rgba(255,255,255,0.65)";
const TEAL = "#2dd4bf";
const GREEN = "#22c55e";
const RED = "#ef4444";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const MONTHS_LONG = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const OVERALL = "overall";

const menuSx = {
    "& .MuiPaper-root": {
        background: "#111827",
        border: `1px solid ${BORDER}`,
        borderRadius: "8px",
        color: "#fff",
        maxHeight: 300,
    },
    "& .MuiMenuItem-root": { fontSize: "0.74rem" },
} as const;

// ─── Formatting helpers ─────────────────────────────────────────────────────
function formatDay(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", timeZone: "UTC" });
}

function formatTime(iso: string | null): string {
    if (!iso) return "–";
    return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function formatDuration(start: string | null, end: string | null): string {
    if (!start || !end) return "–";
    const minutes = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
    if (minutes <= 0) return "–";
    return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

function toCSV(rows: AttendanceHistoryRecord[]): string {
    const header = ["Date", "Time", "Batch", "Course", "Trainer", "Mode", "Duration", "Status"];
    const body = rows.map((row) => [
        formatDay(row.sessionDate),
        formatTime(row.sessionTime),
        row.batchName,
        row.courseName,
        row.trainerName ?? "",
        row.mode ?? "",
        formatDuration(row.sessionStartedAt, row.sessionEndedAt),
        row.status,
    ]);
    return [header, ...body]
        .map((cells) => cells.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");
}

// ─── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({
    value,
    label,
    icon: Icon,
    accent,
}: {
    value: string | number;
    label: string;
    icon: React.ElementType;
    accent?: string;
}) {
    return (
        <div
            style={{
                background: BG_CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                flex: "1 1 140px",
                minWidth: 0,
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                    {value}
                </span>
                <span style={{ color: accent ?? TEXT_MUTED, fontSize: "1rem" }}>
                    <Icon />
                </span>
            </div>
            <span style={{ fontSize: "0.72rem", color: TEXT_MUTED, fontWeight: 500 }}>{label}</span>
        </div>
    );
}

// ─── Dropdown button ────────────────────────────────────────────────────────
function Dropdown({
    label,
    options,
    value,
    onChange,
}: {
    label?: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
}) {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const selected = options.find((option) => option.value === value);

    return (
        <>
            <button
                onClick={(event) => setAnchor(event.currentTarget)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: BG_CARD,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 8,
                    padding: "5px 10px",
                    color: "#fff",
                    fontSize: "0.72rem",
                    cursor: "pointer",
                    maxWidth: 220,
                }}
            >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {label ? `${label} : ` : ""}{selected?.label ?? "—"}
                </span>
                <MdArrowDropDown size={16} />
            </button>
            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} sx={menuSx}>
                {options.map((option) => (
                    <MenuItem
                        key={option.value}
                        selected={option.value === value}
                        onClick={() => {
                            onChange(option.value);
                            setAnchor(null);
                        }}
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}

// ─── Monthly Bar Chart ───────────────────────────────────────────────────────
const CHART_HEIGHT = 240;

function MonthlyChart({ values }: { values: (number | null)[] }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: CHART_HEIGHT }}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column-reverse",
                        justifyContent: "space-between",
                        height: "100%",
                        paddingRight: 4,
                        flexShrink: 0,
                    }}
                >
                    {[0, 20, 40, 60, 80, 100].map((v) => (
                        <span key={v} style={{ fontSize: "0.6rem", color: TEXT_MUTED, lineHeight: 1 }}>
                            {v}
                        </span>
                    ))}
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-end",
                        flex: 1,
                        gap: 4,
                        height: "100%",
                        paddingLeft: 4,
                    }}
                >
                    {values.map((val, i) => (
                        <div
                            key={i}
                            style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 2,
                                height: "100%",
                                justifyContent: "flex-end",
                            }}
                        >
                            <span style={{ fontSize: "0.55rem", color: TEXT_MUTED }}>
                                {val === null ? "" : `${val}%`}
                            </span>
                            <div
                                style={{
                                    width: "100%",
                                    height: val === null ? 2 : `${(val / 100) * CHART_HEIGHT}px`,
                                    background: val === null
                                        ? "rgba(255,255,255,0.08)"
                                        : `linear-gradient(to top, ${TEAL}, #0e7490)`,
                                    borderRadius: "4px 4px 2px 2px",
                                    minHeight: 2,
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ display: "flex", paddingLeft: 28, gap: 4 }}>
                {MONTHS.map((m) => (
                    <span key={m} style={{ flex: 1, fontSize: "0.58rem", color: TEXT_MUTED, textAlign: "center" }}>
                        {m}
                    </span>
                ))}
            </div>
        </div>
    );
}

// ─── Day-Wise Calendar ────────────────────────────────────────────────────────
function DayWiseCalendar({
    year,
    month,
    daily,
}: {
    year: number;
    month: number;
    daily: AttendanceDailyPoint[];
}) {
    const statusByDay = useMemo(() => {
        const map = new Map<number, "present" | "absent">();
        for (const point of daily) {
            const [y, m, d] = point.date.split("-").map(Number);
            if (y !== year || m - 1 !== month) continue;
            // An absence in any batch that day outweighs a present marking.
            if (point.status === "absent" || !map.has(d)) map.set(d, point.status);
        }
        return map;
    }, [daily, year, month]);

    const cells = useMemo(() => {
        const offset = new Date(Date.UTC(year, month, 1)).getUTCDay();
        const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
        const total = Math.ceil((offset + daysInMonth) / 7) * 7;
        return Array.from({ length: total }, (_, i) => {
            const day = i - offset + 1;
            return day >= 1 && day <= daysInMonth ? day : null;
        });
    }, [year, month]);

    const presentCount = [...statusByDay.values()].filter((s) => s === "present").length;
    const absentCount = [...statusByDay.values()].filter((s) => s === "absent").length;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
                {DOW.map((d) => (
                    <span
                        key={d}
                        style={{ fontSize: "0.58rem", color: TEXT_MUTED, textAlign: "center", fontWeight: 600 }}
                    >
                        {d}
                    </span>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 2, columnGap: 1 }}>
                {cells.map((day, i) => {
                    const status = day === null ? undefined : statusByDay.get(day);
                    return (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                aspectRatio: "1",
                            }}
                        >
                            {status ? (
                                <div
                                    style={{
                                        width: "100%",
                                        aspectRatio: "1",
                                        borderRadius: "50%",
                                        background: status === "present" ? GREEN : RED,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#fff",
                                        fontSize: "0.75rem",
                                        fontWeight: 700,
                                    }}
                                >
                                    {day}
                                </div>
                            ) : (
                                <span
                                    style={{
                                        fontSize: "0.68rem",
                                        color: day ? TEXT_SUB : "transparent",
                                        userSelect: "none",
                                    }}
                                >
                                    {day ?? "."}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                {[
                    { label: "PRESENT", count: presentCount, color: GREEN },
                    { label: "ABSENT", count: absentCount, color: RED },
                ].map(({ label, count, color }) => (
                    <div
                        key={label}
                        style={{
                            background: color,
                            borderRadius: 8,
                            padding: "6px 8px",
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                        }}
                    >
                        <span style={{ fontSize: "0.58rem", fontWeight: 700, color: "#fff", letterSpacing: "0.06em" }}>
                            {label}
                        </span>
                        <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#fff" }}>
                            {count} {count === 1 ? "Day" : "Days"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Batch-wise attendance ───────────────────────────────────────────────────
function BatchWiseAttendance({
    rows,
    onSelect,
}: {
    rows: AttendancePerBatch[];
    onSelect: (batchId: string) => void;
}) {
    return (
        <div
            style={{
                background: BG_CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
                padding: "16px 14px",
            }}
        >
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff" }}>Batch-Wise Attendance</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
                {rows.map((row) => (
                    <button
                        key={row.batchId}
                        onClick={() => onSelect(row.batchId)}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                            background: "transparent",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            textAlign: "left",
                            width: "100%",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#fff" }}>
                                    {row.batchName}
                                </span>
                                <span style={{ fontSize: "0.64rem", color: TEXT_MUTED }}>
                                    {row.courseName} &bull; {row.attendedSessions}/{row.totalSessionsHeld} attended
                                </span>
                            </div>
                            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: TEAL }}>
                                {row.attendancePercentage}%
                            </span>
                        </div>
                        <div style={{ height: 6, borderRadius: 4, background: "rgba(255,255,255,0.08)" }}>
                            <div
                                style={{
                                    width: `${row.attendancePercentage}%`,
                                    height: "100%",
                                    borderRadius: 4,
                                    background: `linear-gradient(to right, #0e7490, ${TEAL})`,
                                }}
                            />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

function statusStyle(status: AttendanceHistoryRecord["status"]): React.CSSProperties {
    if (status === "present") return { background: "#14532d", color: "#4ade80", border: "1px solid rgba(34,197,94,0.5)" };
    return { background: "#450a0a", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.5)" };
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AttendancePage() {
    const { attendance, loadingAttendance, getAttendance } = useStudent();
    const [scope, setScope] = useState(OVERALL);
    const [chartYear, setChartYear] = useState<number | null>(null);
    const [calendarKey, setCalendarKey] = useState<string | null>(null);

    useEffect(() => {
        getAttendance(scope);
    }, [scope, getAttendance]);

    const summary = attendance?.summary;
    const years = useMemo(() => attendance?.years ?? [], [attendance]);
    const daily = useMemo(() => attendance?.daily ?? [], [attendance]);
    const history = useMemo(() => attendance?.history ?? [], [attendance]);

    const activeYear = chartYear !== null && years.includes(chartYear)
        ? chartYear
        : years[0] ?? new Date().getUTCFullYear();

    // Default the calendar to the most recent month that actually has records.
    const defaultCalendar = daily[0]
        ? daily[0].date.slice(0, 7)
        : `${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, "0")}`;
    const activeCalendar = calendarKey ?? defaultCalendar;
    const [calYear, calMonth] = activeCalendar.split("-").map(Number);

    const monthlyValues = useMemo(() => {
        const values: (number | null)[] = Array.from({ length: 12 }, () => null);
        for (const point of attendance?.monthly ?? []) {
            if (point.year === activeYear) values[point.month] = point.percentage;
        }
        return values;
    }, [attendance, activeYear]);

    const calendarOptions = useMemo(() => {
        const keys = [...new Set(daily.map((point) => point.date.slice(0, 7)))].sort().reverse();
        const options = keys.map((key) => {
            const [y, m] = key.split("-").map(Number);
            return { value: key, label: `${MONTHS_LONG[m - 1]} ${y}` };
        });
        if (options.some((option) => option.value === defaultCalendar)) return options;
        const [y, m] = defaultCalendar.split("-").map(Number);
        return [{ value: defaultCalendar, label: `${MONTHS_LONG[m - 1]} ${y}` }, ...options];
    }, [daily, defaultCalendar]);

    const scopeOptions = useMemo(() => [
        { value: OVERALL, label: "Overall" },
        ...(attendance?.batches ?? []).map((batch) => ({ value: batch.batchId, label: batch.batchName })),
    ], [attendance]);

    function downloadSummary() {
        const blob = new Blob([toCSV(history)], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `attendance-${scope}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    return (
        <StudentLayout
            header={
                <StudentHeader
                    title={<span style={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}>Attendance</span>}
                />
            }
        >
            <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 24 }}>

                {/* ── Attendance Overview header ── */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontSize: "0.78rem", color: TEXT_SUB, fontWeight: 600 }}>Attendance Overview</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Dropdown options={scopeOptions} value={scope} onChange={setScope} />
                        <button
                            onClick={downloadSummary}
                            disabled={history.length === 0}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                background: BG_CARD,
                                border: `1px solid ${BORDER}`,
                                borderRadius: 8,
                                padding: "5px 10px",
                                color: history.length === 0 ? TEXT_MUTED : "#fff",
                                fontSize: "0.72rem",
                                cursor: history.length === 0 ? "not-allowed" : "pointer",
                            }}
                        >
                            <MdDownload size={13} /> Download Summary
                        </button>
                    </div>
                </div>

                {loadingAttendance && !attendance ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
                        <CircularProgress size={24} sx={{ color: TEAL }} />
                    </div>
                ) : (
                    <>
                        {/* ── Stat Cards ── */}
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <StatCard value={`${summary?.attendancePercentage ?? 0}%`} label="Attendance" icon={MdStar} accent="#a78bfa" />
                            <StatCard value={summary?.attendedSessions ?? 0} label="Classes Attended" icon={MdCheckCircleOutline} accent={TEAL} />
                            <StatCard value={summary?.absentSessions ?? 0} label="Absent Classes" icon={MdSentimentDissatisfied} accent={RED} />
                            <StatCard value={summary?.upcomingSessions ?? 0} label="Upcoming Classes" icon={MdEventAvailable} accent="#60a5fa" />
                            <StatCard value={summary?.currentStreak ?? 0} label="Attendance Streak" icon={MdFavorite} accent="#f472b6" />
                        </div>

                        {/* ── Charts Row ── */}
                        <div className="grid grid-cols-1 md:grid-cols-[3fr_1.5fr] gap-5">
                            {/* Monthly Attendance */}
                            <div
                                style={{
                                    background: BG_CARD,
                                    border: `1px solid ${BORDER}`,
                                    borderRadius: 16,
                                    padding: "16px 14px",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 8 }}>
                                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff" }}>Monthly Attendance</span>
                                    <Dropdown
                                        label="Year"
                                        options={(years.length > 0 ? years : [activeYear]).map((year) => ({
                                            value: String(year),
                                            label: String(year),
                                        }))}
                                        value={String(activeYear)}
                                        onChange={(value) => setChartYear(Number(value))}
                                    />
                                </div>
                                <MonthlyChart values={monthlyValues} />

                                {/* ── Status Banner ── */}
                                <div
                                    style={{
                                        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)",
                                        border: "1px solid rgba(139,92,246,0.3)",
                                        borderRadius: 16,
                                        padding: "16px 18px",
                                        display: "flex",
                                        alignItems: "flex-start",
                                        justifyContent: "space-between",
                                        gap: 12,
                                        marginTop: 14,
                                    }}
                                >
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                                        <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#fff" }}>
                                            {(summary?.attendancePercentage ?? 0) >= 75
                                                ? "You're Doing Great!"
                                                : "Let's Push Your Attendance Up"}
                                        </span>
                                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(196,181,253,0.9)" }}>
                                            {summary?.attendancePercentage ?? 0}% Attendance &bull;{" "}
                                            {(summary?.attendancePercentage ?? 0) >= 75
                                                ? "Certification Eligible"
                                                : "Below 75% Eligibility"}
                                        </span>
                                        <span style={{ fontSize: "0.71rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, maxWidth: 440 }}>
                                            {summary && summary.totalSessionsHeld > 0
                                                ? `You have attended ${summary.attendedSessions} of ${summary.totalSessionsHeld} sessions held${summary.currentStreak > 0 ? `, and you are on a ${summary.currentStreak}-session streak` : ""}. ${summary.upcomingSessions} upcoming ${summary.upcomingSessions === 1 ? "session is" : "sessions are"} scheduled.`
                                                : "No sessions have been held yet. Your attendance will appear here once classes begin."}
                                        </span>
                                    </div>
                                    <MdInfoOutline size={16} color="rgba(196,181,253,0.6)" style={{ flexShrink: 0 }} />
                                </div>
                            </div>

                            {/* Day-Wise Attendance */}
                            <div
                                style={{
                                    background: BG_CARD,
                                    border: `1px solid ${BORDER}`,
                                    borderRadius: 16,
                                    padding: "16px 14px",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 8 }}>
                                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff" }}>Day-Wise Attendance</span>
                                    <Dropdown options={calendarOptions} value={activeCalendar} onChange={setCalendarKey} />
                                </div>
                                <DayWiseCalendar year={calYear} month={calMonth - 1} daily={daily} />
                            </div>
                        </div>

                        {/* ── Batch-Wise Attendance ── */}
                        {attendance && attendance.perBatch.length > 0 && (
                            <BatchWiseAttendance rows={attendance.perBatch} onSelect={setScope} />
                        )}

                        {/* ── Attendance History ── */}
                        <div
                            style={{
                                background: BG_CARD,
                                border: `1px solid ${BORDER}`,
                                borderRadius: 16,
                                padding: "16px 14px",
                            }}
                        >
                            <div style={{ marginBottom: 14 }}>
                                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff" }}>Attendance History</span>
                            </div>

                            {history.length === 0 ? (
                                <div style={{ padding: "24px 0", textAlign: "center", color: TEXT_MUTED, fontSize: "0.74rem" }}>
                                    No attendance records yet.
                                </div>
                            ) : (
                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
                                        <thead>
                                            <tr>
                                                {["DATE & TIME", "BATCH", "COURSE", "TRAINER", "MODE", "DURATION", "STATUS"].map((col) => (
                                                    <th
                                                        key={col}
                                                        style={{
                                                            textAlign: "left",
                                                            padding: "6px 10px",
                                                            color: TEXT_MUTED,
                                                            fontWeight: 600,
                                                            fontSize: "0.62rem",
                                                            letterSpacing: "0.05em",
                                                            borderBottom: `1px solid ${BORDER}`,
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        {col}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.map((row, i) => (
                                                <tr
                                                    key={row.batchSessionId}
                                                    style={{
                                                        borderBottom: i < history.length - 1 ? `1px solid ${BORDER}` : "none",
                                                    }}
                                                >
                                                    <td style={{ padding: "9px 10px", whiteSpace: "nowrap" }}>
                                                        <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.7rem" }}>
                                                            {formatDay(row.sessionDate)}
                                                        </div>
                                                        <div style={{ color: TEXT_MUTED, fontSize: "0.62rem" }}>
                                                            {formatTime(row.sessionTime)}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "9px 10px", color: TEXT_SUB, whiteSpace: "nowrap" }}>{row.batchName}</td>
                                                    <td style={{ padding: "9px 10px", color: TEXT_SUB, whiteSpace: "nowrap" }}>{row.courseName}</td>
                                                    <td style={{ padding: "9px 10px", color: TEXT_SUB, whiteSpace: "nowrap" }}>{row.trainerName ?? "–"}</td>
                                                    <td style={{ padding: "9px 10px", whiteSpace: "nowrap" }}>
                                                        <span
                                                            style={{
                                                                fontSize: "0.62rem",
                                                                fontWeight: 600,
                                                                textTransform: "uppercase",
                                                                background: "rgba(255,255,255,0.07)",
                                                                color: TEXT_SUB,
                                                                border: `1px solid ${BORDER}`,
                                                                borderRadius: 6,
                                                                padding: "2px 7px",
                                                            }}
                                                        >
                                                            {row.mode ?? "—"}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "9px 10px", color: TEXT_SUB, whiteSpace: "nowrap" }}>
                                                        {formatDuration(row.sessionStartedAt, row.sessionEndedAt)}
                                                    </td>
                                                    <td style={{ padding: "9px 10px" }}>
                                                        <span
                                                            style={{
                                                                fontSize: "0.62rem",
                                                                fontWeight: 600,
                                                                borderRadius: 20,
                                                                padding: "3px 9px",
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                gap: 4,
                                                                textTransform: "capitalize",
                                                                ...statusStyle(row.status),
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    width: 5,
                                                                    height: 5,
                                                                    borderRadius: "50%",
                                                                    background: "currentColor",
                                                                    display: "inline-block",
                                                                    flexShrink: 0,
                                                                }}
                                                            />
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </StudentLayout>
    );
}
