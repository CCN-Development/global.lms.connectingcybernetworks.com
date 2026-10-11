"use client";

import React from "react";
import Image from "next/image";
import { Box, ButtonBase, Drawer, Typography, type SxProps, type Theme } from "@mui/material";
import { ACTIVITY_ASSETS, COLORS, COURSE_ASSETS, FONTS, PRIMARY_BUTTON_FILL, TYPE, glassFill } from "../my-courses-theme";
import { BackButton } from "../my-courses-ui";
import { isRemoteSrc } from "../course-format";
import type { ContentBlock } from "@/contexts/CourseContext";

const focusRing = { "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" } } as const;

export const ACTIVITY_TYPE = {
    interReg16: { fontFamily: FONTS.inter, fontWeight: 400, fontSize: "16px", lineHeight: "24px" },
    interMed14: { fontFamily: FONTS.inter, fontWeight: 500, fontSize: "14px", lineHeight: "21px" },
    interMed12: { fontFamily: FONTS.inter, fontWeight: 500, fontSize: "12px", lineHeight: "18px" },
    latoReg14: { fontFamily: FONTS.lato, fontWeight: 400, fontSize: "14px", lineHeight: "21px", letterSpacing: "0.28px" },
    latoReg16: { fontFamily: FONTS.lato, fontWeight: 400, fontSize: "16px", lineHeight: "24px" },
    poppinsBold28: { fontFamily: FONTS.poppins, fontWeight: 700, fontSize: "28px", lineHeight: "42px" },
    poppinsReg28: { fontFamily: FONTS.poppins, fontWeight: 400, fontSize: "28px", lineHeight: "42px" },
    poppinsSemibold44: { fontFamily: FONTS.poppins, fontWeight: 600, fontSize: "44px", lineHeight: "66px" },
} as const;

/** Figma's absolutely placed, rotated glow layers: an outer box, a transformed inner box and an image bled past it. */
export function FigmaGlow({
    src,
    left,
    top,
    width,
    height,
    innerWidth,
    innerHeight,
    transform,
    inset,
    opacity,
}: {
    src: string;
    left: number;
    top: number;
    width: number;
    height: number;
    innerWidth: number;
    innerHeight: number;
    transform: string;
    /** CSS `inset` of the image relative to the inner box (Figma's blur bleed). */
    inset: string;
    opacity?: number;
}) {
    return (
        <Box
            aria-hidden
            sx={{
                position: "absolute",
                left,
                top,
                width,
                height,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                opacity,
            }}
        >
            <Box sx={{ position: "relative", flex: "none", width: innerWidth, height: innerHeight, transform }}>
                <Box component="img" src={src} alt="" sx={{ position: "absolute", inset, display: "block", maxWidth: "none", width: "auto", height: "auto" }} />
            </Box>
        </Box>
    );
}

/** The purple haze pair every activity card carries: one rotated in from the bottom-left, one flipped across the top-right. */
export function CardGlows({
    left,
    right,
    leftAt,
    rightAt,
}: {
    left: string;
    right: string;
    leftAt: { left: number; top: number };
    rightAt: { left: number; top: number };
}) {
    const inset = "-40.85% -28.08% -44.72% -26.33%";
    return (
        <>
            <FigmaGlow src={left} {...leftAt} width={762.09} height={757.758} innerWidth={658.303} innerHeight={416.478} transform="rotate(-135.73deg)" inset={inset} />
            <FigmaGlow src={right} {...rightAt} width={658.305} height={416.478} innerWidth={658.305} innerHeight={416.478} transform="rotate(180deg)" inset={inset} />
        </>
    );
}

/** Frosted "Preference Card" used by the quiz and lab cards. */
export function ActivityCard({
    angle,
    radius = 32,
    children,
    sx,
}: {
    angle: string;
    radius?: number;
    children: React.ReactNode;
    sx?: SxProps<Theme>;
}) {
    return (
        <Box
            sx={[
                {
                    position: "relative",
                    overflow: "hidden",
                    isolation: "isolate",
                    borderRadius: `${radius}px`,
                    border: "1px solid rgba(255,255,255,0.88)",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        zIndex: -1,
                        borderRadius: "inherit",
                        backgroundImage: glassFill(angle),
                        backdropFilter: "blur(12px)",
                        pointerEvents: "none",
                    },
                    "&::after": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        borderRadius: "inherit",
                        boxShadow: "inset 0px 3px 6px 0px rgba(255,255,255,0.16)",
                        pointerEvents: "none",
                    },
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            {children}
        </Box>
    );
}

const ICON_TILE = {
    /** Knowledge Test header chip. */
    xl: { size: 91, border: 2.275, radius: 9.1, shadow: "0px 31.85px 69.491px -37.641px #8A50E6", icon: 45.5, blur: 55.152, faint: false },
    /** Lab Challenge header chip. */
    lg: { size: 70, border: 1.75, radius: 7, shadow: "0px 24.5px 53.455px -28.955px #8A50E6", icon: 35, blur: 0, faint: true },
    /** Solution Locked chip. */
    md: { size: 52, border: 1.75, radius: 7, shadow: "0px 24.5px 53.455px -28.955px #8A50E6", icon: 20, blur: 0, faint: true },
    /** Lab waiting screen chip. */
    xxl: { size: 120, border: 3, radius: 12, shadow: "0px 42px 91.636px -49.636px #8A50E6", icon: 60, blur: 0, faint: true },
} as const;

const FAINT_RADIAL =
    "radial-gradient(circle closest-side, rgba(217,217,217,0.08) 0%, rgba(166,166,166,0.08) 50%, rgba(141,141,141,0.08) 75%, rgba(115,115,115,0.08) 100%)";
const CLEAR_RADIAL = "radial-gradient(circle closest-side, rgba(217,217,217,0) 0%, rgba(115,115,115,0.12) 100%)";

/** Figma "Icon Certificate": white-rimmed square chip with a violet under-glow. */
export function IconTile({ variant, icon, sx }: { variant: keyof typeof ICON_TILE; icon: string; sx?: SxProps<Theme> }) {
    const t = ICON_TILE[variant];
    return (
        <Box
            aria-hidden
            sx={[
                {
                    position: "relative",
                    flexShrink: 0,
                    width: t.size,
                    height: t.size,
                    overflow: "hidden",
                    borderRadius: `${t.radius}px`,
                    boxShadow: t.shadow,
                    backgroundImage: t.faint ? FAINT_RADIAL : CLEAR_RADIAL,
                    backdropFilter: t.blur ? `blur(${t.blur}px)` : undefined,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    // White rim that fades out before the bottom edge.
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        borderRadius: "inherit",
                        padding: `${t.border}px`,
                        backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.64) 0%, rgba(255,255,255,0) 50%)",
                        WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                        pointerEvents: "none",
                    },
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            <Image src={icon} alt="" width={t.icon} height={t.icon} />
        </Box>
    );
}

export interface StatTile {
    value: string;
    label: string;
}

/** "BEFORE YOU START" / "RESULT" caption over three frosted stat tiles. */
export function StatTiles({ caption, tiles, children }: { caption: string; tiles: StatTile[]; children?: React.ReactNode }) {
    return (
        <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: "100%", maxWidth: 506 }}>
            <Typography noWrap sx={{ ...TYPE.xsMed12, color: COLORS.neutral400, textAlign: "center", width: "100%" }}>
                {caption}
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: { xs: "8px", sm: "16px" }, width: "100%" }}>
                {tiles.map((tile) => (
                    <Box
                        key={tile.label}
                        sx={{
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "8px",
                            p: "12px",
                            borderRadius: "12px",
                            bgcolor: "rgba(0,0,0,0.24)",
                            backdropFilter: "blur(15px)",
                            minWidth: 0,
                            // Glass stroke that fades out towards the bottom edge.
                            "&::before": {
                                content: '""',
                                position: "absolute",
                                inset: 0,
                                borderRadius: "inherit",
                                padding: "1px",
                                backgroundImage: "linear-gradient(180deg, rgba(191,191,191,0.32) 0%, rgba(191,191,191,0.04) 100%)",
                                WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                                WebkitMaskComposite: "xor",
                                maskComposite: "exclude",
                                pointerEvents: "none",
                            },
                        }}
                    >
                        <Typography sx={{ ...TYPE.largeMed18, color: COLORS.white, textAlign: "center" }}>{tile.value}</Typography>
                        <Typography sx={{ ...ACTIVITY_TYPE.latoReg16, color: COLORS.neutral200, textAlign: "center" }}>{tile.label}</Typography>
                    </Box>
                ))}
            </Box>
            {children}
        </Box>
    );
}

/** 1px rule that fades towards both ends. */
export function CardDivider({ src = `${ACTIVITY_ASSETS}/divider.svg`, maxWidth = 580 }: { src?: string; maxWidth?: number }) {
    return (
        <Box aria-hidden sx={{ position: "relative", width: "100%", maxWidth, height: "1px", lineHeight: 0, flexShrink: 0 }}>
            <Box component="img" src={src} alt="" sx={{ display: "block", width: "100%", height: "1px", maxWidth: "none" }} />
        </Box>
    );
}

/** Figma "LMS Button" — blue → violet fill. */
export function ActivityButton({
    children,
    onClick,
    width = 200,
    disabled,
    sx,
}: {
    children: React.ReactNode;
    onClick: () => void;
    width?: number | string;
    disabled?: boolean;
    sx?: SxProps<Theme>;
}) {
    return (
        <ButtonBase
            onClick={onClick}
            disabled={disabled}
            sx={[
                {
                    position: "relative",
                    flexShrink: 0,
                    width,
                    maxWidth: "100%",
                    height: 44,
                    px: "16px",
                    borderRadius: "10px",
                    backgroundImage: PRIMARY_BUTTON_FILL,
                    filter: "drop-shadow(0px 0px 4px rgba(255,255,255,0.12))",
                    transition: "filter .18s ease, opacity .18s ease",
                    "&:hover": { filter: "drop-shadow(0px 0px 10px rgba(140,36,255,0.55))" },
                    "&.Mui-disabled": { opacity: 0.45 },
                    ...focusRing,
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            <Typography component="span" sx={{ ...ACTIVITY_TYPE.interMed14, color: COLORS.white, whiteSpace: "nowrap" }}>
                {children}
            </Typography>
        </ButtonBase>
    );
}

/** Borderless secondary action ("I will do this later", "See Explanation"). */
export function GhostButton({ children, onClick, size = "sm" }: { children: React.ReactNode; onClick: () => void; size?: "sm" | "lg" }) {
    const lg = size === "lg";
    return (
        <ButtonBase
            onClick={onClick}
            sx={{
                flexShrink: 0,
                height: lg ? 56 : 36,
                width: lg ? { xs: "auto", sm: 193 } : "auto",
                px: lg ? "20px" : "16px",
                borderRadius: lg ? "12px" : "10px",
                backdropFilter: lg ? undefined : "blur(4px)",
                filter: lg ? undefined : "drop-shadow(0px 0px 4px rgba(255,255,255,0.12))",
                transition: "background-color .18s ease",
                "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                ...focusRing,
            }}
        >
            <Typography component="span" sx={{ ...(lg ? TYPE.smallMed14 : TYPE.xsMed12), color: COLORS.white, whiteSpace: "nowrap" }}>
                {children}
            </Typography>
        </ButtonBase>
    );
}

/** Panel background: corner glows plus the two faint wave meshes (exported from the 1144 × 1080 frame). */
function PanelBackdrop() {
    return (
        <Box aria-hidden sx={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
            <Box component="img" src={`${COURSE_ASSETS}/levels/card-glow.svg`} alt="" sx={{ position: "absolute", left: 603.3, top: 140.3, width: 1199.49, height: 1199.49, maxWidth: "none" }} />
            <Box component="img" src={`${ACTIVITY_ASSETS}/panel-waves-top.png`} alt="" sx={{ position: "absolute", left: 0, top: 0, width: 1144, height: 1080, maxWidth: "none" }} />
            <Box component="img" src={`${ACTIVITY_ASSETS}/ellipse-2048.svg`} alt="" sx={{ position: "absolute", left: -1169.5, top: -1200.5, width: 2336, height: 2336, maxWidth: "none" }} />
            <Box component="img" src={`${ACTIVITY_ASSETS}/ellipse-2050.svg`} alt="" sx={{ position: "absolute", left: -415.6, top: 121.4, width: 2232.77, height: 2232.77, maxWidth: "none" }} />
            <Box component="img" src={`${ACTIVITY_ASSETS}/panel-waves-bottom.png`} alt="" sx={{ position: "absolute", right: 0, bottom: 0, width: 1144, height: 1080, maxWidth: "none" }} />
        </Box>
    );
}

/**
 * Right-hand overlay ("Submit Assignment" frame) that hosts the quiz and lab flows above a blurred page.
 * Header holds the back button plus optional extras; the footer bar spans the panel edge to edge.
 */
export function ActivityPanel({
    open,
    onClose,
    onBack,
    header,
    footer,
    children,
    ariaLabel,
}: {
    open: boolean;
    onClose: () => void;
    /** Defaults to `onClose`. */
    onBack?: () => void;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    children: React.ReactNode;
    ariaLabel: string;
}) {
    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            slotProps={{
                backdrop: {
                    sx: {
                        backdropFilter: "blur(8px)",
                        backgroundColor: "transparent",
                        backgroundImage:
                            "linear-gradient(90deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.2) 100%), linear-gradient(90deg, rgba(64,64,64,0.24) 0%, rgba(64,64,64,0.24) 100%)",
                    },
                },
                paper: {
                    role: "dialog",
                    "aria-label": ariaLabel,
                    sx: {
                        width: { xs: "100%", md: "calc(100% - 120px)", lg: "calc(100% - 296px)" },
                        height: "100%",
                        overflow: "hidden",
                        color: COLORS.white,
                        bgcolor: "#000",
                        backgroundImage: "none",
                        backdropFilter: "blur(50px)",
                        border: { xs: "none", md: "1.5px solid #508AF2" },
                        borderRight: { md: "none" },
                        borderRadius: { xs: 0, md: "32px 0 0 32px" },
                        boxShadow: "0px 0px 44px 0px rgba(255,255,255,0.32)",
                        p: { xs: "16px", sm: "24px", md: "32px" },
                        display: "flex",
                        flexDirection: "column",
                    },
                },
            }}
        >
            <PanelBackdrop />
            <Box sx={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "24px", flexShrink: 0 }}>
                <BackButton label="Close" onClick={onBack ?? onClose} />
                {header && <Box sx={{ flex: 1, minWidth: 0 }}>{header}</Box>}
            </Box>
            <Box
                sx={{
                    position: "relative",
                    zIndex: 1,
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    overflowX: "hidden",
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                }}
            >
                {children}
            </Box>
            {footer && (
                <Box
                    sx={{
                        position: "relative",
                        zIndex: 1,
                        flexShrink: 0,
                        mx: { xs: "-16px", sm: "-24px", md: "-32px" },
                        mb: { xs: "-16px", sm: "-24px", md: "-32px" },
                        p: { xs: "16px", sm: "24px" },
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        bgcolor: "rgba(0,0,0,0.44)",
                        borderTop: "1px solid rgba(255,255,255,0.12)",
                    }}
                >
                    {footer}
                </Box>
            )}
        </Drawer>
    );
}

/** Renders theory / lab copy blocks with the Figma text styles. */
export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
            {blocks.map((block, i) => (
                <ContentBlockView key={i} block={block} />
            ))}
        </Box>
    );
}

export function ContentBlockView({ block }: { block: ContentBlock }) {
    switch (block.type) {
        case "heading":
            return (
                <Typography component="h3" sx={{ ...ACTIVITY_TYPE.poppinsBold28, fontSize: { xs: "22px", sm: "28px" }, color: COLORS.white }}>
                    {block.text}
                </Typography>
            );
        case "paragraph":
            return <Typography sx={{ ...ACTIVITY_TYPE.interReg16, color: COLORS.white, overflowWrap: "anywhere" }}>{block.text}</Typography>;
        case "field":
            return (
                <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Typography sx={{ ...ACTIVITY_TYPE.latoReg14, color: COLORS.neutral400 }}>{block.label}</Typography>
                    <Box>
                        {block.lines.map((line) => (
                            <Typography key={line} sx={{ ...ACTIVITY_TYPE.interReg16, color: COLORS.white, overflowWrap: "anywhere" }}>
                                {line}
                            </Typography>
                        ))}
                    </Box>
                </Box>
            );
        case "list":
            return (
                <Box component="ul" sx={{ m: 0, pl: "24px", listStyle: "disc", ...ACTIVITY_TYPE.interReg16, color: COLORS.white }}>
                    {block.items.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </Box>
            );
        case "links":
            return (
                <Box component="ul" sx={{ m: 0, pl: "24px", listStyle: "disc", ...ACTIVITY_TYPE.interReg16, color: COLORS.milestoneBorder }}>
                    {block.items.map((link) => (
                        <li key={link.href}>
                            <Box
                                component="a"
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ color: "inherit", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                            >
                                {link.label}
                            </Box>
                        </li>
                    ))}
                </Box>
            );
        case "image":
            return (
                <Box sx={{ position: "relative", width: "100%", aspectRatio: String(block.ratio), flexShrink: 0 }}>
                    <Image
                        src={block.src}
                        alt={block.alt}
                        fill
                        sizes="(max-width: 900px) 100vw, 432px"
                        unoptimized={isRemoteSrc(block.src)}
                        style={{ objectFit: "cover" }}
                    />
                </Box>
            );
    }
}

/** "m:ss" for result tiles. */
export function formatDuration(ms: number): string {
    const total = Math.max(0, Math.round(ms / 1000));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
