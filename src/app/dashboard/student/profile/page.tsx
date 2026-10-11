"use client";

import React, { useEffect, useState } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import CreateRequestModal from "@/components/requests/CreateRequestModal";
import {
    findStudentAddress,
    isEducationDocument,
    useStudent,
    type ParentDetails,
    type StudentAddress,
    type StudentProfile,
} from "@/contexts/StudentContext";
import { EMPTY, PC, formatDate, formatDob, formatPhone, initialsOf, profileAsset } from "@/components/profile/profile-data";
import { CardTitle, FieldRow, GlassCard, InfoField, PIcon, PT, SectionPill, VerifiedMark } from "@/components/profile/profile-ui";
import { ProfileError, ProfileLoading } from "@/components/profile/ProfileStates";
import VerifyParentPhoneModal from "@/components/profile/VerifyParentPhoneModal";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";

const titleCase = (value: string | null | undefined) =>
    value ? value.trim().toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase()) : EMPTY;

function UnverifiedMark({ label }: { label?: string }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }} title="Not verified">
            <PIcon name="icon-alert-triangle.svg" size={16} />
            {label && <Typography sx={{ ...PT.med12, color: PC.warning500, whiteSpace: "nowrap" }}>{label}</Typography>}
        </Box>
    );
}

function VerifiedCount({ verified, total }: { verified: number; total: number }) {
    if (total === 0) return null;
    if (verified >= total) {
        return <Typography sx={{ ...PT.med12, color: PC.primary75, whiteSpace: "nowrap" }}>{`${verified}/${total} verified`}</Typography>;
    }
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <PIcon name="icon-alert-triangle-14.svg" size={14} />
            <Typography sx={{ ...PT.med12, color: PC.warning500, whiteSpace: "nowrap" }}>{`${verified}/${total} verified`}</Typography>
        </Box>
    );
}

function EditDetailsButton({ onClick }: { onClick: () => void }) {
    return (
        <ButtonBase
            onClick={onClick}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                height: 32,
                px: "12px",
                borderRadius: "99px",
                flexShrink: 0,
                "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
            }}
        >
            <PIcon name="icon-edit.svg" size={20} />
            <Typography component="span" sx={{ ...PT.med14, color: PC.n200, whiteSpace: "nowrap" }}>
                Edit Details
            </Typography>
        </ButtonBase>
    );
}

function PillRow({ pill, aside }: { pill: string; aside?: React.ReactNode }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", width: "100%" }}>
            <SectionPill>{pill}</SectionPill>
            {aside}
        </Box>
    );
}

// ─── Left column ───────────────────────────────────────────────────────────
function Avatar({ name, photo }: { name: string; photo: string | null }) {
    const [failed, setFailed] = useState(false);
    return (
        <Box
            sx={{
                position: "absolute",
                top: 30,
                left: "calc(50% - 0.5px)",
                transform: "translateX(-50%)",
                width: 147,
                height: 147,
                borderRadius: "50%",
                overflow: "hidden",
                bgcolor: "#BBC9ED",
                border: "1.8px solid rgba(191,191,191,0.24)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {photo && !failed ? (
                <Box component="img" src={photo} alt={name} onError={() => setFailed(true)} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
                <Typography aria-label={name} sx={{ ...PT.poppinsBold32, fontSize: "48px", color: PC.primary500 }}>
                    {initialsOf(name)}
                </Typography>
            )}
        </Box>
    );
}

function BasicDetailsCard({ profile, onEdit }: { profile: StudentProfile; onEdit: () => void }) {
    return (
        <GlassCard>
            <CardTitle action={<EditDetailsButton onClick={onEdit} />}>Basic Details</CardTitle>
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "71px" }}>
                {/* Gradient banner with the avatar overlapping its bottom edge. */}
                <Box sx={{ position: "relative", height: 125, borderRadius: "16px", border: "1px solid rgba(191,191,191,0.44)" }}>
                    <Box sx={{ position: "absolute", inset: 0, borderRadius: "16px", overflow: "hidden" }}>
                        <Box
                            component="img"
                            src={profileAsset("banner-gradient.png")}
                            alt=""
                            aria-hidden
                            sx={{ position: "absolute", left: "-0.49%", top: "-238.3%", width: "101.23%", height: "436.17%", maxWidth: "none" }}
                        />
                    </Box>
                    <Avatar name={profile.studentName} photo={profile.studentPhoto} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <Typography sx={{ ...PT.poppinsSemi20, color: PC.white, textAlign: "center" }}>{profile.studentName}</Typography>
                    <FieldRow sx={{ flexDirection: "row" }}>
                        <InfoField label="Gender" value={titleCase(profile.gender)} />
                        <InfoField label="Date of Birth" value={formatDob(profile.dateOfBirth)} />
                    </FieldRow>
                </Box>
            </Box>
        </GlassCard>
    );
}

function ContactDetailsCard({ profile }: { profile: StudentProfile }) {
    const phoneVerified = Boolean(profile.isPhoneNumberVerified);
    const emailVerified = Boolean(profile.isEmailVerified);
    const total = 1 + (profile.email ? 1 : 0);
    const verified = (phoneVerified ? 1 : 0) + (profile.email && emailVerified ? 1 : 0);
    const whatsapp = profile.whatsappNumber ?? null;
    return (
        <GlassCard>
            <CardTitle>Contact Details</CardTitle>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <PillRow pill="Primary Details" aside={<VerifiedCount verified={verified} total={total} />} />
                    <FieldRow>
                        <InfoField
                            label="Phone Number"
                            value={formatPhone(profile.callingCode, profile.phoneNumber)}
                            trailing={phoneVerified ? <VerifiedMark /> : <UnverifiedMark />}
                        />
                        <InfoField
                            label="Email"
                            value={profile.email || EMPTY}
                            trailing={profile.email ? emailVerified ? <VerifiedMark /> : <UnverifiedMark /> : undefined}
                        />
                    </FieldRow>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <PillRow pill="WhatsApp Details" />
                    <InfoField
                        label="WhatsApp Number"
                        value={whatsapp ? formatPhone(profile.whatsappCallingCode ?? profile.callingCode, whatsapp) : "Not added"}
                        trailing={whatsapp ? profile.isWhatsappNumberVerified ? <VerifiedMark /> : <UnverifiedMark /> : undefined}
                    />
                </Box>
            </Box>
        </GlassCard>
    );
}

function StatusChip({ verified, pendingLabel }: { verified: boolean; pendingLabel: string }) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                px: "16px",
                py: "8px",
                borderRadius: "99px",
                border: `1px solid ${verified ? PC.success500 : PC.warning500}`,
            }}
        >
            {verified ? <VerifiedMark label="Verified" /> : <UnverifiedMark label={pendingLabel} />}
        </Box>
    );
}

function AadharCard({ profile }: { profile: StudentProfile }) {
    const aadhaar = profile.studentAdhaarDatas.find((a) => a.isVerified) ?? profile.studentAdhaarDatas[0] ?? null;
    return (
        <GlassCard>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
                    <Box component="img" src={profileAsset("icon-lock-3d.png")} alt="" aria-hidden sx={{ width: 44, height: 44, flexShrink: 0, objectFit: "cover" }} />
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                        <Typography component="h2" sx={{ ...PT.poppinsSemi20, color: PC.white, whiteSpace: "nowrap" }}>
                            Aadhar Details
                        </Typography>
                        <Typography sx={{ ...PT.med16, color: PC.n100, whiteSpace: "nowrap" }}>{aadhaar?.adhaarNumber ?? "Not added"}</Typography>
                    </Box>
                </Box>
                {aadhaar && <StatusChip verified={aadhaar.isVerified} pendingLabel="Pending" />}
            </Box>
        </GlassCard>
    );
}

function PasswordCard({ profile, onChange }: { profile: StudentProfile; onChange: () => void }) {
    const subtitle = !profile.hasPassword
        ? "No password set — you sign in with OTP"
        : profile.passwordUpdatedAt
            ? `Last updated on ${formatDate(profile.passwordUpdatedAt)}`
            : "Set by your relationship manager";
    return (
        <GlassCard>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                    <Box component="img" src={profileAsset("icon-lock-3d.png")} alt="" aria-hidden sx={{ width: 40, height: 40, flexShrink: 0, objectFit: "cover" }} />
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "1.7px", minWidth: 0 }}>
                        <Typography component="h2" sx={{ ...PT.med18, color: PC.white }}>
                            Password
                        </Typography>
                        <Typography sx={{ ...PT.reg14, color: PC.n300 }}>{subtitle}</Typography>
                    </Box>
                </Box>
                <ButtonBase
                    onClick={onChange}
                    sx={{
                        px: "16px",
                        py: "8px",
                        borderRadius: "99px",
                        border: `1px solid ${PC.n600}`,
                        ...PT.med16,
                        color: PC.white,
                        whiteSpace: "nowrap",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                    }}
                >
                    {profile.hasPassword ? "Change Password" : "Set Password"}
                </ButtonBase>
            </Box>
        </GlassCard>
    );
}

// ─── Right column ──────────────────────────────────────────────────────────
function AcademicDetailsCard({ profile }: { profile: StudentProfile }) {
    const institute = profile.highestEducationInstitute?.trim() || null;
    const location = profile.highestEducationInstituteLocation?.trim() || null;
    const document = profile.studentDocuments.find(isEducationDocument) ?? null;
    return (
        <GlassCard>
            <CardTitle>Academic Details</CardTitle>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, gap: { xs: "20px", sm: "32px" } }}>
                <Box
                    aria-hidden
                    sx={{
                        width: 150,
                        height: 150,
                        flexShrink: 0,
                        borderRadius: "7.5px",
                        border: "1px solid #E3E5EB",
                        bgcolor: PC.white,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Typography sx={{ ...PT.poppinsBold32, fontSize: "44px", color: PC.primary500 }}>{institute ? initialsOf(institute) : EMPTY}</Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, width: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Typography sx={{ ...PT.poppinsMed20, color: PC.white }}>{institute ?? "Institute not added"}</Typography>
                        {location && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <PIcon name="icon-map-pin.svg" size={14} />
                                <Typography sx={{ ...PT.med14, color: PC.n200 }}>{location}</Typography>
                            </Box>
                        )}
                    </Box>
                    <Box component="img" src={profileAsset("divider-line.svg")} alt="" aria-hidden sx={{ display: "block", width: "100%", height: "1px" }} />
                    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: { xs: "20px", sm: "40px" } }}>
                        <Box sx={{ width: 172, display: "flex", flexDirection: "column", gap: "4px" }}>
                            <Typography sx={{ ...PT.reg12, color: PC.n300 }}>Your Highest Education</Typography>
                            <Typography sx={{ ...PT.med16, color: PC.white, minHeight: 32, display: "flex", alignItems: "center" }}>
                                {profile.highestEducation || EMPTY}
                            </Typography>
                        </Box>
                        <Box sx={{ minWidth: 172, maxWidth: "100%", display: "flex", flexDirection: "column", gap: "4px" }}>
                            <Typography sx={{ ...PT.reg12, color: PC.n300 }}>{document?.documentName ?? "Education Document"}</Typography>
                            {document ? (
                                <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <ButtonBase
                                        component="a"
                                        href={document.documentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ py: "4px", borderRadius: "99px", ...PT.med16, color: PC.white, textDecoration: "underline", whiteSpace: "nowrap" }}
                                    >
                                        View Document
                                    </ButtonBase>
                                    {document.isVerified ? <VerifiedMark /> : <UnverifiedMark />}
                                </Box>
                            ) : (
                                <Typography sx={{ ...PT.med16, color: PC.n400, minHeight: 32, display: "flex", alignItems: "center" }}>Not uploaded</Typography>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </GlassCard>
    );
}

function ParentsDetailsCard({ parent, onVerify }: { parent: ParentDetails | null; onVerify: () => void }) {
    const verified = Boolean(parent?.isContactVerified);
    const hasPhone = Boolean(parent?.parentPhoneNumber);
    return (
        <GlassCard>
            <CardTitle>Parents Details</CardTitle>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <PillRow pill="Primary Details" aside={parent && hasPhone ? <VerifiedCount verified={verified ? 1 : 0} total={1} /> : undefined} />
                {parent ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <FieldRow>
                            <InfoField label="Full Name" value={parent.parentName || EMPTY} />
                            <InfoField
                                label="Phone Number"
                                value={formatPhone(parent.parentCallingCode, parent.parentPhoneNumber)}
                                trailing={
                                    verified ? (
                                        <VerifiedMark label="Verified" />
                                    ) : (
                                        <ButtonBase onClick={onVerify} sx={{ ...PT.med14, color: PC.teal, borderRadius: "4px", px: "4px", "&:hover": { textDecoration: "underline" } }}>
                                            {hasPhone ? "Verify" : "Add & Verify"}
                                        </ButtonBase>
                                    )
                                }
                            />
                        </FieldRow>
                        <FieldRow>
                            <InfoField label="Email" value={parent.parentEmail || EMPTY} />
                            <InfoField label="Relationship" value={titleCase(parent.parentRelation)} />
                        </FieldRow>
                    </Box>
                ) : (
                    <Typography sx={{ ...PT.med14, color: PC.n400 }}>No parent details on file. Please contact your relationship manager.</Typography>
                )}
            </Box>
        </GlassCard>
    );
}

function AddressFields({ address }: { address: StudentAddress | null }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <FieldRow>
                <InfoField label="Street Address" value={address?.addressLine || EMPTY} />
                <InfoField label="Apartment" value={address?.apartment || EMPTY} />
            </FieldRow>
            <FieldRow>
                <InfoField label="City" value={address?.city || EMPTY} />
                <InfoField label="State" value={address?.state || EMPTY} />
                <InfoField label="ZIP" value={address?.postalCode || EMPTY} />
            </FieldRow>
        </Box>
    );
}

const ADDRESS_KEYS = ["addressLine", "apartment", "city", "state", "postalCode"] as const;
const norm = (value: string | null | undefined) => (value ?? "").trim().toLowerCase();

function AddressCard({ profile }: { profile: StudentProfile }) {
    const current = findStudentAddress(profile.studentAddresses, "current");
    const permanent = findStudentAddress(profile.studentAddresses, "permanent");
    const sameAsCurrent = !permanent || (current !== null && ADDRESS_KEYS.every((key) => norm(current[key]) === norm(permanent[key])));
    return (
        <GlassCard>
            <CardTitle>Address</CardTitle>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <PillRow pill="Residential/Current Address" />
                    <AddressFields address={current} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                        <SectionPill>Permanent Address</SectionPill>
                        <Box role="checkbox" aria-checked={sameAsCurrent} aria-readonly sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <Box
                                sx={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: "4px",
                                    bgcolor: sameAsCurrent ? PC.primary500 : "transparent",
                                    border: sameAsCurrent ? "none" : `1px solid ${PC.n400}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {sameAsCurrent && <PIcon name="icon-check.svg" size={14} />}
                            </Box>
                            <Typography component="span" sx={{ ...PT.reg12, color: PC.n50, whiteSpace: "nowrap" }}>
                                Same as Residential/Current Address
                            </Typography>
                        </Box>
                    </Box>
                    {!sameAsCurrent && <AddressFields address={permanent} />}
                </Box>
            </Box>
        </GlassCard>
    );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function PersonalDetailsPage() {
    const { profile, loadingProfile, getProfile } = useStudent();
    const [error, setError] = useState<string | null>(null);
    const [verifyOpen, setVerifyOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const load = React.useCallback(async () => {
        setError(null);
        const res = await getProfile();
        if (!res.success) setError(res.message ?? "Failed to load your profile");
    }, [getProfile]);

    // Always refresh so verification / password state is current.
    useEffect(() => {
        void load();
    }, [load]);

    if (!profile) {
        if (error && !loadingProfile) return <ProfileError message={error} onRetry={load} />;
        return <ProfileLoading cards={[4, 3]} />;
    }

    const parent = profile.parentDetails[0] ?? null;

    return (
        <>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 576fr) minmax(0, 792fr)" },
                    alignItems: "start",
                    gap: "24px",
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
                    <BasicDetailsCard profile={profile} onEdit={() => setEditOpen(true)} />
                    <ContactDetailsCard profile={profile} />
                    <AadharCard profile={profile} />
                    <PasswordCard profile={profile} onChange={() => setPasswordOpen(true)} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
                    <AcademicDetailsCard profile={profile} />
                    <ParentsDetailsCard parent={parent} onVerify={() => setVerifyOpen(true)} />
                    <AddressCard profile={profile} />
                </Box>
            </Box>
            <VerifyParentPhoneModal open={verifyOpen} parent={parent} onClose={() => setVerifyOpen(false)} onVerified={() => setVerifyOpen(false)} />
            <ChangePasswordModal open={passwordOpen} hasPassword={profile.hasPassword} onClose={() => setPasswordOpen(false)} />
            <CreateRequestModal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                onCreated={() => setEditOpen(false)}
                defaultCategory="General"
                defaultDescription={"Please update my profile details:\n"}
            />
        </>
    );
}
