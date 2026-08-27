import { Head, router } from '@inertiajs/react';
import {
    LoaderCircle,
    Save,
    Search,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { variantsUpdateStockPrice, dashboard } from '@/feature-routes';
import { useTranslation } from '@/lib/i18n';
import type { Product } from '@/types';

type Props = {
    products: Product[];
};

type VariantRow = {
    product_id: number;
    product_name: string;
    category_name: string;
    variant_id: number;
    variant_name: string;
    unit_abbreviation: string;
    units_per_package: number;
    units_per_pack: number;
    pricing_mode: 'single' | 'pack' | 'package' | 'both' | 'single_pack';
    quantity: string;
    original_stock_quantity: number;
    stock_quantity: string;
    cost_price: string;
    selling_price: string;
    per_unit_price: string;
    pack_price: string;
};

const PAGE_SIZE = 20;

export default function StockPriceUpdate({ products }: Props) {
    const { t } = useTranslation();
    const [savingId, setSavingId] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [unitFilter, setUnitFilter] = useState('');
    const [page, setPage] = useState(1);

    const categories = useMemo(() => {
        const map = new Map<number, string>();

        for (const p of products) {
            if (p.category) {
                map.set(p.category.id, p.category.name);
            }
        }

        return Array.from(map.entries())
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [products]);

    const units = useMemo(() => {
        const map = new Map<string, string>();

        for (const p of products) {
            for (const v of p.variants ?? []) {
                if (v.unit) {
                    map.set(v.unit.abbreviation, v.unit.name);
                }
            }
        }

        return Array.from(map.entries())
            .map(([abbreviation, name]) => ({ abbreviation, name }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [products]);

    const rows: VariantRow[] = [];

    for (const product of products) {
        for (const variant of product.variants ?? []) {
            const unitsPerPackage = Number(variant.units_per_package) || 0;

            rows.push({
                product_id: product.id,
                product_name: product.name,
                category_name: product.category?.name || '',
                variant_id: variant.id,
                variant_name: variant.name || '—',
                unit_abbreviation: variant.unit?.abbreviation || '—',
                units_per_package: unitsPerPackage,
                units_per_pack: Number(variant.units_per_pack) || 1,
                pricing_mode: variant.pricing_mode || 'both',
                quantity: '',
                original_stock_quantity: Number(variant.stock_quantity) || 0,
                stock_quantity: String(Number(variant.stock_quantity)),
                cost_price: String(Number(variant.cost_price)),
                selling_price: String(Number(variant.selling_price)),
                per_unit_price: String(Number(variant.per_unit_price)),
                pack_price: String(Number(variant.pack_price)),
            });
        }
    }

    const [data, setData] = useState<VariantRow[]>(rows);

    const filtered = useMemo(() => {
        let result = data;

        if (categoryFilter && categoryFilter !== 'all') {
            const catId = Number(categoryFilter);
            result = result.filter(
                (r) =>
                    products.find((p) => p.id === r.product_id)?.category
                        ?.id === catId,
            );
        }

        if (unitFilter && unitFilter !== 'all') {
            result = result.filter((r) => r.unit_abbreviation === unitFilter);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (r) =>
                    r.product_name.toLowerCase().includes(q) ||
                    r.variant_name.toLowerCase().includes(q) ||
                    r.unit_abbreviation.toLowerCase().includes(q),
            );
        }

        return result;
    }, [data, search, categoryFilter, unitFilter, products]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginated = filtered.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );

    const updateRow = (
        variantId: number,
        field: keyof VariantRow,
        value: string,
    ) => {
        setData((prev) => {
            const updated = prev.map((r) => {
                if (r.variant_id !== variantId) {
                    return r;
                }

                const next = { ...r, [field]: value };

                return next;
            });

            return updated;
        });
    };

    const updateQuantity = (variantId: number, value: string) => {
        setData((prev) =>
            prev.map((r) => {
                if (r.variant_id !== variantId) {
                    return r;
                }

                const integerValue = value.replace(/[^0-9]/g, '');
                const qty = parseInt(integerValue, 10) || 0;
                const stock = String(
                    r.original_stock_quantity + qty,
                );

                return {
                    ...r,
                    quantity: integerValue,
                    stock_quantity: stock,
                };
            }),
        );
    };

    const handleSave = (variantId: number) => {
        const row = data.find((r) => r.variant_id === variantId);

        if (!row) {
            return;
        }

        setSavingId(variantId);

        router.patch(
            variantsUpdateStockPrice({
                product: row.product_id,
                variant: row.variant_id,
            }).url,
            {
                stock_quantity: parseFloat(row.stock_quantity),
                cost_price: parseFloat(row.cost_price),
                selling_price: parseFloat(row.selling_price),
                per_unit_price: parseFloat(row.per_unit_price) || 0,
                pack_price: parseFloat(row.pack_price) || 0,
            },
            {
                preserveScroll: true,
                onFinish: () => setSavingId(null),
            },
        );
    };

    const hasChanges = (variantId: number) => {
        const original = rows.find((r) => r.variant_id === variantId);
        const current = data.find((r) => r.variant_id === variantId);

        if (!original || !current) {
            return false;
        }

        return (
            original.stock_quantity !== current.stock_quantity ||
            original.cost_price !== current.cost_price ||
            original.selling_price !== current.selling_price ||
            original.per_unit_price !== current.per_unit_price ||
            original.pack_price !== current.pack_price
        );
    };

    return (
        <>
            <Head title={t('Stock & Price Update')} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        {t('Stock & Price Update')}
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <SearchableSelect
                        value={categoryFilter}
                        onValueChange={(v) => {
                            setCategoryFilter(v);
                            setPage(1);
                        }}
                        options={[
                            { value: 'all', label: t('All Categories') },
                            ...categories.map((cat) => ({
                                value: String(cat.id),
                                label: cat.name,
                            })),
                        ]}
                        placeholder={t('All Categories')}
                        className="w-100 lg:w-45"
                    />
                    <SearchableSelect
                        value={unitFilter}
                        onValueChange={(v) => {
                            setUnitFilter(v);
                            setPage(1);
                        }}
                        options={[
                            { value: 'all', label: t('All Units') },
                            ...units.map((u) => ({
                                value: u.abbreviation,
                                label: u.name,
                            })),
                        ]}
                        placeholder={t('All Units')}
                        className="w-100 lg:w-45"
                    />
                    <Input
                        placeholder={t(
                            'Search by product, variant, or unit...',
                        )}
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="max-w-sm"
                    />
                    <Search className="h-4 w-4 text-muted-foreground" />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('Variants')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('Product')}</TableHead>
                                    <TableHead>{t('Variant')}</TableHead>
                                    <TableHead>
                                        {t('Units Per Package')}
                                    </TableHead>
                                    <TableHead>{t('Quantity')}</TableHead>
                                    <TableHead>{t('Cost Price')}</TableHead>
                                    <TableHead>{t('Selling Price')}</TableHead>
                                    <TableHead>{t('Per Unit Price')}</TableHead>
                                    <TableHead>{t('Pack Price')}</TableHead>
                                    <TableHead className="text-right">
                                        {t('Action')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginated.map((row) => (
                                    <TableRow key={row.variant_id}>
                                        <TableCell>
                                            {row.product_name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span>{row.variant_name}</span>
                                                <span className="text-sm font-bold text-muted-foreground">
                                                    {t('Stock')}: {row.stock_quantity}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {Number(row.units_per_package)}
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                step="1"
                                                min="0"
                                                className="h-8 w-24"
                                                value={row.quantity}
                                                onChange={(e) =>
                                                    updateQuantity(
                                                        row.variant_id,
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                step="1"
                                                className="h-8 w-28"
                                                value={row.cost_price}
                                                onChange={(e) =>
                                                    updateRow(
                                                        row.variant_id,
                                                        'cost_price',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {(row.pricing_mode === 'single' ||
                                                row.pricing_mode === 'both' ||
                                                row.pricing_mode === 'package' ||
                                                row.pricing_mode === 'single_pack') && (
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    className="h-8 w-28"
                                                    value={row.selling_price}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            row.variant_id,
                                                            'selling_price',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {(row.pricing_mode === 'both') && (
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    className="h-8 w-28"
                                                    value={row.per_unit_price}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            row.variant_id,
                                                            'per_unit_price',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {(row.pricing_mode === 'pack' ||
                                                row.pricing_mode === 'both' ||
                                                row.pricing_mode === 'single_pack') && (
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    className="h-8 w-28"
                                                    value={row.pack_price}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            row.variant_id,
                                                            'pack_price',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="icon"
                                                className="h-8 w-8"
                                                disabled={
                                                    savingId ===
                                                        row.variant_id ||
                                                    !hasChanges(row.variant_id)
                                                }
                                                onClick={() =>
                                                    handleSave(row.variant_id)
                                                }
                                            >
                                                {savingId === row.variant_id ? (
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Save className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {paginated.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            {t('No variants found.')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {t('Showing')} {paginated.length} {t('of')}{' '}
                                {filtered.length} {t('variants')}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm">
                                    {currentPage} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

StockPriceUpdate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Stock & Price Update', href: '#' },
    ],
};
