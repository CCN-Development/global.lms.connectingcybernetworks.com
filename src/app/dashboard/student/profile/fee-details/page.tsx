"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import toast from "react-hot-toast";
import CreateRequestModal from "@/components/requests/CreateRequestModal";
import { useStudent, type FeeDueBundle } from "@/contexts/StudentContext";
import { formatINR } from "@/components/profile/profile-data";
import { GlassCard } from "@/components/profile/profile-ui";
import { EmptyNote, ProfileError, ProfileLoading } from "@/components/profile/ProfileStates";
import {
    AcademicDocumentsCard,
    FeeHelpCard,
    FeeSummaryCard,
    InstallmentTimelineCard,
    ProgramsCard,
    SingleProgramCard,
    buildFeeSummaryView,
} from "@/components/profile/FeesSections";

export default function FeeDetailsPage() {
    const { fees, loadingFees, getFees } = useStudent();
    const [error, setError] = useState<string | null>(null);
    const [helpOpen, setHelpOpen] = useState(false);

    const load = useCallback(async () => {
        setError(null);
        const res = await getFees();
        if (!res.success) setError(res.message ?? "Failed to load fee details");
    }, [getFees]);

    // Late fees grow daily, so always refresh on visit.
    useEffect(() => {
        void load();
    }, [load]);

    const summary = useMemo(() => (fees ? buildFeeSummaryView(fees) : null), [fees]);

    if (!fees || !summary) {
        if (error && !loadingFees) return <ProfileError message={error} onRetry={load} />;
        return <ProfileLoading columns="minmax(0, 709fr) minmax(0, 659fr)" cards={[3, 2]} />;
    }

    const [primary] = fees.programs;
    const rm = (fees.summary.nextDue && fees.programs.find((p) => p.purchaseId === fees.summary.nextDue?.purchaseId)?.rm) || primary?.rm || null;

    // The payment gateway is wired in a later phase; the bundles already carry the schedule ids and amounts to charge.
    const startPayment = (bundle: FeeDueBundle | null) => {
        if (!bundle) return;
        toast(`Online payment of ${formatINR(bundle.totalPayable)} will be available soon. Please contact your RM to pay.`, { icon: "💳" });
    };

    return (
        <>
            <Box
                sx={{
                    mt: { md: "8px" },
                    display: "grid",
                    gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 709fr) minmax(0, 659fr)" },
                    alignItems: "start",
                    gap: "24px",
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
                    {fees.programs.length === 0 ? (
                        <GlassCard>
                            <EmptyNote>You have not enrolled in a program yet.</EmptyNote>
                        </GlassCard>
                    ) : fees.programs.length > 1 ? (
                        <ProgramsCard programs={fees.programs} />
                    ) : (
                        <SingleProgramCard program={primary} />
                    )}
                    <AcademicDocumentsCard documents={fees.documents} />
                    <FeeHelpCard rmName={rm?.name ?? null} onContact={() => setHelpOpen(true)} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
                    <FeeSummaryCard
                        summary={summary}
                        onPayNow={() => startPayment(fees.summary.payNow)}
                        onPayAllDues={() => startPayment(fees.summary.dueThisMonth)}
                    />
                    <InstallmentTimelineCard
                        key={fees.generatedAt}
                        fees={fees}
                        onReceipt={() => toast("Payment receipts will be available for download soon.", { icon: "🧾" })}
                    />
                </Box>
            </Box>
            <CreateRequestModal
                open={helpOpen}
                onClose={() => setHelpOpen(false)}
                onCreated={() => setHelpOpen(false)}
                defaultCategory="Fee Query"
            />
        </>
    );
}
