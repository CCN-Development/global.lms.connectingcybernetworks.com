"use client";

import React, { useEffect, useState } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { CommunityCategory, CommunityTag } from "@/contexts/CommunityContext";
import { CC } from "../community-data";
import {
    ActionButton,
    CategorySwatch,
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
    TagChip,
    TextArea,
    TEXT,
} from "../community-ui";
import { useCommunity } from "../CommunityContext";
import { PanelLoading, PanelShell } from "./ManagePanel";

type Tab = "categories" | "tags";
type Res = Promise<{ success: boolean; message?: string | null }>;

const SWATCHES = ["#2F53AD", "#93A9E2", "#8C24FF", "#2EC4B6", "#FFAD4F", "#D1293D", "#F07A88", "#BFBFBF"];
const HEX = /^#[0-9a-f]{6}$/i;

export default function TaxonomyPanel() {
    const { api } = useCommunity();
    const { adminCategories, adminTags, getAdminCategories, getAdminTags, getCategories, getTags } = api;
    const [tab, setTab] = useState<Tab>("categories");
    const [loaded, setLoaded] = useState(false);
    const [busy, setBusy] = useState(false);
    const [editCategory, setEditCategory] = useState<CommunityCategory | "new" | null>(null);
    const [editTag, setEditTag] = useState<CommunityTag | "new" | null>(null);
    const [removing, setRemoving] = useState<{ kind: "category"; item: CommunityCategory } | { kind: "tag"; item: CommunityTag } | null>(null);

    useEffect(() => {
        let alive = true;
        void Promise.all([getAdminCategories(), getAdminTags()]).then(([c, t]) => {
            if (!alive) return;
            setLoaded(true);
            if (!c.success || !t.success) toast.error((!c.success ? c.message : t.message) ?? "Couldn't load categories and tags");
        });
        return () => {
            alive = false;
        };
    }, [getAdminCategories, getAdminTags]);

    /** Keep the forum sidebar / composer pickers in sync. */
    const syncMemberLists = (kind: Tab) => void (kind === "categories" ? getCategories() : getTags());

    const run = async (fn: () => Res, kind: Tab, fallback: string, success: string) => {
        setBusy(true);
        const res = await fn();
        setBusy(false);
        if (!res.success) {
            toast.error(res.message ?? fallback);
            return false;
        }
        toast.success(success);
        syncMemberLists(kind);
        return true;
    };

    const move = (index: number, delta: number) => {
        const ids = adminCategories.map((c) => c.categoryId);
        const target = index + delta;
        if (target < 0 || target >= ids.length) return;
        [ids[index], ids[target]] = [ids[target], ids[index]];
        void run(() => api.reorderCategories(ids), "categories", "Couldn't reorder", "Order saved");
    };

    const confirmRemove = async () => {
        if (!removing) return;
        setBusy(true);
        const res = removing.kind === "category" ? await api.deleteCategory(removing.item.categoryId) : await api.deleteTag(removing.item.id);
        setBusy(false);
        if (!res.success || !res.data) return void toast.error(res.message ?? "Couldn't delete");
        toast.success(res.data.deleted ? "Deleted" : "In use, so it was deactivated instead");
        syncMemberLists(removing.kind === "category" ? "categories" : "tags");
        setRemoving(null);
    };

    return (
        <PanelShell
            view="taxonomy"
            title="Categories & Tags"
            subtitle="How discussions are organised. Items that are already used are deactivated instead of deleted."
            actions={
                <ActionButton tone="primary" icon={<Plus size={18} />} onClick={() => (tab === "categories" ? setEditCategory("new") : setEditTag("new"))}>
                    {tab === "categories" ? "New category" : "New tag"}
                </ActionButton>
            }
            toolbar={
                <Box role="radiogroup" sx={{ display: "flex", gap: "8px" }}>
                    <ChoiceChip active={tab === "categories"} count={adminCategories.length} onClick={() => setTab("categories")}>
                        Categories
                    </ChoiceChip>
                    <ChoiceChip active={tab === "tags"} count={adminTags.length} onClick={() => setTab("tags")}>
                        Tags
                    </ChoiceChip>
                </Box>
            }
        >
            {!loaded ? (
                <PanelLoading />
            ) : tab === "categories" ? (
                adminCategories.length === 0 ? (
                    <EmptyCard title="No categories" message="Create the first category to organise discussions." />
                ) : (
                    adminCategories.map((c, i) => (
                        <GlassCard key={c.categoryId} sx={{ display: "flex", alignItems: { xs: "flex-start", md: "center" }, flexDirection: { xs: "column", md: "row" }, gap: "14px", flexShrink: 0, py: { xs: "16px", sm: "18px" }, opacity: c.isActive ? 1 : 0.65 }}>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                    <CategorySwatch color={c.color} />
                                    <Typography sx={{ ...TEXT.med16, color: CC.white }}>{c.label}</Typography>
                                    <Typography sx={{ ...TEXT.reg12, color: CC.n500 }}>/{c.id}</Typography>
                                    {c.staffOnly && <StatusChip label="Staff post only" color={CC.primary200} />}
                                    {!c.isActive && <StatusChip label="Inactive" color={CC.n300} />}
                                </Box>
                                {c.description && <Typography sx={{ ...TEXT.reg14, color: CC.n300 }}>{c.description}</Typography>}
                            </Box>
                            <Typography sx={{ ...TEXT.reg14, color: CC.n400, whiteSpace: "nowrap" }}>
                                {c.postCount ?? 0} discussion{c.postCount === 1 ? "" : "s"}
                            </Typography>
                            <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                <IconAction label="Move up" disabled={busy || i === 0} onClick={() => move(i, -1)}>
                                    <ArrowUp size={18} />
                                </IconAction>
                                <IconAction label="Move down" disabled={busy || i === adminCategories.length - 1} onClick={() => move(i, 1)}>
                                    <ArrowDown size={18} />
                                </IconAction>
                                <ActionButton icon={<Pencil size={16} />} onClick={() => setEditCategory(c)}>
                                    Edit
                                </ActionButton>
                                <ActionButton
                                    tone="warning"
                                    disabled={busy}
                                    icon={c.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                                    onClick={() => void run(() => api.updateCategory(c.categoryId, { isActive: !c.isActive }), "categories", "Couldn't update", c.isActive ? "Category hidden" : "Category active")}
                                >
                                    {c.isActive ? "Deactivate" : "Activate"}
                                </ActionButton>
                                <ActionButton tone="danger" disabled={busy} icon={<Trash2 size={16} />} onClick={() => setRemoving({ kind: "category", item: c })}>
                                    Delete
                                </ActionButton>
                            </Box>
                        </GlassCard>
                    ))
                )
            ) : adminTags.length === 0 ? (
                <EmptyCard title="No tags" message="Tags help members filter discussions, e.g. “Important” or “Exam prep”." />
            ) : (
                adminTags.map((t) => (
                    <GlassCard key={t.id} sx={{ display: "flex", alignItems: { xs: "flex-start", md: "center" }, flexDirection: { xs: "column", md: "row" }, gap: "14px", flexShrink: 0, py: { xs: "16px", sm: "18px" }, opacity: t.isActive ? 1 : 0.65 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0, flexWrap: "wrap" }}>
                            {t.color && <CategorySwatch color={t.color} />}
                            <TagChip label={t.label} />
                            <Typography sx={{ ...TEXT.reg12, color: CC.n500 }}>/{t.slug}</Typography>
                            {t.isStaffOnly && <StatusChip label="Staff only" color={CC.primary200} />}
                            {!t.isActive && <StatusChip label="Inactive" color={CC.n300} />}
                        </Box>
                        <Typography sx={{ ...TEXT.reg14, color: CC.n400, whiteSpace: "nowrap" }}>
                            Used {t.usageCount} time{t.usageCount === 1 ? "" : "s"}
                        </Typography>
                        <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            <ActionButton icon={<Pencil size={16} />} onClick={() => setEditTag(t)}>
                                Edit
                            </ActionButton>
                            <ActionButton
                                tone="warning"
                                disabled={busy}
                                icon={t.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                                onClick={() => void run(() => api.updateTag(t.id, { isActive: !t.isActive }), "tags", "Couldn't update", t.isActive ? "Tag hidden" : "Tag active")}
                            >
                                {t.isActive ? "Deactivate" : "Activate"}
                            </ActionButton>
                            <ActionButton tone="danger" disabled={busy} icon={<Trash2 size={16} />} onClick={() => setRemoving({ kind: "tag", item: t })}>
                                Delete
                            </ActionButton>
                        </Box>
                    </GlassCard>
                ))
            )}

            <CommunityModal open={Boolean(editCategory)} onClose={() => setEditCategory(null)} title={editCategory === "new" ? "New category" : "Edit category"} width={520}>
                {editCategory && (
                    <CategoryForm
                        key={editCategory === "new" ? "new" : editCategory.categoryId}
                        category={editCategory === "new" ? null : editCategory}
                        onSubmit={async (input) => {
                            const ok = await run(
                                () => (editCategory === "new" ? api.createCategory({ ...input, sortOrder: adminCategories.length + 1 }) : api.updateCategory(editCategory.categoryId, input)),
                                "categories",
                                "Couldn't save the category",
                                editCategory === "new" ? "Category created" : "Category updated",
                            );
                            if (ok) setEditCategory(null);
                        }}
                        busy={busy}
                    />
                )}
            </CommunityModal>
            <CommunityModal open={Boolean(editTag)} onClose={() => setEditTag(null)} title={editTag === "new" ? "New tag" : "Edit tag"} width={480}>
                {editTag && (
                    <TagForm
                        key={editTag === "new" ? "new" : editTag.id}
                        tag={editTag === "new" ? null : editTag}
                        onSubmit={async (input) => {
                            const ok = await run(
                                () => (editTag === "new" ? api.createTag(input) : api.updateTag(editTag.id, input)),
                                "tags",
                                "Couldn't save the tag",
                                editTag === "new" ? "Tag created" : "Tag updated",
                            );
                            if (ok) setEditTag(null);
                        }}
                        busy={busy}
                    />
                )}
            </CommunityModal>
            <ConfirmModal
                open={Boolean(removing)}
                title={removing?.kind === "tag" ? "Delete tag?" : "Delete category?"}
                message={
                    removing?.kind === "category" && removing.item.postCount
                        ? `“${removing.item.label}” has discussions, so it will be deactivated (hidden from pickers) instead.`
                        : removing?.kind === "tag" && removing.item.usageCount
                          ? `“${removing.item.label}” is used on discussions, so it will be deactivated instead.`
                          : `“${removing?.item.label ?? ""}” will be removed.`
                }
                busy={busy}
                onConfirm={() => void confirmRemove()}
                onClose={() => setRemoving(null)}
            />
        </PanelShell>
    );
}

function IconAction({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <ButtonBase
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            sx={{ width: 36, height: 36, borderRadius: "8px", border: "0.6px solid rgba(140,140,140,0.5)", color: CC.n200, "&:hover": { borderColor: CC.primary200 }, "&.Mui-disabled": { opacity: 0.35 } }}
        >
            {children}
        </ButtonBase>
    );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {SWATCHES.map((c) => (
                <ButtonBase
                    key={c}
                    aria-label={`Colour ${c}`}
                    onClick={() => onChange(c)}
                    sx={{ width: 28, height: 28, borderRadius: "6px", bgcolor: c, outline: value.toLowerCase() === c.toLowerCase() ? `2px solid ${CC.white}` : "none", outlineOffset: "2px" }}
                />
            ))}
            <FieldInput value={value} onChange={(e) => onChange(e.target.value)} maxLength={7} aria-label="Hex colour" sx={{ width: 110, height: 36 }} />
        </Box>
    );
}

function CategoryForm({ category, busy, onSubmit }: { category: CommunityCategory | null; busy: boolean; onSubmit: (input: { name: string; description: string | null; color: string; postingPolicy: "everyone" | "staff_only" }) => void }) {
    const [name, setName] = useState(category?.label ?? "");
    const [description, setDescription] = useState(category?.description ?? "");
    const [color, setColor] = useState(category?.color ?? SWATCHES[0]);
    const [staffOnly, setStaffOnly] = useState(category?.staffOnly ?? false);
    const valid = name.trim().length > 0 && HEX.test(color);
    return (
        <>
            <FormRow label="Name">
                <FieldInput value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lab Discussions" autoFocus />
            </FormRow>
            <FormRow label="Description (optional)">
                <TextArea value={description} maxLength={300} rows={2} onChange={(e) => setDescription(e.target.value)} />
            </FormRow>
            <FormRow label="Colour" hint={HEX.test(color) ? undefined : "Use a hex colour like #2F53AD."}>
                <ColorPicker value={color} onChange={setColor} />
            </FormRow>
            <CheckRow checked={staffOnly} onChange={setStaffOnly} label="Only staff can post here" hint="Students can still read and reply, e.g. for announcements." />
            <LmsButton
                disabled={busy || !valid}
                onClick={() => onSubmit({ name: name.trim(), description: description.trim() || null, color: color.toUpperCase(), postingPolicy: staffOnly ? "staff_only" : "everyone" })}
                sx={{ width: "100%" }}
            >
                {busy ? "Saving…" : category ? "Save changes" : "Create category"}
            </LmsButton>
        </>
    );
}

function TagForm({ tag, busy, onSubmit }: { tag: CommunityTag | null; busy: boolean; onSubmit: (input: { name: string; color: string | null; isStaffOnly: boolean }) => void }) {
    const [name, setName] = useState(tag?.label ?? "");
    const [color, setColor] = useState(tag?.color ?? "");
    const [staffOnly, setStaffOnly] = useState(tag?.isStaffOnly ?? false);
    const valid = name.trim().length > 0 && (!color || HEX.test(color));
    return (
        <>
            <FormRow label="Name">
                <FieldInput value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder="e.g. Important" autoFocus />
            </FormRow>
            <FormRow label="Colour (optional)">
                <ColorPicker value={color} onChange={setColor} />
            </FormRow>
            <CheckRow checked={staffOnly} onChange={setStaffOnly} label="Staff only" hint="Only staff can add this tag to a discussion." />
            <LmsButton disabled={busy || !valid} onClick={() => onSubmit({ name: name.trim(), color: color ? color.toUpperCase() : null, isStaffOnly: staffOnly })} sx={{ width: "100%" }}>
                {busy ? "Saving…" : tag ? "Save changes" : "Create tag"}
            </LmsButton>
        </>
    );
}
