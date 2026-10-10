"use client";
import React from "react";
import { Box, ButtonBase, Collapse, Typography } from "@mui/material";
import { CARD_GRID_SX, FONT_POPPINS, Glow } from "@/components/batches/batch-card-ui";

/** One month on the Completed-batches timeline (Figma: "Month - Completed"), collapsible. */
export default function CompletedMonthSection({
    label, expanded, onToggle, children,
}: {
    label: string;
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    return (
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: { xs: "12px", md: "24px" } }}>
            {/* Timeline stepper */}
            <Box sx={{ display: "flex", flexDirection: "column", alignSelf: "stretch", alignItems: "center", gap: "2px", pt: "20px", width: 24, flexShrink: 0 }}>
                <Box component="img" src="/batches/stepper-dot.svg" alt="" aria-hidden sx={{ width: 24, height: 24, display: "block", flexShrink: 0 }} />
                <Box
                    component="img"
                    src={expanded ? "/batches/stepper-line-active.svg" : "/batches/stepper-line.svg"}
                    alt=""
                    aria-hidden
                    sx={{ flex: 1, width: 24, minHeight: 18, display: "block", transform: "scaleX(-1)" }}
                />
            </Box>

            {/* Month card */}
            <Box sx={{ position: "relative", flex: 1, minWidth: 0, minHeight: 64, borderRadius: "24px", overflow: "hidden", bgcolor: "rgba(255,255,255,0.04)" }}>
                <Glow src="/batches/month-glow-2.svg" left={634.5} top={-352.5} rotate={125.34} />
                <Glow src="/batches/month-glow-1.svg" left={759.5} top={-390.5} rotate={125.34} />

                <ButtonBase
                    onClick={onToggle}
                    aria-expanded={expanded}
                    sx={{
                        position: "relative",
                        zIndex: 1,
                        width: "100%",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: "24px",
                        py: "16px",
                        bgcolor: "rgba(140,140,140,0.08)",
                        textAlign: "left",
                    }}
                >
                    {expanded ? (
                        <>
                            <Glow src="/batches/card-glow-2.svg" left={77.5} top={-294} rotate={-8.33} />
                            <Glow src="/batches/card-glow-1.svg" left={191.3} top={-229.9} rotate={-8.33} />
                        </>
                    ) : (
                        <>
                            <Glow src="/batches/month-glow-3.svg" left={327.9} top={-160.4} rotate={89.03} />
                            <Glow src="/batches/month-glow-4.svg" left={406.1} top={-264.8} rotate={89.03} />
                        </>
                    )}
                    <Typography sx={{ position: "relative", fontFamily: FONT_POPPINS, fontStyle: "italic", fontSize: "20px", lineHeight: "30px", color: "#fff" }}>
                        {label}
                    </Typography>
                    <Box
                        component="span"
                        sx={{
                            position: "relative",
                            width: 32,
                            height: 32,
                            borderRadius: "99px",
                            bgcolor: "rgba(242,242,242,0.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transform: expanded ? "none" : "rotate(180deg)",
                            transition: "transform 0.2s ease",
                        }}
                    >
                        <Box component="img" src="/batches/arrow-up.svg" alt="" aria-hidden sx={{ width: 20, height: 20 }} />
                    </Box>
                </ButtonBase>

                <Collapse in={expanded} unmountOnExit>
                    <Box sx={{ position: "relative", zIndex: 1, px: { xs: "16px", md: "24px" }, pt: { xs: "16px", md: "20px" }, pb: { xs: "16px", md: "24px" } }}>
                        <Box sx={CARD_GRID_SX}>{children}</Box>
                    </Box>
                </Collapse>
            </Box>
        </Box>
    );
}
