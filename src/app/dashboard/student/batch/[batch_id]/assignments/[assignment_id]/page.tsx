"use client";

import React, { useState, useRef } from "react";
import {
    Box,
    Typography,
    LinearProgress,
    Chip,
} from "@mui/material";
import {
    MdArrowBack,
    MdCloudUpload,
    MdPictureAsPdf,
    MdCheckCircle,
    MdArrowBackIos,
    MdArrowForwardIos,
    MdOpenInNew,
    MdFiberManualRecord,
} from "react-icons/md";
import { useRouter } from "next/navigation";
import CCNButton from "@/components/buttons/CCNButton";

// ── Mock Types ─────────────────────────────────────────────────────────────

interface Task {
    id: number;
    title: string;
    completed: boolean;
    overview: string;
    note?: string;
    objective?: string;
    tools: string[];
    documents: { name: string; type: string }[];
    sourceLinks: { label: string; url: string }[];
}

// ── Mock Data ──────────────────────────────────────────────────────────────

const ASSIGNMENT_DATA = {
    title: "Subnetting Practice Lab",
    assignedOn: "Jul 27, 2026",
    dueDate: "Aug 3, 2026",
    trainer: "Shivkumar Chauhan",
    estimatedTime: "3 hours",
    status: "Recently Added",
    totalTasks: 3,
    tasks: [
        {
            id: 1,
            title: "Task 1",
            completed: true,
            overview:
                "In this task you will review IPv4 address classes (A, B, C) and understand how CIDR notation works. You will practise converting between dotted-decimal subnet masks and CIDR prefix lengths, and identify the network address, broadcast address, and valid host range for a given CIDR block.",
            note: "Use the ipCalculator tool provided in the lab VM to verify your manual calculations before submitting answers.",
            objective:
                "Correctly identify the address class, network address, broadcast address, and valid host range for all 10 CIDR blocks listed in the worksheet.",
            tools: ["ipCalculator", "Cisco Packet Tracer", "Notepad / Paper"],
            documents: [
                { name: "CIDR Reference Guide", type: "PDF" },
                { name: "IPv4 Classes Cheat Sheet", type: "PDF" },
            ],
            sourceLinks: [
                { label: "IANA IPv4 Address Registry", url: "https://www.iana.org/assignments/ipv4-address-space" },
                { label: "RFC 1918 – Private Addresses", url: "https://datatracker.ietf.org/doc/html/rfc1918" },
            ],
        },
        {
            id: 2,
            title: "Task 2",
            completed: false,
            overview:
                "Given a parent network block and a set of departmental host requirements, calculate the optimal subnet mask for each department using VLSM. Enumerate the valid host ranges and document all results in the provided answer sheet, allocating subnets efficiently to minimise address waste.",
            note: "Always subnet from the largest host requirement down to the smallest (VLSM approach) to avoid overlapping ranges.",
            objective:
                "Produce a complete subnet allocation table with correct subnet addresses, masks, first/last host IPs, and broadcast addresses for every department in the given scenario.",
            tools: ["ipCalculator", "subnet-calculator.com", "Wireshark"],
            documents: [
                { name: "Subnetting Formula Sheet", type: "PDF" },
            ],
            sourceLinks: [
                { label: "subnet-calculator.com", url: "https://www.subnet-calculator.com" },
                { label: "Cisco Learning Network", url: "https://learningnetwork.cisco.com" },
            ],
        },
        {
            id: 3,
            title: "Task 3",
            completed: false,
            overview:
                "Using the subnet plan from Task 2, build a small multi-subnet office network in Cisco Packet Tracer. Configure router-on-a-stick or separate physical interfaces, assign IP addresses to all end devices, and verify inter-subnet connectivity using ping and traceroute commands.",
            note: "Save your Packet Tracer file (.pkt) and export a full topology screenshot before uploading your submission.",
            objective:
                "Demonstrate working inter-subnet connectivity between at least three subnets, with a correctly configured router and ping test evidence included in the submission screenshots.",
            tools: ["Cisco Packet Tracer", "draw.io", "CLI / Terminal"],
            documents: [
                { name: "Network Design Template", type: "PDF" },
                { name: "Packet Tracer Quick Guide", type: "PDF" },
            ],
            sourceLinks: [
                { label: "Cisco Packet Tracer Download", url: "https://www.netacad.com/courses/packet-tracer" },
                { label: "draw.io – Network Diagrams", url: "https://app.diagrams.net" },
            ],
        },
    ] as Task[],
};

// ── Colors ─────────────────────────────────────────────────────────────────
const C = {
    bg: "transparent",
    card: "rgba(255,255,255,0.03)",
    cardBorder: "rgba(255,255,255,0.07)",
    text: "#fff",
    muted: "rgba(255,255,255,0.5)",
    dim: "rgba(255,255,255,0.3)",
    orange: "#f97316",
    teal: "#2dd4bf",
    tealBg: "#052e2b",
    green: "#22c55e",
    greenBg: "#052e11",
    purple: "#7c3aed",
    purpleBg: "#1e1040",
    red: "#ef4444",
    redBg: "#2d0a0a",
};

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <Typography
            sx={{
                fontSize: "0.65rem",
                fontWeight: 700,
                color: C.muted,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                mb: 0.75,
                mt: 2,
            }}
        >
            {children}
        </Typography>
    );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <Typography
            sx={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: C.text,
                mb: 1,
                mt: 2,
            }}
        >
            {children}
        </Typography>
    );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                py: 0.75,
                borderBottom: `1px solid ${C.cardBorder}`,
                "&:last-child": { borderBottom: "none" },
            }}
        >
            <Typography sx={{ fontSize: "0.78rem", color: C.muted, minWidth: 110, flexShrink: 0 }}>
                {label}
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: C.dim, mr: 0.5 }}>:</Typography>
            <Box sx={{ flex: 1 }}>{children}</Box>
        </Box>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AssignmentDetailPage() {
    const router = useRouter();
    const [activeTaskIdx, setActiveTaskIdx] = useState(1); // 0-based, default Task 2
    const [dragging, setDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const data = ASSIGNMENT_DATA;
    const task = data.tasks[activeTaskIdx];
    const completedCount = data.tasks.filter((t) => t.completed).length;
    const progress = (completedCount / data.totalTasks) * 100;

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragging(false);
        const dropped = Array.from(e.dataTransfer.files);
        setFiles((prev) => [...prev, ...dropped]);
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
        }
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
            {/* ── Page Header ── */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, flexShrink: 0 }}>
                <Box
                    onClick={() => router.back()}
                    sx={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        color: C.muted,
                        "&:hover": { color: C.text },
                        transition: "color 0.15s",
                    }}
                >
                    <MdArrowBack size={18} />
                </Box>
                <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: C.text, letterSpacing: "-0.01em" }}>
                    {data.title}
                </Typography>
            </Box>

            {/* ── Content + Bottom Nav wrapper ── */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                {/* ── Two-column layout ── */}
                <Box
                    sx={{
                        flex: 1,
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 320px" },
                        gap: 2,
                        overflow: "auto",
                        pb: 1,
                        minHeight: 0,
                    }}
                >
                    {/* ── LEFT: Task Overview ── */}
                    <Box
                        sx={{
                            bgcolor: C.card,
                            border: `1px solid ${C.cardBorder}`,
                            borderRadius: "14px",
                            p: { xs: 2, md: 2.5 },
                            overflow: "auto",
                        }}
                    >
                        <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: C.text, mb: 1.5 }}>
                            Task Overview
                        </Typography>

                        <Typography sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
                            {task.overview}
                        </Typography>

                        {task.note && (
                            <>
                                <SectionLabel>Note</SectionLabel>
                                <Typography sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
                                    {task.note}
                                </Typography>
                            </>
                        )}

                        {task.objective && (
                            <>
                                <SectionLabel>Objective</SectionLabel>
                                <Typography sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
                                    {task.objective}
                                </Typography>
                            </>
                        )}

                        {/* Tools */}
                        <SectionHeading>Tools</SectionHeading>
                        <Typography sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.8 }}>
                            The best tools for this lab are:
                        </Typography>
                        <Box component="ul" sx={{ pl: 2.5, mt: 0.5, mb: 0 }}>
                            {task.tools.map((tool) => (
                                <Box
                                    component="li"
                                    key={tool}
                                    sx={{
                                        fontSize: "0.82rem",
                                        color: "rgba(255,255,255,0.7)",
                                        lineHeight: 1.9,
                                        "&::marker": { color: C.muted },
                                    }}
                                >
                                    {tool}
                                </Box>
                            ))}
                        </Box>

                        {/* Documents */}
                        <SectionHeading>Document</SectionHeading>
                        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                            {task.documents.map((doc, i) => (
                                <Box
                                    key={i}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.25,
                                        bgcolor: "rgba(255,255,255,0.05)",
                                        border: `1px solid ${C.cardBorder}`,
                                        borderRadius: "10px",
                                        px: 1.5,
                                        py: 1,
                                        cursor: "pointer",
                                        "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                                        transition: "background 0.15s",
                                        minWidth: 150,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            bgcolor: C.redBg,
                                            borderRadius: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <MdPictureAsPdf size={18} color={C.red} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: C.text, lineHeight: 1.3 }}>
                                            {doc.name}
                                        </Typography>
                                        <Typography sx={{ fontSize: "0.68rem", color: C.muted }}>
                                            {doc.type}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>

                        {/* Source Links */}
                        <SectionHeading>Source Links</SectionHeading>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            {task.sourceLinks.map((link, i) => (
                                <Box
                                    key={i}
                                    component="a"
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        bgcolor: "rgba(255,255,255,0.05)",
                                        border: `1px solid ${C.cardBorder}`,
                                        borderRadius: "20px",
                                        px: 1.5,
                                        py: 0.5,
                                        fontSize: "0.75rem",
                                        color: "rgba(255,255,255,0.7)",
                                        textDecoration: "none",
                                        cursor: "pointer",
                                        "&:hover": { bgcolor: "rgba(255,255,255,0.09)", color: C.text },
                                        transition: "all 0.15s",
                                    }}
                                >
                                    {link.label}
                                    <MdOpenInNew size={11} />
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* ── RIGHT column ── */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {/* Basic Details card */}
                        <Box
                            sx={{
                                bgcolor: C.card,
                                border: `1px solid ${C.cardBorder}`,
                                borderRadius: "14px",
                                p: 2,
                            }}
                        >
                            <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: C.text, mb: 1.5 }}>
                                Basic Details
                            </Typography>

                            <DetailRow label="Assigned on">
                                <Typography sx={{ fontSize: "0.78rem", color: C.text }}>{data.assignedOn}</Typography>
                            </DetailRow>

                            <DetailRow label="Due date">
                                <Typography sx={{ fontSize: "0.78rem", color: C.text }}>{data.dueDate}</Typography>
                            </DetailRow>

                            <DetailRow label="Task Progress">
                                <Box>
                                    <Typography sx={{ fontSize: "0.75rem", color: C.text, mb: 0.5 }}>
                                        {completedCount} / {data.totalTasks} Completed
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={progress}
                                            sx={{
                                                flex: 1,
                                                height: 5,
                                                borderRadius: 3,
                                                bgcolor: "rgba(255,255,255,0.1)",
                                                "& .MuiLinearProgress-bar": {
                                                    bgcolor: C.orange,
                                                    borderRadius: 3,
                                                },
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </DetailRow>

                            <DetailRow label="Trainer">
                                <Typography sx={{ fontSize: "0.78rem", color: C.text }}>{data.trainer}</Typography>
                            </DetailRow>

                            <DetailRow label="Estimated Time">
                                <Typography sx={{ fontSize: "0.78rem", color: C.text }}>{data.estimatedTime}</Typography>
                            </DetailRow>

                            <DetailRow label="Status">
                                <Chip
                                    label={data.status}
                                    size="small"
                                    sx={{
                                        fontSize: "0.68rem",
                                        fontWeight: 600,
                                        height: 20,
                                        bgcolor: C.tealBg,
                                        color: C.teal,
                                        border: `1px solid ${C.teal}40`,
                                        "& .MuiChip-label": { px: 1 },
                                    }}
                                />
                            </DetailRow>
                        </Box>

                        {/* Upload card */}
                        <Box
                            sx={{
                                bgcolor: C.card,
                                border: `1px solid ${C.cardBorder}`,
                                borderRadius: "14px",
                                p: 2,
                            }}
                        >
                            <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: C.text, mb: 1.5 }}>
                                Upload Task {activeTaskIdx + 1}
                            </Typography>

                            {/* Dropzone */}
                            <Box
                                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                sx={{
                                    border: `1.5px dashed ${dragging ? C.purple : "rgba(255,255,255,0.2)"}`,
                                    borderRadius: "10px",
                                    p: 2.5,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 0.75,
                                    cursor: "pointer",
                                    bgcolor: dragging ? C.purpleBg : "rgba(255,255,255,0.02)",
                                    transition: "all 0.2s",
                                    mb: 1.5,
                                    "&:hover": { bgcolor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.35)" },
                                }}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    style={{ display: "none" }}
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.zip,.txt"
                                />
                                <MdCloudUpload size={32} color="rgba(255,255,255,0.4)" />
                                <Typography sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.75)", textAlign: "center" }}>
                                    Drag your file(s) or{" "}
                                    <Box component="span" sx={{ color: "#60a5fa", textDecoration: "underline", cursor: "pointer" }}>
                                        browse
                                    </Box>
                                </Typography>
                                <Typography sx={{ fontSize: "0.7rem", color: C.muted }}>
                                    Max 10 MB files are allowed
                                </Typography>
                            </Box>

                            {/* Uploaded file list */}
                            {files.length > 0 && (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 1.5 }}>
                                    {files.map((file, i) => (
                                        <Box
                                            key={i}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                bgcolor: "rgba(255,255,255,0.04)",
                                                borderRadius: "7px",
                                                px: 1,
                                                py: 0.5,
                                            }}
                                        >
                                            <MdPictureAsPdf size={14} color={C.red} />
                                            <Typography sx={{ fontSize: "0.72rem", color: C.muted, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {file.name}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            <CCNButton className="w-full">Submit your Work</CCNButton>
                        </Box>
                    </Box>
                </Box>

                {/* ── Bottom Task Navigator ── */}
                <Box
                    sx={{
                        flexShrink: 0,
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: `1px solid ${C.cardBorder}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                    }}
                >
                    {/* Task Steps */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0 }}>
                        {data.tasks.map((t, idx) => {
                            const isCompleted = t.completed;
                            const isActive = idx === activeTaskIdx;
                            const isLast = idx === data.tasks.length - 1;
                            return (
                                <Box key={t.id} sx={{ display: "flex", alignItems: "center" }}>
                                    {/* Step indicator */}
                                    <Box
                                        onClick={() => setActiveTaskIdx(idx)}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.75,
                                            cursor: "pointer",
                                        }}
                                    >
                                        {isCompleted ? (
                                            <MdCheckCircle size={22} color={C.green} />
                                        ) : isActive ? (
                                            <Box
                                                sx={{
                                                    width: 22,
                                                    height: 22,
                                                    borderRadius: "50%",
                                                    border: `2px solid ${C.purple}`,
                                                    bgcolor: C.purpleBg,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <MdFiberManualRecord size={8} color={C.purple} />
                                            </Box>
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: 22,
                                                    height: 22,
                                                    borderRadius: "50%",
                                                    border: `2px solid rgba(255,255,255,0.2)`,
                                                    bgcolor: "rgba(255,255,255,0.04)",
                                                }}
                                            />
                                        )}
                                        <Typography
                                            sx={{
                                                fontSize: "0.78rem",
                                                fontWeight: isActive ? 700 : 500,
                                                color: isActive ? C.text : C.muted,
                                            }}
                                        >
                                            {t.title}
                                        </Typography>
                                    </Box>

                                    {/* Connector line */}
                                    {!isLast && (
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 1.5,
                                                mx: 1,
                                                backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.25) 0px, rgba(255,255,255,0.25) 4px, transparent 4px, transparent 8px)",
                                            }}
                                        />
                                    )}
                                </Box>
                            );
                        })}
                    </Box>

                    {/* Prev / Next buttons */}
                    <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
                        <Box
                            onClick={() => setActiveTaskIdx((p) => Math.max(0, p - 1))}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                px: 1.5,
                                py: 0.75,
                                border: `1px solid ${C.cardBorder}`,
                                borderRadius: "8px",
                                cursor: activeTaskIdx === 0 ? "not-allowed" : "pointer",
                                opacity: activeTaskIdx === 0 ? 0.35 : 1,
                                bgcolor: "rgba(255,255,255,0.03)",
                                "&:hover": { bgcolor: "rgba(255,255,255,0.07)" },
                                transition: "all 0.15s",
                            }}
                        >
                            <MdArrowBackIos size={12} color={C.text} />
                            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: C.text }}>
                                Previous Task
                            </Typography>
                        </Box>
                        <Box
                            onClick={() => setActiveTaskIdx((p) => Math.min(data.tasks.length - 1, p + 1))}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                px: 1.5,
                                py: 0.75,
                                border: `1px solid ${C.cardBorder}`,
                                borderRadius: "8px",
                                cursor: activeTaskIdx === data.tasks.length - 1 ? "not-allowed" : "pointer",
                                opacity: activeTaskIdx === data.tasks.length - 1 ? 0.35 : 1,
                                bgcolor: "rgba(255,255,255,0.03)",
                                "&:hover": { bgcolor: "rgba(255,255,255,0.07)" },
                                transition: "all 0.15s",
                            }}
                        >
                            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: C.text }}>
                                Next Task
                            </Typography>
                            <MdArrowForwardIos size={12} color={C.text} />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
