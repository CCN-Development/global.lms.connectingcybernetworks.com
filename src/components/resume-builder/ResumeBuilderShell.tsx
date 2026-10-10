"use client";

import React from "react";
import { Box, Snackbar } from "@mui/material";
import { useResumeBuilder } from "./ResumeBuilderContext";
import { RB, RTEXT } from "./rb-ui";

/** Full-screen frame (no sidebar) used by every Resume Builder page, as in the Figma frames. */
export default function ResumeBuilderShell({ children }: { children: React.ReactNode }) {
    const { notice, notify } = useResumeBuilder();
    return (
        <Box component="main" sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", gap: "24px", p: { xs: "16px", sm: "24px" }, color: RB.white }}>
            {children}
            <Snackbar
                open={!!notice}
                autoHideDuration={4000}
                onClose={() => notify(null)}
                message={notice}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                sx={{ zIndex: 1500 }}
                slotProps={{
                    content: { sx: { bgcolor: "#0B0F1F", color: RB.n75, border: `1px solid ${RB.primary}`, borderRadius: "12px", ...RTEXT.med14 } },
                }}
            />
        </Box>
    );
}
