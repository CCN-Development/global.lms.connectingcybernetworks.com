"use client";

import React, { useMemo, useState } from "react";
import { ArticleCard } from "@/components/placement/PlacementHub";
import { EmptyState, FilterSelection, FilterSidebar, ListPageLayout, ResultsCount, matchesFilters } from "@/components/placement/Filters";
import { QuickActionColumn } from "@/components/placement/JobCards";
import { PREP_ARTICLES } from "@/components/placement/jobs-data";
import { PREP_FILTER_GROUPS, prepFilterValues } from "@/components/placement/list-filters";

export default function InterviewPreparationPage() {
    const [selection, setSelection] = useState<FilterSelection>({});
    const results = useMemo(() => PREP_ARTICLES.filter((article) => matchesFilters(selection, (group) => prepFilterValues(article, group))), [selection]);

    return (
        <ListPageLayout
            filters={<FilterSidebar groups={PREP_FILTER_GROUPS} selection={selection} onChange={setSelection} />}
            aside={<QuickActionColumn ids={["resume", "request", "jobs"]} />}
        >
            <ResultsCount count={results.length} />
            {results.length ? (
                results.map((article) => <ArticleCard key={article.slug} article={article} />)
            ) : (
                <EmptyState title="No articles match your filters" body="Try removing a filter." />
            )}
        </ListPageLayout>
    );
}
