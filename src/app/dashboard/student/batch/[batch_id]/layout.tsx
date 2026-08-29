"use client";
import React from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import StudentLayout from "@/layouts/StudentLayout";
import { Box, Typography } from "@mui/material";
import { MdArrowBack } from "react-icons/md";
import { useStudent } from "@/contexts/StudentContext";
import CCNTabs from "@/components/CCNTabs";

export default function BatchDetailLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const batchId = params?.batch_id as string;
    const isAssignments = pathname.includes("/assignments");
    const { batchDetail } = useStudent();
    const batch = batchDetail?.batchId === batchId ? batchDetail : null;
    const title = batch ? batch.course?.courseName ?? batch.batchName : "Batch Details";
    const showTabs = Boolean(batch?.isEnrolled);

    const TABS = [
        { label: "Batch Details", href: `/dashboard/student/batch/${batchId}` },
        { label: "Tasks & Assignments", href: `/dashboard/student/batch/${batchId}/assignments` },
    ];

    return (
        <StudentLayout
            header={
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 1 }}>
                    {/* Left: back arrow + batch title */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                        <Typography
                            noWrap
                            sx={{ fontSize: "1rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}
                        >
                            {title}
                        </Typography>
                    </Box>

                    {/* Right: tab pills */}
                    {showTabs && (
                        <CCNTabs
                            className="shrink-0"
                            tabs={TABS}
                            value={isAssignments ? TABS[1].href : TABS[0].href}
                            onChange={({ href }) => href && router.push(href)}
                        />
                    )}
                </Box>
            }
        >
            {children}
        </StudentLayout>
    );
}
