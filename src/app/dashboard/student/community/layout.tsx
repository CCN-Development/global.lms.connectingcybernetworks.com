"use client";

import React from "react";
import { useParams } from "next/navigation";
import StudentLayout from "@/layouts/StudentLayout";
import StudentHeader from "@/layouts/StudentHeader";
import CommunityRoot from "@/components/community/CommunityRoot";
import ThreadHeader from "@/components/community/ThreadHeader";
import { STUDENT_COMMUNITY_PATH } from "@/components/community/community-data";

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const threadId = params?.thread_id as string | undefined;

    return (
        <CommunityRoot basePath={STUDENT_COMMUNITY_PATH}>
            <StudentLayout header={threadId ? <ThreadHeader /> : <StudentHeader title="CCN Community" />}>{children}</StudentLayout>
        </CommunityRoot>
    );
}
