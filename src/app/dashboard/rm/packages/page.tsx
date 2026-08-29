"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import RMDashboardLayout from "@/layouts/RMDashboardLayout";
import {
    useContent,
    type Package,
    type PackageDetail,
    type Course,
    type Benefit,
    type CreatePackageInput,
    type CreateBenefitInput,
} from "@/contexts/ContentContext";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Snackbar,
    Switch,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    LuBadgeCheck,
    LuBookOpen,
    LuClock,
    LuGift,
    LuLayers,
    LuPencil,
    LuPlus,
    LuRefreshCw,
    LuSearch,
    LuSettings2,
    LuTrash2,
    LuTriangleAlert,
    LuX,
} from "react-icons/lu";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const PRIMARY = "#009DFF";
const PRIMARY_DARK = "#007fd4";
const VIOLET = "#7c3aed";
const VIOLET_DARK = "#6d28d9";
const SKY = "#0284c7";
const AMBER = "#f59e0b";
const AMBER_DARK = "#d97706";
const EMERALD = "#10b981";
const ROSE = "#f43f5e";

const PACKAGE_LEVELS = ["Beginner", "Intermediate", "Advanced", "Professional", "Elite"];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function money(value: number | null | undefined) {
    if (value === null || value === undefined) return "—";
    return `₹${value.toLocaleString("en-IN")}`;
}

function toNumberOrUndefined(value: string): number | undefined {
    if (value.trim() === "") return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}

type Feedback = { open: boolean; severity: "success" | "error"; message: string };

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                         */
/* ------------------------------------------------------------------ */

function StatCard({ label, value, color, icon }: { label: string; value: React.ReactNode; color: string; icon: React.ReactNode }) {
    return (
        <Paper
            elevation={0}
            className="rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2.5"
            sx={{ border: `1px solid ${color}`, backgroundColor: color, color: "#ffffff", transition: "box-shadow .2s", "&:hover": { boxShadow: 4 } }}
        >
            <Box className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: "#ffffff", color }}>
                {icon}
            </Box>
            <Box className="min-w-0">
                <Typography className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">{label}</Typography>
                <Typography className="text-lg sm:text-xl font-black leading-tight">{value}</Typography>
            </Box>
        </Paper>
    );
}

function SectionEmpty({ text }: { text: string }) {
    return (
        <Box className="py-10 text-center">
            <Typography className="text-sm text-gray-400">{text}</Typography>
        </Box>
    );
}

function PackageCard({
    item,
    onManage,
    onEdit,
    onDelete,
}: {
    item: Package;
    onManage: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const netPrice = item.price !== null && item.discountAmount ? item.price - item.discountAmount : item.price;

    return (
        <Paper
            elevation={0}
            className="rounded-lg overflow-hidden flex flex-col"
            sx={{ border: `1px solid ${VIOLET}`, transition: "box-shadow .2s, transform .2s", "&:hover": { boxShadow: 6, transform: "translateY(-2px)" } }}
        >
            <Box className="px-3 py-2.5 flex items-start justify-between gap-2" sx={{ background: `linear-gradient(90deg, ${VIOLET} 0%, ${SKY} 100%)`, color: "#ffffff" }}>
                <Box className="min-w-0">
                    <Typography className="text-sm font-bold truncate">{item.packageName}</Typography>
                    <Typography className="text-[11px] font-medium opacity-90">{item.packageLevel || "No level set"}</Typography>
                </Box>
                <Box className="flex items-center gap-0.5 shrink-0">
                    <Tooltip title="Manage courses & benefits">
                        <IconButton size="small" onClick={onManage} sx={{ color: "#ffffff" }}>
                            <LuSettings2 className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit package">
                        <IconButton size="small" onClick={onEdit} sx={{ color: "#ffffff" }}>
                            <LuPencil className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete package">
                        <IconButton size="small" onClick={onDelete} sx={{ color: "#ffffff" }}>
                            <LuTrash2 className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Box className="p-3 flex flex-col gap-2.5 flex-1">
                <Box className="flex items-end gap-2 flex-wrap">
                    <Typography className="text-xl font-black" sx={{ color: VIOLET }}>{money(netPrice)}</Typography>
                    {!!item.discountAmount && (
                        <>
                            <Typography className="text-xs line-through text-gray-400">{money(item.price)}</Typography>
                            <Chip size="small" label={`Save ${money(item.discountAmount)}`} sx={{ backgroundColor: EMERALD, color: "#ffffff", fontWeight: 700, height: 20 }} />
                        </>
                    )}
                </Box>

                <Box className="flex flex-wrap gap-1.5">
                    <Chip
                        size="small"
                        icon={<LuClock className="w-3 h-3" style={{ color: "#ffffff" }} />}
                        label={item.durationInMonths ? `${item.durationInMonths} mo` : "No duration"}
                        sx={{ backgroundColor: SKY, color: "#ffffff", fontWeight: 600, height: 22 }}
                    />
                    <Chip
                        size="small"
                        icon={<LuBookOpen className="w-3 h-3" style={{ color: "#ffffff" }} />}
                        label={`${item.courses.length} courses`}
                        sx={{ backgroundColor: PRIMARY, color: "#ffffff", fontWeight: 600, height: 22 }}
                    />
                    <Chip
                        size="small"
                        icon={<LuGift className="w-3 h-3" style={{ color: "#ffffff" }} />}
                        label={`${item.benefits.length} benefits`}
                        sx={{ backgroundColor: AMBER, color: "#ffffff", fontWeight: 600, height: 22 }}
                    />
                    {item.isJobGuaranteed && (
                        <Chip
                            size="small"
                            icon={<LuBadgeCheck className="w-3 h-3" style={{ color: "#ffffff" }} />}
                            label="Job guaranteed"
                            sx={{ backgroundColor: EMERALD, color: "#ffffff", fontWeight: 600, height: 22 }}
                        />
                    )}
                </Box>

                {item.description && (
                    <Typography className="text-xs text-gray-600 line-clamp-2">{item.description}</Typography>
                )}

                <Box className="mt-auto pt-1">
                    <Button
                        fullWidth
                        size="small"
                        variant="contained"
                        startIcon={<LuSettings2 className="w-3.5 h-3.5" />}
                        onClick={onManage}
                        sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: PRIMARY, "&:hover": { backgroundColor: PRIMARY_DARK } }}
                    >
                        Manage
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
}

/* ------------------------------------------------------------------ */
/* Package create / edit dialog                                        */
/* ------------------------------------------------------------------ */

interface PackageFormState {
    packageName: string;
    description: string;
    price: string;
    discountAmount: string;
    durationInMonths: string;
    packageLevel: string;
    isJobGuaranteed: boolean;
}

const EMPTY_PACKAGE_FORM: PackageFormState = {
    packageName: "",
    description: "",
    price: "",
    discountAmount: "",
    durationInMonths: "",
    packageLevel: "",
    isJobGuaranteed: false,
};

function PackageFormDialog({
    open,
    editing,
    courses,
    benefits,
    onClose,
    onSubmit,
}: {
    open: boolean;
    editing: Package | null;
    courses: Course[];
    benefits: Benefit[];
    onClose: () => void;
    onSubmit: (data: CreatePackageInput, isEdit: boolean) => Promise<boolean>;
}) {
    const [form, setForm] = useState<PackageFormState>(EMPTY_PACKAGE_FORM);
    const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
    const [selectedBenefits, setSelectedBenefits] = useState<Benefit[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        if (editing) {
            setForm({
                packageName: editing.packageName,
                description: editing.description ?? "",
                price: editing.price?.toString() ?? "",
                discountAmount: editing.discountAmount?.toString() ?? "",
                durationInMonths: editing.durationInMonths?.toString() ?? "",
                packageLevel: editing.packageLevel ?? "",
                isJobGuaranteed: editing.isJobGuaranteed,
            });
        } else {
            setForm(EMPTY_PACKAGE_FORM);
        }
        setSelectedCourses([]);
        setSelectedBenefits([]);
    }, [open, editing]);

    const handleSave = async () => {
        setSaving(true);
        const payload: CreatePackageInput = {
            packageName: form.packageName.trim(),
            description: form.description.trim() || undefined,
            price: toNumberOrUndefined(form.price),
            discountAmount: toNumberOrUndefined(form.discountAmount),
            durationInMonths: toNumberOrUndefined(form.durationInMonths),
            packageLevel: form.packageLevel || undefined,
            isJobGuaranteed: form.isJobGuaranteed,
        };
        if (!editing) {
            payload.courseIds = selectedCourses.map((c) => c.courseId);
            payload.benefitIds = selectedBenefits.map((b) => b.benefitId);
        }
        const ok = await onSubmit(payload, Boolean(editing));
        setSaving(false);
        if (ok) onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: "10px", border: `1px solid ${VIOLET}` } } }}>
            <DialogTitle sx={{ background: `linear-gradient(90deg, ${VIOLET} 0%, ${SKY} 100%)`, color: "#ffffff", py: 1.5, px: 2 }}>
                <Box className="flex items-center justify-between gap-2">
                    <Box className="flex items-center gap-2">
                        <LuLayers className="w-4 h-4" />
                        <Typography className="text-sm font-bold">{editing ? "Edit Package" : "New Package"}</Typography>
                    </Box>
                    <IconButton size="small" onClick={onClose} sx={{ color: "#ffffff" }}>
                        <LuX className="w-4 h-4" />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 2, pt: "16px !important" }}>
                <Box className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <TextField
                        label="Package name"
                        size="small"
                        required
                        value={form.packageName}
                        onChange={(e) => setForm({ ...form, packageName: e.target.value })}
                        className="sm:col-span-2"
                    />
                    <TextField
                        select
                        label="Level"
                        size="small"
                        value={form.packageLevel}
                        onChange={(e) => setForm({ ...form, packageLevel: e.target.value })}
                    >
                        <MenuItem value="">Not set</MenuItem>
                        {PACKAGE_LEVELS.map((level) => (
                            <MenuItem key={level} value={level}>{level}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Duration (months)"
                        size="small"
                        type="number"
                        value={form.durationInMonths}
                        onChange={(e) => setForm({ ...form, durationInMonths: e.target.value })}
                    />
                    <TextField
                        label="Price"
                        size="small"
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                    />
                    <TextField
                        label="Discount amount"
                        size="small"
                        type="number"
                        value={form.discountAmount}
                        onChange={(e) => setForm({ ...form, discountAmount: e.target.value })}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                    />
                    <TextField
                        label="Description"
                        size="small"
                        multiline
                        minRows={2}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="sm:col-span-2"
                    />

                    {!editing && (
                        <>
                            <Autocomplete
                                multiple
                                size="small"
                                className="sm:col-span-2"
                                options={courses}
                                value={selectedCourses}
                                onChange={(_, value) => setSelectedCourses(value)}
                                getOptionLabel={(option) => option.courseName}
                                isOptionEqualToValue={(a, b) => a.courseId === b.courseId}
                                renderInput={(params) => <TextField {...params} label="Courses" placeholder="Add courses" />}
                            />
                            <Autocomplete
                                multiple
                                size="small"
                                className="sm:col-span-2"
                                options={benefits}
                                value={selectedBenefits}
                                onChange={(_, value) => setSelectedBenefits(value)}
                                getOptionLabel={(option) => option.benefitName}
                                isOptionEqualToValue={(a, b) => a.benefitId === b.benefitId}
                                renderInput={(params) => <TextField {...params} label="Benefits" placeholder="Add benefits" />}
                            />
                        </>
                    )}

                    <FormControlLabel
                        className="sm:col-span-2"
                        control={
                            <Switch
                                checked={form.isJobGuaranteed}
                                onChange={(e) => setForm({ ...form, isJobGuaranteed: e.target.checked })}
                                sx={{ "& .Mui-checked": { color: EMERALD }, "& .Mui-checked + .MuiSwitch-track": { backgroundColor: `${EMERALD} !important` } }}
                            />
                        }
                        label={<Typography className="text-sm">Job guaranteed</Typography>}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 2, pb: 2, pt: 0 }}>
                <Button onClick={onClose} size="small" sx={{ textTransform: "none", color: "#6b7280" }}>Cancel</Button>
                <Button
                    onClick={handleSave}
                    size="small"
                    variant="contained"
                    disabled={saving || !form.packageName.trim()}
                    startIcon={saving ? <CircularProgress size={14} sx={{ color: "#ffffff" }} /> : undefined}
                    sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: VIOLET, "&:hover": { backgroundColor: VIOLET_DARK } }}
                >
                    {editing ? "Save changes" : "Create package"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ------------------------------------------------------------------ */
/* Benefit create / edit dialog                                        */
/* ------------------------------------------------------------------ */

function BenefitFormDialog({
    open,
    editing,
    onClose,
    onSubmit,
}: {
    open: boolean;
    editing: Benefit | null;
    onClose: () => void;
    onSubmit: (data: CreateBenefitInput, isEdit: boolean) => Promise<boolean>;
}) {
    const [benefitName, setBenefitName] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        setBenefitName(editing?.benefitName ?? "");
        setDescription(editing?.description ?? "");
        setAmount(editing?.amount?.toString() ?? "");
    }, [open, editing]);

    const handleSave = async () => {
        setSaving(true);
        const ok = await onSubmit(
            {
                benefitName: benefitName.trim(),
                description: description.trim() || undefined,
                amount: toNumberOrUndefined(amount),
            },
            Boolean(editing),
        );
        setSaving(false);
        if (ok) onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: "10px", border: `1px solid ${AMBER}` } } }}>
            <DialogTitle sx={{ background: `linear-gradient(90deg, ${AMBER} 0%, ${AMBER_DARK} 100%)`, color: "#ffffff", py: 1.5, px: 2 }}>
                <Box className="flex items-center justify-between gap-2">
                    <Box className="flex items-center gap-2">
                        <LuGift className="w-4 h-4" />
                        <Typography className="text-sm font-bold">{editing ? "Edit Benefit" : "New Benefit"}</Typography>
                    </Box>
                    <IconButton size="small" onClick={onClose} sx={{ color: "#ffffff" }}>
                        <LuX className="w-4 h-4" />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 2, pt: "16px !important" }}>
                <Box className="flex flex-col gap-2.5">
                    <TextField label="Benefit name" size="small" required value={benefitName} onChange={(e) => setBenefitName(e.target.value)} />
                    <TextField
                        label="Amount"
                        size="small"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                    />
                    <TextField label="Description" size="small" multiline minRows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 2, pb: 2, pt: 0 }}>
                <Button onClick={onClose} size="small" sx={{ textTransform: "none", color: "#6b7280" }}>Cancel</Button>
                <Button
                    onClick={handleSave}
                    size="small"
                    variant="contained"
                    disabled={saving || !benefitName.trim()}
                    startIcon={saving ? <CircularProgress size={14} sx={{ color: "#ffffff" }} /> : undefined}
                    sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: AMBER, "&:hover": { backgroundColor: AMBER_DARK } }}
                >
                    {editing ? "Save changes" : "Create benefit"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ------------------------------------------------------------------ */
/* Package manage dialog (courses + benefits mapping)                  */
/* ------------------------------------------------------------------ */

function ManagePackageDialog({
    packageId,
    courses,
    benefits,
    onClose,
    onChanged,
    notify,
}: {
    packageId: string | null;
    courses: Course[];
    benefits: Benefit[];
    onClose: () => void;
    onChanged: () => void;
    notify: (severity: "success" | "error", message: string) => void;
}) {
    const {
        getPackageById,
        addCoursesToPackage,
        removeCourseFromPackage,
        addBenefitsToPackage,
        removeBenefitFromPackage,
    } = useContent();

    const [detail, setDetail] = useState<PackageDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState(0);
    const [courseSelection, setCourseSelection] = useState<Course[]>([]);
    const [benefitSelection, setBenefitSelection] = useState<Benefit[]>([]);
    const [busy, setBusy] = useState(false);

    const loadDetail = useCallback(async () => {
        if (!packageId) return;
        setLoading(true);
        const res = await getPackageById(packageId);
        if (res.success && res.data) setDetail(res.data);
        else notify("error", res.message ?? "Failed to load package");
        setLoading(false);
    }, [packageId, getPackageById, notify]);

    useEffect(() => {
        if (!packageId) {
            setDetail(null);
            return;
        }
        setTab(0);
        setCourseSelection([]);
        setBenefitSelection([]);
        loadDetail();
    }, [packageId, loadDetail]);

    const availableCourses = useMemo(() => {
        const assigned = new Set(detail?.courses.map((c) => c.courseId) ?? []);
        return courses.filter((c) => !assigned.has(c.courseId));
    }, [courses, detail]);

    const availableBenefits = useMemo(() => {
        const assigned = new Set(detail?.benefits.map((b) => b.benefitId) ?? []);
        return benefits.filter((b) => !assigned.has(b.benefitId));
    }, [benefits, detail]);

    const runMutation = async (action: () => Promise<{ success: boolean; message: string | null }>, successMessage: string) => {
        setBusy(true);
        const res = await action();
        setBusy(false);
        notify(res.success ? "success" : "error", res.success ? successMessage : (res.message ?? "Action failed"));
        if (res.success) {
            await loadDetail();
            onChanged();
        }
        return res.success;
    };

    const handleAddCourses = async () => {
        if (!packageId || !courseSelection.length) return;
        const ok = await runMutation(
            () => addCoursesToPackage(packageId, courseSelection.map((c) => c.courseId)),
            "Courses added to package",
        );
        if (ok) setCourseSelection([]);
    };

    const handleAddBenefits = async () => {
        if (!packageId || !benefitSelection.length) return;
        const ok = await runMutation(
            () => addBenefitsToPackage(packageId, benefitSelection.map((b) => b.benefitId)),
            "Benefits added to package",
        );
        if (ok) setBenefitSelection([]);
    };

    const netPrice = detail && detail.price !== null && detail.discountAmount ? detail.price - detail.discountAmount : detail?.price ?? null;

    return (
        <Dialog open={Boolean(packageId)} onClose={onClose} fullWidth maxWidth="md" slotProps={{ paper: { sx: { borderRadius: "10px", border: `1px solid ${VIOLET}` } } }}>
            <DialogTitle sx={{ background: `linear-gradient(90deg, ${VIOLET} 0%, ${SKY} 100%)`, color: "#ffffff", py: 1.5, px: 2 }}>
                <Box className="flex items-center justify-between gap-2">
                    <Box className="min-w-0">
                        <Typography className="text-sm font-bold truncate">{detail?.packageName ?? "Package"}</Typography>
                        <Typography className="text-[11px] opacity-90">
                            {detail ? `${money(netPrice)} · ${detail.packageLevel || "No level"} · ${detail.durationInMonths ? `${detail.durationInMonths} months` : "No duration"}` : "Loading…"}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={onClose} sx={{ color: "#ffffff" }}>
                        <LuX className="w-4 h-4" />
                    </IconButton>
                </Box>
            </DialogTitle>

            <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="fullWidth"
                sx={{
                    minHeight: 40,
                    borderBottom: "1px solid #e5e7eb",
                    "& .MuiTab-root": { minHeight: 40, textTransform: "none", fontWeight: 700, fontSize: 13 },
                    "& .Mui-selected": { color: `${VIOLET} !important` },
                    "& .MuiTabs-indicator": { backgroundColor: VIOLET, height: 3 },
                }}
            >
                <Tab label={`Courses (${detail?.courses.length ?? 0})`} />
                <Tab label={`Benefits (${detail?.benefits.length ?? 0})`} />
            </Tabs>

            <DialogContent sx={{ p: 2, minHeight: 300 }}>
                {loading ? (
                    <Box className="py-16 flex justify-center">
                        <CircularProgress size={28} sx={{ color: VIOLET }} />
                    </Box>
                ) : !detail ? (
                    <SectionEmpty text="Package not found." />
                ) : tab === 0 ? (
                    <Box className="flex flex-col gap-3">
                        <Paper elevation={0} className="p-2.5 rounded-lg flex flex-col sm:flex-row gap-2 sm:items-center" sx={{ border: `1px solid ${PRIMARY}` }}>
                            <Autocomplete
                                multiple
                                size="small"
                                className="flex-1"
                                options={availableCourses}
                                value={courseSelection}
                                onChange={(_, value) => setCourseSelection(value)}
                                getOptionLabel={(option) => option.courseName}
                                isOptionEqualToValue={(a, b) => a.courseId === b.courseId}
                                renderInput={(params) => <TextField {...params} label="Add courses" placeholder="Select courses" />}
                            />
                            <Button
                                size="small"
                                variant="contained"
                                disabled={busy || !courseSelection.length}
                                onClick={handleAddCourses}
                                startIcon={<LuPlus className="w-3.5 h-3.5" />}
                                sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: PRIMARY, "&:hover": { backgroundColor: PRIMARY_DARK } }}
                            >
                                Add
                            </Button>
                        </Paper>

                        {detail.courses.length === 0 ? (
                            <SectionEmpty text="No courses attached to this package yet." />
                        ) : (
                            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {detail.courses.map((course) => (
                                    <Paper
                                        key={course.courseId}
                                        elevation={0}
                                        className="p-2.5 rounded-lg flex items-center justify-between gap-2"
                                        sx={{ border: `1px solid ${PRIMARY}`, transition: "box-shadow .2s", "&:hover": { boxShadow: 3 } }}
                                    >
                                        <Box className="flex items-center gap-2 min-w-0">
                                            <Box className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: PRIMARY, color: "#ffffff" }}>
                                                <LuBookOpen className="w-4 h-4" />
                                            </Box>
                                            <Box className="min-w-0">
                                                <Typography className="text-sm font-semibold text-gray-900 truncate">{course.courseName}</Typography>
                                                <Typography className="text-[11px] text-gray-500">
                                                    {money(course.price)} · {course.durationInMonths ? `${course.durationInMonths} mo` : "No duration"} · {course.noOfModules ?? 0} modules
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Tooltip title="Remove from package">
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    disabled={busy}
                                                    onClick={() => packageId && runMutation(() => removeCourseFromPackage(packageId, course.courseId), "Course removed from package")}
                                                    sx={{ color: ROSE }}
                                                >
                                                    <LuTrash2 className="w-4 h-4" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Paper>
                                ))}
                            </Box>
                        )}
                    </Box>
                ) : (
                    <Box className="flex flex-col gap-3">
                        <Paper elevation={0} className="p-2.5 rounded-lg flex flex-col sm:flex-row gap-2 sm:items-center" sx={{ border: `1px solid ${AMBER}` }}>
                            <Autocomplete
                                multiple
                                size="small"
                                className="flex-1"
                                options={availableBenefits}
                                value={benefitSelection}
                                onChange={(_, value) => setBenefitSelection(value)}
                                getOptionLabel={(option) => option.benefitName}
                                isOptionEqualToValue={(a, b) => a.benefitId === b.benefitId}
                                renderInput={(params) => <TextField {...params} label="Add benefits" placeholder="Select benefits" />}
                            />
                            <Button
                                size="small"
                                variant="contained"
                                disabled={busy || !benefitSelection.length}
                                onClick={handleAddBenefits}
                                startIcon={<LuPlus className="w-3.5 h-3.5" />}
                                sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: AMBER, "&:hover": { backgroundColor: AMBER_DARK } }}
                            >
                                Add
                            </Button>
                        </Paper>

                        {detail.benefits.length === 0 ? (
                            <SectionEmpty text="No benefits attached to this package yet." />
                        ) : (
                            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {detail.benefits.map((benefit) => (
                                    <Paper
                                        key={benefit.benefitId}
                                        elevation={0}
                                        className="p-2.5 rounded-lg flex items-center justify-between gap-2"
                                        sx={{ border: `1px solid ${AMBER}`, transition: "box-shadow .2s", "&:hover": { boxShadow: 3 } }}
                                    >
                                        <Box className="flex items-center gap-2 min-w-0">
                                            <Box className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: AMBER, color: "#ffffff" }}>
                                                <LuGift className="w-4 h-4" />
                                            </Box>
                                            <Box className="min-w-0">
                                                <Typography className="text-sm font-semibold text-gray-900 truncate">{benefit.benefitName}</Typography>
                                                <Typography className="text-[11px] text-gray-500 truncate">
                                                    {money(benefit.amount)}{benefit.description ? ` · ${benefit.description}` : ""}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Tooltip title="Remove from package">
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    disabled={busy}
                                                    onClick={() => packageId && runMutation(() => removeBenefitFromPackage(packageId, benefit.benefitId), "Benefit removed from package")}
                                                    sx={{ color: ROSE }}
                                                >
                                                    <LuTrash2 className="w-4 h-4" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Paper>
                                ))}
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 2, pb: 2, pt: 0 }}>
                <Button onClick={onClose} size="small" variant="outlined" sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, borderColor: VIOLET, color: VIOLET }}>
                    Done
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ------------------------------------------------------------------ */
/* Delete confirmation                                                 */
/* ------------------------------------------------------------------ */

function ConfirmDeleteDialog({
    open,
    title,
    description,
    onClose,
    onConfirm,
}: {
    open: boolean;
    title: string;
    description: string;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}) {
    const [busy, setBusy] = useState(false);

    const handleConfirm = async () => {
        setBusy(true);
        await onConfirm();
        setBusy(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: "10px", border: `1px solid ${ROSE}` } } }}>
            <DialogTitle sx={{ backgroundColor: ROSE, color: "#ffffff", py: 1.5, px: 2 }}>
                <Box className="flex items-center gap-2">
                    <LuTriangleAlert className="w-4 h-4" />
                    <Typography className="text-sm font-bold">{title}</Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 2, pt: "16px !important" }}>
                <Typography className="text-sm text-gray-700">{description}</Typography>
            </DialogContent>
            <DialogActions sx={{ px: 2, pb: 2, pt: 0 }}>
                <Button onClick={onClose} size="small" sx={{ textTransform: "none", color: "#6b7280" }}>Cancel</Button>
                <Button
                    onClick={handleConfirm}
                    size="small"
                    variant="contained"
                    disabled={busy}
                    startIcon={busy ? <CircularProgress size={14} sx={{ color: "#ffffff" }} /> : <LuTrash2 className="w-3.5 h-3.5" />}
                    sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: ROSE, "&:hover": { backgroundColor: "#e11d48" } }}
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ------------------------------------------------------------------ */
/* Main content                                                        */
/* ------------------------------------------------------------------ */

function PackagesContent() {
    const {
        packages,
        courses,
        benefits,
        loadingPackages,
        loadingBenefits,
        getPackages,
        getCourses,
        getBenefits,
        createPackage,
        updatePackage,
        deletePackage,
        createBenefit,
        updateBenefit,
        deleteBenefit,
    } = useContent();

    const [tab, setTab] = useState(0);
    const [search, setSearch] = useState("");
    const [feedback, setFeedback] = useState<Feedback>({ open: false, severity: "success", message: "" });

    const [packageDialogOpen, setPackageDialogOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<Package | null>(null);
    const [managingPackageId, setManagingPackageId] = useState<string | null>(null);
    const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);

    const [benefitDialogOpen, setBenefitDialogOpen] = useState(false);
    const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
    const [benefitToDelete, setBenefitToDelete] = useState<Benefit | null>(null);

    const notify = useCallback((severity: "success" | "error", message: string) => {
        setFeedback({ open: true, severity, message });
    }, []);

    useEffect(() => {
        getPackages();
        getCourses();
        getBenefits();
    }, [getPackages, getCourses, getBenefits]);

    const filteredPackages = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return packages;
        return packages.filter((p) =>
            p.packageName.toLowerCase().includes(term) ||
            (p.packageLevel ?? "").toLowerCase().includes(term) ||
            (p.description ?? "").toLowerCase().includes(term),
        );
    }, [packages, search]);

    const filteredBenefits = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return benefits;
        return benefits.filter((b) =>
            b.benefitName.toLowerCase().includes(term) ||
            (b.description ?? "").toLowerCase().includes(term),
        );
    }, [benefits, search]);

    const handlePackageSubmit = async (data: CreatePackageInput, isEdit: boolean) => {
        const res = isEdit && editingPackage
            ? await updatePackage(editingPackage.packageId, data)
            : await createPackage(data);
        notify(res.success ? "success" : "error", res.message ?? (res.success ? "Saved" : "Failed to save package"));
        if (res.success) await getPackages();
        return res.success;
    };

    const handleBenefitSubmit = async (data: CreateBenefitInput, isEdit: boolean) => {
        const res = isEdit && editingBenefit
            ? await updateBenefit(editingBenefit.benefitId, data)
            : await createBenefit(data);
        notify(res.success ? "success" : "error", res.message ?? (res.success ? "Saved" : "Failed to save benefit"));
        if (res.success) {
            await getBenefits();
            await getPackages();
        }
        return res.success;
    };

    const handleDeletePackage = async () => {
        if (!packageToDelete) return;
        const res = await deletePackage(packageToDelete.packageId);
        notify(res.success ? "success" : "error", res.message ?? "Failed to delete package");
    };

    const handleDeleteBenefit = async () => {
        if (!benefitToDelete) return;
        const res = await deleteBenefit(benefitToDelete.benefitId);
        notify(res.success ? "success" : "error", res.message ?? "Failed to delete benefit");
        if (res.success) await getPackages();
    };

    const refresh = () => {
        getPackages();
        getCourses();
        getBenefits();
    };

    const totalPackageValue = packages.reduce((sum, p) => sum + (p.price ?? 0), 0);

    return (
        <Box className="flex flex-col gap-2 sm:gap-3 h-full">

            {/* Stats */}
            <Box className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <StatCard label="Packages" value={packages.length} color={VIOLET} icon={<LuLayers className="w-4 h-4" />} />
                <StatCard label="Benefits" value={benefits.length} color={AMBER} icon={<LuGift className="w-4 h-4" />} />
                <StatCard label="Courses" value={courses.length} color={PRIMARY} icon={<LuBookOpen className="w-4 h-4" />} />
                <StatCard label="Catalog value" value={money(totalPackageValue)} color={EMERALD} icon={<LuBadgeCheck className="w-4 h-4" />} />
            </Box>

            {/* Toolbar */}
            <Paper elevation={0} className="rounded-lg" sx={{ border: "1px solid #e5e7eb" }}>
                <Box className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 sm:p-2.5">
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        sx={{
                            minHeight: 36,
                            "& .MuiTab-root": { minHeight: 36, textTransform: "none", fontWeight: 700, fontSize: 13, px: 2 },
                            "& .Mui-selected": { color: `${tab === 0 ? VIOLET : AMBER} !important` },
                            "& .MuiTabs-indicator": { backgroundColor: tab === 0 ? VIOLET : AMBER, height: 3 },
                        }}
                    >
                        <Tab icon={<LuLayers className="w-4 h-4" />} iconPosition="start" label="Packages" />
                        <Tab icon={<LuGift className="w-4 h-4" />} iconPosition="start" label="Benefits" />
                    </Tabs>

                    <Divider flexItem orientation="vertical" className="hidden sm:block" />

                    <TextField
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={tab === 0 ? "Search packages…" : "Search benefits…"}
                        className="flex-1"
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LuSearch className="w-4 h-4 text-gray-400" />
                                    </InputAdornment>
                                ),
                                endAdornment: search ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearch("")}>
                                            <LuX className="w-3.5 h-3.5" />
                                        </IconButton>
                                    </InputAdornment>
                                ) : undefined,
                                sx: { borderRadius: "8px" },
                            },
                        }}
                    />

                    <Box className="flex items-center gap-2">
                        <Tooltip title="Refresh">
                            <IconButton size="small" onClick={refresh} sx={{ border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                                <LuRefreshCw className={`w-4 h-4 ${loadingPackages || loadingBenefits ? "animate-spin" : ""}`} />
                            </IconButton>
                        </Tooltip>
                        {tab === 0 ? (
                            <Button
                                size="small"
                                variant="contained"
                                startIcon={<LuPlus className="w-3.5 h-3.5" />}
                                onClick={() => { setEditingPackage(null); setPackageDialogOpen(true); }}
                                sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, whiteSpace: "nowrap", backgroundColor: VIOLET, "&:hover": { backgroundColor: VIOLET_DARK } }}
                            >
                                New Package
                            </Button>
                        ) : (
                            <Button
                                size="small"
                                variant="contained"
                                startIcon={<LuPlus className="w-3.5 h-3.5" />}
                                onClick={() => { setEditingBenefit(null); setBenefitDialogOpen(true); }}
                                sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, whiteSpace: "nowrap", backgroundColor: AMBER, "&:hover": { backgroundColor: AMBER_DARK } }}
                            >
                                New Benefit
                            </Button>
                        )}
                    </Box>
                </Box>
            </Paper>

            {/* Content */}
            <Box className="flex-1 min-h-0 overflow-auto">
                {tab === 0 ? (
                    loadingPackages && packages.length === 0 ? (
                        <Box className="py-20 flex flex-col items-center gap-2">
                            <CircularProgress size={28} sx={{ color: VIOLET }} />
                            <Typography className="text-sm text-gray-400">Loading packages…</Typography>
                        </Box>
                    ) : filteredPackages.length === 0 ? (
                        <Paper elevation={0} className="rounded-lg py-16 text-center" sx={{ border: "1px solid #e5e7eb" }}>
                            <Typography className="text-sm text-gray-400">No packages found.</Typography>
                        </Paper>
                    ) : (
                        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                            {filteredPackages.map((item) => (
                                <PackageCard
                                    key={item.packageId}
                                    item={item}
                                    onManage={() => setManagingPackageId(item.packageId)}
                                    onEdit={() => { setEditingPackage(item); setPackageDialogOpen(true); }}
                                    onDelete={() => setPackageToDelete(item)}
                                />
                            ))}
                        </Box>
                    )
                ) : loadingBenefits && benefits.length === 0 ? (
                    <Box className="py-20 flex flex-col items-center gap-2">
                        <CircularProgress size={28} sx={{ color: AMBER }} />
                        <Typography className="text-sm text-gray-400">Loading benefits…</Typography>
                    </Box>
                ) : filteredBenefits.length === 0 ? (
                    <Paper elevation={0} className="rounded-lg py-16 text-center" sx={{ border: "1px solid #e5e7eb" }}>
                        <Typography className="text-sm text-gray-400">No benefits found.</Typography>
                    </Paper>
                ) : (
                    <Box className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                        {filteredBenefits.map((benefit) => {
                            const usedIn = packages.filter((p) => p.benefits.some((b) => b.benefitId === benefit.benefitId)).length;
                            return (
                                <Paper
                                    key={benefit.benefitId}
                                    elevation={0}
                                    className="rounded-lg p-3 flex flex-col gap-2"
                                    sx={{ border: `1px solid ${AMBER}`, transition: "box-shadow .2s, transform .2s", "&:hover": { boxShadow: 6, transform: "translateY(-2px)" } }}
                                >
                                    <Box className="flex items-start justify-between gap-2">
                                        <Box className="flex items-center gap-2 min-w-0">
                                            <Box className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: AMBER, color: "#ffffff" }}>
                                                <LuGift className="w-4 h-4" />
                                            </Box>
                                            <Box className="min-w-0">
                                                <Typography className="text-sm font-bold text-gray-900 truncate">{benefit.benefitName}</Typography>
                                                <Typography className="text-[11px] font-semibold" sx={{ color: AMBER_DARK }}>{money(benefit.amount)}</Typography>
                                            </Box>
                                        </Box>
                                        <Box className="flex items-center gap-0.5 shrink-0">
                                            <Tooltip title="Edit benefit">
                                                <IconButton size="small" onClick={() => { setEditingBenefit(benefit); setBenefitDialogOpen(true); }} sx={{ color: SKY }}>
                                                    <LuPencil className="w-4 h-4" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete benefit">
                                                <IconButton size="small" onClick={() => setBenefitToDelete(benefit)} sx={{ color: ROSE }}>
                                                    <LuTrash2 className="w-4 h-4" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>

                                    {benefit.description && (
                                        <Typography className="text-xs text-gray-600 line-clamp-2">{benefit.description}</Typography>
                                    )}

                                    <Chip
                                        size="small"
                                        label={usedIn ? `Used in ${usedIn} package${usedIn > 1 ? "s" : ""}` : "Not used yet"}
                                        sx={{ alignSelf: "flex-start", height: 22, fontWeight: 600, backgroundColor: usedIn ? EMERALD : "#e5e7eb", color: usedIn ? "#ffffff" : "#374151" }}
                                    />
                                </Paper>
                            );
                        })}
                    </Box>
                )}
            </Box>

            {/* Dialogs */}
            <PackageFormDialog
                open={packageDialogOpen}
                editing={editingPackage}
                courses={courses}
                benefits={benefits}
                onClose={() => { setPackageDialogOpen(false); setEditingPackage(null); }}
                onSubmit={handlePackageSubmit}
            />

            <BenefitFormDialog
                open={benefitDialogOpen}
                editing={editingBenefit}
                onClose={() => { setBenefitDialogOpen(false); setEditingBenefit(null); }}
                onSubmit={handleBenefitSubmit}
            />

            <ManagePackageDialog
                packageId={managingPackageId}
                courses={courses}
                benefits={benefits}
                onClose={() => setManagingPackageId(null)}
                onChanged={getPackages}
                notify={notify}
            />

            <ConfirmDeleteDialog
                open={Boolean(packageToDelete)}
                title="Delete package"
                description={`"${packageToDelete?.packageName ?? ""}" and its course/benefit mappings will be permanently removed.`}
                onClose={() => setPackageToDelete(null)}
                onConfirm={handleDeletePackage}
            />

            <ConfirmDeleteDialog
                open={Boolean(benefitToDelete)}
                title="Delete benefit"
                description={`"${benefitToDelete?.benefitName ?? ""}" will be removed from every package that uses it.`}
                onClose={() => setBenefitToDelete(null)}
                onConfirm={handleDeleteBenefit}
            />

            <Snackbar
                open={feedback.open}
                autoHideDuration={3500}
                onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert severity={feedback.severity} variant="filled" onClose={() => setFeedback((prev) => ({ ...prev, open: false }))} sx={{ borderRadius: "8px" }}>
                    {feedback.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function PackagesPage() {
    return (
        <RMDashboardLayout title="Packages & Benefits">
            <PackagesContent />
        </RMDashboardLayout>
    );
}
