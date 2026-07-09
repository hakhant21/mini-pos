import { Head, Link } from '@inertiajs/react';
import { Pencil, ArrowLeft } from 'lucide-react';
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
import { products, productsEdit, dashboard } from '@/feature-routes';
import type { Product } from '@/types';

type Props = {
    product: Product;
};

const stockStatusBadge = {
    in_stock: { label: 'In Stock', variant: 'default' as const },
    low_stock: { label: 'Low Stock', variant: 'warning' as const },
    out_of_stock: { label: 'Out of Stock', variant: 'destructive' as const },
};

export default function ProductsShow({ product }: Props) {
    return (
        <>
            <Head title={product.name} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={products()}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold">{product.name}</h1>
                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                            {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>
                    <Link href={productsEdit({ id: product.id })}>
                        <Button>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">SKU</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-mono text-lg">{product.sku}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Brand</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg">{product.brand || '—'}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg">{product.category?.name || '—'}</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Variants ({product.variants.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Units/Pkg</TableHead>
                                    <TableHead>Cost Price</TableHead>
                                    <TableHead>Selling Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {product.variants.map((variant) => (
                                    <TableRow key={variant.id}>
                                        <TableCell>{variant.name || '—'}</TableCell>
                                        <TableCell className="font-mono text-sm">{variant.sku}</TableCell>
                                        <TableCell>{variant.unit?.abbreviation || '—'}</TableCell>
                                        <TableCell>{variant.units_per_package}</TableCell>
                                        <TableCell>${variant.cost_price}</TableCell>
                                        <TableCell>${variant.selling_price}</TableCell>
                                        <TableCell>{variant.stock_quantity}</TableCell>
                                        <TableCell>
                                            <Badge variant={stockStatusBadge[variant.stock_status].variant}>
                                                {stockStatusBadge[variant.stock_status].label}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ProductsShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Products', href: products() },
        { title: 'View', href: '#' },
    ],
};
