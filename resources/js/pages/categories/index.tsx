import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, EyeOff, Eye, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useForm } from '@inertiajs/react';
import type { Category, CategoryForm } from '@/types';
import { categories, categoriesStore, categoriesUpdate, categoriesDestroy, categoriesToggleActive, dashboard } from '@/feature-routes';

type Props = {
    categories: { data: Category[] };
};

export default function CategoriesIndex({ categories: categoriesData }: Props) {
    const { errors } = usePage().props;
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

    const { data, setData, post, patch, delete: destroy, processing, reset, errors: formErrors } = useForm<CategoryForm>({
        name: '',
        description: '',
        image: null,
        is_active: true,
    });

    const openCreate = () => {
        reset();
        setEditingCategory(null);
    };

    const openEdit = (category: Category) => {
        setEditingCategory(category);
        setData({
            name: category.name,
            description: category.description ?? '',
            image: category.image,
            is_active: category.is_active,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            patch(categoriesUpdate({ id: editingCategory.id }).url, {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingCategory(null);
                    reset();
                },
            });
        } else {
            post(categoriesStore().url, {
                preserveScroll: true,
                onSuccess: () => reset(),
            });
        }
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        destroy(categoriesDestroy({ id: deleteTarget.id }).url, {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    };

    const handleToggleActive = (category: Category) => {
        router.patch(categoriesToggleActive({ id: category.id }).url, {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Categories" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Categories</h1>
                    <Dialog onOpenChange={(open) => { if (!open) { setEditingCategory(null); reset(); } }}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" /> Add Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
                                <DialogDescription>
                                    {editingCategory ? 'Update the category details.' : 'Add a new product category.'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="image">Image</Label>
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setData('image', file);
                                        }}
                                    />
                                    {editingCategory && data.image && typeof data.image === 'string' && (
                                        <img src={(editingCategory as Category).image_url ?? ''} alt="Preview" className="mt-1 h-20 w-20 rounded object-cover" />
                                    )}
                                    {formErrors.image && <p className="text-sm text-destructive">{formErrors.image}</p>}
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={processing}>
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        {editingCategory ? 'Update' : 'Create'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Products</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categoriesData.data.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            {category.image_url ? (
                                                <img src={category.image_url} alt={category.name} className="h-10 w-10 rounded object-cover" />
                                            ) : (
                                                <div className="h-10 w-10 rounded bg-muted" />
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{category.description || '—'}</TableCell>
                                        <TableCell>{category.products_count ?? 0}</TableCell>
                                        <TableCell>
                                            <Badge variant={category.is_active ? 'default' : 'secondary'}>
                                                {category.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => handleToggleActive(category)}>
                                                    {category.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => openEdit(category)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                </Dialog>
                                                <Dialog onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(category)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Delete Category</DialogTitle>
                                                            <DialogDescription>
                                                                Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
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

CategoriesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Categories', href: categories() },
    ],
};
