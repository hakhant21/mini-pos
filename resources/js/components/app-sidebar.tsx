import { Link } from '@inertiajs/react';
import {
    LayoutGrid,
    Package,
    Ruler,
    Tags,
    ShoppingCart,
    Receipt,
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
    sales,
    salesCheckoutPage,
} from '@/feature-routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Sale',
        href: salesCheckoutPage(),
        icon: ShoppingCart,
    },
    {
        title: 'History',
        href: sales(),
        icon: Receipt,
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
