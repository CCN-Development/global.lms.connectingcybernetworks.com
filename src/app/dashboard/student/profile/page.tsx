"use client";
import React from "react";
import {
    MdEdit,
    MdCheckCircle,
    MdWarningAmber,
    MdLock,
    MdLocationOn,
} from "react-icons/md";

// ─── Shared card style ──────────────────────────────────────────────────────
const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "14px 16px",
};

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
function VerifiedBadge() {
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "rgba(34,197,94,0.15)",
                flexShrink: 0,
            }}
        >
            <MdCheckCircle size={13} color="#22c55e" />
        </span>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
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
                            }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                                alt="avatar"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        </div>
                    </div>

                    <p
                        style={{
                            textAlign: "center",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            color: "#fff",
                            marginBottom: "14px",
                        }}
                    >
                        Aanchal Ravi Gupta
                    </p>

                    <div style={{ display: "flex", gap: "8px" }}>
                        <Field label="Gender" value="Female" />
                        <Field label="Date of Birth" value="06-11-2006" />
                    </div>
                </div>

                {/* ── Contact Details ── */}
                <div style={card}>
                    <CardHeader title="Contact Details" />

                    {/* Primary Details tab */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "10px",
                        }}
                    >
                        <Pill>Primary Details</Pill>
                        <span
                            style={{
                                fontSize: "0.62rem",
                                color: "rgba(255,255,255,0.45)",
                            }}
                        >
                            2/2 verified
                        </span>
                    </div>

                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                        <Field
                            label="Phone Number"
                            value="+91 7888337278"
                            badge={<VerifiedBadge />}
                        />
                        <Field
                            label="Email"
                            value="aanchalg@gmail.com"
                            badge={<VerifiedBadge />}
                        />
                    </div>

                    {/* WhatsApp Details tab */}
                    <div style={{ marginBottom: "10px" }}>
                        <Pill>WhatsApp Details</Pill>
                    </div>

                    <Field
                        label="WhatsApp Number"
                        value="+91 7454459098"
                        badge={<VerifiedBadge />}
                    />
                </div>

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
                                Last updated on 24 Jan 2026
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
                        {/* College logo */}
                        <div
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: "10px",
                                border: "1px solid rgba(255,255,255,0.12)",
                                background: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                                flexShrink: 0,
                            }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="https://upload.wikimedia.org/wikipedia/en/thumb/6/6d/Little_Flower_High_School_logo.png/200px-Little_Flower_High_School_logo.png"
                                alt="college"
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                }}
                            />
                        </div>

                        {/* College info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", marginBottom: 3 }}>
                                Little Flower College of Science
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
                                SakiNaka, Mumbai
                            </div>

                            <div style={{ display: "flex", gap: "8px" }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>
                                        Your Highest Education
                                    </div>
                                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#fff" }}>
                                        Class 12
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>
                                        12th Marksheet
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 4,
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            color: "#60a5fa",
                                            cursor: "pointer",
                                        }}
                                    >
                                        View Document
                                        <MdWarningAmber size={13} color="#facc15" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Parents Details ── */}
                <div style={card}>
                    <CardHeader title="Parents Details" />

                    <div style={{ marginBottom: "10px" }}>
                        <Pill>Primary Details</Pill>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <Field label="Full Name" value="Ravi Ashok Sharma" />
                        <Field
                            label="Phone Number"
                            value="+91 7888337278"
                            badge={
                                <span
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 3,
                                        fontSize: "0.6rem",
                                        fontWeight: 600,
                                        color: "#22c55e",
                                        background: "rgba(34,197,94,0.12)",
                                        borderRadius: "99px",
                                        padding: "2px 6px",
                                        whiteSpace: "nowrap",
                                        flexShrink: 0,
                                    }}
                                >
                                    <MdCheckCircle size={10} /> Verified
                                </span>
                            }
                        />
                        <Field label="Email" value="sanjaysharma@gmail.com" />
                        <Field label="Relationship" value="Father" />
                    </div>
                </div>

                {/* ── Address ── */}
                <div style={card}>
                    <CardHeader title="Address" />

                    <div style={{ marginBottom: "10px" }}>
                        <Pill>Residential/Current Address</Pill>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                        <Field label="Street Address" value="Shree Heights, Andheri East" />
                        <Field label="Apartment" value="A Wing FlatNo. 1604" />
                        <Field label="City" value="Mumbai" />
                        <Field label="State" value="Maharashtra" />
                        <Field label="ZIP" value="400069" />
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                        }}
                    >
                        <Pill>Permanent Address</Pill>
                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: "0.62rem",
                                color: "rgba(255,255,255,0.55)",
                                cursor: "pointer",
                            }}
                        >
                            <input
                                type="checkbox"
                                defaultChecked
                                style={{
                                    accentColor: "#6d28d9",
                                    width: 12,
                                    height: 12,
                                    cursor: "pointer",
                                }}
                            />
                            Same as Residential/Current Address
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}