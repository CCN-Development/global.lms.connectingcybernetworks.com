import RMDashboardLayout from '@/layouts/RMDashboardLayout'
import OnboardingDetailClient from './OnboardingDetailClient'

type Props = { params: Promise<{ onboarding_id: string }> }

export default async function Page({ params }: Props) {
    const { onboarding_id } = await params
    return (
        <RMDashboardLayout title="Onboarding Verification">
            <OnboardingDetailClient onboardingId={onboarding_id} />
        </RMDashboardLayout>
    )
}