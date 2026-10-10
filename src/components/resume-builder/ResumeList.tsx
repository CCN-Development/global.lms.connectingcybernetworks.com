"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Menu, MenuItem, Typography } from "@mui/material";
import { ResumeRecord, RESUME_ROUTES, STATUS_META, formatEdited, rbAsset } from "./resume-data";
import { useResumeBuilder } from "./ResumeBuilderContext";
import { DeleteModal, RenameModal, ShareModal } from "./ResumeModals";
import { CountDivider, GlassPanel, PanelTitle, PrimaryButton, RB, RTEXT, RbIcon, RoundIconButton } from "./rb-ui";

type RowAction = "download" | "rename" | "share" | "duplicate" | "delete";

const ROW_ACTIONS: { id: RowAction; label: string; icon: string }[] = [
    { id: "download", label: "Download PDF", icon: "menu-download.svg" },
    { id: "rename", label: "Rename", icon: "menu-edit.svg" },
    { id: "share", label: "Share", icon: "menu-share.svg" },
    { id: "duplicate", label: "Duplicate", icon: "menu-copy.svg" },
    { id: "delete", label: "Delete", icon: "menu-trash.svg" },
];

export const openHref = (resume: ResumeRecord) => (resume.status === "draft" ? RESUME_ROUTES.edit(resume.id, "theme") : RESUME_ROUTES.view(resume.id));

export function StatusBadge({ status }: { status: ResumeRecord["status"] }) {
    const meta = STATUS_META[status];
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
            {meta.icon && <RbIcon name={meta.icon} size={14} />}
            <Typography component="span" sx={{ ...RTEXT.med12, color: meta.color, whiteSpace: "nowrap" }}>
                {meta.label}
            </Typography>
        </Box>
    );
}

function ResumeRow({ resume, onMenu }: { resume: ResumeRecord; onMenu: (anchor: HTMLElement, resume: ResumeRecord) => void }) {
    const router = useRouter();
    const href = openHref(resume);
    const approved = resume.status === "approved";

    return (
        <Box
            component="li"
            role="link"
            tabIndex={0}
            aria-label={`Open ${resume.title}`}
            onClick={() => router.push(href)}
            onKeyDown={(event) => {
                if (event.key === "Enter") router.push(href);
            }}
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                px: "20px",
                py: "16px",
                borderRadius: "16px",
                backgroundImage: "linear-gradient(90deg, rgba(38,38,38,0.5) 0%, rgba(140,140,140,0) 100%)",
                cursor: "pointer",
                outline: "none",
                transition: "background-color .15s ease",
                "&:hover, &:focus-visible": { bgcolor: "rgba(255,255,255,0.03)" },
                "&:focus-visible": { boxShadow: `0 0 0 1px ${RB.primary200}` },
            }}
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                <Typography sx={{ ...RTEXT.semi16, color: RB.n75, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {resume.title}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", columnGap: "8px", rowGap: "2px" }}>
                    <StatusBadge status={resume.status} />
                    <RbIcon name="dot-6.svg" size={6} />
                    <Typography component="span" sx={{ ...RTEXT.med12, color: RB.n200, whiteSpace: "nowrap" }}>
                        Last edited on {formatEdited(resume.updatedAt)}
                    </Typography>
                </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                {!approved && <RoundIconButton icon="icon-eye-row.svg" label={`View ${resume.title}`} onClick={() => router.push(href)} />}
                <RoundIconButton
                    icon="icon-more-vertical.svg"
                    label={`More actions for ${resume.title}`}
                    aria-haspopup="menu"
                    bare={!approved}
                    onClick={(event) => onMenu(event.currentTarget, resume)}
                />
            </Box>
        </Box>
    );
}

/** Resume Builder landing: list of resumes (or the empty state) next to the hero illustration. */
export default function ResumeList() {
    const router = useRouter();
    const { resumes, createResume, duplicateResume, deleteResume, updateResume, downloadPdf, notify } = useResumeBuilder();
    const [menu, setMenu] = useState<{ anchor: HTMLElement; resume: ResumeRecord } | null>(null);
    const [dialog, setDialog] = useState<{ kind: "rename" | "share" | "delete"; resume: ResumeRecord } | null>(null);

    const handleAction = (action: RowAction, resume: ResumeRecord) => {
        setMenu(null);
        if (action === "download") downloadPdf(resume.id);
        else if (action === "duplicate") {
            duplicateResume(resume.id);
            notify(`“${resume.title}” duplicated`);
        } else setDialog({ kind: action, resume });
    };

    const create = () => {
        const resume = createResume();
        router.push(RESUME_ROUTES.edit(resume.id, "theme"));
    };

    return (
        <Box sx={{ position: "relative", flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: "24px" }}>
            <Typography component="h1" sx={{ ...RTEXT.poppinsReg52, fontSize: { xs: "32px", sm: "44px", md: "52px" }, lineHeight: { xs: "48px", sm: "64px", md: "78px" }, color: RB.n75 }}>
                Get hired with ultimate
                <br />
                Resume Builder
            </Typography>

            <Box
                aria-hidden
                sx={{
                    display: { xs: "none", lg: "block" },
                    position: "absolute",
                    right: 13,
                    top: "calc(50% - 61px)",
                    transform: "translateY(-50%)",
                    // 608×456 in the 1440 frame; shrinks so it never overlaps the 747px panel.
                    width: "min(608px, calc(100% - 784px))",
                    aspectRatio: "608 / 456",
                    pointerEvents: "none",
                }}
            >
                <Box component="img" src={rbAsset("hero-illustration.png")} alt="" sx={{ width: "100%", height: "100%", objectFit: "contain", transform: "scaleX(-1)" }} />
            </Box>

            <GlassPanel sx={{ flex: 1, minHeight: 480, width: "100%", maxWidth: { lg: 747 }, p: { xs: "20px", sm: "32px" }, gap: "32px" }}>
                <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                    <PanelTitle>Your Resume</PanelTitle>
                    <PrimaryButton onClick={create} icon={<RbIcon name="icon-plus-20.svg" size={20} />}>
                        Create Resume
                    </PrimaryButton>
                </Box>
                <Box sx={{ position: "relative" }}>
                    <CountDivider label={`${resumes.length} Resume Added`} />
                </Box>
                {resumes.length ? (
                    <Box component="ul" aria-label="Your resumes" sx={{ position: "relative", m: 0, p: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "24px" }}>
                        {resumes.map((resume) => (
                            <ResumeRow key={resume.id} resume={resume} onMenu={(anchor, r) => setMenu({ anchor, resume: r })} />
                        ))}
                    </Box>
                ) : (
                    <Box sx={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "24px", py: "24px" }}>
                        <RbIcon name="empty-state.svg" size={160} />
                        <Typography sx={{ ...RTEXT.med14, color: RB.n400, textAlign: "center" }}>
                            Umm! Looks like your List is empty!
                            <br />
                            Start creating awesome Resume.
                        </Typography>
                    </Box>
                )}
            </GlassPanel>

            <Menu
                anchorEl={menu?.anchor}
                open={!!menu}
                onClose={() => setMenu(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{
                    paper: {
                        sx: {
                            mt: "8px",
                            bgcolor: RB.menuBg,
                            backgroundImage: "none",
                            backdropFilter: "blur(6px)",
                            borderRadius: "9px",
                            boxShadow: "0 8px 24px 0 rgba(255,255,255,0.08)",
                        },
                    },
                    list: { sx: { p: 0 } },
                }}
            >
                {ROW_ACTIONS.map((action) => (
                    <MenuItem
                        key={action.id}
                        onClick={() => menu && handleAction(action.id, menu.resume)}
                        sx={{ display: "flex", alignItems: "center", gap: "8px", height: 40, minHeight: 40, px: "12px", py: "8px", ...RTEXT.interMed16, color: RB.n200, "&:hover": { bgcolor: "rgba(255,255,255,0.06)" } }}
                    >
                        <RbIcon name={action.icon} size={20} />
                        {action.label}
                    </MenuItem>
                ))}
            </Menu>

            {dialog?.kind === "rename" && (
                <RenameModal
                    open
                    title={dialog.resume.title}
                    onClose={() => setDialog(null)}
                    onSave={(title) => {
                        updateResume(dialog.resume.id, { title });
                        setDialog(null);
                        notify("Resume renamed");
                    }}
                />
            )}
            <ShareModal
                open={dialog?.kind === "share"}
                url={dialog?.resume.shareUrl ?? ""}
                onClose={() => setDialog(null)}
                onCopied={() => {
                    setDialog(null);
                    notify("Link copied to clipboard");
                }}
            />
            <DeleteModal
                open={dialog?.kind === "delete"}
                title={dialog?.resume.title.replace(/\s+/g, "_") ?? ""}
                onClose={() => setDialog(null)}
                onConfirm={() => {
                    if (dialog) deleteResume(dialog.resume.id);
                    setDialog(null);
                    notify("Resume deleted");
                }}
            />
        </Box>
    );
}
