"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, GlobalStyles, Link, Typography } from "@mui/material";
import ExamDetailShell from "@/components/exams/ExamDetailShell";
import CertificateDocument, { CERTIFICATE_ELEMENT_ID } from "@/components/exams/CertificateDocument";
import { examAsset, examDetailPath, findExam, formatLongDate, EXAMS_PATH, type ExamCertificate } from "@/components/exams/exam-data";
import { EXAM_COLORS, OutlineButton, TealPill, glassCardSx } from "@/components/exams/exam-ui";
import { PrimaryButton } from "@/components/courses/my-courses-ui";
import { COLORS, TYPE } from "@/components/courses/my-courses-theme";

const sideCardSx = (angle: string) => ({
    ...glassCardSx({ angle, radius: 24, innerShadow: "inset 0px 3px 6px 0px rgba(255,255,255,0.16)" }),
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
    p: "24px",
    width: "100%",
});

const sectionLabelSx = { ...TYPE.mediumMed16, color: COLORS.neutral300 };

/** Only the certificate is printed (and saved, when the user picks "Save as PDF"). */
const printStyles = (
    <GlobalStyles
        styles={{
            "@media print": {
                "@page": { size: "landscape", margin: 0 },
                "body *": { visibility: "hidden" },
                [`#${CERTIFICATE_ELEMENT_ID}, #${CERTIFICATE_ELEMENT_ID} *`]: { visibility: "visible" },
                [`#${CERTIFICATE_ELEMENT_ID}`]: {
                    position: "fixed",
                    left: 0,
                    top: 0,
                    transform: "none !important",
                    printColorAdjust: "exact",
                    WebkitPrintColorAdjust: "exact",
                },
            },
        }}
    />
);

function linkedInAddUrl(certificate: ExamCertificate) {
    const [year, month] = certificate.issueDate.split("-");
    const [expYear, expMonth] = certificate.validThrough.split("-");
    const params = new URLSearchParams({
        startTask: "CERTIFICATION_NAME",
        name: certificate.courseName,
        organizationName: "Connecting Cyber Networks",
        issueYear: year,
        issueMonth: String(Number(month)),
        expirationYear: expYear,
        expirationMonth: String(Number(expMonth)),
        certId: certificate.certificateId,
        certUrl: `https://${certificate.verifyHost}`,
    });
    return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

function printCertificate(fileName: string) {
    const previous = document.title;
    // Browsers use the document title as the default PDF file name.
    document.title = fileName;
    window.print();
    document.title = previous;
}

export default function ExamCertificatePage() {
    const router = useRouter();
    const params = useParams();
    const exam = findExam(params?.exam_id as string | undefined);
    const certificate = exam?.certificate;

    const back = () => router.push(exam ? examDetailPath(exam.examId) : EXAMS_PATH);

    if (!exam || !certificate) {
        return (
            <ExamDetailShell title={exam?.courseName ?? "Certificate"} onBack={back} decor="certificate">
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", py: 8, textAlign: "center" }}>
                    <Typography sx={{ ...TYPE.headingSemibold20, color: COLORS.white }}>Certificate not available yet</Typography>
                    <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral300 }}>Clear every round of this exam to unlock your certificate.</Typography>
                </Box>
            </ExamDetailShell>
        );
    }

    const details: [string, string][] = [
        ["Candidate", certificate.candidate],
        ["Course", certificate.courseShort],
        ["Certificate ID", certificate.certificateId],
        ["Issue Date", formatLongDate(certificate.issueDate)],
        ["Valid Through", formatLongDate(certificate.validThrough)],
    ];

    return (
        <ExamDetailShell title={exam.courseName} onBack={back} decor="certificate">
            {printStyles}
            <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, alignItems: "flex-start", gap: "32px" }}>
                <Box sx={{ flex: { lg: "0 1 661px" }, width: "100%", minWidth: 0 }}>
                    <CertificateDocument certificate={certificate} />
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: "32px", width: { xs: "100%", lg: 500 }, maxWidth: { xs: 661, lg: 500 }, flexShrink: 0 }}>
                    <Box sx={sideCardSx("171.908deg")}>
                        <Typography component="h2" sx={{ position: "relative", ...sectionLabelSx }}>
                            VERIFICATION
                        </Typography>
                        <Box sx={{ position: "relative", display: "flex" }}>
                            <TealPill label="Verified - Authentic" angle="99.243deg" />
                        </Box>
                        <Typography sx={{ position: "relative", ...TYPE.mediumMed16, color: COLORS.white, whiteSpace: "pre-wrap" }}>
                            {"Anyone can verify  this credential using "}
                            <Link href={`https://${certificate.verifyHost}`} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ color: EXAM_COLORS.link }}>
                                {certificate.verifyHost}
                            </Link>
                            {" using the certificate ID or QR Code"}
                        </Typography>
                    </Box>

                    <Box sx={sideCardSx("167.248deg")}>
                        <Typography component="h2" sx={{ position: "relative", ...sectionLabelSx }}>
                            DETAILS
                        </Typography>
                        {details.map(([label, value]) => (
                            <Box key={label} sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                                <Typography sx={{ ...TYPE.mediumMed16, color: COLORS.neutral200, whiteSpace: "nowrap" }}>{label}</Typography>
                                <Typography sx={{ ...TYPE.mediumMed16, color: COLORS.white, textAlign: "right", overflowWrap: "anywhere" }}>{value}</Typography>
                            </Box>
                        ))}
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <PrimaryButton icon={examAsset("icon-download-alt.svg")} onClick={() => printCertificate(certificate.certificateId)} sx={{ width: "100%" }}>
                            Download PDF
                        </PrimaryButton>
                        <OutlineButton icon="icon-download-alt.svg" stroke="2px" strokeColor={EXAM_COLORS.softStroke} onClick={() => printCertificate(certificate.certificateId)} sx={{ width: "100%" }}>
                            Print Certificate
                        </OutlineButton>
                        <OutlineButton
                            stroke="2px"
                            strokeColor={EXAM_COLORS.softStroke}
                            onClick={() => window.open(linkedInAddUrl(certificate), "_blank", "noopener,noreferrer")}
                            sx={{ width: "100%" }}
                        >
                            Share on LinkedIn
                        </OutlineButton>
                    </Box>
                </Box>
            </Box>
        </ExamDetailShell>
    );
}
