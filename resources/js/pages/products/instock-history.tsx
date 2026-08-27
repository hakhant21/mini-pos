import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useTranslation } from '@/lib/i18n';
import { ks } from '@/lib/utils';
import { productsShow } from '@/feature-routes';
import type { Product, ProductVariant } from '@/types';
import type { User } from '@/types';

type InStockHistory = {
    id: number;
    quantity: number;
    previous_stock: number;
    new_stock: number;
    cost_price: number | null;
    selling_price: number | null;
    total_amount: number | null;
    notes: string | null;
    created_at: string;
    user: User;
};

type PaginatedHistories = {
    data: InStockHistory[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

type Props = {
    product: Product;
    variant: ProductVariant;
    histories: PaginatedHistories;
};

export default function InstockHistory({
    product,
    variant,
    histories,
}: Props) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={`${product.name} - ${variant.name} - Stock History`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={productsShow(product.id)}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">
                            {product.name} - {variant.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t('Stock History')}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('Stock History')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('Date')}</TableHead>
                                    <TableHead>{t('User')}</TableHead>
                                    <TableHead>{t('Quantity')}</TableHead>
                                    <TableHead>{t('Previous')}</TableHead>
                                    <TableHead>{t('New')}</TableHead>
                                    <TableHead>{t('Cost Price')}</TableHead>
                                    <TableHead>{t('Selling Price')}</TableHead>
                                    <TableHead>{t('Total Amount')}</TableHead>
                                    <TableHead>{t('Notes')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {histories.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="text-center text-muted-foreground"
                                        >
                                            {t('No stock history yet')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    histories.data.map((history) => (
                                        <TableRow key={history.id}>
                                            <TableCell>
                                                {new Date(
                                                    history.created_at,
                                                ).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {history.user?.name ?? '-'}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={
                                                        history.quantity > 0
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                    }
                                                >
                                                    {history.quantity > 0
                                                        ? '+'
                                                        : ''}
                                                    {history.quantity}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {history.previous_stock}
                                            </TableCell>
                                            <TableCell>
                                                {history.new_stock}
                                            </TableCell>
                                            <TableCell>
                                                {history.cost_price
                                                    ? ks(history.cost_price)
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {history.selling_price
                                                    ? ks(history.selling_price)
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {history.total_amount
                                                    ? ks(history.total_amount)
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {history.notes ?? '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
