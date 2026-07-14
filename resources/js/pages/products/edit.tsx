import { Head, Link, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { LoaderCircle, Plus, Pencil, Trash2 } from 'lucide-react';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    products,
    productsUpdate,
    variantsStore,
    variantsUpdate,
    variantsDestroy,
    dashboard,
} from '@/feature-routes';
import { ks } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import type { Category, Product, Unit } from '@/types';

type Props = {
    product: Product;
    categories: Category[];
    units: Unit[];
};

export default function ProductsEdit({ product, categories, units }: Props) {
    const { t } = useTranslation();
    const {
        data,
        setData,
        patch,
        processing,
        errors: formErrors,
    } = useForm({
        category_id: String(product.category?.id ?? ''),
        name: product.name,
        image: product.image as string | File | null,
        brand: product.brand ?? '',
        is_active: product.is_active,
    });

    const [newVariant, setNewVariant] = useState({
        unit_id: '',
        name: '',
        units_per_package: '1',
        cost_price: '0',
        selling_price: '0',
        per_unit_price: '0',
        min_stock_level: '0',
        max_stock_level: '',
    });

    const [editingVariant, setEditingVariant] = useState<
        Product['variants'][number] | null
    >(null);
    const [editVariantProcessing, setEditVariantProcessing] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(productsUpdate({ id: product.id }).url, {
            preserveScroll: true,
        });
    };

    const handleAddVariant = () => {
        router.post(
            variantsStore({ id: product.id }).url,
            {
                ...newVariant,
                units_per_package: parseFloat(newVariant.units_per_package),
                cost_price: parseFloat(newVariant.cost_price),
                selling_price: parseFloat(newVariant.selling_price),
                per_unit_price: parseFloat(newVariant.per_unit_price),
                min_stock_level: parseFloat(newVariant.min_stock_level),
                max_stock_level: newVariant.max_stock_level
                    ? parseFloat(newVariant.max_stock_level)
                    : null,
            },
            { preserveScroll: true },
        );
    };

    const handleDeleteVariant = (variantId: number) => {
        if (confirm(`${t('Delete this variant?')}`)) {
            router.delete(
                variantsDestroy({ product: product.id, variant: variantId })
                    .url,
                { preserveScroll: true },
            );
        }
    };

    const handleEditVariant = (variant: Product['variants'][number]) => {
        setEditingVariant(variant);
        setNewVariant({
            unit_id: String(variant.unit_id),
            name: variant.name || '',
            units_per_package: String(variant.units_per_package),
            cost_price: String(variant.cost_price),
            selling_price: String(variant.selling_price),
            per_unit_price: String(variant.per_unit_price),
            min_stock_level: String(variant.min_stock_level),
            max_stock_level: variant.max_stock_level
                ? String(variant.max_stock_level)
                : '',
        });
        setEditDialogOpen(true);
    };

    const handleUpdateVariant = () => {
        if (!editingVariant) return;

        setEditVariantProcessing(true);
        router.patch(
            variantsUpdate({ product: product.id, variant: editingVariant.id })
                .url,
            {
                ...newVariant,
                units_per_package: parseFloat(newVariant.units_per_package),
                cost_price: parseFloat(newVariant.cost_price),
                selling_price: parseFloat(newVariant.selling_price),
                per_unit_price: parseFloat(newVariant.per_unit_price),
                min_stock_level: parseFloat(newVariant.min_stock_level),
                max_stock_level: newVariant.max_stock_level
                    ? parseFloat(newVariant.max_stock_level)
                    : null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditVariantProcessing(false);
                    setEditDialogOpen(false);
                    setEditingVariant(null);
                },
                onError: () => {
                    setEditVariantProcessing(false);
                },
                onFinish: () => {
                    setEditVariantProcessing(false);
                },
            },
        );
    };

    return (
        <>
            <Head title={`${t('Edit')}: ${product.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        {t('Edit')}: {product.name}
                    </h1>
                    <Link href={products()}>
                        <Button variant="outline">
                            {t('Back to Products')}
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Product Details')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="category_id">
                                        {t('Category')}
                                    </Label>
                                    <Select
                                        value={data.category_id}
                                        onValueChange={(v) =>
                                            setData('category_id', v)
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem
                                                    key={cat.id}
                                                    value={String(cat.id)}
                                                >
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">{t('Name')}</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                    />
                                    {formErrors.name && (
                                        <p className="text-sm text-destructive">
                                            {formErrors.name}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="brand">{t('Brand')}</Label>
                                    <Input
                                        id="brand"
                                        value={data.brand}
                                        onChange={(e) =>
                                            setData('brand', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="image">{t('Image')}</Label>
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];

                                            if (file) {
                                                setData('image', file);
                                            }
                                        }}
                                    />
                                    {data.image &&
                                        typeof data.image === 'string' &&
                                        product.image_url && (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="mt-1 h-20 w-20 rounded object-cover"
                                            />
                                        )}
                                    {formErrors.image && (
                                        <p className="text-sm text-destructive">
                                            {formErrors.image}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing && (
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {t('Update Product')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{t('Variants')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('Name')}</TableHead>
                                        <TableHead>{t('Unit')}</TableHead>
                                        <TableHead>{t('Cost Price')}</TableHead>
                                        <TableHead>
                                            {t('Selling Price')}
                                        </TableHead>
                                        <TableHead>{t('Per Unit')}</TableHead>
                                        <TableHead>{t('Stock')}</TableHead>
                                        <TableHead className="text-right">
                                            {t('Actions')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {product?.variants?.map((variant) => (
                                        <TableRow key={variant.id}>
                                            <TableCell>
                                                {variant.name || '—'}
                                            </TableCell>
                                            <TableCell>
                                                {variant.unit?.abbreviation ||
                                                    '—'}
                                            </TableCell>
                                            <TableCell>
                                                Ks {ks(variant.cost_price)}
                                            </TableCell>
                                            <TableCell>
                                                Ks {ks(variant.selling_price)}
                                            </TableCell>
                                            <TableCell>
                                                Ks {ks(variant.per_unit_price)}
                                            </TableCell>
                                            <TableCell>
                                                {Number(variant.stock_quantity)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleEditVariant(
                                                                variant,
                                                            )
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleDeleteVariant(
                                                                variant.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="mt-4 rounded-lg border p-4">
                            <h3 className="mb-3 text-sm font-medium">
                                {t('Add New Variant')}
                            </h3>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">
                                        {t('Unit')}
                                    </Label>
                                    <Select
                                        value={newVariant.unit_id}
                                        onValueChange={(v) =>
                                            setNewVariant({
                                                ...newVariant,
                                                unit_id: v,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={t('Unit')}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {units.map((u) => (
                                                <SelectItem
                                                    key={u.id}
                                                    value={String(u.id)}
                                                >
                                                    {u.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">
                                        {t('Name')}
                                    </Label>
                                    <Input
                                        value={newVariant.name}
                                        onChange={(e) =>
                                            setNewVariant({
                                                ...newVariant,
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">
                                        {t('Units/Pkg')}
                                    </Label>
                                    <Input
                                        type="number"

                                        value={newVariant.units_per_package}
                                        onChange={(e) =>
                                            setNewVariant({
                                                ...newVariant,
                                                units_per_package:
                                                    e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">
                                        {t('Cost Price')}
                                    </Label>
                                    <Input
                                        type="number"

                                        value={newVariant.cost_price}
                                        onChange={(e) =>
                                            setNewVariant({
                                                ...newVariant,
                                                cost_price: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">
                                        {t('Selling Price')}
                                    </Label>
                                    <Input
                                        type="number"

                                        value={newVariant.selling_price}
                                        onChange={(e) =>
                                            setNewVariant({
                                                ...newVariant,
                                                selling_price: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">
                                        {t('Per Unit Price')}
                                    </Label>
                                    <Input
                                        type="number"

                                        value={newVariant.per_unit_price}
                                        onChange={(e) =>
                                            setNewVariant({
                                                ...newVariant,
                                                per_unit_price: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">
                                        {t('Min Stock')}
                                    </Label>
                                    <Input
                                        type="number"

                                        value={newVariant.min_stock_level}
                                        onChange={(e) =>
                                            setNewVariant({
                                                ...newVariant,
                                                min_stock_level: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">
                                        {t('Max Stock')}
                                    </Label>
                                    <Input
                                        type="number"

                                        value={newVariant.max_stock_level}
                                        onChange={(e) =>
                                            setNewVariant({
                                                ...newVariant,
                                                max_stock_level: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="mt-3 flex justify-end">
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleAddVariant}
                                >
                                    <Plus className="mr-2 h-4 w-4" />{' '}
                                    {t('Add Variant')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Dialog
                    open={editDialogOpen}
                    onOpenChange={(open) => {
                        setEditDialogOpen(open);
                        if (!open) {
                            setEditingVariant(null);
                        }
                    }}
                >
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{t('Edit Variant')}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-2 lg:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-xs">{t('Unit')}</Label>
                                <Select
                                    value={newVariant.unit_id}
                                    onValueChange={(v) =>
                                        setNewVariant({
                                            ...newVariant,
                                            unit_id: v,
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((u) => (
                                            <SelectItem
                                                key={u.id}
                                                value={String(u.id)}
                                            >
                                                {u.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">{t('Name')}</Label>
                                <Input
                                    value={newVariant.name}
                                    onChange={(e) =>
                                        setNewVariant({
                                            ...newVariant,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">
                                    {t('Units/Pkg')}
                                </Label>
                                <Input
                                    type="number"

                                    value={newVariant.units_per_package}
                                    onChange={(e) =>
                                        setNewVariant({
                                            ...newVariant,
                                            units_per_package: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">
                                    {t('Cost Price')}
                                </Label>
                                <Input
                                    type="number"

                                    value={newVariant.cost_price}
                                    onChange={(e) =>
                                        setNewVariant({
                                            ...newVariant,
                                            cost_price: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">
                                    {t('Selling Price')}
                                </Label>
                                <Input
                                    type="number"

                                    value={newVariant.selling_price}
                                    onChange={(e) =>
                                        setNewVariant({
                                            ...newVariant,
                                            selling_price: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">
                                    {t('Per Unit Price')}
                                </Label>
                                <Input
                                    type="number"

                                    value={newVariant.per_unit_price}
                                    onChange={(e) =>
                                        setNewVariant({
                                            ...newVariant,
                                            per_unit_price: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">
                                    {t('Min Stock')}
                                </Label>
                                <Input
                                    type="number"

                                    value={newVariant.min_stock_level}
                                    onChange={(e) =>
                                        setNewVariant({
                                            ...newVariant,
                                            min_stock_level: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">
                                    {t('Max Stock')}
                                </Label>
                                <Input
                                    type="number"

                                    value={newVariant.max_stock_level}
                                    onChange={(e) =>
                                        setNewVariant({
                                            ...newVariant,
                                            max_stock_level: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setEditDialogOpen(false)}
                                disabled={editVariantProcessing}
                            >
                                {t('Cancel')}
                            </Button>
                            <Button
                                onClick={handleUpdateVariant}
                                disabled={editVariantProcessing}
                            >
                                {editVariantProcessing && (
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {t('Update Variant')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
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
