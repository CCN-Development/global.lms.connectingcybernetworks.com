"use client";

import React from "react";
import Image from "next/image";
import { Box, ButtonBase, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { COLORS, GOLD_GRADIENT, PRIMARY_BUTTON_FILL, TYPE, glassFill, gradientText } from "../my-courses-theme";

const ASSETS = "/my-courses/set-goal";

/** Purple key-art behind a selected option; anchored top-left so every card shows the same corner of the glow. */
const SELECTED_FILL = `url(${ASSETS}/selected-card-art.png) left top / 432px 202px no-repeat, #07051B`;

/** Selected "Detail Card" surface, also used by the non-interactive review summary. */
export const SELECTED_CARD_SX = {
    position: "relative" as const,
    overflow: "hidden",
    p: "16px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.64)",
    background: SELECTED_FILL,
};

/** Glass container that hosts each wizard step ("My Tasks" in Figma). */
export function GoalPanel({
    title,
    subtitle,
    subtitleNoWrap = false,
    width,
    children,
}: {
    title: string;
    subtitle: string;
    /** Keep the subtitle on one line from `sm` up when the design sizes the panel to it exactly. */
    subtitleNoWrap?: boolean;
    width: number;
    children: React.ReactNode;
}) {
    return (
        <Box
            component="section"
            aria-label={title}
            sx={{
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                gap: "32px",
                width,
                maxWidth: "100%",
                // Figma strokes sit inside the frame, so 31px + the 1px border reproduces its 32px inset exactly.
                p: { xs: "19px", sm: "31px" },
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.88)",
                backgroundImage: glassFill("163deg"),
                backdropFilter: "blur(12px)",
                boxShadow: "inset 0px 3px 6px 0px rgba(255,255,255,0.16)",
            }}
        >
            {/* Edge treatments from the design: a soft shadow down the left edge and blurred top/bottom sheen. */}
            <Box
                aria-hidden
                sx={{ position: "absolute", left: -221, top: 191, width: 428, height: 60, transform: "rotate(90deg)", pointerEvents: "none", lineHeight: 0 }}
            >
                <Image src={`${ASSETS}/card-glow-left.svg`} alt="" width={428} height={60} style={{ maxWidth: "none" }} />
            </Box>
            <Box
                aria-hidden
                sx={{ position: "absolute", left: 4, top: -7, width: 717, height: 15, filter: "blur(50px)", pointerEvents: "none", lineHeight: 0 }}
            >
                <Image src={`${ASSETS}/card-edge-blur.png`} alt="" width={717} height={15} style={{ maxWidth: "none" }} />
            </Box>
            <Box
                aria-hidden
                sx={{ position: "absolute", left: 4, bottom: -16, width: 717, height: 15, filter: "blur(50px)", transform: "scaleY(-1)", pointerEvents: "none", lineHeight: 0 }}
            >
                <Image src={`${ASSETS}/card-edge-blur.png`} alt="" width={717} height={15} style={{ maxWidth: "none" }} />
            </Box>

            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "12px", textAlign: "center" }}>
                <Typography component="h2" sx={{ ...TYPE.headingSemibold20, color: COLORS.white }}>
                    {title}
                </Typography>
                <Typography sx={{ ...TYPE.mediumMed16, color: COLORS.neutral200, whiteSpace: subtitleNoWrap ? { sm: "nowrap" } : undefined }}>
                    {subtitle}
                </Typography>
            </Box>

            {children}
        </Box>
    );
}

/** Selectable tile ("Detail Card"). Selected tiles carry the purple key art; locked tiles are inert. */
export function OptionCard({
    selected,
    disabled = false,
    role = "radio",
    onClick,
    sx,
    children,
}: {
    selected: boolean;
    disabled?: boolean;
    role?: "radio" | "checkbox";
    onClick?: () => void;
    sx?: SxProps<Theme>;
    children: React.ReactNode;
}) {
    return (
        <ButtonBase
            role={role}
            aria-checked={selected}
            disabled={disabled}
            onClick={onClick}
            sx={[
                {
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    textAlign: "left",
                    overflow: "hidden",
                    p: "16px",
                    borderRadius: "16px",
                    border: "1px solid",
                    transition: "border-color .18s ease, box-shadow .18s ease",
                    "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" },
                    "&.Mui-disabled": { pointerEvents: "auto", cursor: "not-allowed" },
                },
                selected
                    ? { borderColor: "rgba(255,255,255,0.64)", background: SELECTED_FILL }
                    : {
                          borderColor: "rgba(140,140,140,0.24)",
                          backdropFilter: "blur(25px)",
                          "&:hover:not(.Mui-disabled)": { borderColor: "rgba(255,255,255,0.4)" },
                      },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            {children}
        </ButtonBase>
    );
}

export function GoalDivider() {
    return (
        <Box aria-hidden sx={{ position: "relative", width: "100%", height: "1px", lineHeight: 0 }}>
            <Box component="img" src={`${ASSETS}/divider.svg`} alt="" sx={{ display: "block", width: "100%", height: "1px", maxWidth: "none" }} />
        </Box>
    );
}

/** Gold → orange helper line ("Your Target : …", "Selected : …"). */
export function GoalNote({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "center" }) {
    return (
        <Typography
            role="status"
            sx={{ ...TYPE.smallMed14, ...gradientText(GOLD_GRADIENT), position: "relative", textAlign: align, alignSelf: "stretch" }}
        >
            {children}
        </Typography>
    );
}

export function PrimaryButton({ children, onClick, disabled = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
    return (
        <ButtonBase
            onClick={onClick}
            disabled={disabled}
            sx={{
                position: "relative",
                width: "100%",
                height: 44,
                p: "16px",
                borderRadius: "10px",
                backgroundImage: PRIMARY_BUTTON_FILL,
                filter: "drop-shadow(0px 0px 4px rgba(255,255,255,0.12))",
                transition: "filter .18s ease, opacity .18s ease",
                "&:hover": { filter: "drop-shadow(0px 0px 10px rgba(140,36,255,0.55))" },
                "&.Mui-disabled": { opacity: 0.4 },
                "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" },
            }}
        >
            <Typography component="span" sx={{ ...TYPE.buttonMed14, color: COLORS.white, whiteSpace: "nowrap" }}>
                {children}
            </Typography>
        </ButtonBase>
    );
}

export function GhostButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
    return (
        <ButtonBase
            onClick={onClick}
            sx={{
                height: 36,
                px: "16px",
                py: "8px",
                borderRadius: "10px",
                backdropFilter: "blur(4px)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" },
            }}
        >
            <Typography component="span" sx={{ ...TYPE.xsMed12, color: COLORS.white, whiteSpace: "nowrap" }}>
                {children}
            </Typography>
        </ButtonBase>
    );
}

export const SET_GOAL_ASSETS = ASSETS;
