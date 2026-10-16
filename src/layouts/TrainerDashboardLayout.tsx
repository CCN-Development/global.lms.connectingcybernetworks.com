import DashboardLayout, { NavItem } from '@/common/DashboardLayout'
import React from 'react'
import {
    MdOutlineDashboard,
    MdOutlineClass,
    MdOutlineChat,
    MdOutlineCalendarMonth,
    MdOutlineForum,
} from 'react-icons/md'

type Props = {
    children?: React.ReactNode,
    title?: React.ReactNode,
}

const NAV_ITEMS: NavItem[] = [
    { label: 'My Day',      link: '/dashboard/trainer/overview',    icon: <MdOutlineDashboard /> },
    { label: 'My Batches',  link: '/dashboard/trainer/my-batches',  icon: <MdOutlineClass /> },
    { label: 'My Calendar', link: '/dashboard/trainer/my-calendar', icon: <MdOutlineCalendarMonth /> },
    { label: 'CCN Forum',   link: '/dashboard/trainer/ccn-forum',   icon: <MdOutlineForum /> },
    { label: 'Chats',       link: '/dashboard/chats',               icon: <MdOutlineChat /> },
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
