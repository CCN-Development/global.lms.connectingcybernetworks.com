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
    { label: 'Overview',         link: '/dashboard/admin/overview',          icon: <MdOutlineDashboard /> },
    { label: 'CRM Requests',     link: '/dashboard/admin/crm-requests',      icon: <MdOutlineHandshake /> },
    { label: 'Payment Requests', link: '/dashboard/admin/payment-requests',  icon: <MdOutlinePayment /> },
    { label: 'CRM Users',        link: '/dashboard/admin/crm-users',         icon: <MdOutlinePeople /> },
    { label: 'LMS Users',        link: '/dashboard/admin/lms-users',         icon: <MdOutlineSchool /> },
    { label: 'HRMS Users',       link: '/dashboard/admin/hrms-users',        icon: <MdOutlineBadge /> },
    { label: 'Chats',            link: '/dashboard/chats',             icon: <MdOutlineChat /> },
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