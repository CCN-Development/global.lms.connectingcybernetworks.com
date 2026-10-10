"use client";
import React, { useEffect, useState } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { MdCheck } from "react-icons/md";
import { FONT_LATO, GradientButton } from "@/components/batches/batch-card-ui";
import { BatchModalShell, ModalDivider, ModalSection, ModalTextButton } from "@/components/batches/BatchModalShell";

export type ExploreFilterKey = "mode" | "starts" | "time" | "seats" | "duration";
export type ExploreFilters = Record<ExploreFilterKey, string[]>;

export const EMPTY_FILTERS: ExploreFilters = { mode: [], starts: [], time: [], seats: [], duration: [] };

export function countFilters(filters: ExploreFilters): number {
    return Object.values(filters).reduce((sum, values) => sum + values.length, 0);
}

export interface ExploreFiltersModalProps {
    open: boolean;
    onClose: () => void;
    value: ExploreFilters;
    options: { key: ExploreFilterKey; label: string; options: string[] }[];
    onApply: (filters: ExploreFilters) => void;
}

const MENU_LABEL_SX = { fontFamily: FONT_LATO, fontWeight: 500, fontSize: "14px", lineHeight: "21px", color: "#d9d9d9" };

function Checkbox({ checked }: { checked: boolean }) {
    return (
        <Box
            sx={{
                width: 16,
                height: 16,
                flexShrink: 0,
                borderRadius: "4px",
                border: `1px solid ${checked ? "#2F53AD" : "#a6a6a6"}`,
                bgcolor: checked ? "#2F53AD" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
            }}
        >
            {checked && <MdCheck size={12} />}
        </Box>
    );
}

export default function ExploreFiltersModal({ open, onClose, value, options, onApply }: ExploreFiltersModalProps) {
    const [draft, setDraft] = useState<ExploreFilters>(value);
    const [expanded, setExpanded] = useState<ExploreFilterKey | null>("mode");

    useEffect(() => {
        if (open) setDraft(value);
    }, [open, value]);

    const toggle = (key: ExploreFilterKey, option: string) => {
        setDraft((prev) => ({
            ...prev,
            [key]: prev[key].includes(option) ? prev[key].filter((item) => item !== option) : [...prev[key], option],
        }));
    };

    const selected = options.flatMap(({ key }) => draft[key].map((option) => ({ key, option })));

    return (
        <BatchModalShell open={open} onClose={onClose} width={572} gap={32}>
            <ModalSection gap={16}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Box component="img" src="/batches/explore/icon-filter.svg" alt="" aria-hidden sx={{ width: 20, height: 20 }} />
                    <Typography sx={{ fontFamily: FONT_LATO, fontWeight: 700, fontSize: "18px", lineHeight: "27px", color: "#bfbfbf" }}>
                        Filters
                    </Typography>
                </Box>

                {selected.length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {selected.map(({ key, option }) => (
                            <ButtonBase
                                key={`${key}-${option}`}
                                onClick={() => toggle(key, option)}
                                aria-label={`Remove ${option}`}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    px: "11px",
                                    py: "7px",
                                    borderRadius: "50px",
                                    border: "1px solid rgba(140,36,255,0.24)",
                                    fontFamily: FONT_LATO,
                                    fontWeight: 500,
                                    fontSize: "14px",
                                    lineHeight: "21px",
                                    color: "#f2f2f2",
                                }}
                            >
                                {option}
                                <Box component="img" src="/batches/explore/icon-x-circle-pill.svg" alt="" sx={{ width: 16, height: 16 }} />
                            </ButtonBase>
                        ))}
                    </Box>
                )}

                <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <ModalDivider src="/batches/explore/filter-divider.svg" />
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {options.map((section) => {
                            const open = expanded === section.key;
                            return (
                                <Box
                                    key={section.key}
                                    sx={{
                                        borderRadius: "12px",
                                        overflow: "hidden",
                                        backgroundImage: open
                                            ? "linear-gradient(100.2deg, rgba(64,64,64,0.25) 17.578%, rgba(64,64,64,0) 111.58%)"
                                            : "linear-gradient(122.6deg, rgba(64,64,64,0.25) 17.578%, rgba(64,64,64,0) 111.58%)",
                                    }}
                                >
                                    <ButtonBase
                                        onClick={() => setExpanded(open ? null : section.key)}
                                        aria-expanded={open}
                                        sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", gap: "12px", px: "16px", pt: "12px", pb: open ? 0 : "12px", textAlign: "left" }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <Typography sx={MENU_LABEL_SX}>{section.label}</Typography>
                                            <Box component="img" src="/batches/explore/icon-chevron-down-20.svg" alt="" sx={{ width: 20, height: 20 }} />
                                        </Box>
                                        {open && <ModalDivider src="/batches/explore/filter-menu-divider.svg" />}
                                    </ButtonBase>

                                    {open && (
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", px: "16px", pt: "16px", pb: "12px" }}>
                                            {section.options.length === 0 && (
                                                <Typography sx={{ ...MENU_LABEL_SX, color: "#8c8c8c" }}>No options available</Typography>
                                            )}
                                            {section.options.map((option) => {
                                                const checked = draft[section.key].includes(option);
                                                return (
                                                    <ButtonBase
                                                        key={option}
                                                        role="checkbox"
                                                        aria-checked={checked}
                                                        onClick={() => toggle(section.key, option)}
                                                        sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "12px", width: "100%" }}
                                                    >
                                                        <Checkbox checked={checked} />
                                                        <Typography sx={{ ...MENU_LABEL_SX, color: "#f2f2f2" }}>{option}</Typography>
                                                    </ButtonBase>
                                                );
                                            })}
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </ModalSection>

            <ModalSection sx={{ flexDirection: "row", gap: "10px", py: "8px" }}>
                <ModalTextButton grow onClick={onClose}>Cancel</ModalTextButton>
                <Box sx={{ flex: "1 1 0", display: "flex", minWidth: 0 }}>
                    <GradientButton fullWidth onClick={() => { onApply(draft); onClose(); }}>Apply Filters</GradientButton>
                </Box>
            </ModalSection>
        </BatchModalShell>
    );
}
