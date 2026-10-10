"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, ButtonBase, Snackbar, Typography } from "@mui/material";
import { BatchModalShell, ModalDivider, ModalSection } from "@/components/batches/BatchModalShell";
import { COLORS, FONTS, TYPE, glassFill } from "@/components/courses/my-courses-theme";
import type { StudentBatchTrainer } from "@/contexts/StudentContext";

const CHIP_SX = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    px: "12px",
    py: "8px",
    borderRadius: "6px",
    border: `1px solid ${COLORS.neutral200}`,
    bgcolor: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(15px)",
    overflow: "hidden",
    maxWidth: "100%",
} as const;

const LABEL_SX = { fontFamily: FONTS.lato, fontWeight: 400, fontSize: "14px", lineHeight: "21px", color: COLORS.neutral300 } as const;

export function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function trainerSubtitle(trainer: StudentBatchTrainer): string {
    return trainer.designation || trainer.email || `+${trainer.callingCode} ${trainer.phoneNumber}`;
}

/** Primary/200 circle with the trainer photo, falling back to initials. */
export function TrainerAvatar({ trainer, size }: { trainer: StudentBatchTrainer; size: number }) {
    return (
        <Box
            sx={{
                width: size,
                height: size,
                flexShrink: 0,
                borderRadius: "999px",
                border: `${size >= 100 ? 2.4 : 1}px solid #404040`,
                bgcolor: "#93A9E2",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: size >= 100 ? FONTS.poppins : FONTS.inter,
                fontWeight: 600,
                fontSize: size >= 100 ? "40px" : "18px",
                color: "#0E1934",
            }}
        >
            {trainer.photoUrl ? (
                <Box component="img" src={trainer.photoUrl} alt={trainer.trainerName} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
                getInitials(trainer.trainerName)
            )}
        </Box>
    );
}

function Chip({ children }: { children: React.ReactNode }) {
    return (
        <Box sx={CHIP_SX}>
            <Typography sx={{ ...TYPE.smallMed14, color: COLORS.neutral75, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {children}
            </Typography>
        </Box>
    );
}

/** Figma "LMS Button": frosted outline with a soft glow underneath. */
function GlowButton({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
    return (
        <ButtonBase
            onClick={onClick}
            sx={{
                position: "relative",
                overflow: "hidden",
                height: 53,
                px: "16px",
                py: "8px",
                borderRadius: "12px",
                border: `1px solid ${COLORS.primary75}`,
                backgroundImage: "linear-gradient(180deg, rgba(187,201,237,0.24) 0%, rgba(106,114,135,0.14) 100%)",
                backdropFilter: "blur(12px)",
                flexShrink: 0,
                "&:hover": { backgroundImage: "linear-gradient(180deg, rgba(187,201,237,0.34) 0%, rgba(106,114,135,0.2) 100%)" },
                "&.Mui-focusVisible": { outline: `2px solid ${COLORS.white}`, outlineOffset: "2px" },
            }}
        >
            <Box
                component="img"
                aria-hidden
                src="/updates/search-glow.svg"
                alt=""
                sx={{ position: "absolute", left: "50%", top: "calc(50% + 60.5px)", width: 41, height: 41, transform: "translate(-50%, -50%)", pointerEvents: "none" }}
            />
            <Typography sx={{ ...TYPE.buttonMed14, position: "relative", color, whiteSpace: "nowrap" }}>{label}</Typography>
        </ButtonBase>
    );
}

export default function TrainerProfileModal({
    trainer,
    trainerFor,
    onClose,
}: {
    trainer: StudentBatchTrainer | null;
    /** Courses/batches this trainer teaches the student. */
    trainerFor: string[];
    onClose: () => void;
}) {
    const router = useRouter();
    const [notice, setNotice] = useState<string | null>(null);
    if (!trainer) return null;

    const expertise = (trainer.expertise ?? []).filter(Boolean);
    const hasExperience = typeof trainer.experienceYears === "number" && trainer.experienceYears > 0;
    const hasRating = typeof trainer.rating === "number" && trainer.rating > 0;
    const contactChips = [trainer.email, `+${trainer.callingCode} ${trainer.phoneNumber}`].filter(Boolean) as string[];

    return (
        <BatchModalShell open={Boolean(trainer)} onClose={onClose} gap={44}>
            <ModalSection gap={24}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "24px", flexDirection: { xs: "column", sm: "row" }, textAlign: { xs: "center", sm: "left" } }}>
                    <TrainerAvatar trainer={trainer} size={120} />
                    <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "24px", alignItems: { xs: "center", sm: "flex-start" } }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0, maxWidth: "100%" }}>
                            <Typography
                                component="h2"
                                sx={{ fontFamily: FONTS.poppins, fontWeight: 600, fontSize: { xs: "26px", sm: "32px" }, lineHeight: { xs: "39px", sm: "48px" }, color: COLORS.white, wordBreak: "break-word" }}
                            >
                                {trainer.trainerName}
                            </Typography>
                            <Typography sx={{ ...TYPE.mediumMed16, color: COLORS.neutral300 }}>{trainer.designation || "Trainer"}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: { xs: "center", sm: "flex-start" }, maxWidth: "100%" }}>
                            {hasExperience && <Chip>{trainer.experienceYears}+ years of experience</Chip>}
                            {hasRating && (
                                <Box sx={CHIP_SX}>
                                    <Box component="img" src="/batches/detail/icon-star-gold.svg" alt="" sx={{ width: 16, height: 16 }} />
                                    <Typography sx={{ ...TYPE.smallMed14, fontWeight: 700, color: COLORS.neutral75 }}>
                                        {Number(trainer.rating).toFixed(1).replace(/\.0$/, "")}/5
                                    </Typography>
                                </Box>
                            )}
                            {!hasExperience && !hasRating && contactChips.map((value) => <Chip key={value}>{value}</Chip>)}
                        </Box>
                    </Box>
                </Box>
                <ModalDivider />
                <Box
                    sx={{
                        position: "relative",
                        p: "20px",
                        borderRadius: "24px",
                        border: "1px solid rgba(255,255,255,0.88)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        "&::before": { content: '""', position: "absolute", inset: 0, borderRadius: "inherit", backgroundImage: glassFill("171.07deg"), backdropFilter: "blur(12px)", pointerEvents: "none" },
                        "&::after": { content: '""', position: "absolute", inset: 0, borderRadius: "inherit", boxShadow: "inset 0px 0px 6px 0px rgba(255,255,255,0.16)", pointerEvents: "none" },
                        "& > *": { position: "relative" },
                    }}
                >
                    {expertise.length > 0 && (
                        <>
                            <Typography sx={LABEL_SX}>EXPERTISE</Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                                {expertise.map((skill) => (
                                    <Box key={skill} sx={{ height: 32, px: "12px", py: "2px", borderRadius: "999px", bgcolor: COLORS.neutral200, display: "flex", alignItems: "center" }}>
                                        <Typography sx={{ ...TYPE.mediumMed16, color: "#262626", whiteSpace: "nowrap" }}>{skill}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </>
                    )}
                    <Typography sx={LABEL_SX}>YOUR TRAINER FOR</Typography>
                    {trainerFor.length > 0 ? (
                        <Box component="ul" sx={{ m: 0, pl: "24px", listStyle: "disc", color: COLORS.neutral75 }}>
                            {trainerFor.map((item) => (
                                <Box component="li" key={item} sx={{ ...TYPE.mediumReg16, color: COLORS.neutral75 }}>
                                    {item}
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Typography sx={{ ...TYPE.mediumReg16, color: COLORS.neutral400 }}>—</Typography>
                    )}
                </Box>
            </ModalSection>
            <ModalDivider />
            <ModalSection sx={{ flexDirection: "row", flexWrap: "wrap", gap: "16px" }}>
                <GlowButton label="Write a Review" color={COLORS.white} onClick={() => setNotice("Trainer reviews are coming soon.")} />
                <GlowButton label="Message" color={COLORS.neutral100} onClick={() => router.push("/dashboard/chats")} />
            </ModalSection>
            <Snackbar
                open={Boolean(notice)}
                autoHideDuration={3000}
                onClose={() => setNotice(null)}
                message={notice}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            />
        </BatchModalShell>
    );
}
