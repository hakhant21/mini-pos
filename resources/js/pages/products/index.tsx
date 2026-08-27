import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Plus,
    Search,
    Eye,
    Pencil,
    Trash2,
    ToggleLeft,
    ToggleRight,
    X,
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
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
import {
    products,
    productsCreate,
    productsShow,
    productsEdit,
    productsDestroy,
    productsToggleActive,
    dashboard,
} from '@/feature-routes';
import { useTranslation } from '@/lib/i18n';
import type { Product } from '@/types';

type Props = {
    products: Product[];
};

function getInitialSearchParam(key: string): string {
    const params = new URLSearchParams(window.location.search);
    return params.get(key) ?? '';
}

export default function ProductsIndex({ products: productsData }: Props) {
    const { t } = useTranslation();
    const [search, setSearch] = useState(() => getInitialSearchParam('search'));
    const [categoryFilter, setCategoryFilter] = useState(() =>
        getInitialSearchParam('category'),
    );

    const categories = useMemo(() => {
        const map = new Map<number, string>();

        for (const p of productsData) {
            if (p.category) {
                map.set(p.category.id, p.category.name);
            }
        }

        return Array.from(map.entries())
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [productsData]);

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

        const newSearch = params.toString();
        const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;

        window.history.replaceState({}, '', newUrl);
    }, [search, categoryFilter]);

    const filteredProducts = useMemo(() => {
        let result = productsData;

        if (categoryFilter && categoryFilter !== 'all') {
            result = result.filter(
                (p) => p.category?.id === Number(categoryFilter),
            );
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.sku.toLowerCase().includes(q) ||
                    (p.brand && p.brand.toLowerCase().includes(q)) ||
                    (p.category?.name &&
                        p.category.name.toLowerCase().includes(q)),
            );
        }

        return result;
    }, [productsData, search, categoryFilter]);

    const handleDelete = (product: Product) => {
        if (confirm(`${t('Delete')} "${product.name}"?`)) {
            router.delete(productsDestroy({ id: product.id }).url, {
                preserveScroll: true,
            });
        }
    };

    const handleToggleActive = (product: Product) => {
        router.patch(
            productsToggleActive({ id: product.id }).url,
            {},
            { preserveScroll: true },
        );
    };

    const hasActiveFilters = search !== '' || (categoryFilter !== '' && categoryFilter !== 'all');

    const handleClearFilters = () => {
        setSearch('');
        setCategoryFilter('');
        window.history.replaceState({}, '', window.location.pathname);
    };

    return (
        <>
            <Head title={t('Products')} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{t('Products')}</h1>
                    <Link href={productsCreate()}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> {t('Add Product')}
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <SearchableSelect
                        value={categoryFilter}
                        onValueChange={setCategoryFilter}
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

                    <Input
                        placeholder={t('Search by name, SKU, or brand...')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
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
                        <CardTitle>{t('All Products')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('Category')}</TableHead>
                                    <TableHead>{t('Name')}</TableHead>
                                    <TableHead>{t('SKU')}</TableHead>
                                    <TableHead>{t('Brand')}</TableHead>
                                    <TableHead>{t('Variants')}</TableHead>
                                    <TableHead>{t('Status')}</TableHead>
                                    <TableHead className="text-right">
                                        {t('Actions')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            {product.category?.name || '—'}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {product.name}
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {product.sku}
                                        </TableCell>
                                        <TableCell>
                                            {product.brand || '—'}
                                        </TableCell>
                                        <TableCell>
                                            {product.variants_count ?? 0}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    product.is_active
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {product.is_active
                                                    ? t('Active')
                                                    : t('Inactive')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleToggleActive(
                                                            product,
                                                        )
                                                    }
                                                    title={
                                                        product.is_active
                                                            ? t('Deactivate')
                                                            : t('Activate')
                                                    }
                                                >
                                                    {product.is_active ? (
                                                        <ToggleRight className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </Button>
                                                <Link
                                                    href={productsShow({
                                                        id: product.id,
                                                    })}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title={t('View')}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link
                                                    href={productsEdit({
                                                        id: product.id,
                                                    })}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title={t('Edit')}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleDelete(product)
                                                    }
                                                    title={t('Delete')}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            {t('No products found.')}
                                        </TableCell>
                                    </TableRow>
                                )}
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
