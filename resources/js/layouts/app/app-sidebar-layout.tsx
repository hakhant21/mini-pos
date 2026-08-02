import { AppContent } from '@/components/app-content';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <AppContent variant="sidebar" className="overflow-x-hidden">
                    {children}
                </AppContent>
            </SidebarInset>
        </SidebarProvider>
    );
}
