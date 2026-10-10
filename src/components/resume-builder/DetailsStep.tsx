"use client";

import React, { useRef, useState } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import {
    AchievementEntry,
    DetailsTab,
    EducationEntry,
    ExperienceEntry,
    OtherEntry,
    PersonalDetails,
    ProjectEntry,
    ResumeContent,
    ResumeLink,
    SKILL_GROUP_COPY,
    SUMMARY_WORD_LIMIT,
    SkillGroup,
    blankAchievement,
    blankEducation,
    blankExperience,
    blankOther,
    blankProject,
    displayToIsoDate,
    isoToDisplayDate,
    uid,
} from "./resume-data";
import { ResumePhoto } from "./ResumeDocument";
import { SkillsModal } from "./ResumeModals";
import { RichTextField } from "./RichTextField";
import { AddButton, EntryCard, FieldRow, GlassPill, RB, RTEXT, RbField, RbIcon, SectionLabel, SkillPill } from "./rb-ui";

type Update = (updater: (content: ResumeContent) => ResumeContent) => void;

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;
const EXTRA_LINK_LABELS = ["Portfolio URL", "GitHub URL", "Website URL"];

// ─── Personal ──────────────────────────────────────────────────────────────
function InfoAlert({ onClose }: { onClose: () => void }) {
    return (
        <Box role="status" sx={{ display: "flex", alignItems: "flex-start", gap: "12px", px: "16px", py: "12px", borderRadius: "4px", bgcolor: RB.infoBg, border: `1px solid ${RB.infoBorder}`, width: "100%" }}>
            <Typography sx={{ ...RTEXT.med14, color: RB.infoText, flex: 1, minWidth: 0 }}>
                Some of your details was fetched from your profile. However, If you want to edit your details you can still edit them for this resume.
            </Typography>
            <ButtonBase aria-label="Dismiss" onClick={onClose} sx={{ borderRadius: "4px", "&:hover": { opacity: 0.7 } }}>
                <RbIcon name="icon-x-info.svg" size={20} />
            </ButtonBase>
        </Box>
    );
}

function PersonalTab({ personal, onChange, notify }: { personal: PersonalDetails; onChange: (next: PersonalDetails) => void; notify: (message: string) => void }) {
    const [showInfo, setShowInfo] = useState(true);
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const fileRef = useRef<HTMLInputElement | null>(null);
    const set = (patch: Partial<PersonalDetails>) => onChange({ ...personal, ...patch });
    const setLink = (id: string, patch: Partial<ResumeLink>) => set({ links: personal.links.map((l) => (l.id === id ? { ...l, ...patch } : l)) });

    const errors = {
        fullName: !personal.fullName.trim() ? "Full name is required" : "",
        email: !personal.email.trim() ? "Email is required" : !EMAIL_RE.test(personal.email.trim()) ? "Enter a valid email address" : "",
        phone: personal.phone.trim() && !PHONE_RE.test(personal.phone.trim()) ? "Enter a valid phone number" : "",
    };
    const errorFor = (key: keyof typeof errors) => (touched[key] ? errors[key] || undefined : undefined);
    const blur = (key: string) => () => setTouched((t) => ({ ...t, [key]: true }));

    const pickPhoto = (file: File | undefined) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) return notify("Please choose an image file");
        if (file.size > MAX_PHOTO_BYTES) return notify("Image must be smaller than 5 MB");
        const reader = new FileReader();
        reader.onload = () => set({ photoUrl: String(reader.result) });
        reader.readAsDataURL(file);
    };

    const addLink = () => {
        const label = EXTRA_LINK_LABELS[personal.links.length - 1] ?? `Link ${personal.links.length + 1}`;
        set({ links: [...personal.links, { id: uid("link"), label: personal.links.length ? label : "LinkedIn URL", url: "" }] });
    };

    return (
        <>
            {showInfo && <InfoAlert onClose={() => setShowInfo(false)} />}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <SectionLabel>Upload your image</SectionLabel>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                    <ResumePhoto url={personal.photoUrl} size={147} sx={{ border: "1.804px solid rgba(191,191,191,0.24)" }} />
                    <Box sx={{ display: "flex", gap: "12px" }}>
                        <GlassPill onClick={() => set({ photoUrl: null })} disabled={!personal.photoUrl} sx={{ "&.Mui-disabled": { opacity: 0.5, color: RB.white } }}>
                            Remove
                        </GlassPill>
                        <GlassPill filled onClick={() => fileRef.current?.click()}>
                            {personal.photoUrl ? "Change Image" : "Upload Image"}
                        </GlassPill>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(event) => {
                                pickPhoto(event.target.files?.[0]);
                                event.target.value = "";
                            }}
                        />
                    </Box>
                </Box>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <SectionLabel>Personal details</SectionLabel>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <RbField label="Your Full Name" value={personal.fullName} onChange={(fullName) => set({ fullName })} onBlur={blur("fullName")} error={errorFor("fullName")} inputProps={{ autoComplete: "name" }} />
                    <FieldRow>
                        <RbField label="Phone no." value={personal.phone} onChange={(phone) => set({ phone })} onBlur={blur("phone")} error={errorFor("phone")} type="tel" inputProps={{ autoComplete: "tel" }} />
                        <RbField label="Email" value={personal.email} onChange={(email) => set({ email })} onBlur={blur("email")} error={errorFor("email")} type="email" inputProps={{ autoComplete: "email" }} />
                    </FieldRow>
                    <RbField label="Location" value={personal.location} onChange={(location) => set({ location })} inputProps={{ autoComplete: "address-level2" }} />
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                        <SectionLabel>Additional links</SectionLabel>
                        <AddButton small label="Add Link" onClick={addLink} />
                    </Box>
                    {personal.links.map((link, i) => (
                        <Box key={link.id} sx={{ position: "relative" }}>
                            <RbField label={link.label} value={link.url} onChange={(url) => setLink(link.id, { url })} type="url" placeholder="https://" sx={i > 0 ? { "& label": { pr: "40px" } } : undefined} />
                            {i > 0 && (
                                <ButtonBase
                                    aria-label={`Remove ${link.label}`}
                                    onClick={() => set({ links: personal.links.filter((l) => l.id !== link.id) })}
                                    sx={{ position: "absolute", right: 12, top: 21, borderRadius: "50%", "&:hover": { opacity: 0.7 } }}
                                >
                                    <RbIcon name="icon-x-20.svg" size={20} />
                                </ButtonBase>
                            )}
                        </Box>
                    ))}
                </Box>
            </Box>
        </>
    );
}

// ─── Summary ───────────────────────────────────────────────────────────────
function SummaryTab({ summary, content, onChange }: { summary: string; content: ResumeContent; onChange: (html: string) => void }) {
    const latest = content.experience.find((e) => e.role.trim());
    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <SectionLabel>Profile summary</SectionLabel>
                <Typography sx={{ ...RTEXT.med14, color: RB.n100 }}>
                    Write 2-4 short &amp; energetic sentences to interest the reader! Mention your role &amp; most importantly - your biggest achievements, best qualities and skills.
                </Typography>
            </Box>
            <RichTextField
                variant="summary"
                value={summary}
                onChange={onChange}
                placeholder="Start typing here..."
                wordLimit={SUMMARY_WORD_LIMIT}
                aiContext={{ section: "summary", hints: [latest?.role ?? "", ...content.skills.technical.slice(0, 3)] }}
            />
        </>
    );
}

// ─── Repeating sections ────────────────────────────────────────────────────
function EntryList<T extends { id: string }>({
    items,
    label,
    titleOf,
    addLabel,
    create,
    onChange,
    children,
}: {
    items: T[];
    label: string;
    titleOf: (item: T) => string;
    addLabel: string;
    create: () => T;
    onChange: (items: T[]) => void;
    children: (item: T, patch: (p: Partial<T>) => void) => React.ReactNode;
}) {
    const [expandedId, setExpandedId] = useState<string | null>(items[items.length - 1]?.id ?? null);
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {items.map((item, i) => (
                    <EntryCard
                        key={item.id}
                        label={`${label} ${i + 1}`}
                        title={titleOf(item)}
                        expanded={expandedId === item.id}
                        onToggle={() => setExpandedId((id) => (id === item.id ? null : item.id))}
                        onDelete={items.length > 1 ? () => onChange(items.filter((x) => x.id !== item.id)) : undefined}
                    >
                        {children(item, (p) => onChange(items.map((x) => (x.id === item.id ? { ...x, ...p } : x))))}
                    </EntryCard>
                ))}
            </Box>
            <Box>
                <AddButton
                    label={addLabel}
                    onClick={() => {
                        const next = create();
                        onChange([...items, next]);
                        setExpandedId(next.id);
                    }}
                />
            </Box>
        </Box>
    );
}

/** DD/MM/YY text input that stores an ISO date. */
function DateField({ label, value, onChange, error }: { label: string; value: string; onChange: (iso: string) => void; error?: string }) {
    const [text, setText] = useState(isoToDisplayDate(value));
    const [invalid, setInvalid] = useState(false);
    const [lastValue, setLastValue] = useState(value);
    if (value !== lastValue) {
        setLastValue(value);
        setText(isoToDisplayDate(value));
    }
    return (
        <RbField
            label={label}
            value={text}
            placeholder="DD/MM/YY"
            inputProps={{ inputMode: "numeric", maxLength: 10 }}
            error={invalid ? "Use the DD/MM/YY format" : error}
            onChange={(next) => {
                setText(next);
                setInvalid(false);
                const iso = displayToIsoDate(next);
                if (iso) onChange(iso);
                else if (!next.trim()) onChange("");
            }}
            onBlur={() => setInvalid(!!text.trim() && !displayToIsoDate(text))}
        />
    );
}

const rangeError = (start: string, end: string) => (start && end && end < start ? "End date must be after the start date" : undefined);

const yearInput = { inputMode: "numeric" as const, maxLength: 4, pattern: "\\d{4}" };

function EducationTab({ items, onChange }: { items: EducationEntry[]; onChange: (items: EducationEntry[]) => void }) {
    return (
        <EntryList items={items} label="Education" titleOf={(e) => e.institution} addLabel="Add more education" create={blankEducation} onChange={onChange}>
            {(e, patch) => (
                <>
                    <RbField label="Institution / Training Provider" value={e.institution} onChange={(institution) => patch({ institution })} />
                    <FieldRow>
                        <RbField label="Qualification" value={e.qualification} onChange={(qualification) => patch({ qualification })} />
                        <RbField label="Field of Study" value={e.fieldOfStudy} onChange={(fieldOfStudy) => patch({ fieldOfStudy })} />
                    </FieldRow>
                    <FieldRow>
                        <RbField label="Year of Completion" value={e.yearOfCompletion} onChange={(v) => patch({ yearOfCompletion: v.replace(/\D/g, "") })} inputProps={yearInput} />
                        <RbField label="Grade / Result" value={e.grade} onChange={(grade) => patch({ grade })} />
                    </FieldRow>
                    <RichTextField
                        label="Description"
                        value={e.description}
                        onChange={(description) => patch({ description })}
                        placeholder="eg. Graduated with high honors."
                        aiContext={{ section: "education", hints: [e.qualification, e.fieldOfStudy, e.institution] }}
                    />
                </>
            )}
        </EntryList>
    );
}

function AchievementsTab({ items, onChange }: { items: AchievementEntry[]; onChange: (items: AchievementEntry[]) => void }) {
    return (
        <EntryList items={items} label="Achievement" titleOf={(a) => a.certificationName} addLabel="Add more Achievements" create={blankAchievement} onChange={onChange}>
            {(a, patch) => (
                <>
                    <RbField label="Certification Name" value={a.certificationName} onChange={(certificationName) => patch({ certificationName })} />
                    <FieldRow>
                        <RbField label="Year of Completion" value={a.yearOfCompletion} onChange={(v) => patch({ yearOfCompletion: v.replace(/\D/g, "") })} inputProps={yearInput} />
                        <RbField label="Organisation" value={a.organisation} onChange={(organisation) => patch({ organisation })} />
                    </FieldRow>
                    <RbField label="Credential ID/Link (Optional)" value={a.credential} onChange={(credential) => patch({ credential })} />
                    <RichTextField
                        label="Description (Optional)"
                        value={a.description}
                        onChange={(description) => patch({ description })}
                        placeholder="eg. Graduated with high honors."
                        aiContext={{ section: "achievements", hints: [a.certificationName, a.organisation] }}
                    />
                </>
            )}
        </EntryList>
    );
}

function ProjectsTab({ items, onChange }: { items: ProjectEntry[]; onChange: (items: ProjectEntry[]) => void }) {
    return (
        <EntryList items={items} label="Project" titleOf={(p) => p.name} addLabel="Add more Project" create={blankProject} onChange={onChange}>
            {(p, patch) => (
                <>
                    <RbField label="Project Name" value={p.name} onChange={(name) => patch({ name })} />
                    <RichTextField
                        label="Description"
                        value={p.description}
                        onChange={(description) => patch({ description })}
                        placeholder="eg. Graduated with high honors."
                        aiContext={{ section: "projects", hints: [p.name] }}
                    />
                </>
            )}
        </EntryList>
    );
}

function ExperienceTab({ items, onChange }: { items: ExperienceEntry[]; onChange: (items: ExperienceEntry[]) => void }) {
    return (
        <EntryList items={items} label="Experience" titleOf={(e) => e.company} addLabel="Add more Experience" create={blankExperience} onChange={onChange}>
            {(e, patch) => (
                <>
                    <RbField label="Company / Organisation Name" value={e.company} onChange={(company) => patch({ company })} />
                    <RbField label="Role / Title" value={e.role} onChange={(role) => patch({ role })} />
                    <FieldRow>
                        <DateField label="Start Date" value={e.startDate} onChange={(startDate) => patch({ startDate })} />
                        <DateField label="End Date" value={e.endDate} onChange={(endDate) => patch({ endDate })} error={rangeError(e.startDate, e.endDate)} />
                    </FieldRow>
                    <RichTextField
                        label="Responsibilities & Achievements"
                        value={e.description}
                        onChange={(description) => patch({ description })}
                        placeholder="Describe your roles and responsibilities"
                        aiContext={{ section: "experience", hints: [e.role, e.company] }}
                    />
                </>
            )}
        </EntryList>
    );
}

function OtherTab({ items, onChange }: { items: OtherEntry[]; onChange: (items: OtherEntry[]) => void }) {
    return (
        <EntryList items={items} label="Other" titleOf={(o) => o.title} addLabel="Add more" create={blankOther} onChange={onChange}>
            {(o, patch) => (
                <>
                    <RbField label="Title" value={o.title} onChange={(title) => patch({ title })} />
                    <RbField label="Link" value={o.link} onChange={(link) => patch({ link })} type="url" />
                    <FieldRow>
                        <DateField label="Start Date" value={o.startDate} onChange={(startDate) => patch({ startDate })} />
                        <DateField label="End Date" value={o.endDate} onChange={(endDate) => patch({ endDate })} error={rangeError(o.startDate, o.endDate)} />
                    </FieldRow>
                    <RichTextField
                        label="Description"
                        value={o.description}
                        onChange={(description) => patch({ description })}
                        placeholder="Describe your roles and responsibilities"
                        aiContext={{ section: "other", hints: [o.title] }}
                    />
                </>
            )}
        </EntryList>
    );
}

// ─── Skills ────────────────────────────────────────────────────────────────
function SkillsTab({ skills, onChange }: { skills: ResumeContent["skills"]; onChange: (skills: ResumeContent["skills"]) => void }) {
    const [picker, setPicker] = useState<SkillGroup | null>(null);
    return (
        <>
            {(["technical", "tools"] as const).map((group) => {
                const copy = SKILL_GROUP_COPY[group];
                return (
                    <Box key={group} sx={{ display: "flex", flexDirection: "column", gap: "24px", mb: group === "technical" ? "8px" : 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                            <SectionLabel>{copy.label}</SectionLabel>
                            <AddButton label={copy.add} onClick={() => setPicker(group)} />
                        </Box>
                        {skills[group].length ? (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                                {skills[group].map((skill) => (
                                    <SkillPill key={skill} label={skill} onRemove={() => onChange({ ...skills, [group]: skills[group].filter((s) => s !== skill) })} />
                                ))}
                            </Box>
                        ) : (
                            <Typography sx={{ ...RTEXT.med14, color: RB.n500 }}>Nothing added yet. Use “{copy.add}” to pick from the list.</Typography>
                        )}
                    </Box>
                );
            })}
            {picker && (
                <SkillsModal
                    open
                    group={picker}
                    selected={skills[picker]}
                    onClose={() => setPicker(null)}
                    onSave={(next) => {
                        onChange({ ...skills, [picker]: next });
                        setPicker(null);
                    }}
                />
            )}
        </>
    );
}

// ─── Tab switch ────────────────────────────────────────────────────────────
export function DetailsTabContent({ tab, content, update, notify }: { tab: DetailsTab; content: ResumeContent; update: Update; notify: (message: string) => void }) {
    switch (tab) {
        case "personal":
            return <PersonalTab personal={content.personal} onChange={(personal) => update((c) => ({ ...c, personal }))} notify={notify} />;
        case "summary":
            return <SummaryTab summary={content.summary} content={content} onChange={(summary) => update((c) => ({ ...c, summary }))} />;
        case "education":
            return <EducationTab items={content.education} onChange={(education) => update((c) => ({ ...c, education }))} />;
        case "achievements":
            return <AchievementsTab items={content.achievements} onChange={(achievements) => update((c) => ({ ...c, achievements }))} />;
        case "skills":
            return <SkillsTab skills={content.skills} onChange={(skills) => update((c) => ({ ...c, skills }))} />;
        case "projects":
            return <ProjectsTab items={content.projects} onChange={(projects) => update((c) => ({ ...c, projects }))} />;
        case "experience":
            return <ExperienceTab items={content.experience} onChange={(experience) => update((c) => ({ ...c, experience }))} />;
        case "other":
            return <OtherTab items={content.other} onChange={(other) => update((c) => ({ ...c, other }))} />;
    }
}
