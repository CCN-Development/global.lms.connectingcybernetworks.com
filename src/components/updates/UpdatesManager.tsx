"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    Box,
    Button,
    Chip,
    IconButton,
    InputAdornment,
    MenuItem,
    Pagination,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    Eye,
    FileText,
    Flame,
    Megaphone,
    Newspaper,
    Pencil,
    Pin,
    Plus,
    Search,
    Send,
    Star,
    Trash2,
    Undo2,
    X,
} from "lucide-react";
import {
    ANNOUNCEMENT_TYPES,
    UPDATE_TYPE_LABELS,
    UPDATE_TYPE_SLUGS,
    useUpdates,
    type AnnouncementType,
    type GetManagedUpdatesParams,
    type UpdateItem,
    type UpdateStatusFilter,
    type UpdateType,
} from "@/contexts/UpdatesContext";
import UpdateFormModal, { TYPE_ACCENT, type UpdateFormPayload } from "./UpdateFormModal";

const EMERALD = "#10b981";
const AMBER = "#f59e0b";
const ROSE = "#f43f5e";
const SLATE = "#64748b";
const ROW_HOVER = "#f5f3ff";

const LIMIT = 12;

const TYPE_ICON: Record<UpdateType, React.ComponentType<{ size?: number }>> = {
    news: Newspaper,
    blog: FileText,
    announcement: Megaphone,
};

const HEAD_CELL_SX = {
    py: 1.25,
    px: 1.5,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: ".06em",
    textTransform: "uppercase" as const,
    color: "#ffffff",
    borderBottom: "none",
    whiteSpace: "nowrap" as const,
};

const STATUS_OPTIONS: { label: string; value: UpdateStatusFilter }[] = [
    { label: "All", value: "all" },
    { label: "Published", value: "published" },
    { label: "Drafts", value: "draft" },
];

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

function fmtDate(value?: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function StatCard({ label, value, color, icon }: { label: string; value: React.ReactNode; color: string; icon: React.ReactNode }) {
    return (
        <Paper
            elevation={0}
            className="rounded-lg px-3 py-2.5 flex items-center gap-2.5"
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

export default function UpdatesManager({ type }: { type: UpdateType }) {
    const router = useRouter();
    const {
        managedBlogs,
        managedNews,
        managedAnnouncements,
        managedMeta,
        loadingManaged,
        getManagedBlogs,
        getManagedNews,
        getManagedAnnouncements,
        createBlog,
        updateBlog,
        deleteBlog,
        createNews,
        updateNews,
        deleteNews,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        setPublishState,
        getUpdateDetail,
    } = useUpdates();

    const accent = TYPE_ACCENT[type];
    const TypeIcon = TYPE_ICON[type];
    const label = UPDATE_TYPE_LABELS[type];

    const rows = type === "blog" ? managedBlogs : type === "news" ? managedNews : managedAnnouncements;
    const meta = managedMeta[type];

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<UpdateStatusFilter>("all");
    const [announcementType, setAnnouncementType] = useState<AnnouncementType | "">("");
    const [page, setPage] = useState(1);

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<(UpdateItem & { content?: string }) | undefined>(undefined);

    const debouncedSearch = useDebounce(search, 400);

    const fetchList = useCallback(
        (params: GetManagedUpdatesParams) => {
            if (type === "blog") return getManagedBlogs(params);
            if (type === "news") return getManagedNews(params);
            return getManagedAnnouncements(params);
        },
        [type, getManagedBlogs, getManagedNews, getManagedAnnouncements],
    );

    const refresh = useCallback(() => {
        const params: GetManagedUpdatesParams = { page, limit: LIMIT };
        if (debouncedSearch) params.search = debouncedSearch;
        if (status !== "all") params.status = status;
        if (type === "announcement" && announcementType) params.announcementType = announcementType;
        void fetchList(params);
    }, [fetchList, page, debouncedSearch, status, announcementType, type]);

    useEffect(() => { refresh(); }, [refresh]);
    useEffect(() => { setPage(1); }, [debouncedSearch, status, announcementType]);

    const stats = useMemo(() => {
        const published = rows.filter((row) => row.isPublished).length;
        return { total: meta?.total ?? rows.length, published, drafts: rows.length - published };
    }, [rows, meta]);

    const openCreate = () => {
        setEditing(undefined);
        setFormOpen(true);
    };

    /** The list endpoint omits `content`, so pull the full record before editing. */
    const openEdit = async (row: UpdateItem) => {
        const res = await getUpdateDetail(type, row.updateId);
        setEditing(res.success && res.data ? res.data : row);
        setFormOpen(true);
    };

    const handleSubmit = async (data: UpdateFormPayload) => {
        const result = editing
            ? type === "blog"
                ? await updateBlog(editing.updateId, data)
                : type === "news"
                    ? await updateNews(editing.updateId, data)
                    : await updateAnnouncement(editing.updateId, data)
            : type === "blog"
                ? await createBlog(data)
                : type === "news"
                    ? await createNews(data)
                    : await createAnnouncement(data);

        if (result.success) refresh();
        return { success: result.success, message: result.message };
    };

    const handleDelete = async (row: UpdateItem) => {
        if (!window.confirm(`Delete "${row.title}"? This cannot be undone.`)) return;
        const result =
            type === "blog"
                ? await deleteBlog(row.updateId)
                : type === "news"
                    ? await deleteNews(row.updateId)
                    : await deleteAnnouncement(row.updateId);

        if (result.success) {
            toast.success(result.message ?? "Deleted");
            refresh();
        } else {
            toast.error(result.message ?? "Failed to delete");
        }
    };

    const togglePublish = async (row: UpdateItem) => {
        const result = await setPublishState(type, row.updateId, !row.isPublished);
        if (result.success) {
            toast.success(result.message ?? "Updated");
            refresh();
        } else {
            toast.error(result.message ?? "Failed to update");
        }
    };

    const hasFilters = Boolean(search || status !== "all" || announcementType);

    return (
        <Box className="flex flex-col gap-2 sm:gap-3 h-full">
            {/* Stats */}
            <Box className="grid grid-cols-3 gap-2 sm:gap-3">
                <StatCard label={`Total ${label}s`} value={stats.total} color={accent} icon={<TypeIcon size={16} />} />
                <StatCard label="Published (page)" value={stats.published} color={EMERALD} icon={<Send size={16} />} />
                <StatCard label="Drafts (page)" value={stats.drafts} color={AMBER} icon={<FileText size={16} />} />
            </Box>

            {/* Toolbar */}
            <Paper elevation={0} className="rounded-lg" sx={{ border: `1px solid ${accent}` }}>
                <Box className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 sm:p-2.5">
                    <TextField
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={`Search ${label.toLowerCase()}s by title or category`}
                        className="flex-1"
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={15} color="#9ca3af" />
                                    </InputAdornment>
                                ),
                                endAdornment: search ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearch("")}>
                                            <X size={14} />
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
                        label="Status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as UpdateStatusFilter)}
                        sx={{ minWidth: 130 }}
                        slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                        ))}
                    </TextField>

                    {type === "announcement" ? (
                        <TextField
                            select
                            size="small"
                            label="Type"
                            value={announcementType}
                            onChange={(e) => setAnnouncementType(e.target.value as AnnouncementType | "")}
                            sx={{ minWidth: 140 }}
                            slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                        >
                            <MenuItem value="">All types</MenuItem>
                            {ANNOUNCEMENT_TYPES.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </TextField>
                    ) : null}

                    {hasFilters ? (
                        <Button
                            size="small"
                            onClick={() => { setSearch(""); setStatus("all"); setAnnouncementType(""); }}
                            startIcon={<Undo2 size={14} />}
                            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, color: SLATE }}
                        >
                            Reset
                        </Button>
                    ) : null}

                    <Button
                        size="small"
                        variant="contained"
                        onClick={openCreate}
                        startIcon={<Plus size={14} />}
                        sx={{
                            borderRadius: "8px",
                            textTransform: "none",
                            fontWeight: 800,
                            whiteSpace: "nowrap",
                            backgroundColor: accent,
                            "&:hover": { backgroundColor: accent, filter: "brightness(0.92)" },
                        }}
                    >
                        New {label}
                    </Button>
                </Box>
            </Paper>

            {/* Table */}
            <Paper elevation={0} className="rounded-lg overflow-hidden flex-1" sx={{ border: `1px solid ${accent}` }}>
                <TableContainer>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow sx={{ "& th": { backgroundColor: accent } }}>
                                <TableCell sx={HEAD_CELL_SX}>{label}</TableCell>
                                <TableCell sx={{ ...HEAD_CELL_SX, display: { xs: "none", md: "table-cell" } }}>Category</TableCell>
                                {type === "announcement" ? (
                                    <TableCell sx={{ ...HEAD_CELL_SX, display: { xs: "none", lg: "table-cell" } }}>Type</TableCell>
                                ) : null}
                                <TableCell sx={{ ...HEAD_CELL_SX, display: { xs: "none", lg: "table-cell" } }}>Published</TableCell>
                                <TableCell sx={{ ...HEAD_CELL_SX, display: { xs: "none", sm: "table-cell" } }}>Views</TableCell>
                                <TableCell sx={HEAD_CELL_SX}>Status</TableCell>
                                <TableCell sx={{ ...HEAD_CELL_SX, textAlign: "right" }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loadingManaged
                                ? Array.from({ length: 6 }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell colSpan={7} sx={{ px: 1.5, py: 1 }}>
                                            <Skeleton height={28} />
                                        </TableCell>
                                    </TableRow>
                                ))
                                : rows.length === 0
                                    ? (
                                        <TableRow>
                                            <TableCell colSpan={7}>
                                                <Box className="flex flex-col items-center gap-1.5 py-8 text-gray-500">
                                                    <TypeIcon size={26} />
                                                    <Typography className="text-sm font-semibold">No {label.toLowerCase()}s yet</Typography>
                                                    <Button
                                                        size="small"
                                                        onClick={openCreate}
                                                        startIcon={<Plus size={14} />}
                                                        sx={{ textTransform: "none", fontWeight: 700, color: accent }}
                                                    >
                                                        Create the first one
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )
                                    : rows.map((row) => (
                                        <TableRow key={row.updateId} hover sx={{ "&:hover": { backgroundColor: ROW_HOVER } }}>
                                            <TableCell sx={{ px: 1.5, py: 1 }}>
                                                <Box className="flex items-center gap-2 min-w-0">
                                                    <Box
                                                        className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                                                        sx={{ border: `1px solid ${accent}`, backgroundColor: "#f8fafc", color: accent }}
                                                    >
                                                        {row.coverImageUrl ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={row.coverImageUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <TypeIcon size={16} />
                                                        )}
                                                    </Box>
                                                    <Box className="min-w-0">
                                                        <Typography className="text-[13px] font-bold leading-snug line-clamp-2">
                                                            {row.title}
                                                        </Typography>
                                                        <Box className="flex items-center gap-1 mt-0.5 flex-wrap">
                                                            <Typography className="text-[11px] text-gray-500">
                                                                {row.readTimeMinutes} min read
                                                            </Typography>
                                                            {row.isPinned ? <Pin size={11} color={ROSE} /> : null}
                                                            {row.isFeatured ? <Star size={11} color={AMBER} /> : null}
                                                            {row.isTrending ? <Flame size={11} color={ROSE} /> : null}
                                                            {row.branchId === null ? (
                                                                <Chip
                                                                    size="small"
                                                                    label="All branches"
                                                                    sx={{ height: 16, fontSize: 9, fontWeight: 800, bgcolor: "#e0f2fe", color: "#0369a1" }}
                                                                />
                                                            ) : null}
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </TableCell>

                                            <TableCell sx={{ px: 1.5, py: 1, display: { xs: "none", md: "table-cell" } }}>
                                                <Chip
                                                    size="small"
                                                    label={row.category}
                                                    sx={{ height: 20, fontSize: 10, fontWeight: 800, bgcolor: accent, color: "#ffffff" }}
                                                />
                                            </TableCell>

                                            {type === "announcement" ? (
                                                <TableCell sx={{ px: 1.5, py: 1, display: { xs: "none", lg: "table-cell" } }}>
                                                    <Typography className="text-xs font-semibold">{row.announcementType}</Typography>
                                                </TableCell>
                                            ) : null}

                                            <TableCell sx={{ px: 1.5, py: 1, display: { xs: "none", lg: "table-cell" } }}>
                                                <Typography className="text-xs text-gray-600 whitespace-nowrap">
                                                    {fmtDate(row.publishedAt ?? row.createdAt)}
                                                </Typography>
                                            </TableCell>

                                            <TableCell sx={{ px: 1.5, py: 1, display: { xs: "none", sm: "table-cell" } }}>
                                                <Typography className="text-xs font-bold">{row.viewCount}</Typography>
                                            </TableCell>

                                            <TableCell sx={{ px: 1.5, py: 1 }}>
                                                <Chip
                                                    size="small"
                                                    label={row.isPublished ? "Published" : "Draft"}
                                                    sx={{
                                                        height: 20,
                                                        fontSize: 10,
                                                        fontWeight: 800,
                                                        bgcolor: row.isPublished ? EMERALD : AMBER,
                                                        color: "#ffffff",
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell sx={{ px: 1.5, py: 1, textAlign: "right", whiteSpace: "nowrap" }}>
                                                <Tooltip title="Preview">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => router.push(`/dashboard/rm/updates/preview/${UPDATE_TYPE_SLUGS[type]}/${row.updateId}`)}
                                                    >
                                                        <Eye size={14} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={row.isPublished ? "Move to drafts" : "Publish"}>
                                                    <IconButton size="small" onClick={() => togglePublish(row)}>
                                                        {row.isPublished ? <Undo2 size={14} color={AMBER} /> : <Send size={14} color={EMERALD} />}
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton size="small" onClick={() => openEdit(row)}>
                                                        <Pencil size={14} color={accent} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton size="small" onClick={() => handleDelete(row)}>
                                                        <Trash2 size={14} color={ROSE} />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {meta && meta.totalPages > 1 ? (
                <Box className="flex justify-center pb-1">
                    <Pagination
                        size="small"
                        count={meta.totalPages}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        sx={{ "& .Mui-selected": { backgroundColor: `${accent} !important`, color: "#ffffff" } }}
                    />
                </Box>
            ) : null}

            <UpdateFormModal
                open={formOpen}
                type={type}
                item={editing}
                onClose={() => { setFormOpen(false); setEditing(undefined); }}
                onSubmit={handleSubmit}
            />
        </Box>
    );
}
