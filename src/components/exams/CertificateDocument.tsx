"use client";

import React, { useEffect, useRef, useState } from "react";
import { Montserrat, Roboto } from "next/font/google";
import { Box } from "@mui/material";
import { examAsset, formatLongDate, type ExamCertificate } from "./exam-data";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "700"], display: "swap" });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500"], display: "swap" });

/** Native size of the Figma certificate template ("Template 1"). */
export const CERT_WIDTH = 661;
export const CERT_HEIGHT = 540;
export const CERTIFICATE_ELEMENT_ID = "exam-certificate";

const M = montserrat.style.fontFamily;
const R = roboto.style.fontFamily;

/** Scale factor that fits the fixed-size template into its container width (never upscales). */
function useFitScale(width: number) {
    const ref = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const update = () => setScale(Math.min(1, el.clientWidth / width));
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, [width]);

    return { ref, scale };
}

/** Certificate of completion, laid out 1:1 with the Figma template and scaled down to fit narrow screens. */
export default function CertificateDocument({ certificate }: { certificate: ExamCertificate }) {
    const { ref, scale } = useFitScale(CERT_WIDTH);

    return (
        <Box ref={ref} sx={{ width: "100%", maxWidth: CERT_WIDTH, height: CERT_HEIGHT * scale }}>
            <Box
                id={CERTIFICATE_ELEMENT_ID}
                role="img"
                aria-label={`Certificate of completion for ${certificate.candidate}, ${certificate.courseName}`}
                sx={{
                    position: "relative",
                    width: CERT_WIDTH,
                    height: CERT_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    overflow: "hidden",
                    bgcolor: "#FFFFFF",
                    color: "#000000",
                    boxShadow: "0px 4.942px 9.885px -7.413px rgba(0,0,0,0.12)",
                    "&::after": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        border: "0.785px solid #E3E5EB",
                        pointerEvents: "none",
                    },
                    "& p": { m: 0 },
                }}
            >
                {/* Orange dot pattern; the photo strip is painted over its top part */}
                <Box sx={{ position: "absolute", left: 0, top: 471.031, width: 137.387, height: 142.961, overflow: "hidden" }}>
                    <Box
                        component="img"
                        src={examAsset("certificate/dots.png")}
                        alt=""
                        sx={{ position: "absolute", left: 0, top: -291.031, width: 663.382, height: 435.459, maxWidth: "none", objectFit: "cover" }}
                    />
                </Box>

                {/* Left photo strip */}
                <Box sx={{ position: "absolute", left: -0.79, top: -0.79, width: 115, height: 512, overflow: "hidden", bgcolor: "#E3E5EB" }}>
                    <Box
                        component="img"
                        src={examAsset("certificate/side-photo.png")}
                        alt=""
                        sx={{ position: "absolute", left: "-302.44%", top: "-19.97%", width: "647.46%", height: "119.97%", maxWidth: "none" }}
                    />
                </Box>

                {/* Logo tile */}
                <Box
                    component="img"
                    src={examAsset("certificate/ccn-logo.png")}
                    alt="Connecting Cyber Networks"
                    sx={{ position: "absolute", left: 501.87, top: -0.79, width: 124.73, height: 124.73, display: "block" }}
                />

                <Box sx={{ position: "absolute", left: 153.08, top: 160.26, width: 288.12, fontFamily: M, fontWeight: 400, lineHeight: "normal" }}>
                    <p style={{ fontSize: 40.824, letterSpacing: 1.6329, marginBottom: 7.8507 }}>CERTIFICATE</p>
                    <p style={{ fontSize: 18.842, letterSpacing: 1.3189 }}>OF COMPLETION</p>
                </Box>

                <Box
                    sx={{
                        position: "absolute",
                        left: 153.08,
                        top: 274.88,
                        transform: "translateY(-50%)",
                        width: 170.36,
                        fontFamily: R,
                        fontWeight: 500,
                        fontSize: 10.991,
                        lineHeight: "normal",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                    }}
                >
                    This is to certify that
                </Box>

                <Box
                    sx={{
                        position: "absolute",
                        left: 153.88,
                        top: 311.39,
                        transform: "translateY(-50%)",
                        width: 455.339,
                        fontFamily: M,
                        fontWeight: 700,
                        fontSize: 29.047,
                        lineHeight: "normal",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {certificate.candidate}
                </Box>
                <Box sx={{ position: "absolute", left: 155.68, top: 329.45, width: 453.452, height: 1.236, bgcolor: "#4162A4" }} />

                <Box sx={{ position: "absolute", left: 154.66, top: 341.61, width: 474.966, fontFamily: R, fontWeight: 400, fontSize: 11.12, lineHeight: "16.486px" }}>
                    has successfully completed <Box component="span" sx={{ fontWeight: 500 }}>{certificate.courseName}</Box> course from Connecting Cyber Networks.
                </Box>

                <Box sx={{ position: "absolute", left: 155.01, top: 468.24, width: 147.593, fontFamily: M, lineHeight: "normal", letterSpacing: 0.2512 }}>
                    <p style={{ fontWeight: 700, fontSize: 12.561, marginBottom: 2.3552 }}>{certificate.signatory.name}</p>
                    <p style={{ fontWeight: 500, fontSize: 9.421, marginBottom: 2.3552 }}>{certificate.signatory.title}</p>
                    <p style={{ fontWeight: 500, fontSize: 9.421 }}>{certificate.signatory.organisation}</p>
                </Box>

                <Box
                    sx={{
                        position: "absolute",
                        left: 621.77,
                        top: 507.18,
                        transform: "translate(-100%, -50%)",
                        width: 181.351,
                        fontFamily: M,
                        fontWeight: 500,
                        fontSize: 9.421,
                        lineHeight: "normal",
                        letterSpacing: 0.471,
                        textAlign: "right",
                    }}
                >
                    {formatLongDate(certificate.issueDate, true)}
                </Box>
            </Box>
        </Box>
    );
}
