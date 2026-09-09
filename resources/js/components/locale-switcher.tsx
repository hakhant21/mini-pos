import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation, setLocale } from '@/lib/i18n';

const locales = {
    en: 'English',
    my: 'မြန်မာ',
} as const;

export function LocaleSwitcher() {
    const { locale } = useTranslation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <Languages className="mr-1 h-4 w-4" />
                    {locales[locale as keyof typeof locales] ?? 'English'}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-32" align="end">
                {Object.entries(locales).map(([code, label]) => (
                    <DropdownMenuItem
                        key={code}
                        onClick={() => setLocale(code)}
                    >
                        {label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
