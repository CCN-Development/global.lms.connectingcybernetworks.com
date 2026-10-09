"use client";

import React from "react";
import Image from "next/image";
import { Box, ButtonBase, Typography } from "@mui/material";
import { COLORS, MY_COURSES_ASSETS, TYPE } from "./my-courses-theme";

export interface HeaderAction {
    label: string;
    onClick?: () => void;
}

const actionSx = {
    height: 44,
    p: "16px",
    borderRadius: "10px",
    border: `1px solid ${COLORS.buttonBorder}`,
    boxShadow: "0px 0px 8px 0px rgba(255,255,255,0.12)",
    transition: "border-color .18s ease, box-shadow .18s ease",
    "&:hover": { borderColor: "rgba(227,233,248,0.64)", boxShadow: "0px 0px 12px 0px rgba(255,255,255,0.2)" },
    "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" },
} as const;

/** "My Courses" page title row with its outlined action buttons. */
export default function MyCoursesHeader({ title, actions }: { title: string; actions: HeaderAction[] }) {
    return (
        <Box
            sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                minHeight: 48,
            }}
        >
            {/* Star-dust texture that bleeds down from above the header */}
            <Box
                aria-hidden
                sx={{
                    position: "absolute",
                    left: "158px",
                    top: "-756px",
                    lineHeight: 0,
                    pointerEvents: "none",
                    display: { xs: "none", md: "block" },
                }}
            >
                <Image src={`${MY_COURSES_ASSETS}/ui/header-vector.svg`} alt="" width={901} height={831} style={{ maxWidth: "none" }} />
            </Box>

            <Typography component="h1" noWrap sx={{ ...TYPE.headingMed20, position: "relative", color: COLORS.white }}>
                {title}
            </Typography>

            <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: { xs: "8px", sm: "16px" }, flexShrink: 0 }}>
                {actions.map((action) => (
                    <ButtonBase key={action.label} onClick={action.onClick} sx={actionSx}>
                        <Typography component="span" sx={{ ...TYPE.buttonMed14, color: COLORS.white, whiteSpace: "nowrap" }}>
                            {action.label}
                        </Typography>
                    </ButtonBase>
                ))}
            </Box>
        </Box>
    );
}
