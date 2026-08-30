"use client";

import { useCallback, useRef, useState } from "react";
import { Box, IconButton, LinearProgress, Typography } from "@mui/material";
import { MdCloudUpload, MdDeleteOutline, MdInsertDriveFile, MdOutlineOpenInNew } from "react-icons/md";
import toast from "react-hot-toast";
import { fileUploaderToS3 } from "@/services/s3";
import type { TaskDocumentInput } from "@/contexts/AssignmentContext";
import { A_BRAND, formatFileSize } from "./assignment-ui";

type Variant = "light" | "dark";

const THEME: Record<Variant, {
    border: string;
    borderActive: string;
    bg: string;
    bgActive: string;
    text: string;
    muted: string;
    itemBg: string;
    accent: string;
}> = {
    light: {
        border: A_BRAND.border,
        borderActive: A_BRAND.violet,
        bg: "#ffffff",
        bgActive: A_BRAND.violetBg,
        text: A_BRAND.text,
        muted: A_BRAND.muted,
        itemBg: "#f8fafc",
        accent: A_BRAND.violet,
    },
    dark: {
        border: "rgba(255,255,255,0.2)",
        borderActive: "#7c3aed",
        bg: "rgba(255,255,255,0.02)",
        bgActive: "#1e1040",
        text: "#ffffff",
        muted: "rgba(255,255,255,0.5)",
        itemBg: "rgba(255,255,255,0.04)",
        accent: "#60a5fa",
    },
};

function extensionOf(fileName: string): string {
    const parts = fileName.split(".");
    return parts.length > 1 ? parts.pop()!.toLowerCase() : "file";
}

export default function FileDropzone({
    files,
    onChange,
    variant = "light",
    accept = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt,.png,.jpg,.jpeg",
    maxSizeMB = 10,
    dirName = "lms-assignments/files",
    hint,
    disabled = false,
}: {
    files: TaskDocumentInput[];
    onChange: (files: TaskDocumentInput[]) => void;
    variant?: Variant;
    accept?: string;
    maxSizeMB?: number;
    dirName?: string;
    hint?: string;
    disabled?: boolean;
}) {
    const theme = THEME[variant];
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [progress, setProgress] = useState<Record<string, number>>({});

    const upload = useCallback(
        async (incoming: File[]) => {
            const accepted = incoming.filter((file) => {
                if (file.size > maxSizeMB * 1024 * 1024) {
                    toast.error(`${file.name} exceeds the ${maxSizeMB} MB limit`);
                    return false;
                }
                return true;
            });
            if (accepted.length === 0) return;

            const uploaded: TaskDocumentInput[] = [];
            for (const file of accepted) {
                const key = `${file.name}-${file.size}`;
                setProgress((prev) => ({ ...prev, [key]: 0 }));
                let url: string | null = null;
                await fileUploaderToS3(
                    file,
                    (percent) => setProgress((prev) => ({ ...prev, [key]: percent })),
                    (fileUrl) => {
                        url = fileUrl;
                    },
                    dirName
                );
                setProgress((prev) => {
                    const next = { ...prev };
                    delete next[key];
                    return next;
                });
                if (!url) {
                    toast.error(`Failed to upload ${file.name}`);
                    continue;
                }
                uploaded.push({
                    documentName: file.name,
                    documentType: extensionOf(file.name),
                    documentUrl: url,
                    fileSizeInBytes: file.size,
                });
            }

            if (uploaded.length > 0) {
                onChange([...files, ...uploaded]);
                toast.success(`${uploaded.length} file(s) uploaded`);
            }
        },
        [files, onChange, maxSizeMB, dirName]
    );

    const busy = Object.keys(progress).length > 0;

    return (
        <Box>
            <Box
                onDragOver={(e) => {
                    e.preventDefault();
                    if (!disabled) setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    if (!disabled) upload(Array.from(e.dataTransfer.files));
                }}
                onClick={() => !disabled && !busy && inputRef.current?.click()}
                sx={{
                    border: `1.5px dashed ${dragging ? theme.borderActive : theme.border}`,
                    borderRadius: "10px",
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.5,
                    cursor: disabled || busy ? "not-allowed" : "pointer",
                    backgroundColor: dragging ? theme.bgActive : theme.bg,
                    opacity: disabled ? 0.5 : 1,
                    transition: "background-color .2s, border-color .2s",
                }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept={accept}
                    style={{ display: "none" }}
                    onChange={(e) => {
                        if (e.target.files) upload(Array.from(e.target.files));
                        e.target.value = "";
                    }}
                />
                <MdCloudUpload size={28} color={theme.muted} />
                <Typography sx={{ fontSize: "0.8rem", color: theme.text, textAlign: "center" }}>
                    Drag your file(s) or{" "}
                    <Box component="span" sx={{ color: theme.accent, textDecoration: "underline" }}>
                        browse
                    </Box>
                </Typography>
                <Typography sx={{ fontSize: "0.7rem", color: theme.muted, textAlign: "center" }}>
                    {hint ?? `Max ${maxSizeMB} MB per file`}
                </Typography>
            </Box>

            {Object.entries(progress).map(([key, percent]) => (
                <Box key={key} sx={{ mt: 1 }}>
                    <Typography sx={{ fontSize: "0.7rem", color: theme.muted, mb: 0.3 }} noWrap>
                        Uploading {key.split("-")[0]} — {percent}%
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={percent}
                        sx={{
                            height: 5,
                            borderRadius: 3,
                            backgroundColor: theme.itemBg,
                            "& .MuiLinearProgress-bar": { backgroundColor: theme.borderActive, borderRadius: 3 },
                        }}
                    />
                </Box>
            ))}

            {files.length > 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 1 }}>
                    {files.map((file, index) => (
                        <Box
                            key={`${file.documentUrl}-${index}`}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                backgroundColor: theme.itemBg,
                                border: `1px solid ${theme.border}`,
                                borderRadius: "8px",
                                px: 1,
                                py: 0.6,
                            }}
                        >
                            <MdInsertDriveFile size={16} color={theme.borderActive} />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontSize: "0.74rem", fontWeight: 600, color: theme.text }} noWrap>
                                    {file.documentName}
                                </Typography>
                                <Typography sx={{ fontSize: "0.66rem", color: theme.muted }}>
                                    {file.documentType.toUpperCase()} · {formatFileSize(file.fileSizeInBytes)}
                                </Typography>
                            </Box>
                            <IconButton
                                size="small"
                                component="a"
                                href={file.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ color: theme.muted }}
                            >
                                <MdOutlineOpenInNew size={14} />
                            </IconButton>
                            {!disabled && (
                                <IconButton
                                    size="small"
                                    onClick={() => onChange(files.filter((_, i) => i !== index))}
                                    sx={{ color: A_BRAND.rose }}
                                >
                                    <MdDeleteOutline size={15} />
                                </IconButton>
                            )}
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}
