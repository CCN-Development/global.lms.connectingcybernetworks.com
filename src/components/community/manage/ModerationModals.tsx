"use client";

import React, { useState } from "react";
import { Box, Menu, MenuItem, Typography } from "@mui/material";
import type { CommunityPost, MovePostInput, PinInput } from "@/contexts/CommunityContext";
import { CC } from "../community-data";
import {
    ChoiceChip,
    CommunityModal,
    dropdownItemSx,
    dropdownPaperSx,
    ellipsis,
    FilterButton,
    FormRow,
    LmsButton,
    TagChip,
    TextArea,
    TEXT,
} from "../community-ui";
import { useCommunity } from "../CommunityContext";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const fromNow = (ms: number) => (ms ? new Date(Date.now() + ms).toISOString() : null);

// ─── Pin ───────────────────────────────────────────────────────────────────
const PIN_DURATIONS = [
    { label: "Until unpinned", ms: 0 },
    { label: "1 day", ms: DAY },
    { label: "3 days", ms: 3 * DAY },
    { label: "1 week", ms: 7 * DAY },
    { label: "30 days", ms: 30 * DAY },
];
const PIN_PRIORITIES = [
    { label: "Normal", value: 0 },
    { label: "High", value: 5 },
    { label: "Top", value: 10 },
];

export function PinModal({ open, busy, onConfirm, onClose }: { open: boolean; busy?: boolean; onConfirm: (input: PinInput) => void; onClose: () => void }) {
    return (
        <CommunityModal open={open} onClose={busy ? () => undefined : onClose} title="Pin discussion" width={480}>
            {/* Remounted per open so choices reset. */}
            {open && <PinForm busy={busy} onConfirm={onConfirm} />}
        </CommunityModal>
    );
}

function PinForm({ busy, onConfirm }: { busy?: boolean; onConfirm: (input: PinInput) => void }) {
    const [duration, setDuration] = useState(0);
    const [priority, setPriority] = useState(0);
    return (
        <>
            <FormRow label="Keep it pinned for">
                <Box role="radiogroup" sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {PIN_DURATIONS.map((d) => (
                        <ChoiceChip key={d.label} active={duration === d.ms} onClick={() => setDuration(d.ms)}>
                            {d.label}
                        </ChoiceChip>
                    ))}
                </Box>
            </FormRow>
            <FormRow label="Order among pinned posts" hint="Higher priority pins are shown first.">
                <Box role="radiogroup" sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {PIN_PRIORITIES.map((p) => (
                        <ChoiceChip key={p.value} active={priority === p.value} onClick={() => setPriority(p.value)}>
                            {p.label}
                        </ChoiceChip>
                    ))}
                </Box>
            </FormRow>
            <LmsButton onClick={() => onConfirm({ expiresAt: fromNow(duration), priority })} disabled={busy} sx={{ width: "100%" }}>
                {busy ? "Pinning…" : "Pin to top"}
            </LmsButton>
        </>
    );
}

// ─── Mute ──────────────────────────────────────────────────────────────────
const MUTE_DURATIONS = [
    { label: "1 hour", ms: HOUR },
    { label: "24 hours", ms: DAY },
    { label: "3 days", ms: 3 * DAY },
    { label: "7 days", ms: 7 * DAY },
    { label: "Until unmuted", ms: 0 },
];

export function MuteModal({
    member,
    busy,
    onConfirm,
    onClose,
}: {
    member: { name: string } | null;
    busy?: boolean;
    onConfirm: (input: { until: string | null; reason: string | null }) => void;
    onClose: () => void;
}) {
    return (
        <CommunityModal open={Boolean(member)} onClose={busy ? () => undefined : onClose} title={`Mute ${member?.name ?? "member"}`} width={480}>
            {member && <MuteForm busy={busy} onConfirm={onConfirm} />}
        </CommunityModal>
    );
}

function MuteForm({ busy, onConfirm }: { busy?: boolean; onConfirm: (input: { until: string | null; reason: string | null }) => void }) {
    const [duration, setDuration] = useState(DAY);
    const [reason, setReason] = useState("");
    return (
        <>
            <Typography sx={{ ...TEXT.med16, color: CC.n200 }}>Muted members can still read the community but can&apos;t post, reply or vote.</Typography>
            <FormRow label="Duration">
                <Box role="radiogroup" sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {MUTE_DURATIONS.map((d) => (
                        <ChoiceChip key={d.label} active={duration === d.ms} onClick={() => setDuration(d.ms)}>
                            {d.label}
                        </ChoiceChip>
                    ))}
                </Box>
            </FormRow>
            <FormRow label="Reason (optional, shared with the member)">
                <TextArea value={reason} maxLength={1000} rows={3} onChange={(e) => setReason(e.target.value)} />
            </FormRow>
            <LmsButton onClick={() => onConfirm({ until: fromNow(duration), reason: reason.trim() || null })} disabled={busy} sx={{ width: "100%" }}>
                {busy ? "Muting…" : "Mute member"}
            </LmsButton>
        </>
    );
}

// ─── Move / re-categorise ──────────────────────────────────────────────────
export function MovePostModal({
    post,
    busy,
    onConfirm,
    onClose,
}: {
    post: CommunityPost | null;
    busy?: boolean;
    onConfirm: (input: MovePostInput) => void;
    onClose: () => void;
}) {
    return (
        <CommunityModal open={Boolean(post)} onClose={busy ? () => undefined : onClose} title="Move discussion" width={560}>
            {post && <MoveForm post={post} busy={busy} onConfirm={onConfirm} />}
        </CommunityModal>
    );
}

function MoveForm({ post, busy, onConfirm }: { post: CommunityPost; busy?: boolean; onConfirm: (input: MovePostInput) => void }) {
    const { api } = useCommunity();
    const spaces = api.spaces.filter((s) => s.canModerate && !s.isArchived);
    const categories = api.categories.filter((c) => c.isActive);
    const tags = api.tags.filter((t) => t.isActive);
    const maxTags = api.config.maxTagsPerPost;

    const [spaceId, setSpaceId] = useState(post.space.id);
    const [category, setCategory] = useState(post.categoryId);
    const [tagSlugs, setTagSlugs] = useState<string[]>(post.tagDetails.map((t) => t.slug));
    const [reason, setReason] = useState("");
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);

    const space = spaces.find((s) => s.id === spaceId);
    const originalTags = post.tagDetails.map((t) => t.slug).sort().join(",");
    const tagsChanged = [...tagSlugs].sort().join(",") !== originalTags;
    const changed = spaceId !== post.space.id || category !== post.categoryId || tagsChanged;

    const toggleTag = (slug: string) =>
        setTagSlugs((prev) => (prev.includes(slug) ? prev.filter((t) => t !== slug) : prev.length >= maxTags ? prev : [...prev, slug]));

    return (
        <>
            <FormRow label="Space">
                <Box>
                    <FilterButton label="Space" open={Boolean(anchor)} onClick={(e) => setAnchor(e.currentTarget)}>
                        <Box component="span" sx={ellipsis}>
                            {space?.name ?? post.space.name}
                        </Box>
                    </FilterButton>
                    <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} slotProps={{ paper: { sx: { ...dropdownPaperSx, minWidth: 260 } } }}>
                        {spaces.map((s) => (
                            <MenuItem
                                key={s.id}
                                selected={s.id === spaceId}
                                onClick={() => {
                                    setSpaceId(s.id);
                                    setAnchor(null);
                                }}
                                sx={dropdownItemSx(s.id === spaceId)}
                            >
                                {s.name}
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>
            </FormRow>
            <FormRow label="Category">
                <Box role="radiogroup" sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {categories.map((c) => (
                        <ChoiceChip key={c.id} active={category === c.id} color={c.color} onClick={() => setCategory(c.id)}>
                            {c.label}
                        </ChoiceChip>
                    ))}
                </Box>
            </FormRow>
            <FormRow label={`Tags (up to ${maxTags})`}>
                <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {tags.map((t) => (
                        <ChoiceChip key={t.id} active={tagSlugs.includes(t.slug)} onClick={() => toggleTag(t.slug)}>
                            {t.label}
                        </ChoiceChip>
                    ))}
                </Box>
                {tagSlugs.length > 0 && (
                    <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap", mt: "4px" }}>
                        {tagSlugs.map((slug) => (
                            <TagChip key={slug} label={tags.find((t) => t.slug === slug)?.label ?? slug} onRemove={() => toggleTag(slug)} />
                        ))}
                    </Box>
                )}
            </FormRow>
            <FormRow label="Reason (optional, kept in the moderation log)">
                <TextArea value={reason} maxLength={1000} rows={2} onChange={(e) => setReason(e.target.value)} />
            </FormRow>
            <LmsButton
                disabled={busy || !changed}
                onClick={() =>
                    onConfirm({
                        ...(spaceId !== post.space.id ? { spaceId } : {}),
                        ...(category !== post.categoryId ? { category } : {}),
                        ...(tagsChanged ? { tags: tagSlugs } : {}),
                        reason: reason.trim() || null,
                    })
                }
                sx={{ width: "100%" }}
            >
                {busy ? "Saving…" : "Move discussion"}
            </LmsButton>
        </>
    );
}
