"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Box, ButtonBase, Typography } from "@mui/material";
import { PC, PERSONAL, profileAsset } from "@/components/profile/profile-data";
import { CardTitle, FieldRow, GlassCard, InfoField, PIcon, PT, SectionPill, VerifiedMark } from "@/components/profile/profile-ui";
import VerifyParentPhoneModal from "@/components/profile/VerifyParentPhoneModal";

function EditDetailsButton() {
    return (
        <ButtonBase
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
function BasicDetailsCard() {
    return (
        <GlassCard>
            <CardTitle action={<EditDetailsButton />}>Basic Details</CardTitle>
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
                        }}
                    >
                        <Box sx={{ position: "absolute", left: -55.86, top: 7.35, width: 245.356, height: 245.356 }}>
                            <Image src={profileAsset("avatar-student.png")} alt={PERSONAL.name} fill sizes="246px" style={{ objectFit: "cover" }} priority />
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <Typography sx={{ ...PT.poppinsSemi20, color: PC.white, textAlign: "center" }}>{PERSONAL.name}</Typography>
                    <FieldRow sx={{ flexDirection: "row" }}>
                        <InfoField label="Gender" value={PERSONAL.gender} />
                        <InfoField label="Date of Birth" value={PERSONAL.dateOfBirth} />
                    </FieldRow>
                </Box>
            </Box>
        </GlassCard>
    );
}

function ContactDetailsCard() {
    return (
        <GlassCard>
            <CardTitle>Contact Details</CardTitle>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <PillRow pill="Primary Details" aside={<Typography sx={{ ...PT.med12, color: PC.primary75, whiteSpace: "nowrap" }}>2/2 verified</Typography>} />
                    <FieldRow>
                        <InfoField label="Phone Number" value={PERSONAL.phone} trailing={<VerifiedMark />} />
                        <InfoField label="Email" value={PERSONAL.email} trailing={<VerifiedMark />} />
                    </FieldRow>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <PillRow pill="WhatsApp Details" />
                    <InfoField label="WhatsApp Number" value={PERSONAL.whatsapp} trailing={<VerifiedMark />} />
                </Box>
            </Box>
        </GlassCard>
    );
}

function AadharCard() {
    return (
        <GlassCard>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
                    <Box sx={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
                        <Image src={profileAsset("icon-lock-3d.png")} alt="" fill sizes="44px" style={{ objectFit: "cover" }} />
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                        <Typography component="h2" sx={{ ...PT.poppinsSemi20, color: PC.white, whiteSpace: "nowrap" }}>
                            Aadhar Details
                        </Typography>
                        <Typography sx={{ ...PT.med16, color: PC.n100, whiteSpace: "nowrap" }}>{PERSONAL.aadhaarMasked}</Typography>
                    </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", px: "16px", py: "8px", borderRadius: "99px", border: `1px solid ${PC.success500}` }}>
                    <VerifiedMark label="Verified" />
                </Box>
            </Box>
        </GlassCard>
    );
}

function PasswordCard() {
    return (
        <GlassCard>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                    <Box sx={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
                        <Image src={profileAsset("icon-lock-3d.png")} alt="" fill sizes="40px" style={{ objectFit: "cover" }} />
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "1.7px", minWidth: 0 }}>
                        <Typography component="h2" sx={{ ...PT.med18, color: PC.white }}>
                            Password
                        </Typography>
                        <Typography sx={{ ...PT.reg14, color: PC.n300 }}>{PERSONAL.passwordUpdated}</Typography>
                    </Box>
                </Box>
                <ButtonBase
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
                    Change Password
                </ButtonBase>
            </Box>
        </GlassCard>
    );
}

// ─── Right column ──────────────────────────────────────────────────────────
function AcademicDetailsCard() {
    const { academic } = PERSONAL;
    return (
        <GlassCard>
            <CardTitle>Academic Details</CardTitle>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, gap: { xs: "20px", sm: "32px" } }}>
                <Box sx={{ position: "relative", width: 150, height: 150, flexShrink: 0, borderRadius: "7.5px", border: "1px solid #E3E5EB", bgcolor: PC.white, overflow: "hidden" }}>
                    <Image src={profileAsset("college-logo.png")} alt={`${academic.institute} logo`} fill sizes="150px" style={{ objectFit: "cover" }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, width: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Typography sx={{ ...PT.poppinsMed20, color: PC.white }}>{academic.institute}</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <PIcon name="icon-map-pin.svg" size={14} />
                            <Typography sx={{ ...PT.med14, color: PC.n200 }}>{academic.location}</Typography>
                        </Box>
                    </Box>
                    <Box component="img" src={profileAsset("divider-line.svg")} alt="" aria-hidden sx={{ display: "block", width: "100%", height: "1px" }} />
                    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: { xs: "20px", sm: "40px" } }}>
                        <Box sx={{ width: 172, display: "flex", flexDirection: "column", gap: "4px" }}>
                            <Typography sx={{ ...PT.reg12, color: PC.n300 }}>Your Highest Education</Typography>
                            <Typography sx={{ ...PT.med16, color: PC.white, minHeight: 32, display: "flex", alignItems: "center" }}>{academic.highestEducation}</Typography>
                        </Box>
                        <Box sx={{ width: 172, display: "flex", flexDirection: "column", gap: "4px" }}>
                            <Typography sx={{ ...PT.reg12, color: PC.n300 }}>{academic.documentLabel}</Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <ButtonBase sx={{ py: "4px", borderRadius: "99px", ...PT.med16, color: PC.white, textDecoration: "underline", whiteSpace: "nowrap" }}>View Document</ButtonBase>
                                {academic.documentVerified ? <VerifiedMark /> : <PIcon name="icon-alert-triangle.svg" size={16} />}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </GlassCard>
    );
}

function ParentsDetailsCard({ verified, onVerify }: { verified: boolean; onVerify: () => void }) {
    const { parent } = PERSONAL;
    return (
        <GlassCard>
            <CardTitle>Parents Details</CardTitle>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <PillRow
                    pill="Primary Details"
                    aside={
                        verified ? undefined : (
                            <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <PIcon name="icon-alert-triangle-14.svg" size={14} />
                                <Typography sx={{ ...PT.med12, color: PC.warning500, whiteSpace: "nowrap" }}>0/1 verified</Typography>
                            </Box>
                        )
                    }
                />
                <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <FieldRow>
                        <InfoField label="Full Name" value={parent.name} />
                        <InfoField
                            label="Phone Number"
                            value={parent.phone}
                            trailing={
                                verified ? (
                                    <VerifiedMark label="Verified" />
                                ) : (
                                    <ButtonBase onClick={onVerify} sx={{ ...PT.med14, color: PC.teal, borderRadius: "4px", px: "4px", "&:hover": { textDecoration: "underline" } }}>
                                        Verify
                                    </ButtonBase>
                                )
                            }
                        />
                    </FieldRow>
                    <FieldRow>
                        <InfoField label="Email" value={parent.email} />
                        <InfoField label="Relationship" value={parent.relationship} />
                    </FieldRow>
                </Box>
            </Box>
        </GlassCard>
    );
}

function AddressFields() {
    const { residential: a } = PERSONAL;
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <FieldRow>
                <InfoField label="Street Address" value={a.street} />
                <InfoField label="Apartment" value={a.apartment} />
            </FieldRow>
            <FieldRow>
                <InfoField label="City" value={a.city} />
                <InfoField label="State" value={a.state} />
                <InfoField label="ZIP" value={a.zip} />
            </FieldRow>
        </Box>
    );
}

function AddressCard() {
    const [sameAsCurrent, setSameAsCurrent] = useState(true);
    return (
        <GlassCard>
            <CardTitle>Address</CardTitle>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <PillRow pill="Residential/Current Address" />
                    <AddressFields />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                        <SectionPill>Permanent Address</SectionPill>
                        <ButtonBase
                            role="checkbox"
                            aria-checked={sameAsCurrent}
                            onClick={() => setSameAsCurrent((v) => !v)}
                            sx={{ display: "flex", alignItems: "center", gap: "12px", borderRadius: "4px" }}
                        >
                            <Box
                                sx={{
                                    position: "relative",
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
                        </ButtonBase>
                    </Box>
                    {!sameAsCurrent && <AddressFields />}
                </Box>
            </Box>
        </GlassCard>
    );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function PersonalDetailsPage() {
    const [parentVerified, setParentVerified] = useState(false);
    const [verifyOpen, setVerifyOpen] = useState(false);

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
                    <BasicDetailsCard />
                    <ContactDetailsCard />
                    <AadharCard />
                    <PasswordCard />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
                    <AcademicDetailsCard />
                    <ParentsDetailsCard verified={parentVerified} onVerify={() => setVerifyOpen(true)} />
                    <AddressCard />
                </Box>
            </Box>
            <VerifyParentPhoneModal
                open={verifyOpen}
                phone={PERSONAL.parent.otpPhone}
                onClose={() => setVerifyOpen(false)}
                onVerified={() => {
                    setParentVerified(true);
                    setVerifyOpen(false);
                }}
            />
        </>
    );
}
