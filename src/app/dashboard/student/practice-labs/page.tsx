"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Drawer, Typography } from "@mui/material";
import { MdFilterList, MdOutlineScience } from "react-icons/md";
import LabCard from "@/components/practice-labs/LabCard";
import LabFilters, { EMPTY_LAB_FILTERS, type LabFilterState } from "@/components/practice-labs/LabFilters";
import { PRACTICE_LABS, type PracticeLab } from "@/components/practice-labs/lab-data";

const COURSE_NAME = "CCNA Course";

function statusOf(lab: PracticeLab) {
    if (lab.progress >= 100) return "Completed";
    if (lab.progress > 0) return "In Progress";
    return "Not Started";
}

function durationBucket(minutes: number) {
    if (minutes < 20) return "Under 20 min";
    if (minutes <= 45) return "20 - 45 min";
    return "45 min +";
}

function matches(lab: PracticeLab, filters: LabFilterState) {
    const checks: [string[], string][] = [
        [filters.status, statusOf(lab)],
        [filters.difficulty, lab.difficulty],
        [filters.access, lab.access],
        [filters.category, lab.category],
        [filters.duration, durationBucket(lab.durationMinutes)],
        [filters.roomType, lab.roomType],
    ];
    return checks.every(([selected, value]) => selected.length === 0 || selected.includes(value));
}

export default function PracticeLabsPage() {
    const router = useRouter();
    const [filters, setFilters] = useState<LabFilterState>(EMPTY_LAB_FILTERS);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const filtered = useMemo(() => PRACTICE_LABS.filter((lab) => matches(lab, filters)), [filters]);
    const activeCount = Object.values(filters).reduce((sum, list) => sum + list.length, 0);

    const panel = (
        <LabFilters
            applied={filters}
            onApply={(next) => {
                setFilters(next);
                setDrawerOpen(false);
            }}
            onClear={() => setFilters(EMPTY_LAB_FILTERS)}
        />
    );

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "230px 1fr", lg: "250px 1fr" },
                gap: 1.5,
                alignItems: "flex-start",
            }}
        >
            {/* Filters — sticky rail on desktop */}
            <Box sx={{ display: { xs: "none", md: "block" }, position: "sticky", top: 0 }}>{panel}</Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
                        <MdOutlineScience size={16} color="#7c3aed" />
                        <Typography noWrap sx={{ color: "#e4e4ec", fontSize: "0.85rem", fontWeight: 600 }}>
                            Total {filtered.length} labs in {COURSE_NAME}
                        </Typography>
                    </Box>

                    <Button
                        onClick={() => setDrawerOpen(true)}
                        startIcon={<MdFilterList size={15} />}
                        sx={{
                            display: { xs: "inline-flex", md: "none" },
                            flexShrink: 0,
                            px: 1.25,
                            py: 0.5,
                            borderRadius: "8px",
                            border: "1px solid #2b2b38",
                            bgcolor: "#15151d",
                            color: "#c9c9d4",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            textTransform: "none",
                            "&:hover": { borderColor: "#7c3aed", bgcolor: "#1d1d28" },
                        }}
                    >
                        Filters{activeCount > 0 ? ` (${activeCount})` : ""}
                    </Button>
                </Box>

                {filtered.length === 0 ? (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                            py: 6,
                            borderRadius: "14px",
                            border: "1px solid #1c1c26",
                            bgcolor: "#0b0b12",
                        }}
                    >
                        <MdOutlineScience size={26} color="#4b4b58" />
                        <Typography sx={{ color: "#8a8a9a", fontSize: "0.82rem" }}>
                            No labs match the selected filters.
                        </Typography>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, minmax(0, 1fr))",
                                xl: "repeat(3, minmax(0, 1fr))",
                            },
                            gap: 1.5,
                        }}
                    >
                        {filtered.map((lab) => (
                            <LabCard
                                key={lab.practiceLabId}
                                lab={lab}
                                onClick={() => router.push(`/dashboard/student/practice-labs/${lab.practiceLabId}`)}
                            />
                        ))}
                    </Box>
                )}
            </Box>

            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                slotProps={{ paper: { sx: { bgcolor: "#07070d", width: 270, p: 1.25 } } }}
            >
                {panel}
            </Drawer>
        </Box>
    );
}
