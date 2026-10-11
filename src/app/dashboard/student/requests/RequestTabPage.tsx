"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import RequestGrid from "@/components/requests/RequestGrid";
import RequestDetailDrawer from "@/components/requests/RequestDetailDrawer";
import { dateRangeStart, type FeedbackValue } from "@/components/requests/request-data";
import { useRequests, type RequestTab, type StudentRequest } from "@/contexts/RequestContext";
import { useRequestFilters } from "./filters";

export default function RequestTabPage({ tab, emptyLabel }: { tab: RequestTab; emptyLabel: string }) {
    const { requestsByTab, loadingRequests, getStudentRequests, withdrawRequest, submitRequestFeedback } = useRequests();
    const { debouncedSearch, sort, dateRange } = useRequestFilters();

    const [selected, setSelected] = useState<StudentRequest | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [fetched, setFetched] = useState(false);

    useEffect(() => {
        void getStudentRequests({
            tab,
            sort,
            search: debouncedSearch || undefined,
            startDate: dateRangeStart(dateRange),
        }).then((res) => {
            setFetched(true);
            if (!res.success) toast.error(res.message ?? "Failed to load requests");
        });
    }, [getStudentRequests, tab, sort, debouncedSearch, dateRange]);

    const requests = requestsByTab[tab];
    const filtered = Boolean(debouncedSearch) || dateRange !== "all";

    const openRequest = (request: StudentRequest) => {
        setSelected(request);
        setDrawerOpen(true);
    };

    const handleWithdraw = async (request: StudentRequest) => {
        if (busyId) return;
        setBusyId(request.requestId);
        const res = await withdrawRequest(request.requestId);
        setBusyId(null);
        if (!res.success) {
            toast.error(res.message ?? "Failed to withdraw request");
            return;
        }
        setDrawerOpen(false);
        toast.success(`${request.requestType} request withdrawn`);
    };

    const handleFeedback = async (request: StudentRequest, value: FeedbackValue) => {
        if (busyId) return;
        setBusyId(request.requestId);
        const res = await submitRequestFeedback(request.requestId, value === "up");
        setBusyId(null);
        if (!res.success || !res.data) {
            toast.error(res.message ?? "Failed to submit feedback");
            return;
        }
        setSelected(res.data);
    };

    return (
        <>
            <RequestGrid
                requests={requests}
                loading={loadingRequests || !fetched}
                emptyLabel={filtered ? "No requests match your filters." : emptyLabel}
                onView={openRequest}
                onWithdraw={tab === "active" ? handleWithdraw : undefined}
            />

            <RequestDetailDrawer
                open={drawerOpen}
                request={selected}
                busy={busyId !== null && busyId === selected?.requestId}
                onClose={() => setDrawerOpen(false)}
                onWithdraw={handleWithdraw}
                onFeedback={handleFeedback}
            />
        </>
    );
}
