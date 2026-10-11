"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { LmsButton } from "@/components/community/community-ui";
import { useStudent, type ParentDetails, type PhoneInput } from "@/contexts/StudentContext";
import { PC } from "./profile-data";
import { PIcon, PT } from "./profile-ui";
import { DialogDivider, FormError, ProfileDialog, ProfileInput } from "./ProfileDialog";

const DEFAULT_OTP_LENGTH = 6;
const DEFAULT_RESEND_SECONDS = 30;

interface VerifyParentPhoneModalProps {
    open: boolean;
    parent: ParentDetails | null;
    onClose: () => void;
    onVerified: (parent: ParentDetails) => void;
}

const phoneLabel = (phone: PhoneInput) => `+${phone.callingCode}-${phone.phoneNumber}`;

export default function VerifyParentPhoneModal({ open, parent, onClose, onVerified }: VerifyParentPhoneModalProps) {
    const { sendParentPhoneOtp, verifyParentPhoneOtp } = useStudent();
    const [otpLength, setOtpLength] = useState(DEFAULT_OTP_LENGTH);
    const [digits, setDigits] = useState<string[]>(() => Array(DEFAULT_OTP_LENGTH).fill(""));
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [phone, setPhone] = useState<PhoneInput>({ callingCode: "91", phoneNumber: "" });
    const [editing, setEditing] = useState(false);
    const [draftNumber, setDraftNumber] = useState("");
    const [sending, setSending] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputs = useRef<Array<HTMLInputElement | null>>([]);
    const autoSentFor = useRef<string | null>(null);

    useEffect(() => {
        if (!open || secondsLeft <= 0) return;
        const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
        return () => window.clearTimeout(timer);
    }, [open, secondsLeft]);

    const focusBox = (index: number) => inputs.current[Math.max(0, Math.min(otpLength - 1, index))]?.focus();

    const sendCode = useCallback(
        async (target: PhoneInput) => {
            if (!parent) return;
            setSending(true);
            setError(null);
            const res = await sendParentPhoneOtp(parent.parentId, target);
            setSending(false);
            if (!res.success || !res.data) {
                setError(res.message ?? "Could not send the verification code");
                return;
            }
            setPhone({ callingCode: res.data.callingCode, phoneNumber: res.data.phoneNumber });
            setOtpLength(res.data.otpLength || DEFAULT_OTP_LENGTH);
            setDigits(Array(res.data.otpLength || DEFAULT_OTP_LENGTH).fill(""));
            setSecondsLeft(res.data.resendAfterSec || DEFAULT_RESEND_SECONDS);
            setCodeSent(true);
            toast.success(`Code sent to ${phoneLabel(res.data)}`);
            window.setTimeout(() => inputs.current[0]?.focus(), 0);
        },
        [parent, sendParentPhoneOtp],
    );

    // Send the first code as soon as the dialog opens for this parent.
    useEffect(() => {
        if (!open || !parent) return;
        const initial = { callingCode: parent.parentCallingCode || "91", phoneNumber: parent.parentPhoneNumber ?? "" };
        setPhone(initial);
        setDraftNumber(initial.phoneNumber);
        setEditing(!initial.phoneNumber);
        if (initial.phoneNumber && autoSentFor.current !== parent.parentId) {
            autoSentFor.current = parent.parentId;
            void sendCode(initial);
        }
    }, [open, parent, sendCode]);

    const reset = () => {
        setDigits(Array(otpLength).fill(""));
        setSecondsLeft(0);
        setEditing(false);
        setCodeSent(false);
        setError(null);
        autoSentFor.current = null;
    };

    const handleClose = () => {
        if (verifying) return;
        onClose();
        reset();
    };

    const fill = (start: number, value: string) => {
        const chars = value.replace(/\D/g, "").slice(0, otpLength - start).split("");
        if (!chars.length) return;
        setError(null);
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
        } else if (e.key === "Enter") {
            void handleVerify();
        }
    };

    const complete = digits.length === otpLength && digits.every(Boolean);

    const handleVerify = async () => {
        if (!parent || !complete || verifying) return;
        setVerifying(true);
        setError(null);
        const res = await verifyParentPhoneOtp(parent.parentId, digits.join(""), phone);
        setVerifying(false);
        if (!res.success || !res.data) {
            setError(res.message ?? "Invalid code");
            setDigits(Array(otpLength).fill(""));
            focusBox(0);
            return;
        }
        toast.success("Parent phone number verified");
        onVerified(res.data);
        reset();
    };

    const submitNewNumber = () => {
        const number = draftNumber.replace(/\D/g, "");
        if (!number) {
            setError("Enter your parent's phone number");
            return;
        }
        setEditing(false);
        void sendCode({ callingCode: phone.callingCode, phoneNumber: number });
    };

    return (
        <ProfileDialog
            open={open}
            onClose={handleClose}
            title="Verify Parents Phone Number"
            subtitle={editing ? "Update the number and we'll send a new code." : `Enter the ${otpLength}-digit code sent to your parent number.`}
            onEntered={() => focusBox(0)}
        >
            {editing ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <ProfileInput
                        label="Parent Phone Number"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        value={draftNumber}
                        onChange={(v) => setDraftNumber(v.replace(/\D/g, "").slice(0, 15))}
                        autoFocus
                        startAdornment={<Typography sx={{ ...PT.med16, color: PC.n300 }}>+{phone.callingCode}</Typography>}
                    />
                    <FormError>{error}</FormError>
                    <Box sx={{ display: "flex", gap: "12px" }}>
                        {phone.phoneNumber && (
                            <ButtonBase
                                onClick={() => {
                                    setEditing(false);
                                    setError(null);
                                }}
                                sx={{ flex: 1, height: 44, borderRadius: "10px", border: `1px solid ${PC.n600}`, ...PT.med14, color: PC.n50 }}
                            >
                                Cancel
                            </ButtonBase>
                        )}
                        <LmsButton onClick={submitNewNumber} disabled={sending} sx={{ flex: 1 }}>
                            {sending ? "Sending…" : "Send Code"}
                        </LmsButton>
                    </Box>
                </Box>
            ) : (
                <>
                    <Box sx={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "10px", px: "12px", py: "4px", mt: { xs: "-12px", sm: "-20px" }, borderRadius: "99px", bgcolor: PC.n50 }}>
                        <Typography sx={{ ...PT.med16, color: PC.n800, whiteSpace: "nowrap" }}>{phoneLabel(phone)}</Typography>
                        <ButtonBase
                            onClick={() => {
                                setDraftNumber(phone.phoneNumber);
                                setEditing(true);
                                setError(null);
                            }}
                            disabled={verifying}
                            sx={{ display: "flex", alignItems: "center", gap: "8px", borderRadius: "4px" }}
                        >
                            <Typography component="span" sx={{ ...PT.med16, color: PC.n800, textDecoration: "underline" }}>
                                Edit
                            </Typography>
                            <PIcon name="icon-edit-dark.svg" size={16} />
                        </ButtonBase>
                    </Box>

                    <DialogDivider />

                    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
                                    disabled={!codeSent || verifying}
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
                                        border: `1px solid ${error ? PC.error500 : PC.n200}`,
                                        bgcolor: "transparent",
                                        color: PC.n50,
                                        textAlign: "center",
                                        ...PT.poppinsMed20,
                                        outline: "none",
                                        caretColor: PC.primary300,
                                        transition: "border-color .15s ease",
                                        "&:focus": { borderColor: PC.primary300 },
                                        "&:disabled": { opacity: 0.6 },
                                    }}
                                />
                            ))}
                        </Box>
                        <FormError>{error}</FormError>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", py: "8px" }}>
                        <LmsButton onClick={handleVerify} disabled={!complete || verifying} sx={{ width: "100%" }}>
                            {verifying ? "Verifying…" : "Verify"}
                        </LmsButton>
                        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "8px", minHeight: 44, px: "24px" }}>
                            <Typography sx={{ ...PT.med14, color: PC.n50 }}>Didn’t get the OTP?</Typography>
                            {sending ? (
                                <Typography sx={{ ...PT.med14, color: PC.primary300 }}>Sending code…</Typography>
                            ) : secondsLeft > 0 ? (
                                <Typography sx={{ ...PT.med14, color: PC.primary300 }}>Resend code in {secondsLeft}s</Typography>
                            ) : (
                                <ButtonBase
                                    onClick={() => void sendCode(phone)}
                                    sx={{ ...PT.med14, color: PC.primary300, borderRadius: "4px", "&:hover": { textDecoration: "underline" } }}
                                >
                                    {codeSent ? "Resend code" : "Send code"}
                                </ButtonBase>
                            )}
                        </Box>
                    </Box>
                </>
            )}
        </ProfileDialog>
    );
}
