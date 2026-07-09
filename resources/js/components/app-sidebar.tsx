import { Link } from '@inertiajs/react';
import {
    LayoutGrid,
    Package,
    Ruler,
    Warehouse,
    BarChart3,
    Tags,
    ShoppingCart,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
    dashboard,
    categories,
    units,
    products,
    inventory,
    reportsProfitLoss,
    sales,
} from '@/feature-routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'POS',
        href: sales(),
        icon: ShoppingCart,
    },
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Categories',
        href: categories(),
        icon: Tags,
    },
    {
        title: 'Units',
        href: units(),
        icon: Ruler,
    },
    {
        title: 'Products',
        href: products(),
        icon: Package,
    },
    {
        title: 'Inventory',
        href: inventory(),
        icon: Warehouse,
    },
    {
        title: 'Reports',
        href: reportsProfitLoss(),
        icon: BarChart3,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
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
                <LocaleSwitcher />
            </SidebarFooter>
        </Sidebar>
    );
}
