"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Box, ButtonBase, CircularProgress, Menu, MenuItem, Typography, type SxProps, type Theme } from "@mui/material";
import {
    useStudent,
    type AttendanceDailyPoint,
    type AttendanceHistoryRecord,
    type AttendanceStatus,
} from "@/contexts/StudentContext";
import { COLORS, FONTS, TYPE } from "@/components/courses/my-courses-theme";
import { framedPanelSx } from "@/components/courses/my-courses-ui";
import { MONTH_SHORT } from "@/components/batches/batch-format";

const ASSET = "/attendance";
const CARD_GLOW = "/profile/card-edge-glow.png";
const NOISE = "/profile/summary-noise.png";
const DIVIDER = "/batches/explore/modal-divider.svg";
const DOWNLOAD_ICON = "/resume-builder/action-download.svg";

const OVERALL = "overall";
const MONTH_LABELS = MONTH_SHORT.map((m) => m.toUpperCase());
const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const HISTORY_PREVIEW = 5;
const CHART_HEIGHT = 268;
const ELIGIBILITY = 75;

const TEXT = {
    lato12: { fontFamily: FONTS.lato, fontWeight: 500, fontSize: "12px", lineHeight: "18px" },
    lato14: { fontFamily: FONTS.lato, fontWeight: 400, fontSize: "14px", lineHeight: "21px" },
    lato16: { fontFamily: FONTS.lato, fontWeight: 400, fontSize: "16px", lineHeight: "24px" },
    inter12: { fontFamily: FONTS.inter, fontWeight: 400, fontSize: "12px", lineHeight: "18px" },
    inter18: { fontFamily: FONTS.inter, fontWeight: 500, fontSize: "18px", lineHeight: "27px" },
    statValue: { fontFamily: FONTS.poppins, fontWeight: 600, fontSize: "24px", lineHeight: "36px" },
} as const;

const SELECT_FILL =
    "linear-gradient(90deg, rgba(38,38,38,0.44) 6.436%, rgba(89,89,89,0.44) 101.24%, rgba(140,140,140,0.44) 208.91%)";

/** Day / pill fills per status (Figma "Active" calendar cells and the Stats pills). */
const STATUS_FILL: Record<AttendanceStatus, string> = {
    present: "linear-gradient(180.85deg, #2FAD2F 0.7286%, #134713 148.03%)",
    absent: "linear-gradient(180deg, #C02638 0%, #5A121A 100%)",
    late: "linear-gradient(90deg, #F1C40E 0%, #FF6000 100%)",
};

const STATUS_PILL: Record<AttendanceStatus, { label: string; bg: string; color: string; dot: string }> = {
    present: { label: "Present", bg: "#E3F7E3", color: "#195C19", dot: "/requests/dot-resolved.svg" },
    absent: { label: "Absent", bg: "#F6D4D8", color: "#9D1F2E", dot: "/requests/dot-rejected.svg" },
    late: { label: "Late", bg: "#FFEFDC", color: "#FB8600", dot: "/requests/dot-pending.svg" },
};

// ─── Formatting ──────────────────────────────────────────────────────────────

const toDate = (iso: string | null | undefined) => {
    if (!iso) return null;
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? null : date;
};

/** Session dates are stored as UTC calendar dates → "May 22". */
function formatSessionDay(iso: string): string {
    const date = toDate(iso);
    return date ? `${MONTH_SHORT[date.getUTCMonth()]} ${date.getUTCDate()}` : "—";
}

/** Minutes past midnight → "10 AM" / "10:30 AM". */
function formatHour(totalMinutes: number): string {
    const minutes = ((totalMinutes % 1440) + 1440) % 1440;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h >= 12 ? "PM" : "AM"}`;
}

function sessionMinutes(row: AttendanceHistoryRecord): number | null {
    const start = toDate(row.sessionStartedAt);
    const end = toDate(row.sessionEndedAt);
    if (!start || !end) return null;
    const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
    return minutes > 0 ? minutes : null;
}

/** Scheduled slot; session times are persisted as UTC wall-clock times. */
function formatSlot(row: AttendanceHistoryRecord): string {
    const time = toDate(row.sessionTime);
    if (!time) return "";
    const start = time.getUTCHours() * 60 + time.getUTCMinutes();
    const duration = sessionMinutes(row);
    return duration ? `${formatHour(start)} - ${formatHour(start + duration)}` : formatHour(start);
}

function formatClock(iso: string | null): string {
    const date = toDate(iso);
    return date ? date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" }) : "—";
}

function formatDuration(row: AttendanceHistoryRecord): string {
    const minutes = sessionMinutes(row);
    if (!minutes) return "—";
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (hours === 0) return `${rest} min`;
    const hourLabel = `${hours} ${hours === 1 ? "hr" : "hrs"}`;
    return rest ? `${hourLabel} ${rest} min` : hourLabel;
}

function toCSV(rows: AttendanceHistoryRecord[]): string {
    const header = ["Date", "Time", "Batch", "Topic", "Trainer", "Check-in", "Check-out", "Mode", "Duration", "Status"];
    const body = rows.map((row) => [
        formatSessionDay(row.sessionDate),
        formatSlot(row),
        row.batchName,
        row.topic || row.courseName,
        row.trainerName ?? "",
        formatClock(row.sessionStartedAt),
        formatClock(row.sessionEndedAt),
        row.mode ?? "",
        formatDuration(row),
        row.status,
    ]);
    return [header, ...body]
        .map((cells) => cells.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");
}

// ─── Decorative pieces ──────────────────────────────────────────────────────

function Decor({ src, sx }: { src: string; sx: SxProps<Theme> }) {
    return (
        <Box
            component="img"
            aria-hidden
            src={src}
            alt=""
            sx={{ position: "absolute", maxWidth: "none", pointerEvents: "none", ...sx } as SxProps<Theme>}
        />
    );
}

/** Blurred black ellipses Figma tucks behind each glass card (rotated 90°). */
function EdgeShadow({ left, top, box, img, src }: { left: number; top: number; box: [number, number]; img: [number, number]; src: string }) {
    return (
        <Box
            aria-hidden
            sx={{
                position: "absolute",
                left,
                top,
                width: box[0],
                height: box[1],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
            }}
        >
            <Box component="img" src={src} alt="" sx={{ width: img[0], height: img[1], maxWidth: "none", flexShrink: 0, transform: "rotate(90deg)" }} />
        </Box>
    );
}

/** Frosted "My Tasks" frame shared by the chart, calendar and history cards. */
function GlassCard({
    angle,
    shadowLeft = 19,
    shadowRight = 401,
    sx,
    children,
}: {
    angle: string;
    shadowLeft?: number;
    shadowRight?: number;
    sx?: SxProps<Theme>;
    children: React.ReactNode;
}) {
    return (
        <Box
            sx={{
                ...framedPanelSx({ angle }),
                overflow: "hidden",
                p: { xs: "20px", sm: "32px" },
                display: "flex",
                flexDirection: "column",
                gap: "32px",
                minWidth: 0,
                "& > :not([aria-hidden])": { position: "relative", zIndex: 1 },
                ...sx,
            } as SxProps<Theme>}
        >
            <EdgeShadow left={shadowRight} top={156} box={[6, 248]} img={[296, 54]} src={`${ASSET}/edge-glow-right.svg`} />
            <EdgeShadow left={shadowLeft} top={90} box={[12, 380]} img={[428, 60]} src={`${ASSET}/edge-glow-left.svg`} />
            <Decor src={CARD_GLOW} sx={{ left: 4, top: -7, width: 425, height: 15, filter: "blur(50px)", objectFit: "cover" }} />
            <Decor src={CARD_GLOW} sx={{ left: 4, bottom: -16, width: 425, height: 15, filter: "blur(50px)", objectFit: "cover", transform: "scaleY(-1)" }} />
            {children}
        </Box>
    );
}

function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
            <Typography component="h2" sx={{ ...TYPE.headingSemibold20, color: COLORS.white, whiteSpace: "nowrap" }}>
                {title}
            </Typography>
            {action}
        </Box>
    );
}

const glassButtonSx = {
    height: 32,
    gap: "8px",
    borderRadius: "8px",
    backgroundImage: SELECT_FILL,
    backdropFilter: "blur(12px)",
    flexShrink: 0,
    "&:hover": { filter: "brightness(1.15)" },
    "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" },
} as const;

/** Frosted dropdown trigger ("Year : 2025 ⌄", "Jan ⌄"). */
function GlassSelect({
    prefix,
    options,
    value,
    onChange,
    compact = false,
}: {
    prefix?: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    compact?: boolean;
}) {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const selected = options.find((option) => option.value === value);

    return (
        <>
            <ButtonBase
                aria-haspopup="listbox"
                onClick={(event) => setAnchor(event.currentTarget)}
                disabled={options.length <= 1}
                sx={{ ...glassButtonSx, pl: compact ? "12px" : "16px", pr: compact ? "8px" : "12px", "&.Mui-disabled": { opacity: 1 } }}
            >
                <Typography sx={{ ...TYPE.smallMed14, color: COLORS.white, whiteSpace: "nowrap", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {prefix ? `${prefix} : ` : ""}{selected?.label ?? "—"}
                </Typography>
                <Box component="img" src={`${ASSET}/icon-chevron-down.svg`} alt="" sx={{ width: 20, height: 20 }} />
            </ButtonBase>
            <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
                slotProps={{
                    paper: {
                        sx: {
                            mt: "6px",
                            bgcolor: "#111",
                            backgroundImage: SELECT_FILL,
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: "8px",
                            color: COLORS.white,
                            maxHeight: 300,
                        },
                    },
                }}
            >
                {options.map((option) => (
                    <MenuItem
                        key={option.value}
                        selected={option.value === value}
                        onClick={() => {
                            onChange(option.value);
                            setAnchor(null);
                        }}
                        sx={{ ...TYPE.smallMed14, "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.12)" } }}
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}

// ─── Stat cards ─────────────────────────────────────────────────────────────

const STAT_TONES = [
    { key: "attendance", label: "Attendance", icon: "icon-star.svg", iconSize: 17.231, border: "rgba(140,36,255,0.24)", fill: "linear-gradient(180deg, rgba(140,36,255,0.08) 0%, rgba(112,29,204,0.08) 50%, rgba(84,22,153,0.08) 100%)" },
    { key: "attended", label: "Attended Classes", icon: "icon-check-circle.svg", iconSize: 17.231, border: "rgba(46,196,182,0.24)", fill: "linear-gradient(180deg, rgba(46,196,182,0.08) 0%, rgba(34,145,135,0.08) 50%, rgba(22,94,87,0.08) 100%)" },
    { key: "late", label: "Late Arrivals", icon: "icon-thumbs-down.svg", iconSize: 17.231, border: "rgba(241,196,14,0.24)", fill: "linear-gradient(180deg, rgba(241,196,14,0.08) 0%, rgba(190,155,11,0.08) 50%, rgba(139,113,8,0.08) 100%)" },
    { key: "absent", label: "Absent Classes", icon: "icon-frown.svg", iconSize: 21.333, border: "#7A1824", fill: "linear-gradient(180deg, rgba(224,44,66,0.08) 0%, rgba(173,34,51,0.08) 50%, rgba(122,24,36,0.08) 100%)" },
    { key: "streak", label: "Attendance Streak", icon: "icon-heart.svg", iconSize: 17.231, border: "#2F53AD", fill: "rgba(47,83,173,0.08)" },
] as const;

type StatKey = (typeof STAT_TONES)[number]["key"];

function StatCard({ tone, value }: { tone: (typeof STAT_TONES)[number]; value: string | number }) {
    return (
        <Box
            sx={{
                position: "relative",
                overflow: "hidden",
                minWidth: 0,
                p: "16px",
                borderRadius: "24px",
                borderStyle: "solid",
                borderColor: tone.border,
                borderWidth: "0.6px 0.6px 2px 0.6px",
                background: tone.fill,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
            }}
        >
            <Decor src={`${ASSET}/stat-glow-bottom.png`} sx={{ left: -0.6, bottom: -2, width: 452, height: 13, filter: "blur(50px)", objectFit: "cover", transform: "scaleY(-1)" }} />
            <Decor src={`${ASSET}/stat-glow-top.png`} sx={{ left: 4.4, top: -0.6, width: 447, height: 15, filter: "blur(50px)", objectFit: "cover" }} />
            <Typography sx={{ ...TEXT.statValue, position: "relative", color: COLORS.white, pr: "40px", whiteSpace: "nowrap" }}>{value}</Typography>
            <Typography sx={{ ...TEXT.lato14, position: "relative", color: COLORS.neutral100, letterSpacing: "0.28px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {tone.label}
            </Typography>
            <Box
                aria-hidden
                sx={{
                    position: "absolute",
                    right: "15.4px",
                    top: "14.4px",
                    width: 32,
                    height: 32,
                    borderRadius: "615px",
                    border: "0.615px solid rgba(242,242,242,0.24)",
                    background: "linear-gradient(180deg, rgba(191,191,191,0.12) 0%, rgba(89,89,89,0.12) 100%)",
                    boxShadow: "0px 4px 4px 0px rgba(0,0,0,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Box component="img" src={`${ASSET}/${tone.icon}`} alt="" sx={{ width: tone.iconSize, height: tone.iconSize }} />
            </Box>
        </Box>
    );
}

// ─── Monthly chart ──────────────────────────────────────────────────────────

function MonthlyChart({ values }: { values: (number | null)[] }) {
    const columns = "repeat(12, minmax(0, 1fr))";
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", overflowX: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
            <Box sx={{ display: "flex", gap: "8px", height: CHART_HEIGHT, alignItems: "flex-end", minWidth: 380 }}>
                <Box sx={{ position: "relative", width: 21, height: CHART_HEIGHT, flexShrink: 0 }}>
                    {[100, 80, 60, 40, 20, 0].map((tick, i) => (
                        <Typography key={tick} sx={{ ...TEXT.lato12, position: "absolute", right: 0, top: i * 50, color: COLORS.neutral300 }}>
                            {tick}
                        </Typography>
                    ))}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, display: "grid", gridTemplateColumns: columns, columnGap: "8px", pl: "5px", height: CHART_HEIGHT }}>
                    {values.map((value, i) => (
                        <Box key={MONTH_LABELS[i]} sx={{ display: "flex", justifyContent: "center", height: "100%" }}>
                            <Box
                                title={value === null ? `${MONTH_LABELS[i]}: no sessions` : `${MONTH_LABELS[i]}: ${value}%`}
                                sx={{
                                    position: "relative",
                                    width: "100%",
                                    maxWidth: 28,
                                    height: "100%",
                                    borderRadius: "4px 4px 0 0",
                                    bgcolor: "rgba(255,255,255,0.04)",
                                    overflow: "hidden",
                                }}
                            >
                                {value !== null && value > 0 && (
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            height: `${Math.min(value, 100)}%`,
                                            borderRadius: "4px 4px 0 0",
                                            background:
                                                "linear-gradient(180deg, #2EC4B6 0%, #229187 30.9%, #1C786F 54.9%, #196B63 77.7%, #18645D 93.75%, #165E57 100%)",
                                            "&::after": {
                                                content: '""',
                                                position: "absolute",
                                                inset: 0,
                                                borderRadius: "inherit",
                                                padding: "1px 1px 0",
                                                background: "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(153,153,153,0) 38px)",
                                                WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                                                WebkitMaskComposite: "xor",
                                                maskComposite: "exclude",
                                            },
                                        }}
                                    />
                                )}
                                {value !== null && (
                                    <Typography
                                        sx={{
                                            position: "absolute",
                                            top: "7px",
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            fontFamily: FONTS.lato,
                                            fontWeight: 600,
                                            fontSize: "10px",
                                            lineHeight: "15px",
                                            color: COLORS.white,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {value}%
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: columns, columnGap: "8px", pl: "34px", minWidth: 380 }}>
                {MONTH_LABELS.map((label) => (
                    <Typography key={label} sx={{ ...TEXT.lato12, color: COLORS.neutral300, textAlign: "center" }}>
                        {label}
                    </Typography>
                ))}
            </Box>
        </Box>
    );
}

// ─── Eligibility banner ─────────────────────────────────────────────────────

function EligibilityCard({ percentage, held }: { percentage: number; held: number }) {
    const eligible = percentage >= ELIGIBILITY;
    const title = held === 0 ? "No Classes Yet" : eligible ? "You're Doing Great! 🎉" : "Let's Push Your Attendance Up";
    const subtitle = held === 0
        ? "Attendance not started"
        : `${percentage}% Attendance • ${eligible ? "Certification Eligible" : `Below ${ELIGIBILITY}% Eligibility`}`;
    const body = held === 0
        ? "No sessions have been held yet. Your attendance will appear here once classes begin."
        : eligible
            ? "You're maintaining an excellent attendance record. Keep attending regularly to stay on track and complete your certification successfully."
            : `You need at least ${ELIGIBILITY}% attendance to be eligible for certification. Attend your upcoming classes regularly to get back on track.`;

    return (
        <Box
            sx={{
                position: "relative",
                overflow: "hidden",
                p: "24px",
                minHeight: 197,
                borderRadius: "30px",
                border: "1px solid rgba(255,255,255,0.29)",
                bgcolor: "#07051B",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
            }}
        >
            <Decor src={`${ASSET}/great-rays.svg`} sx={{ left: "-8.46px", top: "-309.25px", width: "962.992px", height: "529.84px", transform: "rotate(180deg)", opacity: 0.44 }} />
            <Decor src={`${ASSET}/great-rays.svg`} sx={{ left: "-245.46px", top: "72.75px", width: "962.992px", height: "529.84px", transform: "rotate(180deg)", opacity: 0.44 }} />
            <Box
                aria-hidden
                sx={{
                    position: "absolute",
                    left: -2,
                    top: 0,
                    width: "calc(100% + 4px)",
                    height: 355,
                    opacity: 0.44,
                    pointerEvents: "none",
                    "&::before": { content: '""', position: "absolute", inset: 0, backgroundImage: `url(${NOISE})`, backgroundSize: "568px 568px", opacity: 0.1 },
                }}
            />
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "8px", pr: "36px" }}>
                <Typography sx={{ ...TYPE.headingSemibold20, color: COLORS.white }}>{title}</Typography>
                <Typography sx={{ ...TEXT.inter18, fontSize: { xs: "16px", sm: "18px" }, color: COLORS.white }}>{subtitle}</Typography>
                <Box
                    component="img"
                    src={`${ASSET}/icon-alert-circle.svg`}
                    alt=""
                    title={`${ELIGIBILITY}% attendance is required for certification`}
                    sx={{ position: "absolute", right: 0, top: "4px", width: 24, height: 24, transform: "rotate(180deg)" }}
                />
            </Box>
            <Box component="img" src={`${ASSET}/great-divider.svg`} alt="" aria-hidden sx={{ position: "relative", width: "100%", height: "1px", display: "block" }} />
            <Typography sx={{ ...TYPE.mediumMed16, position: "relative", color: COLORS.neutral200 }}>{body}</Typography>
        </Box>
    );
}

// ─── Day-wise calendar ──────────────────────────────────────────────────────

/** Worst status wins when a day has sessions in several batches. */
const STATUS_RANK: Record<AttendanceStatus, number> = { present: 0, late: 1, absent: 2 };

function DayWiseCalendar({ year, month, daily }: { year: number; month: number; daily: AttendanceDailyPoint[] }) {
    const statusByDay = useMemo(() => {
        const map = new Map<number, AttendanceStatus>();
        for (const point of daily) {
            const [y, m, d] = point.date.split("-").map(Number);
            if (y !== year || m - 1 !== month) continue;
            const current = map.get(d);
            if (!current || STATUS_RANK[point.status] > STATUS_RANK[current]) map.set(d, point.status);
        }
        return map;
    }, [daily, year, month]);

    const cells = useMemo(() => {
        const offset = new Date(Date.UTC(year, month, 1)).getUTCDay();
        const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
        const prevDays = new Date(Date.UTC(year, month, 0)).getUTCDate();
        const total = Math.ceil((offset + daysInMonth) / 7) * 7;
        return Array.from({ length: total }, (_, i) => {
            const day = i - offset + 1;
            if (day < 1) return { day: prevDays + day, inMonth: false };
            if (day > daysInMonth) return { day: day - daysInMonth, inMonth: false };
            return { day, inMonth: true };
        });
    }, [year, month]);

    const counts = useMemo(() => {
        const result: Record<AttendanceStatus, number> = { present: 0, absent: 0, late: 0 };
        for (const status of statusByDay.values()) result[status] += 1;
        return result;
    }, [statusByDay]);

    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
                    {DOW.map((d) => (
                        <Typography key={d} sx={{ ...TEXT.lato12, color: COLORS.neutral200, textAlign: "center" }}>
                            {d}
                        </Typography>
                    ))}
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", rowGap: "16px" }}>
                    {cells.map(({ day, inMonth }, i) => {
                        const status = inMonth ? statusByDay.get(day) : undefined;
                        return (
                            <Box key={i} sx={{ display: "flex", justifyContent: "center" }}>
                                <Box
                                    title={status ? STATUS_PILL[status].label : undefined}
                                    sx={{
                                        width: { xs: 36, sm: 40 },
                                        height: { xs: 36, sm: 40 },
                                        borderRadius: "99px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: status ? STATUS_FILL[status] : "transparent",
                                    }}
                                >
                                    <Typography sx={{ ...TYPE.mediumMed16, color: inMonth ? COLORS.white : "#5A5A5A" }}>{day}</Typography>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            <Box component="img" src={DIVIDER} alt="" aria-hidden sx={{ width: "100%", height: "1px", display: "block" }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Typography sx={{ ...TEXT.lato16, color: COLORS.neutral300 }}>Stats</Typography>
                <Box sx={{ display: "flex", gap: "20px" }}>
                    {(["present", "absent", "late"] as const).map((status) => (
                        <Box key={status} sx={{ flex: "1 1 0", minWidth: 0, borderRadius: "8px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                            <Box sx={{ height: 22, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px 4px 0 0", background: STATUS_FILL[status] }}>
                                <Typography sx={{ ...TEXT.inter12, color: COLORS.neutral100 }}>{status.toUpperCase()}</Typography>
                            </Box>
                            <Box sx={{ bgcolor: COLORS.neutral200, px: "8px", py: "2px", display: "flex", justifyContent: "center" }}>
                                <Typography sx={{ ...TYPE.smallSemibold14, color: "#0D0D0D", whiteSpace: "nowrap" }}>
                                    {counts[status]} {counts[status] === 1 ? "Day" : "Days"}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </>
    );
}

// ─── History table ──────────────────────────────────────────────────────────

const HISTORY_COLUMNS = ["DATE & TIME", "BATCH", "TOPIC", "TRAINER", "CHECK-IN", "CHECK-OUT", "MODE", "DURATION", "STATUS"];
const HISTORY_GRID = "repeat(9, minmax(0, 1fr))";

function StatusPill({ status }: { status: AttendanceStatus }) {
    const tone = STATUS_PILL[status];
    return (
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: "6px", px: "8px", py: "2px", borderRadius: "999px", bgcolor: tone.bg }}>
            <Box component="img" src={tone.dot} alt="" sx={{ width: 5, height: 5 }} />
            <Typography sx={{ fontFamily: FONTS.lato, fontWeight: 400, fontSize: "12px", lineHeight: "18px", color: tone.color, whiteSpace: "nowrap" }}>
                {tone.label}
            </Typography>
        </Box>
    );
}

function Cell({ children, ellipsis = false, title }: { children: React.ReactNode; ellipsis?: boolean; title?: string }) {
    return (
        <Box
            title={title}
            sx={{
                ...TYPE.mediumMed16,
                color: COLORS.neutral100,
                textAlign: "center",
                minWidth: 0,
                px: "4px",
                ...(ellipsis ? { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } : { wordBreak: "break-word" }),
            }}
        >
            {children}
        </Box>
    );
}

function HistoryTable({ rows }: { rows: AttendanceHistoryRecord[] }) {
    return (
        <Box sx={{ overflowX: "auto", scrollbarWidth: "thin" }}>
            <Box sx={{ minWidth: 960, display: "flex", flexDirection: "column", gap: "12px" }}>
                <Box sx={{ display: "grid", gridTemplateColumns: HISTORY_GRID, px: "4px" }}>
                    {HISTORY_COLUMNS.map((label) => (
                        <Typography key={label} sx={{ ...TYPE.smallMed14, color: COLORS.neutral300, textAlign: "center", whiteSpace: "nowrap" }}>
                            {label}
                        </Typography>
                    ))}
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                    {rows.map((row, i) => {
                        const slot = formatSlot(row);
                        const topic = row.topic || row.courseName;
                        return (
                            <Box
                                key={row.batchSessionId}
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: HISTORY_GRID,
                                    alignItems: "center",
                                    p: "4px",
                                    minHeight: 56,
                                    borderRadius: "4px",
                                    bgcolor: i % 2 === 0 ? "rgba(147,169,226,0.08)" : "transparent",
                                }}
                            >
                                <Cell>
                                    {formatSessionDay(row.sessionDate)}
                                    {slot && <Box component="span" sx={{ display: "block" }}>{slot}</Box>}
                                </Cell>
                                <Cell ellipsis title={row.batchName}>{row.batchName}</Cell>
                                <Cell ellipsis title={topic}>{topic}</Cell>
                                <Cell ellipsis title={row.trainerName ?? undefined}>{row.trainerName ?? "—"}</Cell>
                                <Cell>{formatClock(row.sessionStartedAt)}</Cell>
                                <Cell>{formatClock(row.sessionEndedAt)}</Cell>
                                <Cell>{row.mode ? row.mode.toUpperCase() : "—"}</Cell>
                                <Cell>{formatDuration(row)}</Cell>
                                <Box sx={{ display: "flex", justifyContent: "center" }}>
                                    <StatusPill status={row.status} />
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Box>
    );
}

// ─── Main view ──────────────────────────────────────────────────────────────

/**
 * Attendance dashboard. Without `batchId` it shows overall attendance with a batch scope picker;
 * with `batchId` it is locked to that batch.
 */
export default function AttendanceView({ batchId }: { batchId?: string }) {
    const { attendance, loadingAttendance, getAttendance } = useStudent();
    const [selectedScope, setSelectedScope] = useState(OVERALL);
    const scope = batchId ?? selectedScope;
    const [chartYear, setChartYear] = useState<number | null>(null);
    const [calendarKey, setCalendarKey] = useState<string | null>(null);
    const [showAllHistory, setShowAllHistory] = useState(false);

    useEffect(() => {
        getAttendance(scope);
    }, [scope, getAttendance]);

    // The context keeps the last response; ignore it until it matches the scope on screen.
    const data = attendance?.scope === scope ? attendance : null;
    const summary = data?.summary;
    const years = useMemo(() => data?.years ?? [], [data]);
    const daily = useMemo(() => data?.daily ?? [], [data]);
    const history = useMemo(() => data?.history ?? [], [data]);

    const activeYear = chartYear !== null && years.includes(chartYear) ? chartYear : years[0] ?? new Date().getUTCFullYear();

    const now = new Date();
    const currentKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const defaultCalendar = daily[0] ? daily[0].date.slice(0, 7) : currentKey;
    const activeCalendar = calendarKey ?? defaultCalendar;
    const [calYear, calMonth] = activeCalendar.split("-").map(Number);

    const monthlyValues = useMemo(() => {
        const values: (number | null)[] = Array.from({ length: 12 }, () => null);
        for (const point of data?.monthly ?? []) {
            if (point.year === activeYear) values[point.month] = point.percentage;
        }
        return values;
    }, [data, activeYear]);

    const calendarOptions = useMemo(() => {
        const keys = new Set(daily.map((point) => point.date.slice(0, 7)));
        keys.add(activeCalendar);
        const sorted = [...keys].sort().reverse();
        const multiYear = new Set(sorted.map((key) => key.slice(0, 4))).size > 1;
        return sorted.map((key) => {
            const [y, m] = key.split("-").map(Number);
            return { value: key, label: multiYear ? `${MONTH_SHORT[m - 1]} ${y}` : MONTH_SHORT[m - 1] };
        });
    }, [daily, activeCalendar]);

    const batchOptions = data?.batches ?? attendance?.batches;
    const scopeOptions = useMemo(() => [
        { value: OVERALL, label: "Overall" },
        ...(batchOptions ?? []).map((batch) => ({ value: batch.batchId, label: batch.batchName })),
    ], [batchOptions]);

    const lateCount = useMemo(() => history.filter((row) => row.status === "late").length, [history]);

    const statValues: Record<StatKey, string | number> = {
        attendance: `${summary?.attendancePercentage ?? 0}%`,
        attended: summary?.attendedSessions ?? 0,
        late: lateCount,
        absent: summary?.absentSessions ?? 0,
        streak: summary?.currentStreak ?? 0,
    };

    const visibleHistory = showAllHistory ? history : history.slice(0, HISTORY_PREVIEW);

    function changeScope(value: string) {
        setSelectedScope(value);
        setCalendarKey(null);
        setChartYear(null);
        setShowAllHistory(false);
    }

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
        <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", pt: { xs: "8px", md: "13px" }, pb: "24px" }}>
            {/* ── Overview header ── */}
            <Box sx={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <Typography sx={{ ...TEXT.lato16, flex: 1, minWidth: 160, color: COLORS.neutral300 }}>Attendance Overview</Typography>
                {!batchId && scopeOptions.length > 1 && (
                    <GlassSelect prefix="Batch" options={scopeOptions} value={selectedScope} onChange={changeScope} />
                )}
                <ButtonBase
                    onClick={downloadSummary}
                    disabled={history.length === 0}
                    sx={{
                        height: 44,
                        pl: "12px",
                        pr: "16px",
                        gap: "12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(140,140,140,0.5)",
                        boxShadow: "0px 4px 24px 0px rgba(0,0,0,0.16)",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
                        "&.Mui-disabled": { opacity: 0.5 },
                        "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" },
                    }}
                >
                    <Box component="img" src={DOWNLOAD_ICON} alt="" sx={{ width: 20, height: 20 }} />
                    <Typography sx={{ ...TYPE.smallMed14, color: COLORS.white, whiteSpace: "nowrap" }}>Download Summary</Typography>
                </ButtonBase>
            </Box>

            {loadingAttendance && !data ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress size={24} sx={{ color: COLORS.lessonDone }} />
                </Box>
            ) : (
                <>
                    {/* ── Stat cards ── */}
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))", lg: "repeat(5, minmax(0, 1fr))" },
                            gap: { xs: "12px", md: "24px" },
                        }}
                    >
                        {STAT_TONES.map((tone) => (
                            <StatCard key={tone.key} tone={tone} value={statValues[tone.key]} />
                        ))}
                    </Box>

                    {/* ── Chart + calendar ── */}
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 654fr) minmax(360px, 410fr)" },
                            gap: "24px",
                            alignItems: "stretch",
                        }}
                    >
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
                            <GlassCard angle="166.77deg">
                                <CardHeader
                                    title="Monthly Attendance"
                                    action={
                                        <GlassSelect
                                            prefix="Year"
                                            options={(years.length ? years : [activeYear]).map((year) => ({ value: String(year), label: String(year) }))}
                                            value={String(activeYear)}
                                            onChange={(value) => setChartYear(Number(value))}
                                        />
                                    }
                                />
                                <MonthlyChart values={monthlyValues} />
                            </GlassCard>
                            <EligibilityCard percentage={summary?.attendancePercentage ?? 0} held={summary?.totalSessionsHeld ?? 0} />
                        </Box>

                        <GlassCard angle="150.47deg" shadowLeft={22} shadowRight={404}>
                            <CardHeader
                                title="Day-Wise Attendance"
                                action={<GlassSelect compact options={calendarOptions} value={activeCalendar} onChange={setCalendarKey} />}
                            />
                            <DayWiseCalendar year={calYear} month={calMonth - 1} daily={daily} />
                        </GlassCard>
                    </Box>

                    {/* ── History ── */}
                    <GlassCard angle="172.69deg">
                        <CardHeader
                            title="Attendance History"
                            action={history.length > HISTORY_PREVIEW && (
                                <ButtonBase onClick={() => setShowAllHistory((v) => !v)} sx={{ ...glassButtonSx, pl: "16px", pr: "12px" }}>
                                    <Typography sx={{ ...TYPE.smallMed14, color: COLORS.white, whiteSpace: "nowrap" }}>
                                        {showAllHistory ? "Show Less" : "View All"}
                                    </Typography>
                                </ButtonBase>
                            )}
                        />
                        {history.length === 0 ? (
                            <Typography sx={{ ...TEXT.lato16, color: COLORS.neutral400, textAlign: "center", py: 3 }}>
                                No attendance records yet.
                            </Typography>
                        ) : (
                            <HistoryTable rows={visibleHistory} />
                        )}
                    </GlassCard>
                </>
            )}
        </Box>
    );
}
