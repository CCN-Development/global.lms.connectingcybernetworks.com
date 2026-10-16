import DashboardLayout, { NavItem } from '@/common/DashboardLayout'
import React from 'react'
import { MdOutlineChat, MdOutlineDashboard, MdOutlineForum } from 'react-icons/md'

type Props = {
    children?: React.ReactNode,
    title?: React.ReactNode,
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Overview',  link: '/dashboard/placement/overview',  icon: <MdOutlineDashboard /> },
    { label: 'CCN Forum', link: '/dashboard/placement/ccn-forum', icon: <MdOutlineForum /> },
    { label: 'Chats',     link: '/dashboard/chats',               icon: <MdOutlineChat /> },
]

export default function PlacementDashboardLayout({ children, title }: Props) {
    return (
        <DashboardLayout
            navItems={NAV_ITEMS}
            headerTitle={title}
        >
            {children}
        </DashboardLayout>
    )
}
