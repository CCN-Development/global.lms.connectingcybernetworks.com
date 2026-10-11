"use client";

import React from "react";
import { Box } from "@mui/material";
import { Stream, type StreamPlayerApi } from "@cloudflare/stream-react";
import type { PlaybackInfo } from "@/contexts/CourseContext";

/** The Stream SDK builds its own iframe URL, so pass it the customer subdomain the API signed for. */
function customerCodeOf(url: string): string | undefined {
    return url.match(/customer-([a-z0-9]+)\.cloudflarestream\.com/i)?.[1];
}

export interface StreamPlayerProps {
    playback: Pick<PlaybackInfo, "token" | "playbackId" | "iframeUrl" | "thumbnailUrl">;
    title: string;
    autoplay?: boolean;
    startTime?: number;
    streamRef?: React.RefObject<StreamPlayerApi | undefined>;
    onPlay?: () => void;
    onPause?: () => void;
    onEnded?: () => void;
    onTimeUpdate?: () => void;
    onSeeking?: () => void;
    onError?: () => void;
}

/**
 * Cloudflare Stream player (signed token or public id) that fills its positioned parent.
 * Media events come through the Stream Player SDK, so progress tracking reads `streamRef.current`.
 */
export default function StreamPlayer({
    playback,
    title,
    autoplay = true,
    startTime,
    streamRef,
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    onSeeking,
    onError,
}: StreamPlayerProps) {
    return (
        <Box
            sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "#000",
                "& > div": { position: "absolute !important", inset: 0, width: "100%", height: "100%", pt: "0 !important" },
                "& iframe": { position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 },
            }}
        >
            <Stream
                src={playback.token ?? playback.playbackId}
                customerCode={customerCodeOf(playback.iframeUrl)}
                title={title}
                controls
                autoplay={autoplay}
                preload="auto"
                startTime={startTime && startTime > 0 ? Math.floor(startTime) : undefined}
                poster={playback.thumbnailUrl}
                primaryColor="#8C24FF"
                letterboxColor="transparent"
                responsive={false}
                width="100%"
                height="100%"
                streamRef={streamRef as React.MutableRefObject<StreamPlayerApi | undefined> | undefined}
                onPlay={onPlay}
                onPause={onPause}
                onEnded={onEnded}
                onTimeUpdate={onTimeUpdate}
                onSeeking={onSeeking}
                onSeeked={onSeeking}
                onError={onError}
            />
        </Box>
    );
}
