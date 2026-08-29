"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import RequestGrid from "@/components/requests/RequestGrid";
import RequestDetailDrawer from "@/components/requests/RequestDetailDrawer";
import { useRequests, type RequestTab, type StudentRequest } from "@/contexts/RequestContext";
import { useRequestFilters } from "./filters";

const SEARCH_DEBOUNCE_MS = 350;

export default function RequestTabPage({ tab, emptyLabel }: { tab: RequestTab; emptyLabel: string }) {
    const { requestsByTab, loadingRequests, getStudentRequests, getStudentRequestSummary } = useRequests();
    const { search, sort, requestType, refreshKey } = useRequestFilters();

    const [selected, setSelected] = useState<StudentRequest | null>(null);

    const load = useCallback(() => {
        void getStudentRequests({
            tab,
            sort,
            search: search.trim() || undefined,
            requestType: requestType || undefined,
        }).then((res) => {
            if (!res.success) toast.error(res.message ?? "Failed to load requests");
        });
    }, [getStudentRequests, tab, sort, search, requestType]);

    useEffect(() => {
        const timer = setTimeout(load, search ? SEARCH_DEBOUNCE_MS : 0);
        return () => clearTimeout(timer);
        // `refreshKey` re-runs the fetch after a request is created elsewhere.
    }, [load, refreshKey, search]);

    const requests = requestsByTab[tab];

    return (
        <>
            <RequestGrid
                requests={requests}
                loading={loadingRequests && requests.length === 0}
                emptyLabel={emptyLabel}
                onView={setSelected}
            />

            <RequestDetailDrawer
                open={selected !== null}
                request={selected}
                onClose={() => setSelected(null)}
                onChanged={(updated) => {
                    setSelected(updated);
                    load();
                    void getStudentRequestSummary();
                }}
            />
        </>
    );
}
