"use client";

import { useParams } from "next/navigation";
import AdminDashboardLayout from "@/layouts/AdminDashboardLayout";
import ExamWorkspace from "@/components/exam-admin/ExamWorkspace";

export default function CourseExamPage() {
    const params = useParams<{ course_id: string }>();
    return (
        <AdminDashboardLayout title="Exam Management">
            <ExamWorkspace key={params.course_id} courseId={params.course_id} />
        </AdminDashboardLayout>
    );
}
