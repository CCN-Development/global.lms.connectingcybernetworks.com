"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import type { StreamPlayerApi } from "@cloudflare/stream-react";
import { useCourse, type LessonPlayback, type ModuleLessonView } from "@/contexts/CourseContext";
import { announceRewards } from "../course-format";
import StreamPlayer from "../StreamPlayer";
import { LESSON_VIDEO_POSTER, VideoPoster } from "./ModuleView";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Signed Stream playback for a video lesson. Watch time is accumulated from real forward playback
 * (seeks and jumps are ignored) and sent as heartbeats; the API clamps it to wall-clock time too.
 */
export default function VideoLessonPlayer({ lesson }: { lesson: ModuleLessonView }) {
    const { getLessonPlayback, saveVideoProgress } = useCourse();
    const lessonId = lesson.lessonId;
    const available = Boolean(lesson.video?.available);
    const [playback, setPlayback] = useState<LessonPlayback | null>(null);
    const [error, setError] = useState<string | null>(null);

    const streamRef = useRef<StreamPlayerApi | undefined>(undefined);
    const lastTime = useRef<number | null>(null);
    const position = useRef(0);
    const rate = useRef(1);
    const pending = useRef(0);
    const inflight = useRef(false);
    const playing = useRef(false);
    const completed = useRef(lesson.completed);

    useEffect(() => {
        if (!available) return;
        let cancelled = false;
        getLessonPlayback(lessonId).then((res) => {
            if (cancelled) return;
            if (res.success && res.data) {
                position.current = res.data.resumeAtSec;
                completed.current = res.data.completed;
                setPlayback(res.data);
            } else {
                setError(res.message ?? "Video is not available");
            }
        });
        return () => {
            cancelled = true;
        };
    }, [available, lessonId, getLessonPlayback]);

    const flush = useCallback(
        async (ended = false) => {
            if (inflight.current) return;
            const delta = pending.current;
            if (delta < 1 && !ended) return;
            pending.current = 0;
            inflight.current = true;
            try {
                const res = await saveVideoProgress(lessonId, {
                    positionSec: Math.max(0, Math.floor(position.current)),
                    watchedDeltaSec: clamp(Math.round(delta * 10) / 10, 0, 3600),
                    playbackRate: clamp(rate.current || 1, 0.25, 4),
                    ended,
                });
                if (!res.success || !res.data) {
                    // Keep the watch time for the next heartbeat.
                    pending.current += delta;
                    return;
                }
                const justCompleted = res.data.completed && !completed.current;
                completed.current = res.data.completed;
                if (res.data.xpAwarded > 0 || justCompleted) announceRewards(res.data, res.data.xpAwarded);
            } finally {
                inflight.current = false;
            }
        },
        [lessonId, saveVideoProgress],
    );

    // Periodic heartbeat while playing, plus a final flush when the player closes.
    useEffect(() => {
        if (!playback) return;
        const id = window.setInterval(() => {
            if (playing.current) flush();
        }, Math.max(5, playback.heartbeatIntervalSec) * 1000);
        return () => {
            window.clearInterval(id);
            flush();
        };
    }, [playback, flush]);

    const syncClock = () => {
        const api = streamRef.current;
        if (!api) return;
        lastTime.current = api.currentTime;
        position.current = api.currentTime;
    };

    const onTimeUpdate = () => {
        const api = streamRef.current;
        if (!api) return;
        const now = api.currentTime;
        const speed = api.playbackRate || 1;
        if (lastTime.current !== null) {
            const step = now - lastTime.current;
            // Only count small forward steps — anything bigger is a seek.
            if (step > 0 && step <= 2 * Math.max(1, speed) + 1) pending.current += step;
        }
        lastTime.current = now;
        position.current = now;
        rate.current = speed;
    };

    const poster = lesson.video?.posterUrl || LESSON_VIDEO_POSTER;

    return (
        <Box sx={{ position: "relative", height: { xs: 220, sm: 360, lg: 420 } }}>
            <VideoPoster
                poster={playback?.thumbnailUrl || poster}
                caption={lesson.title}
                variant="inline"
                available={available}
                busy={available && !playback && !error}
                message={error}
            >
                {playback ? (
                    <StreamPlayer
                        playback={playback}
                        title={lesson.title}
                        startTime={playback.resumeAtSec}
                        streamRef={streamRef}
                        onPlay={() => {
                            playing.current = true;
                            syncClock();
                        }}
                        onPause={() => {
                            playing.current = false;
                            flush();
                        }}
                        onEnded={() => {
                            playing.current = false;
                            flush(true);
                        }}
                        onSeeking={syncClock}
                        onTimeUpdate={onTimeUpdate}
                    />
                ) : undefined}
            </VideoPoster>
        </Box>
    );
}
