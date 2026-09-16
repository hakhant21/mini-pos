<script setup lang="ts">
import { computed } from "vue";
import { Head, Link, useForm, usePage } from "@inertiajs/vue3";
import { ArrowLeft, Pencil } from "@lucide/vue";
import { useI18n } from "vue-i18n";
import { edit, index as productsIndex, update } from "@/routes/products";

type Unit = {
    id: number;
    name: string;
    conversion: number;
    purchase_price: number;
    selling_price: number;
    package_price: number;
    single_unit_price: number;
    package_quantity: number;
    loose_quantity: number;
    quantity_base: number;
    barcode?: string | null;
};
type Product = {
    id: number;
    category_id: number;
    name: string;
    sku: string;
    price_mode: string;
    base_unit: string;
    reorder_level: number;
    active: boolean;
    barcode?: string | null;
    category: { name: string };
    units: Unit[];
};

const props = defineProps<{ product: Product }>();
const { t } = useI18n();
const localizedUnit = (unit: string): string =>
    t(`products.unit_names.${unit}`);
const page = usePage();
const canManageProducts =
    (page.props.auth as { user?: { role?: string } }).user?.role !== "cashier";
const money = (value: number): string =>
    `${new Intl.NumberFormat("en-US").format(value)} ${t("common.currency")}`;
const inputClass =
    "mt-1 block min-h-11 w-full rounded-xl border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white";
const form = useForm({
    category_id: props.product.category_id,
    name: props.product.name,
    sku: props.product.sku,
    price_mode: props.product.price_mode,
    base_unit: props.product.base_unit,
    reorder_level: props.product.reorder_level,
    active: props.product.active,
    barcode: props.product.barcode ?? "",
    units: props.product.units.map((unit) => ({ ...unit })),
});
const visibleUnits = computed(() => form.units);

const stockPackageLabel = (unit: Unit): string => {
    const label =
        unit.name.match(/(single|package|carton)$/i)?.[1] ?? unit.name;

    return localizedUnit(
        label.charAt(0).toUpperCase() + label.slice(1).toLowerCase(),
    );
};

function submit(): void {
    form.transform((data) => ({ ...data, _method: "put" })).post(
        update(props.product.id).url,
    );
}
</script>

<template>
    <Head :title="props.product.name" />
    <div
        class="min-h-screen bg-[#f5f7fb] px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6"
    >
        <div class="mx-auto max-w-7xl space-y-6">
            <div class="flex items-center justify-between">
                <Link
                    :href="productsIndex()"
                    class="flex items-center gap-2 text-sm font-medium text-slate-500"
                    ><ArrowLeft class="size-4" />
                    {{ t("products.back_to_products") }}</Link
                >
                <Link
                    v-if="canManageProducts"
                    :href="edit(props.product.id)"
                    class="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                    ><Pencil class="size-4" /> {{ t("common.edit") }}</Link
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
                <div class="mt-6">
                    <p class="text-xs text-slate-400">
                        {{ t("products.base_unit") }}
                    </p>
                    <p class="mt-1 font-semibold">
                        {{ localizedUnit(props.product.base_unit) }}
                    </p>
                </div>
                <h2 class="mt-8 font-bold">
                    {{ t("products.selling_units") }}
                </h2>
                <form
                    v-if="canManageProducts"
                    class="mt-3 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800"
                    @submit.prevent="submit"
                >
                    <div class="overflow-x-auto">
                        <table class="min-w-[80rem] w-full text-left text-sm">
                            <thead
                                class="border-b border-slate-100 bg-slate-50 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300"
                            >
                                <tr>
                                    <th class="px-4 py-3">
                                        {{ t("products.unit") }}
                                    </th>
                                    <th class="px-4 py-3">
                                        {{ t("products.purchase_price") }}
                                    </th>
                                    <th
                                        v-if="
                                            props.product.price_mode !==
                                            'standard'
                                        "
                                        class="px-4 py-3"
                                    >
                                        {{ t("products.selling_price") }}
                                    </th>
                                    <th
                                        v-if="
                                            props.product.price_mode ===
                                            'single_package_carton'
                                        "
                                        class="px-4 py-3"
                                    >
                                        {{ t("products.package_price") }}
                                    </th>
                                    <th
                                        v-if="
                                            props.product.price_mode !==
                                            'standard'
                                        "
                                        class="px-4 py-3"
                                    >
                                        {{ t("products.single_unit_price") }}
                                    </th>
                                    <th class="px-4 py-3">
                                        {{ t("products.packages") }}
                                    </th>
                                    <th class="px-4 py-3">
                                        {{
                                            t("products.loose_units", {
                                                unit: localizedUnit(
                                                    props.product.base_unit,
                                                ),
                                            })
                                        }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody
                                class="divide-y divide-slate-100 dark:divide-slate-800"
                            >
                                <tr
                                    v-for="(unit, index) in visibleUnits"
                                    :key="unit.id"
                                >
                                    <td class="px-4 py-3 font-semibold">
                                        {{ unit.name }}
                                        <span
                                            class="mt-1 block text-xs font-normal text-slate-500"
                                        >
                                            {{ unit.package_quantity }}
                                            {{ stockPackageLabel(unit) }} /
                                            {{ unit.loose_quantity }}
                                            {{
                                                localizedUnit(
                                                    props.product.base_unit,
                                                )
                                            }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <input
                                            v-model.number="unit.purchase_price"
                                            :class="inputClass"
                                            type="number"
                                            min="0"
                                            required
                                        />
                                        <p
                                            v-if="
                                                form.errors[
                                                    `units.${index}.purchase_price`
                                                ]
                                            "
                                            class="mt-1 text-xs text-rose-600"
                                        >
                                            {{
                                                form.errors[
                                                    `units.${index}.purchase_price`
                                                ]
                                            }}
                                        </p>
                                    </td>
                                    <td
                                        v-if="
                                            props.product.price_mode !==
                                            'standard'
                                        "
                                        class="px-4 py-3"
                                    >
                                        <input
                                            v-model.number="unit.selling_price"
                                            :class="inputClass"
                                            type="number"
                                            min="0"
                                            required
                                        />
                                    </td>
                                    <td
                                        v-if="
                                            props.product.price_mode ===
                                            'single_package_carton'
                                        "
                                        class="px-4 py-3"
                                    >
                                        <input
                                            v-model.number="unit.package_price"
                                            :class="inputClass"
                                            type="number"
                                            min="0"
                                            required
                                        />
                                    </td>
                                    <td
                                        v-if="
                                            props.product.price_mode !==
                                            'standard'
                                        "
                                        class="px-4 py-3"
                                    >
                                        <input
                                            v-model.number="
                                                unit.single_unit_price
                                            "
                                            :class="inputClass"
                                            type="number"
                                            min="0"
                                            required
                                        />
                                    </td>
                                    <td class="px-4 py-3">
                                        <input
                                            v-model.number="
                                                unit.package_quantity
                                            "
                                            :class="inputClass"
                                            type="number"
                                            min="0"
                                            required
                                        />
                                    </td>
                                    <td class="px-4 py-3">
                                        <input
                                            v-model.number="unit.loose_quantity"
                                            :class="inputClass"
                                            type="number"
                                            min="0"
                                            required
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div
                        class="flex justify-end gap-3 border-t border-slate-100 p-4 dark:border-slate-800"
                    >
                        <button
                            type="button"
                            class="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500"
                            @click="form.reset()"
                        >
                            {{ t("common.cancel") }}</button
                        ><button
                            type="submit"
                            :disabled="form.processing"
                            class="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {{ t("common.save_changes") }}
                        </button>
                    </div>
                </form>
                <div v-else class="mt-3 overflow-x-auto">
                    <div class="min-w-[76rem] text-left">
                        <div
                            :class="[
                                'grid gap-4 border-b border-slate-100 pb-2 text-xs text-slate-400',
                                props.product.price_mode ===
                                'single_package_carton'
                                    ? 'grid-cols-5'
                                    : props.product.price_mode ===
                                        'single_package'
                                      ? 'grid-cols-4'
                                      : 'grid-cols-2',
                            ]"
                        >
                            <span>{{ t("products.unit") }}</span
                            ><span>{{ t("products.purchase_price") }}</span
                            ><span
                                v-if="props.product.price_mode !== 'standard'"
                                >{{ t("products.selling_price") }}</span
                            ><span
                                v-if="
                                    props.product.price_mode ===
                                    'single_package_carton'
                                "
                                >{{ t("products.package_price") }}</span
                            ><span
                                v-if="props.product.price_mode !== 'standard'"
                                >{{ t("products.single_unit_price") }}</span
                            >
                        </div>
                        <div
                            v-for="unit in visibleUnits"
                            :key="unit.id"
                            :class="[
                                'grid gap-4 border-b border-slate-100 py-3 text-sm',
                                props.product.price_mode ===
                                'single_package_carton'
                                    ? 'grid-cols-5'
                                    : props.product.price_mode ===
                                        'single_package'
                                      ? 'grid-cols-4'
                                      : 'grid-cols-2',
                            ]"
                        >
                            <span>
                                {{ unit.name }}
                                <small
                                    class="mt-1 block text-xs text-slate-500"
                                >
                                    {{ unit.package_quantity }}
                                    {{ stockPackageLabel(unit) }} /
                                    {{ unit.loose_quantity }}
                                    {{ localizedUnit(props.product.base_unit) }}
                                </small> </span
                            ><strong>{{ money(unit.purchase_price) }}</strong
                            ><strong
                                v-if="props.product.price_mode !== 'standard'"
                                >{{ money(unit.selling_price) }}</strong
                            ><strong
                                v-if="
                                    props.product.price_mode ===
                                    'single_package_carton'
                                "
                                >{{ money(unit.package_price) }}</strong
                            ><strong
                                v-if="props.product.price_mode !== 'standard'"
                                >{{ money(unit.single_unit_price) }}</strong
                            >
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>
