import { Head, Link } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import {
    ArrowDownUp,
    ArrowUpDown,
    Banknote,
    LoaderCircle,
    Plus,
    Receipt,
    TrendingUp,
    AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { dashboard, productsShow, balancesStore } from '@/feature-routes';
import { useTranslation } from '@/lib/i18n';
import { ks } from '@/lib/utils';

import type { DashboardData } from '@/types';

const stockStatusConfig = {
    in_stock: { label: 'In Stock', variant: 'default' as const },
    low_stock: { label: 'Low Stock', variant: 'warning' as const },
    out_of_stock: { label: 'Out of Stock', variant: 'destructive' as const },
};

export default function Dashboard({
    lowStockVariants,
    totalRevenue,
    totalCost,
    totalProfit,
    totalSales,
    recentSales,
    mostSoldProducts,
    hasBalanceToday,
    openingAmount,
    totalChange,
}: DashboardData) {
    const { t } = useTranslation();
    const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);

    const {
        data,
        setData,
        post,
        processing,
        reset,
        errors: formErrors,
    } = useForm({
        opening_amount: 0,
    });

    const handleBalanceSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(balancesStore().url, {
            preserveScroll: true,
            onSuccess: () => {
                setBalanceDialogOpen(false);
                reset();
            },
        });
    };

    return (
        <>
            <Head title={t('Dashboard')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">{t('Dashboard')}</h1>
                    <Dialog
                        open={balanceDialogOpen}
                        onOpenChange={(open) => {
                            setBalanceDialogOpen(open);
                            if (!open) reset();
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button onClick={() => setBalanceDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />{' '}
                                {t('Add Balance')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t('Add Balance')}</DialogTitle>
                            </DialogHeader>
                            <form
                                onSubmit={handleBalanceSubmit}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="opening_amount">
                                        {t('Opening Amount')} *
                                    </Label>
                                    <Input
                                        id="opening_amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.opening_amount}
                                        onChange={(e) =>
                                            setData(
                                                'opening_amount',
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                        className="mt-2"
                                    />
                                    {formErrors.opening_amount && (
                                        <p className="text-sm text-destructive">
                                            {formErrors.opening_amount}
                                        </p>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={processing}>
                                        {processing && (
                                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        {t('Create')}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {!hasBalanceToday && (
                    <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                        <AlertTriangle className="h-5 w-5" />
                        <span>{t('No balance recorded for today')}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('Profit/Loss')}
                            </CardTitle>
                            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {totalProfit > 0 ? (
                                <div className="py-1 text-2xl font-bold text-green-600">
                                    Ks {ks(totalProfit)}
                                </div>
                            ) : (
                                <div className="py-1 text-2xl font-bold text-red-600">
                                    Ks {ks(totalProfit)}
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                                <span className="block py-1">
                                    {t('Revenue')}: Ks {ks(totalRevenue)}
                                </span>
                                <span className="block py-1">
                                    {t('Cost Price')}: Ks {ks(totalCost)}
                                </span>
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('Today Total Sales')}
                            </CardTitle>
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="py-1 text-2xl font-bold">
                                Ks {ks(totalSales)}
                            </div>
                            <p className="py-1 text-xs text-muted-foreground">
                                {t('Total Sales')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('Opening Amount')}
                            </CardTitle>
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="py-1 text-2xl font-bold">
                                Ks {ks(openingAmount)}
                            </div>
                            <p className="py-1 text-xs text-muted-foreground">
                                {t('Today opening balance')}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('Total Change')}
                            </CardTitle>
                            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="py-1 text-2xl font-bold">
                                Ks {ks(totalChange)}
                            </div>
                            <p className="py-1 text-xs text-muted-foreground">
                                {t('Total change from sales')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {mostSoldProducts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="py-2 text-lg">
                                {t('Most Sold Products')}
                            </CardTitle>
                            <CardDescription>
                                {t('Top 10 selling products with variants')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('Product')}</TableHead>
                                        <TableHead>{t('Category')}</TableHead>
                                        <TableHead>{t('Variants')}</TableHead>
                                        <TableHead className="text-right">
                                            {t('Total Sold')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mostSoldProducts.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <Link
                                                    href={productsShow({
                                                        id: product.id,
                                                    })}
                                                    className="font-medium hover:underline"
                                                >
                                                    {product.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                {product.category?.name || '—'}
                                            </TableCell>
                                            <TableCell>
                                                {product.variants?.length || 0}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {Number(product.total_sold)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Low Stock Variants Card */}
                    {lowStockVariants.length > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="py-2 text-lg">
                                    {t('Low Stock Variants')}
                                </CardTitle>
                                <CardDescription>
                                    {t('variants need attention')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                {t('Product')}
                                            </TableHead>
                                            <TableHead>
                                                {t('Variant')}
                                            </TableHead>
                                            <TableHead>{t('Stock')}</TableHead>
                                            <TableHead className="text-right">
                                                {t('Status')}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {lowStockVariants.map((variant) => (
                                            <TableRow key={variant.id}>
                                                <TableCell>
                                                    <Link
                                                        href={productsShow({
                                                            id: variant.product_id,
                                                        })}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {variant.product?.name}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    {variant.name}{' '}
                                                    {variant.unit
                                                        ?.abbreviation &&
                                                        `(${variant.unit.abbreviation})`}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm">
                                                        {Number(
                                                            variant.stock_quantity,
                                                        )}{' '}
                                                        /{' '}
                                                        {Number(
                                                            variant.min_stock_level,
                                                        )}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge
                                                        variant={
                                                            stockStatusConfig[
                                                                variant
                                                                    .stock_status
                                                            ].variant
                                                        }
                                                    >
                                                        {t(
                                                            stockStatusConfig[
                                                                variant
                                                                    .stock_status
                                                            ].label,
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="py-2 text-lg">
                                    {t('Low Stock Variants')}
                                </CardTitle>
                                <CardDescription>
                                    {t('All products are well stocked')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="text-muted-foreground">
                                    <svg
                                        className="mx-auto h-12 w-12 text-muted-foreground/50"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <p className="mt-2 text-sm font-medium">
                                        {t('No low stock products yet')}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent Sales Card */}
                    {recentSales.length > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="py-2 text-lg">
                                    {t('Recent Sales')}
                                </CardTitle>
                                <CardDescription>
                                    {t("Today's Transactions")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                {t('Invoice')}
                                            </TableHead>
                                            <TableHead>{t('Items')}</TableHead>
                                            <TableHead className="text-right">
                                                {t('Payment')}
                                            </TableHead>
                                            <TableHead>{t('Amount')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentSales.map((sale) => (
                                            <TableRow key={sale.id}>
                                                <TableCell className="font-medium">
                                                    {sale.invoice_number}
                                                </TableCell>
                                                <TableCell>
                                                    {sale.items?.length || 0}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant="outline">
                                                        {sale.payment_method}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    Ks {ks(sale.total_amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="text-right font-medium"
                                            >
                                                {t('Total Sales')}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                Ks {ks(totalSales)}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    {t('Recent Sales')}
                                </CardTitle>
                                <CardDescription>
                                    {t("Today's Transactions")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="text-muted-foreground">
                                    <svg
                                        className="mx-auto h-12 w-12 text-muted-foreground/50"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                        />
                                    </svg>
                                    <p className="mt-2 text-sm font-medium">
                                        {t('No recent sales yet')}
                                    </p>
                                </div>
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
