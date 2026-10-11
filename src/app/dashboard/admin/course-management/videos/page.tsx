import AdminDashboardLayout from "@/layouts/AdminDashboardLayout";
import VideoLibrary from "@/components/course-admin/videos/VideoLibrary";

export default function CourseVideosPage() {
    return (
        <AdminDashboardLayout title="Course Management">
            <VideoLibrary />
        </AdminDashboardLayout>
    );
}
