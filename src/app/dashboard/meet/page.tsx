"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, InputBase, Typography } from "@mui/material";
import { motion } from "framer-motion";
import {
    MdVideoCall, MdKeyboard, MdArrowForward, MdShield, MdGroups, MdPresentToAll, MdClosedCaption,
} from "react-icons/md";
import { M } from "@/components/meet/theme";
import { createRoomId, meetPath, normalizeCode } from "@/components/meet/meetHelpers";

const FEATURES = [
    { icon: <MdShield size={18} />, title: "Secure by default", desc: "Only signed-in CCN accounts can join a room." },
    { icon: <MdGroups size={18} />, title: "Batch friendly", desc: "Start a call straight from any batch or community chat." },
    { icon: <MdPresentToAll size={18} />, title: "Present anything", desc: "Share a screen, window or tab for live labs." },
    { icon: <MdClosedCaption size={18} />, title: "Live captions", desc: "Follow the session even in a noisy lab." },
];

export default function MeetLandingPage() {
    const router = useRouter();
    const [code, setCode] = useState("");

    const startNew = () => router.push(meetPath(createRoomId()));

    const join = () => {
        const roomId = normalizeCode(code);
        if (roomId.length < 4) return;
        router.push(meetPath(roomId));
    };

    return (
        <Box sx={{ minHeight: "100vh", background: M.bg, px: { xs: 2, md: 6 }, py: { xs: 3, md: 6 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: { xs: 4, md: 7 } }}>
                <Box sx={{ width: 32, height: 32, borderRadius: "8px", background: M.accentGrad, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MdVideoCall size={19} color={M.text} />
                </Box>
                <Typography sx={{ fontSize: "1.05rem", fontWeight: 700, color: M.text }}>CCN Meet</Typography>
            </Box>

            <Box sx={{ maxWidth: 1080, mx: "auto", display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 4, md: 8 }, alignItems: "center" }}>
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <Typography sx={{ fontSize: { xs: "1.6rem", md: "2.2rem" }, fontWeight: 800, color: M.text, lineHeight: 1.2 }}>
                        Secure video meetings for every CCN batch
                    </Typography>
                    <Typography sx={{ fontSize: "0.88rem", color: M.textSoft, mt: 1.5 }}>
                        Start an instant meeting, share the joining link in a batch group, and present your lab in real time.
                    </Typography>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2, mt: 3 }}>
                        <Button
                            variant="contained"
                            startIcon={<MdVideoCall size={18} />}
                            onClick={startNew}
                            sx={{ px: 2.4, py: 1.1, borderRadius: "10px", fontSize: "0.82rem", fontWeight: 700, textTransform: "none", background: M.accentGrad, "&:hover": { filter: "brightness(1.12)" } }}
                        >
                            New meeting
                        </Button>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.4, py: 0.5, borderRadius: "10px", border: `1px solid ${M.border}`, background: M.surface }}>
                            <MdKeyboard size={18} color={M.textMuted} />
                            <InputBase
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") join(); }}
                                placeholder="Enter a code or link"
                                sx={{ fontSize: "0.8rem", color: M.text, width: { xs: 150, sm: 190 } }}
                            />
                            <Button
                                onClick={join}
                                disabled={normalizeCode(code).length < 4}
                                endIcon={<MdArrowForward size={15} />}
                                sx={{ fontSize: "0.78rem", textTransform: "none", color: M.accentSoft }}
                            >
                                Join
                            </Button>
                        </Box>
                    </Box>
                </motion.div>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.4 }}>
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.06 * i }}
                        >
                            <Box sx={{ p: 1.6, borderRadius: "12px", background: M.surface, border: `1px solid ${M.border}`, height: "100%" }}>
                                <Box sx={{ width: 32, height: 32, borderRadius: "8px", background: M.surfaceAlt, border: `1px solid ${M.border}`, color: M.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {f.icon}
                                </Box>
                                <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: M.text, mt: 1 }}>{f.title}</Typography>
                                <Typography sx={{ fontSize: "0.72rem", color: M.textMuted, mt: 0.3 }}>{f.desc}</Typography>
                            </Box>
                        </motion.div>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
