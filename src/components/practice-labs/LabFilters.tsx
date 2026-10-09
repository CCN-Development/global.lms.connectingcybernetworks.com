"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Box, Button, ButtonBase, Checkbox, Collapse, FormControlLabel, Typography } from "@mui/material";
import { MdCheck } from "react-icons/md";
import { Line, lato } from "@/components/dashboard/home/shared";
import { FONT_INTER, gradientBorder } from "@/components/aish/tokens";
import { PRACTICE_LABS, labAsset } from "./lab-data";

export interface LabFilterState {
    status: string[];
    difficulty: string[];
    access: string[];
    category: string[];
    duration: string[];
    roomType: string[];
}

export const EMPTY_LAB_FILTERS: LabFilterState = {
    status: [],
    difficulty: [],
    access: [],
    category: [],
    duration: [],
    roomType: [],
};

export const DURATION_OPTIONS = ["Under 20 min", "20 - 45 min", "45 min +"] as const;

type GroupId = keyof LabFilterState;

/** Figma's gradient dividers fade towards the right once flipped. */
export function FadeDivider({ src = labAsset("group-divider.svg") }: { src?: string }) {
    return (
        <Box sx={{ width: "100%", transform: "rotate(180deg)" }}>
            <Line src={src} />
        </Box>
    );
}

const boxIcon = {
    width: 16,
    height: 16,
    borderRadius: "4px",
    border: "1px solid #A6A6A6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
} as const;

function FilterGroup({
    label,
    options,
    selected,
    defaultOpen,
    onToggle,
}: {
    label: string;
    options: readonly string[];
    selected: string[];
    defaultOpen?: boolean;
    onToggle: (option: string) => void;
}) {
    const [open, setOpen] = useState(Boolean(defaultOpen));
    const angle = open ? 96.36 : 107.47;

    return (
        <Box
            sx={{
                width: "100%",
                px: "16px",
                py: "12px",
                borderRadius: "12px",
                backgroundImage: `linear-gradient(${angle}deg, rgba(64,64,64,0.25) 17.578%, rgba(64,64,64,0) 111.58%)`,
            }}
        >
            <ButtonBase
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}
            >
                <Typography noWrap sx={lato(14, 21, 500, "#D9D9D9")}>
                    {label}
                    {selected.length > 0 && ` (${selected.length})`}
                </Typography>
                <Image
                    src={labAsset("icon-chevron-down.svg")}
                    alt=""
                    width={20}
                    height={20}
                    style={{ flexShrink: 0 }}
                />
            </ButtonBase>

            <Collapse in={open} unmountOnExit>
                <Box sx={{ pt: "12px" }}>
                    <FadeDivider />
                </Box>
                <Box sx={{ pt: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    {options.map((option) => (
                        <FormControlLabel
                            key={option}
                            control={
                                <Checkbox
                                    checked={selected.includes(option)}
                                    onChange={() => onToggle(option)}
                                    disableRipple
                                    icon={<Box sx={boxIcon} />}
                                    checkedIcon={
                                        <Box sx={{ ...boxIcon, borderColor: "#F2F2F2" }}>
                                            <MdCheck size={12} color="#FFFFFF" />
                                        </Box>
                                    }
                                    sx={{ p: 0 }}
                                />
                            }
                            label={option}
                            sx={{
                                m: 0,
                                gap: "12px",
                                "& .MuiFormControlLabel-label": { ...lato(14, 21, 500, "#F2F2F2"), whiteSpace: "nowrap" },
                            }}
                        />
                    ))}
                </Box>
            </Collapse>
        </Box>
    );
}

export default function LabFilters({
    applied,
    onApply,
    onClear,
}: {
    applied: LabFilterState;
    onApply: (next: LabFilterState) => void;
    onClear: () => void;
}) {
    const [draft, setDraft] = useState<LabFilterState>(applied);

    const categories = useMemo(
        () => Array.from(new Set(PRACTICE_LABS.map((lab) => lab.category))).sort(),
        [],
    );

    const groups: { id: GroupId; label: string; options: readonly string[]; defaultOpen?: boolean }[] = [
        { id: "status", label: "Status", options: ["Completed", "In Progress", "Not Started"], defaultOpen: true },
        { id: "difficulty", label: "Difficulty", options: ["Easy", "Intermediate", "Hard"] },
        { id: "access", label: "Access", options: ["Free", "Paid"] },
        { id: "category", label: "Category", options: categories },
        { id: "duration", label: "Duration", options: DURATION_OPTIONS },
        { id: "roomType", label: "Room Type", options: ["Guided", "Challenge", "Walkthrough"] },
    ];

    const toggle = (groupId: GroupId, option: string) =>
        setDraft((prev) => ({
            ...prev,
            [groupId]: prev[groupId].includes(option)
                ? prev[groupId].filter((v) => v !== option)
                : [...prev[groupId], option],
        }));

    const draftCount = Object.values(draft).reduce((sum, list) => sum + list.length, 0);

    return (
        <Box
            sx={{
                position: "relative",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "24px",
                p: { xs: "16px", lg: "24px" },
                borderRadius: "24px",
                overflow: "hidden",
                bgcolor: "rgba(9,9,21,0.44)",
                backdropFilter: "blur(4px)",
                "&::before": gradientBorder(),
            }}
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", minHeight: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Image src={labAsset("icon-filter.svg")} alt="" width={20} height={20} />
                        <Typography sx={lato(18, 27, 600, "#BFBFBF")}>Filters</Typography>
                    </Box>
                    {draftCount > 0 && (
                        <ButtonBase
                            onClick={() => {
                                setDraft(EMPTY_LAB_FILTERS);
                                onClear();
                            }}
                            sx={{
                                ...lato(12, 18, 500, "#A6A6A6"),
                                px: "6px",
                                borderRadius: "6px",
                                "&:hover": { color: "#FFFFFF" },
                            }}
                        >
                            Clear all
                        </ButtonBase>
                    )}
                </Box>

                <FadeDivider src={labAsset("filters-divider.svg")} />

                <Box
                    sx={{
                        mt: "8px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        minHeight: 0,
                        overflowY: "auto",
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": { display: "none" },
                    }}
                >
                    {groups.map((group) => (
                        <FilterGroup
                            key={group.id}
                            label={group.label}
                            options={group.options}
                            selected={draft[group.id]}
                            defaultOpen={group.defaultOpen}
                            onToggle={(option) => toggle(group.id, option)}
                        />
                    ))}
                </Box>
            </Box>

            <Button
                fullWidth
                onClick={() => onApply(draft)}
                sx={{
                    flexShrink: 0,
                    height: 44,
                    borderRadius: "10px",
                    border: "2px solid rgba(227,233,248,0.1)",
                    boxShadow: "0 0 8px rgba(255,255,255,0.12)",
                    textTransform: "none",
                    fontFamily: FONT_INTER,
                    fontSize: "14px",
                    lineHeight: "21px",
                    fontWeight: 500,
                    color: "#FFFFFF",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.04)", borderColor: "rgba(227,233,248,0.2)" },
                }}
            >
                Apply Filters
            </Button>
        </Box>
    );
}
