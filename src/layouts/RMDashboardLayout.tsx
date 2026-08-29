import DashboardLayout, { NavItem } from '@/common/DashboardLayout'
import React from 'react'
import {
    MdOutlineDashboard,
    MdOutlineVerified,
    MdOutlineGroups,
    MdOutlineAssignment,
    MdOutlinePeople,
    MdOutlineChat,
    MdOutlineInventory2,
    MdOutlineMenuBook,
} from 'react-icons/md'

type Props = {
    children?: React.ReactNode,
    title?: string,
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Overview', link: '/dashboard/rm/overview', icon: <MdOutlineDashboard /> },
    { label: 'Onboarding Verification', link: '/dashboard/rm/onboarding-verification', icon: <MdOutlineVerified /> },
    { label: 'Batches', link: '/dashboard/rm/batches', icon: <MdOutlineGroups /> },
    { label: 'Student Requests', link: '/dashboard/rm/student-requests', icon: <MdOutlineAssignment /> },
    { label: 'Student Profiles', link: '/dashboard/rm/student-profiles', icon: <MdOutlinePeople /> },
    { label: 'News and Updates', link: '/dashboard/rm/updates', icon: <MdOutlineChat /> },
    { label: 'Packages', link: '/dashboard/rm/packages', icon: <MdOutlineInventory2 /> },
    { label: 'Courses', link: '/dashboard/rm/courses', icon: <MdOutlineMenuBook /> },
    { label: 'Chats', link: '/dashboard/chats', icon: <MdOutlineChat /> },
]

export default function RMDashboardLayout({ children, title }: Props) {
    return (
        <DashboardLayout
            navItems={NAV_ITEMS}
            headerTitle={title}
        >
            {children}
        </DashboardLayout>
    )
}
