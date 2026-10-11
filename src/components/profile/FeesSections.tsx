"use client";

import React, { useMemo, useState } from "react";
import { Box, ButtonBase, Tooltip, Typography } from "@mui/material";
import { LmsButton } from "@/components/community/community-ui";
import type { FeeDocument, FeeInstallment, FeeProgram, FeeProgramStatus, StudentFees } from "@/contexts/StudentContext";
import { EMPTY, PC, formatBytes, formatDate, formatINR, formatLongDate, formatOrdinalDate, pluralDays, profileAsset } from "./profile-data";
import { CardTitle, GlassCard, OutlineButton, PIcon, PT, RowBox, SegmentedTabs, StatusPill, ellipsis, strokeLayer } from "./profile-ui";
import { GAUGE_TICKS, GAUGE_VIEWBOX } from "./progress-gauge-ticks";
import { EmptyNote } from "./ProfileStates";

// ─── View models ───────────────────────────────────────────────────────────
type DueTone = "warning" | "success" | "error";

interface DueLine {
    key: string;
    label: string;
    amount: string;
    pill?: string;
    muted?: boolean;
}

export interface FeeSummaryView {
    combinedLabel?: string;
    total: string;
    pending: string;
    paid: string;
    percent: number;
    title?: string;
    dueOn?: string;
    status?: { label: string; tone: DueTone };
    lines: DueLine[];
    lateFee?: string;
    lateFeeHint?: string;
    totalPayable: string;
    payAllDues?: string;
    note?: string;
    canPay: boolean;
}

/** "Cyber Security Professional - 2nd Installment" when several programs are listed, otherwise "2nd Installment". */
export function installmentTitle(item: FeeInstallment, multi: boolean) {
    return multi ? `${item.programShortName} - ${item.label}` : item.label;
}

function dueStatus(item: FeeInstallment): { label: string; tone: DueTone } {
    if (item.status === "overdue") return { label: `Overdue by ${pluralDays(item.daysOverdue)}`, tone: "error" };
    if (item.status === "due_today") return { label: "Due Today", tone: "success" };
    if (item.daysUntilDue === 1) return { label: "Due Tomorrow", tone: "warning" };
    return { label: `Due in ${pluralDays(item.daysUntilDue)}`, tone: "warning" };
}

/** Turns the API summary into the copy of the Figma "Fee summary" states (before due, due today, overdue, multi-overdue). */
export function buildFeeSummaryView(fees: StudentFees): FeeSummaryView {
    const { summary, lateFeePerDay } = fees;
    const multi = fees.programs.length > 1;
    const lateRate = `${formatINR(lateFeePerDay, { space: false })}/day`;
    const base = {
        combinedLabel: multi ? "All program/Courses combined" : undefined,
        total: formatINR(summary.totalAmount),
        pending: formatINR(summary.pendingAmount),
        paid: formatINR(summary.paidAmount),
        percent: summary.percentPaid,
    };
    const payAllDues = (alreadyCovered: number) =>
        summary.dueThisMonth.count > alreadyCovered && summary.dueThisMonth.totalPayable > (summary.payNow?.totalPayable ?? 0)
            ? formatINR(summary.dueThisMonth.totalPayable)
            : undefined;

    if (summary.state === "settled" || !summary.nextDue) {
        return {
            ...base,
            title: summary.totalAmount > 0 ? "All installments paid" : "No dues",
            dueOn: summary.totalAmount > 0 ? "You have no pending fee payments." : "There are no fee payments on your account.",
            status: summary.totalAmount > 0 ? { label: "Paid", tone: "success" } : undefined,
            lines: [],
            totalPayable: formatINR(0),
            canPay: false,
        };
    }

    if (summary.state === "overdue") {
        const overdue = summary.overdue;
        const single = overdue.length === 1 ? overdue[0] : null;
        const lines: DueLine[] = single
            ? partialLines(single)
            : overdue.map((item) => ({
                key: item.scheduleId,
                label: installmentTitle(item, multi),
                amount: formatINR(item.outstandingAmount),
                pill: `Overdue by ${pluralDays(item.daysOverdue)}`,
            }));
        const lateFeeHint = single
            ? `${pluralDays(single.daysOverdue)} × ${formatINR(lateFeePerDay, { space: false })} late charge`
            : `${lateRate} late charge for each overdue installment:\n${overdue
                .map((item) => `${installmentTitle(item, multi)} — ${pluralDays(item.daysOverdue)} = ${formatINR(item.lateFee, { space: false })}`)
                .join("\n")}`;
        return {
            ...base,
            title: single ? installmentTitle(single, multi) : undefined,
            dueOn: single ? `Due on ${formatLongDate(single.dueDate)}` : undefined,
            status: single ? dueStatus(single) : undefined,
            lines,
            lateFee: formatINR(summary.payNow?.lateFee ?? summary.lateFee),
            lateFeeHint,
            totalPayable: formatINR(summary.payNow?.totalPayable ?? 0),
            payAllDues: payAllDues(overdue.length),
            canPay: true,
        };
    }

    const next = summary.nextDue;
    return {
        ...base,
        title: installmentTitle(next, multi),
        dueOn: `Due on ${formatLongDate(next.dueDate)}`,
        status: dueStatus(next),
        lines: next.isPartiallyPaid ? partialLines(next) : [],
        totalPayable: formatINR(summary.payNow?.totalPayable ?? next.payableAmount),
        payAllDues: payAllDues(1),
        note: `Pay on time to avoid ${lateRate} late charges.`,
        canPay: true,
    };
}

function partialLines(item: FeeInstallment): DueLine[] {
    if (!item.isPartiallyPaid) return [{ key: item.scheduleId, label: "Installment Amount", amount: formatINR(item.outstandingAmount) }];
    return [
        { key: `${item.scheduleId}-amount`, label: "Installment Amount", amount: formatINR(item.amount) },
        { key: `${item.scheduleId}-paid`, label: "Already Paid", amount: `- ${formatINR(item.paidAmount)}`, muted: true },
    ];
}

// ─── Programs ──────────────────────────────────────────────────────────────
function InfoChip({ value, label }: { value: string; label: string }) {
    return (
        <Box
            title={value}
            sx={{
                position: "relative",
                flex: "1 1 0",
                minWidth: { xs: "calc(50% - 6px)", sm: 0 },
                p: "12px",
                borderRadius: "12px",
                overflow: "hidden",
                bgcolor: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(15px)",
                "&::before": strokeLayer("linear-gradient(180deg, rgba(191,191,191,0.5) 0%, rgba(89,89,89,0) 100%)"),
            }}
        >
            <Typography sx={{ ...PT.semi16, color: PC.white, ...ellipsis }}>{value}</Typography>
            <Typography sx={{ ...PT.reg12, color: PC.n400, mt: "4px", ...ellipsis }}>{label}</Typography>
        </Box>
    );
}

function MetaItem({ icon, children, hint }: { icon: string; children: React.ReactNode; hint?: string }) {
    const content = (
        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", cursor: hint ? "help" : undefined }}>
            <PIcon name={icon} size={20} />
            <Typography sx={{ ...PT.med16, color: PC.n200, whiteSpace: "nowrap" }}>{children}</Typography>
        </Box>
    );
    return hint ? (
        <Tooltip title={<Box sx={{ whiteSpace: "pre-line" }}>{hint}</Box>} arrow>
            {content}
        </Tooltip>
    ) : (
        content
    );
}

const STATUS_PILL: Record<FeeProgramStatus, { label: string; background: string }> = {
    active: { label: "Active", background: PC.gradientActive },
    new: { label: "New", background: PC.gradientNew },
    completed: { label: "Completed", background: PC.gradientPurple },
    inactive: { label: "Inactive", background: "linear-gradient(90deg, #5A5A5A 0%, #262626 100%)" },
};

function ProgramStatusPill({ status }: { status: FeeProgramStatus }) {
    const pill = STATUS_PILL[status];
    return (
        <Box sx={{ px: "12px", py: "4px", borderRadius: "99px", backgroundImage: pill.background, flexShrink: 0 }}>
            <Typography sx={{ ...PT.med16, color: PC.n50, whiteSpace: "nowrap" }}>{pill.label}</Typography>
        </Box>
    );
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function ProgramDetails({ program, longLabels }: { program: FeeProgram; longLabels?: boolean }) {
    const showCourses = program.kind === "package" && program.courses.length > 0;
    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <Typography component="h3" sx={{ ...PT.poppinsSemi20, color: PC.white, fontSize: { xs: "18px", md: "20px" } }}>
                        {program.name}
                    </Typography>
                    <ProgramStatusPill status={program.status} />
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", columnGap: "24px", rowGap: "8px" }}>
                    {program.durationInMonths ? <MetaItem icon="icon-calendar.svg">{plural(program.durationInMonths, "Month")}</MetaItem> : null}
                    {showCourses && (
                        <MetaItem icon="icon-book-open.svg" hint={program.courses.map((c) => c.courseName).join("\n")}>
                            {plural(program.courses.length, "Course")}
                        </MetaItem>
                    )}
                    {program.benefits.length > 0 && (
                        <MetaItem icon="icon-star.svg" hint={program.benefits.join("\n")}>
                            {plural(program.benefits.length, "Benefit")}
                        </MetaItem>
                    )}
                </Box>
            </Box>
            <Box sx={{ display: "flex", flexWrap: { xs: "wrap", sm: "nowrap" }, gap: "12px" }}>
                <InfoChip value={formatDate(program.enrollmentDate)} label="Enrollment Date" />
                <InfoChip value={program.studentRegistrationNumber || EMPTY} label="Student ID" />
                <InfoChip value={program.rm?.name ?? "Not assigned"} label={longLabels ? "Relationship Manager" : "RM"} />
                <InfoChip value={program.counsellorName || EMPTY} label={longLabels ? "Admission Counsellor" : "Counsellor"} />
            </Box>
        </>
    );
}

export function ProgramsCard({ programs }: { programs: FeeProgram[] }) {
    return (
        <GlassCard>
            <CardTitle>My Programs/Courses</CardTitle>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {programs.map((program) => (
                    <RowBox key={program.purchaseId} sx={{ display: "flex", flexDirection: "column", gap: "32px", p: { xs: "20px", md: "32px" } }}>
                        <ProgramDetails program={program} />
                    </RowBox>
                ))}
            </Box>
        </GlassCard>
    );
}

export function SingleProgramCard({ program }: { program: FeeProgram }) {
    return (
        <GlassCard strong decor={false}>
            <ProgramDetails program={program} longLabels />
        </GlassCard>
    );
}

// ─── Academic documents ────────────────────────────────────────────────────
function documentMeta(doc: FeeDocument) {
    return [formatBytes(doc.documentSize), doc.fileExtension ?? doc.documentType].filter(Boolean).join(" · ");
}

export function AcademicDocumentsCard({ documents }: { documents: FeeDocument[] }) {
    return (
        <GlassCard>
            <CardTitle>Academic Documents</CardTitle>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {documents.length === 0 && <EmptyNote>Your enrollment documents will appear here once they are issued.</EmptyNote>}
                {documents.map((doc) => (
                    <RowBox key={doc.documentId} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", minHeight: 67, px: "16px", py: "12px" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                            <Box sx={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Box component="img" src={profileAsset("icon-pdf.svg")} alt="" aria-hidden sx={{ width: "74.79%", height: "100%" }} />
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                                <Typography sx={{ ...PT.med16, color: PC.n50, ...ellipsis }}>{doc.documentName}</Typography>
                                <Typography sx={{ ...PT.interReg14, color: PC.n300, whiteSpace: "nowrap" }}>{documentMeta(doc)}</Typography>
                            </Box>
                        </Box>
                        <OutlineButton icon="icon-download.svg" onClick={() => window.open(doc.documentUrl, "_blank", "noopener,noreferrer")}>
                            Download
                        </OutlineButton>
                    </RowBox>
                ))}
            </Box>
        </GlassCard>
    );
}

// ─── Help ──────────────────────────────────────────────────────────────────
export function FeeHelpCard({ rmName, onContact }: { rmName: string | null; onContact: () => void }) {
    return (
        <Box
            component="section"
            sx={{
                position: "relative",
                isolation: "isolate",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                gap: { xs: "20px", sm: "32px" },
                p: "24px",
                borderRadius: "30px",
                overflow: "hidden",
                bgcolor: PC.deepNavy,
                "&::before": strokeLayer("linear-gradient(92deg, rgba(255,255,255,0.29) 0%, rgba(255,255,255,0.12) 100%)"),
            }}
        >
            <Box
                aria-hidden
                component="img"
                src={profileAsset("help-card-gradient.svg")}
                alt=""
                sx={{ position: "absolute", left: -174, top: -266, width: 1440, height: 900, maxWidth: "none", zIndex: -1, pointerEvents: "none" }}
            />
            <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                <Typography component="h2" sx={{ ...PT.poppinsSemi20, color: PC.white }}>
                    Need help with fees?
                </Typography>
                <Typography sx={{ ...PT.interReg16, color: PC.n50 }}>
                    Have questions about your fee payments, installment plans, pending dues, or payment confirmations.
                </Typography>
            </Box>
            <ButtonBase
                onClick={onContact}
                sx={{
                    height: 44,
                    px: "12px",
                    borderRadius: "8px",
                    border: `1px solid ${PC.n600}`,
                    ...PT.med14,
                    color: PC.n50,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                }}
            >
                {rmName ? `Contact ${rmName} (RM)` : "Contact your RM"}
            </ButtonBase>
        </Box>
    );
}

// ─── Fee summary ───────────────────────────────────────────────────────────
function AmountColumn({ label, value }: { label: string; value: string }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", whiteSpace: "nowrap" }}>
            <Typography sx={{ ...PT.med12, color: PC.n300 }}>{label}</Typography>
            <Typography sx={{ ...PT.semi18, color: PC.n50 }}>{value}</Typography>
        </Box>
    );
}

function VerticalRule() {
    return (
        <Box aria-hidden sx={{ position: "relative", width: "1px", alignSelf: "stretch", flexShrink: 0 }}>
            <Box
                component="img"
                src={profileAsset("summary-vline.svg")}
                alt=""
                sx={{ position: "absolute", left: "50%", top: "50%", width: 53, height: "1px", transform: "translate(-50%, -50%) rotate(90deg)", maxWidth: "none" }}
            />
        </Box>
    );
}

/** Tick gauge: one tick lights up per 1/26th of the fee paid, left to right. */
function ProgressGauge({ percent }: { percent: number }) {
    const lit = Math.round((Math.max(0, Math.min(100, percent)) / 100) * GAUGE_TICKS.length);
    return (
        <Box component="svg" viewBox={GAUGE_VIEWBOX} aria-hidden sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
            {GAUGE_TICKS.map((d, index) => (
                <path key={index} d={d} fill={index < lit ? "#A78BFA" : "#737373"} />
            ))}
        </Box>
    );
}

function SummaryHeader({ summary }: { summary: FeeSummaryView }) {
    return (
        <Box
            sx={{
                position: "relative",
                isolation: "isolate",
                height: 158,
                overflow: "hidden",
                bgcolor: PC.deepNavy,
                borderRadius: "24px 24px 0 0",
                boxShadow: "inset 0 0 6px rgba(255,255,255,0.16)",
            }}
        >
            {/* Purple wave light + noise texture (Figma "Mask" group). */}
            <Box aria-hidden sx={{ position: "absolute", left: 24.9, top: -185.51, width: 869.077, height: 344.614, transform: "rotate(180deg)", opacity: 0.32, zIndex: -1, pointerEvents: "none" }}>
                <Box component="img" src={profileAsset("summary-waves.svg")} alt="" sx={{ position: "absolute", left: -143.4, top: -99.08, width: 1095.46, height: 521.674, maxWidth: "none" }} />
            </Box>
            <Box
                aria-hidden
                sx={{
                    position: "absolute",
                    left: -2,
                    top: -42,
                    width: 685,
                    height: 355,
                    opacity: 0.32 * 0.1,
                    backgroundImage: `url(${profileAsset("summary-noise.png")})`,
                    backgroundSize: "568px 568px",
                    backgroundPosition: "top left",
                    zIndex: -1,
                    pointerEvents: "none",
                }}
            />

            <Box
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={summary.percent}
                aria-label="Fees paid"
                sx={{
                    position: "absolute",
                    right: -15,
                    top: 2,
                    width: 360,
                    height: 252,
                    display: { xs: "none", sm: "block" },
                }}
            >
                <ProgressGauge percent={summary.percent} />
                <Box sx={{ position: "absolute", left: 145, top: 68, width: 82, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Typography sx={{ fontFamily: PT.poppinsSemi20.fontFamily, fontWeight: 600, fontSize: "38.262px", lineHeight: "57.393px", color: PC.white, textAlign: "center", mb: "-4.25px" }}>
                        {summary.percent}%
                    </Typography>
                    <Typography sx={{ ...PT.med12, color: PC.n300, whiteSpace: "nowrap" }}>Completed</Typography>
                </Box>
            </Box>

            <Typography sx={{ display: { xs: "block", sm: "none" }, position: "absolute", right: 20, top: 21, ...PT.med12, color: PC.n100, whiteSpace: "nowrap" }}>
                {summary.percent}% Completed
            </Typography>
            {summary.combinedLabel && (
                <Typography sx={{ position: "absolute", left: 24, top: 21, ...PT.med12, color: PC.n500, whiteSpace: "nowrap" }}>{summary.combinedLabel}</Typography>
            )}
            <Box sx={{ position: "absolute", left: 24, top: 62.5, display: "flex", alignItems: "center", gap: { xs: "10px", sm: "16px" } }}>
                <AmountColumn label="Total Amount" value={summary.total} />
                <VerticalRule />
                <AmountColumn label="Pending Amount" value={summary.pending} />
                <VerticalRule />
                <AmountColumn label="Paid Amount" value={summary.paid} />
            </Box>
        </Box>
    );
}

function BreakdownRow({ label, amount, pill, danger, muted, hint }: { label: string; amount: string; pill?: string; danger?: boolean; muted?: boolean; hint?: string }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flexWrap: "wrap" }}>
                <Typography sx={{ ...PT.interReg16, color: PC.n200 }}>{label}</Typography>
                {hint && (
                    <Tooltip title={<Box sx={{ whiteSpace: "pre-line" }}>{hint}</Box>} arrow>
                        <Box component="span" tabIndex={0} aria-label={hint} sx={{ display: "inline-flex", cursor: "help", borderRadius: "50%" }}>
                            <PIcon name="icon-alert-circle.svg" size={16} sx={{ transform: "rotate(180deg)" }} />
                        </Box>
                    </Tooltip>
                )}
                {pill && (
                    <StatusPill tone="error" small>
                        {pill}
                    </StatusPill>
                )}
            </Box>
            <Typography sx={{ ...PT.interReg16, color: danger ? PC.error500 : muted ? PC.n400 : PC.n100, whiteSpace: "nowrap" }}>{amount}</Typography>
        </Box>
    );
}

export function FeeSummaryCard({ summary, onPayNow, onPayAllDues }: { summary: FeeSummaryView; onPayNow: () => void; onPayAllDues: () => void }) {
    const hasBreakdown = summary.lines.length > 0 || Boolean(summary.lateFee);
    return (
        <Box
            component="section"
            sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                pb: "32px",
                borderRadius: "24px",
                backgroundImage: PC.cardFillStrong,
                backdropFilter: "blur(12px)",
                boxShadow: "inset 0 0 6px rgba(255,255,255,0.16)",
                "&::before": { ...strokeLayer(PC.cardStroke), opacity: 0.5 },
            }}
        >
            <SummaryHeader summary={summary} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: "32px", px: { xs: "20px", md: "32px" } }}>
                {summary.title && (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <Typography component="h2" sx={{ ...PT.med18, color: PC.white }}>
                                {summary.title}
                            </Typography>
                            {summary.dueOn && <Typography sx={{ ...PT.med14, color: PC.n200 }}>{summary.dueOn}</Typography>}
                        </Box>
                        {summary.status && <StatusPill tone={summary.status.tone}>{summary.status.label}</StatusPill>}
                    </Box>
                )}

                <RowBox sx={{ display: "flex", flexDirection: "column", gap: "24px", px: "16px", py: "12px" }}>
                    {hasBreakdown && (
                        <>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {summary.lines.map((line) => (
                                    <BreakdownRow key={line.key} label={line.label} amount={line.amount} pill={line.pill} muted={line.muted} />
                                ))}
                                {summary.lateFee && <BreakdownRow label="Late Fee" amount={summary.lateFee} danger hint={summary.lateFeeHint} />}
                            </Box>
                            <Box component="img" src={profileAsset("dashed-divider.svg")} alt="" aria-hidden sx={{ display: "block", width: "100%", height: "1px" }} />
                        </>
                    )}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", color: PC.white }}>
                        <Typography sx={{ ...PT.interSemi16 }}>Total Payable</Typography>
                        <Typography sx={{ ...PT.interSemi18, whiteSpace: "nowrap" }}>{summary.totalPayable}</Typography>
                    </Box>
                </RowBox>

                <Box sx={{ display: "flex", flexDirection: "column", gap: hasBreakdown ? "16px" : "20px" }}>
                    <LmsButton sx={{ width: "100%" }} onClick={onPayNow} disabled={!summary.canPay}>
                        {summary.canPay ? "Pay Now" : "No Dues"}
                    </LmsButton>
                    {summary.payAllDues && (
                        <OutlineButton fullWidth textSx={PT.med14} onClick={onPayAllDues}>
                            Pay all dues this month
                            <Box component="img" src={profileAsset("dot-separator.svg")} alt="" aria-hidden sx={{ width: 4, height: 4, mx: "8px", verticalAlign: "middle" }} />
                            {summary.payAllDues}
                        </OutlineButton>
                    )}
                    {summary.note && <Typography sx={{ ...PT.med14, color: PC.n500, textAlign: "center" }}>{summary.note}</Typography>}
                </Box>
            </Box>
        </Box>
    );
}

// ─── Installment timeline ──────────────────────────────────────────────────
function TimelineMarker({ paid, last }: { paid: boolean; last: boolean }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "stretch", pt: "20px", flexShrink: 0 }}>
            {paid ? (
                <Box
                    sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        backgroundImage: PC.gradientTeal,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <PIcon name="icon-check-18.svg" size={18} />
                </Box>
            ) : (
                <PIcon name="timeline-pending.svg" size={28} />
            )}
            {!last && <Box sx={{ flex: 1, width: "1px", backgroundImage: "linear-gradient(180deg, rgba(242,242,242,0.44) 0%, rgba(140,140,140,0.22) 100%)" }} />}
        </Box>
    );
}

function paymentMethod(item: FeeInstallment) {
    const payment = item.payment;
    if (!payment) return "Payment recorded";
    if (payment.atEnrollment) return "Paid at enrollment";
    return [payment.mode, payment.reference].filter(Boolean).join(" · ") || "Payment recorded";
}

function TimelineRow({ item, showProgram, last, onReceipt }: { item: FeeInstallment; showProgram: boolean; last: boolean; onReceipt: (item: FeeInstallment) => void }) {
    const paid = item.status === "paid";
    const name = showProgram ? installmentTitle(item, true) : item.label;
    const title = paid
        ? `Paid ${formatINR(item.amount, { space: false })} on ${formatOrdinalDate(item.payment?.paidOn ?? item.dueDate)}`
        : name;
    const subtitle = paid
        ? `${showProgram ? `${name} · ` : ""}${paymentMethod(item)}`
        : item.isPartiallyPaid
            ? `${formatINR(item.outstandingAmount)} left of ${formatINR(item.amount)}`
            : formatINR(item.amount);
    const dueColor = item.status === "overdue" ? PC.error500 : item.status === "due_today" ? PC.warning500 : PC.n300;
    return (
        <Box sx={{ display: "flex", gap: "12px" }}>
            <TimelineMarker paid={paid} last={last} />
            <RowBox sx={{ flex: 1, minWidth: 0, minHeight: 70, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", px: "16px", py: "12px", flexWrap: { xs: "wrap", sm: "nowrap" } }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                    <Typography sx={{ ...PT.med16, color: PC.white }}>{title}</Typography>
                    <Typography sx={{ ...PT.reg12, color: PC.n300 }}>{subtitle}</Typography>
                </Box>
                {paid ? (
                    <OutlineButton icon="icon-download.svg" onClick={() => onReceipt(item)}>
                        Download Receipt
                    </OutlineButton>
                ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: { xs: "flex-start", sm: "flex-end" }, gap: "2px" }}>
                        <Typography sx={{ ...PT.med12, color: dueColor, whiteSpace: "nowrap" }}>
                            {item.status === "due_today" ? "Due Today" : `Due on ${formatDate(item.dueDate)}`}
                        </Typography>
                        {item.status === "overdue" && (
                            <Typography sx={{ ...PT.med12, color: PC.error500, whiteSpace: "nowrap" }}>
                                {`Overdue by ${pluralDays(item.daysOverdue)} · +${formatINR(item.lateFee, { space: false })} late fee`}
                            </Typography>
                        )}
                    </Box>
                )}
            </RowBox>
        </Box>
    );
}

export function InstallmentTimelineCard({ fees, onReceipt }: { fees: StudentFees; onReceipt: (item: FeeInstallment) => void }) {
    const multi = fees.programs.length > 1;
    const tabs = useMemo(
        () => (multi ? [{ id: "all", label: "All" }, ...fees.programs.map((p) => ({ id: p.purchaseId, label: p.shortName }))] : []),
        [multi, fees.programs],
    );
    // Default to the program of the next due installment, like the Figma "before due" state.
    const [tab, setTab] = useState(() => (multi ? fees.summary.nextDue?.purchaseId ?? "all" : "all"));
    const items = tab === "all" ? fees.installments : fees.installments.filter((i) => i.purchaseId === tab);
    const paidCount = items.filter((i) => i.status === "paid").length;

    return (
        <GlassCard>
            <CardTitle action={<Typography sx={{ ...PT.med14, color: PC.white, whiteSpace: "nowrap", pl: "16px", pr: "12px" }}>{`${paidCount}/${items.length} Installments Paid`}</Typography>}>
                Installment Timeline
            </CardTitle>
            {multi && <SegmentedTabs options={tabs} value={tab} onChange={setTab} stretch inactiveWidth={149} />}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {items.length === 0 && <EmptyNote>No installments scheduled.</EmptyNote>}
                {items.map((item, index) => (
                    <TimelineRow key={item.scheduleId} item={item} showProgram={multi && tab === "all"} last={index === items.length - 1} onReceipt={onReceipt} />
                ))}
            </Box>
        </GlassCard>
    );
}
