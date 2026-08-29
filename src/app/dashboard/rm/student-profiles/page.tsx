import RMDashboardLayout from '@/layouts/RMDashboardLayout'
import StudentProfilesClient from './StudentProfilesClient'

export default function page() {
    return (
        <RMDashboardLayout title="Student Profiles">
            <StudentProfilesClient path="/dashboard/rm/student-profiles" />
        </RMDashboardLayout>
    )
}