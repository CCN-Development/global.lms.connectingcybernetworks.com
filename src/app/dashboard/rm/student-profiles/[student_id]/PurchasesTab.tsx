"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    BookOpen, Boxes, Calculator, CalendarClock, CheckCircle2, ChevronDown, ChevronUp, Clock,
    CreditCard, Edit2, Loader2, Plus, Receipt, Trash2, TrendingUp, Wallet,
} from "lucide-react";
import { Button, Chip, IconButton, LinearProgress, Switch } from "@mui/material";
import { useRM, type AddPurchaseInput, type UpdatePurchaseInput } from "@/contexts/RMContext";
import { useContent } from "@/contexts/ContentContext";
import type { StudentPaymentSchedule, StudentPurchaseDetail } from "@/contexts/StudentContext";
import {
    AddButton, AppDateField, AppMultiSelect, AppNumberField, AppOptionSelect, BRAND,
    EmptyState, FormCard, SectionShell, StatusChip, Surface, formatDate, formatMoney,
} from "./ui";

type PurchaseForm = {
    purchasedAt: string;
    amount: number | "";
    currentPaidAmount: number | "";
    isEMIEnabled: boolean;
    numberOfInstallments: number | "";
    packageIds: string[];
    courseIds: string[];
};

const emptyForm: PurchaseForm = {
    purchasedAt: new Date().toISOString().slice(0, 10),
    amount: "",
    currentPaidAmount: "",
    isEMIEnabled: false,
    numberOfInstallments: "",
    packageIds: [],
    courseIds: [],
};

export default function PurchasesTab({ studentId }: { studentId: string }) {
    const {
        getStudentPurchases, addStudentPurchase, updateStudentPurchase, removeStudentPurchase,
        addPackageInPurchase, removePackageFromPurchase,
        addCourseInPurchase, removeCourseFromPurchase,
    } = useRM();
    const { packages, courses, getPackages, getCourses } = useContent();

    const [purchases, setPurchases] = useState<StudentPurchaseDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<PurchaseForm>(emptyForm);
    const [amountEdited, setAmountEdited] = useState(false);
    const [busy, setBusy] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        const res = await getStudentPurchases(studentId);
        if (res.success && res.data) setPurchases(res.data);
        else toast.error(res.message ?? "Failed to load purchases");
    }, [getStudentPurchases, studentId]);

    useEffect(() => {
        setLoading(true);
        Promise.all([refresh(), getPackages(), getCourses()]).finally(() => setLoading(false));
    }, [refresh, getPackages, getCourses]);

    const packageOptions = useMemo(
        () => packages.map((p) => ({ id: p.packageId, label: p.packageName, hint: formatMoney(p.price) })),
        [packages],
    );
    const courseOptions = useMemo(
        () => courses.map((c) => ({ id: c.courseId, label: c.courseName, hint: formatMoney(c.price) })),
        [courses],
    );

    const selectionTotals = useMemo(() => {
        const selectedPackages = packages.filter((p) => form.packageIds.includes(p.packageId));
        const selectedCourses = courses.filter((c) => form.courseIds.includes(c.courseId));
        const packagesTotal = selectedPackages.reduce((sum, p) => sum + (p.price ?? 0), 0);
        const discount = selectedPackages.reduce((sum, p) => sum + (p.discountAmount ?? 0), 0);
        const coursesTotal = selectedCourses.reduce((sum, c) => sum + (c.price ?? 0), 0);
        return {
            packagesTotal,
            coursesTotal,
            discount,
            total: Math.max(0, Math.round((packagesTotal + coursesTotal - discount) * 100) / 100),
            count: selectedPackages.length + selectedCourses.length,
        };
    }, [packages, courses, form.packageIds, form.courseIds]);

    // Selection drives the amount until the user types their own figure.
    useEffect(() => {
        if (editingId || amountEdited) return;
        setForm((f) => {
            const next = selectionTotals.total || "";
            return f.amount === next ? f : { ...f, amount: next };
        });
    }, [selectionTotals.total, editingId, amountEdited]);

    const close = () => { setAdding(false); setEditingId(null); setForm(emptyForm); setAmountEdited(false); };

    const submit = async () => {
        if (form.amount === "" || Number(form.amount) <= 0) { toast.error("Enter a valid amount"); return; }
        const paid = form.currentPaidAmount === "" ? 0 : Number(form.currentPaidAmount);
        if (paid > Number(form.amount)) { toast.error("Paid amount cannot exceed the total amount"); return; }
        if (form.isEMIEnabled && (form.numberOfInstallments === "" || Number(form.numberOfInstallments) < 1)) {
            toast.error("Enter the number of installments"); return;
        }

        const base: UpdatePurchaseInput = {
            purchasedAt: form.purchasedAt || undefined,
            amount: Number(form.amount),
            currentPaidAmount: paid,
            isEMIEnabled: form.isEMIEnabled,
            numberOfInstallments: form.isEMIEnabled ? Number(form.numberOfInstallments) : 1,
        };

        setBusy(true);
        const res = editingId
            ? await updateStudentPurchase(editingId, base)
            : await addStudentPurchase(studentId, {
                ...base,
                packageIds: form.packageIds,
                courseIds: form.courseIds,
            } as AddPurchaseInput);
        setBusy(false);

        if (res.success) {
            toast.success(editingId ? "Purchase updated" : "Purchase created");
            close();
            refresh();
        } else toast.error(res.message ?? "Save failed");
    };

    const startEdit = (p: StudentPurchaseDetail) => {
        setForm({
            purchasedAt: p.purchasedAt.slice(0, 10),
            amount: p.amount ?? "",
            currentPaidAmount: p.currentPaidAmount ?? "",
            isEMIEnabled: p.isEMIEnabled,
            numberOfInstallments: p.numberOfInstallments ?? "",
            packageIds: p.packagesInPurchases.map((x) => x.packageId),
            courseIds: p.courseInPurchases.map((x) => x.courseId),
        });
        setEditingId(p.purchaseId);
        setAdding(false);
        setAmountEdited(true);
        setExpandedId(p.purchaseId);
    };

    const del = async (purchaseId: string) => {
        if (!confirm("Delete this purchase along with its payment schedule?")) return;
        const res = await removeStudentPurchase(purchaseId);
        if (res.success) { toast.success("Purchase deleted"); refresh(); }
        else toast.error(res.message ?? "Delete failed");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 size={18} className="animate-spin" style={{ color: BRAND.primary }} />
            </div>
        );
    }

    const totals = purchases.reduce(
        (acc, p) => ({
            amount: acc.amount + (p.amount ?? 0),
            paid: acc.paid + (p.currentPaidAmount ?? 0),
        }),
        { amount: 0, paid: 0 },
    );

    return (
        <div className="flex flex-col gap-3">
            {purchases.length > 0 && <TotalsBanner total={totals.amount} paid={totals.paid} count={purchases.length} />}

            <SectionShell
                title="Purchases"
                action={!adding && !editingId && (
                    <AddButton
                        color={BRAND.primary}
                        onClick={() => { setForm(emptyForm); setAmountEdited(false); setAdding(true); }}
                        label="New purchase"
                    />
                )}
            >
                {(adding || editingId) && (
                    <FormCard color={BRAND.primary} onCancel={close} onSubmit={submit} busy={busy}>
                        <AppDateField label="Purchase date" value={form.purchasedAt} onChange={(v) => setForm({ ...form, purchasedAt: v })} />
                        <AppNumberField
                            label="Total amount*"
                            value={form.amount}
                            onChange={(v) => { setAmountEdited(true); setForm({ ...form, amount: v }); }}
                        />
                        {/* <AppNumberField label="Paid amount" value={form.currentPaidAmount} onChange={(v) => setForm({ ...form, currentPaidAmount: v })} /> */}
                        <div className="flex items-center gap-1.5">
                            <Switch
                                size="small"
                                checked={form.isEMIEnabled}
                                onChange={(e) => setForm({ ...form, isEMIEnabled: e.target.checked })}
                                sx={{
                                    "& .MuiSwitch-switchBase.Mui-checked": { color: BRAND.primary },
                                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: BRAND.primary },
                                }}
                            />
                            <span className="text-xs text-gray-600">EMI enabled</span>
                        </div>
                        {form.isEMIEnabled && (
                            <AppNumberField
                                label="No. of installments*"
                                min={1}
                                value={form.numberOfInstallments}
                                onChange={(v) => setForm({ ...form, numberOfInstallments: v })}
                            />
                        )}
                        {!editingId && (
                            <>
                                <div className="sm:col-span-2">
                                    <AppMultiSelect
                                        label="Packages"
                                        color={BRAND.violet}
                                        values={form.packageIds}
                                        onChange={(v) => setForm({ ...form, packageIds: v })}
                                        options={packageOptions}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <AppMultiSelect
                                        label="Courses"
                                        color={BRAND.cyan}
                                        values={form.courseIds}
                                        onChange={(v) => setForm({ ...form, courseIds: v })}
                                        options={courseOptions}
                                    />
                                </div>
                                {selectionTotals.count > 0 && (
                                    <div className="sm:col-span-2">
                                        <SelectionBreakdown
                                            totals={selectionTotals}
                                            currentAmount={form.amount}
                                            onApply={() => { setAmountEdited(false); setForm({ ...form, amount: selectionTotals.total || "" }); }}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                        <p className="sm:col-span-2 text-[11px] text-gray-500">
                            The payment schedule is generated automatically from the amount, installments and paid amount.
                        </p>
                    </FormCard>
                )}

                {purchases.length === 0 && !adding ? (
                    <EmptyState label="No purchases recorded yet." />
                ) : (
                    <div className="flex flex-col gap-1.5">
                        {purchases.map((p) => (
                            <PurchaseCard
                                key={p.purchaseId}
                                purchase={p}
                                expanded={expandedId === p.purchaseId}
                                onToggle={() => setExpandedId(expandedId === p.purchaseId ? null : p.purchaseId)}
                                onEdit={() => startEdit(p)}
                                onDelete={() => del(p.purchaseId)}
                                packageOptions={packageOptions}
                                courseOptions={courseOptions}
                                onAddPackage={(pid) => addPackageInPurchase(p.purchaseId, pid)}
                                onRemovePackage={(pid) => removePackageFromPurchase(p.purchaseId, pid)}
                                onAddCourse={(cid) => addCourseInPurchase(p.purchaseId, cid)}
                                onRemoveCourse={(cid) => removeCourseFromPurchase(p.purchaseId, cid)}
                                onSaved={refresh}
                            />
                        ))}
                    </div>
                )}
            </SectionShell>
        </div>
    );
}

/* ============================================================== */
/* Selection price breakdown                                       */
/* ============================================================== */

function SelectionBreakdown({
    totals, currentAmount, onApply,
}: {
    totals: { packagesTotal: number; coursesTotal: number; discount: number; total: number };
    currentAmount: number | "";
    onApply: () => void;
}) {
    const overridden = currentAmount !== "" && Number(currentAmount) !== totals.total;

    return (
        <div
            className="flex flex-wrap items-center gap-x-3 gap-y-1 px-2.5 py-2 rounded-lg text-[11px]"
            style={{ backgroundColor: BRAND.skyBg, border: `1px solid ${BRAND.sky}`, color: "#0369a1" }}
        >
            <Calculator size={13} />
            {totals.packagesTotal > 0 && <span>Packages {formatMoney(totals.packagesTotal)}</span>}
            {totals.coursesTotal > 0 && <span>Courses {formatMoney(totals.coursesTotal)}</span>}
            {totals.discount > 0 && <span style={{ color: BRAND.rose }}>Discount −{formatMoney(totals.discount)}</span>}
            <span className="font-bold">Suggested {formatMoney(totals.total)}</span>
            {overridden && (
                <Button
                    onClick={onApply}
                    size="small"
                    sx={{ ml: "auto", textTransform: "none", fontSize: "0.7rem", fontWeight: 600, color: BRAND.sky, minWidth: 0, py: 0 }}
                >
                    Use suggested
                </Button>
            )}
        </div>
    );
}

/* ============================================================== */
/* Totals banner                                                   */
/* ============================================================== */

function TotalsBanner({ total, paid, count }: { total: number; paid: number; count: number }) {
    const balance = Math.max(0, total - paid);
    const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;

    return (
        <Surface accent={BRAND.primary} className="overflow-hidden">
            <div
                className="px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2"
                style={{ background: `linear-gradient(90deg, ${BRAND.primary} 0%, ${BRAND.violet} 100%)` }}
            >
                <BannerStat icon={<Receipt size={14} />} label="Purchases" value={String(count)} />
                <BannerStat icon={<TrendingUp size={14} />} label="Total" value={formatMoney(total)} />
                <BannerStat icon={<Wallet size={14} />} label="Collected" value={formatMoney(paid)} />
                <BannerStat icon={<Clock size={14} />} label="Balance" value={formatMoney(balance)} />
            </div>
            <div className="px-4 py-2">
                <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                    <span>Collection progress</span>
                    <span className="font-semibold text-gray-700">{pct.toFixed(0)}%</span>
                </div>
                <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                        height: 6, borderRadius: 3, backgroundColor: "#e5e7eb",
                        "& .MuiLinearProgress-bar": { backgroundColor: pct >= 100 ? BRAND.emerald : BRAND.primary, borderRadius: 3 },
                    }}
                />
            </div>
        </Surface>
    );
}

function BannerStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-2 text-white">
            <span className="opacity-90">{icon}</span>
            <div className="leading-tight">
                <p className="text-[10px] uppercase tracking-wide opacity-90">{label}</p>
                <p className="text-sm font-bold">{value}</p>
            </div>
        </div>
    );
}

/* ============================================================== */
/* Purchase card                                                   */
/* ============================================================== */

type MutateResult = Promise<{ success: boolean; message: string | null; data: unknown }>;

function PurchaseCard({
    purchase, expanded, onToggle, onEdit, onDelete,
    packageOptions, courseOptions,
    onAddPackage, onRemovePackage, onAddCourse, onRemoveCourse, onSaved,
}: {
    purchase: StudentPurchaseDetail;
    expanded: boolean;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
    packageOptions: { id: string; label: string; hint?: string }[];
    courseOptions: { id: string; label: string; hint?: string }[];
    onAddPackage: (packageId: string) => MutateResult;
    onRemovePackage: (packageId: string) => MutateResult;
    onAddCourse: (courseId: string) => MutateResult;
    onRemoveCourse: (courseId: string) => MutateResult;
    onSaved: () => void;
}) {
    const amount = purchase.amount ?? 0;
    const paid = purchase.currentPaidAmount ?? 0;
    const balance = Math.max(0, amount - paid);
    const pct = amount > 0 ? Math.min(100, (paid / amount) * 100) : 0;
    const schedules = [...purchase.studentPaymentSchedules].sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );
    const paidCount = schedules.filter((s) => s.isPaid).length;
    const accent = purchase.isAllPaymentsDone ? BRAND.emerald : purchase.isEMIEnabled ? BRAND.violet : BRAND.primary;

    return (
        <Surface accent={accent} className="overflow-hidden">
            {/* Summary row */}
            <div className="p-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span
                    className="w-8 h-8 rounded flex items-center justify-center shrink-0"
                    style={{ backgroundColor: purchase.isAllPaymentsDone ? BRAND.emeraldBg : BRAND.skyBg, color: accent }}
                >
                    <CreditCard size={15} />
                </span>

                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-bold text-gray-900">{formatMoney(amount)}</p>
                        <StatusChip
                            label={purchase.isAllPaymentsDone ? "Fully paid" : "Outstanding"}
                            color={purchase.isAllPaymentsDone ? BRAND.emerald : BRAND.orange}
                        />
                        {purchase.isEMIEnabled && (
                            <StatusChip label={`EMI · ${purchase.numberOfInstallments ?? 0}`} color={BRAND.violet} bg="#ffffff" />
                        )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 inline-flex items-center gap-1">
                        <CalendarClock size={10} /> {formatDate(purchase.purchasedAt)}
                    </p>
                </div>

                <div className="hidden sm:flex items-center gap-4 text-[11px]">
                    <MiniStat label="Paid" value={formatMoney(paid)} color={BRAND.emerald} />
                    <MiniStat label="Balance" value={formatMoney(balance)} color={balance > 0 ? BRAND.rose : BRAND.emerald} />
                    {schedules.length > 0 && (
                        <MiniStat label="Installments" value={`${paidCount}/${schedules.length}`} color={BRAND.violet} />
                    )}
                </div>

                <div className="ml-auto flex items-center gap-0.5">
                    <IconButton size="small" onClick={onEdit} sx={{ color: "#9ca3af", "&:hover": { color: BRAND.primary } }}>
                        <Edit2 size={13} />
                    </IconButton>
                    <IconButton size="small" onClick={onDelete} sx={{ color: "#9ca3af", "&:hover": { color: BRAND.rose } }}>
                        <Trash2 size={14} />
                    </IconButton>
                    <IconButton size="small" onClick={onToggle} sx={{ color: accent }}>
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </IconButton>
                </div>

                <div className="w-full">
                    <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                            height: 5, borderRadius: 3, backgroundColor: "#f1f5f9",
                            "& .MuiLinearProgress-bar": { backgroundColor: pct >= 100 ? BRAND.emerald : accent, borderRadius: 3 },
                        }}
                    />
                </div>
            </div>

            {expanded && (
                <div className="border-t border-gray-100 p-3 flex flex-col gap-3" style={{ backgroundColor: "#fafafa" }}>
                    <ItemsBlock
                        title="Packages"
                        color={BRAND.violet}
                        bg={BRAND.violetBg}
                        icon={<Boxes size={12} />}
                        items={purchase.packagesInPurchases.map((x) => ({
                            id: x.packageId,
                            label: x.Packages.packageName,
                            hint: formatMoney(x.Packages.price),
                        }))}
                        options={packageOptions.filter((o) => !purchase.packagesInPurchases.some((x) => x.packageId === o.id))}
                        onAdd={onAddPackage}
                        onRemove={onRemovePackage}
                        onSaved={onSaved}
                    />
                    <ItemsBlock
                        title="Courses"
                        color={BRAND.cyan}
                        bg={BRAND.cyanBg}
                        icon={<BookOpen size={12} />}
                        items={purchase.courseInPurchases.map((x) => ({
                            id: x.courseId,
                            label: x.Courses.courseName,
                            hint: formatMoney(x.Courses.price),
                        }))}
                        options={courseOptions.filter((o) => !purchase.courseInPurchases.some((x) => x.courseId === o.id))}
                        onAdd={onAddCourse}
                        onRemove={onRemoveCourse}
                        onSaved={onSaved}
                    />
                    <ScheduleBlock schedules={schedules} />
                </div>
            )}
        </Surface>
    );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="leading-tight">
            <p className="text-[10px] uppercase tracking-wide text-gray-400">{label}</p>
            <p className="text-xs font-bold" style={{ color }}>{value}</p>
        </div>
    );
}

/* ============================================================== */
/* Packages / Courses inside a purchase                            */
/* ============================================================== */

function ItemsBlock({
    title, color, bg, icon, items, options, onAdd, onRemove, onSaved,
}: {
    title: string;
    color: string;
    bg: string;
    icon: React.ReactNode;
    items: { id: string; label: string; hint?: string }[];
    options: { id: string; label: string; hint?: string }[];
    onAdd: (id: string) => MutateResult;
    onRemove: (id: string) => MutateResult;
    onSaved: () => void;
}) {
    const [picking, setPicking] = useState(false);
    const [selected, setSelected] = useState("");
    const [busy, setBusy] = useState(false);

    const add = async () => {
        if (!selected) { toast.error(`Select a ${title.slice(0, -1).toLowerCase()}`); return; }
        setBusy(true);
        const res = await onAdd(selected);
        setBusy(false);
        if (res.success) { toast.success(res.message ?? "Added"); setPicking(false); setSelected(""); onSaved(); }
        else toast.error(res.message ?? "Add failed");
    };

    const remove = async (id: string, label: string) => {
        if (!confirm(`Remove "${label}" from this purchase?`)) return;
        const res = await onRemove(id);
        if (res.success) { toast.success(res.message ?? "Removed"); onSaved(); }
        else toast.error(res.message ?? "Remove failed");
    };

    return (
        <Surface accent={color} className="p-3">
            <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-gray-100">
                <span className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: bg, color }}>
                    {icon}
                </span>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-700">{title}</h4>
                {!picking && options.length > 0 && (
                    <Button
                        onClick={() => setPicking(true)}
                        size="small"
                        startIcon={<Plus size={12} />}
                        sx={{ ml: "auto", textTransform: "none", fontSize: "0.7rem", color, minWidth: 0, py: 0.25 }}
                    >
                        Add
                    </Button>
                )}
            </div>

            {picking && (
                <div className="flex flex-col sm:flex-row gap-1.5 mb-2">
                    <div className="flex-1">
                        <AppOptionSelect label={title.slice(0, -1)} value={selected} onChange={setSelected} options={options} />
                    </div>
                    <div className="flex gap-1.5">
                        <Button
                            onClick={add}
                            disabled={busy}
                            size="small"
                            variant="contained"
                            sx={{ textTransform: "none", borderRadius: "8px", fontSize: "0.72rem", bgcolor: color, "&:hover": { bgcolor: color, filter: "brightness(0.9)" } }}
                        >
                            Add
                        </Button>
                        <Button
                            onClick={() => { setPicking(false); setSelected(""); }}
                            disabled={busy}
                            size="small"
                            variant="outlined"
                            sx={{ textTransform: "none", borderRadius: "8px", fontSize: "0.72rem", borderColor: "#e5e7eb", color: "#374151" }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {items.length === 0 ? (
                <p className="text-[11px] text-gray-400">None added.</p>
            ) : (
                <div className="flex flex-wrap gap-1.5">
                    {items.map((item) => (
                        <Chip
                            key={item.id}
                            size="small"
                            label={item.hint ? `${item.label} · ${item.hint}` : item.label}
                            onDelete={() => remove(item.id, item.label)}
                            sx={{
                                height: 24, fontSize: "0.7rem", fontWeight: 600, borderRadius: "6px",
                                backgroundColor: bg, color, border: `1px solid ${color}`,
                                "& .MuiChip-deleteIcon": { color, fontSize: 15, "&:hover": { color: BRAND.rose } },
                            }}
                        />
                    ))}
                </div>
            )}
        </Surface>
    );
}

/* ============================================================== */
/* Payment schedule                                                */
/* ============================================================== */

function ScheduleBlock({ schedules }: { schedules: StudentPaymentSchedule[] }) {
    const today = new Date().setHours(0, 0, 0, 0);

    return (
        <Surface accent={BRAND.amber} className="p-3">
            <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-gray-100">
                <span className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: BRAND.amberBg, color: BRAND.amber }}>
                    <CalendarClock size={12} />
                </span>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-700">Payment Schedule</h4>
                <span className="ml-auto text-[11px] text-gray-400">
                    {schedules.filter((s) => s.isPaid).length}/{schedules.length} settled
                </span>
            </div>

            {schedules.length === 0 ? (
                <p className="text-[11px] text-gray-400">No schedule generated.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                                <th className="text-left font-semibold py-1.5 pr-2">#</th>
                                <th className="text-left font-semibold py-1.5 pr-2">Due date</th>
                                <th className="text-right font-semibold py-1.5 pr-2">Amount</th>
                                <th className="text-right font-semibold py-1.5 pr-2 hidden sm:table-cell">Received</th>
                                <th className="text-right font-semibold py-1.5 pr-2 hidden md:table-cell">Fine</th>
                                <th className="text-right font-semibold py-1.5">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map((s, index) => {
                                const overdue = !s.isPaid && new Date(s.dueDate).setHours(0, 0, 0, 0) < today;
                                const received = s.isPaid ? s.amount : s.isPartialPayment ? (s.partialPaymentAmount ?? 0) : 0;
                                return (
                                    <tr
                                        key={s.scheduleId}
                                        className="border-b border-gray-50 last:border-0 transition-colors hover:bg-[#f5f3ff]"
                                    >
                                        <td className="py-1.5 pr-2 text-gray-400 font-mono">{index + 1}</td>
                                        <td className="py-1.5 pr-2 text-gray-700">{formatDate(s.dueDate)}</td>
                                        <td className="py-1.5 pr-2 text-right font-semibold text-gray-900">{formatMoney(s.amount)}</td>
                                        <td className="py-1.5 pr-2 text-right hidden sm:table-cell" style={{ color: received > 0 ? BRAND.emerald : "#9ca3af" }}>
                                            {received > 0 ? formatMoney(received) : "—"}
                                        </td>
                                        <td className="py-1.5 pr-2 text-right hidden md:table-cell" style={{ color: s.fineAmount ? BRAND.rose : "#9ca3af" }}>
                                            {s.fineAmount ? formatMoney(s.fineAmount) : "—"}
                                        </td>
                                        <td className="py-1.5 text-right">
                                            {s.isPaid ? (
                                                <span className="inline-flex items-center gap-1 font-semibold" style={{ color: BRAND.emerald }}>
                                                    <CheckCircle2 size={11} /> Paid
                                                </span>
                                            ) : s.isPartialPayment ? (
                                                <StatusChip label="Partial" color={BRAND.amber} />
                                            ) : overdue ? (
                                                <StatusChip label="Overdue" color={BRAND.rose} />
                                            ) : (
                                                <StatusChip label="Pending" color="#9ca3af" />
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </Surface>
    );
}
