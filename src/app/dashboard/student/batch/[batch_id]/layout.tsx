"use client";
import React, { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import StudentLayout from "@/layouts/StudentLayout";
import { Box, Typography } from "@mui/material";
import { useStudent } from "@/contexts/StudentContext";
import CCNTabs from "@/components/CCNTabs";
import { BackButton } from "@/components/courses/my-courses-ui";
import { COLORS, TYPE } from "@/components/courses/my-courses-theme";
import { BatchHeaderTitleContext } from "@/components/batches/batch-header-context";

const BATCHES_PATH = "/dashboard/student/batches";

export default function BatchDetailLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const batchId = params?.batch_id as string;
    const { batchDetail, getBatchDetails } = useStudent();
    const [titleOverride, setTitleOverride] = useState<string | null>(null);

    // Loaded here so every tab (details, assignments, attendance) gets the title and tab bar.
    useEffect(() => {
        if (batchId) getBatchDetails(batchId);
    }, [batchId, getBatchDetails]);

    const base = `/dashboard/student/batch/${batchId}`;
    const isAssignmentDetail = pathname.startsWith(`${base}/assignments/`);

    const batch = batchDetail?.batchId === batchId ? batchDetail : null;
    const batchTitle = batch ? batch.course?.courseName ?? batch.batchName : "Batch Details";
    const title = isAssignmentDetail ? titleOverride ?? "" : batchTitle;
    const showTabs = Boolean(batch?.isEnrolled) && !isAssignmentDetail;

    const TABS = [
        { label: "Batch Details", href: base },
        { label: "Tasks & Assignments", href: `${base}/assignments` },
        { label: "My Attendance", href: `${base}/attendance` },
    ];
    const activeTab = TABS.slice(1).find(({ href }) => pathname.startsWith(href)) ?? TABS[0];

    const goBack = () => {
        if (isAssignmentDetail) router.push(`${base}/assignments`);
        else if (window.history.length > 1) router.back();
        else router.push(BATCHES_PATH);
    };

    return (
        <StudentLayout
            header={
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: { xs: "wrap", lg: "nowrap" },
                        width: "100%",
                        gap: "16px",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
                        <BackButton label="Go back" onClick={goBack} />
                        <Typography
                            component="h1"
                            noWrap
                            sx={{ ...TYPE.headingMed20, fontSize: { xs: "18px", sm: "20px" }, color: COLORS.white, minWidth: 0 }}
                        >
                            {title}
                        </Typography>
                    </Box>

                    {showTabs && (
                        <CCNTabs
                            size="lg"
                            tabs={TABS}
                            value={activeTab.href}
                            onChange={({ href }) => href && router.push(href)}
                        />
                    )}
                </Box>
            }
        >
            <BatchHeaderTitleContext.Provider value={setTitleOverride}>{children}</BatchHeaderTitleContext.Provider>
        </StudentLayout>
    );
}
