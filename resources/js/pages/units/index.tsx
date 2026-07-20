import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, LoaderCircle, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
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
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    units,
    unitsStore,
    unitsUpdate,
    unitsDestroy,
    dashboard,
} from '@/feature-routes';
import { useTranslation } from '@/lib/i18n';
import type { Unit, UnitForm } from '@/types';

type Props = {
    units: Unit[];
};

export default function UnitsIndex({ units: unitsData }: Props) {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const filteredUnits = useMemo(() => {
        if (!search.trim()) {
return unitsData;
}

        const q = search.toLowerCase();

        return unitsData.filter(
            (u) =>
                u.name.toLowerCase().includes(q) ||
                u.abbreviation.toLowerCase().includes(q),
        );
    }, [unitsData, search]);

    const {
        data,
        setData,
        post,
        patch,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm<UnitForm>({
        name: '',
        abbreviation: '',
    });

    const openCreate = () => {
        reset();
        setEditingUnit(null);
        setDialogOpen(true);
    };

    const openEdit = (unit: Unit) => {
        setEditingUnit(unit);
        setData({ name: unit.name, abbreviation: unit.abbreviation });
        setDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUnit) {
            patch(unitsUpdate({ id: editingUnit.id }).url, {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingUnit(null);
                    setDialogOpen(false);
                    reset();
                },
            });
        } else {
            post(unitsStore().url, {
                preserveScroll: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deleteTarget) {
            return;
        }

        destroy(unitsDestroy({ id: deleteTarget.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteTarget(null);
                setDeleteDialogOpen(false);
            },
        });
    };

    return (
        <>
            <Head title={t('Units')} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{t('Units')}</h1>
                    <Dialog
                        open={dialogOpen}
                        onOpenChange={(open) => {
                            setDialogOpen(open);

                            if (!open) {
                                setEditingUnit(null);
                                reset();
                            }
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" />{' '}
                                {t('Add Unit')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingUnit
                                        ? t('Edit Unit')
                                        : t('Create Unit')}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingUnit
                                        ? t('Update the unit details.')
                                        : t('Add a new measurement unit.')}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">{t('Name')}</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="abbreviation">
                                        {t('Abbreviation')}
                                    </Label>
                                    <Input
                                        id="abbreviation"
                                        value={data.abbreviation}
                                        onChange={(e) =>
                                            setData(
                                                'abbreviation',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.abbreviation && (
                                        <p className="text-sm text-destructive">
                                            {errors.abbreviation}
                                        </p>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={processing}>
                                        {processing && (
                                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        {editingUnit
                                            ? t('Update')
                                            : t('Create')}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('Search by name or abbreviation...')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('All Units')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('Name')}</TableHead>
                                    <TableHead>{t('Abbreviation')}</TableHead>
                                    <TableHead>{t('Variants')}</TableHead>
                                    <TableHead className="text-right">
                                        {t('Actions')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUnits.map((unit) => (
                                    <TableRow key={unit.id}>
                                        <TableCell className="font-medium">
                                            {unit.name}
                                        </TableCell>
                                        <TableCell>
                                            {unit.abbreviation}
                                        </TableCell>
                                        <TableCell>
                                            {unit.product_variants_count ?? 0}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        openEdit(unit)
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
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
                                                                    unit,
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
                                                                    'Delete Unit',
                                                                )}
                                                            </DialogTitle>
                                                            <DialogDescription>
                                                                {t(
                                                                    'Are you sure you want to delete this',
                                                                )}{' '}
                                                                "
                                                                {
                                                                    deleteTarget?.name
                                                                }
                                                                "?
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
                                {filteredUnits.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            {t('No units found.')}
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

UnitsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Units', href: units() },
    ],
};
