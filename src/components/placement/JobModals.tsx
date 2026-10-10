"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, ButtonBase, Menu, MenuItem, Slider, Snackbar, Typography } from "@mui/material";
import { LmsButton } from "@/components/community/community-ui";
import { dropdownItemSx, dropdownPaperSx } from "@/components/requests/request-parts";
import { ADDITIONAL_QUESTIONS, APPLICANT_PROFILE, PLACEMENT_ROUTES, REQUEST_JOB_TYPES, REQUEST_LOCATIONS, SALARY_RANGE } from "./jobs-data";
import { placementAsset } from "./placement-data";
import { usePlacement } from "./PlacementContext";
import { ModalHeading, ModalHero, PlacementModal } from "./PlacementModals";
import { Asset, CheckBox, FormField, MetaDot, OutlineButton, PL, PTEXT, RemovablePill, glassCard } from "./placement-ui";

// ─── Shared form card ("My Tasks" frame) ───────────────────────────────────
function FormCard({ title, children }: { title?: string; children: React.ReactNode }) {
    return (
        <Box sx={{ ...glassCard("24px"), display: "flex", flexDirection: "column", gap: "24px", p: { xs: "16px", sm: "24px" }, width: "100%" }}>
            <Box aria-hidden sx={{ position: "absolute", left: 4, bottom: -16, width: 425, maxWidth: "100%", height: 15, filter: "blur(50px)", transform: "scaleY(-1)", pointerEvents: "none" }}>
                <Box component="img" src={placementAsset("form-card-glow.png")} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Box>
            {title && <Typography sx={{ position: "relative", ...PTEXT.med14, color: PL.white }}>{title}</Typography>}
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "16px" }}>{children}</Box>
        </Box>
    );
}

function Row({ children }: { children: React.ReactNode }) {
    return <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: "16px" }}>{children}</Box>;
}

function SubLabel({ children }: { children: React.ReactNode }) {
    return <Typography sx={{ ...PTEXT.med14, color: PL.white, pt: "8px" }}>{children}</Typography>;
}

function ModalAction({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
    return (
        <Box sx={{ position: "relative", py: "8px", width: "100%" }}>
            <LmsButton onClick={onClick} disabled={disabled} sx={{ width: "100%" }}>
                {label}
            </LmsButton>
        </Box>
    );
}

// ─── Apply stepper ─────────────────────────────────────────────────────────
function ApplyStepper({ step, total }: { step: number; total: number }) {
    return (
        <Box component="ol" aria-label={`Step ${step + 1} of ${total}`} sx={{ display: "flex", alignItems: "center", gap: "12px", m: 0, p: 0, listStyle: "none", width: "100%" }}>
            {Array.from({ length: total }, (_, i) => {
                const state = i < step ? "done" : i === step ? "active" : "pending";
                return (
                    <React.Fragment key={i}>
                        {i > 0 && <Box aria-hidden sx={{ flex: 1, height: "1px", bgcolor: PL.n500 }} />}
                        <Box
                            component="li"
                            aria-current={state === "active" ? "step" : undefined}
                            sx={{
                                width: 24,
                                height: 24,
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "99px",
                                ...(state === "done"
                                    ? { backgroundImage: PL.tealGradient, border: "0.545px solid #2EC4B6", backdropFilter: "blur(4.36px)" }
                                    : { border: `1px solid ${state === "active" ? PL.white : PL.n600}` }),
                            }}
                        >
                            {state === "active" ? (
                                <Box sx={{ width: 12, height: 12, borderRadius: "99px", bgcolor: PL.white }} />
                            ) : (
                                <Typography component="span" sx={{ ...PTEXT.med12, fontSize: "8.73px", lineHeight: "13.09px", color: PL.white }}>
                                    {i + 1}
                                </Typography>
                            )}
                        </Box>
                    </React.Fragment>
                );
            })}
        </Box>
    );
}

function ResumeOption({ name, size, selected, onSelect }: { name: string; size: string; selected: boolean; onSelect: () => void }) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                minHeight: 67,
                px: "16px",
                py: "12px",
                borderRadius: "12px",
                bgcolor: PL.inputBg,
                border: `1px solid ${selected ? "rgba(47,83,173,0.6)" : "rgba(64,64,64,0.24)"}`,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                <Box sx={{ width: 32, height: 32, display: "flex", justifyContent: "center", flexShrink: 0 }}>
                    <Asset name="icon-pdf.svg" width={24} height={32} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                    <Typography sx={{ ...PTEXT.med16, color: PL.n75 }}>{name}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Asset name="icon-qualified.svg" width={14} height={14} />
                            <Typography sx={{ ...PTEXT.med12, color: "#2EC4B6", whiteSpace: "nowrap" }}>Qualified Resume</Typography>
                        </Box>
                        <MetaDot />
                        <Typography sx={{ ...PTEXT.med12, color: PL.n200 }}>{size}</Typography>
                    </Box>
                </Box>
            </Box>
            <ButtonBase
                role="radio"
                aria-checked={selected}
                onClick={onSelect}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    height: 40,
                    pl: "12px",
                    pr: "16px",
                    flexShrink: 0,
                    borderRadius: "12px",
                    bgcolor: "rgba(38,38,38,0.12)",
                    border: `1px solid ${PL.neutral700}`,
                    boxShadow: "0 5px 20px 0 rgba(0,0,0,0.02)",
                    ...PTEXT.med12,
                    color: PL.n100,
                }}
            >
                <Asset name={selected ? "radio-on.svg" : "radio-off.svg"} width={16} height={16} />
                Select
            </ButtonBase>
        </Box>
    );
}

const MAX_VIDEO_BYTES = 10 * 1024 * 1024;

function VideoUpload({ file, onFile }: { file: File | null; onFile: (file: File | null) => void }) {
    const input = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const accept = (picked?: File) => {
        if (!picked) return;
        if (picked.size > MAX_VIDEO_BYTES) {
            setError("This file is larger than 10 MB.");
            return;
        }
        setError(null);
        onFile(picked);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", pt: "8px" }}>
            <Typography sx={{ ...PTEXT.med16, color: PL.white }}>Video of Introducing Yourself</Typography>
            <ButtonBase
                onClick={() => input.current?.click()}
                onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    accept(event.dataTransfer.files?.[0]);
                }}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px",
                    width: "100%",
                    p: "24px",
                    borderRadius: "8px",
                    border: `1px dashed ${dragging ? PL.primary200 : PL.n400}`,
                    bgcolor: dragging ? "rgba(147,169,226,0.06)" : "transparent",
                }}
            >
                <Asset name="icon-upload.svg" width={44} height={44} />
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" }}>
                    {file ? (
                        <Typography sx={{ ...PTEXT.med18, color: PL.white, wordBreak: "break-all" }}>{file.name}</Typography>
                    ) : (
                        <Box sx={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "center", ...PTEXT.med18 }}>
                            <Box component="span" sx={{ color: PL.white }}>
                                Drag your file(s) or
                            </Box>
                            <Box component="span" sx={{ color: PL.primary300 }}>
                                browse
                            </Box>
                        </Box>
                    )}
                    <Typography sx={{ ...PTEXT.med16, color: error ? PL.error : PL.n300 }}>
                        {error ?? (file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB · click to replace` : "Max 10 MB files are allowed")}
                    </Typography>
                </Box>
            </ButtonBase>
            <input ref={input} type="file" accept="video/*" hidden onChange={(event) => accept(event.target.files?.[0] ?? undefined)} />
        </Box>
    );
}

const APPLY_STEPS = ["Basic Details", "Resume Upload", "Work Experience", "Education", "Additional Questions"];

type ApplyForm = {
    basic: typeof APPLICANT_PROFILE.basic;
    resumeId: string | null;
    experience: typeof APPLICANT_PROFILE.experience;
    education: typeof APPLICANT_PROFILE.education;
    answers: Record<string, string>;
    video: File | null;
};

function ApplyJobModal({ jobId, onClose }: { jobId: string; onClose: () => void }) {
    const router = useRouter();
    const { resumes, submitApplication } = usePlacement();
    const [step, setStep] = useState(0);
    const [submittedId, setSubmittedId] = useState<string | null>(null);
    const [form, setForm] = useState<ApplyForm>(() => ({
        basic: { ...APPLICANT_PROFILE.basic },
        resumeId: resumes.find((r) => r.approved)?.id ?? null,
        experience: { ...APPLICANT_PROFILE.experience },
        education: { ...APPLICANT_PROFILE.education },
        answers: Object.fromEntries(ADDITIONAL_QUESTIONS.map((q) => [q.id, q.value])),
        video: null,
    }));

    const set = <K extends "basic" | "experience" | "education">(section: K, key: keyof ApplyForm[K]) => (value: string) =>
        setForm((f) => ({ ...f, [section]: { ...f[section], [key]: value } }));

    const valid =
        step === 0
            ? !!(form.basic.firstName.trim() && form.basic.whatsapp.trim() && /\S+@\S+\.\S+/.test(form.basic.email))
            : step === 1
              ? !!form.resumeId
              : true;
    const last = step === APPLY_STEPS.length - 1;

    const next = () => {
        if (!last) return setStep((s) => s + 1);
        setSubmittedId(submitApplication(jobId).id);
    };

    if (submittedId) {
        return (
            <PlacementModal open labelledBy="placement-modal-title" describedBy="placement-modal-body" padding="32px 32px 44px" onClose={onClose}>
                <ModalHero
                    title="Application Submitted!"
                    lines={["You’ve successfully applied for this job.", "Your application has been sent to the Placement Team for review. We’ll notify you about the next steps."]}
                />
                <Box sx={{ position: "relative", display: "flex", flexDirection: { xs: "column-reverse", sm: "row" }, gap: { xs: "12px", sm: "24px" }, width: "100%" }}>
                    <OutlineButton borderWidth={2} onClick={onClose} sx={{ flex: 1 }}>
                        Cancel
                    </OutlineButton>
                    <LmsButton
                        onClick={() => {
                            onClose();
                            router.push(PLACEMENT_ROUTES.application(submittedId));
                        }}
                        sx={{ flex: 1 }}
                    >
                        View Application
                    </LmsButton>
                </Box>
            </PlacementModal>
        );
    }

    return (
        <PlacementModal open labelledBy="placement-modal-title" describedBy="placement-modal-body" padding="32px 32px 44px" align="stretch" onClose={onClose}>
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "24px" }}>
                <ModalHeading title="Apply for this Job" subtitle="Fill below details to easy apply to this job." />
                <ApplyStepper step={step} total={APPLY_STEPS.length} />
            </Box>

            <FormCard title={APPLY_STEPS[step]}>
                {step === 0 && (
                    <>
                        <FormField label="First Name" value={form.basic.firstName} onChange={set("basic", "firstName")} />
                        <Row>
                            <FormField label="WhatsApp Number" type="tel" value={form.basic.whatsapp} onChange={set("basic", "whatsapp")} />
                            <FormField label="Email" type="email" value={form.basic.email} onChange={set("basic", "email")} />
                        </Row>
                    </>
                )}
                {step === 1 && (
                    <Box role="radiogroup" aria-label="Choose a resume" sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        {resumes.map((resume) => (
                            <ResumeOption
                                key={resume.id}
                                name={resume.name}
                                size={resume.size}
                                selected={form.resumeId === resume.id}
                                onSelect={() => setForm((f) => ({ ...f, resumeId: resume.id }))}
                            />
                        ))}
                    </Box>
                )}
                {step === 2 && (
                    <>
                        <FormField label="Your Title" value={form.experience.title} onChange={set("experience", "title")} />
                        <FormField label="Company" value={form.experience.company} onChange={set("experience", "company")} />
                        <SubLabel>Date of Employment</SubLabel>
                        <Row>
                            <FormField label="From" value={form.experience.from} onChange={set("experience", "from")} />
                            <FormField label="To" value={form.experience.to} onChange={set("experience", "to")} />
                        </Row>
                        <SubLabel>Location</SubLabel>
                        <FormField label="City" value={form.experience.city} onChange={set("experience", "city")} />
                        <FormField label="Description" multiline value={form.experience.description} onChange={set("experience", "description")} placeholder="What did you work on?" />
                    </>
                )}
                {step === 3 && (
                    <>
                        <FormField label="School" value={form.education.school} onChange={set("education", "school")} />
                        <FormField label="Degree" value={form.education.degree} onChange={set("education", "degree")} />
                        <FormField label="Major/Field of Study" value={form.education.major} onChange={set("education", "major")} />
                        <SubLabel>Date attended</SubLabel>
                        <Row>
                            <FormField label="From" value={form.education.from} onChange={set("education", "from")} />
                            <FormField label="To" value={form.education.to} onChange={set("education", "to")} />
                        </Row>
                    </>
                )}
                {step === 4 && (
                    <>
                        {ADDITIONAL_QUESTIONS.map((q) => (
                            <FormField
                                key={q.id}
                                label={q.label}
                                value={form.answers[q.id] ?? ""}
                                placeholder="Type your answer"
                                onChange={(value) => setForm((f) => ({ ...f, answers: { ...f.answers, [q.id]: value } }))}
                            />
                        ))}
                        <VideoUpload file={form.video} onFile={(video) => setForm((f) => ({ ...f, video }))} />
                    </>
                )}
            </FormCard>

            <Box sx={{ position: "relative", display: "flex", gap: "16px" }}>
                {step > 0 && (
                    <OutlineButton borderWidth={2} onClick={() => setStep((s) => s - 1)} sx={{ mt: "8px", width: 120 }}>
                        Back
                    </OutlineButton>
                )}
                <Box sx={{ flex: 1 }}>
                    <ModalAction label={last ? "Submit" : "Next"} onClick={next} disabled={!valid} />
                </Box>
            </Box>
        </PlacementModal>
    );
}

// ─── Resume gate ───────────────────────────────────────────────────────────
function BuildResumeModal({ onClose }: { onClose: () => void }) {
    const router = useRouter();
    return (
        <PlacementModal open labelledBy="placement-modal-title" describedBy="placement-modal-body" onClose={onClose}>
            <ModalHero
                title="Build your resume to apply"
                lines={["You need an approved resume before you can apply for placement opportunities. Create your resume and submit it for review by the Placement Team."]}
            />
            <LmsButton
                onClick={() => {
                    onClose();
                    router.push(PLACEMENT_ROUTES.resume);
                }}
                sx={{ width: "100%" }}
            >
                Build Resume
            </LmsButton>
        </PlacementModal>
    );
}

// ─── Request a job ─────────────────────────────────────────────────────────
const MAX_LOCATIONS = 3;

function LocationPicker({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const remaining = REQUEST_LOCATIONS.filter((l) => !value.includes(l));
    const canAdd = value.length < MAX_LOCATIONS;

    const menu = (
        <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)} slotProps={{ paper: { sx: { ...dropdownPaperSx, maxHeight: 280 } } }}>
            {remaining.map((city) => (
                <MenuItem
                    key={city}
                    sx={dropdownItemSx}
                    onClick={() => {
                        onChange([...value, city]);
                        setAnchor(null);
                    }}
                >
                    {city}
                </MenuItem>
            ))}
        </Menu>
    );

    if (!value.length) {
        return (
            <>
                <ButtonBase
                    aria-haspopup="listbox"
                    onClick={(event) => setAnchor(event.currentTarget)}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        width: "100%",
                        minHeight: 63,
                        p: "12px",
                        borderRadius: "12px",
                        bgcolor: PL.inputBg,
                        border: `1px solid ${PL.inputBorder}`,
                        textAlign: "left",
                    }}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <Typography component="span" sx={{ ...PTEXT.reg12, color: PL.n300 }}>
                            Location
                        </Typography>
                        <Typography component="span" sx={{ ...PTEXT.med16, color: PL.n400 }}>
                            Select upto 3 preferred location
                        </Typography>
                    </Box>
                    <Asset name="icon-chevron-down-20.svg" width={20} height={20} />
                </ButtonBase>
                {menu}
            </>
        );
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Typography sx={{ ...PTEXT.reg12, color: PL.n300 }}>Location</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {value.map((city) => (
                    <RemovablePill key={city} label={city} small filled onRemove={() => onChange(value.filter((c) => c !== city))} />
                ))}
                {canAdd && (
                    <ButtonBase
                        onClick={(event) => setAnchor(event.currentTarget)}
                        sx={{ px: "12px", py: "8px", borderRadius: "50px", border: "1px dashed rgba(140,36,255,0.4)", ...PTEXT.med12, color: PL.n200 }}
                    >
                        + Add
                    </ButtonBase>
                )}
            </Box>
            {menu}
        </Box>
    );
}

function RequestJobModal({ onClose }: { onClose: () => void }) {
    const { notify } = usePlacement();
    const [profile, setProfile] = useState("Product Designer");
    const [locations, setLocations] = useState<string[]>([]);
    const [experience, setExperience] = useState("3");
    const [jobTypes, setJobTypes] = useState<string[]>(["Work from home"]);
    const [salary, setSalary] = useState<[number, number]>([10, 30]);

    const valid = profile.trim() && locations.length > 0 && jobTypes.length > 0;
    const setBound = (index: 0 | 1) => (raw: string) => {
        const n = Math.max(SALARY_RANGE.min, Math.min(SALARY_RANGE.max, Number(raw.replace(/\D/g, "")) || 0));
        setSalary((s) => (index === 0 ? [Math.min(n, s[1]), s[1]] : [s[0], Math.max(n, s[0])]));
    };

    return (
        <PlacementModal open labelledBy="placement-modal-title" describedBy="placement-modal-body" width={683} gap="32px" align="stretch" onClose={onClose}>
            <ModalHeading title="Request Job" subtitle="Fill below details to easy apply to this job." />
            <FormCard>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <FormField label="Job Profile" value={profile} onChange={setProfile} />
                    <LocationPicker value={locations} onChange={setLocations} />
                    <FormField label="Years of Experience" type="number" value={experience} onChange={setExperience} />

                    <Box role="group" aria-label="Job Type" sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Typography sx={{ ...PTEXT.reg12, color: PL.n300 }}>Job Type</Typography>
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            {REQUEST_JOB_TYPES.map((type) => {
                                const checked = jobTypes.includes(type);
                                return (
                                    <ButtonBase
                                        key={type}
                                        role="checkbox"
                                        aria-checked={checked}
                                        onClick={() => setJobTypes((t) => (checked ? t.filter((x) => x !== type) : [...t, type]))}
                                        sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "16px" }}
                                    >
                                        <CheckBox checked={checked} />
                                        <Typography sx={{ ...PTEXT.med16, color: PL.white }}>{type}</Typography>
                                    </ButtonBase>
                                );
                            })}
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <Typography id="salary-label" sx={{ ...PTEXT.reg12, color: PL.n300 }}>
                            Annual salary (in lakhs)
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <Box sx={{ px: "12px" }}>
                                <Slider
                                    aria-labelledby="salary-label"
                                    value={salary}
                                    min={SALARY_RANGE.min}
                                    max={SALARY_RANGE.max}
                                    disableSwap
                                    onChange={(_, value) => setSalary(value as [number, number])}
                                    sx={{
                                        height: 10,
                                        p: "7px 0 !important",
                                        mx: "-12px",
                                        width: "calc(100% + 24px)",
                                        "& .MuiSlider-rail": { bgcolor: "#C0DBFB", opacity: 1, borderRadius: "5px" },
                                        "& .MuiSlider-track": { bgcolor: "#2280EF", border: "none", borderRadius: "5px" },
                                        "& .MuiSlider-thumb": {
                                            width: 24,
                                            height: 24,
                                            bgcolor: "#2280EF",
                                            border: "4px solid #FFFFFF",
                                            boxShadow: "none",
                                            "&:hover, &.Mui-focusVisible, &.Mui-active": { boxShadow: "0 0 0 6px rgba(34,128,239,0.24)" },
                                        },
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                {([0, 1] as const).map((i) => (
                                    <React.Fragment key={i}>
                                        {i === 1 && <Box aria-hidden sx={{ width: 8, height: "1px", bgcolor: "#8B8B8B", borderRadius: "1px", flexShrink: 0 }} />}
                                        <Box
                                            component="input"
                                            inputMode="numeric"
                                            aria-label={i === 0 ? "Minimum salary" : "Maximum salary"}
                                            value={salary[i]}
                                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setBound(i)(event.target.value)}
                                            sx={{
                                                flex: 1,
                                                minWidth: 0,
                                                px: "12px",
                                                py: "8px",
                                                borderRadius: "12px",
                                                bgcolor: PL.inputBg,
                                                border: `1px solid ${PL.inputBorder}`,
                                                ...PTEXT.med16,
                                                color: PL.n100,
                                                outline: "none",
                                                "&:focus": { borderColor: PL.primary },
                                            }}
                                        />
                                    </React.Fragment>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </FormCard>
            <ModalAction
                label="Request"
                disabled={!valid}
                onClick={() => {
                    onClose();
                    notify("Your job request has been sent to the Placement Team.");
                }}
            />
        </PlacementModal>
    );
}

// ─── Confirm (withdraw / decline) ──────────────────────────────────────────
export function ConfirmModal({
    open,
    title,
    body,
    confirmLabel,
    onConfirm,
    onClose,
}: {
    open: boolean;
    title: string;
    body: string;
    confirmLabel: string;
    onConfirm: () => void;
    onClose: () => void;
}) {
    return (
        <PlacementModal open={open} labelledBy="placement-modal-title" describedBy="placement-modal-body" gap="32px" align="stretch" onClose={onClose}>
            <ModalHeading title={title} subtitle={body} />
            <Box sx={{ position: "relative", display: "flex", flexDirection: { xs: "column-reverse", sm: "row" }, gap: { xs: "12px", sm: "24px" } }}>
                <OutlineButton borderWidth={2} onClick={onClose} sx={{ flex: 1 }}>
                    Cancel
                </OutlineButton>
                <ButtonBase
                    onClick={onConfirm}
                    sx={{ flex: 1, height: 44, borderRadius: "10px", bgcolor: PL.errorFill, ...PTEXT.interMed14, color: PL.white, "&:hover": { bgcolor: PL.error } }}
                >
                    {confirmLabel}
                </ButtonBase>
            </Box>
        </PlacementModal>
    );
}

// ─── Flow host ─────────────────────────────────────────────────────────────
/** Mounts the apply / resume-gate / request modals and the confirmation toast for every Placement page. */
export function PlacementFlows() {
    const { applyJobId, closeApply, hasApprovedResume, requestOpen, setRequestOpen, notice, notify } = usePlacement();
    return (
        <>
            {applyJobId && (hasApprovedResume ? <ApplyJobModal key={applyJobId} jobId={applyJobId} onClose={closeApply} /> : <BuildResumeModal onClose={closeApply} />)}
            {requestOpen && <RequestJobModal onClose={() => setRequestOpen(false)} />}
            <Snackbar
                open={!!notice}
                autoHideDuration={4000}
                onClose={() => notify(null)}
                message={notice}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                slotProps={{
                    content: {
                        sx: { bgcolor: "#0B0F1F", color: PL.n75, border: `1px solid ${PL.primary}`, borderRadius: "12px", ...PTEXT.med14 },
                    },
                }}
            />
        </>
    );
}
