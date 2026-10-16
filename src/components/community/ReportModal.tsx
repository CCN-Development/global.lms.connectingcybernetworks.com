"use client";

import React, { useEffect, useState } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { REPORT_REASON_LABELS, REPORT_REASONS, type ReportInput, type ReportReason } from "@/contexts/CommunityContext";
import { CC } from "./community-data";
import { CommunityModal, dropdownItemSx, LmsButton, TEXT } from "./community-ui";
import { useCommunity } from "./CommunityContext";

export type ReportTargetInput = Pick<ReportInput, "targetType" | "postId" | "replyId" | "memberId">;

export default function ReportModal({ target, onClose }: { target: ReportTargetInput | null; onClose: () => void }) {
    const { api } = useCommunity();
    const [reason, setReason] = useState<ReportReason | null>(null);
    const [details, setDetails] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!target) return;
        setReason(null);
        setDetails("");
    }, [target]);

    const submit = async () => {
        if (!target) return;
        if (!reason) return void toast.error("Pick a reason");
        setBusy(true);
        const res = await api.reportContent({ ...target, reason, details: details.trim() || null });
        setBusy(false);
        if (!res.success) return void toast.error(res.message ?? "Couldn't send the report");
        toast.success(res.message ?? "Thanks — our moderators will review this");
        onClose();
    };

    return (
        <CommunityModal open={Boolean(target)} onClose={busy ? () => undefined : onClose} title={target?.targetType === "reply" ? "Report reply" : "Report discussion"} width={500}>
            <Box role="radiogroup" aria-label="Reason" sx={{ display: "flex", flexDirection: "column", borderRadius: "9px", overflow: "hidden", bgcolor: CC.dropdownBg }}>
                {REPORT_REASONS.map((r) => {
                    const on = reason === r;
                    return (
                        <ButtonBase
                            key={r}
                            role="radio"
                            aria-checked={on}
                            onClick={() => setReason(r)}
                            sx={{ ...dropdownItemSx(on), display: "flex", justifyContent: "flex-start", width: "100%", textAlign: "left" }}
                        >
                            <Box
                                aria-hidden
                                sx={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: "99px",
                                    border: `1.5px solid ${on ? CC.primary200 : CC.n500}`,
                                    bgcolor: on ? CC.primary500 : "transparent",
                                    flexShrink: 0,
                                }}
                            />
                            {REPORT_REASON_LABELS[r]}
                        </ButtonBase>
                    );
                })}
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Typography sx={{ ...TEXT.reg14, color: CC.n300 }}>Anything else we should know? (optional)</Typography>
                <Box
                    component="textarea"
                    value={details}
                    maxLength={1000}
                    rows={3}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDetails(e.target.value)}
                    sx={{
                        resize: "vertical",
                        minHeight: 80,
                        p: "12px",
                        borderRadius: "8px",
                        border: `1px solid ${CC.n700}`,
                        bgcolor: "transparent",
                        color: CC.white,
                        ...TEXT.med14,
                        outline: "none",
                        "&:focus": { borderColor: CC.primary200 },
                    }}
                />
            </Box>
            <LmsButton onClick={submit} disabled={busy} sx={{ width: "100%" }}>
                {busy ? "Sending…" : "Send report"}
            </LmsButton>
        </CommunityModal>
    );
}
