"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Box, ButtonBase, InputBase, Menu, MenuItem, SxProps, Theme, Typography } from "@mui/material";
import { Check, Heart } from "lucide-react";
import { FONT_INTER, FONT_LATO, FONT_POPPINS, gradientBorder } from "@/components/aish/tokens";
import { TEXT } from "@/components/community/community-ui";
import { dropdownItemSx, dropdownPaperSx } from "@/components/requests/request-parts";
import { placementAsset } from "./placement-data";

// ─── Tokens (Figma variables) ──────────────────────────────────────────────
export const PL = {
    white: "#FFFFFF",
    n75: "#F2F2F2",
    n100: "#D9D9D9",
    n200: "#BFBFBF",
    n300: "#A6A6A6",
    n400: "#8C8C8C",
    n500: "#737373",
    n600: "#5A5A5A",

    panelBg: "rgba(9,9,21,0.44)",
    whyCardBg: "linear-gradient(180deg, rgba(140,36,255,0.12) 0%, rgba(84,22,153,0.03) 100%)",
    whyCardBorder: "rgba(255,255,255,0.24)",
    divider: "linear-gradient(90deg, rgba(115,115,115,0.32) 0%, rgba(115,115,115,0) 100%)",
    cardBg:
        "linear-gradient(176.96deg, rgba(0,0,0,0.387) 1.34%, rgba(10,9,9,0.282) 48.72%, rgba(102,102,102,0.009) 96.09%)",
    cardInnerGlow: "inset 0 3px 6px 0 rgba(255,255,255,0.16)",
    /** "Gradients 4" — orange text gradient for remaining-steps hint. */
    warmText: "linear-gradient(90deg, #F1C40E 0%, #FF6000 100%)",
    /** "Gradients 6" — teal fee progress fill. */
    feeFill: "linear-gradient(118.19deg, rgb(46,196,182) 4.52%, rgb(27,76,51) 104.18%)",
    tabBg:
        "radial-gradient(117.69px 35.99px at 60.58px 18.6px, rgb(97,1,203) 0%, rgb(70,13,152) 25%, rgb(42,24,101) 50%, rgb(32,18,76) 62.5%, rgb(21,12,51) 75%, rgb(11,6,25) 87.5%, rgb(5,3,13) 93.75%, rgb(0,0,0) 100%)",

    modalBorder: "#508AF2",
    modalBackdrop: "rgba(64,64,64,0.24)",
    nextStepBg: "rgba(47,83,173,0.08)",
    nextStepBorder: "#2F53AD",

    // Placement Hub
    primary: "#2F53AD",
    primary200: "#93A9E2",
    primary300: "#6A8AD7",
    success: "#6AD76A",
    successDark: "#2FAD2F",
    error: "#D1293D",
    errorFill: "#C02638",
    neutral700: "#404040",
    sectionBg: "linear-gradient(180deg, rgba(147,169,226,0.08) 0%, rgba(80,93,124,0.04) 100%)",
    pillBg: "linear-gradient(180deg, rgba(187,201,237,0.12) 0%, rgba(106,114,135,0.07) 100%)",
    pillBorder: "#E3E9F8",
    sortBg: "linear-gradient(180deg, rgba(187,201,237,0.08) 0%, rgba(106,114,135,0.05) 100%)",
    iconButtonBg: "linear-gradient(180deg, rgba(227,233,248,0.08) 0%, rgba(134,137,146,0.04) 100%)",
    arrowButtonBg: "linear-gradient(180deg, rgba(227,233,248,0.24) 0%, rgba(134,137,146,0.12) 100%)",
    lmsGradient:
        "linear-gradient(90deg, #0027AC 0%, #0B22AC 12.5%, #161DAC 25%, #2C14AC 43.572%, #4608AC 65.007%, #4F04AC 82.544%, #5900AC 100%)",
    tealGradient: "linear-gradient(90.71deg, rgb(46,196,182) 4.52%, rgb(27,76,51) 104.18%)",
    jobTagBg: "linear-gradient(156.52deg, rgb(140,36,255) 9.02%, rgb(14,25,52) 89.87%)",
    chipBg: "linear-gradient(180deg, rgba(242,242,242,0.08) 0%, rgba(140,140,140,0) 100%)",
    menuBg: "linear-gradient(106.15deg, rgba(64,64,64,0.25) 17.58%, rgba(64,64,64,0) 111.58%)",
    filterDivider: "linear-gradient(90deg, rgba(185,185,185,0.5) 0%, rgba(115,115,115,0) 100%)",
    activityBg:
        "linear-gradient(162.79deg, rgba(0,0,0,0.563) 1.34%, rgba(10,9,9,0.41) 48.72%, rgba(102,102,102,0.013) 96.09%)",
    aiBoxBg: "rgba(255,239,220,0.08)",
    inputBg: "rgba(255,255,255,0.02)",
    inputBorder: "rgba(64,64,64,0.5)",
} as const;

export const PTEXT = {
    ...TEXT,
    medItalic12: { fontFamily: FONT_LATO, fontWeight: 500, fontStyle: "italic", fontSize: "12px", lineHeight: "18px" },
    interReg16: { fontFamily: FONT_INTER, fontWeight: 400, fontSize: "16px", lineHeight: "24px" },
    poppinsBold28: { fontFamily: FONT_POPPINS, fontWeight: 700, fontSize: "28px", lineHeight: "42px" },
    poppinsReg44: { fontFamily: FONT_POPPINS, fontWeight: 400, fontSize: "44px", lineHeight: "66px" },
    poppinsMed24: { fontFamily: FONT_POPPINS, fontWeight: 500, fontSize: "24px", lineHeight: "36px" },
    semi14: { fontFamily: FONT_LATO, fontWeight: 600, fontSize: "14px", lineHeight: "21px" },
} as const;

export const ellipsis = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } as const;

/** Glassy card surface used by job / application / form cards (gradient stroke + inner top glow). */
export const glassCard = (radius: string | number = "16px", background: string = PL.cardBg) =>
    ({
        position: "relative",
        borderRadius: radius,
        backgroundImage: background,
        backdropFilter: "blur(12px)",
        boxShadow: PL.cardInnerGlow,
        "&::before": gradientBorder(),
    }) as const;

/** Container queries let the dense Placement layouts adapt to the space left by the app sidebar. */
export const cq = (minWidth: number) => `@container (min-width: ${minWidth}px)`;

// ─── Primitives ────────────────────────────────────────────────────────────
/** Renders a design SVG/PNG from /public/placement at its native size. */
export function Asset({
    name,
    width,
    height,
    sx,
    priority,
}: {
    name: string;
    width: number;
    height: number;
    sx?: SxProps<Theme>;
    priority?: boolean;
}) {
    return (
        <Box aria-hidden sx={[{ lineHeight: 0, flexShrink: 0, pointerEvents: "none" }, ...(Array.isArray(sx) ? sx : [sx])]}>
            <Image
                src={placementAsset(name)}
                alt=""
                width={width}
                height={height}
                priority={priority}
                style={{ display: "block", width, height, maxWidth: "none" }}
            />
        </Box>
    );
}

/** Horizontal rule that fades out to the right (Figma "Line 247"). */
export function FadeDivider({ background = PL.divider }: { background?: string }) {
    return <Box aria-hidden sx={{ width: "100%", height: "1px", flexShrink: 0, backgroundImage: background }} />;
}

/** 6px separator dot between meta items. */
export function MetaDot({ size = 6 }: { size?: number }) {
    return <Asset name={size === 4 ? "dot-4.svg" : "dot.svg"} width={size} height={size} />;
}

/** Repeating dashed line drawn from a design SVG tile so dash spacing never stretches. */
export function DashedLine({ tile, tileWidth, sx }: { tile: string; tileWidth: number; sx?: SxProps<Theme> }) {
    return (
        <Box
            aria-hidden
            sx={[
                {
                    height: "1px",
                    flexShrink: 0,
                    backgroundImage: `url("${placementAsset(tile)}")`,
                    backgroundRepeat: "repeat-x",
                    backgroundSize: `${tileWidth}px 1px`,
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        />
    );
}

// ─── Buttons ───────────────────────────────────────────────────────────────
/** Bordered "LMS Button" (Cancel / View Details / Track Application). */
export function OutlineButton({
    children,
    onClick,
    href,
    borderWidth = 1,
    sx,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    href?: string;
    borderWidth?: 1 | 2;
    sx?: SxProps<Theme>;
}) {
    return (
        <ButtonBase
            onClick={onClick}
            {...(href ? { LinkComponent: Link, href } : {})}
            sx={[
                {
                    height: 44,
                    px: "16px",
                    flexShrink: 0,
                    borderRadius: "10px",
                    border: `${borderWidth}px solid ${borderWidth === 2 ? "rgba(227,233,248,0.1)" : "rgba(227,233,248,0.24)"}`,
                    boxShadow: "0 0 8px 0 rgba(255,255,255,0.12)",
                    ...PTEXT.interMed14,
                    color: PL.white,
                    whiteSpace: "nowrap",
                    transition: "border-color .15s ease, background-color .15s ease",
                    "&:hover": { borderColor: "rgba(227,233,248,0.48)", bgcolor: "rgba(255,255,255,0.03)" },
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            {children}
        </ButtonBase>
    );
}

/** Small gradient "Easy Apply" button used on job cards. */
export function EasyApplyButton({ onClick, applied }: { onClick: () => void; applied?: boolean }) {
    return (
        <ButtonBase
            onClick={(event) => {
                event.stopPropagation();
                onClick();
            }}
            sx={{
                minWidth: 88,
                px: "15px",
                py: "7.5px",
                borderRadius: "9.35px",
                backgroundImage: applied ? "none" : PL.lmsGradient,
                border: applied ? `1px solid ${PL.neutral700}` : "none",
                filter: "drop-shadow(0 0 3.74px rgba(255,255,255,0.12))",
                ...PTEXT.med12,
                color: PL.white,
                whiteSpace: "nowrap",
                transition: "filter .15s ease",
                "&:hover": { filter: "drop-shadow(0 0 3.74px rgba(255,255,255,0.12)) brightness(1.15)" },
            }}
        >
            {applied ? "View Status" : "Easy Apply"}
        </ButtonBase>
    );
}

/** 32px round favourite toggle on job cards. */
export function FavouriteButton({ active, onToggle }: { active: boolean; onToggle: () => void }) {
    return (
        <ButtonBase
            aria-label={active ? "Remove from favourites" : "Add to favourites"}
            aria-pressed={active}
            onClick={(event) => {
                event.stopPropagation();
                onToggle();
            }}
            sx={{
                width: 32,
                height: 32,
                flexShrink: 0,
                borderRadius: "50%",
                bgcolor: active ? "rgba(224,44,66,0.16)" : "rgba(38,38,38,0.12)",
                border: `1.14px solid ${active ? "rgba(224,44,66,0.6)" : PL.neutral700}`,
                boxShadow: "0 5.71px 22.86px 0 rgba(0,0,0,0.02)",
                transition: "border-color .15s ease, background-color .15s ease",
                "&:hover": { borderColor: active ? "#E02C42" : "#5A5A5A" },
            }}
        >
            {active ? <Heart size={16} strokeWidth={1.14} color="#F2F2F2" fill="#E02C42" /> : <Asset name="icon-heart-16.svg" width={16} height={16} />}
        </ButtonBase>
    );
}

/** Round glass arrow button on the quick-action cards. */
export function ArrowCircle({ size = 44 }: { size?: 32 | 44 }) {
    const icon = size === 44 ? 24 : 17.45;
    return (
        <Box
            aria-hidden
            sx={{
                position: "relative",
                width: size,
                height: size,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                backgroundImage: PL.arrowButtonBg,
                backdropFilter: "blur(25px)",
                boxShadow: "0 2px 12px 0 rgba(0,0,0,0.16)",
                "&::before": gradientBorder(size === 44 ? "1px" : "0.73px"),
            }}
        >
            <Asset name="icon-arrow-right.svg" width={icon} height={icon} />
        </Box>
    );
}

// ─── Sort menu + See All ───────────────────────────────────────────────────
export function SortButton<T extends string>({
    value,
    options,
    onChange,
}: {
    value: T;
    options: { value: T; label: string }[];
    onChange: (value: T) => void;
}) {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    return (
        <>
            <ButtonBase
                aria-haspopup="menu"
                aria-label={`Sort by: ${options.find((o) => o.value === value)?.label ?? ""}`}
                onClick={(event) => setAnchor(event.currentTarget)}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    height: 32,
                    pl: "16px",
                    pr: "12px",
                    borderRadius: "6px",
                    backgroundImage: PL.sortBg,
                    backdropFilter: "blur(12px)",
                    ...PTEXT.med14,
                    color: PL.white,
                    whiteSpace: "nowrap",
                    "&:hover": { backgroundImage: "linear-gradient(180deg, rgba(187,201,237,0.16) 0%, rgba(106,114,135,0.1) 100%)" },
                }}
            >
                Sort By
                <Asset name="icon-chevron-down.svg" width={16} height={16} sx={{ transform: anchor ? "rotate(180deg)" : "none", transition: "transform .15s ease" }} />
            </ButtonBase>
            <Menu
                anchorEl={anchor}
                open={!!anchor}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: dropdownPaperSx } }}
            >
                {options.map((option) => (
                    <MenuItem
                        key={option.value}
                        selected={option.value === value}
                        onClick={() => {
                            onChange(option.value);
                            setAnchor(null);
                        }}
                        sx={dropdownItemSx}
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}

export function SeeAllLink({ href }: { href: string }) {
    return (
        <ButtonBase
            LinkComponent={Link}
            href={href}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                py: "4px",
                borderRadius: "12px",
                ...PTEXT.med16,
                color: PL.primary200,
                whiteSpace: "nowrap",
                "&:hover": { color: "#BBC9ED" },
            }}
        >
            See All
            <Asset name="icon-see-all.svg" width={20} height={20} sx={{ transform: "scaleX(-1)" }} />
        </ButtonBase>
    );
}

export function SectionHeader({ title, children }: { title: string; children?: React.ReactNode }) {
    return (
        <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px 24px", width: "100%" }}>
            <Typography component="h2" sx={{ ...PTEXT.poppinsSemi20, color: PL.white }}>
                {title}
            </Typography>
            {children && <Box sx={{ display: "flex", alignItems: "center", gap: "24px" }}>{children}</Box>}
        </Box>
    );
}

// ─── Page header (back button + title) ─────────────────────────────────────
export function BackHeader({ title, href, actions }: { title: string; href: string; actions?: React.ReactNode }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px 16px", minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: "12px", sm: "16px" }, minWidth: 0 }}>
                <ButtonBase
                    LinkComponent={Link}
                    href={href}
                    aria-label="Back"
                    sx={{
                        width: { xs: 36, sm: 44 },
                        height: { xs: 36, sm: 44 },
                        flexShrink: 0,
                        borderRadius: "50px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        backgroundImage: PL.iconButtonBg,
                        backdropFilter: "blur(25px)",
                        transition: "border-color .15s ease",
                        "&:hover": { borderColor: "rgba(255,255,255,0.24)" },
                    }}
                >
                    <Asset name="icon-arrow-back.svg" width={24} height={24} />
                </ButtonBase>
                <Typography noWrap component="h1" sx={{ ...PTEXT.poppinsMed20, fontSize: { xs: "16px", sm: "20px" }, color: PL.white }}>
                    {title}
                </Typography>
            </Box>
            {actions}
        </Box>
    );
}

// ─── Form fields ───────────────────────────────────────────────────────────
/** Figma "Student-Input": floating 12px label above a 16px value. */
export function FormField({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    multiline,
    sx,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    multiline?: boolean;
    sx?: SxProps<Theme>;
}) {
    const id = React.useId();
    return (
        <Box
            component="label"
            htmlFor={id}
            sx={[
                {
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: "4px",
                    minHeight: 63,
                    minWidth: 0,
                    p: "12px",
                    borderRadius: "12px",
                    bgcolor: PL.inputBg,
                    border: `1px solid ${PL.inputBorder}`,
                    cursor: "text",
                    transition: "border-color .15s ease",
                    "&:focus-within": { borderColor: PL.primary },
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            <Typography component="span" sx={{ ...PTEXT.reg12, color: PL.n300 }}>
                {label}
            </Typography>
            <InputBase
                id={id}
                type={type}
                value={value}
                multiline={multiline}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
                sx={{
                    p: 0,
                    ...PTEXT.med16,
                    color: PL.white,
                    "& input, & textarea": { p: 0 },
                    "& input::placeholder, & textarea::placeholder": { color: PL.n500, opacity: 1 },
                }}
            />
        </Box>
    );
}

/** Square checkbox from the Request Job form (24px) and filter sidebar (16px). */
export function CheckBox({ checked, size = 24 }: { checked: boolean; size?: 16 | 24 }) {
    return (
        <Box
            aria-hidden
            sx={{
                width: size,
                height: size,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                bgcolor: checked ? PL.primary : "transparent",
                border: checked ? "none" : size === 24 ? `0.7px solid ${PL.n500}` : `1px solid ${PL.n300}`,
                transition: "background-color .15s ease",
            }}
        >
            {checked &&
                (size === 24 ? (
                    <Asset name="icon-check-16.svg" width={16} height={16} />
                ) : (
                    <Check size={11} strokeWidth={2.5} color="#FFFFFF" />
                ))}
        </Box>
    );
}

/** Removable purple pill (applied filters, selected locations). */
export function RemovablePill({ label, onRemove, small, filled }: { label: string; onRemove: () => void; small?: boolean; filled?: boolean }) {
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                px: "12px",
                py: "8px",
                borderRadius: "50px",
                border: "1px solid rgba(140,36,255,0.24)",
                bgcolor: filled ? "rgba(140,36,255,0.12)" : "transparent",
            }}
        >
            <Typography component="span" sx={{ ...(small ? PTEXT.med12 : PTEXT.med14), color: PL.n75, whiteSpace: "nowrap" }}>
                {label}
            </Typography>
            <ButtonBase aria-label={`Remove ${label}`} onClick={onRemove} sx={{ borderRadius: "50%", "&:hover": { opacity: 0.7 } }}>
                <Asset name="icon-x-circle.svg" width={16} height={16} />
            </ButtonBase>
        </Box>
    );
}
