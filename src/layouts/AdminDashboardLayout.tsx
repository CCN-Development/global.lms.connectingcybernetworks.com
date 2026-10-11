import DashboardLayout, { NavItem } from '@/common/DashboardLayout'
import React from 'react'
import {
    MdOutlineDashboard,
    MdOutlineHandshake,
    MdOutlinePayment,
    MdOutlinePeople,
    MdOutlineSchool,
    MdOutlineBadge,
    MdOutlineChat,
} from 'react-icons/md'

type Props = {
    children?: React.ReactNode,
    title?: string,
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Overview', link: '/dashboard/admin/overview', icon: <MdOutlineDashboard /> },
    { label: 'CRM Management', link: '/dashboard/admin/crm-management', icon: <MdOutlineHandshake /> },
    { label: 'HRMS Management', link: '/dashboard/admin/hrms-management', icon: <MdOutlineBadge /> },
    { label: 'Onboarding', link: '/dashboard/admin/onboarding', icon: <MdOutlinePayment /> },
    { label: 'LMS Users', link: '/dashboard/admin/lms-users', icon: <MdOutlineSchool /> },
    {
        label: "Course Management",
        link: '/dashboard/admin/course-management',
        icon: <MdOutlineSchool />
    },
    { label: 'Chats', link: '/dashboard/chats', icon: <MdOutlineChat /> },
]

export default function AdminDashboardLayout({ children, title }: Props) {
    return (
        <DashboardLayout
            navItems={NAV_ITEMS}
            headerTitle={title}
        >
            {children}
        </DashboardLayout>
    )
}