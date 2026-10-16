"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Box, ButtonBase, CircularProgress, Typography } from "@mui/material";
import { Archive, ArchiveRestore, Pencil, Plus, RefreshCw, Trash2, UserPlus, Users, X } from "lucide-react";
import toast from "react-hot-toast";
import type { CommunityAdminSpace, CommunityAuthor, CommunitySpaceModerator, PostingPolicy, SpaceScope } from "@/contexts/CommunityContext";
import { CC } from "../community-data";
import {
    ActionButton,
    AuthorRow,
    CheckRow,
    ChoiceChip,
    CommunityModal,
    ConfirmModal,
    EmptyCard,
    FieldInput,
    FormRow,
    GlassCard,
    LmsButton,
    StatusChip,
    TextArea,
    TEXT,
} from "../community-ui";
import { useCommunity } from "../CommunityContext";
import { PanelLoading, PanelShell } from "./ManagePanel";

const SCOPE_LABELS: Record<SpaceScope, string> = { global: "Everyone", branch: "Branch", batch: "Batch", course: "Course", staff: "Staff only" };
const SCOPE_COLORS: Record<SpaceScope, string> = { global: CC.success, branch: "#93A9E2", batch: "#FFAD4F", course: "#8C24FF", staff: "#F07A88" };
const SCOPE_TABS: (SpaceScope | "all")[] = ["all", "global", "branch", "batch", "course", "staff"];

export default function SpacesPanel() {
    const { api, can } = useCommunity();
    const { adminSpaces, getAdminSpaces, updateSpace, deleteSpace, syncBatchSpaces, me } = api;
    const [scope, setScope] = useState<SpaceScope | "all">("all");
    const [archived, setArchived] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [editing, setEditing] = useState<CommunityAdminSpace | "new" | null>(null);
    const [moderatorsOf, setModeratorsOf] = useState<CommunityAdminSpace | null>(null);
    const [deleting, setDeleting] = useState<CommunityAdminSpace | null>(null);

    const isOwner = me?.role === "Owner";
    const canManage = can("space.manage");
    const manages = (s: CommunityAdminSpace) => canManage && (isOwner || s.scope === "branch" || s.scope === "batch");

    const load = useCallback(async () => {
        setLoading(true);
        const res = await getAdminSpaces({ scope: scope === "all" ? undefined : scope, includeArchived: archived });
        setLoading(false);
        setLoaded(true);
        if (!res.success) toast.error(res.message ?? "Couldn't load spaces");
    }, [getAdminSpaces, scope, archived]);

    useEffect(() => {
        void load();
    }, [load]);

    const run = async (fn: () => Promise<{ success: boolean; message?: string | null }>, fallback: string, success: string) => {
        setBusy(true);
        const res = await fn();
        setBusy(false);
        if (!res.success) toast.error(res.message ?? fallback);
        else toast.success(success);
        return res.success;
    };

    const sync = async () => {
        setBusy(true);
        const res = await syncBatchSpaces();
        setBusy(false);
        if (!res.success) return void toast.error(res.message ?? "Couldn't sync batch spaces");
        toast.success(res.data?.created ? `${res.data.created} batch space${res.data.created === 1 ? "" : "s"} created` : "Every active batch already has a space");
        void load();
    };

    const visible = adminSpaces.filter((s) => (scope === "all" || s.scope === scope) && (archived || !s.isArchived));

    return (
        <PanelShell
            view="spaces"
            title="Spaces"
            subtitle={canManage ? "Where discussions happen and who can see them. Batch spaces are created automatically for every active batch." : "Spaces you moderate."}
            actions={
                canManage && (
                    <>
                        <ActionButton disabled={busy} icon={<RefreshCw size={18} />} onClick={() => void sync()}>
                            Sync batch spaces
                        </ActionButton>
                        <ActionButton tone="primary" icon={<Plus size={18} />} onClick={() => setEditing("new")}>
                            New space
                        </ActionButton>
                    </>
                )
            }
            toolbar={
                <>
                    <Box role="radiogroup" aria-label="Space audience" sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {SCOPE_TABS.map((s) => (
                            <ChoiceChip key={s} active={scope === s} color={s === "all" ? undefined : SCOPE_COLORS[s]} onClick={() => setScope(s)}>
                                {s === "all" ? "All" : SCOPE_LABELS[s]}
                            </ChoiceChip>
                        ))}
                    </Box>
                    <Box sx={{ ml: { md: "auto" } }}>
                        <CheckRow checked={archived} onChange={setArchived} label="Show archived" />
                    </Box>
                </>
            }
        >
            {!loaded || (loading && visible.length === 0) ? (
                <PanelLoading />
            ) : visible.length === 0 ? (
                <EmptyCard title="No spaces" message="Nothing matches these filters." />
            ) : (
                visible.map((s) => (
                    <SpaceRow
                        key={s.id}
                        space={s}
                        manage={manages(s)}
                        busy={busy}
                        onEdit={() => setEditing(s)}
                        onModerators={() => setModeratorsOf(s)}
                        onArchive={() => void run(() => updateSpace(s.id, { isArchived: !s.isArchived }), "Couldn't update the space", s.isArchived ? "Space restored" : "Space archived")}
                        onDelete={() => setDeleting(s)}
                    />
                ))
            )}

            <SpaceFormModal space={editing} isOwner={isOwner} onClose={() => setEditing(null)} />
            <ModeratorsModal space={moderatorsOf} onClose={() => setModeratorsOf(null)} />
            <ConfirmModal
                open={Boolean(deleting)}
                title="Delete space?"
                message={`“${deleting?.name ?? ""}” has no discussions and will be removed. This can't be undone.`}
                busy={busy}
                onConfirm={async () => {
                    if (deleting && (await run(() => deleteSpace(deleting.id), "Couldn't delete the space", "Space deleted"))) setDeleting(null);
                }}
                onClose={() => setDeleting(null)}
            />
        </PanelShell>
    );
}

interface SpaceRowProps {
    space: CommunityAdminSpace;
    manage: boolean;
    busy: boolean;
    onEdit: () => void;
    onModerators: () => void;
    onArchive: () => void;
    onDelete: () => void;
}

function SpaceRow({ space, manage, busy, onEdit, onModerators, onArchive, onDelete }: SpaceRowProps) {
    const audience = space.batch?.name ?? space.course?.name ?? space.branch?.name;
    const flags = [
        space.isDefault && "Default space",
        space.postingPolicy === "staff_only" && "Staff post only",
        space.requirePostApproval && "Posts need approval",
        !space.allowAnonymous && "No anonymous posts",
        !space.allowPolls && "No polls",
    ].filter(Boolean) as string[];
    return (
        <GlassCard sx={{ display: "flex", flexDirection: "column", gap: "14px", flexShrink: 0, opacity: space.isArchived ? 0.7 : 1 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0, flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <Typography component="h3" sx={{ ...TEXT.semi18, color: CC.white }}>
                            {space.name}
                        </Typography>
                        <StatusChip label={SCOPE_LABELS[space.scope]} color={SCOPE_COLORS[space.scope]} />
                        {space.isArchived && <StatusChip label="Archived" color={CC.n300} />}
                    </Box>
                    {audience && <Typography sx={{ ...TEXT.reg14, color: CC.n400 }}>{audience}</Typography>}
                    {space.description && <Typography sx={{ ...TEXT.med14, color: CC.n200 }}>{space.description}</Typography>}
                </Box>
                <Box sx={{ display: "flex", gap: "20px" }}>
                    <Count label="Discussions" value={space.postCount} />
                    <Count label="Moderators" value={space.moderatorCount} />
                </Box>
            </Box>
            {flags.length > 0 && (
                <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {flags.map((f) => (
                        <StatusChip key={f} label={f} color={CC.n200} />
                    ))}
                </Box>
            )}
            {manage && (
                <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap", pt: "14px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <ActionButton icon={<Pencil size={18} />} onClick={onEdit}>
                        Edit
                    </ActionButton>
                    <ActionButton icon={<Users size={18} />} onClick={onModerators}>
                        Moderators
                    </ActionButton>
                    {!space.isDefault && (
                        <ActionButton tone="warning" disabled={busy} icon={space.isArchived ? <ArchiveRestore size={18} /> : <Archive size={18} />} onClick={onArchive}>
                            {space.isArchived ? "Restore" : "Archive"}
                        </ActionButton>
                    )}
                    {!space.isDefault && space.postCount === 0 && (
                        <ActionButton tone="danger" disabled={busy} icon={<Trash2 size={18} />} onClick={onDelete}>
                            Delete
                        </ActionButton>
                    )}
                </Box>
            )}
        </GlassCard>
    );
}

function Count({ label, value }: { label: string; value: number }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <Typography sx={{ ...TEXT.med18, color: CC.white }}>{value}</Typography>
            <Typography sx={{ ...TEXT.reg12, color: CC.n400 }}>{label}</Typography>
        </Box>
    );
}

// ─── Create / edit ─────────────────────────────────────────────────────────
function SpaceFormModal({ space, isOwner, onClose }: { space: CommunityAdminSpace | "new" | null; isOwner: boolean; onClose: () => void }) {
    return (
        <CommunityModal open={Boolean(space)} onClose={onClose} title={space === "new" ? "New space" : "Edit space"} width={560}>
            {space && <SpaceForm key={space === "new" ? "new" : space.id} space={space === "new" ? null : space} isOwner={isOwner} onDone={onClose} />}
        </CommunityModal>
    );
}

function SpaceForm({ space, isOwner, onDone }: { space: CommunityAdminSpace | null; isOwner: boolean; onDone: () => void }) {
    const { api } = useCommunity();
    const scopes: SpaceScope[] = isOwner ? ["global", "staff"] : ["branch"];
    const [name, setName] = useState(space?.name ?? "");
    const [description, setDescription] = useState(space?.description ?? "");
    const [scope, setScope] = useState<SpaceScope>(space?.scope ?? scopes[0]);
    const [postingPolicy, setPostingPolicy] = useState<PostingPolicy>(space?.postingPolicy ?? "everyone");
    const [requirePostApproval, setRequirePostApproval] = useState(space?.requirePostApproval ?? false);
    const [allowAnonymous, setAllowAnonymous] = useState(space?.allowAnonymous ?? true);
    const [allowPolls, setAllowPolls] = useState(space?.allowPolls ?? true);
    const [isDefault, setIsDefault] = useState(space?.isDefault ?? false);
    const [busy, setBusy] = useState(false);

    const submit = async () => {
        if (!name.trim()) return;
        setBusy(true);
        const fields = { name: name.trim(), description: description.trim() || null, postingPolicy, requirePostApproval, allowAnonymous, allowPolls };
        const res = space
            ? await api.updateSpace(space.id, { ...fields, ...(isOwner && space.scope === "global" && isDefault && !space.isDefault ? { isDefault: true } : {}) })
            : await api.createSpace({ ...fields, scope, ...(isOwner && scope === "global" && isDefault ? { isDefault: true } : {}) });
        setBusy(false);
        if (!res.success) return void toast.error(res.message ?? "Couldn't save the space");
        toast.success(space ? "Space updated" : "Space created");
        onDone();
    };

    const currentScope = space?.scope ?? scope;
    return (
        <>
            <FormRow label="Name">
                <FieldInput value={name} maxLength={100} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pune Branch Lounge" autoFocus />
            </FormRow>
            <FormRow label="Description (optional)">
                <TextArea value={description} maxLength={500} rows={2} onChange={(e) => setDescription(e.target.value)} placeholder="What this space is for" />
            </FormRow>
            {!space ? (
                <FormRow label="Who can see it" hint={scope === "branch" ? "Members of your branch." : scope === "staff" ? "Staff of every branch; students can't see it." : "Everyone in the community."}>
                    <Box role="radiogroup" sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {scopes.map((s) => (
                            <ChoiceChip key={s} active={scope === s} color={SCOPE_COLORS[s]} onClick={() => setScope(s)}>
                                {SCOPE_LABELS[s]}
                            </ChoiceChip>
                        ))}
                    </Box>
                </FormRow>
            ) : (
                <FormRow label="Who can see it" hint="The audience is fixed after creation.">
                    <Box>
                        <StatusChip label={SCOPE_LABELS[space.scope]} color={SCOPE_COLORS[space.scope]} />
                    </Box>
                </FormRow>
            )}
            <FormRow label="Who can start discussions">
                <Box role="radiogroup" sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <ChoiceChip active={postingPolicy === "everyone"} onClick={() => setPostingPolicy("everyone")}>
                        Everyone
                    </ChoiceChip>
                    <ChoiceChip active={postingPolicy === "staff_only"} onClick={() => setPostingPolicy("staff_only")}>
                        Staff only (members can reply)
                    </ChoiceChip>
                </Box>
            </FormRow>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <CheckRow checked={requirePostApproval} onChange={setRequirePostApproval} label="Approve student posts before they go live" hint="New posts wait in the moderation queue." />
                <CheckRow checked={allowAnonymous} onChange={setAllowAnonymous} label="Allow anonymous posts" hint="Students can hide their name; moderators still see it." />
                <CheckRow checked={allowPolls} onChange={setAllowPolls} label="Allow polls" />
                {isOwner && currentScope === "global" && !space?.isDefault && (
                    <CheckRow checked={isDefault} onChange={setIsDefault} label="Make this the default space" hint="New discussions go here unless another space is picked." />
                )}
            </Box>
            <LmsButton onClick={() => void submit()} disabled={busy || !name.trim()} sx={{ width: "100%" }}>
                {busy ? "Saving…" : space ? "Save changes" : "Create space"}
            </LmsButton>
        </>
    );
}

// ─── Explicit moderators ───────────────────────────────────────────────────
function ModeratorsModal({ space, onClose }: { space: CommunityAdminSpace | null; onClose: () => void }) {
    return (
        <CommunityModal open={Boolean(space)} onClose={onClose} title={`Moderators · ${space?.name ?? ""}`} width={560}>
            {space && <ModeratorsBody key={space.id} space={space} />}
        </CommunityModal>
    );
}

function ModeratorsBody({ space }: { space: CommunityAdminSpace }) {
    const { api } = useCommunity();
    const { getSpaceModerators, addSpaceModerator, removeSpaceModerator, searchMembers } = api;
    const [mods, setMods] = useState<CommunitySpaceModerator[] | null>(null);
    const [q, setQ] = useState("");
    const [results, setResults] = useState<CommunityAuthor[]>([]);
    const [busyId, setBusyId] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;
        void getSpaceModerators(space.id).then((res) => {
            if (!alive) return;
            if (res.success && res.data) setMods(res.data);
            else {
                setMods([]);
                toast.error(res.message ?? "Couldn't load moderators");
            }
        });
        return () => {
            alive = false;
        };
    }, [getSpaceModerators, space.id]);

    useEffect(() => {
        const term = q.trim();
        if (term.length < 2) return;
        let alive = true;
        const t = setTimeout(() => {
            void searchMembers({ q: term, limit: 8 }).then((res) => {
                if (alive && res.success && res.data) setResults(res.data);
            });
        }, 300);
        return () => {
            alive = false;
            clearTimeout(t);
        };
    }, [q, searchMembers]);

    const change = async (memberId: string, add: boolean) => {
        setBusyId(memberId);
        const res = add ? await addSpaceModerator(space.id, memberId) : await removeSpaceModerator(space.id, memberId);
        setBusyId(null);
        if (!res.success || !res.data) return void toast.error(res.message ?? "Couldn't update moderators");
        setMods(res.data);
        if (add) {
            setQ("");
            setResults([]);
        }
    };

    const modIds = new Set(mods?.map((m) => m.id));
    const suggestions = q.trim().length >= 2 ? results.filter((r) => r.id && !modIds.has(r.id)) : [];

    return (
        <>
            <Typography sx={{ ...TEXT.med14, color: CC.n300 }}>
                Staff of the space&apos;s branch already moderate it. Add anyone else here — for example a student teaching assistant or a trainer from another branch.
            </Typography>
            <FormRow label="Add a moderator">
                <FieldInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search members by name" aria-label="Search members" />
            </FormRow>
            {suggestions.length > 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", mt: "-8px" }}>
                    {suggestions.map((m) => (
                        <ButtonBase
                            key={m.id}
                            disabled={busyId === m.id}
                            onClick={() => void change(m.id!, true)}
                            sx={{ display: "flex", justifyContent: "space-between", gap: "12px", p: "8px 10px", borderRadius: "8px", "&:hover": { bgcolor: CC.dropdownActive } }}
                        >
                            <AuthorRow author={m} size={28} />
                            <UserPlus size={18} color={CC.primary200} />
                        </ButtonBase>
                    ))}
                </Box>
            )}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Typography sx={{ ...TEXT.reg14, color: CC.n300 }}>Current moderators</Typography>
                {mods === null ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: "16px" }}>
                        <CircularProgress size={22} sx={{ color: CC.primary200 }} />
                    </Box>
                ) : mods.length === 0 ? (
                    <Typography sx={{ ...TEXT.med14, color: CC.n500 }}>No extra moderators yet.</Typography>
                ) : (
                    mods.map((m) => (
                        <Box key={m.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", p: "8px 10px", borderRadius: "8px", border: `1px solid ${CC.n700}` }}>
                            <AuthorRow author={m} size={28} />
                            <ButtonBase
                                aria-label={`Remove ${m.name}`}
                                disabled={busyId === m.id}
                                onClick={() => void change(m.id!, false)}
                                sx={{ p: "6px", borderRadius: "6px", "&:hover": { bgcolor: "rgba(255,255,255,0.06)" } }}
                            >
                                <X size={18} color={CC.n200} />
                            </ButtonBase>
                        </Box>
                    ))
                )}
            </Box>
        </>
    );
}
