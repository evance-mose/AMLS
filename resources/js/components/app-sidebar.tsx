import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { ClipboardList, FileText, Kanban, LayoutGrid, List, ListChecks, Plus, PlusCircle, Users } from 'lucide-react';
import AppLogo from './app-logo';

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
                href: '/users/create',
                icon: Plus,
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
            {
                title: 'Create Issue',
                href: '/issues/create',
                icon: PlusCircle,
            },
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

export function AppSidebar() {
    return (
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
