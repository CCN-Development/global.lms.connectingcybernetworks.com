"use client";
import React, { useEffect, useMemo } from "react";
import { CircularProgress } from "@mui/material";
import {
    MdCalendarToday,
    MdCheckCircle,
    MdAccessTime,
    MdPhone,
    MdOpenInNew,
    MdDescription,
    MdInventory2,
    MdMenuBook,
    MdReceiptLong,
    MdWarningAmber,
} from "react-icons/md";
import {
    useStudent,
    type StudentPaymentSchedule,
    type StudentPurchaseDetail,
} from "@/contexts/StudentContext";

// ─── Shared card style ───────────────────────────────────────────────────────
const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "14px 16px",
};

const EMPTY = "—";

function money(value: number | null | undefined): string {
    if (value === null || value === undefined) return EMPTY;
    return `₹ ${value.toLocaleString("en-IN")}`;
}

function formatDate(value: string | null | undefined): string {
    if (!value) return EMPTY;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return EMPTY;
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

function daysBetween(from: string, to: Date): number {
    return Math.floor((to.getTime() - new Date(from).getTime()) / 86_400_000);
}

/** Late fee charged on every day an installment stays unpaid past its due date. */
const FINE_PER_DAY = 250;

function overdueDaysOf(schedule: StudentPaymentSchedule, now: Date): number {
    if (schedule.isPaid) return 0;
    return Math.max(daysBetween(schedule.dueDate, now), 0);
}

function fineOf(schedule: StudentPaymentSchedule, now: Date): number {
    if (schedule.fineAmount) return schedule.fineAmount;
    return overdueDaysOf(schedule, now) * FINE_PER_DAY;
}

function scheduleLabel(index: number): string {
    const ordinal = index + 1;
    const suffix = ordinal === 1 ? "st" : ordinal === 2 ? "nd" : ordinal === 3 ? "rd" : "th";
    return `${ordinal}${suffix} Installment`;
}

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
                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
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
            <span
                style={{
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.85)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }}
            >
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

function SectionTitle({ title, right }: { title: string; right?: React.ReactNode }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
                gap: 8,
            }}
        >
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fff" }}>{title}</span>
            {right}
        </div>
    );
}

function EmptyRow({ label }: { label: string }) {
    return (
        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", padding: "10px 0", textAlign: "center" }}>
            {label}
        </div>
    );
}

function Tag({ text, tone }: { text: string; tone: "green" | "amber" | "red" | "violet" }) {
    const tones = {
        green: { bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.25)", color: "#4ade80" },
        amber: { bg: "rgba(250,204,21,0.14)", border: "rgba(250,204,21,0.25)", color: "#facc15" },
        red: { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.25)", color: "#f87171" },
        violet: { bg: "rgba(139,92,246,0.18)", border: "rgba(139,92,246,0.3)", color: "#c4b5fd" },
    }[tone];
    return (
        <span
            style={{
                fontSize: "0.6rem",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "99px",
                background: tones.bg,
                border: `1px solid ${tones.border}`,
                color: tones.color,
                whiteSpace: "nowrap",
            }}
        >
            {text}
        </span>
    );
}

// ─── Item row (package / course / document) ──────────────────────────────────
function ItemRow({
    icon: Icon,
    accent,
    title,
    subtitle,
    right,
}: {
    icon: React.ElementType;
    accent: string;
    title: string;
    subtitle: string;
    right?: React.ReactNode;
}) {
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
                        background: `${accent}22`,
                        border: `1px solid ${accent}44`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <Icon size={16} color={accent} />
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
                        {title}
                    </div>
                    <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)" }}>{subtitle}</div>
                </div>
            </div>
            {right}
        </div>
    );
}

// ─── Installment row ─────────────────────────────────────────────────────────
function InstallmentRow({
    schedule,
    index,
    now,
}: {
    schedule: StudentPaymentSchedule;
    index: number;
    now: Date;
}) {
    const overdueDays = overdueDaysOf(schedule, now);
    const isOverdue = overdueDays > 0;
    const fine = fineOf(schedule, now);

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
            <div
                style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: schedule.isPaid ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${schedule.isPaid ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                }}
            >
                {schedule.isPaid ? (
                    <MdCheckCircle size={13} color="#22c55e" />
                ) : (
                    <MdAccessTime size={12} color="rgba(255,255,255,0.4)" />
                )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: schedule.isPaid ? "#22c55e" : "#fff" }}>
                    {scheduleLabel(index)}
                </div>
                <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.55)", marginTop: 1 }}>
                    {money(schedule.amount)}
                    {schedule.isPartialPayment && schedule.partialPaymentAmount !== null
                        ? ` · ${money(schedule.partialPaymentAmount)} paid`
                        : ""}
                </div>
                <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.38)", marginTop: 1 }}>
                    Due on {formatDate(schedule.dueDate)}
                </div>
                {isOverdue && fine > 0 && (
                    <div style={{ fontSize: "0.6rem", color: "#f87171", marginTop: 2, fontWeight: 600 }}>
                        Late fee {money(fine)} ({overdueDays} × {money(FINE_PER_DAY)}/day) · Payable{" "}
                        {money(schedule.amount + fine)}
                    </div>
                )}
            </div>

            {schedule.isPaid ? (
                <Tag text="Paid" tone="green" />
            ) : isOverdue ? (
                <Tag text={`Overdue ${overdueDays}d`} tone="red" />
            ) : (
                <Tag text="Upcoming" tone="amber" />
            )}
        </div>
    );
}

// ─── Purchase card ───────────────────────────────────────────────────────────
function PurchaseCard({ purchase, now }: { purchase: StudentPurchaseDetail; now: Date }) {
    const schedules = [...purchase.studentPaymentSchedules].sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
    const paidCount = schedules.filter((schedule) => schedule.isPaid).length;

    return (
        <div style={{ ...card, padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#fff" }}>
                        {money(purchase.amount)}
                    </div>
                    <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                        Purchased on {formatDate(purchase.purchasedAt)} · Paid {money(purchase.currentPaidAmount ?? 0)}
                    </div>
                </div>
                {purchase.isAllPaymentsDone ? (
                    <Tag text="Fully Paid" tone="green" />
                ) : purchase.isEMIEnabled ? (
                    <Tag text={`EMI · ${purchase.numberOfInstallments ?? schedules.length} installments`} tone="violet" />
                ) : (
                    <Tag text="Payment Pending" tone="amber" />
                )}
            </div>

            {(purchase.packagesInPurchases.length > 0 || purchase.courseInPurchases.length > 0) && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
                    {purchase.packagesInPurchases.map((item) => (
                        <Tag key={item.packageId} text={item.Packages.packageName} tone="violet" />
                    ))}
                    {purchase.courseInPurchases.map((item) => (
                        <Tag key={item.courseId} text={item.Courses.courseName} tone="amber" />
                    ))}
                </div>
            )}

            <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "10px 0" }} />

            <SectionTitle
                title="EMI Schedule"
                right={
                    <span style={{ fontSize: "0.62rem", fontWeight: 600, color: "rgba(255,255,255,0.45)" }}>
                        {paidCount}/{schedules.length} Paid
                    </span>
                }
            />

            {schedules.length === 0 ? (
                <EmptyRow label="No installment schedule for this purchase." />
            ) : (
                <>
                    {schedules.map((schedule, index) => (
                        <InstallmentRow key={schedule.scheduleId} schedule={schedule} index={index} now={now} />
                    ))}
                    <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.38)", marginTop: 8 }}>
                        A late fee of {money(FINE_PER_DAY)} per day applies on every overdue installment.
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FeeDetailsPage() {
    const { profile, loadingProfile, getProfile } = useStudent();

    useEffect(() => {
        getProfile();
    }, [getProfile]);

    const now = useMemo(() => new Date(), []);

    const totals = useMemo(() => {
        const purchases = profile?.studentPurchases ?? [];
        const total = purchases.reduce((sum, purchase) => sum + (purchase.amount ?? 0), 0);
        const paid = purchases.reduce((sum, purchase) => sum + (purchase.currentPaidAmount ?? 0), 0);
        const schedules = purchases
            .flatMap((purchase) => purchase.studentPaymentSchedules)
            .filter((schedule) => !schedule.isPaid)
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        const lateFee = schedules.reduce((sum, schedule) => sum + fineOf(schedule, now), 0);
        return {
            total,
            paid,
            pending: Math.max(total - paid, 0),
            lateFee,
            percentPaid: total === 0 ? 0 : Math.round((paid / total) * 100),
            nextDue: schedules[0] ?? null,
            unpaidCount: schedules.length,
        };
    }, [profile, now]);

    if (loadingProfile && !profile) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
                <CircularProgress size={24} sx={{ color: "#a78bfa" }} />
            </div>
        );
    }

    if (!profile) {
        return <EmptyRow label="Fee details could not be loaded." />;
    }

    const nextDueOverdueDays = totals.nextDue ? overdueDaysOf(totals.nextDue, now) : 0;
    const nextDueFine = totals.nextDue ? fineOf(totals.nextDue, now) : 0;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "4px 0 12px" }}>

            {/* ── Top row: Enrollment info + Payment summary ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

                {/* Enrollment info */}
                <div style={card}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            marginBottom: "10px",
                            gap: 8,
                        }}
                    >
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", marginBottom: 5 }}>
                                {profile.studentName}
                            </div>
                            <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.5)" }}>
                                {profile.studentPackagesAccesses.length} package
                                {profile.studentPackagesAccesses.length === 1 ? "" : "s"} ·{" "}
                                {profile.studentCourseAccesses.length} course
                                {profile.studentCourseAccesses.length === 1 ? "" : "s"} ·{" "}
                                {profile.studentPurchases.length} purchase
                                {profile.studentPurchases.length === 1 ? "" : "s"}
                            </div>
                        </div>
                        <Tag text={profile.isActive ? "Active" : "Inactive"} tone={profile.isActive ? "green" : "red"} />
                    </div>

                    <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: "10px" }} />

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                        <InfoChip icon={MdCalendarToday} label="Enrolled On" value={formatDate(profile.createdAt)} />
                        <InfoChip
                            icon={MdReceiptLong}
                            label="Student ID"
                            value={profile.studentRegistrationNumber ?? EMPTY}
                        />
                        <InfoChip icon={MdMenuBook} label="Branch" value={profile.branch.branchName} />
                        <InfoChip
                            icon={MdDescription}
                            label="Documents"
                            value={`${profile.studentDocuments.length} submitted`}
                        />
                    </div>
                </div>

                {/* Payment Summary */}
                <div style={card}>
                    <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", minWidth: 0 }}>
                            <div style={{ display: "flex", gap: "14px" }}>
                                <AmountBlock label="Total Amount" amount={money(totals.total)} />
                                <AmountBlock label="Pending Amount" amount={money(totals.pending)} />
                                <AmountBlock label="Paid Amount" amount={money(totals.paid)} />
                                {totals.lateFee > 0 && (
                                    <AmountBlock label="Late Fee" amount={money(totals.lateFee)} />
                                )}
                            </div>

                            {totals.nextDue ? (
                                <div
                                    style={{
                                        background:
                                            nextDueOverdueDays > 0 ? "rgba(239,68,68,0.08)" : "rgba(139,92,246,0.1)",
                                        border: `1px solid ${nextDueOverdueDays > 0 ? "rgba(239,68,68,0.2)" : "rgba(139,92,246,0.25)"}`,
                                        borderRadius: "10px",
                                        padding: "7px 10px",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "0.65rem",
                                            color: "rgba(255,255,255,0.55)",
                                            marginBottom: 3,
                                        }}
                                    >
                                        Next installment · Due on {formatDate(totals.nextDue.dueDate)}
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 8,
                                        }}
                                    >
                                        {nextDueOverdueDays > 0 ? (
                                            <Tag text={`Overdue by ${nextDueOverdueDays} Days`} tone="red" />
                                        ) : (
                                            <Tag text={`${totals.unpaidCount} installments left`} tone="violet" />
                                        )}
                                        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#fff" }}>
                                            {money(totals.nextDue.amount + nextDueFine)}
                                        </span>
                                    </div>
                                    {nextDueOverdueDays > 0 && nextDueFine > 0 && (
                                        <div style={{ fontSize: "0.6rem", color: "#f87171", marginTop: 4 }}>
                                            Includes {money(nextDueFine)} late fee at {money(FINE_PER_DAY)} per day
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div
                                    style={{
                                        background: "rgba(34,197,94,0.08)",
                                        border: "1px solid rgba(34,197,94,0.2)",
                                        borderRadius: "10px",
                                        padding: "7px 10px",
                                        fontSize: "0.65rem",
                                        color: "rgba(255,255,255,0.6)",
                                    }}
                                >
                                    {totals.total === 0
                                        ? "No purchases recorded yet."
                                        : "All installments are cleared. Nothing pending."}
                                </div>
                            )}
                        </div>

                        <DonutChart percent={totals.percentPaid} />
                    </div>
                </div>
            </div>

            {/* ── Bottom row: Purchases + Access & Documents ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

                {/* Purchases & EMI schedules */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={card}>
                        <SectionTitle
                            title="Purchases & EMI Schedule"
                            right={
                                <span style={{ fontSize: "0.62rem", fontWeight: 600, color: "rgba(255,255,255,0.45)" }}>
                                    {profile.studentPurchases.length} purchase
                                    {profile.studentPurchases.length === 1 ? "" : "s"}
                                </span>
                            }
                        />
                        {profile.studentPurchases.length === 0 ? (
                            <EmptyRow label="No purchases recorded yet." />
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {profile.studentPurchases.map((purchase) => (
                                    <PurchaseCard key={purchase.purchaseId} purchase={purchase} now={now} />
                                ))}
                            </div>
                        )}
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
                                Have questions about your fee payments, installment plans, pending dues, or payment
                                confirmations.
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
                            Contact Relationship Manager
                        </button>
                    </div>
                </div>

                {/* Access + documents */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

                    {/* Packages purchased */}
                    <div style={card}>
                        <SectionTitle title="My Packages" />
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                            {profile.studentPackagesAccesses.length === 0 ? (
                                <EmptyRow label="No packages purchased yet." />
                            ) : (
                                profile.studentPackagesAccesses.map((access) => (
                                    <ItemRow
                                        key={access.packageId}
                                        icon={MdInventory2}
                                        accent="#a78bfa"
                                        title={access.Packages.packageName}
                                        subtitle={`${money(access.Packages.price)}${access.Packages.durationInMonths ? ` · ${access.Packages.durationInMonths} months` : ""}${access.expiresAt ? ` · expires ${formatDate(access.expiresAt)}` : ""}`}
                                        right={
                                            <Tag
                                                text={access.isActive ? "Active" : "Inactive"}
                                                tone={access.isActive ? "green" : "red"}
                                            />
                                        }
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Courses enrolled */}
                    <div style={card}>
                        <SectionTitle title="Courses Enrolled" />
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                            {profile.studentCourseAccesses.length === 0 ? (
                                <EmptyRow label="No courses enrolled yet." />
                            ) : (
                                profile.studentCourseAccesses.map((access) => (
                                    <ItemRow
                                        key={access.courseId}
                                        icon={MdMenuBook}
                                        accent="#38bdf8"
                                        title={access.Courses.courseName}
                                        subtitle={`${access.Courses.durationInMonths ? `${access.Courses.durationInMonths} months` : "Duration not set"}${access.Courses.noOfModules ? ` · ${access.Courses.noOfModules} modules` : ""}${access.expiresAt ? ` · expires ${formatDate(access.expiresAt)}` : ""}`}
                                        right={
                                            <Tag
                                                text={access.isActive ? "Active" : "Inactive"}
                                                tone={access.isActive ? "green" : "red"}
                                            />
                                        }
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Submitted documents */}
                    <div style={card}>
                        <SectionTitle
                            title="Submitted Documents"
                            right={
                                <span style={{ fontSize: "0.62rem", fontWeight: 600, color: "rgba(255,255,255,0.45)" }}>
                                    {profile.studentDocuments.filter((document) => document.isVerified).length}/
                                    {profile.studentDocuments.length} verified
                                </span>
                            }
                        />
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                            {profile.studentDocuments.length === 0 ? (
                                <EmptyRow label="No documents submitted yet." />
                            ) : (
                                profile.studentDocuments.map((document) => (
                                    <ItemRow
                                        key={document.documentId}
                                        icon={document.isVerified ? MdDescription : MdWarningAmber}
                                        accent={document.isVerified ? "#4ade80" : "#facc15"}
                                        title={document.documentName}
                                        subtitle={document.documentType}
                                        right={
                                            <a
                                                href={document.documentUrl}
                                                target="_blank"
                                                rel="noreferrer"
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
                                                    textDecoration: "none",
                                                    whiteSpace: "nowrap",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <MdOpenInNew size={12} />
                                                View
                                            </a>
                                        }
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
