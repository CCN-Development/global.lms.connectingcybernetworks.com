"use client";

import React, { useEffect, useRef, useState } from "react";
import { Box, ButtonBase, Dialog, SxProps, Theme, Typography } from "@mui/material";
import { ResumeRecord } from "./resume-data";
import ResumeDocument, { DOC_HEIGHT, DOC_WIDTH } from "./ResumeDocument";
import { GlassPanel, PanelTitle, RB, RTEXT, RbIcon } from "./rb-ui";

const ZOOM_MIN = 50;
const ZOOM_MAX = 200;
const ZOOM_STEP = 10;

/** Tracks an element's content-box width. */
function useWidth<T extends HTMLElement>() {
    const ref = useRef<T | null>(null);
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    return [ref, width] as const;
}

/** The resume page scaled with a transform while keeping a correctly sized layout box. */
export function ScaledDocument({ resume, scale, sx }: { resume: ResumeRecord; scale: number; sx?: SxProps<Theme> }) {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const [height, setHeight] = useState(DOC_HEIGHT);
    useEffect(() => {
        const el = innerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => setHeight(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <Box
            sx={[
                { position: "relative", flexShrink: 0, width: DOC_WIDTH * scale, height: height * scale, boxShadow: "0 0 16px 0 rgba(255,255,255,0.24)", bgcolor: "#FFFFFF" },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            <Box ref={innerRef} sx={{ position: "absolute", left: 0, top: 0, width: DOC_WIDTH, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
                <ResumeDocument resume={resume} />
            </Box>
        </Box>
    );
}

/** Scales the page down so it never overflows its container (and up to `max`). */
export function FitDocument({ resume, max = 1, sx }: { resume: ResumeRecord; max?: number; sx?: SxProps<Theme> }) {
    const [ref, width] = useWidth<HTMLDivElement>();
    const scale = width ? Math.min(max, width / DOC_WIDTH) : 0;
    return (
        <Box ref={ref} sx={[{ width: "100%", display: "flex", justifyContent: "center" }, ...(Array.isArray(sx) ? sx : [sx])]}>
            {scale > 0 && <ScaledDocument resume={resume} scale={scale} />}
        </Box>
    );
}

const iconBtn = {
    width: 36,
    height: 36,
    flexShrink: 0,
    p: "6px",
    bgcolor: "#0D0D0D",
    "&:hover": { bgcolor: "#1A1A1A" },
    "&.Mui-disabled": { opacity: 0.4 },
} as const;

export function PreviewPanel({ resume, sx }: { resume: ResumeRecord; sx?: SxProps<Theme> }) {
    const [zoom, setZoom] = useState(100);
    const [fullscreen, setFullscreen] = useState(false);
    const [areaRef, areaWidth] = useWidth<HTMLDivElement>();
    // 100% = the native 576px page; narrower panels shrink it so 100% always fits.
    const fit = areaWidth ? Math.min(1, areaWidth / DOC_WIDTH) : 0;
    const scale = (fit * zoom) / 100;

    return (
        <GlassPanel sx={[{ p: { xs: "20px", sm: "32px" }, gap: "32px" }, ...(Array.isArray(sx) ? sx : [sx])]}>
            <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <PanelTitle>Preview</PanelTitle>
                <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "12px", overflow: "hidden", borderRadius: "4px", bgcolor: "#262626", border: `1px solid ${RB.neutral700}` }}>
                        <ButtonBase aria-label="Zoom out" disabled={zoom <= ZOOM_MIN} onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))} sx={iconBtn}>
                            <RbIcon name="icon-zoom-out.svg" size={24} />
                        </ButtonBase>
                        <Typography aria-live="polite" sx={{ ...RTEXT.med12, color: RB.n75, minWidth: 32, textAlign: "center" }}>
                            {zoom}%
                        </Typography>
                        <ButtonBase aria-label="Zoom in" disabled={zoom >= ZOOM_MAX} onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))} sx={iconBtn}>
                            <RbIcon name="icon-zoom-in.svg" size={24} />
                        </ButtonBase>
                    </Box>
                    <ButtonBase aria-label="View full screen" onClick={() => setFullscreen(true)} sx={{ ...iconBtn, borderRadius: "4px" }}>
                        <RbIcon name="icon-fullscreen.svg" size={24} />
                    </ButtonBase>
                </Box>
            </Box>
            <Box
                ref={areaRef}
                tabIndex={0}
                aria-label="Resume preview"
                sx={{
                    position: "relative",
                    flex: 1,
                    minHeight: 0,
                    overflow: "auto",
                    mx: { xs: "-8px", sm: "-16px" },
                    px: { xs: "8px", sm: "16px" },
                    pb: "16px",
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(255,255,255,0.12) transparent",
                    outline: "none",
                }}
            >
                {scale > 0 && <ScaledDocument resume={resume} scale={scale} sx={{ mx: "auto" }} />}
            </Box>

            <FullscreenPreview open={fullscreen} resume={resume} onClose={() => setFullscreen(false)} />
        </GlassPanel>
    );
}

export function FullscreenPreview({ open, resume, onClose }: { open: boolean; resume: ResumeRecord; onClose: () => void }) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen
            aria-label="Resume preview (full screen)"
            slotProps={{ paper: { sx: { bgcolor: "rgba(2,0,20,0.92)", backgroundImage: "none", backdropFilter: "blur(12px)" } } }}
        >
            <ButtonBase
                aria-label="Close full screen preview"
                onClick={onClose}
                sx={{ position: "fixed", top: 24, right: 24, zIndex: 2, width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", backgroundImage: RB.iconButtonBg, backdropFilter: "blur(25px)" }}
            >
                <RbIcon name="icon-x-20.svg" size={20} />
            </ButtonBase>
            <Box sx={{ px: { xs: "16px", sm: "48px" }, py: "48px", overflow: "auto" }}>
                <FitDocument resume={resume} max={1.5} />
            </Box>
        </Dialog>
    );
}
