import type { ReactNode } from 'react';
import type { AppVariant } from '@/types';

type Props = {
    children: ReactNode;
    variant?: AppVariant;
};

export function AppShell({ children, variant = 'header' }: Props) {
    return (
        <div className="flex min-h-screen w-full flex-col">{children}</div>
    );
}
