"use client";

import React from "react";
import { useParams } from "next/navigation";
import CommunityFeed from "../CommunityFeed";
import CommunityRoot from "../CommunityRoot";
import ThreadHeader from "../ThreadHeader";
import ThreadView from "../ThreadView";

/** Any role dashboard layout (Admin, RM, Trainer, Accountant, Placement …). */
export type RoleDashboardLayout = React.ComponentType<{ children?: React.ReactNode; title?: React.ReactNode }>;

interface StaffForumLayoutProps {
    children: React.ReactNode;
    /** Route of the forum home, e.g. /dashboard/rm/ccn-forum. */
    basePath: string;
    Layout: RoleDashboardLayout;
    title?: string;
}

/**
 * CCN Forum for staff: the student community UI plus moderation and management views, mounted inside a
 * role's dashboard layout. Each role only needs `ccn-forum/layout.tsx`, `page.tsx` and `[thread_id]/page.tsx`.
 */
export default function StaffForumLayout({ children, basePath, Layout, title = "CCN Forum" }: StaffForumLayoutProps) {
    const params = useParams();
    const threadId = params?.thread_id as string | undefined;
    return (
        <CommunityRoot basePath={basePath} variant="staff">
            <Layout title={threadId ? <ThreadHeader /> : <ThreadHeader title={title} />}>{children}</Layout>
        </CommunityRoot>
    );
}

export function StaffForumHome() {
    return <CommunityFeed />;
}

export function StaffForumThread() {
    const params = useParams();
    return <ThreadView threadId={params.thread_id as string} />;
}
