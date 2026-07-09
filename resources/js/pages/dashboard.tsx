import { Head, Link } from '@inertiajs/react';
import { Package, PackageOpen, AlertTriangle, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard, productsShow, inventory } from '@/feature-routes';
import type { DashboardData } from '@/types';

const stockStatusConfig = {
    in_stock: { label: 'In Stock', variant: 'default' as const },
    low_stock: { label: 'Low Stock', variant: 'warning' as const },
    out_of_stock: { label: 'Out of Stock', variant: 'destructive' as const },
};

export default function Dashboard({ totalStock, totalProducts, totalVariants, inventoryValue, lowStockVariants }: DashboardData) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalProducts}</div>
                            <p className="text-xs text-muted-foreground">{totalVariants} variants</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
                            <PackageOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalStock}</div>
                            <p className="text-xs text-muted-foreground">across all variants</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${Number(inventoryValue).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">total cost value</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{lowStockVariants.length}</div>
                            <p className="text-xs text-muted-foreground">variants need attention</p>
                        </CardContent>
                    </Card>
                </div>

                {lowStockVariants.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Low Stock Variants</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {lowStockVariants.map((variant) => (
                                    <div key={variant.id} className="flex items-center justify-between">
                                        <div>
                                            <Link href={productsShow({ id: variant.product_id })} className="font-medium hover:underline">
                                                {variant.product?.name}
                                            </Link>
                                            <p className="text-sm text-muted-foreground">
                                                {variant.name} — {variant.unit?.abbreviation}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm">
                                                {variant.stock_quantity} / {variant.min_stock_level}
                                            </span>
                                            <Badge variant={stockStatusConfig[variant.stock_status].variant}>
                                                {stockStatusConfig[variant.stock_status].label}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <Link href={inventory()} className="text-sm text-primary hover:underline">
                                    View all inventory
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}
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
