"use client";

import React, { useState } from "react";
import { Box, Button, IconButton, Menu, MenuItem, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { MdAdd, MdArrowDownward, MdArrowUpward, MdDeleteOutline } from "react-icons/md";
import type { ContentBlock } from "@/contexts/CourseContext";
import { ImageUploadField, StringListField } from "../ui";

type BlockType = ContentBlock["type"];

const BLOCK_TYPES: { type: BlockType; label: string; hint: string }[] = [
    { type: "heading", label: "Heading", hint: "Section title" },
    { type: "paragraph", label: "Paragraph", hint: "Body text" },
    { type: "field", label: "Labelled note", hint: 'Caption + lines ("NOTE", "STEP 1")' },
    { type: "list", label: "Bullet list", hint: "List of items" },
    { type: "links", label: "Links", hint: "References" },
    { type: "image", label: "Image", hint: "Screenshot or diagram" },
];

function emptyBlock(type: BlockType): ContentBlock {
    switch (type) {
        case "heading":
            return { type, text: "" };
        case "paragraph":
            return { type, text: "" };
        case "field":
            return { type, label: "NOTE", lines: [""] };
        case "list":
            return { type, items: [""] };
        case "links":
            return { type, items: [{ label: "", href: "" }] };
        case "image":
            return { type, src: "", alt: "", ratio: 16 / 9 };
    }
}

/** Reports the first problem the API would reject (empty text, missing image…). */
export function validateBlocks(blocks: ContentBlock[]): string | null {
    for (const [i, block] of blocks.entries()) {
        const at = `Block ${i + 1} (${block.type})`;
        switch (block.type) {
            case "heading":
            case "paragraph":
                if (!block.text.trim()) return `${at}: text is empty`;
                break;
            case "field":
                if (!block.label.trim() || !block.lines.some((l) => l.trim())) return `${at}: add a label and at least one line`;
                break;
            case "list":
                if (!block.items.some((l) => l.trim())) return `${at}: add at least one item`;
                break;
            case "links":
                if (!block.items.some((l) => l.label.trim() && l.href.trim())) return `${at}: add at least one link with a label and URL`;
                break;
            case "image":
                if (!block.src) return `${at}: upload an image`;
                if (!(block.ratio > 0)) return `${at}: aspect ratio must be positive`;
                break;
        }
    }
    return null;
}

/** Drops blank lines/items so the payload passes validation. */
export function cleanBlocks(blocks: ContentBlock[]): ContentBlock[] {
    return blocks.map((block) => {
        switch (block.type) {
            case "heading":
            case "paragraph":
                return { ...block, text: block.text.trim() };
            case "field":
                return { ...block, label: block.label.trim(), lines: block.lines.map((l) => l.trim()).filter(Boolean) };
            case "list":
                return { ...block, items: block.items.map((l) => l.trim()).filter(Boolean) };
            case "links":
                return { ...block, items: block.items.filter((l) => l.label.trim() && l.href.trim()) };
            case "image":
                return { ...block, alt: block.alt.trim() };
        }
    });
}

function BlockFields({ block, onChange }: { block: ContentBlock; onChange: (next: ContentBlock) => void }) {
    switch (block.type) {
        case "heading":
            return <TextField fullWidth size="small" label="Heading" value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} />;
        case "paragraph":
            return (
                <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    size="small"
                    label="Paragraph"
                    value={block.text}
                    onChange={(e) => onChange({ ...block, text: e.target.value })}
                />
            );
        case "field":
            return (
                <Stack spacing={1.5}>
                    <TextField size="small" label="Caption" value={block.label} onChange={(e) => onChange({ ...block, label: e.target.value })} sx={{ maxWidth: 280 }} />
                    <StringListField label="Lines" value={block.lines} onChange={(lines) => onChange({ ...block, lines })} multiline addLabel="Add line" />
                </Stack>
            );
        case "list":
            return <StringListField label="Items" value={block.items} onChange={(items) => onChange({ ...block, items })} addLabel="Add item" />;
        case "links":
            return (
                <Stack spacing={1}>
                    {block.items.map((link, index) => (
                        <Stack key={index} direction={{ xs: "column", sm: "row" }} spacing={1}>
                            <TextField
                                size="small"
                                label="Label"
                                value={link.label}
                                sx={{ flex: 1 }}
                                onChange={(e) => onChange({ ...block, items: block.items.map((l, i) => (i === index ? { ...l, label: e.target.value } : l)) })}
                            />
                            <TextField
                                size="small"
                                label="URL"
                                value={link.href}
                                sx={{ flex: 2 }}
                                onChange={(e) => onChange({ ...block, items: block.items.map((l, i) => (i === index ? { ...l, href: e.target.value } : l)) })}
                            />
                            <IconButton aria-label="Remove link" onClick={() => onChange({ ...block, items: block.items.filter((_, i) => i !== index) })}>
                                <MdDeleteOutline />
                            </IconButton>
                        </Stack>
                    ))}
                    <Box>
                        <Button size="small" startIcon={<MdAdd />} onClick={() => onChange({ ...block, items: [...block.items, { label: "", href: "" }] })}>
                            Add link
                        </Button>
                    </Box>
                </Stack>
            );
        case "image":
            return (
                <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "320px 1fr" } }}>
                    <ImageUploadField
                        label="Image"
                        value={block.src || null}
                        folder="content-images"
                        onChange={(src) => {
                            if (!src) return onChange({ ...block, src: "" });
                            // Keep the real aspect ratio so the student view reserves the right space.
                            const img = new window.Image();
                            img.onload = () => onChange({ ...block, src, ratio: img.naturalWidth / img.naturalHeight || block.ratio });
                            img.onerror = () => onChange({ ...block, src });
                            img.src = src;
                        }}
                    />
                    <Stack spacing={1.5}>
                        <TextField size="small" label="Alt text" value={block.alt} onChange={(e) => onChange({ ...block, alt: e.target.value })} />
                        <TextField
                            size="small"
                            type="number"
                            label="Aspect ratio (width / height)"
                            value={Number.isFinite(block.ratio) ? Number(block.ratio.toFixed(4)) : ""}
                            onChange={(e) => onChange({ ...block, ratio: Number(e.target.value) })}
                            slotProps={{ htmlInput: { step: 0.01, min: 0.1 } }}
                        />
                    </Stack>
                </Box>
            );
    }
}

/** Ordered rich-content editor producing `ContentBlock[]`. */
export default function ContentBlocksEditor({ value, onChange, emptyHint }: { value: ContentBlock[]; onChange: (next: ContentBlock[]) => void; emptyHint?: string }) {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);

    const update = (index: number, next: ContentBlock) => onChange(value.map((b, i) => (i === index ? next : b)));
    const move = (index: number, dir: -1 | 1) => {
        const target = index + dir;
        if (target < 0 || target >= value.length) return;
        const next = [...value];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    };

    return (
        <Stack spacing={1.5}>
            {!value.length && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center", border: "1px dashed rgba(255,255,255,0.12)", borderRadius: "14px" }}>
                    {emptyHint ?? "No content yet — add a heading, paragraph, list or image."}
                </Typography>
            )}
            {value.map((block, index) => (
                <Box key={index} sx={{ p: 1.5, borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", bgcolor: "rgba(255,255,255,0.02)" }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.6, flex: 1 }}>
                            {index + 1}. {BLOCK_TYPES.find((t) => t.type === block.type)?.label}
                        </Typography>
                        <Tooltip title="Move up">
                            <span>
                                <IconButton size="small" disabled={index === 0} onClick={() => move(index, -1)}>
                                    <MdArrowUpward />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Move down">
                            <span>
                                <IconButton size="small" disabled={index === value.length - 1} onClick={() => move(index, 1)}>
                                    <MdArrowDownward />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Remove block">
                            <IconButton size="small" color="error" onClick={() => onChange(value.filter((_, i) => i !== index))}>
                                <MdDeleteOutline />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                    <BlockFields block={block} onChange={(next) => update(index, next)} />
                </Box>
            ))}
            <Box>
                <Button size="small" variant="outlined" startIcon={<MdAdd />} onClick={(e) => setAnchor(e.currentTarget)}>
                    Add block
                </Button>
                <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
                    {BLOCK_TYPES.map((t) => (
                        <MenuItem
                            key={t.type}
                            onClick={() => {
                                onChange([...value, emptyBlock(t.type)]);
                                setAnchor(null);
                            }}
                        >
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {t.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {t.hint}
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))}
                </Menu>
            </Box>
        </Stack>
    );
}
