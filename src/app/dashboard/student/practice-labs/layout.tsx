"use client";

import React from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Box, ButtonBase, Typography } from "@mui/material";
import StudentLayout from "@/layouts/StudentLayout";
import StudentHeader from "@/layouts/StudentHeader";
import { findPracticeLab, labAsset } from "@/components/practice-labs/lab-data";
import { FONT_POPPINS } from "@/components/aish/tokens";

export default function PracticeLabsLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const params = useParams();
    const labId = params?.practice_lab_id as string | undefined;
    const lab = labId ? findPracticeLab(labId) : undefined;

    const header = labId ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: "12px", sm: "16px" }, minWidth: 0 }}>
            <ButtonBase
                aria-label="Back to practice labs"
                onClick={() => router.push("/dashboard/student/practice-labs")}
                sx={{
                    width: { xs: 36, sm: 44 },
                    height: { xs: 36, sm: 44 },
                    flexShrink: 0,
                    borderRadius: "50px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backgroundImage: "linear-gradient(180deg, rgba(227,233,248,0.08) 0%, rgba(134,137,146,0.04) 100%)",
                    backdropFilter: "blur(25px)",
                    transition: "border-color .15s ease",
                    "&:hover": { borderColor: "rgba(255,255,255,0.24)" },
                }}
            >
                <Image src={labAsset("icon-arrow-back.svg")} alt="" width={24} height={24} />
            </ButtonBase>
            <Typography
                noWrap
                component="h1"
                sx={{
                    fontFamily: FONT_POPPINS,
                    fontWeight: 500,
                    fontSize: { xs: "16px", sm: "20px" },
                    lineHeight: { xs: "24px", sm: "30px" },
                    color: "#FFFFFF",
                }}
            >
                {lab?.title ?? "Practice Lab"}
            </Typography>
        </Box>
    ) : (
        <StudentHeader title="Practice Labs" />
    );

    return <StudentLayout header={header}>{children}</StudentLayout>;
}
