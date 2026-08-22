import DashboardLayout, { NavItem } from '@/common/DashboardLayout'
import React from 'react'
import {
    MdOutlineDashboard,
    MdOutlineClass,
    MdOutlineChat,
} from 'react-icons/md'

type Props = {
    children?: React.ReactNode,
    title?: string,
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Overview',    link: '/dashboard/trainer/overview',    icon: <MdOutlineDashboard /> },
    { label: 'My Batches', link: '/dashboard/trainer/my-batches',  icon: <MdOutlineClass /> },
    { label: 'Chats',      link: '/dashboard/trainer/chats',       icon: <MdOutlineChat /> },
]

export default function TrainerDashboardLayout({ children, title }: Props) {
    return (
        <DashboardLayout
            navItems={NAV_ITEMS}
            headerTitle={title}
        >
            {children}
        </DashboardLayout>
    )
}
