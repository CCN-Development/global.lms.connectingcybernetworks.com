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
    MdOutlineForum,
} from 'react-icons/md'

type Props = {
    children?: React.ReactNode,
    title?: React.ReactNode,
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Overview', link: '/dashboard/admin/overview', icon: <MdOutlineDashboard /> },
    { label: 'CRM Requests', link: '/dashboard/admin/crm-management', icon: <MdOutlineHandshake /> },
    { label: 'Onboarding', link: '/dashboard/admin/onboarding', icon: <MdOutlinePayment /> },
    { label: 'LMS Users', link: '/dashboard/admin/lms-users', icon: <MdOutlineSchool /> },
    {
        label: "Course Management",
        link: '/dashboard/admin/course-management',
        icon: <MdOutlineSchool />
    },
    {
        label: 'Exam Management',
        link: '/dashboard/admin/exam-management',
        icon: <MdOutlineSchool />
    },
    {
        label: "CCN Forum",
        link: '/dashboard/admin/ccn-forum',
        icon: <MdOutlineForum />
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