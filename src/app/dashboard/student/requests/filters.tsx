"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { DateRange, SortOption } from "@/components/requests/request-data";

const SEARCH_DEBOUNCE_MS = 350;

interface RequestFiltersValue {
    search: string;
    setSearch: (value: string) => void;
    /** `search` after the debounce — this is what is sent to the API. */
    debouncedSearch: string;
    sort: SortOption;
    setSort: (value: SortOption) => void;
    dateRange: DateRange;
    setDateRange: (value: DateRange) => void;
}

const RequestFiltersContext = createContext<RequestFiltersValue | null>(null);

/** Toolbar filter state shared by the Active / Resolved / Rejected tabs. */
export function RequestFiltersProvider({ children }: { children: ReactNode }) {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sort, setSort] = useState<SortOption>("newest");
    const [dateRange, setDateRange] = useState<DateRange>("all");

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [search]);

    const value = useMemo<RequestFiltersValue>(
        () => ({ search, setSearch, debouncedSearch, sort, setSort, dateRange, setDateRange }),
        [search, debouncedSearch, sort, dateRange],
    );

    return <RequestFiltersContext.Provider value={value}>{children}</RequestFiltersContext.Provider>;
}

export function useRequestFilters(): RequestFiltersValue {
    const ctx = useContext(RequestFiltersContext);
    if (!ctx) throw new Error("useRequestFilters must be used inside <RequestFiltersProvider>");
    return ctx;
}
