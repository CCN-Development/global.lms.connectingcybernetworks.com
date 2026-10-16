"use client";

import React from "react";
import PlacementDashboardLayout from "@/layouts/PlacementDashboardLayout";
import StaffForumLayout from "@/components/community/staff/StaffForumLayout";

export default function CcnForumLayout({ children }: { children: React.ReactNode }) {
    return (
        <StaffForumLayout basePath="/dashboard/placement/ccn-forum" Layout={PlacementDashboardLayout}>
            {children}
        </StaffForumLayout>
    );
}