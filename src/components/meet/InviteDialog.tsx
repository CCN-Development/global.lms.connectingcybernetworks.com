"use client";

import React, { useMemo, useState } from "react";
import {
    Box, Button, Dialog, DialogContent, DialogTitle, IconButton, InputBase, Typography,
} from "@mui/material";
import { MdClose, MdContentCopy, MdSearch, MdCheck, MdSend, MdMail } from "react-icons/md";
import { M, meetScrollbarSx } from "./theme";
import { USERS } from "@/components/chats/data";
import { meetUrl } from "./meetHelpers";

type Props = {
    open: boolean;
    roomId: string;
    invited: string[];
    onClose: () => void;
    onDirectInvite: (userIds: string[]) => void;
};

export default function InviteDialog({ open, roomId, invited, onClose, onDirectInvite }: Props) {
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);

    const contacts = useMemo(
        () => Object.values(USERS).filter(
            (u) => u.id !== "me" && u.name.toLowerCase().includes(query.trim().toLowerCase()),
        ),
        [query],
    );

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(meetUrl(roomId));
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            setCopied(false);
        }
    };

    const close = () => { setSelected([]); setQuery(""); onClose(); };

    return (
        <Dialog
            open={open}
            onClose={close}
            maxWidth="xs"
            fullWidth
            slotProps={{ paper: { sx: { background: M.surface, border: `1px solid ${M.border}`, borderRadius: "12px", color: M.text, backgroundImage: "none" } } }}
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.9rem", fontWeight: 700, py: 1.4 }}>
                Add people
                <IconButton size="small" onClick={close} sx={{ color: M.textSoft }}><MdClose size={17} /></IconButton>
            </DialogTitle>

            <DialogContent sx={{ px: 2, pb: 2 }}>
                <Box sx={{ p: 1.2, borderRadius: "8px", background: M.surfaceAlt, border: `1px solid ${M.border}` }}>
                    <Typography sx={{ fontSize: "0.72rem", color: M.text, wordBreak: "break-all" }}>{meetUrl(roomId)}</Typography>
                </Box>
                <Button
                    onClick={copyLink}
                    startIcon={copied ? <MdCheck size={15} /> : <MdContentCopy size={15} />}
                    sx={{ mt: 1, fontSize: "0.74rem", textTransform: "none", color: M.accentSoft }}
                >
                    {copied ? "Joining info copied" : "Copy joining info"}
                </Button>

                <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.06em", color: M.textMuted, mt: 1.6, mb: 0.8 }}>
                    DIRECT INVITE
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, px: 1, py: 0.5, mb: 1, background: M.surfaceAlt, border: `1px solid ${M.border}`, borderRadius: "8px" }}>
                    <MdSearch size={15} color={M.textMuted} />
                    <InputBase
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search people"
                        sx={{ fontSize: "0.76rem", color: M.text, flex: 1 }}
                    />
                </Box>

                <Box sx={{ maxHeight: 250, overflowY: "auto", ...meetScrollbarSx }}>
                    {contacts.map((u) => {
                        const already = invited.includes(u.id);
                        const picked = selected.includes(u.id);
                        return (
                            <Box
                                key={u.id}
                                onClick={() => {
                                    if (already) return;
                                    setSelected((s) => (s.includes(u.id) ? s.filter((x) => x !== u.id) : [...s, u.id]));
                                }}
                                sx={{
                                    display: "flex", alignItems: "center", gap: 1, px: 0.6, py: 0.7, borderRadius: "8px",
                                    cursor: already ? "default" : "pointer", opacity: already ? 0.55 : 1,
                                    background: picked ? M.raised : "transparent",
                                    "&:hover": { background: already ? "transparent" : M.raised },
                                }}
                            >
                                <Box component="img" src={u.avatar} alt={u.name} sx={{ width: 32, height: 32, borderRadius: "50%", background: M.surfaceAlt }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: "0.76rem", color: M.text, fontWeight: 600 }}>{u.name}</Typography>
                                    <Typography sx={{ fontSize: "0.62rem", color: M.textMuted }}>
                                        {already ? "Already invited" : u.designation ?? u.email}
                                    </Typography>
                                </Box>
                                {picked && <MdCheck size={16} color={M.online} />}
                            </Box>
                        );
                    })}
                </Box>

                <Box sx={{ display: "flex", gap: 1, mt: 1.6 }}>
                    <Button
                        fullWidth
                        startIcon={<MdMail size={15} />}
                        sx={{ fontSize: "0.74rem", textTransform: "none", color: M.textSoft, border: `1px solid ${M.border}`, borderRadius: "18px" }}
                    >
                        Email invite
                    </Button>
                    <Button
                        fullWidth
                        variant="contained"
                        disabled={selected.length === 0}
                        startIcon={<MdSend size={15} />}
                        onClick={() => { onDirectInvite(selected); close(); }}
                        sx={{ fontSize: "0.74rem", textTransform: "none", borderRadius: "18px", background: M.accentDark, "&:hover": { background: M.accent } }}
                    >
                        Send invite{selected.length > 0 ? ` (${selected.length})` : ""}
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
