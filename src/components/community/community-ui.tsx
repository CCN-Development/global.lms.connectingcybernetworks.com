"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Box, ButtonBase, Dialog, Menu, MenuItem, SxProps, Theme, Typography } from "@mui/material";
import { FONT_INTER, FONT_LATO, FONT_POPPINS, gradientBorder } from "@/components/aish/tokens";
import { Author, CategoryId, CC, communityAsset, findCategory } from "./community-data";

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

export function CategoryLabel({ categoryId, gap = "8px", color = CC.n200 }: { categoryId: CategoryId; gap?: string; color?: string }) {
    const category = findCategory(categoryId);
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
export function UserAvatar({ author, size = 32 }: { author: Author; size?: number }) {
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

export function AuthorRow({ author, subtitle, size = 32, you }: { author: Author; subtitle?: string; size?: number; you?: boolean }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
            <UserAvatar author={author} size={size} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                <Typography sx={{ ...TEXT.med16, color: CC.n100, ...ellipsis }}>
                    {author.name}
                    {you ? " (You)" : ""}
                </Typography>
                <Typography sx={{ ...TEXT.med12, color: CC.n500, ...ellipsis }}>{subtitle ?? author.role}</Typography>
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
export function PillButton({ icon, children, onClick }: { icon: string; children: React.ReactNode; onClick?: () => void }) {
    return (
        <ButtonBase
            onClick={onClick}
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
    icon: string;
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
                        <Icon name={item.icon} size={20} />
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
