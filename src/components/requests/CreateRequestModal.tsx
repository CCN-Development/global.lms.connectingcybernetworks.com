"use client";

import React, { useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import toast from "react-hot-toast";
import { MdClose, MdDescription, MdKeyboardArrowDown } from "react-icons/md";
import CCNModal from "@/components/modals/CCNModal";
import { fileUploaderToS3 } from "@/services/s3";
import {
    REQUEST_TYPES,
    useRequests,
    type RequestDocumentInput,
    type StudentRequest,
} from "@/contexts/RequestContext";
import { formatFileSize } from "./request-ui";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

const FIELD_SX = {
    "& .MuiOutlinedInput-root": {
        borderRadius: "10px",
        bgcolor: "#0A0A0C",
        color: "#fff",
        fontSize: "0.85rem",
        "& fieldset": { borderColor: "#26262B" },
        "&:hover fieldset": { borderColor: "#3F3F46" },
        "&.Mui-focused fieldset": { borderColor: "#3B5BFF" },
    },
    "& .MuiOutlinedInput-input::placeholder": { color: "#6B6B73", opacity: 1 },
};

export interface CreateRequestModalProps {
    open: boolean;
    onClose: () => void;
    onCreated?: (request: StudentRequest) => void;
}

export default function CreateRequestModal({ open, onClose, onCreated }: CreateRequestModalProps) {
    const { createRequest, submitting } = useRequests();

    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [attachment, setAttachment] = useState<RequestDocumentInput | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const reset = () => {
        setCategory("");
        setDescription("");
        setAttachment(null);
        setUploading(false);
        setProgress(0);
    };

    const handleClose = () => {
        if (uploading || submitting) return;
        reset();
        onClose();
    };

    const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        if (!ACCEPTED_TYPES.includes(file.type)) {
            toast.error("Only JPEG, PNG and PDF files are allowed");
            return;
        }
        if (file.size > MAX_FILE_BYTES) {
            toast.error("File must be 5MB or smaller");
            return;
        }

        setUploading(true);
        setProgress(0);
        fileUploaderToS3(
            file,
            setProgress,
            (fileUrl) => {
                setUploading(false);
                if (!fileUrl) {
                    toast.error("Upload failed, please try again");
                    return;
                }
                setAttachment({
                    documentName: file.name,
                    documentUrl: fileUrl,
                    documentType: file.type,
                    documentSize: file.size,
                });
            },
        );
    };

    const handleSubmit = async () => {
        if (!category) {
            toast.error("Select a category");
            return;
        }
        if (!description.trim()) {
            toast.error("Describe your issue or request");
            return;
        }

        const res = await createRequest({
            requestType: category,
            requestDescription: description.trim(),
            documents: attachment ? [attachment] : undefined,
        });

        if (!res.success || !res.data) {
            toast.error(res.message ?? "Failed to create request");
            return;
        }
        toast.success(res.message ?? "Request submitted");
        onCreated?.(res.data);
        reset();
        onClose();
    };

    const busy = uploading || submitting;

    return (
        <CCNModal open={open} onClose={handleClose} maxWidth={585}>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Header */}
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                            Create Request
                        </Typography>
                        <Typography sx={{ fontSize: "0.82rem", color: "#A1A1AA", mt: 0.5 }}>
                            Describe your issue or request. We&apos;ll help you resolve it.
                        </Typography>
                    </Box>
                    <IconButton onClick={handleClose} size="small" sx={{ color: "#71717A", "&:hover": { color: "#fff" } }}>
                        <MdClose size={18} />
                    </IconButton>
                </Box>

                <Box sx={{ height: "1px", bgcolor: "#26262B", my: 2 }} />

                {/* Category */}
                <Select
                    fullWidth
                    displayEmpty
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    IconComponent={MdKeyboardArrowDown}
                    renderValue={(value) => (
                        value
                            ? <span style={{ color: "#fff" }}>{value as string}</span>
                            : <span style={{ color: "#A1A1AA" }}>Select a Category <span style={{ color: "#f43f5e" }}>*</span></span>
                    )}
                    MenuProps={{
                        slotProps: {
                            paper: {
                                sx: {
                                    bgcolor: "#0A0A0C",
                                    border: "1px solid #26262B",
                                    borderRadius: "10px",
                                    "& .MuiMenuItem-root": { fontSize: "0.82rem", color: "#E4E4E7" },
                                    "& .MuiMenuItem-root:hover": { bgcolor: "#18181B" },
                                    "& .Mui-selected": { bgcolor: "#1E1B4B !important" },
                                },
                            },
                        },
                    }}
                    sx={{
                        borderRadius: "10px",
                        bgcolor: "#0A0A0C",
                        color: "#fff",
                        fontSize: "0.85rem",
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#26262B" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3F3F46" },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#3B5BFF" },
                        "& .MuiSelect-icon": { color: "#A1A1AA" },
                    }}
                >
                    {REQUEST_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                </Select>

                {/* Description */}
                <TextField
                    fullWidth
                    multiline
                    minRows={6}
                    placeholder="Provide more details about your issue or request"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    sx={{ ...FIELD_SX, mt: 1.5 }}
                />

                {/* Attachment */}
                <Box
                    sx={{
                        mt: 1.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                        p: 1.25,
                        borderRadius: "10px",
                        border: "1px dashed #3F3F46",
                        bgcolor: "#0A0A0C",
                    }}
                >
                    <Box
                        sx={{
                            width: 34,
                            height: 34,
                            borderRadius: "8px",
                            bgcolor: "#26262B",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            color: "#A1A1AA",
                        }}
                    >
                        <MdDescription size={18} />
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff" }} noWrap>
                            {attachment ? attachment.documentName : "Attachment (Optional)"}
                        </Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: "#8A8A93" }} noWrap>
                            {uploading
                                ? `Uploading… ${progress}%`
                                : attachment
                                    ? formatFileSize(attachment.documentSize) || "Ready"
                                    : "JPEG, PNG and PDF formats, up to 5MB"}
                        </Typography>
                    </Box>

                    {attachment && !uploading ? (
                        <Button
                            onClick={() => setAttachment(null)}
                            size="small"
                            sx={{ textTransform: "none", fontSize: "0.75rem", color: "#fb7185", minWidth: 0 }}
                        >
                            Remove
                        </Button>
                    ) : (
                        <Button
                            component="label"
                            size="small"
                            disabled={uploading}
                            sx={{
                                textTransform: "none",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                color: "#fff",
                                bgcolor: "#3F3F46",
                                borderRadius: "7px",
                                px: 1.5,
                                flexShrink: 0,
                                "&:hover": { bgcolor: "#52525B" },
                            }}
                        >
                            {uploading ? <CircularProgress size={14} color="inherit" /> : "Select File"}
                            <input hidden type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFile} />
                        </Button>
                    )}
                </Box>

                {/* Actions */}
                <Button
                    fullWidth
                    onClick={handleSubmit}
                    disabled={busy}
                    sx={{
                        mt: 2.5,
                        py: 1.15,
                        borderRadius: "9px",
                        textTransform: "none",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: "#fff",
                        background: "linear-gradient(90deg, #1D34D8 0%, #7A16C4 100%)",
                        "&:hover": { filter: "brightness(1.1)" },
                        "&.Mui-disabled": { color: "#A1A1AA", background: "#26262B" },
                    }}
                >
                    {submitting ? <CircularProgress size={16} color="inherit" /> : "Send Request"}
                </Button>

                <Button
                    fullWidth
                    onClick={handleClose}
                    disabled={busy}
                    sx={{ mt: 0.75, textTransform: "none", fontSize: "0.85rem", color: "#D4D4D8" }}
                >
                    Cancel
                </Button>
            </Box>
        </CCNModal>
    );
}
