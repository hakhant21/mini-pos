<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Head, Link, useForm, usePage } from '@inertiajs/vue3';
import { ArrowLeft, Pencil } from '@lucide/vue';
import { index as productsIndex, edit, quickUpdate } from '@/routes/products';
const props = defineProps<{ product: any }>();
const page = usePage();
const canManageProducts = (page.props.auth as { user?: { role?: string } }).user?.role !== 'cashier';
const showQuickUpdate = ref(false);
const quickUpdateForm = useForm<{ stock_unit_id: number; package_quantity: number; loose_quantity: number; unit_prices: { id: number; selling_price: number }[] }>({ stock_unit_id: 0, package_quantity: 0, loose_quantity: 0, unit_prices: [] });
const selectedStockUnit = computed(() => props.product.units.find((unit: { id: number }) => unit.id === quickUpdateForm.stock_unit_id));

function setStockQuantities(baseQuantity: number): void {
    const conversion = selectedStockUnit.value?.conversion ?? 1;
    quickUpdateForm.package_quantity = Math.floor(baseQuantity / conversion);
    quickUpdateForm.loose_quantity = baseQuantity % conversion;
}

watch(() => quickUpdateForm.loose_quantity, (quantity) => {
    const conversion = selectedStockUnit.value?.conversion ?? 1;
    if (quantity >= conversion) {
        quickUpdateForm.package_quantity += Math.floor(quantity / conversion);
        quickUpdateForm.loose_quantity = quantity % conversion;
    }
});

function openQuickUpdate(): void {
    quickUpdateForm.stock_unit_id = props.product.units.find((unit: { conversion: number }) => unit.conversion > 1)?.id ?? props.product.units[0]?.id ?? 0;
    setStockQuantities(props.product.stock?.quantity_base ?? 0);
    quickUpdateForm.unit_prices = props.product.units.map((unit: { id: number; selling_price: number }) => ({ id: unit.id, selling_price: unit.selling_price }));
    showQuickUpdate.value = true;
}

function changeStockUnit(): void {
    setStockQuantities(props.product.stock?.quantity_base ?? 0);
}

function submitQuickUpdate(): void {
    quickUpdateForm.patch(quickUpdate(props.product.id).url, { onSuccess: () => { showQuickUpdate.value = false; } });
}

function unitName(unitId: number): string {
    return props.product.units.find((unit: { id: number; name: string }) => unit.id === unitId)?.name ?? 'Unit';
}
</script>
<template>
    <Head :title="props.product.name" />
    <div class="min-h-screen bg-[#f5f7fb] px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6">
        <div class="mx-auto max-w-3xl space-y-6">
            <div class="flex items-center justify-between">
                <Link
                    :href="productsIndex()"
                    class="flex items-center gap-2 text-sm font-medium text-slate-500"
                    ><ArrowLeft class="size-4" /> Products</Link
                ><button
                    v-if="canManageProducts"
                    type="button"
                    class="mr-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                    @click="openQuickUpdate"
                >Quick update</button><Link
                    v-if="canManageProducts"
                    :href="edit(props.product.id)"
                    class="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                    ><Pencil class="size-4" /> Edit</Link
                >
            </div>
            <section
                class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
                <p class="text-sm text-slate-400">
                    {{ props.product.category.name }} · {{ props.product.sku }}
                </p>
                <h1 class="mt-2 break-words text-2xl font-bold">
                    {{ props.product.name }}
                </h1>
                <div class="mt-6 grid gap-4 sm:grid-cols-3">
                    <div>
                        <p class="text-xs text-slate-400">Base unit</p>
                        <p class="mt-1 font-semibold">
                            {{ props.product.base_unit }}
                        </p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-400">Current stock</p>
                        <p class="mt-1 font-semibold">{{ props.product.stock?.quantity_base ?? 0 }} {{ props.product.base_unit }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-400">Purchase price</p>
                        <p class="mt-1 font-semibold">
                            {{ props.product.purchase_price }} MMK
                        </p>
                    </div>
                </div>
                <h2 class="mt-8 font-bold">Selling units</h2>
                <div class="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                    <div
                        v-for="unit in props.product.units"
                        :key="unit.id"
                        class="flex justify-between py-3 text-sm"
                    >
                        <span
                            >{{ unit.name }} ({{ unit.conversion }}
                            {{ props.product.base_unit }})</span
                        ><span class="text-slate-500">{{ Math.floor((props.product.stock?.quantity_base ?? 0) / unit.conversion) }} available</span><strong>{{ unit.selling_price }} MMK</strong>
                    </div>
                </div>
            </section>
            <div v-if="showQuickUpdate" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" @click.self="showQuickUpdate = false">
                <section class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
                    <div class="flex items-center justify-between"><h2 class="text-lg font-bold">Quick update</h2><button type="button" class="text-slate-400" @click="showQuickUpdate = false">Close</button></div>
                    <form class="mt-5 space-y-5" @submit.prevent="submitQuickUpdate">
                        <div><label class="block text-sm font-medium">Stock package unit<select v-model.number="quickUpdateForm.stock_unit_id" class="mt-1 w-full rounded-xl border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" @change="changeStockUnit"><option v-for="unit in props.product.units" :key="unit.id" :value="unit.id">{{ unit.name }} ({{ unit.conversion }} {{ props.product.base_unit }}s)</option></select></label><p class="mt-1 text-xs text-slate-400">Enter packages and loose {{ props.product.base_unit.toLowerCase() }}s. Loose quantities are converted automatically.</p></div>
                        <div class="grid grid-cols-2 gap-3"><label class="block text-sm font-medium">Packages<input v-model.number="quickUpdateForm.package_quantity" type="number" min="0" class="mt-1 w-full rounded-xl border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" /></label><label class="block text-sm font-medium">Loose {{ props.product.base_unit }}s<input v-model.number="quickUpdateForm.loose_quantity" type="number" min="0" class="mt-1 w-full rounded-xl border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" /></label></div>
                        <p class="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:bg-slate-800">Total stock: <strong class="text-slate-800 dark:text-slate-100">{{ (quickUpdateForm.package_quantity * (selectedStockUnit?.conversion ?? 1)) + quickUpdateForm.loose_quantity }} {{ props.product.base_unit }}</strong></p>
                        <div><p class="text-sm font-medium">Selling prices</p><div v-for="unit in quickUpdateForm.unit_prices" :key="unit.id" class="mt-2 flex items-center gap-3"><span class="w-28 text-sm text-slate-500">{{ unitName(unit.id) }}</span><input v-model.number="unit.selling_price" type="number" min="0" class="w-full rounded-xl border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" /></div></div>
                        <div class="flex justify-end gap-2"><button type="button" class="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500" @click="showQuickUpdate = false">Cancel</button><button type="submit" :disabled="quickUpdateForm.processing" class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Save changes</button></div>
                    </form>
                </section>
            </div>
        </div>
    </div>
</template>
