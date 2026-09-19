"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import { MdArrowBack } from "react-icons/md";
import StudentLayout from "@/layouts/StudentLayout";
import StudentHeader from "@/layouts/StudentHeader";
import { findPracticeLab } from "@/components/practice-labs/lab-data";

export default function PracticeLabsLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const params = useParams();
    const labId = params?.practice_lab_id as string | undefined;
    const lab = labId ? findPracticeLab(labId) : undefined;

    const header = labId ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
            <Box
                onClick={() => router.push("/dashboard/student/practice-labs")}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 30,
                    height: 30,
                    flexShrink: 0,
                    borderRadius: "50%",
                    cursor: "pointer",
                    border: "1px solid #2b2b38",
                    color: "#b4b4c2",
                    "&:hover": { color: "#fff", borderColor: "#7c3aed" },
                }}
            >
                <MdArrowBack size={16} />
            </Box>
            <Typography noWrap sx={{ fontSize: "1rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>
                {lab?.title ?? "Practice Lab"}
            </Typography>
        </Box>
    ) : (
        <StudentHeader title="Practice Labs" />
    );

    return <StudentLayout header={header}>{children}</StudentLayout>;
}
