import AdminDashboardLayout from "@/layouts/AdminDashboardLayout";
import GamificationManager from "@/components/course-admin/GamificationManager";

export default function CourseGamificationPage() {
    return (
        <AdminDashboardLayout title="Course Management">
            <GamificationManager />
        </AdminDashboardLayout>
    );
}
