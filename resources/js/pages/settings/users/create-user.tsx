import { Head, Link } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/feature-routes';
import { useTranslation } from '@/lib/i18n';

type UserForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: string;
};

export default function CreateUser() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm<UserForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'cashier',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings/users', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={t('Create User')} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{t('Create User')}</h1>
                    <Link href="/settings/users">
                        <Button variant="outline">
                            {t('Back to Users')}
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('User Details')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                                    <Label htmlFor="email">{t('Email')}</Label>
                                    <Input
                                        id="email"
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
                                    <Label htmlFor="password">
                                        {t('Password')}
                                    </Label>
                                    <Input
                                        id="password"
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
                                    <Label htmlFor="password_confirmation">
                                        {t('Confirm Password')}
                                    </Label>
                                    <Input
                                        id="password_confirmation"
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
                                    <Label htmlFor="role">{t('Role')}</Label>
                                    <Select
                                        value={data.role}
                                        onValueChange={(v) =>
                                            setData('role', v)
                                        }
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
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-4 flex justify-end gap-2">
                        <Link href="/settings/users">
                            <Button type="button" variant="outline">
                                {t('Cancel')}
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing && (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {t('Create User')}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

CreateUser.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Users', href: '/settings/users' },
        { title: 'Create', href: '/settings/users/create' },
    ],
};
