"use client";

import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { LmsButton } from "@/components/community/community-ui";
import { useStudent } from "@/contexts/StudentContext";
import { PC } from "./profile-data";
import { PT } from "./profile-ui";
import { DialogDivider, FormError, ProfileDialog, ProfileInput } from "./ProfileDialog";

/** Same rules the API enforces (student.controller validateNewPassword). */
const RULES: { label: string; test: (value: string) => boolean }[] = [
    { label: "At least 8 characters", test: (v) => v.length >= 8 && v.length <= 64 },
    { label: "A letter and a number", test: (v) => /[A-Za-z]/.test(v) && /\d/.test(v) },
    { label: "No spaces", test: (v) => v.length > 0 && !/\s/.test(v) },
];

export default function ChangePasswordModal({ open, hasPassword, onClose }: { open: boolean; hasPassword: boolean; onClose: () => void }) {
    const { changePassword } = useStudent();
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reset = () => {
        setCurrent("");
        setNext("");
        setConfirm("");
        setError(null);
    };

    const handleClose = () => {
        if (saving) return;
        reset();
        onClose();
    };

    const rulesMet = RULES.every((rule) => rule.test(next));
    const canSubmit = (!hasPassword || current.length > 0) && rulesMet && confirm.length > 0 && !saving;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!canSubmit) return;
        if (next !== confirm) {
            setError("New password and confirmation do not match");
            return;
        }
        setSaving(true);
        setError(null);
        const res = await changePassword({ ...(hasPassword ? { currentPassword: current } : {}), newPassword: next });
        setSaving(false);
        if (!res.success) {
            setError(res.message ?? "Failed to update password");
            return;
        }
        toast.success(res.message ?? "Password updated");
        reset();
        onClose();
    };

    return (
        <ProfileDialog
            open={open}
            onClose={handleClose}
            title={hasPassword ? "Change Password" : "Set Password"}
            subtitle={hasPassword ? "Enter your current password and choose a new one." : "Set a password to sign in without an OTP."}
        >
            <DialogDivider />
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {hasPassword && (
                    <ProfileInput label="Current Password" type="password" autoComplete="current-password" value={current} onChange={setCurrent} autoFocus />
                )}
                <ProfileInput label="New Password" type="password" autoComplete="new-password" value={next} onChange={setNext} autoFocus={!hasPassword} maxLength={64} />
                <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none", display: "flex", flexWrap: "wrap", columnGap: "20px", rowGap: "6px", mt: "-8px" }}>
                    {RULES.map((rule) => {
                        const ok = rule.test(next);
                        return (
                            <Typography key={rule.label} component="li" sx={{ ...PT.reg12, color: ok ? PC.success300 : PC.n400 }}>
                                {ok ? "✓" : "•"} {rule.label}
                            </Typography>
                        );
                    })}
                </Box>
                <ProfileInput label="Confirm New Password" type="password" autoComplete="new-password" value={confirm} onChange={setConfirm} maxLength={64} />
                <FormError>{error}</FormError>
                <LmsButton type="submit" disabled={!canSubmit} sx={{ width: "100%" }}>
                    {saving ? "Saving…" : hasPassword ? "Update Password" : "Set Password"}
                </LmsButton>
            </Box>
        </ProfileDialog>
    );
}
