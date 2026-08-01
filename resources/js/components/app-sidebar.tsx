import { Link } from '@inertiajs/react';
import {
    LayoutGrid,
    Package,
    PackageCheck,
    Ruler,
    Tags,
    ShoppingCart,
    Receipt,
} from 'lucide-react';
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
    productsStockPriceUpdate,
} from '@/feature-routes';
import { useTranslation } from '@/lib/i18n';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { t } = useTranslation();

    const mainNavItems: NavItem[] = [
        {
            title: t('Dashboard'),
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: t('POS'),
            href: salesCheckoutPage(),
            icon: ShoppingCart,
        },
        {
            title: t('Sales History'),
            href: sales(),
            icon: Receipt,
        },
        {
            title: t('Categories'),
            href: categories(),
            icon: Tags,
        },
        {
            title: t('Units'),
            href: units(),
            icon: Ruler,
        },
        {
            title: t('Products'),
            href: products(),
            icon: Package,
        },
        {
            title: t('Stock & Price Update'),
            href: productsStockPriceUpdate(),
            icon: PackageCheck,
        },
    ];

    return (
        <div className="nativephp-safe-area relative z-50 hidden h-screen w-64 shrink-0 border-r border-sidebar-border/70 bg-background lg:flex">
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href={dashboard()} prefetch>
                                    <span className="rounded-lg bg-slate-900 text-xs">
                                        {t('Shop')}
                                    </span>
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
        </div>
    );
}
