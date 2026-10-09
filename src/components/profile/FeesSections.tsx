"use client";

import React, { useState } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { LmsButton } from "@/components/community/community-ui";
import {
    ACADEMIC_DOCUMENTS,
    FeeSummary,
    PC,
    Program,
    TIMELINE,
    TIMELINE_TABS,
    TimelineItem,
    profileAsset,
} from "./profile-data";
import { CardTitle, GlassCard, OutlineButton, PIcon, PT, RowBox, SegmentedTabs, StatusPill, ellipsis, strokeLayer } from "./profile-ui";

// ─── Programs ──────────────────────────────────────────────────────────────
function InfoChip({ value, label }: { value: string; label: string }) {
    return (
        <Box
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

function MetaItem({ icon, children }: { icon: string; children: React.ReactNode }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <PIcon name={icon} size={20} />
            <Typography sx={{ ...PT.med16, color: PC.n200, whiteSpace: "nowrap" }}>{children}</Typography>
        </Box>
    );
}

function ProgramStatusPill({ status }: { status: Program["status"] }) {
    return (
        <Box sx={{ px: "12px", py: "4px", borderRadius: "99px", backgroundImage: status === "active" ? PC.gradientActive : PC.gradientNew, flexShrink: 0 }}>
            <Typography sx={{ ...PT.med16, color: PC.n50, whiteSpace: "nowrap" }}>{status === "active" ? "Active" : "New"}</Typography>
        </Box>
    );
}

function ProgramDetails({ program, longLabels }: { program: Program; longLabels?: boolean }) {
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
                    <MetaItem icon="icon-calendar.svg">{program.duration}</MetaItem>
                    {program.courses && <MetaItem icon="icon-book-open.svg">{program.courses}</MetaItem>}
                    <MetaItem icon="icon-star.svg">{program.benefits}</MetaItem>
                </Box>
            </Box>
            <Box sx={{ display: "flex", flexWrap: { xs: "wrap", sm: "nowrap" }, gap: "12px" }}>
                <InfoChip value={program.enrollmentDate} label="Enrollment Date" />
                <InfoChip value={program.studentId} label="Student ID" />
                <InfoChip value={program.rm} label={longLabels ? "Relationship Manager" : "RM"} />
                <InfoChip value={program.counsellor} label={longLabels ? "Admission Counsellor" : "Counsellor"} />
            </Box>
        </>
    );
}

export function ProgramsCard({ programs }: { programs: Program[] }) {
    return (
        <GlassCard>
            <CardTitle>My Programs/Courses</CardTitle>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {programs.map((program) => (
                    <RowBox key={program.id} sx={{ display: "flex", flexDirection: "column", gap: "32px", p: { xs: "20px", md: "32px" } }}>
                        <ProgramDetails program={program} />
                    </RowBox>
                ))}
            </Box>
        </GlassCard>
    );
}

export function SingleProgramCard({ program }: { program: Program }) {
    return (
        <GlassCard strong decor={false}>
            <ProgramDetails program={program} longLabels />
        </GlassCard>
    );
}

// ─── Academic documents ────────────────────────────────────────────────────
export function AcademicDocumentsCard() {
    return (
        <GlassCard>
            <CardTitle>Academic Documents</CardTitle>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {ACADEMIC_DOCUMENTS.map((doc) => (
                    <RowBox key={doc.name} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", minHeight: 67, px: "16px", py: "12px" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                            <Box sx={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Box component="img" src={profileAsset("icon-pdf.svg")} alt="" aria-hidden sx={{ width: "74.79%", height: "100%" }} />
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                                <Typography sx={{ ...PT.med16, color: PC.n50, ...ellipsis }}>{doc.name}</Typography>
                                <Typography sx={{ ...PT.interReg14, color: PC.n300, whiteSpace: "nowrap" }}>{doc.meta}</Typography>
                            </Box>
                        </Box>
                        <OutlineButton icon="icon-download.svg">Download</OutlineButton>
                    </RowBox>
                ))}
            </Box>
        </GlassCard>
    );
}

// ─── Help ──────────────────────────────────────────────────────────────────
export function FeeHelpCard({ rm }: { rm: string }) {
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
                Contact {rm} (RM)
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

function SummaryHeader({ summary }: { summary: FeeSummary }) {
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

            {/* Tick gauge (static Figma render of the current completion). */}
            <Box
                sx={{
                    position: "absolute",
                    right: -15,
                    top: 2,
                    width: 360,
                    height: 252,
                    display: { xs: "none", sm: "block" },
                }}
            >
                <Box component="img" src={profileAsset("progress-arc.svg")} alt="" aria-hidden sx={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
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

function BreakdownRow({ label, amount, pill, danger, info }: { label: string; amount: string; pill?: string; danger?: boolean; info?: boolean }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flexWrap: "wrap" }}>
                <Typography sx={{ ...PT.interReg16, color: PC.n200 }}>{label}</Typography>
                {info && <PIcon name="icon-alert-circle.svg" size={16} sx={{ transform: "rotate(180deg)" }} />}
                {pill && (
                    <StatusPill tone="error" small>
                        {pill}
                    </StatusPill>
                )}
            </Box>
            <Typography sx={{ ...PT.interReg16, color: danger ? PC.error500 : PC.n100, whiteSpace: "nowrap" }}>{amount}</Typography>
        </Box>
    );
}

export function FeeSummaryCard({ summary }: { summary: FeeSummary }) {
    const hasBreakdown = Boolean(summary.lines?.length);
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
                            <Typography sx={{ ...PT.med14, color: PC.n200 }}>{summary.dueOn}</Typography>
                        </Box>
                        {summary.status && <StatusPill tone={summary.status.tone}>{summary.status.label}</StatusPill>}
                    </Box>
                )}

                <RowBox sx={{ display: "flex", flexDirection: "column", gap: "24px", px: "16px", py: "12px" }}>
                    {hasBreakdown && (
                        <>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {summary.lines!.map((line) => (
                                    <BreakdownRow key={line.label} label={line.label} amount={line.amount} pill={line.pill} />
                                ))}
                                {summary.lateFee && <BreakdownRow label="Late Fee" amount={summary.lateFee} danger info />}
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
                    <LmsButton sx={{ width: "100%" }}>Pay Now</LmsButton>
                    {summary.payAllDues && (
                        <OutlineButton fullWidth textSx={PT.med14}>
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

function TimelineRow({ item, showProgram, last }: { item: TimelineItem; showProgram: boolean; last: boolean }) {
    const programName = TIMELINE_TABS.find((t) => t.id === item.programId)?.label;
    const title = item.paid ? item.paid.title : showProgram ? `${programName} - ${item.label}` : item.label;
    return (
        <Box sx={{ display: "flex", gap: "12px" }}>
            <TimelineMarker paid={Boolean(item.paid)} last={last} />
            <RowBox sx={{ flex: 1, minWidth: 0, minHeight: 70, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", px: "16px", py: "12px", flexWrap: { xs: "wrap", sm: "nowrap" } }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                    <Typography sx={{ ...PT.med16, color: PC.white }}>{title}</Typography>
                    <Typography sx={{ ...PT.reg12, color: PC.n300, whiteSpace: "nowrap" }}>{item.paid ? item.paid.method : item.amount}</Typography>
                </Box>
                {item.paid ? (
                    <OutlineButton icon="icon-download.svg">Download Receipt</OutlineButton>
                ) : (
                    <Typography sx={{ ...PT.med12, color: PC.n300, whiteSpace: "nowrap" }}>{item.due}</Typography>
                )}
            </RowBox>
        </Box>
    );
}

export function InstallmentTimelineCard({ defaultTab }: { defaultTab: string }) {
    const [tab, setTab] = useState(defaultTab);
    const items = tab === "all" ? TIMELINE : TIMELINE.filter((i) => i.programId === tab);
    const paidCount = items.filter((i) => i.paid).length;

    return (
        <GlassCard>
            <CardTitle action={<Typography sx={{ ...PT.med14, color: PC.white, whiteSpace: "nowrap", pl: "16px", pr: "12px" }}>{`${paidCount}/${items.length} Installments Paid`}</Typography>}>
                Installment Timeline
            </CardTitle>
            <SegmentedTabs options={TIMELINE_TABS} value={tab} onChange={setTab} stretch inactiveWidth={149} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {items.map((item, index) => (
                    <TimelineRow key={item.id} item={item} showProgram={tab === "all"} last={index === items.length - 1} />
                ))}
            </Box>
        </GlassCard>
    );
}
