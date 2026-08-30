"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    Autocomplete,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    IconButton,
    MenuItem,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import RichTextEditor, { isRichTextEmpty } from "@/components/editor/RichTextEditor";
import { fileUploaderToS3 } from "@/services/s3";
import {
    ANNOUNCEMENT_TYPES,
    DEFAULT_ACTION_LABELS,
    UPDATE_PRIORITIES,
    UPDATE_TYPE_LABELS,
    type AnnouncementType,
    type CreateAnnouncementInput,
    type CreateBlogInput,
    type CreateNewsInput,
    type UpdateItem,
    type UpdatePriority,
    type UpdateType,
} from "@/contexts/UpdatesContext";

const PRIMARY = "#009DFF";
const PRIMARY_DARK = "#007fd4";
const VIOLET = "#7c3aed";
const EMERALD = "#10b981";
const ROSE = "#f43f5e";

export const TYPE_ACCENT: Record<UpdateType, string> = {
    news: PRIMARY,
    blog: VIOLET,
    announcement: EMERALD,
};

const CATEGORY_SUGGESTIONS = [
    "Learning at CCN",
    "Cyber Security",
    "Placements",
    "Campus Life",
    "Career Guidance",
    "Technology",
    "Events",
    "Exams",
    "General",
];

export type UpdateFormPayload = CreateBlogInput & CreateNewsInput & CreateAnnouncementInput;

type Props = {
    open: boolean;
    type: UpdateType;
    /** Passing an item switches the dialog to edit mode. */
    item?: UpdateItem & { content?: string };
    onClose: () => void;
    onSubmit: (data: UpdateFormPayload) => Promise<{ success: boolean; message: string | null }>;
};

function toDateInput(value?: string | null) {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export default function UpdateFormModal({ open, type, item, onClose, onSubmit }: Props) {
    const isEdit = Boolean(item);
    const accent = TYPE_ACCENT[type];

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("General");
    const [summary, setSummary] = useState("");
    const [content, setContent] = useState("");
    const [coverImageUrl, setCoverImageUrl] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [readTimeMinutes, setReadTimeMinutes] = useState<number | "">("");
    const [authorName, setAuthorName] = useState("");
    const [authorPhotoUrl, setAuthorPhotoUrl] = useState("");

    const [sourceName, setSourceName] = useState("");
    const [sourceUrl, setSourceUrl] = useState("");

    const [announcementType, setAnnouncementType] = useState<AnnouncementType>("General");
    const [priority, setPriority] = useState<UpdatePriority>("normal");
    const [actionLabel, setActionLabel] = useState("");
    const [actionUrl, setActionUrl] = useState("");
    const [isPinned, setIsPinned] = useState(false);
    const [validFrom, setValidFrom] = useState("");
    const [validTill, setValidTill] = useState("");

    const [isPublished, setIsPublished] = useState(true);
    const [isFeatured, setIsFeatured] = useState(false);
    const [isTrending, setIsTrending] = useState(false);
    const [isGlobal, setIsGlobal] = useState(false);

    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;

        setTitle(item?.title ?? "");
        setCategory(item?.category ?? "General");
        setSummary(item?.summary ?? "");
        setContent(item?.content ?? "");
        setCoverImageUrl(item?.coverImageUrl ?? "");
        setTags(item?.tags ?? []);
        setReadTimeMinutes(item?.readTimeMinutes ?? "");
        setAuthorName(item?.authorName ?? "");
        setAuthorPhotoUrl(item?.authorPhotoUrl ?? "");

        setSourceName(item?.sourceName ?? "");
        setSourceUrl(item?.sourceUrl ?? "");

        setAnnouncementType((item?.announcementType as AnnouncementType) ?? "General");
        setPriority((item?.priority as UpdatePriority) ?? "normal");
        setActionLabel(item?.actionLabel ?? "");
        setActionUrl(item?.actionUrl ?? "");
        setIsPinned(item?.isPinned ?? false);
        setValidFrom(toDateInput(item?.validFrom));
        setValidTill(toDateInput(item?.validTill));

        setIsPublished(item?.isPublished ?? true);
        setIsFeatured(item?.isFeatured ?? false);
        setIsTrending(item?.isTrending ?? false);
        setIsGlobal(item ? item.branchId === null : false);
    }, [open, item]);

    const actionLabelPlaceholder = useMemo(
        () => DEFAULT_ACTION_LABELS[announcementType] ?? "Read More",
        [announcementType],
    );

    const uploadImage = (file: File, apply: (url: string) => void) => {
        setUploading(true);
        fileUploaderToS3(
            file,
            () => undefined,
            (fileUrl) => {
                apply(fileUrl);
                setUploading(false);
                toast.success("Image uploaded");
            },
        ).catch(() => {
            setUploading(false);
            toast.error("Upload failed");
        });
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }
        if (isRichTextEmpty(content)) {
            toast.error("Content is required");
            return;
        }

        const payload: UpdateFormPayload = {
            title: title.trim(),
            content,
            summary: summary.trim() || undefined,
            coverImageUrl: coverImageUrl || undefined,
            category: category.trim() || "General",
            tags,
            readTimeMinutes: typeof readTimeMinutes === "number" ? readTimeMinutes : undefined,
            authorName: authorName.trim() || undefined,
            authorPhotoUrl: authorPhotoUrl || undefined,
            isPublished,
            isFeatured,
            isTrending,
            isGlobal,
        };

        if (type === "news") {
            payload.sourceName = sourceName.trim() || undefined;
            payload.sourceUrl = sourceUrl.trim() || undefined;
        }

        if (type === "announcement") {
            payload.announcementType = announcementType;
            payload.priority = priority;
            payload.actionLabel = actionLabel.trim() || actionLabelPlaceholder;
            payload.actionUrl = actionUrl.trim() || undefined;
            payload.isPinned = isPinned;
            payload.validFrom = validFrom || undefined;
            payload.validTill = validTill || undefined;
        }

        setSaving(true);
        const res = await onSubmit(payload);
        setSaving(false);

        if (res.success) {
            toast.success(res.message ?? "Saved");
            onClose();
        } else {
            toast.error(res.message ?? "Failed to save");
        }
    };

    return (
        <Dialog
            open={open}
            onClose={saving ? undefined : onClose}
            fullWidth
            maxWidth="md"
            slotProps={{ paper: { sx: { borderRadius: "12px", border: `1px solid ${accent}` } } }}
        >
            <DialogTitle
                sx={{
                    px: 2,
                    py: 1.5,
                    background: `linear-gradient(90deg, ${accent}, ${accent}cc)`,
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Typography component="span" className="text-sm sm:text-base font-black">
                    {isEdit ? "Edit" : "New"} {UPDATE_TYPE_LABELS[type]}
                </Typography>
                <IconButton size="small" onClick={onClose} disabled={saving} sx={{ color: "#ffffff" }}>
                    <X size={16} />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box className="flex flex-col gap-2.5">
                    <TextField
                        size="small"
                        label="Title"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                    />

                    <Box className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Autocomplete
                            freeSolo
                            size="small"
                            options={CATEGORY_SUGGESTIONS}
                            value={category}
                            onInputChange={(_, v) => setCategory(v)}
                            renderInput={(params) => <TextField {...params} label="Category" />}
                        />
                        <TextField
                            size="small"
                            type="number"
                            label="Read time (min)"
                            placeholder="Auto"
                            value={readTimeMinutes}
                            onChange={(e) => setReadTimeMinutes(e.target.value === "" ? "" : Number(e.target.value))}
                            slotProps={{ input: { sx: { borderRadius: "8px" } }, inputLabel: { shrink: true } }}
                        />
                        <TextField
                            size="small"
                            label="Author name"
                            placeholder="Defaults to you"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            slotProps={{ input: { sx: { borderRadius: "8px" } }, inputLabel: { shrink: true } }}
                        />
                    </Box>

                    <TextField
                        size="small"
                        label="Summary"
                        multiline
                        minRows={2}
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                    />

                    <Autocomplete
                        multiple
                        freeSolo
                        size="small"
                        options={[] as string[]}
                        value={tags}
                        onChange={(_, v) => setTags(v as string[])}
                        renderValue={(value, getItemProps) =>
                            value.map((option, index) => (
                                <Chip
                                    size="small"
                                    label={option}
                                    {...getItemProps({ index })}
                                    key={option}
                                    sx={{ bgcolor: accent, color: "#ffffff", fontWeight: 700 }}
                                />
                            ))
                        }
                        renderInput={(params) => <TextField {...params} label="Tags" placeholder="Press enter to add" />}
                    />

                    {/* Cover image */}
                    <Box className="flex items-center gap-2 flex-wrap">
                        {coverImageUrl ? (
                            <Box className="relative w-28 h-16 rounded-lg overflow-hidden" sx={{ border: `1px solid ${accent}` }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                            </Box>
                        ) : null}
                        <Button
                            size="small"
                            component="label"
                            variant="outlined"
                            disabled={uploading}
                            startIcon={uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, borderColor: accent, color: accent }}
                        >
                            {coverImageUrl ? "Replace cover" : "Upload cover"}
                            <input
                                hidden
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) uploadImage(file, setCoverImageUrl);
                                    e.target.value = "";
                                }}
                            />
                        </Button>
                        {coverImageUrl ? (
                            <Button
                                size="small"
                                onClick={() => setCoverImageUrl("")}
                                startIcon={<Trash2 size={14} />}
                                sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, color: ROSE }}
                            >
                                Remove
                            </Button>
                        ) : null}
                    </Box>

                    <RichTextEditor label="Content" value={content} onChange={setContent} minHeight={220} />

                    {type === "news" ? (
                        <Box className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <TextField
                                size="small"
                                label="Source name"
                                value={sourceName}
                                onChange={(e) => setSourceName(e.target.value)}
                                slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                            />
                            <TextField
                                size="small"
                                label="Source URL"
                                value={sourceUrl}
                                onChange={(e) => setSourceUrl(e.target.value)}
                                slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                            />
                        </Box>
                    ) : null}

                    {type === "announcement" ? (
                        <>
                            <Divider />
                            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <TextField
                                    select
                                    size="small"
                                    label="Announcement type"
                                    value={announcementType}
                                    onChange={(e) => setAnnouncementType(e.target.value as AnnouncementType)}
                                    slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                                >
                                    {ANNOUNCEMENT_TYPES.map((option) => (
                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    select
                                    size="small"
                                    label="Priority"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as UpdatePriority)}
                                    slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                                >
                                    {UPDATE_PRIORITIES.map((option) => (
                                        <MenuItem key={option} value={option} sx={{ textTransform: "capitalize" }}>{option}</MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    size="small"
                                    label="Action label"
                                    placeholder={actionLabelPlaceholder}
                                    value={actionLabel}
                                    onChange={(e) => setActionLabel(e.target.value)}
                                    slotProps={{ input: { sx: { borderRadius: "8px" } }, inputLabel: { shrink: true } }}
                                />
                                <TextField
                                    size="small"
                                    label="Action URL"
                                    value={actionUrl}
                                    onChange={(e) => setActionUrl(e.target.value)}
                                    slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                                />
                                <TextField
                                    size="small"
                                    type="date"
                                    label="Valid from"
                                    value={validFrom}
                                    onChange={(e) => setValidFrom(e.target.value)}
                                    slotProps={{ input: { sx: { borderRadius: "8px" } }, inputLabel: { shrink: true } }}
                                />
                                <TextField
                                    size="small"
                                    type="date"
                                    label="Valid till"
                                    value={validTill}
                                    onChange={(e) => setValidTill(e.target.value)}
                                    slotProps={{ input: { sx: { borderRadius: "8px" } }, inputLabel: { shrink: true } }}
                                />
                            </Box>
                        </>
                    ) : null}

                    <Divider />

                    <Box className="flex flex-wrap gap-x-4 gap-y-0.5">
                        <FormControlLabel
                            control={<Switch size="small" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />}
                            label={<span className="text-xs font-semibold">Publish now</span>}
                        />
                        <FormControlLabel
                            control={<Switch size="small" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />}
                            label={<span className="text-xs font-semibold">Feature in carousel</span>}
                        />
                        <FormControlLabel
                            control={<Switch size="small" checked={isTrending} onChange={(e) => setIsTrending(e.target.checked)} />}
                            label={<span className="text-xs font-semibold">Mark trending</span>}
                        />
                        {type === "announcement" ? (
                            <FormControlLabel
                                control={<Switch size="small" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />}
                                label={<span className="text-xs font-semibold">Pin to top</span>}
                            />
                        ) : null}
                        <FormControlLabel
                            control={<Switch size="small" checked={isGlobal} onChange={(e) => setIsGlobal(e.target.checked)} />}
                            label={<span className="text-xs font-semibold">All branches</span>}
                        />
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 2, py: 1.25, gap: 1 }}>
                <Button
                    size="small"
                    onClick={onClose}
                    disabled={saving}
                    sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, color: "#6b7280" }}
                >
                    Cancel
                </Button>
                <Button
                    size="small"
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={saving || uploading}
                    startIcon={saving ? <Loader2 size={14} className="animate-spin" /> : undefined}
                    sx={{
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 800,
                        backgroundColor: PRIMARY,
                        "&:hover": { backgroundColor: PRIMARY_DARK },
                    }}
                >
                    {isEdit ? "Save changes" : "Create"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
