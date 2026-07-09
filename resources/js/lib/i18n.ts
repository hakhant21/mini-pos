import { usePage } from '@inertiajs/react';
import { useCallback } from 'react';

type TranslationMap = Record<string, string>;

export function tn(key: string, translations?: TranslationMap, replace?: Record<string, string | number>): string {
    let message = translations?.[key] ?? key;

    if (replace) {
        Object.entries(replace).forEach(([k, v]) => {
            message = message.replace(`:${k}`, String(v));
        });
    }

    return message;
}

export function useTranslation() {
    const { translations, locale } = usePage<{
        translations: TranslationMap;
        locale: string;
    }>().props;

    const t = useCallback(
        (key: string, replace?: Record<string, string | number>): string => {
            return tn(key, translations, replace);
        },
        [translations],
    );

    return { t, locale };
}

export function setLocale(locale: string): void {
    document.cookie = `locale=${locale};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`;
    window.location.reload();
}
