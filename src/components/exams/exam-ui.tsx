"use client";

import React from "react";
import Image from "next/image";
import { Box, ButtonBase, Snackbar, Tooltip, Typography, type SxProps, type Theme } from "@mui/material";
import { COLORS, FONTS, PRIMARY_BUTTON_FILL, TYPE } from "@/components/courses/my-courses-theme";
import { examAsset, type ExamStatus, type StageBadge } from "./exam-data";

const toArray = (sx?: SxProps<Theme>) => (sx === undefined ? [] : Array.isArray(sx) ? sx : [sx]);

export const focusRing = { "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" } } as const;

// ─── Tokens ────────────────────────────────────────────────────────────────

export const EXAM_COLORS = {
    correct: "#42CC42",
    incorrect: "#D1293D",
    trackFill: "rgba(90,90,90,0.32)",
    preferenceFill: "rgba(147,169,226,0.08)",
    footerFill: "rgba(227,233,248,0.03)",
    successFill: "rgba(187,237,187,0.08)",
    outlineStroke: "rgba(227,233,248,0.32)",
    softStroke: "rgba(227,233,248,0.1)",
    link: "#2EC4B6",
    panelStroke: "#508AF2",
} as const;

/** Figma "Status Pills" / success accent: teal → deep green. */
export const tealGradient = (angle: string, from: string, to: string) => `linear-gradient(${angle}, #2EC4B6 ${from}, #1B4C33 ${to})`;

/** Dark glass fill of the "Detail Card" frames (44% layer opacity baked into the stops). */
export const glassFill = (angle: string) =>
    `linear-gradient(${angle}, rgba(0,0,0,0.387) 1.3382%, rgba(10,9,9,0.282) 48.715%, rgba(102,102,102,0.009) 96.091%)`;

/** The cards' 1px stroke: white highlights on the top-left and bottom-right corners only. */
const cornerStroke = (angle: string) =>
    `linear-gradient(${angle}, rgba(255,255,255,0.44) 0%, rgba(255,255,255,0) 20.1%, rgba(255,255,255,0) 74.2%, rgba(255,255,255,0.44) 100%)`;

/** Paints `paint` only inside a `width` ring (CSS `padding` shorthand) that follows the border radius. */
export const strokeLayer = (paint: string, width = "1px") => ({
    content: '""',
    position: "absolute" as const,
    inset: 0,
    borderRadius: "inherit",
    padding: width,
    backgroundImage: paint,
    WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
    pointerEvents: "none" as const,
    zIndex: 2,
});

/** Frosted "Detail Card": glass fill, 24px background blur, corner stroke and an inner glow. */
export const glassCardSx = ({ angle, radius, innerShadow = "inset 0px 0px 6px 0px rgba(255,255,255,0.16)" }: {
    angle: string;
    radius: number;
    innerShadow?: string;
}) => ({
    position: "relative" as const,
    overflow: "hidden",
    borderRadius: `${radius}px`,
    backgroundImage: glassFill(angle),
    backdropFilter: "blur(12px)",
    boxShadow: innerShadow,
    "&::before": strokeLayer(cornerStroke(angle)),
});

/** Chip surface: 4% white, 30px background blur and a stroke fading out towards the bottom. */
export const chipSurfaceSx = {
    position: "relative" as const,
    overflow: "hidden",
    borderRadius: "12px",
    bgcolor: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(15px)",
    "&::before": strokeLayer("linear-gradient(180deg, rgba(191,191,191,0.5) 0%, rgba(89,89,89,0) 100%)"),
};

// ─── Pills ─────────────────────────────────────────────────────────────────

const REQUEST_PILL: Record<ExamStatus | "not-cleared", { bg: string; color: string; dot: string }> = {
    ongoing: { bg: "#FFEFDC", color: "#FB8600", dot: "dot-ongoing.svg" },
    locked: { bg: "#D9D9D9", color: "#262626", dot: "dot-locked.svg" },
    completed: { bg: "#BBEDBB", color: "#195C19", dot: "dot-completed.svg" },
    "re-exam": { bg: "#F6D4D8", color: "#D1293D", dot: "dot-re-exam.svg" },
    "not-cleared": { bg: "#F6D4D8", color: "#9D1F2E", dot: "dot-not-cleared.svg" },
};

/** Design-system "Request Status Pill": tinted capsule with a 5px dot. */
export function RequestStatusPill({ tone, label, size = "sm" }: { tone: keyof typeof REQUEST_PILL; label: string; size?: "sm" | "md" }) {
    const palette = REQUEST_PILL[tone];
    return (
        <Box
            component="span"
            sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                flexShrink: 0,
                px: "8px",
                py: "2px",
                borderRadius: "999px",
                bgcolor: palette.bg,
            }}
        >
            <Image src={examAsset(palette.dot)} alt="" width={5} height={5} />
            <Typography
                component="span"
                sx={{
                    ...(size === "md" ? TYPE.mediumMed16 : TYPE.smallMed14),
                    color: palette.color,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                }}
            >
                {label}
            </Typography>
        </Box>
    );
}

/** Round badge next to a stage title ("Eligible" / "Not Cleared"). */
export function StageBadgePill({ badge }: { badge: StageBadge }) {
    if (badge === "not-cleared") return <RequestStatusPill tone="not-cleared" label="Not Cleared" size="md" />;
    return <TealPill angle="94.308deg" label="Eligible" />;
}

/** Teal "Status Pills" capsule ("Eligible", "Verified - Authentic"). */
export function TealPill({ label, angle }: { label: string; angle: string }) {
    return (
        <Box
            component="span"
            sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                px: "12px",
                py: "2px",
                borderRadius: "50px",
                backgroundImage: tealGradient(angle, "37.861%", "103.75%"),
            }}
        >
            <Typography component="span" noWrap sx={{ ...TYPE.mediumMed16, color: COLORS.white }}>
                {label}
            </Typography>
        </Box>
    );
}

// ─── Chips ─────────────────────────────────────────────────────────────────

/** Stage meta chip: 24px icon, then either a value + unit ("150 questions") or a single label ("Offline"). */
export function MetaChip({ icon, value, unit, unitWeight = 500 }: { icon: string; value: React.ReactNode; unit?: string; unitWeight?: 400 | 500 }) {
    return (
        <Box sx={{ ...chipSurfaceSx, display: "flex", alignItems: "center", gap: "12px", flexShrink: 0, px: "16px", py: "12px" }}>
            <Image src={examAsset(icon)} alt="" width={24} height={24} style={{ position: "relative" }} />
            <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}>
                <Typography component="span" sx={{ ...TYPE.mediumMed16, color: COLORS.neutral75 }}>
                    {value}
                </Typography>
                {unit && (
                    <Typography component="span" sx={{ fontFamily: FONTS.lato, fontWeight: unitWeight, fontSize: "14px", lineHeight: "21px", color: COLORS.neutral300 }}>
                        {unit}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

/** Small "Includes" tag on the exam cards. */
export function IncludeChip({ label }: { label: string }) {
    return (
        <Box sx={{ ...chipSurfaceSx, display: "flex", alignItems: "center", flexShrink: 0, px: "12px", py: "8px" }}>
            <Typography component="span" noWrap sx={{ position: "relative", fontFamily: FONTS.lato, fontWeight: 400, fontSize: "14px", lineHeight: "21px", color: COLORS.neutral100 }}>
                {label}
            </Typography>
        </Box>
    );
}

// ─── Buttons ───────────────────────────────────────────────────────────────

/** Outlined "LMS Button" (Locked, Download Result, Print Certificate). Figma draws the stroke outside the box. */
export function OutlineButton({
    children,
    icon,
    onClick,
    disabled,
    stroke = "1px",
    strokeColor = EXAM_COLORS.outlineStroke,
    sx,
    ariaLabel,
}: {
    children: React.ReactNode;
    icon?: string;
    onClick?: () => void;
    disabled?: boolean;
    stroke?: "1px" | "2px";
    strokeColor?: string;
    sx?: SxProps<Theme>;
    ariaLabel?: string;
}) {
    return (
        <ButtonBase
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel}
            sx={[
                {
                    flexShrink: 0,
                    height: 44,
                    gap: "12px",
                    p: "16px",
                    borderRadius: "10px",
                    boxShadow: `0 0 0 ${stroke} ${strokeColor}, 0px 0px 8px 0px rgba(255,255,255,0.12)`,
                    transition: "background-color .18s ease, box-shadow .18s ease",
                    "&:hover": {
                        bgcolor: "rgba(255,255,255,0.04)",
                        boxShadow: `0 0 0 ${stroke} rgba(227,233,248,0.5), 0px 0px 8px 0px rgba(255,255,255,0.12)`,
                    },
                    "&.Mui-disabled": { cursor: "not-allowed", pointerEvents: "auto" },
                    "&.Mui-disabled:hover": { bgcolor: "transparent" },
                    ...focusRing,
                },
                ...toArray(sx),
            ]}
        >
            {icon && <Image src={examAsset(icon)} alt="" width={18} height={18} />}
            <Typography component="span" sx={{ ...TYPE.buttonMed14, color: COLORS.white, whiteSpace: "nowrap" }}>
                {children}
            </Typography>
        </ButtonBase>
    );
}

/** Compact gradient CTA on the exam cards ("Start Exam →"). */
export function CardPrimaryButton({ children, onClick }: { children: React.ReactNode; onClick: (e: React.MouseEvent) => void }) {
    return (
        <ButtonBase
            onClick={onClick}
            sx={{
                flexShrink: 0,
                height: 36,
                gap: "8px",
                p: "16px",
                borderRadius: "10px",
                backgroundImage: PRIMARY_BUTTON_FILL,
                filter: "drop-shadow(0px 0px 4px rgba(255,255,255,0.12))",
                transition: "filter .18s ease",
                "&:hover": { filter: "drop-shadow(0px 0px 10px rgba(140,36,255,0.55))" },
                ...focusRing,
            }}
        >
            <Typography component="span" sx={{ ...TYPE.smallMed14, color: COLORS.neutral100, whiteSpace: "nowrap" }}>
                {children}
            </Typography>
            <Image src={examAsset("icon-arrow-right.svg")} alt="" width={16} height={16} />
        </ButtonBase>
    );
}

/** Compact outlined CTA on the exam cards ("View Details →"). */
export function CardOutlineButton({ children, onClick }: { children: React.ReactNode; onClick: (e: React.MouseEvent) => void }) {
    return (
        <ButtonBase
            onClick={onClick}
            sx={{
                flexShrink: 0,
                height: 36,
                gap: "8px",
                pl: "16px",
                pr: "12px",
                borderRadius: "8px",
                boxShadow: `0 0 0 1px ${EXAM_COLORS.outlineStroke}, 0px 0px 8px 0px rgba(255,255,255,0.12)`,
                transition: "background-color .18s ease",
                "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                ...focusRing,
            }}
        >
            <Typography component="span" sx={{ ...TYPE.smallMed14, color: COLORS.neutral100, whiteSpace: "nowrap" }}>
                {children}
            </Typography>
            <Image src={examAsset("icon-arrow-right.svg")} alt="" width={16} height={16} />
        </ButtonBase>
    );
}

// ─── Misc ──────────────────────────────────────────────────────────────────

/** Bottom snackbar for action feedback on the exam pages. */
export function ExamNotice({ message, onClose }: { message: string | null; onClose: () => void }) {
    return (
        <Snackbar
            open={Boolean(message)}
            onClose={onClose}
            autoHideDuration={3500}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            message={message}
            slotProps={{
                content: {
                    sx: {
                        ...TYPE.smallMed14,
                        color: COLORS.neutral75,
                        bgcolor: "rgba(20,20,32,0.96)",
                        border: "1px solid rgba(80,138,242,0.4)",
                        borderRadius: "12px",
                        backdropFilter: "blur(12px)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                    },
                },
            }}
        />
    );
}

/** 20px info glyph that reveals the round's description. */
export function InfoTooltip({ title }: { title: string }) {
    return (
        <Tooltip
            title={title}
            arrow
            placement="top"
            slotProps={{
                tooltip: {
                    sx: {
                        ...TYPE.xsMed12,
                        color: COLORS.neutral75,
                        bgcolor: "rgba(20,20,32,0.96)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "8px",
                        px: "10px",
                        py: "6px",
                    },
                },
                arrow: { sx: { color: "rgba(20,20,32,0.96)" } },
            }}
        >
            <Box
                component="span"
                tabIndex={0}
                aria-label={title}
                sx={{
                    display: "inline-flex",
                    flexShrink: 0,
                    borderRadius: "50%",
                    cursor: "help",
                    "&:focus-visible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" },
                }}
            >
                <Image src={examAsset("icon-info.svg")} alt="" width={20} height={20} />
            </Box>
        </Tooltip>
    );
}

/** Figma's rotated blur layer: an outer box, a transformed inner box and an image bled past it. */
export function GlowLayer({
    src,
    left,
    top,
    width,
    height,
    innerWidth,
    innerHeight,
    transform,
    inset,
}: {
    src: string;
    left: number;
    top: number;
    width: number;
    height: number;
    innerWidth: number;
    innerHeight: number;
    transform: string;
    inset: string;
}) {
    return (
        <Box aria-hidden sx={{ position: "absolute", left, top, width, height, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <Box sx={{ position: "relative", flex: "none", width: innerWidth, height: innerHeight, transform }}>
                <Box sx={{ position: "absolute", inset }}>
                    <Box component="img" src={src} alt="" sx={{ display: "block", width: "100%", height: "100%", maxWidth: "none" }} />
                </Box>
            </Box>
        </Box>
    );
}
