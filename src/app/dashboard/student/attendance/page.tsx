"use client";

import React from "react";
import StudentLayout from "@/layouts/StudentLayout";
import StudentHeader from "@/layouts/StudentHeader";
import AttendanceView from "@/components/attendance/AttendanceView";

export default function AttendancePage() {
    return (
        <StudentLayout header={<StudentHeader title="My Attendance" />}>
            <AttendanceView />
        </StudentLayout>
    );
}
