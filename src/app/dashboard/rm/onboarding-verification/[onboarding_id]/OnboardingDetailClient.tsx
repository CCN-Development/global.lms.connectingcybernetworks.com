"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    Badge, Banknote, BookOpen, Building2, Calendar, CheckCircle2, CreditCard,
    Download, ExternalLink, FileText, Files, GraduationCap, IdCard, Image as ImageIcon,
    Loader2, Mail, MapPin, Phone, ReceiptText, ShieldCheck, User, UserPlus, Users, Wallet, XCircle,
} from "lucide-react";
import {
    Box, Button, Chip, Fab, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Tab, Tabs,
} from "@mui/material";
import { useRM, type OnboardingDetail, type OnboardingFile } from "@/contexts/RMContext";
import CreateStudentModal from "./CreateStudentModal";
import { InfoChip, Panel, PanelRow, Surface } from "../../student-profiles/[student_id]/ui";
import {
    BRAND, CheckPill, EmptyBlock, StatCard, TagList,
    asText, formatDate, formatDateTime, formatFileSize, formatMoney, labelList, titleCase,
} from "./ui";

type TabKey = "overview" | "address" | "family" | "training" | "payments" | "kyc" | "files";

const TABS: { id: TabKey; label: string; icon: React.ComponentType<{ size?: number }>; color: string }[] = [
    { id: "overview", label: "Overview", icon: User, color: BRAND.primary },
    { id: "address", label: "Address", icon: MapPin, color: BRAND.emerald },
    { id: "family", label: "Parent & Education", icon: Users, color: BRAND.violet },
    { id: "training", label: "Training", icon: GraduationCap, color: BRAND.cyan },
    { id: "payments", label: "Payments", icon: Wallet, color: BRAND.orange },
    { id: "kyc", label: "Aadhaar KYC", icon: IdCard, color: BRAND.rose },
    { id: "files", label: "Files", icon: Files, color: BRAND.amber },
];

/* Shape of the Cashfree/Aadhaar payload persisted in `adhaarJsonData`. */
type AdhaarJson = {
    reference_id?: number | string;
    status?: string;
    message?: string;
    care_of?: string;
    full_address?: string;
    date_of_birth?: string;
    gender?: string;
    name?: string;
    year_of_birth?: number;
    share_code?: string;
    photo?: string;
    address?: {
        country?: string; district?: string; house?: string; landmark?: string;
        pincode?: number | string; post_office?: string; state?: string;
        street?: string; subdistrict?: string; vtc?: string;
    };
};

function parseAdhaar(raw: string | null | undefined): AdhaarJson | null {
    if (!raw) return null;
    try {
        const parsed: unknown = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? (parsed as AdhaarJson) : null;
    } catch {
        return null;
    }
}

export default function OnboardingDetailClient({ onboardingId }: { onboardingId: string }) {
    const { getOnboardingById } = useRM();

    const [onboarding, setOnboarding] = useState<OnboardingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>("overview");
    const [createOpen, setCreateOpen] = useState(false);

    const load = useCallback(async () => {
        const res = await getOnboardingById(onboardingId);
        if (res.success && res.data) setOnboarding(res.data);
        else toast.error(res.message ?? "Failed to load onboarding");
    }, [getOnboardingById, onboardingId]);

    useEffect(() => {
        setLoading(true);
        load().finally(() => setLoading(false));
    }, [load]);

    const collected = useMemo(
        () => (onboarding?.onboardingCollectionsDatas ?? []).reduce((sum, c) => sum + (c.paidAmount ?? 0), 0),
        [onboarding],
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full p-6">
                <Loader2 size={20} className="animate-spin" style={{ color: BRAND.primary }} />
            </div>
        );
    }

    if (!onboarding) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-gray-500">
                <XCircle size={28} className="mb-2" style={{ color: BRAND.rose }} />
                <p className="text-sm">Onboarding record not found.</p>
                <Link href="/dashboard/rm/onboarding-verification" className="text-xs hover:underline mt-2" style={{ color: BRAND.primary }}>
                    Back to list
                </Link>
            </div>
        );
    }

    const balance = Math.max((onboarding.finalPayableAmount ?? 0) - collected, 0);

    return (
        <div className="flex flex-col gap-3 h-full overflow-y-auto">
            <HeaderCard onboarding={onboarding} />

            {/* Verification checklist */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <CheckPill label="Aadhaar KYC" done={onboarding.isAdhaarVerified} />
                <CheckPill label="Documents" done={onboarding.isDocumentsVerified} />
                <CheckPill label="Parent phone" done={onboarding.isParentPhoneVerified} />
                <CheckPill label="Payment" done={onboarding.isPaymentCompleted} doneLabel="Completed" />
            </div>

            {/* Money summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <StatCard
                    label="Final payable" value={formatMoney(onboarding.finalPayableAmount)}
                    color={BRAND.primary} bg={BRAND.skyBg} icon={<Banknote size={16} />}
                />
                <StatCard
                    label="Onboarding Amount" value={formatMoney(onboarding.amountToBePaid)}
                    color={BRAND.orange} bg={BRAND.orangeBg} icon={<CreditCard size={16} />}
                />
                <StatCard
                    label="Collected" value={formatMoney(collected)}
                    hint={`${onboarding.onboardingCollectionsDatas.length} entr${onboarding.onboardingCollectionsDatas.length === 1 ? "y" : "ies"}`}
                    color={BRAND.emerald} bg={BRAND.emeraldBg} icon={<ReceiptText size={16} />}
                />
                <StatCard
                    label="Balance" value={formatMoney(balance)}
                    color={balance > 0 ? BRAND.rose : BRAND.emerald}
                    bg={balance > 0 ? BRAND.roseBg : BRAND.emeraldBg}
                    icon={<Wallet size={16} />}
                />
            </div>

            {/* Tabs */}
            <Paper elevation={0} sx={{ p: 0.5, borderRadius: "10px", border: "1px solid #e5e7eb", bgcolor: "#f9fafb", width: "fit-content", maxWidth: "100%" }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v as TabKey)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    slotProps={{ indicator: { style: { display: "none" } } }}
                    sx={{ minHeight: 36 }}
                >
                    {TABS.map((t) => (
                        <Tab
                            key={t.id}
                            value={t.id}
                            icon={<t.icon size={14} />}
                            iconPosition="start"
                            label={t.label}
                            sx={{
                                minHeight: 36, textTransform: "none", fontSize: "0.75rem", fontWeight: 600,
                                gap: 0.5, minWidth: "auto", px: 1.75, py: 0.75, mx: 0.25, borderRadius: "9px",
                                color: "#6b7280", transition: "background-color .15s ease, color .15s ease",
                                "&:hover": { backgroundColor: "#f1f5f9" },
                                "&.Mui-selected": { color: "#fff", backgroundColor: t.color },
                            }}
                        />
                    ))}
                </Tabs>
            </Paper>

            {activeTab === "overview" && <OverviewTab onboarding={onboarding} />}
            {activeTab === "address" && <AddressTab onboarding={onboarding} />}
            {activeTab === "family" && <FamilyTab onboarding={onboarding} />}
            {activeTab === "training" && <TrainingTab onboarding={onboarding} />}
            {activeTab === "payments" && <PaymentsTab onboarding={onboarding} collected={collected} />}
            {activeTab === "kyc" && <KycTab onboarding={onboarding} />}
            {activeTab === "files" && <FilesTab files={onboarding.files ?? []} />}

            {!onboarding.isApproved && (
                <Fab
                    variant="extended"
                    onClick={() => setCreateOpen(true)}
                    sx={{
                        position: "fixed", right: { xs: 16, sm: 24 }, bottom: { xs: 16, sm: 24 }, zIndex: 1200,
                        textTransform: "none", fontWeight: 700, fontSize: "0.75rem", color: "#fff", gap: 0.75,
                        background: `linear-gradient(90deg, ${BRAND.primary} 0%, ${BRAND.violet} 100%)`,
                        "&:hover": { filter: "brightness(0.92)" },
                    }}
                >
                    <UserPlus size={16} />
                    Create student profile
                </Fab>
            )}

            <CreateStudentModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onboarding={onboarding}
                onCreated={() => { void load(); }}
            />
        </div>
    );
}

/* ============================================================== */
/* Header                                                          */
/* ============================================================== */

function HeaderCard({ onboarding }: { onboarding: OnboardingDetail }) {
    const initials = (onboarding.fullName ?? "")
        .split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase()).join("");

    const applicationPdf = asText(onboarding.ApplicationPDF);
    const receipt = asText(onboarding.paymentReciept);

    return (
        <Paper
            elevation={5}
            sx={{ borderRadius: "10px", border: `1px solid ${BRAND.primary}`, transition: "box-shadow .2s", "&:hover": { boxShadow: 6 } }}
        >
            <Box
                sx={{
                    minHeight: { xs: 84, sm: 120 },
                    background: `linear-gradient(90deg, ${BRAND.primary} 0%, ${BRAND.violet} 100%)`,
                    borderRadius: "10px 10px 0 0",
                    position: "relative",
                    px: 1.5, py: 1.25,
                }}
            >
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <Link href="/dashboard/rm/onboarding-verification" className="text-[11px] font-semibold text-white hover:underline">
                        ← All onboardings
                    </Link>
                    <div className="flex flex-wrap items-center gap-1.5">
                        {applicationPdf && (
                            <HeaderLinkButton href={applicationPdf} icon={<FileText size={12} />} label="Application PDF" />
                        )}
                        {receipt && (
                            <HeaderLinkButton href={receipt} icon={<ReceiptText size={12} />} label="Receipt" />
                        )}
                        {onboarding.studentId && (
                            <HeaderLinkButton
                                href={`/dashboard/rm/student-profiles/${onboarding.studentId}`}
                                icon={<ExternalLink size={12} />}
                                label="Student profile"
                                internal
                            />
                        )}
                    </div>
                </div>
            </Box>

            <div className="px-4 sm:px-6 pb-4">
                <div className="flex flex-col items-center text-center sm:flex-row sm:items-end sm:text-left gap-3 -mt-10 sm:-mt-16">
                    <div className="relative shrink-0 w-20 h-20 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
                        {onboarding.photoURL ? (
                            <Box
                                component="img"
                                src={onboarding.photoURL}
                                alt={onboarding.fullName ?? "Applicant"}
                                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center text-2xl font-semibold"
                                style={{ backgroundColor: BRAND.violetBg, color: BRAND.violet }}
                            >
                                {initials || <User size={22} />}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0 pb-1">
                        <h2 className="text-lg font-bold text-gray-900 leading-tight truncate">
                            {onboarding.fullName || "Unnamed applicant"}
                        </h2>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-1">
                            {onboarding.formNumber && (
                                <span className="text-[11px] text-gray-500 font-mono">#{onboarding.formNumber}</span>
                            )}
                            <StateChip
                                label={onboarding.isApproved ? "Approved" : "Awaiting approval"}
                                color={onboarding.isApproved ? BRAND.emerald : BRAND.amber}
                                icon={onboarding.isApproved ? <CheckCircle2 size={11} color="#fff" /> : <XCircle size={11} color="#fff" />}
                            />
                            <StateChip
                                label={onboarding.isOnboarded ? "Onboarded" : "In progress"}
                                color={onboarding.isOnboarded ? BRAND.primary : BRAND.orange}
                                icon={<ShieldCheck size={11} color="#fff" />}
                            />
                            {onboarding.currentStep && (
                                <StateChip label={`Step: ${titleCase(onboarding.currentStep)}`} color={BRAND.violet} icon={<Badge size={11} color="#fff" />} />
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-3">
                    <InfoChip
                        icon={<Phone size={11} />}
                        label={`+${onboarding.countryCode ?? ""} ${onboarding.phoneNumber ?? ""}`.trim()}
                        color={BRAND.sky} bg={BRAND.skyBg}
                    />
                    {onboarding.alternateContactNumber && (
                        <InfoChip icon={<Phone size={11} />} label={onboarding.alternateContactNumber} color={BRAND.cyan} bg={BRAND.cyanBg} />
                    )}
                    {onboarding.email && <InfoChip icon={<Mail size={11} />} label={onboarding.email} color={BRAND.violet} bg={BRAND.violetBg} />}
                    {onboarding.dateOfBirth && (
                        <InfoChip icon={<Calendar size={11} />} label={formatDate(onboarding.dateOfBirth)} color={BRAND.amber} bg={BRAND.amberBg} />
                    )}
                    {onboarding.gender && <InfoChip icon={<User size={11} />} label={titleCase(onboarding.gender)} color={BRAND.emerald} bg={BRAND.emeraldBg} />}
                    {onboarding.selectedBranch && (
                        <InfoChip icon={<Building2 size={11} />} label={onboarding.selectedBranch} color={BRAND.rose} bg={BRAND.roseBg} />
                    )}
                </div>
            </div>
        </Paper>
    );
}

function HeaderLinkButton({ href, icon, label, internal }: { href: string; icon: React.ReactNode; label: string; internal?: boolean }) {
    return (
        <Button
            component={internal ? Link : "a"}
            href={href}
            {...(internal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
            size="small"
            variant="contained"
            startIcon={icon}
            sx={{
                textTransform: "none", borderRadius: "8px", fontSize: "0.68rem", fontWeight: 700,
                py: 0.35, bgcolor: "#fff", color: BRAND.primary, boxShadow: "0 2px 8px rgba(15,23,42,0.25)",
                "&:hover": { bgcolor: "#f8fafc" },
            }}
        >
            {label}
        </Button>
    );
}

function StateChip({ label, color, icon }: { label: string; color: string; icon: React.ReactNode }) {
    return (
        <Chip
            size="small"
            icon={<Box component="span" sx={{ display: "flex", ml: "6px" }}>{icon}</Box>}
            label={label}
            sx={{ height: 22, fontSize: "0.65rem", fontWeight: 700, bgcolor: color, color: "#fff", borderRadius: "6px" }}
        />
    );
}

/* ============================================================== */
/* Tabs                                                            */
/* ============================================================== */

function OverviewTab({ onboarding }: { onboarding: OnboardingDetail }) {
    const flags: { label: string; value: boolean; color: string }[] = [
        { label: "WhatsApp contact", value: onboarding.isWhatsappContact, color: BRAND.emerald },
        { label: "Old student", value: onboarding.isOldStudent, color: BRAND.violet },
        { label: "Conversion found", value: onboarding.isConversionFound, color: BRAND.cyan },
        { label: "Migrated record", value: onboarding.isOldData, color: BRAND.amber },
        { label: "Dropped out", value: onboarding.isDroppedOut, color: BRAND.rose },
        { label: "Placed", value: onboarding.isPlaced, color: BRAND.primary },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            <Panel title="Applicant" icon={<User size={12} />} color={BRAND.primary} bg={BRAND.skyBg}>
                <PanelRow label="Full name" value={onboarding.fullName} />
                <PanelRow label="Gender" value={onboarding.gender ? titleCase(onboarding.gender) : ""} />
                <PanelRow label="Date of birth" value={formatDate(onboarding.dateOfBirth)} />
                <PanelRow label="Form number" value={onboarding.formNumber} mono copy />
                <PanelRow label="Onboarding ID" value={onboarding.onboardingId} mono copy />
            </Panel>

            <Panel title="Contact" icon={<Phone size={12} />} color={BRAND.violet} bg={BRAND.violetBg}>
                <PanelRow label="Phone" value={`+${onboarding.countryCode ?? ""} ${onboarding.phoneNumber ?? ""}`.trim()} mono copy />
                <PanelRow label="Alternate" value={onboarding.alternateContactNumber} mono copy />
                <PanelRow label="Email" value={onboarding.email} copy />
                <PanelRow label="WhatsApp" value={onboarding.isWhatsappContact ? "Yes" : "No"} />
            </Panel>

            <Panel title="Record" icon={<Calendar size={12} />} color={BRAND.emerald} bg={BRAND.emeraldBg}>
                <PanelRow label="Current step" value={onboarding.currentStep ? titleCase(onboarding.currentStep) : ""} />
                <PanelRow label="Created" value={formatDateTime(onboarding.createdAt)} />
                <PanelRow label="Last updated" value={formatDateTime(onboarding.updatedAt)} />
                <PanelRow label="Referred by" value={asText(onboarding.studentReferrerId)} mono />
                <PanelRow label="Student ID" value={onboarding.studentId ?? ""} mono copy />
            </Panel>

            <div className="lg:col-span-3">
                <Panel title="Flags" icon={<ShieldCheck size={12} />} color={BRAND.cyan} bg={BRAND.cyanBg}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
                        {flags.map((f) => (
                            <div
                                key={f.label}
                                className="rounded-lg px-2 py-1.5 text-center"
                                style={{
                                    border: `1px solid ${f.value ? f.color : "#e5e7eb"}`,
                                    backgroundColor: f.value ? "#ffffff" : "#f9fafb",
                                }}
                            >
                                <p className="text-[10px] text-gray-500 truncate">{f.label}</p>
                                <p className="text-[11px] font-bold" style={{ color: f.value ? f.color : "#9ca3af" }}>
                                    {f.value ? "Yes" : "No"}
                                </p>
                            </div>
                        ))}
                    </div>
                </Panel>
            </div>
        </div>
    );
}

function AddressTab({ onboarding }: { onboarding: OnboardingDetail }) {
    const currentMap = asText(onboarding.currentGoogleMapRef);
    const permanentMap = asText(onboarding.permanentGoogleMapRef);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <Panel title="Current address" icon={<MapPin size={12} />} color={BRAND.emerald} bg={BRAND.emeraldBg}>
                <PanelRow label="Street" value={onboarding.currentStreetAddress} />
                <PanelRow label="Apt / Suite" value={onboarding.currentAptSuite} />
                <PanelRow label="City" value={onboarding.currentCity} />
                <PanelRow label="State" value={onboarding.currentState} />
                <PanelRow label="Zip code" value={onboarding.currentZipCode} mono />
                <PanelRow label="Map reference" value={currentMap} />
                <PanelRow label="Coordinates" value={[asText(onboarding.lattitude), asText(onboarding.longitude)].filter(Boolean).join(", ")} mono />
            </Panel>

            <Panel title="Permanent address" icon={<MapPin size={12} />} color={BRAND.violet} bg={BRAND.violetBg}>
                <PanelRow label="Street" value={onboarding.permanentStreetAddress} />
                <PanelRow label="Apt / Suite" value={onboarding.permanentAptSuite} />
                <PanelRow label="City" value={onboarding.permanentCity} />
                <PanelRow label="State" value={onboarding.permanentState} />
                <PanelRow label="Zip code" value={onboarding.permanentZipCode} mono />
                <PanelRow label="Map reference" value={permanentMap} />
            </Panel>
        </div>
    );
}

function FamilyTab({ onboarding }: { onboarding: OnboardingDetail }) {
    const signature = asText(onboarding.parentSignature);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <Panel title="Parent / Guardian" icon={<Users size={12} />} color={BRAND.violet} bg={BRAND.violetBg}>
                <PanelRow label="Name" value={onboarding.parentName} />
                <PanelRow label="Relation" value={onboarding.relationWithParent ? titleCase(onboarding.relationWithParent) : ""} />
                <PanelRow label="Phone" value={`${onboarding.parentCountryCode ? `+${onboarding.parentCountryCode} ` : ""}${onboarding.parentContactNumber ?? ""}`.trim()} mono copy />
                <PanelRow label="Email" value={onboarding.parentEmail} copy />
                <PanelRow label="Phone verified" value={onboarding.isParentPhoneVerified ? "Yes" : "No"} />
                {signature && (
                    <div className="pt-1.5 mt-1 border-t border-gray-100">
                        <p className="text-[10px] text-gray-400 mb-1">Signature</p>
                        <Box
                            component="img"
                            src={signature}
                            alt="Parent signature"
                            sx={{ maxHeight: 90, borderRadius: "6px", border: "1px solid #e5e7eb", backgroundColor: "#fff" }}
                        />
                    </div>
                )}
            </Panel>

            <Panel title="Education" icon={<GraduationCap size={12} />} color={BRAND.amber} bg={BRAND.amberBg}>
                <PanelRow label="Highest level" value={onboarding.highestEducationLevel} />
                <PanelRow label="Institution" value={onboarding.institutionName} />
                <PanelRow label="Google reference" value={asText(onboarding.googleInstitutionReference)} />
                <PanelRow label="Submitted document" value={onboarding.submittedDocument} />
                <PanelRow label="Documents verified" value={onboarding.isDocumentsVerified ? "Yes" : "No"} />
            </Panel>
        </div>
    );
}

function TrainingTab({ onboarding }: { onboarding: OnboardingDetail }) {
    const packages = labelList(onboarding.packageReference, onboarding.packagesSelected);
    const courses = labelList(onboarding.courseReference, onboarding.coursesSelected);
    const benefits = labelList(null, onboarding.benefitsSelected);

    return (
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                <Panel title="Training preference" icon={<GraduationCap size={12} />} color={BRAND.cyan} bg={BRAND.cyanBg}>
                    <PanelRow label="Training option" value={onboarding.trainingOptionSelected ? titleCase(onboarding.trainingOptionSelected) : ""} />
                    <PanelRow label="Learning mode" value={onboarding.preferredLearningMode ? titleCase(onboarding.preferredLearningMode) : ""} />
                    <PanelRow label="Branch" value={onboarding.selectedBranch} />
                    <PanelRow label="Discount code" value={asText(onboarding.discountCode)} mono />
                </Panel>

                <Panel title="Selection summary" icon={<BookOpen size={12} />} color={BRAND.primary} bg={BRAND.skyBg}>
                    <PanelRow label="Packages" value={String(packages.length)} />
                    <PanelRow label="Courses" value={String(courses.length)} />
                    <PanelRow label="Benefits" value={String(benefits.length)} />
                    <PanelRow label="Final payable" value={formatMoney(onboarding.finalPayableAmount)} />
                </Panel>
            </div>

            <Surface accent={BRAND.violet} className="p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">Packages selected</p>
                <TagList items={packages} color={BRAND.violet} bg={BRAND.violetBg} empty="No packages selected" />
            </Surface>

            <Surface accent={BRAND.emerald} className="p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">Courses selected</p>
                <TagList items={courses} color={BRAND.emerald} bg={BRAND.emeraldBg} empty="No courses selected" />
            </Surface>

            <Surface accent={BRAND.amber} className="p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">Benefits selected</p>
                <TagList items={benefits} color={BRAND.amber} bg={BRAND.amberBg} empty="No benefits selected" />
            </Surface>
        </div>
    );
}

function PaymentsTab({ onboarding, collected }: { onboarding: OnboardingDetail; collected: number }) {
    const installments = Array.isArray(onboarding.installmentAmounts) ? onboarding.installmentAmounts : [];
    const collections = onboarding.onboardingCollectionsDatas ?? [];

    return (
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                <Panel title="Payment plan" icon={<CreditCard size={12} />} color={BRAND.orange} bg={BRAND.orangeBg}>
                    <PanelRow label="Preference" value={onboarding.paymentPreferenceSelection ? titleCase(onboarding.paymentPreferenceSelection) : ""} />
                    <PanelRow label="Mode" value={onboarding.paymentMode ? titleCase(onboarding.paymentMode) : ""} />
                    <PanelRow label="Installments" value={onboarding.noOfInstallments ? String(onboarding.noOfInstallments) : ""} />
                    <PanelRow label="Transaction ID" value={onboarding.transactionId} mono copy />
                    <PanelRow label="Payment completed" value={onboarding.isPaymentCompleted ? "Yes" : "No"} />
                </Panel>

                <Panel title="Amounts" icon={<Banknote size={12} />} color={BRAND.emerald} bg={BRAND.emeraldBg}>
                    <PanelRow label="Final payable" value={formatMoney(onboarding.finalPayableAmount)} />
                    <PanelRow label="Due now" value={formatMoney(onboarding.amountToBePaid)} />
                    <PanelRow label="Collected" value={formatMoney(collected)} />
                    <PanelRow label="Balance" value={formatMoney(Math.max((onboarding.finalPayableAmount ?? 0) - collected, 0))} />
                </Panel>
            </div>

            {installments.length > 0 && (
                <Surface accent={BRAND.sky} className="p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">Installment schedule</p>
                    <TagList
                        items={installments.map((amount, i) => `#${i + 1} · ${asText(amount)}`)}
                        color={BRAND.sky} bg={BRAND.skyBg}
                    />
                </Surface>
            )}

            <Surface accent={BRAND.primary} className="p-0 overflow-hidden">
                <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">Collections</p>
                    <Chip
                        size="small"
                        label={`${collections.length} record${collections.length === 1 ? "" : "s"}`}
                        sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, bgcolor: BRAND.skyBg, color: BRAND.primary, border: `1px solid ${BRAND.primary}` }}
                    />
                </div>

                {collections.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400">No collection entries recorded.</div>
                ) : (
                    <TableContainer>
                        <Table size="small" sx={{ minWidth: 620 }}>
                            <TableHead>
                                <TableRow>
                                    {["Date", "Amount", "Mode", "Phone", "Proofs", "Status"].map((h, i) => (
                                        <TableCell
                                            key={h}
                                            align={i === 1 ? "right" : "left"}
                                            sx={{
                                                py: 1, px: 1.5, fontSize: 10, fontWeight: 800, letterSpacing: ".06em",
                                                textTransform: "uppercase", color: "#fff", borderBottom: "none",
                                                whiteSpace: "nowrap",
                                                background: `linear-gradient(90deg, ${BRAND.primary} 0%, ${BRAND.violet} 100%)`,
                                                ...(h === "Phone" || h === "Proofs" ? { display: { xs: "none", md: "table-cell" } } : {}),
                                            }}
                                        >
                                            {h}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {collections.map((c) => (
                                    <TableRow key={c.onboardingCollectionsDataId} hover sx={{ "&:hover": { backgroundColor: "#f5f3ff" }, transition: "background-color .15s" }}>
                                        <TableCell sx={{ py: 1, px: 1.5, fontSize: 12 }}>{formatDate(c.date) || "—"}</TableCell>
                                        <TableCell align="right" sx={{ py: 1, px: 1.5, fontSize: 12, fontWeight: 700 }}>{formatMoney(c.paidAmount)}</TableCell>
                                        <TableCell sx={{ py: 1, px: 1.5, fontSize: 12 }}>{c.paymentMode ? titleCase(c.paymentMode) : "—"}</TableCell>
                                        <TableCell sx={{ py: 1, px: 1.5, fontSize: 12, fontFamily: "monospace", display: { xs: "none", md: "table-cell" } }}>
                                            {c.phoneNumber || "—"}
                                        </TableCell>
                                        <TableCell sx={{ py: 1, px: 1.5, display: { xs: "none", md: "table-cell" } }}>
                                            {c.paymentImageProofs?.length ? (
                                                <div className="flex items-center gap-1">
                                                    {c.paymentImageProofs.map((url, i) => (
                                                        <a
                                                            key={url}
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[11px] font-semibold hover:underline"
                                                            style={{ color: BRAND.primary }}
                                                        >
                                                            #{i + 1}
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-gray-300">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ py: 1, px: 1.5 }}>
                                            <Chip
                                                size="small"
                                                label={c.isVerified ? "Verified" : "Pending"}
                                                sx={{
                                                    height: 20, fontSize: "0.65rem", fontWeight: 700, borderRadius: "6px",
                                                    bgcolor: c.isVerified ? BRAND.emeraldBg : BRAND.amberBg,
                                                    color: c.isVerified ? BRAND.emerald : BRAND.amber,
                                                    border: `1px solid ${c.isVerified ? BRAND.emerald : BRAND.amber}`,
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Surface>
        </div>
    );
}

function KycTab({ onboarding }: { onboarding: OnboardingDetail }) {
    const adhaar = parseAdhaar(onboarding.adhaarJsonData);
    const address = adhaar?.address;

    return (
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                <Panel title="Aadhaar status" icon={<IdCard size={12} />} color={BRAND.rose} bg={BRAND.roseBg}>
                    <PanelRow label="Number" value={onboarding.adhaarNumber} mono copy />
                    <PanelRow label="Verified" value={onboarding.isAdhaarVerified ? "Yes" : "No"} />
                    <PanelRow label="Reference ID" value={onboarding.adhaarVerificationReferenceId} mono copy />
                    <PanelRow label="Attempts" value={String(onboarding.adhaarVerificationAttempts ?? 0)} />
                </Panel>

                <Panel title="Verified identity" icon={<ShieldCheck size={12} />} color={BRAND.emerald} bg={BRAND.emeraldBg}>
                    <PanelRow label="Name" value={adhaar?.name} />
                    <PanelRow label="Care of" value={adhaar?.care_of} />
                    <PanelRow label="Gender" value={adhaar?.gender} />
                    <PanelRow label="Date of birth" value={adhaar?.date_of_birth} />
                    <PanelRow label="Year of birth" value={adhaar?.year_of_birth ? String(adhaar.year_of_birth) : ""} />
                    <PanelRow label="Status" value={adhaar?.status} />
                </Panel>

                <Panel title="Aadhaar address" icon={<MapPin size={12} />} color={BRAND.violet} bg={BRAND.violetBg}>
                    <PanelRow label="House" value={address?.house} />
                    <PanelRow label="Street" value={address?.street} />
                    <PanelRow label="Landmark" value={address?.landmark} />
                    <PanelRow label="VTC" value={address?.vtc} />
                    <PanelRow label="Sub district" value={address?.subdistrict} />
                    <PanelRow label="District" value={address?.district} />
                    <PanelRow label="State" value={address?.state} />
                    <PanelRow label="Pincode" value={address?.pincode ? String(address.pincode) : ""} mono />
                </Panel>
            </div>

            {adhaar?.full_address && (
                <Surface accent={BRAND.cyan} className="p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-1">Full address on Aadhaar</p>
                    <p className="text-xs text-gray-700 leading-relaxed">{adhaar.full_address}</p>
                </Surface>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <AadhaarImage label="Aadhaar front" url={onboarding.adhaarCardFrontImageURL} color={BRAND.primary} />
                <AadhaarImage label="Aadhaar back" url={onboarding.adhaarCardBackImageURL} color={BRAND.violet} />
            </div>

            {(onboarding.frontOCRText || onboarding.backOCRText) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <OcrBlock label="Front OCR text" text={onboarding.frontOCRText} color={BRAND.sky} />
                    <OcrBlock label="Back OCR text" text={onboarding.backOCRText} color={BRAND.amber} />
                </div>
            )}
        </div>
    );
}

function AadhaarImage({ label, url, color }: { label: string; url?: string; color: string }) {
    return (
        <Surface accent={color} className="p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">{label}</p>
                {url && (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold hover:underline flex items-center gap-1" style={{ color }}>
                        <ExternalLink size={11} /> Open
                    </a>
                )}
            </div>
            {url ? (
                <Box
                    component="img"
                    src={url}
                    alt={label}
                    sx={{ width: "100%", maxHeight: 260, objectFit: "contain", borderRadius: "6px", border: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}
                />
            ) : (
                <div className="py-8 text-center text-xs text-gray-400">Not uploaded</div>
            )}
        </Surface>
    );
}

function OcrBlock({ label, text, color }: { label: string; text?: string; color: string }) {
    return (
        <Surface accent={color} className="p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-1.5">{label}</p>
            <pre className="text-[11px] text-gray-600 whitespace-pre-wrap wrap-break-word max-h-48 overflow-y-auto font-mono">
                {text?.trim() || "—"}
            </pre>
        </Surface>
    );
}

const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i;

function isImageFile(file: OnboardingFile) {
    return file.fileType?.toLowerCase().startsWith("image") || IMAGE_EXTENSIONS.test(file.fileName ?? "");
}

function FilesTab({ files }: { files: OnboardingFile[] }) {
    const grouped = useMemo(() => {
        const map = new Map<string, OnboardingFile[]>();
        files.forEach((file) => {
            const key = file.fileCategory?.trim() || "Uncategorised";
            map.set(key, [...(map.get(key) ?? []), file]);
        });
        return [...map.entries()];
    }, [files]);

    if (!files.length) return <EmptyBlock label="No files uploaded for this onboarding." color={BRAND.amber} />;

    const palette = [BRAND.primary, BRAND.violet, BRAND.emerald, BRAND.orange, BRAND.cyan, BRAND.rose];

    return (
        <div className="flex flex-col gap-3">
            {grouped.map(([category, items], index) => {
                const color = palette[index % palette.length];
                return (
                    <div key={category} className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: color, color: "#fff" }}>
                                <Files size={12} />
                            </span>
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-700">{titleCase(category)}</h3>
                            <Chip
                                size="small"
                                label={items.length}
                                sx={{ height: 18, minWidth: 22, fontSize: "0.62rem", fontWeight: 800, bgcolor: color, color: "#fff" }}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {items.map((file) => (
                                <FileCard key={file.fileId} file={file} color={color} />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function FileCard({ file, color }: { file: OnboardingFile; color: string }) {
    const image = isImageFile(file);
    return (
        <Surface accent={color} className="p-2.5">
            <div className="h-28 rounded-md overflow-hidden flex items-center justify-center mb-2" style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
                {image ? (
                    <Box component="img" src={file.fileURL} alt={file.fileName} sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                    <span style={{ color }}>{file.fileType?.includes("pdf") ? <FileText size={28} /> : <ImageIcon size={28} />}</span>
                )}
            </div>
            <p className="text-xs font-semibold text-gray-900 truncate" title={file.fileName}>{file.fileName || "Untitled"}</p>
            <p className="text-[10px] text-gray-400 truncate">
                {formatFileSize(file.fileSize)} · {formatDate(file.createdAt) || "—"}
            </p>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                <a
                    href={file.fileURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold hover:underline flex items-center gap-1"
                    style={{ color }}
                >
                    <ExternalLink size={11} /> View
                </a>
                <a
                    href={file.fileURL}
                    download
                    className="text-[11px] font-semibold hover:underline flex items-center gap-1 text-gray-500"
                >
                    <Download size={11} /> Download
                </a>
            </div>
        </Surface>
    );







}
