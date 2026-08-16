"use client";
import React from "react";
import {
    MdCalendarToday,
    MdPerson,
    MdSupportAgent,
    MdSchool,
    MdDownload,
    MdPictureAsPdf,
    MdCheckCircle,
    MdAccessTime,
    MdPhone,
} from "react-icons/md";

// ─── Shared card style ───────────────────────────────────────────────────────
const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "14px 16px",
};

// ─── Donut chart (CSS conic-gradient) ────────────────────────────────────────
function DonutChart({ percent }: { percent: number }) {
    const deg = (percent / 100) * 360;
    return (
        <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
            <div
                style={{
                    width: 90,
                    height: 90,
                    borderRadius: "50%",
                    background: `conic-gradient(#7c3aed 0deg ${deg}deg, rgba(255,255,255,0.08) ${deg}deg 360deg)`,
                }}
            />
            {/* Inner circle */}
            <div
                style={{
                    position: "absolute",
                    inset: 12,
                    borderRadius: "50%",
                    background: "#0f1020",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <span
                    style={{
                        fontSize: "0.85rem",
                        fontWeight: 800,
                        color: "#fff",
                        lineHeight: 1,
                    }}
                >
                    {percent}%
                </span>
            </div>
        </div>
    );
}

// ─── Info chip ───────────────────────────────────────────────────────────────
function InfoChip({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: "0.58rem",
                    color: "rgba(255,255,255,0.42)",
                }}
            >
                <Icon size={10} />
                {label}
            </div>
            <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                {value}
            </span>
        </div>
    );
}

// ─── Amount block ────────────────────────────────────────────────────────────
function AmountBlock({ label, amount }: { label: string; amount: string }) {
    return (
        <div>
            <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.45)", marginBottom: 3 }}>
                {label}
            </div>
            <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fff" }}>{amount}</div>
        </div>
    );
}

// ─── Document row ────────────────────────────────────────────────────────────
function DocRow({ name, size }: { name: string; size: string }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 10px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                gap: 8,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <div
                    style={{
                        width: 30,
                        height: 30,
                        borderRadius: "8px",
                        background: "rgba(239,68,68,0.15)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <MdPictureAsPdf size={16} color="#f87171" />
                </div>
                <div style={{ minWidth: 0 }}>
                    <div
                        style={{
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            color: "#fff",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {name}
                    </div>
                    <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)" }}>{size}</div>
                </div>
            </div>
            <button
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    padding: "5px 10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.8)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                }}
            >
                <MdDownload size={12} />
                Download
            </button>
        </div>
    );
}

// ─── Installment row ─────────────────────────────────────────────────────────
function InstallmentRow({
    label,
    amount,
    dueDate,
    paid,
    receipt,
}: {
    label: string;
    amount: string;
    dueDate?: string;
    paid?: boolean;
    receipt?: boolean;
}) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "8px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
        >
            {/* Status icon */}
            <div
                style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: paid ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${paid ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                }}
            >
                {paid ? (
                    <MdCheckCircle size={13} color="#22c55e" />
                ) : (
                    <MdAccessTime size={12} color="rgba(255,255,255,0.4)" />
                )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        color: paid ? "#22c55e" : "#fff",
                    }}
                >
                    {label}
                </div>
                <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.55)", marginTop: 1 }}>
                    {amount}
                </div>
                {dueDate && (
                    <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.38)", marginTop: 1 }}>
                        {dueDate}
                    </div>
                )}
            </div>

            {receipt && (
                <button
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: "0.62rem",
                        fontWeight: 600,
                        padding: "4px 9px",
                        borderRadius: "7px",
                        border: "1px solid rgba(34,197,94,0.25)",
                        background: "rgba(34,197,94,0.08)",
                        color: "#4ade80",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                    }}
                >
                    <MdDownload size={11} />
                    Download Receipt
                </button>
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FeeDetailsPage() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "4px 0 12px" }}>

            {/* ── Top row: Course info + Payment summary ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

                {/* Course Info */}
                <div style={card}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            marginBottom: "10px",
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize: "0.82rem",
                                    fontWeight: 700,
                                    color: "#fff",
                                    marginBottom: 5,
                                }}
                            >
                                Cyber Security Professional Program
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    fontSize: "0.62rem",
                                    color: "rgba(255,255,255,0.5)",
                                }}
                            >
                                <span>📅 12 Month</span>
                                <span>📚 6 Courses</span>
                                <span>🎁 3 Benefits</span>
                            </div>
                        </div>
                        <span
                            style={{
                                fontSize: "0.62rem",
                                fontWeight: 700,
                                padding: "3px 10px",
                                borderRadius: "99px",
                                background: "rgba(34,197,94,0.15)",
                                color: "#4ade80",
                                border: "1px solid rgba(34,197,94,0.25)",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Active
                        </span>
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: "10px" }} />

                    {/* Info grid */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: "8px",
                        }}
                    >
                        <InfoChip icon={MdCalendarToday} label="Enrollment Date" value="12 May 2026" />
                        <InfoChip icon={MdPerson} label="Student ID" value="CCN-2026-1034" />
                        <InfoChip icon={MdSupportAgent} label="Relationship Manager" value="Falguni Pathak" />
                        <InfoChip icon={MdSchool} label="Admission Counsellor" value="Fatema Shaikh" />
                    </div>
                </div>

                {/* Payment Summary */}
                <div style={card}>
                    <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                        {/* Amounts */}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ display: "flex", gap: "14px" }}>
                                <AmountBlock label="Total Amount" amount="₹ 1,20,000" />
                                <AmountBlock label="Pending Amount" amount="₹ 1,10,000" />
                                <AmountBlock label="Paid Amount" amount="₹ 10,000" />
                            </div>

                            {/* Overdue notice */}
                            <div
                                style={{
                                    background: "rgba(239,68,68,0.08)",
                                    border: "1px solid rgba(239,68,68,0.2)",
                                    borderRadius: "10px",
                                    padding: "7px 10px",
                                }}
                            >
                                <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.55)", marginBottom: 3 }}>
                                    2nd Installment · Due on 10 February 2026
                                </div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span
                                        style={{
                                            fontSize: "0.6rem",
                                            fontWeight: 600,
                                            padding: "2px 7px",
                                            borderRadius: "99px",
                                            background: "rgba(239,68,68,0.2)",
                                            color: "#f87171",
                                        }}
                                    >
                                        Overdue by 17 Days
                                    </span>
                                    <button
                                        style={{
                                            fontSize: "0.68rem",
                                            fontWeight: 700,
                                            padding: "5px 13px",
                                            borderRadius: "8px",
                                            border: "none",
                                            background: "linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)",
                                            color: "#fff",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Pay ₹22,000
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Donut */}
                        <DonutChart percent={25} />
                    </div>
                </div>
            </div>

            {/* ── Bottom row: Documents + Timeline ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

                {/* Academic Documents */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={card}>
                        <div
                            style={{
                                fontSize: "0.8rem",
                                fontWeight: 700,
                                color: "#fff",
                                marginBottom: "12px",
                            }}
                        >
                            Academic Documents
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                            <DocRow name="Enrollment Letter" size="1.7 MB · PDF" />
                            <DocRow name="Admission Receipt" size="0.9 MB · PDF" />
                            <DocRow name="Fee Agreement" size="690 KB · PDF" />
                            <DocRow name="Invoice INV-2026" size="560 KB · PDF" />
                            <DocRow name="Student Contract" size="2.4 MB · PDF" />
                        </div>
                    </div>

                    {/* Need help strip */}
                    <div
                        style={{
                            background:
                                "linear-gradient(135deg, rgba(109,40,217,0.3) 0%, rgba(79,70,229,0.2) 100%)",
                            border: "1px solid rgba(124,58,237,0.3)",
                            borderRadius: "14px",
                            padding: "12px 14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 10,
                        }}
                    >
                        <div>
                            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fff", marginBottom: 3 }}>
                                Need help with fees?
                            </div>
                            <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
                                Have questions about your fee payments, installment plans, pending dues, or payment confirmations.
                            </div>
                        </div>
                        <button
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                fontSize: "0.65rem",
                                fontWeight: 600,
                                padding: "7px 13px",
                                borderRadius: "9px",
                                border: "1px solid rgba(124,58,237,0.4)",
                                background: "rgba(124,58,237,0.25)",
                                color: "#c4b5fd",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                            }}
                        >
                            <MdPhone size={12} />
                            Contact Falguni Pathak (RM)
                        </button>
                    </div>
                </div>

                {/* Installment Timeline */}
                <div style={card}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "12px",
                        }}
                    >
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fff" }}>
                            Installment Timeline
                        </span>
                        <span
                            style={{
                                fontSize: "0.62rem",
                                fontWeight: 600,
                                color: "rgba(255,255,255,0.45)",
                            }}
                        >
                            1/6 Installments Paid
                        </span>
                    </div>

                    <InstallmentRow
                        label="Paid ₹10,000 on 12th May, 2026"
                        amount="UPI · purchase"
                        paid
                        receipt
                    />
                    <InstallmentRow
                        label="2nd Installment"
                        amount="₹ 22,080"
                        dueDate="Due on 18 Feb 2026"
                    />
                    <InstallmentRow
                        label="3rd Installment"
                        amount="₹ 22,080"
                        dueDate="Due on 03 March 2026"
                    />
                    <InstallmentRow
                        label="4th Installment"
                        amount="₹ 22,080"
                        dueDate="Due on 03 April 2026"
                    />
                    <InstallmentRow
                        label="5th Installment"
                        amount="₹ 22,080"
                        dueDate="Due on 03 May 2026"
                    />
                    <InstallmentRow
                        label="6th Installment"
                        amount="₹ 22,080"
                        dueDate="Due on 16 Aug 2026"
                    />
                </div>
            </div>
        </div>
    );
}