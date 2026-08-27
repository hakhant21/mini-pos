import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Pencil, Trash2, LoaderCircle, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { dashboard, balances, balancesDestroy } from '@/feature-routes';
import { useTranslation } from '@/lib/i18n';
import type { Balance } from '@/types';
import { Label } from '@/components/ui/label';

type Props = {
    balances: Balance[];
};

function getInitialSearchParam(key: string): string {
    const params = new URLSearchParams(window.location.search);
    return params.get(key) ?? '';
}

export default function BalancesIndex({ balances: balancesData }: Props) {
    const { t } = useTranslation();
    const [search, setSearch] = useState(() => getInitialSearchParam('name'));
    const [startDate, setStartDate] = useState(() =>
        getInitialSearchParam('start_date'),
    );
    const [endDate, setEndDate] = useState(() =>
        getInitialSearchParam('end_date'),
    );
    const [deleteTarget, setDeleteTarget] = useState<Balance | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleFilter = () => {
        const params: Record<string, string> = {};
        if (search) params.name = search;
        params.end_date = endDate || new Date().toISOString().split('T')[0];
        params.start_date = startDate || new Date().toISOString().split('T')[0];
        router.get(balances(), params, { preserveScroll: true });
    };

    const hasActiveFilters = search !== '' || startDate !== '' || endDate !== '';

    const handleClearFilters = () => {
        setSearch('');
        setStartDate('');
        setEndDate('');
        router.get(balances().url, {}, { preserveScroll: true, replace: true });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;

        setProcessing(true);
        router.delete(balancesDestroy({ id: deleteTarget.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteTarget(null);
                setDeleteDialogOpen(false);
            },
            onFinish: () => setProcessing(false),
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <>
            <Head title={t('Balances')} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">{t('Balances')}</h1>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div>
                        <Input
                            placeholder={t('Search by name...')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-80"
                        />
                    </div>
                    <div>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-80"
                        />
                    </div>
                    <div>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-80"
                        />
                    </div>
                    <div>
                        <Button variant="outline" onClick={handleFilter}>
                            {t('Filter')}
                        </Button>
                    </div>
                    {hasActiveFilters && (
                        <div>
                            <Button variant="outline" onClick={handleClearFilters}>
                                <X className="mr-1 h-4 w-4" />
                                {t('Clear')}
                            </Button>
                        </div>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('All Balances')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('User')}</TableHead>
                                    <TableHead>{t('Opening')}</TableHead>
                                    <TableHead>{t('Closing')}</TableHead>
                                    <TableHead>{t('Sales')}</TableHead>
                                    <TableHead>{t('Change')}</TableHead>
                                    <TableHead className="text-right">
                                        {t('Actions')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {balancesData.map((balance) => (
                                    <TableRow key={balance.id}>
                                        <TableCell className="font-medium">
                                            {balance.user?.name ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(
                                                balance.opening_amount,
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(
                                                balance.closing_amount,
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(
                                                balance.total_sale_amount,
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(
                                                balance.total_change_amount,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Dialog
                                                    open={deleteDialogOpen}
                                                    onOpenChange={(open) => {
                                                        setDeleteDialogOpen(
                                                            open,
                                                        );
                                                        if (!open) {
                                                            setDeleteTarget(
                                                                null,
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setDeleteTarget(
                                                                    balance,
                                                                );
                                                                setDeleteDialogOpen(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>
                                                                {t(
                                                                    'Delete Balance',
                                                                )}
                                                            </DialogTitle>
                                                            <DialogDescription>
                                                                {t(
                                                                    'Are you sure you want to delete this balance? This action cannot be undone.',
                                                                )}
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <DialogFooter>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() =>
                                                                    setDeleteDialogOpen(
                                                                        false,
                                                                    )
                                                                }
                                                            >
                                                                {t('Cancel')}
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                onClick={
                                                                    handleDelete
                                                                }
                                                                disabled={
                                                                    processing
                                                                }
                                                            >
                                                                {processing && (
                                                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                                )}
                                                                {t('Delete')}
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {balancesData.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            {t('No balances found.')}
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

BalancesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Balances', href: balances() },
    ],
};
