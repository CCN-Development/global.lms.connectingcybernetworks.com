"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Dialog, DialogContent, DialogTitle, Menu, MenuItem } from "@mui/material";
import toast from "react-hot-toast";

import StudentLayout from "@/layouts/StudentLayout";
import { useAuth } from "@/contexts/AuthContext";
import { C, FONT_LATO, gradientBorder, menuPaperSx, t } from "@/components/chats/theme";
import { USERS } from "@/components/chats/data";
import ChatAvatar from "@/components/chats/ChatAvatar";
import ChatIcon from "@/components/chats/ChatIcon";
import { RadioDot, ToggleSwitch } from "@/components/chats/ChatControls";

const STORAGE_KEY = "ccn-chat-preferences";

type Prefs = {
    hidePhone: boolean;
    hideEmail: boolean;
    whoCanView: string;
    showOnline: boolean;
    lastSeen: string;
    whoCanMessage: string;
    autoDownload: string;
    saveFiles: boolean;
    trainerMessages: boolean;
    batchMessages: boolean;
    announcements: boolean;
    discussionReplies: boolean;
    examNotifications: boolean;
    blocked: string[];
};

const DEFAULTS: Prefs = {
    hidePhone: true,
    hideEmail: false,
    whoCanView: "Everyone in my batch",
    showOnline: false,
    lastSeen: "Everyone",
    whoCanMessage: "Everyone in my batch",
    autoDownload: "Wi-Fi Only",
    saveFiles: false,
    trainerMessages: true,
    batchMessages: true,
    announcements: true,
    discussionReplies: false,
    examNotifications: true,
    blocked: ["u4", "u7", "u10"],
};

const VIEW_OPTIONS = ["Everyone in my batch", "Trainers & RM only", "Nobody"];
const MESSAGE_OPTIONS = ["Everyone in my batch", "Trainers & RM only", "Everyone"];
const LAST_SEEN_OPTIONS = ["Everyone", "My contacts", "Nobody"];
const DOWNLOAD_OPTIONS = ["Wi-Fi Only", "Wi-Fi & Mobile data", "Never"];

const cardSx = {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    p: "24px",
    borderRadius: "24px",
    backdropFilter: "blur(12px)",
    backgroundImage: "linear-gradient(175deg, rgba(0,0,0,0.387) 1.34%, rgba(10,9,9,0.282) 48.72%, rgba(102,102,102,0.009) 96.09%)",
    boxShadow: "inset 0 3px 6px rgba(255,255,255,0.16)",
    "&::before": gradientBorder(),
} as const;

const glassBtn = {
    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", pl: "16px", pr: "12px", py: "8px",
    borderRadius: "8px", border: "none", cursor: "pointer", backdropFilter: "blur(12px)", background: "rgba(38,38,38,0.44)",
    ...t("lato", 16, 24, 500, C.text), whiteSpace: "nowrap", flexShrink: 0,
    transition: "background 0.15s ease", "&:hover": { background: "rgba(64,64,64,0.6)" },
} as const;

function CardLabel({ children }: { children: React.ReactNode }) {
    return <Box sx={{ ...t("lato", 12, 18, 500, C.textFaint), position: "relative" }}>{children}</Box>;
}

function SettingRow({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
    return (
        <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: "24px", width: "100%" }}>
            <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                <Box sx={t("lato", 14, 21, 500, C.textBody)}>{title}</Box>
                <Box sx={t("lato", 12, 18, 400, C.textPlaceholder)}>{description}</Box>
            </Box>
            {children}
        </Box>
    );
}

function RadioGroup({ question, options, value, onChange }: { question: string; options: string[]; value: string; onChange: (v: string) => void }) {
    return (
        <Box role="radiogroup" aria-label={question} sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "16px" }}>
            <Box sx={t("lato", 14, 21, 500, C.textSoft)}>{question}</Box>
            {options.map((option) => (
                <Box
                    key={option}
                    component="button"
                    type="button"
                    role="radio"
                    aria-checked={value === option}
                    onClick={() => onChange(option)}
                    sx={{ display: "flex", alignItems: "center", gap: "12px", p: 0, border: "none", background: "transparent", cursor: "pointer", width: "fit-content", ...t("lato", 14, 21, 500, C.textStrong) }}
                >
                    <RadioDot selected={value === option} />
                    {option}
                </Box>
            ))}
        </Box>
    );
}

function SelectButton({ value, options, onChange, label }: { value: string; options: string[]; onChange: (v: string) => void; label: string }) {
    const [el, setEl] = useState<null | HTMLElement>(null);
    return (
        <>
            <Box component="button" type="button" aria-label={label} aria-haspopup="listbox" onClick={(e: React.MouseEvent<HTMLElement>) => setEl(e.currentTarget)} sx={glassBtn}>
                {value}
                <ChatIcon name="chevron-24" size={24} color={C.textStrong} />
            </Box>
            <Menu
                anchorEl={el}
                open={Boolean(el)}
                onClose={() => setEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: { ...menuPaperSx, mt: "4px" } } }}
            >
                {options.map((option) => (
                    <MenuItem key={option} selected={option === value} onClick={() => { onChange(option); setEl(null); }} sx={{ fontFamily: `${FONT_LATO} !important` }}>
                        {option}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}

export default function ChatProfilePage() {
    const router = useRouter();
    const { user } = useAuth();
    const showRail = !user || user.role === "Student";

    const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
    const [loaded, setLoaded] = useState(false);
    const [manageOpen, setManageOpen] = useState(false);

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (stored) setPrefs({ ...DEFAULTS, ...(JSON.parse(stored) as Partial<Prefs>) });
        } catch {
            /* corrupted preferences fall back to defaults */
        }
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (loaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    }, [prefs, loaded]);

    const set = <K extends keyof Prefs>(key: K, value: Prefs[K]) => setPrefs((p) => ({ ...p, [key]: value }));

    const notifications: { key: "trainerMessages" | "batchMessages" | "announcements" | "discussionReplies" | "examNotifications"; title: string; description: string }[] = [
        { key: "trainerMessages", title: "Trainer Messages", description: "Automatically download images, videos, and documents received in chats." },
        { key: "batchMessages", title: "Batch Messages", description: "Notifications for messages in your batch group channels." },
        { key: "announcements", title: "Announcements", description: "Platform-wide and batch-specific announcements from admins." },
        { key: "discussionReplies", title: "Discussion Replies", description: "Replies to threads and discussions you're participating in." },
        { key: "examNotifications", title: "Exam Notifications", description: "Reminders and results for scheduled assessments and exams." },
    ];

    return (
        <StudentLayout fullBleed lockCollapsed hideSidebar={!showRail}>
            <Box
                sx={{
                    flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px",
                    scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" }, pb: "24px",
                }}
            >
                {/* Header */}
                <Box sx={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                    <Box
                        component="button"
                        type="button"
                        aria-label="Back to chats"
                        onClick={() => router.push("/dashboard/chats")}
                        sx={{
                            width: 44, height: 44, p: 0, borderRadius: "50px", cursor: "pointer", flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(25px)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            background: "linear-gradient(180deg, rgba(227,233,248,0.08) 0%, rgba(134,137,146,0.04) 100%)",
                            "&:hover": { background: "linear-gradient(180deg, rgba(227,233,248,0.16) 0%, rgba(134,137,146,0.1) 100%)" },
                        }}
                    >
                        <ChatIcon name="back" size={24} color="#fff" />
                    </Box>
                    <Box component="h1" sx={{ m: 0, ...t("poppins", 20, 30, 500, C.text) }}>My Profile</Box>
                </Box>

                <Box sx={{ width: "100%", maxWidth: 900, mx: "auto", display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Identity + personal information */}
                    <Box sx={{ display: "flex", gap: "24px", alignItems: "stretch", flexDirection: { xs: "column", md: "row" } }}>
                        <Box sx={{ ...cardSx, width: { xs: "100%", md: 279 }, flexShrink: 0, alignItems: "center", gap: "23px" }}>
                            <ChatAvatar name="Aanchal Ravi Gupta" avatar="/chats/av-falguni.png" size={120} />
                            <Box sx={{ position: "relative", ...t("lato", 18, 27, 700, C.text), textAlign: "center" }}>Aanchal Ravi Gupta</Box>
                        </Box>

                        <Box sx={{ ...cardSx, flex: 1, minWidth: 0 }}>
                            <CardLabel>PERSONAL INFORMATION</CardLabel>
                            <SettingRow title="Hide Phone Number" description="Your personal phone number will never be visible to students. Communication happens securely through the LMS.">
                                <ToggleSwitch checked={prefs.hidePhone} onChange={(v) => set("hidePhone", v)} label="Hide phone number" />
                            </SettingRow>
                            <SettingRow title="Hide Email Address" description="Hide your personal email from other students within the platform.">
                                <ToggleSwitch checked={prefs.hideEmail} onChange={(v) => set("hideEmail", v)} label="Hide email address" />
                            </SettingRow>
                        </Box>
                    </Box>

                    {/* Profile visibility */}
                    <Box sx={cardSx}>
                        <CardLabel>PROFILE VISIBILITY</CardLabel>
                        <RadioGroup question="Who can view my profile?" options={VIEW_OPTIONS} value={prefs.whoCanView} onChange={(v) => set("whoCanView", v)} />
                        <SettingRow title="Show Online Status" description="Allow others to see when you're currently active on the platform.">
                            <ToggleSwitch checked={prefs.showOnline} onChange={(v) => set("showOnline", v)} label="Show online status" />
                        </SettingRow>
                        <SettingRow title="Last Seen" description="Control who can see when you last used the platform.">
                            <SelectButton label="Last seen visibility" value={prefs.lastSeen} options={LAST_SEEN_OPTIONS} onChange={(v) => set("lastSeen", v)} />
                        </SettingRow>
                        <SettingRow title="Reported Conversations" description="Review conversations you've flagged for review.">
                            <Box
                                component="button"
                                type="button"
                                onClick={() => toast("You haven't reported any conversations yet")}
                                sx={{ ...glassBtn, background: "#ffefdc", color: "#fb8600", "&:hover": { background: "#ffe3c2" } }}
                            >
                                <ChatIcon name="alert-triangle" size={24} color="#FB8600" />
                                View Report
                            </Box>
                        </SettingRow>
                    </Box>

                    {/* Messaging */}
                    <Box sx={cardSx}>
                        <CardLabel>MESSAGING</CardLabel>
                        <RadioGroup question="Who can message me?" options={MESSAGE_OPTIONS} value={prefs.whoCanMessage} onChange={(v) => set("whoCanMessage", v)} />
                        <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: "24px" }}>
                            <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                                <Box sx={t("lato", 14, 21, 500, C.textBody)}>Blocked Users</Box>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                                    {prefs.blocked.length === 0 && <Box sx={t("lato", 12, 18, 400, C.textPlaceholder)}>You haven&apos;t blocked anyone.</Box>}
                                    {prefs.blocked.map((id) => (
                                        <Box
                                            key={id}
                                            sx={{
                                                display: "flex", alignItems: "center", gap: "8px", pl: "8px", pr: "12px", py: "4px", borderRadius: "999px",
                                                border: `1px solid ${C.chipBorder}`, backdropFilter: "blur(12px)", ...t("lato", 14, 21, 500, C.textSoft),
                                            }}
                                        >
                                            <ChatAvatar name={USERS[id]?.name ?? "?"} avatar={USERS[id]?.avatar} size={20} />
                                            {USERS[id]?.name}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                            <Box component="button" type="button" onClick={() => setManageOpen(true)} sx={{ ...glassBtn, pl: "16px", pr: "12px" }}>
                                <ChatIcon name="users" size={20} color={C.textSoft} />
                                Manage
                            </Box>
                        </Box>
                    </Box>

                    {/* Media & downloads */}
                    <Box sx={cardSx}>
                        <CardLabel>MEDIA &amp; DOWNLOADS</CardLabel>
                        <SettingRow title="Auto Download Media" description="Get notified when a trainer sends you a direct message.">
                            <SelectButton label="Auto download media" value={prefs.autoDownload} options={DOWNLOAD_OPTIONS} onChange={(v) => set("autoDownload", v)} />
                        </SettingRow>
                        <SettingRow title="Save Files Automatically" description="Automatically save received files to your device's download folder.">
                            <ToggleSwitch checked={prefs.saveFiles} onChange={(v) => set("saveFiles", v)} label="Save files automatically" />
                        </SettingRow>
                    </Box>

                    {/* Notifications */}
                    <Box sx={cardSx}>
                        <CardLabel>NOTIFICATIONS</CardLabel>
                        {notifications.map((n) => (
                            <SettingRow key={n.key} title={n.title} description={n.description}>
                                <ToggleSwitch checked={prefs[n.key]} onChange={(v) => set(n.key, v)} label={n.title} />
                            </SettingRow>
                        ))}
                    </Box>
                </Box>
            </Box>

            <Dialog
                open={manageOpen}
                onClose={() => setManageOpen(false)}
                maxWidth="xs"
                fullWidth
                slotProps={{ paper: { sx: { background: C.panelSolid, backgroundImage: "none", border: `1px solid ${C.border}`, borderRadius: "16px", color: C.text } } }}
            >
                <DialogTitle sx={{ ...t("poppins", 20, 30, 500, C.text) }}>Blocked users</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: "12px", pb: "24px" }}>
                    {prefs.blocked.length === 0 && <Box sx={t("lato", 14, 21, 500, C.textMuted)}>No blocked users.</Box>}
                    {prefs.blocked.map((id) => (
                        <Box key={id} sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <ChatAvatar name={USERS[id]?.name ?? "?"} avatar={USERS[id]?.avatar} size={36} />
                            <Box sx={{ flex: 1, minWidth: 0, ...t("lato", 14, 21, 500, C.text) }}>{USERS[id]?.name}</Box>
                            <Box
                                component="button"
                                type="button"
                                onClick={() => set("blocked", prefs.blocked.filter((b) => b !== id))}
                                sx={{ ...glassBtn, ...t("lato", 14, 21, 500, C.text), px: "12px", py: "4px" }}
                            >
                                Unblock
                            </Box>
                        </Box>
                    ))}
                </DialogContent>
            </Dialog>
        </StudentLayout>
    );
}
