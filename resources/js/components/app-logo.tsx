import { useTranslation } from '@/lib/i18n';
import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { t } = useTranslation();
    const { props } = usePage();

    const name = t(props.name);

    return (
        <>
            <div className="flex w-full items-center justify-center gap-2">
                <h1 className="text-2xl font-bold whitespace-nowrap">
                    {t(name)}
                </h1>
            </div>
        </>
    );
}
