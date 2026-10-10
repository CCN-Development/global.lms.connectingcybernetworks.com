"use client";

import React, { useState } from "react";
import { Box, ButtonBase, Collapse, Drawer, Typography } from "@mui/material";
import { gradientBorder } from "@/components/aish/tokens";
import { Asset, CheckBox, FadeDivider, PL, PTEXT, RemovablePill, cq } from "./placement-ui";

export interface FilterGroup {
    id: string;
    label: string;
    options: { value: string; label: string }[];
}

export type FilterSelection = Record<string, string[]>;

export const countSelected = (selection: FilterSelection) => Object.values(selection).reduce((n, values) => n + values.length, 0);

/** A row matches when every group with a selection contains at least one of the row's values. */
export const matchesFilters = (selection: FilterSelection, valuesFor: (groupId: string) => string[]) =>
    Object.entries(selection).every(([groupId, selected]) => !selected.length || valuesFor(groupId).some((v) => selected.includes(v)));

function FilterMenu({
    group,
    selected,
    defaultOpen,
    onToggle,
}: {
    group: FilterGroup;
    selected: string[];
    defaultOpen: boolean;
    onToggle: (value: string) => void;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <Box sx={{ display: "flex", flexDirection: "column", px: "16px", py: "12px", borderRadius: "12px", backgroundImage: PL.menuBg, overflow: "hidden" }}>
            <ButtonBase
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", textAlign: "left" }}
            >
                <Typography sx={{ ...PTEXT.med14, color: PL.n100 }}>
                    {group.label}
                    {selected.length > 0 && (
                        <Box component="span" sx={{ ml: "6px", color: PL.primary200 }}>
                            ({selected.length})
                        </Box>
                    )}
                </Typography>
                <Asset name="icon-chevron-down-20.svg" width={20} height={20} sx={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s ease" }} />
            </ButtonBase>
            <Collapse in={open}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", pt: "12px" }}>
                    <FadeDivider background={PL.filterDivider} />
                    <Box role="group" aria-label={group.label} sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {group.options.map((option) => {
                            const checked = selected.includes(option.value);
                            return (
                                <ButtonBase
                                    key={option.value}
                                    role="checkbox"
                                    aria-checked={checked}
                                    onClick={() => onToggle(option.value)}
                                    sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "12px", width: "100%" }}
                                >
                                    <CheckBox checked={checked} size={16} />
                                    <Typography sx={{ ...PTEXT.reg14, color: PL.n75 }}>{option.label}</Typography>
                                </ButtonBase>
                            );
                        })}
                    </Box>
                </Box>
            </Collapse>
        </Box>
    );
}

type ExtraPill = { label: string; onRemove: () => void };

interface FilterProps {
    groups: FilterGroup[];
    selection: FilterSelection;
    onChange: (next: FilterSelection) => void;
    /** Non-checkbox criteria (e.g. the hub search query) shown alongside the applied filters. */
    extraPills?: ExtraPill[];
}

function FilterPanel({ groups, selection, onChange, extraPills = [] }: FilterProps) {
    const toggle = (groupId: string, value: string) => {
        const current = selection[groupId] ?? [];
        onChange({ ...selection, [groupId]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] });
    };
    const applied: ExtraPill[] = [
        ...extraPills,
        ...groups.flatMap((g) =>
            (selection[g.id] ?? []).map((value) => ({ label: g.options.find((o) => o.value === value)?.label ?? value, onRemove: () => toggle(g.id, value) })),
        ),
    ];

    return (
        <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "16px" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Asset name="icon-filter.svg" width={20} height={20} />
                    <Typography component="h2" sx={{ ...PTEXT.semi18, color: PL.n200 }}>
                        Applied Filters
                    </Typography>
                </Box>
                {applied.length > 0 && (
                    <ButtonBase
                        onClick={() => {
                            extraPills.forEach((pill) => pill.onRemove());
                            onChange({});
                        }} sx={{ ...PTEXT.med12, color: PL.primary200, "&:hover": { color: "#BBC9ED" } }}>
                        Clear all
                    </ButtonBase>
                )}
            </Box>
            {applied.length > 0 ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {applied.map((pill) => (
                        <RemovablePill key={pill.label} label={pill.label} onRemove={pill.onRemove} />
                    ))}
                </Box>
            ) : (
                <Typography sx={{ ...PTEXT.reg14, color: PL.n500 }}>No filters applied</Typography>
            )}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <FadeDivider background={PL.filterDivider} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {groups.map((group, i) => (
                        <FilterMenu key={group.id} group={group} selected={selection[group.id] ?? []} defaultOpen={i === 0} onToggle={(value) => toggle(group.id, value)} />
                    ))}
                </Box>
            </Box>
        </Box>
    );
}

const panelSx = {
    position: "relative",
    overflow: "hidden",
    p: "32px",
    borderRadius: "32px",
    bgcolor: PL.panelBg,
    backdropFilter: "blur(4px)",
    "&::before": gradientBorder(),
} as const;

/** Left "Applied Filters" panel; collapses into a drawer when the page is narrow. */
export function FilterSidebar(props: FilterProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const count = countSelected(props.selection) + (props.extraPills?.length ?? 0);
    return (
        <>
            <ButtonBase
                onClick={() => setDrawerOpen(true)}
                sx={{
                    display: "flex",
                    alignSelf: "flex-start",
                    alignItems: "center",
                    gap: "8px",
                    height: 40,
                    px: "16px",
                    borderRadius: "50px",
                    border: "1px solid rgba(140,36,255,0.24)",
                    ...PTEXT.med14,
                    color: PL.n75,
                    [cq(860)]: { display: "none" },
                }}
            >
                <Asset name="icon-filter.svg" width={20} height={20} />
                Filters{count > 0 ? ` (${count})` : ""}
            </ButtonBase>
            <Box
                component="aside"
                aria-label="Filters"
                sx={{
                    ...panelSx,
                    display: "none",
                    width: 294,
                    flexShrink: 0,
                    alignSelf: "stretch",
                    minHeight: { md: "calc(100vh - 112px)" },
                    [cq(860)]: { display: "block" },
                }}
            >
                <Asset name="panel-glow.svg" width={1199.49} height={1199.49} sx={{ position: "absolute", top: -873, left: -419 }} />
                <Asset name="panel-glow.svg" width={1199.49} height={1199.49} sx={{ position: "absolute", top: 330, left: -15 }} />
                <FilterPanel {...props} />
            </Box>
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                slotProps={{ paper: { sx: { ...panelSx, width: 320, maxWidth: "88vw", borderRadius: "0 32px 32px 0", bgcolor: "rgba(9,9,21,0.96)", backgroundImage: "none" } } }}
            >
                <FilterPanel {...props} />
            </Drawer>
        </>
    );
}

/**
 * Three-column list layout from the Figma list pages: filters · results · quick actions.
 * Container queries collapse the side columns as the app sidebar eats into the width.
 */
export function ListPageLayout({
    filters,
    children,
    aside,
}: {
    filters: React.ReactNode;
    children: React.ReactNode;
    aside?: React.ReactNode;
}) {
    return (
        <Box sx={{ containerType: "inline-size", pb: "24px" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", [cq(860)]: { flexDirection: "row", alignItems: "flex-start", gap: "24px" } }}>
                {filters}
                <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "16px" }}>{children}</Box>
                {aside && (
                    <Box sx={{ display: "none", flexShrink: 0, [cq(1060)]: { display: "block", width: 300 }, [cq(1240)]: { width: 347 } }}>{aside}</Box>
                )}
            </Box>
        </Box>
    );
}

export function ResultsCount({ count }: { count: number }) {
    return (
        <Typography aria-live="polite" sx={{ ...PTEXT.med16, color: PL.n200 }}>
            {count.toLocaleString("en-IN")} {count === 1 ? "result" : "results"} found
        </Typography>
    );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
    return (
        <Box sx={{ py: "48px", px: "24px", borderRadius: "16px", border: "1px dashed rgba(255,255,255,0.12)", textAlign: "center" }}>
            <Typography sx={{ ...PTEXT.semi18, color: PL.n100 }}>{title}</Typography>
            <Typography sx={{ ...PTEXT.med14, color: PL.n400, mt: "4px" }}>{body}</Typography>
        </Box>
    );
}
