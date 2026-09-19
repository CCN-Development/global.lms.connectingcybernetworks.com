"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Box, Button, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { MdVideoCall, MdChat, MdRefresh } from "react-icons/md";
import { M } from "@/components/meet/theme";
import { loadJoinPrefs, saveJoinPrefs } from "@/components/meet/meetHelpers";
import PreJoin from "@/components/meet/PreJoin";
import MeetingRoom from "@/components/meet/MeetingRoom";
import { USERS } from "@/components/chats/data";

type Stage = "lobby" | "in-call" | "left";

export default function MeetRoomPage() {
    const router = useRouter();
    const params = useParams<{ roomId: string }>();
    const search = useSearchParams();
    const roomId = String(params?.roomId ?? "");

    const invitedUserIds = (search.get("invite") ?? "").split(",").filter((id) => id && USERS[id]);
    const returnTo = search.get("from") === "chat" ? "/dashboard/chats" : "/dashboard/meet";

    const [stage, setStage] = useState<Stage>("lobby");
    const [displayName, setDisplayName] = useState("You");
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => { streamRef.current = stream; }, [stream]);

    useEffect(() => () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
    }, []);

    useEffect(() => {
        const prefs = loadJoinPrefs();
        if (prefs?.displayName) setDisplayName(prefs.displayName);
    }, []);

    const handleToggleMic = () => {
        const next = !micOn;
        stream?.getAudioTracks().forEach((track) => { track.enabled = next; });
        setMicOn(next);
    };

    const handleToggleCam = async () => {
        if (camOn) {
            stream?.getVideoTracks().forEach((track) => { track.enabled = false; });
            setCamOn(false);
            return;
        }

        const existing = stream?.getVideoTracks() ?? [];
        if (existing.some((track) => track.readyState === "live")) {
            existing.forEach((track) => { track.enabled = true; });
            setCamOn(true);
            return;
        }

        if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
            toast.error("This browser cannot access the camera");
            return;
        }

        try {
            const cam = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } });
            const track = cam.getVideoTracks()[0];
            if (!track) return;
            existing.forEach((dead) => stream?.removeTrack(dead));
            const merged = new MediaStream([...(stream?.getAudioTracks() ?? []), track]);
            setStream(merged);
            setCamOn(true);
        } catch {
            toast.error("Camera is blocked. Allow access from the address bar.");
        }
    };

    const leave = () => {
        stream?.getTracks().forEach((track) => track.stop());
        setStream(null);
        setStage("left");
    };

    if (stage === "lobby") {
        return (
            <PreJoin
                roomId={roomId}
                defaultName={displayName}
                expectedParticipants={invitedUserIds.map((id) => USERS[id]?.name ?? "Guest")}
                onCancel={() => router.push(returnTo)}
                onJoin={(prefs, localStream) => {
                    saveJoinPrefs(prefs);
                    setDisplayName(prefs.displayName);
                    setMicOn(prefs.micOn);
                    setCamOn(prefs.camOn);
                    setStream(localStream);
                    setStage("in-call");
                }}
            />
        );
    }

    if (stage === "left") {
        return (
            <Box sx={{ minHeight: "100vh", background: M.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1.2, px: 2 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: "12px", background: M.accentGrad, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MdVideoCall size={26} color={M.text} />
                </Box>
                <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, color: M.text, mt: 1 }}>You left the meeting</Typography>
                <Typography sx={{ fontSize: "0.8rem", color: M.textMuted }}>Meeting code: {roomId}</Typography>

                <Box sx={{ display: "flex", gap: 1.2, mt: 2.4, flexWrap: "wrap", justifyContent: "center" }}>
                    <Button
                        variant="contained"
                        startIcon={<MdRefresh size={17} />}
                        onClick={() => setStage("lobby")}
                        sx={{ borderRadius: "22px", px: 2.4, fontSize: "0.8rem", textTransform: "none", background: M.accentDark, "&:hover": { background: M.accent } }}
                    >
                        Rejoin
                    </Button>
                    <Button
                        startIcon={<MdChat size={17} />}
                        onClick={() => router.push("/dashboard/chats")}
                        sx={{ borderRadius: "22px", px: 2.4, fontSize: "0.8rem", textTransform: "none", color: M.textSoft, border: `1px solid ${M.border}` }}
                    >
                        Back to chats
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <MeetingRoom
            roomId={roomId}
            displayName={displayName}
            localStream={stream}
            micOn={micOn}
            camOn={camOn}
            invitedUserIds={invitedUserIds}
            onToggleMic={handleToggleMic}
            onToggleCam={() => void handleToggleCam()}
            onLeave={leave}
        />
    );
}
