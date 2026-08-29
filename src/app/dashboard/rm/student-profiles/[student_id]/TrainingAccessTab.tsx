"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    BookOpen, Boxes, CalendarClock, Gift, IndianRupee, Loader2, Trash2, Edit2, Timer,
} from "lucide-react";
import { IconButton, Switch } from "@mui/material";
import { useRM } from "@/contexts/RMContext";
import { useContent } from "@/contexts/ContentContext";
import type {
    StudentCourseAccessWithCourse,
    StudentPackagesAccessDetail,
} from "@/contexts/StudentContext";
import {
    AddButton, AppDateField, AppOptionSelect, BRAND, EmptyState, FormCard,
    SectionShell, StatusChip, Surface, formatDate, formatMoney,
} from "./ui";

export default function TrainingAccessTab({ studentId }: { studentId: string }) {
    const {
        getStudentPackageAccesses, addStudentPackageAccess, updateStudentPackageAccess, removeStudentPackageAccess,
        getStudentCourseAccesses, addStudentCourseAccess, updateStudentCourseAccess, removeStudentCourseAccess,
    } = useRM();
    const { packages, courses, getPackages, getCourses } = useContent();

    const [packageAccesses, setPackageAccesses] = useState<StudentPackagesAccessDetail[]>([]);
    const [courseAccesses, setCourseAccesses] = useState<StudentCourseAccessWithCourse[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        const [pkgRes, courseRes] = await Promise.all([
            getStudentPackageAccesses(studentId),
            getStudentCourseAccesses(studentId),
        ]);
        if (pkgRes.success && pkgRes.data) setPackageAccesses(pkgRes.data);
        else toast.error(pkgRes.message ?? "Failed to load package access");
        if (courseRes.success && courseRes.data) setCourseAccesses(courseRes.data);
        else toast.error(courseRes.message ?? "Failed to load course access");
    }, [getStudentPackageAccesses, getStudentCourseAccesses, studentId]);

    useEffect(() => {
        setLoading(true);
        Promise.all([refresh(), getPackages(), getCourses()]).finally(() => setLoading(false));
    }, [refresh, getPackages, getCourses]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 size={18} className="animate-spin" style={{ color: BRAND.primary }} />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <PackageAccessSection
                accesses={packageAccesses}
                options={packages
                    .filter((p) => !packageAccesses.some((a) => a.packageId === p.packageId))
                    .map((p) => ({ id: p.packageId, label: p.packageName, hint: formatMoney(p.price) }))}
                onAdd={(d) => addStudentPackageAccess(studentId, d)}
                onUpdate={(pid, d) => updateStudentPackageAccess(studentId, pid, d)}
                onRemove={(pid) => removeStudentPackageAccess(studentId, pid)}
                onSaved={refresh}
            />
            <CourseAccessSection
                accesses={courseAccesses}
                options={courses
                    .filter((c) => !courseAccesses.some((a) => a.courseId === c.courseId))
                    .map((c) => ({ id: c.courseId, label: c.courseName, hint: formatMoney(c.price) }))}
                onAdd={(d) => addStudentCourseAccess(studentId, d)}
                onUpdate={(cid, d) => updateStudentCourseAccess(studentId, cid, d)}
                onRemove={(cid) => removeStudentCourseAccess(studentId, cid)}
                onSaved={refresh}
            />
        </div>
    );
}

type AccessResult<T> = Promise<{ success: boolean; message: string | null; data: T | null }>;
type Option = { id: string; label: string; hint?: string };

/* ============================================================== */
/* Package access                                                  */
/* ============================================================== */

function PackageAccessSection({
    accesses, options, onAdd, onUpdate, onRemove, onSaved,
}: {
    accesses: StudentPackagesAccessDetail[];
    options: Option[];
    onAdd: (d: { packageId: string; expiresAt?: string | null; isActive?: boolean }) => AccessResult<unknown>;
    onUpdate: (packageId: string, d: { expiresAt?: string | null; isActive?: boolean }) => AccessResult<unknown>;
    onRemove: (packageId: string) => AccessResult<null>;
    onSaved: () => void;
}) {
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ packageId: "", expiresAt: "", isActive: true });
    const [busy, setBusy] = useState(false);

    const reset = () => setForm({ packageId: "", expiresAt: "", isActive: true });
    const close = () => { setAdding(false); setEditingId(null); reset(); };

    const submit = async () => {
        if (!editingId && !form.packageId) { toast.error("Select a package"); return; }
        setBusy(true);
        const payload = { expiresAt: form.expiresAt || null, isActive: form.isActive };
        const res = editingId
            ? await onUpdate(editingId, payload)
            : await onAdd({ packageId: form.packageId, ...payload });
        setBusy(false);
        if (res.success) { toast.success(editingId ? "Access updated" : "Access granted"); close(); onSaved(); }
        else toast.error(res.message ?? "Save failed");
    };

    const del = async (packageId: string, name: string) => {
        if (!confirm(`Revoke access to "${name}"?`)) return;
        const res = await onRemove(packageId);
        if (res.success) { toast.success("Access revoked"); onSaved(); }
        else toast.error(res.message ?? "Revoke failed");
    };

    const startEdit = (a: StudentPackagesAccessDetail) => {
        setForm({ packageId: a.packageId, expiresAt: a.expiresAt?.slice(0, 10) ?? "", isActive: a.isActive });
        setEditingId(a.packageId); setAdding(false);
    };

    return (
        <SectionShell
            title="Package Access"
            action={!adding && !editingId && options.length > 0 && (
                <AddButton color={BRAND.violet} onClick={() => { reset(); setAdding(true); }} label="Grant package" />
            )}
        >
            {(adding || editingId) && (
                <FormCard color={BRAND.violet} onCancel={close} onSubmit={submit} busy={busy}>
                    {!editingId && (
                        <AppOptionSelect
                            label="Package*"
                            value={form.packageId}
                            onChange={(v) => setForm({ ...form, packageId: v })}
                            options={options}
                        />
                    )}
                    <AppDateField label="Expires on" value={form.expiresAt} onChange={(v) => setForm({ ...form, expiresAt: v })} />
                    <ActiveToggle color={BRAND.violet} checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
                </FormCard>
            )}

            {accesses.length === 0 && !adding && !editingId ? (
                <EmptyState label="No package access granted yet." />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                    {accesses.map((a) => (
                        <AccessCard
                            key={a.packageId}
                            color={BRAND.violet}
                            bg={BRAND.violetBg}
                            icon={<Boxes size={13} />}
                            title={a.Packages.packageName}
                            price={a.Packages.price}
                            durationInMonths={a.Packages.durationInMonths}
                            expiresAt={a.expiresAt}
                            isActive={a.isActive}
                            onEdit={() => startEdit(a)}
                            onDelete={() => del(a.packageId, a.Packages.packageName)}
                        >
                            {a.Packages.isJobGuaranteed && (
                                <StatusChip label="Job guaranteed" color={BRAND.emerald} bg="#ffffff" />
                            )}
                            {a.Packages.packageLevel && (
                                <StatusChip label={a.Packages.packageLevel} color={BRAND.sky} bg="#ffffff" />
                            )}
                            {a.Packages.benefitsOnPackages?.length > 0 && (
                                <StatusChip
                                    label={`${a.Packages.benefitsOnPackages.length} benefits`}
                                    color={BRAND.amber}
                                    bg="#ffffff"
                                />
                            )}
                        </AccessCard>
                    ))}
                </div>
            )}

            {accesses.some((a) => a.Packages.benefitsOnPackages?.length > 0) && (
                <BenefitsSummary accesses={accesses} />
            )}
        </SectionShell>
    );
}

function BenefitsSummary({ accesses }: { accesses: StudentPackagesAccessDetail[] }) {
    const benefits = useMemo(() => {
        const map = new Map<string, { name: string; amount: number | null }>();
        accesses.forEach((a) => {
            a.Packages.benefitsOnPackages?.forEach((b) => {
                map.set(b.benefitId, { name: b.Benefits.benefitName, amount: b.Benefits.amount });
            });
        });
        return [...map.entries()].map(([id, v]) => ({ id, ...v }));
    }, [accesses]);

    if (benefits.length === 0) return null;

    return (
        <Surface accent={BRAND.amber} className="p-3">
            <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-gray-100">
                <span className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: BRAND.amberBg, color: BRAND.amber }}>
                    <Gift size={12} />
                </span>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-700">Included benefits</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {benefits.map((b) => (
                    <span
                        key={b.id}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium"
                        style={{ backgroundColor: BRAND.amberBg, color: "#92400e", border: `1px solid ${BRAND.amber}` }}
                    >
                        {b.name}
                        {b.amount !== null && <span className="text-[10px] opacity-80">· {formatMoney(b.amount)}</span>}
                    </span>
                ))}
            </div>
        </Surface>
    );
}

/* ============================================================== */
/* Course access                                                   */
/* ============================================================== */

function CourseAccessSection({
    accesses, options, onAdd, onUpdate, onRemove, onSaved,
}: {
    accesses: StudentCourseAccessWithCourse[];
    options: Option[];
    onAdd: (d: { courseId: string; expiresAt?: string | null; isActive?: boolean }) => AccessResult<unknown>;
    onUpdate: (courseId: string, d: { expiresAt?: string | null; isActive?: boolean }) => AccessResult<unknown>;
    onRemove: (courseId: string) => AccessResult<null>;
    onSaved: () => void;
}) {
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ courseId: "", expiresAt: "", isActive: true });
    const [busy, setBusy] = useState(false);

    const reset = () => setForm({ courseId: "", expiresAt: "", isActive: true });
    const close = () => { setAdding(false); setEditingId(null); reset(); };

    const submit = async () => {
        if (!editingId && !form.courseId) { toast.error("Select a course"); return; }
        setBusy(true);
        const payload = { expiresAt: form.expiresAt || null, isActive: form.isActive };
        const res = editingId
            ? await onUpdate(editingId, payload)
            : await onAdd({ courseId: form.courseId, ...payload });
        setBusy(false);
        if (res.success) { toast.success(editingId ? "Access updated" : "Access granted"); close(); onSaved(); }
        else toast.error(res.message ?? "Save failed");
    };

    const del = async (courseId: string, name: string) => {
        if (!confirm(`Revoke access to "${name}"?`)) return;
        const res = await onRemove(courseId);
        if (res.success) { toast.success("Access revoked"); onSaved(); }
        else toast.error(res.message ?? "Revoke failed");
    };

    const startEdit = (a: StudentCourseAccessWithCourse) => {
        setForm({ courseId: a.courseId, expiresAt: a.expiresAt?.slice(0, 10) ?? "", isActive: a.isActive });
        setEditingId(a.courseId); setAdding(false);
    };

    return (
        <SectionShell
            title="Course Access"
            action={!adding && !editingId && options.length > 0 && (
                <AddButton color={BRAND.cyan} onClick={() => { reset(); setAdding(true); }} label="Grant course" />
            )}
        >
            {(adding || editingId) && (
                <FormCard color={BRAND.cyan} onCancel={close} onSubmit={submit} busy={busy}>
                    {!editingId && (
                        <AppOptionSelect
                            label="Course*"
                            value={form.courseId}
                            onChange={(v) => setForm({ ...form, courseId: v })}
                            options={options}
                        />
                    )}
                    <AppDateField label="Expires on" value={form.expiresAt} onChange={(v) => setForm({ ...form, expiresAt: v })} />
                    <ActiveToggle color={BRAND.cyan} checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
                </FormCard>
            )}

            {accesses.length === 0 && !adding && !editingId ? (
                <EmptyState label="No course access granted yet." />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                    {accesses.map((a) => (
                        <AccessCard
                            key={a.courseId}
                            color={BRAND.cyan}
                            bg={BRAND.cyanBg}
                            icon={<BookOpen size={13} />}
                            title={a.Courses.courseName}
                            price={a.Courses.price}
                            durationInMonths={a.Courses.durationInMonths}
                            expiresAt={a.expiresAt}
                            isActive={a.isActive}
                            onEdit={() => startEdit(a)}
                            onDelete={() => del(a.courseId, a.Courses.courseName)}
                        >
                            {a.Courses.isCertified && <StatusChip label="Certified" color={BRAND.emerald} bg="#ffffff" />}
                            {a.Courses.noOfModules !== null && (
                                <StatusChip label={`${a.Courses.noOfModules} modules`} color={BRAND.sky} bg="#ffffff" />
                            )}
                        </AccessCard>
                    ))}
                </div>
            )}
        </SectionShell>
    );
}

/* ============================================================== */
/* Shared bits                                                     */
/* ============================================================== */

function AccessCard({
    color, bg, icon, title, price, durationInMonths, expiresAt, isActive, onEdit, onDelete, children,
}: {
    color: string;
    bg: string;
    icon: React.ReactNode;
    title: string;
    price: number | null;
    durationInMonths: number | null;
    expiresAt: string | null;
    isActive: boolean;
    onEdit: () => void;
    onDelete: () => void;
    children?: React.ReactNode;
}) {
    const expired = !!expiresAt && new Date(expiresAt).getTime() < Date.now();

    return (
        <Surface accent={color} className="p-3">
            <div className="flex items-start gap-2">
                <span className="w-7 h-7 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: bg, color }}>
                    {icon}
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-[11px] text-gray-500">
                        <span className="inline-flex items-center gap-1"><IndianRupee size={10} />{formatMoney(price)}</span>
                        {durationInMonths !== null && (
                            <span className="inline-flex items-center gap-1"><Timer size={10} />{durationInMonths} months</span>
                        )}
                        <span className="inline-flex items-center gap-1"><CalendarClock size={10} />{expiresAt ? formatDate(expiresAt) : "No expiry"}</span>
                    </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                    <IconButton size="small" onClick={onEdit} sx={{ color: "#9ca3af", "&:hover": { color: BRAND.primary } }}>
                        <Edit2 size={13} />
                    </IconButton>
                    <IconButton size="small" onClick={onDelete} sx={{ color: "#9ca3af", "&:hover": { color: BRAND.rose } }}>
                        <Trash2 size={14} />
                    </IconButton>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-1 mt-2 pt-2 border-t border-gray-100">
                <StatusChip
                    label={expired ? "Expired" : isActive ? "Active" : "Inactive"}
                    color={expired ? BRAND.orange : isActive ? BRAND.emerald : "#9ca3af"}
                />
                {children}
            </div>
        </Surface>
    );
}

function ActiveToggle({ checked, onChange, color }: { checked: boolean; onChange: (v: boolean) => void; color: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <Switch
                size="small"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: color },
                }}
            />
            <span className="text-xs text-gray-600">Active</span>
        </div>
    );
}
