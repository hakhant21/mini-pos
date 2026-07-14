import { Head, Link, router } from '@inertiajs/react';
import {
    ShoppingCart,
    Search,
    ChevronDown,
    ChevronUp,
    Banknote,
    Smartphone,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Fragment, useState, useMemo } from 'react';
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
import {
    sales as salesRoute,
    salesCheckout,
    dashboard,
} from '@/feature-routes';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { useTranslation } from '@/lib/i18n';
import { ks } from '@/lib/utils';
import type { Sale } from '@/types';

type Props = {
    sales: Sale[];
    summary: {
        total_sales: number;
        total_change: number;
    };
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        start_date: string | null;
        end_date: string | null;
    };
};

const paymentMethodLabel: Record<string, string> = {
    cash: 'Cash',
    kbzpay: 'KBZ Pay',
};

const paymentMethodIcon: Record<string, typeof Banknote> = {
    cash: Banknote,
    kbzpay: Smartphone,
};

export default function SalesIndex({
    sales: salesData,
    summary,
    pagination,
    filters,
}: Props) {
    useFlashToast();
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [startDate, setStartDate] = useState(filters.start_date ?? '');
    const [endDate, setEndDate] = useState(filters.end_date ?? '');

    const isDateFiltered = Boolean(startDate && endDate);

    const sales = useMemo(() => salesData ?? [], [salesData]);

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const filteredSales = useMemo(() => {
        if (!search.trim()) {
            return sales;
        }

        const q = search.toLowerCase();

        return sales.filter(
            (s) =>
                s.invoice_number.toLowerCase().includes(q) ||
                s.notes?.toLowerCase().includes(q) ||
                false,
        );
    }, [sales, search]);

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleFilter = () => {
        const params: Record<string, string> = {};

        if (startDate && endDate) {
            params.start_date = startDate;
            params.end_date = endDate;
        }

        router.get(
            salesRoute({ query: params }).url,
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleClearFilter = () => {
        setStartDate('');
        setEndDate('');
        router.get(
            salesRoute().url,
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const goToPage = (page: number) => {
        const params: Record<string, string | number> = { page };

        if (startDate && endDate) {
            params.start_date = startDate;
            params.end_date = endDate;
        }

        router.get(
            salesRoute({ query: params }).url,
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const dateDisplayText = isDateFiltered
        ? `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        : today;

    return (
        <>
            <Head title={t('Sales History')} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            {t('Sales History')}
                        </h1>
                        <p className="mt-4 text-sm text-muted-foreground">
                            {dateDisplayText}
                        </p>
                    </div>
                    <Link href={salesCheckout().url}>
                        <Button className="cursor-pointer">
                            <ShoppingCart className="mr-2 h-4 w-4" /> {t('POS')}
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                {isDateFiltered
                                    ? t('Filtered Total Sales')
                                    : t('Today Total Sales')}
                            </CardTitle>
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                Ks {ks(summary.total_sales)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                {isDateFiltered
                                    ? t('Filtered Total Change')
                                    : t('Total Change')}
                            </CardTitle>
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                Ks {ks(summary.total_change)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle>
                                {isDateFiltered
                                    ? t('Filtered Transactions')
                                    : t("Today's Transactions")}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder={t('Search invoice...')}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full sm:w-64"
                                />
                                <Search className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-muted-foreground">
                                    {t('Start Date')}
                                </label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                    className="w-full sm:w-40"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-muted-foreground">
                                    {t('End Date')}
                                </label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full sm:w-40"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleFilter}
                                    disabled={!startDate || !endDate}
                                    className="flex-1 sm:flex-none"
                                >
                                    {t('Filter')}
                                </Button>
                                {isDateFiltered && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClearFilter}
                                        className="flex-1 sm:flex-none"
                                    >
                                        {t('Clear')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-8"></TableHead>
                                    <TableHead className="text-right">
                                        {t('Time')}
                                    </TableHead>
                                    <TableHead className="text-right">
                                        {t('Items')}
                                    </TableHead>
                                    <TableHead className="text-right">
                                        {t('Paid Amount')}
                                    </TableHead>
                                    <TableHead className="text-right">
                                        {t('Receive Amount')}
                                    </TableHead>
                                    <TableHead className="text-right">
                                        {t('Change')}
                                    </TableHead>
                                    <TableHead className="text-right">
                                        {t('Payment')}
                                    </TableHead>

                                    <TableHead className="text-right">
                                        {t('Discount')}
                                    </TableHead>
                                    <TableHead className="text-right">
                                        {t('Tax')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSales.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={11}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            {t('No sales recorded today.')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSales.map((sale) => {
                                        const isExpanded =
                                            expandedId === sale.id;
                                        const PaymentIcon =
                                            paymentMethodIcon[
                                                sale.payment_method
                                            ] || Banknote;
                                        const itemCount = sale.items.reduce(
                                            (sum, item) =>
                                                sum + Number(item.quantity),
                                            0,
                                        );

                                        return (
                                            <Fragment key={sale.id}>
                                                <TableRow
                                                    className="cursor-pointer hover:bg-muted/50"
                                                    onClick={() =>
                                                        toggleExpand(sale.id)
                                                    }
                                                >
                                                    <TableCell className="w-8">
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right text-sm text-muted-foreground">
                                                        {new Date(
                                                            sale.created_at,
                                                        ).toLocaleTimeString(
                                                            'en-US',
                                                            {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            },
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {itemCount}
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold">
                                                        Ks{' '}
                                                        {ks(sale.total_amount)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        Ks{' '}
                                                        {ks(sale.amount_paid)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {Number(sale.change) >
                                                        0 ? (
                                                            <span className="text-green-600">
                                                                Ks{' '}
                                                                {ks(
                                                                    sale.change,
                                                                )}
                                                            </span>
                                                        ) : (
                                                            '—'
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge
                                                            variant="outline"
                                                            className="gap-1"
                                                        >
                                                            <PaymentIcon className="h-3 w-3" />
                                                            {paymentMethodLabel[
                                                                sale
                                                                    .payment_method
                                                            ] ||
                                                                sale.payment_method}
                                                        </Badge>
                                                    </TableCell>

                                                    <TableCell className="text-right">
                                                        {Number(sale.discount) >
                                                        0 ? (
                                                            <span className="text-destructive">
                                                                -Ks{' '}
                                                                {ks(
                                                                    sale.discount,
                                                                )}
                                                            </span>
                                                        ) : (
                                                            '—'
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {Number(sale.tax) >
                                                        0 ? (
                                                            <span>
                                                                +Ks{' '}
                                                                {ks(sale.tax)}
                                                            </span>
                                                        ) : (
                                                            '—'
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                                {isExpanded && (
                                                    <TableRow
                                                        key={`${sale.id}-detail`}
                                                    >
                                                        <TableCell
                                                            colSpan={11}
                                                            className="bg-muted/30 p-0"
                                                        >
                                                            <div className="px-4 py-3">
                                                                {sale.notes && (
                                                                    <p className="mb-2 text-sm text-muted-foreground">
                                                                        <span className="font-medium">
                                                                            {t(
                                                                                'Notes',
                                                                            )}
                                                                            :
                                                                        </span>{' '}
                                                                        {
                                                                            sale.notes
                                                                        }
                                                                    </p>
                                                                )}
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow>
                                                                            <TableHead>
                                                                                {t(
                                                                                    'Product',
                                                                                )}
                                                                            </TableHead>
                                                                            <TableHead>
                                                                                {t(
                                                                                    'Unit',
                                                                                )}
                                                                            </TableHead>
                                                                            <TableHead className="text-right">
                                                                                {t(
                                                                                    'Qty',
                                                                                )}
                                                                            </TableHead>
                                                                            <TableHead className="text-right">
                                                                                {t(
                                                                                    'Price',
                                                                                )}
                                                                            </TableHead>
                                                                            <TableHead className="text-right">
                                                                                {t(
                                                                                    'Total',
                                                                                )}
                                                                            </TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {sale.items.map(
                                                                            (
                                                                                item,
                                                                            ) => (
                                                                                <TableRow
                                                                                    key={
                                                                                        item.id
                                                                                    }
                                                                                >
                                                                                    <TableCell>
                                                                                        <span className="font-medium">
                                                                                            {
                                                                                                item.product_name
                                                                                            }
                                                                                        </span>
                                                                                        {item.variant_name && (
                                                                                            <span className="ml-1 text-muted-foreground">
                                                                                                (
                                                                                                {
                                                                                                    item.variant_name
                                                                                                }

                                                                                                )
                                                                                            </span>
                                                                                        )}
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        {item.unit_name ||
                                                                                            '—'}
                                                                                    </TableCell>
                                                                                    <TableCell className="text-right">
                                                                                        {Number(
                                                                                            item.quantity,
                                                                                        )}
                                                                                    </TableCell>
                                                                                    <TableCell className="text-right">
                                                                                        Ks{' '}
                                                                                        {ks(
                                                                                            item.unit_price,
                                                                                        )}
                                                                                    </TableCell>
                                                                                    <TableCell className="text-right font-medium">
                                                                                        Ks{' '}
                                                                                        {ks(
                                                                                            item.total_price,
                                                                                        )}
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            ),
                                                                        )}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </Fragment>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                        {pagination.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    {t('Page')} {pagination.current_page}{' '}
                                    {t('of')} {pagination.last_page} (
                                    {pagination.total} {t('total')})
                                </p>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            goToPage(
                                                pagination.current_page - 1,
                                            )
                                        }
                                        disabled={pagination.current_page <= 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    {Array.from(
                                        { length: pagination.last_page },
                                        (_, i) => i + 1,
                                    )
                                        .filter((page) => {
                                            const current =
                                                pagination.current_page;

                                            return (
                                                page === 1 ||
                                                page === pagination.last_page ||
                                                Math.abs(page - current) <= 1
                                            );
                                        })
                                        .reduce<(number | string)[]>(
                                            (acc, page, idx, arr) => {
                                                if (
                                                    idx > 0 &&
                                                    (arr[idx - 1] as number) <
                                                        page - 1
                                                ) {
                                                    acc.push('...');
                                                }

                                                acc.push(page);

                                                return acc;
                                            },
                                            [],
                                        )
                                        .map((item, idx) =>
                                            typeof item === 'string' ? (
                                                <span
                                                    key={`ellipsis-${idx}`}
                                                    className="px-2 text-muted-foreground"
                                                >
                                                    ...
                                                </span>
                                            ) : (
                                                <Button
                                                    key={item}
                                                    variant={
                                                        item ===
                                                        pagination.current_page
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        goToPage(item)
                                                    }
                                                >
                                                    {item}
                                                </Button>
                                            ),
                                        )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            goToPage(
                                                pagination.current_page + 1,
                                            )
                                        }
                                        disabled={
                                            pagination.current_page >=
                                            pagination.last_page
                                        }
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

SalesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Sales', href: '#' },
    ],
};
