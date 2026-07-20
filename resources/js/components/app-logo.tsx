import { useTranslation } from '@/lib/i18n';

export default function AppLogo() {
    const { t } = useTranslation();

    return (
        <>
            <div className="ml-1 grid flex-1 text-lg">
                <span className="mb-0.5 leading-tight font-semibold">
                    {t('Shop')}
                </span>
            </div>
        </>
    );
}
