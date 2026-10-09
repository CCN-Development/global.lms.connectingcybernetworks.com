"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, ButtonBase, Menu, MenuItem, MenuList, Popover, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { FONT_INTER } from "@/components/aish/tokens";
import { Attachment, CATEGORIES, CategoryId, CC, findCategory, MAX_TAGS, TAGS } from "./community-data";
import { CategorySwatch, dropdownItemSx, dropdownPaperSx, ellipsis, Icon, LmsButton, TagChip, TEXT, CommunityModal } from "./community-ui";
import CommunityEditor from "./CommunityEditor";
import { useCommunity } from "./CommunityContext";

// ─── Outlined field with the design's floating label ───────────────────────
interface FloatingFieldProps {
    label: string;
    /** Text shown inside the empty field (defaults to the label). */
    emptyLabel?: string;
    required?: boolean;
    filled: boolean;
    focused?: boolean;
    error?: string;
    trailing?: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    fieldRef?: React.Ref<HTMLDivElement>;
    children: React.ReactNode;
    htmlFor?: string;
}

function FloatingField({ label, emptyLabel, required, filled, focused, error, trailing, onClick, fieldRef, children, htmlFor }: FloatingFieldProps) {
    const floating = filled || focused;
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: 0 }}>
            <Box
                ref={fieldRef}
                onClick={onClick ?? (() => htmlFor && document.getElementById(htmlFor)?.focus())}
                sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    minHeight: 62,
                    px: "16px",
                    py: "10px",
                    borderRadius: "8px",
                    border: `1px solid ${error ? CC.error : focused ? CC.primary200 : CC.primary75}`,
                    cursor: onClick ? "pointer" : "text",
                    transition: "border-color .15s ease",
                }}
            >
                <Box
                    component="label"
                    htmlFor={htmlFor}
                    sx={{
                        position: "absolute",
                        display: "flex",
                        gap: "4px",
                        alignItems: "center",
                        p: floating ? "4px" : 0,
                        left: floating ? "13px" : "24px",
                        top: floating ? "-17px" : "50%",
                        transform: floating ? "none" : "translateY(-50%)",
                        borderRadius: "2px",
                        bgcolor: floating ? "#03050B" : "transparent",
                        fontFamily: FONT_INTER,
                        fontSize: "16px",
                        lineHeight: "24px",
                        whiteSpace: "nowrap",
                        maxWidth: "calc(100% - 56px)",
                        pointerEvents: "none",
                        transition: "top .15s ease, left .15s ease, transform .15s ease",
                        zIndex: 1,
                    }}
                >
                    <Box component="span" sx={{ fontWeight: floating ? 400 : 500, color: floating ? CC.n300 : CC.white, ...ellipsis }}>
                        {floating ? label : (emptyLabel ?? label)}
                    </Box>
                    {required && (
                        <Box component="span" sx={{ fontWeight: 500, color: CC.error }}>
                            *
                        </Box>
                    )}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, p: "8px", opacity: floating ? 1 : 0 }}>{children}</Box>
                {trailing}
            </Box>
            {error && <Typography sx={{ ...TEXT.reg14, color: CC.error, pl: "4px" }}>{error}</Typography>}
        </Box>
    );
}

// ─── Modal ─────────────────────────────────────────────────────────────────
export default function NewDiscussionModal() {
    const router = useRouter();
    const { newDiscussionOpen, closeNewDiscussion, createPost } = useCommunity();
    const [title, setTitle] = useState("");
    const [titleFocused, setTitleFocused] = useState(false);
    const [categoryId, setCategoryId] = useState<CategoryId | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [html, setHtml] = useState("");
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [categoryAnchor, setCategoryAnchor] = useState<HTMLElement | null>(null);
    const [tagAnchor, setTagAnchor] = useState<HTMLElement | null>(null);
    const categoryRef = useRef<HTMLDivElement>(null);
    const tagRef = useRef<HTMLDivElement>(null);

    const titleError = submitted && !title.trim() ? "Please add a topic title" : undefined;
    const categoryError = submitted && !categoryId ? "Please select a category" : undefined;

    const reset = () => {
        setTitle("");
        setCategoryId(null);
        setTags([]);
        setHtml("");
        setAttachments([]);
        setSubmitted(false);
    };

    const handleClose = () => {
        closeNewDiscussion();
        reset();
    };

    const toggleTag = (tag: string) => {
        if (tags.includes(tag)) return setTags(tags.filter((t) => t !== tag));
        if (tags.length >= MAX_TAGS) return void toast.error(`You can add upto ${MAX_TAGS} tags only`);
        setTags([...tags, tag]);
    };

    const handleCreate = () => {
        setSubmitted(true);
        if (!title.trim() || !categoryId) return;
        if (attachments.some((a) => a.progress < 100)) return void toast.error("Please wait for the uploads to finish");
        const post = createPost({ title: title.trim(), categoryId, tags, html, attachments });
        toast.success("Discussion created");
        handleClose();
        router.push(`/dashboard/student/community/${post.id}`);
    };

    const category = categoryId ? findCategory(categoryId) : null;
    const remainingTags = TAGS.filter((t) => !tags.includes(t));
    const chevron = (open: boolean) => (
        <Icon name="icon-chevron-down-field.svg" size={24} sx={{ transition: "transform .15s ease", transform: open ? "rotate(180deg)" : "none" }} />
    );

    return (
        <CommunityModal open={newDiscussionOpen} onClose={handleClose} title="New Discussion" width={650}>
            <Box
                component="form"
                noValidate
                onSubmit={(e: React.FormEvent) => {
                    e.preventDefault();
                    handleCreate();
                }}
                sx={{ display: "flex", flexDirection: "column", gap: "32px" }}
            >
                <FloatingField
                    label="Topic Title"
                    emptyLabel="Topic Title : Please keep it short and descriptive"
                    required
                    filled={Boolean(title)}
                    focused={titleFocused}
                    error={titleError}
                    htmlFor="community-topic-title"
                >
                    <Box
                        component="input"
                        id="community-topic-title"
                        value={title}
                        maxLength={140}
                        autoComplete="off"
                        onFocus={() => setTitleFocused(true)}
                        onBlur={() => setTitleFocused(false)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                        sx={{
                            width: "100%",
                            border: "none",
                            outline: "none",
                            bgcolor: "transparent",
                            color: CC.white,
                            fontFamily: FONT_INTER,
                            fontWeight: 500,
                            fontSize: { xs: "16px", sm: "18px" },
                            lineHeight: "27px",
                            p: 0,
                        }}
                    />
                </FloatingField>

                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: { xs: "32px", sm: "16px" } }}>
                    <FloatingField
                        label="Select category"
                        required
                        filled={Boolean(category)}
                        focused={Boolean(categoryAnchor)}
                        error={categoryError}
                        fieldRef={categoryRef}
                        onClick={() => setCategoryAnchor(categoryRef.current)}
                        trailing={chevron(Boolean(categoryAnchor))}
                    >
                        <ButtonBase
                            aria-haspopup="listbox"
                            aria-label="Select category"
                            sx={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", justifyContent: "flex-start", minHeight: 24 }}
                        >
                            {category && (
                                <>
                                    <CategorySwatch color={category.color} />
                                    <Typography sx={{ ...TEXT.med16, color: CC.n200, ...ellipsis }}>{category.label}</Typography>
                                </>
                            )}
                        </ButtonBase>
                    </FloatingField>

                    <FloatingField
                        label="Add optional tags"
                        required
                        filled={tags.length > 0}
                        focused={Boolean(tagAnchor)}
                        fieldRef={tagRef}
                        onClick={() => setTagAnchor(tagRef.current)}
                        trailing={chevron(Boolean(tagAnchor))}
                    >
                        <ButtonBase aria-haspopup="listbox" aria-label="Add optional tags" sx={{ width: "100%", justifyContent: "flex-start", minHeight: 24 }}>
                            <Typography sx={{ ...TEXT.med16, color: CC.n200, ...ellipsis }}>{tags.join(", ")}</Typography>
                        </ButtonBase>
                    </FloatingField>
                </Box>

                <CommunityEditor
                    value={html}
                    onChange={setHtml}
                    placeholder="Type topic description here (optional)"
                    attachments={attachments}
                    setAttachments={setAttachments}
                />

                <Box sx={{ py: "8px" }}>
                    <LmsButton type="submit" sx={{ width: "100%" }}>
                        Create Topic
                    </LmsButton>
                </Box>
            </Box>

            {/* Category dropdown */}
            <Menu
                anchorEl={categoryAnchor}
                open={Boolean(categoryAnchor)}
                onClose={() => setCategoryAnchor(null)}
                slotProps={{ paper: { sx: { ...dropdownPaperSx, width: categoryAnchor?.offsetWidth ?? 281 } } }}
            >
                {CATEGORIES.map((c) => (
                    <MenuItem
                        key={c.id}
                        selected={c.id === categoryId}
                        onClick={() => {
                            setCategoryId(c.id);
                            setCategoryAnchor(null);
                        }}
                        sx={dropdownItemSx(c.id === categoryId)}
                    >
                        <CategorySwatch color={c.color} />
                        {c.label}
                    </MenuItem>
                ))}
            </Menu>

            {/* Tag dropdown */}
            <Popover
                anchorEl={tagAnchor}
                open={Boolean(tagAnchor)}
                onClose={() => setTagAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                slotProps={{ paper: { sx: { ...dropdownPaperSx, width: tagAnchor?.offsetWidth ?? 285 } } }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", px: "16px", py: "12px", borderBottom: "1px solid rgba(0,0,0,0.5)" }}>
                    <Typography sx={{ ...TEXT.reg12, color: CC.n500 }}>You can add upto {MAX_TAGS} tags only</Typography>
                    {tags.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {tags.map((tag) => (
                                <TagChip key={tag} label={tag} onRemove={() => toggleTag(tag)} />
                            ))}
                        </Box>
                    )}
                </Box>
                <MenuList aria-label="Available tags" sx={{ py: 0 }}>
                    {remainingTags.map((tag) => (
                        <MenuItem
                            key={tag}
                            disabled={tags.length >= MAX_TAGS}
                            onClick={() => toggleTag(tag)}
                            sx={dropdownItemSx()}
                        >
                            {tag}
                        </MenuItem>
                    ))}
                    {remainingTags.length === 0 && (
                        <Typography sx={{ ...TEXT.med14, color: CC.n500, px: "16px", py: "12px" }}>All tags added</Typography>
                    )}
                </MenuList>
            </Popover>
        </CommunityModal>
    );
}
