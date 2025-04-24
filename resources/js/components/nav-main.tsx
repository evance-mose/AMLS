import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SharedData, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { auth } = usePage<SharedData>().props;
    const page = usePage();

    const filteredItems = items.filter((item) => {
        if (auth.user.role === 'admin') {
            return true;
        }
        if ((auth.user.role === 'custodian' || auth.user.role === 'technician') && item.title !== 'Users') {
            return true;
        }
        if (item.title === 'Dashboard') {
            return true;
        }

        return false;
    });

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {filteredItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={item.href === page.url} tooltip={{ children: item.title }}>
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
