"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Box, ButtonBase, Dialog, InputBase, Menu, MenuItem, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { LmsButton } from "@/components/community/community-ui";
import {
    REQUEST_ATTACHMENT_MAX_BYTES,
    REQUEST_ATTACHMENT_TYPES,
    REQUEST_TYPES,
    useRequests,
    type RequestDocumentInput,
    type RequestType,
    type StudentRequest,
} from "@/contexts/RequestContext";
import { RQ, TEXT, formatFileSize, requestAsset } from "./request-data";
import { Icon, dropdownItemSx, dropdownPaperSx } from "./request-parts";

export interface CreateRequestModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: (request: StudentRequest) => void;
}

export default function CreateRequestModal({ open, onClose, onCreated }: CreateRequestModalProps) {
    const { createRequest, uploadRequestDocument } = useRequests();
    const [category, setCategory] = useState<RequestType | "">("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [uploadPct, setUploadPct] = useState<number | null>(null);
    const [sending, setSending] = useState(false);
    const [categoryAnchor, setCategoryAnchor] = useState<HTMLElement | null>(null);
    const fileInput = useRef<HTMLInputElement>(null);

    const reset = () => {
        setCategory("");
        setDescription("");
        setFile(null);
        setUploadPct(null);
    };

    const handleClose = () => {
        if (sending) return;
        reset();
        onClose();
    };

    const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const picked = event.target.files?.[0];
        event.target.value = "";
        if (!picked) return;
        if (!REQUEST_ATTACHMENT_TYPES.includes(picked.type)) {
            toast.error("Only JPEG, PNG and PDF files are allowed");
            return;
        }
        if (picked.size > REQUEST_ATTACHMENT_MAX_BYTES) {
            toast.error("File must be 5MB or smaller");
            return;
        }
        setFile(picked);
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

        setSending(true);
        try {
            let documents: RequestDocumentInput[] | undefined;
            if (file) {
                setUploadPct(0);
                const uploaded = await uploadRequestDocument(file, setUploadPct);
                if (!uploaded.success || !uploaded.data) {
                    toast.error(uploaded.message ?? "Failed to upload attachment");
                    return;
                }
                documents = [uploaded.data];
            }

            const res = await createRequest({ requestType: category, requestDescription: description.trim(), documents });
            if (!res.success || !res.data) {
                toast.error(res.message ?? "Failed to create request");
                return;
            }
            toast.success("Request submitted");
            onCreated(res.data);
            reset();
            onClose();
        } finally {
            setSending(false);
            setUploadPct(null);
        }
    };

    const sendLabel = uploadPct !== null && uploadPct < 100 ? `Uploading… ${uploadPct}%` : sending ? "Sending…" : "Send Request";

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            scroll="body"
            slotProps={{
                backdrop: { sx: { bgcolor: RQ.overlay, backdropFilter: "blur(12px)" } },
                paper: {
                    sx: {
                        position: "relative",
                        width: "100%",
                        maxWidth: 604,
                        m: { xs: "16px", sm: "32px auto" },
                        p: { xs: "20px", sm: "32px" },
                        bgcolor: "#000",
                        backgroundImage: "none",
                        borderRadius: "24px",
                        borderTop: `1.5px solid ${RQ.modalStroke}`,
                        borderRight: `1.5px solid ${RQ.modalStroke}`,
                        backdropFilter: "blur(50px)",
                        boxShadow: "none",
                        overflow: "hidden",
                        color: RQ.white,
                    },
                },
            }}
        >
            {/* Ellipse 697 glow */}
            <Box
                aria-hidden
                sx={{ position: "absolute", left: 349, top: 288, transform: "translate(-50%, -50%) rotate(-40.17deg)", lineHeight: 0, pointerEvents: "none" }}
            >
                <Image src={requestAsset("modal-glow.svg")} alt="" width={269.794} height={1633.31} />
            </Box>

            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "32px" }}>
                {/* Header */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <Typography component="h2" sx={{ ...TEXT.poppinsSemi24, fontSize: { xs: "20px", sm: "24px" }, color: RQ.white }}>
                            Create Request
                        </Typography>
                        <Typography sx={{ ...TEXT.interMed14, color: RQ.n300 }}>
                            Describe your issue or request. We’ll help you resolve it.
                        </Typography>
                    </Box>
                    <Box component="img" src={requestAsset("modal-divider.svg")} alt="" aria-hidden sx={{ display: "block", width: "100%", height: "1px" }} />
                </Box>

                {/* Fields */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <ButtonBase
                        aria-haspopup="listbox"
                        onClick={(event) => setCategoryAnchor(event.currentTarget)}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            px: "16px",
                            py: "10px",
                            borderRadius: "12px",
                            border: `1px solid ${categoryAnchor ? RQ.n500 : RQ.n700}`,
                            textAlign: "left",
                            transition: "border-color .15s ease",
                            "&:hover": { borderColor: RQ.n500 },
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: "4px", px: "8px", py: "4px", minWidth: 0 }}>
                            <Typography component="span" sx={{ ...TEXT.interReg16, color: RQ.white, whiteSpace: "nowrap" }}>
                                {category || "Select a Category"}
                            </Typography>
                            {!category && (
                                <Typography component="span" sx={{ ...TEXT.interMed16, color: RQ.error500 }}>
                                    *
                                </Typography>
                            )}
                        </Box>
                        <Icon
                            name="icon-chevron-down-field.svg"
                            size={24}
                            sx={{ transform: categoryAnchor ? "rotate(180deg)" : "none", transition: "transform .15s ease" }}
                        />
                    </ButtonBase>
                    <Menu
                        anchorEl={categoryAnchor}
                        open={Boolean(categoryAnchor)}
                        onClose={() => setCategoryAnchor(null)}
                        slotProps={{
                            paper: { sx: { ...dropdownPaperSx, width: categoryAnchor?.offsetWidth, maxHeight: 320 } },
                        }}
                    >
                        {REQUEST_TYPES.map((option) => (
                            <MenuItem
                                key={option}
                                selected={option === category}
                                sx={dropdownItemSx}
                                onClick={() => {
                                    setCategory(option);
                                    setCategoryAnchor(null);
                                }}
                            >
                                {option}
                            </MenuItem>
                        ))}
                    </Menu>

                    <InputBase
                        multiline
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Provide more details about your issue or request"
                        inputProps={{ "aria-label": "Request details" }}
                        sx={{
                            alignItems: "flex-start",
                            height: 208,
                            p: "16px",
                            borderRadius: "12px",
                            border: `1.2px solid ${RQ.n700}`,
                            ...TEXT.interReg16,
                            color: RQ.white,
                            transition: "border-color .15s ease",
                            "&.Mui-focused": { borderColor: RQ.n500 },
                            "& textarea": { height: "100% !important", overflowY: "auto !important", p: 0 },
                            "& textarea::placeholder": { color: RQ.n300, opacity: 1 },
                        }}
                    />

                    {/* Uploader */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            p: "16px",
                            borderRadius: "16px",
                            border: `1px dashed ${RQ.n700}`,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                            <Icon name="upload-file-icon.svg" size={36} height={38} />
                            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                                <Typography sx={{ ...TEXT.interMed16, color: RQ.n100, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {file ? file.name : "Attachment (Optional)"}
                                </Typography>
                                <Typography sx={{ fontFamily: TEXT.interReg12.fontFamily, fontWeight: 400, fontSize: "12px", lineHeight: "21px", letterSpacing: 0, color: "#7D7D7D" }}>
                                    {file ? formatFileSize(file.size) : "JPEG, PNG and PDF formats, up to 5MB"}
                                </Typography>
                            </Box>
                        </Box>
                        <ButtonBase
                            disabled={sending}
                            onClick={() => (file ? setFile(null) : fileInput.current?.click())}
                            sx={{
                                height: 36,
                                px: "16px",
                                borderRadius: "10px",
                                border: `1px solid ${RQ.n700}`,
                                bgcolor: RQ.n800,
                                filter: "drop-shadow(0 5px 10px rgba(0,0,0,0.02))",
                                fontFamily: TEXT.interMed14.fontFamily,
                                fontWeight: 500,
                                fontSize: "14px",
                                lineHeight: "16px",
                                letterSpacing: "0.56px",
                                color: "#E3E4E6",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                                "&:hover": { bgcolor: "#303030" },
                            }}
                        >
                            {file ? "Remove" : "Select File"}
                        </ButtonBase>
                        <input ref={fileInput} hidden type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFile} />
                    </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", py: "8px" }}>
                    <LmsButton onClick={handleSubmit} disabled={sending} sx={{ width: "100%" }}>
                        {sendLabel}
                    </LmsButton>
                    <ButtonBase
                        onClick={handleClose}
                        disabled={sending}
                        sx={{
                            width: "100%",
                            height: 44,
                            px: "24px",
                            borderRadius: "10px",
                            ...TEXT.interMed14,
                            color: RQ.n100,
                            "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
                        }}
                    >
                        Cancel
                    </ButtonBase>
                </Box>
            </Box>
        </Dialog>
    );
}
