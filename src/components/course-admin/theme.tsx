"use client";

import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Toaster } from "react-hot-toast";

const SURFACE = "rgba(13,15,31,0.97)";
const BORDER = "1px solid rgba(255,255,255,0.08)";

/** Dark MUI theme matching the LMS glass design (without it MUI renders light controls in Roboto). */
export const courseAdminTheme = createTheme({
    palette: {
        mode: "dark",
        primary: { main: "#5B7CFF", contrastText: "#FFFFFF" },
        secondary: { main: "#A855F7" },
        success: { main: "#22C55E" },
        warning: { main: "#F59E0B" },
        error: { main: "#F87171" },
        info: { main: "#38BDF8" },
        background: { default: "transparent", paper: "#0d0f1f" },
        divider: "rgba(255,255,255,0.08)",
        text: { primary: "#F5F6FA", secondary: "#A3A8BD" },
    },
    shape: { borderRadius: 12 },
    typography: {
        fontFamily: "var(--font-lato), var(--font-sans), sans-serif",
        h5: { fontFamily: "var(--font-poppins), sans-serif", fontWeight: 600 },
        h6: { fontFamily: "var(--font-poppins), sans-serif", fontWeight: 600 },
        subtitle1: { fontWeight: 600 },
        button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
        MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
        MuiDialog: {
            styleOverrides: {
                paper: { background: SURFACE, border: BORDER, borderRadius: 20, backdropFilter: "blur(16px)" },
            },
        },
        MuiDialogTitle: { styleOverrides: { root: { fontFamily: "var(--font-poppins), sans-serif", fontWeight: 600, fontSize: 18 } } },
        MuiDrawer: { styleOverrides: { paper: { background: "rgba(10,11,24,0.98)", borderLeft: BORDER, backdropFilter: "blur(16px)" } } },
        MuiMenu: { styleOverrides: { paper: { background: SURFACE, border: BORDER, backdropFilter: "blur(12px)" } } },
        MuiPopover: { styleOverrides: { paper: { background: SURFACE, border: BORDER } } },
        MuiAutocomplete: { styleOverrides: { paper: { background: SURFACE, border: BORDER } } },
        MuiTooltip: { styleOverrides: { tooltip: { background: "rgba(20,22,40,0.95)", border: BORDER, fontSize: 12 } } },
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    variants: [
                        {
                            props: { variant: "contained", color: "primary" },
                            style: {
                                background: "linear-gradient(90deg, #0027ac 0%, #3b5bff 100%)",
                                "&:hover": { background: "linear-gradient(90deg, #0a33c4 0%, #5573ff 100%)" },
                                "&.Mui-disabled": { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" },
                            },
                        },
                        {
                            props: { variant: "outlined" },
                            style: { borderColor: "rgba(227,233,248,0.24)", "&:hover": { borderColor: "rgba(227,233,248,0.5)" } },
                        },
                    ],
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    background: "rgba(255,255,255,0.03)",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.12)" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.28)" },
                },
            },
        },
        MuiTabs: { styleOverrides: { indicator: { height: 3, borderRadius: 3 } } },
        MuiTab: { styleOverrides: { root: { textTransform: "none", fontWeight: 600, minHeight: 44 } } },
        MuiTableCell: { styleOverrides: { root: { borderColor: "rgba(255,255,255,0.06)" }, head: { color: "#A3A8BD", fontWeight: 600 } } },
        MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
        MuiAccordion: {
            styleOverrides: {
                root: {
                    background: "rgba(9,9,21,0.44)",
                    border: BORDER,
                    borderRadius: "16px !important",
                    "&::before": { display: "none" },
                    "&.Mui-expanded": { margin: 0 },
                },
            },
        },
    },
});

/** Wraps every course-management page: dark theme + toast host. */
export default function CourseAdminThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider theme={courseAdminTheme}>
            {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    style: { background: "#141628", color: "#F5F6FA", border: BORDER, fontSize: 14 },
                    success: { iconTheme: { primary: "#22C55E", secondary: "#141628" } },
                    error: { iconTheme: { primary: "#F87171", secondary: "#141628" } },
                }}
            />
        </ThemeProvider>
    );
}
