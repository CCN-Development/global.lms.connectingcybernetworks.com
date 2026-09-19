"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import {
    MdBolt,
    MdStarBorder,
    MdSignalCellularAlt,
    MdSignalCellularAlt1Bar,
    MdSignalCellularAlt2Bar,
} from "react-icons/md";
import { DIFFICULTY_COLORS, LAB_ART, labStatusBadge, type PracticeLab } from "./lab-data";

const DIFFICULTY_ICON = {
    Easy: MdSignalCellularAlt1Bar,
    Intermediate: MdSignalCellularAlt2Bar,
    Hard: MdSignalCellularAlt,
} as const;

const Dot = () => (
    <Box component="span" sx={{ color: "#4b4b58", fontSize: "0.7rem", lineHeight: 1 }}>
        •
    </Box>
);

export default function LabCard({ lab, onClick }: { lab: PracticeLab; onClick: () => void }) {
    const badge = labStatusBadge(lab);
    const DifficultyIcon = DIFFICULTY_ICON[lab.difficulty];
    const difficultyColor = DIFFICULTY_COLORS[lab.difficulty];

    return (
        <Box
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onClick();
            }}
            sx={{
                position: "relative",
                height: { xs: 190, sm: 205 },
                borderRadius: "14px",
                overflow: "hidden",
                cursor: "pointer",
                border: "1px solid #1c1c26",
                bgcolor: "#07070d",
                transition: "transform .18s ease, border-color .18s ease, box-shadow .18s ease",
                "&:hover": {
                    transform: "translateY(-3px)",
                    borderColor: "#7c3aed",
                    boxShadow: "0 14px 34px -14px #7c3aed",
                },
                "&:focus-visible": { outline: "2px solid #009DFF", outlineOffset: "2px" },
            }}
        >
            {/* Aurora artwork */}
            <Box sx={{ position: "absolute", inset: 0, background: LAB_ART[lab.art] }} />
            <Box
                sx={{
                    position: "absolute",
                    top: "-30%",
                    right: "-15%",
                    width: "85%",
                    height: "95%",
                    borderRadius: "50%",
                    background: "linear-gradient(120deg, #ffffff 0%, #b388ff 35%, #ff5bc8 70%, rgba(255,91,200,0) 100%)",
                    opacity: 0.35,
                    filter: "blur(26px)",
                    transform: "rotate(-18deg)",
                }}
            />
            {/* Fade so the copy always stays readable */}
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "linear-gradient(180deg, rgba(5,6,13,0) 0%, rgba(5,6,13,0.5) 34%, #07070d 58%, #07070d 100%)",
                }}
            />

            {/* Content */}
            <Box
                sx={{
                    position: "relative",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    p: 1.5,
                }}
            >
                <Box
                    component="span"
                    sx={{
                        alignSelf: "flex-start",
                        bgcolor: badge.bg,
                        color: badge.fg,
                        borderRadius: "999px",
                        px: 1.1,
                        py: 0.3,
                        mb: 1,
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        lineHeight: 1.5,
                        whiteSpace: "nowrap",
                    }}
                >
                    {badge.label}
                </Box>

                <Typography
                    sx={{
                        color: "#fff",
                        fontSize: "0.92rem",
                        fontWeight: 700,
                        lineHeight: 1.3,
                        letterSpacing: "-0.01em",
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {lab.title}
                </Typography>

                <Typography
                    sx={{
                        mt: 0.4,
                        color: "#9a9aab",
                        fontSize: "0.72rem",
                        lineHeight: 1.45,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: "2.1rem",
                    }}
                >
                    {lab.description}
                </Typography>

                <Box sx={{ height: "1px", bgcolor: "#1e1e28", mt: 1.1, mb: 0.9 }} />

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                        <DifficultyIcon size={13} color={difficultyColor} />
                        <Typography sx={{ color: "#c9c9d4", fontSize: "0.68rem", fontWeight: 500 }}>
                            {lab.difficulty}
                        </Typography>
                    </Box>
                    <Dot />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                        <MdBolt size={13} color="#f59e0b" />
                        <Typography sx={{ color: "#c9c9d4", fontSize: "0.68rem", fontWeight: 500 }}>
                            {lab.xp} XP
                        </Typography>
                    </Box>
                    <Dot />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                        <MdStarBorder size={13} color={lab.access === "Free" ? "#06b6d4" : "#7c3aed"} />
                        <Typography sx={{ color: "#c9c9d4", fontSize: "0.68rem", fontWeight: 500 }}>
                            {lab.access}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
