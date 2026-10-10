"use client";

import React from "react";
import { useParams } from "next/navigation";
import AttendanceView from "@/components/attendance/AttendanceView";

export default function BatchAttendancePage() {
    const params = useParams();
    const batchId = params?.batch_id as string;
    return <AttendanceView key={batchId} batchId={batchId} />;
}
