"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Box, Menu, MenuItem, Typography } from "@mui/material";
import { Ban, ShieldCheck, Volume2, VolumeX } from "lucide-react";
import toast from "react-hot-toast";
import { COMMUNITY_ROLE_LABELS, COMMUNITY_ROLES, type CommunityAdminMember, type CommunityRole, type MemberStatus } from "@/contexts/CommunityContext";
import { CC, longDate, timeAgo } from "../community-data";
import { ActionButton, AuthorRow, ChoiceChip, ConfirmModal, dropdownItemSx, dropdownPaperSx, EmptyCard, FieldInput, FilterButton, GlassCard, ReasonModal, StatusChip, TEXT } from "../community-ui";
import { useCommunity } from "../CommunityContext";
import { PanelLoading, PanelShell } from "./ManagePanel";
import { MuteModal } from "./ModerationModals";

const STATUS_TABS: { id: MemberStatus | "all"; label: string }[] = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "muted", label: "Muted" },
    { id: "banned", label: "Banned" },
];

const PAGE = 30;

export default function MembersPanel() {
    const { api, can } = useCommunity();
    const { adminMembers, adminMembersMeta, loadingAdmin, getAdminMembers, muteMember, unmuteMember, banMember, unbanMember } = api;
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [role, setRole] = useState<CommunityRole | null>(null);
    const [status, setStatus] = useState<MemberStatus | "all">("all");
    const [roleAnchor, setRoleAnchor] = useState<HTMLElement | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [busy, setBusy] = useState(false);
    const [muteTarget, setMuteTarget] = useState<CommunityAdminMember | null>(null);
    const [banTarget, setBanTarget] = useState<CommunityAdminMember | null>(null);
    const [lift, setLift] = useState<{ member: CommunityAdminMember; kind: "unmute" | "unban" } | null>(null);

    useEffect(() => {
        const t = setTimeout(() => setQuery(search.trim()), 350);
        return () => clearTimeout(t);
    }, [search]);

    const params = useCallback(
        (page: number) => ({ q: query || undefined, role: role ?? undefined, status: status === "all" ? undefined : status, page, limit: PAGE }),
        [query, role, status],
    );

    useEffect(() => {
        let alive = true;
        void getAdminMembers(params(1)).then((res) => {
            if (!alive) return;
            setLoaded(true);
            if (!res.success) toast.error(res.message ?? "Couldn't load members");
        });
        return () => {
            alive = false;
        };
    }, [getAdminMembers, params]);

    const loadMore = () => {
        if (!adminMembersMeta?.hasMore || loadingAdmin) return;
        void getAdminMembers(params(adminMembersMeta.page + 1), { append: true });
    };

    const act = async (fn: () => Promise<{ success: boolean; message?: string | null }>, fallback: string) => {
        setBusy(true);
        const res = await fn();
        setBusy(false);
        if (!res.success) toast.error(res.message ?? fallback);
        else toast.success(res.message ?? "Done");
        return res.success;
    };

    const canBan = can("member.ban");
    const visible = adminMembers.filter((m) => (status === "all" || m.status === status) && (!role || m.role === role));

    return (
        <PanelShell
            view="members"
            title="Members"
            subtitle={adminMembersMeta ? `${adminMembersMeta.total} member${adminMembersMeta.total === 1 ? "" : "s"} you can see` : "Everyone in the community you look after."}
            toolbar={
                <>
                    <Box role="radiogroup" aria-label="Member status" sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {STATUS_TABS.map((t) => (
                            <ChoiceChip key={t.id} active={status === t.id} onClick={() => setStatus(t.id)}>
                                {t.label}
                            </ChoiceChip>
                        ))}
                    </Box>
                    <Box sx={{ display: "flex", gap: "8px", ml: { md: "auto" }, flexWrap: "wrap", width: { xs: "100%", md: "auto" } }}>
                        <FilterButton label="Filter by role" open={Boolean(roleAnchor)} onClick={(e) => setRoleAnchor(e.currentTarget)}>
                            {role ? COMMUNITY_ROLE_LABELS[role] : "All roles"}
                        </FilterButton>
                        <FieldInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name" aria-label="Search members" sx={{ height: 40, width: { xs: "100%", sm: 240 } }} />
                    </Box>
                    <Menu anchorEl={roleAnchor} open={Boolean(roleAnchor)} onClose={() => setRoleAnchor(null)} slotProps={{ paper: { sx: { ...dropdownPaperSx, minWidth: 220 } } }}>
                        {[null, ...COMMUNITY_ROLES].map((r) => (
                            <MenuItem
                                key={r ?? "all"}
                                selected={role === r}
                                onClick={() => {
                                    setRole(r);
                                    setRoleAnchor(null);
                                }}
                                sx={dropdownItemSx(role === r)}
                            >
                                {r ? COMMUNITY_ROLE_LABELS[r] : "All roles"}
                            </MenuItem>
                        ))}
                    </Menu>
                </>
            }
            onEndReached={loadMore}
            loadingMore={loadingAdmin && visible.length > 0}
        >
            {!loaded || (loadingAdmin && visible.length === 0) ? (
                <PanelLoading />
            ) : visible.length === 0 ? (
                <EmptyCard title="No members found" message="Try another name, role or status." />
            ) : (
                visible.map((m) => (
                    <MemberRow
                        key={m.id}
                        member={m}
                        canBan={canBan}
                        busy={busy}
                        onMute={() => setMuteTarget(m)}
                        onUnmute={() => setLift({ member: m, kind: "unmute" })}
                        onBan={() => setBanTarget(m)}
                        onUnban={() => setLift({ member: m, kind: "unban" })}
                    />
                ))
            )}

            <MuteModal
                member={muteTarget}
                busy={busy}
                onConfirm={async (input) => {
                    if (muteTarget && (await act(() => muteMember(muteTarget.id, input), "Couldn't mute the member"))) setMuteTarget(null);
                }}
                onClose={() => setMuteTarget(null)}
            />
            <ReasonModal
                open={Boolean(banTarget)}
                title={`Ban ${banTarget?.name ?? "member"}`}
                message="Banned members lose access to the community — they can't read, post or reply until unbanned."
                confirmLabel="Ban member"
                required
                danger
                busy={busy}
                onConfirm={async (reason) => {
                    if (banTarget && (await act(() => banMember(banTarget.id, reason), "Couldn't ban the member"))) setBanTarget(null);
                }}
                onClose={() => setBanTarget(null)}
            />
            <ConfirmModal
                open={Boolean(lift)}
                title={lift?.kind === "unban" ? "Lift ban?" : "Unmute member?"}
                message={`${lift?.member.name ?? "The member"} will be able to ${lift?.kind === "unban" ? "use the community" : "post, reply and vote"} again.`}
                confirmLabel={lift?.kind === "unban" ? "Lift ban" : "Unmute"}
                busy={busy}
                onConfirm={async () => {
                    if (!lift) return;
                    const ok = await act(() => (lift.kind === "unban" ? unbanMember(lift.member.id) : unmuteMember(lift.member.id)), "Couldn't update the member");
                    if (ok) setLift(null);
                }}
                onClose={() => setLift(null)}
            />
        </PanelShell>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: { xs: "flex-start", sm: "center" }, minWidth: 56 }}>
            <Typography sx={{ ...TEXT.med16, color: CC.white }}>{value}</Typography>
            <Typography sx={{ ...TEXT.reg12, color: CC.n400 }}>{label}</Typography>
        </Box>
    );
}

interface MemberRowProps {
    member: CommunityAdminMember;
    canBan: boolean;
    busy: boolean;
    onMute: () => void;
    onUnmute: () => void;
    onBan: () => void;
    onUnban: () => void;
}

function MemberRow({ member, canBan, busy, onMute, onUnmute, onBan, onUnban }: MemberRowProps) {
    const sanction =
        member.status === "muted"
            ? `Muted ${member.mutedUntil ? `until ${longDate(member.mutedUntil)}` : "until unmuted"}`
            : member.status === "banned"
              ? `Banned${member.bannedAt ? ` ${timeAgo(member.bannedAt)}` : ""}`
              : null;
    return (
        <GlassCard sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { xs: "stretch", md: "center" }, gap: "16px", flexShrink: 0, py: { xs: "16px", sm: "18px" } }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <AuthorRow author={member} />
                    {member.isStaff && <StatusChip label="Staff" color={CC.primary200} />}
                    {member.status !== "active" && <StatusChip label={member.status === "muted" ? "Muted" : "Banned"} color={member.status === "muted" ? "#FFAD4F" : CC.error} />}
                </Box>
                {sanction && (
                    <Typography sx={{ ...TEXT.reg12, color: CC.n400, pl: { xs: 0, sm: "42px" } }} suppressHydrationWarning>
                        {sanction}
                        {member.sanctionReason ? ` — ${member.sanctionReason}` : ""}
                    </Typography>
                )}
                <Typography sx={{ ...TEXT.reg12, color: CC.n500, pl: { xs: 0, sm: "42px" } }} suppressHydrationWarning>
                    Joined {longDate(member.joinedAt)}
                </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", flexShrink: 0 }}>
                <Stat label="Posts" value={member.stats.posts} />
                <Stat label="Replies" value={member.stats.replies} />
                <Stat label="Reputation" value={member.stats.reputation} />
            </Box>
            {member.canSanction ? (
                <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: { md: "flex-end" }, minWidth: { md: 200 } }}>
                    {member.status === "active" && (
                        <ActionButton tone="warning" disabled={busy} icon={<VolumeX size={18} />} onClick={onMute}>
                            Mute
                        </ActionButton>
                    )}
                    {member.status === "muted" && (
                        <ActionButton tone="success" disabled={busy} icon={<Volume2 size={18} />} onClick={onUnmute}>
                            Unmute
                        </ActionButton>
                    )}
                    {canBan && member.status !== "banned" && (
                        <ActionButton tone="danger" disabled={busy} icon={<Ban size={18} />} onClick={onBan}>
                            Ban
                        </ActionButton>
                    )}
                    {canBan && member.status === "banned" && (
                        <ActionButton tone="success" disabled={busy} icon={<ShieldCheck size={18} />} onClick={onUnban}>
                            Lift ban
                        </ActionButton>
                    )}
                </Box>
            ) : (
                <Box sx={{ minWidth: { md: 200 } }} />
            )}
        </GlassCard>
    );
}
