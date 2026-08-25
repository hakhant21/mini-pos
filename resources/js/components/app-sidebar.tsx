import { Link, usePage } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import {
    LayoutGrid,
    Package,
    PackageCheck,
    Ruler,
    Tags,
    ShoppingCart,
    Receipt,
    Wallet,
} from 'lucide-react';
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
    balances,
} from '@/feature-routes';
import { useTranslation } from '@/lib/i18n';
import { Button } from './ui/button';
import { UserInfo } from './user-info';
import { UserMenuContent } from './user-menu-content';

const cashierMenuItems = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'POS',
        href: salesCheckoutPage(),
        icon: ShoppingCart,
    },
    {
        title: 'Sales History',
        href: sales(),
        icon: Receipt,
    },
    {
        title: 'Balances',
        href: balances(),
        icon: Wallet,
    },
];

const adminMenuItems = [
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
        title: 'Stock & Price Update',
        href: productsStockPriceUpdate(),
        icon: PackageCheck,
    },
];

export function AppSidebar() {
    const { props } = usePage();
    const { auth } = props;
    const userRole = props?.auth?.user?.role;
    const { t } = useTranslation();

    const isCashier = userRole === 'cashier';

    const mainNavItems = isCashier
        ? cashierMenuItems
        : [...cashierMenuItems, ...adminMenuItems];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <span className="rounded-lg text-lg">
                                    {t(props.name)}
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
                <div className="flex flex-col space-y-4">
                    {auth.user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="justify-start text-left"
                                >
                                    <UserInfo user={auth.user} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="min-w-56"
                                align="start"
                            >
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
