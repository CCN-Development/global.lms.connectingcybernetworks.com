"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    MenuItem,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { MdCloudUpload, MdDeleteOutline, MdEdit, MdOutlineSmartDisplay, MdPlayArrow, MdRefresh, MdSearch } from "react-icons/md";
import { useCourse, type VideoListItem, type VideoStatus } from "@/contexts/CourseContext";
import { CourseAdminNav, EmptyState, GlassCard, LoadingState, PageHeader, StatusChip, formatBytes, formatDate, formatDuration, notify, useConfirm } from "../ui";
import { VideoPlayerDialog, VideoUploadDialog } from "./VideoDialogs";

export default function VideoLibrary() {
    const { videoLibrary, loadingVideos, getVideos, syncVideo, updateVideo, deleteVideo, saving } = useCourse();
    const { confirm, dialog } = useConfirm();
    const [q, setQ] = useState("");
    const [status, setStatus] = useState<"" | VideoStatus>("");
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<VideoListItem | null>(null);
    const [renaming, setRenaming] = useState<{ video: VideoListItem; title: string } | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            getVideos({ q: q.trim() || undefined, status: status || undefined, page: page + 1, pageSize });
        }, 250);
        return () => clearTimeout(timer);
    }, [q, status, page, pageSize, getVideos]);

    const remove = async (video: VideoListItem) => {
        const ok = await confirm({
            title: `Delete "${video.title}"?`,
            description: video.usageCount
                ? "This video is still used by lessons, module intros or trailers. Detach it first."
                : "The video is removed from Cloudflare Stream permanently.",
            confirmLabel: "Delete",
            danger: true,
        });
        if (ok) notify(await deleteVideo(video.videoId));
    };

    const saveTitle = async () => {
        if (!renaming?.title.trim()) return;
        if (notify(await updateVideo(renaming.video.videoId, { title: renaming.title.trim() }))) setRenaming(null);
    };

    const videos = videoLibrary?.videos ?? [];

    return (
        <Box>
            <PageHeader
                title="Video Library"
                subtitle="Videos are stored on Cloudflare Stream and played back with short-lived signed links."
                actions={
                    <Button variant="contained" startIcon={<MdCloudUpload />} onClick={() => setUploading(true)}>
                        Upload video
                    </Button>
                }
            />
            <CourseAdminNav />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
                <TextField
                    size="small"
                    placeholder="Search by title"
                    value={q}
                    onChange={(e) => {
                        setQ(e.target.value);
                        setPage(0);
                    }}
                    sx={{ flex: 1, maxWidth: { sm: 420 } }}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><MdSearch /></InputAdornment> } }}
                />
                <TextField
                    select
                    size="small"
                    value={status} slotProps={{ select: { displayEmpty: true } }}
                    onChange={(e) => {
                        setStatus(e.target.value as "" | VideoStatus);
                        setPage(0);
                    }}
                    sx={{ minWidth: 180 }}
                >
                    <MenuItem value="">All statuses</MenuItem>
                    <MenuItem value="ready">Ready</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="pending_upload">Pending upload</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                </TextField>
            </Stack>

            {loadingVideos && !videoLibrary ? (
                <LoadingState label="Loading videos…" />
            ) : !videos.length ? (
                <EmptyState
                    icon={<MdOutlineSmartDisplay />}
                    title="No videos yet"
                    description="Upload lesson videos, module intros and course trailers here, then attach them in the course builder."
                    action={
                        <Button variant="contained" startIcon={<MdCloudUpload />} onClick={() => setUploading(true)}>
                            Upload video
                        </Button>
                    }
                />
            ) : (
                <GlassCard>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Video</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Duration</TableCell>
                                    <TableCell>Size</TableCell>
                                    <TableCell>Used by</TableCell>
                                    <TableCell>Uploaded</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {videos.map((video) => (
                                    <TableRow key={video.videoId} hover>
                                        <TableCell sx={{ maxWidth: 320 }}>
                                            <Stack sx={{ alignItems: "center" }} direction="row" spacing={1.5}>
                                                <Box sx={{ fontSize: 24, color: "#38BDF8", display: "flex" }}>
                                                    <MdOutlineSmartDisplay />
                                                </Box>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                                                        {video.title}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" noWrap component="div">
                                                        {video.fileName ?? video.streamUid}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={video.errorReasonText ?? video.errorReasonCode ?? ""}>
                                                <span>
                                                    <StatusChip status={video.videoStatus} />
                                                </span>
                                            </Tooltip>
                                            {video.videoStatus === "processing" && video.pctComplete !== null && (
                                                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                    {Math.round(video.pctComplete)}%
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>{formatDuration(video.durationSec)}</TableCell>
                                        <TableCell>{formatBytes(video.sizeBytes)}</TableCell>
                                        <TableCell>{video.usageCount ? `${video.usageCount} place${video.usageCount > 1 ? "s" : ""}` : "Unused"}</TableCell>
                                        <TableCell>{formatDate(video.createdAt)}</TableCell>
                                        <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                                            <Tooltip title="Preview">
                                                <span>
                                                    <IconButton size="small" disabled={video.videoStatus !== "ready"} onClick={() => setPreview(video)}>
                                                        <MdPlayArrow />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Sync status from Cloudflare">
                                                <IconButton size="small" disabled={saving} onClick={async () => notify(await syncVideo(video.videoId))}>
                                                    <MdRefresh />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Rename">
                                                <IconButton size="small" onClick={() => setRenaming({ video, title: video.title })}>
                                                    <MdEdit />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton size="small" color="error" onClick={() => remove(video)}>
                                                    <MdDeleteOutline />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={videoLibrary?.total ?? 0}
                        page={page}
                        rowsPerPage={pageSize}
                        rowsPerPageOptions={[10, 20, 50, 100]}
                        onPageChange={(_, p) => setPage(p)}
                        onRowsPerPageChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPage(0);
                        }}
                    />
                </GlassCard>
            )}

            <VideoUploadDialog open={uploading} onClose={() => setUploading(false)} />
            <VideoPlayerDialog videoId={preview?.videoId ?? null} title={preview?.title} onClose={() => setPreview(null)} />
            <Dialog open={Boolean(renaming)} onClose={() => setRenaming(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Rename video</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Title"
                        sx={{ mt: 1 }}
                        value={renaming?.title ?? ""}
                        onChange={(e) => setRenaming((r) => (r ? { ...r, title: e.target.value } : r))}
                        onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button color="inherit" onClick={() => setRenaming(null)}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={saveTitle} disabled={saving}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
            {dialog}
        </Box>
    );
}
