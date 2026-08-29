import AccountantDashboardLayout from '@/layouts/AccountantDashboardLayout'
import StudentProfilesClient from '../../rm/student-profiles/StudentProfilesClient'

export default function page() {
    return (
        <AccountantDashboardLayout title="Student Profiles">
            <StudentProfilesClient path="/dashboard/accountants/student-profiles" />
        </AccountantDashboardLayout>
    )
}