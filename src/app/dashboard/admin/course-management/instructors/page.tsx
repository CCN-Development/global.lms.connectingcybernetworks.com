import AdminDashboardLayout from "@/layouts/AdminDashboardLayout";
import InstructorsManager from "@/components/course-admin/InstructorsManager";

export default function CourseInstructorsPage() {
    return (
        <AdminDashboardLayout title="Course Management">
            <InstructorsManager />
        </AdminDashboardLayout>
    );
}
