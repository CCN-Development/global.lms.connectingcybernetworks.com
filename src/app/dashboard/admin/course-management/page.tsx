import AdminDashboardLayout from "@/layouts/AdminDashboardLayout";
import CourseList from "@/components/course-admin/CourseList";

export default function CourseManagementPage() {
    return (
        <AdminDashboardLayout title="Course Management">
            <CourseList />
        </AdminDashboardLayout>
    );
}
