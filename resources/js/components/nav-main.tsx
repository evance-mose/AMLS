import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SharedData, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NavMain({ items = [], onItemClick }: { items: NavItem[]; onItemClick?: (item: NavItem) => void }) {
    const { auth } = usePage<SharedData>().props;
    const page = usePage();
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
    const [activeCreateItem, setActiveCreateItem] = useState<string | null>(null);

    // Keep dropdowns open for active items
    useEffect(() => {
        const newExpandedItems = { ...expandedItems };
        items.forEach((item) => {
            if (item.subitems) {
                const hasActiveSubitem = item.subitems.some((subitem) => subitem.href === page.url);
                if (hasActiveSubitem) {
                    newExpandedItems[item.title] = true;
                }
            }
        });
        setExpandedItems(newExpandedItems);
    }, [page.url]);

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

    const toggleItem = (title: string) => {
        setExpandedItems((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    const handleCreateClick = (item: NavItem) => {
        setActiveCreateItem(item.title);
        onItemClick?.(item);
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel className="uppercase">Platform</SidebarGroupLabel>
            <SidebarMenu>
                {filteredItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild={!item.subitems || item.title === 'Dashboard'}
                            isActive={item.href === page.url}
                            tooltip={{ children: item.title }}
                            onClick={() => item.subitems && item.title !== 'Dashboard' && toggleItem(item.title)}
                        >
                            {item.subitems && item.title !== 'Dashboard' ? (
                                <div className="flex w-full items-center gap-2">
                                    {item.icon && <item.icon className="h-4 w-4" />}
                                    <span className="text-sm uppercase">{item.title}</span>
                                    <ChevronDown
                                        className={`ml-auto h-4 w-4 transition-transform ${expandedItems[item.title] ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            ) : (
                                <Link href={item.href} prefetch className="flex items-center gap-2">
                                    {item.icon && <item.icon className="h-4 w-4" />}
                                    <span className="text-sm uppercase">{item.title}</span>
                                </Link>
                            )}
                        </SidebarMenuButton>
                        {item.subitems && item.title !== 'Dashboard' && expandedItems[item.title] && (
                            <div className="mt-1 ml-4 space-y-1">
                                {item.subitems.map((subitem) => (
                                    <SidebarMenuItem key={subitem.title}>
                                        <SidebarMenuButton
                                            asChild={!subitem.onClick}
                                            isActive={Boolean(subitem.href === page.url || (subitem.onClick && activeCreateItem === subitem.title))}
                                            tooltip={{ children: subitem.title }}
                                            onClick={() => subitem.onClick && handleCreateClick(subitem)}
                                        >
                                            {subitem.onClick ? (
                                                <button
                                                    className={`text-muted-foreground hover:text-foreground flex w-full items-center py-1.5 text-left text-xs uppercase ${
                                                        activeCreateItem === subitem.title ? 'text-foreground font-medium' : ''
                                                    }`}
                                                >
                                                    <span>{subitem.title}</span>
                                                </button>
                                            ) : (
                                                <Link
                                                    href={subitem.href}
                                                    prefetch
                                                    className="text-muted-foreground hover:text-foreground flex w-full items-center py-1.5 text-xs uppercase"
                                                >
                                                    <span>{subitem.title}</span>
                                                </Link>
                                            )}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </div>
                        )}
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
