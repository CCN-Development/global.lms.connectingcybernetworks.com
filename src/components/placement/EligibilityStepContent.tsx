"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import { LmsButton } from "@/components/community/community-ui";
import { ELIGIBILITY_STEPS, PROGRESS_FOOTNOTE, PlacementEligibility, TOTAL_STEPS } from "./placement-data";
import { FeeProgressCard, TrackProgressCard } from "./ProgressCards";
import { FadeDivider, PL, PTEXT } from "./placement-ui";

const FEE_DETAILS_HREF = "/dashboard/student/profile/fee-details";

function CardList({ children }: { children: React.ReactNode }) {
    return <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>{children}</Box>;
}

export default function EligibilityStepContent({ stepIndex, data }: { stepIndex: number; data: PlacementEligibility }) {
    const router = useRouter();
    const step = ELIGIBILITY_STEPS[stepIndex];

    return (
        <Box
            component="section"
            aria-labelledby="placement-step-heading"
            sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", flex: 1, minWidth: 0, p: { xs: "8px", sm: "24px" } }}
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                <Typography sx={{ ...PTEXT.reg12, color: PL.n500, textTransform: "uppercase" }}>
                    Step {stepIndex + 1} of {TOTAL_STEPS}
                </Typography>
                <Typography id="placement-step-heading" component="h2" sx={{ ...PTEXT.poppinsSemi24, color: PL.white }}>
                    {step.heading}
                </Typography>
                <Typography sx={{ ...PTEXT.med16, color: PL.n200 }}>{step.description}</Typography>
            </Box>

            <FadeDivider />

            {step.id === "course" && (
                <>
                    <Typography sx={{ ...PTEXT.reg14, color: PL.n500, width: "100%" }}>YOUR ENROLLED COURSES :</Typography>
                    <CardList>
                        {data.courses.map((course) => (
                            <TrackProgressCard key={course.id} track={course} />
                        ))}
                    </CardList>
                </>
            )}

            {step.id === "hr" && (
                <CardList>
                    <TrackProgressCard track={data.softSkill} />
                </CardList>
            )}

            {step.id === "fees" && (
                <>
                    <CardList>
                        <FeeProgressCard fees={data.fees} />
                    </CardList>
                    <LmsButton glowLine={false} onClick={() => router.push(FEE_DETAILS_HREF)} sx={{ width: 155 }}>
                        Pay Now
                    </LmsButton>
                </>
            )}

            <Typography sx={{ ...PTEXT.medItalic12, color: PL.n600, textAlign: "center" }}>{PROGRESS_FOOTNOTE}</Typography>
        </Box>
    );
}
