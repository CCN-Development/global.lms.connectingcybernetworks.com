"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
    SAMPLE_REQUESTS,
    type DateRange,
    type SampleRequest,
    type SortOption,
} from "@/components/requests/request-data";

interface RequestFiltersValue {
    search: string;
    setSearch: (value: string) => void;
    sort: SortOption;
    setSort: (value: SortOption) => void;
    dateRange: DateRange;
    setDateRange: (value: DateRange) => void;
    /** Static sample requests (backend intentionally not wired in yet). */
    requests: SampleRequest[];
    addRequest: (request: SampleRequest) => void;
    withdrawRequest: (id: string) => void;
    setFeedback: (id: string, value: "up" | "down") => void;
}

const RequestFiltersContext = createContext<RequestFiltersValue | null>(null);

export function RequestFiltersProvider({ children }: { children: ReactNode }) {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortOption>("newest");
    const [dateRange, setDateRange] = useState<DateRange>("all");
    const [requests, setRequests] = useState<SampleRequest[]>(SAMPLE_REQUESTS);

    const addRequest = useCallback((request: SampleRequest) => setRequests((list) => [request, ...list]), []);
    const withdrawRequest = useCallback((id: string) => setRequests((list) => list.filter((r) => r.id !== id)), []);
    const setFeedback = useCallback(
        (id: string, value: "up" | "down") =>
            setRequests((list) => list.map((r) => (r.id === id ? { ...r, feedback: value } : r))),
        [],
    );

    const value = useMemo<RequestFiltersValue>(
        () => ({ search, setSearch, sort, setSort, dateRange, setDateRange, requests, addRequest, withdrawRequest, setFeedback }),
        [search, sort, dateRange, requests, addRequest, withdrawRequest, setFeedback],
    );

    return <RequestFiltersContext.Provider value={value}>{children}</RequestFiltersContext.Provider>;
}

export function useRequestFilters(): RequestFiltersValue {
    const ctx = useContext(RequestFiltersContext);
    if (!ctx) throw new Error("useRequestFilters must be used inside <RequestFiltersProvider>");
    return ctx;
}
