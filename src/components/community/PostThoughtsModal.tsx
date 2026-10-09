"use client";

import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import toast from "react-hot-toast";
import { isRichTextEmpty } from "@/components/editor/RichTextEditor";
import { Attachment } from "./community-data";
import { CommunityModal, LmsButton } from "./community-ui";
import CommunityEditor from "./CommunityEditor";
import type { ReplyInput } from "./CommunityContext";

const PLACEHOLDER = 'Write your thoughts...\n(Note : You can also mention someone by clicking "@" this icon on your keyboard)';

interface PostThoughtsModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (input: ReplyInput) => void;
    /** Pre-fills the editor when editing an existing reply. */
    initial?: ReplyInput;
}

export default function PostThoughtsModal({ open, onClose, onSubmit, initial }: PostThoughtsModalProps) {
    const [html, setHtml] = useState("");
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    useEffect(() => {
        if (!open) return;
        setHtml(initial?.html ?? "");
        setAttachments(initial?.attachments ?? []);
    }, [open, initial]);

    const handleSubmit = () => {
        if (isRichTextEmpty(html) && attachments.length === 0) return void toast.error("Write something before posting");
        if (attachments.some((a) => a.progress < 100)) return void toast.error("Please wait for the uploads to finish");
        onSubmit({ html, attachments });
        onClose();
    };

    return (
        <CommunityModal open={open} onClose={onClose} title={initial ? "Edit your thoughts" : "Post your thoughts"} width={604}>
            <CommunityEditor
                value={html}
                onChange={setHtml}
                placeholder={PLACEHOLDER}
                attachments={attachments}
                setAttachments={setAttachments}
                autoFocus
            />
            <Box sx={{ py: "8px" }}>
                <LmsButton onClick={handleSubmit} sx={{ width: "100%" }}>
                    {initial ? "Save" : "Post"}
                </LmsButton>
            </Box>
        </CommunityModal>
    );
}
