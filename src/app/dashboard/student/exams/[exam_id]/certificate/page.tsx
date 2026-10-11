"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, GlobalStyles, Link, Typography } from "@mui/material";
import ExamDetailShell from "@/components/exams/ExamDetailShell";
import CertificateDocument, { CERTIFICATE_ELEMENT_ID } from "@/components/exams/CertificateDocument";
import { examAsset, examDetailPath, formatLongDate, type ExamCertificate } from "@/components/exams/exam-data";
import { EXAM_COLORS, OutlineButton, RequestStatusPill, TealPill, glassCardSx } from "@/components/exams/exam-ui";
import { PrimaryButton, SkeletonBlock } from "@/components/courses/my-courses-ui";
import { useExam } from "@/contexts/ExamContext";
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
    const params = new URLSearchParams({
        startTask: "CERTIFICATION_NAME",
        name: certificate.courseName,
        organizationName: "Connecting Cyber Networks",
        issueYear: year,
        issueMonth: String(Number(month)),
        certId: certificate.certificateId,
        certUrl: `https://${certificate.verifyHost}`,
    });
    if (certificate.validThrough) {
        const [expYear, expMonth] = certificate.validThrough.split("-");
        params.set("expirationYear", expYear);
        params.set("expirationMonth", String(Number(expMonth)));
    }
    return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

/** Valid-through dates are calendar days: the certificate is valid for the whole of that day. */
const isExpired = (validThrough: string | null) => Boolean(validThrough && validThrough < new Date().toISOString().slice(0, 10));

function printCertificate(fileName: string) {
    const previous = document.title;
    // Browsers use the document title as the default PDF file name.
    document.title = fileName;
    window.print();
    document.title = previous;
}

export default function ExamCertificatePage() {
    const router = useRouter();
    const params = useParams<{ exam_id: string }>();
    const examKey = params?.exam_id ?? "";
    const { examCertificate, examDetail, getExamCertificate, getStudentExam } = useExam();
    const [error, setError] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!examKey) return;
        getExamCertificate(examKey).then((res) => {
            setError(res.success ? null : (res.message ?? "Certificate not available yet"));
            setLoaded(true);
        });
    }, [examKey, getExamCertificate]);

    const exam = examDetail && [examDetail.examId, examDetail.courseId, examDetail.slug].includes(examKey) ? examDetail : null;
    useEffect(() => {
        if (!exam && examKey) getStudentExam(examKey);
    }, [exam, examKey, getStudentExam]);

    const certificate = loaded && !error ? examCertificate : null;
    const back = () => router.push(examDetailPath(examKey));
    const title = exam?.courseName ?? certificate?.courseName ?? "Certificate";

    if (!certificate) {
        return (
            <ExamDetailShell title={title} onBack={back} decor="certificate">
                {!loaded ? (
                    <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: "32px" }}>
                        <SkeletonBlock height={540} radius={8} sx={{ flex: { lg: "0 1 661px" }, width: "100%" }} />
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "32px", width: { xs: "100%", lg: 500 } }}>
                            <SkeletonBlock height={180} radius={24} />
                            <SkeletonBlock height={280} radius={24} />
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", py: 8, textAlign: "center" }}>
                        <Typography sx={{ ...TYPE.headingSemibold20, color: COLORS.white }}>Certificate not available yet</Typography>
                        <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral300 }}>Clear every round of this exam to unlock your certificate.</Typography>
                    </Box>
                )}
            </ExamDetailShell>
        );
    }

    const expired = isExpired(certificate.validThrough);
    const details: [string, string][] = [
        ["Candidate", certificate.candidate],
        ["Course", certificate.courseShort],
        ["Certificate ID", certificate.certificateId],
        ["Issue Date", formatLongDate(certificate.issueDate)],
        ["Valid Through", certificate.validThrough ? formatLongDate(certificate.validThrough) : "Lifetime"],
    ];

    return (
        <ExamDetailShell title={title} onBack={back} decor="certificate">
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
                            {expired ? <RequestStatusPill tone="re-exam" label="Expired" size="md" /> : <TealPill label="Verified - Authentic" angle="99.243deg" />}
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

