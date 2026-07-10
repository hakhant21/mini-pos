import { Head, Link } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { LoaderCircle, Plus, Trash2 } from 'lucide-react';
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
    products,
    productsCreate,
    productsStore,
    dashboard,
} from '@/feature-routes';
import { useTranslation } from '@/lib/i18n';
import type { Category, Unit } from '@/types';

type Props = {
    categories: Category[];
    units: Unit[];
};

type VariantForm = {
    unit_id: string;
    name: string;
    units_per_package: string;
    cost_price: string;
    selling_price: string;
    min_stock_level: string;
    max_stock_level: string;
};

export default function ProductsCreate({ categories, units }: Props) {
    const { t } = useTranslation();
    const {
        data,
        setData,
        post,
        processing,
        errors: formErrors,
    } = useForm<{
        category_id: string;
        name: string;
        image: File | null;
        brand: string;
        is_active: boolean;
        variants: VariantForm[];
    }>({
        category_id: '',
        name: '',
        image: null,
        brand: '',
        is_active: true,
        variants: [],
    });

    const variants = data.variants;

    const addVariant = () => {
        setData('variants', [
            ...variants,
            {
                unit_id: '',
                name: '',
                units_per_package: '1',
                cost_price: '0',
                selling_price: '0',
                min_stock_level: '0',
                max_stock_level: '',
            },
        ]);
    };

    const removeVariant = (index: number) => {
        setData('variants', variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: string, value: string) => {
        const updated = variants.map((v, i) =>
            i === index ? { ...v, [field]: value } : v,
        );
        setData('variants', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(productsStore().url, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={t('Create Product')} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{t('Create Product')}</h1>
                    <Link href={products()}>
                        <Button variant="outline">{t('Back to Products')}</Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Product Details')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                                {formErrors.image && (
                                    <p className="text-sm text-destructive">
                                        {formErrors.image}
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
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
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('Select category')} />
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
                                    {formErrors.category_id && (
                                        <p className="text-sm text-destructive">
                                            {formErrors.category_id}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
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
                                    <Label htmlFor="brand">Brand</Label>
                                    <Input
                                        id="brand"
                                        value={data.brand}
                                        onChange={(e) =>
                                            setData('brand', e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mt-4">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Variants</CardTitle>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addVariant}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Variant
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {variants.map((variant, index) => (
                                <div
                                    key={index}
                                    className="rounded-lg border p-4"
                                >
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            Variant {index + 1}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeVariant(index)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs">
                                                Unit
                                            </Label>
                                            <Select
                                                value={variant.unit_id}
                                                onValueChange={(v) =>
                                                    updateVariant(
                                                        index,
                                                        'unit_id',
                                                        v,
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Unit" />
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
                                        <div className="space-y-1">
                                            <Label className="text-xs">
                                                Name
                                            </Label>
                                            <Input
                                                value={variant.name}
                                                onChange={(e) =>
                                                    updateVariant(
                                                        index,
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. Bottle"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">
                                                Units/Pkg
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={
                                                    variant.units_per_package
                                                }
                                                onChange={(e) =>
                                                    updateVariant(
                                                        index,
                                                        'units_per_package',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">
                                                Cost Price
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={variant.cost_price}
                                                onChange={(e) =>
                                                    updateVariant(
                                                        index,
                                                        'cost_price',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">
                                                Selling Price
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={variant.selling_price}
                                                onChange={(e) =>
                                                    updateVariant(
                                                        index,
                                                        'selling_price',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">
                                                Min Stock
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={variant.min_stock_level}
                                                onChange={(e) =>
                                                    updateVariant(
                                                        index,
                                                        'min_stock_level',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">
                                                Max Stock
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={variant.max_stock_level}
                                                onChange={(e) =>
                                                    updateVariant(
                                                        index,
                                                        'max_stock_level',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {variants.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Add at least one variant to this product.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="mt-4 flex justify-end gap-2">
                        <Link href={products()}>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing || variants.length === 0}
                        >
                            {processing && (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create Product
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

ProductsCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Products', href: products() },
        { title: 'Create', href: productsCreate().url },
    ],
};
