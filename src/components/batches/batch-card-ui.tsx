"use client";
import React from "react";
import { Box, Button, Typography } from "@mui/material";

/* Shared building blocks for the student "My Batches" cards (Figma: LMS (3) → Batches). */

export const FONT_INTER = "var(--font-sans), Inter, Arial, sans-serif";
export const FONT_LATO = "var(--font-lato), Lato, Arial, sans-serif";
export const FONT_POPPINS = "var(--font-poppins), Poppins, Arial, sans-serif";

export const ACTION_GRADIENT =
    "linear-gradient(90deg, #0027AC 0%, #0B22AC 12.5%, #161DAC 25%, #2C14AC 43.572%, #4608AC 65.007%, #4F04AC 82.544%, #5900AC 100%)";
export const TOPIC_BAR_GRADIENT = "linear-gradient(180deg, #2431B3 0%, #BE6E5D 50%, #BDA045 75%, #BAB31F 100%)";
export const TIMELINE_LINE_GRADIENT = "linear-gradient(180deg, rgba(242,242,242,0.44) 0%, rgba(140,140,140,0.22) 100%)";

/** Figma strokes are gradients, so they are painted on a masked pseudo-element. */
const gradientStroke = (paint: string, width = "1px") => ({
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

/** A blurred glow from Figma: a 553px SVG centred on (`cx`, `cy`) of a 153px ellipse. */
export function Glow({
    src, left, right, top, rotate = 0,
}: { src: string; left?: number; right?: number; top: number; rotate?: number }) {
    return (
        <Box
            component="img"
            src={src}
            alt=""
            aria-hidden
            sx={{
                position: "absolute",
                width: 553,
                height: 553,
                maxWidth: "none",
                top,
                ...(left !== undefined ? { left } : { right }),
                transform: rotate ? `rotate(${rotate}deg)` : undefined,
                pointerEvents: "none",
                zIndex: 0,
            }}
        />
    );
}

/* ── Card shell ────────────────────────────────────────────────────────────── */

export function BatchCardShell({
    title, gap = 12, badge, children,
}: { title: string; gap?: number; badge?: React.ReactNode; children: React.ReactNode }) {
    return (
        <Box
            sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                borderRadius: "20px",
                overflow: "hidden",
                backgroundImage: "linear-gradient(180deg, rgba(140,36,255,0.32) 0%, rgba(255,255,255,0) 77.415%)",
                boxShadow: "0 10px 50px rgba(0,0,0,0.12)",
                "&::before": gradientStroke("linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,0.04) 100%)"),
            }}
        >
            <Glow src="/batches/card-glow-1.svg" right={-392.5} top={-229.5} rotate={-8.33} />
            <Glow src="/batches/card-glow-2.svg" right={-278.5} top={-294} rotate={-8.33} />

            <Box sx={{ position: "relative", zIndex: 1, px: "20px", py: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Typography
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        fontFamily: FONT_INTER,
                        fontWeight: 600,
                        fontSize: "16px",
                        lineHeight: "24px",
                        color: "#fff",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                    title={title}
                >
                    {title}
                </Typography>
                {badge}
            </Box>

            <Box sx={{ position: "relative", zIndex: 1, px: "2px", flex: 1, display: "flex", flexDirection: "column" }}>
                <Box
                    sx={{
                        flex: 1,
                        bgcolor: "rgba(13,13,13,0.9)",
                        borderRadius: "24px",
                        p: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: `${gap}px`,
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
}

/* ── Stats ─────────────────────────────────────────────────────────────────── */

export function StatGrid({ children, columnGap = 0 }: { children: React.ReactNode; columnGap?: number }) {
    return (
        <Box
            sx={{
                border: "1px dashed #262626",
                borderRadius: "18px",
                // Figma strokes sit inside the frame, so the 1px border is taken out of the 16px padding.
                p: "15px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                alignItems: "center",
                columnGap: `${columnGap}px`,
                rowGap: "16px",
            }}
        >
            {children}
        </Box>
    );
}

export const STAT_LABEL_SX = {
    fontFamily: FONT_LATO,
    fontSize: "12px",
    lineHeight: "18px",
    color: "#a6a6a6",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
};

export const STAT_VALUE_SX = {
    fontFamily: FONT_INTER,
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "21px",
    color: "#d9d9d9",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
};

export function Stat({ label, value, children }: { label: string; value?: React.ReactNode; children?: React.ReactNode }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0, justifyContent: "center" }}>
            <Typography sx={STAT_LABEL_SX}>{label}</Typography>
            {children ?? <Typography sx={STAT_VALUE_SX}>{value}</Typography>}
        </Box>
    );
}

export type CardTrainer = { name: string; avatar?: string };

function initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/** Trainer avatars — the API has no trainer photo yet, so initials are shown until it does. */
export function TrainersStat({ trainers }: { trainers: CardTrainer[] }) {
    if (trainers.length === 0) return <Stat label="Trainers" value="Not assigned" />;
    const shown = trainers.slice(0, 3);
    return (
        <Stat label={`${trainers.length} Trainer${trainers.length === 1 ? "" : "s"}`}>
            <Box sx={{ display: "flex", alignItems: "center", height: 24 }}>
                {shown.map((trainer, index) => (
                    <Box
                        key={`${trainer.name}-${index}`}
                        title={trainer.name}
                        sx={{
                            width: 24,
                            height: 24,
                            mr: index < shown.length - 1 ? "-4px" : 0,
                            borderRadius: "59.4px",
                            border: index === 0 ? "0.6px solid #e3e9f8" : "0.6px solid rgba(0,0,0,0.44)",
                            bgcolor: "#e3e9f8",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            fontFamily: FONT_INTER,
                            fontSize: "9px",
                            fontWeight: 700,
                            color: "#2F53AD",
                        }}
                    >
                        {trainer.avatar
                            ? <Box component="img" src={trainer.avatar} alt={trainer.name} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : initials(trainer.name)}
                    </Box>
                ))}
            </Box>
        </Stat>
    );
}

const STATUS_PILL = {
    Pending: { bg: "#ffefdc", color: "#fb8600" },
    Approved: { bg: "#d9f8ec", color: "#00a870" },
    Rejected: { bg: "#ffe1e4", color: "#c02638" },
} as const;

export function StatusPill({ status }: { status: keyof typeof STATUS_PILL }) {
    const palette = STATUS_PILL[status];
    return (
        <Box
            component="span"
            sx={{
                alignSelf: "flex-start",
                display: "inline-flex",
                alignItems: "center",
                px: "8px",
                py: "2px",
                borderRadius: "99px",
                bgcolor: palette.bg,
                color: palette.color,
                fontFamily: FONT_INTER,
                fontSize: "12px",
                lineHeight: "18px",
            }}
        >
            {status}
        </Box>
    );
}

/* ── Panels ────────────────────────────────────────────────────────────────── */

/** Dark inset panel with the multi-colour accent bar on its left edge. */
export function AccentPanel({ children, bg = "rgba(38,38,38,0.32)" }: { children: React.ReactNode; bg?: string }) {
    return (
        <Box
            sx={{
                position: "relative",
                overflow: "hidden",
                bgcolor: bg,
                borderRadius: "12px",
                pl: "16px",
                pr: "12px",
                py: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
            }}
        >
            <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 7, backgroundImage: TOPIC_BAR_GRADIENT }} />
            {children}
        </Box>
    );
}

/** "12 April, 2026 • 2:30 PM" style meta line. */
export function DateTimeMeta({
    date, time, size = "sm",
}: { date: string; time: string; size?: "sm" | "md" }) {
    const textSx = size === "sm"
        ? { fontFamily: FONT_LATO, fontWeight: 500, fontSize: "10px", lineHeight: "15px", color: "#8c8c8c" }
        : { fontFamily: FONT_INTER, fontSize: "12px", lineHeight: "18px", color: "#a6a6a6" };
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
            <Typography sx={{ ...textSx, whiteSpace: "nowrap" }}>{date}</Typography>
            <Typography
                component="span"
                sx={{
                    fontFamily: FONT_LATO,
                    fontSize: "12px",
                    lineHeight: "18px",
                    color: size === "sm" ? "#404040" : "#5a5a5a",
                    width: 7,
                    pb: "4px",
                    textAlign: "center",
                }}
            >
                •
            </Typography>
            <Typography sx={{ ...textSx, whiteSpace: "nowrap" }}>{time}</Typography>
        </Box>
    );
}

/* ── Buttons ───────────────────────────────────────────────────────────────── */

const BUTTON_TEXT_SX = {
    fontFamily: FONT_INTER,
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "21px",
    color: "#fff",
    textTransform: "none" as const,
    whiteSpace: "nowrap" as const,
};

export function OutlineButton({
    children, onClick, disabled, borderless = false, width,
}: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; borderless?: boolean; width?: number }) {
    return (
        <Button
            onClick={onClick}
            disabled={disabled}
            sx={{
                ...BUTTON_TEXT_SX,
                flex: width ? `0 1 ${width}px` : "1 1 0",
                width,
                minWidth: 0,
                height: 44,
                px: "24px",
                borderRadius: "10px",
                border: borderless ? "1px solid transparent" : "1px solid #404040",
                "&:hover": { bgcolor: "rgba(255,255,255,0.04)", borderColor: borderless ? "transparent" : "#5a5a5a" },
                "&.Mui-disabled": { color: "rgba(255,255,255,0.4)", borderColor: "#262626" },
            }}
        >
            {children}
        </Button>
    );
}

export function GradientButton({
    children, onClick, fullWidth = false, disabled,
}: { children: React.ReactNode; onClick?: () => void; fullWidth?: boolean; disabled?: boolean }) {
    return (
        <Button
            onClick={onClick}
            disabled={disabled}
            sx={{
                ...BUTTON_TEXT_SX,
                position: "relative",
                flex: fullWidth ? "1 1 auto" : "0 1 169px",
                width: fullWidth ? "100%" : 169,
                minWidth: 0,
                height: 44,
                p: "16px",
                borderRadius: "10px",
                backgroundImage: ACTION_GRADIENT,
                filter: "drop-shadow(0 0 4px rgba(255,255,255,0.12))",
                transition: "filter 0.2s ease",
                "&:hover": { backgroundImage: ACTION_GRADIENT, filter: "drop-shadow(0 0 8px rgba(140,36,255,0.45))" },
                "&.Mui-disabled": { color: "rgba(255,255,255,0.55)", opacity: 0.6 },
            }}
        >
            <Box
                component="img"
                src="/batches/button-highlight.svg"
                alt=""
                aria-hidden
                sx={{
                    position: "absolute",
                    top: "-3px",
                    left: "calc(50% + 0.5px)",
                    transform: "translateX(-50%)",
                    width: 158,
                    height: 23,
                    maxWidth: "none",
                    pointerEvents: "none",
                }}
            />
            <Box component="span" sx={{ position: "relative", overflow: "hidden", textOverflow: "ellipsis" }}>{children}</Box>
        </Button>
    );
}

export function ButtonRow({ children, py = 8 }: { children: React.ReactNode; py?: number }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", py: `${py}px` }}>
            {children}
        </Box>
    );
}

/* ── Page states ───────────────────────────────────────────────────────────── */

export const CARD_GRID_SX = {
    display: "grid",
    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" },
    gap: "16px",
    alignItems: "start",
} as const;

export function EmptyBatches({ message }: { message: string }) {
    return (
        <Typography sx={{ fontFamily: FONT_INTER, color: "#8c8c8c", fontSize: "14px", textAlign: "center", py: 6 }}>
            {message}
        </Typography>
    );
}
