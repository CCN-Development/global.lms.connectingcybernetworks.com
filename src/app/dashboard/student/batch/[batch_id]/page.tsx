"use client";
import React from "react";
import { Box, Typography, Button, LinearProgress, Avatar } from "@mui/material";
import {
    MdAccessTime,
    MdCalendarToday,
    MdLocationOn,
    MdPerson,
    MdClass,
    MdRemoveRedEye,
    MdDownload,
} from "react-icons/md";

const COURSE_DESCRIPTION = [
    "The CCNA course is your gateway into the world of networking and cybersecurity, designed to equip learners with both the knowledge and confidence to build a strong career foundation. Whether you're a beginner stepping into IT for the first time or a professional looking to formalize your skills, this course provides everything you need to succeed.",
    "You'll develop a deep understanding of IP addressing, routing, switching, and network security fundamentals, while also exploring the essential principles that power today's digital infrastructure. What sets CCNA apart is the focus on hands-on labs and real-world simulations, ensuring you don't just study theory but actively learn how to configure, secure, and troubleshoot networks.",
    "You'll develop a deep understanding of IP addressing, routing, switching, and network security fundamentals, while also exploring the essential principles that power today's digital infrastructure. What sets CCNA apart is the focus on hands-on labs and real-world simulations, ensuring you don't just study theory but actively learn how to configure, secure, and troubleshoot networks.",
];

const BATCH_INFO = [
    { icon: <MdAccessTime size={14} />, value: "12:00 PM - 2:00 PM" },
    { icon: <MdCalendarToday size={14} />, value: "Tuesday - Friday" },
    { icon: <MdLocationOn size={14} />, value: "Offline" },
    { icon: <MdPerson size={14} />, value: "Kushal Korde" },
    { icon: <MdClass size={14} />, value: "Class 3" },
];

const INSTRUCTORS = [
    { name: "Kushali Singh", role: "Senior Security Manager" },
    { name: "Kushal Korde", role: "Senior Security Manager" },
];

const CARD_SX = {
    bgcolor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    p: 2,
} as const;

export default function BatchDetailPage() {
    return (
        <Box sx={{
            display: "grid", gridTemplateColumns: {
                xs: "1fr", md: "3fr 2fr"
            }, gap: 1.5, alignItems: "flex-start", flexWrap: { xs: "wrap", lg: "nowrap" }
        }}>

            {/* ── Left Column ── */}
            <Box sx={{ flex: "1 1 55%", display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0 }}>

                {/* About Course */}
                <Box sx={CARD_SX}>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", mb: 1.5 }}>
                        About Course
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                        {COURSE_DESCRIPTION.map((para, i) => (
                            <Typography
                                key={i}
                                sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.68)", lineHeight: 1.75 }}
                            >
                                {para}
                            </Typography>
                        ))}
                    </Box>
                </Box>

                {/* Course Syllabus */}
                <Box sx={{
                    background: "url('/batch-1.webp') no-repeat center center / cover",
                    borderRadius: "16px",
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    overflow: "hidden",
                    position: "relative",
                    minHeight: 160,
                }}>
                    {/* Soft glow */}
                    <Box sx={{
                        position: "absolute",
                        top: -30,
                        right: 60,
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }} />

                    <Box sx={{ zIndex: 1 }}>
                        <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", mb: 0.4 }}>
                            Course Syllabus
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.72)", mb: 1.5, maxWidth: 260 }}>
                            Get a complete overview of the course structure, topics, and timeline.
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            <Button
                                startIcon={<MdRemoveRedEye size={13} />}
                                sx={{
                                    bgcolor: "rgba(255, 255, 255, 0.99)",
                                    border: "1px solid rgba(255,255,255,0.22)",
                                    color: "#000",
                                    borderRadius: "4px",
                                    px: 1.5,
                                    py: 0.45,
                                    fontSize: "0.72rem",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                                }}
                            >
                                View Syllabus
                            </Button>
                            <Button
                                startIcon={<MdDownload size={13} />}
                                sx={{
                                    border: "1px solid rgba(255,255,255,0.22)",
                                    color: "#fff",
                                    borderRadius: "4px",
                                    px: 1.5,
                                    py: 0.45,
                                    fontSize: "0.72rem",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                                }}
                            >
                                Download Syllabus
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* ── Right Column ── */}
            <Box sx={{ flex: "1 1 40%", display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0 }}>

                {/* Batch Info */}
                <Box sx={CARD_SX}>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", mb: 1.5 }}>
                        Batch Info
                    </Typography>

                    {/* Start / End dates */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.5 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", mb: 0.3 }}>Starting at</Typography>
                            <Box sx={{
                                // bgcolor: "rgba(255,255,255,0.07)",
                                // border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "18px",
                                px: 1,
                                py: 0.6,
                                textAlign: "center",
                            }} className="chip-bg">
                                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#fff" }}>
                                    12th January, 2026
                                </Typography>
                            </Box>
                        </Box>

                        {/* Dot connector */}
                        <Box sx={{ display: "flex", gap: "3px", alignItems: "center", pt: 1, flexShrink: 0 }}>
                            {[0, 1, 2].map((i) => (
                                <Box key={i} sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.25)" }} />
                            ))}
                        </Box>

                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", mb: 0.3 }}>Ending at</Typography>
                            <Box sx={{
                                borderRadius: "18px",
                                px: 1,
                                py: 0.6,
                                textAlign: "center",
                            }} className="chip-bg">
                                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#fff" }}>
                                    14th March, 2026
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Detail rows */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0, border: "1px dashed rgba(255, 255, 255, 0.3)", padding: 1, borderRadius: "8px" }}>
                        {BATCH_INFO.map(({ icon, value }, i) => (
                            <Box
                                key={i}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    py: 0.7,
                                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                                }}
                            >
                                <Box sx={{ color: "rgba(255,255,255,0.38)", display: "flex", flexShrink: 0 }}>
                                    {icon}
                                </Box>
                                <Typography sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.78)" }}>
                                    {value}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Instructors */}
                <Box sx={CARD_SX}>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", mb: 1.25 }}>
                        Instructors
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {INSTRUCTORS.map(({ name, role }, i) => (
                            <Box
                                key={i}
                                sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "space-between" }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                                    <Avatar sx={{ width: 30, height: 30, fontSize: "0.75rem", bgcolor: "#1e40af", flexShrink: 0 }}>
                                        {name[0]}
                                    </Avatar>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography noWrap sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#fff", lineHeight: 1.3 }}>
                                            {name}
                                        </Typography>
                                        <Typography noWrap sx={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.42)" }}>
                                            {role}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Button
                                    size="small"
                                    startIcon={<MdRemoveRedEye size={11} />}
                                    sx={{
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        color: "rgba(255,255,255,0.7)",
                                        borderRadius: "4px",
                                        px: 1.1,
                                        py: 0.35,
                                        fontSize: "0.68rem",
                                        textTransform: "none",
                                        flexShrink: 0,
                                        whiteSpace: "nowrap",
                                        "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                                    }}
                                >
                                    View Full Profile
                                </Button>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Attendance */}
                <Box sx={CARD_SX}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25 }}>
                        <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>
                            Attendance
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: "0.7rem",
                                color: "#6b8fff",
                                cursor: "pointer",
                                "&:hover": { textDecoration: "underline" },
                            }}
                        >
                            View Full Attendance
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, mb: 1 }}>
                        <Typography sx={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                            85%
                        </Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }}>
                            25/35 Classes Attended
                        </Typography>
                    </Box>

                    <LinearProgress
                        variant="determinate"
                        value={85}
                        sx={{
                            height: 7,
                            borderRadius: 4,
                            bgcolor: "rgba(255,255,255,0.08)",
                            "& .MuiLinearProgress-bar": {
                                borderRadius: 4,
                                background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                            },
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
}
