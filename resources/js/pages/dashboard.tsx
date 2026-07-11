import { Head, Link } from '@inertiajs/react';
import { Package, PackageOpen, Banknote, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { dashboard, productsShow } from '@/feature-routes';
import { useTranslation } from '@/lib/i18n';
import { ks } from '@/lib/utils';

import type { DashboardData } from '@/types';

const stockStatusConfig = {
    in_stock: { label: 'In Stock', variant: 'default' as const },
    low_stock: { label: 'Low Stock', variant: 'warning' as const },
    out_of_stock: { label: 'Out of Stock', variant: 'destructive' as const },
};

export default function Dashboard({
    totalStock,
    totalProducts,
    totalVariants,
    inventoryValue,
    lowStockVariants,
    totalRevenue,
    totalCost,
    totalProfit,
    totalSales,
    recentSales
}: DashboardData) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('Dashboard')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{t('Total Products')}</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalProducts}</div>
                            <p className="text-xs text-muted-foreground">{totalVariants} {t('Variants')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{t('Total Stock')}</CardTitle>
                            <PackageOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalStock}</div>
                            <p className="text-xs text-muted-foreground">{t('Variants')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{t('Inventory Value')}</CardTitle>
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Ks {ks(inventoryValue)}</div>
                            <p className="text-xs text-muted-foreground">{t('total cost value')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{t('Total Sales')}</CardTitle>
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalSales}</div>
                            <p className="text-xs text-muted-foreground">{t('transactions today')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{t('Profit/Loss')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold`}>
                                Ks {ks(totalProfit)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('Revenue')}: Ks {ks(totalRevenue)} | {t('Cost Price')}: Ks {ks(totalCost)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {lowStockVariants.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{t('Low Stock Variants')}</CardTitle>
                                <CardDescription>
                                    {lowStockVariants.length} {t('variants need attention')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('Product')}</TableHead>
                                            <TableHead>{t('Variant')}</TableHead>
                                            <TableHead>{t('Stock')}</TableHead>
                                            <TableHead className="text-right">{t('Status')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {lowStockVariants.map((variant) => (
                                            <TableRow key={variant.id}>
                                                <TableCell>
                                                    <Link href={productsShow({ id: variant.product_id })} className="font-medium hover:underline">
                                                        {variant.product?.name}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    {variant.name} {variant.unit?.abbreviation && `(${variant.unit.abbreviation})`}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm">
                                                        {Number(variant.stock_quantity)} / {Number(variant.min_stock_level)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant={stockStatusConfig[variant.stock_status].variant}>
                                                        {t(stockStatusConfig[variant.stock_status].label)}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}

                    {recentSales.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{t('Recent Sales')}</CardTitle>
                                <CardDescription>
                                    {t('Today\'s Transactions')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('Invoice')}</TableHead>
                                            <TableHead>{t('Amount')}</TableHead>
                                            <TableHead>{t('Items')}</TableHead>
                                            <TableHead className="text-right">{t('Payment')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentSales.map((sale) => (
                                            <TableRow key={sale.id}>
                                                <TableCell className="font-medium">
                                                    {sale.invoice_number}
                                                </TableCell>
                                                <TableCell>
                                                    Ks {ks(sale.total_amount)}
                                                </TableCell>
                                                <TableCell>
                                                    {sale.items?.length || 0}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant="outline">
                                                        {sale.payment_method}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
