"use client";

import React from "react";
import TrainerDashboardLayout from "@/layouts/TrainerDashboardLayout";
import StaffForumLayout from "@/components/community/staff/StaffForumLayout";

export default function CcnForumLayout({ children }: { children: React.ReactNode }) {
    return (
        <StaffForumLayout basePath="/dashboard/trainer/ccn-forum" Layout={TrainerDashboardLayout}>
            {children}
        </StaffForumLayout>
    );
}