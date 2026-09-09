import { Head, Link, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { LoaderCircle, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    products,
    productsUpdate,
    variantsStore,
    variantsUpdate,
    variantsDestroy,
    dashboard,
} from '@/feature-routes';
import { useTranslation } from '@/lib/i18n';
import { ks } from '@/lib/utils';
import type { Category, Product, Unit } from '@/types';

type Props = {
    product: Product;
    categories: Category[];
    units: Unit[];
};

type VariantFormData = {
    unit_id: string;
    name: string;
    pricing_mode: 'single' | 'pack' | 'package' | 'both' | 'single_pack';
    image: File | null;
    units_per_package: string;
    units_per_pack: string;
    cost_price: string;
    selling_price: string;
    per_unit_price: string;
    pack_price: string;
    min_stock_level: string;
    max_stock_level: string;
};

const emptyVariant: VariantFormData = {
    unit_id: '',
    name: '',
    pricing_mode: 'both',
    image: null,
    units_per_package: '1',
    units_per_pack: '1',
    cost_price: '0',
    selling_price: '0',
    per_unit_price: '0',
    pack_price: '0',
    min_stock_level: '0',
    max_stock_level: '',
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
        brand: product.brand ?? '',
        is_active: product.is_active,
    });

    const [newVariant, setNewVariant] = useState<VariantFormData>({
        ...emptyVariant,
    });
    const [editVariant, setEditVariant] = useState<VariantFormData>({
        ...emptyVariant,
    });
    const [editingVariantId, setEditingVariantId] = useState<number | null>(
        null,
    );
    const [editVariantProcessing, setEditVariantProcessing] = useState(false);

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
                image: newVariant.image ?? null,
                units_per_package: parseInt(newVariant.units_per_package, 10),
                units_per_pack: parseInt(newVariant.units_per_pack, 10),
                cost_price: parseFloat(newVariant.cost_price),
                selling_price: parseFloat(newVariant.selling_price),
                per_unit_price: parseFloat(newVariant.per_unit_price),
                pack_price: parseFloat(newVariant.pack_price),
                min_stock_level: parseInt(newVariant.min_stock_level, 10),
                max_stock_level: newVariant.max_stock_level
                    ? parseInt(newVariant.max_stock_level, 10)
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
        setEditingVariantId(variant.id);
        setEditVariant({
            unit_id: String(variant.unit_id),
            name: variant.name || '',
            pricing_mode: variant.pricing_mode || 'both',
            image: null,
            units_per_package: String(variant.units_per_package),
            units_per_pack: String(variant.units_per_pack),
            cost_price: String(variant.cost_price),
            selling_price: String(variant.selling_price),
            per_unit_price: String(variant.per_unit_price),
            pack_price: String(variant.pack_price),
            min_stock_level: String(variant.min_stock_level),
            max_stock_level: variant.max_stock_level
                ? String(variant.max_stock_level)
                : '',
        });
    };

    const handleUpdateVariant = () => {
        if (editingVariantId === null) {
            return;
        }

        setEditVariantProcessing(true);

        const payload: Record<string, unknown> = {
            ...editVariant,
            units_per_package: parseInt(editVariant.units_per_package, 10),
            units_per_pack: parseInt(editVariant.units_per_pack, 10),
            cost_price: parseFloat(editVariant.cost_price),
            selling_price: parseFloat(editVariant.selling_price),
            per_unit_price: parseFloat(editVariant.per_unit_price),
            pack_price: parseFloat(editVariant.pack_price),
            min_stock_level: parseInt(editVariant.min_stock_level, 10),
            max_stock_level: editVariant.max_stock_level
                ? parseInt(editVariant.max_stock_level, 10)
                : null,
        };

        if (editVariant.image instanceof File) {
            payload.image = editVariant.image;
        } else {
            delete payload.image;
        }

        router.patch(
            variantsUpdate({ product: product.id, variant: editingVariantId })
                .url,
            payload,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditVariantProcessing(false);
                    setEditingVariantId(null);
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
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2 md:col-span-2 lg:col-span-1">
                                    <Label htmlFor="category_id">
                                        {t('Category')}
                                    </Label>
                                    <SearchableSelect
                                        value={data.category_id}
                                        onValueChange={(v) =>
                                            setData('category_id', v)
                                        }
                                        options={categories.map((cat) => ({
                                            value: String(cat.id),
                                            label: cat.name,
                                        }))}
                                        className="w-full"
                                    />
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
                                        <TableHead>{t('Image')}</TableHead>
                                        <TableHead>{t('Name')}</TableHead>
                                        <TableHead>{t('Unit')}</TableHead>
                                        <TableHead>{t('Pricing')}</TableHead>
                                        <TableHead>{t('Cost Price')}</TableHead>
                                        <TableHead>
                                            {t('Selling Price')}
                                        </TableHead>
                                        <TableHead>{t('Per Unit')}</TableHead>
                                        <TableHead>{t('Pack Price')}</TableHead>
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
                                                {variant.image_url ? (
                                                    <img
                                                        src={variant.image_url}
                                                        alt={
                                                            variant.name ||
                                                            'Variant'
                                                        }
                                                        className="h-9 w-9 rounded object-cover"
                                                    />
                                                ) : (
                                                    '—'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {variant.name || '—'}
                                            </TableCell>
                                            <TableCell>
                                                {variant.unit?.abbreviation ||
                                                    '—'}
                                            </TableCell>
                                            <TableCell>
                                                {variant.pricing_mode === 'both'
                                                    ? t(
                                                          'single + pack + package',
                                                      )
                                                    : variant.pricing_mode ===
                                                        'single_pack'
                                                      ? t('single + pack')
                                                      : variant.pricing_mode ===
                                                          'single'
                                                        ? t('single mode')
                                                        : variant.pricing_mode ===
                                                            'pack'
                                                          ? t('pack mode')
                                                          : t('package mode')}
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
                                                Ks {ks(variant.pack_price)}
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
                                {editingVariantId
                                    ? t('Edit Variant')
                                    : t('Add New Variant')}
                            </h3>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <Label className="text-xs">
                                        {t('Image')}
                                    </Label>
                                    <Input
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];

                                            if (file) {
                                                if (editingVariantId) {
                                                    setEditVariant({
                                                        ...editVariant,
                                                        image: file,
                                                    });
                                                } else {
                                                    setNewVariant({
                                                        ...newVariant,
                                                        image: file,
                                                    });
                                                }
                                            }
                                        }}
                                    />
                                    {(() => {
                                        const active = editingVariantId
                                            ? editVariant
                                            : newVariant;
                                        const imgSrc =
                                            active.image instanceof File
                                                ? URL.createObjectURL(
                                                      active.image,
                                                  )
                                                : editingVariantId
                                                  ? product.variants.find(
                                                        (v) =>
                                                            v.id ===
                                                            editingVariantId,
                                                    )?.image_url
                                                  : null;

                                        return imgSrc ? (
                                            <img
                                                src={imgSrc}
                                                alt="Variant preview"
                                                className="h-12 w-12 rounded object-cover"
                                            />
                                        ) : null;
                                    })()}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">
                                        {t('Unit')}
                                    </Label>
                                    <SearchableSelect
                                        value={
                                            editingVariantId
                                                ? editVariant.unit_id
                                                : newVariant.unit_id
                                        }
                                        onValueChange={(v) => {
                                            if (editingVariantId) {
                                                setEditVariant({
                                                    ...editVariant,
                                                    unit_id: v,
                                                });
                                            } else {
                                                setNewVariant({
                                                    ...newVariant,
                                                    unit_id: v,
                                                });
                                            }
                                        }}
                                        options={units.map((u) => ({
                                            value: String(u.id),
                                            label: u.name,
                                        }))}
                                        placeholder={t('Unit')}
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">
                                        {t('Name')}
                                    </Label>
                                    <Input
                                        value={
                                            editingVariantId
                                                ? editVariant.name
                                                : newVariant.name
                                        }
                                        onChange={(e) => {
                                            if (editingVariantId) {
                                                setEditVariant({
                                                    ...editVariant,
                                                    name: e.target.value,
                                                });
                                            } else {
                                                setNewVariant({
                                                    ...newVariant,
                                                    name: e.target.value,
                                                });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">
                                        {t('Pricing Mode')}
                                    </Label>
                                    <SearchableSelect
                                        value={
                                            editingVariantId
                                                ? editVariant.pricing_mode
                                                : newVariant.pricing_mode
                                        }
                                        onValueChange={(v) => {
                                            if (editingVariantId) {
                                                setEditVariant({
                                                    ...editVariant,
                                                    pricing_mode:
                                                        v as VariantFormData['pricing_mode'],
                                                });
                                            } else {
                                                setNewVariant({
                                                    ...newVariant,
                                                    pricing_mode:
                                                        v as VariantFormData['pricing_mode'],
                                                });
                                            }
                                        }}
                                        options={[
                                            {
                                                value: 'both',
                                                label: t(
                                                    'single + pack + package',
                                                ),
                                            },
                                            {
                                                value: 'single_pack',
                                                label: t('single + pack'),
                                            },
                                            {
                                                value: 'single',
                                                label: t('single mode'),
                                            },
                                            {
                                                value: 'pack',
                                                label: t('pack mode'),
                                            },
                                            {
                                                value: 'package',
                                                label: t('package mdoe'),
                                            },
                                        ]}
                                        placeholder={t('Pricing Mode')}
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">
                                        {t('Units/Pkg')}
                                    </Label>
                                    <Input
                                        type="number"
                                        value={
                                            editingVariantId
                                                ? editVariant.units_per_package
                                                : newVariant.units_per_package
                                        }
                                        onChange={(e) => {
                                            if (editingVariantId) {
                                                setEditVariant({
                                                    ...editVariant,
                                                    units_per_package:
                                                        e.target.value,
                                                });
                                            } else {
                                                setNewVariant({
                                                    ...newVariant,
                                                    units_per_package:
                                                        e.target.value,
                                                });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">
                                        {t('Cost Price')}
                                    </Label>
                                    <Input
                                        type="number"
                                        value={
                                            editingVariantId
                                                ? editVariant.cost_price
                                                : newVariant.cost_price
                                        }
                                        onChange={(e) => {
                                            if (editingVariantId) {
                                                setEditVariant({
                                                    ...editVariant,
                                                    cost_price: e.target.value,
                                                });
                                            } else {
                                                setNewVariant({
                                                    ...newVariant,
                                                    cost_price: e.target.value,
                                                });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">
                                        {t('Selling Price')}
                                    </Label>
                                    <Input
                                        type="number"
                                        value={
                                            editingVariantId
                                                ? editVariant.selling_price
                                                : newVariant.selling_price
                                        }
                                        onChange={(e) => {
                                            if (editingVariantId) {
                                                setEditVariant({
                                                    ...editVariant,
                                                    selling_price:
                                                        e.target.value,
                                                });
                                            } else {
                                                setNewVariant({
                                                    ...newVariant,
                                                    selling_price:
                                                        e.target.value,
                                                });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">
                                        {t('Per Unit Price')}
                                    </Label>
                                    <Input
                                        type="number"
                                        value={
                                            editingVariantId
                                                ? editVariant.per_unit_price
                                                : newVariant.per_unit_price
                                        }
                                        onChange={(e) => {
                                            if (editingVariantId) {
                                                setEditVariant({
                                                    ...editVariant,
                                                    per_unit_price:
                                                        e.target.value,
                                                });
                                            } else {
                                                setNewVariant({
                                                    ...newVariant,
                                                    per_unit_price:
                                                        e.target.value,
                                                });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">
                                        {t('Pack Price')}
                                    </Label>
                                    <Input
                                        type="number"
                                        value={
                                            editingVariantId
                                                ? editVariant.pack_price
                                                : newVariant.pack_price
                                        }
                                        onChange={(e) => {
                                            if (editingVariantId) {
                                                setEditVariant({
                                                    ...editVariant,
                                                    pack_price: e.target.value,
                                                });
                                            } else {
                                                setNewVariant({
                                                    ...newVariant,
                                                    pack_price: e.target.value,
                                                });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">
                                        {t('Units/Pack')}
                                    </Label>
                                    <Input
                                        type="number"
                                        value={
                                            editingVariantId
                                                ? editVariant.units_per_pack
                                                : newVariant.units_per_pack
                                        }
                                        onChange={(e) => {
                                            if (editingVariantId) {
                                                setEditVariant({
                                                    ...editVariant,
                                                    units_per_pack:
                                                        e.target.value,
                                                });
                                            } else {
                                                setNewVariant({
                                                    ...newVariant,
                                                    units_per_pack:
                                                        e.target.value,
                                                });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">
                                        {t('Min Stock')}
                                    </Label>
                                    <Input
                                        type="number"
                                        value={
                                            editingVariantId
                                                ? editVariant.min_stock_level
                                                : newVariant.min_stock_level
                                        }
                                        onChange={(e) => {
                                            if (editingVariantId) {
                                                setEditVariant({
                                                    ...editVariant,
                                                    min_stock_level:
                                                        e.target.value,
                                                });
                                            } else {
                                                setNewVariant({
                                                    ...newVariant,
                                                    min_stock_level:
                                                        e.target.value,
                                                });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">
                                        {t('Max Stock')}
                                    </Label>
                                    <Input
                                        type="number"
                                        value={
                                            editingVariantId
                                                ? editVariant.max_stock_level
                                                : newVariant.max_stock_level
                                        }
                                        onChange={(e) => {
                                            if (editingVariantId) {
                                                setEditVariant({
                                                    ...editVariant,
                                                    max_stock_level:
                                                        e.target.value,
                                                });
                                            } else {
                                                setNewVariant({
                                                    ...newVariant,
                                                    max_stock_level:
                                                        e.target.value,
                                                });
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="mt-3 flex justify-end gap-2">
                                {editingVariantId && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setEditingVariantId(null);
                                        }}
                                        disabled={editVariantProcessing}
                                    >
                                        <X className="mr-1 h-4 w-4" />
                                        {t('Cancel')}
                                    </Button>
                                )}
                                {editingVariantId ? (
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleUpdateVariant}
                                        disabled={editVariantProcessing}
                                    >
                                        {editVariantProcessing && (
                                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        {t('Update Variant')}
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleAddVariant}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />{' '}
                                        {t('Add Variant')}
                                    </Button>
                                )}
                            </div>
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
