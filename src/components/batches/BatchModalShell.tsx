"use client";
import React from "react";
import { Box, Button, Dialog, Typography } from "@mui/material";
import { FONT_INTER, FONT_POPPINS } from "@/components/batches/batch-card-ui";

/* Figma batch modals: black 604px panel, blue top/right stroke and a blurred diagonal light streak. */

export function BatchModalShell({
    open, onClose, children, width = 604, gap = 32, align = "stretch", glowLeft = -139.88,
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    width?: number;
    gap?: number;
    align?: "stretch" | "center";
    glowLeft?: number;
}) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{
                backdrop: { sx: { backgroundColor: "rgba(64,64,64,0.24)", backdropFilter: "blur(12px)" } },
                paper: {
                    sx: {
                        position: "relative",
                        width: "100%",
                        maxWidth: width,
                        m: 2,
                        // Figma strokes are inside the frame: the 1.5px top/right border comes out of the 32px padding.
                        p: { xs: "24px", sm: "30.5px 30.5px 32px 32px" },
                        bgcolor: "#000",
                        backgroundImage: "none",
                        backdropFilter: "blur(50px)",
                        borderRadius: "24px",
                        borderTop: "1.5px solid #508af2",
                        borderRight: "1.5px solid #508af2",
                        overflowX: "hidden",
                        overflowY: "auto",
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": { display: "none" },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: align,
                        gap: `${gap}px`,
                        boxShadow: "none",
                    },
                },
            }}
        >
            <Box
                aria-hidden
                sx={{
                    position: "absolute",
                    left: `${glowLeft}px`,
                    top: "-282.5px",
                    width: 977.882,
                    height: 1140.277,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                }}
            >
                <Box sx={{ position: "relative", width: 69.794, height: 1433.31, transform: "rotate(-40.17deg)", flexShrink: 0 }}>
                    <Box
                        component="img"
                        src="/batches/modal-glow.svg"
                        alt=""
                        sx={{ position: "absolute", left: "-100px", top: "-100px", width: 269.794, height: 1633.31, maxWidth: "none" }}
                    />
                </Box>
            </Box>
            {children}
        </Dialog>
    );
}

/** Content block that sits above the glow. */
export function ModalSection({ children, gap = 0, sx }: { children: React.ReactNode; gap?: number; sx?: object }) {
    return (
        <Box sx={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", gap: `${gap}px`, ...sx }}>
            {children}
        </Box>
    );
}

export function ModalDivider({ src = "/batches/explore/modal-divider.svg" }: { src?: string }) {
    return (
        <Box sx={{ position: "relative", width: "100%", height: 0, flexShrink: 0 }}>
            <Box component="img" src={src} alt="" aria-hidden sx={{ position: "absolute", top: "-1px", left: 0, width: "100%", height: "1px", display: "block" }} />
        </Box>
    );
}

export const MODAL_TITLE_SX = {
    fontFamily: FONT_POPPINS,
    fontWeight: 600,
    fontSize: "24px",
    lineHeight: "36px",
    color: "#fff",
};

export const MODAL_SUBTITLE_SX = {
    fontFamily: FONT_INTER,
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "21px",
    color: "#a6a6a6",
};

/** Title + optional subtitle/badge, followed by the gradient divider (24px below). */
export function ModalHeading({
    title, subtitle, badge,
}: { title: React.ReactNode; subtitle?: React.ReactNode; badge?: React.ReactNode }) {
    return (
        <ModalSection gap={24}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                    <Typography sx={MODAL_TITLE_SX}>{title}</Typography>
                    {badge}
                </Box>
                {subtitle && <Box sx={MODAL_SUBTITLE_SX}>{subtitle}</Box>}
            </Box>
            <ModalDivider />
        </ModalSection>
    );
}

const MODAL_BUTTON_TEXT_SX = {
    fontFamily: FONT_INTER,
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "21px",
    textTransform: "none" as const,
    whiteSpace: "nowrap" as const,
};

/** Borderless "Cancel" button. `grow` makes it share a row equally with a sibling button. */
export function ModalTextButton({
    children, onClick, grow = false, color = "#d9d9d9",
}: { children: React.ReactNode; onClick?: () => void; grow?: boolean; color?: string }) {
    return (
        <Button
            onClick={onClick}
            sx={{
                ...MODAL_BUTTON_TEXT_SX,
                color,
                height: 44,
                flexShrink: 0,
                px: "24px",
                borderRadius: "10px",
                flex: grow ? "1 1 0" : undefined,
                width: grow ? undefined : "100%",
                minWidth: 0,
                "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
            }}
        >
            {children}
        </Button>
    );
}

/** Soft-outlined, glowing secondary action ("Withdraw Query", "Ask a follow up"). */
export function ModalGlowButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
    return (
        <Button
            onClick={onClick}
            sx={{
                ...MODAL_BUTTON_TEXT_SX,
                color: "#fff",
                width: "100%",
                height: 44,
                p: "16px",
                borderRadius: "10px",
                border: "2px solid rgba(227,233,248,0.1)",
                boxShadow: "0 0 8px rgba(255,255,255,0.12)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
            }}
        >
            {children}
        </Button>
    );
}

/** Rounded status badge used in modal headers ("Awaiting reply", "Answered"). */
export function ModalBadge({ label, bg, color }: { label: string; bg: string; color: string }) {
    return (
        <Box
            component="span"
            sx={{
                flexShrink: 0,
                px: "8px",
                py: "2px",
                borderRadius: "99px",
                bgcolor: bg,
                color,
                fontFamily: "var(--font-lato), Lato, Arial, sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "21px",
                whiteSpace: "nowrap",
            }}
        >
            {label}
        </Box>
    );
}
