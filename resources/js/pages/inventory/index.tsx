import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, PackageX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { inventory, inventoryCreate, dashboard } from '@/feature-routes';
import type { ProductVariant } from '@/types';

type Props = {
    lowStockVariants: ProductVariant[];
    outOfStockVariants: ProductVariant[];
};

export default function InventoryIndex({ lowStockVariants, outOfStockVariants }: Props) {
    return (
        <>
            <Head title="Inventory" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Inventory</h1>
                    <Link href={inventoryCreate()}>
                        <Button>Add Stock</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <CardTitle>Low Stock Variants</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lowStockVariants.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No low stock variants.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Variant</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Min Level</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lowStockVariants.map((v) => (
                                        <TableRow key={v.id}>
                                            <TableCell className="font-medium">{v.product?.name}</TableCell>
                                            <TableCell>{v.name || '—'}</TableCell>
                                            <TableCell>{v.unit?.abbreviation}</TableCell>
                                            <TableCell>{v.stock_quantity}</TableCell>
                                            <TableCell>{v.min_stock_level}</TableCell>
                                            <TableCell>
                                                <Badge variant="warning">Low Stock</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center gap-2">
                        <PackageX className="h-5 w-5 text-destructive" />
                        <CardTitle>Out of Stock Variants</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {outOfStockVariants.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No out of stock variants.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Variant</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {outOfStockVariants.map((v) => (
                                        <TableRow key={v.id}>
                                            <TableCell className="font-medium">{v.product?.name}</TableCell>
                                            <TableCell>{v.name || '—'}</TableCell>
                                            <TableCell>{v.unit?.abbreviation}</TableCell>
                                            <TableCell>
                                                <Badge variant="destructive">Out of Stock</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

InventoryIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Inventory', href: inventory() },
    ],
};
