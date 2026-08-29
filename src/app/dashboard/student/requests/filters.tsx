"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type RequestSort = "newest" | "oldest";

interface RequestFiltersValue {
    search: string;
    setSearch: (value: string) => void;
    sort: RequestSort;
    setSort: (value: RequestSort) => void;
    requestType: string;
    setRequestType: (value: string) => void;
    /** Incremented by the layout after a request is created so the active tab refetches. */
    refreshKey: number;
    refresh: () => void;
}

const RequestFiltersContext = createContext<RequestFiltersValue | null>(null);

export function RequestFiltersProvider({ children }: { children: ReactNode }) {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<RequestSort>("newest");
    const [requestType, setRequestType] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const value = useMemo<RequestFiltersValue>(() => ({
        search, setSearch,
        sort, setSort,
        requestType, setRequestType,
        refreshKey,
        refresh: () => setRefreshKey((key) => key + 1),
    }), [search, sort, requestType, refreshKey]);

    return <RequestFiltersContext.Provider value={value}>{children}</RequestFiltersContext.Provider>;
}

export function useRequestFilters(): RequestFiltersValue {
    const ctx = useContext(RequestFiltersContext);
    if (!ctx) throw new Error("useRequestFilters must be used inside <RequestFiltersProvider>");
    return ctx;
}
