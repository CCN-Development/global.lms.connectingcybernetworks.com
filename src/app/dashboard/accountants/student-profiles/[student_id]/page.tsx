import StudentDetailClient from '@/app/dashboard/rm/student-profiles/[student_id]/StudentDetailClient'
import AccountantDashboardLayout from '@/layouts/AccountantDashboardLayout'

type Props = { params: Promise<{ student_id: string }> }

export default async function Page({ params }: Props) {
    const { student_id } = await params
    return (
        <AccountantDashboardLayout title="Student Profiles">
            <StudentDetailClient studentId={student_id} />
        </AccountantDashboardLayout>
    )
}