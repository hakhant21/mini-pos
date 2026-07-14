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
import { dashboard } from '@/feature-routes';
import { useTranslation } from '@/lib/i18n';
import type { User } from '@/types';

type Props = {
    users: User[];
};

type UserForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: string;
};

export default function UsersIndex({ users: usersData }: Props) {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const filteredUsers = useMemo(() => {
        if (!search.trim()) {
            return usersData;
        }

        const q = search.toLowerCase();

        return usersData.filter(
            (u) =>
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                u.role.toLowerCase().includes(q),
        );
    }, [usersData, search]);

    const {
        data,
        setData,
        patch,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm<UserForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'cashier',
    });

    const openEdit = (user: User) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            role: user.role,
        });
        setDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUser) {
            patch(`/settings/users/${editingUser.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingUser(null);
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

        destroy(`/settings/users/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteTarget(null);
                setDeleteDialogOpen(false);
            },
        });
    };

    return (
        <>
            <Head title={t('Users')} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{t('Users')}</h1>
                    <a href="/settings/users/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> {t('Add User')}
                        </Button>
                    </a>
                </div>

                <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('Search by name, email, or role...')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('All Users')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('Name')}</TableHead>
                                    <TableHead>{t('Email')}</TableHead>
                                    <TableHead>{t('Role')}</TableHead>
                                    <TableHead className="text-right">
                                        {t('Actions')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.name}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                    user.role === 'admin'
                                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400'
                                                        : 'bg-gray-50 text-gray-700 dark:bg-gray-400/10 dark:text-gray-400'
                                                }`}
                                            >
                                                {user.role === 'admin'
                                                    ? t('Admin')
                                                    : t('Cashier')}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        openEdit(user)
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
                                                                    user,
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
                                                                    'Delete User',
                                                                )}
                                                            </DialogTitle>
                                                            <DialogDescription>
                                                                {t(
                                                                    'Are you sure you want to delete',
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
                                {filteredUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            {t('No users found.')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);

                    if (!open) {
                        setEditingUser(null);
                        reset();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Edit User')}</DialogTitle>
                        <DialogDescription>
                            {t('Update the user details.')}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">{t('Name')}</Label>
                            <Input
                                id="edit-name"
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
                            <Label htmlFor="edit-email">{t('Email')}</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">
                                    {errors.email}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-password">
                                {t('Password')} (
                                {t('leave blank to keep current')})
                            </Label>
                            <Input
                                id="edit-password"
                                type="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                            />
                            {errors.password && (
                                <p className="text-sm text-destructive">
                                    {errors.password}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-password-confirmation">
                                {t('Confirm Password')}
                            </Label>
                            <Input
                                id="edit-password-confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-role">{t('Role')}</Label>
                            <Select
                                value={data.role}
                                onValueChange={(v) => setData('role', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={t('Select role')}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">
                                        {t('Admin')}
                                    </SelectItem>
                                    <SelectItem value="cashier">
                                        {t('Cashier')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-sm text-destructive">
                                    {errors.role}
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={processing}>
                                {processing && (
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {t('Update')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Users', href: '/settings/users' },
    ],
};
