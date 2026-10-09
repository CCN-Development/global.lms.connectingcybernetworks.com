"use client";

import React from "react";
import Image from "next/image";
import { Box, ButtonBase, SxProps, Theme, Typography } from "@mui/material";
import { FONT_INTER, FONT_LATO, FONT_POPPINS } from "@/components/aish/tokens";
import { PC, profileAsset } from "./profile-data";

type Sx = SxProps<Theme>;
const mergeSx = (base: Sx, sx?: Sx): Sx => [base, ...(Array.isArray(sx) ? sx : [sx])] as Sx;

// ─── Text presets (Figma text styles) ──────────────────────────────────────
export const PT = {
    reg12: { fontFamily: FONT_LATO, fontWeight: 400, fontSize: "12px", lineHeight: "18px" },
    med12: { fontFamily: FONT_LATO, fontWeight: 500, fontSize: "12px", lineHeight: "18px" },
    reg14: { fontFamily: FONT_LATO, fontWeight: 400, fontSize: "14px", lineHeight: "21px" },
    med14: { fontFamily: FONT_LATO, fontWeight: 500, fontSize: "14px", lineHeight: "21px" },
    med16: { fontFamily: FONT_LATO, fontWeight: 500, fontSize: "16px", lineHeight: "24px" },
    semi16: { fontFamily: FONT_LATO, fontWeight: 600, fontSize: "16px", lineHeight: "24px" },
    med18: { fontFamily: FONT_LATO, fontWeight: 500, fontSize: "18px", lineHeight: "27px" },
    semi18: { fontFamily: FONT_LATO, fontWeight: 600, fontSize: "18px", lineHeight: "27px" },
    interReg12: { fontFamily: FONT_INTER, fontWeight: 400, fontSize: "12px", lineHeight: "18px" },
    interReg14: { fontFamily: FONT_INTER, fontWeight: 400, fontSize: "14px", lineHeight: "21px" },
    interMed14: { fontFamily: FONT_INTER, fontWeight: 500, fontSize: "14px", lineHeight: "21px" },
    interReg16: { fontFamily: FONT_INTER, fontWeight: 400, fontSize: "16px", lineHeight: "24px" },
    interSemi16: { fontFamily: FONT_INTER, fontWeight: 600, fontSize: "16px", lineHeight: "24px" },
    interSemi18: { fontFamily: FONT_INTER, fontWeight: 600, fontSize: "18px", lineHeight: "27px" },
    poppinsMed20: { fontFamily: FONT_POPPINS, fontWeight: 500, fontSize: "20px", lineHeight: "30px" },
    poppinsSemi20: { fontFamily: FONT_POPPINS, fontWeight: 600, fontSize: "20px", lineHeight: "30px" },
    poppinsSemi24: { fontFamily: FONT_POPPINS, fontWeight: 600, fontSize: "24px", lineHeight: "36px" },
    poppinsBold32: { fontFamily: FONT_POPPINS, fontWeight: 700, fontSize: "32px", lineHeight: "48px" },
} as const;

export const ellipsis = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } as const;

/** 1px gradient stroke painted on a masked pseudo-element so it follows the border radius. */
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

// ─── Icons ─────────────────────────────────────────────────────────────────
export function PIcon({ name, size, height, sx }: { name: string; size: number; height?: number; sx?: Sx }) {
    return (
        <Box aria-hidden sx={mergeSx({ display: "flex", flexShrink: 0, lineHeight: 0 }, sx)}>
            <Image src={profileAsset(name)} alt="" width={size} height={height ?? size} />
        </Box>
    );
}

// ─── Glass card ("My Tasks" in Figma) ──────────────────────────────────────
interface GlassCardProps {
    children: React.ReactNode;
    sx?: Sx;
    /** Darker fill variant used by the fee summary and single-program card. */
    strong?: boolean;
    /** Decorative black ellipses + edge sheen copied from the design. */
    decor?: boolean;
    component?: React.ElementType;
}

export function GlassCard({ children, sx, strong, decor = true, component = "section" }: GlassCardProps) {
    return (
        <Box
            component={component}
            sx={mergeSx(
                {
                    position: "relative",
                    isolation: "isolate",
                    display: "flex",
                    flexDirection: "column",
                    gap: { xs: "24px", md: "32px" },
                    p: { xs: "20px", md: "32px" },
                    borderRadius: "24px",
                    overflow: "hidden",
                    backgroundImage: strong ? PC.cardFillStrong : PC.cardFill,
                    backdropFilter: "blur(12px)",
                    boxShadow: "inset 0 3px 6px rgba(255,255,255,0.16)",
                    minWidth: 0,
                    "&::before": { ...strokeLayer(PC.cardStroke), opacity: 0.5 },
                },
                sx,
            )}
        >
            {decor && <CardDecor />}
            {children}
        </Box>
    );
}

/** Blurred dark ellipses and the grey top/bottom sheen that sit behind every card's content. */
function CardDecor() {
    // Each ellipse SVG carries a 24px blur margin around the shape.
    const ellipse = (left: number | string, top: number, length: number, thickness: number, file: string) => (
        <Box aria-hidden sx={{ position: "absolute", left, top, width: thickness, height: length, pointerEvents: "none" }}>
            <Box sx={{ position: "absolute", left: "50%", top: "50%", width: length, height: thickness, transform: "translate(-50%, -50%) rotate(90deg)" }}>
                <Box
                    component="img"
                    src={profileAsset(file)}
                    alt=""
                    sx={{ position: "absolute", left: -24, top: -24, width: length + 48, height: thickness + 48, display: "block", maxWidth: "none" }}
                />
            </Box>
        </Box>
    );
    const sheen = (pos: "top" | "bottom") => (
        <Box
            aria-hidden
            sx={{
                position: "absolute",
                left: 4,
                width: 425,
                maxWidth: "80%",
                height: 15,
                ...(pos === "top" ? { top: -7 } : { bottom: -16, transform: "scaleY(-1)" }),
                filter: "blur(50px)",
                pointerEvents: "none",
            }}
        >
            <Box component="img" src={profileAsset("card-edge-glow.png")} alt="" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        </Box>
    );
    return (
        <Box aria-hidden sx={{ position: "absolute", inset: 0, zIndex: -1, pointerEvents: "none", borderRadius: "inherit" }}>
            {ellipse("calc(100% - 175px)", 156, 248, 6, "card-ellipse-a.svg")}
            {ellipse(19, 90, 380, 12, "card-ellipse-b.svg")}
            {sheen("top")}
            {sheen("bottom")}
        </Box>
    );
}

export function CardTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
    return (
        <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", width: "100%" }}>
            <Typography component="h2" sx={{ ...PT.poppinsSemi20, color: PC.white, fontSize: { xs: "18px", md: "20px" } }}>
                {children}
            </Typography>
            {action}
        </Box>
    );
}

// ─── Small building blocks ─────────────────────────────────────────────────
/** Purple gradient section label ("Primary Details", "WhatsApp Details" …). */
export function SectionPill({ children }: { children: React.ReactNode }) {
    return (
        <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", px: "8px", py: "4px", borderRadius: "4px", backgroundImage: PC.gradientPurple, flexShrink: 0 }}>
            <Typography sx={{ ...PT.interReg12, color: PC.n50, whiteSpace: "nowrap" }}>{children}</Typography>
        </Box>
    );
}

/** Read-only field ("Student-Input" in Figma). */
export function InfoField({ label, value, trailing, sx }: { label: string; value: React.ReactNode; trailing?: React.ReactNode; sx?: Sx }) {
    return (
        <Box
            sx={mergeSx(
                {
                    position: "relative",
                    flex: "1 1 0",
                    minWidth: 0,
                    minHeight: 63,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    p: "12px",
                    borderRadius: "12px",
                    bgcolor: "rgba(255,255,255,0.02)",
                    "&::before": strokeLayer(PC.rowStroke(0.5)),
                },
                sx,
            )}
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                <Typography sx={{ ...PT.reg12, color: PC.n300, ...ellipsis }}>{label}</Typography>
                <Typography component="div" sx={{ ...PT.med16, color: PC.white, ...ellipsis }}>
                    {value}
                </Typography>
            </Box>
            {trailing}
        </Box>
    );
}

export function FieldRow({ children, sx }: { children: React.ReactNode; sx?: Sx }) {
    return <Box sx={mergeSx({ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: "16px", width: "100%" }, sx)}>{children}</Box>;
}

/** Inner row container ("content-wrapper" / "Options" in Figma). */
export function RowBox({ children, sx, component = "div" }: { children: React.ReactNode; sx?: Sx; component?: React.ElementType }) {
    return (
        <Box
            component={component}
            sx={mergeSx(
                {
                    position: "relative",
                    borderRadius: "12px",
                    bgcolor: "rgba(255,255,255,0.02)",
                    "&::before": strokeLayer(PC.rowStroke(0.24)),
                },
                sx,
            )}
        >
            {children}
        </Box>
    );
}

export function VerifiedMark({ label }: { label?: string }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <PIcon name="icon-verified.svg" size={16} />
            {label && <Typography sx={{ ...PT.med12, color: PC.success300, whiteSpace: "nowrap" }}>{label}</Typography>}
        </Box>
    );
}

/** Dark outlined action button ("btn" in Figma), e.g. Download / Download Receipt. */
export function OutlineButton({
    icon,
    children,
    onClick,
    locked,
    fullWidth,
    textSx,
    sx,
}: {
    icon?: string;
    children: React.ReactNode;
    onClick?: () => void;
    locked?: boolean;
    fullWidth?: boolean;
    textSx?: Sx;
    sx?: Sx;
}) {
    return (
        <ButtonBase
            onClick={onClick}
            disabled={locked}
            sx={mergeSx(
                {
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    height: 40,
                    pl: "12px",
                    pr: "16px",
                    borderRadius: "12px",
                    flexShrink: 0,
                    width: fullWidth ? "100%" : "auto",
                    bgcolor: locked ? "rgba(38,38,38,0.5)" : "rgba(38,38,38,0.12)",
                    border: locked ? "none" : `1px solid ${PC.n700}`,
                    boxShadow: "0 5px 20px rgba(0,0,0,0.02)",
                    transition: "border-color .15s ease, background-color .15s ease",
                    "&:hover": locked ? undefined : { borderColor: PC.n600, bgcolor: "rgba(255,255,255,0.04)" },
                    "&.Mui-disabled": { cursor: "default" },
                },
                sx,
            )}
        >
            {icon && <PIcon name={icon} size={16} />}
            <Typography component="span" sx={mergeSx({ ...PT.med12, color: PC.n100, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center" }, textSx)}>
                {children}
            </Typography>
        </ButtonBase>
    );
}

/** Round glass icon button (back / close). */
export function GlassIconButton({ icon, label, onClick, sx }: { icon: string; label: string; onClick?: () => void; sx?: Sx }) {
    return (
        <ButtonBase
            aria-label={label}
            onClick={onClick}
            sx={mergeSx(
                {
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                    borderRadius: "50px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backgroundImage: "linear-gradient(180deg, rgba(227,233,248,0.08) 0%, rgba(134,137,146,0.04) 100%)",
                    backdropFilter: "blur(25px)",
                    transition: "background-color .15s ease",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                },
                sx,
            )}
        >
            <PIcon name={icon} size={24} />
        </ButtonBase>
    );
}

// ─── Segmented tabs (header + installment timeline) ────────────────────────
export interface SegmentOption {
    id: string;
    label: string;
}

export function SegmentedTabs({
    options,
    value,
    onChange,
    stretch,
    inactiveWidth,
    sx,
}: {
    options: readonly SegmentOption[];
    value: string;
    onChange: (id: string) => void;
    /** Fill the container width with options spread apart (timeline filter). */
    stretch?: boolean;
    inactiveWidth?: number;
    sx?: Sx;
}) {
    return (
        <Box
            role="tablist"
            sx={mergeSx(
                {
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: stretch ? "space-between" : "flex-start",
                    gap: "8px",
                    p: "4px",
                    width: stretch ? "100%" : "auto",
                    maxWidth: "100%",
                    overflowX: "auto",
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                    borderRadius: "99px",
                    bgcolor: "rgba(255,255,255,0.04)",
                    outline: "1px solid rgba(191,191,191,0.25)",
                    backdropFilter: "blur(4px)",
                    opacity: 0.8,
                },
                sx,
            )}
        >
            {options.map((option) => {
                const active = option.id === value;
                return (
                    <ButtonBase
                        key={option.id}
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(option.id)}
                        sx={{
                            position: "relative",
                            flexShrink: 0,
                            height: 44,
                            px: active ? "16px" : "20px",
                            minWidth: !active && inactiveWidth ? { xs: "auto", sm: inactiveWidth } : undefined,
                            borderRadius: active ? "99px" : "8px",
                            ...PT.med16,
                            fontSize: { xs: "14px", sm: "16px" },
                            color: active ? PC.white : PC.n400,
                            whiteSpace: "nowrap",
                            backgroundImage: active ? "linear-gradient(180deg, rgba(187,201,237,0.44) 0%, rgba(106,114,135,0.26) 100%)" : "none",
                            backdropFilter: active ? "blur(12px)" : "none",
                            transition: "color .15s ease",
                            "&::before": active ? { ...strokeLayer("linear-gradient(180deg, rgba(227,233,248,0.24) 0%, rgba(134,137,146,0) 100%)"), inset: "-1px" } : undefined,
                            "&:hover": active ? undefined : { color: PC.n200 },
                        }}
                    >
                        {option.label}
                    </ButtonBase>
                );
            })}
        </Box>
    );
}

// ─── Status pill ("Request Status Pill") ───────────────────────────────────
const PILL_TONES = {
    warning: { bg: "#FFEFDC", fg: "#FB8600" },
    success: { bg: "#BBEDBB", fg: "#195C19" },
    error: { bg: "#F6D4D8", fg: "#9D1F2E" },
} as const;

export function StatusPill({ tone, children, small }: { tone: keyof typeof PILL_TONES; children: React.ReactNode; small?: boolean }) {
    const c = PILL_TONES[tone];
    return (
        <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", px: small ? "8px" : "12px", py: small ? "2px" : "4px", borderRadius: "999px", bgcolor: c.bg, flexShrink: 0 }}>
            <Typography sx={{ ...(small ? { ...PT.med12, fontSize: "11px" } : PT.med14), color: c.fg, whiteSpace: "nowrap" }}>{children}</Typography>
        </Box>
    );
}
