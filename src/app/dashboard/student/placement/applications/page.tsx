"use client";

import React, { useMemo, useState } from "react";
import { Box } from "@mui/material";
import { ApplicationCard } from "@/components/placement/Applications";
import { EmptyState, FilterSelection, FilterSidebar, ListPageLayout, ResultsCount, matchesFilters } from "@/components/placement/Filters";
import { usePlacement } from "@/components/placement/PlacementContext";
import { APPLICATION_FILTER_GROUPS, APPLICATION_SORTS, ApplicationSort, applicationFilterValues, sortApplications } from "@/components/placement/list-filters";
import { SortButton } from "@/components/placement/placement-ui";

export default function MyApplicationsPage() {
    const { applications } = usePlacement();
    const [selection, setSelection] = useState<FilterSelection>({});
    const [sort, setSort] = useState<ApplicationSort>("newest");

    const results = useMemo(
        () => sortApplications(applications.filter((a) => matchesFilters(selection, (group) => applicationFilterValues(a, group))), sort),
        [applications, selection, sort],
    );

    return (
        <ListPageLayout filters={<FilterSidebar groups={APPLICATION_FILTER_GROUPS} selection={selection} onChange={setSelection} />}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <ResultsCount count={results.length} />
                <SortButton value={sort} options={[...APPLICATION_SORTS]} onChange={setSort} />
            </Box>
            {results.length ? (
                results.map((application) => <ApplicationCard key={application.id} application={application} actionLabel="Track Application" />)
            ) : (
                <EmptyState
                    title={applications.length ? "No applications match your filters" : "You haven’t applied to any jobs yet"}
                    body={applications.length ? "Try removing a filter." : "Explore jobs and use Easy Apply to get started."}
                />
            )}
        </ListPageLayout>
    );
}
