import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Printer as PrinterIcon } from 'lucide-react';
import PrinterController from '@/actions/App/Http/Controllers/Settings/PrinterController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/lib/i18n';
import { edit as editPrinter } from '@/routes/settings/printer';

type PrinterSettings = {
    enabled: boolean;
    name: string;
    address: string;
    phone_one: string | null;
    phone_two: string | null;
    device_name: string | null;
    device_address: string | null;
    copies: number;
    auto_cut: boolean;
};

export default function PrinterSettingsPage({
    printer,
}: {
    printer: PrinterSettings;
}) {
    const { t } = useTranslation();
    const { data, setData, patch, processing, errors } = useForm({
        enabled: printer.enabled,
        name: printer.name ?? '',
        address: printer.address ?? '',
        phone_one: printer.phone_one ?? '',
        phone_two: printer.phone_two ?? '',
        device_name: printer.device_name ?? '',
        device_address: printer.device_address ?? '',
        copies: printer.copies,
        auto_cut: printer.auto_cut,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(PrinterController.update.url, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={t('Printer settings')} />

            <h1 className="sr-only">{t('Printer settings')}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t('Printer')}
                    description={t('Configure receipt printing')}
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PrinterIcon className="h-4 w-4" />
                                {t('Shop Information')}
                            </CardTitle>
                            <CardDescription>
                                {t('Printed at the top of every receipt.')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('Shop Name')}</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder={t('e.g. My Shop')}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">{t('Address')}</Label>
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={(e) =>
                                        setData('address', e.target.value)
                                    }
                                    placeholder={t('e.g. 123 Main Street')}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="phone_one">
                                        {t('Phone 1')}
                                    </Label>
                                    <Input
                                        id="phone_one"
                                        value={data.phone_one}
                                        onChange={(e) =>
                                            setData('phone_one', e.target.value)
                                        }
                                        placeholder={t('e.g. 09 123 456 789')}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone_two">
                                        {t('Phone 2')}
                                    </Label>
                                    <Input
                                        id="phone_two"
                                        value={data.phone_two}
                                        onChange={(e) =>
                                            setData('phone_two', e.target.value)
                                        }
                                        placeholder={t('e.g. 09 987 654 321')}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PrinterIcon className="h-4 w-4" />
                                {t('Receipt Printing')}
                            </CardTitle>
                            <CardDescription>
                                {t(
                                    'Print a receipt automatically after each sale.',
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <p className="text-sm font-medium">
                                        {t('Direct Print')}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {t('Auto print after checkout')}
                                    </p>
                                </div>
                                <Switch
                                    checked={data.enabled}
                                    onCheckedChange={(checked) =>
                                        setData('enabled', checked)
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="device_name">
                                    {t('Printer Name')}
                                </Label>
                                <Input
                                    id="device_name"
                                    value={data.device_name}
                                    onChange={(e) =>
                                        setData('device_name', e.target.value)
                                    }
                                    placeholder={t('e.g. RP58 Bluetooth')}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="device_address">
                                    {t('Printer Address')}
                                </Label>
                                <Input
                                    id="device_address"
                                    value={data.device_address}
                                    onChange={(e) =>
                                        setData(
                                            'device_address',
                                            e.target.value,
                                        )
                                    }
                                    placeholder={t('e.g. 00:11:22:33:44:55')}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="copies">{t('Copies')}</Label>
                                <Input
                                    id="copies"
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={data.copies}
                                    onChange={(e) =>
                                        setData(
                                            'copies',
                                            Number(e.target.value),
                                        )
                                    }
                                    className="w-32"
                                />
                                {errors.copies && (
                                    <p className="text-xs text-destructive">
                                        {errors.copies}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <p className="text-sm font-medium">
                                        {t('Auto Cut')}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {t('Cut the paper after each receipt.')}
                                    </p>
                                </div>
                                <Switch
                                    checked={data.auto_cut}
                                    onCheckedChange={(checked) =>
                                        setData('auto_cut', checked)
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>
                            {processing ? (
                                <>
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                    {t('Saving...')}
                                </>
                            ) : (
                                t('Save')
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

PrinterSettingsPage.layout = {
    breadcrumbs: [
        {
            title: 'Printer settings',
            href: editPrinter(),
        },
    ],
};
