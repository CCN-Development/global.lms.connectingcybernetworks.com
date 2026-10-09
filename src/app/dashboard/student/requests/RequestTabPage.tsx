"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import RequestGrid from "@/components/requests/RequestGrid";
import RequestDetailDrawer from "@/components/requests/RequestDetailDrawer";
import { inDateRange, type RequestTab, type SampleRequest } from "@/components/requests/request-data";
import { useRequestFilters } from "./filters";

export default function RequestTabPage({ tab, emptyLabel }: { tab: RequestTab; emptyLabel: string }) {
    const { requests, search, sort, dateRange, withdrawRequest, setFeedback } = useRequestFilters();

    const [selected, setSelected] = useState<SampleRequest | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const visible = useMemo(() => {
        const query = search.trim().toLowerCase();
        return requests
            .filter((r) => r.tab === tab)
            .filter((r) => inDateRange(r.createdAt, dateRange))
            .filter((r) => !query || [r.category, r.tag, r.title, r.description].some((field) => field.toLowerCase().includes(query)))
            .sort((a, b) => {
                const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                return sort === "newest" ? diff : -diff;
            });
    }, [requests, tab, search, sort, dateRange]);

    const openRequest = (request: SampleRequest) => {
        setSelected(request);
        setDrawerOpen(true);
    };

    const handleWithdraw = (request: SampleRequest) => {
        withdrawRequest(request.id);
        setDrawerOpen(false);
        toast.success(`${request.category} request withdrawn`);
    };

    return (
        <>
            <RequestGrid
                requests={visible}
                emptyLabel={search || dateRange !== "all" ? "No requests match your filters." : emptyLabel}
                onView={openRequest}
                onWithdraw={tab === "active" ? handleWithdraw : undefined}
            />

            <RequestDetailDrawer
                open={drawerOpen}
                request={selected}
                onClose={() => setDrawerOpen(false)}
                onWithdraw={handleWithdraw}
                onFeedback={(request, value) => {
                    setFeedback(request.id, value);
                    setSelected({ ...request, feedback: value });
                }}
            />
        </>
    );
}
