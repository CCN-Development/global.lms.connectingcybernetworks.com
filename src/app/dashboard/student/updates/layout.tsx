"use client";

import StudentLayout from "@/layouts/StudentLayout";
import StudentHeader from "@/layouts/StudentHeader";
import { UpdatesProvider } from "@/contexts/UpdatesContext";

export default function UpdatesLayout({ children }: { children: React.ReactNode }) {
    return (
        <StudentLayout header={<StudentHeader title="News & Updates" />}>
            <UpdatesProvider>{children}</UpdatesProvider>
        </StudentLayout>
    );
}
