import { Languages } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useTranslation, setLocale } from '@/lib/i18n';

const locales = {
    my: 'မြန်မာ',
    en: 'English',
} as const;

export function LocaleSwitcher() {
    const { locale } = useTranslation();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100">
                            <Languages className="h-5 w-5" />
                            <span>{locales[locale as keyof typeof locales] ?? 'English'}</span>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        side="top"
                        className="min-w-32"
                        align="start"
                    >
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
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
