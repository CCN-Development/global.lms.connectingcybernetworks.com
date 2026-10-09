"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Box, Button, Drawer, Typography } from "@mui/material";
import { MdOutlineScience } from "react-icons/md";
import LabCard from "@/components/practice-labs/LabCard";
import LabFilters, { EMPTY_LAB_FILTERS, type LabFilterState } from "@/components/practice-labs/LabFilters";
import { PRACTICE_LABS, labAsset, type PracticeLab } from "@/components/practice-labs/lab-data";
import { lato } from "@/components/dashboard/home/shared";
import { gradientBorder } from "@/components/aish/tokens";

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
                gridTemplateColumns: { xs: "1fr", md: "260px 1fr", lg: "298px 1fr" },
                gap: { xs: "16px", lg: "24px" },
                alignItems: "flex-start",
            }}
        >
            {/* Filters — sticky full-height rail on desktop */}
            <Box
                sx={{
                    display: { xs: "none", md: "block" },
                    position: "sticky",
                    top: 0,
                    height: "calc(100dvh - 112px)",
                    minHeight: 480,
                }}
            >
                {panel}
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: "16px", sm: "24px" }, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <Typography noWrap sx={{ ...lato(18, 27, 500, "#D9D9D9"), fontSize: { xs: "16px", sm: "18px" } }}>
                        Total {filtered.length} labs in {COURSE_NAME}
                    </Typography>

                    <Button
                        onClick={() => setDrawerOpen(true)}
                        startIcon={<Image src={labAsset("icon-filter.svg")} alt="" width={16} height={16} />}
                        sx={{
                            display: { xs: "inline-flex", md: "none" },
                            flexShrink: 0,
                            px: "12px",
                            height: 36,
                            borderRadius: "10px",
                            border: "2px solid rgba(227,233,248,0.1)",
                            ...lato(14, 21, 500, "#D9D9D9"),
                            textTransform: "none",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
                        }}
                    >
                        Filters{activeCount > 0 ? ` (${activeCount})` : ""}
                    </Button>
                </Box>

                {filtered.length === 0 ? (
                    <Box
                        sx={{
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            py: 6,
                            borderRadius: "24px",
                            bgcolor: "rgba(9,9,21,0.44)",
                            "&::before": gradientBorder(),
                        }}
                    >
                        <MdOutlineScience size={26} color="#737373" />
                        <Typography sx={lato(14, 21, 500, "#A6A6A6")}>No labs match the selected filters.</Typography>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 270px), 1fr))",
                            gap: "24px",
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
                slotProps={{ paper: { sx: { bgcolor: "#07070d", width: 290, maxWidth: "85vw", p: "8px" } } }}
            >
                {panel}
            </Drawer>
        </Box>
    );
}
