import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, LoaderCircle } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { units, unitsStore, unitsUpdate, unitsDestroy, dashboard } from '@/feature-routes';
import type { Unit, UnitForm } from '@/types';

type Props = {
    units: { data: Unit[] };
};

export default function UnitsIndex({ units: unitsData }: Props) {
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null);

    const { data, setData, post, patch, delete: destroy, processing, reset, errors } = useForm<UnitForm>({
        name: '',
        abbreviation: '',
    });

    const openCreate = () => {
        reset();
        setEditingUnit(null);
    };

    const openEdit = (unit: Unit) => {
        setEditingUnit(unit);
        setData({ name: unit.name, abbreviation: unit.abbreviation });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUnit) {
            patch(unitsUpdate({ id: editingUnit.id }).url, {
                preserveScroll: true,
                onSuccess: () => {
 setEditingUnit(null); reset(); 
},
            });
        } else {
            post(unitsStore().url, {
                preserveScroll: true,
                onSuccess: () => reset(),
            });
        }
    };

    const handleDelete = () => {
        if (!deleteTarget) {
return;
}

        destroy(unitsDestroy({ id: deleteTarget.id }).url, {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    };

    return (
        <>
            <Head title="Units" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Units</h1>
                    <Dialog onOpenChange={(open) => {
 if (!open) {
 setEditingUnit(null); reset(); 
} 
}}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" /> Add Unit
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingUnit ? 'Edit Unit' : 'Create Unit'}</DialogTitle>
                                <DialogDescription>
                                    {editingUnit ? 'Update the unit details.' : 'Add a new measurement unit.'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="abbreviation">Abbreviation</Label>
                                    <Input id="abbreviation" value={data.abbreviation} onChange={(e) => setData('abbreviation', e.target.value)} />
                                    {errors.abbreviation && <p className="text-sm text-destructive">{errors.abbreviation}</p>}
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={processing}>
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        {editingUnit ? 'Update' : 'Create'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Units</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Abbreviation</TableHead>
                                    <TableHead>Variants</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {unitsData.data.map((unit) => (
                                    <TableRow key={unit.id}>
                                        <TableCell className="font-medium">{unit.name}</TableCell>
                                        <TableCell>{unit.abbreviation}</TableCell>
                                        <TableCell>{unit.product_variants_count ?? 0}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => openEdit(unit)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                </Dialog>
                                                <Dialog onOpenChange={(open) => {
 if (!open) {
setDeleteTarget(null);
} 
}}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(unit)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Delete Unit</DialogTitle>
                                                            <DialogDescription>
                                                                Are you sure you want to delete "{deleteTarget?.name}"?
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                                                            <Button variant="destructive" onClick={handleDelete} disabled={processing}>
                                                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                                                Delete
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
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
