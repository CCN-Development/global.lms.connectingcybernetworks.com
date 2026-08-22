import DashboardLayout, { NavItem } from '@/common/DashboardLayout'
import React from 'react'
import {
    MdOutlineDashboard,
    MdOutlinePayment,
    MdOutlinePendingActions,
    MdOutlineAccountBalance,
    MdOutlineReceipt,
    MdOutlinePeople,
    MdOutlineChat,
} from 'react-icons/md'

type Props = {
    children?: React.ReactNode,
    title?: string,
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Overview',                      link: '/dashboard/accountants/overview',                        icon: <MdOutlineDashboard /> },
    { label: 'LMS Collections',               link: '/dashboard/accountants/lms-collections',                icon: <MdOutlinePayment /> },
    { label: 'Due & Upcoming Payments',       link: '/dashboard/accountants/due-upcoming-payments',          icon: <MdOutlinePendingActions /> },
    { label: 'Accounts Management',           link: '/dashboard/accountants/accounts-management',            icon: <MdOutlineAccountBalance /> },
    { label: 'Expenses Management',           link: '/dashboard/accountants/expenses-management',            icon: <MdOutlineReceipt /> },
    { label: 'Student Profiles',              link: '/dashboard/accountants/student-profiles',               icon: <MdOutlinePeople /> },
    { label: 'Chats',                         link: '/dashboard/accountants/chats',                          icon: <MdOutlineChat /> },
]

export default function AccountantDashboardLayout({ children, title }: Props) {
    return (
        <DashboardLayout
            navItems={NAV_ITEMS}
            headerTitle={title}
        >
            {children}
        </DashboardLayout>
    )
}
