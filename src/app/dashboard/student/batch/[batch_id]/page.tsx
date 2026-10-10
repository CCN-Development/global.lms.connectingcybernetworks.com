"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Box, ButtonBase, CircularProgress, Typography, type SxProps, type Theme } from "@mui/material";
import RichTextView from "@/components/editor/RichTextView";
import { COLORS, FONTS, TYPE } from "@/components/courses/my-courses-theme";
import { framedPanelSx } from "@/components/courses/my-courses-ui";
import { MONTH_LONG, formatUTCClock } from "@/components/batches/batch-format";
import TrainerProfileModal, { TrainerAvatar, trainerSubtitle } from "@/components/batches/TrainerProfileModal";
import { useStudent, type StudentBatchDetail, type StudentBatchTrainer } from "@/contexts/StudentContext";

const ASSET = "/batches/detail";
const NOISE = "/profile/summary-noise.png";

const WEEK_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS: Record<string, string> = {
    sun: "Sunday", mon: "Monday", tue: "Tuesday", wed: "Wednesday",
    thu: "Thursday", fri: "Friday", sat: "Saturday",
};

const TEXT = {
    interMed16: { fontFamily: FONTS.inter, fontWeight: 500, fontSize: "16px", lineHeight: "24px" },
    interReg14: { fontFamily: FONTS.inter, fontWeight: 400, fontSize: "14px", lineHeight: "21px" },
    interSemi18: { fontFamily: FONTS.inter, fontWeight: 600, fontSize: "18px", lineHeight: "27px" },
    latoSemi12: { ...TYPE.xsMed12, fontWeight: 600 },
} as const;

const DATE_CHIP_FILL = "linear-gradient(154.64deg, rgba(140,36,255,0.24) 9.0161%, rgba(14,25,52,0.24) 89.867%)";
const INSTRUCTOR_ROW_FILL = "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(153,153,153,0.04) 100%)";

function ordinal(day: number): string {
    const rem100 = day % 100;
    if (rem100 >= 11 && rem100 <= 13) return `${day}th`;
    return `${day}${{ 1: "st", 2: "nd", 3: "rd" }[day % 10] ?? "th"}`;
}

/** Batch dates are stored as UTC calendar dates → "12th January, 2026". */
function formatLongDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return `${ordinal(date.getUTCDate())} ${MONTH_LONG[date.getUTCMonth()]}, ${date.getUTCFullYear()}`;
}

function formatMode(mode: string | null): string {
    const value = (mode ?? "").trim();
    return value ? value[0].toUpperCase() + value.slice(1).toLowerCase() : "Not specified";
}

/** Consecutive weekdays collapse to a range ("Tuesday - Friday"); anything else is listed. */
function formatDays(days: string[] | null | undefined): string | null {
    const keys = (days ?? []).map((d) => d.trim().toLowerCase().slice(0, 3));
    const known = keys.filter((k) => DAY_LABELS[k]);
    if (known.length === 0) return days?.length ? days.join(", ") : null;
    const ordered = [...new Set(known)].sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b));
    if (ordered.length === 1) return DAY_LABELS[ordered[0]];
    const consecutive = ordered.every((k, i) => i === 0 || WEEK_ORDER.indexOf(k) === WEEK_ORDER.indexOf(ordered[i - 1]) + 1);
    return consecutive
        ? `${DAY_LABELS[ordered[0]]} - ${DAY_LABELS[ordered[ordered.length - 1]]}`
        : ordered.map((k) => DAY_LABELS[k]).join(", ");
}

function PinIcon() {
    return (
        <Box sx={{ position: "relative", width: 24, height: 24, flexShrink: 0 }}>
            <Box component="img" src={`${ASSET}/icon-pin-head.svg`} alt="" sx={{ position: "absolute", left: "6.73px", top: 0, width: "10.54px", height: "10.54px" }} />
            <Box component="img" src={`${ASSET}/icon-pin-needle.svg`} alt="" sx={{ position: "absolute", left: "11.226px", top: "9.727px", width: "1.548px", height: "14.272px" }} />
        </Box>
    );
}

function Icon24({ name }: { name: string }) {
    return <Box component="img" src={`${ASSET}/${name}`} alt="" sx={{ width: 24, height: 24, flexShrink: 0 }} />;
}

function buildBatchInfo(batch: StudentBatchDetail) {
    const start = formatUTCClock(batch.classStartTime);
    const end = formatUTCClock(batch.classEndTime);
    const timing = start && end ? `${start} - ${end}` : start || batch.classTiming;
    const trainerNames = batch.batchTrainers.map((item) => item.trainer.trainerName).join(", ");

    return [
        { key: "time", icon: <Icon24 name="icon-clock.svg" />, value: timing },
        { key: "days", icon: <Icon24 name="icon-calendar.svg" />, value: formatDays(batch.batchDays) },
        { key: "mode", icon: <PinIcon />, value: formatMode(batch.mode) },
        { key: "trainer", icon: <Icon24 name="icon-user.svg" />, value: trainerNames || null },
        { key: "room", icon: <Icon24 name="icon-star.svg" />, value: batch.classRoomNumber },
    ].filter((row) => Boolean(row.value));
}

/** Blurred top/bottom edge highlights every Figma "Detail Card" carries. */
function CardGlow({ src, height, bottom = -1 }: { src: string; height: number; bottom?: number }) {
    const base: SxProps<Theme> = {
        position: "absolute",
        left: 4,
        width: "calc(100% - 5px)",
        height,
        filter: "blur(50px)",
        pointerEvents: "none",
        objectFit: "cover",
    };
    return (
        <>
            <Box component="img" aria-hidden src={src} alt="" sx={{ ...base, top: -7 } as SxProps<Theme>} />
            <Box component="img" aria-hidden src={src} alt="" sx={{ ...base, bottom, transform: "scaleY(-1)" } as SxProps<Theme>} />
        </>
    );
}

function DetailCard({
    angle,
    glow,
    glowBottom,
    children,
}: {
    angle: string;
    glow: "wide" | "narrow";
    glowBottom?: number;
    children: React.ReactNode;
}) {
    return (
        <Box
            sx={{
                ...framedPanelSx({ angle }),
                overflow: "hidden",
                width: "100%",
                p: { xs: "20px", sm: "32px" },
                display: "flex",
                flexDirection: "column",
                gap: "32px",
                "& > :not(img)": { position: "relative", zIndex: 1 },
            }}
        >
            {glow === "wide"
                ? <CardGlow src={`${ASSET}/card-glow-wide.png`} height={11} bottom={glowBottom} />
                : <CardGlow src={`${ASSET}/card-glow.png`} height={8} bottom={glowBottom} />}
            {children}
        </Box>
    );
}

function CardTitle({ children }: { children: React.ReactNode }) {
    return (
        <Typography component="h2" sx={{ ...TYPE.headingSemibold20, color: COLORS.white }}>
            {children}
        </Typography>
    );
}

function OutlineButton({
    icon,
    label,
    tone,
    onClick,
}: {
    icon: string;
    label: string;
    tone: "solid" | "outline" | "muted";
    onClick?: () => void;
}) {
    const tones = {
        solid: { bg: COLORS.white, border: "#5A5A5A", color: "#262626", text: TEXT.latoSemi12, hover: "#E6E6E6" },
        outline: { bg: "transparent", border: COLORS.neutral300, color: COLORS.white, text: TEXT.latoSemi12, hover: "rgba(255,255,255,0.08)" },
        muted: { bg: "transparent", border: "#5A5A5A", color: COLORS.neutral100, text: TYPE.xsMed12, hover: "rgba(255,255,255,0.06)" },
    }[tone];

    return (
        <ButtonBase
            onClick={onClick}
            sx={{
                height: 36,
                px: "12px",
                py: "8px",
                gap: "10px",
                flexShrink: 0,
                borderRadius: "8px",
                border: `1px solid ${tones.border}`,
                bgcolor: tones.bg,
                transition: "background-color .18s ease",
                "&:hover": { bgcolor: tones.hover },
                "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" },
            }}
        >
            <Box component="img" src={`${ASSET}/${icon}`} alt="" sx={{ width: 16, height: 16 }} />
            <Typography sx={{ ...tones.text, color: tones.color, whiteSpace: "nowrap" }}>{label}</Typography>
        </ButtonBase>
    );
}

function DateColumn({ label, value }: { label: string; value: string }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
            <Typography sx={{ ...TEXT.interReg14, color: COLORS.neutral300, whiteSpace: "nowrap" }}>{label}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", px: { xs: "12px", sm: "16px" }, py: "8px", borderRadius: "99px", backgroundImage: DATE_CHIP_FILL }}>
                <Typography sx={{ ...TEXT.interMed16, fontSize: { xs: "14px", sm: "16px" }, color: COLORS.neutral100, whiteSpace: "nowrap" }}>
                    {value}
                </Typography>
            </Box>
        </Box>
    );
}

function SyllabusCard() {
    return (
        <Box
            sx={{
                position: "relative",
                overflow: "hidden",
                width: "100%",
                minHeight: 206,
                p: "24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "32px",
                borderRadius: "30px",
                border: "1px solid rgba(255,255,255,0.29)",
                bgcolor: "#07051B",
            }}
        >
            <Box
                component="img"
                aria-hidden
                src={`${ASSET}/syllabus-rays.svg`}
                alt=""
                sx={{
                    position: "absolute",
                    left: "-64.92px",
                    top: "-223.67px",
                    width: "881.112px",
                    height: "535.442px",
                    maxWidth: "none",
                    transform: "rotate(180deg)",
                    opacity: 0.44,
                    pointerEvents: "none",
                }}
            />
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
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `url(${NOISE})`,
                        backgroundSize: "568px 568px",
                        backgroundPosition: "top left",
                        opacity: 0.1,
                    },
                }}
            />
            <Box
                aria-hidden
                sx={{
                    position: "absolute",
                    right: { xs: "-76px", sm: "-25.13px" },
                    top: { xs: "auto", sm: "-5.48px" },
                    bottom: { xs: "-40px", sm: "auto" },
                    width: "285.793px",
                    height: "214.345px",
                    transform: { xs: "rotate(-17.23deg) scale(0.5)", sm: "rotate(-17.23deg)" },
                    pointerEvents: "none",
                }}
            >
                <Image
                    src={`${ASSET}/syllabus-cap.png`}
                    alt=""
                    width={286}
                    height={214}
                    sizes="286px"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
            </Box>

            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: 365 }}>
                <CardTitle>Course Syllabus</CardTitle>
                <Typography sx={{ ...TYPE.interReg16, color: COLORS.neutral75 }}>
                    Get a complete overview of the course structure, topics, and timeline.
                </Typography>
            </Box>

            <Box sx={{ position: "relative", display: "flex", flexWrap: "wrap", gap: "12px" }}>
                <OutlineButton tone="solid" icon="icon-eye-dark.svg" label="View Syllabus" />
                <OutlineButton tone="outline" icon="icon-download.svg" label="Download Syllabus" />
            </Box>
        </Box>
    );
}

export default function BatchDetailPage() {
    const params = useParams();
    const batchId = params?.batch_id as string;
    const { batchDetail, loadingBatchDetail, enrolledBatches, getEnrolledBatches } = useStudent();
    const [profileTrainer, setProfileTrainer] = useState<StudentBatchTrainer | null>(null);

    const batch = batchDetail?.batchId === batchId ? batchDetail : null;
    const infoRows = useMemo(() => (batch ? buildBatchInfo(batch) : []), [batch]);

    // "Your trainer for": this batch plus any other enrolled batch the trainer teaches.
    const trainerFor = useMemo(() => {
        if (!profileTrainer || !batch) return [];
        const label = (courseName: string | undefined, batchName: string) =>
            courseName && courseName.trim().toLowerCase() !== batchName.trim().toLowerCase() ? `${courseName} — ${batchName}` : batchName;
        const items = [label(batch.course?.courseName, batch.batchName)];
        for (const enrollment of enrolledBatches) {
            const other = enrollment.batch;
            if (other.batchId === batch.batchId) continue;
            if (other.batchTrainers.some(({ trainer }) => trainer.trainerId === profileTrainer.trainerId)) {
                items.push(label(other.course?.courseName, other.batchName));
            }
        }
        return [...new Set(items)];
    }, [profileTrainer, batch, enrolledBatches]);

    const openProfile = (trainer: StudentBatchTrainer) => {
        setProfileTrainer(trainer);
        if (enrolledBatches.length === 0) getEnrolledBatches();
    };

    if (loadingBatchDetail && !batch) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={24} sx={{ color: COLORS.purple }} />
            </Box>
        );
    }

    if (!batch) {
        return (
            <Typography sx={{ ...TEXT.interReg14, color: COLORS.neutral400, textAlign: "center", py: 6 }}>
                Batch not found.
            </Typography>
        );
    }

    const trainers = batch.batchTrainers.map((item) => item.trainer);

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 420px)", lg: "minmax(0, 1fr) 481px" },
                gap: "24px",
                alignItems: "start",
                pt: { xs: "8px", md: "13px" },
                pb: "24px",
            }}
        >
            {/* ── Left Column ── */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
                <DetailCard angle="159.34deg" glow="wide">
                    <CardTitle>About Course</CardTitle>
                    {batch.batchDescription ? (
                        <Box
                            sx={{
                                ...TYPE.interReg16,
                                color: COLORS.neutral75,
                                wordBreak: "break-word",
                                "& .rich-text": { fontSize: "16px", lineHeight: "24px", color: COLORS.neutral75 },
                                "& p": { m: 0, mb: "24px" },
                                "& p:last-child": { mb: 0 },
                                "& ul, & ol": { pl: 3, m: 0, mb: "24px" },
                                "& li": { mb: 0.5 },
                                "& strong": { color: COLORS.white },
                                "& a": { color: "#93A9E2" },
                            }}
                        >
                            <RichTextView html={batch.batchDescription} />
                        </Box>
                    ) : (
                        <Typography sx={{ ...TYPE.interReg16, color: COLORS.neutral400 }}>
                            No description has been added for this batch yet.
                        </Typography>
                    )}
                </DetailCard>

                <SyllabusCard />
            </Box>

            {/* ── Right Column ── */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
                <DetailCard angle="164.45deg" glow="narrow">
                    <CardTitle>Batch Info</CardTitle>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <Box sx={{ display: "flex", alignItems: "center", flexWrap: { xs: "wrap", sm: "nowrap" }, gap: { xs: "12px", sm: "16px" } }}>
                            <DateColumn label="Starting at" value={formatLongDate(batch.batchStartDate)} />
                            <Box sx={{ flex: 1, alignSelf: "stretch", display: { xs: "none", sm: "flex" }, alignItems: "center", justifyContent: "center", pt: "24px", minWidth: 0 }}>
                                <Box component="img" src={`${ASSET}/date-connector.svg`} alt="" sx={{ width: "30.333px", height: "5.333px", flexShrink: 0 }} />
                            </Box>
                            <DateColumn label="Ending at" value={formatLongDate(batch.batchEndDate)} />
                        </Box>

                        {infoRows.length > 0 && (
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" },
                                    rowGap: "24px",
                                    columnGap: "16px",
                                    p: "16px",
                                    border: "1px dashed #404040",
                                    borderRadius: "18px",
                                }}
                            >
                                {infoRows.map(({ key, icon, value }) => (
                                    <Box key={key} sx={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                                        {icon}
                                        <Typography sx={{ ...TEXT.interMed16, color: COLORS.neutral100, minWidth: 0, wordBreak: "break-word" }}>
                                            {value}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                </DetailCard>

                <DetailCard angle="166.68deg" glow="narrow" glowBottom={-8}>
                    <CardTitle>Instructors</CardTitle>
                    {trainers.length === 0 ? (
                        <Typography sx={{ ...TYPE.interReg16, color: COLORS.neutral400 }}>
                            No trainer has been assigned yet.
                        </Typography>
                    ) : (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            {trainers.map((trainer) => (
                                <Box
                                    key={trainer.trainerId}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        flexWrap: { xs: "wrap", sm: "nowrap" },
                                        gap: { xs: "16px", sm: "32px" },
                                        p: "16px",
                                        borderRadius: "18px",
                                        border: "1px solid rgba(64,64,64,0.24)",
                                        backgroundImage: INSTRUCTOR_ROW_FILL,
                                    }}
                                >
                                    <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                                        <TrainerAvatar trainer={trainer} size={50} />
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                                            <Typography noWrap sx={{ ...TEXT.interSemi18, color: COLORS.neutral100 }}>
                                                {trainer.trainerName}
                                            </Typography>
                                            <Typography noWrap sx={{ ...TEXT.interReg14, color: COLORS.neutral300 }}>
                                                {trainerSubtitle(trainer)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <OutlineButton tone="muted" icon="icon-eye.svg" label="View Full Profile" onClick={() => openProfile(trainer)} />
                                </Box>
                            ))}
                        </Box>
                    )}
                </DetailCard>
            </Box>

            <TrainerProfileModal trainer={profileTrainer} trainerFor={trainerFor} onClose={() => setProfileTrainer(null)} />
        </Box>
    );
}
