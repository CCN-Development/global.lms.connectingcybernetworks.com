"use client";
import React, { useEffect } from "react";
import { CircularProgress } from "@mui/material";
import {
    MdEdit,
    MdCheckCircle,
    MdWarningAmber,
    MdLock,
    MdLocationOn,
    MdPersonOutline,
    MdSchool,
} from "react-icons/md";
import { useStudent, type StudentAddress, type StudentDocument } from "@/contexts/StudentContext";

// ─── Shared card style ──────────────────────────────────────────────────────
const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "14px 16px",
};

const EMPTY = "—";

function formatDate(value: string | null | undefined): string {
    if (!value) return EMPTY;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return EMPTY;
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" })
        .replace(/\//g, "-");
}

function formatPhone(callingCode: string | null | undefined, number: string | null | undefined): string {
    if (!number) return EMPTY;
    return callingCode ? `+${callingCode} ${number}` : number;
}

function addressLabel(address: StudentAddress): string {
    return address.addressType?.trim() || "Address";
}

function isPermanent(address: StudentAddress): boolean {
    return (address.addressType ?? "").toLowerCase().includes("permanent");
}

// ─── Section label pill ─────────────────────────────────────────────────────
function Pill({ children }: { children: React.ReactNode }) {
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                fontSize: "0.62rem",
                fontWeight: 600,
                padding: "3px 9px",
                borderRadius: "99px",
                background: "rgba(139,92,246,0.22)",
                color: "#c4b5fd",
                letterSpacing: "0.02em",
                textTransform: "capitalize",
            }}
        >
            {children}
        </span>
    );
}

// ─── Display field ──────────────────────────────────────────────────────────
function Field({
    label,
    value,
    badge,
}: {
    label: string;
    value: React.ReactNode;
    badge?: React.ReactNode;
}) {
    return (
        <div
            style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px",
                padding: "8px 12px",
                flex: 1,
                minWidth: 0,
            }}
        >
            <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.45)", marginBottom: 3 }}>
                {label}
            </div>
            <div
                style={{
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 4,
                }}
            >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {value}
                </span>
                {badge}
            </div>
        </div>
    );
}

// ─── Card header ────────────────────────────────────────────────────────────
function CardHeader({ title }: { title: string }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
            }}
        >
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fff" }}>{title}</span>
            <button
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.55)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "3px 0",
                }}
            >
                <MdEdit size={12} />
                Edit Details
            </button>
        </div>
    );
}

// ─── VerifiedBadge ───────────────────────────────────────────────────────────
function VerifiedBadge({ verified }: { verified: boolean }) {
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: verified ? "rgba(34,197,94,0.15)" : "rgba(250,204,21,0.15)",
                flexShrink: 0,
            }}
        >
            {verified ? (
                <MdCheckCircle size={13} color="#22c55e" />
            ) : (
                <MdWarningAmber size={13} color="#facc15" />
            )}
        </span>
    );
}

function EmptyRow({ label }: { label: string }) {
    return (
        <div
            style={{
                fontSize: "0.7rem",
                color: "rgba(255,255,255,0.4)",
                padding: "10px 0",
                textAlign: "center",
            }}
        >
            {label}
        </div>
    );
}

// ─── Address block ───────────────────────────────────────────────────────────
function AddressBlock({ address }: { address: StudentAddress }) {
    return (
        <>
            <div style={{ marginBottom: "10px" }}>
                <Pill>{addressLabel(address)}</Pill>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                <Field label="Street Address" value={address.addressLine ?? EMPTY} />
                <Field label="City" value={address.city ?? EMPTY} />
                <Field label="State" value={address.state ?? EMPTY} />
                <Field label="Country" value={address.country ?? EMPTY} />
                <Field label="ZIP" value={address.postalCode ?? EMPTY} />
            </div>
        </>
    );
}

// ─── Document row ────────────────────────────────────────────────────────────
function DocumentRow({ document }: { document: StudentDocument }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px",
                padding: "8px 12px",
            }}
        >
            <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>
                    {document.documentType}
                </div>
                <div
                    style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#fff",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {document.documentName}
                </div>
            </div>
            <a
                href={document.documentUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "#60a5fa",
                    whiteSpace: "nowrap",
                    textDecoration: "none",
                }}
            >
                View Document
                <VerifiedBadge verified={document.isVerified} />
            </a>
        </div>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
    const { profile, loadingProfile, getProfile } = useStudent();

    useEffect(() => {
        getProfile();
    }, [getProfile]);

    if (loadingProfile && !profile) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
                <CircularProgress size={24} sx={{ color: "#a78bfa" }} />
            </div>
        );
    }

    if (!profile) {
        return <EmptyRow label="Profile could not be loaded." />;
    }

    const parent = profile.parentDetails[0] ?? null;
    const currentAddress = profile.studentAddresses.find((address) => !isPermanent(address))
        ?? profile.studentAddresses[0]
        ?? null;
    const permanentAddress = profile.studentAddresses.find(isPermanent) ?? null;
    const adhaar = profile.studentAdhaarDatas[0] ?? null;

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                padding: "4px 0 12px",
            }}
        >
            {/* ══════════════ LEFT COLUMN ══════════════ */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

                {/* ── Basic Details ── */}
                <div style={card}>
                    <CardHeader title="Basic Details" />

                    {/* Profile banner + avatar */}
                    <div style={{ position: "relative", marginBottom: "36px" }}>
                        <div
                            style={{
                                height: 80,
                                borderRadius: "12px",
                                background:
                                    "linear-gradient(135deg, #e879f9 0%, #f97316 50%, #facc15 100%)",
                            }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                bottom: -30,
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: 62,
                                height: 62,
                                borderRadius: "50%",
                                border: "3px solid #0b0c1e",
                                overflow: "hidden",
                                background: "rgba(255,255,255,0.08)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {profile.studentPhoto ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={profile.studentPhoto}
                                    alt={profile.studentName}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            ) : (
                                <MdPersonOutline size={30} color="rgba(255,255,255,0.5)" />
                            )}
                        </div>
                    </div>

                    <p
                        style={{
                            textAlign: "center",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            color: "#fff",
                            marginBottom: "4px",
                        }}
                    >
                        {profile.studentName}
                    </p>
                    <p
                        style={{
                            textAlign: "center",
                            fontSize: "0.65rem",
                            color: "rgba(255,255,255,0.45)",
                            marginBottom: "14px",
                        }}
                    >
                        {profile.studentRegistrationNumber ?? "Registration pending"} · {profile.branch.branchName}
                    </p>

                    <div style={{ display: "flex", gap: "8px" }}>
                        <Field label="Gender" value={profile.gender ?? EMPTY} />
                        <Field label="Date of Birth" value={formatDate(profile.dateOfBirth)} />
                    </div>
                </div>

                {/* ── Contact Details ── */}
                <div style={card}>
                    <CardHeader title="Contact Details" />

                    <div style={{ marginBottom: "10px" }}>
                        <Pill>Primary Details</Pill>
                    </div>

                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                        <Field
                            label="Phone Number"
                            value={formatPhone(profile.callingCode, profile.phoneNumber)}
                        />
                        <Field label="Email" value={profile.email ?? EMPTY} />
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <Pill>Alternate Details</Pill>
                    </div>

                    <Field
                        label="Alternate Number"
                        value={formatPhone(profile.callingCode, profile.studentAlternatePhoneNumber)}
                    />
                </div>

                {/* ── Identity ── */}
                {adhaar && (
                    <div style={card}>
                        <CardHeader title="Identity" />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                            <Field
                                label="Aadhaar Number"
                                value={adhaar.adhaarNumber ?? EMPTY}
                                badge={<VerifiedBadge verified={adhaar.isVerified} />}
                            />
                            <Field label="Name on Aadhaar" value={adhaar.adhaarName ?? EMPTY} />
                        </div>
                    </div>
                )}

                {/* ── Password ── */}
                <div
                    style={{
                        ...card,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: "10px",
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <MdLock size={18} color="rgba(255,255,255,0.7)" />
                        </div>
                        <div>
                            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#fff" }}>
                                Password
                            </div>
                            <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                                Keep your account secure with a strong password
                            </div>
                        </div>
                    </div>
                    <button
                        style={{
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            padding: "6px 14px",
                            borderRadius: "8px",
                            border: "1px solid rgba(255,255,255,0.15)",
                            background: "rgba(255,255,255,0.07)",
                            color: "#fff",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Change Password
                    </button>
                </div>
            </div>

            {/* ══════════════ RIGHT COLUMN ══════════════ */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

                {/* ── Academic Details ── */}
                <div style={card}>
                    <CardHeader title="Academic Details" />

                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <div
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: "10px",
                                border: "1px solid rgba(255,255,255,0.12)",
                                background: "rgba(255,255,255,0.06)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <MdSchool size={26} color="rgba(255,255,255,0.55)" />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", marginBottom: 3 }}>
                                {profile.highestEducationInstitute ?? "Institute not added"}
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    fontSize: "0.65rem",
                                    color: "rgba(255,255,255,0.5)",
                                    marginBottom: 10,
                                }}
                            >
                                <MdLocationOn size={12} />
                                {profile.branch.branchName}
                            </div>

                            <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>
                                Your Highest Education
                            </div>
                            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#fff" }}>
                                {profile.highestEducation ?? EMPTY}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                        {profile.studentDocuments.length === 0 ? (
                            <EmptyRow label="No documents uploaded yet." />
                        ) : (
                            profile.studentDocuments.map((document) => (
                                <DocumentRow key={document.documentId} document={document} />
                            ))
                        )}
                    </div>
                </div>

                {/* ── Parents Details ── */}
                <div style={card}>
                    <CardHeader title="Parents Details" />

                    {!parent ? (
                        <EmptyRow label="No parent details added yet." />
                    ) : (
                        <>
                            <div style={{ marginBottom: "10px" }}>
                                <Pill>Primary Details</Pill>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                <Field label="Full Name" value={parent.parentName} />
                                <Field
                                    label="Phone Number"
                                    value={formatPhone(parent.parentCallingCode, parent.parentPhoneNumber)}
                                />
                                <Field label="Email" value={parent.parentEmail ?? EMPTY} />
                                <Field label="Relationship" value={parent.parentRelation ?? EMPTY} />
                            </div>
                        </>
                    )}
                </div>

                {/* ── Address ── */}
                <div style={card}>
                    <CardHeader title="Address" />

                    {profile.studentAddresses.length === 0 ? (
                        <EmptyRow label="No address added yet." />
                    ) : (
                        <>
                            {currentAddress && <AddressBlock address={currentAddress} />}
                            {permanentAddress && permanentAddress.addressId !== currentAddress?.addressId ? (
                                <AddressBlock address={permanentAddress} />
                            ) : (
                                <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.45)" }}>
                                    Permanent address is same as the address above.
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
