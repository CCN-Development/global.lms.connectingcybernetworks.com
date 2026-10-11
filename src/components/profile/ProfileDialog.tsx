"use client";

import React, { useState } from "react";
import { Box, ButtonBase, Dialog, InputBase, Typography } from "@mui/material";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { PC, profileAsset } from "./profile-data";
import { GlassIconButton, PT, strokeLayer } from "./profile-ui";

/** Black glass dialog with the diagonal blue glow used by every "My Profile" modal. */
export function ProfileDialog({
    open,
    onClose,
    title,
    subtitle,
    onEntered,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    subtitle?: React.ReactNode;
    onEntered?: () => void;
    children: React.ReactNode;
}) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{
                transition: { onEntered },
                backdrop: { sx: { bgcolor: "rgba(64,64,64,0.24)", backdropFilter: "blur(12px)" } },
                paper: {
                    sx: {
                        position: "relative",
                        isolation: "isolate",
                        width: 604,
                        maxWidth: "calc(100% - 32px)",
                        m: "16px",
                        p: { xs: "20px", sm: "32px" },
                        display: "flex",
                        flexDirection: "column",
                        gap: { xs: "24px", sm: "32px" },
                        borderRadius: "24px",
                        bgcolor: "#000",
                        backgroundImage: "none",
                        backdropFilter: "blur(50px)",
                        overflow: "hidden",
                        "&::before": strokeLayer("linear-gradient(222deg, #508AF2 0%, rgba(80,138,242,0) 48%)", "1.5px"),
                    },
                },
            }}
        >
            {/* Diagonal blue glow (Figma "Ellipse 697"). */}
            <Box aria-hidden sx={{ position: "absolute", left: -139.88, top: -282.5, width: 977.88, height: 1140.28, zIndex: -1, pointerEvents: "none" }}>
                <Box sx={{ position: "absolute", left: "50%", top: "50%", width: 69.794, height: 1433.31, transform: "translate(-50%, -50%) rotate(-40.17deg)" }}>
                    <Box component="img" src={profileAsset("modal-glow.svg")} alt="" sx={{ position: "absolute", left: -100, top: -100, width: 269.794, height: 1633.31, maxWidth: "none" }} />
                </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: "4px" }}>
                <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Typography component="h2" sx={{ ...PT.poppinsSemi24, color: PC.white, fontSize: { xs: "20px", sm: "24px" } }}>
                        {title}
                    </Typography>
                    {subtitle && <Typography sx={{ ...PT.interMed14, color: PC.n300 }}>{subtitle}</Typography>}
                </Box>
                <GlassIconButton icon="icon-x.svg" label="Close" onClick={onClose} />
            </Box>
            {children}
        </Dialog>
    );
}

export function DialogDivider() {
    return <Box component="img" src={profileAsset("modal-divider.svg")} alt="" aria-hidden sx={{ display: "block", width: "100%", height: "1px" }} />;
}

export function FormError({ children }: { children: React.ReactNode }) {
    if (!children) return null;
    return (
        <Typography role="alert" sx={{ ...PT.med14, color: PC.error500 }}>
            {children}
        </Typography>
    );
}

/** Dark outlined text input matching the OTP boxes. */
export function ProfileInput({
    label,
    value,
    onChange,
    type = "text",
    autoComplete,
    placeholder,
    inputMode,
    autoFocus,
    disabled,
    startAdornment,
    maxLength,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: "text" | "password" | "tel";
    autoComplete?: string;
    placeholder?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
    autoFocus?: boolean;
    disabled?: boolean;
    startAdornment?: React.ReactNode;
    maxLength?: number;
}) {
    const [visible, setVisible] = useState(false);
    const isPassword = type === "password";
    return (
        <Box component="label" sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Typography component="span" sx={{ ...PT.med14, color: PC.n200 }}>
                {label}
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    height: 52,
                    px: "16px",
                    borderRadius: "12px",
                    border: `1px solid ${PC.n600}`,
                    transition: "border-color .15s ease",
                    "&:focus-within": { borderColor: PC.primary300 },
                }}
            >
                {startAdornment}
                <InputBase
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    type={isPassword && !visible ? "password" : isPassword ? "text" : type}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    disabled={disabled}
                    inputProps={{ inputMode, maxLength, "aria-label": label }}
                    sx={{
                        flex: 1,
                        ...PT.med16,
                        color: PC.n50,
                        "& input::placeholder": { color: PC.n500, opacity: 1 },
                        "& input": { caretColor: PC.primary300 },
                    }}
                />
                {isPassword && (
                    <ButtonBase
                        onClick={() => setVisible((v) => !v)}
                        aria-label={visible ? "Hide password" : "Show password"}
                        sx={{ color: PC.n300, borderRadius: "6px", p: "4px", "&:hover": { color: PC.n100 } }}
                    >
                        {visible ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                    </ButtonBase>
                )}
            </Box>
        </Box>
    );
}
