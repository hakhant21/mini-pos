import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { reportsProfitLoss, dashboard } from '@/feature-routes';
import type { ProductReport, ReportSummary } from '@/types';

type Props = {
    products: ProductReport[];
    summary: ReportSummary;
};

export default function ReportsProfitLoss({ products, summary }: Props) {
    return (
        <>
            <Head title="Profit & Loss" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-bold">Inventory Report</h1>

                <div className="grid grid-cols-4 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{summary.total_products}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Total Variants</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{summary.total_variants}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{summary.total_stock}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">${summary.total_inventory_value.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                </div>

                {products.map((product) => (
                    <Card key={product.product_name}>
                        <CardHeader>
                            <CardTitle>
                                {product.product_name}
                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                    {product.category} — Stock: {product.total_stock} — Value: ${product.total_value.toLocaleString()}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead>Stock Qty</TableHead>
                                        <TableHead>Cost Price</TableHead>
                                        <TableHead>Selling Price</TableHead>
                                        <TableHead>Stock Value</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {product.variants.map((v) => (
                                        <TableRow key={v.id}>
                                            <TableCell className="font-mono text-sm">{v.sku}</TableCell>
                                            <TableCell>{v.unit}</TableCell>
                                            <TableCell>{v.stock_quantity}</TableCell>
                                            <TableCell>${v.cost_price}</TableCell>
                                            <TableCell>${v.selling_price}</TableCell>
                                            <TableCell>${v.stock_value.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))}

                {products.length === 0 && (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No products found. Add some products and stock to see inventory reports.
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

ReportsProfitLoss.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Reports', href: '#' },
        { title: 'Inventory Report', href: reportsProfitLoss() },
    ],
};
