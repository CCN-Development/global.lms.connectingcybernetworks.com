"use client";

import React, { useMemo, useState } from "react";
import { Box, ButtonBase, InputBase, Typography } from "@mui/material";
import { PlacementModal } from "@/components/placement/PlacementModals";
import { ResumeFeedback, SKILL_CATALOG, SKILL_GROUP_COPY, SkillGroup, TipsContent } from "./resume-data";
import { CancelButton, PrimaryButton, RB, RTEXT, RbField, RbIcon, SectionLabel } from "./rb-ui";

const TITLE_ID = "rb-modal-title";
const BODY_ID = "rb-modal-body";

function ModalTitle({ children }: { children: React.ReactNode }) {
    return (
        <Typography id={TITLE_ID} component="h2" sx={{ ...RTEXT.poppinsBold28, fontSize: { xs: "24px", sm: "28px" }, color: RB.white, width: "100%" }}>
            {children}
        </Typography>
    );
}

function ModalActions({ children }: { children: React.ReactNode }) {
    return <Box sx={{ position: "relative", display: "flex", flexDirection: { xs: "column-reverse", sm: "row" }, gap: "12px", width: "100%" }}>{children}</Box>;
}

function ModalPrimary({ children, onClick, disabled, danger }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; danger?: boolean }) {
    if (danger) {
        return (
            <ButtonBase
                onClick={onClick}
                sx={{ flex: 1, minWidth: 0, height: 44, borderRadius: "10px", bgcolor: RB.error, ...RTEXT.interMed14, color: RB.white, "&:hover": { bgcolor: RB.errorFill } }}
            >
                {children}
            </ButtonBase>
        );
    }
    return (
        <PrimaryButton glowLine onClick={onClick} disabled={disabled} sx={{ flex: 1, minWidth: 0 }}>
            {children}
        </PrimaryButton>
    );
}

/** Bordered list box with an icon per line (Key issues / Suggestions / Strengths). */
export function IconList({ items, icon }: { items: string[]; icon: string }) {
    return (
        <Box
            component="ul"
            sx={{ m: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "12px", p: "16px", borderRadius: "12px", bgcolor: RB.fieldBg, border: `1px solid ${RB.fieldBorder}`, width: "100%" }}
        >
            {items.map((item, i) => (
                <Box component="li" key={i} sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <RbIcon name={icon} size={20} />
                    <Typography component="span" sx={{ ...RTEXT.med16, color: RB.white, flex: 1, minWidth: 0 }}>
                        {item}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}

// ─── Feedback ──────────────────────────────────────────────────────────────
export function FeedbackModal({ open, feedback, onClose, onEdit }: { open: boolean; feedback: ResumeFeedback | null; onClose: () => void; onEdit: () => void }) {
    return (
        <PlacementModal open={open} labelledBy={TITLE_ID} gap="44px" align="stretch" onClose={onClose}>
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "16px" }}>
                <ModalTitle>Your Feedback</ModalTitle>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <SectionLabel>Key Issues</SectionLabel>
                    <IconList items={feedback?.keyIssues ?? []} icon="icon-x-circle-red.svg" />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <SectionLabel>Suggested Improvements</SectionLabel>
                    <IconList items={feedback?.suggestions ?? []} icon="icon-ai-spark-20.svg" />
                </Box>
            </Box>
            <ModalActions>
                <CancelButton onClick={onClose} />
                <ModalPrimary onClick={onEdit}>Edit Resume</ModalPrimary>
            </ModalActions>
        </PlacementModal>
    );
}

// ─── Share link ────────────────────────────────────────────────────────────
export function ShareModal({ open, url, onClose, onCopied }: { open: boolean; url: string; onClose: () => void; onCopied: () => void }) {
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            // Clipboard can be blocked (insecure context); the link stays selectable in the field.
        }
        onCopied();
    };
    return (
        <PlacementModal open={open} labelledBy={TITLE_ID} describedBy={BODY_ID} gap="44px" align="stretch" onClose={onClose}>
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "16px" }}>
                <ModalTitle>Share Resume Link</ModalTitle>
                <Box sx={{ display: "flex", alignItems: "stretch", gap: "12px", height: 60, overflow: "hidden", borderRadius: "12px", bgcolor: RB.fieldBg, border: `1px solid ${RB.fieldBorder}` }}>
                    <Box sx={{ width: 44, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: RB.n600 }}>
                        <RbIcon name="icon-link.svg" size={20} />
                    </Box>
                    <InputBase
                        value={url}
                        readOnly
                        inputProps={{ "aria-label": "Resume link", onFocus: (event) => event.currentTarget.select() }}
                        sx={{ flex: 1, minWidth: 0, pr: "12px", ...RTEXT.med16, color: RB.n200, "& input": { p: 0, textOverflow: "ellipsis" } }}
                    />
                </Box>
                <Typography id={BODY_ID} sx={{ ...RTEXT.interReg16, lineHeight: "24px", color: RB.n100 }}>
                    Please be careful while sharing your resume link. Anyone with this link can view your personal data on resume.
                </Typography>
            </Box>
            <ModalActions>
                <CancelButton onClick={onClose} />
                <ModalPrimary onClick={copy}>Copy Link</ModalPrimary>
            </ModalActions>
        </PlacementModal>
    );
}

// ─── Delete ────────────────────────────────────────────────────────────────
export function DeleteModal({ open, title, onClose, onConfirm }: { open: boolean; title: string; onClose: () => void; onConfirm: () => void }) {
    return (
        <PlacementModal open={open} labelledBy={TITLE_ID} describedBy={BODY_ID} gap="44px" align="stretch" onClose={onClose}>
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "16px" }}>
                <ModalTitle>Delete this Resume</ModalTitle>
                <Box id={BODY_ID} sx={{ ...RTEXT.interReg16, lineHeight: "24px", color: RB.n100 }}>
                    <Box component="p" sx={{ m: 0 }}>
                        Are you sure you want to delete resume “{title}” permanently?
                    </Box>
                    <Box component="p" sx={{ m: 0 }}>
                        This cannot be undone all your data will be lost.
                    </Box>
                    <Box component="p" sx={{ m: 0, mt: "24px" }}>
                        Make sure you duplicate this resume before deleting it!
                    </Box>
                </Box>
            </Box>
            <ModalActions>
                <CancelButton onClick={onClose} />
                <ModalPrimary danger onClick={onConfirm}>
                    Delete
                </ModalPrimary>
            </ModalActions>
        </PlacementModal>
    );
}

// ─── Rename ────────────────────────────────────────────────────────────────
export function RenameModal({ open, title, onClose, onSave }: { open: boolean; title: string; onClose: () => void; onSave: (title: string) => void }) {
    const [value, setValue] = useState(title);
    const trimmed = value.trim();
    return (
        <PlacementModal open={open} labelledBy={TITLE_ID} gap="44px" align="stretch" onClose={onClose}>
            <Box
                component="form"
                id="rb-rename-form"
                onSubmit={(event: React.FormEvent) => {
                    event.preventDefault();
                    if (trimmed) onSave(trimmed);
                }}
                sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "16px" }}
            >
                <ModalTitle>Rename Resume</ModalTitle>
                <RbField label="Enter Resume Title" value={value} onChange={setValue} inputProps={{ maxLength: 60, autoFocus: true }} />
            </Box>
            <ModalActions>
                <CancelButton onClick={onClose} />
                <ModalPrimary disabled={!trimmed} onClick={() => trimmed && onSave(trimmed)}>
                    Save
                </ModalPrimary>
            </ModalActions>
        </PlacementModal>
    );
}

// ─── Submitted ─────────────────────────────────────────────────────────────
export function SubmittedModal({ open, onClose, onAcknowledge }: { open: boolean; onClose: () => void; onAcknowledge: () => void }) {
    return (
        <PlacementModal open={open} labelledBy={TITLE_ID} describedBy={BODY_ID} gap="44px" align="stretch" onClose={onClose}>
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "16px" }}>
                <ModalTitle>Resume Submitted!</ModalTitle>
                <Typography id={BODY_ID} sx={{ ...RTEXT.interReg16, lineHeight: "24px", color: RB.n100 }}>
                    Your resume is now with the CCN Placement Team. Detailed feedback arrives within 24–48 hours. You won’t be able to edit your resume until the review is complete.
                </Typography>
            </Box>
            <ModalActions>
                <CancelButton onClick={onClose} />
                <ModalPrimary onClick={onAcknowledge}>Okay, I Understood</ModalPrimary>
            </ModalActions>
        </PlacementModal>
    );
}

// ─── Tips ──────────────────────────────────────────────────────────────────
export function TipsModal({ open, tips, onClose }: { open: boolean; tips: TipsContent; onClose: () => void }) {
    const heading = { ...RTEXT.med14, color: RB.n500 } as const;
    const italic = { ...RTEXT.med14, fontStyle: "italic", color: RB.n100 } as const;
    return (
        <PlacementModal open={open} labelledBy={TITLE_ID} gap="44px" align="stretch" onClose={onClose}>
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "16px" }}>
                <ModalTitle>{tips.title}</ModalTitle>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Typography component="h3" sx={heading}>
                        {tips.what.heading}
                    </Typography>
                    <Box sx={{ ...RTEXT.interReg16, lineHeight: "24px", color: RB.n100 }}>
                        <Box component="p" sx={{ m: 0 }}>
                            {tips.what.intro}
                        </Box>
                        <Box component="ul" sx={{ m: 0, pl: "24px", listStyle: "disc" }}>
                            {tips.what.bullets.map((b) => (
                                <li key={b}>{b}</li>
                            ))}
                        </Box>
                        <Box component="p" sx={{ m: 0 }}>
                            {tips.what.outro}
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Typography component="h3" sx={heading}>
                        {tips.how.heading}
                    </Typography>
                    {tips.how.steps.map((step, i) => (
                        <Box key={step.title} sx={{ display: "flex", flexDirection: "column", gap: "8px", color: RB.n100 }}>
                            <Typography sx={{ ...RTEXT.interReg16, lineHeight: "24px", color: RB.n100, pl: "8px" }}>
                                {i + 1}. {step.title}
                            </Typography>
                            <Box>
                                <Typography sx={{ ...RTEXT.med14, color: RB.n100 }}>{step.hint}</Typography>
                                <Typography sx={italic}>{step.example}</Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Typography component="h3" sx={heading}>
                        {tips.avoid.heading}
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: "21px", listStyle: "disc", display: "flex", flexDirection: "column", gap: "8px", color: RB.n100 }}>
                        {tips.avoid.items.map((item) => (
                            <Box component="li" key={item.text} sx={{ ...RTEXT.med14, pl: "6px" }}>
                                {item.text}
                                {item.example && (
                                    <Box component="span" sx={{ ...italic, display: "block", ml: "-27px" }}>
                                        {item.example}
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
            <ModalActions>
                <CancelButton onClick={onClose} />
                <ModalPrimary onClick={onClose}>Okay, I Understood</ModalPrimary>
            </ModalActions>
        </PlacementModal>
    );
}

// ─── Skill picker ──────────────────────────────────────────────────────────
export function SkillsModal({ open, group, selected, onClose, onSave }: { open: boolean; group: SkillGroup; selected: string[]; onClose: () => void; onSave: (skills: string[]) => void }) {
    const copy = SKILL_GROUP_COPY[group];
    const [picked, setPicked] = useState<string[]>(selected);
    const [query, setQuery] = useState("");
    const q = query.trim().toLowerCase();

    const options = useMemo(() => {
        const all = Array.from(new Set([...picked, ...SKILL_CATALOG[group]]));
        return q ? all.filter((s) => s.toLowerCase().includes(q)) : all;
    }, [group, picked, q]);
    const canAddCustom = q.length > 0 && !options.some((s) => s.toLowerCase() === q);

    const toggle = (skill: string) => setPicked((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]));

    return (
        <PlacementModal open={open} labelledBy={TITLE_ID} describedBy={BODY_ID} gap="44px" align="stretch" onClose={onClose}>
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "16px" }}>
                <ModalTitle>{copy.modalTitle}</ModalTitle>
                <Typography id={BODY_ID} sx={{ ...RTEXT.interReg16, lineHeight: "24px", color: RB.n100 }}>
                    {copy.modalBody}
                </Typography>
            </Box>
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "16px" }}>
                <Box
                    component="label"
                    sx={{ display: "flex", alignItems: "center", gap: "12px", height: 60, px: "12px", borderRadius: "12px", bgcolor: RB.fieldBg, border: `1px solid ${RB.fieldBorder}`, "&:focus-within": { borderColor: RB.primary } }}
                >
                    <Box sx={{ pr: "16px", display: "flex" }}>
                        <RbIcon name="icon-search-24.svg" size={24} />
                    </Box>
                    <InputBase
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" && canAddCustom) {
                                event.preventDefault();
                                toggle(query.trim());
                                setQuery("");
                            }
                        }}
                        placeholder={copy.placeholder}
                        inputProps={{ "aria-label": copy.placeholder }}
                        sx={{ flex: 1, ...RTEXT.med16, color: RB.white, "& input": { p: 0 }, "& input::placeholder": { color: RB.n400, opacity: 1 } }}
                    />
                </Box>
                <Box
                    role="listbox"
                    aria-multiselectable
                    aria-label={copy.modalTitle}
                    sx={{
                        height: 336,
                        overflowY: "auto",
                        overflowX: "hidden",
                        borderRadius: "12px",
                        bgcolor: RB.fieldBg,
                        border: `1px solid ${RB.fieldBorder}`,
                        scrollbarWidth: "thin",
                        scrollbarColor: "rgba(255,255,255,0.12) transparent",
                    }}
                >
                    {canAddCustom && (
                        <SkillOption
                            label={`Add “${query.trim()}”`}
                            selected={false}
                            onClick={() => {
                                toggle(query.trim());
                                setQuery("");
                            }}
                        />
                    )}
                    {options.map((skill) => (
                        <SkillOption key={skill} label={skill} selected={picked.includes(skill)} onClick={() => toggle(skill)} />
                    ))}
                    {!options.length && !canAddCustom && <Typography sx={{ ...RTEXT.med14, color: RB.n400, p: "20px 12px" }}>No matches found.</Typography>}
                </Box>
            </Box>
            <ModalActions>
                <CancelButton onClick={onClose} />
                <ModalPrimary onClick={() => onSave(picked)}>Save Skills</ModalPrimary>
            </ModalActions>
        </PlacementModal>
    );
}

function SkillOption({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
    return (
        <ButtonBase
            role="option"
            aria-selected={selected}
            onClick={onClick}
            sx={{
                width: "100%",
                height: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                px: "12px",
                py: "8px",
                bgcolor: selected ? "rgba(242,242,242,0.12)" : "transparent",
                textAlign: "left",
                "&:hover": { bgcolor: selected ? "rgba(242,242,242,0.16)" : "rgba(242,242,242,0.04)" },
            }}
        >
            <Typography component="span" sx={{ ...RTEXT.interReg16, lineHeight: "normal", color: selected ? RB.white : RB.n300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {label}
            </Typography>
            <RbIcon name={selected ? "skill-remove.svg" : "skill-add.svg"} size={24} />
        </ButtonBase>
    );
}
