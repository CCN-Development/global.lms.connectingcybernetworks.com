"use client";

import React, { useState } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { ConfirmModal } from "./JobModals";
import { MatchScorePill } from "./JobDetail";
import { Application, isClosed } from "./jobs-data";
import { usePlacement } from "./PlacementContext";
import { Asset, PL, PTEXT } from "./placement-ui";

/** Right side of the Track Application header: AI match pill + Withdraw Application. */
export function TrackHeaderActions({ application }: { application: Application }) {
    const { appendActivity, notify } = usePlacement();
    const [confirming, setConfirming] = useState(false);
    const closed = isClosed(application);

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <MatchScorePill score={application.matchScore} />
            {!closed && (
                <ButtonBase
                    onClick={() => setConfirming(true)}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        height: 44,
                        pl: "12px",
                        pr: "16px",
                        borderRadius: "8px",
                        border: "1px solid rgba(140,140,140,0.5)",
                        boxShadow: "0 4px 24px 0 rgba(0,0,0,0.16)",
                        transition: "border-color .15s ease, background-color .15s ease",
                        "&:hover": { borderColor: PL.error, bgcolor: "rgba(209,41,61,0.06)" },
                    }}
                >
                    <Asset name="icon-x-red.svg" width={20} height={20} />
                    <Typography component="span" sx={{ ...PTEXT.med14, color: PL.error, whiteSpace: "nowrap" }}>
                        Withdraw Application
                    </Typography>
                </ButtonBase>
            )}
            <ConfirmModal
                open={confirming}
                title="Withdraw application?"
                body="You will be removed from this recruitment process. This can’t be undone."
                confirmLabel="Withdraw"
                onClose={() => setConfirming(false)}
                onConfirm={() => {
                    appendActivity(application.id, {
                        type: "withdrawn",
                        note: { title: "Not interested in role", detail: "Candidate has voluntarily withdrawn from the recruitment process." },
                    });
                    setConfirming(false);
                    notify("Your application has been withdrawn.");
                }}
            />
        </Box>
    );
}
