"use client";

import React, { useMemo, useState } from "react";
import { Box } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { EmptyState, FilterSelection, FilterSidebar, ListPageLayout, ResultsCount, matchesFilters } from "./Filters";
import { JobCard, QuickActionColumn, QuickActionId } from "./JobCards";
import { JOBS } from "./jobs-data";
import { JOB_FILTER_GROUPS, JOB_SORTS, JobSort, jobFilterValues, matchesQuery, sortJobs } from "./list-filters";
import { usePlacement } from "./PlacementContext";
import { SortButton } from "./placement-ui";

/** Explore Job Opportunities (all jobs, detailed cards) and Jobs recommended for you (tagged cards). */
export default function JobsListPage({ mode }: { mode: "explore" | "recommended" }) {
    const params = useSearchParams();
    const { favourites } = usePlacement();
    const [query, setQuery] = useState(() => params.get("q") ?? "");
    const [sort, setSort] = useState<JobSort>("relevance");
    const [selection, setSelection] = useState<FilterSelection>(() => (params.get("saved") ? { saved: ["Favourites"] } : ({} as FilterSelection)));

    const source = mode === "recommended" ? JOBS.filter((j) => j.recommendedFor) : JOBS;
    const results = useMemo(
        () =>
            sortJobs(
                source.filter((job) => matchesQuery(job, query) && matchesFilters(selection, (group) => jobFilterValues(job, group, favourites))),
                sort,
            ),
        [source, query, selection, favourites, sort],
    );

    const aside: QuickActionId[] = mode === "recommended" ? ["resume", "jobs", "request", "interview"] : ["resume", "request", "interview"];

    return (
        <ListPageLayout
            filters={
                <FilterSidebar
                    groups={JOB_FILTER_GROUPS}
                    selection={selection}
                    onChange={setSelection}
                    extraPills={query.trim() ? [{ label: `“${query.trim()}”`, onRemove: () => setQuery("") }] : []}
                />
            }
            aside={<QuickActionColumn ids={aside} />}
        >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <ResultsCount count={results.length} />
                <SortButton value={sort} options={[...JOB_SORTS]} onChange={setSort} />
            </Box>
            {results.length ? (
                results.map((job) => <JobCard key={job.id} job={job} variant={mode === "explore" ? "detailed" : "compact"} />)
            ) : (
                <EmptyState title="No jobs match your filters" body="Try removing a filter or searching for a different role." />
            )}
        </ListPageLayout>
    );
}
