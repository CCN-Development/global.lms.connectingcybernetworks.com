"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    InputAdornment,
    LinearProgress,
    MenuItem,
    Stack,
    Switch,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";
import { MdCheckCircle, MdCloudUpload, MdOutlineSmartDisplay, MdSearch } from "react-icons/md";
import { useCourse, type AdminVideoPlayback, type VideoAsset, type VideoListItem, type VideoStatus } from "@/contexts/CourseContext";
import { StatusChip, formatBytes, formatDuration, notify } from "../ui";

/* ───────────────────────────── player ───────────────────────────── */

/** Plays any library video through the Cloudflare Stream iframe (signed token when required). */
export function VideoPlayerDialog({ videoId, title, onClose }: { videoId: string | null; title?: string; onClose: () => void }) {
    const { getVideoPlayback } = useCourse();
    const [playback, setPlayback] = useState<AdminVideoPlayback | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!videoId) return;
        let cancelled = false;
        getVideoPlayback(videoId).then((res) => {
            if (cancelled) return;
            if (res.success && res.data) {
                setPlayback(res.data);
                setError(null);
            } else setError(res.message ?? "Video is not available");
        });
        return () => {
            cancelled = true;
            setPlayback(null);
            setError(null);
        };
    }, [videoId, getVideoPlayback]);

    return (
        <Dialog open={Boolean(videoId)} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{title ?? "Preview"}</DialogTitle>
            <DialogContent>
                <Box sx={{ position: "relative", aspectRatio: "16 / 9", borderRadius: "14px", overflow: "hidden", bgcolor: "#000" }}>
                    {playback ? (
                        <Box
                            component="iframe"
                            src={`${playback.iframeUrl}?preload=true`}
                            title={title ?? "Video preview"}
                            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                            allowFullScreen
                            sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                        />
                    ) : (
                        <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "text.secondary" }}>
                            {error ? <Typography variant="body2">{error}</Typography> : <CircularProgress size={28} />}
                        </Box>
                    )}
                </Box>
                {playback?.durationSec ? (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                        Duration {formatDuration(playback.durationSec)} · {playback.token ? "Signed playback" : "Public playback"}
                    </Typography>
                ) : null}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

/* ───────────────────────────── upload ───────────────────────────── */

/**
 * Uploads straight from the browser to Cloudflare Stream (≤200 MB basic, larger files resumable tus),
 * or imports from a public URL. Optionally attaches the result to a video lesson.
 */
export function VideoUploadDialog({
    open,
    onClose,
    lessonId,
    onUploaded,
}: {
    open: boolean;
    onClose: () => void;
    lessonId?: string;
    onUploaded?: (video: VideoAsset) => void;
}) {
    const { uploadVideo, importVideoFromUrl, uploadingVideo, saving } = useCourse();
    const [tab, setTab] = useState<"file" | "url">("file");
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [resumable, setResumable] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dragOver, setDragOver] = useState(false);
    const abortRef = useRef<AbortController | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const reset = () => {
        setFile(null);
        setTitle("");
        setUrl("");
        setProgress(0);
        setResumable(false);
    };

    const choose = (picked: File | undefined) => {
        if (!picked) return;
        if (!picked.type.startsWith("video/")) {
            notify({ success: false, message: "Please choose a video file", data: null });
            return;
        }
        setFile(picked);
        if (!title) setTitle(picked.name.replace(/\.[^.]+$/, ""));
    };

    const start = async () => {
        if (tab === "url") {
            const res = await importVideoFromUrl({ title: title.trim() || "Imported video", url: url.trim() });
            if (notify(res) && res.data) {
                onUploaded?.(res.data);
                reset();
                onClose();
            }
            return;
        }
        if (!file) return;
        abortRef.current = new AbortController();
        setProgress(0);
        const res = await uploadVideo(file, {
            title: title.trim() || file.name,
            resumable,
            lessonId,
            onProgress: setProgress,
            signal: abortRef.current.signal,
        });
        abortRef.current = null;
        if (notify(res) && res.data) {
            onUploaded?.(res.data);
            reset();
            onClose();
        }
    };

    const close = () => {
        if (uploadingVideo) return;
        reset();
        onClose();
    };

    const bigFile = Boolean(file && file.size > 200 * 1024 * 1024);

    return (
        <Dialog open={open} onClose={close} maxWidth="sm" fullWidth>
            <DialogTitle>Upload video</DialogTitle>
            <DialogContent>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                    <Tab value="file" label="From computer" disabled={uploadingVideo} />
                    <Tab value="url" label="From URL" disabled={uploadingVideo} />
                </Tabs>

                <Stack spacing={2}>
                    <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth disabled={uploadingVideo} />

                    {tab === "file" ? (
                        <>
                            <Box
                                onClick={() => !uploadingVideo && inputRef.current?.click()}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragOver(true);
                                }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragOver(false);
                                    choose(e.dataTransfer.files?.[0]);
                                }}
                                sx={{
                                    p: 3,
                                    borderRadius: "16px",
                                    border: `1px dashed ${dragOver ? "#5B7CFF" : "rgba(255,255,255,0.2)"}`,
                                    bgcolor: dragOver ? "rgba(91,124,255,0.08)" : "rgba(255,255,255,0.02)",
                                    textAlign: "center",
                                    cursor: uploadingVideo ? "default" : "pointer",
                                }}
                            >
                                <Box sx={{ fontSize: 36, color: "text.secondary" }}>{file ? <MdCheckCircle color="#22C55E" /> : <MdCloudUpload />}</Box>
                                <Typography variant="body2">{file ? file.name : "Drop a video here or click to browse"}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {file ? `${formatBytes(file.size)} · ${bigFile ? "resumable upload" : "single upload"}` : "MP4, MOV, MKV, WebM… up to 30 GB"}
                                </Typography>
                            </Box>
                            <input ref={inputRef} hidden type="file" accept="video/*" onChange={(e) => choose(e.target.files?.[0])} />
                            {!bigFile && (
                                <FormControlLabel
                                    control={<Switch checked={resumable} onChange={(e) => setResumable(e.target.checked)} disabled={uploadingVideo} />}
                                    label="Resumable upload (recommended on slow or unstable networks)"
                                />
                            )}
                        </>
                    ) : (
                        <TextField
                            label="Public video URL"
                            placeholder="https://example.com/video.mp4"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            fullWidth
                            helperText="Cloudflare downloads the file directly; it must be publicly reachable over HTTPS."
                        />
                    )}

                    {uploadingVideo && (
                        <Box>
                            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
                            <Typography variant="caption" color="text.secondary">
                                Uploading… {progress.toFixed(0)}% — keep this tab open
                            </Typography>
                        </Box>
                    )}
                    {lessonId && (
                        <Typography variant="caption" color="text.secondary">
                            The video will be attached to this lesson automatically. It becomes playable once Cloudflare finishes processing.
                        </Typography>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                {uploadingVideo ? (
                    <Button color="error" onClick={() => abortRef.current?.abort()}>
                        Cancel upload
                    </Button>
                ) : (
                    <Button color="inherit" onClick={close}>
                        Close
                    </Button>
                )}
                <Button
                    variant="contained"
                    startIcon={<MdCloudUpload />}
                    onClick={start}
                    disabled={uploadingVideo || saving || (tab === "file" ? !file : !/^https?:\/\//.test(url.trim()))}
                >
                    {tab === "file" ? "Upload" : "Import"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ───────────────────────────── picker ───────────────────────────── */

/** Pick an existing library video (or upload one) for a lesson, module intro or course trailer. */
export function VideoPickerDialog({
    open,
    onClose,
    onSelect,
    selectedId,
}: {
    open: boolean;
    onClose: () => void;
    onSelect: (video: Pick<VideoAsset, "videoId" | "title" | "videoStatus" | "durationSec">) => void;
    selectedId?: string | null;
}) {
    const { getVideos } = useCourse();
    const [q, setQ] = useState("");
    const [status, setStatus] = useState<"" | VideoStatus>("");
    const [videos, setVideos] = useState<VideoListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!open) return;
        const timer = setTimeout(async () => {
            setLoading(true);
            const res = await getVideos({ q: q.trim() || undefined, status: status || undefined, pageSize: 50 });
            setLoading(false);
            if (res.success && res.data) setVideos(res.data.videos);
        }, 250);
        return () => clearTimeout(timer);
    }, [open, q, status, getVideos]);

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>Choose a video</DialogTitle>
                <DialogContent>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
                        <TextField
                            size="small"
                            placeholder="Search videos"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            sx={{ flex: 1 }}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><MdSearch /></InputAdornment> } }}
                        />
                        <TextField select size="small" value={status} slotProps={{ select: { displayEmpty: true } }} onChange={(e) => setStatus(e.target.value as "" | VideoStatus)} sx={{ minWidth: 170 }}>
                            <MenuItem value="">All statuses</MenuItem>
                            <MenuItem value="ready">Ready</MenuItem>
                            <MenuItem value="processing">Processing</MenuItem>
                            <MenuItem value="pending_upload">Pending upload</MenuItem>
                            <MenuItem value="error">Error</MenuItem>
                        </TextField>
                        <Button variant="outlined" startIcon={<MdCloudUpload />} onClick={() => setUploading(true)}>
                            Upload new
                        </Button>
                    </Stack>

                    {loading ? (
                        <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
                            <CircularProgress size={26} />
                        </Box>
                    ) : !videos.length ? (
                        <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: "center" }}>
                            No videos found. Upload one to get started.
                        </Typography>
                    ) : (
                        <Stack spacing={1}>
                            {videos.map((video) => (
                                <Box
                                    key={video.videoId}
                                    onClick={() => onSelect(video)}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.5,
                                        p: 1.25,
                                        borderRadius: "12px",
                                        cursor: "pointer",
                                        border: `1px solid ${video.videoId === selectedId ? "#5B7CFF" : "rgba(255,255,255,0.06)"}`,
                                        bgcolor: video.videoId === selectedId ? "rgba(91,124,255,0.1)" : "rgba(255,255,255,0.02)",
                                        "&:hover": { borderColor: "rgba(91,124,255,0.6)" },
                                    }}
                                >
                                    <Box sx={{ fontSize: 26, color: "#38BDF8", display: "flex" }}>
                                        <MdOutlineSmartDisplay />
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                                            {video.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDuration(video.durationSec)} · used {video.usageCount}× · {video.fileName ?? video.uploadMethod}
                                        </Typography>
                                    </Box>
                                    <StatusChip status={video.videoStatus} />
                                </Box>
                            ))}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
            <VideoUploadDialog
                open={uploading}
                onClose={() => setUploading(false)}
                onUploaded={(video) => {
                    setUploading(false);
                    onSelect(video);
                }}
            />
        </>
    );
}
