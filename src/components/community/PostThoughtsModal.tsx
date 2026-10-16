"use client";

import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import toast from "react-hot-toast";
import { isRichTextEmpty } from "@/components/editor/RichTextEditor";
import { CheckRow, CommunityModal, LmsButton } from "./community-ui";
import CommunityEditor, { EditorAttachment } from "./CommunityEditor";
import { useCommunity } from "./CommunityContext";

const PLACEHOLDER = 'Write your thoughts...\n(Note : You can also mention someone by clicking "@" this icon on your keyboard)';

export interface ThoughtsPayload {
    html: string;
    attachmentIds: string[];
    isAnonymous: boolean;
}

interface PostThoughtsModalProps {
    open: boolean;
    onClose: () => void;
    /** Resolve true to close the modal (false keeps the draft, e.g. on a server error). */
    onSubmit: (input: ThoughtsPayload) => Promise<boolean>;
    /** Pre-fills the editor when editing an existing reply. */
    initial?: { html: string; attachments: EditorAttachment[] };
    /** For @mention suggestions. */
    spaceId?: string;
    /** Show "Post anonymously" (new replies in spaces that allow it, students only). */
    allowAnonymous?: boolean;
    /** Shown under the title, e.g. "Replying to @priya". */
    context?: React.ReactNode;
}

export default function PostThoughtsModal({ open, onClose, onSubmit, initial, spaceId, allowAnonymous, context }: PostThoughtsModalProps) {
    const { api } = useCommunity();
    const { deletePendingAttachment } = api;
    const [html, setHtml] = useState("");
    const [attachments, setAttachments] = useState<EditorAttachment[]>([]);
    const [anonymous, setAnonymous] = useState(false);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!open) return;
        setHtml(initial?.html ?? "");
        setAttachments(initial?.attachments ?? []);
        setAnonymous(false);
    }, [open, initial]);

    /** Cancelled drafts: remove uploads that were never posted. */
    const cancel = () => {
        attachments.filter((a) => a.fresh && a.progress >= 100).forEach((a) => void deletePendingAttachment(a.id));
        onClose();
    };

    const handleSubmit = async () => {
        if (isRichTextEmpty(html) && attachments.length === 0) return void toast.error("Write something before posting");
        if (attachments.some((a) => a.progress < 100)) return void toast.error("Please wait for the uploads to finish");
        setBusy(true);
        const done = await onSubmit({ html, attachmentIds: attachments.map((a) => a.id), isAnonymous: allowAnonymous ? anonymous : false });
        setBusy(false);
        if (done) onClose();
    };

    return (
        <CommunityModal open={open} onClose={busy ? () => undefined : cancel} title={initial ? "Edit your thoughts" : "Post your thoughts"} width={604}>
            {context}
            <CommunityEditor
                value={html}
                onChange={setHtml}
                placeholder={PLACEHOLDER}
                attachments={attachments}
                setAttachments={setAttachments}
                spaceId={spaceId}
                autoFocus
            />
            {allowAnonymous && !initial && (
                <CheckRow checked={anonymous} onChange={setAnonymous} label="Post anonymously" hint="Your name is hidden from other students. Moderators can still see it." />
            )}
            <Box sx={{ py: "8px" }}>
                <LmsButton onClick={handleSubmit} disabled={busy} sx={{ width: "100%" }}>
                    {busy ? "Posting…" : initial ? "Save" : "Post"}
                </LmsButton>
            </Box>
        </CommunityModal>
    );
}
