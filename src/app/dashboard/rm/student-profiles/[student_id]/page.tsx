import RMDashboardLayout from '@/layouts/RMDashboardLayout'
import StudentDetailClient from './StudentDetailClient'

type Props = { params: Promise<{ student_id: string }> }

export default async function Page({ params }: Props) {
    const { student_id } = await params
    return (
        <RMDashboardLayout title="Student Profile">
            <StudentDetailClient studentId={student_id} />
        </RMDashboardLayout>
    )
}
