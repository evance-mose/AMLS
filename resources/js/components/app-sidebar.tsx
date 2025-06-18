import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import IssueFormDialog from '@/pages/issues/IssueForm';
import LogFormDialog from '@/pages/logs/LogForm';
import UserFormDialog from '@/pages/users/userForm';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ClipboardList, FileText, Kanban, LayoutGrid, List, ListChecks, Plus, PlusCircle, Users } from 'lucide-react';
import { useState } from 'react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
    const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
    const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
            subitems: [
                {
                    title: 'Overview',
                    href: '/dashboard/overview',
                    icon: LayoutGrid,
                },
            ],
        },
        {
            title: 'Users',
            href: '/users',
            icon: Users,
            subitems: [
                {
                    title: 'Create user',
                    href: '#',
                    icon: Plus,
                    onClick: 'openUserDialog',
                },
                {
                    title: 'View users',
                    href: '/users',
                    icon: List,
                },
            ],
        },
        {
            title: 'Issues',
            href: '/issues',
            icon: Kanban,
            subitems: [
                ...(auth.user.role !== 'technician'
                    ? [
                          {
                              title: 'Create Issue',
                              href: '#',
                              icon: PlusCircle,
                              onClick: 'openIssueDialog',
                          },
                      ]
                    : []),
                {
                    title: 'View issues',
                    href: '/issues',
                    icon: ListChecks,
                },
            ],
        },
        {
            title: 'Maintance Logs',
            href: '/logs',
            icon: FileText,
            subitems: [
                {
                    title: 'View logs',
                    href: '/logs',
                    icon: ClipboardList,
                },
            ],
        },
    ];

    const footerNavItems: NavItem[] = [];

    const handleNavItemClick = (item: NavItem) => {
        if (item.onClick === 'openUserDialog') {
            setIsUserDialogOpen(true);
        } else if (item.onClick === 'openIssueDialog') {
            setIsIssueDialogOpen(true);
        } else if (item.onClick === 'openLogDialog') {
            setIsLogDialogOpen(true);
        }
    };

    return (
        <>
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/dashboard" prefetch>
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <NavMain items={mainNavItems} onItemClick={handleNavItemClick} />
                </SidebarContent>

                <SidebarFooter>
                    <NavFooter items={footerNavItems} className="mt-auto" />
                    <NavUser />
                </SidebarFooter>
            </Sidebar>

            <UserFormDialog isOpen={isUserDialogOpen} onClose={() => setIsUserDialogOpen(false)} onSave={() => setIsUserDialogOpen(false)} />

            <IssueFormDialog
                issue={null}
                isOpen={isIssueDialogOpen}
                onClose={() => setIsIssueDialogOpen(false)}
                onSave={() => setIsIssueDialogOpen(false)}
            />

            <LogFormDialog
                isOpen={isLogDialogOpen}
                onClose={() => setIsLogDialogOpen(false)}
                onSave={() => setIsLogDialogOpen(false)}
                issues={[]}
                users={[]}
            />
        </>
    );
}
