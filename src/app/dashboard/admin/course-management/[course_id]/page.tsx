"use client";

import { useParams } from "next/navigation";
import AdminDashboardLayout from "@/layouts/AdminDashboardLayout";
import CourseBuilder from "@/components/course-admin/builder/CourseBuilder";

export default function CourseBuilderPage() {
    const params = useParams<{ course_id: string }>();
    return (
        <AdminDashboardLayout title="Course Management">
            <CourseBuilder key={params.course_id} courseId={params.course_id} />
        </AdminDashboardLayout>
    );
}
