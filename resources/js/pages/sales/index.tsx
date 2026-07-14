import { Head, Link } from '@inertiajs/react';
import {
    ShoppingCart,
    Search,
    ChevronDown,
    ChevronUp,
    Banknote,
    Smartphone,
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
import { salesCheckout, dashboard } from '@/feature-routes';
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
};

const paymentMethodLabel: Record<string, string> = {
    cash: 'Cash',
    kbzpay: 'KBZ Pay',
};

const paymentMethodIcon: Record<string, typeof Banknote> = {
    cash: Banknote,
    kbzpay: Smartphone,
};

export default function SalesIndex({ sales: salesData, summary }: Props) {
    useFlashToast();
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<number | null>(null);

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
                            {today}
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
                                {t('Today Total Sales')}
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
                                {t('Total Change')}
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
                        <div className="flex items-center justify-between">
                            <CardTitle>{t("Today's Transactions")}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('Search invoice...')}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-64"
                                />
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
