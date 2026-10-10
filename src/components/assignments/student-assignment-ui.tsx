"use client";

import React from "react";
import Image from "next/image";
import { Box, ButtonBase, Typography, type SxProps, type Theme } from "@mui/material";
import { framedPanelSx } from "@/components/courses/my-courses-ui";
import { FONTS } from "@/components/courses/my-courses-theme";
import type { TaskDocumentInput } from "@/contexts/AssignmentContext";
import { formatFileSize } from "./assignment-ui";

/* Student "Tasks & Assignments" building blocks (Figma: LMS (3) › Batches › Task & Assignments). */

export const assignmentAsset = (name: string) => `/assignments/${name}`;

export const SA = {
    white: "#FFFFFF",
    n75: "#F2F2F2",
    n100: "#D9D9D9",
    n300: "#A6A6A6",
    n400: "#8C8C8C",
    n500: "#737373",
    n600: "#5A5A5A",
    n700: "#404040",
    n900: "#0D0D0D",
    primary100: "#BBC9ED",
    primary800: "#0E1934",
    link: "#6A8AD7",
    tealGradient: "linear-gradient(95.41deg, #2EC4B6 4.5235%, #1B4C33 104.18%)",
    goldGradient: "linear-gradient(90deg, #F1C40E 0%, #FF6000 100%)",
    accentBar: "linear-gradient(180deg, #2431B3 0%, #BE6E5D 50%, #BDA045 75%, #BAB31F 100%)",
    timelineLine: "linear-gradient(180deg, rgba(242,242,242,0.44) 0%, rgba(140,140,140,0.22) 100%)",
    dropdownBg: "rgba(38,38,38,0.88)",
    filterButtonBg: "rgba(38,38,38,0.44)",
} as const;

export const ST = {
    poppinsBold28: { fontFamily: FONTS.poppins, fontWeight: 700, fontSize: "28px", lineHeight: "42px" },
    poppinsBold20: { fontFamily: FONTS.poppins, fontWeight: 700, fontSize: "20px", lineHeight: "30px" },
    poppinsSemi20: { fontFamily: FONTS.poppins, fontWeight: 600, fontSize: "20px", lineHeight: "30px" },
    latoSemi18: { fontFamily: FONTS.lato, fontWeight: 600, fontSize: "18px", lineHeight: "27px" },
    latoMed18: { fontFamily: FONTS.lato, fontWeight: 500, fontSize: "18px", lineHeight: "27px" },
    latoMed16: { fontFamily: FONTS.lato, fontWeight: 500, fontSize: "16px", lineHeight: "24px" },
    latoReg16: { fontFamily: FONTS.lato, fontWeight: 400, fontSize: "16px", lineHeight: "24px" },
    latoMed14: { fontFamily: FONTS.lato, fontWeight: 500, fontSize: "14px", lineHeight: "21px" },
    latoReg14: { fontFamily: FONTS.lato, fontWeight: 400, fontSize: "14px", lineHeight: "21px" },
    latoMed12: { fontFamily: FONTS.lato, fontWeight: 500, fontSize: "12px", lineHeight: "18px" },
    latoReg12: { fontFamily: FONTS.lato, fontWeight: 400, fontSize: "12px", lineHeight: "18px" },
    interReg16: { fontFamily: FONTS.inter, fontWeight: 400, fontSize: "16px", lineHeight: "24px" },
    interMed14: { fontFamily: FONTS.inter, fontWeight: 500, fontSize: "14px", lineHeight: "21px" },
    interReg12: { fontFamily: FONTS.inter, fontWeight: 400, fontSize: "12px", lineHeight: "18px" },
} as const;

const focusRing = { "&.Mui-focusVisible": { outline: `2px solid ${SA.white}`, outlineOffset: "2px" } } as const;

/** Renders a design asset from /public/assignments at its native size. */
export function AssignmentIcon({ name, size, height, sx }: { name: string; size: number; height?: number; sx?: SxProps<Theme> }) {
    return (
        <Box aria-hidden sx={[{ lineHeight: 0, flexShrink: 0, pointerEvents: "none" }, ...(Array.isArray(sx) ? sx : [sx])]}>
            <Image src={assignmentAsset(name)} alt="" width={size} height={height ?? size} style={{ display: "block", maxWidth: "none" }} />
        </Box>
    );
}

/* ── Formatting ─────────────────────────────────────────────────────────── */

/** "May 12, 2026" */
export function formatShortDate(value: string | Date | null | undefined): string {
    if (!value) return "--";
    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** "12 April, 2026" */
export function formatLongDate(value: string | Date | null | undefined): string {
    if (!value) return "--";
    const date = new Date(value);
    return `${date.getDate()} ${date.toLocaleDateString("en-US", { month: "long" })}, ${date.getFullYear()}`;
}

/** "2:30 PM" */
export function formatTime(value: string | Date | null | undefined): string {
    if (!value) return "--";
    return new Date(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

/** "2 hours", "1 hour 30 min", "45 min" */
export function formatDuration(minutes: number | null | undefined): string {
    if (!minutes || minutes <= 0) return "--";
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    const hourText = hours > 0 ? `${hours} hour${hours === 1 ? "" : "s"}` : "";
    const minText = rest > 0 ? `${rest} min` : "";
    return [hourText, minText].filter(Boolean).join(" ");
}

/** Whole calendar days from `from` to `to`, never less than 1. */
export function daysTaken(from: string | Date, to: string | Date): number {
    const start = new Date(from);
    const end = new Date(to);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000));
}

export const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

/* ── Surfaces ───────────────────────────────────────────────────────────── */

/** Figma "Detail Card": frosted glass with a 0.88 white stroke and soft inner glow. */
export function detailCardSx(angle: string, gap = 24): SxProps<Theme> {
    return {
        ...framedPanelSx({ angle, highlight: "inset 0px 0px 6px 0px rgba(255,255,255,0.16)" }),
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: `${gap}px`,
        p: { xs: "20px", sm: "32px" },
        minWidth: 0,
        "& > *": { position: "relative" },
    };
}

export function CardHeading({ children, sx }: { children: React.ReactNode; sx?: SxProps<Theme> }) {
    return (
        <Typography component="h2" sx={[{ ...ST.poppinsBold20, color: SA.white }, ...(Array.isArray(sx) ? sx : [sx])]}>
            {children}
        </Typography>
    );
}

/* ── Pills ──────────────────────────────────────────────────────────────── */

export type PillTone = "primary" | "warning" | "error" | "success" | "teal";

const PILL_TONES: Record<PillTone, { bg: string; color: string }> = {
    primary: { bg: SA.primary100, color: SA.primary800 },
    warning: { bg: "#FFEFDC", color: "#FB8600" },
    error: { bg: "#F6D4D8", color: "#9D1F2E" },
    success: { bg: "#BBEDBB", color: "#0E340E" },
    teal: { bg: SA.tealGradient, color: SA.white },
};

/** Figma "Status Pills" — `sm` on cards (12px), `md` in Basic Details (16px). */
export function StatusPill({ label, tone, size = "sm" }: { label: string; tone: PillTone; size?: "sm" | "md" }) {
    const { bg, color } = PILL_TONES[tone];
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                maxWidth: "100%",
                px: "12px",
                py: size === "sm" ? "2px" : "4px",
                borderRadius: "50px",
                background: bg,
            }}
        >
            <Typography
                sx={{
                    ...(size === "sm" ? ST.latoReg12 : ST.latoMed16),
                    color,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
            >
                {label}
            </Typography>
        </Box>
    );
}

/* ── Buttons ────────────────────────────────────────────────────────────── */

/** Bordered "LMS Button" used on the assignment cards. */
export function OutlineButton({
    children,
    onClick,
    sx,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    sx?: SxProps<Theme>;
}) {
    return (
        <ButtonBase
            onClick={onClick}
            sx={[
                {
                    flex: "1 1 0",
                    minWidth: 0,
                    height: 44,
                    px: "16px",
                    borderRadius: "10px",
                    border: "1px solid rgba(227,233,248,0.32)",
                    boxShadow: "0px 0px 8px 0px rgba(255,255,255,0.12)",
                    ...ST.interMed14,
                    color: SA.white,
                    whiteSpace: "nowrap",
                    transition: "border-color .15s ease, background-color .15s ease",
                    "&:hover": { borderColor: "rgba(227,233,248,0.56)", bgcolor: "rgba(255,255,255,0.03)" },
                    ...focusRing,
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            {children}
        </ButtonBase>
    );
}

/** Dark "#404040" outline button from the success modals ("Back to Task 1"). */
export function GhostButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
    return (
        <ButtonBase
            onClick={onClick}
            sx={{
                flex: "1 1 0",
                minWidth: 0,
                height: 44,
                px: "24px",
                borderRadius: "10px",
                border: `1px solid ${SA.n700}`,
                ...ST.interMed14,
                color: SA.n100,
                whiteSpace: "nowrap",
                "&:hover": { borderColor: SA.n600, bgcolor: "rgba(255,255,255,0.03)" },
                ...focusRing,
            }}
        >
            {children}
        </ButtonBase>
    );
}

/** "Previous Task" / "Next Task" buttons in the bottom task bar. */
export function TaskNavButton({ direction, onClick }: { direction: "prev" | "next"; onClick: () => void }) {
    const isNext = direction === "next";
    return (
        <ButtonBase
            onClick={onClick}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                height: 44,
                pl: "12px",
                pr: "16px",
                flexDirection: isNext ? "row" : "row-reverse",
                borderRadius: "8px",
                border: "0.4px solid rgba(140,140,140,0.5)",
                backgroundImage: "linear-gradient(180deg, rgba(191,191,191,0.12) 0%, rgba(89,89,89,0.04) 100%)",
                boxShadow: "0px 4px 24px 0px rgba(0,0,0,0.16)",
                flexShrink: 0,
                "&:hover": { borderColor: "rgba(191,191,191,0.8)" },
                ...focusRing,
            }}
        >
            <Typography component="span" sx={{ ...ST.latoMed14, color: SA.white, whiteSpace: "nowrap" }}>
                {isNext ? "Next Task" : "Previous Task"}
            </Typography>
            <AssignmentIcon name={isNext ? "icon-arrow-right.svg" : "icon-arrow-left.svg"} size={20} />
        </ButtonBase>
    );
}

/** 20px bare icon action (replace / view / delete on an uploaded file). */
export function FileIconAction({
    icon,
    label,
    onClick,
    href,
    disabled,
}: {
    icon: string;
    label: string;
    onClick?: () => void;
    href?: string;
    disabled?: boolean;
}) {
    return (
        <ButtonBase
            aria-label={label}
            title={label}
            onClick={onClick}
            disabled={disabled}
            {...(href ? { component: "a", href, target: "_blank", rel: "noopener noreferrer" } : {})}
            sx={{
                width: 20,
                height: 20,
                borderRadius: "4px",
                flexShrink: 0,
                transition: "opacity .15s ease",
                "&:hover": { opacity: 0.75 },
                "&.Mui-disabled": { opacity: 0.4 },
                ...focusRing,
            }}
        >
            <AssignmentIcon name={icon} size={20} />
        </ButtonBase>
    );
}

/** 40px circular "view file" button shown once a submission is locked. */
export function ViewFileButton({ href }: { href: string }) {
    return (
        <ButtonBase
            component="a"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View file"
            sx={{
                width: 40,
                height: 40,
                flexShrink: 0,
                borderRadius: "99px",
                border: `1px solid ${SA.n700}`,
                bgcolor: "rgba(38,38,38,0.12)",
                boxShadow: "0px 5px 20px 0px rgba(0,0,0,0.02)",
                "&:hover": { borderColor: SA.n600 },
                ...focusRing,
            }}
        >
            <AssignmentIcon name="icon-eye-btn.svg" size={20} />
        </ButtonBase>
    );
}

/* ── Form controls ──────────────────────────────────────────────────────── */

export function Checkbox16({ checked }: { checked: boolean }) {
    return (
        <Box
            aria-hidden
            sx={{
                width: 16,
                height: 16,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                overflow: "hidden",
                background: checked ? "linear-gradient(90.71deg, #2EC4B6 4.5235%, #1B4C33 104.18%)" : "transparent",
                border: checked ? "none" : `1px solid ${SA.n500}`,
            }}
        >
            {checked && <AssignmentIcon name="icon-check-14.svg" size={14} />}
        </Box>
    );
}

export function Radio16({ checked }: { checked: boolean }) {
    return <AssignmentIcon name={checked ? "radio-checked.svg" : "radio-unchecked.svg"} size={16} />;
}

/* ── Files ──────────────────────────────────────────────────────────────── */

/** Uploaded file row ("content-wrapper" in Figma). */
export function FileRow({
    document,
    actions,
}: {
    document: Pick<TaskDocumentInput, "documentName" | "fileSizeInBytes">;
    actions?: React.ReactNode;
}) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                minHeight: 67,
                p: "16px",
                borderRadius: "16px",
                backgroundImage: "linear-gradient(90deg, rgba(38,38,38,0.5) 0%, rgba(140,140,140,0) 100%)",
                width: "100%",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                <Box sx={{ width: 40, height: 40, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AssignmentIcon name="file-icon.png" size={36} height={38} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                    <Typography
                        title={document.documentName}
                        sx={{ ...ST.latoMed16, color: SA.n75, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                        {document.documentName}
                    </Typography>
                    <Typography sx={{ ...ST.interReg12, color: SA.n300 }}>
                        {formatFileSize(document.fileSizeInBytes).replace(" ", "")}
                    </Typography>
                </Box>
            </Box>
            {actions && <Box sx={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>{actions}</Box>}
        </Box>
    );
}

/** "12 April, 2026 • 2:30 PM" */
export function DateTimeText({ value }: { value: string }) {
    const textSx = { ...ST.interReg12, color: SA.n300, whiteSpace: "nowrap" } as const;
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
            <Typography sx={textSx}>{formatLongDate(value)}</Typography>
            <Typography component="span" sx={{ ...ST.latoReg12, color: SA.n700, width: 7, pb: "4px", textAlign: "center" }}>
                •
            </Typography>
            <Typography sx={textSx}>{formatTime(value)}</Typography>
        </Box>
    );
}
