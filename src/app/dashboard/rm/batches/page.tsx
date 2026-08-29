import RMDashboardLayout from '@/layouts/RMDashboardLayout'
import BatchesClient from './BatchesClient'


export default function page() {
    return (
        <RMDashboardLayout title="Batches">
            <BatchesClient />
        </RMDashboardLayout>
    )
}