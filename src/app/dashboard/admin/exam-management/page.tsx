import AdminDashboardLayout from "@/layouts/AdminDashboardLayout";
import ExamCourseList from "@/components/exam-admin/ExamCourseList";

export default function ExamManagementPage() {
    return (
        <AdminDashboardLayout title="Exam Management">
            <ExamCourseList />
        </AdminDashboardLayout>
    );
}
