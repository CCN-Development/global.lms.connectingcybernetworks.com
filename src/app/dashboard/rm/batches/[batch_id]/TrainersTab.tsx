"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { GraduationCap, Mail, Phone, Trash2, UserPlus, X, Save } from "lucide-react";
import { Button, CircularProgress, IconButton, Paper, Skeleton, Tooltip } from "@mui/material";
import { useBatch, type BatchDetail } from "@/contexts/BatchContext";
import {
    AppMultiSelect, BRAND, EmptyState, StatusChip, Surface,
} from "@/components/batches/batch-ui";

export default function TrainersTab({ batch, onChanged }: { batch: BatchDetail; onChanged: () => void }) {
    const {
        batchTrainers, loadingBatchTrainers, getBatchTrainers,
        addBatchTrainers, removeBatchTrainer, branchTrainers, getBranchTrainers,
    } = useBatch();

    const [adding, setAdding] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [busy, setBusy] = useState(false);

    const refresh = useCallback(() => { getBatchTrainers(batch.batchId); }, [getBatchTrainers, batch.batchId]);

    useEffect(() => { refresh(); }, [refresh]);
    useEffect(() => {
        if (adding && branchTrainers.length === 0) getBranchTrainers();
    }, [adding, branchTrainers.length, getBranchTrainers]);

    const assignedIds = useMemo(() => new Set(batchTrainers.map((t) => t.trainerId)), [batchTrainers]);

    const options = useMemo(
        () => branchTrainers
            .filter((t) => t.isActive && !assignedIds.has(t.trainerId))
            .map((t) => ({ id: t.trainerId, label: t.trainerName, hint: t.phoneNumber })),
        [branchTrainers, assignedIds],
    );

    const submitAdd = async () => {
        if (selected.length === 0) {
            toast.error("Select at least one trainer");
            return;
        }
        setBusy(true);
        const res = await addBatchTrainers(batch.batchId, selected);
        setBusy(false);
        if (!res.success) {
            toast.error(res.message ?? "Failed to add trainers");
            return;
        }
        toast.success(`${res.data?.addedCount ?? selected.length} trainer(s) assigned`);
        setSelected([]);
        setAdding(false);
        refresh();
        onChanged();
    };

    const remove = async (trainerId: string) => {
        const res = await removeBatchTrainer(batch.batchId, trainerId);
        if (res.success) {
            toast.success("Trainer removed");
            refresh();
            onChanged();
        } else {
            toast.error(res.message ?? "Failed to remove trainer");
        }
    };

    return (
        <div className="flex flex-col gap-2 sm:gap-3">
            <Paper elevation={0} sx={{ borderRadius: "8px", border: `1px solid ${BRAND.emerald}`, p: 1.25 }}>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span
                            className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                            style={{ backgroundColor: BRAND.emeraldBg, color: BRAND.emerald }}
                        >
                            <GraduationCap size={13} />
                        </span>
                        <span className="text-xs font-semibold text-gray-700 truncate">
                            {batchTrainers.length} trainer(s) assigned to this batch
                        </span>
                    </div>
                    <Button
                        onClick={() => setAdding((prev) => !prev)}
                        size="small"
                        variant="contained"
                        startIcon={adding ? <X size={13} /> : <UserPlus size={13} />}
                        sx={{
                            textTransform: "none", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 600, whiteSpace: "nowrap",
                            bgcolor: adding ? BRAND.slate : BRAND.emerald,
                            "&:hover": { bgcolor: adding ? "#475569" : "#059669" },
                        }}
                    >
                        {adding ? "Cancel" : "Assign trainers"}
                    </Button>
                </div>

                {adding && (
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 pt-2 mt-2 border-t border-gray-100">
                        <AppMultiSelect
                            label="Trainers"
                            values={selected}
                            onChange={setSelected}
                            options={options}
                            color={BRAND.emerald}
                        />
                        <Button
                            onClick={submitAdd}
                            disabled={busy}
                            size="small"
                            variant="contained"
                            startIcon={busy ? <CircularProgress size={12} color="inherit" /> : <Save size={12} />}
                            sx={{
                                textTransform: "none", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 600,
                                bgcolor: BRAND.primary, "&:hover": { bgcolor: BRAND.primaryHover },
                            }}
                        >
                            Assign
                        </Button>
                    </div>
                )}
            </Paper>

            {loadingBatchTrainers ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={96} sx={{ borderRadius: "8px" }} />
                    ))}
                </div>
            ) : batchTrainers.length === 0 ? (
                <EmptyState label="No trainer assigned to this batch yet." color={BRAND.emerald} />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                    {batchTrainers.map((trainer) => (
                        <Surface key={trainer.trainerId} accent={BRAND.emerald} className="p-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span
                                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                                        style={{ backgroundColor: BRAND.emeraldBg, color: BRAND.emerald }}
                                    >
                                        {trainer.trainerName.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase()).join("")}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{trainer.trainerName}</p>
                                        <StatusChip
                                            label={trainer.isActive ? "Active" : "Inactive"}
                                            color={trainer.isActive ? BRAND.emerald : BRAND.slate}
                                        />
                                    </div>
                                </div>
                                <Tooltip title={batchTrainers.length <= 1 ? "A batch must keep at least one trainer" : "Remove trainer"}>
                                    <span>
                                        <IconButton
                                            size="small"
                                            disabled={batchTrainers.length <= 1}
                                            onClick={() => remove(trainer.trainerId)}
                                            sx={{ color: "#9ca3af", "&:hover": { color: BRAND.rose } }}
                                        >
                                            <Trash2 size={13} />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </div>

                            <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                                    <Phone size={11} style={{ color: BRAND.sky }} />
                                    <span className="font-mono">+{trainer.callingCode} {trainer.phoneNumber}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-600 min-w-0">
                                    <Mail size={11} style={{ color: BRAND.violet }} />
                                    <span className="truncate">{trainer.email ?? "—"}</span>
                                </div>
                            </div>
                        </Surface>
                    ))}
                </div>
            )}
        </div>
    );
}
