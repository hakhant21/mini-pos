import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { products, productsCreate, productsShow, productsEdit, productsDestroy, dashboard } from '@/feature-routes';
import type { Product } from '@/types';

type Props = {
    products: { data: Product[] };
};

export default function ProductsIndex({ products: productsData }: Props) {
    const [search, setSearch] = useState('');

    const handleDelete = (product: Product) => {
        if (confirm(`Delete "${product.name}"?`)) {
            router.delete(productsDestroy({ id: product.id }).url, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Products" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Products</h1>
                    <Link href={productsCreate()}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, SKU, or category..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Brand</TableHead>
                                    <TableHead>Variants</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {productsData.data.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>{product.category?.name || '—'}</TableCell>
                                        <TableCell>
                                            {product.image_url ? (
                                                <img src={product.image_url} alt={product.name} className="h-10 w-10 rounded object-cover" />
                                            ) : (
                                                <div className="h-10 w-10 rounded bg-muted" />
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                                        <TableCell>{product.brand || '—'}</TableCell>
                                        <TableCell>{product.variants_count ?? 0}</TableCell>
                                        <TableCell>
                                            <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                                {product.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Link href={productsShow({ id: product.id })}>
                                                    <Button variant="ghost" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={productsEdit({ id: product.id })}>
                                                    <Button variant="ghost" size="icon">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(product)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
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

ProductsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Products', href: products() },
    ],
};
