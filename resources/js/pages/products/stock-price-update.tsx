import { Head, router } from '@inertiajs/react';
import {
    LoaderCircle,
    Save,
    Pencil,
    Search,
    ChevronLeft,
    ChevronRight,
    X,
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    units_per_package: string;
    units_per_pack: number;
    pricing_mode: 'single' | 'pack' | 'package' | 'both' | 'single_pack';
    quantity: string;
    loose_quantity: string;
    original_stock_quantity: number;
    stock_quantity: string;
    cost_price: string;
    selling_price: string;
    per_unit_price: string;
    pack_price: string;
};

const PAGE_SIZE = 20;

function getInitialSearchParam(key: string): string {
    const params = new URLSearchParams(window.location.search);

    return params.get(key) ?? '';
}

export default function StockPriceUpdate({ products }: Props) {
    const { t } = useTranslation();
    const [savingId, setSavingId] = useState<number | null>(null);
    const [editingVariantId, setEditingVariantId] = useState<number | null>(
        null,
    );
    const [search, setSearch] = useState(() => getInitialSearchParam('search'));
    const [categoryFilter, setCategoryFilter] = useState(() =>
        getInitialSearchParam('category'),
    );
    const [unitFilter, setUnitFilter] = useState(() =>
        getInitialSearchParam('unit'),
    );
    const [page, setPage] = useState(() => {
        const p = parseInt(getInitialSearchParam('page'), 10);

        return isNaN(p) || p < 1 ? 1 : p;
    });

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
                units_per_package: String(Number(variant.units_per_package)),
                units_per_pack: Number(variant.units_per_pack) || 1,
                pricing_mode: variant.pricing_mode || 'both',
                quantity: '',
                loose_quantity: '',
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

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (search) {
            params.set('search', search);
        } else {
            params.delete('search');
        }

        if (categoryFilter && categoryFilter !== 'all') {
            params.set('category', categoryFilter);
        } else {
            params.delete('category');
        }

        if (unitFilter && unitFilter !== 'all') {
            params.set('unit', unitFilter);
        } else {
            params.delete('unit');
        }

        if (page > 1) {
            params.set('page', String(page));
        } else {
            params.delete('page');
        }

        const newSearch = params.toString();
        const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;

        window.history.replaceState({}, '', newUrl);
    }, [search, categoryFilter, unitFilter, page]);

    const hasActiveFilters =
        search !== '' ||
        (categoryFilter !== '' && categoryFilter !== 'all') ||
        (unitFilter !== '' && unitFilter !== 'all');

    const handleClearFilters = () => {
        setSearch('');
        setCategoryFilter('');
        setUnitFilter('');
        setPage(1);
        window.history.replaceState({}, '', window.location.pathname);
    };

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

    const updateUnitsPerPackage = (variantId: number, value: string) => {
        updateRow(variantId, 'units_per_package', value);

        const units = Number(value);

        if (!units || units < 0.01) {
            return;
        }

        setData((prev) =>
            prev.map((r) => {
                if (r.variant_id !== variantId) {
                    return r;
                }

                const packages = parseInt(r.quantity, 10) || 0;
                const loose = parseInt(r.loose_quantity, 10) || 0;

                return {
                    ...r,
                    stock_quantity: String(
                        r.original_stock_quantity + packages * units + loose,
                    ),
                };
            }),
        );
    };

    const updateQuantity = (
        variantId: number,
        field: 'quantity' | 'loose_quantity',
        value: string,
    ) => {
        setData((prev) =>
            prev.map((r) => {
                if (r.variant_id !== variantId) {
                    return r;
                }

                const integerValue = value.replace(/[^0-9]/g, '');
                const packages =
                    parseInt(
                        field === 'quantity' ? integerValue : r.quantity,
                        10,
                    ) || 0;
                const units = Number(r.units_per_package) || 1;
                const loose =
                    parseInt(
                        field === 'loose_quantity'
                            ? integerValue
                            : r.loose_quantity,
                        10,
                    ) || 0;

                return {
                    ...r,
                    [field]: integerValue,
                    stock_quantity: String(
                        r.original_stock_quantity + packages * units + loose,
                    ),
                };
            }),
        );
    };

    const getStockBreakdown = (row: VariantRow) => {
        const units = Number(row.units_per_package) || 1;
        const totalUnits = Number(row.stock_quantity);

        return {
            totalUnits,
            packages: Math.floor(totalUnits / units),
            loose: totalUnits % units,
        };
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
                units_per_package: parseInt(row.units_per_package, 10),
                cost_price: parseFloat(row.cost_price),
                selling_price: parseFloat(row.selling_price),
                per_unit_price: parseFloat(row.per_unit_price) || 0,
                pack_price: parseFloat(row.pack_price) || 0,
            },
            {
                preserveScroll: true,
                onSuccess: () => setEditingVariantId(null),
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
            original.units_per_package !== current.units_per_package ||
            original.cost_price !== current.cost_price ||
            original.selling_price !== current.selling_price ||
            original.per_unit_price !== current.per_unit_price ||
            original.pack_price !== current.pack_price
        );
    };

    const editingRow = data.find((row) => row.variant_id === editingVariantId);

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
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearFilters}
                        >
                            <X className="mr-1 h-4 w-4" />
                            {t('Clear')}
                        </Button>
                    )}
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
                                    <TableHead>{t('Units/Pkg')}</TableHead>
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
                                    <TableRow
                                        key={row.variant_id}
                                        className="cursor-pointer"
                                        tabIndex={0}
                                        onClick={() =>
                                            setEditingVariantId(row.variant_id)
                                        }
                                        onTouchEnd={() =>
                                            setEditingVariantId(row.variant_id)
                                        }
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === 'Enter' ||
                                                e.key === ' '
                                            ) {
                                                e.preventDefault();
                                                setEditingVariantId(
                                                    row.variant_id,
                                                );
                                            }
                                        }}
                                    >
                                        <TableCell>
                                            {row.product_name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span>{row.variant_name}</span>
                                                <span className="text-sm font-bold text-muted-foreground">
                                                    {t('Stock')}:
                                                </span>
                                                <span className="text-sm font-bold text-muted-foreground">
                                                    {(() => {
                                                        const stock =
                                                            getStockBreakdown(
                                                                row,
                                                            );

                                                        return `${stock.totalUnits} / ${row.units_per_package} = ${stock.packages} ${t('Packages')}, ${stock.loose} ${t('Units')}`;
                                                    })()}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {row.units_per_package}
                                        </TableCell>
                                        <TableCell>
                                            {row.stock_quantity}
                                        </TableCell>
                                        <TableCell>{row.cost_price}</TableCell>
                                        <TableCell>
                                            {row.selling_price}
                                        </TableCell>
                                        <TableCell>
                                            {row.per_unit_price}
                                        </TableCell>
                                        <TableCell>{row.pack_price}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        setEditingVariantId(
                                                            row.variant_id,
                                                        )
                                                    }
                                                >
                                                    <Pencil className="mr-1 h-4 w-4" />
                                                    {t('Edit')}
                                                </Button>
                                            </div>
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

                <Dialog
                    open={editingRow !== undefined}
                    onOpenChange={(open) => {
                        if (!open && savingId === null) {
                            setEditingVariantId(null);
                        }
                    }}
                >
                    {editingRow && (
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>
                                    {t('Edit Stock & Price')}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingRow.product_name} -{' '}
                                    {editingRow.variant_name}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="grid gap-2 text-sm font-medium">
                                    {t('Units/Pkg')}
                                    <Input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={editingRow.units_per_package}
                                        onChange={(e) =>
                                            updateUnitsPerPackage(
                                                editingRow.variant_id,
                                                e.target.value,
                                            )
                                        }
                                    />
                                </label>
                                <label className="grid gap-2 text-sm font-medium">
                                    {t('Packages')}
                                    <Input
                                        type="number"
                                        min="0"
                                        step="1"
                                        placeholder={t('Packages')}
                                        value={editingRow.quantity}
                                        onChange={(e) =>
                                            updateQuantity(
                                                editingRow.variant_id,
                                                'quantity',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </label>
                                <label className="grid gap-2 text-sm font-medium">
                                    {t('Loose')}
                                    <Input
                                        type="number"
                                        min="0"
                                        step="1"
                                        placeholder={t('Units')}
                                        value={editingRow.loose_quantity}
                                        onChange={(e) =>
                                            updateQuantity(
                                                editingRow.variant_id,
                                                'loose_quantity',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </label>
                                <label className="grid gap-2 text-sm font-medium">
                                    {t('Cost Price')}
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={editingRow.cost_price}
                                        onChange={(e) =>
                                            updateRow(
                                                editingRow.variant_id,
                                                'cost_price',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </label>
                                <label className="grid gap-2 text-sm font-medium">
                                    {t('Selling Price')}
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={editingRow.selling_price}
                                        onChange={(e) =>
                                            updateRow(
                                                editingRow.variant_id,
                                                'selling_price',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </label>
                                <label className="grid gap-2 text-sm font-medium">
                                    {t('Per Unit Price')}
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={editingRow.per_unit_price}
                                        onChange={(e) =>
                                            updateRow(
                                                editingRow.variant_id,
                                                'per_unit_price',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </label>
                                <label className="grid gap-2 text-sm font-medium sm:col-span-2">
                                    {t('Pack Price')}
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={editingRow.pack_price}
                                        onChange={(e) =>
                                            updateRow(
                                                editingRow.variant_id,
                                                'pack_price',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </label>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setEditingVariantId(null)}
                                    disabled={savingId !== null}
                                >
                                    {t('Cancel')}
                                </Button>
                                <Button
                                    disabled={
                                        savingId === editingRow.variant_id ||
                                        !hasChanges(editingRow.variant_id)
                                    }
                                    onClick={() =>
                                        handleSave(editingRow.variant_id)
                                    }
                                >
                                    {savingId === editingRow.variant_id ? (
                                        <LoaderCircle className="mr-1 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-1 h-4 w-4" />
                                    )}
                                    {t('Save')}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    )}
                </Dialog>
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
