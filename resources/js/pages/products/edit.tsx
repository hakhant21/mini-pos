import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { LoaderCircle, Plus, Trash2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { products, productsUpdate, variantsStore, variantsDestroy, dashboard } from '@/feature-routes';
import type { Category, Product, Unit } from '@/types';

type Props = {
    product: Product;
    categories: Category[];
    units: Unit[];
};

export default function ProductsEdit({ product, categories, units }: Props) {
    const { data, setData, patch, processing, errors: formErrors } = useForm({
        category_id: String(product.category?.id ?? ''),
        name: product.name,
        sku: product.sku,
        image: product.image,
        brand: product.brand ?? '',
        is_active: product.is_active,
    });

    const [newVariant, setNewVariant] = useState({
        unit_id: '',
        name: '',
        sku: '',
        units_per_package: '1',
        cost_price: '0',
        selling_price: '0',
        min_stock_level: '0',
        max_stock_level: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(productsUpdate({ id: product.id }).url, {
            preserveScroll: true,
        });
    };

    const handleAddVariant = () => {
        router.post(variantsStore({ id: product.id }).url, {
            ...newVariant,
            units_per_package: parseFloat(newVariant.units_per_package),
            cost_price: parseFloat(newVariant.cost_price),
            selling_price: parseFloat(newVariant.selling_price),
            min_stock_level: parseFloat(newVariant.min_stock_level),
            max_stock_level: newVariant.max_stock_level ? parseFloat(newVariant.max_stock_level) : null,
        }, { preserveScroll: true });
    };

    const handleDeleteVariant = (variantId: number) => {
        if (confirm('Delete this variant?')) {
            router.delete(variantsDestroy({ id: product.id }, { id: variantId }).url, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title={`Edit ${product.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Edit: {product.name}</h1>
                    <Link href={products()}>
                        <Button variant="outline">Back to Products</Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="image">Image</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setData('image', file);
                                    }}
                                />
                                {data.image && typeof data.image === 'string' && product.image_url && (
                                    <img src={product.image_url} alt={product.name} className="mt-1 h-20 w-20 rounded object-cover" />
                                )}
                                {formErrors.image && <p className="text-sm text-destructive">{formErrors.image}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category_id">Category</Label>
                                    <Select value={data.category_id} onValueChange={(v) => setData('category_id', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input id="sku" value={data.sku} onChange={(e) => setData('sku', e.target.value)} />
                                    {formErrors.sku && <p className="text-sm text-destructive">{formErrors.sku}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="brand">Brand</Label>
                                    <Input id="brand" value={data.brand} onChange={(e) => setData('brand', e.target.value)} />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Product
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Variants</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Cost Price</TableHead>
                                    <TableHead>Selling Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {product.variants.map((variant) => (
                                    <TableRow key={variant.id}>
                                        <TableCell>{variant.name || '—'}</TableCell>
                                        <TableCell className="font-mono text-sm">{variant.sku}</TableCell>
                                        <TableCell>{variant.unit?.abbreviation || '—'}</TableCell>
                                        <TableCell>${variant.cost_price}</TableCell>
                                        <TableCell>${variant.selling_price}</TableCell>
                                        <TableCell>{variant.stock_quantity}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteVariant(variant.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="mt-4 rounded-lg border p-4">
                            <h3 className="mb-3 text-sm font-medium">Add New Variant</h3>
                            <div className="grid grid-cols-4 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Unit</Label>
                                    <Select value={newVariant.unit_id} onValueChange={(v) => setNewVariant({ ...newVariant, unit_id: v })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {units.map((u) => (
                                                <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Name</Label>
                                    <Input value={newVariant.name} onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">SKU</Label>
                                    <Input value={newVariant.sku} onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Units/Pkg</Label>
                                    <Input type="number" step="0.01" value={newVariant.units_per_package} onChange={(e) => setNewVariant({ ...newVariant, units_per_package: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Cost Price</Label>
                                    <Input type="number" step="0.01" value={newVariant.cost_price} onChange={(e) => setNewVariant({ ...newVariant, cost_price: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Selling Price</Label>
                                    <Input type="number" step="0.01" value={newVariant.selling_price} onChange={(e) => setNewVariant({ ...newVariant, selling_price: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Min Stock</Label>
                                    <Input type="number" step="0.01" value={newVariant.min_stock_level} onChange={(e) => setNewVariant({ ...newVariant, min_stock_level: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Max Stock</Label>
                                    <Input type="number" step="0.01" value={newVariant.max_stock_level} onChange={(e) => setNewVariant({ ...newVariant, max_stock_level: e.target.value })} />
                                </div>
                            </div>
                            <Button type="button" size="sm" className="mt-3" onClick={handleAddVariant}>
                                <Plus className="mr-2 h-4 w-4" /> Add Variant
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ProductsEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Products', href: products() },
        { title: 'Edit', href: '#' },
    ],
};
