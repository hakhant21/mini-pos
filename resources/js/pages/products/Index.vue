<script setup lang="ts">
import { computed, ref } from "vue";
import { Head, Link, router, usePage } from "@inertiajs/vue3";
import { ChevronDown, Download, Plus, Search, SlidersHorizontal } from "@lucide/vue";
import { create, edit, index as productsRoute, show } from "@/routes/products";
import { useI18n } from "vue-i18n";

type Product = {
    id: number;
    name: string;
    sku: string;
    category?: { name: string } | null;
    base_unit?: string | null;
    reorder_level?: number;
    units: { id: number; name: string; selling_price: number }[];
    stock: { quantity_base: number } | null;
    color?: string;
    icon?: string;
    image_url?: string | null;
};
type PaginationLink = { url: string | null; label: string; active: boolean };

const props = defineProps<{ products: { data: Product[]; links?: PaginationLink[] } }>();
const page = usePage();
const { t } = useI18n();
const query = ref("");
const lowStockOnly = ref(false);
const showFilters = ref(false);
const canManageProducts =
    (page.props.auth as { user?: { role?: string } }).user?.role !== "cashier";
const money = (value: number) =>
    `${new Intl.NumberFormat("en-US").format(value)} ${t("common.currency")}`;
const visibleProducts = computed(() =>
    props.products.data
        .filter((product) => {
            const matchesQuery = `${product.name} ${product.sku}`
                .toLowerCase()
                .includes(query.value.toLowerCase());
            const matchesStock =
                !lowStockOnly.value ||
                (product.stock?.quantity_base ?? 0) <= (product.reorder_level ?? 0);

            return matchesQuery && matchesStock;
        })
        .map((product) => ({ ...product, base_unit: String(product.base_unit ?? "unit") })),
);

function openProduct(productId: number, event: MouseEvent): void {
    if ((event.target as HTMLElement).closest("a, button, input, select")) {
        return;
    }

    router.visit(show(productId).url);
}

function openProductWithKeyboard(productId: number, event: KeyboardEvent): void {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        router.visit(show(productId).url);
    }
}

function exportProducts(): void {
    const rows = [
        [t("products.name"), t("products.sku"), t("products.stock")],
        ...visibleProducts.value.map((product) => [
            product.name,
            product.sku,
            String(product.stock?.quantity_base ?? 0),
        ]),
    ];
    const csv = rows
        .map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(","))
        .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "products.csv";
    link.click();
    URL.revokeObjectURL(link.href);
}

defineOptions({
    layout: { breadcrumbs: [{ title: "navigation.products", href: productsRoute() }] },
});
</script>

<template>
    <Head :title="t('navigation.products')" />
    <div
        class="min-h-screen bg-[#f5f7fb] px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8"
    >
        <div class="mx-auto max-w-[1500px] space-y-6">
            <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p class="text-sm font-medium text-slate-400">
                        {{ $t("products.catalog_inventory") }}
                    </p>
                    <h1 class="mt-1 text-2xl font-bold">{{ $t("navigation.products") }}</h1>
                </div>
                <Link
                    v-if="canManageProducts"
                    :href="create()"
                    class="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20"
                    ><Plus class="size-4" /> {{ $t("products.add_product") }}</Link
                >
            </header>
            <section
                class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
                <div
                    class="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 sm:flex-row"
                >
                    <label
                        class="flex flex-1 items-center gap-2 rounded-xl bg-slate-50 px-3 text-sm text-slate-400 dark:bg-slate-800"
                        ><Search class="size-4" /><input
                            v-model="query"
                            class="w-full border-0 bg-transparent py-2 outline-none placeholder:text-slate-400"
                            :placeholder="$t('products.search_placeholder')"
                    /></label>
                    <button
                        type="button"
                        @click="showFilters = !showFilters"
                        :class="
                            showFilters
                                ? 'border-blue-300 bg-blue-50 text-blue-600 dark:bg-blue-950/40'
                                : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                        "
                        class="flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium"
                    >
                        <SlidersHorizontal class="size-4" /> {{ $t("products.filters") }}
                        <ChevronDown class="size-3.5" />
                    </button>
                    <button
                        type="button"
                        @click="exportProducts"
                        class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300"
                    >
                        <Download class="size-4" /> {{ $t("products.export") }}
                    </button>
                </div>
                <div
                    v-if="showFilters"
                    class="border-b border-slate-100 px-4 py-3 dark:border-slate-800"
                >
                    <button
                        type="button"
                        @click="lowStockOnly = !lowStockOnly"
                        :class="
                            lowStockOnly
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        "
                        class="rounded-lg px-3 py-2 text-xs font-semibold"
                    >
                        {{ $t("products.low_stock_only") }}
                    </button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full min-w-[850px] text-left text-sm">
                        <thead
                            class="bg-slate-50 text-xs tracking-wide text-slate-400 uppercase dark:bg-slate-800"
                        >
                            <tr>
                                <th class="px-5 py-3 font-medium">{{ $t("products.name") }}</th>
                                <th class="py-3 font-medium">{{ $t("products.category") }}</th>
                                <th class="py-3 font-medium">{{ $t("products.selling_units") }}</th>
                                <th class="py-3 font-medium">{{ $t("products.price") }}</th>
                                <th class="py-3 font-medium">{{ $t("products.current_stock") }}</th>
                                <th class="py-3 font-medium">{{ $t("products.status") }}</th>
                                <th class="py-3" />
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                            <tr
                                v-for="product in visibleProducts"
                                :key="product.id"
                                tabindex="0"
                                class="cursor-pointer hover:bg-slate-50/70 focus:bg-slate-50/70 focus:outline-none dark:hover:bg-slate-800/60 dark:focus:bg-slate-800/60"
                                @click="openProduct(product.id, $event)"
                                @keydown="openProductWithKeyboard(product.id, $event)"
                            >
                                <td class="px-5 py-4">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-xl dark:bg-blue-950/50"
                                        >
                                            <img v-if="product.image_url" :src="product.image_url" :alt="product.name" class="size-full rounded-xl object-cover" />
                                            <span v-else>{{ product.icon ?? "📦" }}</span>
                                        </div>
                                        <div>
                                            <p class="font-semibold">{{ product.name }}</p>
                                            <p class="mt-0.5 text-xs text-slate-400">
                                                {{ product.sku }}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td class="text-slate-500">
                                    {{ product.category?.name ?? $t("products.uncategorized") }}
                                </td>
                                <td>
                                    <div class="flex flex-wrap gap-1">
                                        <span
                                            v-for="unit in product.units"
                                            :key="unit.id"
                                            class="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                            >{{ unit.name }}</span
                                        >
                                    </div>
                                </td>
                                <td class="font-semibold">
                                    {{ money(product.units[0]?.selling_price ?? 0) }}
                                </td>
                                <td>
                                    <span
                                        :class="
                                            (product.stock?.quantity_base ?? 0) <=
                                            (product.reorder_level ?? 0)
                                                ? 'text-amber-600'
                                                : 'text-slate-700 dark:text-slate-200'
                                        "
                                        class="font-semibold"
                                        >{{ product.stock?.quantity_base ?? 0 }}
                                        {{ product.base_unit.toLowerCase() }}s</span
                                    >
                                </td>
                                <td>
                                    <span
                                        class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300"
                                        >{{ $t("products.active") }}</span
                                    >
                                </td>
                                <td>
                                    <div class="flex items-center gap-1">
                                        <Link
                                            :href="show(product.id)"
                                            class="rounded-lg px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                                            >{{ $t("common.view") }}</Link
                                        ><Link
                                            v-if="canManageProducts"
                                            :href="edit(product.id)"
                                            class="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                            >{{ $t("common.edit") }}</Link
                                        >
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="visibleProducts.length === 0">
                                <td
                                    colspan="7"
                                    class="px-5 py-10 text-center text-sm text-slate-400"
                                >
                                    {{ $t("products.no_products") }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div
                    class="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs text-slate-400 dark:border-slate-800"
                >
                        <span>{{ $t("products.products_on_page", { count: props.products.data.length }) }}</span>
                    <div class="flex gap-1">
                        <Link
                            v-for="link in props.products.links"
                            :key="link.label"
                            :href="link.url ?? productsRoute()"
                            :class="
                                link.active
                                    ? 'bg-blue-600 font-semibold text-white'
                                    : 'border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                            "
                            class="rounded-lg px-3 py-1.5"
                            v-html="link.label"
                        />
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>
