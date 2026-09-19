"use client";

import React, { useMemo, useState } from "react";
import { Box, Button, Checkbox, Collapse, FormControlLabel, Typography } from "@mui/material";
import { MdFilterList, MdKeyboardArrowDown, MdRestartAlt } from "react-icons/md";
import { PRACTICE_LABS } from "./lab-data";

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

const ACCENTS: Record<GroupId, string> = {
    status: "#10b981",
    difficulty: "#f59e0b",
    access: "#06b6d4",
    category: "#009DFF",
    duration: "#f97316",
    roomType: "#7c3aed",
};

function FilterGroup({
    label,
    accent,
    options,
    selected,
    defaultOpen,
    onToggle,
}: {
    label: string;
    accent: string;
    options: readonly string[];
    selected: string[];
    defaultOpen?: boolean;
    onToggle: (option: string) => void;
}) {
    const [open, setOpen] = useState(Boolean(defaultOpen));

    return (
        <Box
            sx={{
                border: `1px solid ${selected.length ? accent : "#23232e"}`,
                borderRadius: "10px",
                bgcolor: "#101018",
                overflow: "hidden",
                transition: "border-color .18s ease",
            }}
        >
            <Box
                onClick={() => setOpen((v) => !v)}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    px: 1.25,
                    py: 1,
                    cursor: "pointer",
                    userSelect: "none",
                    "&:hover": { bgcolor: "#16161f" },
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: accent, flexShrink: 0 }} />
                    <Typography noWrap sx={{ color: "#e4e4ec", fontSize: "0.78rem", fontWeight: 600 }}>
                        {label}
                    </Typography>
                    {selected.length > 0 && (
                        <Box
                            component="span"
                            sx={{
                                bgcolor: accent,
                                color: "#07070d",
                                borderRadius: "999px",
                                px: 0.7,
                                fontSize: "0.6rem",
                                fontWeight: 800,
                                lineHeight: 1.7,
                            }}
                        >
                            {selected.length}
                        </Box>
                    )}
                </Box>
                <MdKeyboardArrowDown
                    size={17}
                    color="#8a8a9a"
                    style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .18s ease", flexShrink: 0 }}
                />
            </Box>

            <Collapse in={open} unmountOnExit>
                <Box sx={{ px: 1.25, pb: 1, display: "flex", flexDirection: "column" }}>
                    {options.map((option) => (
                        <FormControlLabel
                            key={option}
                            control={
                                <Checkbox
                                    size="small"
                                    checked={selected.includes(option)}
                                    onChange={() => onToggle(option)}
                                    sx={{
                                        color: "#3a3a48",
                                        p: 0.5,
                                        "&.Mui-checked": { color: accent },
                                    }}
                                />
                            }
                            label={option}
                            sx={{
                                m: 0,
                                gap: 0.75,
                                "& .MuiFormControlLabel-label": { color: "#b4b4c2", fontSize: "0.74rem" },
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
                display: "flex",
                flexDirection: "column",
                border: "1px solid #1c1c26",
                borderRadius: "14px",
                bgcolor: "#0b0b12",
                p: 1.25,
                gap: 1,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, px: 0.25 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <MdFilterList size={16} color="#7c3aed" />
                    <Typography sx={{ color: "#fff", fontSize: "0.85rem", fontWeight: 700 }}>Filters</Typography>
                </Box>
                {draftCount > 0 && (
                    <Button
                        onClick={() => {
                            setDraft(EMPTY_LAB_FILTERS);
                            onClear();
                        }}
                        startIcon={<MdRestartAlt size={14} />}
                        sx={{
                            minWidth: 0,
                            p: 0.25,
                            color: "#8a8a9a",
                            fontSize: "0.68rem",
                            textTransform: "none",
                            "&:hover": { color: "#f43f5e", bgcolor: "transparent" },
                        }}
                    >
                        Clear
                    </Button>
                )}
            </Box>

            <Box sx={{ height: "1px", bgcolor: "#1c1c26" }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                {groups.map((group) => (
                    <FilterGroup
                        key={group.id}
                        label={group.label}
                        accent={ACCENTS[group.id]}
                        options={group.options}
                        selected={draft[group.id]}
                        defaultOpen={group.defaultOpen}
                        onToggle={(option) => toggle(group.id, option)}
                    />
                ))}
            </Box>

            <Button
                fullWidth
                onClick={() => onApply(draft)}
                sx={{
                    mt: 0.5,
                    py: 0.9,
                    borderRadius: "10px",
                    textTransform: "none",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "#fff",
                    border: "1px solid #2b2b38",
                    bgcolor: "#15151d",
                    "&:hover": { bgcolor: "#1d1d28", borderColor: "#7c3aed" },
                }}
            >
                Apply Filters
            </Button>
        </Box>
    );
}
