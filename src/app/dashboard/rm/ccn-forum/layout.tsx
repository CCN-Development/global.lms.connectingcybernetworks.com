"use client";

import React from "react";
import RMDashboardLayout from "@/layouts/RMDashboardLayout";
import StaffForumLayout from "@/components/community/staff/StaffForumLayout";

export default function CcnForumLayout({ children }: { children: React.ReactNode }) {
    return (
        <StaffForumLayout basePath="/dashboard/rm/ccn-forum" Layout={RMDashboardLayout}>
            {children}
        </StaffForumLayout>
    );
}