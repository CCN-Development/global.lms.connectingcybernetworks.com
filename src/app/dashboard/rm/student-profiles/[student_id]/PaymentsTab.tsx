"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    BadgeCheck, CalendarClock, Hash, Loader2, Receipt, Wallet,
} from "lucide-react";
import { useRM } from "@/contexts/RMContext";
import type { StudentPayment } from "@/contexts/StudentContext";
import {
    BRAND, EmptyState, InfoRow, SectionShell, StatusChip, Surface, formatDate, formatMoney,
} from "./ui";

function statusColor(status: string | null) {
    const value = (status ?? "").toLowerCase();
    if (value.includes("success") || value.includes("paid") || value.includes("complete")) return BRAND.emerald;
    if (value.includes("pending") || value.includes("process")) return BRAND.amber;
    if (value.includes("fail") || value.includes("cancel") || value.includes("reject")) return BRAND.rose;
    return BRAND.sky;
}

export default function PaymentsTab({ studentId }: { studentId: string }) {
    const { getStudentPayments } = useRM();
    const [payments, setPayments] = useState<StudentPayment[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        const res = await getStudentPayments(studentId);
        if (res.success && res.data) setPayments(res.data);
        else toast.error(res.message ?? "Failed to load payments");
    }, [getStudentPayments, studentId]);

    useEffect(() => {
        setLoading(true);
        refresh().finally(() => setLoading(false));
    }, [refresh]);

    const totals = useMemo(() => {
        const total = payments.reduce((sum, p) => sum + (p.amount ?? 0), 0);
        const verified = payments.filter((p) => p.isVerified).length;
        return { total, verified, count: payments.length };
    }, [payments]);

    const sorted = useMemo(
        () => [...payments].sort((a, b) =>
            new Date(b.paymentDate ?? b.createdAt).getTime() - new Date(a.paymentDate ?? a.createdAt).getTime(),
        ),
        [payments],
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 size={18} className="animate-spin" style={{ color: BRAND.primary }} />
            </div>
        );
    }

    return (
        <SectionShell title="Payments">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Surface accent={BRAND.emerald} className="p-3">
                    <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: BRAND.emeraldBg, color: BRAND.emerald }}>
                            <Wallet size={13} />
                        </span>
                        <span className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">Total collected</span>
                    </div>
                    <p className="text-base font-bold text-gray-900 mt-1.5">{formatMoney(totals.total)}</p>
                </Surface>
                <Surface accent={BRAND.sky} className="p-3">
                    <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: BRAND.skyBg, color: BRAND.sky }}>
                            <Receipt size={13} />
                        </span>
                        <span className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">Transactions</span>
                    </div>
                    <p className="text-base font-bold text-gray-900 mt-1.5">{totals.count}</p>
                </Surface>
                <Surface accent={BRAND.violet} className="p-3">
                    <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: BRAND.violetBg, color: BRAND.violet }}>
                            <BadgeCheck size={13} />
                        </span>
                        <span className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">Verified</span>
                    </div>
                    <p className="text-base font-bold text-gray-900 mt-1.5">{totals.verified} / {totals.count}</p>
                </Surface>
            </div>

            {sorted.length === 0 ? (
                <EmptyState label="No payments recorded yet." />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {sorted.map((payment) => (
                        <Surface key={payment.paymentId} accent={BRAND.primary} className="p-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900">{formatMoney(payment.amount)}</p>
                                    <p className="text-[11px] text-gray-500 mt-0.5">{formatDate(payment.paymentDate ?? payment.createdAt)}</p>
                                </div>
                                <div className="flex flex-wrap items-center justify-end gap-1">
                                    {payment.paymentStatus && (
                                        <StatusChip label={payment.paymentStatus} color={statusColor(payment.paymentStatus)} />
                                    )}
                                    <StatusChip
                                        label={payment.isVerified ? "Verified" : "Unverified"}
                                        color={payment.isVerified ? BRAND.emerald : "#9ca3af"}
                                    />
                                </div>
                            </div>

                            <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1">
                                {payment.paymentMode && <InfoRow icon={<Wallet size={11} />} label="Mode" value={payment.paymentMode} />}
                                {payment.transactionId && <InfoRow icon={<Hash size={11} />} label="Txn" value={payment.transactionId} mono />}
                                {payment.paymentReference && <InfoRow icon={<Receipt size={11} />} label="Ref" value={payment.paymentReference} mono />}
                                {payment.purchaseId && <InfoRow icon={<CalendarClock size={11} />} label="Purchase" value={payment.purchaseId} mono />}
                                {payment.comments && <p className="text-[11px] text-gray-500">{payment.comments}</p>}
                            </div>
                        </Surface>
                    ))}
                </div>
            )}
        </SectionShell>
    );
}
