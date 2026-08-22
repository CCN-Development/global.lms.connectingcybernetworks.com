"use client";
import React, { Suspense } from "react";
import { Box, Typography } from "@mui/material";
import { useSearchParams } from "next/navigation";
import BatchCard from "@/components/batches/BatchCard";

const T_ASHISH = [{ name: "Ashish Saini", avatar: "https://cdn-icons-png.flaticon.com/512/1754/1754623.png" }];
const T_KUSHAL = [{ name: "Kushal Korde", avatar: "https://cdn-icons-png.flaticon.com/512/1754/1754623.png" }];
const T_OMKAR = [{ name: "Omkar", avatar: "https://cdn-icons-png.flaticon.com/512/1754/1754623.png" }];
const T_SHIV = [{ name: "Shivkumar Chauhan", avatar: "https://cdn-icons-png.flaticon.com/512/1754/1754623.png" }];

const DATA: Record<number, { month: string; batches: { id: number; title: string; mode: "Online" | "Offline" | "Hybrid"; batchCompletedOn: string; attendance: number; trainers: { name: string; avatar: string }[] }[] }[]> = {
    2026: [
        {
            month: "July 2026",
            batches: [
                { id: 1, title: "Cisco Certified Network Associate", mode: "Offline", batchCompletedOn: "18th Jul 2026", attendance: 78, trainers: T_KUSHAL },
                { id: 2, title: "SOC Analyst (Level 1)", mode: "Online", batchCompletedOn: "22nd Jul 2026", attendance: 83, trainers: T_SHIV },
            ],
        },
        {
            month: "June 2026",
            batches: [
                { id: 3, title: "Ethical Hacking & Penetration Testing", mode: "Online", batchCompletedOn: "28th Jun 2026", attendance: 88, trainers: T_OMKAR },
                { id: 4, title: "Soft Skills & Communication", mode: "Hybrid", batchCompletedOn: "15th Jun 2026", attendance: 95, trainers: T_ASHISH },
            ],
        },
        {
            month: "May 2026",
            batches: [
                { id: 5, title: "Python for Cybersecurity", mode: "Online", batchCompletedOn: "30th May 2026", attendance: 86, trainers: T_OMKAR },
                { id: 6, title: "Linux for Security Professionals", mode: "Online", batchCompletedOn: "20th May 2026", attendance: 89, trainers: T_KUSHAL },
            ],
        },
        {
            month: "April 2026",
            batches: [
                { id: 7, title: "AWS Cloud Practitioner", mode: "Online", batchCompletedOn: "25th Apr 2026", attendance: 91, trainers: T_ASHISH },
            ],
        },
        { month: "March 2026", batches: [] },
        { month: "February 2026", batches: [] },
        { month: "January 2026", batches: [] },
    ],
    2025: [
        {
            month: "December 2025",
            batches: [
                { id: 8, title: "Digital Forensics & Incident Response", mode: "Hybrid", batchCompletedOn: "19th Dec 2025", attendance: 74, trainers: T_SHIV },
            ],
        },
        {
            month: "November 2025",
            batches: [
                { id: 9, title: "Cisco Certified Network Professional", mode: "Offline", batchCompletedOn: "28th Nov 2025", attendance: 80, trainers: T_KUSHAL },
            ],
        },
        {
            month: "October 2025",
            batches: [
                { id: 10, title: "Microsoft Azure Security (AZ-500)", mode: "Online", batchCompletedOn: "31st Oct 2025", attendance: 96, trainers: T_ASHISH },
            ],
        },
        { month: "September 2025", batches: [] },
    ],
};

function CompletedContent() {
    const params = useSearchParams();
    const year = parseInt(params.get("year") ?? String(new Date().getFullYear()), 10);
    const months = DATA[year] ?? [];

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {months.map((group, idx) => (
                <Box key={group.month} sx={{ display: "flex", gap: 2, pb: group.batches.length > 0 ? 2.5 : 1.5 }}>
                    {/* Timeline spine */}
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 24, pt: "2px" }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#10b981", border: "2px solid rgba(16,185,129,0.3)", flexShrink: 0 }} />
                        {idx < months.length - 1 && (
                            <Box sx={{
                                width: "1.5px",
                                flex: 1,
                                minHeight: 20,
                                background: "repeating-linear-gradient(to bottom, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 4px, transparent 4px, transparent 8px)",
                                mt: 0.5,
                            }} />
                        )}
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        {group.batches.length > 0 ? (
                            <Box sx={{
                                bgcolor: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderRadius: "14px",
                                p: 1.5,
                            }}>
                                <Typography sx={{ fontStyle: "italic", fontSize: "0.95rem", fontWeight: 600, color: "#fff", mb: 1.5 }}>
                                    {group.month}
                                </Typography>
                                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 1.5 }}>
                                    {group.batches.map((b) => (
                                        <BatchCard key={b.id} variant="completed" {...b} />
                                    ))}
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{
                                bgcolor: "rgba(255,255,255,0.02)",
                                border: "1px solid rgba(255,255,255,0.06)",
                                borderRadius: "10px",
                                px: 1.5,
                                py: 1,
                            }}>
                                <Typography sx={{ fontStyle: "italic", fontSize: "0.9rem", fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
                                    {group.month}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            ))}
            {months.length === 0 && (
                <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", textAlign: "center", py: 5 }}>
                    No completed batches for {year}
                </Typography>
            )}
        </Box>
    );
}

export default function CompletedPage() {
    return (
        <Suspense>
            <CompletedContent />
        </Suspense>
    );
}