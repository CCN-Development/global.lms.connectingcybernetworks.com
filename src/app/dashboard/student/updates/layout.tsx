"use client";

import { useParams } from "next/navigation";
import StudentLayout from "@/layouts/StudentLayout";
import StudentHeader from "@/layouts/StudentHeader";
import { UpdatesProvider } from "@/contexts/UpdatesContext";

export default function UpdatesLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const isDetail = Boolean(params?.slug);

    // Detail pages are full-width reading views in the design — no sidebar.
    if (isDetail) return <UpdatesProvider>{children}</UpdatesProvider>;

    return (
        <StudentLayout header={<StudentHeader title="News & Updates" />} headerMobileOnly>
            <UpdatesProvider>{children}</UpdatesProvider>
        </StudentLayout>
    );
}
