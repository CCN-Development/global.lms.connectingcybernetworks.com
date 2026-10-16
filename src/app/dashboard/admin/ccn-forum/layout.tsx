"use client";

import React from "react";
import AdminDashboardLayout from "@/layouts/AdminDashboardLayout";
import StaffForumLayout from "@/components/community/staff/StaffForumLayout";

export default function CcnForumLayout({ children }: { children: React.ReactNode }) {
    return (
        <StaffForumLayout basePath="/dashboard/admin/ccn-forum" Layout={AdminDashboardLayout}>
            {children}
        </StaffForumLayout>
    );
}