"use client";

import React, { useMemo, useState } from "react";
import { Box, ButtonBase, Menu, MenuItem, Typography } from "@mui/material";
import Image from "next/image";
import { gradientBorder } from "@/components/aish/tokens";
import { asset, Decor, EdgeGlows, lato, Line, RotatedDecor, SectionHeader, SeeAllButton } from "./shared";
import { TASKS, type TaskItem, type TaskStatus } from "./data";

type SortKey = "due" | "course" | "status";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "due", label: "Due Date" },
    { key: "course", label: "Course" },
    { key: "status", label: "Status" },
];

const STATUS_STYLE: Record<TaskStatus, { bg: string; color: string; weight: number }> = {
    overdue: { bg: "#F6D4D8", color: "#D1293D", weight: 500 },
    pending: { bg: "#FFEFDC", color: "#A75900", weight: 600 },
};

const STATUS_ORDER: Record<TaskStatus, number> = { overdue: 0, pending: 1 };

const SOFT_INNER_SHADOW = "inset 0 -2px 16px rgba(254,254,254,0.08)";

interface YourTasksProps {
    tasks?: TaskItem[];
    onSeeAll?: () => void;
    onViewTask?: (task: TaskItem) => void;
}

function TaskCard({ task, onView }: { task: TaskItem; onView?: () => void }) {
    const status = STATUS_STYLE[task.status];

    return (
        <Box
            sx={{
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                p: "16px",
                borderRadius: "24px",
                minWidth: { xs: 200, sm: 0 },
                scrollSnapAlign: "start",
                "&::before": gradientBorder(),
            }}
        >
            <Decor src={asset("task-card-ellipse.svg")} sx={{ left: -209, top: -187, width: 685, height: 685 }} />

            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "8px" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 24,
                            height: 24,
                            flexShrink: 0,
                            overflow: "hidden",
                            borderRadius: "3.6px",
                            border: "0.6px solid #BFBFBF",
                            bgcolor: "rgba(0,0,0,0.12)",
                            backdropFilter: "blur(9px)",
                            boxShadow: SOFT_INNER_SHADOW,
                        }}
                    >
                        <Image src={asset("icon-flask.svg")} alt="" width={12} height={12} />
                    </Box>
                    <Box
                        sx={{
                            px: "8px",
                            py: "2px",
                            borderRadius: "6px",
                            bgcolor: status.bg,
                            boxShadow: SOFT_INNER_SHADOW,
                            minWidth: 0,
                        }}
                    >
                        <Typography noWrap sx={lato(10, 15, status.weight, status.color)}>
                            {task.statusLabel}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
                    <Typography noWrap sx={lato(12, 18, 500, "#737373")}>
                        {task.course}
                    </Typography>
                    {/* Google Lato has no 600, so it renders 700; tighter tracking keeps Figma's width. */}
                    <Typography noWrap sx={{ ...lato(16, 24, 600, "#FFFFFF"), letterSpacing: "-0.35px" }}>
                        {task.title}
                    </Typography>
                    <Typography noWrap sx={lato(12, 18, 500, "#A6A6A6")}>
                        {task.dueLabel}
                    </Typography>
                </Box>
            </Box>

            <Line src={asset("task-divider.svg")} />

            <ButtonBase
                onClick={onView}
                sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    pl: "16px",
                    pr: "12px",
                    borderRadius: "8px",
                    filter: "drop-shadow(0 0 4px rgba(255,255,255,0.12))",
                    "&:hover .view-label": { color: "#FFFFFF" },
                }}
            >
                <Typography className="view-label" sx={{ ...lato(12, 18, 400, "#D9D9D9"), transition: "color 0.15s" }}>
                    View Details
                </Typography>
                <Image src={asset("icon-arrow-right.svg")} alt="" width={16} height={16} />
            </ButtonBase>

            <EdgeGlows />
        </Box>
    );
}

export default function YourTasks({ tasks = TASKS, onSeeAll, onViewTask }: YourTasksProps) {
    const [sortKey, setSortKey] = useState<SortKey>("due");
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const sortedTasks = useMemo(() => {
        const list = [...tasks];
        if (sortKey === "due") list.sort((a, b) => a.dueAt.localeCompare(b.dueAt));
        if (sortKey === "course") list.sort((a, b) => a.course.localeCompare(b.course));
        if (sortKey === "status") list.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
        return list;
    }, [tasks, sortKey]);

    return (
        <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
            <SectionHeader title="Your Tasks">
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: "12px", sm: "24px" } }}>
                    <ButtonBase
                        onClick={(event) => setAnchorEl(event.currentTarget)}
                        aria-haspopup="menu"
                        aria-expanded={Boolean(anchorEl)}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            height: 32,
                            pl: "16px",
                            pr: "12px",
                            borderRadius: "6px",
                            backdropFilter: "blur(12px)",
                            backgroundImage: "linear-gradient(180deg, rgba(187,201,237,0.08) 0%, rgba(106,114,135,0.05) 100%)",
                        }}
                    >
                        <Typography sx={{ ...lato(14, 21, 500, "#FFFFFF"), whiteSpace: "nowrap" }}>Sort By</Typography>
                        <Image
                            src={asset("icon-chevron-down.svg")}
                            alt=""
                            width={16}
                            height={16}
                            style={{ transform: anchorEl ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}
                        />
                    </ButtonBase>
                    <SeeAllButton onClick={onSeeAll} />
                </Box>
            </SectionHeader>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                slotProps={{
                    paper: {
                        sx: {
                            mt: "6px",
                            minWidth: 140,
                            borderRadius: "8px",
                            bgcolor: "#141418",
                            border: "1px solid rgba(255,255,255,0.12)",
                            color: "#FFFFFF",
                        },
                    },
                }}
            >
                {SORT_OPTIONS.map((option) => (
                    <MenuItem
                        key={option.key}
                        selected={option.key === sortKey}
                        onClick={() => {
                            setSortKey(option.key);
                            setAnchorEl(null);
                        }}
                        sx={{
                            ...lato(14, 21, 500, "#D9D9D9"),
                            "&.Mui-selected": { bgcolor: "rgba(140,36,255,0.24)", color: "#FFFFFF" },
                            "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                        }}
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </Menu>

            <Box
                sx={{
                    position: "relative",
                    display: "grid",
                    gridAutoFlow: { xs: "column", sm: "row" },
                    gridAutoColumns: { xs: "minmax(200px, 72%)", sm: "auto" },
                    gridTemplateColumns: { sm: "repeat(3, minmax(0, 1fr))" },
                    gap: "16px",
                    overflowX: { xs: "auto", sm: "hidden" },
                    overflowY: "hidden",
                    scrollSnapType: "x mandatory",
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                }}
            >
                {sortedTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onView={onViewTask ? () => onViewTask(task) : undefined} />
                ))}
                <RotatedDecor
                    src={asset("tasks-row-glow.svg")}
                    sx={{ left: -4, top: -6, width: 12, height: 380 }}
                    length={380}
                    thickness={12}
                    rotate={90}
                    bleed="-200% -6.32%"
                />
            </Box>
        </Box>
    );
}
