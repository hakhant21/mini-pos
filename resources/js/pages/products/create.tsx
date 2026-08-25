import { Head, Link } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { LoaderCircle, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
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
    pricing_mode: 'single' | 'pack' | 'package' | 'both' | 'single_pack';
    image: File | null;
    units_per_package: string;
    units_per_pack: string;
    cost_price: string;
    selling_price: string;
    per_unit_price: string;
    pack_price: string;
    stock_quantity: string;
    min_stock_level: string;
    max_stock_level: string;
};

const emptyVariant = (): VariantForm => ({
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
    stock_quantity: '0',
    min_stock_level: '0',
    max_stock_level: '',
});

const pricingModeOptions = (t: (k: string) => string) => [
    { value: 'both', label: t('single + pack + package') },
    { value: 'single_pack', label: t('single + pack') },
    { value: 'single', label: t('single mode') },
    { value: 'pack', label: t('pack mode') },
    { value: 'package', label: t('package mode') },
];

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
        brand: string;
        is_active: boolean;
        variants: VariantForm[];
    }>({
        category_id: '',
        name: '',
        brand: '',
        is_active: true,
        variants: [],
    });

    const variants = data.variants;

    const addVariant = () => {
        setData('variants', [...variants, emptyVariant()]);
    };

    const removeVariant = (index: number) => {
        setData(
            'variants',
            variants.filter((_, i) => i !== index),
        );
    };

    const updateVariant = (
        index: number,
        field: string,
        value: string | File,
    ) => {
        const updated = variants.map((v, i) => {
            if (i !== index) {
                return v;
            }

            return { ...v, [field]: value };
        });
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
                    <h1 className="text-2xl font-bold">
                        {t('Create Product')}
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
                                        placeholder={t('Select category')}
                                        className="w-full"
                                    />
                                    {formErrors.category_id && (
                                        <p className="text-sm text-destructive">
                                            {formErrors.category_id}
                                        </p>
                                    )}
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
                                    {formErrors.brand && (
                                        <p className="text-sm text-destructive">
                                            {formErrors.brand}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mt-4">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{t('Variants')}</CardTitle>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addVariant}
                            >
                                <Plus className="mr-2 h-4 w-4" />{' '}
                                {t('Add Variant')}
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
                                            {t('Variant')} {index + 1}
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
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs">
                                                {t('Image')}
                                            </Label>
                                            <Input
                                                type="file"
                                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                                onChange={(e) => {
                                                    const file =
                                                        e.target.files?.[0];

                                                    if (file) {
                                                        updateVariant(
                                                            index,
                                                            'image',
                                                            file,
                                                        );
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">
                                                {t('Unit')}
                                            </Label>
                                            <SearchableSelect
                                                value={variant.unit_id}
                                                onValueChange={(v) =>
                                                    updateVariant(
                                                        index,
                                                        'unit_id',
                                                        v,
                                                    )
                                                }
                                                options={units.map((u) => ({
                                                    value: String(u.id),
                                                    label: u.name,
                                                }))}
                                                placeholder={t('Unit')}
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">
                                                {t('Name')}
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
                                                {t('Pricing Mode')}
                                            </Label>
                                            <SearchableSelect
                                                value={variant.pricing_mode}
                                                onValueChange={(v) =>
                                                    updateVariant(
                                                        index,
                                                        'pricing_mode',
                                                        v,
                                                    )
                                                }
                                                options={pricingModeOptions(t)}
                                                placeholder={t('Pricing Mode')}
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">
                                                {t('Units per Package')}
                                            </Label>
                                            <Input
                                                type="number"
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
                                                {t('Cost Price')}
                                            </Label>
                                            <Input
                                                type="number"
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
                                                {t('Selling Price')}
                                            </Label>
                                            <Input
                                                type="number"
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
                                                {t('Per Unit Price')}
                                            </Label>
                                            <Input
                                                type="number"
                                                value={variant.per_unit_price}
                                                onChange={(e) =>
                                                    updateVariant(
                                                        index,
                                                        'per_unit_price',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">
                                                {t('Pack Price')}
                                            </Label>
                                            <Input
                                                type="number"
                                                value={variant.pack_price}
                                                onChange={(e) =>
                                                    updateVariant(
                                                        index,
                                                        'pack_price',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">
                                                {t('Units per Pack')}
                                            </Label>
                                            <Input
                                                type="number"
                                                value={variant.units_per_pack}
                                                onChange={(e) =>
                                                    updateVariant(
                                                        index,
                                                        'units_per_pack',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">
                                                {t('Stock Quantity')}
                                            </Label>
                                            <Input
                                                type="number"
                                                value={variant.stock_quantity}
                                                onChange={(e) =>
                                                    updateVariant(
                                                        index,
                                                        'stock_quantity',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">
                                                {t('Min Stock')}
                                            </Label>
                                            <Input
                                                type="number"
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
                                                {t('Max Stock')}
                                            </Label>
                                            <Input
                                                type="number"
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
