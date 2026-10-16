"use client";

import React, { useCallback, useState } from "react";
import { CircleCheck, CircleX, Eye, EyeOff, FolderInput, Lock, LockOpen, Pin, PinOff, Trash2, VolumeX } from "lucide-react";
import toast from "react-hot-toast";
import type { StandardResponse } from "@/contexts/AuthContext";
import type { CommunityAuthor, CommunityCapability, CommunityPost, CommunityReply } from "@/contexts/CommunityContext";

type StandardResponseLike = StandardResponse<unknown>;
import { CC } from "../community-data";
import { ActionMenuItem, ConfirmModal, ReasonModal } from "../community-ui";
import { useCommunity } from "../CommunityContext";
import { MovePostModal, MuteModal, PinModal } from "./ModerationModals";

type ReasonKind = "hidePost" | "rejectPost" | "removePost" | "hideReply" | "removeReply";

interface ReasonState {
    kind: ReasonKind;
    id: string;
}

interface Options {
    /** After a hard delete of the post (thread page navigates back to the feed). */
    onPostPurged?: (postId: string) => void;
    /** After any successful action (lists reload). */
    onChanged?: () => void;
}

const icon = (Cmp: React.ElementType, color: string = CC.n200) => <Cmp size={20} color={color} strokeWidth={1.75} />;

const REASON_COPY: Record<ReasonKind, { title: string; message: string; confirm: string; required?: boolean; danger?: boolean }> = {
    hidePost: { title: "Hide discussion?", message: "It disappears for everyone except the author and moderators. You can restore it later.", confirm: "Hide discussion" },
    rejectPost: { title: "Reject discussion?", message: "The author is notified with your reason and can edit the post to submit it again.", confirm: "Reject", required: true },
    removePost: { title: "Remove discussion?", message: "The discussion is removed from the community. Moderators can still restore it.", confirm: "Remove", danger: true },
    hideReply: { title: "Hide reply?", message: "Replies under it stay visible; the reply shows as hidden to members.", confirm: "Hide reply" },
    removeReply: { title: "Remove reply?", message: "The reply is removed from the discussion. Moderators can still restore it.", confirm: "Remove", danger: true },
};

/** The real member behind an author block (anonymous authors are revealed to moderators). */
export function realAuthor(author: CommunityAuthor | null | undefined): CommunityAuthor | null {
    if (!author) return null;
    if (author.isAnonymous) return author.revealedAuthor ?? null;
    return author.id ? author : null;
}

/**
 * Moderation actions for posts and replies (pin, lock, hide / restore, approve / reject, move, remove,
 * purge, mute author) with their dialogs. Menu items only appear when the post's capabilities allow them.
 */
export function useModeration({ onPostPurged, onChanged }: Options = {}) {
    const { api, refreshQueue } = useCommunity();
    const [busy, setBusy] = useState(false);
    const [reason, setReason] = useState<ReasonState | null>(null);
    const [purge, setPurge] = useState<{ kind: "post" | "reply"; id: string } | null>(null);
    const [pinTarget, setPinTarget] = useState<CommunityPost | null>(null);
    const [moveTarget, setMoveTarget] = useState<CommunityPost | null>(null);
    const [muteTarget, setMuteTarget] = useState<{ id: string; name: string } | null>(null);

    const run = useCallback(
        async (action: () => Promise<StandardResponseLike>, fallback: string) => {
            setBusy(true);
            const res = await action();
            setBusy(false);
            if (!res.success) {
                toast.error(res.message ?? fallback);
                return false;
            }
            toast.success(res.message ?? "Done");
            refreshQueue();
            onChanged?.();
            return true;
        },
        [refreshQueue, onChanged],
    );

    const approve = useCallback((postId: string) => run(() => api.approvePost(postId), "Couldn't approve the discussion"), [run, api]);

    const postItems = useCallback(
        (post: CommunityPost): ActionMenuItem[] => {
            const caps = post.permissions.capabilities as readonly CommunityCapability[];
            const has = (c: CommunityCapability) => caps.includes(c);
            const items: ActionMenuItem[] = [];
            if (post.status === "pending_review" && has("post.approve")) {
                items.push({ label: "Approve", icon: icon(CircleCheck, CC.success), onClick: () => void approve(post.id) });
                items.push({ label: "Reject", icon: icon(CircleX, "#F07A88"), onClick: () => setReason({ kind: "rejectPost", id: post.id }) });
            }
            if (has("post.pin") && post.status === "published") {
                items.push(
                    post.isPinned
                        ? { label: "Unpin", icon: icon(PinOff), onClick: () => void run(() => api.unpinPost(post.id), "Couldn't unpin") }
                        : { label: "Pin to top", icon: icon(Pin), onClick: () => setPinTarget(post) },
                );
            }
            if (has("post.lock")) {
                items.push(
                    post.isLocked
                        ? { label: "Unlock replies", icon: icon(LockOpen), onClick: () => void run(() => api.unlockPost(post.id), "Couldn't unlock") }
                        : { label: "Lock replies", icon: icon(Lock), onClick: () => void run(() => api.lockPost(post.id), "Couldn't lock") },
                );
            }
            if (has("post.move")) items.push({ label: "Move / re-categorise", icon: icon(FolderInput), onClick: () => setMoveTarget(post) });
            if (has("post.hide")) {
                if (post.status === "published") items.push({ label: "Hide", icon: icon(EyeOff), onClick: () => setReason({ kind: "hidePost", id: post.id }) });
                else if (post.status !== "pending_review") items.push({ label: "Restore", icon: icon(Eye, CC.success), onClick: () => void run(() => api.restorePost(post.id), "Couldn't restore") });
            }
            const author = realAuthor(post.author);
            if (has("member.mute") && author?.id && !author.isStaff && !post.isMine) {
                items.push({ label: "Mute author", icon: icon(VolumeX), onClick: () => setMuteTarget({ id: author.id!, name: author.name }) });
            }
            if (has("post.delete") && !post.isMine && post.status !== "deleted") {
                items.push({ label: "Remove", icon: icon(Trash2, CC.error), danger: true, onClick: () => setReason({ kind: "removePost", id: post.id }) });
            }
            if (has("post.purge")) items.push({ label: "Delete permanently", icon: icon(Trash2, CC.error), danger: true, onClick: () => setPurge({ kind: "post", id: post.id }) });
            return items;
        },
        [api, run, approve],
    );

    const replyItems = useCallback(
        (reply: CommunityReply, post: CommunityPost): ActionMenuItem[] => {
            if (!reply.permissions.canModerate) return [];
            const caps = post.permissions.capabilities as readonly CommunityCapability[];
            const has = (c: CommunityCapability) => caps.includes(c);
            const items: ActionMenuItem[] = [];
            if (has("post.hide")) {
                if (reply.status === "published") items.push({ label: "Hide", icon: icon(EyeOff), onClick: () => setReason({ kind: "hideReply", id: reply.id }) });
                else items.push({ label: "Restore", icon: icon(Eye, CC.success), onClick: () => void run(() => api.restoreReply(reply.id), "Couldn't restore") });
            }
            const author = realAuthor(reply.author);
            if (has("member.mute") && author?.id && !author.isStaff && !reply.isMine) {
                items.push({ label: "Mute author", icon: icon(VolumeX), onClick: () => setMuteTarget({ id: author.id!, name: author.name }) });
            }
            if (has("post.delete") && !reply.isMine && reply.status !== "deleted") {
                items.push({ label: "Remove", icon: icon(Trash2, CC.error), danger: true, onClick: () => setReason({ kind: "removeReply", id: reply.id }) });
            }
            if (has("post.purge")) items.push({ label: "Delete permanently", icon: icon(Trash2, CC.error), danger: true, onClick: () => setPurge({ kind: "reply", id: reply.id }) });
            return items;
        },
        [api, run],
    );

    const confirmReason = async (text: string) => {
        if (!reason) return;
        const r = text || undefined;
        const { id, kind } = reason;
        const ok = await run(() => {
            switch (kind) {
                case "hidePost":
                    return api.hidePost(id, r);
                case "rejectPost":
                    return api.rejectPost(id, text);
                case "removePost":
                    return api.moderatorDeletePost(id, r);
                case "hideReply":
                    return api.hideReply(id, r);
                case "removeReply":
                    return api.moderatorDeleteReply(id, r);
            }
        }, "Couldn't complete that action");
        if (ok) setReason(null);
    };

    const confirmPurge = async () => {
        if (!purge) return;
        const target = purge;
        const ok = await run(() => (target.kind === "post" ? api.purgePost(target.id) : api.purgeReply(target.id)), "Couldn't delete");
        if (!ok) return;
        setPurge(null);
        if (target.kind === "post") onPostPurged?.(target.id);
    };

    const copy = reason ? REASON_COPY[reason.kind] : null;

    const modals = (
        <>
            <ReasonModal
                open={Boolean(reason)}
                title={copy?.title ?? ""}
                message={copy?.message}
                confirmLabel={copy?.confirm ?? "Confirm"}
                required={copy?.required}
                danger={copy?.danger}
                busy={busy}
                onConfirm={(text) => void confirmReason(text)}
                onClose={() => setReason(null)}
            />
            <ConfirmModal
                open={Boolean(purge)}
                title={purge?.kind === "post" ? "Delete discussion permanently?" : "Delete reply permanently?"}
                message={
                    purge?.kind === "post"
                        ? "The discussion, all replies, votes and files are erased. This can't be undone."
                        : "The reply and every reply under it are erased. This can't be undone."
                }
                confirmLabel="Delete permanently"
                busy={busy}
                onConfirm={() => void confirmPurge()}
                onClose={() => setPurge(null)}
            />
            <PinModal
                open={Boolean(pinTarget)}
                busy={busy}
                onConfirm={async (input) => {
                    if (pinTarget && (await run(() => api.pinPost(pinTarget.id, input), "Couldn't pin"))) setPinTarget(null);
                }}
                onClose={() => setPinTarget(null)}
            />
            <MovePostModal
                post={moveTarget}
                busy={busy}
                onConfirm={async (input) => {
                    if (moveTarget && (await run(() => api.movePost(moveTarget.id, input), "Couldn't move the discussion"))) setMoveTarget(null);
                }}
                onClose={() => setMoveTarget(null)}
            />
            <MuteModal
                member={muteTarget}
                busy={busy}
                onConfirm={async (input) => {
                    if (muteTarget && (await run(() => api.muteMember(muteTarget.id, input), "Couldn't mute the member"))) setMuteTarget(null);
                }}
                onClose={() => setMuteTarget(null)}
            />
        </>
    );

    return { postItems, replyItems, approve, reject: (postId: string) => setReason({ kind: "rejectPost", id: postId }), modals, busy };
}
