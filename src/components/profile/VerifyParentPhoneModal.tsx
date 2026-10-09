"use client";

import React, { useEffect, useRef, useState } from "react";
import { Box, ButtonBase, Dialog, Typography } from "@mui/material";
import { PC, profileAsset } from "./profile-data";
import { GlassIconButton, PIcon, PT, strokeLayer } from "./profile-ui";
import { LmsButton } from "@/components/community/community-ui";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 11;

interface VerifyParentPhoneModalProps {
    open: boolean;
    phone: string;
    onClose: () => void;
    onVerified: () => void;
}

export default function VerifyParentPhoneModal({ open, phone, onClose, onVerified }: VerifyParentPhoneModalProps) {
    const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
    const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
    const inputs = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
        if (!open || secondsLeft <= 0) return;
        const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
        return () => window.clearTimeout(timer);
    }, [open, secondsLeft]);

    const reset = () => {
        setDigits(Array(OTP_LENGTH).fill(""));
        setSecondsLeft(RESEND_SECONDS);
    };

    const handleClose = () => {
        onClose();
        reset();
    };

    const focusBox = (index: number) => inputs.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))]?.focus();

    const fill = (start: number, value: string) => {
        const chars = value.replace(/\D/g, "").slice(0, OTP_LENGTH - start).split("");
        if (!chars.length) return;
        setDigits((prev) => {
            const next = [...prev];
            chars.forEach((c, i) => (next[start + i] = c));
            return next;
        });
        focusBox(start + chars.length);
    };

    const handleKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            e.preventDefault();
            setDigits((prev) => prev.map((d, i) => (i === index - 1 ? "" : d)));
            focusBox(index - 1);
        } else if (e.key === "ArrowLeft") {
            focusBox(index - 1);
        } else if (e.key === "ArrowRight") {
            focusBox(index + 1);
        }
    };

    const complete = digits.every(Boolean);

    const handleVerify = () => {
        if (!complete) return;
        onVerified();
        reset();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            slotProps={{
                transition: { onEntered: () => focusBox(0) },
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

            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: "4px" }}>
                    <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                        <Typography component="h2" sx={{ ...PT.poppinsSemi24, color: PC.white, fontSize: { xs: "20px", sm: "24px" } }}>
                            Verify Parents Phone Number
                        </Typography>
                        <Typography sx={{ ...PT.interMed14, color: PC.n300 }}>Enter the 4-digit code sent to your parent number.</Typography>
                    </Box>
                    <GlassIconButton icon="icon-x.svg" label="Close" onClick={handleClose} />
                </Box>
                <Box sx={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "10px", px: "12px", py: "4px", borderRadius: "99px", bgcolor: PC.n50 }}>
                    <Typography sx={{ ...PT.med16, color: PC.n800, whiteSpace: "nowrap" }}>{phone}</Typography>
                    <ButtonBase onClick={handleClose} sx={{ display: "flex", alignItems: "center", gap: "8px", borderRadius: "4px" }}>
                        <Typography component="span" sx={{ ...PT.med16, color: PC.n800, textDecoration: "underline" }}>
                            Edit
                        </Typography>
                        <PIcon name="icon-edit-dark.svg" size={16} />
                    </ButtonBase>
                </Box>
            </Box>

            <Box component="img" src={profileAsset("modal-divider.svg")} alt="" aria-hidden sx={{ display: "block", width: "100%", height: "1px" }} />

            <Box sx={{ display: "flex", gap: { xs: "8px", sm: "12px" } }}>
                {digits.map((digit, index) => (
                    <Box
                        key={index}
                        component="input"
                        ref={(el: HTMLInputElement | null) => {
                            inputs.current[index] = el;
                        }}
                        value={digit}
                        inputMode="numeric"
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        aria-label={`Digit ${index + 1}`}
                        maxLength={1}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value;
                            if (!value) setDigits((prev) => prev.map((d, i) => (i === index ? "" : d)));
                            else fill(index, value.slice(-1));
                        }}
                        onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
                            e.preventDefault();
                            fill(index, e.clipboardData.getData("text"));
                        }}
                        onKeyDown={handleKeyDown(index)}
                        sx={{
                            flex: "1 1 0",
                            minWidth: 0,
                            height: 62,
                            px: { xs: "8px", sm: "18px" },
                            borderRadius: "12px",
                            border: `1px solid ${PC.n200}`,
                            bgcolor: "transparent",
                            color: PC.n50,
                            textAlign: "center",
                            ...PT.poppinsMed20,
                            outline: "none",
                            caretColor: PC.primary300,
                            transition: "border-color .15s ease",
                            "&:focus": { borderColor: PC.primary300 },
                        }}
                    />
                ))}
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", py: "8px" }}>
                <LmsButton onClick={handleVerify} disabled={!complete} sx={{ width: "100%" }}>
                    Verify
                </LmsButton>
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "8px", minHeight: 44, px: "24px" }}>
                    <Typography sx={{ ...PT.med14, color: PC.n50 }}>Didn’t get the OTP?</Typography>
                    {secondsLeft > 0 ? (
                        <Typography sx={{ ...PT.med14, color: PC.primary300 }}>Resend code in {secondsLeft}s</Typography>
                    ) : (
                        <ButtonBase onClick={reset} sx={{ ...PT.med14, color: PC.primary300, borderRadius: "4px", "&:hover": { textDecoration: "underline" } }}>
                            Resend code
                        </ButtonBase>
                    )}
                </Box>
            </Box>
        </Dialog>
    );
}
