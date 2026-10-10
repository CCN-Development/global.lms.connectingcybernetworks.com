"use client";

import React from "react";
import { Box } from "@mui/material";
import { cq } from "./placement-ui";

/** Two-column detail layout: job description (691) + right rail (541). Stacks when narrow. */
export default function DetailLayout({ main, aside }: { main: React.ReactNode; aside: React.ReactNode }) {
    return (
        <Box sx={{ containerType: "inline-size", pb: "24px", pt: "8px" }}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                    [cq(900)]: { flexDirection: "row", alignItems: "flex-start" },
                }}
            >
                <Box sx={{ flex: 1, minWidth: 0, maxWidth: { xl: 691 } }}>{main}</Box>
                <Box sx={{ width: "100%", flexShrink: 0, [cq(900)]: { width: "43%", maxWidth: 541 } }}>{aside}</Box>
            </Box>
        </Box>
    );
}
