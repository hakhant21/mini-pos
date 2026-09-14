<script setup lang="ts">
import { Link, usePage } from "@inertiajs/vue3";
import {
    BarChart3,
    Boxes,
    ClipboardList,
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
import { index as adjustmentIndex } from "@/routes/adjustments";
import { index as inventoryIndex } from "@/routes/inventory";
import { index as productIndex } from "@/routes/products";
import { index as purchaseIndex } from "@/routes/purchases";
import { index as reportIndex } from "@/routes/reports";
import { index as saleIndex } from "@/routes/sales";
import { index as supplierIndex } from "@/routes/suppliers";
import type { NavItem } from "@/types";

const page = usePage();

const allNavItems: NavItem[] = [
    { title: "Dashboard", href: dashboard(), icon: LayoutGrid },
    { title: "Checkout", href: checkoutIndex(), icon: ShoppingCart },
    { title: "Categories", href: categoryIndex(), icon: FolderTree },
    { title: "Products", href: productIndex(), icon: Store },
    { title: "Inventory", href: inventoryIndex(), icon: Boxes },
    { title: "Purchases", href: purchaseIndex(), icon: PackagePlus },
    { title: "Suppliers", href: supplierIndex(), icon: Truck },
    { title: "Sales", href: saleIndex(), icon: ReceiptText },
    {
        title: "Stock Management",
        href: adjustmentIndex(),
        icon: ClipboardList,
    },
    { title: "Reports", href: reportIndex(), icon: BarChart3 },
];

const mainNavItems = allNavItems.filter((item) => {
    const role = (page.props.auth as { user?: { role?: string } }).user?.role;

    return (
        role !== "cashier" ||
        ["Dashboard", "Checkout / New sale", "Products", "Sales"].includes(
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
