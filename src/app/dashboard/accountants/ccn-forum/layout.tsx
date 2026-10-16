"use client";

import React from "react";
import AccountantDashboardLayout from "@/layouts/AccountantDashboardLayout";
import StaffForumLayout from "@/components/community/staff/StaffForumLayout";

export default function CcnForumLayout({ children }: { children: React.ReactNode }) {
    return (
        <StaffForumLayout basePath="/dashboard/accountants/ccn-forum" Layout={AccountantDashboardLayout}>
            {children}
        </StaffForumLayout>
    );
}