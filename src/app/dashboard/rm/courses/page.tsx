"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import RMDashboardLayout from "@/layouts/RMDashboardLayout";
import {
    useContent,
    type Course,
    type CourseDetail,
    type CreateCourseInput,
} from "@/contexts/ContentContext";
import {
    Alert,
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
    LuAward,
    LuBookOpen,
    LuClock,
    LuLayers,
    LuLayoutList,
    LuPencil,
    LuPlus,
    LuRefreshCw,
    LuSearch,
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
const SKY = "#0284c7";
const SKY_DARK = "#0369a1";
const CYAN = "#06b6d4";
const EMERALD = "#10b981";
const AMBER = "#f59e0b";
const ROSE = "#f43f5e";

const SORT_OPTIONS = [
    { value: "recent", label: "Newest first" },
    { value: "name", label: "Name (A–Z)" },
    { value: "priceHigh", label: "Price (high → low)" },
    { value: "priceLow", label: "Price (low → high)" },
    { value: "duration", label: "Duration (long → short)" },
];

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
/* Small pieces                                                        */
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

function CourseCard({
    item,
    usedIn,
    onView,
    onEdit,
    onDelete,
}: {
    item: Course;
    usedIn: number;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <Paper
            elevation={0}
            className="rounded-lg overflow-hidden flex flex-col"
            sx={{ border: `1px solid ${PRIMARY}`, transition: "box-shadow .2s, transform .2s", "&:hover": { boxShadow: 6, transform: "translateY(-2px)" } }}
        >
            <Box className="px-3 py-2.5 flex items-start justify-between gap-2" sx={{ background: `linear-gradient(90deg, ${PRIMARY} 0%, ${CYAN} 100%)`, color: "#ffffff" }}>
                <Box className="flex items-center gap-2 min-w-0">
                    <Box className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: "#ffffff", color: PRIMARY }}>
                        <LuBookOpen className="w-4 h-4" />
                    </Box>
                    <Box className="min-w-0">
                        <Typography className="text-sm font-bold truncate">{item.courseName}</Typography>
                        <Typography className="text-[11px] opacity-90">{item.noOfModules ?? 0} modules</Typography>
                    </Box>
                </Box>
                <Box className="flex items-center gap-0.5 shrink-0">
                    <Tooltip title="Edit course">
                        <IconButton size="small" onClick={onEdit} sx={{ color: "#ffffff" }}>
                            <LuPencil className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete course">
                        <IconButton size="small" onClick={onDelete} sx={{ color: "#ffffff" }}>
                            <LuTrash2 className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Box className="p-3 flex flex-col gap-2.5 flex-1">
                <Typography className="text-xl font-black" sx={{ color: SKY_DARK }}>{money(item.price)}</Typography>

                <Box className="flex flex-wrap gap-1.5">
                    <Chip
                        size="small"
                        icon={<LuClock className="w-3 h-3" style={{ color: "#ffffff" }} />}
                        label={item.durationInMonths ? `${item.durationInMonths} mo` : "No duration"}
                        sx={{ backgroundColor: SKY, color: "#ffffff", fontWeight: 600, height: 22 }}
                    />
                    <Chip
                        size="small"
                        icon={<LuLayoutList className="w-3 h-3" style={{ color: "#ffffff" }} />}
                        label={`${item.noOfModules ?? 0} modules`}
                        sx={{ backgroundColor: CYAN, color: "#ffffff", fontWeight: 600, height: 22 }}
                    />
                    {item.isCertified && (
                        <Chip
                            size="small"
                            icon={<LuAward className="w-3 h-3" style={{ color: "#ffffff" }} />}
                            label="Certified"
                            sx={{ backgroundColor: EMERALD, color: "#ffffff", fontWeight: 600, height: 22 }}
                        />
                    )}
                    <Chip
                        size="small"
                        icon={<LuLayers className="w-3 h-3" style={{ color: "#ffffff" }} />}
                        label={usedIn ? `${usedIn} package${usedIn > 1 ? "s" : ""}` : "Unpackaged"}
                        sx={{ backgroundColor: usedIn ? VIOLET : AMBER, color: "#ffffff", fontWeight: 600, height: 22 }}
                    />
                </Box>

                {item.description && (
                    <Typography className="text-xs text-gray-600 line-clamp-2">{item.description}</Typography>
                )}

                <Box className="mt-auto pt-1">
                    <Button
                        fullWidth
                        size="small"
                        variant="contained"
                        startIcon={<LuLayers className="w-3.5 h-3.5" />}
                        onClick={onView}
                        sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: PRIMARY, "&:hover": { backgroundColor: PRIMARY_DARK } }}
                    >
                        View details
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
}

/* ------------------------------------------------------------------ */
/* Course create / edit dialog                                         */
/* ------------------------------------------------------------------ */

interface CourseFormState {
    courseName: string;
    description: string;
    price: string;
    durationInMonths: string;
    noOfModules: string;
    isCertified: boolean;
}

const EMPTY_FORM: CourseFormState = {
    courseName: "",
    description: "",
    price: "",
    durationInMonths: "",
    noOfModules: "",
    isCertified: false,
};

function CourseFormDialog({
    open,
    editing,
    onClose,
    onSubmit,
}: {
    open: boolean;
    editing: Course | null;
    onClose: () => void;
    onSubmit: (data: CreateCourseInput, isEdit: boolean) => Promise<boolean>;
}) {
    const [form, setForm] = useState<CourseFormState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        setForm(editing
            ? {
                courseName: editing.courseName,
                description: editing.description ?? "",
                price: editing.price?.toString() ?? "",
                durationInMonths: editing.durationInMonths?.toString() ?? "",
                noOfModules: editing.noOfModules?.toString() ?? "",
                isCertified: editing.isCertified,
            }
            : EMPTY_FORM);
    }, [open, editing]);

    const handleSave = async () => {
        setSaving(true);
        const ok = await onSubmit(
            {
                courseName: form.courseName.trim(),
                description: form.description.trim() || undefined,
                price: toNumberOrUndefined(form.price),
                durationInMonths: toNumberOrUndefined(form.durationInMonths),
                noOfModules: toNumberOrUndefined(form.noOfModules),
                isCertified: form.isCertified,
            },
            Boolean(editing),
        );
        setSaving(false);
        if (ok) onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: "10px", border: `1px solid ${PRIMARY}` } } }}>
            <DialogTitle sx={{ background: `linear-gradient(90deg, ${PRIMARY} 0%, ${CYAN} 100%)`, color: "#ffffff", py: 1.5, px: 2 }}>
                <Box className="flex items-center justify-between gap-2">
                    <Box className="flex items-center gap-2">
                        <LuBookOpen className="w-4 h-4" />
                        <Typography className="text-sm font-bold">{editing ? "Edit Course" : "New Course"}</Typography>
                    </Box>
                    <IconButton size="small" onClick={onClose} sx={{ color: "#ffffff" }}>
                        <LuX className="w-4 h-4" />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 2, pt: "16px !important" }}>
                <Box className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <TextField
                        label="Course name"
                        size="small"
                        required
                        value={form.courseName}
                        onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                        className="sm:col-span-2"
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
                        label="Duration (months)"
                        size="small"
                        type="number"
                        value={form.durationInMonths}
                        onChange={(e) => setForm({ ...form, durationInMonths: e.target.value })}
                    />
                    <TextField
                        label="Number of modules"
                        size="small"
                        type="number"
                        value={form.noOfModules}
                        onChange={(e) => setForm({ ...form, noOfModules: e.target.value })}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={form.isCertified}
                                onChange={(e) => setForm({ ...form, isCertified: e.target.checked })}
                                sx={{ "& .Mui-checked": { color: EMERALD }, "& .Mui-checked + .MuiSwitch-track": { backgroundColor: `${EMERALD} !important` } }}
                            />
                        }
                        label={<Typography className="text-sm">Certified course</Typography>}
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
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 2, pb: 2, pt: 0 }}>
                <Button onClick={onClose} size="small" sx={{ textTransform: "none", color: "#6b7280" }}>Cancel</Button>
                <Button
                    onClick={handleSave}
                    size="small"
                    variant="contained"
                    disabled={saving || !form.courseName.trim()}
                    startIcon={saving ? <CircularProgress size={14} sx={{ color: "#ffffff" }} /> : undefined}
                    sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: PRIMARY, "&:hover": { backgroundColor: PRIMARY_DARK } }}
                >
                    {editing ? "Save changes" : "Create course"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ------------------------------------------------------------------ */
/* Course detail dialog                                                */
/* ------------------------------------------------------------------ */

function CourseDetailDialog({
    courseId,
    onClose,
    onEdit,
    notify,
}: {
    courseId: string | null;
    onClose: () => void;
    onEdit: (course: Course) => void;
    notify: (severity: "success" | "error", message: string) => void;
}) {
    const { getCourseById } = useContent();
    const [detail, setDetail] = useState<CourseDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState(0);

    useEffect(() => {
        if (!courseId) {
            setDetail(null);
            return;
        }
        setTab(0);
        let cancelled = false;
        (async () => {
            setLoading(true);
            const res = await getCourseById(courseId);
            if (cancelled) return;
            if (res.success && res.data) setDetail(res.data);
            else notify("error", res.message ?? "Failed to load course");
            setLoading(false);
        })();
        return () => { cancelled = true; };
    }, [courseId, getCourseById, notify]);

    return (
        <Dialog open={Boolean(courseId)} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: "10px", border: `1px solid ${PRIMARY}` } } }}>
            <DialogTitle sx={{ background: `linear-gradient(90deg, ${PRIMARY} 0%, ${CYAN} 100%)`, color: "#ffffff", py: 1.5, px: 2 }}>
                <Box className="flex items-center justify-between gap-2">
                    <Box className="min-w-0">
                        <Typography className="text-sm font-bold truncate">{detail?.courseName ?? "Course"}</Typography>
                        <Typography className="text-[11px] opacity-90">
                            {detail ? `${money(detail.price)} · ${detail.durationInMonths ? `${detail.durationInMonths} months` : "No duration"} · ${detail.noOfModules ?? 0} modules` : "Loading…"}
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
                    "& .Mui-selected": { color: `${PRIMARY} !important` },
                    "& .MuiTabs-indicator": { backgroundColor: PRIMARY, height: 3 },
                }}
            >
                <Tab label="Overview" />
                <Tab label={`Packages (${detail?.packages.length ?? 0})`} />
            </Tabs>

            <DialogContent sx={{ p: 2, minHeight: 240 }}>
                {loading ? (
                    <Box className="py-16 flex justify-center">
                        <CircularProgress size={28} sx={{ color: PRIMARY }} />
                    </Box>
                ) : !detail ? (
                    <Box className="py-16 text-center">
                        <Typography className="text-sm text-gray-400">Course not found.</Typography>
                    </Box>
                ) : tab === 0 ? (
                    <Box className="flex flex-col gap-2.5">
                        <Box className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { label: "Price", value: money(detail.price), color: SKY },
                                { label: "Duration", value: detail.durationInMonths ? `${detail.durationInMonths} mo` : "—", color: CYAN },
                                { label: "Modules", value: detail.noOfModules ?? 0, color: PRIMARY },
                                { label: "Certified", value: detail.isCertified ? "Yes" : "No", color: detail.isCertified ? EMERALD : AMBER },
                            ].map((stat) => (
                                <Paper key={stat.label} elevation={0} className="rounded-lg px-2.5 py-2" sx={{ border: `1px solid ${stat.color}` }}>
                                    <Typography className="text-[10px] font-bold uppercase tracking-wider" sx={{ color: stat.color }}>{stat.label}</Typography>
                                    <Typography className="text-sm font-black text-gray-900">{stat.value}</Typography>
                                </Paper>
                            ))}
                        </Box>

                        <Paper elevation={0} className="rounded-lg p-2.5" sx={{ border: "1px solid #e5e7eb" }}>
                            <Typography className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Description</Typography>
                            <Typography className="text-sm text-gray-700">{detail.description || "No description provided."}</Typography>
                        </Paper>

                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<LuPencil className="w-3.5 h-3.5" />}
                            onClick={() => { onEdit(detail); onClose(); }}
                            sx={{ alignSelf: "flex-start", borderRadius: "8px", textTransform: "none", fontWeight: 700, backgroundColor: PRIMARY, "&:hover": { backgroundColor: PRIMARY_DARK } }}
                        >
                            Edit course
                        </Button>
                    </Box>
                ) : detail.packages.length === 0 ? (
                    <Box className="py-16 text-center">
                        <Typography className="text-sm text-gray-400">This course is not part of any package yet.</Typography>
                    </Box>
                ) : (
                    <Box className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {detail.packages.map((pkg) => (
                            <Paper
                                key={pkg.packageId}
                                elevation={0}
                                className="p-2.5 rounded-lg flex items-center gap-2"
                                sx={{ border: `1px solid ${VIOLET}`, transition: "box-shadow .2s", "&:hover": { boxShadow: 3 } }}
                            >
                                <Box className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" sx={{ backgroundColor: VIOLET, color: "#ffffff" }}>
                                    <LuLayers className="w-4 h-4" />
                                </Box>
                                <Typography className="text-sm font-semibold text-gray-900 truncate">{pkg.packageName}</Typography>
                            </Paper>
                        ))}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 2, pb: 2, pt: 0 }}>
                <Button onClick={onClose} size="small" variant="outlined" sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, borderColor: PRIMARY, color: PRIMARY }}>
                    Close
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

function CoursesContent() {
    const {
        courses,
        packages,
        loadingCourses,
        getCourses,
        getPackages,
        createCourse,
        updateCourse,
        deleteCourse,
    } = useContent();

    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("recent");
    const [certifiedOnly, setCertifiedOnly] = useState(false);
    const [feedback, setFeedback] = useState<Feedback>({ open: false, severity: "success", message: "" });

    const [formOpen, setFormOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [detailCourseId, setDetailCourseId] = useState<string | null>(null);
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

    const notify = useCallback((severity: "success" | "error", message: string) => {
        setFeedback({ open: true, severity, message });
    }, []);

    useEffect(() => {
        getCourses();
        getPackages();
    }, [getCourses, getPackages]);

    const packageCountByCourse = useMemo(() => {
        const map = new Map<string, number>();
        packages.forEach((pkg) => {
            pkg.courses.forEach((course) => {
                map.set(course.courseId, (map.get(course.courseId) ?? 0) + 1);
            });
        });
        return map;
    }, [packages]);

    const visibleCourses = useMemo(() => {
        const term = search.trim().toLowerCase();
        const filtered = courses.filter((course) => {
            if (certifiedOnly && !course.isCertified) return false;
            if (!term) return true;
            return course.courseName.toLowerCase().includes(term) || (course.description ?? "").toLowerCase().includes(term);
        });

        const sorted = [...filtered];
        switch (sortBy) {
            case "name":
                sorted.sort((a, b) => a.courseName.localeCompare(b.courseName));
                break;
            case "priceHigh":
                sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
                break;
            case "priceLow":
                sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
                break;
            case "duration":
                sorted.sort((a, b) => (b.durationInMonths ?? 0) - (a.durationInMonths ?? 0));
                break;
            default:
                break;
        }
        return sorted;
    }, [courses, search, certifiedOnly, sortBy]);

    const handleSubmit = async (data: CreateCourseInput, isEdit: boolean) => {
        const res = isEdit && editingCourse
            ? await updateCourse(editingCourse.courseId, data)
            : await createCourse(data);
        notify(res.success ? "success" : "error", res.message ?? (res.success ? "Saved" : "Failed to save course"));
        if (res.success) {
            await getCourses();
            await getPackages();
        }
        return res.success;
    };

    const handleDelete = async () => {
        if (!courseToDelete) return;
        const res = await deleteCourse(courseToDelete.courseId);
        notify(res.success ? "success" : "error", res.message ?? "Failed to delete course");
        if (res.success) await getPackages();
    };

    const refresh = () => {
        getCourses();
        getPackages();
    };

    const certifiedCount = courses.filter((c) => c.isCertified).length;
    const totalModules = courses.reduce((sum, c) => sum + (c.noOfModules ?? 0), 0);
    const unpackagedCount = courses.filter((c) => !packageCountByCourse.get(c.courseId)).length;

    return (
        <Box className="flex flex-col gap-2 sm:gap-3 h-full">

            {/* Stats */}
            <Box className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <StatCard label="Courses" value={courses.length} color={PRIMARY} icon={<LuBookOpen className="w-4 h-4" />} />
                <StatCard label="Certified" value={certifiedCount} color={EMERALD} icon={<LuAward className="w-4 h-4" />} />
                <StatCard label="Total modules" value={totalModules} color={CYAN} icon={<LuLayoutList className="w-4 h-4" />} />
                <StatCard label="Not in a package" value={unpackagedCount} color={AMBER} icon={<LuLayers className="w-4 h-4" />} />
            </Box>

            {/* Toolbar */}
            <Paper elevation={0} className="rounded-lg" sx={{ border: "1px solid #e5e7eb" }}>
                <Box className="flex flex-col lg:flex-row lg:items-center gap-2 p-2 sm:p-2.5">
                    <TextField
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search courses…"
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

                    <TextField
                        select
                        size="small"
                        label="Sort by"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full lg:w-52"
                        slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                    >
                        {SORT_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                        ))}
                    </TextField>

                    <FormControlLabel
                        control={
                            <Switch
                                size="small"
                                checked={certifiedOnly}
                                onChange={(e) => setCertifiedOnly(e.target.checked)}
                                sx={{ "& .Mui-checked": { color: EMERALD }, "& .Mui-checked + .MuiSwitch-track": { backgroundColor: `${EMERALD} !important` } }}
                            />
                        }
                        label={<Typography className="text-xs font-semibold whitespace-nowrap">Certified only</Typography>}
                        sx={{ mr: 0 }}
                    />

                    <Divider flexItem orientation="vertical" className="hidden lg:block" />

                    <Box className="flex items-center gap-2">
                        <Tooltip title="Refresh">
                            <IconButton size="small" onClick={refresh} sx={{ border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                                <LuRefreshCw className={`w-4 h-4 ${loadingCourses ? "animate-spin" : ""}`} />
                            </IconButton>
                        </Tooltip>
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<LuPlus className="w-3.5 h-3.5" />}
                            onClick={() => { setEditingCourse(null); setFormOpen(true); }}
                            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, whiteSpace: "nowrap", backgroundColor: PRIMARY, "&:hover": { backgroundColor: PRIMARY_DARK } }}
                        >
                            New Course
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Grid */}
            <Box className="flex-1 min-h-0 overflow-auto">
                {loadingCourses && courses.length === 0 ? (
                    <Box className="py-20 flex flex-col items-center gap-2">
                        <CircularProgress size={28} sx={{ color: PRIMARY }} />
                        <Typography className="text-sm text-gray-400">Loading courses…</Typography>
                    </Box>
                ) : visibleCourses.length === 0 ? (
                    <Paper elevation={0} className="rounded-lg py-16 text-center" sx={{ border: "1px solid #e5e7eb" }}>
                        <Typography className="text-sm text-gray-400">No courses found.</Typography>
                    </Paper>
                ) : (
                    <Box className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                        {visibleCourses.map((course) => (
                            <CourseCard
                                key={course.courseId}
                                item={course}
                                usedIn={packageCountByCourse.get(course.courseId) ?? 0}
                                onView={() => setDetailCourseId(course.courseId)}
                                onEdit={() => { setEditingCourse(course); setFormOpen(true); }}
                                onDelete={() => setCourseToDelete(course)}
                            />
                        ))}
                    </Box>
                )}
            </Box>

            {/* Dialogs */}
            <CourseFormDialog
                open={formOpen}
                editing={editingCourse}
                onClose={() => { setFormOpen(false); setEditingCourse(null); }}
                onSubmit={handleSubmit}
            />

            <CourseDetailDialog
                courseId={detailCourseId}
                onClose={() => setDetailCourseId(null)}
                onEdit={(course) => { setEditingCourse(course); setFormOpen(true); }}
                notify={notify}
            />

            <ConfirmDeleteDialog
                open={Boolean(courseToDelete)}
                title="Delete course"
                description={`"${courseToDelete?.courseName ?? ""}" will be removed from every package and batch mapping that uses it.`}
                onClose={() => setCourseToDelete(null)}
                onConfirm={handleDelete}
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

export default function CoursesPage() {
    return (
        <RMDashboardLayout title="Courses">
            <CoursesContent />
        </RMDashboardLayout>
    );
}
