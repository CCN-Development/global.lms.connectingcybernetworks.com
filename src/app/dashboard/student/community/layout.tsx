"use client";

import React from "react";
import { useParams } from "next/navigation";
import StudentLayout from "@/layouts/StudentLayout";
import StudentHeader from "@/layouts/StudentHeader";
import { CommunityProvider } from "@/components/community/CommunityContext";
import NewDiscussionModal from "@/components/community/NewDiscussionModal";
import ThreadHeader from "@/components/community/ThreadHeader";

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const threadId = params?.thread_id as string | undefined;

    return (
        <CommunityProvider>
            <StudentLayout header={threadId ? <ThreadHeader /> : <StudentHeader title="CCN Community" />}>{children}</StudentLayout>
            <NewDiscussionModal />
        </CommunityProvider>
    );
}
