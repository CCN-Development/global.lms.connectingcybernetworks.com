import RMDashboardLayout from '@/layouts/RMDashboardLayout'
import BatchDetailClient from './BatchDetailClient'

type Props = { params: Promise<{ batch_id: string }> }

export default async function Page({ params }: Props) {
    const { batch_id } = await params
    return (
        <RMDashboardLayout title="Batch">
            <BatchDetailClient batchId={batch_id} />
        </RMDashboardLayout>
    )
}