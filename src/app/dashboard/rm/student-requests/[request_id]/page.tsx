import RMDashboardLayout from '@/layouts/RMDashboardLayout'
import { RequestProvider } from '@/contexts/RequestContext'
import RequestDetailClient from './RequestDetailClient'

type Props = { params: Promise<{ request_id: string }> }

export default async function Page({ params }: Props) {
    const { request_id } = await params
    return (
        <RMDashboardLayout title="Student Request">
            <RequestProvider>
                <RequestDetailClient requestId={request_id} />
            </RequestProvider>
        </RMDashboardLayout>
    )
}
