"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    User, Phone, Mail, Calendar, MapPin, FileText,
    CreditCard, Users, IdCard, Loader2, CheckCircle, XCircle,
    Edit2, Trash2, Upload, ExternalLink, GraduationCap, Wallet, Power,
} from "lucide-react";
import {
    Box, Paper, Tabs, Tab, Button, IconButton, Chip, Switch,
} from "@mui/material";
import {
    useRM,
    UpdateStudentInput,
    AddAddressInput, UpdateAddressInput,
    AddAdhaarInput, UpdateAdhaarInput,
} from "@/contexts/RMContext";
import type {
    LMSStudentData, ParentDetails, StudentAddress,
    StudentDocument, StudentAdhaarData,
} from "@/contexts/StudentContext";
import { fileUploaderToS3 } from "@/services/s3";
import TrainingAccessTab from "./TrainingAccessTab";
import PurchasesTab from "./PurchasesTab";
import PaymentsTab from "./PaymentsTab";
import {
    AddButton, AppAutocomplete, AppDateField, AppSelect, AppTextField, BRAND,
    COUNTRY_NAME_OPTIONS, EmptyState, FileField, FormCard, InfoChip, InfoRow, ItemCard,
    Panel, PanelRow, PhoneField, SectionShell, Surface,
} from "./ui";

type TabKey = "overview" | "parents" | "addresses" | "documents" | "adhaar" | "access" | "purchases" | "payments";

const TABS: { id: TabKey; label: string; icon: React.ComponentType<{ size?: number }>; color: string }[] = [
    { id: "overview",  label: "Overview",        icon: User,          color: BRAND.primary },
    { id: "parents",   label: "Parents",         icon: Users,         color: BRAND.violet },
    { id: "addresses", label: "Addresses",       icon: MapPin,        color: BRAND.emerald },
    { id: "documents", label: "Documents",       icon: FileText,      color: BRAND.amber },
    { id: "adhaar",    label: "Adhaar",          icon: IdCard,        color: BRAND.rose },
    { id: "access",    label: "Training Access", icon: GraduationCap, color: BRAND.cyan },
    { id: "purchases", label: "Purchases",       icon: CreditCard,    color: BRAND.sky },
    { id: "payments",  label: "Payments",        icon: Wallet,        color: BRAND.orange },
];

const DOCUMENT_TYPE_OPTIONS = ["Educational", "Academic", "Identification", "Other"];
const PARENT_RELATION_OPTIONS = ["Father", "Mother", "Guardian", "Sibling", "Other"];
const ADDRESS_TYPE_OPTIONS = ["Current", "Permanent", "Office", "Other"];
const EDUCATION_OPTIONS = [
    "Below 10th",
    "10th / SSC",
    "12th / HSC",
    "ITI",
    "Diploma",
    "B.Sc",
    "B.Com",
    "BA",
    "BCA",
    "B.Tech / B.E",
    "M.Sc",
    "M.Com",
    "MA",
    "MCA",
    "M.Tech / M.E",
    "MBA",
    "PhD",
    "Other",
];

export default function StudentDetailClient({ studentId }: { studentId: string }) {
    const {
        getStudent, updateStudent,
        addParentDetails, updateParentDetails, removeParentDetails,
        addStudentAddress, updateStudentAddress, removeStudentAddress,
        addStudentDocument, updateStudentDocument, removeStudentDocument,
        addStudentAdhaarData, updateStudentAdhaarData, removeStudentAdhaarData,
    } = useRM();

    const [student, setStudent] = useState<LMSStudentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>("overview");
    const [editingStudent, setEditingStudent] = useState(false);

    const refresh = useCallback(async () => {
        const res = await getStudent(studentId);
        if (res.success && res.data) setStudent(res.data);
        else toast.error(res.message ?? "Failed to load student");
    }, [getStudent, studentId]);

    useEffect(() => {
        setLoading(true);
        refresh().finally(() => setLoading(false));
    }, [refresh]);

    // Editing student details only happens inside the Overview tab.
    useEffect(() => {
        if (activeTab !== "overview") setEditingStudent(false);
    }, [activeTab]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full p-6">
                <Loader2 size={20} className="animate-spin" style={{ color: BRAND.primary }} />
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-gray-500">
                <XCircle size={28} className="mb-2" style={{ color: BRAND.rose }} />
                <p className="text-sm">Student not found.</p>
                <Link href="/dashboard/rm/student-profiles" className="text-xs hover:underline mt-2" style={{ color: BRAND.primary }}>
                    Back to list
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 h-full overflow-y-auto">

            {/* Student header card */}
            <StudentHeader
                student={student}
                onUpdate={updateStudent}
                onSaved={refresh}
                onEditClick={() => { setActiveTab("overview"); setEditingStudent(true); }}
            />

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

            {/* Tab content */}
            {activeTab === "overview"  && (
                <OverviewTab
                    student={student}
                    editing={editingStudent}
                    onStartEdit={() => setEditingStudent(true)}
                    onCancelEdit={() => setEditingStudent(false)}
                    onUpdate={updateStudent}
                    onSaved={refresh}
                />
            )}
            {activeTab === "parents"   && (
                <ParentsTab
                    student={student}
                    onAdd={(d) => addParentDetails(studentId, d)}
                    onUpdate={(pid, d) => updateParentDetails(studentId, pid, d)}
                    onRemove={(pid) => removeParentDetails(studentId, pid)}
                    onSaved={refresh}
                />
            )}
            {activeTab === "addresses" && (
                <AddressesTab
                    student={student}
                    onAdd={(d) => addStudentAddress(studentId, d)}
                    onUpdate={(aid, d) => updateStudentAddress(studentId, aid, d)}
                    onRemove={(aid) => removeStudentAddress(studentId, aid)}
                    onSaved={refresh}
                />
            )}
            {activeTab === "documents" && (
                <DocumentsTab
                    student={student}
                    onAdd={(d) => addStudentDocument(studentId, d)}
                    onUpdate={(did, d) => updateStudentDocument(studentId, did, d)}
                    onRemove={(did) => removeStudentDocument(studentId, did)}
                    onSaved={refresh}
                />
            )}
            {activeTab === "adhaar" && (
                <AdhaarTab
                    student={student}
                    onAdd={(d) => addStudentAdhaarData(studentId, d)}
                    onUpdate={(aid, d) => updateStudentAdhaarData(studentId, aid, d)}
                    onRemove={(aid) => removeStudentAdhaarData(studentId, aid)}
                    onSaved={refresh}
                />
            )}
            {activeTab === "access" && <TrainingAccessTab studentId={studentId} />}
            {activeTab === "purchases" && <PurchasesTab studentId={studentId} />}
            {activeTab === "payments" && <PaymentsTab studentId={studentId} />}
        </div>
    );
}

/* ============================================================== */
/* Student header card — read-only display; editing lives in the  */
/* Overview tab so the top bar never turns into a form.            */
/* ============================================================== */

function StudentHeader({
    student,
    onUpdate,
    onSaved,
    onEditClick,
}: {
    student: LMSStudentData;
    onUpdate: (id: string, d: UpdateStudentInput) => Promise<{ success: boolean; message: string | null; data: LMSStudentData | null }>;
    onSaved: () => void;
    onEditClick: () => void;
}) {
    const [uploading, setUploading] = useState(false);

    const initials = student.studentName
        .split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase()).join("");

    const onPhotoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        fileUploaderToS3(
            file,
            () => {},
            async (fileUrl) => {
                const res = await onUpdate(student.studentId, { studentPhoto: fileUrl });
                setUploading(false);
                if (res.success) {
                    toast.success("Photo updated");
                    onSaved();
                } else {
                    toast.error(res.message ?? "Photo update failed");
                }
            },
        );
    };

    return (
        <Paper
            elevation={5}
            sx={{ borderRadius: "10px",  border: `1px solid ${BRAND.primary}`, transition: "box-shadow .2s", "&:hover": { boxShadow: 6 },  }}
        >
            <Box sx={{ minHeight: { sm: 120 }, background: `linear-gradient(90deg, ${BRAND.primary} 0%, ${BRAND.violet} 100%)`, borderRadius: "10px 10px 0 0", position: "relative" }}>
                <Button
                    onClick={onEditClick}
                    size="small"
                    variant="contained"
                    startIcon={<Edit2 size={12} />}
                    sx={{
                        position: "absolute", top: 10, right: 10,
                        textTransform: "none", borderRadius: "8px", fontSize: "0.7rem", fontWeight: 600,
                        bgcolor: "#fff", color: BRAND.primary, boxShadow: "0 2px 8px rgba(15,23,42,0.25)",
                        "&:hover": { bgcolor: "#f8fafc" },
                    }}
                >
                    Edit
                </Button>
            </Box>
            <div className="px-4 sm:px-6 pb-4 sm:pb-5">
                <div className="flex flex-col items-center text-center sm:flex-row sm:items-end sm:text-left gap-3 -mt-10 sm:-mt-18">
                    {/* Avatar */}
                    <div className="relative shrink-0 w-20 h-20 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
                        {student.studentPhoto ? (
                            <Image
                                src={student.studentPhoto}
                                alt={student.studentName}
                                fill
                                sizes="96px"
                                className="object-cover"
                            />
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center text-2xl font-semibold"
                                style={{ backgroundColor: BRAND.violetBg, color: BRAND.violet }}
                            >
                                {initials || <User size={22} />}
                            </div>
                        )}
                        <label
                            className="absolute bottom-0 right-0 w-7 h-7 rounded-full text-white flex items-center justify-center cursor-pointer shadow border-2 border-white"
                            style={{ backgroundColor: BRAND.primary }}
                        >
                            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={11} />}
                            <input type="file" accept="image/*" className="hidden" onChange={onPhotoPick} disabled={uploading} />
                        </label>
                    </div>

                    <div className="flex-1 min-w-0 pb-1">
                        <h2 className="text-lg font-bold text-gray-900 leading-tight truncate">{student.studentName}</h2>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-1">
                            {student.studentRegistrationNumber && (
                                <span className="text-[11px] text-gray-500 font-mono">{student.studentRegistrationNumber}</span>
                            )}
                            <Chip
                                size="small"
                                icon={student.isActive ? <CheckCircle size={11} style={{ color: "#ffffff" }} /> : <XCircle size={11} style={{ color: "#ffffff" }} />}
                                label={student.isActive ? "Active" : "Inactive"}
                                sx={{
                                    height: 22, fontSize: "0.65rem", fontWeight: 700,
                                    bgcolor: student.isActive ? BRAND.emerald : BRAND.rose,
                                    color: "#ffffff",
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Quick info — always visible at the top, never replaced by a form */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-4">
                    <InfoChip icon={<Phone size={11} />} label={`+${student.callingCode} ${student.phoneNumber}`} color={BRAND.sky} bg={BRAND.skyBg} />
                    {student.studentAlternatePhoneNumber && (
                        <InfoChip icon={<Phone size={11} />} label={student.studentAlternatePhoneNumber} color={BRAND.sky} bg={BRAND.skyBg} />
                    )}
                    {student.email && <InfoChip icon={<Mail size={11} />} label={student.email} color={BRAND.violet} bg={BRAND.violetBg} />}
                    {student.dateOfBirth && (
                        <InfoChip
                            icon={<Calendar size={11} />}
                            label={new Date(student.dateOfBirth).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            color={BRAND.amber}
                            bg={BRAND.amberBg}
                        />
                    )}
                    {student.gender && <InfoChip icon={<User size={11} />} label={student.gender} color={BRAND.emerald} bg={BRAND.emeraldBg} />}
                    {student.machineCode && <InfoChip icon={<CreditCard size={11} />} label={student.machineCode} color={BRAND.rose} bg={BRAND.roseBg} />}
                </div>
            </div>
        </Paper>
    );
}

/* ============================================================== */
/* Overview tab                                                    */
/* ============================================================== */

function OverviewTab({
    student, editing, onStartEdit, onCancelEdit, onUpdate, onSaved,
}: {
    student: LMSStudentData;
    editing: boolean;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    onUpdate: (id: string, d: UpdateStudentInput) => Promise<{ success: boolean; message: string | null; data: LMSStudentData | null }>;
    onSaved: () => void;
}) {
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<UpdateStudentInput>({});

    useEffect(() => {
        if (!editing) return;
        setForm({
            studentName: student.studentName,
            callingCode: student.callingCode,
            phoneNumber: student.phoneNumber,
            dateOfBirth: student.dateOfBirth ?? undefined,
            gender: student.gender ?? undefined,
            email: student.email ?? undefined,
            studentRegistrationNumber: student.studentRegistrationNumber ?? undefined,
            studentAlternatePhoneNumber: student.studentAlternatePhoneNumber ?? undefined,
            isActive: student.isActive,
            highestEducation: student.highestEducation ?? undefined,
            highestEducationInstitute: student.highestEducationInstitute ?? undefined,
            machineCode: student.machineCode ?? undefined,
        });
    }, [editing, student]);

    const save = async () => {
        setSaving(true);
        const res = await onUpdate(student.studentId, form);
        setSaving(false);
        if (res.success) {
            toast.success("Student updated");
            onCancelEdit();
            onSaved();
        } else {
            toast.error(res.message ?? "Update failed");
        }
    };

    if (editing) {
        return (
            <FormCard color={BRAND.primary} onCancel={onCancelEdit} onSubmit={save} busy={saving}>
                <AppTextField label="Name" value={form.studentName ?? ""} onChange={(e) => setForm({ ...form, studentName: e.target.value })} />
                <AppTextField label="Reg. no." value={form.studentRegistrationNumber ?? ""} onChange={(e) => setForm({ ...form, studentRegistrationNumber: e.target.value })} />
                <PhoneField
                    codeValue={form.callingCode ?? ""}
                    numberValue={form.phoneNumber ?? ""}
                    onCodeChange={(v) => setForm({ ...form, callingCode: v })}
                    onNumberChange={(v) => setForm({ ...form, phoneNumber: v })}
                />
                <AppTextField label="Alt. phone" value={form.studentAlternatePhoneNumber ?? ""} onChange={(e) => setForm({ ...form, studentAlternatePhoneNumber: e.target.value })} />
                <AppTextField label="Email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <AppDateField label="DOB" value={form.dateOfBirth?.slice(0, 10) ?? ""} onChange={(v) => setForm({ ...form, dateOfBirth: v })} />
                <AppSelect
                    label="Gender"
                    value={form.gender ?? ""}
                    onChange={(v) => setForm({ ...form, gender: v })}
                    options={[{ label: "Male", value: "male" }, { label: "Female", value: "female" }, { label: "Other", value: "other" }]}
                />
                <AppTextField label="Machine code" value={form.machineCode ?? ""} onChange={(e) => setForm({ ...form, machineCode: e.target.value })} />
                <AppAutocomplete label="Education" value={form.highestEducation ?? ""} onChange={(v) => setForm({ ...form, highestEducation: v })} options={EDUCATION_OPTIONS} />
                <AppTextField label="Institute" value={form.highestEducationInstitute ?? ""} onChange={(e) => setForm({ ...form, highestEducationInstitute: e.target.value })} />
                <div className="flex items-center gap-1.5 sm:col-span-2">
                    <Switch
                        size="small"
                        checked={form.isActive ?? false}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": { color: BRAND.primary },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: BRAND.primary },
                        }}
                    />
                    <span className="text-xs text-gray-600">Active</span>
                </div>
            </FormCard>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <StatusToggleCard student={student} onUpdate={onUpdate} onSaved={onSaved} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Panel title="Personal" icon={<User size={13} />} color={BRAND.violet} bg={BRAND.violetBg}>
                    <PanelRow label="Full name" value={student.studentName} />
                    <PanelRow label="Gender" value={student.gender} />
                    <PanelRow label="DOB" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null} />
                    <PanelRow label="Reg. no." value={student.studentRegistrationNumber} mono />
                    <PanelRow label="Machine" value={student.machineCode} mono />
                </Panel>

                <Panel title="Contact" icon={<Phone size={13} />} color={BRAND.sky} bg={BRAND.skyBg}>
                    <PanelRow label="Phone" value={`+${student.callingCode} ${student.phoneNumber}`} copy />
                    <PanelRow label="Alt. phone" value={student.studentAlternatePhoneNumber} copy />
                    <PanelRow label="Email" value={student.email} copy />
                </Panel>

                <Panel title="Education" icon={<FileText size={13} />} color={BRAND.amber} bg={BRAND.amberBg}>
                    <PanelRow label="Highest education" value={student.highestEducation} />
                    <PanelRow label="Institute" value={student.highestEducationInstitute} />
                </Panel>

                <Panel title="System" icon={<Calendar size={13} />} color={BRAND.emerald} bg={BRAND.emeraldBg}>
                    <PanelRow label="Joined" value={new Date(student.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} />
                    <PanelRow label="Updated" value={new Date(student.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} />
                    <PanelRow label="Onboarding ref" value={student.onboardingRefId} mono />
                </Panel>
            </div>
        </div>
    );
}

/* ============================================================== */
/* Account status toggle                                           */
/* ============================================================== */

function StatusToggleCard({
    student, onUpdate, onSaved,
}: {
    student: LMSStudentData;
    onUpdate: (id: string, d: UpdateStudentInput) => Promise<{ success: boolean; message: string | null; data: LMSStudentData | null }>;
    onSaved: () => void;
}) {
    const [busy, setBusy] = useState(false);
    const color = student.isActive ? BRAND.emerald : BRAND.rose;
    const bg = student.isActive ? BRAND.emeraldBg : BRAND.roseBg;

    const toggle = async (next: boolean) => {
        setBusy(true);
        const res = await onUpdate(student.studentId, { isActive: next });
        setBusy(false);
        if (res.success) {
            toast.success(next ? "Student activated" : "Student deactivated");
            onSaved();
        } else {
            toast.error(res.message ?? "Status update failed");
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: "10px", border: `1px solid ${color}`, backgroundColor: bg, p: 1.5,
                transition: "box-shadow .15s ease",
                "&:hover": { boxShadow: "0 6px 16px rgba(15,23,42,0.1)" },
            }}
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color, color: "#ffffff" }}>
                        <Power size={15} />
                    </span>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">Account status</p>
                        <p className="text-[11px] text-gray-600">
                            {student.isActive
                                ? "Student can sign in and access their training."
                                : "Student is blocked from signing in and accessing training."}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <Chip
                        size="small"
                        label={student.isActive ? "Active" : "Inactive"}
                        sx={{ height: 22, fontSize: "0.65rem", fontWeight: 700, backgroundColor: color, color: "#ffffff" }}
                    />
                    {busy ? (
                        <Loader2 size={16} className="animate-spin" style={{ color }} />
                    ) : (
                        <Switch
                            size="small"
                            checked={student.isActive}
                            onChange={(e) => toggle(e.target.checked)}
                            sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": { color: BRAND.emerald },
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: BRAND.emerald },
                                "& .MuiSwitch-switchBase:not(.Mui-checked)": { color: BRAND.rose },
                                "& .MuiSwitch-switchBase:not(.Mui-checked) + .MuiSwitch-track": { backgroundColor: BRAND.rose },
                            }}
                        />
                    )}
                </div>
            </div>
        </Paper>
    );
}

/* ============================================================== */
/* Parents tab                                                     */
/* ============================================================== */
function ParentsTab({
    student, onAdd, onUpdate, onRemove, onSaved,
}: {
    student: LMSStudentData;
    onAdd: (d: { parentName: string; parentEmail?: string; parentCallingCode?: string; parentPhoneNumber?: string; parentRelation?: string }) => Promise<{ success: boolean; message: string | null; data: ParentDetails | null }>;
    onUpdate: (pid: string, d: Partial<{ parentName: string; parentEmail?: string; parentCallingCode?: string; parentPhoneNumber?: string; parentRelation?: string }>) => Promise<{ success: boolean; message: string | null; data: ParentDetails | null }>;
    onRemove: (pid: string) => Promise<{ success: boolean; message: string | null; data: null }>;
    onSaved: () => void;
}) {
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ parentName: "", parentEmail: "", parentCallingCode: "91", parentPhoneNumber: "", parentRelation: "" });
    const [busy, setBusy] = useState(false);

    const resetForm = () => setForm({ parentName: "", parentEmail: "", parentCallingCode: "91", parentPhoneNumber: "", parentRelation: "" });

    const submit = async () => {
        if (!form.parentName.trim()) { toast.error("Parent name is required"); return; }
        setBusy(true);
        const res = editingId ? await onUpdate(editingId, form) : await onAdd(form);
        setBusy(false);
        if (res.success) {
            toast.success(editingId ? "Parent updated" : "Parent added");
            setAdding(false); setEditingId(null); resetForm(); onSaved();
        } else toast.error(res.message ?? "Save failed");
    };

    const del = async (pid: string) => {
        if (!confirm("Remove this parent?")) return;
        const res = await onRemove(pid);
        if (res.success) { toast.success("Parent removed"); onSaved(); }
        else toast.error(res.message ?? "Delete failed");
    };

    const startEdit = (p: ParentDetails) => {
        setForm({
            parentName: p.parentName,
            parentEmail: p.parentEmail ?? "",
            parentCallingCode: p.parentCallingCode,
            parentPhoneNumber: p.parentPhoneNumber ?? "",
            parentRelation: p.parentRelation ?? "",
        });
        setEditingId(p.parentId); setAdding(false);
    };

    return (
        <SectionShell
            title="Parents"
            action={
                !adding && !editingId && (
                    <AddButton color={BRAND.violet} onClick={() => { resetForm(); setAdding(true); }} />
                )
            }
        >
            {(adding || editingId) && (
                <FormCard color={BRAND.violet} onCancel={() => { setAdding(false); setEditingId(null); resetForm(); }} onSubmit={submit} busy={busy}>
                    <AppTextField label="Name*" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} />
                    <AppAutocomplete label="Relation" value={form.parentRelation} onChange={(v) => setForm({ ...form, parentRelation: v })} options={PARENT_RELATION_OPTIONS} />
                    <PhoneField
                        label="Phone"
                        codeValue={form.parentCallingCode}
                        numberValue={form.parentPhoneNumber}
                        onCodeChange={(v) => setForm({ ...form, parentCallingCode: v })}
                        onNumberChange={(v) => setForm({ ...form, parentPhoneNumber: v })}
                    />
                    <AppTextField label="Email" value={form.parentEmail} onChange={(e) => setForm({ ...form, parentEmail: e.target.value })} />
                </FormCard>
            )}

            {student.parentDetails.length === 0 && !adding && !editingId ? (
                <EmptyState label="No parent details added." />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {student.parentDetails.map((p) => (
                        <ItemCard
                            key={p.parentId}
                            title={p.parentName}
                            subtitle={p.parentRelation ?? undefined}
                            color={BRAND.violet}
                            onEdit={() => startEdit(p)}
                            onDelete={() => del(p.parentId)}
                        >
                            {p.parentPhoneNumber && <InfoRow icon={<Phone size={11} />} label="Phone" value={`+${p.parentCallingCode} ${p.parentPhoneNumber}`} />}
                            {p.parentEmail && <InfoRow icon={<Mail size={11} />} label="Email" value={p.parentEmail} />}
                        </ItemCard>
                    ))}
                </div>
            )}
        </SectionShell>
    );
}

/* ============================================================== */
/* Addresses tab                                                   */
/* ============================================================== */

function AddressesTab({
    student, onAdd, onUpdate, onRemove, onSaved,
}: {
    student: LMSStudentData;
    onAdd: (d: AddAddressInput) => Promise<{ success: boolean; message: string | null; data: StudentAddress | null }>;
    onUpdate: (aid: string, d: UpdateAddressInput) => Promise<{ success: boolean; message: string | null; data: StudentAddress | null }>;
    onRemove: (aid: string) => Promise<{ success: boolean; message: string | null; data: null }>;
    onSaved: () => void;
}) {
    const empty = { addressType: "", addressLine: "", city: "", state: "", country: "", postalCode: "", mapUrl: "" };
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<Record<string, string>>(empty);
    const [busy, setBusy] = useState(false);

    const submit = async () => {
        setBusy(true);
        const payload: AddAddressInput = { ...form };
        const res = editingId ? await onUpdate(editingId, payload) : await onAdd(payload);
        setBusy(false);
        if (res.success) {
            toast.success(editingId ? "Address updated" : "Address added");
            setAdding(false); setEditingId(null); setForm(empty); onSaved();
        } else toast.error(res.message ?? "Save failed");
    };

    const del = async (aid: string) => {
        if (!confirm("Remove this address?")) return;
        const res = await onRemove(aid);
        if (res.success) { toast.success("Address removed"); onSaved(); }
        else toast.error(res.message ?? "Delete failed");
    };

    const startEdit = (a: StudentAddress) => {
        setForm({
            addressType: a.addressType ?? "",
            addressLine: a.addressLine ?? "",
            city: a.city ?? "",
            state: a.state ?? "",
            country: a.country ?? "",
            postalCode: a.postalCode ?? "",
            mapUrl: a.mapUrl ?? "",
        });
        setEditingId(a.addressId); setAdding(false);
    };

    return (
        <SectionShell
            title="Addresses"
            action={
                !adding && !editingId && (
                    <AddButton color={BRAND.emerald} onClick={() => { setForm(empty); setAdding(true); }} />
                )
            }
        >
            {(adding || editingId) && (
                <FormCard color={BRAND.emerald} onCancel={() => { setAdding(false); setEditingId(null); setForm(empty); }} onSubmit={submit} busy={busy}>
                    <AppAutocomplete label="Type" value={form.addressType} onChange={(v) => setForm({ ...form, addressType: v })} options={ADDRESS_TYPE_OPTIONS} />
                    <AppTextField label="Address line" value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} />
                    <AppTextField label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                    <AppTextField label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                    <AppAutocomplete label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} options={COUNTRY_NAME_OPTIONS} />
                    <AppTextField label="Postal code" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
                    <div className="sm:col-span-2">
                        <AppTextField label="Map URL" value={form.mapUrl} onChange={(e) => setForm({ ...form, mapUrl: e.target.value })} />
                    </div>
                </FormCard>
            )}

            {student.studentAddresses.length === 0 && !adding && !editingId ? (
                <EmptyState label="No addresses added." />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {student.studentAddresses.map((a) => (
                        <ItemCard
                            key={a.addressId}
                            title={a.addressType || "Address"}
                            subtitle={[a.city, a.state, a.country].filter(Boolean).join(", ") || undefined}
                            color={BRAND.emerald}
                            onEdit={() => startEdit(a)}
                            onDelete={() => del(a.addressId)}
                        >
                            {a.addressLine && <p className="text-xs text-gray-600">{a.addressLine}</p>}
                            {a.postalCode && <p className="text-[11px] text-gray-400">PIN: {a.postalCode}</p>}
                            {a.mapUrl && (
                                <a href={a.mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] hover:underline mt-1" style={{ color: BRAND.emerald }}>
                                    <ExternalLink size={10} /> Open on map
                                </a>
                            )}
                        </ItemCard>
                    ))}
                </div>
            )}
        </SectionShell>
    );
}

/* ============================================================== */
/* Documents tab                                                   */
/* ============================================================== */

function DocumentsTab({
    student, onAdd, onUpdate, onRemove, onSaved,
}: {
    student: LMSStudentData;
    onAdd: (d: { documentName: string; documentUrl: string; documentType: string }) => Promise<{ success: boolean; message: string | null; data: StudentDocument | null }>;
    onUpdate: (did: string, d: { documentName?: string; documentUrl?: string; documentType?: string; isVerified?: boolean }) => Promise<{ success: boolean; message: string | null; data: StudentDocument | null }>;
    onRemove: (did: string) => Promise<{ success: boolean; message: string | null; data: null }>;
    onSaved: () => void;
}) {
    const emptyForm = { documentName: "", documentType: "", documentUrl: "" };
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [busy, setBusy] = useState(false);
    const [uploading, setUploading] = useState(false);

    const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        fileUploaderToS3(
            file,
            () => {},
            (fileUrl) => {
                // Document name defaults to the uploaded file's name, still editable below.
                const baseName = file.name.replace(/\.[^./]+$/, "");
                setForm((f) => ({ ...f, documentUrl: fileUrl, documentName: baseName }));
                setUploading(false);
                toast.success("File uploaded");
            },
        );
    };

    const submit = async () => {
        if (!form.documentName || !form.documentUrl || !form.documentType) {
            toast.error("File, name and type are required"); return;
        }
        setBusy(true);
        const res = await onAdd(form);
        setBusy(false);
        if (res.success) {
            toast.success("Document added");
            setAdding(false); setForm(emptyForm); onSaved();
        } else toast.error(res.message ?? "Save failed");
    };

    const del = async (did: string) => {
        if (!confirm("Remove this document?")) return;
        const res = await onRemove(did);
        if (res.success) { toast.success("Document removed"); onSaved(); }
        else toast.error(res.message ?? "Delete failed");
    };

    const toggleVerified = async (d: StudentDocument) => {
        const res = await onUpdate(d.documentId, { isVerified: !d.isVerified });
        if (res.success) { toast.success(res.data?.isVerified ? "Marked verified" : "Marked unverified"); onSaved(); }
        else toast.error(res.message ?? "Update failed");
    };

    return (
        <SectionShell
            title="Documents"
            action={
                !adding && (
                    <AddButton color={BRAND.amber} onClick={() => setAdding(true)} />
                )
            }
        >
            {adding && (
                <FormCard color={BRAND.amber} onCancel={() => { setAdding(false); setForm(emptyForm); }} onSubmit={submit} busy={busy}>
                    <div className="sm:col-span-2">
                        <FileField label="Document file*" value={form.documentUrl} uploading={uploading} onPick={onFilePick} />
                    </div>
                    <AppTextField label="Document name*" value={form.documentName} onChange={(e) => setForm({ ...form, documentName: e.target.value })} />
                    <AppAutocomplete label="Document type*" value={form.documentType} onChange={(v) => setForm({ ...form, documentType: v })} options={DOCUMENT_TYPE_OPTIONS} />
                </FormCard>
            )}

            {student.studentDocuments.length === 0 && !adding ? (
                <EmptyState label="No documents uploaded." />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {student.studentDocuments.map((d) => (
                        <Surface key={d.documentId} accent={BRAND.amber} className="p-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{d.documentName}</p>
                                    <Chip
                                        size="small"
                                        label={d.documentType}
                                        sx={{ height: 18, fontSize: "0.65rem", mt: 0.5, bgcolor: BRAND.amberBg, color: "#92400e" }}
                                    />
                                </div>
                                <IconButton size="small" onClick={() => del(d.documentId)} sx={{ color: "#9ca3af", "&:hover": { color: BRAND.rose } }}>
                                    <Trash2 size={13} />
                                </IconButton>
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-100">
                                <a href={d.documentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] hover:underline" style={{ color: BRAND.primary }}>
                                    <ExternalLink size={10} /> Open
                                </a>
                                <Chip
                                    size="small"
                                    clickable
                                    onClick={() => toggleVerified(d)}
                                    icon={<CheckCircle size={10} style={{ color: "#ffffff" }} />}
                                    label={d.isVerified ? "Verified" : "Unverified"}
                                    sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, backgroundColor: d.isVerified ? BRAND.emerald : "#9ca3af", color: "#ffffff" }}
                                />
                            </div>
                        </Surface>
                    ))}
                </div>
            )}
        </SectionShell>
    );
}

/* ============================================================== */
/* Adhaar tab                                                      */
/* ============================================================== */

function AdhaarTab({
    student, onAdd, onUpdate, onRemove, onSaved,
}: {
    student: LMSStudentData;
    onAdd: (d: AddAdhaarInput) => Promise<{ success: boolean; message: string | null; data: StudentAdhaarData | null }>;
    onUpdate: (aid: string, d: UpdateAdhaarInput) => Promise<{ success: boolean; message: string | null; data: StudentAdhaarData | null }>;
    onRemove: (aid: string) => Promise<{ success: boolean; message: string | null; data: null }>;
    onSaved: () => void;
}) {
    const empty = {
        adhaarNumber: "", adhaarName: "", adhaarGender: "", adhaarDob: "",
        adhaarAddress: "", adhaarFrontImageUrl: "", adhaarBackImageUrl: "",
    };
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<Record<string, string>>(empty);
    const [busy, setBusy] = useState(false);
    const [uploadingSide, setUploadingSide] = useState<"front" | "back" | null>(null);

    const upload = (side: "front" | "back") => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingSide(side);
        fileUploaderToS3(
            file,
            () => {},
            (fileUrl) => {
                const key = side === "front" ? "adhaarFrontImageUrl" : "adhaarBackImageUrl";
                setForm((f) => ({ ...f, [key]: fileUrl }));
                setUploadingSide(null);
                toast.success(`${side} image uploaded`);
            },
        );
    };

    const submit = async () => {
        setBusy(true);
        const res = editingId
            ? await onUpdate(editingId, form as UpdateAdhaarInput)
            : await onAdd(form as AddAdhaarInput);
        setBusy(false);
        if (res.success) {
            toast.success(editingId ? "Adhaar updated" : "Adhaar added");
            setAdding(false); setEditingId(null); setForm(empty); onSaved();
        } else toast.error(res.message ?? "Save failed");
    };

    const del = async (aid: string) => {
        if (!confirm("Remove this Adhaar entry?")) return;
        const res = await onRemove(aid);
        if (res.success) { toast.success("Adhaar removed"); onSaved(); }
        else toast.error(res.message ?? "Delete failed");
    };

    const startEdit = (a: StudentAdhaarData) => {
        setForm({
            adhaarNumber: a.adhaarNumber ?? "",
            adhaarName: a.adhaarName ?? "",
            adhaarGender: a.adhaarGender ?? "",
            adhaarDob: a.adhaarDob?.slice(0, 10) ?? "",
            adhaarAddress: a.adhaarAddress ?? "",
            adhaarFrontImageUrl: a.adhaarFrontImageUrl ?? "",
            adhaarBackImageUrl: a.adhaarBackImageUrl ?? "",
        });
        setEditingId(a.adhaarId); setAdding(false);
    };

    const toggleVerified = async (a: StudentAdhaarData) => {
        const res = await onUpdate(a.adhaarId, { isVerified: !a.isVerified });
        if (res.success) { toast.success("Updated"); onSaved(); }
        else toast.error(res.message ?? "Update failed");
    };

    return (
        <SectionShell
            title="Adhaar"
            action={
                !adding && !editingId && (
                    <AddButton color={BRAND.rose} onClick={() => { setForm(empty); setAdding(true); }} />
                )
            }
        >
            {(adding || editingId) && (
                <FormCard color={BRAND.rose} onCancel={() => { setAdding(false); setEditingId(null); setForm(empty); }} onSubmit={submit} busy={busy}>
                    <AppTextField label="Adhaar number" value={form.adhaarNumber} onChange={(e) => setForm({ ...form, adhaarNumber: e.target.value })} />
                    <AppTextField label="Name on Adhaar" value={form.adhaarName} onChange={(e) => setForm({ ...form, adhaarName: e.target.value })} />
                    <AppSelect
                        label="Gender"
                        value={form.adhaarGender}
                        onChange={(v) => setForm({ ...form, adhaarGender: v })}
                        options={[{ label: "Male", value: "male" }, { label: "Female", value: "female" }, { label: "Other", value: "other" }]}
                    />
                    <AppDateField label="DOB" value={form.adhaarDob} onChange={(v) => setForm({ ...form, adhaarDob: v })} />
                    <div className="sm:col-span-2">
                        <AppTextField label="Address" value={form.adhaarAddress} onChange={(e) => setForm({ ...form, adhaarAddress: e.target.value })} />
                    </div>
                    <FileField
                        label="Front image"
                        value={form.adhaarFrontImageUrl}
                        uploading={uploadingSide === "front"}
                        onPick={upload("front")}
                        accept="image/*"
                    />
                    <FileField
                        label="Back image"
                        value={form.adhaarBackImageUrl}
                        uploading={uploadingSide === "back"}
                        onPick={upload("back")}
                        accept="image/*"
                    />
                </FormCard>
            )}

            {student.studentAdhaarDatas.length === 0 && !adding && !editingId ? (
                <EmptyState label="No Adhaar data added." />
            ) : (
                <div className="grid grid-cols-1 gap-1">
                    {student.studentAdhaarDatas.map((a) => (
                        <Surface key={a.adhaarId} accent={BRAND.rose} className="p-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{a.adhaarName || "—"}</p>
                                    <p className="text-[11px] text-gray-500 font-mono mt-0.5">{a.adhaarNumber || "—"}</p>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    <IconButton size="small" onClick={() => startEdit(a)} sx={{ color: "#9ca3af", "&:hover": { color: BRAND.primary } }}><Edit2 size={12} /></IconButton>
                                    <IconButton size="small" onClick={() => del(a.adhaarId)} sx={{ color: "#9ca3af", "&:hover": { color: BRAND.rose } }}><Trash2 size={13} /></IconButton>
                                </div>
                            </div>
                            <div className="mt-2 space-y-1">
                                {a.adhaarGender && <InfoRow icon={<User size={11} />} label="Gender" value={a.adhaarGender} />}
                                {a.adhaarDob && <InfoRow icon={<Calendar size={11} />} label="DOB" value={new Date(a.adhaarDob).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} />}
                                {a.adhaarAddress && <InfoRow icon={<MapPin size={11} />} label="Address" value={a.adhaarAddress} />}
                            </div>
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                                {a.adhaarFrontImageUrl && (
                                    <a href={a.adhaarFrontImageUrl} target="_blank" rel="noreferrer" className="text-[11px] hover:underline flex items-center gap-1" style={{ color: BRAND.primary }}>
                                        <ExternalLink size={10} /> Front
                                    </a>
                                )}
                                {a.adhaarBackImageUrl && (
                                    <a href={a.adhaarBackImageUrl} target="_blank" rel="noreferrer" className="text-[11px] hover:underline flex items-center gap-1" style={{ color: BRAND.primary }}>
                                        <ExternalLink size={10} /> Back
                                    </a>
                                )}
                                <Chip
                                    size="small"
                                    clickable
                                    onClick={() => toggleVerified(a)}
                                    icon={<CheckCircle size={10} style={{ color: "#ffffff" }} />}
                                    label={a.isVerified ? "Verified" : "Unverified"}
                                    sx={{ ml: "auto", height: 20, fontSize: "0.65rem", fontWeight: 700, backgroundColor: a.isVerified ? BRAND.emerald : "#9ca3af", color: "#ffffff" }}
                                />
                            </div>
                        </Surface>
                    ))}
                </div>
            )}
        </SectionShell>
    );
}

