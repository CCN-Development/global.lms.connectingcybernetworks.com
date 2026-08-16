"use client";

import React, { useState } from "react";
import StudentLayout from "@/layouts/StudentLayout";
import StudentHeader from "@/layouts/StudentHeader";
import {
    MdStar,
    MdCheckCircleOutline,
    MdAccessTime,
    MdSentimentDissatisfied,
    MdFavorite,
    MdArrowDropDown,
    MdDownload,
    MdInfoOutline,
    MdArrowForward,
} from "react-icons/md";

// ─── Palette ────────────────────────────────────────────────────────────────
const BG_CARD = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT_MUTED = "rgba(255,255,255,0.45)";
const TEXT_SUB = "rgba(255,255,255,0.65)";
const TEAL = "#2dd4bf";
const GREEN = "#22c55e";
const RED = "#ef4444";
const ORANGE = "#f97316";

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
                flex: 1,
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

// ─── Monthly Bar Chart ───────────────────────────────────────────────────────
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const ATTENDANCE_VALUES = [78, 85, 92, 88, 76, 91, 87, 89, 83, 94, 81, 95];
const MAX_VAL = 100;

function MonthlyChart({ year }: { year: number }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Y-axis labels + bars */}
            <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 240, position: "relative" }}>
                {/* Y axis */}
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
                {/* Grid lines
                <div style={{ position: "absolute", left: 24, right: 0, top: 0, bottom: 0, pointerEvents: "none" }}>
                    {[0, 20, 40, 60, 80, 100].map((v) => (
                        <div
                            key={v}
                            style={{
                                position: "absolute",
                                bottom: `${(v / MAX_VAL) * 100}%`,
                                left: 0,
                                right: 0,
                                borderTop: "1px solid rgba(255,255,255,0.06)",
                            }}
                        />
                    ))}
                </div> */}
                {/* Bars */}
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
                    {ATTENDANCE_VALUES.map((val, i) => (
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
                            <span style={{ fontSize: "0.55rem", color: TEXT_MUTED }}>{val}%</span>
                            <div
                                style={{
                                    width: "100%",
                                    height: `${(val / MAX_VAL) * 240}px`,
                                    background: `linear-gradient(to top, ${TEAL}, #0e7490)`,
                                    borderRadius: "4px 4px 2px 2px",
                                    minHeight: 4,
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
            {/* X axis month labels */}
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
type DayStatus = "present" | "absent" | "late" | "none";

// 42 items (6 rows × 7 cols). Day 1 lands at FRI column matching the design.
const CALENDAR_DAYS: { day: number | null; status: DayStatus }[] = [
    // Row 1 — SUN MON TUE WED THU FRI SAT
    { day: null, status: "none" }, { day: null, status: "none" }, { day: null, status: "none" },
    { day: null, status: "none" }, { day: null, status: "none" },
    { day: 1, status: "present" }, { day: 2, status: "none" },
    // Row 2
    { day: 3, status: "none" }, { day: 4, status: "none" },
    { day: 5, status: "late" }, { day: 6, status: "present" },
    { day: 7, status: "present" }, { day: 8, status: "present" },
    { day: 9, status: "none" },
    // Row 3
    { day: 10, status: "none" }, { day: 11, status: "none" },
    { day: 12, status: "present" }, { day: 13, status: "present" },
    { day: 14, status: "absent" }, { day: 15, status: "present" },
    { day: 16, status: "none" },
    // Row 4
    { day: 17, status: "none" }, { day: 18, status: "none" },
    { day: 19, status: "present" }, { day: 20, status: "present" },
    { day: 21, status: "present" }, { day: 22, status: "present" },
    { day: 23, status: "none" },
    // Row 5
    { day: 24, status: "none" }, { day: 25, status: "none" },
    { day: 26, status: "present" }, { day: 27, status: "absent" },
    { day: 28, status: "late" }, { day: 29, status: "present" },
    { day: 30, status: "none" },
    // Row 6
    { day: 31, status: "none" },
    { day: null, status: "none" }, { day: null, status: "none" }, { day: null, status: "none" },
    { day: null, status: "none" }, { day: null, status: "none" }, { day: null, status: "none" },
];

function dayColor(status: DayStatus): string {
    if (status === "present") return GREEN;
    if (status === "absent") return RED;
    if (status === "late") return ORANGE;
    return "transparent";
}

function DayWiseCalendar() {
    const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Day-of-week header */}
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

            {/* Days grid — large circles for class days, plain text otherwise */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    rowGap: 2,
                    columnGap: 1,
                }}
            >
                {CALENDAR_DAYS.map((item, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            aspectRatio: "1",
                        }}
                    >
                        {item.day && item.status !== "none" ? (
                            // Large colored circle for class days
                            <div
                                style={{
                                    width: "100%",
                                    aspectRatio: "1",
                                    borderRadius: "50%",
                                    background: dayColor(item.status),
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#fff",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    boxShadow: `0 2px 8px ${dayColor(item.status)}55`,
                                }}
                            >
                                {item.day}
                            </div>
                        ) : (
                            // Plain text for non-class days
                            <span
                                style={{
                                    fontSize: "0.68rem",
                                    color: item.day ? TEXT_SUB : "transparent",
                                    fontWeight: 400,
                                    userSelect: "none",
                                }}
                            >
                                {item.day ?? "."}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Stats legend */}
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                {[
                    { label: "PRESENT", count: "13 Days", color: GREEN },
                    { label: "ABSENT", count: "2 Days", color: RED },
                    { label: "LATE", count: "2 Days", color: ORANGE },
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
                        <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#fff" }}>{count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Attendance History Table ─────────────────────────────────────────────────
type HistoryRow = {
    date: string;
    time: string;
    batch: string;
    topic: string;
    trainer: string;
    checkIn: string;
    checkOut: string;
    mode: "OFFLINE" | "ONLINE";
    duration: string;
    status: "Present" | "Absent" | "Late";
};

const HISTORY_ROWS: HistoryRow[] = [
    {
        date: "Jul 28",
        time: "10 AM – 12 PM",
        batch: "CCNA Batch 12",
        topic: "Subnetting & VLSM",
        trainer: "Kushal Korde",
        checkIn: "10:02:17 AM",
        checkOut: "12:00:00 PM",
        mode: "OFFLINE",
        duration: "1h 58m",
        status: "Present",
    },
    {
        date: "Jul 26",
        time: "2 PM – 4 PM",
        batch: "CCNA Batch 12",
        topic: "OSI Model Layers",
        trainer: "Kushal Korde",
        checkIn: "2:19:04 PM",
        checkOut: "4:00:00 PM",
        mode: "OFFLINE",
        duration: "1h 41m",
        status: "Late",
    },
    {
        date: "Jul 24",
        time: "10 AM – 12 PM",
        batch: "CCNA Batch 12",
        topic: "IP Addressing",
        trainer: "Rahul Sharma",
        checkIn: "–",
        checkOut: "–",
        mode: "ONLINE",
        duration: "–",
        status: "Absent",
    },
    {
        date: "Jul 22",
        time: "10 AM – 12 PM",
        batch: "CCNA Batch 12",
        topic: "Network Topology",
        trainer: "Kushal Korde",
        checkIn: "10:00:52 AM",
        checkOut: "12:00:00 PM",
        mode: "ONLINE",
        duration: "1h 59m",
        status: "Present",
    },
    {
        date: "Jul 19",
        time: "2 PM – 4 PM",
        batch: "CCNA Batch 12",
        topic: "Router Config Basics",
        trainer: "Rahul Sharma",
        checkIn: "2:00:00 PM",
        checkOut: "4:00:00 PM",
        mode: "OFFLINE",
        duration: "2h 00m",
        status: "Present",
    },
    {
        date: "Jul 17",
        time: "10 AM – 12 PM",
        batch: "CCNA Batch 12",
        topic: "Switch Port Config",
        trainer: "Kushal Korde",
        checkIn: "10:07:33 AM",
        checkOut: "11:58:00 AM",
        mode: "OFFLINE",
        duration: "1h 51m",
        status: "Late",
    },
];

function statusStyle(s: HistoryRow["status"]): React.CSSProperties {
    if (s === "Present") return { background: "#14532d", color: "#4ade80", border: "1px solid rgba(34,197,94,0.5)" };
    if (s === "Absent") return { background: "#450a0a", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.5)" };
    return { background: "#431407", color: "#fdba74", border: "1px solid rgba(249,115,22,0.5)" };
}

function modeBadgeStyle(m: HistoryRow["mode"]): React.CSSProperties {
    if (m === "OFFLINE") return { background: "rgba(255,255,255,0.07)", color: TEXT_SUB, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "2px 7px" };
    return { background: "rgba(45,212,191,0.12)", color: TEAL, border: "1px solid rgba(45,212,191,0.3)", borderRadius: 6, padding: "2px 7px" };
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AttendancePage() {
    const [filterOpen, setFilterOpen] = useState(false);
    const [chartYear] = useState(2025);

    return (
        <StudentLayout
            header={
                <StudentHeader
                    title={
                        <span style={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}>Attendance</span>
                    }
                />
            }
        >
            <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 24 }}>

                {/* ── Attendance Overview header ── */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontSize: "0.78rem", color: TEXT_SUB, fontWeight: 600 }}>Attendance Overview</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {/* Overall filter */}
                        <button
                            onClick={() => setFilterOpen((p) => !p)}
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
                            }}
                        >
                            Overall <MdArrowDropDown size={16} />
                        </button>
                        {/* Download */}
                        <button
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                background: BG_CARD,
                                border: `1px solid ${BORDER}`,
                                borderRadius: 8,
                                padding: "5px 10px",
                                color: "#fff",
                                fontSize: "0.72rem",
                                cursor: "pointer",
                            }}
                        >
                            <MdDownload size={13} /> Download Summary
                        </button>
                    </div>
                </div>

                {/* ── Stat Cards ── */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <StatCard value="87%" label="Attendance" icon={MdStar} accent="#a78bfa" />
                    <StatCard value={47} label="Classes Attended" icon={MdCheckCircleOutline} accent={TEAL} />
                    <StatCard value={3} label="Late Arrivals" icon={MdAccessTime} accent="#60a5fa" />
                    <StatCard value={7} label="Absent Classes" icon={MdSentimentDissatisfied} accent={RED} />
                    <StatCard value={9} label="Attendance Streak" icon={MdFavorite} accent="#f472b6" />
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
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff" }}>Monthly Attendance</span>
                            <button
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 3,
                                    background: "rgba(255,255,255,0.06)",
                                    border: `1px solid ${BORDER}`,
                                    borderRadius: 7,
                                    padding: "3px 8px",
                                    color: TEXT_SUB,
                                    fontSize: "0.68rem",
                                    cursor: "pointer",
                                }}
                            >
                                Year : {chartYear} <MdArrowDropDown size={14} />
                            </button>
                        </div>
                        <MonthlyChart year={chartYear} />
                        {/* ── Motivational Banner ── */}
                        <div
                            style={{
                                background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)",
                                border: `1px solid rgba(139,92,246,0.3)`,
                                borderRadius: 16,
                                padding: "16px 18px",
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                                gap: 12,
                                position: "relative",
                                overflow: "hidden",
                                marginTop: 14,
                            }}
                        >
                            {/* Subtle radial highlight */}
                            <div
                                style={{
                                    position: "absolute",
                                    top: -40,
                                    right: -40,
                                    width: 160,
                                    height: 160,
                                    borderRadius: "50%",
                                    background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)",
                                    pointerEvents: "none",
                                }}
                            />
                            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#fff" }}>
                                        You&rsquo;re Doing Great! 🎉
                                    </span>
                                </div>
                                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(196,181,253,0.9)" }}>
                                    87% Attendance &bull; Certification Eligible
                                </span>
                                <span style={{ fontSize: "0.71rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, maxWidth: 440 }}>
                                    You&rsquo;re on a 9-session streak! Attend 3 more classes without a miss to push above
                                    90% and secure your certification eligibility comfortably.
                                </span>
                            </div>
                            <div style={{ flexShrink: 0 }}>
                                <MdInfoOutline size={16} color="rgba(196,181,253,0.6)" />
                            </div>
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
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff" }}>Day-Wise Attendance</span>
                            <button
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 3,
                                    background: "rgba(255,255,255,0.06)",
                                    border: `1px solid ${BORDER}`,
                                    borderRadius: 7,
                                    padding: "3px 8px",
                                    color: TEXT_SUB,
                                    fontSize: "0.68rem",
                                    cursor: "pointer",
                                }}
                            >
                                Jan <MdArrowDropDown size={14} />
                            </button>
                        </div>
                        <DayWiseCalendar />
                    </div>
                </div>



                {/* ── Attendance History ── */}
                <div
                    style={{
                        background: BG_CARD,
                        border: `1px solid ${BORDER}`,
                        borderRadius: 16,
                        padding: "16px 14px",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff" }}>Attendance History</span>
                        <button
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                background: "transparent",
                                border: "none",
                                color: TEXT_MUTED,
                                fontSize: "0.7rem",
                                cursor: "pointer",
                                padding: 0,
                            }}
                        >
                            View All <MdArrowForward size={13} />
                        </button>
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
                            <thead>
                                <tr>
                                    {["DATE & TIME", "BATCH", "TOPIC", "TRAINER", "CHECK-IN", "CHECK-OUT", "MODE", "DURATION", "STATUS"].map(
                                        (col) => (
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
                                        )
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {HISTORY_ROWS.map((row, i) => (
                                    <tr
                                        key={i}
                                        style={{
                                            borderBottom: i < HISTORY_ROWS.length - 1 ? `1px solid ${BORDER}` : "none",
                                        }}
                                    >
                                        <td style={{ padding: "9px 10px", whiteSpace: "nowrap" }}>
                                            <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.7rem" }}>{row.date}</div>
                                            <div style={{ color: TEXT_MUTED, fontSize: "0.62rem" }}>{row.time}</div>
                                        </td>
                                        <td style={{ padding: "9px 10px", color: TEXT_SUB }}>{row.batch}</td>
                                        <td style={{ padding: "9px 10px", color: TEXT_SUB, whiteSpace: "nowrap" }}>{row.topic}</td>
                                        <td style={{ padding: "9px 10px", color: TEXT_SUB, whiteSpace: "nowrap" }}>{row.trainer}</td>
                                        <td style={{ padding: "9px 10px", color: TEXT_SUB, whiteSpace: "nowrap" }}>{row.checkIn}</td>
                                        <td style={{ padding: "9px 10px", color: TEXT_SUB, whiteSpace: "nowrap" }}>{row.checkOut}</td>
                                        <td style={{ padding: "9px 10px", whiteSpace: "nowrap" }}>
                                            <span style={{ fontSize: "0.68rem", fontWeight: 600, ...modeBadgeStyle(row.mode) }}>
                                                {row.mode}
                                            </span>
                                        </td>
                                        <td style={{ padding: "9px 10px", color: TEXT_SUB }}>{row.duration}</td>
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
                </div>

            </div>
        </StudentLayout>
    );
}
