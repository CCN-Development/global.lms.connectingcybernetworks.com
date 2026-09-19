"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, IconButton, ListItemIcon, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
    MdMic, MdMicOff, MdVideocam, MdVideocamOff, MdCallEnd, MdPresentToAll, MdCancelPresentation,
    MdBackHand, MdEmojiEmotions, MdPeople, MdChat, MdInfoOutline, MdMoreVert, MdClosedCaption,
    MdGridView, MdPushPin, MdViewSidebar, MdAutoAwesomeMosaic, MdContentCopy, MdFullscreen,
    MdFullscreenExit, MdExtension, MdSignalCellularAlt, MdLock,
} from "react-icons/md";
import { M, meetScrollbarSx } from "./theme";
import type { FloatingReaction, MeetChatMessage, MeetLayout, PanelTab, Participant } from "./types";
import { clockLabel, elapsedLabel, meetUid, meetUrl, reactionOffset } from "./meetHelpers";
import { useVideoStream } from "./useLocalMedia";
import ParticipantTile from "./ParticipantTile";
import SidePanel from "./SidePanel";
import InviteDialog from "./InviteDialog";
import { USERS } from "@/components/chats/data";

const REACTIONS = ["👍", "🎉", "👏", "❤️", "😂", "😮", "🙌", "💡"];

const CAPTION_LINES = [
    "So the subnet mask decides how many hosts we can address.",
    "Let me share my screen and walk through the topology.",
    "Everyone can see the packet capture now, right?",
    "We will cover VLSM right after this example.",
    "Please raise your hand if the lab file is not opening.",
];

type Props = {
    roomId: string;
    displayName: string;
    localStream: MediaStream | null;
    micOn: boolean;
    camOn: boolean;
    invitedUserIds: string[];
    onToggleMic: () => void;
    onToggleCam: () => void;
    onLeave: () => void;
};

export default function MeetingRoom({
    roomId, displayName, localStream, micOn, camOn, invitedUserIds,
    onToggleMic, onToggleCam, onLeave,
}: Props) {
    const [participants, setParticipants] = useState<Participant[]>([
        { id: "me", name: displayName, isYou: true, host: true, micOn, camOn, signal: 3 },
    ]);
    const [panel, setPanel] = useState<PanelTab>(null);
    const [layout, setLayout] = useState<MeetLayout>("auto");
    const [messages, setMessages] = useState<MeetChatMessage[]>([]);
    const [reactions, setReactions] = useState<FloatingReaction[]>([]);
    const [reactionBarOpen, setReactionBarOpen] = useState(false);
    const [handRaised, setHandRaised] = useState(false);
    const [captionsOn, setCaptionsOn] = useState(false);
    const [caption, setCaption] = useState<{ name: string; text: string } | null>(null);
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [invited, setInvited] = useState<string[]>(invitedUserIds);
    const [moreEl, setMoreEl] = useState<null | HTMLElement>(null);
    const [layoutEl, setLayoutEl] = useState<null | HTMLElement>(null);
    const [seconds, setSeconds] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);

    const shellRef = useRef<HTMLDivElement>(null);
    const screenRef = useVideoStream(screenStream);

    /* Keep my tile in sync with the device state owned by the page. */
    useEffect(() => {
        setParticipants((prev) => prev.map((p) => (p.isYou ? { ...p, micOn, camOn, handRaised } : p)));
    }, [micOn, camOn, handRaised]);

    useEffect(() => {
        const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    /* Simulated attendees trickle in. */
    useEffect(() => {
        const pool = (invitedUserIds.length > 0 ? invitedUserIds : ["u1", "u8", "u9", "u7"])
            .map((id) => USERS[id])
            .filter(Boolean)
            .slice(0, 4);

        const timers = pool.map((user, i) =>
            setTimeout(() => {
                setParticipants((prev) =>
                    prev.some((p) => p.id === user.id)
                        ? prev
                        : [...prev, {
                            id: user.id,
                            name: user.name,
                            avatar: user.avatar,
                            micOn: i % 3 !== 1,
                            camOn: false,
                            signal: 2 + (i % 2),
                        }],
                );
                toast.success(`${user.name} joined`, { id: `join-${user.id}` });
            }, 3500 + i * 5200),
        );

        return () => timers.forEach(clearTimeout);
    }, [invitedUserIds]);

    /* Random active speaker + occasional in-call chatter. */
    useEffect(() => {
        const speak = setInterval(() => {
            setParticipants((prev) => {
                const others = prev.filter((p) => !p.isYou && p.micOn);
                if (others.length === 0) return prev.map((p) => ({ ...p, speaking: false }));
                const pick = others[Math.floor(Math.random() * others.length)];
                return prev.map((p) => ({ ...p, speaking: p.id === pick.id }));
            });
        }, 3200);

        return () => clearInterval(speak);
    }, []);

    useEffect(() => {
        if (!captionsOn) {
            setCaption(null);
            return;
        }
        const timer = setInterval(() => {
            setParticipants((prev) => {
                const speaker = prev.find((p) => p.speaking) ?? prev.find((p) => !p.isYou);
                setCaption({
                    name: speaker?.name ?? displayName,
                    text: CAPTION_LINES[Math.floor(Math.random() * CAPTION_LINES.length)],
                });
                return prev;
            });
        }, 4200);
        return () => clearInterval(timer);
    }, [captionsOn, displayName]);

    const presenting = Boolean(screenStream);
    const pinned = participants.find((p) => p.pinned) ?? null;

    const pushReaction = (emoji: string) => {
        const item: FloatingReaction = { id: meetUid("r"), emoji, name: displayName, offset: reactionOffset() };
        setReactions((prev) => [...prev, item]);
        setTimeout(() => setReactions((prev) => prev.filter((r) => r.id !== item.id)), 3000);
    };

    const startPresenting = async () => {
        if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
            toast.error("Screen sharing is not supported in this browser");
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
            setScreenStream(stream);
            setParticipants((prev) => prev.map((p) => (p.isYou ? { ...p, presenting: true } : p)));
            stream.getVideoTracks()[0]?.addEventListener("ended", () => stopPresenting());
            toast.success("You are presenting to everyone");
        } catch {
            toast.error("Screen share was cancelled");
        }
    };

    const stopPresenting = () => {
        setScreenStream((prev) => {
            prev?.getTracks().forEach((track) => track.stop());
            return null;
        });
        setParticipants((prev) => prev.map((p) => (p.isYou ? { ...p, presenting: false } : p)));
    };

    useEffect(() => () => {
        screenStream?.getTracks().forEach((track) => track.stop());
    }, []);

    const sendMessage = (text: string) => {
        setMessages((prev) => [
            ...prev,
            { id: meetUid("msg"), senderId: "me", senderName: "You", text, time: clockLabel() },
        ]);

        const responder = participants.find((p) => !p.isYou);
        if (responder) {
            setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    { id: meetUid("msg"), senderId: responder.id, senderName: responder.name, text: "Noted, thanks!", time: clockLabel() },
                ]);
            }, 2200);
        }
    };

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await shellRef.current?.requestFullscreen();
                setFullscreen(true);
            } else {
                await document.exitFullscreen();
                setFullscreen(false);
            }
        } catch {
            toast.error("Fullscreen was blocked");
        }
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(meetUrl(roomId));
            toast.success("Joining info copied");
        } catch {
            toast.error("Could not copy the link");
        }
    };

    const effectiveLayout: MeetLayout = presenting || pinned ? "spotlight" : layout;
    const others = participants.filter((p) => !p.isYou);
    const columns = useMemo(() => {
        const n = participants.length;
        if (n <= 1) return 1;
        if (n <= 4) return 2;
        if (n <= 9) return 3;
        return 4;
    }, [participants.length]);

    const spotlightTarget = pinned ?? participants.find((p) => p.speaking) ?? others[0] ?? participants[0];

    return (
        <Box ref={shellRef} sx={{ height: "100vh", display: "flex", flexDirection: "column", background: M.bg, overflow: "hidden" }}>
            {/* Stage */}
            <Box sx={{ flex: 1, display: "flex", gap: 1.2, p: { xs: 1, md: 1.6 }, minHeight: 0 }}>
                <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1.2, position: "relative" }}>
                    {presenting ? (
                        <>
                            <Box sx={{ flex: 1, minHeight: 0, borderRadius: "12px", overflow: "hidden", border: `1px solid ${M.border}`, background: "#000000", position: "relative" }}>
                                <Box component="video" ref={screenRef} autoPlay muted playsInline sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                <Box sx={{ position: "absolute", top: 10, left: 10, px: 1, py: 0.3, borderRadius: "6px", background: M.accentDark, display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <MdPresentToAll size={13} color={M.text} />
                                    <Typography sx={{ fontSize: "0.65rem", color: M.text, fontWeight: 700 }}>You are presenting</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 0.5, ...meetScrollbarSx }}>
                                {participants.map((p) => (
                                    <Box key={p.id} sx={{ width: 150, flexShrink: 0, height: 92 }}>
                                        <ParticipantTile
                                            participant={p}
                                            stream={p.isYou ? localStream : null}
                                            compact
                                            onPin={() => setParticipants((prev) => prev.map((x) => ({ ...x, pinned: x.id === p.id ? !x.pinned : false })))}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        </>
                    ) : effectiveLayout === "spotlight" ? (
                        <>
                            <Box sx={{ flex: 1, minHeight: 0 }}>
                                <ParticipantTile
                                    participant={spotlightTarget}
                                    stream={spotlightTarget.isYou ? localStream : null}
                                    onPin={() => setParticipants((prev) => prev.map((x) => ({ ...x, pinned: false })))}
                                />
                            </Box>
                            <Box sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 0.5, ...meetScrollbarSx }}>
                                {participants.filter((p) => p.id !== spotlightTarget.id).map((p) => (
                                    <Box key={p.id} sx={{ width: 150, flexShrink: 0, height: 92 }}>
                                        <ParticipantTile
                                            participant={p}
                                            stream={p.isYou ? localStream : null}
                                            compact
                                            onPin={() => setParticipants((prev) => prev.map((x) => ({ ...x, pinned: x.id === p.id ? !x.pinned : false })))}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        </>
                    ) : effectiveLayout === "sidebar" ? (
                        <Box sx={{ flex: 1, display: "flex", gap: 1.2, minHeight: 0 }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <ParticipantTile participant={spotlightTarget} stream={spotlightTarget.isYou ? localStream : null} />
                            </Box>
                            <Box sx={{ width: 168, display: "flex", flexDirection: "column", gap: 1, overflowY: "auto", ...meetScrollbarSx }}>
                                {participants.filter((p) => p.id !== spotlightTarget.id).map((p) => (
                                    <Box key={p.id} sx={{ height: 104, flexShrink: 0 }}>
                                        <ParticipantTile participant={p} stream={p.isYou ? localStream : null} compact />
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                flex: 1, minHeight: 0, display: "grid", gap: 1.2,
                                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                                gridAutoRows: "1fr",
                            }}
                        >
                            <AnimatePresence initial={false}>
                                {participants.map((p) => (
                                    <ParticipantTile
                                        key={p.id}
                                        participant={p}
                                        stream={p.isYou ? localStream : null}
                                        onPin={() => setParticipants((prev) => prev.map((x) => ({ ...x, pinned: x.id === p.id ? !x.pinned : false })))}
                                    />
                                ))}
                            </AnimatePresence>
                        </Box>
                    )}

                    {/* Lonely state */}
                    {participants.length === 1 && !presenting && (
                        <Box
                            sx={{
                                position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
                                display: "flex", alignItems: "center", gap: 1, px: 1.6, py: 1,
                                background: M.surface, border: `1px solid ${M.border}`, borderRadius: "10px",
                            }}
                        >
                            <MdLock size={14} color={M.textMuted} />
                            <Typography sx={{ fontSize: "0.72rem", color: M.textSoft }}>You are the only one here</Typography>
                            <Typography
                                onClick={copyLink}
                                sx={{ fontSize: "0.72rem", color: M.accentSoft, fontWeight: 700, cursor: "pointer" }}
                            >
                                Share invite
                            </Typography>
                        </Box>
                    )}

                    {/* Captions */}
                    <AnimatePresence>
                        {captionsOn && caption && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                style={{ position: "absolute", left: "50%", bottom: 76, transform: "translateX(-50%)", maxWidth: "80%" }}
                            >
                                <Box sx={{ px: 1.6, py: 0.9, borderRadius: "8px", background: "rgba(8,12,24,0.88)", border: `1px solid ${M.border}` }}>
                                    <Typography sx={{ fontSize: "0.66rem", color: M.accentSoft, fontWeight: 700 }}>{caption.name}</Typography>
                                    <Typography sx={{ fontSize: "0.8rem", color: M.text }}>{caption.text}</Typography>
                                </Box>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Floating reactions */}
                    <Box sx={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "100%", pointerEvents: "none", overflow: "hidden" }}>
                        <AnimatePresence>
                            {reactions.map((r) => (
                                <motion.div
                                    key={r.id}
                                    initial={{ opacity: 0, y: 0, scale: 0.6 }}
                                    animate={{ opacity: 1, y: -220, scale: 1.2 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 2.8, ease: "easeOut" }}
                                    style={{ position: "absolute", bottom: 20, left: `calc(50% + ${r.offset}px)`, fontSize: 30 }}
                                >
                                    {r.emoji}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </Box>
                </Box>

                {/* Side panel */}
                <AnimatePresence>
                    {panel && (
                        <SidePanel
                            tab={panel}
                            roomId={roomId}
                            participants={participants}
                            messages={messages}
                            onClose={() => setPanel(null)}
                            onSendMessage={sendMessage}
                            onInvite={() => setInviteOpen(true)}
                            onPin={(id) => setParticipants((prev) => prev.map((x) => ({ ...x, pinned: x.id === id ? !x.pinned : false })))}
                            onMuteParticipant={(id) => setParticipants((prev) => prev.map((x) => (x.id === id ? { ...x, micOn: false } : x)))}
                        />
                    )}
                </AnimatePresence>
            </Box>

            {/* Control bar */}
            <Box
                sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 1, px: { xs: 1, md: 2.4 }, py: 1.2, borderTop: `1px solid ${M.borderSoft}`,
                }}
            >
                <Box sx={{ display: "none", alignItems: "center", gap: 1, minWidth: 190, "@media (min-width:900px)": { display: "flex" } }}>
                    <Typography sx={{ fontSize: "0.76rem", color: M.text, fontWeight: 600 }}>{elapsedLabel(seconds)}</Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: M.textMuted }}>|</Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: M.textMuted, fontFamily: "monospace" }}>{roomId}</Typography>
                    <Tooltip title="Copy joining info" arrow>
                        <IconButton size="small" onClick={copyLink} sx={{ color: M.textMuted }}><MdContentCopy size={14} /></IconButton>
                    </Tooltip>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: { xs: 0.6, md: 1 }, flex: 1, position: "relative" }}>
                    <AnimatePresence>
                        {reactionBarOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.94 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.94 }}
                                style={{
                                    position: "absolute", bottom: "calc(100% + 10px)",
                                    display: "flex", gap: 6, padding: "8px 12px", borderRadius: 999,
                                    background: M.surface, border: `1px solid ${M.border}`, zIndex: 10,
                                }}
                            >
                                {REACTIONS.map((emoji) => (
                                    <motion.button
                                        key={emoji}
                                        type="button"
                                        whileHover={{ scale: 1.3 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => { pushReaction(emoji); setReactionBarOpen(false); }}
                                        style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 20, lineHeight: "26px" }}
                                    >
                                        {emoji}
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <CircleButton active={micOn} danger={!micOn} title={micOn ? "Turn off microphone" : "Turn on microphone"} onClick={onToggleMic}>
                        {micOn ? <MdMic size={20} /> : <MdMicOff size={20} />}
                    </CircleButton>
                    <CircleButton active={camOn} danger={!camOn} title={camOn ? "Turn off camera" : "Turn on camera"} onClick={onToggleCam}>
                        {camOn ? <MdVideocam size={20} /> : <MdVideocamOff size={20} />}
                    </CircleButton>
                    <CircleButton
                        active={captionsOn}
                        title={captionsOn ? "Turn off captions" : "Turn on captions"}
                        onClick={() => setCaptionsOn((v) => !v)}
                    >
                        <MdClosedCaption size={20} />
                    </CircleButton>
                    <CircleButton active={reactionBarOpen} title="Send a reaction" onClick={() => setReactionBarOpen((v) => !v)}>
                        <MdEmojiEmotions size={20} />
                    </CircleButton>
                    <CircleButton
                        active={presenting}
                        title={presenting ? "Stop presenting" : "Present now"}
                        onClick={() => (presenting ? stopPresenting() : void startPresenting())}
                    >
                        {presenting ? <MdCancelPresentation size={20} /> : <MdPresentToAll size={20} />}
                    </CircleButton>
                    <CircleButton active={handRaised} title={handRaised ? "Lower hand" : "Raise hand"} onClick={() => setHandRaised((v) => !v)}>
                        <MdBackHand size={19} />
                    </CircleButton>
                    <CircleButton title="More options" onClick={(e) => setMoreEl(e.currentTarget)}>
                        <MdMoreVert size={20} />
                    </CircleButton>

                    <Tooltip title="Leave call" arrow>
                        <IconButton
                            onClick={onLeave}
                            sx={{
                                width: 56, height: 44, borderRadius: "22px", ml: 0.5,
                                background: M.danger, color: M.text,
                                "&:hover": { background: M.dangerDark },
                            }}
                        >
                            <MdCallEnd size={22} />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, justifyContent: "flex-end", minWidth: { xs: 0, md: 190 } }}>
                    <Tooltip title="Meeting details" arrow>
                        <IconButton size="small" onClick={() => setPanel((p) => (p === "info" ? null : "info"))} sx={{ color: panel === "info" ? M.accentSoft : M.textSoft }}>
                            <MdInfoOutline size={19} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="People" arrow>
                        <IconButton size="small" onClick={() => setPanel((p) => (p === "people" ? null : "people"))} sx={{ color: panel === "people" ? M.accentSoft : M.textSoft }}>
                            <Box sx={{ position: "relative", display: "flex" }}>
                                <MdPeople size={20} />
                                <Box sx={{ position: "absolute", top: -6, right: -8, px: 0.4, borderRadius: "8px", background: M.accentDark }}>
                                    <Typography sx={{ fontSize: "0.55rem", fontWeight: 700, color: M.text }}>{participants.length}</Typography>
                                </Box>
                            </Box>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="In-call messages" arrow>
                        <IconButton size="small" onClick={() => setPanel((p) => (p === "chat" ? null : "chat"))} sx={{ color: panel === "chat" ? M.accentSoft : M.textSoft }}>
                            <MdChat size={19} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Activities" arrow>
                        <IconButton size="small" onClick={() => setPanel((p) => (p === "activities" ? null : "activities"))} sx={{ color: panel === "activities" ? M.accentSoft : M.textSoft }}>
                            <MdExtension size={19} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* More menu */}
            <Menu
                anchorEl={moreEl}
                open={Boolean(moreEl)}
                onClose={() => setMoreEl(null)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                transformOrigin={{ vertical: "bottom", horizontal: "center" }}
                slotProps={{
                    paper: {
                        sx: {
                            background: M.surface, border: `1px solid ${M.border}`, borderRadius: "10px", color: M.text, minWidth: 210,
                            "& .MuiMenuItem-root": { fontSize: "0.76rem", py: 0.8 },
                            "& .MuiListItemIcon-root": { minWidth: 28, color: M.textSoft },
                        },
                    },
                }}
            >
                <MenuItem onClick={(e) => { setMoreEl(null); setLayoutEl(e.currentTarget); }}>
                    <ListItemIcon><MdGridView size={16} /></ListItemIcon>Change layout
                </MenuItem>
                <MenuItem onClick={() => { setMoreEl(null); void toggleFullscreen(); }}>
                    <ListItemIcon>{fullscreen ? <MdFullscreenExit size={16} /> : <MdFullscreen size={16} />}</ListItemIcon>
                    {fullscreen ? "Exit full screen" : "Full screen"}
                </MenuItem>
                <MenuItem onClick={() => { setMoreEl(null); setInviteOpen(true); }}>
                    <ListItemIcon><MdPeople size={16} /></ListItemIcon>Add people
                </MenuItem>
                <MenuItem onClick={() => { setMoreEl(null); void copyLink(); }}>
                    <ListItemIcon><MdContentCopy size={16} /></ListItemIcon>Copy joining info
                </MenuItem>
                <MenuItem disabled>
                    <ListItemIcon><MdSignalCellularAlt size={16} /></ListItemIcon>Troubleshooting &amp; help
                </MenuItem>
            </Menu>

            {/* Layout menu */}
            <Menu
                anchorEl={layoutEl}
                open={Boolean(layoutEl)}
                onClose={() => setLayoutEl(null)}
                slotProps={{
                    paper: {
                        sx: {
                            background: M.surface, border: `1px solid ${M.border}`, borderRadius: "10px", color: M.text, minWidth: 180,
                            "& .MuiMenuItem-root": { fontSize: "0.76rem", py: 0.8 },
                            "& .MuiListItemIcon-root": { minWidth: 28, color: M.textSoft },
                        },
                    },
                }}
            >
                {([
                    { key: "auto", label: "Auto", icon: <MdAutoAwesomeMosaic size={16} /> },
                    { key: "tiled", label: "Tiled", icon: <MdGridView size={16} /> },
                    { key: "spotlight", label: "Spotlight", icon: <MdPushPin size={16} /> },
                    { key: "sidebar", label: "Sidebar", icon: <MdViewSidebar size={16} /> },
                ] as const).map((item) => (
                    <MenuItem
                        key={item.key}
                        selected={layout === item.key}
                        onClick={() => { setLayout(item.key); setLayoutEl(null); }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>{item.label}
                    </MenuItem>
                ))}
            </Menu>

            <InviteDialog
                open={inviteOpen}
                roomId={roomId}
                invited={invited}
                onClose={() => setInviteOpen(false)}
                onDirectInvite={(userIds) => {
                    setInvited((prev) => [...new Set([...prev, ...userIds])]);
                    const names = userIds.map((id) => USERS[id]?.name ?? "Someone");
                    toast.success(`Invitation sent to ${names.join(", ")}`);
                    userIds.forEach((id, i) => {
                        setTimeout(() => {
                            const user = USERS[id];
                            if (!user) return;
                            setParticipants((prev) =>
                                prev.some((p) => p.id === id)
                                    ? prev
                                    : [...prev, { id, name: user.name, avatar: user.avatar, micOn: true, camOn: false, signal: 3 }],
                            );
                            toast.success(`${user.name} joined`, { id: `join-${id}` });
                        }, 4000 + i * 2600);
                    });
                }}
            />
        </Box>
    );
}

function CircleButton({
    children, title, onClick, active, danger,
}: {
    children: React.ReactNode;
    title: string;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    active?: boolean;
    danger?: boolean;
}) {
    return (
        <Tooltip title={title} arrow>
            <IconButton
                onClick={onClick}
                sx={{
                    width: 44, height: 44,
                    background: danger ? M.danger : active ? M.accentDark : M.surfaceAlt,
                    color: M.text,
                    border: `1px solid ${danger ? M.danger : active ? M.accent : M.border}`,
                    "&:hover": { background: danger ? M.dangerDark : active ? M.accent : M.raised },
                    transition: "background 0.15s",
                }}
            >
                {children}
            </IconButton>
        </Tooltip>
    );
}
