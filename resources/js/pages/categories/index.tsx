import { Head, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import {
    Plus,
    Pencil,
    Trash2,
    EyeOff,
    Eye,
    LoaderCircle,
    Search,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
    categories,
    categoriesStore,
    categoriesUpdate,
    categoriesDestroy,
    categoriesToggleActive,
    dashboard,
} from '@/feature-routes';
import { useTranslation } from '@/lib/i18n';
import type { Category, CategoryForm } from '@/types';

type Props = {
    categories: Category[];
};

export default function CategoriesIndex({ categories: categoriesData }: Props) {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null,
    );
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const filteredCategories = useMemo(() => {
        let result = categoriesData;

        if (statusFilter && statusFilter !== 'all') {
            const isActive = statusFilter === 'active';
            result = result.filter((c) => c.is_active === isActive);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    (c.description && c.description.toLowerCase().includes(q)),
            );
        }

        return result;
    }, [categoriesData, search, statusFilter]);

    const {
        data,
        setData,
        post,
        patch,
        delete: destroy,
        processing,
        reset,
        errors: formErrors,
    } = useForm<CategoryForm>({
        name: '',
        description: '',
        image: null,
        is_active: true,
    });

    const openCreate = () => {
        reset();
        setEditingCategory(null);
        setDialogOpen(true);
    };

    const openEdit = (category: Category) => {
        setEditingCategory(category);
        setData({
            name: category.name,
            description: category.description ?? '',
            image: category.image,
            is_active: category.is_active,
        });
        setDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingCategory) {
            patch(categoriesUpdate({ id: editingCategory.id }).url, {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingCategory(null);
                    setDialogOpen(false);
                    reset();
                },
            });
        } else {
            post(categoriesStore().url, {
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

        destroy(categoriesDestroy({ id: deleteTarget.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteTarget(null);
                setDeleteDialogOpen(false);
            },
        });
    };

    const handleToggleActive = (category: Category) => {
        router.patch(
            categoriesToggleActive({ id: category.id }).url,
            {},
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title={t('Categories')} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">{t('Categories')}</h1>
                    <Dialog
                        open={dialogOpen}
                        onOpenChange={(open) => {
                            setDialogOpen(open);

                            if (!open) {
                                setEditingCategory(null);
                                reset();
                            }
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" />{' '}
                                {t('Add Category')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingCategory
                                        ? t('Edit Category')
                                        : t('Create Category')}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingCategory
                                        ? t('Update the category details.')
                                        : t('Add a new product category.')}
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
                                    {formErrors.name && (
                                        <p className="text-sm text-destructive">
                                            {formErrors.name}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        {t('Description')}
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="image">{t('Image')}</Label>
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];

                                            if (file) {
                                                setData('image', file);
                                            }
                                        }}
                                    />
                                    {editingCategory &&
                                        data.image &&
                                        typeof data.image === 'string' && (
                                            <img
                                                src={
                                                    (
                                                        editingCategory as Category
                                                    ).image_url ?? ''
                                                }
                                                alt="Preview"
                                                className="mt-1 h-20 w-20 rounded object-cover"
                                            />
                                        )}
                                    {formErrors.image && (
                                        <p className="text-sm text-destructive">
                                            {formErrors.image}
                                        </p>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={processing}>
                                        {processing && (
                                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        {editingCategory
                                            ? t('Update')
                                            : t('Create')}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="w-full lg:w-35">
                            <SelectValue placeholder={t('All Status')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {t('All Status')}
                            </SelectItem>
                            <SelectItem value="active">
                                {t('Active')}
                            </SelectItem>
                            <SelectItem value="inactive">
                                {t('Inactive')}
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Input
                        placeholder={t('Search by name or description...')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('All Categories')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('Image')}</TableHead>
                                    <TableHead>{t('Name')}</TableHead>
                                    <TableHead>{t('Description')}</TableHead>
                                    <TableHead>{t('Products')}</TableHead>
                                    <TableHead>{t('Status')}</TableHead>
                                    <TableHead className="text-right">
                                        {t('Actions')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCategories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            {category.image_url ? (
                                                <img
                                                    src={category.image_url}
                                                    alt={category.name}
                                                    className="h-10 w-10 rounded object-cover"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded bg-muted" />
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {category.name}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {category.description || '—'}
                                        </TableCell>
                                        <TableCell>
                                            {category.products_count ?? 0}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    category.is_active
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {category.is_active
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
                                                            category,
                                                        )
                                                    }
                                                >
                                                    {category.is_active ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        openEdit(category)
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
                                                                    category,
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
                                                                    'Delete Category',
                                                                )}
                                                            </DialogTitle>
                                                            <DialogDescription>
                                                                {t(
                                                                    'Are you sure you want to delete',
                                                                )}
                                                                "
                                                                {
                                                                    deleteTarget?.name
                                                                }
                                                                "?{' '}
                                                                {t(
                                                                    '? This action cannot be undone.',
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
                                {filteredCategories.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            {t('No categories found.')}
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

CategoriesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Categories', href: categories() },
    ],
};
