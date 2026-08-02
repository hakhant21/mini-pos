import { useTranslation } from '@/lib/i18n';
import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { t } = useTranslation();
    const { props } = usePage();

    const name = t(props.name);

    return (
        <>
            <div className="ml-1 grid flex-1 text-sm">
                <span className="mb-0.5 leading-tight font-semibold">
                    {name}
                </span>
            </div>
        </>
    );
}
