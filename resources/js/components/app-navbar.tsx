import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Package,
    PackageCheck,
    Ruler,
    Tags,
    ShoppingCart,
    Receipt,
    Menu,
    Languages,
    Warehouse,
    ChevronDown,
    ChevronsUpDown,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import {
    dashboard,
    categories,
    units,
    products,
    sales,
    salesCheckoutPage,
    productsStockPriceUpdate,
} from '@/feature-routes';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useTranslation, setLocale } from '@/lib/i18n';

const locales = {
    my: 'မြန်မာ',
} as const;

const mainNavItems = [
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
];

const inventoryItems = [
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

export function AppNavbar() {
    const { t, locale } = useTranslation();
    const { isCurrentUrl } = useCurrentUrl();
    const { props } = usePage();
    const { auth } = props;
    const userRole = props?.auth?.user?.role;

    const mainNavs = mainNavItems.map((item) => ({
        ...item,
        title: t(item.title),
    }));

    const inventoryNavs = inventoryItems.map((item) => ({
        ...item,
        title: t(item.title),
    }));

    const isCashier = userRole === 'cashier';

    return (
        <header className="sticky top-0 z-50 border-b border-sidebar-border/80 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
                {/* Mobile Menu */}
                <div className="lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="mr-2 h-8.5 w-8.5"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="left"
                            className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar"
                        >
                            <SheetTitle className="sr-only">
                                Navigation menu
                            </SheetTitle>
                            <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                <div className="flex h-full flex-col justify-between text-sm">
                                    <div className="flex flex-col space-y-4">
                                        {mainNavs.map((item) => (
                                            <Link
                                                key={item.title}
                                                href={item.href}
                                                className={`flex items-center space-x-2 font-medium ${
                                                    isCurrentUrl(item.href)
                                                        ? 'text-neutral-900 dark:text-neutral-100'
                                                        : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100'
                                                }`}
                                            >
                                                {item.icon && (
                                                    <item.icon className="h-5 w-5" />
                                                )}
                                                <span>{item.title}</span>
                                            </Link>
                                        ))}
                                        {!isCashier && (
                                            <div className="flex flex-col space-y-2">
                                                <span className="px-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                    {t('Inventory')}
                                                </span>
                                                {inventoryNavs.map((item) => (
                                                    <Link
                                                        key={item.title}
                                                        href={item.href}
                                                        className={`flex items-center space-x-2 pl-4 font-medium ${
                                                            isCurrentUrl(
                                                                item.href,
                                                            )
                                                                ? 'text-neutral-900 dark:text-neutral-100'
                                                                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100'
                                                        }`}
                                                    >
                                                        {item.icon && (
                                                            <item.icon className="h-5 w-5" />
                                                        )}
                                                        <span>
                                                            {item.title}
                                                        </span>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col space-y-4">
                                        {auth.user && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="justify-start text-left"
                                                    >
                                                        <UserInfo
                                                            user={auth.user}
                                                        />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    side="top"
                                                    className="min-w-56"
                                                    align="start"
                                                >
                                                    <UserMenuContent
                                                        user={auth.user}
                                                    />
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden h-full items-center space-x-1 lg:flex">
                    {mainNavs.map((item) => (
                        <Link
                            key={item.title}
                            href={item.href}
                            className={`flex h-9 cursor-pointer items-center rounded-md px-3 text-sm font-medium ${
                                isCurrentUrl(item.href)
                                    ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                            }`}
                        >
                            {item.icon && (
                                <item.icon className="mr-2 h-4 w-4" />
                            )}
                            <span>{item.title}</span>
                        </Link>
                    ))}
                    {!isCashier && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className={`flex h-9 cursor-pointer items-center rounded-md px-3 text-sm font-medium ${
                                        isCurrentUrl(categories()) ||
                                        isCurrentUrl(units()) ||
                                        isCurrentUrl(products()) ||
                                        isCurrentUrl(productsStockPriceUpdate())
                                            ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                                    }`}
                                >
                                    <Warehouse className="mr-2 h-4 w-4" />
                                    <span>{t('Inventory')}</span>
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="min-w-48"
                                align="start"
                            >
                                {inventoryNavs.map((item) => (
                                    <DropdownMenuItem key={item.title} asChild>
                                        <Link
                                            href={item.href}
                                            className="flex cursor-pointer items-center space-x-2"
                                        >
                                            {item.icon && (
                                                <item.icon className="h-4 w-4" />
                                            )}
                                            <span>{item.title}</span>
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
                {/* User Menu (Desktop) */}
                <div className="hidden lg:block">
                    {auth.user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="flex h-9 items-center space-x-2 px-2"
                                >
                                    <UserInfo user={auth.user} />
                                    <ChevronsUpDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="min-w-56"
                                align="end"
                            >
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </header>
    );
}
