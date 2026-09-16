<script setup lang="ts">
import { Link, usePage } from "@inertiajs/vue3";
import {
    BarChart3,
    FolderTree,
    LayoutGrid,
    PackagePlus,
    ReceiptText,
    Settings2,
    ShoppingCart,
    Store,
    Truck,
} from "@lucide/vue";
import AppLogo from "@/components/AppLogo.vue";
import NavFooter from "@/components/NavFooter.vue";
import NavMain from "@/components/NavMain.vue";
import NavUser from "@/components/NavUser.vue";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { dashboard } from "@/routes";
import { index as checkoutIndex } from "@/routes/checkout";
import { index as categoryIndex } from "@/routes/categories";
import { index as productIndex } from "@/routes/products";
import { index as purchaseIndex } from "@/routes/purchases";
import { index as reportIndex } from "@/routes/reports";
import { index as saleIndex } from "@/routes/sales";
import { index as supplierIndex } from "@/routes/suppliers";
import type { NavItem } from "@/types";

const page = usePage();

const allNavItems: NavItem[] = [
    { title: "navigation.dashboard", href: dashboard(), icon: LayoutGrid },
    { title: "navigation.checkout", href: checkoutIndex(), icon: ShoppingCart },
    { title: "navigation.categories", href: categoryIndex(), icon: FolderTree },
    { title: "navigation.products", href: productIndex(), icon: Store },
    { title: "navigation.purchases", href: purchaseIndex(), icon: PackagePlus },
    { title: "navigation.suppliers", href: supplierIndex(), icon: Truck },
    { title: "navigation.sales", href: saleIndex(), icon: ReceiptText },
    { title: "navigation.reports", href: reportIndex(), icon: BarChart3 },
];

const mainNavItems = allNavItems.filter((item) => {
    const role = (page.props.auth as { user?: { role?: string } }).user?.role;

    return (
        role !== "cashier" ||
        ["navigation.dashboard", "navigation.checkout", "navigation.products", "navigation.sales"].includes(
            item.title,
        )
    );
});

const footerNavItems: NavItem[] = [];
</script>

<template>
    <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" as-child>
                        <Link :href="dashboard()">
                            <AppLogo />
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
            <NavMain :items="mainNavItems" />
        </SidebarContent>

        <SidebarFooter>
            <NavFooter :items="footerNavItems" />
            <NavUser />
        </SidebarFooter>
    </Sidebar>
    <slot />
</template>
