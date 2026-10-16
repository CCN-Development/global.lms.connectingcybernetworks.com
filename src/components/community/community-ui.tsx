"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Box, ButtonBase, Dialog, Menu, MenuItem, SxProps, Theme, Typography } from "@mui/material";
import { FONT_INTER, FONT_LATO, FONT_POPPINS, gradientBorder } from "@/components/aish/tokens";
import { AuthorLike, CC, communityAsset } from "./community-data";

// ─── Text presets (Figma text styles) ──────────────────────────────────────
export const TEXT = {
    med12: { fontFamily: FONT_LATO, fontWeight: 500, fontSize: "12px", lineHeight: "18px" },
    reg12: { fontFamily: FONT_LATO, fontWeight: 400, fontSize: "12px", lineHeight: "18px" },
    med14: { fontFamily: FONT_LATO, fontWeight: 500, fontSize: "14px", lineHeight: "21px" },
    reg14: { fontFamily: FONT_LATO, fontWeight: 400, fontSize: "14px", lineHeight: "21px" },
    med16: { fontFamily: FONT_LATO, fontWeight: 500, fontSize: "16px", lineHeight: "24px" },
    reg16: { fontFamily: FONT_LATO, fontWeight: 400, fontSize: "16px", lineHeight: "24px" },
    med18: { fontFamily: FONT_LATO, fontWeight: 500, fontSize: "18px", lineHeight: "27px" },
    semi18: { fontFamily: FONT_LATO, fontWeight: 600, fontSize: "18px", lineHeight: "27px" },
    interMed14: { fontFamily: FONT_INTER, fontWeight: 500, fontSize: "14px", lineHeight: "21px" },
    interMed16: { fontFamily: FONT_INTER, fontWeight: 500, fontSize: "16px", lineHeight: "24px" },
    interReg16: { fontFamily: FONT_INTER, fontWeight: 400, fontSize: "16px", lineHeight: "25px" },
    interReg12: { fontFamily: FONT_INTER, fontWeight: 400, fontSize: "12px", lineHeight: "18px" },
    poppinsMed20: { fontFamily: FONT_POPPINS, fontWeight: 500, fontSize: "20px", lineHeight: "30px" },
    poppinsSemi20: { fontFamily: FONT_POPPINS, fontWeight: 600, fontSize: "20px", lineHeight: "30px" },
    poppinsSemi24: { fontFamily: FONT_POPPINS, fontWeight: 600, fontSize: "24px", lineHeight: "36px" },
} as const;

export const ellipsis = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } as const;

/** Thin scrollbars for the dark scroll areas. */
export const darkScroll = {
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(255,255,255,0.12) transparent",
    "&::-webkit-scrollbar": { width: 4 },
    "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 4 },
} as const;

// ─── Icons ─────────────────────────────────────────────────────────────────
export function Icon({ name, size, height, rotate, sx }: { name: string; size: number; height?: number; rotate?: number; sx?: SxProps<Theme> }) {
    return (
        <Box
            aria-hidden
            sx={[
                { display: "flex", flexShrink: 0, lineHeight: 0, transform: rotate ? `rotate(${rotate}deg)` : undefined },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            <Image src={communityAsset(name)} alt="" width={size} height={height ?? size} />
        </Box>
    );
}

/** Figma divider lines are stretchable (preserveAspectRatio="none"). */
export function Divider({ name = "divider-line.svg" }: { name?: string }) {
    return <Box component="img" src={communityAsset(name)} alt="" aria-hidden sx={{ display: "block", width: "100%", height: "1px" }} />;
}

// ─── Glass card ────────────────────────────────────────────────────────────
interface GlassCardProps {
    children: React.ReactNode;
    /** Shows the blue "focused" stroke from the design on hover / focus. */
    interactive?: boolean;
    onClick?: () => void;
    sx?: SxProps<Theme>;
    component?: React.ElementType;
}

export function GlassCard({ children, interactive, onClick, sx, component = "div" }: GlassCardProps) {
    return (
        <Box
            component={component}
            onClick={onClick}
            tabIndex={interactive ? 0 : undefined}
            onKeyDown={
                interactive && onClick
                    ? (e: React.KeyboardEvent) => {
                        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault();
                            onClick();
                        }
                    }
                    : undefined
            }
            sx={[
                {
                    position: "relative",
                    borderRadius: "24px",
                    p: { xs: "16px", sm: "24px" },
                    backgroundImage: CC.cardFill,
                    backdropFilter: "blur(12px)",
                    boxShadow: "inset 0 0 6px rgba(255,255,255,0.16)",
                    cursor: interactive ? "pointer" : "default",
                    outline: "none",
                    "&::before": gradientBorder(),
                    ...(interactive && {
                        "&:hover::before, &:focus-visible::before": {
                            backgroundImage: `linear-gradient(${CC.primary500}, ${CC.primary500})`,
                            padding: "1px 1px 4px",
                        },
                    }),
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            {children}
        </Box>
    );
}

// ─── Category & tags ───────────────────────────────────────────────────────
export function CategorySwatch({ color }: { color: string }) {
    return <Box sx={{ width: 12, height: 12, flexShrink: 0, bgcolor: color }} />;
}

export function CategoryLabel({ category, gap = "8px", color = CC.n200 }: { category: { label: string; color: string }; gap?: string; color?: string }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap, minWidth: 0 }}>
            <CategorySwatch color={category.color} />
            <Typography sx={{ ...TEXT.med16, color, ...ellipsis }}>{category.label}</Typography>
        </Box>
    );
}

export function TagChip({ label, onRemove }: { label: string; onRemove?: () => void }) {
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                px: "6px",
                py: "3px",
                borderRadius: "4px",
                bgcolor: "rgba(115,115,115,0.32)",
                border: "1px solid rgba(90,90,90,0.32)",
                flexShrink: 0,
            }}
        >
            <Typography sx={{ ...TEXT.med14, color: CC.n75, whiteSpace: "nowrap" }}>{label}</Typography>
            {onRemove && (
                <ButtonBase
                    aria-label={`Remove ${label}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    sx={{ borderRadius: "2px", "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } }}
                >
                    <Icon name="icon-tag-x.svg" size={16} />
                </ButtonBase>
            )}
        </Box>
    );
}

// ─── People ────────────────────────────────────────────────────────────────
export function UserAvatar({ author, size = 32 }: { author: AuthorLike; size?: number }) {
    const scale = size / 32;
    const isLocal = author.avatar?.startsWith("/");
    return (
        <Box
            sx={{
                position: "relative",
                width: size,
                height: size,
                flexShrink: 0,
                borderRadius: "99px",
                overflow: "hidden",
                bgcolor: CC.primary200,
                border: `${0.6 * scale}px solid ${CC.n700}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {author.avatar ? (
                // The design crops the portrait into the circle at this offset.
                <Box sx={{ position: "absolute", left: -10 * scale, top: 3 * scale, width: 51 * scale, height: 34 * scale }}>
                    {isLocal ? (
                        <Image src={author.avatar} alt={author.name} fill sizes={`${Math.ceil(51 * scale)}px`} style={{ objectFit: "cover" }} />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={author.avatar} alt={author.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                </Box>
            ) : (
                <Typography sx={{ ...TEXT.med16, fontSize: `${16 * scale}px`, color: CC.primary800, userSelect: "none" }}>
                    {author.name.charAt(0).toUpperCase()}
                </Typography>
            )}
        </Box>
    );
}

export function AuthorRow({ author, subtitle, size = 32, you }: { author: AuthorLike; subtitle?: string; size?: number; you?: boolean }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
            <UserAvatar author={author} size={size} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                <Typography sx={{ ...TEXT.med16, color: CC.n100, ...ellipsis }}>
                    {author.name}
                    {you ? " (You)" : ""}
                </Typography>
                <Typography sx={{ ...TEXT.med12, color: CC.n500, ...ellipsis }}>{subtitle ?? author.headline ?? author.roleLabel ?? ""}</Typography>
            </Box>
        </Box>
    );
}

// ─── Buttons ───────────────────────────────────────────────────────────────
interface LmsButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
    type?: "button" | "submit";
    sx?: SxProps<Theme>;
    /** Show the blurred highlight along the top edge (some design instances omit it). */
    glowLine?: boolean;
}

/** The design system's gradient "LMS Button" with its blurred top highlight. */
export function LmsButton({ children, onClick, icon, disabled, type = "button", sx, glowLine = true }: LmsButtonProps) {
    return (
        <ButtonBase
            type={type}
            onClick={onClick}
            disabled={disabled}
            sx={[
                {
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    height: 44,
                    px: "16px",
                    borderRadius: "10px",
                    backgroundImage: CC.lmsButton,
                    filter: "drop-shadow(0 0 4px rgba(255,255,255,0.12))",
                    color: CC.white,
                    ...TEXT.interMed14,
                    whiteSpace: "nowrap",
                    transition: "filter .15s ease, opacity .15s ease",
                    "&:hover": { filter: "drop-shadow(0 0 4px rgba(255,255,255,0.12)) brightness(1.12)" },
                    "&.Mui-disabled": { opacity: 0.55, color: CC.white },
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            {glowLine && (
                <Box aria-hidden sx={{ position: "absolute", top: -3, left: "50%", transform: "translateX(-50%)", lineHeight: 0, pointerEvents: "none" }}>
                    <Image src={communityAsset("btn-glow-line.svg")} alt="" width={158} height={23} />
                </Box>
            )}
            {icon}
            <Box component="span" sx={{ position: "relative" }}>
                {children}
            </Box>
        </ButtonBase>
    );
}

/** Rounded outline button used for "Post your thoughts" / "Share". */
export function PillButton({ icon, children, onClick, disabled }: { icon: string; children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
    return (
        <ButtonBase
            onClick={onClick}
            disabled={disabled}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                height: 38,
                pl: "12px",
                pr: "16px",
                borderRadius: "50px",
                border: `1px solid ${CC.n700}`,
                color: CC.link,
                ...TEXT.med16,
                whiteSpace: "nowrap",
                transition: "border-color .15s ease, background-color .15s ease",
                "&:hover": { borderColor: CC.link, bgcolor: "rgba(66,106,204,0.08)" },
                "&.Mui-disabled": { opacity: 0.5, color: CC.link },
            }}
        >
            <Icon name={icon} size={20} />
            {children}
        </ButtonBase>
    );
}

// ─── Menus ─────────────────────────────────────────────────────────────────
export const dropdownPaperSx = {
    mt: "6px",
    bgcolor: CC.dropdownBg,
    backgroundImage: "none",
    backdropFilter: "blur(12px)",
    borderRadius: "9px",
    boxShadow: CC.dropdownShadow,
    color: CC.n200,
    overflow: "hidden",
    "& .MuiList-root": { py: 0 },
} as const;

export const dropdownItemSx = (active = false) => ({
    minHeight: 44,
    px: "16px",
    py: "10px",
    gap: "12px",
    ...TEXT.med16,
    color: CC.n200,
    bgcolor: active ? CC.dropdownActive : "transparent",
    "&:hover": { bgcolor: CC.dropdownActive },
    "&.Mui-focusVisible": { bgcolor: CC.dropdownActive },
    "&.Mui-selected, &.Mui-selected:hover": { bgcolor: CC.dropdownActive },
});

export interface ActionMenuItem {
    label: string;
    /** Community asset name, or a ready icon node. */
    icon: string | React.ReactNode;
    danger?: boolean;
    onClick: () => void;
}

/** Overflow ("…") menu — Save / Report on threads, Edit / Delete on own replies. */
export function ActionMenu({ items, trigger, label }: { items: ActionMenuItem[]; trigger: React.ReactNode; label: string }) {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    return (
        <>
            <ButtonBase
                aria-label={label}
                aria-haspopup="menu"
                onClick={(e) => {
                    e.stopPropagation();
                    setAnchor(e.currentTarget);
                }}
                sx={{ p: "4px", borderRadius: "6px", "&:hover": { bgcolor: "rgba(255,255,255,0.06)" } }}
            >
                {trigger}
            </ButtonBase>
            <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: { ...dropdownPaperSx, backdropFilter: "blur(6px)", minWidth: 130 } } }}
            >
                {items.map((item) => (
                    <MenuItem
                        key={item.label}
                        onClick={() => {
                            setAnchor(null);
                            item.onClick();
                        }}
                        sx={{
                            minHeight: 40,
                            px: "12px",
                            py: "8px",
                            gap: "8px",
                            ...(item.danger ? TEXT.reg16 : TEXT.interMed16),
                            color: item.danger ? CC.error : CC.n200,
                            "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                        }}
                    >
                        {typeof item.icon === "string" ? <Icon name={item.icon} size={20} /> : item.icon}
                        {item.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}

// ─── Modal shell ───────────────────────────────────────────────────────────
interface CommunityModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    width: number;
    children: React.ReactNode;
}

export function CommunityModal({ open, onClose, title, width, children }: CommunityModalProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            scroll="body"
            slotProps={{
                backdrop: { sx: { backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(7px)" } },
                paper: {
                    sx: {
                        position: "relative",
                        width: "100%",
                        maxWidth: width,
                        m: { xs: "16px", sm: "32px auto" },
                        p: { xs: "20px", sm: "32px" },
                        bgcolor: "#000",
                        backgroundImage: "none",
                        borderRadius: "24px",
                        borderTop: `1.5px solid ${CC.modalStroke}`,
                        borderRight: `1.5px solid ${CC.modalStroke}`,
                        backdropFilter: "blur(50px)",
                        boxShadow: "none",
                        overflow: "hidden",
                        color: CC.white,
                    },
                },
            }}
        >
            <Box
                aria-hidden
                sx={{
                    position: "absolute",
                    left: 349,
                    top: 288,
                    transform: "translate(-50%, -50%) rotate(-40.17deg)",
                    lineHeight: 0,
                    pointerEvents: "none",
                }}
            >
                <Image src={communityAsset("modal-glow.svg")} alt="" width={269.794} height={1633.31} />
            </Box>

            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: { xs: "24px", sm: "32px" } }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                        <Typography component="h2" sx={{ ...TEXT.poppinsSemi24, fontSize: { xs: "20px", sm: "24px" }, color: CC.white }}>
                            {title}
                        </Typography>
                        <ButtonBase
                            aria-label="Close"
                            onClick={onClose}
                            sx={{ borderRadius: "8px", "&:hover": { bgcolor: "rgba(255,255,255,0.06)" } }}
                        >
                            <Icon name="icon-x.svg" size={28} />
                        </ButtonBase>
                    </Box>
                    <Divider name="modal-divider.svg" />
                </Box>
                {children}
            </Box>
        </Dialog>
    );
}

// ─── Status chip (TagChip with an accent colour) ───────────────────────────
export function StatusChip({ label, color }: { label: string; color: string }) {
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                px: "6px",
                py: "3px",
                borderRadius: "4px",
                border: `1px solid ${color}`,
                bgcolor: "rgba(0,0,0,0.24)",
                flexShrink: 0,
            }}
        >
            <Typography sx={{ ...TEXT.med14, color, whiteSpace: "nowrap" }}>{label}</Typography>
        </Box>
    );
}

// ─── Checkbox row (same box as the tag filter menu) ────────────────────────
export function CheckRow({ checked, onChange, label, hint }: { checked: boolean; onChange: (checked: boolean) => void; label: string; hint?: string }) {
    return (
        <ButtonBase
            role="checkbox"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            sx={{ display: "flex", alignItems: "flex-start", gap: "12px", justifyContent: "flex-start", textAlign: "left", borderRadius: "6px", py: "4px" }}
        >
            <Box
                aria-hidden
                sx={{
                    width: 16,
                    height: 16,
                    mt: "4px",
                    borderRadius: "4px",
                    border: `1.5px solid ${checked ? CC.primary200 : CC.n500}`,
                    bgcolor: checked ? CC.primary500 : "transparent",
                    flexShrink: 0,
                }}
            />
            <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography sx={{ ...TEXT.med16, color: CC.n100 }}>{label}</Typography>
                {hint && <Typography sx={{ ...TEXT.reg12, color: CC.n500 }}>{hint}</Typography>}
            </Box>
        </ButtonBase>
    );
}

// ─── Confirm modal (the design's "Delete reply?" dialog) ───────────────────
interface ConfirmModalProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    busy?: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export function ConfirmModal({ open, title, message, confirmLabel = "Delete", busy, onConfirm, onClose }: ConfirmModalProps) {
    return (
        <CommunityModal open={open} onClose={onClose} title={title} width={440}>
            <Typography sx={{ ...TEXT.med16, color: CC.n200 }}>{message}</Typography>
            <Box sx={{ display: "flex", gap: "12px" }}>
                <ButtonBase
                    onClick={onClose}
                    sx={{ flex: 1, height: 44, borderRadius: "10px", border: `1px solid ${CC.n700}`, color: CC.n100, ...TEXT.interMed14, "&:hover": { borderColor: CC.n500 } }}
                >
                    Cancel
                </ButtonBase>
                <ButtonBase
                    onClick={onConfirm}
                    disabled={busy}
                    sx={{
                        flex: 1,
                        height: 44,
                        borderRadius: "10px",
                        bgcolor: CC.error,
                        color: CC.white,
                        ...TEXT.interMed14,
                        "&:hover": { bgcolor: "#b52233" },
                        "&.Mui-disabled": { opacity: 0.6, color: CC.white },
                    }}
                >
                    {busy ? "Please wait…" : confirmLabel}
                </ButtonBase>
            </Box>
        </CommunityModal>
    );
}

// ─── Filter / dropdown trigger (feed filter bar style) ─────────────────────
export function FilterButton({
    children,
    open,
    onClick,
    label,
    chevron = true,
}: {
    children: React.ReactNode;
    open: boolean;
    onClick: (e: React.MouseEvent<HTMLElement>) => void;
    label: string;
    chevron?: boolean;
}) {
    return (
        <ButtonBase
            aria-label={label}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={onClick}
            sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                height: 40,
                pl: "16px",
                pr: chevron ? "12px" : "16px",
                borderRadius: "8px",
                bgcolor: CC.filterBg,
                backdropFilter: "blur(12px)",
                color: CC.white,
                ...TEXT.med16,
                whiteSpace: "nowrap",
                maxWidth: "100%",
                transition: "background-color .15s ease",
                "&:hover": { bgcolor: "rgba(64,64,64,0.6)" },
            }}
        >
            {children}
            {chevron && <Icon name="icon-chevron-down.svg" size={24} sx={{ transition: "transform .15s ease", transform: open ? "rotate(180deg)" : "none" }} />}
        </ButtonBase>
    );
}

// ─── Pill choice (post type, poll duration, tabs) ──────────────────────────
export function ChoiceChip({
    active,
    onClick,
    color,
    count,
    children,
}: {
    active: boolean;
    onClick: () => void;
    color?: string;
    count?: number;
    children: React.ReactNode;
}) {
    return (
        <ButtonBase
            role="radio"
            aria-checked={active}
            onClick={onClick}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                height: 36,
                px: "14px",
                borderRadius: "8px",
                border: `1px solid ${active ? CC.primary200 : CC.n700}`,
                bgcolor: active ? CC.dropdownActive : CC.filterBg,
                color: active ? CC.white : CC.n200,
                ...TEXT.med14,
                whiteSpace: "nowrap",
                transition: "border-color .15s ease, background-color .15s ease",
                "&:hover": { borderColor: active ? CC.primary200 : CC.n500 },
            }}
        >
            {color && <CategorySwatch color={color} />}
            {children}
            {count !== undefined && (
                <Box component="span" sx={{ ...TEXT.med12, color: active ? CC.primary200 : CC.n400 }}>
                    {count}
                </Box>
            )}
        </ButtonBase>
    );
}

// ─── Inputs ────────────────────────────────────────────────────────────────
const inputSx = {
    width: "100%",
    minWidth: 0,
    px: "14px",
    borderRadius: "8px",
    border: `1px solid ${CC.n700}`,
    bgcolor: "transparent",
    color: CC.white,
    ...TEXT.med14,
    outline: "none",
    transition: "border-color .15s ease",
    "&:focus": { borderColor: CC.primary200 },
    "&::placeholder": { color: CC.n500 },
} as const;

export function FieldInput({ sx, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { sx?: SxProps<Theme> }) {
    return <Box component="input" {...props} sx={[{ ...inputSx, height: 44 }, ...(Array.isArray(sx) ? sx : [sx])]} />;
}

export function TextArea({ sx, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { sx?: SxProps<Theme> }) {
    return <Box component="textarea" {...props} sx={[{ ...inputSx, py: "12px", minHeight: 80, resize: "vertical" }, ...(Array.isArray(sx) ? sx : [sx])]} />;
}

/** Label + field + optional hint. */
export function FormRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <Typography sx={{ ...TEXT.reg14, color: CC.n300 }}>{label}</Typography>
            {children}
            {hint && <Typography sx={{ ...TEXT.reg12, color: CC.n500 }}>{hint}</Typography>}
        </Box>
    );
}

// ─── Row action button (same look as "Open Thread") ────────────────────────
const TONES = {
    default: { color: CC.white, border: "rgba(140,140,140,0.5)", hover: CC.primary200 },
    primary: { color: CC.primary200, border: "rgba(147,169,226,0.5)", hover: CC.primary200 },
    success: { color: CC.success, border: "rgba(46,196,182,0.5)", hover: CC.success },
    danger: { color: "#F07A88", border: "rgba(209,41,61,0.55)", hover: CC.error },
    warning: { color: "#FFAD4F", border: "rgba(255,173,79,0.5)", hover: "#FFAD4F" },
} as const;
export type ActionTone = keyof typeof TONES;

export function ActionButton({
    children,
    onClick,
    tone = "default",
    icon,
    disabled,
    trailing,
}: {
    children: React.ReactNode;
    onClick: (e: React.MouseEvent<HTMLElement>) => void;
    tone?: ActionTone;
    icon?: React.ReactNode;
    disabled?: boolean;
    trailing?: React.ReactNode;
}) {
    const t = TONES[tone];
    return (
        <ButtonBase
            disabled={disabled}
            onClick={(e) => {
                e.stopPropagation();
                onClick(e);
            }}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                height: 36,
                px: "12px",
                borderRadius: "8px",
                border: `0.6px solid ${t.border}`,
                backgroundImage: "linear-gradient(180deg, rgba(191,191,191,0.12) 0%, rgba(89,89,89,0.04) 100%)",
                color: t.color,
                ...TEXT.med14,
                whiteSpace: "nowrap",
                transition: "border-color .15s ease",
                "&:hover": { borderColor: t.hover },
                "&.Mui-disabled": { opacity: 0.5, color: t.color },
            }}
        >
            {icon}
            {children}
            {trailing}
        </ButtonBase>
    );
}

// ─── Panel header (management views) ───────────────────────────────────────
export function PanelHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
    return (
        <Box sx={{ display: "flex", alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", gap: "12px", flexWrap: "wrap", flexShrink: 0 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                <Typography component="h2" sx={{ ...TEXT.poppinsSemi20, fontSize: { xs: "18px", sm: "20px" }, color: CC.white }}>
                    {title}
                </Typography>
                {subtitle && <Typography sx={{ ...TEXT.reg14, color: CC.n400 }}>{subtitle}</Typography>}
            </Box>
            {actions && <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>{actions}</Box>}
        </Box>
    );
}

/** Empty / info state inside a panel. */
export function EmptyCard({ title, message, action }: { title: string; message?: string; action?: React.ReactNode }) {
    return (
        <GlassCard sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", py: "40px !important", textAlign: "center", flexShrink: 0 }}>
            <Typography sx={{ ...TEXT.semi18, color: CC.white }}>{title}</Typography>
            {message && <Typography sx={{ ...TEXT.med14, color: CC.n300, maxWidth: 420 }}>{message}</Typography>}
            {action}
        </GlassCard>
    );
}

// ─── Reason modal (hide / reject / delete / ban) ───────────────────────────
interface ReasonModalProps {
    open: boolean;
    title: string;
    message?: string;
    confirmLabel: string;
    /** Reason must be filled in (reject / ban). */
    required?: boolean;
    danger?: boolean;
    busy?: boolean;
    placeholder?: string;
    children?: React.ReactNode;
    onConfirm: (reason: string) => void;
    onClose: () => void;
}

export function ReasonModal({ open, title, message, confirmLabel, required, danger, busy, placeholder, children, onConfirm, onClose }: ReasonModalProps) {
    const [reason, setReason] = useState("");
    const [lastOpen, setLastOpen] = useState(open);
    if (open !== lastOpen) {
        setLastOpen(open);
        if (open) setReason("");
    }
    const disabled = busy || (required && !reason.trim());
    return (
        <CommunityModal open={open} onClose={busy ? () => undefined : onClose} title={title} width={480}>
            {message && <Typography sx={{ ...TEXT.med16, color: CC.n200 }}>{message}</Typography>}
            {children}
            <FormRow label={required ? "Reason (shared with the member)" : "Reason (optional, shared with the member)"}>
                <TextArea value={reason} maxLength={1000} rows={3} placeholder={placeholder} onChange={(e) => setReason(e.target.value)} autoFocus />
            </FormRow>
            <Box sx={{ display: "flex", gap: "12px" }}>
                <ButtonBase
                    onClick={onClose}
                    disabled={busy}
                    sx={{ flex: 1, height: 44, borderRadius: "10px", border: `1px solid ${CC.n700}`, color: CC.n100, ...TEXT.interMed14, "&:hover": { borderColor: CC.n500 } }}
                >
                    Cancel
                </ButtonBase>
                {danger ? (
                    <ButtonBase
                        onClick={() => onConfirm(reason.trim())}
                        disabled={disabled}
                        sx={{
                            flex: 1,
                            height: 44,
                            borderRadius: "10px",
                            bgcolor: CC.error,
                            color: CC.white,
                            ...TEXT.interMed14,
                            "&:hover": { bgcolor: "#b52233" },
                            "&.Mui-disabled": { opacity: 0.6, color: CC.white },
                        }}
                    >
                        {busy ? "Please wait…" : confirmLabel}
                    </ButtonBase>
                ) : (
                    <LmsButton onClick={() => onConfirm(reason.trim())} disabled={disabled} sx={{ flex: 1 }}>
                        {busy ? "Please wait…" : confirmLabel}
                    </LmsButton>
                )}
            </Box>
        </CommunityModal>
    );
}
