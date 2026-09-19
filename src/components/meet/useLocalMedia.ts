"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MediaPermission = "idle" | "prompting" | "granted" | "denied" | "unsupported";

export type LocalMedia = {
    stream: MediaStream | null;
    micOn: boolean;
    camOn: boolean;
    permission: MediaPermission;
    error: string | null;
    hasVideoTrack: boolean;
    request: (opts?: { audio?: boolean; video?: boolean }) => Promise<void>;
    toggleMic: () => void;
    toggleCam: () => Promise<void>;
    /** Transfers stream ownership to the caller so unmount cleanup leaves it running. */
    handOff: () => MediaStream | null;
    stop: () => void;
};

/** Wraps getUserMedia so permission prompts and device failures are handled in one place. */
export function useLocalMedia(): LocalMedia {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [permission, setPermission] = useState<MediaPermission>("idle");
    const [error, setError] = useState<string | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => { streamRef.current = stream; }, [stream]);

    const stop = useCallback(() => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setStream(null);
    }, []);

    useEffect(() => () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
    }, []);

    const request = useCallback(async ({ audio = true, video = true } = {}) => {
        if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
            setPermission("unsupported");
            setError("This browser cannot access camera or microphone.");
            return;
        }

        setPermission("prompting");
        setError(null);

        try {
            const next = await navigator.mediaDevices.getUserMedia({
                audio,
                video: video ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
            });
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = next;
            setStream(next);
            setMicOn(next.getAudioTracks().some((t) => t.enabled));
            setCamOn(next.getVideoTracks().length > 0);
            setPermission("granted");
        } catch (err) {
            const name = (err as DOMException)?.name;
            if (video && (name === "NotFoundError" || name === "OverconstrainedError" || name === "NotReadableError")) {
                // No usable camera — fall back to audio so the user can still join.
                try {
                    const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true });
                    streamRef.current = audioOnly;
                    setStream(audioOnly);
                    setCamOn(false);
                    setMicOn(true);
                    setPermission("granted");
                    setError("No camera found — joining with audio only.");
                    return;
                } catch {
                    /* fall through to the denied branch */
                }
            }
            setPermission(name === "NotAllowedError" ? "denied" : "denied");
            setCamOn(false);
            setMicOn(false);
            setError(
                name === "NotAllowedError"
                    ? "Camera and microphone are blocked. Allow access from the browser address bar to use them."
                    : "Could not start your camera or microphone.",
            );
        }
    }, []);

    const toggleMic = useCallback(() => {
        const tracks = streamRef.current?.getAudioTracks() ?? [];
        const next = !micOn;
        tracks.forEach((track) => { track.enabled = next; });
        setMicOn(next);
    }, [micOn]);

    const toggleCam = useCallback(async () => {
        const current = streamRef.current;
        const videoTracks = current?.getVideoTracks() ?? [];

        if (camOn) {
            videoTracks.forEach((track) => { track.stop(); current?.removeTrack(track); });
            setCamOn(false);
            setStream(current ? new MediaStream(current.getTracks()) : null);
            return;
        }

        if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return;
        try {
            const cam = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } });
            const track = cam.getVideoTracks()[0];
            if (!track) return;
            const merged = new MediaStream([...(current?.getAudioTracks() ?? []), track]);
            streamRef.current = merged;
            setStream(merged);
            setCamOn(true);
            setError(null);
        } catch {
            setError("Camera could not be started.");
        }
    }, [camOn]);

    const handOff = useCallback(() => {
        const current = streamRef.current;
        streamRef.current = null;
        return current;
    }, []);

    return {
        stream,
        micOn,
        camOn,
        permission,
        error,
        hasVideoTrack: (stream?.getVideoTracks().length ?? 0) > 0,
        request,
        toggleMic,
        toggleCam,
        handOff,
        stop,
    };
}

function attachStream(el: HTMLVideoElement | null, stream: MediaStream | null) {
    if (!el) return;
    if (el.srcObject !== stream) el.srcObject = stream;
    if (stream) void el.play().catch(() => { /* autoplay guard */ });
}

/** Callback ref so the stream re-attaches whenever the video element remounts. */
export function useVideoStream(stream: MediaStream | null) {
    const elementRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        streamRef.current = stream;
        attachStream(elementRef.current, stream);
    }, [stream]);

    return useCallback((el: HTMLVideoElement | null) => {
        elementRef.current = el;
        attachStream(el, streamRef.current);
    }, []);
}
