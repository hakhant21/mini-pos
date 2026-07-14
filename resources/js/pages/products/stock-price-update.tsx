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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    productsStockPriceUpdate,
    variantsUpdateStockPrice,
    dashboard,
} from '@/feature-routes';
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
    stock_quantity: string;
    cost_price: string;
    selling_price: string;
    per_unit_price: string;
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
            rows.push({
                product_id: product.id,
                product_name: product.name,
                category_name: product.category?.name || '',
                variant_id: variant.id,
                variant_name: variant.name || '—',
                unit_abbreviation: variant.unit?.abbreviation || '—',
                units_per_package: Number(variant.units_per_package),
                stock_quantity: String(Number(variant.stock_quantity)),
                cost_price: String(Number(variant.cost_price)),
                selling_price: String(Number(variant.selling_price)),
                per_unit_price: String(Number(variant.per_unit_price)),
            });
        }
    }

    const [data, setData] = useState<VariantRow[]>(rows);

    const filtered = useMemo(() => {
        let result = data;

        if (categoryFilter) {
            const catId = Number(categoryFilter);
            result = result.filter(
                (r) =>
                    products.find((p) => p.id === r.product_id)?.category
                        ?.id === catId,
            );
        }

        if (unitFilter) {
            result = result.filter(
                (r) => r.unit_abbreviation === unitFilter,
            );
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
                if (r.variant_id !== variantId) return r;
                const next = { ...r, [field]: value };
                if (field === 'cost_price' || field === 'units_per_package') {
                    const cost = parseFloat(next.cost_price) || 0;
                    const units = next.units_per_package || 1;
                    next.per_unit_price = String(cost / units);
                }
                return next;
            });
            return updated;
        });
    };

    const handleSave = (variantId: number) => {
        const row = data.find((r) => r.variant_id === variantId);
        if (!row) return;
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
        if (!original || !current) return false;
        return (
            original.stock_quantity !== current.stock_quantity ||
            original.cost_price !== current.cost_price ||
            original.selling_price !== current.selling_price ||
            original.per_unit_price !== current.per_unit_price
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

                <div className="flex items-center gap-4">
                    <select
                        value={categoryFilter}
                        onChange={(e) => {
                            setCategoryFilter(e.target.value);
                            setPage(1);
                        }}
                        className="h-9 rounded-md border border-input bg-background px-2 py-2 text-sm"
                    >
                        <option value="">{t('All Categories')}</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={unitFilter}
                        onChange={(e) => {
                            setUnitFilter(e.target.value);
                            setPage(1);
                        }}
                        className="h-9 rounded-md border border-input bg-background px-2 py-2 text-sm"
                    >
                        <option value="">{t('All Units')}</option>
                        {units.map((u) => (
                            <option key={u.abbreviation} value={u.abbreviation}>
                                {u.name}
                            </option>
                        ))}
                    </select>
                    <Search className="h-4 w-4 text-muted-foreground" />
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
                                    <TableHead>{t('Category')}</TableHead>
                                    <TableHead>{t('Variant')}</TableHead>
                                    <TableHead>{t('Unit')}</TableHead>
                                    <TableHead>{t('Pkg')}</TableHead>
                                    <TableHead>{t('Stock')}</TableHead>
                                    <TableHead>{t('Cost Price')}</TableHead>
                                    <TableHead>{t('Selling Price')}</TableHead>
                                    <TableHead>{t('Per Unit Price')}</TableHead>
                                    <TableHead className="text-right">
                                        {t('Action')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginated.map((row) => (
                                    <TableRow key={row.variant_id}>
                                        <TableCell className="font-medium">
                                            {row.product_name}
                                        </TableCell>
                                        <TableCell>
                                            {row.category_name || '—'}
                                        </TableCell>
                                        <TableCell>
                                            {row.variant_name}
                                        </TableCell>
                                        <TableCell>
                                            {row.unit_abbreviation}
                                        </TableCell>
                                        <TableCell>
                                            {Number(row.units_per_package)}
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                step="1"
                                                className="h-8 w-24"
                                                value={row.stock_quantity}
                                                onChange={(e) =>
                                                    updateRow(
                                                        row.variant_id,
                                                        'stock_quantity',
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
                                        </TableCell>
                                        <TableCell>
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
                                            colSpan={10}
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
